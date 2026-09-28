package com.bowol.auth.sso;

import com.bowol.auth.AuthService;
import com.bowol.auth.dto.AuthResponse;
import com.bowol.auth.sso.dto.*;
import com.bowol.organization.MemberStatus;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.shared.exception.BadRequestException;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import com.bowol.user.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SsoService {

    private final SsoConfigRepository ssoConfigRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<SsoConfigResponse> getConfigsByOrganization(UUID organizationId) {
        return ssoConfigRepository.findByOrganizationIdAndDeletedAtIsNull(organizationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SsoConfigResponse saveConfig(UUID organizationId, SaveSsoConfigRequest request) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("ORGANIZACION_NO_ENCONTRADA", "No se encontró la organización con id: " + organizationId));

        SsoConfig config = ssoConfigRepository.findByOrganizationIdAndProviderAndDeletedAtIsNull(organizationId, request.getProvider())
                .orElseGet(() -> SsoConfig.builder()
                        .provider(request.getProvider())
                        .build());

        config.setOrganizationId(organizationId);
        config.setDisplayName(request.getDisplayName() != null && !request.getDisplayName().isBlank()
                ? request.getDisplayName() : request.getProvider().name() + " SSO");
        config.setClientId(request.getClientId().trim());
        if (request.getClientSecret() != null && !request.getClientSecret().isBlank()) {
            config.setClientSecret(request.getClientSecret().trim());
        }
        config.setIssuerUri(request.getIssuerUri());
        config.setMetadataUrl(request.getMetadataUrl());
        config.setTokenUrl(request.getTokenUrl());
        config.setUserinfoUrl(request.getUserinfoUrl());

        String cleanedDomain = request.getDomainRestriction() != null
                ? request.getDomainRestriction().trim().toLowerCase().replaceAll("^@", "")
                : null;
        config.setDomainRestriction(cleanedDomain);

        config.setIsEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : true);
        config.setEnforceSso(request.getEnforceSso() != null ? request.getEnforceSso() : false);

        // Generar authorization URL si no se especificó
        if (request.getAuthorizationUrl() != null && !request.getAuthorizationUrl().isBlank()) {
            config.setAuthorizationUrl(request.getAuthorizationUrl());
        } else {
            config.setAuthorizationUrl(buildDefaultAuthorizationUrl(request.getProvider(), config.getClientId()));
        }

        SsoConfig saved = ssoConfigRepository.save(config);
        log.info("Configuración SSO guardada exitosamente para la organización {}: provider={}", organizationId, saved.getProvider());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteConfig(UUID organizationId, UUID configId) {
        SsoConfig config = ssoConfigRepository.findById(configId)
                .filter(c -> c.getOrganizationId().equals(organizationId) && c.getDeletedAt() == null)
                .orElseThrow(() -> new NotFoundException("SSO_CONFIG_NO_ENCONTRADA", "No se encontró la configuración SSO especificada"));

        config.setDeletedAt(Instant.now());
        config.setIsEnabled(false);
        ssoConfigRepository.save(config);
        log.info("Configuración SSO {} eliminada para la organización {}", configId, organizationId);
    }

    @Transactional(readOnly = true)
    public SsoInitiateResponse initiateSso(SsoInitiateRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        int atIndex = email.lastIndexOf('@');
        if (atIndex == -1 || atIndex == email.length() - 1) {
            throw new BadRequestException("EMAIL_INVALIDO", "El correo corporativo no tiene un formato válido");
        }
        String domain = email.substring(atIndex + 1);

        List<SsoConfig> matching = ssoConfigRepository.findActiveByDomain(domain);
        if (matching.isEmpty()) {
            throw new NotFoundException("SSO_DOMAIN_NOT_CONFIGURED", "No hay un proveedor SSO corporativo configurado para el dominio: @" + domain);
        }

        SsoConfig primaryConfig = matching.get(0);
        Organization org = organizationRepository.findById(primaryConfig.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("ORGANIZACION_NO_ENCONTRADA", "Organización no encontrada"));

        String state = UUID.randomUUID().toString();
        String authUrlWithState = primaryConfig.getAuthorizationUrl();
        if (authUrlWithState != null) {
            String delimiter = authUrlWithState.contains("?") ? "&" : "?";
            authUrlWithState = authUrlWithState + delimiter + "state=" + state;
        }

        return SsoInitiateResponse.builder()
                .organizationId(org.getId())
                .organizationName(org.getName())
                .provider(primaryConfig.getProvider())
                .authorizationUrl(authUrlWithState)
                .state(state)
                .build();
    }

    @Transactional
    public AuthResponse callback(SsoCallbackRequest request, String userAgent, String ipAddress) {
        SsoConfig config = ssoConfigRepository.findByOrganizationIdAndProviderAndDeletedAtIsNull(request.getOrganizationId(), request.getProvider())
                .orElseThrow(() -> new NotFoundException("SSO_CONFIG_NO_ENCONTRADA", "No hay configuración SSO activa para este proveedor"));

        if (!Boolean.TRUE.equals(config.getIsEnabled())) {
            throw new BadRequestException("SSO_DISABLED", "La autenticación SSO para este proveedor está deshabilitada");
        }

        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("ORGANIZACION_NO_ENCONTRADA", "Organización no encontrada"));

        // Validar correo
        String email = request.getEmail() != null && !request.getEmail().isBlank()
                ? request.getEmail().trim().toLowerCase()
                : "user@" + (config.getDomainRestriction() != null ? config.getDomainRestriction() : "sso.corp");

        if (config.getDomainRestriction() != null && !config.getDomainRestriction().isBlank()) {
            String reqDomain = email.substring(email.lastIndexOf('@') + 1);
            if (!reqDomain.equalsIgnoreCase(config.getDomainRestriction())) {
                throw new BadRequestException("SSO_DOMAIN_MISMATCH", "El correo " + email + " no pertenece al dominio corporativo @" + config.getDomainRestriction());
            }
        }

        // Obtener o crear usuario
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            String fullName = request.getFullName() != null && !request.getFullName().isBlank()
                    ? request.getFullName().trim()
                    : email.split("@")[0];

            User newUser = User.builder()
                    .email(email)
                    .name(fullName)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .avatarUrl(request.getAvatarUrl())
                    .status(UserStatus.ACTIVE)
                    .lastLoginAt(Instant.now())
                    .build();
            return userRepository.save(newUser);
        });

        user.setLastLoginAt(Instant.now());
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        userRepository.save(user);

        // Obtener o crear membresía de la organización
        Optional<OrganizationMember> memberOpt = organizationMemberRepository.findByUserIdAndOrganizationId(user.getId(), org.getId());
        Role role = Role.MEMBER;
        if (memberOpt.isEmpty()) {
            OrganizationMember newMember = OrganizationMember.builder()
                    .organization(org)
                    .user(user)
                    .role(Role.MEMBER)
                    .status(MemberStatus.ACTIVE)
                    .joinedAt(Instant.now())
                    .build();
            organizationMemberRepository.save(newMember);
        } else {
            role = memberOpt.get().getRole();
        }

        log.info("Inicio de sesión SSO exitoso: user={}, org={}, provider={}", user.getEmail(), org.getId(), request.getProvider());
        return authService.issueAuthResponseForUser(user, org, role, userAgent, ipAddress);
    }

    private String buildDefaultAuthorizationUrl(SsoProvider provider, String clientId) {
        String encodedClientId = URLEncoder.encode(clientId != null ? clientId : "", StandardCharsets.UTF_8);
        return switch (provider) {
            case GOOGLE -> "https://accounts.google.com/o/oauth2/v2/auth?client_id=" + encodedClientId
                    + "&response_type=code&scope=openid%20email%20profile";
            case AZURE_AD -> "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=" + encodedClientId
                    + "&response_type=code&scope=openid%20email%20profile";
            case OIDC -> "https://auth.bowol.com/oauth2/authorize?client_id=" + encodedClientId
                    + "&response_type=code&scope=openid%20email%20profile";
            case SAML2 -> "https://auth.bowol.com/saml2/login?entityId=" + encodedClientId;
        };
    }

    private SsoConfigResponse mapToResponse(SsoConfig config) {
        return SsoConfigResponse.builder()
                .id(config.getId())
                .organizationId(config.getOrganizationId())
                .provider(config.getProvider())
                .displayName(config.getDisplayName())
                .clientId(config.getClientId())
                .issuerUri(config.getIssuerUri())
                .metadataUrl(config.getMetadataUrl())
                .authorizationUrl(config.getAuthorizationUrl())
                .domainRestriction(config.getDomainRestriction())
                .isEnabled(config.getIsEnabled())
                .enforceSso(config.getEnforceSso())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
