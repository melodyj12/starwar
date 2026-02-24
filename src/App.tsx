import { useState, useEffect, useCallback } from 'react';
import { GameState, Achievement, Formation, PlayerType } from './types';
import { INITIAL_ACHIEVEMENTS } from './constants';
import { GameCanvas } from './components/GameCanvas';
import { StartScreen, FormationSelect, PlayerTypeSelect, HUD, GameOverScreen, Sidebar, AchievementToast } from './components/UI';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [formation, setFormation] = useState<Formation>(Formation.CYAN);
  const [playerType, setPlayerType] = useState<PlayerType>(PlayerType.BASIC);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(3);
  const [bloodSugar, setBloodSugar] = useState(100);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [lastUnlocked, setLastUnlocked] = useState<string | null>(null);

  const handleNext = () => setGameState(GameState.FORMATION_SELECT);
  
  const handleFormationSelect = (f: Formation) => {
    setFormation(f);
    setGameState(GameState.LEVEL_UP_SELECT);
  };

  const handlePlayerTypeSelect = (t: PlayerType) => {
    setPlayerType(t);
    if (t === PlayerType.HEAVY) setHealth(5);
    else if (t === PlayerType.FAST) setHealth(2);
    else if (t === PlayerType.RECON) setHealth(1);
    else if (t === PlayerType.BOMBER) setHealth(4);
    else setHealth(3);
    setGameState(GameState.PLAYING);
  };
  
  const handleGameOver = useCallback((finalScore: number, finalLevel: number) => {
    setGameState(GameState.GAMEOVER);
  }, []);

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setHealth(3);
    setGameState(GameState.FORMATION_SELECT);
  };

  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        setLastUnlocked(achievement.name);
        setTimeout(() => setLastUnlocked(null), 3000);
        return prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP') {
        setGameState(prev => {
          if (prev === GameState.PLAYING) return GameState.PAUSED;
          if (prev === GameState.PAUSED) return GameState.PLAYING;
          return prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a2e_0%,_#000000_100%)]" />
      
      {/* Game Layer */}
      <GameCanvas 
        gameState={gameState}
        formation={formation}
        playerType={playerType}
        onGameOver={handleGameOver}
        onScoreUpdate={setScore}
        onHealthUpdate={setHealth}
        onBloodSugarUpdate={setBloodSugar}
        onLevelUpdate={(newLevel) => {
          setLevel(newLevel);
          setGameState(GameState.LEVEL_UP_SELECT);
        }}
        onAchievementUnlock={unlockAchievement}
      />

      {/* UI Layer */}
      <AnimatePresence>
        {gameState === GameState.START && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <StartScreen onNext={handleNext} />
          </div>
        )}

        {gameState === GameState.FORMATION_SELECT && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <FormationSelect onSelect={handleFormationSelect} />
          </div>
        )}

        {gameState === GameState.LEVEL_UP_SELECT && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <PlayerTypeSelect formation={formation} level={level} onSelect={handlePlayerTypeSelect} />
          </div>
        )}

        {gameState === GameState.PLAYING && (
          <HUD score={score} level={level} health={health} playerType={playerType} bloodSugar={bloodSugar} />
        )}

        {gameState === GameState.PAUSED && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-30">
            <div className="text-center">
              <h2 className="text-6xl font-black text-white mb-8 italic tracking-tighter">PAUSED</h2>
              <button 
                onClick={() => setGameState(GameState.PLAYING)}
                className="px-12 py-4 bg-cyan-500 text-black font-black rounded-xl hover:bg-cyan-400 transition-all"
              >
                继续战斗
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.GAMEOVER && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-30">
            <GameOverScreen 
              score={score} 
              level={level} 
              achievements={achievements} 
              onRestart={handleRestart} 
            />
          </div>
        )}
      </AnimatePresence>

      <Sidebar />

      <AnimatePresence>
        {lastUnlocked && <AchievementToast name={lastUnlocked} />}
      </AnimatePresence>

      {/* Mobile Warning for Landscape */}
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-white p-6 text-center lg:hidden portrait:flex hidden">
        <div className="w-16 h-16 border-4 border-cyan-500 rounded-xl animate-bounce mb-4 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500 rotate-90"></div>
        </div>
        <h3 className="text-xl font-bold mb-2">请旋转设备</h3>
        <p className="text-sm text-white/60">横屏模式可获得最佳星际航行体验</p>
      </div>
    </div>
  );
}
