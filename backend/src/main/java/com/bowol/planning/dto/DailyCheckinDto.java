package com.bowol.planning.dto;

import com.bowol.planning.DailyCheckin;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyCheckinDto {
    private UUID id;
    private UUID projectId;
    private UUID userId;
    private String userName;
    private LocalDate date;
    private String yesterdayDeliverable;
    private String todayCommitment;
    private String blockers;
    private Boolean hasBlocker;
    private UUID taskId;
    private String createdAt;

    public static DailyCheckinDto from(DailyCheckin checkin) {
        if (checkin == null) return null;
        return DailyCheckinDto.builder()
                .id(checkin.getId())
                .projectId(checkin.getProjectId())
                .userId(checkin.getUserId())
                .userName(checkin.getUserName())
                .date(checkin.getDate())
                .yesterdayDeliverable(checkin.getYesterdayDeliverable())
                .todayCommitment(checkin.getTodayCommitment())
                .blockers(checkin.getBlockers())
                .hasBlocker(checkin.getHasBlocker())
                .taskId(checkin.getTaskId())
                .createdAt(checkin.getCreatedAt() != null ? checkin.getCreatedAt().toString() : null)
                .build();
    }
}
