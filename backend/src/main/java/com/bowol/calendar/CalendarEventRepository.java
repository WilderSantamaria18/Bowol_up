package com.bowol.calendar;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {

    List<CalendarEvent> findAllByOrganizationIdOrderByStartDateAsc(UUID organizationId);

    Optional<CalendarEvent> findByIdAndOrganizationId(UUID id, UUID organizationId);

    @Query("SELECT e FROM CalendarEvent e WHERE e.organizationId = :orgId " +
           "AND (:startDate IS NULL OR e.startDate >= :startDate OR (e.endDate IS NOT NULL AND e.endDate >= :startDate)) " +
           "AND (:endDate IS NULL OR e.startDate <= :endDate) " +
           "ORDER BY e.startDate ASC")
    List<CalendarEvent> findByDateRange(
            @Param("orgId") UUID orgId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<CalendarEvent> findAllByOrganizationIdAndProjectIdOrderByStartDateAsc(UUID organizationId, UUID projectId);
}
