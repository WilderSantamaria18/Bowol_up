package com.bowol.subscription;

import com.bowol.shared.security.UserPrincipal;
import com.bowol.subscription.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/current")
    public ResponseEntity<OrganizationSubscriptionResponse> getCurrentSubscription(
            @AuthenticationPrincipal UserPrincipal principal) {
        OrganizationSubscriptionResponse sub = subscriptionService.getOrCreateSubscription(principal.getOrganizationId());
        return ResponseEntity.ok(sub);
    }

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanResponse>> listPlans() {
        List<SubscriptionPlanResponse> plans = subscriptionService.listPlans();
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/upgrade")
    public ResponseEntity<OrganizationSubscriptionResponse> upgradeSubscription(
            @Valid @RequestBody UpgradeSubscriptionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        OrganizationSubscriptionResponse sub = subscriptionService.upgradeSubscription(principal.getOrganizationId(), request);
        return ResponseEntity.ok(sub);
    }

    @PostMapping("/cancel")
    public ResponseEntity<OrganizationSubscriptionResponse> cancelSubscription(
            @AuthenticationPrincipal UserPrincipal principal) {
        OrganizationSubscriptionResponse sub = subscriptionService.cancelSubscription(principal.getOrganizationId());
        return ResponseEntity.ok(sub);
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<BillingInvoiceResponse>> listInvoices(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<BillingInvoiceResponse> invoices = subscriptionService.listInvoices(principal.getOrganizationId());
        return ResponseEntity.ok(invoices);
    }

    @PostMapping("/buy-credits")
    public ResponseEntity<OrganizationSubscriptionResponse> buyCredits(
            @Valid @RequestBody BuyCreditsRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        OrganizationSubscriptionResponse sub = subscriptionService.buyCredits(principal.getOrganizationId(), request.getCredits());
        return ResponseEntity.ok(sub);
    }
}
