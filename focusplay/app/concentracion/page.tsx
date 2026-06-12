"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getCurrentUser, getProfile, getAIDifficulty, recordActivity, recordConcentracionResult } from "@/lib/store"
import { recordEmocionesResult, recordRespiracionResult, recordSimonResult } from "@/lib/store-additions"
import { MEMORY_LEVELS, buildCards } from "@/lib/memory-data"
import {
  EMOCION_LEVELS, RESPIRACION_LEVELS, SIMON_COLORS, SIMON_LEVELS,
  type EmocionQuestion, type BreathPhase, type SimonColor,
} from "@/lib/games-data"

type Tab    = "memorama" | "emociones" | "respiracion" | "simon"
type Phase  = "playing" | "reward" | "gameover" | "breathbreak"
type Card   = { cardId: string; pairId: string; emoji: string; label: string }

// ─── Memorama data por nivel ──────────────────────────────────────────────────
const MEMO_PAIRS: Record<1|2|3, { emoji: string; label: string }[]> = {
  1: [
    { emoji: "🐶", label: "perro" },
    { emoji: "🐱", label: "gato" },
    { emoji: "🐭", label: "ratón" },
    { emoji: "🐸", label: "rana" },
  ],
  2: [
    { emoji: "🐶", label: "perro" },
    { emoji: "🐱", label: "gato" },
    { emoji: "🐭", label: "ratón" },
    { emoji: "🐸", label: "rana" },
    { emoji: "🦊", label: "zorro" },
    { emoji: "🐼", label: "panda" },
  ],
  3: [
    { emoji: "🐶", label: "perro" },
    { emoji: "🐱", label: "gato" },
    { emoji: "🐭", label: "ratón" },
    { emoji: "🐸", label: "rana" },
    { emoji: "🦊", label: "zorro" },
    { emoji: "🐼", label: "panda" },
    { emoji: "🦁", label: "león" },
    { emoji: "🐯", label: "tigre" },
  ],
}

const MEMO_TIME: Record<1|2|3, number> = { 1: 60, 2: 90, 3: 120 }
const MEMO_COLS: Record<1|2|3, number> = { 1: 4, 2: 4, 3: 4 }

function buildMemoCards(level: 1|2|3): Card[] {
  const pairs = MEMO_PAIRS[level]
  const cards: Card[] = []
  pairs.forEach(p => {
    const pairId = p.label
    cards.push({ cardId: `${pairId}-a`, pairId, emoji: p.emoji, label: p.label })
    cards.push({ cardId: `${pairId}-b`, pairId, emoji: p.emoji, label: p.label })
  })
  return cards.sort(() => Math.random() - 0.5)
}

