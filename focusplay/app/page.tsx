"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getProfile, getAIDifficulty, type UserProfile } from "@/lib/store"
import { getSession, logout } from "@/lib/auth"

export default function Home() {
  const router  = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [aiHint,  setAiHint]  = useState("")

  useEffect(() => {
    // Si no hay sesión activa, redirigir al login
    if (!getSession()) {
      router.replace("/login")
      return
    }
    const p = getProfile()
    setProfile(p)
    setAiHint(getAIDifficulty().reason)
  }, [router])

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  if (!profile) return null

  return (
    <main style={styles.main}>
      {/* ── Top bar ── */}
      <header style={styles.header}>
        <span style={styles.logo}>FocusPlay</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.gemsPill}>
            <span style={styles.gemDiamond}>◆</span>
            <span style={styles.gemsNum}>{profile.gems} gemas</span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">
            🚪
          </button>
        </div>
      </header>
      <div style={styles.tealLine} />

      {/* ── Body ── */}
      <div style={styles.body}>
        <div style={{ textAlign: "center" }}>
          <h1 style={styles.greeting}>¡Hola, {profile.name}! 👋</h1>
          <p style={styles.sub}>¿qué quieres practicar hoy?</p>
        </div>

        <div style={styles.moduleGrid}>
          <ModuleCard
            href="/concentracion"
            icon="🎮"
            title="Concentración"
            desc="juegos de memoria y atención"
            color="var(--teal)"
            border="rgba(78,205,196,0.4)"
            bg="rgba(78,205,196,0.1)"
            progress={profile.concentracionProgress}
            level={profile.concentracionLevel}
          />
          <ModuleCard
            href="/amigos"
            icon="💬"
            title="Amigos"
            desc="practica situaciones del mundo real"
            color="var(--coral)"
            border="rgba(255,107,107,0.35)"
            bg="rgba(255,107,107,0.1)"
            progress={profile.amigosProgress}
            level={profile.amigosLevel}
          />
        </div>

        <Link href="/concentracion" style={styles.playBtn}>
          ¡ Jugar ahora !
        </Link>

        <div style={styles.aiHint}>
          <span style={styles.aiDot} />
          <span style={styles.aiText}>{aiHint}</span>
        </div>
      </div>
    </main>
  )
}

function ModuleCard({
  href, icon, title, desc, color, border, bg, progress, level
}: {
  href: string; icon: string; title: string; desc: string
  color: string; border: string; bg: string; progress: number; level: number
}) {
  return (
    <Link href={href} style={{ ...styles.modCard, background: bg, borderColor: border }}>
      <span style={styles.modIcon}>{icon}</span>
      <span style={{ ...styles.modTitle, color }}>{title}</span>
      <span style={styles.modDesc}>{desc}</span>
      <div style={styles.progressWrap}>
        <div style={{ ...styles.progressBar, background: color, width: `${progress}%` }} />
      </div>
      <span style={{ ...styles.modLevel, color }}>nivel {level}</span>
    </Link>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" },
  header: {
    padding: "14px 24px", display: "flex", alignItems: "center",
    justifyContent: "space-between", background: "var(--bg2)",
  },
  logo: { fontSize: 22, fontWeight: 600, color: "var(--teal)" },
  tealLine: { height: 2, background: "var(--teal)" },
  gemsPill: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)",
    borderRadius: 20, padding: "6px 14px",
  },
  gemDiamond: { color: "var(--teal)", fontSize: 14 },
  gemsNum: { fontSize: 15, fontWeight: 600, color: "var(--teal)" },
  logoutBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "7px 10px",
    fontSize: 16,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  body: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "32px 24px", gap: 28, maxWidth: 720, margin: "0 auto", width: "100%",
  },
  greeting: { fontSize: 32, fontWeight: 700, color: "var(--white)", marginBottom: 6 },
  sub: { fontSize: 16, color: "var(--muted)" },
  moduleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" },
  modCard: {
    borderWidth: 2, borderStyle: "solid", borderRadius: "var(--radius)", padding: "24px 20px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    cursor: "pointer", transition: "transform 0.15s",
  },
  modIcon: { fontSize: 48, lineHeight: 1 },
  modTitle: { fontSize: 18, fontWeight: 600 },
  modDesc: { fontSize: 12, color: "var(--muted)", textAlign: "center", lineHeight: 1.4 },
  progressWrap: {
    width: "100%", background: "rgba(255,255,255,0.08)",
    borderRadius: 6, height: 7, marginTop: 4,
  },
  progressBar: { height: 7, borderRadius: 6, transition: "width 0.4s" },
  modLevel: { fontSize: 11, fontWeight: 600 },
  playBtn: {
    background: "var(--teal)", borderRadius: "var(--radius)",
    padding: "16px 0", fontSize: 20, fontWeight: 600,
    color: "#1C2B3A", width: "100%", maxWidth: 340, textAlign: "center",
    display: "block", transition: "opacity 0.15s",
  },
  aiHint: {
    background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-sm)",
    padding: "10px 16px", display: "flex", alignItems: "center",
    gap: 10, width: "100%", maxWidth: 560,
  },
  aiDot: { width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", flexShrink: 0 },
  aiText: { fontSize: 12, color: "var(--muted)", lineHeight: 1.4 },
}