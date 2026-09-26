import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export const AnimatedLogoCompanion: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionerRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<SVGGElement>(null);
  const flameGroupRef = useRef<SVGGElement>(null);
  const flameInnerRef = useRef<SVGPathElement>(null);
  const flameGlowRef = useRef<SVGEllipseElement>(null);
  const rocketRef = useRef<SVGGElement>(null);
  const wingsRef = useRef<SVGGElement>(null);

  const [ctaVisible, setCtaVisible] = useState(false);
  const [ctaLabel, setCtaLabel] = useState('Ver flujo');
  const [ctaHref, setCtaHref] = useState('#flujo');
  const [ctaCoords, setCtaCoords] = useState({ top: 0, left: 0 });

  // Interactive states
  const [isHovered, setIsHovered] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Smooth Interactive Impulse on Click
  const triggerImpulse = useCallback(() => {
    if (!rocketRef.current || !wingsRef.current || !flameInnerRef.current || boostActive) return;

    setBoostActive(true);

    // Smooth rotational impulse with elegant cubic bezier
    gsap.to([rocketRef.current, wingsRef.current], {
      rotation: '+=360',
      transformOrigin: '6450px 6400px',
      duration: 1.1,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });

    // Elegant flame stretch
    gsap.to(flameInnerRef.current, {
      scaleY: 1.8,
      scaleX: 1.25,
      duration: 0.45,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    });

    // Subtle propellant particle sparks
    const r = positionerRef.current?.getBoundingClientRect();
    if (r) {
      const originX = r.left + r.width / 2;
      const originY = r.bottom - 8;
      const newParticles: Particle[] = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 5 + 3,
        size: Math.random() * 2.5 + 2,
        opacity: 0.9,
      }));
      setParticles(newParticles);
    }

    setTimeout(() => {
      setBoostActive(false);
    }, 1150);
  }, [boostActive]);

  // Particle physics loop using requestAnimationFrame
  useEffect(() => {
    if (particles.length === 0) return;
    let animId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      if (time - lastTime >= 16) {
        lastTime = time;
        setParticles((prev) => {
          if (prev.length === 0) return prev;
          return prev
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              opacity: p.opacity - 0.035,
            }))
            .filter((p) => p.opacity > 0);
        });
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [particles.length > 0]);

  useEffect(() => {
    const positioner = positionerRef.current;
    const wordmark = wordmarkRef.current;
    const flame = flameGroupRef.current;
    const flameInner = flameInnerRef.current;
    const flameGlow = flameGlowRef.current;
    const rocket = rocketRef.current;
    const wings = wingsRef.current;

    if (!positioner || !wordmark || !flame || !flameInner || !flameGlow || !rocket || !wings) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = () => window.innerWidth >= 960;

    // 1. Estado inicial centrado en viewport
    gsap.set(positioner, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1 });
    gsap.set(wordmark, { opacity: 1, y: 0 });
    gsap.set(flame, { opacity: 0.35, scaleY: 0.55, scaleX: 0.8, transformOrigin: '6450px 5800px' });
    gsap.set(flameGlow, { opacity: 0 });

    // 2. Entrada cinematográfica ultra-suave
    if (!reduceMotion) {
      gsap.from(positioner, {
        scale: 0.88,
        opacity: 0,
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.15,
      });
    }

    // 3. Timeline de Scroll con scrub elástico y suave (scrub: 1.2)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero-stage',
        start: 'top top',
        end: '+=75%',
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });

    // Wordmark se disuelve con naturalidad
    tl.to(wordmark, { opacity: 0, y: 24, duration: 0.6, ease: 'power2.in' }, 0);

    // Desvanecer microdescripciones del hero stage
    const heroElements = document.querySelectorAll('.hero-stage-item');
    if (heroElements.length > 0) {
      tl.to(heroElements, { opacity: 0, y: -16, duration: 0.5, stagger: 0.05, ease: 'power2.in' }, 0);
    }

    // El cohete y las alas viajan hacia el canal lateral izquierdo (gutter)
    tl.to(
      positioner,
      {
        x: () => (isDesktop() ? -window.innerWidth * 0.5 + 52 : -window.innerWidth * 0.5 + 36),
        y: () => (isDesktop() ? -window.innerHeight * 0.15 : -window.innerHeight * 0.25),
        scale: () => (isDesktop() ? 0.18 : 0.14),
        opacity: () => (window.innerWidth >= 1080 ? 1 : 0),
        duration: 1.4,
        ease: 'power2.inOut',
      },
      0
    );

    // Llama se activa de forma gradual
    tl.to(
      flame,
      {
        opacity: 1,
        scaleY: 1,
        scaleX: 1,
        duration: 0.8,
        ease: 'power2.out',
      },
      0.5
    );

    const scrollHint = document.getElementById('scroll-hint-btn');
    if (scrollHint) {
      tl.to(scrollHint, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0);
    }

    // Resplandor de tobera
    tl.to(flameGlow, { opacity: 0.75, duration: 0.6, ease: 'power2.out' }, 0.65);

    // Activación de combustión constante
    const igniteTrigger = ScrollTrigger.create({
      trigger: '#hero-stage',
      start: '+=45%',
      onEnter: () => document.body.classList.add('rocket-ignited'),
      onLeaveBack: () => document.body.classList.remove('rocket-ignited'),
    });

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 280);

    // 4. Inclinación física reactiva por velocidad (lerp suave)
    let lastY = window.scrollY;
    let velocity = 0;
    let ticking = false;

    const handleScrollPhysics = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      velocity = velocity * 0.85 + delta * 0.15;
      lastY = y;

      if (document.body.classList.contains('rocket-ignited') && !boostActive) {
        const tilt = gsap.utils.clamp(-8, 8, velocity * 0.3);
        gsap.to(rocket, {
          rotation: tilt,
          transformOrigin: '6450px 6400px',
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        gsap.to(wings, {
          rotation: tilt * 0.35,
          transformOrigin: '6450px 6400px',
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        // Estiramiento dinámico de llama suave
        const intensity = gsap.utils.clamp(0.9, 1.25, 1 + Math.abs(velocity) * 0.012);
        gsap.to(flameInner, {
          scaleY: intensity,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking && !reduceMotion) {
        ticking = true;
        requestAnimationFrame(handleScrollPhysics);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // 5. CTAs contextuales al lado del cohete según sección activa
    const sectionTriggers: ScrollTrigger[] = [];
    const updateCtaPos = (label: string, href: string) => {
      if (window.innerWidth < 1260 || !positioner) return;
      const r = positioner.getBoundingClientRect();
      setCtaLabel(label);
      setCtaHref(href);
      setCtaCoords({
        left: r.right + 14,
        top: r.top + r.height / 2 - 16,
      });
      setCtaVisible(true);
    };

    const sections = [
      { id: 'problema', label: 'Ver el ciclo', href: '#ciclo' },
      { id: 'ciclo', label: 'Arquitectura', href: '#plataforma' },
      { id: 'plataforma', label: 'Terminal en vivo', href: '#interactive-demo' },
      { id: 'interactive-demo', label: 'Métricas de impacto', href: '#metricas' },
      { id: 'metricas', label: 'Solicitar acceso', href: '#solicitar' },
    ];

    sections.forEach(({ id, label, href }) => {
      const el = document.getElementById(id);
      if (el) {
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => updateCtaPos(label, href),
          onEnterBack: () => updateCtaPos(label, href),
          onLeave: () => setCtaVisible(false),
          onLeaveBack: () => setCtaVisible(false),
        });
        sectionTriggers.push(trigger);
      }
    });

    const handleResize = () => {
      if (positioner) {
        const r = positioner.getBoundingClientRect();
        setCtaCoords({
          left: r.right + 16,
          top: r.top + r.height / 2 - 16,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      tl.kill();
      igniteTrigger.kill();
      sectionTriggers.forEach((st) => st.kill());
      document.body.classList.remove('rocket-ignited');
    };
  }, [boostActive]);

  return (
    <>
      <style>{`
        @keyframes flame-breathe-subtle {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50% { transform: scaleY(1.12) scaleX(0.95); }
        }
        body.rocket-ignited #companion-flame-inner {
          animation: flame-breathe-subtle 1.8s ease-in-out infinite;
          transform-origin: 6450px 5800px;
        }
      `}</style>

      {/* Partículas de impulso propulsor */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: '#F5A623',
            borderRadius: '50%',
            opacity: p.opacity,
            pointerEvents: 'none',
            zIndex: 65,
            boxShadow: '0 0 8px rgba(245, 166, 35, 0.7)',
          }}
        />
      ))}

      {/* Capa de Navegación Acompañante */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-40 pointer-events-none"
        aria-hidden="true"
      >
        <div
          ref={positionerRef}
          className="absolute top-1/2 left-1/2 will-change-transform"
          style={{ transformOrigin: '50% 50%' }}
        >
          {/* Contenedor Interactivo del Cohete */}
          <div
            onClick={triggerImpulse}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="pointer-events-auto cursor-pointer select-none group relative transition-transform duration-300 hover:scale-[1.06] active:scale-[0.96]"
            aria-label="Cohete BOWOL interactivo"
          >
            {/* Tooltip táctico sin emojis */}
            {isHovered && !boostActive && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-zinc-900/90 dark:bg-zinc-950/95 text-zinc-200 border border-zinc-700/80 text-[10.5px] font-medium whitespace-nowrap shadow-xl backdrop-blur-md transition-opacity">
                Impulsar navegación
              </div>
            )}

            <svg
              viewBox="200 100 898 620"
              xmlns="http://www.w3.org/2000/svg"
              className="block w-[min(62vw,480px)] max-sm:w-[min(82vw,320px)] h-auto text-zinc-950 dark:text-[#E7E7EA] drop-shadow-xl transition-colors duration-200"
              aria-label="BOWOL Companion Animated Logo"
            >
              <defs>
                <filter id="companion-flame-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="14" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="companion-flame-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FED7AA" />
                  <stop offset="50%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
              </defs>

              {/* Transformación idéntica a bowol_logo1.svg */}
              <g transform="translate(0, 862) scale(0.1, -0.1)">
                {/* ALAS (Wings) */}
                <g ref={wingsRef} fill="currentColor" className="will-change-transform">
                  <path d="M4610 6388 c0 -40 4 -136 10 -213 5 -77 14 -322 21 -545 l11 -405 111 -180 c60 -99 120 -196 132 -215 25 -39 196 -325 380 -635 65 -110 184 -310 265 -445 80 -135 172 -289 204 -342 32 -54 59 -98 61 -98 3 0 193 196 301 310 49 52 140 147 202 212 61 64 112 123 112 131 0 8 -23 81 -51 163 -28 82 -64 190 -82 241 l-31 92 -25 -19 c-14 -10 -63 -57 -109 -104 -46 -47 -87 -86 -92 -86 -16 0 -116 278 -185 515 -70 238 -133 488 -174 688 l-37 177 -84 68 c-47 38 -192 156 -324 263 -131 107 -256 208 -276 224 -21 17 -98 80 -171 140 -73 61 -141 116 -151 123 -17 12 -18 9 -18 -60z" />
                  <path d="M8360 6403 c-235 -187 -927 -757 -938 -772 -7 -10 -21 -65 -32 -122 -41 -216 -119 -522 -205 -809 -45 -147 -147 -435 -159 -447 -4 -4 -56 42 -116 102 -60 60 -112 106 -116 103 -3 -4 -44 -118 -90 -254 l-84 -247 103 -106 c57 -58 144 -149 193 -201 208 -221 310 -325 320 -328 7 -2 21 10 32 25 23 33 332 549 502 838 129 219 231 391 265 445 12 19 42 69 67 110 98 163 193 319 243 395 l51 80 12 355 c7 195 17 465 23 600 6 135 9 256 7 269 -3 23 -7 21 -78 -36z" />
                </g>

                {/* COHETE (Cockpit con ventanilla) */}
                <g ref={rocketRef} fill="currentColor" className="will-change-transform">
                  <path d="M6453 7027 c-172 -181 -268 -390 -293 -635 -24 -247 50 -736 155 -1017 34 -90 200 -425 211 -425 8 0 181 357 208 428 62 164 126 469 147 692 13 145 8 360 -11 450 -40 187 -155 393 -298 533 l-49 48 -70 -74z m184 -614 c54 -43 77 -88 77 -148 0 -172 -202 -257 -323 -136 -71 71 -76 181 -11 255 45 51 85 67 157 63 52 -2 69 -8 100 -34z" />
                </g>

                {/* PROPULSORES Y LLAMA */}
                <g ref={flameGroupRef} className="will-change-transform">
                  <ellipse
                    ref={flameGlowRef}
                    cx="6450"
                    cy="5100"
                    rx="360"
                    ry="660"
                    fill="#F97316"
                    filter="url(#companion-flame-glow)"
                  />
                  {/* Toberas laterales de bowol_logo1.svg */}
                  <path
                    fill="url(#companion-flame-grad)"
                    d="M6004 5787 c-34 -45 -84 -116 -112 -157 l-52 -75 19 -85 c55 -248 104 -425 117 -425 9 0 84 110 156 229 l42 69 -32 161 c-17 88 -39 204 -48 256 -8 52 -19 98 -23 102 -3 4 -34 -29 -67 -75z"
                  />
                  <path
                    fill="url(#companion-flame-grad)"
                    d="M6970 5861 c0 -13 -67 -367 -85 -451 -16 -74 -17 -72 94 -239 31 -45 63 -94 71 -107 20 -32 26 -30 39 9 28 86 111 435 111 467 0 31 -17 60 -104 177 -100 136 -126 165 -126 144z"
                  />
                  {/* Llama principal de tobera */}
                  <path
                    ref={flameInnerRef}
                    id="companion-flame-inner"
                    fill="url(#companion-flame-grad)"
                    d="M 6450 5800 C 6620 5400 6640 4800 6450 4200 C 6260 4800 6280 5400 6450 5800 Z"
                  />
                </g>

                {/* WORDMARK */}
                <g ref={wordmarkRef} className="will-change-transform">
                  {/* B */}
                  <path
                    fill="currentColor"
                    d="M2632 2818 c-9 -9 -12 -128 -12 -474 0 -254 3 -469 6 -478 5 -14 49 -16 393 -16 423 0 457 4 556 59 29 17 64 48 85 76 30 42 35 58 38 117 7 116 -38 192 -142 242 l-47 23 39 26 c75 53 104 140 78 232 -32 107 -129 176 -278 195 -112 14 -701 13 -716 -2z m684 -230 c57 -56 21 -130 -68 -143 -24 -3 -104 -5 -178 -3 l-135 3 -3 74 c-2 41 -1 80 2 88 5 12 37 14 181 11 174 -3 175 -3 201 -30z m48 -367 c34 -32 40 -56 26 -91 -25 -59 -45 -65 -262 -68 l-198 -4 0 97 0 96 204 -3 c200 -3 205 -3 230 -27z"
                  />
                  {/* O */}
                  <path
                    fill="currentColor"
                    d="M4625 2836 c-149 -29 -261 -84 -351 -173 -157 -155 -189 -359 -89 -554 25 -46 118 -142 175 -179 73 -47 199 -89 303 -100 310 -36 583 88 693 315 38 78 39 82 39 190 0 105 -2 113 -34 180 -46 93 -150 197 -248 248 -137 71 -340 102 -488 73z m207 -227 c164 -34 269 -156 255 -294 -10 -100 -68 -173 -177 -224 -47 -22 -68 -26 -150 -26 -82 1 -102 4 -151 28 -62 30 -121 82 -145 129 -22 42 -29 133 -15 185 25 90 112 168 221 197 68 18 95 19 162 5z"
                  />
                  {/* W Ámbar Oficial */}
                  <path
                    fill="#F5A623"
                    d="M 5670 2820 L 5970 2820 L 6230 2300 L 6480 2820 L 6650 2820 L 6920 2300 L 7160 2820 L 7450 2820 L 7020 1860 L 6810 1860 L 6560 2370 L 6300 1860 L 6090 1860 Z"
                  />
                  {/* O */}
                  <path
                    fill="currentColor"
                    d="M8285 2839 c-287 -42 -502 -235 -521 -469 -12 -140 36 -261 146 -368 73 -72 182 -131 295 -158 95 -24 305 -23 394 0 302 81 481 321 427 575 -47 221 -246 383 -519 420 -89 12 -136 12 -222 0z m251 -250 c73 -27 157 -107 173 -166 40 -144 -22 -270 -167 -336 -37 -17 -66 -22 -142 -22 -82 0 -103 4 -151 26 -176 82 -226 279 -107 414 94 107 245 139 394 84z"
                  />
                  {/* L */}
                  <path
                    fill="currentColor"
                    d="M9533 2824 c-10 -5 -13 -112 -13 -490 l0 -484 470 0 471 0 -3 123 -3 122 -312 3 -313 2 -2 363 -3 362 -140 2 c-77 1 -146 -1 -152 -3z"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>


      {/* CTA de Navegación Lateral Sincronizado */}
      {ctaVisible && (
        <a
          href={ctaHref}
          style={{
            position: 'fixed',
            left: `${ctaCoords.left}px`,
            top: `${ctaCoords.top}px`,
            zIndex: 60,
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 text-xs font-semibold shadow-lg border border-zinc-200 dark:border-white/10 backdrop-blur-xl transition-all hover:border-orange-500/50 hover:shadow-orange-500/10 pointer-events-auto"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>{ctaLabel}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
        </a>
      )}
    </>
  );
};
