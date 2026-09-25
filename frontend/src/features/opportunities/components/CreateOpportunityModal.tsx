import React, { useState } from 'react';
import { X, Zap, Plus, Check } from 'lucide-react';
import { CreateOpportunityPayload } from '../types';
import { Button } from '@/components/ui/Button';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateOpportunityPayload) => Promise<void>;
  isLoading?: boolean;
  initialTitle?: string;
  initialDescription?: string;
}

export const CreateOpportunityModal: React.FC<CreateOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialTitle = '',
  initialDescription = '',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [reach, setReach] = useState(70);
  const [impact, setImpact] = useState(70);
  const [confidence, setConfidence] = useState(70);
  const [effort, setEffort] = useState(50);

  React.useEffect(() => {
    if (isOpen) {
      if (initialTitle) setTitle(initialTitle);
      if (initialDescription) setDescription(initialDescription);
    }
  }, [isOpen, initialTitle, initialDescription]);

  if (!isOpen) return null;

  // Real-time RICE score calculation
  const computedScore = ((reach * impact * confidence) / (Math.max(1, effort) * 100)).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      reachScore: reach,
      impactScore: impact,
      confidenceScore: confidence,
      effortScore: effort,
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#0F0F12] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-opportunity-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h3 id="create-opportunity-title" className="text-base font-semibold text-white tracking-tight">
                Nueva Oportunidad Estratégica
              </h3>
              <p className="text-xs text-zinc-400">Priorización calculada con marco RICE</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar modal">
            <X className="w-4 h-4 text-zinc-400 hover:text-white" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Título de la iniciativa <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Integración de checkout con pagos instantáneos"
              className="w-full text-xs bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Descripción / Hipótesis de valor
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el beneficio esperado y objetivo a conseguir..."
              className="w-full text-xs bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          {/* RICE Sliders */}
          <div className="space-y-3 pt-2 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Factores RICE (0 - 100)</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                <Zap className="w-3 h-3" strokeWidth={1.5} />
                Prioridad: {computedScore}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Alcance (Reach)</span>
                  <span className="font-semibold text-zinc-200">{reach}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={reach}
                  onChange={(e) => setReach(Number(e.target.value))}
                  className="w-full accent-orange-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Impacto (Impact)</span>
                  <span className="font-semibold text-emerald-400">{impact}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={impact}
                  onChange={(e) => setImpact(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Confianza (Confidence)</span>
                  <span className="font-semibold text-sky-400">{confidence}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-sky-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Esfuerzo (Effort)</span>
                  <span className="font-semibold text-amber-400">{effort}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.06]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              disabled={!title.trim() || isLoading}
            >
              <Check className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
              Guardar Oportunidad
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
