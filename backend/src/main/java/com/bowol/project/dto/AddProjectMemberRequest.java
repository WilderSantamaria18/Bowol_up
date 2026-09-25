package com.bowol.project.dto;

import com.bowol.project.ProjectMemberRole;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddProjectMemberRequest {

    @NotNull(message = "El id del usuario es obligatorio")
    private UUID userId;

    private ProjectMemberRole role;
}
