package com.bowol.ai.audit;

import com.bowol.ai.model.AIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIAuditService {

    private final AIUsageLogRepository usageLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AIUsageLog logUsage(
            UUID organizationId,
            UUID userId,
            String operation,
            AIResponse response,
            Map<String, Object> customMetadata) {

        if (organizationId == null) {
            log.warn("Intento de registrar auditoría de IA sin organizationId para operación '{}'", operation);
            return null;
        }

        Map<String, Object> meta = new HashMap<>();
        if (customMetadata != null) {
            meta.putAll(customMetadata);
        }
        if (response != null && response.getLatency() != null) {
            meta.put("latency_ms", response.getLatency().toMillis());
        }

        AIUsageLog logEntry = AIUsageLog.builder()
                .organizationId(organizationId)
                .userId(userId)
                .operation(operation != null ? operation : "GENERAL_INFERENCE")
                .provider(response != null && response.getProvider() != null ? response.getProvider() : "unknown")
                .model(response != null && response.getModel() != null ? response.getModel() : "unknown")
                .tokensInput(response != null && response.getPromptTokens() != null ? response.getPromptTokens() : 0)
                .tokensOutput(response != null && response.getCompletionTokens() != null ? response.getCompletionTokens() : 0)
                .costUsd(response != null && response.getCostUsd() != null ? response.getCostUsd() : BigDecimal.ZERO)
                .metadata(meta)
                .build();

        AIUsageLog saved = usageLogRepository.save(logEntry);
        log.info("Auditoría IA registrada: org={}, op={}, provider={}, tokensIn={}, tokensOut={}, cost=${}",
                organizationId, operation, saved.getProvider(), saved.getTokensInput(), saved.getTokensOutput(), saved.getCostUsd());
        return saved;
    }
}
