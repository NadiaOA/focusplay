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

  const renderHair = () => {
    switch (safeBase) {
      case "boy_short":
  return (
    <g>
      <path
        d="
          M22 42
          Q26 20 50 18
          Q74 20 78 42
          Q70 34 60 32
          Q50 30 40 32
          Q30 34 22 42
        "
        fill={hairColor}
      />

      <path
        d="
          M28 34
          Q40 22 50 24
          Q60 22 72 34
        "
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
        fill="none"
      />
    </g>
  );

      case "boy_spiky":
  return (
    <path
      d="
        M22 42
        L28 22
        L38 30
        L46 14
        L54 30
        L64 16
        L72 30
        L78 42
        Q50 32 22 42
      "
      fill={hairColor}
    />
  );

      case "boy_curly":
  return (
    <g fill={hairColor}>
      <circle cx="30" cy="32" r="7" />
      <circle cx="40" cy="24" r="8" />
      <circle cx="50" cy="22" r="9" />
      <circle cx="60" cy="24" r="8" />
      <circle cx="70" cy="32" r="7" />
      <circle cx="50" cy="30" r="8" />
    </g>
  );

      case "boy_messy":
  return (
    <path
      d="
        M22 42
        Q28 22 40 28
        Q50 10 62 24
        Q70 18 78 42
        Q62 32 52 34
        Q40 30 22 42
      "
      fill={hairColor}
    />
  );

      case "boy_part":
  return (
    <g>
      <path
        d="
          M22 42
          Q34 18 76 42
          Q64 24 52 24
          Q38 20 22 42
        "
        fill={hairColor}
      />

      <path
        d="
          M50 18
          Q54 28 56 40
        "
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="2"
      />
    </g>
  );

      case "girl_long":
  return (
    <>
      <path
        d="
          M20 34
          Q18 72 28 92
          Q50 100 72 92
          Q82 72 80 34
          Z
        "
        fill={hairColor}
      />

      <path
        d="
          M24 40
          Q50 14 76 40
          Q62 30 50 32
          Q38 30 24 40
        "
        fill={hairColor}
      />
    </>
  );

      case "girl_bun":
  return (
    <>
      <circle
        cx="50"
        cy="16"
        r="13"
        fill={hairColor}
      />

      <path
        d="
          M24 40
          Q50 14 76 40
          Q50 30 24 40
        "
        fill={hairColor}
      />
    </>
  );

   case "girl_ponytail":
  return (
    <>
      <path
        d="
          M72 34
          Q94 44 86 82
          Q74 64 68 42
        "
        fill={hairColor}
      />

      <path
        d="
          M24 40
          Q50 14 76 40
          Q50 30 24 40
        "
        fill={hairColor}
      />
    </>
  );

      case "girl_bob":
  return (
    <path
      d="
        M16 40
        L16 70
        Q50 84 84 70
        L84 40
        Q50 14 16 40
      "
      fill={hairColor}
    />
  );

      case "girl_braids":
  return (
    <>
      <path
        d="
          M28 40
          Q16 70 24 94
          Q34 72 36 42
        "
        fill={hairColor}
      />

      <path
        d="
          M72 40
          Q84 70 76 94
          Q66 72 64 42
        "
        fill={hairColor}
      />

      <path
        d="
          M24 40
          Q50 14 76 40
          Q50 30 24 40
        "
        fill={hairColor}
      />
    </>
  );

      default:
        return null;
    }
  };

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
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="2"
          floodOpacity="0.25"
        />
      </filter>
    </defs>
      
      {/* Fondo */}
     <circle
  cx="50"
  cy="50"
  r="50"
  fill="url(#avatarBg)"
/>

      {/* Sombra fondo */}
     <circle
  cx="50"
  cy="50"
  r="46"
  fill="rgba(255,255,255,0.04)"
/>

      {/* Cabello trasero */}
      {safeBase === "girl_long" && renderHair()}
      {safeBase === "girl_bob" && renderHair()}

      {/* Cara */}
      <AvatarFace
        skin={skin}
        expression={expression}
      />

      {/* Cabello */}
      {safeBase !== "girl_long" &&
        safeBase !== "girl_bob" &&
        renderHair()}

      {/* Accesorios */}
      <AvatarAccessories
        equippedHat={equippedHat}
        equippedGlasses={equippedGlasses}
      />
    </svg>
  );
}