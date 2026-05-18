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
  {
    id: "s6",
    situation: "Estás jugando tu videojuego favorito, pero ya es el turno de tu amigo.",
    question: "¿qué haces?",
    characterEmoji: "🎮",
    options: [
      { id: "a", emoji: "😤", text: "Lloro y no le doy el control",             isCorrect: false, feedback: "Llorar no ayuda. Compartir turnos hace que jugar juntos sea divertido para ambos." },
      { id: "b", emoji: "⏳", text: "Le doy el control y espero mi turno",      isCorrect: true,  feedback: "¡Muy bien! Esperar tu turno pacientemente demuestra que eres un gran amigo. 🌟" },
      { id: "c", emoji: "🚶", text: "Me voy porque ya no quiero jugar",         isCorrect: false, feedback: "Irte puede hacer sentir mal a tu amigo. Es mejor aprender a esperar." },
    ],
  },
  {
    id: "s7",
    situation: "Iban a ir al parque, pero empezó a llover fuerte y tienen que quedarse adentro.",
    question: "¿qué haces?",
    characterEmoji: "🌧️",
    options: [
      { id: "a", emoji: "🧩", text: "Busco un juego divertido para la casa",    isCorrect: true,  feedback: "¡Excelente! Adaptarse a los cambios es una gran habilidad. ¡Bien hecho! ✨" },
      { id: "b", emoji: "😠", text: "Grito porque yo quería ir al parque",      isCorrect: false, feedback: "Gritar no detendrá la lluvia. Es mejor buscar algo divertido que hacer adentro." },
      { id: "c", emoji: "🚪", text: "Me encierro en mi cuarto enojado",         isCorrect: false, feedback: "Estar frustrado es normal, pero aislarte no te ayudará a sentirte mejor. ¡Busca otra actividad!" },
    ],
  },
  {
    id: "s8",
    situation: "Un compañero se para muy cerca de ti al hablar y te sientes incómodo.",
    question: "¿qué haces?",
    characterEmoji: "🧍",
    options: [
      { id: "a", emoji: "🥊", text: "Lo empujo fuerte para que se aleje",       isCorrect: false, feedback: "Empujar puede lastimar a otros. Es mejor usar siempre tus palabras." },
      { id: "b", emoji: "🗣️", text: "Le pido: '¿Puedes darme un poco de espacio?'", isCorrect: true,  feedback: "¡Perfecto! Pedir espacio personal con amabilidad es la forma correcta de hacerlo. 🛡️" },
      { id: "c", emoji: "😣", text: "Me aguanto y me siento muy mal",           isCorrect: false, feedback: "No tienes que sentirte incómodo. Está muy bien pedir espacio amablemente." },
    ],
  },
  {
    id: "s9",
    situation: "En el salón hacen mucho ruido de repente y te duelen los oídos.",
    question: "¿qué haces?",
    characterEmoji: "🙉",
    options: [
      { id: "a", emoji: "😫", text: "Empiezo a gritar para que se callen",      isCorrect: false, feedback: "Gritar solo hace más ruido en el salón. Es mejor pedir ayuda a un adulto." },
      { id: "b", emoji: "🎧", text: "Me tapo los oídos y le pido ayuda al maestro", isCorrect: true,  feedback: "¡Muy bien! Reconocer lo que sientes y pedir ayuda es lo mejor que puedes hacer. 💛" },
      { id: "c", emoji: "🪑", text: "Me escondo debajo de la mesa asustado",    isCorrect: false, feedback: "Esconderse no soluciona el problema. Pídele ayuda a tu maestro para estar más tranquilo." },
    ],
  },
  {
    id: "s10",
    situation: "Estás jugando una carrera con tu amigo y él te gana.",
    question: "¿qué haces?",
    characterEmoji: "🏁",
    options: [
      { id: "a", emoji: "🙌", text: "Le digo '¡Buen juego!' y choco los cinco", isCorrect: true,  feedback: "¡Genial! Felicitar a los demás demuestra que sabes jugar y divertirte ganes o pierdas. 🏆" },
      { id: "b", emoji: "😠", text: "Digo que hizo trampa y me enojo",          isCorrect: false, feedback: "Acusar sin razón puede herir a tu amigo. A veces se gana y otras se pierde." },
      { id: "c", emoji: "😭", text: "Rompo a llorar porque quería ganar",       isCorrect: false, feedback: "Es normal querer ganar, pero llorar no cambia el resultado. ¡La próxima te irá mejor!" },
    ],
  },
  {
    id: "s11",
    situation: "Llevas mucho tiempo hablando de tu tema favorito y tu amigo mira a otro lado aburrido.",
    question: "¿qué haces?",
    characterEmoji: "🦖",
    options: [
      { id: "a", emoji: "📢", text: "Hablo más fuerte para que me escuche",     isCorrect: false, feedback: "Hablar más fuerte no hará que le interese. Es mejor cambiar de tema de vez en cuando." },
      { id: "b", emoji: "💬", text: "Le pregunto: '¿De qué quieres hablar tú?'", isCorrect: true,  feedback: "¡Súper! Darle la oportunidad de hablar a tu amigo hace la plática divertida para los dos. 🔄" },
      { id: "c", emoji: "😤", text: "Me enojo y lo dejo hablando solo",         isCorrect: false, feedback: "No te enojes. A veces a nuestros amigos les interesan cosas diferentes a las nuestras." },
    ],
  },
  {
    id: "s12",
    situation: "Tu amigo quiere cambiar un poco las reglas del juego que están jugando.",
    question: "¿qué haces?",
    characterEmoji: "🎲",
    options: [
      { id: "a", emoji: "🚫", text: "Le digo que no y me llevo el juego",       isCorrect: false, feedback: "Llevarte el juego termina con la diversión. Intentar cosas nuevas puede ser genial." },
      { id: "b", emoji: "🤔", text: "Escucho su idea e intentamos las nuevas reglas", isCorrect: true,  feedback: "¡Excelente! Ser flexible y probar cosas nuevas hace que todos se diviertan más. 💡" },
      { id: "c", emoji: "😠", text: "Le grito que las reglas no se cambian",    isCorrect: false, feedback: "Enojarte asusta a los demás. ¡Probar nuevas reglas puede ser muy divertido!" },
    ],
  },
  {
    id: "s13",
    situation: "Un niño tropieza sin querer y tira tus cosas al suelo.",
    question: "¿qué haces?",
    characterEmoji: "🖍️",
    options: [
      { id: "a", emoji: "😡", text: "Le grito y le digo que es malo",           isCorrect: false, feedback: "Fue un accidente, no lo hizo a propósito. Gritar no es necesario." },
      { id: "b", emoji: "🤝", text: "Entiendo que fue un accidente y recogemos todo", isCorrect: true,  feedback: "¡Muy bien! Los accidentes pasan. Ser comprensivo te hace una gran persona. 🌈" },
      { id: "c", emoji: "💥", text: "Le tiro sus cosas también para vengarme",  isCorrect: false, feedback: "Vengarse solo empeora la situación. Es mejor hablarlo y solucionarlo tranquilamente." },
    ],
  },
  {
    id: "s14",
    situation: "Tus amigos cuentan un chiste que no entiendes y todos se ríen.",
    question: "¿qué haces?",
    characterEmoji: "😂",
    options: [
      { id: "a", emoji: "🙋", text: "Les pregunto: '¿Me explican el chiste?'",  isCorrect: true,  feedback: "¡Perfecto! Preguntar cuando no entiendes algo es muy inteligente y valiente. 🧠" },
      { id: "b", emoji: "😠", text: "Me enojo porque creo que se ríen de mí",   isCorrect: false, feedback: "No asumas que se ríen de ti. Los chistes a veces son difíciles de entender." },
      { id: "c", emoji: "🏃", text: "Me alejo corriendo y lloro",               isCorrect: false, feedback: "Huir no resuelve la duda. ¡Es mejor pedirles con calma que te lo expliquen!" },
    ],
  },
  {
    id: "s15",
    situation: "Es la hora del almuerzo y no puedes abrir tu jugo o tu comida.",
    question: "¿qué haces?",
    characterEmoji: "🧃",
    options: [
      { id: "a", emoji: "💥", text: "Lo aprieto muy fuerte hasta que se rompa", isCorrect: false, feedback: "Romper las cosas por frustración no es buena idea. Pide ayuda primero." },
      { id: "b", emoji: "🗣️", text: "Le pido a alguien: '¿Me ayudas por favor?'", isCorrect: true,  feedback: "¡Muy bien! Pedir ayuda amablemente siempre es la mejor solución cuando algo nos cuesta trabajo. 👍" },
      { id: "c", emoji: "😔", text: "No me lo tomo y me quedo con hambre",      isCorrect: false, feedback: "No te quedes con hambre. Siempre habrá alguien dispuesto a ayudarte si lo pides." },
    ],
  }
]
