import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface HeroSlide {
  id: string;
  badge: string;
  tag: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 'orquestacion',
    badge: 'Enterprise Intelligence Workspace 2026',
    tag: 'Fase 01 a 04 • Ciclo Continuo',
    titlePrefix: 'Del ruido del mercado a la',
    titleHighlight: 'ejecución estratégica real.',
    subtitle: 'BOWOL conecta señales de mercado, análisis competitivo FODA y formulación de hipótesis con los sprints ejecutables de tu equipo. Un solo ciclo continuo.',
    primaryCtaText: 'Comenzar prueba empresarial',
    primaryCtaLink: '/register',
    secondaryCtaText: 'Ver terminal de producto',
    secondaryCtaLink: '#interactive-demo',
  },
  {
    id: 'radar',
    badge: 'Detección Temprana Multi-Fuente',
    tag: '28+ Fuentes Científicas & Mercado',
    titlePrefix: 'De la señal competitiva al',
    titleHighlight: 'descubrimiento validado con IA.',
    subtitle: 'Monitoreo de papers arXiv, actividad en GitHub y presentaciones SEC. Transforma datos dispersos en evidencia científica para decisiones corporativas inmediatas.',
    primaryCtaText: 'Explorar radar de señales',
    primaryCtaLink: '#ciclo',
    secondaryCtaText: 'Ver fuentes verificadas',
    secondaryCtaLink: '#interactive-demo',
  },
  {
    id: 'sprints',
    badge: 'Priorización Matemática RICE',
    tag: 'AI Backlog Decomposer Integrado',
    titlePrefix: 'De la hipótesis estratégica al',
    titleHighlight: 'sprint ejecutable sin fricción.',
    subtitle: 'Descompón epics en tareas listas para producción con estimación objetiva de impacto, confianza y esfuerzo. Sin reuniones infinitas ni documentos muertos.',
    primaryCtaText: 'Solicitar acceso enterprise',
    primaryCtaLink: '#solicitar',
    secondaryCtaText: 'Simular sprint activo',
    secondaryCtaLink: '#interactive-demo',
  },
  {
    id: 'seguridad',
    badge: 'Arquitectura Enterprise Blindada',
    tag: 'SOC2 Type II • Multi-Tenant RLS',
    titlePrefix: 'Gobierno de datos y compliance',
    titleHighlight: 'con aislamiento criptográfico.',
    subtitle: 'Aislamiento estricto de tenants con Row-Level Security, firmas criptográficas RS256, auditoría inmutable y cumplimiento pleno con GDPR y soberanía de datos.',
    primaryCtaText: 'Conocer arquitectura de seguridad',
    primaryCtaLink: '#plataforma',
    secondaryCtaText: 'Contactar a soporte enterprise',
    secondaryCtaLink: '#solicitar',
  },
];

