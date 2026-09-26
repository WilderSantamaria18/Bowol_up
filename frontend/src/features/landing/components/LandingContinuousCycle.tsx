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
      className="py-28 relative bg-zinc-950/40 border-y border-white/[0.06] scroll-mt-20"
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
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-display">
                Un ciclo continuo cerrado, no una colección de herramientas.
              </h2>
              <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
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
                        ? 'bg-white/[0.06] border-orange-500/40 shadow-lg shadow-orange-500/10'
                        : 'bg-transparent border-white/[0.06] hover:bg-white/[0.02] opacity-60 hover:opacity-100'
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
                            ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400 scale-105'
                            : 'bg-white/[0.05] border border-white/10 text-zinc-400'
                        }`}
                      >
                        {step.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{step.summary}</p>
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
                    <span className="text-xs font-mono text-orange-400 tracking-wider font-semibold bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20">
                      {current.badge}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      FASE 0{activeStep + 1} DE 04
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mt-4 tracking-tight font-display">
                    {current.fullTitle}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    {current.description}
                  </p>

                  {/* Step Specific Visual Content */}
                  {activeStep === 0 && (
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/20 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-white">Modelos SLM Perimetrales</p>
                          <p className="text-xs text-zinc-500">Inferencia local optimizada en arquitecturas edge</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-400">82% Adopción</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">Crítico</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/20 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-white">Orquestación de Agentes Autónomos</p>
                          <p className="text-xs text-zinc-500">Loops recursivos de ejecución multi-tenant</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-400">68% Adopción</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-800 text-zinc-300">Alto</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-zinc-500/20 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-white">Ledgers Distribuidos v3</p>
                          <p className="text-xs text-zinc-500">Liquidación en milisegundos para enterprise billing</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-400">44% Adopción</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-800 text-zinc-400">Moderado</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="p-4 rounded-xl bg-orange-500/[0.06] border border-orange-500/20 hover:scale-[1.01] transition-transform">
                        <span className="text-xs font-semibold text-orange-400 uppercase font-mono">01. Fortalezas (06)</span>
                        <p className="text-xs text-zinc-300 mt-2 leading-relaxed">Infraestructura analítica propietaria con baja latencia en procesamiento.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:scale-[1.01] transition-transform">
                        <span className="text-xs font-semibold text-amber-300 uppercase font-mono">02. Oportunidades (08)</span>
                        <p className="text-xs text-zinc-300 mt-2 leading-relaxed">Demanda insatisfecha en cuentas enterprise de banca y finanzas.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:scale-[1.01] transition-transform">
                        <span className="text-xs font-semibold text-zinc-400 uppercase font-mono">03. Debilidades (03)</span>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">Fricción inicial de integración con sistemas legados.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/[0.06] border border-red-500/20 hover:scale-[1.01] transition-transform">
                        <span className="text-xs font-semibold text-red-400 uppercase font-mono">04. Amenazas (04)</span>
                        <p className="text-xs text-zinc-300 mt-2 leading-relaxed">Saturación de ofertas comoditizadas por competidores tier-1.</p>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-3 mt-6">
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-zinc-500">OP-104</span>
                          <div>
                            <p className="text-xs font-semibold text-white">Módulo de Autenticación Biométrica Enterprise</p>
                            <p className="text-[11px] text-zinc-500">Objetivo: Reducción de abandono en onboarding (-35%)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-orange-500/15 text-orange-400 border border-orange-500/30">RICE 88.2</span>
                          <span className="text-xs text-zinc-400 font-mono">Sprint 15</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-zinc-500">OP-105</span>
                          <div>
                            <p className="text-xs font-semibold text-white">Pricing Dinámico por Consumo de Tokens</p>
                            <p className="text-[11px] text-zinc-500">Objetivo: Expansión de margen en clientes tier-1 (+18%)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300">RICE 74.0</span>
                          <span className="text-xs text-zinc-400 font-mono">Sprint 15</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 mt-6">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-white">Sprint 14 • Retrospectiva Estratégica</span>
                        <span className="text-xs text-emerald-400 font-mono font-semibold">+18.4% Retención Lograda</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '94%' }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className="h-full bg-orange-500 rounded-full"
                        />
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        "La hipótesis sobre onboarding contextual redujo drásticamente el churn. La evidencia se indexó en el repositorio central de BOWOL para calibrar futuras iniciativas."
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
