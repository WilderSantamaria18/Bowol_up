import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Percent, 
  Users, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BowolOperationalHealthCard: React.FC = () => {
  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/70 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-500 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20">
              BOWOL Plans 2.0
            </span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Salud Operativa del Negocio
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Métricas de control para equipos de 1 a 15 personas sin sobrecarga
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/planning"
            className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 font-medium transition-colors"
          >
            <span>Planificador & Capacidad</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Cards: WIP Limit, 20% Buffer, Bloqueos, Puerta DONE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* WIP Limit */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.05] space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-mono">Límite WIP (Fase 5)</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            &le; 1 Activa / pers.
          </p>
          <p className="text-[10px] text-zinc-500">
            Máx. 2 si una está en espera externa con capacidad disponible
          </p>
        </div>

        {/* 20% Contingency Buffer */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.05] space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-mono">Colchón Imprevistos</span>
            <Percent className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <p className="text-base font-bold text-orange-600 dark:text-orange-400">
            20% Reserva
          </p>
          <p className="text-[10px] text-zinc-500">
            Capacidad planificable = Horas &times; (1 - 0.20)
          </p>
        </div>

        {/* Bloqueos con causa */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.05] space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-mono">Protocolo Bloqueos</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Causa + Responsable
          </p>
          <p className="text-[10px] text-zinc-500">
            Con fecha de próxima revisión obligatoria
          </p>
        </div>

        {/* Puerta de Cierre DONE */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.05] space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-mono">Puerta de Cierre DONE</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            Aceptación + Evidencia
          </p>
          <p className="text-[10px] text-zinc-500">
            Sin revisión previa mantiene estado y se marca pendiente
          </p>
        </div>
      </div>
    </div>
  );
};
