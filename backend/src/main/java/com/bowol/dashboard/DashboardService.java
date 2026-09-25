package com.bowol.dashboard;

import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
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
                .build();
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
