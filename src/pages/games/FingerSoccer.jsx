import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Trophy, Users, Bot, Zap, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function FingerSoccer() {
  const navigate = useNavigate();
  const { coins, addCoins, addXp } = useAppStore();
  const canvasRef = useRef(null);

  const [mode, setMode] = useState('bot'); // 'bot' or 'pvp'
  const [teamSize, setTeamSize] = useState(3); // 3 vs 3 (2p) or 5 vs 5 (4p)
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [currentTurn, setCurrentTurn] = useState('red'); // 'red' (player) or 'blue' (opponent)
  const [winner, setWinner] = useState(null);
  const [aimingCap, setAimingCap] = useState(null);

  // Canvas dimensions
  const W = 360;
  const H = 480;

  // Game state refs
  const stateRef = useRef({
    ball: { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 8 },
    redCaps: [
      { id: 'r1', x: 100, y: 380, vx: 0, vy: 0, r: 16 },
      { id: 'r2', x: 180, y: 340, vx: 0, vy: 0, r: 16 },
      { id: 'r3', x: 260, y: 380, vx: 0, vy: 0, r: 16 }
    ],
    blueCaps: [
      { id: 'b1', x: 100, y: 100, vx: 0, vy: 0, r: 16 },
      { id: 'b2', x: 180, y: 140, vx: 0, vy: 0, r: 16 },
      { id: 'b3', x: 260, y: 100, vx: 0, vy: 0, r: 16 }
    ],
    isMoving: false,
    dragStart: null,
    dragEnd: null
  });

  const resetPositions = () => {
    const s = stateRef.current;
    s.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 8 };
    s.redCaps = [
      { id: 'r1', x: 100, y: 380, vx: 0, vy: 0, r: 16 },
      { id: 'r2', x: 180, y: 340, vx: 0, vy: 0, r: 16 },
      { id: 'r3', x: 260, y: 380, vx: 0, vy: 0, r: 16 }
    ];
    s.blueCaps = [
      { id: 'b1', x: 100, y: 100, vx: 0, vy: 0, r: 16 },
      { id: 'b2', x: 180, y: 140, vx: 0, vy: 0, r: 16 },
      { id: 'b3', x: 260, y: 100, vx: 0, vy: 0, r: 16 }
    ];
    s.isMoving = false;
  };

  const resetMatch = () => {
    setScores({ red: 0, blue: 0 });
    setCurrentTurn('red');
    setWinner(null);
    resetPositions();
  };

  // Bot AI logic
  const executeBotTurn = () => {
    const s = stateRef.current;
    const availableCaps = s.blueCaps;
    const selectedCap = availableCaps[Math.floor(Math.random() * availableCaps.length)];

    // Aim towards ball then towards bottom goal
    const dx = s.ball.x - selectedCap.x;
    const dy = s.ball.y - selectedCap.y;
    const angle = Math.atan2(dy, dx);
    const power = 7 + Math.random() * 5;

    selectedCap.vx = Math.cos(angle) * power;
    selectedCap.vy = Math.sin(angle) * power;
    s.isMoving = true;
    soundEngine.playCardFlip?.();
  };

  // Main physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const loop = () => {
      const s = stateRef.current;
      const friction = 0.975;
      let moving = false;

      // Update ball physics
      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;
      s.ball.vx *= friction;
      s.ball.vy *= friction;
      if (Math.abs(s.ball.vx) > 0.08 || Math.abs(s.ball.vy) > 0.08) moving = true;

      // Ball wall bounces (with goal holes at top and bottom center)
      const goalWidth = 100;
      const goalLeft = (W - goalWidth) / 2;
      const goalRight = goalLeft + goalWidth;

      // Ball goal detection
      if (s.ball.y - s.ball.r <= 10 && s.ball.x >= goalLeft && s.ball.x <= goalRight) {
        // Red scored!
        soundEngine.playSuccess?.();
        haptics.success?.();
        setScores(prev => {
          const nextRed = prev.red + 1;
          if (nextRed >= 3) {
            setWinner('red');
            addCoins(100);
            addXp(40);
          }
          return { ...prev, red: nextRed };
        });
        resetPositions();
        setCurrentTurn('blue');
        return;
      }

      if (s.ball.y + s.ball.r >= H - 10 && s.ball.x >= goalLeft && s.ball.x <= goalRight) {
        // Blue scored!
        soundEngine.playError?.();
        haptics.warning?.();
        setScores(prev => {
          const nextBlue = prev.blue + 1;
          if (nextBlue >= 3) setWinner('blue');
          return { ...prev, blue: nextBlue };
        });
        resetPositions();
        setCurrentTurn('red');
        return;
      }

      // Normal wall collisions for ball
      if (s.ball.x - s.ball.r < 15) { s.ball.x = 15 + s.ball.r; s.ball.vx *= -1; }
      if (s.ball.x + s.ball.r > W - 15) { s.ball.x = W - 15 - s.ball.r; s.ball.vx *= -1; }
      if (s.ball.y - s.ball.r < 15) { s.ball.y = 15 + s.ball.r; s.ball.vy *= -1; }
      if (s.ball.y + s.ball.r > H - 15) { s.ball.y = H - 15 - s.ball.r; s.ball.vy *= -1; }

      // Update caps
      const allCaps = [...s.redCaps, ...s.blueCaps];
      allCaps.forEach(cap => {
        cap.x += cap.vx;
        cap.y += cap.vy;
        cap.vx *= friction;
        cap.vy *= friction;
        if (Math.abs(cap.vx) > 0.08 || Math.abs(cap.vy) > 0.08) moving = true;

        if (cap.x - cap.r < 15) { cap.x = 15 + cap.r; cap.vx *= -1; }
        if (cap.x + cap.r > W - 15) { cap.x = W - 15 - cap.r; cap.vx *= -1; }
        if (cap.y - cap.r < 15) { cap.y = 15 + cap.r; cap.vy *= -1; }
        if (cap.y + cap.r > H - 15) { cap.y = H - 15 - cap.r; cap.vy *= -1; }

        // Collision with ball
        const dx = s.ball.x - cap.x;
        const dy = s.ball.y - cap.y;
        const dist = Math.hypot(dx, dy);
        if (dist < s.ball.r + cap.r) {
          const angle = Math.atan2(dy, dx);
          const overlap = (s.ball.r + cap.r) - dist;
          s.ball.x += Math.cos(angle) * overlap;
          s.ball.y += Math.sin(angle) * overlap;

          const speed = Math.hypot(cap.vx, cap.vy) + 4;
          s.ball.vx = Math.cos(angle) * speed * 1.3;
          s.ball.vy = Math.sin(angle) * speed * 1.3;
          soundEngine.playCardPlace?.();
        }
      });

      // Switch turn after all movement stops
      if (s.isMoving && !moving) {
        s.isMoving = false;
        setCurrentTurn(prev => {
          const nextTurn = prev === 'red' ? 'blue' : 'red';
          if (nextTurn === 'blue' && mode === 'bot') {
            setTimeout(executeBotTurn, 800);
          }
          return nextTurn;
        });
      }

      // ----------------- RENDER -----------------
      ctx.clearRect(0, 0, W, H);

      // Green Pitch
      ctx.fillStyle = '#1b4d24';
      ctx.fillRect(0, 0, W, H);

      // Pitch lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(15, 15, W - 30, H - 30);

      // Center Line & Circle
      ctx.beginPath();
      ctx.moveTo(15, H / 2);
      ctx.lineTo(W - 15, H / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Goal Boxes
      ctx.strokeRect(goalLeft, 15, goalWidth, 40);
      ctx.strokeRect(goalLeft, H - 55, goalWidth, 40);

      // Draw Red Caps
      s.redCaps.forEach(cap => {
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(cap.x, cap.y, cap.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      // Draw Blue Caps
      s.blueCaps.forEach(cap => {
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(cap.x, cap.y, cap.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      // Draw Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, s.ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Aiming trajectory line
      if (s.dragStart && s.dragEnd) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
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
  }, [mode]);

  // Touch / Mouse controls
  const handlePointerDown = (e) => {
    if (winner !== null || stateRef.current.isMoving) return;
    if (currentTurn === 'blue' && mode === 'bot') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;

    const targetCaps = currentTurn === 'red' ? stateRef.current.redCaps : stateRef.current.blueCaps;
    const hitCap = targetCaps.find(cap => Math.hypot(cap.x - x, cap.y - y) <= cap.r * 1.5);

    if (hitCap) {
      stateRef.current.dragStart = { x: hitCap.x, y: hitCap.y, cap: hitCap };
      stateRef.current.dragEnd = { x, y };
      setAimingCap(hitCap);
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
      const power = Math.min(Math.hypot(dx, dy) * 0.15, 14);

      if (power > 1) {
        const angle = Math.atan2(dy, dx);
        s.dragStart.cap.vx = Math.cos(angle) * power;
        s.dragStart.cap.vy = Math.sin(angle) * power;
        s.isMoving = true;
        soundEngine.playCardPlace?.();
        haptics.impact?.('medium');
      }
    }
    s.dragStart = null;
    s.dragEnd = null;
    setAimingCap(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1f0d] via-[#051307] to-[#020a04] text-white p-4 flex flex-col items-center justify-between font-sans select-none">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-2">
        <button
          onClick={() => navigate('/games')}
          className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">⚽</span>
          <h1 className="text-lg font-black text-amber-300">فوتبال انگشتی رویال</h1>
        </div>

        <button
          onClick={resetMatch}
          className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Mode & Scoreboard */}
      <div className="w-full max-w-md flex items-center justify-between bg-black/40 border border-emerald-500/30 rounded-2xl p-2.5 mb-2 shadow-lg">
        <div className="flex gap-1">
          <button
            onClick={() => { setMode('bot'); resetMatch(); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${mode === 'bot' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
          >
            🤖 ربات
          </button>
          <button
            onClick={() => { setMode('pvp'); resetMatch(); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${mode === 'pvp' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
          >
            👥 دونفره
          </button>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-3">
          <div className="text-rose-400 font-black text-lg">{scores.red}</div>
          <div className="text-xs text-slate-400 font-bold">مقابل</div>
          <div className="text-sky-400 font-black text-lg">{scores.blue}</div>
        </div>

        <div className="text-xs font-bold text-amber-300">
          نوبت: {currentTurn === 'red' ? '🔴 قرمز' : '🔵 آبی'}
        </div>
      </div>

      {/* Soccer Pitch Canvas */}
      <div className="relative w-full max-w-sm aspect-[360/480] rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-900/60 touch-none">
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
        💡 روی مهره خود لمس کنید، جهت و قدرت را بکشید و رها کنید!
      </div>

      {/* Win Modal */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a0b2e] to-[#0a0312] border-2 border-amber-400 p-6 text-center shadow-2xl">
            <Trophy className="text-amber-400 mx-auto mb-3" size={48} />
            <h2 className="text-2xl font-black text-white mb-2">
              🎉 تیم {winner === 'red' ? 'قرمز' : 'آبی'} برنده مسابقه شد!
            </h2>
            <p className="text-sm text-slate-300 mb-6">
              {winner === 'red' ? '+۱۰۰ سکه جایزه قهرمانی به کیف پول شما اضافه شد! 🪙' : 'مسابقه تمام شد! برای جبران دوباره تلاش کنید!'}
            </p>
            <button
              onClick={resetMatch}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-base shadow-lg"
            >
              🔄 مسابقه جدید
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
