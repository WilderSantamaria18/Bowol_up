package com.bowol.trend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarkRelevantRequest {

    @Min(0)
    @Max(100)
    private Integer score;

    private String aiSummary;

    @Builder.Default
    private List<String> tags = new ArrayList<>();
}
