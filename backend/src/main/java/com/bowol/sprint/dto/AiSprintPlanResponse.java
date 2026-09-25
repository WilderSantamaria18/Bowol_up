package com.bowol.sprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSprintPlanResponse {
    private String sprintName;
    private String sprintGoal;
    private List<UUID> recommendedTaskIds;
    private List<String> recommendedTaskTitles;
    private Integer suggestedDurationDays;
    private BigDecimal totalEstimatedHours;
    private String rationale;
}
