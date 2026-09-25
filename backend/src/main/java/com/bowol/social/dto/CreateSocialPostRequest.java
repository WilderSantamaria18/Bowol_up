package com.bowol.social.dto;

import com.bowol.social.SocialChannel;
import com.bowol.social.SocialPostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateSocialPostRequest {

    private UUID projectId;
    private UUID opportunityId;

    @NotNull(message = "El canal social es obligatorio")
    private SocialChannel channel;

    @NotBlank(message = "El título de la publicación es obligatorio")
    private String title;

    @NotBlank(message = "El contenido o copy no puede estar vacío")
    private String content;

    @Builder.Default
    private SocialPostStatus status = SocialPostStatus.DRAFT;

    private Instant scheduledAt;
    private PredictedImpact predictedImpact;
    private List<String> mediaUrls;
    private List<String> tags;
}
