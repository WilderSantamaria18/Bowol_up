package com.bowol.subscription;

import com.bowol.auth.JwtService;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.Role;
import com.bowol.subscription.dto.BuyCreditsRequest;
import com.bowol.subscription.dto.UpgradeSubscriptionRequest;
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
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SubscriptionControllerTests {

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
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private OrganizationSubscriptionRepository subscriptionRepository;

    @Autowired
    private BillingInvoiceRepository invoiceRepository;

    private User userOrgA;
    private Organization orgA;
    private String tokenOrgA;

    private User userOrgB;
    private Organization orgB;
    private String tokenOrgB;

    @BeforeEach
    void setUp() {
        // Ensure catalog plans exist
        if (!planRepository.existsById("FREE")) {
            planRepository.save(SubscriptionPlan.builder()
                    .id("FREE")
                    .name("Free Explorer")
                    .priceUsdMonthly(BigDecimal.ZERO)
                    .aiCreditsMonthly(500)
                    .maxProjects(3)
                    .maxMembers(5)
                    .features(List.of("500 créditos"))
                    .isActive(true)
                    .build());
        }

        if (!planRepository.existsById("PRO")) {
            planRepository.save(SubscriptionPlan.builder()
                    .id("PRO")
                    .name("Pro Growth")
                    .priceUsdMonthly(BigDecimal.valueOf(49.00))
                    .aiCreditsMonthly(5000)
                    .maxProjects(25)
                    .maxMembers(20)
                    .features(List.of("5,000 créditos", "Content Studio"))
                    .isActive(true)
                    .build());
        }

        if (!planRepository.existsById("BUSINESS")) {
            planRepository.save(SubscriptionPlan.builder()
                    .id("BUSINESS")
                    .name("Business Enterprise")
                    .priceUsdMonthly(BigDecimal.valueOf(199.00))
                    .aiCreditsMonthly(25000)
                    .maxProjects(-1)
                    .maxMembers(-1)
                    .features(List.of("25,000 créditos", "Ilimitado"))
                    .isActive(true)
                    .build());
        }

        // Setup Tenant A
        orgA = organizationRepository.save(Organization.builder()
                .name("Tenant A Corp")
                .slug("tenant-a-" + UUID.randomUUID())
                .build());

        userOrgA = userRepository.save(User.builder()
                .email("user-a-" + UUID.randomUUID() + "@tenanta.com")
                .passwordHash("hashed")
                .name("Owner A")
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .organization(orgA)
                .user(userOrgA)
                .role(Role.OWNER)
                .build());

        tokenOrgA = jwtService.generateAccessToken(userOrgA, orgA.getId(), Role.OWNER, Set.of("READ", "WRITE"));

        // Setup Tenant B
        orgB = organizationRepository.save(Organization.builder()
                .name("Tenant B Corp")
                .slug("tenant-b-" + UUID.randomUUID())
                .build());

        userOrgB = userRepository.save(User.builder()
                .email("user-b-" + UUID.randomUUID() + "@tenantb.com")
                .passwordHash("hashed")
                .name("Owner B")
                .build());

        organizationMemberRepository.save(OrganizationMember.builder()
                .organization(orgB)
                .user(userOrgB)
                .role(Role.OWNER)
                .build());

        tokenOrgB = jwtService.generateAccessToken(userOrgB, orgB.getId(), Role.OWNER, Set.of("READ", "WRITE"));
    }

    @Test
    @DisplayName("GET /api/v1/subscriptions/current auto-aprovisiona el plan FREE con 500 créditos")
    void testGetCurrentSubscription() throws Exception {
        mockMvc.perform(get("/api/v1/subscriptions/current")
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan.id").value("FREE"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.aiCreditsTotal").value(500))
                .andExpect(jsonPath("$.aiCreditsUsed").value(0))
                .andExpect(jsonPath("$.aiCreditsRemaining").value(500));

        assertThat(subscriptionRepository.findByOrganizationId(orgA.getId())).isPresent();
    }

    @Test
    @DisplayName("GET /api/v1/subscriptions/plans lista los planes activos ordenados por precio")
    void testListPlans() throws Exception {
        mockMvc.perform(get("/api/v1/subscriptions/plans")
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].id").value("FREE"))
                .andExpect(jsonPath("$[1].id").value("PRO"))
                .andExpect(jsonPath("$[2].id").value("BUSINESS"));
    }

    @Test
    @DisplayName("POST /api/v1/subscriptions/upgrade actualiza a PRO y genera factura")
    void testUpgradeSubscription() throws Exception {
        UpgradeSubscriptionRequest request = UpgradeSubscriptionRequest.builder()
                .planId("PRO")
                .paymentGateway(PaymentGateway.STRIPE)
                .build();

        mockMvc.perform(post("/api/v1/subscriptions/upgrade")
                        .header("Authorization", "Bearer " + tokenOrgA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan.id").value("PRO"))
                .andExpect(jsonPath("$.aiCreditsTotal").value(5000))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // Verify invoice generated
        mockMvc.perform(get("/api/v1/subscriptions/invoices")
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].amountUsd").value(49.0))
                .andExpect(jsonPath("$[0].status").value("PAID"));
    }

    @Test
    @DisplayName("POST /api/v1/subscriptions/buy-credits añade créditos adicionales y genera factura")
    void testBuyCredits() throws Exception {
        BuyCreditsRequest request = BuyCreditsRequest.builder()
                .credits(1000)
                .build();

        mockMvc.perform(post("/api/v1/subscriptions/buy-credits")
                        .header("Authorization", "Bearer " + tokenOrgA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aiCreditsTotal").value(1500)); // 500 initial + 1000 bought

        List<BillingInvoice> invoices = invoiceRepository.findAllByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgA.getId());
        assertThat(invoices).hasSize(1);
        assertThat(invoices.get(0).getAmountUsd()).isEqualByComparingTo(BigDecimal.valueOf(10.00));
    }

    @Test
    @DisplayName("POST /api/v1/subscriptions/cancel programa la cancelación al término del periodo")
    void testCancelSubscription() throws Exception {
        mockMvc.perform(post("/api/v1/subscriptions/cancel")
                        .header("Authorization", "Bearer " + tokenOrgA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cancelAtPeriodEnd").value(true));
    }

    @Test
    @DisplayName("Aislamiento multi-tenant: Org B no ve las facturas ni la suscripción de Org A")
    void testMultiTenantIsolation() throws Exception {
        // Upgrade Org A
        UpgradeSubscriptionRequest reqA = UpgradeSubscriptionRequest.builder()
                .planId("PRO")
                .build();
        mockMvc.perform(post("/api/v1/subscriptions/upgrade")
                        .header("Authorization", "Bearer " + tokenOrgA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqA)))
                .andExpect(status().isOk());

        // Org B lists invoices -> should be 0
        mockMvc.perform(get("/api/v1/subscriptions/invoices")
                        .header("Authorization", "Bearer " + tokenOrgB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Org B gets current subscription -> should be FREE, not PRO
        mockMvc.perform(get("/api/v1/subscriptions/current")
                        .header("Authorization", "Bearer " + tokenOrgB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan.id").value("FREE"))
                .andExpect(jsonPath("$.aiCreditsTotal").value(500));
    }
}
