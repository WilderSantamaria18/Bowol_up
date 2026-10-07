import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, FlaskConical } from 'lucide-react';
import { Button, ChoiceGroup, FormField, Modal, Textarea } from '@/components/ui';
import { Hypothesis, HypothesisResult, RecordHypothesisResultPayload } from '../types';

interface RecordResultModalProps {
  hypothesis: Hypothesis | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RecordHypothesisResultPayload) => void;
  isLoading?: boolean;
}

const RESULT_OPTIONS = [
  { value: 'SUPPORTED', label: 'Validada', description: 'Superó métrica', icon: CheckCircle2, tone: 'emerald' },
  { value: 'REFUTED', label: 'Refutada', description: 'No alcanzó meta', icon: XCircle, tone: 'rose' },
  { value: 'INCONCLUSIVE', label: 'Inconclusa', description: 'Requiere datos', icon: HelpCircle, tone: 'amber' },
] as const;

const FORM_ID = 'record-hypothesis-result-form';

export const RecordResultModal: React.FC<RecordResultModalProps> = ({
  hypothesis,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [result, setResult] = useState<HypothesisResult>('SUPPORTED');
  const [resultNotes, setResultNotes] = useState('');

  if (!hypothesis) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ result, resultNotes: resultNotes.trim() || undefined });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      busy={isLoading}
      icon={FlaskConical}
      tone="cyan"
      title="Registrar Conclusión de Hipótesis"
      subtitle="Determina el veredicto científico de la validación"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={isLoading} className="bg-emerald-600 text-white hover:bg-emerald-500">
            {isLoading ? 'Guardando...' : 'Guardar Resultado'}
          </Button>
        </>
      }
    >
      <div className="mb-5 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-zinc-300">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">Hipótesis:</span>
        {hypothesis.statement}
      </div>

      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <span className="block text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-200">Resultado Obtenido *</span>
          <ChoiceGroup<HypothesisResult>
            aria-label="Resultado obtenido"
            options={[...RESULT_OPTIONS]}
            value={result}
            onChange={setResult}
          />
        </div>

        <FormField label="Observaciones, Números y Aprendizajes Clave">
          {(control) => (
            <Textarea
              {...control}
              value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)}
              placeholder="Detalla las métricas finales alcanzadas, reacciones cualitativas de clientes y próximos pasos estratégicos..."
            />
          )}
        </FormField>
      </form>
    </Modal>
  );
};
