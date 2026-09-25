package com.bowol.task.dto;

import com.bowol.task.TaskPriority;
import com.bowol.task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTaskRequest {

    private UUID projectId;

    private UUID sprintId;

    @NotBlank(message = "El título de la tarea es obligatorio")
    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private UUID assigneeId;

    private BigDecimal estimateHours;

    private Integer position;
}
