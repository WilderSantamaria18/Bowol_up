import React, { useState } from 'react';
import { Calculator, ArrowRight, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const InteractiveRoiCalculator: React.FC = () => {
  const [teamSize, setTeamSize] = useState<number>(5);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(12);

  // Estimaciones:
  // BOWOL reduce en un 65% el tiempo de investigación y descomposición de sprints
  const hourlyRateUsd = 35;
  const hoursSavedPerWeek = Math.round(hoursPerWeek * 0.65 * teamSize);
  const monthlyHoursSaved = hoursSavedPerWeek * 4;
  const monthlySavingsUsd = monthlyHoursSaved * hourlyRateUsd;
  const annualSavingsUsd = monthlySavingsUsd * 12;

  return (
    <div className="rounded-3xl liquid-glass border border-white/[0.1] p-6 sm:p-10 max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="glow-spot-orange top-0 right-0 opacity-20 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-pill text-xs text-orange-400 font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" /> Calculadora de Impacto Financiero
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Calcula el Ahorro de tu Equipo
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Ajusta los parámetros de tu equipo y calcula el retorno de inversión inmediato.
            </p>
          </div>

          <div className="space-y-5">
            {/* Slider 1: Team Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-medium">Tamaño del equipo de producto & tech:</span>
                <span className="font-mono font-bold text-white text-sm bg-zinc-900 px-2 py-0.5 rounded border border-white/[0.08]">
                  {teamSize} {teamSize === 1 ? 'persona' : 'personas'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>1 persona</span>
                <span>12 personas</span>
                <span>25 personas</span>
              </div>
            </div>

            {/* Slider 2: Hours spent */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-medium">Horas semanales dedicadas a investigación y planificación:</span>
                <span className="font-mono font-bold text-white text-sm bg-zinc-900 px-2 py-0.5 rounded border border-white/[0.08]">
                  {hoursPerWeek} hrs / persona
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={30}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>4 hrs</span>
                <span>15 hrs</span>
                <span>30 hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-950/80 border border-orange-500/30 shadow-xl space-y-5">
          <div className="text-xs uppercase tracking-wider font-bold text-orange-400">
            Retorno de Inversión Proyectado
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight text-emerald-400">
              ${monthlySavingsUsd.toLocaleString()} USD
            </div>
            <div className="text-xs text-zinc-400">ahorro mensual estimado en horas de ingeniería</div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>Tiempo Ganado:</span>
              </div>
              <div className="font-mono font-bold text-white text-sm">
                +{monthlyHoursSaved} hrs / mes
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-zinc-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Ahorro Anual:</span>
              </div>
              <div className="font-mono font-bold text-white text-sm">
                ${annualSavingsUsd.toLocaleString()} USD
              </div>
            </div>
          </div>

          <Link to="/register" className="block pt-2">
            <Button variant="primary" className="w-full justify-center shadow-lg shadow-orange-500/20">
              Comenzar a Ahorrar Ahora <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
