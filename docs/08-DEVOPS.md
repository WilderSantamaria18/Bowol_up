# 08 - DevOps, Infraestructura y CI/CD

> **Dockerización, Ambientes, GitHub Actions, Monitoring y Backups**
>
> v1.0 · Última actualización: 2026-01-XX · Autor: Equipo BOWOL · Estado: Aprobado

---

> **CONTEXTO PARA EL PROGRAMADOR**
>
> Este documento define **cómo se despliega, monitorea y mantiene BOWOL**. Toda decisión de infraestructura está aquí; ninguna se inventa en el momento.
>
> **Reglas duras que NO se negocian:**
> - Ningún secreto va en el repositorio. Ni siquiera en tests. Todo va por variables de entorno o GitHub Secrets.
> - Ningún merge a `main` sin CI verde.
> - Ningún deploy a producción sin pasar por staging.
> - Ninguna migración Flyway se corre manualmente en producción. Siempre las ejecuta Spring Boot al arrancar.
> - Ningún deploy a producción sin backup previo de la BD.
> - Todo servicio expone `/actuator/health/liveness` y `/actuator/health/readiness`.
> - Todo log va en formato JSON estructurado con `traceId`.
>
> Referencias cruzadas:
> - Arquitectura backend: `02-ARCHITECTURE.md`
> - Base de datos y migraciones: `03-DATABASE.md`
> - Contrato de API: `04-API-CONTRACT.md`
> - Seguridad (secretos, TLS): `06-SECURITY.md`
> - Frontend y build: `07-FRONTEND.md`

---

## 1. Ambientes

### 1.1 Los 4 ambientes

| Ambiente | Propósito | Base de datos | URL | Datos |
|---|---|---|---|---|
| **Local** | Desarrollo diario | PostgreSQL en Docker | `localhost:3000` / `localhost:8080` | Seed + fixtures |
| **CI** | Tests automáticos en cada PR | PostgreSQL efímero (Testcontainers o service container) | — | Fixtures por test |
| **Staging** | Validación pre-producción | PostgreSQL gestionado (Neon branch) | `staging.bowol.com` | Copia anonimizada de prod |
| **Producción** | Usuarios reales | PostgreSQL gestionado (Neon main / AWS RDS) | `bowol.com` / `app.bowol.com` | Reales |

### 1.2 Reglas entre ambientes

1. **Staging es un espejo de prod.** Mismo stack, mismos proveedores, misma versión de la app.
2. **Los datos de staging son copia anonimizada de prod.** Nunca datos reales sin anonimizar.
3. **Prod nunca se toca directamente.** Toda acción es vía CI/CD o consola del proveedor con auditoría.
4. **Los secretos son distintos por ambiente.** Las API keys de OpenAI en staging son distintas a prod.

### 1.3 Proveedores elegidos

| Componente | Local | Staging | Producción |
|---|---|---|---|
| **Backend** | Docker Compose | Fly.io o Railway | Fly.io o Railway |
| **Frontend** | Vite dev server | Vercel o Cloudflare Pages | Vercel o Cloudflare Pages |
| **Base de datos** | PostgreSQL 16 (Docker) | Neon (branch staging) | Neon (main) o AWS RDS |
| **Storage de archivos** | Local / MinIO | Cloudflare R2 | Cloudflare R2 |
| **Cache/Colas** | In-memory | In-memory | Redis (Upstash) — Fase 2 |
| **Email transaccional** | Mailhog | Resend | Resend |
| **Error tracking** | Console | Sentry (dev) | Sentry (prod) |
| **Analytics** | — | Plausible (dev) | Plausible (prod) |

**Decisión MVP:** Fly.io para backend (más simple que AWS, escala bien hasta 50k usuarios), Vercel para frontend, Neon para PostgreSQL (branching de BD es ideal para staging).

---

## 2. Contenedorización con Docker

### 2.1 Backend (`backend/Dockerfile`)

Multi-stage build optimizado:

```dockerfile
# ============================================================
# STAGE 1: Build
# ============================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copiar solo pom.xml primero para aprovechar el cache de capas
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el resto y compilar sin tests (los tests corren en CI)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
# STAGE 2: Runtime
# ============================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Actualizar y crear usuario no-root
RUN apk add --no-cache curl tzdata && \
    addgroup -S bowol && \
    adduser -S bowol -G bowol

WORKDIR /app

# Copiar el jar
COPY --from=build /app/target/*.jar app.jar

# Cambiar a usuario no-root
USER bowol

EXPOSE 8080

# Health check nativo de Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health/liveness || exit 1

# JVM tuning para contenedores
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
```

