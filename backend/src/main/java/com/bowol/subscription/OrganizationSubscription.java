package com.bowol.subscription;

import com.bowol.shared.persistence.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "organization_subscriptions", uniqueConstraints = {
    @UniqueConstraint(name = "uq_org_subscriptions_org", columnNames = {"organization_id"})
})
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationSubscription extends BaseTenantEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "plan_id", length = 50, nullable = false)
    private String planId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "current_period_start", nullable = false)
    private Instant currentPeriodStart;

    @Column(name = "current_period_end", nullable = false)
    private Instant currentPeriodEnd;

    @Column(name = "ai_credits_total", nullable = false)
    @Builder.Default
    private Integer aiCreditsTotal = 500;

    @Column(name = "ai_credits_used", nullable = false)
    @Builder.Default
    private Integer aiCreditsUsed = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_gateway", length = 50)
    @Builder.Default
    private PaymentGateway paymentGateway = PaymentGateway.MOCK_STRIPE;

    @Column(name = "gateway_subscription_id", length = 100)
    private String gatewaySubscriptionId;

    @Column(name = "gateway_customer_id", length = 100)
    private String gatewayCustomerId;

    @Column(name = "cancel_at_period_end", nullable = false)
    @Builder.Default
    private Boolean cancelAtPeriodEnd = false;
}
