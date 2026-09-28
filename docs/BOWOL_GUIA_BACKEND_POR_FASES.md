# BOWOL — Guía de implementación Backend por fases

> Repositorio auditado: `WilderSantamaria18/Bowol_up`, rama `main`, commit `5d6b1078cb22af6de9f42e7cdf68ce127c4e1560`.
> Alcance: Spring Boot 3.3.4, Java 21, PostgreSQL 16/pgvector, Flyway, JWT RS256 y proveedores de IA.

## 1. Qué es BOWOL desde el backend

BOWOL es un SaaS multiempresa que convierte señales externas en decisiones y ejecución medible:

`perfil empresarial → tendencias → análisis IA → FODA → oportunidades → hipótesis/experimentos → proyectos/sprints/tareas → aprendizaje`

El backend ya está construido como monolito modular. Incluye autenticación, organizaciones, perfiles empresariales, tendencias, IA, FODA, oportunidades, experimentos, proyectos, sprints, tareas, calendario, marca/social, suscripciones, auditoría, API keys y webhooks. No conviene migrarlo ahora a microservicios: primero debe estabilizarse el flujo central y comprobarse el aislamiento multi-tenant.

## 2. Diagnóstico del estado actual

### Fortalezas verificadas

- 267 archivos Java y 55 archivos de pruebas.
- API versionada bajo `/api/v1` y manejo RFC 7807.
- PostgreSQL administrado con 22 migraciones Flyway.
- RLS, índices, soft delete y separación por `organization_id` ya planteados.
- JWT RS256, refresh tokens, RBAC y auditoría.
- Testcontainers y Spring Security Test están declarados.
- Proveedores IA abstraídos (`AIProvider`) y prompts versionados.
- Contenedores multi-stage, Actuator y flujos de CI existentes.

### Cambios críticos antes de ampliar funciones

| Prioridad | Hallazgo | Cambio requerido |
|---|---|---|
| P0 | Puertos contradictorios | Unificar `application.yml`, Dockerfile, Compose, README y health checks. La app usa `8096`; el resto espera `8080`. |
| P0 | Claves JWT de prueba referenciadas por Compose | No montar claves de prueba fuera del perfil `test`; usar secretos externos por ambiente. |
| P0 | Refresh token expuesto al navegador | Migrar refresh token a cookie `HttpOnly`, `Secure`, `SameSite`; rotar y detectar reutilización. |
| P0 | RLS debe probarse, no solo declararse | Agregar pruebas de integración que demuestren que una organización jamás lee/modifica datos de otra. |
| P0 | Base local sin recuperación validada | Crear backup/restore reproducible y comprobar restauración antes de producción. |
| P1 | IA real no es el camino por defecto | Mantener `mock` solo en local/test y habilitar un proveedor real con timeouts, límites, auditoría y presupuesto. |
| P1 | Alcance funcional demasiado ancho | Congelar billing, social, developer platform y enterprise hasta cerrar el ciclo principal. |
| P1 | CI duplicado y parcialmente comentado | Consolidar en un workflow único; usar `npm ci` y ejecutar backend con PostgreSQL real. |
| P1 | Contrato y migraciones documentadas quedaron atrás | `03-DATABASE.md` termina en V14, pero existen V15–V22. Actualizar catálogo, ERD y contrato OpenAPI. |
| P2 | Falta observabilidad operativa completa | Añadir métricas de negocio, trazas, logs JSON y alertas con SLO. |

## 3. Alcance recomendado del MVP backend

El MVP no debe intentar terminar los 22 módulos a la vez. Debe demostrar un flujo vertical completo:

1. Registrar usuario y organización.
2. Completar perfil del negocio.
3. Ingerir tendencias reales desde una fuente confiable.
4. Evaluar relevancia con evidencias y coste IA controlado.
5. Generar/editar FODA.
6. Convertir un punto FODA en oportunidad priorizada.
7. Convertir oportunidad en hipótesis/experimento.
8. Convertir el resultado en proyecto, sprint y tareas.
9. Registrar aprendizaje y reflejarlo en el dashboard.

Billing, publicación social, webhooks públicos y API keys pasan a una etapa posterior, detrás de feature flags.

## 4. Fase 0 — Línea base reproducible y correcciones bloqueantes

**Objetivo:** que cualquier integrante levante el mismo sistema sin editar código.

### Trabajo

- Elegir un puerto canónico. Recomendación: `8080` en todos los ambientes.
- Alinear:
  - `server.port`.
  - `docker-compose.yml`.
  - `backend/Dockerfile`.
  - proxy de Vite.
  - README y health checks.
- Corregir el permiso ejecutable de `backend/mvnw` en Git.
- Consolidar `.env.example` raíz y backend; no incluir secretos utilizables.
- Separar perfiles `local`, `test`, `staging` y `prod`.
- Hacer que `local` utilice Docker PostgreSQL; H2 solo para pruebas unitarias muy aisladas.
- Consolidar los tres workflows de CI en uno.
- Añadir verificación Flyway: `validate`, migración desde cero y migración desde snapshot de versión anterior.

