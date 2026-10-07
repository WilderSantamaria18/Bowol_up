package com.bowol.planning;

import com.bowol.planning.dto.PlanningImportRequest;
import com.bowol.planning.dto.PlanningImportResponse;
import com.bowol.planning.dto.PlanningValidationResult;
import com.bowol.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningService planningService;

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
}
