package com.bowol.hypothesis.dto;

import com.bowol.hypothesis.HypothesisStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateHypothesisRequest {

    @NotNull(message = "El id de la oportunidad es obligatorio")
    private UUID opportunityId;

    @NotBlank(message = "La formulación de la hipótesis es obligatoria")
    private String statement;

    private String targetSegment;

    private String problemStatement;

    private String solutionProposal;

    private String expectedOutcome;

    @NotBlank(message = "El método de validación es obligatorio")
    private String validationMethod;

    @NotBlank(message = "La métrica de éxito es obligatoria")
    private String successMetric;

    @NotBlank(message = "El umbral objetivo es obligatorio")
    private String targetValue;

    private HypothesisStatus status;
}
