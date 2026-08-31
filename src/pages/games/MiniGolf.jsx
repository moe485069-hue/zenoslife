import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Trophy, Users, Bot, Zap, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function MiniGolf() {
  const navigate = useNavigate();
  const { coins, addCoins, addXp } = useAppStore();
  const canvasRef = useRef(null);

  const [mode, setMode] = useState('bot'); // 'bot' or 'pvp'
  const [currentHole, setCurrentHole] = useState(1);
  const [strokes, setStrokes] = useState({ p1: 0, p2: 0 });
  const [currentTurn, setCurrentTurn] = useState('p1');
  const [winner, setWinner] = useState(null);

  const W = 360;
  const H = 500;

  const stateRef = useRef({
    ball: { x: W / 2, y: 440, vx: 0, vy: 0, r: 7 },
    hole: { x: W / 2, y: 80, r: 12 },
    obstacles: [
      { x: 80, y: 220, w: 200, h: 25 },
      { x: 40, y: 320, w: 100, h: 20 },
      { x: 220, y: 320, w: 100, h: 20 }
    ],
    isMoving: false,
    dragStart: null,
    dragEnd: null
  });

  const resetBall = () => {
    stateRef.current.ball = { x: W / 2, y: 440, vx: 0, vy: 0, r: 7 };
    stateRef.current.isMoving = false;
  };

  const resetGame = () => {
    setCurrentHole(1);
    setStrokes({ p1: 0, p2: 0 });
    setCurrentTurn('p1');
    setWinner(null);
    resetBall();
  };

  // Bot AI Shot
  const executeBotShot = () => {
    const s = stateRef.current;
    const dx = s.hole.x - s.ball.x;
    const dy = s.hole.y - s.ball.y;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3;
    const power = 8 + Math.random() * 4;

    s.ball.vx = Math.cos(angle) * power;
    s.ball.vy = Math.sin(angle) * power;
    s.isMoving = true;
    soundEngine.playCardFlip?.();
  };

  // Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const loop = () => {
      const s = stateRef.current;
      const friction = 0.978;
      let moving = false;

      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;
      s.ball.vx *= friction;
      s.ball.vy *= friction;

      if (Math.abs(s.ball.vx) > 0.05 || Math.abs(s.ball.vy) > 0.05) moving = true;

      // Wall bounds
      if (s.ball.x - s.ball.r < 15) { s.ball.x = 15 + s.ball.r; s.ball.vx *= -0.8; }
      if (s.ball.x + s.ball.r > W - 15) { s.ball.x = W - 15 - s.ball.r; s.ball.vx *= -0.8; }
      if (s.ball.y - s.ball.r < 15) { s.ball.y = 15 + s.ball.r; s.ball.vy *= -0.8; }
      if (s.ball.y + s.ball.r > H - 15) { s.ball.y = H - 15 - s.ball.r; s.ball.vy *= -0.8; }

      // Obstacle collisions
      s.obstacles.forEach(obs => {
        if (
          s.ball.x + s.ball.r > obs.x &&
          s.ball.x - s.ball.r < obs.x + obs.w &&
          s.ball.y + s.ball.r > obs.y &&
          s.ball.y - s.ball.r < obs.y + obs.h
        ) {
          s.ball.vy *= -0.8;
          s.ball.vx *= -0.8;
        }
      });

      // Hole detection
      const distToHole = Math.hypot(s.ball.x - s.hole.x, s.ball.y - s.hole.y);
      if (distToHole < s.hole.r && Math.hypot(s.ball.vx, s.ball.vy) < 4) {
        soundEngine.playWin?.();
        haptics.success?.();
        setWinner(currentTurn);
        addCoins(100);
        addXp(50);
        s.ball.vx = 0;
        s.ball.vy = 0;
      }

      // End of turn
      if (s.isMoving && !moving && winner === null) {
        s.isMoving = false;
        setCurrentTurn(prev => {
          const next = prev === 'p1' ? 'p2' : 'p1';
          if (next === 'p2' && mode === 'bot') {
            setTimeout(executeBotShot, 800);
          }
          return next;
        });
      }

      // ---------------- RENDER ----------------
      ctx.clearRect(0, 0, W, H);

      // Grass course
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, W, H);

      // Course border
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, W - 20, H - 20);

      // Hole
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(s.hole.x, s.hole.y, s.hole.r, 0, Math.PI * 2);
      ctx.fill();

      // Flag
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(s.hole.x, s.hole.y);
      ctx.lineTo(s.hole.x + 18, s.hole.y - 12);
      ctx.lineTo(s.hole.x, s.hole.y - 24);
      ctx.fill();

      // Obstacles
      s.obstacles.forEach(obs => {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      });

      // Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, s.ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Aiming trajectory line
      if (s.dragStart && s.dragEnd) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(s.dragStart.x, s.dragStart.y);
        const aimDx = s.dragStart.x - s.dragEnd.x;
        const aimDy = s.dragStart.y - s.dragEnd.y;
        ctx.lineTo(s.dragStart.x + aimDx * 2, s.dragStart.y + aimDy * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [mode, winner]);

  // Pointer Handlers
  const handlePointerDown = (e) => {
    if (winner !== null || stateRef.current.isMoving) return;
    if (currentTurn === 'p2' && mode === 'bot') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;

    const ball = stateRef.current.ball;
    if (Math.hypot(ball.x - x, ball.y - y) < 40) {
      stateRef.current.dragStart = { x: ball.x, y: ball.y };
      stateRef.current.dragEnd = { x, y };
    }
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.dragStart) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;

    stateRef.current.dragEnd = { x, y };
  };

  const handlePointerUp = () => {
    const s = stateRef.current;
    if (s.dragStart && s.dragEnd) {
      const dx = s.dragStart.x - s.dragEnd.x;
      const dy = s.dragStart.y - s.dragEnd.y;
      const power = Math.min(Math.hypot(dx, dy) * 0.12, 12);

      if (power > 1) {
        const angle = Math.atan2(dy, dx);
        s.ball.vx = Math.cos(angle) * power;
        s.ball.vy = Math.sin(angle) * power;
        s.isMoving = true;
        setStrokes(prev => ({ ...prev, [currentTurn]: prev[currentTurn] + 1 }));
        soundEngine.playCardPlace?.();
        haptics.impact?.('medium');
      }
    }
    s.dragStart = null;
    s.dragEnd = null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a0c] via-[#051006] to-[#020502] text-white p-4 flex flex-col items-center justify-between font-sans select-none">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-2">
        <button
          onClick={() => navigate('/games')}
          className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">⛳</span>
          <h1 className="text-lg font-black text-amber-300">مینی گلف رویال</h1>
        </div>

        <button
          onClick={resetGame}
          className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Mode & Score */}
      <div className="w-full max-w-md flex items-center justify-between bg-black/40 border border-emerald-500/30 rounded-2xl p-2.5 mb-2 shadow-lg">
        <div className="flex gap-1">
          <button
            onClick={() => { setMode('bot'); resetGame(); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${mode === 'bot' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
          >
            🤖 ربات
          </button>
          <button
            onClick={() => { setMode('pvp'); resetGame(); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${mode === 'pvp' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
          >
            👥 دونفره
          </button>
        </div>

        <div className="text-xs font-bold text-slate-300">
          تعداد ضربات: <span className="text-amber-400 font-black">{strokes.p1}</span>
        </div>

        <div className="text-xs font-bold text-amber-300">
          نوبت: {currentTurn === 'p1' ? '👤 شما' : '🤖 ربات'}
        </div>
      </div>

      {/* Golf Canvas */}
      <div className="relative w-full max-w-sm aspect-[360/500] rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-950/80 touch-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <div className="text-center text-xs text-slate-400 my-2">
        💡 انگشت خود را روی توپ بگذارید، خلاف جهت هدف بکشید و رها کنید!
      </div>

      {/* Win Modal */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a0b2e] to-[#0a0312] border-2 border-amber-400 p-6 text-center shadow-2xl">
            <Trophy className="text-amber-400 mx-auto mb-3" size={48} />
            <h2 className="text-2xl font-black text-white mb-2">
              🎉 {winner === 'p1' ? 'شما توپ را وارد سوراخ کردید!' : 'حریف توپ را وارد سوراخ کرد!'}
            </h2>
            <p className="text-sm text-slate-300 mb-6">
              {winner === 'p1' ? '+۱۰۰ سکه جایزه قهرمانی به کیف پول شما اضافه شد! 🪙' : 'بازی تمام شد. دوباره تلاش کنید!'}
            </p>
            <button
              onClick={resetGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-base shadow-lg"
            >
              🔄 بازی مجدد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
