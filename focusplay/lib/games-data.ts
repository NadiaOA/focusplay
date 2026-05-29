// ─────────────────────────────────────────────────────────────────────────────
// lib/games-data.ts  — datos estáticos para los 3 juegos nuevos
// ─────────────────────────────────────────────────────────────────────────────

// ── EMOCIONES ────────────────────────────────────────────────────────────────

export interface EmocionQuestion {
  emoji: string
  label: string          // respuesta correcta
  options: string[]      // 4 opciones (incluye la correcta)
  situation?: string     // frase de contexto opcional
}

export interface EmocionLevel {
  level: 1 | 2 | 3
  totalQuestions: number
  timeSeconds: number
  questions: EmocionQuestion[]
}

export const EMOCION_LEVELS: Record<1 | 2 | 3, EmocionLevel> = {
  1: {
    level: 1,
    totalQuestions: 5,
    timeSeconds: 60,
    questions: [
      { emoji: "😊", label: "feliz",    options: ["feliz", "triste", "enojado", "asustado"] },
      { emoji: "😢", label: "triste",   options: ["feliz", "triste", "sorprendido", "cansado"] },
      { emoji: "😠", label: "enojado",  options: ["enojado", "feliz", "emocionado", "nervioso"] },
      { emoji: "😨", label: "asustado", options: ["asustado", "triste", "enojado", "aburrido"] },
      { emoji: "😴", label: "cansado",  options: ["cansado", "feliz", "asustado", "enojado"] },
    ],
  },
  2: {
    level: 2,
    totalQuestions: 7,
    timeSeconds: 75,
    questions: [
      { emoji: "😊", label: "feliz",         options: ["feliz", "orgulloso", "emocionado", "satisfecho"],
        situation: "Terminé mi tarea favorita" },
      { emoji: "😢", label: "triste",        options: ["triste", "decepcionado", "nervioso", "solitario"],
        situation: "Mi amigo no quiso jugar conmigo" },
      { emoji: "😠", label: "enojado",       options: ["enojado", "frustrado", "molesto", "impaciente"],
        situation: "Alguien tomó mi juguete sin pedir permiso" },
      { emoji: "😨", label: "asustado",      options: ["asustado", "sorprendido", "nervioso", "inquieto"],
        situation: "Escuché un ruido fuerte de noche" },
      { emoji: "🤩", label: "emocionado",    options: ["emocionado", "feliz", "orgulloso", "contento"],
        situation: "Mañana es mi cumpleaños" },
      { emoji: "😳", label: "avergonzado",   options: ["avergonzado", "asustado", "triste", "nervioso"],
        situation: "Me caí frente a todos mis compañeros" },
      { emoji: "😌", label: "tranquilo",     options: ["tranquilo", "cansado", "aburrido", "contento"],
        situation: "Escucho música suave antes de dormir" },
    ],
  },
  3: {
    level: 3,
    totalQuestions: 8,
    timeSeconds: 90,
    questions: [
      { emoji: "😤", label: "frustrado",    options: ["frustrado", "enojado", "impaciente", "decepcionado"],
        situation: "Intenté 5 veces pero no puedo resolver el rompecabezas" },
      { emoji: "🥺", label: "decepcionado", options: ["decepcionado", "triste", "solitario", "avergonzado"],
        situation: "Esperaba un regalo pero no llegó" },
      { emoji: "😬", label: "nervioso",     options: ["nervioso", "asustado", "inquieto", "tenso"],
        situation: "Tengo que hablar frente a la clase mañana" },
      { emoji: "🥳", label: "orgulloso",    options: ["orgulloso", "feliz", "emocionado", "contento"],
        situation: "Gané la competencia de matemáticas" },
      { emoji: "😒", label: "aburrido",     options: ["aburrido", "tranquilo", "cansado", "indiferente"],
        situation: "Llevo una hora esperando sin hacer nada" },
      { emoji: "🤗", label: "cariñoso",     options: ["cariñoso", "feliz", "emocionado", "tranquilo"],
        situation: "Mi perro me da un abrazo cuando llego" },
      { emoji: "😰", label: "angustiado",   options: ["angustiado", "nervioso", "asustado", "preocupado"],
        situation: "No encuentro mi mochila y ya es hora de ir" },
      { emoji: "😏", label: "satisfecho",   options: ["satisfecho", "orgulloso", "tranquilo", "seguro"],
        situation: "Terminé todo mi trabajo antes de tiempo" },
    ],
  },
}

// ── RESPIRACIÓN ───────────────────────────────────────────────────────────────

export interface BreathPhase {
  label: string    // "Inhala", "Mantén", "Exhala"
  seconds: number
  color: string
}

export interface RespiracionLevel {
  level: 1 | 2 | 3
  rounds: number          // cuántas rondas completas
  phases: BreathPhase[]
  tip: string
}

export const RESPIRACION_LEVELS: Record<1 | 2 | 3, RespiracionLevel> = {
  1: {
    level: 1,
    rounds: 3,
    tip: "Respira siguiendo el círculo 🫧",
    phases: [
      { label: "Inhala",  seconds: 4, color: "#4ECDC4" },
      { label: "Exhala",  seconds: 4, color: "#FF6B6B" },
    ],
  },
  2: {
    level: 2,
    rounds: 4,
    tip: "Respiración 4-4-4: inhala, mantén y exhala 🌬️",
    phases: [
      { label: "Inhala",  seconds: 4, color: "#4ECDC4" },
      { label: "Mantén",  seconds: 4, color: "#FFD166" },
      { label: "Exhala",  seconds: 4, color: "#FF6B6B" },
    ],
  },
  3: {
    level: 3,
    rounds: 5,
    tip: "Respiración 4-7-8: técnica de relajación profunda 🧘",
    phases: [
      { label: "Inhala",  seconds: 4, color: "#4ECDC4" },
      { label: "Mantén",  seconds: 7, color: "#FFD166" },
      { label: "Exhala",  seconds: 8, color: "#FF6B6B" },
    ],
  },
}

// ── SIMÓN DICE ────────────────────────────────────────────────────────────────

export interface SimonColor {
  id: string
  label: string
  bg: string        // color de fondo activo
  dim: string       // color apagado
  sound: number     // frecuencia Hz para AudioContext
}

export interface SimonLevel {
  level: 1 | 2 | 3
  startLength: number   // longitud inicial de la secuencia
  maxLength: number     // longitud máxima a alcanzar para ganar
  flashMs: number       // ms que dura cada destello
  pauseMs: number       // ms entre destellos
}

export const SIMON_COLORS: SimonColor[] = [
  { id: "red",    label: "Rojo",    bg: "#FF6B6B", dim: "#5C2020", sound: 261 },
  { id: "green",  label: "Verde",   bg: "#52C97E", dim: "#1A4D2E", sound: 329 },
  { id: "blue",   label: "Azul",    bg: "#4ECDC4", dim: "#1A4D48", sound: 392 },
  { id: "yellow", label: "Amarillo",bg: "#FFD166", dim: "#4D3B00", sound: 523 },
]

export const SIMON_LEVELS: Record<1 | 2 | 3, SimonLevel> = {
  1: { level: 1, startLength: 2, maxLength: 5,  flashMs: 600, pauseMs: 400 },
  2: { level: 2, startLength: 3, maxLength: 7,  flashMs: 450, pauseMs: 300 },
  3: { level: 3, startLength: 4, maxLength: 10, flashMs: 300, pauseMs: 200 },
}