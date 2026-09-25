package com.bowol.auth;

import com.bowol.organization.Role;
import com.bowol.shared.security.RolePermissions;
import com.bowol.user.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("JwtService RS256 Unit and Integration Tests")
class JwtServiceTests {

    @Autowired
    private JwtService jwtService;

    @Test
    @DisplayName("Debe generar un token RS256 válido con todos los claims de seguridad obligatorios")
    void shouldGenerateValidTokenWithRequiredClaims() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .name("Sara Chief Strategy")
                .email("sara@bowol.ai")
                .build();

        Set<String> permissions = RolePermissions.getPermissionValues(Role.OWNER);

        String token = jwtService.generateAccessToken(user, orgId, Role.OWNER, permissions);
        assertNotNull(token);
        assertFalse(token.isBlank());

        // Validar claims extraídos
        assertEquals(userId, jwtService.extractUserId(token));
        assertEquals(orgId, jwtService.extractOrganizationId(token));
        assertEquals(Role.OWNER, jwtService.extractRole(token));

        List<String> extractedPermissions = jwtService.extractPermissions(token);
        assertThat(extractedPermissions).contains("organization.read", "organization.update", "trend.read");
        assertNotNull(jwtService.extractJti(token));
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    @DisplayName("Debe rechazar un token manipulado o con firma inválida")
    void shouldRejectTamperedToken() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .name("Security Tester")
                .email("test@sec.io")
                .build();

        String token = jwtService.generateAccessToken(user, UUID.randomUUID(), Role.MEMBER, Set.of("trend.read"));

        // Manipular el último carácter de la firma
        String tamperedToken = token.substring(0, token.length() - 2) + "ab";

        assertThrows(Exception.class, () -> jwtService.parseAndValidate(tamperedToken));
    }
}
