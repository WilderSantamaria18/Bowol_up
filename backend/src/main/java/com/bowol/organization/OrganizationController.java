package com.bowol.organization;

import com.bowol.organization.dto.*;
import com.bowol.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<List<OrganizationResponse>> listOrganizations(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<OrganizationResponse> orgs = organizationService.listUserOrganizations(principal.getId());
        return ResponseEntity.ok(orgs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponse> getOrganization(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        OrganizationResponse org = organizationService.getOrganization(id, principal);
        return ResponseEntity.ok(org);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrganizationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        OrganizationResponse updated = organizationService.updateOrganization(id, request, principal);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        organizationService.deleteOrganization(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<MemberResponse>> listMembers(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<MemberResponse> members = organizationService.listMembers(id, principal);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<MemberResponse> inviteMember(
            @PathVariable UUID id,
            @Valid @RequestBody InviteMemberRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MemberResponse invited = organizationService.inviteMember(id, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(invited);
    }

    @PatchMapping("/{id}/members/{userId}")
    public ResponseEntity<MemberResponse> updateMemberRole(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateMemberRoleRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MemberResponse updated = organizationService.updateMemberRole(id, userId, request, principal);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        organizationService.removeMember(id, userId, principal);
        return ResponseEntity.noContent().build();
    }
}
