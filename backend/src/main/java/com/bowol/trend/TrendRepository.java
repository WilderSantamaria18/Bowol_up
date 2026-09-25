package com.bowol.trend;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrendRepository extends JpaRepository<Trend, UUID>, JpaSpecificationExecutor<Trend> {

    Optional<Trend> findBySourceIdAndExternalId(Long sourceId, String externalId);

    Page<Trend> findBySourceId(Long sourceId, Pageable pageable);

    Page<Trend> findByScoreGreaterThanEqual(Integer minScore, Pageable pageable);

    @Query("SELECT t FROM Trend t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Trend> searchByKeyword(@Param("query") String query, Pageable pageable);
}
