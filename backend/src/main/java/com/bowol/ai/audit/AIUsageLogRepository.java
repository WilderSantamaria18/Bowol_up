package com.bowol.ai.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface AIUsageLogRepository extends JpaRepository<AIUsageLog, Long> {

    Page<AIUsageLog> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId, Pageable pageable);

    List<AIUsageLog> findByOrganizationIdAndOperation(UUID organizationId, String operation);

    @Query("SELECT COALESCE(SUM(l.tokensInput + l.tokensOutput), 0) FROM AIUsageLog l WHERE l.organizationId = :orgId")
    Long sumTotalTokensByOrganizationId(@Param("orgId") UUID orgId);

    @Query("SELECT COALESCE(SUM(l.costUsd), 0) FROM AIUsageLog l WHERE l.organizationId = :orgId")
    BigDecimal sumTotalCostByOrganizationId(@Param("orgId") UUID orgId);
}
