package com.bowol.developer;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimiterServiceTests {

    private final RateLimiterService rateLimiterService = new RateLimiterService();

    @Test
    @DisplayName("Debe aplicar límites correctos según el plan del tenant")
    void testLimitsByPlan() {
        assertThat(rateLimiterService.getLimitForPlan("FREE")).isEqualTo(60);
        assertThat(rateLimiterService.getLimitForPlan("PRO")).isEqualTo(1000);
        assertThat(rateLimiterService.getLimitForPlan("BUSINESS")).isEqualTo(10000);
    }

    @Test
    @DisplayName("Debe permitir consumo dentro del límite de tokens")
    void testConsumeTokens() {
        UUID orgId = UUID.randomUUID();

        RateLimiterService.RateLimitResult result = rateLimiterService.checkLimit(orgId, "PRO");
        assertThat(result.isAllowed()).isTrue();
        assertThat(result.getLimit()).isEqualTo(1000);
        assertThat(result.getRemaining()).isLessThan(1000);
    }
}
