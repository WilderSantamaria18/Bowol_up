0. Antes de escribir código: 8 principios no negociables

Todo lo que sigue en este documento es la implementación detallada de estos 8 puntos. Son criterio de rechazo en code review por sí solos: un componente puede estar funcionalmente perfecto y aun así devolverse si viola uno de estos principios.

#	Principio	Qué significa en BOWOL, en concreto	Cómo se valida
1	Responsive real	No es "se ve bien en mi laptop de 15 pulgadas". Cada pantalla se diseña y prueba en 375px, 768px, 1024px y 1440px antes de darse por terminada.	Redimensionar la ventana en vivo, no solo revisar en DevTools una vez.
2	Minimalista	Cada elemento presente se ganó su lugar. Si se puede quitar sin perder información o función, se quita. Minimalista no es "vacío", es "sin relleno".	Preguntar por cada elemento: "¿qué pasa si esto no está?". Si la respuesta es "nada", fuera.
3	Moderno	Referencia visual: Linear, Vercel, Arc, Apple — 2026, no plantillas de 2015 ni el "look de dashboard" de 2021.	Comparar captura de pantalla contra referencias antes de aprobar.
4	No genérico	No debe poder confundirse con "cualquier SaaS hecho con una plantilla o generado por IA sin dirección". Ver checklist completo en la sección 11.	Test de la sección 11 en cada feature antes de merge.
5	Cero emojis en la interfaz	Ningún emoji en botones, badges, notificaciones, estados vacíos, onboarding, tooltips o copys de error/éxito. Solo iconografía vectorial consistente.	Buscar en el código de la feature cualquier carácter emoji antes de commit.
6	Paleta profesional y controlada	El color comunica significado (estado, jerarquía, marca), nunca decora porque "se ve bonito". Ver reglas de uso en 2.1.	Contar cuánta superficie visible usa el naranja de marca; no debe superar ~8%.
7	Logo como sistema de marca	El logo no es "un archivo SVG que se pega donde quepa". Tiene reglas de espacio, tamaño mínimo, variantes y lugares definidos. Ver sección 2.6.	Revisar contra la sección 2.6 en cada pantalla donde aparezca el logo.
8	Composición deliberada	Todo se alinea a un grid. Nada "flota" fuera de una columna o un borde compartido. El espaciado entre secciones sigue una escala, no valores arbitrarios.	Ver sección 2.8. Activar el overlay de grid en desarrollo para verificar alineación.
1. Filosofía de Diseño: Liquid Glass + iOS Minimal
1.1 ¿Qué es Liquid Glass?

Liquid Glass es el lenguaje de diseño introducido por Apple en 2025 (iOS 26, macOS Tahoe). Se caracteriza por:

Principio	Aplicación en BOWOL
Translucidez real	Paneles con backdrop-blur que muestran el contenido detrás
Refracción tipo lente	Bordes con gradientes sutiles que simulan vidrio curvado
Highlights especulares	Brillo superior que responde al scroll del usuario
Profundidad por capas	3 niveles: base, superficie, flotante (todas con blur progresivo)
Adaptación dinámica	El cristal cambia según el fondo (claro/oscuro)
Respuesta al movimiento	Parallax sutil al hacer scroll (sin abusar)
1.2 Combinación con Minimalismo iOS

BOWOL no copia iOS, se inspira en su rigor:

Tipografía Inter: tracking amplio, pesos 400/500/600, nunca más de 3 pesos por pantalla.
Espaciado generoso: el doble de padding del que "parece suficiente". El aire es premium.
Jerarquía clara: un solo h1 por pantalla, máximo 2 CTAs primarios visibles.
Iconografía fina: Lucide con stroke-width: 1.5 (no 2 ni 3), nunca emoji (ver sección 2.7).
Animaciones spring: cubic-bezier(0.34, 1.56, 0.64, 1) para entrada, ease-out para salida — y solo en un momento coreografiado por vista, no en cascada sobre cada tarjeta.
Nada de bordes duros: border: 1px solid rgba(255,255,255,0.08) en dark, rgba(0,0,0,0.06) en light.

Minimalista, en la práctica, quiere decir esto: antes de dar una pantalla por terminada, se revisa elemento por elemento y se pregunta "¿qué se pierde si esto no está?". Si la respuesta es "nada", se elimina. Un dashboard con menos widgets pero mejor jerarquizados comunica más control que uno con todo visible a la vez.

