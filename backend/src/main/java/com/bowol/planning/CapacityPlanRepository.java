package com.bowol.planning;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CapacityPlanRepository extends JpaRepository<CapacityPlan, UUID> {
    List<CapacityPlan> findAllByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
    Optional<CapacityPlan> findFirstByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
    Optional<CapacityPlan> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
