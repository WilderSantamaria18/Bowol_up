package com.bowol.auth.sso;

import com.bowol.auth.dto.AuthResponse;
import com.bowol.auth.sso.dto.*;
import com.bowol.organization.Role;
import com.bowol.shared.exception.ForbiddenException;
import com.bowol.shared.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SsoController {

    private final SsoService ssoService;

    // --- Endpoints Públicos de Autenticación SSO ---

    @PostMapping("/api/v1/auth/sso/initiate")
    public ResponseEntity<SsoInitiateResponse> initiateSso(@Valid @RequestBody SsoInitiateRequest request) {
        SsoInitiateResponse response = ssoService.initiateSso(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/v1/auth/sso/callback")
    public ResponseEntity<AuthResponse> callback(
            @Valid @RequestBody SsoCallbackRequest request,
            HttpServletRequest httpRequest
    ) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ipAddress = httpRequest.getRemoteAddr();

        AuthResponse response = ssoService.callback(request, userAgent, ipAddress);
        return ResponseEntity.ok(response);
    }

    // --- Endpoints de Gestión SSO de Organización (Requiere ADMIN u OWNER) ---

    @GetMapping("/api/v1/organizations/{organizationId}/sso")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SsoConfigResponse>> getOrganizationSsoConfigs(
            @PathVariable UUID organizationId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        validateOrgAdminAccess(organizationId, principal);
        List<SsoConfigResponse> configs = ssoService.getConfigsByOrganization(organizationId);
        return ResponseEntity.ok(configs);
    }

    @PostMapping("/api/v1/organizations/{organizationId}/sso")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SsoConfigResponse> saveOrganizationSsoConfig(
            @PathVariable UUID organizationId,
            @Valid @RequestBody SaveSsoConfigRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        validateOrgAdminAccess(organizationId, principal);
        SsoConfigResponse response = ssoService.saveConfig(organizationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/api/v1/organizations/{organizationId}/sso/{configId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteOrganizationSsoConfig(
            @PathVariable UUID organizationId,
            @PathVariable UUID configId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        validateOrgAdminAccess(organizationId, principal);
        ssoService.deleteConfig(organizationId, configId);
        return ResponseEntity.noContent().build();
    }

    private void validateOrgAdminAccess(UUID organizationId, UserPrincipal principal) {
        if (principal == null) {
            throw new ForbiddenException("NO_AUTORIZADO", "Usuario no autenticado");
        }
        if (!organizationId.equals(principal.getOrganizationId())) {
            throw new ForbiddenException("ACCESO_DENEGADO", "No tienes acceso a los recursos de esta organización");
        }
        if (principal.getRole() != Role.OWNER && principal.getRole() != Role.ADMIN) {
            throw new ForbiddenException("ACCESO_DENEGADO", "Se requieren permisos de Administrador o Propietario para configurar SSO");
        }
    }
}
