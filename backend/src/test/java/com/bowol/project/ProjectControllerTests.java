package com.bowol.project;

import com.bowol.auth.JwtService;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.project.dto.AddProjectMemberRequest;
import com.bowol.project.dto.CreateProjectRequest;
import com.bowol.project.dto.UpdateProjectRequest;
import com.bowol.sprint.Sprint;
import com.bowol.sprint.SprintRepository;
import com.bowol.sprint.SprintStatus;
import com.bowol.sprint.dto.CreateSprintRequest;
import com.bowol.sprint.dto.UpdateSprintRequest;
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
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProjectControllerTests {

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
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private SprintRepository sprintRepository;

    private User testUser;
    private Organization testOrg;
    private String jwtToken;

    private User otherUser;
    private Organization otherOrg;
    private String otherJwtToken;

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

        jwtToken = jwtService.generateAccessToken(
                testUser,
                testOrg.getId(),
                Role.OWNER,
                Set.of("ROLE_OWNER")
        );

        // Second tenant
        otherUser = userRepository.save(User.builder()
                .name("Other CEO")
                .email("other-" + UUID.randomUUID() + "@other.com")
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
    }

    @Test
    @DisplayName("POST /api/v1/projects - Crear proyecto exitoso y asignar OWNER")
    void createProject_success() throws Exception {
        CreateProjectRequest request = CreateProjectRequest.builder()
                .name("AI Automated Billing")
                .description("Sistema de facturación automática con IA")
                .status(ProjectStatus.PLANNING)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(3))
                .build();

        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("AI Automated Billing"))
                .andExpect(jsonPath("$.status").value("PLANNING"))
                .andExpect(jsonPath("$.organizationId").value(testOrg.getId().toString()));

        List<Project> projects = projectRepository.findAllByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(testOrg.getId());
        assertThat(projects).hasSize(1);
        Project p = projects.get(0);
        assertThat(p.getName()).isEqualTo("AI Automated Billing");

        List<ProjectMember> members = projectMemberRepository.findAllByProjectId(p.getId());
        assertThat(members).hasSize(1);
        assertThat(members.get(0).getUserId()).isEqualTo(testUser.getId());
        assertThat(members.get(0).getRole()).isEqualTo(ProjectMemberRole.OWNER);
    }

    @Test
    @DisplayName("GET /api/v1/projects - Listar proyectos de la organización")
    void getProjects_returnsTenantProjects() throws Exception {
        Project p1 = Project.builder()
                .name("Project 1")
                .status(ProjectStatus.PLANNING)
                .build();
        p1.setOrganizationId(testOrg.getId());
        projectRepository.save(p1);

        Project p2 = Project.builder()
                .name("Project 2")
                .status(ProjectStatus.ACTIVE)
                .build();
        p2.setOrganizationId(testOrg.getId());
        projectRepository.save(p2);

        // Project in other org
        Project otherP = Project.builder()
                .name("Other Org Project")
                .status(ProjectStatus.ACTIVE)
                .build();
        otherP.setOrganizationId(otherOrg.getId());
        projectRepository.save(otherP);

        mockMvc.perform(get("/api/v1/projects")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("PATCH /api/v1/projects/{id} - Actualizar proyecto")
    void updateProject_success() throws Exception {
        Project p = Project.builder()
                .name("Old Name")
                .description("Old Desc")
                .status(ProjectStatus.PLANNING)
                .build();
        p.setOrganizationId(testOrg.getId());
        Project saved = projectRepository.save(p);

        UpdateProjectRequest updateReq = UpdateProjectRequest.builder()
                .name("New Name")
                .description("New Desc")
                .status(ProjectStatus.ACTIVE)
                .build();

        mockMvc.perform(patch("/api/v1/projects/" + saved.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.description").value("New Desc"));
    }

    @Test
    @DisplayName("DELETE /api/v1/projects/{id} - Soft delete")
    void deleteProject_softDeletes() throws Exception {
        Project p = Project.builder()
                .name("To Delete")
                .status(ProjectStatus.PLANNING)
                .build();
        p.setOrganizationId(testOrg.getId());
        Project saved = projectRepository.save(p);

        mockMvc.perform(delete("/api/v1/projects/" + saved.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        // Should return 404 now on GET
        mockMvc.perform(get("/api/v1/projects/" + saved.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Project Members - Agregar, listar y remover miembros")
    void projectMembers_management() throws Exception {
        Project p = Project.builder()
                .name("Team Project")
                .status(ProjectStatus.ACTIVE)
                .build();
        p.setOrganizationId(testOrg.getId());
        Project saved = projectRepository.save(p);

        User memberUser = userRepository.save(User.builder()
                .name("Dev Member")
                .email("dev-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("hashed")
                .build());

        AddProjectMemberRequest addReq = AddProjectMemberRequest.builder()
                .userId(memberUser.getId())
                .role(ProjectMemberRole.MEMBER)
                .build();

        // 1. Add member
        mockMvc.perform(post("/api/v1/projects/" + saved.getId() + "/members")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(memberUser.getId().toString()))
                .andExpect(jsonPath("$.role").value("MEMBER"));

        // 2. List members
        mockMvc.perform(get("/api/v1/projects/" + saved.getId() + "/members")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        // 3. Remove member
        mockMvc.perform(delete("/api/v1/projects/" + saved.getId() + "/members/" + memberUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/projects/" + saved.getId() + "/members")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("Sprints - Ciclo de vida: crear, listar, iniciar, completar y eliminar")
    void sprints_lifecycle() throws Exception {
        Project p = Project.builder()
                .name("Sprint Project")
                .status(ProjectStatus.ACTIVE)
                .build();
        p.setOrganizationId(testOrg.getId());
        Project saved = projectRepository.save(p);

        CreateSprintRequest createSprintReq = CreateSprintRequest.builder()
                .name("Sprint 1 - Foundation")
                .goal("Set up core services")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusWeeks(2))
                .build();

        // 1. Create sprint
        String sprintRes = mockMvc.perform(post("/api/v1/projects/" + saved.getId() + "/sprints")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createSprintReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Sprint 1 - Foundation"))
                .andExpect(jsonPath("$.status").value("PLANNED"))
                .andReturn().getResponse().getContentAsString();

        String sprintId = objectMapper.readTree(sprintRes).get("id").asText();

        // 2. Start sprint
        mockMvc.perform(patch("/api/v1/sprints/" + sprintId + "/start")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // 3. Complete sprint
        mockMvc.perform(patch("/api/v1/sprints/" + sprintId + "/complete")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // 4. List sprints
        mockMvc.perform(get("/api/v1/projects/" + saved.getId() + "/sprints")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        // 5. Delete sprint
        mockMvc.perform(delete("/api/v1/sprints/" + sprintId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/sprints/" + sprintId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Aislamiento Multi-tenant: no se puede acceder a proyecto de otra organización")
    void multiTenant_isolation() throws Exception {
        Project otherProject = Project.builder()
                .name("Secret Project Org 2")
                .status(ProjectStatus.ACTIVE)
                .build();
        otherProject.setOrganizationId(otherOrg.getId());
        Project savedOther = projectRepository.save(otherProject);

        // Attempting to access from testOrg returns 404
        mockMvc.perform(get("/api/v1/projects/" + savedOther.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }
}
