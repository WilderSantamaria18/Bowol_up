/** Paleta semántica compartida por los componentes de UI (claro y oscuro resueltos aquí, una sola vez). */
export type Tone = 'orange' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'violet' | 'blue' | 'sky' | 'zinc';

interface ToneClasses {
  /** Icono o texto de acento. */
  text: string;
  /** Baldosa tintada con borde (iconos de cabecera). */
  tile: string;
  /** Pestaña / chip seleccionado. */
  active: string;
  /** Valor numérico destacado (KPI). */
  value: string;
  /** Botón primario del tono. */
  solid: string;
  /** Baldosa de icono estilo iOS (degradado + brillo); el icono va en blanco. */
  ios: string;
}

export const TONES: Record<Tone, ToneClasses> = {
  orange: {
    text: 'text-orange-600 dark:text-orange-400',
    tile: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400',
    active: 'bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-300',
    value: 'text-orange-700 dark:text-orange-300',
    solid: 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20',
    ios: 'ios-tile ios-tile-orange',
  },
  cyan: {
    text: 'text-cyan-600 dark:text-cyan-400',
    tile: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    active: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-700 dark:text-cyan-300',
    value: 'text-cyan-700 dark:text-cyan-300',
    solid: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20',
    ios: 'ios-tile ios-tile-cyan',
  },
  emerald: {
    text: 'text-emerald-600 dark:text-emerald-400',
    tile: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    active: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    value: 'text-emerald-700 dark:text-emerald-300',
    solid: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20',
    ios: 'ios-tile ios-tile-emerald',
  },
  rose: {
    text: 'text-rose-600 dark:text-rose-400',
    tile: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
    active: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300',
    value: 'text-rose-700 dark:text-rose-300',
    solid: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20',
    ios: 'ios-tile ios-tile-rose',
  },
  amber: {
    text: 'text-amber-600 dark:text-amber-400',
    tile: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    active: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300',
    value: 'text-amber-700 dark:text-amber-300',
    solid: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20',
    ios: 'ios-tile ios-tile-amber',
  },
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-400',
    tile: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
    active: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:text-indigo-300',
    value: 'text-indigo-700 dark:text-indigo-300',
    solid: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20',
    ios: 'ios-tile ios-tile-indigo',
  },
  violet: {
    text: 'text-violet-600 dark:text-violet-400',
    tile: 'bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400',
    active: 'bg-violet-500/15 border-violet-500/30 text-violet-700 dark:text-violet-300',
    value: 'text-violet-700 dark:text-violet-300',
    solid: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20',
    ios: 'ios-tile ios-tile-violet',
  },
  blue: {
    text: 'text-blue-600 dark:text-blue-400',
    tile: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
    active: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300',
    value: 'text-blue-700 dark:text-blue-300',
    solid: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20',
    ios: 'ios-tile ios-tile-blue',
  },
  sky: {
    text: 'text-sky-600 dark:text-sky-400',
    tile: 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400',
    active: 'bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300',
    value: 'text-sky-700 dark:text-sky-300',
    solid: 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20',
    ios: 'ios-tile ios-tile-sky',
  },
  zinc: {
    text: 'text-zinc-600 dark:text-zinc-400',
    tile: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-600 dark:text-zinc-400',
    active: 'bg-zinc-900/10 border-zinc-900/20 text-zinc-900 dark:bg-white/10 dark:border-white/20 dark:text-zinc-100',
    value: 'text-zinc-900 dark:text-zinc-100',
    solid: 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900',
    ios: 'ios-tile ios-tile-zinc',
  },
};
