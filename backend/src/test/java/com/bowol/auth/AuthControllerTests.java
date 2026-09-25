package com.bowol.auth;

import com.bowol.auth.dto.LoginRequest;
import com.bowol.auth.dto.RefreshTokenRequest;
import com.bowol.auth.dto.RegisterRequest;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AuthController MockMvc Integration Tests")
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/v1/auth/register debe retornar 201 Created con tokens y perfil completo")
    void shouldRegisterSuccessfully() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Carlos CTO")
                .email("carlos@startup.pe")
                .password("StrongPassword123!")
                .organizationName("Startup Peru Labs")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.user.email", is("carlos@startup.pe")))
                .andExpect(jsonPath("$.organization.name", is("Startup Peru Labs")))
                .andExpect(jsonPath("$.organization.role", is("OWNER")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register con datos inválidos debe retornar 400 Bad Request RFC 7807")
    void shouldReturn400WhenRegisterPayloadInvalid() throws Exception {
        RegisterRequest invalidReq = RegisterRequest.builder()
                .name("")
                .email("not-an-email")
                .password("short")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type", is("https://api.bowol.com/errors/validation-failed")))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.errors", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login exitoso (200 OK) y fallo por credenciales erróneas (401)")
    void shouldLoginAndRejectBadCredentials() throws Exception {
        // Registrar usuario
        RegisterRequest reg = RegisterRequest.builder()
                .name("Lorena AI")
                .email("lorena@bowol.ai")
                .password("SuperSecret2026!")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());

        // Login exitoso
        LoginRequest validLogin = LoginRequest.builder()
                .email("lorena@bowol.ai")
                .password("SuperSecret2026!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.name", is("Lorena AI")));

        // Login con contraseña equivocada -> 401
        LoginRequest badLogin = LoginRequest.builder()
                .email("lorena@bowol.ai")
                .password("WrongPassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("AUTH_INVALID_CREDENTIALS")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/refresh debe rotar el refresh token y retornar 200 OK")
    void shouldRefreshTokenSuccessfully() throws Exception {
        RegisterRequest reg = RegisterRequest.builder()
                .name("Hugo Lead")
                .email("hugo@bowol.ai")
                .password("PassWord12345!")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(result.getResponse().getContentAsString());
        String refreshToken = responseJson.get("refreshToken").asText();

        RefreshTokenRequest refreshReq = RefreshTokenRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", not(is(refreshToken))));
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout autenticado debe retornar 204 No Content")
    void shouldLogoutSuccessfully() throws Exception {
        RegisterRequest reg = RegisterRequest.builder()
                .name("Logout Tester")
                .email("logout@bowol.ai")
                .password("Password123!")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String accessToken = json.get("accessToken").asText();
        String refreshToken = json.get("refreshToken").asText();

        RefreshTokenRequest logoutReq = RefreshTokenRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutReq)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/v1/auth/me debe requerir token y responder 200 OK con usuario y permisos")
    void shouldGetMeWhenAuthenticatedAnd401WhenAnonymous() throws Exception {
        // Anónimo -> 401
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());

        // Registrar y autenticar
        RegisterRequest reg = RegisterRequest.builder()
                .name("Valeria Product")
                .email("valeria@bowol.ai")
                .password("ValidPass123!")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(result.getResponse().getContentAsString());
        String accessToken = responseJson.get("accessToken").asText();

        // Autenticado con Bearer token -> 200 OK
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("valeria@bowol.ai")))
                .andExpect(jsonPath("$.currentOrganization.name", notNullValue()))
                .andExpect(jsonPath("$.currentOrganization.role", is("OWNER")))
                .andExpect(jsonPath("$.organizations", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register con email inválido debe retornar 400 Bad Request")
    void register_invalidEmailFormat_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Test User")
                .email("not-an-email")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register con contraseña de menos de 8 caracteres debe retornar 400 Bad Request")
    void register_shortPassword_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Test User")
                .email("valid@email.com")
                .password("short")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register con nombre en blanco debe retornar 400 Bad Request")
    void register_blankName_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("")
                .email("valid2@email.com")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login con email en blanco debe retornar 400 Bad Request")
    void login_blankEmail_returns400() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email("")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login con contraseña en blanco debe retornar 400 Bad Request")
    void login_blankPassword_returns400() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email("user@bowol.ai")
                .password("")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")));
    }
}
