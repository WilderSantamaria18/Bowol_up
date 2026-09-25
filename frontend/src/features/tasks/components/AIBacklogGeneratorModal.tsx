import React, { useState } from 'react';
import { DecomposeProjectResponse } from '../types';
import { Sparkles, CheckCircle2, Clock, Layers, ArrowRight, X, AlertCircle } from 'lucide-react';

interface AIBacklogGeneratorModalProps {
  isOpen: boolean;
  projectName: string;
  onClose: () => void;
  onGenerate: () => Promise<DecomposeProjectResponse>;
}

export const AIBacklogGeneratorModal: React.FC<AIBacklogGeneratorModalProps> = ({
  isOpen,
  projectName,
  onClose,
  onGenerate,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecomposeProjectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartDecomposition = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await onGenerate();
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error durante la descomposición con IA');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.1] bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                AI Backlog Decomposer
              </h2>
              <p className="text-xs text-slate-400">
                Transforma el alcance de {projectName} en un plan técnico ejecutable
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
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

        {/* Content State 1: Ready to generate */}
        {!result && !loading && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-cyan-500/15 bg-cyan-950/20 p-4">
              <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
                ¿Qué generará el motor de inferencia?
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>Descomposición estructurada en tareas de Backend, Frontend, Arquitectura y Calidad.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>Estimación de horas de ingeniería por tarea con priorización objetiva.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>Criterios de aceptación detallados y títulos en infinitivo para inserción directa en el backlog.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartDecomposition}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 text-xs font-medium text-slate-950 hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                <span>Generar Backlog con IA</span>
              </button>
            </div>
          </div>
        )}

        {/* Content State 2: Loading State */}
        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center py-10 text-center">
            <div className="relative mb-5 flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
              <div className="h-12 w-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
              <Sparkles className="absolute h-5 w-5 text-cyan-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              Analizando iniciativa y generando tareas técnicas...
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Estructurando modelo de datos, endpoints REST, componentes React y estimaciones de esfuerzo.
            </p>
          </div>
        )}

        {/* Content State 3: Result Preview */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Backlog Generado Exitosamente
                </span>
              </div>
              <h3 className="text-sm font-medium text-slate-100 mt-1">
                {result.epicTitle}
              </h3>
              {result.epicObjective && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {result.epicObjective}
                </p>
              )}

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" strokeWidth={1.5} />
                  <span>{result.generatedTasksCount} tareas creadas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.5} />
                  <span>{result.totalEstimatedHours}h estimadas en total</span>
                </div>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {result.tasks.map((task, idx) => (
                <div
                  key={task.id || idx}
                  className="rounded-lg border border-white/[0.06] bg-slate-950/40 p-3 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <h5 className="font-medium text-slate-200">{task.title}</h5>
                    {task.description && (
                      <p className="text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] rounded px-1.5 py-0.5 border border-white/[0.08] text-slate-400">
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-medium">
                      {task.estimateHours}h
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-medium text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                <span>Ver en el Tablero</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
