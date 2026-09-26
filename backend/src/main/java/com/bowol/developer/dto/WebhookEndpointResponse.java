package com.bowol.developer.dto;

import com.bowol.developer.WebhookEndpoint;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class WebhookEndpointResponse {
    private UUID id;
    private String url;
    private String description;
    private String secret;
    private List<String> events;
    private Boolean isActive;
    private Instant createdAt;

    public static WebhookEndpointResponse from(WebhookEndpoint endpoint) {
        return WebhookEndpointResponse.builder()
                .id(endpoint.getId())
                .url(endpoint.getUrl())
                .description(endpoint.getDescription())
                .secret(endpoint.getSecret())
                .events(endpoint.getEvents())
                .isActive(endpoint.getIsActive())
                .createdAt(endpoint.getCreatedAt())
                .build();
    }
}
