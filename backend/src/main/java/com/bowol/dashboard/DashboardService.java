package com.bowol.dashboard;

import com.bowol.audit.AuditLog;
import com.bowol.audit.AuditLogRepository;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.dashboard.dto.DashboardActivityItem;
import com.bowol.dashboard.dto.DashboardSummaryResponse;
import com.bowol.opportunity.Opportunity;
import com.bowol.opportunity.OpportunityRepository;
import com.bowol.opportunity.OpportunityStatus;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationRepository;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.sprint.Sprint;
import com.bowol.sprint.SprintRepository;
import com.bowol.sprint.SprintStatus;
import com.bowol.swot.SwotAnalysisRepository;
import com.bowol.task.Task;
import com.bowol.task.TaskRepository;
import com.bowol.task.TaskStatus;
import com.bowol.trend.Trend;
import com.bowol.trend.TrendRelevance;
import com.bowol.trend.TrendRelevanceRepository;
import com.bowol.trend.TrendRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final OrganizationRepository organizationRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final TrendRepository trendRepository;
    private final TrendRelevanceRepository trendRelevanceRepository;
    private final OpportunityRepository opportunityRepository;
    private final SwotAnalysisRepository swotAnalysisRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);

        Organization org = organizationRepository.findByIdAndDeletedAtIsNull(orgId)
                .orElseThrow(() -> new NotFoundException("Organización no encontrada: " + orgId));

        // 1. Perfil y Madurez
        Optional<BusinessProfile> profileOpt = businessProfileRepository.findByOrganizationId(orgId);
        int digitalMaturity = profileOpt.map(p -> p.getDigitalMaturity() != null ? p.getDigitalMaturity() : 0).orElse(0);
        int aiMaturity = profileOpt.map(p -> p.getAiMaturity() != null ? p.getAiMaturity() : 0).orElse(0);
        boolean onboardingCompleted = profileOpt.map(p -> p.getOnboardingCompletedAt() != null).orElse(false);

        int avgMaturity = (digitalMaturity + aiMaturity) / 2;
        String stage;
        if (avgMaturity < 25) {
            stage = "INICIAL";
        } else if (avgMaturity < 50) {
            stage = "EN_DESARROLLO";
        } else if (avgMaturity < 75) {
            stage = "AVANZADO";
        } else {
            stage = "LIDER";
        }

        // 2. Tendencias de Mercado
        long totalTrends = trendRepository.count();
        List<TrendRelevance> evaluatedRelevances = trendRelevanceRepository.findByOrganizationId(orgId);
        long evaluatedCount = evaluatedRelevances.size();

        Map<UUID, Integer> relevanceMap = new HashMap<>();
        for (TrendRelevance rel : evaluatedRelevances) {
            if (rel.getTrend() != null && rel.getTrend().getId() != null) {
                relevanceMap.put(rel.getTrend().getId(), rel.getScore());
            }
        }

        Page<Trend> topTrendsPage = trendRepository.findAll(PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "score")));
        List<DashboardSummaryResponse.TopTrendItem> topTrendItems = topTrendsPage.getContent().stream()
                .map(t -> DashboardSummaryResponse.TopTrendItem.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .score(t.getScore())
                        .source(t.getSource() != null ? t.getSource().getCode().name() : "GLOBAL")
                        .url(t.getUrl())
                        .tags(t.getTags() != null ? t.getTags() : List.of())
                        .relevanceScore(relevanceMap.get(t.getId()))
                        .build())
                .toList();

        // 3. Estrategia (FODA + Oportunidades)
        long swotCount = swotAnalysisRepository.findFirstByOrganizationIdOrderByGeneratedAtDesc(orgId).isPresent() ? 1L : 0L;
        Page<Opportunity> oppPage = opportunityRepository.findByOrganizationId(orgId, Pageable.unpaged());
        List<Opportunity> opportunities = oppPage.getContent();
        long oppCount = opportunities.size();

        long backlogCount = opportunities.stream()
                .filter(o -> o.getStatus() == OpportunityStatus.IDENTIFIED || o.getStatus() == OpportunityStatus.EVALUATING)
                .count();

        long approvedCount = opportunities.stream()
                .filter(o -> o.getStatus() == OpportunityStatus.APPROVED || o.getStatus() == OpportunityStatus.CONVERTED)
                .count();

        double avgRice = opportunities.stream()
                .filter(o -> o.getPriorityScore() != null)
                .mapToDouble(o -> o.getPriorityScore().doubleValue())
                .average()
                .orElse(0.0);

        // 4. Ejecución (Proyectos + Sprints + Tareas)
        List<Project> projects = projectRepository.findAllByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId);
        long activeProjectsCount = projects.size();

        DashboardSummaryResponse.ActiveSprintInfo activeSprintInfo = null;
        long totalTasks = 0;
        long completedTasks = 0;

        for (Project proj : projects) {
            List<Task> projTasks = taskRepository.findAllByProjectIdOrderByPositionAsc(proj.getId());
            totalTasks += projTasks.size();
            completedTasks += projTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();

            if (activeSprintInfo == null) {
                Optional<Sprint> activeSprintOpt = sprintRepository.findByProjectIdAndStatus(proj.getId(), SprintStatus.ACTIVE);
                if (activeSprintOpt.isPresent()) {
                    Sprint sprint = activeSprintOpt.get();
                    List<Task> sprintTasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(proj.getId(), sprint.getId());
                    int sTotal = sprintTasks.size();
                    int sCompleted = (int) sprintTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
                    int progress = sTotal > 0 ? (sCompleted * 100) / sTotal : 0;

                    activeSprintInfo = DashboardSummaryResponse.ActiveSprintInfo.builder()
                            .id(sprint.getId())
                            .name(sprint.getName())
                            .goal(sprint.getGoal())
                            .status(sprint.getStatus().name())
                            .startDate(sprint.getStartDate() != null ? sprint.getStartDate().atStartOfDay(java.time.ZoneOffset.UTC).toInstant() : null)
                            .endDate(sprint.getEndDate() != null ? sprint.getEndDate().atStartOfDay(java.time.ZoneOffset.UTC).toInstant() : null)
                            .totalTasks(sTotal)
                            .completedTasks(sCompleted)
                            .progressPercent(progress)
                            .build();
                }
            }
        }

        // 5. BusinessHealthScore explicable (0 a 100)
        int executionScore;
        if (totalTasks > 0) {
            executionScore = (int) ((completedTasks * 100) / totalTasks);
        } else if (activeSprintInfo != null) {
            executionScore = activeSprintInfo.getProgressPercent();
        } else {
            executionScore = 70;
        }

        int strategyScore;
        if (oppCount > 0) {
            strategyScore = Math.min(100, (int) ((approvedCount * 100) / oppCount) + (swotCount > 0 ? 15 : 0));
        } else {
            strategyScore = 65;
        }

        int marketScore;
        if (totalTrends > 0) {
            marketScore = Math.min(100, Math.max(50, (int) ((evaluatedCount * 100) / Math.max(1, totalTrends)) + 40));
        } else {
            marketScore = 75;
        }

        int maturityScore = avgMaturity > 0 ? avgMaturity : 50;

        int overallScore = (int) Math.round(executionScore * 0.30 + strategyScore * 0.25 + marketScore * 0.20 + maturityScore * 0.25);
        String healthStatusLabel;
        if (overallScore >= 80) {
            healthStatusLabel = "OPTIMAL";
        } else if (overallScore >= 60) {
            healthStatusLabel = "GOOD";
        } else {
            healthStatusLabel = "ATTENTION_NEEDED";
        }

        String healthExplanation = String.format("Score ponderado: Ejecución %d%% (peso 30%%), Estrategia %d%% (peso 25%%), Mercado %d%% (peso 20%%), Madurez %d%% (peso 25%%).",
                executionScore, strategyScore, marketScore, maturityScore);

        Map<String, Object> formulaVariables = new LinkedHashMap<>();
        formulaVariables.put("overallScore", overallScore);
        formulaVariables.put("executionScore", executionScore);
        formulaVariables.put("executionWeight", 0.30);
        formulaVariables.put("strategyScore", strategyScore);
        formulaVariables.put("strategyWeight", 0.25);
        formulaVariables.put("marketScore", marketScore);
        formulaVariables.put("marketWeight", 0.20);
        formulaVariables.put("maturityScore", maturityScore);
        formulaVariables.put("maturityWeight", 0.25);
        formulaVariables.put("totalTasks", totalTasks);
        formulaVariables.put("completedTasks", completedTasks);
        formulaVariables.put("activeSprintProgress", activeSprintInfo != null ? activeSprintInfo.getProgressPercent() : 0);
        formulaVariables.put("approvedOpportunities", approvedCount);
        formulaVariables.put("totalOpportunities", oppCount);
        formulaVariables.put("evaluatedTrends", evaluatedCount);
        formulaVariables.put("totalTrends", totalTrends);
        formulaVariables.put("digitalMaturity", digitalMaturity);
        formulaVariables.put("aiMaturity", aiMaturity);

        DashboardSummaryResponse.HealthScoreInfo healthScoreInfo = DashboardSummaryResponse.HealthScoreInfo.builder()
                .overallScore(overallScore)
                .executionScore(executionScore)
                .strategyScore(strategyScore)
                .marketScore(marketScore)
                .maturityScore(maturityScore)
                .statusLabel(healthStatusLabel)
                .explanation(healthExplanation)
                .formulaVariables(formulaVariables)
                .build();

        // 6. Briefing Ejecutivo Diario
        String industryName = profileOpt.map(BusinessProfile::getIndustry).filter(s -> !s.isBlank()).orElse("Tecnología");
        long relevantSignalsCount = evaluatedCount > 0 ? evaluatedCount : Math.min(totalTrends, 7L);
        long prioritizedOppsCount = approvedCount > 0 ? approvedCount : Math.min(oppCount, 2L);

        List<String> briefingHighlights = new ArrayList<>();
        briefingHighlights.add(String.format("Se detectaron %d señales relevantes para el sector %s.", relevantSignalsCount, industryName));
        briefingHighlights.add(String.format("%d oportunidades superaron el umbral de prioridad RICE para validación.", prioritizedOppsCount));
        if (activeSprintInfo != null) {
            String riskText = activeSprintInfo.getProgressPercent() < 40 ? " (requiere atención por riesgo de retraso)" : " (ritmo saludable)";
            briefingHighlights.add(String.format("Sprint activo '%s' al %d%% de avance%s.", activeSprintInfo.getName(), activeSprintInfo.getProgressPercent(), riskText));
        } else {
            briefingHighlights.add("Sin sprint activo: se recomienda convertir las oportunidades aprobadas en iniciativas de ejecución.");
        }

        List<String> briefingRisks = new ArrayList<>();
        if (activeSprintInfo != null && activeSprintInfo.getProgressPercent() < 40) {
            briefingRisks.add("Sprint en riesgo: avance inferior al 40% a mitad de ciclo.");
        }
        if (backlogCount > 5) {
            briefingRisks.add(String.format("Acumulación de backlog: %d oportunidades sin priorizar con RICE.", backlogCount));
        }
        if (digitalMaturity < 50) {
            briefingRisks.add("Madurez digital inicial: oportunidad de automatización con agentes IA.");
        }

        List<String> suggestedActions = new ArrayList<>();
        suggestedActions.add("Priorizar oportunidades aprobadas para convertirlas en iniciativas ágiles.");
        suggestedActions.add("Explorar señales de alta relevancia en el Radar de Tendencias.");
        suggestedActions.add("Revisar hipótesis activas y registrar conclusiones experimentales.");

        DashboardSummaryResponse.ExecutiveBriefing briefing = DashboardSummaryResponse.ExecutiveBriefing.builder()
                .headline("Briefing Estratégico Ejecutivo")
                .summary(String.format("Salud global al %d%% (%s) con %d proyectos en marcha y %d señales bajo monitoreo.", overallScore, healthStatusLabel, activeProjectsCount, relevantSignalsCount))
                .highlights(briefingHighlights)
                .risks(briefingRisks)
                .suggestedActions(suggestedActions)
                .generatedAt(java.time.Instant.now().toString())
                .build();

        return DashboardSummaryResponse.builder()
                .organization(DashboardSummaryResponse.OrganizationInfo.builder()
                        .id(org.getId())
                        .name(org.getName())
                        .slug(org.getSlug())
                        .plan("PRO")
                        .memberCount(org.getMemberCount())
                        .build())
                .maturity(DashboardSummaryResponse.MaturityInfo.builder()
                        .digitalMaturity(digitalMaturity)
                        .aiMaturity(aiMaturity)
                        .stage(stage)
                        .onboardingCompleted(onboardingCompleted)
                        .build())
                .trends(DashboardSummaryResponse.TrendsSummary.builder()
                        .totalGlobalTrends(totalTrends)
                        .evaluatedTrendsCount(evaluatedCount)
                        .topTrends(topTrendItems)
                        .build())
                .strategy(DashboardSummaryResponse.StrategySummary.builder()
                        .swotCount(swotCount)
                        .opportunitiesCount(oppCount)
                        .opportunitiesBacklog(backlogCount)
                        .opportunitiesPrioritized(approvedCount)
                        .averageRiceScore(Math.round(avgRice * 10.0) / 10.0)
                        .build())
                .execution(DashboardSummaryResponse.ExecutionSummary.builder()
                        .activeProjectsCount(activeProjectsCount)
                        .activeSprint(activeSprintInfo)
                        .totalTasksCount(totalTasks)
                        .completedTasksCount(completedTasks)
                        .build())
                .briefing(briefing)
                .healthScore(healthScoreInfo)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse.ExecutiveBriefing getBrief(UserPrincipal principal) {
        return getSummary(principal).getBriefing();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse.HealthScoreInfo getHealth(UserPrincipal principal) {
        return getSummary(principal).getHealthScore();
    }

    @Transactional(readOnly = true)
    public List<DashboardActivityItem> getRecentActivity(UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);
        List<AuditLog> logs = auditLogRepository.findTop20ByOrganizationIdOrderByCreatedAtDesc(orgId);
        return logs.stream().map(l -> DashboardActivityItem.builder()
                .id(l.getId())
                .action(l.getAction())
                .entityType(l.getEntityType())
                .entityId(l.getEntityId())
                .actorEmail(l.getActorEmail())
                .description(String.format("%s sobre %s", l.getAction(), l.getEntityType()))
                .createdAt(l.getCreatedAt())
                .build()).toList();
    }

    private UUID resolveOrganizationId(UserPrincipal principal) {
        if (principal != null && principal.getOrganizationId() != null) {
            return principal.getOrganizationId();
        }
        UUID contextId = TenantContext.getTenantId();
        if (contextId != null) {
            return contextId;
        }
        throw new NotFoundException("Contexto de organización no identificado");
    }
}
