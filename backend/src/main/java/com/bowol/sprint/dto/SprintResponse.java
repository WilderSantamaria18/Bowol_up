package com.bowol.sprint.dto;

import com.bowol.sprint.Sprint;
import com.bowol.sprint.SprintStatus;
import com.bowol.task.Task;
import com.bowol.task.TaskStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintResponse {
    private UUID id;
    private UUID projectId;
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private Integer totalTasks;
    private Integer completedTasks;
    private BigDecimal totalEstimateHours;
    private BigDecimal completedEstimateHours;
    private Instant createdAt;
    private Instant updatedAt;

    public static SprintResponse from(Sprint sprint) {
        if (sprint == null) return null;
        return SprintResponse.builder()
                .id(sprint.getId())
                .projectId(sprint.getProjectId())
                .name(sprint.getName())
                .goal(sprint.getGoal())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus())
                .createdAt(sprint.getCreatedAt())
                .updatedAt(sprint.getUpdatedAt())
                .build();
    }

    public static SprintResponse from(Sprint sprint, List<Task> tasks) {
        if (sprint == null) return null;
        SprintResponse response = from(sprint);
        if (tasks != null) {
            response.setTotalTasks(tasks.size());
            long doneCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
            response.setCompletedTasks((int) doneCount);

            BigDecimal totalHours = tasks.stream()
                    .map(Task::getEstimateHours)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            response.setTotalEstimateHours(totalHours);

            BigDecimal doneHours = tasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .map(Task::getEstimateHours)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            response.setCompletedEstimateHours(doneHours);
        }
        return response;
    }
}
