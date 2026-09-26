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
    <section id="interactive-demo" className="py-28 relative bg-zinc-950/70 border-t border-white/[0.06] scroll-mt-20">
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
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-display">
              Explora los componentes de BOWOL
            </h2>
          </motion.div>

          {/* Apple-style Sliding Segmented Tab Switcher with layoutId */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#12131a] border border-white/[0.08] shadow-inner overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {/* Sliding pill indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTerminalTabPill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-xl bg-orange-500/20 border border-orange-500/40 shadow-sm"
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
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-sm font-semibold text-white">Tendencias Emergentes Validadas</h4>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">28 Señales Activas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5 hover:border-orange-500/30 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-white">Modelos SLM Perimetrales</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/20">DeepTech</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Implementación de modelos compactos con inferencia local para alta privacidad y coste predictible.
                    </p>
                    <div className="pt-2 flex justify-between text-xs font-mono text-zinc-500 border-t border-white/[0.04]">
                      <span>Señal: 82%</span>
                      <span className="text-orange-400 font-semibold">Impacto: Crítico</span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5 hover:border-amber-400/30 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-white">Arquitectura Multi-Agente</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">SaaS</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Sincronización de agentes de software en bucles de validación operativa autónoma.
                    </p>
                    <div className="pt-2 flex justify-between text-xs font-mono text-zinc-500 border-t border-white/[0.04]">
                      <span>Señal: 68%</span>
                      <span className="text-amber-300 font-semibold">Impacto: Alto</span>
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
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h4 className="text-sm font-semibold text-white">Matriz Estratégica Dinámica</h4>
                  <span className="text-xs font-mono text-zinc-500">Actualizado con datos de mercado</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all"
                  >
                    <span className="text-xs font-mono text-orange-400 font-bold uppercase">Fortalezas</span>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                      Capacidad técnica propia y arquitectura multi-tenant lista para escala enterprise con RLS.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-400/30 transition-all"
                  >
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase">Oportunidades</span>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                      Adopción temprana en cuentas corporativas que requieren control y soberanía de datos local.
                    </p>
                  </motion.div>
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
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h4 className="text-sm font-semibold text-white">Oportunidades Priorizadas (RICE)</h4>
                  <span className="text-xs font-mono text-zinc-500">24 Iniciativas Totales</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:border-orange-500/30 transition-all">
                  <div>
                    <p className="text-sm font-semibold text-white">OP-001: Autenticación Zero-Knowledge</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Alcance: 12,000 usuarios corporativos</p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20">
                    RICE 92.4
                  </span>
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
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h4 className="text-sm font-semibold text-white">Sprint 14: Validación IA & Ejecución</h4>
                  <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    94% COMPLETADO
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <span className="text-[11px] font-mono text-zinc-500">POR HACER</span>
                    <p className="text-xl font-bold text-white mt-1">2</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center">
                    <span className="text-[11px] font-mono text-orange-400 font-semibold">EN CURSO</span>
                    <p className="text-xl font-bold text-orange-300 mt-1">1</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">COMPLETADO</span>
                    <p className="text-xl font-bold text-white mt-1">11</p>
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
