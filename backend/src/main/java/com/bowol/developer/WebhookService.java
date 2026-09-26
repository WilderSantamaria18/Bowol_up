package com.bowol.developer;

import com.bowol.developer.dto.CreateWebhookRequest;
import com.bowol.developer.dto.UpdateWebhookRequest;
import com.bowol.developer.dto.WebhookDeliveryResponse;
import com.bowol.developer.dto.WebhookEndpointResponse;
import com.bowol.shared.exception.NotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookService {

    private final WebhookEndpointRepository endpointRepository;
    private final WebhookDeliveryRepository deliveryRepository;
    private final ObjectMapper objectMapper;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Transactional
    public WebhookEndpointResponse createEndpoint(UUID organizationId, UUID userId, CreateWebhookRequest request) {
        String secret = request.getSecret();
        if (secret == null || secret.isBlank()) {
            byte[] secretBytes = new byte[24];
            SECURE_RANDOM.nextBytes(secretBytes);
            secret = "whsec_" + HexFormat.of().formatHex(secretBytes);
        }

        WebhookEndpoint endpoint = WebhookEndpoint.builder()
                .url(request.getUrl().trim())
                .description(request.getDescription())
                .secret(secret)
                .events(request.getEvents() != null ? request.getEvents() : List.of("*"))
                .isActive(true)
                .createdBy(userId)
                .build();
        endpoint.setOrganizationId(organizationId);

        WebhookEndpoint saved = endpointRepository.save(endpoint);
        log.info("Webhook endpoint creado: {} para org {}", saved.getId(), organizationId);
        return WebhookEndpointResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<WebhookEndpointResponse> listEndpoints(UUID organizationId) {
        return endpointRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(organizationId)
                .stream()
                .map(WebhookEndpointResponse::from)
                .toList();
    }

    @Transactional
    public WebhookEndpointResponse updateEndpoint(UUID organizationId, UUID endpointId, UpdateWebhookRequest request) {
        WebhookEndpoint endpoint = endpointRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(endpointId, organizationId)
                .orElseThrow(() -> new NotFoundException("Webhook endpoint no encontrado"));

        if (request.getUrl() != null && !request.getUrl().isBlank()) {
            endpoint.setUrl(request.getUrl().trim());
        }
        if (request.getDescription() != null) {
            endpoint.setDescription(request.getDescription());
        }
        if (request.getEvents() != null && !request.getEvents().isEmpty()) {
            endpoint.setEvents(request.getEvents());
        }
        if (request.getIsActive() != null) {
            endpoint.setIsActive(request.getIsActive());
        }

        WebhookEndpoint updated = endpointRepository.save(endpoint);
        return WebhookEndpointResponse.from(updated);
    }

    @Transactional
    public void deleteEndpoint(UUID organizationId, UUID endpointId) {
        WebhookEndpoint endpoint = endpointRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(endpointId, organizationId)
                .orElseThrow(() -> new NotFoundException("Webhook endpoint no encontrado"));

        endpoint.markDeleted();
        endpointRepository.save(endpoint);
        log.info("Webhook endpoint {} eliminado de org {}", endpointId, organizationId);
    }

    @Transactional(readOnly = true)
    public Page<WebhookDeliveryResponse> getDeliveries(UUID organizationId, UUID endpointId, Pageable pageable) {
        return deliveryRepository.findByWebhookEndpointIdOrderByCreatedAtDesc(endpointId, pageable)
                .map(WebhookDeliveryResponse::from);
    }

    /**
     * Dispara un evento asíncrono a todos los endpoints suscritos de la organización.
     */
    @Async
    public CompletableFuture<Void> dispatchEventAsync(UUID organizationId, String eventType, Object eventData) {
        List<WebhookEndpoint> endpoints = endpointRepository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(organizationId);

        List<WebhookEndpoint> subscribed = endpoints.stream()
                .filter(e -> e.isSubscribedTo(eventType))
                .toList();

        if (subscribed.isEmpty()) {
            log.debug("No hay endpoints suscritos al evento {} en org {}", eventType, organizationId);
            return CompletableFuture.completedFuture(null);
        }

        Map<String, Object> envelope = new LinkedHashMap<>();
        UUID deliveryEventId = UUID.randomUUID();
        envelope.put("id", deliveryEventId.toString());
        envelope.put("event", eventType);
        envelope.put("timestamp", Instant.now().toString());
        envelope.put("organization_id", organizationId.toString());
        envelope.put("data", eventData);

        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(envelope);
        } catch (Exception e) {
            log.error("Error serializando payload para webhook {}: {}", eventType, e.getMessage());
            return CompletableFuture.completedFuture(null);
        }

        for (WebhookEndpoint endpoint : subscribed) {
            sendPayloadWithRetries(endpoint, eventType, deliveryEventId.toString(), payloadJson);
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Prueba de entrega en vivo (Ping test)
     */
    @Transactional
    public WebhookDeliveryResponse triggerTestPing(UUID organizationId, UUID endpointId) {
        WebhookEndpoint endpoint = endpointRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(endpointId, organizationId)
                .orElseThrow(() -> new NotFoundException("Webhook endpoint no encontrado"));

        Map<String, Object> testData = new LinkedHashMap<>();
        testData.put("message", "Prueba de conectividad de Webhook BOWOL");
        testData.put("endpoint_id", endpoint.getId().toString());
        testData.put("timestamp", Instant.now().toString());
        testData.put("ping", "pong");

        Map<String, Object> envelope = new LinkedHashMap<>();
        String deliveryId = UUID.randomUUID().toString();
        envelope.put("id", deliveryId);
        envelope.put("event", "ping.test");
        envelope.put("timestamp", Instant.now().toString());
        envelope.put("organization_id", organizationId.toString());
        envelope.put("data", testData);

        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(envelope);
        } catch (Exception e) {
            payloadJson = "{\"event\":\"ping.test\"}";
        }

        WebhookDelivery delivery = sendPayloadWithRetries(endpoint, "ping.test", deliveryId, payloadJson);
        return WebhookDeliveryResponse.from(delivery);
    }

    private WebhookDelivery sendPayloadWithRetries(
            WebhookEndpoint endpoint,
            String eventType,
            String deliveryId,
            String payloadJson
    ) {
        String signature = computeHmacSha256(payloadJson, endpoint.getSecret());
        int maxAttempts = 3;
        int currentAttempt = 0;
        int statusCode = 0;
        String responseBody = "";
        String errorMessage = null;
        boolean success = false;

        while (currentAttempt < maxAttempts && !success) {
            currentAttempt++;
            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint.getUrl()))
                        .timeout(Duration.ofSeconds(6))
                        .header("Content-Type", "application/json; charset=UTF-8")
                        .header("User-Agent", "Bowol-Webhook-Dispatcher/1.0")
                        .header("X-Bowol-Event", eventType)
                        .header("X-Bowol-Delivery-Id", deliveryId)
                        .header("X-Bowol-Signature", "sha256=" + signature)
                        .POST(HttpRequest.BodyPublishers.ofString(payloadJson, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
                statusCode = response.statusCode();
                responseBody = response.body();

                if (statusCode >= 200 && statusCode < 300) {
                    success = true;
                    errorMessage = null;
                } else {
                    errorMessage = "HTTP error " + statusCode;
                    if (currentAttempt < maxAttempts) {
                        Thread.sleep(100L * currentAttempt); // Backoff ligero
                    }
                }
            } catch (Exception e) {
                errorMessage = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
                log.warn("Fallo intento {} en webhook {} a {}: {}", currentAttempt, endpoint.getId(), endpoint.getUrl(), errorMessage);
                if (currentAttempt < maxAttempts) {
                    try {
                        Thread.sleep(100L * currentAttempt);
                    } catch (InterruptedException ignored) {}
                }
            }
        }

        // Truncar responseBody si es muy extenso
        if (responseBody != null && responseBody.length() > 2000) {
            responseBody = responseBody.substring(0, 2000) + "... [truncado]";
        }

        WebhookDelivery delivery = WebhookDelivery.builder()
                .organizationId(endpoint.getOrganizationId())
                .webhookEndpointId(endpoint.getId())
                .eventType(eventType)
                .payload(payloadJson)
                .statusCode(statusCode > 0 ? statusCode : null)
                .responseBody(responseBody)
                .success(success)
                .attempts(currentAttempt)
                .errorMessage(errorMessage)
                .createdAt(Instant.now())
                .build();

        return deliveryRepository.save(delivery);
    }

    public static String computeHmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error calculando firma HMAC-SHA256", e);
        }
    }
}
