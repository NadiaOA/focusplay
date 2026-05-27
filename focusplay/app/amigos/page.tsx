"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getProfile, addGems, recordActivity, saveProfile, UserProfile } from "@/lib/store"
import { SCENARIOS, type Scenario, type Option } from "@/lib/scenarios"
import { REWARDS, type Reward } from "@/lib/rewards"

type Phase = "setup" | "question" | "feedback" | "reward"

// Componente de Avatar 100% código, sin imágenes externas
const CustomAvatar = ({ base, skinTone, bgColor, hairColor = "#2B221E", size = 64, expression = "neutral", equippedHat, equippedGlasses }: { base: string, skinTone: string, bgColor: string, hairColor?: string, size?: number, expression?: "neutral" | "happy" | "sad", equippedHat?: string | null, equippedGlasses?: string | null }) => {
  const skinMap: Record<string, string> = { 
    lightest: "#FFDFC4", 
    light: "#F0D5BE", 
    medium: "#D2996C", 
    dark: "#8D5524", 
    darkest: "#3D2210" 
  }
  const skin = skinMap[skinTone] || skinMap.medium

  // Aseguramos compatibilidad con perfiles guardados anteriormente
  let safeBase = base
  if (base === "boy") safeBase = "boy_short"
  if (base === "girl") safeBase = "girl_long"
  if (base === "neutral") safeBase = "boy_curly"
  if (base === "spiky") safeBase = "boy_spiky"
  if (base === "bun") safeBase = "girl_bun"

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fondo circular */}
      <circle cx="50" cy="50" r="50" fill={bgColor} />

      {/* Cuello y camisa */}
      <path d="M 35 75 L 35 100 L 65 100 L 65 75 Z" fill={skin} />
      <path d="M 20 100 Q 50 80 80 100 Z" fill="#ffffff" opacity="0.8" />
      
      {/* Pelo trasero (Niñas) */}
      {safeBase === "girl_long" && <path d="M 25 40 Q 15 80 30 90 Q 50 100 70 90 Q 85 80 75 40 Z" fill={hairColor} />}
      {safeBase === "girl_bun" && <circle cx="50" cy="18" r="14" fill={hairColor} />}
      {safeBase === "girl_ponytail" && <path d="M 65 35 Q 95 40 85 80 Q 75 60 70 45 Z" fill={hairColor} />}
      {safeBase === "girl_bob" && <path d="M 15 45 L 15 70 Q 50 80 85 70 L 85 45 Z" fill={hairColor} />}
      {safeBase === "girl_braids" && (
        <>
          <path d="M 25 45 Q 10 70 20 95 Q 30 70 35 45 Z" fill={hairColor} />
          <path d="M 75 45 Q 90 70 80 95 Q 70 70 65 45 Z" fill={hairColor} />
        </>
      )}

      {/* Cara */}
      <circle cx="50" cy="50" r="28" fill={skin} />
      
      {/* Pelo frontal Niños */}
      {safeBase === "boy_short" && <path d="M 18 45 Q 50 10 82 45 Q 60 35 50 40 Q 30 35 18 45 Z" fill={hairColor} />}
      {safeBase === "boy_spiky" && <path d="M 18 45 L 25 18 L 38 30 L 50 12 L 62 30 L 75 18 L 82 45 Q 50 30 18 45 Z" fill={hairColor} />}
      {safeBase === "boy_curly" && <path d="M 19 45 Q 50 10 81 45 Q 50 42 19 45 Z" fill={hairColor} />}
      {safeBase === "boy_messy" && <path d="M 18 45 Q 25 20 40 25 Q 50 15 65 30 Q 80 20 82 45 Q 50 30 18 45 Z" fill={hairColor} />}
      {safeBase === "boy_part" && <path d="M 18 45 Q 40 15 82 45 Q 65 20 40 25 Q 25 20 18 45 Z" fill={hairColor} />}
      
      {/* Pelo frontal Niñas */}
      {(safeBase === "girl_long" || safeBase === "girl_ponytail" || safeBase === "girl_bob" || safeBase === "girl_braids") && (
        <path d="M 22 50 Q 50 15 78 50 Q 65 30 50 35 Q 35 30 22 50 Z" fill={hairColor} />
      )}
      {safeBase === "girl_bun" && <path d="M 19 45 Q 50 15 81 45 Q 50 30 19 45 Z" fill={hairColor} />}
      
      {/* Ojos y Sonrisa */}
      <circle cx="40" cy="52" r="3.5" fill="#1C2B3A" />
      <circle cx="60" cy="52" r="3.5" fill="#1C2B3A" />
      {expression === "neutral" && <path d="M 43 64 Q 50 68 57 64" stroke="#1C2B3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />}
      {expression === "happy" && <path d="M 40 62 Q 50 72 60 62" stroke="#1C2B3A" strokeWidth="3" strokeLinecap="round" fill="none" />}
      {expression === "sad" && <path d="M 42 68 Q 50 60 58 68" stroke="#1C2B3A" strokeWidth="3" strokeLinecap="round" fill="none" />}

      {/* Gafas (encima de los ojos) */}
      {equippedGlasses === 'glasses_classic' && (
        <g>
          <path d="M 30 48 C 25 48 25 58 30 58 L 38 58 L 38 48 Z" stroke="#1C2B3A" strokeWidth="2.5" fill="none" />
          <path d="M 70 48 C 75 48 75 58 70 58 L 62 58 L 62 48 Z" stroke="#1C2B3A" strokeWidth="2.5" fill="none" />
          <path d="M 38 53 L 62 53" stroke="#1C2B3A" strokeWidth="2.5" />
        </g>
      )}

      {/* Sombrero (encima de todo) */}
      {equippedHat === 'hat_cap' && (
        <g>
            <path d="M 20 35 Q 50 20 80 35 L 75 25 Q 50 10 25 25 Z" fill="#45B7D1" />
            <path d="M 80 35 Q 95 38 90 30" stroke="#45B7D1" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

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
    recordActivity(responseTime, !option.isCorrect)

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
      <header style={S.header}>
        <Link href="/" style={S.backBtn}>← volver</Link>
        <span style={{ ...S.title, color: phase === "reward" ? "var(--teal)" : "var(--coral)" }}>
          {phase === "reward" ? "FocusPlay" : "Amigos"}
        </span>
        <div style={S.gemsPill}>
          <span style={{ color: "var(--teal)" }}>◆</span>
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
          <h2 style={S.setupTitle}>¡Crea tu personaje!</h2>
          <p style={S.setupSub}>Así te verás en el juego hoy</p>
          
          <div style={S.previewBox}>
            <CustomAvatar base={setupBase} skinTone={setupTone} bgColor={setupColor} hairColor={setupHair} size={140} expression="happy" equippedHat={setupHat} equippedGlasses={setupGlasses} />
          </div>

          <div style={S.setupControls}>
            <div style={S.setupSection}>
              <p style={S.setupLabel}>GÉNERO</p>
              <div style={S.setupRow}>
                <button onClick={() => handleGenderSelect("boy")} style={{ ...S.setupBtn, ...(setupGender === "boy" ? S.setupBtnActive : {}) }}>👦 Niño</button>
                <button onClick={() => handleGenderSelect("girl")} style={{ ...S.setupBtn, ...(setupGender === "girl" ? S.setupBtnActive : {}) }}>👧 Niña</button>
              </div>
            </div>

            <div style={S.setupSection}>
              <p style={S.setupLabel}>ESTILO DE CABELLO</p>
              <div style={S.setupRow}>
                {activeHairs.map(opt => (
                  <button key={opt.id} onClick={() => setSetupBase(opt.id)} style={{ ...S.setupBtn, ...(setupBase === opt.id ? S.setupBtnActive : {}) }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.setupSection}>
              <p style={S.setupLabel}>TONO DE PIEL</p>
              <div style={S.setupRow}>
                {[
                  { id: "lightest", color: "#FFDFC4" }, 
                  { id: "light", color: "#F0D5BE" }, 
                  { id: "medium", color: "#D2996C" }, 
                  { id: "dark", color: "#8D5524" },
                  { id: "darkest", color: "#3D2210" }
                ].map(opt => (
                  <div key={opt.id} onClick={() => setSetupTone(opt.id)} style={{ ...S.colorBtn, backgroundColor: opt.color, borderColor: setupTone === opt.id ? "white" : "transparent" }} />
                ))}
              </div>
            </div>

            <div style={S.setupSection}>
              <p style={S.setupLabel}>COLOR DE CABELLO</p>
              <div style={S.setupRow}>
                {hairColors.map(c => (
                  <div key={c} onClick={() => setSetupHair(c)} style={{ ...S.colorBtn, backgroundColor: c, borderColor: setupHair === c ? "white" : "transparent" }} />
                ))}
              </div>
            </div>

            {unlockedHats.length > 0 && (
              <div style={S.setupSection}>
                <p style={S.setupLabel}>SOMBRERO</p>
                <div style={S.setupRow}>
                  <button onClick={() => setSetupHat(null)} style={{ ...S.setupBtn, ...(setupHat === null ? S.setupBtnActive : {}) }}>Ninguno</button>
                  {unlockedHats.map(acc => (
                    <button key={acc.id} onClick={() => setSetupHat(acc.payload)} style={{ ...S.setupBtn, ...(setupHat === acc.payload ? S.setupBtnActive : {}) }}>
                      {acc.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {unlockedGlasses.length > 0 && (
              <div style={S.setupSection}>
                <p style={S.setupLabel}>GAFAS</p>
                <div style={S.setupRow}>
                  <button onClick={() => setSetupGlasses(null)} style={{ ...S.setupBtn, ...(setupGlasses === null ? S.setupBtnActive : {}) }}>Ninguna</button>
                  {unlockedGlasses.map(acc => (
                    <button key={acc.id} onClick={() => setSetupGlasses(acc.payload)} style={{ ...S.setupBtn, ...(setupGlasses === acc.payload ? S.setupBtnActive : {}) }}>
                      {acc.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={S.setupSection}>
              <p style={S.setupLabel}>COLOR FAVORITO</p>
              <div style={S.setupRow}>
                {avatarColors.map(c => (
                  <div key={c} onClick={() => setSetupColor(c)} style={{ ...S.colorBtn, backgroundColor: c, borderColor: setupColor === c ? "white" : "transparent" }} />
                ))}
              </div>
            </div>
          </div>

          <button onClick={startPlay} style={S.startBtn}>¡Empezar a jugar!</button>
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
                  : i === scenarioIndex ? "var(--coral)"
                  : "rgba(255,255,255,0.15)",
              }} />
            ))}
          </div>

          <div style={S.gameLayout}>
            {/* STAGE AREA (Situación Visual) */}
            <div style={S.stageArea}>
              <div style={S.scene}>
                <div style={S.sceneActor}>
                  <CustomAvatar base={profile.avatar.base} skinTone={profile.avatar.skinTone} bgColor={profile.avatar.color} hairColor={profile.avatar.hairColor} size={80} expression={avatarExpression} equippedHat={profile.avatar.equippedHat} equippedGlasses={profile.avatar.equippedGlasses} />
                  <span style={S.actorName}>Tú</span>
                </div>
                
                <div style={S.sceneAction}>
                  <p style={S.situationText}>{scenario.situation}</p>
                </div>

                <div style={S.sceneActor}>
                  <div style={S.characterBubbleLarge}>
                    <span style={S.characterEmojiLarge}>{scenario.characterEmoji}</span>
                  </div>
                  <span style={S.actorName}>Otro</span>
                </div>
              </div>
              <p style={S.questionTextLarge}>{scenario.question}</p>
            </div>

            {/* OPTIONS/FEEDBACK AREA (Barra Lateral/Inferior) */}
            <div style={S.optionsArea}>
              {phase === "question" && (
                <>
                  <p style={S.chooseLabel}>
                    {hasMadeMistake ? "¡Casi! Inténtalo de nuevo:" : "elige una respuesta:"}
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

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt)}
                          disabled={isDisabled}
                          style={getStyle()}
                          className="anim-fadein"
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
                  <div style={{
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
                        : <span style={{ fontSize: 36 }}>🤔</span>}
                    </div>
                    <div>
                      <p style={{ ...S.feedbackTitle, color: selected.isCorrect ? "var(--green)" : "var(--coral)" }}>
                        {selected.isCorrect ? "¡Muy bien!" : "Intenta de nuevo la próxima"}
                      </p>
                      {loadingAI ? <p style={S.feedbackText}>Pensando... ✨</p> : <p style={S.feedbackText}>{aiFeedback}</p>}
                    </div>
                  </div>

                  <button onClick={nextScenario} style={S.nextBtn}>
                    {scenarioIndex + 1 >= scenariosForLevel.length ? "ver mi resultado →" : "siguiente escenario →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>)
      })()}

      {phase === "reward" && (
        <div style={S.rewardBody} className="anim-fadein">
          <span style={{ fontSize: 72 }} className="anim-bounce">🏆</span>
          <h2 style={S.rewardTitle}>¡Terminaste!</h2>
          <p style={S.rewardSub}>
            Nivel {currentLevel} · {score} de {total} respuestas correctas
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
          {leveledUp && (
            <p style={{ ...S.rewardSub, color: "var(--green)", fontWeight: 600, marginTop: 8 }}>¡Felicidades! ¡Subiste al nivel {currentLevel + 1}! 🚀</p>
          )}
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
  userAvatarContainer: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 12, border: "2px solid rgba(255,255,255,0.2)", overflow: "hidden" },
  bodyLarge:     { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 22px", gap: 24, maxWidth: 960, margin: "0 auto", width: "100%" },
  progressDots:  { display: "flex", gap: 6 },
  dot:           { width: 10, height: 10, borderRadius: "50%" },
  
  // Layout Layout & Stage Area
  gameLayout:    { display: "flex", gap: 28, width: "100%", flexWrap: "wrap", justifyContent: "center", alignItems: "stretch" },
  stageArea:     { flex: "1 1 450px", background: "rgba(255,255,255,0.03)", borderWidth: 2, borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "30px 20px", display: "flex", flexDirection: "column", gap: 28, alignItems: "center", justifyContent: "center" },
  optionsArea:   { flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center", minWidth: 280 },
  scene:         { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 16 },
  sceneActor:    { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 },
  actorName:     { fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 },
  sceneAction:   { flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", textAlign: "center" },
  characterBubbleLarge: { width: 80, height: 80, borderRadius: "50%", background: "rgba(255,107,107,0.2)", display: "flex", alignItems: "center", justifyContent: "center" },
  characterEmojiLarge: { fontSize: 40 },
  situationText: { fontSize: 17, color: "var(--white)", lineHeight: 1.4, fontWeight: 500 },
  questionTextLarge: { fontSize: 20, color: "var(--teal)", fontWeight: 700, textAlign: "center" },
  
  chooseLabel:   { fontSize: 12, color: "var(--muted)", alignSelf: "flex-start" },
  optionsList:   { display: "flex", flexDirection: "column", gap: 10, width: "100%" },
  optionBtn:     { background: "rgba(255,255,255,0.06)", borderWidth: 2, borderStyle: "solid", borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,   cursor: "pointer", transition: "background 0.15s, border-color 0.15s", textAlign: "left" as const },
  optionEmoji:   { fontSize: 30, flexShrink: 0 },
  optionDisabled:{ opacity: 0.5, cursor: "not-allowed" },
  optionWrongAttempt: { borderColor: "var(--coral)", background: "rgba(255,107,107,0.1)", opacity: 0.7, cursor: "not-allowed" },
  optionText:    { fontSize: 15, color: "var(--text)" },
  feedbackArea:  { display: "flex", flexDirection: "column", gap: 12, width: "100%" },
  selectedOption:{ borderWidth: 2, borderStyle: "solid", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 },
  checkmark:     { marginLeft: "auto", borderRadius: 8, padding: "3px 10px", fontSize: 13, color: "#fff", fontWeight: 700 },
  aiFeedbackBox: { borderWidth: 1, borderStyle: "solid", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" },
  feedbackTitle: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  feedbackText:  { fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 },
  nextBtn:       { background: "var(--teal)", borderRadius: 14, padding: "14px 0", fontSize: 16, fontWeight: 600, color: "#1C2B3A", width: "100%", cursor: "pointer", border: "none" },
  // Setup
  setupBody:     { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "30px 20px", width: "100%", maxWidth: 500, margin: "0 auto" },
  setupTitle:    { fontSize: 24, fontWeight: 700, color: "var(--white)", marginBottom: -10 },
  setupSub:      { fontSize: 14, color: "var(--muted)" },
  previewBox:    { margin: "10px 0" },
  setupControls: { display: "flex", flexDirection: "column", gap: 24, width: "100%", background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "24px" },
  setupSection:  { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  setupLabel:    { fontSize: 11, color: "var(--muted)", fontWeight: 700, letterSpacing: 1 },
  setupRow:      { display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" },
setupBtn:        { padding: "11px 16px", minHeight: 44, borderRadius: 12, borderWidth: 2, borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", cursor: "pointer", color: "var(--white)", fontSize: 14, fontWeight: 500 },
  setupBtnActive:{ borderColor: "var(--teal)", background: "rgba(78,205,196,0.15)", color: "var(--teal)" },
  colorBtn:      { width: 36, height: 36, borderRadius: "50%", cursor: "pointer", borderWidth: 3, borderStyle: "solid", borderColor: "transparent", transition: "border-color 0.2s" },
  startBtn:      { background: "var(--teal)", borderRadius: 14, padding: "16px 0", fontSize: 16, fontWeight: 700, color: "#1C2B3A", width: "100%", cursor: "pointer", border: "none", marginTop: 10 },
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
