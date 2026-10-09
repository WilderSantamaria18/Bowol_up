package com.bowol.planning;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeeklyFocusBannerRepository extends JpaRepository<WeeklyFocusBanner, UUID> {
    Optional<WeeklyFocusBanner> findByProjectId(UUID projectId);
    Optional<WeeklyFocusBanner> findByProjectIdAndOrganizationId(UUID projectId, UUID organizationId);
}
