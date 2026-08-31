import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Trophy, Users, Bot, Dice5, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

// Snakes and Ladders mapping (1-100)
const LADDERS = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 };
const SNAKES = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 };

const PLAYER_COLORS = [
  { name: 'قرمز', bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-400', hex: '#f43f5e' },
  { name: 'آبی', bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-400', hex: '#0ea5e9' },
  { name: 'سبز', bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400', hex: '#10b981' },
  { name: 'زرد', bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400', hex: '#f59e0b' }
];

export default function SnakesAndLadders() {
  const navigate = useNavigate();
  const { coins, addCoins, addXp } = useAppStore();

  const [playerCount, setPlayerCount] = useState(2); // 2, 3, or 4
  const [gameMode, setGameMode] = useState('bot'); // 'bot' or 'pass_and_play'
  const [positions, setPositions] = useState([1, 1, 1, 1]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState(null);
  const [logMessage, setLogMessage] = useState('برای شروع بازی تاس بیندازید!');

  // Reset Game
  const resetGame = (count = playerCount, mode = gameMode) => {
    setPlayerCount(count);
    setGameMode(mode);
    setPositions([1, 1, 1, 1]);
    setCurrentTurn(0);
    setDiceValue(1);
    setIsRolling(false);
    setWinner(null);
    setLogMessage('بازی جدید آغاز شد!');
  };

  // Roll Dice
  const rollDice = () => {
    if (isRolling || winner !== null) return;

    setIsRolling(true);
    soundEngine.playDiceRoll?.();
    haptics.impact?.('medium');

    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setDiceValue(roll);
      setIsRolling(false);
      movePlayer(currentTurn, roll);
    }, 600);
  };

  // Move Logic
  const movePlayer = (playerIdx, steps) => {
    setPositions(prev => {
      const next = [...prev];
      let target = next[playerIdx] + steps;

      if (target > 100) {
        setLogMessage(`بازیکن ${PLAYER_COLORS[playerIdx].name} باید دقیقاً ۱۰۰ بیاورد!`);
        passTurn();
        return prev;
      }

      // Check ladder
      if (LADDERS[target]) {
        soundEngine.playSuccess?.();
        haptics.success?.();
        setLogMessage(`🚀 نردبان! ${PLAYER_COLORS[playerIdx].name} از ${target} به ${LADDERS[target]} پرواز کرد!`);
        target = LADDERS[target];
      }
      // Check snake
      else if (SNAKES[target]) {
        soundEngine.playError?.();
        haptics.warning?.();
        setLogMessage(`🐍 نیش مار! ${PLAYER_COLORS[playerIdx].name} از ${target} به ${SNAKES[target]} سقوط کرد!`);
        target = SNAKES[target];
      } else {
        setLogMessage(`بازیکن ${PLAYER_COLORS[playerIdx].name} به خانه ${target} رفت.`);
      }

      next[playerIdx] = target;

      if (target === 100) {
        setWinner(playerIdx);
        soundEngine.playWin?.();
        if (playerIdx === 0) {
          addCoins(100);
          addXp(50);
        }
      } else {
        // Six bonus roll rule
        if (steps !== 6) {
          passTurn();
        } else {
          setLogMessage(msg => msg + ' 🎲 جایزه ۶: دوباره تاس بیندازید!');
        }
      }

      return next;
    });
  };

  const passTurn = () => {
    setCurrentTurn(prev => (prev + 1) % playerCount);
  };

  // Bot Turn Automation
  useEffect(() => {
    if (winner !== null || isRolling) return;

    if (gameMode === 'bot' && currentTurn !== 0) {
      const timer = setTimeout(() => {
        rollDice();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, winner, isRolling]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f051d] via-[#160b29] to-[#0a0314] text-white p-4 flex flex-col items-center justify-between font-sans select-none">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-3">
        <button
          onClick={() => navigate('/games')}
          className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">🐍🪜</span>
          <h1 className="text-lg font-black text-amber-300">مار و پله رویال</h1>
        </div>

        <button
          onClick={() => resetGame()}
          className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Mode & Player Count Selectors */}
      <div className="w-full max-w-md flex items-center justify-between gap-2 mb-3 bg-white/5 p-2 rounded-2xl border border-purple-500/20">
        <div className="flex gap-1">
          <button
            onClick={() => resetGame(playerCount, 'bot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${gameMode === 'bot' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Bot size={14} /> با ربات
          </button>
          <button
            onClick={() => resetGame(playerCount, 'pass_and_play')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${gameMode === 'pass_and_play' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Users size={14} /> چندنفره
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 ml-1">تعداد:</span>
          {[2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => resetGame(num, gameMode)}
              className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${playerCount === num ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-slate-300'}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Board 10x10 Grid Visual */}
      <div className="relative w-full max-w-md aspect-square bg-[#120724] border-2 border-purple-500/40 rounded-3xl p-2 shadow-2xl overflow-hidden grid grid-cols-10 grid-rows-10 gap-0.5">
        {Array.from({ length: 100 }, (_, i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
          const displayNum = (9 - row) % 2 === 1 ? (9 - row) * 10 + (10 - col) : (9 - row) * 10 + (col + 1);

          const isLadderStart = LADDERS[displayNum];
          const isSnakeStart = SNAKES[displayNum];

          return (
            <div
              key={displayNum}
              className={`relative flex items-center justify-center rounded-md text-[9px] font-bold ${(row + col) % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}
            >
              <span className="opacity-40">{displayNum}</span>

              {isLadderStart && <span className="absolute text-[10px]">🪜</span>}
              {isSnakeStart && <span className="absolute text-[10px]">🐍</span>}

              {/* Player Tokens */}
              <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                {positions.slice(0, playerCount).map((pos, pIdx) => {
                  if (pos === displayNum) {
                    return (
                      <motion.div
                        key={pIdx}
                        layoutId={`player-${pIdx}`}
                        className={`w-3 h-3 rounded-full ${PLAYER_COLORS[pIdx].bg} border border-white shadow-md`}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Log */}
      <div className="w-full max-w-md my-2 p-2 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center text-xs text-amber-200 font-medium">
        {logMessage}
      </div>

      {/* Player Turn Bar & Dice Roll Area */}
      <div className="w-full max-w-md bg-white/5 border border-purple-500/30 rounded-3xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-2xl ${PLAYER_COLORS[currentTurn].bg} flex items-center justify-center font-black text-white text-lg shadow-lg`}>
            {currentTurn === 0 ? 'شما' : (gameMode === 'bot' ? `P${currentTurn + 1} 🤖` : `P${currentTurn + 1}`)}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold">نوبت بازیکن:</div>
            <div className={`text-sm font-black ${PLAYER_COLORS[currentTurn].text}`}>
              {PLAYER_COLORS[currentTurn].name} (خانه {positions[currentTurn]})
            </div>
          </div>
        </div>

        {/* Dice Button */}
        <button
          onClick={rollDice}
          disabled={isRolling || (gameMode === 'bot' && currentTurn !== 0) || winner !== null}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-base shadow-lg shadow-orange-500/30 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-2"
        >
          <motion.span
            animate={isRolling ? { rotate: [0, 90, 180, 270, 360] } : {}}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="text-2xl"
          >
            {diceValue === 1 && '⚀'}
            {diceValue === 2 && '⚁'}
            {diceValue === 3 && '⚂'}
            {diceValue === 4 && '⚃'}
            {diceValue === 5 && '⚄'}
            {diceValue === 6 && '⚅'}
          </motion.span>
          <span>{isRolling ? '...' : 'تاس بریز'}</span>
        </button>
      </div>

      {/* Win Modal */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a0b2e] to-[#0a0312] border-2 border-amber-400 p-6 text-center shadow-2xl">
            <Trophy className="text-amber-400 mx-auto mb-3" size={48} />
            <h2 className="text-2xl font-black text-white mb-2">🎉 بازیکن {PLAYER_COLORS[winner].name} برنده شد!</h2>
            <p className="text-sm text-slate-300 mb-6">
              {winner === 0 ? '+۱۰۰ سکه جایزه پیروزی به کیف پول شما اضافه شد! 🪙' : 'بازی تمام شد. دوباره شانس خود را امتحان کنید!'}
            </p>
            <button
              onClick={() => resetGame()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-base shadow-lg"
            >
              🔄 بازی مجدد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
