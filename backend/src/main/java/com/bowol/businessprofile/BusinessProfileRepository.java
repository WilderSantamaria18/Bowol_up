package com.bowol.businessprofile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessProfileRepository extends JpaRepository<BusinessProfile, UUID> {

    @Query("SELECT bp FROM BusinessProfile bp WHERE bp.organizationId = :orgId AND bp.deletedAt IS NULL")
    Optional<BusinessProfile> findByOrganizationId(@Param("orgId") UUID orgId);

    boolean existsByOrganizationId(UUID orgId);
}
