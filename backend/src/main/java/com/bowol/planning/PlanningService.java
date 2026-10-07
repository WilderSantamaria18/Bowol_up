package com.bowol.planning;

import com.bowol.planning.dto.*;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.shared.exception.BadRequestException;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.task.Task;
import com.bowol.task.TaskPriority;
import com.bowol.task.TaskRepository;
import com.bowol.task.TaskStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanningService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public PlanningValidationResult validatePlan(PlanningImportRequest request) {
        List<String> blockingIssues = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if (request == null) {
            blockingIssues.add("El cuerpo de la solicitud no puede estar vacío");
            return PlanningValidationResult.builder()
                    .valid(false)
                    .blockingIssues(blockingIssues)
                    .warnings(warnings)
                    .build();
        }

        if (request.getProject() == null || request.getProject().getName() == null || request.getProject().getName().isBlank()) {
            blockingIssues.add("El proyecto debe tener un nombre definido");
        }

        List<TaskPlanDto> tasks = request.getTasks() != null ? request.getTasks() : Collections.emptyList();
        if (tasks.isEmpty()) {
            blockingIssues.add("El plan debe contener al menos una tarea");
        }

        // Validar unicidad de IDs
        Set<String> seenIds = new HashSet<>();
        Set<String> declaredIds = new HashSet<>();
        for (TaskPlanDto t : tasks) {
            if (t.getId() == null || t.getId().isBlank()) {
                blockingIssues.add("Cada tarea debe tener un identificador ID (ej: T-001)");
            } else {
                String normalizedId = t.getId().trim();
                if (!seenIds.add(normalizedId)) {
                    blockingIssues.add("Identificador duplicado: " + normalizedId);
                }
                declaredIds.add(normalizedId);
            }
        }

        // Validar dependencias y detectar ciclos
        Map<String, List<String>> adjList = new HashMap<>();
        for (TaskPlanDto t : tasks) {
            String tid = t.getId() != null ? t.getId().trim() : "";
            List<String> deps = t.getDependsOn() != null ? t.getDependsOn() : Collections.emptyList();
            for (String dep : deps) {
                String cleanDep = dep.trim();
                if (!declaredIds.contains(cleanDep)) {
                    blockingIssues.add("La tarea " + tid + " depende de " + cleanDep + ", que no existe en el plan");
                }
            }
            adjList.put(tid, deps);
        }

        if (hasCycle(adjList)) {
            blockingIssues.add("Se detectaron dependencias circulares entre las tareas del plan");
        }

        BigDecimal totalHours = BigDecimal.ZERO;
        int overSixHours = 0;
        int withoutAcceptanceCriteria = 0;

        for (TaskPlanDto t : tasks) {
            String tid = t.getId() != null ? t.getId().trim() : "Sin ID";

            if (t.getTitle() == null || t.getTitle().isBlank()) {
                blockingIssues.add("La tarea " + tid + " debe tener un título");
            }

            if (t.getEstimatedHours() == null || t.getEstimatedHours().compareTo(BigDecimal.ZERO) <= 0) {
                blockingIssues.add("La tarea " + tid + " debe tener estimación de horas mayor a 0");
            } else {
                totalHours = totalHours.add(t.getEstimatedHours());
                if (t.getEstimatedHours().compareTo(BigDecimal.valueOf(6)) > 0) {
                    overSixHours++;
                    warnings.add("La tarea " + tid + " (" + t.getTitle() + ") excede 6 horas (" + t.getEstimatedHours() + "h). Según BOWOL Plans 2.0 conviene dividirla en partes revisables.");
                }
            }

            if (t.getAcceptanceCriteria() == null || t.getAcceptanceCriteria().isEmpty()) {
                withoutAcceptanceCriteria++;
                warnings.add("La tarea " + tid + " no cuenta con criterios de aceptación explícitos.");
            }

            if (t.getAssignedRole() == null && t.getAssignedPerson() == null) {
                warnings.add("La tarea " + tid + " no tiene rol o persona sugerida.");
            }

            if (t.getPrioritization() != null) {
                PrioritizationDto p = t.getPrioritization();
                if (p.getReach() != null && (p.getReach() < 1 || p.getReach() > 10)) {
                    blockingIssues.add("El alcance (Reach) de " + tid + " debe estar entre 1 y 10");
                }
                if (p.getImpact() != null && (p.getImpact() < 1 || p.getImpact() > 3)) {
                    blockingIssues.add("El impacto (Impact) de " + tid + " debe estar entre 1 (bajo) y 3 (alto)");
                }
                if (p.getConfidence() != null && (p.getConfidence().compareTo(BigDecimal.ZERO) < 0 || p.getConfidence().compareTo(BigDecimal.ONE) > 0)) {
                    blockingIssues.add("La confianza (Confidence) de " + tid + " debe ser un valor entre 0 y 1");
                }
            }
        }

        boolean isValid = blockingIssues.isEmpty();

        return PlanningValidationResult.builder()
                .valid(isValid)
                .blockingIssues(blockingIssues)
                .warnings(warnings)
                .totalEstimatedHours(totalHours)
                .totalTasks(tasks.size())
                .tasksOverSixHours(overSixHours)
                .tasksWithoutAcceptanceCriteria(withoutAcceptanceCriteria)
                .build();
    }

    @Transactional
    public PlanningImportResponse importPlan(PlanningImportRequest request, UserPrincipal principal) {
        PlanningValidationResult validation = validatePlan(request);
        if (!validation.isValid()) {
            throw new BadRequestException("PLAN_INVALIDO", String.join(" | ", validation.getBlockingIssues()));
        }

        Project project = Project.builder()
                .name(request.getProject().getName().trim())
                .description(request.getProject().getObjective())
                .startDate(request.getProject().getStartDate() != null ? request.getProject().getStartDate() : LocalDate.now())
                .endDate(request.getProject().getDueDate())
                .status(ProjectStatus.PLANNING)
                .createdBy(principal.getId())
                .build();
        project.setOrganizationId(principal.getOrganizationId());

        Project savedProject = projectRepository.save(project);
        log.info("Proyecto creado desde BOWOL Plans: {} id: {}", savedProject.getName(), savedProject.getId());

        List<UUID> createdTaskIds = new ArrayList<>();
        int position = 1000;

        for (TaskPlanDto t : request.getTasks()) {
            TaskStatus status = TaskStatus.TODO;
            if (t.getStatus() != null) {
                String s = t.getStatus().toUpperCase();
                if ("IN_PROGRESS".equals(s)) status = TaskStatus.IN_PROGRESS;
                else if ("BLOCKED".equals(s)) status = TaskStatus.BLOCKED;
                else if ("DONE".equals(s)) status = TaskStatus.DONE;
                else if ("BACKLOG".equals(s)) status = TaskStatus.BACKLOG;
            }

            TaskPriority priority = TaskPriority.MEDIUM;
            if (t.getPrioritization() != null && t.getPrioritization().getImpact() != null) {
                int imp = t.getPrioritization().getImpact();
                if (imp >= 3) priority = TaskPriority.HIGH;
                else if (imp == 1) priority = TaskPriority.LOW;
            }

            StringBuilder desc = new StringBuilder();
            if (t.getId() != null) {
                desc.append("**[").append(t.getId().trim()).append("]** ");
            }
            if (t.getDescription() != null && !t.getDescription().isBlank()) {
                desc.append(t.getDescription().trim()).append("\n\n");
            }
            if (t.getArea() != null && !t.getArea().isBlank()) {
                desc.append("**Área:** ").append(t.getArea().trim()).append("\n");
            }
            if (t.getAssignedRole() != null && !t.getAssignedRole().isBlank()) {
                desc.append("**Rol sugerido:** ").append(t.getAssignedRole().trim()).append("\n");
            }
            if (t.getDeliverable() != null && !t.getDeliverable().isBlank()) {
                desc.append("**Entregable:** ").append(t.getDeliverable().trim()).append("\n");
            }
            if (t.getAcceptanceCriteria() != null && !t.getAcceptanceCriteria().isEmpty()) {
                desc.append("\n**Criterios de Aceptación:**\n");
                for (String crit : t.getAcceptanceCriteria()) {
                    desc.append("- ").append(crit.trim()).append("\n");
                }
            }
            if (t.getDependsOn() != null && !t.getDependsOn().isEmpty()) {
                desc.append("\n**Dependencias:** ").append(String.join(", ", t.getDependsOn())).append("\n");
            }

            Task task = Task.builder()
                    .projectId(savedProject.getId())
                    .title(t.getTitle().trim())
                    .description(desc.toString().trim())
                    .status(status)
                    .priority(priority)
                    .assigneeId(t.getAssignedPerson())
                    .estimateHours(t.getEstimatedHours())
                    .position(position)
                    .build();

            Task savedTask = taskRepository.save(task);
            createdTaskIds.add(savedTask.getId());
            position += 1000;
        }

        return PlanningImportResponse.builder()
                .projectId(savedProject.getId())
                .projectName(savedProject.getName())
                .importedTasksCount(createdTaskIds.size())
                .totalEstimatedHours(validation.getTotalEstimatedHours())
                .createdTaskIds(createdTaskIds)
                .warnings(validation.getWarnings())
                .build();
    }

    @Transactional(readOnly = true)
    public PlanningImportRequest exportPlan(UUID projectId, UserPrincipal principal) {
        Project project = projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(projectId, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + projectId));

        List<Task> tasks = taskRepository.findAllByProjectIdOrderByPositionAsc(projectId);

        List<TaskPlanDto> taskDtos = new ArrayList<>();
        int index = 1;
        for (Task t : tasks) {
            String tid = String.format("T-%03d", index++);
            taskDtos.add(TaskPlanDto.builder()
                    .id(tid)
                    .title(t.getTitle())
                    .description(t.getDescription())
                    .status(t.getStatus() != null ? t.getStatus().name() : "TODO")
                    .estimatedHours(t.getEstimateHours())
                    .assignedPerson(t.getAssigneeId())
                    .build());
        }

        return PlanningImportRequest.builder()
                .schemaVersion("bowol-planning-guide-2.0")
                .project(ProjectPlanDto.builder()
                        .name(project.getName())
                        .objective(project.getDescription())
                        .startDate(project.getStartDate())
                        .dueDate(project.getEndDate())
                        .build())
                .assumptions(List.of("Plan exportado desde BOWOL Platform"))
                .tasks(taskDtos)
                .build();
    }

    private boolean hasCycle(Map<String, List<String>> adjList) {
        Set<String> visited = new HashSet<>();
        Set<String> recursionStack = new HashSet<>();

        for (String node : adjList.keySet()) {
            if (!visited.contains(node)) {
                if (dfsCycle(node, adjList, visited, recursionStack)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean dfsCycle(String curr, Map<String, List<String>> adjList, Set<String> visited, Set<String> recStack) {
        visited.add(curr);
        recStack.add(curr);

        List<String> neighbors = adjList.getOrDefault(curr, Collections.emptyList());
        for (String next : neighbors) {
            if (!visited.contains(next)) {
                if (dfsCycle(next, adjList, visited, recStack)) {
                    return true;
                }
            } else if (recStack.contains(next)) {
                return true;
            }
        }

        recStack.remove(curr);
        return false;
    }
}
