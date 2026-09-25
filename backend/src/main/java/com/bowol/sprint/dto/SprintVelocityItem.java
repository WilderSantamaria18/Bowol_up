package com.bowol.sprint.dto;

import com.bowol.sprint.SprintStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintVelocityItem {
    private UUID sprintId;
    private String sprintName;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private BigDecimal committedHours;
    private BigDecimal completedHours;
    private Integer totalTasks;
    private Integer completedTasks;
    private Double completionRate;
}
