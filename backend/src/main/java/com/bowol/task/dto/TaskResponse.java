package com.bowol.task.dto;

import com.bowol.task.Task;
import com.bowol.task.TaskPriority;
import com.bowol.task.TaskStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
    private UUID id;
    private UUID projectId;
    private UUID sprintId;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private UUID assigneeId;
    private BigDecimal estimateHours;
    private Integer position;
    private Instant completedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static TaskResponse from(Task task) {
        if (task == null) return null;
        return TaskResponse.builder()
                .id(task.getId())
                .projectId(task.getProjectId())
                .sprintId(task.getSprintId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .assigneeId(task.getAssigneeId())
                .estimateHours(task.getEstimateHours())
                .position(task.getPosition())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
