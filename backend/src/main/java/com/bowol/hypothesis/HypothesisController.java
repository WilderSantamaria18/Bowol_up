package com.bowol.hypothesis;

import com.bowol.hypothesis.dto.*;
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
@RequestMapping("/api/v1/hypotheses")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class HypothesisController {

    private final HypothesisService hypothesisService;

    @GetMapping
    public ResponseEntity<List<HypothesisResponse>> getHypotheses(
            @RequestParam(required = false) UUID opportunityId,
            @RequestParam(required = false) HypothesisStatus status,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<HypothesisResponse> list = hypothesisService.getHypotheses(opportunityId, status, principal);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HypothesisResponse> getHypothesisById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        HypothesisResponse response = hypothesisService.getHypothesisById(id, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<HypothesisResponse> createHypothesis(
            @Valid @RequestBody CreateHypothesisRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        HypothesisResponse response = hypothesisService.createHypothesis(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HypothesisResponse> updateHypothesis(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateHypothesisRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        HypothesisResponse response = hypothesisService.updateHypothesis(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/record-result")
    public ResponseEntity<HypothesisResponse> recordResult(
            @PathVariable UUID id,
            @Valid @RequestBody RecordHypothesisResultRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        HypothesisResponse response = hypothesisService.recordResult(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/formulate")
    public ResponseEntity<HypothesisResponse> formulateFromOpportunity(
            @RequestParam UUID opportunityId,
            @AuthenticationPrincipal UserPrincipal principal) {
        HypothesisResponse response = hypothesisService.formulateFromOpportunity(opportunityId, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/convert-to-project")
    public ResponseEntity<com.bowol.project.dto.ProjectResponse> convertToProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        com.bowol.project.dto.ProjectResponse response = hypothesisService.convertToProject(id, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHypothesis(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        hypothesisService.deleteHypothesis(id, principal);
        return ResponseEntity.noContent().build();
    }
}
