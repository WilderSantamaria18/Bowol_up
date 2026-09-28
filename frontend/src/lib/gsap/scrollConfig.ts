export const EASE = {
  snap:   'expo.out',       // Entradas rápidas
  glide:  'power3.inOut',   // Traslados largos con aceleración y deceleración orgánica
  settle: 'back.out(1.2)',  // Asentamiento con overshoot mínimo controlado (≤ 1.2)
  flick:  'power4.out',     // Microimpulsos dinámicos
  wind:   'power2.in',      // Salidas suaves que aceleran al marcharse
} as const;

export const T = {
  intro:  1.4,              // Duración de la secuencia de introducción inicial
  mode:   0.7,              // Duración de transición de actitud entre secciones
  quick:  0.35,             // Ajustes reactivos y micro-reacciones
  settle: 0.5,              // Duración de amortiguación final en el dock
} as const;

export const SCRUB    = 0.8; // Más pesado y balístico que el estándar (0.8)
export const PHYS     = {
  tiltMax:  9,              // Cabeceo máximo hacia adelante (9°)
  tiltBack: 6,              // Cabeceo hacia atrás al subir (+6°)
  velRange: 3000,           // Rango de velocidad de muestreo en px/s
  damping:  10,             // Amortiguación exponencial (retorno exacto en ~650ms)
  flameMax: 0.25,           // Expansión máxima del 25% de la llama bajo aceleración
} as const;

export const BP = {
  desktop: '(min-width: 1024px)',
} as const;
