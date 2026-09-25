import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Sparkles, 
  Plus, 
  Beaker, 
  Filter, 
  ArrowRight,
  CheckCircle2
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

  const [activeTab, setActiveTab] = useState<ActiveTab>('hypotheses');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateHypoOpen, setIsCreateHypoOpen] = useState(false);
  const [isAIFormulateOpen, setIsAIFormulateOpen] = useState(false);
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

  // Mutations
  const createHypoMutation = useMutation({
    mutationFn: (payload: CreateHypothesisPayload) => hypothesisService.createHypothesis(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
      setIsCreateHypoOpen(false);
    },
  });

  const formulateAIMutation = useMutation({
    mutationFn: (opportunityId: string) => hypothesisService.formulateFromOpportunity(opportunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses'] });
      setIsAIFormulateOpen(false);
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
  const handleOpenRecordResult = (hypothesis: Hypothesis) => {
    setSelectedHypoForResult(hypothesis);
    setIsRecordResultOpen(true);
  };

  const handleOpenCreateExperiment = (hypothesis: Hypothesis) => {
    setSelectedHypoForExp(hypothesis.id);
    setIsCreateExpOpen(true);
  };

  const handleOpenRecordConclusion = (experiment: Experiment) => {
    setSelectedExpForConclusion(experiment);
    setIsRecordConclusionOpen(true);
  };

  // Filtered lists
  const filteredHypotheses = hypotheses.filter((h) => {
    if (statusFilter === 'ALL') return true;
    return h.status === statusFilter;
  });

  const filteredExperiments = experiments.filter((e) => {
    if (statusFilter === 'ALL') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Conversion Banner */}
      {projectConversionNotice && (
        <div className="rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold">
                Proyecto creado exitosamente desde hipótesis validada
              </p>
              <p className="text-xs text-emerald-400/80">
                "{projectConversionNotice.name}" se encuentra listo en el módulo de Ejecución.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/tasks')}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
          >
            Ir al Backlog de Tareas
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider">
              Lean Startup & Test Cards
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-cyan-400" strokeWidth={1.5} />
            Experimentación & Validación
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Formula hipótesis científicas falsables derivadas de tus oportunidades estratégicas y somételas a experimentos tácticos de validación antes del desarrollo a gran escala.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            data-testid="open-ai-formulate-modal"
            onClick={() => setIsAIFormulateOpen(true)}
            className="gap-2 shadow-sm shadow-orange-500/20"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            Formular con IA
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCreateHypoOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Nueva Hipótesis
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedHypoForExp(undefined);
              setIsCreateExpOpen(true);
            }}
            className="gap-1.5 text-cyan-400 hover:text-cyan-300"
          >
            <Beaker className="w-4 h-4" strokeWidth={1.5} />
            Nuevo Experimento
          </Button>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-surface-subtle border border-white/[0.08] max-w-fit">
          <button
            onClick={() => {
              setActiveTab('hypotheses');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hypotheses'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.5} />
            Hipótesis de Negocio
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/[0.08] text-zinc-300 font-mono">
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
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Beaker className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
            Experimentos Tácticos
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/[0.08] text-zinc-300 font-mono">
              {experiments.length}
            </span>
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-zinc-500 mr-1 flex items-center gap-1 font-mono uppercase">
            <Filter className="w-3 h-3" strokeWidth={1.5} />
            Estado:
          </span>
          {activeTab === 'hypotheses' ? (
            ['ALL', 'READY', 'RUNNING', 'VALIDATED', 'INVALIDATED', 'DRAFT'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                    : 'bg-surface-subtle border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s === 'ALL' ? 'Todos' : s}
              </button>
            ))
          ) : (
            ['ALL', 'PLANNED', 'RUNNING', 'COMPLETED', 'ABORTED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : 'bg-surface-subtle border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s === 'ALL' ? 'Todos' : s}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'hypotheses' ? (
        isLoadingHypo ? (
          <div className="py-16 text-center text-zinc-500 text-sm">Cargando hipótesis...</div>
        ) : filteredHypotheses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center bg-surface-subtle/40">
            <FlaskConical className="w-10 h-10 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-zinc-300 mb-1">No hay hipótesis formuladas</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
              Transforma una de tus oportunidades estratégicas en una hipótesis científica falsable o crea una manualmente.
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
        isLoading={createHypoMutation.isPending}
      />

      <AIFormulateHypothesisModal
        isOpen={isAIFormulateOpen}
        onClose={() => setIsAIFormulateOpen(false)}
        onFormulate={(opportunityId) => formulateAIMutation.mutate(opportunityId)}
        opportunities={allOpportunities}
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
