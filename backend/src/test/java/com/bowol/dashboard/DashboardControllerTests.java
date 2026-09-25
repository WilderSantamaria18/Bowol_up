package com.bowol.dashboard;

import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DashboardControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String token;
    private Organization testOrg;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        testOrg = organizationRepository.save(Organization.builder()
                .name("Cockpit Corp " + unique)
                .slug("cockpit-" + unique)
                .build());

        User testUser = userRepository.save(User.builder()
                .email("cockpit_" + unique + "@bowol.io")
                .name("Cockpit Admin")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .organization(testOrg)
                .user(testUser)
                .role(Role.OWNER)
                .build());

        BusinessProfile profile = BusinessProfile.builder()
                .industry("SaaS & Fintech")
                .digitalMaturity(70)
                .aiMaturity(55)
                .onboardingCompletedAt(Instant.now())
                .build();
        profile.setOrganizationId(testOrg.getId());
        businessProfileRepository.save(profile);

        token = jwtService.generateAccessToken(
                testUser,
                testOrg.getId(),
                Role.OWNER,
                Set.of("dashboard.read")
        );
    }

    @Test
    @DisplayName("GET /api/v1/dashboard/summary - Devuelve métricas consolidadas del Cockpit")
    void testGetDashboardSummary() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organization.id").value(testOrg.getId().toString()))
                .andExpect(jsonPath("$.organization.name").value(testOrg.getName()))
                .andExpect(jsonPath("$.maturity.digitalMaturity").value(70))
                .andExpect(jsonPath("$.maturity.aiMaturity").value(55))
                .andExpect(jsonPath("$.maturity.stage").value("AVANZADO"))
                .andExpect(jsonPath("$.maturity.onboardingCompleted").value(true))
                .andExpect(jsonPath("$.trends.totalGlobalTrends").isNumber())
                .andExpect(jsonPath("$.strategy.opportunitiesCount").isNumber())
                .andExpect(jsonPath("$.execution.activeProjectsCount").isNumber());
    }

    @Test
    @DisplayName("GET /api/v1/dashboard/summary - Sin token rechaza con 401")
    void testGetDashboardSummaryUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
