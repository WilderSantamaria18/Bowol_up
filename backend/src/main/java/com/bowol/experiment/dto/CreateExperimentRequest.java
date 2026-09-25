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

    private String method;

    private LocalDate startDate;

    private LocalDate endDate;

    private ExperimentStatus status;

    private String resultMetric;

    private String resultValue;
}
