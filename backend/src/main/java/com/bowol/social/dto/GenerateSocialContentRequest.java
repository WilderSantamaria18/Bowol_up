package com.bowol.social.dto;

import com.bowol.social.SocialChannel;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateSocialContentRequest {

    private UUID projectId;
    private UUID opportunityId;

    @NotBlank(message = "El tema o idea central es obligatorio")
    private String topic;

    private List<SocialChannel> channels;

    private String customInstructions;
}
