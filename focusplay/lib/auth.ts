// lib/auth.ts  — versión con soporte de cookie para el middleware
// En producción: reemplaza simpleHash() con bcrypt y usa JWT/sesión de servidor

export interface Account {
  id: string
  username: string
  email: string
  passwordHash: string
  createdAt: string
}

const ACCOUNTS_KEY = "focusplay_accounts"
const SESSION_KEY  = "focusplay_session"   // también se escribe como cookie

// ── "Hash" de demo (en prod usar bcrypt / argon2) ────────────────────────────
function simpleHash(str: string): string {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

// ── CRUD de cuentas ───────────────────────────────────────────────────────────
function getAccounts(): Account[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(ACCOUNTS_KEY)
  return raw ? (JSON.parse(raw) as Account[]) : []
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

// ── Sesión (localStorage + cookie para que el middleware la lea) ──────────────
function startSession(accountId: string) {
  localStorage.setItem(SESSION_KEY, accountId)
  document.cookie = `focusplay_session=${accountId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  document.cookie = "focusplay_session=; path=/; max-age=0"
}

// ── API pública ───────────────────────────────────────────────────────────────

export type AuthResult =
  | { ok: true;  account: Account }
  | { ok: false; error: string }

export function register(username: string, email: string, password: string): AuthResult {
  const accounts  = getAccounts()
  const emailNorm = email.trim().toLowerCase()

  if (!username.trim() || username.trim().length < 2)
    return { ok: false, error: "El nombre debe tener al menos 2 caracteres." }
  if (!emailNorm.includes("@") || !emailNorm.includes("."))
    return { ok: false, error: "Ingresa un correo válido." }
  if (password.length < 6)
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." }
  if (accounts.find(a => a.email === emailNorm))
    return { ok: false, error: "Ya existe una cuenta con ese correo." }

  const account: Account = {
    id:           crypto.randomUUID(),
    username:     username.trim(),
    email:        emailNorm,
    passwordHash: simpleHash(password),
    createdAt:    new Date().toISOString(),
  }

  saveAccounts([...accounts, account])
  startSession(account.id)
  return { ok: true, account }
}

export function login(email: string, password: string): AuthResult {
  const emailNorm = email.trim().toLowerCase()

  if (!emailNorm || !password)
    return { ok: false, error: "Completa todos los campos." }

  const account = getAccounts().find(a => a.email === emailNorm)
  if (!account)
    return { ok: false, error: "No encontramos esa cuenta." }

  if (account.passwordHash !== simpleHash(password))
    return { ok: false, error: "Contraseña incorrecta." }

  startSession(account.id)
  return { ok: true, account }
}

export function logout() {
  if (typeof window === "undefined") return
  clearSession()
}

export function getSession(): Account | null {
  if (typeof window === "undefined") return null
  const id = localStorage.getItem(SESSION_KEY)
  if (!id) return null
  return getAccounts().find(a => a.id === id) ?? null
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}