### Comandos de salida

```bash
cp .env.example .env
docker compose up -d postgres
cd backend
./mvnw clean verify -Dspring.profiles.active=test
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
curl -fsS http://localhost:8080/actuator/health
```

### Criterios de aceptación

- CI verde con pruebas unitarias e integración.
- La base vacía llega de V1 a V22 sin intervención manual.
- Swagger, health y API usan el mismo puerto.
- No existen claves privadas reales o de prueba dentro de la imagen de producción.

## 5. Fase 1 — Seguridad, identidad y aislamiento multi-tenant

**Objetivo:** construir una frontera de seguridad demostrable.

### Trabajo

- Access token de corta duración en memoria del cliente.
- Refresh token en cookie `HttpOnly + Secure + SameSite=Lax/Strict`.
- Rotación por uso, hash del token en DB, revocación por dispositivo y detección de reuse.
- CSRF para endpoints que dependan de cookies.
- Rate limits en registro, login, refresh, generación IA y sincronización de fuentes.
- Política de contraseña y protección contra enumeración de cuentas.
- Autorización por rol y pertenencia real a organización; no confiar en un header enviado por el cliente.
- Propagar `organization_id` validado al contexto transaccional PostgreSQL.
- Ejecutar pruebas negativas entre dos tenants para cada agregado principal.
- Auditoría de login, cambio de rol, invitación, exportación y acciones IA.

### Pruebas obligatorias

- Usuario A no puede leer, modificar ni inferir IDs de la organización B.
- Un refresh token rotado no puede volver a utilizarse.
- Un miembro removido pierde acceso inmediatamente.
- Los endpoints públicos, autenticados y administrativos coinciden con OpenAPI.

### Criterio de salida

Ninguna historia funcional avanza si falla una prueba de aislamiento o autenticación.

## 6. Fase 2 — PostgreSQL local sólido y camino a nube

**Objetivo:** conservar PostgreSQL local ahora, sin bloquear el despliegue futuro.

### Trabajo local

- Mantener `pgvector/pgvector:pg16` en Compose con volumen nombrado.
- Flyway como única autoridad del esquema; mantener `ddl-auto=validate`.
- Agregar seeds explícitos solo para perfil local.
- Actualizar `03-DATABASE.md` a V22 y generar ERD actual.
- Revisar duplicación conceptual entre `plans/subscriptions` y `subscription_plans/organization_subscriptions`.
- Revisar todas las FKs, índices compuestos, constraints y soft deletes.
- Probar RLS con el rol real que usará la aplicación, no con superusuario.

### Backup y restauración

```bash
docker compose exec -T postgres pg_dump -U bowol_app -d bowol_db -Fc > bowol.dump
docker compose exec -T postgres pg_restore --clean --if-exists -U bowol_app -d bowol_db < bowol.dump
```

### Preparación para staging/producción

- PostgreSQL administrado con conexión TLS.
- Pool dimensionado según límites del proveedor; considerar PgBouncer.
- Backups automáticos, PITR y ensayo mensual de restauración.
- Migraciones ejecutadas como job previo al despliegue, no por varias réplicas simultáneas.
- Variables `DATABASE_URL` o equivalentes, sin hardcodear host local.

### Criterios de aceptación

- Restauración comprobada en una base nueva.
- Cero drift entre entidades y esquema Flyway.
- Consultas principales medidas con `EXPLAIN ANALYZE` y sin scans evitables.

## 7. Fase 3 — Núcleo de producto: perfil empresarial y tendencias reales

**Objetivo:** entregar la primera señal relevante, con fuente y contexto.

### Trabajo

- Completar validaciones y versionado del `BusinessProfile`.
- Implementar primero un conector productivo (recomendación: GitHub) y uno editorial/técnico adicional.
- Separar ingestión global de personalización por organización.
- Normalizar fuentes, deduplicar por URL/huella y registrar fecha de captura.
- Implementar cursor/checkpoint, reintentos con backoff y dead-letter lógico.
- Calcular `TrendScore` con fórmula explicable y versionada.
- Conservar evidencia: fuente, URL, fecha, métricas y fragmento procesado.
- No permitir que la IA invente una fuente; las citas deben provenir de registros ingeridos.

### API mínima

- `POST /api/v1/trends/sync` inicia trabajo idempotente.
- `GET /api/v1/trends/for-me` pagina y filtra.
- `POST /api/v1/trends/{id}/ai-evaluate` devuelve estado asíncrono cuando corresponda.
- Idempotency key en procesos costosos o repetibles.

### Criterios de aceptación

- La misma fuente no crea tendencias duplicadas.
- Cada tendencia muestra trazabilidad y fecha de actualización.
- El usuario obtiene señales relacionadas con industria, objetivos y país.

## 8. Fase 4 — IA controlada, contextual y observable

