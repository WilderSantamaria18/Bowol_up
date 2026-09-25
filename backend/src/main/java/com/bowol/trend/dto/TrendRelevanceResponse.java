package com.bowol.trend.dto;

import com.bowol.trend.TrendRelevance;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendRelevanceResponse {

    private UUID id;
    private UUID organizationId;
    private TrendResponse trend;
    private Integer score;
    private String aiSummary;
    private List<String> tags;
    private Instant evaluatedAt;
    private String strategicAlignment;
    private List<String> recommendedActions;
    private Integer tokensUsed;

    public static TrendRelevanceResponse from(TrendRelevance rel) {
        TrendRelevanceResponse resp = new TrendRelevanceResponse();
        resp.setId(rel.getId());
        resp.setOrganizationId(rel.getOrganizationId());
        if (rel.getTrend() != null) {
            resp.setTrend(TrendResponse.from(rel.getTrend(), Optional.of(rel)));
        }
        resp.setScore(rel.getScore());
        resp.setAiSummary(rel.getAiSummary());
        resp.setTags(rel.getTags() != null ? rel.getTags() : List.of());
        resp.setEvaluatedAt(rel.getEvaluatedAt());
        return resp;
    }
}
