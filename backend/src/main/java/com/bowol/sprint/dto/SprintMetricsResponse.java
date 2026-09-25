package com.bowol.sprint.dto;

import com.bowol.sprint.SprintStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintMetricsResponse {
    private UUID sprintId;
    private String sprintName;
    private SprintStatus status;
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer inProgressTasks;
    private Integer todoTasks;
    private Double completionRate;
    private BigDecimal totalEstimateHours;
    private BigDecimal completedEstimateHours;
    private Double averageCycleTimeHours;
}
