# 09 - Hoja de Ruta Evolutiva (Roadmap)
> **Fases 0 a 13: Desde la Fundación hasta la Escala Enterprise**

---

### FASE 0 — Descubrimiento y Definición Estratégica (1 Semana)
- [x] Definición del problema y propuesta de valor de BOWOL.
- [x] Selección del stack tecnológico (Java 21, Spring Boot 3, React 18, Vite, PostgreSQL).
- [x] Diseño conceptual del ciclo *Trend $\rightarrow$ Strategy $\rightarrow$ Execution*.
- [x] Especificación de dominios y división modular.

### FASE 1 — Fundación Técnica y Estructura Base (Semanas 1-2)
- [x] Cimentación del repositorio monorepo `bowol-platform`.
- [x] Creación de carpetas modulares para Backend y Frontend.
- [x] Documentación de dominios en `docs/`.
- [ ] Configuración de `pom.xml` con dependencias Maven completas.
- [ ] Configuración de `package.json` con dependencias de React y Tailwind.
- [ ] Migración Flyway inicial (`V1__init_schema.sql`).
- [ ] Docker Compose funcional para desarrollo local.
- [ ] Pipelines de CI en GitHub Actions operativos.

### FASE 2 — Identidad, Autenticación y Multi-Tenancy (Semanas 3-4)
- [ ] Registro de usuario con creación automática de organización.
- [ ] Autenticación por correo y contraseña con Spring Security.
- [ ] Generación y validación de Access Token (JWT RS256) y Refresh Token.
- [ ] Jerarquía de roles RBAC (Owner, Admin, Manager, Member).
- [ ] Contexto de tenant (`organization_id`) en filtros de seguridad.
- [ ] Vistas de Login y Registro en Frontend conectadas a la API.

### FASE 3 — Business Profile & Inteligencia de Negocio (Semanas 5-6)
- [ ] Flujo de Onboarding paso a paso para nuevas empresas.
- [ ] Persistencia del perfil estratégico (industria, objetivos, canales, equipo).
- [ ] Endpoints de consulta y actualización del Business Profile.
- [ ] Dashboard principal ("Good Morning") con tarjetas de resumen diario.

### FASE 4 — Trend Engine & Conectores de Fuentes (Semanas 7-9)
- [ ] Conector para GitHub API (búsqueda de repositorios de IA y métricas de estrellas).
- [ ] Conector para YouTube Data API (búsqueda de videos técnicos y vistas).
- [ ] Normalizador de datos brutos y cálculo del `TrendScore`.
- [ ] Explorador de tendencias en Frontend con filtros y categorías.

### FASE 5 — AI Research & Análisis Contextualizado (Semanas 10-11)
- [ ] Implementación de la abstracción `AIProvider` (OpenAI / Anthropic).
- [ ] Inyección dinámica del Business Profile en los prompts del sistema.
- [ ] Motor de evaluación de aplicabilidad de tendencias.
- [ ] Generación de informes con citas y evidencias verificables.

### FASE 6 — FODA Dinámico Asistido por IA (Semana 12)
- [ ] Generación automática de matrices FODA/SWOT a partir de tendencias y contexto.
- [ ] Interfaz de visualización y edición interactiva de cuadrantes.
- [ ] Asociación de evidencias a cada fortaleza, debilidad, oportunidad o amenaza.

### FASE 7 — Opportunity Engine & Priorización (Semana 13)
- [ ] Conversión de hallazgos del FODA en tarjetas de oportunidad.
- [ ] Cálculo automático de RICE Score (Reach, Impact, Confidence, Effort).
- [ ] Interfaz de embudo y priorización de iniciativas estratégicas.

### FASE 8 — Gestión de Proyectos y Tareas (Semanas 14-16)
- [ ] Conversión de oportunidades en proyectos formales.
- [ ] Gestión de backlog y planificación de sprints.
- [ ] Tablero Kanban interactivo para tareas del equipo.
- [ ] Asignación de tareas a miembros de la organización.

### FASE 9 — AI Planner (Semanas 17-18)
- [ ] Desglose automático de ideas vagas en epics, historias y tareas ejecutables.
- [ ] Sugerencia inteligente de estimaciones de esfuerzo y metas de sprint.

### FASE 10 — Calendario Integral (Semanas 19-20)
- [x] Vista unificada de calendario para hitos, eventos y sprints.
- [x] Integración bidireccional con Google Calendar y Microsoft Outlook (RFC 5545 iCalendar `.ics`).

### FASE 11 — Social & Brand Intelligence (Semanas 21-24)
- [x] Kit de marca (Brand Profile): paleta, tipografías y tono de voz.
- [x] Generación de propuestas de contenido adaptadas a canales sociales.
- [x] Estimación de escenarios de impacto basada en métricas históricas.

### FASE 12 — Suscripciones SaaS y Monetización (Semanas 25-27)
- [ ] Planes de suscripción (Free, Pro, Business) y límites de uso.
- [ ] Integración con pasarela de pago (Stripe / MercadoPago).
- [ ] Medición y descuento de AI Credits en llamadas a modelos.

### FASE 13 — Enterprise & Escalado (Fase Posterior)
- [ ] Autenticación corporativa Single Sign-On (SSO SAML / OIDC).
- [ ] Registro inmutable de auditoría (Audit Logs).
- [ ] APIs públicas con rate limiting y webhooks salientes.
