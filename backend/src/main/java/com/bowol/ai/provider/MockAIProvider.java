package com.bowol.ai.provider;

import com.bowol.ai.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Stream;

@Slf4j
@Component
public class MockAIProvider implements AIProvider {

    private final Random random = new Random();

    @Override
    public String name() {
        return "mock";
    }

    @Override
    public boolean supports(AIModel model) {
        return true;
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public AIResponse complete(AIRequest request) {
        Instant start = Instant.now();

        String content;
        if (request.getFormat() == ResponseFormat.JSON_OBJECT) {
            content = generateMockJsonResponse(request);
        } else {
            content = generateMockTextResponse(request);
        }

        int promptTokens = estimateTokens(request.getSystemPrompt()) +
                request.getMessages().stream().mapToInt(m -> estimateTokens(m.getContent())).sum() + 50;
        int completionTokens = estimateTokens(content);

        AIModel model = request.getModel() != null ? request.getModel() : AIModel.GPT_4O_MINI;
        BigDecimal cost = model.calculateCost(promptTokens, completionTokens);

        Duration latency = Duration.between(start, Instant.now()).plusMillis(30);

        return AIResponse.builder()
                .content(content)
                .provider(name())
                .model(model.getCode())
                .promptTokens(promptTokens)
                .completionTokens(completionTokens)
                .costUsd(cost)
                .finishReason("stop")
                .latency(latency)
                .build();
    }

    @Override
    public Stream<AIChunk> stream(AIRequest request) {
        AIResponse fullResponse = complete(request);
        String[] words = fullResponse.getContent().split(" ");
        List<AIChunk> chunks = new ArrayList<>();

        for (int i = 0; i < words.length; i++) {
            boolean isLast = (i == words.length - 1);
            String delta = words[i] + (isLast ? "" : " ");
            chunks.add(new AIChunk(delta, isLast, isLast ? fullResponse.getCompletionTokens() : null));
        }

        return chunks.stream();
    }

    @Override
    public List<Float> embed(String text) {
        List<Float> vector = new ArrayList<>(1536);
        for (int i = 0; i < 1536; i++) {
            vector.add((random.nextFloat() * 2) - 1);
        }
        return vector;
    }

    private String generateMockJsonResponse(AIRequest request) {
        String combined = (request.getSystemPrompt() != null ? request.getSystemPrompt() : "") +
                request.getMessages().stream().map(AIMessage::getContent).reduce("", (a, b) -> a + " " + b);

        String lower = combined.toLowerCase();

        if (lower.contains("formulate-hypothesis") || lower.contains("hipótesis") || lower.contains("hypothesis") || lower.contains("lean startup") || lower.contains("chief scientific officer") || lower.contains("falsable")) {
            return """
            {
              "statement": "Creemos que implementar un asistente de IA para reservas fuera de horario comercial aumentará la captación de leads en un 35%. Sabremos que es cierto cuando al menos 15 clientes agenden citas automáticamente en la primera semana de prueba.",
              "validationMethod": "Landing page interactiva con formulario inteligente / Concierge MVP",
              "successMetric": "Tasa de conversión de reservas nocturnas",
              "targetValue": "Al menos 20% de conversión o 15 reservas confirmadas"
            }
            """.stripIndent();
        }

        if (lower.contains("reachscore") || lower.contains("metodología rice") || lower.contains("product strategist") || lower.contains("opportunity-from-swot") || lower.contains("from-swot")) {
            return """
            {
              "opportunities": [
                {
                  "title": "Asistente IA para atención y reservas automáticas",
                  "description": "Despliegue de un agente conversacional para captura de clientes fuera de horario comercial.",
                  "problem": "Pérdida del 35% de leads que consultan fuera del horario comercial.",
                  "proposal": "Agente autónomo integrado con CRM y pasarela para cerrar reservas en tiempo real.",
                  "targetSegment": "Empresas SaaS B2B y servicios profesionales",
                  "riskLevel": "LOW",
                  "reachScore": 80,
                  "impactScore": 90,
                  "confidenceScore": 70,
                  "effortScore": 50,
                  "evidence": []
                },
                {
                  "title": "Pipeline de analítica predictiva de rotación",
                  "description": "Modelo de scoring para anticipar cancelaciones recurrentes con antelación.",
                  "problem": "Ausencia de señales tempranas ante caída de uso en cuentas clave.",
                  "proposal": "Algoritmo de detección de patrones anómalos de telemetría con alertas proactivas.",
                  "targetSegment": "Clientes empresariales con contratos anuales",
                  "riskLevel": "MEDIUM",
                  "reachScore": 60,
                  "impactScore": 75,
                  "confidenceScore": 80,
                  "effortScore": 40,
                  "evidence": []
                }
              ]
            }
            """.stripIndent();
        }

        if (lower.contains("swot") || lower.contains("foda")) {
            return """
            {
              "strengths": [
                {
                  "statement": "Adopción temprana de herramientas de IA",
                  "confidence": "HIGH",
                  "impact": "HIGH",
                  "source": "INTERNAL_PROFILE"
                },
                {
                  "statement": "Equipo técnico ágil",
                  "confidence": "HIGH",
                  "impact": "HIGH",
                  "source": "INTERNAL_PROFILE"
                }
              ],
              "weaknesses": [
                {
                  "statement": "Presupuesto limitado para infraestructura dedicada",
                  "confidence": "HIGH",
                  "impact": "MEDIUM",
                  "source": "INTERNAL_PROFILE"
                },
                {
                  "statement": "Dependencia de proveedores cloud",
                  "confidence": "MEDIUM",
                  "impact": "MEDIUM",
                  "source": "INTERNAL_PROFILE"
                }
              ],
              "opportunities": [
                {
                  "statement": "Automatización de flujos de soporte al cliente",
                  "confidence": "HIGH",
                  "impact": "HIGH",
                  "source": "TREND_RADAR"
                },
                {
                  "statement": "Creación de asistentes internos",
                  "confidence": "HIGH",
                  "impact": "HIGH",
                  "source": "TREND_RADAR"
                }
              ],
              "threats": [
                {
                  "statement": "Cambios rápidos en APIs de modelos",
                  "confidence": "MEDIUM",
                  "impact": "HIGH",
                  "source": "TREND_RADAR"
                },
                {
                  "statement": "Regulaciones de privacidad de datos",
                  "confidence": "MEDIUM",
                  "impact": "HIGH",
                  "source": "TREND_RADAR"
                }
              ],
              "summary": "Posición competitiva favorable con margen para acelerar la ejecución mediante modelos abiertos."
            }
            """.stripIndent();
        }

        if (lower.contains("relevance") || lower.contains("relevancia") || lower.contains("trend-evaluate") || lower.contains("trend")) {
            return """
            {
              "score": 88,
              "aiSummary": "Esta tecnología presenta una alta aplicabilidad para optimizar los procesos de automatización y reducir los costes operativos en un 45%.",
              "strategicAlignment": "HIGH",
              "tags": ["automatizacion", "eficiencia-operativa", "ia-generativa"],
              "recommendedActions": [
                "Probar en entorno de laboratorio durante el próximo sprint",
                "Integrar con el pipeline de datos existente"
              ]
            }
            """.stripIndent();
        }

        if (lower.contains("backlog") || lower.contains("idea-to-backlog") || lower.contains("decompos")) {
            return """
            {
              "epic": {
                "title": "Arquitectura y Funcionalidad Núcleo",
                "objective": "Desplegar las capacidades base con robustez multi-inquilino y trazabilidad completa"
              },
              "tasks": [
                {
                  "title": "Diseñar esquema relacional y aislamiento multi-tenant",
                  "description": "Configurar entidades JPA, filtros Hibernate y políticas de Row Level Security.",
                  "priority": "HIGH",
                  "estimateHours": 8.0,
                  "status": "BACKLOG",
                  "category": "BACKEND",
                  "acceptanceCriteria": [
                    "Filtro tenantFilter activo en consultas",
                    "Aislamiento verificado en pruebas unitarias"
                  ]
                },
                {
                  "title": "Implementar servicios REST e integración con IA",
                  "description": "Desarrollar controladores, servicios con prompts versionados y registro de auditoría de tokens.",
                  "priority": "HIGH",
                  "estimateHours": 16.0,
                  "status": "BACKLOG",
                  "category": "BACKEND",
                  "acceptanceCriteria": [
                    "Endpoints probados con MockMvc",
                    "Registro de ai_usage_logs verificado"
                  ]
                },
                {
                  "title": "Construir interfaz visual Kanban e interactiva",
                  "description": "Desarrollar componentes React con Liquid Glass y drag & drop sin emojis.",
                  "priority": "MEDIUM",
                  "estimateHours": 12.0,
                  "status": "BACKLOG",
                  "category": "FRONTEND",
                  "acceptanceCriteria": [
                    "Soporte de temas y contraste optimizado",
                    "Pruebas con Vitest pasando al 100%"
                  ]
                },
                {
                  "title": "Automatizar pipeline de pruebas y despliegue",
                  "description": "Crear workflow en GitHub Actions para compilar y validar frontend y backend.",
                  "priority": "LOW",
                  "estimateHours": 6.0,
                  "status": "BACKLOG",
                  "category": "INFRA",
                  "acceptanceCriteria": [
                    "Build sin warnings en TypeScript",
                    "Empaquetado JAR verificado"
                  ]
                }
              ]
            }
            """.stripIndent();
        }

        if (lower.contains("hypothes") || lower.contains("hipotes") || lower.contains("hipótes") || lower.contains("statement") || lower.contains("formulate")) {
            return """
            {
              "statement": "Creemos que un asistente IA para reservas automáticas reducirá el tiempo de gestión en un 40% para empresas medianas. Sabremos que es cierto cuando al menos 6 de cada 10 usuarios lo adopten activamente durante 2 semanas consecutivas.",
              "validationMethod": "Prototipo interactivo MVP Concierge",
              "successMetric": "Tasa de adopción recurrente en 14 días",
              "targetValue": ">= 60% de los usuarios objetivo"
            }
            """.stripIndent();
        }

        if (lower.contains("sprint") || lower.contains("sprint-planner") || lower.contains("suggest-plan")) {
            return """
            {
              "sprintName": "Sprint 1: Cimientos y MVP de Validación",
              "sprintGoal": "Desplegar la infraestructura núcleo, validar la arquitectura multi-inquilino y poner en marcha las primeras historias de usuario de alto impacto.",
              "suggestedDurationDays": 14,
              "recommendedTaskTitles": [
                "Diseñar esquema relacional y aislamiento multi-tenant",
                "Implementar servicios REST e integración con IA"
              ],
              "rationale": "Prioriza las bases estructurales y componentes de mayor dependencia técnica para desbloquear el desarrollo posterior sin cuellos de botella."
            }
            """.stripIndent();
        }


        if (lower.contains("social") || lower.contains("brand") || lower.contains("post")) {
            return """
            {
              "topic": "Innovación y Estrategia Ágil",
              "proposals": [
                {
                  "channel": "LINKEDIN",
                  "title": "La revolución de la innovación ágil orientada a datos",
                  "content": "La verdadera agilidad no consiste en correr más rápido, sino en aprender antes que el mercado.\\n\\nEn nuestra última iteración descubrimos cómo la combinación de señales estratégicas e inteligencia artificial permite reducir el ciclo de validación de semanas a días.\\n\\n¿Cómo está tu organización midiendo el impacto de sus iniciativas?",
                  "tags": ["Innovacion", "Estrategia", "InteligenciaArtificial", "Agile"],
                  "predictedImpact": {
                    "reachEstimateMin": 3200,
                    "reachEstimateMax": 7500,
                    "engagementRate": 5.4,
                    "viralityScore": 78,
                    "sentiment": "POSITIVE",
                    "bestTimeToPost": "Martes o Jueves a las 09:30 AM",
                    "strategicReasoning": "El formato reflexivo y la pregunta de cierre fomentan debate entre perfiles de liderazgo técnico y directores de producto."
                  }
                },
                {
                  "channel": "TWITTER_X",
                  "title": "Validación exprés de hipótesis",
                  "content": "Acelerar sin validar es solo acumular deuda técnica.\\n\\nConvertimos señales de mercado en experimentos medibles en menos de 48 horas. Menos reuniones, más datos empíricos.\\n\\n#BuildInPublic #AI #StartupGrowth",
                  "tags": ["BuildInPublic", "AI", "StartupGrowth"],
                  "predictedImpact": {
                    "reachEstimateMin": 1800,
                    "reachEstimateMax": 4200,
                    "engagementRate": 3.8,
                    "viralityScore": 65,
                    "sentiment": "PROVOCATIVE",
                    "bestTimeToPost": "Miércoles a las 12:15 PM",
                    "strategicReasoning": "Tono directo y contundente ideal para tracción en comunidades de constructores y early adopters."
                  }
                }
              ]
            }
            """.stripIndent();
        }

        return """
        {
          "status": "SUCCESS",
          "analysis": "Análisis estratégico completado por el motor de inferencia BOWOL.",
          "confidence": 0.94
        }
        """.stripIndent();
    }

    private String generateMockTextResponse(AIRequest request) {
        return """
        ### DATO
        Se ha detectado una señal de mercado relevante con métricas de adopción aceleradas en repositorios de código abierto y comunidades técnicas.

        ### ANÁLISIS
        La arquitectura observada permite desacoplar la ejecución de tareas intensivas, reduciendo la dependencia de infraestructura propietaria y recortando latencias de respuesta.

        ### HIPÓTESIS
        Si la organización implementa un prototipo piloto en las próximas 3 semanas, es probable que se reduzca el coste de cómputo por operación en un rango estimado del 35% al 50%.

        ### RECOMENDACIÓN
        Proceder con la formulación de una tarjeta de experimento táctico (1 semana) para validar viabilidad técnica antes del despliegue en producción.
        """.stripIndent();
    }

    private int estimateTokens(String text) {
        if (text == null || text.isBlank()) return 0;
        return Math.max(1, text.length() / 4);
    }
}
