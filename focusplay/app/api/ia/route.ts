import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1. Lógica para generar el REPORTE para padres (cuando enviamos "history")
    if (body.history) {
      const { name, history } = body

      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({
          report: "La API Key de Gemini no está configurada. Agrega GEMINI_API_KEY en tu archivo .env.local para ver el reporte de la IA."
        })
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

      const historyText = (history && history.length > 0)
        ? history.map((item: any, index: number) =>
            `${index + 1}. Situación: "${item.situation}" - ¿Respondió bien?: ${item.isCorrect ? "Sí" : "No"}`
          ).join("\n")
        : "No hay datos suficientes todavía."

      const prompt = `Actúa como un psicopedagogo experto en TEA Grado 1.
Estás evaluando el progreso de un niño de 7 años llamado "${name || "el niño"}" en la app FocusPlay.

Aquí están sus últimas respuestas a situaciones sociales:
${historyText}

Escribe un reporte breve y motivador dirigido a sus padres.
- Menciona en qué le fue bien (fortalezas) basándote en lo que respondió correctamente.
- Menciona de forma amable si hay áreas sociales para seguir practicando (si se equivocó).
- Tono positivo, empático y alentador.
- NO uses más de 60 palabras.`

      const result = await model.generateContent(prompt)
      const text = result.response.text() || "Sigue practicando, ¡lo estás haciendo genial!"

      console.log("📝 Reporte generado por Gemini:", text.trim())
      return NextResponse.json({ report: text.trim() })
    }

    // 2. Lógica normal para el FEEDBACK del minijuego
    const { situation, chosenOption, isCorrect, staticFeedback } = body

    // Si no hay API key configurada, devolvemos el feedback estático
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ feedback: staticFeedback })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Eres el asistente de FocusPlay, una app para niños de 7 años con TEA Grado 1.
Un niño respondió una situación social:

Situación: "${situation}"
Su respuesta: "${chosenOption}"
¿Fue correcta?: ${isCorrect ? "Sí" : "No"}

Escribe UN mensaje de retroalimentación de máximo 2 oraciones cortas.
- Si fue correcta: celebra y explica brevemente por qué es buena respuesta.
- Si fue incorrecta: explica de forma amable y simple por qué otra opción sería mejor.
- Usa lenguaje muy sencillo para un niño de 7 años.
- NO uses bullet points ni listas. Solo texto directo.
- Máximo 30 palabras.`

    const result = await model.generateContent(prompt)
    const text = result.response.text() || staticFeedback

    console.log("✅ Respuesta generada por Gemini:", text.trim())
    return NextResponse.json({ feedback: text.trim() })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json({ feedback: "¡Sigue practicando, lo estás haciendo muy bien! 🌟" })
  }
}
