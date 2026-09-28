import React, { useState } from 'react';
import { X, Beaker, User, DollarSign, Target, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateExperimentPayload } from '../types';
import { Hypothesis } from '@/features/hypotheses/types';

interface CreateExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateExperimentPayload) => void;
  hypotheses: Hypothesis[];
  defaultHypothesisId?: string;
  isLoading?: boolean;
}

const EXPERIMENT_METHODS = [
  'Landing Page / Smoke Test',
  'Entrevistas de Descubrimiento',
  'A/B Split Test',
  'Fake-Door Test',
  'Prototipo Interactivo',
  'MVP Concierge',
  'Prueba Técnica de Viabilidad',
];

export const CreateExperimentModal: React.FC<CreateExperimentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  hypotheses,
  defaultHypothesisId,
  isLoading = false,
}) => {
  const [hypothesisId, setHypothesisId] = useState(defaultHypothesisId || hypotheses[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [targetMetric, setTargetMetric] = useState('');
  const [resultMetric, setResultMetric] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  React.useEffect(() => {
    if (!hypothesisId && hypotheses.length > 0) {
      setHypothesisId(defaultHypothesisId || hypotheses[0].id);
    }
  }, [hypotheses, hypothesisId, defaultHypothesisId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesisId || !name.trim()) return;

    onSubmit({
      hypothesisId,
      name: name.trim(),
      description: description.trim() || undefined,
      method: method.trim() || undefined,
      ownerName: ownerName.trim() || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      targetMetric: targetMetric.trim() || undefined,
      resultMetric: resultMetric.trim() || undefined,
      evidenceNotes: evidenceNotes.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: 'PLANNED',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Beaker className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Diseñar Nuevo Experimento</h2>
              <p className="text-xs text-zinc-400">Define una prueba táctica para validar una hipótesis</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto custom-scrollbar pr-1">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Hipótesis a Validar *
            </label>
            <select
              value={hypothesisId}
              onChange={(e) => setHypothesisId(e.target.value)}
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="" disabled>Selecciona una hipótesis</option>
              {hypotheses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.statement.substring(0, 80)}... ({h.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nombre del Experimento *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Prueba A/B Landing Page vs Wizard interactivo"
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Descripción y Procedimiento
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué se medirá, la audiencia seleccionada y los pasos a ejecutar..."
              rows={2}
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Quick Method Presets */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Método / Formato
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {EXPERIMENT_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`text-[11px] px-2 py-1 rounded-md transition-colors border ${
                    method === m
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-medium'
                      : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="O escribe un método personalizado..."
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Owner & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3 text-orange-400" strokeWidth={1.5} />
                Responsable (Owner)
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ej: Growth Lead"
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
                Presupuesto Asignado (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ej: 500"
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Métrica Primaria
              </label>
              <input
                type="text"
                value={resultMetric}
                onChange={(e) => setResultMetric(e.target.value)}
                placeholder="Ej: Tasa de reserva, NPS, Retención D7"
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                <Target className="w-3 h-3 text-sky-400" strokeWidth={1.5} />
                Meta Cuantitativa
              </label>
              <input
                type="text"
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value)}
                placeholder="Ej: >= 20% o 50 pre-registros"
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Fecha Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
              Notas de Evidencia
            </label>
            <textarea
              rows={2}
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              placeholder="Enlaces a analytics, grabaciones de usuario o reportes..."
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !name.trim() || !hypothesisId}
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {isLoading ? 'Creando...' : 'Crear Experimento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
