package com.bowol.hypothesis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HypothesisRepository extends JpaRepository<Hypothesis, UUID> {

    @Override
    @Query("SELECT h FROM Hypothesis h WHERE h.id = :id")
    Optional<Hypothesis> findById(@Param("id") UUID id);

    Optional<Hypothesis> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<Hypothesis> findAllByOrganizationId(UUID organizationId);

    List<Hypothesis> findAllByOpportunityIdAndOrganizationId(UUID opportunityId, UUID organizationId);

    List<Hypothesis> findAllByOpportunityIdAndOrganizationIdAndStatus(UUID opportunityId, UUID organizationId, HypothesisStatus status);

    List<Hypothesis> findAllByOrganizationIdAndStatus(UUID organizationId, HypothesisStatus status);
}
