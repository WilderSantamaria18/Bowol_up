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
            Sistema Integral BOWOL
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold text-zinc-950 dark:text-white tracking-tight font-display">
            Herramientas para ordenar y acelerar tu negocio.
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            Diseñado para que cualquier emprendimiento o pequeña empresa tenga su propio sistema de trabajo ágil, visual y automático.
          </p>
        </motion.div>

        {/* 12-Column Deliberate Bento Grid with Cascading Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento 1: Large AI Planner (8 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            onMouseMove={handleMouseMove}
            className="md:col-span-8 spotlight-card liquid-card p-8 rounded-3xl flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Animated Sonar Ring in the corner */}
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
                Planificador Inteligente de Actividades (AI Planner)
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[560px]">
                Transforma cualquier meta, campaña de ventas o proyecto en un plan de actividades listo para ejecutar con duraciones estimadas, dependencias lógicas y asignación de responsables.
              </p>
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.05] grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] font-mono text-zinc-500">TIEMPO DE GENERACIÓN</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">3 Segundos</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500">ACTIVIDADES SUGERIDAS</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1 tabular-nums">
                  <AnimatedCounter to={12500} duration={2.2} suffix="+" />
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500">AHORRO EN PLANIFICACIÓN</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                  <AnimatedCounter to={85} duration={2.0} suffix="%" />
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bento 2: AI Business Copilot (4 Cols) */}
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
                Copilot IA de Planificación
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Asistente inteligente disponible 24/7 para resolver dudas de ejecución, sugerir mejoras operativas y equilibrar las tareas de tu equipo.
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/5 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2 shadow-inner">
              <Link2 className="w-4 h-4 text-orange-500 dark:text-orange-400 shrink-0" />
              <span className="truncate">Respuestas ajustadas al rubro de tu negocio</span>
            </div>
          </motion.div>

          {/* Bento 3: Business Diagnosis (4 Cols) */}
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
              Perfil & Diagnóstico del Negocio
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Mapea tus fortalezas y oportunidades clave para enfocar tu tiempo y recursos en las actividades que más aportan a tus clientes.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 100% Adaptado a PYMES
            </div>
          </motion.div>

          {/* Bento 4: Priority Engine (4 Cols) */}
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
              Priorización de Alto Retorno
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Clasificación automática que diferencia lo urgente de lo que realmente genera ventas e impacto, evitando la dispersión diaria.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Enfoque en Impacto Real
            </div>
          </motion.div>

          {/* Bento 5: Kanban & Sprints (4 Cols) */}
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
              Tablero Kanban & Sprints Semanales
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Organiza a tu equipo con tableros visuales claros, fechas límites de entrega y seguimiento de metas por semana sin reuniones innecesarias.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Calendario Integrado
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
