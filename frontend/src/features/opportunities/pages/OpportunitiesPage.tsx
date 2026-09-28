import React, { useState, useMemo } from 'react';
import { 
  useOpportunityBoard, 
  useCreateOpportunity, 
  useUpdateOpportunityStatus, 
  useDeleteOpportunity, 
  useGenerateOpportunitiesFromSwot,
  useUpdateOpportunityData
} from '../hooks/useOpportunities';
import { useLatestSwot } from '@/features/swot/hooks/useSwot';
import { OpportunityStatus, CreateOpportunityPayload, Opportunity, UpdateOpportunityPayload } from '../types';
import { OpportunityHeader } from '../components/OpportunityHeader';
import { OpportunityColumn } from '../components/OpportunityColumn';
import { CreateOpportunityModal } from '../components/CreateOpportunityModal';
import { RiceSimulatorModal } from '../components/RiceSimulatorModal';
import { opportunityService } from '../services/opportunityService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Zap, CheckCircle2, Clock, Flame, FolderGit2 } from 'lucide-react';

const COLUMNS: { status: OpportunityStatus; title: string; dotColor: string; badgeColor: string }[] = [
  { status: 'IDENTIFIED', title: 'Identificadas', dotColor: 'bg-sky-400', badgeColor: 'bg-sky-500/10 text-sky-400' },
  { status: 'EVALUATING', title: 'En Evaluación', dotColor: 'bg-amber-400', badgeColor: 'bg-amber-500/10 text-amber-400' },
  { status: 'APPROVED', title: 'Aprobadas', dotColor: 'bg-emerald-400', badgeColor: 'bg-emerald-500/10 text-emerald-400' },
  { status: 'REJECTED', title: 'Descartadas', dotColor: 'bg-zinc-500', badgeColor: 'bg-zinc-500/10 text-zinc-400' },
  { status: 'CONVERTED', title: 'Convertidas', dotColor: 'bg-purple-400', badgeColor: 'bg-purple-500/10 text-purple-400' },
];

