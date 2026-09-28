# BOWOL — Guía completa de módulos Frontend

> Base auditada: `WilderSantamaria18/Bowol_up`, `main` @ `5d6b1078cb22af6de9f42e7cdf68ce127c4e1560`.
> Cada módulo incluye objetivo, estado, API/estado, tareas, pruebas y aceptación.

## 1. Mapa de prioridad

| Orden | Módulo | Estado | Alcance | Fase |
|---:|---|---|---|---:|
| 1 | App Shell + Design System | Parcial crítico | Fundación | 0–1 |
| 2 | Auth | Operativo con deuda crítica | MVP | 1 |
| 3 | Organization/Settings | Operativo | MVP | 1 |
| 4 | Business Profile/Onboarding | Operativo | MVP | 2 |
| 5 | Trends | Operativo | MVP | 3 |
| 6 | Copilot | Operativo parcial | MVP asistente | 4 |
| 7 | SWOT | Operativo | MVP | 5 |
| 8 | Opportunities | Operativo | MVP | 5 |
| 9 | Hypotheses | Operativo | MVP | 5 |
| 10 | Experiments | Componentes sin página propia | MVP | 5 |
| 11 | Projects | Servicio/tipos sin página propia | MVP | 6 |
| 12 | Sprints | Operativo | MVP | 6 |
| 13 | Tasks | Operativo | MVP | 6 |
| 14 | Dashboard | Operativo con fallbacks | MVP | 6 |
| 15 | Calendar | Operativo | Complementario | 7 |
| 16 | Landing | Desarrollado, requiere simplificación | Adquisición | 4–7 |
| 17 | Brand + Social | Ruta provisional | Posterior | 8 |
| 18 | Billing | Operativo visual, backend parcial | Posterior | 9 |
| 19 | Audit + Developer | Parcial, sin rutas principales completas | Enterprise | 10 |
| 20 | Integrations/Research/Settings vacíos | Reservado | Posterior | 10 |

## 2. App Shell, Router y navegación

**Objetivo.** Proveer estructura, rutas, permisos, navegación responsive, carga y recuperación consistente.

**Estado real.** Parcial. `App.tsx` usa lazy loading, providers y rutas protegidas; `RootLayout`, navegación desktop y drawer móvil existen. Hay rutas provisionales: `/experiments` usa `HypothesesPage`, `/projects` usa `TaskBoardPage`, `/brand` usa `SocialPage`.

**API/estado.** AuthContext, ThemeContext, CopilotContext y QueryClient global.

**Tareas.** P0: eliminar/reemplazar rutas provisionales; navegación según feature flags y permisos; route-level error boundary; 401/403/404 diferenciados. P1: breadcrumbs, comando/buscador y persistencia de última organización.

**Pruebas.** Visitante/autenticado; deep link; rol sin permiso; chunk fallido; móvil; navegación por teclado.

**Aceptación.** Toda ruta visible tiene pantalla propia y autorización; ningún enlace lleva a un módulo distinto al rotulado.

## 3. Design System y componentes UI

**Objetivo.** Mantener una interfaz BOWOL coherente, sobria y no genérica.

**Estado real.** Parcial. Existen Button, Input, Select, Card, Badge, Alert, logos y tema, pero persisten estilos hardcodeados por feature.

**Datos/BD.** No aplica; consume tokens y estados.

**Tareas.** P0: tokens semánticos, foco, contraste, estados completos y componentes Modal/Toast/Skeleton/Empty/Error/Table/Tabs. P1: catálogo visual y patrones `EvidenceBadge`, `SourceCitation`, `DecisionTrail`, `CycleProgress`, `AIAction`.

**Pruebas.** Estados, teclado, axe, light/dark, tamaños 360/768/1440, regresión visual.

**Aceptación.** Nuevas features no agregan colores, radios o botones fuera del sistema; WCAG AA.

## 4. Auth

**Objetivo.** Registro, login, restauración de sesión y logout seguros.

