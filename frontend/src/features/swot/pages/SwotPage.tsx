import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';
import { 
  useLatestSwot, 
  useGenerateSwot, 
  useAddSwotItem, 
  useRemoveSwotItem,
  useUpdateSwotItemStatus
} from '../hooks/useSwot';
import { QuadrantType, SwotItem, ValidationStatus } from '../types';
import { SwotHeader } from '../components/SwotHeader';
import { QuadrantCard } from '../components/QuadrantCard';
import { SwotSummaryCard } from '../components/SwotSummaryCard';
import { EvidenceDetailModal } from '../components/EvidenceDetailModal';
import { BottleneckCard } from '../components/BottleneckCard';
import { RoutineAuditSection } from '../components/RoutineAuditSection';
import { Button } from '@/components/ui/Button';

export const SwotPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: swot, isLoading } = useLatestSwot();
  const generateSwot = useGenerateSwot();
  const addSwotItem = useAddSwotItem(swot?.id || '');
  const removeSwotItem = useRemoveSwotItem(swot?.id || '');
  const updateSwotItemStatus = useUpdateSwotItemStatus(swot?.id || '');

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | undefined>();
  const [showDismissed, setShowDismissed] = useState(true);
  const [activeTab, setActiveTab] = useState<'SWOT_MATRIX' | 'ROUTINE_AUDIT'>('SWOT_MATRIX');
  const [validationOverrides, setValidationOverrides] = useState<Record<string, ValidationStatus>>(() => {
    try {
      const saved = localStorage.getItem(`bowol_swot_validations_${swot?.id || 'default'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleValidation = (itemId: string, currentStatus?: ValidationStatus) => {
    const nextStatus: ValidationStatus = (currentStatus === 'EVIDENCE_BACKED') ? 'HYPOTHESIS_PENDING' : 'EVIDENCE_BACKED';
    const updated: Record<string, ValidationStatus> = { ...validationOverrides, [itemId]: nextStatus };
    setValidationOverrides(updated);
    try {
      localStorage.setItem(`bowol_swot_validations_${swot?.id || 'default'}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const applyValidationStatus = (items: SwotItem[]): SwotItem[] => {
    return items.map((it) => {
      const override = validationOverrides[it.id];
      const status: ValidationStatus = override ?? ((it.evidenceIds && it.evidenceIds.length > 0) ? 'EVIDENCE_BACKED' : 'HYPOTHESIS_PENDING');
      return { ...it, validationStatus: status };
    });
  };

  const handleGenerate = async () => {
    try {
      await generateSwot.mutateAsync({ includeTrends: true, maxTrends: 20 });
    } catch (err) {
      console.error('Error generando FODA:', err);
    }
  };

  const handleAddItem = async (quadrant: QuadrantType, text: string) => {
    if (!swot?.id) return;
    await addSwotItem.mutateAsync({ quadrant, text });
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!swot?.id) return;
    await removeSwotItem.mutateAsync(itemId);
  };

  const handleUpdateItemStatus = async (itemId: string, status: string) => {
    if (!swot?.id) return;
    await updateSwotItemStatus.mutateAsync({ itemId, status });
  };

  const handleOpenEvidence = (evidenceId?: string) => {
    setSelectedEvidenceId(evidenceId);
    setIsEvidenceModalOpen(true);
  };

  const handleConvertToOpportunity = (item: SwotItem) => {
    const textContent = item.statement || item.text;
    const titleParam = encodeURIComponent(textContent);
    const descParam = encodeURIComponent(`Iniciativa derivada directamente de la matriz FODA (${item.type || 'Estrategia'}).`);
    const evParam = item.evidenceIds?.[0] ? `&evidenceId=${encodeURIComponent(item.evidenceIds[0])}` : '';
    navigate(`/opportunities?create=true&title=${titleParam}&description=${descParam}&source=SWOT&swotItemId=${item.id}${evParam}`);
  };

  const handleConvertToHypothesis = (item: SwotItem) => {
    const textContent = item.statement || item.text;
    const stmtParam = encodeURIComponent(`Creemos que abordar "${textContent}" generará una ventaja estratégica validada para la empresa.`);
    navigate(`/hypotheses?create=true&statement=${stmtParam}&source=SWOT&swotItemId=${item.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 bg-zinc-900/[0.04] dark:bg-white/[0.04] rounded-2xl w-full" />
        <div className="h-28 bg-zinc-900/[0.04] dark:bg-white/[0.04] rounded-2xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-zinc-900/[0.04] dark:bg-white/[0.04] rounded-2xl" />
          <div className="h-72 bg-zinc-900/[0.04] dark:bg-white/[0.04] rounded-2xl" />
          <div className="h-72 bg-zinc-900/[0.04] dark:bg-white/[0.04] rounded-2xl" />
          <div className="h-72 bg-zinc-900/[0.04] dark:bg-white/[0.04] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <SwotHeader
        onGenerate={handleGenerate}
        onOpenEvidences={() => handleOpenEvidence(undefined)}
        isGenerating={generateSwot.isPending}
        hasSwot={!!swot}
        showDismissed={showDismissed}
        onToggleShowDismissed={() => setShowDismissed(!showDismissed)}
      />

      {/* Phase 1 Sub-Navigation Tabs: 1.1 FODA & Cuello de Botella vs 1.2 Auditoría de Rutina */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('SWOT_MATRIX')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
            activeTab === 'SWOT_MATRIX'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
          }`}
        >
          <span>Fase 1.1 · Matriz FODA & Cuello de Botella</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ROUTINE_AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
            activeTab === 'ROUTINE_AUDIT'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
          }`}
        >
          <span>Fase 1.2 · Auditoría de Rutina Operativa</span>
        </button>
      </div>

      {activeTab === 'ROUTINE_AUDIT' ? (
        <RoutineAuditSection swotId={swot?.id} />
      ) : !swot ? (
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-zinc-900/[0.13] dark:border-white/[0.08] text-center max-w-3xl mx-auto space-y-6 bg-gradient-to-b from-white/[0.03] to-transparent shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-inner">
            <Sparkles className="w-8 h-8 animate-pulse" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Aún no tienes una Matriz FODA activa
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
              El motor estratégico de BOWOL analizará tu perfil de negocio y las señales de mercado más relevantes para generar tu primer diagnóstico FODA en segundos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              leftIcon={Sparkles}
              onClick={handleGenerate}
              isLoading={generateSwot.isPending}
              className="shadow-xl shadow-orange-950/50"
            >
              Generar Primer FODA con IA
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Executive Summary Card */}
          <SwotSummaryCard swot={swot} />

          {/* Cuello de Botella Principal (Fase 1.1 BOWOL Plans) */}
          <BottleneckCard
            swotId={swot.id}
            onConvertToOpportunity={(title, desc) => {
              navigate(`/opportunities?create=true&title=${encodeURIComponent(title)}&description=${encodeURIComponent(desc)}&source=BOTTLENECK`);
            }}
            onConvertToHypothesis={(statement) => {
              navigate(`/hypotheses?create=true&statement=${encodeURIComponent(statement)}&source=BOTTLENECK`);
            }}
          />

          {/* 2x2 Interactive Matrix with validation status and factor labels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <QuadrantCard
              type="strengths"
              title="Fortalezas"
              subtitle="Capacidades internas y factores de diferenciación"
              icon={ShieldCheck}
              items={applyValidationStatus(swot.strengths || [])}
              colorTheme={{
                accent: 'emerald',
                border: 'border-emerald-500/20 hover:border-emerald-500/35',
                bgBadge: 'bg-emerald-500/10',
                textBadge: 'text-emerald-400',
                bullet: 'bg-emerald-400',
              }}
              onAddItem={(text) => handleAddItem('strengths', text)}
              onRemoveItem={handleRemoveItem}
              onUpdateItemStatus={handleUpdateItemStatus}
              onToggleValidationStatus={handleToggleValidation}
              onOpenEvidence={handleOpenEvidence}
              onConvertToOpportunity={handleConvertToOpportunity}
              onConvertToHypothesis={handleConvertToHypothesis}
              showDismissed={showDismissed}
            />

            {/* Weaknesses */}
            <QuadrantCard
              type="weaknesses"
              title="Debilidades"
              subtitle="Brechas operativas, técnicas o de recursos"
              icon={AlertTriangle}
              items={applyValidationStatus(swot.weaknesses || [])}
              colorTheme={{
                accent: 'amber',
                border: 'border-amber-500/20 hover:border-amber-500/35',
                bgBadge: 'bg-amber-500/10',
                textBadge: 'text-amber-400',
                bullet: 'bg-amber-400',
              }}
              onAddItem={(text) => handleAddItem('weaknesses', text)}
              onRemoveItem={handleRemoveItem}
              onUpdateItemStatus={handleUpdateItemStatus}
              onToggleValidationStatus={handleToggleValidation}
              onOpenEvidence={handleOpenEvidence}
              onConvertToOpportunity={handleConvertToOpportunity}
              onConvertToHypothesis={handleConvertToHypothesis}
              showDismissed={showDismissed}
            />

            {/* Opportunities */}
            <QuadrantCard
              type="opportunities"
              title="Oportunidades"
              subtitle="Tendencias del mercado y vectores de expansión"
              icon={TrendingUp}
              items={applyValidationStatus(swot.opportunities || [])}
              colorTheme={{
                accent: 'sky',
                border: 'border-sky-500/20 hover:border-sky-500/35',
                bgBadge: 'bg-sky-500/10',
                textBadge: 'text-sky-400',
                bullet: 'bg-sky-400',
              }}
              onAddItem={(text) => handleAddItem('opportunities', text)}
              onRemoveItem={handleRemoveItem}
              onUpdateItemStatus={handleUpdateItemStatus}
              onToggleValidationStatus={handleToggleValidation}
              onOpenEvidence={handleOpenEvidence}
              onConvertToOpportunity={handleConvertToOpportunity}
              onConvertToHypothesis={handleConvertToHypothesis}
              showDismissed={showDismissed}
            />

            {/* Threats */}
            <QuadrantCard
              type="threats"
              title="Amenazas"
              subtitle="Fuerzas externas, competidores y cambios regulatorios"
              icon={ShieldAlert}
              items={applyValidationStatus(swot.threats || [])}
              colorTheme={{
                accent: 'rose',
                border: 'border-rose-500/20 hover:border-rose-500/35',
                bgBadge: 'bg-rose-500/10',
                textBadge: 'text-rose-400',
                bullet: 'bg-rose-400',
              }}
              onAddItem={(text) => handleAddItem('threats', text)}
              onRemoveItem={handleRemoveItem}
              onUpdateItemStatus={handleUpdateItemStatus}
              onToggleValidationStatus={handleToggleValidation}
              onOpenEvidence={handleOpenEvidence}
              onConvertToOpportunity={handleConvertToOpportunity}
              onConvertToHypothesis={handleConvertToHypothesis}
              showDismissed={showDismissed}
            />
          </div>
        </>
      )}

      {/* Evidence Modal */}
      {swot?.id && (
        <EvidenceDetailModal
          isOpen={isEvidenceModalOpen}
          onClose={() => {
            setIsEvidenceModalOpen(false);
            setSelectedEvidenceId(undefined);
          }}
          swotId={swot.id}
          selectedEvidenceId={selectedEvidenceId}
        />
      )}
    </div>
  );
};