1.3 Anti-patrones prohibidos
Anti-patrón	Por qué está prohibido
Botones con bg-blue-500 sin más	Se ve genérico, no comunica marca
Cards con shadow-md estándar	Sombra plana, sin profundidad real
Inputs con border-gray-300	Estilo Bootstrap de 2015
Sidebar con fondo gris sólido	Rompe la estética liquid glass
Tablas con bordes completos	Usar solo separadores horizontales sutiles
Iconos rellenos tipo Material	Usar solo outline con stroke fino
Gradientes multicolor chillones	Solo gradientes monocromáticos sutiles
Emojis como iconos (botones, badges, toasts, estados vacíos)	Se renderizan distinto en cada sistema operativo, comunican "prototipo" en vez de producto y son la señal más rápida de que algo no tuvo dirección de diseño
Logo estirado, recoloreado fuera de sus variantes, o sin espacio de respiro	Diluye el reconocimiento de marca; ver reglas exactas en 2.6
Mismo border-radius en absolutamente todo	Kit genérico de "tarjetas SaaS": todo redondeado igual, con la misma sombra gris suave debajo, sin jerarquía
Elementos que no se alinean a ninguna columna o borde compartido	Se percibe como desorden, típico de un dashboard ensamblado a la carrera
Etiquetas en MAYÚSCULAS con tracking amplio sobre cada título ("eyebrow labels")	Es la muletilla más común de las plantillas genéricas; úsalo solo si de verdad aporta una categoría que el usuario necesita ver
Textos con guion largo tipo "Palabra — fragmento" o metadatos unidos con punto medio ("A · B · C")	Chrome decorativo sin función, tell clásico de contenido plantillado
Flechas "→" pegadas al final de botones o links ("Ver más →")	Decoración vacía; si el link necesita indicar navegación, el diseño del componente ya debería comunicarlo
Marcadores numerados 01 / 02 / 03 como decoración	Solo son válidos si el contenido es realmente una secuencia (pasos de un flujo, línea de tiempo). Si no lo es, no numerar
Acentuar una sola palabra del título en cursiva/color/negrita	Es el default de cualquier landing genérica; si algo merece énfasis, que sea por jerarquía tipográfica real, no por un truco puntual
2. Design System de BOWOL
2.1 Paleta de colores

Filosofía: dos modos (light/dark) con contraste alto, acento naranja de marca usado con moderación (máximo 8% de superficie por pantalla).

ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Marca BOWOL
        brand: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Acento principal (naranja del logo)
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Superficies Liquid Glass - Light
        surface: {
          base:      'rgba(255, 255, 255, 1)',
          elevated:  'rgba(255, 255, 255, 0.72)',
          glass:     'rgba(255, 255, 255, 0.55)',
          border:    'rgba(0, 0, 0, 0.06)',
        },
        // Superficies Liquid Glass - Dark
        'surface-dark': {
          base:      'rgba(10, 10, 12, 1)',
          elevated:  'rgba(24, 24, 27, 0.72)',
          glass:     'rgba(39, 39, 42, 0.55)',
          border:    'rgba(255, 255, 255, 0.08)',
        },
        // Semánticos
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '24px',
        'glass-heavy': '40px',
      },
      boxShadow: {
        // Sombras con color, no negro puro
        'glass-sm': '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.06) inset',
        'glass-md': '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.08) inset',
        'glass-lg': '0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.10) inset',
        'brand-glow': '0 8px 24px rgba(249,115,22,0.28)',
      },
      borderRadius: {
        'xs':  '6px',
        'sm':  '10px',
        'md':  '14px',
        'lg':  '18px',
        'xl':  '24px',
        '2xl': '32px',
      },
    },
  },
}
Reglas de uso de color (profesional, no decorativo)
El naranja de marca (brand-500) es para acción e identidad, no para decorar. Úsalo en: CTA primario, item activo de navegación, foco de inputs, indicadores de progreso. Nunca en: fondos grandes, íconos decorativos, texto de cuerpo.
Presupuesto de color por pantalla: ~8% de superficie en naranja, como máximo. Si una pantalla se ve "anaranjada", hay que quitar naranja, no ajustar el tono.
Los colores semánticos (success, warning, danger, info) significan siempre lo mismo. danger es exclusivamente para estados destructivos o errores reales, nunca para "llamar la atención" sobre algo que no es un error.
Contraste mínimo WCAG AA en todo texto (4.5:1 cuerpo, 3:1 elementos de UI grandes). Esto no es negociable ni siquiera por estética — se valida con herramientas automáticas antes de cada release.
Nunca un color hardcodeado fuera del token system. Si necesitas un tono que no existe en la paleta, es una señal de que falta un token, no una excusa para escribir un hex suelto.
Los grises (zinc) llevan la jerarquía tipográfica, no el color de marca. El naranja no reemplaza al gris para indicar "esto es importante": eso lo hace el tamaño, el peso y el espaciado.
2.2 Tipografía
css
/* Escala tipográfica — NO inventar tamaños fuera de esta escala */
--text-xs:    12px / 16px / -0.01em;  /* labels, badges */
--text-sm:    14px / 20px / -0.01em;  /* body pequeño, tablas */
--text-base:  15px / 24px / -0.011em; /* body principal (15, no 16) */
--text-lg:    17px / 26px / -0.014em; /* subtítulos */
--text-xl:    20px / 28px / -0.017em; /* títulos de card */
--text-2xl:   24px / 32px / -0.019em; /* títulos de sección */
--text-3xl:   30px / 38px / -0.021em; /* títulos de página */
--text-4xl:   38px / 46px / -0.024em; /* hero */
--text-5xl:   48px / 56px / -0.026em; /* hero grande */

Reglas:

Nunca más de 3 pesos por pantalla. Recomendado: 400 (body), 500 (énfasis), 600 (títulos).
tracking-tight en títulos grandes. tracking-normal en body.
Números siempre con font-variant-numeric: tabular-nums en tablas y métricas.
Líneas de texto de cuerpo por debajo de ~80 caracteres de ancho. Un párrafo que ocupa todo el ancho de un contenedor de 1440px es ilegible, aunque el diseño "se vea completo".
No acentuar una sola palabra de un título con cursiva, color o negrita distinta — es el default de cualquier landing genérica. Si un título necesita énfasis real, se resuelve con jerarquía (tamaño, peso, posición), no con un truco tipográfico puntual.
No usar etiquetas en mayúsculas con tracking amplio ("eyebrow labels") por costumbre. Solo si de verdad hay una categoría que el usuario necesita identificar antes de leer el título.
2.3 Espaciado

