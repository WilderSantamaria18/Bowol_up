package com.bowol.ai.context;

import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.trend.Trend;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StrategicContextService {

    private final BusinessProfileRepository businessProfileRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> buildTrendRelevanceContext(UUID organizationId, Trend trend) {
        Map<String, Object> context = new HashMap<>();

        BusinessProfile profile = null;
        if (organizationId != null) {
            profile = businessProfileRepository.findByOrganizationId(organizationId).orElse(null);
        }

        context.putAll(extractBusinessProfileContext(profile));

        if (trend != null) {
            context.put("trendId", trend.getId() != null ? trend.getId().toString() : "");
            context.put("trendSource", trend.getSource() != null ? trend.getSource().getName() : "Desconocida");
            context.put("trendTitle", trend.getTitle());
            context.put("trendScore", trend.getScore());
            context.put("trendDescription", trend.getDescription() != null ? trend.getDescription() : "");
            context.put("trendUrl", trend.getUrl());
            context.put("trendTags", trend.getTags() != null ? String.join(", ", trend.getTags()) : "");
        }

        return context;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> buildSwotContext(UUID organizationId, List<Trend> relevantTrends) {
        Map<String, Object> context = new HashMap<>();

        BusinessProfile profile = null;
        if (organizationId != null) {
            profile = businessProfileRepository.findByOrganizationId(organizationId).orElse(null);
        }

        context.putAll(extractBusinessProfileContext(profile));

        List<Map<String, Object>> trendList = new ArrayList<>();
        if (relevantTrends != null) {
            for (Trend t : relevantTrends) {
                Map<String, Object> tMap = new HashMap<>();
                tMap.put("id", t.getId() != null ? t.getId().toString() : "");
                tMap.put("source", t.getSource() != null ? t.getSource().getName() : "Web");
                tMap.put("title", t.getTitle());
                tMap.put("score", t.getScore());
                tMap.put("description", t.getDescription() != null ? t.getDescription() : "");
                trendList.add(tMap);
            }
        }
        context.put("trends", trendList);

        return context;
    }

    public Map<String, Object> extractBusinessProfileContext(BusinessProfile profile) {
        Map<String, Object> map = new HashMap<>();

        if (profile == null) {
            map.put("industry", "Tecnología / Startups");
            map.put("size", "SMALL");
            map.put("market", "Global");
            map.put("goals", "Crecimiento, eficiencia operativa y validación de producto");
            map.put("problems", "Recursos limitados de ingeniería, alta competencia");
            map.put("tools", "Git, Docker, Cloud básico");
            map.put("competitors", "Competidores tradicionales y startups emergentes");
            map.put("channels", "Digital, Web, B2B");
            map.put("digitalMaturity", 50);
            map.put("aiMaturity", 30);
            return map;
        }

        map.put("industry", profile.getIndustry() != null ? profile.getIndustry() : "General");
        map.put("size", profile.getSize() != null ? profile.getSize().name() : "SMALL");
        map.put("market", profile.getMarket() != null ? profile.getMarket() : "Mercado objetivo general");

        if (profile.getGoals() != null && !profile.getGoals().isEmpty()) {
            String goalsFormatted = profile.getGoals().stream()
                    .map(g -> g.getText() + (g.getPriority() != null ? " (Prioridad " + g.getPriority() + ")" : ""))
                    .collect(Collectors.joining("; "));
            map.put("goals", goalsFormatted);
        } else {
            map.put("goals", "Innovación y automatización");
        }

        map.put("problems", formatList(profile.getProblems(), "Limitación de tiempo y presupuesto"));
        map.put("tools", formatList(profile.getTools(), "Herramientas estándar de productividad"));
        map.put("competitors", formatList(profile.getCompetitors(), "Competencia local y global"));
        map.put("channels", formatList(profile.getChannels(), "Canal directo"));

        map.put("digitalMaturity", profile.getDigitalMaturity() != null ? profile.getDigitalMaturity() : 50);
        map.put("aiMaturity", profile.getAiMaturity() != null ? profile.getAiMaturity() : 30);

        return map;
    }

    @Transactional(readOnly = true)
    public String buildConversationSystemPrompt(
            UUID organizationId,
            com.bowol.ai.conversation.ConversationContextType contextType,
            Trend trend) {

        BusinessProfile profile = null;
        if (organizationId != null) {
            profile = businessProfileRepository.findByOrganizationId(organizationId).orElse(null);
        }
        Map<String, Object> bp = extractBusinessProfileContext(profile);

        StringBuilder sb = new StringBuilder();
        sb.append("Eres el Asesor Estratégico y Business Copilot de BOWOL.\n");
        sb.append("Actúas como consultor senior en innovación, tecnología y transformación digital para startups y pymes.\n\n");

        sb.append("--- CONTEXTO ESTRATÉGICO DE LA EMPRESA ---\n");
        sb.append("Industria: ").append(bp.get("industry")).append("\n");
        sb.append("Tamaño: ").append(bp.get("size")).append("\n");
        sb.append("Mercado: ").append(bp.get("market")).append("\n");
        sb.append("Objetivos: ").append(bp.get("goals")).append("\n");
        sb.append("Desafíos / Problemas: ").append(bp.get("problems")).append("\n");
        sb.append("Herramientas: ").append(bp.get("tools")).append("\n");
        sb.append("Competidores: ").append(bp.get("competitors")).append("\n");
        sb.append("Madurez Digital: ").append(bp.get("digitalMaturity")).append("/100\n");
        sb.append("Madurez en IA: ").append(bp.get("aiMaturity")).append("/100\n\n");

        if (trend != null) {
            sb.append("--- ENFOQUE EN TENDENCIA ESPECÍFICA ---\n");
            sb.append("Título: ").append(trend.getTitle()).append("\n");
            if (trend.getSource() != null) {
                sb.append("Fuente: ").append(trend.getSource().getName()).append("\n");
            }
            sb.append("Score Global: ").append(trend.getScore()).append("/100\n");
            if (trend.getUrl() != null) {
                sb.append("URL: ").append(trend.getUrl()).append("\n");
            }
            if (trend.getDescription() != null) {
                sb.append("Descripción: ").append(trend.getDescription()).append("\n");
            }
            if (trend.getTags() != null && !trend.getTags().isEmpty()) {
                sb.append("Etiquetas: ").append(String.join(", ", trend.getTags())).append("\n");
            }
            sb.append("\n");
        }

        sb.append("REGLAS OBLIGATORIAS:\n");
        sb.append("1. Toda recomendación debe basarse en el perfil empresarial de la organización.\n");
        sb.append("2. Si proporcionas un análisis estratégico formal o una recomendación, DEBES estructurarlo con:\n");
        sb.append("   - ### DATO: El hecho verificado o métrica observable.\n");
        sb.append("   - ### ANÁLISIS: La correlación estratégica con el contexto de la empresa.\n");
        sb.append("   - ### HIPÓTESIS: El escenario o resultado proyectado (nunca como certeza absoluta).\n");
        sb.append("   - ### RECOMENDACIÓN: La acción táctica ejecutable en 1 a 4 semanas.\n");
        sb.append("3. Responde de forma interactiva y natural manteniendo siempre rigor analítico y profesionalismo.\n");

        return sb.toString();
    }

    private String formatList(List<String> list, String fallback) {
        if (list == null || list.isEmpty()) return fallback;
        return String.join(", ", list);
    }
}
