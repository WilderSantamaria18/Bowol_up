package com.bowol.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillingInvoiceRepository extends JpaRepository<BillingInvoice, UUID> {

    List<BillingInvoice> findAllByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId);

    boolean existsByInvoiceNumber(String invoiceNumber);

    Optional<BillingInvoice> findByInvoiceNumber(String invoiceNumber);
}