**Reglas:**
- **Nunca `latest` tag** en producción. Siempre `1.2.3` o SHA del commit.
- **Usuario no-root** obligatorio.
- **Timezone UTC** dentro del contenedor.
- **`ExitOnOutOfMemoryError`** para que el orquestador reinicie el contenedor si hay OOM.

### 2.2 Frontend (`frontend/Dockerfile`)

```dockerfile
# ============================================================
# STAGE 1: Build
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Cache de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código y buildear
COPY . .
RUN npm run build

# ============================================================
# STAGE 2: Runtime (Nginx Alpine)
# ============================================================
FROM nginx:1.27-alpine AS runtime

# Configuración custom de Nginx para SPA
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar assets construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**`frontend/nginx.conf`:**

```nginx
worker_processes auto;

events { worker_connections 1024; }

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    server_tokens off;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript 
               text/javascript application/xml+rss image/svg+xml;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache agresivo para assets con hash
        location ~* \.(js|css|woff2|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Sin cache para index.html
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # Health check
        location = /health {
            access_log off;
            return 200 "ok\n";
        }
    }
}
```

### 2.3 `.dockerignore`

`backend/.dockerignore`:

```
target/
.git/
.idea/
*.iml
.env
.env.*
!.env.example
docs/
README.md
```

`frontend/.dockerignore`:

```
node_modules/
dist/
.git/
.idea/
.vscode/
.env
.env.*
!.env.example
```

### 2.4 Docker Compose para desarrollo local

`docker-compose.yml`:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: bowol-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: bowol
      POSTGRES_PASSWORD: bowol_dev_password
      POSTGRES_DB: bowol_db
      TZ: America/Lima
      PGTZ: America/Lima
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bowol -d bowol_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - bowol-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: runtime
    container_name: bowol-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/bowol_db
      SPRING_DATASOURCE_USERNAME: bowol
      SPRING_DATASOURCE_PASSWORD: bowol_dev_password
      JWT_PRIVATE_KEY_PATH: /run/secrets/jwt_private_key
      JWT_PUBLIC_KEY_PATH: /run/secrets/jwt_public_key
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "8080:8080"
      - "5005:5005"  # Debug remoto
    volumes:
      - ./infra/secrets:/run/secrets:ro
    networks:
      - bowol-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: runtime
    container_name: bowol-frontend
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:8080/api/v1
    ports:
      - "3000:80"
    networks:
      - bowol-network

  mailhog:
    image: mailhog/mailhog:latest
    container_name: bowol-mailhog
    restart: unless-stopped
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI
    networks:
      - bowol-network

  adminer:
    image: adminer:latest
    container_name: bowol-adminer
    restart: unless-stopped
    depends_on:
      - postgres
    ports:
      - "8081:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    networks:
      - bowol-network

volumes:
  postgres_data:
    driver: local

networks:
  bowol-network:
    driver: bridge
```

**Servicios incluidos:**

| Servicio | Puerto | Propósito |
|---|---|---|
| `postgres` | 5432 | Base de datos principal |
| `backend` | 8080 | API REST + debug en 5005 |
| `frontend` | 3000 | SPA en Nginx |
| `mailhog` | 1025/8025 | Captura emails en desarrollo |
| `adminer` | 8081 | UI web para explorar BD |

**Comandos habituales:**

```bash
# Levantar todo
docker compose up -d

# Ver logs de un servicio
docker compose logs -f backend

# Reconstruir solo backend
docker compose up -d --build backend

# Ejecutar migraciones (automático al arrancar backend)
# No hay comando manual: Spring Boot + Flyway lo hacen al iniciar

# Conectar a la BD con psql
docker compose exec postgres psql -U bowol -d bowol_db

# Bajar todo (mantener volúmenes)
docker compose down

# Bajar todo y borrar datos
docker compose down -v
```

---

## 3. Estrategia de Branching

### 3.1 Modelo: Trunk-Based Development con release branches

```text
main          ───●──────────●──────────●───────►  (producción)
                 │          │          │
                 │          │          └─ tag v1.2.0
                 │          └─ tag v1.1.0
                 └─ tag v1.0.0
                 
develop       ───●───●───●───●───●───●───────►  (staging)
                  \  ↑   \  ↑   \  ↑
feature/*          ●─┘    ●─┘    ●─┘
                   
hotfix/*      ────────────●─────────────────►  (merge directo a main + develop)
```