// ─── Root page ────────────────────────────────────────────────────────────────
export default function Concentracion() {
  const router  = useRouter()
  const nameRef = useRef<string>("")
  const [gems, setGems]   = useState(0)
  const [tab, setTab]     = useState<Tab>("memorama")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const name = getCurrentUser()
    if (!name) { router.push("/login"); return }
    nameRef.current = name
    setGems(getProfile().gems)
    setReady(true)
  }, [router])

  if (!ready) return null

  const TABS: { id: Tab; icon: string; label: string; sub: string; color: string; glow: string }[] = [
    { id: "memorama",    icon: "🧠", label: "Memorama",  sub: "Encuentra las parejas",     color: "#378ADD", glow: "rgba(55,138,221,0.18)" },
    { id: "emociones",   icon: "😊", label: "Emociones", sub: "Adivina cómo se sienten",   color: "#ED93B1", glow: "rgba(237,147,177,0.18)" },
    { id: "respiracion", icon: "🫧", label: "Respira",   sub: "Relájate un momento",       color: "#4ECDC4", glow: "rgba(78,205,196,0.18)" },
    { id: "simon",       icon: "🎵", label: "Simón",     sub: "Sigue los colores",         color: "#FAC775", glow: "rgba(250,199,117,0.18)" },
  ]

  return (
    <main style={S.main}>
      <style>{`
        @keyframes fp-pop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fp-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes fp-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes fp-flip-in {
          from { transform: scale(0.8) rotate(-4deg); opacity: 0.4; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fp-glow {
          0%, 100% { box-shadow: 0 0 0px currentColor; }
          50% { box-shadow: 0 0 28px currentColor; }
        }
        @keyframes fp-confetti {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(30px) scale(0.8); opacity: 0; }
        }
        @keyframes fp-pulse-ring {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes fp-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .fp-star { animation: fp-pop 0.4s ease-out both; }
        .fp-card-match { animation: fp-pop 0.35s ease-out; }
        .fp-card-flip { animation: fp-flip-in 0.25s ease-out; }
        .fp-shake { animation: fp-shake 0.4s ease-in-out; }
        .fp-bounce { animation: fp-bounce 1.6s ease-in-out infinite; }
        .fp-float { animation: fp-float 2.6s ease-in-out infinite; }
        .fp-glow { animation: fp-glow 1s ease-in-out infinite; }
        .fp-gems-anim { animation: fp-pulse-ring 2.5s ease-in-out infinite; }
        .fp-confetti-row span { display: inline-block; animation: fp-confetti 1s ease-in forwards; }
        .fp-spin { animation: fp-spin-slow 12s linear infinite; }

        .fp-tab { transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease; }
        .fp-tab:hover { transform: translateY(-3px); }
        .fp-btn-pop { transition: transform 0.15s ease, filter 0.15s ease; }
        .fp-btn-pop:hover { filter: brightness(1.08); }
        .fp-btn-pop:active { transform: scale(0.95); }
      `}</style>

      <header style={S.header}>
        <Link href="/" style={S.backBtn} aria-label="Volver al inicio">
          <span style={{ fontSize: 18 }}>←</span>
        </Link>
        <span style={S.headerTitle}>🌟 FocusPlay</span>
        <div className="fp-gems-anim" style={S.gemsPill}>
          <span style={{ fontSize: 16 }}>💎</span>
          <span style={S.gemsNum}>{gems}</span>
        </div>
      </header>
      <div style={S.tealLine} />

      {/* ── Tab selector estilo "tarjetas" como la home ── */}
      <nav style={S.tabBar}>
        {TABS.map(t => {
          const isActive = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="fp-tab"
              style={{
                ...S.tabCard,
                borderColor: isActive ? t.color : "rgba(255,255,255,0.08)",
                background: isActive ? t.glow : "rgba(255,255,255,0.03)",
                boxShadow: isActive ? `0 8px 24px -8px ${t.color}66` : "none",
              }}>
              <div style={{ ...S.tabIconCircle, background: `${t.color}26` }}>
                <span style={{ fontSize: 24 }}>{t.icon}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>
                <span style={{ ...S.tabLabel, color: isActive ? t.color : "rgba(255,255,255,0.85)" }}>{t.label}</span>
                <span style={S.tabSub}>{t.sub}</span>
              </div>
            </button>
          )
        })}
      </nav>

      <div style={S.gameArea}>
        {tab === "memorama"    && <GameMemorama    nameRef={nameRef} onGemsChange={setGems} onSwitchTab={setTab} />}
        {tab === "emociones"   && <GameEmociones   nameRef={nameRef} onGemsChange={setGems} onSwitchTab={setTab} />}
        {tab === "respiracion" && <GameRespiracion nameRef={nameRef} onGemsChange={setGems} />}
        {tab === "simon"       && <GameSimon       nameRef={nameRef} onGemsChange={setGems} onSwitchTab={setTab} />}
      </div>
    </main>
  )
}

interface GameProps {
  nameRef: React.MutableRefObject<string>
  onGemsChange: (n: number) => void
  onSwitchTab?: (tab: Tab) => void
}

