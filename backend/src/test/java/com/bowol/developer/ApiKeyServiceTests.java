package com.bowol.developer;

import com.bowol.developer.dto.ApiKeyCreatedResponse;
import com.bowol.developer.dto.ApiKeyResponse;
import com.bowol.developer.dto.CreateApiKeyRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ApiKeyServiceTests {

    @Autowired
    private ApiKeyService apiKeyService;

    private UUID testOrgId;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testOrgId = UUID.randomUUID();
        testUserId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Debe generar una API Key con prefijo y hash SHA-256")
    void testCreateApiKey() {
        CreateApiKeyRequest request = CreateApiKeyRequest.builder()
                .name("Pipeline GitHub Actions")
                .expiresInDays(30)
                .build();

        ApiKeyCreatedResponse response = apiKeyService.createKey(testOrgId, testUserId, request);

        assertThat(response).isNotNull();
        assertThat(response.getRawApiKey()).startsWith("bwl_live_");
        assertThat(response.getKeyPrefix()).startsWith("bwl_live_");
        assertThat(response.getExpiresAt()).isNotNull();

        // Validar que la clave puede autenticarse
        Optional<ApiKey> validated = apiKeyService.validateAndTouchKey(response.getRawApiKey());
        assertThat(validated).isPresent();
        assertThat(validated.get().getOrganizationId()).isEqualTo(testOrgId);
        assertThat(validated.get().getLastUsedAt()).isNotNull();
    }

    @Test
    @DisplayName("Debe revocar inmediatamente una API Key")
    void testRevokeApiKey() {
        CreateApiKeyRequest request = CreateApiKeyRequest.builder()
                .name("Key Temporal")
                .expiresInDays(7)
                .build();

        ApiKeyCreatedResponse created = apiKeyService.createKey(testOrgId, testUserId, request);
        assertThat(apiKeyService.validateAndTouchKey(created.getRawApiKey())).isPresent();

        apiKeyService.revokeKey(testOrgId, created.getId(), testUserId);

        // Ya no debe ser válida
        Optional<ApiKey> afterRevoke = apiKeyService.validateAndTouchKey(created.getRawApiKey());
        assertThat(afterRevoke).isEmpty();

        List<ApiKeyResponse> list = apiKeyService.listKeys(testOrgId);
        assertThat(list).anyMatch(k -> k.getId().equals(created.getId()) && Boolean.FALSE.equals(k.getIsActive()));
    }
}
