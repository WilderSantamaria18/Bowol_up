package com.bowol.auth;

import com.bowol.auth.dto.AuthResponse;
import com.bowol.auth.dto.LoginRequest;
import com.bowol.auth.dto.RegisterRequest;
import com.bowol.organization.Role;
import com.bowol.shared.exception.BadCredentialsException;
import com.bowol.shared.exception.ConflictException;
import com.bowol.shared.exception.TokenTheftException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("AuthService Business Logic Integration Tests")
class AuthServiceTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Test
    @DisplayName("Registro exitoso: crea usuario, organización predeterminada, membresía OWNER y devuelve tokens")
    void shouldRegisterUserAndDefaultWorkspace() {
        RegisterRequest req = RegisterRequest.builder()
                .name("Martin Founder")
                .email("martin@startup.com")
                .password("Password123!")
                .organizationName("Startup Ventures")
                .build();

        AuthResponse res = authService.register(req, "Mozilla/5.0", "127.0.0.1");

        assertNotNull(res);
        assertNotNull(res.getAccessToken());
        assertNotNull(res.getRefreshToken());
        assertEquals("Bearer", res.getTokenType());
        assertEquals(900, res.getExpiresIn());

        assertNotNull(res.getUser());
        assertEquals("Martin Founder", res.getUser().getName());
        assertEquals("martin@startup.com", res.getUser().getEmail());

        assertNotNull(res.getOrganization());
        assertEquals("Startup Ventures", res.getOrganization().getName());
        assertEquals("startup-ventures", res.getOrganization().getSlug());
        assertEquals(Role.OWNER, res.getOrganization().getRole());
        assertThat(res.getOrganization().getPermissions()).contains("organization.manage_billing", "trend.read");
    }

    @Test
    @DisplayName("Registro con email duplicado debe lanzar ConflictException")
    void shouldThrowConflictWhenEmailAlreadyExists() {
        RegisterRequest req = RegisterRequest.builder()
                .name("Duplicated User")
                .email("duplicate@bowol.ai")
                .password("Password123!")
                .build();

        authService.register(req, "UserAgent", "127.0.0.1");

        assertThrows(ConflictException.class, () -> authService.register(req, "UserAgent", "127.0.0.1"));
    }

    @Test
    @DisplayName("Login exitoso con credenciales correctas y fallo con contraseña errónea")
    void shouldLoginWithValidCredentialsAndFailWithInvalid() {
        RegisterRequest reg = RegisterRequest.builder()
                .name("Daniel Engineer")
                .email("daniel@bowol.ai")
                .password("SuperSecretPass!")
                .build();
        authService.register(reg, "Agent", "127.0.0.1");

        // Login exitoso
        LoginRequest validLogin = LoginRequest.builder()
                .email("daniel@bowol.ai")
                .password("SuperSecretPass!")
                .build();
        AuthResponse loginRes = authService.login(validLogin, "Agent", "127.0.0.1");
        assertNotNull(loginRes.getAccessToken());
        assertNotNull(loginRes.getRefreshToken());

        // Login con contraseña incorrecta
        LoginRequest invalidLogin = LoginRequest.builder()
                .email("daniel@bowol.ai")
                .password("WrongPassword123")
                .build();
        assertThrows(BadCredentialsException.class, () -> authService.login(invalidLogin, "Agent", "127.0.0.1"));
    }

    @Test
    @DisplayName("Rotación estricta de Refresh Token y detección de reuso con revocación total")
    void shouldRotateRefreshTokenAndDetectReuseTheft() {
        RegisterRequest reg = RegisterRequest.builder()
                .name("Sec User")
                .email("sec@bowol.ai")
                .password("Password123!")
                .build();
        AuthResponse initial = authService.register(reg, "Agent", "127.0.0.1");
        String initialRefresh = initial.getRefreshToken();

        // 1. Rotación legal
        AuthResponse rotated = authService.refresh(initialRefresh, "Agent-New", "127.0.0.1");
        assertNotNull(rotated.getAccessToken());
        assertNotNull(rotated.getRefreshToken());
        assertNotEquals(initialRefresh, rotated.getRefreshToken());

        // 2. Intento de reuso malicioso del token ya rotado (initialRefresh)
        // Debe disparar TokenTheftException y revocar TODOS los tokens del usuario
        assertThrows(TokenTheftException.class, () -> authService.refresh(initialRefresh, "Attacker", "192.168.1.100"));

        // 3. Verificar que incluso el nuevo token rotated fue revocado como contención de robo
        assertThrows(TokenTheftException.class, () -> authService.refresh(rotated.getRefreshToken(), "Agent-New", "127.0.0.1"));
    }
}