// ─── GAME 1 — MEMORAMA ───────────────────────────────────────────────────────
function GameMemorama({ nameRef, onGemsChange, onSwitchTab }: GameProps) {
  const p         = getProfile() as any
  const diffLevel = Math.min(3, Math.max(1, p.concentracionLevel ?? 1)) as 1|2|3

  const [cards, setCards]         = useState<Card[]>([])
  const [flipped, setFlipped]     = useState<string[]>([])
  const [matched, setMatched]     = useState<string[]>([])
  const [phase, setPhase]         = useState<Phase>("playing")
  const [timeLeft, setTimeLeft]   = useState(MEMO_TIME[diffLevel])
  const [stars, setStars]         = useState(0)
  const [blocking, setBlocking]   = useState(false)
  const [flashCard, setFlashCard] = useState<string | null>(null)
  const [leveledUp, setLeveledUp] = useState(false)
  const [aiReason, setAiReason]   = useState("")
  const [lv, setLv]               = useState<1|2|3>(diffLevel)
  const [errors, setErrors]       = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const flipTime = useRef(0)

  const totalPairs = MEMO_PAIRS[lv].length

  const init = (level?: 1|2|3) => {
    const diff = getAIDifficulty()
    const usedLevel = level ?? (Math.min(3, Math.max(1, (getProfile() as any).concentracionLevel ?? 1)) as 1|2|3)
    setLv(usedLevel)
    setAiReason(diff.reason)
    setTimeLeft(MEMO_TIME[usedLevel])
    setCards(buildMemoCards(usedLevel))
    setFlipped([]); setMatched([]); setPhase("playing")
    setBlocking(false); setLeveledUp(false); setErrors(0)
    flipTime.current = 0
  }
  useEffect(() => { init() }, [])

  useEffect(() => {
    if (phase !== "playing") { if (timerRef.current) clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          const res = recordConcentracionResult(nameRef.current, false, 0)
          onGemsChange(res.profile.gems); setPhase("gameover"); return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  function handleFlip(card: Card) {
    if (blocking || flipped.includes(card.cardId) || matched.includes(card.pairId) || flipped.length === 2) return
    const now = Date.now()
    const nf  = [...flipped, card.cardId]
    setFlipped(nf)

    if (nf.length === 2) {
      setBlocking(true)
      const cA = cards.find(c => c.cardId === nf[0])!
      const cB = cards.find(c => c.cardId === nf[1])!
      const ok = cA.pairId === cB.pairId
      recordActivity(flipTime.current > 0 ? now - flipTime.current : 3000, !ok)

      if (ok) {
        setFlashCard(cA.pairId)
        setTimeout(() => setFlashCard(null), 600)
        setTimeout(() => {
          setMatched(m => {
            const next = [...m, cA.pairId]
            if (next.length === totalPairs) {
              const bonus  = Math.ceil(timeLeft / 30)
              const earned = Math.min(5, 3 + bonus)
              setStars(earned)
              const res = recordConcentracionResult(nameRef.current, true, earned)
              onGemsChange(res.profile.gems); setLeveledUp(res.leveledUp); setPhase("reward")
            }
            return next
          })
          setFlipped([]); setBlocking(false)
        }, 500)
      } else {
        const newErrors = errors + 1
        setErrors(newErrors)
        if (newErrors >= 6) {
          setTimeout(() => {
            if (timerRef.current) clearInterval(timerRef.current)
            setPhase("breathbreak")
          }, 900)
        }
        setTimeout(() => { setFlipped([]); setBlocking(false) }, 900)
      }
    }
    flipTime.current = now
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, "0")

  if (phase === "breathbreak") return (
    <div style={S.rewardBody}>
      <span className="fp-float" style={{ fontSize: 72 }}>🫧</span>
      <h2 style={{ ...S.rewardTitle, color: "var(--teal)", fontSize: 26 }}>
        Vamos a respirar un momento
      </h2>
      <p style={{ ...S.rewardSub, maxWidth: 320 }}>
        Tuviste varios intentos. ¡No pasa nada! Respira un poco y regresa con más calma.
      </p>
      <div style={S.rewardBtns}>
        <button onClick={() => onSwitchTab?.("respiracion")} className="fp-btn-pop" style={S.btnPrimary}>
          🌬️ Ir a respiración
        </button>
        <button onClick={() => init(lv)} className="fp-btn-pop" style={S.btnSecondary}>
          Seguir jugando
        </button>
      </div>
    </div>
  )

  if (phase === "reward") return (
    <RewardScreen stars={stars} leveledUp={leveledUp}
      levelNum={(getProfile() as any).concentracionLevel ?? 1}
      subtitle={`completaste ${totalPairs} pares · nivel ${lv}`}
      onRestart={() => init()} />
  )
  if (phase === "gameover") return <GameoverScreen onRestart={() => init(lv)} />

  const gridCols = MEMO_COLS[lv]

  return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={lv} accent="#378ADD" />

      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Vidas:</span>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <span key={i} style={{ fontSize: 17 }}>{i < (6 - errors) ? "❤️" : "🤍"}</span>
          ))}
        </div>
        <TimerPill minutes={minutes} seconds={seconds} accent="#378ADD" />
      </div>

      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...S.gameTitle, color: "#378ADD" }}>🔍 Encuentra los pares · {totalPairs} pares</span>
      </div>

      <div style={{ ...S.grid, gridTemplateColumns: `repeat(${gridCols}, 1fr)`, width: "100%" }}>
        {cards.map(card => {
          const isFlipped  = flipped.includes(card.cardId)
          const isMatched  = matched.includes(card.pairId)
          const isFlashing = flashCard === card.pairId
          return (
            <button key={card.cardId} onClick={() => handleFlip(card)}
              className={isMatched ? "fp-card-match" : isFlipped ? "fp-card-flip" : "fp-btn-pop"}
              style={{ ...S.card,
                ...(isMatched ? S.cardMatched : isFlipped ? S.cardFlipped : S.cardHidden),
                animation: isFlashing ? "fp-glow 0.3s ease 2" : undefined,
              }}>
              {isFlipped || isMatched
                ? <span style={S.cardEmoji}>{card.emoji}</span>
                : <span style={S.cardQuestion}>❓</span>}
            </button>
          )
        })}
      </div>

      <StarsRow filled={matched.length} total={totalPairs} />
      <p style={S.pairsLabel}>{matched.length} pares encontrados · {totalPairs - matched.length} por encontrar</p>
    </div>
  )
}

