package com.bowol.subscription.dto;

import com.bowol.subscription.BillingInvoice;
import com.bowol.subscription.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingInvoiceResponse {

    private UUID id;
    private UUID organizationId;
    private String invoiceNumber;
    private BigDecimal amountUsd;
    private InvoiceStatus status;
    private String planName;
    private Instant periodStart;
    private Instant periodEnd;
    private String pdfUrl;
    private Instant createdAt;

    public static BillingInvoiceResponse fromEntity(BillingInvoice invoice) {
        if (invoice == null) return null;
        return BillingInvoiceResponse.builder()
                .id(invoice.getId())
                .organizationId(invoice.getOrganizationId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .amountUsd(invoice.getAmountUsd())
                .status(invoice.getStatus())
                .planName(invoice.getPlanName())
                .periodStart(invoice.getPeriodStart())
                .periodEnd(invoice.getPeriodEnd())
                .pdfUrl(invoice.getPdfUrl())
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
