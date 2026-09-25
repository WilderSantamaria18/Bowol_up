package com.bowol.sprint;

import com.bowol.project.ProjectService;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.sprint.dto.*;
import com.bowol.task.Task;
import com.bowol.task.TaskRepository;
import com.bowol.task.TaskStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgileMetricsService {

    private final SprintRepository sprintRepository;
    private final SprintService sprintService;
    private final ProjectService projectService;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public SprintBurndownResponse getSprintBurndown(UUID sprintId, UserPrincipal principal) {
        Sprint sprint = sprintService.getSprintEntity(sprintId, principal.getOrganizationId());
        List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(sprint.getProjectId(), sprint.getId());

        BigDecimal totalEstimatedHours = tasks.stream()
                .map(Task::getEstimateHours)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate startDate = sprint.getStartDate();
        LocalDate endDate = sprint.getEndDate();
        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDate today = LocalDate.now();

        List<BurndownPoint> dataPoints = new ArrayList<>();

        for (int i = 0; i < totalDays; i++) {
            LocalDate currentDate = startDate.plusDays(i);

            // Ideal line computation (linear descent from totalEstimatedHours to 0)
            BigDecimal idealHours;
            if (totalDays > 1) {
                BigDecimal progress = BigDecimal.valueOf(i).divide(BigDecimal.valueOf(totalDays - 1), 4, RoundingMode.HALF_UP);
                idealHours = totalEstimatedHours.subtract(totalEstimatedHours.multiply(progress)).setScale(2, RoundingMode.HALF_UP);
            } else {
                idealHours = BigDecimal.ZERO;
            }

            // Remaining hours computation
            BigDecimal remainingHours = null;
            if (!(currentDate.isAfter(today) && sprint.getStatus() == SprintStatus.ACTIVE)) {
                BigDecimal completedUpToDate = tasks.stream()
                        .filter(t -> t.getStatus() == TaskStatus.DONE && t.getCompletedAt() != null)
                        .filter(t -> !t.getCompletedAt().atZone(ZoneOffset.UTC).toLocalDate().isAfter(currentDate))
                        .map(Task::getEstimateHours)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                remainingHours = totalEstimatedHours.subtract(completedUpToDate);
                if (remainingHours.compareTo(BigDecimal.ZERO) < 0) {
                    remainingHours = BigDecimal.ZERO;
                }
            }

            dataPoints.add(BurndownPoint.builder()
                    .date(currentDate)
                    .idealHours(idealHours)
                    .remainingHours(remainingHours)
                    .build());
        }

        BigDecimal currentRemaining = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE)
                .map(Task::getEstimateHours)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SprintBurndownResponse.builder()
                .sprintId(sprint.getId())
                .sprintName(sprint.getName())
                .startDate(startDate)
                .endDate(endDate)
                .totalEstimatedHours(totalEstimatedHours)
                .remainingHours(currentRemaining)
                .dataPoints(dataPoints)
                .build();
    }

    @Transactional(readOnly = true)
    public SprintMetricsResponse getSprintMetrics(UUID sprintId, UserPrincipal principal) {
        Sprint sprint = sprintService.getSprintEntity(sprintId, principal.getOrganizationId());
        List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(sprint.getProjectId(), sprint.getId());

        int totalTasks = tasks.size();
        int completedTasks = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        int inProgressTasks = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        int todoTasks = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO || t.getStatus() == TaskStatus.BACKLOG).count();

        double completionRate = totalTasks > 0 ? Math.round((completedTasks * 100.0 / totalTasks) * 10.0) / 10.0 : 0.0;

        BigDecimal totalEstimateHours = tasks.stream()
                .map(Task::getEstimateHours)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal completedEstimateHours = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .map(Task::getEstimateHours)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Average Cycle Time in hours for completed tasks
        Double averageCycleTimeHours = null;
        List<Double> cycleTimes = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE && t.getCompletedAt() != null && t.getCreatedAt() != null)
                .map(t -> {
                    long minutes = Duration.between(t.getCreatedAt(), t.getCompletedAt()).toMinutes();
                    return Math.max(0, minutes / 60.0);
                })
                .toList();

        if (!cycleTimes.isEmpty()) {
            double avg = cycleTimes.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            averageCycleTimeHours = Math.round(avg * 10.0) / 10.0;
        }

        return SprintMetricsResponse.builder()
                .sprintId(sprint.getId())
                .sprintName(sprint.getName())
                .status(sprint.getStatus())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .todoTasks(todoTasks)
                .completionRate(completionRate)
                .totalEstimateHours(totalEstimateHours)
                .completedEstimateHours(completedEstimateHours)
                .averageCycleTimeHours(averageCycleTimeHours)
                .build();
    }

    @Transactional(readOnly = true)
    public ProjectVelocityResponse getProjectVelocity(UUID projectId, UserPrincipal principal) {
        projectService.getProjectEntity(projectId, principal.getOrganizationId());

        List<Sprint> sprints = sprintRepository.findAllByProjectIdOrderByStartDateDesc(projectId);
        // Reverse to chronological order (oldest to newest)
        List<Sprint> chronologicalSprints = new ArrayList<>(sprints);
        Collections.reverse(chronologicalSprints);

        List<SprintVelocityItem> history = new ArrayList<>();
        List<BigDecimal> completedHoursList = new ArrayList<>();
        List<Double> completionRatesList = new ArrayList<>();

        for (Sprint s : chronologicalSprints) {
            List<Task> tasks = taskRepository.findAllByProjectIdAndSprintIdOrderByPositionAsc(projectId, s.getId());

            BigDecimal committedHours = tasks.stream()
                    .map(Task::getEstimateHours)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal completedHours = tasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .map(Task::getEstimateHours)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            int totalTasks = tasks.size();
            int completedTasks = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();

            double completionRate = 0.0;
            if (committedHours.compareTo(BigDecimal.ZERO) > 0) {
                completionRate = completedHours.divide(committedHours, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
                completionRate = Math.round(completionRate * 10.0) / 10.0;
            } else if (totalTasks > 0) {
                completionRate = Math.round((completedTasks * 100.0 / totalTasks) * 10.0) / 10.0;
            }

            history.add(SprintVelocityItem.builder()
                    .sprintId(s.getId())
                    .sprintName(s.getName())
                    .startDate(s.getStartDate())
                    .endDate(s.getEndDate())
                    .status(s.getStatus())
                    .committedHours(committedHours)
                    .completedHours(completedHours)
                    .totalTasks(totalTasks)
                    .completedTasks(completedTasks)
                    .completionRate(completionRate)
                    .build());

            if (s.getStatus() == SprintStatus.COMPLETED) {
                completedHoursList.add(completedHours);
                completionRatesList.add(completionRate);
            }
        }

        BigDecimal averageVelocityHours = BigDecimal.ZERO;
        if (!completedHoursList.isEmpty()) {
            BigDecimal sum = completedHoursList.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            averageVelocityHours = sum.divide(BigDecimal.valueOf(completedHoursList.size()), 2, RoundingMode.HALF_UP);
        }

        Double averageCompletionRate = null;
        if (!completionRatesList.isEmpty()) {
            double avgRate = completionRatesList.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            averageCompletionRate = Math.round(avgRate * 10.0) / 10.0;
        }

        return ProjectVelocityResponse.builder()
                .projectId(projectId)
                .averageVelocityHours(averageVelocityHours)
                .averageCompletionRate(averageCompletionRate)
                .history(history)
                .build();
    }
}
