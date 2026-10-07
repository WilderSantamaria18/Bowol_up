import React from 'react';
import { Lightbulb, Sparkles, Plus, MessageSquare } from 'lucide-react';
import { Button, PageHeader } from '@/components/ui';
import { useCopilot } from '@/features/copilot/context/CopilotContext';

interface OpportunityHeaderProps {
  onGenerateFromSwot: () => void;
  onCreateOpen: () => void;
  isGenerating?: boolean;
}

export const OpportunityHeader: React.FC<OpportunityHeaderProps> = ({
  onGenerateFromSwot,
  onCreateOpen,
  isGenerating = false,
}) => {
  const { openCopilot } = useCopilot();

  return (
    <PageHeader
      icon={Lightbulb}
      tone="amber"
      title="Estrategia & Oportunidades RICE"
      description="Tablero Kanban priorizado por puntuación determinista RICE: (Reach × Impact × Confidence) / Effort"
      actions={
        <>
          <Button variant="glass" size="sm" leftIcon={MessageSquare} onClick={() => openCopilot({ contextType: 'OPPORTUNITY' })}>
            Consultar BowolAI
          </Button>
          <Button variant="secondary" size="sm" leftIcon={Sparkles} isLoading={isGenerating} onClick={onGenerateFromSwot}>
            Generar desde FODA
          </Button>
          <Button variant="primary" size="sm" leftIcon={Plus} onClick={onCreateOpen}>
            Nueva Oportunidad
          </Button>
        </>
      }
    />
  );
};
