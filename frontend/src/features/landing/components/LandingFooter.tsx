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
              Plataforma corporativa de inteligencia de tendencias y orquestación estratégica. Diseñada bajo la filosofía Liquid Glass.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <ThemeToggle size="sm" />
              <p className="text-[11px] font-mono text-zinc-500">
                © {new Date().getFullYear()} BOWOL Inc. Todos los derechos reservados.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono uppercase text-zinc-900 dark:text-zinc-300 font-semibold tracking-wider">
              Plataforma
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><a href="#ciclo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Radar de Tendencias</a></li>
              <li><a href="#ciclo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Síntesis FODA</a></li>
              <li><a href="#ciclo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Scoring RICE</a></li>
              <li><a href="#ciclo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Orquestador de Sprints</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono uppercase text-zinc-900 dark:text-zinc-300 font-semibold tracking-wider">
              Seguridad & Cumplimiento
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors">Certificación SOC2 Tipo II</span></li>
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors">Cifrado TLS 1.3 End-to-End</span></li>
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors">Alineación GDPR & Privacidad</span></li>
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors">Aislamiento Multi-Tenant RLS</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono uppercase text-zinc-900 dark:text-zinc-300 font-semibold tracking-wider">
              Corporativo
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><a href="#problema" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Acerca de BOWOL</a></li>
              <li><a href="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Acceso Clientes</a></li>
              <li><a href="#solicitar" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contacto Enterprise</a></li>
              <li><span className="text-emerald-500 dark:text-emerald-400 text-[11px] font-mono">● Sistemas Operativos</span></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
};
