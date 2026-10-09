package com.bowol.task;

import com.bowol.ai.audit.AIAuditService;
import com.bowol.ai.context.StrategicContextService;
import com.bowol.ai.model.*;
import com.bowol.ai.prompt.PromptTemplate;
import com.bowol.ai.prompt.PromptTemplateEngine;
import com.bowol.ai.provider.AIProvider;
import com.bowol.ai.provider.AIProviderResolver;
import com.bowol.ai.validation.AIResponseValidator;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.opportunity.Opportunity;
import com.bowol.opportunity.OpportunityRepository;
import com.bowol.project.Project;
import com.bowol.project.ProjectService;
import com.bowol.organization.MemberStatus;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.shared.exception.BadRequestException;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.sprint.Sprint;
import com.bowol.sprint.SprintRepository;
import com.bowol.sprint.SprintStatus;
import com.bowol.task.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
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
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final SprintRepository sprintRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final OpportunityRepository opportunityRepository;
    private final StrategicContextService strategicContextService;
    private final PromptTemplateEngine promptTemplateEngine;
    private final AIProviderResolver aiProviderResolver;
    private final AIResponseValidator aiResponseValidator;
    private final AIAuditService aiAuditService;
    private final com.bowol.developer.WebhookService webhookService;

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(UUID projectId, UUID sprintId, TaskStatus status, UUID assigneeId, UserPrincipal principal) {
        projectService.getProjectEntity(projectId, principal.getOrganizationId());

        List<Task> tasks;
        if (sprintId != null) {
            tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(projectId, sprintId);
        } else if (status != null) {
            tasks = taskRepository.findAllByProjectIdAndStatusOrderByPositionAsc(projectId, status);
        } else {
            tasks = taskRepository.findAllByProjectIdOrderByPositionAsc(projectId);
        }

        if (assigneeId != null) {
            tasks = tasks.stream()
                    .filter(t -> assigneeId.equals(t.getAssigneeId()))
                    .collect(Collectors.toList());
        }

        return tasks.stream().map(TaskResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, List<TaskResponse>> getBoard(UUID projectId, UUID sprintId, UserPrincipal principal) {
        List<TaskResponse> all = getTasks(projectId, sprintId, null, null, principal);

        Map<String, List<TaskResponse>> board = new LinkedHashMap<>();
        for (TaskStatus s : TaskStatus.values()) {
            board.put(s.name(), new ArrayList<>());
        }

        for (TaskResponse t : all) {
            board.computeIfAbsent(t.getStatus().name(), k -> new ArrayList<>()).add(t);
        }

        return board;
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(UUID id, UserPrincipal principal) {
        Task task = getTaskEntity(id, principal.getOrganizationId());
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request, UserPrincipal principal) {
        if (request.getProjectId() == null) {
            throw new IllegalArgumentException("El projectId es obligatorio para crear una tarea");
        }
        projectService.getProjectEntity(request.getProjectId(), principal.getOrganizationId());
        validateSprintAssignment(request.getSprintId(), request.getProjectId());
        validateAssignee(request.getAssigneeId(), principal.getOrganizationId());

        Integer maxPos = taskRepository.findMaxPositionByProjectId(request.getProjectId());
        int position = request.getPosition() != null ? request.getPosition() : (maxPos != null ? maxPos + 1000 : 1000);

        Task task = Task.builder()
                .projectId(request.getProjectId())
                .sprintId(request.getSprintId())
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.BACKLOG)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .assigneeId(request.getAssigneeId())
                .estimateHours(request.getEstimateHours())
                .position(position)
                .externalWaitHours(request.getExternalWaitHours() != null ? request.getExternalWaitHours() : BigDecimal.ZERO)
                .area(request.getArea())
                .deliverable(request.getDeliverable())
                .dependsOn(request.getDependsOn() != null ? request.getDependsOn() : new ArrayList<>())
                .build();

        if (task.getStatus() == TaskStatus.DONE) {
            validateDoneRequirements(task.getAcceptanceEvidence(), principal);
            task.setAcceptanceReviewedBy(resolveReviewerName(principal));
        }

        validateTaskDependencies(task.getId(), task.getProjectId(), task.getDependsOn());

        Task saved = taskRepository.save(task);
        checkAndDispatchBlockedTask(principal.getOrganizationId(), saved);
        log.info("Tarea creada {} para proyecto {}", saved.getId(), request.getProjectId());
        return TaskResponse.from(saved);
    }

    @Transactional
    public TaskResponse updateTask(UUID id, UpdateTaskRequest request, UserPrincipal principal) {
        Task task = getTaskEntity(id, principal.getOrganizationId());

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getSprintId() != null) {
            validateSprintAssignment(request.getSprintId(), task.getProjectId());
            task.setSprintId(request.getSprintId());
        }
        if (request.getStatus() != null) {
            if (request.getStatus() == TaskStatus.DONE) {
                String evidence = request.getAcceptanceEvidence() != null ? request.getAcceptanceEvidence() : task.getAcceptanceEvidence();
                validateDoneRequirements(evidence, principal);
                task.setAcceptanceEvidence(evidence.trim());
                task.setAcceptanceReviewedBy(resolveReviewerName(principal));
            } else if (task.getStatus() == TaskStatus.DONE && request.getStatus() != TaskStatus.DONE) {
                // Reapertura: preservar trazabilidad o limpiar completedAt
                task.setCompletedAt(null);
            }
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getAssigneeId() != null) {
            validateAssignee(request.getAssigneeId(), principal.getOrganizationId());
            task.setAssigneeId(request.getAssigneeId());
        }
        if (request.getEstimateHours() != null) {
            task.setEstimateHours(request.getEstimateHours());
        }
        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }
        if (request.getBlockedReason() != null) {
            task.setBlockedReason(request.getBlockedReason());
        }
        if (request.getBlockedResolver() != null) {
            task.setBlockedResolver(request.getBlockedResolver());
        }
        if (request.getBlockedReviewDate() != null) {
            task.setBlockedReviewDate(request.getBlockedReviewDate());
        }
        if (request.getAcceptanceEvidence() != null) {
            task.setAcceptanceEvidence(request.getAcceptanceEvidence());
        }
        if (request.getExternalWaitHours() != null) {
            task.setExternalWaitHours(request.getExternalWaitHours());
        }
        if (request.getArea() != null) {
            task.setArea(request.getArea());
        }
        if (request.getDeliverable() != null) {
            task.setDeliverable(request.getDeliverable());
        }
        if (request.getDependsOn() != null) {
            validateTaskDependencies(task.getId(), task.getProjectId(), request.getDependsOn());
            task.setDependsOn(request.getDependsOn());
        }

        Task saved = taskRepository.save(task);
        checkAndDispatchBlockedTask(principal.getOrganizationId(), saved);
        return TaskResponse.from(saved);
    }

    @Transactional
    public TaskResponse updateTaskStatus(UUID id, UpdateTaskStatusRequest request, UserPrincipal principal) {
        Task task = getTaskEntity(id, principal.getOrganizationId());
        
        if (request.getStatus() == TaskStatus.DONE) {
            String evidence = request.getAcceptanceEvidence() != null ? request.getAcceptanceEvidence() : task.getAcceptanceEvidence();
            validateDoneRequirements(evidence, principal);
            task.setAcceptanceEvidence(evidence.trim());
            task.setAcceptanceReviewedBy(resolveReviewerName(principal));
        } else if (task.getStatus() == TaskStatus.DONE && request.getStatus() != TaskStatus.DONE) {
            // Reapertura: desmarcar completedAt
            task.setCompletedAt(null);
        }

        task.setStatus(request.getStatus());

        if (request.getStatus() == TaskStatus.BLOCKED) {
            if (request.getBlockedReason() != null) {
                task.setBlockedReason(request.getBlockedReason().trim());
            }
            if (request.getBlockedResolver() != null) {
                task.setBlockedResolver(request.getBlockedResolver().trim());
            }
            if (request.getBlockedReviewDate() != null) {
                task.setBlockedReviewDate(request.getBlockedReviewDate());
            }
        } else if (task.getBlockedReason() != null && request.getStatus() != TaskStatus.BLOCKED) {
            // When unblocked, clear blocker reason if not provided
            if (request.getBlockedReason() == null) {
                task.setBlockedReason(null);
                task.setBlockedResolver(null);
                task.setBlockedReviewDate(null);
            }
        }

        Task saved = taskRepository.save(task);
        checkAndDispatchBlockedTask(principal.getOrganizationId(), saved);
        log.info("Status de tarea {} actualizado a {} por {}", id, request.getStatus(), principal.getUsername());
        return TaskResponse.from(saved);
    }

    @Transactional
    public TaskResponse assignTask(UUID id, AssignTaskRequest request, UserPrincipal principal) {
        Task task = getTaskEntity(id, principal.getOrganizationId());
        validateAssignee(request.getAssigneeId(), principal.getOrganizationId());
        task.setAssigneeId(request.getAssigneeId());
        Task saved = taskRepository.save(task);
        log.info("Tarea {} asignada a usuario {}", id, request.getAssigneeId());
        return TaskResponse.from(saved);
    }

    @Transactional
    public void reorderTasks(ReorderTasksRequest request, UserPrincipal principal) {
        if (request.getMoves() == null || request.getMoves().isEmpty()) {
            return;
        }

        for (TaskMoveItem move : request.getMoves()) {
            if (move.getTaskId() == null) continue;
            Task task = getTaskEntity(move.getTaskId(), principal.getOrganizationId());

            if (move.getStatus() != null) {
                task.setStatus(move.getStatus());
                if (move.getStatus() == TaskStatus.BLOCKED) {
                    checkAndDispatchBlockedTask(principal.getOrganizationId(), task);
                }
            }
            if (move.getSprintId() != null) {
                validateSprintAssignment(move.getSprintId(), task.getProjectId());
                task.setSprintId(move.getSprintId());
            }
            if (move.getPosition() != null) {
                task.setPosition(move.getPosition());
            }
            taskRepository.save(task);
        }
        log.info("Reordenadas {} tareas para org {}", request.getMoves().size(), principal.getOrganizationId());
    }

    @Transactional
    public void deleteTask(UUID id, UserPrincipal principal) {
        Task task = getTaskEntity(id, principal.getOrganizationId());
        taskRepository.delete(task);
        log.info("Tarea eliminada: {}", id);
    }

    @Transactional
    public DecomposeProjectResponse decomposeProject(UUID projectId, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        UUID userId = principal.getId();

        Project project = projectService.getProjectEntity(projectId, organizationId);
        log.info("Iniciando descomposición AI de tareas para proyecto {} ({})", projectId, project.getName());

        BusinessProfile profile = businessProfileRepository.findByOrganizationId(organizationId).orElse(null);
        String industry = profile != null ? profile.getIndustry() : "Tecnología / Software";

        String oppContext = "Iniciativa estratégica general de la empresa";
        if (project.getOpportunityId() != null) {
            Opportunity opp = opportunityRepository.findByIdAndOrganizationId(project.getOpportunityId(), organizationId).orElse(null);
            if (opp != null) {
                oppContext = opp.getTitle() + " - " + (opp.getDescription() != null ? opp.getDescription() : "");
            }
        }

        // 1. Template
        PromptTemplate template = promptTemplateEngine.getTemplate("idea-to-backlog-v1");
        Map<String, Object> variables = new HashMap<>();
        variables.put("projectName", project.getName());
        variables.put("projectDescription", project.getDescription() != null ? project.getDescription() : "Sin descripción adicional");
        variables.put("industry", industry);
        variables.put("opportunityContext", oppContext);

        String renderedPrompt = promptTemplateEngine.render("idea-to-backlog-v1", variables);

        // 2. AI Request
        AIModel targetModel = template.getModel() != null ?
                template.getModel() : AIModel.GPT_4O;
        AIProvider provider = aiProviderResolver.resolve(targetModel);

        AIRequest aiRequest = AIRequest.builder()
                .model(targetModel)
                .systemPrompt("Eres el Principal Tech Lead y Agile Coach de BOWOL. Descompones iniciativas estratégicas en un backlog ejecutable.")
                .messages(List.of(AIMessage.user(renderedPrompt)))
                .temperature(template.getTemperature())
                .format(ResponseFormat.JSON_OBJECT)
                .build();

        AIResponse aiResponse = provider.complete(aiRequest);

        // 3. Validate
        JsonNode root = aiResponseValidator.validateTaskBacklog(aiResponse.getContent());

        // 4. Audit
        Map<String, Object> auditMetadata = Map.of(
                "project_id", projectId.toString(),
                "prompt_template", template.getKey()
        );
        aiAuditService.logUsage(organizationId, userId, "PROJECT_DECOMPOSE_BACKLOG", aiResponse, auditMetadata);

        String epicTitle = root.has("epic") && root.get("epic").has("title") ? root.get("epic").get("title").asText() : project.getName();
        String epicObjective = root.has("epic") && root.get("epic").has("objective") ? root.get("epic").get("objective").asText() : "";

        Integer currentMax = taskRepository.findMaxPositionByProjectId(projectId);
        int pos = currentMax != null ? currentMax + 1000 : 1000;

        List<Task> createdTasks = new ArrayList<>();
        BigDecimal totalHours = BigDecimal.ZERO;

        JsonNode tasksNode = root.get("tasks");
        for (JsonNode t : tasksNode) {
            String title = t.has("title") ? t.get("title").asText() : "Tarea sin título";
            String desc = t.has("description") ? t.get("description").asText() : "";
            String priorityStr = t.has("priority") ? t.get("priority").asText().toUpperCase() : "MEDIUM";
            TaskPriority priority;
            try {
                priority = TaskPriority.valueOf(priorityStr);
            } catch (Exception e) {
                priority = TaskPriority.MEDIUM;
            }

            BigDecimal estimate = BigDecimal.valueOf(8.0);
            if (t.has("estimateHours") && t.get("estimateHours").isNumber()) {
                estimate = BigDecimal.valueOf(t.get("estimateHours").asDouble());
            }

            totalHours = totalHours.add(estimate);

            Task task = Task.builder()
                    .projectId(projectId)
                    .title(title)
                    .description(desc)
                    .priority(priority)
                    .status(TaskStatus.BACKLOG)
                    .estimateHours(estimate)
                    .position(pos)
                    .build();

            createdTasks.add(taskRepository.save(task));
            pos += 1000;
        }

        log.info("Descomposición completada: {} tareas generadas para proyecto {}", createdTasks.size(), projectId);

        return DecomposeProjectResponse.builder()
                .epicTitle(epicTitle)
                .epicObjective(epicObjective)
                .totalEstimatedHours(totalHours)
                .generatedTasksCount(createdTasks.size())
                .tasks(createdTasks.stream().map(TaskResponse::from).collect(Collectors.toList()))
                .build();
    }

    public Task getTaskEntity(UUID id, UUID organizationId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("TAREA_NO_ENCONTRADA", "No se encontró la tarea con id: " + id));

        // Validate parent project belongs to organization
        projectService.getProjectEntity(task.getProjectId(), organizationId);

        return task;
    }

    private void checkAndDispatchBlockedTask(UUID organizationId, Task task) {
        if (task.getStatus() == TaskStatus.BLOCKED) {
            try {
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("task_id", task.getId().toString());
                data.put("project_id", task.getProjectId().toString());
                data.put("title", task.getTitle());
                data.put("priority", task.getPriority() != null ? task.getPriority().name() : "MEDIUM");
                data.put("assignee_id", task.getAssigneeId() != null ? task.getAssigneeId().toString() : null);
                data.put("estimate_hours", task.getEstimateHours());
                data.put("sprint_id", task.getSprintId() != null ? task.getSprintId().toString() : null);
                webhookService.dispatchEventAsync(organizationId, "task.blocked", data);
            } catch (Exception e) {
                log.warn("No se pudo disparar webhook task.blocked: {}", e.getMessage());
            }
        }
    }

    private void validateSprintAssignment(UUID sprintId, UUID projectId) {
        if (sprintId == null) {
            return;
        }

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new NotFoundException("SPRINT_NO_ENCONTRADO", "No se encontró el sprint seleccionado"));
        if (!projectId.equals(sprint.getProjectId())) {
            throw new BadRequestException("SPRINT_PROJECT_MISMATCH", "El sprint seleccionado pertenece a otro proyecto");
        }
        if (sprint.getStatus() == SprintStatus.COMPLETED || sprint.getStatus() == SprintStatus.CANCELED) {
            throw new BadRequestException("SPRINT_CLOSED", "No se pueden asignar tareas a un sprint finalizado");
        }
    }

    private void validateAssignee(UUID userId, UUID organizationId) {
        if (userId == null) {
            return;
        }

        boolean isActiveMember = organizationMemberRepository
                .findByUserIdAndOrganizationId(userId, organizationId)
                .map(member -> member.getStatus() == MemberStatus.ACTIVE)
                .orElse(false);
        if (!isActiveMember) {
            throw new BadRequestException("TASK_ASSIGNEE_NOT_MEMBER", "La persona asignada no es miembro activo de la organización");
        }
    }

    private void validateDoneRequirements(String evidence, UserPrincipal principal) {
        if (evidence == null || evidence.trim().isBlank()) {
            throw new BadRequestException("DONE_EVIDENCE_REQUIRED", "El cierre a DONE exige evidencia tangible del entregable (Fase 6.2)");
        }
        if (principal == null) {
            throw new BadRequestException("REVIEWER_REQUIRED", "Se requiere usuario autenticado para revisar y certificar el cierre");
        }
    }

    private String resolveReviewerName(UserPrincipal principal) {
        if (principal == null) return "Sistema";
        if (principal.getUsername() != null && !principal.getUsername().isBlank()) {
            return principal.getUsername();
        }
        return principal.getId() != null ? principal.getId().toString() : "Revisor Autorizado";
    }

    private void validateTaskDependencies(UUID taskId, UUID projectId, List<String> dependsOn) {
        if (dependsOn == null || dependsOn.isEmpty()) {
            return;
        }

        List<Task> existingTasks = taskRepository.findAllByProjectIdOrderByPositionAsc(projectId);
        Map<String, UUID> idMap = new HashMap<>();
        Map<UUID, List<UUID>> adjList = new HashMap<>();

        for (int i = 0; i < existingTasks.size(); i++) {
            Task t = existingTasks.get(i);
            String label = String.format("T-%03d", i + 1);
            idMap.put(label, t.getId());
            idMap.put(t.getId().toString(), t.getId());
            if (t.getDependsOn() != null) {
                List<UUID> resolvedDeps = new ArrayList<>();
                for (String dep : t.getDependsOn()) {
                    if (idMap.containsKey(dep.trim())) {
                        resolvedDeps.add(idMap.get(dep.trim()));
                    }
                }
                adjList.put(t.getId(), resolvedDeps);
            }
        }

        // Validar que las dependencias de la tarea actual existan y no apunten a sí misma
        List<UUID> currentDeps = new ArrayList<>();
        for (String dep : dependsOn) {
            String trimmed = dep.trim();
            UUID targetId = idMap.get(trimmed);
            if (targetId == null) {
                // Verificar si es un UUID válido de la lista
                for (Task et : existingTasks) {
                    if (et.getId().toString().equalsIgnoreCase(trimmed)) {
                        targetId = et.getId();
                        break;
                    }
                }
            }
            if (targetId == null) {
                throw new BadRequestException("DEPENDENCY_NOT_FOUND", "La dependencia " + trimmed + " no existe en el proyecto");
            }
            if (taskId != null && targetId.equals(taskId)) {
                throw new BadRequestException("CYCLIC_DEPENDENCY", "Una tarea no puede depender de sí misma");
            }
            currentDeps.add(targetId);
        }

        if (taskId != null) {
            adjList.put(taskId, currentDeps);
            if (detectCycle(adjList)) {
                throw new BadRequestException("CYCLIC_DEPENDENCY", "Se detectó un ciclo en las dependencias de las tareas");
            }
        }
    }

    private boolean detectCycle(Map<UUID, List<UUID>> graph) {
        Set<UUID> visited = new HashSet<>();
        Set<UUID> inStack = new HashSet<>();

        for (UUID node : graph.keySet()) {
            if (!visited.contains(node)) {
                if (dfs(node, graph, visited, inStack)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean dfs(UUID curr, Map<UUID, List<UUID>> graph, Set<UUID> visited, Set<UUID> inStack) {
        visited.add(curr);
        inStack.add(curr);

        List<UUID> neighbors = graph.getOrDefault(curr, Collections.emptyList());
        for (UUID next : neighbors) {
            if (!visited.contains(next)) {
                if (dfs(next, graph, visited, inStack)) {
                    return true;
                }
            } else if (inStack.contains(next)) {
                return true;
            }
        }

        inStack.remove(curr);
        return false;
    }
}
