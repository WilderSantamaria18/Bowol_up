package com.bowol.opportunity.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOpportunityRequest {

    @NotBlank(message = "El título de la oportunidad es obligatorio")
    private String title;

    private String description;

    private UUID swotAnalysisId;

    @Min(value = 0, message = "reachScore debe ser mayor o igual a 0")
    @Max(value = 100, message = "reachScore debe ser menor o igual a 100")
    private Integer reachScore;

    @Min(value = 0, message = "impactScore debe ser mayor o igual a 0")
    @Max(value = 100, message = "impactScore debe ser menor o igual a 100")
    private Integer impactScore;

    @Min(value = 0, message = "confidenceScore debe ser mayor o igual a 0")
    @Max(value = 100, message = "confidenceScore debe ser menor o igual a 100")
    private Integer confidenceScore;

    @Min(value = 1, message = "effortScore debe ser mayor o igual a 1")
    @Max(value = 100, message = "effortScore debe ser menor o igual a 100")
    private Integer effortScore;

    @Builder.Default
    private List<String> evidence = new ArrayList<>();
}
