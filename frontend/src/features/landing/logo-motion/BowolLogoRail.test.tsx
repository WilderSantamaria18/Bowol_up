import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { gsap, ScrollTrigger } from '@/lib/gsap/registerPlugins';
import { BowolHeroLogoSlot, BowolLogoRail } from './BowolLogoRail';
import { MARK_INSET, MOTION, REDUCED, getMarkHeight, type BowolBreakpoint } from './bowolMotion.config';
import hookSource from './useBowolScrollAnimation.ts?raw';
import railSource from './BowolLogoRail.tsx?raw';
import markSource from './BowolAnimatedMark.tsx?raw';
import configSource from './bowolMotion.config.ts?raw';

interface MediaState {
  tablet: boolean;
  desktop: boolean;
  reduced: boolean;
}

const originalMatchMedia = window.matchMedia;
let listeners = { added: 0, removed: 0 };

function mockMedia(state: MediaState) {
  listeners = { added: 0, removed: 0 };
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce') ? state.reduced : query.includes('1024') ? state.desktop : state.tablet,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => void listeners.added++,
    removeEventListener: () => void listeners.removed++,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

beforeEach(() => {
  const hero = document.createElement('section');
  hero.id = 'hero-stage';
  document.body.appendChild(hero);
  mockMedia({ tablet: true, desktop: true, reduced: false });
});

afterEach(() => {
  cleanup();
  document.getElementById('hero-stage')?.remove();
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('BowolLogoRail', () => {
  it('renderiza el SVG oficial (cohete, alas, llama y wordmark BOWOL)', () => {
    const { getByTestId, container } = render(<BowolLogoRail />);
    const svg = getByTestId('bowol-mark');
    expect(svg).toHaveAttribute('viewBox', '200 100 898 620');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    for (const p of ['wing-left', 'wing-right', 'rocket', 'thrusters', 'flame', 'wordmark']) {
      expect(container.querySelector(`[data-part="${p}"]`)).not.toBeNull();
    }
    expect(container.querySelectorAll('[data-letter]')).toHaveLength(5);
    // Geometría original: transformación potrace de bowol_logo1.svg y W ámbar oficial.
    expect(container.querySelector('g[transform="translate(0, 862) scale(0.1, -0.1)"]')).not.toBeNull();
    expect(container.querySelector('path[style*="--bowol-accent"]')).not.toBeNull();
    expect(container.querySelector('path[d^="M6453 7027"]')).not.toBeNull();
  });

  it('usa IDs de gradiente únicos por instancia', () => {
    const { container } = render(
      <>
        <BowolLogoRail />
        <BowolLogoRail />
      </>,
    );
    const ids = Array.from(container.querySelectorAll('linearGradient, radialGradient')).map((g) => g.id);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  });

  it('en móvil conserva el logo completo pero oculta el indicador', () => {
    mockMedia({ tablet: false, desktop: false, reduced: false });
    const { getByTestId, queryByTestId } = render(<BowolLogoRail />);
    expect(getByTestId('bowol-mark')).toHaveAttribute('data-variant', 'full');
    expect(queryByTestId('bowol-progress')).toBeNull();
  });

  it('en escritorio incluye el indicador SEÑAL / ESTRATEGIA / EJECUCIÓN', () => {
    const { getByTestId } = render(<BowolLogoRail />);
    const progress = getByTestId('bowol-progress');
    expect(progress).toHaveTextContent('SEÑAL');
    expect(progress).toHaveTextContent('ESTRATEGIA');
    expect(progress).toHaveTextContent('EJECUCIÓN');
  });

  it('con prefers-reduced-motion conserva el viaje por scroll pero omite lo autónomo', () => {
    mockMedia({ tablet: true, desktop: true, reduced: true });
    const { getByTestId, getByRole, container } = render(
      <>
        <BowolHeroLogoSlot />
        <BowolLogoRail />
      </>,
    );
    // El logo sigue existiendo y viaja con el scroll (un único ScrollTrigger con scrub)...
    expect(getByTestId('bowol-logo-rail')).toBeInTheDocument();
    expect(getByRole('button', { name: /BOWOL/i })).toBeInTheDocument();
    expect(ScrollTrigger.getAll().filter((t) => t.vars.scrub)).toHaveLength(1);
    // ...sin ensamblaje autónomo: las piezas no quedan ocultas esperando una intro.
    const rocket = container.querySelector('[data-part="rocket"]') as SVGGElement;
    expect(rocket.style.opacity).not.toBe('0');
    // ...ni pulso, ni parpadeo ni brasas en marcha.
    expect(gsap.getTweensOf(container.querySelector('[data-part="plume"]')!).filter((t) => t.repeat() === -1)).toHaveLength(0);
    expect(REDUCED.fadeSeconds).toBeLessThan(0.2);
  });

  it('?motion=full fuerza la animación completa aunque el sistema pida movimiento reducido', () => {
    mockMedia({ tablet: true, desktop: true, reduced: true });
    window.sessionStorage.setItem('motion', 'full');
    const { getByTestId } = render(<BowolLogoRail />);
    expect(getByTestId('bowol-logo-rail')).toBeInTheDocument();
    window.sessionStorage.removeItem('motion');
  });

  it('reserva en el banner el hueco central del logo', () => {
    const { container } = render(<BowolHeroLogoSlot />);
    const slot = container.querySelector('#hero-logo-slot') as HTMLElement;
    expect(slot).toHaveAttribute('aria-hidden', 'true');
    expect(slot.style.aspectRatio).toBe('898 / 620');
    expect(slot.style.width).toContain('420px');
  });

  it('crea un ScrollTrigger con scrub y lo destruye al desmontar', () => {
    const before = ScrollTrigger.getAll().length;
    const { unmount } = render(<BowolLogoRail />);
    const created = ScrollTrigger.getAll().filter((t) => t.vars.scrub);
    expect(created).toHaveLength(1);
    unmount();
    expect(ScrollTrigger.getAll().length).toBe(before);
  });

  it('no acumula triggers al remontar', () => {
    const before = ScrollTrigger.getAll().length;
    for (let i = 0; i < 3; i++) render(<BowolLogoRail />).unmount();
    expect(ScrollTrigger.getAll().length).toBe(before);
  });

  it('no añade listeners de scroll propios ni deja listeners sin liberar', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const { unmount, rerender } = render(<BowolLogoRail />);
    const scrollAdds = () => add.mock.calls.filter(([type]) => type === 'scroll').length;
    const afterMount = scrollAdds();
    rerender(<BowolLogoRail />);
    // Re-renderizar no registra listeners nuevos (ScrollTrigger gestiona el suyo una sola vez).
    expect(scrollAdds()).toBe(afterMount);
    expect(listeners.added).toBe(3);
    unmount();
    expect(listeners.removed).toBe(listeners.added);
    expect(hookSource).not.toMatch(/addEventListener/);
    expect(railSource).not.toMatch(/addEventListener/);
  });

  it('el carril tiene overflow-hidden y no captura eventos', () => {
    const { getByTestId } = render(<BowolLogoRail />);
    const rail = getByTestId('bowol-logo-rail');
    expect(rail).toHaveClass('overflow-hidden', 'pointer-events-none');
  });

  it('no usa un contenedor fixed inset-0 ni ocupa la pantalla completa', () => {
    const { getByTestId } = render(<BowolLogoRail />);
    const rail = getByTestId('bowol-logo-rail');
    expect(rail.className).not.toMatch(/inset-0|inset-x|inset-y|w-screen|h-screen|w-full|h-full/);
    expect(railSource).not.toMatch(/fixed inset-0/);
    expect(rail.style.width).toBe('230px');
    expect(rail.style.height).toBe('195px');
  });

  it('ancla el carril arriba a la izquierda, bajo el header', () => {
    const { getByTestId } = render(<BowolLogoRail />);
    const rail = getByTestId('bowol-logo-rail');
    expect(rail).toHaveAttribute('data-anchor', 'top-left');
    expect(rail.style.left).toBe('20px');
    expect(rail.style.top).toContain('var(--bowol-header-h');
    expect(rail.style.top).toContain('32px'); // 64 (header) + 32 = 96 px
    expect(rail.style.right).toBe('');
    expect(rail.style.bottom).toBe('');
  });

  it.each<BowolBreakpoint>(['mobile', 'tablet', 'desktop'])(
    'el recorrido de %s permanece dentro de su carril',
    (bp) => {
      const { rail, path, markWidth, indicatorGutter, endScale } = MOTION[bp];
      const height = getMarkHeight(bp);
      for (const p of path) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(indicatorGutter + 4 + p.x + markWidth).toBeLessThanOrEqual(rail.width);
        expect(MARK_INSET + p.y + height).toBeLessThanOrEqual(rail.height);
      }
      expect(endScale).toBeLessThan(1);
    },
  );

  it('las dimensiones del carril siguen la referencia (230×195 escritorio, 190×164 móvil)', () => {
    expect(MOTION.desktop.rail).toMatchObject({ width: 230, height: 195, left: 20, topOffset: 32 });
    expect(MOTION.mobile.rail).toMatchObject({ width: 190, height: 164, left: 12, topOffset: 16 });
  });

  it('el logo es un <button> real con nombre accesible y foco visible', () => {
    const { getByRole } = render(<BowolLogoRail />);
    const button = getByRole('button', { name: /BOWOL/i });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button.className).toMatch(/focus-visible:outline/);
    expect(button).toHaveClass('pointer-events-auto');
  });

  it('al pulsar el logo desplaza a la siguiente sección', () => {
    const target = document.createElement('section');
    target.id = 'problema';
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);
    const { getByRole } = render(<BowolLogoRail />);
    fireEvent.click(getByRole('button', { name: /BOWOL/i }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    target.remove();
  });

  it('los colores de marca vienen de variables CSS del tema, no de valores fijos', () => {
    expect(configSource).toContain("var(--bowol-accent)");
    expect(markSource).not.toMatch(/#F5A623|#F97316|#EA580C/i);
  });

  it('no existe animación de rotación (ni giro de 360°)', () => {
    const sources = [hookSource, markSource, configSource];
    for (const src of sources) {
      expect(src).not.toMatch(/\brotation\b|\brotate\b|\bspin\b|360\s*(deg|°)|rotation\s*:/i);
    }
  });
});
