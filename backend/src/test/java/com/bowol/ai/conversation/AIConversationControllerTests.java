package com.bowol.ai.conversation;

import com.bowol.ai.conversation.dto.CreateConversationRequest;
import com.bowol.ai.conversation.dto.SendMessageRequest;
import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.OrganizationSize;
import com.bowol.organization.Role;
import com.bowol.source.TrendSource;
import com.bowol.source.TrendSourceCode;
import com.bowol.source.TrendSourceRepository;
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
class AIConversationControllerTests {

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
    private AIConversationRepository conversationRepository;

    @Autowired
    private ConversationMessageRepository messageRepository;

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
                .externalId("langchain-ai/langchain")
                .title("LangChain Agent Framework")
                .description("Building applications with LLMs through composability.")
                .url("https://github.com/langchain-ai/langchain")
                .score(94)
                .tags(List.of("llm", "agents"))
                .metadata(Map.of("stars", 85000L))
                .build());

        jwtToken = jwtService.generateAccessToken(
                testUser,
                testOrg.getId(),
                Role.OWNER,
                Set.of("AI_CONVERSATION_CREATE", "AI_CONVERSATION_READ")
        );
    }

    @Test
    @DisplayName("POST /api/v1/ai/conversations creates general conversation")
    void testCreateGeneralConversation() throws Exception {
        CreateConversationRequest request = CreateConversationRequest.builder()
                .title("Estrategia Q4")
                .contextType(ConversationContextType.GENERAL)
                .build();

        mockMvc.perform(post("/api/v1/ai/conversations")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Estrategia Q4"))
                .andExpect(jsonPath("$.contextType").value("GENERAL"))
                .andExpect(jsonPath("$.organizationId").value(testOrg.getId().toString()));
    }

    @Test
    @DisplayName("POST /api/v1/ai/conversations anchored to a trend automatically sets title and context")
    void testCreateTrendAnchoredConversation() throws Exception {
        CreateConversationRequest request = CreateConversationRequest.builder()
                .contextType(ConversationContextType.TREND)
                .contextId(testTrend.getId())
                .build();

        mockMvc.perform(post("/api/v1/ai/conversations")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contextType").value("TREND"))
                .andExpect(jsonPath("$.contextId").value(testTrend.getId().toString()))
                .andExpect(jsonPath("$.title").value("Estrategia: " + testTrend.getTitle()));
    }

    @Test
    @DisplayName("POST /api/v1/ai/conversations/{id}/messages sends message, executes Mock AI and returns assistant response with token audit")
    void testSendMessageAndReceiveAiResponse() throws Exception {
        // 1. Create conversation
        AIConversation conv = conversationRepository.save(AIConversation.builder()
                .organizationId(testOrg.getId())
                .userId(testUser.getId())
                .contextType(ConversationContextType.TREND)
                .contextId(testTrend.getId())
                .title("Análisis LangChain")
                .build());

        SendMessageRequest request = new SendMessageRequest("¿Cómo podemos aplicar este framework para reducir costes?");

        // 2. Send message
        mockMvc.perform(post("/api/v1/ai/conversations/" + conv.getId() + "/messages")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ASSISTANT"))
                .andExpect(jsonPath("$.content").isNotEmpty())
                .andExpect(jsonPath("$.tokensUsed").isNumber())
                .andExpect(jsonPath("$.metadata.provider").value("mock"));

        // 3. Verify messages in DB
        List<ConversationMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId());
        assertThat(messages).hasSize(2);
        assertThat(messages.get(0).getRole()).isEqualTo(com.bowol.ai.model.AIMessageRole.USER);
        assertThat(messages.get(0).getContent()).isEqualTo("¿Cómo podemos aplicar este framework para reducir costes?");
        assertThat(messages.get(1).getRole()).isEqualTo(com.bowol.ai.model.AIMessageRole.ASSISTANT);
        assertThat(messages.get(1).getContent()).contains("DATO");
    }

    @Test
    @DisplayName("GET /api/v1/ai/conversations/{id} returns conversation detail with full message history")
    void testGetConversationDetail() throws Exception {
        AIConversation conv = conversationRepository.save(AIConversation.builder()
                .organizationId(testOrg.getId())
                .userId(testUser.getId())
                .contextType(ConversationContextType.GENERAL)
                .title("Charla General")
                .build());

        messageRepository.save(ConversationMessage.builder()
                .conversation(conv)
                .role(com.bowol.ai.model.AIMessageRole.USER)
                .content("Hola Copilot")
                .build());

        mockMvc.perform(get("/api/v1/ai/conversations/" + conv.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conversation.id").value(conv.getId().toString()))
                .andExpect(jsonPath("$.messages").isArray())
                .andExpect(jsonPath("$.messages[0].content").value("Hola Copilot"));
    }

    @Test
    @DisplayName("DELETE /api/v1/ai/conversations/{id} removes conversation and cascading messages")
    void testDeleteConversation() throws Exception {
        AIConversation conv = conversationRepository.save(AIConversation.builder()
                .organizationId(testOrg.getId())
                .userId(testUser.getId())
                .contextType(ConversationContextType.GENERAL)
                .title("A borrar")
                .build());

        mockMvc.perform(delete("/api/v1/ai/conversations/" + conv.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        assertThat(conversationRepository.findById(conv.getId())).isEmpty();
    }

    @Test
    @DisplayName("Multi-tenant isolation: User from Organization B cannot access conversation of Organization A")
    void testMultiTenantIsolation() throws Exception {
        AIConversation convOrgA = conversationRepository.save(AIConversation.builder()
                .organizationId(testOrg.getId())
                .userId(testUser.getId())
                .contextType(ConversationContextType.GENERAL)
                .title("Confidencial Org A")
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

        mockMvc.perform(get("/api/v1/ai/conversations/" + convOrgA.getId())
                        .header("Authorization", "Bearer " + jwtOrgB))
                .andExpect(status().isNotFound());
    }
}
