package com.bowol.ai;

import com.bowol.ai.model.*;
import com.bowol.ai.provider.MockAIProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MockAIProviderTests {

    private MockAIProvider provider;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        provider = new MockAIProvider();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Complete with TEXT format generates 4-tier structured output")
    void testCompleteText() {
        AIRequest request = AIRequest.builder()
                .model(AIModel.GPT_4O_MINI)
                .messages(List.of(AIMessage.user("Analiza el impacto de los modelos pequeños")))
                .format(ResponseFormat.TEXT)
                .build();

        AIResponse response = provider.complete(request);

        assertThat(response.getContent()).contains("### DATO");
        assertThat(response.getContent()).contains("### ANÁLISIS");
        assertThat(response.getContent()).contains("### HIPÓTESIS");
        assertThat(response.getContent()).contains("### RECOMENDACIÓN");
        assertThat(response.getProvider()).isEqualTo("mock");
        assertThat(response.getPromptTokens()).isPositive();
        assertThat(response.getCompletionTokens()).isPositive();
    }

    @Test
    @DisplayName("Complete with JSON_OBJECT format generates valid parseable JSON for trend relevance")
    void testCompleteJson() throws Exception {
        AIRequest request = AIRequest.builder()
                .model(AIModel.GPT_4O_MINI)
                .systemPrompt("Evalúa la relevancia de la tendencia para la organización")
                .messages(List.of(AIMessage.user("Trend: Ollama local models")))
                .format(ResponseFormat.JSON_OBJECT)
                .build();

        AIResponse response = provider.complete(request);

        JsonNode json = objectMapper.readTree(response.getContent());
        assertThat(json.has("score")).isTrue();
        assertThat(json.path("score").asInt()).isBetween(0, 100);
        assertThat(json.has("aiSummary")).isTrue();
        assertThat(json.path("tags").isArray()).isTrue();
    }

    @Test
    @DisplayName("Stream returns sequential non-empty chunks with isLast true on final chunk")
    void testStream() {
        AIRequest request = AIRequest.builder()
                .messages(List.of(AIMessage.user("Hola")))
                .build();

        List<AIChunk> chunks = provider.stream(request).toList();
        assertThat(chunks).isNotEmpty();
        assertThat(chunks.get(chunks.size() - 1).isLast()).isTrue();
    }

    @Test
    @DisplayName("Embed returns 1536 float values")
    void testEmbed() {
        List<Float> vector = provider.embed("Texto para embeddings");
        assertThat(vector).hasSize(1536);
    }
}
