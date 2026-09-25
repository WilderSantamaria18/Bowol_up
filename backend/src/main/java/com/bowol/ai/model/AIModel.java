package com.bowol.ai.model;

import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Getter
public enum AIModel {

    GPT_4O("gpt-4o", "openai", new BigDecimal("2.50"), new BigDecimal("10.00"), 128000),
    GPT_4O_MINI("gpt-4o-mini", "openai", new BigDecimal("0.15"), new BigDecimal("0.60"), 128000),
    CLAUDE_3_5_SONNET("claude-3-5-sonnet", "anthropic", new BigDecimal("3.00"), new BigDecimal("15.00"), 200000),
    CLAUDE_3_5_HAIKU("claude-3-5-haiku", "anthropic", new BigDecimal("0.80"), new BigDecimal("4.00"), 200000),
    MOCK("mock-model", "mock", BigDecimal.ZERO, BigDecimal.ZERO, 32000);

    private final String code;
    private final String provider;
    private final BigDecimal inputCostPerMillion;
    private final BigDecimal outputCostPerMillion;
    private final int contextWindow;

    AIModel(String code, String provider, BigDecimal inputCostPerMillion, BigDecimal outputCostPerMillion, int contextWindow) {
        this.code = code;
        this.provider = provider;
        this.inputCostPerMillion = inputCostPerMillion;
        this.outputCostPerMillion = outputCostPerMillion;
        this.contextWindow = contextWindow;
    }

    public static AIModel fromCode(String code) {
        if (code == null) return GPT_4O_MINI;
        for (AIModel model : values()) {
            if (model.code.equalsIgnoreCase(code.trim())) {
                return model;
            }
        }
        return GPT_4O_MINI;
    }

    public BigDecimal calculateCost(int promptTokens, int completionTokens) {
        BigDecimal promptCost = inputCostPerMillion
                .multiply(BigDecimal.valueOf(promptTokens))
                .divide(BigDecimal.valueOf(1_000_000), 8, RoundingMode.HALF_UP);

        BigDecimal completionCost = outputCostPerMillion
                .multiply(BigDecimal.valueOf(completionTokens))
                .divide(BigDecimal.valueOf(1_000_000), 8, RoundingMode.HALF_UP);

        return promptCost.add(completionCost).setScale(6, RoundingMode.HALF_UP);
    }
}
