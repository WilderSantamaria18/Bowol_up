package com.bowol.social;

import com.bowol.auth.JwtService;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.social.dto.CreateSocialPostRequest;
import com.bowol.social.dto.GenerateSocialContentRequest;
import com.bowol.social.dto.PredictedImpact;
import com.bowol.social.dto.UpdateSocialPostRequest;
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
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SocialControllerTests {

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
    private SocialPostRepository socialPostRepository;

    private User userOrgA;
    private Organization orgA;
    private String tokenOrgA;

    private User userOrgB;
    private Organization orgB;
    private String tokenOrgB;

    @BeforeEach
    void setUp() {
        // Tenant A
        orgA = organizationRepository.save(Organization.builder()
                .name("Acme A")
                .slug("acme-a-" + UUID.randomUUID())
                .build());

        userOrgA = userRepository.save(User.builder()
                .email("user-a-" + UUID.randomUUID() + "@acme.com")
                .passwordHash("hashed")
                .name("User A")
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .organization(orgA)
                .user(userOrgA)
                .role(Role.OWNER)
                .build());

        tokenOrgA = jwtService.generateAccessToken(userOrgA, orgA.getId(), Role.OWNER, Set.of("READ", "WRITE"));

        // Tenant B
        orgB = organizationRepository.save(Organization.builder()
                .name("Beta B")
                .slug("beta-b-" + UUID.randomUUID())
                .build());

        userOrgB = userRepository.save(User.builder()
                .email("user-b-" + UUID.randomUUID() + "@beta.com")
                .passwordHash("hashed")
                .name("User B")
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .organization(orgB)
                .user(userOrgB)
                .role(Role.OWNER)
                .build());

        tokenOrgB = jwtService.generateAccessToken(userOrgB, orgB.getId(), Role.OWNER, Set.of("READ", "WRITE"));
    }

    @Test
    @DisplayName("POST /api/v1/social/posts crea una publicación y GET /api/v1/social/posts la lista")
    void testCreateAndListPosts() throws Exception {
        CreateSocialPostRequest request = CreateSocialPostRequest.builder()
                .channel(SocialChannel.LINKEDIN)
                .title("Lanzamiento de producto Q3")
                .content("Estamos emocionados de presentar nuestra nueva solución impulsada por IA. #Innovation")
                .tags(List.of("Innovation", "AI"))
                .predictedImpact(PredictedImpact.builder()
                        .reachEstimateMin(2000)
                        .reachEstimateMax(4500)
                        .engagementRate(5.2)
                        .viralityScore(80)
                        .sentiment("POSITIVE")
                        .bestTimeToPost("Martes 09:00 AM")
                        .strategicReasoning("Audiencia B2B activa a primera hora")
                        .build())
                .build();

        String res = mockMvc.perform(post("/api/v1/social/posts")
                        .header("Authorization", "Bearer " + tokenOrgA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Lanzamiento de producto Q3"))
                .andExpect(jsonPath("$.channel").value("LINKEDIN"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.predictedImpact.viralityScore").value(80))
                .andReturn().getResponse().getContentAsString();

        UUID postId = UUID.fromString(objectMapper.readTree(res).get("id").asText());

        // List posts
        mockMvc.perform(get("/api/v1/social/posts")
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(postId.toString()));
    }

    @Test
    @DisplayName("POST /api/v1/social/posts/{id}/publish publica la entrada y registra la fecha de publicación")
    void testPublishPost() throws Exception {
        SocialPost post = SocialPost.builder()
                .channel(SocialChannel.TWITTER_X)
                .title("Tweet rápido")
                .content("Probando hipótesis con datos reales. #Agile")
                .status(SocialPostStatus.DRAFT)
                .build();
        post.setOrganizationId(orgA.getId());
        post = socialPostRepository.save(post);

        mockMvc.perform(post("/api/v1/social/posts/" + post.getId() + "/publish")
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.publishedAt").isNotEmpty());

        SocialPost updated = socialPostRepository.findById(post.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(SocialPostStatus.PUBLISHED);
        assertThat(updated.getPublishedAt()).isNotNull();
    }

    @Test
    @DisplayName("DELETE /api/v1/social/posts/{id} realiza borrado lógico")
    void testDeletePost() throws Exception {
        SocialPost post = SocialPost.builder()
                .channel(SocialChannel.LINKEDIN)
                .title("Post a eliminar")
                .content("Contenido temporal...")
                .status(SocialPostStatus.DRAFT)
                .build();
        post.setOrganizationId(orgA.getId());
        post = socialPostRepository.save(post);

        mockMvc.perform(delete("/api/v1/social/posts/" + post.getId())
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/social/posts/" + post.getId())
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/social/generate genera propuestas con IA y estimación de impacto")
    void testGenerateSocialContent() throws Exception {
        GenerateSocialContentRequest request = GenerateSocialContentRequest.builder()
                .topic("Aceleración del ciclo de innovación mediante modelos de lenguaje")
                .channels(List.of(SocialChannel.LINKEDIN, SocialChannel.TWITTER_X))
                .customInstructions("Incluir llamadas a la acción claras para CTOs")
                .build();

        mockMvc.perform(post("/api/v1/social/generate")
                        .header("Authorization", "Bearer " + tokenOrgA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.proposals").isArray())
                .andExpect(jsonPath("$.proposals", hasSize(2)))
                .andExpect(jsonPath("$.proposals[0].predictedImpact.reachEstimateMin").isNotEmpty())
                .andExpect(jsonPath("$.proposals[0].predictedImpact.viralityScore").isNumber());
    }

    @Test
    @DisplayName("Aislamiento multi-tenant: Org B no puede ver ni modificar publicaciones de Org A")
    void testMultiTenantIsolation() throws Exception {
        SocialPost postA = SocialPost.builder()
                .channel(SocialChannel.LINKEDIN)
                .title("Confidencial Org A")
                .content("Estrategia privada")
                .status(SocialPostStatus.DRAFT)
                .build();
        postA.setOrganizationId(orgA.getId());
        postA = socialPostRepository.save(postA);

        // Org B tries to read postA
        mockMvc.perform(get("/api/v1/social/posts/" + postA.getId())
                        .header("Authorization", "Bearer " + tokenOrgB))
                .andExpect(status().isNotFound());

        // Org B lists posts
        mockMvc.perform(get("/api/v1/social/posts")
                        .header("Authorization", "Bearer " + tokenOrgB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Org B tries to delete postA
        mockMvc.perform(delete("/api/v1/social/posts/" + postA.getId())
                        .header("Authorization", "Bearer " + tokenOrgB))
                .andExpect(status().isNotFound());
    }
}
