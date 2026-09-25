# BOWOL Frontend — Guía de Desarrollo & Sistema de Diseño
> **React 18 • TypeScript • Vite • Tailwind CSS • Liquid Glass + iOS Minimal**

Bienvenido a la aplicación cliente de **BOWOL Platform**. Este módulo contiene la SPA (Single Page Application) construida bajo una arquitectura **Feature-Driven** orientada a componentes desacoplados, alto rendimiento, accesibilidad estricta y una estética de vanguardia (*Liquid Glass*).

---

## ⚡ 8 Principios de Diseño No Negociables

Antes de crear o modificar componentes, verifica que se cumplan estos 8 principios (criterio de rechazo en code review):

| # | Principio | En concreto en BOWOL | Cómo se valida |
| :-: | :--- | :--- | :--- |
| **1** | **Responsive Real** | Cada vista se diseña y valida en 375px, 768px, 1024px y 1440px. | Redimensionar la ventana en vivo, no solo en DevTools. |
| **2** | **Minimalista** | Si un elemento se puede quitar sin perder función ni claridad, se quita. | Preguntar: *"¿Qué se pierde si esto no está?"*. Si es nada, fuera. |
| **3** | **Moderno** | Referencia visual: Linear, Vercel, Arc, Apple (2026). Sin patrones Bootstrap 2015. | Comparar capturas contra referencias visuales. |
| **4** | **No Genérico** | Prohibido el look de plantilla prefabricada o dashboard IA sin dirección. | Pasar el test de la sección 11 de `docs/07-FRONTEND.md`. |
| **5** | **Cero Emojis** | Ningún emoji en botones, badges, toasts, vacíos ni títulos. Solo iconografía vectorial. | Búsqueda de caracteres emoji en el diff antes de commit. |
| **6** | **Paleta Controlada** | Naranja de marca (`brand-500`) máximo al **~8%** de superficie visible. | El color comunica acción y jerarquía, nunca decoración masiva. |
| **7** | **Logo como Marca** | Respetar variantes aprobadas (light/dark/mark), tamaños mínimos y espacio de respiro. | Prohibido estirar, rotar o recolorear el isotipo. |
| **8** | **Composición en Grid** | Alineación estricta al grid de 12 columnas. Espaciados múltiplos de 4px. | Activar el overlay de grid en desarrollo. |

---

## 🔘 Sistema de Botones (`Button`)

El componente base `<Button />` reside en `src/components/ui/Button.tsx` y está construido utilizando `class-variance-authority` (CVA) sobre primitivos de Radix UI y Tailwind CSS.

### 1. Las 5 Variantes Disponibles

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-out-soft ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ' +
  'disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        // 1. CTA Primario de Acción (Acento naranja con relieve interior y glow sutil)
        primary:
          'bg-brand-500 text-white hover:bg-brand-600 ' +
          'shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(249,115,22,0.3)] ' +
          'hover:shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_20px_rgba(249,115,22,0.4)]',

        // 2. Secundario Elevado (Superficie Liquid Glass, borde suave y backdrop-blur)
        secondary:
          'bg-surface-elevated dark:bg-surface-dark-elevated ' +
          'border border-surface-border dark:border-surface-dark-border ' +
          'text-zinc-900 dark:text-zinc-100 ' +
          'backdrop-blur-glass hover:bg-surface-glass hover:border-zinc-300 dark:hover:border-zinc-700',

        // 3. Ghost / Sutil (Para barras de herramientas y acciones de bajo peso visual)
        ghost:
          'text-zinc-700 dark:text-zinc-300 ' +
          'hover:bg-zinc-900/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white',

        // 4. Glass Translúcido (Para superposición sobre fondos contrastados o imágenes)
        glass:
          'bg-white/10 dark:bg-white/5 text-white ' +
          'backdrop-blur-glass border border-white/15 ' +
          'hover:bg-white/15 hover:border-white/25',

        // 5. Destructivo / Danger (Exclusivo para confirmaciones críticas o eliminar)
        danger:
          'bg-red-500 text-white hover:bg-red-600 ' +
          'shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.4)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-sm',
        md: 'h-10 px-4 text-base rounded-md',
        lg: 'h-12 px-6 text-lg rounded-md',
        icon: 'h-10 w-10 rounded-md p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

### 2. Especificación de Tamaños
- **`sm` (32px):** Para tablas de datos, filtros densos y tarjetas compactas.
- **`md` (40px):** Tamaño por defecto para formularios, modales y barras de acciones.
- **`lg` (48px):** Para CTAs principales de onboarding o páginas de aterrizaje.
- **`icon` (40×40px):** Cuadrado para botones con solo ícono. **Obligatorio incluir `aria-label`**.

