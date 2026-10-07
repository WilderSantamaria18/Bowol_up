package com.bowol.project;

import com.bowol.project.dto.*;
import com.bowol.experiment.ExperimentRepository;
import com.bowol.organization.MemberStatus;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.opportunity.OpportunityRepository;
import com.bowol.shared.exception.BadRequestException;
import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDate;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OpportunityRepository opportunityRepository;
    private final ExperimentRepository experimentRepository;

    @Transactional(readOnly = true)
    public PageResponse<ProjectResponse> getProjects(UserPrincipal principal, ProjectStatus status, Pageable pageable) {
        UUID organizationId = principal.getOrganizationId();
        Page<Project> page;
        if (status != null) {
            page = projectRepository.findAllByOrganizationIdAndStatusAndDeletedAtIsNull(organizationId, status, pageable);
        } else {
            page = projectRepository.findAllByOrganizationIdAndDeletedAtIsNull(organizationId, pageable);
        }

        return PageResponse.of(page.map(ProjectResponse::from));
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID id, UserPrincipal principal) {
        Project project = getProjectEntity(id, principal.getOrganizationId());
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        UUID userId = principal.getId();
        validateOrigin(request.getOpportunityId(), request.getExperimentId(), organizationId);
        validateDates(request.getStartDate(), request.getEndDate());

        Project project = Project.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .opportunityId(request.getOpportunityId())
                .experimentId(request.getExperimentId())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.PLANNING)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(userId)
                .build();
        project.setOrganizationId(organizationId);

        Project saved = projectRepository.save(project);

        // Add creator as OWNER member
        if (userId != null) {
            ProjectMember owner = ProjectMember.builder()
                    .projectId(saved.getId())
                    .userId(userId)
                    .role(ProjectMemberRole.OWNER)
                    .build();
            projectMemberRepository.save(owner);
        }

        log.info("Proyecto creado {} en organización {}", saved.getId(), organizationId);
        return ProjectResponse.from(saved);
    }

    @Transactional
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request, UserPrincipal principal) {
        Project project = getProjectEntity(id, principal.getOrganizationId());

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            validateStatusTransition(project.getStatus(), request.getStatus());
            project.setStatus(request.getStatus());
        }
        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            project.setEndDate(request.getEndDate());
        }
        validateDates(project.getStartDate(), project.getEndDate());

        Project updated = projectRepository.save(project);
        log.info("Proyecto actualizado {} en organización {}", updated.getId(), principal.getOrganizationId());
        return ProjectResponse.from(updated);
    }

    @Transactional
    public void deleteProject(UUID id, UserPrincipal principal) {
        Project project = getProjectEntity(id, principal.getOrganizationId());
        project.markDeleted();
        projectRepository.save(project);
        log.info("Proyecto marcado como eliminado {} en organización {}", id, principal.getOrganizationId());
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getProjectMembers(UUID projectId, UserPrincipal principal) {
        // Verify project belongs to tenant
        getProjectEntity(projectId, principal.getOrganizationId());

        return projectMemberRepository.findAllByProjectId(projectId).stream()
                .map(ProjectMemberResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectMemberResponse addProjectMember(UUID projectId, AddProjectMemberRequest request, UserPrincipal principal) {
        // Verify project belongs to tenant
        getProjectEntity(projectId, principal.getOrganizationId());
        boolean activeOrganizationMember = organizationMemberRepository
                .findByUserIdAndOrganizationId(request.getUserId(), principal.getOrganizationId())
                .map(member -> member.getStatus() == MemberStatus.ACTIVE)
                .orElse(false);
        if (!activeOrganizationMember) {
            throw new BadRequestException("PROJECT_MEMBER_NOT_IN_ORGANIZATION",
                    "El usuario debe ser un miembro activo de la organización para unirse al proyecto");
        }

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, request.getUserId())
                .orElse(ProjectMember.builder()
                        .projectId(projectId)
                        .userId(request.getUserId())
                        .build());

        if (request.getRole() != null) {
            member.setRole(request.getRole());
        } else if (member.getRole() == null) {
            member.setRole(ProjectMemberRole.MEMBER);
        }

        ProjectMember saved = projectMemberRepository.save(member);
        return ProjectMemberResponse.from(saved);
    }

    @Transactional
    public void removeProjectMember(UUID projectId, UUID userId, UserPrincipal principal) {
        // Verify project belongs to tenant
        getProjectEntity(projectId, principal.getOrganizationId());

        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    public Project getProjectEntity(UUID id, UUID organizationId) {
        return projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new NotFoundException("PROJECT_NO_ENCONTRADO", "No se encontró el proyecto con id: " + id));
    }

    private void validateOrigin(UUID opportunityId, UUID experimentId, UUID organizationId) {
        if (opportunityId != null && experimentId != null) {
            throw new BadRequestException("PROJECT_MULTIPLE_ORIGINS", "Un proyecto debe tener un único origen estratégico");
        }
        if (opportunityId != null && opportunityRepository.findByIdAndOrganizationId(opportunityId, organizationId).isEmpty()) {
            throw new BadRequestException("PROJECT_OPPORTUNITY_NOT_FOUND", "La oportunidad de origen no pertenece a la organización");
        }
        if (experimentId != null && experimentRepository.findByIdAndOrganizationId(experimentId, organizationId).isEmpty()) {
            throw new BadRequestException("PROJECT_EXPERIMENT_NOT_FOUND", "El experimento de origen no pertenece a la organización");
        }
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("PROJECT_INVALID_DATE_RANGE", "La fecha de fin no puede ser anterior a la fecha de inicio");
        }
    }

    private void validateStatusTransition(ProjectStatus current, ProjectStatus target) {
        if (current == target) return;
        boolean allowed = switch (current) {
            case PLANNING -> target == ProjectStatus.ACTIVE || target == ProjectStatus.ARCHIVED;
            case ACTIVE -> target == ProjectStatus.PAUSED || target == ProjectStatus.COMPLETED || target == ProjectStatus.ARCHIVED;
            case PAUSED -> target == ProjectStatus.ACTIVE || target == ProjectStatus.ARCHIVED;
            case COMPLETED, ARCHIVED -> false;
        };
        if (!allowed) {
            throw new BadRequestException("PROJECT_INVALID_STATUS_TRANSITION",
                    "No se puede cambiar un proyecto de " + current + " a " + target);
        }
    }
}
