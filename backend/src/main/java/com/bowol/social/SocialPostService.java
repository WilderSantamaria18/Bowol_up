package com.bowol.social;

import com.bowol.shared.security.UserPrincipal;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.social.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SocialPostService {

    private final SocialPostRepository socialPostRepository;
    private final SocialIntelligenceService socialIntelligenceService;

    @Transactional(readOnly = true)
    public List<SocialPostResponse> listPosts(SocialChannel channel, SocialPostStatus status, UUID organizationId) {
        List<SocialPost> posts;
        if (channel != null && status != null) {
            posts = socialPostRepository.findAllByOrganizationIdAndChannelAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(organizationId, channel, status);
        } else if (channel != null) {
            posts = socialPostRepository.findAllByOrganizationIdAndChannelAndDeletedAtIsNullOrderByCreatedAtDesc(organizationId, channel);
        } else if (status != null) {
            posts = socialPostRepository.findAllByOrganizationIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(organizationId, status);
        } else {
            posts = socialPostRepository.findAllByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(organizationId);
        }

        return posts.stream()
                .map(SocialPostResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SocialPostResponse getPostById(UUID id, UUID organizationId) {
        SocialPost post = socialPostRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new NotFoundException("PUBLICACION_NO_ENCONTRADA", "No se encontró la publicación con id: " + id));
        return SocialPostResponse.fromEntity(post);
    }

    @Transactional
    public SocialPostResponse createPost(CreateSocialPostRequest request, UUID userId, UUID organizationId) {
        SocialPost post = SocialPost.builder()
                .projectId(request.getProjectId())
                .opportunityId(request.getOpportunityId())
                .channel(request.getChannel())
                .title(request.getTitle())
                .content(request.getContent())
                .status(request.getStatus() != null ? request.getStatus() : SocialPostStatus.DRAFT)
                .scheduledAt(request.getScheduledAt())
                .predictedImpact(request.getPredictedImpact())
                .mediaUrls(request.getMediaUrls() != null ? request.getMediaUrls() : List.of())
                .tags(request.getTags() != null ? request.getTags() : List.of())
                .createdBy(userId)
                .build();
        post.setOrganizationId(organizationId);

        SocialPost saved = socialPostRepository.save(post);
        log.info("Publicación social creada: {} para org: {}", saved.getId(), organizationId);
        return SocialPostResponse.fromEntity(saved);
    }

    @Transactional
    public SocialPostResponse updatePost(UUID id, UpdateSocialPostRequest request, UUID organizationId) {
        SocialPost post = socialPostRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new NotFoundException("PUBLICACION_NO_ENCONTRADA", "No se encontró la publicación con id: " + id));

        if (request.getProjectId() != null) post.setProjectId(request.getProjectId());
        if (request.getOpportunityId() != null) post.setOpportunityId(request.getOpportunityId());
        if (request.getChannel() != null) post.setChannel(request.getChannel());
        if (request.getTitle() != null) post.setTitle(request.getTitle());
        if (request.getContent() != null) post.setContent(request.getContent());
        if (request.getStatus() != null) post.setStatus(request.getStatus());
        if (request.getScheduledAt() != null) post.setScheduledAt(request.getScheduledAt());
        if (request.getPublishedAt() != null) post.setPublishedAt(request.getPublishedAt());
        if (request.getPredictedImpact() != null) post.setPredictedImpact(request.getPredictedImpact());
        if (request.getMediaUrls() != null) post.setMediaUrls(request.getMediaUrls());
        if (request.getTags() != null) post.setTags(request.getTags());

        SocialPost updated = socialPostRepository.save(post);
        log.info("Publicación social actualizada: {} para org: {}", updated.getId(), organizationId);
        return SocialPostResponse.fromEntity(updated);
    }

    @Transactional
    public SocialPostResponse publishPost(UUID id, UUID organizationId) {
        SocialPost post = socialPostRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new NotFoundException("PUBLICACION_NO_ENCONTRADA", "No se encontró la publicación con id: " + id));

        post.setStatus(SocialPostStatus.PUBLISHED);
        post.setPublishedAt(Instant.now());

        SocialPost published = socialPostRepository.save(post);
        log.info("Publicación social marcada como publicada: {} para org: {}", published.getId(), organizationId);
        return SocialPostResponse.fromEntity(published);
    }

    @Transactional
    public void deletePost(UUID id, UUID organizationId) {
        SocialPost post = socialPostRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new NotFoundException("PUBLICACION_NO_ENCONTRADA", "No se encontró la publicación con id: " + id));

        post.setDeletedAt(Instant.now());
        socialPostRepository.save(post);
        log.info("Publicación social eliminada (soft delete): {} para org: {}", id, organizationId);
    }

    @Transactional
    public GeneratedSocialContentResponse generateProposals(
            GenerateSocialContentRequest request,
            UserPrincipal principal) {
        return socialIntelligenceService.generateSocialProposals(
                principal.getOrganizationId(),
                principal.getId(),
                request
        );
    }
}
