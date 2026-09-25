package com.bowol.calendar;

import com.bowol.calendar.dto.*;
import com.bowol.hypothesis.Hypothesis;
import com.bowol.hypothesis.HypothesisRepository;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.sprint.Sprint;
import com.bowol.sprint.SprintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEventRepository calendarEventRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final HypothesisRepository hypothesisRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getEvents(LocalDate startDate, LocalDate endDate, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        List<CalendarEvent> events;
        if (startDate != null || endDate != null) {
            events = calendarEventRepository.findByDateRange(organizationId, startDate, endDate);
        } else {
            events = calendarEventRepository.findAllByOrganizationIdOrderByStartDateAsc(organizationId);
        }
        return events.stream().map(CalendarEventResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UnifiedCalendarItemResponse> getUnifiedCalendar(
            LocalDate startDate,
            LocalDate endDate,
            CalendarEventType typeFilter,
            UUID projectIdFilter,
            UserPrincipal principal) {

        UUID organizationId = principal.getOrganizationId();
        List<UnifiedCalendarItemResponse> items = new ArrayList<>();

        // 1. Projects map for quick name lookup
        List<Project> orgProjects = projectRepository.findAllByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(organizationId);
        Map<UUID, String> projectNames = orgProjects.stream()
                .collect(Collectors.toMap(Project::getId, Project::getName, (a, b) -> a));

        // 2. Custom Calendar Events
        if (typeFilter == null || typeFilter == CalendarEventType.KEY_EVENT || typeFilter == CalendarEventType.MILESTONE) {
            List<CalendarEvent> events = (startDate != null || endDate != null)
                    ? calendarEventRepository.findByDateRange(organizationId, startDate, endDate)
                    : calendarEventRepository.findAllByOrganizationIdOrderByStartDateAsc(organizationId);

            for (CalendarEvent e : events) {
                if (projectIdFilter != null && !Objects.equals(e.getProjectId(), projectIdFilter)) {
                    continue;
                }
                if (typeFilter != null && e.getEventType() != typeFilter) {
                    continue;
                }
                items.add(UnifiedCalendarItemResponse.builder()
                        .id("event-" + e.getId())
                        .source("CALENDAR_EVENT")
                        .eventType(e.getEventType())
                        .title(e.getTitle())
                        .description(e.getDescription())
                        .startDate(e.getStartDate())
                        .endDate(e.getEndDate() != null ? e.getEndDate() : e.getStartDate())
                        .color(e.getColor() != null ? e.getColor() : "orange")
                        .status("ACTIVE")
                        .projectId(e.getProjectId())
                        .projectName(e.getProjectId() != null ? projectNames.get(e.getProjectId()) : null)
                        .metadata(Map.of("rawEventId", e.getId().toString()))
                        .build());
            }
        }

        // 3. Sprints across organization projects
        if (typeFilter == null || typeFilter == CalendarEventType.SPRINT) {
            for (Project p : orgProjects) {
                if (projectIdFilter != null && !p.getId().equals(projectIdFilter)) {
                    continue;
                }
                List<Sprint> sprints = sprintRepository.findAllByProjectIdOrderByStartDateDesc(p.getId());
                for (Sprint s : sprints) {
                    if (startDate != null && s.getEndDate().isBefore(startDate)) continue;
                    if (endDate != null && s.getStartDate().isAfter(endDate)) continue;

                    String color = switch (s.getStatus()) {
                        case ACTIVE -> "emerald";
                        case PLANNED -> "orange";
                        case COMPLETED -> "sky";
                        case CANCELED -> "zinc";
                    };

                    items.add(UnifiedCalendarItemResponse.builder()
                            .id("sprint-" + s.getId())
                            .source("SPRINT")
                            .eventType(CalendarEventType.SPRINT)
                            .title(s.getName())
                            .description(s.getGoal())
                            .startDate(s.getStartDate())
                            .endDate(s.getEndDate())
                            .color(color)
                            .status(s.getStatus().name())
                            .projectId(p.getId())
                            .projectName(p.getName())
                            .metadata(Map.of(
                                    "sprintId", s.getId().toString(),
                                    "status", s.getStatus().name()
                            ))
                            .build());
                }
            }
        }

        // 4. Experiments / Hypotheses validation windows
        if (typeFilter == null || typeFilter == CalendarEventType.EXPERIMENT) {
            List<Hypothesis> hypotheses = hypothesisRepository.findAllByOrganizationId(organizationId);
            for (Hypothesis h : hypotheses) {
                LocalDate date = h.getCreatedAt() != null
                        ? LocalDate.ofInstant(h.getCreatedAt(), java.time.ZoneOffset.UTC)
                        : LocalDate.now();

                if (startDate != null && date.isBefore(startDate)) continue;
                if (endDate != null && date.isAfter(endDate)) continue;

                String color = switch (h.getStatus()) {
                    case VALIDATED -> "emerald";
                    case RUNNING -> "purple";
                    case READY -> "sky";
                    case DRAFT -> "amber";
                    case INVALIDATED, CANCELED -> "rose";
                };

                items.add(UnifiedCalendarItemResponse.builder()
                        .id("hypothesis-" + h.getId())
                        .source("EXPERIMENT")
                        .eventType(CalendarEventType.EXPERIMENT)
                        .title("Validación: " + (h.getStatement().length() > 60 ? h.getStatement().substring(0, 57) + "..." : h.getStatement()))
                        .description(h.getValidationMethod() != null ? "Método: " + h.getValidationMethod() : h.getStatement())
                        .startDate(date)
                        .endDate(date.plusDays(14)) // Typical 2-week validation cycle
                        .color(color)
                        .status(h.getStatus().name())
                        .metadata(Map.of(
                                "hypothesisId", h.getId().toString(),
                                "result", h.getResult() != null ? h.getResult().name() : "PENDING"
                        ))
                        .build());
            }
        }

        // Sort chronologically by start date
        items.sort(Comparator.comparing(UnifiedCalendarItemResponse::getStartDate));
        return items;
    }

    @Transactional
    public CalendarEventResponse createEvent(CreateCalendarEventRequest request, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();

        if (request.getProjectId() != null) {
            projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getProjectId(), organizationId)
                    .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + request.getProjectId()));
        }

        CalendarEvent event = CalendarEvent.builder()
                .projectId(request.getProjectId())
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .eventType(request.getEventType() != null ? request.getEventType() : CalendarEventType.KEY_EVENT)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate() != null ? request.getEndDate() : request.getStartDate())
                .color(request.getColor() != null && !request.getColor().isBlank() ? request.getColor() : "orange")
                .createdBy(principal.getId())
                .build();
        event.setOrganizationId(organizationId);

        CalendarEvent saved = calendarEventRepository.save(event);
        log.info("Evento de calendario creado {} ({}) para organización {}", saved.getId(), saved.getTitle(), organizationId);
        return CalendarEventResponse.from(saved);
    }

    @Transactional
    public CalendarEventResponse updateEvent(UUID id, UpdateCalendarEventRequest request, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        CalendarEvent event = calendarEventRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("EVENTO_NO_ENCONTRADO", "No se encontró el evento con id: " + id));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            event.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getEventType() != null) {
            event.setEventType(request.getEventType());
        }
        if (request.getStartDate() != null) {
            event.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            event.setEndDate(request.getEndDate());
        }
        if (request.getColor() != null) {
            event.setColor(request.getColor());
        }
        if (request.getProjectId() != null) {
            projectRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getProjectId(), organizationId)
                    .orElseThrow(() -> new NotFoundException("PROYECTO_NO_ENCONTRADO", "No se encontró el proyecto con id: " + request.getProjectId()));
            event.setProjectId(request.getProjectId());
        }

        CalendarEvent saved = calendarEventRepository.save(event);
        return CalendarEventResponse.from(saved);
    }

    @Transactional
    public void deleteEvent(UUID id, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        CalendarEvent event = calendarEventRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("EVENTO_NO_ENCONTRADO", "No se encontró el evento con id: " + id));
        calendarEventRepository.delete(event);
        log.info("Evento de calendario eliminado {}", id);
    }

    @Transactional(readOnly = true)
    public String exportICalendar(LocalDate startDate, LocalDate endDate, UserPrincipal principal) {
        List<UnifiedCalendarItemResponse> items = getUnifiedCalendar(startDate, endDate, null, null, principal);
        DateTimeFormatter iCalDateFormatter = DateTimeFormatter.BASIC_ISO_DATE; // yyyyMMdd

        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//BOWOL Innovation Platform//Calendar 1.0//ES\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");
        sb.append("X-WR-CALNAME:BOWOL Innovation Roadmap\r\n");
        sb.append("X-WR-TIMEZONE:UTC\r\n");

        for (UnifiedCalendarItemResponse item : items) {
            sb.append("BEGIN:VEVENT\r\n");
            sb.append("UID:").append(item.getId()).append("@bowol.io\r\n");
            sb.append("DTSTAMP:").append(LocalDate.now().format(iCalDateFormatter)).append("T000000Z\r\n");
            sb.append("DTSTART;VALUE=DATE:").append(item.getStartDate().format(iCalDateFormatter)).append("\r\n");
            LocalDate end = item.getEndDate() != null ? item.getEndDate().plusDays(1) : item.getStartDate().plusDays(1);
            sb.append("DTEND;VALUE=DATE:").append(end.format(iCalDateFormatter)).append("\r\n");
            sb.append("SUMMARY:").append(escapeICalText(item.getTitle())).append("\r\n");
            if (item.getDescription() != null && !item.getDescription().isBlank()) {
                sb.append("DESCRIPTION:").append(escapeICalText(item.getDescription())).append("\r\n");
            }
            sb.append("CATEGORIES:").append(item.getEventType().name()).append("\r\n");
            sb.append("END:VEVENT\r\n");
        }

        sb.append("END:VCALENDAR\r\n");
        return sb.toString();
    }

    private String escapeICalText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace(";", "\\;")
                   .replace(",", "\\,")
                   .replace("\n", "\\n")
                   .replace("\r", "");
    }
}
