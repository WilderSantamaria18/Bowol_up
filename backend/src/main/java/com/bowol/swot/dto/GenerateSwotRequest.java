package com.bowol.swot.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
    @Min(value = 1, message = "El máximo de tendencias debe ser al menos 1")
    @Max(value = 50, message = "El máximo de tendencias no puede exceder 50")
    private Integer maxTrends = 20;
    private String aiProvider;
}
