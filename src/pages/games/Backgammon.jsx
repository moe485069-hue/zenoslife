import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, 
  Users, Bot, Globe, Shield, MessageSquare, Send, Award, Flame, 
  HelpCircle, Settings, ArrowRight, CheckCircle2, Shuffle, Play, Share2,
  Sun, Moon, Undo2, RotateCw
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import BackgammonSetupModal from '../../components/games/BackgammonSetupModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';
import InGameReactions from '../../components/games/InGameReactions';
import ConfettiOverlay from '../../components/games/ConfettiOverlay';
import WaitingForOpponentOverlay from '../../components/games/WaitingForOpponentOverlay';
import realtimeNetwork from '../../services/realtimeNetwork';

// 3D Dice Face Renderer — Enhanced with perspective & depth
const RenderDiceFace = ({ value, isRolling, size = 'md', isSelected = false }) => {
  const displayVal = value ? Math.max(1, Math.min(6, value)) : (isRolling ? 1 : null);
  const pips = displayVal ? {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  }[displayVal] || [4] : [];

  const sizeClasses = size === 'lg' ? 'w-14 h-14 sm:w-16 sm:h-16' : size === 'sm' ? 'w-11 h-11' : 'w-12 h-12 sm:w-14 sm:h-14';
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  if (!displayVal && !isRolling) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white/5 border-2 border-dashed border-amber-400/40 flex items-center justify-center text-amber-300 text-sm font-black`}>
        🎲
      </div>
    );
  }

  return (
    <motion.div
      key={isRolling ? 'dice-rolling' : `dice-${displayVal}`}
      initial={isRolling ? {} : { scale: 0.5, rotateX: 180, rotateY: 90, y: -40 }}
      animate={
        isRolling
          ? {
              rotateX: [0, 120, 240, 360],
              rotateY: [0, -90, 180, 0],
              scale: [0.9, 1.1, 0.85, 1.05],
            }
          : { scale: 1, rotateX: 0, rotateY: 0, y: 0 }
      }
      transition={
        isRolling
          ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring', damping: 12, stiffness: 200, duration: 0.5 }
      }
      style={{ perspective: '600px', transformStyle: 'preserve-3d' }}
      className={`${sizeClasses} rounded-xl bg-gradient-to-br from-[#fffdf5] via-[#fef3c7] to-[#fcd34d] border-2 ${
        isSelected
          ? 'border-amber-400 ring-4 ring-amber-400/80 scale-110 shadow-[0_6px_25px_rgba(251,191,36,0.6)]'
          : 'border-[#b45309] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_0_rgba(255,255,255,0.4)]'
      } p-1.5 flex flex-col justify-between items-center relative select-none shrink-0`}
    >
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 items-center justify-items-center">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
          <div key={idx} className="w-full h-full flex items-center justify-center">
            {pips.includes(idx) && (
              <span className={`${dotSize} rounded-full bg-gradient-to-br from-[#451a03] to-[#78350f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.15)]`} />
            )}
          </div>
        ))}
      </div>
      {value && !isRolling && (
        <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-lg bg-amber-900 text-amber-100 text-[9px] font-black leading-tight border border-amber-600/60 shadow-md font-mono">
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
  ivory: {
    id: 'ivory',
    isLight: true,
    nameFa: 'تم روشن سلطنتی عاج و افرا',
    nameEn: 'Royal Ivory & Maple',
    icon: '☀️',
    boardBg: 'bg-[#fefce8] border-[#b45309]',
    innerBg: 'bg-[#fffbeb]',
    barBg: 'bg-[#fde68a]',
    triLight: 'border-b-[#fed7aa]',
    triDark: 'border-b-[#b45309]',
    triLightTop: 'border-t-[#fed7aa]',
    triDarkTop: 'border-t-[#b45309]',
    checkerWhite: 'bg-gradient-to-b from-[#ffffff] via-[#fffbeb] to-[#fef08a] border-[#d97706] text-[#78350f] shadow-md',
    checkerBlack: 'bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] border-[#020617] text-[#f8fafc] shadow-md',
    accentColor: '#b45309',
    borderDesign: 'border-[#b45309] shadow-xl',
    faravaharBg: '☀️ تم روشن سلطنتی عاج و چوب افرا'
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
    accentColor: '#06b6d4',
    borderDesign: 'border-[#0284c7] shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    faravaharBg: '👑 هخامنشیان • تخت جمشید باستان'
  },
  luxury_gold: {
    id: 'luxury_gold',
    nameFa: 'لوکس آبنوس و طلای ۲۴ عیار',
    nameEn: 'Obsidian & 24K Gold',
    icon: '👑',
    boardBg: 'bg-[#0f0f12] border-[#f59e0b]',
    innerBg: 'bg-[#09090b]',
    barBg: 'bg-[#040405]',
    triLight: 'border-b-[#d97706]',
    triDark: 'border-b-[#1e1b4b]',
    triLightTop: 'border-t-[#d97706]',
    triDarkTop: 'border-t-[#1e1b4b]',
    checkerWhite: 'bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] border-[#fef08a] text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    checkerBlack: 'bg-gradient-to-b from-[#27272a] via-[#18181b] to-[#09090b] border-[#f59e0b]/60 text-[#fef08a] shadow-black',
    accentColor: '#f59e0b',
    borderDesign: 'border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    faravaharBg: '👑 شاهکار آبنوس و طلای ۲۴ عیار سلطنتی'
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
  const paramDiff = searchParams.get('diff');
  const paramTheme = searchParams.get('theme');
  const paramRole = searchParams.get('role');
  const paramAutostart = searchParams.get('autostart'); // Skip setup modal when coming from invite link

  // Match Configuration & Modal State
  const initialMode = paramMode || (paramRoom ? 'online' : 'bot');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(!paramRoom && !paramMode && !paramAutostart);
  const [gameMode, setGameMode] = useState(initialMode); // 'bot' | 'local' | 'online'
  const [matchSets, setMatchSets] = useState(3);
  const [botDifficulty, setBotDifficulty] = useState(paramDiff || 'medium');
  const [boardTheme, setBoardTheme] = useState(paramTheme && THEMES[paramTheme] ? paramTheme : 'wood');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // UI Color Mode ('dark' | 'light')
  const [colorMode, setColorMode] = useState(() => {
    try {
      return localStorage.getItem('backgammon_color_mode') || 'dark';
    } catch (_) {
      return 'dark';
    }
  });

  // Selected Die for Move Priority (e.g. roll 3 & 4, clicking 3 forces playing 3 first)
  const [selectedDie, setSelectedDie] = useState(null);

  // Undo Move History during current turn
  const [moveHistory, setMoveHistory] = useState([]);

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

  // Persistent User Identity & Online Multiplayer State
  const myUserId = useRef(localStorage.getItem('life_os_user_id') || ('usr_' + Math.random().toString(36).substr(2, 7))).current;
  const myUserName = useRef(localStorage.getItem('life_os_user_name') || 'کاربر چاژا').current;

  const [onlineRoomCode, setOnlineRoomCode] = useState(paramRoom || 'NARD-777');
  const [myOnlineRole, setMyOnlineRole] = useState(paramRole || (paramRoom ? 'black' : 'white'));
  
  // Board Perspective Flip (180deg view):
  // When playing as Black, board flips so Black's home is at bottom-left (like Plato)!
  const [manualFlip, setManualFlip] = useState(null);
  const isFlipped = manualFlip !== null ? manualFlip : (myOnlineRole === 'black');

  // === NEW: Waiting for Opponent & Rematch System ===
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(!!paramRoom && !!paramRole); // Guest already has an opponent (the host)
  const [rematchState, setRematchState] = useState(null); // null | 'sent' | 'received' | 'accepted' | 'declined'

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

  // Broadcast Helper for multi-device realtime sync
  const broadcastPayload = (actionType, payload) => {
    if (gameMode !== 'online') return;
    const packet = {
      type: 'GAME_ACTION',
      gameType: 'backgammon',
      roomCode: onlineRoomCode,
      senderId: myUserId,
      senderName: myUserName,
      actionType,
      payload,
      timestamp: Date.now()
    };
    // 1. Universal Realtime Network
    realtimeNetwork.publish(packet, `zenoslife_v3_game_${onlineRoomCode}`);
    // 2. Local tab fallback
    try {
      chatChannelRef.current?.postMessage(packet);
    } catch (_) {}
  };

  // ----------------------------------------------------
  // ONLINE MULTIPLAYER REALTIME SYNC
  // ----------------------------------------------------
  useEffect(() => {
    if (gameMode === 'online') {
      // 1. Connect to Universal Realtime WebSocket/SSE
      realtimeNetwork.subscribeGameRoom(onlineRoomCode);

      const handleIncomingAction = (data) => {
        if (!data || data.roomCode !== onlineRoomCode) return;
        if (data.senderId === myUserId) return; // ignore own packets

        const { actionType, payload } = data;
        if (actionType === 'CHAT') {
          setChatMessages(prev => [...prev, payload]);
          soundEngine.playTap?.();
        } else if (actionType === 'DICE_ROLLED') {
          setDice(payload.dice);
          setRemainingMoves(payload.moves);
          setHasRolled(true);
          setTurn(payload.turn || (myOnlineRole === 'white' ? 'black' : 'white'));
          setLastMoveMsg(isRtl ? `🎲 حریف تاس انداخت: ${payload.dice[0]} و ${payload.dice[1]}` : `Opponent rolled ${payload.dice[0]} & ${payload.dice[1]}`);
          soundEngine.playDiceRoll?.();
          haptics.tap?.();
        } else if (actionType === 'BOARD_UPDATE') {
          setPoints(payload.points);
          setBar(payload.bar);
          setBorneOff(payload.borneOff);
          setTurn(payload.turn);
          setRemainingMoves(payload.remainingMoves || []);
          setHasRolled(payload.hasRolled || false);
          setSelectedPoint(null);
          if (payload.lastMsg) setLastMoveMsg(payload.lastMsg);
          soundEngine.playCheckmark?.();
        } else if (actionType === 'PLAYER_JOINED') {
          setLastMoveMsg(isRtl ? `👋 ${data.senderName || 'حریف'} وارد بازی شد!` : `Opponent joined!`);
          soundEngine.playLevelUp?.();
          setIsWaitingForOpponent(false); // Dismiss waiting overlay
          setOpponentJoined(true);
          // Auto Role Handshake: if newcomer claims same role, host keeps white & assigns black to newcomer
          if (payload?.role === myOnlineRole) {
            if (myOnlineRole === 'white') {
              broadcastPayload('ROLE_ASSIGN', { targetUserId: data.senderId, role: 'black' });
            } else {
              setMyOnlineRole('white');
            }
          }
        } else if (actionType === 'ROLE_ASSIGN') {
          if (payload?.targetUserId === myUserId && payload.role) {
            setMyOnlineRole(payload.role);
            setLastMoveMsg(isRtl ? `🎨 رنگ شما به ${payload.role === 'white' ? 'سفید' : 'سیاه'} تنظیم شد` : `Assigned role: ${payload.role}`);
          }
        } else if (actionType === 'SET_WIN') {
          setSetWinner(payload.setWinner);
          if (payload.scoreWhite !== undefined) setScoreWhite(payload.scoreWhite);
          if (payload.scoreBlack !== undefined) setScoreBlack(payload.scoreBlack);
          soundEngine.playLevelUp?.();
        // === REMATCH PROTOCOL ===
        } else if (actionType === 'REMATCH_REQUEST') {
          setRematchState('received');
          setLastMoveMsg(isRtl ? `🔄 ${data.senderName || 'حریف'} درخواست بازی مجدد داده!` : `${data.senderName || 'Opponent'} wants a rematch!`);
          soundEngine.playLevelUp?.();
          haptics.success?.();
        } else if (actionType === 'REMATCH_ACCEPT') {
          setRematchState('accepted');
          // Swap colors and reset match
          setMyOnlineRole(prev => prev === 'white' ? 'black' : 'white');
          setManualFlip(null);
          handleResetMatch();
          setRematchState(null);
          setLastMoveMsg(isRtl ? '🎲 بازی مجدد شروع شد! رنگ‌ها عوض شدند.' : '🎲 Rematch started! Colors swapped.');
          soundEngine.playLevelUp?.();
        } else if (actionType === 'REMATCH_DECLINE') {
          setRematchState('declined');
          setLastMoveMsg(isRtl ? '❌ حریف درخواست بازی مجدد را رد کرد.' : 'Opponent declined the rematch.');
          soundEngine.playTap?.();
        }
      };

      const unsubscribe = realtimeNetwork.subscribe(handleIncomingAction);

      // 2. BroadcastChannel for local same-device tabs fallback
      const channel = new BroadcastChannel(`lifeos_backgammon_${onlineRoomCode}`);
      chatChannelRef.current = channel;
      channel.onmessage = (event) => {
        handleIncomingAction(event.data);
      };

      // Announce arrival
      setTimeout(() => {
        broadcastPayload('PLAYER_JOINED', { role: myOnlineRole });
      }, 500);

      return () => {
        unsubscribe?.();
        channel.close();
        realtimeNetwork.leaveGameRoom();
      };
    }
  }, [gameMode, onlineRoomCode, myOnlineRole]);

  // In-Game Chat Message Sender
  const handleSendMessage = (text) => {
    if (!text || !text.trim()) return;
    const roleText = myOnlineRole === 'white' ? (isRtl ? 'سفید' : 'White') : (isRtl ? 'سیاه' : 'Black');
    const msgObj = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      text: text.trim(),
      sender: `${myUserName} (${roleText})`,
      senderId: myUserId,
      time: new Date().toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setChatMessages(prev => [...prev, msgObj]);
    soundEngine.playTap?.();

    if (gameMode === 'online') {
      broadcastPayload('CHAT', {
        ...msgObj,
        isMe: false
      });
    }
  };

  const rollIntervalRef = useRef(null);

  // ----------------------------------------------------
  // DICE ROLLING WITH TUMBLING ANIMATION
  // ----------------------------------------------------
  const rollDiceAction = () => {
    if (isRolling) return;
    setIsRolling(true);
    setMoveHistory([]);
    setSelectedDie(null);
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
          if (bar[turn] > 0) {
            setLastMoveMsg(isRtl ? `⚠️ شما ${bar[turn]} مهره خورده دارید! روی جایگاه خورده‌ها بزنید تا وارد بازی شود.` : `You have ${bar[turn]} eaten checker(s)! Tap the bar slot to re-enter.`);
            playSfx(soundEngine.playTap);
          } else if (d1 === d2) {
            incrementGameStat?.('doublesRolled');
            setLastMoveMsg(isRtl ? `🎉 جفت ${d1} آوردی! ۴ حرکت مجاز داری.` : `🎉 Doubles ${d1}! 4 moves available.`);
            playSfx(soundEngine.playLevelUp);
            haptics.success?.();
          } else {
            setLastMoveMsg(isRtl ? `تاس: ${d1} و ${d2} — مهره‌های چشمک‌زن را لمس کنید` : `Dice: ${d1} & ${d2} — Tap a glowing checker`);
          }

          if (gameMode === 'online') {
            broadcastPayload('DICE_ROLLED', {
              dice: rolledDice,
              moves,
              turn
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
    if (gameMode === 'bot' && turn === 'black') {
      setLastMoveMsg(isRtl ? '🤖 نوبت ربات هوشمند است...' : 'Bot is thinking...');
      return;
    }
    if (gameMode === 'online' && turn !== myOnlineRole) {
      const needed = turn === 'white' ? (isRtl ? 'سفید' : 'White') : (isRtl ? 'سیاه' : 'Black');
      setLastMoveMsg(isRtl 
        ? `⏳ اکنون نوبت مهره‌های ${needed} است! منتظر تاس حریف بمانید یا رنگ خود را از نوار بالا تغییر دهید.` 
        : `Waiting for ${needed} to roll.`);
      soundEngine.playTap?.();
      return;
    }

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
    // If a die is explicitly clicked/selected by user, prioritize ONLY that die if present in available moves
    const uniqueMoves = (selectedDie !== null && currentMoves.includes(selectedDie))
      ? [selectedDie]
      : Array.from(new Set(currentMoves));

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

      // Prioritize exact bearing off match when clicking home checkers
      const exactOffMove = moves.find(m => m.target === 'off' && (turn === 'white' ? pointIdx === m.dieUsed : (25 - pointIdx) === m.dieUsed));
      if (exactOffMove && isHomeBoardReady(turn, points, bar)) {
        executeMove(pointIdx, 'off', exactOffMove.dieUsed);
        return;
      }

      setSelectedPoint(pointIdx);
      playSfx(soundEngine.playTap);
    }
  };

  const executeMove = (from, to, dieUsed) => {
    // 1. Snapshot board state for Undo functionality
    setMoveHistory(prev => [
      ...prev,
      {
        points: points.map(p => ({ ...p })),
        bar: { ...bar },
        borneOff: { ...borneOff },
        remainingMoves: [...remainingMoves],
        selectedDie,
        lastMoveMsg
      }
    ]);

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
        setLastMoveMsg(isRtl ? `💥 مهره ${opponent === 'white' ? 'سفید' : 'سیاه'} زده شد و به جایگاه خورده‌ها رفت!` : `💥 Hit ${opponent} blot to the eaten slot!`);
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

    // If selected die was played or no longer available, clear or auto-select remaining
    if (selectedDie === dieUsed || !newMoves.includes(selectedDie)) {
      setSelectedDie(newMoves.length === 1 ? newMoves[0] : null);
    }

    if (gameMode === 'online') {
      broadcastPayload('BOARD_UPDATE', {
        points: newPoints,
        bar: newBar,
        borneOff: newBorneOff,
        turn,
        remainingMoves: newMoves,
        hasRolled: true,
        lastMsg: isRtl ? `حریف یک مهره حرکت داد` : `Opponent moved a checker`
      });
    }

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

  const handleUndoMove = () => {
    if (moveHistory.length === 0) return;
    const lastSnapshot = moveHistory[moveHistory.length - 1];
    setMoveHistory(prev => prev.slice(0, -1));
    setPoints(lastSnapshot.points);
    setBar(lastSnapshot.bar);
    setBorneOff(lastSnapshot.borneOff);
    setRemainingMoves(lastSnapshot.remainingMoves);
    setSelectedPoint(null);
    setSelectedDie(lastSnapshot.selectedDie || null);
    setLastMoveMsg(isRtl ? '↩️ حرکت قبلی بازگردانده شد' : 'Previous move undone');
    playSfx(soundEngine.playTap);
    haptics.tap?.();

    if (gameMode === 'online') {
      broadcastPayload('BOARD_UPDATE', {
        points: lastSnapshot.points,
        bar: lastSnapshot.bar,
        borneOff: lastSnapshot.borneOff,
        turn,
        remainingMoves: lastSnapshot.remainingMoves,
        hasRolled: true,
        lastMsg: isRtl ? 'حریف حرکت خود را بازگرداند' : 'Opponent undid move'
      });
    }
  };

  const endTurn = (pts = points, curBar = bar, curOff = borneOff, currentActiveTurn = turn) => {
    const nextTurn = currentActiveTurn === 'white' ? 'black' : 'white';
    setTurn(nextTurn);
    setRemainingMoves([]);
    setHasRolled(false);
    setSelectedPoint(null);
    setSelectedDie(null);
    setMoveHistory([]);
    setDice([null, null]);

    const isNextMe = gameMode === 'bot' 
      ? nextTurn === 'white' 
      : (gameMode === 'online' ? nextTurn === myOnlineRole : true);

    if (isNextMe) {
      setLastMoveMsg(isRtl ? 'نوبت شماست! دکمه پرتاب تاس را بزنید 🎲' : 'Your turn! Roll the dice 🎲');
    } else {
      setLastMoveMsg(isRtl ? `⏳ نوبت ${nextTurn === 'white' ? 'سفید' : 'سیاه'} است...` : 'Opponent is playing...');
    }

    if (gameMode === 'online') {
      broadcastPayload('BOARD_UPDATE', {
        points: pts,
        bar: curBar,
        borneOff: curOff,
        turn: nextTurn,
        remainingMoves: [],
        hasRolled: false,
        lastMsg: isRtl ? `نوبت ${nextTurn === 'white' ? 'سفید' : 'سیاه'} است` : `Turn passed`
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

    if (gameMode === 'online') {
      broadcastPayload('SET_WIN', {
        setWinner: { winner, type: winType, pts: setPointsEarned },
        scoreWhite: newScoreW,
        scoreBlack: newScoreB
      });
    }

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

    // AI Difficulty Heuristics
    if (botDifficulty === 'easy' && Math.random() < 0.35) {
      const randomIdx = Math.floor(Math.random() * allPossibleMoves.length);
      const chosen = allPossibleMoves[randomIdx];
      return executeMove(chosen.from, chosen.to, chosen.dieUsed);
    }

    allPossibleMoves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // 1. Bearing off is prioritized (+160)
      if (a.to === 'off') scoreA += 160;
      if (b.to === 'off') scoreB += 160;

      // 2. Hitting opponent's blot (+130)
      if (typeof a.to === 'number' && points[a.to].player === 'white' && points[a.to].count === 1) scoreA += 130;
      if (typeof b.to === 'number' && points[b.to].player === 'white' && points[b.to].count === 1) scoreB += 130;

      // 3. Making an anchor/prime by landing on friendly single checker (+90)
      if (typeof a.to === 'number' && points[a.to].player === 'black' && points[a.to].count === 1) scoreA += 90;
      if (typeof b.to === 'number' && points[b.to].player === 'black' && points[b.to].count === 1) scoreB += 90;

      // 4. Master AI tactical positioning
      if (botDifficulty === 'master') {
        // Run back checkers out of white home board (+40)
        if (typeof a.from === 'number' && a.from <= 6) scoreA += 40;
        if (typeof b.from === 'number' && b.from <= 6) scoreB += 40;

        // Penalize exposing single blot if it leaves it open to direct attack
        if (typeof a.to === 'number' && points[a.to].count === 0 && a.to < 18) scoreA -= 25;
        if (typeof b.to === 'number' && points[b.to].count === 0 && b.to < 18) scoreB -= 25;
      }

      return scoreB - scoreA;
    });

    const chosen = allPossibleMoves[0];
    executeMove(chosen.from, chosen.to, chosen.dieUsed);
  };

  // Pip Counts & Advantage
  const isWhiteMe = gameMode === 'bot' || myOnlineRole === 'white';
  const pipWhite = points.reduce((acc, p, idx) => acc + (p.player === 'white' ? p.count * idx : 0), 0) + (bar.white * 25);
  const pipBlack = points.reduce((acc, p, idx) => acc + (p.player === 'black' ? p.count * (25 - idx) : 0), 0) + (bar.black * 25);

  const getPipAdvantageText = () => {
    if (pipWhite === pipBlack) return isRtl ? 'پیپ: مساوی' : 'Pips: Tied';
    if (pipWhite < pipBlack) {
      const lead = pipBlack - pipWhite;
      return isRtl ? `⚪ +${lead} پیپ پیشتاز` : `⚪ +${lead} pips ahead`;
    } else {
      const lead = pipWhite - pipBlack;
      return isRtl ? `⚫ +${lead} پیپ پیشتاز` : `⚫ +${lead} pips ahead`;
    }
  };

  const activeValidDestinations = selectedPoint !== null 
    ? getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn).map(m => m.target)
    : [];

  // Checkers Stack — 3D Tactile Lathe-Turned Pieces
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
              className={`w-5 h-5 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all relative ${checkerStyle} ${
                isSelected && isTopChecker 
                  ? 'ring-4 ring-amber-400 scale-115 shadow-[0_0_15px_rgba(251,191,36,0.9)] z-30' 
                  : isFriendlyAndMovable && isTopChecker 
                    ? 'ring-2 ring-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse' 
                    : 'shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.4)]'
              }`}
            >
              {/* Concentric Engraved Ring for authentic 3D lathe-turned backgammon checker look */}
              <div className="w-[66%] h-[66%] rounded-full border border-current opacity-30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-none">
                {idx === maxVisible - 1 && pt.count > 5 ? (
                  <span className="text-[10px] font-black opacity-100">{pt.count}</span>
                ) : null}
              </div>
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
          isSelected 
            ? 'bg-amber-400/25 ring-2 ring-amber-400 rounded-lg' 
            : isValidTarget 
              ? 'bg-emerald-500/20 ring-2 ring-emerald-400 rounded-lg shadow-[0_0_12px_rgba(52,211,153,0.4)]' 
              : 'hover:bg-white/5'
        }`}
      >
        {/* Triangle Background */}
        <div
          className={`w-0 h-0 border-x-[8px] xs:border-x-[11px] sm:border-x-[16px] border-x-transparent ${
            isTop
              ? isDark ? themeConfig.triDarkTop : themeConfig.triLightTop
              : isDark ? themeConfig.triDark : themeConfig.triLight
          } ${isTop ? 'border-t-[100px] sm:border-t-[130px]' : 'border-b-[100px] sm:border-b-[130px]'} opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]`}
        />

        {/* Valid Destination Indicator (clean at tip of triangle without obscuring checkers) */}
        {isValidTarget && (
          <div className={`absolute ${isTop ? 'bottom-2' : 'top-2'} pointer-events-none z-20`}>
            <div className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] shadow-lg animate-bounce flex items-center gap-0.5">
              <span>🎯</span>
              <span>{pIdx}</span>
            </div>
          </div>
        )}

        {/* High Legibility Point Label Number */}
        <span className={`absolute ${isTop ? 'top-1' : 'bottom-1'} px-1 py-0.2 rounded font-mono font-black text-[9px] z-10 select-none shadow-sm ${
          colorMode === 'light' 
            ? 'bg-white/90 text-slate-900 border border-slate-300' 
            : 'bg-black/80 text-amber-300 border border-amber-500/30'
        }`}>
          {pIdx}
        </span>

        {/* Checkers Stack */}
        {renderCheckersStack(pt, isTop, pIdx, isSelected, isFriendlyAndMovable)}
      </div>
    );
  };

  return (
    <div className={`min-h-screen pb-24 select-none font-sans transition-colors duration-300 ${
      colorMode === 'light' ? 'bg-[#f1f5f9] text-slate-900' : 'bg-[#050711] text-white'
    }`} dir="rtl">
      
      {/* 1. Header (Clean & Sleek) */}
      <div className={`sticky top-0 z-30 px-3 py-2.5 backdrop-blur-xl border-b flex items-center justify-between transition-colors ${
        colorMode === 'light'
          ? 'bg-white/95 text-slate-900 border-slate-200 shadow-sm'
          : 'bg-slate-900/95 text-white border-white/10'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/games')}
            className={`p-2 rounded-xl active:scale-95 transition-all ${
              colorMode === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 text-white'
            }`}
            title={isRtl ? 'بازگشت به بازی‌ها' : 'Back to Games'}
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`text-sm sm:text-base font-black ${
                colorMode === 'light' ? 'text-amber-800' : 'text-amber-300'
              }`}>
                تخته نرد چاژا 🎲
              </h1>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                colorMode === 'light' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-white/10 text-amber-200'
              }`}>
                {gameMode === 'bot' ? '🤖 ربات' : (gameMode === 'telegram' || gameMode === 'online') ? `⚔️ ${onlineRoomCode || 'آنلاین'}` : '📱 دونفره'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => {
              setColorMode(prev => {
                const next = prev === 'dark' ? 'light' : 'dark';
                try {
                  localStorage.setItem('backgammon_color_mode', next);
                } catch (_) {}
                return next;
              });
              soundEngine.playTap?.();
            }}
            className={`p-1.5 rounded-xl text-xs transition-all active:scale-90 ${
              colorMode === 'light' 
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300' 
                : 'bg-white/5 text-amber-300 hover:bg-white/10'
            }`}
            title={colorMode === 'light' ? 'حالت تاریک' : 'حالت روشن'}
          >
            {colorMode === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Quick Telegram Invite Button */}
          <button
            onClick={() => {
              setIsSetupModalOpen(true);
              soundEngine.playTap?.();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 text-xs font-black hover:bg-sky-500/30 flex items-center gap-1 active:scale-95 transition-all"
            title="دعوت دوستان در تلگرام"
          >
            <Share2 size={13} />
            <span className="text-[10px]">دعوت</span>
          </button>

          {/* In-Game Chat Toggle */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              soundEngine.playTap?.();
            }}
            className={`p-1.5 rounded-xl relative transition-all ${
              colorMode === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-indigo-700'
                : 'bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white'
            }`}
            title="چت حین بازی"
          >
            <MessageSquare size={15} />
            {chatMessages.length > 1 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                {chatMessages.length - 1}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => {
              const themesKeys = Object.keys(THEMES);
              const nextIdx = (themesKeys.indexOf(boardTheme) + 1) % themesKeys.length;
              setBoardTheme(themesKeys[nextIdx]);
              soundEngine.playTap?.();
            }}
            className={`p-1.5 rounded-xl text-xs transition-all ${
              colorMode === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
            title="تغییر ظاهر تخته"
          >
            {themeConfig.icon}
          </button>

          {/* Perspective Flip Button (180deg view) */}
          <button
            onClick={() => {
              setManualFlip(prev => (prev === null ? !isFlipped : !prev));
              soundEngine.playTap?.();
            }}
            className={`p-1.5 rounded-xl text-xs transition-all active:scale-90 ${
              isFlipped
                ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 shadow-sm'
                : (colorMode === 'light' ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-white/5 text-slate-300 hover:text-white')
            }`}
            title={isRtl ? (isFlipped ? 'زاویه دید: مهره‌های سیاه (پلاتو) • کلیک برای معکوس' : 'زاویه دید: مهره‌های سفید • کلیک برای چرخش ۱۸۰ درجه') : 'Flip Board Perspective'}
          >
            <RotateCw size={15} className={isFlipped ? 'text-amber-400' : ''} />
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className={`p-1.5 rounded-xl transition-all ${
              colorMode === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/5 text-slate-300 hover:text-white'
            }`}
            title="تنظیمات بازی"
          >
            <Settings size={15} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-xl transition-all ${
              colorMode === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
            title="صدا"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto min-h-[calc(100vh-70px)] p-2.5 sm:p-4 space-y-2.5">

        {/* 2. Sleek Compact Scoreboard */}
        <div className={`py-2 px-3 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md border transition-colors ${
          colorMode === 'light'
            ? 'bg-white/95 border-slate-300 text-slate-900 shadow-md'
            : 'bg-black/40 border-white/10 text-white shadow-lg'
        }`}>
          {/* White Player */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 border border-amber-300 shadow-sm flex items-center justify-center text-xs font-black text-black shrink-0">
              {scoreWhite}
            </div>
            <div>
              <span className={`text-[11px] font-black block leading-tight ${
                colorMode === 'light' ? 'text-amber-800' : 'text-amber-300'
              }`}>
                {gameMode === 'bot' 
                  ? (isRtl ? 'سفید (شما)' : 'White (You)') 
                  : (myOnlineRole === 'white' ? (isRtl ? 'سفید (شما)' : 'White (You)') : (isRtl ? 'سفید (حریف)' : 'White (Opponent)'))}
              </span>
              <span className={`text-[9px] font-mono font-bold ${
                colorMode === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                پیپ: {pipWhite}
              </span>
            </div>
          </div>

          {/* Match Set Pill */}
          <div className={`text-center px-2.5 py-1 rounded-xl border ${
            colorMode === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-white/5 border-white/10'
          }`}>
            <div className={`text-[11px] font-black font-mono ${
              colorMode === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              ست {currentSet} از {matchSets}
            </div>
            <div className={`text-[9px] font-bold ${
              turn === 'white' 
                ? (colorMode === 'light' ? 'text-amber-700' : 'text-amber-300')
                : (colorMode === 'light' ? 'text-cyan-700' : 'text-cyan-300')
            }`}>
              {turn === 'white' ? '⚪ نوبت سفید' : '⚫ نوبت سیاه'}
            </div>
          </div>

          {/* Black Player */}
          <div className="flex items-center gap-2">
            <div className="text-end">
              <span className={`text-[11px] font-black block leading-tight ${
                colorMode === 'light' ? 'text-cyan-800' : 'text-cyan-300'
              }`}>
                {gameMode === 'bot' 
                  ? (isRtl ? '🤖 ربات' : '🤖 Bot') 
                  : (myOnlineRole === 'black' ? (isRtl ? 'سیاه (شما)' : 'Black (You)') : (isRtl ? 'سیاه (حریف)' : 'Black (Opponent)'))}
              </span>
              <span className={`text-[9px] font-mono font-bold ${
                colorMode === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                پیپ: {pipBlack}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-b from-cyan-600 to-cyan-800 border border-cyan-400 shadow-sm flex items-center justify-center text-xs font-black text-white shrink-0">
              {scoreBlack}
            </div>
          </div>
        </div>

        {/* 2.5. Online Room Info & Role Selector Bar */}
        {gameMode === 'online' && (
          <div className={`py-2 px-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 shadow-md transition-colors ${
            colorMode === 'light'
              ? 'bg-sky-50/90 border-sky-200 text-slate-900'
              : 'bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-indigo-950/60 border-cyan-500/30 text-white'
          }`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-xs font-black">
                اتاق: <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-500">{onlineRoomCode}</code>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 font-bold border border-cyan-400/30">
                {myOnlineRole === 'white' ? '⚪ شما: سفید (شروع‌کننده)' : '⚫ شما: سیاه'}
              </span>
            </div>

            {/* In-Game Chat Button */}
            <button
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                soundEngine.playTap?.();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black active:scale-95 transition-all shadow-sm"
            >
              <MessageSquare size={13} />
              <span>چت ({chatMessages.length})</span>
            </button>
          </div>
        )}

        {/* 3. Main Board */}
        <div className={`w-full rounded-[2.2rem] p-2.5 sm:p-3.5 border-4 transition-all duration-300 ${themeConfig.boardBg} ${themeConfig.borderDesign} shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.15)] relative`}>

          <div className="flex gap-1.5 sm:gap-2.5 h-[280px] xs:h-[320px] sm:h-[400px]">
            
            {/* If Flipped (Black Perspective): Tray is on Left */}
            {isFlipped && (
              <div 
                onClick={() => {
                  if (activeValidDestinations.includes('off')) {
                    const validMoves = getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn);
                    const offMove = validMoves.find(m => m.target === 'off');
                    if (offMove) executeMove(selectedPoint, 'off', offMove.dieUsed);
                  }
                }}
                className={`w-9 sm:w-11 rounded-2xl p-1 border-2 flex flex-col justify-between items-center cursor-pointer transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] shrink-0 ${
                  colorMode === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-black/60 border-white/10'
                } ${
                  activeValidDestinations.includes('off') ? 'ring-4 ring-emerald-400 bg-emerald-500/20 animate-pulse' : 'hover:border-emerald-400'
                }`}
                title={isRtl ? 'سینی خروج مهره‌ها (بردن بیرون)' : 'Bearing Off Tray'}
              >
                <div className="flex flex-col items-center gap-0.5 pt-1">
                  <span className="text-[7px] font-black text-amber-500">خروج</span>
                  <span className="text-xs font-black text-amber-500 font-mono">{borneOff.white}/15</span>
                </div>

                <div className={`text-[8px] font-mono rotate-90 font-black tracking-widest ${colorMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  TRAY
                </div>

                <div className="flex flex-col items-center gap-0.5 pb-1">
                  <span className="text-xs font-black text-cyan-400 font-mono">{borneOff.black}/15</span>
                  <span className="text-[7px] font-black text-cyan-400">خروج</span>
                </div>
              </div>
            )}

            {/* Left Quadrant:
                Normal: Outer Board (13-18 Top, 12-7 Bottom)
                Flipped: Black Home Board at Bottom-Left (24-19 Bottom, 1-6 Top) */}
            <div className={`flex-1 rounded-2xl p-1 sm:p-2 flex flex-col justify-between ${themeConfig.innerBg} border-2 border-white/10 shadow-[inset_0_4px_16px_rgba(0,0,0,0.7)]`}>
              <div className="flex h-[46%] w-full">
                {(isFlipped ? [1, 2, 3, 4, 5, 6] : [13, 14, 15, 16, 17, 18]).map(p => renderPoint(p, true))}
              </div>
              <div className="flex h-[46%] w-full">
                {(isFlipped ? [24, 23, 22, 21, 20, 19] : [12, 11, 10, 9, 8, 7]).map(p => renderPoint(p, false))}
              </div>
            </div>

            {/* Center Bar — Dedicated Hit Checkers Jail (جایگاه مهره‌های خورده) */}
            {(() => {
              const topColor = isFlipped ? 'white' : 'black';
              const topCount = isFlipped ? bar.white : bar.black;
              const topCheckerStyle = topColor === 'white' ? themeConfig.checkerWhite : themeConfig.checkerBlack;

              const bottomColor = isFlipped ? 'black' : 'white';
              const bottomCount = isFlipped ? bar.black : bar.white;
              const bottomCheckerStyle = bottomColor === 'white' ? themeConfig.checkerWhite : themeConfig.checkerBlack;

              return (
                <div 
                  className={`w-14 xs:w-16 sm:w-20 rounded-2xl py-1.5 px-1 flex flex-col items-center justify-between border-2 border-amber-600/30 ${themeConfig.barBg} shadow-[inset_0_0_15px_rgba(0,0,0,0.9),0_0_10px_rgba(0,0,0,0.5)] shrink-0`}
                >
                  {/* Top Hit Slot */}
                  <div 
                    onClick={() => {
                      if (topColor === turn && topCount > 0) handlePointClick('bar');
                    }}
                    className={`w-full flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
                      topCount > 0 && topColor === turn
                        ? 'ring-2 ring-amber-400 bg-amber-500/25 shadow-lg animate-pulse'
                        : 'hover:bg-white/5'
                    }`}
                    title={topCount > 0 ? (isRtl ? `${topCount} مهره خورده ${topColor === 'white' ? 'سفید' : 'سیاه'} — کلیک برای ورود` : `${topCount} hit ${topColor} checkers`) : (isRtl ? 'جایگاه مهره‌های خورده' : 'Hit slot')}
                  >
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter mb-1">
                      {topColor === 'white' ? '⚪ خورده' : '⚫ خورده'}
                    </span>

                    {/* Recessed Pocket */}
                    <div className={`w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center relative transition-all ${
                      topCount > 0
                        ? 'bg-black/80 border-2 border-amber-400/70 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]'
                        : 'bg-black/35 border border-dashed border-white/15'
                    }`}>
                      {topCount > 0 ? (
                        <div className="relative flex items-center justify-center">
                          {topCount > 1 && (
                            <div className={`absolute -top-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full border opacity-50 ${topCheckerStyle}`} />
                          )}
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs relative shadow-lg ${topCheckerStyle}`}>
                            <div className="w-[66%] h-[66%] rounded-full border border-current opacity-30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-none" />
                          </div>
                          {/* Count Badge */}
                          <span className="absolute -bottom-2 -left-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[8px] font-black shadow-md border border-rose-400 leading-none">
                            {topCount}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[8px] font-black text-slate-500/60">۰</span>
                      )}
                    </div>

                    {topCount > 0 && topColor === turn && (
                      <span className="mt-1 px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[7px] leading-tight shadow animate-bounce">
                        ورود 🎯
                      </span>
                    )}
                  </div>

                  {/* Classical Brass Hinge & Inlaid Centerpiece */}
                  <div className="flex flex-col items-center justify-center py-1 opacity-75 select-none pointer-events-none">
                    <div className="w-6 sm:w-8 h-1 rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 shadow-sm border border-amber-950" />
                    <span className="text-xs my-0.5">⚜️</span>
                    <div className="w-6 sm:w-8 h-1 rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 shadow-sm border border-amber-950" />
                  </div>

                  {/* Bottom Hit Slot */}
                  <div 
                    onClick={() => {
                      if (bottomColor === turn && bottomCount > 0) handlePointClick('bar');
                    }}
                    className={`w-full flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
                      bottomCount > 0 && bottomColor === turn
                        ? 'ring-2 ring-amber-400 bg-amber-500/25 shadow-lg animate-pulse'
                        : 'hover:bg-white/5'
                    }`}
                    title={bottomCount > 0 ? (isRtl ? `${bottomCount} مهره خورده ${bottomColor === 'white' ? 'سفید' : 'سیاه'} — کلیک برای ورود` : `${bottomCount} hit ${bottomColor} checkers`) : (isRtl ? 'جایگاه مهره‌های خورده' : 'Hit slot')}
                  >
                    {bottomCount > 0 && bottomColor === turn && (
                      <span className="mb-1 px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[7px] leading-tight shadow animate-bounce">
                        ورود 🎯
                      </span>
                    )}

                    {/* Recessed Pocket */}
                    <div className={`w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center relative transition-all ${
                      bottomCount > 0
                        ? 'bg-black/80 border-2 border-amber-400/70 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]'
                        : 'bg-black/35 border border-dashed border-white/15'
                    }`}>
                      {bottomCount > 0 ? (
                        <div className="relative flex items-center justify-center">
                          {bottomCount > 1 && (
                            <div className={`absolute -top-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full border opacity-50 ${bottomCheckerStyle}`} />
                          )}
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs relative shadow-lg ${bottomCheckerStyle}`}>
                            <div className="w-[66%] h-[66%] rounded-full border border-current opacity-30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-none" />
                          </div>
                          {/* Count Badge */}
                          <span className="absolute -bottom-2 -left-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[8px] font-black shadow-md border border-rose-400 leading-none">
                            {bottomCount}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[8px] font-black text-slate-500/60">۰</span>
                      )}
                    </div>

                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter mt-1">
                      {bottomColor === 'white' ? '⚪ خورده' : '⚫ خورده'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Right Quadrant:
                Normal: Home Board (19-24 Top, 6-1 Bottom)
                Flipped: Outer Board (7-12 Top, 18-13 Bottom) */}
            <div className={`flex-1 rounded-2xl p-1 sm:p-2 flex flex-col justify-between ${themeConfig.innerBg} border-2 border-white/10 shadow-[inset_0_4px_16px_rgba(0,0,0,0.7)]`}>
              <div className="flex h-[46%] w-full">
                {(isFlipped ? [7, 8, 9, 10, 11, 12] : [19, 20, 21, 22, 23, 24]).map(p => renderPoint(p, true))}
              </div>
              <div className="flex h-[46%] w-full">
                {(isFlipped ? [18, 17, 16, 15, 14, 13] : [6, 5, 4, 3, 2, 1]).map(p => renderPoint(p, false))}
              </div>
            </div>

            {/* If NOT Flipped (White Perspective): Tray is on Right */}
            {!isFlipped && (
              <div 
                onClick={() => {
                  if (activeValidDestinations.includes('off')) {
                    const validMoves = getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn);
                    const offMove = validMoves.find(m => m.target === 'off');
                    if (offMove) executeMove(selectedPoint, 'off', offMove.dieUsed);
                  }
                }}
                className={`w-9 sm:w-11 rounded-2xl p-1 border-2 flex flex-col justify-between items-center cursor-pointer transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] shrink-0 ${
                  colorMode === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-black/60 border-white/10'
                } ${
                  activeValidDestinations.includes('off') ? 'ring-4 ring-emerald-400 bg-emerald-500/20 animate-pulse' : 'hover:border-emerald-400'
                }`}
                title={isRtl ? 'سینی خروج مهره‌ها (بردن بیرون)' : 'Bearing Off Tray'}
              >
                <div className="flex flex-col items-center gap-0.5 pt-1">
                  <span className="text-[7px] font-black text-cyan-400">خروج</span>
                  <span className="text-xs font-black text-cyan-400 font-mono">{borneOff.black}/15</span>
                </div>

                <div className={`text-[8px] font-mono rotate-90 font-black tracking-widest ${colorMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  TRAY
                </div>

                <div className="flex flex-col items-center gap-0.5 pb-1">
                  <span className="text-xs font-black text-amber-500 font-mono">{borneOff.white}/15</span>
                  <span className="text-[7px] font-black text-amber-500">خروج</span>
                </div>
              </div>
            )}

          </div>

          {/* 4. Sleek Compact Tournament Controls Bar */}
          <div className={`mt-2.5 p-2 sm:p-2.5 rounded-2xl border transition-all ${
            colorMode === 'light' 
              ? 'bg-white/95 border-slate-300 shadow-md text-slate-800' 
              : 'bg-black/75 border-white/10 shadow-xl text-white'
          }`}>
            <div className="flex items-center justify-between gap-1.5 sm:gap-3 flex-wrap">
              
              {/* Turn & Pip Race Info */}
              <div className="flex items-center gap-2">
                <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                  turn === 'white' ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'
                }`} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-black leading-tight">
                    {turn === 'white'
                      ? (isWhiteMe ? (isRtl ? '⚪ نوبت شما' : '⚪ Your Turn') : (isRtl ? '⚪ نوبت حریف' : '⚪ Opponent'))
                      : (gameMode === 'bot' ? '🤖 ربات...' : (!isWhiteMe ? (isRtl ? '⚫ نوبت شما' : '⚫ Your Turn') : (isRtl ? '⚫ نوبت حریف' : '⚫ Opponent')))}
                  </span>
                  <span className={`text-[9px] font-bold font-mono ${colorMode === 'light' ? 'text-amber-800' : 'text-amber-300'}`}>
                    {getPipAdvantageText()}
                  </span>
                </div>
              </div>

              {/* Interactive 3D Dice with Priority Selection */}
              <div className="flex items-center gap-2">
                {/* Die 1 */}
                <div 
                  onClick={() => {
                    if (!hasRolled || isRolling) {
                      handleRollDice();
                      return;
                    }
                    if (dice[0] && remainingMoves.includes(dice[0])) {
                      setSelectedDie(prev => (prev === dice[0] ? null : dice[0]));
                      soundEngine.playTap?.();
                      haptics.tap?.();
                    }
                  }}
                  className={`relative cursor-pointer transition-transform active:scale-95 ${
                    selectedDie === dice[0] && remainingMoves.includes(dice[0])
                      ? 'ring-4 ring-amber-400 rounded-2xl scale-105 shadow-lg'
                      : hasRolled && remainingMoves.includes(dice[0])
                        ? 'ring-1 ring-emerald-400/60 rounded-2xl'
                        : ''
                  }`}
                  title={hasRolled && remainingMoves.includes(dice[0]) ? (isRtl ? `انتخاب اولویت حرکت با تاس ${dice[0]}` : `Play die ${dice[0]} first`) : ''}
                >
                  <RenderDiceFace value={dice[0]} isRolling={isRolling} size="sm" isSelected={selectedDie === dice[0] && remainingMoves.includes(dice[0])} />
                  {selectedDie === dice[0] && remainingMoves.includes(dice[0]) && (
                    <span className="absolute -top-1.5 -left-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[8px] font-black shadow-sm">
                      اول
                    </span>
                  )}
                </div>

                {/* Die 2 */}
                <div 
                  onClick={() => {
                    if (!hasRolled || isRolling) {
                      handleRollDice();
                      return;
                    }
                    if (dice[1] && remainingMoves.includes(dice[1])) {
                      setSelectedDie(prev => (prev === dice[1] ? null : dice[1]));
                      soundEngine.playTap?.();
                      haptics.tap?.();
                    }
                  }}
                  className={`relative cursor-pointer transition-transform active:scale-95 ${
                    selectedDie === dice[1] && remainingMoves.includes(dice[1])
                      ? 'ring-4 ring-amber-400 rounded-2xl scale-105 shadow-lg'
                      : hasRolled && remainingMoves.includes(dice[1])
                        ? 'ring-1 ring-emerald-400/60 rounded-2xl'
                        : ''
                  }`}
                  title={hasRolled && remainingMoves.includes(dice[1]) ? (isRtl ? `انتخاب اولویت حرکت با تاس ${dice[1]}` : `Play die ${dice[1]} first`) : ''}
                >
                  <RenderDiceFace value={dice[1]} isRolling={isRolling} size="sm" isSelected={selectedDie === dice[1] && remainingMoves.includes(dice[1])} />
                  {selectedDie === dice[1] && remainingMoves.includes(dice[1]) && (
                    <span className="absolute -top-1.5 -left-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[8px] font-black shadow-sm">
                      اول
                    </span>
                  )}
                </div>

                {/* Remaining Moves Chips */}
                {remainingMoves.length > 0 && (
                  <div className="flex items-center gap-1">
                    {remainingMoves.map((m, idx) => (
                      <span
                        key={idx}
                        onClick={() => {
                          setSelectedDie(prev => (prev === m ? null : m));
                          soundEngine.playTap?.();
                        }}
                        className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs border shadow-sm cursor-pointer transition-all ${
                          selectedDie === m
                            ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 shadow-amber-400/50'
                            : 'bg-emerald-500/25 text-emerald-400 border-emerald-400 hover:bg-emerald-500/40'
                        }`}
                        title={isRtl ? `انتخاب تاس ${m}` : `Select ${m}`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions: Undo + Roll / Pass */}
              <div className="flex items-center gap-1.5">
                {/* Undo Button */}
                {moveHistory.length > 0 && (
                  <button
                    onClick={handleUndoMove}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-400/40 text-[11px] font-black flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                    title={isRtl ? 'بازگرداندن حرکت مهره' : 'Undo Move'}
                  >
                    <RotateCcw size={12} />
                    <span>{isRtl ? 'بازگردانی' : 'Undo'}</span>
                  </button>
                )}

                {/* Pass Turn Button when stuck */}
                {hasRolled && remainingMoves.length > 0 && (
                  <button
                    onClick={() => endTurn(points, bar, borneOff, turn)}
                    className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold active:scale-95 transition-all"
                    title={isRtl ? 'رد نوبت' : 'Pass Turn'}
                  >
                    رد نوبت ⏭️
                  </button>
                )}

                {/* Primary Action Button (Roll) */}
                {(!hasRolled || remainingMoves.length === 0) && (
                  <button
                    onClick={handleRollDice}
                    disabled={isRolling || (gameMode === 'bot' && turn === 'black')}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                      (gameMode === 'online' && turn !== myOnlineRole)
                        ? 'bg-slate-800 text-slate-400 border border-white/10'
                        : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-amber-500/30 animate-pulse'
                    }`}
                  >
                    <Shuffle size={14} className={isRolling ? 'animate-spin' : ''} />
                    <span>
                      {isRolling 
                        ? (isRtl ? 'چرخش...' : 'Rolling...') 
                        : (gameMode === 'online' && turn !== myOnlineRole)
                          ? (isRtl ? `نوبت ${turn === 'white' ? 'سفید' : 'سیاه'}` : `Waiting...`)
                          : (isRtl ? 'پرتاب تاس 🎲' : 'Roll Dice 🎲')}
                    </span>
                  </button>
                )}
              </div>

            </div>

            {/* Status / Instruction text */}
            {lastMoveMsg && (
              <div className={`mt-1.5 text-center py-1 px-2 rounded-xl text-[11px] font-bold border transition-colors ${
                colorMode === 'light'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-white/5 border-white/10 text-amber-300'
              }`}>
                {lastMoveMsg}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Trash Talk In-Game Reactions */}
      <InGameReactions />

      {/* Set / Match Winner Modal with Rematch */}
      <AnimatePresence>
        {(setWinner || matchWinner) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, rotateX: 15 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-amber-400/70 p-6 text-center shadow-[0_0_60px_rgba(245,158,11,0.15)] space-y-4"
            >
              {/* Animated trophy/crown with glow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-amber-400/10 animate-ping" />
                </div>
                <div className="text-6xl animate-bounce relative z-10 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  {matchWinner ? '👑' : '🏆'}
                </div>
              </div>

              <h3 className="text-xl font-black text-white">
                {matchWinner 
                  ? (gameMode === 'bot' 
                      ? (matchWinner === 'white' ? '🎉 تبریک! شما برنده شدید!' : '🤖 ربات برنده شد!')
                      : (matchWinner === myOnlineRole ? '🎉 تبریک! شما برنده شدید!' : '🏆 حریف برنده شد!'))
                  : (gameMode === 'bot'
                      ? (setWinner?.winner === 'white' ? '🎉 برنده ست: شما' : '🤖 برنده ست: ربات')
                      : (setWinner?.winner === myOnlineRole ? '🎉 برنده ست: شما' : `🏆 برنده ست: حریف`))}
              </h3>
              <p className="text-xs text-amber-300 font-bold">{setWinner?.type}</p>
              
              {/* Score Bar */}
              <div className="flex justify-center gap-6 text-xs font-mono font-bold bg-black/50 py-2.5 px-4 rounded-2xl border border-white/10">
                <div className="text-center">
                  <span className="text-amber-300 block text-sm font-black">{scoreWhite}</span>
                  <span className="text-slate-400 text-[10px]">⚪ سفید</span>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <span className="text-cyan-300 block text-sm font-black">{scoreBlack}</span>
                  <span className="text-slate-400 text-[10px]">⚫ سیاه</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {matchWinner ? (
                  <>
                    {/* Rematch button for online mode */}
                    {gameMode === 'online' && (
                      <button
                        onClick={() => {
                          if (rematchState === 'received') {
                            // Accept rematch
                            broadcastPayload('REMATCH_ACCEPT', {});
                            setMyOnlineRole(prev => prev === 'white' ? 'black' : 'white');
                            setManualFlip(null);
                            handleResetMatch();
                            setRematchState(null);
                          } else {
                            // Send rematch request
                            broadcastPayload('REMATCH_REQUEST', { requesterId: myUserId, requesterName: myUserName });
                            setRematchState('sent');
                          }
                          soundEngine.playTap?.();
                        }}
                        disabled={rematchState === 'sent'}
                        className={`w-full py-3 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                          rematchState === 'received'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
                            : rematchState === 'sent'
                              ? 'bg-slate-700 text-slate-400 cursor-wait'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/30'
                        }`}
                      >
                        {rematchState === 'received' 
                          ? '✅ قبول بازی مجدد!' 
                          : rematchState === 'sent' 
                            ? '⏳ منتظر پاسخ حریف...' 
                            : rematchState === 'declined'
                              ? '❌ حریف رد کرد'
                              : '🔄 درخواست بازی مجدد'}
                      </button>
                    )}
                    {/* New match button */}
                    <button
                      onClick={handleResetMatch}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg active:scale-95"
                    >
                      {gameMode === 'online' ? 'شروع مسابقه جدید 🎲' : 'بازی مجدد 🎲'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleNextSet}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg active:scale-95"
                  >
                    ست بعدی ⏭️
                  </button>
                )}
                <button
                  onClick={() => navigate('/games')}
                  className="w-full py-2.5 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors"
                >
                  خروج از بازی
                </button>
              </div>

              {/* Rematch incoming notification */}
              {rematchState === 'received' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-2"
                >
                  <span className="animate-pulse">🔔</span>
                  <span>حریف می‌خواد دوباره بازی کنه!</span>
                  <button
                    onClick={() => {
                      broadcastPayload('REMATCH_DECLINE', {});
                      setRematchState(null);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-red-500/30 text-red-300 text-[10px] font-bold hover:bg-red-500/50"
                  >
                    رد
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting for Opponent Overlay */}
      <WaitingForOpponentOverlay
        isVisible={isWaitingForOpponent && gameMode === 'online' && !opponentJoined}
        roomCode={onlineRoomCode}
        gameTitle={isRtl ? 'تخته نرد' : 'Backgammon'}
        gameIcon="🎲"
        onCancel={() => {
          setIsWaitingForOpponent(false);
          navigate('/games');
        }}
        onShareTelegram={() => {
          const botUsername = 'chazha_bot';
          const telegramDuelLink = `https://t.me/${botUsername}?start=duel_backgammon_${onlineRoomCode}`;
          const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(telegramDuelLink)}&text=${encodeURIComponent('🎲 بیا تخته نرد با من بازی کن!')}`;
          window.open(shareUrl, '_blank');
        }}
        shareLink={`https://t.me/chazha_bot?start=duel_backgammon_${onlineRoomCode}`}
        isRtl={isRtl}
        colorMode={colorMode}
      />

      {/* Setup Modal */}
      <BackgammonSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        currentTheme={boardTheme}
        onThemeChange={(newTheme) => setBoardTheme(newTheme)}
        onStartGame={({ mode, botDifficulty: diff, matchSets: sets, roomCode: rCode }) => {
          const finalMode = (mode === 'telegram') ? 'online' : mode;
          setGameMode(finalMode);
          if (diff) setBotDifficulty(diff);
          if (sets) setMatchSets(sets);
          if (rCode) setOnlineRoomCode(rCode);
          setMyOnlineRole('white');
          handleResetMatch();
          setRematchState(null);
          // Auto-join: if online mode (telegram invite), show waiting overlay
          if (finalMode === 'online') {
            setIsWaitingForOpponent(true);
            setOpponentJoined(false);
          }
        }}
      />

      {/* In-Game Chat Drawer */}
      <InGameChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        roomCode={onlineRoomCode}
        gameTitle={isRtl ? "تخته نرد آنلاین چاژا" : "Chazha Backgammon"}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        myRoleName={myOnlineRole === 'white' ? (isRtl ? 'سفید (شما)' : 'White') : (isRtl ? 'سیاه (شما)' : 'Black')}
        isRtl={isRtl}
      />

    </div>
  );
}