Base: 4px. Escala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

Regla de oro: si dudas entre p-4 y p-6, elige p-6. El aire se siente premium.

2.4 Los 3 niveles de profundidad (Liquid Glass)
tsx
// Nivel 1: Base (fondo de la app)
<div className="bg-surface-base dark:bg-surface-dark-base">
  {/* Nivel 2: Superficie elevada (cards, paneles) */}
  <div className="
    bg-surface-elevated dark:bg-surface-dark-elevated
    backdrop-blur-glass
    border border-surface-border dark:border-surface-dark-border
    rounded-lg shadow-glass-md
  ">
    {/* Nivel 3: Flotante (modales, dropdowns, tooltips) */}
    <div className="
      bg-surface-glass dark:bg-surface-dark-glass
      backdrop-blur-glass-heavy
      border border-surface-border dark:border-surface-dark-border
      rounded-xl shadow-glass-lg
    ">
      Contenido flotante
    </div>
  </div>
</div>
2.5 Motion Design
ts
// tailwind.config.ts
transitionTimingFunction: {
  'spring':     'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'ease-in-soft':  'cubic-bezier(0.7, 0, 0.84, 0)',
},
animation: {
  'fade-in':    'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-up':   'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
  'scale-in':   'scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  'shimmer':    'shimmer 2s linear infinite',
},

Duraciones estándar:

Hover: 150ms
Entrada de modal: 250ms
Transición de página: 300ms
Skeleton shimmer: 2000ms loop

Regla de restricción: un solo momento de movimiento coreografiado por vista (por ejemplo, la entrada del dashboard al cargar), no una animación de entrada en cada tarjeta en cascada — eso es el default genérico y se siente ruidoso, no premium. El movimiento que responde a una acción del usuario (abrir, expandir, confirmar) sí es bienvenido siempre, porque muestra qué cambió.

2.6 Sistema de marca: uso del logo

El logo no es "un archivo que se pega donde quepa". Es el elemento de mayor reconocimiento de marca en toda la plataforma y se trata con las mismas reglas que cualquier producto enterprise.

Variantes que deben existir en assets/:

Archivo	Uso
logo-bowol-full-light.svg	Isotipo + wordmark, para fondos claros
logo-bowol-full-dark.svg	Isotipo + wordmark, para fondos oscuros
logo-bowol-mark.svg	Solo el ícono/isotipo, sin texto — para espacios reducidos
favicon.svg / favicon-32.png / favicon-16.png	Solo el ícono, optimizado para tamaños pequeños

Espacio de respiro (clear space): alrededor del logo, dejar como mínimo un margen equivalente a la altura del isotipo. Ningún texto, ícono o borde de contenedor puede invadir ese espacio.

Tamaño mínimo: el logo completo (isotipo + wordmark) nunca se muestra por debajo de 24px de alto. El isotipo solo, nunca por debajo de 20px. Si el espacio disponible es menor, se usa el isotipo, no se reduce el logo completo hasta perder legibilidad.

Dónde va cada variante:

Lugar	Variante	Nota
Sidebar expandida	Logo completo	Alineado a la izquierda, con el mismo padding horizontal que el resto de items del nav
Sidebar colapsada (72px)	Solo isotipo	Centrado horizontalmente
Pantallas de auth (login/register)	Logo completo	Esquina superior izquierda del panel, nunca centrado sobre el formulario
Favicon / pestaña del navegador	Solo isotipo	Sin texto, contraste verificado sobre fondo claro y oscuro del navegador
Splash / estado de carga inicial	Isotipo, con animación sutil de aparición (fade + scale, easing spring)	Con prefers-reduced-motion, se muestra estático, sin animación
Exportaciones (PDF, futuros emails)	Logo completo, siempre en variante light	Independiente del tema que el usuario tenga activado en la app

Nunca:

Estirar, comprimir o alterar la proporción del logo.
Recolorear el isotipo con un color fuera de sus variantes aprobadas (no ponerlo en gris, no ponerlo en degradado).
Agregarle sombra, glow o efectos que no formen parte de su diseño original.
Rotarlo o inclinarlo por motivos decorativos.
Colocarlo sobre una superficie que no pase el contraste mínimo — probar siempre contra los tokens de surface, no sobre imágenes o fondos no controlados.

Siempre:

Usar el isotipo solo (sin wordmark) en cualquier espacio menor a ~140px de ancho disponible.
Mantener la misma variante (light/dark) en todo un mismo contexto visual; nunca mezclar variantes en una misma vista por descuido de theming.
2.7 Iconografía: cero emojis

Ningún emoji aparece en la interfaz de BOWOL. En ningún botón, badge, notificación, toast, estado vacío, tooltip, paso de onboarding o mensaje de error/éxito.

Por qué es una regla dura y no una preferencia de estilo:

