import React from 'react';
import { 
  Building2, 
  Globe2, 
  Users, 
  Target, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { BusinessProfile } from '../types';

interface BusinessProfileViewProps {
  profile: BusinessProfile;
  onEditClick?: () => void;
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({ profile }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Building2 className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100">{profile.industry || 'Organización'}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                  Contexto Activo
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Perfil Estratégico inyectado en el motor de investigación de BOWOL
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <div>
              <span className="text-[11px] text-zinc-500 block">Tamaño</span>
              <span className="text-xs font-semibold text-zinc-200">{profile.size}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Globe2 className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <div>
              <span className="text-[11px] text-zinc-500 block">Mercado Objetivo</span>
              <span className="text-xs font-semibold text-zinc-200">{profile.market || 'No definido'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <div>
              <span className="text-[11px] text-zinc-500 block">Madurez Digital / IA</span>
              <span className="text-xs font-semibold text-zinc-200">{profile.digitalMaturity}% / {profile.aiMaturity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Goals, Problems, Tools, Maturity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objetivos Prioritarios */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <Target className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-zinc-100">Objetivos Estratégicos</h2>
          </div>
          <div className="space-y-2">
            {profile.goals && profile.goals.length > 0 ? (
              profile.goals.map((goal, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/40 border border-white/[0.04] text-xs">
                  <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center text-[10px] font-bold">
                    {goal.priority || idx + 1}
                  </span>
                  <span className="text-zinc-200">{goal.text}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500">No se han registrado objetivos prioritarios.</p>
            )}
          </div>
        </div>

        {/* Problemas / Cuellos de Botella */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <AlertTriangle className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-zinc-100">Fricciones y Desafíos</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.problems && profile.problems.length > 0 ? (
              profile.problems.map((prob, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-white/[0.06] text-xs text-zinc-300">
                  {prob}
                </span>
              ))
            ) : (
              <p className="text-xs text-zinc-500">No se han registrado desafíos críticos.</p>
            )}
          </div>
        </div>

        {/* Ecosistema de Herramientas y Canales */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <Layers className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-zinc-100">Herramientas y Canales</h2>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-[11px] text-zinc-500 block mb-1.5">Herramientas</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.tools?.map((tool, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-zinc-900 border border-white/[0.06] text-[11px] text-zinc-300">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block mb-1.5">Canales</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.channels?.map((chan, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-zinc-900 border border-white/[0.06] text-[11px] text-zinc-300">
                    {chan}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico de Madurez */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <Cpu className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-zinc-100">Niveles de Madurez</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Madurez Digital</span>
                <span className="text-emerald-400 font-bold">{profile.digitalMaturity}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.06]">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${profile.digitalMaturity}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Adopción de Inteligencia Artificial</span>
                <span className="text-orange-400 font-bold">{profile.aiMaturity}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.06]">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${profile.aiMaturity}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
