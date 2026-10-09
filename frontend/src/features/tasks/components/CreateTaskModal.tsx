import React, { useState } from 'react';
import { CreateTaskPayload, TaskPriority, TaskStatus } from '../types';
import { X, Check, Clock, AlertCircle, AlertTriangle, PackageCheck, Hourglass } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  projectId: string;
  sprintId?: string | null;
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<any>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  projectId,
  sprintId,
  defaultStatus = 'BACKLOG',
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [estimateHours, setEstimateHours] = useState<number>(3);
  const [area, setArea] = useState<string>('Operaciones');
  const [deliverable, setDeliverable] = useState<string>('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string>('');
  const [externalWaitHours, setExternalWaitHours] = useState<number>(0);
  const [suggestedRole, setSuggestedRole] = useState<string>('');
  const [isUnassigned, setIsUnassigned] = useState<boolean>(true);
  const [isHighUncertainty, setIsHighUncertainty] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título de la tarea es requerido (usa un verbo en infinitivo, ej: Diseñar, Validar, Implementar)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        projectId,
        sprintId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        estimateHours: Number(estimateHours) || 0,
        area: area.trim() || undefined,
        deliverable: deliverable.trim() || undefined,
        acceptanceCriteria: acceptanceCriteria.trim() ? [acceptanceCriteria.trim()] : undefined,
        externalWaitHours: Number(externalWaitHours) || 0,
        assignedRole: suggestedRole.trim() || undefined,
        isHighUncertainty,
      });
      setTitle('');
      setDescription('');
      setDeliverable('');
      setAcceptanceCriteria('');
      setExternalWaitHours(0);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al crear tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 rounded-2xl border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                Fase 3 · BOWOL Plans
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Desglose de Tarea Verificable</span>
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
              Nueva Tarea de Backlog
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Título de la tarea (Usa verbo en infinitivo)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementar autenticación OAuth2 con PKCE"
              className="w-full rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Área Operativa
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-slate-950/60 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Operaciones">Operaciones</option>
                <option value="Marketing">Marketing & Contenido</option>
                <option value="Ventas">Ventas & Clientes</option>
                <option value="Tecnología">Tecnología / Producto</option>
                <option value="Administración">Administración & Finanzas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Rol sugerido
              </label>
              <input
                type="text"
                value={suggestedRole}
                onChange={(e) => setSuggestedRole(e.target.value)}
                placeholder="Ej: Responsable de tienda, Diseñador, Dev..."
                className="w-full rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-slate-950/60 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Esfuerzo de trabajo activo (Horas)
              </label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimateHours}
                  onChange={(e) => setEstimateHours(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-slate-950/60 pl-10 pr-3.5 py-2 text-sm text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Espera externa (Horas/Días pasivos)
              </label>
              <div className="relative">
                <Hourglass className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={externalWaitHours}
                  onChange={(e) => setExternalWaitHours(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-slate-950/60 pl-10 pr-3.5 py-2 text-sm text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Regla 4: No consume horas de trabajo activo.
              </span>
            </div>
          </div>

          {/* Granularity Warning if > 6h & One-Click Decomposition Action */}
          {estimateHours > 6 && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong className="text-amber-950 dark:text-amber-100">Regla BOWOL Plans (Fase 3 — Límite de 6h):</strong>
                  <p className="mt-0.5 text-amber-800 dark:text-amber-200/90 leading-relaxed">
                    Las tareas que excedan 6 horas de trabajo estimado ({estimateHours}h) deben dividirse en partes revisables más pequeñas para facilitar seguimiento y evitar demoras ocultas.
                  </p>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-between border-t border-amber-200 dark:border-amber-500/20">
                <span className="text-[11px] text-amber-900/80 dark:text-amber-300/80">Sugerencia metodológica: 2 bloques de {(estimateHours / 2).toFixed(1)}h</span>
                <button
                  type="button"
                  onClick={() => {
                    const half = Number((estimateHours / 2).toFixed(1));
                    setEstimateHours(half);
                    setDescription((prev) => (prev ? `${prev}\n\n[Parte 1 de 2 desglosada de bloque de ${estimateHours}h]` : `[Parte 1 de 2 desglosada de bloque de ${estimateHours}h]`));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-500/20 hover:bg-amber-300 dark:hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-semibold transition-colors"
                >
                  Ajustar a 1ª mitad ({ (estimateHours / 2).toFixed(1) }h)
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Entregable concreto (Fase 3)
            </label>
            <div className="relative">
              <PackageCheck className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
              <input
                type="text"
                value={deliverable}
                onChange={(e) => setDeliverable(e.target.value)}
                placeholder="Ej: Planilla con 140 pares clasificados con precio, o Catálogo PDF de 6 páginas"
                className="w-full rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-slate-950/60 pl-10 pr-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Criterio de aceptación explícito
            </label>
            <textarea
              rows={2}
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              placeholder="Ej: Cada producto incluido tiene cantidad disponible, talla y precio antes/ahora revisado."
              className="w-full rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-slate-950/60 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-slate-950/60 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="LOW">Baja (LOW)</option>
                <option value="MEDIUM">Media (MEDIUM)</option>
                <option value="HIGH">Alta (HIGH)</option>
                <option value="URGENT">Urgente (URGENT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Estado inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-slate-950/60 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">Por Hacer (TODO)</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="BLOCKED">Bloqueada</option>
                <option value="DONE">Completada</option>
              </select>
            </div>
          </div>

          {/* Toggles for Regla 1 (Incertidumbre) and Regla 8 (Asignación) */}
          <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-slate-950/40 border border-zinc-200 dark:border-white/[0.06] space-y-2 text-xs">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isHighUncertainty}
                onChange={(e) => setIsHighUncertainty(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-900 text-cyan-600 focus:ring-cyan-500"
              />
              <span>Marcar estimación con <strong>alta incertidumbre</strong> (supuestos preliminares por validar)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnassigned}
                onChange={(e) => setIsUnassigned(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-900 text-cyan-600 focus:ring-cyan-500"
              />
              <span>Marcar como <strong>asignación pendiente</strong> (no hay persona disponible confirmada aún)</span>
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 dark:border-white/[0.08] px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              <span>{loading ? 'Creando...' : 'Crear Tarea'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
