package com.bowol.auth;

import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.shared.exception.TokenException;
import com.bowol.shared.security.RsaKeyProvider;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.security.KeyPairGenerator;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class JwtSecurityEdgeCaseTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthService authService;

    @Autowired
    private RsaKeyProvider rsaKeyProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Organization testOrg;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        organizationMemberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .email("security@test.com")
                .name("Security Tester")
                .passwordHash(passwordEncoder.encode("Secure123!"))
                .build());

        testOrg = organizationRepository.save(Organization.builder()
                .name("Sec Corp")
                .slug("sec-corp")
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .user(testUser)
                .organization(testOrg)
                .role(Role.OWNER)
                .build());
    }

    @Test
    @DisplayName("JWT Expirado - Petición a endpoint protegido retorna 401 Unauthorized")
    void expiredToken_returns401() throws Exception {
        // Generar token con fecha de expiración en el pasado
        Date past = new Date(System.currentTimeMillis() - 60000);
        String expiredToken = Jwts.builder()
                .subject(testUser.getId().toString())
                .claim("email", testUser.getEmail())
                .claim("name", testUser.getName())
                .claim("org_id", testOrg.getId().toString())
                .claim("role", "OWNER")
                .claim("permissions", List.of("organization.read"))
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date(past.getTime() - 60000))
                .expiration(past)
                .signWith(rsaKeyProvider.getPrivateKey(), Jwts.SIG.RS256)
                .compact();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT con Firma Manipulada - Petición retorna 401 Unauthorized")
    void tamperedSignatureToken_returns401() throws Exception {
        // Generar un par de claves RSA ajeno
        var keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        var attackerKeyPair = keyGen.generateKeyPair();

        String forgedToken = Jwts.builder()
                .subject(testUser.getId().toString())
                .claim("email", testUser.getEmail())
                .claim("name", testUser.getName())
                .claim("org_id", testOrg.getId().toString())
                .claim("role", "OWNER")
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(attackerKeyPair.getPrivate(), Jwts.SIG.RS256)
                .compact();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + forgedToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT Malformado o corrupto - Petición retorna 401 Unauthorized")
    void malformedToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer not.a.valid.jwt.payload"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Refresh Token Expirado - Falla con TokenException y estado 401")
    void expiredRefreshToken_failsRotation() {
        RefreshToken expired = RefreshToken.builder()
                .tokenHash(sha256Hex("expired-raw-token"))
                .user(testUser)
                .expiresAt(Instant.now().minus(2, ChronoUnit.HOURS))
                .build();
        refreshTokenRepository.save(expired);

        assertThrows(TokenException.class, () -> {
            authService.refresh("expired-raw-token", "test-agent", "127.0.0.1");
        });
    }

    @Test
    @DisplayName("Refresh Token Inexistente - Falla con TokenException y estado 401")
    void nonExistentRefreshToken_failsRotation() {
        assertThrows(TokenException.class, () -> {
            authService.refresh("random-non-existent-token-value", "test-agent", "127.0.0.1");
        });
    }

    private String sha256Hex(String raw) {
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            var hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    @DisplayName("Petición sin header Authorization a endpoint protegido retorna 401")
    void missingToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
