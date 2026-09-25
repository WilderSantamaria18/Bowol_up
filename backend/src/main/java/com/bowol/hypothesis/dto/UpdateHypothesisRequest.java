package com.bowol.hypothesis.dto;

import com.bowol.hypothesis.HypothesisStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateHypothesisRequest {

    private String statement;

    private String validationMethod;

    private String successMetric;

    private String targetValue;

    private HypothesisStatus status;
}
