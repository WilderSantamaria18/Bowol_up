# BOWOL — Guía completa de módulos Backend

> Base auditada: `WilderSantamaria18/Bowol_up`, `main` @ `5d6b1078cb22af6de9f42e7cdf68ce127c4e1560`.
> Convención de estado: **Operativo** = estructura y endpoints presentes; **Parcial** = existe pero requiere cierre funcional; **Reservado** = carpeta sin implementación; **Posterior** = no debe bloquear el MVP.

## 1. Mapa de prioridad

| Orden | Módulo | Estado | Alcance | Fase |
|---:|---|---|---|---:|
| 1 | Shared/Security/Tenant | Parcial crítico | Fundación | 0–1 |
| 2 | Auth + User | Operativo con deuda crítica | MVP | 1 |
| 3 | Organization | Operativo | MVP | 1 |
| 4 | Business Profile | Operativo | MVP | 2 |
| 5 | Source + Trends | Parcial | MVP | 3 |
| 6 | AI Core + Copilot | Parcial | MVP | 4 |
| 7 | SWOT | Operativo con validaciones pendientes | MVP | 5 |
| 8 | Opportunities | Operativo | MVP | 5 |
| 9 | Hypotheses + Experiments | Operativo | MVP | 5 |
| 10 | Projects + Sprints + Tasks | Operativo | MVP | 6 |
| 11 | Dashboard | Parcial agregado | MVP | 6 |
| 12 | Calendar | Operativo local | Complementario | 7 |
| 13 | Audit | Operativo | Transversal | 1–7 |
| 14 | Brand + Social | Parcial | Posterior | 8 |
| 15 | Subscription/Billing | Parcial/simulado | Posterior | 9 |
| 16 | Developer API/Webhooks | Parcial | Enterprise | 10 |
| 17 | Integration | Reservado | Posterior | 10 |
| 18 | Notification | Reservado | Posterior | 10 |
| 19 | Research | Reservado | Integrar en Trends/AI | 3–4 |

## 2. Módulo Shared, Security y Tenant

**Objetivo.** Proveer seguridad, autorización, errores, entidades base, paginación y aislamiento multiempresa para todos los dominios.

**Estado real.** Parcial crítico. Existen `SecurityConfig`, filtros JWT, `TenantContext`, aspectos de tenant, permisos por rol, entidades base y `GlobalExceptionHandler`. RLS está declarada en Flyway, pero debe demostrarse con pruebas de integración.

**API.** No expone endpoints propios; intercepta toda `/api/v1/**`.

**BD.** Funciones RLS y policies en V2, V12 y V22; columna `organization_id` en entidades tenant.

**Tareas.** P0: unificar puerto 8080; asegurar que el tenant procede del usuario autenticado y no de input manipulable; pruebas cruzadas entre organizaciones; RFC 7807 consistente; correlation ID. P1: rate limiting distribuible, logs JSON y permisos documentados.

**Pruebas.** Acceso anónimo/autenticado; 401/403; matriz rol-permiso; tenant A contra tenant B para lectura y escritura; excepción inesperada sin fuga de stack/PII.

**Aceptación.** Ninguna consulta tenant funciona sin contexto válido; ninguna organización accede a otra; todos los errores siguen el contrato común.

## 3. Módulos Auth y User

**Objetivo.** Registro, login, sesión, perfil actual, rotación y revocación segura de tokens.

**Estado real.** Operativo con deuda crítica. Endpoints y JWT RS256 existen, pero el contrato actual devuelve refresh token al frontend y este lo guarda en `localStorage`.

**API.** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.

**BD.** `users`, `refresh_tokens`, relaciones con `organization_members`.

**Dependencias.** Shared/Security, Organization, Audit.

**Tareas.** P0: refresh token en cookie `HttpOnly`, hash en DB, rotación y reuse detection; access token corto; política de contraseña; anti-enumeración y rate limit. P1: recuperación/verificación de email, sesiones por dispositivo y revocación total.

**Pruebas.** Registro duplicado; contraseña inválida; login correcto/incorrecto; expiración; rotación; token robado/reutilizado; logout; usuario suspendido; cookie segura por ambiente.

**Aceptación.** El navegador nunca puede leer el refresh token; un token rotado queda invalidado; auditoría registra eventos sensibles.

