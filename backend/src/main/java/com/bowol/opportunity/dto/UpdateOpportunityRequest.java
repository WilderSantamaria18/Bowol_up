package com.bowol.opportunity.dto;

import com.bowol.opportunity.OpportunityStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOpportunityRequest {
    private String title;
    private String description;

    @Min(0) @Max(100)
    private Integer reachScore;

    @Min(0) @Max(100)
    private Integer impactScore;

    @Min(0) @Max(100)
    private Integer confidenceScore;

    @Min(1) @Max(100)
    private Integer effortScore;

    private OpportunityStatus status;
    private List<String> evidence;
}
