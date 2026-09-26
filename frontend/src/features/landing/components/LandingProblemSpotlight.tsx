import React from 'react';
import { motion } from 'framer-motion';
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

  const problems = [
    {
      icon: BarChart3,
      title: 'Datos Descontextualizados',
      description:
        'Tendencias macro que no reflejan el sector, tamaño ni madurez tecnológica de tu empresa, generando análisis irrelevantes.',
    },
    {
      icon: FileX2,
      title: 'FODA en Documentos Muertos',
      description:
        'Matrices estratégicas anuales en PDFs que nunca se traducen en priorización RICE, historias de usuario ni tareas asignadas.',
    },
    {
      icon: RefreshCwOff,
      title: 'Falta de Retroalimentación',
      description:
        'Los resultados del sprint no vuelven a calibrar la estrategia general, obligando a los directivos a tomar decisiones a ciegas.',
    },
  ];

  return (
    <section id="problema" className="py-28 relative scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[760px]"
        >
          <p className="text-xs font-mono text-orange-500 uppercase tracking-wider mb-3">
            Diagnóstico Industrial
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-[1.12] font-display">
            Las empresas no tienen un problema de información. Tienen una ruptura entre análisis y ejecución.
          </h2>
          <p className="mt-6 text-zinc-400 text-base sm:text-lg leading-relaxed">
            Los equipos acumulan reportes aislados, consultorías estáticas y tableros inconexos. Las oportunidades se diluyen en reuniones sin aterrizar en código, diseño o entregables de sprint.
          </p>
        </motion.div>

        {/* 3-Column Bento Cards with Staggered Entrance & Cursor Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {problems.map((problem, idx) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                onMouseMove={handleMouseMove}
                className="spotlight-card liquid-card p-8 rounded-2xl group transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 group-hover:border-orange-500/40 transition-all duration-300 shadow-md">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-orange-300 transition-colors">
                  {problem.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
