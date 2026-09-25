import React from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Play, 
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Experiment, ExperimentStatus } from '../types';

interface ExperimentCardProps {
  experiment: Experiment;
  onUpdateStatus: (id: string, status: ExperimentStatus) => void;
  onRecordConclusion: (experiment: Experiment) => void;
  onDelete: (id: string) => void;
}

const statusBadgeStyles: Record<ExperimentStatus, string> = {
  PLANNED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  RUNNING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  ABORTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  onUpdateStatus,
  onRecordConclusion,
  onDelete,
}) => {
  return (
    <div className="group relative rounded-xl bg-surface-subtle/80 backdrop-blur-md border border-white/[0.08] p-5 hover:border-white/[0.16] transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              statusBadgeStyles[experiment.status]
            }`}
          >
            {experiment.status}
          </span>

          <button
            onClick={() => onDelete(experiment.id)}
            className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title="Eliminar experimento"
            aria-label="Eliminar experimento"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{experiment.name}</h3>

        {experiment.description && (
          <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{experiment.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-lg mb-3">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Método</span>
            <span className="text-zinc-300 font-medium truncate block">
              {experiment.method || 'No especificado'}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Período</span>
            <span className="text-zinc-300 font-medium truncate flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
              {experiment.startDate || 'TBD'} - {experiment.endDate || 'TBD'}
            </span>
          </div>
        </div>

        {experiment.resultMetric && (
          <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300 flex items-center justify-between mb-2">
            <span className="text-zinc-400">Métrica:</span>
            <span className="font-semibold">{experiment.resultMetric}</span>
            {experiment.resultValue && (
              <span className="text-cyan-400 font-bold ml-1">({experiment.resultValue})</span>
            )}
          </div>
        )}

        {experiment.conclusion && (
          <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-zinc-300">
            <span className="text-emerald-400 font-semibold block mb-0.5">Conclusión:</span>
            <p className="text-zinc-300 leading-relaxed">{experiment.conclusion}</p>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        {experiment.status === 'PLANNED' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onUpdateStatus(experiment.id, 'RUNNING')}
            className="text-xs h-7 text-blue-400 hover:text-blue-300 gap-1.5"
          >
            <Play className="w-3 h-3" strokeWidth={1.5} />
            Iniciar Experimento
          </Button>
        )}

        {experiment.status === 'RUNNING' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onRecordConclusion(experiment)}
            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
          >
            <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
            Concluir Experimento
          </Button>
        )}

        {experiment.status === 'COMPLETED' && (
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            Completado
          </span>
        )}

        {experiment.status === 'ABORTED' && (
          <span className="text-[11px] text-zinc-500 font-medium">Cancelado</span>
        )}
      </div>
    </div>
  );
};
