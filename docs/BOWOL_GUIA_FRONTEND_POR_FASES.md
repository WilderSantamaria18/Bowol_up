# BOWOL — Guía de implementación Frontend por fases

> Repositorio auditado: `WilderSantamaria18/Bowol_up`, rama `main`, commit `5d6b1078cb22af6de9f42e7cdf68ce127c4e1560`.
> Alcance: React 18, TypeScript, Vite, Tailwind, TanStack Query, Framer Motion, GSAP y la landing con el SVG original de BOWOL.

## 1. Qué debe comunicar el frontend

El frontend no debe parecer un conjunto de pantallas generadas de forma aislada. Debe hacer visible un solo ciclo:

`señal → evidencia → decisión → experimento → ejecución → aprendizaje`

La interfaz actual tiene una base valiosa: rutas lazy, módulos por feature, diseño claro/oscuro, componentes, estados y una landing avanzada. La mejora no consiste en rehacer todo ni agregar más efectos. Consiste en reducir ruido, unificar decisiones visuales, hacer que los datos sean creíbles y llevar al usuario a completar el ciclo.

## 2. Estado verificado

- 180 archivos TypeScript/TSX.
- 19 archivos de pruebas y 62 pruebas aprobadas.
- TypeScript y build de producción aprobados.
- Lazy loading por página ya implementado.
- Bundle de producción actual:
  - JS principal: ~253.6 kB sin comprimir / ~68.7 kB gzip.
  - `vendor-motion`: ~204.4 kB / ~71.7 kB gzip.
  - `vendor-react`: ~162.7 kB / ~53.1 kB gzip.
  - CSS: ~99.6 kB / ~16.1 kB gzip.
- Advertencias de pruebas: React Router v7, peticiones XHR no interceptadas y estado no envuelto en `act`.

## 3. Problemas que deben corregirse

| Prioridad | Hallazgo | Decisión |
|---|---|---|
| P0 | Access y refresh token están en `localStorage` | Access token en memoria y refresh en cookie `HttpOnly`; el frontend no debe leer el refresh token. |
| P0 | Experiencia autenticada depende de muchos módulos a la vez | Priorizar un recorrido principal y ocultar módulos incompletos con feature flags. |
| P0 | Rutas provisionales reutilizan páginas | `/experiments` carga `HypothesesPage`; `/projects` carga `TaskBoardPage`; `/brand` carga `SocialPage`. Crear páginas reales o retirar rutas. |
| P1 | Dos motores de animación globales | Definir fronteras: GSAP solo para narrativa scroll de landing; Framer Motion para microinteracciones de la app. Cargar GSAP solo en landing. |
| P1 | `AnimatedLogoCompanion` concentra SVG, física, partículas, CTA y scroll | Separar asset, timeline, estados, reduced motion y CTAs; probar y medir cada capa. |
| P1 | Estilos oscuros y utilidades se repiten por feature | Tokens semánticos y primitives únicos; eliminar colores/espaciados hardcodeados gradualmente. |
| P1 | `lint` solo ejecuta TypeScript | Incorporar ESLint, reglas de hooks, accesibilidad y Prettier/formatter. |
| P1 | Pruebas pasan con ruido | Incorporar MSW y arreglar `act`; warnings deben fallar CI cuando sean nuevos. |
| P2 | Algunos fallbacks parecen datos reales | Etiquetar demo, vacío y datos reales; evitar métricas “curadas” sin procedencia. |
| P2 | Landing extensa y visualmente intensa | Reducir secciones repetidas, priorizar propuesta de valor y prueba del producto. |

## 4. Principios de diseño no genérico

### Identidad BOWOL

- Mantener el ámbar/naranja como señal de avance, no como relleno omnipresente.
- Neutros limpios, contraste alto y superficies con profundidad moderada.
- El cohete/W original es la firma; no sustituirlo por un icono genérico.
- La geometría del logo debe inspirar diagonales, trayectorias y progresión, no decorar cada tarjeta.
- Tipografía, iconos y microcopy deben sentirse ejecutivos y técnicos, no futuristas vacíos.

### Reglas anti-“diseño de IA”

- No agregar gradientes neón, glassmorphism o brillos si no indican jerarquía/estado.
- No llenar dashboards con cifras inventadas para que “se vean completos”.
- No usar textos abstractos como “potencia tu futuro”; explicar acción, evidencia y resultado.
- No crear una tarjeta diferente para cada bloque. Reutilizar patrones con intención.
- No animar todo. Cada movimiento debe explicar entrada, relación, cambio de estado o progreso.

