package com.bowol.task;

import com.bowol.ai.audit.AIUsageLog;
import com.bowol.ai.audit.AIUsageLogRepository;
import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.opportunity.Opportunity;
import com.bowol.opportunity.OpportunityRepository;
import com.bowol.opportunity.OpportunityStatus;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.project.ProjectMember;
import com.bowol.project.ProjectMemberRepository;
import com.bowol.project.ProjectMemberRole;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.sprint.SprintRepository;
import com.bowol.sprint.SprintStatus;
import com.bowol.sprint.dto.CreateSprintRequest;
import com.bowol.swot.SwotAnalysis;
import com.bowol.swot.SwotAnalysisRepository;
import com.bowol.swot.dto.SwotItem;
import com.bowol.task.dto.UpdateTaskStatusRequest;
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
class StrategicPlannerIntegrationTests {

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
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AIUsageLogRepository aiUsageLogRepository;

    private User primaryUser;
    private Organization primaryOrg;
    private String primaryJwtToken;

    private User rivalUser;
    private Organization rivalOrg;
    private String rivalJwtToken;

    @BeforeEach
    void setUp() {
        // Tenant 1
        primaryUser = userRepository.save(User.builder()
                .name("Santiago Founder")
                .email("santiago-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("hashed")
                .build());

        primaryOrg = organizationRepository.save(Organization.builder()
                .name("Fintech Innovators")
                .slug("fintech-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(primaryOrg)
                .user(primaryUser)
                .role(Role.OWNER)
                .build());

        primaryJwtToken = jwtService.generateAccessToken(
                primaryUser,
                primaryOrg.getId(),
                Role.OWNER,
                Set.of("ROLE_OWNER")
        );

        // Business Profile
        BusinessProfile profile = BusinessProfile.builder()
                .industry("Fintech & Payments")
                .market("LATAM")
                .build();
        profile.setOrganizationId(primaryOrg.getId());
        businessProfileRepository.save(profile);

        // Tenant 2 (Rival)
        rivalUser = userRepository.save(User.builder()
                .name("Rival Founder")
                .email("rival-" + UUID.randomUUID() + "@rival.com")
                .passwordHash("hashed")
                .build());

        rivalOrg = organizationRepository.save(Organization.builder()
                .name("Rival Corp")
                .slug("rival-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(rivalOrg)
                .user(rivalUser)
                .role(Role.OWNER)
                .build());

        rivalJwtToken = jwtService.generateAccessToken(
                rivalUser,
                rivalOrg.getId(),
                Role.OWNER,
                Set.of("ROLE_OWNER")
        );
    }

    @Test
    @DisplayName("Ciclo Completo Fase 7: Estrategia FODA -> Oportunidad RICE -> Proyecto -> Sprint -> Descomposición IA -> Tablero Kanban")
    void completeStrategicPlanningAndExecutionFlow() throws Exception {
        // 1. Matriz FODA existente
        SwotAnalysis swot = swotAnalysisRepository.save(SwotAnalysis.builder()
                .organizationId(primaryOrg.getId())
                .strengths(List.of(SwotItem.of("Arquitectura modular de micro-servicios")))
                .weaknesses(List.of(SwotItem.of("Falta de automatización en facturación")))
                .opportunities(List.of(SwotItem.of("Pagos recurrentes con tarjeta e IA predictiva")))
                .threats(List.of(SwotItem.of("Nuevas normativas bancarias")))
                .summary(Map.of("text", "Oportunidad idónea para construir pasarela de cobros inteligente"))
                .aiProvider("mock")
                .aiModelUsed("gpt-4o")
                .build());

        // 2. Generar oportunidades desde FODA
        String oppsJson = mockMvc.perform(post("/api/v1/opportunities/from-swot/" + swot.getId())
                        .header("Authorization", "Bearer " + primaryJwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.generated").value(2))
                .andReturn().getResponse().getContentAsString();

        String oppIdStr = objectMapper.readTree(oppsJson).get("opportunities").get(0).get("id").asText();
        UUID opportunityId = UUID.fromString(oppIdStr);

        // 3. Convertir Oportunidad a Proyecto
        String projectJson = mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/convert-to-project")
                        .header("Authorization", "Bearer " + primaryJwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.opportunityId").value(opportunityId.toString()))
                .andExpect(jsonPath("$.status").value("PLANNING"))
                .andReturn().getResponse().getContentAsString();

        String projectIdStr = objectMapper.readTree(projectJson).get("id").asText();
        UUID projectId = UUID.fromString(projectIdStr);

        // Verificar que la oportunidad ahora tiene status CONVERTED
        Opportunity convertedOpp = opportunityRepository.findByIdAndOrganizationId(opportunityId, primaryOrg.getId()).orElseThrow();
        assertThat(convertedOpp.getStatus()).isEqualTo(OpportunityStatus.CONVERTED);

        // Verificar ProjectMember asignado como OWNER
        List<ProjectMember> members = projectMemberRepository.findAllByProjectId(projectId);
        assertThat(members).hasSize(1);
        assertThat(members.get(0).getUserId()).isEqualTo(primaryUser.getId());
        assertThat(members.get(0).getRole()).isEqualTo(ProjectMemberRole.OWNER);

        // 4. Crear un Sprint en el Proyecto
        CreateSprintRequest sprintReq = CreateSprintRequest.builder()
                .name("Sprint 1 - Fundación Arquitectónica")
                .goal("Establecer entidades de base de datos y endpoints núcleo")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusWeeks(2))
                .build();

        String sprintJson = mockMvc.perform(post("/api/v1/projects/" + projectId + "/sprints")
                        .header("Authorization", "Bearer " + primaryJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sprintReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Sprint 1 - Fundación Arquitectónica"))
                .andExpect(jsonPath("$.status").value("PLANNED"))
                .andReturn().getResponse().getContentAsString();

        String sprintIdStr = objectMapper.readTree(sprintJson).get("id").asText();
        UUID sprintId = UUID.fromString(sprintIdStr);

        // Iniciar el Sprint
        mockMvc.perform(patch("/api/v1/sprints/" + sprintId + "/start")
                        .header("Authorization", "Bearer " + primaryJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // 5. Descomponer el Proyecto con IA (AI Task Decomposer)
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/decompose")
                        .header("Authorization", "Bearer " + primaryJwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.generatedTasksCount").value(4))
                .andExpect(jsonPath("$.tasks").isArray());

        List<Task> generatedTasks = taskRepository.findAllByProjectIdOrderByPositionAsc(projectId);
        assertThat(generatedTasks).hasSize(4);

        // 6. Consultar Tablero Kanban y avanzar ciclo de una tarea
        mockMvc.perform(get("/api/v1/tasks/board?projectId=" + projectId)
                        .header("Authorization", "Bearer " + primaryJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.BACKLOG.length()").value(4))
                .andExpect(jsonPath("$.DONE.length()").value(0));

        Task firstTask = generatedTasks.get(0);

        // Mover tarea a IN_PROGRESS
        mockMvc.perform(patch("/api/v1/tasks/" + firstTask.getId() + "/status")
                        .header("Authorization", "Bearer " + primaryJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateTaskStatusRequest(TaskStatus.IN_PROGRESS))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // Mover tarea a DONE y verificar completedAt
        mockMvc.perform(patch("/api/v1/tasks/" + firstTask.getId() + "/status")
                        .header("Authorization", "Bearer " + primaryJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateTaskStatusRequest(TaskStatus.DONE))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"))
                .andExpect(jsonPath("$.completedAt").isNotEmpty());

        // Verificar tablero con 3 en BACKLOG y 1 en DONE
        mockMvc.perform(get("/api/v1/tasks/board?projectId=" + projectId)
                        .header("Authorization", "Bearer " + primaryJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.BACKLOG.length()").value(3))
                .andExpect(jsonPath("$.DONE.length()").value(1));

        // 7. Auditoría IA verificada
        List<AIUsageLog> auditLogs = aiUsageLogRepository.findAll();
        assertThat(auditLogs).anyMatch(log -> "PROJECT_DECOMPOSE_BACKLOG".equals(log.getOperation()));

        // 8. Doble Aislamiento Multi-Tenant: Tenant Rival no puede acceder ni a Proyecto, Sprint ni Tarea
        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + rivalJwtToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/sprints/" + sprintId)
                        .header("Authorization", "Bearer " + rivalJwtToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/tasks/" + firstTask.getId())
                        .header("Authorization", "Bearer " + rivalJwtToken))
                .andExpect(status().isNotFound());
    }
}
