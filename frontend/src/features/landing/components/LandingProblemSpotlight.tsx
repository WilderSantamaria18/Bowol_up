import React from 'react';
import { BarChart3, FileX2, RefreshCwOff } from 'lucide-react';

export const LandingProblemSpotlight: React.FC = () => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section id="problema" className="py-28 relative scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="max-w-[760px]">
          <p className="text-xs font-mono text-orange-500 uppercase tracking-wider mb-3">
            Diagnóstico Industrial
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-[1.12] font-display">
            Las empresas no tienen un problema de información. Tienen una ruptura entre análisis y ejecución.
          </h2>
          <p className="mt-6 text-zinc-400 text-base sm:text-lg leading-relaxed">
            Los equipos acumulan reportes aislados, consultorías estáticas y tableros inconexos. Las oportunidades se diluyen en reuniones sin aterrizar en código, diseño o entregables de sprint.
          </p>
        </div>

        {/* 3-Column Bento Cards with Spotlight Mouse Interaction */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div
            onMouseMove={handleMouseMove}
            className="spotlight-card liquid-card p-8 rounded-2xl group transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-orange-400 mb-6 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Datos Descontextualizados
            </h3>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Tendencias macro que no reflejan el sector, tamaño ni madurez tecnológica de tu empresa, generando análisis irrelevantes.
            </p>
          </div>

          <div
            onMouseMove={handleMouseMove}
            className="spotlight-card liquid-card p-8 rounded-2xl group transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-orange-400 mb-6 group-hover:scale-105 transition-transform">
              <FileX2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              FODA en Documentos Muertos
            </h3>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Matrices estratégicas anuales en PDFs que nunca se traducen en priorización RICE, historias de usuario ni tareas asignadas.
            </p>
          </div>

          <div
            onMouseMove={handleMouseMove}
            className="spotlight-card liquid-card p-8 rounded-2xl group transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-orange-400 mb-6 group-hover:scale-105 transition-transform">
              <RefreshCwOff className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Falta de Retroalimentación
            </h3>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Los resultados del sprint no vuelven a calibrar la estrategia general, obligando a los directivos a tomar decisiones a ciegas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
