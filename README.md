# BOWOL Platform
> **AI Innovation Operating System & Business Copilot**  
> Plataforma SaaS de inteligencia, innovación y ejecución para startups, PYMES y equipos.

---

## 🌟 Visión del Producto

**BOWOL** transforma el flujo de innovación de las organizaciones cerrando la brecha entre la información de mercado y la ejecución tangible:

$$\text{Empresa} \rightarrow \text{Contexto} \rightarrow \text{Tendencias} \rightarrow \text{Oportunidades} \rightarrow \text{FODA} \rightarrow \text{Hipótesis} \rightarrow \text{Experimentos} \rightarrow \text{Sprints & Tareas} \rightarrow \text{Métricas}$$

---

## 📚 Documentación Técnica Canónica (`docs/`)

| # | Documento | Dominio | Descripción |
| :-: | :--- | :--- | :--- |
| **00** | [00-README.md](docs/00-README.md) | **Índice Maestro** | Mapa de navegación, orden de lectura y convenciones globales. |
| **01** | [01-PRODUCT-VISION.md](docs/01-PRODUCT-VISION.md) | **Producto** | Propuesta de valor, segmentos de usuario, ciclo *Trend $\rightarrow$ Strategy $\rightarrow$ Execution* y North Star. |
| **02** | [02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | **Arquitectura** | Monolito Modular en Spring Boot 3.x, bounded contexts y límites de módulos. |
| **03** | [03-DATABASE.md](docs/03-DATABASE.md) | **Persistencia** | Modelo relacional PostgreSQL 16 (23 tablas), RLS nativo en 3 capas y 14 migraciones Flyway. |
| **04** | [04-API-CONTRACT.md](docs/04-API-CONTRACT.md) | **Contrato de API** | Estándar RESTful `/api/v1`, OpenAPI 3.0, RFC 7807 (ProblemDetail) y respuestas sin wrappers. |
| **05** | [05-AI-STRATEGY.md](docs/05-AI-STRATEGY.md) | **Estrategia IA** | Abstracción `AIProvider`, templates Mustache, grounding estructurado y 4 capas. |
| **06** | [06-SECURITY.md](docs/06-SECURITY.md) | **Seguridad** | JWT asimétrico RS256, rotación de refresh tokens en cookies httpOnly, RBAC y GDPR. |
| **07** | [07-FRONTEND.md](docs/07-FRONTEND.md) | **Frontend** | SPA React 18, Vite, TypeScript, Design System *Liquid Glass + iOS Minimal*, 5 botones y cero emojis. |
| **08** | [08-DEVOPS.md](docs/08-DEVOPS.md) | **DevOps & Infra** | Dockerfiles multi-stage, docker-compose, CI/CD en GitHub Actions, hosting y backups. |
| **09** | [09-ROADMAP.md](docs/09-ROADMAP.md) | **Hoja de Ruta** | Fases 0 a 13 con hitos de progreso detallados y checklist evolutivo. |
| **10** | [10-GLOSSARY.md](docs/10-GLOSSARY.md) | **Glosario** | Definición canónica de términos de negocio, arquitectura, datos y seguridad. |

---

## 🛠️ Stack Tecnológico

- **Backend:** Java 21 LTS, Spring Boot 3.2+, Spring Security (JWT RS256), Spring Data JPA, PostgreSQL 16 con RLS, Flyway.
- **Frontend:** React 18, TypeScript 5.5+, Vite 5, Tailwind CSS 3.4 (*Liquid Glass*), TanStack Query 5, Radix UI, Lucide Icons.
- **Infraestructura:** Docker, Docker Compose, GitHub Actions, Fly.io, Vercel, Neon.

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
