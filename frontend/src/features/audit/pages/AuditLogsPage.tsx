import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  User, 
  Globe, 
  Activity, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  Layers, 
  Key, 
  Webhook, 
  CreditCard, 
  Eye, 
  Copy, 
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { auditService } from '../services/auditService';
import { AuditLog, AuditSummary } from '../types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [hasCopiedJson, setHasCopiedJson] = useState(false);

  // Export loading state
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);

  const fetchLogs = async (currentPage = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const [logsRes, summaryRes] = await Promise.all([
        auditService.getLogs({
          actorEmail: searchTerm.trim() || undefined,
          action: actionFilter || undefined,
          page: currentPage,
          size: 20,
        }),
        auditService.getSummary(),
      ]);

      setLogs(logsRes.content);
      setTotalPages(logsRes.totalPages || 1);
      setTotalElements(logsRes.totalElements || 0);
      setSummary(summaryRes);
      setPage(currentPage);
    } catch (err: any) {
      setError(err?.detail || 'Error al recuperar registros de auditoría');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, [actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(0);
  };

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const blob = await auditService.exportCsv({
        actorEmail: searchTerm.trim() || undefined,
        action: actionFilter || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bowol-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError('Error al generar archivo CSV de auditoría');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportJson = async () => {
    setIsExportingJson(true);
    try {
      const data = await auditService.exportJson({
        actorEmail: searchTerm.trim() || undefined,
        action: actionFilter || undefined,
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bowol-audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError('Error al generar archivo JSON de auditoría');
    } finally {
      setIsExportingJson(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('INVITE') || action.includes('UPGRADE')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (action.includes('DELETE') || action.includes('REVOKE') || action.includes('REMOVE') || action.includes('CANCEL')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (action.includes('CHANGE') || action.includes('UPDATE')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('API_KEY')) return <Key className="w-3.5 h-3.5" />;
    if (action.includes('WEBHOOK')) return <Webhook className="w-3.5 h-3.5" />;
    if (action.includes('SUBSCRIPTION') || action.includes('BILLING')) return <CreditCard className="w-3.5 h-3.5" />;
    if (action.includes('MEMBER') || action.includes('ROLE')) return <User className="w-3.5 h-3.5" />;
    return <Layers className="w-3.5 h-3.5" />;
  };

  const copyDetailsJson = (json: string) => {
    navigator.clipboard.writeText(json);
    setHasCopiedJson(true);
    setTimeout(() => setHasCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Registro Inmutable de Auditoría
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
              <Shield className="w-3.5 h-3.5" />
              SOC 2 / ISO 27001 Ready
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Trazabilidad criptográfica de grado institucional de todas las operaciones sensibles en tu organización
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="glass"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            leftIcon={Download}
            className="text-xs"
          >
            {isExportingCsv ? 'Exportando CSV...' : 'Exportar CSV'}
          </Button>

          <Button
            variant="glass"
            size="sm"
            onClick={handleExportJson}
            disabled={isExportingJson}
            leftIcon={FileText}
            className="text-xs"
          >
            {isExportingJson ? 'Exportando JSON...' : 'Exportar JSON'}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchLogs(page)}
            disabled={isLoading}
            title="Refrescar"
          >
            <RefreshCw className={`w-4 h-4 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" detail={error} />}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Eventos Totales</span>
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            {summary?.totalEvents ?? totalElements}
          </div>
          <div className="text-[11px] text-zinc-500">
            Registrados en el ledger inmutable
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Actividad Últimas 24h</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            {summary?.eventsLast24Hours ?? 0}
          </div>
          <div className="text-[11px] text-zinc-500">
            Operaciones críticas procesadas hoy
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Retención de Logs</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            365 Días
          </div>
          <div className="text-[11px] text-zinc-500">
            Conforme a políticas de compliance
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Integridad & RLS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            100% Blindado
          </div>
          <div className="text-[11px] text-zinc-500">
            Row Level Security activo a nivel DB
          </div>
        </div>
      </div>

      {/* Filter Toolbar & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-white/[0.08]">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por correo de actor o identificador de recurso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/40"
          />
        </form>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900">Todos los eventos</option>
              <option value="PROJECT_CREATE" className="bg-zinc-900">Creación de Proyecto</option>
              <option value="MEMBER_INVITE" className="bg-zinc-900">Invitación de Miembro</option>
              <option value="ROLE_CHANGE" className="bg-zinc-900">Cambio de Rol</option>
              <option value="MEMBER_REMOVE" className="bg-zinc-900">Eliminación de Miembro</option>
              <option value="SUBSCRIPTION_UPGRADE" className="bg-zinc-900">Upgrade de Plan</option>
              <option value="API_KEY_CREATE" className="bg-zinc-900">Creación de API Key</option>
              <option value="API_KEY_REVOKE" className="bg-zinc-900">Revocación de API Key</option>
              <option value="WEBHOOK_CREATE" className="bg-zinc-900">Creación de Webhook</option>
            </select>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.06]">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                viewMode === 'table' ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                viewMode === 'timeline' ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/[0.08] p-8">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-sm font-medium text-zinc-300">No se encontraron eventos de auditoría</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Ajusta los filtros o realiza acciones en la plataforma para generar registros automáticos.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/30">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-zinc-400 border-b border-white/[0.06] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Tipo de Evento</th>
                <th className="py-3 px-4">Recurso / Entidad</th>
                <th className="py-3 px-4">Dirección IP</th>
                <th className="py-3 px-4 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-zinc-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('es-ES', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-zinc-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold">
                        {log.actorEmail ? log.actorEmail.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <span className="truncate max-w-[180px]">
                        {log.actorEmail || 'Sistema Automático'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getActionBadgeColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-400">
                    <span className="text-zinc-300 font-semibold">{log.entityType}</span>
                    {log.entityId && (
                      <span className="text-zinc-500 ml-1.5 text-[11px]">
                        #{log.entityId.substring(0, 8)}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-zinc-500" />
                      <span>{log.ipAddress || '127.0.0.1'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="ml-1 text-xs">Ver</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Timeline View */
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/[0.08]">
          {logs.map((log) => (
            <div key={log.id} className="relative group">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-zinc-900 border-2 border-orange-500 flex items-center justify-center text-orange-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getActionBadgeColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      en {log.entityType} {log.entityId ? `#${log.entityId.substring(0, 8)}` : ''}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {new Date(log.createdAt).toLocaleString('es-ES')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-4">
                    <span>Actor: <strong className="text-zinc-200">{log.actorEmail || 'System'}</strong></span>
                    <span>IP: <code className="font-mono text-zinc-300">{log.ipAddress || '127.0.0.1'}</code></span>
                  </div>
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="text-orange-400 hover:text-orange-300 text-xs font-medium flex items-center gap-1"
                  >
                    Detalles <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-500">
            Página {page + 1} de {totalPages} ({totalElements} eventos totales)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchLogs(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Siguiente <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Detalle de Evento de Auditoría */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-white/[0.1] shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Registro de Auditoría #{selectedLog.id}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selectedLog.action} &bull; {new Date(selectedLog.createdAt).toISOString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Cerrar
              </Button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <span className="text-zinc-500 block">Actor:</span>
                  <span className="font-semibold text-zinc-200">{selectedLog.actorEmail || 'Sistema'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Dirección IP:</span>
                  <span className="font-mono text-zinc-200">{selectedLog.ipAddress || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Tipo de Recurso:</span>
                  <span className="font-semibold text-zinc-200">{selectedLog.entityType}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">ID del Recurso:</span>
                  <span className="font-mono text-zinc-200">{selectedLog.entityId || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-zinc-500 block">User-Agent:</span>
                  <span className="font-mono text-zinc-400 break-all">{selectedLog.userAgent || 'Direct API'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Carga de Datos (JSON Payload):</span>
                  <button
                    onClick={() => copyDetailsJson(selectedLog.detailsJson)}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                  >
                    {hasCopiedJson ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copiado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Copiar JSON
                      </span>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-black border border-white/[0.08] font-mono text-[11px] text-orange-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedLog.detailsJson), null, 2);
                    } catch {
                      return selectedLog.detailsJson;
                    }
                  })()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
