import React from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#0A0A0C] py-16 transition-colors">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="md" asLink to="/" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[320px] leading-relaxed">
              Plataforma inteligente de planificación de actividades y automatización de tareas para emprendimientos y empresas en crecimiento.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <ThemeToggle size="sm" />
              <p className="text-[11px] font-mono text-zinc-500">
                © {new Date().getFullYear()} BOWOL. Todos los derechos reservados.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono uppercase text-zinc-900 dark:text-zinc-300 font-semibold tracking-wider">
              Plataforma
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><a href="#ciclo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Planificador con IA</a></li>
              <li><a href="#interactive-demo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Diagnóstico FODA</a></li>
              <li><a href="#interactive-demo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Priorización RICE</a></li>
              <li><a href="#ciclo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Tablero Kanban & Sprints</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono uppercase text-zinc-900 dark:text-zinc-300 font-semibold tracking-wider">
              Herramientas
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><a href="#plataforma" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Copilot Estratégico</a></li>
              <li><a href="#plataforma" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Integración Google Calendar</a></li>
              <li><a href="#plataforma" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Recordatorios por WhatsApp</a></li>
              <li><a href="#metricas" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Métricas de Cumplimiento</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono uppercase text-zinc-900 dark:text-zinc-300 font-semibold tracking-wider">
              Acceso
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><a href="#problema" className="hover:text-zinc-900 dark:hover:text-white transition-colors">¿Por qué Bowol?</a></li>
              <li><a href="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Iniciar Sesión</a></li>
              <li><a href="#solicitar" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Probar Gratis</a></li>
              <li><span className="text-emerald-500 dark:text-emerald-400 text-[11px] font-mono">● Sistema 100% Operativo</span></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
};
