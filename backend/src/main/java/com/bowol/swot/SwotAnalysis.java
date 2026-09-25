package com.bowol.swot;

import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.swot.dto.SwotItem;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "swot_analyses")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SwotAnalysis {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "business_profile_id")
    private UUID businessProfileId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "profile_snapshot", nullable = false)
    @Builder.Default
    private Map<String, Object> profileSnapshot = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "strengths", nullable = false)
    @Builder.Default
    private List<SwotItem> strengths = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "weaknesses", nullable = false)
    @Builder.Default
    private List<SwotItem> weaknesses = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "opportunities", nullable = false)
    @Builder.Default
    private List<SwotItem> opportunities = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "threats", nullable = false)
    @Builder.Default
    private List<SwotItem> threats = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "summary")
    @Builder.Default
    private Map<String, Object> summary = new HashMap<>();

    @Column(name = "ai_provider", length = 30)
    private String aiProvider;

    @Column(name = "ai_model_used", length = 60)
    private String aiModelUsed;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

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
        if (this.generatedAt == null) {
            this.generatedAt = Instant.now();
        }
        if (this.profileSnapshot == null) {
            this.profileSnapshot = new HashMap<>();
        }
        if (this.strengths == null) {
            this.strengths = new ArrayList<>();
        }
        if (this.weaknesses == null) {
            this.weaknesses = new ArrayList<>();
        }
        if (this.opportunities == null) {
            this.opportunities = new ArrayList<>();
        }
        if (this.threats == null) {
            this.threats = new ArrayList<>();
        }
        if (this.summary == null) {
            this.summary = new HashMap<>();
        }
    }

    public String getSummaryText() {
        if (summary == null || summary.isEmpty()) return null;
        Object text = summary.get("text");
        return text != null ? text.toString() : summary.toString();
    }
}
