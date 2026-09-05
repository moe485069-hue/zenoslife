import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Users, MessageSquare, Trophy, Plus, Search, 
  Sparkles, Swords, UserPlus, Send, RefreshCw, Lock, Globe,
  Check, Flame, Shield, ArrowRight, Gamepad2, Coins, ShoppingBag
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useMultiplayerStore from '../store/multiplayerStore';
import realtimeNetwork from '../services/realtimeNetwork';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import OpponentProfileModal from '../components/games/OpponentProfileModal';
import ChazhaStoreModal from '../components/games/ChazhaStoreModal';

// Supported Games in the Lounge
const LOUNGE_GAMES = [
  { id: 'all', titleFa: 'همه بازی‌ها', icon: '🎯' },
  { id: 'backgammon', titleFa: 'تخته نرد', icon: '🎲', path: '/games/backgammon' },
  { id: 'billiards', titleFa: 'بیلیارد', icon: '🎱', path: '/games/billiards' },
  { id: 'cosmic-chess', titleFa: 'شطرنج', icon: '♟️', path: '/games/cosmic-chess' },
  { id: 'battleship', titleFa: 'کشتی جنگی', icon: '🚢', path: '/games/battleship' },
  { id: 'connect-four', titleFa: 'دوز ۴ تایی', icon: '🔴', path: '/games/connect-four' },
  { id: 'finger-soccer', titleFa: 'فوتبال انگشتی', icon: '⚽', path: '/games/finger-soccer' },
  { id: 'cosmic-pong', titleFa: 'پینگ‌پنگ', icon: '🏓', path: '/games/cosmic-pong' },
];

// Initial mock lively rooms to populate the feed
const INITIAL_ROOMS = [
  {
    id: 'BACK-7721',
    gameId: 'backgammon',
    gameTitle: 'تخته نرد کلاسیک',
    gameIcon: '🎲',
    hostName: 'آرشام_شاه',
    hostAvatar: '👑',
    level: 14,
    bet: 200,
    sets: 3,
    status: 'waiting',
    players: 1,
    maxPlayers: 2,
    createdAt: Date.now() - 45000,
  },
  {
    id: 'BILL-4109',
    gameId: 'billiards',
    gameTitle: 'ایت بال ۸-Ball',
    gameIcon: '🎱',
    hostName: 'سارا_تیرانداز',
    hostAvatar: '🦊',
    level: 9,
    bet: 500,
    sets: 1,
    status: 'waiting',
    players: 1,
    maxPlayers: 2,
    createdAt: Date.now() - 120000,
  },
  {
    id: 'CHES-8812',
    gameId: 'cosmic-chess',
    gameTitle: 'شطرنج کیهانی',
    gameIcon: '♟️',
    hostName: 'مهراد_گرندمستر',
    hostAvatar: '🧙‍♂️',
    level: 21,
    bet: 0,
    sets: 1,
    status: 'waiting',
    players: 1,
    maxPlayers: 2,
    createdAt: Date.now() - 190000,
  },
  {
    id: 'BATT-3021',
    gameId: 'battleship',
    gameTitle: 'نبرد ناوها',
    gameIcon: '🚢',
    hostName: 'امیرحسین_دریاسالار',
    hostAvatar: '⚓',
    level: 11,
    bet: 100,
    sets: 1,
    status: 'waiting',
    players: 1,
    maxPlayers: 2,
    createdAt: Date.now() - 310000,
  },
];

// Initial online players
const INITIAL_PLAYERS = [
  { id: 'p1', name: 'طاها_سلطان', avatar: '🦁', level: 18, rank: 'استاد نرد 🎲', status: 'online', isPlaying: false },
  { id: 'p2', name: 'نیلوفر_آسمان', avatar: '🌸', level: 12, rank: 'حرفه‌ای بیلیارد 🎱', status: 'online', isPlaying: true, gameName: 'بیلیارد' },
  { id: 'p3', name: 'سامان_شب‌گرد', avatar: '🐺', level: 15, rank: 'گرندمستر شطرنج ♟️', status: 'online', isPlaying: false },
  { id: 'p4', name: 'روژان_ستاره', avatar: '✨', level: 9, rank: 'شکارچی ناو 🚢', status: 'online', isPlaying: false },
  { id: 'p5', name: 'بردیا_تندرو', avatar: '⚡', level: 24, rank: 'قهرمان تورنمنت 🏆', status: 'online', isPlaying: true, gameName: 'تخته نرد' },
  { id: 'p6', name: 'یاسمین_طلا', avatar: '💎', level: 16, rank: 'قهرمان دوز 🔴', status: 'online', isPlaying: false },
];

