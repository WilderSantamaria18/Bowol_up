import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingWizard } from '../components/OnboardingWizard';
import { businessProfileService } from '../services/businessProfileService';
import { OnboardingPayload } from '../types';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = async (data: OnboardingPayload) => {
    await businessProfileService.completeOnboarding(data);
    navigate('/business-profile');
  };

  return (
    <div className="py-6 sm:py-10">
      <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Configuración Estratégica de tu Negocio
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Completa el autodiagnóstico en 7 pasos para que el Copiloto de Innovación conozca el contexto exacto de tu empresa
        </p>
      </div>
      <OnboardingWizard onComplete={handleComplete} />
    </div>
  );
};
