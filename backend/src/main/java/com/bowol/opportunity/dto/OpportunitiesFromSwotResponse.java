package com.bowol.opportunity.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpportunitiesFromSwotResponse {
    private int generated;
    private List<OpportunityResponse> opportunities;
}
