package com.bowol.swot;

import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.swot.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/swot")
@RequiredArgsConstructor
public class SwotController {

    private final SwotAnalysisService swotAnalysisService;

    @PostMapping("/generate")
    public ResponseEntity<SwotAnalysisResponse> generateSwot(
            @RequestBody(required = false) GenerateSwotRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        GenerateSwotRequest req = request != null ? request : new GenerateSwotRequest();
        SwotAnalysisResponse response = swotAnalysisService.generateSwot(principal, req);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/latest")
    public ResponseEntity<SwotAnalysisResponse> getLatestSwot(
            @AuthenticationPrincipal UserPrincipal principal) {
        SwotAnalysisResponse response = swotAnalysisService.getLatestSwot(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<SwotAnalysisResponse>> getAllSwots(
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        PageResponse<SwotAnalysisResponse> response = swotAnalysisService.getAllSwots(principal, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SwotAnalysisResponse> getSwotById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SwotAnalysisResponse response = swotAnalysisService.getSwotById(id, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SwotAnalysisResponse> updateSwot(
            @PathVariable UUID id,
            @RequestBody UpdateSwotRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SwotAnalysisResponse response = swotAnalysisService.updateSwot(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<SwotAnalysisResponse> addItem(
            @PathVariable UUID id,
            @Valid @RequestBody AddSwotItemRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SwotAnalysisResponse response = swotAnalysisService.addItem(id, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<SwotAnalysisResponse> removeItem(
            @PathVariable UUID id,
            @PathVariable String itemId,
            @AuthenticationPrincipal UserPrincipal principal) {
        SwotAnalysisResponse response = swotAnalysisService.removeItem(id, itemId, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/evidence")
    public ResponseEntity<List<EvidenceRefResponse>> getEvidence(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<EvidenceRefResponse> response = swotAnalysisService.getEvidence(id, principal);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSwot(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        swotAnalysisService.deleteSwot(id, principal);
        return ResponseEntity.noContent().build();
    }
}
