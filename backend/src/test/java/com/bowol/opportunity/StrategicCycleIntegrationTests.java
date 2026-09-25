package com.bowol.opportunity;

import com.bowol.ai.audit.AIUsageLogRepository;
import com.bowol.ai.conversation.AIConversationRepository;
import com.bowol.ai.conversation.ConversationContextType;
import com.bowol.ai.conversation.dto.CreateConversationRequest;
import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.organization.*;
import com.bowol.source.TrendSource;
import com.bowol.source.TrendSourceCode;
import com.bowol.source.TrendSourceRepository;
import com.bowol.swot.EvidenceRef;
import com.bowol.swot.EvidenceRefRepository;
import com.bowol.swot.SwotAnalysis;
import com.bowol.swot.SwotAnalysisRepository;
import com.bowol.swot.dto.GenerateSwotRequest;
import com.bowol.trend.Trend;
import com.bowol.trend.TrendRepository;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.test.web.servlet.MvcResult;
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
class StrategicCycleIntegrationTests {

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
    private OpportunityRepository opportunityRepository;

    @Autowired
    private EvidenceRefRepository evidenceRefRepository;

    @Autowired
    private AIUsageLogRepository aiUsageLogRepository;

    @Autowired
    private AIConversationRepository conversationRepository;

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
                .name("Fintech Horizon")
                .slug("fintech-horizon-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(testOrg)
                .user(testUser)
                .role(Role.OWNER)
                .build());

        BusinessProfile profile = BusinessProfile.builder()
                .industry("Fintech / B2B SaaS")
                .size(OrganizationSize.SMALL)
                .market("LATAM")
                .problems(List.of("Alta tasa de abandono en checkout", "Costes elevados de soporte"))
                .tools(List.of("PostgreSQL", "React", "Docker"))
                .digitalMaturity(80)
                .aiMaturity(60)
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
                .externalId("langchain-ai/langgraph")
                .title("LangGraph Multi-Agent Workflows")
                .description("Build resilient agent architectures with cyclical graphs.")
                .url("https://github.com/langchain-ai/langgraph")
                .score(95)
                .tags(List.of("agents", "multi-agent", "workflow"))
                .metadata(Map.of("stars", 18000L))
                .build());

        jwtToken = jwtService.generateAccessToken(
                testUser,
                testOrg.getId(),
                Role.OWNER,
                Set.of("SWOT_CREATE", "SWOT_READ", "OPPORTUNITY_CREATE", "OPPORTUNITY_READ", "OPPORTUNITY_UPDATE", "AI_CONVERSATION_CREATE")
        );
    }

    @Test
    @DisplayName("Complete Strategic Cycle: Trend Relevance -> SWOT Generation -> Opportunity RICE -> Kanban -> Copilot Context")
    void testFullStrategicInnovationLoop() throws Exception {
        // =========================================================================
        // STEP 1: AI Trend Relevance Evaluation (Intelligence Layer)
        // =========================================================================
        mockMvc.perform(post("/api/v1/trends/" + testTrend.getId() + "/ai-evaluate")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(88))
                .andExpect(jsonPath("$.strategicAlignment").value("HIGH"));

        // =========================================================================
        // STEP 2: AI SWOT Analysis Generation (Strategy Diagnosis Layer)
        // =========================================================================
        GenerateSwotRequest swotReq = GenerateSwotRequest.builder()
                .includeTrends(true)
                .maxTrends(10)
                .build();

        MvcResult swotResult = mockMvc.perform(post("/api/v1/swot/generate")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(swotReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.strengths").isArray())
                .andExpect(jsonPath("$.opportunities").isArray())
                .andExpect(jsonPath("$.summary").isNotEmpty())
                .andReturn();

        JsonNode swotNode = objectMapper.readTree(swotResult.getResponse().getContentAsString());
        UUID swotId = UUID.fromString(swotNode.get("id").asText());

        // Verify evidence references created linking Trend to SWOT
        List<EvidenceRef> swotEvidences = evidenceRefRepository.findByOrganizationIdAndEntityTypeAndEntityId(
                testOrg.getId(), "SWOT", swotId);
        assertThat(swotEvidences).isNotEmpty();
        assertThat(swotEvidences.get(0).getTrend().getId()).isEqualTo(testTrend.getId());

        // =========================================================================
        // STEP 3: Generate Opportunities with Deterministic RICE Scoring
        // =========================================================================
        MvcResult oppResult = mockMvc.perform(post("/api/v1/opportunities/from-swot/" + swotId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.generated").value(2))
                .andExpect(jsonPath("$.opportunities").isArray())
                .andExpect(jsonPath("$.opportunities[0].priorityScore").value(100.80))
                .andExpect(jsonPath("$.opportunities[0].status").value("IDENTIFIED"))
                .andReturn();

        JsonNode oppNode = objectMapper.readTree(oppResult.getResponse().getContentAsString());
        UUID oppId = UUID.fromString(oppNode.get("opportunities").get(0).get("id").asText());

        // =========================================================================
        // STEP 4: Transition Opportunity to APPROVED in Kanban Board
        // =========================================================================
        mockMvc.perform(patch("/api/v1/opportunities/" + oppId + "/status")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"APPROVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // Verify Kanban Board groups correctly
        mockMvc.perform(get("/api/v1/opportunities/board")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.APPROVED[0].id").value(oppId.toString()))
                .andExpect(jsonPath("$.APPROVED[0].priorityScore").value(100.80));

        // =========================================================================
        // STEP 5: Start Strategic Copilot Conversation Anchored to this Opportunity
        // =========================================================================
        CreateConversationRequest convReq = CreateConversationRequest.builder()
                .title("Estrategia para Oportunidad Aprobada")
                .contextType(ConversationContextType.OPPORTUNITY)
                .contextId(oppId)
                .build();

        mockMvc.perform(post("/api/v1/ai/conversations")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(convReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.contextType").value("OPPORTUNITY"))
                .andExpect(jsonPath("$.contextId").value(oppId.toString()));

        // =========================================================================
        // STEP 6: Multi-Tenant Isolation Check (Postgres RLS & JPA Tenant Filter)
        // =========================================================================
        Organization orgB = organizationRepository.save(Organization.builder()
                .name("Competitor Beta")
                .slug("competitor-" + UUID.randomUUID())
                .build());

        User userB = userRepository.save(User.builder()
                .name("User Beta")
                .email("user-" + UUID.randomUUID() + "@beta.com")
                .passwordHash("hashed")
                .build());

        String jwtOrgB = jwtService.generateAccessToken(
                userB,
                orgB.getId(),
                Role.OWNER,
                Set.of("SWOT_READ", "OPPORTUNITY_READ")
        );

        // Org B cannot access Org A's SWOT
        mockMvc.perform(get("/api/v1/swot/" + swotId)
                        .header("Authorization", "Bearer " + jwtOrgB))
                .andExpect(status().isNotFound());

        // Org B cannot access Org A's Opportunity
        mockMvc.perform(get("/api/v1/opportunities/" + oppId)
                        .header("Authorization", "Bearer " + jwtOrgB))
                .andExpect(status().isNotFound());

        // Org B's board has zero opportunities
        mockMvc.perform(get("/api/v1/opportunities/board")
                        .header("Authorization", "Bearer " + jwtOrgB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.APPROVED").isEmpty())
                .andExpect(jsonPath("$.IDENTIFIED").isEmpty());
    }
}
