package com.bowol.social;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SocialPostRepository extends JpaRepository<SocialPost, UUID> {

    List<SocialPost> findAllByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId);

    List<SocialPost> findAllByOrganizationIdAndChannelAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId, SocialChannel channel);

    List<SocialPost> findAllByOrganizationIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId, SocialPostStatus status);

    List<SocialPost> findAllByOrganizationIdAndChannelAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId, SocialChannel channel, SocialPostStatus status);

    Optional<SocialPost> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);
}
