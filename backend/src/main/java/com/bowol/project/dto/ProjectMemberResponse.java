package com.bowol.project.dto;

import com.bowol.project.ProjectMember;
import com.bowol.project.ProjectMemberRole;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMemberResponse {
    private Long id;
    private UUID projectId;
    private UUID userId;
    private ProjectMemberRole role;
    private Instant addedAt;

    public static ProjectMemberResponse from(ProjectMember member) {
        if (member == null) return null;
        return ProjectMemberResponse.builder()
                .id(member.getId())
                .projectId(member.getProjectId())
                .userId(member.getUserId())
                .role(member.getRole())
                .addedAt(member.getAddedAt())
                .build();
    }
}
