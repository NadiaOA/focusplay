import { NextRequest, NextResponse } from "next/server"

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434"
const MODEL      = process.env.OLLAMA_MODEL ?? "phi3:mini"

async function ollamaGenerate(prompt: string, numPredict = 150): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:  MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.4,
        num_predict: numPredict,
        top_p:       0.9,
      },
    }),
    signal: AbortSignal.timeout(45_000),
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

    const items: any[] = Array.isArray(history) ? history : []
    const total     = items.length
    const correctas = items.filter((i) => i.isCorrect).length

    const aciertoPct = total > 0 ? Math.round((correctas / total) * 100) : 0

    // Listas de situaciones específicas, para que el modelo pueda citarlas
    const situacionesOk = items
      .filter((i) => i.isCorrect)
      .map((i) => `"${i.situation}"`)
      .slice(0, 5)
      .join(", ")

    const situacionesAreas = items
      .filter((i) => !i.isCorrect)
      .map((i) => `"${i.situation}" (eligió: "${i.chosenOption ?? "—"}")`)
      .slice(0, 5)
      .join(", ")

    const avgMs = Math.round(avgResponseTime || 0)
    const errPct = Math.round((errorRate || 0) * 100)

    // ── Llamada 1: "Lo que hizo" — corta, con datos concretos ────────────────
    const promptLoQueHizo = `Eres un psicopedagogo experto en TEA Grado 1.
Evalúas el progreso de un niño de 7 años llamado "${profileName || "el niño"}" en el módulo "Amigos" de FocusPlay, donde practica situaciones sociales.

Datos de la sesión:
- Total de situaciones respondidas: ${total}
- Respuestas correctas: ${correctas} de ${total} (${aciertoPct}%)
- Tiempo de respuesta promedio: ${avgMs}ms (más de 3000ms puede indicar que se tomó su tiempo para pensar, no necesariamente dificultad)
- Tasa de error reciente: ${errPct}%

Situaciones donde respondió correctamente: ${situacionesOk || "ninguna registrada"}
Situaciones que son área de oportunidad: ${situacionesAreas || "ninguna registrada"}

Escribe 2-3 oraciones cortas, en texto plano (sin listas, sin títulos), que resuman el desempeño con el dato general (ej. "respondió correctamente X de Y situaciones, un Z%"), mencionando 1 situación concreta donde respondió bien (cita la situación entre comillas) y, si hubo errores, 1 situación concreta como área de oportunidad (cita la situación, usa "área de oportunidad" o "sigamos practicando", nunca palabras negativas). Si no hubo errores, dilo de forma breve y positiva.
Tono cálido y alentador. Máximo 60 palabras.

Escribe el resumen ahora:`

    // ── Llamada 2: "Sugerencias para casa" — basada en el resumen anterior ──
    const promptSugerencias = (loQueHizo: string): string => {
      return `Eres un psicopedagogo experto en TEA Grado 1.
Este es el resumen de la sesión de "${profileName || "el niño"}" en el módulo "Amigos" de FocusPlay:

"${loQueHizo}"

Escribe 1-2 actividades breves y concretas que los padres puedan hacer en casa con el niño, relacionadas con lo descrito arriba, indicando brevemente cómo guiarlas.
Responde SOLO con texto plano (sin listas, sin títulos), máximo 50 palabras, tono cálido y alentador.

Escribe las sugerencias ahora:`
    }

    let loQueHizo = ""
    let sugerenciasParaCasa = ""

    try {
      loQueHizo = await ollamaGenerate(promptLoQueHizo, 280)
      sugerenciasParaCasa = await ollamaGenerate(promptSugerencias(loQueHizo), 200)

      const report = `Lo que hizo: ${loQueHizo}\n\nSugerencias para casa: ${sugerenciasParaCasa}`
      return NextResponse.json({ report })
    } catch (err) {
      console.error("Ollama reporte error:", err)

      // Si al menos tenemos "Lo que hizo", devolvemos un reporte parcial
      if (loQueHizo) {
        const report = `Lo que hizo: ${loQueHizo}\n\nSugerencias para casa: Mantener sesiones cortas de práctica social, 10 minutos al día, repasando juntos las situaciones del juego.`
        return NextResponse.json({ report })
      }

      return NextResponse.json({
        report: "No se pudo generar el reporte esta vez. Intenta de nuevo en unos segundos."
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