import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';

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
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInView(sectionRef, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const [hasFocus, setHasFocus] = useState(false);

  const steps: CycleStep[] = [
    {
      number: '01',
      title: 'Objetivo & Contexto del Negocio',
      summary: 'Define lo que quieres lograr: ventas, nuevo servicio, operaciones o marketing.',
      badge: 'PUNTO DE PARTIDA',
      fullTitle: '01. Define el Objetivo o Proyecto',
      description: 'Ingresa en lenguaje simple lo que tu negocio necesita lograr y tu contexto operativo (equipo disponible, fechas y metas).',
    },
    {
      number: '02',
      title: 'Desglose Automático con IA',
      summary: 'Bowol genera las actividades necesarias, duraciones sugeridas y orden lógico.',
      badge: 'AUTOMATIZACIÓN CON IA',
      fullTitle: '02. Generación Inteligente del Plan de Actividades',
      description: 'La IA analiza tu meta y desglosa paso a paso cada actividad requerida, con tiempos realistas para no saturar al equipo.',
    },
    {
      number: '03',
      title: 'Tablero Ágil & Asignación',
      summary: 'Distribuye las actividades al equipo con fechas límite y seguimiento diario.',
      badge: 'ORGANIZACIÓN VISUAL',
      fullTitle: '03. Tablero Kanban y Calendario Sincronizado',
      description: 'Todas las tareas pasan a columnas de acción inmediata (Por Hacer, En Progreso, Completado) con responsables y alertas.',
    },
    {
      number: '04',
      title: 'Seguimiento & Cierre de Metas',
      summary: 'Mide el avance en tiempo real y reprograma pendientes con un solo clic.',
      badge: 'RESULTADOS MEDIBLES',
      fullTitle: '04. Avance del Negocio & Ajustes Automáticos',
      description: 'Cierra la semana sabiendo exactamente qué se logró, qué tareas faltaron y qué ajustar para el siguiente ciclo.',
    },
  ];

  // Auto-advance timer (5.5s per step, pauses when hovering)
  useEffect(() => {
    if (isPaused || hasFocus || !visible || reducedMotion) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, hasFocus, visible, reducedMotion, steps.length, activeStep]);

  const current = steps[activeStep];

  return (
    <section
      ref={sectionRef}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHasFocus(false);
      }}
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
                Flujo Automatizado BOWOL
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-950 dark:text-white tracking-tight font-display">
                Un sistema claro que convierte metas en tareas diarias que sí se cumplen.
              </h2>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Cada paso está conectado. De un objetivo de negocio al desglose con IA, el tablero del equipo y la medición del avance semanal sin hojas de cálculo.
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
                      PASO 0{activeStep + 1} DE 04
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
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Campaña de Ventas de Fin de Mes</p>
                          <p className="text-xs text-zinc-500">Objetivo comercial • Meta: Incrementar facturación en 25%</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">Equipo: 3 personas</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">Alta Prioridad</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 hover:border-amber-400/30 transition-colors shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Lanzamiento de Nuevo Menú / Catálogo</p>
                          <p className="text-xs text-zinc-500">Operaciones y diseño • Plazo sugerido: 2 semanas</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">Equipo: 4 personas</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">En Curso</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 hover:border-zinc-400/30 transition-colors shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Control de Stock y Proveedores Clave</p>
                          <p className="text-xs text-zinc-500">Plan operativo recurrente semanal</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">Equipo: 2 personas</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">Recurrente</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="space-y-3 mt-6">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-white">1. Definir fotos y precios especiales</span>
                          <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">Día 1-2 • Marketing</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Selección de 15 productos destacados con descuento y piezas gráficas listas.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-white">2. Programar publicaciones y mensajes a clientes</span>
                          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Día 3-5 • Ventas</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Secuencia de 3 mensajes vía WhatsApp y publicaciones en redes con enlace de compra.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-white">3. Empaque, logística y entrega de pedidos</span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Día 6-7 • Operaciones</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Coordinación con repartidores y confirmación de recepción con cada cliente.</p>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-3 mt-6">
                      <div className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-2 shadow-sm">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Diseño de Banners Promocionales</p>
                          <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                            Prioridad: 92%
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          Responsable: Diseñador • Fecha Límite: Miércoles 18:00 • En Progreso (2 de 3 artes)
                        </p>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full w-[70%]" />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 space-y-2 shadow-sm">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Contacto y Seguimiento a Clientes Frecuentes</p>
                          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Prioridad: 88%
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          Responsable: Ventas • Fecha Límite: Jueves 15:00 • Por Iniciar (Lista preparada)
                        </p>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full w-[40%]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <h4 className="text-base font-semibold text-zinc-900 dark:text-white">Plan Semanal Cumplido con Éxito</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                        18 de 20 actividades completadas a tiempo (90% de efectividad). Las 2 tareas pendientes se reprogramaron automáticamente para el lunes siguiente sin perder el orden del negocio.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Bottom Step Indicator Bar */}
              <div className="pt-6 border-t border-zinc-200/80 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>BOWOL • Sistema Inteligente de Planificación</span>
                <span className="text-orange-600 dark:text-orange-400">Pausado en hover</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
