import React from 'react';
import { Receipt, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BillingInvoice } from '../types';

interface InvoicesTableProps {
  invoices: BillingInvoice[];
  isLoading?: boolean;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, isLoading = false }) => {
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: BillingInvoice['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Pagada
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendiente
          </Badge>
        );
      case 'VOID':
      case 'UNCOLLECTIBLE':
        return (
          <Badge variant="error" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Fallida
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <Card className="border border-zinc-800 bg-zinc-900/60 p-0 overflow-hidden">
      <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
          <h4 className="text-base font-semibold text-white">Historial de Facturación</h4>
        </div>
        <span className="text-xs text-zinc-400">
          {invoices.length} {invoices.length === 1 ? 'factura registrada' : 'facturas registradas'}
        </span>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm text-zinc-400">
          Cargando facturas...
        </div>
      ) : invoices.length === 0 ? (
        <div className="p-12 text-center text-sm text-zinc-500 flex flex-col items-center gap-2">
          <FileText className="w-8 h-8 text-zinc-600" strokeWidth={1.5} />
          <span>No tienes facturas emitidas todavía.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider font-medium">
              <tr>
                <th className="py-3 px-5">Factura</th>
                <th className="py-3 px-5">Fecha</th>
                <th className="py-3 px-5">Concepto</th>
                <th className="py-3 px-5">Método</th>
                <th className="py-3 px-5">Monto</th>
                <th className="py-3 px-5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-zinc-300 font-medium">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-5 text-zinc-400">
                    {formatDate(inv.createdAt)}
                  </td>
                  <td className="py-3.5 px-5 text-zinc-200">
                    {inv.billingReason || 'Suscripción SaaS'}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {inv.paymentGateway}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-white">
                    ${inv.amount.toFixed(2)} {inv.currency}
                  </td>
                  <td className="py-3.5 px-5">
                    {getStatusBadge(inv.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
