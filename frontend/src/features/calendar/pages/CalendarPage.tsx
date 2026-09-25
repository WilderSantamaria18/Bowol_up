import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '../services/calendarService';
import { CalendarHeader } from '../components/CalendarHeader';
import { MonthGrid } from '../components/MonthGrid';
import { AgendaView } from '../components/AgendaView';
import { CreateEventModal } from '../components/CreateEventModal';
import { CalendarEventType, CreateCalendarEventPayload, UnifiedCalendarItem } from '../types';
import { projectService } from '@/features/projects/services/projectService';
import { Loader2 } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [typeFilter, setTypeFilter] = useState<CalendarEventType | 'ALL'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UnifiedCalendarItem | null>(null);

  // Calculate range covering the full visible month grid (+/- 7 days buffer)
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const rangeStart = new Date(year, month, 1 - 7).toISOString().split('T')[0];
  const rangeEnd = new Date(year, month + 1, 7).toISOString().split('T')[0];

  // Fetch unified calendar items
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['unified-calendar', rangeStart, rangeEnd, typeFilter],
    queryFn: () =>
      calendarService.getUnifiedCalendar({
        startDate: rangeStart,
        endDate: rangeEnd,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
      }),
  });

  // Fetch projects for modal dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectService.getProjects(),
  });
  const projects = projectsData?.items || [];

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateCalendarEventPayload) => calendarService.createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-calendar'] });
      setIsCreateModalOpen(false);
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-calendar'] });
    },
  });

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Export iCal handler
  const handleExportICal = async () => {
    setIsExporting(true);
    try {
      await calendarService.downloadICalendar(rangeStart, rangeEnd);
    } catch (err) {
      console.error('Error al exportar iCalendar:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Navigation and Filters */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        typeFilter={typeFilter}
        isExporting={isExporting}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onViewModeChange={setViewMode}
        onTypeFilterChange={setTypeFilter}
        onExportICal={handleExportICal}
        onNewEvent={() => setIsCreateModalOpen(true)}
      />

      {/* Selected Item Detail Banner */}
      {selectedItem && (
        <div className="p-4 rounded-xl bg-surface-subtle border border-orange-500/30 flex items-start justify-between gap-4 animate-fade-in shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                {selectedItem.eventType}
              </span>
              <h3 className="text-sm font-bold text-white">{selectedItem.title}</h3>
              {selectedItem.projectName && (
                <span className="text-xs text-zinc-400">({selectedItem.projectName})</span>
              )}
            </div>
            {selectedItem.description && (
              <p className="text-xs text-zinc-300">{selectedItem.description}</p>
            )}
            <p className="text-[11px] text-zinc-500">
              {selectedItem.startDate} {selectedItem.endDate ? `→ ${selectedItem.endDate}` : ''} | Estado: {selectedItem.status}
            </p>
          </div>
          <button
            onClick={() => setSelectedItem(null)}
            className="text-zinc-400 hover:text-white p-1 text-base leading-none"
            aria-label="Cerrar detalle"
          >
            &times;
          </button>
        </div>
      )}

      {/* Loading & Error States */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" strokeWidth={1.5} />
          <span className="text-xs text-zinc-400">Cargando roadmap integral...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          Error al cargar los eventos del calendario.
        </div>
      ) : (
        <>
          {viewMode === 'month' ? (
            <MonthGrid
              currentDate={currentDate}
              items={items}
              onSelectItem={(item) => setSelectedItem(item)}
            />
          ) : (
            <AgendaView
              items={items}
              onDeleteEvent={(id) => deleteMutation.mutate(id)}
              onSelectItem={(item) => setSelectedItem(item)}
            />
          )}
        </>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        projects={projects}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
