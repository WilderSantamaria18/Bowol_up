package com.bowol.calendar;

import com.bowol.calendar.dto.*;
import com.bowol.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/unified")
    public ResponseEntity<List<UnifiedCalendarItemResponse>> getUnifiedCalendar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) CalendarEventType type,
            @RequestParam(required = false) UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<UnifiedCalendarItemResponse> items = calendarService.getUnifiedCalendar(startDate, endDate, type, projectId, principal);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/events")
    public ResponseEntity<List<CalendarEventResponse>> getEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CalendarEventResponse> events = calendarService.getEvents(startDate, endDate, principal);
        return ResponseEntity.ok(events);
    }

    @PostMapping("/events")
    public ResponseEntity<CalendarEventResponse> createEvent(
            @Valid @RequestBody CreateCalendarEventRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CalendarEventResponse response = calendarService.createEvent(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/events/{id}")
    public ResponseEntity<CalendarEventResponse> updateEvent(
            @PathVariable UUID id,
            @RequestBody UpdateCalendarEventRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CalendarEventResponse response = calendarService.updateEvent(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        calendarService.deleteEvent(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export.ics")
    public ResponseEntity<String> exportICalendar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserPrincipal principal) {
        String icsContent = calendarService.exportICalendar(startDate, endDate, principal);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bowol-roadmap.ics\"")
                .contentType(MediaType.parseMediaType("text/calendar; charset=utf-8"))
                .body(icsContent);
    }
}
