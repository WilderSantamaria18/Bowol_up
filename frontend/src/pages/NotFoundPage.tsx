import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-6xl font-black text-orange-500">404</h1>
      <h2 className="text-2xl font-bold text-white">Página no encontrada</h2>
      <p className="text-zinc-400 max-w-md mx-auto text-sm">
        El módulo o recurso al que intentas acceder no está disponible en este momento.
      </p>
      <div className="pt-4">
        <Link to="/">
          <Button variant="secondary" leftIcon={Home}>
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};
