package com.bowol.hypothesis;

import com.bowol.shared.multitenancy.TenantContext;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hypotheses")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hypothesis {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "opportunity_id", nullable = false)
    private UUID opportunityId;

    @Column(name = "statement", nullable = false, columnDefinition = "text")
    private String statement;

    @Column(name = "validation_method", columnDefinition = "text")
    private String validationMethod;

    @Column(name = "success_metric", columnDefinition = "text")
    private String successMetric;

    @Column(name = "target_value", columnDefinition = "text")
    private String targetValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private HypothesisStatus status = HypothesisStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", length = 20)
    private HypothesisResult result;

    @Column(name = "result_notes", columnDefinition = "text")
    private String resultNotes;

    @Column(name = "validated_at")
    private Instant validatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

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
            this.status = HypothesisStatus.DRAFT;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
