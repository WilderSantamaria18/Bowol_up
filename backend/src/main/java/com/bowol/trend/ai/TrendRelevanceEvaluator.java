package com.bowol.trend.ai;

import com.bowol.ai.audit.AIAuditService;
import com.bowol.ai.context.StrategicContextService;
import com.bowol.ai.model.*;
import com.bowol.ai.prompt.PromptTemplate;
import com.bowol.ai.prompt.PromptTemplateEngine;
import com.bowol.ai.provider.AIProvider;
import com.bowol.ai.provider.AIProviderResolver;
import com.bowol.ai.validation.AIResponseValidator;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.trend.Trend;
import com.bowol.trend.TrendRelevance;
import com.bowol.trend.TrendRelevanceRepository;
import com.bowol.trend.TrendRepository;
import com.bowol.trend.dto.TrendRelevanceResponse;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrendRelevanceEvaluator {

    private final TrendRepository trendRepository;
    private final TrendRelevanceRepository trendRelevanceRepository;
    private final StrategicContextService strategicContextService;
    private final PromptTemplateEngine promptTemplateEngine;
    private final AIProviderResolver aiProviderResolver;
    private final AIResponseValidator aiResponseValidator;
    private final AIAuditService aiAuditService;
    private final com.bowol.developer.WebhookService webhookService;

    @Transactional
    public TrendRelevanceResponse evaluateRelevance(UUID organizationId, UUID userId, UUID trendId) {
        log.info("Iniciando evaluación estratégica con IA de la tendencia {} para la organización {}", trendId, organizationId);

        Trend trend = trendRepository.findById(trendId)
                .orElseThrow(() -> new NotFoundException("TENDENCIA_NO_ENCONTRADA", "No se encontró la tendencia con id: " + trendId));

        // 1. Build Grounded Context
        Map<String, Object> context = strategicContextService.buildTrendRelevanceContext(organizationId, trend);

        // 2. Fetch Prompt Template
        PromptTemplate template = promptTemplateEngine.getTemplate("trend-evaluate-relevance-v1");
        String userPrompt = promptTemplateEngine.render("trend-evaluate-relevance-v1", context);

        // 3. Prepare AI Request
        AIModel model = template.getModel() != null ? template.getModel() : AIModel.GPT_4O_MINI;
        AIRequest request = AIRequest.builder()
                .model(model)
                .systemPrompt("Eres el motor analítico de relevancia de BOWOL. Evalúa la tendencia con el perfil empresarial y devuelve un JSON válido.")
                .messages(List.of(AIMessage.user(userPrompt)))
                .temperature(template.getTemperature())
                .format(ResponseFormat.JSON_OBJECT)
                .build();

        // 4. Resolve Provider and Complete
        AIProvider provider = aiProviderResolver.resolve(model);
        AIResponse response = provider.complete(request);

        // 5. Validate Output JSON Schema
        JsonNode validatedJson = aiResponseValidator.validateTrendRelevance(response.getContent());

        int score = validatedJson.path("score").asInt(trend.getScore());
        String aiSummary = validatedJson.path("aiSummary").asText();
        List<String> tags = aiResponseValidator.extractTags(validatedJson);
        if (tags.isEmpty() && trend.getTags() != null) {
            tags = trend.getTags();
        }

        // 6. Record Token and Cost Audit Log
        Map<String, Object> auditMetadata = Map.of(
                "trend_id", trendId.toString(),
                "prompt_template", template.getKey(),
                "ai_score", score
        );
        aiAuditService.logUsage(organizationId, userId, "TREND_RELEVANCE_EVALUATION", response, auditMetadata);

        // 7. Persist or Update TrendRelevance
        TrendRelevance relevance = trendRelevanceRepository.findByOrganizationIdAndTrendId(organizationId, trendId)
                .orElseGet(() -> TrendRelevance.builder()
                        .organizationId(organizationId)
                        .trend(trend)
                        .build());

        relevance.setScore(score);
        relevance.setAiSummary(aiSummary);
        relevance.setTags(tags);
        relevance.setEvaluatedAt(Instant.now());

        TrendRelevance saved = trendRelevanceRepository.save(relevance);
        log.info("Evaluación con IA completada exitosamente para tendencia {}: score={}, tags={}", trendId, score, tags);

        if (score >= 70) {
            try {
                Map<String, Object> eventData = new LinkedHashMap<>();
                eventData.put("trend_id", trendId.toString());
                eventData.put("title", trend.getTitle());
                eventData.put("source", trend.getSource() != null ? trend.getSource().name() : "MARKET");
                eventData.put("score", score);
                eventData.put("ai_summary", aiSummary);
                eventData.put("tags", tags);
                webhookService.dispatchEventAsync(organizationId, "trend.high_relevance_detected", eventData);
            } catch (Exception e) {
                log.warn("No se pudo disparar webhook trend.high_relevance_detected: {}", e.getMessage());
            }
        }

        TrendRelevanceResponse resp = TrendRelevanceResponse.from(saved);
        if (validatedJson.has("strategicAlignment") && validatedJson.get("strategicAlignment").isTextual()) {
            resp.setStrategicAlignment(validatedJson.get("strategicAlignment").asText());
        }
        resp.setRecommendedActions(aiResponseValidator.extractRecommendedActions(validatedJson));
        int totalTokens = (response.getPromptTokens() != null ? response.getPromptTokens() : 0) +
                (response.getCompletionTokens() != null ? response.getCompletionTokens() : 0);
        if (totalTokens > 0) {
            resp.setTokensUsed(totalTokens);
        }

        return resp;
    }
}
