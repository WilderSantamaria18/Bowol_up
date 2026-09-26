import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2,
  Terminal,
  Zap
} from 'lucide-react';
import { developerService } from '../services/developerService';
import { ApiKey, ApiKeyCreated } from '../types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export const ApiKeyManagement: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single-reveal Modal state
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Revoke state
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await developerService.listApiKeys();
      setKeys(data);
    } catch (err: any) {
      setError(err?.detail || 'No se pudieron cargar las API Keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await developerService.createApiKey({
        name: keyName.trim(),
        expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
      });
      setCreatedKey(created);
      setIsCreateOpen(false);
      setKeyName('');
      setExpiresInDays('');
      await loadKeys();
    } catch (err: any) {
      setError(err?.detail || 'Error al generar la API Key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas revocar esta API Key inmediatamente? Cualquier integración activa dejará de funcionar.')) {
      return;
    }

    setRevokingId(id);
    try {
      await developerService.revokeApiKey(id);
      await loadKeys();
    } catch (err: any) {
      setError(err?.detail || 'No se pudo revocar la clave');
    } finally {
      setRevokingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-zinc-900/40 to-white/[0.02] border border-orange-500/20 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              Claves de API Corporativas
            </h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Permite a tus pipelines de CI/CD, agentes autónomos y herramientas de automatización autenticarse de forma segura usando el encabezado <code className="text-orange-300 bg-orange-500/10 px-1.5 py-0.5 rounded">X-API-Key</code>.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          leftIcon={Plus}
          className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 shadow-lg shadow-orange-500/20"
        >
          Generar Nueva API Key
        </Button>
      </div>

      {error && <Alert variant="error" detail={error} />}

      {/* Quick Integration Example */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-zinc-300 font-mono flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 truncate">
          <Terminal className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="text-zinc-500">curl</span>
          <span className="text-orange-300">-H "X-API-Key: bwl_live_..."</span>
          <span className="truncate">https://api.bowol.com/api/v1/trends</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-zinc-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Rate Limit: Automático</span>
        </div>
      </div>

      {/* Keys Table */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-white/[0.08] p-8">
          <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-sm font-medium text-zinc-300">No hay claves de API activas</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Crea tu primera API Key para comenzar a integrar BOWOL en tus flujos de trabajo programáticos.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/30">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-zinc-400 border-b border-white/[0.06] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nombre / Etiqueta</th>
                <th className="py-3 px-4">Prefijo de Clave</th>
                <th className="py-3 px-4">Último Uso</th>
                <th className="py-3 px-4">Expiración</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-zinc-200">
                    {k.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-orange-400/90">
                    {k.keyPrefix}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca'}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('es-ES') : 'Sin expiración'}
                  </td>
                  <td className="py-3.5 px-4">
                    {k.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Revocada
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {k.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(k.id)}
                        disabled={revokingId === k.id}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Revocar inmediatamente"
                      >
                        {revokingId === k.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline ml-1">Revocar</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Generar Clave */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-white/[0.1] shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Nueva API Key</h3>
                <p className="text-xs text-zinc-400">Genera credenciales de acceso programático</p>
              </div>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Nombre descriptivo / Sistema
                </label>
                <input
                  type="text"
                  placeholder="ej. GitHub Actions CI/CD o Slack Bot"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-zinc-200 text-xs focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Período de Expiración
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-zinc-200 text-xs focus:outline-none focus:border-orange-500/50"
                >
                  <option value="">Sin expiración (Permanente)</option>
                  <option value="30">30 días</option>
                  <option value="90">90 días</option>
                  <option value="180">180 días</option>
                  <option value="365">1 año (365 días)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !keyName.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Clave'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Single Reveal of Secret Key */}
      {createdKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-orange-500/40 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Guarda tu API Key Ahora</h3>
                <p className="text-xs text-zinc-400">Por motivos de seguridad, esta clave no se volverá a mostrar nunca más.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 leading-relaxed">
              Copia y almacena esta clave en un administrador seguro de secretos o variables de entorno. Si la pierdes, deberás revocarla y generar una nueva.
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                API Key Generada ({createdKey.name})
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black border border-white/[0.12]">
                <code className="text-xs font-mono text-orange-400 flex-1 break-all select-all">
                  {createdKey.rawApiKey}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey.rawApiKey)}
                  className="text-zinc-300 hover:text-white shrink-0"
                >
                  {hasCopied ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs">
                      <Check className="w-4 h-4" /> Copiado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs">
                      <Copy className="w-4 h-4" /> Copiar
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setCreatedKey(null)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Entendido, la he guardado
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
