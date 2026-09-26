import React from 'react';

export const LandingImpactNumbers: React.FC = () => {
  return (
    <section id="metricas" className="py-28 relative scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="border-l-2 border-orange-500/40 pl-6">
            <p className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight tabular-nums font-display">
              28+
            </p>
            <p className="mt-2 text-sm text-zinc-400 font-medium">
              Fuentes globales monitoreadas en tiempo continuo.
            </p>
          </div>
          <div className="border-l-2 border-white/10 pl-6">
            <p className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight tabular-nums font-display">
              14 Días
            </p>
            <p className="mt-2 text-sm text-zinc-400 font-medium">
              Tiempo promedio de detección de señal a inicio de sprint.
            </p>
          </div>
          <div className="border-l-2 border-white/10 pl-6">
            <p className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight tabular-nums font-display">
              100%
            </p>
            <p className="mt-2 text-sm text-zinc-400 font-medium">
              Trazabilidad con fuentes originales y evidencia.
            </p>
          </div>
          <div className="border-l-2 border-white/10 pl-6">
            <p className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight tabular-nums font-display">
              1 Solo
            </p>
            <p className="mt-2 text-sm text-zinc-400 font-medium">
              Ciclo unificado para dirección, estrategia y desarrollo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
