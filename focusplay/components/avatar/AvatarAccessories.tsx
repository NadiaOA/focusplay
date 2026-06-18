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
          <circle
            cx="40"
            cy="51"
            r="7"
            fill="rgba(255,255,255,0.15)"
            stroke="#2A3340"
            strokeWidth="2"
          />
          <circle
            cx="60"
            cy="51"
            r="7"
            fill="rgba(255,255,255,0.15)"
            stroke="#2A3340"
            strokeWidth="2"
          />
          <path
            d="M47 51 L53 51"
            stroke="#2A3340"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M33 50 L27 47"
            stroke="#2A3340"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M67 50 L73 47"
            stroke="#2A3340"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Gorra moderna */}
      {equippedHat === "hat_cap" && (
        <g>
          {/* Parte superior, cubre todo el cráneo, no solo una franja */}
          <path
            d="
              M19 38
              Q22 14 50 12
              Q78 14 81 38
              Q66 24 50 23
              Q34 24 19 38
              Z
            "
            fill="#45B7D1"
          />

          {/* Brillo gorra */}
          <path
            d="
              M30 24
              Q50 15 70 24
            "
            stroke="rgba(255,255,255,0.40)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Sombra gorra */}
          <path
            d="
              M21 35
              Q50 21 79 35
              Q50 27 21 35
            "
            fill="rgba(0,0,0,0.15)"
          />

          {/* Visera */}
          <path
            d="
              M72 36
              Q92 38 87 28
              Q82 25 69 30
              Z
            "
            fill="#3AA8C0"
          />

          {/* Botón superior */}
          <circle cx="50" cy="14" r="2.2" fill="#ffffff" opacity="0.85" />
        </g>
      )}

      {/* Gorro de invierno (opcional, listo para usar si se agrega al catálogo) */}
      {equippedHat === "hat_winter" && (
        <g>
          <path
            d="
              M18 40
              Q20 12 50 10
              Q80 12 82 40
              Q66 26 50 25
              Q34 26 18 40
              Z
            "
            fill="#FF6B6B"
          />
          <rect x="17" y="34" width="66" height="8" rx="4" fill="#ffffff" opacity="0.9" />
          <circle cx="50" cy="9" r="6" fill="#ffffff" opacity="0.9" />
        </g>
      )}
    </g>
  );
}