import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { Task } from '@/features/tasks/types';
import { Button } from '@/components/ui/Button';
import {
  ListTodo,
  Clock,
  Hourglass,
  AlertTriangle,
  UserCheck,
  UserX,
  Sparkles,
  Plus,
  Check,
  FileJson,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PackageCheck,
} from 'lucide-react';

interface VerifiableTaskBreakdownSectionProps {
  project: Project;
  tasks: Task[];
  onOpenCreateTask: () => void;
  onOpenAIDecompose: () => void;
  onNavigateToKanban: () => void;
}

export const VerifiableTaskBreakdownSection: React.FC<VerifiableTaskBreakdownSectionProps> = ({
  project,
  tasks,
  onOpenCreateTask,
  onOpenAIDecompose,
  onNavigateToKanban,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('ALL');
  const [filterOverSixHours, setFilterOverSixHours] = useState(false);
  const [filterUnassigned, setFilterUnassigned] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showAssigneeSummary, setShowAssigneeSummary] = useState(false);

  // Normalize / Enrich tasks with BOWOL Phase 3 defaults
  const enrichedTasks = useMemo(() => {
    return tasks.map((t, idx) => {
      const stableId = `T-${String(idx + 1).padStart(3, '0')}`;
      const estimate = t.estimateHours || 0;
      const isOverSixHours = estimate > 6;
      const isUnassigned = !t.assigneeId && !t.assigneeName;

      // Extract area or guess
      const area = t.area || 'Operaciones';
      const deliverable = t.deliverable || t.description || 'Entregable por especificar';
      const acceptanceCriteria = Array.isArray(t.acceptanceCriteria)
        ? t.acceptanceCriteria
        : t.acceptanceCriteria
        ? [t.acceptanceCriteria]
        : ['Criterio de aceptación estándar verificado'];

      // Check if starts with infinitive in Spanish (ends with ar, er, ir)
      const firstWord = (t.title || '').trim().split(' ')[0]?.toLowerCase() || '';
      const isInfinitive =
        firstWord.endsWith('ar') ||
        firstWord.endsWith('er') ||
        firstWord.endsWith('ir');

      return {
        ...t,
        stableId,
        area,
        deliverable,
        acceptanceCriteria,
        isOverSixHours,
        isUnassigned,
        isInfinitive,
        externalWait: t.externalWaitHours || 0,
      };
    });
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return enrichedTasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.stableId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.deliverable.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesArea = filterArea === 'ALL' || t.area === filterArea;
      const matchesOverSix = !filterOverSixHours || t.isOverSixHours;
      const matchesUnassigned = !filterUnassigned || t.isUnassigned;

      return matchesSearch && matchesArea && matchesOverSix && matchesUnassigned;
    });
  }, [enrichedTasks, searchTerm, filterArea, filterOverSixHours, filterUnassigned]);

  // Quantitative Stats (Fase 3 BOWOL Plans)
  const totalActiveHours = enrichedTasks.reduce((sum, t) => sum + (t.estimateHours || 0), 0);
  const totalWaitHours = enrichedTasks.reduce((sum, t) => sum + (t.externalWait || 0), 0);
  const tasksOverSixCount = enrichedTasks.filter((t) => t.isOverSixHours).length;
  const unassignedCount = enrichedTasks.filter((t) => t.isUnassigned).length;
  const highUncertaintyCount = enrichedTasks.filter((t) => t.isHighUncertainty).length;

  // Breakdown by assignee / role
  const assigneeStats = useMemo(() => {
    const map: Record<string, { count: number; hours: number; isPending: boolean }> = {};
    enrichedTasks.forEach((t) => {
      const name = t.assigneeName || t.assignedRole || 'Asignación pendiente';
      const isPending = !t.assigneeName && !t.assigneeId;
      if (!map[name]) {
        map[name] = { count: 0, hours: 0, isPending };
      }
      map[name].count += 1;
      map[name].hours += t.estimateHours || 0;
    });
    return Object.entries(map).map(([name, stat]) => ({ name, ...stat }));
  }, [enrichedTasks]);

  // Export JSON (bowol-planning-guide-2.0)
  const handleExportJson = () => {
    const jsonPayload = {
      schemaVersion: 'bowol-planning-guide-2.0',
      project: {
        name: project.name,
        objective: project.description || null,
        startDate: project.startDate || null,
        dueDate: project.endDate || null,
      },
      assumptions: [
        `Esfuerzo de trabajo activo total: ${totalActiveHours} horas`,
        `Tiempo de espera externa documentada: ${totalWaitHours} horas`,
        `Metodología BOWOL Plans 2.0 (Fase 3: WBS con límite 6h por actividad)`,
      ],
      tasks: enrichedTasks.map((t) => ({
        id: t.stableId,
        title: t.title,
        description: t.description || null,
        area: t.area,
        status: t.status,
        estimatedHours: t.estimateHours || 0,
        assignedRole: t.assignedRole || null,
        assignedPerson: t.assigneeName || null,
        deliverable: t.deliverable,
        acceptanceCriteria: t.acceptanceCriteria,
        dependsOn: t.dependsOn || [],
        dueDate: null,
        prioritization: null,
      })),
    };

    const text = JSON.stringify(jsonPayload, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-500 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20">
              Fase 3 · BOWOL Plans
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Desglose de Actividades Verificables (WBS &le; 6h)
            </span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
            Matriz de Actividades, Entregables y Esperas Externas
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Cada tarea contiene un ID estable, verbo en infinitivo, horas activas (&le; 6h), entregable tangible, criterios de aceptación y dependencias para garantizar una ejecución sin sorpresas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="text-xs gap-1.5"
            title="Copiar plan completo en JSON bowol-planning-guide-2.0"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileJson className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{copiedJson ? '¡JSON Copiado!' : 'Exportar JSON'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAIDecompose}
            className="text-xs gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Descomponer con IA</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenCreateTask}
            className="text-xs gap-1.5 shadow-md shadow-orange-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Actividad</span>
          </Button>
        </div>
      </div>

      {/* Quantitative KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Active Hours */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase font-semibold">Esfuerzo Activo</span>
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {totalActiveHours} <span className="text-xs font-sans font-normal text-zinc-500">horas</span>
          </p>
          <span className="text-[10px] text-zinc-400 block truncate">Capacidad de trabajo del equipo</span>
        </div>

        {/* External Wait Hours */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase font-semibold">Espera Externa</span>
            <Hourglass className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {totalWaitHours} <span className="text-xs font-sans font-normal text-zinc-500">horas</span>
          </p>
          <span className="text-[10px] text-zinc-400 block truncate">Regla 4: No consume horas activas</span>
        </div>

        {/* Tasks > 6h Alert */}
        <div
          onClick={() => setFilterOverSixHours(!filterOverSixHours)}
          className={`p-4 rounded-2xl border backdrop-blur-xl space-y-1 cursor-pointer transition-all ${
            filterOverSixHours
              ? 'bg-amber-500/15 border-amber-500/40 ring-2 ring-amber-500/20'
              : tasksOverSixCount > 0
              ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
              : 'bg-white/70 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-[10px] font-mono uppercase font-semibold">Exceden 6h</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {tasksOverSixCount} <span className="text-xs font-sans font-normal text-zinc-500">tareas</span>
          </p>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block truncate">
            {tasksOverSixCount > 0 ? 'Conviene dividir en partes' : 'Granularidad óptima'}
          </span>
        </div>

        {/* Unassigned Tasks */}
        <div
          onClick={() => setFilterUnassigned(!filterUnassigned)}
          className={`p-4 rounded-2xl border backdrop-blur-xl space-y-1 cursor-pointer transition-all ${
            filterUnassigned
              ? 'bg-rose-500/15 border-rose-500/40 ring-2 ring-rose-500/20'
              : unassignedCount > 0
              ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
              : 'bg-white/70 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-[10px] font-mono uppercase font-semibold">Sin Asignar</span>
            <UserX className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {unassignedCount} <span className="text-xs font-sans font-normal text-zinc-500">pendientes</span>
          </p>
          <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 block truncate">
            Regla 8: Asignación pendiente
          </span>
        </div>

        {/* Total Tasks Count */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase font-semibold">Total Actividades</span>
            <ListTodo className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {enrichedTasks.length} <span className="text-xs font-sans font-normal text-zinc-500">WBS</span>
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block truncate">
            {highUncertaintyCount > 0 ? `${highUncertaintyCount} con alta incertidumbre` : 'Estimaciones firmes'}
          </span>
        </div>
      </div>

      {/* Assignee Capacity Breakdown Panel (Collapsible) */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-zinc-900/40 p-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setShowAssigneeSummary(!showAssigneeSummary)}
          className="w-full flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200"
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-orange-500" />
            <span>Distribución de Esfuerzo por Responsable Sugerido / Confirmado</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
              {assigneeStats.length} colaboradores / roles
            </span>
          </div>
          {showAssigneeSummary ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </button>

        {showAssigneeSummary && (
          <div className="mt-3.5 pt-3 border-t border-zinc-200/60 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 animate-in fade-in duration-200">
            {assigneeStats.map((item) => (
              <div
                key={item.name}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  item.isPending
                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                    : 'bg-zinc-50 dark:bg-zinc-900/70 border-zinc-200/70 dark:border-white/5'
                }`}
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {item.isPending ? <UserX className="w-3.5 h-3.5 text-rose-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{item.name}</span>
                  </p>
                  <span className="text-[10px] text-zinc-500">{item.count} actividades</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {item.hours}h
                  </span>
                  <span className="text-[10px] text-zinc-400 block">asignadas</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.08]">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID, verbo, entregable..."
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:border-orange-500 focus:outline-none"
          >
            <option value="ALL" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Todas las áreas</option>
            <option value="Operaciones" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Operaciones</option>
            <option value="Marketing" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Marketing</option>
            <option value="Ventas" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Ventas</option>
            <option value="Tecnología" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Tecnología</option>
            <option value="Administración" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Administración</option>
          </select>

          {(filterOverSixHours || filterUnassigned) && (
            <button
              type="button"
              onClick={() => {
                setFilterOverSixHours(false);
                setFilterUnassigned(false);
              }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
            >
              Limpiar filtros
            </button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onNavigateToKanban}
            className="text-xs h-8"
          >
            <span>Ver en Tablero Kanban &rarr;</span>
          </Button>
        </div>
      </div>

      {/* Main Phase 3 Table */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white/40 dark:bg-zinc-900/30 border border-dashed border-zinc-300 dark:border-white/10 space-y-3">
          <ListTodo className="w-8 h-8 text-zinc-500 mx-auto" strokeWidth={1.5} />
          <p className="text-xs text-zinc-500">
            {tasks.length === 0
              ? 'No hay actividades desglosadas aún para esta iniciativa.'
              : 'Ninguna actividad coincide con los filtros aplicados.'}
          </p>
          {tasks.length === 0 && (
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="primary" size="sm" onClick={onOpenAIDecompose} className="gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Descomponer con IA</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onOpenCreateTask} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Actividad</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-lg overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02] text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-3.5 font-semibold w-16">ID</th>
                <th className="py-3 px-3.5 font-semibold min-w-[200px]">Actividad (Infinitivo)</th>
                <th className="py-3 px-3 font-semibold">Área</th>
                <th className="py-3 px-3 font-semibold text-center">Horas</th>
                <th className="py-3 px-3.5 font-semibold">Responsable</th>
                <th className="py-3 px-3.5 font-semibold min-w-[180px]">Entregable Tangible</th>
                <th className="py-3 px-3.5 font-semibold min-w-[180px]">Criterio de Aceptación</th>
                <th className="py-3 px-2.5 font-semibold text-center">Espera</th>
                <th className="py-3 px-3 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-white/[0.05]">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className={`hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors ${
                    task.isOverSixHours ? 'bg-amber-500/[0.02]' : ''
                  }`}
                >
                  {/* ID */}
                  <td className="py-3 px-3.5 font-mono font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                    {task.stableId}
                  </td>

                  {/* Actividad */}
                  <td className="py-3 px-3.5">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{task.title}</span>
                      </p>
                      {!task.isInfinitive && (
                        <span className="text-[10px] text-amber-500/90 font-mono block">
                          Tip BOWOL: Usar verbo en infinitivo
                        </span>
                      )}
                      {task.isHighUncertainty && (
                        <span className="inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Alta incertidumbre
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Área */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                      {task.area}
                    </span>
                  </td>

                  {/* Horas estimadas con alerta >6h */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center">
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                        task.isOverSixHours
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-zinc-200'
                      }`}>
                        {task.estimateHours ? `${task.estimateHours}h` : '0h'}
                      </span>
                      {task.isOverSixHours && (
                        <span className="text-[9px] font-semibold text-amber-500 mt-0.5" title="Regla Fase 3: Dividir tareas > 6h">
                          &gt;6h dividir
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Responsable sugerido o Asignación pendiente */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {task.assigneeName ? (
                      <span className="inline-flex items-center gap-1 text-zinc-800 dark:text-zinc-200 font-medium">
                        <UserCheck className="w-3 h-3 text-emerald-500" />
                        <span>{task.assigneeName}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <UserX className="w-2.5 h-2.5" />
                        <span>{task.assignedRole || 'Asignación pendiente'}</span>
                      </span>
                    )}
                  </td>

                  {/* Entregable */}
                  <td className="py-3 px-3.5 text-zinc-700 dark:text-zinc-300">
                    <div className="flex items-start gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{task.deliverable}</span>
                    </div>
                  </td>

                  {/* Criterio de Aceptación */}
                  <td className="py-3 px-3.5 text-zinc-600 dark:text-zinc-400">
                    <div className="space-y-1">
                      {task.acceptanceCriteria.map((c, i) => (
                        <div key={i} className="flex items-start gap-1 text-[11px] leading-tight">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{c}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Espera externa */}
                  <td className="py-3 px-2.5 text-center whitespace-nowrap">
                    {task.externalWait > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        <Hourglass className="w-2.5 h-2.5" />
                        <span>{task.externalWait}h</span>
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[10px]">—</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                      task.status === 'DONE'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : task.status === 'BLOCKED'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
