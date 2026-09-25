package com.bowol.ai;

import com.bowol.ai.model.AIModel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class AIModelCostCalculationTests {

    @Test
    @DisplayName("GPT-4o-mini computes correct low-cost token pricing")
    void testGpt4oMiniPricing() {
        // 1,000 prompt tokens + 500 completion tokens
        // prompt: 1000 * 0.15 / 1,000,000 = 0.00015
        // completion: 500 * 0.60 / 1,000,000 = 0.00030
        // total: 0.000450 USD
        BigDecimal cost = AIModel.GPT_4O_MINI.calculateCost(1000, 500);
        assertThat(cost).isEqualByComparingTo("0.000450");
    }

    @Test
    @DisplayName("GPT-4o computes accurate high-tier pricing")
    void testGpt4oPricing() {
        // 2000 prompt tokens + 1000 completion tokens
        // prompt: 2000 * 2.50 / 1,000,000 = 0.005
        // completion: 1000 * 10.00 / 1,000,000 = 0.010
        // total = 0.015000 USD
        BigDecimal cost = AIModel.GPT_4O.calculateCost(2000, 1000);
        assertThat(cost).isEqualByComparingTo("0.015000");
    }

    @Test
    @DisplayName("Mock model has zero cost")
    void testMockPricing() {
        BigDecimal cost = AIModel.MOCK.calculateCost(50000, 20000);
        assertThat(cost).isEqualByComparingTo("0.000000");
    }

    @Test
    @DisplayName("fromCode returns matching model or defaults safely to GPT_4O_MINI")
    void testFromCode() {
        assertThat(AIModel.fromCode("gpt-4o")).isEqualTo(AIModel.GPT_4O);
        assertThat(AIModel.fromCode("claude-3-5-sonnet")).isEqualTo(AIModel.CLAUDE_3_5_SONNET);
        assertThat(AIModel.fromCode("non-existent")).isEqualTo(AIModel.GPT_4O_MINI);
        assertThat(AIModel.fromCode(null)).isEqualTo(AIModel.GPT_4O_MINI);
    }
}
