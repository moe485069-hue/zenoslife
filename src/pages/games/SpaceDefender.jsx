import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Crosshair } from 'lucide-react';
import useAppStore from '../../store/appStore';
import FullscreenWrapper from '../../components/ui/FullscreenWrapper';
import LocalChat from './LocalChat';

export default function SpaceDefender() {
  const { isRtl, addXP, addCoins } = useAppStore();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Canvas Game Logic
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set proper size
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId;
    let scoreCounter = 0;

    // Entities
    const player = {
      x: canvas.width / 2,
      y: canvas.height - 50,
      width: 40,
      height: 40,
      speed: 7,
      color: '#38bdf8',
      dx: 0
    };

    const bullets = [];
    const enemies = [];
    const particles = [];

    // Controls
    let leftPressed = false;
    let rightPressed = false;
    let spacePressed = false;
    let lastShotTime = 0;

    const keyDownHandler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
      if (e.key === ' ' || e.key === 'Enter') spacePressed = true;
    };
    const keyUpHandler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
      if (e.key === ' ' || e.key === 'Enter') spacePressed = false;
    };

    // Touch controls
    const touchStartHandler = (e) => {
      const touchX = e.touches[0].clientX;
      const rect = canvas.getBoundingClientRect();
      if (touchX < rect.left + rect.width / 2) leftPressed = true;
      else rightPressed = true;
      spacePressed = true; // Auto shoot on touch
    };
    const touchEndHandler = () => {
      leftPressed = false;
      rightPressed = false;
      spacePressed = false;
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    canvas.addEventListener('touchstart', touchStartHandler);
    canvas.addEventListener('touchend', touchEndHandler);

    // Spawners
    const spawnEnemy = () => {
      const size = Math.random() * 20 + 20;
      const x = Math.random() * (canvas.width - size);
      enemies.push({
        x,
        y: -size,
        width: size,
        height: size,
        speed: Math.random() * 2 + 1 + (scoreCounter / 1000), // Speeds up over time
        color: `hsl(${Math.random() * 60 + 330}, 100%, 60%)` // Pink/Red hues
      });
    };

    const createExplosion = (x, y, color) => {
      for (let i = 0; i < 15; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          radius: Math.random() * 3,
          color,
          alpha: 1
        });
      }
    };

    let frameCount = 0;

    // Main Game Loop
    const draw = () => {
      // Clear canvas with trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; // Slate 900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Player Movement
      if (leftPressed && player.x > 0) player.x -= player.speed;
      if (rightPressed && player.x < canvas.width - player.width) player.x += player.speed;

      // Shooting
      if (spacePressed && Date.now() - lastShotTime > 200) {
        bullets.push({
          x: player.x + player.width / 2 - 3,
          y: player.y,
          width: 6,
          height: 15,
          speed: 10,
          color: '#bae6fd' // Sky 200
        });
        lastShotTime = Date.now();
      }

      // Draw Player
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.fill();
      // Glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = player.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Update & Draw Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y -= b.speed;
        
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.shadowBlur = 0;

        if (b.y < 0) bullets.splice(i, 1);
      }

      // Spawn Enemies
      if (frameCount % Math.max(30, 100 - Math.floor(scoreCounter / 50)) === 0) {
        spawnEnemy();
      }

      // Update & Draw Enemies & Collision
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += e.speed;

        ctx.fillStyle = e.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.shadowBlur = 0;

        // Player Collision (Game Over)
        if (
          player.x < e.x + e.width &&
          player.x + player.width > e.x &&
          player.y < e.y + e.height &&
          player.y + player.height > e.y
        ) {
          setGameState('gameover');
          return;
        }

        // Bullet Collision
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (
            b.x < e.x + e.width &&
            b.x + b.width > e.x &&
            b.y < e.y + e.height &&
            b.y + b.height > e.y
          ) {
            createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.color);
            enemies.splice(i, 1);
            bullets.splice(j, 1);
            scoreCounter += 10;
            setScore(scoreCounter);
            break;
          }
        }

        // Out of bounds
        if (e && e.y > canvas.height) {
          enemies.splice(i, 1);
        }
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      frameCount++;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('touchstart', touchStartHandler);
        canvas.removeEventListener('touchend', touchEndHandler);
      }
    };
  }, [gameState]);

  // Handle Game Over
  useEffect(() => {
    if (gameState === 'gameover') {
      if (score > highScore) setHighScore(score);
      if (score > 500) {
        addXP(50, 'پیروزی بزرگ در مدافع فضا');
        addCoins(20);
      } else if (score > 100) {
        addXP(10, 'بازی مدافع فضا');
      }
    }
  }, [gameState]);

  return (
    <FullscreenWrapper>
      <div className="w-full min-h-screen relative overflow-hidden bg-slate-950" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* HUD Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-start justify-between pointer-events-none">
          <button 
            onClick={() => navigate('/games')}
            className="pointer-events-auto p-2 rounded-xl bg-white/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 transition-colors backdrop-blur-md"
          >
            <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex flex-col items-end gap-1">
            <div className="px-4 py-2 bg-black/40 border border-sky-500/30 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <span className="text-xs text-sky-300 font-bold uppercase">{isRtl ? 'امتیاز' : 'Score'}</span>
              <div className="text-2xl font-black text-white">{score}</div>
            </div>
            {highScore > 0 && (
              <div className="px-3 py-1 bg-black/40 border border-amber-500/30 rounded-lg backdrop-blur-md">
                <span className="text-[10px] text-amber-300 font-bold uppercase">{isRtl ? 'بهترین' : 'High'} : {highScore}</span>
              </div>
            )}
          </div>
        </div>

      {/* Game Canvas container */}
      <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block"
          style={{ cursor: gameState === 'playing' ? 'none' : 'default' }}
        />
      </div>

      {/* UI Overlays */}
      <AnimatePresence>
        {gameState === 'start' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="p-8 rounded-3xl bg-slate-900 border border-sky-500/30 flex flex-col items-center max-w-sm w-full mx-4 shadow-[0_0_50px_rgba(56,189,248,0.2)] text-center">
              <Crosshair className="w-16 h-16 text-sky-400 mb-4" />
              <h1 className="text-2xl font-black text-white mb-2">SPACE DEFENDER</h1>
              <p className="text-sm text-sky-200 mb-6">
                {isRtl 
                  ? 'از سفینه خود محافظت کنید. حرکت با چپ/راست و شلیک با Space/لمس صفحه.' 
                  : 'Defend your ship. Move with Left/Right arrows, shoot with Space or tap.'}
              </p>
              <button
                onClick={() => { setScore(0); setGameState('playing'); }}
                className="w-full py-3 rounded-xl bg-sky-500 text-slate-950 font-black text-lg hover:bg-sky-400 transition-colors shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-95"
              >
                {isRtl ? 'شروع ماموریت' : 'Start Mission'}
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-rose-950/80 backdrop-blur-sm"
          >
            <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/50 flex flex-col items-center max-w-sm w-full mx-4 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-center">
              <h2 className="text-3xl font-black text-rose-500 mb-2">
                {isRtl ? 'ماموریت شکست خورد' : 'MISSION FAILED'}
              </h2>
              <div className="text-xl font-bold text-white mb-6">
                {isRtl ? 'امتیاز نهایی:' : 'Final Score:'} <span className="text-sky-400">{score}</span>
              </div>
              <button
                onClick={() => { setScore(0); setGameState('playing'); }}
                className="w-full py-3 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center gap-2 hover:bg-rose-500 transition-colors shadow-lg active:scale-95"
              >
                <RotateCcw size={20} />
                {isRtl ? 'تلاش مجدد' : 'Try Again'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LocalChat 
        botNameFa="فرماندهی کیهانی" 
        botNameEn="Cosmic Command"
        simulatedReplies={
          isRtl 
          ? ['مراقب سمت چپ باش!', 'سریع‌تر شلیک کن خلبان!', 'رکوردت رو میتونی بشکنی؟', 'سنگ‌های بزرگتر در راهند...']
          : ['Watch your left flank!', 'Fire faster, pilot!', 'Can you beat your high score?', 'Bigger asteroids incoming...']
        }
      />
      </div>
    </FullscreenWrapper>
  );
}
