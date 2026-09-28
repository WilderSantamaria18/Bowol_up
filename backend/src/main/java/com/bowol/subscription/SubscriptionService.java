package com.bowol.subscription;

import com.bowol.shared.exception.BadRequestException;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.subscription.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final OrganizationSubscriptionRepository subscriptionRepository;
    private final BillingInvoiceRepository invoiceRepository;
    private final com.bowol.developer.WebhookService webhookService;

    @Transactional
    public OrganizationSubscriptionResponse getOrCreateSubscription(UUID organizationId) {
        OrganizationSubscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> createDefaultSubscription(organizationId));

        SubscriptionPlan plan = planRepository.findById(sub.getPlanId())
                .orElseGet(this::getFallbackPlan);

        return OrganizationSubscriptionResponse.fromEntity(sub, plan);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> listPlans() {
        return planRepository.findAllByIsActiveTrueOrderByPriceUsdMonthlyAsc().stream()
                .map(SubscriptionPlanResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrganizationSubscriptionResponse upgradeSubscription(UUID organizationId, UpgradeSubscriptionRequest request) {
        SubscriptionPlan targetPlan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new NotFoundException("PLAN_NO_ENCONTRADO", "No se encontró el plan de suscripción: " + request.getPlanId()));

        OrganizationSubscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> createDefaultSubscription(organizationId));

        Instant now = Instant.now();
        Instant periodEnd = now.plus(30, ChronoUnit.DAYS);

        sub.setPlanId(targetPlan.getId());
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setCurrentPeriodStart(now);
        sub.setCurrentPeriodEnd(periodEnd);
        sub.setAiCreditsTotal(targetPlan.getAiCreditsMonthly());
        sub.setAiCreditsUsed(0); // Reset usage upon new cycle / upgrade
        sub.setCancelAtPeriodEnd(false);
        if (request.getPaymentGateway() != null) {
            sub.setPaymentGateway(request.getPaymentGateway());
        }

        OrganizationSubscription savedSub = subscriptionRepository.save(sub);

        // Generate paid invoice record
        String invoiceNum = "INV-" + (now.toEpochMilli() % 1000000);
        BillingInvoice invoice = BillingInvoice.builder()
                .invoiceNumber(invoiceNum)
                .amountUsd(targetPlan.getPriceUsdMonthly())
                .status(InvoiceStatus.PAID)
                .planName(targetPlan.getName())
                .periodStart(now)
                .periodEnd(periodEnd)
                .pdfUrl("https://billing.bowol.io/invoices/" + invoiceNum + ".pdf")
                .build();
        invoice.setOrganizationId(organizationId);
        invoiceRepository.save(invoice);

        log.info("Suscripción de la organización {} actualizada al plan {}", organizationId, targetPlan.getId());
        return OrganizationSubscriptionResponse.fromEntity(savedSub, targetPlan);
    }

    @Transactional
    public OrganizationSubscriptionResponse cancelSubscription(UUID organizationId) {
        OrganizationSubscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> createDefaultSubscription(organizationId));

        sub.setCancelAtPeriodEnd(true);
        OrganizationSubscription saved = subscriptionRepository.save(sub);

        SubscriptionPlan plan = planRepository.findById(saved.getPlanId())
                .orElseGet(this::getFallbackPlan);

        log.info("Suscripción de la organización {} programada para cancelación al fin del periodo", organizationId);
        return OrganizationSubscriptionResponse.fromEntity(saved, plan);
    }

    @Transactional(readOnly = true)
    public List<BillingInvoiceResponse> listInvoices(UUID organizationId) {
        return invoiceRepository.findAllByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(organizationId).stream()
                .map(BillingInvoiceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean consumeCredits(UUID organizationId, int creditsToConsume, String reason) {
        if (organizationId == null || creditsToConsume <= 0) return true;

        OrganizationSubscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> createDefaultSubscription(organizationId));

        int newUsed = sub.getAiCreditsUsed() + creditsToConsume;
        if (newUsed > sub.getAiCreditsTotal()) {
            log.warn("Límite de créditos alcanzado para org {}: total={}, usado={}, solicitado={}",
                    organizationId, sub.getAiCreditsTotal(), sub.getAiCreditsUsed(), creditsToConsume);
            throw new BadRequestException("CREDITOS_INSUFICIENTES",
                    "Has alcanzado el límite mensual de AI Credits para tu plan actual ("
                            + sub.getAiCreditsUsed() + "/" + sub.getAiCreditsTotal()
                            + "). Actualiza a Pro o Business para continuar utilizando las funciones de IA.");
        }

        sub.setAiCreditsUsed(newUsed);
        subscriptionRepository.save(sub);

        double usageRatio = (double) newUsed / (double) sub.getAiCreditsTotal();
        if (usageRatio >= 0.8) {
            try {
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("organization_id", organizationId.toString());
                data.put("plan_id", sub.getPlanId());
                data.put("credits_total", sub.getAiCreditsTotal());
                data.put("credits_used", newUsed);
                data.put("credits_remaining", Math.max(0, sub.getAiCreditsTotal() - newUsed));
                data.put("percentage", Math.min(100, Math.round(usageRatio * 100)));
                data.put("trigger_reason", reason);
                webhookService.dispatchEventAsync(organizationId, "subscription.credit_threshold_reached", data);
            } catch (Exception e) {
                log.warn("No se pudo disparar webhook subscription.credit_threshold_reached: {}", e.getMessage());
            }
        }

        log.info("Consumidos {} créditos IA para la org {} por '{}'. Total consumido: {}/{}",
                creditsToConsume, organizationId, reason, newUsed, sub.getAiCreditsTotal());
        return true;
    }

    @Transactional
    public OrganizationSubscriptionResponse buyCredits(UUID organizationId, int additionalCredits) {
        if (additionalCredits < 500) {
            throw new BadRequestException("PAQUETE_MINIMO", "El paquete mínimo de créditos adicionales es 500");
        }

        OrganizationSubscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> createDefaultSubscription(organizationId));

        sub.setAiCreditsTotal(sub.getAiCreditsTotal() + additionalCredits);
        OrganizationSubscription saved = subscriptionRepository.save(sub);

        // Price: $10 per 1000 credits
        BigDecimal cost = BigDecimal.valueOf(additionalCredits).multiply(BigDecimal.valueOf(0.01));
        String invoiceNum = "CRD-" + (Instant.now().toEpochMilli() % 1000000);
        BillingInvoice invoice = BillingInvoice.builder()
                .invoiceNumber(invoiceNum)
                .amountUsd(cost)
                .status(InvoiceStatus.PAID)
                .planName("Paquete " + additionalCredits + " AI Credits")
                .periodStart(sub.getCurrentPeriodStart())
                .periodEnd(sub.getCurrentPeriodEnd())
                .pdfUrl("https://billing.bowol.io/invoices/" + invoiceNum + ".pdf")
                .build();
        invoice.setOrganizationId(organizationId);
        invoiceRepository.save(invoice);

        SubscriptionPlan plan = planRepository.findById(saved.getPlanId())
                .orElseGet(this::getFallbackPlan);

        log.info("Añadidos {} créditos IA a la org {}. Nuevo total: {}", additionalCredits, organizationId, saved.getAiCreditsTotal());
        return OrganizationSubscriptionResponse.fromEntity(saved, plan);
    }

    @Transactional
    public boolean processPaymentWebhook(PaymentWebhookEvent event, String signatureHeader) {
        if (event == null || event.getEventType() == null) {
            log.warn("Evento de webhook de pagos inválido o nulo");
            return false;
        }

        UUID orgId = event.getOrganizationId();
        if (orgId == null) {
            log.warn("Evento de webhook sin organizationId: {}", event);
            return false;
        }

        String eventType = event.getEventType();
        String invoiceNum = event.getInvoiceNumber() != null ? event.getInvoiceNumber() : ("WH-" + (Instant.now().toEpochMilli() % 1000000));

        // Idempotency: verify if this invoice has already been handled
        if (invoiceRepository.existsByInvoiceNumber(invoiceNum)) {
            log.info("Factura {} ya procesada anteriormente. Descartando webhook duplicado.", invoiceNum);
            return true;
        }

        OrganizationSubscription sub = subscriptionRepository.findByOrganizationId(orgId)
                .orElseGet(() -> createDefaultSubscription(orgId));

        Instant now = Instant.now();
        Instant periodEnd = now.plus(30, ChronoUnit.DAYS);

        if ("invoice.payment_succeeded".equalsIgnoreCase(eventType)) {
            if (event.getPlanId() != null) {
                SubscriptionPlan targetPlan = planRepository.findById(event.getPlanId())
                        .orElseGet(this::getFallbackPlan);
                sub.setPlanId(targetPlan.getId());
                sub.setAiCreditsTotal(targetPlan.getAiCreditsMonthly());
            }
            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setCurrentPeriodStart(now);
            sub.setCurrentPeriodEnd(periodEnd);
            sub.setCancelAtPeriodEnd(false);
            subscriptionRepository.save(sub);

            BigDecimal amount = event.getAmountUsd() != null ? event.getAmountUsd() : BigDecimal.ZERO;
            BillingInvoice invoice = BillingInvoice.builder()
                    .invoiceNumber(invoiceNum)
                    .amountUsd(amount)
                    .status(InvoiceStatus.PAID)
                    .planName(event.getPlanId() != null ? event.getPlanId() : sub.getPlanId())
                    .periodStart(now)
                    .periodEnd(periodEnd)
                    .pdfUrl("https://billing.bowol.io/invoices/" + invoiceNum + ".pdf")
                    .build();
            invoice.setOrganizationId(orgId);
            invoiceRepository.save(invoice);

            try {
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("organization_id", orgId.toString());
                data.put("invoice_number", invoiceNum);
                data.put("amount_usd", amount);
                data.put("status", "PAID");
                webhookService.dispatchEventAsync(orgId, "subscription.payment_succeeded", data);
            } catch (Exception e) {
                log.warn("No se pudo notificar evento subscription.payment_succeeded: {}", e.getMessage());
            }

            log.info("Webhook invoice.payment_succeeded procesado exitosamente para org {}", orgId);
            return true;

        } else if ("invoice.payment_failed".equalsIgnoreCase(eventType)) {
            sub.setStatus(SubscriptionStatus.PAST_DUE);
            subscriptionRepository.save(sub);

            try {
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("organization_id", orgId.toString());
                data.put("invoice_number", invoiceNum);
                data.put("status", "PAST_DUE");
                webhookService.dispatchEventAsync(orgId, "subscription.payment_failed", data);
            } catch (Exception e) {
                log.warn("No se pudo notificar evento subscription.payment_failed: {}", e.getMessage());
            }

            log.warn("Webhook invoice.payment_failed registrado para org {}", orgId);
            return true;

        } else if ("customer.subscription.deleted".equalsIgnoreCase(eventType)) {
            sub.setStatus(SubscriptionStatus.CANCELED);
            sub.setCancelAtPeriodEnd(true);
            subscriptionRepository.save(sub);
            log.info("Webhook customer.subscription.deleted procesado para org {}", orgId);
            return true;
        }

        log.info("Webhook de pago no procesado (tipo desconocido: {})", eventType);
        return false;
    }

    private OrganizationSubscription createDefaultSubscription(UUID organizationId) {
        Instant now = Instant.now();
        Instant periodEnd = now.plus(30, ChronoUnit.DAYS);

        SubscriptionPlan freePlan = planRepository.findById("FREE")
                .orElseGet(this::getFallbackPlan);

        OrganizationSubscription defaultSub = OrganizationSubscription.builder()
                .planId(freePlan.getId())
                .status(SubscriptionStatus.ACTIVE)
                .currentPeriodStart(now)
                .currentPeriodEnd(periodEnd)
                .aiCreditsTotal(freePlan.getAiCreditsMonthly())
                .aiCreditsUsed(0)
                .paymentGateway(PaymentGateway.MOCK_STRIPE)
                .cancelAtPeriodEnd(false)
                .build();
        defaultSub.setOrganizationId(organizationId);

        OrganizationSubscription saved = subscriptionRepository.save(defaultSub);
        log.info("Suscripción FREE inicializada para la organización {}", organizationId);
        return saved;
    }

    private SubscriptionPlan getFallbackPlan() {
        return SubscriptionPlan.builder()
                .id("FREE")
                .name("Free Explorer")
                .description("Plan gratuito por defecto")
                .priceUsdMonthly(BigDecimal.ZERO)
                .aiCreditsMonthly(500)
                .maxProjects(3)
                .maxMembers(5)
                .features(List.of("500 AI Credits mensuales", "3 proyectos activos"))
                .isActive(true)
                .build();
    }
}
