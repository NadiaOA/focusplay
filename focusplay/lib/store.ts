// lib/store.ts
// Almacenamiento en memoria del lado del cliente (localStorage)
// En producción esto iría a una base de datos
import { getSession } from "./auth"

export interface UserProfile {
  name: string
  gems: number
  concentracionLevel: number
  concentracionProgress: number // 0-100
  amigosLevel: number
  amigosProgress: number // 0-100
  // Configuración del avatar
  avatar: {
    base: string      // ej: "boy", "girl", "neutral"
    skinTone: string  // ej: "light", "medium", "dark"
    color: string     // color favorito para fondo o ropa
    hairColor?: string
    equippedHat?: string | null
    equippedGlasses?: string | null
  }
  unlockedRewards?: string[]
  // Métricas para la IA
  avgResponseTime: number   // ms promedio de respuesta
  errorRate: number         // % errores recientes
  sessionMinutes: number    // minutos jugados hoy
  lastActivity: string      // timestamp
  prefersFastGames: boolean
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Fidel",
  gems: 40,
  concentracionLevel: 1,
  concentracionProgress: 0,
  amigosLevel: 1,
  amigosProgress: 0,
  avatar: {
    base: "neutral",
    skinTone: "medium",
    color: "#4ECDC4", // color 'teal' por defecto
    hairColor: "#2B221E",
    equippedHat: null,
    equippedGlasses: null,
  },
  unlockedRewards: [],
  avgResponseTime: 2000,
  errorRate: 0.15,
  sessionMinutes: 0,
  lastActivity: new Date().toISOString(),
  prefersFastGames: true,
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

export function recordActivity(responseTimeMs: number, isError: boolean) {
  const p = getProfile()
  // Smooth average
  p.avgResponseTime = Math.round(p.avgResponseTime * 0.7 + responseTimeMs * 0.3)
  p.errorRate = p.errorRate * 0.8 + (isError ? 0.2 : 0)
  p.lastActivity = new Date().toISOString()
  saveProfile(p)
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
