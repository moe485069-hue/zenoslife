import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ArrowLeft, Trophy, Sparkles, Volume2, VolumeX, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import FullscreenWrapper from '../../components/ui/FullscreenWrapper';
import soundEngine from '../../utils/audio';

const SIZE = 4;

const TILE_COLORS = {
  2: 'bg-slate-800 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10',
  4: 'bg-slate-800 text-teal-300 border-teal-500/40 shadow-teal-500/10',
  8: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20',
  16: 'bg-green-950/80 text-green-300 border-green-500/50 shadow-green-500/20',
  32: 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-500/20',
  64: 'bg-orange-950/80 text-orange-300 border-orange-500/50 shadow-orange-500/30',
  128: 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-rose-500/40 font-bold',
  256: 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/60 shadow-fuchsia-500/40 font-bold',
  512: 'bg-purple-950/80 text-purple-200 border-purple-400 shadow-purple-500/50 font-black',
  1024: 'bg-indigo-950/90 text-indigo-200 border-indigo-400 shadow-indigo-500/60 font-black',
  2048: 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-400/80 font-black text-shadow-glow',
  4096: 'bg-rose-600 text-white border-rose-300 shadow-rose-500/90 font-black'
};

function getEmptyBoard() {
  return Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
}

function addRandomTile(board) {
  const emptyCells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return board;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

export default function Cyber2048() {
  const { isRtl, addXP } = useAppStore();
  const [board, setBoard] = useState(getEmptyBoard);
  const [prevBoard, setPrevBoard] = useState(null);
  const [score, setScore] = useState(0);
  const [prevScore, setPrevScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('cyber_2048_best') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const initGame = useCallback(() => {
    let newBoard = getEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setPrevBoard(null);
    setScore(0);
    setGameOver(false);
    setHasWon(false);
    soundEngine.playCheckmark();
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const saveHighScore = (newScore) => {
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('cyber_2048_best', newScore.toString());
    }
  };

  const slideAndMergeRow = (row) => {
    let filtered = row.filter(val => val !== 0);
    let points = 0;
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        points += filtered[i];
        filtered[i + 1] = 0;
        if (filtered[i] === 2048 && !hasWon) {
          setHasWon(true);
          soundEngine.playLevelUp();
          addXP(100, 'Reaching 2048 in Cyber 2048');
        }
      }
    }
    filtered = filtered.filter(val => val !== 0);
    while (filtered.length < SIZE) {
      filtered.push(0);
    }
    return { row: filtered, points };
  };

  const moveLeft = (currentBoard) => {
    let newBoard = [];
    let gainedPoints = 0;
    for (let r = 0; r < SIZE; r++) {
      const { row, points } = slideAndMergeRow(currentBoard[r]);
      newBoard.push(row);
      gainedPoints += points;
    }
    return { board: newBoard, points: gainedPoints };
  };

  const rotateBoard = (b) => {
    const newBoard = getEmptyBoard();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        newBoard[c][SIZE - 1 - r] = b[r][c];
      }
    }
    return newBoard;
  };

  const checkGameOver = (b) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === 0) return false;
        if (c < SIZE - 1 && b[r][c] === b[r][c + 1]) return false;
        if (r < SIZE - 1 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  const handleMove = useCallback((direction) => {
    if (gameOver) return;

    let current = board;
    let rotations = 0;
    if (direction === 'UP') rotations = 3;
    else if (direction === 'RIGHT') rotations = 2;
    else if (direction === 'DOWN') rotations = 1;

    for (let i = 0; i < rotations; i++) {
      current = rotateBoard(current);
    }

    const { board: movedBoard, points } = moveLeft(current);

    let finalBoard = movedBoard;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      finalBoard = rotateBoard(finalBoard);
    }

    const isChanged = JSON.stringify(board) !== JSON.stringify(finalBoard);

    if (isChanged) {
      setPrevBoard(board);
      setPrevScore(score);
      const withNewTile = addRandomTile(finalBoard);
      const newScore = score + points;
      setBoard(withNewTile);
      setScore(newScore);
      saveHighScore(newScore);
      soundEngine.playCheckmark();

      if (points >= 64) {
        addXP(Math.floor(points / 20), 'Cyber 2048 Combo');
      }

      if (checkGameOver(withNewTile)) {
        setGameOver(true);
        soundEngine.playAlarm();
      }
    }
  }, [board, score, gameOver, hasWon, bestScore]);

  const handleUndo = () => {
    if (!prevBoard || gameOver) return;
    setBoard(prevBoard);
    setScore(prevScore);
    setPrevBoard(null);
    soundEngine.playCheckmark();
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); handleMove('UP'); }
      else if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); handleMove('DOWN'); }
      else if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); handleMove('LEFT'); }
      else if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); handleMove('RIGHT'); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleMove]);

  // Touch Swipe navigation
  const onTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const onTouchEnd = (e) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 30) {
      if (absDx > absDy) {
        handleMove(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        handleMove(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    setTouchStart(null);
  };

  return (
    <FullscreenWrapper title={isRtl ? '۲۰۴۸ سایبری' : 'Cyber 2048'}>
      <div 
        className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-3 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* HUD Top Bar */}
        <div className="w-full max-w-sm flex items-center justify-between gap-3 mb-4">
          <Link
            to="/games"
            className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>

          <div className="flex gap-2">
            {/* Current Score */}
            <div className="px-3.5 py-1.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
              <span className="text-[10px] text-cyan-400 block font-bold">{isRtl ? 'امتیاز' : 'SCORE'}</span>
              <span className="text-sm font-black text-cyan-200">{score.toLocaleString()}</span>
            </div>

            {/* Best Score */}
            <div className="px-3.5 py-1.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-400" />
              <div>
                <span className="text-[10px] text-amber-400 block font-bold">{isRtl ? 'بهترین' : 'BEST'}</span>
                <span className="text-sm font-black text-amber-200">{bestScore.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            {prevBoard && (
              <button
                onClick={handleUndo}
                className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-amber-400 transition-colors"
                title={isRtl ? 'بازگشت یک حرکت' : 'Undo'}
              >
                <Undo2 size={18} />
              </button>
            )}
            <button
              onClick={initGame}
              className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-cyan-400 transition-colors"
              title={isRtl ? 'شروع مجدد' : 'Restart'}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* 4x4 Game Matrix */}
        <div className="w-full max-w-sm aspect-square p-3 rounded-3xl bg-slate-950/90 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/10 grid grid-cols-4 grid-rows-4 gap-2.5 relative backdrop-blur-xl">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className="w-full h-full rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center relative overflow-hidden"
              >
                <AnimatePresence mode="popLayout">
                  {val !== 0 && (
                    <motion.div
                      key={`${r}-${c}-${val}`}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                      className={`w-full h-full rounded-2xl border flex items-center justify-center text-lg sm:text-2xl font-black transition-all ${
                        TILE_COLORS[val] || 'bg-rose-600 text-white border-rose-300'
                      }`}
                    >
                      {val}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}

          {/* Game Over Overlay */}
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 rounded-3xl bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 border border-rose-500/40"
            >
              <span className="text-4xl mb-2">💥</span>
              <h3 className="text-xl font-black text-rose-400 mb-1">{isRtl ? 'بازی تمام شد!' : 'Game Over!'}</h3>
              <p className="text-xs text-slate-300 mb-4">{isRtl ? `امتیاز نهایی شما: ${score.toLocaleString()}` : `Final Score: ${score.toLocaleString()}`}</p>
              <button
                onClick={initGame}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                {isRtl ? 'تلاش دوباره' : 'Play Again'}
              </button>
            </motion.div>
          )}

          {/* 2048 Win Notification Banner */}
          {hasWon && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-2 left-2 right-2 p-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-bold flex items-center justify-between z-10"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-300" />
                {isRtl ? 'تبریک! به عدد ۲۰۴۸ رسیدید 🎉 (+100 XP)' : 'Congratulations! You reached 2048 🎉 (+100 XP)'}
              </span>
              <button onClick={() => setHasWon(false)} className="text-xs px-2 py-0.5 rounded bg-amber-500/30">✕</button>
            </motion.div>
          )}
        </div>

        {/* Swipe or Keys Guide */}
        <p className="text-[11px] text-[var(--text-secondary)] mt-4 text-center">
          {isRtl ? '💡 با کشیدن انگشت (Swipe) یا کلیدهای جهت‌نما کاشی‌ها را ترکیب کنید.' : '💡 Use Arrow keys or swipe to slide and merge matching numbers.'}
        </p>
      </div>
    </FullscreenWrapper>
  );
}
