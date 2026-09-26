package com.bowol.developer.dto;

import com.bowol.developer.ApiKey;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class ApiKeyResponse {
    private UUID id;
    private String name;
    private String keyPrefix;
    private Instant lastUsedAt;
    private Instant expiresAt;
    private Boolean isActive;
    private Instant revokedAt;
    private Instant createdAt;

    public static ApiKeyResponse from(ApiKey apiKey) {
        return ApiKeyResponse.builder()
                .id(apiKey.getId())
                .name(apiKey.getName())
                .keyPrefix(apiKey.getKeyPrefix())
                .lastUsedAt(apiKey.getLastUsedAt())
                .expiresAt(apiKey.getExpiresAt())
                .isActive(apiKey.getIsActive())
                .revokedAt(apiKey.getRevokedAt())
                .createdAt(apiKey.getCreatedAt())
                .build();
    }
}