**Estado real.** Operativo; Login/Register y pruebas existen. Deuda crítica: access y refresh token se guardan en `localStorage`.

**API.** `/auth/register`, `/login`, `/refresh`, `/logout`, `/me`.

**Estado.** `AuthContext`; debe reducirse a usuario, organización, estado y acciones, sin persistir refresh token.

**Tareas.** P0: refresh por cookie `HttpOnly`; access token en memoria; refresh concurrente único; limpiar sesión al 401 irrecuperable. P1: recuperación/verificación de email y sesiones.

**Pruebas.** Login/registro; validación; 401→refresh→retry; refresh fallido; logout offline; redirecciones; accesibilidad.

**Aceptación.** No existe `bowol_refresh_token` en Web Storage; sesión se restaura de manera segura y sin bucles.

## 5. Organization y Settings

**Objetivo.** Editar organización, gestionar miembros y roles.

**Estado real.** Operativo: SettingsPage, formulario, lista e invitación; pruebas básicas.

**API.** `/organizations` y `/organizations/{id}/members`.

**Tareas.** P0: permisos visibles, feedback de invitación, confirmación al remover/cambiar rol, evitar editar último owner. P1: cambio de workspace e invitaciones pendientes.

**Pruebas.** Owner/admin/member; error 409/422; loading/empty; confirmación destructiva; mobile.

**Aceptación.** Controles no autorizados se ocultan/deshabilitan y el backend sigue siendo autoridad.

## 6. Business Profile y Onboarding

**Objetivo.** Capturar contexto empresarial y lograr primer valor rápidamente.

**Estado real.** Operativo: wizard, vista, páginas, servicio y pruebas.

**API.** `GET/PUT/PATCH /business-profile`, `POST /business-profile/onboarding`.

**Tareas.** P0: guardado parcial, reanudación, validación por paso, razón de cada campo y progreso real. P1: vista de completitud y efecto del perfil en recomendaciones.

**Pruebas.** Reanudar; refresh; error por paso; perfil parcial; teclado; mobile; envío idempotente.

**Aceptación.** Usuario completa el perfil sin perder datos y entiende cómo personaliza BOWOL.

## 7. Trends

**Objetivo.** Explorar señales, filtrar, evaluar relevancia y revisar evidencia.

**Estado real.** Operativo con página, filtros, lista, tarjeta, modal y tres suites de pruebas.

**API.** `/trends`, `/for-me`, `/{id}`, `/sync`, `/mark-relevant`, `/ai-evaluate`, `/relevance`.

**Estado.** Debe centralizarse en TanStack Query; hoy el servicio está completo y la sincronización usa avisos temporales.

**Tareas.** P0: paginación/cursor; fuente y fecha visibles; estados sync/evaluate asíncronos; no presentar fallback como real. P1: filtros en URL, comparación y guardados.

**Pruebas.** Empty/error/retry; fuente; paginación; evaluación lenta; duplicado; 429; modal y teclado.

**Aceptación.** Cada tarjeta responde qué es, por qué importa, de dónde viene y cuándo se actualizó.

## 8. Copilot

**Objetivo.** Asistente contextual del ciclo, no chat genérico.

**Estado real.** Operativo parcial: drawer, trigger, mensajes, contexto, servicio y prueba limitada.

**API.** CRUD de `/ai/conversations` y envío de mensajes.

**Tareas.** P0: mostrar contexto activo; historial; estados de generación/cancelación/error; citar evidencia; impedir acciones silenciosas. P1: streaming, acciones sugeridas y coste/créditos.

**Pruebas.** Nueva conversación; historial; timeout; respuesta inválida; evidencia; cambio de contexto; foco del drawer.

**Aceptación.** Usuario sabe qué datos usa la IA y ninguna acción persistente ocurre sin confirmación.

## 9. SWOT

**Objetivo.** Mostrar, generar y editar FODA con evidencias.

**Estado real.** Operativo con página, cuadrantes, resumen, modal de evidencia, hooks y pruebas.

