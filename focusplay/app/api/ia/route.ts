import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { situation, chosenOption, isCorrect, staticFeedback } = await req.json()

    // Si no hay API key configurada, devolvemos el feedback estático
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ feedback: staticFeedback })
    }

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

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : staticFeedback

    return NextResponse.json({ feedback: text.trim() })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json({ feedback: "¡Sigue practicando, lo estás haciendo muy bien! 🌟" })
  }
}
