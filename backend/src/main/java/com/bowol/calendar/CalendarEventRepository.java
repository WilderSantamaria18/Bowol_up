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
           "AND e.startDate <= :endDate " +
           "AND (e.startDate >= :startDate OR (e.endDate IS NOT NULL AND e.endDate >= :startDate)) " +
           "ORDER BY e.startDate ASC")
    List<CalendarEvent> findBetweenDates(
            @Param("orgId") UUID orgId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT e FROM CalendarEvent e WHERE e.organizationId = :orgId " +
           "AND (e.startDate >= :startDate OR (e.endDate IS NOT NULL AND e.endDate >= :startDate)) " +
           "ORDER BY e.startDate ASC")
    List<CalendarEvent> findFromDate(
            @Param("orgId") UUID orgId,
            @Param("startDate") LocalDate startDate
    );

    @Query("SELECT e FROM CalendarEvent e WHERE e.organizationId = :orgId " +
           "AND e.startDate <= :endDate " +
           "ORDER BY e.startDate ASC")
    List<CalendarEvent> findUntilDate(
            @Param("orgId") UUID orgId,
            @Param("endDate") LocalDate endDate
    );

    default List<CalendarEvent> findByDateRange(UUID orgId, LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return findBetweenDates(orgId, startDate, endDate);
        } else if (startDate != null) {
            return findFromDate(orgId, startDate);
        } else if (endDate != null) {
            return findUntilDate(orgId, endDate);
        } else {
            return findAllByOrganizationIdOrderByStartDateAsc(orgId);
        }
    }

    List<CalendarEvent> findAllByOrganizationIdAndProjectIdOrderByStartDateAsc(UUID organizationId, UUID projectId);
}
