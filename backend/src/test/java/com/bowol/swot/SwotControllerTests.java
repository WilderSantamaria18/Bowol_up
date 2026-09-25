package com.bowol.swot;

import com.bowol.ai.audit.AIUsageLogRepository;
import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.organization.*;
import com.bowol.source.TrendSource;
import com.bowol.source.TrendSourceCode;
import com.bowol.source.TrendSourceRepository;
import com.bowol.swot.dto.AddSwotItemRequest;
import com.bowol.swot.dto.GenerateSwotRequest;
import com.bowol.swot.dto.SwotItem;
import com.bowol.swot.dto.UpdateSwotRequest;
import com.bowol.trend.Trend;
import com.bowol.trend.TrendRepository;
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
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SwotControllerTests {

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
    private OrganizationMemberRepository memberRepository;

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private TrendSourceRepository trendSourceRepository;

    @Autowired
    private TrendRepository trendRepository;

    @Autowired
    private SwotAnalysisRepository swotAnalysisRepository;

    @Autowired
    private EvidenceRefRepository evidenceRefRepository;

    @Autowired
    private AIUsageLogRepository aiUsageLogRepository;

    private User testUser;
    private Organization testOrg;
    private String jwtToken;
    private Trend testTrend;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .name("CEO Bowol")
                .email("ceo-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("hashed")
                .build());

        testOrg = organizationRepository.save(Organization.builder()
                .name("Alpha Innovations")
                .slug("alpha-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(testOrg)
                .user(testUser)
                .role(Role.OWNER)
                .build());

        BusinessProfile profile = BusinessProfile.builder()
                .industry("Fintech")
                .size(OrganizationSize.SMALL)
                .market("LATAM")
                .problems(List.of("Presupuesto reducido", "Competencia feroz"))
                .tools(List.of("Stripe", "PostgreSQL", "React"))
                .digitalMaturity(85)
                .aiMaturity(65)
                .build();
        profile.setOrganizationId(testOrg.getId());
        businessProfileRepository.save(profile);

        TrendSource source = trendSourceRepository.save(TrendSource.builder()
                .code(TrendSourceCode.GITHUB)
                .name("GitHub")
                .sourceLevel("A")
                .isActive(true)
                .build());

        testTrend = trendRepository.save(Trend.builder()
                .source(source)
                .externalId("langchain-ai/langchain")
                .title("LangChain Agent Framework")
                .description("Building applications with LLMs through composability.")
                .url("https://github.com/langchain-ai/langchain")
                .score(92)
                .tags(List.of("llm", "agents"))
                .metadata(Map.of("stars", 85000L))
                .build());

        jwtToken = jwtService.generateAccessToken(
                testUser,
                testOrg.getId(),
                Role.OWNER,
                Set.of("SWOT_CREATE", "SWOT_READ", "SWOT_UPDATE", "SWOT_DELETE")
        );
    }

    @Test
    @DisplayName("POST /api/v1/swot/generate generates new SWOT with Mock AI, writes audit log and creates evidence refs")
    void testGenerateSwot() throws Exception {
        GenerateSwotRequest request = GenerateSwotRequest.builder()
                .includeTrends(true)
                .maxTrends(10)
                .build();

        mockMvc.perform(post("/api/v1/swot/generate")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.organizationId").value(testOrg.getId().toString()))
                .andExpect(jsonPath("$.strengths").isArray())
                .andExpect(jsonPath("$.weaknesses").isArray())
                .andExpect(jsonPath("$.opportunities").isArray())
                .andExpect(jsonPath("$.threats").isArray())
                .andExpect(jsonPath("$.summary").isNotEmpty())
                .andExpect(jsonPath("$.profileSnapshot.industry").value("Fintech"));

        // Verify SWOT in database
        List<SwotAnalysis> all = swotAnalysisRepository.findAll();
        assertThat(all).isNotEmpty();
        SwotAnalysis saved = all.get(0);
        assertThat(saved.getOrganizationId()).isEqualTo(testOrg.getId());
        assertThat(saved.getStrengths()).isNotEmpty();
        assertThat(saved.getOpportunities()).isNotEmpty();

        // Verify Evidence Refs created
        List<EvidenceRef> refs = evidenceRefRepository.findByOrganizationIdAndEntityTypeAndEntityId(
                testOrg.getId(), "SWOT", saved.getId());
        assertThat(refs).isNotEmpty();
        assertThat(refs.get(0).getTrend().getId()).isEqualTo(testTrend.getId());

        // Verify AI Audit Log
        assertThat(aiUsageLogRepository.findByOrganizationIdAndOperation(testOrg.getId(), "SWOT_GENERATE"))
                .isNotEmpty();
    }

    @Test
    @DisplayName("GET /api/v1/swot/latest returns the most recent SWOT analysis")
    void testGetLatestSwot() throws Exception {
        SwotAnalysis swot = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(testOrg.getId())
                .strengths(List.of(SwotItem.of("Equipo calificado")))
                .weaknesses(List.of(SwotItem.of("Falta de liquidez")))
                .opportunities(List.of(SwotItem.of("Mercado en expansión")))
                .threats(List.of(SwotItem.of("Nuevos entrantes")))
                .summary(Map.of("text", "Resumen ejecutivo del diagnóstico"))
                .aiProvider("mock")
                .aiModelUsed("gpt-4o")
                .build());

        mockMvc.perform(get("/api/v1/swot/latest")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(swot.getId().toString()))
                .andExpect(jsonPath("$.strengths[0].text").value("Equipo calificado"))
                .andExpect(jsonPath("$.summary").value("Resumen ejecutivo del diagnóstico"));
    }

    @Test
    @DisplayName("GET /api/v1/swot/{id} returns specific SWOT detail")
    void testGetSwotById() throws Exception {
        SwotAnalysis swot = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(testOrg.getId())
                .strengths(List.of(SwotItem.of("Marca reconocida")))
                .build());

        mockMvc.perform(get("/api/v1/swot/" + swot.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(swot.getId().toString()))
                .andExpect(jsonPath("$.strengths[0].text").value("Marca reconocida"));
    }

    @Test
    @DisplayName("PATCH /api/v1/swot/{id} updates SWOT quadrants and summary")
    void testUpdateSwot() throws Exception {
        SwotAnalysis swot = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(testOrg.getId())
                .strengths(List.of(SwotItem.of("Original")))
                .build());

        UpdateSwotRequest updateReq = UpdateSwotRequest.builder()
                .strengths(List.of(SwotItem.of("Fortaleza editada 1"), SwotItem.of("Fortaleza editada 2")))
                .summary("Nuevo resumen actualizado")
                .build();

        mockMvc.perform(patch("/api/v1/swot/" + swot.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strengths").isArray())
                .andExpect(jsonPath("$.strengths[0].text").value("Fortaleza editada 1"))
                .andExpect(jsonPath("$.summary").value("Nuevo resumen actualizado"));
    }

    @Test
    @DisplayName("POST /api/v1/swot/{id}/items adds item to specified quadrant")
    void testAddItemToQuadrant() throws Exception {
        SwotAnalysis swot = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(testOrg.getId())
                .build());

        AddSwotItemRequest itemReq = AddSwotItemRequest.builder()
                .quadrant("opportunities")
                .text("Lanzamiento de API pública de cobros")
                .evidenceIds(List.of(testTrend.getId().toString()))
                .build();

        mockMvc.perform(post("/api/v1/swot/" + swot.getId() + "/items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.opportunities").isArray())
                .andExpect(jsonPath("$.opportunities[0].text").value("Lanzamiento de API pública de cobros"))
                .andExpect(jsonPath("$.opportunities[0].evidenceIds[0]").value(testTrend.getId().toString()));
    }

    @Test
    @DisplayName("DELETE /api/v1/swot/{id}/items/{itemId} removes item from quadrant")
    void testRemoveItemFromQuadrant() throws Exception {
        SwotItem item1 = SwotItem.of("A mantener");
        SwotItem item2 = SwotItem.of("A eliminar");

        SwotAnalysis swot = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(testOrg.getId())
                .strengths(new java.util.ArrayList<>(List.of(item1, item2)))
                .build());

        mockMvc.perform(delete("/api/v1/swot/" + swot.getId() + "/items/" + item2.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strengths").isArray())
                .andExpect(jsonPath("$.strengths.length()").value(1))
                .andExpect(jsonPath("$.strengths[0].text").value("A mantener"));
    }

    @Test
    @DisplayName("GET /api/v1/swot/{id}/evidence returns associated trends evidence")
    void testGetEvidence() throws Exception {
        SwotAnalysis swot = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(testOrg.getId())
                .build());

        evidenceRefRepository.save(EvidenceRef.builder()
                .organizationId(testOrg.getId())
                .entityType("SWOT")
                .entityId(swot.getId())
                .trend(testTrend)
                .note("Validado con LangChain")
                .weight(92)
                .build());

        mockMvc.perform(get("/api/v1/swot/" + swot.getId() + "/evidence")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].trendTitle").value(testTrend.getTitle()))
                .andExpect(jsonPath("$[0].weight").value(92));
    }

    @Test
    @DisplayName("DELETE /api/v1/swot/{id} deletes SWOT and evidence refs")
    void testDeleteSwot() throws Exception {
        SwotAnalysis swot = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(testOrg.getId())
                .build());

        evidenceRefRepository.save(EvidenceRef.builder()
                .organizationId(testOrg.getId())
                .entityType("SWOT")
                .entityId(swot.getId())
                .trend(testTrend)
                .build());

        mockMvc.perform(delete("/api/v1/swot/" + swot.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        assertThat(swotAnalysisRepository.findById(swot.getId())).isEmpty();
        assertThat(evidenceRefRepository.findByOrganizationIdAndEntityTypeAndEntityId(testOrg.getId(), "SWOT", swot.getId())).isEmpty();
    }

    @Test
    @DisplayName("Multi-tenant isolation: User from Organization B cannot access SWOT of Organization A")
    void testMultiTenantIsolation() throws Exception {
        SwotAnalysis swotOrgA = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(testOrg.getId())
                .strengths(List.of(SwotItem.of("Estrategia secreta Org A")))
                .build());

        // Create Org B & User B
        Organization orgB = organizationRepository.save(Organization.builder()
                .name("Beta Corp")
                .slug("beta-" + UUID.randomUUID())
                .build());

        User userB = userRepository.save(User.builder()
                .name("Other User")
                .email("other-" + UUID.randomUUID() + "@beta.com")
                .passwordHash("hashed")
                .build());

        String jwtOrgB = jwtService.generateAccessToken(
                userB,
                orgB.getId(),
                Role.OWNER,
                Set.of()
        );

        mockMvc.perform(get("/api/v1/swot/" + swotOrgA.getId())
                        .header("Authorization", "Bearer " + jwtOrgB))
                .andExpect(status().isNotFound());
    }
}
