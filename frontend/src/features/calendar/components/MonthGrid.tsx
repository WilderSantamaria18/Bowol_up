import React from 'react';
import { UnifiedCalendarItem } from '../types';
import { Repeat, Flag, FlaskConical, Calendar as CalendarIcon } from 'lucide-react';

interface MonthGridProps {
  currentDate: Date;
  items: UnifiedCalendarItem[];
  onSelectItem?: (item: UnifiedCalendarItem) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const MonthGrid: React.FC<MonthGridProps> = ({
  currentDate,
  items,
  onSelectItem,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month
  const firstDay = new Date(year, month, 1);
  // Last day of month
  const lastDay = new Date(year, month + 1, 0);

  // Day of week: 0 = Sun, 1 = Mon ... 6 = Sat
  // Convert to Mon=0 ... Sun=6
  let startingDay = firstDay.getDay() - 1;
  if (startingDay === -1) startingDay = 6;

  const daysInMonth = lastDay.getDate();

  // Days array for the grid
  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    days.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  const todayStr = new Date().toISOString().split('T')[0];
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month, d);
    const dateStr = curDate.toISOString().split('T')[0];
    days.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    days.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Group items by date range
  const getItemsForDate = (dateStr: string) => {
    return items.filter((item) => {
      const start = item.startDate ? item.startDate.split('T')[0] : '';
      const end = item.endDate ? item.endDate.split('T')[0] : start;
      return dateStr >= start && dateStr <= end;
    });
  };

  const getSourceIcon = (source: UnifiedCalendarItem['source'], eventType: UnifiedCalendarItem['eventType']) => {
    if (source === 'SPRINT') return <Repeat className="w-3 h-3 text-emerald-400 shrink-0" strokeWidth={1.5} />;
    if (source === 'EXPERIMENT') return <FlaskConical className="w-3 h-3 text-sky-400 shrink-0" strokeWidth={1.5} />;
    if (eventType === 'MILESTONE') return <Flag className="w-3 h-3 text-purple-400 shrink-0" strokeWidth={1.5} />;
    return <CalendarIcon className="w-3 h-3 text-amber-400 shrink-0" strokeWidth={1.5} />;
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:border-emerald-500/40';
      case 'purple':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:border-purple-500/40';
      case 'sky':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/20 hover:border-sky-500/40';
      case 'rose':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:border-rose-500/40';
      case 'amber':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:border-amber-500/40';
      case 'orange':
      default:
        return 'bg-orange-500/10 text-orange-300 border-orange-500/20 hover:border-orange-500/40';
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-surface-subtle overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-white/[0.08] bg-black/40 text-center py-2.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-white/[0.04]">
        {days.map((day, idx) => {
          const dayItems = getItemsForDate(day.dateStr);

          return (
            <div
              key={`${day.dateStr}-${idx}`}
              className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                !day.isCurrentMonth
                  ? 'bg-black/20 text-zinc-600'
                  : day.isToday
                  ? 'bg-orange-500/[0.04] text-zinc-200'
                  : 'text-zinc-300 hover:bg-white/[0.015]'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    day.isToday
                      ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/30'
                      : day.isCurrentMonth
                      ? 'text-zinc-300'
                      : 'text-zinc-600'
                  }`}
                >
                  {day.dayNum}
                </span>

                {dayItems.length > 2 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/[0.06] text-zinc-400 font-medium">
                    +{dayItems.length - 2}
                  </span>
                )}
              </div>

              {/* Event Chips */}
              <div className="mt-1.5 space-y-1 overflow-hidden">
                {dayItems.slice(0, 2).map((item) => (
                  <button
                    key={`${item.id}-${day.dateStr}`}
                    type="button"
                    onClick={() => onSelectItem?.(item)}
                    className={`w-full text-left p-1 rounded-md border text-[11px] truncate flex items-center gap-1.5 transition-all ${getColorClasses(
                      item.color
                    )}`}
                    title={`${item.title} (${item.eventType})`}
                  >
                    {getSourceIcon(item.source, item.eventType)}
                    <span className="truncate font-medium">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
