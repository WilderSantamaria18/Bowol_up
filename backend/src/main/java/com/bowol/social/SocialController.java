package com.bowol.social;

import com.bowol.shared.security.UserPrincipal;
import com.bowol.social.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialPostService socialPostService;

    @GetMapping("/posts")
    public ResponseEntity<List<SocialPostResponse>> listPosts(
            @RequestParam(required = false) SocialChannel channel,
            @RequestParam(required = false) SocialPostStatus status,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SocialPostResponse> posts = socialPostService.listPosts(channel, status, principal.getOrganizationId());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<SocialPostResponse> getPostById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SocialPostResponse post = socialPostService.getPostById(id, principal.getOrganizationId());
        return ResponseEntity.ok(post);
    }

    @PostMapping("/posts")
    public ResponseEntity<SocialPostResponse> createPost(
            @Valid @RequestBody CreateSocialPostRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SocialPostResponse post = socialPostService.createPost(request, principal.getId(), principal.getOrganizationId());
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<SocialPostResponse> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSocialPostRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SocialPostResponse post = socialPostService.updatePost(id, request, principal.getOrganizationId());
        return ResponseEntity.ok(post);
    }

    @PostMapping("/posts/{id}/publish")
    public ResponseEntity<SocialPostResponse> publishPost(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SocialPostResponse post = socialPostService.publishPost(id, principal.getOrganizationId());
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        socialPostService.deletePost(id, principal.getOrganizationId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate")
    public ResponseEntity<GeneratedSocialContentResponse> generateSocialContent(
            @Valid @RequestBody GenerateSocialContentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        GeneratedSocialContentResponse response = socialPostService.generateProposals(request, principal);
        return ResponseEntity.ok(response);
    }
}
