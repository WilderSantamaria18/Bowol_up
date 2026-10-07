import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { httpClient, SESSION_EXPIRED_EVENT } from './http';

const originalAdapter = httpClient.defaults.adapter;

function respond(status: number, data: unknown, config: InternalAxiosRequestConfig) {
  const response = { data, status, statusText: String(status), headers: {}, config };
  if (status >= 400) {
    throw new AxiosError('fallo', String(status), config, null, response as never);
  }
  return response;
}

describe('httpClient · sesión caducada (401)', () => {
  const seen: string[] = [];

  beforeEach(() => {
    seen.length = 0;
    localStorage.setItem('bowol_access_token', 'viejo');
    localStorage.setItem('bowol_refresh_token', 'refresh-1');
  });

  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter;
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renueva el token y reintenta la petición una sola vez', async () => {
    const adapter: AxiosAdapter = async (config) => {
      seen.push(`${config.url}|${config.headers.Authorization}`);
      return config.headers.Authorization === 'Bearer nuevo' ? respond(200, { items: [] }, config) : respond(401, {}, config);
    };
    httpClient.defaults.adapter = adapter;
    const post = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'nuevo', refreshToken: 'refresh-2', organization: { id: 'org-1' } },
    });

    const data = await httpClient.get('/projects');

    expect(data).toEqual({ items: [] });
    expect(post).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(['/projects|Bearer viejo', '/projects|Bearer nuevo']);
    expect(localStorage.getItem('bowol_access_token')).toBe('nuevo');
    expect(localStorage.getItem('bowol_refresh_token')).toBe('refresh-2');
  });

  it('peticiones concurrentes con 401 comparten una única renovación', async () => {
    httpClient.defaults.adapter = async (config) =>
      config.headers.Authorization === 'Bearer nuevo' ? respond(200, { ok: true }, config) : respond(401, {}, config);
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'nuevo', refreshToken: 'r2' } });

    await Promise.all([httpClient.get('/projects'), httpClient.get('/opportunities/board'), httpClient.get('/hypotheses')]);

    expect(post).toHaveBeenCalledTimes(1);
  });

  it('si no se puede renovar, limpia la sesión, avisa y rechaza con el problema normalizado', async () => {
    httpClient.defaults.adapter = async (config) => respond(401, { status: 401, detail: 'no autorizado' }, config);
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh inválido'));
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);

    await expect(httpClient.get('/projects')).rejects.toMatchObject({ status: 401 });

    expect(expired).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('bowol_access_token')).toBeNull();
    expect(localStorage.getItem('bowol_refresh_token')).toBeNull();
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  });

  it('no intenta renovar en las llamadas de autenticación (login con credenciales malas)', async () => {
    httpClient.defaults.adapter = async (config) => respond(401, { status: 401, detail: 'Credenciales incorrectas' }, config);
    const post = vi.spyOn(axios, 'post');

    await expect(httpClient.post('/auth/login', {})).rejects.toMatchObject({ detail: 'Credenciales incorrectas' });
    expect(post).not.toHaveBeenCalled();
  });
});
