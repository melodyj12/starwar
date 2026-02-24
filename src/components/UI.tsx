import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Shield, Zap, Trophy, Info, Keyboard, MousePointer2, Rocket, ChevronRight } from 'lucide-react';
import { GameState, Achievement, Formation, PlayerType } from '../types';

interface UIProps {
  gameState: GameState;
  formation: Formation;
  playerType: PlayerType;
  score: number;
  level: number;
  health: number;
  achievements: Achievement[];
  onStart: () => void;
  onFormationSelect: (f: Formation) => void;
  onPlayerTypeSelect: (t: PlayerType) => void;
  onResume: () => void;
  onRestart: () => void;
  lastAchievement?: string;
}

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 ${className}`}>
    {children}
  </div>
);

export const StartScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.1 }}
    className="flex flex-col items-center justify-center text-white z-10"
  >
    <GlassCard className="max-w-md text-center">
      <h1 className="text-5xl font-black mb-2 tracking-tighter bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
        ETHAN 星际先锋
      </h1>
      <p className="text-cyan-200/60 mb-8 uppercase tracking-widest text-sm font-bold">Interstellar Pioneer</p>
      
      <div className="space-y-4 mb-8 text-left">
        <div className="flex items-center gap-3 text-sm">
          <MousePointer2 className="w-5 h-5 text-cyan-400" />
          <span>鼠标移动控制战机跟随</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
          <span>鼠标左键点击/长按进行射击</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="w-5 h-5 text-green-400" />
          <span>能量护盾：抵御一次撞击</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>三向子弹：火力全开</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Rocket className="w-5 h-5 text-red-500" />
          <span>激光光束 (L)：贯穿一切</span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button 
          onClick={onNext}
          className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Play className="fill-current" />
          进入星系
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-4 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 font-black rounded-xl transition-all flex items-center gap-2"
        >
          <Play className="rotate-180" /> 关闭机器
        </button>
      </div>
    </GlassCard>
  </motion.div>
);

export const FormationSelect: React.FC<{ onSelect: (f: Formation) => void }> = ({ onSelect }) => (
  <motion.div 
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    className="flex flex-col items-center justify-center text-white z-10"
  >
    <GlassCard className="max-w-2xl text-center">
      <h2 className="text-3xl font-black mb-8 tracking-tight">选择你的阵营</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cyan Formation */}
        <div 
          onClick={() => onSelect(Formation.CYAN)}
          className="group cursor-pointer p-6 rounded-2xl border-2 border-cyan-500/20 hover:border-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all transform hover:-translate-y-2"
        >
          <div className="w-16 h-16 bg-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Rocket className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-xl font-black text-cyan-400 mb-2">青色舰队</h3>
          <p className="text-xs text-white/60 mb-4">高科技、高机动性的未来派战机。</p>
        </div>

        {/* Orange Formation */}
        <div 
          onClick={() => onSelect(Formation.ORANGE)}
          className="group cursor-pointer p-6 rounded-2xl border-2 border-orange-500/20 hover:border-orange-500 bg-orange-500/5 hover:bg-orange-500/10 transition-all transform hover:-translate-y-2"
        >
          <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.5)]">
            <Rocket className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-xl font-black text-orange-400 mb-2">橙色先锋</h3>
          <p className="text-xs text-white/60 mb-4">坚固、重装甲的传统派战机。</p>
        </div>

        {/* White Formation */}
        <div 
          onClick={() => onSelect(Formation.WHITE)}
          className="group cursor-pointer p-6 rounded-2xl border-2 border-white/20 hover:border-white bg-white/5 hover:bg-white/10 transition-all transform hover:-translate-y-2"
        >
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            <Rocket className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">白色幽灵</h3>
          <p className="text-xs text-white/60 mb-4">神秘、隐形的侦察舰队，擅长情报收集。</p>
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

export const PlayerTypeSelect: React.FC<{ formation: Formation; level: number; onSelect: (t: PlayerType) => void }> = ({ formation, level, onSelect }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.1 }}
    className="flex flex-col items-center justify-center text-white z-10"
  >
    <GlassCard className="max-w-3xl text-center">
      <h2 className="text-3xl font-black mb-2 tracking-tight">准备进入第 {level} 关</h2>
      <p className="text-white/40 mb-8 uppercase tracking-widest text-xs">选择本次任务使用的战机型号</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic */}
        <div 
          onClick={() => onSelect(PlayerType.BASIC)}
          className="group cursor-pointer p-6 rounded-2xl border-2 border-white/10 hover:border-cyan-400 bg-white/5 hover:bg-white/10 transition-all transform hover:-translate-y-2"
        >
          <div className="text-cyan-400 font-black mb-1">基础型</div>
          <div className="text-[10px] text-white/40 mb-4 uppercase tracking-tighter">Balanced Fighter</div>
          <div className="aspect-square bg-white/5 rounded-xl mb-4 flex items-center justify-center">
            <Rocket className="w-10 h-10 text-white/20 group-hover:text-cyan-400 transition-colors" />
          </div>
          <ul className="text-[10px] text-left space-y-1 text-white/60">
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 标准航速</li>
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 标准护甲 (3 核心)</li>
          </ul>
        </div>

        {/* Fast */}
        <div 
          onClick={() => onSelect(PlayerType.FAST)}
          className="group cursor-pointer p-6 rounded-2xl border-2 border-white/10 hover:border-purple-400 bg-white/5 hover:bg-white/10 transition-all transform hover:-translate-y-2"
        >
          <div className="text-purple-400 font-black mb-1">快速型</div>
          <div className="text-[10px] text-white/40 mb-4 uppercase tracking-tighter">High Mobility</div>
          <div className="aspect-square bg-white/5 rounded-xl mb-4 flex items-center justify-center">
            <Zap className="w-10 h-10 text-white/20 group-hover:text-purple-400 transition-colors" />
          </div>
          <ul className="text-[10px] text-left space-y-1 text-white/60">
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 极速机动</li>
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 较弱护甲 (2 核心)</li>
          </ul>
        </div>

        {/* Heavy */}
        <div 
          onClick={() => onSelect(PlayerType.HEAVY)}
          className="group cursor-pointer p-6 rounded-2xl border-2 border-white/10 hover:border-orange-400 bg-white/5 hover:bg-white/10 transition-all transform hover:-translate-y-2"
        >
          <div className="text-orange-400 font-black mb-1">重型</div>
          <div className="text-[10px] text-white/40 mb-4 uppercase tracking-tighter">Heavy Armor</div>
          <div className="aspect-square bg-white/5 rounded-xl mb-4 flex items-center justify-center">
            <Shield className="w-10 h-10 text-white/20 group-hover:text-orange-400 transition-colors" />
          </div>
          <ul className="text-[10px] text-left space-y-1 text-white/60">
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 坚固装甲 (5 核心)</li>
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 较低航速</li>
          </ul>
        </div>

        {/* Recon */}
        <div 
          onClick={() => onSelect(PlayerType.RECON)}
          className="group cursor-pointer p-6 rounded-2xl border-2 border-white/10 hover:border-white bg-white/5 hover:bg-white/10 transition-all transform hover:-translate-y-2"
        >
          <div className="text-white font-black mb-1">侦察型</div>
          <div className="text-[10px] text-white/40 mb-4 uppercase tracking-tighter">Reconnaissance</div>
          <div className="aspect-square bg-white/5 rounded-xl mb-4 flex items-center justify-center">
            <Info className="w-10 h-10 text-white/20 group-hover:text-white transition-colors" />
          </div>
          <ul className="text-[10px] text-left space-y-1 text-white/60">
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 远程雷达扫描</li>
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 脆弱护甲 (1 核心)</li>
          </ul>
        </div>

        {/* Bomber */}
        <div 
          onClick={() => onSelect(PlayerType.BOMBER)}
          className="group cursor-pointer p-6 rounded-2xl border-2 border-white/10 hover:border-red-400 bg-white/5 hover:bg-white/10 transition-all transform hover:-translate-y-2"
        >
          <div className="text-red-400 font-black mb-1">轰炸型</div>
          <div className="text-[10px] text-white/40 mb-4 uppercase tracking-tighter">Heavy Bomber</div>
          <div className="aspect-square bg-white/5 rounded-xl mb-4 flex items-center justify-center">
            <Rocket className="w-10 h-10 text-white/20 group-hover:text-red-400 transition-colors rotate-180" />
          </div>
          <ul className="text-[10px] text-left space-y-1 text-white/60">
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 10% 概率投放炸弹</li>
            <li className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> 强化护甲 (4 核心)</li>
          </ul>
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

export const HUD: React.FC<{ score: number; level: number; health: number; playerType: PlayerType }> = ({ score, level, health, playerType }) => {
  const maxHealth = playerType === PlayerType.HEAVY ? 5 : (playerType === PlayerType.BOMBER ? 4 : (playerType === PlayerType.FAST ? 2 : (playerType === PlayerType.RECON ? 1 : 3)));
  
  return (
    <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-20">
      <div className="flex flex-col gap-2">
        <div className="backdrop-blur-md bg-black/40 border border-white/10 px-4 py-2 rounded-lg">
          <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Score</p>
          <p className="text-2xl font-mono text-white leading-none">{score.toLocaleString()}</p>
        </div>
        <div className="backdrop-blur-md bg-black/40 border border-white/10 px-4 py-2 rounded-lg">
          <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Level</p>
          <p className="text-2xl font-mono text-white leading-none">{level}</p>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-xs text-red-500 font-bold uppercase tracking-wider mr-2">Blood Volume</span>
        {[...Array(maxHealth)].map((_, i) => (
          <div 
            key={i}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-500 ${
              i < health ? 'bg-red-500 border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-transparent border-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const GameOverScreen: React.FC<{ score: number; level: number; achievements: Achievement[]; onRestart: () => void }> = ({ score, level, achievements, onRestart }) => {
  const getGrade = (s: number) => {
    if (s >= 5000) return { label: 'S', color: 'text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]' };
    if (s >= 3000) return { label: 'A', color: 'text-orange-400' };
    if (s >= 2000) return { label: 'B', color: 'text-purple-400' };
    if (s >= 1000) return { label: 'C', color: 'text-blue-400' };
    if (s >= 500) return { label: 'D', color: 'text-cyan-400' };
    return { label: 'E', color: 'text-gray-400' };
  };

  const grade = getGrade(score);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-white z-10"
    >
      <GlassCard className="max-w-lg text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-4xl font-black mb-2 text-red-500">任务结束</h2>
        
        <div className="mb-6">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">综合评价</p>
          <p className={`text-8xl font-black italic tracking-tighter ${grade.color}`}>
            {grade.label}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <p className="text-xs text-cyan-400 uppercase font-bold">最终得分</p>
            <p className="text-3xl font-mono">{score}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <p className="text-xs text-cyan-400 uppercase font-bold">到达关卡</p>
            <p className="text-3xl font-mono">{level}</p>
          </div>
        </div>

        <div className="mb-8 text-left">
          <h3 className="text-sm font-bold text-cyan-400 uppercase mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> 已解锁成就
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {achievements.filter(a => a.unlocked).map(a => (
              <div key={a.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
                <p className="font-bold text-sm text-yellow-400">{a.name}</p>
                <p className="text-xs text-white/60">{a.description}</p>
              </div>
            ))}
            {achievements.filter(a => a.unlocked).length === 0 && (
              <p className="text-xs text-white/40 italic">本次航行未解锁任何成就</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onRestart}
            className="flex-1 py-4 bg-white text-black font-black rounded-xl hover:bg-cyan-400 transition-colors shadow-lg"
          >
            再次挑战
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-colors shadow-lg flex items-center gap-2"
          >
            <Play className="rotate-180" /> 关闭机器
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export const Sidebar: React.FC = () => (
  <div className="hidden lg:flex fixed right-0 top-0 h-full w-64 p-6 flex-col gap-6 z-20 pointer-events-none">
    <GlassCard className="p-4 pointer-events-auto">
      <h3 className="text-cyan-400 font-bold text-sm uppercase mb-4 flex items-center gap-2">
        <Info className="w-4 h-4" /> 道具说明
      </h3>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold shrink-0">T</div>
          <div>
            <p className="text-xs font-bold">三向子弹</p>
            <p className="text-[10px] text-white/60">获得 30 发强力三向散射子弹</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold shrink-0">S</div>
          <div>
            <p className="text-xs font-bold">能量护盾</p>
            <p className="text-[10px] text-white/60">抵御一次来自敌机或子弹的撞击</p>
          </div>
        </div>
      </div>
    </GlassCard>

    <GlassCard className="p-4 pointer-events-auto">
      <h3 className="text-cyan-400 font-bold text-sm uppercase mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4" /> 敌机情报
      </h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rotate-45"></div>
          <p className="text-[10px]">基础型：常规速度，一击即毁</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-500 rotate-45"></div>
          <p className="text-[10px]">快速型：机动性极强，需快速反应</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rotate-45"></div>
          <p className="text-[10px]">重型：装甲厚实，需多次射击</p>
        </div>
      </div>
    </GlassCard>
  </div>
);

export const AchievementToast: React.FC<{ name: string }> = ({ name }) => (
  <motion.div
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 100, opacity: 0 }}
    className="fixed bottom-10 right-10 z-50 backdrop-blur-xl bg-yellow-400/20 border border-yellow-400/50 p-4 rounded-xl flex items-center gap-4"
  >
    <div className="bg-yellow-400 p-2 rounded-lg">
      <Trophy className="w-6 h-6 text-black" />
    </div>
    <div>
      <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">成就解锁</p>
      <p className="text-white font-black">{name}</p>
    </div>
  </motion.div>
);
