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

  // Convierte un porcentaje de progreso (0-100) en estrellas (0-3)
  const getStars = (progress: number) => {
    if (progress >= 100) return 3
    if (progress >= 50) return 2
    if (progress > 0) return 1
    return 0
  }

  const concentracionStars = getStars(profile.concentracionProgress)
  const amigosStars = getStars(profile.amigosProgress)

  return (
    <main style={S.main}>
      <style>{`
        @keyframes fp-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fp-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(14deg); }
          75% { transform: rotate(-8deg); }
        }
        @keyframes fp-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fp-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes fp-bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes fp-float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(8deg); }
        }
        @keyframes fp-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .fp-card {
          animation: fp-fade-up 0.5s ease-out both;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .fp-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        .fp-card:active {
          transform: translateY(-2px) scale(0.99);
        }
        .fp-card:nth-of-type(1) { animation-delay: 0.05s; }
        .fp-card:nth-of-type(2) { animation-delay: 0.15s; }
        .fp-card:nth-of-type(3) { animation-delay: 0.25s; }

        .fp-icon {
          transition: transform 0.3s ease;
        }
        .fp-card:hover .fp-icon {
          animation: fp-bounce-soft 0.6s ease-in-out infinite;
        }

        .fp-wave {
          display: inline-block;
          animation: fp-wave 1.8s ease-in-out infinite;
          transform-origin: 70% 70%;
        }

        .fp-star {
          display: inline-block;
          animation: fp-pop 0.45s ease-out both;
        }

        .fp-gems {
          animation: fp-pulse 2.5s ease-in-out infinite;
        }

        .fp-bot {
          animation: fp-bounce-soft 3s ease-in-out infinite;
        }

        .fp-btn {
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .fp-btn:hover {
          filter: brightness(1.08);
        }
        .fp-btn:active {
          transform: scale(0.96);
        }

        .fp-greeting {
          animation: fp-fade-up 0.5s ease-out both;
          position: relative;
        }

        .fp-deco {
          position: absolute;
          pointer-events: none;
          opacity: 0.7;
        }
        .fp-deco-float {
          animation: fp-float-slow 5s ease-in-out infinite;
        }
        .fp-deco-spin {
          animation: fp-spin-slow 14s linear infinite;
        }
        .fp-corner-deco {
          position: absolute;
          font-size: 20px;
          opacity: 0.55;
        }
      `}</style>

      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h1 style={S.logo}>FocusPlay</h1>
          <span className="fp-deco-spin" style={{ fontSize: 18, display: "inline-block" }}>⭐</span>
        </div>
        <div style={S.headerRight}>
          <div className="fp-gems" style={S.gemsPill}>
            <span style={{ fontSize: 16 }}>💎</span>
            <span style={S.gemsNum}>{profile.gems}</span>
          </div>
          <div className="fp-bot" style={S.botAvatar} aria-hidden="true">🤖</div>
          <button onClick={handleLogout} style={S.logoutBtn} aria-label="Cerrar sesión">
            🚪
          </button>
        </div>
      </header>
      <div style={S.tealLine} />

      <div style={S.body}>
        <div className="fp-greeting" style={S.greetingWrap}>
          <span className="fp-deco fp-deco-float" style={{ left: -36, top: 6, fontSize: 18 }}>⭐</span>
          <span className="fp-deco fp-deco-float" style={{ right: -32, top: 0, fontSize: 22, animationDelay: "0.6s" }}>✨</span>
          <span className="fp-deco fp-deco-float" style={{ left: 10, bottom: -18, fontSize: 12, animationDelay: "1.2s" }}>🟣</span>
          <span className="fp-wave" style={S.waveEmoji}>👋</span>
          <h2 style={S.welcomeTitle}>¡Hola, {profile.name}!</h2>
          <p style={S.welcomeSub}>Elige un juego para empezar</p>
        </div>

        <div style={S.modulesGrid}>
          {/* Módulo Concentración */}
          <Link href="/concentracion" className="fp-card" style={{...S.moduleCard, borderColor: "var(--blue, #378ADD)"}}>
            <span className="fp-corner-deco" style={{ top: 12, right: 14 }}>✨</span>
            <div className="fp-icon" style={{...S.moduleIcon, background: "rgba(55,138,221,0.18)"}}>🧠</div>
            <h3 style={S.moduleTitle}>Concentración</h3>
            <p style={S.moduleDesc}>Encuentra las parejas</p>
            <div style={S.starsRow}>
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="fp-star"
                  style={{
                    ...S.star,
                    opacity: i <= concentracionStars ? 1 : 0.25,
                    animationDelay: `${0.3 + i * 0.1}s`,
                  }}
                >
                  ⭐
                </span>
              ))}
            </div>
            <span className="fp-btn" style={{...S.playBtn, background: "var(--blue, #378ADD)", color: "#042C53"}}>
              <span style={{ marginRight: 6 }}>▶</span>Jugar
            </span>
          </Link>

          {/* Módulo Amigos */}
          <Link href="/amigos" className="fp-card" style={{...S.moduleCard, borderColor: "var(--pink, #ED93B1)"}}>
            <span className="fp-corner-deco" style={{ top: 12, right: 14 }}>💗</span>
            <div className="fp-icon" style={{...S.moduleIcon, background: "rgba(237,147,177,0.18)"}}>🧑‍🤝‍🧑</div>
            <h3 style={S.moduleTitle}>Amigos</h3>
            <p style={S.moduleDesc}>Practica saludos y juegos</p>
            <div style={S.starsRow}>
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="fp-star"
                  style={{
                    ...S.star,
                    opacity: i <= amigosStars ? 1 : 0.25,
                    animationDelay: `${0.3 + i * 0.1}s`,
                  }}
                >
                  ⭐
                </span>
              ))}
            </div>
            <span className="fp-btn" style={{...S.playBtn, background: "var(--pink, #ED93B1)", color: "#4B1528"}}>
              <span style={{ marginRight: 6 }}>▶</span>Jugar
            </span>
          </Link>

          {/* Módulo Recompensas */}
          <Link href="/recompensas" className="fp-card" style={{...S.moduleCard, borderColor: "var(--gold, #FAC775)"}}>
            <span className="fp-corner-deco" style={{ top: 12, right: 14 }}>🎀</span>
            <div className="fp-icon" style={{...S.moduleIcon, background: "rgba(250,199,117,0.18)"}}>🎁</div>
            <h3 style={S.moduleTitle}>Recompensas</h3>
            <p style={S.moduleDesc}>¡Cambia tus gemas por premios!</p>
            <div style={S.gemsPillSmall}>
              <span style={{ fontSize: 14 }}>💎</span>
              <span style={S.gemsText}>Tienes {profile.gems} gemas</span>
            </div>
            <span className="fp-btn" style={{...S.playBtn, background: "var(--gold, #FAC775)", color: "#412402"}}>
              <span style={{ marginRight: 6 }}>🎁</span>Ver premios
            </span>
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
  logoutBtn:     { background: "rgba(255,255,255,0.07)", borderRadius: "50%", width: 40, height: 40, fontSize: 16, cursor: "pointer", border: "none", display: "flex", alignItems: "center", justifyContent: "center" },
  botAvatar:     { width: 40, height: 40, borderRadius: "50%", background: "rgba(78,205,196,0.18)", border: "1px solid rgba(78,205,196,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  gemsPill:      { display: "flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "5px 12px" },
  gemsNum:       { fontSize: 15, fontWeight: 700, color: "var(--teal)" },
  tealLine:      { height: 2, background: "var(--teal)" },
  body:          { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", gap: 16 },
  greetingWrap:  { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textAlign: "center" },
  waveEmoji:     { fontSize: 40, marginBottom: 4 },
  welcomeTitle:  { fontSize: 32, fontWeight: 700, color: "var(--white)", textAlign: 'center', margin: 0 },
  welcomeSub:    { fontSize: 18, color: "var(--muted)", textAlign: 'center', marginTop: 4 },
  modulesGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px', width: '100%', maxWidth: '900px', marginTop: 32 },
  moduleCard:    { background: 'var(--bg2)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '2px solid rgba(255,255,255,0.1)', textDecoration: 'none' },
  moduleIcon:    { fontSize: '40px', width: 88, height: 88, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  moduleTitle:   { fontSize: '20px', fontWeight: 600, color: 'var(--white)', margin: 0 },
  moduleDesc:    { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5, flexGrow: 1, marginTop: 8, marginBottom: 0 },
  starsRow:      { display: 'flex', justifyContent: 'center', gap: 6, margin: '14px 0' },
  star:          { fontSize: '18px' },
  playBtn:       { width: '100%', borderRadius: '14px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  gemsPillSmall: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(250,199,117,0.12)', borderRadius: 999, padding: '6px 12px', margin: '14px 0' },
  gemsText:      { fontSize: '13px', color: 'var(--gold)', fontWeight: 600 }
};