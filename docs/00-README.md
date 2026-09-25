# 00 - Índice Maestro de Documentación: BOWOL Platform

> **Guía de Navegación, Estándares de Arquitectura y Especificación Técnica**
>
> v1.0 · Última actualización: 2026-01-XX · Autor: Equipo BOWOL · Estado: Aprobado

---

> **CONTEXTO PARA EL PROGRAMADOR Y AGENTES IA**
>
> Este repositorio contiene la especificación arquitectónica, de producto y técnica completa de **BOWOL Platform**.
> La documentación está dividida en 11 documentos modulares e independientes para evitar sobrecarga de contexto y garantizar alta cohesión por dominio.
>
> **Regla de oro:** La visión y los contratos mandan sobre la implementación. Ninguna línea de código debe contradecir lo especificado en estos 11 documentos.

---

## 1. Mapa de Navegación de Documentos

| # | Documento | Dominio | Descripción |
| :-: | :--- | :--- | :--- |
| **00** | [00-README.md](00-README.md) | **Índice Maestro** | Mapa de navegación, orden de lectura y convenciones globales. |
| **01** | [01-PRODUCT-VISION.md](01-PRODUCT-VISION.md) | **Producto & Visión** | Propuesta de valor, segmentos de usuario, ciclo *Trend $\rightarrow$ Strategy $\rightarrow$ Execution*, North Star y no-objetivos. |
| **02** | [02-ARCHITECTURE.md](02-ARCHITECTURE.md) | **Arquitectura Técnica** | Monolito Modular en Spring Boot 3.x, bounded contexts, límites de módulos y stack tecnológico. |
| **03** | [03-DATABASE.md](03-DATABASE.md) | **Persistencia & RLS** | Modelo relacional PostgreSQL 16 (23 tablas + auditoría), RLS nativo en 3 capas y 14 migraciones Flyway completas. |
| **04** | [04-API-CONTRACT.md](04-API-CONTRACT.md) | **Contrato de API** | Estándar RESTful `/api/v1`, OpenAPI 3.0, RFC 7807 (ProblemDetail), DTOs y respuestas sin wrappers innecesarios. |
| **05** | [05-AI-STRATEGY.md](05-AI-STRATEGY.md) | **Estrategia de IA** | Abstracción `AIProvider` (OpenAI / Anthropic), templates Mustache, grounding estructurado y 4 capas (Dato/Análisis/Hipótesis/Recomendación). |
| **06** | [06-SECURITY.md](06-SECURITY.md) | **Seguridad & RBAC** | JWT asimétrico RS256, rotación de refresh tokens en cookies httpOnly, RBAC de 60 permisos, STRIDE y cumplimiento GDPR. |
| **07** | [07-FRONTEND.md](07-FRONTEND.md) | **Frontend & UI** | SPA React 18, Vite, TypeScript, Design System *Liquid Glass + iOS Minimal*, 5 variantes de botones y cero emojis. |
| **08** | [08-DEVOPS.md](08-DEVOPS.md) | **DevOps & Infra** | Dockerfiles multi-stage, docker-compose, CI/CD en GitHub Actions, hosting (Fly.io, Vercel, Neon), backups y monitoreo. |
| **09** | [09-ROADMAP.md](09-ROADMAP.md) | **Hoja de Ruta** | Fases 0 a 13 con hitos de progreso detallados y checklist de seguimiento de entregables. |
| **10** | [10-GLOSSARY.md](10-GLOSSARY.md) | **Glosario** | Definición canónica de términos de negocio, arquitectura, seguridad y frontend de BOWOL. |

---

## 2. Orden de Lectura Recomendado

Para incorporar el contexto sin fricciones:
1. **Para Product Managers y Founders:** `01-PRODUCT-VISION.md` $\rightarrow$ `09-ROADMAP.md` $\rightarrow$ `10-GLOSSARY.md`.
2. **Para Ingenieros Backend:** `01-PRODUCT-VISION.md` $\rightarrow$ `02-ARCHITECTURE.md` $\rightarrow$ `03-DATABASE.md` $\rightarrow$ `04-API-CONTRACT.md` $\rightarrow$ `05-AI-STRATEGY.md` $\rightarrow$ `06-SECURITY.md`.
3. **Para Ingenieros Frontend & Diseñadores:** `01-PRODUCT-VISION.md` $\rightarrow$ `07-FRONTEND.md` $\rightarrow$ `04-API-CONTRACT.md` $\rightarrow$ `10-GLOSSARY.md`.
4. **Para DevOps / SRE:** `08-DEVOPS.md` $\rightarrow$ `06-SECURITY.md` $\rightarrow$ `03-DATABASE.md`.

---

## 3. Principios Transversales Inquebrantables

1. **Cero Emojis en UI:** Ningún emoji se renderiza en la interfaz. Solo iconografía vectorial consistente de Lucide (`strokeWidth={1.5}`).
2. **Multi-Tenancy Estricto:** Toda petición autenticada viaja con `organization_id` en el JWT. Filtrado automático en aplicación y base de datos (Postgres RLS).
3. **Aislamiento de IA:** Ningún controlador o servicio importa SDKs comerciales. Todo se orquesta mediante el contrato `AIProvider`.
4. **No a la Sobreingeniería Prematura:** Monolito Modular antes que microservicios; PostgreSQL antes que MongoDB; grounding relacional antes que RAG vectorial complejo.
