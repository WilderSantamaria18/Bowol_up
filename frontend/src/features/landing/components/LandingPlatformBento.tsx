import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Bot, 
  Grid2X2, 
  Target, 
  Layers, 
  Link2,
  Radio
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[680px] mb-16"
        >
          <p className="text-xs font-mono text-orange-500 uppercase tracking-wider mb-2 font-semibold">
            Arquitectura Modular
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold text-zinc-950 dark:text-white tracking-tight font-display">
            Módulos especializados construidos sobre Liquid Glass.
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            Cada módulo opera con autonomía y profundidad analítica, compartiendo la misma ontología de datos corporativos.
          </p>
        </motion.div>

        {/* 12-Column Deliberate Bento Grid with Cascading Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento 1: Large Trend Radar (8 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            onMouseMove={handleMouseMove}
            className="md:col-span-8 spotlight-card liquid-card p-8 rounded-3xl flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Radar Sweep Animated Sonar Ring in the corner */}
            <div className="absolute top-6 right-6 w-20 h-20 pointer-events-none flex items-center justify-center opacity-60">
              <span className="absolute w-6 h-6 rounded-full bg-orange-500/30 sonar-ring" />
              <span className="absolute w-12 h-12 rounded-full border border-orange-500/20 sonar-ring" style={{ animationDelay: '1s' }} />
              <Radio className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono text-zinc-500 mr-10 sm:mr-0">MÓDULO 01</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
                Radar de Tendencias & Señales
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[560px]">
                Ingesta automatizada de 28+ fuentes con filtrado por impacto sectorial, cálculo de índice de adopción y detección de inflexiones competitivas.
              </p>
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.05] grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] font-mono text-zinc-500">FRECUENCIA DE CRAWL</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">4 Minutos</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500">SEÑALES EVALUADAS</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1 tabular-nums">
                  <AnimatedCounter to={14200} duration={2.2} suffix="+/mes" />
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500">PRECISIÓN PREDICTIVA</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                  <AnimatedCounter to={91.4} decimals={1} duration={2.0} suffix="%" />
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bento 2: AI Strategic Assistant (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            onMouseMove={handleMouseMove}
            className="md:col-span-4 spotlight-card liquid-card p-8 rounded-3xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-orange-500/10 dark:bg-white/[0.05] text-orange-600 dark:text-zinc-200 border border-orange-500/20 dark:border-white/10 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                </span>
                <span className="text-xs font-mono text-zinc-500">MÓDULO 02</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
                Investigador IA con Citas
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Asistente conversacional de alta fidelidad que discrimina datos duros de hipótesis no comprobadas.
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/5 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2 shadow-inner">
              <Link2 className="w-4 h-4 text-orange-500 dark:text-orange-400 shrink-0" />
              <span className="truncate">Trazabilidad completa con enlaces a papers y commits</span>
            </div>
          </motion.div>

          {/* Bento 3: Dynamic SWOT (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            onMouseMove={handleMouseMove}
            className="md:col-span-4 spotlight-card liquid-card p-8 rounded-3xl group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-orange-500/10 dark:bg-white/[0.05] text-orange-600 dark:text-zinc-200 border border-orange-500/20 dark:border-white/10 group-hover:scale-105 transition-transform">
                <Grid2X2 className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </span>
              <span className="text-xs font-mono text-zinc-500">MÓDULO 03</span>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
              FODA con Evidencia Viva
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Matriz auto-actualizable donde cada elemento cuenta con un índice de confianza y respaldo documental trazable.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 100% Verificable
            </div>
          </motion.div>

          {/* Bento 4: RICE Prioritization Engine (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            onMouseMove={handleMouseMove}
            className="md:col-span-4 spotlight-card liquid-card p-8 rounded-3xl group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-orange-500/10 dark:bg-white/[0.05] text-orange-600 dark:text-zinc-200 border border-orange-500/20 dark:border-white/10 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </span>
              <span className="text-xs font-mono text-zinc-500">MÓDULO 04</span>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
              Motor de Scoring RICE
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Algoritmo de clasificación matemática que pondera alcance, impacto, certeza y esfuerzo para eliminar sesgos.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Algoritmo Decisional
            </div>
          </motion.div>

          {/* Bento 5: Agile Sprint Orchestrator (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            onMouseMove={handleMouseMove}
            className="md:col-span-4 spotlight-card liquid-card p-8 rounded-3xl group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-orange-500/10 dark:bg-white/[0.05] text-orange-600 dark:text-zinc-200 border border-orange-500/20 dark:border-white/10 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </span>
              <span className="text-xs font-mono text-zinc-500">MÓDULO 05</span>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
              AI Backlog Decomposer
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Traducción directa de iniciativas estratégicas a tareas técnicas detalladas con criterios de aceptación para Kanban.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Exportación RFC 5545
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