Los emojis se renderizan distinto en cada sistema operativo y navegador (Apple, Windows, Android, cada uno con su propio set visual). Eso rompe el control de marca que da usar un solo sistema de iconos vectorial.
Comunican "prototipo" o "chat casual", no herramienta enterprise. BOWOL compite visualmente con Linear y Vercel, ninguno de los dos usa un solo emoji en su producto.
Es la señal más rápida y reconocible de que una pantalla fue ensamblada sin dirección de diseño.

Qué se usa en su lugar:

Únicamente iconos de la librería Lucide (ya está en las dependencias), con stroke-width: 1.5.
Tamaños consistentes según contexto: 16px en texto inline y badges, 20px en botones y items de nav, 24px en headers de sección.
Color vía currentColor, heredando el token de texto del contexto — nunca un color de ícono hardcodeado fuera de la paleta semántica.
Donde la tentación sería usar un emoji para "darle personalidad" a un estado vacío o de éxito (por ejemplo, una ilustración de celebración), se usa en su lugar: (a) un ícono Lucide acompañado de copy claro, o (b) una ilustración SVG propia en línea monocromática consistente con el resto del sistema — nunca un emoji ni un stock de ilustraciones genéricas de internet.

Excepción explícita: esta regla aplica al producto que ven los usuarios. No aplica a documentación interna del equipo (como este mismo documento, aunque aquí tampoco se usan por consistencia), comentarios de código, o mensajes de commit, donde cada equipo puede tener sus propias convenciones.


Catálogo oficial de iconos por feature y módulo (Lucide React con strokeWidth: 1.5):

Módulo / Feature | Icono Lucide | Componente Importado | Propósito
---|---|---|---
Dashboard | LayoutDashboard | import { LayoutDashboard } from 'lucide-react' | Vista general y métricas ejecutivas
Tendencias | TrendingUp | import { TrendingUp } from 'lucide-react' | Explorador de tendencias e índice de señal
Investigación IA | Sparkles / Bot | import { Sparkles, Bot } from 'lucide-react' | Asistente conversacional y generación
FODA / SWOT | Grid2X2 | import { Grid2X2 } from 'lucide-react' | Matriz de 4 cuadrantes estratégicos
Oportunidades | Target / Compass | import { Target, Compass } from 'lucide-react' | Priorización RICE de iniciativas
Hipótesis | Lightbulb | import { Lightbulb } from 'lucide-react' | Formulación de hipótesis de negocio
Experimentos | FlaskConical | import { FlaskConical } from 'lucide-react' | Validación iterativa de hipótesis
Proyectos | FolderKanban | import { FolderKanban } from 'lucide-react' | Portafolio de proyectos estratégicos
Sprints | IterationCcw / Zap | import { IterationCcw, Zap } from 'lucide-react' | Ciclos ágiles y medición de avance
Tareas | CheckSquare | import { CheckSquare } from 'lucide-react' | Tablero Kanban y backlog
Social | Share2 | import { Share2 } from 'lucide-react' | Analítica y gestión de redes sociales
Marca / Brand | Palette | import { Palette } from 'lucide-react' | Manual de marca y guías de tono
Calendario | Calendar | import { Calendar } from 'lucide-react' | Calendario unificado de hitos
Integraciones | Plug | import { Plug } from 'lucide-react' | Conectores externos (GitHub, Google, etc.)
Facturación | CreditCard | import { CreditCard } from 'lucide-react' | Planes SaaS y pagos
Ajustes | Settings | import { Settings } from 'lucide-react' | Preferencias de usuario y del sistema
Organización | Building2 / Users | import { Building2, Users } from 'lucide-react' | Gestión de workspaces y miembros
Business Profile | Briefcase | import { Briefcase } from 'lucide-react' | Perfil de negocio corporativo

Acciones comunes de interfaz:

Acción | Icono Lucide | Ejemplo de Uso
---|---|---
Crear / Añadir | Plus | <Plus className="h-4 w-4" strokeWidth={1.5} />
Buscar | Search | Barra de búsqueda o Command Palette (Cmd+K)
Filtrar | Filter | Menús desplegables de filtrado
Ordenar | ArrowUpDown | Ordenamiento de columnas en tablas
Editar | Pencil / Edit3 | Edición rápida de títulos o descripciones
Eliminar | Trash2 | Acciones destructivas con variant="danger"
Copiar | Copy / Check | Copiar enlaces o prompts generados
Descargar | Download | Exportar informes ejecutivos (PDF/CSV)
Enlace externo | ArrowUpRight | Enlace a fuentes de tendencias (GitHub, YouTube)
Opciones | MoreHorizontal | Menú contextual de tarjeta o fila
Refrescar | RefreshCw | Reintentar carga o actualizar datos
Cerrar | X | Descartar modales o notificaciones
Sidebar Toggle | PanelLeftClose / PanelLeftOpen | Alternar menú lateral

Estados semánticos:

