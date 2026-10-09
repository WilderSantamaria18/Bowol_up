import React, { useState } from 'react';
import { Task, UpdateTaskStatusPayload } from '../types';
import { CheckCircle2, ShieldCheck, Link2, UserCheck, X, AlertCircle } from 'lucide-react';

interface CompleteTaskGatekeeperModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: (taskId: string, payload: UpdateTaskStatusPayload) => Promise<void>;
  onMoveToReview?: (taskId: string) => Promise<void>;
}

export const CompleteTaskGatekeeperModal: React.FC<CompleteTaskGatekeeperModalProps> = ({
  isOpen,
  task,
  onClose,
  onConfirm,
  onMoveToReview,
}) => {
  const [meetsCriteria, setMeetsCriteria] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetsCriteria) {
      setError('Debes certificar que el entregable cumple con los criterios de aceptación.');
      return;
    }
    if (!evidence.trim()) {
      setError('Debes incluir la evidencia tangible del entregable (URL, link, doc o referencia).');
      return;
    }
    if (!reviewer.trim()) {
      setError('Indica el nombre o rol de quien revisó y aprobó la entrega.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(task.id, {
        status: 'DONE',
        acceptanceEvidence: evidence.trim(),
        acceptanceReviewedBy: reviewer.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al completar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToReview = async () => {
    if (!onMoveToReview) return;
    setIsSubmitting(true);
    try {
      await onMoveToReview(task.id);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al mover a revisión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-white dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Puerta de Cierre con Criterios
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400/90 font-medium">
                Regla BOWOL Plans 2.0 (Fase 6.2 - Verificación de Entregable)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="mt-4 p-3 rounded-xl bg-zinc-100 dark:bg-slate-950/60 border border-zinc-200 dark:border-white/5">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Tarea a Cerrar
          </span>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mt-0.5 line-clamp-1">
            {task.title}
          </p>
        </div>

        {/* Methodology Tip */}
        <div className="mt-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-xs text-cyan-800 dark:text-cyan-300 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-cyan-600 dark:text-cyan-400" />
          <p>
            Una actividad pasa a <strong>LISTO</strong> únicamente cuando el entregable ha sido revisado contra su criterio de aceptación y cuenta con evidencia tangible comprobable.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Checklist Verification */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-950/70 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-colors">
            <input
              type="checkbox"
              checked={meetsCriteria}
              onChange={(e) => setMeetsCriteria(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500/30"
            />
            <span className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              <strong>Verificación de entrega:</strong> El entregable está 100% finalizado y cumple con el criterio de aceptación establecido en el plan.
            </span>
          </label>

          {/* Evidence input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Evidencia tangible del entregable <span className="text-emerald-600 dark:text-emerald-400">*</span></span>
            </label>
            <input
              type="text"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Ej: https://docs.google.com/... o Archivo 'presupuesto_v2.xlsx' en carpeta compartida"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Reviewer input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-slate-400" />
              <span>Persona / Rol que revisó y aprobó <span className="text-emerald-600 dark:text-emerald-400">*</span></span>
            </label>
            <input
              type="text"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              placeholder="Ej: Maria (Líder Operaciones) / Dueño del negocio"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {onMoveToReview && (
              <button
                type="button"
                onClick={handleSendToReview}
                disabled={isSubmitting}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline underline-offset-4"
                title="Si aún no está revisada por otra persona, muévela a 'En Revisión'"
              >
                Mover a 'En Revisión' en su lugar
              </button>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !meetsCriteria}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSubmitting ? 'Verificando...' : 'Aceptar y Marcar LISTO'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
