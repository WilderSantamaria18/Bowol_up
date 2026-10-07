# 01 - Visión del Producto: BOWOL Platform

> **Planificador Inteligente de Actividades & Sistema de Automatización de Tareas para Emprendimientos y Pequeñas Empresas (PYMES)**
>
> v1.1 · Autor: Equipo BOWOL · Estado: Aprobado

---

> **CONTEXTO PARA EL PROGRAMADOR Y FUNDADORES**
>
> Este documento es la fuente de verdad sobre **qué es BOWOL, para quién es y por qué existe**. Todo lo demás en `/docs` deriva de aquí.
>
> Léelo completo antes de escribir código o diseñar nuevas funciones.
>
> Reglas clave que se derivan de este documento:
> - BOWOL es un **planificador de actividades inteligente** diseñado para automatizar las tareas básicas de planificación de un emprendimiento o pequeña empresa.
> - Su misión es permitir que un pequeño negocio cree e implemente su propio sistema de trabajo ágil, visual y automático sin sufrir la complejidad de suites corporativas pesadas.
> - La IA actúa como un copiloto de planificación que toma un objetivo o iniciativa de negocio y lo desglosa en actividades cotidianas, estimaciones de tiempo, prioridades y asignaciones de equipo.
>
> Referencias cruzadas:
> - Arquitectura técnica: `02-ARCHITECTURE.md`
> - Base de datos: `03-DATABASE.md`
> - Contrato de API: `04-API-CONTRACT.md`
> - Estrategia de IA: `05-AI-STRATEGY.md`
> - Frontend y Design System: `07-FRONTEND.md`
> - Roadmap de fases: `09-ROADMAP.md`
> - Glosario de términos: `10-GLOSSARY.md`

---

## 1. El Problema

Los emprendedores y dueños de pequeñas empresas (PYMES) enfrentan cuatro grandes dolores al intentar planificar y operar:

### 1.1 Caos operativo y tareas dispersas
Las tareas del día a día se gestionan en chats de WhatsApp, mensajes de voz, hojas sueltas de papel o post-its. No existe un único lugar confiable donde el equipo vea qué actividades deben completarse hoy.

### 1.2 Horas perdidas planificando manualmente
Armar cronogramas, definir qué paso va primero, estimar fechas de entrega y coordinar quién hace qué toma horas de reuniones y hojas de cálculo que un equipo pequeño no tiene tiempo de mantener.

### 1.3 Metas de negocio que nunca se ejecutan
Ideas valiosas (lanzar un nuevo producto, aumentar ventas del mes, ordenar proveedores o mejorar la atención) se quedan en buenas intenciones porque no hay un sistema automático que las convierta en actividades prácticas asignadas día por día.

### 1.4 Complejidad excesiva de herramientas corporativas
Herramientas como Jira, SAP o Enterprise Asana están pensadas para corporaciones de cientos de empleados con roles burocráticos. Para un emprendimiento de 2 a 15 personas, resultan abrumadoras, lentas de configurar y caras.

**Consecuencia agregada:** El 70% de los emprendimientos y pequeños negocios fracasan por desorden operativo y falta de seguimiento diario, no por falta de talento. BOWOL resuelve esta brecha automatizando la planificación.

---

## 2. La Solución: El Sistema Automatizado de Planificación BOWOL

BOWOL es una plataforma SaaS que **automatiza las tareas básicas de planificación** y provee a cualquier negocio su propio sistema de gestión:

