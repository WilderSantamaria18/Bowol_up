import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CycleStep {
  number: string;
  title: string;
  summary: string;
  badge: string;
  fullTitle: string;
  description: string;
}

export const LandingContinuousCycle: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const steps: CycleStep[] = [
    {
      number: '01',
      title: 'Inteligencia y Detección Temprana',
      summary: 'Detección de señales débiles y patrones en fuentes científicas, código y mercado.',
      badge: 'ACTUALIZADO EN TIEMPO REAL',
      fullTitle: 'Inteligencia: Detección y Radar de Tendencias',
      description: 'Supervisión automatizada de 28+ fuentes que transforman cambios globales en señales prioritarias para tu estrategia.',
    },
    {
      number: '02',
      title: 'Estrategia Dinámica y FODA',
      summary: 'Mapeo automático a fortalezas y vulnerabilidades internas de tu organización.',
      badge: 'CONEXIÓN AUTOMÁTICA',
      fullTitle: 'Estrategia: Síntesis FODA Viva',
      description: 'Cada señal detectada se categoriza en los cuatro cuadrantes estratégicos de tu organización con evidencia verificable.',
    },
    {
      number: '03',
      title: 'Priorización RICE y Ejecución',
      summary: 'Conversión instantánea en hipótesis de negocio, asignaciones y sprints ágiles.',
      badge: 'DESPLIEGUE ÁGIL',
      fullTitle: 'Ejecución: Priorización RICE & Sprints',
      description: 'De la matriz al backlog sin ambigüedad. Puntuación objetiva con estimación de esfuerzo y confianza.',
    },
    {
      number: '04',
      title: 'Medición y Aprendizaje Cerrado',
      summary: 'Los hallazgos empíricos calibran el modelo predictivo corporativo.',
      badge: 'FEEDBACK CONTINUO',
      fullTitle: 'Aprendizaje: Cierre del Ciclo',
      description: 'Los resultados reales de las hipótesis alimentan nuevamente los algoritmos de predicción corporativos.',
    },
  ];

  // Auto-advance timer (5.5s per step, pauses when hovering)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, steps.length, activeStep]);

  const current = steps[activeStep];

  return (
    <section
      id="ciclo"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="py-28 relative bg-zinc-100/50 dark:bg-zinc-950/40 border-y border-zinc-200/80 dark:border-white/[0.06] scroll-mt-20 transition-colors"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Cycle Steps Navigator */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-xs font-mono text-orange-500 uppercase tracking-wider mb-2 font-semibold">
                Metodología BOWOL
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-950 dark:text-white tracking-tight font-display">
                Un ciclo continuo cerrado, no una colección de herramientas.
              </h2>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Cada fase está conectada nativamente con la siguiente. El aprendizaje de los sprints vuelve automáticamente al radar de mercado.
              </p>
            </motion.div>

            {/* Stepper with Progress Bar per Item */}
            <div className="space-y-3 pt-3">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={step.number}
                    onClick={() => setActiveStep(idx)}
                    className={`relative overflow-hidden p-5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-white/[0.08] border-orange-500/50 shadow-md shadow-orange-500/10'
                        : 'bg-white/60 dark:bg-transparent border-zinc-200/80 dark:border-white/[0.06] hover:bg-white dark:hover:bg-white/[0.02] opacity-75 hover:opacity-100'
                    }`}
                  >
                    {/* Animated Progress Timer Line for the Active Step */}
                    {isActive && (
                      <motion.div
                        key={`bar-${idx}-${activeStep}`}
                        initial={{ width: '0%' }}
                        animate={{ width: isPaused ? '100%' : '100%' }}
                        transition={{ duration: 5.5, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-400"
                      />
                    )}

                    <div className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-orange-500/20 border border-orange-500/40 text-orange-600 dark:text-orange-400 scale-105'
                            : 'bg-zinc-200/60 dark:bg-white/[0.05] border border-zinc-300/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {step.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{step.title}</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{step.summary}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Step Visualizer with AnimatePresence */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-card rounded-3xl p-6 lg:p-8 min-h-[460px] flex flex-col justify-between relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="w-full"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-orange-600 dark:text-orange-400 tracking-wider font-semibold bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20">
                      {current.badge}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      FASE 0{activeStep + 1} DE 04
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-4 tracking-tight font-display">
                    {current.fullTitle}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    {current.description}
                  </p>

                  {/* Step Specific Visual Content */}
                  {activeStep === 0 && (
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 hover:border-orange-500/30 transition-colors shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Modelos SLM Perimetrales</p>
                          <p className="text-xs text-zinc-500">Inferencia local optimizada en arquitecturas edge</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">82% Adopción</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">Crítico</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 hover:border-amber-400/30 transition-colors shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Orquestación de Agentes Autónomos</p>
                          <p className="text-xs text-zinc-500">Loops recursivos de ejecución multi-tenant</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">68% Adopción</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">Alto</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 hover:border-zinc-400/30 transition-colors shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Ledgers Distribuidos v3</p>
                          <p className="text-xs text-zinc-500">Liquidación en milisegundos para enterprise billing</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">45% Adopción</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">Medio</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">FORTALEZAS INTERNAS</p>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 font-medium">Arquitectura modular lista para orquestación de agentes con 99.9% uptime.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <p className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold">DEBILIDADES / GAPS</p>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 font-medium">Latencia en conectores externos de ingesta masiva (resuelto en Sprint 15).</p>
                      </div>
                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <p className="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold">OPORTUNIDADES DE MERCADO</p>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 font-medium">Ventana de 4 meses para capturar segmento fintech con SLM perimetral.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">AMENAZAS COMPETITIVAS</p>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 font-medium">Entrada de competidores consolidados con presupuestos de cloud masivos.</p>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-3 mt-6">
                      <div className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-2 shadow-sm">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Implementación Inferencia Local SLM</p>
                          <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                            Score RICE: 84.2
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          Reach: 4,500 • Impact: 3 (Masivo) • Confidence: 80% • Effort: 2 Sprints
                        </p>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full w-[84%]" />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-2 shadow-sm">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Conector de Auditoría SOC2 para CI/CD</p>
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Score RICE: 72.0
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          Reach: 2,100 • Impact: 2 (Alto) • Confidence: 90% • Effort: 1 Sprint
                        </p>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full w-[72%]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 mt-6 text-center space-y-3 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto font-bold text-sm">
                        ✓
                      </div>
                      <h4 className="text-base font-semibold text-zinc-900 dark:text-white">Loop Retroalimentado con Éxito</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                        Los datos de retención del Sprint 14 se integraron al motor probabilístico. La probabilidad de adopción para la iniciativa SLM se ajustó de 74% a 88.4%.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Bottom Step Indicator Bar */}
              <div className="pt-6 border-t border-zinc-200/80 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>BOWOL Continuous Strategic Execution Engine</span>
                <span className="text-orange-600 dark:text-orange-400">Pausado en hover</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
