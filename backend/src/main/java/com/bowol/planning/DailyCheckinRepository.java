package com.bowol.planning;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DailyCheckinRepository extends JpaRepository<DailyCheckin, UUID> {
    List<DailyCheckin> findByProjectIdOrderByDateDescCreatedAtDesc(UUID projectId);
    List<DailyCheckin> findByProjectIdAndOrganizationIdOrderByDateDescCreatedAtDesc(UUID projectId, UUID organizationId);
}
