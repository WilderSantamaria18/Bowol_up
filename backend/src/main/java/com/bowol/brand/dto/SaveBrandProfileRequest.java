package com.bowol.brand.dto;

import com.bowol.brand.BrandVoiceTone;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveBrandProfileRequest {

    @NotBlank(message = "El nombre de marca no puede estar vacío")
    private String brandName;

    private String tagline;

    @Builder.Default
    private BrandVoiceTone brandVoiceTone = BrandVoiceTone.PROFESSIONAL;

    private String targetAudience;

    @Builder.Default
    private String primaryColor = "#EA580C";

    @Builder.Default
    private String secondaryColor = "#10B981";

    @Builder.Default
    private String accentColor = "#6366F1";

    @Builder.Default
    private String fontHeading = "Plus Jakarta Sans";

    @Builder.Default
    private String fontBody = "Inter";

    private List<String> keyValues;

    private String doGuidelines;

    private String dontGuidelines;

    private String logoUrl;
}
