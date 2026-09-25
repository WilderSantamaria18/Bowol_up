package com.bowol.shared.security;

import com.bowol.auth.JwtService;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.organization.dto.InviteMemberRequest;
import com.bowol.organization.dto.UpdateMemberRoleRequest;
import com.bowol.organization.dto.UpdateOrganizationRequest;
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

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RbacPermissionsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private Organization organization;
    private User ownerUser;
    private User adminUser;
    private User memberUser;
    private String ownerToken;
    private String adminToken;
    private String memberToken;

    @BeforeEach
    void setUp() {
        organizationMemberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        organization = organizationRepository.save(Organization.builder()
                .name("Acme Corp")
                .slug("acme-corp")
                .memberCount(3)
                .build());

        ownerUser = userRepository.save(User.builder()
                .email("owner@acme.com")
                .name("Alice Owner")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .build());

        adminUser = userRepository.save(User.builder()
                .email("admin@acme.com")
                .name("Bob Admin")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .build());

        memberUser = userRepository.save(User.builder()
                .email("member@acme.com")
                .name("Charlie Member")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .user(ownerUser).organization(organization).role(Role.OWNER).build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .user(adminUser).organization(organization).role(Role.ADMIN).build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .user(memberUser).organization(organization).role(Role.MEMBER).build());

        ownerToken = jwtService.generateAccessToken(
                ownerUser, organization.getId(), Role.OWNER, RolePermissions.getPermissionValues(Role.OWNER));

        adminToken = jwtService.generateAccessToken(
                adminUser, organization.getId(), Role.ADMIN, RolePermissions.getPermissionValues(Role.ADMIN));

        memberToken = jwtService.generateAccessToken(
                memberUser, organization.getId(), Role.MEMBER, RolePermissions.getPermissionValues(Role.MEMBER));
    }

    // --- Tests de Catálogo RBAC estático ---

    @Test
    @DisplayName("Catálogo RBAC - OWNER posee todos los permisos del sistema")
    void owner_hasAllPermissions() {
        Set<Permission> ownerPerms = RolePermissions.getPermissions(Role.OWNER);
        assertThat(ownerPerms).contains(
                Permission.ORG_DELETE,
                Permission.ORG_MANAGE_BILLING,
                Permission.SUBSCRIPTION_CANCEL,
                Permission.MEMBER_INVITE,
                Permission.MEMBER_REMOVE
        );
    }

    @Test
    @DisplayName("Catálogo RBAC - ADMIN no tiene ORG_DELETE ni ORG_MANAGE_BILLING ni SUBSCRIPTION_CANCEL")
    void admin_cannotDeleteOrgOrBilling() {
        Set<Permission> adminPerms = RolePermissions.getPermissions(Role.ADMIN);
        assertThat(adminPerms).doesNotContain(
                Permission.ORG_DELETE,
                Permission.ORG_MANAGE_BILLING,
                Permission.SUBSCRIPTION_CANCEL
        );
        assertThat(adminPerms).contains(Permission.MEMBER_INVITE, Permission.MEMBER_UPDATE_ROLE);
    }

    @Test
    @DisplayName("Catálogo RBAC - MANAGER posee permisos estratégicos y de proyectos pero no de administración de miembros")
    void manager_hasStrategyPerms() {
        Set<Permission> managerPerms = RolePermissions.getPermissions(Role.MANAGER);
        assertThat(managerPerms).contains(
                Permission.BUSINESS_PROFILE_READ,
                Permission.PROJECT_CREATE,
                Permission.SPRINT_CREATE,
                Permission.SWOT_CREATE
        );
        assertThat(managerPerms).doesNotContain(
                Permission.MEMBER_INVITE,
                Permission.MEMBER_REMOVE,
                Permission.ORG_DELETE
        );
    }

    @Test
    @DisplayName("Catálogo RBAC - MEMBER solo posee permisos de colaboración en tareas y lectura")
    void member_hasExecutionPermissionsOnly() {
        Set<Permission> memberPerms = RolePermissions.getPermissions(Role.MEMBER);
        assertThat(memberPerms).contains(
                Permission.TASK_CREATE,
                Permission.TASK_UPDATE,
                Permission.ORG_READ
        );
        assertThat(memberPerms).doesNotContain(
                Permission.MEMBER_INVITE,
                Permission.ORG_UPDATE,
                Permission.ORG_DELETE,
                Permission.PROJECT_DELETE
        );
    }

    @Test
    @DisplayName("Catálogo RBAC - VIEWER posee estrictamente permisos de lectura")
    void viewer_hasReadOnlyPermissions() {
        Set<Permission> viewerPerms = RolePermissions.getPermissions(Role.VIEWER);
        assertThat(viewerPerms).contains(Permission.ORG_READ, Permission.TASK_READ);
        assertThat(viewerPerms).doesNotContain(
                Permission.TASK_CREATE,
                Permission.PROJECT_CREATE,
                Permission.MEMBER_INVITE,
                Permission.SWOT_CREATE
        );
    }

    // --- Tests de Restricción HTTP en Controladores ---

    @Test
    @DisplayName("MEMBER intentando actualizar datos de la organización retorna 403 Forbidden")
    void memberCannotUpdateOrg_returns403() throws Exception {
        UpdateOrganizationRequest request = UpdateOrganizationRequest.builder()
                .name("Hacked Name")
                .build();

        mockMvc.perform(patch("/api/v1/organizations/{id}", organization.getId())
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("MEMBER intentando invitar miembros retorna 403 Forbidden")
    void memberCannotInviteMember_returns403() throws Exception {
        InviteMemberRequest request = InviteMemberRequest.builder()
                .email("new@test.com")
                .role(Role.MEMBER)
                .build();

        mockMvc.perform(post("/api/v1/organizations/{id}/members", organization.getId())
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("MEMBER intentando cambiar rol de miembro retorna 403 Forbidden")
    void memberCannotChangeRoles_returns403() throws Exception {
        UpdateMemberRoleRequest request = UpdateMemberRoleRequest.builder()
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(patch("/api/v1/organizations/{id}/members/{userId}", organization.getId(), memberUser.getId())
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ADMIN intentando eliminar (soft-delete) la organización retorna 403 Forbidden")
    void adminCannotDeleteOrg_returns403() throws Exception {
        mockMvc.perform(delete("/api/v1/organizations/{id}", organization.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("OWNER puede eliminar (soft-delete) la organización exitosamente retornando 204")
    void ownerCanDeleteOrg_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/organizations/{id}", organization.getId())
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("ADMIN intentando ascender a alguien a rol OWNER retorna 403 Forbidden")
    void adminCannotPromoteToOwner_returns403() throws Exception {
        UpdateMemberRoleRequest request = UpdateMemberRoleRequest.builder()
                .role(Role.OWNER)
                .build();

        mockMvc.perform(patch("/api/v1/organizations/{id}/members/{userId}", organization.getId(), memberUser.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
