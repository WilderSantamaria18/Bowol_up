package com.bowol.sprint;

import com.bowol.auth.JwtService;
import com.bowol.organization.*;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.sprint.dto.CompleteSprintRequest;
import com.bowol.sprint.dto.CreateSprintRequest;
import com.bowol.sprint.dto.UpdateSprintRequest;
import com.bowol.task.Task;
import com.bowol.task.TaskPriority;
import com.bowol.task.TaskRepository;
import com.bowol.task.TaskStatus;
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
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SprintControllerTests {

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
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskRepository taskRepository;

    private User userA;
    private Organization orgA;
    private String tokenA;
    private Project projectA;

    private User userB;
    private Organization orgB;
    private String tokenB;

    @BeforeEach
    void setUp() {
        userA = userRepository.save(User.builder()
                .name("Scrum Master A")
                .email("scrum-a-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("hashed")
                .build());

        orgA = organizationRepository.save(Organization.builder()
                .name("Agile Org A")
                .slug("agile-a-" + UUID.randomUUID())
                .build());

        memberRepository.save(OrganizationMember.builder()
                .organization(orgA)
                .user(userA)
                .role(Role.OWNER)
                .build());

        tokenA = jwtService.generateAccessToken(
                userA,
                orgA.getId(),
                Role.OWNER,
                Set.of("PROJECT_READ", "PROJECT_CREATE", "TASK_READ", "TASK_CREATE")
        );

        Project pA = Project.builder()
                .name("Portal de Telemedicina")
                .description("MVP de videoconsultas médicas")
                .status(ProjectStatus.ACTIVE)
                .createdBy(userA.getId())
                .build();
        pA.setOrganizationId(orgA.getId());
        projectA = projectRepository.save(pA);

        // Org B setup for tenant isolation tests
        userB = userRepository.save(User.builder()
                .name("User Org B")
                .email("user-b-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("hashed")
                .build());

        orgB = organizationRepository.save(Organization.builder()
                .name("Other Org B")
                .slug("other-b-" + UUID.randomUUID())
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
                Set.of("PROJECT_READ", "PROJECT_CREATE", "TASK_READ", "TASK_CREATE")
        );
    }

    @Test
    @DisplayName("POST /api/v1/projects/{id}/sprints creates sprint in PLANNED status")
    void testCreateSprintSuccess() throws Exception {
        CreateSprintRequest request = CreateSprintRequest.builder()
                .name("Sprint 1: Autenticación y Perfil")
                .goal("Entregar flujo de registro, login y gestión de roles")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 14))
                .build();

        mockMvc.perform(post("/api/v1/projects/" + projectA.getId() + "/sprints")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.projectId").value(projectA.getId().toString()))
                .andExpect(jsonPath("$.name").value("Sprint 1: Autenticación y Perfil"))
                .andExpect(jsonPath("$.goal").value("Entregar flujo de registro, login y gestión de roles"))
                .andExpect(jsonPath("$.status").value("PLANNED"))
                .andExpect(jsonPath("$.totalTasks").value(0));
    }

    @Test
    @DisplayName("POST /api/v1/projects/{id}/sprints fails when endDate is before startDate")
    void testCreateSprintInvalidDates() throws Exception {
        CreateSprintRequest request = CreateSprintRequest.builder()
                .name("Sprint Inválido")
                .startDate(LocalDate.of(2026, 10, 14))
                .endDate(LocalDate.of(2026, 10, 1))
                .build();

        mockMvc.perform(post("/api/v1/projects/" + projectA.getId() + "/sprints")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("FECHA_INVALIDA"));
    }

    @Test
    @DisplayName("GET /api/v1/projects/{id}/sprints returns sprints with calculated agile metrics")
    void testGetProjectSprintsWithMetrics() throws Exception {
        Sprint sprint = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint 1")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 14))
                .status(SprintStatus.ACTIVE)
                .build());

        // Create tasks in sprint
        taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("Tarea 1")
                .status(TaskStatus.DONE)
                .priority(TaskPriority.HIGH)
                .estimateHours(BigDecimal.valueOf(5.0))
                .build());

        taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("Tarea 2")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.MEDIUM)
                .estimateHours(BigDecimal.valueOf(3.0))
                .build());

        mockMvc.perform(get("/api/v1/projects/" + projectA.getId() + "/sprints")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Sprint 1"))
                .andExpect(jsonPath("$[0].totalTasks").value(2))
                .andExpect(jsonPath("$[0].completedTasks").value(1))
                .andExpect(jsonPath("$[0].totalEstimateHours").value(8.0))
                .andExpect(jsonPath("$[0].completedEstimateHours").value(5.0));
    }

    @Test
    @DisplayName("PATCH /api/v1/sprints/{id}/start starts a PLANNED sprint, prevents two active sprints")
    void testStartSprintAndConflictWithExistingActive() throws Exception {
        Sprint sprint1 = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint 1")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 14))
                .status(SprintStatus.PLANNED)
                .build());

        Sprint sprint2 = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint 2")
                .startDate(LocalDate.of(2026, 10, 15))
                .endDate(LocalDate.of(2026, 10, 28))
                .status(SprintStatus.PLANNED)
                .build());

        // Start sprint1 -> 200 OK
        mockMvc.perform(patch("/api/v1/sprints/" + sprint1.getId() + "/start")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // Attempting to start sprint2 while sprint1 is ACTIVE -> 409 Conflict
        mockMvc.perform(patch("/api/v1/sprints/" + sprint2.getId() + "/start")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("SPRINT_ACTIVO_EXISTENTE"));
    }

    @Test
    @DisplayName("PATCH /api/v1/sprints/{id}/complete completes sprint and rolls over incomplete tasks to backlog")
    void testCompleteSprintWithBacklogRollover() throws Exception {
        Sprint sprint = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint 1")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 14))
                .status(SprintStatus.ACTIVE)
                .build());

        Task taskDone = taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("Tarea Terminada")
                .status(TaskStatus.DONE)
                .build());

        Task taskIncomplete = taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("Tarea Pendiente")
                .status(TaskStatus.IN_PROGRESS)
                .build());

        CompleteSprintRequest completeReq = CompleteSprintRequest.builder()
                .moveToBacklog(true)
                .build();

        mockMvc.perform(patch("/api/v1/sprints/" + sprint.getId() + "/complete")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // Verify tasks in database
        Task reloadedDone = taskRepository.findById(taskDone.getId()).orElseThrow();
        assertThat(reloadedDone.getSprintId()).isEqualTo(sprint.getId());

        Task reloadedIncomplete = taskRepository.findById(taskIncomplete.getId()).orElseThrow();
        assertThat(reloadedIncomplete.getSprintId()).isNull(); // Rolled over to backlog
    }

    @Test
    @DisplayName("PATCH /api/v1/sprints/{id}/cancel cancels sprint and moves all tasks to backlog")
    void testCancelSprintMovesTasksToBacklog() throws Exception {
        Sprint sprint = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint a Cancelar")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 14))
                .status(SprintStatus.ACTIVE)
                .build());

        Task task = taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("Tarea en sprint cancelado")
                .status(TaskStatus.TODO)
                .build());

        mockMvc.perform(patch("/api/v1/sprints/" + sprint.getId() + "/cancel")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELED"));

        Task reloadedTask = taskRepository.findById(task.getId()).orElseThrow();
        assertThat(reloadedTask.getSprintId()).isNull();
    }

    @Test
    @DisplayName("Multi-tenant Isolation: User from Org B cannot access or modify Org A's sprint")
    void testMultiTenantSprintIsolation() throws Exception {
        Sprint sprintA = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint Confidencial Org A")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 14))
                .status(SprintStatus.PLANNED)
                .build());

        // Org B tries GET sprintA -> 404
        mockMvc.perform(get("/api/v1/sprints/" + sprintA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries start sprintA -> 404
        mockMvc.perform(patch("/api/v1/sprints/" + sprintA.getId() + "/start")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries complete sprintA -> 404
        mockMvc.perform(patch("/api/v1/sprints/" + sprintA.getId() + "/complete")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries cancel sprintA -> 404
        mockMvc.perform(patch("/api/v1/sprints/" + sprintA.getId() + "/cancel")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries delete sprintA -> 404
        mockMvc.perform(delete("/api/v1/sprints/" + sprintA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries list sprints of projectA -> 404
        mockMvc.perform(get("/api/v1/projects/" + projectA.getId() + "/sprints")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }
}
