package com.bowol.auth;

import com.bowol.auth.dto.AuthResponse;
import com.bowol.auth.dto.LoginRequest;
import com.bowol.auth.dto.RefreshTokenRequest;
import com.bowol.auth.dto.RegisterRequest;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.Role;
import com.bowol.shared.security.RolePermissions;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest
    ) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ipAddress = httpRequest.getRemoteAddr();

        AuthResponse response = authService.register(request, userAgent, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ipAddress = httpRequest.getRemoteAddr();

        AuthResponse response = authService.login(request, userAgent, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest
    ) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ipAddress = httpRequest.getRemoteAddr();

        AuthResponse response = authService.refresh(request.getRefreshToken(), userAgent, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshTokenRequest request) {
        if (request != null && request.getRefreshToken() != null) {
            authService.logout(request.getRefreshToken());
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(principal.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<OrganizationMember> memberships = organizationMemberRepository.findByUserId(user.getId());
        List<Map<String, Object>> orgsList = new ArrayList<>();
        Map<String, Object> currentOrg = null;

        for (OrganizationMember mem : memberships) {
            Organization org = mem.getOrganization();
            Map<String, Object> orgMap = new HashMap<>();
            orgMap.put("id", org.getId());
            orgMap.put("name", org.getName());
            orgMap.put("slug", org.getSlug());
            orgMap.put("role", mem.getRole());
            orgMap.put("permissions", RolePermissions.getPermissionValues(mem.getRole()));

            orgsList.add(orgMap);

            if (principal.getOrganizationId() != null && principal.getOrganizationId().equals(org.getId())) {
                currentOrg = orgMap;
            }
        }

        if (currentOrg == null && !orgsList.isEmpty()) {
            currentOrg = orgsList.get(0);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("status", user.getStatus());
        response.put("currentOrganization", currentOrg);
        response.put("organizations", orgsList);

        return ResponseEntity.ok(response);
    }
}
