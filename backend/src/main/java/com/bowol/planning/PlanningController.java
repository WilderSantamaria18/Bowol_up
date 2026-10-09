package com.bowol.planning;

import com.bowol.planning.dto.*;
import com.bowol.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningService planningService;

    // =========================================================================
    // IMPORT / EXPORT / VALIDATE
    // =========================================================================

    @PostMapping("/validate")
    @PreAuthorize("hasAuthority('project.read')")
    public ResponseEntity<PlanningValidationResult> validatePlan(@RequestBody PlanningImportRequest request) {
        PlanningValidationResult result = planningService.validatePlan(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('project.create')")
    public ResponseEntity<PlanningImportResponse> importPlan(
            @Valid @RequestBody PlanningImportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PlanningImportResponse response = planningService.importPlan(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/export/{projectId}")
    @PreAuthorize("hasAuthority('project.read')")
    public ResponseEntity<PlanningImportRequest> exportPlan(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        PlanningImportRequest response = planningService.exportPlan(projectId, principal);
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // PROJECT CHARTER (FICHA SMART)
    // =========================================================================

    @GetMapping("/projects/{projectId}/charter")
    @PreAuthorize("hasAuthority('project.read')")
    public ResponseEntity<ProjectCharterDto> getProjectCharter(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectCharterDto charter = planningService.getProjectCharter(projectId, principal);
        return ResponseEntity.ok(charter);
    }

    @PutMapping("/projects/{projectId}/charter")
    @PreAuthorize("hasAuthority('project.update')")
    public ResponseEntity<ProjectCharterDto> saveProjectCharter(
            @PathVariable UUID projectId,
            @RequestBody ProjectCharterDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectCharterDto saved = planningService.saveProjectCharter(projectId, dto, principal);
        return ResponseEntity.ok(saved);
    }

    // =========================================================================
    // CAPACITY PLAN
    // =========================================================================

    @GetMapping("/capacity")
    @PreAuthorize("hasAuthority('project.read')")
    public ResponseEntity<CapacityPlanDto> getCapacityPlan(
            @AuthenticationPrincipal UserPrincipal principal) {
        CapacityPlanDto plan = planningService.getCapacityPlan(principal);
        return ResponseEntity.ok(plan);
    }

    @PostMapping("/capacity")
    @PreAuthorize("hasAuthority('project.update')")
    public ResponseEntity<CapacityPlanDto> saveCapacityPlan(
            @RequestBody CapacityPlanDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        CapacityPlanDto saved = planningService.saveCapacityPlan(dto, principal);
        return ResponseEntity.ok(saved);
    }

    // =========================================================================
    // WEEKLY RETROSPECTIVES
    // =========================================================================

    @GetMapping("/retrospectives")
    @PreAuthorize("hasAuthority('project.read')")
    public ResponseEntity<List<WeeklyRetrospectiveDto>> getRetrospectives(
            @RequestParam(required = false) UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<WeeklyRetrospectiveDto> list = planningService.getWeeklyRetrospectives(projectId, principal);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/projects/{projectId}/retrospective-metrics")
    @PreAuthorize("hasAuthority('project.read')")
    public ResponseEntity<WeeklyRetrospectiveDto> getRetrospectiveMetrics(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        WeeklyRetrospectiveDto metrics = planningService.getRetrospectiveMetrics(projectId, principal);
        return ResponseEntity.ok(metrics);
    }

    @PostMapping("/retrospectives")
    @PreAuthorize("hasAuthority('project.update')")
    public ResponseEntity<WeeklyRetrospectiveDto> saveRetrospective(
            @RequestBody WeeklyRetrospectiveDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        WeeklyRetrospectiveDto saved = planningService.saveWeeklyRetrospective(dto, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // =========================================================================
    // WEEKLY FOCUS BANNER
    // =========================================================================

    @GetMapping("/projects/{projectId}/focus")
    @PreAuthorize("hasAuthority('project.read')")
    public ResponseEntity<WeeklyFocusBannerDto> getWeeklyFocus(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        WeeklyFocusBannerDto focus = planningService.getWeeklyFocusBanner(projectId, principal);
        return ResponseEntity.ok(focus);
    }

    @PutMapping("/projects/{projectId}/focus")
    @PreAuthorize("hasAuthority('project.update')")
    public ResponseEntity<WeeklyFocusBannerDto> saveWeeklyFocus(
            @PathVariable UUID projectId,
            @RequestBody WeeklyFocusBannerDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        WeeklyFocusBannerDto saved = planningService.saveWeeklyFocusBanner(projectId, dto, principal);
        return ResponseEntity.ok(saved);
    }

    // =========================================================================
    // DAILY CHECK-INS
    // =========================================================================

    @GetMapping("/projects/{projectId}/checkins")
    @PreAuthorize("hasAuthority('project.read')")
    public ResponseEntity<List<DailyCheckinDto>> getDailyCheckins(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<DailyCheckinDto> checkins = planningService.getDailyCheckins(projectId, principal);
        return ResponseEntity.ok(checkins);
    }

    @PostMapping("/projects/{projectId}/checkins")
    @PreAuthorize("hasAuthority('project.create')")
    public ResponseEntity<DailyCheckinDto> createDailyCheckin(
            @PathVariable UUID projectId,
            @RequestBody DailyCheckinDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        DailyCheckinDto saved = planningService.createDailyCheckin(projectId, dto, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
