import React from 'react';
import { Compass } from 'lucide-react';
import { Button, CardSkeletonGrid, DataState, EmptyState } from '@/components/ui';
import { TrendCard } from './TrendCard';
import { Trend } from '../types';

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
}) => (
  <DataState
    isLoading={isLoading}
    error={error ? error.message : null}
    isEmpty={trends.length === 0}
    loading={<CardSkeletonGrid count={6} className="gap-5 lg:grid-cols-3 xl:grid-cols-3" cardClassName="h-64" />}
    empty={
      <EmptyState
        className="my-12"
        icon={Compass}
        title="No se encontraron señales de mercado"
        description="No hay tendencias que coincidan con los filtros seleccionados o aún no se han sincronizado fuentes externas."
        action={
          onResetFilters && (
            <Button variant="secondary" size="sm" onClick={onResetFilters}>
              Restablecer Filtros
            </Button>
          )
        }
      />
    }
  >
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
  </DataState>
);
