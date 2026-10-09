import React, { useState, useEffect } from 'react';
import { 
  Target, 
  CheckCircle2, 
  Edit3, 
  Save, 
  ShieldAlert, 
  UserCheck, 
  Scale,
  CloudUpload
} from 'lucide-react';
import { Project } from '../types';
import { Button } from '@/components/ui/Button';
import { planningService } from '@/features/planning/services/planningService';

interface SmartProjectCharterProps {
  project: Project;
  onUpdateProject?: (updates: Partial<Project>) => void;
}

export interface BowolSmartCharterData {
  problemAddressed: string;
  smartObjective: string;
  measurableKpi: string;
  baseline: {
    value: string;
    unit: string;
    date: string;
    isProvisional: boolean;
  };
  target: {
    value: string;
    unit: string;
    deadline: string;
  };
  measurementSource: string;
  ownerDecisionRequired: boolean;
  ownerDecisionDetails: string;
  technicalDeliverables: string[];
  expectedCommercialResult: string;
  inScope: string[];
  outOfScope: string[];
  restrictions: string[];
  updatedAt: string;
}

const getDefaultCharter = (project: Project): BowolSmartCharterData => ({
  problemAddressed: project.description || 'Falta de un proceso estandarizado y medible para la conversión de prospectos calificados.',
  smartObjective: `Completar la implementación operativa de ${project.name} en el periodo acordado asegurando trazabilidad de extremo a extremo.`,
  measurableKpi: 'Tasa de conversión de oportunidades validadas a clientes cerrados',
  baseline: {
    value: '12%',
    unit: 'tasa porcentual',
    date: project.startDate || '2026-09-01',
    isProvisional: false,
  },
  target: {
    value: '25%',
    unit: 'tasa porcentual',
    deadline: project.endDate || '2026-11-30',
  },
  measurementSource: 'Reporte quincenal de analítica del embudo y panel de control BOWOL',
  ownerDecisionRequired: true,
  ownerDecisionDetails: 'Aprobación del presupuesto de difusión comercial e integración de pasarela',
  technicalDeliverables: [
    'Embudo digital configurado con 4 etapas y reglas de transición',
    'Plantillas de comunicación estandarizadas y validadas por el equipo',
    'Cuadro de mando con cálculo automático de conversión'
  ],
  expectedCommercialResult: 'Incrementar la facturación recurrente mensual en un 20% al finalizar el primer trimestre de uso (medición posterior al cierre de tareas).',
  inScope: [
    'Configuración técnica del flujo en la plataforma',
    'Capacitación operativa de 2 horas al equipo responsable',
    'Medición de los primeros 30 días de datos en vivo'
  ],
  outOfScope: [
    'Desarrollo de módulos a medida no contemplados en la cartera',
    'Campañas publicitarias pagadas no aprobadas en presupuesto',
    'Soporte técnico de infraestructura fuera de la plataforma BOWOL'
  ],
  restrictions: [
    'Máximo 10 horas de dedicación semanal por persona del equipo',
    'Sin contratación de consultoría externa durante este ciclo'
  ],
  updatedAt: new Date().toISOString(),
});

