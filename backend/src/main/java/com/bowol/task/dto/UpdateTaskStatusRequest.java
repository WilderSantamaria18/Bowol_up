package com.bowol.task.dto;

import com.bowol.task.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskStatusRequest {

    @NotNull(message = "El status es obligatorio")
    private TaskStatus status;
}
