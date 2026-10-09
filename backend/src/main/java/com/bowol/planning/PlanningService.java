package com.bowol.planning;

import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
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
    private final ProjectCharterRepository projectCharterRepository;
    private final CapacityPlanRepository capacityPlanRepository;
    private final WeeklyRetrospectiveRepository weeklyRetrospectiveRepository;
    private final WeeklyFocusBannerRepository weeklyFocusBannerRepository;
    private final DailyCheckinRepository dailyCheckinRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

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

    // =========================================================================
    // 1. PROJECT CHARTER (FICHA SMART)
    // =========================================================================

    @Transactional(readOnly = true)
    public ProjectCharterDto getProjectCharter(UUID projectId, UserPrincipal principal) {
        projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(projectId, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + projectId));

        return projectCharterRepository.findByProjectIdAndOrganizationId(projectId, principal.getOrganizationId())
                .map(ProjectCharterDto::from)
                .orElse(null);
    }

    @Transactional
    public ProjectCharterDto saveProjectCharter(UUID projectId, ProjectCharterDto dto, UserPrincipal principal) {
        Project project = projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(projectId, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + projectId));

        ProjectCharter charter = projectCharterRepository.findByProjectIdAndOrganizationId(projectId, principal.getOrganizationId())
                .orElseGet(() -> ProjectCharter.builder()
                        .projectId(projectId)
                        .organizationId(principal.getOrganizationId())
                        .build());

        charter.setProblemAddressed(dto.getProblemAddressed());
        charter.setSmartObjective(dto.getSmartObjective());
        charter.setMeasurableKpi(dto.getMeasurableKpi());
        charter.setBaselineValue(dto.getBaselineValue());
        charter.setBaselineUnit(dto.getBaselineUnit());
        charter.setBaselineDate(dto.getBaselineDate());
        charter.setBaselineIsProvisional(dto.getBaselineIsProvisional() != null ? dto.getBaselineIsProvisional() : false);
        charter.setTargetValue(dto.getTargetValue());
        charter.setTargetUnit(dto.getTargetUnit());
        charter.setTargetDeadline(dto.getTargetDeadline());
        charter.setMeasurementSource(dto.getMeasurementSource());
        charter.setOwnerDecisionRequired(dto.getOwnerDecisionRequired() != null ? dto.getOwnerDecisionRequired() : false);
        charter.setOwnerDecisionDetails(dto.getOwnerDecisionDetails());
        charter.setTechnicalDeliverables(dto.getTechnicalDeliverables() != null ? dto.getTechnicalDeliverables() : new ArrayList<>());
        charter.setExpectedCommercialResult(dto.getExpectedCommercialResult());
        charter.setInScope(dto.getInScope() != null ? dto.getInScope() : new ArrayList<>());
        charter.setOutOfScope(dto.getOutOfScope() != null ? dto.getOutOfScope() : new ArrayList<>());
        charter.setRestrictions(dto.getRestrictions() != null ? dto.getRestrictions() : new ArrayList<>());

        ProjectCharter saved = projectCharterRepository.save(charter);
        return ProjectCharterDto.from(saved);
    }

    // =========================================================================
    // 2. CAPACITY PLAN (CAPACIDAD Y BUFFER 20%)
    // =========================================================================

    @Transactional
    public CapacityPlanDto getCapacityPlan(UserPrincipal principal) {
        UUID orgId = principal.getOrganizationId();
        Optional<CapacityPlan> existing = capacityPlanRepository.findFirstByOrganizationIdOrderByCreatedAtDesc(orgId);
        if (existing.isPresent()) {
            return CapacityPlanDto.from(existing.get());
        }

        // Si no existe, cargar miembros reales de la organización para no usar datos ficticios
        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationIdWithUser(orgId);
        List<CapacityPlanDto.MemberAllocationDto> memberDtos = members.stream().map(m -> CapacityPlanDto.MemberAllocationDto.builder()
                .userId(m.getUser().getId())
                .name(m.getUser().getName() != null && !m.getUser().getName().isBlank() ? m.getUser().getName() : m.getUser().getEmail())
                .role(m.getRole() != null ? m.getRole().name() : "Miembro")
                .availableHours(BigDecimal.valueOf(20))
                .assignedHours(BigDecimal.ZERO)
                .build()
        ).collect(Collectors.toList());

        return CapacityPlanDto.builder()
                .periodLabel("Semana Actual")
                .bufferPercentage(BigDecimal.valueOf(20.0))
                .members(memberDtos)
                .build();
    }

    @Transactional
    public CapacityPlanDto saveCapacityPlan(CapacityPlanDto dto, UserPrincipal principal) {
        UUID orgId = principal.getOrganizationId();
        CapacityPlan plan = capacityPlanRepository.findFirstByOrganizationIdOrderByCreatedAtDesc(orgId)
                .orElseGet(() -> CapacityPlan.builder()
                        .organizationId(orgId)
                        .periodLabel(dto.getPeriodLabel() != null ? dto.getPeriodLabel() : "Semana Actual")
                        .bufferPercentage(dto.getBufferPercentage() != null ? dto.getBufferPercentage() : BigDecimal.valueOf(20.0))
                        .build());

        if (dto.getPeriodLabel() != null) plan.setPeriodLabel(dto.getPeriodLabel());
        if (dto.getBufferPercentage() != null) plan.setBufferPercentage(dto.getBufferPercentage());

        plan.getMemberAllocations().clear();
        if (dto.getMembers() != null) {
            for (CapacityPlanDto.MemberAllocationDto mDto : dto.getMembers()) {
                CapacityMemberAllocation alloc = CapacityMemberAllocation.builder()
                        .capacityPlan(plan)
                        .userId(mDto.getUserId())
                        .memberName(mDto.getName())
                        .memberRole(mDto.getRole())
                        .availableHours(mDto.getAvailableHours() != null ? mDto.getAvailableHours() : BigDecimal.ZERO)
                        .assignedHours(mDto.getAssignedHours() != null ? mDto.getAssignedHours() : BigDecimal.ZERO)
                        .build();
                plan.getMemberAllocations().add(alloc);
            }
        }

        CapacityPlan saved = capacityPlanRepository.save(plan);
        return CapacityPlanDto.from(saved);
    }

    // =========================================================================
    // 3. WEEKLY RETROSPECTIVE & REAL METRICS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<WeeklyRetrospectiveDto> getWeeklyRetrospectives(UUID projectId, UserPrincipal principal) {
        List<WeeklyRetrospective> retros;
        if (projectId != null) {
            retros = weeklyRetrospectiveRepository.findAllByProjectIdAndOrganizationIdOrderByCreatedAtDesc(projectId, principal.getOrganizationId());
        } else {
            retros = weeklyRetrospectiveRepository.findAllByOrganizationIdOrderByCreatedAtDesc(principal.getOrganizationId());
        }
        return retros.stream().map(WeeklyRetrospectiveDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WeeklyRetrospectiveDto getRetrospectiveMetrics(UUID projectId, UserPrincipal principal) {
        projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(projectId, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + projectId));

        List<Task> tasks = taskRepository.findAllByProjectIdOrderByPositionAsc(projectId);

        int committed = tasks.size();
        int accepted = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        int blocked = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.BLOCKED).count();
        int reviewPending = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();

        BigDecimal estHours = tasks.stream()
                .map(t -> t.getEstimateHours() != null ? t.getEstimateHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Horas reales acumuladas de tareas terminadas o estimadas
        BigDecimal actualHours = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .map(t -> t.getEstimateHours() != null ? t.getEstimateHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return WeeklyRetrospectiveDto.builder()
                .projectId(projectId)
                .weekLabel("Semana Actual — Sprint Operativo")
                .committedTasks(committed)
                .acceptedTasks(accepted)
                .blockedTasks(blocked)
                .reviewPendingTasks(reviewPending)
                .estimatedHours(estHours)
                .actualHours(actualHours)
                .improvements(new ArrayList<>())
                .build();
    }

    @Transactional
    public WeeklyRetrospectiveDto saveWeeklyRetrospective(WeeklyRetrospectiveDto dto, UserPrincipal principal) {
        if (dto.getImprovements() != null && dto.getImprovements().size() > 3) {
            throw new BadRequestException("MAX_3_MEJORAS", "La retrospectiva admite un máximo de 3 mejoras concretas según BOWOL Plans 2.0 (Fase 6.2)");
        }

        WeeklyRetrospective retro = WeeklyRetrospective.builder()
                .organizationId(principal.getOrganizationId())
                .projectId(dto.getProjectId())
                .sprintId(dto.getSprintId())
                .weekLabel(dto.getWeekLabel() != null ? dto.getWeekLabel() : "Semana Actual")
                .committedTasks(dto.getCommittedTasks() != null ? dto.getCommittedTasks() : 0)
                .acceptedTasks(dto.getAcceptedTasks() != null ? dto.getAcceptedTasks() : 0)
                .blockedTasks(dto.getBlockedTasks() != null ? dto.getBlockedTasks() : 0)
                .reviewPendingTasks(dto.getReviewPendingTasks() != null ? dto.getReviewPendingTasks() : 0)
                .estimatedHours(dto.getEstimatedHours() != null ? dto.getEstimatedHours() : BigDecimal.ZERO)
                .actualHours(dto.getActualHours() != null ? dto.getActualHours() : BigDecimal.ZERO)
                .businessMetricResult(dto.getBusinessMetricResult())
                .businessMetricDate(dto.getBusinessMetricDate())
                .whatWorked(dto.getWhatWorked())
                .delayCauses(dto.getDelayCauses())
                .improvements(dto.getImprovements() != null ? dto.getImprovements() : new ArrayList<>())
                .build();

        WeeklyRetrospective saved = weeklyRetrospectiveRepository.save(retro);
        return WeeklyRetrospectiveDto.from(saved);
    }

    // =========================================================================
    // 4. WEEKLY FOCUS BANNER
    // =========================================================================

    @Transactional(readOnly = true)
    public WeeklyFocusBannerDto getWeeklyFocusBanner(UUID projectId, UserPrincipal principal) {
        projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(projectId, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + projectId));

        return weeklyFocusBannerRepository.findByProjectIdAndOrganizationId(projectId, principal.getOrganizationId())
                .map(WeeklyFocusBannerDto::from)
                .orElse(null);
    }

    @Transactional
    public WeeklyFocusBannerDto saveWeeklyFocusBanner(UUID projectId, WeeklyFocusBannerDto dto, UserPrincipal principal) {
        projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(projectId, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + projectId));

        WeeklyFocusBanner banner = weeklyFocusBannerRepository.findByProjectIdAndOrganizationId(projectId, principal.getOrganizationId())
                .orElseGet(() -> WeeklyFocusBanner.builder()
                        .projectId(projectId)
                        .organizationId(principal.getOrganizationId())
                        .build());

        banner.setWeeklyDeliverable(dto.getWeeklyDeliverable() != null ? dto.getWeeklyDeliverable().trim() : "");
        banner.setIdentifiedRisk(dto.getIdentifiedRisk() != null ? dto.getIdentifiedRisk().trim() : "");
        banner.setMitigationPlan(dto.getMitigationPlan() != null ? dto.getMitigationPlan().trim() : "");

        WeeklyFocusBanner saved = weeklyFocusBannerRepository.save(banner);
        return WeeklyFocusBannerDto.from(saved);
    }

    // =========================================================================
    // 5. DAILY CHECK-INS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<DailyCheckinDto> getDailyCheckins(UUID projectId, UserPrincipal principal) {
        projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(projectId, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + projectId));

        return dailyCheckinRepository.findByProjectIdAndOrganizationIdOrderByDateDescCreatedAtDesc(projectId, principal.getOrganizationId())
                .stream().map(DailyCheckinDto::from).collect(Collectors.toList());
    }

    @Transactional
    public DailyCheckinDto createDailyCheckin(UUID projectId, DailyCheckinDto dto, UserPrincipal principal) {
        projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(projectId, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + projectId));

        DailyCheckin checkin = DailyCheckin.builder()
                .organizationId(principal.getOrganizationId())
                .projectId(projectId)
                .userId(principal.getId())
                .userName(dto.getUserName() != null && !dto.getUserName().isBlank() ? dto.getUserName().trim() : (principal.getName() != null ? principal.getName() : principal.getUsername()))
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .yesterdayDeliverable(dto.getYesterdayDeliverable() != null ? dto.getYesterdayDeliverable().trim() : "")
                .todayCommitment(dto.getTodayCommitment() != null ? dto.getTodayCommitment().trim() : "")
                .blockers(dto.getBlockers() != null ? dto.getBlockers().trim() : null)
                .hasBlocker(dto.getHasBlocker() != null ? dto.getHasBlocker() : false)
                .taskId(dto.getTaskId())
                .build();

        DailyCheckin saved = dailyCheckinRepository.save(checkin);
        return DailyCheckinDto.from(saved);
    }

    // =========================================================================
    // UTILS
    // =========================================================================

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
