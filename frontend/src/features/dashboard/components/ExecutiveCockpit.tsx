import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from '@/components/ui/Alert';
import { dashboardService } from '../services/dashboardService';
import { trendService } from '@/features/trends/services/trendService';
import { BentoDashboardHeader } from './BentoDashboardHeader';
import { BentoMetricsRow } from './BentoMetricsRow';
import { BentoRadarTable } from './BentoRadarTable';
import { BentoSwotSynthesis } from './BentoSwotSynthesis';
import { BentoExperimentPipeline } from './BentoExperimentPipeline';
import { BentoAiAssistantCard } from './BentoAiAssistantCard';
import { NewInitiativeModal } from './NewInitiativeModal';

export const ExecutiveCockpit: React.FC = () => {
  const queryClient = useQueryClient();
  const [isInitiativeModalOpen, setIsInitiativeModalOpen] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getSummary(),
  });

  const syncMutation = useMutation({
    mutationFn: () => trendService.triggerSync(10),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setSyncSuccessMsg(
        `¡Sincronización exitosa! Se procesaron ${data.totalFetched} señales (${data.totalCreated} nuevas, ${data.totalUpdated} actualizadas).`
      );
      setTimeout(() => setSyncSuccessMsg(null), 6000);
    },
  });

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm animate-pulse">Cargando Visión Estratégica...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <Alert variant="error" title="Error al cargar el panel">
          No se pudieron sincronizar las métricas ejecutivas. Por favor recarga la página.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 0. Header con Breadcrumbs y Acciones */}
      <BentoDashboardHeader
        summary={summary}
        onOpenNewInitiative={() => setIsInitiativeModalOpen(true)}
        onSyncTrends={() => syncMutation.mutate()}
        isSyncing={syncMutation.isPending}
      />

      {syncSuccessMsg && (
        <Alert variant="success" title="Sincronización de Radar">
          {syncSuccessMsg}
        </Alert>
      )}

      {/* 1. Métricas Bento Superiores (Grid 12 col) */}
      <BentoMetricsRow summary={summary} />

      {/* 2. Sección Media Bento: Radar de Tendencias (8 cols) & Síntesis FODA (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <BentoRadarTable
            trends={summary.trends.topTrends}
            totalGlobalTrends={summary.trends.totalGlobalTrends}
          />
        </div>
        <div className="lg:col-span-4">
          <BentoSwotSynthesis />
        </div>
      </div>

      {/* 3. Sección Inferior Bento: Pipeline de Experimentación (7 cols) & Asistente BOWOL (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <BentoExperimentPipeline />
        </div>
        <div className="lg:col-span-5">
          <BentoAiAssistantCard />
        </div>
      </div>

      {/* Modal para Crear Nueva Iniciativa */}
      <NewInitiativeModal
        isOpen={isInitiativeModalOpen}
        onClose={() => setIsInitiativeModalOpen(false)}
      />
    </div>
  );
};
