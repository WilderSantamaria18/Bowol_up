import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { UserSummary, OrganizationSummary, LoginPayload, RegisterPayload, AuthResponse } from '../types';

interface AuthContextType {
  user: UserSummary | null;
  organization: OrganizationSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [organization, setOrganization] = useState<OrganizationSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveAuthSession = (data: AuthResponse) => {
    localStorage.setItem('bowol_access_token', data.accessToken);
    localStorage.setItem('bowol_refresh_token', data.refreshToken);
    if (data.organization?.id) {
      localStorage.setItem('bowol_organization_id', data.organization.id);
    }
    setUser(data.user);
    setOrganization(data.organization);
  };

  const clearAuthSession = () => {
    localStorage.removeItem('bowol_access_token');
    localStorage.removeItem('bowol_refresh_token');
    localStorage.removeItem('bowol_organization_id');
    setUser(null);
    setOrganization(null);
  };

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('bowol_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const me = await authService.getMe();
      setUser({
        id: me.id,
        name: me.name,
        email: me.email,
        avatarUrl: me.avatarUrl,
        status: me.status,
      });
      setOrganization(me.currentOrganization || null);
    } catch {
      // Intentar refrescar token si getMe falla
      const refreshToken = localStorage.getItem('bowol_refresh_token');
      if (refreshToken) {
        try {
          const refreshed = await authService.refresh(refreshToken);
          saveAuthSession(refreshed);
        } catch {
          clearAuthSession();
        }
      } else {
        clearAuthSession();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    saveAuthSession(data);
  };

  const register = async (payload: RegisterPayload) => {
    const data = await authService.register(payload);
    saveAuthSession(data);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('bowol_refresh_token');
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignorar fallo de red en logout
    } finally {
      clearAuthSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
