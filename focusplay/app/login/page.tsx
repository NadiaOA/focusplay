"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { login, register, isAuthenticated } from "@/lib/auth"
import { saveProfile, getProfile } from "@/lib/store"

type Mode = "login" | "register"

export default function LoginPage() {
  const router = useRouter()
  const [mode,     setMode]     = useState<Mode>("login")
  const [username, setUsername] = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [shake,    setShake]    = useState(false)
  const [success,  setSuccess]  = useState(false)
  const firstRef = useRef<HTMLInputElement>(null)

  // Si ya hay sesión, redirigir al inicio
  useEffect(() => {
    if (isAuthenticated()) router.replace("/")
  }, [router])

  // Focus al primer campo cuando cambia el modo
  useEffect(() => {
    firstRef.current?.focus()
  }, [mode])

  function switchMode(m: Mode) {
    setMode(m)
    setError("")
    setUsername("")
    setEmail("")
    setPassword("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simular pequeña latencia para feedback visual
    await new Promise(r => setTimeout(r, 400))

    let result
    if (mode === "login") {
      result = login(email, password)
    } else {
      result = register(username, email, password)
      if (result.ok) {
        // Inicializar perfil de juego con el nombre del nuevo usuario
        const profile = getProfile()
        saveProfile({ ...profile, name: result.account.username })
      }
    }

    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    // Éxito 🎉
    setSuccess(true)
    setTimeout(() => router.replace("/"), 800)
  }

  return (
    <div style={s.root}>
      {/* Decoración de fondo */}
      <div style={s.blob1} />
      <div style={s.blob2} />

      <div style={{ ...s.card, ...(shake ? s.cardShake : {}), ...(success ? s.cardSuccess : {}) }}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <span style={s.logoIcon}>🎮</span>
          <span style={s.logoText}>FocusPlay</span>
        </div>
        <p style={s.tagline}>Entrena tu mente, nivel a nivel</p>

        {/* Tabs */}
        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(mode === "login"    ? s.tabActive : {}) }}
            onClick={() => switchMode("login")}
            type="button"
          >
            Iniciar sesión
          </button>
          <button
            style={{ ...s.tab, ...(mode === "register" ? s.tabActive : {}) }}
            onClick={() => switchMode("register")}
            type="button"
          >
            Crear cuenta
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={s.form} noValidate>

          {mode === "register" && (
            <Field
              ref={firstRef}
              label="¿Cómo te llamamos?"
              type="text"
              placeholder="Tu nombre o apodo"
              value={username}
              onChange={setUsername}
              icon="😄"
              autoComplete="nickname"
            />
          )}

          <Field
            ref={mode === "login" ? firstRef : undefined}
            label="Correo electrónico"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={setEmail}
            icon="✉️"
            autoComplete="email"
          />

          <div style={s.fieldWrap}>
            <label style={s.label}>Contraseña</label>
            <div style={s.pwdRow}>
              <input
                style={s.input}
                type={showPwd ? "text" : "password"}
                placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Tu contraseña"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
                aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" style={{ ...s.submitBtn, ...(loading ? s.submitLoading : {}) }} disabled={loading || success}>
            {success
              ? "✅ ¡Entrando!"
              : loading
              ? <span style={s.spinner} />
              : mode === "login" ? "¡ Entrar a jugar !" : "¡ Crear mi cuenta !"}
          </button>
        </form>

        {/* Pie */}
        <p style={s.footer}>
          {mode === "login"
            ? <>¿Sin cuenta aún?{" "}
                <span style={s.link} onClick={() => switchMode("register")}>Regístrate gratis</span>
              </>
            : <>¿Ya tienes cuenta?{" "}
                <span style={s.link} onClick={() => switchMode("login")}>Inicia sesión</span>
              </>}
        </p>
      </div>
    </div>
  )
}

// ── Campo reutilizable ────────────────────────────────────────────────────────
import React from "react"

