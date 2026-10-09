package com.bowol.planning;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectCharterRepository extends JpaRepository<ProjectCharter, UUID> {
    Optional<ProjectCharter> findByProjectIdAndOrganizationId(UUID projectId, UUID organizationId);
    Optional<ProjectCharter> findByProjectId(UUID projectId);
}
