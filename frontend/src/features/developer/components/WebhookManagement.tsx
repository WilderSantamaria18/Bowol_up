import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Key, 
  Copy, 
  Check, 
  Radio
} from 'lucide-react';
import { developerService } from '../services/developerService';
import { WebhookEndpoint, WebhookDelivery, AVAILABLE_WEBHOOK_EVENTS } from '../types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export const WebhookManagement: React.FC = () => {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'trend.high_relevance_detected',
    'opportunity.rice_calculated',
  ]);
  const [customSecret, setCustomSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test Ping state
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [lastPingResult, setLastPingResult] = useState<WebhookDelivery | null>(null);

  // Deliveries Drawer state
  const [deliveriesEndpoint, setDeliveriesEndpoint] = useState<WebhookEndpoint | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);

  // Copy secret state
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);

  const loadEndpoints = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await developerService.listWebhooks();
      setEndpoints(data);
    } catch (err: any) {
      setError(err?.detail || 'No se pudieron cargar los webhooks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEndpoints();
  }, []);

  const handleToggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || selectedEvents.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await developerService.createWebhook({
        url: url.trim(),
        description: description.trim() || undefined,
        events: selectedEvents,
        secret: customSecret.trim() || undefined,
      });
      setIsCreateOpen(false);
      setUrl('');
      setDescription('');
      setCustomSecret('');
      await loadEndpoints();
    } catch (err: any) {
      setError(err?.detail || 'Error al registrar el webhook');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('¿Eliminar este webhook saliente? Dejarás de recibir notificaciones de eventos en esta URL.')) {
      return;
    }

    try {
      await developerService.deleteWebhook(id);
      await loadEndpoints();
    } catch (err: any) {
      setError(err?.detail || 'No se pudo eliminar el webhook');
    }
  };

  const handleTestPing = async (endpoint: WebhookEndpoint) => {
    setPingingId(endpoint.id);
    setLastPingResult(null);
    try {
      const delivery = await developerService.testWebhookPing(endpoint.id);
      setLastPingResult(delivery);
    } catch (err: any) {
      setError(err?.detail || 'Error al ejecutar el ping de prueba');
    } finally {
      setPingingId(null);
    }
  };

  const openDeliveriesModal = async (endpoint: WebhookEndpoint) => {
    setDeliveriesEndpoint(endpoint);
    setIsLoadingDeliveries(true);
    try {
      const res = await developerService.getWebhookDeliveries(endpoint.id, 0, 20);
      setDeliveries(res.content);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const copySecret = (id: string, secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecretId(id);
    setTimeout(() => setCopiedSecretId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-zinc-900/40 to-white/[0.02] border border-blue-500/20 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Webhook className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              Webhooks Salientes (Outbound Webhooks)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Recibe eventos en tiempo real firmados con <code className="text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded">HMAC-SHA256</code> en tu servidor cuando ocurran tendencias críticas, cálculos de RICE o cierres de sprint.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          leftIcon={Plus}
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-lg shadow-blue-500/20"
        >
          Agregar Webhook
        </Button>
      </div>

      {error && <Alert variant="error" detail={error} />}

      {/* Ping Result Banner */}
      {lastPingResult && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 animate-fade-in ${
          lastPingResult.success 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            {lastPingResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
            <div className="text-xs">
              <span className="font-semibold">
                {lastPingResult.success ? 'Ping exitoso:' : 'Ping fallido:'}
              </span> HTTP {lastPingResult.statusCode || 'N/A'} — {lastPingResult.success ? 'Servidor respondió satisfactoriamente' : (lastPingResult.errorMessage || 'Sin respuesta')}
            </div>
          </div>
          <button onClick={() => setLastPingResult(null)} className="text-xs opacity-70 hover:opacity-100">
            Descartar
          </button>
        </div>
      )}

      {/* Endpoints List */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : endpoints.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-white/[0.08] p-8">
          <Radio className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-sm font-medium text-zinc-300">No hay endpoints de Webhook configurados</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Configura una URL destino para sincronizar eventos en tiempo real con Slack, Zapier, Make o tus microservicios internos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {endpoints.map((ep) => (
            <div
              key={ep.id}
              className="p-5 rounded-2xl bg-zinc-900/40 border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-zinc-100">
                      {ep.url}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Activo
                    </span>
                  </div>
                  {ep.description && (
                    <p className="text-xs text-zinc-400">{ep.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestPing(ep)}
                    disabled={pingingId === ep.id}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    {pingingId === ep.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span className="ml-1 text-xs">Test Ping</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeliveriesModal(ep)}
                    className="text-zinc-300 hover:text-white"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="ml-1 text-xs">Entregas</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWebhook(ep.id)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Subscribed Events Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-500 mr-1">Eventos:</span>
                {ep.events.map((evt) => (
                  <span
                    key={evt}
                    className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.04] border border-white/[0.08] text-zinc-300"
                  >
                    {evt}
                  </span>
                ))}
              </div>

              {/* Secret Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px] truncate">
                  <Key className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-zinc-500">HMAC Secret:</span>
                  <span className="truncate">
                    {ep.secret.substring(0, 10)}••••••••••••••••
                  </span>
                </div>
                <button
                  onClick={() => copySecret(ep.id, ep.secret)}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors ml-2 shrink-0"
                >
                  {copiedSecretId === ep.id ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Copiado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" /> Copiar Secreto
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Crear Webhook */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-white/[0.1] shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Registrar Webhook Saliente</h3>
                <p className="text-xs text-zinc-400">Transmisión de eventos en tiempo real hacia tus sistemas</p>
              </div>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  URL del Endpoint (HTTPS recomendado)
                </label>
                <input
                  type="url"
                  placeholder="https://tu-servidor.com/api/webhooks/bowol"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-zinc-200 text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. Pipeline de alertas en Slack o sincronización con CRM"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-zinc-200 text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Eventos Suscritos ({selectedEvents.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_WEBHOOK_EVENTS.map((evt) => {
                    const isChecked = selectedEvents.includes(evt.id);
                    return (
                      <label
                        key={evt.id}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEvent(evt.id)}
                          className="mt-0.5 rounded border-zinc-700 text-blue-500 focus:ring-0"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-medium text-zinc-200 block">
                            {evt.label}
                          </span>
                          <span className="text-[11px] text-zinc-400 block">
                            {evt.description}
                          </span>
                          <code className="text-[10px] text-blue-300 font-mono">
                            {evt.id}
                          </code>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  HMAC Secret Personalizado (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Dejar en blanco para auto-generar 'whsec_...'"
                  value={customSecret}
                  onChange={(e) => setCustomSecret(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-zinc-200 text-xs focus:outline-none focus:border-blue-500/50"
                />
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
                  disabled={isSubmitting || !url.trim() || selectedEvents.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Webhook'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Historial de Entregas */}
      {deliveriesEndpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-950 border border-white/[0.1] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  Historial de Entregas
                </h3>
                <p className="text-xs text-zinc-400 font-mono truncate max-w-md">
                  {deliveriesEndpoint.url}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeliveriesEndpoint(null)}
              >
                Cerrar
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoadingDeliveries ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : deliveries.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No hay intentos de entrega registrados aún para este endpoint.
                </div>
              ) : (
                deliveries.map((del) => (
                  <div
                    key={del.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {del.success ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            HTTP {del.statusCode || 200}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                            HTTP {del.statusCode || 'ERR'}
                          </span>
                        )}
                        <span className="font-mono text-zinc-300 font-semibold">
                          {del.eventType}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          ({del.attempts} {del.attempts === 1 ? 'intento' : 'intentos'})
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {new Date(del.createdAt).toLocaleString('es-ES')}
                      </span>
                    </div>

                    {del.errorMessage && (
                      <div className="text-rose-400 text-[11px]">
                        Error: {del.errorMessage}
                      </div>
                    )}

                    {del.responseBody && (
                      <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-zinc-400 truncate">
                        Resp: {del.responseBody}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
