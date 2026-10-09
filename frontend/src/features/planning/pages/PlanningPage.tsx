import React, { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { ContextProfileSheet } from '../components/ContextProfileSheet';
import { PhasePromptGenerator } from '../components/PhasePromptGenerator';
import { JsonPlanImporterExporter } from '../components/JsonPlanImporterExporter';
import { PlanAuditorChecklist } from '../components/PlanAuditorChecklist';
import { CapacityBufferCalculator } from '../components/CapacityBufferCalculator';
import { WeeklyRetrospectiveView } from '../components/WeeklyRetrospectiveView';
import { Building2, Sparkles, FileJson, ShieldCheck, Scale, History } from 'lucide-react';

type PlanningTab = 'ficha' | 'prompts' | 'json' | 'auditor' | 'capacidad' | 'retrospectiva';

export const PlanningPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlanningTab>('ficha');

  const tabs = [
    { id: 'capacidad' as const, label: '1. Diagnóstico & Capacidad', icon: Scale },
    { id: 'ficha' as const, label: '2. Objetivos & Ficha de Contexto', icon: Building2 },
    { id: 'prompts' as const, label: '3. Desglose & Prompts por Fase', icon: Sparkles },
    { id: 'auditor' as const, label: '4. Priorización & Auditoría', icon: ShieldCheck },
    { id: 'json' as const, label: '5. Plan Semanal & JSON', icon: FileJson },
    { id: 'retrospectiva' as const, label: '6. Seguimiento & Retrospectiva', icon: History },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Planificador Operativo BOWOL Plans 2.0"
        description="Convierte metas y problemas en actividades ejecutables con responsables, capacidad disponible y resultados verificables para equipos de 1 a 15 personas."
      />

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-200/80 dark:bg-white/[0.04] border border-zinc-300/80 dark:border-white/10 w-fit overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-[#121318] text-zinc-950 dark:text-white shadow-sm border border-zinc-200 dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'ficha' && <ContextProfileSheet />}
        {activeTab === 'prompts' && <PhasePromptGenerator />}
        {activeTab === 'json' && <JsonPlanImporterExporter />}
        {activeTab === 'auditor' && <PlanAuditorChecklist />}
        {activeTab === 'capacidad' && <CapacityBufferCalculator />}
        {activeTab === 'retrospectiva' && <WeeklyRetrospectiveView />}
      </div>
    </div>
  );
};
