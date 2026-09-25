package com.bowol.opportunity.dto;

import com.bowol.opportunity.Opportunity;
import com.bowol.opportunity.OpportunityStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpportunityResponse {
    private UUID id;
    private UUID organizationId;
    private UUID swotAnalysisId;
    private String title;
    private String description;
    private Integer reachScore;
    private Integer impactScore;
    private Integer confidenceScore;
    private Integer effortScore;
    private BigDecimal priorityScore;
    private OpportunityStatus status;
    private List<String> evidence;
    private Instant createdAt;
    private Instant updatedAt;

    public static OpportunityResponse from(Opportunity opp) {
        if (opp == null) return null;
        return OpportunityResponse.builder()
                .id(opp.getId())
                .organizationId(opp.getOrganizationId())
                .swotAnalysisId(opp.getSwotAnalysisId())
                .title(opp.getTitle())
                .description(opp.getDescription())
                .reachScore(opp.getReachScore())
                .impactScore(opp.getImpactScore())
                .confidenceScore(opp.getConfidenceScore())
                .effortScore(opp.getEffortScore())
                .priorityScore(opp.getPriorityScore())
                .status(opp.getStatus())
                .evidence(opp.getEvidence())
                .createdAt(opp.getCreatedAt())
                .updatedAt(opp.getUpdatedAt())
                .build();
    }
}
