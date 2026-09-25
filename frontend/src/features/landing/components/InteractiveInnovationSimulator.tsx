import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  GitBranch, 
  Youtube
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface IndustryDemo {
  id: string;
  name: string;
  icon: string;
  trendTitle: string;
  trendDescription: string;
  trendScore: number;
  sources: { githubStars: string; youtubeViews: string; velocity: string };
  fodaType: 'FORTALEZA' | 'OPORTUNIDAD';
  fodaText: string;
  riceScore: number;
  riceReach: string;
  riceImpact: string;
  sprintTasks: string[];
}

const DEMOS: Record<string, IndustryDemo> = {
  fintech: {
    id: 'fintech',
    name: 'Fintech & Pagos',
    icon: '💳',
    trendTitle: 'Conciliación Financiera Autónoma con LLMs',
    trendDescription: 'Aparición de agentes autónomos que reducen en 90% el tiempo de resolución de discrepancias bancarias multidivisa.',
    trendScore: 94,
    sources: { githubStars: '+3.4k ⭐', youtubeViews: '48k vistas', velocity: '+240% este mes' },
    fodaType: 'OPORTUNIDAD',
    fodaText: 'Integrar pipeline de conciliación antes del cierre fiscal del Q4 reduce el churn en un 18%.',
    riceScore: 780,
    riceReach: '12,000 tx/mes',
    riceImpact: 'Alto (3x)',
    sprintTasks: [
      'Configurar conector de webhook bancario seguro',
      'Prompt pipeline para detección de discrepancias',
      'Vista de aprobación para oficiales de cumplimiento'
    ],
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce & Retail',
    icon: '🛒',
    trendTitle: 'Búsqueda Visual Vectorial con CLIP en Tiempo Real',
    trendDescription: 'Reemplazo de filtros de texto por similitud visual instantánea sobre catálogo fotográfico.',
    trendScore: 91,
    sources: { githubStars: '+5.1k ⭐', youtubeViews: '82k vistas', velocity: '+185% este mes' },
    fodaType: 'FORTALEZA',
    fodaText: 'El catálogo existente de 50k productos ya posee embeddings generados en PostgreSQL.',
    riceScore: 840,
    riceReach: '45,000 usuarios',
    riceImpact: 'Masivo (3x)',
    sprintTasks: [
      'Indexar vectores de producto en pgvector',
      'Microservicio de inferencia de embeddings visuales',
      'Componente de búsqueda por arrastre de imagen'
    ],
  },
  health: {
    id: 'health',
    name: 'Salud & Biotech',
    icon: '🏥',
    trendTitle: 'Extracción Automatizada de Registros Médicos HL7',
    trendDescription: 'Modelos de lenguaje especializados en normativas de interoperabilidad médica y anonimización HIPAA.',
    trendScore: 89,
    sources: { githubStars: '+2.8k ⭐', youtubeViews: '29k vistas', velocity: '+160% este mes' },
    fodaType: 'OPORTUNIDAD',
    fodaText: 'Cumplir con interoperabilidad abre acuerdos con 3 redes hospitalarias regionales.',
    riceScore: 720,
    riceReach: '8 hospitales',
    riceImpact: 'Crítico (3x)',
    sprintTasks: [
      'Validador de esquema FHIR / HL7v2',
      'Pipeline de anonimización criptográfica',
      'Auditoría inmutable de accesos de pacientes'
    ],
  },
  saas: {
    id: 'saas',
    name: 'B2B SaaS & AI',
    icon: '🤖',
    trendTitle: 'Agentes de Retención Proactiva con Análisis de Sentimiento',
    trendDescription: 'Detección temprana de clientes en riesgo de cancelación mediante telemetría y tickets de soporte.',
    trendScore: 97,
    sources: { githubStars: '+8.2k ⭐', youtubeViews: '115k vistas', velocity: '+320% este mes' },
    fodaType: 'FORTALEZA',
    fodaText: 'Integración nativa con eventos de usuario permite disparar ofertas de retención automatizadas.',
    riceScore: 920,
    riceReach: '8,500 cuentas',
    riceImpact: 'Transformacional (3x)',
    sprintTasks: [
      'Ingesta de telemetría de uso por tenant',
      'Modelo de scoring de salud de cuenta en tiempo real',
      'Automatización de alertas a gerentes de éxito (CSM)'
    ],
  },
};

