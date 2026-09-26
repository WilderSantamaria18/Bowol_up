import React from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ExecutiveCockpit } from '@/features/dashboard/components/ExecutiveCockpit';
import { ScrollProgressIndicator } from '@/features/landing/components/ScrollProgressIndicator';
import { AnimatedLogoCompanion } from '@/features/landing/components/AnimatedLogoCompanion';
import { LandingHeroWith3DTilt } from '@/features/landing/components/LandingHeroWith3DTilt';
import { LandingVerifiedSourcesTicker } from '@/features/landing/components/LandingVerifiedSourcesTicker';
import { LandingProblemSpotlight } from '@/features/landing/components/LandingProblemSpotlight';
import { LandingContinuousCycle } from '@/features/landing/components/LandingContinuousCycle';
import { LandingPlatformBento } from '@/features/landing/components/LandingPlatformBento';
import { LandingInteractiveTerminal } from '@/features/landing/components/LandingInteractiveTerminal';
import { LandingImpactNumbers } from '@/features/landing/components/LandingImpactNumbers';
import { LandingEnterpriseCta } from '@/features/landing/components/LandingEnterpriseCta';
import { LandingFooter } from '@/features/landing/components/LandingFooter';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Si el usuario está autenticado, mostramos el Cockpit Ejecutivo de su espacio de trabajo
  if (isAuthenticated) {
    return <ExecutiveCockpit />;
  }

  // Si es un visitante, mostramos la Landing Page interactiva estilo Apple / Samsung
  return (
    <div className="relative w-full bg-slate-100/90 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-orange-500/20 selection:text-orange-500 transition-colors duration-200">
      {/* Subtle Analog Texture Film Grain */}
      <div className="film-grain" />

      {/* Neon Scroll Progress Line */}
      <ScrollProgressIndicator />

      {/* Interactive GSAP Flying Rocket Companion with Authentic Vector Logo */}
      <AnimatedLogoCompanion />

      {/* 0. Hero Stage: Donde el logotipo oficial de BOWOL comanda y despega */}
      <section
        id="hero-section"
        className="relative h-[92vh] sm:h-screen w-full overflow-hidden flex flex-col items-center justify-center select-none"
      >
        {/* Dynamic Atmospheric Nebula & Stardust Grid */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="aurora aurora-a opacity-60 dark:opacity-90" />
          <div className="aurora aurora-b opacity-50 dark:opacity-80" />
          <div className="absolute inset-0 grid-bg opacity-40 dark:opacity-70" />
          
          {/* Subtle floating quantum signal nodes */}
          <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-orange-400/40 animate-ping" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-400/40 animate-pulse" />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-amber-400/50" />
        </div>

        {/* Telemetry HUD Mission Badge (fades smoothly on scroll) */}
        <div className="hero-fade-on-scroll absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-200/80 dark:bg-white/[0.06] border border-zinc-300/80 dark:border-white/10 backdrop-blur-xl text-[11px] font-bold text-zinc-800 dark:text-zinc-200 shadow-sm transition-opacity">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wide">BOWOL 2.0 • PROTOCOLO DE DESPLIEGUE ACTIVO</span>
          <span className="text-zinc-400 dark:text-zinc-600">|</span>
          <span className="text-orange-600 dark:text-orange-400 font-mono text-[10px]">28 FUENTES VIVAS</span>
        </div>

        {/* Hero Mission Subtitle (fades smoothly on scroll) */}
        <div className="hero-fade-on-scroll absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 text-center max-w-xl px-4 space-y-1.5 transition-opacity">
          <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-display">
            De la señal de mercado a la ejecución real
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
            Inteligencia continua, matrices FODA y sprints ejecutables con IA en un solo ciclo unificado.
          </p>
        </div>

        {/* Interactive Scroll / Launch Trigger */}
        <button
          id="scroll-hint"
          type="button"
          onClick={() => {
            window.scrollTo({ top: window.innerHeight * 0.88, behavior: 'smooth' });
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 dark:text-white/40 hover:text-orange-500 dark:hover:text-orange-400 transition-all cursor-pointer group"
          aria-label="Iniciar despegue de BOWOL"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold group-hover:text-orange-500 transition-colors">
            Haz clic o desplázate para despegar
          </span>
          <div className="w-[18px] h-[28px] rounded-full border border-zinc-400 dark:border-white/20 group-hover:border-orange-500 flex items-start justify-center p-1 transition-colors">
            <span className="w-[3px] h-[6px] rounded-full bg-orange-500 animate-bounce" />
          </div>
        </button>
      </section>

      {/* 1. Hero con Apple-Style 3D Tilt Mockup */}
      <LandingHeroWith3DTilt />

      {/* 2. Ticker de Fuentes de Señal Verificadas */}
      <LandingVerifiedSourcesTicker />

      {/* 3. El Problema (Spotlight Cards con Iluminación al Cursor) */}
      <LandingProblemSpotlight />

      {/* 4. Ciclo Continuo (Navegador Interactivo de Metodología) */}
      <LandingContinuousCycle />

      {/* 5. Arquitectura de Plataforma (Bento Grid 12 Columnas) */}
      <LandingPlatformBento />

      {/* 6. Simulador / Terminal de Producto en Vivo (Tabs Reactivos) */}
      <LandingInteractiveTerminal />

      {/* 7. Métricas de Impacto Industrial */}
      <LandingImpactNumbers />

      {/* 8. Call to Action Empresarial & Formulario de Acceso */}
      <LandingEnterpriseCta />

      {/* 9. Footer Corporativo Completo */}
      <LandingFooter />
    </div>
  );
};
