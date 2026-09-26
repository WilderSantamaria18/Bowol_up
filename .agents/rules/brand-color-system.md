# Sistema de Color de Marca y Armonía de Temas (Claro & Oscuro)

> **Regla de Identidad Visual BOWOL: El Principio "BO [W] OL" y Equilibrio Cromático**

---

## 1. Anatomía Cromática del Logo Oficial

El imagotipo y logotipo de BOWOL constan de una identidad dual distintiva:
1. **Emblema Isotipo**:
   - Alas geométricas exteriores que forman la silueta de una **W**.
   - **Cohete espacial central** ascendiendo verticalmente en el vértice interior.
   - Ventana circular y llama de propulsión en **Naranja/Ámbar Energético**.
2. **Logotipo Tipográfico (Wordmark)**:
   - Letras base: **B**, **O**, **O**, **L** en tipografía geométrica bold.
   - Letra de acento: **W** en **Naranja/Ámbar Vibrante**, simbolizando la tracción, la aceleración y la innovación.

---

## 2. Regla de Contraste y Adaptabilidad de Temas

Para asegurar legibilidad óptima (cumplimiento **WCAG 2.1 AA y AAA**) y evitar la fatiga visual o la sobresaturación:

### A. Modo Oscuro (`Dark Mode` — Entorno Predeterminado)
En el modo oscuro de BOWOL predomina una estética de cristal líquido (*Liquid Glass*) sobre lienzo negro carbón:
- **Fondo General**: `#08080A` (Obsidiana) y `#12131A` (Gris carbón profundo).
- **Letras Base del Logo (`B`, `O`, `O`, `L` y cuerpo del cohete)**:
  - Color: `#FFFFFF` (Blanco puro) o `#F4F4F5` (Zinc 100).
  - Contraste: $\ge 19.5:1$ contra el fondo (Supera ampliamente WCAG AAA).
- **Letra Acento (`W`, ventana y llama del cohete)**:
  - Color: `#F97316` (Naranja 500) o `#FB923C` (Naranja 400).
  - Contraste: $\ge 7.2:1$ contra el fondo (Cumple WCAG AAA para texto e interfaces).
- **Superficies y Tarjetas de Cristal**:
  - `rgba(30, 31, 38, 0.70)` con desenfoque de fondo `backdrop-blur-2xl` y borde sutil `rgba(255, 255, 255, 0.08)`.

---

### B. Modo Claro (`Light Mode` — Entorno Diurno / Alta Luminosidad)
En el modo claro, el logo mantiene su apariencia física original idéntica al archivo oficial de marca:
- **Fondo General**: `#F8F9FA` (Blanco perla suave) y `#FFFFFF` (Blanco puro).
- **Letras Base del Logo (`B`, `O`, `O`, `L` y cuerpo del cohete)**:
  - Color: `#09090B` (Negro obsidiana / Zinc 950).
  - Contraste: $\ge 19:1$ contra blanco (WCAG AAA).
- **Letra Acento (`W`, ventana y llama del cohete)**:
  - Color: `#EA580C` (Naranja 600) o `#C2410C` (Naranja 700).
  - **Regla Crítica**: No utilizar tonos naranja pastel o deslavados (#FDBA74) en fondos blancos para texto, ya que fallan el contraste. El tono `#EA580C` garantiza una relación de contraste $\ge 4.54:1$ sobre blanco, cumpliendo la norma WCAG 2.1 AA para texto y AAA para componentes gráficos.
- **Superficies y Tarjetas de Cristal**:
  - `rgba(255, 255, 255, 0.85)` con desenfoque `backdrop-blur-xl`, sombra suave `rgba(0, 0, 0, 0.05)` y borde `rgba(0, 0, 0, 0.07)`.

---

## 3. La Regla 60-30-10 contra la Saturación

El color naranja es un color de **alta energía visual**. Si se abusa de él, la aplicación satura la vista del usuario y pierde su elegancia ejecutiva. Se debe respetar estrictamente la proporción 60-30-10:

```
┌────────────────────────────────────────────────────────┐
│  60% - TONOS NEUTROS DOMINANTES                        │
│  Dark: #08080A / #12131A / #1E1F26                    │
│  Light: #F8F9FA / #FFFFFF / #F4F4F5                   │
├──────────────────────────────────────┬─────────────────┤
│  30% - ESTRUCTURA Y CONTENIDO        │  10% - ACENTO   │
│  Tipografía neutra, bordes de vidrio │  "Factor W"     │
│  Dark: #F4F4F5 / #A1A1AA             │  #F97316 /      │
│  Light: #09090B / #52525B            │  #EA580C        │
└──────────────────────────────────────┴─────────────────┘
```

### Usos Permitidos del 10% de Acento Naranja:
1. **La "W" del Logo y Emblema de Propulsión**.
2. **Botón de Acción Primario (Primary CTA)**: Botones como *"Nueva iniciativa"*, *"Profundizar con IA"*.
3. **Indicadores de Alta Prioridad**: Estado crítico, badge de Score RICE alto, punto pulsante de señal en vivo.
4. **Micro-Resplandor Periférico (Radial Glow)**: `bg-orange-500/10` con desenfoque `blur-3xl` en esquinas de tarjetas Bento (máximo 1 o 2 por viewport).

### Prácticas Prohibidas:
- ❌ **NUNCA** pintar fondos completos de paneles o secciones enteras en naranja sólido.
- ❌ **NUNCA** usar texto gris claro sobre fondos naranja (usar siempre texto blanco con sombra interior o texto oscuro de alto contraste).
- ❌ **NUNCA** pintar todas las letras de `BOWOL` en naranja (rompe la identidad; `BO` y `OL` son neutros, solo la `W` es naranja).
