package com.bowol.social;

import com.bowol.shared.persistence.BaseTenantEntity;
import com.bowol.social.dto.PredictedImpact;
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
@Table(name = "social_posts")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialPost extends BaseTenantEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "opportunity_id")
    private UUID opportunityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 50, nullable = false)
    @Builder.Default
    private SocialChannel channel = SocialChannel.LINKEDIN;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "text", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private SocialPostStatus status = SocialPostStatus.DRAFT;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "published_at")
    private Instant publishedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "predicted_impact")
    private PredictedImpact predictedImpact;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "media_urls")
    @Builder.Default
    private List<String> mediaUrls = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "created_by")
    private UUID createdBy;
}
