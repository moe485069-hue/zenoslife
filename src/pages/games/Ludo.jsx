import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, 
  Users, Bot, Globe, MessageSquare, Send, Award, Flame, 
  Shuffle, Play, CheckCircle2, ArrowRight, Settings, Share2
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';


// 3D Dice Face Renderer with Realistic Pips & Number Overlay
const RenderDiceFace = ({ value, isRolling, size = 'lg' }) => {
  const val = Math.max(1, Math.min(6, value || 6));
  const pips = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  }[val] || [4];

  const sizeClasses = size === 'lg' ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-11 h-11';
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <motion.div
      animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [0.9, 1.1, 0.95, 1] } : { rotate: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className={`${sizeClasses} rounded-2xl bg-gradient-to-b from-[#fffbeb] via-[#fef3c7] to-[#fde68a] border-2 border-[#d97706] shadow-2xl p-2 flex flex-col justify-between items-center relative select-none shrink-0`}
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
      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-amber-900 text-amber-200 text-[10px] font-black leading-tight border border-amber-500/50 shadow-xs">
        {val}
      </span>
    </motion.div>
  );
};

// ----------------------------------------------------
// THEMES CONFIGURATION
// ----------------------------------------------------
const THEMES = {
  wood: {
    id: 'wood',
    nameFa: 'کلاسیک چوبی',
    nameEn: 'Classic Wood',
    icon: '🪵',
    boardBg: 'bg-[#3b2314] border-[#78350f]',
    innerBg: 'bg-[#2a170a]',
    safeTile: 'bg-amber-600/30 border-amber-500',
    tileBorder: 'border-[#5c3317]',
    red: { bg: 'bg-rose-600', ring: 'ring-rose-400', text: 'text-rose-400', home: 'bg-rose-950/60 border-rose-600' },
    green: { bg: 'bg-emerald-600', ring: 'ring-emerald-400', text: 'text-emerald-400', home: 'bg-emerald-950/60 border-emerald-600' },
    yellow: { bg: 'bg-amber-500', ring: 'ring-amber-300', text: 'text-amber-400', home: 'bg-amber-950/60 border-amber-500' },
    blue: { bg: 'bg-sky-600', ring: 'ring-sky-400', text: 'text-sky-400', home: 'bg-sky-950/60 border-sky-600' },
    watermark: '🪵 تخته منچ سنتی چوب گردو'
  },
  persia: {
    id: 'persia',
    nameFa: 'ایران باستان و هخامنشیان',
    nameEn: 'Ancient Persepolis',
    icon: '🏛️',
    boardBg: 'bg-[#0f2830] border-[#0284c7]',
    innerBg: 'bg-[#081820]',
    safeTile: 'bg-cyan-500/20 border-cyan-400',
    tileBorder: 'border-[#0f766e]',
    red: { bg: 'bg-gradient-to-br from-rose-500 to-red-700', ring: 'ring-rose-400', text: 'text-rose-400', home: 'bg-rose-950/70 border-rose-500' },
    green: { bg: 'bg-gradient-to-br from-teal-400 to-emerald-700', ring: 'ring-teal-300', text: 'text-teal-300', home: 'bg-teal-950/70 border-teal-500' },
    yellow: { bg: 'bg-gradient-to-br from-amber-300 to-yellow-600', ring: 'ring-yellow-300', text: 'text-yellow-400', home: 'bg-yellow-950/70 border-yellow-500' },
    blue: { bg: 'bg-gradient-to-br from-cyan-400 to-blue-700', ring: 'ring-cyan-300', text: 'text-cyan-400', home: 'bg-cyan-950/70 border-cyan-500' },
    watermark: '👑 منچ شاهانه هخامنشی • پاسارگاد'
  },
  cosmic: {
    id: 'cosmic',
    nameFa: 'کیهانی و کهکشان‌ها',
    nameEn: 'Cosmic Galaxy',
    icon: '🌌',
    boardBg: 'bg-[#07051a] border-[#8b5cf6]',
    innerBg: 'bg-[#030014]',
    safeTile: 'bg-purple-500/30 border-purple-400 shadow-[0_0_10px_#a855f7]',
    tileBorder: 'border-[#4c1d95]',
    red: { bg: 'bg-gradient-to-br from-pink-500 to-rose-600', ring: 'ring-pink-300 shadow-[0_0_10px_#ec4899]', text: 'text-pink-400', home: 'bg-pink-950/60 border-pink-500' },
    green: { bg: 'bg-gradient-to-br from-emerald-400 to-teal-600', ring: 'ring-emerald-300 shadow-[0_0_10px_#10b981]', text: 'text-emerald-400', home: 'bg-emerald-950/60 border-emerald-500' },
    yellow: { bg: 'bg-gradient-to-br from-amber-300 to-yellow-500', ring: 'ring-amber-200 shadow-[0_0_10px_#eab308]', text: 'text-amber-400', home: 'bg-amber-950/60 border-amber-500' },
    blue: { bg: 'bg-gradient-to-br from-cyan-400 to-indigo-600', ring: 'ring-cyan-300 shadow-[0_0_10px_#06b6d4]', text: 'text-cyan-400', home: 'bg-cyan-950/60 border-cyan-500' },
    watermark: '✨ منچ مدار کیهانی • ستاره قطبی'
  }
};

