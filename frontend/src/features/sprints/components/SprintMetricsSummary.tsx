import React from 'react';
import { 
  Clock, 
  ListTodo, 
  Gauge, 
  Timer 
} from 'lucide-react';
import { SprintMetricsResponse } from '../types';

interface SprintMetricsSummaryProps {
  metrics: SprintMetricsResponse;
}

export const SprintMetricsSummary: React.FC<SprintMetricsSummaryProps> = ({ metrics }) => {
  const completionPercentage = Math.round(Number(metrics.completionRate) || 0);
  const remainingHours = Math.max(
    0,
    (Number(metrics.totalEstimateHours) || 0) - (Number(metrics.completedEstimateHours) || 0)
  );

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className="rounded-xl bg-[#0F0F12] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Tasa de Completitud</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Gauge className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">{completionPercentage}%</span>
              <span className="text-[11px] text-zinc-400">
                ({metrics.completedTasks}/{metrics.totalTasks} tareas)
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Burned Hours */}
        <div className="rounded-xl bg-[#0F0F12] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Horas Quemadas / Estimadas</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-cyan-400 font-mono">
                {metrics.completedEstimateHours}h
              </span>
              <span className="text-[11px] text-zinc-400">de {metrics.totalEstimateHours}h</span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              {remainingHours > 0 ? `${remainingHours}h restantes por ejecutar` : 'Objetivo horario cumplido'}
            </p>
          </div>
        </div>

        {/* Cycle Time */}
        <div className="rounded-xl bg-[#0F0F12] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Tiempo de Ciclo Promedio</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Timer className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400 font-mono">
                {metrics.averageCycleTimeHours !== undefined && metrics.averageCycleTimeHours !== null
                  ? `${metrics.averageCycleTimeHours}h`
                  : '—'}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              Desde creación hasta pase a estado Done
            </p>
          </div>
        </div>

        {/* Tasks in Flight */}
        <div className="rounded-xl bg-[#0F0F12] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Estado de Tareas</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ListTodo className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-zinc-300">{metrics.completedTasks} Done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-mono text-zinc-300">{metrics.inProgressTasks} Activas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="text-xs font-mono text-zinc-300">{metrics.todoTasks} Todo</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500 font-mono">
              Total {metrics.totalTasks} tareas asignadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
