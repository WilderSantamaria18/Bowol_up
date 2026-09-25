package com.bowol.subscription.dto;

import com.bowol.subscription.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanResponse {

    private String id;
    private String name;
    private String description;
    private BigDecimal priceUsdMonthly;
    private Integer aiCreditsMonthly;
    private Integer maxProjects;
    private Integer maxMembers;
    private List<String> features;
    private Boolean isActive;

    public static SubscriptionPlanResponse fromEntity(SubscriptionPlan plan) {
        if (plan == null) return null;
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .priceUsdMonthly(plan.getPriceUsdMonthly())
                .aiCreditsMonthly(plan.getAiCreditsMonthly())
                .maxProjects(plan.getMaxProjects())
                .maxMembers(plan.getMaxMembers())
                .features(plan.getFeatures())
                .isActive(plan.getIsActive())
                .build();
    }
}
