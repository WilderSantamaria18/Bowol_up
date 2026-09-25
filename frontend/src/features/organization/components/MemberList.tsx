import React, { useState } from 'react';
import { UserPlus, Trash2, Clock, CheckCircle2, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Member, Role } from '../types';

interface MemberListProps {
  members: Member[];
  currentUserRole?: Role;
  onInviteClick: () => void;
  onRoleChange: (userId: string, newRole: Role) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  currentUserRole,
  onInviteClick,
  onRoleChange,
  onRemoveMember,
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN' || currentUserRole === 'PLATFORM_ADMIN';

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'OWNER':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'MANAGER':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700/60';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
          <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
        <Clock className="w-3 h-3" strokeWidth={1.5} />
        Invitado
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            Miembros del Equipo
          </h2>
          <p className="text-xs text-zinc-400">
            {members.length} {members.length === 1 ? 'colaborador registrado' : 'colaboradores registrados'} en este workspace.
          </p>
        </div>
        {canManage && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={UserPlus}
            onClick={onInviteClick}
          >
            Invitar Miembro
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-zinc-900/30">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-zinc-400 bg-white/[0.02]">
              <th className="py-3 px-4 font-medium">Usuario</th>
              <th className="py-3 px-4 font-medium">Rol</th>
              <th className="py-3 px-4 font-medium">Estado</th>
              <th className="py-3 px-4 font-medium">Fecha de Ingreso</th>
              {canManage && <th className="py-3 px-4 font-medium text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {members.map((member) => {
              const isOwner = member.role === 'OWNER';
              return (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-semibold text-xs">
                        {member.name ? member.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200">{member.name || 'Sin nombre'}</div>
                        <div className="text-[11px] text-zinc-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {canManage && !isOwner ? (
                      <select
                        value={member.role}
                        onChange={(e) => onRoleChange(member.userId, e.target.value as Role)}
                        className="text-xs bg-zinc-900/90 text-zinc-200 border border-white/[0.1] rounded px-2 py-1 focus:outline-none focus:border-orange-500"
                        aria-label={`Cambiar rol de ${member.name}`}
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getRoleBadge(member.role)}`}>
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="py-3 px-4 text-zinc-400">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  {canManage && (
                    <td className="py-3 px-4 text-right">
                      {!isOwner && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro que deseas remover a ${member.name} del equipo?`)) {
                              setRemovingId(member.userId);
                              onRemoveMember(member.userId).finally(() => setRemovingId(null));
                            }
                          }}
                          disabled={removingId === member.userId}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1 rounded-md"
                          title="Remover miembro"
                          aria-label={`Remover ${member.name}`}
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
