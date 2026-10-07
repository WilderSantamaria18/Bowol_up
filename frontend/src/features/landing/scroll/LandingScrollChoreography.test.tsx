import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ScrollTrigger } from '@/lib/gsap/registerPlugins';
import { LandingScrollChoreography } from './LandingScrollChoreography';
import { CALM_FACTOR, ENTER_SECTIONS, LANDING_SECTIONS } from './landingScroll.config';

const originalMatchMedia = window.matchMedia;

function mockReduced(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce') ? reduced : query.includes('min-width'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

function mountSections() {
  const nodes = LANDING_SECTIONS.map(({ id }) => {
    const el = document.createElement('section');
    el.id = id;
    const h2 = document.createElement('h2');
    h2.textContent = id;
    el.appendChild(h2);
    document.body.appendChild(el);
    return el;
  });
  return () => nodes.forEach((n) => n.remove());
}

let unmountSections: () => void;

beforeEach(() => {
  mockReduced(false);
  unmountSections = mountSections();
});

afterEach(() => {
  cleanup();
  unmountSections();
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('LandingScrollChoreography', () => {
  it('renderiza un riel accesible con un botón real por sección', () => {
    const { getByRole, getAllByRole } = render(<LandingScrollChoreography />);
    expect(getByRole('navigation', { name: /secciones/i })).toBeInTheDocument();
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(LANDING_SECTIONS.length);
    buttons.forEach((b) => expect(b).toHaveAttribute('type', 'button'));
  });

  it('salta a la sección al pulsar su botón', () => {
    const target = document.getElementById('plataforma')!;
    target.scrollIntoView = vi.fn();
    const { getByRole } = render(<LandingScrollChoreography />);
    fireEvent.click(getByRole('button', { name: /plataforma/i }));
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('crea transiciones con scrub para las secciones y las limpia al desmontar', () => {
    const before = ScrollTrigger.getAll().length;
    const { unmount } = render(<LandingScrollChoreography />);
    const scrubbed = ScrollTrigger.getAll().filter((t) => t.vars.scrub);
    // Una entrada por sección + un título por sección + copy/fondo del hero + línea de avance.
    expect(scrubbed.length).toBeGreaterThanOrEqual(ENTER_SECTIONS.length * 2);
    unmount();
    expect(ScrollTrigger.getAll().length).toBe(before);
  });

  it('con movimiento reducido atenúa las amplitudes en lugar de desactivar las transiciones', () => {
    mockReduced(true);
    const { unmount } = render(<LandingScrollChoreography />);
    expect(ScrollTrigger.getAll().filter((t) => t.vars.scrub).length).toBeGreaterThanOrEqual(ENTER_SECTIONS.length);
    expect(CALM_FACTOR).toBeLessThan(1);
    unmount();
  });

  it('no añade listeners de scroll propios', async () => {
    const src = (await import('./LandingScrollChoreography.tsx?raw')).default as string;
    expect(src).not.toMatch(/addEventListener/);
    expect(src).not.toMatch(/rotat/i);
  });
});
