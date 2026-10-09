package com.bowol.planning;

import com.bowol.shared.multitenancy.TenantContext;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "capacity_plans")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapacityPlan {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "period_label", nullable = false, length = 100)
    private String periodLabel;

    @Column(name = "buffer_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal bufferPercentage = BigDecimal.valueOf(20.0);

    @OneToMany(mappedBy = "capacityPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<CapacityMemberAllocation> memberAllocations = new ArrayList<>();

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
        if (this.bufferPercentage == null) {
            this.bufferPercentage = BigDecimal.valueOf(20.0);
        }
        if (this.memberAllocations == null) {
            this.memberAllocations = new ArrayList<>();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
