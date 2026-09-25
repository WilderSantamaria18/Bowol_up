import React from 'react';
import { UnifiedCalendarItem } from '../types';
import { Repeat, Flag, FlaskConical, Calendar as CalendarIcon, Clock, Trash2, FolderKanban } from 'lucide-react';

interface AgendaViewProps {
  items: UnifiedCalendarItem[];
  onDeleteEvent?: (rawEventId: string) => void;
  onSelectItem?: (item: UnifiedCalendarItem) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  items,
  onDeleteEvent,
  onSelectItem,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-white/[0.08] bg-surface-subtle">
        <CalendarIcon className="w-10 h-10 mx-auto text-zinc-600 mb-3" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-zinc-300">No hay eventos en este periodo</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Crea un nuevo hito o planifica un Sprint en el módulo de ejecución para verlo en este calendario.
        </p>
      </div>
    );
  }

  // Group items by startDate (date portion YYYY-MM-DD)
  const grouped = items.reduce((acc, item) => {
    const key = item.startDate ? item.startDate.split('T')[0] : '';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, UnifiedCalendarItem[]>);

  const sortedDates = Object.keys(grouped).sort();

  const getSourceIcon = (source: UnifiedCalendarItem['source'], eventType: UnifiedCalendarItem['eventType']) => {
    if (source === 'SPRINT') return <Repeat className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.5} />;
    if (source === 'EXPERIMENT') return <FlaskConical className="w-4 h-4 text-sky-400 shrink-0" strokeWidth={1.5} />;
    if (eventType === 'MILESTONE') return <Flag className="w-4 h-4 text-purple-400 shrink-0" strokeWidth={1.5} />;
    return <CalendarIcon className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={1.5} />;
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'purple':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'sky':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
      case 'rose':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'amber':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'orange':
      default:
        return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {sortedDates.map((dateStr) => {
        const dayItems = grouped[dateStr];
        const dateObj = new Date(dateStr + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        return (
          <div key={dateStr} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <h3 className="text-xs font-semibold text-zinc-300 capitalize tracking-wide">
                {formattedDate}
              </h3>
            </div>

            <div className="space-y-2.5">
              {dayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem?.(item)}
                  className="group relative p-4 rounded-xl border border-white/[0.08] bg-surface-subtle hover:border-white/[0.15] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06] mt-0.5">
                      {getSourceIcon(item.source, item.eventType)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white tracking-tight">
                          {item.title}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeClasses(
                            item.color
                          )}`}
                        >
                          {item.eventType}
                        </span>

                        {item.projectName && (
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.04]">
                            <FolderKanban className="w-3 h-3 text-zinc-500" strokeWidth={1.5} />
                            {item.projectName}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {item.startDate} {item.endDate && item.endDate !== item.startDate ? `→ ${item.endDate}` : ''}
                        </span>

                        {item.status && (
                          <span className="text-zinc-400 font-mono text-[10px] uppercase">
                            Estado: {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.source === 'CALENDAR_EVENT' && item.metadata?.rawEventId && onDeleteEvent && (
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(item.metadata?.rawEventId)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/[0.05] self-end sm:self-center"
                      title="Eliminar evento"
                      aria-label="Eliminar evento"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
