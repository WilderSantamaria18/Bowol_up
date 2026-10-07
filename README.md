# BOWOL Platform
> **Planificador Inteligente de Actividades & Automatización de Tareas para Emprendimientos y Pequeñas Empresas (PYMES)**  
> Plataforma SaaS para estructurar, automatizar y ejecutar el sistema de planificación de tu negocio con asistencia de IA.

---

## 🌟 Visión del Producto

**BOWOL** nace para resolver el problema más común de los emprendedores y pequeñas empresas: **la falta de un sistema ágil y automatizado para planificar sus actividades diarias, semanales y estratégicas**.

En lugar de perder horas organizando tareas a mano, lidiando con notas dispersas en WhatsApp o intentando adaptarse a herramientas corporativas complejas, **BOWOL** ofrece un sistema integral diseñado para automatizar las tareas básicas de planificación:

$$\text{Emprendimiento} \rightarrow \text{Objetivo / Meta} \rightarrow \text{Desglose IA de Actividades} \rightarrow \text{Priorización} \rightarrow \text{Tablero Kanban \& Calendario} \rightarrow \text{Sprints Semanales} \rightarrow \text{Resultados}$$

### 🎯 Lo que Bowol resuelve para tu negocio:
1. **Automatización de la planificación básica:** Desglosa proyectos, campañas o lanzamientos en actividades concretas, estimaciones de tiempo y responsables con un solo clic asistido por IA.
2. **Organización del día a día:** Tableros Kanban intuitivos para saber qué hacer hoy, qué está en progreso y qué está completado.
3. **Calendario y tareas recurrentes:** Control centralizado de fechas límites, pagos, entregas y tareas operativas periódicas sin olvidos.
4. **Priorización inteligente:** Identificación rápida de tareas de alto impacto vs. tareas urgentes para enfocar los recursos donde más rinden.
5. **Tu propio sistema de trabajo:** Una solución profesional, moderna y accesible para que cualquier pequeña empresa opere como una compañía organizada desde el primer día.

---

## 📚 Documentación Técnica Canónica (`docs/`)

| # | Documento | Dominio | Descripción |
| :-: | :--- | :--- | :--- |
| **00** | [00-README.md](docs/00-README.md) | **Índice Maestro** | Mapa de navegación, orden de lectura y convenciones globales. |
| **01** | [01-PRODUCT-VISION.md](docs/01-PRODUCT-VISION.md) | **Producto** | Propuesta de valor para PYMES, casos de uso, ciclo de planificación y North Star. |
| **02** | [02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | **Arquitectura** | Monolito Modular en Spring Boot 3.x, bounded contexts y límites de módulos. |
| **03** | [03-DATABASE.md](docs/03-DATABASE.md) | **Persistencia** | Modelo relacional PostgreSQL 16, RLS nativo multi-tenant y migraciones Flyway. |
| **04** | [04-API-CONTRACT.md](docs/04-API-CONTRACT.md) | **Contrato de API** | Estándar RESTful `/api/v1`, OpenAPI 3.0, RFC 7807 (ProblemDetail) y DTOs canónicos. |
| **05** | [05-AI-STRATEGY.md](docs/05-AI-STRATEGY.md) | **Estrategia IA** | Abstracción `AIProvider`, generación de planes de actividades, prompts y grounding. |
| **06** | [06-SECURITY.md](docs/06-SECURITY.md) | **Seguridad** | JWT asimétrico RS256, rotación de refresh tokens en cookies httpOnly y aislamiento de datos. |
| **07** | [07-FRONTEND.md](docs/07-FRONTEND.md) | **Frontend** | SPA React 18, Vite, TypeScript, Design System *Liquid Glass*, componentes y flujos. |
| **08** | [08-DEVOPS.md](docs/08-DEVOPS.md) | **DevOps & Infra** | Dockerfiles multi-stage, docker-compose, CI/CD en GitHub Actions y despliegue. |
| **09** | [09-ROADMAP.md](docs/09-ROADMAP.md) | **Hoja de Ruta** | Fases evolutivas del producto e hitos de desarrollo para Bowol. |
| **10** | [10-GLOSSARY.md](docs/10-GLOSSARY.md) | **Glosario** | Definición canónica de términos de negocio, planificación, arquitectura y datos. |

---

## 🛠️ Stack Tecnológico

- **Backend:** Java 21 LTS, Spring Boot 3.2+, Spring Security (JWT RS256), Spring Data JPA, PostgreSQL 16 con RLS, Flyway.
- **Frontend:** React 18, TypeScript 5.5+, Vite 5, Tailwind CSS 3.4 (*Liquid Glass*), TanStack Query 5, Lucide Icons, Framer Motion.
- **Infraestructura:** Docker, Docker Compose, GitHub Actions, PostgreSQL.

---

## 🚀 Inicio Rápido Local

### 1. Variables de Entorno
```bash
cp .env.example .env
```

### 2. Levantar Todo el Stack con Docker Compose
```bash
docker compose up -d
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080/api/v1`
- **Health Check:** `http://localhost:8080/actuator/health`
- **Swagger / OpenAPI:** `http://localhost:8080/swagger-ui.html`
- **Adminer (Gestión DB):** `http://localhost:8081`
- **Mailhog (Emails locales):** `http://localhost:8025`

---

## 📖 Documentación Canónica y Guía de Prompts

- **Guía de Prompts para ChatGPT:** [docs/BOWOL_PROMPTS_PLANIFICACION_POR_FASES.md](docs/BOWOL_PROMPTS_PLANIFICACION_POR_FASES.md) (manual para generar planes operativos por fases).
- **Índice de Arquitectura y Especificación:** [docs/00-README.md](docs/00-README.md).
