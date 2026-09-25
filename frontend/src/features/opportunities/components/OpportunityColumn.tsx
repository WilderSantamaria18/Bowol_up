import React from 'react';
import { Opportunity, OpportunityStatus } from '../types';
import { OpportunityCard } from './OpportunityCard';

interface OpportunityColumnProps {
  status: OpportunityStatus;
  title: string;
  dotColor: string;
  badgeColor: string;
  opportunities: Opportunity[];
  onStatusChange: (id: string, newStatus: OpportunityStatus) => void;
  onDelete: (id: string) => void;
  onConvertToProject?: (id: string) => void;
}

export const OpportunityColumn: React.FC<OpportunityColumnProps> = ({
  status,
  title,
  dotColor,
  badgeColor,
  opportunities,
  onStatusChange,
  onDelete,
  onConvertToProject,
}) => {
  return (
    <div
      data-testid={`column-${status}`}
      className="glass-panel p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] flex flex-col min-w-[280px] w-full max-w-sm flex-1 space-y-3.5"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeColor} border border-white/[0.06]`}>
          {opportunities.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
        {opportunities.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-white/[0.06] rounded-xl">
            <p className="text-xs text-zinc-500">Sin iniciativas</p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onConvertToProject={onConvertToProject}
            />
          ))
        )}
      </div>
    </div>
  );
};
