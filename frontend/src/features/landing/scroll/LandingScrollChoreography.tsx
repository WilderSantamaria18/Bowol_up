import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap/registerPlugins';
import { useBowolMotionMode } from '@/features/landing/logo-motion/useBowolMotionMode';
import {
  ENTER_SECTIONS,
  HEADING_REVEAL,
  HERO_EXIT,
  LANDING_SECTIONS,
  SECTION_ENTER,
  SECTION_RAIL,
  CALM_FACTOR,
} from './landingScroll.config';

/**
 * Transiciones del index ligadas al scroll (GSAP + ScrollTrigger, un único gsap.context):
 *  - cada sección entra subiendo y escalando desde 0,972;
 *  - los títulos se revelan con una máscara;
 *  - el hero desvanece su texto y mueve el fondo con parallax mientras el logo vuela al carril;
 *  - un riel lateral marca la sección activa y permite saltar entre ellas.
 * Solo usa transform/opacity/clip-path y no toca los elementos animados por Framer Motion.
 * Con movimiento reducido las mismas transiciones (siempre dirigidas por la rueda) se atenúan y se omite el parallax.
 */
export const LandingScrollChoreography: React.FC = () => {
  const { reduced } = useBowolMotionMode();
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const ctx = gsap.context(() => {
      // ── Riel: sección activa y avance global (siempre, también con movimiento reducido) ──
      if (nav) {
        const buttons = new Map<string, HTMLElement>();
        nav.querySelectorAll<HTMLElement>('[data-section]').forEach((b) => buttons.set(b.dataset.section!, b));
        const setActive = (id: string, active: boolean) => {
          const button = buttons.get(id);
          if (!button) return;
          if (active) {
            buttons.forEach((b) => b.setAttribute('data-active', b === button ? 'true' : 'false'));
            button.setAttribute('aria-current', 'true');
          } else {
            button.removeAttribute('aria-current');
          }
        };
        LANDING_SECTIONS.forEach(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return;
          ScrollTrigger.create({
            trigger: el,
            start: id === 'hero-stage' ? 'top top' : SECTION_RAIL.activeStart,
            end: SECTION_RAIL.activeEnd,
            onToggle: (self) => setActive(id, self.isActive),
          });
        });
        const fill = nav.querySelector('[data-rail-fill]');
        if (fill) {
          gsap.fromTo(
            fill,
            { scaleY: 0, transformOrigin: 'top' },
            { scaleY: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } },
          );
        }
      }

      // Amplitud: completa, o suave con movimiento reducido (el desplazamiento sigue controlado por la rueda).
      const k = reduced ? CALM_FACTOR : 1;

      // ── Entrada de secciones ──
      ENTER_SECTIONS.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        gsap.fromTo(
          section,
          { y: SECTION_ENTER.y * k, scale: 1 - (1 - SECTION_ENTER.scale) * k, transformOrigin: SECTION_ENTER.origin },
          {
            y: 0,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: SECTION_ENTER.start,
              end: SECTION_ENTER.end,
              scrub: SECTION_ENTER.scrub,
              invalidateOnRefresh: true,
            },
          },
        );

        const heading = section.querySelector('h2');
        if (heading) {
          gsap.fromTo(
            heading,
            { y: HEADING_REVEAL.y * k, clipPath: HEADING_REVEAL.from },
            {
              y: 0,
              clipPath: HEADING_REVEAL.to,
              ease: 'none',
              scrollTrigger: {
                trigger: heading,
                start: HEADING_REVEAL.start,
                end: HEADING_REVEAL.end,
                scrub: HEADING_REVEAL.scrub,
              },
            },
          );
        }
      });

      // ── Salida del hero: texto que se retira y fondo con parallax ──
      const hero = document.getElementById('hero-stage');
      if (hero) {
        const copy = hero.querySelector('.hero-stage-item')?.parentElement;
        if (copy) {
          gsap.to(copy, {
            y: HERO_EXIT.copyY * k,
            opacity: 0,
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: HERO_EXIT.copyEnd, scrub: 0.4 },
          });
        }
        const backdrop = hero.querySelectorAll(HERO_EXIT.backdropSelector);
        if (backdrop.length && !reduced) {
          gsap.to(backdrop, {
            y: HERO_EXIT.backdropY,
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
          });
        }
      }
    });

    return () => ctx.revert();
  }, [reduced]);

  const goTo = useCallback(
    (id: string) => {
      document.getElementById(id)?.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    },
    [reduced],
  );

  return (
    <nav
      ref={navRef}
      aria-label="Secciones de la página"
      data-testid="landing-section-rail"
      className={`fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1 ${SECTION_RAIL.minWidthClass}`}
    >
      {/* Línea de avance global */}
      <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-[11px] top-3 w-px bg-zinc-900/15 dark:bg-white/15">
        <span
          data-rail-fill
          className="absolute inset-x-0 top-0 block h-full origin-top scale-y-0 bg-orange-600 dark:bg-orange-500"
                  />
      </span>

      {LANDING_SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          data-section={id}
          data-active="false"
          onClick={() => goTo(id)}
          aria-label={`Ir a ${label}`}
          className="group relative flex h-6 items-center gap-2.5 rounded-full pl-2 pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:focus-visible:outline-orange-500"
        >
          <span
            className="translate-x-1 rounded-md bg-white/90 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-700 opacity-0 shadow-sm ring-1 ring-zinc-900/10 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 group-data-[active=true]:text-orange-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:ring-white/10 dark:group-data-[active=true]:text-orange-400"
          >
            {label}
          </span>
          <span
            aria-hidden="true"
            className="relative block h-2.5 w-2.5 rounded-full bg-zinc-400 ring-2 ring-zinc-100 transition duration-200 group-hover:bg-zinc-600 group-data-[active=true]:scale-125 group-data-[active=true]:bg-orange-600 dark:bg-zinc-600 dark:ring-[#09090B] dark:group-hover:bg-zinc-400 dark:group-data-[active=true]:bg-orange-500"
          />
        </button>
      ))}
    </nav>
  );
};
