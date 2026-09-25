package com.bowol.brand;

import com.bowol.auth.JwtService;
import com.bowol.brand.dto.SaveBrandProfileRequest;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BrandProfileControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private BrandProfileRepository brandProfileRepository;

    private User userOrgA;
    private Organization orgA;
    private String tokenOrgA;

    private User userOrgB;
    private Organization orgB;
    private String tokenOrgB;

    @BeforeEach
    void setUp() {
        // Setup Tenant A
        orgA = organizationRepository.save(Organization.builder()
                .name("Acme Corp A")
                .slug("acme-a-" + UUID.randomUUID())
                .build());

        userOrgA = userRepository.save(User.builder()
                .email("owner-a-" + UUID.randomUUID() + "@acme.com")
                .passwordHash("hashed")
                .name("Owner A")
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .organization(orgA)
                .user(userOrgA)
                .role(Role.OWNER)
                .build());

        tokenOrgA = jwtService.generateAccessToken(userOrgA, orgA.getId(), Role.OWNER, Set.of("READ", "WRITE"));

        // Setup Tenant B
        orgB = organizationRepository.save(Organization.builder()
                .name("Beta Corp B")
                .slug("beta-b-" + UUID.randomUUID())
                .build());

        userOrgB = userRepository.save(User.builder()
                .email("owner-b-" + UUID.randomUUID() + "@beta.com")
                .passwordHash("hashed")
                .name("Owner B")
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .organization(orgB)
                .user(userOrgB)
                .role(Role.OWNER)
                .build());

        tokenOrgB = jwtService.generateAccessToken(userOrgB, orgB.getId(), Role.OWNER, Set.of("READ", "WRITE"));
    }

    @Test
    @DisplayName("GET /api/v1/brand-profile auto-inicializa un perfil si no existe")
    void testGetOrCreateBrandProfile() throws Exception {
        mockMvc.perform(get("/api/v1/brand-profile")
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brandName").value("Acme Corp A"))
                .andExpect(jsonPath("$.brandVoiceTone").value("INNOVATIVE"))
                .andExpect(jsonPath("$.primaryColor").value("#EA580C"))
                .andExpect(jsonPath("$.fontHeading").value("Plus Jakarta Sans"));

        assertThat(brandProfileRepository.findByOrganizationId(orgA.getId())).isPresent();
    }

    @Test
    @DisplayName("PUT /api/v1/brand-profile actualiza el kit de marca correctamente")
    void testSaveBrandProfile() throws Exception {
        SaveBrandProfileRequest request = SaveBrandProfileRequest.builder()
                .brandName("Acme Rebranded")
                .tagline("Leading the Autonomous Enterprise")
                .brandVoiceTone(BrandVoiceTone.BOLD)
                .targetAudience("CTOs y Directores de Tecnología")
                .primaryColor("#2563EB")
                .secondaryColor("#10B981")
                .accentColor("#F59E0B")
                .fontHeading("Outfit")
                .fontBody("Inter")
                .keyValues(List.of("Velocidad", "Rigor Científico"))
                .doGuidelines("Usar tono directo y métricas reales")
                .dontGuidelines("Evitar rodeos y superlativos vacíos")
                .logoUrl("https://acme.com/logo.png")
                .build();

        mockMvc.perform(put("/api/v1/brand-profile")
                        .header("Authorization", "Bearer " + tokenOrgA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brandName").value("Acme Rebranded"))
                .andExpect(jsonPath("$.brandVoiceTone").value("BOLD"))
                .andExpect(jsonPath("$.primaryColor").value("#2563EB"))
                .andExpect(jsonPath("$.fontHeading").value("Outfit"))
                .andExpect(jsonPath("$.keyValues[0]").value("Velocidad"));

        BrandProfile profile = brandProfileRepository.findByOrganizationId(orgA.getId()).orElseThrow();
        assertThat(profile.getBrandName()).isEqualTo("Acme Rebranded");
        assertThat(profile.getBrandVoiceTone()).isEqualTo(BrandVoiceTone.BOLD);
    }

    @Test
    @DisplayName("Aislamiento multi-tenant: Org A y Org B tienen perfiles de marca completamente independientes")
    void testMultiTenantIsolation() throws Exception {
        // Init Org A
        mockMvc.perform(get("/api/v1/brand-profile")
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brandName").value("Acme Corp A"));

        // Init Org B
        mockMvc.perform(get("/api/v1/brand-profile")
                        .header("Authorization", "Bearer " + tokenOrgB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brandName").value("Beta Corp B"));

        // Org B modifies its profile
        SaveBrandProfileRequest updateB = SaveBrandProfileRequest.builder()
                .brandName("Beta Updated")
                .brandVoiceTone(BrandVoiceTone.PLAYFUL)
                .primaryColor("#EC4899")
                .build();

        mockMvc.perform(put("/api/v1/brand-profile")
                        .header("Authorization", "Bearer " + tokenOrgB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brandName").value("Beta Updated"));

        // Verify Org A is untouched
        mockMvc.perform(get("/api/v1/brand-profile")
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brandName").value("Acme Corp A"));
    }
}
