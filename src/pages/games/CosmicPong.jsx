import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import useAppStore from '../../store/appStore';
import FullscreenWrapper from '../../components/ui/FullscreenWrapper';

export default function CosmicPong() {
  const { isRtl } = useAppStore();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState({ p1: 0, p2: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = Math.min(canvas.parentElement.clientHeight, 600);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Entities
    const paddleWidth = 10;
    const paddleHeight = 100;
    
    const p1 = { x: 20, y: canvas.height / 2 - paddleHeight / 2, w: paddleWidth, h: paddleHeight, speed: 8, color: '#38bdf8' }; // Left
    const p2 = { x: canvas.width - 20 - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, w: paddleWidth, h: paddleHeight, speed: 6, color: '#f43f5e' }; // Right
    
    const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, dx: 5, dy: 5, color: '#fff' };

    let upPressed = false;
    let downPressed = false;
    let wPressed = false;
    let sPressed = false;

    const keyDownHandler = (e) => {
      if (e.key === 'ArrowUp') upPressed = true;
      if (e.key === 'ArrowDown') downPressed = true;
      if (e.key === 'w' || e.key === 'W') wPressed = true;
      if (e.key === 's' || e.key === 'S') sPressed = true;
    };
    const keyUpHandler = (e) => {
      if (e.key === 'ArrowUp') upPressed = false;
      if (e.key === 'ArrowDown') downPressed = false;
      if (e.key === 'w' || e.key === 'W') wPressed = false;
      if (e.key === 's' || e.key === 'S') sPressed = false;
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    // Touch controls (split screen left/right)
    const handleTouch = (e) => {
      e.preventDefault();
      wPressed = false; sPressed = false;
      upPressed = false; downPressed = false;
      
      for(let i=0; i<e.touches.length; i++) {
        const touch = e.touches[i];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        if (x < canvas.width / 2) {
          // Left player
          if (y < canvas.height / 2) wPressed = true;
          else sPressed = true;
        } else {
          // Right player
          if (y < canvas.height / 2) upPressed = true;
          else downPressed = true;
        }
      }
    };
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', handleTouch, { passive: false });

    let animationId;
    
    const resetBall = () => {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx = -ball.dx;
      ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
    };

    let p1ScoreCounter = 0;
    let p2ScoreCounter = 0;

    const draw = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center Line
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Movement
      if (wPressed && p1.y > 0) p1.y -= p1.speed;
      if (sPressed && p1.y < canvas.height - p1.h) p1.y += p1.speed;
      
      if (upPressed && p2.y > 0) p2.y -= p2.speed;
      if (downPressed && p2.y < canvas.height - p2.h) p2.y += p2.speed;

      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall bounce (Top/Bottom)
      if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }

      // Paddle collision
      const checkCollision = (p) => {
        return (
          ball.x - ball.radius < p.x + p.w &&
          ball.x + ball.radius > p.x &&
          ball.y + ball.radius > p.y &&
          ball.y - ball.radius < p.y + p.h
        );
      };

      if (checkCollision(p1)) {
        ball.dx = Math.abs(ball.dx) + 0.5; // Speed up slightly
        ball.x = p1.x + p1.w + ball.radius;
      }
      if (checkCollision(p2)) {
        ball.dx = -Math.abs(ball.dx) - 0.5;
        ball.x = p2.x - ball.radius;
      }

      // Scoring
      if (ball.x < 0) {
        p2ScoreCounter++;
        setScore({ p1: p1ScoreCounter, p2: p2ScoreCounter });
        resetBall();
      } else if (ball.x > canvas.width) {
        p1ScoreCounter++;
        setScore({ p1: p1ScoreCounter, p2: p2ScoreCounter });
        resetBall();
      }

      // Draw Paddles
      ctx.shadowBlur = 15;
      ctx.fillStyle = p1.color;
      ctx.shadowColor = p1.color;
      ctx.fillRect(p1.x, p1.y, p1.w, p1.h);

      ctx.fillStyle = p2.color;
      ctx.shadowColor = p2.color;
      ctx.fillRect(p2.x, p2.y, p2.w, p2.h);

      // Draw Ball
      ctx.fillStyle = ball.color;
      ctx.shadowColor = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener('resize', resizeCanvas);
      if(canvas) {
        canvas.removeEventListener('touchstart', handleTouch);
        canvas.removeEventListener('touchmove', handleTouch);
        canvas.removeEventListener('touchend', handleTouch);
      }
    };
  }, []);

  return (
    <FullscreenWrapper>
      <div className="w-full min-h-screen relative overflow-hidden bg-slate-950 flex flex-col" dir="ltr">
        
        {/* HUD */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
          <button 
            onClick={() => navigate('/games')}
            className="pointer-events-auto p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-12 font-black text-4xl">
            <span className="text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">{score.p1}</span>
            <span className="text-slate-600">-</span>
            <span className="text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">{score.p2}</span>
          </div>
          
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        {/* Game Canvas */}
        <div className="flex-1 w-full flex items-center justify-center p-4">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full max-w-5xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Controls Info */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-500 flex justify-around px-8 pointer-events-none">
          <span>{isRtl ? 'بازیکن چپ: W / S' : 'Left Player: W / S'}</span>
          <span>{isRtl ? 'لمس نیمه صفحه برای موبایل' : 'Tap screen halves on mobile'}</span>
          <span>{isRtl ? 'بازیکن راست: کلیدهای جهت بالا/پایین' : 'Right Player: Up / Down Arrows'}</span>
        </div>
      </div>
    </FullscreenWrapper>
  );
}
