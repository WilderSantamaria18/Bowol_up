package com.bowol.task.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecomposeProjectResponse {
    private String epicTitle;
    private String epicObjective;
    private BigDecimal totalEstimatedHours;
    private int generatedTasksCount;
    private List<TaskResponse> tasks;
}
