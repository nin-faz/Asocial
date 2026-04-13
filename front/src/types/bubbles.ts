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

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface BubbleAuthor {
  id: string;
  username: string;
  iconName?: string | null;
}

export interface BubbleMessageData {
  id: string;
  content: string;
  author: BubbleAuthor;
  dislikes: number;
  createdAt: string;
}

export interface BubbleData {
  id: string;
  title: string;
  author: BubbleAuthor;
  messages: BubbleMessageData[];
  createdAt: string;
  updatedAt: string;
}


