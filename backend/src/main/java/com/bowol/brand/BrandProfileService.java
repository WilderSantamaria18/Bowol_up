package com.bowol.brand;

import com.bowol.brand.dto.BrandProfileResponse;
import com.bowol.brand.dto.SaveBrandProfileRequest;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationRepository;
import com.bowol.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandProfileService {

    private final BrandProfileRepository brandProfileRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional
    public BrandProfileResponse getOrCreateBrandProfile(UUID organizationId) {
        return brandProfileRepository.findByOrganizationId(organizationId)
                .map(BrandProfileResponse::fromEntity)
                .orElseGet(() -> {
                    String orgName = organizationRepository.findById(organizationId)
                            .map(Organization::getName)
                            .orElse("Mi Empresa");

                    BrandProfile defaultProfile = BrandProfile.builder()
                            .brandName(orgName)
                            .tagline("Innovación impulsada por inteligencia estratégica")
                            .brandVoiceTone(BrandVoiceTone.INNOVATIVE)
                            .targetAudience("Empresas, líderes de producto y equipos tecnológicos que buscan agilidad y foco estratégico.")
                            .primaryColor("#EA580C")
                            .secondaryColor("#10B981")
                            .accentColor("#6366F1")
                            .fontHeading("Plus Jakarta Sans")
                            .fontBody("Inter")
                            .keyValues(new ArrayList<>(List.of(
                                    "Innovación orientada a impacto",
                                    "Transparencia radical",
                                    "Velocidad de aprendizaje"
                            )))
                            .doGuidelines("Usar tono constructivo, fundamentar afirmaciones con datos y estructurar ideas en párrafos claros.")
                            .dontGuidelines("Evitar jerga vacía (buzzwords sin sustento), promesas grandilocuentes sin métricas y contenido genérico.")
                            .build();
                    defaultProfile.setOrganizationId(organizationId);

                    BrandProfile saved = brandProfileRepository.save(defaultProfile);
                    log.info("Perfil de marca inicializado para la organización {}", organizationId);
                    return BrandProfileResponse.fromEntity(saved);
                });
    }

    @Transactional
    public BrandProfileResponse saveBrandProfile(UUID organizationId, SaveBrandProfileRequest request) {
        BrandProfile profile = brandProfileRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> {
                    BrandProfile newProfile = new BrandProfile();
                    newProfile.setOrganizationId(organizationId);
                    return newProfile;
                });

        profile.setBrandName(request.getBrandName());
        profile.setTagline(request.getTagline());
        if (request.getBrandVoiceTone() != null) {
            profile.setBrandVoiceTone(request.getBrandVoiceTone());
        }
        profile.setTargetAudience(request.getTargetAudience());
        if (request.getPrimaryColor() != null) profile.setPrimaryColor(request.getPrimaryColor());
        if (request.getSecondaryColor() != null) profile.setSecondaryColor(request.getSecondaryColor());
        if (request.getAccentColor() != null) profile.setAccentColor(request.getAccentColor());
        if (request.getFontHeading() != null) profile.setFontHeading(request.getFontHeading());
        if (request.getFontBody() != null) profile.setFontBody(request.getFontBody());
        if (request.getKeyValues() != null) profile.setKeyValues(request.getKeyValues());
        profile.setDoGuidelines(request.getDoGuidelines());
        profile.setDontGuidelines(request.getDontGuidelines());
        profile.setLogoUrl(request.getLogoUrl());

        BrandProfile saved = brandProfileRepository.save(profile);
        log.info("Perfil de marca guardado para la organización {}", organizationId);
        return BrandProfileResponse.fromEntity(saved);
    }
}