Estado | Icono Lucide | Color Semántico | Uso
---|---|---|---
Éxito | CheckCircle2 | text-emerald-500 (#10B981) | Toasts de guardado o confirmación
Advertencia | AlertTriangle | text-amber-500 (#F59E0B) | Alertas de cuotas de tokens o fechas límite
Error | AlertCircle | text-red-500 (#EF4444) | Validación de formularios o fallos de red
Información | Info | text-blue-500 (#3B82F6) | Tooltips de ayuda o notas contextuales
Tiempo | Clock | text-zinc-400 | Horas estimadas o tareas en backlog


2.8 Grid y composición

Esta sección existe porque "buena distribución de componentes" no es una sensación subjetiva: es el resultado de reglas de alineación y ritmo aplicadas de forma consistente.

Grid base:

12 columnas, contenedor máximo de 1440px centrado en pantallas mayores a 1536px (igual que en la sección de responsive).
Gutters entre columnas: 24px en desktop, 16px en tablet, 12px en mobile — todos múltiplos de la escala de espaciado de 4px.
Todo componente se posiciona ocupando un número entero de columnas. Nada se coloca "a ojo" con un margen arbitrario.

Ritmo vertical:

Separación entre secciones mayores del dashboard: 64px, siempre.
Separación entre tarjetas dentro de una misma sección: 24px, siempre.
Estos valores no se ajustan "porque en esta pantalla se ve mejor con 40px" — si un valor de la escala no encaja, el problema es el contenido, no el espaciado.

Disciplina de alineación:

Todo elemento se alinea a una columna del grid o a un borde ya establecido por otro elemento (el borde izquierdo de una card se alinea con el borde izquierdo del título de la sección, por ejemplo). Ningún elemento "flota" sin relación con lo que lo rodea.

Patrón bento para el dashboard:

Las tarjetas del dashboard pueden variar de tamaño (1×1, 2×1, 1×2, 2×2) sobre el mismo grid de 12 columnas — la asimetría es intencional y está guiada por la prioridad del contenido: la métrica más importante ocupa la tarjeta más grande, nunca al revés por accidente de implementación.
El padding interno de una tarjeta es el mismo (24px) sin importar su tamaño, para que la densidad visual sea uniforme en todo el dashboard.

Densidad según tipo de vista:

Vistas densas en datos (tablas, tablero Kanban): padding de fila 12–16px, priorizando poder ver más filas sin scroll.
Vistas de tipo "hero" o marketing interno (splash, onboarding): padding generoso, 48–64px, priorizando aire sobre densidad.
La densidad cambia según el tipo de información que se muestra, nunca al azar entre pantallas similares.

El espacio vacío es un componente de layout, no un sobrante. Una pantalla con menos contenido pero mejor alineado comunica más orden que una pantalla llena que aprovecha cada pixel disponible.

3. Estructura de Carpetas (Feature-Driven)

Se mantiene sin cambios respecto a la versión anterior: cada feature es un módulo autónomo, nada fuera de features/ importa directamente de otra feature.

text
frontend/src/
├── app/                          # CONFIGURACIÓN GLOBAL
│   ├── router/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.ts
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   ├── QueryProvider.tsx
│   │   ├── AuthProvider.tsx
│   │   └── ThemeProvider.tsx
│   └── store/
│       ├── uiStore.ts
│       └── filtersStore.ts
│
├── components/                   # SISTEMA DE DISEÑO
│   ├── ui/                       # Primitivos (basados en Radix UI)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Switch.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Tooltip.tsx
│   │   ├── DropdownMenu.tsx
│   │   ├── Dialog.tsx
│   │   ├── Sheet.tsx
│   │   ├── Tabs.tsx
│   │   ├── Accordion.tsx
│   │   ├── Progress.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Toast.tsx
│   │   └── Card.tsx
│   ├── common/
│   │   ├── DataTable.tsx
│   │   ├── Pagination.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── SearchInput.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── StatusPill.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── CommandPalette.tsx
│   │   └── UserMenu.tsx
│   └── charts/
│       ├── TrendLine.tsx
│       ├── RICERadar.tsx
│       ├── SprintBurndown.tsx
│       └── EngagementBars.tsx
│
├── layouts/
│   ├── AppLayout.tsx
│   ├── AuthLayout.tsx
│   └── MarketingLayout.tsx
│
├── pages/
│   ├── NotFound.tsx
│   ├── ServerError.tsx
│   └── Maintenance.tsx
│
├── features/                     # MÓDULOS DE NEGOCIO
│   ├── auth/
│   ├── organization/
│   ├── dashboard/
│   ├── trends/
│   ├── research/
│   ├── swot/
│   ├── opportunities/
│   ├── hypotheses/
│   ├── experiments/
│   ├── projects/
│   ├── sprints/
│   ├── tasks/
│   ├── social/
│   ├── brand/
│   ├── calendar/
│   ├── integrations/
│   ├── billing/
│   └── settings/
│
├── services/
│   ├── api.ts
│   ├── queryClient.ts
│   └── queryKeys.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   ├── useLocalStorage.ts
│   ├── useCopyToClipboard.ts
│   ├── useIntersectionObserver.ts
│   └── useReducedMotion.ts
│
├── lib/
│   ├── formatters.ts
│   ├── validators.ts
│   ├── cn.ts
│   └── constants.ts
│
├── types/
│   ├── api.ts
│   ├── user.ts
│   ├── organization.ts
│   └── index.ts
│
├── styles/
│   ├── globals.css
│   └── liquid-glass.css
│
├── assets/
│   ├── logo-bowol-full-light.svg
│   ├── logo-bowol-full-dark.svg
│   ├── logo-bowol-mark.svg
│   └── icons/
│
└── main.tsx
4. Sistema de Componentes UI (Detallado)

Cada componente se construye con Radix UI primitives + Tailwind, nunca con librerías de UI prefabricadas (MUI, Chakra, etc.), para garantizar control total sobre la estética Liquid Glass.

4.1 Button (5 variantes)
tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium ' +
  'transition-all duration-150 ease-out-soft ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ' +
  'disabled:opacity-40 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-500 text-white hover:bg-brand-600 ' +
          'shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(249,115,22,0.3)] ' +
          'hover:shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_20px_rgba(249,115,22,0.4)]',
        secondary:
          'bg-surface-elevated dark:bg-surface-dark-elevated ' +
          'border border-surface-border dark:border-surface-dark-border ' +
          'text-zinc-900 dark:text-zinc-100 ' +
          'backdrop-blur-glass hover:bg-surface-glass',
        ghost:
          'text-zinc-700 dark:text-zinc-300 ' +
          'hover:bg-zinc-900/5 dark:hover:bg-white/5',
        glass:
          'bg-white/10 dark:bg-white/5 text-white ' +
          'backdrop-blur-glass border border-white/15 ' +
          'hover:bg-white/15',
        danger:
          'bg-red-500 text-white hover:bg-red-600 ' +
          'shadow-[0_4px_12px_rgba(239,68,68,0.3)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-sm',
        md: 'h-10 px-4 text-base rounded-md',
        lg: 'h-12 px-6 text-lg rounded-md',
        icon: 'h-10 w-10 rounded-md',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

Nota de copy: el texto del botón describe la acción exacta ("Guardar cambios", no "Enviar"), sin flechas decorativas al final. Un botón "Publicar" produce un toast "Publicado" — el mismo verbo en todo el flujo.

4.2 Card (Liquid Glass)

3 variantes: solid (opaco), glass (translúcido), interactive (hover con elevación).

tsx
<Card variant="glass" className="p-6">
  <Card.Header>
    <h3 className="text-lg font-semibold tracking-tight">Título</h3>
    <p className="text-sm text-zinc-500">Descripción</p>
  </Card.Header>
  <Card.Body>...</Card.Body>
</Card>
4.3 Sidebar (Liquid Glass)

Características:

Fondo translúcido con backdrop-blur-heavy.
Iconos Lucide con stroke 1.5, nunca emoji.
Logo completo cuando está expandida, solo isotipo cuando está colapsada (ver sección 2.6).
Item activo con indicador naranja + fondo glass.
Colapsable (72px ↔ 260px).
En móvil se convierte en Sheet.
tsx
<Sidebar>
  <Sidebar.Logo />
  <Sidebar.Nav>
    <Sidebar.Item icon={LayoutDashboard} label="Dashboard" to="/" />
    <Sidebar.Item icon={TrendingUp} label="Tendencias" to="/trends" />
    <Sidebar.Item icon={Sparkles} label="Asistente IA" to="/assistant" />
  </Sidebar.Nav>
  <Sidebar.Footer>
    <UserMenu />
  </Sidebar.Footer>
</Sidebar>
4.4 Command Palette (Cmd+K)

Inspirado en Linear/Raycast. Se abre con Cmd+K (Mac) o Ctrl+K (Windows). Permite:

Navegar a cualquier ruta.
Buscar tendencias, proyectos, tareas.
Ejecutar acciones rápidas ("Nueva tarea", "Nueva oportunidad").
Cambiar de organización.
4.5 Estados de UI obligatorios

Cada componente que carga datos debe manejar los 5 estados siguientes. Ninguno usa un emoji ni una ilustración de stock genérica: se resuelven con ícono Lucide + copy directo, o con una ilustración SVG propia y consistente.

Estado	Componente	Ejemplo
Loading inicial	<Skeleton />	Card con 3 líneas shimmer
Empty	<EmptyState />	"Aún no hay tendencias. [Explorar]" — la pantalla vacía es una invitación a actuar, no una disculpa
Error	<ErrorState />	"No pudimos cargar. [Reintentar]" — explica qué pasó y cómo resolverlo, sin tono de disculpa vago
Success	Render normal	Contenido
Refetch	Indicador sutil arriba a la derecha	Punto pulsante
Disabled	Opacidad 40% + cursor not-allowed	Botón sin permisos
5. Gestión del Estado
5.1 Server State: TanStack Query

El 90% del estado en BOWOL es server state. Nunca usar Redux para datos de API. TanStack Query maneja caché, revalidación, deduplicación y mutaciones optimistas.

ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (error.status === 401 || error.status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
ts
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    detail: (id: string) => ['organizations', id] as const,
    members: (id: string) => ['organizations', id, 'members'] as const,
  },
  trends: {
    all: (filters: TrendFilters) => ['trends', filters] as const,
    detail: (id: string) => ['trends', id] as const,
    forMe: ['trends', 'for-me'] as const,
    search: (q: string) => ['trends', 'search', q] as const,
  },
  swot: {
    list: ['swot'] as const,
    detail: (id: string) => ['swot', id] as const,
  },
  opportunities: {
    all: (filters: OpportunityFilters) => ['opportunities', filters] as const,
    detail: (id: string) => ['opportunities', id] as const,
  },
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    sprints: (id: string) => ['projects', id, 'sprints'] as const,
  },
};
5.2 Client State: Zustand

Solo para estado puramente visual:

ts
interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  setTheme: (t: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      theme: 'system',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'bowol-ui' }
  )
);
5.3 Formularios: React Hook Form + Zod