const Field = React.forwardRef<HTMLInputElement, {
  label: string; type: string; placeholder: string
  value: string; onChange: (v: string) => void
  icon: string; autoComplete?: string
}>(function Field({ label, type, placeholder, value, onChange, icon, autoComplete }, ref) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{label}</label>
      <div style={{ ...s.inputWrap, ...(focused ? s.inputWrapFocus : {}) }}>
        <span style={s.inputIcon}>{icon}</span>
        <input
          ref={ref}
          style={s.inputInner}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
        />
      </div>
    </div>
  )
})

// ── Estilos ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  // Blobs decorativos
  blob1: {
    position: "absolute",
    width: 500, height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(78,205,196,0.12) 0%, transparent 70%)",
    top: -150, left: -150,
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    width: 400, height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 70%)",
    bottom: -100, right: -100,
    pointerEvents: "none",
  },
  // Card
  card: {
    position: "relative",
    zIndex: 1,
    background: "var(--bg2)",
    border: "1px solid rgba(78,205,196,0.25)",
    borderRadius: 24,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(78,205,196,0.1)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  cardShake: {
    animation: "shake 0.4s ease",
  },
  cardSuccess: {
    boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 30px rgba(78,205,196,0.3)",
    borderColor: "rgba(78,205,196,0.6)",
  },
  // Logo
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 6,
  },
  logoIcon: { fontSize: 36 },
  logoText: {
    fontSize: 30,
    fontWeight: 700,
    color: "var(--teal)",
    letterSpacing: "-0.5px",
  },
  tagline: {
    textAlign: "center",
    fontSize: 13,
    color: "var(--muted)",
    marginBottom: 28,
  },
  // Tabs
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    gap: 4,
  },
  tab: {
    padding: "10px 0",
    borderRadius: 9,
    background: "transparent",
    color: "var(--muted)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    border: "none",
  },
  tabActive: {
    background: "rgba(78,205,196,0.15)",
    color: "var(--teal)",
    fontWeight: 600,
    boxShadow: "inset 0 0 0 1px rgba(78,205,196,0.3)",
  },
  // Formulario
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 7 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--text)", opacity: 0.8 },
  // Input con ícono
  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputWrapFocus: {
    borderColor: "rgba(78,205,196,0.5)",
    boxShadow: "0 0 0 3px rgba(78,205,196,0.1)",
  },
  inputIcon: {
    padding: "0 12px",
    fontSize: 16,
    lineHeight: 1,
    opacity: 0.7,
    flexShrink: 0,
  },
  inputInner: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    padding: "13px 14px 13px 0",
    fontSize: 15,
    color: "var(--white)",
    fontFamily: "inherit",
    width: "100%",
  },
  // Input contraseña (sin ícono de prefijo, tiene botón ojo)
  input: {
    flex: 1,
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "12px 0 0 12px",
    outline: "none",
    padding: "13px 14px",
    fontSize: 15,
    color: "var(--white)",
    fontFamily: "inherit",
    width: "100%",
    transition: "border-color 0.2s",
  },
  pwdRow: { display: "flex" },
  eyeBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderLeft: "none",
    borderRadius: "0 12px 12px 0",
    padding: "0 14px",
    fontSize: 16,
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.15s",
  },
  // Error
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,107,107,0.12)",
    border: "1px solid rgba(255,107,107,0.3)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#FF8F8F",
  },
  // Botón submit
  submitBtn: {
    marginTop: 4,
    background: "var(--teal)",
    color: "#1C2B3A",
    border: "none",
    borderRadius: 14,
    padding: "15px 0",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "opacity 0.2s, transform 0.1s",
    letterSpacing: "0.3px",
  },
  submitLoading: { opacity: 0.7, cursor: "default" },
  spinner: {
    width: 18, height: 18,
    border: "2px solid rgba(28,43,58,0.3)",
    borderTop: "2px solid #1C2B3A",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  // Pie
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 13,
    color: "var(--muted)",
  },
  link: {
    color: "var(--teal)",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
}