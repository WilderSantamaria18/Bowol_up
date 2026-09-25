package com.bowol.sprint;

import com.bowol.auth.JwtService;
import com.bowol.organization.*;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.task.Task;
import com.bowol.task.TaskPriority;
import com.bowol.task.TaskRepository;
import com.bowol.task.TaskStatus;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AgileMetricsTests {

    @Autowired
    private MockMvc mockMvc;

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
                .name("Agile Coach A")
                .email("agile-a-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("hashed")
                .build());

        orgA = organizationRepository.save(Organization.builder()
                .name("Metrics Org A")
                .slug("metrics-a-" + UUID.randomUUID())
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
                Set.of("PROJECT_READ", "PROJECT_CREATE", "TASK_READ")
        );

        Project pA = Project.builder()
                .name("Plataforma SaaS")
                .description("Proyecto ágil con métricas de velocidad")
                .status(ProjectStatus.ACTIVE)
                .createdBy(userA.getId())
                .build();
        pA.setOrganizationId(orgA.getId());
        projectA = projectRepository.save(pA);

        // Org B setup for tenant isolation
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
                Set.of("PROJECT_READ", "PROJECT_CREATE", "TASK_READ")
        );
    }

    @Test
    @DisplayName("GET /api/v1/sprints/{id}/burndown returns ideal and actual burn-down trajectories")
    void testGetSprintBurndownTrajectory() throws Exception {
        LocalDate start = LocalDate.now().minusDays(5);
        LocalDate end = LocalDate.now().plusDays(5);

        Sprint sprint = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint Burndown Test")
                .startDate(start)
                .endDate(end)
                .status(SprintStatus.ACTIVE)
                .build());

        // Task 1: 10 hours completed 2 days ago
        Task t1 = Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("T1")
                .status(TaskStatus.DONE)
                .estimateHours(BigDecimal.valueOf(10.0))
                .completedAt(Instant.now().minus(2, ChronoUnit.DAYS))
                .build();
        taskRepository.save(t1);

        // Task 2: 15 hours in progress
        Task t2 = Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("T2")
                .status(TaskStatus.IN_PROGRESS)
                .estimateHours(BigDecimal.valueOf(15.0))
                .build();
        taskRepository.save(t2);

        mockMvc.perform(get("/api/v1/sprints/" + sprint.getId() + "/burndown")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sprintId").value(sprint.getId().toString()))
                .andExpect(jsonPath("$.sprintName").value("Sprint Burndown Test"))
                .andExpect(jsonPath("$.totalEstimatedHours").value(25.0))
                .andExpect(jsonPath("$.remainingHours").value(15.0))
                .andExpect(jsonPath("$.dataPoints").isArray())
                .andExpect(jsonPath("$.dataPoints.length()").value(11)) // 11 days (5 past + today + 5 future)
                .andExpect(jsonPath("$.dataPoints[0].idealHours").value(25.0)) // day 0 ideal = total
                .andExpect(jsonPath("$.dataPoints[10].idealHours").value(0.0)); // day 10 ideal = 0
    }

    @Test
    @DisplayName("GET /api/v1/sprints/{id}/metrics returns detailed agile KPIs and cycle time")
    void testGetSprintMetrics() throws Exception {
        Sprint sprint = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint Metrics Test")
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now())
                .status(SprintStatus.ACTIVE)
                .build());

        // Completed task with 4 hours cycle time
        Instant now = Instant.now();
        Instant fourHoursAgo = now.minus(4, ChronoUnit.HOURS);
        Task t1 = Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("Tarea Terminada 1")
                .status(TaskStatus.DONE)
                .estimateHours(BigDecimal.valueOf(8.0))
                .createdAt(fourHoursAgo)
                .completedAt(now)
                .build();
        taskRepository.save(t1);

        // In progress task
        Task t2 = Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("Tarea En Progreso")
                .status(TaskStatus.IN_PROGRESS)
                .estimateHours(BigDecimal.valueOf(4.0))
                .build();
        taskRepository.save(t2);

        // Todo task
        Task t3 = Task.builder()
                .projectId(projectA.getId())
                .sprintId(sprint.getId())
                .title("Tarea Por Hacer")
                .status(TaskStatus.TODO)
                .estimateHours(BigDecimal.valueOf(4.0))
                .build();
        taskRepository.save(t3);

        mockMvc.perform(get("/api/v1/sprints/" + sprint.getId() + "/metrics")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sprintId").value(sprint.getId().toString()))
                .andExpect(jsonPath("$.totalTasks").value(3))
                .andExpect(jsonPath("$.completedTasks").value(1))
                .andExpect(jsonPath("$.inProgressTasks").value(1))
                .andExpect(jsonPath("$.todoTasks").value(1))
                .andExpect(jsonPath("$.completionRate").value(33.3))
                .andExpect(jsonPath("$.totalEstimateHours").value(16.0))
                .andExpect(jsonPath("$.completedEstimateHours").value(8.0))
                .andExpect(jsonPath("$.averageCycleTimeHours").value(4.0));
    }

    @Test
    @DisplayName("GET /api/v1/projects/{id}/velocity returns multi-sprint velocity tracking and averages")
    void testGetProjectVelocity() throws Exception {
        // Sprint 1 (Completed): committed 20, completed 20
        Sprint s1 = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint 1")
                .startDate(LocalDate.of(2026, 8, 1))
                .endDate(LocalDate.of(2026, 8, 14))
                .status(SprintStatus.COMPLETED)
                .build());

        taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(s1.getId())
                .title("T1 S1")
                .status(TaskStatus.DONE)
                .estimateHours(BigDecimal.valueOf(20.0))
                .build());

        // Sprint 2 (Completed): committed 30, completed 15
        Sprint s2 = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint 2")
                .startDate(LocalDate.of(2026, 8, 15))
                .endDate(LocalDate.of(2026, 8, 28))
                .status(SprintStatus.COMPLETED)
                .build());

        taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(s2.getId())
                .title("T1 S2")
                .status(TaskStatus.DONE)
                .estimateHours(BigDecimal.valueOf(15.0))
                .build());

        taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(s2.getId())
                .title("T2 S2")
                .status(TaskStatus.TODO)
                .estimateHours(BigDecimal.valueOf(15.0))
                .build());

        // Sprint 3 (Active): committed 25, completed 10 (not counted in average velocity of completed sprints)
        Sprint s3 = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint 3")
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 14))
                .status(SprintStatus.ACTIVE)
                .build());

        taskRepository.save(Task.builder()
                .projectId(projectA.getId())
                .sprintId(s3.getId())
                .title("T1 S3")
                .status(TaskStatus.DONE)
                .estimateHours(BigDecimal.valueOf(10.0))
                .build());

        mockMvc.perform(get("/api/v1/projects/" + projectA.getId() + "/velocity")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value(projectA.getId().toString()))
                .andExpect(jsonPath("$.averageVelocityHours").value(17.5)) // (20 + 15) / 2
                .andExpect(jsonPath("$.history.length()").value(3))
                .andExpect(jsonPath("$.history[0].sprintName").value("Sprint 1"))
                .andExpect(jsonPath("$.history[0].completedHours").value(20.0))
                .andExpect(jsonPath("$.history[0].completionRate").value(100.0))
                .andExpect(jsonPath("$.history[1].sprintName").value("Sprint 2"))
                .andExpect(jsonPath("$.history[1].completedHours").value(15.0))
                .andExpect(jsonPath("$.history[1].completionRate").value(50.0))
                .andExpect(jsonPath("$.history[2].sprintName").value("Sprint 3"))
                .andExpect(jsonPath("$.history[2].completedHours").value(10.0));
    }

    @Test
    @DisplayName("Multi-tenant Isolation: User from Org B cannot access Org A's burndown, metrics, or velocity")
    void testAgileMetricsMultiTenantIsolation() throws Exception {
        Sprint sprint = sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Confidential Sprint")
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(5))
                .status(SprintStatus.ACTIVE)
                .build());

        // Org B tries to get sprint burndown -> 404
        mockMvc.perform(get("/api/v1/sprints/" + sprint.getId() + "/burndown")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries to get sprint metrics -> 404
        mockMvc.perform(get("/api/v1/sprints/" + sprint.getId() + "/metrics")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // Org B tries to get project velocity -> 404
        mockMvc.perform(get("/api/v1/projects/" + projectA.getId() + "/velocity")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }
}
