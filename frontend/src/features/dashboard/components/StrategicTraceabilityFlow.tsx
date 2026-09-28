import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  Lightbulb, 
  FlaskConical, 
  CheckSquare, 
  ChevronRight 
} from 'lucide-react';

interface TraceabilityStep {
  id: string;
  name: string;
  subtext: string;
  icon: React.ElementType;
  route: string;
  badge?: string;
}

const STEPS: TraceabilityStep[] = [
  {
    id: 'signal',
    name: 'Señal',
    subtext: 'Fuentes & captura',
    icon: Radio,
    route: '/trends',
  },
  {
    id: 'trend',
    name: 'Tendencia',
    subtext: 'Relevancia sectorial',
    icon: TrendingUp,
    route: '/trends',
  },
  {
    id: 'evidence',
    name: 'Evidencia',
    subtext: 'Datos auditables',
    icon: FileText,
    route: '/trends',
  },
  {
    id: 'opportunity',
    name: 'Oportunidad',
    subtext: 'Priorización RICE',
    icon: Sparkles,
    route: '/opportunities',
  },
  {
    id: 'hypothesis',
    name: 'Hipótesis',
    subtext: 'Formulación IA',
    icon: Lightbulb,
    route: '/hypotheses',
  },
  {
    id: 'experiment',
    name: 'Experimento',
    subtext: 'Validación empírica',
    icon: FlaskConical,
    route: '/hypotheses',
  },
  {
    id: 'task',
    name: 'Tarea / Sprint',
    subtext: 'Ejecución ágil',
    icon: CheckSquare,
    route: '/tasks',
  },
];

export const StrategicTraceabilityFlow: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#181920]/80 backdrop-blur-2xl p-5 border border-zinc-200/90 dark:border-white/[0.08] shadow-sm dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider font-mono">
            Ciclo de Trazabilidad Estratégica
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Navega directamente a cada fase de la decisión: desde la señal externa hasta la ejecución
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
          7 Fases Conectadas
        </span>
      </div>

      {/* Steps horizontal bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              to={step.route}
              className="group p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] hover:bg-orange-500/[0.06] dark:hover:bg-orange-500/10 border border-zinc-200/80 dark:border-white/[0.06] hover:border-orange-500/30 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                </span>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 group-hover:text-orange-400 transition-colors hidden lg:block" />
                )}
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {step.name}
                </span>
                <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {step.subtext}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
