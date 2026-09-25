package com.bowol.social.dto;

import com.bowol.social.SocialChannel;
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
public class UpdateSocialPostRequest {

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
}
