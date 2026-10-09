import React, { useState, useEffect } from 'react';
import { DailyCheckin, Task } from '../types';
import {
  CalendarDays,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  History,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { planningService } from '@/features/planning/services/planningService';

interface DailyCheckinModalProps {
  isOpen: boolean;
  projectId?: string;
  projectName?: string;
  tasks?: Task[];
  onClose: () => void;
  onOpenBlockModal?: (task: Task) => void;
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  isOpen,
  projectId = 'default',
  projectName = 'Proyecto Principal',
  tasks = [],
  onClose,
  onOpenBlockModal,
}) => {
  const [activeTab, setActiveTab] = useState<'nuevo' | 'historial'>('nuevo');
  const [userName, setUserName] = useState(() => localStorage.getItem('bowol_checkin_user') || 'Responsable');
  const [yesterdayDeliverable, setYesterdayDeliverable] = useState('');
  const [todayCommitment, setTodayCommitment] = useState('');
  const [blockers, setBlockers] = useState('');
  const [hasBlocker, setHasBlocker] = useState(false);
  const [selectedTaskForBlocker, setSelectedTaskForBlocker] = useState<string>('');

  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load check-in history from server
  useEffect(() => {
    let isMounted = true;
    if (projectId && projectId !== 'default') {
      planningService.getDailyCheckins(projectId)
        .then((data) => {
          if (!isMounted) return;
          if (data && data.length > 0) {
            setCheckins(
              data.map((d) => ({
                id: d.id || `checkin-${Date.now()}`,
                projectId: d.projectId,
                date: d.date,
                userName: d.userName,
                yesterdayDeliverable: d.yesterdayDeliverable,
                todayCommitment: d.todayCommitment,
                blockers: d.blockers || '',
                hasBlocker: !!d.hasBlocker,
                taskId: d.taskId || undefined,
                createdAt: d.createdAt || new Date().toISOString(),
              }))
            );
          } else {
            // Check fallback in local storage
            try {
              const stored = localStorage.getItem(`bowol_checkins_${projectId}`);
              if (stored) setCheckins(JSON.parse(stored));
              else setCheckins([]);
            } catch {
              setCheckins([]);
            }
          }
        })
        .catch(() => {
          try {
            const stored = localStorage.getItem(`bowol_checkins_${projectId}`);
            if (stored) setCheckins(JSON.parse(stored));
            else setCheckins([]);
          } catch {
            setCheckins([]);
          }
        });
    } else {
      try {
        const stored = localStorage.getItem(`bowol_checkins_${projectId}`);
        if (stored) setCheckins(JSON.parse(stored));
        else setCheckins([]);
      } catch {
        setCheckins([]);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !yesterdayDeliverable.trim() || !todayCommitment.trim()) {
      return;
    }

    localStorage.setItem('bowol_checkin_user', userName.trim());

    if (projectId && projectId !== 'default') {
      try {
        const saved = await planningService.createDailyCheckin(projectId, {
          userName: userName.trim(),
          date: new Date().toISOString().split('T')[0],
          yesterdayDeliverable: yesterdayDeliverable.trim(),
          todayCommitment: todayCommitment.trim(),
          blockers: hasBlocker ? blockers.trim() : null,
          hasBlocker,
          taskId: selectedTaskForBlocker || null,
        });

        const newCheckin: DailyCheckin = {
          id: saved.id || `checkin-${Date.now()}`,
          projectId,
          date: saved.date,
          userName: saved.userName,
          yesterdayDeliverable: saved.yesterdayDeliverable,
          todayCommitment: saved.todayCommitment,
          blockers: saved.blockers || 'Ninguno. Flujo despejado.',
          hasBlocker: !!saved.hasBlocker,
          taskId: saved.taskId || undefined,
          createdAt: saved.createdAt || new Date().toISOString(),
        };

        const updated = [newCheckin, ...checkins];
        setCheckins(updated);
        localStorage.removeItem(`bowol_checkins_${projectId}`);
      } catch (err) {
        console.error('Error guardando check-in en servidor:', err);
        const fallbackCheckin: DailyCheckin = {
          id: `checkin-${Date.now()}`,
          projectId,
          date: new Date().toISOString().split('T')[0],
          userName: userName.trim(),
          yesterdayDeliverable: yesterdayDeliverable.trim(),
          todayCommitment: todayCommitment.trim(),
          blockers: hasBlocker ? blockers.trim() : 'Ninguno. Flujo despejado.',
          hasBlocker,
          createdAt: new Date().toISOString(),
        };
        const updated = [fallbackCheckin, ...checkins];
        setCheckins(updated);
        localStorage.setItem(`bowol_checkins_${projectId}`, JSON.stringify(updated));
      }
    } else {
      const fallbackCheckin: DailyCheckin = {
        id: `checkin-${Date.now()}`,
        projectId,
        date: new Date().toISOString().split('T')[0],
        userName: userName.trim(),
        yesterdayDeliverable: yesterdayDeliverable.trim(),
        todayCommitment: todayCommitment.trim(),
        blockers: hasBlocker ? blockers.trim() : 'Ninguno. Flujo despejado.',
        hasBlocker,
        createdAt: new Date().toISOString(),
      };
      const updated = [fallbackCheckin, ...checkins];
      setCheckins(updated);
      localStorage.setItem(`bowol_checkins_${projectId}`, JSON.stringify(updated));
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setYesterdayDeliverable('');
      setTodayCommitment('');
      setBlockers('');
      setHasBlocker(false);
      setActiveTab('historial');
    }, 900);
  };

  const copyToClipboard = (c: DailyCheckin) => {
    const text = `📋 *Check-in Diario BOWOL (Fase 6.1)*
👤 *Responsable:* ${c.userName}
📅 *Fecha:* ${c.date} | *Proyecto:* ${projectName}

1️⃣ *¿Qué avancé/terminé ayer y dónde se revisa?*
${c.yesterdayDeliverable}

2️⃣ *¿Qué tarea avanzo hoy y qué resultado espero?*
${c.todayCommitment}

3️⃣ *¿Qué me bloquea y qué ayuda necesito?*
${c.blockers}`;

    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-300 dark:border-cyan-500/30 bg-white dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Check-in Diario Express (3 Minutos)</span>
              </h3>
              <p className="text-xs text-cyan-600 dark:text-cyan-400/90 font-medium">
                Regla BOWOL Plans 2.0 (Fase 6.1 — Sincronización ágil sin burocracia)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-4 pb-3 border-b border-zinc-200 dark:border-zinc-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('nuevo')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'nuevo'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Mi Check-in de Hoy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'historial'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Historial ({checkins.length})</span>
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto flex-1 mt-4 pr-1">
          {activeTab === 'nuevo' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tu nombre o rol en el equipo
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej: Sofia (Diseñadora) / Andrés"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              {/* Question 1 */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span>1. ¿Qué entregable avancé o terminé desde el último reporte y dónde se revisa?</span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">Con evidencia</span>
                </label>
                <textarea
                  value={yesterdayDeliverable}
                  onChange={(e) => setYesterdayDeliverable(e.target.value)}
                  placeholder="Ej: Terminé el borrador de la propuesta comercial para el cliente X. Se revisa en Google Drive > Propuestas > v1.2"
                  rows={2}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              {/* Question 2 */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span>2. ¿Qué tarea voy a avanzar hoy y qué resultado concreto espero dejar?</span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">Resultado tangible</span>
                </label>
                <textarea
                  value={todayCommitment}
                  onChange={(e) => setTodayCommitment(e.target.value)}
                  placeholder="Ej: Voy a avanzar la tarea T-003. Resultado: Lista de precios configurada y probada en el catálogo."
                  rows={2}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              {/* Question 3: Blockers */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-950/60">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${hasBlocker ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span>3. ¿Qué me bloquea y qué ayuda concreta necesito?</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasBlocker}
                      onChange={(e) => setHasBlocker(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span>¿Tengo un bloqueo hoy?</span>
                  </label>
                </div>

                {hasBlocker ? (
                  <div className="space-y-3 mt-2">
                    <textarea
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      placeholder="Describe qué te impide avanzar y quién del equipo o cliente puede ayudarte a resolverlo..."
                      rows={2}
                      className="w-full rounded-xl border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      required
                    />

                    {tasks.length > 0 && onOpenBlockModal && (
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <select
                          value={selectedTaskForBlocker}
                          onChange={(e) => setSelectedTaskForBlocker(e.target.value)}
                          className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200"
                        >
                          <option value="">Seleccionar tarea para activar protocolo de bloqueo...</option>
                          {tasks.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} ({t.status})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const found = tasks.find((t) => t.id === selectedTaskForBlocker);
                            if (found) {
                              onOpenBlockModal(found);
                              onClose();
                            }
                          }}
                          disabled={!selectedTaskForBlocker}
                          className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-600/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/40 hover:bg-red-200 dark:hover:bg-red-600/50 transition-colors disabled:opacity-40"
                        >
                          Bloquear Tarjeta
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Sin bloqueos. Flujo de trabajo despejado para hoy.</span>
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={savedSuccess}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>¡Guardado!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Guardar Check-in</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {checkins.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No hay check-ins registrados aún en este proyecto.
                </div>
              ) : (
                checkins.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-slate-950/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-2.5 shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100 dark:border-zinc-900">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{item.userName}</span>
                        <span className="text-slate-400 dark:text-slate-500">•</span>
                        <span className="text-slate-500 dark:text-slate-400">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.hasBlocker ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-[10px] font-medium">
                            <AlertTriangle className="h-3 w-3" /> Con bloqueo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-medium">
                            <CheckCircle2 className="h-3 w-3" /> Despejado
                          </span>
                        )}
                        <button
                          onClick={() => copyToClipboard(item)}
                          title="Copiar formato Markdown para Slack/WhatsApp"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 text-[11px] transition-colors border border-zinc-200 dark:border-transparent"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedId === item.id ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-slate-500 font-medium">Ayer / Entregable: </span>
                        <span className="text-slate-800 dark:text-slate-300">{item.yesterdayDeliverable}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Hoy / Compromiso: </span>
                        <span className="text-slate-800 dark:text-slate-300">{item.todayCommitment}</span>
                      </div>
                      {item.hasBlocker && (
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-300">
                          <span className="font-semibold">Bloqueo reportado: </span>
                          <span>{item.blockers}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
