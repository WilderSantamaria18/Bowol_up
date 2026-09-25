import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Hypothesis, HypothesisResult, RecordHypothesisResultPayload } from '../types';

interface RecordResultModalProps {
  hypothesis: Hypothesis | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RecordHypothesisResultPayload) => void;
  isLoading?: boolean;
}

export const RecordResultModal: React.FC<RecordResultModalProps> = ({
  hypothesis,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [result, setResult] = useState<HypothesisResult>('SUPPORTED');
  const [resultNotes, setResultNotes] = useState('');

  if (!isOpen || !hypothesis) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      result,
      resultNotes: resultNotes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-base font-semibold text-white">Registrar Conclusión de Hipótesis</h2>
            <p className="text-xs text-zinc-400">Determina el veredicto científico de la validación</p>
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
          <span className="text-zinc-500 block mb-1 font-mono uppercase tracking-wider text-[10px]">Hipótesis:</span>
          {hypothesis.statement}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Resultado Obtenido *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setResult('SUPPORTED')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  result === 'SUPPORTED'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/30'
                    : 'bg-surface-subtle border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-400" strokeWidth={1.5} />
                <span className="text-xs font-semibold">Validada</span>
                <span className="text-[10px] text-zinc-500">Superó métrica</span>
              </button>

              <button
                type="button"
                onClick={() => setResult('REFUTED')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  result === 'REFUTED'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 ring-1 ring-rose-500/30'
                    : 'bg-surface-subtle border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <XCircle className="w-5 h-5 mb-1 text-rose-400" strokeWidth={1.5} />
                <span className="text-xs font-semibold">Refutada</span>
                <span className="text-[10px] text-zinc-500">No alcanzó meta</span>
              </button>

              <button
                type="button"
                onClick={() => setResult('INCONCLUSIVE')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  result === 'INCONCLUSIVE'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 ring-1 ring-amber-500/30'
                    : 'bg-surface-subtle border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <HelpCircle className="w-5 h-5 mb-1 text-amber-400" strokeWidth={1.5} />
                <span className="text-xs font-semibold">Inconclusa</span>
                <span className="text-[10px] text-zinc-500">Requiere datos</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Observaciones, Números y Aprendizajes Clave
            </label>
            <textarea
              value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)}
              placeholder="Detalla las métricas finales alcanzadas, reacciones cualitativas de clientes y próximos pasos estratégicos..."
              rows={3}
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {isLoading ? 'Guardando...' : 'Guardar Resultado'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
