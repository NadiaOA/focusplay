"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getProfile, addGems, recordActivity } from "@/lib/store"
import { SCENARIOS, type Scenario, type Option } from "@/lib/scenarios"

type Phase = "question" | "feedback" | "reward"

export default function Amigos() {
  const profile  = getProfile()
  const [gems, setGems]           = useState(profile.gems)
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [selected, setSelected]   = useState<Option | null>(null)
  const [phase, setPhase]         = useState<Phase>("question")
  const [score, setScore]         = useState(0)
  const [aiFeedback, setAiFeedback] = useState("")
  const [loadingAI, setLoadingAI] = useState(false)
  const [flipStart, setFlipStart] = useState<number>(0)

  const scenario: Scenario = SCENARIOS[scenarioIndex % SCENARIOS.length]
  const total = SCENARIOS.length

  useEffect(() => {
    setFlipStart(Date.now())
  }, [scenarioIndex])

  const handleSelect = async (option: Option) => {
    if (phase !== "question") return

    const responseTime = Date.now() - flipStart
    recordActivity(responseTime, !option.isCorrect)

    setSelected(option)
    setPhase("feedback")

    if (option.isCorrect) {
      setScore((s) => s + 1)
      const newGems = addGems(1)
      setGems(newGems)
    }

    // Get AI feedback via API route
    setLoadingAI(true)
    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: scenario.situation,
          chosenOption: option.text,
          isCorrect: option.isCorrect,
          staticFeedback: option.feedback,
        }),
      })
      const data = await res.json()
      setAiFeedback(data.feedback || option.feedback)
    } catch {
      setAiFeedback(option.feedback)
    }
    setLoadingAI(false)
  }

  const nextScenario = () => {
    const next = scenarioIndex + 1
    if (next >= total) {
      setPhase("reward")
    } else {
      setScenarioIndex(next)
      setSelected(null)
      setPhase("question")
      setAiFeedback("")
    }
  }

  const restart = () => {
    setScenarioIndex(0)
    setSelected(null)
    setPhase("question")
    setScore(0)
    setAiFeedback("")
  }

  return (
    <main style={S.main}>
      <header style={S.header}>
        <Link href="/" style={S.backBtn}>← volver</Link>
        <span style={{ ...S.title, color: phase === "reward" ? "var(--teal)" : "var(--coral)" }}>
          {phase === "reward" ? "FocusPlay" : "Amigos"}
        </span>
        <div style={S.gemsPill}>
          <span style={{ color: "var(--teal)" }}>◆</span>
          <span style={S.gemsNum}>{gems}</span>
        </div>
      </header>
      <div style={S.tealLine} />

      {(phase === "question" || phase === "feedback") && (
        <div style={S.body} className="anim-fadein">
          {/* Progress dots */}
          <div style={S.progressDots}>
            {SCENARIOS.map((_, i) => (
              <div key={i} style={{
                ...S.dot,
                background: i < scenarioIndex ? "var(--green)"
                  : i === scenarioIndex ? "var(--coral)"
                  : "rgba(255,255,255,0.15)",
              }} />
            ))}
          </div>

          {/* Situation card */}
          <div style={S.situationCard}>
            <div style={S.characterBubble}>
              <span style={S.characterEmoji}>{scenario.characterEmoji}</span>
            </div>
            <div style={S.bubble}>
              <p style={S.situationText}>{scenario.situation}</p>
              <p style={S.questionText}>{scenario.question}</p>
            </div>
          </div>

          {phase === "question" && (
            <>
              <p style={S.chooseLabel}>elige una respuesta:</p>
              <div style={S.optionsList}>
                {scenario.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    style={S.optionBtn}
                    className="anim-fadein"
                  >
                    <span style={S.optionEmoji}>{opt.emoji}</span>
                    <span style={S.optionText}>{opt.text}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === "feedback" && selected && (
            <div style={S.feedbackArea} className="anim-fadein">
              {/* Selected option highlighted */}
              <div style={{
                ...S.selectedOption,
                background: selected.isCorrect ? "rgba(82,201,126,0.15)" : "rgba(255,107,107,0.1)",
                borderColor: selected.isCorrect ? "var(--green)" : "var(--coral)",
              }}>
                <span style={S.optionEmoji}>{selected.emoji}</span>
                <span style={S.optionText}>{selected.text}</span>
                <span style={{
                  ...S.checkmark,
                  background: selected.isCorrect ? "var(--green)" : "var(--coral)",
                }}>
                  {selected.isCorrect ? "✓" : "✕"}
                </span>
              </div>

              {/* AI Feedback box */}
              <div style={{
                ...S.aiFeedbackBox,
                background: selected.isCorrect ? "rgba(82,201,126,0.08)" : "rgba(255,107,107,0.07)",
                borderColor: selected.isCorrect ? "var(--green)" : "var(--coral)",
              }}>
                <span style={{ fontSize: 28 }}>
                  {selected.isCorrect ? "😊" : "🤔"}
                </span>
                <div>
                  <p style={{ ...S.feedbackTitle, color: selected.isCorrect ? "var(--green)" : "var(--coral)" }}>
                    {selected.isCorrect ? "¡Muy bien!" : "Intenta de nuevo la próxima"}
                  </p>
                  {loadingAI
                    ? <p style={S.feedbackText}>Pensando... ✨</p>
                    : <p style={S.feedbackText}>{aiFeedback}</p>
                  }
                </div>
              </div>

              <button onClick={nextScenario} style={S.nextBtn}>
                {scenarioIndex + 1 >= total ? "ver mi resultado →" : "siguiente escenario →"}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "reward" && (
        <div style={S.rewardBody} className="anim-fadein">
          <span style={{ fontSize: 72 }} className="anim-bounce">🏆</span>
          <h2 style={S.rewardTitle}>¡Terminaste!</h2>
          <p style={S.rewardSub}>
            {score} de {total} respuestas correctas
          </p>
          <div style={S.scoreRow}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} style={{ fontSize: 28, color: i < score ? "var(--gold)" : "rgba(255,255,255,0.15)" }}>
                ★
              </span>
            ))}
          </div>
          <div style={S.gemReward}>
            <span style={{ color: "var(--teal)" }}>◆</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--teal)" }}>
              + {score} gemas ganadas
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 320, textAlign: "center", lineHeight: 1.5 }}>
            {score >= 4 ? "¡Excelente trabajo practicando situaciones sociales! 🌟"
              : score >= 2 ? "¡Buen esfuerzo! Con práctica te irá cada vez mejor. 💪"
              : "Sigue practicando, cada intento te hace más fuerte. 🤗"}
          </p>
          <div style={S.rewardBtns}>
            <button onClick={restart} style={S.btnSecondary}>jugar otra vez</button>
            <Link href="/" style={S.btnPrimary}>ir al inicio</Link>
          </div>
        </div>
      )}
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main:          { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  header:        { padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)" },
  tealLine:      { height: 2, background: "var(--teal)" },
  backBtn:       { background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "var(--muted)", display: "block" },
  title:         { fontSize: 18, fontWeight: 600 },
  gemsPill:      { display: "flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "5px 12px" },
  gemsNum:       { fontSize: 15, fontWeight: 700, color: "var(--teal)" },
  body:          { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 22px", gap: 16, maxWidth: 600, margin: "0 auto", width: "100%" },
  progressDots:  { display: "flex", gap: 6 },
  dot:           { width: 10, height: 10, borderRadius: "50%" },
  situationCard: { background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 18, width: "100%", display: "flex", gap: 14, alignItems: "flex-end" },
  characterBubble:{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,107,107,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  characterEmoji:{ fontSize: 28 },
  bubble:        { background: "rgba(255,255,255,0.09)", borderRadius: "12px 12px 12px 0", padding: "12px 16px", flex: 1 },
  situationText: { fontSize: 16, color: "var(--white)", lineHeight: 1.5, marginBottom: 4 },
  questionText:  { fontSize: 14, color: "var(--muted)" },
  chooseLabel:   { fontSize: 12, color: "var(--muted)", alignSelf: "flex-start" },
  optionsList:   { display: "flex", flexDirection: "column", gap: 10, width: "100%" },
  optionBtn:     { background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "background 0.15s, border-color 0.15s", textAlign: "left" },
  optionEmoji:   { fontSize: 30, flexShrink: 0 },
  optionText:    { fontSize: 15, color: "var(--text)" },
  feedbackArea:  { display: "flex", flexDirection: "column", gap: 12, width: "100%" },
  selectedOption:{ border: "2px solid", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 },
  checkmark:     { marginLeft: "auto", borderRadius: 8, padding: "3px 10px", fontSize: 13, color: "#fff", fontWeight: 700 },
  aiFeedbackBox: { border: "1px solid", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" },
  feedbackTitle: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  feedbackText:  { fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 },
  nextBtn:       { background: "var(--teal)", borderRadius: 14, padding: "14px 0", fontSize: 16, fontWeight: 600, color: "#1C2B3A", width: "100%", cursor: "pointer", border: "none" },
  // Reward
  rewardBody:    { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "32px 24px", textAlign: "center" },
  rewardTitle:   { fontSize: 34, fontWeight: 700, color: "var(--gold)" },
  rewardSub:     { fontSize: 16, color: "var(--muted)" },
  scoreRow:      { display: "flex", gap: 8 },
  gemReward:     { background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 14, padding: "12px 24px", display: "flex", alignItems: "center", gap: 10 },
  rewardBtns:    { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  btnPrimary:    { background: "var(--teal)", borderRadius: 14, padding: "13px 28px", fontSize: 16, fontWeight: 600, color: "#1C2B3A", cursor: "pointer", border: "none", display: "block" },
  btnSecondary:  { background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "13px 28px", fontSize: 16, color: "rgba(255,255,255,0.7)", cursor: "pointer", border: "none" },
}
