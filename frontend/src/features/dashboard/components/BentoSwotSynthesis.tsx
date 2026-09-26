import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { swotService } from '@/features/swot/services/swotService';

export const BentoSwotSynthesis: React.FC = () => {
  const { data: swot } = useQuery({
    queryKey: ['latest-swot'],
    queryFn: () => swotService.getLatestSwot(),
    retry: false,
  });

  // Dynamic counts or realistic curated defaults
  const strengthsCount = swot?.strengths?.length ?? 6;
  const opportunitiesCount = swot?.opportunities?.length ?? 8;
  const weaknessesCount = swot?.weaknesses?.length ?? 3;
  const threatsCount = swot?.threats?.length ?? 4;

  const strengthSnippet = swot?.strengths?.[0]?.text || 'Infraestructura analítica propia y dataset curado.';
  const opportunitySnippet = swot?.opportunities?.[0]?.text || 'Expansión hacia clientes Enterprise LATAM.';
  const weaknessSnippet = swot?.weaknesses?.[0]?.text || 'Fricción inicial en onboarding técnico.';
  const threatSnippet = swot?.threats?.[0]?.text || 'Saturación de soluciones LLM comoditizadas.';

  const formatCount = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="rounded-2xl bg-[#1e1f26]/70 backdrop-blur-2xl p-6 border border-white/[0.08] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Síntesis FODA
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Matriz estratégica consolidada</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#292931]/80 border border-white/[0.06] flex items-center justify-center text-zinc-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
        </div>

        {/* 4 Quadrants Interactive Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          {/* Fortalezas */}
          <Link
            to="/swot"
            className="p-3.5 rounded-xl bg-[#1a1b22]/70 hover:bg-[#292931] border border-white/[0.04] hover:border-orange-500/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-orange-400">Fortalezas</span>
              <span className="text-xs text-zinc-500 font-mono font-medium">
                {formatCount(strengthsCount)}
              </span>
            </div>
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
              {strengthSnippet}
            </p>
          </Link>

          {/* Oportunidades */}
          <Link
            to="/swot"
            className="p-3.5 rounded-xl bg-[#1a1b22]/70 hover:bg-[#292931] border border-white/[0.04] hover:border-amber-400/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300">Oportunidades</span>
              <span className="text-xs text-zinc-500 font-mono font-medium">
                {formatCount(opportunitiesCount)}
              </span>
            </div>
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
              {opportunitySnippet}
            </p>
          </Link>

          {/* Debilidades */}
          <Link
            to="/swot"
            className="p-3.5 rounded-xl bg-[#1a1b22]/70 hover:bg-[#292931] border border-white/[0.04] hover:border-zinc-500/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400">Debilidades</span>
              <span className="text-xs text-zinc-500 font-mono font-medium">
                {formatCount(weaknessesCount)}
              </span>
            </div>
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
              {weaknessSnippet}
            </p>
          </Link>

          {/* Amenazas */}
          <Link
            to="/swot"
            className="p-3.5 rounded-xl bg-[#1a1b22]/70 hover:bg-[#292931] border border-white/[0.04] hover:border-red-500/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-400">Amenazas</span>
              <span className="text-xs text-zinc-500 font-mono font-medium">
                {formatCount(threatsCount)}
              </span>
            </div>
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
              {threatSnippet}
            </p>
          </Link>
        </div>
      </div>

      {/* Button link */}
      <Link
        to="/swot"
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#292931]/60 hover:bg-[#33343c] text-zinc-200 hover:text-white font-medium text-xs transition-colors border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
      >
        <span>Abrir panel FODA interactivo</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
      </Link>
    </div>
  );
};
