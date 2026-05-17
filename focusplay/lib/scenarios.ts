// lib/scenarios.ts
export interface Option {
  id: string
  emoji: string
  text: string
  isCorrect: boolean
  feedback: string
}

export interface Scenario {
  id: string
  situation: string
  question: string
  characterEmoji: string
  options: Option[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    situation: "Un compañero no quiere jugar contigo.",
    question: "¿qué haces?",
    characterEmoji: "🧒",
    options: [
      { id: "a", emoji: "😤", text: "Me enojo y me voy",                       isCorrect: false, feedback: "Enojarse puede alejar a los amigos. Intenta buscar otra solución." },
      { id: "b", emoji: "🙋", text: "Le pregunto si jugamos algo diferente",    isCorrect: true,  feedback: "¡Muy bien! Proponer alternativas es una excelente forma de hacer amigos. 🌟" },
      { id: "c", emoji: "🤐", text: "Me quedo callado y espero",                isCorrect: false, feedback: "Esperar en silencio puede funcionar, pero expresarte es mejor. ¡Inténtalo!" },
    ],
  },
  {
    id: "s2",
    situation: "Quieres jugar con un grupo de niños que no conoces.",
    question: "¿qué dices?",
    characterEmoji: "👦",
    options: [
      { id: "a", emoji: "😶", text: "No digo nada y me alejo",                  isCorrect: false, feedback: "Si te alejas, no podrás hacer nuevos amigos. ¡Anímate a decir algo!" },
      { id: "b", emoji: "👋", text: "Digo: '¡Hola! ¿Puedo jugar con ustedes?'", isCorrect: true,  feedback: "¡Perfecto! Presentarte con un saludo y una pregunta es la forma correcta. 🎉" },
      { id: "c", emoji: "😠", text: "Me meto a jugar sin pedir permiso",        isCorrect: false, feedback: "Unirse sin pedir permiso puede molestar a los demás. Pide siempre antes." },
    ],
  },
  {
    id: "s3",
    situation: "Tu amigo está triste y solo en el recreo.",
    question: "¿qué haces?",
    characterEmoji: "😢",
    options: [
      { id: "a", emoji: "🏃", text: "Paso de largo y sigo jugando",             isCorrect: false, feedback: "Ignorar a alguien triste no está bien. Los amigos se apoyan. 💙" },
      { id: "b", emoji: "🤗", text: "Me acerco y le pregunto si está bien",     isCorrect: true,  feedback: "¡Excelente! Mostrar empatía es una de las mejores cosas que puedes hacer. 💛" },
      { id: "c", emoji: "😂", text: "Me río porque se ve gracioso",             isCorrect: false, feedback: "Reírse de alguien triste puede lastimarlo más. La empatía es importante." },
    ],
  },
  {
    id: "s4",
    situation: "Le pediste prestado un juguete a un amigo y lo rompiste sin querer.",
    question: "¿qué haces?",
    characterEmoji: "😬",
    options: [
      { id: "a", emoji: "🙈", text: "Lo escondo y no digo nada",                isCorrect: false, feedback: "Esconder los errores no es una buena idea. Es mejor ser honesto." },
      { id: "b", emoji: "😔", text: "Le digo la verdad y me disculpo",          isCorrect: true,  feedback: "¡Muy bien! Ser honesto y disculparse muestra que eres una buena persona. ⭐" },
      { id: "c", emoji: "😤", text: "Le digo que ya estaba roto",               isCorrect: false, feedback: "Mentir puede dañar la amistad. La honestidad es siempre mejor." },
    ],
  },
  {
    id: "s5",
    situation: "Estás jugando y otro niño llega y quiere jugar también.",
    question: "¿qué haces?",
    characterEmoji: "🧒",
    options: [
      { id: "a", emoji: "🚫", text: "Le digo que no puede jugar",               isCorrect: false, feedback: "Excluir a otros no es amigable. Compartir hace el juego más divertido." },
      { id: "b", emoji: "😊", text: "Lo invito a unirse al juego",              isCorrect: true,  feedback: "¡Fantástico! Incluir a todos hace que el juego sea más divertido para todos. 🎊" },
      { id: "c", emoji: "😶", text: "No le digo nada y sigo jugando",           isCorrect: false, feedback: "Ignorarlo puede hacerlo sentir mal. Un pequeño gesto de inclusión hace la diferencia." },
    ],
  },
]
