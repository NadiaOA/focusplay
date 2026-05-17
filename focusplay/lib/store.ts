// lib/store.ts
// Almacenamiento en memoria del lado del cliente (localStorage)
// En producción esto iría a una base de datos

export interface UserProfile {
  name: string
  gems: number
  concentracionLevel: number
  concentracionProgress: number // 0-100
  amigosLevel: number
  amigosProgress: number // 0-100
  // Métricas para la IA
  avgResponseTime: number   // ms promedio de respuesta
  errorRate: number         // % errores recientes
  sessionMinutes: number    // minutos jugados hoy
  lastActivity: string      // timestamp
  prefersFastGames: boolean
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Fidel",
  gems: 148,
  concentracionLevel: 2,
  concentracionProgress: 45,
  amigosLevel: 1,
  amigosProgress: 28,
  avgResponseTime: 2000,
  errorRate: 0.15,
  sessionMinutes: 0,
  lastActivity: new Date().toISOString(),
  prefersFastGames: true,
}

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE
  const raw = localStorage.getItem("focusplay_profile")
  if (!raw) {
    localStorage.setItem("focusplay_profile", JSON.stringify(DEFAULT_PROFILE))
    return DEFAULT_PROFILE
  }
  return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") return
  localStorage.setItem("focusplay_profile", JSON.stringify(profile))
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
