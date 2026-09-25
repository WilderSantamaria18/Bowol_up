package com.bowol.swot.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SwotItem {
    private String id;
    private String text;
    @Builder.Default
    private List<String> evidenceIds = new ArrayList<>();

    public static SwotItem of(String text) {
        return SwotItem.builder()
                .id(UUID.randomUUID().toString())
                .text(text)
                .evidenceIds(new ArrayList<>())
                .build();
    }

    public static SwotItem of(String text, List<String> evidenceIds) {
        return SwotItem.builder()
                .id(UUID.randomUUID().toString())
                .text(text)
                .evidenceIds(evidenceIds != null ? new ArrayList<>(evidenceIds) : new ArrayList<>())
                .build();
    }
}
