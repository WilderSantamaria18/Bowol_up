import React, { useState } from 'react';
import { Rocket, Check, ArrowRight } from 'lucide-react';

export const LandingEnterpriseCta: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section id="solicitar" className="py-28 relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 lens-flare-orange blur-[160px] opacity-40 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6">
        <div className="liquid-floating rounded-3xl p-8 sm:p-16 lg:p-20 text-center relative overflow-hidden">
          <div className="max-w-[720px] mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-lg shadow-orange-500/10">
              <Rocket className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
              Comienza a cerrar el ciclo estratégico en tu organización.
            </h2>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              Acceso selectivo para líderes de innovación, estrategia y producto. Conecta señales con resultados medibles desde el primer mes.
            </p>

            {/* Enterprise Access Form */}
            {submitted ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center gap-3 animate-fadeIn">
                <Check className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  Solicitud registrada institucionalmente. Un estratega de BOWOL se contactará en breve.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="flex-1 h-12 px-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 backdrop-blur-md"
                />
                <button
                  type="submit"
                  className="h-12 px-7 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all duration-150 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_20px_rgba(249,115,22,0.35)] shrink-0 active:scale-[0.985] flex items-center justify-center gap-2"
                >
                  <span>Solicitar Acceso</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <p className="text-xs font-mono text-zinc-500 pt-2">
              Sin tarjeta de crédito requerida • Implementación enterprise dedicada
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