## 4. Módulo Organization

**Objetivo.** Administrar el workspace, miembros, roles e invitaciones.

**Estado real.** Operativo: entidad, repositorios, servicio, controlador y DTOs presentes.

**API.** `GET /organizations`, `GET/PATCH/DELETE /organizations/{id}`, `GET/POST /organizations/{id}/members`, `PATCH/DELETE /organizations/{id}/members/{userId}`.

**BD.** `organizations`, `organization_members`.

**Dependencias.** Auth/User, Audit, Notification futuro.

**Tareas.** P0: reglas del último owner, membresía única, permisos por rol y estados de invitación; impedir autoescalamiento. P1: invitaciones con token expirado, cambio de organización activa y transferencia de propiedad.

**Pruebas.** Owner/admin/member; invitación duplicada; usuario externo; remover último owner; cambio de rol; aislamiento tenant.

**Aceptación.** Solo roles autorizados gestionan miembros; una organización nunca queda sin owner activo.

## 5. Módulo Business Profile

**Objetivo.** Capturar el contexto que personaliza tendencias, IA, FODA y estrategia.

**Estado real.** Operativo con endpoints de lectura, actualización y onboarding.

**API.** `GET/PUT/PATCH /business-profile`, `POST /business-profile/onboarding`.

**BD.** `business_profiles` y objetos embebidos/JSON como objetivos.

**Dependencias.** Organization; consumidor: Trends, AI, SWOT, Dashboard.

**Tareas.** P0: esquema validado para industria, mercado, tamaño, objetivos y restricciones; completitud calculada en backend; idempotencia del onboarding. P1: historial/versionado y procedencia del dato.

**Pruebas.** Perfil inexistente, parcial y completo; datos inválidos; reanudación; dos organizaciones; actualización concurrente.

**Aceptación.** El perfil tiene completitud reproducible y alimenta explícitamente las operaciones IA.

## 6. Módulos Source y Trends

**Objetivo.** Ingerir fuentes reales, normalizar señales, calcular score y personalizarlas por organización.

**Estado real.** Parcial. Existen conectores GitHub/YouTube, sincronización, score, relevancia y endpoints; falta validar robustez productiva, credenciales, límites, deduplicación y scheduling.

**API.** `GET /trends`, `GET /trends/for-me`, `GET /trends/{id}`, `POST /trends/sync`, `POST /trends/{id}/mark-relevant`, `POST /trends/{id}/ai-evaluate`, `POST /trends/{id}/dismiss`, `DELETE /trends/{id}/relevance`.

**BD.** `trend_sources`, `trends`, `trend_relevance`; GIN para búsqueda/tags/metadata.

**Dependencias.** Business Profile, AI, Audit.

**Tareas.** P0: un conector productivo primero; checkpoints; deduplicación por huella; timestamps; retries/backoff; idempotencia. P1: scheduler/worker, más fuentes, scoring versionado y explicación de señales.

**Pruebas.** Fuente caída; límite API; payload incompleto; duplicado; resync; paginación/filtros; score estable; personalización tenant.

**Aceptación.** Toda tendencia tiene fuente, URL, fecha, score explicable y no se duplica al resincronizar.

## 7. Módulo AI Core y Copilot

**Objetivo.** Abstraer proveedores, prompts, contexto estratégico, conversaciones, validación de respuestas y auditoría de coste.

**Estado real.** Parcial. Están `AIProvider`, `OpenAIProvider`, `MockAIProvider`, resolver, Mustache, JSON Schema, contexto, conversaciones y usage logs. El proveedor por defecto es `mock`.

**API.** `POST/GET /ai/conversations`, `GET/DELETE /ai/conversations/{id}`, `POST /ai/conversations/{id}/messages`.

**BD.** `ai_conversations`, `ai_messages`, `ai_usage_logs`.

**Dependencias.** Business Profile, Trends, todos los módulos que solicitan generación.

**Tareas.** P0: proveedor real por ambiente; timeout; validación estructurada; auditoría de tokens/coste; límites por organización. P1: circuit breaker, streaming, evaluaciones offline, redacción PII y caché semántica segura.

**Pruebas.** Mock determinista; timeout; JSON inválido; proveedor indisponible; presupuesto agotado; prompt injection; evidencia inexistente; aislamiento de conversación.

