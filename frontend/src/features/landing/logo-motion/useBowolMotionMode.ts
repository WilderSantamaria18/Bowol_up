import { useEffect, useState } from 'react';
import { MEDIA, MOTION_OVERRIDE, resolveBreakpoint, type BowolBreakpoint } from './bowolMotion.config';

export interface BowolMotionMode {
  bp: BowolBreakpoint;
  reduced: boolean;
}

/** ?motion=full fuerza la animación completa; se recuerda en sessionStorage porque el router puede limpiar la URL. */
function forcedFull(): boolean {
  const key = MOTION_OVERRIDE.param;
  try {
    if (new URLSearchParams(window.location.search).get(key) === MOTION_OVERRIDE.value) {
      window.sessionStorage.setItem(key, MOTION_OVERRIDE.value);
    }
    return window.sessionStorage.getItem(key) === MOTION_OVERRIDE.value;
  } catch {
    return false;
  }
}

function read(): BowolMotionMode {
  if (typeof window === 'undefined' || !window.matchMedia) return { bp: 'desktop', reduced: false };
  return {
    bp: resolveBreakpoint({
      tablet: window.matchMedia(MEDIA.tablet).matches,
      desktop: window.matchMedia(MEDIA.desktop).matches,
    }),
    reduced: window.matchMedia(MEDIA.reducedMotion).matches && !forcedFull(),
  };
}

/** Breakpoint y reduced-motion. Solo cambia de estado al cruzar un umbral, nunca por frame. */
export function useBowolMotionMode(): BowolMotionMode {
  const [mode, setMode] = useState<BowolMotionMode>(read);

  useEffect(() => {
    const queries = [MEDIA.tablet, MEDIA.desktop, MEDIA.reducedMotion].map((q) => window.matchMedia(q));
    const update = () =>
      setMode((prev) => {
        const next = read();
        return prev.bp === next.bp && prev.reduced === next.reduced ? prev : next;
      });
    queries.forEach((mq) => mq.addEventListener('change', update));
    update();
    return () => queries.forEach((mq) => mq.removeEventListener('change', update));
  }, []);

  return mode;
}
