package com.bowol.trend;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrendRelevanceRepository extends JpaRepository<TrendRelevance, UUID> {

    Optional<TrendRelevance> findByOrganizationIdAndTrendId(UUID organizationId, UUID trendId);

    Page<TrendRelevance> findByOrganizationIdOrderByScoreDesc(UUID organizationId, Pageable pageable);

    List<TrendRelevance> findByOrganizationId(UUID organizationId);

    List<TrendRelevance> findByOrganizationIdAndTrendIdIn(UUID organizationId, List<UUID> trendIds);

    boolean existsByOrganizationIdAndTrendId(UUID organizationId, UUID trendId);

    void deleteByOrganizationIdAndTrendId(UUID organizationId, UUID trendId);
}
