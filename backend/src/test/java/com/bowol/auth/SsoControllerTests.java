package com.bowol.auth;

import com.bowol.auth.dto.RegisterRequest;
import com.bowol.auth.sso.SsoProvider;
import com.bowol.auth.sso.dto.SaveSsoConfigRequest;
import com.bowol.auth.sso.dto.SsoCallbackRequest;
import com.bowol.auth.sso.dto.SsoInitiateRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("SsoController MockMvc Integration Tests")
class SsoControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static class AuthSetup {
        String token;
        UUID orgId;
    }

    private AuthSetup registerOwner(String email, String orgName) throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Enterprise Admin")
                .email(email)
                .password("EnterprisePassword123!")
                .organizationName(orgName)
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        AuthSetup setup = new AuthSetup();
        setup.token = node.get("accessToken").asText();
        setup.orgId = UUID.fromString(node.get("organization").get("id").asText());
        return setup;
    }

    @Test
    @DisplayName("Debe permitir configurar SSO, consultar la configuración, iniciar flujo y autenticar por callback")
    void testFullEnterpriseSsoLifecycle() throws Exception {
        AuthSetup setup = registerOwner("admin@acme-global.com", "Acme Global Enterprise");

        // 1. Guardar configuración SSO (Google Workspace)
        SaveSsoConfigRequest saveReq = SaveSsoConfigRequest.builder()
                .provider(SsoProvider.GOOGLE)
                .displayName("Google Workspace Enterprise")
                .clientId("acme-client-id-12345.apps.googleusercontent.com")
                .clientSecret("secret-xyz-987")
                .domainRestriction("acme-global.com")
                .isEnabled(true)
                .enforceSso(false)
                .build();

        mockMvc.perform(post("/api/v1/organizations/" + setup.orgId + "/sso")
                        .header("Authorization", "Bearer " + setup.token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saveReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.provider", is("GOOGLE")))
                .andExpect(jsonPath("$.displayName", is("Google Workspace Enterprise")))
                .andExpect(jsonPath("$.domainRestriction", is("acme-global.com")))
                .andExpect(jsonPath("$.authorizationUrl", containsString("accounts.google.com")));

        // 2. Consultar configuraciones SSO de la organización
        mockMvc.perform(get("/api/v1/organizations/" + setup.orgId + "/sso")
                        .header("Authorization", "Bearer " + setup.token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].provider", is("GOOGLE")));

        // 3. Iniciar SSO público a partir del correo corporativo
        SsoInitiateRequest initiateReq = SsoInitiateRequest.builder()
                .email("jane.doe@acme-global.com")
                .build();

        mockMvc.perform(post("/api/v1/auth/sso/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initiateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationId", is(setup.orgId.toString())))
                .andExpect(jsonPath("$.provider", is("GOOGLE")))
                .andExpect(jsonPath("$.authorizationUrl", containsString("accounts.google.com")))
                .andExpect(jsonPath("$.state", notNullValue()));

        // 4. Callback de autenticación SSO exitoso
        SsoCallbackRequest callbackReq = SsoCallbackRequest.builder()
                .organizationId(setup.orgId)
                .provider(SsoProvider.GOOGLE)
                .code("oauth2-auth-code-mock-998877")
                .email("jane.doe@acme-global.com")
                .fullName("Jane Doe")
                .avatarUrl("https://lh3.googleusercontent.com/a/mock")
                .build();

        mockMvc.perform(post("/api/v1/auth/sso/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(callbackReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("jane.doe@acme-global.com")))
                .andExpect(jsonPath("$.user.name", is("Jane Doe")))
                .andExpect(jsonPath("$.organization.id", is(setup.orgId.toString())))
                .andExpect(jsonPath("$.organization.role", is("MEMBER")));

        // 5. Callback con dominio no autorizado debe arrojar 400 Bad Request
        SsoCallbackRequest invalidDomainCallback = SsoCallbackRequest.builder()
                .organizationId(setup.orgId)
                .provider(SsoProvider.GOOGLE)
                .code("mock-code")
                .email("attacker@external.com")
                .build();

        mockMvc.perform(post("/api/v1/auth/sso/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDomainCallback)))
                .andExpect(status().isBadRequest());
    }
}
