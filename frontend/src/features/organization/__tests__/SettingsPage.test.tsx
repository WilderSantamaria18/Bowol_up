import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from '../pages/SettingsPage';
import { organizationService } from '../services/organizationService';

vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    organization: { id: '0191a3f2-1111-7000-8000-000000000001', name: 'Startup AI' },
    user: { id: 'user-1', name: 'Ana Owner' },
    isAuthenticated: true,
  }),
}));

vi.mock('../services/organizationService', () => ({
  organizationService: {
    getOrganization: vi.fn(),
    getMembers: vi.fn(),
    updateOrganization: vi.fn(),
    inviteMember: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
  },
}));

describe('SettingsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(organizationService.getOrganization).mockResolvedValue({
      id: '0191a3f2-1111-7000-8000-000000000001',
      name: 'Startup AI',
      slug: 'startup-ai',
      industry: 'SaaS B2B',
      size: 'SMALL',
      country: 'PE',
      memberCount: 2,
      role: 'OWNER',
      createdAt: '2026-01-15T10:00:00Z',
    });

    vi.mocked(organizationService.getMembers).mockResolvedValue([
      {
        id: 1,
        userId: 'user-1',
        name: 'Ana Owner',
        email: 'ana@startup.com',
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 2,
        userId: 'user-2',
        name: 'Carlos Dev',
        email: 'carlos@startup.com',
        role: 'MEMBER',
        status: 'INVITED',
        joinedAt: '2026-01-16T10:00:00Z',
      },
    ]);
  });

  it('renderiza el perfil general y permite alternar a la pestaña de miembros', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue('Startup AI')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SaaS B2B')).toBeInTheDocument();

    // Cambiar a la pestaña de miembros
    const membersTab = screen.getByRole('button', { name: /equipo y miembros/i });
    fireEvent.click(membersTab);

    expect(await screen.findByText('Ana Owner')).toBeInTheDocument();
    expect(screen.getByText('Carlos Dev')).toBeInTheDocument();
    expect(screen.getByText('carlos@startup.com')).toBeInTheDocument();
  });

  it('permite abrir el modal de invitar miembro', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    // Cambiar a la pestaña de miembros
    const membersTab = await screen.findByRole('button', { name: /equipo y miembros/i });
    fireEvent.click(membersTab);

    const inviteBtn = await screen.findByRole('button', { name: /invitar miembro/i });
    fireEvent.click(inviteBtn);

    expect(screen.getByRole('heading', { name: /invitar nuevo colaborador/i })).toBeInTheDocument();
  });
});
