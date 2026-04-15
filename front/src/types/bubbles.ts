export interface FloatingMessage {
  id: string;
  author: string;
  text: string;
  isAnonymous: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
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
  color: string;
}

export interface BubbleAuthor {
  id: string;
  username: string;
  iconName?: string | null;
}

export interface BubbleMessageData {
  id: string;
  content: string;
  isAnonymous: boolean;
  author: BubbleAuthor;
  createdAt: string;
}

export interface BubbleData {
  id: string;
  title: string;
  isAnonymous: boolean;
  author: BubbleAuthor;
  messages: BubbleMessageData[];
  createdAt: string;
  updatedAt: string;
}


