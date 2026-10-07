# BowolAI — Plan para operar con un modelo de IA gratuito

> Sustituye al "AI Copilot" actual. Objetivo: un asistente estratégico real (no mock) sin coste por token,
> sin cerrar la puerta a modelos de pago cuando el producto lo justifique.

## 1. Punto de partida (verificado en el código)

| Hallazgo | Dónde | Consecuencia |
|---|---|---|
| El proveedor por defecto es `mock`; sin claves, **todo lo "IA" responde con datos simulados**. | `application.yml` → `bowol.ai.default-provider` | Hoy no hay asistente real, ni con OpenAI. |
| Existe la interfaz `AIProvider` (`complete`, `stream`, `embed`, `isAvailable`) y `AIProviderResolver` con **fallback automático**: modelo nativo → proveedor por defecto → cualquiera disponible → mock. | `ai/provider/*` | Un proveedor nuevo se enchufa **sin tocar** los servicios de FODA, RICE, hipótesis, sprints y social. |
| `OpenAIProvider` habla el protocolo `POST /chat/completions` con `RestClient`. | `OpenAIProvider.java` | Ollama, Groq, OpenRouter y Gemini (modo compatible) usan **el mismo protocolo**. |
| `AIModel` es un **enum fijo** (GPT-4o, Claude…) y los servicios piden `AIModel.GPT_4O` a mano. | `ai/model/AIModel.java` | Hay que traducir "modelo pedido" → "modelo configurado" dentro del proveedor. |
| `stream()` **no hace streaming real**: envuelve `complete()` en un solo fragmento. | `OpenAIProvider.stream` | El asistente no puede escribir en vivo. |
| Los créditos (`aiCreditsUsed`) **no se descuentan en ningún punto**; `AIUsageLog` existe. | `subscription/*`, `ai/audit/*` | Hay que decidir la política de créditos antes de abrir el asistente. |
| El frontend llama a `/ai/conversations` (crear conversación, enviar mensaje, listar). | `features/copilot/services` | El contrato REST no cambia; solo cambia lo que hay detrás. |

## 2. Opciones de modelo gratuito

> Las cuotas y condiciones de los servicios gratuitos **cambian con frecuencia**: confirmar límites, política de
> datos y disponibilidad en la documentación oficial de cada proveedor antes de decidir. No están verificadas aquí.

| Opción | Cómo se usa | Ventajas | Riesgos |
|---|---|---|---|
| **A · Ollama (local/servidor propio)** con un modelo abierto de ~7–8 B (p. ej. familias Qwen, Llama, Gemma o Mistral) | API compatible con OpenAI en `http://localhost:11434/v1` | Coste cero real, **los datos del negocio no salen de tu infraestructura**, sin límites de cuota | Necesita hardware (≈8–16 GB de RAM; GPU mejora mucho la latencia). Calidad de un 7 B < modelos de pago. |
| **B · Nube con capa gratuita** (Groq, OpenRouter con variantes `:free`, Google Gemini, Cloudflare Workers AI, GitHub Models) | Mismo protocolo `chat/completions` con `baseUrl` y clave | Sin hardware, modelos más grandes, rápidos de probar | **Cuotas por minuto/día**, posibles cambios de precio, y algunas capas gratuitas **usan los datos para mejorar el servicio**: no enviar datos sensibles de clientes. |
| **C · Híbrido (recomendado)** | Ollama como principal en desarrollo/privado; una capa gratuita en la nube como respaldo; `mock` como último recurso | Continuidad si uno cae, y ruta de migración a modelos de pago sin reescribir | Algo más de configuración |

**Recomendación:** empezar por **C**. Desarrollo y datos reales de clientes → Ollama. Demos y pruebas sin GPU → una capa gratuita en la nube con datos sintéticos.
Elegir el modelo por **evaluación propia (fase 6)**, no por reputación: lo que importa es español, JSON válido y contexto largo.

## 3. Arquitectura objetivo

```
Front (BowolAI drawer, SSE)
   │  POST /api/v1/ai/conversations/{id}/messages/stream
   ▼
AIConversationService ──► StrategicContextService (FODA, oportunidades, tendencias, perfil)
   │                         └─ recorta el contexto a la ventana del modelo
   ▼
AIProviderResolver ──► [ollama] ──► [groq|openrouter…] ──► [mock]      (cadena configurable)
   │
   ├─ AIResponseValidator (JSON/esquemas) + reintento con reparación
   ├─ RateLimiterService (por organización) y AIUsageLog (tokens, latencia, proveedor)
   └─ Redacción de datos personales antes de salir a un proveedor externo
```

## 4. Fases

