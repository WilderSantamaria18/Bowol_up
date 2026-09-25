package com.bowol.experiment;

import com.bowol.auth.JwtService;
import com.bowol.experiment.dto.CreateExperimentRequest;
import com.bowol.experiment.dto.RecordExperimentConclusionRequest;
import com.bowol.experiment.dto.UpdateExperimentRequest;
import com.bowol.experiment.dto.UpdateExperimentStatusRequest;
import com.bowol.hypothesis.Hypothesis;
import com.bowol.hypothesis.HypothesisRepository;
import com.bowol.hypothesis.HypothesisStatus;
import com.bowol.opportunity.Opportunity;
import com.bowol.opportunity.OpportunityRepository;
import com.bowol.opportunity.OpportunityStatus;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
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

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ExperimentControllerTests {

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
    private ExperimentRepository experimentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private User testUser;
    private Organization testOrg;
    private String jwtToken;
    private Opportunity testOpportunity;
    private Hypothesis testHypothesis;

    private User otherUser;
    private Organization otherOrg;
    private String otherJwtToken;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .name("Growth Lead")
                .email("growth-" + UUID.randomUUID() + "@bowol.io")
                .passwordHash("hashed")
                .build());

        testOrg = organizationRepository.save(Organization.builder()
                .name("GrowthLab Inc")
                .slug("growthlab-" + UUID.randomUUID())
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
                .title("Onboarding Asistido por Agente Inteligente")
                .description("Reducción de abandono inicial mediante tour interactivo por IA.")
                .status(OpportunityStatus.IDENTIFIED)
                .build();
        opp.setOrganizationId(testOrg.getId());
        testOpportunity = opportunityRepository.save(opp);

        testHypothesis = hypothesisRepository.save(Hypothesis.builder()
                .organizationId(testOrg.getId())
                .opportunityId(testOpportunity.getId())
                .statement("Si guiamos el primer login con un agente paso a paso, la retención a 7 días subirá un 30%.")
                .validationMethod("Prueba A/B en cohorte de nuevos registros")
                .successMetric("Retención D7")
                .targetValue(">= 30%")
                .status(HypothesisStatus.READY)
                .build());

        // Setup para otra organización (multi-tenant)
        otherUser = userRepository.save(User.builder()
                .name("Other Experimenter")
                .email("other-" + UUID.randomUUID() + "@external.com")
                .passwordHash("hashed")
                .build());

        otherOrg = organizationRepository.save(Organization.builder()
                .name("External Co")
                .slug("external-" + UUID.randomUUID())
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
    @DisplayName("POST /api/v1/experiments crea un nuevo experimento en estado PLANNED")
    void createExperiment_success() throws Exception {
        CreateExperimentRequest request = CreateExperimentRequest.builder()
                .hypothesisId(testHypothesis.getId())
                .name("Test A/B Onboarding Interactivo vs Estático")
                .description("Dividir tráfico 50/50 entre onboarding guiado y wizard tradicional")
                .method("Split URL testing en landing y app")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusWeeks(2))
                .status(ExperimentStatus.PLANNED)
                .resultMetric("Tasa de finalización del setup")
                .resultValue("Esperado > 65%")
                .build();

        mockMvc.perform(post("/api/v1/experiments")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.hypothesisId").value(testHypothesis.getId().toString()))
                .andExpect(jsonPath("$.name").value(request.getName()))
                .andExpect(jsonPath("$.status").value("PLANNED"))
                .andExpect(jsonPath("$.organizationId").value(testOrg.getId().toString()));
    }

    @Test
    @DisplayName("GET /api/v1/experiments lista y filtra experimentos por hipótesis")
    void getExperiments_filtersByHypothesis() throws Exception {
        Experiment e1 = experimentRepository.save(Experiment.builder()
                .organizationId(testOrg.getId())
                .hypothesisId(testHypothesis.getId())
                .name("Experimento de la hipótesis principal")
                .status(ExperimentStatus.PLANNED)
                .build());

        Hypothesis anotherHypo = hypothesisRepository.save(Hypothesis.builder()
                .organizationId(testOrg.getId())
                .opportunityId(testOpportunity.getId())
                .statement("Otra hipótesis alternativa")
                .status(HypothesisStatus.DRAFT)
                .build());

        experimentRepository.save(Experiment.builder()
                .organizationId(testOrg.getId())
                .hypothesisId(anotherHypo.getId())
                .name("Experimento de otra hipótesis")
                .status(ExperimentStatus.PLANNED)
                .build());

        mockMvc.perform(get("/api/v1/experiments")
                        .param("hypothesisId", testHypothesis.getId().toString())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(e1.getId().toString()))
                .andExpect(jsonPath("$[0].name").value("Experimento de la hipótesis principal"));
    }

    @Test
    @DisplayName("PUT /api/v1/experiments/{id} actualiza detalles del experimento")
    void updateExperiment_success() throws Exception {
        Experiment e = experimentRepository.save(Experiment.builder()
                .organizationId(testOrg.getId())
                .hypothesisId(testHypothesis.getId())
                .name("Experimento original")
                .status(ExperimentStatus.PLANNED)
                .build());

        UpdateExperimentRequest request = UpdateExperimentRequest.builder()
                .name("Experimento optimizado con nuevas cohortes")
                .resultMetric("Tasa de activación D1")
                .build();

        mockMvc.perform(put("/api/v1/experiments/" + e.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Experimento optimizado con nuevas cohortes"))
                .andExpect(jsonPath("$.resultMetric").value("Tasa de activación D1"));
    }

    @Test
    @DisplayName("PATCH /api/v1/experiments/{id}/status a RUNNING actualiza también la hipótesis a RUNNING")
    void updateStatus_runningPropagatesToHypothesis() throws Exception {
        Experiment e = experimentRepository.save(Experiment.builder()
                .organizationId(testOrg.getId())
                .hypothesisId(testHypothesis.getId())
                .name("Experimento en preparación")
                .status(ExperimentStatus.PLANNED)
                .build());

        UpdateExperimentStatusRequest request = UpdateExperimentStatusRequest.builder()
                .status(ExperimentStatus.RUNNING)
                .build();

        mockMvc.perform(patch("/api/v1/experiments/" + e.getId() + "/status")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RUNNING"));

        // Verificar que la hipótesis pasó a RUNNING
        Hypothesis updatedHypo = hypothesisRepository.findById(testHypothesis.getId()).orElseThrow();
        assertThat(updatedHypo.getStatus()).isEqualTo(HypothesisStatus.RUNNING);
    }

    @Test
    @DisplayName("POST /api/v1/experiments/{id}/conclusion registra hallazgos y marca COMPLETED")
    void recordConclusion_success() throws Exception {
        Experiment e = experimentRepository.save(Experiment.builder()
                .organizationId(testOrg.getId())
                .hypothesisId(testHypothesis.getId())
                .name("Experimento para concluir")
                .status(ExperimentStatus.RUNNING)
                .build());

        RecordExperimentConclusionRequest request = RecordExperimentConclusionRequest.builder()
                .conclusion("El onboarding con IA aumentó la retención D7 en 34%, superando la meta del 30%.")
                .resultMetric("Retención D7")
                .resultValue("34.2%")
                .build();

        mockMvc.perform(post("/api/v1/experiments/" + e.getId() + "/conclusion")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.conclusion").value(request.getConclusion()))
                .andExpect(jsonPath("$.resultValue").value("34.2%"));
    }

    @Test
    @DisplayName("POST /api/v1/hypotheses/{id}/convert-to-project convierte la hipótesis en un proyecto ejecutable")
    void convertHypothesisToProject_success() throws Exception {
        mockMvc.perform(post("/api/v1/hypotheses/" + testHypothesis.getId() + "/convert-to-project")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.opportunityId").value(testOpportunity.getId().toString()))
                .andExpect(jsonPath("$.status").value("PLANNING"));

        // Verificar que la oportunidad quedó CONVERTED y la hipótesis VALIDATED
        Opportunity opp = opportunityRepository.findById(testOpportunity.getId()).orElseThrow();
        assertThat(opp.getStatus()).isEqualTo(OpportunityStatus.CONVERTED);

        Hypothesis hypo = hypothesisRepository.findById(testHypothesis.getId()).orElseThrow();
        assertThat(hypo.getStatus()).isEqualTo(HypothesisStatus.VALIDATED);

        // Idempotencia: segunda llamada no duplica el proyecto
        mockMvc.perform(post("/api/v1/hypotheses/" + testHypothesis.getId() + "/convert-to-project")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Aislamiento multi-tenant: otra organización recibe 404 al intentar acceder al experimento")
    void multiTenantIsolation_returnsNotFound() throws Exception {
        Experiment e = experimentRepository.save(Experiment.builder()
                .organizationId(testOrg.getId())
                .hypothesisId(testHypothesis.getId())
                .name("Experimento confidencial")
                .status(ExperimentStatus.PLANNED)
                .build());

        mockMvc.perform(get("/api/v1/experiments/" + e.getId())
                        .header("Authorization", "Bearer " + otherJwtToken))
                .andExpect(status().isNotFound());
    }
}
