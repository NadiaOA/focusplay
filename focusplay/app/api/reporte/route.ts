
// app/api/reporte/route.ts
// Versión local con Ollama — no requiere API key ni conexión a internet.
// Requiere: ollama corriendo en localhost:11434 con gemma3:4b instalado.
//
// Instalar:  ollama pull gemma3:4b
// Verificar: curl http://localhost:11434/api/tags
 
import { NextRequest, NextResponse } from "next/server"
 
export interface ReporteRequest {
  childName:   string
  statsText:   string   // salida de statsToPromptText()
  weeklyStats: object
}
 
export interface ReporteResponse {
  report: {
    resumen:         string
    juegoFavorito:   string
    logros:          string[]
    areasDeApoyo:    string[]
    recomendacion:   string
    fraseDeLaSemana: string
  }
  raw: string
}
 
// ── Config ────────────────────────────────────────────────────────────────────
 
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434"
const MODEL      = process.env.OLLAMA_MODEL ?? "gemma3:4b"
 
// ── Prompt ────────────────────────────────────────────────────────────────────
// Ollama no tiene "system" separado en /api/generate, así que lo incrustamos
// directamente en el prompt con el formato que entienden los modelos de chat.
 
function buildPrompt(childName: string, statsText: string): string {
  return `Eres un asistente especializado en desarrollo infantil y neurodiversidad (TEA grado 1).
Recibirás estadísticas de juego de una aplicación terapéutica llamada FocusPlay usada por un niño con TEA.
Tu tarea es generar un reporte semanal cálido y útil dirigido a sus padres o terapeuta.
 
Reglas importantes:
- Usa lenguaje simple y empático, sin tecnicismos.
- Celebra los logros antes de mencionar áreas de mejora.
- Tiempo de respuesta alto (mayor a 3000ms) indica distracción o fatiga, no lentitud cognitiva.
- Nunca uses términos negativos sobre el niño. Usa "área de oportunidad" o "seguir practicando".
- La frase para el niño debe ser motivadora y en primera persona del plural.
- Responde ÚNICAMENTE con JSON válido, sin explicaciones, sin bloques de código, sin texto adicional.
 
Estructura JSON requerida:
{
  "resumen": "2 o 3 oraciones generales sobre la semana",
  "juegoFavorito": "nombre del juego con mejor desempeño y una observación",
  "logros": ["logro concreto 1", "logro concreto 2", "logro concreto 3"],
  "areasDeApoyo": ["área a trabajar 1", "área a trabajar 2"],
  "recomendacion": "un consejo práctico específico para esta semana",
  "fraseDeLaSemana": "frase motivadora corta para el niño"
}
 
Datos de la semana para ${childName}:
 
${statsText}
 
Responde solo con el JSON:`.trim()
}
 
// ── Handler ───────────────────────────────────────────────────────────────────
 
export async function POST(req: NextRequest) {
  try {
    const body: ReporteRequest = await req.json()
    const { childName, statsText } = body
 
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
 
    const prompt = buildPrompt(childName, statsText)
 
    // Llamada a Ollama — usamos /api/generate con stream: false
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model:  MODEL,
        prompt,
        stream: false,
        options: {
          temperature:  0.3,   // bajo para respuestas consistentes
          num_predict:  800,   // máximo de tokens generados
          top_p:        0.9,
          repeat_penalty: 1.1,
        },
      }),
      // Timeout generoso: en CPU puede tardar 30-60s
      signal: AbortSignal.timeout(120_000),
    })
 
    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text()
      console.error("Ollama error:", errText)
 
      // Error común: modelo no instalado
      if (ollamaRes.status === 404) {
        return NextResponse.json(
          { error: `Modelo "${MODEL}" no encontrado. Ejecuta: ollama pull ${MODEL}` },
          { status: 404 }
        )
      }
      return NextResponse.json({ error: "Error al generar con Ollama" }, { status: 502 })
    }
 
    const ollamaData = await ollamaRes.json()
    const rawText: string = ollamaData.response ?? ""
 
    // Parsear el JSON de la respuesta
    // Los modelos locales a veces añaden texto antes/después del JSON
    let report: ReporteResponse["report"]
    try {
      // Extraer el primer bloque JSON que encuentre en la respuesta
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("No se encontró JSON en la respuesta")
 
      const cleaned = jsonMatch[0]
        .replace(/```json|```/g, "")  // por si añade backticks
        .trim()
 
      report = JSON.parse(cleaned)
 
      // Validar que tenga los campos mínimos esperados
      if (!report.resumen || !report.logros || !report.areasDeApoyo) {
        throw new Error("JSON incompleto")
      }
 
      // Normalizar: asegurarse de que logros y areasDeApoyo sean arrays
      if (!Array.isArray(report.logros))      report.logros      = [String(report.logros)]
      if (!Array.isArray(report.areasDeApoyo)) report.areasDeApoyo = [String(report.areasDeApoyo)]
 
    } catch (parseErr) {
      console.error("Parse error:", parseErr, "\nRaw:", rawText)
      // Devolver el texto crudo como resumen si no se puede parsear
      report = {
        resumen:         rawText.slice(0, 300),
        juegoFavorito:   "",
        logros:          ["El niño completó sesiones de juego esta semana."],
        areasDeApoyo:    ["Continuar con la práctica regular."],
        recomendacion:   "Mantener una rutina de juego diaria de 10 a 15 minutos.",
        fraseDeLaSemana: "¡Cada vez lo hacemos mejor!",
      }
    }
 
    return NextResponse.json({ report, raw: rawText } satisfies ReporteResponse)
 
  } catch (err: any) {
    // Timeout
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      return NextResponse.json(
        { error: "La IA tardó demasiado. En CPU puede tomar hasta 60 segundos, intenta de nuevo." },
        { status: 504 }
      )
    }
    console.error("reporte/route error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}