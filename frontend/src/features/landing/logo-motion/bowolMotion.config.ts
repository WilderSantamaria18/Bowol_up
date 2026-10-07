/**
 * Configuración declarativa de "Señal → Estrategia → Ejecución".
 * Todo número de la animación vive aquí; los componentes no definen constantes propias.
 */

export type BowolBreakpoint = 'mobile' | 'tablet' | 'desktop';
export type BowolMarkVariant = 'full' | 'emblem';

export const BREAKPOINTS = { tablet: 768, desktop: 1024 } as const;

export const MEDIA = {
  tablet: `(min-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

/** Altura real del header sticky (RootLayout: h-16). Se expone como variable CSS global. */
export const HEADER_HEIGHT_VAR = '--bowol-header-h';

/**
 * Colores de marca resueltos por tema con variables CSS (ver globals.css y
 * .agents/rules/brand-color-system.md): naranja #EA580C en claro, #F97316 en oscuro.
 */
export const COLORS = {
  accent: 'var(--bowol-accent)',
  flameTop: 'var(--bowol-flame-top)',
  flameBottom: 'var(--bowol-flame-bottom)',
  flameCore: 'var(--bowol-flame-core)',
  engineGlow: 'var(--bowol-engine-glow)',
} as const;

/** Geometría del SVG oficial (mismo viewBox que BowolVectorLogo). */
export const MARK_GEOMETRY = {
  full: { viewBox: [200, 100, 898, 620], emblemCenter: [650, 300] },
  emblem: { viewBox: [400, 120, 500, 380], emblemCenter: [650, 300] },
  /** Origen de la llama (boca de la tobera) en coordenadas del viewBox. */
  flameOrigin: [645, 282],
  /** Transformación original del trazado potrace de bowol_logo1.svg. */
  sourceTransform: 'translate(0, 862) scale(0.1, -0.1)',
} as const;

interface Point {
  x: number;
  y: number;
}

interface BreakpointMotion {
  /** Carril visual: la única zona que la animación puede ocupar. */
  rail: { topOffset: number; left: number; width: number; height: number };
  variant: BowolMarkVariant;
  markWidth: number;
  showIndicator: boolean;
  /** Ancho reservado a la izquierda del carril para el indicador. */
  indicatorGutter: number;
  /** Recorrido del emblema en px, relativo a su posición inicial (0,0). */
  path: [Point, Point, Point, Point];
  endScale: number;
  /** Fracción de la altura del viewport que dura el guion completo. */
  scrollSpan: number;
}

export const MOTION: Record<BowolBreakpoint, BreakpointMotion> = {
  mobile: {
    rail: { topOffset: 16, left: 12, width: 190, height: 164 },
    variant: 'full',
    markWidth: 84,
    showIndicator: false,
    indicatorGutter: 0,
    path: [
      { x: 0, y: 0 },
      { x: 26, y: 12 },
      { x: 8, y: 40 },
      { x: 30, y: 62 },
    ],
    endScale: 0.6,
    scrollSpan: 0.6,
  },
  tablet: {
    rail: { topOffset: 24, left: 16, width: 210, height: 180 },
    variant: 'full',
    markWidth: 88,
    showIndicator: true,
    indicatorGutter: 68,
    path: [
      { x: 0, y: 0 },
      { x: 32, y: 16 },
      { x: 8, y: 54 },
      { x: 38, y: 90 },
    ],
    endScale: 0.6,
    scrollSpan: 0.7,
  },
  desktop: {
    rail: { topOffset: 32, left: 20, width: 230, height: 195 },
    variant: 'full',
    markWidth: 104,
    showIndicator: true,
    indicatorGutter: 72,
    path: [
      { x: 0, y: 0 },
      { x: 40, y: 20 },
      { x: 8, y: 66 },
      { x: 48, y: 108 },
    ],
    endScale: 0.55,
    scrollSpan: 0.8,
  },
};

export const INDICATOR = {
  /** Margen vertical de la línea dentro del carril. */
  padding: 6,
  labels: { signal: 'SEÑAL', strategy: 'ESTRATEGIA', execution: 'EJECUCIÓN' },
  idleOpacity: 0.4,
} as const;

/** Etapa 1 · Señal: entrada de una sola vez, basada en tiempo (≤ 2 s). */
export const INTRO = {
  /** Las alas se despliegan desde el eje del cohete. */
  wingScaleFrom: 0.55,
  wingDuration: 0.85,
  wingAt: 0.18,
  /** El fuselaje sube desde abajo (unidades del viewBox) y el SVG lo recorta al emerger. */
  rocketRise: 420,
  rocketAt: 0.28,
  rocketDuration: 0.9,
  letterDrop: 60,
  lettersAt: 0.62,
  letterDuration: 0.6,
  letterStagger: 0.05,
  /** Ignición: la llama arranca baja y sube con un ligero rebote. */
  ignitionAt: 0.84,
  ignitionDuration: 0.4,
  ignitionFromScaleY: 0.5,
  ignitionFromScaleX: 0.8,
  pulse: { at: 0, duration: 0.7, fromScale: 0.55, holdOpacity: 0.55, fadeAt: 0.92, fadeDuration: 0.65, toScale: 1.45, radius: 110 },
  ease: 'expo.out',
} as const;

/** Vida de la llama: parpadeo por capas y brasas (solo transform/opacity, se pausan fuera del hero). */
export const FLICKER = {
  plume: { scaleY: 1.07, scaleX: 0.97, duration: 0.42 },
  core: { scaleY: 1.16, scaleX: 0.92, duration: 0.29 },
  glow: { scale: 1.12, duration: 0.55 },
  embers: { count: 3, travel: 70, duration: 1.1, spread: 26, stagger: 0.37, radius: 4 },
} as const;

/** Impulso axial al pulsar el logo (sin giro): el cohete sube y regresa. */
export const IMPULSE = {
  rise: 150,
  scale: 1.035,
  duration: 0.22,
  flameY: 1.8,
  flameX: 1.25,
  scrollTarget: '#problema',
  origin: '645 240',
} as const;

/** Etapas 2 y 3: guion en scrub. Posiciones y duraciones como fracción del total (=1). */
export const SCROLL = {
  start: 'top top',
  scrub: 0.6,
  /** Vuelo del logo desde el centro del banner hasta el carril. */
  fly: { at: 0, duration: 0.32, ease: 'power2.inOut' },
  /** Recorrido por tramos dentro del carril: empieza donde termina el vuelo. */
  segments: [0.16, 0.16, 0.16],
  segmentEase: 'sine.inOut',
  wordmarkFade: { at: 0.02, duration: 0.2 },
  labelSwitch: { toStrategy: 0.32, toExecution: 0.8, duration: 0.05 },
  flame: { boostAt: 0.8, boostDuration: 0.08, settleAt: 0.88, settleDuration: 0.1 },
  shrink: { at: 0.82, duration: 0.18, ease: 'power2.in' },
  exit: { at: 0.92, duration: 0.08 },
  markOrigin: '50% 50%',
} as const;

/** Espacio reservado en el banner para el logo central (ancho = min(vw%, max px)). */
export const HERO_SLOT = { id: 'hero-logo-slot', widthVw: 72, maxWidth: 420 } as const;

/** Intensidad de la llama (escala sobre la llama central, nunca sobre las toberas oficiales). */
export const FLAME = {
  boostY: 1.3,
  boostX: 1.12,
  settleY: 1.1,
  settleX: 1.03,
} as const;

/** prefers-reduced-motion: estado estático con fade inferior a 200 ms. */
export const REDUCED = { fadeSeconds: 0.15 } as const;

/** ?motion=full fuerza la animación completa aunque el sistema pida movimiento reducido (demos). */
export const MOTION_OVERRIDE = { param: 'motion', value: 'full' } as const;

export function getMarkGeometry(variant: BowolMarkVariant) {
  const [, , w, h] = MARK_GEOMETRY[variant].viewBox;
  return { aspect: w / h };
}

export function getMarkHeight(bp: BowolBreakpoint): number {
  const { markWidth, variant } = MOTION[bp];
  return markWidth / getMarkGeometry(variant).aspect;
}

/** Centro del emblema dentro de la caja del logo (px). Ancla del trazo de trayectoria. */
export function getEmblemAnchor(bp: BowolBreakpoint): Point {
  const { markWidth, variant } = MOTION[bp];
  const { viewBox, emblemCenter } = MARK_GEOMETRY[variant];
  const [vx, vy, vw, vh] = viewBox;
  const height = getMarkHeight(bp);
  return {
    x: ((emblemCenter[0] - vx) / vw) * markWidth,
    y: ((emblemCenter[1] - vy) / vh) * height,
  };
}

/** Posición de la caja del logo dentro del carril (deja libre el gutter del indicador). */
/** Holgura para que el anillo de foco del botón no quede recortado por overflow-hidden. */
export const MARK_INSET = 3;

export function getMarkOrigin(bp: BowolBreakpoint): Point {
  return { x: MOTION[bp].indicatorGutter + 4, y: MARK_INSET };
}

/** Segmentos rectos del recorrido, en coordenadas del carril (para dibujar la línea). */
export function getTrajectorySegments(bp: BowolBreakpoint): string[] {
  const { path } = MOTION[bp];
  const anchor = getEmblemAnchor(bp);
  const origin = getMarkOrigin(bp);
  const pts = path.map((p) => ({ x: origin.x + anchor.x + p.x, y: origin.y + anchor.y + p.y }));
  return pts.slice(0, -1).map((p, i) => `M ${p.x} ${p.y} L ${pts[i + 1].x} ${pts[i + 1].y}`);
}

export function getIndicatorLineHeight(bp: BowolBreakpoint): number {
  return MOTION[bp].rail.height - INDICATOR.padding * 2;
}

export function resolveBreakpoint(matches: { tablet: boolean; desktop: boolean }): BowolBreakpoint {
  if (matches.desktop) return 'desktop';
  if (matches.tablet) return 'tablet';
  return 'mobile';
}
