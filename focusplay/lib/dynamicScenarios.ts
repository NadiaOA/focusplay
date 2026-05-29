export function generateScenario() {

  const characters = [
    "Un niño",
    "Una niña",
    "Tu amigo",
    "Un compañero",
    "Alguien",
  ]

  const emotions = [
    { emoji: "😢", text: "está triste" },
    { emoji: "😠", text: "está molesto" },
    { emoji: "😔", text: "se siente solo" },
    { emoji: "😰", text: "está nervioso" },
  ]

  const places = [
    "en el salón",
    "en el recreo",
    "en la cafetería",
    "en el parque",
    "durante un juego",
  ]

  const situations = [
    "porque perdió su juguete",
    "porque nadie juega con él",
    "porque se cayó",
    "porque cometió un error",
    "porque extraña a su familia",
  ]

  const correctActions = [
    {
      text: "Preguntar si necesita ayuda",
      emoji: "😊",
      feedback: "Ayudar a otros es una buena acción.",
    },
    {
      text: "Invitarlo a jugar",
      emoji: "🎮",
      feedback: "Invitar a otros ayuda a incluirlos.",
    },
    {
      text: "Hablar con calma",
      emoji: "💬",
      feedback: "Hablar con calma ayuda mucho.",
    },
  ]

  const wrongActions = [
    {
      text: "Ignorarlo",
      emoji: "🙈",
      feedback: "Ignorar puede hacer sentir mal a otros.",
    },
    {
      text: "Reírse",
      emoji: "😂",
      feedback: "Reírse puede lastimar sentimientos.",
    },
    {
      text: "Alejarse",
      emoji: "🚶",
      feedback: "A veces es mejor apoyar a otros.",
    },
  ]

  const randomCharacter =
    characters[Math.floor(Math.random() * characters.length)]

  const randomEmotion =
    emotions[Math.floor(Math.random() * emotions.length)]

  const randomPlace =
    places[Math.floor(Math.random() * places.length)]

  const randomSituation =
    situations[Math.floor(Math.random() * situations.length)]

  const correct =
    correctActions[Math.floor(Math.random() * correctActions.length)]

  const shuffledWrong = [...wrongActions]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)

  const options = [
    {
      id: "correct",
      text: correct.text,
      emoji: correct.emoji,
      isCorrect: true,
      feedback: correct.feedback,
    },

    ...shuffledWrong.map((w, index) => ({
      id: `wrong-${index}`,
      text: w.text,
      emoji: w.emoji,
      isCorrect: false,
      feedback: w.feedback,
    })),
  ].sort(() => Math.random() - 0.5)

  return {
    characterEmoji: randomEmotion.emoji,

    situation:
      `${randomCharacter} ${randomEmotion.text} ${randomPlace} ${randomSituation}`,

    question:
      "¿Qué sería lo mejor que podrías hacer?",

    options,
  }
}