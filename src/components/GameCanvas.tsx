import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, EnemyType, PowerUpType, Point, Formation, PlayerType } from '../types';
import { GAME_CONFIG } from '../constants';

// Audio Utility
let audioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

const playSound = (freq: number, type: OscillatorType = 'sine', duration: number = 0.1, volume: number = 0.1, slide: number = 0) => {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide !== 0) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, freq + slide), ctx.currentTime + duration);
    }
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail
  }
};

class BGMManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private tempo: number = 124;
  private scheduleAheadTime: number = 0.1;
  private lookahead: number = 25.0;
  private timerID?: number;

  private getCtx() {
    if (!this.ctx) this.ctx = getAudioCtx();
    return this.ctx;
  }

  private playNote(freq: number, startTime: number, duration: number, volume: number, type: OscillatorType = 'triangle') {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private scheduler() {
    const ctx = this.getCtx();
    while (this.nextNoteTime < ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceNote();
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduleNote(step: number, time: number) {
    // Bassline
    const bassFreqs = [65.41, 49.00, 43.65, 49.00]; // C2, G1, F1, G1
    if (step % 4 === 0) {
      const freq = bassFreqs[Math.floor(step / 4)];
      this.playNote(freq, time, 0.4, 0.04, 'square');
    }

    // Melody
    const melody = [130.81, 155.56, 174.61, 196.00, 233.08]; // C3, Eb3, F3, G3, Bb3
    if (step % 2 === 0 && Math.random() > 0.7) {
      const freq = melody[Math.floor(Math.random() * melody.length)];
      this.playNote(freq, time, 0.2, 0.02, 'triangle');
    }
  }

  start() {
    if (this.isPlaying) return;
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID) window.clearTimeout(this.timerID);
  }
}

const bgm = new BGMManager();

interface GameCanvasProps {
  gameState: GameState;
  formation: Formation;
  playerType: PlayerType;
  onGameOver: (score: number, level: number, destroyed: number) => void;
  onScoreUpdate: (score: number) => void;
  onHealthUpdate: (health: number) => void;
  onBloodSugarUpdate: (bloodSugar: number) => void;
  onLevelUpdate: (level: number) => void;
  onAchievementUnlock: (id: string) => void;
}

// Entity Classes
class Bullet {
  x: number;
  y: number;
  radius: number = 3;
  speed: number = GAME_CONFIG.BULLET_SPEED;
  angle: number;

  constructor(x: number, y: number, angle: number = -Math.PI / 2) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00f2ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f2ff';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
  }
}

class Bomb {
  x: number;
  y: number;
  radius: number = 8;
  speed: number = GAME_CONFIG.BULLET_SPEED * 0.6;
  angle: number;

  constructor(x: number, y: number, angle: number = -Math.PI / 2) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4400';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff4400';
    ctx.fill();
    
    // Inner core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff00';
    ctx.fill();
    
    ctx.closePath();
    ctx.shadowBlur = 0;
  }
}

class EnemyBullet {
  x: number;
  y: number;
  radius: number = 3;
  speed: number = GAME_CONFIG.BULLET_SPEED * 0.5;
  color: string;

  constructor(x: number, y: number, color: string = '#ff0000') {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
  }
}

class Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  type: EnemyType;
  speed: number;
  health: number;
  color: string;
  formation: Formation;
  lastShot: number = 0;
  shootInterval: number;

  constructor(canvasWidth: number, level: number, formation: Formation) {
    const types = [EnemyType.BASIC, EnemyType.FAST, EnemyType.HEAVY];
    const rand = Math.random();
    const heavyProb = Math.min(0.4, 0.05 * level); // Up to 40% chance for heavy at high levels
    const fastProb = Math.min(0.5, 0.1 * level);  // Up to 50% chance for fast at high levels

    if (rand < heavyProb && level >= 3) this.type = EnemyType.HEAVY;
    else if (rand < heavyProb + fastProb && level >= 2) this.type = EnemyType.FAST;
    else this.type = EnemyType.BASIC;

    this.formation = formation;
    this.width = this.type === EnemyType.HEAVY ? 60 : (this.type === EnemyType.FAST ? 35 : 40);
    this.height = this.type === EnemyType.HEAVY ? 60 : (this.type === EnemyType.FAST ? 35 : 40);
    this.x = Math.random() * (canvasWidth - this.width);
    this.y = -this.height;
    this.lastShot = Date.now();

    const baseColor = formation === Formation.CYAN ? '#00f2ff' : '#ff7700';

    switch (this.type) {
      case EnemyType.FAST:
        this.speed = (GAME_CONFIG.BASE_ENEMY_SPEED + 4) * (1 + level * 0.25);
        this.health = Math.floor(1 * (1 + level * 0.2));
        this.color = formation === Formation.CYAN ? '#00ffff' : '#ffaa00';
        this.shootInterval = 1000;
        break;
      case EnemyType.HEAVY:
        this.speed = (GAME_CONFIG.BASE_ENEMY_SPEED) * (1 + level * 0.15);
        this.health = Math.floor(10 * (1 + level * 0.4));
        this.color = formation === Formation.CYAN ? '#0088ff' : '#ff4400';
        this.shootInterval = 1000;
        break;
      default:
        this.speed = (GAME_CONFIG.BASE_ENEMY_SPEED + 1) * (1 + level * 0.2);
        this.health = Math.floor(2 * (1 + level * 0.25));
        this.color = baseColor;
        this.shootInterval = 1000;
    }
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D, assets: { [key: string]: HTMLImageElement }) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(Math.PI); // Enemies face down
    
    const level = this.type === EnemyType.HEAVY ? 3 : (this.type === EnemyType.FAST ? 2 : 1);
    const src = GAME_CONFIG.ASSETS[this.formation][level as 1 | 2 | 3];
    const img = assets[src];

    if (img && img.complete && img.naturalWidth !== 0) {
      ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      // Fallback to shapes if image not loaded
      ctx.beginPath();
      if (this.type === EnemyType.HEAVY) {
        ctx.moveTo(0, -this.height/2);
        ctx.lineTo(-this.width/2, -this.height/4);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.lineTo(this.width/2, this.height/2);
        ctx.lineTo(this.width/2, -this.height/4);
      } else if (this.type === EnemyType.FAST) {
        ctx.moveTo(0, -this.height/2);
        ctx.lineTo(-this.width/3, this.height/2);
        ctx.lineTo(0, this.height/4);
        ctx.lineTo(this.width/3, this.height/2);
      } else {
        ctx.moveTo(0, -this.height/2);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.lineTo(0, this.height/3);
        ctx.lineTo(this.width/2, this.height/2);
      }
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
    ctx.shadowBlur = 0;
  }
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.02;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

class PowerUp {
  x: number;
  y: number;
  radius: number = 15;
  type: PowerUpType;
  speed: number = 2;

  constructor(canvasWidth: number) {
    this.x = Math.random() * (canvasWidth - 30) + 15;
    this.y = -30;
    this.type = Math.random() > 0.5 ? PowerUpType.TRIPLE_SHOT : PowerUpType.SHIELD;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.type === PowerUpType.SHIELD ? '#00ff00' : '#ffff00';
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.fillStyle as string;
    ctx.fill();
    
    // Icon inside
    ctx.fillStyle = 'black';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.type === PowerUpType.SHIELD ? 'S' : 'T', this.x, this.y);
    
