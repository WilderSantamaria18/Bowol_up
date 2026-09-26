import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

export const LandingImpactNumbers: React.FC = () => {
  const metrics = [
    {
      valueComponent: <AnimatedCounter to={28} suffix="+" duration={1.6} />,
      label: 'Fuentes globales monitoreadas en tiempo continuo.',
      accent: true,
    },
    {
      valueComponent: (
        <span className="flex items-baseline">
          <AnimatedCounter to={14} duration={1.8} />
          <span className="text-2xl sm:text-4xl font-semibold ml-2">Días</span>
        </span>
      ),
      label: 'Tiempo promedio de detección de señal a inicio de sprint.',
      accent: false,
    },
    {
      valueComponent: <AnimatedCounter to={100} suffix="%" duration={2.0} />,
      label: 'Trazabilidad con fuentes originales y evidencia.',
      accent: false,
    },
    {
      valueComponent: (
        <span className="flex items-baseline">
          <span>1</span>
          <span className="text-2xl sm:text-4xl font-semibold ml-2">Solo</span>
        </span>
      ),
      label: 'Ciclo unificado para dirección, estrategia y desarrollo.',
      accent: false,
    },
  ];

  return (
    <section id="metricas" className="py-28 relative scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {metrics.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`pl-6 border-l-2 ${
                item.accent ? 'border-orange-500' : 'border-zinc-300 dark:border-white/10 hover:border-orange-500/40'
              } transition-colors`}
            >
              <div className="text-4xl sm:text-6xl font-extrabold text-zinc-950 dark:text-white tracking-tight tabular-nums font-display">
                {item.valueComponent}
              </div>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
