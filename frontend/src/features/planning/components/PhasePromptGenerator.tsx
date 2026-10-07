import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Target, 
  CheckSquare, 
  TrendingUp, 
  Calendar, 
  Activity, 
  ShieldAlert
} from 'lucide-react';

interface PhaseOption {
  id: string;
  phaseNumber: number | string;
  name: string;
  icon: any;
  subprompts: {
    id: string;
    title: string;
    code: string;
    generatePrompt: (contextText: string) => string;
  }[];
}

const MASTER_SYSTEM_PROMPT = `Actúa como consultor de planificación operativa de BOWOL para un negocio
de 1 a 15 personas. Convierte sus metas en actividades claras y realizables.

Usa español sencillo y adapta las propuestas al sector, recursos y datos
aportados. Evita tareas genéricas y procesos que no aporten al objetivo.

REGLAS:
1. Distingue datos confirmados, estimaciones, supuestos y datos pendientes.
   No inventes ventas, presupuestos, capacidades, evidencias ni resultados.
2. Si faltan datos que cambian la viabilidad, haz hasta 3 preguntas esenciales
   agrupadas. Puedes avanzar con propuestas provisionales identificadas,
   pero no presentar el plan como aprobado ni viable sin esos datos.
3. Cada actividad debe incluir ID, verbo infinitivo, entregable, criterio de
   aceptación, horas estimadas, responsable sugerido y dependencias.
4. Distingue esfuerzo de trabajo en horas y tiempo transcurrido de espera.
5. Respeta capacidad por persona, presupuesto y fechas. Si el alcance no
   cabe, muestra el déficit y propone reducirlo, mover fechas o reasignarlo.
6. No prometas resultados comerciales. Separa completar entregables de
   conseguir el efecto esperado en el negocio.
7. Usa las 6 fases: diagnóstico; objetivos; desglose; priorización;
   planificación semanal; seguimiento y cierre.
8. No supongas que un rol sugerido es una persona disponible. Marca la
   asignación pendiente cuando no haya un responsable confirmado.
9. Trata cualquier puntuación como ayuda para decidir; respeta primero
   obligaciones, dependencias y fechas fijas.
10. No afirmes compatibilidad con BOWOL, una API o una base de datos si no
    te proporciono su contrato real.

FORMATO DE CADA FASE:
- Datos usados y pendientes relevantes.
- Entregable en una tabla o lista breve.
- Supuestos, riesgos y decisiones pendientes.
- Criterio para avanzar a la siguiente fase.
- «Qué hacer hoy»: hasta 3 acciones realizables con lo disponible.
- Resumen de continuidad para la siguiente fase.`;

