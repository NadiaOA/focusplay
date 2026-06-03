// app/api/ia/route.ts
// Feedback del juego Amigos + Reporte para padres usando Ollama local.

import { NextRequest, NextResponse } from "next/server"

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434"
const MODEL      = process.env.OLLAMA_MODEL ?? "phi3:mini"

async function ollamaGenerate(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:  MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.4,
        num_predict: 150,
        top_p:       0.9,
      },
    }),
    signal: AbortSignal.timeout(90_000),
  })

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
  const data = await res.json()
  return (data.response ?? "").trim()
}

export async function POST(req: NextRequest) {
  // Leer el body UNA sola vez
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ feedback: "Error al leer la solicitud." }, { status: 400 })
  }

  // ── 1. Reporte para padres ───────────────────────────────────────────────
  if (body.history) {
    const { profileName, history, avgResponseTime, errorRate } = body

    const historyText = Array.isArray(history) && history.length > 0
      ? history.map((item: any, i: number) =>
          `${i + 1}. Situación: "${item.situation}" - Respondió bien: ${item.isCorrect ? "Sí" : "No"}`
        ).join("\n")
      : "Sin datos suficientes."

    const prompt = `Eres un psicopedagogo experto en TEA Grado 1.
Evalúas el progreso de un niño de 7 años llamado "${profileName || "el niño"}" en FocusPlay.

Últimas respuestas a situaciones sociales:
${historyText}

Tiempo de respuesta promedio: ${Math.round(avgResponseTime || 0)}ms
Tasa de error reciente: ${Math.round((errorRate || 0) * 100)}%

Escribe un reporte breve y motivador para sus padres.
- Menciona fortalezas basándote en lo que respondió correctamente.
- Menciona de forma amable áreas para seguir practicando si hubo errores.
- Tono positivo, empático y alentador.
- Máximo 80 palabras. Solo texto, sin listas.`

    try {
      const text = await ollamaGenerate(prompt)
      return NextResponse.json({ report: text || "¡Sigue practicando, lo estás haciendo muy bien!" })
    } catch (err) {
      console.error("Ollama reporte error:", err)
      return NextResponse.json({
        report: `Error: ${err instanceof Error ? err.message : String(err)}`
      })
    }
  }

  // ── 2. Feedback en tiempo real del minijuego Amigos ──────────────────────
  const { situation, chosenOption, isCorrect, staticFeedback } = body

  if (!situation) {
    return NextResponse.json({ feedback: staticFeedback || "¡Sigue así!" })
  }

  const prompt = `Eres el asistente de FocusPlay para niños de 7 años con TEA Grado 1.
Un niño respondió una situación social:

Situación: "${situation}"
Su respuesta: "${chosenOption}"
¿Fue correcta?: ${isCorrect ? "Sí" : "No"}

Escribe UN mensaje de máximo 2 oraciones cortas.
- Si fue correcta: celebra y explica brevemente por qué.
- Si fue incorrecta: explica con amabilidad por qué otra opción sería mejor.
- Lenguaje muy sencillo para un niño de 7 años. Máximo 30 palabras.`

  try {
    const text = await ollamaGenerate(prompt)
    return NextResponse.json({ feedback: text || staticFeedback || "¡Sigue practicando! 🌟" })
  } catch (err) {
    console.error("Ollama feedback error:", err)
    return NextResponse.json({ feedback: staticFeedback || "¡Sigue practicando! 🌟" })
  }
}
