import React from "react";

interface AvatarAccessoriesProps {
  equippedHat?: string | null;
  equippedGlasses?: string | null;
}

export default function AvatarAccessories({
  equippedHat,
  equippedGlasses,
}: AvatarAccessoriesProps) {
  return (
    <g>
      {/* Gafas clásicas */}
      {equippedGlasses === "glasses_classic" && (
        <g>
          {/* Cristal izquierdo */}
          <circle
            cx="40"
            cy="50"
            r="6.5"
            fill="rgba(255,255,255,0.15)"
            stroke="#2A3340"
            strokeWidth="2"
          />

          {/* Cristal derecho */}
          <circle
            cx="60"
            cy="50"
            r="6.5"
            fill="rgba(255,255,255,0.15)"
            stroke="#2A3340"
            strokeWidth="2"
          />

          {/* Puente */}
          <path
            d="M46 50 L54 50"
            stroke="#2A3340"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Patillas */}
          <path
            d="M34 50 L30 48"
            stroke="#2A3340"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M66 50 L70 48"
            stroke="#2A3340"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Gorra moderna */}
      {equippedHat === "hat_cap" && (
        <g>
          {/* Parte superior */}
          <path
            d="
              M28 35
              Q50 18 72 35
              L70 25
              Q50 10 30 25
              Z
            "
            fill="#45B7D1"
          />
{/* Brillo gorra */}
<path
  d="
    M34 27
    Q50 18 66 27
  "
  stroke="rgba(255,255,255,0.40)"
  strokeWidth="2"
  fill="none"
  strokeLinecap="round"
/>
          {/* Sombra gorra */}
          <path
            d="
              M30 33
              Q50 22 70 33
              Q50 28 30 33
            "
            fill="rgba(0,0,0,0.15)"
          />

          {/* Visera */}
          <path
            d="
              M70 35
              Q88 38 84 30
              Q80 27 67 31
              Z
            "
            fill="#3AA8C0"
          />

          {/* Botón superior */}
          <circle
            cx="50"
            cy="20"
            r="2"
            fill="#ffffff"
            opacity="0.8"
          />
        </g>
      )}
    </g>
  );
}