Todos los formularios siguen el patrón useForm + zodResolver. Los schemas Zod viven en features/<x>/schemas/.

tsx
const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
}
6. Patrones de Experiencia (UX)
6.1 Carga de datos
Skeleton primero. Nunca spinner de pantalla completa salvo en transiciones de ruta.
Optimistic updates en mutaciones rápidas (crear tarea, marcar relevante).
Streaming de IA con Server-Sent Events + animación de tipeo.
6.2 Navegación
Breadcrumbs siempre visibles en páginas profundas.
Transición de página con fade + slide de 8px (nunca slide completo).
Volver atrás preserva la posición de scroll de la lista anterior.
6.3 Feedback
Toasts en la esquina inferior derecha, glass effect, auto-dismiss a los 4s.
Confirmaciones destructivas con modal glass + botón danger.
Errores de formulario inline, en rojo suave 
#EF4444, con ícono Lucide AlertCircle — nunca un emoji de advertencia.
6.4 Accesibilidad
Contraste mínimo WCAG AA (4.5:1 en texto, 3:1 en UI).
Todos los botones con aria-label cuando solo tienen ícono.
Focus visible con anillo ring-2 ring-brand-500/40.
Respetar prefers-reduced-motion en toda animación, incluida la del logo.
Navegación completa con teclado.
6.5 Responsive

