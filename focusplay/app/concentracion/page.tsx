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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Tab    = "memorama" | "emociones" | "respiracion" | "simon"
type Phase  = "playing" | "reward" | "gameover"
type Card   = { cardId: string; pairId: string; emoji: string; label: string }

// ─────────────────────────────────────────────────────────────────────────────
// Root page — just renders the tab shell + active game
// ─────────────────────────────────────────────────────────────────────────────
export default function Concentracion() {
  const router   = useRouter()
  const nameRef  = useRef<string>("")
  const [gems, setGems]     = useState(0)
  const [tab, setTab]       = useState<Tab>("memorama")
  const [ready, setReady]   = useState(false)

  useEffect(() => {
    const name = getCurrentUser()
    if (!name) { router.push("/login"); return }
    nameRef.current = name
    setGems(getProfile().gems)
    setReady(true)
  }, [router])

  if (!ready) return null

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "memorama",    icon: "🃏", label: "Memorama"  },
    { id: "emociones",   icon: "😊", label: "Emociones" },
    { id: "respiracion", icon: "🫧", label: "Respira"   },
    { id: "simon",       icon: "🔴", label: "Simón"     },
  ]

  return (
    <main style={S.main}>
      {/* ── Header ── */}
      <header style={S.header}>
        <Link href="/" style={S.backBtn}>← volver</Link>
        <span style={S.headerTitle}>FocusPlay</span>
        <div style={S.gemsPill}>
          <span style={{ color: "var(--teal)" }}>◆</span>
          <span style={S.gemsNum}>{gems}</span>
        </div>
      </header>
      <div style={S.tealLine} />

      {/* ── Tabs ── */}
      <nav style={S.tabBar}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...S.tabBtn, ...(tab === t.id ? S.tabBtnActive : {}) }}>
            <span>{t.icon}</span>
            <span style={{ fontSize: 11 }}>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Active game ── */}
      <div style={S.gameArea}>
        {tab === "memorama"    && <GameMemorama    nameRef={nameRef} onGemsChange={setGems} />}
        {tab === "emociones"   && <GameEmociones   nameRef={nameRef} onGemsChange={setGems} />}
        {tab === "respiracion" && <GameRespiracion nameRef={nameRef} onGemsChange={setGems} />}
        {tab === "simon"       && <GameSimon       nameRef={nameRef} onGemsChange={setGems} />}
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared props
// ─────────────────────────────────────────────────────────────────────────────
interface GameProps {
  nameRef: React.MutableRefObject<string>
  onGemsChange: (n: number) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 1 — MEMORAMA (unchanged logic, extracted to component)
// ─────────────────────────────────────────────────────────────────────────────
function GameMemorama({ nameRef, onGemsChange }: GameProps) {
  const [cards, setCards]       = useState<Card[]>([])
  const [flipped, setFlipped]   = useState<string[]>([])
  const [matched, setMatched]   = useState<string[]>([])
  const [phase, setPhase]       = useState<Phase>("playing")
  const [timeLeft, setTimeLeft] = useState(90)
  const [stars, setStars]       = useState(0)
  const [blocking, setBlocking] = useState(false)
  const [flashCard, setFlashCard] = useState<string | null>(null)
  const [leveledUp, setLeveledUp] = useState(false)
  const [aiReason, setAiReason] = useState("")
  const [diffLevel, setDiffLevel] = useState(1)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const flipTime  = useRef(0)

  const init = () => {
    const diff = getAIDifficulty()
    const lv   = Math.min(3, Math.max(1, diff.level)) as 1|2|3
    setDiffLevel(lv)
    setAiReason(diff.reason)
    setTimeLeft(MEMORY_LEVELS[lv].timeSeconds)
    setCards(buildCards(MEMORY_LEVELS[lv]))
    setFlipped([]); setMatched([]); setPhase("playing"); setBlocking(false)
    setLeveledUp(false); flipTime.current = 0
  }
  useEffect(init, [])

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

  const set        = MEMORY_LEVELS[(diffLevel as 1|2|3)] ?? MEMORY_LEVELS[1]
  const totalPairs = set.pairs.length
  const minutes    = Math.floor(timeLeft / 60)
  const seconds    = String(timeLeft % 60).padStart(2, "0")

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
        setTimeout(() => { setFlipped([]); setBlocking(false) }, 900)
      }
    }
    flipTime.current = now
  }

  if (phase === "reward") return <RewardScreen stars={stars} leveledUp={leveledUp}
    levelNum={getProfile().concentracionLevel} subtitle="completaste todos los pares" onRestart={init} />
  if (phase === "gameover") return <GameoverScreen onRestart={init} />

  return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.gameHeader}>
        <span style={S.gameTitle}>Encuentra los pares</span>
        <TimerPill minutes={minutes} seconds={seconds} />
      </div>
      <div style={{ ...S.grid, gridTemplateColumns: "repeat(4, 1fr)" }}>
        {cards.map(card => {
          const isFlipped  = flipped.includes(card.cardId)
          const isMatched  = matched.includes(card.pairId)
          const isFlashing = flashCard === card.pairId
          return (
            <button key={card.cardId} onClick={() => handleFlip(card)}
              style={{ ...S.card, ...(isMatched ? S.cardMatched : isFlipped ? S.cardFlipped : S.cardHidden),
                animation: isFlashing ? "flash 0.3s ease 2" : undefined,
                transform: (isFlipped || isMatched) ? "scale(1.04)" : "scale(1)" }}>
              {isFlipped || isMatched
                ? <span style={S.cardEmoji}>{card.emoji}</span>
                : <span style={S.cardQuestion}>?</span>}
            </button>
          )
        })}
      </div>
      <StarsRow filled={matched.length} total={5} />
      <p style={S.pairsLabel}>{matched.length} pares encontrados · {totalPairs - matched.length} por encontrar</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 2 — EMOCIONES
