import React from 'react';
import { TrendingDown } from 'lucide-react';
import { SprintBurndownResponse } from '../types';

interface SprintBurndownChartProps {
  burndown: SprintBurndownResponse;
}

export const SprintBurndownChart: React.FC<SprintBurndownChartProps> = ({ burndown }) => {
  const points = burndown.dataPoints || [];
  if (points.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500 rounded-xl bg-surface-subtle border border-white/[0.06]">
        No hay datos de burndown disponibles para este sprint.
      </div>
    );
  }

  const maxHours = Math.max(
    Number(burndown.totalEstimatedHours) || 0,
    ...points.map((p) => Math.max(Number(p.idealHours) || 0, Number(p.remainingHours) || 0)),
    10
  );

  // SVG dimensions
  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const totalPoints = points.length;

  // Coordinate mapping functions
  const getX = (index: number) => {
    if (totalPoints <= 1) return paddingX + plotWidth / 2;
    return paddingX + (index / (totalPoints - 1)) * plotWidth;
  };

  const getY = (hours: number | null) => {
    if (hours === null || isNaN(hours)) return null;
    const clamped = Math.max(0, Math.min(hours, maxHours));
    return paddingY + plotHeight - (clamped / maxHours) * plotHeight;
  };

  // Generate SVG path strings
  const idealPath = points
    .map((p, i) => {
      const x = getX(i);
      const y = getY(Number(p.idealHours));
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const actualPoints = points
    .map((p, i) => ({ x: getX(i), y: getY(p.remainingHours), original: p }))
    .filter((pt) => pt.y !== null);

  const actualPath = actualPoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ');

  return (
    <div className="rounded-xl bg-[#0F0F12] border border-white/[0.08] p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400">
              Burndown Chart
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
            {burndown.sprintName}
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-zinc-500 border-b border-dashed border-zinc-400 inline-block" />
            <span className="text-zinc-400 text-[11px]">Línea Ideal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-cyan-400 rounded-full inline-block" />
            <span className="text-cyan-300 text-[11px]">Horas Restantes</span>
          </div>
          <div className="text-[11px] text-zinc-400 pl-2 border-l border-white/[0.08]">
            Restante: <span className="text-white font-bold">{burndown.remainingHours}h</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[260px] text-zinc-600 font-mono text-[10px] select-none"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + plotHeight * (1 - ratio);
            const value = Math.round(maxHours * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="2 2"
                />
                <text x={paddingX - 8} y={y + 3} textAnchor="end" fill="currentColor">
                  {value}h
                </text>
              </g>
            );
          })}

          {/* Ideal Line (Dashed) */}
          <path
            d={idealPath}
            fill="none"
            stroke="rgba(161, 161, 170, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Actual Line */}
          {actualPath && (
            <path
              d={actualPath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points on actual line */}
          {actualPoints.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y as number}
              r="3.5"
              className="fill-cyan-400 stroke-[#0F0F12] stroke-2 hover:r-5 transition-all"
            />
          ))}

          {/* Date labels on X-axis */}
          {points.map((p, idx) => {
            // Show first, middle and last date, or every 2-3 points
            if (idx === 0 || idx === totalPoints - 1 || idx % Math.ceil(totalPoints / 5) === 0) {
              const x = getX(idx);
              const label = p.date.slice(5); // MM-DD
              return (
                <text
                  key={idx}
                  x={x}
                  y={height - 5}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-[9px]"
                >
                  {label}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
};
