"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { getProfile, UserProfile } from "@/lib/store"
import { logout } from "@/lib/auth"

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    setIsMounted(true)
    setProfile(getProfile())
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  if (!isMounted || !profile) {
    return <main style={S.main} /> // Render empty main during SSR or before profile loads
  }

  return (
    <main style={S.main}>
      <header style={S.header}>
        <h1 style={S.logo}>FocusPlay</h1>
        <div style={S.headerRight}>
          <div style={S.gemsPill}>
            <span style={{ color: "var(--teal)" }}>◆</span>
            <span style={S.gemsNum}>{profile.gems}</span>
          </div>
          <button onClick={handleLogout} style={S.logoutBtn}>Cerrar sesión</button>
        </div>
      </header>
      <div style={S.tealLine} />

      <div style={S.body}>
        <h2 style={S.welcomeTitle}>¡Hola, {profile.name}!</h2>
        <p style={S.welcomeSub}>Selecciona un módulo para empezar:</p>

        <div style={S.modulesGrid}>
          {/* Módulo Concentración */}
          <Link href="/concentracion" style={S.moduleCard}>
            <div style={{...S.moduleIcon, background: 'rgba(255,107,107,0.15)'}}>🧠</div>
            <h3 style={S.moduleTitle}>Concentración</h3>
            <p style={S.moduleDesc}>Ejercita tu memoria y atención.</p>
            <div style={S.progressWrapper}>
              <div style={S.progressBar}><div style={{...S.progressFill, background: 'var(--coral)', width: `${profile.concentracionProgress}%`}}></div></div>
            </div>
          </Link>

          {/* Módulo Amigos */}
          <Link href="/amigos" style={S.moduleCard}>
            <div style={{...S.moduleIcon, background: 'rgba(78,205,196,0.15)'}}>🧑‍🤝‍🧑</div>
            <h3 style={S.moduleTitle}>Amigos</h3>
            <p style={S.moduleDesc}>Practica situaciones sociales.</p>
            <div style={S.progressWrapper}>
              <div style={S.progressBar}><div style={{...S.progressFill, width: `${profile.amigosProgress}%`}}></div></div>
            </div>
          </Link>

          {/* Módulo Recompensas */}
          <Link href="/recompensas" style={S.moduleCard}>
            <div style={{...S.moduleIcon, background: 'rgba(255,209,102,0.15)'}}>🎁</div>
            <h3 style={S.moduleTitle}>Recompensas</h3>
            <p style={S.moduleDesc}>¡Canjea tus gemas por premios!</p>
            <div style={S.progressWrapper}>
              <span style={S.gemsText}>Tienes {profile.gems} gemas para usar</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main:          { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  header:        { padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)" },
  logo:          { fontSize: 20, fontWeight: 700, color: "var(--teal)", margin: 0 },
  headerRight:   { display: "flex", alignItems: "center", gap: 12 },
  logoutBtn:     { background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "var(--coral)", cursor: "pointer", border: "none" },
  gemsPill:      { display: "flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "5px 12px" },
  gemsNum:       { fontSize: 15, fontWeight: 700, color: "var(--teal)" },
  tealLine:      { height: 2, background: "var(--teal)" },
  body:          { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", gap: 16 },
  welcomeTitle:  { fontSize: 32, fontWeight: 700, color: "var(--white)", textAlign: 'center', margin: 0 },
  welcomeSub:    { fontSize: 18, color: "var(--muted)", textAlign: 'center', marginTop: 4 },
  modulesGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px', width: '100%', maxWidth: '900px', marginTop: 32 },
  moduleCard:    { background: 'var(--bg2)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' },
  moduleIcon:    { fontSize: '40px', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  moduleTitle:   { fontSize: '20px', fontWeight: 600, color: 'var(--white)', margin: 0 },
  moduleDesc:    { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5, flexGrow: 1, marginTop: 8, marginBottom: 0 },
  progressWrapper: { width: '100%', marginTop: '16px', height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  progressBar:   { width: '80%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  progressFill:  { height: '100%', background: 'var(--teal)', borderRadius: 3 },
  gemsText:      { fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }
};