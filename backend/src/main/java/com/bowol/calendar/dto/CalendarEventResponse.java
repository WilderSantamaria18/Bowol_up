package com.bowol.calendar.dto;

import com.bowol.calendar.CalendarEvent;
import com.bowol.calendar.CalendarEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventResponse {
    private UUID id;
    private UUID organizationId;
    private UUID projectId;
    private String title;
    private String description;
    private CalendarEventType eventType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String color;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;

    public static CalendarEventResponse from(CalendarEvent event) {
        return CalendarEventResponse.builder()
                .id(event.getId())
                .organizationId(event.getOrganizationId())
                .projectId(event.getProjectId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventType(event.getEventType())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .color(event.getColor())
                .createdBy(event.getCreatedBy())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
