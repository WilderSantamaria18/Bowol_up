import React from 'react';
import { 
  FlaskConical, 
  Target, 
  Gauge, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  Plus, 
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Hypothesis, HypothesisStatus, HypothesisResult } from '../types';

interface HypothesisCardProps {
  hypothesis: Hypothesis;
  onRecordResult: (hypothesis: Hypothesis) => void;
  onCreateExperiment: (hypothesis: Hypothesis) => void;
  onConvertToProject: (hypothesisId: string) => void;
  onDelete: (hypothesisId: string) => void;
  isConverting?: boolean;
}

const statusBadgeStyles: Record<HypothesisStatus, string> = {
  DRAFT: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  READY: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  RUNNING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  VALIDATED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  INVALIDATED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  CANCELED: 'bg-zinc-900 text-zinc-500 border-zinc-800',
};

const resultBadgeStyles: Record<HypothesisResult, { label: string; icon: React.ElementType; style: string }> = {
  SUPPORTED: { label: 'Validada (Supported)', icon: CheckCircle2, style: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  REFUTED: { label: 'Refutada (Refuted)', icon: XCircle, style: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  INCONCLUSIVE: { label: 'Inconclusa', icon: HelpCircle, style: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
};

export const HypothesisCard: React.FC<HypothesisCardProps> = ({
  hypothesis,
  onRecordResult,
  onCreateExperiment,
  onConvertToProject,
  onDelete,
  isConverting = false,
}) => {
  const resultInfo = hypothesis.result ? resultBadgeStyles[hypothesis.result] : null;

  return (
    <div className="group relative rounded-xl bg-surface-subtle/80 backdrop-blur-md border border-white/[0.08] p-5 hover:border-white/[0.16] transition-all flex flex-col justify-between gap-4">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                statusBadgeStyles[hypothesis.status]
              }`}
            >
              {hypothesis.status}
            </span>

            {resultInfo && (
              <span
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                  resultInfo.style
                }`}
              >
                <resultInfo.icon className="w-3 h-3" strokeWidth={1.5} />
                {resultInfo.label}
              </span>
            )}
          </div>

          <button
            onClick={() => onDelete(hypothesis.id)}
            className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title="Eliminar hipótesis"
            aria-label="Eliminar hipótesis"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Statement */}
        <p className="text-sm font-medium text-zinc-100 leading-relaxed mb-4">
          {hypothesis.statement}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg">
          <div>
            <span className="text-zinc-500 block mb-0.5 flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
              <FlaskConical className="w-3 h-3 text-cyan-400" strokeWidth={1.5} />
              Método
            </span>
            <span className="text-zinc-300 font-medium line-clamp-2">
              {hypothesis.validationMethod || 'No especificado'}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block mb-0.5 flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
              <Gauge className="w-3 h-3 text-amber-400" strokeWidth={1.5} />
              Métrica
            </span>
            <span className="text-zinc-300 font-medium line-clamp-2">
              {hypothesis.successMetric || 'No especificada'}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block mb-0.5 flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
              <Target className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
              Meta
            </span>
            <span className="text-emerald-400 font-semibold line-clamp-2">
              {hypothesis.targetValue || 'Pendiente'}
            </span>
          </div>
        </div>

        {/* Notes if recorded */}
        {hypothesis.resultNotes && (
          <div className="mt-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300 block mb-1">Resultados y Aprendizajes:</span>
            {hypothesis.resultNotes}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRecordResult(hypothesis)}
            className="text-xs h-7 gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            Registrar Resultado
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCreateExperiment(hypothesis)}
            className="text-xs h-7 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            Nuevo Experimento
          </Button>
        </div>

        {hypothesis.status === 'VALIDATED' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConvertToProject(hypothesis.id)}
            disabled={isConverting}
            className="text-xs h-7 bg-orange-600 hover:bg-orange-500 text-white gap-1.5 shadow-sm shadow-orange-500/20"
          >
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            Convertir a Proyecto
          </Button>
        )}
      </div>
    </div>
  );
};
