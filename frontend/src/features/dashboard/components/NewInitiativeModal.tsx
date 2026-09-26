import React, { useState } from 'react';
import { X, Sparkles, Plus, Target } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '@/features/opportunities/services/opportunityService';
import { Button } from '@/components/ui/Button';

interface NewInitiativeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInitiativeModal: React.FC<NewInitiativeModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reach, setReach] = useState<number>(500);
  const [impact, setImpact] = useState<number>(3);
  const [confidence, setConfidence] = useState<number>(80);
  const [effort, setEffort] = useState<number>(2);

  const createMutation = useMutation({
    mutationFn: () =>
      opportunityService.createOpportunity({
        title,
        description,
        reachScore: reach,
        impactScore: impact,
        confidenceScore: confidence,
        effortScore: effort,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities-board'] });
      onClose();
      setTitle('');
      setDescription('');
    },
  });

  if (!isOpen) return null;

  const calculatedRice = effort > 0 ? Math.round((reach * impact * (confidence / 100)) / effort) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#12131a] border border-white/[0.08] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Nueva Iniciativa Estratégica</h2>
              <p className="text-xs text-zinc-400">Incorpora una oportunidad y calcúlale su score RICE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Título de la iniciativa *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Inferencia perimetral con modelos SLM en edge"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.1] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Descripción & Hipótesis de Valor
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué problema resuelve y por qué es una ventaja competitiva?"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.1] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 resize-none"
            />
          </div>

          {/* RICE Quick Sliders */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-orange-400" />
                Estimación RICE Preliminar
              </span>
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                Score: {calculatedRice}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Alcance (Reach: {reach} usuarios)</label>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={reach}
                  onChange={(e) => setReach(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Impacto (1=Bajo, 3=Alto, 5=Masivo: {impact})</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={impact}
                  onChange={(e) => setImpact(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Confianza ({confidence}%)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Esfuerzo ({effort} personas/mes)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={createMutation.isPending}
            disabled={!title.trim()}
            onClick={() => createMutation.mutate()}
            leftIcon={Sparkles}
          >
            Registrar Iniciativa
          </Button>
        </div>
      </div>
    </div>
  );
};
