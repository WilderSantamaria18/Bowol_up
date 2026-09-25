package com.bowol.organization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {

    List<OrganizationMember> findByUserId(UUID userId);

    @Query("SELECT om FROM OrganizationMember om JOIN FETCH om.user WHERE om.organization.id = :organizationId")
    List<OrganizationMember> findByOrganizationIdWithUser(@Param("organizationId") UUID organizationId);

    List<OrganizationMember> findByOrganizationId(UUID organizationId);

    @Query("SELECT om FROM OrganizationMember om WHERE om.user.id = :userId AND om.organization.id = :orgId")
    Optional<OrganizationMember> findByUserIdAndOrganizationId(@Param("userId") UUID userId, @Param("orgId") UUID orgId);

    boolean existsByUserIdAndOrganizationId(UUID userId, UUID orgId);

    long countByOrganizationIdAndRole(UUID organizationId, Role role);
}
