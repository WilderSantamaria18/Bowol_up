package com.bowol.businessprofile;

import com.bowol.businessprofile.dto.*;
import com.bowol.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/business-profile")
@RequiredArgsConstructor
public class BusinessProfileController {

    private final BusinessProfileService businessProfileService;

    @GetMapping
    public ResponseEntity<BusinessProfileResponse> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        BusinessProfileResponse response = businessProfileService.getProfile(principal);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<BusinessProfileResponse> replaceProfile(
            @Valid @RequestBody UpdateBusinessProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BusinessProfileResponse response = businessProfileService.replaceProfile(request, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping
    public ResponseEntity<BusinessProfileResponse> patchProfile(
            @Valid @RequestBody UpdateBusinessProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BusinessProfileResponse response = businessProfileService.patchProfile(request, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/onboarding")
    public ResponseEntity<BusinessProfileResponse> completeOnboarding(
            @Valid @RequestBody OnboardingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BusinessProfileResponse response = businessProfileService.completeOnboarding(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
