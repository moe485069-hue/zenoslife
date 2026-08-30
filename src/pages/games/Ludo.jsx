import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, 
  Users, Bot, Globe, Shield, MessageSquare, Send, Award, Flame, 
  HelpCircle, Settings, ArrowRight, CheckCircle2, Shuffle, Play, Share2
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';
import InGameReactions from '../../components/games/InGameReactions';

// 3D Dice Face Renderer
const RenderDiceFace = ({ value, isRolling, size = 'md' }) => {
  const val = value ? Math.max(1, Math.min(6, value)) : null;
  const pips = val ? {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  }[val] || [4] : [];

  const sizeClasses = size === 'lg' ? 'w-14 h-14 sm:w-16 sm:h-16' : size === 'sm' ? 'w-9 h-9' : 'w-12 h-12 sm:w-14 sm:h-14';
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5';

  if (!val && !isRolling) {
    return (
      <div className={`${sizeClasses} rounded-2xl bg-white/5 border-2 border-dashed border-rose-400/40 flex items-center justify-center text-rose-300 text-sm font-black`}>
        🎲
      </div>
    );
  }

  return (
    <motion.div
      animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [0.9, 1.1, 0.95, 1] } : { rotate: 0, scale: 1 }}
      transition={{ duration: 0.25, repeat: isRolling ? Infinity : 0 }}
      className={`${sizeClasses} rounded-2xl bg-gradient-to-b from-[#fffbeb] via-[#fef3c7] to-[#fde68a] border-2 border-[#d97706] shadow-xl p-1.5 flex flex-col justify-between items-center relative select-none shrink-0`}
    >
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 items-center justify-items-center">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
          <div key={idx} className="w-full h-full flex items-center justify-center">
            {pips.includes(idx) && (
              <span className={`${dotSize} rounded-full bg-[#78350f] shadow-inner`} />
            )}
          </div>
        ))}
      </div>
      {val && (
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-amber-950 text-amber-200 text-[10px] font-black leading-tight border border-amber-500/50 shadow-sm font-mono">
          {val}
        </span>
      )}
    </motion.div>
  );
};

// ----------------------------------------------------
// THEMES & PLAYERS
// ----------------------------------------------------
const PLAYERS = [
  { id: 'red', nameFa: 'قرمز (شما)', nameEn: 'Red (You)', startTrackIdx: 0, homeEntryIdx: 50, colorKey: 'red', emoji: '🔴', bg: 'from-rose-500 to-red-700', ring: 'ring-rose-400' },
  { id: 'green', nameFa: 'سبز (ربات ۱)', nameEn: 'Green', startTrackIdx: 13, homeEntryIdx: 11, colorKey: 'green', emoji: '🟢', bg: 'from-teal-400 to-emerald-700', ring: 'ring-teal-300' },
  { id: 'yellow', nameFa: 'زرد (ربات ۲)', nameEn: 'Yellow', startTrackIdx: 26, homeEntryIdx: 24, colorKey: 'yellow', emoji: '🟡', bg: 'from-amber-300 to-yellow-600', ring: 'ring-yellow-300' },
  { id: 'blue', nameFa: 'آبی (ربات ۳)', nameEn: 'Blue', startTrackIdx: 39, homeEntryIdx: 37, colorKey: 'blue', emoji: '🔵', bg: 'from-cyan-400 to-blue-700', ring: 'ring-cyan-300' }
];

