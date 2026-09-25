package com.bowol.brand;

import com.bowol.shared.persistence.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "brand_profiles", uniqueConstraints = {
    @UniqueConstraint(name = "uq_brand_profiles_org", columnNames = {"organization_id"})
})
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandProfile extends BaseTenantEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "brand_name", nullable = false, length = 150)
    private String brandName;

    @Column(name = "tagline", length = 255)
    private String tagline;

    @Enumerated(EnumType.STRING)
    @Column(name = "brand_voice_tone", length = 50, nullable = false)
    @Builder.Default
    private BrandVoiceTone brandVoiceTone = BrandVoiceTone.PROFESSIONAL;

    @Column(name = "target_audience", columnDefinition = "text")
    private String targetAudience;

    @Column(name = "primary_color", length = 20)
    @Builder.Default
    private String primaryColor = "#EA580C";

    @Column(name = "secondary_color", length = 20)
    @Builder.Default
    private String secondaryColor = "#10B981";

    @Column(name = "accent_color", length = 20)
    @Builder.Default
    private String accentColor = "#6366F1";

    @Column(name = "font_heading", length = 100)
    @Builder.Default
    private String fontHeading = "Plus Jakarta Sans";

    @Column(name = "font_body", length = 100)
    @Builder.Default
    private String fontBody = "Inter";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "key_values")
    @Builder.Default
    private List<String> keyValues = new ArrayList<>();

    @Column(name = "do_guidelines", columnDefinition = "text")
    private String doGuidelines;

    @Column(name = "dont_guidelines", columnDefinition = "text")
    private String dontGuidelines;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;
}
