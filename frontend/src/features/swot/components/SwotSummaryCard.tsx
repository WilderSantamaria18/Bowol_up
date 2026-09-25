import React from 'react';
import { Compass, Cpu, Clock, Layers } from 'lucide-react';
import { SwotAnalysis } from '../types';

interface SwotSummaryCardProps {
  swot: SwotAnalysis;
}

export const SwotSummaryCard: React.FC<SwotSummaryCardProps> = ({ swot }) => {
  const formattedDate = new Date(swot.generatedAt || swot.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const snapshot = swot.profileSnapshot || {};

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Compass className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">Diagnóstico Estratégico Ejecutivo</h4>
            <p className="text-[11px] text-zinc-400">Síntesis generada por el motor analítico de BOWOL</p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
            <Clock className="w-3 h-3 text-zinc-500" strokeWidth={1.5} />
            {formattedDate}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
            <Cpu className="w-3 h-3 text-orange-400" strokeWidth={1.5} />
            {swot.aiModelUsed || 'gpt-4o'}
          </span>
        </div>
      </div>

      {/* Summary Text */}
      <div className="text-sm text-zinc-200 leading-relaxed font-normal bg-black/20 p-4 rounded-xl border border-white/[0.04]">
        {swot.summary || 'Sin resumen registrado para este análisis.'}
      </div>

      {/* Business Snapshot Context */}
      {Object.keys(snapshot).length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1 mr-1">
            <Layers className="w-3 h-3" strokeWidth={1.5} />
            Contexto del análisis:
          </span>
          {snapshot.industry && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.06]">
              Industria: <strong className="font-medium text-white">{snapshot.industry}</strong>
            </span>
          )}
          {snapshot.market && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.06]">
              Mercado: <strong className="font-medium text-white">{snapshot.market}</strong>
            </span>
          )}
          {snapshot.size && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.06]">
              Tamaño: <strong className="font-medium text-white">{snapshot.size}</strong>
            </span>
          )}
          {snapshot.digitalMaturity !== undefined && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.06]">
              Madurez Digital: <strong className="font-medium text-emerald-400">{snapshot.digitalMaturity}/100</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
