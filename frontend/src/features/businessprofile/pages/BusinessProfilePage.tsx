import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BusinessProfileView } from '../components/BusinessProfileView';
import { businessProfileService } from '../services/businessProfileService';
import { BusinessProfile } from '../types';

export const BusinessProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    businessProfileService.getProfile()
      .then((data) => {
        setProfile(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err?.status === 404 || err?.code === 'NOT_FOUND') {
          setIsNotFound(true);
        }
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" strokeWidth={1.5} />
      </div>
    );
  }

  if (isNotFound || !profile) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
          <Sparkles className="w-7 h-7" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-100">
            Perfil Estratégico Pendiente de Configuración
          </h2>
          <p className="text-xs text-zinc-400">
            Aún no has completado el onboarding de tu organización. Configura el perfil para habilitar recomendaciones de IA personalizadas.
          </p>
        </div>
        <Link to="/onboarding">
          <Button variant="primary" size="lg" rightIcon={ArrowRight}>
            Iniciar Onboarding (7 Pasos)
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BusinessProfileView profile={profile} />
    </div>
  );
};