export const SmartProjectCharter: React.FC<SmartProjectCharterProps> = ({ project }) => {
  const storageKey = `bowol_smart_charter_${project.id}`;

  const [charter, setCharter] = useState<BowolSmartCharterData>(() => getDefaultCharter(project));
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BowolSmartCharterData>(charter);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalDraftPendingMigration, setHasLocalDraftPendingMigration] = useState(false);

  useEffect(() => {
    let isMounted = true;
    planningService.getProjectCharter(project.id)
      .then((remote) => {
        if (!isMounted) return;
        if (remote && remote.smartObjective) {
          const mapped: BowolSmartCharterData = {
            problemAddressed: remote.problemAddressed || '',
            smartObjective: remote.smartObjective || '',
            measurableKpi: remote.measurableKpi || '',
            baseline: {
              value: remote.baselineValue || '',
              unit: remote.baselineUnit || '',
              date: remote.baselineDate || project.startDate || '',
              isProvisional: !!remote.baselineIsProvisional,
            },
            target: {
              value: remote.targetValue || '',
              unit: remote.targetUnit || '',
              deadline: remote.targetDeadline || project.endDate || '',
            },
            measurementSource: remote.measurementSource || '',
            ownerDecisionRequired: !!remote.ownerDecisionRequired,
            ownerDecisionDetails: remote.ownerDecisionDetails || '',
            technicalDeliverables: remote.technicalDeliverables || [],
            expectedCommercialResult: remote.expectedCommercialResult || '',
            inScope: remote.inScope || [],
            outOfScope: remote.outOfScope || [],
            restrictions: remote.restrictions || [],
            updatedAt: remote.updatedAt || new Date().toISOString(),
          };
          setCharter(mapped);
          setFormData(mapped);
          setHasLocalDraftPendingMigration(false);
        } else {
          // If server does not have it yet, check localStorage for existing draft to offer migration without silent data loss
          try {
            const localSaved = localStorage.getItem(storageKey);
            if (localSaved) {
              const parsed = JSON.parse(localSaved);
              setCharter(parsed);
              setFormData(parsed);
              setHasLocalDraftPendingMigration(true);
            }
          } catch {
            // fallback
          }
        }
      })
      .catch((err) => {
        console.warn('Fallback a almacenamiento local de charter:', err);
        try {
          const localSaved = localStorage.getItem(storageKey);
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            setCharter(parsed);
            setFormData(parsed);
          }
        } catch {
          // fallback
        }
      });

    return () => {
      isMounted = false;
    };
  }, [project.id, storageKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const remotePayload = {
        projectId: project.id,
        problemAddressed: formData.problemAddressed,
        smartObjective: formData.smartObjective,
        measurableKpi: formData.measurableKpi,
        baselineValue: formData.baseline.value,
        baselineUnit: formData.baseline.unit,
        baselineDate: formData.baseline.date || null,
        baselineIsProvisional: formData.baseline.isProvisional,
        targetValue: formData.target.value,
        targetUnit: formData.target.unit,
        targetDeadline: formData.target.deadline || null,
        measurementSource: formData.measurementSource,
        ownerDecisionRequired: formData.ownerDecisionRequired,
        ownerDecisionDetails: formData.ownerDecisionDetails,
        technicalDeliverables: formData.technicalDeliverables,
        expectedCommercialResult: formData.expectedCommercialResult,
        inScope: formData.inScope,
        outOfScope: formData.outOfScope,
        restrictions: formData.restrictions,
      };

      const saved = await planningService.saveProjectCharter(project.id, remotePayload);
      const updated: BowolSmartCharterData = {
        ...formData,
        updatedAt: saved.updatedAt || new Date().toISOString(),
      };
      setCharter(updated);
      setFormData(updated);
      setHasLocalDraftPendingMigration(false);
      localStorage.removeItem(storageKey); // Cleaned from local storage because server is now source of truth
      setIsEditing(false);
    } catch (err) {
      console.error('Error al guardar Ficha SMART en servidor:', err);
      // Guardar respaldo temporal en local para no perder datos ante problemas de red
      localStorage.setItem(storageKey, JSON.stringify(formData));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMigrateDraft = async () => {
    setIsSaving(true);
    try {
      const remotePayload = {
        projectId: project.id,
        problemAddressed: charter.problemAddressed,
        smartObjective: charter.smartObjective,
        measurableKpi: charter.measurableKpi,
        baselineValue: charter.baseline.value,
        baselineUnit: charter.baseline.unit,
        baselineDate: charter.baseline.date || null,
        baselineIsProvisional: charter.baseline.isProvisional,
        targetValue: charter.target.value,
        targetUnit: charter.target.unit,
        targetDeadline: charter.target.deadline || null,
        measurementSource: charter.measurementSource,
        ownerDecisionRequired: charter.ownerDecisionRequired,
        ownerDecisionDetails: charter.ownerDecisionDetails,
        technicalDeliverables: charter.technicalDeliverables,
        expectedCommercialResult: charter.expectedCommercialResult,
        inScope: charter.inScope,
        outOfScope: charter.outOfScope,
        restrictions: charter.restrictions,
      };
      await planningService.saveProjectCharter(project.id, remotePayload);
      localStorage.removeItem(storageKey);
      setHasLocalDraftPendingMigration(false);
    } catch (err) {
      console.error('Error migrando borrador local a servidor:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
              Fase 2.1 · Ficha SMART de Proyecto
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Metodología BOWOL Plans · Regla 6: Entregables vs Resultado Comercial
            </span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
            Definición Operativa, Métricas y Límites de Alcance
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(charter);
                setIsEditing(true);
              }}
              className="text-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Editar Ficha SMART
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

      {hasLocalDraftPendingMigration && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <CloudUpload className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Se detectó un borrador previo en tu navegador. Sincronízalo con el servidor para que tu equipo pueda colaborar.</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isSaving}
            onClick={handleMigrateDraft}
            className="text-xs h-7 px-3 bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-900 dark:text-amber-100 shrink-0"
          >
            {isSaving ? 'Sincronizando...' : 'Sincronizar al Servidor'}
          </Button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Problema Atendido (del diagnóstico)</label>
              <textarea
                value={formData.problemAddressed}
                onChange={(e) => setFormData({ ...formData, problemAddressed: e.target.value })}
                rows={2}
                className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Objetivo SMART</label>
              <textarea
                value={formData.smartObjective}
                onChange={(e) => setFormData({ ...formData, smartObjective: e.target.value })}
                rows={2}
                className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Indicador Medible (KPI)</label>
              <input
                type="text"
                value={formData.measurableKpi}
                onChange={(e) => setFormData({ ...formData, measurableKpi: e.target.value })}
                className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Línea Base (Valor, Unidad, Fecha)</label>
              <div className="flex gap-1.5 mt-1">
                <input
                  type="text"
                  placeholder="Valor"
                  value={formData.baseline.value}
                  onChange={(e) => setFormData({
                    ...formData,
                    baseline: { ...formData.baseline, value: e.target.value }
                  })}
                  className="w-1/2 bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-2 py-1.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Fecha"
                  value={formData.baseline.date}
                  onChange={(e) => setFormData({
                    ...formData,
                    baseline: { ...formData.baseline, date: e.target.value }
                  })}
                  className="w-1/2 bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-2 py-1.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Meta Cuantitativa & Fecha Límite</label>
              <div className="flex gap-1.5 mt-1">
                <input
                  type="text"
                  placeholder="Meta"
                  value={formData.target.value}
                  onChange={(e) => setFormData({
                    ...formData,
                    target: { ...formData.target, value: e.target.value }
                  })}
                  className="w-1/2 bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-2 py-1.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Fecha límite"
                  value={formData.target.deadline}
                  onChange={(e) => setFormData({
                    ...formData,
                    target: { ...formData.target, deadline: e.target.value }
                  })}
                  className="w-1/2 bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-2 py-1.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Fuente de Medición</label>
              <input
                type="text"
                value={formData.measurementSource}
                onChange={(e) => setFormData({ ...formData, measurementSource: e.target.value })}
                className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Decisión que Requiere Aprobación del Dueño</label>
              <input
                type="text"
                value={formData.ownerDecisionDetails}
                onChange={(e) => setFormData({ ...formData, ownerDecisionDetails: e.target.value })}
                className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Regla 6: Entregables vs Resultado Comercial */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-white/[0.08] space-y-3 shadow-sm dark:shadow-none">
            <span className="font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              Regla 6 de BOWOL Plans: Separar Entregables Técnicos vs Resultado Comercial
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-700 dark:text-zinc-300">Entregables Técnicos (separados por salto de línea):</label>
                <textarea
                  value={formData.technicalDeliverables.join('\n')}
                  onChange={(e) => setFormData({
                    ...formData,
                    technicalDeliverables: e.target.value.split('\n').filter(Boolean)
                  })}
                  rows={3}
                  className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-zinc-700 dark:text-zinc-300">Resultado Comercial Esperado (No prometido como garantizado):</label>
                <textarea
                  value={formData.expectedCommercialResult}
                  onChange={(e) => setFormData({ ...formData, expectedCommercialResult: e.target.value })}
                  rows={3}
                  className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Alcance Dentro vs Fuera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-emerald-700 dark:text-emerald-400">Dentro del Alcance (In Scope - por línea):</label>
              <textarea
                value={formData.inScope.join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  inScope: e.target.value.split('\n').filter(Boolean)
                })}
                rows={3}
                className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="font-semibold text-rose-700 dark:text-rose-400">Fuera del Alcance (Out of Scope - por línea):</label>
              <textarea
                value={formData.outOfScope.join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  outOfScope: e.target.value.split('\n').filter(Boolean)
                })}
                rows={3}
                className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white mt-1 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" variant="primary" size="sm">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Guardar Ficha SMART
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5 text-xs">
          {/* Problema y Objetivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/[0.06] space-y-1 shadow-sm dark:shadow-none">
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Problema Atendido (Fase 1)
              </span>
              <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">{charter.problemAddressed}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/[0.06] space-y-1 shadow-sm dark:shadow-none">
              <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                Objetivo SMART
              </span>
              <p className="text-zinc-900 dark:text-zinc-200 leading-relaxed font-medium">{charter.smartObjective}</p>
            </div>
          </div>

          {/* Fila de Métricas: Línea Base vs Meta y Fuente */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/[0.06] space-y-1 shadow-sm dark:shadow-none">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Indicador (KPI)</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{charter.measurableKpi}</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500">Fuente: {charter.measurementSource}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/[0.06] space-y-1 shadow-sm dark:shadow-none">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase flex items-center justify-between">
                <span>Línea Base Inicial</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-200/70 dark:bg-white/5 text-zinc-700 dark:text-zinc-400">
                  {charter.baseline.date}
                </span>
              </span>
              <p className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-200">
                {charter.baseline.value} <span className="text-xs font-normal text-zinc-500">{charter.baseline.unit}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-500/[0.05] border border-orange-200 dark:border-orange-500/20 space-y-1 shadow-sm dark:shadow-none">
              <span className="text-[10px] font-mono text-orange-700 dark:text-orange-400 uppercase flex items-center justify-between">
                <span>Meta a Alcanzar</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-100 dark:bg-orange-500/10 text-orange-800 dark:text-orange-400 font-medium">
                  {charter.target.deadline}
                </span>
              </span>
              <p className="text-lg font-bold font-mono text-orange-700 dark:text-orange-400">
                {charter.target.value} <span className="text-xs font-normal text-zinc-500">{charter.target.unit}</span>
              </p>
            </div>
          </div>

          {/* Regla 6 BOWOL Plans: Entregables vs Resultado Comercial */}
          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/[0.08] space-y-3 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-orange-600 dark:text-orange-500" />
                Separación Metodológica (Regla 6 BOWOL Plans)
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Completar entregables &ne; Prometer resultados de venta
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Entregables Verificables del Proyecto
                </span>
                <ul className="space-y-1">
                  {charter.technicalDeliverables.map((del, i) => (
                    <li key={i} className="text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Efecto / Resultado Comercial Esperado
                </span>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 text-zinc-800 dark:text-zinc-300 leading-relaxed">
                  {charter.expectedCommercialResult}
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 italic">
                  * Se evalúa en la retrospectiva posterior sin declarar éxito únicamente por terminar tareas técnicas.
                </p>
              </div>
            </div>
          </div>

          {/* Delimitación de Alcance: Dentro vs Fuera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-500/[0.03] border border-emerald-200 dark:border-emerald-500/20 space-y-2 shadow-sm dark:shadow-none">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Dentro del Alcance (In Scope)
              </span>
              <ul className="space-y-1">
                {charter.inScope.map((item, i) => (
                  <li key={i} className="text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-500/[0.03] border border-rose-200 dark:border-rose-500/20 space-y-2 shadow-sm dark:shadow-none">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                Fuera del Alcance (Out of Scope - Blindaje)
              </span>
              <ul className="space-y-1">
                {charter.outOfScope.map((item, i) => (
                  <li key={i} className="text-zinc-700 dark:text-zinc-400 flex items-start gap-1.5">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">&times;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Aprobación del dueño y Restricciones */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-300">Decisión del Dueño:</span>
                <span className="text-zinc-600 dark:text-zinc-400 ml-1.5">{charter.ownerDecisionDetails}</span>
              </div>
            </div>
            {charter.restrictions.length > 0 && (
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-500">
                Restricción: {charter.restrictions[0]}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
