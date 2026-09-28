package com.bowol.dashboard;

import com.bowol.dashboard.dto.DashboardActivityItem;
import com.bowol.dashboard.dto.DashboardSummaryResponse;
import com.bowol.shared.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardSummaryResponse response = dashboardService.getSummary(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/brief")
    public ResponseEntity<DashboardSummaryResponse.ExecutiveBriefing> getBrief(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getBrief(principal));
    }

    @GetMapping("/health")
    public ResponseEntity<DashboardSummaryResponse.HealthScoreInfo> getHealth(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getHealth(principal));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<DashboardActivityItem>> getActivity(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getRecentActivity(principal));
    }
}

