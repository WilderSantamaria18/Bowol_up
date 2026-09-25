package com.bowol.project.dto;

import com.bowol.project.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProjectRequest {

    @NotBlank(message = "El nombre del proyecto es obligatorio")
    private String name;

    private String description;

    private UUID opportunityId;

    private UUID experimentId;

    private ProjectStatus status;

    private LocalDate startDate;

    private LocalDate endDate;
}
