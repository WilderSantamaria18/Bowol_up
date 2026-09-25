package com.bowol.sprint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, UUID> {

    List<Sprint> findAllByProjectIdOrderByStartDateDesc(UUID projectId);

    Optional<Sprint> findByProjectIdAndStatus(UUID projectId, SprintStatus status);

    List<Sprint> findAllByProjectIdAndStatusOrderByStartDateDesc(UUID projectId, SprintStatus status);
}
