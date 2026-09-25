package com.bowol.task.dto;

import com.bowol.task.TaskStatus;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskMoveItem {
    private UUID taskId;
    private UUID sprintId;
    private TaskStatus status;
    private Integer position;
}
