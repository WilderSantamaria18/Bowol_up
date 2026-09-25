import React, { useState } from 'react';
import { X, FlaskConical, Target, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateHypothesisPayload, HypothesisStatus } from '../types';
import { Opportunity } from '@/features/opportunities/types';

interface CreateHypothesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateHypothesisPayload) => void;
  opportunities: Opportunity[];
  isLoading?: boolean;
}

export const CreateHypothesisModal: React.FC<CreateHypothesisModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  opportunities,
  isLoading = false,
}) => {
  const [opportunityId, setOpportunityId] = useState(opportunities[0]?.id || '');
  const [statement, setStatement] = useState('');
  const [validationMethod, setValidationMethod] = useState('');
  const [successMetric, setSuccessMetric] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [status, setStatus] = useState<HypothesisStatus>('READY');

  React.useEffect(() => {
    if (!opportunityId && opportunities.length > 0) {
      setOpportunityId(opportunities[0].id);
    }
  }, [opportunities, opportunityId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityId || !statement.trim()) return;

    onSubmit({
      opportunityId,
      statement: statement.trim(),
      validationMethod: validationMethod.trim() || undefined,
      successMetric: successMetric.trim() || undefined,
      targetValue: targetValue.trim() || undefined,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FlaskConical className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Nueva Hipótesis de Negocio</h2>
              <p className="text-xs text-zinc-400">Formula un supuesto falsable derivado de una oportunidad</p>
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
              Oportunidad Estratégica Asociada *
            </label>
            <select
              value={opportunityId}
              onChange={(e) => setOpportunityId(e.target.value)}
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="" disabled>Selecciona una oportunidad</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Formulación de la Hipótesis *
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder='Ej: "Creemos que ofreciendo un piloto asistido por IA lograremos un 25% de conversión a pago. Sabremos que es cierto cuando 10 clientes completen la prueba."'
              rows={3}
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-cyan-400" strokeWidth={1.5} />
                Método de Validación
              </label>
              <input
                type="text"
                value={validationMethod}
                onChange={(e) => setValidationMethod(e.target.value)}
                placeholder="Ej: Entrevistas con clientes, Test A/B"
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-amber-400" strokeWidth={1.5} />
                Métrica de Éxito
              </label>
              <input
                type="text"
                value={successMetric}
                onChange={(e) => setSuccessMetric(e.target.value)}
                placeholder="Ej: Tasa de conversión a suscripción"
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
                Valor Meta / Criterio
              </label>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Ej: >= 25% o 8 de cada 10"
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Estado Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as HypothesisStatus)}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="DRAFT">Borrador (DRAFT)</option>
                <option value="READY">Lista para prueba (READY)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !statement.trim() || !opportunityId}
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {isLoading ? 'Creando...' : 'Crear Hipótesis'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
