import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Experiment, RecordExperimentConclusionPayload } from '../types';

interface RecordConclusionModalProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RecordExperimentConclusionPayload) => void;
  isLoading?: boolean;
}

export const RecordConclusionModal: React.FC<RecordConclusionModalProps> = ({
  experiment,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [conclusion, setConclusion] = useState('');
  const [resultMetric, setResultMetric] = useState(experiment?.resultMetric || '');
  const [resultValue, setResultValue] = useState(experiment?.resultValue || '');

  if (!isOpen || !experiment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conclusion.trim()) return;

    onSubmit({
      conclusion: conclusion.trim(),
      resultMetric: resultMetric.trim() || undefined,
      resultValue: resultValue.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-base font-semibold text-white">Concluir Experimento</h2>
            <p className="text-xs text-zinc-400">Registra los resultados finales y conclusiones del test</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300">
          <span className="text-zinc-500 block mb-0.5 font-mono uppercase text-[10px]">Experimento:</span>
          <span className="font-semibold text-zinc-200">{experiment.name}</span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Métrica Evaluada
              </label>
              <input
                type="text"
                value={resultMetric}
                onChange={(e) => setResultMetric(e.target.value)}
                placeholder="Ej: Conversión D7"
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Valor Final Obtenido
              </label>
              <input
                type="text"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                placeholder="Ej: 34.2%"
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Conclusión y Hallazgos Principales *
            </label>
            <textarea
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Resume los datos empíricos obtenidos, si la hipótesis se confirma y las implicaciones para el producto..."
              rows={4}
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !conclusion.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              {isLoading ? 'Concluyendo...' : 'Finalizar y Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
