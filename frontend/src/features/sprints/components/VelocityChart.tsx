import React from 'react';
import { Zap } from 'lucide-react';
import { ProjectVelocityResponse } from '../types';

interface VelocityChartProps {
  velocity: ProjectVelocityResponse;
}

export const VelocityChart: React.FC<VelocityChartProps> = ({ velocity }) => {
  const history = velocity.history || [];

  if (history.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500 rounded-xl bg-surface-subtle border border-white/[0.06]">
        No hay sprints registrados para calcular la velocidad histórica de este proyecto.
      </div>
    );
  }

  const maxVal = Math.max(
    ...history.flatMap((item) => [Number(item.committedHours) || 0, Number(item.completedHours) || 0]),
    Number(velocity.averageVelocityHours) || 0,
    10
  );

  // SVG dimensions
  const width = 640;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const numItems = history.length;
  const groupWidth = plotWidth / numItems;
  const barWidth = Math.min(22, (groupWidth * 0.7) / 2);

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxVal));
    return paddingTop + plotHeight - (clamped / maxVal) * plotHeight;
  };

  const avgY = getY(Number(velocity.averageVelocityHours) || 0);

  return (
    <div className="rounded-xl bg-[#0F0F12] border border-white/[0.08] p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400">
              Velocity Engine
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
            Velocidad por Sprint & Rendimiento del Equipo
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-zinc-600 rounded-sm inline-block" />
            <span className="text-zinc-400 text-[11px]">Comprometidas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" />
            <span className="text-emerald-300 text-[11px]">Completadas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed border-amber-300 inline-block" />
            <span className="text-amber-300 text-[11px]">Promedio ({velocity.averageVelocityHours}h)</span>
          </div>
          {velocity.averageCompletionRate !== undefined && (
            <div className="text-[11px] text-zinc-400 pl-2 border-l border-white/[0.08]">
              Tasa Promedio: <span className="text-white font-bold">{velocity.averageCompletionRate}%</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[260px] text-zinc-600 font-mono text-[10px] select-none"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + plotHeight * (1 - ratio);
            const value = Math.round(maxVal * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="2 2"
                />
                <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fill="currentColor">
                  {value}h
                </text>
              </g>
            );
          })}

          {/* Average Velocity Line */}
          {Number(velocity.averageVelocityHours) > 0 && (
            <g>
              <line
                x1={paddingLeft}
                y1={avgY}
                x2={width - paddingRight}
                y2={avgY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={width - paddingRight}
                y={avgY - 4}
                textAnchor="end"
                className="fill-amber-400 text-[9px] font-bold"
              >
                Avg {velocity.averageVelocityHours}h
              </text>
            </g>
          )}

          {/* Bars */}
          {history.map((item, idx) => {
            const centerX = paddingLeft + idx * groupWidth + groupWidth / 2;
            const committedX = centerX - barWidth - 2;
            const completedX = centerX + 2;

            const committedY = getY(Number(item.committedHours) || 0);
            const committedH = Math.max(0, paddingTop + plotHeight - committedY);

            const completedY = getY(Number(item.completedHours) || 0);
            const completedH = Math.max(0, paddingTop + plotHeight - completedY);

            const truncatedName =
              item.sprintName.length > 10 ? item.sprintName.slice(0, 9) + '…' : item.sprintName;

            return (
              <g key={item.sprintId}>
                {/* Committed Bar */}
                <rect
                  x={committedX}
                  y={committedY}
                  width={barWidth}
                  height={committedH}
                  rx="3"
                  className="fill-zinc-700/80 hover:fill-zinc-600 transition-colors"
                >
                  <title>{`${item.sprintName} - Comprometidas: ${item.committedHours}h`}</title>
                </rect>

                {/* Completed Bar */}
                <rect
                  x={completedX}
                  y={completedY}
                  width={barWidth}
                  height={completedH}
                  rx="3"
                  className="fill-emerald-500/90 hover:fill-emerald-400 transition-colors"
                >
                  <title>{`${item.sprintName} - Completadas: ${item.completedHours}h (${item.completionRate}%)`}</title>
                </rect>

                {/* X-axis label */}
                <text
                  x={centerX}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  className="fill-zinc-400 text-[10px]"
                >
                  {truncatedName}
                </text>

                {/* Rate label under name */}
                <text
                  x={centerX}
                  y={height - paddingBottom + 28}
                  textAnchor="middle"
                  className="fill-zinc-500 text-[9px]"
                >
                  {item.completionRate}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06]">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[10px] text-zinc-500 uppercase font-mono">Sprints Evaluados</span>
          <p className="text-lg font-bold text-white mt-0.5">{history.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[10px] text-zinc-500 uppercase font-mono">Velocidad Promedio</span>
          <p className="text-lg font-bold text-amber-400 mt-0.5">{velocity.averageVelocityHours}h</p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[10px] text-zinc-500 uppercase font-mono">Efectividad Global</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">
            {velocity.averageCompletionRate !== undefined ? `${velocity.averageCompletionRate}%` : 'N/A'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[10px] text-zinc-500 uppercase font-mono">Último Sprint</span>
          <p className="text-lg font-bold text-cyan-400 mt-0.5 truncate">
            {history[history.length - 1]?.completedHours ?? 0}h
          </p>
        </div>
      </div>
    </div>
  );
};
