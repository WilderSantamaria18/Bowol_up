import React from 'react';
import { AlertCircle, Compass } from 'lucide-react';
import { TrendCard } from './TrendCard';
import { Trend } from '../types';
import { Button } from '@/components/ui/Button';

interface TrendListProps {
  trends: Trend[];
  isLoading: boolean;
  error?: Error | null;
  onToggleRelevance: (trend: Trend) => void;
  onOpenDetails: (trend: Trend) => void;
  onEvaluateWithAi?: (trend: Trend) => void;
  onResetFilters?: () => void;
  markingTrendId?: string | null;
  evaluatingTrendId?: string | null;
}

export const TrendList: React.FC<TrendListProps> = ({
  trends,
  isLoading,
  error,
  onToggleRelevance,
  onOpenDetails,
  onEvaluateWithAi,
  onResetFilters,
  markingTrendId,
  evaluatingTrendId,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 h-64 animate-pulse flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-white/[0.05] rounded-lg" />
                <div className="h-5 w-12 bg-white/[0.05] rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-white/[0.05] rounded-lg" />
              <div className="h-4 w-full bg-white/[0.03] rounded" />
              <div className="h-4 w-5/6 bg-white/[0.03] rounded" />
            </div>
            <div className="h-8 w-full bg-white/[0.04] rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-white mb-1">
          Error al cargar tendencias
        </h3>
        <p className="text-xs text-zinc-400 mb-4">{error.message}</p>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-12 text-center max-w-md mx-auto my-12">
        <Compass className="w-12 h-12 text-zinc-500 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-white mb-1">
          No se encontraron señales de mercado
        </h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          No hay tendencias que coincidan con los filtros seleccionados o aún no se han sincronizado fuentes externas.
        </p>
        {onResetFilters && (
          <Button variant="secondary" size="sm" onClick={onResetFilters}>
            Restablecer Filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {trends.map((trend) => (
        <TrendCard
          key={trend.id}
          trend={trend}
          onToggleRelevance={onToggleRelevance}
          onOpenDetails={onOpenDetails}
          onEvaluateWithAi={onEvaluateWithAi}
          isMarking={markingTrendId === trend.id}
          isEvaluating={evaluatingTrendId === trend.id}
        />
      ))}
    </div>
  );
};