**API.** `/swot/latest`, `/generate`, CRUD y `/evidence`.

**Tareas.** P0: distinguir IA/usuario; badges de evidencia; estado de generación persistente; edición accesible. P1: versiones y comparación.

**Pruebas.** Sin análisis; generación; error IA; agregar/eliminar; evidencia; permisos; mobile.

**Aceptación.** Todo elemento generado permite abrir su evidencia o muestra claramente que no la tiene.

## 10. Opportunities

**Objetivo.** Priorizar oportunidades en tablero y convertirlas en ejecución.

**Estado real.** Operativo con página, Kanban, hook Query y pruebas.

**API.** `/opportunities/board`, CRUD, `/from-swot`, `/status`, `/convert-to-project`.

**Tareas.** P0: explicación RICE; drag/drop accesible o controles equivalentes; optimistic update con rollback; confirmación de conversión. P1: filtros, ranking y detalle.

**Pruebas.** Move/status; rollback; score; conversión; empty/error; keyboard.

**Aceptación.** El usuario comprende por qué una oportunidad tiene prioridad y puede rastrearla al FODA.

## 11. Hypotheses

**Objetivo.** Formular, medir y decidir hipótesis vinculadas a oportunidades.

**Estado real.** Operativo con página, tarjetas, modales, IA y pruebas.

**API.** CRUD `/hypotheses`, `/formulate`, `/record-result`, `/convert-to-project`.

**Tareas.** P0: formularios con métrica/umbral/plazo; máquina de estados visible; procedencia; confirmación de conversión. P1: templates y timeline.

**Pruebas.** Validación; IA lenta/fallida; resultado; estados; conversión duplicada; accesibilidad.

**Aceptación.** Ninguna hipótesis se considera validada sin resultado y umbral comparables.

## 12. Experiments

**Objetivo.** Diseñar experimentos y registrar conclusiones.

**Estado real.** Provisional: existen componentes, tipos y servicio, pero no `ExperimentsPage`; la ruta `/experiments` muestra `HypothesesPage`.

**API.** CRUD `/experiments`, `/status`, `/conclusion`.

**Tareas.** P0: crear `ExperimentsPage`; conectar lista/filtros; mostrar hipótesis; estados y conclusión. P1: templates, calendario y métricas.

**Pruebas.** Crear/editar; transición; conclusión; empty/error; permisos; responsive.

**Aceptación.** `/experiments` muestra experimentos reales y permite completar el ciclo de validación.

## 13. Projects

**Objetivo.** Administrar iniciativas, miembros, resultado esperado y acceso a sprints.

**Estado real.** Provisional: hay tipos y servicio, pero no página/componentes; `/projects` muestra TaskBoardPage.

**API.** CRUD `/projects`, members, sprints, velocity y AI plan.

**Tareas.** P0: `ProjectsPage`, `ProjectDetailPage`, lista, estado, miembros y origen estratégico. P1: health, métricas y archivo.

**Pruebas.** Listado/detalle; permisos; miembros; origen; navegación a sprint; empty/error.

**Aceptación.** `/projects` deja de ser alias del tablero y muestra proyectos con trazabilidad.

## 14. Sprints

**Objetivo.** Planificar iteraciones, ver burndown, velocity y completar/cancelar.

**Estado real.** Operativo con página, tarjetas, modales, gráficos, servicio y seis pruebas.

**API.** Projects/sprints, `/sprints/{id}`, start/complete/cancel, burndown, metrics, velocity y AI plan.

**Tareas.** P0: selector de proyecto; estados reales; gráficos accesibles; manejo de conflicto. P1: planificación de capacidad y comparación.

**Pruebas.** Start/complete/cancel; burndown vacío; error de IA; responsive; tablas alternativas a gráficos.

**Aceptación.** Métricas tienen explicación textual y las transiciones respetan reglas backend.

## 15. Tasks

**Objetivo.** Ejecutar trabajo en tablero con asignación, prioridad, orden y descomposición IA.

