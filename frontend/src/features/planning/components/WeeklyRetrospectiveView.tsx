import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  Plus,
  Trash2,
  TrendingUp,
  Save,
  FolderKanban,
} from 'lucide-react';
import { WeeklyRetrospectiveImprovement } from '@/features/tasks/types';
import { planningService } from '../services/planningService';
import { httpClient } from '@/services/http';
import { Button } from '@/components/ui/Button';

interface ProjectOption {
  id: string;
  name: string;
}

export const WeeklyRetrospectiveView: React.FC = () => {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [weekLabel, setWeekLabel] = useState('Semana Actual — Sprint Operativo');
  const [committedTasks, setCommittedTasks] = useState(0);
  const [acceptedTasks, setAcceptedTasks] = useState(0);
  const [blockedTasks, setBlockedTasks] = useState(0);
  const [reviewPendingTasks, setReviewPendingTasks] = useState(0);

  const [estimatedHours, setEstimatedHours] = useState(0);
  const [actualHours, setActualHours] = useState(0);

  const [businessMetricResult, setBusinessMetricResult] = useState('');
  const [businessMetricDate, setBusinessMetricDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const [whatWorked, setWhatWorked] = useState('');
  const [delayCauses, setDelayCauses] = useState('');

  const [improvements, setImprovements] = useState<WeeklyRetrospectiveImprovement[]>([]);
  const [copied, setCopied] = useState(false);

  // 1. Cargar proyectos de la organización
  useEffect(() => {
    let isMounted = true;
    httpClient.get('/projects')
      .then((res: any) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res.content || [];
        setProjects(list.map((p: any) => ({ id: p.id, name: p.name })));
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      })
      .catch((err) => {
        console.warn('Error cargando proyectos para retrospectiva:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Cargar métricas reales y notas anteriores cuando cambia el proyecto
  useEffect(() => {
    if (!selectedProjectId) return;
    let isMounted = true;
    setIsLoadingMetrics(true);
    setErrorMessage(null);

    Promise.all([
      planningService.getRetrospectiveMetrics(selectedProjectId),
      planningService.getWeeklyRetrospectives(selectedProjectId),
    ])
      .then(([metrics, pastRetros]) => {
        if (!isMounted) return;

        // Cargar métricas reales de tareas de la base de datos
        if (metrics) {
          setCommittedTasks(metrics.committedTasks || 0);
          setAcceptedTasks(metrics.acceptedTasks || 0);
          setBlockedTasks(metrics.blockedTasks || 0);
          setReviewPendingTasks(metrics.reviewPendingTasks || 0);
          setEstimatedHours(Number(metrics.estimatedHours || 0));
          setActualHours(Number(metrics.actualHours || 0));
        }

        // Si existen retrospectivas previas, cargar las notas más recientes
        if (pastRetros && pastRetros.length > 0) {
          const latest = pastRetros[0];
          if (latest.weekLabel) setWeekLabel(latest.weekLabel);
          if (latest.businessMetricResult) setBusinessMetricResult(latest.businessMetricResult);
          if (latest.businessMetricDate) setBusinessMetricDate(latest.businessMetricDate);
          if (latest.whatWorked) setWhatWorked(latest.whatWorked);
          if (latest.delayCauses) setDelayCauses(latest.delayCauses);
          if (latest.improvements && latest.improvements.length > 0) {
            setImprovements(
              latest.improvements.map((imp: any) => ({
                action: imp.action || '',
                owner: imp.owner || 'Responsable',
                dueDate: imp.dueDate || new Date().toISOString().split('T')[0],
              }))
            );
          }
        }
      })
      .catch((err) => {
        console.error('Error cargando métricas de retrospectiva:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMetrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  // Cálculos matemáticos y regla "no aplica"
  const completionRatio = committedTasks > 0 ? (acceptedTasks / committedTasks) * 100 : 0;
  const hoursDiff = actualHours - estimatedHours;

  const handleAddImprovement = () => {
    if (improvements.length >= 3) return; // Máximo 3 mejoras según regla Fase 6.2
    setImprovements([
      ...improvements,
      {
        action: '',
        owner: 'Responsable',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      },
    ]);
  };

  const handleUpdateImprovement = (index: number, field: keyof WeeklyRetrospectiveImprovement, value: string) => {
    const next = [...improvements];
    next[index] = { ...next[index], [field]: value };
    setImprovements(next);
  };

  const handleRemoveImprovement = (index: number) => {
    setImprovements(improvements.filter((_, i) => i !== index));
  };

  const handleSaveRetrospective = async () => {
    if (!selectedProjectId) {
      setErrorMessage('Selecciona un proyecto antes de guardar la retrospectiva');
      return;
    }
    if (improvements.length > 3) {
      setErrorMessage('Según BOWOL Plans 2.0 (Fase 6.2), se admite un máximo de 3 mejoras concretas');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await planningService.saveWeeklyRetrospective({
        projectId: selectedProjectId,
        weekLabel,
        committedTasks,
        acceptedTasks,
        blockedTasks,
        reviewPendingTasks,
        estimatedHours,
        actualHours,
        businessMetricResult,
        businessMetricDate,
        whatWorked,
        delayCauses,
        improvements: improvements.map((imp) => ({
          action: imp.action,
          owner: imp.owner,
          dueDate: imp.dueDate,
        })),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error guardando retrospectiva en backend:', err);
      setErrorMessage(err.message || 'Error guardando en el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportMarkdown = () => {
    const improvementsText =
      improvements.length > 0
        ? improvements
            .map((imp, idx) => `${idx + 1}. **${imp.action}** — Responsable: ${imp.owner} | Fecha: ${imp.dueDate}`)
            .join('\n')
        : '_Sin compromisos de mejora registrados._';

    const completionText =
      committedTasks > 0
        ? `${acceptedTasks}/${committedTasks} (${completionRatio.toFixed(1)}%)`
        : 'No aplica (sin tareas comprometidas en el periodo)';

    const markdown = `# BOWOL Plans 2.0 — Acta de Retrospectiva Semanal (15 Minutos)
**Periodo:** ${weekLabel}
**Proyecto:** ${projects.find((p) => p.id === selectedProjectId)?.name || 'General'}
**Fecha de Cierre:** ${new Date().toLocaleDateString()}

### 1. Balance de Tareas y Horas
- **Tareas comprometidas:** ${committedTasks}
- **Tareas aceptadas con evidencia (DONE):** ${acceptedTasks}
- **Tareas pendientes de revisión:** ${reviewPendingTasks}
- **Tareas bloqueadas:** ${blockedTasks}
- **Cumplimiento de compromisos:** ${completionText}
- **Horas estimadas vs reales:** ${estimatedHours}h est. vs ${actualHours}h reales (${hoursDiff >= 0 ? `+${hoursDiff}h de desviación` : `${hoursDiff}h`})

### 2. Resultado Comercial vs Entregable Técnico
> *Regla BOWOL:* Separar terminar tareas de haber obtenido el efecto deseado en el negocio.
- **Resultado del indicador de negocio:** ${businessMetricResult || 'Pendiente de medición posterior'}
- **Fecha de comprobación de métrica comercial:** ${businessMetricDate}

### 3. Aprendizajes y Evidencias
- **Qué funcionó:** ${whatWorked || 'Sin notas'}
- **Qué causó demoras (hechos verificados vs hipótesis):** ${delayCauses || 'Sin demoras registradas'}

### 4. Acuerdos de Mejora para la Próxima Semana (Máximo 3)
${improvementsText}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Asistente de Retrospectiva y Cierre Semanal
            </h2>
            <span className="inline-flex items-center rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:text-orange-400">
              Fase 6.2 (15 Minutos)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Cierra la semana evaluando entregables aceptados con evidencia, separando el trabajo técnico del resultado comercial, y acordando máximo 3 mejoras para el siguiente ciclo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {projects.length > 0 && (
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs">
              <FolderKanban className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-zinc-900 dark:text-white font-medium focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-zinc-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-slate-200 border border-zinc-200/80 dark:border-transparent text-xs font-semibold transition-colors shrink-0 shadow-sm dark:shadow-none"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? '¡Copiada!' : 'Copiar Acta'}</span>
          </button>

          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={handleSaveRetrospective}
            className="flex items-center gap-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Guardada</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Guardar en Servidor'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Metrics Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ratio Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-900/50 border border-emerald-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-slate-400">
            <span>Cumplimiento Semanal</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            {committedTasks > 0 ? `${completionRatio.toFixed(0)}%` : 'No aplica'}
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-1">
            {committedTasks > 0
              ? `${acceptedTasks} de ${committedTasks} tareas aceptadas`
              : 'Sin tareas comprometidas en el periodo'}
          </p>
        </div>

        {/* Pending / Blocked */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-900/50 border border-amber-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-slate-400">
            <span>Revisión & Bloqueos</span>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400 font-mono">
            {reviewPendingTasks} / {blockedTasks}
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-1">
            {reviewPendingTasks} en revisión, {blockedTasks} bloqueadas
          </p>
        </div>

        {/* Hours Diff */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-zinc-200/80 dark:border-zinc-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Estimado vs Real</span>
            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {actualHours}h <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ {estimatedHours}h</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {hoursDiff > 0 ? `+${hoursDiff}h de desviación` : 'Dentro de lo estimado'}
          </p>
        </div>

        {/* Commercial effect */}
        <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-slate-900/50 border border-orange-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-orange-800 dark:text-slate-400">
            <span>Efecto en el Negocio</span>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
            {businessMetricResult || 'Pendiente de medición posterior al cierre'}
          </p>
          <p className="text-[10px] text-orange-700 dark:text-orange-400/90 mt-1 font-mono font-medium">
            Fecha de comprobación: {businessMetricDate}
          </p>
        </div>
      </div>

      {/* Main 4-Step Form */}
      <div className="space-y-5 p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-none">
        {/* Step 1: Week Label and Task Counts */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Balance de Entregables del Ciclo (Datos Reales de Tareas)
            </h3>
            {isLoadingMetrics && (
              <span className="text-[11px] text-orange-500 ml-2 animate-pulse">Cargando métricas del servidor...</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Nombre / Periodo</label>
              <input
                type="text"
                value={weekLabel}
                onChange={(e) => setWeekLabel(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Tareas Comprometidas</label>
              <input
                type="number"
                min="0"
                value={committedTasks}
                onChange={(e) => setCommittedTasks(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Tareas Aceptadas con Evidencia (DONE)</label>
              <input
                type="number"
                min="0"
                value={acceptedTasks}
                onChange={(e) => setAcceptedTasks(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">En Revisión</label>
              <input
                type="number"
                min="0"
                value={reviewPendingTasks}
                onChange={(e) => setReviewPendingTasks(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Bloqueadas</label>
              <input
                type="number"
                min="0"
                value={blockedTasks}
                onChange={(e) => setBlockedTasks(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Horas Estimadas</label>
              <input
                type="number"
                min="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Horas Reales</label>
              <input
                type="number"
                min="0"
                value={actualHours}
                onChange={(e) => setActualHours(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Commercial Outcome vs Deliverable */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
              2
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Efecto en el Negocio vs Entregables Técnicos
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-auto font-mono">
              Regla Metodológica BOWOL Plans 2.0 (Fase 6.2)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                Resultado Comercial Observado o Estado Pendiente de Medición
              </label>
              <input
                type="text"
                value={businessMetricResult}
                onChange={(e) => setBusinessMetricResult(e.target.value)}
                placeholder="Ej: Aumentó la conversión en un 12% (o 'Pendiente de medición a 30 días post-cierre')"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                Fecha de Medición Comercial
              </label>
              <input
                type="date"
                value={businessMetricDate}
                onChange={(e) => setBusinessMetricDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 3: What Worked and Delay Causes */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
              3
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Aprendizajes y Evidencias de Desviación
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                ¿Qué funcionó bien esta semana?
              </label>
              <textarea
                rows={2}
                value={whatWorked}
                onChange={(e) => setWhatWorked(e.target.value)}
                placeholder="Ej: Descomponer las tareas en bloques menores a 6h facilitó la validación diaria..."
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                ¿Qué causó demoras? (Distingue espera externa de otros bloqueos)
              </label>
              <textarea
                rows={2}
                value={delayCauses}
                onChange={(e) => setDelayCauses(e.target.value)}
                placeholder="Ej: Demora de 2 días en aprobación de textos comerciales por parte del cliente..."
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Up to 3 Concrete Improvements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
                4
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Hasta 3 Acciones Concretas de Mejora con Responsable y Fecha ({improvements.length}/3)
              </h3>
            </div>
            {improvements.length < 3 && (
              <button
                type="button"
                onClick={handleAddImprovement}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 text-xs font-semibold hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Añadir Acción</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {improvements.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-zinc-50 dark:bg-slate-950/60 border border-zinc-200/60 dark:border-zinc-800">
                No hay acciones registradas. Agrega hasta 3 compromisos de mejora accionables para el siguiente ciclo.
              </p>
            ) : (
              improvements.map((imp, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-950 shadow-sm dark:shadow-none"
                >
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={imp.action}
                      onChange={(e) => handleUpdateImprovement(idx, 'action', e.target.value)}
                      placeholder={`Acción ${idx + 1}: Ej: Enviar borradores con 48h de antelación...`}
                      className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <input
                      type="text"
                      value={imp.owner}
                      onChange={(e) => handleUpdateImprovement(idx, 'owner', e.target.value)}
                      placeholder="Responsable"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <input
                      type="date"
                      value={imp.dueDate}
                      onChange={(e) => handleUpdateImprovement(idx, 'dueDate', e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-300 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImprovement(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
                    title="Eliminar acción"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
