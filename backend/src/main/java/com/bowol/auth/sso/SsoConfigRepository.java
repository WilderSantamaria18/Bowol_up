package com.bowol.auth.sso;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SsoConfigRepository extends JpaRepository<SsoConfig, UUID> {

    List<SsoConfig> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    Optional<SsoConfig> findByOrganizationIdAndProviderAndDeletedAtIsNull(UUID organizationId, SsoProvider provider);

    @Query("SELECT s FROM SsoConfig s WHERE LOWER(s.domainRestriction) = LOWER(:domain) AND s.isEnabled = true AND s.deletedAt IS NULL")
    List<SsoConfig> findActiveByDomain(@Param("domain") String domain);
}
