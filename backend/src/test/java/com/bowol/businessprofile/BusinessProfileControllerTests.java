package com.bowol.businessprofile;

import com.bowol.auth.JwtService;
import com.bowol.businessprofile.dto.GoalItem;
import com.bowol.businessprofile.dto.OnboardingRequest;
import com.bowol.businessprofile.dto.UpdateBusinessProfileRequest;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.OrganizationSize;
import com.bowol.organization.Role;
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
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BusinessProfileControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

    private User testUser;
    private Organization organization;
    private String authToken;

    @BeforeEach
    void setUp() {
        businessProfileRepository.deleteAll();
        organizationMemberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .email("ceo@biotech.com")
                .name("Carlos CEO")
                .passwordHash(passwordEncoder.encode("Secure123!"))
                .build());

        organization = organizationRepository.save(Organization.builder()
                .name("BioTech AI")
                .slug("biotech-ai")
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .user(testUser)
                .organization(organization)
                .role(Role.OWNER)
                .build());

        authToken = jwtService.generateAccessToken(
                testUser,
                organization.getId(),
                Role.OWNER,
                Set.of("business_profile.read", "business_profile.update")
        );
    }

    @Test
    @DisplayName("GET /api/v1/business-profile - Retorna 404 antes de completar el onboarding")
    void getProfile_notFoundInitial() throws Exception {
        mockMvc.perform(get("/api/v1/business-profile")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    @DisplayName("POST /api/v1/business-profile/onboarding - Guarda el perfil, marca onboarding y responde 201")
    void completeOnboarding_success() throws Exception {
        OnboardingRequest request = OnboardingRequest.builder()
                .industry("SaaS / Salud")
                .size(OrganizationSize.SMALL)
                .market("Latinoamérica")
                .goals(List.of(
                        GoalItem.builder().text("Adquirir 100 clínicas").priority(1).build(),
                        GoalItem.builder().text("Certificación HIPAA").priority(2).build()
                ))
                .problems(List.of("Procesos manuales", "Poco personal técnico"))
                .tools(List.of("HubSpot", "Slack", "AWS"))
                .competitors(List.of("SaludTech", "MediCloud"))
                .channels(List.of("LinkedIn", "Eventos"))
                .digitalMaturity(65)
                .aiMaturity(30)
                .build();

        mockMvc.perform(post("/api/v1/business-profile/onboarding")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.industry").value("SaaS / Salud"))
                .andExpect(jsonPath("$.size").value("SMALL"))
                .andExpect(jsonPath("$.digitalMaturity").value(65))
                .andExpect(jsonPath("$.aiMaturity").value(30))
                .andExpect(jsonPath("$.goals", hasSize(2)))
                .andExpect(jsonPath("$.goals[0].text").value("Adquirir 100 clínicas"))
                .andExpect(jsonPath("$.onboardingCompletedAt").isNotEmpty());
    }

    @Test
    @DisplayName("PUT y PATCH /api/v1/business-profile - Actualiza el perfil de negocio existente")
    void updateAndPatchProfile_success() throws Exception {
        // 1. Crear perfil inicial con Onboarding
        OnboardingRequest onboarding = OnboardingRequest.builder()
                .industry("Fintech")
                .size(OrganizationSize.MICRO)
                .market("Perú")
                .digitalMaturity(40)
                .build();

        mockMvc.perform(post("/api/v1/business-profile/onboarding")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(onboarding)))
                .andExpect(status().isCreated());

        // 2. PATCH parcial
        UpdateBusinessProfileRequest patchRequest = UpdateBusinessProfileRequest.builder()
                .market("México y Perú")
                .digitalMaturity(75)
                .build();

        mockMvc.perform(patch("/api/v1/business-profile")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patchRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.industry").value("Fintech"))
                .andExpect(jsonPath("$.market").value("México y Perú"))
                .andExpect(jsonPath("$.digitalMaturity").value(75));

        // 3. GET posterior
        mockMvc.perform(get("/api/v1/business-profile")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.industry").value("Fintech"))
                .andExpect(jsonPath("$.market").value("México y Perú"));
    }

    @Test
    @DisplayName("POST /api/v1/business-profile/onboarding - Falla validación 400 si madurez supera 100")
    void completeOnboarding_validationFailure() throws Exception {
        OnboardingRequest invalid = OnboardingRequest.builder()
                .industry("E-commerce")
                .digitalMaturity(150) // Máximo es 100
                .build();

        mockMvc.perform(post("/api/v1/business-profile/onboarding")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors[0].field").value("digitalMaturity"));
    }
}
