import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, CheckCircle2, Clock, ListTodo, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Project, DecomposeProjectResponse } from '../types';
import { projectService } from '../services/projectService';

interface AIDecomposeProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onDecompositionCompleted?: (result: DecomposeProjectResponse) => void;
}

export const AIDecomposeProjectModal: React.FC<AIDecomposeProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onDecompositionCompleted,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DecomposeProjectResponse | null>(null);

  if (!isOpen || !project) return null;

  const handleDecompose = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectService.decomposeProject(project.id);
      setResult(res);
      if (onDecompositionCompleted) {
        onDecompositionCompleted(res);
      }
    } catch (err: any) {
      console.error('Error al descomponer iniciativa con IA:', err);
      setError(err?.response?.data?.message || err?.message || 'Error al ejecutar la descomposición con IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToKanban = () => {
    onClose();
    navigate(`/tasks?projectId=${project.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-white/95 dark:bg-[#121318]/95 border border-zinc-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Descomposición Ágil con IA
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-semibold tracking-wider">
                  AI Planner
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Iniciativa: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{project.name}</span>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-2">
                <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  Objetivo del Proyecto
                </h3>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  {project.description || 'Sin descripción detallada. El modelo utilizará el título de la iniciativa y el perfil corporativo para derivar la arquitectura de tareas.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/5 dark:bg-orange-500/[0.02] border border-orange-500/15 space-y-2 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ¿Cómo funciona el AI Strategic Planner?
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-500 dark:text-zinc-400">
                  <li>Analiza la meta estratégica y desglosa una Épica en historias de usuario técnicas y de negocio.</li>
                  <li>Genera estimaciones de esfuerzo en horas fundamentadas en la complejidad detectada.</li>
                  <li>Asigna prioridades iniciales y crea las tareas directamente en el estado <code>BACKLOG</code>.</li>
                  <li>Preserva la trazabilidad hacia la oportunidad o hipótesis de origen.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-center">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleDecompose}
                  isLoading={loading}
                  className="w-full sm:w-auto shadow-lg shadow-orange-500/20 px-6 py-2.5"
                >
                  <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Generar Desglose de Tareas con IA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Tareas Creadas</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{result.generatedTasksCount}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={1.5} />
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Horas Estimadas</span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">{result.totalEstimatedHours || 0} hrs</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/15 flex items-center gap-3">
                  <ListTodo className="w-5 h-5 text-orange-500 shrink-0" strokeWidth={1.5} />
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Estado Inicial</span>
                    <span className="text-base font-bold text-orange-600 dark:text-orange-400">Backlog Listo</span>
                  </div>
                </div>
              </div>

              {/* Epic info */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-orange-500 font-semibold tracking-wider">
                  Épica Generada
                </span>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{result.epicTitle}</h4>
                {result.epicObjective && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{result.epicObjective}</p>
                )}
              </div>

              {/* Task list preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  Vista Previa de Tareas Generadas ({result.tasks?.length || 0})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {result.tasks?.map((t, idx) => (
                    <div 
                      key={t.id || idx}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{t.title}</p>
                        {t.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{t.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400">
                          {t.priority}
                        </span>
                        {t.estimateHours && (
                          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                            {t.estimateHours}h
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            {result ? 'Cerrar' : 'Cancelar'}
          </Button>

          {result && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleGoToKanban}
              className="gap-2"
            >
              <span>Abrir en Tablero Kanban</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
