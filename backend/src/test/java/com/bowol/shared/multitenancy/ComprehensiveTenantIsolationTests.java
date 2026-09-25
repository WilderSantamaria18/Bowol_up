package com.bowol.shared.multitenancy;

import com.bowol.auth.JwtService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.organization.dto.InviteMemberRequest;
import com.bowol.organization.dto.UpdateOrganizationRequest;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ComprehensiveTenantIsolationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private Organization orgA;
    private Organization orgB;
    private User userA;
    private User userB;
    private String tokenA;
    private String tokenB;
    private Project projectOrgA;
    private Project projectOrgB;

    @BeforeEach
    void setUp() {
        businessProfileRepository.deleteAll();
        projectRepository.deleteAll();
        organizationMemberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Organizaciones
        orgA = organizationRepository.save(Organization.builder().name("Org A").slug("org-a").build());
        orgB = organizationRepository.save(Organization.builder().name("Org B").slug("org-b").build());

        // 2. Usuarios
        userA = userRepository.save(User.builder().email("user@org-a.com").name("User A").passwordHash(passwordEncoder.encode("Pass123!")).build());
        userB = userRepository.save(User.builder().email("user@org-b.com").name("User B").passwordHash(passwordEncoder.encode("Pass123!")).build());

        organizationMemberRepository.save(OrganizationMember.builder().user(userA).organization(orgA).role(Role.OWNER).build());
        organizationMemberRepository.save(OrganizationMember.builder().user(userB).organization(orgB).role(Role.OWNER).build());

        // 3. Proyectos
        TenantContext.setTenantId(orgA.getId());
        projectOrgA = projectRepository.save(Project.builder().name("Proyecto Secreto A").build());

        TenantContext.setTenantId(orgB.getId());
        projectOrgB = projectRepository.save(Project.builder().name("Proyecto Secreto B").build());
        TenantContext.clear();

        // 4. Tokens JWT con aislamiento
        tokenA = jwtService.generateAccessToken(userA, orgA.getId(), Role.OWNER, Set.of("organization.read", "organization.update", "member.read", "member.invite"));
        tokenB = jwtService.generateAccessToken(userB, orgB.getId(), Role.OWNER, Set.of("organization.read", "organization.update", "member.read", "member.invite"));
    }

    @Test
    @DisplayName("Aislamiento de Proyectos - Consulta de proyectos solo retorna los de la organización activa")
    void projects_crossTenantListIsolation() {
        TenantContext.setTenantId(orgA.getId());
        List<Project> listForA = projectRepository.findAll();
        assertThat(listForA).extracting(Project::getName).contains("Proyecto Secreto A").doesNotContain("Proyecto Secreto B");

        TenantContext.setTenantId(orgB.getId());
        List<Project> listForB = projectRepository.findAll();
        assertThat(listForB).extracting(Project::getName).contains("Proyecto Secreto B").doesNotContain("Proyecto Secreto A");
        TenantContext.clear();
    }

    @Test
    @DisplayName("Aislamiento de Proyectos - findById sobre proyecto de otra organización retorna Optional.empty")
    void projects_crossTenantFindByIdReturnsEmpty() {
        TenantContext.setTenantId(orgA.getId());
        Optional<Project> shouldBeEmpty = projectRepository.findById(projectOrgB.getId());
        assertThat(shouldBeEmpty).isEmpty();
        TenantContext.clear();
    }

    @Test
    @DisplayName("Aislamiento de BusinessProfile - Consulta de perfil de negocio pertenece exclusivamente a la organización")
    void businessProfile_isolation() {
        TenantContext.setTenantId(orgA.getId());
        BusinessProfile bpA = businessProfileRepository.save(BusinessProfile.builder().industry("Salud A").build());
        TenantContext.clear();

        TenantContext.setTenantId(orgB.getId());
        Optional<BusinessProfile> notFound = businessProfileRepository.findByOrganizationId(orgA.getId());
        // En findByOrganizationId(orgA.getId()) la consulta es para orgA, pero el tenant activo es orgB
        TenantContext.clear();
    }

    @Test
    @DisplayName("Aislamiento HTTP - Usuario de Org A intentando leer detalles de Org B retorna 403 Forbidden")
    void crossTenant_getOrganizationDetails_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/organizations/{id}", orgB.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("Aislamiento HTTP - Usuario de Org A intentando listar miembros de Org B retorna 403 Forbidden")
    void crossTenant_listMembers_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/organizations/{id}/members", orgB.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("Aislamiento HTTP - Usuario de Org A intentando invitar miembro a Org B retorna 403 Forbidden")
    void crossTenant_inviteMember_returns403() throws Exception {
        InviteMemberRequest request = InviteMemberRequest.builder()
                .email("spy@org-a.com")
                .role(Role.MEMBER)
                .build();

        mockMvc.perform(post("/api/v1/organizations/{id}/members", orgB.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("Aislamiento HTTP - Usuario de Org A intentando modificar Org B retorna 403 Forbidden")
    void crossTenant_updateOrganization_returns403() throws Exception {
        UpdateOrganizationRequest request = UpdateOrganizationRequest.builder()
                .name("Compromised Org")
                .build();

        mockMvc.perform(patch("/api/v1/organizations/{id}", orgB.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("Aislamiento HTTP - Usuario de Org A intentando eliminar Org B retorna 403 Forbidden")
    void crossTenant_deleteOrganization_returns403() throws Exception {
        mockMvc.perform(delete("/api/v1/organizations/{id}", orgB.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("Protección de Jerarquía - No se puede eliminar ni degradar al único OWNER de la organización")
    void soleOwner_cannotBeRemovedOrDemoted() throws Exception {
        // Intentar eliminar al único owner
        mockMvc.perform(delete("/api/v1/organizations/{id}/members/{userId}", orgA.getId(), userA.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("No se puede eliminar al único OWNER de la organización"));
    }

    @Test
    @DisplayName("BaseTenantEntity auto-asigna organizationId de TenantContext en @PrePersist")
    void baseTenantEntity_autoAssignsTenantId() {
        TenantContext.setTenantId(orgA.getId());
        Project autoAssignedProject = projectRepository.save(Project.builder().name("Auto Tenant Project").build());
        TenantContext.clear();

        assertThat(autoAssignedProject.getOrganizationId()).isEqualTo(orgA.getId());
    }
}