### Sistema base

- Escala de espaciado fija: 4, 8, 12, 16, 24, 32, 48, 64.
- Radios limitados a 3 niveles.
- Sombras limitadas a superficie, elevación y modal.
- Tipos: display, heading, body, label, mono/data.
- Tokens semánticos: `surface`, `surface-raised`, `text`, `text-muted`, `border`, `brand`, `success`, `warning`, `danger`, `info`.
- Cinco variantes de botón como máximo: primary, secondary, ghost, danger, icon.

## 5. Fase 0 — Higiene técnica y línea base visual

**Objetivo:** asegurar que la interfaz sea mantenible antes de rediseñar.

### Trabajo

- Instalar/configurar ESLint, React Hooks, jsx-a11y y formatter.
- Cambiar CI a `npm ci` usando `package-lock.json`.
- Añadir MSW para que las pruebas no intenten alcanzar la API real.
- Corregir todas las advertencias de `act` y React Router.
- Añadir Storybook o catálogo equivalente solo para primitives y patrones de negocio.
- Incorporar `ErrorBoundary`, página de error y recuperación por ruta.
- Definir variables de ambiente validadas al inicio; fallar con mensaje claro si faltan.
- Configurar presupuestos de bundle y reporte visual de chunks.
- Capturar línea base de Lighthouse en móvil y escritorio.

### Comandos mínimos

```bash
cd frontend
npm ci
npm run typecheck
npm test -- --run
npm run build
```

### Criterios de aceptación

- Cero warnings en pruebas.
- Cero errores de accesibilidad graves en rutas críticas.
- Build reproducible y presupuesto de bundle documentado.

## 6. Fase 1 — Design system BOWOL limpio

**Objetivo:** que todas las pantallas parezcan parte del mismo producto.

### Trabajo

- Inventariar colores, tipografías, radios, sombras y z-index actuales.
- Convertir `globals.css` y Tailwind a tokens semánticos.
- Consolidar `Button`, `Input`, `Select`, `Card`, `Badge`, modal, tooltip, tabs, table, toast, skeleton, empty state y error state.
- Añadir estados completos: default, hover, focus-visible, active, disabled, loading, success y error.
- Crear patrones propios:
  - `EvidenceBadge` y `SourceCitation`.
  - `TrendScore` con explicación accesible.
  - `DecisionTrail` para la trazabilidad.
  - `CycleProgress` para el flujo de innovación.
  - `AIAction` que muestre coste/estado y requiera confirmación cuando escribe.
- Eliminar carpetas vacías y exports sin uso; definir barrel files solo donde simplifiquen.

### Criterios de aceptación

- Ninguna feature nueva introduce colores o botones fuera de tokens.
- Teclado y foco visibles en todos los componentes interactivos.
- Light/dark mantienen WCAG AA en texto y controles.

## 7. Fase 2 — Arquitectura frontend y datos

**Objetivo:** separar experiencia, estado remoto y lógica de negocio.

### Estructura recomendada por feature

```text
features/<dominio>/
  api/
  components/
  hooks/
  pages/
  schemas/
  types/
  tests/
```

### Trabajo

- TanStack Query como fuente única del estado servidor.
- Query keys centralizadas por dominio.
- Invalidación explícita luego de mutaciones; optimismo solo en acciones reversibles.
- Validar respuestas en runtime con esquemas para límites críticos.
- Eliminar refresh token de `AuthContext` y `localStorage`.
- Interceptor coordinado para un único refresh concurrente y reintento controlado.
- Tratar 401, 403, 409, 422, 429 y 5xx de forma diferenciada.
- Formularios con validación compartida y errores por campo.
- Reemplazar las rutas provisionales por pantallas reales o quitarlas de navegación.
- Feature flags para social, billing, developer y funciones no listas.

### Criterios de aceptación

- No hay llamadas HTTP directas desde componentes visuales.
- No hay datos de servidor duplicados en contextos globales.
- Toda pantalla tiene loading, empty, error, retry y success.

## 8. Fase 3 — Experiencia del usuario autenticado

**Objetivo:** alcanzar el primer valor en menos de 10 minutos.

### Flujo primario

