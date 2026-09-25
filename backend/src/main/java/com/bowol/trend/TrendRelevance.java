package com.bowol.trend;

import com.bowol.shared.multitenancy.TenantContext;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trend_relevance", uniqueConstraints = {
    @UniqueConstraint(name = "uq_trend_relevance", columnNames = {"organization_id", "trend_id"})
})
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendRelevance {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trend_id", nullable = false)
    private Trend trend;

    @Column(name = "score", nullable = false)
    @Builder.Default
    private Integer score = 0;

    @Column(name = "ai_summary", columnDefinition = "text")
    private String aiSummary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "evaluated_at", nullable = false)
    private Instant evaluatedAt;

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
        if (this.evaluatedAt == null) {
            this.evaluatedAt = Instant.now();
        }
        if (this.score == null) {
            this.score = 0;
        }
        if (this.tags == null) {
            this.tags = new ArrayList<>();
        }
    }
}
