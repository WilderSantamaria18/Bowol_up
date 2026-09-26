package com.bowol.developer;

import com.bowol.audit.AuditedAction;
import com.bowol.developer.dto.CreateWebhookRequest;
import com.bowol.developer.dto.UpdateWebhookRequest;
import com.bowol.developer.dto.WebhookDeliveryResponse;
import com.bowol.developer.dto.WebhookEndpointResponse;
import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Developer Platform - Webhooks", description = "Gestión de Webhooks salientes y trazabilidad de entregas en tiempo real")
@RestController
@RequestMapping("/api/v1/developer/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;

    @Operation(summary = "Listar todos los endpoints de webhooks registrados")
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<WebhookEndpointResponse>> listEndpoints() {
        UUID orgId = TenantContext.getTenantId();
        return ResponseEntity.ok(webhookService.listEndpoints(orgId));
    }

    @Operation(summary = "Registrar un nuevo webhook saliente")
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @AuditedAction(action = "WEBHOOK_CREATE", entityType = "WEBHOOK", description = "Creación de nuevo endpoint de Webhook saliente")
    public ResponseEntity<WebhookEndpointResponse> createEndpoint(
            @Valid @RequestBody CreateWebhookRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID orgId = TenantContext.getTenantId();
        WebhookEndpointResponse created = webhookService.createEndpoint(orgId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Actualizar configuración de un webhook")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @AuditedAction(action = "WEBHOOK_UPDATE", entityType = "WEBHOOK", entityIdParam = "id", description = "Modificación de endpoint de Webhook")
    public ResponseEntity<WebhookEndpointResponse> updateEndpoint(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateWebhookRequest request
    ) {
        UUID orgId = TenantContext.getTenantId();
        return ResponseEntity.ok(webhookService.updateEndpoint(orgId, id, request));
    }

    @Operation(summary = "Eliminar un endpoint de webhook")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @AuditedAction(action = "WEBHOOK_DELETE", entityType = "WEBHOOK", entityIdParam = "id", description = "Eliminación de endpoint de Webhook")
    public ResponseEntity<Void> deleteEndpoint(@PathVariable UUID id) {
        UUID orgId = TenantContext.getTenantId();
        webhookService.deleteEndpoint(orgId, id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Disparar ping de prueba en vivo al webhook")
    @PostMapping("/{id}/test")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @AuditedAction(action = "WEBHOOK_TEST_PING", entityType = "WEBHOOK", entityIdParam = "id", description = "Prueba de envío de Webhook")
    public ResponseEntity<WebhookDeliveryResponse> testPing(@PathVariable UUID id) {
        UUID orgId = TenantContext.getTenantId();
        return ResponseEntity.ok(webhookService.triggerTestPing(orgId, id));
    }

    @Operation(summary = "Consultar historial de entregas de un webhook")
    @GetMapping("/{id}/deliveries")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Page<WebhookDeliveryResponse>> getDeliveries(
            @PathVariable UUID id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID orgId = TenantContext.getTenantId();
        return ResponseEntity.ok(webhookService.getDeliveries(orgId, id, pageable));
    }
}
