package com.bowol.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "bowol.ai")
public class AIProperties {

    private String defaultProvider = "mock";

    private ProviderConfig openai = new ProviderConfig("https://api.openai.com/v1", "gpt-4o-mini");
    private ProviderConfig anthropic = new ProviderConfig("https://api.anthropic.com", "claude-3-5-sonnet");

    @Getter
    @Setter
    public static class ProviderConfig {
        private String apiKey = "";
        private String baseUrl;
        private String model;
        private int timeoutSeconds = 60;

        public ProviderConfig() {}

        public ProviderConfig(String baseUrl, String model) {
            this.baseUrl = baseUrl;
            this.model = model;
        }
    }
}
