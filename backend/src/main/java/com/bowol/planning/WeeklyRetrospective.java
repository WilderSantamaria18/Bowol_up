package com.bowol.planning;

import com.bowol.shared.multitenancy.TenantContext;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "weekly_retrospectives")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyRetrospective {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "sprint_id")
    private UUID sprintId;

    @Column(name = "week_label", nullable = false, length = 150)
    private String weekLabel;

    @Column(name = "committed_tasks", nullable = false)
    @Builder.Default
    private Integer committedTasks = 0;

    @Column(name = "accepted_tasks", nullable = false)
    @Builder.Default
    private Integer acceptedTasks = 0;

    @Column(name = "blocked_tasks", nullable = false)
    @Builder.Default
    private Integer blockedTasks = 0;

    @Column(name = "review_pending_tasks", nullable = false)
    @Builder.Default
    private Integer reviewPendingTasks = 0;

    @Column(name = "estimated_hours", precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal estimatedHours = BigDecimal.ZERO;

    @Column(name = "actual_hours", precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal actualHours = BigDecimal.ZERO;

    @Column(name = "business_metric_result", columnDefinition = "text")
    private String businessMetricResult;

    @Column(name = "business_metric_date")
    private LocalDate businessMetricDate;

    @Column(name = "what_worked", columnDefinition = "text")
    private String whatWorked;

    @Column(name = "delay_causes", columnDefinition = "text")
    private String delayCauses;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "improvements", nullable = false)
    @Builder.Default
    private List<Map<String, Object>> improvements = new ArrayList<>();

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
        if (this.improvements == null) {
            this.improvements = new ArrayList<>();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
