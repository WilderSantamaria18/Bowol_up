import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 lens-flare-orange blur-[160px] pointer-events-none"
      />

      <div className="max-w-[1240px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-floating rounded-3xl p-8 sm:p-16 lg:p-20 text-center relative overflow-hidden"
        >
          <div className="max-w-[720px] mx-auto space-y-6">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <Rocket className="w-7 h-7" />
            </motion.div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
              Comienza a cerrar el ciclo estratégico en tu organización.
            </h2>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              Acceso selectivo para líderes de innovación, estrategia y producto. Conecta señales con resultados medibles desde el primer mes.
            </p>

            {/* Enterprise Access Form */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center gap-3"
              >
                <Check className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  Solicitud registrada institucionalmente. Un estratega de BOWOL se contactará en breve.
                </span>
              </motion.div>
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
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="h-12 px-7 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all duration-150 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_20px_rgba(249,115,22,0.35)] shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Solicitar Acceso</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
            )}

            <p className="text-xs font-mono text-zinc-500 pt-2">
              Sin tarjeta de crédito requerida • Implementación enterprise dedicada
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
