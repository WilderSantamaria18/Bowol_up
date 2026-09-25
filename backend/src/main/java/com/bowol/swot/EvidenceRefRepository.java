package com.bowol.swot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvidenceRefRepository extends JpaRepository<EvidenceRef, Long> {
    List<EvidenceRef> findByOrganizationIdAndEntityTypeAndEntityId(UUID organizationId, String entityType, UUID entityId);
    List<EvidenceRef> findByOrganizationIdAndTrendId(UUID organizationId, UUID trendId);
    void deleteByOrganizationIdAndEntityTypeAndEntityId(UUID organizationId, String entityType, UUID entityId);
}
