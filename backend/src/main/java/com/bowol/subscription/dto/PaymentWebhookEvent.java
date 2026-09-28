package com.bowol.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentWebhookEvent {

    /**
     * Type of webhook event:
     * - invoice.payment_succeeded
     * - invoice.payment_failed
     * - customer.subscription.deleted
     * - customer.subscription.updated
     */
    private String eventType;

    /**
     * External event or idempotency ID.
     */
    private String eventId;

    /**
     * Target organization ID.
     */
    private UUID organizationId;

    /**
     * Plan identifier (e.g. PRO, BUSINESS).
     */
    private String planId;

    /**
     * Amount charged in USD.
     */
    private BigDecimal amountUsd;

    /**
     * Invoice number or reference.
     */
    private String invoiceNumber;

    /**
     * Optional metadata payload.
     */
    private Map<String, Object> metadata;
}