```mermaid
flowchart TD
    A[EMPRENDIMIENTO / PYME<br/>Rubro · Tamaño · Equipo · Objetivos] --> B[PERFIL DEL NEGOCIO<br/>Contexto operativo que guía a la IA]
    B --> C[METAS & OPORTUNIDADES<br/>Lanzamientos · Ventas · Operaciones · Mejoras]
    C --> D[PLANIFICADOR INTELIGENTE IA<br/>Desglose automático en actividades paso a paso]
    D --> E[PRIORIZACIÓN ÁGIL<br/>Impacto vs Esfuerzo · Fechas sugeridas]
    E --> F[TABLERO KANBAN & CALENDARIO<br/>Tareas diarias · Responsables · Recordatorios]
    F --> G[SPRINTS SEMANALES & SEGUIMIENTO<br/>Avance en tiempo real · Métricas de cumplimiento]
    G --> H[AJUSTES & RETROALIMENTACIÓN<br/>Reprogramación automática de tareas pendientes]
    H --> B
```

**Todo está conectado:**
1. El usuario define un objetivo (por ejemplo: "Campaña de ventas de primavera").
2. BOWOL genera automáticamente el desglose de actividades, duraciones y dependencias.
3. Las actividades pasan directamente al tablero Kanban y al calendario del equipo.
4. El sistema alerta sobre tareas pendientes y recalibra prioridades automáticamente.

---

## 3. Propuesta de Valor Diferencial

### 3.1 Tagline

> **"El planificador inteligente de actividades para emprendimientos y pequeñas empresas: automatiza tu planificación y haz crecer tu negocio con un sistema ágil."**

### 3.2 El valor en 5 respuestas claras

| Necesidad del Emprendedor | Cómo BOWOL lo automatiza |
|---|---|
| ¿Qué tareas debemos hacer para lograr este objetivo? | El Planificador IA desglosa cualquier meta en actividades concretas, estimaciones y entregables. |
| ¿Qué es lo más urgente e importante hoy? | Priorizador visual que clasifica actividades por impacto inmediato vs. esfuerzo requerido. |
| ¿Quién hace cada tarea y cuándo se entrega? | Tablero Kanban integrado con calendario, asignaciones de equipo y fechas límites claras. |
| ¿Cómo evitamos olvidar tareas rutinarias? | Automatización de tareas recurrentes (cierres semanales, compras, inventario, publicaciones). |
| ¿Cómo sabemos si estamos avanzando? | Métricas simples de cumplimiento semanal y avance de sprint sin reportes engorrosos. |

---

## 4. Usuarios Objetivo

### 4.1 Segmentos primarios

| Segmento | Tamaño | Dolores principales | Cómo BOWOL ayuda |
|---|---|---|---|
| **Startups en fase seed/early** | 2-15 personas | Necesitan validar rápido, no pueden contratar consultoría estratégica | FODA + Opportunity Engine + AI Planner reemplazan 3 meses de consultoría |
| **PYMES en digitalización** | 15-100 empleados | No saben por dónde empezar con IA, tienen procesos manuales | Onboarding guiado + tendencias filtradas por industria + roadmap ejecutable |
| **Equipos de innovación corporativa** | 5-20 personas dentro de empresas grandes | Necesitan sistematizar el proceso de ideación y validación | Ciclo completo Intelligence → Execution con trazabilidad y auditoría |
| **Agencias y consultoras** | 5-50 personas | Necesitan multiplicar su capacidad analítica sin contratar más gente | Multi-tenant + IA por cliente + reportes exportables |

### 4.2 Segmentos secundarios (Fase 2+)

- **Freelancers estratégicos** (consultores independientes de innovación).
- **Aceleradoras e incubadoras** (gestionan portfolios de startups).
- **Programas universitarios de emprendimiento**.

### 4.3 Persona ejemplo

> **Ana, 34 años, cofundadora de una startup SaaS B2B en Perú.**
> Equipo de 6 personas. Facturación de $15k MRR. Necesita decidir en qué invertir los próximos 3 meses. Hoy hace research en Twitter, mira YouTube, y arma el roadmap en Notion con su cofundador. Siente que le falta método. BOWOL le da un sistema: su perfil de negocio ya está cargado, recibe 3 tendencias relevantes por semana, las convierte en FODA, prioriza 2 oportunidades y las ejecuta en un sprint de 4 semanas con su equipo.