BOWOL es una plataforma responsive de verdad, no "adaptable en el mejor de los casos". Cada pantalla se prueba en las cuatro resoluciones de la tabla antes de considerarse terminada — no solo se revisa una vez en DevTools, se redimensiona la ventana en vivo.

Breakpoint	Layout	Qué se verifica
< 640px (móvil)	Sidebar se convierte en Sheet, cards apiladas en una columna, tablas con scroll horizontal contenido	Sin overflow de página, sin texto cortado, sin elementos superpuestos
640–1024px (tablet)	Sidebar colapsada por defecto, layout de 2 columnas	Que el contenido no se sienta "estirado" ni con huecos injustificados
1024–1536px (desktop)	Sidebar expandible, layout de 3 columnas	Alineación al grid de 12 columnas de la sección 2.8
> 1536px (desktop grande)	Contenedor máximo de 1440px, centrado	Que el contenido no se estire hasta perder la escala tipográfica pensada para 1440px

El enfoque es mobile-first en los componentes de UI de bajo nivel (botones, inputs, badges) aunque el producto se use mayoritariamente en desktop: eso evita que el diseño desktop "se rompa hacia abajo" al reducir la ventana.

6.6 Voz y copy

El texto es parte del diseño, no un relleno que se agrega al final.

Voz activa siempre. Un botón dice exactamente lo que hace ("Guardar cambios", no "Enviar" o "Confirmar" genérico).
El mismo verbo en todo el flujo. Si el botón dice "Publicar", el toast de confirmación dice "Publicado" — no "Listo" ni "Hecho".
Los estados vacíos invitan a actuar, no se disculpan. "Aún no hay tendencias. Explora las de tu industria." en vez de "Lo sentimos, no hay nada que mostrar."
Los errores explican qué pasó y cómo resolverlo, con la voz de la interfaz, nunca con un tono de disculpa vago tipo "Algo salió mal 🙁" (y sin el emoji, por la regla de la sección 2.7).
Nombrar las cosas como las entiende el usuario, no como están construidas en el backend. El usuario "administra notificaciones", no "configura webhooks".
Nada de contenido en inglés hardcodeado: todo pasa por lib/constants.ts de cara a un futuro i18n.
7. Setup Técnico
7.1 Dependencias
json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@tanstack/react-query": "^5.51.0",
    "@tanstack/react-query-devtools": "^5.51.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "axios": "^1.7.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "lucide-react": "^0.446.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "class-variance-authority": "^0.7.0",
    "sonner": "^1.5.0",
    "recharts": "^2.12.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "date-fns": "^3.6.0",
    "cmdk": "^1.0.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "tailwindcss-animate": "^1.0.7",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "eslint": "^9.9.0",
    "prettier": "^3.3.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@playwright/test": "^1.47.0"
  }
}
7.2 Variables de entorno
bash
# .env.local
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_NAME=BOWOL
VITE_SENTRY_DSN=
VITE_POSTHOG_KEY=
7.3 Scripts
json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
8. Reglas para el Programador (IA o Humano)
8.1 Reglas duras
Nunca instalar una librería de UI completa (MUI, Chakra, Ant Design, Mantine). Solo Radix primitives + Tailwind.
Nunca hardcodear colores. Siempre usar tokens de Tailwind (bg-brand-500, text-zinc-900).
Nunca hardcodear textos en inglés. Todo pasa por un futuro i18n (por ahora en lib/constants.ts).
Nunca usar un emoji en ningún elemento de la interfaz. Solo iconos Lucide (ver sección 2.7).
Nunca usar el logo fuera de las variantes, tamaños mínimos y lugares definidos en la sección 2.6.
Nunca dejar un elemento sin alinear al grid de 12 columnas o a un borde ya establecido (sección 2.8).
Nunca aplicar el mismo border-radius a todos los elementos de una pantalla sin distinguir jerarquía (badges vs. inputs vs. cards vs. modales).
Nunca agregar una etiqueta en mayúsculas tracked, un marcador numerado decorativo, o una flecha "→" pegada a un CTA solo por costumbre visual — solo si el contenido lo justifica de verdad.
Siempre manejar los 5 estados: loading, empty, error, success, refetch.
Siempre usar cn() para clases condicionales (clsx + tailwind-merge).
Siempre tipar props con interface o type, nunca any.
Siempre añadir aria-label a botones con solo ícono.
Siempre respetar prefers-reduced-motion en animaciones.
8.2 Reglas blandas
Prefiere composición sobre herencia de componentes.
Cada componente de más de 200 líneas probablemente debería dividirse.
Cada useEffect merece una justificación en comentario.
Los nombres de archivos de componentes: PascalCase.tsx. Hooks: camelCase.ts. Utilidades: camelCase.ts.
Antes de dar por terminada una pantalla, tómale una captura y compárala contra Linear/Vercel/Arc. Si algo se ve genéricamente distinto a esas referencias, revisar por qué.
8.3 Checklist antes de hacer commit
npm run typecheck sin errores.
npm run lint sin warnings.
Todos los estados de UI cubiertos.
Responsive probado en 375px, 768px, 1024px y 1440px.
Focus visible en todos los elementos interactivos.
Sin console.log olvidados.
Sin any ni as unknown as.
Skeleton si la carga tarda más de 200ms.
Cero emojis en el código de la feature.
Logo (si aparece en la feature) usado según la sección 2.6.
Composición alineada al grid de la sección 2.8.
9. Roadmap de Implementación Frontend

