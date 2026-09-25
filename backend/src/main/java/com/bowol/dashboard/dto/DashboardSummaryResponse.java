package com.bowol.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private OrganizationInfo organization;
    private MaturityInfo maturity;
    private TrendsSummary trends;
    private StrategySummary strategy;
    private ExecutionSummary execution;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrganizationInfo {
        private UUID id;
        private String name;
        private String slug;
        private String plan;
        private Integer memberCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MaturityInfo {
        private Integer digitalMaturity;
        private Integer aiMaturity;
        private String stage;
        private boolean onboardingCompleted;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendsSummary {
        private long totalGlobalTrends;
        private long evaluatedTrendsCount;
        private List<TopTrendItem> topTrends;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopTrendItem {
        private UUID id;
        private String title;
        private Integer score;
        private String source;
        private String url;
        private List<String> tags;
        private Integer relevanceScore;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StrategySummary {
        private long swotCount;
        private long opportunitiesCount;
        private long opportunitiesBacklog;
        private long opportunitiesPrioritized;
        private double averageRiceScore;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExecutionSummary {
        private long activeProjectsCount;
        private ActiveSprintInfo activeSprint;
        private long totalTasksCount;
        private long completedTasksCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActiveSprintInfo {
        private UUID id;
        private String name;
        private String goal;
        private String status;
        private Instant startDate;
        private Instant endDate;
        private int totalTasks;
        private int completedTasks;
        private int progressPercent;
    }
}