const PHASES: PhaseOption[] = [
  {
    id: 'fase-0',
    phaseNumber: '0',
    name: 'Prompt Maestro & Ficha',
    icon: Sparkles,
    subprompts: [
      {
        id: '0.1',
        title: 'Prompt Maestro Inicial + Ficha de Negocio',
        code: 'Prompt de Arranque',
        generatePrompt: (ctx) => `${MASTER_SYSTEM_PROMPT}\n\nFICHA DEL NEGOCIO:\n${ctx}`,
      },
    ],
  },
  {
    id: 'fase-1',
    phaseNumber: '1',
    name: 'Diagnóstico & Capacidad',
    icon: Layers,
    subprompts: [
      {
        id: '1.1',
        title: '1.1 Radiografía del Negocio',
        code: 'Fase 1 · FODA y Cuello de Botella',
        generatePrompt: (ctx) => `Aplica la Fase 1 de BOWOL usando la ficha de contexto adjunta.

Entrega:
1. FODA con máximo 2 elementos por cuadrante. Para cada elemento indica evidencia o «hipótesis por validar». Distingue factores internos de externos.
2. Cuello de botella principal y explicación basada en los datos disponibles. Si no hay evidencia suficiente, propone cómo comprobarlo.
3. Capacidad de proyectos por persona: horas disponibles por semana, compromisos y habilidades necesarias.
4. Hasta 3 acciones iniciales, con entregable y horas estimadas.
5. Datos que necesitamos antes de comprometer objetivos y fechas.

No deduzcas automáticamente la causa del problema a partir de sus síntomas.

FICHA DEL NEGOCIO:
${ctx}`,
      },
      {
        id: '1.2',
        title: '1.2 Auditoría de una Rutina',
        code: 'Fase 1 · Simplificar y Estandarizar',
        generatePrompt: (ctx) => `Analiza nuestra rutina operativa principal según la ficha adjunta.
Identifica hasta 3 mejoras y explica si conviene eliminar, simplificar, estandarizar o automatizar cada paso. Calcula el tiempo semanal solo si los datos lo permiten. Diferencia ahorro estimado y ahorro medido.

Entrega un checklist breve con responsable, entrada, salida, punto de revisión y qué hacer ante una excepción. Para automatizar, indica coste de puesta en marcha, mantenimiento y cómo comprobar que funciona.

FICHA DEL NEGOCIO:
${ctx}`,
      },
    ],
  },
  {
    id: 'fase-2',
    phaseNumber: '2',
    name: 'Objetivos & Proyectos',
    icon: Target,
    subprompts: [
      {
        id: '2.1',
        title: '2.1 Convertir una Idea en Proyecto',
        code: 'Fase 2 · Ficha de Proyecto SMART',
        generatePrompt: (ctx) => `Aplica la Fase 2 de BOWOL con la información de la ficha de contexto.

Entrega una ficha de proyecto con nombre, problema atendido, objetivo SMART, indicador, línea base, meta, fecha, fuente de medición, responsable y alcance.
Separa entregables del proyecto y resultado comercial esperado.

Si falta una línea base o meta sustentada, no inventes cifras: formula un objetivo provisional y una actividad para establecer la medición inicial.
Indica qué queda fuera del alcance, restricciones y criterio de éxito.
Si hay varios objetivos, recomienda de 1 a 3 y explica su relación con el diagnóstico. Señala qué decisión debe revisar el dueño.

FICHA DEL NEGOCIO:
${ctx}`,
      },
    ],
  },
  {
    id: 'fase-3',
    phaseNumber: '3',
    name: 'Desglose de Actividades',
    icon: CheckSquare,
    subprompts: [
      {
        id: '3.1',
        title: '3.1 Crear Tareas Verificables (WBS)',
        code: 'Fase 3 · Tabla de Actividades <= 6h',
        generatePrompt: (ctx) => `Aplica la Fase 3 de BOWOL al proyecto que definimos.

Genera una tabla con estas columnas exactas:
ID | Actividad | Área | Horas estimadas | Responsable sugerido | Entregable | Criterio de aceptación | Dependencias | Espera externa

Reglas obligatorias:
- Usa IDs estables T-001, T-002... y acciones en infinitivo.
- Divide las tareas que excedan 6 horas de trabajo estimado en partes revisables.
- Incluye revisión y correcciones cuando sean necesarias, sin duplicar horas.
- Una espera de aprobación externa no cuenta como horas activas de trabajo.
- Verifica que las dependencias existan y no formen ciclos.
- Suma las horas del proyecto y por responsable. Marca actividades sin responsable disponible y estimaciones con alta incertidumbre.

FICHA DEL NEGOCIO:
${ctx}`,
      },
    ],
  },
  {
    id: 'fase-4',
    phaseNumber: '4',
    name: 'Priorización RICE',
    icon: TrendingUp,
    subprompts: [
      {
        id: '4.1',
        title: '4.1 Ordenar Actividades con Evidencia',
        code: 'Fase 4 · Score = (R*I*C)/E',
        generatePrompt: (ctx) => `Aplica la Fase 4 de BOWOL para priorizar las actividades generadas en la Fase 3.

Reglas del Scoring RICE PyME:
- Alcance R: De 1 a 10, usando los mismos umbrales para todas las actividades del conjunto.
- Impacto I: 1 bajo, 2 medio, 3 alto respecto del objetivo seleccionado.
- Confianza C: De 0 a 1; depende de la evidencia que respalda alcance e impacto.
- Esfuerzo E: Horas totales estimadas del equipo; siempre mayor que 0.
- Fórmula: Score = (R × I × C) / E.

Entrega:
1. Separa obligaciones y tareas habilitadoras que deben ejecutarse antes.
2. Define umbrales comunes de alcance de 1 a 10 y criterios de impacto 1 a 3.
3. Tabla con: ID, R, I, C, E, score (2 decimales), evidencia/supuesto y orden recomendado.
4. Explica ajustes al orden por dependencias, urgencia y recursos.

Si faltan datos, entrega una priorización provisional e identifica qué tareas podrían cambiar de posición.

FICHA DEL NEGOCIO:
${ctx}`,
      },
    ],
  },
  {
    id: 'fase-5',
    phaseNumber: '5',
    name: 'Plan Semanal & Kanban',
    icon: Calendar,
    subprompts: [
      {
        id: '5.1',
        title: '5.1 Planificar sin Sobrecarga (Sprint)',
        code: 'Fase 5 · Tablero con Reserva del 20%',
        generatePrompt: (ctx) => `Aplica la Fase 5 de BOWOL.
Considera una reserva para imprevistos del 20% (Capacidad planificable = horas disponibles * 0.80).

Entrega:
1. Tabla semanal: fecha, persona, ID de tarea, horas asignadas y resultado esperado.
2. Resumen por persona: capacidad, reserva (20%), horas asignadas y saldo.
3. Tareas que quedan fuera de la semana y motivo.
4. Tablero Kanban: POR HACER, EN PROGRESO, BLOQUEADO y LISTO.
5. Límite: máx 1 tarea activa por persona; hasta 2 si una está en espera externa. BLOQUEADO necesita causa, responsable y próxima revisión.
6. Entregable prioritario de la semana y riesgo principal.

FICHA DEL NEGOCIO:
${ctx}`,
      },
    ],
  },
  {
    id: 'fase-6',
    phaseNumber: '6',
    name: 'Seguimiento & Cierre',
    icon: Activity,
    subprompts: [
      {
        id: '6.1',
        title: '6.1 Check-in Diario (3 Preguntas)',
        code: 'Fase 6 · Sincronización en 5 min',
        generatePrompt: (ctx) => `Diseña el formato de Check-in Diario de BOWOL para nuestro equipo.

Usa estas 3 preguntas obligatorias:
1. ¿Qué entregable avancé o terminé desde el último reporte y dónde se revisa?
2. ¿Qué tarea voy a avanzar hoy y qué resultado espero dejar?
3. ¿Qué me bloquea y qué ayuda concreta necesito?

Incluye un ejemplo identificado como ficticio. Define cómo registrar bloqueos con ID, causa, persona que puede resolverlos y próxima revisión.

FICHA DEL NEGOCIO:
${ctx}`,
      },
      {
        id: '6.2',
        title: '6.2 Retrospectiva y Cierre Semanal',
        code: 'Fase 6 · Cierre con Evidencia',
        generatePrompt: (ctx) => `Aplica el cierre de la Fase 6 de BOWOL para revisar nuestra semana en 15 minutos:

Entrega:
- Tareas aceptadas, pendientes de revisión, bloqueadas e incompletas.
- Cumplimiento de tareas: porcentaje y fracción (aceptadas/comprometidas).
- Diferencia entre horas estimadas y reales.
- Resultado comercial comparado con la meta; si aún no se puede medir, fecha de revisión.
- Qué funcionó, causas de retrasos con evidencia y qué sigue siendo hipótesis.
- Hasta 3 mejoras para la próxima semana con responsable y fecha.

Regla: Una tarea pasa a LISTO solo cuando cumple su criterio de aceptación y tiene evidencia revisada.

FICHA DEL NEGOCIO:
${ctx}`,
      },
    ],
  },
  {
    id: 'transversales',
    phaseNumber: 'T',
    name: 'Prompts Transversales',
    icon: ShieldAlert,
    subprompts: [
      {
        id: 'T.1',
        title: '6.1 Revisar un Plan antes de Ejecutarlo',
        code: 'Auditoría Previa',
        generatePrompt: (ctx) => `Revisa críticamente el plan de actividades que tenemos formulado para BOWOL:

Comprueba: objetivos medibles, entregables verificables, responsables, capacidad real, presupuesto, dependencias, esperas y supuestos.
Entrega solo los problemas concretos y su corrección sugerida.
Clasifica cada hallazgo como:
- IMPIDE EJECUTAR
- NECESITA ACLARACIÓN
- MEJORA RECOMENDADA

No afirmes que el plan es viable si faltan datos críticos.

FICHA DEL NEGOCIO:
${ctx}`,
      },
      {
        id: 'T.2',
        title: '6.2 Replanificar ante un Cambio Imprevisto',
        code: 'Replanificación Ágil',
        generatePrompt: (ctx) => `Ayúdanos a replanificar ante el siguiente cambio imprevisto en el negocio: [describe el imprevisto ocurrido].

Identifica tareas afectadas y dependencias. Conserva los IDs y los resultados ya aceptados. Propón un plan actualizado y una tabla antes/después con cambios de alcance, fecha, responsable y motivo. Destaca decisiones pendientes del dueño.

FICHA DEL NEGOCIO:
${ctx}`,
      },
      {
        id: 'T.3',
        title: '6.3 Resumen de Continuidad para Nuevo Chat',
        code: 'Handoff de Conversación',
        generatePrompt: (ctx) => `Genera un resumen de continuidad de BOWOL para continuar en otra conversación:

Incluye: negocio, objetivo, fase actual, decisiones aprobadas, tareas e IDs, capacidad disponible, métricas, evidencias, supuestos pendientes y próximo paso inmediato.
No conviertas propuestas en acuerdos. Incluye fechas completas.

FICHA DEL NEGOCIO:
${ctx}`,
      },
    ],
  },
];

