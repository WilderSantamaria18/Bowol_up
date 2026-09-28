import React, { useState, useEffect } from 'react';
import { X, FlaskConical, Target, Gauge, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateHypothesisPayload, HypothesisStatus } from '../types';
import { Opportunity } from '@/features/opportunities/types';

interface CreateHypothesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateHypothesisPayload) => void;
  opportunities: Opportunity[];
  initialOpportunityId?: string;
  initialStatement?: string;
  isLoading?: boolean;
}

export const CreateHypothesisModal: React.FC<CreateHypothesisModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  opportunities,
  initialOpportunityId,
  initialStatement = '',
  isLoading = false,
}) => {
  const [opportunityId, setOpportunityId] = useState(initialOpportunityId || opportunities[0]?.id || '');
  const [mode, setMode] = useState<'structured' | 'free'>('structured');

  // Structured Lean Startup fields
  const [targetSegment, setTargetSegment] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionProposal, setSolutionProposal] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');

  // Free statement & validation targets
  const [statement, setStatement] = useState(initialStatement);
  const [validationMethod, setValidationMethod] = useState('');
  const [successMetric, setSuccessMetric] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [status, setStatus] = useState<HypothesisStatus>('READY');

  // Auto-fill from opportunity if selected
  useEffect(() => {
    if (initialOpportunityId) {
      setOpportunityId(initialOpportunityId);
    } else if (!opportunityId && opportunities.length > 0) {
      setOpportunityId(opportunities[0].id);
    }
  }, [opportunities, opportunityId, initialOpportunityId]);

  useEffect(() => {
    if (opportunityId) {
      const opp = opportunities.find(o => o.id === opportunityId);
      if (opp) {
        if (opp.targetSegment && !targetSegment) setTargetSegment(opp.targetSegment);
        if (opp.problem && !problemStatement) setProblemStatement(opp.problem);
        if (opp.proposal && !solutionProposal) setSolutionProposal(opp.proposal);
      }
    }
  }, [opportunityId, opportunities]);

  // Compute live structured statement
  useEffect(() => {
    if (mode === 'structured') {
      const seg = targetSegment.trim() || '[segmento de clientes]';
      const prob = problemStatement.trim() || '[problema/fricción]';
      const sol = solutionProposal.trim() || '[solución o capacidad propuesta]';
      const out = expectedOutcome.trim() || '[resultado o beneficio observable]';
      const met = successMetric.trim() || '[métrica clave]';
      const tgt = targetValue.trim() || '[umbral objetivo]';

      const computed = `Creemos que ${seg} tiene el problema: "${prob}". Si ofrecemos "${sol}", esperamos que ocurra: "${out}". Lo consideraremos validado cuando "${met}" alcance "${tgt}".`;
      setStatement(computed);
    }
  }, [mode, targetSegment, problemStatement, solutionProposal, expectedOutcome, successMetric, targetValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityId || !statement.trim()) return;

    onSubmit({
      opportunityId,
      statement: statement.trim(),
      targetSegment: targetSegment.trim() || undefined,
      problemStatement: problemStatement.trim() || undefined,
      solutionProposal: solutionProposal.trim() || undefined,
      expectedOutcome: expectedOutcome.trim() || undefined,
      validationMethod: validationMethod.trim() || undefined,
      successMetric: successMetric.trim() || undefined,
      targetValue: targetValue.trim() || undefined,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FlaskConical className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Nueva Hipótesis de Negocio</h2>
              <p className="text-xs text-zinc-400">Formulación científica bajo metodología Lean Startup & Test Cards</p>
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
          {/* Opportunity Selector */}
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

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
            <button
              type="button"
              onClick={() => setMode('structured')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                mode === 'structured'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Plantilla Lean Startup (Recomendado)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('free')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                mode === 'free'
                  ? 'bg-white/[0.08] text-white border border-white/[0.14]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Texto Libre
            </button>
          </div>

          {/* Structured Builder */}
          {mode === 'structured' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">1. Segmento de Clientes</label>
                  <input
                    type="text"
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value)}
                    placeholder="Ej. Clínicas dentales medianas..."
                    className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">2. Problema / Fricción</label>
                  <input
                    type="text"
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="Ej. 40% de tiempo en agendamiento manual..."
                    className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">3. Solución Propuesta</label>
                  <input
                    type="text"
                    value={solutionProposal}
                    onChange={(e) => setSolutionProposal(e.target.value)}
                    placeholder="Ej. Asistente IA de WhatsApp integrado..."
                    className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">4. Resultado Esperado</label>
                  <input
                    type="text"
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                    placeholder="Ej. Aumento de 30% en citas confirmadas..."
                    className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Statement preview / edit */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Formulación de la Hipótesis *</span>
              {mode === 'structured' && (
                <span className="text-[10px] text-cyan-400">Generado automáticamente</span>
              )}
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder='Ej: "Creemos que ofreciendo un piloto asistido por IA lograremos un 25% de conversión a pago. Sabremos que es cierto cuando 10 clientes completen la prueba."'
              rows={3}
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>

          {/* Validation Method & Metrics */}
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
                placeholder="Ej: Entrevistas con clientes, Test A/B, Smoke test"
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

          {/* Footer Actions */}
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
