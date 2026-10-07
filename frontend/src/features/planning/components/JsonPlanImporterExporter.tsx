import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { planningService } from '../services/planningService';
import { projectService } from '@/features/projects/services/projectService';
import { BowolPlanGuide, PlanningValidationResult } from '../types';
import { Button } from '@/components/ui/Button';
import { 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

const SAMPLE_JSON_GUIDE_2_0: BowolPlanGuide = {
  schemaVersion: 'bowol-planning-guide-2.0',
  project: {
    name: 'Campaña de Liquidación y Ventas por WhatsApp',
    objective: 'Liquidar el 70% del inventario estancado de calzado y estandarizar pedidos en WhatsApp',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  assumptions: [
    'Equipo de 2 personas con 18 horas semanales combinadas para el proyecto',
    'Presupuesto de $2,500 MXN para pauta local',
  ],
  tasks: [
    {
      id: 'T-001',
      title: 'Auditar y clasificar pares en liquidación',
      description: 'Separar los 140 pares por talla y estado para fotos y listado final',
      area: 'Operaciones',
      status: 'TODO',
      estimatedHours: 3,
      assignedRole: 'Responsable de Tienda / Ana',
      deliverable: 'Planilla con 140 pares clasificados con precio de oferta asignado',
      acceptanceCriteria: [
        'Cada producto incluido tiene cantidad disponible, talla y precio antes/ahora',
      ],
      dependsOn: [],
      prioritization: {
        reach: 10,
        impact: 3,
        confidence: 0.95,
        effortHours: 3,
        score: 9.50,
      },
    },
    {
      id: 'T-002',
      title: 'Diseñar catálogo digital en PDF y 5 artes para historias',
      description: 'Elaborar piezas visuales con Canva con fondo limpio y precios destacados',
      area: 'Marketing',
      status: 'TODO',
      estimatedHours: 4,
      assignedRole: 'Atención / Carlos',
      deliverable: 'PDF de 6 páginas y 5 artes en resolución 1080x1920',
      acceptanceCriteria: [
        'Los precios coinciden con la lista aprobada por la dueña',
        'Incluye link directo a WhatsApp para pedir',
      ],
      dependsOn: ['T-001'],
      prioritization: {
        reach: 8,
        impact: 3,
        confidence: 0.85,
        effortHours: 4,
        score: 5.10,
      },
    },
    {
      id: 'T-003',
      title: 'Configurar respuestas rápidas y mensaje de bienvenida en WhatsApp',
      description: 'Cargar atajos de teclado para tallas, medios de pago y políticas de envío',
      area: 'Ventas',
      status: 'TODO',
      estimatedHours: 2,
      assignedRole: 'Atención / Carlos',
      deliverable: '4 respuestas rápidas activadas en WhatsApp Business',
      acceptanceCriteria: [
        'Prueba enviada y verificada entre el equipo sin errores ortográficos',
      ],
      dependsOn: ['T-002'],
      prioritization: {
        reach: 9,
        impact: 3,
        confidence: 0.90,
        effortHours: 2,
        score: 12.15,
      },
    },
    {
      id: 'T-004',
      title: 'Despachar pedidos confirmados y registrar cobros',
      description: 'Empacar productos vendidos el mismo día y actualizar la planilla de stock',
      area: 'Operaciones',
      status: 'TODO',
      estimatedHours: 3,
      assignedRole: 'Operaciones / Ana',
      deliverable: 'Guías de entrega generadas y dinero ingresado en caja',
      acceptanceCriteria: [
        'Ningún pedido confirmado tarda más de 24h en salir a despacho',
      ],
      dependsOn: ['T-003'],
      prioritization: {
        reach: 7,
        impact: 3,
        confidence: 0.90,
        effortHours: 3,
        score: 6.30,
      },
    },
  ],
};

export const JsonPlanImporterExporter: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(SAMPLE_JSON_GUIDE_2_0, null, 2)
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<PlanningValidationResult | null>(null);
  const [importSuccess, setImportSuccess] = useState<any | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);

  // For Exporting: list user's projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
  });
  const projects = projectsData?.items || [];
  const [exportProjectId, setExportProjectId] = useState<string>('');

  // Validate Mutation
  const validateMutation = useMutation({
    mutationFn: (payload: BowolPlanGuide) => planningService.validatePlan(payload),
    onSuccess: (data) => {
      setValidationResult(data);
    },
    onError: (err: any) => {
      setParseError(err?.response?.data?.message || err?.message || 'Error al validar plan');
    },
  });

  // Import Mutation
  const importMutation = useMutation({
    mutationFn: (payload: BowolPlanGuide) => planningService.importPlan(payload),
    onSuccess: (data) => {
      setImportSuccess(data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err: any) => {
      setParseError(err?.response?.data?.message || err?.message || 'Error al importar plan');
    },
  });

  // Export Mutation
  const exportMutation = useMutation({
    mutationFn: (projectId: string) => planningService.exportPlan(projectId),
    onSuccess: (data) => {
      setJsonText(JSON.stringify(data, null, 2));
      setValidationResult(null);
      setImportSuccess(null);
    },
    onError: (err: any) => {
      setParseError(err?.response?.data?.message || err?.message || 'Error al exportar plan');
    },
  });

  const handleValidate = () => {
    setParseError(null);
    setValidationResult(null);
    setImportSuccess(null);
    try {
      const parsed: BowolPlanGuide = JSON.parse(jsonText);
      validateMutation.mutate(parsed);
    } catch (e: any) {
      setParseError(`JSON inválido: ${e.message}`);
    }
  };

  const handleImport = () => {
    setParseError(null);
    try {
      const parsed: BowolPlanGuide = JSON.parse(jsonText);
      importMutation.mutate(parsed);
    } catch (e: any) {
      setParseError(`JSON inválido: ${e.message}`);
    }
  };

  const handleExport = () => {
    if (!exportProjectId) return;
    exportMutation.mutate(exportProjectId);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleLoadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_JSON_GUIDE_2_0, null, 2));
    setParseError(null);
    setValidationResult(null);
    setImportSuccess(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Importador & Exportador JSON
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              Esquema bowol-planning-guide-2.0
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Pega aquí el JSON generado por ChatGPT/Claude para cargarlo directamente en tu Tablero Kanban y Proyectos, o exporta tus proyectos a JSON para compartirlos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleLoadSample} className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Cargar Ejemplo
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyJson} className="gap-1.5 text-xs">
            {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedExport ? 'Copiado' : 'Copiar JSON'}
          </Button>
        </div>
      </div>

      {/* Export Bar */}
      {projects.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#121318] border border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">
              Exportar un Proyecto Existente a JSON:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={exportProjectId}
              onChange={(e) => setExportProjectId(e.target.value)}
              className="h-9 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none"
            >
              <option value="">Selecciona un proyecto...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!exportProjectId || exportMutation.isPending}
              className="text-xs"
            >
              {exportMutation.isPending ? 'Exportando...' : 'Cargar en Editor'}
            </Button>
          </div>
        </div>
      )}

      {/* Parse Error Box */}
      {parseError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3 text-xs font-mono">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Validation Result Box */}
      {validationResult && (
        <div className={`p-4 rounded-2xl border space-y-3 ${
          validationResult.valid 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              {validationResult.valid ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
              <span>{validationResult.valid ? 'Plan Válido para Importar' : 'El Plan Contiene Errores Bloqueantes'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span>{validationResult.totalTasks} tareas</span>
              <span>•</span>
              <span>{validationResult.totalEstimatedHours}h estimadas totales</span>
            </div>
          </div>

          {(validationResult.blockingIssues || []).length > 0 && (
            <div className="space-y-1 text-xs text-red-600 dark:text-red-400 font-mono">
              <span className="font-bold">Problemas que impiden ejecutar:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {(validationResult.blockingIssues || []).map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {(validationResult.warnings || []).length > 0 && (
            <div className="space-y-1 text-xs text-amber-700 dark:text-amber-400 font-mono">
              <span className="font-bold">Advertencias según reglas BOWOL Plans:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {(validationResult.warnings || []).map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Import Success Box */}
      {importSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-800 dark:text-emerald-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>¡Proyecto y Tareas creados exitosamente en BOWOL!</span>
            </div>
            <p className="text-xs">
              Proyecto: <strong>{importSuccess.projectName}</strong> • {importSuccess.importedTasksCount} tareas importadas con {importSuccess.totalEstimatedHours} horas de trabajo.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/tasks?projectId=${importSuccess.projectId}`)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs shrink-0"
          >
            <span>Ver en Tablero Kanban</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* JSON Editor Box */}
      <div className="space-y-3">
        <textarea
          rows={16}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full p-4 rounded-2xl bg-zinc-950 text-emerald-400 dark:text-emerald-300 font-mono text-xs border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 selection:bg-orange-500/40 leading-relaxed shadow-inner"
        />

        <div className="flex items-center justify-between gap-3 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={validateMutation.isPending}
            className="gap-2 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            {validateMutation.isPending ? 'Validando...' : '1. Validar Reglas del Plan'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleImport}
            disabled={importMutation.isPending || (validationResult !== null && !validationResult.valid)}
            className="gap-2 text-xs bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
          >
            <Upload className="w-3.5 h-3.5" />
            {importMutation.isPending ? 'Importando a la BD...' : '2. Importar al Tablero Kanban de BOWOL'}
          </Button>
        </div>
      </div>
    </div>
  );
};
