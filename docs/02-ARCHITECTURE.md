# 02 - Arquitectura del Sistema
> **Monolito Modular de Alta Cohesión y Bajo Acoplamiento**
>
> v1.0 · Última actualización: 2026-01-XX · Autor: Equipo BOWOL · Estado: Aprobado

---

## 1. Principios Arquitectónicos

1. **Monolito Modular (Modular Monolith):** Todo el backend se despliega como un único artefacto ejecutable en Spring Boot 3.x, pero con separación estricta de 22 módulos de dominio organizados por *bounded contexts*. Esto simplifica la infraestructura inicial (sin complejidad de red, orquestadores ni transacciones distribuidas) permitiendo extraer microservicios en el futuro si la escala lo exige.
2. **Aislamiento Multi-Tenant Estricto:** Toda petición autenticada viaja con el contexto de la organización (`organization_id`) extraído del JWT. Ninguna consulta puede acceder a datos cruzados entre empresas (defensa en 3 capas: JWT + Hibernate Filter + Postgres RLS).
3. **Desacoplamiento de IA (`AIProvider`):** La lógica de negocio jamás invoca directamente SDKs propietarios (OpenAI, Anthropic). Todo pasa por contratos de abstracción.
4. **Separación de Responsabilidades:** Dominio, Aplicación, Infraestructura y Presentación estrictamente diferenciados.
5. **Contrato First con OpenAPI:** Frontend y Backend coordinados mediante especificaciones OpenAPI v3 y errores normalizados RFC 7807 (`ProblemDetail`).

---

## 2. Diagrama Lógico de la Plataforma

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (SPA - React 18)                       │
│      React Router  •  TanStack Query  •  Tailwind CSS  •  Zustand      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST JSON (JWT Bearer)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SPRING BOOT 3.x MODULAR MONOLITH                     │
├────────────────────────────────────────────────────────────────────────┤
│  Spring Security & JWT Filter  •  Global Exception Handler (RFC 7807)  │
├────────────────────────────────────────────────────────────────────────┤
│                       MÓDULOS DE NEGOCIO                               │
│                                                                        │
│  [auth]           [user]          [organization]    [businessprofile]  │
│  [subscription]   [trend]         [source]          [research]         │
│  [ai]             [swot]          [opportunity]     [hypothesis]       │
│  [experiment]     [project]       [sprint]          [task]             │
│  [social]         [brand]         [calendar]        [integration]      │
│  [notification]   [audit]         [shared]                             │
├───────────────────────────────────┬────────────────────────────────────┤
│         PERSISTENCIA              │           ORQUESTACIÓN IA          │
│    Spring Data JPA / Hibernate    │        AIProvider Abstraction      │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
       ┌────────────────────┐             ┌─────────────────────────┐
       │   PostgreSQL 16    │             │  OpenAI / Anthropic /   │
       │  (Multi-Tenant DB) │             │     Local LLM API       │
       └────────────────────┘             └─────────────────────────┘
```

---

## 3. Catálogo y Responsabilidades de Módulos (22 Módulos + Shared)

| Módulo | Responsabilidad Principal |
| :--- | :--- |
| `auth` | Autenticación, generación y refresco de tokens JWT (RS256), recuperación de credenciales y sesiones. |
| `user` | Perfiles de usuario, credenciales, avatares y configuración personal. |
| `organization` | Gestión de organizaciones/tenants, workspaces y membresías de equipo (`membership` absorbido). |
| `businessprofile`| Perfil estratégico: industria, objetivos, tamaño, canales, audiencia y nivel de madurez. |
| `subscription` | Planes de suscripción SaaS (Free, Pro, Business), control de cuotas y créditos de IA. |
| `trend` | Detección, normalización, cálculo de TrendScore y categorización de tendencias globales. |
| `source` | Conectores a fuentes externas (GitHub API, YouTube Data API, feeds, agregadores). |
| `research` | Asistente de investigación profunda, generación de informes y grounding con evidencias. |
| `ai` | Abstracción `AIProvider`, gestión de templates de prompts en Mustache, orquestación y balanceo. |
| `swot` | Creación, versionado y análisis de matrices FODA/SWOT vinculadas a evidencias. |
| `opportunity` | Motor de identificación, evaluación algorítmica RICE y priorización de iniciativas. |
| `hypothesis` | Formulación estructurada de hipótesis de negocio derivadas de oportunidades. |
| `experiment` | Diseño, ejecución y medición de experimentos que validan hipótesis. |
| `project` | Proyectos estratégicos, definición de metas, epics y portafolio de innovación. |
| `sprint` | Planificación ágil de ciclos iterativos, cálculo de velocidad y control de estados. |
| `task` | Gestión de tareas, asignación de responsables, prioridades, etiquetas y tablero Kanban. |
| `social` | Inteligencia de contenido social, escenarios de impacto histórico y borradores de posts. |
| `brand` | Identidad de marca: paleta de colores, tipografías, tono de voz y pautas de estilo. |
| `calendar` | Calendario unificado de hitos, entregables, sprints y eventos de innovación. |
| `integration` | Gestión de credenciales OAuth2 y webhooks para plataformas de terceros (Google, GitHub, Stripe). |
| `notification` | Notificaciones en la aplicación, webhooks y alertas por correo electrónico. |
| `audit` | Registro inmutable de eventos críticos de seguridad y cambios organizacionales (`audit_logs`). |
| `shared` | Utilitarios transversales, DTOs comunes, excepciones globales y filtros de seguridad. |

---

## 4. Estructura Interna Estándar de cada Módulo

Cada módulo backend mantiene autonomía siguiendo el patrón:
```
com.bowol.<modulo>/
├── controller/     # Endpoints REST (@RestController)
├── service/        # Lógica de negocio e interfaces de servicio
├── repository/     # Repositorios Spring Data JPA
├── entity/         # Entidades de base de datos (@Entity)
├── dto/            # Request y Response DTOs inmutables (Java Records)
├── mapper/         # Mapeo DTO <-> Entity con MapStruct
├── exception/      # Excepciones específicas del dominio
└── config/         # Configuraciones internas del módulo (si aplica)
```
