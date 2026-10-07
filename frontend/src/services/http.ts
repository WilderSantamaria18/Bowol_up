import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail: string;
  instance?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('bowol_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/** Evento que AuthContext escucha para cerrar la sesión cuando ya no se puede renovar. */
export const SESSION_EXPIRED_EVENT = 'bowol:session-expired';

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];
const STORAGE = {
  access: 'bowol_access_token',
  refresh: 'bowol_refresh_token',
  organization: 'bowol_organization_id',
} as const;

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Una sola renovación en vuelo: las peticiones concurrentes que reciben 401 esperan la misma promesa. */
let refreshing: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshing) {
    const refreshToken = localStorage.getItem(STORAGE.refresh);
    if (!refreshToken) return Promise.reject(new Error('sin refresh token'));
    // axios "limpio": evita reentrar en los interceptores de httpClient.
    refreshing = axios
      .post(`${httpClient.defaults.baseURL}/auth/refresh`, { refreshToken }, { withCredentials: true })
      .then((res) => {
        const data = res.data as { accessToken: string; refreshToken: string; organization?: { id?: string } };
        localStorage.setItem(STORAGE.access, data.accessToken);
        localStorage.setItem(STORAGE.refresh, data.refreshToken);
        if (data.organization?.id) localStorage.setItem(STORAGE.organization, data.organization.id);
        return data.accessToken;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

function expireSession() {
  Object.values(STORAGE).forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

httpClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ProblemDetail>) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthCall = AUTH_PATHS.some((p) => config?.url?.includes(p));

    // Token caducado o invalidado (p. ej. el backend reinició sus claves): renovar y reintentar una vez.
    if (error.response?.status === 401 && config && !config._retried && !isAuthCall) {
      config._retried = true;
      try {
        const token = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return httpClient.request(config);
      } catch {
        expireSession();
      }
    }

    // Normalizar error RFC 7807
    const problem: ProblemDetail = error.response?.data || {
      status: error.response?.status || 500,
      detail: error.message || 'Error inesperado de red',
    };
    return Promise.reject(problem);
  }
);