**Estado real.** Operativo con Kanban, hooks, modales, servicio y pruebas.

**API.** `/tasks`, `/board`, CRUD, `/status`, `/assign`, `/reorder`, `/decompose/{projectId}`.

**Tareas.** P0: selector proyecto/sprint; drag/drop con teclado; rollback; conflicto concurrente; detalle completo. P1: filtros, dependencias y vistas lista/mía.

**Pruebas.** Reorder/move; rollback 409; assign; permisos; IA; mobile; teclado.

**Aceptación.** El tablero no pierde ni duplica tareas y todas las acciones tienen alternativa accesible.

## 16. Dashboard

**Objetivo.** Presentar resumen ejecutivo y siguiente mejor acción.

**Estado real.** Operativo visualmente: cockpit y bentos. Hay fallback curado en radar que puede confundirse con datos reales.

**API.** `GET /dashboard/summary`.

**Tareas.** P0: eliminar/etiquetar demo; vacío útil; priorizar acción; links profundos. P1: personalización y KPIs.

**Pruebas.** Organización nueva; parcial/completa; API fallida; permisos; performance; visual regression.

**Aceptación.** Ninguna cifra simulada parece real y cada tarjeta conduce a una acción pertinente.

## 17. Calendar

**Objetivo.** Visualizar eventos y deadlines en mes/agenda y exportar ICS.

**Estado real.** Operativo con página, vistas, modal, servicio y pruebas; existe warning `act` que debe eliminarse.

**API.** `/calendar/unified`, `/events`, `/export.ics`.

**Tareas.** P0: corregir test; zonas horarias; navegación por teclado; estados de exportación. P1: sincronización externa.

**Pruebas.** Rango, timezone, CRUD, ICS, empty/error, teclado y mobile.

**Aceptación.** Fechas se muestran sin desplazamientos y exportación informa éxito/error real.

## 18. Landing

**Objetivo.** Explicar BOWOL, demostrar el ciclo y convertir visitantes.

**Estado real.** Muy desarrollada: 15 componentes, ticker, bento, terminal, métricas, CTA y animación GSAP del SVG. Requiere simplificación y medición.

**API.** Pública; CTA debe usar endpoint/flujo real o indicar lista de espera.

**Tareas.** P0: reducir repetición; prueba del producto; métricas verificables; SEO; Web Vitals. Animación “De señal a trayectoria”: ensamblar SVG oficial, pulso/ignición y recorrido breve; sin giro 360°, partículas React por frame ni acompañamiento permanente. P1: experimentos de copy/CTA.

**Pruebas.** Lighthouse móvil; reduced motion; SVG sin deformación; no-JS; teclado; CTA; regresión visual; 360/768/1440.

**Aceptación.** LCP < 2.5 s, INP < 200 ms, CLS < 0.1; animación preserva logo y no compite con la propuesta.

## 19. Brand y Social

**Objetivo.** Gestionar identidad y propuestas de contenido.

**Estado real.** Brand tiene vista/servicio sin página propia; Social sí tiene página y pruebas. `/brand` muestra `SocialPage`, por lo que el rotulado no coincide.

**API.** `/brand-profile`; CRUD `/social/posts`, `/generate`, `/publish`.

**Tareas.** P0 posterior: `BrandPage` real o pestañas claras; distinguir borrador, propuesta IA y publicación confirmada; no fingir integración. P1: preview por canal.

**Pruebas.** Guardado kit; generación; approval; publish failure; permisos; accesibilidad.

**Aceptación.** Brand y Social tienen navegación/objetivos distintos y publicación externa solo se confirma con proveedor real.

## 20. Billing

**Objetivo.** Mostrar plan, créditos, upgrades, facturas y cancelación.

**Estado real.** Operativo visualmente con página, cinco componentes, servicio y pruebas; depende de backend/pago todavía parcial.

**API.** `/subscriptions/current`, `/plans`, `/upgrade`, `/cancel`, `/invoices`, `/buy-credits`.