export const InteractiveInnovationSimulator: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('saas');
  const [isScanning, setIsScanning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(3); // 1: Trend, 2: Strategy, 3: Execution
  const [isSimulatedSprint, setIsSimulatedSprint] = useState(false);

  const demo = DEMOS[selectedIndustry];

  const handleIndustryChange = (key: string) => {
    if (key === selectedIndustry) return;
    setIsScanning(true);
    setIsSimulatedSprint(false);
    setTimeout(() => {
      setSelectedIndustry(key);
      setIsScanning(false);
    }, 450);
  };

  return (
    <div className="rounded-3xl liquid-glass border border-white/[0.1] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-pill text-xs text-orange-400 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulador Interactivo en Vivo
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
            Experimenta el Ciclo BOWOL en tu Industria
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Selecciona un sector para ver cómo el sistema detecta señales, formula estrategias y genera sprints en segundos.
          </p>
        </div>

        {/* Industry Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(DEMOS).map(([key, item]) => {
            const isSelected = selectedIndustry === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleIndustryChange(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 border border-orange-400'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator Content Area */}
      {isScanning ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" strokeWidth={1.5} />
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Escaneando señales de mercado con IA...
          </p>
        </div>
      ) : (
        <div className="pt-6 space-y-6">
          {/* Progress Step Navigation Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-zinc-950/70 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeStep === 1
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Señal & TrendScore</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeStep === 2
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-orange-400" />
              <span>2. FODA & RICE</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeStep === 3
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Sprint Descompuesto</span>
            </button>
          </div>

          {/* Interactive Stage Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Stage 1: Market Signal */}
            <div
              className={`rounded-2xl p-5 border transition-all ${
                activeStep === 1
                  ? 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/5'
                  : 'bg-zinc-900/50 border-white/[0.06] opacity-80 hover:opacity-100 cursor-pointer'
              }`}
              onClick={() => setActiveStep(1)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider font-bold text-blue-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Detección Continua
                </span>
                <Badge variant="brand" className="font-mono text-xs">
                  Score {demo.trendScore}/100
                </Badge>
              </div>

              <h4 className="text-base font-bold text-white mb-2 leading-tight">
                {demo.trendTitle}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                {demo.trendDescription}
              </p>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-300">
                  <GitBranch className="w-3 h-3 text-orange-400" /> {demo.sources.githubStars}
                </span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Youtube className="w-3 h-3 text-red-400" /> {demo.sources.youtubeViews}
                </span>
                <span className="text-emerald-400 font-semibold">{demo.sources.velocity}</span>
              </div>
            </div>

            {/* Stage 2: Strategic Decision */}
            <div
              className={`rounded-2xl p-5 border transition-all ${
                activeStep === 2
                  ? 'bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/5'
                  : 'bg-zinc-900/50 border-white/[0.06] opacity-80 hover:opacity-100 cursor-pointer'
              }`}
              onClick={() => setActiveStep(2)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider font-bold text-orange-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Matriz & RICE
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  RICE: {demo.riceScore}
                </span>
              </div>

              <div className="mb-3">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mb-1">
                  {demo.fodaType} IDENTIFICADA
                </span>
                <p className="text-xs text-zinc-300 italic">
                  "{demo.fodaText}"
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-zinc-950/60 border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-500 block uppercase">Alcance</span>
                  <span className="text-zinc-200 font-bold">{demo.riceReach}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/60 border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-500 block uppercase">Impacto</span>
                  <span className="text-orange-400 font-bold">{demo.riceImpact}</span>
                </div>
              </div>
            </div>

            {/* Stage 3: Sprint Execution */}
            <div
              className={`rounded-2xl p-5 border transition-all ${
                activeStep === 3
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-zinc-900/50 border-white/[0.06] opacity-80 hover:opacity-100 cursor-pointer'
              }`}
              onClick={() => setActiveStep(3)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Tareas de Sprint
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">3 historias generadas</span>
              </div>

              <div className="space-y-2 mb-4">
                {demo.sprintTasks.map((task, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-zinc-950/70 border border-white/[0.06] flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-300 font-medium truncate mr-2">{task}</span>
                    <Badge variant={isSimulatedSprint ? 'success' : 'default'} className="text-[10px]">
                      {isSimulatedSprint ? 'En Sprint' : 'Backlog'}
                    </Badge>
                  </div>
                ))}
              </div>

              <Button
                variant={isSimulatedSprint ? 'secondary' : 'primary'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSimulatedSprint(!isSimulatedSprint);
                }}
                className="w-full justify-center text-xs shadow-md shadow-orange-500/15"
              >
                {isSimulatedSprint ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Sprint Planificado con Éxito
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Lanzar Tareas al Sprint
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
