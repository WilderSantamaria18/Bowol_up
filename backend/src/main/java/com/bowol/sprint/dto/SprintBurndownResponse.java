package com.bowol.sprint.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintBurndownResponse {
    private UUID sprintId;
    private String sprintName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalEstimatedHours;
    private BigDecimal remainingHours;
    private List<BurndownPoint> dataPoints;
}
