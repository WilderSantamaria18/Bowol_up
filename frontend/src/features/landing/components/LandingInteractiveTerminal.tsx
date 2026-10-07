import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Grid2X2, 
  Target, 
  CheckSquare, 
  Clock,
  User,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const LandingInteractiveTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'planificador' | 'foda' | 'prioridades' | 'tablero'>('planificador');

  const tabs = [
    { key: 'planificador', label: 'Planificador IA', icon: Sparkles },
    { key: 'foda', label: 'Diagnóstico FODA', icon: Grid2X2 },
    { key: 'prioridades', label: 'Priorización RICE', icon: Target },
    { key: 'tablero', label: 'Tablero Semanal', icon: CheckSquare },
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
              Simulador en Vivo
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight font-display">
              Consola de Planificación Activa
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              De una meta comercial a la ejecución del día a día: observa cómo Bowol estructura, prioriza y automatiza las tareas de tu negocio.
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
                bowol-core :: planificador-pyme / activo
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-700 dark:text-zinc-300 font-semibold">MOTOR IA ONLINE</span>
              <span className="text-zinc-400 dark:text-zinc-600">|</span>
              <span className="text-zinc-500 dark:text-zinc-400">RESPUESTA: 2.1s</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 1. Planificador IA */}
            {activeTab === 'planificador' && (
              <motion.div
                key="tab-planificador"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Meta ingresada */}
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500 text-white shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 uppercase">
                        Meta Ingresada por el Negocio
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                        &quot;Lanzar campaña de ofertas de fin de mes y activar ventas por WhatsApp&quot;
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-orange-500/30 text-orange-600 dark:text-orange-400 shrink-0 self-start sm:self-auto">
                    4 Tareas Generadas en 2.4s
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {/* Tarea 1 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2 hover:border-orange-500/40 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10.5px] font-mono text-orange-600 dark:text-orange-400 font-bold uppercase">
                        Marketing • Prioridad Alta
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        En curso
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Diseñar catálogo digital y creativos para historias
                    </h5>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-1">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 4 horas</span>
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Diseñador / Encargado</span>
                    </div>
                  </div>

                  {/* Tarea 2 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2 hover:border-orange-500/40 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                        Ventas • Prioridad Alta
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
                        Por iniciar
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Redactar guion de respuesta rápida y links de cobro para WhatsApp
                    </h5>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-1">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2 horas</span>
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Atención al Cliente</span>
                    </div>
                  </div>

                  {/* Tarea 3 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2 hover:border-orange-500/40 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10.5px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">
                        Operaciones • Crítico
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
                        Por iniciar
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Actualizar inventario disponible y definir stock para promociones
                    </h5>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-1">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 3 horas</span>
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Logística / Depósito</span>
                    </div>
                  </div>

                  {/* Tarea 4 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2 hover:border-orange-500/40 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10.5px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase">
                        Gestión • Seguimiento
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Programado
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Revisión de métricas de ventas y ajuste de stock en mitad de semana
                    </h5>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-1">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Jueves 18:00</span>
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Dueño / Líder</span>
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
                      Diagnóstico FODA del Emprendimiento
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    Calculado con perfil del negocio
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fortaleza */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        Fortaleza Clave
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Satisfacción 94%</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      Atención cercana y personalizada a clientes recurrentes con alta tasa de recompra y recomendación directa.
                    </p>
                  </div>

                  {/* Oportunidad */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 uppercase">
                        Oportunidad de Crecimiento
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Canal Digital</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      Automatizar pedidos por WhatsApp y entrega local el mismo día para captar clientes en horarios no comerciales.
                    </p>
                  </div>

                  {/* Debilidad */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                        Punto a Mejorar
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Gestión Diaria</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      Dependencia excesiva de libretas y chats desordenados, provocando tareas olvidadas y retrasos en entregas.
                    </p>
                  </div>

                  {/* Amenaza */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase">
                        Riesgo Externo
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Competencia</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      Competidores informales con precios agresivos y aumento estacional de costos de insumos esenciales.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Scoring RICE */}
            {activeTab === 'prioridades' && (
              <motion.div
                key="tab-prioridades"
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
                      Priorización Inteligente de Actividades
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    Actividad #01 • Mayor Retorno
                  </span>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                        Automatizar Recordatorios de Cobro y Confirmación de Pedidos
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Disminuye la cartera vencida y asegura que ningún cliente quede sin respuesta rápida tras consultar.
                      </p>
                    </div>
                    <div className="text-right self-start sm:self-auto shrink-0">
                      <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 font-mono">
                        94.0 <span className="text-xs text-zinc-500 font-sans">/ 100</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">Score RICE</span>
                    </div>
                  </div>

                  {/* RICE Breakdown Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-zinc-200/60 dark:border-white/[0.04] text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04]">
                      <span className="text-zinc-500 block text-[10.5px]">ALCANCE (R)</span>
                      <strong className="text-zinc-950 dark:text-white text-sm block mt-1">100% de clientes</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04]">
                      <span className="text-zinc-500 block text-[10.5px]">IMPACTO (I)</span>
                      <strong className="text-orange-600 dark:text-orange-400 text-sm block mt-1">3.0 (Crítico en caja)</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04]">
                      <span className="text-zinc-500 block text-[10.5px]">CONFIANZA (C)</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm block mt-1">95% (Alta certeza)</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.04]">
                      <span className="text-zinc-500 block text-[10.5px]">ESFUERZO (E)</span>
                      <strong className="text-zinc-950 dark:text-white text-sm block mt-1">1 Día de setup</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. Tablero Semanal */}
            {activeTab === 'tablero' && (
              <motion.div
                key="tab-tablero"
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
                      Sprint Semanal del Equipo (18 de 20 tareas listas)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    90% Completado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Col 1 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2.5">
                    <span className="text-[10.5px] font-mono text-zinc-500 uppercase tracking-wider font-semibold block">
                      Por Iniciar (1)
                    </span>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#181920] border border-zinc-200/60 dark:border-white/[0.06] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-zinc-500">PLAN-21</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400">1h</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        Publicar historias de recordatorio de promo
                      </p>
                      <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 block">
                        Marketing Digital
                      </span>
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2.5">
                    <span className="text-[10.5px] font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider font-semibold block">
                      En Progreso (1)
                    </span>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#181920] border border-orange-500/30 dark:border-orange-500/30 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400">PLAN-18</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">75%</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        Despachar pedidos confirmados de la mañana
                      </p>
                      <div className="w-full bg-zinc-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-orange-500 h-full w-3/4 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Col 3 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2.5">
                    <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold block">
                      Entregado Hoy (6)
                    </span>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#181920] border border-zinc-200/60 dark:border-white/[0.06] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">PLAN-14</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Listo</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        Sincronizar agenda semanal con Google Calendar
                      </p>
                      <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 block font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 100% completado
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
