package com.bowol.sprint;

import com.bowol.auth.JwtService;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.sprint.dto.CompleteSprintRequest;
import com.bowol.sprint.dto.CreateSprintRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AgileSprintLifecycleIntegrationTests {

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

    private User userB;
    private Organization orgB;
    private String tokenB;

    private Project projectA;

    @BeforeEach
    void setUp() {
        // Setup Tenant A
        userA = userRepository.save(User.builder()
                .name("Scrum Master A")
                .email("scrum.a." + UUID.randomUUID() + "@bowol.io")
                .passwordHash("hashA")
                .build());

        orgA = organizationRepository.save(Organization.builder()
                .name("Tenant Agile Corp A")
                .slug("tenant-agile-a-" + UUID.randomUUID())
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

        // Setup Tenant B (Foreign)
        userB = userRepository.save(User.builder()
                .name("Scrum Master B")
                .email("scrum.b." + UUID.randomUUID() + "@bowol.io")
                .passwordHash("hashB")
                .build());

        orgB = organizationRepository.save(Organization.builder()
                .name("Tenant Agile Corp B")
                .slug("tenant-agile-b-" + UUID.randomUUID())
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

        // Setup Project for Tenant A
        Project pA = Project.builder()
                .name("BOWOL Core Engine Project")
                .description("Agile Execution System")
                .status(ProjectStatus.ACTIVE)
                .createdBy(userA.getId())
                .build();
        pA.setOrganizationId(orgA.getId());
        projectA = projectRepository.save(pA);
    }

    @Test
    @DisplayName("E2E: Full Sprint lifecycle with task rollover, burndown tracking, and velocity computation")
    void completeEndToEndAgileLifecycle_withTaskRolloverAndVelocity() throws Exception {
        LocalDate now = LocalDate.now();

        // 1. Create Sprint 1 (Planned)
        CreateSprintRequest sprint1Req = CreateSprintRequest.builder()
                .name("Sprint 1: Architecture & Auth")
                .goal("Establish core security and domain models")
                .startDate(now.minusDays(14))
                .endDate(now)
                .build();

        String sprint1ResJson = mockMvc.perform(post("/api/v1/projects/{projectId}/sprints", projectA.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sprint1Req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Sprint 1: Architecture & Auth"))
                .andExpect(jsonPath("$.status").value("PLANNED"))
                .andReturn().getResponse().getContentAsString();

        UUID sprint1Id = UUID.fromString(objectMapper.readTree(sprint1ResJson).get("id").asText());

        // 2. Create Sprint 2 (Planned target for rollover)
        CreateSprintRequest sprint2Req = CreateSprintRequest.builder()
                .name("Sprint 2: Agile Metrics & Burndown")
                .goal("Implement sprint velocity and burndown engine")
                .startDate(now.plusDays(1))
                .endDate(now.plusDays(14))
                .build();

        String sprint2ResJson = mockMvc.perform(post("/api/v1/projects/{projectId}/sprints", projectA.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sprint2Req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PLANNED"))
                .andReturn().getResponse().getContentAsString();

        UUID sprint2Id = UUID.fromString(objectMapper.readTree(sprint2ResJson).get("id").asText());

        // 3. Assign 3 Tasks to Sprint 1
        Task task1 = taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint1Id)
                .title("Task 1: JWT & Security Filter")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.HIGH)
                .estimateHours(BigDecimal.valueOf(10.0))
                .position(1000)
                .build());

        Task task2 = taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint1Id)
                .title("Task 2: Sprint Domain Entities")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.HIGH)
                .estimateHours(BigDecimal.valueOf(20.0))
                .position(2000)
                .build());

        Task task3 = taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint1Id)
                .title("Task 3: Burndown Math Engine")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.MEDIUM)
                .estimateHours(BigDecimal.valueOf(15.0))
                .position(3000)
                .build());

        // 4. Start Sprint 1
        mockMvc.perform(patch("/api/v1/sprints/{id}/start", sprint1Id)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // 5. Invariant Check: Verify Scrum constraint - cannot have 2 active sprints in same project
        mockMvc.perform(patch("/api/v1/sprints/{id}/start", sprint2Id)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isConflict());

        // 6. Progress Tasks in Sprint 1: Complete Task 1 & Task 2; leave Task 3 TODO
        task1.setStatus(TaskStatus.DONE);
        taskRepository.save(task1);

        task2.setStatus(TaskStatus.DONE);
        taskRepository.save(task2);

        // 7. Verify Burndown Endpoint
        mockMvc.perform(get("/api/v1/sprints/{id}/burndown", sprint1Id)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sprintId").value(sprint1Id.toString()))
                .andExpect(jsonPath("$.totalEstimatedHours").value(45.0))
                .andExpect(jsonPath("$.remainingHours").value(15.0))
                .andExpect(jsonPath("$.dataPoints").isArray());

        // 8. Verify Sprint Metrics Endpoint
        mockMvc.perform(get("/api/v1/sprints/{id}/metrics", sprint1Id)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks").value(3))
                .andExpect(jsonPath("$.completedTasks").value(2))
                .andExpect(jsonPath("$.todoTasks").value(1))
                .andExpect(jsonPath("$.totalEstimateHours").value(45.0))
                .andExpect(jsonPath("$.completedEstimateHours").value(30.0))
                .andExpect(jsonPath("$.completionRate").value(66.7));

        // 9. Complete Sprint 1 with Rollover of incomplete tasks to Sprint 2
        CompleteSprintRequest completeReq = CompleteSprintRequest.builder()
                .moveToSprintId(sprint2Id)
                .moveToBacklog(false)
                .build();

        mockMvc.perform(patch("/api/v1/sprints/{id}/complete", sprint1Id)
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // 10. Verify Task Allocation post-completion:
        // Completed tasks (task1, task2) must remain mapped to Sprint 1
        Task reloadedTask1 = taskRepository.findById(task1.getId()).orElseThrow();
        Task reloadedTask2 = taskRepository.findById(task2.getId()).orElseThrow();
        assertThat(reloadedTask1.getSprintId()).isEqualTo(sprint1Id);
        assertThat(reloadedTask2.getSprintId()).isEqualTo(sprint1Id);

        // Incomplete task (task3) must be rolled over to Sprint 2
        Task reloadedTask3 = taskRepository.findById(task3.getId()).orElseThrow();
        assertThat(reloadedTask3.getSprintId()).isEqualTo(sprint2Id);

        // 11. Verify Project Velocity Endpoint computes Sprint 1 metrics
        mockMvc.perform(get("/api/v1/projects/{projectId}/velocity", projectA.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value(projectA.getId().toString()))
                .andExpect(jsonPath("$.averageVelocityHours").value(30.0))
                .andExpect(jsonPath("$.averageCompletionRate").value(100.0))
                .andExpect(jsonPath("$.history").isArray())
                .andExpect(jsonPath("$.history[0].sprintId").value(sprint1Id.toString()))
                .andExpect(jsonPath("$.history[0].committedHours").value(30.0))
                .andExpect(jsonPath("$.history[0].completedHours").value(30.0));
    }

    @Test
    @DisplayName("Security: Tenant B cannot access or mutate Tenant A sprints, burndown, or velocity")
    void multiTenantIsolation_foreignTenantDeniedAccess() throws Exception {
        // Create a planned sprint under Tenant A
        Sprint sprintA = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Secret Tenant A Sprint")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(14))
                .status(SprintStatus.PLANNED)
                .build());

        // Tenant B attempts to read Sprint A -> 404 Not Found
        mockMvc.perform(get("/api/v1/sprints/{id}", sprintA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Tenant B attempts to get Burndown -> 404 Not Found
        mockMvc.perform(get("/api/v1/sprints/{id}/burndown", sprintA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Tenant B attempts to get Metrics -> 404 Not Found
        mockMvc.perform(get("/api/v1/sprints/{id}/metrics", sprintA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Tenant B attempts to get Project Velocity -> 404 Not Found
        mockMvc.perform(get("/api/v1/projects/{projectId}/velocity", projectA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Tenant B attempts to start Sprint A -> 404 Not Found
        mockMvc.perform(patch("/api/v1/sprints/{id}/start", sprintA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Tenant B attempts to complete Sprint A -> 404 Not Found
        mockMvc.perform(patch("/api/v1/sprints/{id}/complete", sprintA.getId())
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/projects/{projectId}/sprints/ai-plan - AI Sprint Planner propone objetivo y tareas")
    void planSprintWithAi_success() throws Exception {
        // Create backlog task for projectA
        taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .title("Diseñar esquema relacional y aislamiento multi-tenant")
                .description("Configurar entidades JPA y filtros Hibernate.")
                .priority(TaskPriority.HIGH)
                .status(TaskStatus.BACKLOG)
                .estimateHours(BigDecimal.valueOf(8.0))
                .position(1000)
                .build());

        mockMvc.perform(post("/api/v1/projects/{projectId}/sprints/ai-plan", projectA.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sprintName").isNotEmpty())
                .andExpect(jsonPath("$.sprintGoal").isNotEmpty())
                .andExpect(jsonPath("$.suggestedDurationDays").value(14))
                .andExpect(jsonPath("$.rationale").isNotEmpty());
    }
}
