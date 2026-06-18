import React from "react";
import AvatarFace from "./AvatarFace";
import AvatarAccessories from "./AvatarAccessories";

interface CustomAvatarProps {
  base: string;
  skinTone: string;
  bgColor: string;
  hairColor?: string;
  size?: number;
  expression?: "neutral" | "happy" | "sad";
  equippedHat?: string | null;
  equippedGlasses?: string | null;
}

export default function CustomAvatar({
  base,
  skinTone,
  bgColor,
  hairColor = "#2B221E",
  size = 64,
  expression = "neutral",
  equippedHat,
  equippedGlasses,
}: CustomAvatarProps) {
  const skinMap: Record<string, string> = {
    lightest: "#FFDFC4",
    light: "#F0D5BE",
    medium: "#D2996C",
    dark: "#8D5524",
    darkest: "#3D2210",
  };

  const skin = skinMap[skinTone] || skinMap.medium;

  let safeBase = base;

  if (safeBase === "boy") safeBase = "boy_short";
  if (safeBase === "girl") safeBase = "girl_long";
  if (safeBase === "neutral") safeBase = "boy_curly";
  if (safeBase === "spiky") safeBase = "boy_spiky";
  if (safeBase === "bun") safeBase = "girl_bun";

  // ── Base de cuero cabelludo ──────────────────────────────────────────────
  // Sigue el contorno real de la cabeza (ver AvatarFace: cabeza de y=18 a
  // y=84, orejas a x=20/80). Esta capa se dibuja SIEMPRE debajo del detalle
  // de cada peinado, así nunca queda un hueco de piel entre el cabello y la
  // frente/sienes, sin importar qué tan "delgado" sea el diseño decorativo.
  const ScalpBase = ({ heightRatio = 1 }: { heightRatio?: number }) => (
    <path
      d={`
        M19 ${48 - 14 * heightRatio}
        Q22 ${17 - 4 * heightRatio} 50 ${16 - 4 * heightRatio}
        Q78 ${17 - 4 * heightRatio} 81 ${48 - 14 * heightRatio}
        Q72 ${36 - 6 * heightRatio} 50 ${34 - 4 * heightRatio}
        Q28 ${36 - 6 * heightRatio} 19 ${48 - 14 * heightRatio}
        Z
      `}
      fill={hairColor}
    />
  );

  const renderHair = () => {
    switch (safeBase) {
      // ── NIÑO: corto ──────────────────────────────────────────────────────
      case "boy_short":
        return (
          <g>
            <ScalpBase />
            <path
              d="M28 33 Q40 25 50 27 Q60 25 72 33"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Sombra de raíz, da textura sin abrir huecos */}
            <path
              d="M24 40 Q50 28 76 40 Q50 36 24 40 Z"
              fill="rgba(0,0,0,0.12)"
            />
          </g>
        );

      // ── NIÑO: picos ──────────────────────────────────────────────────────
      case "boy_spiky":
        return (
          <g>
            <ScalpBase heightRatio={0.85} />
            <path
              d="
                M22 38
                L27 16
                L36 26
                L45 10
                L55 26
                L64 10
                L73 26
                L78 38
                Q50 30 22 38
                Z
              "
              fill={hairColor}
            />
            <path
              d="M30 22 L33 14 M48 18 L50 12 M67 22 L70 14"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>
        );

      // ── NIÑO: rizos ──────────────────────────────────────────────────────
      case "boy_curly":
        return (
          <g>
            <ScalpBase heightRatio={0.9} />
            <g fill={hairColor}>
              <circle cx="28" cy="36" r="7.5" />
              <circle cx="38" cy="24" r="8.5" />
              <circle cx="50" cy="20" r="9.5" />
              <circle cx="62" cy="24" r="8.5" />
              <circle cx="72" cy="36" r="7.5" />
              <circle cx="44" cy="22" r="7" />
              <circle cx="56" cy="22" r="7" />
            </g>
            <g fill="rgba(255,255,255,0.15)">
              <circle cx="36" cy="21" r="2" />
              <circle cx="58" cy="19" r="2" />
            </g>
          </g>
        );

      // ── NIÑO: despeinado ─────────────────────────────────────────────────
      case "boy_messy":
        return (
          <g>
            <ScalpBase heightRatio={0.9} />
            <path
              d="
                M21 40
                Q26 16 39 24
                Q48 6 60 20
                Q70 12 79 40
                Q63 26 51 30
                Q39 24 21 40
                Z
              "
              fill={hairColor}
            />
            <path
              d="M32 20 Q40 14 46 18"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );

      // ── NIÑO: de lado ────────────────────────────────────────────────────
      case "boy_part":
        return (
          <g>
            <ScalpBase />
            <path
              d="
                M20 40
                Q26 14 54 16
                Q70 17 80 40
                Q66 22 52 22
                Q38 18 20 40
                Z
              "
              fill={hairColor}
            />
            <path
              d="M50 16 Q53 26 55 38"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );

      // ── NIÑA: largo ──────────────────────────────────────────────────────
      // La melena trasera la pinta renderBackLayer() ANTES de la cara.
      // Aquí solo va el cuero cabelludo + flequillo, que debe quedar
      // ENCIMA de la cara para que no se vea piel en la frente.
      case "girl_long":
        return (
          <g>
            <ScalpBase />
            <path
              d="M26 36 Q50 18 74 36 Q62 28 50 30 Q38 28 26 36 Z"
              fill="rgba(0,0,0,0.1)"
            />
          </g>
        );

      // ── NIÑA: chongo ─────────────────────────────────────────────────────
      // No tiene capa trasera (el chongo va arriba, dentro del scalp).
      case "girl_bun":
        return (
          <g>
            <ScalpBase />
            <circle cx="50" cy="13" r="10.5" fill={hairColor} />
            <circle cx="50" cy="13" r="10.5" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
            <path
              d="M26 36 Q50 18 74 36 Q62 28 50 30 Q38 28 26 36 Z"
              fill="rgba(0,0,0,0.1)"
            />
          </g>
        );

      // ── NIÑA: coleta ─────────────────────────────────────────────────────
      // La coleta trasera la pinta renderBackLayer() ANTES de la cara.
      case "girl_ponytail":
        return (
          <g>
            <ScalpBase />
            <path
              d="M26 36 Q50 18 74 36 Q62 28 50 30 Q38 28 26 36 Z"
              fill="rgba(0,0,0,0.1)"
            />
          </g>
        );

      // ── NIÑA: corto/bob ──────────────────────────────────────────────────
      // El volumen del bob lo pinta renderBackLayer() ANTES de la cara.
      case "girl_bob":
        return (
          <g>
            <ScalpBase />
            <path
              d="M26 36 Q50 18 74 36 Q62 28 50 30 Q38 28 26 36 Z"
              fill="rgba(0,0,0,0.1)"
            />
          </g>
        );

      // ── NIÑA: trenzas ────────────────────────────────────────────────────
      // Las trenzas (cayendo a los lados) las pinta renderBackLayer() ANTES
      // de la cara. Aquí solo van las ligas (que sí se ven por encima) y el
      // cuero cabelludo + flequillo.
      case "girl_braids":
        return (
          <g>
            <ScalpBase />
            <path
              d="M26 36 Q50 18 74 36 Q62 28 50 30 Q38 28 26 36 Z"
              fill="rgba(0,0,0,0.1)"
            />
            <ellipse cx="29" cy="60" rx="3.2" ry="2.4" fill="#FF9F1C" />
            <ellipse cx="71" cy="60" rx="3.2" ry="2.4" fill="#FF9F1C" />
          </g>
        );

      default:
        return <ScalpBase />;
    }
  };

  // Estilos donde una parte del cabello debe dibujarse DETRÁS de la cara
  // (cae a los lados/atrás de la cabeza) — el resto (cuero cabelludo +
  // flequillo) siempre va encima, después de AvatarFace.
  const hasBackHair = ["girl_long", "girl_bob", "girl_ponytail", "girl_braids"].includes(safeBase);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgColor} />
          <stop offset="100%" stopColor="#ffffff22" />
        </linearGradient>

        <radialGradient id="faceHighlight">
          <stop offset="0%" stopColor="#ffffff22" />
          <stop offset="100%" stopColor="#ffffff00" />
        </radialGradient>

        <filter id="softShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Fondo */}
      <circle cx="50" cy="50" r="50" fill="url(#avatarBg)" />
      <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.04)" />

      {/* Cabello que cae detrás de la cabeza (coletas, melena, trenzas) */}
      {hasBackHair && renderBackLayer(safeBase, hairColor)}

      {/* Cara */}
      <AvatarFace skin={skin} expression={expression} />

      {/* Cuero cabelludo + flequillo/peinado, siempre encima de la cara */}
      {renderHair()}

      {/* Accesorios */}
      <AvatarAccessories equippedHat={equippedHat} equippedGlasses={equippedGlasses} />
    </svg>
  );
}

