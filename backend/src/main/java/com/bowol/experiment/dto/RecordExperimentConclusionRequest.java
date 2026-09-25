package com.bowol.experiment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordExperimentConclusionRequest {

    @NotBlank(message = "La conclusión del experimento es obligatoria")
    private String conclusion;

    private String resultMetric;

    private String resultValue;
}