export const LandingHeroWith3DTilt: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

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

  // Autoplay for Hero Title Carousel (5.5s per slide)
  useEffect(() => {
    if (isCarouselPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isCarouselPaused]);

  const currentSlide = heroSlides[activeSlide];

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  return (
    <section className="relative min-h-[100vh] pt-28 pb-24 overflow-hidden flex flex-col items-center justify-center">
      {/* Dynamic Calibrated Atmospheric Ambient Background Animations (Soft, non-blinding) */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.10, 0.18, 0.10] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[750px] h-[450px] lens-flare-orange blur-[120px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{ scale: [1, 1.10, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/4 -right-36 w-[550px] h-[550px] lens-flare-blue blur-[140px] pointer-events-none -z-10"
      />
      
      {/* Subtle Floating Ambient Geometric Rings */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full border border-orange-500/[0.04] dark:border-white/[0.03] pointer-events-none animate-subtle-float -z-10" />
      <div className="absolute top-48 right-12 w-80 h-80 rounded-full border border-orange-500/[0.03] dark:border-white/[0.02] pointer-events-none -z-10" style={{ animationDelay: '2s' }} />

      <div className="absolute inset-0 enterprise-grid pointer-events-none -z-10 opacity-70 dark:opacity-100" />

      {/* ==================== TITLE & VALUE PROPOSITION CAROUSEL ==================== */}
      <div 
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
        className="max-w-[1100px] mx-auto px-6 text-center w-full"
      >
        {/* Eyebrow Badge & Slide Category Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`badge-${currentSlide.id}`}
              initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-200/80 dark:bg-white/[0.06] border border-zinc-300/80 dark:border-white/[0.08] backdrop-blur-md text-xs text-zinc-800 dark:text-zinc-200 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="font-semibold tracking-tight">{currentSlide.badge}</span>
              <span className="text-zinc-400 dark:text-zinc-600">|</span>
              <span className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">{currentSlide.tag}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dynamic Carousel Headline with Blur-Fade Cross-Transition */}
        <div className="min-h-[140px] sm:min-h-[160px] lg:min-h-[180px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${currentSlide.id}`}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.08] font-display max-w-[960px] mx-auto"
            >
              {currentSlide.titlePrefix} <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 dark:from-orange-400 dark:via-amber-300 dark:to-orange-500">
                {currentSlide.titleHighlight}
              </span>
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Dynamic Subtitle */}
        <div className="min-h-[70px] sm:min-h-[60px] flex items-center justify-center mt-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${currentSlide.id}`}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-300 max-w-[760px] mx-auto font-normal leading-relaxed"
            >
              {currentSlide.subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Carousel Pagination Pills with Active Progress Line */}
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <button
            type="button"
            onClick={handlePrevSlide}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition-colors"
            aria-label="Diapositiva anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-200/60 dark:bg-white/[0.04] border border-zinc-300/80 dark:border-white/[0.08]">
            {heroSlides.map((slide, idx) => {
              const isActive = activeSlide === idx;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all overflow-hidden ${
                    isActive
                      ? 'text-orange-600 dark:text-white bg-white dark:bg-white/[0.1] shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {/* Progress Line for the Active Slide */}
                  {isActive && !isCarouselPaused && (
                    <motion.div
                      key={`hero-bar-${idx}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5.5, ease: 'linear' }}
                      className="absolute bottom-0 left-0 h-[2px] bg-orange-500"
                    />
                  )}
                  <span>0{idx + 1}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNextSlide}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition-colors"
            aria-label="Diapositiva siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Call to Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={currentSlide.primaryCtaLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_24px_rgba(249,115,22,0.35)]"
            >
              <span>{currentSlide.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <a
              href={currentSlide.secondaryCtaLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 backdrop-blur-xl transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{currentSlide.secondaryCtaText}</span>
            </a>
          </motion.div>
        </div>

        {/* High-Contrast Security & Status Micro-Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Multi-Tenant RLS Aislado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-orange-500" />
            <span>Scoring RICE Automatizado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-500" />
            <span>99.9% Uptime SLA</span>
          </div>
        </div>
      </div>

      {/* ==================== 3D FLOATING WORKSPACE MOCKUP WITH FRAMER SPRINGS ==================== */}
      <div
        ref={wrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1200 }}
        className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 mt-16 cursor-pointer"
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="liquid-card rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.12)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)] will-change-transform relative group animate-subtle-float"
        >
          {/* Dynamic Specular Glare Reflection moving with mouse */}
          <motion.div
            style={{
              background: `radial-gradient(600px circle at ${glareX} ${glareY}, rgba(255,255,255,0.08), transparent 70%)`,
            }}
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          />

          {/* Mockup Window Chrome */}
          <div className="h-11 px-5 border-b border-zinc-200/80 dark:border-white/[0.08] bg-zinc-100/90 dark:bg-[#12131a]/85 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:opacity-100 transition-opacity" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:opacity-100 transition-opacity" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity" />
              <div className="ml-4 h-6 px-3 rounded-md bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-white/[0.06] flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono shadow-inner">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>app.bowol.ai/workspace/enterprise</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hidden sm:inline">
                Sprint 14 • 94% Completado
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
          </div>

          {/* App Interface Content Preview */}
          <div className="grid grid-cols-12 min-h-[560px] bg-slate-50 dark:bg-[#0d0e15] transition-colors">
            {/* Internal Sidebar */}
            <div className="hidden lg:col-span-3 lg:flex flex-col p-4 border-r border-zinc-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#12131a]/50 justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.05]">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs">
                    AC
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">Acme Corp</p>
                    <p className="text-[10px] font-mono text-zinc-500">ENTERPRISE TIER</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Inteligencia</p>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-medium border border-zinc-200 dark:border-white/5 shadow-sm">
                    <LayoutDashboard className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                    <span>Dashboard Ejecutivo</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-medium transition-colors">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Radar de Tendencias</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-medium transition-colors">
                    <Bot className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Asistente IA</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-medium transition-colors">
                    <Grid2X2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Matriz FODA</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-zinc-200 dark:border-white/5">
                  <p className="px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Estrategia & Ejecución</p>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                    <Target className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Oportunidades RICE</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Sprints de Validación</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Conexión Segura</span>
                </div>
                <span className="font-mono text-zinc-500">v2.4 Enterprise</span>
              </div>
            </div>

            {/* Main Dashboard View Inside Mockup */}
            <div className="col-span-12 lg:col-span-9 p-6 lg:p-8 space-y-6 bg-gradient-to-b from-white to-slate-100/60 dark:from-[#12131A] dark:to-[#0A0A0C]">
              {/* KPI Row with Animated Rolling Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] backdrop-blur-sm hover:border-orange-500/30 transition-colors shadow-sm">
                  <div className="flex justify-between items-start text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>Índice de Señal de Mercado</span>
                    <Activity className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight tabular-nums font-display">
                      <AnimatedCounter to={88.4} decimals={1} duration={2.2} />
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">/ 100</span>
                  </div>
                  <p className="mt-2 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 font-semibold">
                    <span>+12.6% vs mes anterior</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] backdrop-blur-sm hover:border-amber-500/30 transition-colors shadow-sm">
                  <div className="flex justify-between items-start text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>Iniciativas RICE Activas</span>
                    <Target className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight tabular-nums font-display">
                      <AnimatedCounter to={24} duration={1.8} />
                    </span>
                    <span className="text-xs text-zinc-500">en roadmap</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> 4 Alta
                    <span className="w-2 h-2 rounded-full bg-amber-400 ml-2" /> 12 Media
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] backdrop-blur-sm hover:border-emerald-500/30 transition-colors shadow-sm">
                  <div className="flex justify-between items-start text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>Velocidad de Sprints</span>
                    <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight tabular-nums font-display">
                      <AnimatedCounter to={94} suffix="%" duration={2.0} />
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">cumplimiento</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">Sprint 14: Validación IA</p>
                </div>
              </div>

              {/* Bento Detail Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Radar Table Snippet */}
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.025] border border-zinc-200/80 dark:border-white/[0.06] shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white tracking-tight">Radar de Señales Tecnológicas</span>
                    <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-white/[0.04] px-2 py-0.5 rounded font-medium">TIEMPO REAL</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.04] hover:border-orange-500/30 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Modelos SLM Perimetrales</p>
                        <p className="text-[10px] text-zinc-500">Inferencia local optimizada</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">82%</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">Crítico</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.04] hover:border-amber-500/30 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Orquestación Multi-Agente</p>
                        <p className="text-[10px] text-zinc-500">SaaS loop execution</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">68%</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Alto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FODA Synthesis Snippet */}
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.025] border border-zinc-200/80 dark:border-white/[0.06] flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white tracking-tight">Síntesis FODA Automática</span>
                      <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 font-semibold">4 CUADRANTES</span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      "Se detecta una divergencia positiva del 14% entre la adopción de modelos locales por competidores tier-1 y nuestra capacidad técnica en Sprint 14."
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500">
                    <span>Fuente: Engine BOWOL IA</span>
                    <span className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1 cursor-pointer hover:text-orange-500">
                      Ver matriz <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
