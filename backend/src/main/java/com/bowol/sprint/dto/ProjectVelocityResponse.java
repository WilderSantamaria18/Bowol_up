package com.bowol.sprint.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectVelocityResponse {
    private UUID projectId;
    private BigDecimal averageVelocityHours;
    private Double averageCompletionRate;
    private List<SprintVelocityItem> history;
}
