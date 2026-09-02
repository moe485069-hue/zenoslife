import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Volume2, VolumeX, Settings, Shuffle, Trophy } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';
import InGameReactions from '../../components/games/InGameReactions';
import ConfettiOverlay from '../../components/games/ConfettiOverlay';

// 3D Dice Face Renderer
const RenderDiceFace = ({ value, isRolling, size = 'md' }) => {
  const displayVal = value ? Math.max(1, Math.min(6, value)) : (isRolling ? 1 : null);
  const pips = displayVal ? {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  }[displayVal] || [4] : [];

  const sizeClasses = size === 'lg' ? 'w-14 h-14 sm:w-16 sm:h-16' : size === 'sm' ? 'w-9 h-9' : 'w-12 h-12 sm:w-14 sm:h-14';
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5';

  if (!displayVal && !isRolling) {
    return (
      <div className={`${sizeClasses} rounded-2xl bg-white/5 border-2 border-dashed border-rose-400/40 flex items-center justify-center text-rose-300 text-sm font-black`}>
        🎲
      </div>
    );
  }

  return (
    <motion.div
      key={isRolling ? 'ludo-dice-rolling' : `ludo-dice-${displayVal}`}
      animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [0.9, 1.1, 0.95, 1] } : { rotate: 0, scale: 1 }}
      transition={isRolling ? { duration: 0.25, repeat: Infinity, ease: 'linear' } : { duration: 0.15 }}
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
      {value && !isRolling && (
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-amber-950 text-amber-200 text-[10px] font-black leading-tight border border-amber-500/50 shadow-sm font-mono">
          {value}
        </span>
      )}
    </motion.div>
  );
};

// ----------------------------------------------------
// THEMES & PLAYERS
// ----------------------------------------------------
const PLAYERS = [
  { id: 'red', nameFa: 'قرمز (شما)', nameEn: 'Red (You)', startTrackIdx: 0, colorKey: 'red', emoji: '🔴', bg: 'from-rose-500 to-red-700', ring: 'ring-rose-400' },
  { id: 'green', nameFa: 'سبز (ربات ۱)', nameEn: 'Green', startTrackIdx: 13, colorKey: 'green', emoji: '🟢', bg: 'from-teal-400 to-emerald-700', ring: 'ring-teal-300' },
  { id: 'yellow', nameFa: 'زرد (ربات ۲)', nameEn: 'Yellow', startTrackIdx: 26, colorKey: 'yellow', emoji: '🟡', bg: 'from-amber-300 to-yellow-600', ring: 'ring-yellow-300' },
  { id: 'blue', nameFa: 'آبی (ربات ۳)', nameEn: 'Blue', startTrackIdx: 39, colorKey: 'blue', emoji: '🔵', bg: 'from-cyan-400 to-blue-700', ring: 'ring-cyan-300' }
];

// ----------------------------------------------------
// BOARD LAYOUT DEFINITIONS
// ----------------------------------------------------
const TRACK = [
  {r:13,c:6}, {r:12,c:6}, {r:11,c:6}, {r:10,c:6}, {r:9,c:6}, 
  {r:8,c:5}, {r:8,c:4}, {r:8,c:3}, {r:8,c:2}, {r:8,c:1}, {r:8,c:0}, 
  {r:7,c:0}, 
  {r:6,c:0}, {r:6,c:1}, {r:6,c:2}, {r:6,c:3}, {r:6,c:4}, {r:6,c:5}, 
  {r:5,c:6}, {r:4,c:6}, {r:3,c:6}, {r:2,c:6}, {r:1,c:6}, {r:0,c:6}, 
  {r:0,c:7}, 
  {r:0,c:8}, {r:1,c:8}, {r:2,c:8}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8}, 
  {r:6,c:9}, {r:6,c:10}, {r:6,c:11}, {r:6,c:12}, {r:6,c:13}, {r:6,c:14}, 
  {r:7,c:14}, 
  {r:8,c:14}, {r:8,c:13}, {r:8,c:12}, {r:8,c:11}, {r:8,c:10}, {r:8,c:9}, 
  {r:9,c:8}, {r:10,c:8}, {r:11,c:8}, {r:12,c:8}, {r:13,c:8}, {r:14,c:8}, 
  {r:14,c:7}, 
  {r:14,c:6} 
];