### 3.2 Reglas

| Rama | Propósito | Merge a | Deploy |
|---|---|---|---|
| `main` | Código en producción | — | Prod (manual con tag) |
| `develop` | Integración continua | `main` (con tag) | Staging (automático) |
| `feature/<nombre>` | Nueva feature | `develop` (vía PR) | Preview (opcional) |
| `hotfix/<nombre>` | Arreglo urgente en prod | `main` + `develop` | Prod inmediato |

**Reglas duras:**
1. **`main` está protegida:** no se pushea directo. Solo merge de PRs.
2. **`develop` está protegida:** idem.
3. **Todo PR requiere al menos 1 aprobación** (2 si toca `shared/` o seguridad).
4. **CI debe pasar** antes de merge.
5. **No se hace `force push`** en `main` ni `develop`.
6. **Las ramas `feature/*` se borran** tras el merge.

### 3.3 Naming de ramas

```
feature/BOW-123-add-swot-generator
feature/BOW-124-trend-search-ui
hotfix/BOW-125-fix-jwt-expiry
chore/BOW-126-update-dependencies
docs/BOW-127-api-contract-update
```

**Formato:** `<tipo>/<ticket>-<descripcion-corta-kebab-case>`

**Tipos:** `feature`, `hotfix`, `chore`, `docs`, `refactor`, `test`, `perf`.

---

## 4. Convención de Commits

### 4.1 Conventional Commits

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos permitidos:**

| Tipo | Uso | Ejemplo |
|---|---|---|
| `feat` | Nueva feature | `feat(swot): add AI-generated FODA` |
| `fix` | Corrección de bug | `fix(auth): resolve refresh token rotation` |
| `chore` | Tareas de mantenimiento | `chore(deps): bump spring-boot to 3.2.5` |
| `docs` | Cambios en documentación | `docs(api): update opportunities endpoints` |
| `refactor` | Cambio sin alterar funcionalidad | `refactor(task): simplify position logic` |
| `test` | Añadir o modificar tests | `test(auth): add refresh reuse detection` |
| `perf` | Mejora de rendimiento | `perf(trends): add GIN index on search_vector` |
| `style` | Formato, sin cambio funcional | `style: apply prettier` |
| `build` | Cambios en build system | `build: add Docker multi-stage` |
| `ci` | Cambios en CI/CD | `ci: add frontend type-check step` |
| `revert` | Revertir un commit | `revert: feat(swot): add AI-generated FODA` |

**Scope:** nombre del módulo afectado (`auth`, `swot`, `trends`, `tasks`, `api`, `deps`, `docker`, etc.).

**Reglas:**
- Descripción en **imperativo presente** ("add", no "added" ni "adds").
- Sin punto final.
- Máximo 72 caracteres en la primera línea.
- El cuerpo (si lo hay) explica **qué** y **por qué**, no **cómo**.

**Breaking changes:** añadir `!` después del scope + footer `BREAKING CHANGE:`

```
feat(api)!: change response format to RFC 7807

BREAKING CHANGE: All error responses now follow RFC 7807.
Frontend must be updated to consume the new format.
```

### 4.2 Changelog automático

Uso de **git-cliff** o **release-please** para generar `CHANGELOG.md` automáticamente al crear un tag.

```text
## [1.2.0] - 2026-03-15

### Added
- AI-generated FODA from trends (#123)
- Multi-language support in trends (#145)

### Fixed
- Refresh token rotation on concurrent requests (#156)

### Changed
- Upgraded Spring Boot to 3.2.5 (#160)
```

---

## 5. Versionado Semántico

### 5.1 Esquema `MAJOR.MINOR.PATCH`

| Cambio | Bump | Ejemplo |
|---|---|---|
| Breaking change en API | MAJOR | `1.0.0 → 2.0.0` |
| Nueva feature sin romper API | MINOR | `1.2.0 → 1.3.0` |
| Bugfix sin romper API | PATCH | `1.2.0 → 1.2.1` |

**Tags de git:** `v1.2.0` (con `v` prefijo).

**Tag en Docker:** `bowol/backend:1.2.0` y `bowol/backend:sha-abc123`.

### 5.2 Cuándo crear un tag

