import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { brandService } from '../services/brandService';
import { BrandKitView } from '../components/BrandKitView';
import { SaveBrandProfilePayload } from '../types';
import { Palette, Sparkles, Share2, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';

export const BrandPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: brandProfile, isLoading, error } = useQuery({
    queryKey: ['brand-profile'],
    queryFn: () => brandService.getBrandProfile(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: SaveBrandProfilePayload) => brandService.saveBrandProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-profile'] });
      setSuccessMessage('¡Manual de identidad y voz guardado exitosamente!');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
  });

  const handleSave = async (payload: SaveBrandProfilePayload) => {
    await saveMutation.mutateAsync(payload);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm animate-pulse">Cargando Manual de Identidad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <Alert variant="error" title="Error al cargar identidad">
          No se pudo sincronizar el perfil de marca. Por favor recarga la página.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header Liquid Glass */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/80 to-zinc-950 p-6 sm:p-8 border border-zinc-200/90 dark:border-white/[0.08] shadow-lg dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/25 text-orange-400">
                <Palette className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono">
                Identidad & Comunicación
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight font-display">
                Manual de Marca & Voz (Brand Kit)
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                Configura la identidad, directrices de tono y valores clave que el motor de IA de BOWOL usará para generar propuestas de contenido y amplificar el ciclo de innovación.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/social"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
              <span>Ver Feed Social</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Explainability banner */}
        <div className="mt-6 pt-6 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" strokeWidth={1.5} />
            <span>Integrado en generación de contenido IA</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
            <span>Guardrails estrictos de estilo y directrices</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" strokeWidth={1.5} />
            <span>Trazabilidad directa al Business Profile</span>
          </div>
        </div>
      </div>

      {successMessage && (
        <Alert variant="success" title="Actualización Exitosa">
          {successMessage}
        </Alert>
      )}

      {/* Main Brand Kit Form */}
      <BrandKitView
        initialProfile={brandProfile}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
};