**Aceptación.** Toda salida estratégica registra modelo, prompt versionado, coste, latencia y evidencia; ninguna salida inválida persiste.

## 8. Módulo SWOT

**Objetivo.** Generar y editar FODA contextual con evidencias trazables.

**Estado real.** Operativo en estructura y API.

**API.** `POST /swot/generate`, `GET /swot/latest`, `GET /swot`, `GET/PATCH/DELETE /swot/{id}`, `POST /swot/{id}/items`, `DELETE /swot/{id}/items/{itemId}`, `GET /swot/{id}/evidence`.

**BD.** `swot_analyses`, items asociados y `evidence_refs`.

**Dependencias.** Business Profile, Trends, AI, Audit.

**Tareas.** P0: validar evidencia real, versionar generación, evitar doble generación y distinguir IA/usuario. P1: comparación entre versiones y calidad/confianza.

**Pruebas.** Sin perfil; sin tendencias; IA inválida; CRUD de items; evidencia rota; regeneración; tenant.

**Aceptación.** Cada elemento generado por IA apunta a evidencia existente o queda marcado como hipótesis sin evidencia.

## 9. Módulo Opportunities

**Objetivo.** Convertir hallazgos estratégicos en oportunidades priorizadas y accionables.

**Estado real.** Operativo con tablero, CRUD, transición y conversión a proyecto.

**API.** `POST /opportunities/from-swot/{swotId}`, `GET /opportunities/board`, CRUD `/opportunities`, `PATCH /{id}/status`, `POST /{id}/convert-to-project`.

**BD.** `opportunities`, relación con SWOT y evidencia.

**Dependencias.** SWOT, Project, Audit.

**Tareas.** P0: cálculo RICE server-side, constraints, transiciones válidas y conversión idempotente. P1: ranking explicable y snapshots del score.

**Pruebas.** Score límite; transición inválida; origen SWOT ajeno; conversión repetida; concurrencia.

**Aceptación.** El ranking puede explicarse y una oportunidad se convierte una sola vez sin perder trazabilidad.

## 10. Módulos Hypothesis y Experiment

**Objetivo.** Validar una oportunidad antes de comprometer ejecución extensa.

**Estado real.** Operativo: CRUD, formulación IA, resultados, estados, conclusión y conversión.

**API.** `/hypotheses` CRUD, `POST /hypotheses/formulate`, `POST /{id}/record-result`, `POST /{id}/convert-to-project`; `/experiments` CRUD, `PATCH /{id}/status`, `POST /{id}/conclusion`.

**BD.** `hypotheses`, `experiments`.

**Dependencias.** Opportunities, AI, Projects, Audit.

**Tareas.** P0: máquina de estados; métrica/umbral/plazo obligatorios; separar resultado de conclusión; conversión idempotente. P1: plantillas por tipo de experimento y aprendizaje estructurado.

**Pruebas.** Hipótesis sin métrica; experimento sin hipótesis; estados inválidos; conclusión prematura; conversión repetida; tenant.

**Aceptación.** Todo experimento termina con resultado medible y decisión: validar, invalidar o iterar.

## 11. Módulo Projects

**Objetivo.** Transformar estrategia validada en iniciativas ejecutables con miembros y planificación.

**Estado real.** Operativo; el frontend todavía no tiene página propia.

**API.** CRUD `/projects`, miembros `/projects/{id}/members`, sprints `/projects/{id}/sprints`, `POST /{id}/decompose`, `POST /{id}/sprints/ai-plan`, `GET /{id}/velocity`.

**BD.** `projects`, `project_members`.

**Dependencias.** Opportunity/Experiment, Sprint, Task, AI.

**Tareas.** P0: origen único y trazable, roles de proyecto, transiciones e idempotencia de descomposición. P1: archivado, métricas objetivo y health del proyecto.

**Pruebas.** Miembro sin organización; permisos; origen ajeno; proyecto cerrado; descomposición duplicada.

**Aceptación.** Proyecto vinculado a oportunidad/experimento y con resultado esperado medible.

## 12. Módulos Sprint y Task

**Objetivo.** Ejecutar proyectos mediante iteraciones, tablero, asignación, métricas y descomposición IA.

