import React, { useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap/registerPlugins';

interface ScrollDebugProps {
  mode: string;
  isDocked: boolean;
  masterProgress: number;
}

export const ScrollDebug: React.FC<ScrollDebugProps> = ({ mode, isDocked, masterProgress }) => {
  if (!import.meta.env.DEV) return null;

  const [fps, setFps] = useState(60);
  const [activeTriggers, setActiveTriggers] = useState(0);
  const [activeTweens, setActiveTweens] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measure = (now: number) => {
      frameCount++;
      if (now - lastTime >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
        setActiveTriggers(ScrollTrigger.getAll().length);
        setActiveTweens(gsap.globalTimeline.getChildren().length);
      }
      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      aria-label="Panel de depuración Scroll BOWOL"
      className="fixed bottom-4 right-4 z-50 bg-zinc-950/90 border border-zinc-800 text-zinc-300 font-mono text-[11px] p-3 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none select-none flex flex-col gap-1 w-52"
    >
      <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-orange-400 font-bold">
        <span>GSAP MONITOR</span>
        <span className={fps >= 55 ? 'text-emerald-400' : 'text-amber-400'}>{fps} FPS</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">STs activos:</span>
        <span className="text-zinc-200">{activeTriggers}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">Tweens:</span>
        <span className="text-zinc-200">{activeTweens}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">Master Prog:</span>
        <span className="text-zinc-200">{(masterProgress * 100).toFixed(0)}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">Modo:</span>
        <span className="text-orange-400 uppercase font-semibold">{mode}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">Docked:</span>
        <span className={isDocked ? 'text-emerald-400' : 'text-zinc-500'}>
          {isDocked ? 'TRUE' : 'FALSE'}
        </span>
      </div>
    </div>
  );
};