// ─────────────────────────────────────────────────────────────────────────────
function GameEmociones({ nameRef, onGemsChange }: GameProps) {
  const p        = getProfile() as any
  const diffLevel = Math.min(3, Math.max(1, (p.emocionesLevel ?? 1))) as 1|2|3
  const levelSet  = EMOCION_LEVELS[diffLevel]

  const [questions, setQuestions] = useState<EmocionQuestion[]>([])
  const [current, setCurrent]     = useState(0)
  const [selected, setSelected]   = useState<string | null>(null)
  const [correct, setCorrect]     = useState<boolean | null>(null)
  const [score, setScore]         = useState(0)
  const [phase, setPhase]         = useState<Phase>("playing")
  const [timeLeft, setTimeLeft]   = useState(levelSet.timeSeconds)
  const [stars, setStars]         = useState(0)
  const [leveledUp, setLeveledUp] = useState(false)
  const [aiReason]                = useState(getAIDifficulty().reason)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const init = () => {
    const qs = [...levelSet.questions].sort(() => Math.random() - 0.5).slice(0, levelSet.totalQuestions)
    setQuestions(qs); setCurrent(0); setSelected(null); setCorrect(null)
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
    setSelected(option); setCorrect(hit)
    recordActivity(2000, !hit)
    if (hit) setScore(s => s + 1)

    setTimeout(() => {
      const next = current + 1
      if (next >= questions.length) {
        const earned = Math.min(5, Math.round((score + (hit ? 1 : 0)) / questions.length * 5))
        setStars(earned)
        const res = recordEmocionesResult(nameRef.current, true, earned)
        onGemsChange(res.profile.gems); setLeveledUp(res.leveledUp); setPhase("reward")
      } else {
        setCurrent(next); setSelected(null); setCorrect(null)
      }
    }, 900)
  }

  if (phase === "reward") return <RewardScreen stars={stars} leveledUp={leveledUp}
    levelNum={(getProfile() as any).emocionesLevel ?? 1} subtitle="¡identificaste todas las emociones!" onRestart={init} />
  if (phase === "gameover") return <GameoverScreen onRestart={init} />
  if (!questions.length) return null

  const q       = questions[current]
  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, "0")

  return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.gameHeader}>
        <span style={S.gameTitle}>¿Qué emoción es?</span>
        <TimerPill minutes={minutes} seconds={seconds} />
      </div>

      {/* Emoji grande */}
      <div style={S.emojiCard}>
        <span style={{ fontSize: 72 }}>{q.emoji}</span>
        {q.situation && <p style={S.emojiSituation}>"{q.situation}"</p>}
      </div>

      {/* Opciones */}
      <div style={S.optionsGrid}>
        {q.options.map(opt => {
          let bg = "rgba(255,255,255,0.07)"
          let border = "rgba(255,255,255,0.12)"
          if (selected !== null) {
            if (opt === q.label)       { bg = "rgba(82,201,126,0.25)"; border = "var(--green)" }
            else if (opt === selected) { bg = "rgba(255,107,107,0.25)"; border = "var(--coral)" }
          }
          return (
            <button key={opt} onClick={() => choose(opt)}
              style={{ ...S.optionBtn, background: bg, borderColor: border,
                transform: selected === opt ? "scale(1.04)" : "scale(1)" }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// GAME 3 — RESPIRACIÓN CONTROLADA
// ─────────────────────────────────────────────────────────────────────────────
function GameRespiracion({ nameRef, onGemsChange }: GameProps) {
  const pr       = getProfile() as any
  const diffLevel = Math.min(3, Math.max(1, (pr.respiracionLevel ?? 1))) as 1|2|3
  const levelSet  = RESPIRACION_LEVELS[diffLevel]

  const [phase, setPhase]           = useState<"intro" | "breathing" | Phase>("intro")
  const [round, setRound]           = useState(0)
  const [phaseIdx, setPhaseIdx]     = useState(0)
  const [phaseTime, setPhaseTime]   = useState(0)
  const [scale, setScale]           = useState(1)
  const [stars, setStars]           = useState(0)
  const [leveledUp, setLeveledUp]   = useState(false)
  const [aiReason]                  = useState(getAIDifficulty().reason)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const phases   = levelSet.phases
  const curPhase = phases[phaseIdx] as BreathPhase | undefined

  function startBreathing() { setPhase("breathing"); setRound(0); setPhaseIdx(0); setPhaseTime(phases[0].seconds) }

  useEffect(() => {
    if (phase !== "breathing") { if (timerRef.current) clearInterval(timerRef.current); return }
    // Animate circle
    const target = phases[phaseIdx].label === "Inhala" ? 1.55
                 : phases[phaseIdx].label === "Mantén" ? 1.55 : 1.0
    setScale(target)

    timerRef.current = setInterval(() => {
      setPhaseTime(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          const nextPIdx = (phaseIdx + 1) % phases.length
          if (nextPIdx === 0) {
            // Completed a full round
            const nextRound = round + 1
            if (nextRound >= levelSet.rounds) {
              // Done!
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
    setPhase("intro"); setRound(0); setPhaseIdx(0); setPhaseTime(phases[0].seconds)
    setScale(1); setLeveledUp(false)
  }

  if (phase === "reward") return <RewardScreen stars={stars} leveledUp={leveledUp}
    levelNum={(getProfile() as any).respiracionLevel ?? 1} subtitle="¡completaste todas las rondas de respiración!" onRestart={init} />

  if (phase === "intro") return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.centeredSection}>
        <span style={{ fontSize: 64 }}>🫧</span>
        <h2 style={S.introTitle}>Respiración guiada</h2>
        <p style={S.introSub}>{levelSet.tip}</p>
        <p style={S.introMeta}>{levelSet.rounds} rondas · {phases.map(p => p.label).join(" → ")}</p>
        <button onClick={startBreathing} style={S.bigBtn}>Comenzar</button>
      </div>
    </div>
  )

  const breathColor = curPhase?.color ?? "var(--teal)"

  return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.gameHeader}>
        <span style={S.gameTitle}>Ronda {round + 1} de {levelSet.rounds}</span>
        <div style={S.timerPill}>
          <span style={{ color: breathColor, fontWeight: 700 }}>{phaseTime}s</span>
        </div>
      </div>

      {/* Breathing circle */}
      <div style={S.breathWrap}>
        <div style={{
          ...S.breathOuter,
          borderColor: breathColor,
          transform: `scale(${scale})`,
          transition: `transform ${curPhase?.seconds ?? 4}s ease-in-out`,
          boxShadow: `0 0 60px ${breathColor}55`,
        }}>
          <div style={{ ...S.breathInner, background: `${breathColor}22` }}>
            <span style={{ fontSize: 32 }}>
              {curPhase?.label === "Inhala" ? "🌬️"
               : curPhase?.label === "Mantén" ? "⏸️" : "😮‍💨"}
            </span>
          </div>
        </div>
      </div>

      <p style={{ ...S.phaseLabel, color: breathColor }}>{curPhase?.label}</p>
      <p style={S.pairsLabel}>Sigue el ritmo del círculo</p>

      {/* Round dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {Array.from({ length: levelSet.rounds }).map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%",
            background: i < round ? "var(--teal)" : i === round ? breathColor : "rgba(255,255,255,0.15)" }} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 4 — SIMÓN DICE
// ─────────────────────────────────────────────────────────────────────────────
function GameSimon({ nameRef, onGemsChange }: GameProps) {
  const pr       = getProfile() as any
  const diffLevel = Math.min(3, Math.max(1, (pr.simonLevel ?? 1))) as 1|2|3
  const levelSet  = SIMON_LEVELS[diffLevel]

  type SimonPhase = "intro" | "showing" | "input" | Phase
  const [simonPhase, setSimonPhase] = useState<SimonPhase>("intro")
  const [sequence, setSequence]     = useState<string[]>([])
  const [input, setInput]           = useState<string[]>([])
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [stars, setStars]           = useState(0)
  const [leveledUp, setLeveledUp]   = useState(false)
  const [aiReason]                  = useState(getAIDifficulty().reason)
  const [strictMode, setStrictMode] = useState(false) // highlight wrong press

  function playTone(freq: number) {
    try {
      const ctx  = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = "sine"
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(); osc.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  function flashColor(id: string, freq: number, durationMs: number) {
    setActiveColor(id)
    playTone(freq)
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
    setSequence(first)
    showSequence(first)
  }

  function init() { setSimonPhase("intro"); setSequence([]); setInput([]); setActiveColor(null); setLeveledUp(false) }

  async function handlePress(color: SimonColor) {
    if (simonPhase !== "input") return
    const idx     = input.length
    const correct = sequence[idx]
    const newInput = [...input, color.id]
    setInput(newInput)
    await flashColor(color.id, color.sound, 200)

    if (color.id !== correct) {
      // Wrong!
      setStrictMode(true)
      setTimeout(() => setStrictMode(false), 600)
      recordActivity(2000, true)
      const res = recordSimonResult(nameRef.current, false, 0)
      onGemsChange(res.profile.gems)
      setSimonPhase("gameover"); return
    }

    if (newInput.length === sequence.length) {
      // Correct full sequence
      recordActivity(1500, false)
      if (sequence.length >= levelSet.maxLength) {
        // Won!
        const earned = Math.min(5, 3 + Math.floor(sequence.length / 2))
        setStars(earned)
        const res = recordSimonResult(nameRef.current, true, earned)
        onGemsChange(res.profile.gems); setLeveledUp(res.leveledUp); setSimonPhase("reward")
      } else {
        // Next round — extend sequence
        await new Promise(r => setTimeout(r, 500))
        const nextSeq = [...sequence, SIMON_COLORS[Math.floor(Math.random() * 4)].id]
        setSequence(nextSeq)
        showSequence(nextSeq)
      }
    }
  }

  if (simonPhase === "reward") return <RewardScreen stars={stars} leveledUp={leveledUp}
    levelNum={(getProfile() as any).simonLevel ?? 1} subtitle={`¡completaste ${sequence.length} colores seguidos!`} onRestart={init} />
  if (simonPhase === "gameover") return <GameoverScreen onRestart={init} />

  if (simonPhase === "intro") return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.centeredSection}>
        <span style={{ fontSize: 64 }}>🔴🟢🔵🟡</span>
        <h2 style={S.introTitle}>Simón Dice</h2>
        <p style={S.introSub}>Memoriza y repite la secuencia de colores</p>
        <p style={S.introMeta}>Objetivo: {levelSet.maxLength} colores seguidos · Nivel {diffLevel}</p>
        <button onClick={startGame} style={S.bigBtn}>¡Jugar!</button>
      </div>
    </div>
  )

  const progress = `${input.length} / ${sequence.length}`

  return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.gameHeader}>
        <span style={S.gameTitle}>
          {simonPhase === "showing" ? "👀 Observa…" : `✋ Tu turno (${progress})`}
        </span>
        <div style={S.timerPill}>
          <span style={{ fontWeight: 700, color: "var(--gold)" }}>{sequence.length} colores</span>
        </div>
      </div>

      {/* 2x2 color grid */}
      <div style={S.simonGrid}>
        {SIMON_COLORS.map(color => {
          const isActive  = activeColor === color.id
          const isPressed = simonPhase === "input" && input[input.length - 1] === color.id
          return (
            <button key={color.id}
              onClick={() => handlePress(color)}
              disabled={simonPhase === "showing"}
              style={{
                ...S.simonBtn,
                background: isActive ? color.bg : color.dim,
                boxShadow: isActive ? `0 0 40px ${color.bg}99` : "none",
                transform: isActive || isPressed ? "scale(0.94)" : "scale(1)",
                transition: "background 0.12s, transform 0.1s, box-shadow 0.12s",
                cursor: simonPhase === "showing" ? "default" : "pointer",
                opacity: simonPhase === "showing" ? 0.85 : 1,
              }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                letterSpacing: 0.5 }}>{color.label}</span>
            </button>
          )
        })}
      </div>

      {/* Sequence progress dots */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {sequence.map((id, i) => {
          const c = SIMON_COLORS.find(c => c.id === id)!
          const done = i < input.length
          return (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: "50%",
              background: done ? c.bg : "rgba(255,255,255,0.12)",
              border: `2px solid ${done ? c.bg : "rgba(255,255,255,0.2)"}`,
              transition: "background 0.2s",
            }} />
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI components
// ─────────────────────────────────────────────────────────────────────────────
function AIBar({ reason, level }: { reason: string; level: number }) {
  return (
    <div style={S.aiBar}>
      <span style={S.aiDot} />
      <span style={S.aiTxt}>{reason} · nivel {level}</span>
    </div>
  )
}

function TimerPill({ minutes, seconds }: { minutes: number; seconds: string }) {
  return (
    <div style={S.timerPill}>
      <span>⏱</span>
      <span style={{ fontWeight: 700 }}>{minutes}:{seconds}</span>
    </div>
  )
}

function StarsRow({ filled, total }: { filled: number; total: number }) {
  return (
    <div style={S.starsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ fontSize: 18, color: i < filled ? "var(--gold)" : "rgba(255,255,255,0.15)" }}>★</span>
      ))}
    </div>
  )
}

function RewardScreen({ stars, leveledUp, levelNum, subtitle, onRestart }:
  { stars: number; leveledUp: boolean; levelNum: number; subtitle: string; onRestart: () => void }) {
  return (
    <div style={S.rewardBody}>
      {leveledUp && <div style={S.levelUpBanner}>🎊 ¡Subiste al nivel {levelNum}!</div>}
      <span style={S.rewardEmoji}>🎉</span>
      <h2 style={S.rewardTitle}>¡Lo lograste!</h2>
      <p style={S.rewardSub}>{subtitle}</p>
      <div style={S.starsRowLarge}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ fontSize: 36, color: i < stars ? "var(--gold)" : "rgba(255,255,255,0.15)" }}>★</span>
        ))}
      </div>
      <div style={S.gemReward}>
        <span style={{ color: "var(--teal)" }}>◆◆◆</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--teal)" }}>+ {stars} gemas</span>
      </div>
      <div style={S.rewardBtns}>
        <button onClick={onRestart} style={S.btnSecondary}>jugar otra vez</button>
        <Link href="/" style={S.btnPrimary}>siguiente →</Link>
      </div>
    </div>
  )
}

function GameoverScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div style={S.rewardBody}>
      <span style={{ fontSize: 64 }}>⏰</span>
      <h2 style={{ ...S.rewardTitle, color: "var(--coral)" }}>¡Inténtalo de nuevo!</h2>
      <p style={S.rewardSub}>Casi lo logras 💪</p>
      <div style={S.rewardBtns}>
        <button onClick={onRestart} style={S.btnPrimary}>intentar de nuevo</button>
        <Link href="/" style={S.btnSecondary}>ir al inicio</Link>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  main:          { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  header:        { padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)" },
  tealLine:      { height: 2, background: "var(--teal)" },
  backBtn:       { background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "var(--muted)", display: "block" },
  headerTitle:   { fontSize: 18, fontWeight: 600, color: "var(--teal)" },
  gemsPill:      { display: "flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "5px 12px" },
  gemsNum:       { fontSize: 15, fontWeight: 700, color: "var(--teal)" },

  // Tab bar
  tabBar:        { display: "flex", background: "var(--bg2)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 8px" },
  tabBtn:        { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 4px", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, borderBottom: "2px solid transparent", transition: "color 0.15s, border-color 0.15s" },
  tabBtnActive:  { color: "var(--teal)", borderBottomColor: "var(--teal)" },

  gameArea:      { flex: 1, display: "flex", flexDirection: "column" },

  // Shared game layout
  body:          { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 24px", gap: 16, maxWidth: 600, margin: "0 auto", width: "100%" },
  aiBar:         { background: "rgba(78,205,196,0.07)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, width: "100%" },
  aiDot:         { width: 7, height: 7, borderRadius: "50%", background: "var(--teal)", flexShrink: 0 },
  aiTxt:         { fontSize: 11, color: "var(--muted)" },
  gameHeader:    { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" },
  gameTitle:     { fontSize: 18, color: "rgba(255,255,255,0.75)" },
  timerPill:     { background: "rgba(255,209,102,0.15)", border: "1px solid rgba(255,209,102,0.4)", borderRadius: 12, padding: "5px 14px", fontSize: 15, color: "var(--gold)", display: "flex", gap: 6, alignItems: "center" },
  starsRow:      { display: "flex", gap: 6 },
  pairsLabel:    { fontSize: 13, color: "var(--muted)" },

  // Memorama cards
  grid:          { display: "grid", gap: 12, width: "100%" },
  card:          { borderRadius: 14, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.15s, background 0.2s", border: "2px solid" },
  cardHidden:    { background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" },
  cardFlipped:   { background: "rgba(78,205,196,0.2)", borderColor: "var(--teal)" },
  cardMatched:   { background: "rgba(82,201,126,0.2)", borderColor: "var(--green)" },
  cardEmoji:     { fontSize: 36 },
  cardQuestion:  { fontSize: 28, color: "rgba(255,255,255,0.18)", fontWeight: 700 },

  // Emociones
  emojiCard:     { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" },
  emojiSituation:{ fontSize: 14, color: "var(--muted)", textAlign: "center", fontStyle: "italic", maxWidth: 300, margin: 0 },
  optionsGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" },
  optionBtn:     { borderRadius: 14, padding: "14px 10px", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)", cursor: "pointer", border: "2px solid", transition: "transform 0.12s, background 0.2s, border-color 0.2s", textTransform: "capitalize" },

  // Respiracion
  centeredSection: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", padding: "0 16px" },
  introTitle:    { fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.9)", margin: 0 },
  introSub:      { fontSize: 15, color: "var(--muted)", margin: 0 },
  introMeta:     { fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 },
  bigBtn:        { background: "var(--teal)", borderRadius: 16, padding: "14px 40px", fontSize: 17, fontWeight: 700, color: "#1C2B3A", cursor: "pointer", border: "none", marginTop: 8 },
  breathWrap:    { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "16px 0" },
  breathOuter:   { width: 160, height: 160, borderRadius: "50%", border: "3px solid", display: "flex", alignItems: "center", justifyContent: "center" },
  breathInner:   { width: 120, height: 120, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  phaseLabel:    { fontSize: 22, fontWeight: 700, letterSpacing: 1, margin: 0 },

  // Simón
  simonGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 320 },
  simonBtn:      { borderRadius: 20, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", border: "none", fontSize: 15 },

  // Reward / Gameover
  rewardBody:    { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "32px 24px", textAlign: "center" },
  levelUpBanner: { background: "rgba(255,209,102,0.15)", border: "1px solid var(--gold)", borderRadius: 12, padding: "10px 20px", fontSize: 15, fontWeight: 600, color: "var(--gold)" },
  rewardEmoji:   { fontSize: 72, display: "block" },
  rewardTitle:   { fontSize: 34, fontWeight: 700, color: "var(--gold)", margin: 0 },
  rewardSub:     { fontSize: 16, color: "var(--muted)", margin: 0 },
  starsRowLarge: { display: "flex", gap: 8 },
  gemReward:     { background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.35)", borderRadius: 14, padding: "14px 28px", display: "flex", alignItems: "center", gap: 12 },
  rewardBtns:    { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  btnPrimary:    { background: "var(--teal)", borderRadius: 14, padding: "13px 28px", fontSize: 16, fontWeight: 600, color: "#1C2B3A", cursor: "pointer", border: "none", display: "block" },
  btnSecondary:  { background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "13px 28px", fontSize: 16, color: "rgba(255,255,255,0.7)", cursor: "pointer", border: "none" },
}