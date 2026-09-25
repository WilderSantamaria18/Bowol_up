package com.bowol.businessprofile;

import com.bowol.businessprofile.dto.*;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationRepository;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.shared.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessProfileService {

    private final BusinessProfileRepository businessProfileRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public BusinessProfileResponse getProfile(UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);

        BusinessProfile profile = businessProfileRepository.findByOrganizationId(orgId)
                .orElseThrow(() -> new NotFoundException("Perfil de negocio aún no configurado para la organización"));

        return BusinessProfileResponse.from(profile);
    }

    @Transactional
    public BusinessProfileResponse replaceProfile(UpdateBusinessProfileRequest request, UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);
        BusinessProfile profile = getOrCreateProfile(orgId);

        profile.setIndustry(request.getIndustry());
        profile.setSize(request.getSize());
        profile.setMarket(request.getMarket());
        profile.setGoals(request.getGoals() != null ? request.getGoals() : new ArrayList<>());
        profile.setProblems(request.getProblems() != null ? request.getProblems() : new ArrayList<>());
        profile.setTools(request.getTools() != null ? request.getTools() : new ArrayList<>());
        profile.setCompetitors(request.getCompetitors() != null ? request.getCompetitors() : new ArrayList<>());
        profile.setChannels(request.getChannels() != null ? request.getChannels() : new ArrayList<>());
        profile.setDigitalMaturity(request.getDigitalMaturity());
        profile.setAiMaturity(request.getAiMaturity());

        BusinessProfile saved = businessProfileRepository.save(profile);
        syncOrganizationMetadata(orgId, request.getIndustry(), request.getSize());

        log.info("Perfil de negocio reemplazado para organización {}", orgId);
        return BusinessProfileResponse.from(saved);
    }

    @Transactional
    public BusinessProfileResponse patchProfile(UpdateBusinessProfileRequest request, UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);
        BusinessProfile profile = getOrCreateProfile(orgId);

        if (request.getIndustry() != null) {
            profile.setIndustry(request.getIndustry());
        }
        if (request.getSize() != null) {
            profile.setSize(request.getSize());
        }
        if (request.getMarket() != null) {
            profile.setMarket(request.getMarket());
        }
        if (request.getGoals() != null) {
            profile.setGoals(request.getGoals());
        }
        if (request.getProblems() != null) {
            profile.setProblems(request.getProblems());
        }
        if (request.getTools() != null) {
            profile.setTools(request.getTools());
        }
        if (request.getCompetitors() != null) {
            profile.setCompetitors(request.getCompetitors());
        }
        if (request.getChannels() != null) {
            profile.setChannels(request.getChannels());
        }
        if (request.getDigitalMaturity() != null) {
            profile.setDigitalMaturity(request.getDigitalMaturity());
        }
        if (request.getAiMaturity() != null) {
            profile.setAiMaturity(request.getAiMaturity());
        }

        BusinessProfile saved = businessProfileRepository.save(profile);
        syncOrganizationMetadata(orgId, request.getIndustry(), request.getSize());

        log.info("Perfil de negocio actualizado parcialmente para organización {}", orgId);
        return BusinessProfileResponse.from(saved);
    }

    @Transactional
    public BusinessProfileResponse completeOnboarding(OnboardingRequest request, UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);
        BusinessProfile profile = getOrCreateProfile(orgId);

        profile.setIndustry(request.getIndustry());
        profile.setSize(request.getSize());
        profile.setMarket(request.getMarket());
        profile.setGoals(request.getGoals() != null ? request.getGoals() : new ArrayList<>());
        profile.setProblems(request.getProblems() != null ? request.getProblems() : new ArrayList<>());
        profile.setTools(request.getTools() != null ? request.getTools() : new ArrayList<>());
        profile.setCompetitors(request.getCompetitors() != null ? request.getCompetitors() : new ArrayList<>());
        profile.setChannels(request.getChannels() != null ? request.getChannels() : new ArrayList<>());
        profile.setDigitalMaturity(request.getDigitalMaturity());
        profile.setAiMaturity(request.getAiMaturity());
        profile.setOnboardingCompletedAt(Instant.now());

        BusinessProfile saved = businessProfileRepository.save(profile);
        syncOrganizationMetadata(orgId, request.getIndustry(), request.getSize());

        log.info("Onboarding completado exitosamente para organización {}", orgId);
        return BusinessProfileResponse.from(saved);
    }

    private BusinessProfile getOrCreateProfile(UUID orgId) {
        return businessProfileRepository.findByOrganizationId(orgId)
                .orElseGet(() -> {
                    BusinessProfile bp = new BusinessProfile();
                    bp.setOrganizationId(orgId);
                    return bp;
                });
    }

    private UUID resolveOrganizationId(UserPrincipal principal) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return tenantId;
        }
        if (principal != null && principal.getOrganizationId() != null) {
            return principal.getOrganizationId();
        }
        throw new IllegalStateException("No hay un identificador de organización activo en la sesión");
    }

    private void syncOrganizationMetadata(UUID orgId, String industry, com.bowol.organization.OrganizationSize size) {
        if (industry != null || size != null) {
            organizationRepository.findById(orgId).ifPresent(org -> {
                if (industry != null) org.setIndustry(industry);
                if (size != null) org.setSize(size);
                organizationRepository.save(org);
            });
        }
    }
}
