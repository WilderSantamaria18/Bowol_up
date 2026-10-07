import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlaskConical, Sparkles, Plus, Beaker, XCircle, Clock, CheckCheck } from 'lucide-react';
import {
  Alert,
  Button,
  CardSkeletonGrid,
  DataState,
  EmptyState,
  FilterSelect,
  ListToolbar,
  PageHeader,
  SearchField,
  SegmentedTabs,
  StatCard,
  StatGrid,
  TONES,
} from '@/components/ui';
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

const HYPOTHESIS_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos los Estados' },
  { value: 'DRAFT', label: 'DRAFT (Borrador)' },
  { value: 'READY', label: 'READY (Lista)' },
  { value: 'RUNNING', label: 'RUNNING (En Prueba)' },
  { value: 'VALIDATED', label: 'VALIDATED (Validada)' },
  { value: 'INVALIDATED', label: 'INVALIDATED (Refutada)' },
  { value: 'CANCELED', label: 'CANCELED (Cancelada)' },
];

const EXPERIMENT_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos los Estados' },
  { value: 'PLANNED', label: 'PLANNED (Planificado)' },
  { value: 'RUNNING', label: 'RUNNING (En Curso)' },
  { value: 'COMPLETED', label: 'COMPLETED (Completado)' },
  { value: 'ABORTED', label: 'ABORTED (Cancelado)' },
];

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

  const statusOptions = activeTab === 'hypotheses' ? HYPOTHESIS_STATUS_OPTIONS : EXPERIMENT_STATUS_OPTIONS;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        icon={FlaskConical}
        tone="cyan"
        title="Experimentación & Validación"
        description="Formulación rigurosa bajo metodología Lean Startup & Test Cards para mitigar riesgos antes del desarrollo"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              data-testid="open-ai-formulate-modal"
              onClick={() => setIsAIFormulateOpen(true)}
              leftIcon={Sparkles}
              className="text-xs border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
            >
              Formular con IA
            </Button>
            {activeTab === 'hypotheses' ? (
              <Button variant="primary" size="sm" onClick={() => setIsCreateHypoOpen(true)} leftIcon={Plus} className={`text-xs ${TONES.cyan.solid}`}>
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
                className={`text-xs ${TONES.cyan.solid}`}
              >
                Nuevo Experimento
              </Button>
            )}
          </>
        }
      />

      {projectConversionNotice && (
        <Alert variant="success" className="items-center justify-between">
          <div className="flex w-full flex-wrap items-center justify-between gap-2 text-xs">
            <span>
              Proyecto creado exitosamente desde hipótesis validada: <strong>{projectConversionNotice.name}</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/tasks?projectId=${projectConversionNotice.id}&autoDecompose=true`)}
              className="text-xs underline"
            >
              Ver Backlog & Tareas &rarr;
            </Button>
          </div>
        </Alert>
      )}

      <StatGrid columns={5}>
        <StatCard label="Total Hipótesis" value={kpiStats.totalHypo} icon={FlaskConical} tone="cyan" />
        <StatCard label="En Test / Running" value={kpiStats.runningHypo} icon={Clock} tone="blue" />
        <StatCard label="Validadas (Supported)" value={kpiStats.supportedHypo} icon={CheckCheck} tone="emerald" />
        <StatCard label="Refutadas (Refuted)" value={kpiStats.refutedHypo} icon={XCircle} tone="rose" />
        <StatCard label="Experimentos Activos" value={kpiStats.activeExps} icon={Beaker} tone="amber" className="col-span-2 sm:col-span-1" />
      </StatGrid>

      <ListToolbar
        left={
          <SegmentedTabs<ActiveTab>
            aria-label="Vista de experimentación"
            tone="cyan"
            value={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setStatusFilter('ALL');
            }}
            items={[
              { id: 'hypotheses', label: 'Hipótesis de Negocio', icon: FlaskConical, count: hypotheses.length },
              { id: 'experiments', label: 'Experimentos Tácticos', icon: Beaker, count: experiments.length },
            ]}
          />
        }
      >
        <SearchField
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Buscar por supuesto, métrica, método o segmento..."
        />
        <FilterSelect aria-label="Filtrar por estado" value={statusFilter} onValueChange={setStatusFilter} options={statusOptions} />
      </ListToolbar>

      {activeTab === 'hypotheses' ? (
        <DataState
          isLoading={isLoadingHypo}
          isEmpty={filteredHypotheses.length === 0}
          loading={<CardSkeletonGrid count={4} className="md:grid-cols-2 xl:grid-cols-2" />}
          empty={
            <EmptyState
              icon={FlaskConical}
              title="No hay hipótesis registradas"
              description="Formula supuestos falsables basados en oportunidades de innovación o utiliza el agente IA para derivarlas."
              action={
                <div className="flex items-center justify-center gap-3">
                  <Button variant="primary" size="sm" leftIcon={Sparkles} onClick={() => setIsAIFormulateOpen(true)}>
                    Formular con IA
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setIsCreateHypoOpen(true)}>
                    Crear Manualmente
                  </Button>
                </div>
              }
            />
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </DataState>
      ) : (
        <DataState
          isLoading={isLoadingExp}
          isEmpty={filteredExperiments.length === 0}
          empty={
            <EmptyState
              icon={Beaker}
              title="No hay experimentos registrados"
              description="Diseña pruebas controladas (Test A/B, MVP Concierge, Prototipo) para validar tus hipótesis activas."
              action={
                <Button variant="secondary" size="sm" leftIcon={Plus} onClick={() => setIsCreateExpOpen(true)}>
                  Diseñar Experimento
                </Button>
              }
            />
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        </DataState>
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