// Quick Persian chat phrases
const QUICK_PHRASES = [
  'کی تخته نرد میزنه؟ 🎲',
  'شرط‌بندی سنگین کی میاد؟ 💰',
  'سلام به برو بچز چاژا 👋',
  'یک حریف قدر می‌خوام! 👑',
  'بیا روم من بازی کنیم! 🚀',
  'دستخوش، عجب بازی‌ای بود! 🔥'
];

export default function GameRoomsLounge() {
  const navigate = useNavigate();
  const { language, coins } = useAppStore();
  const { 
    onlineUsers = [], 
    globalChat = [], 
    sendGlobalMessage, 
    userName, 
    userAvatar, 
    userId 
  } = useMultiplayerStore();
  const isRtl = language === 'fa';

  // Active Tab: 'rooms' | 'players' | 'chat' | 'tournaments'
  const [activeTab, setActiveTab] = useState('rooms');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [searchRoomCode, setSearchRoomCode] = useState('');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);

  // Rooms State
  const [rooms, setRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('zen_game_rooms');
      return saved ? JSON.parse(saved) : INITIAL_ROOMS;
    } catch (_) {
      return INITIAL_ROOMS;
    }
  });

  // Listen to realtime network for live room announcements across devices
  useEffect(() => {
    const unsubscribe = realtimeNetwork.subscribe((data) => {
      if (data?.type === 'GAME_ROOM_ANNOUNCE' && data.room) {
        setRooms(prev => {
          if (prev.some(r => r.id === data.room.id)) return prev;
          return [data.room, ...prev];
        });
      }
    });
    return () => {
      unsubscribe?.();
    };
  }, []);

  // Online Players State: Real active players from presence network + community mentors
  const realOnlinePlayers = (onlineUsers || []).map(u => ({
    id: u.id,
    name: u.name || 'کاربر آنلاین چاژا',
    avatar: u.avatar || '🌟',
    level: u.level || 15,
    rank: u.role || 'عضو آنلاین چاژا ⚡',
    status: 'online',
    isReal: true,
    isPlaying: false
  }));

  const onlinePlayers = [
    ...realOnlinePlayers,
    ...INITIAL_PLAYERS.filter(p => !realOnlinePlayers.some(u => u.name === p.name || u.id === p.id))
  ];

  const [friendRequestsSent, setFriendRequestsSent] = useState(() => {
    try {
      const saved = localStorage.getItem('zen_friends');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Lounge Chat State
  const [localAnnouncements, setLocalAnnouncements] = useState([
    { id: 'init_sys', sender: 'سیستم سالن 📢', text: 'به سالن بزرگ بازی‌ها و گپ‌وگفت چاژا خوش آمدید! 🎪', time: 'هم‌اکنون', isSystem: true }
  ]);

  // Combined live chat messages
  const chatMessages = [
    ...localAnnouncements,
    ...globalChat.map(g => ({
      id: g.id,
      sender: `${g.userName || 'کاربر'} ${g.userAvatar || '👤'}`,
      text: g.text,
      time: g.timestamp ? new Date(g.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : 'هم‌اکنون',
      isMe: g.userId === userId || g.senderId === 'me',
      isSystem: g.isSystem
    }))
  ];

  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef(null);

  // Create Room Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomGame, setNewRoomGame] = useState('backgammon');
  const [newRoomSets, setNewRoomSets] = useState(3);
  const [newRoomBet, setNewRoomBet] = useState(100);

  // Persist rooms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zen_game_rooms', JSON.stringify(rooms));
    } catch (_) {}
  }, [rooms]);

  // Handle Joining a Room
  const handleJoinRoom = (room) => {
    soundEngine.playTap?.();
    haptics.impact?.('medium');
    const targetGame = LOUNGE_GAMES.find(g => g.id === room.gameId);
    if (targetGame && targetGame.path) {
      navigate(`${targetGame.path}?room=${room.id}&mode=online`);
    } else {
      navigate(`/games/backgammon?room=${room.id}&mode=online`);
    }
  };

  // Handle Direct Code Join
  const handleJoinByCode = (e) => {
    e.preventDefault();
    if (!searchRoomCode.trim()) return;
    const cleanCode = searchRoomCode.trim().toUpperCase();
    soundEngine.playTap?.();
    haptics.success?.();
    if (cleanCode.startsWith('BILL')) {
      navigate(`/games/billiards?room=${cleanCode}&mode=online`);
    } else if (cleanCode.startsWith('CHES')) {
      navigate(`/games/cosmic-chess?room=${cleanCode}&mode=online`);
    } else {
      navigate(`/games/backgammon?room=${cleanCode}&mode=online`);
    }
  };

  // Handle Creating a Room
  const handleCreateRoom = () => {
    const codePrefix = newRoomGame.substring(0, 4).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const roomCode = `${codePrefix}-${randomSuffix}`;
    const selectedGame = LOUNGE_GAMES.find(g => g.id === newRoomGame);

    const newRoomObj = {
      id: roomCode,
      gameId: newRoomGame,
      gameTitle: selectedGame?.titleFa || 'بازی چاژا',
      gameIcon: selectedGame?.icon || '🎮',
      hostName: userName || 'شما (میزبان)',
      hostAvatar: userAvatar || '👑',
      level: 1,
      bet: newRoomBet,
      sets: newRoomSets,
      status: 'waiting',
      players: 1,
      maxPlayers: 2,
      createdAt: Date.now(),
    };

    setRooms(prev => [newRoomObj, ...prev.filter(r => r.id !== roomCode)]);

    // Broadcast room to all devices and active players
    try {
      realtimeNetwork.publish({
        type: 'GAME_ROOM_ANNOUNCE',
        room: newRoomObj,
        senderId: userId,
        senderName: userName || 'میزبان'
      });
      sendGlobalMessage?.(`🎪 اتاق جدید ${selectedGame?.icon} ${selectedGame?.titleFa} با کد ${roomCode} ایجاد شد! 🚀`, true);
    } catch (_) {}

    setIsCreateModalOpen(false);
    soundEngine.playLevelUp?.();
    haptics.success?.();

    // Navigate to game as host
    setTimeout(() => {
      if (selectedGame?.path) {
        navigate(`${selectedGame.path}?room=${roomCode}&mode=online&host=1`);
      } else {
        navigate(`/games/backgammon?room=${roomCode}&mode=online&host=1`);
      }
    }, 400);
  };

  // Handle Sending Lounge Chat Message
  const handleSendChatMessage = (textToSend = inputMessage) => {
    if (!textToSend.trim()) return;
    soundEngine.playTap?.();
    haptics.tap?.();

    const cleanText = textToSend.trim();
    try {
      sendGlobalMessage?.(cleanText);
    } catch (_) {}

    setInputMessage('');

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle Friend Request
  const handleFriendRequest = (player) => {
    soundEngine.playTap?.();
    haptics.impact?.('light');
    if (!friendRequestsSent.includes(player.id)) {
      const updated = [...friendRequestsSent, player.id];
      setFriendRequestsSent(updated);
      try {
        localStorage.setItem('zen_friends', JSON.stringify(updated));
      } catch (_) {}
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter(r => {
    if (selectedGameFilter !== 'all' && r.gameId !== selectedGameFilter) return false;
    if (searchRoomCode && !r.id.toLowerCase().includes(searchRoomCode.toLowerCase())) return false;
    return true;
  });

  return (
    <div data-dark-surface="true" className="min-h-screen bg-[#14100d] text-white flex flex-col font-sans select-none" dir="rtl">
      
      {/* 1. Header Bar */}
      <div className="sticky top-0 z-30 px-4 py-3 bg-[#1e1713]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/games')}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all"
            title="بازگشت به بازی‌ها"
          >
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-amber-300">
                سالن بازی‌ها و گپ‌وگفت 🎪
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            </div>
            <p className="text-[10px] text-amber-100/70 font-medium">
              اتاق‌های فعال بازی و چالش آنلاین با دوستان
            </p>
          </div>
        </div>

        {/* User Coin Balance & Store Button */}
        <button
          onClick={() => {
            soundEngine.playTap?.();
            setIsStoreOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-black shadow-inner transition-all active:scale-95"
          title="فروشگاه اقلام، مهره‌ها و شارژ سکه"
        >
          <ShoppingBag size={14} className="text-amber-400" />
          <span>{coins?.toLocaleString('fa-IR') || '۱,۵۰۰'}</span>
        </button>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="px-3 pt-2 pb-1 bg-[#1a1410] border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'rooms', label: '🎪 اتاق‌ها', count: rooms.length },
          { id: 'players', label: '👥 بازیکنان آنلاین', count: onlinePlayers.length },
          { id: 'chat', label: '💬 گپ سالن', badge: 'زنده' },
          { id: 'tournaments', label: '🏆 مسابقات', badge: 'هفتگی' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                activeTab === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Main Tab Contents */}
      <div className="flex-1 max-w-lg w-full mx-auto p-3.5 pb-24 overflow-y-auto">

        {/* TAB 1: ROOMS FEED */}
        {activeTab === 'rooms' && (
          <div className="space-y-3.5">
            {/* Action Bar: Create Room & Direct Join Code */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsCreateModalOpen(true);
                  soundEngine.playTap?.();
                  haptics.impact?.('medium');
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Plus size={16} strokeWidth={3} />
                <span>ساخت اتاق بازی جدید 🚀</span>
              </button>
            </div>

            {/* Room Code Quick Join Input */}
            <form onSubmit={handleJoinByCode} className="relative flex items-center">
              <input
                type="text"
                value={searchRoomCode}
                onChange={e => setSearchRoomCode(e.target.value)}
                placeholder="کد اتاق را وارد کنید (مثال: BACK-7721)..."
                className="w-full py-2.5 px-4 pl-10 rounded-2xl bg-[#221a15] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 font-mono"
              />
              <button
                type="submit"
                className="absolute left-2 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition-all"
              >
                ورود ⚔️
              </button>
            </form>

            {/* Games Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {LOUNGE_GAMES.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGameFilter(g.id);
                    soundEngine.playTap?.();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                    selectedGameFilter === g.id
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.titleFa}</span>
                </button>
              ))}
            </div>

            {/* Rooms List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
                <span>اتاق‌های در انتظار بازیکن ({filteredRooms.length})</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <RefreshCw size={12} className="animate-spin" />
                  به‌روزرسانی خودکار
                </span>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="py-12 px-4 rounded-3xl bg-white/5 border border-white/10 text-center space-y-3">
                  <div className="text-4xl">🎲</div>
                  <h3 className="text-sm font-black text-amber-300">اتاقی با این فیلتر یافت نشد!</h3>
                  <p className="text-xs text-slate-400">
                    اولین نفری باش که اتاق می‌سازه و بقیه رو به چالش دعوت می‌کنه!
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black"
                  >
                    ساخت اتاق بازی ✨
                  </button>
                </div>
              ) : (
                filteredRooms.map(room => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-[#251d18] to-[#1c1511] border border-amber-600/20 shadow-lg hover:border-amber-500/50 transition-all flex items-center justify-between gap-3"
                  >
                    {/* Left: Game & Host Details */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-400/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {room.gameIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{room.gameTitle}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 font-mono text-amber-200">
                            {room.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <span>{room.hostAvatar}</span>
                            <span className="text-slate-300 font-bold">{room.hostName}</span>
                          </span>
                          <span>•</span>
                          <span className="text-amber-300 font-bold font-mono">
                            {room.bet > 0 ? `💰 ${room.bet} سکه` : '🎁 دوستانه'}
                          </span>
                          <span>•</span>
                          <span className="text-sky-300 font-bold">
                            {room.sets} ست
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Join Button */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        onClick={() => handleJoinRoom(room)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-1 hover:brightness-110"
                      >
                        <Swords size={13} />
                        <span>مسابقه ⚔️</span>
                      </button>
                      <span className="text-[9px] text-slate-500 font-mono font-bold">
                        ظرفیت: {room.players}/{room.maxPlayers}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ONLINE PLAYERS */}
        {activeTab === 'players' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
              <span>کاربران آنلاین در سالن ({onlinePlayers.length})</span>
              <span className="text-emerald-400 text-[11px]">🟢 آنلاین و آماده بازی</span>
            </div>

            <div className="space-y-2">
              {onlinePlayers.map(player => {
                const isFriendSent = friendRequestsSent.includes(player.id);
                return (
                  <div
                    key={player.id}
                    className="p-3 rounded-2xl bg-[#221a15] border border-white/5 flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div 
                      className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() => {
                        soundEngine.playTap?.();
                        setSelectedProfileUser(player);
                      }}
                      title="مشاهده پروفایل و بنرها"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-lg shadow">
                          {player.avatar}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#14100d]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{player.name}</span>
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                            Lv.{player.level}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {player.isPlaying ? (
                            <span className="text-amber-400 font-bold">⚔️ در حال بازی {player.gameName}...</span>
                          ) : (
                            <span>{player.rank}</span>
                          )}
                        </p>
                      </div>
                    </div>

                      {/* Actions: Duel & Friend Request */}
                    <div className="flex items-center gap-1.5">
                      {player.isReal && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>زنده</span>
                        </span>
                      )}

                      <button
                        onClick={() => {
                          handleFriendRequest(player);
                        }}
                        className={`p-2 rounded-xl text-xs transition-all ${
                          isFriendSent
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                        title={isFriendSent ? 'درخواست دوستی ارسال شد' : 'ارسال درخواست دوستی'}
                      >
                        {isFriendSent ? <Check size={14} /> : <UserPlus size={14} />}
                      </button>

                      <button
                        onClick={() => {
                          soundEngine.playTap?.();
                          const duelRoomCode = `BACK-${Math.floor(1000 + Math.random() * 9000)}`;
                          try {
                            sendGlobalMessage?.(`⚔️ ${userName || 'شما'} کاربر ${player.name} را به دوئل تخته نرد دعوت کرد! کد اتاق: ${duelRoomCode}`, true);
                          } catch (_) {}
                          navigate(`/games/backgammon?room=${duelRoomCode}&mode=online&role=white&duel=${encodeURIComponent(player.name)}&host=1`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black flex items-center gap-1 active:scale-95 shadow-sm"
                      >
                        <Swords size={13} />
                        <span>دوئل</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: LIVE LOUNGE CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-210px)] max-h-[600px] justify-between space-y-3">
            {/* Quick Phrases Scrollable Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {QUICK_PHRASES.map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChatMessage(phrase)}
                  style={{ color: '#fef08a' }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-[11px] font-black border border-amber-500/30 whitespace-nowrap active:scale-95 transition-all shrink-0"
                >
                  {phrase}
                </button>
              ))}
            </div>

            {/* Chat Messages Feed */}
            <div data-dark-surface="true" className="flex-1 overflow-y-auto space-y-2 p-3 rounded-2xl bg-[#1c1612] border border-white/10">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  style={
                    msg.isSystem
                      ? {
                          color: '#fde68a',
                          backgroundColor: 'rgba(245, 158, 11, 0.12)',
                          borderColor: 'rgba(245, 158, 11, 0.3)'
                        }
                      : msg.isMe
                        ? {
                            color: '#ffffff',
                            backgroundColor: '#d97706',
                            borderColor: 'rgba(251, 191, 36, 0.4)'
                          }
                        : {
                            color: '#f8fafc',
                            backgroundColor: '#2a1f18',
                            borderColor: 'rgba(255, 255, 255, 0.12)'
                          }
                  }
                  className={`p-2.5 rounded-2xl text-xs max-w-[85%] border transition-all ${
                    msg.isSystem
                      ? 'w-full max-w-full text-center font-bold text-[11px]'
                      : msg.isMe
                        ? 'mr-auto rounded-br-none shadow-md'
                        : 'ml-auto rounded-bl-none shadow-sm'
                  }`}
                >
                  {!msg.isSystem && (
                    <div className="flex items-center justify-between text-[10px] font-black mb-1">
                      <span style={{ color: msg.isMe ? '#fef3c7' : '#fbbf24' }}>{msg.sender}</span>
                      <span style={{ color: msg.isMe ? '#fde68a' : '#94a3b8' }} className="text-[9px] font-mono">{msg.time}</span>
                    </div>
                  )}
                  <p className="leading-relaxed font-bold" style={{ color: msg.isSystem ? '#fde68a' : '#ffffff' }}>
                    {msg.text}
                  </p>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center gap-2 pt-1 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="پیامی برای بازیکنان بنویسید..."
                style={{ color: '#ffffff', backgroundColor: '#221a15' }}
                className="flex-1 py-2.5 px-4 rounded-2xl border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/80"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all shadow-md shrink-0"
              >
                <Send size={16} className="rotate-180" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: TOURNAMENTS & LEADERBOARD */}
        {activeTab === 'tournaments' && (
          <div className="space-y-4">
            {/* Weekly Tournament Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-slate-950 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider bg-slate-950/20 px-2.5 py-0.5 rounded-full">
                  جام هفتگی تخته نرد چاژا 🏆
                </span>
                <span className="text-xs font-black font-mono">۲ روز مانده</span>
              </div>
              <h2 className="text-base font-black">جایزه بزرگ: ۱۰,۰۰۰ سکه + تندیس طلا</h2>
              <p className="text-[11px] font-bold text-slate-900/80">
                با هر برد در اتاق‌های آنلاین امتیاز جمع کنید و در لیدربورد صدرنشین شوید!
              </p>
            </div>

            {/* Podium (Top 3) */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              {/* Rank 2 */}
              <div className="p-3 rounded-2xl bg-[#221a15] border border-white/10 flex flex-col items-center justify-end h-32">
                <span className="text-2xl mb-1">🥈</span>
                <span className="text-xs font-black text-slate-300">سارا_تیرانداز</span>
                <span className="text-[10px] font-mono font-bold text-amber-400">۲,۸۴۰ امتیاز</span>
              </div>

              {/* Rank 1 */}
              <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-500/20 to-[#221a15] border-2 border-amber-400 flex flex-col items-center justify-end h-36 shadow-lg shadow-amber-500/20">
                <span className="text-3xl mb-1 animate-bounce">👑</span>
                <span className="text-xs font-black text-amber-300">طاها_سلطان</span>
                <span className="text-[10px] font-mono font-black text-amber-400">۳,۴۵۰ امتیاز</span>
              </div>

              {/* Rank 3 */}
              <div className="p-3 rounded-2xl bg-[#221a15] border border-white/10 flex flex-col items-center justify-end h-28">
                <span className="text-2xl mb-1">🥉</span>
                <span className="text-xs font-black text-amber-700">بردیا_تندرو</span>
                <span className="text-[10px] font-mono font-bold text-amber-400">۲,۱۹۰ امتیاز</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. Create Room Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-3xl bg-[#1c1612] border-2 border-amber-500/40 p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={16} />
                  <span>ساخت اتاق بازی اختصاصی</span>
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 text-slate-300 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Select Game */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">انتخاب بازی:</label>
                <div className="grid grid-cols-2 gap-2">
                  {LOUNGE_GAMES.filter(g => g.id !== 'all').map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setNewRoomGame(g.id);
                        soundEngine.playTap?.();
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        newRoomGame === g.id
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg">{g.icon}</span>
                      <span>{g.titleFa}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Sets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">تعداد ست‌های مسابقه:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setNewRoomSets(s);
                        soundEngine.playTap?.();
                      }}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        newRoomSets === s
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      {s === 1 ? 'تک‌دست' : `${s} ست`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stakes / Coin Bet */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">شرط سکه (ورودی):</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 100, 300, 500].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setNewRoomBet(b);
                        soundEngine.playTap?.();
                      }}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        newRoomBet === b
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      {b === 0 ? 'رایگان' : `${b} 💰`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm Create Button */}
              <button
                onClick={handleCreateRoom}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all mt-2"
              >
                ایجاد اتاق و انتظار برای حریف 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5-Banner Plato-Style Profile Modal */}
      <OpponentProfileModal
        isOpen={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        player={selectedProfileUser}
        isFriend={selectedProfileUser && friendRequestsSent.includes(selectedProfileUser.id)}
        onSendFriendRequest={handleFriendRequest}
        onOpenStore={() => {
          setSelectedProfileUser(null);
          setIsStoreOpen(true);
        }}
        isRtl={true}
      />

      {/* Chazha Mega Store Modal */}
      <ChazhaStoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
      />

    </div>
  );
}
