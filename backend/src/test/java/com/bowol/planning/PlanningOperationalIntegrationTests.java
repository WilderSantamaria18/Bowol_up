package com.bowol.planning;

import com.bowol.auth.JwtService;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.planning.dto.*;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PlanningOperationalIntegrationTests {

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
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectCharterRepository projectCharterRepository;

    @Autowired
    private CapacityPlanRepository capacityPlanRepository;

    @Autowired
    private WeeklyRetrospectiveRepository weeklyRetrospectiveRepository;

    @Autowired
    private WeeklyFocusBannerRepository weeklyFocusBannerRepository;

    @Autowired
    private DailyCheckinRepository dailyCheckinRepository;

    private User testUser;
    private Organization testOrg;
    private String authToken;
    private Project testProject;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .email("planner-" + UUID.randomUUID() + "@bowol.io")
                .name("Planner User")
                .passwordHash("hashed")
                .build());

        testOrg = organizationRepository.save(Organization.builder()
                .name("BOWOL Operational Org")
                .slug("bowol-op-" + UUID.randomUUID())
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .user(testUser)
                .organization(testOrg)
                .role(Role.OWNER)
                .build());

        authToken = "Bearer " + jwtService.generateAccessToken(
                testUser,
                testOrg.getId(),
                Role.OWNER,
                java.util.Set.of("ROLE_OWNER", "project.read", "project.create", "project.update", "project.delete", "task.read", "task.create", "task.update")
        );

        Project project = Project.builder()
                .name("Campaña de Conversión Q4")
                .description("Implementación operativa")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(30))
                .status(ProjectStatus.ACTIVE)
                .createdBy(testUser.getId())
                .build();
        project.setOrganizationId(testOrg.getId());
        testProject = projectRepository.save(project);
    }

    @Test
    @DisplayName("Validar plan detecta dependencias circulares y valida DAG acíclico")
    void testValidatePlan_DetectsCyclicDependencies() throws Exception {
        PlanningImportRequest req = PlanningImportRequest.builder()
                .schemaVersion("bowol-planning-guide-2.0")
                .project(ProjectPlanDto.builder().name("Proyecto Ciclo").build())
                .tasks(List.of(
                        TaskPlanDto.builder()
                                .id("T-001")
                                .title("Tarea 1")
                                .estimatedHours(BigDecimal.valueOf(4))
                                .dependsOn(List.of("T-002"))
                                .build(),
                        TaskPlanDto.builder()
                                .id("T-002")
                                .title("Tarea 2")
                                .estimatedHours(BigDecimal.valueOf(3))
                                .dependsOn(List.of("T-001"))
                                .build()
                ))
                .build();

        mockMvc.perform(post("/api/v1/planning/validate")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.blockingIssues[0]").value("Se detectaron dependencias circulares entre las tareas del plan"));
    }

    @Test
    @DisplayName("Validar plan advierte cuando tareas superan 6 horas")
    void testValidatePlan_WarnsTasksOverSixHours() throws Exception {
        PlanningImportRequest req = PlanningImportRequest.builder()
                .schemaVersion("bowol-planning-guide-2.0")
                .project(ProjectPlanDto.builder().name("Proyecto Extenso").build())
                .tasks(List.of(
                        TaskPlanDto.builder()
                                .id("T-001")
                                .title("Tarea Larga")
                                .estimatedHours(BigDecimal.valueOf(8))
                                .build()
                ))
                .build();

        mockMvc.perform(post("/api/v1/planning/validate")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.tasksOverSixHours").value(1))
                .andExpect(jsonPath("$.warnings[0]").isNotEmpty());
    }

    @Test
    @DisplayName("Persistencia colaborativa de Ficha SMART (Project Charter)")
    void testProjectCharter_SaveAndRetrieve() throws Exception {
        ProjectCharterDto dto = ProjectCharterDto.builder()
                .problemAddressed("Baja conversión de leads")
                .smartObjective("Aumentar conversión del 10% al 25% en 60 días")
                .measurableKpi("Tasa de conversión mensual")
                .baselineValue("10%")
                .baselineUnit("porcentaje")
                .targetValue("25%")
                .targetUnit("porcentaje")
                .ownerDecisionRequired(true)
                .ownerDecisionDetails("Aprobación de presupuesto comercial")
                .technicalDeliverables(List.of("Embudo configurado", "Catálogo digital"))
                .inScope(List.of("Campañas directas"))
                .outOfScope(List.of("Rediseño total"))
                .restrictions(List.of("Máximo 10h semanales por persona"))
                .build();

        mockMvc.perform(put("/api/v1/planning/projects/" + testProject.getId() + "/charter")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.smartObjective").value("Aumentar conversión del 10% al 25% en 60 días"))
                .andExpect(jsonPath("$.baselineValue").value("10%"))
                .andExpect(jsonPath("$.ownerDecisionRequired").value(true));

        mockMvc.perform(get("/api/v1/planning/projects/" + testProject.getId() + "/charter")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.smartObjective").value("Aumentar conversión del 10% al 25% en 60 días"))
                .andExpect(jsonPath("$.technicalDeliverables[0]").value("Embudo configurado"));
    }

    @Test
    @DisplayName("Capacidad y buffer del 20% configurable")
    void testCapacityPlan_SaveAndRetrieve() throws Exception {
        CapacityPlanDto dto = CapacityPlanDto.builder()
                .periodLabel("Semana 1 - Sprint de Prueba")
                .bufferPercentage(BigDecimal.valueOf(20.0))
                .members(List.of(
                        CapacityPlanDto.MemberAllocationDto.builder()
                                .userId(testUser.getId())
                                .name("Planner User")
                                .role("OWNER")
                                .availableHours(BigDecimal.valueOf(25))
                                .assignedHours(BigDecimal.valueOf(18))
                                .build()
                ))
                .build();

        mockMvc.perform(post("/api/v1/planning/capacity")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bufferPercentage").value(20.0))
                .andExpect(jsonPath("$.members[0].availableHours").value(25.0));

        mockMvc.perform(get("/api/v1/planning/capacity")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bufferPercentage").value(20.0))
                .andExpect(jsonPath("$.members[0].name").value("Planner User"));
    }

    @Test
    @DisplayName("Retrospectiva Semanal limita a máximo 3 mejoras y calcula métricas reales de tareas")
    void testWeeklyRetrospective_Max3ImprovementsAndMetrics() throws Exception {
        // Crear tareas reales para el proyecto
        taskRepository.save(Task.builder()
                .projectId(testProject.getId())
                .title("Tarea Completada")
                .status(TaskStatus.DONE)
                .priority(TaskPriority.MEDIUM)
                .estimateHours(BigDecimal.valueOf(5))
                .position(1000)
                .build());

        taskRepository.save(Task.builder()
                .projectId(testProject.getId())
                .title("Tarea Bloqueada")
                .status(TaskStatus.BLOCKED)
                .priority(TaskPriority.HIGH)
                .estimateHours(BigDecimal.valueOf(4))
                .position(2000)
                .build());

        // 1. Verificar métricas reales
        mockMvc.perform(get("/api/v1/planning/projects/" + testProject.getId() + "/retrospective-metrics")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.committedTasks").value(2))
                .andExpect(jsonPath("$.acceptedTasks").value(1))
                .andExpect(jsonPath("$.blockedTasks").value(1))
                .andExpect(jsonPath("$.estimatedHours").value(9.0));

        // 2. Intentar guardar retrospectiva con 4 mejoras debe fallar (máximo 3 según BOWOL Plans 2.0)
        WeeklyRetrospectiveDto invalidDto = WeeklyRetrospectiveDto.builder()
                .projectId(testProject.getId())
                .weekLabel("Semana 1")
                .committedTasks(2)
                .acceptedTasks(1)
                .improvements(List.of(
                        Map.of("action", "Mejora 1", "owner", "User 1", "dueDate", "2026-10-15"),
                        Map.of("action", "Mejora 2", "owner", "User 2", "dueDate", "2026-10-15"),
                        Map.of("action", "Mejora 3", "owner", "User 3", "dueDate", "2026-10-15"),
                        Map.of("action", "Mejora 4", "owner", "User 4", "dueDate", "2026-10-15")
                ))
                .build();

        mockMvc.perform(post("/api/v1/planning/retrospectives")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MAX_3_MEJORAS"));

        // 3. Guardar con 2 mejoras concretas
        WeeklyRetrospectiveDto validDto = WeeklyRetrospectiveDto.builder()
                .projectId(testProject.getId())
                .weekLabel("Semana 1")
                .committedTasks(2)
                .acceptedTasks(1)
                .businessMetricResult("Captación de 10 prospectos calificados")
                .whatWorked("Desglose en bloques menores a 6h")
                .delayCauses("Espera de respuesta del cliente")
                .improvements(List.of(
                        Map.of("action", "Mejora 1: Alerta temprana", "owner", "Planner User", "dueDate", "2026-10-15"),
                        Map.of("action", "Mejora 2: Plantilla estandarizada", "owner", "Planner User", "dueDate", "2026-10-16")
                ))
                .build();

        mockMvc.perform(post("/api/v1/planning/retrospectives")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.committedTasks").value(2))
                .andExpect(jsonPath("$.acceptedTasks").value(1))
                .andExpect(jsonPath("$.improvements.length()").value(2));
    }

    @Test
    @DisplayName("Foco Semanal y Check-in Diario persistidos colaborativamente")
    void testFocusBannerAndDailyCheckin() throws Exception {
        // 1. Guardar foco semanal
        WeeklyFocusBannerDto focusDto = WeeklyFocusBannerDto.builder()
                .weeklyDeliverable("Lanzar catálogo digital con precios verificados")
                .identifiedRisk("Retraso de aprobación de imágenes")
                .mitigationPlan("Preparar dos alternativas visuales listas para publicar")
                .build();

        mockMvc.perform(put("/api/v1/planning/projects/" + testProject.getId() + "/focus")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(focusDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weeklyDeliverable").value("Lanzar catálogo digital con precios verificados"));

        // 2. Crear check-in diario
        DailyCheckinDto checkinDto = DailyCheckinDto.builder()
                .userName("Planner User")
                .date(LocalDate.now())
                .yesterdayDeliverable("Terminé la lista de 30 productos prioritarios")
                .todayCommitment("Subir imágenes y verificar precios en catálogo")
                .hasBlocker(false)
                .build();

        mockMvc.perform(post("/api/v1/planning/projects/" + testProject.getId() + "/checkins")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkinDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.yesterdayDeliverable").value("Terminé la lista de 30 productos prioritarios"));

        // 3. Consultar historial de check-ins
        mockMvc.perform(get("/api/v1/planning/projects/" + testProject.getId() + "/checkins")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].yesterdayDeliverable").value("Terminé la lista de 30 productos prioritarios"));
    }
}
