package com.bowol.organization;

import com.bowol.organization.dto.InviteMemberRequest;
import com.bowol.organization.dto.UpdateMemberRoleRequest;
import com.bowol.organization.dto.UpdateOrganizationRequest;
import com.bowol.auth.JwtService;
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
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OrganizationControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

    private User ownerUser;
    private User regularUser;
    private Organization organization;
    private String ownerToken;
    private String regularUserToken;

    @BeforeEach
    void setUp() {
        organizationMemberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Owner user
        ownerUser = userRepository.save(User.builder()
                .email("owner@testcorp.com")
                .name("Owner User")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .build());

        // 2. Organization
        organization = organizationRepository.save(Organization.builder()
                .name("Test Corp")
                .slug("test-corp")
                .industry("SaaS")
                .country("PE")
                .size(OrganizationSize.SMALL)
                .memberCount(1)
                .build());

        // 3. Owner membership
        organizationMemberRepository.save(OrganizationMember.builder()
                .user(ownerUser)
                .organization(organization)
                .role(Role.OWNER)
                .status(MemberStatus.ACTIVE)
                .build());

        // 4. Regular outside user
        regularUser = userRepository.save(User.builder()
                .email("outside@other.com")
                .name("Outside User")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .build());

        // 5. Tokens
        ownerToken = jwtService.generateAccessToken(
                ownerUser,
                organization.getId(),
                Role.OWNER,
                java.util.Set.of("organization.read", "organization.update", "member.read", "member.invite")
        );

        regularUserToken = jwtService.generateAccessToken(
                regularUser,
                UUID.randomUUID(),
                Role.MEMBER,
                java.util.Set.of("organization.read")
        );
    }

    @Test
    @DisplayName("GET /api/v1/organizations - Devuelve las organizaciones del usuario autenticado con su rol")
    void listOrganizations_success() throws Exception {
        mockMvc.perform(get("/api/v1/organizations")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(organization.getId().toString()))
                .andExpect(jsonPath("$[0].name").value("Test Corp"))
                .andExpect(jsonPath("$[0].role").value("OWNER"));
    }

    @Test
    @DisplayName("GET /api/v1/organizations/{id} - Devuelve 200 para miembro y 403 para usuario no perteneciente")
    void getOrganization_authorizationRules() throws Exception {
        // Miembro legítimo
        mockMvc.perform(get("/api/v1/organizations/{id}", organization.getId())
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(organization.getId().toString()))
                .andExpect(jsonPath("$.slug").value("test-corp"));

        // Usuario ajeno
        mockMvc.perform(get("/api/v1/organizations/{id}", organization.getId())
                        .header("Authorization", "Bearer " + regularUserToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("PATCH /api/v1/organizations/{id} - Actualiza la organización con éxito cuando es OWNER")
    void updateOrganization_success() throws Exception {
        UpdateOrganizationRequest request = UpdateOrganizationRequest.builder()
                .name("Updated Corp Global")
                .size(OrganizationSize.MEDIUM)
                .industry("Fintech")
                .website("https://updated.com")
                .build();

        mockMvc.perform(patch("/api/v1/organizations/{id}", organization.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Corp Global"))
                .andExpect(jsonPath("$.industry").value("Fintech"))
                .andExpect(jsonPath("$.size").value("MEDIUM"))
                .andExpect(jsonPath("$.website").value("https://updated.com"));
    }

    @Test
    @DisplayName("POST /api/v1/organizations/{id}/members - Invita a nuevo miembro exitosamente")
    void inviteMember_success() throws Exception {
        InviteMemberRequest request = InviteMemberRequest.builder()
                .email("newmember@testcorp.com")
                .role(Role.MANAGER)
                .build();

        mockMvc.perform(post("/api/v1/organizations/{id}/members", organization.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("newmember@testcorp.com"))
                .andExpect(jsonPath("$.role").value("MANAGER"))
                .andExpect(jsonPath("$.status").value("INVITED"));
    }

    @Test
    @DisplayName("POST /api/v1/organizations/{id}/members - Retorna 409 Conflict si el usuario ya es miembro")
    void inviteMember_alreadyMemberConflict() throws Exception {
        InviteMemberRequest request = InviteMemberRequest.builder()
                .email("owner@testcorp.com")
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(post("/api/v1/organizations/{id}/members", organization.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("MEMBER_ALREADY_EXISTS"));
    }

    @Test
    @DisplayName("PATCH /api/v1/organizations/{id}/members/{userId} y DELETE - Gestiona roles y remoción de miembro")
    void updateAndRemoveMember_success() throws Exception {
        // Añadir segundo miembro
        User memberUser = userRepository.save(User.builder()
                .email("dev@testcorp.com")
                .name("Developer User")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .user(memberUser)
                .organization(organization)
                .role(Role.MEMBER)
                .status(MemberStatus.ACTIVE)
                .build());

        // Actualizar rol a ADMIN
        UpdateMemberRoleRequest roleRequest = UpdateMemberRoleRequest.builder()
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(patch("/api/v1/organizations/{id}/members/{userId}", organization.getId(), memberUser.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));

        // Eliminar miembro
        mockMvc.perform(delete("/api/v1/organizations/{id}/members/{userId}", organization.getId(), memberUser.getId())
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNoContent());
    }
}
