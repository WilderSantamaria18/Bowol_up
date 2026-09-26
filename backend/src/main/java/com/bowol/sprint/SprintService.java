package com.bowol.sprint;

import com.bowol.ai.audit.AIAuditService;
import com.bowol.ai.model.*;
import com.bowol.ai.prompt.PromptTemplate;
import com.bowol.ai.prompt.PromptTemplateEngine;
import com.bowol.ai.provider.AIProvider;
import com.bowol.ai.provider.AIProviderResolver;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.project.Project;
import com.bowol.project.ProjectService;
import com.bowol.shared.exception.BadRequestException;
import com.bowol.shared.exception.ConflictException;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.sprint.dto.*;
import com.bowol.task.Task;
import com.bowol.task.TaskRepository;
import com.bowol.task.TaskStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectService projectService;
    private final TaskRepository taskRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final PromptTemplateEngine promptTemplateEngine;
    private final AIProviderResolver aiProviderResolver;
    private final AIAuditService aiAuditService;
    private final ObjectMapper objectMapper;
    private final com.bowol.developer.WebhookService webhookService;

    @Transactional(readOnly = true)
    public List<SprintResponse> getSprintsByProject(UUID projectId, SprintStatus status, UserPrincipal principal) {
        // Validate project tenant
        projectService.getProjectEntity(projectId, principal.getOrganizationId());

        List<Sprint> sprints;
        if (status != null) {
            sprints = sprintRepository.findAllByProjectIdAndStatusOrderByStartDateDesc(projectId, status);
        } else {
            sprints = sprintRepository.findAllByProjectIdOrderByStartDateDesc(projectId);
        }

        return sprints.stream()
                .map(sprint -> {
                    List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(projectId, sprint.getId());
                    return SprintResponse.from(sprint, tasks);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SprintResponse getSprintById(UUID id, UserPrincipal principal) {
        Sprint sprint = getSprintEntity(id, principal.getOrganizationId());
        List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(sprint.getProjectId(), sprint.getId());
        return SprintResponse.from(sprint, tasks);
    }

    @Transactional
    public SprintResponse createSprint(UUID projectId, CreateSprintRequest request, UserPrincipal principal) {
        // Validate project tenant
        projectService.getProjectEntity(projectId, principal.getOrganizationId());

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("FECHA_INVALIDA", "La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        Sprint sprint = Sprint.builder()
                .projectId(projectId)
                .name(request.getName().trim())
                .goal(request.getGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(SprintStatus.PLANNED)
                .build();

        Sprint saved = sprintRepository.save(sprint);
        log.info("Sprint creado {} para proyecto {}", saved.getId(), projectId);
        return SprintResponse.from(saved, List.of());
    }

    @Transactional
    public SprintResponse updateSprint(UUID id, UpdateSprintRequest request, UserPrincipal principal) {
        Sprint sprint = getSprintEntity(id, principal.getOrganizationId());

        if (request.getName() != null && !request.getName().isBlank()) {
            sprint.setName(request.getName().trim());
        }
        if (request.getGoal() != null) {
            sprint.setGoal(request.getGoal());
        }
        if (request.getStartDate() != null) {
            sprint.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            sprint.setEndDate(request.getEndDate());
        }
        if (sprint.getEndDate().isBefore(sprint.getStartDate())) {
            throw new BadRequestException("FECHA_INVALIDA", "La fecha de fin no puede ser anterior a la fecha de inicio");
        }
        if (request.getStatus() != null) {
            sprint.setStatus(request.getStatus());
        }

        Sprint saved = sprintRepository.save(sprint);
        List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(saved.getProjectId(), saved.getId());
        log.info("Sprint actualizado {}", saved.getId());
        return SprintResponse.from(saved, tasks);
    }

    @Transactional
    public SprintResponse startSprint(UUID id, UserPrincipal principal) {
        Sprint sprint = getSprintEntity(id, principal.getOrganizationId());

        if (sprint.getStatus() != SprintStatus.PLANNED) {
            throw new BadRequestException("ESTADO_INVALIDO", "Solo se puede iniciar un sprint en estado PLANNED");
        }

        Optional<Sprint> activeOpt = sprintRepository.findByProjectIdAndStatus(sprint.getProjectId(), SprintStatus.ACTIVE);
        if (activeOpt.isPresent() && !activeOpt.get().getId().equals(sprint.getId())) {
            throw new ConflictException("SPRINT_ACTIVO_EXISTENTE", "Ya existe un sprint activo en este proyecto. Debes completar o cancelar el sprint activo antes de iniciar otro.");
        }

        sprint.setStatus(SprintStatus.ACTIVE);
        Sprint saved = sprintRepository.save(sprint);
        List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(saved.getProjectId(), saved.getId());
        log.info("Sprint iniciado {}", saved.getId());
        return SprintResponse.from(saved, tasks);
    }

    @Transactional
    public SprintResponse completeSprint(UUID id, CompleteSprintRequest request, UserPrincipal principal) {
        Sprint sprint = getSprintEntity(id, principal.getOrganizationId());

        if (sprint.getStatus() != SprintStatus.ACTIVE) {
            throw new BadRequestException("ESTADO_INVALIDO", "Solo se puede completar un sprint que esté ACTIVE");
        }

        List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(sprint.getProjectId(), sprint.getId());

        // Process incomplete tasks
        List<Task> incompleteTasks = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getStatus() != TaskStatus.CANCELED)
                .toList();

        if (!incompleteTasks.isEmpty()) {
            UUID targetSprintId = null;
            if (request != null && request.getMoveToSprintId() != null) {
                Sprint targetSprint = getSprintEntity(request.getMoveToSprintId(), principal.getOrganizationId());
                if (!targetSprint.getProjectId().equals(sprint.getProjectId())) {
                    throw new BadRequestException("PROYECTO_INVALIDO", "El sprint de destino pertenece a otro proyecto");
                }
                if (targetSprint.getStatus() == SprintStatus.COMPLETED || targetSprint.getStatus() == SprintStatus.CANCELED) {
                    throw new BadRequestException("SPRINT_DESTINO_CERRADO", "No se pueden mover tareas a un sprint completado o cancelado");
                }
                targetSprintId = targetSprint.getId();
            }

            for (Task task : incompleteTasks) {
                task.setSprintId(targetSprintId); // null moves to backlog
            }
            taskRepository.saveAll(incompleteTasks);
            log.info("Movidas {} tareas incompletas del sprint {} a {}", incompleteTasks.size(), sprint.getId(),
                    targetSprintId != null ? "sprint " + targetSprintId : "backlog");
        }

        sprint.setStatus(SprintStatus.COMPLETED);
        Sprint saved = sprintRepository.save(sprint);
        List<Task> remainingTasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(saved.getProjectId(), saved.getId());

        try {
            long doneCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
            Map<String, Object> sprintData = new LinkedHashMap<>();
            sprintData.put("sprint_id", saved.getId().toString());
            sprintData.put("project_id", saved.getProjectId().toString());
            sprintData.put("name", saved.getName());
            sprintData.put("goal", saved.getGoal());
            sprintData.put("start_date", saved.getStartDate().toString());
            sprintData.put("end_date", saved.getEndDate().toString());
            sprintData.put("total_tasks", tasks.size());
            sprintData.put("completed_tasks", doneCount);
            sprintData.put("incomplete_tasks", incompleteTasks.size());
            webhookService.dispatchEventAsync(principal.getOrganizationId(), "sprint.completed", sprintData);
        } catch (Exception e) {
            log.warn("No se pudo disparar webhook sprint.completed: {}", e.getMessage());
        }

        log.info("Sprint completado {}", saved.getId());
        return SprintResponse.from(saved, remainingTasks);
    }

    @Transactional
    public SprintResponse cancelSprint(UUID id, UserPrincipal principal) {
        Sprint sprint = getSprintEntity(id, principal.getOrganizationId());

        if (sprint.getStatus() == SprintStatus.COMPLETED || sprint.getStatus() == SprintStatus.CANCELED) {
            throw new BadRequestException("ESTADO_INVALIDO", "No se puede cancelar un sprint que ya ha finalizado o ha sido cancelado");
        }

        List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(sprint.getProjectId(), sprint.getId());
        for (Task task : tasks) {
            task.setSprintId(null);
        }
        if (!tasks.isEmpty()) {
            taskRepository.saveAll(tasks);
        }

        sprint.setStatus(SprintStatus.CANCELED);
        Sprint saved = sprintRepository.save(sprint);
        log.info("Sprint cancelado {} y tareas devueltas al backlog", saved.getId());
        return SprintResponse.from(saved, List.of());
    }

    @Transactional
    public void deleteSprint(UUID id, UserPrincipal principal) {
        Sprint sprint = getSprintEntity(id, principal.getOrganizationId());

        List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(sprint.getProjectId(), sprint.getId());
        for (Task task : tasks) {
            task.setSprintId(null);
        }
        if (!tasks.isEmpty()) {
            taskRepository.saveAll(tasks);
        }

        sprintRepository.delete(sprint);
        log.info("Sprint eliminado {}", id);
    }

    public Sprint getSprintEntity(UUID id, UUID organizationId) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SPRINT_NO_ENCONTRADO", "No se encontró el sprint con id: " + id));

        // Verify project belongs to tenant
        projectService.getProjectEntity(sprint.getProjectId(), organizationId);

        return sprint;
    }

    @Transactional
    public AiSprintPlanResponse planSprintWithAi(UUID projectId, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        UUID userId = principal.getId();

        Project project = projectService.getProjectEntity(projectId, organizationId);
        log.info("Iniciando planificación AI de Sprint para proyecto {} ({})", projectId, project.getName());

        BusinessProfile profile = businessProfileRepository.findByOrganizationId(organizationId).orElse(null);
        String industry = profile != null ? profile.getIndustry() : "Tecnología / Software";

        // Tareas disponibles en backlog (sin sprint o en estado BACKLOG)
        List<Task> backlogTasks = taskRepository.findAllByProjectIdOrderByPositionAsc(projectId).stream()
                .filter(t -> t.getSprintId() == null || t.getStatus() == TaskStatus.BACKLOG)
                .collect(Collectors.toList());

        StringBuilder backlogListBuilder = new StringBuilder();
        for (Task t : backlogTasks) {
            backlogListBuilder.append(String.format("- [ID: %s] %s (Prioridad: %s, Horas: %s)%n",
                    t.getId(), t.getTitle(), t.getPriority(), t.getEstimateHours() != null ? t.getEstimateHours() : "N/D"));
        }
        String backlogTasksList = backlogListBuilder.length() > 0 ? backlogListBuilder.toString() : "No hay tareas registradas aún en el backlog.";

        PromptTemplate template = promptTemplateEngine.getTemplate("sprint-planner-v1");
        Map<String, Object> variables = new HashMap<>();
        variables.put("projectName", project.getName());
        variables.put("projectDescription", project.getDescription() != null ? project.getDescription() : "Sin descripción");
        variables.put("industry", industry);
        variables.put("backlogCount", backlogTasks.size());
        variables.put("backlogTasksList", backlogTasksList);

        String renderedPrompt = promptTemplateEngine.render("sprint-planner-v1", variables);

        AIModel targetModel = template.getModel() != null ? template.getModel() : AIModel.GPT_4O;
        AIProvider provider = aiProviderResolver.resolve(targetModel);

        AIRequest aiRequest = AIRequest.builder()
                .model(targetModel)
                .systemPrompt("Eres el Agile Coach, Tech Lead y Scrum Master de BOWOL. Estructuras objetivos de Sprint claros y seleccionas tareas estratégicas.")
                .messages(List.of(AIMessage.user(renderedPrompt)))
                .temperature(template.getTemperature())
                .format(ResponseFormat.JSON_OBJECT)
                .build();

        AIResponse aiResponse = provider.complete(aiRequest);

        // Audit log
        Map<String, Object> auditMetadata = Map.of(
                "project_id", projectId.toString(),
                "prompt_template", template.getKey()
        );
        aiAuditService.logUsage(organizationId, userId, "SPRINT_AI_PLANNING", aiResponse, auditMetadata);

        // Parse JSON
        String sprintName = "Sprint 1: Cimientos y MVP de Validación";
        String sprintGoal = "Desplegar la infraestructura núcleo y poner en marcha las historias clave.";
        int suggestedDurationDays = 14;
        String rationale = "Prioriza componentes de arquitectura para desbloquear el desarrollo posterior.";
        List<String> recommendedTitles = new ArrayList<>();
        List<UUID> recommendedTaskIds = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(aiResponse.getContent());
            if (root.has("sprintName")) {
                sprintName = root.get("sprintName").asText();
            }
            if (root.has("sprintGoal")) {
                sprintGoal = root.get("sprintGoal").asText();
            }
            if (root.has("suggestedDurationDays") && root.get("suggestedDurationDays").isInt()) {
                suggestedDurationDays = root.get("suggestedDurationDays").asInt();
            }
            if (root.has("rationale")) {
                rationale = root.get("rationale").asText();
            }
            if (root.has("recommendedTaskTitles") && root.get("recommendedTaskTitles").isArray()) {
                for (JsonNode t : root.get("recommendedTaskTitles")) {
                    String title = t.asText();
                    recommendedTitles.add(title);
                    // Match with backlog tasks
                    backlogTasks.stream()
                            .filter(task -> task.getTitle().equalsIgnoreCase(title) || task.getTitle().contains(title) || title.contains(task.getTitle()))
                            .findFirst()
                            .ifPresent(matched -> {
                                if (!recommendedTaskIds.contains(matched.getId())) {
                                    recommendedTaskIds.add(matched.getId());
                                }
                            });
                }
            }
        } catch (Exception e) {
            log.warn("Error parseando respuesta de IA para plan de sprint: {}", e.getMessage());
        }

        BigDecimal totalHours = BigDecimal.ZERO;
        for (Task t : backlogTasks) {
            if (recommendedTaskIds.contains(t.getId()) && t.getEstimateHours() != null) {
                totalHours = totalHours.add(t.getEstimateHours());
            }
        }

        return AiSprintPlanResponse.builder()
                .sprintName(sprintName)
                .sprintGoal(sprintGoal)
                .recommendedTaskIds(recommendedTaskIds)
                .recommendedTaskTitles(recommendedTitles)
                .suggestedDurationDays(suggestedDurationDays)
                .totalEstimatedHours(totalHours)
                .rationale(rationale)
                .build();
    }
}
