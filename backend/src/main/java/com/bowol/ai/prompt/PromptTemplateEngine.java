package com.bowol.ai.prompt;

import com.bowol.ai.model.AIModel;
import com.bowol.ai.model.ResponseFormat;
import com.samskivert.mustache.Mustache;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class PromptTemplateEngine {

    private final Map<String, PromptTemplate> templates = new HashMap<>();
    private static final Pattern FRONTMATTER_PATTERN = Pattern.compile("^---\\s*\\n(.*?)\\n---\\s*\\n(.*)$", Pattern.DOTALL);

    @PostConstruct
    public void init() {
        loadTemplates();
    }

    public void loadTemplates() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath*:prompts/**/*.md");
            for (Resource resource : resources) {
                try (InputStream is = resource.getInputStream()) {
                    String raw = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                    PromptTemplate template = parseTemplate(raw, resource.getFilename());
                    if (template != null) {
                        templates.put(template.getKey(), template);
                        templates.put(template.getId(), template); // default alias to latest
                        log.debug("Prompt cargado: {} (id: {}, v{})", template.getKey(), template.getId(), template.getVersion());
                    }
                }
            }
            log.info("Total de plantillas de prompts cargadas: {}", templates.size());
        } catch (Exception e) {
            log.error("Error cargando plantillas de prompts desde classpath: {}", e.getMessage(), e);
        }
    }

    public PromptTemplate getTemplate(String templateId) {
        PromptTemplate t = templates.get(templateId);
        if (t == null) {
            throw new IllegalArgumentException("Plantilla de prompt no encontrada: " + templateId);
        }
        return t;
    }

    public boolean hasTemplate(String templateId) {
        return templates.containsKey(templateId);
    }

    public String render(String templateId, Map<String, Object> variables) {
        PromptTemplate template = getTemplate(templateId);
        Map<String, Object> safeVars = variables != null ? variables : Map.of();

        return Mustache.compiler()
                .defaultValue("")
                .nullValue("")
                .emptyStringIsFalse(true)
                .compile(template.getContent())
                .execute(safeVars);
    }

    public void registerTemplate(PromptTemplate template) {
        if (template != null) {
            templates.put(template.getKey(), template);
            templates.put(template.getId(), template);
        }
    }

    public PromptTemplate parseTemplate(String raw, String filename) {
        Matcher matcher = FRONTMATTER_PATTERN.matcher(raw);
        if (!matcher.find()) {
            return PromptTemplate.builder()
                    .id(filename != null ? filename.replace(".md", "") : "default")
                    .version(1)
                    .model(AIModel.GPT_4O_MINI)
                    .responseFormat(ResponseFormat.TEXT)
                    .temperature(0.7)
                    .content(raw.trim())
                    .build();
        }

        String frontmatter = matcher.group(1);
        String body = matcher.group(2).trim();

        Map<String, String> metadata = parseYamlLines(frontmatter);

        String id = metadata.getOrDefault("id", filename != null ? filename.replace(".md", "") : "template");
        int version = 1;
        try {
            version = Integer.parseInt(metadata.getOrDefault("version", "1").trim());
        } catch (NumberFormatException ignored) {}

        AIModel model = AIModel.fromCode(metadata.get("model"));

        ResponseFormat format = ResponseFormat.TEXT;
        String formatStr = metadata.get("response_format");
        if (formatStr != null) {
            try {
                format = ResponseFormat.valueOf(formatStr.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        double temperature = 0.7;
        try {
            if (metadata.containsKey("temperature")) {
                temperature = Double.parseDouble(metadata.get("temperature").trim());
            }
        } catch (NumberFormatException ignored) {}

        return PromptTemplate.builder()
                .id(id)
                .version(version)
                .model(model)
                .responseFormat(format)
                .temperature(temperature)
                .content(body)
                .build();
    }

    private Map<String, String> parseYamlLines(String yaml) {
        Map<String, String> map = new HashMap<>();
        String[] lines = yaml.split("\\r?\\n");
        for (String line : lines) {
            int colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
                String key = line.substring(0, colonIdx).trim();
                String val = line.substring(colonIdx + 1).trim();
                map.put(key, val);
            }
        }
        return map;
    }
}
