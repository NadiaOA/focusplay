// lib/memory-data.ts
export interface MemorySet {
  id: string
  pairs: { id: string; emoji: string; label: string }[]
  timeSeconds: number // tiempo límite
}

// Nivel 1: 4 pares, 90 segundos
const LEVEL_1: MemorySet = {
  id: "l1",
  timeSeconds: 90,
  pairs: [
    { id: "star",     emoji: "⭐", label: "estrella" },
    { id: "sun",      emoji: "☀️", label: "sol"      },
    { id: "moon",     emoji: "🌙", label: "luna"     },
    { id: "rainbow",  emoji: "🌈", label: "arcoíris" },
  ],
}

// Nivel 2: 4 pares animales, 75 segundos
const LEVEL_2: MemorySet = {
  id: "l2",
  timeSeconds: 75,
  pairs: [
    { id: "cat",   emoji: "🐱", label: "gato"    },
    { id: "dog",   emoji: "🐶", label: "perro"   },
    { id: "rabbit",emoji: "🐰", label: "conejo"  },
    { id: "bear",  emoji: "🐻", label: "oso"     },
  ],
}

// Nivel 3: 6 pares, 70 segundos
const LEVEL_3: MemorySet = {
  id: "l3",
  timeSeconds: 70,
  pairs: [
    { id: "pizza",   emoji: "🍕", label: "pizza"    },
    { id: "icecream",emoji: "🍦", label: "helado"   },
    { id: "cake",    emoji: "🎂", label: "pastel"   },
    { id: "cookie",  emoji: "🍪", label: "galleta"  },
    { id: "apple",   emoji: "🍎", label: "manzana"  },
    { id: "grape",   emoji: "🍇", label: "uvas"     },
  ],
}

export const MEMORY_LEVELS: Record<number, MemorySet> = {
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3,
}

export function buildCards(set: MemorySet) {
  const cards = set.pairs.flatMap((p) => [
    { cardId: `${p.id}-a`, pairId: p.id, emoji: p.emoji, label: p.label },
    { cardId: `${p.id}-b`, pairId: p.id, emoji: p.emoji, label: p.label },
  ])
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}
