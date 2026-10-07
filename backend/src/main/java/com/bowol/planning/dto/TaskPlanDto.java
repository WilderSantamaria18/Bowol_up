package com.bowol.planning.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskPlanDto {
    private String id; // Ej: T-001
    private String title;
    private String description;
    private String area; // Operaciones, Ventas, Marketing, etc.
    private String status; // TODO, IN_PROGRESS, BLOCKED, DONE
    private BigDecimal estimatedHours;
    private String assignedRole;
    private UUID assignedPerson;
    private String deliverable;

    @Builder.Default
    private List<String> acceptanceCriteria = new ArrayList<>();

    @Builder.Default
    private List<String> dependsOn = new ArrayList<>();

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    private PrioritizationDto prioritization;
}
