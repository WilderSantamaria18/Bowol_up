import React, { useState } from 'react';
import { 
  useOpportunityBoard, 
  useCreateOpportunity, 
  useUpdateOpportunityStatus, 
  useDeleteOpportunity, 
  useGenerateOpportunitiesFromSwot 
} from '../hooks/useOpportunities';
import { useLatestSwot } from '@/features/swot/hooks/useSwot';
import { OpportunityStatus, CreateOpportunityPayload } from '../types';
import { OpportunityHeader } from '../components/OpportunityHeader';
import { OpportunityColumn } from '../components/OpportunityColumn';
import { CreateOpportunityModal } from '../components/CreateOpportunityModal';
import { opportunityService } from '../services/opportunityService';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenCreate);
  const [initialTitle, setInitialTitle] = useState(urlTitle);
  const [initialDescription, setInitialDescription] = useState(urlDescription);
  const [swotAlert, setSwotAlert] = useState<string | null>(null);

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
  };

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

      {/* Kanban Board Columns */}
      <div className="flex gap-5 overflow-x-auto pb-6 items-start">
        {COLUMNS.map((col) => {
          const list = board?.[col.status] || [];
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
    </div>
  );
};