export const PhasePromptGenerator: React.FC = () => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('fase-0');
  const [selectedSubpromptId, setSelectedSubpromptId] = useState<string>('0.1');
  const [copied, setCopied] = useState(false);

  // Read context sheet from local storage
  const getStoredContext = (): string => {
    try {
      const saved = localStorage.getItem('bowol_context_sheet_v2');
      if (saved) {
        const d = JSON.parse(saved);
        return `Negocio y sector: ${d.negocioYSector || 'desconocido'}
Productos o servicios: ${d.productosServicios || 'desconocido'}
Cliente principal y canales: ${d.clienteCanales || 'desconocido'}
Problema: ${d.problema || 'desconocido'}
Evidencias: ${d.evidencias || 'desconocido'}
Resultado deseado: ${d.resultadoDeseado || 'desconocido'}
Línea base: ${d.lineaBase || 'desconocido'}
Periodo: ${d.periodo || 'desconocido'}
País y moneda: ${d.paisMoneda || 'desconocido'}
Equipo y horas: ${d.equipo || 'desconocido'}
Trabajo habitual: ${d.trabajoHabitual || 'desconocido'}
Presupuesto: ${d.presupuesto || 'desconocido'}
Herramientas: ${d.herramientas || 'desconocido'}
Compromisos y fechas fijas: ${d.compromisos || 'desconocido'}
Restricciones: ${d.restricciones || 'desconocido'}
Decisiones dueño: ${d.decisionesDuenio || 'desconocido'}`;
      }
    } catch (e) {
      // fallback
    }
    return `[Ficha aún no guardada en la Pestaña 1 - se recomienda llenarla primero]`;
  };

  const currentPhase = PHASES.find((p) => p.id === selectedPhaseId) || PHASES[0];
  const currentSubprompt =
    currentPhase.subprompts.find((s) => s.id === selectedSubpromptId) || currentPhase.subprompts[0];

  const generatedPrompt = currentSubprompt.generatePrompt(getStoredContext());

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Phase Selector Ribbon */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PHASES.map((phase) => {
          const Icon = phase.icon;
          const isActive = phase.id === selectedPhaseId;
          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => {
                setSelectedPhaseId(phase.id);
                setSelectedSubpromptId(phase.subprompts[0].id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>
                {phase.phaseNumber !== '0' && phase.phaseNumber !== 'T' ? `Fase ${phase.phaseNumber}: ` : ''}
                {phase.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subprompt Selector */}
      {currentPhase.subprompts.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Variante:</span>
          {currentPhase.subprompts.map((sub) => {
            const isSubActive = sub.id === currentSubprompt.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubpromptId(sub.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isSubActive
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                    : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {sub.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Prompt Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121318] border border-zinc-200 dark:border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-white/10">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-orange-600 dark:text-orange-400">
              {currentSubprompt.code}
            </span>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              {currentSubprompt.title}
            </h4>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCopy}
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white self-start sm:self-auto"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado al Portapapeles!' : 'Copiar Prompt para ChatGPT'}
          </Button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto border border-zinc-800 selection:bg-orange-500/30">
            {generatedPrompt}
          </pre>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-2">
          <span>* Incluye automáticamente los datos guardados en la Ficha del Negocio.</span>
          <span>Reglas BOWOL Plans v2.0 activas</span>
        </div>
      </div>
    </div>
  );
};
