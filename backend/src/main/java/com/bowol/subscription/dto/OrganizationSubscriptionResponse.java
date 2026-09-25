package com.bowol.subscription.dto;

import com.bowol.subscription.OrganizationSubscription;
import com.bowol.subscription.PaymentGateway;
import com.bowol.subscription.SubscriptionPlan;
import com.bowol.subscription.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationSubscriptionResponse {

    private UUID id;
    private UUID organizationId;
    private SubscriptionPlanResponse plan;
    private SubscriptionStatus status;
    private Instant currentPeriodStart;
    private Instant currentPeriodEnd;
    private Integer aiCreditsTotal;
    private Integer aiCreditsUsed;
    private Integer aiCreditsRemaining;
    private Double usagePercentage;
    private PaymentGateway paymentGateway;
    private Boolean cancelAtPeriodEnd;
    private Instant createdAt;

    public static OrganizationSubscriptionResponse fromEntity(OrganizationSubscription sub, SubscriptionPlan plan) {
        if (sub == null) return null;
        int total = sub.getAiCreditsTotal();
        int used = sub.getAiCreditsUsed();
        int remaining = Math.max(0, total - used);
        double pct = total > 0 ? ((double) used / total) * 100.0 : 0.0;

        return OrganizationSubscriptionResponse.builder()
                .id(sub.getId())
                .organizationId(sub.getOrganizationId())
                .plan(SubscriptionPlanResponse.fromEntity(plan))
                .status(sub.getStatus())
                .currentPeriodStart(sub.getCurrentPeriodStart())
                .currentPeriodEnd(sub.getCurrentPeriodEnd())
                .aiCreditsTotal(total)
                .aiCreditsUsed(used)
                .aiCreditsRemaining(remaining)
                .usagePercentage(Math.round(pct * 10.0) / 10.0)
                .paymentGateway(sub.getPaymentGateway())
                .cancelAtPeriodEnd(sub.getCancelAtPeriodEnd())
                .createdAt(sub.getCreatedAt())
                .build();
    }
}
