package com.bowol.calendar.dto;

import com.bowol.calendar.CalendarEventType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCalendarEventRequest {

    private UUID projectId;

    @Size(max = 200, message = "El título no puede exceder 200 caracteres")
    private String title;

    private String description;

    private CalendarEventType eventType;

    private LocalDate startDate;

    private LocalDate endDate;

    private String color;
}
