package com.bowol.hypothesis;

import com.bowol.ai.audit.AIUsageLog;
import com.bowol.ai.audit.AIUsageLogRepository;
import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.hypothesis.dto.CreateHypothesisRequest;
import com.bowol.hypothesis.dto.RecordHypothesisResultRequest;
import com.bowol.hypothesis.dto.UpdateHypothesisRequest;
import com.bowol.opportunity.Opportunity;
import com.bowol.opportunity.OpportunityRepository;
import com.bowol.opportunity.OpportunityStatus;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class HypothesisControllerTests {

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
    private OpportunityRepository opportunityRepository;

    @Autowired
    private HypothesisRepository hypothesisRepository;

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private AIUsageLogRepository aiUsageLogRepository;

    private User testUser;
    private Organization testOrg;
    private String jwtToken;
    private Opportunity testOpportunity;

    private User otherUser;
    private Organization otherOrg;
    private String otherJwtToken;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .name("Lead Scientist")
                .email("scientist-" + UUID.randomUUID() + "@bowol.io")
                .passwordHash("hashed")
                .build());

        testOrg = organizationRepository.save(Organization.builder()
                .name("BioTech Labs")
                .slug("biotech-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(testOrg)
                .user(testUser)
                .role(Role.OWNER)
                .build());

        jwtToken = jwtService.generateAccessToken(
                testUser,
                testOrg.getId(),
                Role.OWNER,
                Set.of("ROLE_OWNER")
        );

        Opportunity opp = Opportunity.builder()
                .title("Suscripción de Diagnóstico Rápido con IA")
                .description("Plataforma SaaS para clínicas con diagnósticos automatizados en < 5 min.")
                .status(OpportunityStatus.IDENTIFIED)
                .build();
        opp.setOrganizationId(testOrg.getId());
        testOpportunity = opportunityRepository.save(opp);

        BusinessProfile profile = BusinessProfile.builder()
                .industry("Salud Digital / HealthTech")
                .market("B2B SaaS Clínicas")
                .build();
        profile.setOrganizationId(testOrg.getId());
        businessProfileRepository.save(profile);

        // Org ajena para pruebas de aislamiento multi-tenant
        otherUser = userRepository.save(User.builder()
                .name("Other User")
                .email("other-" + UUID.randomUUID() + "@other.io")
                .passwordHash("hashed")
                .build());

        otherOrg = organizationRepository.save(Organization.builder()
                .name("Other Org")
                .slug("other-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(otherOrg)
                .user(otherUser)
                .role(Role.OWNER)
                .build());

        otherJwtToken = jwtService.generateAccessToken(
                otherUser,
                otherOrg.getId(),
                Role.OWNER,
                Set.of("ROLE_OWNER")
        );
    }

    @Test
    @DisplayName("POST /api/v1/hypotheses crea una hipótesis manualmente")
    void createHypothesis_success() throws Exception {
        CreateHypothesisRequest request = CreateHypothesisRequest.builder()
                .opportunityId(testOpportunity.getId())
                .statement("Si ofrecemos un piloto gratuito de 14 días a clínicas privadas, el 25% convertirá a plan de pago.")
                .validationMethod("Campaña de cold email y demo guiada a 50 clínicas")
                .successMetric("Tasa de conversión a suscripción anual")
                .targetValue(">= 25%")
                .status(HypothesisStatus.READY)
                .build();

        mockMvc.perform(post("/api/v1/hypotheses")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.opportunityId").value(testOpportunity.getId().toString()))
                .andExpect(jsonPath("$.statement").value(request.getStatement()))
                .andExpect(jsonPath("$.status").value("READY"))
                .andExpect(jsonPath("$.organizationId").value(testOrg.getId().toString()));
    }

    @Test
    @DisplayName("GET /api/v1/hypotheses lista y filtra por oportunidad")
    void getHypotheses_filtersByOpportunity() throws Exception {
        Hypothesis h1 = hypothesisRepository.save(Hypothesis.builder()
                .organizationId(testOrg.getId())
                .opportunityId(testOpportunity.getId())
                .statement("Hipótesis 1 para oportunidad test")
                .status(HypothesisStatus.READY)
                .build());

        Opportunity anotherOpp = opportunityRepository.save(Opportunity.builder()
                .organizationId(testOrg.getId())
                .title("Otra oportunidad")
                .status(OpportunityStatus.IDENTIFIED)
                .build());

        hypothesisRepository.save(Hypothesis.builder()
                .organizationId(testOrg.getId())
                .opportunityId(anotherOpp.getId())
                .statement("Hipótesis de otra oportunidad")
                .status(HypothesisStatus.DRAFT)
                .build());

        mockMvc.perform(get("/api/v1/hypotheses")
                        .param("opportunityId", testOpportunity.getId().toString())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(h1.getId().toString()));
    }

    @Test
    @DisplayName("PUT /api/v1/hypotheses/{id} actualiza formulación de hipótesis")
    void updateHypothesis_success() throws Exception {
        Hypothesis h = hypothesisRepository.save(Hypothesis.builder()
                .organizationId(testOrg.getId())
                .opportunityId(testOpportunity.getId())
                .statement("Enunciado inicial")
                .status(HypothesisStatus.DRAFT)
                .build());

        UpdateHypothesisRequest request = UpdateHypothesisRequest.builder()
                .statement("Enunciado corregido y más específico")
                .targetValue(">= 30%")
                .status(HypothesisStatus.RUNNING)
                .build();

        mockMvc.perform(put("/api/v1/hypotheses/" + h.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statement").value("Enunciado corregido y más específico"))
                .andExpect(jsonPath("$.targetValue").value(">= 30%"))
                .andExpect(jsonPath("$.status").value("RUNNING"));
    }

    @Test
    @DisplayName("POST /api/v1/hypotheses/{id}/record-result registra resultado SUPPORTED y marca VALIDATED")
    void recordResult_supported() throws Exception {
        Hypothesis h = hypothesisRepository.save(Hypothesis.builder()
                .organizationId(testOrg.getId())
                .opportunityId(testOpportunity.getId())
                .statement("Hipótesis para validar")
                .status(HypothesisStatus.RUNNING)
                .build());

        RecordHypothesisResultRequest request = RecordHypothesisResultRequest.builder()
                .result(HypothesisResult.SUPPORTED)
                .resultNotes("Obtuvimos 28% de conversión superando la meta de 25%.")
                .build();

        mockMvc.perform(post("/api/v1/hypotheses/" + h.getId() + "/record-result")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("SUPPORTED"))
                .andExpect(jsonPath("$.status").value("VALIDATED"))
                .andExpect(jsonPath("$.resultNotes").value(request.getResultNotes()))
                .andExpect(jsonPath("$.validatedAt").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/hypotheses/{id}/record-result registra resultado REFUTED y marca INVALIDATED")
    void recordResult_refuted() throws Exception {
        Hypothesis h = hypothesisRepository.save(Hypothesis.builder()
                .organizationId(testOrg.getId())
                .opportunityId(testOpportunity.getId())
                .statement("Hipótesis que fallará")
                .status(HypothesisStatus.RUNNING)
                .build());

        RecordHypothesisResultRequest request = RecordHypothesisResultRequest.builder()
                .result(HypothesisResult.REFUTED)
                .resultNotes("Conversión apenas alcanzó 4% debido a objeciones presupuestarias.")
                .build();

        mockMvc.perform(post("/api/v1/hypotheses/" + h.getId() + "/record-result")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("REFUTED"))
                .andExpect(jsonPath("$.status").value("INVALIDATED"))
                .andExpect(jsonPath("$.resultNotes").value(request.getResultNotes()))
                .andExpect(jsonPath("$.validatedAt").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/hypotheses/formulate formula hipótesis con IA y audita uso")
    void formulateFromOpportunity_success() throws Exception {
        mockMvc.perform(post("/api/v1/hypotheses/formulate")
                        .param("opportunityId", testOpportunity.getId().toString())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.statement").isNotEmpty())
                .andExpect(jsonPath("$.validationMethod").isNotEmpty())
                .andExpect(jsonPath("$.successMetric").isNotEmpty())
                .andExpect(jsonPath("$.targetValue").isNotEmpty())
                .andExpect(jsonPath("$.status").value("READY"));

        // Verificar que se auditó en AI usage logs
        List<AIUsageLog> logs = aiUsageLogRepository.findAll();
        assertThat(logs).anyMatch(l -> "HYPOTHESIS_FORMULATE".equals(l.getOperation())
                && testOrg.getId().equals(l.getOrganizationId()));
    }

    @Test
    @DisplayName("Aislamiento multi-tenant: otra organización recibe 404 al intentar acceder a la hipótesis")
    void multiTenantIsolation_returnsNotFound() throws Exception {
        Hypothesis h = hypothesisRepository.save(Hypothesis.builder()
                .organizationId(testOrg.getId())
                .opportunityId(testOpportunity.getId())
                .statement("Hipótesis confidencial")
                .status(HypothesisStatus.DRAFT)
                .build());

        mockMvc.perform(get("/api/v1/hypotheses/" + h.getId())
                        .header("Authorization", "Bearer " + otherJwtToken))
                .andExpect(status().isNotFound());
    }
}
