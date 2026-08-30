import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Trophy } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';

// ── Constants ──────────────────────────────────────────────
const W = 680, H = 360;
const BALL_R = 13;
const FRICTION = 0.988;
const MIN_VEL = 0.15;
const POCKET_R = 18;

const POCKETS = [
  { x: POCKET_R, y: POCKET_R },
  { x: W / 2, y: 4 },
  { x: W - POCKET_R, y: POCKET_R },
  { x: POCKET_R, y: H - POCKET_R },
  { x: W / 2, y: H - 4 },
  { x: W - POCKET_R, y: H - POCKET_R },
];

const BALL_COLORS = [
  '#ffffff', // 0: cue
  '#f5c518', // 1: yellow solid
  '#2563eb', // 2: blue solid
  '#dc2626', // 3: red solid
  '#7c3aed', // 4: purple solid
  '#ea580c', // 5: orange solid
  '#16a34a', // 6: green solid
  '#be123c', // 7: maroon solid
  '#1e1e1e', // 8: black (8-ball)
  '#f5c518', // 9: yellow stripe
  '#2563eb', // 10: blue stripe
  '#dc2626', // 11: red stripe
  '#7c3aed', // 12: purple stripe
  '#ea580c', // 13: orange stripe
  '#16a34a', // 14: green stripe
  '#be123c', // 15: maroon stripe
];

function createBalls() {
  const balls = [];
  // Cue ball
  balls.push({ id: 0, x: W * 0.25, y: H / 2, vx: 0, vy: 0, color: BALL_COLORS[0], number: 0, potted: false, isStripe: false });

  // Rack triangle starting at ~2/3 from left
  const startX = W * 0.65;
  const startY = H / 2;
  const rows = [
    [1],
    [9, 2],
    [3, 8, 10],
    [11, 4, 12, 5],
    [6, 13, 7, 14, 15],
  ];
  let ballIdx = 1;
  rows.forEach((row, ri) => {
    row.forEach((num, ci) => {
      const x = startX + ri * (BALL_R * 1.9);
      const y = startY + (ci - (row.length - 1) / 2) * (BALL_R * 2.0);
      balls.push({
        id: ballIdx++, x, y, vx: 0, vy: 0,
        color: BALL_COLORS[num], number: num, potted: false,
        isStripe: num >= 9,
      });
    });
  });
  return balls;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function resolveCollision(a, b) {
  const d = dist(a, b);
  if (d === 0) return;
  const nx = (b.x - a.x) / d;
  const ny = (b.y - a.y) / d;
  const dvx = a.vx - b.vx;
  const dvy = a.vy - b.vy;
  const imp = dvx * nx + dvy * ny;
  if (imp <= 0) return;
  a.vx -= imp * nx;
  a.vy -= imp * ny;
  b.vx += imp * nx;
  b.vy += imp * ny;
  // Separate
  const overlap = (BALL_R * 2) - d + 0.5;
  a.x -= nx * overlap * 0.5;
  a.y -= ny * overlap * 0.5;
  b.x += nx * overlap * 0.5;
  b.y += ny * overlap * 0.5;
}

function stepPhysics(balls) {
  const next = balls.map(b => {
    if (b.potted) return b;
    let { x, y, vx, vy } = b;
    vx *= FRICTION;
    vy *= FRICTION;
    if (Math.abs(vx) < MIN_VEL) vx = 0;
    if (Math.abs(vy) < MIN_VEL) vy = 0;
    x += vx;
    y += vy;
    // Wall bounce
    if (x - BALL_R < 0) { x = BALL_R; vx = -vx * 0.75; }
    if (x + BALL_R > W) { x = W - BALL_R; vx = -vx * 0.75; }
    if (y - BALL_R < 0) { y = BALL_R; vy = -vy * 0.75; }
    if (y + BALL_R > H) { y = H - BALL_R; vy = -vy * 0.75; }
    return { ...b, x, y, vx, vy };
  });

  // Ball-ball collision
  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      if (next[i].potted || next[j].potted) continue;
      if (dist(next[i], next[j]) < BALL_R * 2) {
        resolveCollision(next[i], next[j]);
      }
    }
  }

  // Pocket detection
  next.forEach(b => {
    if (b.potted) return;
    POCKETS.forEach(p => {
      if (Math.hypot(b.x - p.x, b.y - p.y) < POCKET_R) {
        b.potted = true; b.vx = 0; b.vy = 0;
      }
    });
  });

  return next;
}

function isMoving(balls) {
  return balls.some(b => !b.potted && (Math.abs(b.vx) > 0.05 || Math.abs(b.vy) > 0.05));
}

