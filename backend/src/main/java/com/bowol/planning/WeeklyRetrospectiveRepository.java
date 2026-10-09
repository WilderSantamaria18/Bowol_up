package com.bowol.planning;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeeklyRetrospectiveRepository extends JpaRepository<WeeklyRetrospective, UUID> {
    List<WeeklyRetrospective> findAllByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
    List<WeeklyRetrospective> findAllByProjectIdAndOrganizationIdOrderByCreatedAtDesc(UUID projectId, UUID organizationId);
    Optional<WeeklyRetrospective> findFirstByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
