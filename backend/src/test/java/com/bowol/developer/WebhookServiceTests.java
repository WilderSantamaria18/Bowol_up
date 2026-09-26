package com.bowol.developer;

import com.bowol.developer.dto.CreateWebhookRequest;
import com.bowol.developer.dto.WebhookEndpointResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class WebhookServiceTests {

    @Autowired
    private WebhookService webhookService;

    private UUID testOrgId;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testOrgId = UUID.randomUUID();
        testUserId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Debe calcular correctamente la firma HMAC-SHA256")
    void testHmacSha256Calculation() {
        String payload = "{\"event\":\"trend.high_relevance_detected\",\"score\":92.5}";
        String secret = "whsec_test_secret_123456";

        String signature1 = WebhookService.computeHmacSha256(payload, secret);
        String signature2 = WebhookService.computeHmacSha256(payload, secret);

        assertThat(signature1).isNotNull();
        assertThat(signature1).isNotEmpty();
        assertThat(signature1).isEqualTo(signature2);

        // Si cambia el payload, la firma debe diferir
        String signatureChanged = WebhookService.computeHmacSha256(payload + " ", secret);
        assertThat(signature1).isNotEqualTo(signatureChanged);
    }

    @Test
    @DisplayName("Debe registrar y listar endpoints de Webhooks salientes")
    void testCreateAndListEndpoints() {
        CreateWebhookRequest request = CreateWebhookRequest.builder()
                .url("https://hooks.slack.com/services/T00/B00/XXXX")
                .description("Alertas de Tendencias y RICE a Slack")
                .events(List.of("trend.high_relevance_detected", "opportunity.rice_calculated"))
                .build();

        WebhookEndpointResponse created = webhookService.createEndpoint(testOrgId, testUserId, request);

        assertThat(created).isNotNull();
        assertThat(created.getId()).isNotNull();
        assertThat(created.getUrl()).isEqualTo("https://hooks.slack.com/services/T00/B00/XXXX");
        assertThat(created.getSecret()).startsWith("whsec_");
        assertThat(created.getEvents()).contains("trend.high_relevance_detected");

        List<WebhookEndpointResponse> list = webhookService.listEndpoints(testOrgId);
        assertThat(list).hasSize(1);
        assertThat(list.get(0).getId()).isEqualTo(created.getId());
    }
}