- Al mergear `develop` → `main` (release planificado).
- Al aplicar un hotfix en `main`.
- NUNCA desde una rama `feature/*`.

---

## 6. CI/CD con GitHub Actions

### 6.1 Estructura de workflows

```text
.github/workflows/
├── backend-ci.yml           # Tests backend en cada PR
├── frontend-ci.yml          # Tests frontend en cada PR
├── security-scan.yml        # Dependabot + CodeQL semanal
├── deploy-staging.yml       # Deploy automático a staging desde develop
└── deploy-production.yml    # Deploy manual a producción desde tag
```

### 6.2 Backend CI (`.github/workflows/backend-ci.yml`)

```yaml
name: Backend CI

on:
  push:
    branches: [main, develop]
    paths: ['backend/**', '.github/workflows/backend-ci.yml']
  pull_request:
    branches: [main, develop]
    paths: ['backend/**']

concurrency:
  group: backend-ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: bowol
          POSTGRES_PASSWORD: bowol
          POSTGRES_DB: bowol_test
        ports: [5432:5432]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven

      - name: Make mvnw executable
        run: chmod +x backend/mvnw

      - name: Run unit + integration tests
        working-directory: backend
        run: ./mvnw verify -B -Dspring.profiles.active=test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: backend/target/site/jacoco/jacoco.xml
          fail_ci_if_error: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: backend-test-results
          path: backend/target/surefire-reports/
```

### 6.3 Frontend CI (`.github/workflows/frontend-ci.yml`)

```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]
    paths: ['frontend/**', '.github/workflows/frontend-ci.yml']
  pull_request:
    branches: [main, develop]
    paths: ['frontend/**']

concurrency:
  group: frontend-ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Type check
        working-directory: frontend
        run: npm run typecheck

      - name: Lint
        working-directory: frontend
        run: npm run lint

      - name: Unit tests
        working-directory: frontend
        run: npm run test -- --run

      - name: Build
        working-directory: frontend
        run: npm run build

      - name: Install Playwright browsers
        working-directory: frontend
        run: npx playwright install --with-deps chromium

      - name: E2E tests
        working-directory: frontend
        run: npm run test:e2e

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

### 6.4 Deploy a Staging (`.github/workflows/deploy-staging.yml`)

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.bowol.com

    steps:
      - uses: actions/checkout@v4

      - name: Setup Fly CLI
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy backend to Fly.io
        run: flyctl deploy --remote-only --config backend/fly.staging.toml
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

      - name: Deploy frontend to Vercel
        run: |
          npm install -g vercel
          vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: frontend

      - name: Run migrations
        run: |
          # Fly.io corre las migraciones automáticamente al arrancar Spring Boot
          flyctl ssh console -a bowol-backend-staging -C "curl -f http://localhost:8080/actuator/health/readiness"

      - name: Smoke test
        run: |
          sleep 10
          curl -f https://staging.bowol.com/api/v1/health

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deploy ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 6.5 Deploy a Producción (`.github/workflows/deploy-production.yml`)

```yaml
name: Deploy to Production

