import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface TrajectorySpark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
}

interface NavWaypoint {
  id: string;
  label: string;
  sub: string;
  href: string;
  stageName: string;
}

const NAV_WAYPOINTS: NavWaypoint[] = [
  { id: 'hero-stage', label: 'Despegue', sub: 'Ignición Vectorial', href: '#hero-stage', stageName: 'LAUNCH' },
  { id: 'problema', label: 'Radar de Señales', sub: 'Escaneo Activo', href: '#problema', stageName: 'RADAR' },
  { id: 'ciclo', label: 'Ciclo Continuo', sub: 'Trayectoria Estratégica', href: '#ciclo', stageName: 'ORBIT' },
  { id: 'plataforma', label: 'Plataforma Bento', sub: 'Arquitectura Modular', href: '#plataforma', stageName: 'SYSTEM' },
  { id: 'interactive-demo', label: 'Terminal de Producto', sub: 'Ejecución en Vivo', href: '#interactive-demo', stageName: 'TERMINAL' },
  { id: 'metricas', label: 'Métricas de Impacto', sub: 'Telemetría Validada', href: '#metricas', stageName: 'TELEMETRY' },
  { id: 'solicitar', label: 'Misión Acceso', sub: 'Inserción Final', href: '#solicitar', stageName: 'LANDING' },
];

