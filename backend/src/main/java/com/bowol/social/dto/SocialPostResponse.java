package com.bowol.social.dto;

import com.bowol.social.SocialChannel;
import com.bowol.social.SocialPost;
import com.bowol.social.SocialPostStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialPostResponse {

    private UUID id;
    private UUID organizationId;
    private UUID projectId;
    private UUID opportunityId;
    private SocialChannel channel;
    private String title;
    private String content;
    private SocialPostStatus status;
    private Instant scheduledAt;
    private Instant publishedAt;
    private PredictedImpact predictedImpact;
    private List<String> mediaUrls;
    private List<String> tags;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;

    public static SocialPostResponse fromEntity(SocialPost entity) {
        if (entity == null) return null;
        return SocialPostResponse.builder()
                .id(entity.getId())
                .organizationId(entity.getOrganizationId())
                .projectId(entity.getProjectId())
                .opportunityId(entity.getOpportunityId())
                .channel(entity.getChannel())
                .title(entity.getTitle())
                .content(entity.getContent())
                .status(entity.getStatus())
                .scheduledAt(entity.getScheduledAt())
                .publishedAt(entity.getPublishedAt())
                .predictedImpact(entity.getPredictedImpact())
                .mediaUrls(entity.getMediaUrls())
                .tags(entity.getTags())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
