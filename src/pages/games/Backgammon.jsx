import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, 
  Users, Bot, Globe, Shield, MessageSquare, Send, Award, Flame, 
  HelpCircle, Settings, ArrowRight, CheckCircle2, Shuffle, Play, Share2,
  Sun, Moon, Undo2, RotateCw, MoreVertical, Smile
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import BackgammonSetupModal from '../../components/games/BackgammonSetupModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';
import ConfettiOverlay from '../../components/games/ConfettiOverlay';
import WaitingForOpponentOverlay from '../../components/games/WaitingForOpponentOverlay';
import realtimeNetwork from '../../services/realtimeNetwork';
import { shareToTelegram } from '../../utils/telegram';

// 3D Telegram-Style Dice Face Renderer — Multi-axis tumbling, fast cycling pips & dynamic floor shadow
const RenderDiceFace = ({ value, isRolling, size = 'md', isSelected = false }) => {
  const [rollFace, setRollFace] = useState(value || 1);

  useEffect(() => {
    if (!isRolling) return;
    const interval = setInterval(() => {
      setRollFace(Math.floor(Math.random() * 6) + 1);
    }, 55);
    return () => clearInterval(interval);
  }, [isRolling]);

  const activeVal = isRolling ? rollFace : (value ? Math.max(1, Math.min(6, value)) : null);
  const pips = activeVal ? {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  }[activeVal] || [4] : [];

  const sizeClasses = size === 'lg' ? 'w-14 h-14 sm:w-16 sm:h-16' : size === 'sm' ? 'w-11 h-11' : 'w-12 h-12 sm:w-14 sm:h-14';
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  if (!activeVal && !isRolling) {
    return (
      <div className={`${sizeClasses} rounded-2xl bg-white/5 border-2 border-dashed border-amber-400/40 flex items-center justify-center text-amber-300 text-sm font-black`}>
        🎲
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Dynamic 3D Floor Shadow */}
      <motion.div
        animate={
          isRolling
            ? {
                scale: [0.55, 1.25, 0.45, 1.15, 0.6],
                opacity: [0.2, 0.7, 0.15, 0.55, 0.3],
                y: [3, 6, 2, 7, 4]
              }
            : { scale: 1, opacity: 0.4, y: 3 }
        }
        transition={isRolling ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        className="absolute -bottom-1.5 w-[85%] h-2.5 bg-black/80 rounded-full filter blur-[3px] pointer-events-none"
      />

      {/* 3D Multi-Axis Tumbling Cube */}
      <motion.div
        key={isRolling ? 'rolling' : `face-${value}`}
        initial={isRolling ? {} : { scale: 0.8, rotateX: 60, rotateY: -45, y: -20 }}
        animate={
          isRolling
            ? {
                rotateX: [0, 180, 360, 540, 720],
                rotateY: [0, 360, 180, 540, 720],
                rotateZ: [-25, 30, -15, 20, 0],
                y: [-24, 6, -16, 4, 0],
                scale: [0.95, 1.12, 0.9, 1.06, 0.95]
              }
            : {
                scale: isSelected ? 1.08 : 1,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                y: 0
              }
        }
        transition={
          isRolling
            ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
            : { type: 'spring', damping: 12, stiffness: 220, mass: 0.8 }
        }
        style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
        className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-[#ffffff] via-[#fdfbf7] to-[#f5eedc] border-2 ${
          isSelected
            ? 'border-amber-400 ring-4 ring-cyan-400/90 shadow-[0_8px_25px_rgba(34,211,238,0.7)]'
            : 'border-[#a85a1a]/70 shadow-[0_6px_18px_rgba(0,0,0,0.55),inset_0_2px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(168,90,26,0.25)]'
        } p-1.5 flex flex-col justify-between items-center relative select-none shrink-0 overflow-hidden`}
      >
        {/* Specular Highlight Sheen */}
        <div className="absolute inset-x-1 top-0.5 h-1/3 bg-gradient-to-b from-white/80 to-transparent rounded-t-xl pointer-events-none" />

        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 items-center justify-items-center relative z-10">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
            <div key={idx} className="w-full h-full flex items-center justify-center">
              {pips.includes(idx) && (
                <span className={`${dotSize} rounded-full bg-gradient-to-br from-[#1c0d02] via-[#3d1a04] to-[#78350f] shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.35)]`} />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
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

  // Parabolic Checker Flight Animation & Board Container Ref
  const [flyingChecker, setFlyingChecker] = useState(null);
  const boardContainerRef = useRef(null);

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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [turnTimerSeconds, setTurnTimerSeconds] = useState(60);

  // Plato-Style Active Turn Countdown
  useEffect(() => {
    if (setWinner || matchWinner) return;
    const timer = setInterval(() => {
      setTurnTimerSeconds(prev => (prev > 1 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [turn, setWinner, matchWinner]);

  useEffect(() => {
    setTurnTimerSeconds(60);
  }, [turn]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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
          if (payload.from !== undefined && payload.to !== undefined) {
            try {
              const movingPlayer = payload.turn;
              const startSelector = payload.from === 'bar' ? `[data-bar-jail="${movingPlayer}"]` : `[data-point-id="${payload.from}"]`;
              const endSelector = payload.to === 'off' ? `[data-tray-groove="${movingPlayer}"]` : `[data-point-id="${payload.to}"]`;
              const startEl = document.querySelector(startSelector);
              const endEl = document.querySelector(endSelector);
              const container = boardContainerRef.current;
              if (startEl && endEl && container) {
                const sRect = startEl.getBoundingClientRect();
                const eRect = endEl.getBoundingClientRect();
                const cRect = container.getBoundingClientRect();
                setFlyingChecker({
                  id: Date.now(),
                  startX: sRect.left + sRect.width / 2 - cRect.left,
                  startY: sRect.top + sRect.height / 2 - cRect.top,
                  endX: eRect.left + eRect.width / 2 - cRect.left,
                  endY: eRect.top + eRect.height / 2 - cRect.top,
                  player: movingPlayer
                });
                setTimeout(() => setFlyingChecker(null), 320);
              }
            } catch (_) {}
            soundEngine.playCheckerMove?.();
          }
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
          // Acknowledge presence back so the newcomer also knows host is present
          broadcastPayload('PLAYER_ACK', { role: myOnlineRole });
          // Auto Role Handshake: if newcomer claims same role, host keeps white & assigns black to newcomer
          if (payload?.role === myOnlineRole) {
            if (myOnlineRole === 'white') {
              broadcastPayload('ROLE_ASSIGN', { targetUserId: data.senderId, role: 'black' });
            } else {
              setMyOnlineRole('white');
            }
          }
        } else if (actionType === 'PLAYER_ACK') {
          setIsWaitingForOpponent(false);
          setOpponentJoined(true);
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

    // 2. Parabolic gliding arc animation for moving checker
    try {
      const startSelector = from === 'bar' ? `[data-bar-jail="${turn}"]` : `[data-point-id="${from}"]`;
      const endSelector = to === 'off' ? `[data-tray-groove="${turn}"]` : `[data-point-id="${to}"]`;
      const startEl = document.querySelector(startSelector);
      const endEl = document.querySelector(endSelector);
      const container = boardContainerRef.current;
      if (startEl && endEl && container) {
        const sRect = startEl.getBoundingClientRect();
        const eRect = endEl.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        setFlyingChecker({
          id: Date.now(),
          startX: sRect.left + sRect.width / 2 - cRect.left,
          startY: sRect.top + sRect.height / 2 - cRect.top,
          endX: eRect.left + eRect.width / 2 - cRect.left,
          endY: eRect.top + eRect.height / 2 - cRect.top,
          player: turn
        });
        setTimeout(() => setFlyingChecker(null), 520);
      }
    } catch (_) {}

    soundEngine.playCheckerMove?.();

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
        from,
        to,
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

  // Checkers Stack — 3D Tactile Lathe-Turned Pieces (Plato Clean Geometry)
  const renderCheckersStack = (pt, isTop, pIdx, isSelected, isFriendlyAndMovable) => {
    if (pt.count === 0) return null;
    const maxVisible = Math.min(pt.count, 5);
    const isWhite = pt.player === 'white';
    const checkerStyle = isWhite ? themeConfig.checkerWhite : themeConfig.checkerBlack;

    return (
      <div className={`absolute ${isTop ? 'top-1 flex-col' : 'bottom-1 flex-col-reverse'} flex items-center z-10 select-none pointer-events-none w-full`}>
        {Array.from({ length: maxVisible }).map((_, idx) => {
          const isTopChecker = idx === maxVisible - 1;
          return (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                marginTop: isTop && idx > 0 ? '-14px' : '0',
                marginBottom: !isTop && idx > 0 ? '-14px' : '0',
                zIndex: isTopChecker ? 30 : idx + 1
              }}
              className={`w-6 h-6 xs:w-[28px] xs:h-[28px] sm:w-[32px] sm:h-[32px] rounded-full border-2 flex items-center justify-center font-black text-xs transition-all relative ${checkerStyle} ${
                isSelected && isTopChecker 
                  ? 'ring-4 ring-cyan-300 scale-110 shadow-[0_0_18px_rgba(34,211,238,1)]' 
                  : isFriendlyAndMovable && isTopChecker 
                    ? 'ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse' 
                    : 'shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)]'
              }`}
            >
              {/* Concentric Engraved Ring for authentic 3D lathe-turned backgammon checker look */}
              <div className="w-[66%] h-[66%] rounded-full border border-current opacity-30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-none">
                {isTopChecker && pt.count > 5 ? (
                  <span className="text-[10px] font-black opacity-100">{pt.count}</span>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Render Triangle Point (Plato Authentic Clean Look — No Numbers)
  const renderPoint = (pIdx, isTop) => {
    const pt = points[pIdx];
    const isSelected = selectedPoint === pIdx;
    const isValidTarget = activeValidDestinations.includes(pIdx);
    const isFriendlyAndMovable = hasRolled && pt.player === turn && pt.count > 0 && getValidMovesForPoint(pIdx, points, bar, remainingMoves, turn).length > 0;
    const isDark = pIdx % 2 === 0;

    return (
      <div
        key={pIdx}
        data-point-id={pIdx}
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

        {/* Valid Destination Indicator (clean pulsing emerald target at tip of triangle) */}
        {isValidTarget && (
          <div className={`absolute ${isTop ? 'bottom-2' : 'top-2'} pointer-events-none z-20`}>
            <div className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] shadow-lg animate-bounce flex items-center justify-center">
              <span>●</span>
            </div>
          </div>
        )}

        {/* Checkers Stack */}
        {renderCheckersStack(pt, isTop, pIdx, isSelected, isFriendlyAndMovable)}
      </div>
    );
  };

  // High-End Tournament Bearing-Off Tray with Physical Stacked Checkers
  const renderBearingOffTray = (isLeft) => {
    // When isFlipped (Black perspective): Top is White, Bottom is Black
    // When !isFlipped (White perspective): Top is Black, Bottom is White
    const topPlayer = isFlipped ? 'white' : 'black';
    const bottomPlayer = isFlipped ? 'black' : 'white';

    const renderSlot = (player) => {
      const count = borneOff[player] || 0;
      const isPlayerTurn = turn === player;
      const canBearOff = isPlayerTurn && activeValidDestinations.includes('off');
      const checkerStyle = player === 'white' ? themeConfig.checkerWhite : themeConfig.checkerBlack;
      const label = player === 'white' ? (isRtl ? 'سفید' : 'White') : (isRtl ? 'سیاه' : 'Black');
      const discIcon = player === 'white' ? '⚪' : '⚫';

      return (
        <div 
          key={player}
          data-tray-groove={player}
          onClick={() => {
            if (canBearOff) {
              const validMoves = getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn);
              const offMove = validMoves.find(m => m.target === 'off');
              if (offMove) executeMove(selectedPoint, 'off', offMove.dieUsed);
            }
          }}
          className={`flex-1 w-full flex flex-col items-center justify-between p-1 rounded-xl transition-all relative select-none ${
            canBearOff 
              ? 'ring-2 ring-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.5)] animate-pulse cursor-pointer' 
              : 'cursor-default'
          }`}
          title={isRtl ? `جایگاه خروج مهره‌های ${label} (${count}/15)` : `${label} Bearing Off Tray (${count}/15)`}
        >
          {/* Header Info */}
          <div className="flex flex-col items-center leading-tight mb-0.5">
            <span className="text-[8px] font-black text-slate-300 flex items-center gap-0.5">
              <span>{discIcon}</span>
              <span>{label}</span>
            </span>
            <span className={`text-[10px] font-mono font-black ${player === 'white' ? 'text-amber-400' : 'text-cyan-400'}`}>
              {count}/15
            </span>
          </div>

          {/* Bearing Off Active Prompt Overlay */}
          {canBearOff && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[8px] shadow-lg animate-bounce whitespace-nowrap">
                🎯 خروج
              </span>
            </div>
          )}

          {/* Physical Felt Slot with Stacked 3D Checker Slabs */}
          <div className={`w-full flex-1 flex flex-col-reverse items-center justify-start p-1 rounded-lg border relative overflow-hidden transition-all ${
            colorMode === 'light'
              ? 'bg-slate-300/80 border-slate-400/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)]'
              : 'bg-black/60 border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]'
          }`}>
            {count > 0 ? (
              <div className="w-full flex flex-col-reverse items-center gap-[2px] z-10">
                {Array.from({ length: Math.min(15, count) }).map((_, cIdx) => (
                  <motion.div
                    key={cIdx}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    className={`w-full ${count > 10 ? 'h-1.5 sm:h-2' : 'h-2 sm:h-2.5'} rounded-sm border shadow-sm shrink-0 transition-all ${checkerStyle}`}
                    style={{
                      boxShadow: player === 'white'
                        ? '0 1px 2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.7)'
                        : '0 1px 2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-[8px] font-bold text-slate-400">
                <span>خالی</span>
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div 
        className={`w-12 sm:w-14 rounded-2xl p-1 border-2 flex flex-col justify-between items-center transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.5)] shrink-0 gap-1 ${
          colorMode === 'light' ? 'bg-slate-200/90 border-slate-300' : 'bg-[#150d07]/90 border-amber-800/40'
        }`}
      >
        {renderSlot(topPlayer)}

        {/* Divider / Brass Pin */}
        <div className="w-6 h-0.5 rounded-full bg-amber-500/40 shrink-0" />

        {renderSlot(bottomPlayer)}
      </div>
    );
  };

  // Perspective calculations
  const bottomPlayerRole = isFlipped ? 'black' : 'white';
  const topPlayerRole = isFlipped ? 'white' : 'black';

  const isMyTurn = turn === bottomPlayerRole;
  const topPip = topPlayerRole === 'white' ? pipWhite : pipBlack;
  const bottomPip = bottomPlayerRole === 'white' ? pipWhite : pipBlack;

  const topScore = topPlayerRole === 'white' ? scoreWhite : scoreBlack;
  const bottomScore = bottomPlayerRole === 'white' ? scoreWhite : scoreBlack;

  const topPlayerName = gameMode === 'bot' 
    ? (isFlipped ? (myUserName || 'شما') : '🤖 ربات') 
    : (isFlipped ? (myUserName || 'شما') : (searchParams.get('duel') || 'حریف آنلاین'));
  const bottomPlayerName = gameMode === 'bot' 
    ? (isFlipped ? '🤖 ربات' : (myUserName || 'شما')) 
    : (isFlipped ? (searchParams.get('duel') || 'حریف آنلاین') : (myUserName || 'شما'));

  const topAway = Math.max(1, matchSets - topScore);
  const bottomAway = Math.max(1, matchSets - bottomScore);

  return (
    <div data-dark-surface="true" className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-[#191512] text-white select-none font-sans relative" dir="ltr">
      
      {/* 1. Header (Plato Exact Replica) */}
      <div className="shrink-0 h-14 px-3 flex items-center justify-between z-30 bg-[#14100d]/95 backdrop-blur-xl border-b border-white/10 shadow-sm relative">
        {/* Left: Circular Back Button */}
        <button
          onClick={() => navigate('/games')}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white"
          title={isRtl ? 'بازگشت به بازی‌ها' : 'Back to Games'}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Centered Players Bar */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center max-w-xs">
          {/* Top Player (Opponent) */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-slate-200 font-mono">{topAway}-away</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2a1d15] border border-amber-600/40 flex items-center justify-center text-xs shadow-inner">
                {topPlayerRole === 'white' ? '⚪' : '⚫'}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span className="text-[10px] text-slate-300 font-bold truncate max-w-[70px] sm:max-w-[85px]">{topPlayerName}</span>
            </div>
            <span className="text-[11px] font-mono font-black text-sky-400 mt-0.5">
              {turn === topPlayerRole ? formatTimer(turnTimerSeconds) : '01:05'}
            </span>
          </div>

          {/* Centered "vs" */}
          <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
            vs
          </div>

          {/* Bottom Player (You) */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2a1d15] border-2 border-sky-400 flex items-center justify-center text-xs shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                {bottomPlayerRole === 'white' ? '⚪' : '⚫'}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-200 font-mono">{bottomAway}-away</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {isMyTurn ? (
                <span className="px-2 py-0.2 rounded-full bg-sky-500 text-white text-[9px] font-black shadow-sm animate-pulse">
                  Your Turn
                </span>
              ) : (
                <span className="text-[10px] text-slate-300 font-bold truncate max-w-[70px] sm:max-w-[85px]">{bottomPlayerName}</span>
              )}
            </div>
            <span className="text-[11px] font-mono font-black text-sky-400 mt-0.5">
              {isMyTurn ? formatTimer(turnTimerSeconds) : '00:58'}
            </span>
          </div>
        </div>

        {/* Right: Circular 3-Dot Menu Button */}
        <button
          onClick={() => {
            setIsMoreMenuOpen(!isMoreMenuOpen);
            soundEngine.playTap?.();
          }}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white"
          title="گزینه‌ها"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* 1.5. Three-Dot More Options Dropdown */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            data-dark-surface="true"
            className="absolute top-14 right-3 z-50 w-60 rounded-2xl bg-[#1c1612] backdrop-blur-2xl border-2 border-amber-500/40 shadow-2xl p-3 space-y-2 text-xs"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="px-2 py-0.5 text-[11px] font-black" style={{ color: '#fbbf24' }}>
              قالب و ظاهر تخته نرد:
            </div>
            <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-white/15">
              {Object.keys(THEMES).map(tKey => {
                const isSelected = boardTheme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => {
                      setBoardTheme(tKey);
                      soundEngine.playTap?.();
                    }}
                    style={{
                      color: isSelected ? '#020617' : '#ffffff',
                      backgroundColor: isSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                      borderColor: isSelected ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    className="px-2 py-1.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 border transition-all active:scale-95"
                  >
                    <span>{THEMES[tKey].icon}</span>
                    <span>{THEMES[tKey].nameFa.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setManualFlip(prev => (prev === null ? !isFlipped : !prev));
                soundEngine.playTap?.();
                setIsMoreMenuOpen(false);
              }}
              style={{ color: '#ffffff' }}
              className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 font-black flex items-center justify-between transition-all active:scale-95"
            >
              <span>چرخش ۱۸۰ درجه تخته</span>
              <RotateCw size={14} className="text-amber-400" />
            </button>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                soundEngine.playTap?.();
              }}
              style={{ color: '#ffffff' }}
              className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 font-black flex items-center justify-between transition-all active:scale-95"
            >
              <span>صدا و جلوه‌های صوتی</span>
              {soundEnabled ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-rose-400" />}
            </button>

            <button
              onClick={() => {
                setIsSetupModalOpen(true);
                setIsMoreMenuOpen(false);
              }}
              style={{ color: '#ffffff' }}
              className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 font-black flex items-center justify-between transition-all active:scale-95"
            >
              <span>تنظیمات بازی و رقبا</span>
              <Settings size={14} className="text-amber-400" />
            </button>

            <button
              onClick={() => {
                setIsMoreMenuOpen(false);
                navigate('/games/lounge');
              }}
              style={{ color: '#fef08a' }}
              className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 via-yellow-600/30 to-amber-700/30 hover:bg-amber-500/40 font-black flex items-center justify-between border border-amber-400/50 shadow-md transition-all active:scale-95"
            >
              <span>ورود به سالن بازی‌ها 🎪</span>
              <ChevronLeft size={14} className="text-amber-300" />
            </button>

            <button
              onClick={() => {
                setIsMoreMenuOpen(false);
                navigate('/games');
              }}
              style={{ color: '#fca5a5' }}
              className="w-full px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 font-black flex items-center justify-between border border-rose-500/40 transition-all active:scale-95"
            >
              <span>تسلیم شدن و خروج</span>
              <span>🏳️</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Board Area (Plato Proportional Vertical Wood Board — Edge-to-Edge) */}
      <div 
        ref={boardContainerRef}
        className="flex-1 min-h-0 w-full flex items-center justify-center px-0 py-1 sm:px-1 relative overflow-hidden"
      >
        {/* Parabolic Flying Checker Animation (Smoother & Slower) */}
        {flyingChecker && (
          <motion.div
            key={flyingChecker.id}
            initial={{
              left: flyingChecker.startX,
              top: flyingChecker.startY,
              scale: 1.15,
              x: '-50%',
              y: '-50%',
              boxShadow: '0 14px 28px rgba(0,0,0,0.6)'
            }}
            animate={{
              left: flyingChecker.endX,
              top: flyingChecker.endY,
              scale: [1.15, 1.35, 1.0],
              x: '-50%',
              y: ['-50%', '-100%', '-50%']
            }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute w-6 h-6 xs:w-[28px] xs:h-[28px] sm:w-[32px] sm:h-[32px] rounded-full border-2 z-50 pointer-events-none flex items-center justify-center ${
              flyingChecker.player === 'white' ? themeConfig.checkerWhite : themeConfig.checkerBlack
            }`}
          >
            <div className="w-[66%] h-[66%] rounded-full border border-current opacity-40" />
          </motion.div>
        )}

        {/* The Wooden Board Case — Zero Margin for Maximum Width */}
        <div className="w-full max-w-md sm:max-w-lg aspect-[9/14] max-h-full bg-[#382315] border-[3px] xs:border-[4px] sm:border-[6px] border-[#26150b] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.15)] flex flex-col p-1 sm:p-1.5 relative select-none">
          
          {/* Top Frame Strip: Pip Capsule on Left, Bearing-Off Tray on Right */}
          <div className="w-full h-7 px-2 flex items-center justify-between shrink-0 mb-1 z-20">
            {/* Top-Left Pip Pill (Plato Style) */}
            <div className="px-2.5 py-0.5 rounded-full bg-black/75 border border-white/10 text-amber-200 font-mono font-black text-[10px] shadow">
              {topPip}
            </div>

            {/* Top-Right Bearing-Off Tray (Plato Recessed Horizontal Box) */}
            <div
              onClick={() => {
                if (turn === topPlayerRole && activeValidDestinations.includes('off')) {
                  const validMoves = getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn);
                  const offMove = validMoves.find(m => m.target === 'off');
                  if (offMove) executeMove(selectedPoint, 'off', offMove.dieUsed);
                }
              }}
              className={`w-28 sm:w-32 h-6 rounded-md bg-[#1d1109] border border-[#100904] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] flex items-center px-1.5 justify-between ${
                turn === topPlayerRole && activeValidDestinations.includes('off') ? 'ring-2 ring-emerald-400 bg-emerald-950/40 animate-pulse cursor-pointer' : ''
              }`}
              title={`خروج مهره‌های ${topPlayerRole === 'white' ? 'سفید' : 'سیاه'} (${borneOff[topPlayerRole]}/15)`}
            >
              <div className="flex items-center gap-[2px] overflow-hidden flex-1 h-3 mr-1">
                {Array.from({ length: Math.min(15, borneOff[topPlayerRole]) }).map((_, i) => (
                  <div key={i} className={`h-full w-1 rounded-sm shrink-0 ${topPlayerRole === 'white' ? 'bg-white shadow-sm' : 'bg-slate-900 border border-slate-700'}`} />
                ))}
              </div>
              <span className="text-[9px] font-mono font-black text-amber-300 shrink-0">
                {borneOff[topPlayerRole]}/15
              </span>
            </div>
          </div>

          {/* Playing Field with Left Half, Center Bar, and Right Half */}
          <div className="flex-1 w-full flex min-h-0 relative">
            
            {/* Left Board Quadrant */}
            <div className="flex-1 h-full rounded-l-xl p-0.5 sm:p-1 flex flex-col justify-between bg-gradient-to-b from-[#e5bf88] via-[#dfb57b] to-[#d6a76b] border-2 border-white/10 shadow-[inset_0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden">
              {/* Top Points (6) */}
              <div className="flex h-[45%] w-full">
                {(isFlipped ? [1, 2, 3, 4, 5, 6] : [13, 14, 15, 16, 17, 18]).map(p => renderPoint(p, true))}
              </div>

              {/* Rolled Dice resting on the wooden board surface */}
              {hasRolled && dice[0] && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-20 pointer-events-auto">
                  {/* Die 1 */}
                  <div
                    onClick={() => {
                      if (remainingMoves.includes(dice[0])) {
                        setSelectedDie(prev => (prev === dice[0] ? null : dice[0]));
                        soundEngine.playTap?.();
                        haptics.tap?.();
                      }
                    }}
                    className={`cursor-pointer transition-all ${
                      selectedDie === dice[0] && remainingMoves.includes(dice[0])
                        ? 'scale-110 ring-4 ring-cyan-400 rounded-2xl shadow-xl shadow-cyan-500/50'
                        : hasRolled && remainingMoves.includes(dice[0])
                          ? 'ring-1 ring-cyan-300/60 rounded-2xl'
                          : 'opacity-50 grayscale'
                    }`}
                    style={{ transform: 'rotate(-10deg)' }}
                    title={remainingMoves.includes(dice[0]) ? `انتخاب اولویت با تاس ${dice[0]}` : ''}
                  >
                    <RenderDiceFace value={dice[0]} isRolling={isRolling} size="sm" isSelected={selectedDie === dice[0]} />
                  </div>

                  {/* Die 2 */}
                  <div
                    onClick={() => {
                      if (remainingMoves.includes(dice[1])) {
                        setSelectedDie(prev => (prev === dice[1] ? null : dice[1]));
                        soundEngine.playTap?.();
                        haptics.tap?.();
                      }
                    }}
                    className={`cursor-pointer transition-all ${
                      selectedDie === dice[1] && remainingMoves.includes(dice[1])
                        ? 'scale-110 ring-4 ring-cyan-400 rounded-2xl shadow-xl shadow-cyan-500/50'
                        : hasRolled && remainingMoves.includes(dice[1])
                          ? 'ring-1 ring-cyan-300/60 rounded-2xl'
                          : 'opacity-50 grayscale'
                    }`}
                    style={{ transform: 'rotate(8deg)' }}
                    title={remainingMoves.includes(dice[1]) ? `انتخاب اولویت با تاس ${dice[1]}` : ''}
                  >
                    <RenderDiceFace value={dice[1]} isRolling={isRolling} size="sm" isSelected={selectedDie === dice[1]} />
                  </div>
                </div>
              )}

              {/* Bottom Points (6) */}
              <div className="flex h-[45%] w-full">
                {(isFlipped ? [24, 23, 22, 21, 20, 19] : [12, 11, 10, 9, 8, 7]).map(p => renderPoint(p, false))}
              </div>
            </div>

            {/* Center Bar (Walnut Wood Bar with Brass Hinges & Doubling Cube 64) */}
            <div className="w-8 sm:w-9 rounded-md py-2 flex flex-col items-center justify-between bg-[#2a190d] border-x border-[#1a0f07] shadow-[inset_0_0_12px_rgba(0,0,0,0.85)] shrink-0 z-10">
              {/* Top Brass Hinge */}
              <div className="w-5 h-2 rounded-sm bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 shadow-sm border border-amber-950" />

              {/* Top Hit Checker Slot */}
              {bar[topPlayerRole] > 0 ? (
                <div
                  onClick={() => {
                    if (turn === topPlayerRole) handlePointClick('bar');
                  }}
                  className={`cursor-pointer flex flex-col items-center ${turn === topPlayerRole ? 'animate-pulse' : ''}`}
                  title={`${bar[topPlayerRole]} مهره خورده`}
                >
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-black text-[11px] shadow-lg ${topPlayerRole === 'white' ? themeConfig.checkerWhite : themeConfig.checkerBlack}`}>
                    {bar[topPlayerRole]}
                  </div>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border border-dashed border-white/10 opacity-30" />
              )}

              {/* Doubling Cube (Centered 64, exactly as in Plato) */}
              <div 
                className="w-7 h-7 rounded-lg bg-[#141414] border border-white/20 text-white font-mono font-black text-[11px] flex items-center justify-center shadow-lg select-none"
                title="تاس دوبل (۶۴)"
              >
                64
              </div>

              {/* Bottom Hit Checker Slot */}
              {bar[bottomPlayerRole] > 0 ? (
                <div
                  onClick={() => {
                    if (turn === bottomPlayerRole) handlePointClick('bar');
                  }}
                  className={`cursor-pointer flex flex-col items-center ${isMyTurn ? 'ring-2 ring-cyan-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]' : ''}`}
                  title={`${bar[bottomPlayerRole]} مهره خورده - کلیک برای ورود`}
                >
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-black text-[11px] shadow-lg ${bottomPlayerRole === 'white' ? themeConfig.checkerWhite : themeConfig.checkerBlack}`}>
                    {bar[bottomPlayerRole]}
                  </div>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border border-dashed border-white/10 opacity-30" />
              )}

              {/* Bottom Brass Hinge */}
              <div className="w-5 h-2 rounded-sm bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 shadow-sm border border-amber-950" />
            </div>

            {/* Right Board Quadrant */}
            <div className="flex-1 h-full rounded-r-xl p-0.5 sm:p-1 flex flex-col justify-between bg-gradient-to-b from-[#e5bf88] via-[#dfb57b] to-[#d6a76b] border-2 border-white/10 shadow-[inset_0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden">
              {/* Top Points (6) */}
              <div className="flex h-[45%] w-full">
                {(isFlipped ? [7, 8, 9, 10, 11, 12] : [19, 20, 21, 22, 23, 24]).map(p => renderPoint(p, true))}
              </div>

              {/* On-Board Roll Button (Plato Square with 3D Dice Sticker 🎲) */}
              {isMyTurn && (!hasRolled || isRolling) && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleRollDice}
                    disabled={isRolling}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#4a2e1b]/70 hover:bg-[#5a3821]/80 border-2 border-amber-500/40 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer shadow-2xl active:scale-95 transition-all"
                    title="پرتاب تاس 🎲"
                  >
                    <span className="text-3xl sm:text-4xl animate-bounce filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                      🎲
                    </span>
                  </motion.button>
                </div>
              )}

              {/* Remaining moves & undo/pass turn overlay on right quadrant when active */}
              {isMyTurn && hasRolled && remainingMoves.length > 0 && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    {moveHistory.length > 0 && (
                      <button
                        onClick={handleUndoMove}
                        className="px-2 py-1 rounded-lg bg-black/75 hover:bg-black/90 text-amber-300 text-[10px] font-bold border border-amber-400/40 flex items-center gap-0.5 active:scale-95 shadow"
                        title="بازگردانی حرکت"
                      >
                        <RotateCcw size={10} />
                        <span>بازگردانی</span>
                      </button>
                    )}
                    <button
                      onClick={() => endTurn(points, bar, borneOff, turn)}
                      className="px-2 py-1 rounded-lg bg-black/75 hover:bg-black/90 text-slate-300 text-[10px] font-bold border border-white/20 active:scale-95 shadow"
                      title="رد نوبت"
                    >
                      رد نوبت ⏭️
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Points (6) */}
              <div className="flex h-[45%] w-full">
                {(isFlipped ? [18, 17, 16, 15, 14, 13] : [6, 5, 4, 3, 2, 1]).map(p => renderPoint(p, false))}
              </div>
            </div>

          </div>

          {/* Bottom Frame Strip: Pip Capsule on Left, Bearing-Off Tray on Right */}
          <div className="w-full h-7 px-2 flex items-center justify-between shrink-0 mt-1 z-20">
            {/* Bottom-Left Pip Pill (Plato Style) */}
            <div className="px-2.5 py-0.5 rounded-full bg-black/75 border border-white/10 text-amber-200 font-mono font-black text-[10px] shadow">
              {bottomPip}
            </div>

            {/* Bottom-Right Bearing-Off Tray (Plato Recessed Horizontal Box) */}
            <div
              onClick={() => {
                if (isMyTurn && activeValidDestinations.includes('off')) {
                  const validMoves = getValidMovesForPoint(selectedPoint, points, bar, remainingMoves, turn);
                  const offMove = validMoves.find(m => m.target === 'off');
                  if (offMove) executeMove(selectedPoint, 'off', offMove.dieUsed);
                }
              }}
              className={`w-28 sm:w-32 h-6 rounded-md bg-[#1d1109] border border-[#100904] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] flex items-center px-1.5 justify-between ${
                isMyTurn && activeValidDestinations.includes('off') ? 'ring-2 ring-emerald-400 bg-emerald-950/40 animate-pulse cursor-pointer' : ''
              }`}
              title={`خروج مهره‌های ${bottomPlayerRole === 'white' ? 'سفید' : 'سیاه'} (${borneOff[bottomPlayerRole]}/15)`}
            >
              <div className="flex items-center gap-[2px] overflow-hidden flex-1 h-3 mr-1">
                {Array.from({ length: Math.min(15, borneOff[bottomPlayerRole]) }).map((_, i) => (
                  <div key={i} className={`h-full w-1 rounded-sm shrink-0 ${bottomPlayerRole === 'white' ? 'bg-white shadow-sm' : 'bg-slate-900 border border-slate-700'}`} />
                ))}
              </div>
              <span className="text-[9px] font-mono font-black text-amber-300 shrink-0">
                {borneOff[bottomPlayerRole]}/15
              </span>
            </div>
          </div>

          {/* Cyan Turn Progress Line Indicator (from Plato screenshot bottom) */}
          <div className="w-full h-0.5 bg-sky-400/80 shadow-[0_0_8px_#38bdf8] shrink-0 mt-0.5 rounded-full" />
        </div>
      </div>

      {/* 3. Bottom Chat Bar (Plato 1-Line Docked Bar) */}
      <div className="shrink-0 h-12 px-4 bg-[#0e0d0c] border-t border-white/10 flex items-center justify-between gap-3 z-20">
        <button
          onClick={() => {
            setIsChatOpen(true);
            soundEngine.playTap?.();
          }}
          className="text-emerald-400 hover:text-emerald-300 active:scale-95 transition-transform p-1"
          title="چت بازی"
        >
          <MessageSquare size={19} />
        </button>

        <div
          onClick={() => {
            setIsChatOpen(true);
            soundEngine.playTap?.();
          }}
          className="flex-1 py-1.5 px-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium cursor-pointer flex items-center justify-between border border-white/5"
        >
          <span className="truncate">پیامی بنویسید... / Say hello...</span>
          {chatMessages.length > 1 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {chatMessages.length - 1}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            setIsChatOpen(true);
            soundEngine.playTap?.();
          }}
          className="text-slate-400 hover:text-amber-400 active:scale-95 transition-transform p-1"
          title="استیکرها"
        >
          <Smile size={19} />
        </button>
      </div>

      {/* 4. Drawer & Modals */}
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
        hideCapsule={true}
      />

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
                <button
                  onClick={() => navigate('/games/lounge')}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-amber-600/25 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-amber-500/35 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <span>ورود به سالن بازی‌ها و گپ‌وگفت 🎪</span>
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
        onOpenLounge={() => {
          setIsWaitingForOpponent(false);
          navigate('/games/lounge');
        }}
        onShareTelegram={() => {
          shareToTelegram({ roomCode: onlineRoomCode, gameType: 'backgammon', gameTitleFa: 'تخته نرد' });
        }}
        shareLink={`https://t.me/chazha_bot/app?startapp=room_${onlineRoomCode}`}
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

    </div>
  );
}
