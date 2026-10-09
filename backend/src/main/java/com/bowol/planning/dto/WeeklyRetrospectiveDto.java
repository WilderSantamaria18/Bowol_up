package com.bowol.planning.dto;

import com.bowol.planning.WeeklyRetrospective;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyRetrospectiveDto {
    private UUID id;
    private UUID projectId;
    private UUID sprintId;
    private String weekLabel;
    private Integer committedTasks;
    private Integer acceptedTasks;
    private Integer blockedTasks;
    private Integer reviewPendingTasks;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private String businessMetricResult;
    private LocalDate businessMetricDate;
    private String whatWorked;
    private String delayCauses;
    @Builder.Default
    private List<Map<String, Object>> improvements = new ArrayList<>();
    private String updatedAt;

    public static WeeklyRetrospectiveDto from(WeeklyRetrospective retro) {
        if (retro == null) return null;
        return WeeklyRetrospectiveDto.builder()
                .id(retro.getId())
                .projectId(retro.getProjectId())
                .sprintId(retro.getSprintId())
                .weekLabel(retro.getWeekLabel())
                .committedTasks(retro.getCommittedTasks())
                .acceptedTasks(retro.getAcceptedTasks())
                .blockedTasks(retro.getBlockedTasks())
                .reviewPendingTasks(retro.getReviewPendingTasks())
                .estimatedHours(retro.getEstimatedHours())
                .actualHours(retro.getActualHours())
                .businessMetricResult(retro.getBusinessMetricResult())
                .businessMetricDate(retro.getBusinessMetricDate())
                .whatWorked(retro.getWhatWorked())
                .delayCauses(retro.getDelayCauses())
                .improvements(retro.getImprovements() != null ? retro.getImprovements() : new ArrayList<>())
                .updatedAt(retro.getUpdatedAt() != null ? retro.getUpdatedAt().toString() : (retro.getCreatedAt() != null ? retro.getCreatedAt().toString() : null))
                .build();
    }
}
