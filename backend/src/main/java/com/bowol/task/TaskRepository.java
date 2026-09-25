package com.bowol.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findAllByProjectIdOrderByPositionAsc(UUID projectId);

    List<Task> findAllByProjectIdAndSprintIdOrderByPositionAsc(UUID projectId, UUID sprintId);

    List<Task> findAllByProjectIdAndStatusOrderByPositionAsc(UUID projectId, TaskStatus status);

    List<Task> findAllByProjectIdAndSprintIdIsNullOrderByPositionAsc(UUID projectId);

    @Query("SELECT COALESCE(MAX(t.position), 0) FROM Task t WHERE t.projectId = :projectId")
    Integer findMaxPositionByProjectId(@Param("projectId") UUID projectId);
}