on:
  push:
    tags: ['v*.*.*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://bowol.com

    steps:
      - uses: actions/checkout@v4

      - name: Setup Fly CLI
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Backup database
        run: |
          flyctl ssh console -a bowol-postgres -C \
            "pg_dump -U bowol bowol_db | gzip > /tmp/backup-$(date +%Y%m%d-%H%M%S).sql.gz"

      - name: Deploy backend
        run: flyctl deploy --remote-only --config backend/fly.prod.toml
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

      - name: Deploy frontend
        run: |
          npm install -g vercel
          vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: frontend

      - name: Verify readiness
        run: |
          for i in {1..30}; do
            if curl -sf https://api.bowol.com/actuator/health/readiness; then
              echo "Ready"
              exit 0
            fi
            sleep 5
          done
          echo "Timeout"
          exit 1

      - name: Smoke test
        run: |
          curl -f https://api.bowol.com/api/v1/health
          curl -f https://bowol.com/

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Prod deploy ${{ github.ref_name }} ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Rollback on failure
        if: failure()
        run: |
          flyctl releases --app bowol-backend
          flyctl deploy --image $(flyctl releases --app bowol-backend --json | jq -r '.[1].ImageRef')
```

### 6.6 Security Scan (`.github/workflows/security-scan.yml`)

```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 3 * * 1'  # lunes 3am UTC
  workflow_dispatch:

jobs:
  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read

    strategy:
      matrix:
        language: [java, javascript-typescript]

    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'BOWOL'
          path: '.'
          format: 'SARIF'
          args: >-
            --enableRetired
            --failOnCVSS 7

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: reports/dependency-check-report.sarif
```

---

## 7. Variables de Entorno

### 7.1 Backend

| Variable | Descripción | Ejemplo | Secret |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Perfil de Spring | `prod` | ❌ |
| `SPRING_DATASOURCE_URL` | JDBC URL de PostgreSQL | `jdbc:postgresql://...` | ✅ |
| `SPRING_DATASOURCE_USERNAME` | Usuario BD | `bowol` | ✅ |
| `SPRING_DATASOURCE_PASSWORD` | Password BD | `...` | ✅ |
| `JWT_PRIVATE_KEY_PATH` | Ruta de la clave privada RS256 | `/run/secrets/jwt_private_key` | ✅ |
| `JWT_PUBLIC_KEY_PATH` | Ruta de la clave pública RS256 | `/run/secrets/jwt_public_key` | ❌ |
| `JWT_ACCESS_TTL` | TTL del access token (segundos) | `900` | ❌ |
| `JWT_REFRESH_TTL` | TTL del refresh token (segundos) | `604800` | ❌ |
| `OPENAI_API_KEY` | API key de OpenAI | `sk-...` | ✅ |
| `ANTHROPIC_API_KEY` | API key de Anthropic | `sk-ant-...` | ✅ |
| `STRIPE_SECRET_KEY` | Secret de Stripe | `sk_live_...` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook de Stripe | `whsec_...` | ✅ |
| `TOKEN_ENCRYPTION_KEY` | Clave AES-256-GCM | `base64...` | ✅ |
| `RESEND_API_KEY` | API key de Resend (email) | `re_...` | ✅ |
| `SENTRY_DSN` | DSN de Sentry | `https://...` | ✅ |
| `CORS_ALLOWED_ORIGINS` | Origins permitidos (CSV) | `https://bowol.com` | ❌ |
| `RATE_LIMIT_ENABLED` | Activar rate limiting | `true` | ❌ |
| `LOG_LEVEL` | Nivel de log | `INFO` | ❌ |

### 7.2 Frontend

| Variable | Descripción | Ejemplo | Secret |
|---|---|---|---|
| `VITE_API_URL` | URL base de la API | `https://api.bowol.com/api/v1` | ❌ |
| `VITE_APP_NAME` | Nombre de la app | `BOWOL` | ❌ |
| `VITE_SENTRY_DSN` | DSN de Sentry | `https://...` | ❌ |
| `VITE_POSTHOG_KEY` | API key de PostHog | `phc_...` | ❌ |
| `VITE_PLAUSIBLE_DOMAIN` | Dominio de Plausible | `bowol.com` | ❌ |

**Regla:** todo lo que va con prefijo `VITE_` es **público** (queda en el bundle). Nunca meter secretos ahí.

### 7.3 `.env.example`

```bash
# ============================================================
# BACKEND
# ============================================================
SPRING_PROFILES_ACTIVE=dev
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/bowol_db
SPRING_DATASOURCE_USERNAME=bowol
SPRING_DATASOURCE_PASSWORD=bowol_dev_password

JWT_PRIVATE_KEY_PATH=./infra/secrets/jwt_private_key.pem
JWT_PUBLIC_KEY_PATH=./infra/secrets/jwt_public_key.pem
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=604800

OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

STRIPE_SECRET_KEY=sk_test_your-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-secret-here

TOKEN_ENCRYPTION_KEY=generate-with-openssl-rand-base64-32
RESEND_API_KEY=re_your-key-here

SENTRY_DSN=
CORS_ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_ENABLED=false
LOG_LEVEL=DEBUG

# ============================================================
# FRONTEND
# ============================================================
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_NAME=BOWOL
VITE_SENTRY_DSN=
```

---

## 8. Migraciones Flyway en Producción

### 8.1 Regla de oro

**Las migraciones las corre Spring Boot al arrancar.** No hay comando manual, no hay `flyway migrate` desde la consola. Esto garantiza:

1. **Atomicidad:** si una migración falla, la app no arranca.
2. **Consistencia:** todos los pods corren la misma versión del esquema.
3. **Auditoría:** la tabla `flyway_schema_history` registra cuándo se aplicó cada migración.

### 8.2 Configuración

```yaml
# application-prod.yml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: false
    validate-on-migrate: true
    out-of-order: false
    locations: classpath:db/migration
    table: flyway_schema_history
```

### 8.3 Proceso de deploy con migración

```text
1. Se crea el tag v1.2.0
2. GitHub Actions inicia deploy-production.yml
3. Se hace backup automático de la BD
4. Se despliega el nuevo backend
5. Spring Boot arranca y ejecuta Flyway
   ├── Si hay migraciones pendientes: las aplica
   ├── Si una falla: la app no arranca
   └── Si todas OK: la app queda viva
6. Se verifica /actuator/health/readiness
7. Si falla: rollback automático a la versión anterior
```

### 8.4 Reglas duras

1. **Nunca modificar una migración ya aplicada.** Se crea una nueva (`V12__alter_...`).
2. **Nunca borrar una migración.** Ni siquiera si fue un error.
3. **Testear migraciones en staging antes de prod.** Siempre.
4. **Backup antes de cada deploy.** Automático en el workflow.
5. **Migraciones destructivas** (DROP COLUMN, DROP TABLE) requieren aprobación explícita de 2 personas.

---

## 9. Monitoring y Observabilidad

### 9.1 Stack

| Componente | Herramienta | Propósito |
|---|---|---|
| **Métricas** | Prometheus + Grafana | CPU, RAM, latencia, throughput |
| **Logs** | Loki + Grafana | Logs centralizados con búsqueda |
| **Trazas** | OpenTelemetry + Tempo | Trazas distribuidas (Fase 2) |
| **Errores** | Sentry | Errores backend + frontend |
| **Uptime** | Better Uptime o UptimeRobot | Health checks externos |
| **Analytics** | Plausible | Uso del producto (privacy-first) |

### 9.2 Actuator endpoints

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
      base-path: /actuator
  endpoint:
    health:
      show-details: when-authorized
      probes:
        enabled: true
  metrics:
    export:
      prometheus:
        enabled: true
  tracing:
    sampling:
      probability: 0.1  # 10% de requests trazadas
```

**Endpoints clave:**

- `GET /actuator/health/liveness` → ¿el proceso está vivo?
- `GET /actuator/health/readiness` → ¿puede recibir tráfico?
- `GET /actuator/prometheus` → métricas en formato Prometheus
- `GET /actuator/info` → versión, commit, build time

### 9.3 Métricas clave

| Métrica | Objetivo | Alerta |
|---|---|---|
| Latencia p95 API | < 400ms | > 800ms |
| Latencia p95 IA | < 8s | > 15s |
| Tasa de error 5xx | < 0.1% | > 1% |
| Uso CPU | < 70% | > 85% |
| Uso RAM | < 80% | > 90% |
| Conexiones DB activas | < 80% del pool | > 90% |
| Uso de disco | < 70% | > 85% |
| Requests/min | — | Caída > 50% |

### 9.4 Dashboards de Grafana

1. **Overview:** salud general (uptime, requests/min, errores).
2. **API:** latencia por endpoint, status codes, throughput.
3. **Database:** conexiones, queries lentas, tamaño de tablas.
4. **IA:** llamadas por proveedor, tokens, coste, latencia.
5. **Negocio:** usuarios activos, FODAs generados, conversión.

### 9.5 Sentry

**Backend:**
```java
Sentry.init(options -> {
    options.setDsn(System.getenv("SENTRY_DSN"));
    options.setEnvironment(System.getenv("SPRING_PROFILES_ACTIVE"));
    options.setTracesSampleRate(0.1);
    options.setSendDefaultPii(false);
});
```

**Frontend:**
```ts
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: false,
});
```

---

## 10. Backups y Recuperación

### 10.1 Estrategia

| Aspecto | Valor |
|---|---|
| **Frecuencia** | Diario automático a las 03:00 UTC |
| **Retención** | 30 días rodantes |
| **Almacenamiento** | S3 Glacier o Cloudflare R2 |
| **Cifrado** | AES-256 en reposo |
| **Herramienta** | pgBackRest o `pg_dump` + compresión |
| **Restore testeado** | Mensualmente, en staging |

### 10.2 Script de backup

```bash
#!/bin/bash
# infra/scripts/backup-db.sh

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="backup-${TIMESTAMP}.sql.gz"
S3_BUCKET="s3://bowol-backups/postgres"

