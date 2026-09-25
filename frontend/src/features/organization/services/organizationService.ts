import { httpClient } from '@/services/http';
import { Organization, Member, UpdateOrganizationDTO, InviteMemberDTO, UpdateMemberRoleDTO } from '../types';

export const organizationService = {
  async getMyOrganizations(): Promise<Organization[]> {
    return httpClient.get('/organizations');
  },

  async getOrganization(id: string): Promise<Organization> {
    return httpClient.get(`/organizations/${id}`);
  },

  async updateOrganization(id: string, data: UpdateOrganizationDTO): Promise<Organization> {
    return httpClient.patch(`/organizations/${id}`, data);
  },

  async deleteOrganization(id: string): Promise<void> {
    return httpClient.delete(`/organizations/${id}`);
  },

  async getMembers(orgId: string): Promise<Member[]> {
    return httpClient.get(`/organizations/${orgId}/members`);
  },

  async inviteMember(orgId: string, data: InviteMemberDTO): Promise<Member> {
    return httpClient.post(`/organizations/${orgId}/members`, data);
  },

  async updateMemberRole(orgId: string, userId: string, data: UpdateMemberRoleDTO): Promise<Member> {
    return httpClient.patch(`/organizations/${orgId}/members/${userId}`, data);
  },

  async removeMember(orgId: string, userId: string): Promise<void> {
    return httpClient.delete(`/organizations/${orgId}/members/${userId}`);
  },
};
