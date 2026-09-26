import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LandingInteractiveTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tendencias' | 'foda' | 'oportunidades' | 'sprint'>('tendencias');

  const tabs = [
    { key: 'tendencias', label: 'Tendencias' },
    { key: 'foda', label: 'Matriz FODA' },
    { key: 'oportunidades', label: 'Oportunidades RICE' },
    { key: 'sprint', label: 'Sprint Activo' },
  ] as const;

  return (
    <section id="interactive-demo" className="py-28 relative bg-zinc-100/40 dark:bg-zinc-950/70 border-t border-zinc-200/80 dark:border-white/[0.06] scroll-mt-20 transition-colors">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-mono text-orange-500 uppercase tracking-wider mb-2 font-semibold">
              Simulador en Vivo
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-950 dark:text-white tracking-tight font-display">
              Explora los componentes de BOWOL
            </h2>
          </motion.div>

          {/* Apple-style Sliding Segmented Tab Switcher with layoutId */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-200/80 dark:bg-[#12131a] border border-zinc-300/80 dark:border-white/[0.08] shadow-inner overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                    isActive ? 'text-zinc-950 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {/* Sliding pill indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTerminalTabPill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-xl bg-white dark:bg-orange-500/20 border border-zinc-200 dark:border-orange-500/40 shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab Presentation Panel with AnimatePresence */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="liquid-card rounded-3xl p-6 lg:p-8 min-h-[420px] transition-all relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'tendencias' && (
              <motion.div
                key="tab-tendencias"
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Tendencias Emergentes Validadas</h4>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">28 Señales Activas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-2.5 hover:border-orange-500/30 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">Modelos SLM Perimetrales</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">DeepTech</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Implementación de modelos compactos con inferencia local para alta privacidad y coste predictible.
                    </p>
                    <div className="pt-2 flex justify-between text-xs font-mono text-zinc-500 border-t border-zinc-200/60 dark:border-white/[0.04]">
                      <span>Señal: 82%</span>
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">Impacto: Crítico</span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-2.5 hover:border-amber-400/30 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">Arquitectura Multi-Agente</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">SaaS</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Sincronización de agentes de software en bucles de validación operativa autónoma.
                    </p>
                    <div className="pt-2 flex justify-between text-xs font-mono text-zinc-500 border-t border-zinc-200/60 dark:border-white/[0.04]">
                      <span>Señal: 68%</span>
                      <span className="text-amber-600 dark:text-amber-300 font-semibold">Impacto: Alto</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'foda' && (
              <motion.div
                key="tab-foda"
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-white/5">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Matriz Estratégica con Evidencia Cruzada</h4>
                  <span className="text-xs font-mono text-zinc-500">Actualizado hace 4 min</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">FORTALEZA IDENTIFICADA</p>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      Capacidad nativa de orquestación con baja latencia respecto al estándar de la industria.
                    </p>
                    <p className="text-[11px] font-mono text-zinc-500 pt-1">Respaldo: Benchmark interno (99.4%)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2">
                    <p className="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold">OPORTUNIDAD ESTRATÉGICA</p>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      Lanzamiento del motor SLM perimetral 3 meses antes que el principal competidor regional.
                    </p>
                    <p className="text-[11px] font-mono text-zinc-500 pt-1">Respaldo: Análisis de patentes SEC 2026</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'oportunidades' && (
              <motion.div
                key="tab-oportunidades"
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-white/5">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Embudo de Priorización RICE Automatizado</h4>
                  <span className="text-xs font-mono text-orange-500 font-semibold">Top 1 de 24 Iniciativas</span>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">Iniciativa #104: Conector Local de Auditoría</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        Generación automática de reportes SOC2 para clientes Enterprise mediante auditoría continua.
                      </p>
                    </div>
                    <span className="font-mono text-base font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20">
                      RICE: 88.5
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs font-mono text-zinc-600 dark:text-zinc-400 border-t border-zinc-200/60 dark:border-white/[0.04]">
                    <div>Alcance: <strong className="text-zinc-900 dark:text-white">3,200</strong></div>
                    <div>Impacto: <strong className="text-emerald-600 dark:text-emerald-400">3 (Alto)</strong></div>
                    <div>Certeza: <strong className="text-amber-600 dark:text-amber-400">85%</strong></div>
                    <div>Esfuerzo: <strong className="text-zinc-900 dark:text-white">1.5 Sprints</strong></div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sprint' && (
              <motion.div
                key="tab-sprint"
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-white/5">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Sprint 14: Tablero de Ejecución Ágil</h4>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">94% Completado</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 space-y-2 shadow-sm">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">En Progreso (1)</span>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">Auditoría RLS Tenant Isolation</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20 inline-block">Backend</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 space-y-2 shadow-sm">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Validación IA (1)</span>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">AI Backlog Decomposer v2</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block">Pipeline</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 space-y-2 shadow-sm">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Completado (6)</span>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">RS256 JWT Token Rotation</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 inline-block">Security</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
