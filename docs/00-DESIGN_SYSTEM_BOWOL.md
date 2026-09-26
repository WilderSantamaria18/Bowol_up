# BOWOL — Manual de Fundamentos de Diseño & Identidad Visual
> **Versión 2.0 • Sistema Dual Claro / Oscuro • Directrices de Calidad Gráfica y Contraste WCAG 2.1 AAA**

---

## 1. Identidad de Marca y Reglas del Logotipo Oficial

El logotipo maestro de **BOWOL** (`logo/bowol_logo1.png`) sintetiza la misión de la plataforma: **transformar el ruido del mercado en propulsión estratégica ejecutable**.

```
                   ▲           [ Cohete Ascendente ]
                  / \          [ Cabina Ámbar / Fuego: #F97316 ]
                 / | \
           \ \  / / \ \  / /   [ Alas Angulares en W ]
            \ \/ /   \ \/ /    [ Carbono #09090B (Claro) | Platino #FFFFFF (Oscuro) ]
             \  /     \  /
              \/   🔥  \/     [ Llama de Propulsión Ámbar ]

        B   O   [  W  ]   O   L
        ▲   ▲      ▲      ▲   ▲
        └─ Carbono/Platino┘
                   └─ Naranja Ámbar Corporativo (#F97316)
```

### 1.1 Anatomía del Símbolo
1. **Isotipo (Emblema)**:
   - **Cohete central**: Simboliza el lanzamiento ágil de iniciativas y sprints de alto impacto.
   - **Ojo de buey / Ventana circular**: Ámbar neón (`#F97316`), representa la visión y la lente de inteligencia artificial.
   - **Alas geométricas**: Estructura angular que forma la silueta de una **W** estilizada en vuelo.
   - **Propulsión / Llama**: Fuego ascendente en gradiente ámbar-naranja.
2. **Wordmark Tipográfico (Logotipo)**:
   - Letras `B`, `O`, `O`, `L` en tipografía geométrica bold.
   - Letra central `W` en naranja vibrante, creando un anclaje visual directo con el isotipo.

---

## 2. Reglas Estrictas de Contraste para Modos Claro y Oscuro

Para garantizar una legibilidad impecable sin fatiga visual ni saturación cromática, el sistema aplica la regla de contraste adaptativo:

| Elemento del Logo | Modo Claro (`light`) | Modo Oscuro (`dark`) | Token Tailwind / Hex |
| :--- | :--- | :--- | :--- |
| **Alas del Cohete** | Negro Carbón | Blanco Platino | `#09090B` / `#FFFFFF` |
| **Cuerpo del Cohete** | Negro Carbón | Blanco Platino | `#09090B` / `#FFFFFF` |
| **Letras B, O, O, L** | Negro Carbón | Blanco Platino | `text-zinc-950` / `text-white` |
| **Ojo de buey & Llama** | Naranja Fuego Ámbar | Naranja Fuego Ámbar | `#F97316` / `#EA580C` |
| **Letra Central W** | Naranja Fuego Ámbar | Naranja Fuego Ámbar | `text-orange-500` / `text-orange-400` |
| **Fondo Recomendado** | Blanco Puro / Gris Perla | Negro Obsidiana / Zinc 950 | `#FFFFFF` / `#08080A` |

### 2.1 Directrices de Uso Prohibidas (Anti-Saturación)
- ❌ **PROHIBIDO** colocar el logotipo sobre fondos naranja, rojo o amarillos (destruye el contraste de la `W` y el fuego del cohete).
- ❌ **PROHIBIDO** invertir el color de la letra `W` (la `W` siempre debe permanecer en naranja BOWOL).
- ❌ **PROHIBIDO** aplicar sombras sólidas de color naranja que empasten la silueta del cohete. Se permite exclusivamente un resplandor difuso suave (`drop-shadow-[0_0_8px_rgba(249,115,22,0.25)]`) en modo oscuro.

---

## 3. La Regla Áurea 60-30-10 de BOWOL

