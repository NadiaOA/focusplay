"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getProfile, addGems, recordActivity, saveProfile, UserProfile } from "@/lib/store"
import { SCENARIOS, type Scenario, type Option } from "@/lib/scenarios"
import { REWARDS, type Reward } from "@/lib/rewards2"
import CustomAvatar from "@/components/avatar/CustomAvatar";

type Phase = "setup" | "question" | "feedback" | "reward"

const ACCENT = "#ED93B1" // rosa de Amigos, igual que en la home

export default function Amigos() {
  const [isMounted, setIsMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(getProfile())
  const [gems, setGems]           = useState(profile.gems)
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [selected, setSelected]   = useState<Option | null>(null)
  const [phase, setPhase]         = useState<Phase>("setup")
  const [score, setScore]         = useState(0)
  const [aiFeedback, setAiFeedback] = useState("")
  const [loadingAI, setLoadingAI] = useState(false)
  const [flipStart, setFlipStart] = useState<number>(0)
  const [leveledUp, setLeveledUp]   = useState(false)
  const [hasMadeMistake, setHasMadeMistake] = useState(false)
  const [disabledOptions, setDisabledOptions] = useState<string[]>([])
  const [firstMistakeId, setFirstMistakeId] = useState<string | null>(null)

  // --- Lógica de Niveles ---
  const SCENARIOS_PER_LEVEL = 5;
  const level = profile.amigosLevel || 1;
  const maxLevel = Math.ceil(SCENARIOS.length / SCENARIOS_PER_LEVEL);
  const currentLevel = Math.min(level, maxLevel);

  const startIndex = (currentLevel - 1) * SCENARIOS_PER_LEVEL;
  const scenariosForLevel = SCENARIOS.slice(startIndex, startIndex + SCENARIOS_PER_LEVEL);

  const scenario: Scenario = scenariosForLevel[scenarioIndex % scenariosForLevel.length]
  const total = scenariosForLevel.length

  // Estados para la configuración del Avatar
  const getSafeBase = (b: string) => {
    if (b === "boy") return "boy_short"
    if (b === "girl") return "girl_long"
    if (b === "neutral") return "boy_curly"
    if (b === "spiky") return "boy_spiky"
    if (b === "bun") return "girl_bun"
    return b
  }

  const initialBase = getSafeBase(profile.avatar.base)
  const initialGender = ["girl_long", "girl_bun", "girl_ponytail", "girl_bob", "girl_braids"].includes(initialBase) ? "girl" : "boy"

  const [setupGender, setSetupGender] = useState<"boy" | "girl">(initialGender)
  const [setupBase, setSetupBase] = useState(initialBase)
  const [setupTone, setSetupTone] = useState(profile.avatar.skinTone)
  const [setupColor, setSetupColor] = useState(profile.avatar.color)
  const [setupHair, setSetupHair] = useState((profile.avatar as any).hairColor || "#2B221E")
  const [setupHat, setSetupHat] = useState(profile.avatar.equippedHat)
  const [setupGlasses, setSetupGlasses] = useState(profile.avatar.equippedGlasses)

  const avatarColors = [
    "#4ECDC4", // verde
    "#FF6B6B", // rojo
    "#FFE66D", // amarillo
    "#9D4EDD", // morado
    "#45B7D1", // azul
    "#FF9F1C", // naranja
  ] 

  const hairColors = ["#2B221E", "#5C3A21", "#A47551", "#F7D98D", "#C75D3F", "#A9A9A9"]

  const boyHairs = [
    { id: "boy_short", label: "Corto" },
    { id: "boy_spiky", label: "Picos" },
    { id: "boy_curly", label: "Rizo" },
    { id: "boy_messy", label: "Despeinado" },
    { id: "boy_part", label: "De lado" },
  ]
  const girlHairs = [
    { id: "girl_long", label: "Largo" },
    { id: "girl_bun", label: "Chongo" },
    { id: "girl_ponytail", label: "Coleta" },
    { id: "girl_bob", label: "Corto" },
    { id: "girl_braids", label: "Trenzas" },
  ]
  const activeHairs = setupGender === "boy" ? boyHairs : girlHairs

  const handleGenderSelect = (g: "boy" | "girl") => {
  setSetupGender(g)
  const isBoyHair = boyHairs.some(h => h.id === setupBase)
  const isGirlHair = girlHairs.some(h => h.id === setupBase)
  
  if (g === "boy" && !isBoyHair) setSetupBase("boy_short")
  if (g === "girl" && !isGirlHair) setSetupBase("girl_long")
}

  const unlockedAccessories = REWARDS.filter(r => 
    r.type === 'accessory' && profile.unlockedRewards?.includes(r.id)
  );
  const unlockedHats = unlockedAccessories.filter(r => r.accessoryType === 'hat');
  const unlockedGlasses = unlockedAccessories.filter(r => r.accessoryType === 'glasses');

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setFlipStart(Date.now())
  }, [scenarioIndex])

  const startPlay = () => {
    const newProfile = {
      ...profile,
      avatar: {
        ...profile.avatar,
        base: setupBase,
        skinTone: setupTone,
        color: setupColor,
        hairColor: setupHair,
        equippedHat: setupHat,
        equippedGlasses: setupGlasses,
      }
    };
    saveProfile(newProfile)
    setProfile(newProfile) // Update local state to reflect changes immediately
    setFlipStart(Date.now())
    setPhase("question")
  }

  const handleSelect = async (option: Option) => {
    if (phase !== "question" || disabledOptions.includes(option.id)) return

    const responseTime = Date.now() - flipStart
    recordActivity(responseTime, !option.isCorrect, scenario.situation)

    if (option.isCorrect) {
      setSelected(option)
      setPhase("feedback")
      setScore((s) => s + 1)
      const newGems = addGems(1)
      setGems(newGems)
    } else {
      // Incorrect answer
      if (hasMadeMistake) {
        // Final incorrect answer, go to feedback
        setSelected(option)
        setPhase("feedback")
      } else {
        // First incorrect answer, give extra try
        setHasMadeMistake(true)
        setDisabledOptions(prev => [...prev, option.id])
        setFirstMistakeId(option.id)
        return // Stop here, stay on question screen
      }
    }

    // Common logic for moving to feedback screen
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
    if (next >= scenariosForLevel.length) {
      const updatedProfile = getProfile() // Cargar el perfil más reciente para no perder las gemas.
      let didLevelUp = false
      // Subir de nivel si el puntaje es bueno y no está en el nivel máximo
      if (score >= 4 && currentLevel < maxLevel) {
        updatedProfile.amigosLevel = currentLevel + 1
        didLevelUp = true
      }
      updatedProfile.amigosProgress = Math.min(100, Math.round((score / total) * 100))
      saveProfile(updatedProfile)
      setLeveledUp(didLevelUp)
      setPhase("reward")
    } else {
      setScenarioIndex(next)
      setSelected(null)
      setPhase("question")
      setAiFeedback("")
      setHasMadeMistake(false)
      setDisabledOptions([])
      setFirstMistakeId(null)
    }
  }

  const restart = () => {
    setScenarioIndex(0)
    setSelected(null)
    setPhase("question")
    setScore(0)
    setAiFeedback("")
    setLeveledUp(false)
    setHasMadeMistake(false)
    setDisabledOptions([])
    setFirstMistakeId(null)
  }

  if (!isMounted) return null

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
          from { transform: scale(0.85) rotate(-3deg); opacity: 0.3; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fp-confetti {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(30px) scale(0.8); opacity: 0; }
        }
        @keyframes fp-pulse-ring {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes fp-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-6deg); }
          75% { transform: rotate(6deg); }
        }

        .fp-star { animation: fp-pop 0.4s ease-out both; }
        .fp-pop { animation: fp-pop 0.35s ease-out; }
        .fp-flip { animation: fp-flip-in 0.3s ease-out; }
        .fp-shake { animation: fp-shake 0.4s ease-in-out; }
        .fp-bounce { animation: fp-bounce 1.6s ease-in-out infinite; }
        .fp-float { animation: fp-float 2.6s ease-in-out infinite; }
        .fp-gems-anim { animation: fp-pulse-ring 2.5s ease-in-out infinite; }
        .fp-confetti-row span { display: inline-block; animation: fp-confetti 1s ease-in forwards; }
        .fp-wiggle { animation: fp-wiggle 2s ease-in-out infinite; }

        .fp-btn-pop { transition: transform 0.15s ease, filter 0.15s ease, background 0.15s ease, border-color 0.15s ease; }
        .fp-btn-pop:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
        .fp-btn-pop:active:not(:disabled) { transform: scale(0.96); }
      `}</style>

      <header style={S.header}>
        <Link href="/" style={S.backBtn} aria-label="Volver al inicio">
          <span style={{ fontSize: 18 }}>←</span>
        </Link>
        <span style={{ ...S.title, color: phase === "reward" ? "var(--teal)" : ACCENT }}>
          {phase === "reward" ? "🌟 FocusPlay" : "🤝 Amigos"}
        </span>
        <div className="fp-gems-anim" style={S.gemsPill}>
          <span style={{ fontSize: 16 }}>💎</span>
          <span style={S.gemsNum}>{gems}</span>
        </div>
        {(phase !== "setup") && (
          <div style={S.userAvatarContainer}>
            <CustomAvatar base={profile.avatar.base} skinTone={profile.avatar.skinTone} bgColor={profile.avatar.color} hairColor={profile.avatar.hairColor} size={36} expression="happy" equippedHat={profile.avatar.equippedHat} equippedGlasses={profile.avatar.equippedGlasses} />
          </div>
        )}
      </header>
      <div style={S.tealLine} />

      {phase === "setup" && (
        <div style={S.setupBody} className="anim-fadein">
          <span className="fp-bounce" style={{ fontSize: 48 }}>🎨</span>
          <h2 style={S.setupTitle}>¡Crea tu personaje!</h2>
          <p style={S.setupSub}>Así te verás en el juego hoy</p>
          
          <div style={S.previewBox}>
            <CustomAvatar base={setupBase} skinTone={setupTone} bgColor={setupColor} hairColor={setupHair} size={140} expression="happy" equippedHat={setupHat} equippedGlasses={setupGlasses} />
          </div>

          <div style={S.setupControls}>
            <div style={S.setupSection}>
              <p style={S.setupLabel}>👤 GÉNERO</p>
              <div style={S.setupRow}>
                <button onClick={() => handleGenderSelect("boy")} className="fp-btn-pop" style={{ ...S.setupBtn, ...(setupGender === "boy" ? S.setupBtnActive : {}) }}>👦 Niño</button>
                <button onClick={() => handleGenderSelect("girl")} className="fp-btn-pop" style={{ ...S.setupBtn, ...(setupGender === "girl" ? S.setupBtnActive : {}) }}>👧 Niña</button>
              </div>
            </div>

            <div style={S.setupSection}>
              <p style={S.setupLabel}>✂️ ESTILO DE CABELLO</p>
              <div style={S.setupRow}>
                {activeHairs.map(opt => (
                  <button key={opt.id} onClick={() => setSetupBase(opt.id)} className="fp-btn-pop" style={{ ...S.setupBtn, ...(setupBase === opt.id ? S.setupBtnActive : {}) }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.setupSection}>
              <p style={S.setupLabel}>🎨 TONO DE PIEL</p>
              <div style={S.setupRow}>
                {[
                  { id: "lightest", color: "#FFDFC4" }, 
                  { id: "light", color: "#F0D5BE" }, 
                  { id: "medium", color: "#D2996C" }, 
                  { id: "dark", color: "#8D5524" },
                  { id: "darkest", color: "#3D2210" }
                ].map(opt => (
                  <div key={opt.id} onClick={() => setSetupTone(opt.id)} className="fp-btn-pop" style={{ ...S.colorBtn, backgroundColor: opt.color, borderColor: setupTone === opt.id ? "white" : "transparent" }} />
                ))}
              </div>
            </div>

            <div style={S.setupSection}>
              <p style={S.setupLabel}>💇 COLOR DE CABELLO</p>
              <div style={S.setupRow}>
                {hairColors.map(c => (
                  <div key={c} onClick={() => setSetupHair(c)} className="fp-btn-pop" style={{ ...S.colorBtn, backgroundColor: c, borderColor: setupHair === c ? "white" : "transparent" }} />
                ))}
              </div>
            </div>

            {unlockedHats.length > 0 && (
              <div style={S.setupSection}>
                <p style={S.setupLabel}>🎩 SOMBRERO</p>
                <div style={S.setupRow}>
                  <button onClick={() => setSetupHat(null)} className="fp-btn-pop" style={{ ...S.setupBtn, ...(setupHat === null ? S.setupBtnActive : {}) }}>Ninguno</button>
                  {unlockedHats.map(acc => (
                    <button key={acc.id} onClick={() => setSetupHat(acc.payload)} className="fp-btn-pop" style={{ ...S.setupBtn, ...(setupHat === acc.payload ? S.setupBtnActive : {}) }}>
                      {acc.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {unlockedGlasses.length > 0 && (
              <div style={S.setupSection}>
                <p style={S.setupLabel}>👓 GAFAS</p>
                <div style={S.setupRow}>
                  <button onClick={() => setSetupGlasses(null)} className="fp-btn-pop" style={{ ...S.setupBtn, ...(setupGlasses === null ? S.setupBtnActive : {}) }}>Ninguna</button>
                  {unlockedGlasses.map(acc => (
                    <button key={acc.id} onClick={() => setSetupGlasses(acc.payload)} className="fp-btn-pop" style={{ ...S.setupBtn, ...(setupGlasses === acc.payload ? S.setupBtnActive : {}) }}>
                      {acc.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={S.setupSection}>
              <p style={S.setupLabel}>💖 COLOR FAVORITO</p>
              <div style={S.setupRow}>
                {avatarColors.map(c => (
                  <div key={c} onClick={() => setSetupColor(c)} className="fp-btn-pop" style={{ ...S.colorBtn, backgroundColor: c, borderColor: setupColor === c ? "white" : "transparent" }} />
                ))}
              </div>
            </div>
          </div>

          <button onClick={startPlay} className="fp-btn-pop" style={S.startBtn}>🚀 ¡Empezar a jugar!</button>
        </div>
      )}

      {(phase === "question" || phase === "feedback") && (() => {
        const avatarExpression = phase === "feedback" 
          ? (selected?.isCorrect ? "happy" : "sad") 
          : "neutral";

        return (
          <div style={S.bodyLarge} className="anim-fadein">
          {/* Progress dots */}
          <div style={S.progressDots}>
            {scenariosForLevel.map((_, i) => (
              <div key={i} style={{
                ...S.dot,
                background: i < scenarioIndex ? "var(--green)"
                  : i === scenarioIndex ? ACCENT
                  : "rgba(255,255,255,0.15)",
                transform: i === scenarioIndex ? "scale(1.3)" : "scale(1)",
                transition: "all 0.25s ease",
              }} />
            ))}
          </div>

          <div style={S.gameLayout}>
            {/* STAGE AREA (Situación Visual) */}
            <div key={scenarioIndex} className="fp-flip" style={S.stageArea}>
              <div style={S.scene}>
                <div style={S.sceneActor}>
                  <CustomAvatar base={profile.avatar.base} skinTone={profile.avatar.skinTone} bgColor={profile.avatar.color} hairColor={profile.avatar.hairColor} size={80} expression={avatarExpression} equippedHat={profile.avatar.equippedHat} equippedGlasses={profile.avatar.equippedGlasses} />
                  <span style={S.actorName}>Tú</span>
                </div>
                
                <div style={S.sceneAction}>
                  <p style={S.situationText}>{scenario.situation}</p>
                </div>

                <div style={S.sceneActor}>
                  <div className="fp-float" style={S.characterBubbleLarge}>
                    <span style={S.characterEmojiLarge}>{scenario.characterEmoji}</span>
                  </div>
                  <span style={S.actorName}>Otro</span>
                </div>
              </div>
              <p style={S.questionTextLarge}>🤔 {scenario.question}</p>
            </div>

            {/* OPTIONS/FEEDBACK AREA (Barra Lateral/Inferior) */}
            <div style={S.optionsArea}>
              {phase === "question" && (
                <>
                  <p style={S.chooseLabel}>
                    {hasMadeMistake ? "✋ ¡Casi! Inténtalo de nuevo:" : "👇 elige una respuesta:"}
                  </p>
                  <div style={S.optionsList}>
                    {scenario.options.map((opt) => {
                      const isDisabled = disabledOptions.includes(opt.id);
                      const isFirstMistake = firstMistakeId === opt.id;

                      const getStyle = () => {
                        if (isFirstMistake) return { ...S.optionBtn, ...S.optionWrongAttempt };
                        if (isDisabled) return { ...S.optionBtn, ...S.optionDisabled };
                        return S.optionBtn;
                      };
                      const cls = isFirstMistake ? "fp-shake" : "fp-btn-pop";

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt)}
                          disabled={isDisabled}
                          style={getStyle()}
                          className={`anim-fadein ${cls}`}
                        >
                          <span style={S.optionEmoji}>{opt.emoji}</span>
                          <span style={S.optionText}>{opt.text}</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {phase === "feedback" && selected && (
                <div style={S.feedbackArea} className="anim-fadein">
                  <div className="fp-pop" style={{
                    ...S.selectedOption,
                    background: selected.isCorrect ? "rgba(82,201,126,0.15)" : "rgba(255,107,107,0.1)",
                    borderColor: selected.isCorrect ? "var(--green)" : "var(--coral)",
                  }}>
                    <span style={S.optionEmoji}>{selected.emoji}</span>
                    <span style={S.optionText}>{selected.text}</span>
                    <span style={{ ...S.checkmark, background: selected.isCorrect ? "var(--green)" : "var(--coral)" }}>
                      {selected.isCorrect ? "✓" : "✕"}
                    </span>
                  </div>

                  <div style={{
                    ...S.aiFeedbackBox,
                    background: selected.isCorrect ? "rgba(82,201,126,0.08)" : "rgba(255,107,107,0.07)",
                    borderColor: selected.isCorrect ? "var(--green)" : "var(--coral)",
                  }}>
                    <div style={{ flexShrink: 0 }}>
                      {selected.isCorrect 
                        ? <CustomAvatar base={profile.avatar.base} skinTone={profile.avatar.skinTone} bgColor={profile.avatar.color} hairColor={profile.avatar.hairColor} size={44} expression="happy" equippedHat={profile.avatar.equippedHat} equippedGlasses={profile.avatar.equippedGlasses} /> 
                        : <span className="fp-wiggle" style={{ fontSize: 36, display: "inline-block" }}>🤔</span>}
                    </div>
                    <div>
                      <p style={{ ...S.feedbackTitle, color: selected.isCorrect ? "var(--green)" : "var(--coral)" }}>
                        {selected.isCorrect ? "🎉 ¡Muy bien!" : "💛 Intenta de nuevo la próxima"}
                      </p>
                      {loadingAI ? <p style={S.feedbackText}>Pensando... ✨</p> : <p style={S.feedbackText}>{aiFeedback}</p>}
                    </div>
                  </div>

                  <button onClick={nextScenario} className="fp-btn-pop" style={S.nextBtn}>
                    {scenarioIndex + 1 >= scenariosForLevel.length ? "✨ ver mi resultado →" : "siguiente escenario →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>)
      })()}

      {phase === "reward" && (
        <div style={S.rewardBody} className="anim-fadein">
          <div className="fp-confetti-row" style={S.confettiRow}>
            {["🎉", "✨", "🎈", "🌈", "🎊"].map((e, i) => (
              <span key={i} style={{ fontSize: 26, animationDelay: `${i * 0.1}s` }}>{e}</span>
            ))}
          </div>
          <span style={{ fontSize: 72 }} className="fp-bounce">🏆</span>
          <h2 style={S.rewardTitle}>¡Terminaste!</h2>
          <p style={S.rewardSub}>
            Nivel {currentLevel} · {score} de {total} respuestas correctas
          </p>
          <div style={S.scoreRow}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={i < score ? "fp-star" : ""}
                style={{ fontSize: 28, opacity: i < score ? 1 : 0.2, animationDelay: `${i * 0.08}s` }}>
                ⭐
              </span>
            ))}
          </div>
          <div className="fp-gems-anim" style={S.gemReward}>
            <span style={{ fontSize: 20 }}>💎</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--teal)" }}>
              + {score} gemas ganadas
            </span>
          </div>
          {leveledUp && (
            <p className="fp-card-match" style={{ ...S.rewardSub, color: "var(--green)", fontWeight: 600, marginTop: 8 }}>🚀 ¡Felicidades! ¡Subiste al nivel {currentLevel + 1}!</p>
          )}
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 320, textAlign: "center", lineHeight: 1.5 }}>
            {score >= 4 ? "¡Excelente trabajo practicando situaciones sociales! 🌟"
              : score >= 2 ? "¡Buen esfuerzo! Con práctica te irá cada vez mejor. 💪"
              : "Sigue practicando, cada intento te hace más fuerte. 🤗"}
          </p>
          <div style={S.rewardBtns}>
            <button onClick={restart} className="fp-btn-pop" style={S.btnSecondary}>🔄 jugar otra vez</button>
            <Link href="/" className="fp-btn-pop" style={S.btnPrimary}>ir al inicio</Link>
            <Link href="/reporte" className="fp-btn-pop" style={{ ...S.btnSecondary, background: "rgba(78,205,196,0.15)", color: "var(--teal)", textDecoration: "none", fontWeight: 600 }}>📋 ver reporte de IA</Link>
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
  backBtn:       { width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--white)", textDecoration: "none" },
  title:         { fontSize: 18, fontWeight: 700 },
  gemsPill:      { display: "flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "5px 12px" },
  gemsNum:       { fontSize: 15, fontWeight: 700, color: "var(--teal)" },
  userAvatarContainer: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 12, border: `2px solid ${ACCENT}55`, overflow: "hidden" },
  bodyLarge:     { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 22px", gap: 24, maxWidth: 960, margin: "0 auto", width: "100%" },
  progressDots:  { display: "flex", gap: 8 },
  dot:           { width: 12, height: 12, borderRadius: "50%" },

  // Layout & Stage Area
  gameLayout:    { display: "flex", gap: 28, width: "100%", flexWrap: "wrap", justifyContent: "center", alignItems: "stretch" },
  stageArea:     { flex: "1 1 450px", background: `${ACCENT}0D`, borderWidth: 2, borderStyle: "solid", borderColor: `${ACCENT}33`, borderRadius: 24, padding: "30px 20px", display: "flex", flexDirection: "column", gap: 28, alignItems: "center", justifyContent: "center" },
  optionsArea:   { flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center", minWidth: 280 },
  scene:         { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 16 },
  sceneActor:    { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 },
  actorName:     { fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 },
  sceneAction:   { flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 18, padding: "16px", textAlign: "center" },
  characterBubbleLarge: { width: 80, height: 80, borderRadius: "50%", background: "rgba(255,107,107,0.2)", display: "flex", alignItems: "center", justifyContent: "center" },
  characterEmojiLarge: { fontSize: 40 },
  situationText: { fontSize: 17, color: "var(--white)", lineHeight: 1.4, fontWeight: 500 },
  questionTextLarge: { fontSize: 20, color: ACCENT, fontWeight: 800, textAlign: "center" },

  chooseLabel:   { fontSize: 13, color: "var(--muted)", alignSelf: "flex-start", fontWeight: 600 },
  optionsList:   { display: "flex", flexDirection: "column", gap: 12, width: "100%" },
  optionBtn:     { background: "rgba(255,255,255,0.06)", borderWidth: 2, borderStyle: "solid", borderColor: "rgba(255,255,255,0.12)", borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left" as const },
  optionEmoji:   { fontSize: 30, flexShrink: 0 },
  optionDisabled:{ opacity: 0.5, cursor: "not-allowed" },
  optionWrongAttempt: { borderColor: "var(--coral)", background: "rgba(255,107,107,0.1)", opacity: 0.7, cursor: "not-allowed" },
  optionText:    { fontSize: 15, color: "var(--text)" },
  feedbackArea:  { display: "flex", flexDirection: "column", gap: 12, width: "100%" },
  selectedOption:{ borderWidth: 2, borderStyle: "solid", borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 },
  checkmark:     { marginLeft: "auto", borderRadius: 10, padding: "3px 10px", fontSize: 13, color: "#fff", fontWeight: 700 },
  aiFeedbackBox: { borderWidth: 1, borderStyle: "solid", borderRadius: 18, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" },
  feedbackTitle: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  feedbackText:  { fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 },
  nextBtn:       { background: ACCENT, borderRadius: 18, padding: "14px 0", fontSize: 16, fontWeight: 700, color: "#1C2B3A", width: "100%", cursor: "pointer", border: "none" },
  // Setup
  setupBody:     { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "30px 20px", width: "100%", maxWidth: 500, margin: "0 auto" },
  setupTitle:    { fontSize: 26, fontWeight: 800, color: "var(--white)", marginBottom: -6 },
  setupSub:      { fontSize: 14, color: "var(--muted)" },
  previewBox:    { margin: "10px 0" },
  setupControls: { display: "flex", flexDirection: "column", gap: 24, width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${ACCENT}22`, borderRadius: 24, padding: "24px" },
  setupSection:  { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  setupLabel:    { fontSize: 11, color: "var(--muted)", fontWeight: 700, letterSpacing: 1 },
  setupRow:      { display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" },
  setupBtn:      { padding: "11px 16px", minHeight: 44, borderRadius: 14, borderWidth: 2, borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", cursor: "pointer", color: "var(--white)", fontSize: 14, fontWeight: 500 },
  setupBtnActive:{ borderColor: ACCENT, background: `${ACCENT}26`, color: ACCENT },
  colorBtn:      { width: 38, height: 38, borderRadius: "50%", cursor: "pointer", borderWidth: 3, borderStyle: "solid", borderColor: "transparent", transition: "border-color 0.2s" },
  startBtn:      { background: ACCENT, borderRadius: 18, padding: "16px 0", fontSize: 17, fontWeight: 800, color: "#1C2B3A", width: "100%", cursor: "pointer", border: "none", marginTop: 6 },
  // Reward
  rewardBody:    { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "32px 24px", textAlign: "center" },
  confettiRow:   { display: "flex", gap: 8, justifyContent: "center" },
  rewardTitle:   { fontSize: 34, fontWeight: 800, color: "var(--gold)" },
  rewardSub:     { fontSize: 16, color: "var(--muted)" },
  scoreRow:      { display: "flex", gap: 8, margin: "4px 0" },
  gemReward:     { background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 999, padding: "10px 22px", display: "flex", alignItems: "center", gap: 10 },
  rewardBtns:    { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  btnPrimary:    { background: "var(--teal)", borderRadius: 16, padding: "13px 28px", fontSize: 16, fontWeight: 700, color: "#1C2B3A", cursor: "pointer", border: "none", display: "block" },
  btnSecondary:  { background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "13px 28px", fontSize: 16, color: "rgba(255,255,255,0.7)", cursor: "pointer", border: "none" },
}