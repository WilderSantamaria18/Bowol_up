package com.bowol.ai.audit;

import com.bowol.shared.multitenancy.TenantContext;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "ai_usage_logs")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "operation", length = 50, nullable = false)
    private String operation;

    @Column(name = "provider", length = 30, nullable = false)
    private String provider;

    @Column(name = "model", length = 60, nullable = false)
    private String model;

    @Column(name = "tokens_input", nullable = false)
    @Builder.Default
    private Integer tokensInput = 0;

    @Column(name = "tokens_output", nullable = false)
    @Builder.Default
    private Integer tokensOutput = 0;

    @Column(name = "cost_usd", precision = 10, scale = 6, nullable = false)
    @Builder.Default
    private BigDecimal costUsd = BigDecimal.ZERO;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (this.organizationId == null) {
            UUID currentTenant = TenantContext.getTenantId();
            if (currentTenant != null) {
                this.organizationId = currentTenant;
            }
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.tokensInput == null) {
            this.tokensInput = 0;
        }
        if (this.tokensOutput == null) {
            this.tokensOutput = 0;
        }
        if (this.costUsd == null) {
            this.costUsd = BigDecimal.ZERO;
        }
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
    }
}
