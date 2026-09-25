package com.bowol.social.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedSocialContentResponse {

    private String topic;
    @Builder.Default
    private List<SocialPostProposal> proposals = new ArrayList<>();
}
