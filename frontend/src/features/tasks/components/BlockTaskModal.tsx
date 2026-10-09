import React, { useState } from 'react';
import { Task, UpdateTaskStatusPayload } from '../types';
import { AlertTriangle, Calendar, User, ShieldAlert, X } from 'lucide-react';

interface BlockTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: (taskId: string, payload: UpdateTaskStatusPayload) => Promise<void>;
}

export const BlockTaskModal: React.FC<BlockTaskModalProps> = ({
  isOpen,
  task,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [resolver, setResolver] = useState('');
  const [reviewDate, setReviewDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('La causa concreta del bloqueo es obligatoria');
      return;
    }
    if (!resolver.trim()) {
      setError('El responsable de resolver el bloqueo es obligatorio');
      return;
    }
    if (!reviewDate) {
      setError('La fecha de próxima revisión es obligatoria');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(task.id, {
        status: 'BLOCKED',
        blockedReason: reason.trim(),
        blockedResolver: resolver.trim(),
        blockedReviewDate: reviewDate,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al bloquear la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-red-300 dark:border-red-500/30 bg-white dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Protocolo de Bloqueo Operativo
              </h3>
              <p className="text-xs text-red-600 dark:text-red-400/90 font-medium">
                Regla BOWOL Plans 2.0 (Fase 5.3 & 6.1)
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
            Tarea afectada
          </span>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mt-0.5 line-clamp-1">
            {task.title}
          </p>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p>
            En la metodología BOWOL, una tarea no se queda en «bloqueada» indefinidamente. Requiere causa documentada, persona asignada para resolver el obstáculo y una fecha próxima de revisión.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Causa concreta del bloqueo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Falta aprobación de presupuesto del cliente / Esperando credenciales de API externa..."
              rows={3}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-red-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>2. Responsable de resolverlo <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                value={resolver}
                onChange={(e) => setResolver(e.target.value)}
                placeholder="Ej: Carlos (Líder técnico) / Dueño"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>3. Próxima revisión <span className="text-red-500">*</span></span>
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>{isSubmitting ? 'Registrando...' : 'Confirmar Bloqueo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
