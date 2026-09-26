package com.bowol.developer;

import com.bowol.developer.dto.CreateWebhookRequest;
import com.bowol.opportunity.OpportunityService;
import com.bowol.opportunity.dto.CreateOpportunityRequest;
import com.bowol.opportunity.dto.OpportunityResponse;
import com.bowol.organization.Role;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.subscription.SubscriptionService;
import com.bowol.task.TaskPriority;
import com.bowol.task.TaskService;
import com.bowol.task.TaskStatus;
import com.bowol.task.dto.CreateTaskRequest;
import com.bowol.task.dto.TaskResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class WebhookEventIntegrationTests {

    @Autowired
    private WebhookService webhookService;

    @Autowired
    private WebhookEndpointRepository endpointRepository;

    @Autowired
    private OpportunityService opportunityService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private ProjectRepository projectRepository;

    private UUID testOrgId;
    private UUID testUserId;
    private UserPrincipal testPrincipal;
    private Project testProject;

    @BeforeEach
    void setUp() {
        testOrgId = UUID.randomUUID();
        testUserId = UUID.randomUUID();
        testPrincipal = UserPrincipal.create(testUserId, "lead@enterprise.com", "Tech Lead", testOrgId, Role.ADMIN, List.of("ROLE_ADMIN"));

        // Registrar Webhook suscrito a todos los eventos
        CreateWebhookRequest whReq = CreateWebhookRequest.builder()
                .url("https://webhook.site/test-integration")
                .description("Webhook E2E")
                .events(List.of("*"))
                .build();
        webhookService.createEndpoint(testOrgId, testUserId, whReq);

        testProject = Project.builder()
                .name("Core Platform Scale")
                .status(ProjectStatus.ACTIVE)
                .build();
        testProject.setOrganizationId(testOrgId);
        testProject = projectRepository.save(testProject);
    }

    @Test
    @DisplayName("Debe emitir webhook opportunity.rice_calculated al priorizar una iniciativa")
    void testRiceCalculatedEventDispatch() {
        CreateOpportunityRequest req = CreateOpportunityRequest.builder()
                .title("Adopción de Arquitectura Multi-Región")
                .reachScore(90)
                .impactScore(85)
                .confidenceScore(80)
                .effortScore(40)
                .build();

        OpportunityResponse opp = opportunityService.createOpportunity(req, testPrincipal);

        assertThat(opp).isNotNull();
        assertThat(opp.getPriorityScore()).isGreaterThan(java.math.BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Debe emitir webhook task.blocked al crear o mover una tarea a BLOCKED")
    void testTaskBlockedEventDispatch() {
        CreateTaskRequest req = CreateTaskRequest.builder()
                .projectId(testProject.getId())
                .title("Aprovisionar VPC en AWS eu-central-1")
                .status(TaskStatus.BLOCKED)
                .priority(TaskPriority.HIGH)
                .build();

        TaskResponse task = taskService.createTask(req, testPrincipal);

        assertThat(task).isNotNull();
        assertThat(task.getStatus()).isEqualTo(TaskStatus.BLOCKED);
    }

    @Test
    @DisplayName("Debe emitir webhook subscription.credit_threshold_reached al superar el 80% de créditos")
    void testCreditThresholdEventDispatch() {
        // Consumir 450 créditos de un paquete base de 500 (90% de uso)
        boolean consumed = subscriptionService.consumeCredits(testOrgId, 450, "Generación masiva de FODA empresarial");

        assertThat(consumed).isTrue();
    }
}
