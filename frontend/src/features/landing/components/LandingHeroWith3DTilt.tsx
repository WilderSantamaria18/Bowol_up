import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Play, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Target, 
  Zap, 
  LayoutDashboard, 
  TrendingUp, 
  Bot, 
  Grid2X2,
  Layers,
  ChevronRight
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export const LandingHeroWith3DTilt: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Framer motion values for buttery smooth 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="relative min-h-[100vh] pt-32 pb-24 overflow-hidden flex flex-col items-center justify-center">
      {/* Dynamic Atmospheric Glows with subtle floating pulse */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.65, 0.85, 0.65] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] lens-flare-orange blur-[120px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/4 -right-40 w-[600px] h-[600px] lens-flare-blue blur-[140px] pointer-events-none -z-10"
      />
      <div className="absolute inset-0 enterprise-grid pointer-events-none -z-10" />

      {/* Eyebrow Badge with entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-200/60 dark:bg-white/[0.04] border border-zinc-300/80 dark:border-white/[0.08] backdrop-blur-md text-xs text-zinc-700 dark:text-zinc-300 mb-8 shadow-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
        </span>
        <span className="font-medium tracking-tight">Enterprise Intelligence Workspace 2026</span>
        <span className="text-zinc-400 dark:text-zinc-600">|</span>
        <span className="text-zinc-600 dark:text-zinc-400">SOC2 Type II Certificado</span>
      </motion.div>

      {/* Hero Typography with Apple Stagger Blur Reveal */}
      <div className="max-w-[1100px] mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.08] font-display"
        >
          Del ruido del mercado a la <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 dark:from-orange-400 dark:via-amber-300 dark:to-orange-500">
            ejecución estratégica real.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-[720px] mx-auto font-normal leading-relaxed"
        >
          BOWOL conecta señales de mercado, análisis competitivo FODA y formulación de hipótesis con los sprints ejecutables de tu equipo. Un solo ciclo continuo.
        </motion.p>

        {/* CTAs with Spring Physics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_24px_rgba(249,115,22,0.35)]"
            >
              <span>Comenzar prueba empresarial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 backdrop-blur-xl transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>Ver terminal de producto</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Security & Status Micro-Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-10 flex items-center justify-center gap-8 text-xs text-zinc-500 font-mono flex-wrap"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>TLS 1.3 ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SYSTEM OPERATIONAL</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>GDPR & SOC2 COMPLIANT</span>
          </div>
        </motion.div>
      </div>

      {/* ==================== 3D FLOATING PRODUCT MOCKUP WITH FRAMER SPRINGS ==================== */}
      <motion.div
        ref={wrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1240px] px-4 sm:px-6 mt-16 relative"
        style={{ perspective: '2000px' }}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="liquid-card rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)] will-change-transform relative group animate-subtle-float"
        >
          {/* Dynamic Specular Glare Reflection moving with mouse */}
          <motion.div
            style={{
              background: `radial-gradient(600px circle at ${glareX} ${glareY}, rgba(255,255,255,0.08), transparent 70%)`,
            }}
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          />

          {/* Mockup Window Chrome */}
          <div className="h-11 px-5 border-b border-white/[0.08] bg-[#12131a]/85 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:opacity-100 transition-opacity" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:opacity-100 transition-opacity" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity" />
              <div className="ml-4 h-6 px-3 rounded-md bg-zinc-900/90 border border-white/[0.06] flex items-center gap-2 text-[11px] text-zinc-400 font-mono shadow-inner">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>app.bowol.ai/workspace/enterprise</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
                Sprint 14 • 94% Completado
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
          </div>

          {/* App Interface Content Preview */}
          <div className="grid grid-cols-12 min-h-[560px] bg-[#0d0e15]">
            {/* Internal Sidebar */}
            <div className="hidden lg:col-span-3 lg:flex flex-col p-4 border-r border-white/[0.08] bg-[#12131a]/50 justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs">
                    AC
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-white">Acme Corp</p>
                    <p className="text-[10px] font-mono text-zinc-500">ENTERPRISE TIER</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Inteligencia</p>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.08] text-white text-xs font-medium border border-white/5 shadow-sm">
                    <LayoutDashboard className="w-3.5 h-3.5 text-orange-400" />
                    <span>Dashboard Ejecutivo</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Radar de Tendencias</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                    <Bot className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Asistente IA</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                    <Grid2X2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Matriz FODA</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5">
                  <p className="px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Estrategia & Ejecución</p>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium">
                    <Target className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Oportunidades RICE</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Sprints de Validación</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Conexión Segura</span>
                </div>
                <span className="font-mono text-zinc-500">v2.4 Enterprise</span>
              </div>
            </div>

            {/* Main Dashboard View Inside Mockup */}
            <div className="col-span-12 lg:col-span-9 p-6 lg:p-8 space-y-6 bg-gradient-to-b from-[#12131A] to-[#0A0A0C]">
              {/* KPI Row with Animated Rolling Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:border-orange-500/30 transition-colors">
                  <div className="flex justify-between items-start text-xs text-zinc-400 font-medium">
                    <span>Índice de Señal de Mercado</span>
                    <Activity className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums font-display">
                      <AnimatedCounter to={88.4} decimals={1} duration={2.2} />
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">/ 100</span>
                  </div>
                  <p className="mt-2 text-xs text-orange-400 flex items-center gap-1 font-medium">
                    <span>+12.6% vs mes anterior</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:border-amber-500/30 transition-colors">
                  <div className="flex justify-between items-start text-xs text-zinc-400 font-medium">
                    <span>Iniciativas RICE Activas</span>
                    <Target className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums font-display">
                      <AnimatedCounter to={24} duration={1.8} />
                    </span>
                    <span className="text-xs text-zinc-500">en roadmap</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> 4 Alta
                    <span className="w-2 h-2 rounded-full bg-amber-400 ml-2" /> 12 Media
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start text-xs text-zinc-400 font-medium">
                    <span>Velocidad de Sprints</span>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums font-display">
                      <AnimatedCounter to={94} suffix="%" duration={2.0} />
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">cumplimiento</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">Sprint 14: Validación IA</p>
                </div>
              </div>

              {/* Bento Detail Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Radar Table Snippet */}
                <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-white tracking-tight">Radar de Señales Tecnológicas</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded">TIEMPO REAL</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-orange-500/30 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">Modelos SLM Perimetrales</p>
                        <p className="text-[10px] text-zinc-500">Inferencia local optimizada</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-zinc-300">82%</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">Crítico</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-amber-500/30 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">Orquestación Multi-Agente</p>
                        <p className="text-[10px] text-zinc-500">SaaS loop execution</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-zinc-300">68%</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">Alto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FODA Synthesis Snippet */}
                <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold text-white tracking-tight">Síntesis FODA Automática</span>
                      <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">4 CUADRANTES</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      "Se detecta una divergencia positiva del 14% entre la adopción de modelos locales por competidores tier-1 y nuestra capacidad técnica en Sprint 14."
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                    <span>Fuente: Engine BOWOL IA</span>
                    <span className="text-orange-400 font-medium flex items-center gap-1 cursor-pointer hover:text-orange-300">
                      Ver matriz <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
