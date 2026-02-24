import { Achievement } from './types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: '第一滴血', description: '击毁第一架敌机', unlocked: false },
  { id: 'survivor', name: '生存者', description: '在单场游戏中生存超过 60 秒', unlocked: false },
  { id: 'sharpshooter', name: '神枪手', description: '分数达到 1000 分', unlocked: false },
  { id: 'level_master', name: '关卡大师', description: '到达第 5 关', unlocked: false },
  { id: 'shield_master', name: '护盾大师', description: '在拥有护盾的情况下被击中', unlocked: false },
];

export const GAME_CONFIG = {
  PLAYER_SPEED: 8,
  BULLET_SPEED: 12,
  ENEMY_SPAWN_RATE: 1500, // ms
  POWERUP_SPAWN_RATE: 10000, // ms
  BASE_ENEMY_SPEED: 2,
  LEVEL_UP_SCORE: 500,
  ASSETS: {
    CYAN: {
      1: '/assets/cyan_1.png',
      2: '/assets/cyan_2.png',
      3: '/assets/cyan_3.png',
    },
    ORANGE: {
      1: '/assets/orange_1.png',
      2: '/assets/orange_2.png',
      3: '/assets/orange_3.png',
    },
    WHITE: {
      1: '/assets/white_1.png',
      2: '/assets/white_2.png',
      3: '/assets/white_3.png',
    }
  }
};