export const AnimatedLogoCompanion: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionerRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<SVGGElement>(null);

  // Letras individuales para dispersión aerodinámica controlada
  const letterBRef = useRef<SVGPathElement>(null);
  const letterO1Ref = useRef<SVGPathElement>(null);
  const letterWRef = useRef<SVGPathElement>(null);
  const letterO2Ref = useRef<SVGPathElement>(null);
  const letterLRef = useRef<SVGPathElement>(null);

  // Fuselaje y toberas oficiales
  const rocketGroupRef = useRef<SVGGElement>(null);
  const rocketRef = useRef<SVGGElement>(null);
  const wingsRef = useRef<SVGGElement>(null);
  const flameGroupRef = useRef<SVGGElement>(null);
  const flameInnerRef = useRef<SVGPathElement>(null);
  const flameGlowRef = useRef<SVGEllipseElement>(null);
  const machDiamondsRef = useRef<SVGGElement>(null);
  const shockwaveRef = useRef<SVGEllipseElement>(null);
  const signalRingRef = useRef<SVGCircleElement>(null);

  // Telemetría reactiva
  const [activeStage, setActiveStage] = useState<NavWaypoint>(NAV_WAYPOINTS[0]);
  const [machSpeed, setMachSpeed] = useState('1.0');
  const [isHovered, setIsHovered] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [hudVisible, setHudVisible] = useState(false);
  const [hudCoords, setHudCoords] = useState({ top: 0, left: 0 });
  const [sparks, setSparks] = useState<TrajectorySpark[]>([]);

  const boostActiveRef = useRef(false);
  const velocityRef = useRef(0);
  const targetTiltRef = useRef(0);
  const currentTiltRef = useRef(0);

  // Impulso Axial Supersónico (Afterburner táctico - Sin giro genérico de 360°)
  const triggerImpulse = useCallback(() => {
    if (!rocketGroupRef.current || !flameInnerRef.current || boostActiveRef.current) return;

    boostActiveRef.current = true;
    setBoostActive(true);

    // 1. Onda de choque sónica en SVG
    if (shockwaveRef.current) {
      gsap.fromTo(
        shockwaveRef.current,
        { rx: 200, ry: 80, opacity: 0.95, strokeWidth: 16 },
        { rx: 1400, ry: 500, opacity: 0, strokeWidth: 1, duration: 0.55, ease: 'power2.out' }
      );
    }

    // 2. Impulso axial físico con retroceso de amortiguador hidráulico
    gsap.timeline({
      onComplete: () => {
        boostActiveRef.current = false;
        setBoostActive(false);
      },
    })
      .to(rocketGroupRef.current, {
        y: -110,
        scale: 1.06,
        transformOrigin: '6450px 6400px',
        duration: 0.16,
        ease: 'power3.out',
      })
      .to(rocketGroupRef.current, {
        y: 0,
        scale: 1,
        duration: 0.42,
        ease: 'elastic.out(1, 0.45)',
      });

    // 3. Estiramiento térmico de la tobera de plasma
    gsap.to(flameInnerRef.current, {
      scaleY: 2.1,
      scaleX: 1.35,
      duration: 0.18,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    });

    if (flameGlowRef.current) {
      gsap.to(flameGlowRef.current, {
        opacity: 0.95,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
      });
    }

    // 4. Emisión de partículas térmicas de estela
    const r = positionerRef.current?.getBoundingClientRect();
    if (r) {
      const originX = r.left + r.width / 2;
      const originY = r.bottom - 4;
      const newSparks: TrajectorySpark[] = Array.from({ length: 16 }).map((_, i) => ({
        id: Date.now() + i,
        x: originX + (Math.random() - 0.5) * 18,
        y: originY,
        vx: (Math.random() - 0.5) * 4.2,
        vy: Math.random() * 5 + 3.5,
        size: Math.random() * 3 + 2,
        opacity: 0.95,
        life: 1,
      }));
      setSparks((prev) => [...prev.slice(-24), ...newSparks]);
    }
  }, []);

  // Loop de partículas con amortiguación
  useEffect(() => {
    if (sparks.length === 0) return;
    let animId: number;
    let lastTime = performance.now();

    const updateSparks = (time: number) => {
      if (time - lastTime >= 16) {
        lastTime = time;
        setSparks((prev) =>
          prev
            .map((s) => ({
              ...s,
              x: s.x + s.vx,
              y: s.y + s.vy,
              opacity: s.opacity - 0.045,
            }))
            .filter((s) => s.opacity > 0)
        );
      }
      animId = requestAnimationFrame(updateSparks);
    };

    animId = requestAnimationFrame(updateSparks);
    return () => cancelAnimationFrame(animId);
  }, [sparks.length]);

  // Master Orchestrator: Scroll Cinemático y Dinámica de Vuelo Continuo
  useEffect(() => {
    const positioner = positionerRef.current;
    const wordmark = wordmarkRef.current;
    const rocketGroup = rocketGroupRef.current;
    const flame = flameGroupRef.current;
    const flameInner = flameInnerRef.current;
    const flameGlow = flameGlowRef.current;
    const machDiamonds = machDiamondsRef.current;
    const signalRing = signalRingRef.current;

    const letterB = letterBRef.current;
    const letterO1 = letterO1Ref.current;
    const letterW = letterWRef.current;
    const letterO2 = letterO2Ref.current;
    const letterL = letterLRef.current;

    if (!positioner || !wordmark || !rocketGroup || !flame || !flameInner || !flameGlow) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = () => window.innerWidth >= 1024;
    const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;

    // 1. Estado inicial de reposo: Emblema corporativo unificado en Hero Stage
    gsap.set(positioner, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 });
    gsap.set(wordmark, { opacity: 1, y: 0 });
    gsap.set([letterB, letterO1, letterW, letterO2, letterL].filter(Boolean), {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
    });
    gsap.set(flame, { opacity: 0.35, scaleY: 0.55, scaleX: 0.8, transformOrigin: '6450px 5800px' });
    gsap.set(flameGlow, { opacity: 0 });
    if (machDiamonds) gsap.set(machDiamonds, { opacity: 0 });
    if (signalRing) gsap.set(signalRing, { opacity: 0, scale: 0.6, transformOrigin: '650px 330px' });

    // 2. FASE INTRO / HERO: Despegue e Ignición Aerodinámica
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero-stage',
        start: 'top top',
        end: '+=100%',
        scrub: 1.1,
        invalidateOnRefresh: true,
      },
    });

    // Dispersión aerodinámica de las letras (Shockwave de separación)
    if (letterB) heroTl.to(letterB, { x: -180, y: -24, rotation: -6, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0);
    if (letterO1) heroTl.to(letterO1, { x: -90, y: -40, rotation: -3, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0);
    // La 'W' oficial ámbar emite un pulso hacia el cohete antes de disolverse
    if (letterW) {
      heroTl.to(letterW, { y: -20, scale: 1.05, duration: 0.25, ease: 'power2.out' }, 0);
      heroTl.to(letterW, { y: -65, opacity: 0, scale: 0.95, duration: 0.35, ease: 'power2.in' }, 0.22);
    }
    if (letterO2) heroTl.to(letterO2, { x: 90, y: -40, rotation: 3, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0);
    if (letterL) heroTl.to(letterL, { x: 180, y: -24, rotation: 6, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0);

    // Micro-elementos del hero stage
    const heroElements = document.querySelectorAll('.hero-stage-item');
    if (heroElements.length > 0) {
      heroTl.to(heroElements, { opacity: 0, y: -20, duration: 0.4, stagger: 0.05, ease: 'power2.in' }, 0);
    }

    const scrollHint = document.getElementById('scroll-hint-btn');
    if (scrollHint) {
      heroTl.to(scrollHint, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
    }

    // Activación progresiva de la tobera de combustión
    heroTl.to(flame, { opacity: 1, scaleY: 1.15, scaleX: 1.05, duration: 0.5, ease: 'power2.out' }, 0.15);
    heroTl.to(flameGlow, { opacity: 0.8, duration: 0.4, ease: 'power2.out' }, 0.25);
    if (machDiamonds) heroTl.to(machDiamonds, { opacity: 0.85, duration: 0.4 }, 0.35);

    // 3. TRAYECTORIA MULTI-SECCIÓN (Navegación Continental por Toda la Página)
    // El cohete no se queda congelado en una esquina; navega y acompaña el recorrido.
    const masterFlight = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });

    masterFlight
      // Vuelo 0 -> Hero a Problema (Asciende y vira al flanco derecho)
      .to(
        positioner,
        {
          x: () => (isDesktop() ? window.innerWidth * 0.40 : isTablet() ? window.innerWidth * 0.34 : window.innerWidth * 0.35),
          y: () => (isDesktop() ? -window.innerHeight * 0.26 : -window.innerHeight * 0.36),
          scale: () => (isDesktop() ? 0.22 : 0.15),
          rotation: -10, // Cabeceo táctico hacia el contenido de radar
          ease: 'power2.inOut',
          duration: 1.5,
        },
        0
      )
      // Vuelo 1 -> Problema a Ciclo Continuo (Gran viraje orbital cruzando al flanco izquierdo)
      .to(
        positioner,
        {
          x: () => (isDesktop() ? -window.innerWidth * 0.42 : isTablet() ? -window.innerWidth * 0.36 : -window.innerWidth * 0.35),
          y: () => (isDesktop() ? -window.innerHeight * 0.18 : -window.innerHeight * 0.34),
          scale: () => (isDesktop() ? 0.20 : 0.14),
          rotation: 8, // Vira hacia el ciclo continuo
          ease: 'power1.inOut',
          duration: 2.2,
        },
        1.5
      )
      // Vuelo 2 -> Ciclo a Plataforma y Terminal en Vivo (Estabilización en corredor de telemetría)
      .to(
        positioner,
        {
          x: () => (isDesktop() ? -window.innerWidth * 0.44 : -window.innerWidth * 0.36),
          y: () => (isDesktop() ? -window.innerHeight * 0.22 : -window.innerHeight * 0.35),
          scale: () => (isDesktop() ? 0.18 : 0.14),
          rotation: 2,
          ease: 'power2.inOut',
          duration: 2.2,
        },
        3.7
      )
      // Vuelo 3 -> Terminal a Métricas y Enterprise CTA (Inserción orbital final hacia el CTA central)
      .to(
        positioner,
        {
          x: () => (isDesktop() ? 0 : 0),
          y: () => (isDesktop() ? -window.innerHeight * 0.32 : -window.innerHeight * 0.38),
          scale: () => (isDesktop() ? 0.25 : 0.16),
          rotation: 0,
          ease: 'power3.out',
          duration: 2.0,
        },
        5.9
      );

    // Activación de combustión constante para el modo en vuelo
    const igniteTrigger = ScrollTrigger.create({
      trigger: '#hero-stage',
      start: '+=35%',
      onEnter: () => document.body.classList.add('rocket-ignited'),
      onLeaveBack: () => document.body.classList.remove('rocket-ignited'),
    });

    // 4. MOTOR FÍSICO INERCIAL REACTIVO (Cabeceo Aerodinámico por Velocidad y Escaneo)
    let lastY = window.scrollY;
    let ticking = false;

    const handleScrollPhysics = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      velocityRef.current = velocityRef.current * 0.85 + delta * 0.15;
      lastY = y;

      const currentVelocity = velocityRef.current;
      const speedAbs = Math.abs(currentVelocity);

      // Cálculo de velocidad Mach reactiva
      const dynamicMach = (1.0 + Math.min(speedAbs * 0.08, 4.2)).toFixed(1);
      setMachSpeed(dynamicMach);

      if (document.body.classList.contains('rocket-ignited') && !boostActiveRef.current && !reduceMotion) {
        // Al descender rápido: picado aerodinámico (inclinación negativa hacia abajo)
        // Al ascender rápido: cabeceo positivo (freno aerodinámico)
        const targetTilt = currentVelocity > 0
          ? gsap.utils.clamp(-12, 0, -currentVelocity * 0.26)
          : gsap.utils.clamp(0, 8, -currentVelocity * 0.22);

        targetTiltRef.current = targetTilt;
        currentTiltRef.current += (targetTiltRef.current - currentTiltRef.current) * 0.2;

        gsap.to(rocketGroup, {
          rotation: currentTiltRef.current,
          transformOrigin: '6450px 6400px',
          duration: 0.38,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        // Estiramiento dinámico de la tobera proporcional a la aceleración
        const flameStretch = gsap.utils.clamp(0.92, 1.45, 1 + speedAbs * 0.016);
        gsap.to(flameInner, {
          scaleY: flameStretch,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        if (machDiamonds) {
          gsap.to(machDiamonds, {
            opacity: gsap.utils.clamp(0.2, 0.95, speedAbs * 0.04),
            duration: 0.25,
            overwrite: 'auto',
          });
        }
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

    // 5. Waypoints de Telemetría Dinámica Coordinada
    const sectionTriggers: ScrollTrigger[] = [];

    const updateHudPosition = (wp: NavWaypoint) => {
      setActiveStage(wp);
      if (!positioner) return;
      const r = positioner.getBoundingClientRect();

      // Ajustar posición del HUD según la posición del cohete (si está a la izquierda o derecha)
      const onLeftSide = r.left < window.innerWidth / 2;
      setHudCoords({
        left: onLeftSide ? r.right + 14 : r.left - 175,
        top: Math.max(16, r.top + r.height / 2 - 20),
      });
      setHudVisible(window.scrollY > 200);
    };

    NAV_WAYPOINTS.forEach((wp) => {
      const el = document.getElementById(wp.id);
      if (el) {
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => updateHudPosition(wp),
          onEnterBack: () => updateHudPosition(wp),
        });
        sectionTriggers.push(trigger);
      }
    });

    const handleResize = () => {
      ScrollTrigger.refresh();
      if (positioner) {
        const r = positioner.getBoundingClientRect();
        const onLeftSide = r.left < window.innerWidth / 2;
        setHudCoords({
          left: onLeftSide ? r.right + 14 : r.left - 175,
          top: Math.max(16, r.top + r.height / 2 - 20),
        });
      }
    };

    window.addEventListener('resize', handleResize);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 320);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      heroTl.kill();
      masterFlight.kill();
      igniteTrigger.kill();
      sectionTriggers.forEach((st) => st.kill());
      document.body.classList.remove('rocket-ignited');
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes flame-core-pulse {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.95; }
          50% { transform: scaleY(1.14) scaleX(0.96); opacity: 1; }
        }
        @keyframes shock-ring-idle {
          0% { transform: scale(0.95); opacity: 0.4; }
          50% { transform: scale(1.08); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.4; }
        }
        body.rocket-ignited #companion-flame-inner {
          animation: flame-core-pulse 1.6s ease-in-out infinite;
          transform-origin: 6450px 5800px;
        }
        @media (prefers-reduced-motion: reduce) {
          body.rocket-ignited #companion-flame-inner { animation: none; }
        }
      `}</style>

      {/* Partículas de estela de propulsión supersónica */}
      {sparks.map((p) => (
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
            boxShadow: '0 0 10px rgba(245, 166, 35, 0.85), 0 0 4px #FFF7ED',
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
            className="pointer-events-auto cursor-pointer select-none group relative transition-transform duration-300 hover:scale-[1.05] active:scale-[0.96]"
            aria-label="Cohete BOWOL interactivo - Pulsa para afterburner"
          >
            {/* Tooltip táctico de aviación */}
            {isHovered && !boostActive && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-zinc-950/95 text-zinc-100 border border-orange-500/40 text-[10px] font-mono tracking-wider uppercase whitespace-nowrap shadow-2xl backdrop-blur-md flex items-center gap-1.5 z-50">
                <Zap className="w-3 h-3 text-orange-400" />
                <span>Afterburner // Impulso Axial</span>
              </div>
            )}

            <svg
              viewBox="200 100 898 620"
              xmlns="http://www.w3.org/2000/svg"
              className="block w-[min(62vw,480px)] max-sm:w-[min(82vw,320px)] h-auto text-zinc-950 dark:text-[#E7E7EA] drop-shadow-2xl transition-colors duration-200"
              aria-label="BOWOL Companion Vector Aircraft"
            >
              <defs>
                <filter id="companion-flame-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="16" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="companion-flame-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFF7ED" />
                  <stop offset="25%" stopColor="#FED7AA" />
                  <stop offset="65%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
                <linearGradient id="companion-diamond-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#F5A623" />
                </linearGradient>
              </defs>

              {/* Anillo de señal de origen */}
              <circle
                ref={signalRingRef}
                cx="650"
                cy="330"
                r="140"
                fill="none"
                stroke="#F5A623"
                strokeWidth="1.5"
                opacity="0"
              />

              {/* Transformación idéntica a bowol_logo1.svg */}
              <g transform="translate(0, 862) scale(0.1, -0.1)">
                {/* Grupo de Onda de Choque Sónica */}
                <ellipse
                  ref={shockwaveRef}
                  cx="6450"
                  cy="5400"
                  rx="200"
                  ry="80"
                  fill="none"
                  stroke="#F5A623"
                  strokeWidth="8"
                  opacity="0"
                />

                {/* GRUPO PRINCIPAL DE VUELO (Fuselaje + Alas con Cabeceo Aerodinámico) */}
                <g ref={rocketGroupRef} className="will-change-transform">
                  {/* ALAS (Wings) */}
                  <g ref={wingsRef} fill="currentColor">
                    <path d="M4610 6388 c0 -40 4 -136 10 -213 5 -77 14 -322 21 -545 l11 -405 111 -180 c60 -99 120 -196 132 -215 25 -39 196 -325 380 -635 65 -110 184 -310 265 -445 80 -135 172 -289 204 -342 32 -54 59 -98 61 -98 3 0 193 196 301 310 49 52 140 147 202 212 61 64 112 123 112 131 0 8 -23 81 -51 163 -28 82 -64 190 -82 241 l-31 92 -25 -19 c-14 -10 -63 -57 -109 -104 -46 -47 -87 -86 -92 -86 -16 0 -116 278 -185 515 -70 238 -133 488 -174 688 l-37 177 -84 68 c-47 38 -192 156 -324 263 -131 107 -256 208 -276 224 -21 17 -98 80 -171 140 -73 61 -141 116 -151 123 -17 12 -18 9 -18 -60z" />
                    <path d="M8360 6403 c-235 -187 -927 -757 -938 -772 -7 -10 -21 -65 -32 -122 -41 -216 -119 -522 -205 -809 -45 -147 -147 -435 -159 -447 -4 -4 -56 42 -116 102 -60 60 -112 106 -116 103 -3 -4 -44 -118 -90 -254 l-84 -247 103 -106 c57 -58 144 -149 193 -201 208 -221 310 -325 320 -328 7 -2 21 10 32 25 23 33 332 549 502 838 129 219 231 391 265 445 12 19 42 69 67 110 98 163 193 319 243 395 l51 80 12 355 c7 195 17 465 23 600 6 135 9 256 7 269 -3 23 -7 21 -78 -36z" />
                  </g>

                  {/* COHETE (Cockpit con ventanilla) */}
                  <g ref={rocketRef} fill="currentColor">
                    <path d="M6453 7027 c-172 -181 -268 -390 -293 -635 -24 -247 50 -736 155 -1017 34 -90 200 -425 211 -425 8 0 181 357 208 428 62 164 126 469 147 692 13 145 8 360 -11 450 -40 187 -155 393 -298 533 l-49 48 -70 -74z m184 -614 c54 -43 77 -88 77 -148 0 -172 -202 -257 -323 -136 -71 71 -76 181 -11 255 45 51 85 67 157 63 52 -2 69 -8 100 -34z" />
                  </g>

                  {/* PROPULSORES Y TOBERA DE PLASMA */}
                  <g ref={flameGroupRef} className="will-change-transform">
                    {/* Resplandor térmico reactivo */}
                    <ellipse
                      ref={flameGlowRef}
                      cx="6450"
                      cy="5100"
                      rx="420"
                      ry="720"
                      fill="#F97316"
                      filter="url(#companion-flame-glow)"
                    />
                    {/* Toberas laterales oficiales */}
                    <path
                      fill="url(#companion-flame-grad)"
                      d="M6004 5787 c-34 -45 -84 -116 -112 -157 l-52 -75 19 -85 c55 -248 104 -425 117 -425 9 0 84 110 156 229 l42 69 -32 161 c-17 88 -39 204 -48 256 -8 52 -19 98 -23 102 -3 4 -34 -29 -67 -75z"
                    />
                    <path
                      fill="url(#companion-flame-grad)"
                      d="M6970 5861 c0 -13 -67 -367 -85 -451 -16 -74 -17 -72 94 -239 31 -45 63 -94 71 -107 20 -32 26 -30 39 9 28 86 111 435 111 467 0 31 -17 60 -104 177 -100 136 -126 165 -126 144z"
                    />
                    {/* Llama central supersónica */}
                    <path
                      ref={flameInnerRef}
                      id="companion-flame-inner"
                      fill="url(#companion-flame-grad)"
                      d="M 6450 5800 C 6640 5400 6660 4800 6450 4100 C 6240 4800 6260 5400 6450 5800 Z"
                    />
                    {/* Mach Diamonds (Nodos de choque supersónico) */}
                    <g ref={machDiamondsRef} opacity="0">
                      <polygon points="6450,5550 6485,5320 6450,5100 6415,5320" fill="url(#companion-diamond-grad)" />
                      <polygon points="6450,5050 6470,4820 6450,4600 6430,4820" fill="url(#companion-diamond-grad)" opacity="0.7" />
                    </g>
                  </g>
                </g>

                {/* WORDMARK ORIGINAL (Letra por Letra para Dispersión Aerodinámica) */}
                <g ref={wordmarkRef} className="will-change-transform">
                  {/* B */}
                  <path
                    ref={letterBRef}
                    fill="currentColor"
                    d="M2632 2818 c-9 -9 -12 -128 -12 -474 0 -254 3 -469 6 -478 5 -14 49 -16 393 -16 423 0 457 4 556 59 29 17 64 48 85 76 30 42 35 58 38 117 7 116 -38 192 -142 242 l-47 23 39 26 c75 53 104 140 78 232 -32 107 -129 176 -278 195 -112 14 -701 13 -716 -2z m684 -230 c57 -56 21 -130 -68 -143 -24 -3 -104 -5 -178 -3 l-135 3 -3 74 c-2 41 -1 80 2 88 5 12 37 14 181 11 174 -3 175 -3 201 -30z m48 -367 c34 -32 40 -56 26 -91 -25 -59 -45 -65 -262 -68 l-198 -4 0 97 0 96 204 -3 c200 -3 205 -3 230 -27z"
                  />
                  {/* O */}
                  <path
                    ref={letterO1Ref}
                    fill="currentColor"
                    d="M4625 2836 c-149 -29 -261 -84 -351 -173 -157 -155 -189 -359 -89 -554 25 -46 118 -142 175 -179 73 -47 199 -89 303 -100 310 -36 583 88 693 315 38 78 39 82 39 190 0 105 -2 113 -34 180 -46 93 -150 197 -248 248 -137 71 -340 102 -488 73z m207 -227 c164 -34 269 -156 255 -294 -10 -100 -68 -173 -177 -224 -47 -22 -68 -26 -150 -26 -82 1 -102 4 -151 28 -62 30 -121 82 -145 129 -22 42 -29 133 -15 185 25 90 112 168 221 197 68 18 95 19 162 5z"
                  />
                  {/* W Ámbar Oficial */}
                  <path
                    ref={letterWRef}
                    fill="#F5A623"
                    d="M 5670 2820 L 5970 2820 L 6230 2300 L 6480 2820 L 6650 2820 L 6920 2300 L 7160 2820 L 7450 2820 L 7020 1860 L 6810 1860 L 6560 2370 L 6300 1860 L 6090 1860 Z"
                  />
                  {/* O */}
                  <path
                    ref={letterO2Ref}
                    fill="currentColor"
                    d="M8285 2839 c-287 -42 -502 -235 -521 -469 -12 -140 36 -261 146 -368 73 -72 182 -131 295 -158 95 -24 305 -23 394 0 302 81 481 321 427 575 -47 221 -246 383 -519 420 -89 12 -136 12 -222 0z m251 -250 c73 -27 157 -107 173 -166 40 -144 -22 -270 -167 -336 -37 -17 -66 -22 -142 -22 -82 0 -103 4 -151 26 -176 82 -226 279 -107 414 94 107 245 139 394 84z"
                  />
                  {/* L */}
                  <path
                    ref={letterLRef}
                    fill="currentColor"
                    d="M9533 2824 c-10 -5 -13 -112 -13 -490 l0 -484 470 0 471 0 -3 123 -3 122 -312 3 -313 2 -2 363 -3 362 -140 2 c-77 1 -146 -1 -152 -3z"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Cápsula de Telemetría Táctica de Navegación (Aero HUD) */}
      {hudVisible && (
        <div
          style={{
            position: 'fixed',
            left: `${hudCoords.left}px`,
            top: `${hudCoords.top}px`,
            zIndex: 60,
          }}
          className="flex flex-col gap-1 pointer-events-auto transition-all duration-300"
        >
          <a
            href={activeStage.href}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 text-zinc-100 border border-zinc-700/60 dark:border-white/10 shadow-2xl backdrop-blur-xl transition-all hover:border-orange-500/60 hover:shadow-orange-500/10 group"
          >
            {/* LED de Estado Activo */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono tracking-widest text-orange-400 uppercase font-semibold">
                  {activeStage.stageName}
                </span>
                <span className="text-[9px] font-mono text-zinc-500">|</span>
                <span className="text-[9px] font-mono text-zinc-400 font-medium">
                  M {machSpeed}
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-200 tracking-tight group-hover:text-white transition-colors">
                {activeStage.label}
              </span>
            </div>

            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-1" />
          </a>
        </div>
      )}
    </>
  );
};
