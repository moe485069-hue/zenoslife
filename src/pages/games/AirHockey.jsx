import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Trophy, Settings, Users, Bot, Zap, Volume2, Sparkles } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';

export default function AirHockey() {
  const { language, addXP, addCoins } = useAppStore();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramMode = searchParams.get('mode') || 'bot';
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [gameMode, setGameMode] = useState(paramMode);
  const [botDifficulty, setBotDifficulty] = useState('medium');

  const canvasRef = useRef(null);
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [winner, setWinner] = useState(null);
  const [goalBanner, setGoalBanner] = useState(null);

  const W = 360;
  const H = 560;
  const GOAL_WIDTH = 130;
  const WINNING_SCORE = 5;

  const stateRef = useRef({
    puck: { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 12 },
    p1: { x: W / 2, y: H - 80, r: 24 }, // Player (Bottom)
    p2: { x: W / 2, y: 80, r: 24 },     // Bot / P2 (Top)
    isDraggingP1: false,
    isDraggingP2: false
  });

  const resetPuck = (towardP1 = false) => {
    stateRef.current.puck = {
      x: W / 2,
      y: H / 2,
      vx: (Math.random() - 0.5) * 2,
      vy: towardP1 ? 3 : -3,
      r: 12
    };
  };

  const resetGame = () => {
    setScore({ p1: 0, p2: 0 });
    setWinner(null);
    setGoalBanner(null);
    stateRef.current.p1 = { x: W / 2, y: H - 80, r: 24 };
    stateRef.current.p2 = { x: W / 2, y: 80, r: 24 };
    resetPuck();
    soundEngine.playCheckmark?.();
  };

  // Main Physics and Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const update = () => {
      if (winner) return;

      const s = stateRef.current;
      const puck = s.puck;
      const p1 = s.p1;
      const p2 = s.p2;

      // 1. Bot AI Movement (Top Half)
      if (gameMode === 'bot') {
        const botSpeed = botDifficulty === 'master' ? 5.5 : botDifficulty === 'medium' ? 3.8 : 2.5;
        let targetX = puck.x;
        let targetY = 80;

        // If puck is in bot's half, attack it
        if (puck.y < H / 2) {
          targetY = Math.max(50, Math.min(H / 2 - 40, puck.y - 15));
        }

        const dx = targetX - p2.x;
        const dy = targetY - p2.y;
        p2.x += Math.sign(dx) * Math.min(Math.abs(dx), botSpeed);
        p2.y += Math.sign(dy) * Math.min(Math.abs(dy), botSpeed);

        // Constrain Bot to top half
        p2.x = Math.max(p2.r + 10, Math.min(W - p2.r - 10, p2.x));
        p2.y = Math.max(p2.r + 10, Math.min(H / 2 - p2.r - 10, p2.y));
      }

      // 2. Update Puck Physics
      const friction = 0.988;
      puck.x += puck.vx;
      puck.y += puck.vy;
      puck.vx *= friction;
      puck.vy *= friction;

      // 3. Wall Collisions (Left / Right)
      if (puck.x - puck.r < 12) {
        puck.x = 12 + puck.r;
        puck.vx = -puck.vx * 0.95;
        soundEngine.playTap?.();
      } else if (puck.x + puck.r > W - 12) {
        puck.x = W - 12 - puck.r;
        puck.vx = -puck.vx * 0.95;
        soundEngine.playTap?.();
      }

      // 4. Goal Detection (Top Goal: P1 Scores, Bottom Goal: P2 Scores)
      const goalLeft = (W - GOAL_WIDTH) / 2;
      const goalRight = (W + GOAL_WIDTH) / 2;

      // Top Goal
      if (puck.y - puck.r <= 12) {
        if (puck.x >= goalLeft && puck.x <= goalRight) {
          // P1 Scored!
          soundEngine.playLevelUp?.();
          haptics.success?.();
          setGoalBanner(isRtl ? '⚽ گل برای بازیکن ۱!' : '⚽ Goal for Player 1!');
          setScore(sc => {
            const next = { ...sc, p1: sc.p1 + 1 };
            if (next.p1 >= WINNING_SCORE) {
              setWinner('p1');
              addXP?.(40, 'پیروزی در ایر هاکی');
              addCoins?.(20);
            }
            return next;
          });
          resetPuck(false);
          setTimeout(() => setGoalBanner(null), 1500);
        } else {
          puck.y = 12 + puck.r;
          puck.vy = -puck.vy * 0.95;
          soundEngine.playTap?.();
        }
      }

      // Bottom Goal
      if (puck.y + puck.r >= H - 12) {
        if (puck.x >= goalLeft && puck.x <= goalRight) {
          // P2 / Bot Scored!
          soundEngine.playTap?.();
          haptics.impact?.('medium');
          setGoalBanner(isRtl ? '⚽ گل برای بازیکن ۲!' : '⚽ Goal for Player 2!');
          setScore(sc => {
            const next = { ...sc, p2: sc.p2 + 1 };
            if (next.p2 >= WINNING_SCORE) {
              setWinner('p2');
            }
            return next;
          });
          resetPuck(true);
          setTimeout(() => setGoalBanner(null), 1500);
        } else {
          puck.y = H - 12 - puck.r;
          puck.vy = -puck.vy * 0.95;
          soundEngine.playTap?.();
        }
      }

      // 5. Paddle Collisions with Puck
      const handlePaddleCollision = (paddle) => {
        const dist = Math.hypot(puck.x - paddle.x, puck.y - paddle.y);
        if (dist < puck.r + paddle.r) {
          const angle = Math.atan2(puck.y - paddle.y, puck.x - paddle.x);
          const overlap = (puck.r + paddle.r) - dist;
          puck.x += Math.cos(angle) * overlap;
          puck.y += Math.sin(angle) * overlap;

          const speed = Math.max(7, Math.hypot(puck.vx, puck.vy) * 1.1 + 1);
          puck.vx = Math.cos(angle) * Math.min(speed, 16);
          puck.vy = Math.sin(angle) * Math.min(speed, 16);

          soundEngine.playDiceRoll?.();
          haptics.tap?.();
        }
      };

      handlePaddleCollision(p1);
      handlePaddleCollision(p2);
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      const s = stateRef.current;

      // Table Border Glow
      ctx.fillStyle = '#080c1d';
      ctx.fillRect(0, 0, W, H);

      // Neon table markings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, W - 24, H - 24);

      // Center Line
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.beginPath();
      ctx.moveTo(12, H / 2);
      ctx.lineTo(W - 12, H / 2);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Goal Pockets
      const goalLeft = (W - GOAL_WIDTH) / 2;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.fillRect(goalLeft, 0, GOAL_WIDTH, 12); // Top
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.fillRect(goalLeft, H - 12, GOAL_WIDTH, 12); // Bottom

      // P1 Paddle (Green Glow)
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(s.p1.x, s.p1.y, s.p1.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.arc(s.p1.x, s.p1.y, s.p1.r - 8, 0, Math.PI * 2);
      ctx.fill();

      // P2 Paddle (Rose / Red Glow)
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(s.p2.x, s.p2.y, s.p2.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(s.p2.x, s.p2.y, s.p2.r - 8, 0, Math.PI * 2);
      ctx.fill();

      // Puck (Bright Yellow Glowing Disc)
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(s.puck.x, s.puck.y, s.puck.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(s.puck.x, s.puck.y, s.puck.r - 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    };

    const loop = () => {
      update();
      render();
      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [gameMode, botDifficulty, winner]);

  // Touch & Mouse Event Handlers
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (W / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (H / rect.height);

    const s = stateRef.current;
    if (Math.hypot(x - s.p1.x, y - s.p1.y) < s.p1.r + 20) {
      s.isDraggingP1 = true;
    } else if (gameMode === 'local' && Math.hypot(x - s.p2.x, y - s.p2.y) < s.p2.r + 20) {
      s.isDraggingP2 = true;
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (W / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (H / rect.height);

    const s = stateRef.current;
    if (s.isDraggingP1) {
      s.p1.x = Math.max(s.p1.r + 10, Math.min(W - s.p1.r - 10, x));
      s.p1.y = Math.max(H / 2 + s.p1.r + 5, Math.min(H - s.p1.r - 10, y));
    }
    if (s.isDraggingP2 && gameMode === 'local') {
      s.p2.x = Math.max(s.p2.r + 10, Math.min(W - s.p2.r - 10, x));
      s.p2.y = Math.max(s.p2.r + 10, Math.min(H / 2 - s.p2.r - 5, y));
    }
  };

  const handlePointerUp = () => {
    stateRef.current.isDraggingP1 = false;
    stateRef.current.isDraggingP2 = false;
  };

  const handleStartFromSetup = (config) => {
    setGameMode(config.mode);
    setBotDifficulty(config.botDifficulty || 'medium');
    resetGame();
    setIsSetupModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen pb-28 relative overflow-hidden bg-[#050711] text-white select-none" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-25 z-0">
        <div className="absolute top-10 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan-600 blur-[130px]" />
        <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] rounded-full bg-rose-600 blur-[130px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate('/games')}
          className="p-2 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white transition-colors active:scale-95 shadow-md"
        >
          <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black hover:bg-cyan-500/30 flex items-center gap-1 shadow-md active:scale-95"
          >
            <Settings size={13} />
            <span>{isRtl ? 'تنظیمات بازی' : 'Setup'}</span>
          </button>
        </div>
      </div>

      {/* Main Game Container */}
      <div className="relative z-10 px-4 pt-2 max-w-md mx-auto flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-pink-300 flex items-center gap-2">
          <span>🏒</span>
          <span>{isRtl ? 'ایر هاکی نئونی' : 'Neon Air Hockey'}</span>
        </h1>
        <span className="text-[11px] text-slate-400 font-bold">
          {gameMode === 'bot' 
            ? (isRtl ? `🤖 بازی با ربات (${botDifficulty === 'master' ? 'استاد' : botDifficulty === 'easy' ? 'مبتدی' : 'متوسط'})` : `🤖 Vs AI Bot (${botDifficulty})`) 
            : (isRtl ? '📱 دونفره بالا و پایین گوشی' : '📱 2-Player Split Screen')}
        </span>

        {/* Score Board */}
        <div className="flex items-center gap-6 my-2.5 p-2.5 px-6 bg-slate-900/90 rounded-3xl border border-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/60" />
            <span className="text-xs font-bold text-slate-300">
              {gameMode === 'bot' ? (isRtl ? 'شما (پایین)' : 'You (Bottom)') : (isRtl ? 'بازیکن ۱' : 'P1')}:
            </span>
            <span className="text-sm font-black text-emerald-300 font-mono">{score.p1}</span>
          </div>
          <div className="h-5 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/60" />
            <span className="text-xs font-bold text-slate-300">
              {gameMode === 'bot' ? (isRtl ? 'ربات (بالا)' : 'Bot (Top)') : (isRtl ? 'بازیکن ۲' : 'P2')}:
            </span>
            <span className="text-sm font-black text-rose-300 font-mono">{score.p2}</span>
          </div>
        </div>

        {/* Goal Alert Toast */}
        <AnimatePresence>
          {goalBanner && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute top-28 z-30 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-black text-xs shadow-2xl shadow-amber-500/50 animate-bounce"
            >
              {goalBanner}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Canvas Air Hockey Table */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-400/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] touch-none">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="w-[320px] h-[480px] sm:w-[340px] sm:h-[510px] cursor-grab active:cursor-grabbing block"
          />

          {/* Winner Overlay */}
          {winner && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
              <span className="text-5xl animate-bounce">🏆</span>
              <div>
                <h3 className="text-lg font-black text-amber-300">
                  {winner === 'p1' 
                    ? (isRtl ? '🎉 تبریک! شما برنده شدید!' : '🎉 Player 1 Won the Match!') 
                    : (isRtl ? 'حریف برنده شد! تلاش مجدد؟' : 'Opponent Won the Match!')}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {score.p1} - {score.p2}
                </p>
              </div>
              <button
                onClick={resetGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-pink-500 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={15} />
                <span>{isRtl ? 'بازی دوباره' : 'Play Again'}</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Pre-Game Setup Modal */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        game={{
          id: 'air_hockey',
          titleFa: 'ایر هاکی نئونی',
          titleEn: 'Neon Air Hockey',
          icon: '🏒',
          path: '/games/air-hockey'
        }}
        onStartGame={handleStartFromSetup}
      />

    </div>
  );
}
