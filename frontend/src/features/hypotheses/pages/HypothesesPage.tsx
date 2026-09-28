import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FlaskConical, 
  Sparkles, 
  Plus, 
  Beaker, 
  Filter, 
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { hypothesisService } from '../services/hypothesisService';
import { experimentService } from '@/features/experiments/services/experimentService';
import { opportunityService } from '@/features/opportunities/services/opportunityService';
import { Hypothesis, CreateHypothesisPayload, RecordHypothesisResultPayload } from '../types';
import { Experiment, ExperimentStatus, CreateExperimentPayload, RecordExperimentConclusionPayload } from '@/features/experiments/types';
import { HypothesisCard } from '../components/HypothesisCard';
import { CreateHypothesisModal } from '../components/CreateHypothesisModal';
import { RecordResultModal } from '../components/RecordResultModal';
import { AIFormulateHypothesisModal } from '../components/AIFormulateHypothesisModal';
import { ExperimentCard } from '@/features/experiments/components/ExperimentCard';
import { CreateExperimentModal } from '@/features/experiments/components/CreateExperimentModal';
import { RecordConclusionModal } from '@/features/experiments/components/RecordConclusionModal';

type ActiveTab = 'hypotheses' | 'experiments';

export const HypothesesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlOpportunityId = searchParams.get('opportunityId') || '';
  const urlTitle = searchParams.get('title') || '';
  const shouldOpenCreate = searchParams.get('create') === 'true';
  const shouldOpenAI = searchParams.get('ai') === 'true';

  const [activeTab, setActiveTab] = useState<ActiveTab>('hypotheses');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateHypoOpen, setIsCreateHypoOpen] = useState(shouldOpenCreate && !shouldOpenAI);
  const [isAIFormulateOpen, setIsAIFormulateOpen] = useState(shouldOpenCreate && shouldOpenAI);
  const [isRecordResultOpen, setIsRecordResultOpen] = useState(false);
  const [selectedHypoForResult, setSelectedHypoForResult] = useState<Hypothesis | null>(null);

  const [isCreateExpOpen, setIsCreateExpOpen] = useState(false);
  const [selectedHypoForExp, setSelectedHypoForExp] = useState<string | undefined>(undefined);
  const [isRecordConclusionOpen, setIsRecordConclusionOpen] = useState(false);
  const [selectedExpForConclusion, setSelectedExpForConclusion] = useState<Experiment | null>(null);

  const [projectConversionNotice, setProjectConversionNotice] = useState<{ id: string; name: string } | null>(null);

  // Queries
  const { data: hypotheses = [], isLoading: isLoadingHypo } = useQuery({
    queryKey: ['hypotheses'],
    queryFn: () => hypothesisService.getHypotheses(),
  });

  const { data: experiments = [], isLoading: isLoadingExp } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => experimentService.getExperiments(),
  });

  const { data: oppBoard } = useQuery({
    queryKey: ['opportunity-board'],
    queryFn: () => opportunityService.getBoard(),
  });

  const allOpportunities = oppBoard
    ? Object.values(oppBoard).flat()
    : [];

  React.useEffect(() => {
    if (shouldOpenCreate) {
      if (shouldOpenAI) {
        setIsAIFormulateOpen(true);
      } else {
        setIsCreateHypoOpen(true);
      }
    }
  }, [shouldOpenCreate, shouldOpenAI]);

  // Mutations
  const createHypoMutation = useMutation({
    mutationFn: (payload: CreateHypothesisPayload) => hypothesisService.createHypothesis(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
      setIsCreateHypoOpen(false);
      if (shouldOpenCreate) setSearchParams({});
    },
  });

  const formulateAIMutation = useMutation({
    mutationFn: (opportunityId: string) => hypothesisService.formulateFromOpportunity(opportunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
      setIsAIFormulateOpen(false);
      if (shouldOpenCreate) setSearchParams({});
    },
  });

  const recordResultMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecordHypothesisResultPayload }) =>
      hypothesisService.recordResult(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
      setIsRecordResultOpen(false);
      setSelectedHypoForResult(null);
    },
  });

  const deleteHypoMutation = useMutation({
    mutationFn: (id: string) => hypothesisService.deleteHypothesis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
    },
  });

  const convertToProjectMutation = useMutation({
    mutationFn: (id: string) => hypothesisService.convertToProject(id),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setProjectConversionNotice({ id: project.id, name: project.name });
    },
  });

  const createExpMutation = useMutation({
    mutationFn: (payload: CreateExperimentPayload) => experimentService.createExperiment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
      setIsCreateExpOpen(false);
      setSelectedHypoForExp(undefined);
    },
  });

  const updateExpStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ExperimentStatus }) =>
      experimentService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
    },
  });

  const recordConclusionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecordExperimentConclusionPayload }) =>
      experimentService.recordConclusion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
      setIsRecordConclusionOpen(false);
      setSelectedExpForConclusion(null);
    },
  });

  const deleteExpMutation = useMutation({
    mutationFn: (id: string) => experimentService.deleteExperiment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  // Handlers
  const handleOpenRecordResult = (hypo: Hypothesis) => {
    setSelectedHypoForResult(hypo);
    setIsRecordResultOpen(true);
  };

  const handleOpenCreateExperiment = (hypo: Hypothesis) => {
    setSelectedHypoForExp(hypo.id);
    setIsCreateExpOpen(true);
  };

  const handleOpenRecordConclusion = (exp: Experiment) => {
    setSelectedExpForConclusion(exp);
    setIsRecordConclusionOpen(true);
  };

  // KPIs
  const kpiStats = useMemo(() => {
    const totalHypo = hypotheses.length;
    const runningHypo = hypotheses.filter(h => h.status === 'RUNNING').length;
    const supportedHypo = hypotheses.filter(h => h.result === 'SUPPORTED').length;
    const refutedHypo = hypotheses.filter(h => h.result === 'REFUTED').length;
    const activeExps = experiments.filter(e => e.status === 'RUNNING' || e.status === 'PLANNED').length;

    return { totalHypo, runningHypo, supportedHypo, refutedHypo, activeExps };
  }, [hypotheses, experiments]);

  // Filtering
  const filteredHypotheses = useMemo(() => {
    return hypotheses.filter((h) => {
      const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query ||
        h.statement?.toLowerCase().includes(query) ||
        h.validationMethod?.toLowerCase().includes(query) ||
        h.successMetric?.toLowerCase().includes(query) ||
        h.targetSegment?.toLowerCase().includes(query) ||
        h.problemStatement?.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [hypotheses, statusFilter, searchQuery]);

  const filteredExperiments = useMemo(() => {
    return experiments.filter((e) => {
      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query ||
        e.name?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.method?.toLowerCase().includes(query) ||
        e.ownerName?.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [experiments, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <FlaskConical className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Experimentación & Validación
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Formulación rigurosa bajo metodología Lean Startup & Test Cards para mitigar riesgos antes del desarrollo
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            data-testid="open-ai-formulate-modal"
            onClick={() => setIsAIFormulateOpen(true)}
            leftIcon={Sparkles}
            className="text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          >
            Formular con IA
          </Button>

          {activeTab === 'hypotheses' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateHypoOpen(true)}
              leftIcon={Plus}
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40"
            >
              Nueva Hipótesis
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedHypoForExp(undefined);
                setIsCreateExpOpen(true);
              }}
              leftIcon={Plus}
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40"
            >
              Nuevo Experimento
            </Button>
          )}
        </div>
      </div>

      {/* Project Conversion Notice Banner */}
      {projectConversionNotice && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
            <span>
              Proyecto creado exitosamente desde hipótesis validada: <strong>{projectConversionNotice.name}</strong>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/tasks?projectId=${projectConversionNotice.id}&autoDecompose=true`)}
            className="text-purple-300 hover:text-white underline text-xs"
          >
            Ver Backlog & Tareas &rarr;
          </Button>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Hipótesis</span>
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-white mt-1">{kpiStats.totalHypo}</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>En Test / Running</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-blue-300 mt-1">{kpiStats.runningHypo}</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Validadas (Supported)</span>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-emerald-300 mt-1">{kpiStats.supportedHypo}</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Refutadas (Refuted)</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-rose-300 mt-1">{kpiStats.refutedHypo}</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015] col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Experimentos Activos</span>
            <Beaker className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-amber-300 mt-1">{kpiStats.activeExps}</p>
        </div>
      </div>

      {/* Tab Switcher & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl self-start">
          <button
            onClick={() => {
              setActiveTab('hypotheses');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hypotheses'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Hipótesis de Negocio</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/[0.08] text-zinc-300">
              {hypotheses.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('experiments');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'experiments'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Beaker className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Experimentos Tácticos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/[0.08] text-zinc-300">
              {experiments.length}
            </span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2.5 flex-1 sm:justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por supuesto, métrica, método o segmento..."
              className="w-full text-xs bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" strokeWidth={1.5} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/40 border border-white/[0.08] rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/40"
            >
              <option value="ALL">Todos los Estados</option>
              {activeTab === 'hypotheses' ? (
                <>
                  <option value="DRAFT">DRAFT (Borrador)</option>
                  <option value="READY">READY (Lista)</option>
                  <option value="RUNNING">RUNNING (En Prueba)</option>
                  <option value="VALIDATED">VALIDATED (Validada)</option>
                  <option value="INVALIDATED">INVALIDATED (Refutada)</option>
                  <option value="CANCELED">CANCELED (Cancelada)</option>
                </>
              ) : (
                <>
                  <option value="PLANNED">PLANNED (Planificado)</option>
                  <option value="RUNNING">RUNNING (En Curso)</option>
                  <option value="COMPLETED">COMPLETED (Completado)</option>
                  <option value="ABORTED">ABORTED (Cancelado)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {activeTab === 'hypotheses' ? (
        isLoadingHypo ? (
          <div className="py-16 text-center text-zinc-500 text-sm">Cargando hipótesis...</div>
        ) : filteredHypotheses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center bg-surface-subtle/40">
            <FlaskConical className="w-10 h-10 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-zinc-300 mb-1">No hay hipótesis registradas</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
              Formula supuestos falsables basados en oportunidades de innovación o utiliza el agente IA para derivarlas.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAIFormulateOpen(true)}
                className="bg-orange-600 hover:bg-orange-500 text-white gap-2"
              >
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                Formular con IA
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCreateHypoOpen(true)}
              >
                Crear Manualmente
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHypotheses.map((h) => (
              <HypothesisCard
                key={h.id}
                hypothesis={h}
                onRecordResult={handleOpenRecordResult}
                onCreateExperiment={handleOpenCreateExperiment}
                onConvertToProject={(id) => convertToProjectMutation.mutate(id)}
                onDelete={(id) => deleteHypoMutation.mutate(id)}
                isConverting={convertToProjectMutation.isPending}
              />
            ))}
          </div>
        )
      ) : (
        isLoadingExp ? (
          <div className="py-16 text-center text-zinc-500 text-sm">Cargando experimentos...</div>
        ) : filteredExperiments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center bg-surface-subtle/40">
            <Beaker className="w-10 h-10 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-zinc-300 mb-1">No hay experimentos registrados</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
              Diseña pruebas controladas (Test A/B, MVP Concierge, Prototipo) para validar tus hipótesis activas.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateExpOpen(true)}
              className="gap-2 text-cyan-400"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Diseñar Experimento
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExperiments.map((e) => (
              <ExperimentCard
                key={e.id}
                experiment={e}
                onUpdateStatus={(id, status) => updateExpStatusMutation.mutate({ id, status })}
                onRecordConclusion={handleOpenRecordConclusion}
                onDelete={(id) => deleteExpMutation.mutate(id)}
              />
            ))}
          </div>
        )
      )}

      {/* Modals */}
      <CreateHypothesisModal
        isOpen={isCreateHypoOpen}
        onClose={() => setIsCreateHypoOpen(false)}
        onSubmit={(payload) => createHypoMutation.mutate(payload)}
        opportunities={allOpportunities}
        initialOpportunityId={urlOpportunityId}
        initialStatement={urlTitle}
        isLoading={createHypoMutation.isPending}
      />

      <AIFormulateHypothesisModal
        isOpen={isAIFormulateOpen}
        onClose={() => setIsAIFormulateOpen(false)}
        onFormulate={(opportunityId) => formulateAIMutation.mutate(opportunityId)}
        opportunities={allOpportunities}
        initialOpportunityId={urlOpportunityId}
        isLoading={formulateAIMutation.isPending}
      />

      <RecordResultModal
        hypothesis={selectedHypoForResult}
        isOpen={isRecordResultOpen}
        onClose={() => {
          setIsRecordResultOpen(false);
          setSelectedHypoForResult(null);
        }}
        onSubmit={(payload) => {
          if (selectedHypoForResult) {
            recordResultMutation.mutate({ id: selectedHypoForResult.id, payload });
          }
        }}
        isLoading={recordResultMutation.isPending}
      />

      <CreateExperimentModal
        isOpen={isCreateExpOpen}
        onClose={() => {
          setIsCreateExpOpen(false);
          setSelectedHypoForExp(undefined);
        }}
        onSubmit={(payload) => createExpMutation.mutate(payload)}
        hypotheses={hypotheses}
        defaultHypothesisId={selectedHypoForExp}
        isLoading={createExpMutation.isPending}
      />

      <RecordConclusionModal
        experiment={selectedExpForConclusion}
        isOpen={isRecordConclusionOpen}
        onClose={() => {
          setIsRecordConclusionOpen(false);
          setSelectedExpForConclusion(null);
        }}
        onSubmit={(payload) => {
          if (selectedExpForConclusion) {
            recordConclusionMutation.mutate({ id: selectedExpForConclusion.id, payload });
          }
        }}
        isLoading={recordConclusionMutation.isPending}
      />
    </div>
  );
};