| # | Fase | Trabajo | Esfuerzo | Criterio de aceptación |
|---|---|---|---|---|
| 0 | **Identidad BowolAI** | Renombrar Copilot → BowolAI en interfaz, prompts y atajo (⌘J). Prompt de sistema con personalidad, idioma (es) y límites. | 0,5 d | Ninguna cadena visible dice "Copilot". |
| 1 | **Proveedor compatible con OpenAI configurable** | Generalizar `OpenAIProvider` a `OpenAICompatibleProvider` con instancias nombradas (`ollama`, `groq`, `openrouter`), `baseUrl`, clave opcional y **modelo configurado** (ignora el enum). `isAvailable()` con *ping* a `/models` cacheado. Cadena de *fallback* por propiedades. | 1–2 d | Con `AI_DEFAULT_PROVIDER=ollama` y Ollama arriba, FODA/RICE/hipótesis responden con el modelo local sin cambios en sus servicios. |
| 2 | **Streaming real** | `stream()` con `stream:true` (SSE del proveedor) → `SseEmitter` en el backend → `fetch` + `ReadableStream` en el frontend con botón *Detener*. | 2 d | Los tokens aparecen mientras se generan; cancelar corta la generación. |
| 3 | **Robustez con modelos pequeños** | Modo JSON con **reparación y reintento** vía `AIResponseValidator`; temperatura baja para tareas estructuradas; *few-shot* en `prompts/*.md`; presupuesto de tokens del contexto. | 2–3 d | ≥ 95 % de respuestas estructuradas válidas en el conjunto de evaluación. |
| 4 | **Fundamentación en datos del negocio** | `StrategicContextService` entrega solo lo relevante por módulo y **cita la fuente** (FODA, oportunidad, tendencia). Opcional: embeddings locales (`nomic-embed-text`) + pgvector para búsqueda semántica. | 3–4 d | Las respuestas enlazan a la entidad de origen; sin alucinar cifras que no estén en el contexto. |
| 5 | **Gobierno y privacidad** | Límite por organización, registro en `AIUsageLog` (proveedor, modelo, tokens, latencia), **política de créditos** (ver §6), redacción de PII antes de proveedores externos, interruptor global y **ajuste por organización**: "Privado (local)" vs "Nube". | 2–3 d | Auditoría de cada llamada; una organización "Privada" nunca sale a la nube. |
| 6 | **Evaluación y elección de modelo** | Conjunto dorado de 30–50 casos en español (FODA, RICE, hipótesis, sprint, consulta libre). Métricas: JSON válido, fidelidad al contexto, latencia p50/p95, calidad (rúbrica). Comparar 2–3 modelos. | 2 d | Informe con el modelo por defecto elegido con datos. |
| 7 | **Experiencia BowolAI** | Rediseño del cajón con el sistema iOS/cristal; sugerencias por módulo; historial; indicador del modelo activo; estados de límite/errores comprensibles; modo sin conexión. | 3 d | Flujo completo usable en móvil y escritorio, claro y oscuro. |

**Total estimado:** 15–20 días de trabajo, con valor útil desde la fase 1 (≈ 2 días).

## 5. Configuración de ejemplo

```yaml
bowol:
  ai:
    default-provider: ${AI_DEFAULT_PROVIDER:ollama}
    fallback-chain: [ollama, groq, mock]
    providers:
      ollama:
        base-url: ${OLLAMA_URL:http://localhost:11434/v1}
        model: ${OLLAMA_MODEL:qwen2.5:7b-instruct}   # a decidir en la fase 6
        timeout-seconds: 120
      groq:
        base-url: https://api.groq.com/openai/v1
        api-key: ${GROQ_API_KEY:}
        model: ${GROQ_MODEL:}
    privacy:
      external-allowed-by-default: false          # nada sale a la nube salvo que la organización lo permita
      redact-pii: true
```

## 6. Decisiones que necesito de ti

1. **¿Dónde correrá el modelo?** Tu máquina de desarrollo / un servidor propio (Ollama) o solo nube gratuita. Define el hardware y la privacidad.
2. **Créditos de IA:** hoy no se descuentan. Con un modelo gratuito, ¿siguen siendo la palanca de monetización (cuota por plan, aunque el coste real sea 0) o se eliminan para el asistente? Recomiendo **mantenerlos como cuota de uso** (protege la capacidad y prepara el paso a modelos de pago).
3. **Datos sensibles:** ¿aceptas que un cliente pueda elegir "Nube"? Recomiendo **Privado por defecto**.
4. **Alcance del asistente:** solo consulta/recomendación, o también **acciones** (crear oportunidad, tarea, evento). Las acciones exigen *tool-calling* fiable, que los modelos de 7 B ofrecen peor; propongo empezar solo con recomendación y confirmación humana.

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Calidad inferior a un modelo de pago en tareas estructuradas | Fase 3 (validación + reparación) y elegir el modelo con la fase 6. |
| Latencia alta sin GPU | Streaming (fase 2), respuestas cortas, modelo más pequeño para tareas simples. |
| Cuotas gratuitas agotadas o cambios de condiciones | Cadena de *fallback* y Ollama como base; no depender de una sola capa gratuita. |
| Fuga de datos a terceros | Privado por defecto, redacción de PII, ajuste por organización, auditoría. |
| Alucinaciones sobre cifras del negocio | Fundamentación con citas (fase 4) y rechazo cuando falte el dato. |

## 8. Primer paso propuesto (2 días, máximo retorno)

1. Fase 0 (renombrar) + Fase 1 (proveedor compatible con OpenAI configurable).
2. Probar en local con Ollama y ejecutar la generación de FODA con datos reales de la cuenta de prueba.
3. Con eso ya hay un BowolAI real de extremo a extremo, y el resto de fases se priorizan con evidencia.
