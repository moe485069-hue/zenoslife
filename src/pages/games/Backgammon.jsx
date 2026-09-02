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
      <div className={`${sizeClasses} rounded-2xl bg-white/5 border-2 border-dashed border-amber-400/40 flex items-center justify-center text-amber-300 text-sm font-black`}>
        🎲
      </div>
    );
  }

  return (
    <motion.div
      key={isRolling ? 'dice-rolling' : `dice-${displayVal}`}
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
// THEMES CONFIGURATION
// ----------------------------------------------------
const THEMES = {
  persia: {
    id: 'persia',
    nameFa: 'ایران باستان و تخت جمشید',
    nameEn: 'Ancient Persepolis',
    icon: '🏛️',
    boardBg: 'bg-[#0f2830] border-[#0284c7]',
    innerBg: 'bg-[#081820]',
    barBg: 'bg-[#040d12]',
    triLight: 'border-b-[#0284c7]',
    triDark: 'border-b-[#0f766e]',
    triLightTop: 'border-t-[#0284c7]',
    triDarkTop: 'border-t-[#0f766e]',
    checkerWhite: 'bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#ca8a04] border-[#fde047] text-[#713f12] shadow-yellow-500/40',
    checkerBlack: 'bg-gradient-to-b from-[#134e4a] via-[#042f2e] to-[#021e1d] border-[#2dd4bf] text-[#2dd4bf] shadow-teal-500/30',
    accentColor: '#06b6d4',
    borderDesign: 'border-[#0284c7] shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    faravaharBg: '👑 هخامنشیان • تخت جمشید باستان'
  },
  wood: {
    id: 'wood',
    nameFa: 'کلاسیک چوب گردو',
    nameEn: 'Walnut Wood',
    icon: '🪵',
    boardBg: 'bg-[#3b2314] border-[#6b4226]',
    innerBg: 'bg-[#2a170a]',
    barBg: 'bg-[#1e0f05]',
    triLight: 'border-b-[#c49a6c]',
    triDark: 'border-b-[#5c3317]',
    triLightTop: 'border-t-[#c49a6c]',
    triDarkTop: 'border-t-[#5c3317]',
    checkerWhite: 'bg-gradient-to-b from-[#fff7ed] to-[#fed7aa] border-[#d97706] text-[#78350f] shadow-amber-900/50',
    checkerBlack: 'bg-gradient-to-b from-[#451a03] to-[#1c0a00] border-[#78350f] text-[#fbbf24] shadow-black/80',
    accentColor: '#d97706',
    borderDesign: 'border-[#78350f] shadow-2xl',
    faravaharBg: '🪵 تخته نرد سنتی منبت‌کاری چوب گردو'
  },
  cosmic: {
    id: 'cosmic',
    nameFa: 'کیهانی و کهکشان‌ها',
    nameEn: 'Cosmic Galaxy',
    icon: '🌌',
    boardBg: 'bg-[#07051a] border-[#8b5cf6]',
    innerBg: 'bg-[#030014]',
    barBg: 'bg-[#000005]',
    triLight: 'border-b-[#8b5cf6]',
    triDark: 'border-b-[#06b6d4]',
    triLightTop: 'border-t-[#8b5cf6]',
    triDarkTop: 'border-t-[#06b6d4]',
    checkerWhite: 'bg-gradient-to-b from-[#f0abfc] via-[#c084fc] to-[#7e22ce] border-[#e879f9] text-white shadow-purple-500/50',
    checkerBlack: 'bg-gradient-to-b from-[#0e7490] via-[#155e75] to-[#083344] border-[#22d3ee] text-[#a5f3fc] shadow-cyan-500/50',
    accentColor: '#a855f7',
    borderDesign: 'border-[#8b5cf6] shadow-[0_0_35px_rgba(168,85,247,0.4)]',
    faravaharBg: '✨ کیهان بی‌پایان • مدار کهکشانی'
  }
};

// Standard Backgammon 24-point setup
const createInitialPoints = () => {
  const points = Array(25).fill(null).map(() => ({ player: null, count: 0 }));
  // White Setup (moves 24 -> 1)
  points[24] = { player: 'white', count: 2 };
  points[13] = { player: 'white', count: 5 };
  points[8]  = { player: 'white', count: 3 };
  points[6]  = { player: 'white', count: 5 };

  // Black Setup (moves 1 -> 24)
  points[1]  = { player: 'black', count: 2 };
  points[12] = { player: 'black', count: 5 };
  points[17] = { player: 'black', count: 3 };
  points[19] = { player: 'black', count: 5 };

  return points;
};

export default function Backgammon() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, addXP, addCoins, recordGameResult, incrementGameStat } = useAppStore();
  const gameStartTimeRef = useRef(Date.now());
  const isRtl = language === 'fa';

  const paramRoom = searchParams.get('room');
  const paramMode = searchParams.get('mode');

  // Match Configuration & Modal State
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(!paramRoom && !paramMode);
  const [gameMode, setGameMode] = useState(paramMode || 'bot'); // 'bot' | 'local' | 'online'
  const [matchSets, setMatchSets] = useState(3);
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [boardTheme, setBoardTheme] = useState('persia');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Match Scores
  const [scoreWhite, setScoreWhite] = useState(0);
  const [scoreBlack, setScoreBlack] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [matchWinner, setMatchWinner] = useState(null);

  // Board & Turn State
  const [points, setPoints] = useState(createInitialPoints);
  const [bar, setBar] = useState({ white: 0, black: 0 });
  const [borneOff, setBorneOff] = useState({ white: 0, black: 0 });
  const [turn, setTurn] = useState('white');
  const [dice, setDice] = useState([null, null]);
  const [remainingMoves, setRemainingMoves] = useState([]);
  const [hasRolled, setHasRolled] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [lastMoveMsg, setLastMoveMsg] = useState('🎲 برای شروع، دکمه پرتاب تاس را بزنید');
  const [setWinner, setSetWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Online Multiplayer State
  const [onlineRoomCode, setOnlineRoomCode] = useState(paramRoom || 'NARD-777');
  const [myOnlineRole, setMyOnlineRole] = useState(paramRoom ? 'black' : 'white');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: isRtl ? 'به تخته نرد شاهانه خوش آمدید!' : 'Welcome to Royal Backgammon!', sender: 'system' }
  ]);
  const chatChannelRef = useRef(null);
  const themeConfig = THEMES[boardTheme] || THEMES.persia;

  const playSfx = (fn) => {
    try {
      if (soundEnabled && fn) fn();
    } catch (_) {}
  };

  // ----------------------------------------------------
  // ONLINE SYNC
  // ----------------------------------------------------
  useEffect(() => {
    if (gameMode === 'online') {
      const channel = new BroadcastChannel(`lifeos_backgammon_${onlineRoomCode}`);
      chatChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'CHAT') {
          setChatMessages(prev => [...prev, payload]);
          soundEngine.playTap?.();
        } else if (type === 'DICE_ROLLED') {
          setDice(payload.dice);
          setRemainingMoves(payload.moves);
          setHasRolled(true);
          soundEngine.playLevelUp?.();
        } else if (type === 'BOARD_UPDATE') {
          setPoints(payload.points);
          setBar(payload.bar);
          setBorneOff(payload.borneOff);
          setTurn(payload.turn);
          setRemainingMoves(payload.remainingMoves);
          setHasRolled(payload.hasRolled);
          setSelectedPoint(null);
          soundEngine.playCheckmark?.();
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [gameMode, onlineRoomCode]);

  const rollIntervalRef = useRef(null);

  // ----------------------------------------------------
  // DICE ROLLING WITH TUMBLING ANIMATION
  // ----------------------------------------------------
  const rollDiceAction = () => {
    if (isRolling) return;
    setIsRolling(true);
    playSfx(soundEngine.playDiceRoll || soundEngine.playTap);
    haptics.tap?.();

    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    let rollCount = 0;
    rollIntervalRef.current = setInterval(() => {
      rollCount++;
      const tempD1 = Math.floor(Math.random() * 6) + 1;
      const tempD2 = Math.floor(Math.random() * 6) + 1;
      setDice([tempD1, tempD2]);

      if (rollCount >= 5) {
        clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const rolledDice = [d1, d2];
        const moves = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];

        setDice(rolledDice);
        setRemainingMoves(moves);
        setIsRolling(false);
        setHasRolled(true);

        try {
          if (d1 === d2) {
            incrementGameStat?.('doublesRolled');
            setLastMoveMsg(isRtl ? `🎉 جفت ${d1} آوردی! ۴ حرکت مجاز داری.` : `🎉 Doubles ${d1}! 4 moves available.`);
            playSfx(soundEngine.playLevelUp);
            haptics.success?.();
          } else {
            setLastMoveMsg(isRtl ? `تاس: ${d1} و ${d2} — مهره‌های چشمک‌زن را لمس کنید` : `Dice: ${d1} & ${d2} — Tap a glowing checker`);
          }

          if (gameMode === 'online' && chatChannelRef.current) {
            chatChannelRef.current.postMessage({
              type: 'DICE_ROLLED',
              payload: { dice: rolledDice, moves }
            });
          }

          checkAutoTurnPass(rolledDice, moves, points, bar, turn);
        } catch (e) {
          console.error("Error in dice roll handler:", e);
        }
      }
    }, 60);
  };

  const handleRollDice = () => {
    if (isRolling) return;
    if (hasRolled && remainingMoves.length > 0) {
      setLastMoveMsg(isRtl ? '👈 لطفاً یکی از مهره‌های درخشان را برای حرکت لمس کنید' : 'Tap a glowing checker to move');
      return;
    }
    if (gameMode === 'bot' && turn === 'black') return;
    if (gameMode === 'online' && turn !== myOnlineRole) return;

    rollDiceAction();
  };

  // ----------------------------------------------------
  // LEGAL MOVE / BEARING OFF RULES
  // ----------------------------------------------------
  const isHomeBoardReady = (player, currentPoints, currentBar) => {
    if (currentBar[player] > 0) return false;
    if (player === 'white') {
      for (let i = 7; i <= 24; i++) {
        if (currentPoints[i].player === 'white' && currentPoints[i].count > 0) return false;
      }
      return true;
    } else {
      for (let i = 1; i <= 18; i++) {
        if (currentPoints[i].player === 'black' && currentPoints[i].count > 0) return false;
      }
      return true;
    }
  };

  const canBearOffFromPoint = (fromPoint, die, player, currentPoints, currentBar) => {
    if (!isHomeBoardReady(player, currentPoints, currentBar)) return false;

    if (player === 'white') {
      if (fromPoint === die) return true;
      if (fromPoint < die) {
        for (let p = fromPoint + 1; p <= 6; p++) {
          if (currentPoints[p].player === 'white' && currentPoints[p].count > 0) return false;
        }
        return true;
      }
    } else {
      const dist = 25 - fromPoint;
      if (dist === die) return true;
      if (die > dist) {
        for (let p = 19; p < fromPoint; p++) {
          if (currentPoints[p].player === 'black' && currentPoints[p].count > 0) return false;
        }
        return true;
      }
    }
    return false;
  };

  const getValidMovesForPoint = (fromPoint, currentPoints, currentBar, currentMoves, player) => {
    const validDestinations = [];
    const uniqueMoves = Array.from(new Set(currentMoves));

    uniqueMoves.forEach(die => {
      // Bar Re-entry
      if (fromPoint === 'bar') {
        const target = player === 'white' ? 25 - die : die;
        const dest = currentPoints[target];
        const opponent = player === 'white' ? 'black' : 'white';
        if (!dest.player || dest.player === player || (dest.player === opponent && dest.count === 1)) {
          validDestinations.push({ target, dieUsed: die });
        }
        return;
      }

      // Bearing Off
      if (canBearOffFromPoint(fromPoint, die, player, currentPoints, currentBar)) {
        validDestinations.push({ target: 'off', dieUsed: die });
      }

      // Normal Board Move
      const target = player === 'white' ? fromPoint - die : fromPoint + die;
      if (target >= 1 && target <= 24) {
        const dest = currentPoints[target];
        const opponent = player === 'white' ? 'black' : 'white';
        if (!dest.player || dest.player === player || (dest.player === opponent && dest.count === 1)) {
          validDestinations.push({ target, dieUsed: die });
        }
      }
    });

    return validDestinations;
  };

  const checkAutoTurnPass = (currentDice, currentMoves, curPoints, curBar, curTurn) => {
    let hasAnyMove = false;
    if (curBar[curTurn] > 0) {
      const barMoves = getValidMovesForPoint('bar', curPoints, curBar, currentMoves, curTurn);
      if (barMoves.length > 0) hasAnyMove = true;
    } else {
      for (let i = 1; i <= 24; i++) {
        if (curPoints[i].player === curTurn && curPoints[i].count > 0) {
          const ptMoves = getValidMovesForPoint(i, curPoints, curBar, currentMoves, curTurn);
          if (ptMoves.length > 0) {
            hasAnyMove = true;
            break;
          }
        }
      }
    }

    if (!hasAnyMove && currentMoves.length > 0) {
      setLastMoveMsg(isRtl ? '⛔ هیچ حرکت مجازی با این تاس‌ها وجود ندارد؛ نوبت منتقل شد.' : 'No valid moves. Turn passed.');
      setTimeout(() => {
        endTurn(curPoints, curBar, borneOff, curTurn);
      }, 1500);
    }
  };

  // ----------------------------------------------------
  // POINT & MOVE HANDLER
  // ----------------------------------------------------
  const handlePointClick = (pointIdx) => {
    if (isRolling) return;
    if (gameMode === 'bot' && turn === 'black') return;
    if (gameMode === 'online' && turn !== myOnlineRole) return;

    if (!hasRolled || remainingMoves.length === 0) {
      rollDiceAction();
      return;
    }

    // If checkers on bar, force bar resolution
    if (bar[turn] > 0 && selectedPoint !== 'bar') {
      const barMoves = getValidMovesForPoint('bar', points, bar, remainingMoves, turn);
      if (barMoves.length === 1) {
        executeMove('bar', barMoves[0].target, barMoves[0].dieUsed);
      } else {
        setSelectedPoint('bar');
        playSfx(soundEngine.playTap);
      }
      return;
    }

    // If point is destination for selected checker
    if (selectedPoint !== null) {
      if (selectedPoint === pointIdx) {
        setSelectedPoint(null);
        return;
      }
      const validMoves = getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn);
      const matchedMove = validMoves.find(m => m.target === pointIdx);
      if (matchedMove) {
        executeMove(selectedPoint, pointIdx, matchedMove.dieUsed);
        return;
      }
    }

    // Select friendly point
    if (pointIdx === 'bar') {
      if (bar[turn] > 0) {
        const barMoves = getValidMovesForPoint('bar', points, bar, remainingMoves, turn);
        if (barMoves.length === 1) {
          executeMove('bar', barMoves[0].target, barMoves[0].dieUsed);
        } else {
          setSelectedPoint('bar');
          playSfx(soundEngine.playTap);
        }
      }
      return;
    }

    if (pointIdx >= 1 && pointIdx <= 24 && points[pointIdx].player === turn && points[pointIdx].count > 0) {
      const moves = getValidMovesForPoint(pointIdx, points, bar, remainingMoves, turn);
      if (moves.length === 0) {
        setLastMoveMsg(isRtl ? 'این مهره با تاس‌های فعلی حرکت مجازی ندارد.' : 'No legal moves for this checker.');
        playSfx(soundEngine.playTap);
        return;
      }

      if (moves.length === 1) {
        executeMove(pointIdx, moves[0].target, moves[0].dieUsed);
        return;
      }

      setSelectedPoint(pointIdx);
      playSfx(soundEngine.playTap);
    }
  };

  const executeMove = (from, to, dieUsed) => {
    const newPoints = points.map(p => ({ ...p }));
    const newBar = { ...bar };
    const newBorneOff = { ...borneOff };
    const opponent = turn === 'white' ? 'black' : 'white';

    if (from === 'bar') {
      newBar[turn] -= 1;
    } else {
      newPoints[from].count -= 1;
      if (newPoints[from].count === 0) {
        newPoints[from].player = null;
      }
    }

    if (to === 'off') {
      newBorneOff[turn] += 1;
      playSfx(soundEngine.playLevelUp);
      haptics.success?.();
    } else {
      if (newPoints[to].player === opponent && newPoints[to].count === 1) {
        newPoints[to].count = 1;
        newPoints[to].player = turn;
        newBar[opponent] += 1;
        setLastMoveMsg(isRtl ? `💥 مهره ${opponent === 'white' ? 'سفید' : 'سیاه'} زده شد!` : `💥 Hit ${opponent} blot!`);
        playSfx(soundEngine.playTrash);
        haptics.success?.();
      } else {
        newPoints[to].player = turn;
        newPoints[to].count += 1;
        playSfx(soundEngine.playCheckmark);
        haptics.tap?.();
      }
    }

    const newMoves = [...remainingMoves];
    const dieIdx = newMoves.indexOf(dieUsed);
    if (dieIdx > -1) newMoves.splice(dieIdx, 1);

    setPoints(newPoints);
    setBar(newBar);
    setBorneOff(newBorneOff);
    setRemainingMoves(newMoves);
    setSelectedPoint(null);

    if (newBorneOff[turn] >= 15) {
      handleSetWin(turn, newBorneOff, newBar);
      return;
    }

    if (newMoves.length === 0) {
      endTurn(newPoints, newBar, newBorneOff, turn);
    } else {
      checkAutoTurnPass(dice, newMoves, newPoints, newBar, turn);
    }
  };

  const endTurn = (pts = points, curBar = bar, curOff = borneOff, currentActiveTurn = turn) => {
    const nextTurn = currentActiveTurn === 'white' ? 'black' : 'white';
    setTurn(nextTurn);
    setRemainingMoves([]);
    setHasRolled(false);
    setSelectedPoint(null);
    setDice([null, null]);

    if (nextTurn === 'white') {
      setLastMoveMsg(isRtl ? 'نوبت شماست! دکمه پرتاب تاس را بزنید 🎲' : 'Your turn! Roll the dice 🎲');
    } else {
      setLastMoveMsg(isRtl ? '🤖 نوبت حریف است...' : 'Opponent is playing...');
    }

    if (gameMode === 'online' && chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: 'BOARD_UPDATE',
        payload: {
          points: pts,
          bar: curBar,
          borneOff: curOff,
          turn: nextTurn,
          remainingMoves: [],
          hasRolled: false
        }
      });
    }
  };

  // ----------------------------------------------------
  // SET & MATCH WIN
  // ----------------------------------------------------
  const handleSetWin = (winner, curOff, curBar) => {
    const loser = winner === 'white' ? 'black' : 'white';
    let setPointsEarned = 1;
    let winType = isRtl ? 'برد عادی (۱ امتیاز)' : 'Normal Win (1 Pt)';

    if (curOff[loser] === 0) {
      let hasInWinnerHome = false;
      if (winner === 'white') {
        for (let p = 1; p <= 6; p++) {
          if (points[p].player === 'black' && points[p].count > 0) hasInWinnerHome = true;
        }
      } else {
        for (let p = 19; p <= 24; p++) {
          if (points[p].player === 'white' && points[p].count > 0) hasInWinnerHome = true;
        }
      }

      if (curBar[loser] > 0 || hasInWinnerHome) {
        setPointsEarned = 3;
        winType = isRtl ? '🔥 بک‌گامون / سگ‌مارس! (۳ امتیاز)' : '🔥 Backgammon! (3 Pts)';
      } else {
        setPointsEarned = 2;
        winType = isRtl ? '⚡ مارس کامل! (۲ امتیاز)' : '⚡ Gammon! (2 Pts)';
      }
    }

    const newScoreW = winner === 'white' ? scoreWhite + setPointsEarned : scoreWhite;
    const newScoreB = winner === 'black' ? scoreBlack + setPointsEarned : scoreBlack;

    setScoreWhite(newScoreW);
    setScoreBlack(newScoreB);
    setSetWinner({ winner, type: winType, pts: setPointsEarned });

    playSfx(soundEngine.playLevelUp);
    haptics.success?.();

    if (newScoreW >= matchSets || newScoreB >= matchSets) {
      const matchWin = newScoreW >= matchSets ? 'white' : 'black';
      setMatchWinner(matchWin);
      addXP?.(150 * matchSets, 'پیروزی در مچ تخته نرد');
      addCoins?.(50 * matchSets);
      
      if (matchWin === 'white') {
        setShowConfetti(true);
      }
      
      recordGameResult?.({
        gameId: 'backgammon',
        gameName: isRtl ? 'تخته نرد' : 'Backgammon',
        gameIcon: '🎲',
        won: matchWin === 'white',
        opponent: gameMode === 'bot' ? (isRtl ? '🤖 ربات هوشمند' : '🤖 AI Bot') : (isRtl ? 'بازیکن آنلاین' : 'Online Player'),
        durationMs: Date.now() - gameStartTimeRef.current,
        coinsEarned: matchWin === 'white' ? (50 * matchSets) : 0
      });
    }
  };

  const handleNextSet = () => {
    setPoints(createInitialPoints());
    setBar({ white: 0, black: 0 });
    setBorneOff({ white: 0, black: 0 });
    setDice([null, null]);
    setRemainingMoves([]);
    setHasRolled(false);
    setSelectedPoint(null);
    setSetWinner(null);
    setCurrentSet(prev => prev + 1);
    setTurn('white');
  };

  const handleResetMatch = () => {
    gameStartTimeRef.current = Date.now();
    setPoints(createInitialPoints());
    setBar({ white: 0, black: 0 });
    setBorneOff({ white: 0, black: 0 });
    setScoreWhite(0);
    setScoreBlack(0);
    setCurrentSet(1);
    setMatchWinner(null);
    setSetWinner(null);
    setTurn('white');
    setDice([null, null]);
    setRemainingMoves([]);
    setHasRolled(false);
  };

  // ----------------------------------------------------
  // BOT AI ENGINE
  // ----------------------------------------------------
  useEffect(() => {
    if (gameMode !== 'bot' || turn !== 'black' || setWinner || matchWinner) return;

    if (!hasRolled && !isRolling) {
      const timer = setTimeout(() => {
        if (!hasRolled && !isRolling && turn === 'black') {
          rollDiceAction();
        }
      }, 700);
      return () => clearTimeout(timer);
    }

    if (hasRolled && remainingMoves.length > 0 && !isRolling) {
      const botMoveTimer = setTimeout(() => {
        if (hasRolled && remainingMoves.length > 0 && turn === 'black') {
          makeBotMove();
        }
      }, 600);
      return () => clearTimeout(botMoveTimer);
    }
  }, [gameMode, turn, hasRolled, remainingMoves, isRolling, setWinner, matchWinner]);

  const makeBotMove = () => {
    let allPossibleMoves = [];
    if (bar.black > 0) {
      const barMoves = getValidMovesForPoint('bar', points, bar, remainingMoves, 'black');
      barMoves.forEach(m => allPossibleMoves.push({ from: 'bar', to: m.target, dieUsed: m.dieUsed }));
    } else {
      for (let i = 1; i <= 24; i++) {
        if (points[i].player === 'black' && points[i].count > 0) {
          const ptMoves = getValidMovesForPoint(i, points, bar, remainingMoves, 'black');
          ptMoves.forEach(m => allPossibleMoves.push({ from: i, to: m.target, dieUsed: m.dieUsed }));
        }
      }
    }

    if (allPossibleMoves.length === 0) {
      endTurn(points, bar, borneOff, 'black');
      return;
    }

    allPossibleMoves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.to === 'off') scoreA += 130;
      if (b.to === 'off') scoreB += 130;
      if (typeof a.to === 'number' && points[a.to].player === 'white' && points[a.to].count === 1) scoreA += 100;
      if (typeof b.to === 'number' && points[b.to].player === 'white' && points[b.to].count === 1) scoreB += 100;
      if (typeof a.to === 'number' && points[a.to].player === 'black' && points[a.to].count === 1) scoreA += 60;
      if (typeof b.to === 'number' && points[b.to].player === 'black' && points[b.to].count === 1) scoreB += 60;
      return scoreB - scoreA;
    });

    const chosen = allPossibleMoves[0];
    executeMove(chosen.from, chosen.to, chosen.dieUsed);
  };

  // Pip Counts
  const pipWhite = points.reduce((acc, p, idx) => acc + (p.player === 'white' ? p.count * idx : 0), 0) + (bar.white * 25);
  const pipBlack = points.reduce((acc, p, idx) => acc + (p.player === 'black' ? p.count * (25 - idx) : 0), 0) + (bar.black * 25);

  const activeValidDestinations = selectedPoint !== null 
    ? getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn).map(m => m.target)
    : [];

  // Checkers Stack
  const renderCheckersStack = (pt, isTop, pIdx, isSelected, isFriendlyAndMovable) => {
    if (pt.count === 0) return null;
    const maxVisible = Math.min(pt.count, 5);
    const isWhite = pt.player === 'white';
    const checkerStyle = isWhite ? themeConfig.checkerWhite : themeConfig.checkerBlack;

    return (
      <div className={`absolute ${isTop ? 'top-5' : 'bottom-5'} flex flex-col items-center z-10 select-none pointer-events-none`}>
        {Array.from({ length: maxVisible }).map((_, idx) => {
          const isTopChecker = idx === maxVisible - 1;
          return (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                marginTop: idx > 0 ? '-13px' : '0',
                zIndex: idx + 1
              }}
              className={`w-5 h-5 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-md transition-all ${checkerStyle} ${
                isSelected && isTopChecker ? 'ring-4 ring-amber-400 scale-110' : ''
              } ${isFriendlyAndMovable && isTopChecker ? 'ring-2 ring-amber-300 animate-pulse' : ''}`}
            >
              {idx === maxVisible - 1 && pt.count > 5 ? (
                <span className="text-[10px] font-black">{pt.count}</span>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Render Triangle Point
  const renderPoint = (pIdx, isTop) => {
    const pt = points[pIdx];
    const isSelected = selectedPoint === pIdx;
    const isValidTarget = activeValidDestinations.includes(pIdx);
    const isFriendlyAndMovable = hasRolled && pt.player === turn && pt.count > 0 && getValidMovesForPoint(pIdx, points, bar, remainingMoves, turn).length > 0;
    const isDark = pIdx % 2 === 0;

    return (
      <div
        key={pIdx}
        onClick={() => handlePointClick(pIdx)}
        className={`flex-1 h-full relative flex flex-col ${isTop ? 'justify-start' : 'justify-end'} items-center cursor-pointer transition-all ${
          isSelected ? 'bg-amber-400/20' : isValidTarget ? 'bg-emerald-500/25 ring-2 ring-emerald-400' : ''
        }`}
      >
        {/* Triangle Background */}
        <div
          className={`w-0 h-0 border-x-[8px] xs:border-x-[11px] sm:border-x-[16px] border-x-transparent ${
            isTop
              ? isDark ? themeConfig.triDarkTop : themeConfig.triLightTop
              : isDark ? themeConfig.triDark : themeConfig.triLight
          } ${isTop ? 'border-t-[100px] sm:border-t-[130px]' : 'border-b-[100px] sm:border-b-[130px]'} opacity-90`}
        />

        {/* Valid Destination Indicator */}
        {isValidTarget && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="px-2 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] shadow-lg animate-bounce flex items-center gap-1">
              <span>🎯</span>
              <span>{pIdx}</span>
            </div>
          </div>
        )}

        {/* Point Label Number */}
        <span className={`absolute ${isTop ? 'top-1' : 'bottom-1'} text-[8px] font-mono font-bold text-slate-400/70 z-10`}>
          {pIdx}
        </span>

        {/* Checkers Stack */}
        {renderCheckersStack(pt, isTop, pIdx, isSelected, isFriendlyAndMovable)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050711] text-white pb-24 select-none font-sans" dir="rtl">
      
      {/* 1. Header */}
      <div className="sticky top-0 z-30 p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/games')}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white"
            title={isRtl ? 'بازگشت به بازی‌ها' : 'Back to Games'}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              🎲 تخته نرد شاهانه ایرانی
            </h1>
            <span className="text-[10px] text-slate-400 block">
              {gameMode === 'bot' ? '🤖 بازی با ربات هوشمند' : gameMode === 'local' ? '📱 دونفره در یک دستگاه' : `🌐 اتاق آنلاین: ${onlineRoomCode}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const themesKeys = Object.keys(THEMES);
              const nextIdx = (themesKeys.indexOf(boardTheme) + 1) % themesKeys.length;
              setBoardTheme(themesKeys[nextIdx]);
              soundEngine.playTap?.();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1"
          >
            <span>{themeConfig.icon}</span>
            <span className="text-[10px] hidden sm:inline">{themeConfig.nameFa}</span>
          </button>

          {gameMode === 'online' && (
            <button
              onClick={() => {
                const shareUrl = `https://t.me/zenoslife_bot/app?startapp=nard_${onlineRoomCode}`;
                const shareText = isRtl ? `بیا در تخته نرد بازی کنیم! کد اتاق: ${onlineRoomCode}` : `Join my Backgammon room! Code: ${onlineRoomCode}`;
                window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
                soundEngine.playTap?.();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black hover:bg-blue-500/30 flex items-center gap-1"
              title={isRtl ? 'اشتراکگذاری اتاق' : 'Share Room'}
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">{isRtl ? 'دعوت' : 'Invite'}</span>
            </button>
          )}

          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black hover:bg-amber-500/30 flex items-center gap-1"
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

      <div className="max-w-lg mx-auto min-h-[calc(100vh-80px)] p-3 sm:p-4 space-y-3">

        {/* 2. Scoreboard & Pip */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-cyan-950/50 border border-amber-500/30 flex items-center justify-between px-4 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-amber-300 shadow-sm flex items-center justify-center text-xs font-black text-black">
              {scoreWhite}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 block">{isRtl ? 'سفید (شما)' : 'White'}</span>
              <span className="text-[9px] text-amber-400/80 font-mono">Pip: {pipWhite}</span>
            </div>
          </div>

          <div className="text-xs font-mono font-black px-3 py-1 rounded-xl bg-black/60 border border-slate-700 text-slate-200 text-center">
            <div>{isRtl ? `ست ${currentSet} از ${matchSets}` : `Set ${currentSet}/${matchSets}`}</div>
            <div className="text-[9px] text-amber-400">{isRtl ? 'هدف: برد در دست‌ها' : 'Target Sets'}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-end">
              <span className="text-xs font-bold text-cyan-300 block">{isRtl ? (gameMode === 'bot' ? 'ربات هوشمند' : 'سیاه') : 'Black'}</span>
              <span className="text-[9px] text-cyan-400/80 font-mono">Pip: {pipBlack}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-700 border-2 border-cyan-400 shadow-sm flex items-center justify-center text-xs font-black text-white">
              {scoreBlack}
            </div>
          </div>
        </div>

        {gameMode === 'bot' && (
          <div className="text-center text-[10px] text-slate-400">
            {isRtl ? 'حالت تمرینی — بدون شرطبندی' : 'Practice Mode — No Wager'}
          </div>
        )}

        {/* 3. Main Board */}
        <div className={`w-full rounded-[2.5rem] p-3 sm:p-4 border-4 transition-all duration-500 ${themeConfig.boardBg} ${themeConfig.borderDesign} shadow-2xl`}>
          
          {themeConfig.faravaharBg && (
            <div className="text-center py-1 text-[11px] font-black tracking-widest text-amber-400/80 border-b border-white/10 mb-2 uppercase">
              {themeConfig.faravaharBg}
            </div>
          )}

          <div className="flex gap-2 h-[280px] xs:h-[320px] sm:h-[400px]">
            
            {/* Left Quadrant (Points 24-19 Top, 1-6 Bottom) */}
            <div className={`flex-1 rounded-2xl p-1 sm:p-2 flex flex-col justify-between ${themeConfig.innerBg} border border-white/5 shadow-inner`}>
              <div className="flex h-[46%] w-full">
                {[24, 23, 22, 21, 20, 19].map(p => renderPoint(p, true))}
              </div>
              <div className="flex h-[46%] w-full">
                {[1, 2, 3, 4, 5, 6].map(p => renderPoint(p, false))}
              </div>
            </div>

            {/* Center Bar */}
            <div 
              onClick={() => handlePointClick('bar')}
              className={`w-10 sm:w-12 rounded-2xl p-1 flex flex-col items-center justify-between cursor-pointer border border-white/10 ${themeConfig.barBg} shadow-inner ${
                selectedPoint === 'bar' ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-1 pt-2">
                <span className="text-[8px] font-black text-slate-400 uppercase">BAR</span>
                {bar.white > 0 && (
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs ${themeConfig.checkerWhite} animate-pulse`}>
                    {bar.white}
                  </div>
                )}
              </div>

              <span className="text-sm opacity-40">👑</span>

              <div className="flex flex-col items-center gap-1 pb-2">
                {bar.black > 0 && (
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs ${themeConfig.checkerBlack} animate-pulse`}>
                    {bar.black}
                  </div>
                )}
                <span className="text-[8px] font-black text-slate-400 uppercase">BAR</span>
              </div>
            </div>

            {/* Right Quadrant (Points 18-13 Top, 7-12 Bottom) */}
            <div className={`flex-1 rounded-2xl p-1 sm:p-2 flex flex-col justify-between ${themeConfig.innerBg} border border-white/5 shadow-inner`}>
              <div className="flex h-[46%] w-full">
                {[18, 17, 16, 15, 14, 13].map(p => renderPoint(p, true))}
              </div>
              <div className="flex h-[46%] w-full">
                {[7, 8, 9, 10, 11, 12].map(p => renderPoint(p, false))}
              </div>
            </div>

            {/* Tray (Bearing Off) */}
            <div 
              onClick={() => {
                if (activeValidDestinations.includes('off')) {
                  const validMoves = getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn);
                  const offMove = validMoves.find(m => m.target === 'off');
                  if (offMove) executeMove(selectedPoint, 'off', offMove.dieUsed);
                }
              }}
              className={`w-9 sm:w-11 rounded-2xl p-1 bg-black/50 border border-white/10 flex flex-col justify-between items-center cursor-pointer hover:border-emerald-400 transition-colors shadow-inner ${
                activeValidDestinations.includes('off') ? 'ring-4 ring-emerald-400 bg-emerald-950/50 animate-pulse' : ''
              }`}
              title={isRtl ? 'سینی خروج مهره‌ها' : 'Bearing Off Tray'}
            >
              <div className="flex flex-col items-center gap-1 pt-1">
                <span className="text-[8px] font-black text-cyan-400">OUT</span>
                <span className="text-xs font-black text-cyan-300">{borneOff.black}/15</span>
              </div>

              <div className="text-[9px] text-slate-500 font-mono rotate-90 font-bold">
                TRAY
              </div>

              <div className="flex flex-col items-center gap-1 pb-1">
                <span className="text-xs font-black text-amber-300">{borneOff.white}/15</span>
                <span className="text-[8px] font-black text-amber-400">OUT</span>
              </div>
            </div>

          </div>

          {/* 4. Controls & Dice Dashboard */}
          <div className="mt-3.5 p-3.5 rounded-2xl bg-black/70 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            
            {/* Turn Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full ${turn === 'white' ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]' : 'bg-cyan-500 shadow-[0_0_12px_#06b6d4]'}`} />
              <span className="text-xs font-black text-slate-200">
                {turn === 'white' ? (isRtl ? 'نوبت سفید (شما)' : 'White\'s Turn') : (isRtl ? (gameMode === 'bot' ? '🤖 نوبت ربات...' : 'نوبت سیاه') : 'Black\'s Turn')}
              </span>
            </div>

            {/* Interactive Dice */}
            <div 
              onClick={handleRollDice}
              className={`flex items-center gap-2.5 cursor-pointer p-1.5 rounded-2xl hover:bg-white/5 transition-all overflow-x-auto flex-nowrap ${
                !hasRolled && !isRolling && (turn === 'white' || gameMode === 'local') ? 'ring-2 ring-amber-400/80 animate-pulse bg-amber-500/10' : ''
              }`}
            >
              <RenderDiceFace value={dice[0]} isRolling={isRolling} size="md" />
              <RenderDiceFace value={dice[1]} isRolling={isRolling} size="md" />

              {/* Remaining Moves Chips */}
              {remainingMoves.length > 0 && (
                <div className="flex items-center gap-1">
                  {remainingMoves.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-emerald-500/25 text-emerald-300 font-mono font-black text-xs border border-emerald-400 shadow-sm animate-pulse">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Roll Dice Button or Status */}
            {hasRolled && remainingMoves.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="px-3 py-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs flex items-center gap-1.5 shadow-sm">
                  <span className="animate-bounce">👉</span>
                  <span>مهره را لمس کنید</span>
                </span>
                <button
                  onClick={() => endTurn(points, bar, borneOff, turn)}
                  className="px-2.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-bold"
                >
                  رد نوبت ⏭️
                </button>
              </div>
            ) : (
              <button
                onClick={handleRollDice}
                disabled={isRolling || (gameMode === 'bot' && turn === 'black') || (gameMode === 'online' && turn !== myOnlineRole)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/40 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <Shuffle size={16} className={isRolling ? 'animate-spin' : ''} />
                <span>{isRolling ? 'در حال چرخش...' : 'پرتاب تاس 🎲'}</span>
              </button>
            )}

          </div>

          {/* Status Message */}
          {lastMoveMsg && (
            <div className="mt-2 text-center py-2 px-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-amber-300">
              {lastMoveMsg}
            </div>
          )}

        </div>

      </div>

      {/* Trash Talk In-Game Reactions */}
      <InGameReactions />

      {/* Set / Match Winner Modal */}
      <AnimatePresence>
        {(setWinner || matchWinner) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-400 p-6 text-center shadow-2xl space-y-4"
            >
              <div className="text-5xl animate-bounce">
                {matchWinner ? '👑' : '🏆'}
              </div>
              <h3 className="text-xl font-black text-white">
                {matchWinner 
                  ? (matchWinner === 'white' ? '🎉 تبریک! شما برنده کل مسابقه شدید!' : '🤖 ربات برنده کل مسابقه شد!')
                  : (setWinner?.winner === 'white' ? '🎉 برنده این ست: سفید (شما)' : '🤖 برنده این ست: ربات')}
              </h3>
              <p className="text-xs text-amber-300 font-bold">
                {setWinner?.type}
              </p>
              <div className="flex justify-center gap-4 text-xs font-mono font-bold text-slate-300 bg-black/50 py-2 rounded-xl border border-white/10">
                <span>امتیاز شما: {scoreWhite}</span>
                <span>·</span>
                <span>امتیاز حریف: {scoreBlack}</span>
              </div>
              <div className="pt-2 flex gap-2">
                {matchWinner ? (
                  <button
                    onClick={handleResetMatch}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg active:scale-95"
                  >
                    شروع مسابقه جدید 🎲
                  </button>
                ) : (
                  <button
                    onClick={handleNextSet}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg active:scale-95"
                  >
                    ست بعدی ⏭️
                  </button>
                )}
                <button
                  onClick={() => navigate('/games')}
                  className="px-4 py-3 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20"
                >
                  خروج
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setup Modal */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        titleFa="تنظیمات تخته نرد شاهانه"
        onStartMatch={({ mode, sets, difficulty }) => {
          setGameMode(mode);
          setMatchSets(sets);
          setBotDifficulty(difficulty);
          handleResetMatch();
        }}
      />

    </div>
  );
}
