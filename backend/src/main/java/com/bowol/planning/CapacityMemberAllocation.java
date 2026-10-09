package com.bowol.planning;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "capacity_member_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapacityMemberAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capacity_plan_id", nullable = false)
    private CapacityPlan capacityPlan;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "member_name", nullable = false, length = 150)
    private String memberName;

    @Column(name = "member_role", length = 100)
    private String memberRole;

    @Column(name = "available_hours", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal availableHours = BigDecimal.ZERO;

    @Column(name = "assigned_hours", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal assignedHours = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.availableHours == null) {
            this.availableHours = BigDecimal.ZERO;
        }
        if (this.assignedHours == null) {
            this.assignedHours = BigDecimal.ZERO;
        }
    }
}
