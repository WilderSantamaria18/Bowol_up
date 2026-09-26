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
        className="relative h-[90vh] sm:h-screen w-full overflow-hidden flex flex-col items-center justify-center select-none"
      >
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="aurora aurora-a opacity-60 dark:opacity-90" />
          <div className="aurora aurora-b opacity-50 dark:opacity-80" />
          <div className="absolute inset-0 grid-bg opacity-40 dark:opacity-70" />
        </div>

        {/* Scroll Hint */}
        <div
          id="scroll-hint"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 dark:text-white/30 transition-opacity"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold">
            Desplázate para despegar
          </span>
          <span className="w-[18px] h-[28px] rounded-full border border-zinc-400 dark:border-white/20 flex items-start justify-center p-1">
            <span className="w-[3px] h-[6px] rounded-full bg-orange-500 animate-bounce" />
          </span>
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
