package com.bowol.planning;

import com.bowol.shared.multitenancy.TenantContext;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_checkins")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyCheckin {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_name", nullable = false, length = 150)
    private String userName;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "yesterday_deliverable", nullable = false, columnDefinition = "text")
    private String yesterdayDeliverable;

    @Column(name = "today_commitment", nullable = false, columnDefinition = "text")
    private String todayCommitment;

    @Column(name = "blockers", columnDefinition = "text")
    private String blockers;

    @Column(name = "has_blocker")
    @Builder.Default
    private Boolean hasBlocker = false;

    @Column(name = "task_id")
    private UUID taskId;

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
        if (this.hasBlocker == null) {
            this.hasBlocker = false;
        }
    }
}
