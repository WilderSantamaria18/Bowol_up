package com.bowol.task;

import com.bowol.ai.audit.AIUsageLog;
import com.bowol.ai.audit.AIUsageLogRepository;
import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.sprint.Sprint;
import com.bowol.sprint.SprintRepository;
import com.bowol.task.dto.*;
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
class TaskControllerTests {

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
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AIUsageLogRepository aiUsageLogRepository;

    private User testUser;
    private Organization testOrg;
    private String jwtToken;
    private Project testProject;
    private Sprint testSprint;

    private User otherUser;
    private Organization otherOrg;
    private String otherJwtToken;
    private Project otherProject;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .name("Tech Lead Bowol")
                .email("lead-" + UUID.randomUUID() + "@bowol.com")
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

        jwtToken = jwtService.generateAccessToken(
                testUser,
                testOrg.getId(),
                Role.OWNER,
                Set.of("ROLE_OWNER")
        );

        BusinessProfile profile = BusinessProfile.builder()
                .industry("Fintech / SaaS")
                .build();
        profile.setOrganizationId(testOrg.getId());
        businessProfileRepository.save(profile);

        Project p = Project.builder()
                .name("Motor de Facturación Automática")
                .description("Pipeline de procesamiento de pagos y facturas en tiempo real")
                .status(ProjectStatus.ACTIVE)
                .build();
        p.setOrganizationId(testOrg.getId());
        testProject = projectRepository.save(p);

        testSprint = sprintRepository.save(Sprint.builder()
                .projectId(testProject.getId())
                .name("Sprint 1 - Core Backend")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusWeeks(2))
                .build());

        // Other org setup
        otherUser = userRepository.save(User.builder()
                .name("Other User")
                .email("other-" + UUID.randomUUID() + "@beta.com")
                .passwordHash("hashed")
                .build());

        otherOrg = organizationRepository.save(Organization.builder()
                .name("Beta Corp")
                .slug("beta-" + UUID.randomUUID())
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

        Project pOther = Project.builder()
                .name("Confidential Beta")
                .status(ProjectStatus.ACTIVE)
                .build();
        pOther.setOrganizationId(otherOrg.getId());
        otherProject = projectRepository.save(pOther);
    }

    @Test
    @DisplayName("POST /api/v1/tasks - Crear tarea exitosa con posición incremental")
    void createTask_success() throws Exception {
        CreateTaskRequest req1 = CreateTaskRequest.builder()
                .projectId(testProject.getId())
                .title("Definir esquema de base de datos")
                .description("Modelar tablas y relaciones en PostgreSQL")
                .priority(TaskPriority.HIGH)
                .estimateHours(BigDecimal.valueOf(8.5))
                .build();

        mockMvc.perform(post("/api/v1/tasks")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Definir esquema de base de datos"))
                .andExpect(jsonPath("$.status").value("BACKLOG"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.position").value(1000));

        CreateTaskRequest req2 = CreateTaskRequest.builder()
                .projectId(testProject.getId())
                .title("Implementar controladores REST")
                .build();

        mockMvc.perform(post("/api/v1/tasks")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value(2000));
    }

    @Test
    @DisplayName("GET /api/v1/tasks/board - Obtener tablero Kanban agrupado por estados")
    void getBoard_success() throws Exception {
        taskRepository.save(Task.builder()
                .projectId(testProject.getId())
                .title("Tarea en Backlog")
                .status(TaskStatus.BACKLOG)
                .build());

        taskRepository.save(Task.builder()
                .projectId(testProject.getId())
                .title("Tarea en Progreso")
                .status(TaskStatus.IN_PROGRESS)
                .build());

        mockMvc.perform(get("/api/v1/tasks/board?projectId=" + testProject.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.BACKLOG.length()").value(1))
                .andExpect(jsonPath("$.IN_PROGRESS.length()").value(1))
                .andExpect(jsonPath("$.DONE.length()").value(0));
    }

    @Test
    @DisplayName("PATCH /api/v1/tasks/{id}/status - Cambiar status y registrar completedAt al marcar DONE")
    void updateTaskStatus_success() throws Exception {
        Task task = taskRepository.save(Task.builder()
                .projectId(testProject.getId())
                .title("Tarea a completar")
                .status(TaskStatus.TODO)
                .build());

        UpdateTaskStatusRequest req = UpdateTaskStatusRequest.builder()
                .status(TaskStatus.DONE)
                .build();

        mockMvc.perform(patch("/api/v1/tasks/" + task.getId() + "/status")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"))
                .andExpect(jsonPath("$.completedAt").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/tasks/reorder - Reordenar tareas por drag & drop")
    void reorderTasks_success() throws Exception {
        Task t1 = taskRepository.save(Task.builder()
                .projectId(testProject.getId())
                .title("Tarea 1")
                .status(TaskStatus.TODO)
                .position(1000)
                .build());

        Task t2 = taskRepository.save(Task.builder()
                .projectId(testProject.getId())
                .title("Tarea 2")
                .status(TaskStatus.TODO)
                .position(2000)
                .build());

        ReorderTasksRequest reorderReq = ReorderTasksRequest.builder()
                .moves(List.of(
                        TaskMoveItem.builder().taskId(t1.getId()).status(TaskStatus.IN_PROGRESS).position(1500).build(),
                        TaskMoveItem.builder().taskId(t2.getId()).status(TaskStatus.IN_PROGRESS).position(2500).build()
                ))
                .build();

        mockMvc.perform(post("/api/v1/tasks/reorder")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderReq)))
                .andExpect(status().isOk());

        Task updatedT1 = taskRepository.findById(t1.getId()).orElseThrow();
        assertThat(updatedT1.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(updatedT1.getPosition()).isEqualTo(1500);
    }

    @Test
    @DisplayName("POST /api/v1/projects/{projectId}/decompose - AI Task Decomposer descompone proyecto en backlog")
    void decomposeProject_aiTaskDecomposer() throws Exception {
        mockMvc.perform(post("/api/v1/projects/" + testProject.getId() + "/decompose")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.epicTitle").exists())
                .andExpect(jsonPath("$.generatedTasksCount").value(4))
                .andExpect(jsonPath("$.tasks").isArray())
                .andExpect(jsonPath("$.tasks[0].title").value("Diseñar esquema relacional y aislamiento multi-tenant"))
                .andExpect(jsonPath("$.tasks[0].status").value("BACKLOG"))
                .andExpect(jsonPath("$.tasks[0].priority").value("HIGH"));

        List<Task> projectTasks = taskRepository.findAllByProjectIdOrderByPositionAsc(testProject.getId());
        assertThat(projectTasks).hasSize(4);

        // Verify AI usage logged in ai_usage_logs
        List<AIUsageLog> logs = aiUsageLogRepository.findAll();
        assertThat(logs).isNotEmpty();
        AIUsageLog lastLog = logs.get(logs.size() - 1);
        assertThat(lastLog.getOperation()).isEqualTo("PROJECT_DECOMPOSE_BACKLOG");
        assertThat(lastLog.getOrganizationId()).isEqualTo(testOrg.getId());
    }

    @Test
    @DisplayName("Multi-tenant isolation: No se puede acceder a tareas de otro proyecto/organización")
    void multiTenant_isolation() throws Exception {
        Task secretTask = taskRepository.save(Task.builder()
                .projectId(otherProject.getId())
                .title("Tarea confidencial de Beta Corp")
                .status(TaskStatus.BACKLOG)
                .build());

        // TestOrg user cannot access task of otherOrg
        mockMvc.perform(get("/api/v1/tasks/" + secretTask.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }
}
