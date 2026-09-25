package com.bowol.swot;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SwotAnalysisRepository extends JpaRepository<SwotAnalysis, UUID> {
    Optional<SwotAnalysis> findFirstByOrganizationIdOrderByGeneratedAtDesc(UUID organizationId);
    Optional<SwotAnalysis> findByIdAndOrganizationId(UUID id, UUID organizationId);
    Page<SwotAnalysis> findByOrganizationIdOrderByGeneratedAtDesc(UUID organizationId, Pageable pageable);
    void deleteByIdAndOrganizationId(UUID id, UUID organizationId);
}
