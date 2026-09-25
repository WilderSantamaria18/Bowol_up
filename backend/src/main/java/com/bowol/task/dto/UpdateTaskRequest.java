package com.bowol.task.dto;

import com.bowol.task.TaskPriority;
import com.bowol.task.TaskStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskRequest {

    private String title;

    private String description;

    private UUID sprintId;

    private TaskStatus status;

    private TaskPriority priority;

    private UUID assigneeId;

    private BigDecimal estimateHours;

    private Integer position;
}
