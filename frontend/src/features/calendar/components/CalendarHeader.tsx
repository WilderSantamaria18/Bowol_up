import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  Download,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CalendarEventType } from '../types';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: 'month' | 'agenda';
  typeFilter: CalendarEventType | 'ALL';
  isExporting?: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onViewModeChange: (mode: 'month' | 'agenda') => void;
  onTypeFilterChange: (type: CalendarEventType | 'ALL') => void;
  onExportICal: () => void;
  onNewEvent: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  typeFilter,
  isExporting = false,
  onPrevMonth,
  onNextMonth,
  onToday,
  onViewModeChange,
  onTypeFilterChange,
  onExportICal,
  onNewEvent,
}) => {
  const monthLabel = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const filters: { label: string; value: CalendarEventType | 'ALL'; color: string }[] = [
    { label: 'Todos', value: 'ALL', color: 'hover:text-white' },
    { label: 'Sprints', value: 'SPRINT', color: 'text-orange-400' },
    { label: 'Hitos', value: 'MILESTONE', color: 'text-purple-400' },
    { label: 'Experimentos', value: 'EXPERIMENT', color: 'text-sky-400' },
    { label: 'Eventos', value: 'KEY_EVENT', color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar: Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md">
            <CalendarIcon className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Calendario Estratégico
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
                Fase 10
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Vista unificada de sprints, hitos de producto, experimentos y eventos clave
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export iCal Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportICal}
            disabled={isExporting}
            leftIcon={Download}
            className="text-xs border-white/[0.08] hover:border-white/[0.15]"
          >
            {isExporting ? 'Exportando...' : 'Exportar .ics (Outlook / Google)'}
          </Button>

          {/* New Event Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onNewEvent}
            leftIcon={Plus}
            className="text-xs bg-orange-600 hover:bg-orange-500 text-white"
          >
            Nuevo Hito / Evento
          </Button>
        </div>
      </div>

      {/* Navigation & Controls Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 rounded-xl bg-surface-subtle border border-white/[0.06]">
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-black/30 p-0.5">
            <button
              onClick={onPrevMonth}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={onNextMonth}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <h2 className="text-sm font-semibold text-white tracking-wide min-w-[140px]">
            {monthLabel}
          </h2>

          <button
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-medium rounded-lg text-zinc-300 hover:text-white border border-white/[0.08] hover:bg-white/[0.05] transition-colors"
          >
            Hoy
          </button>
        </div>

        {/* Filters and View Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Category Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => onTypeFilterChange(f.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === f.value
                    ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
            <button
              onClick={() => onViewModeChange('month')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white/[0.1] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Mes</span>
            </button>
            <button
              onClick={() => onViewModeChange('agenda')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-white/[0.1] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
