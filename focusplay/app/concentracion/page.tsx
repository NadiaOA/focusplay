"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import {
  getProfile, addGems, recordActivity, getAIDifficulty
} from "@/lib/store"
import { MEMORY_LEVELS, buildCards } from "@/lib/memory-data"

type Card = { cardId: string; pairId: string; emoji: string; label: string }
type Phase = "playing" | "reward" | "gameover"

export default function Concentracion() {
  const profile        = getProfile()
  const diff           = getAIDifficulty()
  const level          = diff.level as 1 | 2 | 3
  const set            = MEMORY_LEVELS[level]

  const [cards, setCards]         = useState<Card[]>([])
  const [flipped, setFlipped]     = useState<string[]>([])
  const [matched, setMatched]     = useState<string[]>([])
  const [phase, setPhase]         = useState<Phase>("playing")
  const [timeLeft, setTimeLeft]   = useState(set.timeSeconds)
  const [stars, setStars]         = useState(0)
  const [gems, setGems]           = useState(profile.gems)
  const [blocking, setBlocking]   = useState(false)
  const [flashCard, setFlashCard] = useState<string | null>(null)
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null)
  const flipTimeRef               = useRef<number>(0)

  const totalPairs = set.pairs.length

  // Init
  useEffect(() => {
    setCards(buildCards(set))
    setFlipped([])
    setMatched([])
    setPhase("playing")
    setTimeLeft(set.timeSeconds)
    setBlocking(false)
  }, [level])

  // Timer
  useEffect(() => {
    if (phase !== "playing") {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setPhase("gameover")
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const handleFlip = useCallback((card: Card) => {
    if (blocking) return
    if (flipped.includes(card.cardId)) return
    if (matched.includes(card.pairId)) return
    if (flipped.length === 2) return

    const now = Date.now()
    const newFlipped = [...flipped, card.cardId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setBlocking(true)
      const [idA, idB] = newFlipped
      const cardA = cards.find((c) => c.cardId === idA)!
      const cardB = cards.find((c) => c.cardId === idB)!
      const isMatch = cardA.pairId === cardB.pairId

      const responseTime = flipTimeRef.current > 0 ? now - flipTimeRef.current : 2000
      recordActivity(responseTime, !isMatch)

      if (isMatch) {
        // Flash effect on match
        setFlashCard(cardA.pairId)
        setTimeout(() => setFlashCard(null), 600)

        setTimeout(() => {
          setMatched((m) => {
            const newMatched = [...m, cardA.pairId]
            if (newMatched.length === totalPairs) {
              // All pairs found!
              const timeBonus = Math.ceil(timeLeft / 30)
              const earnedStars = Math.min(5, 3 + timeBonus)
              const earnedGems = earnedStars
              setStars(earnedStars)
              const newGems = addGems(earnedGems)
              setGems(newGems)
              setPhase("reward")
            }
            return newMatched
          })
          setFlipped([])
          setBlocking(false)
        }, 500)
      } else {
        setTimeout(() => {
          setFlipped([])
          setBlocking(false)
        }, 900)
      }
    }
    flipTimeRef.current = now
  }, [blocking, flipped, matched, cards, totalPairs, timeLeft])

  const restart = () => {
    setCards(buildCards(set))
    setFlipped([])
    setMatched([])
    setPhase("playing")
    setTimeLeft(set.timeSeconds)
    setBlocking(false)
    flipTimeRef.current = 0
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, "0")
  const matchedCount = matched.length

  // Grid cols based on set size
  const gridCols = set.pairs.length <= 4 ? 4 : 4

  return (
    <main style={S.main}>
      {/* Header */}
      <header style={S.header}>
        <Link href="/" style={S.backBtn}>← volver</Link>
        <span style={S.headerTitle}>
          {phase === "reward" ? "FocusPlay" : "Concentración"}
        </span>
        <div style={S.gemsPill}>
          <span style={{ color: "var(--teal)" }}>◆</span>
          <span style={S.gemsNum}>{gems}</span>
        </div>
      </header>
      <div style={S.tealLine} />

      {phase === "playing" && (
        <div style={S.body}>
          {/* AI hint */}
          <div style={S.aiBar}>
            <span style={S.aiDot} />
            <span style={S.aiTxt}>{diff.reason}</span>
          </div>

          {/* Game header */}
          <div style={S.gameHeader}>
            <span style={S.gameTitle}>Encuentra los pares</span>
            <div style={S.timerPill}>
              <span>⏱</span>
              <span style={{ fontWeight: 700 }}>{minutes}:{seconds}</span>
            </div>
          </div>

          {/* Cards grid */}
          <div style={{ ...S.grid, gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
            {cards.map((card) => {
              const isFlipped  = flipped.includes(card.cardId)
              const isMatched  = matched.includes(card.pairId)
              const isFlashing = flashCard === card.pairId

              return (
                <button
                  key={card.cardId}
                  onClick={() => handleFlip(card)}
                  style={{
                    ...S.card,
                    ...(isMatched ? S.cardMatched : isFlipped ? S.cardFlipped : S.cardHidden),
                    animation: isFlashing ? "flash 0.3s ease 2" : undefined,
                    transform: isFlipped || isMatched ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  {isFlipped || isMatched
                    ? <span style={S.cardEmoji}>{card.emoji}</span>
                    : <span style={S.cardQuestion}>?</span>
                  }
                </button>
              )
            })}
          </div>

          {/* Stars progress */}
          <div style={S.starsRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ fontSize: 18, color: i < matchedCount ? "var(--gold)" : "rgba(255,255,255,0.15)" }}>
                ★
              </span>
            ))}
          </div>
          <p style={S.pairsLabel}>
            {matchedCount} par{matchedCount !== 1 ? "es" : ""} encontrado{matchedCount !== 1 ? "s" : ""} · {totalPairs - matchedCount} por encontrar
          </p>
        </div>
      )}

      {phase === "reward" && (
        <div style={S.rewardBody} className="anim-fadein">
          <span style={S.rewardEmoji} className="anim-bounce">🎉</span>
          <h2 style={S.rewardTitle}>¡Lo lograste!</h2>
          <p style={S.rewardSub}>completaste todos los pares</p>
          <div style={S.starsRowLarge}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ fontSize: 36, color: i < stars ? "var(--gold)" : "rgba(255,255,255,0.15)" }}>
                ★
              </span>
            ))}
          </div>
          <div style={S.gemReward}>
            <span>◆◆◆</span>
            <span style={{ fontSize: 20, fontWeight: 700 }}>+ {stars} gemas</span>
          </div>
          <div style={S.rewardBtns}>
            <button onClick={restart} style={S.btnSecondary}>jugar otra vez</button>
            <Link href="/" style={S.btnPrimary}>siguiente →</Link>
          </div>
        </div>
      )}

      {phase === "gameover" && (
        <div style={S.rewardBody} className="anim-fadein">
          <span style={{ fontSize: 64 }}>⏰</span>
          <h2 style={{ ...S.rewardTitle, color: "var(--coral)" }}>¡Se acabó el tiempo!</h2>
          <p style={S.rewardSub}>¡Casi lo logras! Inténtalo de nuevo</p>
          <div style={S.rewardBtns}>
            <button onClick={restart} style={S.btnPrimary}>intentar de nuevo</button>
            <Link href="/" style={S.btnSecondary}>ir al inicio</Link>
          </div>
        </div>
      )}
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main:        { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  header:      { padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)" },
  tealLine:    { height: 2, background: "var(--teal)" },
  backBtn:     { background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "var(--muted)", cursor: "pointer" },
  headerTitle: { fontSize: 18, fontWeight: 600, color: "var(--teal)" },
  gemsPill:    { display: "flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "5px 12px" },
  gemsNum:     { fontSize: 15, fontWeight: 700, color: "var(--teal)" },
  body:        { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 24px", gap: 16, maxWidth: 600, margin: "0 auto", width: "100%" },
  aiBar:       { background: "rgba(78,205,196,0.07)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, width: "100%", alignSelf: "stretch" },
  aiDot:       { width: 7, height: 7, borderRadius: "50%", background: "var(--teal)", flexShrink: 0 },
  aiTxt:       { fontSize: 11, color: "var(--muted)" },
  gameHeader:  { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" },
  gameTitle:   { fontSize: 18, color: "rgba(255,255,255,0.75)" },
  timerPill:   { background: "rgba(255,209,102,0.15)", border: "1px solid rgba(255,209,102,0.4)", borderRadius: 12, padding: "5px 14px", fontSize: 15, color: "var(--gold)", display: "flex", gap: 6, alignItems: "center" },
  grid:        { display: "grid", gap: 12, width: "100%" },
  card:        { borderRadius: 14, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.15s, background 0.2s", border: "2px solid" },
  cardHidden:  { background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" },
  cardFlipped: { background: "rgba(78,205,196,0.2)", borderColor: "var(--teal)" },
  cardMatched: { background: "rgba(82,201,126,0.2)", borderColor: "var(--green)" },
  cardEmoji:   { fontSize: 36 },
  cardQuestion:{ fontSize: 28, color: "rgba(255,255,255,0.18)", fontWeight: 700 },
  starsRow:    { display: "flex", gap: 6 },
  pairsLabel:  { fontSize: 13, color: "var(--muted)" },
  // Reward
  rewardBody:  { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "32px 24px", textAlign: "center" },
  rewardEmoji: { fontSize: 72, display: "block" },
  rewardTitle: { fontSize: 34, fontWeight: 700, color: "var(--gold)" },
  rewardSub:   { fontSize: 16, color: "var(--muted)" },
  starsRowLarge: { display: "flex", gap: 8 },
  gemReward:   { background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.35)", borderRadius: 14, padding: "14px 28px", display: "flex", alignItems: "center", gap: 12, color: "var(--teal)" },
  rewardBtns:  { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  btnPrimary:  { background: "var(--teal)", borderRadius: 14, padding: "13px 28px", fontSize: 16, fontWeight: 600, color: "#1C2B3A", cursor: "pointer", border: "none", display: "block" },
  btnSecondary:{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "13px 28px", fontSize: 16, color: "rgba(255,255,255,0.7)", cursor: "pointer", border: "none" },
}
