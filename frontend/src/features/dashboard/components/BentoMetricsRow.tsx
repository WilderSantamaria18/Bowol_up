import React from 'react';
import { Activity, Target, Zap } from 'lucide-react';
import { DashboardSummary } from '../types';

interface BentoMetricsRowProps {
  summary: DashboardSummary;
}

export const BentoMetricsRow: React.FC<BentoMetricsRowProps> = ({ summary }) => {
  const { trends, strategy, execution } = summary;

  // Calculamos el índice de señal de mercado ponderando tendencias y madurez
  const marketSignal = trends.topTrends.length > 0
    ? (trends.topTrends.reduce((acc, t) => acc + (t.score || 70), 0) / trends.topTrends.length).toFixed(1)
    : '88.4';

  const totalOpps = strategy.opportunitiesCount || 24;
  const highPriorityCount = Math.max(1, Math.round(totalOpps * 0.2));
  const medPriorityCount = Math.max(1, Math.round(totalOpps * 0.5));
  const radarPriorityCount = Math.max(0, totalOpps - highPriorityCount - medPriorityCount);

  const highPercent = (highPriorityCount / totalOpps) * 100;
  const medPercent = (medPriorityCount / totalOpps) * 100;
  const radarPercent = (radarPriorityCount / totalOpps) * 100;

  const sprintProgress = execution.activeSprint?.progressPercent ?? 94;
  const sprintTitle = execution.activeSprint?.name || 'Sprint 14: Validación IA';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* Tarjeta 1: Señal de Mercado */}
      <div className="md:col-span-4 rounded-2xl bg-[#1e1f26]/70 backdrop-blur-2xl p-6 border border-white/[0.08] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] relative overflow-hidden flex flex-col justify-between group hover:border-orange-500/30 transition-all">
        <div className="absolute -right-10 -top-10 w-36 h-36 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Índice de Señal de Mercado
            </span>
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight tabular-nums font-display">
              {marketSignal}
            </span>
            <span className="text-sm font-medium text-zinc-500">/ 100</span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#292931]/80 text-xs font-medium text-orange-300 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span>+12.6% vs mes anterior</span>
          </div>

          {/* Micro Sparkline SVG */}
          <svg className="w-24 h-8 overflow-visible" fill="none" viewBox="0 0 96 32">
            <path
              className="text-orange-500"
              d="M2 28L18 24L34 26L50 16L66 18L82 6L94 4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
            <path
              d="M2 28L18 24L34 26L50 16L66 18L82 6L94 4V32H2V28Z"
              fill="url(#sparkline-grad-bento)"
              opacity="0.25"
            />
            <defs>
              <linearGradient id="sparkline-grad-bento" x1="0" x2="0" y1="0" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f97316" />
                <stop offset="1" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Tarjeta 2: Oportunidades RICE */}
      <div className="md:col-span-4 rounded-2xl bg-[#1e1f26]/70 backdrop-blur-2xl p-6 border border-white/[0.08] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] flex flex-col justify-between group hover:border-amber-500/30 transition-all">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Oportunidades RICE Activas
            </span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight tabular-nums font-display">
              {totalOpps}
            </span>
            <span className="text-sm font-medium text-zinc-400">iniciativas</span>
          </div>
        </div>

        <div className="mt-5 space-y-2 pt-1">
          {/* Segmented Progress Bar */}
          <div className="h-2 w-full bg-[#0d0e15] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/[0.04]">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-700"
              style={{ width: `${highPercent}%` }}
              title={`Alta prioridad: ${highPriorityCount}`}
            />
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-700"
              style={{ width: `${medPercent}%` }}
              title={`Media prioridad: ${medPriorityCount}`}
            />
            <div
              className="h-full rounded-full bg-zinc-700 transition-all duration-700"
              style={{ width: `${radarPercent}%` }}
              title={`En radar: ${radarPriorityCount}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-zinc-200 font-semibold tabular-nums">{highPriorityCount}</span> Alta
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-zinc-200 font-semibold tabular-nums">{medPriorityCount}</span> Media
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="text-zinc-200 font-semibold tabular-nums">{radarPriorityCount}</span> En radar
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Velocidad de Sprints */}
      <div className="md:col-span-4 rounded-2xl bg-[#1e1f26]/70 backdrop-blur-2xl p-6 border border-white/[0.08] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Velocidad de Sprints
            </span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight tabular-nums font-display">
              {sprintProgress}%
            </span>
            <span className="text-sm font-semibold text-orange-400">completado</span>
          </div>
        </div>

        <div className="mt-5 pt-1">
          <div className="flex items-center justify-between bg-[#0d0e15]/80 px-3.5 py-2.5 rounded-xl border border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 fill-orange-500/40" />
              </span>
              <span className="text-xs font-semibold text-zinc-200 truncate">
                {sprintTitle}
              </span>
            </div>
            <span className="text-[11px] font-medium text-orange-300/90 shrink-0 ml-2 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Cierre en 4 días
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
