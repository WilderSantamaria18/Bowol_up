import React, { useState } from 'react';
import { X, Sparkles, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Opportunity } from '@/features/opportunities/types';

interface AIFormulateHypothesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormulate: (opportunityId: string) => void;
  opportunities: Opportunity[];
  isLoading?: boolean;
}

export const AIFormulateHypothesisModal: React.FC<AIFormulateHypothesisModalProps> = ({
  isOpen,
  onClose,
  onFormulate,
  opportunities = [],
  isLoading = false,
}) => {
  const [opportunityId, setOpportunityId] = useState('');

  const oppList = opportunities || [];
  const effectiveOppId = opportunityId || (oppList.length > 0 ? oppList[0].id : '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveOppId) return;
    onFormulate(effectiveOppId);
  };

  const selectedOpp = oppList.find((o) => o && o.id === effectiveOppId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Formular Hipótesis con IA</h2>
              <p className="text-xs text-zinc-400">Transforma oportunidades RICE en supuestos científicos testeables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Seleccionar Oportunidad Fuente *
            </label>
            <select
              value={effectiveOppId}
              onChange={(e) => setOpportunityId(e.target.value)}
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
            >
              <option value="" disabled>Selecciona una oportunidad</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title}
                </option>
              ))}
            </select>
          </div>

          {selectedOpp && (
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
                <span className="font-semibold text-zinc-200">{selectedOpp.title}</span>
              </div>
              {selectedOpp.description && (
                <p className="text-zinc-400 line-clamp-2">{selectedOpp.description}</p>
              )}
              {selectedOpp.priorityScore && (
                <div className="text-[11px] text-zinc-500 pt-1 font-mono">
                  Score RICE: <span className="text-orange-400 font-bold">{selectedOpp.priorityScore}</span>
                </div>
              )}
            </div>
          )}

          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-xs text-zinc-400">
            <span className="text-orange-400 font-semibold block mb-0.5">Metodología Lean Startup:</span>
            El motor de IA formulará un enunciado científico falsable, definirá el método ágil de experimentación recomendado, la métrica clave y el criterio cuantitativo de éxito.
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              data-testid="submit-ai-formulate"
              disabled={isLoading || !effectiveOppId}
              className="bg-orange-600 hover:bg-orange-500 text-white gap-2 shadow-sm shadow-orange-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  Formulando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                  Formular Hipótesis
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
