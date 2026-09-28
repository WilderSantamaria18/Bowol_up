import React from 'react';
import { X, Activity, Layers, CheckCircle2, TrendingUp, Lightbulb, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardHealthScoreInfo } from '../types';

interface BusinessHealthDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthScore?: DashboardHealthScoreInfo;
}

export const BusinessHealthDetailModal: React.FC<BusinessHealthDetailModalProps> = ({
  isOpen,
  onClose,
  healthScore,
}) => {
  if (!isOpen || !healthScore) return null;

  const vars = healthScore.formulaVariables || {};
  const overall = healthScore.overallScore ?? 84;
  const execution = healthScore.executionScore ?? 80;
  const strategy = healthScore.strategyScore ?? 85;
  const market = healthScore.marketScore ?? 75;
  const maturity = healthScore.maturityScore ?? 70;

  const statusColor = 
    overall >= 80 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
    overall >= 60 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
    'text-red-500 bg-red-500/10 border-red-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-white/95 dark:bg-[#121318]/95 border border-zinc-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        data-testid="business-health-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Transparencia del BusinessHealthScore
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                  Explicable
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Desglose cuantitativo de factores, pesos ponderados y variables utilizadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Overall score banner */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                Índice Global de Salud de Innovación
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {overall}
                </span>
                <span className="text-sm text-zinc-400">/ 100</span>
                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                  {healthScore.statusLabel === 'OPTIMAL' ? 'ÓPTIMO' : healthScore.statusLabel === 'GOOD' ? 'ESTABLE' : 'REQUIERE ATENCIÓN'}
                </span>
              </div>
            </div>
            <div className="max-w-xs text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {healthScore.explanation}
            </div>
          </div>

          {/* Mathematical Formula breakdown */}
          <div className="p-4 rounded-2xl bg-orange-500/5 dark:bg-orange-500/[0.02] border border-orange-500/15 space-y-2">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold text-xs">
              <Zap className="w-4 h-4" strokeWidth={1.5} />
              <span>Fórmula Ponderada de Decisión</span>
            </div>
            <code className="block p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 text-[11px] font-mono text-zinc-800 dark:text-zinc-200">
              Score = (Ejecución × 0.30) + (Estrategia × 0.25) + (Mercado × 0.20) + (Madurez × 0.25)
            </code>
          </div>

          {/* Component Factors */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Componentes del Índice y Variables Subyacentes
            </h3>

            {/* 1. Execution */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">1. Ejecución Ágil (30%)</span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {execution}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${execution}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-500">
                <span>Tareas completadas: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{vars.completedTasks ?? 0} / {vars.totalTasks ?? 0}</strong></span>
                <span>Avance Sprint Activo: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{vars.activeSprintProgress ?? 0}%</strong></span>
              </div>
            </div>

            {/* 2. Strategy */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">2. Estrategia & Oportunidades RICE (25%)</span>
                </div>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                  {strategy}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${strategy}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-500">
                <span>Oportunidades Aprobadas: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{vars.approvedOpportunities ?? 0}</strong></span>
                <span>Total en Embudo: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{vars.totalOpportunities ?? 0}</strong></span>
              </div>
            </div>

            {/* 3. Market */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">3. Radar de Mercado & Señales (20%)</span>
                </div>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {market}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${market}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-500">
                <span>Tendencias Evaluadas con IA: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{vars.evaluatedTrends ?? 0}</strong></span>
                <span>Señales Globales: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{vars.totalTrends ?? 0}</strong></span>
              </div>
            </div>

            {/* 4. Maturity */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" strokeWidth={1.5} />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">4. Madurez Digital & IA (25%)</span>
                </div>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
                  {maturity}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${maturity}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-500">
                <span>Madurez Digital: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{vars.digitalMaturity ?? 0}%</strong></span>
                <span>Madurez en IA: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{vars.aiMaturity ?? 0}%</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Cumple con el principio de explicabilidad algorítmica de BOWOL
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};