El frontend se construye en paralelo al backend, feature por feature. No se avanza a la siguiente feature sin que la anterior esté integrada.

Fase	Feature	Depende de
1	Setup Vite + Tailwind + Design System + Layout	—
1	features/auth (login, register)	Backend Fase 2
2	features/organization (CRUD miembros)	Backend Fase 2
3	features/dashboard (cards resumen)	Backend Fase 9
4	features/trends (lista, búsqueda, detalle)	Backend Fase 4
5	features/research (chat IA streaming)	Backend Fase 5
6	features/swot (matriz interactiva)	Backend Fase 6
7	features/opportunities (kanban RICE)	Backend Fase 7
7	features/hypotheses	Backend Fase 7
8	features/projects + sprints + tasks	Backend Fase 8
10	features/integrations (OAuth Google)	Backend Fase 10
11	features/billing (Stripe)	Backend Fase 11
10. Criterios de Aceptación por Feature

Cada feature se considera terminada cuando:

Todas las páginas definidas están implementadas.
Todos los estados (loading, empty, error, success) funcionan.
Responsive verificado en 375px, 768px, 1024px y 1440px, sin overflow ni contenido cortado.
Cero emojis en toda la feature.
Logo (donde aplique) usado según la sección 2.6: variante correcta, tamaño mínimo, espacio de respiro.
Composición alineada al grid de 12 columnas y al ritmo de espaciado de la sección 2.8.
Pasa el test de la sección 11 ("¿esto es genérico?").
Tests unitarios de hooks y utilidades.
Al menos 1 test E2E del flujo principal.
No hay errores en consola.
Performance: Lighthouse mayor a 90 en Performance y Accessibility.
Documentación del feature actualizada en docs/.
11. Test final: "¿esto es genérico?"

Antes de aprobar cualquier pantalla en code review, correr esta lista contra una captura de pantalla real (no contra el código):

¿Podrías reemplazar el logo por el de cualquier otro SaaS y nadie notaría la diferencia? Si la respuesta es sí, la pantalla depende del logo para verse distinta, no del diseño. Falla.
¿Hay algún emoji en un botón, badge, notificación o estado vacío? Falla automática, sin excepción.
¿El espacio entre secciones es menor al doble de lo que "parece suficiente" a primera vista? Revisar y aumentar.
¿Todos los border-radius de la pantalla son idénticos, sin variar según jerarquía (badge vs. input vs. card vs. modal)? Falla.
¿Las sombras son negras planas y genéricas (rgba(0,0,0,0.1) sin más), en vez de las sombras con tinte definidas en la sección 2.4? Falla.
¿El naranja de marca ocupa visiblemente más del 8% de la superficie? Revisar composición de color.
¿El logo se ve estirado, recoloreado fuera de sus variantes aprobadas, o pegado a otros elementos sin espacio de respiro? Falla.
¿Hay tarjetas o elementos que no se alinean con ninguna columna del grid ni con ningún otro borde de la pantalla? Falla.
¿Hay una etiqueta en mayúsculas con tracking amplio sobre cada título, sin que aporte una categoría real? ¿Hay marcadores numerados (01/02/03) decorando contenido que no es una secuencia? ¿Hay una flecha "→" pegada a un botón o link sin necesidad? Cualquiera de estas, revisar y probablemente quitar.
¿La pantalla se rompe (contenido cortado, scroll horizontal no intencional, texto superpuesto) al probarla en 375px de ancho? Falla.

Si una pantalla pasa las 10 preguntas, está lista para producción. Si falla en una sola, no se aprueba el merge.