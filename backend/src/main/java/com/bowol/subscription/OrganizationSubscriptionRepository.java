package com.bowol.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationSubscriptionRepository extends JpaRepository<OrganizationSubscription, UUID> {

    Optional<OrganizationSubscription> findByOrganizationId(UUID organizationId);

    boolean existsByOrganizationId(UUID organizationId);
}
