package com.bowol.trend;

import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.source.TrendSourceCode;
import com.bowol.trend.dto.MarkRelevantRequest;
import com.bowol.trend.dto.TrendRelevanceResponse;
import com.bowol.trend.dto.TrendResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trends")
@RequiredArgsConstructor
public class TrendController {

    private final TrendService trendService;
    private final com.bowol.trend.ai.TrendRelevanceEvaluator trendRelevanceEvaluator;

    @GetMapping
    public ResponseEntity<PageResponse<TrendResponse>> getTrends(
            @RequestParam(required = false) TrendSourceCode source,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer minScore,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {

        PageResponse<TrendResponse> response = trendService.getTrends(principal, source, query, minScore, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/for-me")
    public ResponseEntity<PageResponse<TrendRelevanceResponse>> getTrendsForMe(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {

        PageResponse<TrendRelevanceResponse> response = trendService.getTrendsForMe(principal, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrendResponse> getTrendById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        TrendResponse response = trendService.getTrendById(id, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/mark-relevant")
    public ResponseEntity<TrendRelevanceResponse> markRelevant(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) MarkRelevantRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        TrendRelevanceResponse response = trendService.markRelevant(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/ai-evaluate")
    public ResponseEntity<TrendRelevanceResponse> evaluateWithAi(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID orgId = principal != null && principal.getOrganizationId() != null
                ? principal.getOrganizationId()
                : com.bowol.shared.multitenancy.TenantContext.getTenantId();
        UUID userId = principal != null ? principal.getId() : null;

        TrendRelevanceResponse response = trendRelevanceEvaluator.evaluateRelevance(orgId, userId, id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/relevance")
    public ResponseEntity<Void> dismissRelevance(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        trendService.dismissRelevance(id, principal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismissRelevancePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        trendService.dismissRelevance(id, principal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sync")
    public ResponseEntity<TrendSyncResult> triggerSync(
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @AuthenticationPrincipal UserPrincipal principal) {

        TrendSyncResult result = trendService.triggerSync(principal, limit);
        return ResponseEntity.ok(result);
    }
}
