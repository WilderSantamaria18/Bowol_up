# 09 - Hoja de Ruta Evolutiva (Roadmap)
> **Fases 0 a 13: Desde la Fundación hasta la Escala Enterprise**

---

### FASE 0 — Descubrimiento y Definición Estratégica
- [x] Definición del problema y propuesta de valor de BOWOL.
- [x] Selección del stack tecnológico (Java 21, Spring Boot 3, React 18, Vite, PostgreSQL).
- [x] Diseño conceptual del ciclo *Trend $\rightarrow$ Strategy $\rightarrow$ Execution*.
- [x] Especificación de dominios y división modular.

### FASE 1 — Fundación Técnica y Estructura Base
- [x] Cimentación del repositorio monorepo `bowol-platform`.
- [x] Creación de carpetas modulares para Backend y Frontend.
- [x] Documentación de dominios en `docs/`.
- [x] Configuración de `pom.xml` con dependencias Maven completas (Spring Boot 3.3.4, Flyway, JPA, Security, Lombok, Jackson, JJWT).
- [x] Configuración de `package.json` con dependencias de React 18, Tailwind CSS, Lucide, GSAP y TanStack Query.
- [x] Migraciones Flyway acumulativas (`V1__init_extensions.sql` hasta `V23__create_enterprise_sso.sql`).
- [x] Docker Compose funcional para desarrollo local con PostgreSQL 16.
- [x] Pipelines de CI en GitHub Actions operativos.

### FASE 2 — Identidad, Autenticación y Multi-Tenancy
- [x] Registro de usuario con creación automática de organización inicial.
- [x] Autenticación por correo y contraseña con Spring Security y hashing BCrypt.
- [x] Generación y validación de Access Token (JWT RS256 con claves asimétricas) y Refresh Token con detección de robo y rotación.
- [x] Jerarquía de roles RBAC (Owner, Admin, Manager, Member).
- [x] Contexto de tenant (`organization_id`) inyectado en filtros de seguridad y Row Level Security (RLS) en PostgreSQL.
- [x] Vistas de Login y Registro en Frontend conectadas a la API RESTful.

### FASE 3 — Business Profile & Inteligencia de Negocio
- [x] Flujo de Onboarding paso a paso (`OnboardingWizard`) para nuevas empresas.
- [x] Persistencia del perfil estratégico (industria, objetivos, canales, equipo, tamaño, país).
- [x] Endpoints de consulta y actualización del Business Profile (`/api/v1/business-profile`).
- [x] Dashboard principal ("Executive Cockpit" / "Good Morning") con tarjetas de resumen diario, métricas de ciclo y accesos directos.

### FASE 4 — Trend Engine & Conectores de Fuentes
- [x] Conector para GitHub API (búsqueda de repositorios de IA y métricas de estrellas/forks).
- [x] Conector para YouTube Data API (búsqueda de videos técnicos, canales y vistas).
- [x] Normalizador de datos brutos y cálculo algorítmico del `TrendScore` ponderado.
- [x] Explorador de tendencias en Frontend con filtros por categorías, fuentes y modal de detalle interactivo.

### FASE 5 — AI Research & Análisis Contextualizado
- [x] Implementación de la abstracción `AIProvider` (`OpenAiProvider`, `AnthropicProvider`, `MockAIProvider`).
- [x] Inyección dinámica del Business Profile y contexto corporativo en las plantillas del sistema.
- [x] Motor de evaluación de aplicabilidad y alineación estratégica de tendencias (`TrendRelevanceEvaluator`).
- [x] Generación de informes con citas, etiquetas y evidencias verificables.

### FASE 6 — FODA Dinámico Asistido por IA
- [x] Generación automática de matrices FODA/SWOT a partir de tendencias detectadas y perfil del negocio.
- [x] Interfaz de visualización y edición interactiva de cuadrantes (Fortalezas, Oportunidades, Debilidades, Amenazas).
- [x] Asociación de evidencias y fuentes de mercado a cada elemento del análisis FODA.

