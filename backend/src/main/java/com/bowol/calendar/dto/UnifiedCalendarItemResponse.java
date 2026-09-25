package com.bowol.calendar.dto;

import com.bowol.calendar.CalendarEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedCalendarItemResponse {
    private String id;
    private String source; // "CALENDAR_EVENT", "SPRINT", "EXPERIMENT"
    private CalendarEventType eventType;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String color;
    private String status;
    private UUID projectId;
    private String projectName;
    private Map<String, Object> metadata;
}
