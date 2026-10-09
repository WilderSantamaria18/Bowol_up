import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Check,
  TrendingDown,
} from 'lucide-react';
import { planningService } from '../services/planningService';

interface TeamMember {
  id: string;
  userId?: string | null;
  name: string;
  role: string;
  availableHours: number; // Horas dedicadas a proyectos (fuera de rutina diaria)
  assignedHours: number; // Horas estimadas en tareas comprometidas
}

export const CapacityBufferCalculator: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [bufferPct, setBufferPct] = useState<number>(20); // 20% según guía BOWOL Plans 2.0
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    planningService.getCapacityPlan()
      .then((plan) => {
        if (!isMounted) return;
        if (plan) {
          if (plan.bufferPercentage) setBufferPct(Number(plan.bufferPercentage));
          if (plan.members && plan.members.length > 0) {
            setMembers(
              plan.members.map((m) => ({
                id: m.id || `m-${Date.now()}-${Math.random()}`,
                userId: m.userId,
                name: m.name,
                role: m.role || 'Miembro',
                availableHours: Number(m.availableHours || 0),
                assignedHours: Number(m.assignedHours || 0),
              }))
            );
          } else {
            // Check if local cache exists
            try {
              const localSaved = localStorage.getItem('bowol_capacity_members');
              if (localSaved) {
                setMembers(JSON.parse(localSaved));
              }
            } catch {
              // ignore
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Fallback a capacidad local:', err);
        try {
          const localSaved = localStorage.getItem('bowol_capacity_members');
          if (localSaved) {
            setMembers(JSON.parse(localSaved));
          }
        } catch {
          // ignore
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Totals calculations
  const totalGrossAvailable = members.reduce((sum, m) => sum + m.availableHours, 0);
  const bufferRatio = bufferPct / 100;
  const totalBufferHours = totalGrossAvailable * bufferRatio;
  const totalNetPlanable = totalGrossAvailable * (1 - bufferRatio);
  const totalAssigned = members.reduce((sum, m) => sum + m.assignedHours, 0);
  const balanceHours = totalNetPlanable - totalAssigned;
  const utilizationNetPct = totalNetPlanable > 0 ? Math.round((totalAssigned / totalNetPlanable) * 100) : 0;

  const saveMembersToServer = async (updatedMembers: TeamMember[], newBufferPct = bufferPct) => {
    setMembers(updatedMembers);
    setIsSaving(true);
    try {
      await planningService.saveCapacityPlan({
        periodLabel: 'Semana Actual',
        bufferPercentage: newBufferPct,
        members: updatedMembers.map((m) => ({
          userId: m.userId,
          name: m.name,
          role: m.role,
          availableHours: m.availableHours,
          assignedHours: m.assignedHours,
        })),
      });
      localStorage.setItem('bowol_capacity_members', JSON.stringify(updatedMembers));
    } catch (err) {
      console.error('Error guardando capacidad en servidor:', err);
      localStorage.setItem('bowol_capacity_members', JSON.stringify(updatedMembers));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMember = (id: string, field: keyof TeamMember, val: any) => {
    const updated = members.map((m) => (m.id === id ? { ...m, [field]: val } : m));
    saveMembersToServer(updated);
  };

  const handleBufferChange = (pct: number) => {
    setBufferPct(pct);
    saveMembersToServer(members, pct);
  };

  const handleAddMember = () => {
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: `Colaborador ${members.length + 1}`,
      role: 'Especialista',
      availableHours: 20,
      assignedHours: 0,
    };
    saveMembersToServer([...members, newMember]);
  };

  const handleDeleteMember = (id: string) => {
    saveMembersToServer(members.filter((m) => m.id !== id));
  };

  const handleCopyReport = () => {
    const rows = members
      .map(
        (m) =>
          `| ${m.name} (${m.role}) | ${m.availableHours}h | ${(m.availableHours * bufferRatio).toFixed(1)}h | ${(
            m.availableHours * (1 - bufferRatio)
          ).toFixed(1)}h | ${m.assignedHours}h | ${(m.availableHours * (1 - bufferRatio) - m.assignedHours).toFixed(1)}h |`
      )
      .join('\n');

    const markdown = `# BOWOL Plans 2.0 — Balance de Capacidad y Reserva (Fase 5.1)
**Regla Operativa:** Capacidad planificable = Horas disponibles × (1 - ${bufferPct}% reserva)

### Resumen Ejecutivo
- **Horas brutas disponibles para proyectos:** ${totalGrossAvailable.toFixed(1)}h
- **Reserva de contingencia e imprevistos (${bufferPct}%):** ${totalBufferHours.toFixed(1)}h
- **Capacidad neta planificable:** ${totalNetPlanable.toFixed(1)}h
- **Horas asignadas en tareas:** ${totalAssigned.toFixed(1)}h
- **Saldo neto disponible:** ${balanceHours >= 0 ? `+${balanceHours.toFixed(1)}h` : `${balanceHours.toFixed(1)}h (DÉFICIT)`}
- **Estado de Carga:** ${balanceHours >= 0 ? 'VIABLE DENTRO DE MARGEN' : 'SOBRECARGA DETECTADA - REQUIERE RECORTE O DESPLAZAMIENTO'}

### Desglose por Persona
| Persona y Rol | Bruto | Reserva (${bufferPct}%) | Planificable | Asignado | Saldo |
|---|---|---|---|---|---|
${rows}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status flags
  const isOverloaded = balanceHours < 0;
  const isNearLimit = !isOverloaded && utilizationNetPct > 90;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Calculadora de Capacidad y Reserva del 20%
            </h2>
            <span className="inline-flex items-center rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:text-orange-400">
              Fase 5.1 BOWOL Plans
            </span>
            {isSaving && <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono animate-pulse">Guardando en servidor...</span>}
            {isLoading && <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Sincronizando equipo...</span>}
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            La regla de oro para evitar quemar al equipo: <em>«Capacidad planificable = Horas disponibles × 0.80»</em>. 
            El 20% de reserva protegido absorbe urgencias del día a día, atención de clientes e imprevistos técnicos sin romper las fechas del proyecto.
          </p>
        </div>

        <button
          onClick={handleCopyReport}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-slate-200 border border-zinc-200/80 dark:border-transparent text-xs font-semibold transition-colors shrink-0 shadow-sm dark:shadow-none"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? '¡Reporte Copiado!' : 'Copiar Resumen Markdown'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-zinc-200/80 dark:border-zinc-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs">
            <span>Disponibilidad Bruta</span>
            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalGrossAvailable}h</p>
          <p className="text-[11px] text-slate-500 mt-1">Horas dedicables a proyectos</p>
        </div>

        {/* 20% Buffer */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-900/50 border border-amber-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-amber-800 dark:text-slate-400 text-xs">
            <span>Reserva Imprevistos ({bufferPct}%)</span>
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">{totalBufferHours.toFixed(1)}h</p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">Colchón protegido para contingencias</p>
        </div>

        {/* Net Planable */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-900/50 border border-emerald-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-emerald-800 dark:text-slate-400 text-xs">
            <span>Capacidad Planificable</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{totalNetPlanable.toFixed(1)}h</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-1">Máximo trabajo seguro a comprometer</p>
        </div>

        {/* Balance / Deficit */}
        <div
          className={`p-4 rounded-2xl border shadow-sm dark:shadow-none ${
            isOverloaded
              ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
              : isNearLimit
              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
              : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={isOverloaded ? 'text-rose-700 dark:text-rose-300 font-semibold' : isNearLimit ? 'text-amber-700 dark:text-amber-300 font-semibold' : 'text-emerald-700 dark:text-emerald-300 font-semibold'}>
              {isOverloaded ? 'Déficit Operativo' : 'Saldo Disponible'}
            </span>
            {isOverloaded ? (
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            ) : (
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <p
            className={`mt-2 text-2xl font-bold ${
              isOverloaded ? 'text-rose-700 dark:text-rose-400' : isNearLimit ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {balanceHours >= 0 ? `+${balanceHours.toFixed(1)}h` : `${balanceHours.toFixed(1)}h`}
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
            Asignado: {totalAssigned}h ({utilizationNetPct}% del límite neto)
          </p>
        </div>
      </div>

      {/* Overload Alert Banner */}
      {isOverloaded && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3 shadow-sm dark:shadow-none">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-900 dark:text-rose-100">
              Sobrecarga detectada: El trabajo asignado ({totalAssigned}h) supera la capacidad neta ({totalNetPlanable.toFixed(1)}h).
            </h4>
            <p className="mt-1 text-rose-700/90 dark:text-rose-200/90 leading-relaxed">
              Según la Sección 5.1 de BOWOL Plans: <em>«Si no cabe todo, presenta alternativas de alcance, fecha o recursos; nunca ocultes la sobrecarga»</em>.
              Reduce el alcance de las tareas no prioritarias, desasigna actividades de baja prioridad RICE o mueve entregables a la semana siguiente.
            </p>
          </div>
        </div>
      )}

      {/* Buffer Slider Configuration */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>Porcentaje de Reserva para Imprevistos</span>
          </span>
          <span className="font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-500/20">
            {bufferPct}% ({totalBufferHours.toFixed(1)} horas protegidas)
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="35"
          step="5"
          value={bufferPct}
          onChange={(e) => handleBufferChange(Number(e.target.value))}
          className="w-full accent-cyan-600 dark:accent-cyan-400 bg-zinc-200 dark:bg-zinc-800 rounded-lg h-2"
        />
        <div className="flex justify-between text-[10px] text-slate-500 px-1">
          <span>10% (Riesgoso)</span>
          <span className="text-cyan-700 dark:text-cyan-400 font-semibold">20% (Estándar BOWOL Plans 2.0)</span>
          <span>35% (Sectores con alta volatilidad)</span>
        </div>
      </div>

      {/* Team Breakdown Table */}
      <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              Capacidad por Miembro del Equipo ({members.length})
            </h3>
          </div>
          <button
            onClick={handleAddMember}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-xs font-semibold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Añadir Colaborador</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pr-4">Nombre</th>
                <th className="pb-3 pr-4">Rol</th>
                <th className="pb-3 pr-4 text-center">Horas Brutas</th>
                <th className="pb-3 pr-4 text-center">Reserva ({bufferPct}%)</th>
                <th className="pb-3 pr-4 text-center">Planificable</th>
                <th className="pb-3 pr-4 text-center">Horas Asignadas</th>
                <th className="pb-3 pr-4 text-center">Saldo</th>
                <th className="pb-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {members.map((m) => {
                const memberBuffer = m.availableHours * bufferRatio;
                const memberPlanable = m.availableHours * (1 - bufferRatio);
                const memberBalance = memberPlanable - m.assignedHours;
                const isMemberOverloaded = memberBalance < 0;

                return (
                  <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleUpdateMember(m.id, 'name', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none text-slate-900 dark:text-slate-200 font-medium w-full"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="text"
                        value={m.role}
                        onChange={(e) => handleUpdateMember(m.id, 'role', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none text-slate-600 dark:text-slate-400 w-full"
                      />
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={m.availableHours}
                        onChange={(e) => handleUpdateMember(m.id, 'availableHours', Number(e.target.value) || 0)}
                        className="w-16 text-center rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-2 py-1 text-slate-900 dark:text-slate-200 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-3 pr-4 text-center text-amber-700 dark:text-amber-400 font-mono font-medium">
                      {memberBuffer.toFixed(1)}h
                    </td>
                    <td className="py-3 pr-4 text-center text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                      {memberPlanable.toFixed(1)}h
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={m.assignedHours}
                        onChange={(e) => handleUpdateMember(m.id, 'assignedHours', Number(e.target.value) || 0)}
                        className="w-16 text-center rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-slate-950 px-2 py-1 text-slate-900 dark:text-slate-200 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-3 pr-4 text-center font-semibold font-mono">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md ${
                          isMemberOverloaded
                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                            : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        }`}
                      >
                        {memberBalance >= 0 ? `+${memberBalance.toFixed(1)}h` : `${memberBalance.toFixed(1)}h`}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        disabled={members.length <= 1}
                        title="Eliminar del cálculo"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
