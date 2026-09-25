package com.bowol.swot;

import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.trend.Trend;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "evidence_refs")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceRef {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "entity_type", nullable = false, length = 30)
    private String entityType; // "SWOT", "OPPORTUNITY", "HYPOTHESIS"

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trend_id")
    private Trend trend;

    @Column(name = "note", columnDefinition = "text")
    private String note;

    @Column(name = "weight")
    private Integer weight;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

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
        if (this.entityType == null) {
            this.entityType = "SWOT";
        }
    }
}
