import React from "react";

interface AvatarFaceProps {
  skin: string;
  expression?: "neutral" | "happy" | "sad";
}

export default function AvatarFace({
  skin,
  expression = "neutral",
}: AvatarFaceProps) {
  return (
    <g>
      {/* Orejas (debajo de la cabeza, no deben verse "flotando") */}
      <ellipse cx="25" cy="54" rx="5.5" ry="8" fill={skin} />
      <ellipse cx="75" cy="54" rx="5.5" ry="8" fill={skin} />
      <ellipse cx="25.5" cy="54" rx="2.4" ry="4" fill="rgba(0,0,0,0.08)" />
      <ellipse cx="74.5" cy="54" rx="2.4" ry="4" fill="rgba(0,0,0,0.08)" />

      {/* Cabeza */}
      <path
        d="
          M50 18
          C67 18 80 31 80 49
          C80 68 67 84 50 84
          C33 84 20 68 20 49
          C20 31 33 18 50 18
          Z
        "
        fill={skin}
        filter="url(#softShadow)"
      />

      {/* Luz suave arriba-izquierda */}
      <ellipse cx="40" cy="36" rx="12" ry="9" fill="url(#faceHighlight)" />

      {/* Sombra lateral derecha, sutil, para dar volumen */}
      <path
        d="
          M64 22
          C74 28 80 38 80 49
          C80 68 67 84 50 84
          C61 77 68 66 68 50
          C68 39 67 30 64 22
          Z
        "
        fill="rgba(0,0,0,0.05)"
      />

      {/* Mejillas */}
      <ellipse cx="35" cy="62" rx="5" ry="3" fill="rgba(255,130,150,0.16)" />
      <ellipse cx="65" cy="62" rx="5" ry="3" fill="rgba(255,130,150,0.16)" />

      {/* Cejas (van antes de los ojos para que respeten el mismo eje) */}
      <path
        d="M33 42 Q40 38.5 47 42"
        stroke="#3A2D25"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M53 42 Q60 38.5 67 42"
        stroke="#3A2D25"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Ojo izquierdo */}
      <g>
        <ellipse cx="40" cy="51" rx="4.6" ry="5.6" fill="#ffffff" />
        <circle cx="40" cy="52" r="2.7" fill="#1B2430" />
        <circle cx="39.1" cy="50.6" r="1" fill="#ffffff" />
        <circle cx="40.8" cy="53.2" r="0.6" fill="#ffffff" opacity="0.7" />
      </g>

      {/* Ojo derecho */}
      <g>
        <ellipse cx="60" cy="51" rx="4.6" ry="5.6" fill="#ffffff" />
        <circle cx="60" cy="52" r="2.7" fill="#1B2430" />
        <circle cx="59.1" cy="50.6" r="1" fill="#ffffff" />
        <circle cx="60.8" cy="53.2" r="0.6" fill="#ffffff" opacity="0.7" />
      </g>

      {/* Nariz */}
      <path
        d="M50 54 Q48 60 50 62"
        stroke="rgba(80,60,50,0.3)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Boca neutral */}
      {expression === "neutral" && (
        <path
          d="M44 69 Q50 72 56 69"
          stroke="#253244"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Boca feliz */}
      {expression === "happy" && (
        <path
          d="M41 66 Q50 78 59 66"
          stroke="#253244"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Boca triste */}
      {expression === "sad" && (
        <path
          d="M42 74 Q50 64 58 74"
          stroke="#253244"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}