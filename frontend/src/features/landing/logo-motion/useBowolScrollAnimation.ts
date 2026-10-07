import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap/registerPlugins';
import {
  FLAME,
  FLICKER,
  HERO_SLOT,
  IMPULSE,
  INDICATOR,
  INTRO,
  MARK_GEOMETRY,
  getMarkHeight,
  getMarkOrigin,
  MOTION,
  SCROLL,
  getIndicatorLineHeight,
  type BowolBreakpoint,
} from './bowolMotion.config';

interface UseBowolScrollAnimationOptions {
  /** Raíz del carril: todos los elementos animados se buscan dentro de ella. */
  scope: RefObject<HTMLElement>;
  bp: BowolBreakpoint;
  reduced: boolean;
  /** Selector de la sección hero que gobierna el guion. */
  triggerSelector: string;
}

const scrollY = () => window.scrollY;
const svgOrigin = ([x, y]: readonly [number, number]) => `${x} ${y}`;
const FLAME_ORIGIN = svgOrigin(MARK_GEOMETRY.flameOrigin);
const WING_ORIGIN = svgOrigin([MARK_GEOMETRY.flameOrigin[0], MARK_GEOMETRY.flameOrigin[1] + 20]);

/**
 * Señal (ensamblaje + ignición) → Estrategia (recorrido en scrub) → Ejecución (llama, reducción y salida).
 * Un único gsap.context posee todos los tweens y ScrollTriggers: revert() los destruye al desmontar
 * o al cambiar de breakpoint. No hay listeners propios ni estado de React por frame.
 * Devuelve `impulse`, la acción del botón del logo.
 */
