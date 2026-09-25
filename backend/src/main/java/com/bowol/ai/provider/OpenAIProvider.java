package com.bowol.ai.provider;

import com.bowol.ai.config.AIProperties;
import com.bowol.ai.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Stream;

@Slf4j
@Component
public class OpenAIProvider implements AIProvider {

    private final AIProperties aiProperties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public OpenAIProvider(AIProperties aiProperties, ObjectMapper objectMapper) {
        this.aiProperties = aiProperties;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        int timeout = aiProperties.getOpenai().getTimeoutSeconds();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(timeout > 0 ? timeout : 60));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl(aiProperties.getOpenai().getBaseUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public String name() {
        return "openai";
    }

    @Override
    public boolean supports(AIModel model) {
        if (model == null) return false;
        return "openai".equalsIgnoreCase(model.getProvider()) ||
                model == AIModel.GPT_4O ||
                model == AIModel.GPT_4O_MINI;
    }

    @Override
    public boolean isAvailable() {
        String key = aiProperties.getOpenai().getApiKey();
        return key != null && !key.isBlank() && !key.startsWith("${");
    }

    @Override
    public AIResponse complete(AIRequest request) {
        if (!isAvailable()) {
            throw new IllegalStateException("OpenAIProvider no está disponible: OPENAI_API_KEY no configurada");
        }

        Instant start = Instant.now();
        AIModel model = request.getModel() != null ? request.getModel() : AIModel.GPT_4O_MINI;

        try {
            Map<String, Object> body = buildRequestBody(request, model);

            String responseJson = restClient.post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + aiProperties.getOpenai().getApiKey())
                    .body(body)
                    .retrieve()
                    .body(String.class);

            Duration latency = Duration.between(start, Instant.now());
            return parseOpenAIResponse(responseJson, model, latency);
        } catch (Exception e) {
            log.error("Fallo al invocar OpenAI API: {}", e.getMessage());
            throw new RuntimeException("Error en llamada a OpenAI: " + e.getMessage(), e);
        }
    }

    @Override
    public Stream<AIChunk> stream(AIRequest request) {
        AIResponse response = complete(request);
        return Stream.of(new AIChunk(response.getContent(), true, response.getCompletionTokens()));
    }

    @Override
    public List<Float> embed(String text) {
        throw new UnsupportedOperationException("Embeddings vectoriales de OpenAI planificados para Fase 6");
    }

    private Map<String, Object> buildRequestBody(AIRequest request, AIModel model) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model.getCode());
        body.put("temperature", request.getTemperature());
        body.put("max_tokens", request.getMaxTokens());

        List<Map<String, String>> messagesList = new ArrayList<>();
        if (request.getSystemPrompt() != null && !request.getSystemPrompt().isBlank()) {
            messagesList.add(Map.of("role", "system", "content", request.getSystemPrompt()));
        }

        for (AIMessage msg : request.getMessages()) {
            messagesList.add(Map.of("role", msg.getRole().name().toLowerCase(), "content", msg.getContent()));
        }
        body.put("messages", messagesList);

        if (request.getFormat() == ResponseFormat.JSON_OBJECT) {
            body.put("response_format", Map.of("type", "json_object"));
        }

        if (request.getStopSequences() != null && !request.getStopSequences().isEmpty()) {
            body.put("stop", request.getStopSequences());
        }

        return body;
    }

    private AIResponse parseOpenAIResponse(String json, AIModel model, Duration latency) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode choice = root.path("choices").path(0);
            String content = choice.path("message").path("content").asText("");
            String finishReason = choice.path("finish_reason").asText("stop");

            JsonNode usage = root.path("usage");
            int promptTokens = usage.path("prompt_tokens").asInt(0);
            int completionTokens = usage.path("completion_tokens").asInt(0);

            BigDecimal cost = model.calculateCost(promptTokens, completionTokens);

            return AIResponse.builder()
                    .content(content)
                    .provider(name())
                    .model(model.getCode())
                    .promptTokens(promptTokens)
                    .completionTokens(completionTokens)
                    .costUsd(cost)
                    .finishReason(finishReason)
                    .latency(latency)
                    .build();
        } catch (Exception e) {
            log.error("Error parseando respuesta de OpenAI: {}", e.getMessage());
            throw new RuntimeException("Error parseando respuesta de OpenAI", e);
        }
    }
}
