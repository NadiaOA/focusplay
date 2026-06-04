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

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "memorama",    icon: "🃏", label: "Memorama"  },
    { id: "emociones",   icon: "😊", label: "Emociones" },
    { id: "respiracion", icon: "🫧", label: "Respira"   },
    { id: "simon",       icon: "🔴", label: "Simón"     },
  ]

  return (
    <main style={S.main}>
      <header style={S.header}>
        <Link href="/" style={S.backBtn}>← volver</Link>
        <span style={S.headerTitle}>FocusPlay</span>
        <div style={S.gemsPill}>
          <span style={{ color: "var(--teal)" }}>◆</span>
          <span style={S.gemsNum}>{gems}</span>
        </div>
      </header>
      <div style={S.tealLine} />

      <nav style={S.tabBar}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...S.tabBtn, ...(tab === t.id ? S.tabBtnActive : {}) }}>
            <span>{t.icon}</span>
            <span style={{ fontSize: 11 }}>{t.label}</span>
          </button>
        ))}
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
      <span style={{ fontSize: 72 }}>🫧</span>
      <h2 style={{ ...S.rewardTitle, color: "var(--teal)", fontSize: 26 }}>
        Vamos a respirar un momento
      </h2>
      <p style={{ ...S.rewardSub, maxWidth: 320 }}>
        Tuviste 3 errores. ¡No pasa nada! Respira un poco y regresa con más calma.
      </p>
      <div style={S.rewardBtns}>
        <button onClick={() => onSwitchTab?.("respiracion")} style={S.btnPrimary}>
          🌬️ Ir a respiración
        </button>
        <button onClick={() => init(lv)} style={S.btnSecondary}>
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
      <AIBar reason={aiReason} level={lv} />

      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Errores:</span>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <span key={i} style={{ fontSize: 16, color: i < errors ? "var(--coral)" : "rgba(255,255,255,0.15)" }}>❌</span>
          ))}
        </div>
        <TimerPill minutes={minutes} seconds={seconds} />
      </div>

      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={S.gameTitle}>Encuentra los pares · {totalPairs} pares</span>
      </div>

      <div style={{ ...S.grid, gridTemplateColumns: `repeat(${gridCols}, 1fr)`, width: "100%" }}>
        {cards.map(card => {
          const isFlipped  = flipped.includes(card.cardId)
          const isMatched  = matched.includes(card.pairId)
          const isFlashing = flashCard === card.pairId
          return (
            <button key={card.cardId} onClick={() => handleFlip(card)}
              style={{ ...S.card,
                ...(isMatched ? S.cardMatched : isFlipped ? S.cardFlipped : S.cardHidden),
                animation: isFlashing ? "flash 0.3s ease 2" : undefined,
                transform: (isFlipped || isMatched) ? "scale(1.04)" : "scale(1)" }}>
              {isFlipped || isMatched
                ? <span style={S.cardEmoji}>{card.emoji}</span>
                : <span style={S.cardQuestion}>?</span>}
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
      <span style={{ fontSize: 72 }}>🫧</span>
      <h2 style={{ ...S.rewardTitle, color: "var(--teal)", fontSize: 26 }}>
        Vamos a respirar un momento
      </h2>
      <p style={{ ...S.rewardSub, maxWidth: 320 }}>
        Tuviste 3 errores seguidos. ¡No pasa nada! Respira y regresa con calma.
      </p>
      <div style={S.rewardBtns}>
        <button onClick={() => onSwitchTab?.("respiracion")} style={S.btnPrimary}>
          🌬️ Ir a respiración
        </button>
        <button onClick={() => { setPhase("playing"); setConsecErrors(0); setSelected(null) }} style={S.btnSecondary}>
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
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.gameHeader}>
        <span style={S.gameTitle}>¿Qué emoción es?</span>
        <TimerPill minutes={minutes} seconds={seconds} />
      </div>
      <div style={S.emojiCard}>
        <span style={{ fontSize: 96 }}>{q.emoji}</span>
        {q.situation && <p style={S.emojiSituation}>"{q.situation}"</p>}
      </div>
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
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.centeredSection}>
        <span style={{ fontSize: 80 }}>🫧</span>
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
      <div style={S.breathWrap}>
        <div style={{
          ...S.breathOuter,
          borderColor: breathColor,
          transform: `scale(${scale})`,
          transition: `transform ${curPhase?.seconds ?? 4}s ease-in-out`,
          boxShadow: `0 0 80px ${breathColor}55`,
        }}>
          <div style={{ ...S.breathInner, background: `${breathColor}22` }}>
            <span style={{ fontSize: 40 }}>
              {curPhase?.label === "Inhala" ? "🌬️" : curPhase?.label === "Mantén" ? "⏸️" : "😮‍💨"}
            </span>
          </div>
        </div>
      </div>
      <p style={{ ...S.phaseLabel, color: breathColor, fontSize: 28 }}>{curPhase?.label}</p>
      <p style={S.pairsLabel}>Sigue el ritmo del círculo</p>
      <div style={{ display: "flex", gap: 10 }}>
        {Array.from({ length: levelSet.rounds }).map((_, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: "50%",
            background: i < round ? "var(--teal)" : i === round ? breathColor : "rgba(255,255,255,0.15)" }} />
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
  
  // Nuevo estado para controlar las 3 partidas completas perdidas antes del break
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

  // Reinicia los contadores globales cuando regresa de respirar por completo
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

      // Si acumula 3 partidas perdidas, lo manda al break de respiración
      if (nextLostGames >= 3) {
        setSimonPhase("breathbreak")
      } else {
        // Si no, lo manda a la pantalla normal de Gameover para que lo intente de nuevo
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
        setLostGames(0) // Reinicia las derrotas si gana el nivel completo
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
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.centeredSection}>
        <span style={{ fontSize: 80 }}>🔴🟢🔵🟡</span>
        <h2 style={S.introTitle}>Simón Dice</h2>
        <p style={S.introSub}>Memoriza y repite la secuencia de colores</p>
        <p style={S.introMeta}>Objetivo: {levelSet.maxLength} colores · Nivel {diffLevel}</p>
        <button onClick={startGame} style={S.bigBtn}>¡Jugar!</button>
      </div>
    </div>
  )

  if (simonPhase === "breathbreak") return (
    <div style={S.rewardBody}>
      <span style={{ fontSize: 72 }}>🫧</span>
      <h2 style={{ ...S.rewardTitle, color: "var(--teal)", fontSize: 26 }}>
        Vamos a respirar un momento
      </h2>
      <p style={{ ...S.rewardSub, maxWidth: 320 }}>
        Perdiste 3 partidas completas. ¡No pasa nada! Vamos a relajarnos un poco y regresar con calma.
      </p>
      <div style={S.rewardBtns}>
        <button onClick={() => onSwitchTab?.("respiracion")} style={S.btnPrimary}>
          🌬️ Ir a respiración
        </button>
        <button onClick={fullReset} style={S.btnSecondary}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  )

  return (
    <div style={S.body}>
      <AIBar reason={aiReason} level={diffLevel} />
      <div style={S.gameHeader}>
        <span style={S.gameTitle}>
          {simonPhase === "showing" ? "👀 Observa…" : `✋ Tu turno (${input.length}/${sequence.length})`}
        </span>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {/* Indicador de partidas perdidas usando las equis */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ fontSize: 14, color: i < lostGames ? "var(--coral)" : "rgba(255,255,255,0.15)" }}>❌</span>
            ))}
          </div>
          <div style={S.timerPill}>
            <span style={{ fontWeight: 700, color: "var(--gold)" }}>{sequence.length} colores</span>
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
              style={{
                ...S.simonBtn,
                background: isActive ? color.bg : color.dim,
                boxShadow: isActive ? `0 0 50px ${color.bg}99` : "none",
                transform: isActive || isPressed ? "scale(0.94)" : "scale(1)",
                transition: "background 0.12s, transform 0.1s, box-shadow 0.12s",
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  main:             { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  header:           { padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)" },
  tealLine:         { height: 2, background: "var(--teal)" },
  backBtn:          { background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "var(--muted)", display: "block" },
  headerTitle:      { fontSize: 18, fontWeight: 600, color: "var(--teal)" },
  gemsPill:         { display: "flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "5px 12px" },
  gemsNum:          { fontSize: 15, fontWeight: 700, color: "var(--teal)" },
  tabBar:           { display: "flex", background: "var(--bg2)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 8px" },
  tabBtn:           { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 4px", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, borderBottom: "2px solid transparent", transition: "color 0.15s, border-color 0.15s" },
  tabBtnActive:     { color: "var(--teal)", borderBottomColor: "var(--teal)" },
  gameArea:         { flex: 1, display: "flex", flexDirection: "column", padding: 24, alignItems: "center" },
  body:             { width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 20, alignItems: "center" },
  aiBar:            { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", padding: "6px 12px", borderRadius: 12, width: "100%" },
  aiDot:            { width: 8, height: 8, background: "var(--teal)", borderRadius: "50%" },
  aiTxt:            { fontSize: 12, color: "var(--muted)" },
  gameHeader:       { display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" },
  gameTitle:        { fontSize: 20, fontWeight: 600 },
  timerPill:        { display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", padding: "6px 12px", borderRadius: 12 },
  grid:             { display: "grid", gap: 12 },
  card:             { aspectRatio: "1", borderRadius: 16, border: "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" },
  cardHidden:       { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.1)" },
  cardFlipped:      { background: "rgba(78,205,196,0.15)", borderColor: "var(--teal)" },
  cardMatched:      { background: "rgba(82,201,126,0.15)", borderColor: "var(--green)", opacity: 0.7 },
  cardEmoji:        { fontSize: 32 },
  cardQuestion:     { fontSize: 24, color: "var(--muted)" },
  starsRow:         { display: "flex", gap: 4 },
  starsRowLarge:    { display: "flex", gap: 8, margin: "12px 0" },
  pairsLabel:       { fontSize: 14, color: "var(--muted)", marginTop: -8 },
  emojiCard:        { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, width: "100%", padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  emojiSituation:   { fontSize: 16, fontStyle: "italic", color: "var(--muted)", textAlign: "center" },
  optionsGrid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" },
  optionBtn:        { padding: 16, borderRadius: 16, border: "2px solid", fontSize: 16, fontWeight: 500, color: "#fff", cursor: "pointer", transition: "all 0.15s" },
  centeredSection:  { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 20px", gap: 16 },
  introTitle:       { fontSize: 28, fontWeight: 700 },
  introSub:         { fontSize: 16, color: "var(--muted)", maxWidth: 360 },
  introMeta:        { fontSize: 13, color: "var(--teal)", background: "rgba(78,205,196,0.1)", padding: "4px 12px", borderRadius: 20 },
  bigBtn:           { background: "var(--teal)", color: "#000", border: "none", padding: "14px 40px", borderRadius: 24, fontSize: 18, fontWeight: 700, cursor: "pointer", marginTop: 12 },
  breathWrap:       { height: 260, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" },
  breathOuter:      { width: 140, height: 140, borderRadius: "50%", border: "4px solid", display: "flex", alignItems: "center", justifyContent: "center" },
  breathInner:      { width: "90%", height: "90%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  phaseLabel:       { fontWeight: 700, letterSpacing: 1 },
  simonGrid:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", maxWidth: 340, aspectRatio: "1" },
  simonBtn:         { borderRadius: 24, border: "none", display: "flex", alignItems: "center", justifyContent: "center" },
  rewardBody:       { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40, gap: 12, flex: 1 },
  levelUpBanner:    { background: "var(--gold)", color: "#000", padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, marginBottom: 12 },
  rewardEmoji:      { fontSize: 64 },
  rewardTitle:      { fontSize: 32, fontWeight: 800 },
  rewardSub:        { fontSize: 16, color: "var(--muted)" },
  gemReward:        { display: "flex", alignItems: "center", gap: 8, margin: "8px 0" },
  rewardBtns:       { display: "flex", gap: 12, marginTop: 20 },
  btnPrimary:       { background: "var(--teal)", color: "#000", border: "none", padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-block", textDecoration: "none" },
  btnSecondary:     { background: "rgba(255,255,255,0.08)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "inline-block", textDecoration: "none" }
}