export function useBowolScrollAnimation({ scope, bp, reduced, triggerSelector }: UseBowolScrollAnimationOptions) {
  const impulseRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    // Movimiento reducido ("calm"): se conserva el viaje dirigido por scroll (lo controla la persona con la rueda)
    // y se omite todo lo autónomo: ensamblaje, pulso, parpadeo de llama y brasas.
    const calm = reduced;

    const root = scope.current;
    if (!root) return;

    const hero = document.querySelector(triggerSelector);
    const config = MOTION[bp];
    const end = () => `+=${window.innerHeight * config.scrollSpan}`;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const part = (name: string) => q(`[data-part="${name}"]`)[0];

      const mark = part('mark');
      const wingLeft = part('wing-left');
      const wingRight = part('wing-right');
      const rocket = part('rocket');
      const propulsion = part('propulsion');
      const flame = part('flame');
      const plume = part('plume');
      const core = part('core');
      const glow = part('glow');
      const pulse = part('pulse');
      const wordmark = part('wordmark');
      const letters = q('[data-letter]');
      const embers = q('[data-ember]');
      const segments = q('[data-traj]');
      const fill = part('progress-fill');
      const dot = part('progress-dot');
      const labelSignal = q('[data-label="signal"]');
      const labelStrategy = q('[data-label="strategy"]');
      const labelExecution = q('[data-label="execution"]');

      // ── Etapa 1 · Señal: pulso, alas que se despliegan, fuselaje que emerge, ignición ──
      const emblemCenter = svgOrigin(MARK_GEOMETRY.full.emblemCenter);
      if (!calm) {
        gsap.set([wingLeft, wingRight], { scaleX: INTRO.wingScaleFrom, opacity: 0, svgOrigin: WING_ORIGIN });
        gsap.set(rocket, { y: INTRO.rocketRise, opacity: 0 });
        gsap.set(propulsion, { opacity: 0 });
      }
      gsap.set([plume, core], { svgOrigin: FLAME_ORIGIN, scaleX: 1, scaleY: 1 });
      gsap.set(glow, { svgOrigin: FLAME_ORIGIN, scale: 1 });
      gsap.set(flame, { svgOrigin: FLAME_ORIGIN, scaleX: 1, scaleY: 1 });
      if (!calm) {
        gsap.set(pulse, { opacity: 0, scale: INTRO.pulse.fromScale, svgOrigin: emblemCenter });
        gsap.set(embers, { opacity: 0 });
        if (letters.length) gsap.set(letters, { y: INTRO.letterDrop, opacity: 0 });
      }
      gsap.set(segments, { strokeDasharray: 1, strokeDashoffset: 1 });
      if (config.showIndicator) gsap.set([labelStrategy, labelExecution], { opacity: INDICATOR.idleOpacity });

      // Vida de la llama (parpadeo desfasado por capas + brasas). Solo transform/opacity.
      // Tweens sueltos: un timeline con hijos infinitos tendría duración infinita.
      const lifeTweens: gsap.core.Tween[] = calm ? [] : [
        gsap.to(plume, { ...FLICKER.plume, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true }),
        gsap.to(core, { ...FLICKER.core, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true }),
        gsap.to(glow, {
          scale: FLICKER.glow.scale,
          duration: FLICKER.glow.duration,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          paused: true,
        }),
      ];
      if (!calm && bp !== 'mobile') {
        embers.forEach((ember, i) => {
          lifeTweens.push(
            gsap.fromTo(
              ember,
              { y: 0, opacity: 0.85 },
              {
                y: FLICKER.embers.travel,
                x: (i - 1) * 6,
                opacity: 0,
                duration: FLICKER.embers.duration,
                repeat: -1,
                delay: i * FLICKER.embers.stagger,
                ease: 'power1.out',
                paused: true,
              },
            ),
          );
        });
      }
      const life = {
        play: () => lifeTweens.forEach((t) => t.play()),
        pause: () => lifeTweens.forEach((t) => t.pause()),
      };

      if (!calm) {
      const intro = gsap.timeline({ defaults: { ease: INTRO.ease }, delay: 0.12 });
      intro
        .fromTo(
          pulse,
          { opacity: 0, scale: INTRO.pulse.fromScale },
          { opacity: INTRO.pulse.holdOpacity, scale: 1, duration: INTRO.pulse.duration, ease: 'power2.out' },
          INTRO.pulse.at,
        )
        .to(pulse, { opacity: 0, scale: INTRO.pulse.toScale, duration: INTRO.pulse.fadeDuration, ease: 'power2.out' }, INTRO.pulse.fadeAt)
        .to([wingLeft, wingRight], { scaleX: 1, opacity: 1, duration: INTRO.wingDuration }, INTRO.wingAt)
        .to(rocket, { y: 0, opacity: 1, duration: INTRO.rocketDuration }, INTRO.rocketAt)
        .to(propulsion, { opacity: 1, duration: 0.2, ease: 'none' }, INTRO.ignitionAt)
        .from(
          [plume, core],
          { scaleY: INTRO.ignitionFromScaleY, scaleX: INTRO.ignitionFromScaleX, duration: INTRO.ignitionDuration, ease: 'back.out(2)' },
          INTRO.ignitionAt,
        );
      if (letters.length) {
        intro.to(letters, { y: 0, opacity: 1, duration: INTRO.letterDuration, stagger: INTRO.letterStagger }, INTRO.lettersAt);
      }
      intro.call(() => life.play());
      // Recarga con la página ya desplazada: sin intro, directo al estado ensamblado.
      if (window.scrollY > 4) {
        intro.progress(1);
        life.play();
      }
      }

      // ── Acción del botón: impulso axial (sube y regresa) + salto a la siguiente sección ──
      let busy = false;
      impulseRef.current = () => {
        if (busy) return;
        busy = true;
        life.pause();
        const carried = [rocket, wingLeft, wingRight, propulsion];
        gsap
          .timeline({
            onComplete: () => {
              busy = false;
              gsap.set([plume, core], { scaleX: 1, scaleY: 1 });
              life.play();
            },
          })
          .to(carried, {
            y: -IMPULSE.rise,
            scale: IMPULSE.scale,
            svgOrigin: IMPULSE.origin,
            duration: IMPULSE.duration,
            yoyo: true,
            repeat: 1,
            ease: 'power3.out',
          })
          .to(
            [plume, core],
            { scaleY: IMPULSE.flameY, scaleX: IMPULSE.flameX, duration: IMPULSE.duration, yoyo: true, repeat: 1, ease: 'power2.out' },
            0,
          );
      };

      if (!hero) return;

      // La vida de la llama solo corre mientras el hero está en pantalla.
      ScrollTrigger.create({
        trigger: hero,
        start: SCROLL.start,
        end,
        onToggle: (self) => (self.isActive ? life.play() : life.pause()),
      });

      // ── Etapas 2 y 3: guion en scrub, reversible ──
      const [, p1, p2, p3] = config.path;
      const points = [p1, p2, p3];
      const lineHeight = getIndicatorLineHeight(bp);

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: SCROLL.start,
          end,
          scrub: SCROLL.scrub,
          invalidateOnRefresh: true,
        },
      });

      // Vuelo inicial: el logo parte del centro del banner (hueco reservado en el hero) y aterriza en el carril.
      const rail = part('rail');
      const slot = document.getElementById(HERO_SLOT.id);
      const origin = getMarkOrigin(bp);
      const restCenter = () => {
        const r = rail.getBoundingClientRect();
        return { x: r.left + origin.x + config.markWidth / 2, y: r.top + origin.y + getMarkHeight(bp) / 2 };
      };
      const fromSlot = () => {
        const r = slot!.getBoundingClientRect();
        const rest = restCenter();
        return {
          x: r.left + r.width / 2 - rest.x,
          y: r.top + scrollY() + r.height / 2 - rest.y,
          scale: r.width / config.markWidth,
        };
      };
      gsap.set(mark, { x: 0, y: 0, scale: 1, transformOrigin: SCROLL.markOrigin });
      if (slot) {
        tl.fromTo(
          mark,
          { x: () => fromSlot().x, y: () => fromSlot().y, scale: () => fromSlot().scale },
          { x: 0, y: 0, scale: 1, duration: SCROLL.fly.duration, ease: SCROLL.fly.ease, immediateRender: true },
          SCROLL.fly.at,
        );
      }
      if (config.showIndicator) {
        gsap.set(fill, { scaleY: 0, transformOrigin: 'top' });
        gsap.set(dot, { y: 0 });
      }

      // Estrategia: recorrido por tramos rectos; la línea se dibuja sincronizada con cada tramo.
      let cursor = SCROLL.fly.at + SCROLL.fly.duration;
      points.forEach((point, i) => {
        const duration = SCROLL.segments[i];
        tl.to(mark, { x: point.x, y: point.y, duration, ease: SCROLL.segmentEase }, cursor);
        if (segments[i]) tl.to(segments[i], { strokeDashoffset: 0, duration, ease: SCROLL.segmentEase }, cursor);
        cursor += duration;
      });

      if (wordmark) {
        tl.to(wordmark, { opacity: 0, duration: SCROLL.wordmarkFade.duration }, SCROLL.wordmarkFade.at);
      }

      // Ejecución: la llama se intensifica, el emblema se reduce y el carril se apaga.
      tl.to(
        flame,
        { scaleY: FLAME.boostY, scaleX: FLAME.boostX, duration: SCROLL.flame.boostDuration, ease: 'power2.out' },
        SCROLL.flame.boostAt,
      )
        .to(
          flame,
          { scaleY: FLAME.settleY, scaleX: FLAME.settleX, duration: SCROLL.flame.settleDuration, ease: 'power2.inOut' },
          SCROLL.flame.settleAt,
        )
        .to(mark, { scale: config.endScale, duration: SCROLL.shrink.duration, ease: SCROLL.shrink.ease }, SCROLL.shrink.at)
        .to(segments, { opacity: 0, duration: SCROLL.exit.duration }, SCROLL.exit.at)
        .to(root, { autoAlpha: 0, duration: SCROLL.exit.duration }, SCROLL.exit.at);

      // Indicador: transform/opacity dirigidos por el mismo scrub (sin setState).
      if (config.showIndicator) {
        const { toStrategy, toExecution, duration } = SCROLL.labelSwitch;
        tl.to(fill, { scaleY: 1, duration: 1 }, 0)
          .to(dot, { y: lineHeight, duration: 1 }, 0)
          .to(labelSignal, { opacity: INDICATOR.idleOpacity, duration }, toStrategy)
          .to(labelStrategy, { opacity: 1, duration }, toStrategy)
          .to(labelStrategy, { opacity: INDICATOR.idleOpacity, duration }, toExecution)
          .to(labelExecution, { opacity: 1, duration }, toExecution);
      }
    }, root);

    return () => {
      impulseRef.current = () => {};
      ctx.revert();
    };
  }, [scope, bp, reduced, triggerSelector]);

  return useCallback(() => {
    const target = document.querySelector(IMPULSE.scrollTarget);
    if (!reduced) impulseRef.current();
    target?.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, [reduced]);
}
