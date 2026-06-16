// lib/rewards.ts

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
  type: 'video' | 'game' | 'feature' | 'accessory';
  payload: string; // e.g., YouTube video ID, game identifier
  accessoryType?: 'hat' | 'glasses' | 'background';
  comingSoon?: boolean;
}

export const REWARDS: Reward[] = [
  {
    id: 'video_cats',
    title: 'Videos de Animales',
    description: '¡Relájate un rato viendo videos divertidos de animales tiernos y graciosos!',
    icon: '😺',
    cost: 20,
    type: 'video',
    payload: 'GkhulbxS190', // A 5-minute compilation of funny cats
  },
  {
    id: 'video_world',
    title: 'Viaje por el mundo',
    description: 'Un video relajante de 10 minutos.',
    icon: '🌳',
    cost: 35,
    type: 'video',
    payload: 'FmBlDrbWAHA', // Nuevo ID de video relajante del espacio que permite incrustación
  },
  {
    id: 'video_space',
    title: 'Odisea',
    description: '¿Cómo es que inicio el universo? Cónocelo en este viaje por el espacio.',
    icon: '🌌',
    cost: 50,
    type: 'video',
    payload: 'TBikbn5XJhg', // Nuevo ID de video relajante del espacio que permite incrustación
  },
  {
    id: 'video_marble_run',
    title: 'Carrera de Canicas',
    description: 'Sigue a las canicas en un circuito fascinante y colorido.',
    icon: '🎢',
    cost: 30,
    type: 'video',
    payload: '_biIzYIUSWg', // Pista de canicas (Marble run)
  },
  {
    id: 'video_kinetic_sand',
    title: 'Arena Mágica',
    description: 'Video relajante y visualmente estimulante de arena cinética.',
    icon: '🏖️',
    cost: 30,
    type: 'video',
    payload: 'Dikz3vHp1eQ', // Arena cinética (Satisfying ASMR)
  },
  {
    id: 'video_train_ride',
    title: 'Viaje en Tren',
    description: 'Mira por la ventana de un tren mientras recorre hermosos paisajes.',
    icon: '🚂',
    cost: 35,
    type: 'video',
    payload: 'ADt_RisXY0U', // Viaje en tren (Train POV)
  },
  {
    id: 'video_maincra',
    title: 'Animación de Minecraft',
    description: 'Conoce esta historia a través del mundo cúbico',
    icon: '🎬',
    cost: 60,
    type: 'video',
    payload: 'cYqEEqnL1OQ', // Viaje en tren (Train POV)
  },
  {
    id: 'avatar_shiny_bg',
    title: 'Fondo Animado (Avatar)',
    description: 'Un fondo animado de bloques para tu avatar.',
    icon: '🧊',
    cost: 50,
    type: 'accessory',
    payload: 'minecraft_bg',
    accessoryType: 'background',
  },
  {
    id: 'acc_glasses_classic',
    title: 'Gafas Clásicas',
    description: 'Unas gafas negras para un look intelectual.',
    icon: '👓',
    cost: 40,
    type: 'accessory',
    payload: 'glasses_classic',
    accessoryType: 'glasses',
  },
  {
    id: 'acc_hat_cap',
    title: 'Gorra de Béisbol',
    description: 'Una gorra azul para protegerte del sol.',
    icon: '🧢',
    cost: 60,
    type: 'accessory',
    payload: 'hat_cap',
    accessoryType: 'hat',
  },
  {
    id: 'game_maze',
    title: 'Juego de Laberinto',
    description: 'Un nuevo mini-juego para encontrar la salida del laberinto.',
    icon: '🗺️',
    cost: 100,
    type: 'game',
    payload: 'maze',
    comingSoon: true,
  },
];