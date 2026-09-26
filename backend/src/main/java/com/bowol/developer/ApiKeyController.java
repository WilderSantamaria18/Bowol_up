package com.bowol.developer;

import com.bowol.audit.AuditedAction;
import com.bowol.developer.dto.ApiKeyCreatedResponse;
import com.bowol.developer.dto.ApiKeyResponse;
import com.bowol.developer.dto.CreateApiKeyRequest;
import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Developer Platform - API Keys", description = "Gestión de claves de API programáticas y límites de consumo")
@RestController
@RequestMapping("/api/v1/developer/api-keys")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @Operation(summary = "Listar todas las API Keys activas e históricas de la organización")
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<ApiKeyResponse>> listKeys() {
        UUID orgId = TenantContext.getTenantId();
        List<ApiKeyResponse> keys = apiKeyService.listKeys(orgId);
        return ResponseEntity.ok(keys);
    }

    @Operation(summary = "Generar una nueva API Key para integraciones externas")
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @AuditedAction(action = "API_KEY_CREATE", entityType = "API_KEY", description = "Generación de nueva API Key empresarial")
    public ResponseEntity<ApiKeyCreatedResponse> createKey(
            @Valid @RequestBody CreateApiKeyRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID orgId = TenantContext.getTenantId();
        ApiKeyCreatedResponse created = apiKeyService.createKey(orgId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Revocar inmediatamente una API Key")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @AuditedAction(action = "API_KEY_REVOKE", entityType = "API_KEY", entityIdParam = "id", description = "Revocación inmediata de API Key")
    public ResponseEntity<Void> revokeKey(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID orgId = TenantContext.getTenantId();
        apiKeyService.revokeKey(orgId, id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
