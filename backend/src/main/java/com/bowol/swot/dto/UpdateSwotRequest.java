package com.bowol.swot.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSwotRequest {
    private List<SwotItem> strengths;
    private List<SwotItem> weaknesses;
    private List<SwotItem> opportunities;
    private List<SwotItem> threats;
    private String summary;
}
