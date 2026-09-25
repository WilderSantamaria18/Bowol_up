package com.bowol.user;

import com.bowol.auth.RefreshToken;
import com.bowol.auth.RefreshTokenRepository;
import com.bowol.organization.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Auth & Users Persistence Integration Tests")
class AuthAndUserPersistenceTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Test
    @DisplayName("Debe guardar un usuario y buscarlo por su correo electrónico (case-insensitive)")
    void shouldSaveAndFindUserByEmail() {
        User user = User.builder()
                .name("Alex Innovator")
                .email("alex@startup.io")
                .passwordHash("$2a$12$e80yvQzH6q6K7mQ6lEaM9OZ1...")
                .status(UserStatus.ACTIVE)
                .build();

        User saved = userRepository.save(user);

        assertNotNull(saved.getId());
        assertEquals("Alex Innovator", saved.getName());
        assertNotNull(saved.getCreatedAt());

        Optional<User> found = userRepository.findByEmail("ALEX@STARTUP.IO");
        assertTrue(found.isPresent());
        assertEquals(saved.getId(), found.get().getId());
    }

    @Test
    @DisplayName("Debe crear una organización y asociar al usuario como OWNER mediante OrganizationMember")
    void shouldCreateOrganizationAndAssignOwnerMembership() {
        User founder = userRepository.save(User.builder()
                .name("Elena TechLead")
                .email("elena@bowol.ai")
                .passwordHash("$2a$12$xyz...")
                .status(UserStatus.ACTIVE)
                .build());

        Organization org = organizationRepository.save(Organization.builder()
                .name("Acme Innovation Labs")
                .slug("acme-labs")
                .industry("SaaS / Artificial Intelligence")
                .country("PE")
                .size(OrganizationSize.SMALL)
                .memberCount(1)
                .build());

        OrganizationMember membership = organizationMemberRepository.save(OrganizationMember.builder()
                .user(founder)
                .organization(org)
                .role(Role.OWNER)
                .status(MemberStatus.ACTIVE)
                .build());

        assertNotNull(membership.getId());
        assertEquals(Role.OWNER, membership.getRole());

        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(org.getId());
        assertThat(members).hasSize(1);
        assertEquals(founder.getId(), members.get(0).getUser().getId());

        Optional<OrganizationMember> lookup = organizationMemberRepository.findByUserIdAndOrganizationId(founder.getId(), org.getId());
        assertTrue(lookup.isPresent());
        assertEquals(Role.OWNER, lookup.get().getRole());
    }

    @Test
    @DisplayName("Debe gestionar Refresh Tokens con hash, expiración y revocación")
    void shouldPersistAndRevokeRefreshTokens() {
        User user = userRepository.save(User.builder()
                .name("Dev Tester")
                .email("tester@bowol.ai")
                .passwordHash("$2a$12$secure...")
                .build());

        String fakeSha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        RefreshToken token = refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(fakeSha256)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .userAgent("Mozilla/5.0")
                .ipAddress("127.0.0.1")
                .build());

        assertNotNull(token.getId());
        assertTrue(token.isValid());

        Optional<RefreshToken> found = refreshTokenRepository.findByTokenHash(fakeSha256);
        assertTrue(found.isPresent());
        assertEquals(user.getId(), found.get().getUser().getId());

        // Revocar todos los tokens del usuario
        int revokedCount = refreshTokenRepository.revokeAllByUserId(user.getId(), Instant.now());
        assertEquals(1, revokedCount);

        RefreshToken refreshed = refreshTokenRepository.findById(token.getId()).orElseThrow();
        assertTrue(refreshed.isRevoked());
        assertFalse(refreshed.isValid());
    }
}
