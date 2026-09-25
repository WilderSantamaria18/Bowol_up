package com.bowol.opportunity;

import com.bowol.ai.audit.AIUsageLogRepository;
import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.opportunity.dto.CreateOpportunityRequest;
import com.bowol.opportunity.dto.UpdateOpportunityRequest;
import com.bowol.opportunity.dto.UpdateOpportunityStatusRequest;
import com.bowol.organization.*;
import com.bowol.swot.SwotAnalysis;
import com.bowol.swot.SwotAnalysisRepository;
import com.bowol.swot.dto.SwotItem;
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

import java.math.BigDecimal;
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
class OpportunityControllerTests {

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
    private SwotAnalysisRepository swotAnalysisRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private AIUsageLogRepository aiUsageLogRepository;

    @Autowired
    private com.bowol.project.ProjectRepository projectRepository;

    @Autowired
    private com.bowol.project.ProjectMemberRepository projectMemberRepository;

    private User testUser;
    private Organization testOrg;
    private String jwtToken;
    private SwotAnalysis testSwot;

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
                .industry("Fintech / SaaS")
                .size(OrganizationSize.SMALL)
                .market("LATAM")
                .digitalMaturity(80)
                .aiMaturity(65)
                .build();
        profile.setOrganizationId(testOrg.getId());
        businessProfileRepository.save(profile);