1. Registro.
2. Creación de organización.
3. Onboarding del perfil empresarial.
4. Selección de objetivos.
5. Primeras tendencias relevantes.
6. Primer FODA con evidencia.
7. Primera oportunidad priorizada.
8. Conversión a experimento/proyecto.

### Trabajo

- Dashboard como “siguiente mejor acción”, no solo mosaico de métricas.
- Navegación principal alineada al ciclo, con 5–7 entradas máximas.
- Onboarding con guardado parcial, retorno y explicación de por qué se pide cada dato.
- Métrica de progreso visible y no punitiva.
- Evidencias siempre accesibles desde tendencias, FODA y oportunidades.
- Confirmación para operaciones IA con expectativa de duración.
- Estados asíncronos persistentes; no bloquear toda la pantalla mientras IA trabaja.
- Historial de decisiones y cambios.
- Responsive real para 360, 768, 1024 y 1440 px.

### Criterios de aceptación

- Un usuario nuevo completa el primer FODA sin ayuda externa.
- El usuario siempre puede responder “de dónde salió esto”.
- Las acciones principales son alcanzables por teclado y lector de pantalla.

## 9. Fase 4 — Landing page: claridad y conversión

**Objetivo:** conservar la personalidad visual, pero vender el producto con evidencia.

### Arquitectura recomendada

1. Hero: promesa concreta + CTA de prueba + CTA de demostración.
2. Prueba inmediata del ciclo con un ejemplo realista.
3. Problema en tres señales breves.
4. Cómo funciona: señal → estrategia → ejecución.
5. Producto: capturas/interacción controlada de 3 módulos centrales.
6. Evidencia/seguridad/fuentes.
7. Plan inicial o acceso anticipado.
8. FAQ y CTA final.

### Qué conservar

- Logo SVG original.
- Narrativa de despegue/trayectoria.
- Ámbar BOWOL y contraste oscuro/claro.
- Sensación técnica y estratégica.

### Qué reducir

- Efectos simultáneos de aurora, partículas, grilla, ticker, tilt y movimiento continuo.
- Secciones que repiten la misma promesa.
- Métricas no demostrables.
- Texto excesivamente corporativo antes de mostrar el producto.

### SEO y rendimiento

- Metadatos por página, Open Graph, canonical y JSON-LD de SoftwareApplication.
- HTML semántico, una sola H1 y encabezados jerárquicos.
- Assets con dimensiones, `loading` y formatos adecuados.
- No cargar código de la aplicación autenticada en la landing si no se necesita.
- Objetivos: LCP < 2.5 s, INP < 200 ms, CLS < 0.1 en móvil p75.

## 10. Fase 5 — Mejora de la animación del logo SVG original

**Objetivo:** convertir el logo en una firma narrativa elegante, no en un efecto preestablecido.

### Problema actual

`AnimatedLogoCompanion.tsx` combina un SVG grande inline, timeline de scroll, física por velocidad, partículas en estado React, CTA contextual y estilos. También hace un giro de 360° al clic. Esto es llamativo, pero puede competir con el mensaje, aumentar el coste de render y hacer que la marca parezca un objeto genérico animado.

### Concepto propuesto: “De señal a trayectoria”

La animación debe contar el producto en cuatro actos usando la geometría real W/cohete:

1. **Señal:** aparecen puntos/segmentos esenciales del emblema, como datos dispersos.
2. **Síntesis:** los trazos se ensamblan hasta formar el logo original sin deformarlo.
3. **Ignición:** un pulso ámbar recorre el eje del cohete; la llama se activa con baja amplitud.
4. **Trayectoria:** al hacer scroll, el emblema se desplaza por una curva corta que conecta visualmente con el ciclo del producto; luego se estaciona o desaparece, sin perseguir al usuario por toda la landing.

### Reglas de implementación

- El SVG fuente será `logo/bowol_logo1.svg` o su variante oficial; no redibujar la marca a ojo.
- Extraer a un componente `BowolHeroMark` con IDs estables y `aria-hidden` cuando sea decorativo.
- Extraer animación a `useBowolLogoTimeline` y configuración a un archivo declarativo.
- Usar transform y opacity; evitar recalcular layout en cada frame.
- No actualizar partículas con `setState` por frame. Usar CSS/GSAP en elementos limitados o Canvas solo si la medición lo justifica.
- Sustituir el giro 360° por un pulso/impulso corto alineado al eje del cohete.
- Una sola entrada automática; las siguientes interacciones deben ser deliberadas.
- Detener animación al salir del viewport y al ocultarse la pestaña.
- `prefers-reduced-motion`: logo estático + fade de ≤ 200 ms.
- En móvil: sin compañero lateral ni partículas; ensamblaje breve y estático después.
- Reservar tamaño para evitar CLS y proporcionar poster estático si JS falla.

