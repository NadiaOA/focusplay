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
      {/* Orejas */}
      <ellipse cx="26" cy="53" rx="5" ry="7" fill={skin} />
      <ellipse cx="74" cy="53" rx="5" ry="7" fill={skin} />

      {/* Cabeza */}
      <path
        d="
        M50 22
        C65 22 78 34 78 50
        C78 68 66 82 50 82
        C34 82 22 68 22 50
        C22 34 35 22 50 22
        Z
        "
        fill={skin}
        filter="url(#softShadow)"
      />
<ellipse
  cx="42"
  cy="38"
  rx="10"
  ry="7"
  fill="url(#faceHighlight)"
/>
      {/* Sombra lateral */}
      <path
        d="
        M62 26
        C72 32 78 42 78 52
        C78 68 66 82 50 82
        C60 75 66 65 66 52
        C66 42 64 34 62 26
        Z
        "
        fill="rgba(0,0,0,0.05)"
      />

      {/* Mejillas */}
      <ellipse
        cx="36"
        cy="60"
        rx="4"
        ry="2.5"
        fill="rgba(255,130,150,0.12)"
      />
      <ellipse
        cx="64"
        cy="60"
        rx="4"
        ry="2.5"
        fill="rgba(255,130,150,0.12)"
      />

      {/* Ojo izquierdo */}
      <g>
        <ellipse cx="40" cy="50" rx="4" ry="5" fill="#ffffff" />
        <circle
  cx="40"
  cy="51"
  r="2.4"
  fill="#1B2430"
/>

<circle
  cx="39.3"
  cy="50"
  r="0.9"
  fill="#ffffff"
/>
        <circle cx="39.2" cy="50.2" r="0.8" fill="#ffffff" />
      </g>

      {/* Ojo derecho */}
<g>
  <ellipse cx="60" cy="50" rx="4" ry="5" fill="#ffffff" />

  <circle
    cx="60"
    cy="51"
    r="2.4"
    fill="#1B2430"
  />

  <circle
    cx="59.3"
    cy="50"
    r="0.9"
    fill="#ffffff"
  />

  <circle
    cx="59.2"
    cy="50.2"
    r="0.8"
    fill="#ffffff"
  />
</g>
        <circle cx="59.2" cy="50.2" r="0.8" fill="#ffffff" />
      

      {/* Cejas */}
      <path
        d="M34 43 Q40 40 46 43"
        stroke="#3A2D25"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M54 43 Q60 40 66 43"
        stroke="#3A2D25"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Nariz */}
      <path
        d="M50 52 Q48 58 50 60"
        stroke="rgba(80,60,50,0.25)"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Boca neutral */}
      {expression === "neutral" && (
        <path
          d="M44 67 Q50 70 56 67"
          stroke="#253244"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Boca feliz */}
      {expression === "happy" && (
        <path
          d="M42 64 Q50 75 58 64"
          stroke="#253244"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Boca triste */}
      {expression === "sad" && (
        <path
          d="M43 71 Q50 62 57 71"
          stroke="#253244"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}