### 3. Reglas de Copy para Botones
- **Voz activa y verbos específicos:** *"Guardar cambios"* (no *"Enviar"* o *"Aceptar"*), *"Crear proyecto"*, *"Iniciar análisis"*, *"Publicar"*.
- **Cero flechas decorativas:** Prohibido agregar flechas como `"Ver más →"` o `"Continuar >"`. El diseño del componente comunica la interactividad.
- **Coherencia de verbos:** Si el botón dice *"Publicar"*, el toast de confirmación debe decir *"Publicado"* (mismo verbo en todo el flujo).

---

## 🎨 Sistema de Iconografía (Lucide React & CERO EMOJIS)

### ¿Por qué CERO EMOJIS en BOWOL?
1. **Inconsistencia entre Sistemas:** Un emoji se renderiza de forma completamente distinta en iOS, Windows, macOS y Android.
2. **Percepción de Prototipo:** Comunican chat informal y restan credibilidad corporativa. Herramientas de referencia como *Linear* o *Vercel* jamás usan emojis en su UI.
3. **Control Total:** La iconografía vectorial SVG hereda estilos, escala y contraste accesible sin excepciones.

### Estándar Técnico de Iconos
- **Librería oficial:** `lucide-react` (exclusivamente).
- **Grosor de trazo obligatorio:** `strokeWidth={1.5}` (fino y minimalista; no usar 2.0 ni trazos gruesos).
- **Color:** Siempre dinámico mediante `currentColor` heredando el token de texto de su contenedor.
- **Tamaños estándar:**
  - **16px (`h-4 w-4`):** Texto en línea, badges, pills y metadatos de tabla.
  - **20px (`h-5 w-5`):** Botones, items del sidebar y barras de navegación.
  - **24px (`h-6 w-6`):** Encabezados de sección y títulos de tarjeta.

---

### Mapeo Exhaustivo de Iconos por Dominio y Módulo

#### 1. Navegación Principal y Módulos de Negocio
| Módulo / Feature | Icono Lucide | Componente Importado | Propósito / Contexto |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `LayoutDashboard` | `import { LayoutDashboard } from 'lucide-react'` | Vista general y métricas ejecutivas. |
| **Tendencias** | `TrendingUp` | `import { TrendingUp } from 'lucide-react'` | Explorador de tendencias e índice de señal. |
| **Investigación IA** | `Sparkles` / `Bot` | `import { Sparkles, Bot } from 'lucide-react'` | Asistente conversacional y generación con IA. |
| **FODA / SWOT** | `Grid2X2` | `import { Grid2X2 } from 'lucide-react'` | Matriz de 4 cuadrantes estratégicos. |
| **Oportunidades** | `Target` / `Compass` | `import { Target, Compass } from 'lucide-react'` | Priorización de oportunidades y RICE. |
| **Hipótesis** | `Lightbulb` | `import { Lightbulb } from 'lucide-react'` | Formulación de hipótesis de negocio. |
| **Experimentos** | `FlaskConical` | `import { FlaskConical } from 'lucide-react'` | Validación y experimentación iterativa. |
| **Proyectos** | `FolderKanban` | `import { FolderKanban } from 'lucide-react'` | Gestión de iniciativas y portafolio. |
| **Sprints** | `IterationCcw` / `Zap` | `import { IterationCcw, Zap } from 'lucide-react'` | Ciclos ágiles y medición de velocidad. |
| **Tareas** | `CheckSquare` | `import { CheckSquare } from 'lucide-react'` | Tablero Kanban y backlog operativo. |
| **Social** | `Share2` | `import { Share2 } from 'lucide-react'` | Presencia y analítica de redes sociales. |
| **Marca / Brand** | `Palette` | `import { Palette } from 'lucide-react'` | Manual de marca, colores y guías de tono. |
| **Calendario** | `Calendar` | `import { Calendar } from 'lucide-react'` | Hitos, publicaciones y eventos del equipo. |
| **Integraciones** | `Plug` | `import { Plug } from 'lucide-react'` | Conectores externos (GitHub, Google, Slack). |
| **Facturación** | `CreditCard` | `import { CreditCard } from 'lucide-react'` | Planes de suscripción y recibos de pago. |
| **Ajustes** | `Settings` | `import { Settings } from 'lucide-react'` | Preferencias de usuario y del sistema. |
| **Organización** | `Building2` / `Users`| `import { Building2, Users } from 'lucide-react'` | Configuración multi-tenant y gestión de miembros. |
| **Business Profile** | `Briefcase` | `import { Briefcase } from 'lucide-react'` | Perfil de negocio y contexto empresarial. |