---

## 5. Diferenciación Competitiva

| Criterio | Notion | Linear | ChatGPT / Claude | Perplexity | Copy.ai | **BOWOL** |
|---|---|---|---|---|---|---|
| Búsqueda de tendencias | ❌ | ❌ | ⚠️ Genérico | ✅ | ❌ | ✅ **Filtrado por negocio** |
| FODA asistido por IA | ❌ | ❌ | ⚠️ Manual | ❌ | ❌ | ✅ **Dinámico + evidencias** |
| Priorización RICE | ❌ | ⚠️ Manual | ❌ | ❌ | ❌ | ✅ **Automática** |
| Hipótesis y experimentos | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Con ciclo cerrado** |
| Gestión de sprints y tareas | ⚠️ Básico | ✅ | ❌ | ❌ | ❌ | ✅ **Conectado a estrategia** |
| Multi-tenant para equipos | ⚠️ Workspaces | ✅ | ❌ | ❌ | ❌ | ✅ **Con RLS** |
| Ciclo Intelligence → Execution | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Completo** |

**Conclusión:** los competidores atacan piezas aisladas. BOWOL es el único que cierra el ciclo completo desde la señal del mercado hasta la tarea ejecutada, con trazabilidad.

---

## 6. Modelo de Negocio

### 6.1 Planes

| Plan | Precio mensual | Precio anual | Usuarios | Proyectos | Créditos IA/mes | Enfoque |
|---|---|---|---|---|---|---|
| **Free** | $0 | $0 | 1 | 1 | 10 | Exploración |
| **Pro** | $29 | $290 | 5 | 10 | 500 | Freelancers y startups pequeñas |
| **Business** | $99 | $990 | 25 | 100 | 3,000 | PYMES y equipos de innovación |
| **Enterprise** | Personalizado | Personalizado | Ilimitados | Ilimitados | Negociables | Corporativos |

### 6.2 Unit economics objetivo (año 1)

| Métrica | Objetivo |
|---|---|
| CAC (coste de adquisición) | < $80 |
| ARPU (ingreso medio por usuario) | $45/mes |
| LTV (valor de vida) | > $600 |
| LTV / CAC | > 3x |
| Churn mensual | < 5% |

### 6.3 Fuentes de ingreso complementarias (Fase 2+)

- Add-ons: integraciones empresariales (HubSpot, Salesforce) como módulos premium.
- Créditos IA adicionales (más allá del cupo del plan).
- Servicios de onboarding enterprise (implementación asistida).

---

## 7. Ciclo de Vida del Usuario

| Etapa | Objetivo del usuario | Qué hace BOWOL |
|---|---|---|
| **Descubrimiento** | "Necesito entender qué IA aplica a mi negocio" | Landing pública + prueba gratuita 14 días + contenido SEO sobre tendencias |
| **Activación** | "Quiero ver valor en 10 minutos" | Onboarding de 5 pasos → perfil de negocio → 3 tendencias relevantes en el dashboard |
| **Aha moment** | "Esto entiende mi negocio" | Primer FODA generado con IA citando tendencias reales y específicas para su industria |
| **Adopción** | "Esto me sirve para trabajar" | Conversión FODA → oportunidad → hipótesis → sprint → tareas en menos de 30 minutos |
| **Retención** | "Mi equipo lo usa a diario" | Dashboard diario + notificaciones de tendencias nuevas + integración con calendario |
| **Expansión** | "Necesito más usuarios y features" | Upgrade a Pro/Business, invitar miembros, conectar integraciones |
| **Promoción** | "Debería contarlo" | Reportes exportables + caso de éxito compartible + programa de referidos (Fase 3) |

---

## 8. Métricas Clave

### 8.1 North Star Metric

> **Proyectos ejecutados por organización por mes.**