# Dump comprimido
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > /tmp/${BACKUP_FILE}

# Subir a S3
aws s3 cp /tmp/${BACKUP_FILE} ${S3_BUCKET}/${BACKUP_FILE} --storage-class STANDARD_IA

# Borrar backups mayores a 30 días
aws s3 ls ${S3_BUCKET}/ | awk '{print $4}' | \
  while read file; do
    if [[ $file == backup-* ]]; then
      file_date=$(echo $file | sed 's/backup-\([0-9]\{8\}\).*/\1/')
      if [[ $(date -d "$file_date" +%s) -lt $(date -d "30 days ago" +%s) ]]; then
        aws s3 rm ${S3_BUCKET}/${file}
      fi
    fi
  done

# Log
echo "Backup completed: ${BACKUP_FILE}"
```

**Cron:** configurado en el servidor de Fly.io o en un GitHub Action programado.

### 10.3 Restore

```bash
# Descargar backup
aws s3 cp s3://bowol-backups/postgres/backup-20260115-030000.sql.gz /tmp/

# Descomprimir
gunzip /tmp/backup-20260115-030000.sql.gz

# Restaurar (¡ATENCIÓN! Sobrescribe datos)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < /tmp/backup-20260115-030000.sql
```

**Regla:** el restore se **testea mensualmente** en staging. Un backup no testeado es un backup que no funciona.

### 10.4 RTO y RPO

| Métrica | Valor objetivo |
|---|---|
| **RTO** (Recovery Time Objective) | < 2 horas |
| **RPO** (Recovery Point Objective) | < 24 horas (backup diario) |

Si el negocio exige RPO < 1h, se activa réplica continua con WAL archiving (Fase 3).

---

## 11. Rollback

### 11.1 Rollback de aplicación

**Fly.io:**

```bash
# Listar releases
flyctl releases --app bowol-backend