**Estado real.** Operativo con servicios amplios y métricas ágiles.

**API.** Sprints: lectura, actualización, start/complete/cancel/delete, burndown y métricas. Tasks: lista, board, CRUD, status, assign, reorder, decompose.

**BD.** `sprints`, `tasks`, relación con proyectos/usuarios.

**Dependencias.** Projects, Organization, AI, Calendar.

**Tareas.** P0: transacciones para reorder; optimistic locking; reglas de estado; métricas deterministas; permisos. P1: dependencias/bloqueos, estimación y eventos de dominio.

**Pruebas.** Reorden concurrente; usuario ajeno; sprint solapado; completar con tareas abiertas; cálculo burndown/velocity; IA duplicada.

**Aceptación.** El tablero permanece consistente bajo concurrencia y todas las métricas se recalculan desde datos persistidos.

## 13. Módulo Dashboard

**Objetivo.** Resumir salud, señales y siguiente acción del ciclo.

**Estado real.** Parcial agregado. Existe un endpoint summary, pero debe evitar fallbacks que parezcan datos reales.

**API.** `GET /dashboard/summary`.

**BD.** Lectura agregada de trends, SWOT, opportunities, experiments, projects, sprints y tasks.

**Dependencias.** Todos los módulos MVP.

**Tareas.** P0: contrato explícito, datos vacíos honestos, consultas eficientes y siguiente acción. P1: caché corta, KPIs North Star y snapshots.

**Pruebas.** Organización nueva; datos parciales; volumen alto; permisos; latencia y N+1.

**Aceptación.** p95 < 400 ms en carga objetivo y ningún valor demo se presenta como dato real.

## 14. Módulo Calendar

**Objetivo.** Unificar eventos manuales y fechas derivadas de ejecución.

**Estado real.** Operativo local con CRUD, vista unificada y exportación ICS.

**API.** `GET /calendar/unified`, CRUD `/calendar/events`, `GET /calendar/export.ics`.

**BD.** `calendar_events`.

**Dependencias.** Projects, Sprints, Tasks; Integration futuro.

**Tareas.** P0: zonas horarias, eventos all-day, recurrencia mínima, ownership. P1: Google/Microsoft Calendar con OAuth y sincronización incremental.

**Pruebas.** America/Lima/UTC; DST externo; rango; ICS válido; evento ajeno; soft delete.

**Aceptación.** Fechas se conservan correctamente y el ICS abre sin errores en clientes principales.

## 15. Módulo Audit

**Objetivo.** Registrar acciones críticas y permitir consulta/exportación autorizada.

**Estado real.** Operativo con aspecto, anotación, servicio, resumen y exportaciones.

**API.** `GET /audit-logs`, `/summary`, `/export/csv`, `/export/json`.

**BD.** `audit_logs`.

**Dependencias.** Transversal.

**Tareas.** P0: política de eventos, redacción de secretos/PII, permisos, integridad e índices. P1: retención, archivo y alertas.

**Pruebas.** Acción exitosa/fallida; actor ausente; exportación con filtros; CSV injection; tenant.

**Aceptación.** Eventos sensibles son consultables pero nunca exponen tokens, contraseñas o prompts privados completos.

## 16. Módulos Brand y Social

**Objetivo.** Definir identidad/voz y generar propuestas sociales con impacto estimado.

**Estado real.** Parcial. CRUD de brand profile y social posts, generación IA y publicación lógica presentes; no equivale a integración real con redes.

**API.** `GET/PUT /brand-profile`; CRUD `/social/posts`, `POST /social/generate`, `POST /social/posts/{id}/publish`.

**BD.** `brand_profiles`, `social_posts`.

**Dependencias.** Business Profile, AI, Integration futuro.

**Tareas.** P0 posterior: marcar publicación como simulada hasta tener proveedor; workflow draft/approved/published; guardrails de voz. P1: OAuth y adapters por red.

**Pruebas.** Generación sin brand profile; aprobación; permisos; provider failure; idempotencia de publicación.

**Aceptación.** Nunca se afirma que un post fue publicado externamente sin confirmación verificable del proveedor.

## 17. Módulo Subscription/Billing

**Objetivo.** Planes, suscripción, facturas, créditos IA y límites de uso.

