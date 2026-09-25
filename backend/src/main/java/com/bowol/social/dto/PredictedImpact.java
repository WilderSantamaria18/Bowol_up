package com.bowol.social.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictedImpact {

    private Integer reachEstimateMin;
    private Integer reachEstimateMax;
    private Double engagementRate;
    private Integer viralityScore;
    private String sentiment;
    private String bestTimeToPost;
    private String strategicReasoning;
}
