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

  // Escalas de BOWOL Plans: R (1-10), I (1-3), C (0-1), E (horas > 0)
  const [reach, setReach] = useState<number>(7);
  const [impact, setImpact] = useState<number>(2); // 1, 2, 3
  const [confidence, setConfidence] = useState<number>(0.75); // 0 a 1
  const [effortHours, setEffortHours] = useState<number>(6); // horas > 0
  const [isMandatoryEnabler, setIsMandatoryEnabler] = useState<boolean>(false);
  const [evidenceNotes, setEvidenceNotes] = useState<string>('');
  
  const [problem, setProblem] = useState('');
  const [proposal, setProposal] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    if (opportunity) {
      // Normalizar desde valores previos (si vienen de 0-100)
      const rawR = opportunity.reachScore ?? 70;
      setReach(rawR <= 10 ? Math.max(1, rawR) : Math.max(1, Math.min(10, Math.round(rawR / 10))));

      const rawI = opportunity.impactScore ?? 70;
      setImpact(rawI <= 3 ? Math.max(1, rawI) : (rawI >= 75 ? 3 : (rawI >= 40 ? 2 : 1)));

      const rawC = opportunity.confidenceScore ?? 70;
      setConfidence(rawC <= 1 ? Math.max(0, rawC) : Math.max(0, Math.min(1, Number((rawC / 100).toFixed(2)))));

      const rawE = opportunity.effortScore ?? 6;
      setEffortHours(Math.max(1, rawE));

      setProblem(opportunity.problem ?? '');
      setProposal(opportunity.proposal ?? '');
      setTargetSegment(opportunity.targetSegment ?? '');
      setRiskLevel(opportunity.riskLevel ?? 'LOW');
      setOwnerName(opportunity.ownerName ?? '');

      // Verificar si es obligación / tarea habilitadora en localStorage
      try {
        const savedMeta = localStorage.getItem(`bowol_opp_meta_${opportunity.id}`);
        if (savedMeta) {
          const parsed = JSON.parse(savedMeta);
          setIsMandatoryEnabler(Boolean(parsed.isMandatoryEnabler));
          setEvidenceNotes(parsed.evidenceNotes || '');
        }
      } catch {
        // ignore
      }
    }
  }, [opportunity]);

  if (!isOpen || !opportunity) return null;

  // Normalizar factores a las escalas de BOWOL Plans
  const bowolR = reach > 10 ? Math.max(1, Math.min(10, Math.round(reach / 10))) : Math.max(1, reach);
  const bowolI = impact > 3 ? (impact >= 75 ? 3 : (impact >= 40 ? 2 : 1)) : Math.max(1, impact);
  const bowolC = confidence > 1 ? Math.min(1, Number((confidence / 100).toFixed(2))) : Math.max(0.1, confidence);
  const bowolE = Math.max(1, effortHours);

  // Cálculo exacto BOWOL Plans: Score = (R × I × C) / E (con 2 decimales)
  const computedBowolScore = Number(((bowolR * bowolI * bowolC) / bowolE).toFixed(2));

  const handleReset = () => {
    setReach(70);
    setImpact(66);
    setConfidence(75);
    setEffortHours(6);
    setIsMandatoryEnabler(false);
  };

  const handleSave = async () => {
    // Guardar metadata extendida de BOWOL Plans (habilitadora + notas)
    try {
      localStorage.setItem(`bowol_opp_meta_${opportunity.id}`, JSON.stringify({
        isMandatoryEnabler,
        evidenceNotes,
        bowolScore: computedBowolScore,
        updatedAt: new Date().toISOString()
      }));
    } catch {
      // ignore
    }

    // Persistir directamente al backend en base de datos
    await onSave(opportunity.id, {
      reachScore: Math.round(reach > 10 ? reach : reach * 10),
      impactScore: Math.round(impact > 3 ? impact : (impact === 3 ? 100 : (impact === 2 ? 66 : 33))),
      confidenceScore: Math.round(confidence > 1 ? confidence : confidence * 100),
      effortScore: Math.min(100, Math.max(1, effortHours)),
      isMandatoryEnabler,
      evidenceNotes: evidenceNotes.trim() || undefined,
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

  // Determine score classification (BOWOL Plans)
  const getScoreBadge = (score: number, isEnabler: boolean) => {
    if (isEnabler) {
      return { label: 'Obligación / Habilitadora Previa', color: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/15 border-purple-200 dark:border-purple-500/40' };
    }
    if (score >= 3.0) {
      return { label: 'Alta Prioridad BOWOL (Score ≥ 3.00)', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' };
    }
    if (score >= 1.5) {
      return { label: 'Prioridad Moderada (Score 1.50 - 2.99)', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' };
    }
    return { label: 'Baja Prioridad / Exploratoria (Score < 1.50)', color: 'text-zinc-700 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-500/10 border-zinc-200 dark:border-zinc-500/30' };
  };

  const scoreBadge = getScoreBadge(computedBowolScore, isMandatoryEnabler);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      data-testid="rice-simulator-modal"
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0F0F12] border border-zinc-200 dark:border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rice-simulator-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${scoreBadge.color}`}>
                <Zap className="w-3 h-3" strokeWidth={1.5} />
                <span>Score BOWOL: {computedBowolScore.toFixed(2)}</span>
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Estado: <strong className="text-zinc-900 dark:text-zinc-200">{opportunity.status}</strong>
              </span>
            </div>
            <h3 id="rice-simulator-title" className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
              {opportunity.title}
            </h3>
            {opportunity.description && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {opportunity.description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar simulador">
            <X className="w-4 h-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Real-time Simulator Panel */}
          <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-transparent border border-zinc-200/80 dark:border-white/[0.08] space-y-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-zinc-900 dark:text-white">Simulador de Escenarios RICE</span>
                <span className="text-[10px] font-mono text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-500/20">
                  BOWOL Plans (Fase 4)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  title="Restablecer valores de referencia"
                >
                  <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                  <span>Restablecer</span>
                </button>
              </div>
            </div>

            {/* Regla 1 de Fase 4: Obligaciones y Tareas Habilitadoras previas */}
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/[0.06] border border-purple-200 dark:border-purple-500/20 flex items-start gap-3 shadow-sm dark:shadow-none">
              <input
                type="checkbox"
                id="mandatory-enabler-check"
                checked={isMandatoryEnabler}
                onChange={(e) => setIsMandatoryEnabler(e.target.checked)}
                className="mt-0.5 rounded border-purple-400 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="mandatory-enabler-check" className="text-xs cursor-pointer select-none">
                <span className="font-semibold text-purple-800 dark:text-purple-300 block">
                  Obligación Legal/Técnica o Tarea Habilitadora Previa
                </span>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Según Reglas 1 y 9 de BOWOL Plans: Se debe ejecutar antes que el ranking ordinario, respetando dependencias críticas y compromisos fijos.
                </span>
              </label>
            </div>

            {/* Live Sliders / Inputs con escalas de BOWOL Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Reach R (1 a 10 ordinal) */}
              <div className="space-y-1.5 p-3 rounded-lg bg-white dark:bg-black/30 border border-zinc-200/80 dark:border-white/[0.04] shadow-xs dark:shadow-none">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">Alcance (Reach · R={bowolR})</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">{bowolR} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={reach}
                  aria-label="Alcance"
                  onChange={(e) => setReach(Number(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Umbral ordinal BOWOL Plans: {bowolR} de 10</span>
              </div>

              {/* Impact I (1 Bajo, 2 Medio, 3 Alto) */}
              <div className="space-y-1.5 p-3 rounded-lg bg-white dark:bg-black/30 border border-zinc-200/80 dark:border-white/[0.04] shadow-xs dark:shadow-none">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">Impacto (Impact · I={bowolI})</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {bowolI === 3 ? '3 (Alto)' : (bowolI === 2 ? '2 (Medio)' : '1 (Bajo)')}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={impact}
                  aria-label="Impacto"
                  onChange={(e) => setImpact(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">1: bajo, 2: medio, 3: alto respecto al objetivo</span>
              </div>

              {/* Confidence C (0 a 1 basado en evidencia) */}
              <div className="space-y-1.5 p-3 rounded-lg bg-white dark:bg-black/30 border border-zinc-200/80 dark:border-white/[0.04] shadow-xs dark:shadow-none">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">Confianza (Confidence · C={bowolC.toFixed(2)})</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">{bowolC.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={confidence > 1 ? confidence : Math.round(confidence * 100)}
                  aria-label="Confianza"
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 dark:text-zinc-400">
                  <span>0.25 (Hipótesis)</span>
                  <span>0.50 (Supuesto)</span>
                  <span>0.75 (Referencia)</span>
                  <span>1.0 (Evidencia)</span>
                </div>
              </div>

              {/* Effort E (Horas totales de equipo > 0) */}
              <div className="space-y-1.5 p-3 rounded-lg bg-white dark:bg-black/30 border border-zinc-200/80 dark:border-white/[0.04] shadow-xs dark:shadow-none">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">Esfuerzo (Effort · E={effortHours}h)</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{effortHours}h</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={effortHours}
                  aria-label="Esfuerzo"
                  onChange={(e) => setEffortHours(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Horas totales estimadas del equipo (E &gt; 0)</span>
              </div>
            </div>

            {/* Evidence vs Assumptions Notes */}
            <div className="space-y-1">
              <label className="text-zinc-700 dark:text-zinc-400 text-[11px] font-medium">
                Respaldo de Confianza: Evidencias vs Supuestos
              </label>
              <input
                type="text"
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="Ej. Datos de 3 clientes previos (evidencia) / Se asume que no requiere nueva API (supuesto)"
                className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Formula Explainer */}
            <div className="p-2.5 rounded-lg bg-zinc-100/70 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/[0.04] text-[11px] text-zinc-700 dark:text-zinc-400 flex items-center justify-between">
              <span>Fórmula BOWOL Plans: Score = (R × I × C) / E</span>
              <strong className="text-zinc-900 dark:text-white font-mono">
                ({reach} × {impact} × {confidence.toFixed(2)}) / {effortHours} = {computedBowolScore.toFixed(2)} pts
              </strong>
            </div>
          </div>

          {/* Strategic Context & Execution Fields */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Contexto Estratégico & Ejecución
            </h4>

            {/* Problem & Proposal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">Problema que resuelve</label>
                <textarea
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Dolor o fricción de mercado..."
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/[0.1] rounded-xl p-2.5 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 dark:focus:border-white/30 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">Propuesta de solución</label>
                <textarea
                  rows={2}
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Enfoque de valor o producto propuesto..."
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/[0.1] rounded-xl p-2.5 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 dark:focus:border-white/30 resize-none"
                />
              </div>
            </div>

            {/* Segment, Risk, Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1">
                  <Target className="w-3 h-3 text-sky-500 dark:text-sky-400" strokeWidth={1.5} />
                  <span>Segmento Objetivo</span>
                </label>
                <input
                  type="text"
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  placeholder="Ej. Clientes B2B SaaS"
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/[0.1] rounded-xl px-2.5 py-2 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 dark:focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400" strokeWidth={1.5} />
                  <span>Nivel de Riesgo</span>
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/[0.1] rounded-xl px-2.5 py-2 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-cyan-500 dark:focus:border-white/30"
                >
                  <option value="LOW">Bajo (Low)</option>
                  <option value="MEDIUM">Medio (Medium)</option>
                  <option value="HIGH">Alto (High)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1">
                  <User className="w-3 h-3 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />
                  <span>Responsable (Owner)</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ej. Equipo Core"
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/[0.1] rounded-xl px-2.5 py-2 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 dark:focus:border-white/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-t border-zinc-200 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02]">
          {/* Secondary Pipeline Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateHypothesis}
              className="text-xs border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10"
              title="Derivar hipótesis de validación y experimentos"
            >
              <FlaskConical className="w-3.5 h-3.5 mr-1 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
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
                className="text-xs border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10"
              >
                <Rocket className="w-3.5 h-3.5 mr-1 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
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
