import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Globe,
  KeyRound,
  Info
} from 'lucide-react';
import { ssoService, SsoConfig, SsoProvider, SaveSsoConfigDTO } from '../services/ssoService';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface SsoManagementProps {
  organizationId: string;
}

export const SsoManagement: React.FC<SsoManagementProps> = ({ organizationId }) => {
  const [configs, setConfigs] = useState<SsoConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provider, setProvider] = useState<SsoProvider>('GOOGLE');
  const [displayName, setDisplayName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [domainRestriction, setDomainRestriction] = useState('');
  const [enforceSso, setEnforceSso] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadConfigs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ssoService.getConfigs(organizationId);
      setConfigs(data);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'detail' in err 
        ? String(err.detail) 
        : 'No se pudieron cargar las configuraciones SSO';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, [organizationId]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: SaveSsoConfigDTO = {
        provider,
        displayName: displayName.trim() || undefined,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim() || undefined,
        domainRestriction: domainRestriction.trim() || undefined,
        enforceSso,
        isEnabled: true,
      };
      await ssoService.saveConfig(organizationId, payload);
      setIsModalOpen(false);
      resetForm();
      await loadConfigs();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'detail' in err 
        ? String(err.detail) 
        : 'Error al guardar la configuración SSO';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (configId: string) => {
    if (!window.confirm('¿Está seguro de revocar y eliminar este proveedor SSO?')) return;
    try {
      await ssoService.deleteConfig(organizationId, configId);
      await loadConfigs();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'detail' in err 
        ? String(err.detail) 
        : 'Error al eliminar configuración';
      setError(msg);
    }
  };

  const resetForm = () => {
    setProvider('GOOGLE');
    setDisplayName('');
    setClientId('');
    setClientSecret('');
    setDomainRestriction('');
    setEnforceSso(false);
  };

  const redirectUri = `${window.location.origin}/login/sso/callback`;

  const copyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-orange-500" strokeWidth={1.5} />
              <h3 className="text-lg font-bold text-white font-display">
                Single Sign-On (SSO) Corporativo
              </h3>
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Permite a los miembros de tu organización autenticarse de forma centralizada mediante Google Workspace, Microsoft Azure AD, Okta o SAML 2.0.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={Plus}
            className="self-start sm:self-auto font-medium"
          >
            Configurar Proveedor SSO
          </Button>
        </div>

        {/* Redirect URI hint */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/40 -mx-6 -mb-6 p-4 rounded-b-xl">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Globe className="h-4 w-4 text-zinc-500" />
            <span>Redirect URI (ACS URL):</span>
            <code className="text-zinc-200 bg-zinc-800/80 px-2 py-0.5 rounded text-[11px]">
              {redirectUri}
            </code>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyRedirectUri}
            leftIcon={hasCopied ? Check : Copy}
            className="text-xs h-7 self-start sm:self-auto font-mono"
          >
            {hasCopied ? 'Copiado' : 'Copiar URL'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Error en SSO" detail={error} />
      )}

      {/* Configured SSO Providers List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-zinc-200">Proveedores de Identidad Conectados</h4>
          <span className="text-xs text-zinc-500 font-mono">{configs.length} activo(s)</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="text-xs">Cargando configuraciones SSO...</span>
          </div>
        ) : configs.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <KeyRound className="h-10 w-10 text-zinc-600 mx-auto" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-300">No hay proveedores SSO configurados</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Conecta Google Workspace, Microsoft Entra ID o tu proveedor SAML para habilitar inicio de sesión unificado.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={Plus}
              className="mt-2"
            >
              Añadir primer proveedor
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {configs.map((cfg) => (
              <div key={cfg.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white">{cfg.displayName}</span>
                    <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
                      {cfg.provider}
                    </span>
                    {cfg.enforceSso && (
                      <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                        Obligatorio
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono">
                    <div>
                      <span className="text-zinc-500">Client ID:</span>{' '}
                      <span className="text-zinc-300">{cfg.clientId.slice(0, 18)}...</span>
                    </div>
                    {cfg.domainRestriction && (
                      <div>
                        <span className="text-zinc-500">Dominio:</span>{' '}
                        <span className="text-orange-400">@{cfg.domainRestriction}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {cfg.authorizationUrl && (
                    <a
                      href={cfg.authorizationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Probar URL de autorización"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cfg.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                    title="Eliminar proveedor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Configuración SSO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                <h3 className="text-base font-bold text-white">Configurar Proveedor de Identidad</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Tipo de Proveedor</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as SsoProvider)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="GOOGLE">Google Workspace (OAuth 2.0 / OIDC)</option>
                  <option value="AZURE_AD">Microsoft Entra ID / Azure AD</option>
                  <option value="OIDC">OpenID Connect Estándar (Okta / Auth0 / Keycloak)</option>
                  <option value="SAML2">SAML 2.0 Corporativo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Nombre de Visualización</label>
                <input
                  type="text"
                  placeholder="ej. Google Workspace Acme Corp"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Client ID / Entity ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. 123456789-abc.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Client Secret (Opcional si es PKCE)</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Restricción de Dominio (Recomendado)</label>
                <input
                  type="text"
                  placeholder="ej. miempresa.com"
                  value={domainRestriction}
                  onChange={(e) => setDomainRestriction(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
                <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                  <Info className="h-3 w-3 inline" />
                  Solo usuarios con correos terminados en este dominio podrán autenticarse con este SSO.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="enforceSso"
                  checked={enforceSso}
                  onChange={(e) => setEnforceSso(e.target.checked)}
                  className="rounded border-zinc-800 text-orange-500 focus:ring-orange-500 bg-zinc-950"
                />
                <label htmlFor="enforceSso" className="text-xs text-zinc-300 cursor-pointer">
                  Exigir SSO obligatorio para todos los miembros con este dominio
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  Guardar Configuración
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
