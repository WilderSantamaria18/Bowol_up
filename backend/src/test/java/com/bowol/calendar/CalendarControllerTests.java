package com.bowol.calendar;

import com.bowol.auth.JwtService;
import com.bowol.calendar.dto.CreateCalendarEventRequest;
import com.bowol.calendar.dto.UpdateCalendarEventRequest;
import com.bowol.hypothesis.Hypothesis;
import com.bowol.hypothesis.HypothesisRepository;
import com.bowol.hypothesis.HypothesisStatus;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.sprint.Sprint;
import com.bowol.sprint.SprintRepository;
import com.bowol.sprint.SprintStatus;
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
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CalendarControllerTests {

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
    private CalendarEventRepository calendarEventRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private HypothesisRepository hypothesisRepository;

    @Autowired
    private com.bowol.opportunity.OpportunityRepository opportunityRepository;

    private User testUserA;
    private User testUserB;
    private Organization orgA;
    private Organization orgB;
    private String tokenA;
    private String tokenB;
    private Project projectA;

    @BeforeEach
    void setUp() {
        calendarEventRepository.deleteAll();

        orgA = organizationRepository.save(Organization.builder()
                .name("Calendar Corp A")
                .slug("calendar-corp-a-" + UUID.randomUUID())
                .build());

        orgB = organizationRepository.save(Organization.builder()
                .name("Calendar Corp B")
                .slug("calendar-corp-b-" + UUID.randomUUID())
                .build());

        testUserA = userRepository.save(User.builder()
                .email("cal-userA-" + UUID.randomUUID() + "@bowol.io")
                .passwordHash("hashed")
                .name("User A")
                .build());

        testUserB = userRepository.save(User.builder()
                .email("cal-userB-" + UUID.randomUUID() + "@bowol.io")
                .passwordHash("hashed")
                .name("User B")
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .organization(orgA)
                .user(testUserA)
                .role(Role.OWNER)
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .organization(orgB)
                .user(testUserB)
                .role(Role.OWNER)
                .build());

        tokenA = jwtService.generateAccessToken(testUserA, orgA.getId(), Role.OWNER, Set.of("READ", "WRITE"));
        tokenB = jwtService.generateAccessToken(testUserB, orgB.getId(), Role.OWNER, Set.of("READ", "WRITE"));

        projectA = Project.builder()
                .name("Proyecto Alfa")
                .description("Iniciativa estratégica para test")
                .status(ProjectStatus.ACTIVE)
                .createdBy(testUserA.getId())
                .build();
        projectA.setOrganizationId(orgA.getId());
        projectA = projectRepository.save(projectA);
    }

    @Test
    @DisplayName("POST /api/v1/calendar/events - Crear evento de calendario exitosamente")
    void createEvent_success() throws Exception {
        CreateCalendarEventRequest request = CreateCalendarEventRequest.builder()
                .projectId(projectA.getId())
                .title("Demo Day Q3 con Inversores")
                .description("Presentación de resultados del MVP")
                .eventType(CalendarEventType.MILESTONE)
                .startDate(LocalDate.now().plusDays(10))
                .endDate(LocalDate.now().plusDays(10))
                .color("purple")
                .build();

        mockMvc.perform(post("/api/v1/calendar/events")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Demo Day Q3 con Inversores"))
                .andExpect(jsonPath("$.eventType").value("MILESTONE"))
                .andExpect(jsonPath("$.color").value("purple"));
    }

    @Test
    @DisplayName("GET /api/v1/calendar/unified - Devuelve eventos unificados (eventos, sprints, experimentos)")
    void getUnifiedCalendar_success() throws Exception {
        // 1. Calendar event
        CalendarEvent event = CalendarEvent.builder()
                .projectId(projectA.getId())
                .title("Lanzamiento Beta Pública")
                .eventType(CalendarEventType.MILESTONE)
                .startDate(LocalDate.now().plusDays(7))
                .endDate(LocalDate.now().plusDays(8))
                .color("purple")
                .build();
        event.setOrganizationId(orgA.getId());
        calendarEventRepository.save(event);

        // 2. Sprint
        sprintRepository.save(Sprint.builder()
                .projectId(projectA.getId())
                .name("Sprint 1: Cimientos y MVP")
                .goal("Construir la arquitectura base")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(14))
                .status(SprintStatus.ACTIVE)
                .build());

        // 3. Opportunity and Hypothesis
        com.bowol.opportunity.Opportunity opp = com.bowol.opportunity.Opportunity.builder()
                .title("Automatización de Operaciones")
                .description("Iniciativa RICE para validación")
                .status(com.bowol.opportunity.OpportunityStatus.EVALUATING)
                .reachScore(70)
                .impactScore(80)
                .confidenceScore(90)
                .effortScore(40)
                .build();
        opp.setOrganizationId(orgA.getId());
        opp = opportunityRepository.save(opp);

        Hypothesis hypo = Hypothesis.builder()
                .opportunityId(opp.getId())
                .statement("Creemos que la automatización reducirá tiempos")
                .validationMethod("Entrevistas con 10 clientes")
                .status(HypothesisStatus.RUNNING)
                .build();
        hypo.setOrganizationId(orgA.getId());
        hypothesisRepository.save(hypo);

        mockMvc.perform(get("/api/v1/calendar/unified")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[?(@.source == 'CALENDAR_EVENT')].title").value("Lanzamiento Beta Pública"))
                .andExpect(jsonPath("$[?(@.source == 'SPRINT')].title").value("Sprint 1: Cimientos y MVP"))
                .andExpect(jsonPath("$[?(@.source == 'EXPERIMENT')]").isNotEmpty());
    }

    @Test
    @DisplayName("PATCH /api/v1/calendar/events/{id} - Actualizar evento de calendario")
    void updateEvent_success() throws Exception {
        CalendarEvent event = CalendarEvent.builder()
                .title("Revisión Inicial")
                .eventType(CalendarEventType.KEY_EVENT)
                .startDate(LocalDate.now().plusDays(3))
                .color("orange")
                .build();
        event.setOrganizationId(orgA.getId());
        event = calendarEventRepository.save(event);

        UpdateCalendarEventRequest updateReq = UpdateCalendarEventRequest.builder()
                .title("Revisión de Arquitectura Actualizada")
                .color("emerald")
                .build();

        mockMvc.perform(patch("/api/v1/calendar/events/" + event.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Revisión de Arquitectura Actualizada"))
                .andExpect(jsonPath("$.color").value("emerald"));
    }

    @Test
    @DisplayName("DELETE /api/v1/calendar/events/{id} - Eliminar evento")
    void deleteEvent_success() throws Exception {
        CalendarEvent event = CalendarEvent.builder()
                .title("Evento a Borrar")
                .eventType(CalendarEventType.KEY_EVENT)
                .startDate(LocalDate.now().plusDays(5))
                .build();
        event.setOrganizationId(orgA.getId());
        event = calendarEventRepository.save(event);

        mockMvc.perform(delete("/api/v1/calendar/events/" + event.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isNoContent());

        assertThat(calendarEventRepository.findById(event.getId())).isEmpty();
    }

    @Test
    @DisplayName("GET /api/v1/calendar/export.ics - Exportar a formato estándar iCalendar RFC 5545")
    void exportICalendar_success() throws Exception {
        CalendarEvent event = CalendarEvent.builder()
                .title("Kickoff de Innovación")
                .description("Reunión estratégica de alineación")
                .eventType(CalendarEventType.KEY_EVENT)
                .startDate(LocalDate.now().plusDays(2))
                .endDate(LocalDate.now().plusDays(2))
                .color("sky")
                .build();
        event.setOrganizationId(orgA.getId());
        calendarEventRepository.save(event);

        mockMvc.perform(get("/api/v1/calendar/export.ics")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", org.hamcrest.Matchers.containsString("text/calendar")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("BEGIN:VCALENDAR")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("SUMMARY:Kickoff de Innovación")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("END:VCALENDAR")));
    }

    @Test
    @DisplayName("Aislamiento multi-inquilino: Tenant B no puede ver ni modificar eventos de Tenant A")
    void multiTenantIsolation_denied() throws Exception {
        CalendarEvent eventA = CalendarEvent.builder()
                .title("Evento Privado de Tenant A")
                .eventType(CalendarEventType.MILESTONE)
                .startDate(LocalDate.now().plusDays(1))
                .build();
        eventA.setOrganizationId(orgA.getId());
        eventA = calendarEventRepository.save(eventA);

        // Tenant B intenta modificar evento de A -> 404
        UpdateCalendarEventRequest updateReq = UpdateCalendarEventRequest.builder()
                .title("Hackeado por B")
                .build();

        mockMvc.perform(patch("/api/v1/calendar/events/" + eventA.getId())
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isNotFound());

        // Tenant B intenta borrar evento de A -> 404
        mockMvc.perform(delete("/api/v1/calendar/events/" + eventA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }
}
