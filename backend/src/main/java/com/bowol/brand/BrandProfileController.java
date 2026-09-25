package com.bowol.brand;

import com.bowol.shared.security.UserPrincipal;
import com.bowol.brand.dto.BrandProfileResponse;
import com.bowol.brand.dto.SaveBrandProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/brand-profile")
@RequiredArgsConstructor
public class BrandProfileController {

    private final BrandProfileService brandProfileService;

    @GetMapping
    public ResponseEntity<BrandProfileResponse> getBrandProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        BrandProfileResponse profile = brandProfileService.getOrCreateBrandProfile(principal.getOrganizationId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<BrandProfileResponse> saveBrandProfile(
            @Valid @RequestBody SaveBrandProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BrandProfileResponse profile = brandProfileService.saveBrandProfile(principal.getOrganizationId(), request);
        return ResponseEntity.ok(profile);
    }
}
