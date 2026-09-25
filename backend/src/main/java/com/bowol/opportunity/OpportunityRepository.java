package com.bowol.opportunity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, UUID> {
    Optional<Opportunity> findByIdAndOrganizationId(UUID id, UUID organizationId);
    Page<Opportunity> findByOrganizationId(UUID organizationId, Pageable pageable);
    Page<Opportunity> findByOrganizationIdAndStatus(UUID organizationId, OpportunityStatus status, Pageable pageable);
    List<Opportunity> findByOrganizationIdAndStatus(UUID organizationId, OpportunityStatus status);
    List<Opportunity> findByOrganizationIdAndSwotAnalysisId(UUID organizationId, UUID swotAnalysisId);
    void deleteByIdAndOrganizationId(UUID id, UUID organizationId);
}
