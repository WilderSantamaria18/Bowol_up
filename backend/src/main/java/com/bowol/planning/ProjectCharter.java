package com.bowol.planning;

import com.bowol.shared.multitenancy.TenantContext;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "project_charters")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCharter {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "project_id", nullable = false, unique = true)
    private UUID projectId;

    @Column(name = "problem_addressed", columnDefinition = "text")
    private String problemAddressed;

    @Column(name = "smart_objective", columnDefinition = "text")
    private String smartObjective;

    @Column(name = "measurable_kpi", columnDefinition = "text")
    private String measurableKpi;

    @Column(name = "baseline_value")
    private String baselineValue;

    @Column(name = "baseline_unit")
    private String baselineUnit;

    @Column(name = "baseline_date")
    private LocalDate baselineDate;

    @Column(name = "baseline_is_provisional")
    @Builder.Default
    private Boolean baselineIsProvisional = false;

    @Column(name = "target_value")
    private String targetValue;

    @Column(name = "target_unit")
    private String targetUnit;

    @Column(name = "target_deadline")
    private LocalDate targetDeadline;

    @Column(name = "measurement_source", columnDefinition = "text")
    private String measurementSource;

    @Column(name = "owner_decision_required")
    @Builder.Default
    private Boolean ownerDecisionRequired = false;

    @Column(name = "owner_decision_details", columnDefinition = "text")
    private String ownerDecisionDetails;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "technical_deliverables", nullable = false)
    @Builder.Default
    private List<String> technicalDeliverables = new ArrayList<>();

    @Column(name = "expected_commercial_result", columnDefinition = "text")
    private String expectedCommercialResult;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "in_scope", nullable = false)
    @Builder.Default
    private List<String> inScope = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "out_of_scope", nullable = false)
    @Builder.Default
    private List<String> outOfScope = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "restrictions", nullable = false)
    @Builder.Default
    private List<String> restrictions = new ArrayList<>();

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
        if (this.technicalDeliverables == null) {
            this.technicalDeliverables = new ArrayList<>();
        }
        if (this.inScope == null) {
            this.inScope = new ArrayList<>();
        }
        if (this.outOfScope == null) {
            this.outOfScope = new ArrayList<>();
        }
        if (this.restrictions == null) {
            this.restrictions = new ArrayList<>();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