### Estructura sugerida

```text
features/landing/logo-motion/
  BowolHeroMark.tsx
  useBowolLogoTimeline.ts
  bowolLogoMotion.config.ts
  BowolHeroMark.test.tsx
```

### Pruebas

- Capturas de inicio, ensamblado, ignición y reposo.
- Reduced motion sin transformaciones prolongadas.
- Reflow/long tasks medidos en móvil medio.
- Sin listeners o ScrollTriggers huérfanos al desmontar.
- Misma silueta y proporciones que el SVG oficial.

### Criterios de aceptación

- La animación apoya la promesa en ≤ 4 segundos.
- Ningún frame de animación bloquea interacción.
- No aumenta el CLS.
- La marca se reconoce igual en estado animado y estático.

## 11. Fase 6 — Accesibilidad, calidad y rendimiento

**Objetivo:** convertir calidad visual en calidad usable.

### Trabajo

- WCAG 2.2 AA: contraste, foco, teclado, targets, labels, errores y live regions.
- Playwright para registro, onboarding y ciclo principal.
- Axe en CI para rutas críticas.
- Visual regression de componentes y landing.
- MSW para pruebas deterministas.
- Separar `vendor-motion`: GSAP debe ser chunk exclusivo de landing.
- Revisar si ambas librerías de motion siguen justificadas después de medir.
- Virtualizar tablas/listas largas y paginar desde servidor.
- Usar React Profiler para dashboard, tendencias y board.
- Enviar Web Vitals con versión de frontend y ruta.

### Presupuestos iniciales

| Métrica | Objetivo |
|---|---:|
| Lighthouse Performance móvil | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| LCP p75 | < 2.5 s |
| INP p75 | < 200 ms |
| CLS p75 | < 0.1 |
| Errores JS por sesión | < 0.5% |

## 12. Fase 7 — Lanzamiento y aprendizaje

### Trabajo

- Analítica con eventos del ciclo, no vigilancia indiscriminada.
- Eventos: onboarding completado, tendencia revisada, FODA generado/editado, oportunidad priorizada, experimento creado y proyecto completado.
- Consentimiento y política de privacidad antes de analítica no esencial.
- Feature flags y rollout gradual.
- Sesiones de usabilidad con startups/PYMES peruanas del segmento elegido.
- Backlog basado en abandono del flujo y tiempo a primer valor.

## 13. Orden recomendado

| Fase | Duración orientativa | Entrega |
|---|---:|---|
| 0 | 1 semana | Calidad sin warnings y línea base |
| 1 | 2 semanas | Sistema visual BOWOL consistente |
| 2 | 2 semanas | Datos, auth y rutas saneados |
| 3 | 2–3 semanas | Flujo del usuario completo |
| 4 | 1–2 semanas | Landing más clara y medible |
| 5 | 1 semana | Animación del logo original refinada |
| 6 | 2 semanas | A11y, E2E y performance |
| 7 | Continua | Medición y mejora del producto |

## 14. Definition of Done frontend

- Diseño usa tokens y primitives aprobados.
- Estados loading, empty, error, retry y success están cubiertos.
- Teclado, foco y lector de pantalla funcionan.
- Pruebas unitarias, integración, E2E y visuales relevantes pasan sin warnings.
- No se guardan refresh tokens en Web Storage.
- Bundle y Web Vitals permanecen dentro del presupuesto.
- El usuario entiende la procedencia de datos y acciones IA.
- Animación respeta reduced motion y el SVG oficial.

## 15. Primera iteración ejecutable

1. Añadir ESLint/a11y y hacer fallar CI ante warnings.
2. Configurar MSW y limpiar las 62 pruebas actuales.
3. Sacar refresh token de `localStorage` coordinando el contrato backend.
4. Resolver `/experiments`, `/projects` y `/brand`.
5. Crear tokens semánticos y consolidar primitives.
6. Reducir navegación a los módulos MVP.
7. Separar `AnimatedLogoCompanion` y prototipar “De señal a trayectoria”.
8. Medir Lighthouse y Web Vitals antes/después.
