package com.bowol.experiment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExperimentRepository extends JpaRepository<Experiment, UUID> {

    @Override
    @Query("SELECT e FROM Experiment e WHERE e.id = :id")
    Optional<Experiment> findById(@Param("id") UUID id);

    Optional<Experiment> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<Experiment> findAllByOrganizationId(UUID organizationId);

    List<Experiment> findAllByHypothesisIdAndOrganizationId(UUID hypothesisId, UUID organizationId);

    List<Experiment> findAllByOrganizationIdAndStatus(UUID organizationId, ExperimentStatus status);

    List<Experiment> findAllByHypothesisIdAndOrganizationIdAndStatus(UUID hypothesisId, UUID organizationId, ExperimentStatus status);
}
