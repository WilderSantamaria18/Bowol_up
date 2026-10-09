import React, { useState } from 'react';
import { 
  Clock, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Sparkles, 
  Settings2, 
  Cpu, 
  FileCheck
} from 'lucide-react';
import { RoutineAudit, RoutineStep, RoutineImprovement } from '../types';
import { Button } from '@/components/ui/Button';

interface RoutineAuditSectionProps {
  swotId?: string;
}

const DEFAULT_ROUTINE: RoutineAudit = {
  id: 'routine-1',
  name: 'Cierre y Facturación Semanal a Clientes',
  weeklyFrequency: 1,
  currentMinutesPerRun: 180,
  observedErrorsOrDelays: 'Facturas enviadas con conceptos erróneos por consolidación manual en hojas de cálculo.',
  toolsAndBudget: 'Hojas de cálculo Google Sheets y software contable básico. Sin presupuesto de desarrollo adicional.',
  steps: [
    {
      id: 'step-1',
      name: 'Revisión manual de horas de cada consultor en 3 hojas distintas',
      minutes: 60,
      improvement: 'SIMPLIFICAR',
      justification: 'Unificar las tres hojas en una sola plantilla compartida con validación de datos.',
      savedMinutesWeekly: 35,
      measuredSavings: 30,
      checklist: {
        responsible: 'Coordinador de operaciones',
        input: 'Plantilla única de horas completada por los consultores el viernes a las 17:00',
        output: 'Resumen consolidado listo para emisión',
        reviewPoint: 'Verificar que la suma de horas coincida con el contrato activo',
        exceptionRule: 'Si faltan registros, notificar al consultor con plazo máximo el lunes 09:00'
      }
    },
    {
      id: 'step-2',
      name: 'Generación y envío manual de PDF de factura por correo uno por uno',
      minutes: 90,
      improvement: 'AUTOMATIZAR',
      justification: 'Configurar emisión y envío automático con recordatorio de pago mediante integración nativa.',
      savedMinutesWeekly: 70,
      measuredSavings: 0,
      checklist: {
        responsible: 'Responsable de administración',
        input: 'Resumen de horas aprobado',
        output: 'Facturas emitidas y correos de acuse de recibo generados',
        reviewPoint: 'Auditar los primeros 3 envíos del mes',
        exceptionRule: 'Si la pasarela o API falla, registrar el error y disparar alerta en el canal operativo'
      },
      automationDetails: {
        setupCost: '0 USD (función incluida en el plan actual de facturación)',
        maintenance: '15 minutos mensuales de revisión de logs',
        verificationMethod: 'Enviar factura de prueba con valor 0 y verificar recepción'
      }
    },
    {
      id: 'step-3',
      name: 'Revisión de doble firma en papel físico',
      minutes: 30,
      improvement: 'ELIMINAR',
      justification: 'La aprobación digital en el sistema es legalmente suficiente y el archivo físico no se consulta.',
      savedMinutesWeekly: 30,
      measuredSavings: 30,
      checklist: {
        responsible: 'Director operativo',
        input: 'Confirmación digital en sistema',
        output: 'Estado aprobado',
        reviewPoint: 'Log de auditoría del sistema',
        exceptionRule: 'No aplica (paso eliminado)'
      }
    }
  ],
  updatedAt: new Date().toISOString()
};

