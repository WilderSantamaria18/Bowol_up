import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  GitFork, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  Minus,
  Cpu
} from 'lucide-react';
import { DashboardTopTrendItem } from '../types';

interface BentoRadarTableProps {
  trends: DashboardTopTrendItem[];
  totalGlobalTrends: number;
}

interface DisplayTrend {
  id: string;
  title: string;
  subtitle: string;
  category: 'SaaS' | 'DeepTech' | 'Fintech' | 'AI/ML';
  adoptionRate: number;
  impact: 'Crítico' | 'Alto' | 'Moderado';
  iconType: 'sparkles' | 'tree' | 'shield' | 'cpu';
}

export const BentoRadarTable: React.FC<BentoRadarTableProps> = ({ trends, totalGlobalTrends }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'saas' | 'deeptech' | 'fintech'>('all');

  // Convert real trends or provide curated high-impact fallback items matching mockup
  const defaultItems: DisplayTrend[] = [
    {
      id: 'trend-1',
      title: 'Modelos SLM Perimetrales',
      subtitle: 'Inferencia local optimizada en chips NPU',
      category: 'DeepTech',
      adoptionRate: 82,
      impact: 'Crítico',
      iconType: 'sparkles',
    },
    {
      id: 'trend-2',
      title: 'Orquestación de Agentes',
      subtitle: 'Multi-agent autonomous execution loops',
      category: 'SaaS',
      adoptionRate: 68,
      impact: 'Alto',
      iconType: 'tree',
    },
    {
      id: 'trend-3',
      title: 'Ledgers Distribuidos v3',
      subtitle: 'Liquidación y auditoría casi instantánea',
      category: 'Fintech',
      adoptionRate: 44,
      impact: 'Moderado',
      iconType: 'shield',
    },
  ];

  // If backend provided top trends, map them into display trends
  const displayItems: DisplayTrend[] = trends && trends.length > 0
    ? trends.slice(0, 5).map((t, index) => {
        const cat: DisplayTrend['category'] = t.tags?.includes('saas')
          ? 'SaaS'
          : t.tags?.includes('fintech')
          ? 'Fintech'
          : t.tags?.includes('ai')
          ? 'AI/ML'
          : index % 2 === 0
          ? 'DeepTech'
          : 'SaaS';

        const adoption = Math.min(95, Math.max(35, Math.round(t.score * 0.95)));
        const impact: DisplayTrend['impact'] =
          adoption >= 75 ? 'Crítico' : adoption >= 55 ? 'Alto' : 'Moderado';

        return {
          id: t.id,
          title: t.title,
          subtitle: t.tags?.length ? `#${t.tags.slice(0, 2).join(' #')}` : 'Tendencia identificada en fuentes globales',
          category: cat,
          adoptionRate: adoption,
          impact,
          iconType: index === 0 ? 'sparkles' : index === 1 ? 'tree' : 'cpu',
        };
      })
    : defaultItems;

  const filteredItems = displayItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category.toLowerCase() === activeFilter;
  });

  return (
    <div className="rounded-2xl bg-[#1e1f26]/70 backdrop-blur-2xl p-6 border border-white/[0.08] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] flex flex-col justify-between space-y-5">
      {/* Header with Segmented Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Radar de Tendencias y Señales Emergentes
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Detección automatizada de movimientos tecnológicos con impacto sectorial
          </p>
        </div>

        {/* Filter Tray */}
        <div className="inline-flex p-1 rounded-xl bg-[#0d0e15]/80 text-zinc-400 self-start sm:self-auto border border-white/[0.04]">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-[#292931] text-white shadow-sm'
                : 'hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('saas')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'saas'
                ? 'bg-[#292931] text-white shadow-sm'
                : 'hover:text-white'
            }`}
          >
            SaaS
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('deeptech')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'deeptech'
                ? 'bg-[#292931] text-white shadow-sm'
                : 'hover:text-white'
            }`}
          >
            DeepTech
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('fintech')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'fintech'
                ? 'bg-[#292931] text-white shadow-sm'
                : 'hover:text-white'
            }`}
          >
            Fintech
          </button>
        </div>
      </div>

      {/* Styled Liquid Glass Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-zinc-500 font-semibold uppercase tracking-wider border-b border-white/[0.06]">
              <th className="pb-3 pr-4 font-semibold">Tendencia</th>
              <th className="pb-3 px-4 font-semibold">Categoría</th>
              <th className="pb-3 px-4 font-semibold">Índice Adopción</th>
              <th className="pb-3 px-4 font-semibold">Impacto Estratégico</th>
              <th className="pb-3 pl-4 text-right font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredItems.map((item) => (
              <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                {/* Tendencia */}
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#292931]/80 border border-white/[0.06] flex items-center justify-center shrink-0">
                      {item.iconType === 'sparkles' && <Sparkles className="w-4 h-4 text-orange-400" />}
                      {item.iconType === 'tree' && <GitFork className="w-4 h-4 text-amber-300" />}
                      {item.iconType === 'shield' && <ShieldCheck className="w-4 h-4 text-zinc-400" />}
                      {item.iconType === 'cpu' && <Cpu className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-white block truncate text-xs sm:text-sm">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-zinc-400 truncate block">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Categoría */}
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-md bg-[#292931]/70 text-zinc-300 font-medium text-[11px] border border-white/[0.06]">
                    {item.category}
                  </span>
                </td>

                {/* Índice Adopción */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-20 h-1.5 bg-[#0d0e15] rounded-full overflow-hidden border border-white/[0.04]">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.adoptionRate}%` }}
                      />
                    </div>
                    <span className="font-semibold text-zinc-200 tabular-nums text-xs">
                      {item.adoptionRate}%
                    </span>
                  </div>
                </td>

                {/* Impacto Estratégico */}
                <td className="py-3.5 px-4">
                  {item.impact === 'Crítico' && (
                    <span className="inline-flex items-center gap-1.5 text-orange-400 font-semibold text-xs">
                      <TrendingUp className="w-3.5 h-3.5" /> Crítico
                    </span>
                  )}
                  {item.impact === 'Alto' && (
                    <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                      <Zap className="w-3.5 h-3.5" /> Alto
                    </span>
                  )}
                  {item.impact === 'Moderado' && (
                    <span className="inline-flex items-center gap-1.5 text-zinc-400 font-medium text-xs">
                      <Minus className="w-3.5 h-3.5" /> Moderado
                    </span>
                  )}
                </td>

                {/* Acción */}
                <td className="py-3.5 pl-4 text-right">
                  <Link
                    to="/trends"
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors inline-flex"
                    title="Ver análisis de tendencia"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
        <span className="text-xs text-zinc-500">
          Mostrando {filteredItems.length} de {totalGlobalTrends || 28} señales detectadas
        </span>
        <Link
          to="/trends"
          className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 group"
        >
          <span>Ver matriz completa</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