// Player definitions in clockwise order
const PLAYERS = [
  { id: 'red', nameFa: 'قرمز', nameEn: 'Red', startTrackIdx: 0, homeEntryIdx: 50, colorKey: 'red', emoji: '🔴' },
  { id: 'green', nameFa: 'سبز', nameEn: 'Green', startTrackIdx: 13, homeEntryIdx: 11, colorKey: 'green', emoji: '🟢' },
  { id: 'yellow', nameFa: 'زرد', nameEn: 'Yellow', startTrackIdx: 26, homeEntryIdx: 24, colorKey: 'yellow', emoji: '🟡' },
  { id: 'blue', nameFa: 'آبی', nameEn: 'Blue', startTrackIdx: 39, homeEntryIdx: 37, colorKey: 'blue', emoji: '🔵' }
];

export default function Ludo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, addXP, addCoins } = useAppStore();
  const isRtl = language === 'fa';

  // Read URL params for online direct join
  const paramRoom = searchParams.get('room');
  const paramMode = searchParams.get('mode');

  // Match Configuration & Modal State
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(!paramRoom && !paramMode);
  const [gameMode, setGameMode] = useState(paramMode || 'bot'); // 'bot' | 'local' | 'online'
  const [playerCount, setPlayerCount] = useState(4); // 2, 3, 4
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [themeId, setThemeId] = useState('persia');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Online Room & Role
  const [onlineRoomCode, setOnlineRoomCode] = useState(paramRoom || 'LUDO-888');
  const [myOnlineRole, setMyOnlineRole] = useState(paramRoom ? 'green' : 'red');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: isRtl ? 'به بازی منچ خوش آمدید! تاس ۶ بیاورید و مهره‌ها را وارد زمین کنید.' : 'Welcome to Ludo! Roll a 6 to enter pieces.', sender: 'system' }
  ]);
  const chatChannelRef = useRef(null);

  // Active Players (based on playerCount)
  const activePlayers = PLAYERS.slice(0, playerCount);

  // Pieces State: each player has 4 pieces
  const createInitialPieces = () => {
    const p = {};
    PLAYERS.forEach(pl => {
      p[pl.id] = [
        { id: 0, pos: 'base', stepCount: 0 },
        { id: 1, pos: 'base', stepCount: 0 },
        { id: 2, pos: 'base', stepCount: 0 },
        { id: 3, pos: 'base', stepCount: 0 }
      ];
    });
    return p;
  };

  const [pieces, setPieces] = useState(createInitialPieces);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [diceRoll, setDiceRoll] = useState(6);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [validPieceIds, setValidPieceIds] = useState([]);
  const [lastMessage, setLastMessage] = useState('');
  const [winners, setWinners] = useState([]);

  const currentTheme = THEMES[themeId] || THEMES.persia;
  const currentPlayer = activePlayers[currentTurnIdx] || activePlayers[0];

  const playSfx = (fn) => {
    if (soundEnabled) fn?.();
  };

  // ----------------------------------------------------
  // ONLINE BROADCAST CHANNEL SETUP
  // ----------------------------------------------------
  useEffect(() => {
    if (gameMode === 'online') {
      const channel = new BroadcastChannel(`lifeos_ludo_${onlineRoomCode}`);
      chatChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'CHAT') {
          setChatMessages(prev => [...prev, payload]);
          soundEngine.playTap?.();
        } else if (type === 'DICE_ROLLED') {
          setDiceRoll(payload.dice);
          setHasRolled(true);
          soundEngine.playLevelUp?.();
        } else if (type === 'PIECES_UPDATE') {
          setPieces(payload.pieces);
          setCurrentTurnIdx(payload.turnIdx);
          // keep last rolled dice visible
          setHasRolled(false);
          soundEngine.playCheckmark?.();
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [gameMode, onlineRoomCode]);

  // ----------------------------------------------------
  // DICE ROLLING LOGIC (BULLETPROOF & RESPONSIVE)
  // ----------------------------------------------------
  const isRollingRef = useRef(false);

  // Watchdog: physically prevents isRolling from ever staying true for > 800ms
  useEffect(() => {
    if (isRolling) {
      const watchdog = setTimeout(() => {
        setIsRolling(false);
        isRollingRef.current = false;
      }, 800);
      return () => clearTimeout(watchdog);
    }
  }, [isRolling]);

  const handleRollDice = () => {
    if (hasRolled || isRolling || isRollingRef.current) return;
    if (gameMode === 'bot' && currentTurnIdx !== 0) return;
    if (gameMode === 'online' && currentPlayer.id !== myOnlineRole) return;

    rollDiceAction();
  };

  const rollDiceAction = () => {
    if (isRollingRef.current) return;
    isRollingRef.current = true;
    setIsRolling(true);
    playSfx(soundEngine.playLevelUp);
    haptics.tap?.();

    // Roll random number immediately
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      isRollingRef.current = false;
      setIsRolling(false);
      setDiceRoll(roll);
      setHasRolled(true);

      if (gameMode === 'online' && chatChannelRef.current) {
        chatChannelRef.current.postMessage({
          type: 'DICE_ROLLED',
          payload: { dice: roll }
        });
      }

      // Evaluate movable pieces
      const valid = getMovablePieces(currentPlayer.id, roll, pieces);
      setValidPieceIds(valid);

      if (roll === 6) {
        playSfx(soundEngine.playLevelUp);
        haptics.success?.();
        setLastMessage(isRtl ? `🎉 تاس ۶ آوردی! جایزه داری و یک نوبت اضافه گرفتی.` : `🎉 Rolled a 6! You get a bonus roll.`);
      } else {
        setLastMessage(isRtl ? `تاس: ${roll}` : `Rolled: ${roll}`);
      }

      // If no pieces can move, pass turn
      if (valid.length === 0) {
        setLastMessage(isRtl ? `تاس: ${roll} — برای خروج از خانه نیاز به ۶ دارید؛ نوبت منتقل شد.` : `Rolled ${roll}. Needs a 6 to enter base.`);
        setTimeout(() => {
          passTurn();
        }, 1600);
      } else if (valid.length === 1 && (gameMode !== 'online' || currentPlayer.id === myOnlineRole)) {
        // Auto-move single piece for convenience
        setTimeout(() => {
          movePiece(currentPlayer.id, valid[0], roll);
        }, 500);
      }
    }, 350);
  };

  // ----------------------------------------------------
  // GET MOVABLE PIECES
  // ----------------------------------------------------
  const getMovablePieces = (playerId, roll, currentPieces) => {
    const playerPieces = currentPieces[playerId] || [];
    const valid = [];

    playerPieces.forEach(piece => {
      if (piece.pos === 'finished') return;

      // In base: needs a 6 to enter
      if (piece.pos === 'base') {
        if (roll === 6) valid.push(piece.id);
        return;
      }

      // On Track or Home Stretch
      const newStep = piece.stepCount + roll;
      if (newStep <= 56) { // 56 is the goal square
        valid.push(piece.id);
      }
    });

    return valid;
  };

  // ----------------------------------------------------
  // MOVE PIECE LOGIC
  // ----------------------------------------------------
  const handlePieceClick = (playerId, pieceId) => {
    if (!hasRolled || isRolling) return;
    if (playerId !== currentPlayer.id) return;
    if (!validPieceIds.includes(pieceId)) return;
    if (gameMode === 'bot' && currentTurnIdx !== 0) return;
    if (gameMode === 'online' && playerId !== myOnlineRole) return;

    movePiece(playerId, pieceId, diceRoll);
  };

  const movePiece = (playerId, pieceId, roll) => {
    const newPieces = JSON.parse(JSON.stringify(pieces));
    const piece = newPieces[playerId][pieceId];
    const playerDef = PLAYERS.find(p => p.id === playerId);
    let gaveBonusRoll = false;

    if (piece.pos === 'base') {
      // Enter the track at startTrackIdx
      piece.pos = playerDef.startTrackIdx;
      piece.stepCount = 0;
      playSfx(soundEngine.playLevelUp);
      haptics.success?.();
    } else {
      // Move along track or home stretch
      const nextStep = piece.stepCount + roll;
      piece.stepCount = nextStep;

      if (nextStep === 56) {
        // Reached Goal!
        piece.pos = 'finished';
        gaveBonusRoll = true;
        playSfx(soundEngine.playLevelUp);
        haptics.success?.();
        setLastMessage(isRtl ? `🏆 مهره بازیکن ${playerDef.nameFa} به خط پایان رسید!` : `🏆 Piece reached the finish line!`);

        // Check if player won
        const allFinished = newPieces[playerId].every(p => p.pos === 'finished');
        if (allFinished && !winners.includes(playerId)) {
          const newWinners = [...winners, playerId];
          setWinners(newWinners);
          if (newWinners.length === 1) {
            addXP?.(150, 'پیروزی در منچ');
            addCoins?.(50);
          }
        }
      } else if (nextStep > 50) {
        // In Home stretch (steps 51 to 55)
        const stretchIdx = nextStep - 51;
        piece.pos = `home-${stretchIdx}`;
        playSfx(soundEngine.playTap);
      } else {
        // On regular 52-tile track
        const newTrackPos = (playerDef.startTrackIdx + nextStep) % 52;
        piece.pos = newTrackPos;

        // Check for hitting opponent
        activePlayers.forEach(otherPlayer => {
          if (otherPlayer.id !== playerId) {
            newPieces[otherPlayer.id].forEach(otherPiece => {
              if (otherPiece.pos === newTrackPos) {
                // Hit opponent piece!
                otherPiece.pos = 'base';
                otherPiece.stepCount = 0;
                gaveBonusRoll = true;
                playSfx(soundEngine.playTrash);
                haptics.success?.();
                setLastMessage(isRtl ? `💥 مهره بازیکن ${otherPlayer.nameFa} زده شد و به خانه برگشت!` : `💥 Hit ${otherPlayer.nameEn}'s piece!`);
              }
            });
          }
        });

        playSfx(soundEngine.playTap);
      }
    }

    setPieces(newPieces);
    setValidPieceIds([]);

    // Pass turn or grant bonus roll
    if (roll === 6 || gaveBonusRoll) {
      setHasRolled(false);
      setDiceRoll(null);
      setLastMessage(isRtl ? 'نوبت دوباره شماست! تاس بیندازید.' : 'Bonus turn! Roll again.');
    } else {
      passTurn(newPieces);
    }
  };

  const passTurn = (updatedPieces = pieces) => {
    let nextIdx = (currentTurnIdx + 1) % activePlayers.length;
    let loopCount = 0;
    while (winners.includes(activePlayers[nextIdx].id) && loopCount < activePlayers.length) {
      nextIdx = (nextIdx + 1) % activePlayers.length;
      loopCount++;
    }

    setCurrentTurnIdx(nextIdx);
    setDiceRoll(null);
    setHasRolled(false);
    setValidPieceIds([]);

    if (gameMode === 'online' && chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: 'PIECES_UPDATE',
        payload: {
          pieces: updatedPieces,
          turnIdx: nextIdx
        }
      });
    }
  };

  // ----------------------------------------------------
  // SMART BOT AI TURN
  // ----------------------------------------------------
  useEffect(() => {
    if (gameMode !== 'bot' || currentTurnIdx === 0 || winners.length >= activePlayers.length - 1) return;

    if (!hasRolled && !isRollingRef.current) {
      const rollTimer = setTimeout(() => {
        if (!hasRolled && !isRollingRef.current && currentTurnIdx !== 0) {
          rollDiceAction();
        }
      }, 700);
      return () => clearTimeout(rollTimer);
    }

    if (hasRolled && validPieceIds.length > 0 && !isRollingRef.current) {
      const moveTimer = setTimeout(() => {
        if (hasRolled && validPieceIds.length > 0 && currentTurnIdx !== 0) {
          makeBotChoice();
        }
      }, 600);
      return () => clearTimeout(moveTimer);
    }
  }, [gameMode, currentTurnIdx, hasRolled, validPieceIds, winners]);

  const makeBotChoice = () => {
    const curPieces = pieces[currentPlayer.id];
    let bestPieceId = validPieceIds[0];
    let maxScore = -100;

    validPieceIds.forEach(pId => {
      const piece = curPieces[pId];
      let score = 0;
      if (piece.pos === 'base') score = 50;
      else {
        const nextStep = piece.stepCount + diceRoll;
        if (nextStep === 56) score = 100;
        else if (nextStep <= 50) {
          const targetPos = (currentPlayer.startTrackIdx + nextStep) % 52;
          const isHitting = Object.keys(pieces).some(plId => plId !== currentPlayer.id && pieces[plId].some(p => p.pos === targetPos));
          if (isHitting) score = 80;
          else score = piece.stepCount + 10;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestPieceId = pId;
      }
    });

    movePiece(currentPlayer.id, bestPieceId, diceRoll);
  };

  // ----------------------------------------------------
  // RESET / RESTART GAME
  // ----------------------------------------------------
  const handleResetGame = () => {
    setPieces(createInitialPieces());
    setCurrentTurnIdx(0);
    setDiceRoll(null);
    setHasRolled(false);
    setWinners([]);
    setValidPieceIds([]);
    setLastMessage('');
  };

  const handleStartFromSetup = (config) => {
    setGameMode(config.mode);
    setBotDifficulty(config.botDifficulty || 'medium');
    setPlayerCount(config.playerCount || 4);
    if (config.roomCode) {
      setOnlineRoomCode(config.roomCode);
      setMyOnlineRole(config.isHost ? 'red' : 'green');
    }
    handleResetGame();
    setIsSetupModalOpen(false);
  };

  const handleSendMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      text,
      sender: myOnlineRole === 'red' ? (isRtl ? 'قرمز (شما)' : 'Red (You)') : (isRtl ? 'سبز (شما)' : 'Green (You)')
    };
    setChatMessages(prev => [...prev, newMsg]);

    if (chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: 'CHAT',
        payload: newMsg
      });
    }
  };

  // ----------------------------------------------------
  // RENDER YARD (Base with 4 pieces)
  // ----------------------------------------------------
  const renderYard = (colorKey, titleFa, roundedClass) => {
    const plPieces = pieces[colorKey] || [];
    const colorStyles = currentTheme[colorKey];
    const isCurrent = currentPlayer.id === colorKey;

    return (
      <div className={`w-[38%] h-full rounded-3xl p-3 flex flex-col justify-between border-2 ${colorStyles.home} ${roundedClass} shadow-md transition-all ${isCurrent ? 'ring-2 ring-amber-400' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-white flex items-center gap-1">
            <span>{PLAYERS.find(p => p.id === colorKey)?.emoji}</span>
            <span>{isRtl ? titleFa : colorKey}</span>
          </span>
          {isCurrent && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black animate-pulse">
              نوبت
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 p-2 rounded-2xl bg-black/40 border border-white/10">
          {plPieces.map(p => {
            const inBase = p.pos === 'base';
            const isMovable = validPieceIds.includes(p.id) && isCurrent;

            return (
              <motion.button
                key={p.id}
                onClick={() => handlePieceClick(colorKey, p.id)}
                disabled={!isMovable}
                whileTap={{ scale: 0.9 }}
                className={`w-9 h-9 sm:w-11 sm:h-11 mx-auto rounded-full border-2 flex items-center justify-center font-black text-xs transition-all ${
                  inBase ? `${colorStyles.bg} text-white shadow-md` : 'bg-white/5 border-dashed border-white/20 text-slate-600'
                } ${isMovable ? 'ring-4 ring-amber-300 animate-bounce scale-110 shadow-[0_0_15px_rgba(245,158,11,0.8)] z-20 cursor-pointer' : ''}`}
              >
                {inBase ? p.id + 1 : '✓'}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 select-none">
      
      {/* ── 1. HEADER ── */}
      <div className="sticky top-0 z-30 p-3 sm:p-4 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/games')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-primary)]"
          >
            {isRtl ? <ChevronLeft size={20} className="rotate-180" /> : <ChevronLeft size={20} />}
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
              {isRtl ? 'منچ کلاسیک و آنلاین (Ludo Master)' : 'Royal Ludo Master'}
            </h1>
            <span className="text-[10px] text-slate-400">
              {gameMode === 'bot' ? '🤖 بازی با ربات' : gameMode === 'local' ? `📱 ${playerCount} نفره دورهمی` : `🌐 اتاق آنلاین: ${onlineRoomCode}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black hover:bg-amber-500/30 flex items-center gap-1"
          >
            <Settings size={13} />
            <span>{isRtl ? 'تنظیمات / بازی جدید' : 'Setup'}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* ── 2. MAIN LUDO BOARD CONTAINER ── */}
        <div className={`w-full rounded-[2.5rem] p-3 sm:p-4 border-4 transition-all duration-500 ${currentTheme.boardBg} shadow-2xl relative overflow-hidden`}>
          
          <div className="text-center py-1 text-[11px] font-black tracking-widest text-amber-400/80 border-b border-white/10 mb-2 uppercase">
            {currentTheme.watermark}
          </div>

          <div className="w-full aspect-square rounded-3xl p-2 sm:p-3 flex flex-col justify-between relative bg-black/40 border border-white/10 shadow-inner">
            
            {/* TOP ROW: Red Yard (Left), Green Stretch (Center), Green Yard (Right) */}
            <div className="w-full flex justify-between h-[38%]">
              {renderYard('red', 'قرمز', 'rounded-tl-2xl')}

              {/* Green Home Stretch (Center Top) */}
              <div className="w-[20%] h-full flex flex-col justify-between py-1 items-center">
                {[0, 1, 2, 3, 4].map(idx => (
                  <div key={idx} className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                    🟢
                  </div>
                ))}
              </div>

              {renderYard('green', 'سبز', 'rounded-tr-2xl')}
            </div>

            {/* MIDDLE ROW: Red Stretch (Left), WINNING CENTER GOAL (Center), Yellow Stretch (Right) */}
            <div className="w-full flex justify-between items-center h-[20%]">
              {/* Red Home Stretch */}
              <div className="w-[38%] flex justify-between px-1">
                {[0, 1, 2, 3, 4].map(idx => (
                  <div key={idx} className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-[10px] font-bold text-rose-300">
                    🔴
                  </div>
                ))}
              </div>

              {/* CENTER WINNING GOAL */}
              <div className="w-[20%] aspect-square rounded-2xl bg-gradient-to-br from-amber-500/25 via-purple-500/25 to-cyan-500/25 border-2 border-amber-400/60 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                <span className="text-xl sm:text-2xl animate-pulse">👑</span>
                <span className="text-[8px] font-black text-amber-300 uppercase tracking-wider">GOAL</span>
              </div>

              {/* Yellow Home Stretch */}
              <div className="w-[38%] flex justify-between px-1">
                {[0, 1, 2, 3, 4].map(idx => (
                  <div key={idx} className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-[10px] font-bold text-amber-300">
                    🟡
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM ROW: Blue Yard (Left), Blue Stretch (Center), Yellow Yard (Right) */}
            <div className="w-full flex justify-between h-[38%]">
              {playerCount >= 4 ? renderYard('blue', 'آبی', 'rounded-bl-2xl') : <div className="w-[38%] h-full opacity-20 bg-slate-900 rounded-3xl" />}

              {/* Blue Home Stretch */}
              <div className="w-[20%] h-full flex flex-col justify-between py-1 items-center">
                {[0, 1, 2, 3, 4].map(idx => (
                  <div key={idx} className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-sky-600/30 border border-sky-500/50 flex items-center justify-center text-[10px] font-bold text-sky-300">
                    🔵
                  </div>
                ))}
              </div>

              {playerCount >= 3 ? renderYard('yellow', 'زرد', 'rounded-br-2xl') : <div className="w-[38%] h-full opacity-20 bg-slate-900 rounded-3xl" />}
            </div>

          </div>

          {/* ── 3. CONTROLS & INTERACTIVE 3D DICE DASHBOARD ── */}
          <div className="mt-3 p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            
            {/* Active Turn Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentPlayer.emoji}</span>
              <div>
                <span className="text-xs font-black text-slate-100 block">
                  {isRtl ? `نوبت بازیکن ${currentPlayer.nameFa}` : `${currentPlayer.nameEn}'s Turn`}
                </span>
                <span className="text-[10px] text-slate-300">
                  {gameMode === 'bot' && currentTurnIdx !== 0 ? (isRtl ? '🤖 ربات در حال تفکر...' : 'Bot is thinking...') : (isRtl ? 'تاس بیندازید 🎲' : 'Roll to move')}
                </span>
              </div>
            </div>

            {/* Interactive 3D Dice */}
            <div className="flex items-center gap-2.5">
              <div 
                onClick={handleRollDice} 
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title={isRtl ? 'برای پرتاب تاس کلیک کنید' : 'Click to roll'}
              >
                <RenderDiceFace value={diceRoll || 6} isRolling={isRolling} size="lg" />
              </div>

              <button
                onClick={handleRollDice}
                disabled={hasRolled || isRolling || (gameMode === 'bot' && currentTurnIdx !== 0) || (gameMode === 'online' && currentPlayer.id !== myOnlineRole)}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 text-white font-black text-xs shadow-lg shadow-rose-500/20 disabled:opacity-35 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Shuffle size={14} className={isRolling ? 'animate-spin' : ''} />
                <span>{isRolling ? (isRtl ? 'در چرخش...' : 'Rolling...') : (isRtl ? 'پرتاب تاس 🎲' : 'Roll 🎲')}</span>
              </button>
            </div>

          </div>

          {/* Status Message */}
          {lastMessage && (
            <div className="mt-2 text-center py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-amber-300">
              {lastMessage}
            </div>
          )}

        </div>

      </div>

      {/* ── 4. PRE-GAME MATCH SETUP MODAL ── */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        game={{
          id: 'ludo',
          titleFa: 'منچ کلاسیک و آنلاین (Ludo Master)',
          titleEn: 'Royal Persian Ludo',
          icon: '🎯',
          path: '/games/ludo'
        }}
        onStartGame={handleStartFromSetup}
      />

      {/* ── 5. IN-GAME CHAT ROOM (ONLINE ONLY) ── */}
      {gameMode === 'online' && (
        <InGameChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          roomCode={onlineRoomCode}
          gameTitle="منچ آنلاین"
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          myRoleName={myOnlineRole === 'red' ? 'قرمز (شما)' : 'سبز (شما)'}
          isRtl={isRtl}
        />
      )}

      {/* ── 6. VICTORY MODAL ── */}
      <AnimatePresence>
        {winners.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-sm rounded-3xl p-6 border-2 border-amber-500/50 bg-slate-900 text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto text-3xl shadow-lg">
                🏆
              </div>

              <div>
                <h3 className="text-xl font-black text-amber-300">
                  {isRtl ? '🎉 بازی منچ به پایان رسید!' : '🎉 Game Over!'}
                </h3>
                <p className="text-sm text-slate-200 font-bold mt-1">
                  {isRtl ? `قهرمان مسابقه: بازیکن ${PLAYERS.find(p => p.id === winners[0])?.nameFa} ${PLAYERS.find(p => p.id === winners[0])?.emoji}` : `Champion: ${winners[0]}`}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsSetupModalOpen(true)}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-md hover:brightness-110 active:scale-95"
                >
                  {isRtl ? 'بازی مجدد 🎮' : 'Play Again'}
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="py-3 px-4 rounded-2xl bg-white/10 text-white font-bold text-xs"
                >
                  {isRtl ? 'خروج' : 'Exit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