#### 2. Acciones e Interacciones de Interfaz
| Acción | Icono Lucide | Ejemplo de Uso |
| :--- | :--- | :--- |
| **Crear / Añadir** | `Plus` | `<Button><Plus className="h-4 w-4" strokeWidth={1.5} /> Nueva tarea</Button>` |
| **Buscar** | `Search` | Input de búsqueda de tendencias o Command Palette (`Cmd+K`). |
| **Filtrar** | `Filter` | Menú desplegable de filtros en tablas o vistas de lista. |
| **Ordenar** | `ArrowUpDown` | Ordenamiento de columnas en tablas de datos. |
| **Editar** | `Pencil` / `Edit3` | Acción para modificar títulos o descripciones inline. |
| **Eliminar** | `Trash2` | Acción destructiva (siempre acompañada de `variant="danger"`). |
| **Copiar** | `Copy` / `Check` | Copiar enlaces de invitación o fragmentos generados por IA. |
| **Descargar** | `Download` | Exportar informes ejecutivos o reportes en PDF/CSV. |
| **Enlace Externo** | `ArrowUpRight` | Enlaces hacia GitHub, YouTube u orígenes de tendencias. |
| **Opciones** | `MoreHorizontal` | Menú contextual de tarjeta o fila de tabla. |
| **Refrescar** | `RefreshCw` | Reintentar carga o actualizar datos del servidor. |
| **Cerrar** | `X` | Botón para cerrar modales, drawers o descartar notificaciones. |
| **Sidebar Toggle** | `PanelLeftClose` / `PanelLeftOpen` | Colapsar o expandir el menú lateral. |

#### 3. Estados Semánticos y Feedback
| Estado | Icono Lucide | Color Semántico | Uso |
| :--- | :--- | :--- | :--- |
| **Éxito** | `CheckCircle2` | `text-emerald-500` (`#10B981`) | Notificaciones toast de guardado o éxito. |
| **Advertencia**| `AlertTriangle`| `text-amber-500` (`#F59E0B`) | Alertas de cuotas de tokens o fechas límite. |
| **Error** | `AlertCircle` | `text-red-500` (`#EF4444`) | Mensajes de error en formularios o fallos de red. |
| **Info** | `Info` | `text-blue-500` (`#3B82F6`) | Tooltips de ayuda o notas explicativas. |
| **Tiempo** | `Clock` | `text-zinc-400` | Estimaciones de tiempo o tareas en backlog. |

---

## 🏛️ Estructura Feature-Driven

Todo nuevo desarrollo se aísla dentro de su módulo en `src/features/<modulo>/`:

```text
src/features/trends/
├── components/          # Componentes privados de la feature (TrendCard, TrendFilters)
├── hooks/               # Hooks de datos (useTrends, useTrendDetail)
├── services/            # Peticiones API (fetchTrends, evaluateRelevance)
├── types/               # Tipos TypeScript específicos del dominio
├── schemas/             # Validadores Zod para formularios o query params
├── pages/               # Vistas principales montadas en el enrutador
│   ├── TrendsListPage.tsx
│   └── TrendDetailPage.tsx
└── README.md            # Propósito y contratos de la feature
```

---

## 🛠️ Scripts y Flujo de Trabajo

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en http://localhost:3000
npm run dev

# 3. Comprobación estricta de tipos de TypeScript
npm run typecheck

# 4. Análisis de linting (cero warnings permitidos)
npm run lint

# 5. Compilación optimizada para producción
npm run build
```

---

## 📋 Checklist Obligatorio antes de cada Commit

- [ ] **Cero Emojis:** Se verificó que no existan emojis en código, textos, botones ni badges.
- [ ] **Iconos Lucide:** Todos los iconos tienen `strokeWidth={1.5}` y tamaño consistente (16px, 20px o 24px).
- [ ] **Botones:** Usan variantes de CVA, verbos en voz activa y sin flechas decorativas `"→"`.
- [ ] **Responsive:** Probado en 375px (móvil), 768px (tablet), 1024px (desktop) y 1440px (pantalla grande).
- [ ] **Paleta Controlada:** El naranja de marca no excede el ~8% de la superficie visual.
- [ ] **Tipos:** `npm run typecheck` ejecuta limpiamente sin `any` ni `as unknown`.
