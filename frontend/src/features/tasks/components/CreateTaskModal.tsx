import React, { useState } from 'react';
import { CreateTaskPayload, TaskPriority, TaskStatus } from '../types';
import { X, Check, Clock, AlertCircle } from 'lucide-react';

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
  const [estimateHours, setEstimateHours] = useState<number>(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título de la tarea es requerido');
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
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al crear tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h2 className="text-base font-semibold text-slate-100">
            Nueva Tarea de Backlog
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-slate-100 transition-colors"
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Título de la tarea
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementar autenticación OAuth2 con PKCE"
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Descripción y criterios de aceptación
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles técnicos, endpoints a crear, criterios para darla por terminada..."
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 px-3.5 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="LOW">Baja (LOW)</option>
                <option value="MEDIUM">Media (MEDIUM)</option>
                <option value="HIGH">Alta (HIGH)</option>
                <option value="URGENT">Urgente (URGENT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Estimación (Horas)
              </label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimateHours}
                  onChange={(e) => setEstimateHours(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 pl-10 pr-3.5 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Estado inicial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 px-3.5 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">Por Hacer (TODO)</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="REVIEW">En Revisión</option>
              <option value="DONE">Completada</option>
            </select>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20"
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
