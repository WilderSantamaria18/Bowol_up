package com.bowol.swot.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.Instant;
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

    @JsonAlias({"statement"})
    @JsonProperty("text")
    private String text;

    private String type; // STRENGTHS, WEAKNESSES, OPPORTUNITIES, THREATS

    @Builder.Default
    private List<String> evidenceIds = new ArrayList<>();

    @Builder.Default
    private String confidence = "HIGH"; // HIGH, MEDIUM, LOW

    @Builder.Default
    private String impact = "HIGH"; // HIGH, MEDIUM, LOW

    @Builder.Default
    private String source = "INTERNAL_PROFILE"; // INTERNAL_PROFILE, TREND_RADAR, USER

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, CONVERTED, DISMISSED

    @Builder.Default
    private Instant createdAt = Instant.now();

    public String getStatement() {
        return text;
    }

    public void setStatement(String statement) {
        this.text = statement;
    }

    public static SwotItem of(String text) {
        return SwotItem.builder()
                .id(UUID.randomUUID().toString())
                .text(text)
                .evidenceIds(new ArrayList<>())
                .confidence("HIGH")
                .impact("HIGH")
                .source("INTERNAL_PROFILE")
                .status("ACTIVE")
                .createdAt(Instant.now())
                .build();
    }

    public static SwotItem of(String text, List<String> evidenceIds) {
        return SwotItem.builder()
                .id(UUID.randomUUID().toString())
                .text(text)
                .evidenceIds(evidenceIds != null ? new ArrayList<>(evidenceIds) : new ArrayList<>())
                .confidence("HIGH")
                .impact("HIGH")
                .source("TREND_RADAR")
                .status("ACTIVE")
                .createdAt(Instant.now())
                .build();
    }
}

