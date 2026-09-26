import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, Loader2, Key, Webhook, Shield, ExternalLink } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { organizationService } from '../services/organizationService';
import { Organization, Member, Role, UpdateOrganizationDTO } from '../types';
import { OrgProfileForm } from '../components/OrgProfileForm';
import { MemberList } from '../components/MemberList';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { ApiKeyManagement } from '@/features/developer/components/ApiKeyManagement';
import { WebhookManagement } from '@/features/developer/components/WebhookManagement';
import { Alert } from '@/components/ui/Alert';

export const SettingsPage: React.FC = () => {
  const { organization: activeOrg } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'members' | 'api-keys' | 'webhooks'>('profile');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orgId = activeOrg?.id;

  const loadData = async () => {
    if (!orgId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [orgData, membersData] = await Promise.all([
        organizationService.getOrganization(orgId),
        organizationService.getMembers(orgId),
      ]);
      setOrganization(orgData);
      setMembers(membersData);
    } catch (err: unknown) {
      setError('No se pudo cargar la información de la organización');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleUpdateOrg = async (data: UpdateOrganizationDTO) => {
    if (!orgId) return;
    const updated = await organizationService.updateOrganization(orgId, data);
    setOrganization(updated);
  };

  const handleInviteMember = async (email: string, role: Role) => {
    if (!orgId) return;
    const newMember = await organizationService.inviteMember(orgId, { email, role });
    setMembers((prev) => [...prev, newMember]);
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!orgId) return;
    const updated = await organizationService.updateMemberRole(orgId, userId, { role: newRole });
    setMembers((prev) => prev.map((m) => (m.userId === userId ? updated : m)));
  };

  const handleRemoveMember = async (userId: string) => {
    if (!orgId) return;
    await organizationService.removeMember(orgId, userId);
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Configuración del Workspace
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Administra la identidad corporativa y los miembros de tu equipo
        </p>
      </div>

      {error && <Alert variant="error" detail={error} />}

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-white/[0.08] gap-4 sm:gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Building className="w-4 h-4" strokeWidth={1.5} />
          Perfil General
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" strokeWidth={1.5} />
          Equipo y Miembros ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('api-keys')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'api-keys'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Key className="w-4 h-4" strokeWidth={1.5} />
          API Keys & Desarrolladores
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'webhooks'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Webhook className="w-4 h-4" strokeWidth={1.5} />
          Webhooks Salientes
        </button>

        <Link
          to="/audit-logs"
          className="pb-3 text-sm font-medium flex items-center gap-1.5 border-b-2 border-transparent text-zinc-400 hover:text-orange-400 ml-auto transition-colors"
        >
          <Shield className="w-4 h-4" strokeWidth={1.5} />
          Auditoría & Compliance
          <ExternalLink className="w-3 h-3 opacity-60" />
        </Link>
      </div>

      {/* Content */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08]">
        {activeTab === 'profile' && organization && (
          <OrgProfileForm
            organization={organization}
            onUpdate={handleUpdateOrg}
            isReadOnly={organization.role !== 'OWNER' && organization.role !== 'ADMIN' && organization.role !== 'PLATFORM_ADMIN'}
          />
        )}

        {activeTab === 'members' && (
          <MemberList
            members={members}
            currentUserRole={organization?.role}
            onInviteClick={() => setIsInviteModalOpen(true)}
            onRoleChange={handleRoleChange}
            onRemoveMember={handleRemoveMember}
          />
        )}

        {activeTab === 'api-keys' && (
          <ApiKeyManagement />
        )}

        {activeTab === 'webhooks' && (
          <WebhookManagement />
        )}
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteMember}
      />
    </div>
  );
};
