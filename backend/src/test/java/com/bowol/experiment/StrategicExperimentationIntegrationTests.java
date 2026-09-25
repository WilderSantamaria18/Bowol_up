package com.bowol.experiment;

import com.bowol.ai.audit.AIUsageLog;
import com.bowol.ai.audit.AIUsageLogRepository;
import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.experiment.dto.CreateExperimentRequest;
import com.bowol.experiment.dto.RecordExperimentConclusionRequest;
import com.bowol.experiment.dto.UpdateExperimentStatusRequest;
import com.bowol.hypothesis.Hypothesis;
import com.bowol.hypothesis.HypothesisRepository;
import com.bowol.hypothesis.HypothesisResult;
import com.bowol.hypothesis.HypothesisStatus;
import com.bowol.hypothesis.dto.RecordHypothesisResultRequest;
import com.bowol.opportunity.Opportunity;
import com.bowol.opportunity.OpportunityRepository;
import com.bowol.opportunity.OpportunityStatus;
import com.bowol.organization.*;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
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

import java.math.BigDecimal;
import java.time.LocalDate;
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
class StrategicExperimentationIntegrationTests {

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
    private OpportunityRepository opportunityRepository;

    @Autowired
    private HypothesisRepository hypothesisRepository;

    @Autowired
    private ExperimentRepository experimentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AIUsageLogRepository aiUsageLogRepository;

    private User userA;
    private Organization orgA;
    private String tokenA;
    private Opportunity oppA;

    private User userB;
    private Organization orgB;
    private String tokenB;

