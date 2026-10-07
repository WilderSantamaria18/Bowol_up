import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, FileX2 } from 'lucide-react';

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
      icon: MessageSquare,
      title: 'Tareas Dispersas y Olvidos',
      description:
        'Mensajes en WhatsApp, audios y notas sueltas. Sin un lugar centralizado, el equipo no sabe con certeza qué tiene prioridad hoy ni quién es el responsable.',
    },
    {
      icon: Clock,
      title: 'Horas Perdidas Planificando a Mano',
      description:
        'Armar listas, calendarios y cronogramas manualmente consume horas que un emprendedor debería estar dedicando a vender, producir y atender clientes.',
    },
    {
      icon: FileX2,
      title: 'Metas que Nunca se Ejecutan',
      description:
        'Grandes objetivos de ventas, marketing u operaciones que se quedan en buenas intenciones porque no existe un sistema que los convierta en actividades prácticas diarias.',
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
          <p className="text-xs font-mono text-orange-500 uppercase tracking-wider mb-3 font-semibold">
            El Reto de los Negocios Pequeños
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold text-zinc-950 dark:text-white tracking-tight leading-[1.12] font-display">
            La mayoría de emprendimientos no fracasan por falta de ideas, sino por falta de un sistema para planificar su día a día.
          </h2>
          <p className="mt-6 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
            Sin un planificador automatizado, los equipos pequeños caen en el desorden operativo. Las prioridades se diluyen en mensajes urgentes y las metas del negocio quedan postergadas.
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
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-white/[0.04] border border-orange-500/20 dark:border-white/[0.08] flex items-center justify-center text-orange-500 dark:text-orange-400 mb-6 group-hover:scale-110 group-hover:border-orange-500/40 transition-all duration-300 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
                  {problem.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
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