// Capa de cabello que debe quedar DETRÁS de la cabeza/cara (melena, coleta,
// trenzas que caen a los costados). Se pinta antes que <AvatarFace />. La
// parte "de encima" del mismo peinado (cuero cabelludo + flequillo) vive en
// renderHair() y se pinta después de la cara, para nunca dejar piel visible
// en la frente o las sienes.
function renderBackLayer(safeBase: string, hairColor: string) {
  switch (safeBase) {
    case "girl_long":
      return (
        <path
          d="
            M21 36
            Q16 70 27 94
            Q50 102 73 94
            Q84 70 79 36
            Z
          "
          fill={hairColor}
        />
      );
    case "girl_bob":
      return (
        <path
          d="
            M16 38
            L16 68
            Q50 82 84 68
            L84 38
            Q50 14 16 38
            Z
          "
          fill={hairColor}
        />
      );
    case "girl_ponytail":
      return (
        <path
          d="
            M70 30
            Q96 38 90 78
            Q80 62 72 38
            Z
          "
          fill={hairColor}
        />
      );
    case "girl_braids":
      return (
        <>
          <path
            d="
              M27 38
              Q14 68 23 92
              Q34 70 35 40
              Z
            "
            fill={hairColor}
          />
          <path
            d="
              M73 38
              Q86 68 77 92
              Q66 70 65 40
              Z
            "
            fill={hairColor}
          />
        </>
      );
    default:
      return null;
  }
}