### FASE 7 — Opportunity Engine & Priorización
- [x] Conversión automática de hallazgos del FODA en tarjetas de oportunidad estratégicas.
- [x] Cálculo automático de RICE Score (Reach, Impact, Confidence, Effort).
- [x] Interfaz de embudo y priorización de iniciativas estratégicas por impacto.

### FASE 8 — Gestión de Proyectos y Tareas
- [x] Conversión de oportunidades aprobadas en proyectos de innovación formales.
- [x] Gestión de backlog y planificación de sprints ágiles.
- [x] Tablero Kanban interactivo para tareas del equipo (`BACKLOG`, `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `BLOCKED`).
- [x] Asignación de tareas y cálculo de estimaciones de esfuerzo.

### FASE 9 — AI Planner
- [x] Desglose automático asistido por IA de ideas e iniciativas en épicas, historias y tareas ejecutables.
- [x] Sugerencia inteligente de estimaciones de esfuerzo en Story Points y metas de sprint.

### FASE 10 — Calendario Integral
- [x] Vista unificada de calendario para hitos, eventos estratégicos, publicaciones y sprints.
- [x] Integración bidireccional mediante estándar RFC 5545 iCalendar (`.ics`) para Google Calendar y Microsoft Outlook.

### FASE 11 — Social & Brand Intelligence
- [x] Kit de marca (Brand Profile): paleta cromática, tipografías, tono de voz y pilares editoriales.
- [x] Generación de propuestas de contenido adaptadas por canal (LinkedIn, Twitter, Instagram, TikTok) con AI Content Studio.
- [x] Estimación de escenarios de impacto y tasa de engagement basada en métricas proyectadas.

### FASE 12 — Suscripciones SaaS y Monetización
- [x] Planes de suscripción (Free, Pro, Enterprise) y límites de uso por organización.
- [x] Facturación SaaS e historial de invoices con estados de pago (`PAID`, `PENDING`).
- [x] Medición, auditoría (`AIUsageLog`) y control de cuotas mensuales de AI Credits.

### FASE 13 — Enterprise, Single Sign-On (SSO) & Developer Platform
- [x] **Autenticación corporativa Single Sign-On (SSO SAML / OIDC / Google Workspace / Azure AD)**:
  - Modelo relacional `organization_sso_configs` con soporte para dominios corporativos.
  - Endpoints de configuración protegidos para administradores (`/api/v1/organizations/{id}/sso`).
  - Detección de dominio e inicio público de SSO (`/api/v1/auth/sso/initiate`).
  - Callback de autenticación (`/api/v1/auth/sso/callback`) con emisión de pares de tokens JWT y alta automática de miembros.
  - Consola de gestión SSO en Frontend dentro de Organización > Configuración.
  - Botón de acceso con SSO corporativo en pantalla de Login.
- [x] **Registro inmutable de auditoría (Audit Logs SOC 2 / ISO 27001)** con aspecto AOP `@AuditedAction`, exportación CSV/JSON y visor de evidencias forenses.
- [x] **Developer Platform**: API Keys (`bwl_live_...`) con hash SHA-256, revocación instantánea y Token Bucket Rate Limiting.
- [x] **Motor de Webhooks salientes** con firma criptográfica HMAC-SHA256 (`X-Bowol-Signature`), reintentos automáticos e historial de entregas.
- [x] Conexión de eventos en tiempo real del ciclo de innovación a Webhooks:
  - `trend.high_relevance_detected` (Score $\ge 70$)
  - `opportunity.rice_calculated` (Cálculo y derivación RICE)
  - `sprint.completed` (Métricas de sprint y tareas finalizadas)
  - `task.blocked` (Transición a estado BLOCKED)
  - `subscription.credit_threshold_reached` (Consumo $\ge 80\%$ de créditos mensuales)
- [x] Consola Web de Desarrolladores y Auditoría en Frontend (`/audit-logs`, `/settings`).