export default function Ludo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, addXP, addCoins } = useAppStore();
  const isRtl = language === 'fa';

  const paramRoom = searchParams.get('room');
  const paramMode = searchParams.get('mode');

  // Match Config
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(!paramRoom && !paramMode);
  const [gameMode, setGameMode] = useState(paramMode || 'bot');
  const [playerCount, setPlayerCount] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Players
  const activePlayers = PLAYERS.slice(0, playerCount);

  // Pieces State
  const createInitialPieces = () => ({
    red: [{ id: 0, pos: 'base', stepCount: 0 }, { id: 1, pos: 'base', stepCount: 0 }, { id: 2, pos: 'base', stepCount: 0 }, { id: 3, pos: 'base', stepCount: 0 }],
    green: [{ id: 0, pos: 'base', stepCount: 0 }, { id: 1, pos: 'base', stepCount: 0 }, { id: 2, pos: 'base', stepCount: 0 }, { id: 3, pos: 'base', stepCount: 0 }],
    yellow: [{ id: 0, pos: 'base', stepCount: 0 }, { id: 1, pos: 'base', stepCount: 0 }, { id: 2, pos: 'base', stepCount: 0 }, { id: 3, pos: 'base', stepCount: 0 }],
    blue: [{ id: 0, pos: 'base', stepCount: 0 }, { id: 1, pos: 'base', stepCount: 0 }, { id: 2, pos: 'base', stepCount: 0 }, { id: 3, pos: 'base', stepCount: 0 }]
  });

  const [pieces, setPieces] = useState(createInitialPieces);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [diceRoll, setDiceRoll] = useState(null);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [validPieceIds, setValidPieceIds] = useState([]);
  const [winner, setWinner] = useState(null);
  const [lastMessage, setLastMessage] = useState('🎲 برای شروع بازی، دکمه پرتاب تاس را بزنید');

  const currentPlayer = activePlayers[currentTurnIdx] || activePlayers[0];

  const playSfx = (fn) => {
    if (soundEnabled) fn?.();
  };

  // ----------------------------------------------------
  // DICE ROLLING WITH REAL TIME ANIMATION
  // ----------------------------------------------------
  const rollDiceAction = () => {
    if (isRolling) return;
    setIsRolling(true);
    playSfx(soundEngine.playLevelUp);
    haptics.tap?.();

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 6) {
        clearInterval(interval);
        const roll = Math.floor(Math.random() * 6) + 1;
        setIsRolling(false);
        setDiceRoll(roll);
        setHasRolled(true);

        const valid = getMovablePieces(currentPlayer.id, roll, pieces);
        setValidPieceIds(valid);

        if (roll === 6) {
          playSfx(soundEngine.playLevelUp);
          haptics.success?.();
          setLastMessage(isRtl ? `🎉 تاس ۶ آوردی! مهره را وارد زمین کن و یک نوبت اضافه داری.` : `🎉 Rolled a 6! Enter a piece or move, and bonus turn!`);
        } else {
          setLastMessage(isRtl ? `تاس: ${roll} — مهره چشمک‌زن را برای حرکت لمس کنید` : `Rolled: ${roll} — Tap a glowing piece`);
        }

        if (valid.length === 0) {
          setLastMessage(isRtl ? `تاس: ${roll} — مهره‌ها در خانه هستند و برای خروج نیاز به ۶ دارید؛ نوبت منتقل شد.` : `Rolled ${roll}. Needs 6 to exit base. Passing turn.`);
          setTimeout(() => {
            passTurn();
          }, 1500);
        } else if (valid.length === 1 && currentTurnIdx === 0) {
          // Auto move single option for convenience
          setTimeout(() => {
            movePiece(currentPlayer.id, valid[0], roll);
          }, 500);
        }
      }
    }, 60);
  };

  const handleRollDice = () => {
    if (isRolling) return;
    if (hasRolled && validPieceIds.length > 0) {
      setLastMessage(isRtl ? '👈 لطفاً یکی از مهره‌های چشمک‌زن خود را لمس کنید' : 'Tap a glowing piece to move');
      return;
    }
    if (gameMode === 'bot' && currentTurnIdx !== 0) return;

    rollDiceAction();
  };

  // ----------------------------------------------------
  // MOVABLE PIECES EVALUATION
  // ----------------------------------------------------
  const getMovablePieces = (playerId, roll, currentPieces) => {
    const playerPieces = currentPieces[playerId] || [];
    const valid = [];

    playerPieces.forEach(piece => {
      if (piece.pos === 'finished') return;

      if (piece.pos === 'base') {
        if (roll === 6) valid.push(piece.id);
        return;
      }

      const newStep = piece.stepCount + roll;
      if (newStep <= 56) {
        valid.push(piece.id);
      }
    });

    return valid;
  };

  // ----------------------------------------------------
  // PIECE MOVEMENT
  // ----------------------------------------------------
  const handlePieceClick = (playerId, pieceId) => {
    if (isRolling) return;
    if (gameMode === 'bot' && currentTurnIdx !== 0) return;

    if (!hasRolled) {
      rollDiceAction();
      return;
    }

    if (playerId !== currentPlayer.id) return;
    if (!validPieceIds.includes(pieceId)) {
      setLastMessage(isRtl ? 'این مهره با تاس فعلی امکان حرکت ندارد.' : 'Cannot move this piece with current roll.');
      return;
    }

    movePiece(playerId, pieceId, diceRoll);
  };

  const movePiece = (playerId, pieceId, roll) => {
    const newPieces = { ...pieces };
    const playerArr = [...newPieces[playerId]];
    const pIdx = playerArr.findIndex(p => p.id === pieceId);
    if (pIdx === -1) return;

    const piece = { ...playerArr[pIdx] };

    if (piece.pos === 'base') {
      if (roll === 6) {
        piece.pos = 'track';
        piece.stepCount = 0;
        playSfx(soundEngine.playLevelUp);
        haptics.success?.();
        setLastMessage(isRtl ? '🚀 مهره از خانه خارج شد و وارد زمین مسابقه شد!' : 'Piece entered track!');
      }
    } else if (piece.pos === 'track') {
      const nextStep = piece.stepCount + roll;
      if (nextStep >= 56) {
        piece.pos = 'finished';
        piece.stepCount = 56;
        playSfx(soundEngine.playLevelUp);
        haptics.success?.();
        setLastMessage(isRtl ? '🏆 یکی از مهره‌ها به خط پایان رسید!' : 'Piece reached finish!');
      } else {
        piece.stepCount = nextStep;
        playSfx(soundEngine.playCheckmark);
        haptics.tap?.();
      }
    }

    playerArr[pIdx] = piece;
    newPieces[playerId] = playerArr;
    setPieces(newPieces);
    setValidPieceIds([]);

    // Check Win
    const finishedCount = playerArr.filter(p => p.pos === 'finished').length;
    if (finishedCount === 4) {
      setWinner(currentPlayer);
      playSfx(soundEngine.playLevelUp);
      haptics.success?.();
      addXP?.(200, 'پیروزی در بازی منچ');
      addCoins?.(50);
      return;
    }

    // 6 gets extra turn!
    if (roll === 6) {
      setHasRolled(false);
      setDiceRoll(null);
      setLastMessage(isRtl ? '🎉 به دلیل آوردن ۶، یک بار دیگر تاس بریزید!' : 'Rolled 6! Roll again!');
    } else {
      passTurn();
    }
  };

  const passTurn = () => {
    setHasRolled(false);
    setDiceRoll(null);
    setValidPieceIds([]);
    const nextIdx = (currentTurnIdx + 1) % activePlayers.length;
    setCurrentTurnIdx(nextIdx);

    const nextP = activePlayers[nextIdx];
    if (nextIdx === 0) {
      setLastMessage(isRtl ? 'نوبت شماست! دکمه پرتاب تاس را بزنید 🎲' : 'Your turn! Roll the dice 🎲');
    } else {
      setLastMessage(isRtl ? `نوبت ${nextP.nameFa}...` : `${nextP.nameEn}'s turn...`);
    }
  };

  // ----------------------------------------------------
  // BOT AUTOMATION
  // ----------------------------------------------------
  useEffect(() => {
    if (gameMode !== 'bot' || currentTurnIdx === 0 || winner) return;

    if (!hasRolled && !isRolling) {
      const rollTimer = setTimeout(() => {
        if (!hasRolled && !isRolling && currentTurnIdx !== 0) {
          rollDiceAction();
        }
      }, 700);
      return () => clearTimeout(rollTimer);
    }

    if (hasRolled && validPieceIds.length > 0 && !isRolling) {
      const moveTimer = setTimeout(() => {
        if (hasRolled && validPieceIds.length > 0 && currentTurnIdx !== 0) {
          // Bot prefers to exit base on 6 or move furthest piece
          const pArr = pieces[currentPlayer.id] || [];
          const baseP = validPieceIds.find(id => pArr.find(p => p.id === id)?.pos === 'base');
          const chosenId = baseP !== undefined ? baseP : validPieceIds[0];
          movePiece(currentPlayer.id, chosenId, diceRoll);
        }
      }, 700);
      return () => clearTimeout(moveTimer);
    }
  }, [gameMode, currentTurnIdx, hasRolled, isRolling, validPieceIds, winner]);

  return (
    <div className="min-h-screen bg-[#050711] text-white pb-24 select-none font-sans" dir="rtl">
      
      {/* 1. Header */}
      <div className="sticky top-0 z-30 p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/games')}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-400">
              🎯 منچ کلاسیک و آنلاین
            </h1>
            <span className="text-[10px] text-slate-400 block">
              {gameMode === 'bot' ? '🤖 بازی با ربات‌ها' : '📱 بازی دورهمی'} · {playerCount} نفره
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black"
          >
            <Settings size={13} />
            <span>تنظیمات</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-3 sm:p-4 space-y-3">
        
        {/* 2. Turn Players Bar */}
        <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          {activePlayers.map((pl, idx) => {
            const isTurn = idx === currentTurnIdx;
            const pArr = pieces[pl.id] || [];
            const inFinished = pArr.filter(p => p.pos === 'finished').length;
            const inTrack = pArr.filter(p => p.pos === 'track').length;

            return (
              <div
                key={pl.id}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isTurn ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400 shadow-md scale-105' : 'border-white/5 bg-white/5 opacity-70'
                }`}
              >
                <div className="text-base">{pl.emoji}</div>
                <div className="text-[10px] font-black truncate text-white">{pl.nameFa.split(' ')[0]}</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {inFinished}/4 پایان
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Visual Ludo Board & Base Areas */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {activePlayers.map(pl => {
              const pArr = pieces[pl.id] || [];
              const isTurn = pl.id === currentPlayer.id;

              return (
                <div
                  key={pl.id}
                  className={`p-3 rounded-2xl border bg-black/40 ${isTurn ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-white/10'} space-y-2`}
                >
                  <div className="flex items-center justify-between text-xs font-black text-white">
                    <span className="flex items-center gap-1">{pl.emoji} {pl.nameFa}</span>
                    {isTurn && <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-black">نوبت</span>}
                  </div>

                  {/* 4 Checkers in Base / Active */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {pArr.map(piece => {
                      const isMovable = isTurn && validPieceIds.includes(piece.id);
                      const isBase = piece.pos === 'base';
                      const isFinished = piece.pos === 'finished';

                      return (
                        <motion.button
                          key={piece.id}
                          whileHover={isMovable ? { scale: 1.15 } : {}}
                          whileTap={isMovable ? { scale: 0.9 } : {}}
                          onClick={() => handlePieceClick(pl.id, piece.id)}
                          className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center font-black text-[10px] transition-all relative ${
                            isFinished
                              ? 'bg-emerald-500 border-emerald-300 text-white shadow-md'
                              : isBase
                              ? `bg-slate-800 border-white/20 text-slate-400 ${isMovable ? 'ring-4 ring-amber-400 border-amber-300 text-amber-200 bg-amber-950 animate-bounce' : ''}`
                              : `bg-gradient-to-br ${pl.bg} border-white text-white shadow-lg ${isMovable ? 'ring-4 ring-amber-300 animate-pulse' : ''}`
                          }`}
                        >
                          <span>{isFinished ? '🏁' : isBase ? '🏠' : '⚡'}</span>
                          <span className="font-mono text-[9px]">{isFinished ? 'تمام' : isBase ? 'خانه' : `${piece.stepCount}خ`}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Controls & Dice Box */}
          <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2">
              <div className="text-xs font-black text-white">
                {currentPlayer.emoji} {currentPlayer.nameFa}
              </div>
            </div>

            {/* Interactive Dice */}
            <div
              onClick={handleRollDice}
              className={`flex items-center gap-2 cursor-pointer p-1 rounded-2xl hover:bg-white/5 ${
                !hasRolled && !isRolling && currentTurnIdx === 0 ? 'ring-2 ring-amber-400 animate-pulse' : ''
              }`}
            >
              <RenderDiceFace value={diceRoll} isRolling={isRolling} size="md" />
            </div>

            {/* Roll Action Button */}
            {hasRolled && validPieceIds.length > 0 ? (
              <span className="px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs animate-pulse">
                مهره را لمس کنید 👉
              </span>
            ) : (
              <button
                onClick={handleRollDice}
                disabled={isRolling || (gameMode === 'bot' && currentTurnIdx !== 0)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-xs shadow-xl shadow-rose-500/30 active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
              >
                <Shuffle size={14} className={isRolling ? 'animate-spin' : ''} />
                <span>{isRolling ? 'در چرخش...' : 'پرتاب تاس 🎲'}</span>
              </button>
            )}
          </div>

          {/* Status Alert */}
          {lastMessage && (
            <div className="text-center py-2 px-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-amber-300">
              {lastMessage}
            </div>
          )}
        </div>

      </div>

      <InGameReactions />

      {/* Setup Modal */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        titleFa="تنظیمات منچ کلاسیک"
        onStartMatch={({ mode, difficulty }) => {
          setGameMode(mode);
          setPieces(createInitialPieces());
          setCurrentTurnIdx(0);
          setDiceRoll(null);
          setHasRolled(false);
          setWinner(null);
        }}
      />

    </div>
  );
}