// ─── GAME 2 — EMOCIONES ──────────────────────────────────────────────────────
function GameEmociones({ nameRef, onGemsChange, onSwitchTab }: GameProps) {
  const p        = getProfile() as any
  const diffLevel = Math.min(3, Math.max(1, (p.emocionesLevel ?? 1))) as 1|2|3
  const levelSet  = EMOCION_LEVELS[diffLevel]

  const [consecErrors, setConsecErrors] = useState(0)
  const [questions, setQuestions] = useState<EmocionQuestion[]>([])
  const [current, setCurrent]     = useState(0)
  const [selected, setSelected]   = useState<string | null>(null)
  const [score, setScore]         = useState(0)
  const [phase, setPhase]         = useState<Phase>("playing")
  const [timeLeft, setTimeLeft]   = useState(levelSet.timeSeconds)
  const [stars, setStars]         = useState(0)
  const [leveledUp, setLeveledUp] = useState(false)
  const [aiReason]                = useState(getAIDifficulty().reason)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const init = () => {
    const qs = [...levelSet.questions].sort(() => Math.random() - 0.5).slice(0, levelSet.totalQuestions)
    setQuestions(qs); setCurrent(0); setSelected(null); setConsecErrors(0)
    setScore(0); setPhase("playing"); setTimeLeft(levelSet.timeSeconds); setLeveledUp(false)
  }
  useEffect(init, [])

  useEffect(() => {
    if (phase !== "playing") { if (timerRef.current) clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          const res = recordEmocionesResult(nameRef.current, false, 0)
          onGemsChange(res.profile.gems); setPhase("gameover"); return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  function choose(option: string) {
    if (selected !== null) return
    const q   = questions[current]
    const hit = option === q.label
    setSelected(option)
    recordActivity(2000, !hit)

    if (hit) {
      setScore(s => s + 1)
      setConsecErrors(0)
    } else {
      const ce = consecErrors + 1
      setConsecErrors(ce)
      if (ce >= 3) {
        setTimeout(() => setPhase("breathbreak"), 600)
        return
      }
    }

    setTimeout(() => {
      const next = current + 1
      if (next >= questions.length) {
        const earned = Math.min(5, Math.round((score + (hit ? 1 : 0)) / questions.length * 5))
        setStars(earned)
        const res = recordEmocionesResult(nameRef.current, true, earned)
        onGemsChange(res.profile.gems); setLeveledUp(res.leveledUp); setPhase("reward")
      } else {
        setCurrent(next); setSelected(null)
      }
    }, 900)
  }

  if (phase === "breathbreak") return (
    <div style={S.rewardBody}>
      <span className="fp-float" style={{ fontSize: 72 }}>🫧</span>
      <h2 style={{ ...S.rewardTitle, color: "var(--teal)", fontSize: 26 }}>
        Vamos a respirar un momento
      </h2>
      <p style={{ ...S.rewardSub, maxWidth: 320 }}>
        Tuviste 3 intentos seguidos diferentes. ¡No pasa nada! Respira y regresa con calma.
      </p>
      <div style={S.rewardBtns}>
        <button onClick={() => onSwitchTab?.("respiracion")} className="fp-btn-pop" style={S.btnPrimary}>
          🌬️ Ir a respiración
        </button>
        <button onClick={() => { setPhase("playing"); setConsecErrors(0); setSelected(null) }} className="fp-btn-pop" style={S.btnSecondary}>
          Seguir jugando
        </button>
      </div>
    </div>
  )

  if (phase === "reward") return <RewardScreen stars={stars} leveledUp={leveledUp}
    levelNum={(getProfile() as any).emocionesLevel ?? 1} subtitle="¡identificaste todas las emociones!" onRestart={init} />
  if (phase === "gameover") return <GameoverScreen onRestart={init} />
  if (!questions.length) return null

  const q       = questions[current]
  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, "0")

  return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} accent="#ED93B1" />
      <div style={S.gameHeader}>
        <span style={{ ...S.gameTitle, color: "#ED93B1" }}>🤔 ¿Qué emoción es?</span>
        <TimerPill minutes={minutes} seconds={seconds} accent="#ED93B1" />
      </div>
      <div key={current} className="fp-card-flip" style={S.emojiCard}>
        <span style={{ fontSize: 96 }}>{q.emoji}</span>
        {q.situation && <p style={S.emojiSituation}>"{q.situation}"</p>}
      </div>
      <div style={S.optionsGrid}>
        {q.options.map(opt => {
          let bg = "rgba(255,255,255,0.05)"
          let border = "rgba(255,255,255,0.12)"
          let cls = "fp-btn-pop"
          if (selected !== null) {
            if (opt === q.label)       { bg = "rgba(82,201,126,0.22)"; border = "var(--green)"; cls = "fp-card-match" }
            else if (opt === selected) { bg = "rgba(255,107,107,0.22)"; border = "var(--coral)"; cls = "fp-shake" }
          }
          return (
            <button key={opt} onClick={() => choose(opt)} className={cls}
              style={{ ...S.optionBtn, background: bg, borderColor: border }}>
              {opt}
            </button>
          )
        })}
      </div>
      <StarsRow filled={score} total={questions.length} />
      <p style={S.pairsLabel}>{current + 1} de {questions.length} preguntas</p>
    </div>
  )
}

