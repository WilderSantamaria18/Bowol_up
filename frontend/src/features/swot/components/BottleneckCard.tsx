import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Edit3, 
  Save, 
  Sparkles, 
  TrendingDown,
  Clock,
  FlaskConical
} from 'lucide-react';
import { BottleneckDiagnostic } from '../types';
import { Button } from '@/components/ui/Button';

interface BottleneckCardProps {
  swotId?: string;
  onConvertToOpportunity?: (title: string, description: string) => void;
  onConvertToHypothesis?: (statement: string) => void;
}

const DEFAULT_BOTTLENECK: BottleneckDiagnostic = {
  id: 'bottleneck-default',
  title: 'Capacidad de Cierre Comercial y Respuesta a Prospectos',
  symptom: 'Prospectos calificados pasan más de 48 horas sin respuesta en el embudo comercial.',
  rootCause: 'El responsable de ventas divide su tiempo con la entrega operativa de proyectos sin un protocolo de triage diario.',
  isEvidenceBacked: true,
  evidenceNotes: 'Registros de CRM muestran 14 prospectos perdidos en las últimas 3 semanas con tiempo medio de primera respuesta de 52h.',
  validationPlan: 'Monitorear los primeros 10 leads entrantes de la próxima semana registrando hora de entrada y hora de contacto.',
  priorityActions: [
    {
      id: 'A-1',
      action: 'Definir plantilla y protocolo de primera respuesta en menos de 2 horas',
      deliverable: 'Guía de respuesta rápida de 1 página con 3 plantillas',
      estimatedHours: 3
    },
    {
      id: 'A-2',
      action: 'Asignar ventana horaria fija diaria para atención comercial',
      deliverable: 'Bloque de calendario de 10:00 a 11:30 reservado sin operaciones',
      estimatedHours: 1
    }
  ],
  updatedAt: new Date().toISOString()
};

export const BottleneckCard: React.FC<BottleneckCardProps> = ({
  swotId,
  onConvertToOpportunity,
  onConvertToHypothesis,
}) => {
  const storageKey = `bowol_bottleneck_${swotId || 'global'}`;

  const [data, setData] = useState<BottleneckDiagnostic>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback default
    }
    return DEFAULT_BOTTLENECK;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BottleneckDiagnostic>(data);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);
        setFormData(parsed);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setData(formData);
    localStorage.setItem(storageKey, JSON.stringify(formData));
    setIsEditing(false);
  };

  const handleToggleEvidence = () => {
    const updated = {
      ...data,
      isEvidenceBacked: !data.isEvidenceBacked,
      updatedAt: new Date().toISOString()
    };
    setData(updated);
    setFormData(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-orange-500/30 bg-white/90 dark:bg-zinc-900/60 bg-gradient-to-br from-orange-500/[0.05] via-transparent to-red-500/[0.03] shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background ambient flare */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-white/[0.08] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <TrendingDown className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                Fase 1.1 · Diagnóstico Operativo
              </span>
              <button
                type="button"
                onClick={handleToggleEvidence}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors inline-flex items-center gap-1 ${
                  data.isEvidenceBacked
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                }`}
                title="Haga clic para alternar entre hecho con evidencia e hipótesis por validar"
              >
                {data.isEvidenceBacked ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Con Evidencia Respaldada</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Hipótesis por Validar</span>
                  </>
                )}
              </button>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
              Cuello de Botella Principal del Negocio
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(data);
                setIsEditing(true);
              }}
              className="text-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              Editar Diagnóstico
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-xs text-zinc-500 dark:text-zinc-400"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Content View / Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4 pt-4 relative z-10">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nombre del Cuello de Botella</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Síntoma Observado (Efecto visible)
              </label>
              <textarea
                value={formData.symptom}
                onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                rows={2}
                className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Causa Raíz Operativa (No deducir en automático)
              </label>
              <textarea
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                rows={2}
                className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Evidencias Registradas (Métricas y periodo)
              </label>
              <textarea
                value={formData.evidenceNotes}
                onChange={(e) => setFormData({ ...formData, evidenceNotes: e.target.value })}
                rows={2}
                className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Plan para Comprobarlo si falta evidencia
              </label>
              <textarea
                value={formData.validationPlan}
                onChange={(e) => setFormData({ ...formData, validationPlan: e.target.value })}
                rows={2}
                className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="submit" variant="primary" size="sm">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Guardar Diagnóstico
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5 pt-4 relative z-10">
          <div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{data.title}</h4>
          </div>

          {/* Grid: Síntoma vs Causa Raíz */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-white/[0.06] space-y-1.5 shadow-sm dark:shadow-none">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Síntoma Visible
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{data.symptom}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-white/[0.06] space-y-1.5 shadow-sm dark:shadow-none">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Causa Raíz Operativa
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{data.rootCause}</p>
            </div>
          </div>

          {/* Evidencias vs Plan de comprobación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.05] space-y-1">
              <span className="font-semibold text-zinc-700 dark:text-zinc-400">Evidencias Disponibles:</span>
              <p className="text-zinc-800 dark:text-zinc-300">{data.evidenceNotes || 'Sin evidencias numéricas registradas todavía.'}</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.05] space-y-1">
              <span className="font-semibold text-zinc-700 dark:text-zinc-400">Cómo Comprobarlo si faltan datos:</span>
              <p className="text-zinc-800 dark:text-zinc-300">{data.validationPlan || 'Ejecutar prueba controlada de 5 días con registro manual.'}</p>
            </div>
          </div>

          {/* Acciones iniciales de BOWOL Plans */}
          {data.priorityActions && data.priorityActions.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Acciones Iniciales Inmediatas (Máx. 3 acciones realizables)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {data.priorityActions.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs shadow-sm dark:shadow-none">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-200">{act.action}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Entregable: {act.deliverable}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 shrink-0 ml-2">
                      ~{act.estimatedHours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de conversión a fases posteriores */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-200/80 dark:border-white/[0.04]">
            {onConvertToHypothesis && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onConvertToHypothesis(`Validar si resolver ${data.title} desbloquea el flujo operativo`)}
                className="text-xs gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                <span>Formular como Hipótesis</span>
              </Button>
            )}
            {onConvertToOpportunity && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onConvertToOpportunity(`Desbloquear: ${data.title}`, `Plan para eliminar el cuello de botella: ${data.rootCause}`)}
                className="text-xs gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Convertir en Oportunidad RICE</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
