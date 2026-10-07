/** Configuración de la coreografía de scroll del index. Ningún número vive en los componentes. */

export interface LandingSectionRef {
  id: string;
  label: string;
}

/** Secciones navegables, en orden de aparición. */
export const LANDING_SECTIONS: readonly LandingSectionRef[] = [
  { id: 'hero-stage', label: 'Inicio' },
  { id: 'problema', label: 'Problema' },
  { id: 'ciclo', label: 'Flujo continuo' },
  { id: 'plataforma', label: 'Plataforma' },
  { id: 'interactive-demo', label: 'Terminal' },
  { id: 'metricas', label: 'Impacto' },
  { id: 'solicitar', label: 'Acceso' },
];

/** Secciones que reciben la transición de entrada (el hero y su mockup 3D tienen la suya). */
export const ENTER_SECTIONS = LANDING_SECTIONS.map((s) => s.id).filter((id) => id !== 'hero-stage');

export const SECTION_ENTER = {
  /** Desplazamiento y escala de partida; llegan a y=0, scale=1 mientras la sección sube. */
  y: 48,
  scale: 0.972,
  origin: '50% 0%',
  start: 'top 100%',
  end: 'top 58%',
  scrub: 0.5,
} as const;

export const HEADING_REVEAL = {
  y: 26,
  /** Máscara inferior cerrada → abierta con holgura para no recortar descendentes. */
  from: 'inset(0% 0% 100% 0%)',
  to: 'inset(-12% -6% -12% -6%)',
  start: 'top 92%',
  end: 'top 66%',
  scrub: 0.4,
} as const;

export const HERO_EXIT = {
  /** El bloque de texto del hero sube y se desvanece mientras el logo vuela al carril. */
  copyY: -48,
  copyEnd: '+=42%',
  /** Parallax del fondo atmosférico (px) a lo largo de todo el hero. */
  backdropY: 160,
  backdropSelector: '.aurora, .grid-bg',
} as const;

export const SECTION_RAIL = {
  activeStart: 'top 55%',
  activeEnd: 'bottom 55%',
  /** Ancho mínimo de viewport para mostrar el riel. */
  minWidthClass: 'lg:flex',
} as const;

/** Con prefers-reduced-motion las amplitudes de las transiciones se multiplican por este factor. */
export const CALM_FACTOR = 0.4;
