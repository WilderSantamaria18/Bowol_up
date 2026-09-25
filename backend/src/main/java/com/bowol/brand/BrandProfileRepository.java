package com.bowol.brand;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandProfileRepository extends JpaRepository<BrandProfile, UUID> {

    Optional<BrandProfile> findByOrganizationId(UUID organizationId);

    boolean existsByOrganizationId(UUID organizationId);
}
