package com.bowol.trend;

import com.bowol.auth.JwtService;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.source.TrendSource;
import com.bowol.source.TrendSourceCode;
import com.bowol.source.TrendSourceRepository;
import com.bowol.trend.dto.MarkRelevantRequest;
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

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TrendControllerTests {

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
    private TrendSourceRepository trendSourceRepository;

    @Autowired
    private TrendRepository trendRepository;

    @Autowired
    private TrendRelevanceRepository trendRelevanceRepository;

    private User testUser;
    private Organization testOrg;
    private String jwtToken;
    private TrendSource githubSource;
    private Trend trend1;
    private Trend trend2;

    @BeforeEach
    void setUp() {
        trendRelevanceRepository.deleteAll();
        trendRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .email("trendhunter-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("hashedpass")
                .name("Trend Analyst")
                .build());

        testOrg = organizationRepository.save(Organization.builder()
                .name("Innovate Corp")
                .slug("innovate-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(testOrg)
                .user(testUser)
                .role(Role.OWNER)
                .build());

        jwtToken = jwtService.generateAccessToken(testUser, testOrg.getId(), Role.OWNER, java.util.Set.of("trend:read", "trend:write"));

        githubSource = trendSourceRepository.save(TrendSource.builder()
                .code(TrendSourceCode.GITHUB)
                .name("GitHub")
                .baseUrl("https://api.github.com")
                .sourceLevel("A")
                .isActive(true)
                .build());

        trend1 = trendRepository.save(Trend.builder()
                .source(githubSource)
                .externalId("deepseek-ai/DeepSeek-V3")
                .title("DeepSeek-V3 Open Model")
                .description("Mixture-of-Experts architecture with 671B parameters.")
                .url("https://github.com/deepseek-ai/DeepSeek-V3")
                .score(96)
                .tags(List.of("moe", "deepseek", "llm"))
                .metadata(Map.of("stars", 58000L, "forks", 7200L))
                .build());

        trend2 = trendRepository.save(Trend.builder()
                .source(githubSource)
                .externalId("microsoft/autogen")
                .title("Microsoft AutoGen")
                .description("Multi-agent conversation framework for LLMs.")
                .url("https://github.com/microsoft/autogen")
                .score(78)
                .tags(List.of("agents", "multi-agent"))
                .metadata(Map.of("stars", 31000L, "forks", 4500L))
                .build());
    }

    @Test
    @DisplayName("GET /api/v1/trends returns paginated trends with tenant relevance status")
    void testGetTrends() throws Exception {
        mockMvc.perform(get("/api/v1/trends")
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].title").value("DeepSeek-V3 Open Model"))
                .andExpect(jsonPath("$.items[0].score").value(96))
                .andExpect(jsonPath("$.items[0].sourceCode").value("GITHUB"))
                .andExpect(jsonPath("$.items[0].relevantForTenant").value(false))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/trends with query and minScore filters results")
    void testGetTrendsFiltered() throws Exception {
        mockMvc.perform(get("/api/v1/trends")
                        .header("Authorization", "Bearer " + jwtToken)
                        .param("query", "DeepSeek")
                        .param("minScore", "90")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].externalId").value("deepseek-ai/DeepSeek-V3"));
    }

    @Test
    @DisplayName("GET /api/v1/trends/{id} returns single trend details")
    void testGetTrendById() throws Exception {
        mockMvc.perform(get("/api/v1/trends/" + trend1.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(trend1.getId().toString()))
                .andExpect(jsonPath("$.title").value("DeepSeek-V3 Open Model"))
                .andExpect(jsonPath("$.sourceName").value("GitHub"));
    }

    @Test
    @DisplayName("GET /api/v1/trends/{id} with non-existent id returns 404")
    void testGetTrendByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/trends/" + UUID.randomUUID())
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/trends/{id}/mark-relevant marks trend for tenant and is retrieved in /for-me")
    void testMarkRelevantAndGetForMe() throws Exception {
        MarkRelevantRequest request = MarkRelevantRequest.builder()
                .score(92)
                .aiSummary("Muy aplicable para reducir costes de inferencia un 80%.")
                .tags(List.of("core-architecture", "cost-saving"))
                .build();

        mockMvc.perform(post("/api/v1/trends/" + trend1.getId() + "/mark-relevant")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationId").value(testOrg.getId().toString()))
                .andExpect(jsonPath("$.score").value(92))
                .andExpect(jsonPath("$.aiSummary").value("Muy aplicable para reducir costes de inferencia un 80%."))
                .andExpect(jsonPath("$.tags[0]").value("core-architecture"));

        // Verify it appears in /for-me
        mockMvc.perform(get("/api/v1/trends/for-me")
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].score").value(92))
                .andExpect(jsonPath("$.items[0].trend.title").value("DeepSeek-V3 Open Model"));

        // Verify it is flagged as relevant in the global list
        mockMvc.perform(get("/api/v1/trends")
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].relevantForTenant").value(true))
                .andExpect(jsonPath("$.items[0].relevanceScore").value(92));
    }

    @Test
    @DisplayName("DELETE /api/v1/trends/{id}/relevance removes tenant relevance")
    void testDismissRelevance() throws Exception {
        // First mark it
        mockMvc.perform(post("/api/v1/trends/" + trend2.getId() + "/mark-relevant")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());

        // Then dismiss it
        mockMvc.perform(delete("/api/v1/trends/" + trend2.getId() + "/relevance")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        // Verify /for-me is now empty
        mockMvc.perform(get("/api/v1/trends/for-me")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    @DisplayName("POST /api/v1/trends/sync triggers source ingestion and returns SyncResult")
    void testTriggerSync() throws Exception {
        mockMvc.perform(post("/api/v1/trends/sync")
                        .header("Authorization", "Bearer " + jwtToken)
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFetched").isNumber())
                .andExpect(jsonPath("$.totalErrors").value(0));
    }

    @Test
    @DisplayName("POST /api/v1/trends/{id}/ai-evaluate executes AI evaluation and returns relevance response")
    void testAiEvaluateTrend() throws Exception {
        mockMvc.perform(post("/api/v1/trends/" + trend1.getId() + "/ai-evaluate")
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationId").value(testOrg.getId().toString()))
                .andExpect(jsonPath("$.score").isNumber())
                .andExpect(jsonPath("$.aiSummary").isString());
    }

    @Test
    @DisplayName("Unauthenticated request to /api/v1/trends returns 401 Unauthorized")
    void testUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/trends")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