Para asegurar una estética ejecutiva de nivel corporativo similar a Apple, Linear o Stripe:

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   60% Superficie Neutra Base                           │
│   • Claro:  #FFFFFF a #F8F9FA                          │
│   • Oscuro: #08080A a #09090B                          │
│                                                        │
│       ┌────────────────────────────────────────┐       │
│       │                                        │       │
│       │   30% Estructura & Cristal Líquido     │       │
│       │   • Bordes tenues (zinc-200 / white-8%)│       │
│       │   • Tarjetas Liquid Glass deslustradas │       │
│       │   • Paneles con desenfoque 16-24px     │       │
│       │                                        │       │
│       │       ┌────────────────────────┐       │       │
│       │       │ 10% Acento Naranja     │       │       │
│       │       │ • 'W' del logo         │       │       │
│       │       │ • CTAs primarios       │       │       │
│       │       │ • Puntos focales IA    │       │       │
│       │       └────────────────────────┘       │       │
│       └────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────┘
```

1. **60% Lienzo Neutro**:
   - En **Modo Oscuro**: `#08080A` / `#09090B`. Absorbe los reflejos y realza las tarjetas elevadas.
   - En **Modo Claro**: `#F8F9FA` / `#FFFFFF`. Aporta claridad, frescura y sensación de espacio infinito.
2. **30% Jerarquía Estructural (Liquid Glass)**:
   - Paneles flotantes con `backdrop-filter: blur(20px) saturate(180%)`.
   - En claro: `rgba(255, 255, 255, 0.85)` con bordes `rgba(0, 0, 0, 0.08)`.
   - En oscuro: `rgba(16, 16, 20, 0.68)` con bordes `rgba(255, 255, 255, 0.08)` y bisel interior `inset 0 1px 1px rgba(255,255,255,0.12)`.
3. **10% Acento Singular (Naranja BOWOL)**:
   - Reservado con disciplina matemática para:
     - El glifo `W` y el ojo de buey del cohete.
     - Botones de acción principal (*CTA* "Comenzar prueba", "Solicitar Acceso").
     - Badges de estado en tiempo real y barras de progreso activas.
     - Indicador activo del switch de pestañas (*sliding spring pill*).

---

## 4. Escala Tipográfica de Vanguardia

| Rol | Familia Tipográfica | Pesos Recomendados | Uso |
| :--- | :--- | :--- | :--- |
| **Display / Titulares** | `Plus Jakarta Sans` / `Outfit` | Bold (700), Extrabold (800) | Hero H1, títulos de sección, logotipo. |
| **Cuerpo / Interfaz** | `Inter` | Regular (400), Medium (500), Semibold (600) | Párrafos, tablas de datos, botones, navegación. |
| **Métricas / Terminal** | `JetBrains Mono` | Medium (500), Semibold (600) | Tickers de crawl, porcentajes RICE, badges SLA. |

---

## 5. Variantes de Assets Disponibles en el Proyecto

Los assets optimizados han sido generados en `frontend/public/logo/` y `logo/variants/`:

1. **Logo Completo (Cohete + BOWOL)**:
   - Modo Claro: `/logo/bowol_full_light.png` (805 x 545 px, transparente)
   - Modo Oscuro: `/logo/bowol_full_dark.png` (805 x 545 px, transparente)
2. **Isotipo / Emblema (Cohete + Alas W)**:
   - Modo Claro: `/logo/bowol_emblem_light.png` (620 x 400 px, transparente)
   - Modo Oscuro: `/logo/bowol_emblem_dark.png` (620 x 400 px, transparente)
3. **Wordmark Tipográfico (B O W O L)**:
   - Modo Claro: `/logo/bowol_wordmark_light.png` (805 x 125 px, transparente)
   - Modo Oscuro: `/logo/bowol_wordmark_dark.png` (805 x 125 px, transparente)

---

## 6. Microinteracciones y Principios de Movimiento

- **Físicas de Resorte (*Spring Physics*)**: Ninguna animación en BOWOL es lineal o robótica. Las transiciones usan resortes inerciales (`stiffness: 150`, `damping: 20`).
- **Resplandor Especular Dinámico (*Specular Sheen*)**: Al interactuar con tarjetas maestras, el cursor proyecta un haz de luz suave sobre el cristal reflectante.
- **Transición Dual Instantánea**: El cambio entre tema claro y oscuro conmuta la clase `.dark` en el elemento raíz sin recargar la página ni provocar parpadeos (*FOUC*).
