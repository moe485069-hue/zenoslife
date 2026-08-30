import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import useAppStore from '../../store/appStore';
import FullscreenWrapper from '../../components/ui/FullscreenWrapper';
import LocalChat from './LocalChat';

export default function NeonSnake() {
  const { isRtl, addXP } = useAppStore();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, gameover

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Grid Setup
    const gridSize = 20;
    let tileCountX, tileCountY;
    
    const resizeCanvas = () => {
      // Make canvas size a multiple of gridSize
      const containerW = canvas.parentElement.clientWidth;
      const containerH = canvas.parentElement.clientHeight;
      tileCountX = Math.floor(containerW / gridSize);
      tileCountY = Math.floor(containerH / gridSize);
      canvas.width = tileCountX * gridSize;
      canvas.height = tileCountY * gridSize;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Entity
    let snake = [
      { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }
    ];
    let velocity = { x: 1, y: 0 };
    let nextVelocity = { x: 1, y: 0 }; // prevent 180 turn in same frame
    
    let apple = { 
      x: Math.floor(Math.random() * tileCountX), 
      y: Math.floor(Math.random() * tileCountY) 
    };

    let scoreCounter = 0;

    // Controls
    const keyDownHandler = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (velocity.y !== 1) nextVelocity = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (velocity.y !== -1) nextVelocity = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (velocity.x !== 1) nextVelocity = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (velocity.x !== -1) nextVelocity = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener('keydown', keyDownHandler);

    // Touch/Swipe controls
    let touchStartX = 0;
    let touchStartY = 0;
    const touchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const touchMove = (e) => {
      e.preventDefault(); // prevent scroll
    };
    const touchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 30 && velocity.x !== -1) nextVelocity = { x: 1, y: 0 };
        else if (dx < -30 && velocity.x !== 1) nextVelocity = { x: -1, y: 0 };
      } else {
        // Vertical swipe
        if (dy > 30 && velocity.y !== -1) nextVelocity = { x: 0, y: 1 };
        else if (dy < -30 && velocity.y !== 1) nextVelocity = { x: 0, y: -1 };
      }
    };
    canvas.addEventListener('touchstart', touchStart, { passive: false });
    canvas.addEventListener('touchmove', touchMove, { passive: false });
    canvas.addEventListener('touchend', touchEnd, { passive: false });

    // Loop variables
    let lastTime = 0;
    let animationId;
    const speedMs = 100; // Time between frames

    const gameLoop = (timestamp) => {
      animationId = requestAnimationFrame(gameLoop);
      if (timestamp - lastTime < speedMs) return;
      lastTime = timestamp;

      velocity = nextVelocity;

      // Move Head
      const head = { 
        x: snake[0].x + velocity.x, 
        y: snake[0].y + velocity.y 
      };

      // Collision with walls
      if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        setGameState('gameover');
        return;
      }

      // Collision with self
      for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
          setGameState('gameover');
          return;
        }
      }

      snake.unshift(head); // Add new head

      // Apple collision
      if (head.x === apple.x && head.y === apple.y) {
        scoreCounter += 10;
        setScore(scoreCounter);
        // New Apple
        apple = { 
          x: Math.floor(Math.random() * tileCountX), 
          y: Math.floor(Math.random() * tileCountY) 
        };
      } else {
        snake.pop(); // Remove tail if no apple eaten
      }

      // Draw
      ctx.fillStyle = '#020617'; // bg-slate-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid (Optional, faint)
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      for (let i=0; i<=tileCountX; i++) {
        ctx.beginPath(); ctx.moveTo(i*gridSize, 0); ctx.lineTo(i*gridSize, canvas.height); ctx.stroke();
      }
      for (let i=0; i<=tileCountY; i++) {
        ctx.beginPath(); ctx.moveTo(0, i*gridSize); ctx.lineTo(canvas.width, i*gridSize); ctx.stroke();
      }

      // Draw Apple
      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#10b981';
      ctx.fillRect(apple.x * gridSize + 2, apple.y * gridSize + 2, gridSize - 4, gridSize - 4);
      ctx.shadowBlur = 0;

      // Draw Snake
      snake.forEach((part, index) => {
        // Head is brighter
        ctx.fillStyle = index === 0 ? '#c084fc' : '#a855f7'; // purple-400 / purple-500
        ctx.shadowBlur = index === 0 ? 15 : 5;
        ctx.shadowColor = '#c084fc';
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;
      });
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('resize', resizeCanvas);
      if(canvas) {
        canvas.removeEventListener('touchstart', touchStart);
        canvas.removeEventListener('touchmove', touchMove);
        canvas.removeEventListener('touchend', touchEnd);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'gameover' && score > 50) {
      addXP(20, 'رکورد خوب در مار سایبری');
    }
  }, [gameState]);

  return (
    <FullscreenWrapper>
      <div className="w-full min-h-screen relative overflow-hidden bg-slate-950 flex flex-col items-center" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* HUD */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
          <button 
            onClick={() => navigate('/games')}
            className="pointer-events-auto p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
          >
            <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div className="px-6 py-2 bg-black/50 border border-purple-500/30 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <span className="text-sm font-bold text-purple-300">{isRtl ? 'امتیاز:' : 'Score:'} </span>
            <span className="text-2xl font-black text-white">{score}</span>
          </div>
        </div>

        {/* Game Canvas Container */}
        <div className="flex-1 w-full flex items-center justify-center p-4 pt-20">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full max-w-4xl max-h-[800px] border-4 border-purple-900/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] bg-slate-950"
          />
        </div>

        {/* Game Over Modal */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="p-8 rounded-3xl bg-slate-900 border border-purple-500/50 flex flex-col items-center shadow-[0_0_50px_rgba(168,85,247,0.3)]">
              <h2 className="text-3xl font-black text-white mb-2">{isRtl ? 'باختی!' : 'GAME OVER'}</h2>
              <p className="text-xl text-purple-300 mb-6">{isRtl ? 'امتیاز شما:' : 'Your Score:'} {score}</p>
              <button
                onClick={() => { setScore(0); setGameState('playing'); }}
                className="w-full py-3 px-8 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center gap-2 hover:bg-purple-500 transition-colors shadow-lg active:scale-95"
              >
                <RotateCcw size={20} />
                {isRtl ? 'تلاش مجدد' : 'Try Again'}
              </button>
            </div>
          </div>
        )}

        <LocalChat 
          botNameFa="مار باستانی" 
          botNameEn="Ancient Serpent"
          simulatedReplies={
            isRtl 
            ? ['دیوارها نزدیک میشن...', 'سعی کن دور خودت بپیچی.', 'سیب بعدی کجاست؟', 'رکوردت رو میتونی بشکنی؟']
            : ['Walls are closing in...', 'Try coiling up.', 'Where is the next apple?', 'Can you beat your score?']
          }
        />
      </div>
    </FullscreenWrapper>
  );
}
