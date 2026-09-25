package com.bowol.subscription;

import com.bowol.shared.persistence.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "billing_invoices")
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingInvoice extends BaseTenantEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "invoice_number", length = 100, nullable = false)
    private String invoiceNumber;

    @Column(name = "amount_usd", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amountUsd = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.PAID;

    @Column(name = "plan_name", length = 100, nullable = false)
    private String planName;

    @Column(name = "period_start", nullable = false)
    private Instant periodStart;

    @Column(name = "period_end", nullable = false)
    private Instant periodEnd;

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;
}
