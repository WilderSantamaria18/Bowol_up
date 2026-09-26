import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Grid2X2, 
  Target, 
  CheckSquare, 
  Activity
} from 'lucide-react';

export const LandingInteractiveTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tendencias' | 'foda' | 'oportunidades' | 'sprint'>('tendencias');

  const tabs = [
    { key: 'tendencias', label: 'Radar de Señales', icon: TrendingUp },
    { key: 'foda', label: 'Matriz FODA', icon: Grid2X2 },
    { key: 'oportunidades', label: 'Scoring RICE', icon: Target },
    { key: 'sprint', label: 'Sprint Activo', icon: CheckSquare },
  ] as const;

  return (
    <section id="interactive-demo" className="py-24 relative bg-zinc-100/50 dark:bg-zinc-950/70 border-t border-zinc-200/80 dark:border-white/[0.06] scroll-mt-20 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <p className="text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2 font-semibold">
              Entorno de Operación
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight font-display">
              Consola de Orquestación Estratégica
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              De la señal cruda a la entrega de código: observa cómo transita una oportunidad estratégica en cada fase del sistema.
            </p>
          </motion.div>

          {/* Segmented Tab Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-200/80 dark:bg-[#12131a] border border-zinc-300/80 dark:border-white/[0.08] shadow-inner overflow-x-auto self-start md:self-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                    isActive
                      ? 'text-zinc-950 dark:text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTerminalTabPill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-xl bg-white dark:bg-[#1f2029] border border-zinc-200 dark:border-orange-500/30 shadow-sm"
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab Presentation Panel */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="liquid-card rounded-3xl p-5 sm:p-7 lg:p-8 min-h-[420px] transition-all relative overflow-hidden bg-white/95 dark:bg-[#121318]/95 border border-zinc-200/90 dark:border-white/10 shadow-xl dark:shadow-2xl backdrop-blur-2xl"
        >
          {/* Terminal Console Chrome Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200/80 dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="ml-3 hidden sm:inline-block text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                bowol-core :: strategy-pipeline / live
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-700 dark:text-zinc-300 font-semibold">ONLINE</span>
              <span className="text-zinc-400 dark:text-zinc-600">|</span>
              <span className="text-zinc-500 dark:text-zinc-400">LATENCIA: 18ms</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 1. Radar de Señales */}
            {activeTab === 'tendencias' && (
              <motion.div
                key="tab-tendencias"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                      Señales Tecnológicas Indexadas
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    28 fuentes verificadas activas
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-3 hover:border-orange-500/40 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-orange-600 dark:text-orange-400 font-semibold uppercase">
                            DeepTech • arXiv:2403.11892
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white mt-1">
                          Modelos SLM Perimetrales
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0">
                        82% Adopción
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      Inferencia local en hardware NPU sin depender de conectividad constante, garantizando privacidad de datos corporativos y coste nulo por token externo.
                    </p>

                    <div className="pt-3 border-t border-zinc-200/60 dark:border-white/[0.04] flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      <span>Impacto: <strong className="text-zinc-900 dark:text-zinc-200 font-semibold">Crítico (+38% eficiencia)</strong></span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Validado en 14 papers</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-3 hover:border-amber-500/40 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold uppercase">
                            Arquitectura • GitHub Tier-1
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white mt-1">
                          Orquestación Multi-Agente Autónoma
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                        68% Adopción
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      Desacoplamiento de tareas entre agentes de formulación estratégica y agentes de ejecución de código para sincronización continua sin reuniones intermedias.
                    </p>

                    <div className="pt-3 border-t border-zinc-200/60 dark:border-white/[0.04] flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      <span>Impacto: <strong className="text-zinc-900 dark:text-zinc-200 font-semibold">Alto (-45% tiempo ciclo)</strong></span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">42 repositorios corporativos</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Matriz FODA */}
            {activeTab === 'foda' && (
              <motion.div
                key="tab-foda"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Grid2X2 className="w-4 h-4 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                      Matriz Estratégica con Evidencias Cruzadas
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    Sincronización continua
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fortaleza */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 uppercase">
                        Fortaleza Interna
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Benchmark 99.4%</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      Pipeline automatizado de ingesta continua con latencia inferior a 120ms y trazabilidad criptográfica.
                    </p>
                  </div>

                  {/* Oportunidad */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                        Oportunidad de Mercado
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Ventana Q3 2026</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      Despliegue comercial de modelos SLM perimetrales antes de que se comoditice la oferta regional.
                    </p>
                  </div>

                  {/* Debilidad */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                        Debilidad a Mitigar
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Curva de Adopción</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      Fricción inicial en equipos sin cultura de medición cuantitativa RICE previa al desarrollo.
                    </p>
                  </div>

                  {/* Amenaza */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase">
                        Amenaza Competitiva
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Saturación Genérica</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      Proliferación de wrappers superficiales que erosionan la confianza directiva en soluciones empíricas.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Scoring RICE */}
            {activeTab === 'oportunidades' && (
              <motion.div
                key="tab-oportunidades"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                      Priorización Matemática de Iniciativas
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    Iniciativa #104 • Top Prioridad
                  </span>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                        Conector Local de Auditoría y Compliance SOC2
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Generación automática de registros inmutables y trazabilidad criptográfica para clientes corporativos.
                      </p>
                    </div>
                    <div className="text-right self-start sm:self-auto shrink-0">
                      <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 font-mono">
                        88.5 <span className="text-xs text-zinc-500 font-sans">/ 100</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">Score RICE</span>
                    </div>
                  </div>

                  {/* RICE Breakdown Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-zinc-200/60 dark:border-white/[0.04] text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04]">
                      <span className="text-zinc-500 block text-[10.5px]">ALCANCE (R)</span>
                      <strong className="text-zinc-950 dark:text-white text-sm block mt-1">3,200 usuarios</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04]">
                      <span className="text-zinc-500 block text-[10.5px]">IMPACTO (I)</span>
                      <strong className="text-orange-600 dark:text-orange-400 text-sm block mt-1">3.0 (Estratégico)</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04]">
                      <span className="text-zinc-500 block text-[10.5px]">CONFIANZA (C)</span>
                      <strong className="text-amber-600 dark:text-amber-400 text-sm block mt-1">85% (Validada)</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04]">
                      <span className="text-zinc-500 block text-[10.5px]">ESFUERZO (E)</span>
                      <strong className="text-zinc-950 dark:text-white text-sm block mt-1">1.5 Sprints</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. Sprint Activo */}
            {activeTab === 'sprint' && (
              <motion.div
                key="tab-sprint"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                      Sprint 14: Tablero de Ejecución Ágil
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    94% Completado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Col 1 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2.5">
                    <span className="text-[10.5px] font-mono text-zinc-500 uppercase tracking-wider font-semibold block">
                      Backlog Priorizado (1)
                    </span>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#181920] border border-zinc-200/60 dark:border-white/[0.06] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-zinc-500">BOW-142</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400">3 Pts</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        Rotación de Llaves RS256
                      </p>
                      <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 block">
                        Seguridad & Compliance
                      </span>
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2.5">
                    <span className="text-[10.5px] font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider font-semibold block">
                      En Desarrollo (1)
                    </span>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#181920] border border-orange-500/30 dark:border-orange-500/30 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400">BOW-145</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">5 Pts</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        Descompositor Algorítmico de Epics
                      </p>
                      <div className="w-full bg-zinc-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-orange-500 h-full w-3/4 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Col 3 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2.5">
                    <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold block">
                      Validado / Producción (6)
                    </span>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#181920] border border-zinc-200/60 dark:border-white/[0.06] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">BOW-139</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">5 Pts</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        Ingesta Multi-Fuente arXiv & SEC
                      </p>
                      <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 block font-medium">
                        100% tests pasados
                      </span>
                    </div>
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
