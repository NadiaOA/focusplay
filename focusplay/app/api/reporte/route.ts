import { NextRequest, NextResponse } from "next/server"
 
export interface ReporteRequest {
  childName:   string
  statsText:   string   // salida de statsToPromptText()
  weeklyStats: object
}
 
export interface ReporteResponse {
  report: {
    loQueHizo:            string
    sugerenciasParaCasa:  string
    fraseDeLaSemana:      string
  }
  raw: string
}
 
// ── Config ────────────────────────────────────────────────────────────────────
 
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434"
const MODEL      = process.env.OLLAMA_MODEL ?? "gemma3:4b"
 
// ── Prompts ───────────────────────────────────────────────────────────────────
// En vez de pedir un JSON grande con todo el reporte (lento y propenso a
// cortarse en CPU), se hacen 2-3 llamadas cortas en texto plano. Cada una es
// rápida y casi nunca se corta porque el límite de tokens por llamada es bajo.
 
function buildPromptLoQueHizo(childName: string, statsText: string): string {
  return `Eres un asistente especializado en desarrollo infantil y neurodiversidad (TEA grado 1).
Recibirás estadísticas de juego de una app terapéutica llamada FocusPlay usada por "${childName}".

Reglas:
- Lenguaje simple, cálido y empático, sin tecnicismos.
- Cita números concretos cuando existan (ej. "completó 8 de 10 partidas", "subió del nivel 1 al 2 en Memorama").
- Si hay datos de la semana anterior, compáralos brevemente (mejoró, se mantuvo o bajó).
- Tiempo de respuesta alto (más de 3000ms) indica distracción o fatiga, no lentitud cognitiva.
- Nunca uses palabras negativas ("le cuesta", "falla", "no puede"). Usa "área de oportunidad" o "sigamos practicando".
- Responde SOLO con 3 a 4 oraciones de texto plano, sin listas, sin JSON, sin títulos.

Datos de la semana:
${statsText}

Escribe el resumen ahora:`.trim()
}
 
function buildPromptSugerencias(childName: string, resumen: string): string {
  return `Eres un asistente especializado en TEA grado 1.
Este es el resumen semanal de "${childName}" en FocusPlay:

"${resumen}"

Escribe 2 actividades breves y concretas para practicar en casa, relacionadas con ese resumen, cada una con duración aproximada y una idea simple de cómo guiarla.
Responde SOLO con texto plano, máximo 3 oraciones en total, sin listas, sin JSON, sin títulos.

Escribe las sugerencias ahora:`.trim()
}
 
function buildPromptFrase(childName: string): string {
  return `Escribe UNA sola frase corta, motivadora, en primera persona del plural (ej. "Lo logramos juntos", "Cada día aprendemos algo nuevo"), dirigida a "${childName}", un niño con TEA grado 1 que usa la app FocusPlay.
Responde SOLO con la frase, sin comillas, sin explicación adicional.`.trim()
}
 
// ── Helper: llamada a Ollama ────────────────────────────────────────────────
 
async function ollamaGenerate(prompt: string, numPredict: number): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:  MODEL,
      prompt,
      stream: false,
      options: {
        temperature:    0.3,
        num_predict:    numPredict,
        top_p:          0.9,
        repeat_penalty: 1.1,
      },
    }),
    // Timeout por llamada individual (cada llamada es corta, así que basta con 45s)
    signal: AbortSignal.timeout(45_000),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Ollama error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  return (data.response ?? "").trim()
}
 
// ── Handler ───────────────────────────────────────────────────────────────────
 
export async function POST(req: NextRequest) {
  try {
    const body: ReporteRequest = await req.json()
    const { childName, statsText } = body
    const name = childName || "el niño"
 
    if (!statsText) {
      return NextResponse.json({ error: "statsText requerido" }, { status: 400 })
    }
 
    // Verificar que Ollama esté corriendo antes de llamarlo
    try {
      await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(2000) })
    } catch {
      return NextResponse.json(
        { error: "Ollama no está corriendo. Abre una terminal y ejecuta: ollama serve" },
        { status: 503 }
      )
    }
 
    let loQueHizo = ""
    let sugerenciasParaCasa = ""
    let fraseDeLaSemana = ""
    let rawCombined = ""
 
    try {
      // 1. Resumen de la semana — corto y con datos concretos
      loQueHizo = await ollamaGenerate(buildPromptLoQueHizo(name, statsText), 400)
      rawCombined += loQueHizo + "\n\n"
 
      // 2. Sugerencias para casa — basadas en el resumen ya generado
      sugerenciasParaCasa = await ollamaGenerate(buildPromptSugerencias(name, loQueHizo), 300)
      rawCombined += sugerenciasParaCasa + "\n\n"
 
      // 3. Frase motivadora — muy corta, casi instantánea
      fraseDeLaSemana = await ollamaGenerate(buildPromptFrase(name), 70)
      rawCombined += fraseDeLaSemana
 
    } catch (err: any) {
      console.error("Ollama generate error:", err)

      // Si ya tenemos al menos "loQueHizo", devolvemos un reporte parcial
      // en vez de fallar todo, para no perder lo que sí se generó.
      if (loQueHizo) {
        return NextResponse.json({
          report: {
            loQueHizo,
            sugerenciasParaCasa: sugerenciasParaCasa || "Mantener sesiones cortas y constantes de 10 a 15 minutos al día, en un momento tranquilo, acompañando al niño y celebrando cada intento.",
            fraseDeLaSemana: fraseDeLaSemana || "¡Cada vez lo hacemos mejor!",
          },
          raw: rawCombined,
        } satisfies ReporteResponse)
      }

      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        return NextResponse.json(
          { error: "La IA tardó demasiado en responder. Intenta de nuevo en unos segundos." },
          { status: 504 }
        )
      }
      if (String(err?.message).includes("404")) {
        return NextResponse.json(
          { error: `Modelo "${MODEL}" no encontrado. Ejecuta: ollama pull ${MODEL}` },
          { status: 404 }
        )
      }
      return NextResponse.json({ error: "Error al generar con Ollama" }, { status: 502 })
    }
 
    const report: ReporteResponse["report"] = {
      loQueHizo:           loQueHizo || "El niño completó sesiones de juego esta semana.",
      sugerenciasParaCasa: sugerenciasParaCasa || "Mantener sesiones cortas y constantes de 10 a 15 minutos al día, en un momento tranquilo, acompañando al niño y celebrando cada intento.",
      fraseDeLaSemana:     fraseDeLaSemana || "¡Cada vez lo hacemos mejor!",
    }
 
    return NextResponse.json({ report, raw: rawCombined } satisfies ReporteResponse)
 
  } catch (err: any) {
    console.error("reporte/route error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}