// ─── GAME 3 — RESPIRACIÓN ────────────────────────────────────────────────────
function GameRespiracion({ nameRef, onGemsChange }: GameProps) {
  const pr        = getProfile() as any
  const diffLevel = Math.min(3, Math.max(1, (pr.respiracionLevel ?? 1))) as 1|2|3
  const levelSet  = RESPIRACION_LEVELS[diffLevel]
  const phases    = levelSet.phases

  const [phase, setPhase]         = useState<"intro"|"breathing"|Phase>("intro")
  const [round, setRound]         = useState(0)
  const [phaseIdx, setPhaseIdx]   = useState(0)
  const [phaseTime, setPhaseTime] = useState(0)
  const [scale, setScale]         = useState(1)
  const [stars, setStars]         = useState(0)
  const [leveledUp, setLeveledUp] = useState(false)
  const [aiReason]                = useState(getAIDifficulty().reason)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const curPhase = phases[phaseIdx] as BreathPhase | undefined

  function startBreathing() {
    setPhase("breathing"); setRound(0); setPhaseIdx(0); setPhaseTime(phases[0].seconds)
  }

  useEffect(() => {
    if (phase !== "breathing") { if (timerRef.current) clearInterval(timerRef.current); return }
    const target = phases[phaseIdx].label === "Exhala" ? 1.0 : 1.55
    setScale(target)
    timerRef.current = setInterval(() => {
      setPhaseTime(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          const nextPIdx = (phaseIdx + 1) % phases.length
          if (nextPIdx === 0) {
            const nextRound = round + 1
            if (nextRound >= levelSet.rounds) {
              const earned = Math.min(5, 3 + diffLevel)
              setStars(earned)
              const res = recordRespiracionResult(nameRef.current, true, earned)
              onGemsChange(res.profile.gems); setLeveledUp(res.leveledUp); setPhase("reward")
              return 0
            }
            setRound(nextRound)
          }
          setPhaseIdx(nextPIdx)
          setPhaseTime(phases[nextPIdx].seconds)
          return phases[nextPIdx].seconds
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, phaseIdx, round])

  function init() {
    setPhase("intro"); setRound(0); setPhaseIdx(0)
    setPhaseTime(phases[0].seconds); setScale(1); setLeveledUp(false)
  }

  if (phase === "reward") return <RewardScreen stars={stars} leveledUp={leveledUp}
    levelNum={(getProfile() as any).respiracionLevel ?? 1}
    subtitle="¡completaste todas las rondas de respiración!" onRestart={init} />

  if (phase === "intro") return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} accent="#4ECDC4" />
      <div style={S.centeredSection}>
        <span className="fp-float" style={{ fontSize: 80 }}>🫧</span>
        <h2 style={S.introTitle}>Respiración guiada</h2>
        <p style={S.introSub}>{levelSet.tip}</p>
        <p style={S.introMeta}>{levelSet.rounds} rondas · {phases.map(p => p.label).join(" → ")}</p>
        <button onClick={startBreathing} className="fp-btn-pop" style={S.bigBtn}>Comenzar</button>
      </div>
    </div>
  )

  const breathColor = curPhase?.color ?? "var(--teal)"

  return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} accent="#4ECDC4" />
      <div style={S.gameHeader}>
        <span style={{ ...S.gameTitle, color: "#4ECDC4" }}>🌈 Ronda {round + 1} de {levelSet.rounds}</span>
        <div style={S.timerPill}>
          <span style={{ color: breathColor, fontWeight: 700 }}>{phaseTime}s</span>
        </div>
      </div>
      <div style={S.breathWrap}>
        <div className="fp-spin" style={{ ...S.breathRing, borderColor: `${breathColor}33` }}>
          <div style={{
            ...S.breathOuter,
            borderColor: breathColor,
            transform: `scale(${scale})`,
            transition: `transform ${curPhase?.seconds ?? 4}s ease-in-out`,
            boxShadow: `0 0 70px ${breathColor}55`,
          }}>
            <div style={{ ...S.breathInner, background: `${breathColor}22` }}>
              <span style={{ fontSize: 48 }}>
                {curPhase?.label === "Inhala" ? "🌬️" : curPhase?.label === "Mantén" ? "⏸️" : "😮‍💨"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p style={{ ...S.phaseLabel, color: breathColor, fontSize: 28 }}>{curPhase?.label}</p>
      <p style={S.pairsLabel}>Sigue el ritmo del círculo</p>
      <div style={{ display: "flex", gap: 10 }}>
        {Array.from({ length: levelSet.rounds }).map((_, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: "50%",
            background: i < round ? "var(--teal)" : i === round ? breathColor : "rgba(255,255,255,0.15)",
            transition: "background 0.3s" }} />
        ))}
      </div>
    </div>
  )
}

