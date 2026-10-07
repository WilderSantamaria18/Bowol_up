package com.bowol.planning.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanningValidationResult {
    private boolean valid;

    @Builder.Default
    private List<String> blockingIssues = new ArrayList<>();

    @Builder.Default
    private List<String> warnings = new ArrayList<>();

    private BigDecimal totalEstimatedHours;
    private int totalTasks;
    private int tasksOverSixHours;
    private int tasksWithoutAcceptanceCriteria;
}
