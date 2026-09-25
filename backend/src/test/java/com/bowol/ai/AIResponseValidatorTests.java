package com.bowol.ai;

import com.bowol.ai.validation.AIResponseValidator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AIResponseValidatorTests {

    private AIResponseValidator validator;

    @BeforeEach
    void setUp() {
        validator = new AIResponseValidator(new ObjectMapper());
    }

    @Test
    @DisplayName("Valid JSON with score and aiSummary passes validation")
    void testValidJson() {
        String json = """
        {
          "score": 85,
          "aiSummary": "Alta aplicabilidad para reducir costes en un 30%",
          "strategicAlignment": "HIGH",
          "tags": ["ia", "optimizacion"]
        }
        """;

        JsonNode validated = validator.validateTrendRelevance(json);
        assertThat(validated.get("score").asInt()).isEqualTo(85);
        assertThat(validated.get("aiSummary").asText()).contains("Alta aplicabilidad");

        List<String> tags = validator.extractTags(validated);
        assertThat(tags).contains("ia", "optimizacion");
    }

    @Test
    @DisplayName("Strips markdown code block fences before validation")
    void testStripsMarkdownFences() {
        String fencedJson = """
        ```json
        {
          "score": 90,
          "aiSummary": "Excelente oportunidad para acelerar pipelines",
          "tags": ["pipeline"]
        }
        ```
        """;

        JsonNode validated = validator.validateTrendRelevance(fencedJson);
        assertThat(validated.get("score").asInt()).isEqualTo(90);
    }

    @Test
    @DisplayName("Fails validation when score is out of bounds or missing")
    void testInvalidScore() {
        String invalidScore = """
        {
          "score": 150,
          "aiSummary": "Resumen válido"
        }
        """;

        assertThatThrownBy(() -> validator.validateTrendRelevance(invalidScore))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("score");
    }

    @Test
    @DisplayName("Fails validation when aiSummary is too short or missing")
    void testInvalidSummary() {
        String missingSummary = """
        {
          "score": 75
        }
        """;

        assertThatThrownBy(() -> validator.validateTrendRelevance(missingSummary))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("aiSummary");
    }
}