const FINISH_TRACKS = {
  red: [ {r:13,c:7}, {r:12,c:7}, {r:11,c:7}, {r:10,c:7}, {r:9,c:7} ],
  green: [ {r:7,c:1}, {r:7,c:2}, {r:7,c:3}, {r:7,c:4}, {r:7,c:5} ],
  yellow: [ {r:1,c:7}, {r:2,c:7}, {r:3,c:7}, {r:4,c:7}, {r:5,c:7} ],
  blue: [ {r:7,c:13}, {r:7,c:12}, {r:7,c:11}, {r:7,c:10}, {r:7,c:9} ]
};

const BASE_POSITIONS = {
  red: [ {r:10, c:2}, {r:10, c:4}, {r:12, c:2}, {r:12, c:4} ],
  green: [ {r:2, c:2}, {r:2, c:4}, {r:4, c:2}, {r:4, c:4} ],
  yellow: [ {r:2, c:10}, {r:2, c:12}, {r:4, c:10}, {r:4, c:12} ],
  blue: [ {r:10, c:10}, {r:10, c:12}, {r:12, c:10}, {r:12, c:12} ]
};

const BOARD_CELLS = {};
for (let r=0; r<15; r++) {
  for (let c=0; c<15; c++) {
    BOARD_CELLS[`${r}-${c}`] = { type: 'empty' };
  }
}

const setBases = (rStart, rEnd, cStart, cEnd, type) => {
  for (let r=rStart; r<=rEnd; r++) {
    for (let c=cStart; c<=cEnd; c++) {
      BOARD_CELLS[`${r}-${c}`] = { type };
    }
  }
};
setBases(9,13, 1,5, 'home_red');
setBases(1,5, 1,5, 'home_green');
setBases(1,5, 9,13, 'home_yellow');
setBases(9,13, 9,13, 'home_blue');

for (let r=6; r<=8; r++) {
  for (let c=6; c<=8; c++) {
    BOARD_CELLS[`${r}-${c}`] = { type: 'center' };
  }
}

TRACK.forEach((cell, i) => {
  const isSafe = [0, 8, 13, 21, 26, 34, 39, 47].includes(i);
  BOARD_CELLS[`${cell.r}-${cell.c}`] = { type: 'track', isSafe, idx: i };
});

Object.keys(FINISH_TRACKS).forEach(color => {
  FINISH_TRACKS[color].forEach((cell) => {
    BOARD_CELLS[`${cell.r}-${cell.c}`] = { type: `finish_${color}` };
  });
});

const getPiecePosition = (playerId, piece) => {
  if (piece.pos === 'base') {
    return BASE_POSITIONS[playerId][piece.id];
  }
  if (piece.pos === 'finished') {
    const centers = {
      red: {r: 7, c: 6},
      green: {r: 6, c: 7},
      yellow: {r: 7, c: 8},
      blue: {r: 8, c: 7}
    };
    return centers[playerId];
  }
  
  const plConfig = PLAYERS.find(p => p.id === playerId);
  if (piece.stepCount <= 50) {
    const trackIdx = (plConfig.startTrackIdx + piece.stepCount) % 52;
    return TRACK[trackIdx];
  } else {
    const finishIdx = piece.stepCount - 51;
    if (finishIdx >= 0 && finishIdx < 5) {
      return FINISH_TRACKS[playerId][finishIdx];
    }
  }
  return {r: 7, c: 7};
};

const BaseArea = ({ color, top, left }) => (
  <div 
    className={`absolute w-[33.33%] h-[33.33%] rounded-[10%] border-2 flex items-center justify-center shadow-xl
      ${color === 'red' ? 'bg-rose-950/40 border-rose-900/50' : 
        color === 'green' ? 'bg-emerald-950/40 border-emerald-900/50' :
        color === 'yellow' ? 'bg-amber-950/40 border-amber-900/50' :
        'bg-cyan-950/40 border-cyan-900/50'}`}
    style={{ top: `${top}%`, left: `${left}%` }}
  >
    <div className={`w-[65%] h-[65%] rounded-2xl bg-black/40 shadow-inner border border-white/5`} />
  </div>
);

