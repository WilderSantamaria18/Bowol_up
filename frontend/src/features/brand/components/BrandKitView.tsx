import React, { useState, useEffect } from 'react';
import { BrandProfile, BrandVoiceTone, SaveBrandProfilePayload } from '../types';
import { Palette, Type, Volume2, ShieldCheck, ShieldAlert, Plus, X, Sparkles, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BrandKitViewProps {
  initialProfile?: BrandProfile;
  onSave: (payload: SaveBrandProfilePayload) => Promise<void>;
  isSaving?: boolean;
}

const VOICE_TONES: { value: BrandVoiceTone; label: string; description: string }[] = [
  { value: 'PROFESSIONAL', label: 'Profesional', description: 'Autoridad respetuosa, sobria y orientada a valor comercial.' },
  { value: 'INNOVATIVE', label: 'Innovador', description: 'Visión futurista, ágil y centrada en tecnologías de vanguardia.' },
  { value: 'BOLD', label: 'Audaz (Bold)', description: 'Directo, sin rodeos, desafiando el status quo con opiniones firmes.' },
  { value: 'FRIENDLY', label: 'Cercano / Friendly', description: 'Accesible, empático y conversacional, invitando al diálogo.' },
  { value: 'AUTHORITATIVE', label: 'Autoridad Técnica', description: 'Rigor de ingeniería, datos empíricos y fundamentación sólida.' },
  { value: 'MINIMALIST', label: 'Minimalista', description: 'Precisión conceptual, economía de palabras y alto impacto por frase.' },
];

export const BrandKitView: React.FC<BrandKitViewProps> = ({
  initialProfile,
  onSave,
  isSaving = false,
}) => {
  const [brandName, setBrandName] = useState(initialProfile?.brandName || 'BOWOL Platform');
  const [tagline, setTagline] = useState(initialProfile?.tagline || '');
  const [brandVoiceTone, setBrandVoiceTone] = useState<BrandVoiceTone>(initialProfile?.brandVoiceTone || 'INNOVATIVE');
  const [targetAudience, setTargetAudience] = useState(initialProfile?.targetAudience || '');
  const [primaryColor, setPrimaryColor] = useState(initialProfile?.primaryColor || '#EA580C');
  const [secondaryColor, setSecondaryColor] = useState(initialProfile?.secondaryColor || '#10B981');
  const [accentColor, setAccentColor] = useState(initialProfile?.accentColor || '#6366F1');
  const [fontHeading, setFontHeading] = useState(initialProfile?.fontHeading || 'Plus Jakarta Sans');
  const [fontBody, setFontBody] = useState(initialProfile?.fontBody || 'Inter');
  const [keyValues, setKeyValues] = useState<string[]>(initialProfile?.keyValues || []);
  const [newValueInput, setNewValueInput] = useState('');
  const [doGuidelines, setDoGuidelines] = useState(initialProfile?.doGuidelines || '');
  const [dontGuidelines, setDontGuidelines] = useState(initialProfile?.dontGuidelines || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setBrandName(initialProfile.brandName || '');
      setTagline(initialProfile.tagline || '');
      setBrandVoiceTone(initialProfile.brandVoiceTone || 'INNOVATIVE');
      setTargetAudience(initialProfile.targetAudience || '');
      setPrimaryColor(initialProfile.primaryColor || '#EA580C');
      setSecondaryColor(initialProfile.secondaryColor || '#10B981');
      setAccentColor(initialProfile.accentColor || '#6366F1');
      setFontHeading(initialProfile.fontHeading || 'Plus Jakarta Sans');
      setFontBody(initialProfile.fontBody || 'Inter');
      setKeyValues(initialProfile.keyValues || []);
      setDoGuidelines(initialProfile.doGuidelines || '');
      setDontGuidelines(initialProfile.dontGuidelines || '');
    }
  }, [initialProfile]);

  const handleAddValue = () => {
    if (!newValueInput.trim()) return;
    if (!keyValues.includes(newValueInput.trim())) {
      setKeyValues([...keyValues, newValueInput.trim()]);
    }
    setNewValueInput('');
  };

  const handleRemoveValue = (val: string) => {
    setKeyValues(keyValues.filter((v) => v !== val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      brandName: brandName.trim(),
      tagline: tagline.trim(),
      brandVoiceTone,
      targetAudience: targetAudience.trim(),
      primaryColor,
      secondaryColor,
      accentColor,
      fontHeading,
      fontBody,
      keyValues,
      doGuidelines: doGuidelines.trim(),
      dontGuidelines: dontGuidelines.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-subtle border border-white/[0.08] backdrop-blur-md">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
            Kit de Identidad de Marca (Brand Profile)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Define la personalidad, tonos de voz y directrices visuales que el motor de IA usará para generar contenido.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" />
              Guardado con éxito
            </span>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSaving}
            className="shadow-lg shadow-orange-600/20"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Guardando...
              </>
            ) : (
              'Guardar Manual de Marca'
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Tokens & Identity (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">Información General</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Nombre de la Marca *
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="p. ej. Innovación acelerada con rigor estratégico"
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Audiencia Objetivo (Target Audience)
              </label>
              <textarea
                rows={2}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Describe quiénes son tus clientes clave, tomadores de decisión o usuarios objetivo..."
                className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Color Palette */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Palette className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                Paleta Cromática de Marca
              </h3>
              <span className="text-xs text-zinc-500">Formato Hexadecimal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
                <span className="text-xs font-medium text-zinc-400">Color Primario</span>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full bg-surface-subtle border border-white/[0.08] rounded px-2 py-1 text-xs text-zinc-300 font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
                <span className="text-xs font-medium text-zinc-400">Color Secundario</span>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full bg-surface-subtle border border-white/[0.08] rounded px-2 py-1 text-xs text-zinc-300 font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
                <span className="text-xs font-medium text-zinc-400">Color Acento</span>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full bg-surface-subtle border border-white/[0.08] rounded px-2 py-1 text-xs text-zinc-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
              Tipografía Corporativa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Fuente para Títulos (Heading)
                </label>
                <input
                  type="text"
                  value={fontHeading}
                  onChange={(e) => setFontHeading(e.target.value)}
                  placeholder="p. ej. Plus Jakarta Sans, Outfit, Montserrat"
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Fuente para Textos (Body)
                </label>
                <input
                  type="text"
                  value={fontBody}
                  onChange={(e) => setFontBody(e.target.value)}
                  placeholder="p. ej. Inter, Roboto, Open Sans"
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Guidelines: Do's and Don'ts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                Qué Hacer (Do&apos;s)
              </h4>
              <textarea
                rows={4}
                value={doGuidelines}
                onChange={(e) => setDoGuidelines(e.target.value)}
                placeholder="Principios de comunicación recomendados: usar datos, tono propositivo, historias reales..."
                className="w-full bg-black/30 border border-emerald-500/20 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/10 border border-rose-500/20 space-y-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" strokeWidth={1.5} />
                Qué Evitar (Don&apos;ts)
              </h4>
              <textarea
                rows={4}
                value={dontGuidelines}
                onChange={(e) => setDontGuidelines(e.target.value)}
                placeholder="Prácticas a evitar: promesas desmedidas, tecnicismos innecesarios, emojis excesivos..."
                className="w-full bg-black/30 border border-rose-500/20 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Voice Tone & Values (1 col) */}
        <div className="space-y-6">
          {/* Voice Tone Selector */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
              Tono de Voz Principal
            </h3>
            <div className="space-y-2">
              {VOICE_TONES.map((tone) => {
                const isSelected = brandVoiceTone === tone.value;
                return (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => setBrandVoiceTone(tone.value)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-orange-600/15 border-orange-500/40 text-white shadow-sm'
                        : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{tone.label}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-orange-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">{tone.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Values */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/[0.08] space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
              Valores Clave de Marca
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newValueInput}
                onChange={(e) => setNewValueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddValue();
                  }
                }}
                placeholder="Añadir valor corporativo..."
                className="flex-1 bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleAddValue}
                className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 transition-colors"
                aria-label="Añadir valor"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {keyValues.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-zinc-300 font-medium"
                >
                  {val}
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(val)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
