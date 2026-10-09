import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, ShieldCheck, Edit3, Check, Copy, Clock, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { planningService } from '@/features/planning/services/planningService';

interface WeeklyPriorityFocusBannerProps {
  projectId?: string;
  projectName?: string;
  sprintName?: string;
  totalTasks?: number;
  totalHours?: number;
}

export const WeeklyPriorityFocusBanner: React.FC<WeeklyPriorityFocusBannerProps> = ({
  projectId = 'default',
  projectName = 'Iniciativa Actual',
  sprintName,
  totalTasks = 0,
  totalHours = 0,
}) => {
  const storageKey = `bowol_weekly_focus_${projectId}`;

  const [weeklyDeliverable, setWeeklyDeliverable] = useState(
    'Completar y publicar el catálogo digital validado con precios y link directo a WhatsApp.'
  );
  const [identifiedRisk, setIdentifiedRisk] = useState(
    'Demora del cliente en aprobar la lista de descuentos o saturación operativa en atención.'
  );
  const [mitigationPlan, setMitigationPlan] = useState(
    'Fijar fecha límite de aprobación a 48h y contar con 2 alternativas de precios pre-aprobadas.'
  );

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (projectId && projectId !== 'default') {
      planningService.getWeeklyFocusBanner(projectId)
        .then((banner) => {
          if (!isMounted) return;
          if (banner) {
            if (banner.weeklyDeliverable) setWeeklyDeliverable(banner.weeklyDeliverable);
            if (banner.identifiedRisk) setIdentifiedRisk(banner.identifiedRisk);
            if (banner.mitigationPlan) setMitigationPlan(banner.mitigationPlan);
            return;
          }
          // fallback to local draft if none in server
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.weeklyDeliverable) setWeeklyDeliverable(parsed.weeklyDeliverable);
              if (parsed.identifiedRisk) setIdentifiedRisk(parsed.identifiedRisk);
              if (parsed.mitigationPlan) setMitigationPlan(parsed.mitigationPlan);
            }
          } catch {
            // ignore
          }
        })
        .catch(() => {
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.weeklyDeliverable) setWeeklyDeliverable(parsed.weeklyDeliverable);
              if (parsed.identifiedRisk) setIdentifiedRisk(parsed.identifiedRisk);
              if (parsed.mitigationPlan) setMitigationPlan(parsed.mitigationPlan);
            }
          } catch {
            // ignore
          }
        });
    } else {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.weeklyDeliverable) setWeeklyDeliverable(parsed.weeklyDeliverable);
          if (parsed.identifiedRisk) setIdentifiedRisk(parsed.identifiedRisk);
          if (parsed.mitigationPlan) setMitigationPlan(parsed.mitigationPlan);
        }
      } catch {
        // ignore
      }
    }
    return () => {
      isMounted = false;
    };
  }, [projectId, storageKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectId && projectId !== 'default') {
      try {
        await planningService.saveWeeklyFocusBanner(projectId, {
          weeklyDeliverable,
          identifiedRisk,
          mitigationPlan,
        });
        localStorage.removeItem(storageKey);
      } catch (err) {
        console.error('Error guardando foco semanal en servidor:', err);
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            weeklyDeliverable,
            identifiedRisk,
            mitigationPlan,
            updatedAt: new Date().toISOString(),
          })
        );
      }
    } else {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            weeklyDeliverable,
            identifiedRisk,
            mitigationPlan,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore
      }
    }
    setIsEditing(false);
  };

  const handleCopyFocus = () => {
    const text = `🎯 FOCO SEMANAL — BOWOL PLANS 2.0 (${projectName}${sprintName ? ` · ${sprintName}` : ''})
• Entregable Prioritario: ${weeklyDeliverable}
• Riesgo que podría impedirlo: ${identifiedRisk}
• Plan de Mitigación: ${mitigationPlan}
• Capacidad Planificada: ${totalTasks} tareas (${totalHours}h)
• Regla WIP: Máximo 1 tarea activa por colaborador a la vez`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-gradient-to-r from-orange-500/[0.04] via-amber-500/[0.03] to-cyan-500/[0.04] p-4 sm:p-5 backdrop-blur-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/60 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <Target className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20">
                Fase 5.1 · BOWOL Plans
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Entregable Prioritario de la Semana & Riesgo Crítico
              </span>
              {totalTasks > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" />
                  <span>{totalTasks} tareas</span>
                  <Clock className="w-2.5 h-2.5 ml-1" />
                  <span>{totalHours}h</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopyFocus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white/60 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            title="Copiar resumen del foco semanal para Daily Check-in o WhatsApp"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{copied ? 'Copiado' : 'Copiar Foco'}</span>
          </button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs h-7 px-3 gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancelar' : 'Ajustar Foco'}</span>
          </Button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
              🎯 Entregable Prioritario de la Semana (Resultado único innegociable)
            </label>
            <input
              type="text"
              required
              value={weeklyDeliverable}
              onChange={(e) => setWeeklyDeliverable(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-zinc-900/80 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-orange-500 focus:outline-none"
              placeholder="Ej: Catálogo digital en PDF validado y respuestas rápidas de WhatsApp listas..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                ⚠️ Riesgo que podría impedirlo
              </label>
              <input
                type="text"
                required
                value={identifiedRisk}
                onChange={(e) => setIdentifiedRisk(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-zinc-900/80 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-amber-500 focus:outline-none"
                placeholder="Ej: Demora del cliente en autorizar precios..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1">
                🛡️ Plan de Mitigación / Acción Inmediata
              </label>
              <input
                type="text"
                required
                value={mitigationPlan}
                onChange={(e) => setMitigationPlan(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-zinc-900/80 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 focus:outline-none"
                placeholder="Ej: Enviar propuesta con 48h de antelación..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" variant="primary" size="sm" className="gap-1.5 text-xs">
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Foco de la Semana</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Priority Deliverable Card */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              Entregable Prioritario
            </span>
            <p className="text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
              {weeklyDeliverable}
            </p>
          </div>

          {/* Risk Card */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-900/50 border border-amber-500/20 dark:border-amber-500/20 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              Riesgo que Amenaza la Entrega
            </span>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {identifiedRisk}
            </p>
          </div>

          {/* Mitigation Card */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-900/50 border border-cyan-500/20 dark:border-cyan-500/20 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Plan de Mitigación
            </span>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {mitigationPlan}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
