package com.bowol.planning.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanningImportResponse {
    private UUID projectId;
    private String projectName;
    private int importedTasksCount;
    private BigDecimal totalEstimatedHours;

    @Builder.Default
    private List<UUID> createdTaskIds = new ArrayList<>();

    @Builder.Default
    private List<String> warnings = new ArrayList<>();
}
