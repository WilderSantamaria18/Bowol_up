package com.bowol.ai.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AIResponseValidator {

    private final ObjectMapper objectMapper;

    public JsonNode validateTrendRelevance(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            throw new IllegalArgumentException("Respuesta de IA vacía o nula");
        }

        try {
            // Remove markdown code block fences if LLM wrapped it in ```json ... ```
            String cleanJson = stripMarkdownFences(rawJson);
            JsonNode root = objectMapper.readTree(cleanJson);

            if (!root.isObject()) {
                throw new IllegalArgumentException("El formato de respuesta debe ser un objeto JSON");
            }

            if (!root.has("score") || !root.get("score").isInt()) {
                throw new IllegalArgumentException("El campo 'score' es obligatorio y debe ser un número entero");
            }

            int score = root.get("score").asInt();
            if (score < 0 || score > 100) {
                throw new IllegalArgumentException("El campo 'score' debe estar comprendido entre 0 y 100");
            }

            if (!root.has("aiSummary") || !root.get("aiSummary").isTextual()) {
                throw new IllegalArgumentException("El campo 'aiSummary' es obligatorio y debe ser una cadena de texto");
            }

            String summary = root.get("aiSummary").asText().trim();
            if (summary.length() < 5) {
                throw new IllegalArgumentException("El campo 'aiSummary' debe contener al menos 5 caracteres");
            }

            if (root.has("tags") && !root.get("tags").isArray()) {
                throw new IllegalArgumentException("El campo 'tags' debe ser un array de cadenas de texto");
            }

            return root;
        } catch (IllegalArgumentException iae) {
            log.error("Validación de schema JSON fallida: {}", iae.getMessage());
            throw iae;
        } catch (Exception e) {
            log.error("Error parseando JSON de respuesta de IA: {}", e.getMessage());
            throw new IllegalArgumentException("Error parseando respuesta JSON de IA: " + e.getMessage(), e);
        }
    }

    public JsonNode validateSwotAnalysis(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            throw new IllegalArgumentException("Respuesta de IA vacía o nula para análisis FODA");
        }

        try {
            String cleanJson = stripMarkdownFences(rawJson);
            JsonNode root = objectMapper.readTree(cleanJson);

            if (!root.isObject()) {
                throw new IllegalArgumentException("El formato de respuesta debe ser un objeto JSON");
            }

            if (!root.has("strengths") || !root.get("strengths").isArray()) {
                throw new IllegalArgumentException("El campo 'strengths' es obligatorio y debe ser un array");
            }
            if (!root.has("weaknesses") || !root.get("weaknesses").isArray()) {
                throw new IllegalArgumentException("El campo 'weaknesses' es obligatorio y debe ser un array");
            }
            if (!root.has("opportunities") || !root.get("opportunities").isArray()) {
                throw new IllegalArgumentException("El campo 'opportunities' es obligatorio y debe ser un array");
            }
            if (!root.has("threats") || !root.get("threats").isArray()) {
                throw new IllegalArgumentException("El campo 'threats' es obligatorio y debe ser un array");
            }

            return root;
        } catch (IllegalArgumentException iae) {
            log.error("Validación de schema JSON FODA fallida: {}", iae.getMessage());
            throw iae;
        } catch (Exception e) {
            log.error("Error parseando JSON de respuesta FODA: {}", e.getMessage());
            throw new IllegalArgumentException("Error parseando respuesta JSON FODA: " + e.getMessage(), e);
        }
    }

    public List<com.bowol.swot.dto.SwotItem> extractQuadrantItems(JsonNode root, String quadrantKey) {
        List<com.bowol.swot.dto.SwotItem> items = new ArrayList<>();
        if (root.has(quadrantKey) && root.get(quadrantKey).isArray()) {
            for (JsonNode itemNode : root.get(quadrantKey)) {
                if (itemNode.isTextual() && !itemNode.asText().isBlank()) {
                    items.add(com.bowol.swot.dto.SwotItem.of(itemNode.asText().trim()));
                } else if (itemNode.isObject()) {
                    String id = itemNode.has("id") && itemNode.get("id").isTextual()
                            ? itemNode.get("id").asText()
                            : java.util.UUID.randomUUID().toString();
                    String text = itemNode.has("text") && itemNode.get("text").isTextual()
                            ? itemNode.get("text").asText().trim()
                            : "";
                    List<String> evidenceIds = new ArrayList<>();
                    if (itemNode.has("evidenceIds") && itemNode.get("evidenceIds").isArray()) {
                        for (JsonNode ev : itemNode.get("evidenceIds")) {
                            if (ev.isTextual() && !ev.asText().isBlank()) {
                                evidenceIds.add(ev.asText().trim());
                            }
                        }
                    }
                    if (!text.isBlank()) {
                        items.add(com.bowol.swot.dto.SwotItem.builder().id(id).text(text).evidenceIds(evidenceIds).build());
                    }
                }
            }
        }
        return items;
    }

    public String extractSummary(JsonNode root) {
        if (!root.has("summary")) return null;
        JsonNode s = root.get("summary");
        if (s.isTextual()) {
            return s.asText().trim();
        } else if (s.isObject() && s.has("text") && s.get("text").isTextual()) {
            return s.get("text").asText().trim();
        }
        return s.asText();
    }

    public JsonNode validateOpportunityOutput(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            throw new IllegalArgumentException("Respuesta de IA vacía o nula para oportunidades");
        }

        try {
            String cleanJson = stripMarkdownFences(rawJson);
            JsonNode root = objectMapper.readTree(cleanJson);

            if (!root.isObject()) {
                throw new IllegalArgumentException("El formato de respuesta debe ser un objeto JSON");
            }

            if (!root.has("opportunities") || !root.get("opportunities").isArray()) {
                throw new IllegalArgumentException("El campo 'opportunities' es obligatorio y debe ser un array");
            }

            return root;
        } catch (IllegalArgumentException iae) {
            log.error("Validación de schema JSON de oportunidades fallida: {}", iae.getMessage());
            throw iae;
        } catch (Exception e) {
            log.error("Error parseando JSON de respuesta de oportunidades: {}", e.getMessage());
            throw new IllegalArgumentException("Error parseando respuesta JSON de oportunidades: " + e.getMessage(), e);
        }
    }

    public JsonNode validateTaskBacklog(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            throw new IllegalArgumentException("Respuesta de IA vacía o nula");
        }

        try {
            String cleanJson = stripMarkdownFences(rawJson);
            JsonNode root = objectMapper.readTree(cleanJson);

            if (!root.isObject()) {
                throw new IllegalArgumentException("El formato de respuesta debe ser un objeto JSON");
            }

            if (!root.has("tasks") || !root.get("tasks").isArray()) {
                throw new IllegalArgumentException("El campo 'tasks' es obligatorio y debe ser un array");
            }

            return root;
        } catch (IllegalArgumentException iae) {
            log.error("Validación de schema JSON de backlog de tareas fallida: {}", iae.getMessage());
            throw iae;
        } catch (Exception e) {
            log.error("Error parseando JSON de respuesta de backlog: {}", e.getMessage());
            throw new IllegalArgumentException("Error parseando respuesta JSON de backlog: " + e.getMessage(), e);
        }
    }

    public JsonNode validateHypothesisOutput(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            throw new IllegalArgumentException("Respuesta de IA vacía o nula para formulación de hipótesis");
        }

        try {
            String cleanJson = stripMarkdownFences(rawJson);
            JsonNode root = objectMapper.readTree(cleanJson);

            if (!root.isObject()) {
                throw new IllegalArgumentException("El formato de respuesta debe ser un objeto JSON");
            }

            if (!root.has("statement") || root.get("statement").asText().isBlank()) {
                throw new IllegalArgumentException("El campo 'statement' es obligatorio");
            }
            if (!root.has("validationMethod") || root.get("validationMethod").asText().isBlank()) {
                throw new IllegalArgumentException("El campo 'validationMethod' es obligatorio");
            }
            if (!root.has("successMetric") || root.get("successMetric").asText().isBlank()) {
                throw new IllegalArgumentException("El campo 'successMetric' es obligatorio");
            }
            if (!root.has("targetValue") || root.get("targetValue").asText().isBlank()) {
                throw new IllegalArgumentException("El campo 'targetValue' es obligatorio");
            }

            return root;
        } catch (IllegalArgumentException iae) {
            log.error("Validación de schema JSON de hipótesis fallida: {}", iae.getMessage());
            throw iae;
        } catch (Exception e) {
            log.error("Error parseando JSON de respuesta de hipótesis: {}", e.getMessage());
            throw new IllegalArgumentException("Error parseando respuesta JSON de hipótesis: " + e.getMessage(), e);
        }
    }

    public List<String> extractTags(JsonNode node) {
        List<String> tags = new ArrayList<>();
        if (node.has("tags") && node.get("tags").isArray()) {
            for (JsonNode t : node.get("tags")) {
                if (t.isTextual() && !t.asText().isBlank()) {
                    tags.add(t.asText().trim().toLowerCase());
                }
            }
        }
        return tags;
    }

    public List<String> extractRecommendedActions(JsonNode node) {
        List<String> actions = new ArrayList<>();
        if (node.has("recommendedActions") && node.get("recommendedActions").isArray()) {
            for (JsonNode a : node.get("recommendedActions")) {
                if (a.isTextual() && !a.asText().isBlank()) {
                    actions.add(a.asText().trim());
                }
            }
        }
        return actions;
    }

    private String stripMarkdownFences(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