export const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlTitle = searchParams.get('title') || '';
  const urlDescription = searchParams.get('description') || '';
  const shouldOpenCreate = searchParams.get('create') === 'true';

  const { data: board, isLoading } = useOpportunityBoard();
  const { data: latestSwot } = useLatestSwot();

  const createOpportunity = useCreateOpportunity();
  const updateStatus = useUpdateOpportunityStatus();
  const deleteOpportunity = useDeleteOpportunity();
  const generateFromSwot = useGenerateOpportunitiesFromSwot();
  const updateOpportunityData = useUpdateOpportunityData();

  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenCreate);
  const [initialTitle, setInitialTitle] = useState(urlTitle);
  const [initialDescription, setInitialDescription] = useState(urlDescription);
  const [swotAlert, setSwotAlert] = useState<string | null>(null);

  // Search filter & Modal selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  React.useEffect(() => {
    if (shouldOpenCreate) {
      setInitialTitle(urlTitle);
      setInitialDescription(urlDescription);
      setIsCreateOpen(true);
    }
  }, [shouldOpenCreate, urlTitle, urlDescription]);

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    if (shouldOpenCreate) {
      setSearchParams({});
    }
  };

  const handleGenerateFromSwot = async () => {
    if (!latestSwot?.id) {
      setSwotAlert('No se encontró ninguna Matriz FODA activa. Genera un FODA primero para derivar oportunidades.');
      return;
    }
    setSwotAlert(null);
    try {
      await generateFromSwot.mutateAsync(latestSwot.id);
    } catch (err) {
      console.error('Error generando oportunidades desde FODA:', err);
    }
  };

  const handleCreateSubmit = async (payload: CreateOpportunityPayload) => {
    await createOpportunity.mutateAsync({
      ...payload,
      swotAnalysisId: latestSwot?.id,
    });
  };

  const handleStatusChange = (id: string, newStatus: OpportunityStatus) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    deleteOpportunity.mutate(id);
    if (selectedOpportunity?.id === id) {
      setSelectedOpportunity(null);
    }
  };

  const handleSaveOpportunity = async (id: string, payload: UpdateOpportunityPayload) => {
    await updateOpportunityData.mutateAsync({ id, payload });
  };

  const handleConvertToProject = async (opportunityId: string) => {
    try {
      const project = await opportunityService.convertToProject(opportunityId);
      if (project?.id) {
        navigate(`/tasks?projectId=${project.id}&autoDecompose=true`);
      }
    } catch (err: any) {
      console.error('Error al convertir oportunidad en proyecto:', err);
    }
  };

  // KPIs & Filtered items
  const allOpportunities = useMemo(() => {
    if (!board) return [];
    return [
      ...(board.IDENTIFIED || []),
      ...(board.EVALUATING || []),
      ...(board.APPROVED || []),
      ...(board.REJECTED || []),
      ...(board.CONVERTED || []),
    ];
  }, [board]);

  const topRiceScore = useMemo(() => {
    if (allOpportunities.length === 0) return 0;
    const scores = allOpportunities
      .map(o => o.priorityScore || 0)
      .filter(s => s > 0);
    return scores.length > 0 ? Math.max(...scores).toFixed(1) : '0';
  }, [allOpportunities]);

  const filteredBoard = useMemo(() => {
    if (!board) return {} as Record<OpportunityStatus, Opportunity[]>;
    if (!searchQuery.trim()) return board;

    const query = searchQuery.toLowerCase();
    const filterList = (list: Opportunity[] = []) =>
      list.filter(
        item =>
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.problem?.toLowerCase().includes(query) ||
          item.targetSegment?.toLowerCase().includes(query) ||
          item.ownerName?.toLowerCase().includes(query)
      );

    return {
      IDENTIFIED: filterList(board.IDENTIFIED),
      EVALUATING: filterList(board.EVALUATING),
      APPROVED: filterList(board.APPROVED),
      REJECTED: filterList(board.REJECTED),
      CONVERTED: filterList(board.CONVERTED),
    };
  }, [board, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 bg-white/[0.04] rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="h-96 bg-white/[0.04] rounded-2xl" />
          <div className="h-96 bg-white/[0.04] rounded-2xl" />
          <div className="h-96 bg-white/[0.04] rounded-2xl" />
          <div className="h-96 bg-white/[0.04] rounded-2xl" />
          <div className="h-96 bg-white/[0.04] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <OpportunityHeader
        onGenerateFromSwot={handleGenerateFromSwot}
        onCreateOpen={() => setIsCreateOpen(true)}
        isGenerating={generateFromSwot.isPending}
      />

      {/* SWOT Alert if missing */}
      {swotAlert && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <span>{swotAlert}</span>
          <button
            onClick={() => navigate('/swot')}
            className="font-semibold underline ml-2 hover:text-white"
          >
            Ir a FODA &rarr;
          </button>
        </div>
      )}

      {/* KPI Cards & Search Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Oportunidades</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-white mt-1">{allOpportunities.length}</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Máximo RICE</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-amber-300 mt-1">{topRiceScore}</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>En Evaluación</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-sky-300 mt-1">{board?.EVALUATING?.length || 0}</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Aprobadas</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-emerald-300 mt-1">{board?.APPROVED?.length || 0}</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015] col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Convertidas a Proyecto</span>
            <FolderGit2 className="w-3.5 h-3.5 text-purple-400" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-purple-300 mt-1">{board?.CONVERTED?.length || 0}</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por título, problema, segmento o líder..."
            className="w-full text-xs bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/20"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {/* Kanban Board Columns */}
      <div className="flex gap-5 overflow-x-auto pb-6 items-start">
        {COLUMNS.map((col) => {
          const list = filteredBoard[col.status] || [];
          return (
            <OpportunityColumn
              key={col.status}
              status={col.status}
              title={col.title}
              dotColor={col.dotColor}
              badgeColor={col.badgeColor}
              opportunities={list}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onSelect={(opp) => setSelectedOpportunity(opp)}
              onConvertToProject={handleConvertToProject}
            />
          );
        })}
      </div>

      {/* Create Modal */}
      <CreateOpportunityModal
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSubmit}
        isLoading={createOpportunity.isPending}
        initialTitle={initialTitle}
        initialDescription={initialDescription}
      />

      {/* RICE Simulator & Opportunity Detail Modal */}
      <RiceSimulatorModal
        isOpen={!!selectedOpportunity}
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onSave={handleSaveOpportunity}
        onConvertToProject={handleConvertToProject}
        isSaving={updateOpportunityData.isPending}
      />
    </div>
  );
};
