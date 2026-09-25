package com.bowol.organization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    @Query("SELECT o FROM Organization o WHERE o.slug = :slug AND o.deletedAt IS NULL")
    Optional<Organization> findBySlug(@Param("slug") String slug);

    boolean existsBySlug(String slug);

    Optional<Organization> findByIdAndDeletedAtIsNull(UUID id);
}
