package com.bowol.brand.dto;

import com.bowol.brand.BrandProfile;
import com.bowol.brand.BrandVoiceTone;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandProfileResponse {

    private UUID id;
    private UUID organizationId;
    private String brandName;
    private String tagline;
    private BrandVoiceTone brandVoiceTone;
    private String targetAudience;
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String fontHeading;
    private String fontBody;
    private List<String> keyValues;
    private String doGuidelines;
    private String dontGuidelines;
    private String logoUrl;
    private Instant createdAt;
    private Instant updatedAt;

    public static BrandProfileResponse fromEntity(BrandProfile entity) {
        if (entity == null) return null;
        return BrandProfileResponse.builder()
                .id(entity.getId())
                .organizationId(entity.getOrganizationId())
                .brandName(entity.getBrandName())
                .tagline(entity.getTagline())
                .brandVoiceTone(entity.getBrandVoiceTone())
                .targetAudience(entity.getTargetAudience())
                .primaryColor(entity.getPrimaryColor())
                .secondaryColor(entity.getSecondaryColor())
                .accentColor(entity.getAccentColor())
                .fontHeading(entity.getFontHeading())
                .fontBody(entity.getFontBody())
                .keyValues(entity.getKeyValues())
                .doGuidelines(entity.getDoGuidelines())
                .dontGuidelines(entity.getDontGuidelines())
                .logoUrl(entity.getLogoUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
