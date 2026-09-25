package com.bowol.swot.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateSwotRequest {
    @Builder.Default
    private Boolean includeTrends = true;
    @Builder.Default
    private Integer maxTrends = 20;
    private String aiProvider;
}
