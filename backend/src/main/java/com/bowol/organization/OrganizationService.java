package com.bowol.organization;

import com.bowol.organization.dto.*;
import com.bowol.shared.exception.ConflictException;
import com.bowol.shared.exception.ForbiddenException;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import com.bowol.user.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<OrganizationResponse> listUserOrganizations(UUID userId) {
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserId(userId);

        return memberships.stream()
                .filter(m -> m.getOrganization().getDeletedAt() == null)
                .map(m -> OrganizationResponse.from(m.getOrganization(), m.getRole()))
                .toList();
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(UUID orgId, UserPrincipal principal) {
        validateMembership(orgId, principal);

        Organization org = organizationRepository.findByIdAndDeletedAtIsNull(orgId)
                .orElseThrow(() -> new NotFoundException("Organización no encontrada"));

        Role callerRole = getCallerRoleInOrg(orgId, principal);
        return OrganizationResponse.from(org, callerRole);
    }

    @Transactional
    public OrganizationResponse updateOrganization(UUID orgId, UpdateOrganizationRequest request, UserPrincipal principal) {
        validateAdminOrOwner(orgId, principal);

        Organization org = organizationRepository.findByIdAndDeletedAtIsNull(orgId)
                .orElseThrow(() -> new NotFoundException("Organización no encontrada"));

        if (request.getName() != null && !request.getName().isBlank()) {
            org.setName(request.getName().trim());
        }
        if (request.getLogoUrl() != null) {
            org.setLogoUrl(request.getLogoUrl());
        }
        if (request.getIndustry() != null) {
            org.setIndustry(request.getIndustry());
        }
        if (request.getCountry() != null) {
            org.setCountry(request.getCountry().toUpperCase());
        }
        if (request.getSize() != null) {
            org.setSize(request.getSize());
        }
        if (request.getWebsite() != null) {
            org.setWebsite(request.getWebsite());
        }

        Organization saved = organizationRepository.save(org);
        Role callerRole = getCallerRoleInOrg(orgId, principal);
        return OrganizationResponse.from(saved, callerRole);
    }

    @Transactional
    public void deleteOrganization(UUID orgId, UserPrincipal principal) {
        validateOwner(orgId, principal);

        Organization org = organizationRepository.findByIdAndDeletedAtIsNull(orgId)
                .orElseThrow(() -> new NotFoundException("Organización no encontrada"));

        org.setDeletedAt(Instant.now());
        organizationRepository.save(org);
        log.info("Organización {} eliminada lógicamente (soft-delete) por usuario {}", orgId, principal.getId());
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> listMembers(UUID orgId, UserPrincipal principal) {
        validateMembership(orgId, principal);

        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationIdWithUser(orgId);
        return members.stream()
                .map(MemberResponse::from)
                .toList();
    }

    @Transactional
    public MemberResponse inviteMember(UUID orgId, InviteMemberRequest request, UserPrincipal principal) {
        validateAdminOrOwner(orgId, principal);

        if (request.getRole() == Role.OWNER) {
            throw new ForbiddenException("No se puede invitar a un nuevo miembro directamente con rol de OWNER");
        }

        Organization org = organizationRepository.findByIdAndDeletedAtIsNull(orgId)
                .orElseThrow(() -> new NotFoundException("Organización no encontrada"));

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    String baseName = normalizedEmail.contains("@") ? normalizedEmail.split("@")[0] : "Usuario";
                    User newUser = User.builder()
                            .email(normalizedEmail)
                            .name(baseName)
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .status(UserStatus.PENDING)
                            .build();
                    return userRepository.save(newUser);
                });

        if (organizationMemberRepository.existsByUserIdAndOrganizationId(user.getId(), orgId)) {
            throw new ConflictException("MEMBER_ALREADY_EXISTS", "El usuario ya es miembro de esta organización");
        }

        OrganizationMember member = OrganizationMember.builder()
                .user(user)
                .organization(org)
                .role(request.getRole())
                .status(MemberStatus.INVITED)
                .joinedAt(Instant.now())
                .build();

        OrganizationMember savedMember = organizationMemberRepository.save(member);

        org.setMemberCount((org.getMemberCount() != null ? org.getMemberCount() : 0) + 1);
        organizationRepository.save(org);

        log.info("Miembro {} invitado con rol {} en organización {}", user.getEmail(), request.getRole(), orgId);
        return MemberResponse.from(savedMember);
    }

    @Transactional
    public MemberResponse updateMemberRole(UUID orgId, UUID targetUserId, UpdateMemberRoleRequest request, UserPrincipal principal) {
        validateAdminOrOwner(orgId, principal);

        OrganizationMember targetMember = organizationMemberRepository.findByUserIdAndOrganizationId(targetUserId, orgId)
                .orElseThrow(() -> new NotFoundException("Miembro no encontrado en la organización"));

        Role callerRole = getCallerRoleInOrg(orgId, principal);

        // Si el objetivo es OWNER, solo otro OWNER (o él mismo) podría alterar el rol si hay más owners
        if (targetMember.getRole() == Role.OWNER) {
            if (callerRole != Role.OWNER && callerRole != Role.PLATFORM_ADMIN) {
                throw new ForbiddenException("Solo un OWNER puede modificar el rol de otro OWNER");
            }
            long ownerCount = organizationMemberRepository.countByOrganizationIdAndRole(orgId, Role.OWNER);
            if (ownerCount <= 1 && request.getRole() != Role.OWNER) {
                throw new ForbiddenException("No se puede degradar al único OWNER de la organización");
            }
        }

        if (request.getRole() == Role.OWNER && callerRole != Role.OWNER && callerRole != Role.PLATFORM_ADMIN) {
            throw new ForbiddenException("Solo un OWNER puede otorgar el rol de OWNER");
        }

        targetMember.setRole(request.getRole());
        OrganizationMember updated = organizationMemberRepository.save(targetMember);

        log.info("Rol de miembro {} en org {} actualizado a {}", targetUserId, orgId, request.getRole());
        return MemberResponse.from(updated);
    }

    @Transactional
    public void removeMember(UUID orgId, UUID targetUserId, UserPrincipal principal) {
        validateAdminOrOwner(orgId, principal);

        OrganizationMember targetMember = organizationMemberRepository.findByUserIdAndOrganizationId(targetUserId, orgId)
                .orElseThrow(() -> new NotFoundException("Miembro no encontrado en la organización"));

        if (targetMember.getRole() == Role.OWNER) {
            long ownerCount = organizationMemberRepository.countByOrganizationIdAndRole(orgId, Role.OWNER);
            if (ownerCount <= 1) {
                throw new ForbiddenException("No se puede eliminar al único OWNER de la organización");
            }
        }

        organizationMemberRepository.delete(targetMember);

        Organization org = targetMember.getOrganization();
        int currentCount = org.getMemberCount() != null ? org.getMemberCount() : 1;
        org.setMemberCount(Math.max(0, currentCount - 1));
        organizationRepository.save(org);

        log.info("Miembro {} removido de la organización {}", targetUserId, orgId);
    }

    private void validateMembership(UUID orgId, UserPrincipal principal) {
        if (principal.getRole() == Role.PLATFORM_ADMIN) {
            return;
        }
        boolean isMember = organizationMemberRepository.existsByUserIdAndOrganizationId(principal.getId(), orgId);
        if (!isMember) {
            throw new ForbiddenException("No perteneces a esta organización");
        }
    }

    private void validateAdminOrOwner(UUID orgId, UserPrincipal principal) {
        if (principal.getRole() == Role.PLATFORM_ADMIN) {
            return;
        }
        Role role = getCallerRoleInOrg(orgId, principal);
        if (role != Role.OWNER && role != Role.ADMIN) {
            throw new ForbiddenException("Se requiere rol de ADMIN u OWNER para esta operación");
        }
    }

    private void validateOwner(UUID orgId, UserPrincipal principal) {
        if (principal.getRole() == Role.PLATFORM_ADMIN) {
            return;
        }
        Role role = getCallerRoleInOrg(orgId, principal);
        if (role != Role.OWNER) {
            throw new ForbiddenException("Se requiere rol de OWNER para esta operación");
        }
    }

    private Role getCallerRoleInOrg(UUID orgId, UserPrincipal principal) {
        if (principal.getRole() == Role.PLATFORM_ADMIN) {
            return Role.PLATFORM_ADMIN;
        }
        return organizationMemberRepository.findByUserIdAndOrganizationId(principal.getId(), orgId)
                .map(OrganizationMember::getRole)
                .orElseThrow(() -> new ForbiddenException("No perteneces a esta organización"));
    }
}
