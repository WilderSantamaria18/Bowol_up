package com.bowol.auth;

import com.bowol.auth.dto.AuthResponse;
import com.bowol.auth.dto.LoginRequest;
import com.bowol.auth.dto.RegisterRequest;
import com.bowol.organization.*;
import com.bowol.shared.exception.BadCredentialsException;
import com.bowol.shared.exception.ConflictException;
import com.bowol.shared.exception.TokenException;
import com.bowol.shared.exception.TokenTheftException;
import com.bowol.shared.security.RolePermissions;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import com.bowol.user.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${bowol.security.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs; // 7 días

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public AuthResponse register(RegisterRequest request, String userAgent, String ipAddress) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("AUTH_EMAIL_EXISTS", "El correo electrónico ya está registrado");
        }

        // 1. Crear Usuario con BCrypt cost 12
        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(UserStatus.ACTIVE)
                .lastLoginAt(Instant.now())
                .build();
        User savedUser = userRepository.save(user);

        // 2. Crear Organización predeterminada
        String orgName = request.getOrganizationName() != null && !request.getOrganizationName().isBlank()
                ? request.getOrganizationName().trim()
                : request.getName().trim() + "'s Workspace";

        String baseSlug = generateSlug(orgName);
        String finalSlug = baseSlug;
        int counter = 1;
        while (organizationRepository.existsBySlug(finalSlug)) {
            finalSlug = baseSlug + "-" + counter++;
        }

        Organization org = Organization.builder()
                .name(orgName)
                .slug(finalSlug)
                .size(OrganizationSize.SOLO)
                .memberCount(1)
                .build();
        Organization savedOrg = organizationRepository.save(org);

        // 3. Crear membresía OWNER
        OrganizationMember membership = OrganizationMember.builder()
                .user(savedUser)
                .organization(savedOrg)
                .role(Role.OWNER)
                .status(MemberStatus.ACTIVE)
                .joinedAt(Instant.now())
                .build();
        organizationMemberRepository.save(membership);

        // 4. Generar tokens y permisos
        Set<String> permissions = RolePermissions.getPermissionValues(Role.OWNER);
        String accessToken = jwtService.generateAccessToken(savedUser, savedOrg.getId(), Role.OWNER, permissions);
        String rawRefreshToken = generateAndPersistRefreshToken(savedUser, userAgent, ipAddress);

        return buildAuthResponse(savedUser, savedOrg, Role.OWNER, permissions, accessToken, rawRefreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String userAgent, String ipAddress) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Credenciales de acceso incorrectas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales de acceso incorrectas");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadCredentialsException("La cuenta se encuentra inactiva o suspendida");
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        // Obtener organización principal
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserId(user.getId());
        Organization org = null;
        Role role = Role.MEMBER;
        if (!memberships.isEmpty()) {
            OrganizationMember primary = memberships.get(0);
            org = primary.getOrganization();
            role = primary.getRole();
        }

        Set<String> permissions = RolePermissions.getPermissionValues(role);
        String accessToken = jwtService.generateAccessToken(user, org != null ? org.getId() : null, role, permissions);
        String rawRefreshToken = generateAndPersistRefreshToken(user, userAgent, ipAddress);

        return buildAuthResponse(user, org, role, permissions, accessToken, rawRefreshToken);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken, String userAgent, String ipAddress) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new TokenException("AUTH_REFRESH_TOKEN_REQUIRED", "El token de refresco es obligatorio");
        }

        String hash = sha256Hex(rawRefreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new TokenException("AUTH_REFRESH_TOKEN_NOT_FOUND", "Token de refresco inválido o inexistente"));

        User user = storedToken.getUser();

        // DETECCIÓN DE REUSO / ROBO DE TOKEN:
        // Si el token ya fue revocado previamente, significa que un atacante o cliente desincronizado
        // intenta reutilizar un token rotado -> Revocar INMEDIATAMENTE todos los tokens del usuario
        if (storedToken.isRevoked()) {
            log.warn("¡ALERTA DE ROBO DE TOKEN! Intento de reuso de token revocado detectado para el usuario {}", user.getId());
            refreshTokenRepository.revokeAllByUserId(user.getId(), Instant.now());
            throw new TokenTheftException("Detección de reuso de sesión. Por motivos de seguridad, se han invalidado todas sus sesiones activas.");
        }

        if (storedToken.isExpired()) {
            throw new TokenException("AUTH_REFRESH_TOKEN_EXPIRED", "El token de refresco ha expirado. Inicie sesión nuevamente.");
        }

        // Rotar: Invalida el token anterior
        storedToken.revoke();
        refreshTokenRepository.save(storedToken);

        // Generar nuevo refresh token
        String newRawRefreshToken = generateAndPersistRefreshToken(user, userAgent, ipAddress);

        // Obtener membresía activa
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserId(user.getId());
        Organization org = null;
        Role role = Role.MEMBER;
        if (!memberships.isEmpty()) {
            OrganizationMember primary = memberships.get(0);
            org = primary.getOrganization();
            role = primary.getRole();
        }

        Set<String> permissions = RolePermissions.getPermissionValues(role);
        String newAccessToken = jwtService.generateAccessToken(user, org != null ? org.getId() : null, role, permissions);

        return buildAuthResponse(user, org, role, permissions, newAccessToken, newRawRefreshToken);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String hash = sha256Hex(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
                token.revoke();
                refreshTokenRepository.save(token);
            });
        }
    }

    @Transactional
    public void logoutAll(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId, Instant.now());
    }

    private String generateAndPersistRefreshToken(User user, String userAgent, String ipAddress) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        String hash = sha256Hex(rawToken);
        Instant expiresAt = Instant.now().plus(refreshTokenExpirationMs, ChronoUnit.MILLIS);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hash)
                .expiresAt(expiresAt)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .createdAt(Instant.now())
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    public static String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Error en algoritmo de hash SHA-256", e);
        }
    }

    private String generateSlug(String name) {
        String noWhitespace = name.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        return noWhitespace.replaceAll("^-+|-+$", "");
    }

    private AuthResponse buildAuthResponse(User user, Organization org, Role role, Set<String> permissions,
                                           String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900)
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .organization(org != null ? AuthResponse.OrganizationSummary.builder()
                        .id(org.getId())
                        .name(org.getName())
                        .slug(org.getSlug())
                        .role(role)
                        .permissions(permissions)
                        .build() : null)
                .build();
    }
}