**Tareas.** P0 posterior: estados pendientes/failed; redirección proveedor; recibos; cuotas reales. P1: portal de cliente y uso detallado.

**Pruebas.** Pago pendiente/fallido; webhook tardío; cancelación; créditos; permisos; moneda/locale.

**Aceptación.** UI nunca declara pago exitoso por respuesta optimista; espera estado confirmado.

## 21. Audit y Developer

**Objetivo.** Administración enterprise: trazabilidad, exportación, API keys y webhooks.

**Estado real.** Audit tiene página/servicio; Developer tiene componentes/servicio, pero no página/rutas claras en `App.tsx` para gestión completa.

**API.** `/audit-logs`; `/developer/api-keys`; `/developer/webhooks`.

**Tareas.** P0 posterior: permisos admin; DeveloperSettingsPage; secreto visible una vez; filtros/exportaciones seguras; delivery detail. P1: docs interactivas.

**Pruebas.** Acceso prohibido; copiar secreto; key revocada; webhook test; paginación; export CSV seguro.

**Aceptación.** Solo admins acceden; secretos no reaparecen; estados de entrega son verificables.

## 22. Carpetas reservadas y limpieza

**Integrations, Research y Settings.** Actualmente contienen solo README o están vacías. No crear páginas vacías en navegación. `SettingsPage` vive hoy bajo Organization; decidir si ese límite se conserva y eliminar carpeta redundante.

**Hooks, layouts, pages, types, utils globales.** Varias carpetas contienen `.gitkeep` pese a que existen archivos hermanos. Eliminar placeholders innecesarios y definir qué puede ser global.

**Services.** `src/services/api.ts` tiene contenido mínimo; consolidar o eliminar para evitar dos clientes.

**Aceptación.** Cero rutas, menús o carpetas “fantasma” sin responsabilidad definida.

## 23. Infraestructura de datos frontend

### Query keys

Crear factories por dominio: `authKeys`, `trendKeys`, `swotKeys`, `opportunityKeys`, `projectKeys`, etc. Invalidar el agregado mínimo, no `['dominio']` indiscriminadamente.

### Errores

Mapear RFC 7807: 401 sesión, 403 permiso, 404 inexistente, 409 conflicto, 422 campos, 429 espera y 5xx recuperación.

### Formularios

Unificar schema, errores por campo, deshabilitado solo durante submit y preservación tras error.

### Tiempo real/asíncrono

Sync de tendencias y generación IA deben devolver/mostrar job state. Polling con backoff o SSE solo donde aporte.

## 24. Pruebas transversales

- Unitarias para lógica y componentes puros.
- MSW para integración sin XHR reales.
- Playwright: registro → onboarding → tendencia → FODA → oportunidad → hipótesis → proyecto → sprint/tarea.
- Axe/WCAG en rutas críticas.
- Regresión visual para design system, dashboard y landing.
- Web Vitals y budgets en CI.
- Cero warnings de React, Router o `act`.

## 25. Definition of Done por módulo

- Ruta y navegación coherentes con el nombre.
- API tipada y validada; sin llamadas HTTP directas desde componentes.
- Loading, empty, error, retry, success y estados sin permiso.
- Accesibilidad por teclado, foco y lector.
- Responsive 360/768/1024/1440.
- Pruebas unitarias/integración/E2E relevantes sin warnings.
- Telemetría de acción y error sin PII.
- Diseño basado en tokens; sin patrones visuales improvisados.
- Evidencia y procedencia visibles en todo contenido IA.

## 26. Secuencia de implementación

1. Shell/Router/Design System + Auth seguro.
2. Organization + Onboarding.
3. Trends + evidencia.
4. Copilot contextual.
5. SWOT → Opportunities → Hypotheses → Experiments.
6. Projects → Sprints → Tasks + Dashboard.
7. Calendar + landing optimizada/animación del logo.
8. Brand/Social.
9. Billing.
10. Audit/Developer/Integrations.
