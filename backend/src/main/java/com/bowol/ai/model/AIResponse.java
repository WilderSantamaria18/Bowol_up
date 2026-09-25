package com.bowol.ai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Duration;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIResponse {

    private String content;
    private String provider;
    private String model;
    private Integer promptTokens;
    private Integer completionTokens;
    private BigDecimal costUsd;
    private String finishReason;
    private Duration latency;
}
