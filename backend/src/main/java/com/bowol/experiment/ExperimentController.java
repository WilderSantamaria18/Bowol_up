package com.bowol.experiment;

import com.bowol.experiment.dto.*;
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
@RequestMapping("/api/v1/experiments")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ExperimentController {

    private final ExperimentService experimentService;

    @GetMapping
    public ResponseEntity<List<ExperimentResponse>> getExperiments(
            @RequestParam(required = false) UUID hypothesisId,
            @RequestParam(required = false) ExperimentStatus status,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ExperimentResponse> list = experimentService.getExperiments(hypothesisId, status, principal);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperimentResponse> getExperimentById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ExperimentResponse response = experimentService.getExperimentById(id, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ExperimentResponse> createExperiment(
            @Valid @RequestBody CreateExperimentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ExperimentResponse response = experimentService.createExperiment(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExperimentResponse> updateExperiment(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateExperimentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ExperimentResponse response = experimentService.updateExperiment(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ExperimentResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateExperimentStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ExperimentResponse response = experimentService.updateStatus(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/conclusion")
    public ResponseEntity<ExperimentResponse> recordConclusion(
            @PathVariable UUID id,
            @Valid @RequestBody RecordExperimentConclusionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ExperimentResponse response = experimentService.recordConclusion(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExperiment(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        experimentService.deleteExperiment(id, principal);
        return ResponseEntity.noContent().build();
    }
}