**Objetivo:** pasar del proveedor simulado a valor real sin convertir BOWOL en un chat genérico.

### Trabajo

- Mantener `mock` en test; proveedor real configurable por ambiente.
- Timeouts, reintentos selectivos, circuit breaker y cancelación.
- Salidas estructuradas validadas contra JSON Schema.
- Registro de modelo, versión de prompt, tokens, latencia, coste y resultado.
- Límites por organización/plan y presupuesto mensual.
- Redacción de PII antes del envío cuando corresponda.
- Evaluaciones offline con un conjunto dorado de empresas y tendencias.
- Guardrails: la salida IA nunca escribe directamente en entidades críticas sin validación.

### Criterios de aceptación

- Tasa de JSON válido ≥ 99%.
- Toda recomendación estratégica referencia evidencia.
- Coste y latencia son visibles por operación y organización.
- Existe fallback seguro cuando el proveedor no responde.

## 9. Fase 5 — Cerrar el ciclo Strategy → Execution

**Objetivo:** demostrar la promesa diferencial de BOWOL.

### Trabajo

- FODA versionado, editable y con evidencia por elemento.
- Opportunity Engine con RICE calculado por backend y explicación de cada factor.
- Hipótesis con métrica, umbral, plazo y criterio de éxito/fracaso.
- Experimentos vinculados a evidencia y conclusión.
- Conversión transaccional: oportunidad → proyecto → sprint → tareas.
- Reglas de estado centralizadas y protegidas contra transiciones inválidas.
- Outbox/eventos internos para actualizar dashboard y auditoría sin acoplar servicios.
- Métrica North Star: proyectos terminados con aprendizaje registrado por organización/mes.

### Criterios de aceptación

- Un recorrido E2E crea todos los vínculos sin registros huérfanos.
- Cada decisión puede rastrearse hasta su fuente.
- Un reintento no duplica proyecto, sprint ni tareas.

## 10. Fase 6 — Operación SaaS y producción

**Objetivo:** desplegar con seguridad, observabilidad y recuperación.

### Trabajo

- Staging idéntico a producción salvo tamaño y secretos.
- Logs JSON con `traceId`, `organizationId`, endpoint y latencia, sin tokens ni prompts sensibles.
- OpenTelemetry/tracing, Prometheus y dashboards.
- SLO iniciales: disponibilidad 99.5%, API p95 < 400 ms; IA medida aparte.
- Readiness distinta de liveness; readiness debe comprobar dependencias esenciales.
- Escaneo de dependencias, imágenes y secretos en CI.
- Despliegue reversible y migraciones compatibles hacia atrás.
- Runbooks: caída de DB, proveedor IA, migración fallida, fuga de clave y recuperación de backup.

### Criterio de salida

Prueba de carga, prueba de restauración y ensayo de rollback aprobados antes del primer usuario externo.

## 11. Fase 7 — Monetización e integraciones posteriores

Solo después de validar el ciclo central:

- Proveedor de pagos real con webhook firmado, idempotencia y ledger.
- Cuotas por plan aplicadas en backend, no solo mostradas en UI.
- Webhooks con firma HMAC, reintentos, desactivación y protección SSRF.
- API keys almacenadas como hash, scopes, expiración y rotación.
- Calendario externo y publicación social mediante OAuth con mínimos permisos.

## 12. Orden de trabajo sugerido

| Fase | Duración orientativa | Entrega verificable |
|---|---:|---|
| 0 | 1 semana | Stack reproducible y CI confiable |
| 1 | 2 semanas | Seguridad y multi-tenancy probados |
| 2 | 1–2 semanas | PostgreSQL validado, backup y camino cloud |
| 3 | 2–3 semanas | Tendencias reales y trazables |
| 4 | 2 semanas | IA real, evaluada y presupuestada |
| 5 | 3 semanas | Flujo completo hasta ejecución/aprendizaje |
| 6 | 2 semanas | Staging/producción operables |
| 7 | Posterior | Billing e integraciones externas |

## 13. Definition of Done backend

Una fase solo termina cuando:

- Sus criterios de aceptación tienen pruebas automatizadas.
- OpenAPI y documentación coinciden con el comportamiento.
- Migraciones se validan desde cero y desde la versión anterior.
- Seguridad multi-tenant tiene pruebas negativas.
- Logs y métricas permiten diagnosticar errores.
- No se introducen secretos ni datos reales en Git.
- El cambio puede revertirse sin perder datos.

## 14. Primera iteración ejecutable

1. Unificar puerto `8080` y health checks.
2. Corregir permiso de Maven Wrapper.
3. Consolidar CI y ejecutar PostgreSQL/Testcontainers.
4. Crear suite de aislamiento entre dos organizaciones.
5. Migrar refresh token a cookie segura.
6. Actualizar documentación DB V15–V22.
7. Congelar módulos no MVP con feature flags.
8. Implementar un conector real y un recorrido E2E del ciclo principal.
