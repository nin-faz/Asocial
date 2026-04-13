export interface FloatingMessage {
  id: string;
  author: string;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dislikes: number;
  size: number;
  color: string;
  createdAt: Date;
  trail: Array<{ x: number; y: number }>;
  addedAt: number;
}

export interface Bubble {
  id: string;
  title: string;
  author: string;
  count: number;
  messages: FloatingMessage[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}
