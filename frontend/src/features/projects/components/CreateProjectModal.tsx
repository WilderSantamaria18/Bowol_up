import React, { useState, useEffect } from 'react';
import { X, FolderKanban, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Project, ProjectStatus, CreateProjectPayload, UpdateProjectPayload } from '../types';
import { Opportunity } from '@/features/opportunities/types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProjectPayload | UpdateProjectPayload) => Promise<void>;
  projectToEdit?: Project | null;
  opportunities?: Opportunity[];
  initialOpportunityId?: string;
  initialExperimentId?: string;
  isLoading?: boolean;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectToEdit,
  opportunities = [],
  initialOpportunityId,
  initialExperimentId,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [opportunityId, setOpportunityId] = useState(initialOpportunityId || '');
  const [experimentId, setExperimentId] = useState(initialExperimentId || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name || '');
      setDescription(projectToEdit.description || '');
      setStatus(projectToEdit.status || 'PLANNING');
      setStartDate(projectToEdit.startDate || '');
      setEndDate(projectToEdit.endDate || '');
      setOpportunityId(projectToEdit.opportunityId || '');
      setExperimentId(projectToEdit.experimentId || '');
    } else {
      setName('');
      setDescription('');
      setStatus('PLANNING');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setOpportunityId(initialOpportunityId || '');
      setExperimentId(initialExperimentId || '');
    }
    setValidationError(null);
  }, [projectToEdit, isOpen, initialOpportunityId, initialExperimentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('El nombre del proyecto es obligatorio.');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setValidationError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    try {
      setValidationError(null);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        opportunityId: opportunityId || undefined,
        experimentId: experimentId || undefined,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err?.response?.data?.message || err?.message || 'Error al guardar la iniciativa');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-2xl bg-white/95 dark:bg-[#121318]/95 border border-zinc-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
              <FolderKanban className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {projectToEdit ? 'Editar Iniciativa / Proyecto' : 'Nueva Iniciativa de Innovación'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ejecuta oportunidades validadas con trazabilidad estratégica completa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Nombre de la Iniciativa *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Agente Autónomo de Análisis FODA en Tiempo Real"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
              required
            />
          </div>

          {/* Strategic Objective / Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Objetivo Estratégico & Alcance
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe el resultado esperado, hipótesis a consolidar o métricas clave de éxito..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all resize-none"
            />
          </div>

          {/* Status & Opportunity Link Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Estado Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
              >
                <option value="PLANNING">Planificación (PLANNING)</option>
                <option value="ACTIVE">Activo / En Curso (ACTIVE)</option>
                <option value="PAUSED">Pausado (PAUSED)</option>
                <option value="COMPLETED">Completado (COMPLETED)</option>
                <option value="ARCHIVED">Archivado (ARCHIVED)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Oportunidad Vinculada (Origen)
              </label>
              <select
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
              >
                <option value="">Sin vincular a oportunidad</option>
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Fecha Estimada de Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Traceability Note */}
          <div className="p-3.5 rounded-xl bg-orange-500/5 dark:bg-orange-500/[0.03] border border-orange-500/15 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Al guardar, podrás descomponer automáticamente la iniciativa en historias de usuario y tareas de sprint con el <strong>AI Strategic Planner</strong> de BOWOL.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
            >
              {projectToEdit ? 'Actualizar Proyecto' : 'Crear Iniciativa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
