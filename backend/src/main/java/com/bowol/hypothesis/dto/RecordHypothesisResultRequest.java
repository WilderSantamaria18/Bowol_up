package com.bowol.hypothesis.dto;

import com.bowol.hypothesis.HypothesisResult;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordHypothesisResultRequest {

    @NotNull(message = "El resultado es obligatorio")
    private HypothesisResult result;

    private String resultNotes;
}
