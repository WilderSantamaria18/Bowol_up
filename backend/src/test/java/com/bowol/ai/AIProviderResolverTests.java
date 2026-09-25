package com.bowol.ai;

import com.bowol.ai.config.AIProperties;
import com.bowol.ai.model.AIModel;
import com.bowol.ai.provider.AIProvider;
import com.bowol.ai.provider.AIProviderResolver;
import com.bowol.ai.provider.MockAIProvider;
import com.bowol.ai.provider.OpenAIProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AIProviderResolverTests {

    private AIProviderResolver resolver;
    private MockAIProvider mockProvider;
    private OpenAIProvider openAIProvider;
    private AIProperties properties;

    @BeforeEach
    void setUp() {
        properties = new AIProperties();
        properties.setDefaultProvider("mock");

        mockProvider = new MockAIProvider();
        openAIProvider = new OpenAIProvider(properties, new ObjectMapper());

        resolver = new AIProviderResolver(List.of(mockProvider, openAIProvider), properties);
    }

    @Test
    @DisplayName("Resolves MockProvider when defaultProvider is set to mock")
    void testResolveMockDefault() {
        AIProvider resolved = resolver.resolve(AIModel.GPT_4O_MINI);
        assertThat(resolved.name()).isEqualTo("mock");
    }

    @Test
    @DisplayName("Falls back to MockProvider when native provider API key is not configured")
    void testFallbackWhenApiKeyMissing() {
        // OpenAI apiKey is empty in properties, so isAvailable() is false
        assertThat(openAIProvider.isAvailable()).isFalse();

        properties.setDefaultProvider("openai");
        AIProvider resolved = resolver.resolve(AIModel.GPT_4O);

        // Must safely fallback to mock
        assertThat(resolved.name()).isEqualTo("mock");
    }

    @Test
    @DisplayName("Resolves OpenAIProvider when apiKey is configured and model is GPT_4O")
    void testResolveOpenAIWhenAvailable() {
        properties.getOpenai().setApiKey("sk-test-fake-key-12345");
        assertThat(openAIProvider.isAvailable()).isTrue();

        AIProvider resolved = resolver.resolve(AIModel.GPT_4O);
        assertThat(resolved.name()).isEqualTo("openai");
    }
}