export default function Billiards() {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const canvasRef = useRef(null);
  const stateRef = useRef({
    balls: createBalls(),
    aiming: false,
    aimStart: null,
    power: 0,
    angle: 0,
    turn: 'player', // 'player' | 'bot'
    playerGroup: null, // 'solid' | 'stripe' | null
    botGroup: null,
    gameOver: null, // null | 'player' | 'bot'
    shotInProgress: false,
    botShotTimer: null,
  });
  const [renderTick, setRenderTick] = useState(0);
  const [message, setMessage] = useState('\u06a9\u06cc\u0648 \u0631\u0627 \u0628\u06a9\u0634\u06cc\u062f \u0648 \u0631\u0647\u0627 \u06a9\u0646\u06cc\u062f \u062a\u0627 \u0634\u0648\u062a \u0628\u0632\u0646\u06cc\u062f');
  const [turn, setTurn] = useState('player');
  const [gameOver, setGameOver] = useState(null);
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.shotInProgress) {
      s.balls = stepPhysics(s.balls);
      if (!isMoving(s.balls)) {
        s.shotInProgress = false;
        // Check pocket results
        const pottedNow = s.balls.filter(b => b.potted);
        const cue = s.balls[0];
        if (cue.potted) {
          // Scratch — respawn cue
          s.balls[0] = { ...s.balls[0], x: W * 0.25, y: H / 2, vx: 0, vy: 0, potted: false };
          setMessage('\u0641\u0648\u0644 \u0634\u062f! \u06af\u0648\u06cc \u0633\u0641\u06cc\u062f \u0628\u0631\u06af\u0634\u062a');
        }
        const eight = s.balls.find(b => b.number === 8);
        if (eight?.potted) {
          const winner = s.playerGroup !== null && s.balls.filter(b => !b.isStripe && b.number !== 0 && b.number !== 8 && b.potted).length === 7
            ? 'player' : 'bot';
          s.gameOver = winner;
          setGameOver(winner);
          setMessage(winner === 'player' ? '\u0628\u0631\u0646\u062f\u0647 \u0634\u062f\u06cc\u062f! \u0628\u0627\u0644 \u0633\u06cc\u0627\u0647 \u067e\u0627\u062a \u0634\u062f!' : '\u0631\u0628\u0627\u062a \u0628\u0631\u062f!');
        }
        // Switch turn
        if (!s.gameOver) {
          s.turn = s.turn === 'player' ? 'bot' : 'player';
          setTurn(s.turn);
          if (s.turn === 'bot') {
            setMessage('\u0646\u0648\u0628\u062a \u0631\u0628\u0627\u062a...');
            s.botShotTimer = setTimeout(() => makeBotShot(), 1200);
          } else {
            setMessage('\u0646\u0648\u0628\u062a \u0634\u0645\u0627! \u06a9\u06cc\u0648 \u0631\u0627 \u0628\u06a9\u0634\u06cc\u062f');
          }
        }
      }
      setRenderTick(t => t + 1);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    // Table
    ctx.fillStyle = '#1a5c2e';
    ctx.fillRect(0, 0, W, H);
    // Rail
    ctx.strokeStyle = '#5c3a1a';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, W - 12, H - 12);

    // Pockets
    POCKETS.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    });

    // Aim line
    if (s.aiming && !s.shotInProgress && s.turn === 'player') {
      const cue = s.balls[0];
      if (cue && !cue.potted) {
        const endX = cue.x + Math.cos(s.angle) * 120;
        const endY = cue.y + Math.sin(s.angle) * 120;
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(cue.x, cue.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cue stick
        const stickLen = 100 + s.power * 0.8;
        const sx = cue.x - Math.cos(s.angle) * (BALL_R + 4);
        const sy = cue.y - Math.sin(s.angle) * (BALL_R + 4);
        const ex = sx - Math.cos(s.angle) * stickLen;
        const ey = sy - Math.sin(s.angle) * stickLen;
        ctx.beginPath();
        ctx.lineWidth = 4;
        const grad = ctx.createLinearGradient(sx, sy, ex, ey);
        grad.addColorStop(0, '#e2b96a');
        grad.addColorStop(1, '#7c4b1a');
        ctx.strokeStyle = grad;
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    }

    // Balls
    s.balls.forEach(b => {
      if (b.potted) return;
      // Shadow
      ctx.beginPath();
      ctx.arc(b.x + 2, b.y + 2, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fill();
      // Ball
      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      if (b.isStripe) {
        // Stripe overlay
        ctx.save();
        ctx.clip();
        ctx.fillStyle = '#fff';
        ctx.fillRect(b.x - BALL_R, b.y - BALL_R * 0.35, BALL_R * 2, BALL_R * 0.7);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      }
      // Highlight
      ctx.beginPath();
      ctx.arc(b.x - BALL_R * 0.3, b.y - BALL_R * 0.3, BALL_R * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
      // Number
      if (b.number > 0) {
        ctx.fillStyle = b.number === 8 ? '#fff' : '#fff';
        ctx.font = `bold ${BALL_R * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(b.number), b.x, b.y);
      }
    });
  }, [renderTick]);

  function getCanvasPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function handlePointerDown(e) {
    const s = stateRef.current;
    if (s.shotInProgress || s.turn !== 'player' || s.gameOver) return;
    const pos = getCanvasPos(e, canvasRef.current);
    const cue = s.balls[0];
    if (!cue || cue.potted) return;
    s.aiming = true;
    s.aimStart = pos;
    s.angle = Math.atan2(pos.y - cue.y, pos.x - cue.x) + Math.PI;
    s.power = 0;
    setRenderTick(t => t + 1);
  }

  function handlePointerMove(e) {
    const s = stateRef.current;
    if (!s.aiming || s.shotInProgress) return;
    const pos = getCanvasPos(e, canvasRef.current);
    const cue = s.balls[0];
    s.angle = Math.atan2(cue.y - pos.y, cue.x - pos.x);
    const d = Math.hypot(pos.x - s.aimStart.x, pos.y - s.aimStart.y);
    s.power = Math.min(d, 150);
    setRenderTick(t => t + 1);
  }

  function handlePointerUp(e) {
    const s = stateRef.current;
    if (!s.aiming) return;
    s.aiming = false;
    if (s.power > 5) {
      const speed = s.power * 0.18;
      s.balls[0].vx = Math.cos(s.angle) * speed;
      s.balls[0].vy = Math.sin(s.angle) * speed;
      s.shotInProgress = true;
      soundEngine.playTap?.();
    }
    s.power = 0;
    setRenderTick(t => t + 1);
  }

  function makeBotShot() {
    const s = stateRef.current;
    if (s.turn !== 'bot' || s.shotInProgress || s.gameOver) return;
    const cue = s.balls[0];
    if (!cue || cue.potted) return;
    // Target a random non-potted ball
    const targets = s.balls.filter(b => !b.potted && b.number !== 0 && b.number !== 8);
    if (targets.length === 0) {
      const eight = s.balls.find(b => b.number === 8 && !b.potted);
      if (!eight) return;
      targets.push(eight);
    }
    const target = targets[Math.floor(Math.random() * targets.length)];
    const angle = Math.atan2(target.y - cue.y, target.x - cue.x);
    const speed = 8 + Math.random() * 5;
    s.balls[0].vx = Math.cos(angle) * speed;
    s.balls[0].vy = Math.sin(angle) * speed;
    s.shotInProgress = true;
    soundEngine.playTap?.();
    setRenderTick(t => t + 1);
  }

  function resetGame() {
    const s = stateRef.current;
    if (s.botShotTimer) clearTimeout(s.botShotTimer);
    s.balls = createBalls();
    s.aiming = false; s.power = 0; s.angle = 0;
    s.turn = 'player'; s.gameOver = null; s.shotInProgress = false;
    s.playerGroup = null; s.botGroup = null;
    setTurn('player');
    setGameOver(null);
    setMessage('\u06a9\u06cc\u0648 \u0631\u0627 \u0628\u06a9\u0634\u06cc\u062f \u0648 \u0634\u0648\u062a \u0628\u0632\u0646\u06cc\u062f');
    setRenderTick(t => t + 1);
  }

  const s = stateRef.current;
  const pottedCount = s.balls.filter(b => b.potted && b.number !== 0).length;

  return (
    <div className="min-h-screen bg-[#050e0a] text-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        <button onClick={() => navigate('/games')} className="p-2 rounded-xl bg-white/10 text-slate-300 active:scale-95">
          <ChevronLeft size={20} className="rotate-180" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-black text-emerald-300">🎱 بیلیارد ۸‌توپی</h1>
          <p className="text-[10px] text-slate-400">{pottedCount} توپ پات شده · {turn === 'player' ? '🟢 نوبت شما' : '🤖 نوبت ربات'}</p>
        </div>
        <button onClick={resetGame} className="p-2 rounded-xl bg-white/10 text-slate-300 active:scale-95">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Message */}
      <div className="mx-4 mb-2 py-2 px-3 rounded-xl bg-emerald-900/30 border border-emerald-500/30 text-center text-xs font-bold text-emerald-200 flex-shrink-0">
        {message}
      </div>

      {/* Power Bar */}
      {s.aiming && (
        <div className="mx-4 mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-10">قدرت:</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 border border-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 transition-all"
                style={{ width: (s.power / 150 * 100) + '%' }} />
            </div>
            <span className="text-[10px] text-slate-400 w-8">{Math.round(s.power / 1.5)}%</span>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center px-2 pb-4">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full max-w-2xl rounded-2xl border-4 border-[#5c3a1a] shadow-2xl cursor-crosshair touch-none"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={e => { e.preventDefault(); handlePointerMove(e); }}
          onTouchEnd={handlePointerUp}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Help */}
      <div className="px-4 pb-6 text-center flex-shrink-0">
        <p className="text-[10px] text-slate-500">روی میز کلیک/لمس کنید، بکشید برای تنظیم قدرت و زاویه، رها کنید برای شوت</p>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-xs rounded-3xl bg-slate-900 border-2 border-emerald-500/50 p-6 text-center space-y-4 shadow-2xl">
            <div className="text-5xl">{gameOver === 'player' ? '🏆' : '🤖'}</div>
            <h3 className="text-xl font-black text-emerald-300">
              {gameOver === 'player' ? 'برنده شدید! 🎉' : 'ربات برد! 🤖'}
            </h3>
            <div className="flex gap-2">
              <button onClick={resetGame} className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-black text-sm active:scale-95">
                🔄 بازی مجدد
              </button>
              <button onClick={() => navigate('/games')} className="py-3 px-4 rounded-2xl bg-white/10 text-white font-bold text-xs">
                خروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
