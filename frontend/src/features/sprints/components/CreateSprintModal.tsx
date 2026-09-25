import React, { useState } from 'react';
import { X, Flag, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateSprintPayload, AiSprintPlanResponse } from '../types';
import { sprintService } from '../services/sprintService';

interface CreateSprintModalProps {
  isOpen: boolean;
  projectId?: string;
  onClose: () => void;
  onSubmit: (payload: CreateSprintPayload) => void;
  isLoading?: boolean;
}

export const CreateSprintModal: React.FC<CreateSprintModalProps> = ({
  isOpen,
  projectId,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(inTwoWeeks);
  const [dateError, setDateError] = useState('');
  const [isPlanningAi, setIsPlanningAi] = useState(false);
  const [aiPlan, setAiPlan] = useState<AiSprintPlanResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAiPlan = async () => {
    if (!projectId) return;
    setIsPlanningAi(true);
    setAiError(null);
    try {
      const plan = await sprintService.planSprintWithAi(projectId);
      setAiPlan(plan);
      if (plan.sprintName) setName(plan.sprintName);
      if (plan.sprintGoal) setGoal(plan.sprintGoal);
      if (plan.suggestedDurationDays) {
        const end = new Date(Date.now() + plan.suggestedDurationDays * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        setEndDate(end);
      }
    } catch (err: any) {
      setAiError(err?.response?.data?.message || err.message || 'Error al generar plan con IA');
    } finally {
      setIsPlanningAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (endDate < startDate) {
      setDateError('La fecha de fin no puede ser anterior a la de inicio');
      return;
    }

    onSubmit({
      name: name.trim(),
      goal: goal.trim() || undefined,
      startDate,
      endDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Flag className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Planificar Nuevo Sprint</h2>
              <p className="text-xs text-zinc-400">Define el ciclo de iteración y objetivo ágil</p>
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

        {/* AI Sprint Planning Banner */}
        {projectId && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <span className="text-xs font-medium text-orange-300 block">AI Sprint Planner</span>
                <span className="text-[11px] text-zinc-400 block">Sugerir meta SMART y selección de tareas del backlog</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAiPlan}
              disabled={isPlanningAi}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-500/30 transition-all flex items-center gap-1.5 shrink-0"
            >
              {isPlanningAi ? (
                <>
                  <span className="w-3 h-3 border-2 border-orange-300 border-t-transparent rounded-full animate-spin" />
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-orange-400" strokeWidth={1.5} />
                  <span>Sugerir Plan IA</span>
                </>
              )}
            </button>
          </div>
        )}

        {aiError && (
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>{aiError}</span>
          </div>
        )}

        {aiPlan && (
          <div className="mt-3 p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs text-zinc-300 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-orange-300 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                Plan sugerido por Agile Coach IA
              </span>
              <span>{aiPlan.suggestedDurationDays} días (~{aiPlan.totalEstimatedHours || 0} hrs)</span>
            </div>
            <p className="text-[11px] text-zinc-400 italic">"{aiPlan.rationale}"</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nombre del Sprint *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="p. ej. Sprint 1: Autenticación y Módulo Core"
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Objetivo del Sprint (Sprint Goal)
            </label>
            <textarea
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="¿Qué valor entregará este sprint al cliente o usuario final?"
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Fecha Inicio *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateError('');
                }}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Fecha Fin *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateError('');
                }}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {dateError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
              {dateError}
            </p>
          )}

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !name.trim()}
              className="bg-orange-600 hover:bg-orange-500 text-white"
            >
              {isLoading ? 'Creando...' : 'Crear Sprint'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
