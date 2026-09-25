package com.bowol.subscription;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "price_usd_monthly", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal priceUsdMonthly = BigDecimal.ZERO;

    @Column(name = "ai_credits_monthly", nullable = false)
    @Builder.Default
    private Integer aiCreditsMonthly = 500;

    @Column(name = "max_projects", nullable = false)
    @Builder.Default
    private Integer maxProjects = 3;

    @Column(name = "max_members", nullable = false)
    @Builder.Default
    private Integer maxMembers = 5;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "features")
    @Builder.Default
    private List<String> features = new ArrayList<>();

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