# Rollback a la release anterior
flyctl deploy --image $(flyctl releases --app bowol-backend --json | jq -r '.[1].ImageRef')
```

**Vercel:**

```bash
# En el dashboard de Vercel, seleccionar deployment anterior → "Promote to Production"
# O por CLI:
vercel rollback
```

**Automático:** el workflow `deploy-production.yml` incluye un step `Rollback on failure` que revierte si falla cualquier verificación post-deploy.

### 11.2 Rollback de migración de BD

**Las migraciones Flyway NO se revierten automáticamente.** Si una migración falla:

1. El deploy se detiene.
2. Se investiga el error.
3. Se crea una **nueva migración** (`V13__fix_...`) que arregla el problema.
4. Se despliega.

**Nunca** se hace rollback de una migración aplicada. Los datos ya están modificados.

**Excepción:** si la migración no ha llegado a aplicarse (fallo en validación pre-deploy), no hay nada que revertir.

### 11.3 Comunicación de rollback

Si un rollback afecta a usuarios:

1. **Slack #incidents:** notificar al equipo.
2. **Status page:** actualizar `status.bowol.com`.
3. **Email:** si el impacto es > 15 min o afecta a > 10% de usuarios.
4. **Post-mortem:** obligatorio en < 48h para incidentes P1/P2.

---

## 12. Costes Estimados

### 12.1 MVP (0-1000 usuarios)

| Servicio | Coste mensual |
|---|---|
| Fly.io backend (1 VM shared-cpu-1x, 512MB) | $5 |
| Vercel frontend (Hobby) | $0 |
| Neon PostgreSQL (Free tier) | $0 |
| Cloudflare R2 (10GB) | $0.15 |
| Resend (100 emails/día) | $0 |
| Sentry (5k events) | $0 |
| Plausible (10k pageviews) | $9 |
| Dominio `.com` | $1 |
| **Total** | **~$15/mes** |

### 12.2 Crecimiento (1k-10k usuarios)

| Servicio | Coste mensual |
|---|---|
| Fly.io backend (2 VMs shared-cpu-2x, 1GB) | $30 |
| Vercel Pro | $20 |
| Neon PostgreSQL (Launch) | $19 |
| Cloudflare R2 (100GB) | $1.50 |
| Resend (10k emails/mes) | $20 |
| Sentry (50k events) | $26 |
| Plausible (100k pageviews) | $19 |
| OpenAI API | $200-500 |
| Stripe (2.9% + $0.30 por transacción) | Variable |
| **Total** | **~$350-600/mes** |

### 12.3 Escala (10k-100k usuarios)

| Servicio | Coste mensual |
|---|---|
| Fly.io backend (auto-scaling, 4+ VMs) | $200 |
| Vercel Enterprise | $150+ |
| Neon PostgreSQL (Scale) o AWS RDS | $300+ |
| Cloudflare R2 (1TB) | $15 |
| Resend (100k emails) | $80 |
| Sentry (Team) | $80 |
| Plausible (Business) | $49 |
| OpenAI API | $2000-5000 |
| Redis (Upstash) | $50 |
| **Total** | **~$3000-6000/mes** |

**Regla:** los costes de IA escalan linealmente con usuarios activos. Se debe monitorizar el coste por usuario activo mensual (objetivo < $2).

---

## 13. Escalado

### 13.1 Cuándo escalar

| Síntoma | Acción |
|---|---|
| CPU > 70% sostenido | Agregar VM |
| Latencia p95 > 800ms | Investigar + agregar VM |
| Pool de conexiones DB saturado | Aumentar pool + read replica |
| `trends` > 50M filas | Particionar tabla |
| Coste de IA > $5000/mes | Cachear respuestas + modelo económico |
| > 10k usuarios activos | Considerar Redis para caché |
| > 50k usuarios activos | Considerar read replicas |
| > 100k usuarios activos | Considerar microservicios selectivos |

### 13.2 Estrategia de escalado horizontal

**Backend (stateless):** escala con más VMs. Fly.io lo hace automático con `auto-scaling`.

**Frontend (CDN):** Vercel/Cloudflare escalan globalmente sin intervención.

**Base de datos:** primero vertical (más RAM/CPU), luego read replicas, luego particionamiento.

**Regla:** nunca escalar antes de tener métricas. "Por si acaso" cuesta dinero y complejidad.

---

## 14. Dependabot y Vulnerabilidades

### 14.1 `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "maven"
    directory: "/backend"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    reviewers:
      - "team-backend"
    labels:
      - "dependencies"
      - "backend"

  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    reviewers:
      - "team-frontend"
    labels:
      - "dependencies"
      - "frontend"

  - package-ecosystem: "docker"
    directory: "/backend"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

