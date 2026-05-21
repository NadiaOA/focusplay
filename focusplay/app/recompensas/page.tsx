"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { getProfile, saveProfile, UserProfile } from "@/lib/store"
import { REWARDS, Reward } from "@/lib/rewards"

// Función para generar un sonido de "compra" o "magia" usando Web Audio API
const playPurchaseSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, audioCtx.currentTime);     // Primer tono
    osc2.frequency.setValueAtTime(1600, audioCtx.currentTime + 0.1); // Segundo tono (más alto)

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.1);
    osc2.start(audioCtx.currentTime + 0.1);
    osc2.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.log("El navegador no soporta el audio en este momento.");
  }
}

export default function RecompensasPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    setProfile(getProfile())
  }, [])

  const handleUnlock = (reward: Reward) => {
    if (!profile) return;
    
    if (profile.gems < reward.cost) {
      alert("¡No tienes suficientes gemas!")
      return
    }

    // Reproducir sonido al comprar exitosamente
    playPurchaseSound()

    const newProfile: UserProfile = {
      ...profile,
      gems: profile.gems - reward.cost,
      unlockedRewards: [...(profile.unlockedRewards || []), reward.id]
    }

    saveProfile(newProfile)
    setProfile(newProfile)

    // Si es un video, lo abrimos inmediatamente después de desbloquearlo
    if (reward.type === 'video') {
      setSelectedVideo(reward.payload)
    } else if (reward.type === 'accessory') {
      alert("¡Genial! Ahora puedes equipar este accesorio en la pantalla de personalización de tu avatar en el módulo Amigos.")
    }
  }

  const handleView = (reward: Reward) => {
    if (reward.type === 'video') {
      setSelectedVideo(reward.payload)
    } else if (reward.type === 'accessory') {
      alert("¡Ve al módulo Amigos para equipar este accesorio a tu avatar!")
    } else {
      alert("¡Próximamente podrás usar esta recompensa!")
    }
  }

  if (!isMounted || !profile) return <main style={S.main} />

  return (
    <main style={S.main}>
      {/* Reproductor de Video */}
      {selectedVideo && (
        <div style={S.modalOverlay} onClick={() => setSelectedVideo(null)}>
          <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="Reproductor de video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button style={S.closeModalBtn} onClick={() => setSelectedVideo(null)}>✕</button>
          </div>
        </div>
      )}

      <header style={S.header}>
        <Link href="/" style={S.backBtn}>← volver</Link>
        <span style={S.title}>Tienda de Recompensas</span>
        <div style={S.gemsPill}>
          <span style={{ color: "var(--teal)" }}>◆</span>
          <span style={S.gemsNum}>{profile.gems}</span>
        </div>
      </header>
      <div style={S.tealLine} />

      <div style={S.body}>
        <h2 style={S.pageTitle}>¡Canjea tus gemas!</h2>
        <p style={S.pageSub}>Usa las gemas que ganaste para desbloquear premios divertidos.</p>

        <div style={S.rewardsGrid}>
          {REWARDS.map((reward) => {
            const isUnlocked = profile.unlockedRewards?.includes(reward.id)
            const canAfford = profile.gems >= reward.cost
            
            return (
              <div key={reward.id} style={S.rewardCard}>
                <div style={S.rewardIcon}>{reward.icon}</div>
                <h3 style={S.rewardTitle}>{reward.title}</h3>
                <p style={S.rewardDesc}>{reward.description}</p>
                
                <div style={{ marginTop: 'auto', width: '100%' }}>
                  {isUnlocked ? (
                    <button style={{...S.rewardBtn, ...S.btnUnlocked}} onClick={() => handleView(reward)}>
                      {reward.type === 'video' ? 'Ver video' : (reward.type === 'accessory' ? 'Equipar' : 'Desbloqueado')}
                    </button>
                  ) : (
                    <button 
                      style={{...S.rewardBtn, ...(canAfford && !reward.comingSoon ? S.btnCanAfford : S.btnCannotAfford)}}
                      onClick={() => handleUnlock(reward)}
                      disabled={!canAfford || reward.comingSoon}
                    >
                      {reward.comingSoon ? 'Próximamente' : `Canjear por ${reward.cost} ◆`}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main:          { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  header:        { padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)" },
  tealLine:      { height: 2, background: "var(--teal)" },
  backBtn:       { background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "var(--muted)", display: "block", textDecoration: "none" },
  title:         { fontSize: 18, fontWeight: 600, color: "var(--teal)" },
  gemsPill:      { display: "flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "5px 12px" },
  gemsNum:       { fontSize: 15, fontWeight: 700, color: "var(--teal)" },
  body:          { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 24px", gap: 16 },
  pageTitle:     { fontSize: 28, fontWeight: 700, color: "var(--white)", textAlign: 'center', margin: 0 },
  pageSub:       { fontSize: 16, color: "var(--muted)", textAlign: 'center', marginTop: 4, maxWidth: 400 },
  rewardsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', width: '100%', maxWidth: '1000px', marginTop: 24 },
  rewardCard:    { background: 'var(--bg2)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  rewardIcon:    { fontSize: '48px', marginBottom: '12px' },
  rewardTitle:   { fontSize: '18px', fontWeight: 600, color: 'var(--white)', margin: 0 },
  rewardDesc:    { fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, flexGrow: 1, marginTop: 8, marginBottom: 16 },
  rewardBtn:     { width: '100%', padding: '12px 0', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' },
  btnCanAfford:  { background: 'var(--teal)', color: '#1C2B3A' },
  btnCannotAfford:{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed' },
  btnUnlocked:   { background: 'var(--green)', color: '#1C2B3A' },
  modalOverlay:  { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent:  { position: 'relative', background: 'black', width: '90%', height: '80%', maxWidth: '1120px', maxHeight: '630px', borderRadius: '16px', overflow: 'hidden' },
  closeModalBtn: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' },
};