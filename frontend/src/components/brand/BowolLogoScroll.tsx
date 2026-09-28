import { useRef, useLayoutEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap/registerPlugins';
import { EASE, T, SCRUB, PHYS, BP } from '@/lib/gsap/scrollConfig';
import { BowolLogo } from './BowolLogo';
import { ScrollDebug } from './ScrollDebug';
import { ArrowUpRight } from 'lucide-react';

export function BowolLogoScroll() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLSpanElement>(null);

  // Estados observables para telemetría y UI reactiva
  const [activeMode, setActiveMode] = useState<string>('idle');
  const [isDocked, setIsDocked] = useState<boolean>(false);
  const [masterProgress, setMasterProgress] = useState<number>(0);

  // CTA contextual al lado del cohete en dock desktop
  const [ctaVisible, setCtaVisible] = useState(false);
  const [ctaLabel, setCtaLabel] = useState('Ver arquitectura');
  const [ctaHref, setCtaHref] = useState('#plataforma');
  const [ctaCoords, setCtaCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const dockEl = dockRef.current;
    if (!root || !dockEl) return;

    // Garantizar que la carga asíncrona de fuentes web no desplace las métricas de ScrollTrigger
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: BP.desktop,
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };

        const q = gsap.utils.selector(root);

        // Selección unívoca de capas según la arquitectura R1
        const rootContainer = root;
        const wingsPart = q('[data-part="wings"]')[0];
        const rocketPart = q('[data-part="rocket"]')[0];
        const flamePart = q('[data-part="flame"]')[0];
        const wordmarkPart = q('[data-part="wordmark"]')[0];
        const letters = q('[data-letter]');

        const wingsScroll = q('[data-part="wings"] [data-layer="scroll"]')[0];
        const rocketScroll = q('[data-part="rocket"] [data-layer="scroll"]')[0];
        const flameScroll = q('[data-part="flame"] [data-layer="scroll"]')[0];

        const glowMode = q('[data-part="glow"] [data-layer="mode"]')[0];
        const flameMode = q('[data-part="flame"] [data-layer="mode"]')[0];

        const wingsPhys = q('[data-part="wings"] [data-layer="physics"]')[0];
        const rocketPhys = q('[data-part="rocket"] [data-layer="physics"]')[0];
        const flamePhys = q('[data-part="flame"] [data-layer="physics"]')[0];

        // R7: Medición dinámica del destino sin números mágicos hardcodeados
        const getDockMetrics = () => {
          const r = dockEl.getBoundingClientRect();
          const baseWidth = Math.min(window.innerWidth * 0.6, 420);
          return {
            x: r.left + r.width / 2 - window.innerWidth / 2,
            y: r.top + r.height / 2 - window.innerHeight / 2,
            s: r.width / baseWidth,
          };
        };

        // Si el usuario prefiere movimiento reducido, fijar estado final accesible
        if (reduce) {
          const m = getDockMetrics();
          gsap.set(rootContainer, {
            x: m.x,
            y: m.y,
            scale: m.s,
            opacity: 1,
          });
          gsap.set(wordmarkPart, { opacity: 0 });
          gsap.set([wingsPart, rocketPart, flamePart], { opacity: 1 });
          setIsDocked(true);
          document.body.classList.add('rocket-docked');
          return;
        }

        // =====================================================================
        // PASO 4 · INTRO (Secuencia cinematográfica de carga en capa [data-part])
        // =====================================================================
        const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Estado inicial de reposo antes del escalonado
        gsap.set(wingsPart, { scale: 0.94, opacity: 0 });
        gsap.set(rocketPart, { y: -24, opacity: 0 });
        gsap.set(letters, { y: 16, opacity: 0 });
        gsap.set(flamePart, { opacity: 0 });
        gsap.set(glowMode, { opacity: 0.1 });

        // Por qué wings scale .94->1: Da sensación de despliegue mecánico sin deformar desde scale 0
        introTl.to(wingsPart, { scale: 1, opacity: 1, duration: 0.8 }, 0);
        // Por qué rocket snap y -24->0 a +0.08s: El fuselaje aterriza en sus soportes con precisión
        introTl.to(rocketPart, { y: 0, opacity: 1, duration: 0.9, ease: EASE.snap }, 0.08);
        // Por qué stagger 0.04 en wordmark: Letras emergen con peso tipográfico orgánico
        introTl.to(letters, { y: 0, opacity: 1, duration: 0.7, stagger: 0.04 }, 0.2);
        // Por qué llama a 0.25 opacity: Indica sistema encendido en ralentí antes del despegue
        introTl.to(flamePart, { opacity: 0.25, duration: 0.6 }, 0.5);

        // Si el usuario recarga ya scrolleado, omitir intro para evitar glitches visuales
        if (window.scrollY > 50) {
          introTl.progress(1);
        }

        // =====================================================================
        // PASO 5 · MASTER SCRUB (Hero Stage -> Dock del gutter izquierdo)
        // =====================================================================
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#hero-stage',
            start: 'top top',
            end: () => '+=' + window.innerHeight * 0.9,
            scrub: SCRUB,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const docked = self.progress > 0.6;
              setIsDocked(docked);
              setMasterProgress(self.progress);
              document.body.classList.toggle('rocket-docked', docked);

              // Actualizar posición del CTA lateral contextual
              if (desktop && docked) {
                const r = dockEl.getBoundingClientRect();
                setCtaCoords({
                  left: r.right + 14,
                  top: r.top + r.height / 2 - 16,
                });
              }
            },
          },
        });

        // 0.00 - 0.25 IGNICIÓN
        // Por qué stagger from: center: El wordmark se disuelve desde el centro hacia afuera liberando el cohete
        masterTl.to(
          letters,
          {
            y: 16,
            opacity: 0,
            duration: 0.24,
            stagger: { from: 'center', each: 0.03 },
            ease: EASE.wind,
          },
          0.0
        );

        // Por qué keyframes [1.08 -> .98 -> 1]: Micro-pulso térmico de ignición al presurizar toberas
        masterTl.to(
          flameScroll,
          {
            scaleY: 1.08,
            opacity: 1,
            duration: 0.18,
            ease: EASE.flick,
          },
          0.04
        );
        masterTl.to(
          flameScroll,
          {
            scaleY: 1,
            duration: 0.1,
            ease: EASE.settle,
          },
          0.22
        );

        // Por qué glow 0->1: El destello propulsor acompaña la compresión térmica
        masterTl.to(glowMode, { opacity: 1, duration: 0.22 }, 0.04);
        // Por qué micro-scale 1.03 en cohete: Comunica "arranca" antes de despegar
        masterTl.to(rocketScroll, { scale: 1.03, duration: 0.15 }, 0.08);

        // 0.20 - 0.35 ANTICIPACIÓN
        // Por qué rotation +3 y y +4: El cohete se comprime en retroceso antes de iniciar la aceleración
        masterTl.to(
          rocketScroll,
          {
            rotation: 3,
            y: 4,
            scale: 1,
            duration: 0.15,
            ease: EASE.wind,
          },
          0.2
        );

        // 0.30 - 0.85 TRASLADO AL DOCK
        // Por qué EASE.glide: Movimiento largo sin sobre-oscilación que une el hero con el dock lateral
        masterTl.to(
          rootContainer,
          {
            x: () => getDockMetrics().x,
            y: () => getDockMetrics().y,
            scale: () => getDockMetrics().s,
            duration: 0.55,
            ease: EASE.glide,
          },
          0.3
        );

        // Por qué rotation -6 en rocket y -2 en alas con retraso: Inclinación aerodinámica de guiñada
        masterTl.to(rocketScroll, { rotation: -6, duration: 0.45, ease: EASE.glide }, 0.3);
        masterTl.to(wingsScroll, { rotation: -2, duration: 0.4, ease: EASE.glide }, 0.35);

        // Profundidad de capas (Paralaje desacoplado entre alas, fuselaje y llama)
        masterTl.to(wingsScroll, { y: -6, duration: 0.5, ease: EASE.glide }, 0.3);
        masterTl.to(rocketScroll, { y: -12, duration: 0.5, ease: EASE.glide }, 0.3);
        masterTl.to(flameScroll, { y: 10, duration: 0.5, ease: EASE.glide }, 0.3);

        // 0.85 - 1.00 ASENTAMIENTO (Settle en ancla final)
        // Por qué back.out(1.2): Retorno a la vertical con inercia elástica mínima, pesada y silenciosa
        masterTl.to(
          [rocketScroll, wingsScroll],
          {
            rotation: 0,
            y: 0,
            duration: 0.15,
            ease: EASE.settle,
          },
          0.85
        );
        masterTl.to(flameScroll, { y: 0, scaleY: 1, duration: 0.15, ease: EASE.settle }, 0.85);

        // =====================================================================
        // PASO 6 · ESTADOS POR SECCIÓN (Capa discreta [data-layer=mode])
        // =====================================================================
        const sectionModes = [
          { selector: '[data-mode="intelligence"]', mode: 'intelligence', cta: 'Ver matriz FODA', href: '#ciclo' },
          { selector: '[data-mode="strategy"]', mode: 'strategy', cta: 'Ver proyectos', href: '#plataforma' },
          { selector: '[data-mode="execution"]', mode: 'execution', cta: 'Terminal en vivo', href: '#interactive-demo' },
          { selector: '[data-mode="landed"]', mode: 'landed', cta: 'Iniciar prueba', href: '#solicitar' },
        ];

        const sectionTriggers: ScrollTrigger[] = [];

        const applyMode = (mode: string) => {
          setActiveMode(mode);

          // Limpieza de sobrescritura automática sobre capa mode
          gsap.killTweensOf([flameMode, glowMode, rocketPhys]);

          switch (mode) {
            case 'intelligence':
              // Modo "Escaneo": llama tenue y concentrada, alas atentas
              gsap.to(flameMode, { scaleY: 0.85, duration: T.mode, ease: 'power2.out', overwrite: 'auto' });
              gsap.to(glowMode, { opacity: 0.5, duration: T.mode, overwrite: 'auto' });
              break;

            case 'strategy':
              // Modo "Traza ruta": empuje nominal y orientación táctica (-4°)
              gsap.to(flameMode, { scaleY: 1.0, duration: T.mode, ease: 'power2.out', overwrite: 'auto' });
              gsap.to(glowMode, { opacity: 0.7, duration: T.mode, overwrite: 'auto' });
              break;

            case 'execution':
              // Modo "Empuje": incremento de potencia térmica al máximo
              gsap.to(flameMode, { scaleY: 1.25, duration: T.mode, ease: 'power3.out', overwrite: 'auto' });
              gsap.to(glowMode, { opacity: 1.0, duration: T.mode, overwrite: 'auto' });
              break;

            case 'landed':
              // Modo "Aterrizaje": llama reducida y descanso del propulsor
              gsap.to(flameMode, { scaleY: 0.3, opacity: 0.4, duration: T.mode, ease: EASE.wind, overwrite: 'auto' });
              gsap.to(glowMode, { opacity: 0.2, duration: T.mode, overwrite: 'auto' });
              break;

            default:
              gsap.to(flameMode, { scaleY: 1.0, opacity: 1.0, duration: T.mode, overwrite: 'auto' });
              gsap.to(glowMode, { opacity: 0.75, duration: T.mode, overwrite: 'auto' });
              break;
          }
        };

        sectionModes.forEach(({ selector, mode, cta, href }) => {
          const el = document.querySelector(selector);
          if (el) {
            const st = ScrollTrigger.create({
              trigger: el,
              start: 'top 55%',
              end: 'bottom 45%',
              onEnter: () => {
                applyMode(mode);
                setCtaLabel(cta);
                setCtaHref(href);
                setCtaVisible(desktop && isDocked);
              },
              onEnterBack: () => {
                applyMode(mode);
                setCtaLabel(cta);
                setCtaHref(href);
                setCtaVisible(desktop && isDocked);
              },
              onLeave: () => {
                if (mode === 'landed') applyMode('execution');
              },
              onLeaveBack: () => {
                if (mode === 'intelligence') applyMode('idle');
              },
            });
            sectionTriggers.push(st);
          }
        });

        // =====================================================================
        // PASO 7 · FÍSICA REACTIVA (Capa [data-layer=physics] vía ticker + quickTo)
        // =====================================================================
        // Velocity Tracker global de ScrollTrigger
        const globalVelocityST = ScrollTrigger.create({ start: 0, end: 'max' });

        // Animadores ultra-optimizados quickTo (cero instanciaciones de gsap.to por frame)
        const rotR = gsap.quickTo(rocketPhys, 'rotation', { duration: 0.6, ease: 'power3.out' });
        const rotW = gsap.quickTo(wingsPhys, 'rotation', { duration: 0.8, ease: 'power3.out' });
        const flmY = gsap.quickTo(flamePhys, 'scaleY', { duration: 0.5, ease: 'power2.out' });

        let smoothedVelocity = 0;

        const onTick = (_time: number, deltaTimeMs: number) => {
          // Amortiguación física independiente de FPS mediante ley exponencial de decaimiento
          const dtSec = Math.min(deltaTimeMs / 1000, 0.1);
          const k = 1 - Math.exp(-dtSec * PHYS.damping);
          const currentVel = globalVelocityST.getVelocity();

          smoothedVelocity += (currentVel - smoothedVelocity) * k;

          // Mapeo preciso a ±9° con saturación para garantizar estabilidad visual
          const tilt = gsap.utils.clamp(
            -PHYS.tiltMax,
            PHYS.tiltMax,
            gsap.utils.mapRange(-PHYS.velRange, PHYS.velRange, -PHYS.tiltMax, PHYS.tiltMax, smoothedVelocity)
          );

          // Asignar a las capas de física exclusivas
          rotR(tilt);
          rotW(tilt * 0.35); // Alas reaccionan con menor ángulo para dar cohesión de fuselaje
          flmY(1 + Math.min(Math.abs(smoothedVelocity) / PHYS.velRange, 1) * PHYS.flameMax);
        };

        // El ticker solo se acopla activamente en desktop sin reduced motion
        gsap.ticker.add(onTick);

        // =====================================================================
        // CLEANUP ESTRICTO
        // =====================================================================
        return () => {
          gsap.ticker.remove(onTick);
          introTl.kill();
          masterTl.kill();
          globalVelocityST.kill();
          sectionTriggers.forEach((st) => st.kill());
          document.body.classList.remove('rocket-docked');
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <>
      {/* 1. Posicionador Centrado Flotante de Escenario */}
      <div
        ref={rootRef}
        aria-hidden="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none select-none"
        style={{ willChange: 'transform' }}
      >
        <BowolLogo className="w-[min(60vw,420px)] max-sm:w-[min(82vw,320px)] h-auto text-zinc-950 dark:text-[#E7E7EA] drop-shadow-2xl transition-colors duration-200" />
      </div>

      {/* 2. Ancla Real del DOM para Medición de Runtime sin Números Mágicos */}
      <span
        ref={dockRef}
        data-logo-dock
        aria-hidden="true"
        className="fixed top-1/2 left-6 md:left-10 -translate-y-1/2 w-[120px] h-[120px] pointer-events-none select-none -z-50 opacity-0"
      />

      {/* 3. CTA Contextual de Navegación Lateral (Solo desktop, cuando está docked) */}
      {ctaVisible && isDocked && (
        <a
          id="rocket-cta"
          href={ctaHref}
          style={{
            position: 'fixed',
            left: `${ctaCoords.left}px`,
            top: `${ctaCoords.top}px`,
            zIndex: 50,
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 text-xs font-semibold shadow-xl border border-zinc-200 dark:border-white/10 backdrop-blur-xl transition-all hover:border-orange-500/50 hover:shadow-orange-500/10 pointer-events-auto"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>{ctaLabel}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
        </a>
      )}

      {/* 4. Monitor de Rendimiento de Scroll (Solo modo DEV) */}
      <ScrollDebug
        mode={activeMode}
        isDocked={isDocked}
        masterProgress={masterProgress}
      />
    </>
  );
}
