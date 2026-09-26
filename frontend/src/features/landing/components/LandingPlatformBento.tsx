import React from 'react';
import { 
  TrendingUp, 
  Bot, 
  Grid2X2, 
  Target, 
  Layers, 
  Link2 
} from 'lucide-react';

export const LandingPlatformBento: React.FC = () => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section id="plataforma" className="py-28 relative scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="max-w-[680px] mb-16">
          <p className="text-xs font-mono text-orange-500 uppercase tracking-wider mb-2">
            Arquitectura Modular
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight font-display">
            Módulos especializados construidos sobre Liquid Glass.
          </h2>
          <p className="mt-4 text-zinc-400 text-base leading-relaxed">
            Cada módulo opera con autonomía y profundidad analítica, compartiendo la misma ontología de datos corporativos.
          </p>
        </div>

        {/* 12-Column Deliberate Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento 1: Large Trend Radar (8 Cols) */}
          <div
            onMouseMove={handleMouseMove}
            className="md:col-span-8 spotlight-card liquid-card p-8 rounded-3xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/20 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono text-zinc-500">MÓDULO 01</span>
              </div>
              <h3 className="text-xl font-semibold text-white mt-6 tracking-tight">
                Radar de Tendencias & Señales
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-[560px]">
                Ingesta automatizada de 28+ fuentes con filtrado por impacto sectorial, cálculo de índice de adopción y detección de inflexiones competitivas.
              </p>
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] font-mono text-zinc-500">FRECUENCIA DE CRAWL</p>
                <p className="text-lg font-semibold text-white mt-1">4 Minutos</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500">SEÑALES EVALUADAS</p>
                <p className="text-lg font-semibold text-white mt-1 tabular-nums">14,200+/mes</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500">PRECISIÓN PREDICTIVA</p>
                <p className="text-lg font-semibold text-emerald-400 mt-1 tabular-nums">91.4%</p>
              </div>
            </div>
          </div>

          {/* Bento 2: AI Strategic Assistant (4 Cols) */}
          <div
            onMouseMove={handleMouseMove}
            className="md:col-span-4 spotlight-card liquid-card p-8 rounded-3xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-white/[0.05] text-zinc-200 border border-white/10 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5 text-orange-400" />
                </span>
                <span className="text-xs font-mono text-zinc-500">MÓDULO 02</span>
              </div>
              <h3 className="text-xl font-semibold text-white mt-6 tracking-tight">
                Investigador IA con Citas
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Asistente conversacional de alta fidelidad que discrimina datos duros de hipótesis no comprobadas.
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-xl bg-zinc-900/80 border border-white/5 text-xs text-zinc-300 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="truncate">Trazabilidad completa con enlaces a papers y commits</span>
            </div>
          </div>

          {/* Bento 3: Dynamic SWOT (4 Cols) */}
          <div
            onMouseMove={handleMouseMove}
            className="md:col-span-4 spotlight-card liquid-card p-8 rounded-3xl group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-white/[0.05] text-zinc-200 border border-white/10 group-hover:scale-105 transition-transform">
                <Grid2X2 className="w-5 h-5 text-amber-300" />
              </span>
              <span className="text-xs font-mono text-zinc-500">MÓDULO 03</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-6 tracking-tight">
              FODA Continuo
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Cuadrantes que se reordenan automáticamente cuando un competidor lanza un feature o cambia el panorama regulatorio.
            </p>
          </div>

          {/* Bento 4: RICE Opportunities (4 Cols) */}
          <div
            onMouseMove={handleMouseMove}
            className="md:col-span-4 spotlight-card liquid-card p-8 rounded-3xl group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-white/[0.05] text-zinc-200 border border-white/10 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5 text-orange-400" />
              </span>
              <span className="text-xs font-mono text-zinc-500">MÓDULO 04</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-6 tracking-tight">
              Scoring RICE
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Priorización matemática transparente (Reach, Impact, Confidence, Effort) para neutralizar sesgos ejecutivos.
            </p>
          </div>

          {/* Bento 5: Agile Sprints (4 Cols) */}
          <div
            onMouseMove={handleMouseMove}
            className="md:col-span-4 spotlight-card liquid-card p-8 rounded-3xl group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-white/[0.05] text-zinc-200 border border-white/10 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-emerald-400" />
              </span>
              <span className="text-xs font-mono text-zinc-500">MÓDULO 05</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-6 tracking-tight">
              Sprints y Tareas
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Orquestación ágil vinculada directamente a las hipótesis fundacionales de cada iniciativa de negocio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
