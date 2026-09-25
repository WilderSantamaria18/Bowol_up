package com.bowol.swot.dto;

import com.bowol.swot.EvidenceRef;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceRefResponse {
    private Long id;
    private UUID organizationId;
    private String entityType;
    private UUID entityId;
    private UUID trendId;
    private String trendTitle;
    private Integer trendScore;
    private String trendSource;
    private String note;
    private Integer weight;
    private Instant createdAt;

    public static EvidenceRefResponse from(EvidenceRef ref) {
        if (ref == null) return null;
        return EvidenceRefResponse.builder()
                .id(ref.getId())
                .organizationId(ref.getOrganizationId())
                .entityType(ref.getEntityType())
                .entityId(ref.getEntityId())
                .trendId(ref.getTrend() != null ? ref.getTrend().getId() : null)
                .trendTitle(ref.getTrend() != null ? ref.getTrend().getTitle() : null)
                .trendScore(ref.getTrend() != null ? ref.getTrend().getScore() : null)
                .trendSource(ref.getTrend() != null && ref.getTrend().getSource() != null ? ref.getTrend().getSource().getName() : null)
                .note(ref.getNote())
                .weight(ref.getWeight())
                .createdAt(ref.getCreatedAt())
                .build();
    }
}
