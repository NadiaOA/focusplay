// lib/store.ts
// Almacenamiento en memoria del lado del cliente (localStorage)
// En producción esto iría a una base de datos
import { getSession } from "./auth"

export interface ActivityLog {
  date: string
  situation: string
  isCorrect: boolean
  responseTime: number
}

export interface UserProfile {
  name: string
  gems: number
  concentracionLevel: number
  concentracionProgress: number // 0-100
  amigosLevel: number
  amigosProgress: number // 0-100
  emocionesLevel: number
  emocionesProgress: number   // 0-100
  respiracionLevel: number
  respiracionProgress: number // 0-100
  simonLevel: number
  simonProgress: number 
  
  // Configuración del avatar
  avatar: {
    base: string      // ej: "boy", "girl", "neutral"
    skinTone: string  // ej: "light", "medium", "dark"
    color: string     // color favorito para fondo o ropa
    hairColor?: string
    equippedHat?: string | null
    equippedGlasses?: string | null
    equippedBackground?: string | null
  }
  unlockedRewards?: string[]
  // Métricas para la IA
  avgResponseTime: number   // ms promedio de respuesta
  errorRate: number         // % errores recientes
  sessionMinutes: number    // minutos jugados hoy
  lastActivity: string      // timestamp
  prefersFastGames: boolean
  activityHistory?: ActivityLog[]
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Fidel",
  gems: 500,
  concentracionLevel: 1,
  concentracionProgress: 0,
  amigosLevel: 1,
  amigosProgress: 0,
  emocionesLevel: 1,
  emocionesProgress: 0,
  respiracionLevel: 1,
  respiracionProgress: 0,
  simonLevel: 1,
  simonProgress: 0,
  avatar: {
    base: "neutral",
    skinTone: "medium",
    color: "#4ECDC4", // color 'teal' por defecto
    hairColor: "#2B221E",
    equippedHat: null,
    equippedGlasses: null,
    equippedBackground: null,
  },
  unlockedRewards: [],
  avgResponseTime: 2000,
  errorRate: 0.15,
  sessionMinutes: 0,
  lastActivity: new Date().toISOString(),
  prefersFastGames: true,
  activityHistory: [],
}

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE
  
  const session = getSession()
  const storageKey = session ? `focusplay_profile_${session.id}` : "focusplay_profile"
  
  const raw = localStorage.getItem(storageKey)
  if (!raw) {
    const newProfile = { ...DEFAULT_PROFILE, name: session ? session.username : DEFAULT_PROFILE.name }
    localStorage.setItem(storageKey, JSON.stringify(newProfile))
    return newProfile
  }
  return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
}

export function getCurrentUser(): string | null {
  const session = getSession()
  return session ? session.username : null
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") return
  const session = getSession()
  const storageKey = session ? `focusplay_profile_${session.id}` : "focusplay_profile"
  localStorage.setItem(storageKey, JSON.stringify(profile))
}

export function addGems(n: number) {
  const p = getProfile()
  p.gems += n
  saveProfile(p)
  return p.gems
}

export function recordActivity(responseTimeMs: number, isError: boolean, situation?: string) {
  const p = getProfile()
  // Smooth average
  p.avgResponseTime = Math.round(p.avgResponseTime * 0.7 + responseTimeMs * 0.3)
  p.errorRate = p.errorRate * 0.8 + (isError ? 0.2 : 0)
  p.lastActivity = new Date().toISOString()

  if (situation) {
    if (!p.activityHistory) p.activityHistory = []
    p.activityHistory.push({
      date: new Date().toISOString(),
      situation,
      isCorrect: !isError,
      responseTime: responseTimeMs
    })
    // Mantener sólo las últimas 20 actividades para no saturar el prompt de la IA
    if (p.activityHistory.length > 20) p.activityHistory.shift()
  }

  saveProfile(p)
}

// Registra el resultado de un juego de concentración.
// `name` se acepta por compatibilidad, pero la función opera sobre la sesión actual.
export function recordConcentracionResult(_name: string, won: boolean, stars: number) {
  const p = getProfile()
  let leveledUp = false

  if (won) {
    // Añade gemas
    p.gems += stars
    // Incrementa progreso (arbitrario: cada estrella vale 20%)
    p.concentracionProgress = (p.concentracionProgress ?? 0) + stars * 20
    if (p.concentracionProgress >= 100) {
      p.concentracionLevel = Math.min(3, (p.concentracionLevel ?? 1) + 1)
      p.concentracionProgress = 0
      leveledUp = true
    }
  } else {
    // Penaliza ligeramente por pérdida
    p.gems = Math.max(0, p.gems - 1)
    p.concentracionProgress = Math.max(0, (p.concentracionProgress ?? 0) - 10)
  }

  saveProfile(p)
  return { profile: p, leveledUp }
}

// IA básica: devuelve el nivel de dificultad recomendado (1-3)
export function getAIDifficulty(): { level: number; reason: string } {
  const p = getProfile()
  const slowResponse = p.avgResponseTime > 4000
  const highErrors = p.errorRate > 0.4
  const tiredSession = p.sessionMinutes > 10

  if (slowResponse || highErrors || tiredSession) {
    return { level: 1, reason: "Detecté que estás cansado. ¡Vamos más despacio! 😊" }
  }
  if (p.avgResponseTime < 1500 && p.errorRate < 0.1) {
    return { level: 3, reason: "¡Estás muy concentrado hoy! Subimos la dificultad 🚀" }
  }
  return { level: 2, reason: "Dificultad ajustada a tu ritmo de hoy ⭐" }
}
