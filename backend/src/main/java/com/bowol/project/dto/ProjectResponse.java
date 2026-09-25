package com.bowol.project.dto;

import com.bowol.project.Project;
import com.bowol.project.ProjectStatus;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {
    private UUID id;
    private UUID organizationId;
    private UUID opportunityId;
    private UUID experimentId;
    private String name;
    private String description;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;

    public static ProjectResponse from(Project project) {
        if (project == null) return null;
        return ProjectResponse.builder()
                .id(project.getId())
                .organizationId(project.getOrganizationId())
                .opportunityId(project.getOpportunityId())
                .experimentId(project.getExperimentId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdBy(project.getCreatedBy())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