**Estado real.** Parcial. API y tablas existen, pero el gateway de pago requiere integración productiva; hay duplicación histórica entre modelos de planes/suscripciones.

**API.** `GET /subscriptions/current`, `/plans`, `/invoices`; `POST /upgrade`, `/cancel`, `/buy-credits`.

**BD.** `plans`, `subscriptions`, `subscription_plans`, `organization_subscriptions`, `billing_invoices`.

**Dependencias.** Organization, AI Usage, Audit, proveedor de pago.

**Tareas.** P0 posterior: resolver modelo canónico; ledger; webhook firmado; idempotencia; cuotas server-side. P1: impuestos, reintentos y portal de cliente.

**Pruebas.** Webhook duplicado/desordenado; pago rechazado; cancelación; crédito concurrente; límites.

**Aceptación.** El estado de pago procede del proveedor/webhook verificado y los créditos no pueden gastarse dos veces.

## 18. Módulo Developer: API Keys y Webhooks

**Objetivo.** Exponer automatización segura para clientes avanzados.

**Estado real.** Parcial enterprise. API keys, filtro, rate limiter, webhooks y entregas existen.

**API.** CRUD parcial `/developer/api-keys`; CRUD `/developer/webhooks`, `/test`, `/deliveries`.

**BD.** `api_keys`, `webhook_endpoints`, `webhook_delivery_logs`.

**Dependencias.** Security, Audit, Notification/worker.

**Tareas.** P0 posterior: hash y prefijo de keys, scopes, expiración, rotación; firma HMAC; SSRF protection; cola/retries; desactivación. P1: portal y documentación.

**Pruebas.** Key revocada/expirada; scope; URL privada; firma; timeout; replay; rate limit.

**Aceptación.** Secretos se muestran una vez; webhooks no alcanzan redes privadas y cada entrega es trazable.

## 19. Módulos reservados: Integration, Notification y Research

**Estado real.** Carpetas sin implementación efectiva.

### Integration

Objetivo futuro: adapters OAuth/terceros. Antes de implementarlo, definir `IntegrationProvider`, credenciales cifradas, scopes, refresh, health y desconexión. Tablas base `integrations` ya existen.

### Notification

Objetivo futuro: email/in-app y colas. Implementar solo cuando existan eventos reales: invitaciones, trabajos IA, deadlines y billing. Requiere preferencias, plantilla, outbox, retries y deduplicación.

### Research

No crear un silo independiente todavía. La investigación debe vivir como capacidad de Trends + AI con fuentes, evidencia y snapshots. Separarla solo si aparece un bounded context real.

**Aceptación común.** Ninguna carpeta reservada se activa sin caso de uso, contrato, tabla/migración, observabilidad y pruebas.

## 20. Matriz de dependencias

| Productor | Consumidores principales |
|---|---|
| Auth/User | Todos los módulos protegidos |
| Organization/Tenant | Todos los datos empresariales |
| Business Profile | Trends, AI, SWOT, Dashboard |
| Sources/Trends | AI, SWOT, Opportunities |
| AI Core | SWOT, Hypothesis, Projects/Sprints, Social, Copilot |
| SWOT | Opportunities |
| Opportunities | Hypotheses, Projects |
| Hypotheses/Experiments | Projects |
| Projects | Sprints, Tasks, Calendar, Dashboard |
| Audit | Seguridad, administración, enterprise |

## 21. Definition of Done por módulo

- Contrato OpenAPI actualizado y versionado.
- Validaciones, permisos y aislamiento tenant probados.
- Migración Flyway e índices incluidos cuando cambia persistencia.
- Pruebas unitarias, integración PostgreSQL/Testcontainers y casos negativos.
- Errores RFC 7807 consistentes.
- Logs, métricas y auditoría sin secretos.
- Idempotencia en acciones repetibles/costosas.
- Criterios funcionales demostrables desde el frontend o colección API.

## 22. Secuencia de implementación

1. Shared/Security/Tenant + Auth + Organization.
2. Business Profile.
3. Source/Trends.
4. AI Core.
5. SWOT → Opportunity → Hypothesis/Experiment.
6. Project → Sprint → Task.
7. Dashboard y Calendar.
8. Brand/Social.
9. Billing.
10. Developer/Integrations/Notifications.
