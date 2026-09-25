package com.bowol.ai;

import com.bowol.ai.model.AIModel;
import com.bowol.ai.model.ResponseFormat;
import com.bowol.ai.prompt.PromptTemplate;
import com.bowol.ai.prompt.PromptTemplateEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PromptTemplateEngineTests {

    private PromptTemplateEngine engine;

    @BeforeEach
    void setUp() {
        engine = new PromptTemplateEngine();
        engine.init();
    }

    @Test
    @DisplayName("Loads prompt templates from classpath and parses frontmatter metadata correctly")
    void testClasspathTemplatesLoaded() {
        PromptTemplate advisor = engine.getTemplate("strategic-advisor-v1");
        assertThat(advisor).isNotNull();
        assertThat(advisor.getId()).isEqualTo("strategic-advisor");
        assertThat(advisor.getVersion()).isEqualTo(1);
        assertThat(advisor.getModel()).isEqualTo(AIModel.GPT_4O_MINI);
        assertThat(advisor.getResponseFormat()).isEqualTo(ResponseFormat.TEXT);
        assertThat(advisor.getContent()).contains("### DATO");

        PromptTemplate relevance = engine.getTemplate("trend-evaluate-relevance-v1");
        assertThat(relevance).isNotNull();
        assertThat(relevance.getResponseFormat()).isEqualTo(ResponseFormat.JSON_OBJECT);

        PromptTemplate swot = engine.getTemplate("swot-generate-v1");
        assertThat(swot).isNotNull();
        assertThat(swot.getModel()).isEqualTo(AIModel.GPT_4O);
    }

    @Test
    @DisplayName("Renders Mustache template with substituted context variables")
    void testRenderVariables() {
        Map<String, Object> vars = Map.ofEntries(
                Map.entry("industry", "Fintech / Neobanking"),
                Map.entry("size", "MEDIUM"),
                Map.entry("market", "Latam B2B"),
                Map.entry("goals", "Automatizar KYC y reducir fraude"),
                Map.entry("problems", "Altos costes de revisión manual"),
                Map.entry("tools", "Postgres, AWS"),
                Map.entry("digitalMaturity", 75),
                Map.entry("aiMaturity", 40),
                Map.entry("trendSource", "GitHub"),
                Map.entry("trendTitle", "DeepSeek-V3"),
                Map.entry("trendScore", 96),
                Map.entry("trendDescription", "State-of-the-art open reasoning model"),
                Map.entry("trendTags", "moe, llm")
        );

        String rendered = engine.render("trend-evaluate-relevance-v1", vars);

        assertThat(rendered).contains("Fintech / Neobanking");
        assertThat(rendered).contains("Latam B2B");
        assertThat(rendered).contains("DeepSeek-V3");
        assertThat(rendered).contains("96/100");
    }

    @Test
    @DisplayName("Renders list iterations in templates correctly")
    void testRenderLists() {
        Map<String, Object> vars = Map.of(
                "industry", "SaaS",
                "size", "SMALL",
                "market", "Global",
                "goals", "Escalar",
                "problems", "Churn",
                "tools", "Vite, React",
                "competitors", "Big Tech",
                "channels", "SEO",
                "trends", List.of(
                        Map.of("source", "GitHub", "title", "Ollama", "score", 95, "description", "Local LLM runner"),
                        Map.of("source", "YouTube", "title", "Agentic Workflows", "score", 88, "description", "Enterprise patterns")
                )
        );

        String rendered = engine.render("swot-generate-v1", vars);

        assertThat(rendered).contains("[GitHub] Ollama (Score: 95)");
        assertThat(rendered).contains("[YouTube] Agentic Workflows (Score: 88)");
    }

    @Test
    @DisplayName("Throws IllegalArgumentException when requested template does not exist")
    void testUnknownTemplateThrows() {
        assertThatThrownBy(() -> engine.render("non-existent-template", Map.of()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("non-existent-template");
    }
}
