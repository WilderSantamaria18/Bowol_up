import React, { useState } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateCalendarEventPayload, CalendarEventType } from '../types';
import { Project } from '@/features/projects/types';

interface CreateEventModalProps {
  isOpen: boolean;
  projects?: Project[];
  onClose: () => void;
  onSubmit: (payload: CreateCalendarEventPayload) => void;
  isLoading?: boolean;
}

const COLORS = [
  { id: 'orange', label: 'Naranja', bg: 'bg-orange-500' },
  { id: 'purple', label: 'Púrpura', bg: 'bg-purple-500' },
  { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500' },
  { id: 'sky', label: 'Cielo', bg: 'bg-sky-500' },
  { id: 'amber', label: 'Ámbar', bg: 'bg-amber-500' },
  { id: 'rose', label: 'Rosa', bg: 'bg-rose-500' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  projects = [],
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('MILESTONE');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [color, setColor] = useState('purple');
  const [projectId, setProjectId] = useState<string>('');
  const [dateError, setDateError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (endDate && endDate < startDate) {
      setDateError('La fecha de fin no puede ser anterior a la de inicio');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      eventType,
      startDate,
      endDate: endDate || startDate,
      color,
      projectId: projectId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <CalendarIcon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Nuevo Hito / Evento</h2>
              <p className="text-xs text-zinc-400">Agrega un punto de control o fecha clave al roadmap</p>
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
              Título del Evento o Hito *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="p. ej. Lanzamiento Demo MVP / Reunión Directorio Q3"
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Tipo de Entrada
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              >
                <option value="MILESTONE">Hito Estratégico (Milestone)</option>
                <option value="KEY_EVENT">Evento Clave (Key Event)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Proyecto Asociado (Opcional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              >
                <option value="">Ninguno (General Organización)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
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
                Fecha Fin
              </label>
              <input
                type="date"
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

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Color Distintivo
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-6 h-6 rounded-full ${c.bg} transition-all ${
                    color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Descripción o Notas
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre entregables, asistentes o agenda..."
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-orange-600 hover:bg-orange-500 text-white"
            >
              {isLoading ? 'Guardando...' : 'Crear Evento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