export const RoutineAuditSection: React.FC<RoutineAuditSectionProps> = ({ swotId }) => {
  const storageKey = `bowol_routine_audit_${swotId || 'global'}`;

  const [routine, setRoutine] = useState<RoutineAudit>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_ROUTINE;
  });

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<string>(routine.steps[0]?.id || '');
  const [newStepName, setNewStepName] = useState('');

  const saveRoutine = (updated: RoutineAudit) => {
    setRoutine(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Calculations
  const totalWeeklyCurrentMinutes = routine.weeklyFrequency * routine.currentMinutesPerRun;
  const totalWeeklyCurrentHours = (totalWeeklyCurrentMinutes / 60).toFixed(1);

  const totalEstimatedWeeklySavingsMinutes = routine.steps.reduce(
    (acc, st) => acc + (st.savedMinutesWeekly || 0), 0
  );
  const totalEstimatedWeeklySavingsHours = (totalEstimatedWeeklySavingsMinutes / 60).toFixed(1);

  const totalMeasuredSavingsMinutes = routine.steps.reduce(
    (acc, st) => acc + (st.measuredSavings || 0), 0
  );
  const totalMeasuredSavingsHours = (totalMeasuredSavingsMinutes / 60).toFixed(1);

  const handleUpdateStep = (stepId: string, patch: Partial<RoutineStep>) => {
    const updatedSteps = routine.steps.map(s => s.id === stepId ? { ...s, ...patch } : s);
    saveRoutine({ ...routine, steps: updatedSteps, updatedAt: new Date().toISOString() });
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepName.trim()) return;

    const newStep: RoutineStep = {
      id: `step-${Date.now()}`,
      name: newStepName.trim(),
      minutes: 30,
      improvement: 'SIMPLIFICAR',
      justification: 'Oportunidad de optimización identificada en la auditoría de rutina.',
      savedMinutesWeekly: 15,
      checklist: {
        responsible: 'Responsable asignado',
        input: 'Datos de inicio',
        output: 'Entregable final',
        reviewPoint: 'Control de calidad',
        exceptionRule: 'Plan de contingencia'
      }
    };

    saveRoutine({
      ...routine,
      steps: [...routine.steps, newStep],
      updatedAt: new Date().toISOString()
    });
    setNewStepName('');
    setActiveStepTab(newStep.id);
  };

  const handleRemoveStep = (stepId: string) => {
    const filtered = routine.steps.filter(s => s.id !== stepId);
    saveRoutine({ ...routine, steps: filtered, updatedAt: new Date().toISOString() });
    if (activeStepTab === stepId && filtered.length > 0) {
      setActiveStepTab(filtered[0].id);
    }
  };

  const currentStep = routine.steps.find(s => s.id === activeStepTab) || routine.steps[0];

  const getImprovementBadge = (imp: RoutineImprovement) => {
    switch (imp) {
      case 'ELIMINAR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">ELIMINAR</span>;
      case 'SIMPLIFICAR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30">SIMPLIFICAR</span>;
      case 'ESTANDARIZAR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">ESTANDARIZAR</span>;
      case 'AUTOMATIZAR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">AUTOMATIZAR</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                Fase 1.2 · Auditoría de Rutina
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Optimización de tareas repetitivas para liberar capacidad real
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
              {routine.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditingMeta(!isEditingMeta)}
              className="text-xs"
            >
              <Settings2 className="w-3.5 h-3.5 mr-1.5" />
              {isEditingMeta ? 'Cerrar Edición' : 'Editar Parámetros'}
            </Button>
          </div>
        </div>

        {/* Metadata Editor */}
        {isEditingMeta && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.08] space-y-4 shadow-sm dark:shadow-none">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nombre de la Rutina</label>
                <input
                  type="text"
                  value={routine.name}
                  onChange={(e) => saveRoutine({ ...routine, name: e.target.value })}
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Frecuencia por Semana</label>
                <input
                  type="number"
                  min={1}
                  value={routine.weeklyFrequency}
                  onChange={(e) => saveRoutine({ ...routine, weeklyFrequency: Number(e.target.value) || 1 })}
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Minutos por Ejecución</label>
                <input
                  type="number"
                  min={5}
                  value={routine.currentMinutesPerRun}
                  onChange={(e) => saveRoutine({ ...routine, currentMinutesPerRun: Number(e.target.value) || 30 })}
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Errores o Demoras Observados</label>
                <textarea
                  value={routine.observedErrorsOrDelays}
                  onChange={(e) => saveRoutine({ ...routine, observedErrorsOrDelays: e.target.value })}
                  rows={2}
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Herramientas y Presupuesto</label>
                <textarea
                  value={routine.toolsAndBudget}
                  onChange={(e) => saveRoutine({ ...routine, toolsAndBudget: e.target.value })}
                  rows={2}
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3 Metric cards: Tiempo actual vs Ahorro Estimado vs Ahorro Medido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/[0.06] space-y-1 shadow-sm dark:shadow-none">
            <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
              Consumo Semanal Actual
            </span>
            <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {totalWeeklyCurrentHours}h <span className="text-xs font-normal text-zinc-500">({totalWeeklyCurrentMinutes} min)</span>
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {routine.weeklyFrequency}x por semana &times; {routine.currentMinutesPerRun} min/vez
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-500/[0.05] border border-sky-200 dark:border-sky-500/20 space-y-1 shadow-sm dark:shadow-none">
            <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Ahorro Estimado Semanal
            </span>
            <p className="text-xl font-bold font-mono text-sky-800 dark:text-sky-300">
              {totalEstimatedWeeklySavingsHours}h <span className="text-xs font-normal text-sky-600/80 dark:text-sky-400/80">({totalEstimatedWeeklySavingsMinutes} min)</span>
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Potencial liberable aplicando mejoras de BOWOL Plans
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/[0.05] border border-emerald-200 dark:border-emerald-500/20 space-y-1 shadow-sm dark:shadow-none">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Ahorro Medido Real
            </span>
            <p className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
              {totalMeasuredSavingsHours}h <span className="text-xs font-normal text-emerald-600/80 dark:text-emerald-400/80">({totalMeasuredSavingsMinutes} min)</span>
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Diferenciado de la estimación según regla 1.2
            </p>
          </div>
        </div>
      </div>

      {/* Routine Steps & BOWOL Classification (Eliminar, Simplificar, Estandarizar, Automatizar) */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              Desglose de Pasos y Acciones de Mejora
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Clasifica cada paso según el marco BOWOL: Eliminar, Simplificar, Estandarizar o Automatizar
            </p>
          </div>

          {/* Add step form */}
          <form onSubmit={handleAddStep} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nombre del nuevo paso..."
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              className="text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <Button type="submit" variant="primary" size="sm" className="text-xs gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </Button>
          </form>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200/80 dark:border-white/[0.06] pb-3">
          {routine.steps.map((st, index) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setActiveStepTab(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeStepTab === st.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.05]'
              }`}
            >
              <span className="font-mono text-[10px] opacity-60">#{index + 1}</span>
              <span className="max-w-[140px] truncate">{st.name}</span>
              {getImprovementBadge(st.improvement)}
            </button>
          ))}
        </div>

        {/* Active Step Details */}
        {currentStep && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Acción Recomendada (BOWOL)</label>
                <select
                  value={currentStep.improvement}
                  onChange={(e) => handleUpdateStep(currentStep.id, { improvement: e.target.value as RoutineImprovement })}
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="ELIMINAR">ELIMINAR (No aporta valor al cliente ni al control)</option>
                  <option value="SIMPLIFICAR">SIMPLIFICAR (Reducir pasos, campos o clics)</option>
                  <option value="ESTANDARIZAR">ESTANDARIZAR (Crear plantilla y regla clara)</option>
                  <option value="AUTOMATIZAR">AUTOMATIZAR (Ejecutar por software / webhook)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Minutos por Ejecución Actual</label>
                <input
                  type="number"
                  min={1}
                  value={currentStep.minutes}
                  onChange={(e) => handleUpdateStep(currentStep.id, { minutes: Number(e.target.value) || 0 })}
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Ahorro Semanal Estimado (min)</label>
                <input
                  type="number"
                  min={0}
                  value={currentStep.savedMinutesWeekly}
                  onChange={(e) => handleUpdateStep(currentStep.id, { savedMinutesWeekly: Number(e.target.value) || 0 })}
                  className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Justificación de la Mejora</label>
              <textarea
                value={currentStep.justification}
                onChange={(e) => handleUpdateStep(currentStep.id, { justification: e.target.value })}
                rows={2}
                className="w-full text-xs bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Checklist Breve (Fase 1.2 BOWOL Plans) */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/[0.06] space-y-3 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Checklist Operativo de la Rutina
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Regla 1.2: Entrada, Salida y Excepción</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 text-[11px]">Responsable Designado:</label>
                  <input
                    type="text"
                    value={currentStep.checklist?.responsible || ''}
                    onChange={(e) => handleUpdateStep(currentStep.id, {
                      checklist: { ...currentStep.checklist!, responsible: e.target.value }
                    })}
                    placeholder="Ej. Coordinador de operaciones"
                    className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 text-[11px]">Entrada Requerida (Input):</label>
                  <input
                    type="text"
                    value={currentStep.checklist?.input || ''}
                    onChange={(e) => handleUpdateStep(currentStep.id, {
                      checklist: { ...currentStep.checklist!, input: e.target.value }
                    })}
                    placeholder="Ej. Plantilla de horas firmada"
                    className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 text-[11px]">Salida Verificable (Output):</label>
                  <input
                    type="text"
                    value={currentStep.checklist?.output || ''}
                    onChange={(e) => handleUpdateStep(currentStep.id, {
                      checklist: { ...currentStep.checklist!, output: e.target.value }
                    })}
                    placeholder="Ej. Factura emitida en PDF"
                    className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 text-[11px]">Punto de Revisión:</label>
                  <input
                    type="text"
                    value={currentStep.checklist?.reviewPoint || ''}
                    onChange={(e) => handleUpdateStep(currentStep.id, {
                      checklist: { ...currentStep.checklist!, reviewPoint: e.target.value }
                    })}
                    placeholder="Ej. Comprobar suma con contrato"
                    className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-600 dark:text-zinc-400 text-[11px]">Qué hacer ante una excepción (Plan de contingencia):</label>
                <input
                  type="text"
                  value={currentStep.checklist?.exceptionRule || ''}
                  onChange={(e) => handleUpdateStep(currentStep.id, {
                    checklist: { ...currentStep.checklist!, exceptionRule: e.target.value }
                  })}
                  placeholder="Ej. Si faltan datos, notificar inmediatamente por canal operativo antes de las 10:00"
                  className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 mt-1 text-xs"
                />
              </div>
            </div>

            {/* Si es AUTOMATIZAR: Requisitos de Automatización */}
            {currentStep.improvement === 'AUTOMATIZAR' && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/[0.04] border border-emerald-200 dark:border-emerald-500/20 space-y-3 shadow-sm dark:shadow-none">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Condiciones de Automatización (BOWOL Plans 1.2)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-600 dark:text-zinc-400 text-[11px]">Coste de puesta en marcha:</label>
                    <input
                      type="text"
                      value={currentStep.automationDetails?.setupCost || ''}
                      onChange={(e) => handleUpdateStep(currentStep.id, {
                        automationDetails: {
                          setupCost: e.target.value,
                          maintenance: currentStep.automationDetails?.maintenance || '',
                          verificationMethod: currentStep.automationDetails?.verificationMethod || '',
                        }
                      })}
                      placeholder="Ej. 0 USD / 2h de config"
                      className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-600 dark:text-zinc-400 text-[11px]">Coste de mantenimiento:</label>
                    <input
                      type="text"
                      value={currentStep.automationDetails?.maintenance || ''}
                      onChange={(e) => handleUpdateStep(currentStep.id, {
                        automationDetails: {
                          setupCost: currentStep.automationDetails?.setupCost || '',
                          maintenance: e.target.value,
                          verificationMethod: currentStep.automationDetails?.verificationMethod || '',
                        }
                      })}
                      placeholder="Ej. 15 min al mes de log review"
                      className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-600 dark:text-zinc-400 text-[11px]">Cómo comprobar que funciona:</label>
                    <input
                      type="text"
                      value={currentStep.automationDetails?.verificationMethod || ''}
                      onChange={(e) => handleUpdateStep(currentStep.id, {
                        automationDetails: {
                          setupCost: currentStep.automationDetails?.setupCost || '',
                          maintenance: currentStep.automationDetails?.maintenance || '',
                          verificationMethod: e.target.value,
                        }
                      })}
                      placeholder="Ej. Enviar test webhook con datos ficticios"
                      className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Delete step button */}
            {routine.steps.length > 1 && (
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStep(currentStep.id)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Eliminar este paso de la rutina
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