    ctx.shadowBlur = 0;
  }
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  formation,
  playerType,
  onGameOver,
  onScoreUpdate,
  onHealthUpdate,
  onBloodSugarUpdate,
  onLevelUpdate,
  onAchievementUnlock,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const imageAssets = useRef<{ [key: string]: HTMLImageElement }>({});
  
  // Preload Images
  useEffect(() => {
    const loadImages = () => {
      const assets = GAME_CONFIG.ASSETS;
      const toLoad = [
        ...Object.values(assets.CYAN),
        ...Object.values(assets.ORANGE)
      ];

      toLoad.forEach(src => {
        const img = new Image();
        img.src = src;
        imageAssets.current[src] = img;
      });
    };
    loadImages();
  }, []);

  // Game State Refs (to avoid closure issues in loop)
  const playerRef = useRef({
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    health: 3,
    maxHealth: 3,
    score: 0,
    level: 1,
    invincible: 0,
    tripleShot: 0,
    shield: false,
    destroyed: 0,
    startTime: Date.now(),
    damageCounter: 0,
    bloodSugar: 100
  });

  const keys = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef<{ x: number, y: number }>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const isMouseDown = useRef<boolean>(false);
  const bullets = useRef<Bullet[]>([]);
  const enemyBullets = useRef<EnemyBullet[]>([]);
  const bombs = useRef<Bomb[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const particles = useRef<Particle[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const stars = useRef<{ x: number, y: number, size: number, speed: number }[]>([]);

  // Initialize Stars
  useEffect(() => {
    const s = [];
    for (let i = 0; i < 100; i++) {
      s.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2,
        speed: Math.random() * 2 + 0.5
      });
    }
    stars.current = s;
  }, []);

  const [shake, setShake] = useState(0);
  const [flash, setFlash] = useState(0);
  const [collectFlash, setCollectFlash] = useState(0);

  const handleAchievementUnlock = useCallback((id: string) => {
    playSound(523.25, 'sine', 0.5, 0.1, 523.25); // C5 to C6
    onAchievementUnlock(id);
  }, [onAchievementUnlock]);

  // BGM Control
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      bgm.start();
      playSound(220, 'sine', 0.5, 0.2, 440); // Start sound
    } else {
      bgm.stop();
    }
    return () => bgm.stop();
  }, [gameState]);

  const resetGame = useCallback(() => {
    playerRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight - 100,
      width: 40,
      height: 40,
      health: playerType === PlayerType.HEAVY ? 5 : (playerType === PlayerType.BOMBER ? 4 : (playerType === PlayerType.FAST ? 2 : (playerType === PlayerType.RECON ? 1 : 3))),
      maxHealth: playerType === PlayerType.HEAVY ? 5 : (playerType === PlayerType.BOMBER ? 4 : (playerType === PlayerType.FAST ? 2 : (playerType === PlayerType.RECON ? 1 : 3))),
      score: 0,
      level: 1,
      invincible: 0,
      tripleShot: 0,
      shield: false,
      destroyed: 0,
      startTime: Date.now(),
      damageCounter: 0,
      bloodSugar: 100
    };
    bullets.current = [];
    enemyBullets.current = [];
    enemies.current = [];
    particles.current = [];
    powerUps.current = [];
    bombs.current = [];
    onScoreUpdate(0);
    onHealthUpdate(3);
    onLevelUpdate(1);
  }, [onScoreUpdate, onHealthUpdate, onLevelUpdate]);

  useEffect(() => {
    if (gameState === GameState.PLAYING && playerRef.current.health <= 0) {
      resetGame();
    }
  }, [gameState, resetGame]);

  const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
  const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isMouseDown.current = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) isMouseDown.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const spawnEnemy = () => {
    if (gameState !== GameState.PLAYING) return;
    const enemyFormation = formation === Formation.CYAN ? Formation.ORANGE : Formation.CYAN;
    enemies.current.push(new Enemy(window.innerWidth, playerRef.current.level, enemyFormation));
  };

  const spawnPowerUp = () => {
    if (gameState !== GameState.PLAYING) return;
    powerUps.current.push(new PowerUp(window.innerWidth));
  };

  useEffect(() => {
    const enemyInterval = setInterval(spawnEnemy, GAME_CONFIG.ENEMY_SPAWN_RATE / (1 + playerRef.current.level * 0.45));
    const powerUpInterval = setInterval(spawnPowerUp, GAME_CONFIG.POWERUP_SPAWN_RATE);
    return () => {
      clearInterval(enemyInterval);
      clearInterval(powerUpInterval);
    };
  }, [gameState]);

  const update = () => {
    if (gameState !== GameState.PLAYING) return;

    const p = playerRef.current;
    
    // Player Movement towards mouse
    const dx = mousePos.current.x - (p.x + p.width / 2);
    const dy = mousePos.current.y - (p.y + p.height / 2);
    const distance = Math.hypot(dx, dy);
    
    let speedMultiplier = 2.5;
    if (playerType === PlayerType.FAST) speedMultiplier = 3.5;
    if (playerType === PlayerType.HEAVY) speedMultiplier = 1.8;
    if (playerType === PlayerType.RECON) speedMultiplier = 3.0;

    // Blood Sugar Decay
    p.bloodSugar = Math.max(0, p.bloodSugar - 0.02);
    if (p.bloodSugar <= 0) speedMultiplier *= 0.5; // Slow down when out of energy
    onBloodSugarUpdate(p.bloodSugar);

    if (distance > 5) {
      const angle = Math.atan2(dy, dx);
      p.x += Math.cos(angle) * GAME_CONFIG.PLAYER_SPEED * speedMultiplier;
      p.y += Math.sin(angle) * GAME_CONFIG.PLAYER_SPEED * speedMultiplier;
    }

    // Trail particles
    if (distance > 5 || collectFlash > 0) {
      const trailColor = collectFlash > 0 ? '#ffff00' : (formation === Formation.CYAN ? '#00f2ff' : (formation === Formation.WHITE ? '#ffffff' : '#ff7700'));
      const particleCount = collectFlash > 0 ? 3 : 1;
      for (let i = 0; i < particleCount; i++) {
        particles.current.push(new Particle(
          p.x + p.width / 2 + (Math.random() - 0.5) * 10,
          p.y + p.height / 2 + (Math.random() - 0.5) * 10,
          trailColor
        ));
      }
    }

    // Boundaries
    p.x = Math.max(0, Math.min(window.innerWidth - p.width, p.x));
    p.y = Math.max(0, Math.min(window.innerHeight - p.height, p.y));

    // Shooting
    if (isMouseDown.current) {
      const now = Date.now();
      let shootInterval = 120;
      if (playerType === PlayerType.FAST) shootInterval = 70;
      if (playerType === PlayerType.HEAVY) shootInterval = 160;

      if (!p.lastShot || now - p.lastShot > shootInterval) {
        // Bomb drop logic
        let bombChance = 0.05;
        if (playerType === PlayerType.BOMBER) bombChance = 0.10;

        if (Math.random() < bombChance) {
          bombs.current.push(new Bomb(p.x + p.width / 2, p.y));
          playSound(150, 'sine', 0.4, 0.1, -100);
        }

        if (p.tripleShot > 0) {
          bullets.current.push(new Bullet(p.x + p.width / 2, p.y, -Math.PI / 2));
          bullets.current.push(new Bullet(p.x + p.width / 2, p.y, -Math.PI / 2 - 0.2));
          bullets.current.push(new Bullet(p.x + p.width / 2, p.y, -Math.PI / 2 + 0.2));
          p.tripleShot--;
          playSound(600, 'sine', 0.05, 0.03, 200);
        } else {
          bullets.current.push(new Bullet(p.x + p.width / 2, p.y));
          playSound(800, 'sine', 0.05, 0.02, 100);
        }
        (p as any).lastShot = now;
      }
    }

    // Update Entities
    bullets.current.forEach(b => b.update());
    enemyBullets.current.forEach(eb => eb.update());
    bombs.current.forEach(b => b.update());
    enemies.current.forEach(e => {
      e.update();
      // Enemy Shooting
      const now = Date.now();
      if (now - e.lastShot > e.shootInterval) {
        enemyBullets.current.push(new EnemyBullet(e.x + e.width / 2, e.y + e.height, e.color));
        e.lastShot = now;
      }
    });
    particles.current.forEach(part => part.update());
    powerUps.current.forEach(pw => pw.update());
    stars.current.forEach(s => {
      s.y += s.speed;
      if (s.y > window.innerHeight) s.y = -10;
    });

    // Cleanup
    bullets.current = bullets.current.filter(b => b.y > -50);
    enemyBullets.current = enemyBullets.current.filter(eb => eb.y < window.innerHeight + 50);
    bombs.current = bombs.current.filter(b => b.y > -50);
    enemies.current = enemies.current.filter(e => {
      if (e.y > window.innerHeight) {
        p.score = Math.max(0, p.score - 50);
        onScoreUpdate(p.score);
        return false;
      }
      return true;
    });
    particles.current = particles.current.filter(part => part.life > 0);
    powerUps.current = powerUps.current.filter(pw => pw.y < window.innerHeight + 50);

    // Collision Detection: Bullets vs Enemies
    bullets.current.forEach((b, bIdx) => {
      enemies.current.forEach((e, eIdx) => {
        const dist = Math.hypot(b.x - (e.x + e.width / 2), b.y - (e.y + e.height / 2));
        if (dist < e.width / 2 + b.radius) {
          bullets.current.splice(bIdx, 1);
          e.health--;
          playSound(200, 'sine', 0.05, 0.05, -100);
          if (e.health <= 0) {
            // Explosion
            playSound(150, 'sawtooth', 0.3, 0.1, -100);
            for (let i = 0; i < 10; i++) particles.current.push(new Particle(e.x + e.width / 2, e.y + e.height / 2, e.color));
            enemies.current.splice(eIdx, 1);
            p.score += e.type === EnemyType.HEAVY ? 200 : (e.type === EnemyType.FAST ? 150 : 100);
            p.destroyed++;
            onScoreUpdate(p.score);
            
            if (p.destroyed === 1) handleAchievementUnlock('first_blood');
            if (p.score >= 1000) handleAchievementUnlock('sharpshooter');
            
            // Level Up
            if (p.score >= p.level * GAME_CONFIG.LEVEL_UP_SCORE) {
              p.level++;
              enemies.current = []; // Clear screen
              onLevelUpdate(p.level);
              if (p.level === 5) handleAchievementUnlock('level_master');
            }
          }
        }
      });
    });

    // Collision Detection: Bombs vs Enemies (AoE)
    bombs.current.forEach((b, bIdx) => {
      enemies.current.forEach((e, eIdx) => {
        const dist = Math.hypot(b.x - (e.x + e.width / 2), b.y - (e.y + e.height / 2));
        if (dist < e.width / 2 + b.radius) {
          bombs.current.splice(bIdx, 1);
          playSound(80, 'sawtooth', 0.5, 0.2, -40);
          
          // Detonation Effect
          const explosionRadius = 250;
          for (let i = 0; i < 30; i++) {
            particles.current.push(new Particle(b.x, b.y, '#ff4400'));
            particles.current.push(new Particle(b.x, b.y, '#ffff00'));
          }

          // Damage nearby enemies
          enemies.current.forEach((ne, neIdx) => {
            const neDist = Math.hypot(b.x - (ne.x + ne.width / 2), b.y - (ne.y + ne.height / 2));
            if (neDist < explosionRadius) {
              ne.health -= 5; // Massive damage for AoE
              if (ne.health <= 0) {
                // Explosion particles for the enemy
                for (let i = 0; i < 10; i++) particles.current.push(new Particle(ne.x + ne.width / 2, ne.y + ne.height / 2, ne.color));
                
                // Score and level up logic (simplified for AoE)
                p.score += ne.type === EnemyType.HEAVY ? 200 : (ne.type === EnemyType.FAST ? 150 : 100);
                p.destroyed++;
                onScoreUpdate(p.score);
              }
            }
          });
          
          // Filter out dead enemies after AoE
          enemies.current = enemies.current.filter(en => en.health > 0);
          
          // Check for level up after AoE
          if (p.score >= p.level * GAME_CONFIG.LEVEL_UP_SCORE) {
            p.level++;
            enemies.current = []; 
            onLevelUpdate(p.level);
            if (p.level === 5) handleAchievementUnlock('level_master');
          }
        }
      });
    });

    // Collision Detection: Player vs Enemies
    if (p.invincible <= 0) {
      // Player vs Enemy Bullets
      enemyBullets.current.forEach((eb, idx) => {
        const dist = Math.hypot((p.x + p.width / 2) - eb.x, (p.y + p.height / 2) - eb.y);
        if (dist < p.width / 2 + eb.radius) {
          if (p.shield) {
            p.shield = false;
            handleAchievementUnlock('shield_master');
          } else {
            if (playerType === PlayerType.HEAVY) {
              (p as any).damageCounter = ((p as any).damageCounter || 0) + 1;
              if ((p as any).damageCounter % 3 === 0) {
                p.health--;
                onHealthUpdate(p.health);
              }
            } else {
              p.health--;
              onHealthUpdate(p.health);
            }
            setShake(35);
            setFlash(20);
            playSound(100, 'sawtooth', 0.2, 0.2, -50);
          }
          enemyBullets.current.splice(idx, 1);
          p.invincible = playerType === PlayerType.HEAVY ? 180 : 120;
          if (p.health <= 0) {
            playSound(60, 'sawtooth', 1.0, 0.3, -20);
            onGameOver(p.score, p.level, p.destroyed);
          }
        }
      });

      enemies.current.forEach((e, eIdx) => {
        const dist = Math.hypot((p.x + p.width / 2) - (e.x + e.width / 2), (p.y + p.height / 2) - (e.y + e.height / 2));
        if (dist < (p.width + e.width) / 2.5) {
          if (p.shield) {
            p.shield = false;
            handleAchievementUnlock('shield_master');
          } else {
            if (playerType === PlayerType.HEAVY) {
              (p as any).damageCounter = ((p as any).damageCounter || 0) + 1;
              if ((p as any).damageCounter % 3 === 0) {
                p.health--;
                onHealthUpdate(p.health);
              }
            } else {
              p.health--;
              onHealthUpdate(p.health);
            }
            setShake(50);
            setFlash(25);
            playSound(80, 'sawtooth', 0.3, 0.25, -40);
          }
          
          enemies.current.splice(eIdx, 1);
          p.invincible = playerType === PlayerType.HEAVY ? 180 : 120; // ~2-3 seconds at 60fps
          
          if (p.health <= 0) {
            playSound(60, 'sawtooth', 1.0, 0.3, -20);
            onGameOver(p.score, p.level, p.destroyed);
          }
        }
      });
    } else {
      p.invincible--;
    }

    // Collision Detection: Player vs PowerUps
    powerUps.current.forEach((pw, idx) => {
      const dist = Math.hypot((p.x + p.width / 2) - pw.x, (p.y + p.height / 2) - pw.y);
      if (dist < p.width / 2 + pw.radius) {
        if (pw.type === PowerUpType.SHIELD) p.shield = true;
        else p.tripleShot += 30;
        
        p.bloodSugar = Math.min(100, p.bloodSugar + 20); // Refill blood sugar
        
        // Effects
        setCollectFlash(15);
        playSound(440, 'sine', 0.3, 0.15, 440);
        for (let i = 0; i < 15; i++) {
          particles.current.push(new Particle(pw.x, pw.y, pw.type === PowerUpType.SHIELD ? '#00ff00' : '#ffff00'));
        }
        
        powerUps.current.splice(idx, 1);
      }
    });

    // Achievement: Survivor
    if (Date.now() - p.startTime > 60000) handleAchievementUnlock('survivor');
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.save();
    if (shake > 0) {
      const sx = (Math.random() - 0.5) * shake;
      const sy = (Math.random() - 0.5) * shake;
      ctx.translate(sx, sy);
      setShake(prev => Math.max(0, prev - 1));
    }

    // Background Stars
    stars.current.forEach(s => {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (gameState === GameState.START || gameState === GameState.GAMEOVER) {
      ctx.restore();
      return;
    }

    // Draw Entities
    bullets.current.forEach(b => b.draw(ctx));
    enemyBullets.current.forEach(eb => eb.draw(ctx));
    bombs.current.forEach(b => b.draw(ctx));
    enemies.current.forEach(e => e.draw(ctx, imageAssets.current));
    particles.current.forEach(part => part.draw(ctx));
    powerUps.current.forEach(pw => pw.draw(ctx));

    // Draw Player
    const p = playerRef.current;
    let playerColor = formation === Formation.CYAN ? '#00f2ff' : '#ff7700';
    if (formation === Formation.WHITE) playerColor = '#ffffff';
    
    // Recon Radar
    if (playerType === PlayerType.RECON) {
      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      ctx.beginPath();
      ctx.arc(0, 0, 200, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      
      // Draw blips for off-screen enemies
      enemies.current.forEach(e => {
        const dx = (e.x + e.width / 2) - (p.x + p.width / 2);
        const dy = (e.y + e.height / 2) - (p.y + p.height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist > 200) {
          const angle = Math.atan2(dy, dx);
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * 190, Math.sin(angle) * 190, 4, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.fill();
        }
      });
      ctx.restore();
    }
    
    if (p.invincible % 10 < 5) {
      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      
      let playerLevelAsset: 1 | 2 | 3 = 1;
      if (playerType === PlayerType.FAST) playerLevelAsset = 2;
      if (playerType === PlayerType.HEAVY) playerLevelAsset = 3;
      
      const playerSrc = GAME_CONFIG.ASSETS[formation][playerLevelAsset];
      const playerImg = imageAssets.current[playerSrc];

      if (playerImg && playerImg.complete && playerImg.naturalWidth !== 0) {
        ctx.drawImage(playerImg, -p.width / 2, -p.height / 2, p.width, p.height);
      } else {
        // Fallback to shapes
        ctx.beginPath();
        if (playerType === PlayerType.HEAVY) {
          ctx.moveTo(0, -p.height/2);
          ctx.lineTo(-p.width/2, -p.height/4);
          ctx.lineTo(-p.width/2, p.height/2);
          ctx.lineTo(p.width/2, p.height/2);
          ctx.lineTo(p.width/2, -p.height/4);
        } else if (playerType === PlayerType.FAST) {
          ctx.moveTo(0, -p.height/2);
          ctx.lineTo(-p.width/3, p.height/2);
          ctx.lineTo(0, p.height/4);
          ctx.lineTo(p.width/3, p.height/2);
        } else {
          ctx.moveTo(0, -p.height/2);
          ctx.lineTo(-p.width/2, p.height/2);
          ctx.lineTo(0, p.height/3);
          ctx.lineTo(p.width/2, p.height/2);
        }
        ctx.closePath();
        ctx.fillStyle = playerColor;
        ctx.fill();
      }
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = playerColor;
      
      // Cockpit (keep as glow effect)
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();

      // Shield effect
      if (p.shield) {
        ctx.beginPath();
        ctx.arc(0, 0, p.width * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fill();
      }

      // Power-up collection aura
      if (collectFlash > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, p.width * (1 + (15 - collectFlash) / 5), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${collectFlash / 15})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(0, 0, p.width * (0.8 + (15 - collectFlash) / 10), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 0, ${collectFlash / 30})`;
        ctx.fill();
      }

      ctx.restore();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // Red Flash Effect
    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 0, 0, ${flash / 30})`;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      // Glitch white flash
      if (flash > 15) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(flash - 15) / 15})`;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      }
      
      setFlash(prev => Math.max(0, prev - 1));
    }

    // Collect Flash Effect
    if (collectFlash > 0) {
      const gradient = ctx.createRadialGradient(
        p.x + p.width / 2, p.y + p.height / 2, 0,
        p.x + p.width / 2, p.y + p.height / 2, collectFlash * 20
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${collectFlash / 15})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      setCollectFlash(prev => Math.max(0, prev - 1));
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update();
    draw(ctx);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Touch Controls
  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const touch = e.touches[0];
    playerRef.current.x = touch.clientX - playerRef.current.width / 2;
    playerRef.current.y = touch.clientY - playerRef.current.height / 2;
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full touch-none"
      onTouchMove={handleTouchMove}
      onTouchStart={() => { isMouseDown.current = true; }}
      onTouchEnd={() => { isMouseDown.current = false; }}
    />
  );
};
