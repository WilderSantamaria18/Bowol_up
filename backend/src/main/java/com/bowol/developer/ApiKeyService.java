package com.bowol.developer;

import com.bowol.developer.dto.ApiKeyCreatedResponse;
import com.bowol.developer.dto.ApiKeyResponse;
import com.bowol.developer.dto.CreateApiKeyRequest;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.subscription.OrganizationSubscription;
import com.bowol.subscription.OrganizationSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final OrganizationSubscriptionRepository subscriptionRepository;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public ApiKeyCreatedResponse createKey(UUID organizationId, UUID userId, CreateApiKeyRequest request) {
        // Generar clave secreta aleatoria segura
        byte[] randomBytes = new byte[24];
        SECURE_RANDOM.nextBytes(randomBytes);
        String randomHex = HexFormat.of().formatHex(randomBytes);

        String rawKey = "bwl_live_" + randomHex;
        String prefix = "bwl_live_" + randomHex.substring(0, 6) + "...";
        String hash = hashKey(rawKey);

        Instant expiresAt = null;
        if (request.getExpiresInDays() != null && request.getExpiresInDays() > 0) {
            expiresAt = Instant.now().plus(request.getExpiresInDays(), ChronoUnit.DAYS);
        }

        ApiKey apiKey = ApiKey.builder()
                .name(request.getName().trim())
                .keyPrefix(prefix)
                .keyHash(hash)
                .createdBy(userId)
                .expiresAt(expiresAt)
                .isActive(true)
                .build();
        apiKey.setOrganizationId(organizationId);

        ApiKey saved = apiKeyRepository.save(apiKey);
        log.info("API Key generada para org {}: prefix {}", organizationId, prefix);

        return ApiKeyCreatedResponse.of(saved, rawKey);
    }

    @Transactional(readOnly = true)
    public List<ApiKeyResponse> listKeys(UUID organizationId) {
        return apiKeyRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(organizationId)
                .stream()
                .map(ApiKeyResponse::from)
                .toList();
    }

    @Transactional
    public void revokeKey(UUID organizationId, UUID keyId, UUID userId) {
        ApiKey key = apiKeyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(keyId, organizationId)
                .orElseThrow(() -> new NotFoundException("API Key no encontrada"));

        key.setIsActive(false);
        key.setRevokedAt(Instant.now());
        key.setRevokedBy(userId);
        apiKeyRepository.save(key);
        log.info("API Key {} revocada para org {}", keyId, organizationId);
    }

    @Transactional
    public Optional<ApiKey> validateAndTouchKey(String rawKey) {
        if (rawKey == null || !rawKey.startsWith("bwl_live_")) {
            return Optional.empty();
        }

        String hash = hashKey(rawKey);
        Optional<ApiKey> keyOpt = apiKeyRepository.findByKeyHashAndDeletedAtIsNull(hash);

        if (keyOpt.isEmpty()) {
            return Optional.empty();
        }

        ApiKey key = keyOpt.get();
        if (!key.isValid()) {
            return Optional.empty();
        }

        // Actualizar último uso de forma optimizada
        key.setLastUsedAt(Instant.now());
        apiKeyRepository.save(key);

        return Optional.of(key);
    }

    @Transactional(readOnly = true)
    public String getPlanForOrganization(UUID organizationId) {
        return subscriptionRepository.findByOrganizationId(organizationId)
                .map(OrganizationSubscription::getPlanId)
                .orElse("FREE");
    }

    public static String hashKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
