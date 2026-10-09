package com.bowol.task.dto;

import com.bowol.task.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskStatusRequest {

    @NotNull(message = "El status es obligatorio")
    private TaskStatus status;

    private String blockedReason;

    private String blockedResolver;

    private LocalDate blockedReviewDate;

    private String acceptanceEvidence;

    private String acceptanceReviewedBy;

    public UpdateTaskStatusRequest(TaskStatus status) {
        this.status = status;
    }
}
