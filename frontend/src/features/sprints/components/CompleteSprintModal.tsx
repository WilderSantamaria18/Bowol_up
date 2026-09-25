import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Sprint, CompleteSprintPayload } from '../types';

interface CompleteSprintModalProps {
  sprint: Sprint | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CompleteSprintPayload) => void;
  plannedSprints?: Sprint[];
  isLoading?: boolean;
}

export const CompleteSprintModal: React.FC<CompleteSprintModalProps> = ({
  sprint,
  isOpen,
  onClose,
  onSubmit,
  plannedSprints = [],
  isLoading = false,
}) => {
  const [destination, setDestination] = useState<'BACKLOG' | string>('BACKLOG');

  if (!isOpen || !sprint) return null;

  const totalTasks = sprint.totalTasks ?? 0;
  const completedTasks = sprint.completedTasks ?? 0;
  const pendingTasks = Math.max(0, totalTasks - completedTasks);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination === 'BACKLOG') {
      onSubmit({ moveToBacklog: true });
    } else {
      onSubmit({ moveToSprintId: destination, moveToBacklog: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Completar {sprint.name}</h2>
              <p className="text-xs text-zinc-400">Cierre de ciclo y rollover de tareas pendientes</p>
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
          {/* Summary Box */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <span className="text-[11px] text-zinc-400 block mb-0.5">Tareas Completadas</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {completedTasks} / {totalTasks}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block mb-0.5">Tareas Incompletas</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {pendingTasks}
              </span>
            </div>
          </div>

          {pendingTasks > 0 ? (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Destino para las {pendingTasks} tareas pendientes:
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="BACKLOG">Mover al Backlog del Proyecto</option>
                {plannedSprints
                  .filter((s) => s.id !== sprint.id && s.status === 'PLANNED')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      Mover a {s.name}
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">
                Las tareas completadas permanecerán archivadas en el historial de este sprint para el cálculo de velocidad.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" strokeWidth={1.5} />
              <span>¡Excelente trabajo! Todas las tareas comprometidas en este sprint fueron finalizadas con éxito.</span>
            </div>
          )}

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {isLoading ? 'Cerrando...' : 'Confirmar Cierre de Sprint'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
