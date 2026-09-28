import React, { useId } from 'react';

interface BowolLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * BowolLogo — Implementación oficial en capas según R1 (Una propiedad, un dueño)
 * Estructura de anidamiento de capas:
 *   [data-part]            -> INTRO (timeline temporal)
 *     [data-layer=scroll]  -> MASTER SCRUB (hero -> dock)
 *       [data-layer=mode]  -> ESTADOS por sección (intelligence, strategy, execution, landed)
 *         [data-layer=physics] -> FÍSICA REACTIVA (gsap.ticker + quickTo)
 *           [data-layer=idle]  -> RESPIRACIÓN EN REPOSO (solo CSS)
 */
export const BowolLogo: React.FC<BowolLogoProps> = ({ className, ...props }) => {
  const uniqueId = useId().replace(/:/g, '');
  const glowGradId = `glow-grad-${uniqueId}`;
  const flameGradId = `flame-grad-${uniqueId}`;

  return (
    <svg
      data-logo
      viewBox="0 0 1298 862"
      role="img"
      aria-label="Logotipo Oficial BOWOL"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <defs>
        {/* Glow sin filter: radialGradient nativo acelerado por hardware */}
        <radialGradient id={glowGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#F97316" stopOpacity="0.5" />
          <stop offset="80%" stopColor="#EA580C" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </radialGradient>

        {/* Gradiente térmico de la tobera de ignición */}
        <linearGradient id={flameGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="45%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
      </defs>

      {/* Coordenadas maestras de bowol_logo1.svg invertidas en Y */}
      <g transform="translate(0, 862) scale(0.1, -0.1)">
        {/* 1. GLOW PROPULSOR (Afectado exclusivamente por capa [mode]) */}
        <g data-part="glow">
          <g data-layer="mode" style={{ transformOrigin: '6450px 5200px' }}>
            <ellipse
              cx="6450"
              cy="5100"
              rx="950"
              ry="1250"
              fill={`url(#${glowGradId})`}
              className="pointer-events-none"
            />
          </g>
        </g>

        {/* 2. ALAS (Wings) */}
        <g data-part="wings">
          <g data-layer="scroll" style={{ transformOrigin: '6450px 6400px' }}>
            <g data-layer="physics" style={{ transformOrigin: '6450px 6400px' }}>
              {/* Ala izquierda */}
              <path
                fill="currentColor"
                d="M4610 6388 c0 -40 4 -136 10 -213 5 -77 14 -322 21 -545 l11 -405 111 -180 c60 -99 120 -196 132 -215 25 -39 196 -325 380 -635 65 -110 184 -310 265 -445 80 -135 172 -289 204 -342 32 -54 59 -98 61 -98 3 0 193 196 301 310 49 52 140 147 202 212 61 64 112 123 112 131 0 8 -23 81 -51 163 -28 82 -64 190 -82 241 l-31 92 -25 -19 c-14 -10 -63 -57 -109 -104 -46 -47 -87 -86 -92 -86 -16 0 -116 278 -185 515 -70 238 -133 488 -174 688 l-37 177 -84 68 c-47 38 -192 156 -324 263 -131 107 -256 208 -276 224 -21 17 -98 80 -171 140 -73 61 -141 116 -151 123 -17 12 -18 9 -18 -60z"
              />
              {/* Ala derecha */}
              <path
                fill="currentColor"
                d="M8360 6403 c-235 -187 -927 -757 -938 -772 -7 -10 -21 -65 -32 -122 -41 -216 -119 -522 -205 -809 -45 -147 -147 -435 -159 -447 -4 -4 -56 42 -116 102 -60 60 -112 106 -116 103 -3 -4 -44 -118 -90 -254 l-84 -247 103 -106 c57 -58 144 -149 193 -201 208 -221 310 -325 320 -328 7 -2 21 10 32 25 23 33 332 549 502 838 129 219 231 391 265 445 12 19 42 69 67 110 98 163 193 319 243 395 l51 80 12 355 c7 195 17 465 23 600 6 135 9 256 7 269 -3 23 -7 21 -78 -36z"
              />
            </g>
          </g>
        </g>

        {/* 3. PROPULSORES Y LLAMA DE ESCAPE */}
        <g data-part="flame">
          <g data-layer="scroll">
            <g data-layer="mode">
              <g data-layer="physics">
                <g data-layer="idle">
                  {/* Tobera izquierda */}
                  <path
                    data-part="thruster-left"
                    fill={`url(#${flameGradId})`}
                    d="M6004 5787 c-34 -45 -84 -116 -112 -157 l-52 -75 19 -85 c55 -248 104 -425 117 -425 9 0 84 110 156 229 l42 69 -32 161 c-17 88 -39 204 -48 256 -8 52 -19 98 -23 102 -3 4 -34 -29 -67 -75z"
                  />
                  {/* Tobera derecha */}
                  <path
                    data-part="thruster-right"
                    fill={`url(#${flameGradId})`}
                    d="M6970 5861 c0 -13 -67 -367 -85 -451 -16 -74 -17 -72 94 -239 31 -45 63 -94 71 -107 20 -32 26 -30 39 9 28 86 111 435 111 467 0 31 -17 60 -104 177 -100 136 -126 165 -126 144z"
                  />
                  {/* Llama nuclear central aerodinámica */}
                  <path
                    data-part="flame-inner"
                    fill={`url(#${flameGradId})`}
                    d="M 6450 5820 C 6630 5380 6660 4720 6450 4100 C 6240 4720 6270 5380 6450 5820 Z"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>

        {/* 3b. FX DECORATIVOS: Anillos de Radar y Chispas Reactivas */}
        <g data-part="fx" className="pointer-events-none">
          {/* Anillos de radar para modo intelligence (escáner) */}
          <circle data-fx="ring" cx="6450" cy="5800" r="320" fill="none" stroke="#F97316" strokeWidth="28" opacity="0" />
          <circle data-fx="ring" cx="6450" cy="5800" r="320" fill="none" stroke="#F97316" strokeWidth="28" opacity="0" />
          <circle data-fx="ring" cx="6450" cy="5800" r="320" fill="none" stroke="#F97316" strokeWidth="28" opacity="0" />
          {/* Chispas de escape para modo execution (afterburner) */}
          <circle data-fx="spark" cx="6430" cy="5500" r="42" fill="#FED7AA" opacity="0" />
          <circle data-fx="spark" cx="6470" cy="5350" r="38" fill="#F97316" opacity="0" />
          <circle data-fx="spark" cx="6390" cy="5200" r="32" fill="#FDBA74" opacity="0" />
          <circle data-fx="spark" cx="6510" cy="5050" r="45" fill="#FED7AA" opacity="0" />
          <circle data-fx="spark" cx="6440" cy="4850" r="36" fill="#F97316" opacity="0" />
          <circle data-fx="spark" cx="6460" cy="4650" r="30" fill="#EA580C" opacity="0" />
        </g>

        {/* 4. COHETE CENTRAL (Cockpit & Ventanilla adaptativa) */}
        <g data-part="rocket">
          <g data-layer="scroll" style={{ transformOrigin: '6450px 6400px' }}>
            <g data-layer="physics" style={{ transformOrigin: '6450px 6400px' }}>
              {/* Ventanilla interior adaptativa al tema */}
              <circle
                cx="6453"
                cy="6290"
                r="165"
                fill="var(--bowol-bg, #09090B)"
              />
              {/* Cuerpo y fuselaje del cohete */}
              <path
                fill="currentColor"
                d="M6453 7027 c-172 -181 -268 -390 -293 -635 -24 -247 50 -736 155 -1017 34 -90 200 -425 211 -425 8 0 181 357 208 428 62 164 126 469 147 692 13 145 8 360 -11 450 -40 187 -155 393 -298 533 l-49 48 -70 -74z m184 -614 c54 -43 77 -88 77 -148 0 -172 -202 -257 -323 -136 -71 71 -76 181 -11 255 45 51 85 67 157 63 52 -2 69 -8 100 -34z"
              />
            </g>
          </g>
        </g>

        {/* 5. WORDMARK (Una path por letra para stagger individual libre de FOUT) */}
        <g data-part="wordmark">
          {/* Letra B */}
          <path
            data-letter="b"
            fill="currentColor"
            style={{ transformOrigin: '3000px 2300px' }}
            d="M2632 2818 c-9 -9 -12 -128 -12 -474 0 -254 3 -469 6 -478 5 -14 49 -16 393 -16 423 0 457 4 556 59 29 17 64 48 85 76 30 42 35 58 38 117 7 116 -38 192 -142 242 l-47 23 39 26 c75 53 104 140 78 232 -32 107 -129 176 -278 195 -112 14 -701 13 -716 -2z m684 -230 c57 -56 21 -130 -68 -143 -24 -3 -104 -5 -178 -3 l-135 3 -3 74 c-2 41 -1 80 2 88 5 12 37 14 181 11 174 -3 175 -3 201 -30z m48 -367 c34 -32 40 -56 26 -91 -25 -59 -45 -65 -262 -68 l-198 -4 0 97 0 96 204 -3 c200 -3 205 -3 230 -27z"
          />

          {/* Letra O (primera) */}
          <path
            data-letter="o"
            fill="currentColor"
            style={{ transformOrigin: '4800px 2300px' }}
            d="M4625 2836 c-149 -29 -261 -84 -351 -173 -157 -155 -189 -359 -89 -554 25 -46 118 -142 175 -179 73 -47 199 -89 303 -100 310 -36 583 88 693 315 38 78 39 82 39 190 0 105 -2 113 -34 180 -46 93 -150 197 -248 248 -137 71 -340 102 -488 73z m207 -227 c164 -34 269 -156 255 -294 -10 -100 -68 -173 -177 -224 -47 -22 -68 -26 -150 -26 -82 1 -102 4 -151 28 -62 30 -121 82 -145 129 -22 42 -29 133 -15 185 25 90 112 168 221 197 68 18 95 19 162 5z"
          />

          {/* Letra W (Ámbar emblemático) */}
          <path
            data-letter="w"
            fill="#F5A623"
            style={{ transformOrigin: '6560px 2340px' }}
            d="M 5670 2820 L 5970 2820 L 6230 2300 L 6480 2820 L 6650 2820 L 6920 2300 L 7160 2820 L 7450 2820 L 7020 1860 L 6810 1860 L 6560 2370 L 6300 1860 L 6090 1860 Z"
          />

          {/* Letra O (segunda) */}
          <path
            data-letter="o"
            fill="currentColor"
            style={{ transformOrigin: '8350px 2300px' }}
            d="M8285 2839 c-287 -42 -502 -235 -521 -469 -12 -140 36 -261 146 -368 73 -72 182 -131 295 -158 95 -24 305 -23 394 0 302 81 481 321 427 575 -47 221 -246 383 -519 420 -89 12 -136 12 -222 0z m251 -250 c73 -27 157 -107 173 -166 40 -144 -22 -270 -167 -336 -37 -17 -66 -22 -142 -22 -82 0 -103 4 -151 26 -176 82 -226 279 -107 414 94 107 245 139 394 84z"
          />

          {/* Letra L */}
          <path
            data-letter="l"
            fill="currentColor"
            style={{ transformOrigin: '9800px 2300px' }}
            d="M9533 2824 c-10 -5 -13 -112 -13 -490 l0 -484 470 0 471 0 -3 123 -3 122 -312 3 -313 2 -2 363 -3 362 -140 2 c-77 1 -146 -1 -152 -3z"
          />
        </g>
      </g>
    </svg>
  );
};
