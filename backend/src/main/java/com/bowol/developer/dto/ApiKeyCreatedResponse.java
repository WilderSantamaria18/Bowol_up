package com.bowol.developer.dto;

import com.bowol.developer.ApiKey;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class ApiKeyCreatedResponse {
    private UUID id;
    private String name;
    private String keyPrefix;
    private String rawApiKey;
    private Instant expiresAt;
    private Instant createdAt;

    public static ApiKeyCreatedResponse of(ApiKey apiKey, String rawApiKey) {
        return ApiKeyCreatedResponse.builder()
                .id(apiKey.getId())
                .name(apiKey.getName())
                .keyPrefix(apiKey.getKeyPrefix())
                .rawApiKey(rawApiKey)
                .expiresAt(apiKey.getExpiresAt())
                .createdAt(apiKey.getCreatedAt())
                .build();
    }
}
