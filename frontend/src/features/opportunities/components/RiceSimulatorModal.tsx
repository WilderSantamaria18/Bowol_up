import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Check, 
  AlertTriangle, 
  Target, 
  User, 
  FlaskConical, 
  Rocket, 
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { Opportunity, RiskLevel, UpdateOpportunityPayload } from '../types';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface RiceSimulatorModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSave: (id: string, payload: UpdateOpportunityPayload) => Promise<void>;
  onConvertToProject?: (id: string) => void;
  isSaving?: boolean;
}

export const RiceSimulatorModal: React.FC<RiceSimulatorModalProps> = ({
  isOpen,
  opportunity,
  onClose,
  onSave,
  onConvertToProject,
  isSaving = false,
}) => {
  const navigate = useNavigate();

  const [reach, setReach] = useState(70);
  const [impact, setImpact] = useState(70);
  const [confidence, setConfidence] = useState(70);
  const [effort, setEffort] = useState(50);
  const [problem, setProblem] = useState('');
  const [proposal, setProposal] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    if (opportunity) {
      setReach(opportunity.reachScore ?? 70);
      setImpact(opportunity.impactScore ?? 70);
      setConfidence(opportunity.confidenceScore ?? 70);
      setEffort(opportunity.effortScore ?? 50);
      setProblem(opportunity.problem ?? '');
      setProposal(opportunity.proposal ?? '');
      setTargetSegment(opportunity.targetSegment ?? '');
      setRiskLevel(opportunity.riskLevel ?? 'LOW');
      setOwnerName(opportunity.ownerName ?? '');
    }
  }, [opportunity]);

  if (!isOpen || !opportunity) return null;

  // Real-time RICE simulation
  const computedScore = Number(((reach * impact * confidence) / (Math.max(1, effort) * 100)).toFixed(1));
  const initialScore = opportunity.priorityScore !== undefined && opportunity.priorityScore !== null
    ? Number(Number(opportunity.priorityScore).toFixed(1))
    : computedScore;

  const deltaScore = computedScore - initialScore;

  const handleReset = () => {
    setReach(opportunity.reachScore ?? 70);
    setImpact(opportunity.impactScore ?? 70);
    setConfidence(opportunity.confidenceScore ?? 70);
    setEffort(opportunity.effortScore ?? 50);
  };

  const handleSave = async () => {
    await onSave(opportunity.id, {
      reachScore: reach,
      impactScore: impact,
      confidenceScore: confidence,
      effortScore: effort,
      problem: problem.trim() || undefined,
      proposal: proposal.trim() || undefined,
      targetSegment: targetSegment.trim() || undefined,
      riskLevel,
      ownerName: ownerName.trim() || undefined,
    });
    onClose();
  };

  const handleCreateHypothesis = () => {
    onClose();
    navigate(`/hypotheses?create=true&opportunityId=${opportunity.id}&title=${encodeURIComponent(opportunity.title)}`);
  };

  // Determine score classification
  const getScoreBadge = (score: number) => {
    if (score >= 100) {
      return { label: 'Alta Prioridad RICE', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (score >= 50) {
      return { label: 'Prioridad Moderada', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    return { label: 'Baja Prioridad / Exploratoria', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' };
  };

  const scoreBadge = getScoreBadge(computedScore);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      data-testid="rice-simulator-modal"
    >
      <div 
        className="w-full max-w-2xl bg-[#0F0F12] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rice-simulator-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${scoreBadge.color}`}>
                <Zap className="w-3 h-3" strokeWidth={1.5} />
                <span>RICE {computedScore}</span>
              </span>
              <span className="text-xs text-zinc-400">
                Estado: <strong className="text-zinc-200">{opportunity.status}</strong>
              </span>
            </div>
            <h3 id="rice-simulator-title" className="text-base font-semibold text-white tracking-tight">
              {opportunity.title}
            </h3>
            {opportunity.description && (
              <p className="text-xs text-zinc-400 line-clamp-2">
                {opportunity.description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar simulador">
            <X className="w-4 h-4 text-zinc-400 hover:text-white" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Real-time Simulator Panel */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-white">Simulador de Escenarios RICE</span>
              </div>
              <div className="flex items-center gap-3">
                {deltaScore !== 0 && (
                  <span className={`text-xs font-semibold ${deltaScore > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {deltaScore > 0 ? `+${deltaScore.toFixed(1)}` : deltaScore.toFixed(1)} vs persistido
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  title="Restablecer valores originales"
                >
                  <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                  <span>Restablecer</span>
                </button>
              </div>
            </div>

            {/* Live Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Reach */}
              <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Alcance (Reach)</span>
                  <span className="font-bold text-zinc-200 text-sm">{reach}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={reach}
                  aria-label="Alcance"
                  onChange={(e) => setReach(Number(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block">Clientes o usuarios impactados</span>
              </div>

              {/* Impact */}
              <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Impacto (Impact)</span>
                  <span className="font-bold text-emerald-400 text-sm">{impact}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={impact}
                  aria-label="Impacto"
                  onChange={(e) => setImpact(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block">Valor directo en conversión o retención</span>
              </div>

              {/* Confidence */}
              <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Confianza (Confidence)</span>
                  <span className="font-bold text-sky-400 text-sm">{confidence}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={confidence}
                  aria-label="Confianza"
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block">Certeza estadística y datos empíricos</span>
              </div>

              {/* Effort */}
              <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Esfuerzo (Effort)</span>
                  <span className="font-bold text-amber-400 text-sm">{effort}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={effort}
                  aria-label="Esfuerzo"
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block">Complejidad y tiempo de desarrollo</span>
              </div>
            </div>

            {/* Formula Explainer */}
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Fórmula: (Reach × Impact × Confidence) / (Effort × 100)</span>
              <strong className="text-white">Resultado: {computedScore} pts</strong>
            </div>
          </div>

          {/* Strategic Context & Execution Fields */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Contexto Estratégico & Ejecución
            </h4>

            {/* Problem & Proposal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Problema que resuelve</label>
                <textarea
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Dolor o fricción de mercado..."
                  className="w-full text-xs bg-black/40 border border-white/[0.1] rounded-xl p-2.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Propuesta de solución</label>
                <textarea
                  rows={2}
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Enfoque de valor o producto propuesto..."
                  className="w-full text-xs bg-black/40 border border-white/[0.1] rounded-xl p-2.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
            </div>

            {/* Segment, Risk, Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium flex items-center gap-1">
                  <Target className="w-3 h-3 text-sky-400" strokeWidth={1.5} />
                  <span>Segmento Objetivo</span>
                </label>
                <input
                  type="text"
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  placeholder="Ej. Clientes B2B SaaS"
                  className="w-full text-xs bg-black/40 border border-white/[0.1] rounded-xl px-2.5 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" strokeWidth={1.5} />
                  <span>Nivel de Riesgo</span>
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full text-xs bg-black/40 border border-white/[0.1] rounded-xl px-2.5 py-2 text-zinc-200 focus:outline-none focus:border-white/30"
                >
                  <option value="LOW">Bajo (Low)</option>
                  <option value="MEDIUM">Medio (Medium)</option>
                  <option value="HIGH">Alto (High)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium flex items-center gap-1">
                  <User className="w-3 h-3 text-orange-400" strokeWidth={1.5} />
                  <span>Responsable (Owner)</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ej. Equipo Core"
                  className="w-full text-xs bg-black/40 border border-white/[0.1] rounded-xl px-2.5 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-t border-white/[0.08] bg-white/[0.02]">
          {/* Secondary Pipeline Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateHypothesis}
              className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              title="Derivar hipótesis de validación y experimentos"
            >
              <FlaskConical className="w-3.5 h-3.5 mr-1 text-purple-400" strokeWidth={1.5} />
              <span>Crear Hipótesis</span>
            </Button>

            {opportunity.status === 'APPROVED' && onConvertToProject && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onConvertToProject(opportunity.id);
                  onClose();
                }}
                className="text-xs border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
              >
                <Rocket className="w-3.5 h-3.5 mr-1 text-orange-400" strokeWidth={1.5} />
                <span>Convertir a Proyecto</span>
              </Button>
            )}
          </div>

          {/* Primary Save / Cancel */}
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cerrar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSave}
            >
              <Check className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
              Guardar Calibración
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
