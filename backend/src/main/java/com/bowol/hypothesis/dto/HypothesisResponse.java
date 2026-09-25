package com.bowol.hypothesis.dto;

import com.bowol.hypothesis.Hypothesis;
import com.bowol.hypothesis.HypothesisResult;
import com.bowol.hypothesis.HypothesisStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HypothesisResponse {
    private UUID id;
    private UUID organizationId;
    private UUID opportunityId;
    private String statement;
    private String validationMethod;
    private String successMetric;
    private String targetValue;
    private HypothesisStatus status;
    private HypothesisResult result;
    private String resultNotes;
    private Instant validatedAt;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;

    public static HypothesisResponse from(Hypothesis h) {
        if (h == null) return null;
        return HypothesisResponse.builder()
                .id(h.getId())
                .organizationId(h.getOrganizationId())
                .opportunityId(h.getOpportunityId())
                .statement(h.getStatement())
                .validationMethod(h.getValidationMethod())
                .successMetric(h.getSuccessMetric())
                .targetValue(h.getTargetValue())
                .status(h.getStatus())
                .result(h.getResult())
                .resultNotes(h.getResultNotes())
                .validatedAt(h.getValidatedAt())
                .createdBy(h.getCreatedBy())
                .createdAt(h.getCreatedAt())
                .updatedAt(h.getUpdatedAt())
                .build();
    }
}
