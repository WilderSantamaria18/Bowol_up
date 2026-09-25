package com.bowol.opportunity;

import com.bowol.opportunity.dto.*;
import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/opportunities")
@RequiredArgsConstructor
public class OpportunityController {

    private final OpportunityService opportunityService;

    @PostMapping("/from-swot/{swotId}")
    public ResponseEntity<OpportunitiesFromSwotResponse> generateFromSwot(
            @PathVariable UUID swotId,
            @AuthenticationPrincipal UserPrincipal principal) {
        OpportunitiesFromSwotResponse response = opportunityService.generateFromSwot(swotId, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/board")
    public ResponseEntity<Map<String, List<OpportunityResponse>>> getBoard(
            @AuthenticationPrincipal UserPrincipal principal) {
        Map<String, List<OpportunityResponse>> board = opportunityService.getBoard(principal);
        return ResponseEntity.ok(board);
    }

    @GetMapping
    public ResponseEntity<PageResponse<OpportunityResponse>> getOpportunities(
            @RequestParam(required = false) OpportunityStatus status,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        PageResponse<OpportunityResponse> response = opportunityService.getOpportunities(principal, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OpportunityResponse> getOpportunityById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        OpportunityResponse response = opportunityService.getOpportunityById(id, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<OpportunityResponse> createOpportunity(
            @Valid @RequestBody CreateOpportunityRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        OpportunityResponse response = opportunityService.createOpportunity(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OpportunityResponse> updateOpportunity(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOpportunityRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        OpportunityResponse response = opportunityService.updateOpportunity(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OpportunityResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOpportunityStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        OpportunityResponse response = opportunityService.updateStatus(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/convert-to-project")
    public ResponseEntity<com.bowol.project.dto.ProjectResponse> convertToProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        com.bowol.project.dto.ProjectResponse response = opportunityService.convertToProject(id, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpportunity(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        opportunityService.deleteOpportunity(id, principal);
        return ResponseEntity.noContent().build();
    }
}