// ─── GAME 4 — SIMÓN ──────────────────────────────────────────────────────────
function GameSimon({ nameRef, onGemsChange, onSwitchTab }: GameProps) {
  const pr        = getProfile() as any
  const diffLevel = Math.min(3, Math.max(1, (pr.simonLevel ?? 1))) as 1|2|3
  const levelSet  = SIMON_LEVELS[diffLevel]

  type SimonPhase = "intro" | "showing" | "input" | Phase
  const [simonPhase, setSimonPhase]   = useState<SimonPhase>("intro")
  const [sequence, setSequence]       = useState<string[]>([])
  const [input, setInput]             = useState<string[]>([])
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [stars, setStars]             = useState(0)
  const [leveledUp, setLeveledUp]     = useState(false)
  const [aiReason]                    = useState(getAIDifficulty().reason)

  const [lostGames, setLostGames]     = useState(0)

  function playTone(freq: number) {
    try {
      const ctx  = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = "sine"
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(); osc.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  function flashColor(id: string, freq: number, durationMs: number) {
    setActiveColor(id); playTone(freq)
    return new Promise<void>(res => setTimeout(() => { setActiveColor(null); res() }, durationMs))
  }

  async function showSequence(seq: string[]) {
    setSimonPhase("showing")
    await new Promise(r => setTimeout(r, 400))
    for (const id of seq) {
      const c = SIMON_COLORS.find(c => c.id === id)!
      await flashColor(id, c.sound, levelSet.flashMs)
      await new Promise(r => setTimeout(r, levelSet.pauseMs))
    }
    setInput([]); setSimonPhase("input")
  }

  function startGame() {
    const first = [SIMON_COLORS[Math.floor(Math.random() * 4)].id]
    setSequence(first); showSequence(first)
  }

  function init() {
    setSimonPhase("intro"); setSequence([]); setInput([])
    setActiveColor(null); setLeveledUp(false)
  }

  function fullReset() {
    setLostGames(0)
    init()
  }

  async function handlePress(color: SimonColor) {
    if (simonPhase !== "input") return
    const idx      = input.length
    const correct  = sequence[idx]
    const newInput = [...input, color.id]
    setInput(newInput)
    await flashColor(color.id, color.sound, 200)

    if (color.id !== correct) {
      recordActivity(2000, true)
      const res = recordSimonResult(nameRef.current, false, 0)
      onGemsChange(res.profile.gems)

      const nextLostGames = lostGames + 1
      setLostGames(nextLostGames)

      if (nextLostGames >= 3) {
        setSimonPhase("breathbreak")
      } else {
        setSimonPhase("gameover")
      }
      return
    }

    if (newInput.length === sequence.length) {
      recordActivity(1500, false)
      if (sequence.length >= levelSet.maxLength) {
        const earned = Math.min(5, 3 + Math.floor(sequence.length / 2))
        setStars(earned)
        const res = recordSimonResult(nameRef.current, true, earned)
        onGemsChange(res.profile.gems); setLeveledUp(res.leveledUp); setSimonPhase("reward")
        setLostGames(0)
      } else {
        await new Promise(r => setTimeout(r, 500))
        const nextSeq = [...sequence, SIMON_COLORS[Math.floor(Math.random() * 4)].id]
        setSequence(nextSeq); showSequence(nextSeq)
      }
    }
  }

  if (simonPhase === "reward") return <RewardScreen stars={stars} leveledUp={leveledUp}
    levelNum={(getProfile() as any).simonLevel ?? 1}
    subtitle={`¡completaste ${sequence.length} colores seguidos!`} onRestart={init} />

  if (simonPhase === "gameover") return <GameoverScreen onRestart={init} />

  if (simonPhase === "intro") return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} accent="#FAC775" />
      <div style={S.centeredSection}>
        <span className="fp-bounce" style={{ fontSize: 60 }}>🔴🟢🔵🟡</span>
        <h2 style={S.introTitle}>Simón Dice</h2>
        <p style={S.introSub}>Memoriza y repite la secuencia de colores</p>
        <p style={{ ...S.introMeta, color: "#FAC775", background: "rgba(250,199,117,0.12)" }}>
          Objetivo: {levelSet.maxLength} colores · Nivel {diffLevel}
        </p>
        <button onClick={startGame} className="fp-btn-pop" style={{ ...S.bigBtn, background: "#FAC775" }}>¡Jugar!</button>
      </div>
    </div>
  )

  if (simonPhase === "breathbreak") return (
    <div style={S.rewardBody}>
      <span className="fp-float" style={{ fontSize: 72 }}>🫧</span>
      <h2 style={{ ...S.rewardTitle, color: "var(--teal)", fontSize: 26 }}>
        Vamos a respirar un momento
      </h2>
      <p style={{ ...S.rewardSub, maxWidth: 320 }}>
        Perdiste 3 partidas completas. ¡No pasa nada! Vamos a relajarnos un poco y regresar con calma.
      </p>
      <div style={S.rewardBtns}>
        <button onClick={() => onSwitchTab?.("respiracion")} className="fp-btn-pop" style={S.btnPrimary}>
          🌬️ Ir a respiración
        </button>
        <button onClick={fullReset} className="fp-btn-pop" style={S.btnSecondary}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  )

  return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} accent="#FAC775" />
      <div style={S.gameHeader}>
        <span style={{ ...S.gameTitle, color: "#FAC775" }}>
          {simonPhase === "showing" ? "👀 Observa…" : `✋ Tu turno (${input.length}/${sequence.length})`}
        </span>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ fontSize: 16 }}>{i < (3 - lostGames) ? "❤️" : "🤍"}</span>
            ))}
          </div>
          <div style={S.timerPill}>
            <span style={{ fontWeight: 700, color: "var(--gold)" }}>🎶 {sequence.length}</span>
          </div>
        </div>
      </div>

      <div style={S.simonGrid}>
        {SIMON_COLORS.map(color => {
          const isActive  = activeColor === color.id
          const isPressed = simonPhase === "input" && input[input.length - 1] === color.id
          return (
            <button key={color.id} onClick={() => handlePress(color)}
              disabled={simonPhase === "showing"}
              className={isActive ? "fp-glow" : "fp-btn-pop"}
              style={{
                ...S.simonBtn,
                background: isActive ? color.bg : color.dim,
                color: color.bg,
                transform: isActive || isPressed ? "scale(0.94)" : "scale(1)",
                transition: "background 0.12s, transform 0.1s",
                cursor: simonPhase === "showing" ? "default" : "pointer",
                opacity: simonPhase === "showing" ? 0.85 : 1,
              }}>
              <span style={{ fontSize: 15, fontWeight: 600,
                color: isActive ? "#fff" : "rgba(255,255,255,0.35)" }}>{color.label}</span>
            </button>
          )
        })}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {sequence.map((id, i) => {
          const c    = SIMON_COLORS.find(c => c.id === id)!
          const done = i < input.length
          return (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%",
              background: done ? c.bg : "rgba(255,255,255,0.12)",
              border: `2px solid ${done ? c.bg : "rgba(255,255,255,0.2)"}`,
              transition: "background 0.2s" }} />
          )
        })}
      </div>
    </div>
  )
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function AIBar({ reason, level, accent }: { reason: string; level: number; accent: string }) {
  return (
    <div style={{ ...S.aiBar, borderColor: `${accent}33`, background: `${accent}0D` }}>
      <span className="fp-float" style={{ fontSize: 22 }}>🤖</span>
      <span style={S.aiTxt}>{reason} · nivel {level}</span>
    </div>
  )
}
function TimerPill({ minutes, seconds, accent }: { minutes: number; seconds: string; accent?: string }) {
  return (
    <div style={{ ...S.timerPill, ...(accent ? { borderColor: `${accent}55` } : {}) }}>
      <span>⏰</span>
      <span style={{ fontWeight: 700 }}>{minutes}:{seconds}</span>
    </div>
  )
}
function StarsRow({ filled, total }: { filled: number; total: number }) {
  return (
    <div style={S.starsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i < filled ? "fp-star" : ""}
          style={{ fontSize: 22, opacity: i < filled ? 1 : 0.2, animationDelay: `${i * 0.06}s` }}>⭐</span>
      ))}
    </div>
  )
}
function RewardScreen({ stars, leveledUp, levelNum, subtitle, onRestart }:
  { stars: number; leveledUp: boolean; levelNum: number; subtitle: string; onRestart: () => void }) {
  return (
    <div style={S.rewardBody}>
      {leveledUp && <div className="fp-card-match" style={S.levelUpBanner}>🎊 ¡Subiste al nivel {levelNum}!</div>}
      <div className="fp-confetti-row" style={S.confettiRow}>
        {["🎉", "✨", "🎈", "🌈", "🎊"].map((e, i) => (
          <span key={i} style={{ fontSize: 26, animationDelay: `${i * 0.1}s` }}>{e}</span>
        ))}
      </div>
      <span className="fp-bounce" style={S.rewardEmoji}>🏆</span>
      <h2 style={S.rewardTitle}>¡Lo lograste!</h2>
      <p style={S.rewardSub}>{subtitle}</p>
      <div style={S.starsRowLarge}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < stars ? "fp-star" : ""}
            style={{ fontSize: 40, opacity: i < stars ? 1 : 0.2, animationDelay: `${i * 0.1}s` }}>⭐</span>
        ))}
      </div>
      <div className="fp-gems-anim" style={S.gemReward}>
        <span style={{ fontSize: 22 }}>💎</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--teal)" }}>+ {stars} gemas</span>
      </div>
      <div style={S.rewardBtns}>
        <button onClick={onRestart} className="fp-btn-pop" style={S.btnSecondary}>🔄 jugar otra vez</button>
        <Link href="/" className="fp-btn-pop" style={S.btnPrimary}>siguiente →</Link>
      </div>
    </div>
  )
}
function GameoverScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div style={S.rewardBody}>
      <span className="fp-bounce" style={{ fontSize: 64 }}>🦉</span>
      <h2 style={{ ...S.rewardTitle, color: "var(--coral)" }}>¡Casi lo logras!</h2>
      <p style={S.rewardSub}>Inténtalo de nuevo, tú puedes 💪</p>
      <div style={S.rewardBtns}>
        <button onClick={onRestart} className="fp-btn-pop" style={S.btnPrimary}>intentar de nuevo</button>
        <Link href="/" className="fp-btn-pop" style={S.btnSecondary}>ir al inicio</Link>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  main:             { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  header:           { padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)" },
  tealLine:         { height: 2, background: "var(--teal)" },
  backBtn:          { width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--white)", textDecoration: "none" },
  headerTitle:      { fontSize: 18, fontWeight: 600, color: "var(--teal)" },
  gemsPill:         { display: "flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "5px 12px" },
  gemsNum:          { fontSize: 15, fontWeight: 700, color: "var(--teal)" },

  // ── Tab bar estilo tarjetas ──
  tabBar:           { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, background: "var(--bg2)", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tabCard:          { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 18, border: "2px solid", cursor: "pointer", textAlign: "left" },
  tabIconCircle:    { width: 44, height: 44, minWidth: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  tabLabel:         { fontSize: 15, fontWeight: 700, lineHeight: 1.2 },
  tabSub:           { fontSize: 11, color: "var(--muted)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" },

  gameArea:         { flex: 1, display: "flex", flexDirection: "column", padding: 24, alignItems: "center" },
  body:             { width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 20, alignItems: "center" },
  aiBar:            { display: "flex", alignItems: "center", gap: 10, border: "1px solid", padding: "10px 16px", borderRadius: 16, width: "100%" },
  aiTxt:            { fontSize: 13, color: "var(--muted)" },
  gameHeader:       { display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" },
  gameTitle:        { fontSize: 20, fontWeight: 700 },
  timerPill:        { display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid transparent", padding: "6px 12px", borderRadius: 12 },
  grid:             { display: "grid", gap: 12 },
  card:             { aspectRatio: "1", borderRadius: 20, border: "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" },
  cardHidden:       { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.1)" },
  cardFlipped:      { background: "rgba(78,205,196,0.15)", borderColor: "var(--teal)" },
  cardMatched:      { background: "rgba(82,201,126,0.15)", borderColor: "var(--green)", opacity: 0.7 },
  cardEmoji:        { fontSize: 40 },
  cardQuestion:     { fontSize: 28, color: "var(--muted)" },
  starsRow:         { display: "flex", gap: 6 },
  starsRowLarge:    { display: "flex", gap: 10, margin: "12px 0" },
  pairsLabel:       { fontSize: 14, color: "var(--muted)", marginTop: -8 },
  emojiCard:        { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, width: "100%", padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  emojiSituation:   { fontSize: 16, fontStyle: "italic", color: "var(--muted)", textAlign: "center" },
  optionsGrid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" },
  optionBtn:        { padding: 18, borderRadius: 18, border: "3px solid", fontSize: 17, fontWeight: 500, color: "#fff", cursor: "pointer" },
  centeredSection:  { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 20px", gap: 16 },
  introTitle:       { fontSize: 28, fontWeight: 700 },
  introSub:         { fontSize: 16, color: "var(--muted)", maxWidth: 360 },
  introMeta:        { fontSize: 13, color: "var(--teal)", background: "rgba(78,205,196,0.1)", padding: "4px 12px", borderRadius: 20 },
  bigBtn:           { background: "var(--teal)", color: "#000", border: "none", padding: "16px 48px", borderRadius: 28, fontSize: 19, fontWeight: 700, cursor: "pointer", marginTop: 12 },
  breathWrap:       { height: 280, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" },
  breathRing:       { width: 220, height: 220, borderRadius: "50%", border: "2px dashed", display: "flex", alignItems: "center", justifyContent: "center" },
  breathOuter:      { width: 160, height: 160, borderRadius: "50%", border: "5px solid", display: "flex", alignItems: "center", justifyContent: "center" },
  breathInner:      { width: "90%", height: "90%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  phaseLabel:       { fontWeight: 700, letterSpacing: 1 },
  simonGrid:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, width: "100%", maxWidth: 340, aspectRatio: "1" },
  simonBtn:         { borderRadius: 28, border: "none", display: "flex", alignItems: "center", justifyContent: "center" },
  rewardBody:       { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40, gap: 14, flex: 1 },
  levelUpBanner:    { background: "var(--gold)", color: "#000", padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, marginBottom: 12 },
  confettiRow:      { display: "flex", gap: 8, justifyContent: "center" },
  rewardEmoji:      { fontSize: 72 },
  rewardTitle:      { fontSize: 34, fontWeight: 800 },
  rewardSub:        { fontSize: 16, color: "var(--muted)" },
  gemReward:        { display: "flex", alignItems: "center", gap: 8, margin: "8px 0", background: "rgba(78,205,196,0.1)", borderRadius: 999, padding: "8px 18px" },
  rewardBtns:       { display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", justifyContent: "center" },
  btnPrimary:       { background: "var(--teal)", color: "#000", border: "none", padding: "14px 28px", borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "inline-block", textDecoration: "none" },
  btnSecondary:     { background: "rgba(255,255,255,0.08)", color: "#fff", border: "none", padding: "14px 28px", borderRadius: 16, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "inline-block", textDecoration: "none" }
}