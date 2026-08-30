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

// ----------------------------------------------------
// THEMES CONFIGURATION
// ----------------------------------------------------
const THEMES = {
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
    diceBg: 'bg-[#fffbeb] text-[#78350f] border-[#d97706]',
    accentColor: '#d97706',
    borderDesign: 'border-[#78350f] shadow-2xl',
    faravaharBg: '🪵 تخته نرد سنتی منبت‌کاری چوب گردو'
  },
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
    diceBg: 'bg-gradient-to-br from-[#fef08a] to-[#eab308] text-[#713f12] border-[#facc15]',
    accentColor: '#06b6d4',
    borderDesign: 'border-[#0284c7] shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    faravaharBg: '👑 هخامنشیان • تخت جمشید باستان'
  },
  cosmic: {
    id: 'cosmic',
    nameFa: 'کیهانی و کهکشان‌ها',
    nameEn: 'Cosmic Nebula',
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
    diceBg: 'bg-gradient-to-br from-[#c084fc] to-[#6366f1] text-white border-[#e879f9]',
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
  const { language, addXP, addCoins } = useAppStore();
  const isRtl = language === 'fa';

  const paramRoom = searchParams.get('room');
  const paramMode = searchParams.get('mode');

  // Modal & Configuration
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(!paramRoom && !paramMode);
  const [gameMode, setGameMode] = useState(paramMode || 'bot'); // 'local' | 'bot' | 'online'
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [matchSets, setMatchSets] = useState(3);
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
  const [lastMoveMsg, setLastMoveMsg] = useState('');
  const [setWinner, setSetWinner] = useState(null);

  // Online Multiplayer & Chat State
  const [onlineRoomCode, setOnlineRoomCode] = useState(paramRoom || 'NARD-777');
  const [myOnlineRole, setMyOnlineRole] = useState(paramRoom ? 'black' : 'white');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: isRtl ? 'به تخته نرد شاهانه خوش آمدید! تاس‌ها را به نام راستی بچرخان.' : 'Welcome to Royal Backgammon!', sender: 'system' }
  ]);
  const chatChannelRef = useRef(null);

  const themeConfig = THEMES[boardTheme] || THEMES.persia;

  const playSfx = (fn) => {
    if (soundEnabled) fn?.();
  };

  // ----------------------------------------------------
  // ONLINE BROADCAST CHANNEL SETUP
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

  // ----------------------------------------------------
  // DICE ROLLING LOGIC
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
    if (isRolling || isRollingRef.current) return;
    if (hasRolled && remainingMoves.length > 0) {
      setLastMoveMsg(isRtl ? '👈 لطفاً یکی از مهره‌های درخشان سفید را برای حرکت لمس کنید' : 'Tap a glowing checker to move');
      return;
    }
    if (gameMode === 'bot' && turn === 'black') {
      setLastMoveMsg(isRtl ? '🤖 نوبت ربات است...' : 'Bot is thinking...');
      return;
    }
    if (gameMode === 'online' && turn !== myOnlineRole) {
      setLastMoveMsg(isRtl ? '⏳ نوبت حریف آنلاین است...' : 'Opponent\'s turn...');
      return;
    }

    rollDiceAction();
  };

  const rollDiceAction = () => {
    if (isRollingRef.current) return;
    isRollingRef.current = true;
    setIsRolling(true);
    playSfx(soundEngine.playLevelUp);
    haptics.tap?.();

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const rolledDice = [d1, d2];
    const moves = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];

    setTimeout(() => {
      isRollingRef.current = false;
      setIsRolling(false);
      setDice(rolledDice);
      setRemainingMoves(moves);
      setHasRolled(true);

      if (d1 === d2) {
        setLastMoveMsg(isRtl ? `🎉 جفت ${d1} آوردی! ۴ حرکت مجاز داری.` : `🎉 Doubles ${d1}! 4 moves available.`);
        playSfx(soundEngine.playLevelUp);
        haptics.success?.();
      } else {
        setLastMoveMsg(isRtl ? `تاس: ${d1} و ${d2} — مهره سفید را لمس کنید` : `Dice: ${d1} & ${d2} — Tap a white checker`);
      }

      if (gameMode === 'online' && chatChannelRef.current) {
        chatChannelRef.current.postMessage({
          type: 'DICE_ROLLED',
          payload: { dice: rolledDice, moves }
        });
      }

      checkAutoTurnPass(rolledDice, moves, points, bar, turn);
    }, 300);
  };

  // ----------------------------------------------------
  // CAN MOVE / BEARING OFF CALCULATIONS
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

  // Standard international strict bearing off rules
  const canBearOffFromPoint = (fromPoint, die, player, currentPoints, currentBar) => {
    if (!isHomeBoardReady(player, currentPoints, currentBar)) return false;

    if (player === 'white') {
      if (fromPoint === die) return true; // Exact match
      if (fromPoint < die) {
        // Only legal if NO checkers on higher points in home board (fromPoint + 1 to 6)
        for (let p = fromPoint + 1; p <= 6; p++) {
          if (currentPoints[p].player === 'white' && currentPoints[p].count > 0) {
            return false;
          }
        }
        return true;
      }
    } else {
      // Black: Home board is 19 to 24. Distance to off is (25 - fromPoint)
      const dist = 25 - fromPoint;
      if (dist === die) return true; // Exact match
      if (die > dist) {
        // Only legal if NO checkers on points further from off (19 to fromPoint - 1)
        for (let p = 19; p < fromPoint; p++) {
          if (currentPoints[p].player === 'black' && currentPoints[p].count > 0) {
            return false;
          }
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
      // Check Bar Re-entry
      if (fromPoint === 'bar') {
        const target = player === 'white' ? 25 - die : die;
        const dest = currentPoints[target];
        const opponent = player === 'white' ? 'black' : 'white';
        if (!dest.player || dest.player === player || (dest.player === opponent && dest.count === 1)) {
          validDestinations.push({ target, dieUsed: die });
        }
        return;
      }

      // Check Bearing Off
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
      setLastMoveMsg(isRtl ? 'هیچ حرکت معتبری وجود ندارد؛ نوبت منتقل شد.' : 'No valid moves available. Turn passed.');
      setTimeout(() => {
        endTurn(curPoints, curBar, borneOff, curTurn);
      }, 1400);
    }
  };

  // ----------------------------------------------------
  // EXECUTE MOVE
  // ----------------------------------------------------
  const handlePointClick = (pointIdx) => {
    if (!hasRolled || isRolling) return;
    if (gameMode === 'bot' && turn === 'black') return;
    if (gameMode === 'online' && turn !== myOnlineRole) return;

    if (bar[turn] > 0 && selectedPoint !== 'bar') {
      setSelectedPoint('bar');
      playSfx(soundEngine.playTap);
      return;
    }

    if (selectedPoint === null) {
      if (pointIdx === 'bar') {
        if (bar[turn] > 0) setSelectedPoint('bar');
        return;
      }
      if (pointIdx >= 1 && pointIdx <= 24 && points[pointIdx].player === turn && points[pointIdx].count > 0) {
        setSelectedPoint(pointIdx);
        playSfx(soundEngine.playTap);
      }
      return;
    }

    if (selectedPoint === pointIdx) {
      setSelectedPoint(null);
      return;
    }

    if (pointIdx !== 'bar' && pointIdx !== 'off' && points[pointIdx].player === turn && points[pointIdx].count > 0) {
      setSelectedPoint(pointIdx);
      playSfx(soundEngine.playTap);
      return;
    }

    const validMoves = getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn);
    const matchedMove = validMoves.find(m => m.target === pointIdx);

    if (matchedMove) {
      executeMove(selectedPoint, pointIdx, matchedMove.dieUsed);
    } else {
      setSelectedPoint(null);
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
    setDice([null, null]);
    setRemainingMoves([]);
    setHasRolled(false);
    setSelectedPoint(null);

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
  // SET & MATCH WIN HANDLING (GAMMON & BACKGAMMON SCORING)
  // ----------------------------------------------------
  const handleSetWin = (winner, curOff, curBar) => {
    const loser = winner === 'white' ? 'black' : 'white';
    let setPointsEarned = 1;
    let winType = isRtl ? 'برد عادی (۱ امتیاز)' : 'Normal Win (1 Pt)';

    // Gammon Check: Loser has borne off 0 checkers
    if (curOff[loser] === 0) {
      // Backgammon Check: Loser has 0 off AND has checkers on Bar or in winner's home board
      let hasInWinnerHome = false;
      if (winner === 'white') {
        // White home is 1 to 6
        for (let p = 1; p <= 6; p++) {
          if (points[p].player === 'black' && points[p].count > 0) hasInWinnerHome = true;
        }
      } else {
        // Black home is 19 to 24
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
  // AI BOT ENGINE
  // ----------------------------------------------------
  useEffect(() => {
    if (gameMode !== 'bot' || turn !== 'black' || setWinner || matchWinner) return;

    if (!hasRolled && !isRollingRef.current) {
      const timer = setTimeout(() => {
        if (!hasRolled && !isRollingRef.current && turn === 'black') {
          rollDiceAction();
        }
      }, 700);
      return () => clearTimeout(timer);
    }

    if (hasRolled && remainingMoves.length > 0 && !isRollingRef.current) {
      const botMoveTimer = setTimeout(() => {
        if (hasRolled && remainingMoves.length > 0 && turn === 'black') {
          makeBotMove();
        }
      }, 600);
      return () => clearTimeout(botMoveTimer);
    }
  }, [gameMode, turn, hasRolled, remainingMoves, setWinner, matchWinner]);

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

    // Heuristic Evaluation based on Bot Difficulty
    allPossibleMoves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.to === 'off') scoreA += 130;
      if (b.to === 'off') scoreB += 130;

      // Hit opponent's single blot
      if (typeof a.to === 'number' && points[a.to].player === 'white' && points[a.to].count === 1) scoreA += 100;
      if (typeof b.to === 'number' && points[b.to].player === 'white' && points[b.to].count === 1) scoreB += 100;

      // Make a secure point / prime (2+ checkers)
      if (typeof a.to === 'number' && points[a.to].player === 'black' && points[a.to].count === 1) scoreA += 60;
      if (typeof b.to === 'number' && points[b.to].player === 'black' && points[b.to].count === 1) scoreB += 60;

      // Advance furthest
      if (typeof a.to === 'number') scoreA += a.to * 2;
      if (typeof b.to === 'number') scoreB += b.to * 2;

      if (botDifficulty === 'easy') {
        return Math.random() - 0.5;
      }
      return scoreB - scoreA;
    });

    const chosen = allPossibleMoves[0];
    executeMove(chosen.from, chosen.to, chosen.dieUsed);
  };

  const handleStartFromSetup = (config) => {
    setGameMode(config.mode);
    setBotDifficulty(config.botDifficulty || 'medium');
    setMatchSets(config.matchSets || 3);
    if (config.roomCode) {
      setOnlineRoomCode(config.roomCode);
      setMyOnlineRole(config.isHost ? 'white' : 'black');
    }
    handleResetMatch();
    setIsSetupModalOpen(false);
  };

  const handleSendMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      text,
      sender: myOnlineRole === 'white' ? (isRtl ? 'سفید (شما)' : 'White (You)') : (isRtl ? 'سیاه (شما)' : 'Black (You)')
    };
    setChatMessages(prev => [...prev, newMsg]);

    if (chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: 'CHAT',
        payload: newMsg
      });
    }
  };

  // Calculate live Pip Counts
  const pipWhite = points.reduce((acc, p, idx) => acc + (p.player === 'white' ? p.count * idx : 0), 0) + (bar.white * 25);
  const pipBlack = points.reduce((acc, p, idx) => acc + (p.player === 'black' ? p.count * (25 - idx) : 0), 0) + (bar.black * 25);

  // Get active valid destinations if selected
  const activeValidDestinations = selectedPoint !== null 
    ? getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn).map(m => m.target)
    : [];

  // Render Stacked Checkers in realistic 3D
  const renderCheckersStack = (pt, isTop, pIdx, isSelected, isFriendlyAndMovable) => {
    if (pt.count === 0) return null;
    const maxVisible = Math.min(pt.count, 5);
    const isWhite = pt.player === 'white';
    const checkerStyle = isWhite ? themeConfig.checkerWhite : themeConfig.checkerBlack;

    return (
      <div className={`absolute ${isTop ? 'top-5' : 'bottom-5'} flex flex-col items-center z-10 select-none`}>
        {Array.from({ length: maxVisible }).map((_, idx) => {
          const isTopChecker = idx === maxVisible - 1;
          return (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={isFriendlyAndMovable ? { scale: 1.15 } : {}}
              style={{
                marginTop: idx > 0 ? '-13px' : '0',
                zIndex: idx + 1
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-md transition-all ${checkerStyle} ${
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

  // Render a point triangle
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
        {/* Triangle Shape */}
        <div
          className={`w-0 h-0 border-x-[11px] sm:border-x-[16px] border-x-transparent ${
            isTop
              ? isDark ? themeConfig.triDarkTop : themeConfig.triLightTop
              : isDark ? themeConfig.triDark : themeConfig.triLight
          } ${isTop ? 'border-t-[100px] sm:border-t-[130px]' : 'border-b-[100px] sm:border-b-[130px]'} opacity-90`}
        />

        {/* Target indicator */}
        {isValidTarget && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center justify-center animate-ping" />
          </div>
        )}

        {/* Point Label Number */}
        <span className={`absolute ${isTop ? 'top-1' : 'bottom-1'} text-[8px] font-mono font-bold text-slate-400/70 z-10`}>
          {pIdx}
        </span>

        {/* Stacked Checkers */}
        {renderCheckersStack(pt, isTop, pIdx, isSelected, isFriendlyAndMovable)}
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
            title={isRtl ? 'بازگشت به بازی‌ها' : 'Back to Games'}
          >
            {isRtl ? <ChevronLeft size={20} className="rotate-180" /> : <ChevronLeft size={20} />}
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              {isRtl ? 'تخته نرد شاهانه ایرانی' : 'Royal Persian Backgammon'}
            </h1>
            <span className="text-[10px] text-slate-400">
              {gameMode === 'bot' ? '🤖 بازی با ربات هوشمند' : gameMode === 'local' ? '📱 دونفره در یک دستگاه' : `🌐 اتاق آنلاین: ${onlineRoomCode}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Theme Selector Pill */}
          <button
            onClick={() => {
              const themesKeys = Object.keys(THEMES);
              const nextIdx = (themesKeys.indexOf(boardTheme) + 1) % themesKeys.length;
              setBoardTheme(themesKeys[nextIdx]);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1"
            title={isRtl ? 'تغییر قالب تخته' : 'Change Theme'}
          >
            <span>{themeConfig.icon}</span>
            <span className="text-[10px] hidden sm:inline">{themeConfig.nameFa}</span>
          </button>

          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black hover:bg-amber-500/30 flex items-center gap-1"
          >
            <Settings size={13} />
            <span>{isRtl ? 'تنظیمات' : 'Setup'}</span>
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

        {/* ── 2. MATCH SCOREBOARD & PIP COUNT ── */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-cyan-950/40 border border-amber-500/30 flex items-center justify-between px-4 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-amber-300 shadow-sm flex items-center justify-center text-xs font-black text-black">
              {scoreWhite}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 block">{isRtl ? 'سفید (شما)' : 'White'}</span>
              <span className="text-[9px] text-amber-400/80 font-mono">Pip: {pipWhite}</span>
            </div>
          </div>

          <div className="text-xs font-mono font-black px-3 py-1 rounded-xl bg-black/50 border border-slate-700 text-slate-200 text-center">
            <div>{isRtl ? `ست ${currentSet} از ${matchSets}` : `Set ${currentSet}/${matchSets}`}</div>
            <div className="text-[9px] text-amber-400">{isRtl ? 'هدف: برد در دست‌ها' : 'First to win'}</div>
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

        {/* ── 3. MAIN BACKGAMMON BOARD ── */}
        <div className={`w-full rounded-[2.5rem] p-3 sm:p-5 border-4 transition-all duration-500 ${themeConfig.boardBg} ${themeConfig.borderDesign} shadow-2xl`}>
          
          {themeConfig.faravaharBg && (
            <div className="text-center py-1 text-[11px] font-black tracking-widest text-amber-400/80 border-b border-white/10 mb-2 uppercase">
              {themeConfig.faravaharBg}
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 h-[320px] sm:h-[390px]">
            
            {/* Left Quadrant (Points 13-18 Top, 12-7 Bottom) */}
            <div className={`flex-1 rounded-2xl p-1.5 sm:p-2.5 flex flex-col justify-between ${themeConfig.innerBg} border border-white/5 shadow-inner`}>
              <div className="flex h-[46%] w-full">
                {[13, 14, 15, 16, 17, 18].map(p => renderPoint(p, true))}
              </div>
              <div className="flex h-[46%] w-full">
                {[12, 11, 10, 9, 8, 7].map(p => renderPoint(p, false))}
              </div>
            </div>

            {/* Center Bar (مهره‌های خورده‌شده) */}
            <div 
              onClick={() => handlePointClick('bar')}
              className={`w-10 sm:w-14 rounded-2xl p-1 flex flex-col items-center justify-between cursor-pointer border border-white/10 ${themeConfig.barBg} shadow-inner ${
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

            {/* Right Quadrant (Points 19-24 Top, 6-1 Bottom) */}
            <div className={`flex-1 rounded-2xl p-1.5 sm:p-2.5 flex flex-col justify-between ${themeConfig.innerBg} border border-white/5 shadow-inner`}>
              <div className="flex h-[46%] w-full">
                {[19, 20, 21, 22, 23, 24].map(p => renderPoint(p, true))}
              </div>
              <div className="flex h-[46%] w-full">
                {[6, 5, 4, 3, 2, 1].map(p => renderPoint(p, false))}
              </div>
            </div>

            {/* Bearing Off Tray (خروج مهره‌ها) */}
            <div 
              onClick={() => handlePointClick('off')}
              className={`w-10 sm:w-12 rounded-2xl p-1 bg-black/40 border border-white/10 flex flex-col justify-between items-center cursor-pointer hover:border-emerald-400 transition-colors shadow-inner ${
                activeValidDestinations.includes('off') ? 'ring-2 ring-emerald-400 bg-emerald-950/30' : ''
              }`}
              title={isRtl ? 'سینی خروج مهره‌ها' : 'Bearing Off Tray'}
            >
              <div className="flex flex-col items-center gap-1 pt-1">
                <span className="text-[8px] font-black text-cyan-400">OUT</span>
                <span className="text-xs font-black text-cyan-300">{borneOff.black}/15</span>
              </div>

              <div className="text-[9px] text-slate-500 font-mono rotate-90">
                TRAY
              </div>

              <div className="flex flex-col items-center gap-1 pb-1">
                <span className="text-xs font-black text-amber-300">{borneOff.white}/15</span>
                <span className="text-[8px] font-black text-amber-400">OUT</span>
              </div>
            </div>

          </div>

          {/* ── 4. DICE & CONTROLS DASHBOARD ── */}
          <div className="mt-3.5 p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            
            {/* Turn Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full ${turn === 'white' ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'}`} />
              <span className="text-xs font-black text-slate-200">
                {turn === 'white' ? (isRtl ? 'نوبت سفید (شما)' : 'White\'s Turn') : (isRtl ? (gameMode === 'bot' ? '🤖 نوبت ربات...' : 'نوبت سیاه') : 'Black\'s Turn')}
              </span>
            </div>

            {/* Interactive 3D Dice (Clickable to roll) */}
            <div 
              onClick={handleRollDice}
              className={`flex items-center gap-3 cursor-pointer p-1 rounded-2xl hover:bg-white/5 transition-all ${
                !hasRolled && !isRolling && (turn === 'white' || gameMode === 'local') ? 'ring-2 ring-amber-400/60 animate-pulse' : ''
              }`}
              title={isRtl ? 'برای پرتاب تاس کلیک کنید' : 'Click to roll dice'}
            >
              {dice[0] !== null && dice[1] !== null ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ rotate: -20, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 flex items-center justify-center text-lg sm:text-xl font-black shadow-lg ${themeConfig.diceBg}`}
                  >
                    {dice[0]}
                  </motion.div>
                  <motion.div
                    initial={{ rotate: 20, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 flex items-center justify-center text-lg sm:text-xl font-black shadow-lg ${themeConfig.diceBg}`}
                  >
                    {dice[1]}
                  </motion.div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  <span>🎲</span>
                  <span>{isRtl ? 'پرتاب تاس' : 'Roll Dice'}</span>
                </div>
              )}

              {/* Remaining Moves */}
              {remainingMoves.length > 0 && (
                <div className="flex items-center gap-1">
                  {remainingMoves.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-500/25 text-emerald-300 font-mono font-black text-xs border border-emerald-400">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Roll Dice or Move Indicator Controls */}
            {hasRolled && remainingMoves.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="px-3.5 py-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs flex items-center gap-1.5 shadow-sm">
                  <span className="animate-bounce">👉</span>
                  <span>{isRtl ? 'مهره را لمس کنید' : 'Tap a checker'}</span>
                </span>
                <button
                  onClick={() => endTurn(points, bar, borneOff, turn)}
                  className="px-2.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-bold transition-colors"
                  title={isRtl ? 'پاس دادن نوبت' : 'Pass Turn'}
                >
                  {isRtl ? 'رد نوبت ⏭️' : 'Pass'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleRollDice}
                disabled={isRolling || (gameMode === 'bot' && turn === 'black') || (gameMode === 'online' && turn !== myOnlineRole)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Shuffle size={14} className={isRolling ? 'animate-spin' : ''} />
                <span>{isRolling ? (isRtl ? 'در چرخش...' : 'Rolling...') : (isRtl ? 'پرتاب تاس 🎲' : 'Roll Dice 🎲')}</span>
              </button>
            )}

          </div>

          {/* Status Message */}
          {lastMoveMsg && (
            <div className="mt-2 text-center py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-amber-300">
              {lastMoveMsg}
            </div>
          )}

        </div>

      </div>

      {/* ── 4. PRE-GAME MATCH SETUP MODAL ── */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        game={{
          id: 'backgammon',
          titleFa: 'تخته نرد شاهانه ایرانی',
          titleEn: 'Royal Persian Backgammon',
          icon: '🎲',
          path: '/games/backgammon'
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
          gameTitle="تخته نرد آنلاین"
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          myRoleName={myOnlineRole === 'white' ? 'سفید (شما)' : 'سیاه (شما)'}
          isRtl={isRtl}
        />
      )}

      {/* ── 6. SET / MATCH VICTORY MODAL ── */}
      <AnimatePresence>
        {matchWinner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-sm rounded-3xl p-6 border-2 border-amber-500/50 bg-slate-900 text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto text-3xl shadow-lg">
                👑
              </div>

              <div>
                <h3 className="text-xl font-black text-amber-300">
                  {isRtl ? '🎉 پیروزی در مچ تخته نرد!' : '🎉 Match Champion!'}
                </h3>
                <p className="text-sm text-slate-200 font-bold mt-1">
                  {isRtl ? `برنده کل مسابقه: بازیکن ${matchWinner === 'white' ? 'سفید' : 'سیاه'}` : `Winner: ${matchWinner}`}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsSetupModalOpen(true)}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-md hover:brightness-110 active:scale-95"
                >
                  {isRtl ? 'مچ جدید 🎮' : 'New Match'}
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
