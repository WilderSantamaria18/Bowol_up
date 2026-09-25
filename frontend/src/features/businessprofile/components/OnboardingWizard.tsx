import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Globe2, 
  Target, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { GoalItem, OnboardingPayload } from '../types';
import { OrganizationSize } from '@/features/organization/types';
import { ProblemDetail } from '@/services/http';

interface OnboardingWizardProps {
  onComplete: (data: OnboardingPayload) => Promise<void>;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Form State
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState<OrganizationSize>('SMALL');
  const [market, setMarket] = useState('');
  const [goals, setGoals] = useState<GoalItem[]>([
    { text: 'Aumentar adquisición de clientes calificados', priority: 1 },
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  
  const [problems, setProblems] = useState<string[]>([
    'Procesos manuales repetitivos',
  ]);
  const [newProblemText, setNewProblemText] = useState('');

  const [tools, setTools] = useState<string[]>(['Slack', 'Notion']);
  const [newToolText, setNewToolText] = useState('');

  const [channels, setChannels] = useState<string[]>(['LinkedIn', 'Email B2B']);
  const [newChannelText, setNewChannelText] = useState('');

  const [digitalMaturity, setDigitalMaturity] = useState(50);
  const [aiMaturity, setAiMaturity] = useState(25);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers para agregar y quitar elementos dinámicos
  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      setGoals([...goals, { text: newGoalText.trim(), priority: goals.length + 1 }]);
      setNewGoalText('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleAddProblem = () => {
    if (newProblemText.trim()) {
      setProblems([...problems, newProblemText.trim()]);
      setNewProblemText('');
    }
  };

  const handleRemoveProblem = (index: number) => {
    setProblems(problems.filter((_, i) => i !== index));
  };

  const handleAddTool = () => {
    if (newToolText.trim()) {
      setTools([...tools, newToolText.trim()]);
      setNewToolText('');
    }
  };

  const handleRemoveTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleAddChannel = () => {
    if (newChannelText.trim()) {
      setChannels([...channels, newChannelText.trim()]);
      setNewChannelText('');
    }
  };

  const handleRemoveChannel = (index: number) => {
    setChannels(channels.filter((_, i) => i !== index));
  };

  const validateCurrentStep = (): boolean => {
    setError(null);
    if (step === 1 && !industry.trim()) {
      setError('Por favor indica la industria o sector de tu negocio.');
      return false;
    }
    if (step === 3 && !market.trim()) {
      setError('Por favor define tu mercado geográfico o audiencia.');
      return false;
    }
    if (step === 4 && goals.length === 0) {
      setError('Agrega al menos un objetivo estratégico clave.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(totalSteps, prev + 1));
    }
  };

  const handlePrev = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    setError(null);
    try {
      await onComplete({
        industry: industry.trim(),
        size,
        market: market.trim(),
        goals,
        problems,
        tools,
        competitors: [],
        channels,
        digitalMaturity,
        aiMaturity,
      });
    } catch (err: unknown) {
      const problem = err as ProblemDetail;
      setError(problem?.detail || 'Ocurrió un error al registrar el perfil estratégico');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaturityLabel = (value: number) => {
    if (value <= 25) return 'Inicial (Procesos en exploración y tradicionales)';
    if (value <= 50) return 'Emergente (Adopción parcial y herramientas básicas)';
    if (value <= 75) return 'Integrado (Operaciones digitalizadas y métricas clave)';
    return 'Avanzado (Automatización continua y flujos impulsados por IA)';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold text-zinc-200">
            Paso {step} de {totalSteps}
          </span>
          <span>{Math.round((step / totalSteps) * 100)}% completado</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {error && <Alert variant="error" detail={error} />}

      {/* Steps Content Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08] min-h-[360px] flex flex-col justify-between">
        <div>
          {/* PASO 1: Industria */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Building2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    ¿Cuál es el sector o industria de tu negocio?
                  </h2>
                  <p className="text-xs text-zinc-400">
                    BOWOL adaptará el análisis de mercado e inteligencia estratégica a tu rubro
                  </p>
                </div>
              </div>

              <Input
                label="Sector o Industria principal"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="ej. SaaS B2B, Fintech, Salud, Retail, Logística"
                autoFocus
                required
              />

              <div className="space-y-2">
                <span className="text-xs text-zinc-400">Sugerencias habituales:</span>
                <div className="flex flex-wrap gap-2">
                  {['SaaS B2B', 'Fintech', 'Comercio Electrónico', 'Salud & Biotech', 'Logística & Transporte'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setIndustry(sug)}
                      className="px-3 py-1 rounded-full text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Dimensión del Equipo */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Users className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    ¿Cuál es el tamaño de tu equipo?
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Permite calibrar la capacidad de ejecución y velocidad en sprints
                  </p>
                </div>
              </div>

              <Select
                label="Rango de tamaño de la organización"
                value={size}
                onChange={(e) => setSize(e.target.value as OrganizationSize)}
                options={[
                  { value: 'SOLO', label: 'Solo Founder (1 persona)' },
                  { value: 'MICRO', label: 'Micro (2 - 5 personas)' },
                  { value: 'SMALL', label: 'Pequeña (6 - 20 personas)' },
                  { value: 'MEDIUM', label: 'Mediana (21 - 100 personas)' },
                  { value: 'LARGE', label: 'Grande (101 - 500 personas)' },
                  { value: 'ENTERPRISE', label: 'Enterprise (500+ personas)' },
                ]}
              />
            </div>
          )}

          {/* PASO 3: Mercado y Alcance */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Globe2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    ¿Cuál es tu mercado objetivo o alcance geográfico?
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Ayuda a focalizar la búsqueda de competidores y tendencias regionales
                  </p>
                </div>
              </div>

              <Input
                label="Mercado o Territorio de operación"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                placeholder="ej. Perú, México, Hispanoamérica, Global"
                autoFocus
                required
              />
            </div>
          )}

          {/* PASO 4: Objetivos Clave */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Target className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    ¿Cuáles son tus objetivos estratégicos prioritarios?
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Las hipótesis e iniciativas se alinearán para impactar estas metas
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="ej. Reducir costos de atención al cliente un 30%"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
                />
                <Button type="button" variant="secondary" size="md" onClick={handleAddGoal} leftIcon={Plus}>
                  Agregar
                </Button>
              </div>

              <div className="space-y-2">
                {goals.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                        {g.priority}
                      </span>
                      <span className="text-zinc-200">{g.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(idx)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                      aria-label="Eliminar objetivo"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASO 5: Desafíos y Problemas */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    ¿Qué problemas o cuellos de botella enfrentas hoy?
                  </h2>
                  <p className="text-xs text-zinc-400">
                    El motor de oportunidades buscará soluciones tecnológicas a estas fricciones
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newProblemText}
                  onChange={(e) => setNewProblemText(e.target.value)}
                  placeholder="ej. Poco tiempo para prospección comercial"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProblem())}
                />
                <Button type="button" variant="secondary" size="md" onClick={handleAddProblem} leftIcon={Plus}>
                  Agregar
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {problems.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/[0.08] text-xs text-zinc-300"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => handleRemoveProblem(idx)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors"
                      aria-label="Eliminar problema"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PASO 6: Herramientas y Canales */}
          {step === 6 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Layers className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    Herramientas actuales y canales de crecimiento
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Software con el que opera tu equipo y medios principales de contacto
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Herramientas en uso</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newToolText}
                      onChange={(e) => setNewToolText(e.target.value)}
                      placeholder="ej. HubSpot, Jira, Figma, Stripe"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                    />
                    <Button type="button" variant="secondary" size="md" onClick={handleAddTool} leftIcon={Plus}>
                      Añadir
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tools.map((t, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] text-xs text-zinc-300">
                        {t}
                        <button type="button" onClick={() => handleRemoveTool(idx)} className="text-zinc-500 hover:text-rose-400">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Canales principales</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newChannelText}
                      onChange={(e) => setNewChannelText(e.target.value)}
                      placeholder="ej. LinkedIn, WhatsApp Business, Venta directa"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChannel())}
                    />
                    <Button type="button" variant="secondary" size="md" onClick={handleAddChannel} leftIcon={Plus}>
                      Añadir
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {channels.map((c, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] text-xs text-zinc-300">
                        {c}
                        <button type="button" onClick={() => handleRemoveChannel(idx)} className="text-zinc-500 hover:text-rose-400">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 7: Madurez Digital e Inteligencia Artificial */}
          {step === 7 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Cpu className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    Autodiagnóstico de Madurez Digital e IA
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Establece el punto de partida para medir el progreso de adopción
                  </p>
                </div>
              </div>

              {/* Slider 1: Madurez Digital */}
              <div className="space-y-2 p-4 rounded-xl bg-zinc-900/50 border border-white/[0.06]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-200">Madurez Digital</span>
                  <span className="font-bold text-emerald-400">{digitalMaturity}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={digitalMaturity}
                  onChange={(e) => setDigitalMaturity(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                  aria-label="Nivel de madurez digital"
                />
                <p className="text-[11px] text-zinc-400">{getMaturityLabel(digitalMaturity)}</p>
              </div>

              {/* Slider 2: Madurez de IA */}
              <div className="space-y-2 p-4 rounded-xl bg-zinc-900/50 border border-white/[0.06]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-200">Adopción de Inteligencia Artificial</span>
                  <span className="font-bold text-orange-400">{aiMaturity}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aiMaturity}
                  onChange={(e) => setAiMaturity(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                  aria-label="Nivel de madurez en IA"
                />
                <p className="text-[11px] text-zinc-400">{getMaturityLabel(aiMaturity)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] mt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={step === 1 || isLoading}
            leftIcon={ArrowLeft}
          >
            Anterior
          </Button>

          {step < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={ArrowRight}
            >
              Continuar
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleFinish}
              isLoading={isLoading}
              leftIcon={Check}
            >
              Finalizar Onboarding
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
