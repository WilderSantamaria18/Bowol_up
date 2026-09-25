package com.bowol.ai;

import com.bowol.ai.audit.AIAuditService;
import com.bowol.ai.audit.AIUsageLog;
import com.bowol.ai.audit.AIUsageLogRepository;
import com.bowol.ai.model.AIResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AIAuditServiceTests {

    @Autowired
    private AIAuditService aiAuditService;

    @Autowired
    private AIUsageLogRepository usageLogRepository;

    @BeforeEach
    void setUp() {
        usageLogRepository.deleteAll();
    }

    @Test
    @DisplayName("Logs AI token usage and cost correctly in database")
    void testLogUsage() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        AIResponse response = AIResponse.builder()
                .content("Test content")
                .provider("mock")
                .model("gpt-4o-mini")
                .promptTokens(120)
                .completionTokens(80)
                .costUsd(new BigDecimal("0.000066"))
                .latency(Duration.ofMillis(145))
                .build();

        AIUsageLog log = aiAuditService.logUsage(
                orgId,
                userId,
                "TREND_RELEVANCE_EVALUATION",
                response,
                Map.of("template_id", "trend-evaluate-relevance-v1")
        );

        assertThat(log).isNotNull();
        assertThat(log.getId()).isNotNull();
        assertThat(log.getOrganizationId()).isEqualTo(orgId);
        assertThat(log.getTokensInput()).isEqualTo(120);
        assertThat(log.getTokensOutput()).isEqualTo(80);
        assertThat(log.getCostUsd()).isEqualByComparingTo("0.000066");
        assertThat(log.getMetadata()).containsKey("latency_ms");

        // Verify aggregation queries
        Long totalTokens = usageLogRepository.sumTotalTokensByOrganizationId(orgId);
        assertThat(totalTokens).isEqualTo(200L);

        BigDecimal totalCost = usageLogRepository.sumTotalCostByOrganizationId(orgId);
        assertThat(totalCost).isEqualByComparingTo("0.000066");
    }
}