        testSwot = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(testOrg.getId())
                .strengths(List.of(SwotItem.of("Equipo técnico ágil"), SwotItem.of("Arquitectura modular")))
                .weaknesses(List.of(SwotItem.of("Presupuesto de marketing limitado")))
                .opportunities(List.of(SwotItem.of("Automatización de atención de clientes"), SwotItem.of("Integración con pagos")))
                .threats(List.of(SwotItem.of("Competidores tradicionales")))
                .summary(Map.of("text", "FODA favorable para desarrollo de software"))
                .aiProvider("mock")
                .aiModelUsed("gpt-4o")
                .build());

        jwtToken = jwtService.generateAccessToken(
                testUser,
                testOrg.getId(),
                Role.OWNER,
                Set.of("OPPORTUNITY_CREATE", "OPPORTUNITY_READ", "OPPORTUNITY_UPDATE", "OPPORTUNITY_DELETE")
        );
    }

    @Test
    @DisplayName("POST /api/v1/opportunities/from-swot/{swotId} generates opportunities and computes deterministic RICE score")
    void testGenerateOpportunitiesFromSwot() throws Exception {
        mockMvc.perform(post("/api/v1/opportunities/from-swot/" + testSwot.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.generated").value(2))
                .andExpect(jsonPath("$.opportunities").isArray())
                .andExpect(jsonPath("$.opportunities[0].title").value("Asistente IA para atención y reservas automáticas"))
                .andExpect(jsonPath("$.opportunities[0].reachScore").value(80))
                .andExpect(jsonPath("$.opportunities[0].impactScore").value(90))
                .andExpect(jsonPath("$.opportunities[0].confidenceScore").value(70))
                .andExpect(jsonPath("$.opportunities[0].effortScore").value(50))
                // (80 * 90 * 70) / (50 * 100) = 504000 / 5000 = 100.80
                .andExpect(jsonPath("$.opportunities[0].priorityScore").value(100.80))
                .andExpect(jsonPath("$.opportunities[0].status").value("IDENTIFIED"));

        // Verify opportunities in DB
        List<Opportunity> all = opportunityRepository.findByOrganizationIdAndSwotAnalysisId(testOrg.getId(), testSwot.getId());
        assertThat(all).hasSize(2);
        assertThat(all.get(0).getPriorityScore()).isEqualByComparingTo("100.80");

        // Verify AI audit log
        assertThat(aiUsageLogRepository.findByOrganizationIdAndOperation(testOrg.getId(), "OPPORTUNITY_GENERATE_FROM_SWOT"))
                .isNotEmpty();
    }

    @Test
    @DisplayName("GET /api/v1/opportunities/board returns Kanban columns grouped by status")
    void testGetBoard() throws Exception {
        opportunityRepository.save(Opportunity.builder()
                .organizationId(testOrg.getId())
                .title("Opp 1")
                .reachScore(90).impactScore(90).confidenceScore(90).effortScore(30)
                .status(OpportunityStatus.IDENTIFIED)
                .build());

        opportunityRepository.save(Opportunity.builder()
                .organizationId(testOrg.getId())
                .title("Opp 2")
                .reachScore(60).impactScore(60).confidenceScore(60).effortScore(40)
                .status(OpportunityStatus.EVALUATING)
                .build());

        mockMvc.perform(get("/api/v1/opportunities/board")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.IDENTIFIED").isArray())
                .andExpect(jsonPath("$.EVALUATING").isArray())
                .andExpect(jsonPath("$.APPROVED").isArray())
                .andExpect(jsonPath("$.REJECTED").isArray())
                .andExpect(jsonPath("$.CONVERTED").isArray())
                .andExpect(jsonPath("$.IDENTIFIED[0].title").value("Opp 1"))
                .andExpect(jsonPath("$.EVALUATING[0].title").value("Opp 2"));
    }

    @Test
    @DisplayName("POST /api/v1/opportunities creates opportunity manually with priority score")
    void testCreateOpportunityManually() throws Exception {
        CreateOpportunityRequest request = CreateOpportunityRequest.builder()
                .title("Integración con Stripe Billing")
                .description("Permite automatizar cobros mensuales y recurrentes")
                .reachScore(75)
                .impactScore(80)
                .confidenceScore(90)
                .effortScore(30)
                .build();

        mockMvc.perform(post("/api/v1/opportunities")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Integración con Stripe Billing"))
                // (75 * 80 * 90) / (30 * 100) = 540000 / 3000 = 180.00
                .andExpect(jsonPath("$.priorityScore").value(180.00))
                .andExpect(jsonPath("$.status").value("IDENTIFIED"));
    }

    @Test
    @DisplayName("PATCH /api/v1/opportunities/{id}/status changes opportunity status")
    void testUpdateStatus() throws Exception {
        Opportunity opp = opportunityRepository.save(Opportunity.builder()
                .organizationId(testOrg.getId())
                .title("A validar")
                .status(OpportunityStatus.IDENTIFIED)
                .build());

        UpdateOpportunityStatusRequest req = UpdateOpportunityStatusRequest.builder()
                .status(OpportunityStatus.APPROVED)
                .build();

        mockMvc.perform(patch("/api/v1/opportunities/" + opp.getId() + "/status")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(opp.getId().toString()))
                .andExpect(jsonPath("$.status").value("APPROVED"));

        Opportunity updated = opportunityRepository.findById(opp.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(OpportunityStatus.APPROVED);
    }

    @Test
    @DisplayName("PATCH /api/v1/opportunities/{id} updates details and recalculates RICE score")
    void testUpdateOpportunity() throws Exception {
        Opportunity opp = opportunityRepository.save(Opportunity.builder()
                .organizationId(testOrg.getId())
                .title("Original")
                .reachScore(50).impactScore(50).confidenceScore(50).effortScore(50)
                .status(OpportunityStatus.IDENTIFIED)
                .build());

        UpdateOpportunityRequest req = UpdateOpportunityRequest.builder()
                .title("Título Actualizado")
                .reachScore(90)
                .impactScore(90)
                .confidenceScore(90)
                .effortScore(10)
                .build();

        mockMvc.perform(patch("/api/v1/opportunities/" + opp.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Título Actualizado"))
                // (90 * 90 * 90) / (10 * 100) = 729000 / 1000 = 729.00
                .andExpect(jsonPath("$.priorityScore").value(729.00));
    }

    @Test
    @DisplayName("DELETE /api/v1/opportunities/{id} deletes opportunity")
    void testDeleteOpportunity() throws Exception {
        Opportunity opp = opportunityRepository.save(Opportunity.builder()
                .organizationId(testOrg.getId())
                .title("A borrar")
                .build());

        mockMvc.perform(delete("/api/v1/opportunities/" + opp.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        assertThat(opportunityRepository.findById(opp.getId())).isEmpty();
    }

    @Test
    @DisplayName("Multi-tenant isolation: User from Org B cannot access or modify Opportunity of Org A")
    void testMultiTenantIsolation() throws Exception {
        Opportunity oppOrgA = opportunityRepository.save(Opportunity.builder()
                .organizationId(testOrg.getId())
                .title("Secreto de Org A")
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

        mockMvc.perform(get("/api/v1/opportunities/" + oppOrgA.getId())
                        .header("Authorization", "Bearer " + jwtOrgB))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/opportunities/{id}/convert-to-project converts opportunity to Project and sets status CONVERTED")
    void testConvertToProject() throws Exception {
        Opportunity opp = opportunityRepository.save(Opportunity.builder()
                .organizationId(testOrg.getId())
                .title("IA para Prospección B2B")
                .description("Generador de leads hiper-personalizados")
                .reachScore(80)
                .impactScore(85)
                .confidenceScore(75)
                .effortScore(40)
                .status(OpportunityStatus.APPROVED)
                .build());

        // 1. Convert to project
        String res = mockMvc.perform(post("/api/v1/opportunities/" + opp.getId() + "/convert-to-project")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("IA para Prospección B2B"))
                .andExpect(jsonPath("$.opportunityId").value(opp.getId().toString()))
                .andExpect(jsonPath("$.status").value("PLANNING"))
                .andExpect(jsonPath("$.organizationId").value(testOrg.getId().toString()))
                .andReturn().getResponse().getContentAsString();

        String projectIdStr = objectMapper.readTree(res).get("id").asText();
        UUID projectId = UUID.fromString(projectIdStr);

        // Verify opportunity status changed to CONVERTED
        Opportunity updatedOpp = opportunityRepository.findByIdAndOrganizationId(opp.getId(), testOrg.getId()).orElseThrow();
        assertThat(updatedOpp.getStatus()).isEqualTo(OpportunityStatus.CONVERTED);

        // Verify project member OWNER created
        List<com.bowol.project.ProjectMember> members = projectMemberRepository.findAllByProjectId(projectId);
        assertThat(members).hasSize(1);
        assertThat(members.get(0).getUserId()).isEqualTo(testUser.getId());
        assertThat(members.get(0).getRole()).isEqualTo(com.bowol.project.ProjectMemberRole.OWNER);

        // 2. Calling convert again is idempotent and returns the same project
        mockMvc.perform(post("/api/v1/opportunities/" + opp.getId() + "/convert-to-project")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(projectIdStr));
    }
}
