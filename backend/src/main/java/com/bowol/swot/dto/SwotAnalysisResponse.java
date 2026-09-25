package com.bowol.swot.dto;

import com.bowol.swot.SwotAnalysis;
import lombok.*;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SwotAnalysisResponse {
    private UUID id;
    private UUID organizationId;
    private UUID businessProfileId;
    private Map<String, Object> profileSnapshot;
    private List<SwotItem> strengths;
    private List<SwotItem> weaknesses;
    private List<SwotItem> opportunities;
    private List<SwotItem> threats;
    private String summary;
    private String aiProvider;
    private String aiModelUsed;
    private Instant generatedAt;
    private Instant createdAt;

    public static SwotAnalysisResponse from(SwotAnalysis entity) {
        if (entity == null) return null;
        return SwotAnalysisResponse.builder()
                .id(entity.getId())
                .organizationId(entity.getOrganizationId())
                .businessProfileId(entity.getBusinessProfileId())
                .profileSnapshot(entity.getProfileSnapshot())
                .strengths(entity.getStrengths() != null ? new ArrayList<>(entity.getStrengths()) : new ArrayList<>())
                .weaknesses(entity.getWeaknesses() != null ? new ArrayList<>(entity.getWeaknesses()) : new ArrayList<>())
                .opportunities(entity.getOpportunities() != null ? new ArrayList<>(entity.getOpportunities()) : new ArrayList<>())
                .threats(entity.getThreats() != null ? new ArrayList<>(entity.getThreats()) : new ArrayList<>())
                .summary(entity.getSummaryText())
                .aiProvider(entity.getAiProvider())
                .aiModelUsed(entity.getAiModelUsed())
                .generatedAt(entity.getGeneratedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
