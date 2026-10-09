package com.bowol.planning.dto;

import com.bowol.planning.WeeklyFocusBanner;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyFocusBannerDto {
    private UUID id;
    private UUID projectId;
    private String weeklyDeliverable;
    private String identifiedRisk;
    private String mitigationPlan;
    private String updatedAt;

    public static WeeklyFocusBannerDto from(WeeklyFocusBanner banner) {
        if (banner == null) return null;
        return WeeklyFocusBannerDto.builder()
                .id(banner.getId())
                .projectId(banner.getProjectId())
                .weeklyDeliverable(banner.getWeeklyDeliverable())
                .identifiedRisk(banner.getIdentifiedRisk())
                .mitigationPlan(banner.getMitigationPlan())
                .updatedAt(banner.getUpdatedAt() != null ? banner.getUpdatedAt().toString() : (banner.getCreatedAt() != null ? banner.getCreatedAt().toString() : null))
                .build();
    }
}
