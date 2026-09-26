import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  ChevronRight, 
  RefreshCw, 
  Check 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardSummary } from '../types';

interface BentoDashboardHeaderProps {
  summary: DashboardSummary;
  onOpenNewInitiative: () => void;
  onSyncTrends: () => void;
  isSyncing: boolean;
}

export const BentoDashboardHeader: React.FC<BentoDashboardHeaderProps> = ({
  summary,
  onOpenNewInitiative,
  onSyncTrends,
  isSyncing,
}) => {
  const [copiedExport, setCopiedExport] = useState(false);

  const handleExportReport = () => {
    const reportData = {
      titulo: 'BOWOL - Informe Ejecutivo de Visión Estratégica',
      fecha: new Date().toISOString(),
      organizacion: {
        nombre: summary.organization.name,
        plan: summary.organization.plan,
        miembros: summary.organization.memberCount,
      },
      madurez: {
        etapa: summary.maturity.stage,
        madurezDigital: `${summary.maturity.digitalMaturity}%`,
        madurezIA: `${summary.maturity.aiMaturity}%`,
      },
      senalesMercado: {
        tendenciasTotales: summary.trends.totalGlobalTrends,
        tendenciasEvaluadas: summary.trends.evaluatedTrendsCount,
      },
      estrategia: {
        oportunidadesTotales: summary.strategy.opportunitiesCount,
        priorizadasRICE: summary.strategy.opportunitiesPrioritized,
        ricePromedio: summary.strategy.averageRiceScore,
        fodaTotal: summary.strategy.swotCount,
      },
      ejecucion: {
        proyectosActivos: summary.execution.activeProjectsCount,
        sprintActivo: summary.execution.activeSprint?.name || 'Sin sprint activo',
        avanceSprint: `${summary.execution.activeSprint?.progressPercent || 0}%`,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BOWOL_Informe_Estrategico_${summary.organization.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1.5">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <span className="hover:text-zinc-200 transition-colors cursor-pointer">Plataforma</span>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-orange-400/90 font-semibold">Resumen</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">{summary.organization.name}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
            {summary.organization.plan}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
          Visión Estratégica
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={RefreshCw}
          isLoading={isSyncing}
          onClick={onSyncTrends}
          className="shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>

        <button
          onClick={handleExportReport}
          type="button"
          className="group flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#292931]/60 hover:bg-[#33343c] text-zinc-200 font-medium text-xs transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] active:scale-[0.985] border border-white/[0.06]"
        >
          {copiedExport ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Descargado</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              <span>Exportar informe</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenNewInitiative}
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_4px_12px_rgba(249,115,22,0.3)] active:scale-[0.985]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nueva iniciativa</span>
        </button>
      </div>
    </div>
  );
};
