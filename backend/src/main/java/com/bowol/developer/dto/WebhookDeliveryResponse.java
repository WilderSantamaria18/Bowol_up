package com.bowol.developer.dto;

import com.bowol.developer.WebhookDelivery;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class WebhookDeliveryResponse {
    private UUID id;
    private UUID webhookEndpointId;
    private String eventType;
    private String payload;
    private Integer statusCode;
    private String responseBody;
    private Boolean success;
    private Integer attempts;
    private String errorMessage;
    private Instant createdAt;

    public static WebhookDeliveryResponse from(WebhookDelivery delivery) {
        return WebhookDeliveryResponse.builder()
                .id(delivery.getId())
                .webhookEndpointId(delivery.getWebhookEndpointId())
                .eventType(delivery.getEventType())
                .payload(delivery.getPayload())
                .statusCode(delivery.getStatusCode())
                .responseBody(delivery.getResponseBody())
                .success(delivery.getSuccess())
                .attempts(delivery.getAttempts())
                .errorMessage(delivery.getErrorMessage())
                .createdAt(delivery.getCreatedAt())
                .build();
    }
}
