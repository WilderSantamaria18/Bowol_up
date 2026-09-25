import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Role } from '../types';
import { ProblemDetail } from '@/services/http';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: Role) => Promise<void>;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onInvite(email.trim().toLowerCase(), role);
      setEmail('');
      setRole('MEMBER');
      onClose();
    } catch (err: unknown) {
      const problem = err as ProblemDetail;
      setError(problem?.detail || 'No se pudo enviar la invitación al usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md rounded-2xl bg-zinc-950 border border-white/[0.08] shadow-2xl p-6 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <UserPlus className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h3 id="modal-headline" className="text-sm font-semibold text-zinc-100">
                Invitar nuevo colaborador
              </h3>
              <p className="text-xs text-zinc-400">
                Asigna un rol y envía acceso a tu organización
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-md"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <Alert variant="error" detail={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Input
            label="Correo electrónico corporativo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colaborador@empresa.com"
            leftIcon={Mail}
            required
            autoFocus
          />

          <Select
            label="Rol en el equipo"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            options={[
              { value: 'MEMBER', label: 'Miembro (Ejecutor y colaborador en tareas)' },
              { value: 'MANAGER', label: 'Manager (Gestión de proyectos, investigación y sprints)' },
              { value: 'ADMIN', label: 'Administrador (Gestión total del equipo y configuraciones)' },
            ]}
            helperText="Podrás cambiar o revocar el rol en cualquier momento desde los ajustes."
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              leftIcon={Shield}
            >
              Enviar invitación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