const renderCellBackground = (cell, r, c) => {
  if (cell.type === 'track') {
    const isStart = [0, 13, 26, 39].includes(cell.idx);
    const isStar = [8, 21, 34, 47].includes(cell.idx);
    
    let bg = 'bg-slate-800/80';
    if (cell.isSafe) {
      if (cell.idx === 0) bg = 'bg-rose-500/40 border-rose-500/50';
      else if (cell.idx === 13) bg = 'bg-emerald-500/40 border-emerald-500/50';
      else if (cell.idx === 26) bg = 'bg-amber-500/40 border-amber-500/50';
      else if (cell.idx === 39) bg = 'bg-cyan-500/40 border-cyan-500/50';
      else bg = 'bg-slate-600/60 border-slate-500/50';
    } else {
      bg = 'bg-slate-900/90 border-slate-700/50';
    }
    
    return (
      <div className={`w-full h-full ${bg} border flex flex-col items-center justify-center`}>
        {isStar && <span className="text-white/30 text-[10px] leading-none">★</span>}
        {isStart && <span className="text-white/30 text-[10px] leading-none">🏠</span>}
      </div>
    );
  }
  
  if (cell.type.startsWith('finish_')) {
    const color = cell.type.split('_')[1];
    const bg = color === 'red' ? 'bg-rose-500/20 border-rose-500/30' :
               color === 'green' ? 'bg-emerald-500/20 border-emerald-500/30' :
               color === 'yellow' ? 'bg-amber-500/20 border-amber-500/30' :
               'bg-cyan-500/20 border-cyan-500/30';
    return <div className={`w-full h-full ${bg} border shadow-inner`} />;
  }

  if (cell.type.startsWith('home_')) {
    const isSpot = BASE_POSITIONS.red.some(p => p.r===r && p.c===c) ||
                   BASE_POSITIONS.green.some(p => p.r===r && p.c===c) ||
                   BASE_POSITIONS.yellow.some(p => p.r===r && p.c===c) ||
                   BASE_POSITIONS.blue.some(p => p.r===r && p.c===c);
    if (isSpot) {
      const color = cell.type.split('_')[1];
      const dotColor = color === 'red' ? 'bg-rose-950/80' :
                       color === 'green' ? 'bg-emerald-950/80' :
                       color === 'yellow' ? 'bg-amber-950/80' :
                       'bg-cyan-950/80';
      return <div className={`w-[70%] h-[70%] rounded-full ${dotColor} shadow-inner border border-white/5`} />;
    }
  }
  
  return null;
};

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------
export default function Ludo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, addXP, addCoins, recordGameResult } = useAppStore();
  const isRtl = language === 'fa';
  const gameStartTimeRef = useRef(Date.now());
  const [showConfetti, setShowConfetti] = useState(false);

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
    try {
      if (soundEnabled && fn) fn();
    } catch (_) {}
  };

  const rollIntervalRef = useRef(null);

  const rollDiceAction = () => {
    if (isRolling) return;
    setIsRolling(true);
    playSfx(soundEngine.playDiceRoll || soundEngine.playTap);
    haptics.tap?.();

    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    let rollCount = 0;
    rollIntervalRef.current = setInterval(() => {
      rollCount++;
      const tempRoll = Math.floor(Math.random() * 6) + 1;
      setDiceRoll(tempRoll);

      if (rollCount >= 5) {
        clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceRoll(roll);
        setIsRolling(false);
        setHasRolled(true);

        try {
          const currentActivePlayer = activePlayers[currentTurnIdx] || activePlayers[0];
          const valid = getMovablePieces(currentActivePlayer.id, roll, pieces);
          setValidPieceIds(valid);

          if (roll === 6) {
            playSfx(soundEngine.playLevelUp);
            haptics.success?.();
            setLastMessage(isRtl ? `🎉 تاس ۶ آوردید! مهره را حرکت دهید (نوبت جایزه).` : `🎉 Rolled a 6! Move a piece, bonus turn!`);
          } else {
            setLastMessage(isRtl ? `تاس: ${roll} — مهره چشمک‌زن را لمس کنید` : `Rolled: ${roll} — Tap a glowing piece`);
          }

          if (valid.length === 0) {
            setLastMessage(isRtl ? `تاس: ${roll} — مهره‌ای قابل حرکت نیست؛ نوبت منتقل شد.` : `Rolled ${roll}. No valid moves. Passing turn.`);
            setTimeout(() => {
              passTurn();
            }, 800);
          } else if (valid.length === 1 && currentTurnIdx === 0) {
            setTimeout(() => {
              movePiece(currentActivePlayer.id, valid[0], roll);
            }, 400);
          }
        } catch (e) {
          console.error("Error in ludo dice completion:", e);
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

  const handlePieceClick = (playerId, pieceId) => {
    if (isRolling) return;
    if (gameMode === 'bot' && currentTurnIdx !== 0) return;
    if (!hasRolled) {
      rollDiceAction();
      return;
    }
    if (playerId !== currentPlayer.id) return;
    if (!validPieceIds.includes(pieceId)) {
      setLastMessage(isRtl ? 'این مهره امکان حرکت ندارد.' : 'Cannot move this piece.');
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
    let bonusTurn = false;

    if (piece.pos === 'base') {
      if (roll === 6) {
        piece.pos = 'track';
        piece.stepCount = 0;
        playSfx(soundEngine.playLevelUp);
        haptics.success?.();
        setLastMessage(isRtl ? '🚀 مهره از خانه خارج شد!' : 'Piece entered track!');
        bonusTurn = true;
      }
    } else if (piece.pos === 'track') {
      const nextStep = piece.stepCount + roll;
      if (nextStep >= 56) {
        piece.pos = 'finished';
        piece.stepCount = 56;
        playSfx(soundEngine.playLevelUp);
        haptics.success?.();
        setLastMessage(isRtl ? '🏆 مهره به پایان رسید!' : 'Piece reached finish!');
      } else {
        piece.stepCount = nextStep;
        playSfx(soundEngine.playCheckmark);
        haptics.tap?.();

        // Capture logic
        if (nextStep <= 50) {
          const destCell = getPiecePosition(playerId, piece);
          const cellInfo = BOARD_CELLS[`${destCell.r}-${destCell.c}`];
          if (cellInfo && !cellInfo.isSafe) {
            Object.keys(newPieces).forEach(opId => {
              if (opId !== playerId) {
                const opArr = [...newPieces[opId]];
                let captured = false;
                opArr.forEach(opPiece => {
                  if (opPiece.pos === 'track') {
                    const opCell = getPiecePosition(opId, opPiece);
                    if (opCell.r === destCell.r && opCell.c === destCell.c) {
                      opPiece.pos = 'base';
                      opPiece.stepCount = 0;
                      captured = true;
                    }
                  }
                });
                if (captured) {
                  newPieces[opId] = opArr;
                  bonusTurn = true;
                  setLastMessage(isRtl ? '⚔️ مهره حریف را زدی! نوبت جایزه.' : '⚔️ Captured! Bonus turn.');
                  playSfx(soundEngine.playError);
                  haptics.heavy?.();
                }
              }
            });
          }
        }
      }
    }

    playerArr[pIdx] = piece;
    newPieces[playerId] = playerArr;
    setPieces(newPieces);
    setValidPieceIds([]);

    const finishedCount = playerArr.filter(p => p.pos === 'finished').length;
    if (finishedCount === 4) {
      setWinner(currentPlayer);
      playSfx(soundEngine.playLevelUp);
      haptics.success?.();
      const isPlayerWin = currentTurnIdx === 0;
      if (isPlayerWin) {
        setShowConfetti(true);
        addXP?.(200, 'پیروزی در بازی منچ');
        addCoins?.(50);
      }
      recordGameResult?.({
        gameId: 'ludo',
        gameName: isRtl ? 'منچ کلاسیک' : 'Classic Ludo',
        gameIcon: '🎯',
        won: isPlayerWin,
        opponent: gameMode === 'bot' ? (isRtl ? '🤖 ربات‌ها' : '🤖 AI Bots') : (isRtl ? 'بازیکنان آنلاین' : 'Online Players'),
        durationMs: Date.now() - gameStartTimeRef.current,
        coinsEarned: isPlayerWin ? 50 : 0
      });
      return;
    }

    if (roll === 6 || bonusTurn) {
      setHasRolled(false);
      setDiceRoll(null);
      if (!bonusTurn) {
        setLastMessage(isRtl ? '🎉 تاس ۶! یک بار دیگر تاس بریزید.' : 'Rolled 6! Roll again!');
      }
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

  // Bot automation
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
      
      {/* Header */}
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
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black flex items-center gap-1"
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

      <div className="max-w-lg mx-auto p-3 sm:p-4 space-y-4">
        
        {/* Turn Players Bar */}
        <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          {activePlayers.map((pl, idx) => {
            const isTurn = idx === currentTurnIdx;
            const pArr = pieces[pl.id] || [];
            const inFinished = pArr.filter(p => p.pos === 'finished').length;

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

        {/* Visual Ludo Board */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-2xl shadow-2xl p-2 border-4 border-slate-900 overflow-hidden">
          <div className="relative w-full h-full">
            {/* 4 bases background */}
            <BaseArea color="green" top={6.66} left={6.66} />
            <BaseArea color="yellow" top={6.66} left={60} />
            <BaseArea color="red" top={60} left={6.66} />
            <BaseArea color="blue" top={60} left={60} />

            {/* Center background */}
            <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-gradient-to-br from-rose-500/20 via-slate-800 to-cyan-500/20 flex flex-col items-center justify-center border border-white/10 rounded-xl shadow-inner z-0">
               <span className="text-3xl mb-1 opacity-80 drop-shadow-lg">👑</span>
            </div>

            {/* Grid Map */}
            <div className="relative w-full h-full grid grid-cols-[repeat(15,minmax(0,1fr))] grid-rows-[repeat(15,minmax(0,1fr))] gap-0 z-10">
              {Array.from({length: 225}).map((_, i) => {
                const r = Math.floor(i / 15);
                const c = i % 15;
                const cell = BOARD_CELLS[`${r}-${c}`];
                return (
                  <div key={i} className="relative flex items-center justify-center">
                    {renderCellBackground(cell, r, c)}
                  </div>
                );
              })}
            </div>

            {/* Pieces Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="w-full h-full grid grid-cols-[repeat(15,minmax(0,1fr))] grid-rows-[repeat(15,minmax(0,1fr))]">
                {Array.from({length: 225}).map((_, i) => {
                  const r = Math.floor(i / 15);
                  const c = i % 15;
                  
                  const piecesAtCell = [];
                  PLAYERS.forEach(pl => {
                    const pArr = pieces[pl.id] || [];
                    pArr.forEach(p => {
                      const pos = getPiecePosition(pl.id, p);
                      if (pos.r === r && pos.c === c) {
                        piecesAtCell.push({ ...p, playerId: pl.id });
                      }
                    });
                  });

                  if (piecesAtCell.length === 0) return <div key={`empty-${i}`} />;

                  return (
                    <div key={`pieces-${i}`} className="relative flex items-center justify-center pointer-events-auto">
                      {piecesAtCell.map((p, idx) => {
                        const isTurn = p.playerId === currentPlayer.id;
                        const isMovable = isTurn && validPieceIds.includes(p.id) && hasRolled && !isRolling;
                        const plConfig = PLAYERS.find(pl => pl.id === p.playerId);
                        const isFinished = p.pos === 'finished';

                        return (
                          <motion.button
                            key={`${p.playerId}-${p.id}`}
                            whileHover={isMovable ? { scale: 1.2 } : {}}
                            whileTap={isMovable ? { scale: 0.9 } : {}}
                            onClick={() => isMovable && handlePieceClick(p.playerId, p.id)}
                            className={`absolute w-[75%] h-[75%] rounded-full shadow-lg border-2 flex items-center justify-center z-10 
                              ${isMovable ? 'ring-2 ring-white animate-bounce cursor-pointer' : 'cursor-default'}
                              bg-gradient-to-br ${plConfig.bg} border-white/60`}
                            style={{
                              transform: piecesAtCell.length > 1 && !isFinished
                                ? `translate(${(idx - (piecesAtCell.length-1)/2) * 5}px, ${(idx - (piecesAtCell.length-1)/2) * 5}px) scale(0.8)` 
                                : isFinished 
                                ? `translate(${(idx % 2 === 0 ? -5 : 5)}px, ${idx > 1 ? 5 : -5}px) scale(0.7)` 
                                : 'scale(1)',
                              zIndex: 10 + idx
                            }}
                          >
                            <div className="w-1/2 h-1/2 rounded-full bg-white/20"></div>
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Controls & Dice Box */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{currentPlayer.emoji}</span>
              <span>{currentPlayer.nameFa}</span>
            </div>
            {lastMessage && (
              <div className="text-[10px] font-bold text-amber-300 max-w-[160px] truncate">
                {lastMessage}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={handleRollDice}
              className={`flex items-center gap-2 cursor-pointer p-1 rounded-2xl hover:bg-white/5 ${
                !hasRolled && !isRolling && currentTurnIdx === 0 ? 'ring-2 ring-amber-400 animate-pulse' : ''
              }`}
            >
              <RenderDiceFace value={diceRoll} isRolling={isRolling} size="md" />
            </div>

            {hasRolled && validPieceIds.length > 0 ? (
              <span className="px-3 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs animate-pulse text-center">
                حرکت مهره 👉
              </span>
            ) : (
              <button
                onClick={handleRollDice}
                disabled={isRolling || (gameMode === 'bot' && currentTurnIdx !== 0)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-xs shadow-xl shadow-rose-500/30 active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
              >
                <Shuffle size={14} className={isRolling ? 'animate-spin' : ''} />
                <span>{isRolling ? '...' : 'تاس 🎲'}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      <InGameReactions />

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a0b2e] to-[#0a0312] border-2 border-amber-400 p-6 text-center shadow-2xl space-y-4">
            <Trophy className="text-amber-400 mx-auto animate-bounce" size={48} />
            <h2 className="text-xl font-black text-white">
              {winner.id === 'red' 
                ? (isRtl ? '🎉 تبریک! شما برنده شدید!' : '🎉 Congratulations! You won!') 
                : (isRtl ? `بازیکن ${winner.nameFa} برنده شد!` : `Player ${winner.nameEn} won!`)}
            </h2>
            <p className="text-xs text-slate-300">
              {winner.id === 'red'
                ? (isRtl ? '+۵۰ سکه و +۲۰۰ امتیاز تجربه به کارنامه شما افزوده شد! 🪙' : '+50 Coins and +200 XP added to your stats! 🪙')
                : (isRtl ? 'بازی تمام شد. برای دور بعدی شانس خود را امتحان کنید!' : 'Game over. Try your luck in the next round!')}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setPieces(createInitialPieces());
                  setCurrentTurnIdx(0);
                  setDiceRoll(null);
                  setHasRolled(false);
                  setWinner(null);
                  setShowConfetti(false);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg active:scale-95"
              >
                {isRtl ? '🔄 بازی مجدد' : 'Play Again'}
              </button>
              <button
                onClick={() => navigate('/games')}
                className="px-5 py-3.5 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20"
              >
                {isRtl ? 'خروج' : 'Exit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confetti Celebration */}
      <ConfettiOverlay active={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Setup Modal */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        titleFa="تنظیمات منچ کلاسیک"
        onStartMatch={({ mode }) => {
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
