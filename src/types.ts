export enum GameState {
  START = 'START',
  FORMATION_SELECT = 'FORMATION_SELECT',
  LEVEL_UP_SELECT = 'LEVEL_UP_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
}

export enum Formation {
  CYAN = 'CYAN',
  ORANGE = 'ORANGE',
  WHITE = 'WHITE',
}

export enum PlayerType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
  RECON = 'RECON',
  BOMBER = 'BOMBER',
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
}

export enum PowerUpType {
  TRIPLE_SHOT = 'TRIPLE_SHOT',
  SHIELD = 'SHIELD',
  LASER = 'LASER',
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface GameStats {
  score: number;
  level: number;
  health: number;
  maxHealth: number;
  enemiesDestroyed: number;
  distanceTraveled: number;
  achievements: Achievement[];
}

export interface Point {
  x: number;
  y: number;
}
