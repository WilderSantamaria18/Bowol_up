package com.bowol.opportunity;

import com.bowol.shared.multitenancy.TenantContext;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "opportunities")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opportunity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "swot_analysis_id")
    private UUID swotAnalysisId;

    @Column(name = "title", nullable = false, columnDefinition = "text")
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "reach_score")
    private Integer reachScore;

    @Column(name = "impact_score")
    private Integer impactScore;

    @Column(name = "confidence_score")
    private Integer confidenceScore;

    @Column(name = "effort_score")
    private Integer effortScore;

    @Column(name = "priority_score", precision = 8, scale = 2)
    private BigDecimal priorityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private OpportunityStatus status = OpportunityStatus.IDENTIFIED;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "evidence", nullable = false)
    @Builder.Default
    private List<String> evidence = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.organizationId == null) {
            UUID tenantId = TenantContext.getTenantId();
            if (tenantId != null) {
                this.organizationId = tenantId;
            }
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = Instant.now();
        }
        if (this.status == null) {
            this.status = OpportunityStatus.IDENTIFIED;
        }
        if (this.evidence == null) {
            this.evidence = new ArrayList<>();
        }
        calculateAndSetPriorityScore();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
        calculateAndSetPriorityScore();
    }

    public void calculateAndSetPriorityScore() {
        if (this.reachScore != null && this.impactScore != null && this.confidenceScore != null && this.effortScore != null) {
            double r = Math.max(0, Math.min(100, this.reachScore));
            double i = Math.max(0, Math.min(100, this.impactScore));
            double c = Math.max(0, Math.min(100, this.confidenceScore));
            double e = Math.max(1, Math.min(100, this.effortScore));

            double raw = (r * i * c) / (e * 100.0);
            this.priorityScore = BigDecimal.valueOf(raw).setScale(2, RoundingMode.HALF_UP);
        }
    }
}
