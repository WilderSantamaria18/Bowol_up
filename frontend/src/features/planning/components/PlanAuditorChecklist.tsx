import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface CheckItem {
  id: string;
  question: string;
  description: string;
  actionIfNo: string;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: 'c1',
    question: '1. ¿Usa datos de mi negocio y marca lo desconocido?',
    description: 'La respuesta de la IA debe reflejar los hechos de la Ficha (sector, herramientas, equipo) y no inventar métricas ficticias ni ventas asumidas.',
    actionIfNo: 'Pídele a la IA: "Reemplaza los supuestos con datos de mi ficha o márcalos explícitamente como [desconocido]".',
  },
  {
    id: 'c2',
    question: '2. ¿Cada tarea tiene un entregable y un criterio para revisarlo?',
    description: 'Cada actividad debe indicar exactamente qué artefacto o resultado tangible se revisará (ej: documento, catálogo, planilla, confirmación de cliente).',
    actionIfNo: 'Pídele a la IA: "Añade a cada tarea un entregable tangible y un criterio de aceptación medible".',
  },
  {
    id: 'c3',
    question: '3. ¿Hay una persona disponible para ejecutarla?',
    description: 'No asignar tareas a roles teóricos que no existen en el equipo. Si no hay persona disponible, debe marcarse como "Asignación pendiente".',
    actionIfNo: 'Revisa si el equipo tiene las habilidades y tiempo necesario o si debes posponer la tarea.',
  },
  {
    id: 'c4',
    question: '4. ¿Las horas caben en la capacidad real (con reserva del 20%)?',
    description: 'La suma de horas de las tareas no debe superar las horas disponibles del equipo descontando la reserva de imprevistos recomendada (20%).',
    actionIfNo: 'Reduce el alcance de la semana o amplía el plazo; no sobrecargues al equipo.',
  },
  {
    id: 'c5',
    question: '5. ¿Las dependencias y esperas permiten cumplir las fechas?',
    description: 'Verificar que las tareas que dependen de aprobación de terceros, pagos o llegada de insumos contemplen tiempos de espera sin bloquear el resto.',
    actionIfNo: 'Separa el tiempo de trabajo activo de la espera pasiva de aprobación externa.',
  },
  {
    id: 'c6',
    question: '6. ¿Los scores RICE usan la misma escala y tienen justificación?',
    description: 'Alcance de 1 a 10 con umbrales comunes, Impacto de 1 a 3, Confianza de 0 a 1 y Esfuerzo en horas reales mayor a 0.',
    actionIfNo: 'Recalcula el Score usando la fórmula: Score = (R * I * C) / E sin inventar confianza alta sin evidencia.',
  },
  {
    id: 'c7',
    question: '7. ¿Distingue entrega terminada de resultado comercial obtenido?',
    description: 'Completar un entregable (ej: publicar un post o catálogo) no garantiza automáticamente ventas; ambos deben medirse por separado.',
    actionIfNo: 'Asegura que el éxito de la tarea sea la entrega verificada y define un indicador comercial aparte.',
  },
  {
    id: 'c8',
    question: '8. ¿Queda claro qué fue aprobado y qué es una propuesta?',
    description: 'Las decisiones críticas (precios, pauta, cambios de procesos) requieren visto bueno del dueño antes de comprometerse.',
    actionIfNo: 'Marca explícitamente como "Propuesta provisional" todo lo que no haya sido aprobado por el responsable.',
  },
];

export const PlanAuditorChecklist: React.FC = () => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedIds).filter(Boolean).length;
  const isAllApproved = completedCount === CHECKLIST_ITEMS.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Auditor de Calidad del Plan
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-semibold">
              Sección 10 · BOWOL Plans
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Comprobación rápida de 8 puntos antes de comprometer el plan o repartir tareas al equipo. Asegura que la respuesta de ChatGPT/Claude sea viable, sin datos inventados ni sobrecarga.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Progreso:</span>
          <span className={`px-2.5 py-1 rounded-lg font-bold border ${
            isAllApproved 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-zinc-200 dark:bg-white/10 border-zinc-300 dark:border-white/10 text-zinc-800 dark:text-zinc-200'
          }`}>
            {completedCount} / {CHECKLIST_ITEMS.length} verificados
          </span>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = !!checkedIds[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-2 ${
                isChecked
                  ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10'
                  : 'bg-white dark:bg-[#121318] border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className={`text-xs font-bold leading-snug ${
                  isChecked ? 'text-emerald-800 dark:text-emerald-300' : 'text-zinc-900 dark:text-white'
                }`}>
                  {item.question}
                </h4>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                  isChecked
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}>
                  {isChecked && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>

              <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {item.description}
              </p>

              {!isChecked && (
                <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.04] text-[10.5px] font-mono text-orange-600 dark:text-orange-400">
                  ⚡ Si es NO: {item.actionIfNo}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Box */}
      {isAllApproved ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-xs font-semibold">
            ¡Plan 100% verificado según las reglas de BOWOL Plans 2.0! Tu equipo puede iniciar la ejecución con total confianza.
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Aún quedan puntos sin verificar. Si alguna respuesta es NO, usa el prompt de revisión de la Pestaña 2 antes de comprometer el plan.
          </span>
        </div>
      )}
    </div>
  );
};
