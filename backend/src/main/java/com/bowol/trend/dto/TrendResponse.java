package com.bowol.trend.dto;

import com.bowol.source.TrendSourceCode;
import com.bowol.trend.Trend;
import com.bowol.trend.TrendRelevance;
import lombok.*;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendResponse {

    private UUID id;
    private TrendSourceCode sourceCode;
    private String sourceName;
    private String externalId;
    private String title;
    private String description;
    private String url;
    private Integer score;
    private List<String> tags;
    private Map<String, Object> metadata;
    private Instant fetchedAt;
    private Instant createdAt;
    private boolean isRelevantForTenant;
    private Integer relevanceScore;
    private String relevanceSummary;

    public static TrendResponse from(Trend trend, Optional<TrendRelevance> relevanceOpt) {
        TrendResponse resp = new TrendResponse();
        resp.setId(trend.getId());
        if (trend.getSource() != null) {
            resp.setSourceCode(trend.getSource().getCode());
            resp.setSourceName(trend.getSource().getName());
        }
        resp.setExternalId(trend.getExternalId());
        resp.setTitle(trend.getTitle());
        resp.setDescription(trend.getDescription());
        resp.setUrl(trend.getUrl());
        resp.setScore(trend.getScore());
        resp.setTags(trend.getTags() != null ? trend.getTags() : List.of());
        resp.setMetadata(trend.getMetadata() != null ? trend.getMetadata() : Map.of());
        resp.setFetchedAt(trend.getFetchedAt());
        resp.setCreatedAt(trend.getCreatedAt());

        if (relevanceOpt != null && relevanceOpt.isPresent()) {
            TrendRelevance rel = relevanceOpt.get();
            resp.setRelevantForTenant(true);
            resp.setRelevanceScore(rel.getScore());
            resp.setRelevanceSummary(rel.getAiSummary());
        } else {
            resp.setRelevantForTenant(false);
            resp.setRelevanceScore(null);
            resp.setRelevanceSummary(null);
        }
        return resp;
    }
}
