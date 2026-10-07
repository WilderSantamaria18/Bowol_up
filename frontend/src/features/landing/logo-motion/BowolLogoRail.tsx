import React, { useRef } from 'react';
import { BowolAnimatedMark } from './BowolAnimatedMark';
import { useBowolMotionMode } from './useBowolMotionMode';
import { useBowolScrollAnimation } from './useBowolScrollAnimation';
import {
  COLORS,
  HEADER_HEIGHT_VAR,
  HERO_SLOT,
  INDICATOR,
  MOTION,
  getIndicatorLineHeight,
  getMarkOrigin,
  getTrajectorySegments,
} from './bowolMotion.config';

interface BowolLogoRailProps {
  /** Selector del hero que gobierna el guion de scroll. */
  triggerSelector?: string;
}

const DOT_SIZE = 6;
const MARK_CLASS = 'text-zinc-950 dark:text-zinc-100';

/**
 * Espacio del banner donde nace el logo. Ocupa su lugar en el flujo del hero (sin saltos de layout)
 * y es el punto de partida del vuelo hacia el carril.
 */
export const BowolHeroLogoSlot: React.FC = () => (
  <div
    id={HERO_SLOT.id}
    aria-hidden="true"
    className="pointer-events-none shrink-0"
    style={{ width: `min(${HERO_SLOT.widthVw}vw, ${HERO_SLOT.maxWidth}px)`, aspectRatio: '898 / 620' }}
  />
);

/**
 * Logo animado: nace grande en el centro del banner y, al hacer scroll, vuela al carril superior
 * izquierdo (zona pequeña y fija, con overflow oculto), recorre su trayectoria y se apaga antes de
 * entrar en las secciones de contenido. Con movimiento reducido conserva ese viaje (lo controla el scroll)
 * pero omite el ensamblaje, el pulso, el parpadeo de la llama y las brasas.
 */
export const BowolLogoRail: React.FC<BowolLogoRailProps> = ({ triggerSelector = '#hero-stage' }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { bp, reduced } = useBowolMotionMode();
  const config = MOTION[bp];
  const onMarkClick = useBowolScrollAnimation({ scope: rootRef, bp, reduced, triggerSelector });

  const showIndicator = config.showIndicator;
  const origin = getMarkOrigin(bp);
  const { width, height, left, topOffset } = config.rail;
  const top = `calc(var(${HEADER_HEIGHT_VAR}, 4rem) + ${topOffset}px)`;
  const lineHeight = getIndicatorLineHeight(bp);
  const labels = INDICATOR.labels;
  const labelRows: { key: string; text: string; top: string }[] = [
    { key: 'signal', text: labels.signal, top: '0%' },
    { key: 'strategy', text: labels.strategy, top: '50%' },
    { key: 'execution', text: labels.execution, top: '100%' },
  ];

  return (
    <div ref={rootRef} data-testid="bowol-logo-root">
      {/* Carril: zona fija y recortada para el indicador y la línea de trayectoria. */}
      <div
        data-part="rail"
        data-testid="bowol-logo-rail"
        data-anchor="top-left"
        className={`pointer-events-none fixed z-30 select-none overflow-hidden ${MARK_CLASS}`}
        style={{ top, left, width, height }}
      >
        {showIndicator && (
          <div
            data-testid="bowol-progress"
            className="absolute left-0"
            style={{ top: INDICATOR.padding, height: lineHeight, width: config.indicatorGutter }}
          >
            <span className="absolute left-[2px] top-0 h-full w-px bg-zinc-900/15 dark:bg-white/15" />
            <span
              data-part="progress-fill"
              className="absolute left-[2px] top-0 h-full w-px will-change-transform"
              style={{ backgroundColor: COLORS.accent }}
            />
            <span
              data-part="progress-dot"
              className="absolute rounded-full will-change-transform"
              style={{
                left: 2.5 - DOT_SIZE / 2,
                top: -DOT_SIZE / 2,
                width: DOT_SIZE,
                height: DOT_SIZE,
                backgroundColor: COLORS.accent,
              }}
            />
            {labelRows.map(({ key, text, top: labelTop }) => (
              <span
                key={key}
                data-label={key}
                className="absolute left-3 -translate-y-1/2 font-mono text-[8px] font-medium leading-none tracking-[0.12em] text-zinc-600 dark:text-zinc-400"
                style={{ top: labelTop }}
              >
                {text}
              </span>
            ))}
          </div>
        )}

        <svg
          className="absolute left-0 top-0 h-full w-full"
          viewBox={`0 0 ${width} ${height}`}
          fill="none"
          focusable="false"
        >
          {getTrajectorySegments(bp).map((d, i) => (
            <path
              key={i}
              data-traj
              d={d}
              pathLength={1}
              style={{ stroke: COLORS.accent }}
              strokeOpacity={0.55}
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* Logo: botón real. Reposa dentro del carril, pero no se recorta mientras vuela desde el banner. */}
      <button
        type="button"
        data-part="mark"
        onClick={onMarkClick}
        aria-label="BOWOL: ir a la siguiente sección"
        className={`pointer-events-auto fixed z-30 block cursor-pointer rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:focus-visible:outline-orange-500 ${MARK_CLASS}`}
        style={{
          top: `calc(${top} + ${origin.y}px)`,
          left: left + origin.x,
          width: config.markWidth,
        }}
      >
        <BowolAnimatedMark variant="full" className="block h-auto w-full" />
      </button>
    </div>
  );
};
