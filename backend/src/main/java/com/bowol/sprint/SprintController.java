package com.bowol.sprint;

import com.bowol.shared.security.UserPrincipal;
import com.bowol.sprint.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sprints")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SprintController {

    private final SprintService sprintService;
    private final AgileMetricsService agileMetricsService;

    @GetMapping("/{id}")
    public ResponseEntity<SprintResponse> getSprintById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SprintResponse response = sprintService.getSprintById(id, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SprintResponse> updateSprint(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSprintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SprintResponse response = sprintService.updateSprint(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<SprintResponse> startSprint(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SprintResponse response = sprintService.startSprint(id, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<SprintResponse> completeSprint(
            @PathVariable UUID id,
            @RequestBody(required = false) CompleteSprintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SprintResponse response = sprintService.completeSprint(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<SprintResponse> cancelSprint(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SprintResponse response = sprintService.cancelSprint(id, principal);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        sprintService.deleteSprint(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/burndown")
    public ResponseEntity<SprintBurndownResponse> getSprintBurndown(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SprintBurndownResponse response = agileMetricsService.getSprintBurndown(id, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/metrics")
    public ResponseEntity<SprintMetricsResponse> getSprintMetrics(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SprintMetricsResponse response = agileMetricsService.getSprintMetrics(id, principal);
        return ResponseEntity.ok(response);
    }
}
