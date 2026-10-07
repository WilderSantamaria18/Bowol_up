package com.bowol.planning.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanningImportRequest {
    @Builder.Default
    private String schemaVersion = "bowol-planning-guide-2.0";

    @NotNull(message = "El proyecto es requerido")
    private ProjectPlanDto project;

    @Builder.Default
    private List<String> assumptions = new ArrayList<>();

    @NotNull(message = "La lista de tareas es requerida")
    @Builder.Default
    private List<TaskPlanDto> tasks = new ArrayList<>();
}
