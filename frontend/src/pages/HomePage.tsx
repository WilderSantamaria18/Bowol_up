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
        id="hero-stage"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-between select-none pt-24 pb-12 px-4"
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

        {/* Spacer for center vector logo rendered fixed by AnimatedLogoCompanion */}
        <div className="w-full h-44 sm:h-56 pointer-events-none" />

        {/* Hero Bottom Zone: Clean Subtitle & Launch Cue */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 z-10">
          {/* Executive Subtitle */}
          <div className="hero-stage-item text-center px-4 space-y-1.5">
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white font-display">
              De la señal de mercado a la ejecución estratégica
            </h2>
            <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">
              Inteligencia continua de mercado, matrices FODA cuantitativas y orquestación de sprints en un solo ciclo unificado.
            </p>
          </div>

          {/* Interactive Scroll / Launch Trigger */}
          <button
            id="scroll-hint-btn"
            type="button"
            onClick={() => {
              window.scrollTo({ top: window.innerHeight * 0.95, behavior: 'smooth' });
            }}
            className="hero-stage-item flex flex-col items-center gap-2 text-zinc-500 dark:text-white/40 hover:text-orange-500 dark:hover:text-orange-400 transition-all cursor-pointer group mt-2"
            aria-label="Iniciar despegue de BOWOL"
          >
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold group-hover:text-orange-500 transition-colors">
              Desplázate para iniciar trayectoria
            </span>
            <div className="w-[18px] h-[28px] rounded-full border border-zinc-400 dark:border-white/20 group-hover:border-orange-500 flex items-start justify-center p-1 transition-colors">
              <span className="w-[3px] h-[6px] rounded-full bg-orange-500 animate-bounce" />
            </div>
          </button>
        </div>
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
