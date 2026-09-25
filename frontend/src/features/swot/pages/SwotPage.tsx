import React, { useState } from 'react';
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
  useRemoveSwotItem 
} from '../hooks/useSwot';
import { QuadrantType } from '../types';
import { SwotHeader } from '../components/SwotHeader';
import { QuadrantCard } from '../components/QuadrantCard';
import { SwotSummaryCard } from '../components/SwotSummaryCard';
import { EvidenceDetailModal } from '../components/EvidenceDetailModal';
import { Button } from '@/components/ui/Button';

export const SwotPage: React.FC = () => {
  const { data: swot, isLoading } = useLatestSwot();
  const generateSwot = useGenerateSwot();
  const addSwotItem = useAddSwotItem(swot?.id || '');
  const removeSwotItem = useRemoveSwotItem(swot?.id || '');

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

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

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 bg-white/[0.04] rounded-2xl w-full" />
        <div className="h-28 bg-white/[0.04] rounded-2xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white/[0.04] rounded-2xl" />
          <div className="h-72 bg-white/[0.04] rounded-2xl" />
          <div className="h-72 bg-white/[0.04] rounded-2xl" />
          <div className="h-72 bg-white/[0.04] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <SwotHeader
        onGenerate={handleGenerate}
        onOpenEvidences={() => setIsEvidenceModalOpen(true)}
        isGenerating={generateSwot.isPending}
        hasSwot={!!swot}
      />

      {/* Empty State */}
      {!swot ? (
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-white/[0.08] text-center max-w-3xl mx-auto space-y-6 bg-gradient-to-b from-white/[0.03] to-transparent shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-inner">
            <Sparkles className="w-8 h-8 animate-pulse" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Aún no tienes una Matriz FODA activa
            </h2>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
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

          {/* 2x2 Interactive Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <QuadrantCard
              type="strengths"
              title="Fortalezas"
              subtitle="Capacidades internas y factores de diferenciación"
              icon={ShieldCheck}
              items={swot.strengths || []}
              colorTheme={{
                accent: 'emerald',
                border: 'border-emerald-500/20 hover:border-emerald-500/35',
                bgBadge: 'bg-emerald-500/10',
                textBadge: 'text-emerald-400',
                bullet: 'bg-emerald-400',
              }}
              onAddItem={(text) => handleAddItem('strengths', text)}
              onRemoveItem={handleRemoveItem}
              onOpenEvidence={() => setIsEvidenceModalOpen(true)}
            />

            {/* Weaknesses */}
            <QuadrantCard
              type="weaknesses"
              title="Debilidades"
              subtitle="Brechas operativas, técnicas o de recursos"
              icon={AlertTriangle}
              items={swot.weaknesses || []}
              colorTheme={{
                accent: 'amber',
                border: 'border-amber-500/20 hover:border-amber-500/35',
                bgBadge: 'bg-amber-500/10',
                textBadge: 'text-amber-400',
                bullet: 'bg-amber-400',
              }}
              onAddItem={(text) => handleAddItem('weaknesses', text)}
              onRemoveItem={handleRemoveItem}
              onOpenEvidence={() => setIsEvidenceModalOpen(true)}
            />

            {/* Opportunities */}
            <QuadrantCard
              type="opportunities"
              title="Oportunidades"
              subtitle="Tendencias del mercado y vectores de expansión"
              icon={TrendingUp}
              items={swot.opportunities || []}
              colorTheme={{
                accent: 'sky',
                border: 'border-sky-500/20 hover:border-sky-500/35',
                bgBadge: 'bg-sky-500/10',
                textBadge: 'text-sky-400',
                bullet: 'bg-sky-400',
              }}
              onAddItem={(text) => handleAddItem('opportunities', text)}
              onRemoveItem={handleRemoveItem}
              onOpenEvidence={() => setIsEvidenceModalOpen(true)}
            />

            {/* Threats */}
            <QuadrantCard
              type="threats"
              title="Amenazas"
              subtitle="Fuerzas externas, competidores y cambios regulatorios"
              icon={ShieldAlert}
              items={swot.threats || []}
              colorTheme={{
                accent: 'rose',
                border: 'border-rose-500/20 hover:border-rose-500/35',
                bgBadge: 'bg-rose-500/10',
                textBadge: 'text-rose-400',
                bullet: 'bg-rose-400',
              }}
              onAddItem={(text) => handleAddItem('threats', text)}
              onRemoveItem={handleRemoveItem}
              onOpenEvidence={() => setIsEvidenceModalOpen(true)}
            />
          </div>
        </>
      )}

      {/* Evidence Modal */}
      {swot?.id && (
        <EvidenceDetailModal
          isOpen={isEvidenceModalOpen}
          onClose={() => setIsEvidenceModalOpen(false)}
          swotId={swot.id}
        />
      )}
    </div>
  );
};
