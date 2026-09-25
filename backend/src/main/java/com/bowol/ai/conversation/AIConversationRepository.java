package com.bowol.ai.conversation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AIConversationRepository extends JpaRepository<AIConversation, UUID> {

    Page<AIConversation> findByOrganizationIdOrderByUpdatedAtDesc(UUID organizationId, Pageable pageable);

    Page<AIConversation> findByOrganizationIdAndContextTypeOrderByUpdatedAtDesc(
            UUID organizationId,
            ConversationContextType contextType,
            Pageable pageable
    );

    Optional<AIConversation> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<AIConversation> findByOrganizationIdAndContextTypeAndContextId(
            UUID organizationId,
            ConversationContextType contextType,
            UUID contextId
    );
}
