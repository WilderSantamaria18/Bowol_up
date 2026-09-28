package com.bowol.experiment.dto;

import com.bowol.experiment.ExperimentStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateExperimentRequest {

    private String name;

    private String description;

    private String method;

    private LocalDate startDate;

    private LocalDate endDate;

    private ExperimentStatus status;

    private String ownerName;

    private java.math.BigDecimal budget;

    private String targetMetric;

    private String resultMetric;

    private String resultValue;

    private String conclusion;

    private String evidenceNotes;
}
