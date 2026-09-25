package com.bowol.experiment.dto;

import com.bowol.experiment.Experiment;
import com.bowol.experiment.ExperimentStatus;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperimentResponse {
    private UUID id;
    private UUID organizationId;
    private UUID hypothesisId;
    private String name;
    private String description;
    private String method;
    private LocalDate startDate;
    private LocalDate endDate;
    private ExperimentStatus status;
    private String resultMetric;
    private String resultValue;
    private String conclusion;
    private Instant createdAt;
    private Instant updatedAt;

    public static ExperimentResponse from(Experiment e) {
        if (e == null) return null;
        return ExperimentResponse.builder()
                .id(e.getId())
                .organizationId(e.getOrganizationId())
                .hypothesisId(e.getHypothesisId())
                .name(e.getName())
                .description(e.getDescription())
                .method(e.getMethod())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .status(e.getStatus())
                .resultMetric(e.getResultMetric())
                .resultValue(e.getResultValue())
                .conclusion(e.getConclusion())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
