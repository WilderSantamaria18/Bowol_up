import React, { useState } from 'react';
import { ContextSheetData } from '../types';
import { Button } from '@/components/ui/Button';
import { Copy, Check, Save, RotateCcw, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'bowol_context_sheet_v2';

const SAMPLE_DATA: ContextSheetData = {
  negocioYSector: 'Tienda de Calzado y Accesorios Urbanos (Comercio Minorista)',
  productosServicios: 'Calzado deportivo, urbano y accesorios de cuero sintético',
  clienteCanales: 'Jóvenes y adultos jóvenes (20-35 años). Canales: Tienda física y WhatsApp Business',
  problema: 'Se acumula stock de temporada anterior y se pierde tiempo respondiendo precios manualmente en WhatsApp',
  evidencias: 'Inventario con 140 pares sin rotación en los últimos 45 días; demoras de hasta 4 horas en responder chats',
  resultadoDeseado: 'Liquidar el 70% del inventario estancado y estandarizar respuestas en WhatsApp con catálogo digital',
  lineaBase: '140 pares estancados; ventas de liquidación actuales: 5 pares/semana (a fecha actual)',
  periodo: 'Del 15 al 30 de este mes (2 semanas)',
  paisMoneda: 'México, MXN (Pesos Mexicanos), Zona horaria GMT-6',
  equipo: 'Ana (Dueña / Ventas, 10h semanales para proyecto), Carlos (Atención / Redes, 8h semanales para proyecto)',
  trabajoHabitual: 'Atención presencial en mostrador (6 horas al día), limpieza y arqueo de caja diario',
  presupuesto: '$2,500 MXN para pauta local en redes sociales',
  herramientas: 'WhatsApp Business, Instagram, Libreta de caja y Excel básico',
  compromisos: 'Feria comercial local el próximo sábado (fecha inamovible)',
  restricciones: 'No hacer descuentos superiores al 35% para proteger margen de costo',
  decisionesDuenio: 'Aprobación final de los precios de liquidación y de las piezas gráficas',
};

const EMPTY_DATA: ContextSheetData = {
  negocioYSector: '',
  productosServicios: '',
  clienteCanales: '',
  problema: '',
  evidencias: '',
  resultadoDeseado: '',
  lineaBase: '',
  periodo: '',
  paisMoneda: '',
  equipo: '',
  trabajoHabitual: '',
  presupuesto: '',
  herramientas: '',
  compromisos: '',
  restricciones: '',
  decisionesDuenio: '',
};

export const ContextProfileSheet: React.FC = () => {
  const [data, setData] = useState<ContextSheetData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return SAMPLE_DATA;
  });

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof ContextSheetData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    setData(EMPTY_DATA);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleLoadSample = () => {
    setData(SAMPLE_DATA);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_DATA));
  };

  const formattedText = `FICHA DEL NEGOCIO (BOWOL Plans 2.0):
Negocio y sector: ${data.negocioYSector || 'desconocido'}
Productos o servicios: ${data.productosServicios || 'desconocido'}
Cliente principal y canales de venta: ${data.clienteCanales || 'desconocido'}
Problema que queremos resolver: ${data.problema || 'desconocido'}
Evidencias del problema y periodo observado: ${data.evidencias || 'desconocido'}
Resultado deseado: ${data.resultadoDeseado || 'desconocido'}
Situación actual / línea base: ${data.lineaBase || 'desconocido'}
Periodo de planificación: ${data.periodo || 'desconocido'}
País, moneda y zona horaria: ${data.paisMoneda || 'desconocido'}
Equipo: ${data.equipo || 'desconocido'}
Trabajo habitual que ya ocupa al equipo: ${data.trabajoHabitual || 'desconocido'}
Presupuesto disponible: ${data.presupuesto || 'desconocido'}
Herramientas actuales: ${data.herramientas || 'desconocido'}
Compromisos, fechas fijas y dependencias externas: ${data.compromisos || 'desconocido'}
Restricciones: ${data.restricciones || 'desconocido'}
Decisiones que requieren aprobación del dueño: ${data.decisionesDuenio || 'desconocido'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Ficha de Contexto Reutilizable
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-semibold">
              Sección 2 · BOWOL Plans
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Completa los datos de tu emprendimiento una sola vez. Esta ficha inyecta los hechos reales en todos los prompts para que la IA no invente datos ni presupuestos ficticios.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleLoadSample} className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Cargar Ejemplo
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Save className="w-3.5 h-3.5" />}
            {savedSuccess ? 'Guardado' : 'Guardar Ficha'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleCopy} className="gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar Texto'}
          </Button>
        </div>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Bloque 1: Negocio y Mercado */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121318] border border-zinc-200 dark:border-white/10 space-y-4 shadow-sm">
          <h4 className="text-xs font-mono uppercase text-orange-600 dark:text-orange-400 font-bold tracking-wider">
            1. Negocio, Oferta y Canales
          </h4>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Negocio y Sector
            </label>
            <input
              type="text"
              value={data.negocioYSector}
              onChange={(e) => handleChange('negocioYSector', e.target.value)}
              placeholder="Ej: Cafetería de especialidad / Taller mecánico"
              className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Productos o Servicios Principales
            </label>
            <input
              type="text"
              value={data.productosServicios}
              onChange={(e) => handleChange('productosServicios', e.target.value)}
              placeholder="Ej: Menú de brunch, café en grano para llevar"
              className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Cliente Principal y Canales de Venta
            </label>
            <input
              type="text"
              value={data.clienteCanales}
              onChange={(e) => handleChange('clienteCanales', e.target.value)}
              placeholder="Ej: Oficinistas de la zona, familias; ventas en local y WhatsApp"
              className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              País, Moneda y Zona Horaria
            </label>
            <input
              type="text"
              value={data.paisMoneda}
              onChange={(e) => handleChange('paisMoneda', e.target.value)}
              placeholder="Ej: Colombia, COP, GMT-5"
              className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Bloque 2: Problema y Metas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121318] border border-zinc-200 dark:border-white/10 space-y-4 shadow-sm">
          <h4 className="text-xs font-mono uppercase text-orange-600 dark:text-orange-400 font-bold tracking-wider">
            2. Problema, Evidencia y Resultado
          </h4>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Problema que Queremos Resolver
            </label>
            <textarea
              rows={2}
              value={data.problema}
              onChange={(e) => handleChange('problema', e.target.value)}
              placeholder="Ej: Demora excesiva en entregar cotizaciones a clientes interesados"
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Evidencias del Problema y Periodo
            </label>
            <textarea
              rows={2}
              value={data.evidencias}
              onChange={(e) => handleChange('evidencias', e.target.value)}
              placeholder="Ej: 12 clientes se quejaron el mes pasado; promedio de espera: 48 horas"
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Línea Base Actual
              </label>
              <input
                type="text"
                value={data.lineaBase}
                onChange={(e) => handleChange('lineaBase', e.target.value)}
                placeholder="Ej: 48 horas de respuesta"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Resultado Deseado
              </label>
              <input
                type="text"
                value={data.resultadoDeseado}
                onChange={(e) => handleChange('resultadoDeseado', e.target.value)}
                placeholder="Ej: Responder en menos de 3h"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Periodo de Planificación
            </label>
            <input
              type="text"
              value={data.periodo}
              onChange={(e) => handleChange('periodo', e.target.value)}
              placeholder="Ej: Del 1 al 15 del próximo mes"
              className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Bloque 3: Capacidad del Equipo */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121318] border border-zinc-200 dark:border-white/10 space-y-4 shadow-sm">
          <h4 className="text-xs font-mono uppercase text-orange-600 dark:text-orange-400 font-bold tracking-wider">
            3. Equipo, Horas Reales y Trabajo Habitual
          </h4>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Equipo (Roles, Habilidades y Horas Disponibles para Proyectos)
            </label>
            <textarea
              rows={2}
              value={data.equipo}
              onChange={(e) => handleChange('equipo', e.target.value)}
              placeholder="Ej: Juan (Diseño, 6h/semana disponibles), María (Ventas, 8h/semana)"
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <span className="text-[10.5px] text-zinc-500 block mt-1">
              *Indicar solo horas que sobran después de atender el trabajo diario.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Trabajo Habitual que ya Ocupa al Equipo
            </label>
            <input
              type="text"
              value={data.trabajoHabitual}
              onChange={(e) => handleChange('trabajoHabitual', e.target.value)}
              placeholder="Ej: Atención de clientes, preparación de pedidos, facturación diaria"
              className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Presupuesto Disponible
              </label>
              <input
                type="text"
                value={data.presupuesto}
                onChange={(e) => handleChange('presupuesto', e.target.value)}
                placeholder="Ej: $500 USD o desconocido"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Herramientas Actuales
              </label>
              <input
                type="text"
                value={data.herramientas}
                onChange={(e) => handleChange('herramientas', e.target.value)}
                placeholder="Ej: WhatsApp, Excel, Canva"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Bloque 4: Restricciones y Decisiones */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121318] border border-zinc-200 dark:border-white/10 space-y-4 shadow-sm">
          <h4 className="text-xs font-mono uppercase text-orange-600 dark:text-orange-400 font-bold tracking-wider">
            4. Fechas Fijas, Restricciones y Decisiones
          </h4>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Compromisos, Fechas Fijas y Dependencias Externas
            </label>
            <input
              type="text"
              value={data.compromisos}
              onChange={(e) => handleChange('compromisos', e.target.value)}
              placeholder="Ej: Llegada del proveedor el día 10, evento de venta el día 20"
              className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Restricciones Inamovibles
            </label>
            <input
              type="text"
              value={data.restricciones}
              onChange={(e) => handleChange('restricciones', e.target.value)}
              placeholder="Ej: No contratar personal extra; no trabajar los domingos"
              className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Decisiones que Requieren Aprobación del Dueño
            </label>
            <input
              type="text"
              value={data.decisionesDuenio}
              onChange={(e) => handleChange('decisionesDuenio', e.target.value)}
              placeholder="Ej: Aprobación de gasto publicitario, cambio de precios"
              className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
