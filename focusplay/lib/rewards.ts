// lib/rewards.ts

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
  type: 'video' | 'game' | 'feature' | 'accessory';
  payload: string; // e.g., YouTube video ID, game identifier
  accessoryType?: 'hat' | 'glasses';
  comingSoon?: boolean;
}

export const REWARDS: Reward[] = [
  {
    id: 'video_cats',
    title: 'Videos de Gatos',
    description: '¡Relájate 5 minutos viendo videos divertidos de gatitos!',
    icon: '😺',
    cost: 20,
    type: 'video',
    payload: '5dsGWM5XGdg', // A 5-minute compilation of funny cats
  },
  {
    id: 'video_space',
    title: 'Viaje por el Espacio',
    description: 'Un video relajante de 10 minutos viajando por las estrellas.',
    icon: '🚀',
    cost: 35,
    type: 'video',
    payload: '8gD_9222QpA', // 10-min 4K space travel video
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
    id: 'avatar_shiny_bg',
    title: 'Fondo Animado',
    description: 'Un fondo brillante y animado para tu avatar.',
    icon: '✨',
    cost: 50,
    type: 'feature',
    payload: 'animated_background',
    comingSoon: true,
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