import { getProfile, saveProfile } from "./store"
 
// ── Emociones ────────────────────────────────────────────────────────────────
export function recordEmocionesResult(_name: string, won: boolean, stars: number) {
  const p = getProfile() as any
  if (!p.emocionesLevel)   p.emocionesLevel   = 1
  if (!p.emocionesProgress) p.emocionesProgress = 0
  let leveledUp = false
 
  if (won) {
    p.gems             += stars
    p.emocionesProgress = (p.emocionesProgress ?? 0) + stars * 20
    if (p.emocionesProgress >= 100) {
      p.emocionesLevel    = Math.min(3, (p.emocionesLevel ?? 1) + 1)
      p.emocionesProgress = 0
      leveledUp           = true
    }
  } else {
    p.gems              = Math.max(0, p.gems - 1)
    p.emocionesProgress = Math.max(0, (p.emocionesProgress ?? 0) - 10)
  }
 
  saveProfile(p)
  return { profile: p, leveledUp }
}
 
// ── Respiración ───────────────────────────────────────────────────────────────
export function recordRespiracionResult(_name: string, won: boolean, stars: number) {
  const p = getProfile() as any
  if (!p.respiracionLevel)    p.respiracionLevel    = 1
  if (!p.respiracionProgress) p.respiracionProgress = 0
  let leveledUp = false
 
  if (won) {
    p.gems               += stars
    p.respiracionProgress = (p.respiracionProgress ?? 0) + stars * 20
    if (p.respiracionProgress >= 100) {
      p.respiracionLevel    = Math.min(3, (p.respiracionLevel ?? 1) + 1)
      p.respiracionProgress = 0
      leveledUp             = true
    }
  } else {
    p.gems               = Math.max(0, p.gems - 1)
    p.respiracionProgress = Math.max(0, (p.respiracionProgress ?? 0) - 10)
  }
 
  saveProfile(p)
  return { profile: p, leveledUp }
}
 
// ── Simón ─────────────────────────────────────────────────────────────────────
export function recordSimonResult(_name: string, won: boolean, stars: number) {
  const p = getProfile() as any
  if (!p.simonLevel)    p.simonLevel    = 1
  if (!p.simonProgress) p.simonProgress = 0
  let leveledUp = false
 
  if (won) {
    p.gems        += stars
    p.simonProgress = (p.simonProgress ?? 0) + stars * 20
    if (p.simonProgress >= 100) {
      p.simonLevel    = Math.min(3, (p.simonLevel ?? 1) + 1)
      p.simonProgress = 0
      leveledUp       = true
    }
  } else {
    p.gems        = Math.max(0, p.gems - 1)
    p.simonProgress = Math.max(0, (p.simonProgress ?? 0) - 10)
  }
 
  saveProfile(p)
  return { profile: p, leveledUp }
}