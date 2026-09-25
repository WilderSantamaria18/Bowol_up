package com.bowol.social.dto;

import com.bowol.social.SocialChannel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialPostProposal {

    private SocialChannel channel;
    private String title;
    private String content;
    private List<String> tags;
    private PredictedImpact predictedImpact;
}
