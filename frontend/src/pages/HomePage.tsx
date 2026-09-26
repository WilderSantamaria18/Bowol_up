import React from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ExecutiveCockpit } from '@/features/dashboard/components/ExecutiveCockpit';
import { ScrollProgressIndicator } from '@/features/landing/components/ScrollProgressIndicator';
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
