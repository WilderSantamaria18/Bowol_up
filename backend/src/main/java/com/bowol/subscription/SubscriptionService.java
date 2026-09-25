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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final OrganizationSubscriptionRepository subscriptionRepository;
    private final BillingInvoiceRepository invoiceRepository;

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