### 14.2 Reglas

- **Vulnerabilidades críticas (CVSS ≥ 7):** fix en < 72h.
- **Vulnerabilidades altas (CVSS 4-7):** fix en < 7 días.
- **Vulnerabilidades bajas:** fix en el siguiente sprint.

---

## 15. Checklist de Validación

Antes de aprobar este documento, verificar:

- [ ] Los 4 ambientes están definidos con sus URLs y proveedores.
- [ ] Los proveedores están decididos (Fly.io + Vercel + Neon).
- [ ] Los Dockerfiles de backend y frontend son multi-stage.
- [ ] El contenedor backend corre como usuario no-root.
- [ ] El `docker-compose.yml` incluye postgres, backend, frontend, mailhog y adminer.
- [ ] La estrategia de branching está documentada (main/develop/feature).
- [ ] La convención de commits es Conventional Commits.
- [ ] El versionado semántico está definido.
- [ ] Los workflows de CI para backend y frontend están completos.
- [ ] Los workflows de CD para staging y producción están definidos.
- [ ] El deploy a producción requiere tag y aprobación manual.
- [ ] El backup automático de BD corre antes de cada deploy.
- [ ] El rollback de app está automatizado; el de BD requiere migración nueva.
- [ ] La tabla de variables de entorno está completa (backend + frontend).
- [ ] `.env.example` existe con todas las variables y placeholders.
- [ ] Las migraciones Flyway corren automáticamente al arrancar Spring Boot.
- [ ] Monitoring con Prometheus + Grafana + Loki + Sentry está configurado.
- [ ] Los endpoints `/actuator/health/liveness` y `/readiness` existen.
- [ ] Los dashboards de Grafana están definidos.
- [ ] Los backups diarios corren con retención 30 días.
- [ ] El restore de backup se testea mensualmente.
- [ ] El RTO y RPO están definidos.
- [ ] Los costes estimados por etapa están documentados.
- [ ] La estrategia de escalado tiene umbrales concretos.
- [ ] Dependabot está configurado para maven, npm, docker y github-actions.
- [ ] Las vulnerabilidades críticas se arreglan en < 72h.
- [ ] Todas las referencias cruzadas a otros docs existen.
- [ ] Sin emojis en ninguna sección.

---

**FIN DEL DOCUMENTO `08-DEVOPS.md`**