    @BeforeEach
    void setUp() {
        // Org A & User A setup
        userA = userRepository.save(User.builder()
                .name("Founder Org A")
                .email("founder-a-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("hashed")
                .build());

        orgA = organizationRepository.save(Organization.builder()
                .name("Alpha Health AI")
                .slug("alpha-health-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(orgA)
                .user(userA)
                .role(Role.OWNER)
                .build());

        BusinessProfile profileA = BusinessProfile.builder()
                .industry("Healthtech SaaS")
                .size(OrganizationSize.SMALL)
                .market("LATAM")
                .problems(List.of("Demora en diagnósticos", "Retención baja"))
                .tools(List.of("Python", "PostgreSQL", "React"))
                .digitalMaturity(75)
                .aiMaturity(70)
                .build();
        profileA.setOrganizationId(orgA.getId());
        businessProfileRepository.save(profileA);

        Opportunity oA = Opportunity.builder()
                .title("Módulo de Pre-triaje Asistido por Visión Artificial")
                .description("Permitir a clínicas procesar radiografías en menos de 2 minutos.")
                .status(OpportunityStatus.APPROVED)
                .reachScore(1000)
                .impactScore(3)
                .confidenceScore(80)
                .effortScore(2)
                .priorityScore(BigDecimal.valueOf(120.0))
                .build();
        oA.setOrganizationId(orgA.getId());
        oppA = opportunityRepository.save(oA);

        tokenA = jwtService.generateAccessToken(
                userA,
                orgA.getId(),
                Role.OWNER,
                Set.of("HYPOTHESIS_CREATE", "HYPOTHESIS_READ", "EXPERIMENT_CREATE", "EXPERIMENT_READ")
        );

        // Org B & User B setup
        userB = userRepository.save(User.builder()
                .name("Founder Org B")
                .email("founder-b-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("hashed")
                .build());

        orgB = organizationRepository.save(Organization.builder()
                .name("Beta Logistics AI")
                .slug("beta-logistics-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(orgB)
                .user(userB)
                .role(Role.OWNER)
                .build());

        tokenB = jwtService.generateAccessToken(
                userB,
                orgB.getId(),
                Role.OWNER,
                Set.of("HYPOTHESIS_CREATE", "HYPOTHESIS_READ", "EXPERIMENT_CREATE", "EXPERIMENT_READ")
        );
    }

    @Test
    @DisplayName("E2E Strategic Experimentation: Opportunity -> AI Formulate Hypothesis -> Experiment Lifecycle -> Validate Result -> Convert to Project")
    void testEndToEndStrategicExperimentationFlow() throws Exception {
        // =========================================================================
        // STEP 1: AI Hypothesis Formulation from Strategic Opportunity
        // =========================================================================
        MvcResult formulateResult = mockMvc.perform(post("/api/v1/hypotheses/formulate")
                        .param("opportunityId", oppA.getId().toString())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.opportunityId").value(oppA.getId().toString()))
                .andExpect(jsonPath("$.status").value("READY"))
                .andExpect(jsonPath("$.statement").isNotEmpty())
                .andExpect(jsonPath("$.validationMethod").isNotEmpty())
                .andExpect(jsonPath("$.successMetric").isNotEmpty())
                .andExpect(jsonPath("$.targetValue").isNotEmpty())
                .andReturn();

        JsonNode hypoNode = objectMapper.readTree(formulateResult.getResponse().getContentAsString());
        UUID hypothesisId = UUID.fromString(hypoNode.get("id").asText());

        // Verify AI Usage Logging
        List<AIUsageLog> logs = aiUsageLogRepository.findByOrganizationIdAndOperation(orgA.getId(), "HYPOTHESIS_FORMULATE");
        assertThat(logs).isNotEmpty();

        // =========================================================================
        // STEP 2: Create Tactical Experiment linked to Hypothesis
        // =========================================================================
        CreateExperimentRequest createExpReq = CreateExperimentRequest.builder()
                .hypothesisId(hypothesisId)
                .name("Prueba Piloto en 5 Clínicas Asociadas")
                .description("Probar prototipo de pre-triaje con un lote de 200 radiografías sintéticas")
                .method("Piloto Controlado")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 15))
                .resultMetric("Tiempo de análisis por placa")
                .status(ExperimentStatus.PLANNED)
                .build();

        MvcResult expResult = mockMvc.perform(post("/api/v1/experiments")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createExpReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.hypothesisId").value(hypothesisId.toString()))
                .andExpect(jsonPath("$.status").value("PLANNED"))
                .andExpect(jsonPath("$.name").value("Prueba Piloto en 5 Clínicas Asociadas"))
                .andReturn();

        JsonNode expNode = objectMapper.readTree(expResult.getResponse().getContentAsString());
        UUID experimentId = UUID.fromString(expNode.get("id").asText());

        // =========================================================================
        // STEP 3: Transition Experiment to RUNNING
        // =========================================================================
        UpdateExperimentStatusRequest statusReq = UpdateExperimentStatusRequest.builder()
                .status(ExperimentStatus.RUNNING)
                .build();

        mockMvc.perform(patch("/api/v1/experiments/" + experimentId + "/status")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RUNNING"));

        // =========================================================================
        // STEP 4: Record Experiment Conclusion (COMPLETED)
        // =========================================================================
        RecordExperimentConclusionRequest conclusionReq = RecordExperimentConclusionRequest.builder()
                .resultMetric("Tiempo de análisis por placa")
                .resultValue("1.4 minutos")
                .conclusion("El pre-triaje redujo el tiempo promedio de 8 minutos a 1.4 minutos. 96% de precisión.")
                .build();

        mockMvc.perform(post("/api/v1/experiments/" + experimentId + "/conclusion")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conclusionReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.resultValue").value("1.4 minutos"))
                .andExpect(jsonPath("$.conclusion").isNotEmpty());

        // =========================================================================
        // STEP 5: Record Hypothesis Result (SUPPORTED -> VALIDATED)
        // =========================================================================
        RecordHypothesisResultRequest hypoResultReq = RecordHypothesisResultRequest.builder()
                .result(HypothesisResult.SUPPORTED)
                .resultNotes("Experimento piloto exitoso. Los radiólogos validaron el flujo y ahorraron 75% del tiempo.")
                .build();

        mockMvc.perform(post("/api/v1/hypotheses/" + hypothesisId + "/record-result")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hypoResultReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VALIDATED"))
                .andExpect(jsonPath("$.result").value("SUPPORTED"))
                .andExpect(jsonPath("$.resultNotes").isNotEmpty());

        // =========================================================================
        // STEP 6: Convert Validated Hypothesis to Project
        // =========================================================================
        MvcResult projectResult = mockMvc.perform(post("/api/v1/hypotheses/" + hypothesisId + "/convert-to-project")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.status").value("PLANNING"))
                .andExpect(jsonPath("$.opportunityId").value(oppA.getId().toString()))
                .andExpect(jsonPath("$.name").isNotEmpty())
                .andExpect(jsonPath("$.description").isNotEmpty())
                .andReturn();

        JsonNode projectNode = objectMapper.readTree(projectResult.getResponse().getContentAsString());
        UUID projectId = UUID.fromString(projectNode.get("id").asText());

        // Verify Project persistence in DB
        Project project = projectRepository.findById(projectId).orElseThrow();
        assertThat(project.getStatus()).isEqualTo(ProjectStatus.PLANNING);
        assertThat(project.getOrganizationId()).isEqualTo(orgA.getId());
        assertThat(project.getOpportunityId()).isEqualTo(oppA.getId());

        // Test Idempotency: second call returns the same project with 201 Created
        mockMvc.perform(post("/api/v1/hypotheses/" + hypothesisId + "/convert-to-project")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(projectId.toString()));
    }

    @Test
    @DisplayName("Multi-tenant Strict Isolation: Org B cannot access Org A hypotheses or experiments")
    void testMultiTenantStrictIsolationForHypothesesAndExperiments() throws Exception {
        // Given: Org A has an opportunity, hypothesis, and experiment
        Hypothesis hypoA = Hypothesis.builder()
                .organizationId(orgA.getId())
                .opportunityId(oppA.getId())
                .statement("Hipótesis confidencial de Org A")
                .validationMethod("Entrevistas secretas")
                .successMetric("NPS")
                .targetValue(">= 80")
                .status(HypothesisStatus.READY)
                .build();
        hypoA = hypothesisRepository.save(hypoA);

        Experiment expA = Experiment.builder()
                .organizationId(orgA.getId())
                .hypothesisId(hypoA.getId())
                .name("Experimento confidencial Org A")
                .description("Detalles privados")
                .status(ExperimentStatus.PLANNED)
                .build();
        expA = experimentRepository.save(expA);

        // When/Then: Org B tries to read Org A's hypothesis -> 404
        mockMvc.perform(get("/api/v1/hypotheses/" + hypoA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries to update Org A's hypothesis -> 404
        mockMvc.perform(put("/api/v1/hypotheses/" + hypoA.getId())
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statement\":\"Hackeado\"}"))
                .andExpect(status().isNotFound());

        // Org B tries to record result on Org A's hypothesis -> 404
        mockMvc.perform(post("/api/v1/hypotheses/" + hypoA.getId() + "/record-result")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"result\":\"SUPPORTED\"}"))
                .andExpect(status().isNotFound());

        // Org B tries to convert Org A's hypothesis to project -> 404
        mockMvc.perform(post("/api/v1/hypotheses/" + hypoA.getId() + "/convert-to-project")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries to read Org A's experiment -> 404
        mockMvc.perform(get("/api/v1/experiments/" + expA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries to update Org A's experiment status -> 404
        mockMvc.perform(patch("/api/v1/experiments/" + expA.getId() + "/status")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RUNNING\"}"))
                .andExpect(status().isNotFound());

        // Org B tries to record conclusion on Org A's experiment -> 404
        mockMvc.perform(post("/api/v1/experiments/" + expA.getId() + "/conclusion")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"conclusion\":\"Conclusión no autorizada\"}"))
                .andExpect(status().isNotFound());

        // Org B tries to delete Org A's experiment -> 404
        mockMvc.perform(delete("/api/v1/experiments/" + expA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B lists hypotheses -> returns empty list [] (no Org A leakage)
        mockMvc.perform(get("/api/v1/hypotheses")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        // Org B lists experiments -> returns empty list []
        mockMvc.perform(get("/api/v1/experiments")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        // Org B tries to formulate hypothesis using Org A's opportunity -> 404
        mockMvc.perform(post("/api/v1/hypotheses/formulate")
                        .param("opportunityId", oppA.getId().toString())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Filtering Hypotheses & Experiments by status and parent relationships")
    void testFilteringHypothesesAndExperiments() throws Exception {
        // Create 2 hypotheses in Org A
        Hypothesis hypo1 = Hypothesis.builder()
                .organizationId(orgA.getId())
                .opportunityId(oppA.getId())
                .statement("Hipótesis uno")
                .status(HypothesisStatus.READY)
                .build();
        hypo1 = hypothesisRepository.save(hypo1);

        Hypothesis hypo2 = Hypothesis.builder()
                .organizationId(orgA.getId())
                .opportunityId(oppA.getId())
                .statement("Hipótesis dos")
                .status(HypothesisStatus.VALIDATED)
                .result(HypothesisResult.SUPPORTED)
                .build();
        hypo2 = hypothesisRepository.save(hypo2);

        // Create experiments
        Experiment exp1 = Experiment.builder()
                .organizationId(orgA.getId())
                .hypothesisId(hypo1.getId())
                .name("Exp 1")
                .status(ExperimentStatus.PLANNED)
                .build();
        exp1 = experimentRepository.save(exp1);

        Experiment exp2 = Experiment.builder()
                .organizationId(orgA.getId())
                .hypothesisId(hypo1.getId())
                .name("Exp 2")
                .status(ExperimentStatus.COMPLETED)
                .build();
        exp2 = experimentRepository.save(exp2);

        // Filter hypotheses by status VALIDATED
        mockMvc.perform(get("/api/v1/hypotheses")
                        .param("status", "VALIDATED")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].statement").value("Hipótesis dos"));

        // Filter experiments by hypothesisId and status COMPLETED
        mockMvc.perform(get("/api/v1/experiments")
                        .param("hypothesisId", hypo1.getId().toString())
                        .param("status", "COMPLETED")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Exp 2"));
    }
}