No medimos "usuarios registrados" ni "FODAs generados". Medimos ejecución real: proyectos que terminan con métricas de aprendizaje. Es la única métrica que demuestra que BOWOL está cumpliendo su promesa.

### 8.2 KPIs por etapa

| Etapa | KPI | Objetivo año 1 |
|---|---|---|
| **Adquisición** | Nuevos registros / mes | 500 |
| **Activación** | % que completa onboarding + genera primer FODA en < 24h | > 40% |
| **Retención D7** | % activo a los 7 días | > 50% |
| **Retención D30** | % activo a los 30 días | > 30% |
| **Conversión Free → Pago** | % de Free que pasan a Pro/Business | > 8% |
| **NRR (Net Revenue Retention)** | Ingreso retenido + expansión | > 100% |
| **Churn mensual** | Bajas de pago / total | < 5% |
| **NPS** | Recomendación | > 40 |
| **Tiempo a primer valor** | Onboarding → primer FODA | < 10 minutos |

### 8.3 KPIs técnicos (para el equipo de ingeniería)

| KPI | Objetivo |
|---|---|
| Uptime backend | > 99.5% |
| Latencia p95 API | < 400ms |
| Latencia p95 generación IA | < 8s |
| Coste IA por usuario activo | < $2/mes |
| Cobertura de tests backend | > 70% |
| Lighthouse frontend | > 90 en Performance y Accessibility |

---

## 9. No-Objetivos (lo que BOWOL NO es)

Declarar lo que no somos es tan importante como declarar lo que somos. Previene scope creep y expectativas erróneas.

| No es | Por qué lo aclaramos |
|---|---|
| **Un Notion o wiki empresarial** | No competimos con herramientas de documentación. Si el usuario necesita escribir 50 páginas, no es BOWOL. |
| **Un wrapper de ChatGPT** | La IA está orquestada por el ciclo. No es un chat libre sin contexto ni fuentes. |
| **Una agencia de marketing digital** | No gestionamos campañas ni publicamos por el usuario en Fase 1. Damos inteligencia y planificación. |
| **Un CRM o herramienta de ventas** | No gestionamos pipeline ni contactos comerciales. Se integra con CRMs existentes en Fase 3. |
| **Un reemplazo de Jira o Linear** | Los proyectos y sprints son para validar hipótesis estratégicas, no para gestionar backlog de ingeniería a escala. |
| **Un LMS o plataforma educativa** | No damos cursos. Damos herramientas para que los equipos aprendan haciendo. |
| **Una red social o comunidad** | No hay feed social ni interacción entre usuarios en Fase 1. |
| **Un generador masivo de contenido** | La IA genera análisis y recomendaciones, no 100 posts de Instagram por semana. El content copilot es Fase 2 y con enfoque de calidad. |
| **Una herramienta para individuos sin equipo** | El plan Free existe, pero el valor real está en equipos que necesitan coordinarse. |

---

## 10. Checklist de Validación

Antes de aprobar este documento, verificar:

- [ ] El tagline ("Convierte señales del mercado en ejecución medible") está aprobado por el equipo fundador.
- [ ] Los 4 segmentos primarios están priorizados (¿empezamos por startups o por PYMES?).
- [ ] La tabla de competencia no tiene errores factuales sobre los competidores.
- [ ] Los precios de los 4 planes están validados contra costes reales de infraestructura + IA.
- [ ] El North Star Metric ("Proyectos ejecutados por organización por mes") está aprobado.
- [ ] Los KPIs del año 1 son realistas dado el equipo y el presupuesto actual.
- [ ] La lista de No-Objetivos está consensuada (previene discusiones futuras).
- [ ] Todas las referencias cruzadas a otros docs existen.
- [ ] Sin emojis en ninguna sección.
- [ ] El diagrama Mermaid renderiza correctamente en GitHub.

---

**FIN DEL DOCUMENTO `01-PRODUCT-VISION.md`**