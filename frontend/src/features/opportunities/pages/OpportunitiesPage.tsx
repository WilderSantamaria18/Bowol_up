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
import { Zap, CheckCircle2, Clock, Flame, FolderGit2 } from 'lucide-react';
import { Alert, ListToolbar, SearchField, Skeleton, StatCard, StatGrid } from '@/components/ui';

const COLUMNS: { status: OpportunityStatus; title: string; dotColor: string; badgeColor: string }[] = [
  { status: 'IDENTIFIED', title: 'Identificadas', dotColor: 'bg-sky-400', badgeColor: 'bg-sky-500/10 text-sky-400' },
  { status: 'EVALUATING', title: 'En Evaluación', dotColor: 'bg-amber-400', badgeColor: 'bg-amber-500/10 text-amber-400' },
  { status: 'APPROVED', title: 'Aprobadas', dotColor: 'bg-emerald-400', badgeColor: 'bg-emerald-500/10 text-emerald-400' },
  { status: 'REJECTED', title: 'Descartadas', dotColor: 'bg-zinc-500', badgeColor: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400' },
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
      <div className="space-y-8" role="status" aria-label="Cargando oportunidades">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
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

      {swotAlert && (
        <Alert variant="warning">
          <div className="flex w-full items-center justify-between gap-3 text-xs">
            <span>{swotAlert}</span>
            <button onClick={() => navigate('/swot')} className="font-semibold underline">
              Ir a FODA &rarr;
            </button>
          </div>
        </Alert>
      )}

      <StatGrid columns={5} className="lg:grid-cols-5">
        <StatCard label="Total Oportunidades" value={allOpportunities.length} icon={Flame} tone="orange" />
        <StatCard label="Máximo RICE" value={topRiceScore} icon={Zap} tone="amber" />
        <StatCard label="En Evaluación" value={board?.EVALUATING?.length || 0} icon={Clock} tone="blue" />
        <StatCard label="Aprobadas" value={board?.APPROVED?.length || 0} icon={CheckCircle2} tone="emerald" />
        <StatCard
          label="Convertidas a Proyecto"
          value={board?.CONVERTED?.length || 0}
          icon={FolderGit2}
          tone="violet"
          className="col-span-2 sm:col-span-5 lg:col-span-1"
        />
      </StatGrid>

      <ListToolbar>
        <SearchField
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Filtrar por título, problema, segmento o líder..."
          className="max-w-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Limpiar filtro
          </button>
        )}
      </ListToolbar>

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
