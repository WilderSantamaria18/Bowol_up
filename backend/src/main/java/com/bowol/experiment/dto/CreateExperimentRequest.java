package com.bowol.experiment.dto;

import com.bowol.experiment.ExperimentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateExperimentRequest {

    @NotNull(message = "El id de la hipótesis es obligatorio")
    private UUID hypothesisId;

    @NotBlank(message = "El nombre del experimento es obligatorio")
    private String name;

    private String description;

    @NotBlank(message = "El método del experimento es obligatorio")
    private String method;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate startDate;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate endDate;

    private ExperimentStatus status;

    private String ownerName;

    private java.math.BigDecimal budget;

    @NotBlank(message = "La métrica objetivo es obligatoria")
    private String targetMetric;

    private String resultMetric;

    private String resultValue;

    private String evidenceNotes;
}
