package com.bowol.experiment.dto;

import com.bowol.experiment.ExperimentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateExperimentStatusRequest {

    @NotNull(message = "El nuevo estado del experimento es obligatorio")
    private ExperimentStatus status;
}
