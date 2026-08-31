import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2, Users, Trophy, Plus, Globe, Play,
  Lock, Unlock, Radio, Clock, RotateCcw, X,
  Crown, Sparkles, Swords, Zap, ChevronLeft, ChevronRight,
  Flame, Target, Layers, Brain, Coins, Gift
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useMultiplayerStore from '../store/multiplayerStore';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import gameRoomsService from '../services/gameRoomsService';
import CoinShopModal from '../components/shop/CoinShopModal';
import TournamentHubModal from '../components/games/TournamentHubModal';
import ReferralHubModal from '../components/referral/ReferralHubModal';

// Complete Game Definitions with rich artwork & tags
const GAME_DEFS = [
  {
    id: 'hokm',
    titleFa: 'حکم ۴ نفره شاهانه',
    icon: '👑',
    category: 'board',
    maxPlayers: 4,
    color: 'from-amber-600/30 via-yellow-700/20 to-amber-950/50 border-amber-500/40',
    accentColor: 'text-amber-300',
    descFa: 'محبوب‌ترین بازی کارتی ایران با هوش مصنوعی و امکان شرط‌بندی سکه.',
    level: 'شاهانه 👑',
    featured: true,
    path: '/games/hokm'
  },
  {
    id: 'backgammon',
    titleFa: 'تخته نرد ایرانی',
    icon: '🎲',
    category: 'board',
    maxPlayers: 2,
    color: 'from-orange-600/30 via-amber-800/20 to-orange-950/50 border-orange-500/40',
    accentColor: 'text-orange-300',
    descFa: 'تخته‌نرد اصیل با ۳ تم زیبا، ربات هوشمند، دونفره و آنلاین.',
    level: 'اصیل 🎲',
    featured: true,
    path: '/games/backgammon'
  },
  {
    id: 'pasur',
    titleFa: 'پاستور (چهاربرگ)',
    icon: '🃏',
    category: 'board',
    maxPlayers: 2,
    color: 'from-emerald-600/30 via-teal-800/20 to-emerald-950/50 border-emerald-500/40',
    accentColor: 'text-emerald-300',
    descFa: 'بازی کارتی خاطره‌انگیز ایرانی. جمع کن، پاستور بزن و امتیاز بگیر!',
    level: 'ایرانی 🇮🇷',
    featured: true,
    path: '/games/pasur'
  },
  {
    id: 'ludo',
    titleFa: 'منچ کلاسیک (۲ تا ۴ نفره)',
    icon: '🎯',
    category: 'board',
    maxPlayers: 4,
    color: 'from-rose-600/30 via-pink-800/20 to-rose-950/50 border-rose-500/40',
    accentColor: 'text-rose-300',
    descFa: 'منچ ۲ تا ۴ نفره هیجان‌انگیز همراه با هوش مصنوعی و بازی آنلاین.',
    level: 'دورهمی 🔥',
    featured: true,
    path: '/games/ludo'
  },
  {
    id: 'snakes',
    titleFa: 'مار و پله (۲ تا ۴ نفره)',
    icon: '🐍',
    category: 'board',
    maxPlayers: 4,
    color: 'from-emerald-600/30 via-teal-800/20 to-emerald-950/50 border-emerald-500/40',
    accentColor: 'text-emerald-300',
    descFa: 'مارپله خاطره‌انگیز ۲ تا ۴ نفره با نردبان‌های شتاب‌دهنده و نیش مار.',
    level: 'دورهمی 🎲',
    featured: true,
    path: '/games/snakes-and-ladders'
  },
  {
    id: 'soccer',
    titleFa: 'فوتبال انگشتی و دکمه‌ای',
    icon: '⚽',
    category: 'arcade',
    maxPlayers: 4,
    color: 'from-green-600/30 via-emerald-800/20 to-green-950/50 border-green-500/40',
    accentColor: 'text-green-300',
    descFa: 'فوتبال فیزیکی ۲ نفره و تیمی ۴ نفره با مهره‌های قدرتی و ضربه به توپ.',
    level: 'ورزشی ⚽',
    featured: true,
    path: '/games/finger-soccer'
  },
  {
    id: 'ocho',
    titleFa: 'اوچو (Uno رنگی)',
    icon: '🌈',
    category: 'board',
    maxPlayers: 4,
    color: 'from-purple-600/30 via-pink-800/20 to-purple-950/50 border-purple-500/40',
    accentColor: 'text-purple-300',
    descFa: 'بازی کارتی معروف اوچو و اونو با کارت‌های رنگی، تغییر جهت و جریمه.',
    level: 'هیجانی 🃏',
    featured: true,
    path: '/games/ocho'
  },
  {
    id: 'golf',
    titleFa: 'مینی گلف رویال',
    icon: '⛳',
    category: 'arcade',
    maxPlayers: 2,
    color: 'from-lime-600/30 via-emerald-800/20 to-lime-950/50 border-lime-500/40',
    accentColor: 'text-lime-300',
    descFa: 'مینی گلف ۲ نفره با موانع حرکتی، زاویه‌بندی و پاکت کردن توپ.',
    level: 'ورزشی ⛳',
    featured: true,
    path: '/games/mini-golf'
  },
  {
    id: 'billiards',
    titleFa: 'بیلیارد ۸-توپی',
    icon: '🎱',
    category: 'arcade',
    maxPlayers: 2,
    color: 'from-teal-600/30 via-emerald-800/20 to-teal-950/50 border-teal-500/40',
    accentColor: 'text-teal-300',
    descFa: 'بیلیارد واقعی با موتور فیزیک، زاویه‌بندی و پاکت کردن توپ‌ها.',
    level: 'اکشن 🎱',
    path: '/games/billiards'
  },
  {
    id: 'cosmic_chess',
    titleFa: 'شطرنج کیهانی',
    icon: '♟️',
    category: 'board',
    maxPlayers: 2,
    color: 'from-indigo-600/30 via-blue-800/20 to-indigo-950/50 border-indigo-500/40',
    accentColor: 'text-indigo-300',
    descFa: 'شطرنج کامل همراه با هوش مصنوعی و بازی دونفره در یک دستگاه.',
    level: 'استراتژیک ♟️',
    path: '/games/cosmic-chess'
  },
  {
    id: 'tic_tac_toe',
    titleFa: 'دوز نئونی (X-O)',
    icon: '⭕',
    category: 'board',
    maxPlayers: 2,
    color: 'from-emerald-600/20 via-teal-900/30 to-slate-950/50 border-emerald-500/40',
    accentColor: 'text-emerald-300',
    descFa: 'بازی کلاسیک دوز با گرافیک سایبرپانک و حریف هوشمند.',
    level: 'ساده 🟢',
    path: '/games/tic-tac-toe'
  },
  {
    id: 'cosmic_pong',
    titleFa: 'پونگ کیهانی',
    icon: '🏓',
    category: 'arcade',
    maxPlayers: 2,
    color: 'from-sky-600/20 via-blue-900/30 to-slate-950/50 border-sky-500/40',
    accentColor: 'text-sky-300',
    descFa: 'پونگ دونفره رقابتی با کنترل لمسی و کیبورد.',
    level: 'دونفره 🏓',
    path: '/games/cosmic-pong'
  },
  {
    id: 'cyber_2048',
    titleFa: '۲۰۴۸ سایبری',
    icon: '🔢',
    category: 'puzzle',
    maxPlayers: 1,
    color: 'from-cyan-600/20 via-blue-900/30 to-slate-950/50 border-cyan-500/40',
    accentColor: 'text-cyan-300',
    descFa: 'پازل ریاضی و استراتژیک با کاشی‌های نئونی.',
    level: 'رکوردی 🔴',
    path: '/games/2048'
  },
  {
    id: 'neon_snake',
    titleFa: 'مار سایبری (Snake)',
    icon: '🐍',
    category: 'arcade',
    maxPlayers: 1,
    color: 'from-purple-600/20 via-fuchsia-900/30 to-slate-950/50 border-purple-500/40',
    accentColor: 'text-purple-300',
    descFa: 'مار کلاسیک با جلوه‌های نئونی و ثبت رکورد.',
    level: 'آرکید 🐍',
    path: '/games/neon-snake'
  },
  {
    id: 'space_defender',
    titleFa: 'مدافع فضا',
    icon: '🚀',
    category: 'arcade',
    maxPlayers: 1,
    color: 'from-rose-600/20 via-red-900/30 to-slate-950/50 border-rose-500/40',
    accentColor: 'text-rose-300',
    descFa: 'کنترل سفینه و نابودی سنگ‌های آسمانی در کهکشان.',
    level: 'اکشن 🚀',
    path: '/games/space-defender'
  },
  {
    id: 'reaction_speed',
    titleFa: 'سرعت واکنش',
    icon: '⚡',
    category: 'puzzle',
    maxPlayers: 1,
    color: 'from-amber-600/20 via-orange-900/30 to-slate-950/50 border-amber-500/40',
    accentColor: 'text-amber-300',
    descFa: 'سنجش میلی‌ثانیه‌ای سرعت رفلکس و عکس‌العمل عصبی.',
    level: 'واکنش ⚡',
    path: '/games/reaction-speed'
  },
  {
    id: 'wordle_persian',
    titleFa: 'حدس کلمه فارسی',
    icon: '🔤',
    category: 'puzzle',
    maxPlayers: 1,
    color: 'from-yellow-600/20 via-amber-900/30 to-slate-950/50 border-yellow-500/40',
    accentColor: 'text-yellow-300',
    descFa: 'کلمه ۵ حرفی پنهان را در ۶ تلاش حدس بزن.',
    level: 'کلمات 🔤',
    path: '/games/wordle'
  },
  {
    id: 'memory_matrix',
    titleFa: 'ماتریس حافظه',
    icon: '🧠',
    category: 'puzzle',
    maxPlayers: 1,
    color: 'from-fuchsia-600/20 via-purple-900/30 to-slate-950/50 border-fuchsia-500/40',
    accentColor: 'text-fuchsia-300',
    descFa: 'تقویت حافظه فعال و تمرکز ذهن با کشف جفت کارت‌ها.',
    level: 'حافظه 🧠',
    path: '/games/memory-matrix'
  }
];

const MULTIPLAYER_IDS = ['hokm', 'backgammon', 'ludo', 'snakes', 'soccer', 'ocho', 'golf', 'pasur', 'billiards', 'cosmic_chess', 'tic_tac_toe', 'cosmic_pong'];

const CATEGORIES = [
  { id: 'all', labelFa: 'همه بازی‌ها', icon: '🎮' },
  { id: 'board', labelFa: 'شاهانه و تخته', icon: '🎲' },
  { id: 'arcade', labelFa: 'آرکید و اکشن', icon: '🕹️' },
  { id: 'puzzle', labelFa: 'فکری و پازل', icon: '🧩' }
];

// Helper to safely render Avatar (Base64 image or Emoji)
function SafeAvatar({ avatar, size = 'w-9 h-9 text-base', ringColor = 'border-purple-500/50' }) {
  if (!avatar) return <div className={`${size} rounded-2xl bg-purple-600 flex items-center justify-center text-white shrink-0`}>👤</div>;
  if (avatar.startsWith('data:image/') || avatar.startsWith('http')) {
    return (
      <img
        src={avatar}
        alt="Avatar"
        className={`${size} rounded-2xl object-cover border-2 ${ringColor} shadow-md shrink-0`}
      />
    );
  }
  return (
    <div className={`${size} rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center border-2 ${ringColor} shadow-md shrink-0`}>
      {avatar}
    </div>
  );
}

// Live Room Card (Dark Glass Platô Design)
function LiveRoomCard({ room, onJoin }) {
  const game = GAME_DEFS.find(g => g.id === room.gameType);
  const timeAgo = Math.max(0, Math.round((Date.now() - room.createdAt) / 60000));
  const isFull = room.currentPlayers >= room.maxPlayers;
  const isWaiting = room.status === 'waiting';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-3xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-400/60 transition-all backdrop-blur-xl shadow-xl space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            {game?.icon || '🎮'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white truncate">{game?.titleFa || room.gameType}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isWaiting && !isFull
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              }`}>
                {isWaiting && !isFull ? 'در انتظار حریف' : isFull ? 'تکمیل شد' : 'در جریان'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <SafeAvatar avatar={room.hostAvatar} size="w-4 h-4 text-[10px]" />
                <span className="truncate max-w-[100px] text-slate-300 font-bold">{room.hostName || 'کاربر'}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-purple-300">
                <Users size={11} /> {room.currentPlayers}/{room.maxPlayers} نفر
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock size={11} /> {timeAgo < 1 ? 'همین الان' : `${timeAgo} دقیقه` }
              </span>
            </div>
          </div>
        </div>

        {/* Join Action Button */}
        <button
          onClick={() => onJoin(room)}
          disabled={!isWaiting || isFull}
          className="shrink-0 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:brightness-110 text-white text-xs font-black disabled:opacity-35 active:scale-95 shadow-lg shadow-purple-500/30 transition-all flex items-center gap-1.5"
        >
          <Play size={13} />
          <span>پیوستن</span>
        </button>
      </div>

      {/* Players Progress Indicators */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
        {Array.from({ length: room.maxPlayers || 2 }).map((_, idx) => {
          const isFilled = idx < room.currentPlayers;
          return (
            <div
              key={idx}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                isFilled ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm shadow-purple-500/50' : 'bg-white/10'
              }`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

// Create Online Game Modal
function CreateRoomModal({ isOpen, onClose, onCreated, userName, userAvatar }) {
  const [selectedGame, setSelectedGame] = useState(GAME_DEFS[0]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const multiplayerGames = GAME_DEFS.filter(g => MULTIPLAYER_IDS.includes(g.id));

  const handleCreate = async () => {
    if (!selectedGame) return;
    setCreating(true);
    const roomId = selectedGame.id.toUpperCase().slice(0, 4) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const room = await gameRoomsService.publishRoom({
      roomId,
      gameType: selectedGame.id,
      gameTitleFa: selectedGame.titleFa,
      hostId: localStorage.getItem('life_os_user_id') || 'u_' + Date.now(),
      hostName: (userName && userName.length < 25 && !userName.startsWith('data:image/')) ? userName : 'کاربر زنوسلایف',
      hostAvatar: userAvatar || '🎮',
      maxPlayers: selectedGame.maxPlayers,
      isPrivate
    });
    setCreating(false);
    onCreated(room, selectedGame);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-purple-500/40 p-5 shadow-2xl space-y-4 text-right overflow-y-auto max-h-[90vh]"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus size={20} className="text-purple-400" />
                ساخت بازی آنلاین جدید (Platô Match)
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-300 font-bold mb-2.5">انتخاب نوع بازی:</p>
              <div className="grid grid-cols-2 gap-2">
                {multiplayerGames.map(g => (
                  <button
                    key={g.id}
                    onClick={() => { setSelectedGame(g); soundEngine.playTap?.(); }}
                    className={`p-3 rounded-2xl border text-right flex items-center gap-2.5 transition-all active:scale-95 ${
                      selectedGame?.id === g.id
                        ? 'border-purple-400 bg-purple-500/25 text-white shadow-lg shadow-purple-500/20 ring-1 ring-purple-400'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-purple-500/40'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{g.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-black block truncate">{g.titleFa}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{g.maxPlayers} نفره</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                {isPrivate ? <Lock size={16} className="text-amber-400" /> : <Unlock size={16} className="text-emerald-400" />}
                <div>
                  <p className="text-xs font-black text-white">{isPrivate ? 'اتاق خصوصی' : 'اتاق عمومی لابی'}</p>
                  <p className="text-[10px] text-slate-400">{isPrivate ? 'ورود با ارسال لینک اتاق' : 'نمایش در لیست بازی‌های زنده'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={`relative w-12 h-6 rounded-full transition-all ${isPrivate ? 'bg-amber-500' : 'bg-emerald-500'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isPrivate ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <button
              onClick={handleCreate}
              disabled={!selectedGame || creating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white font-black text-sm shadow-xl shadow-purple-500/30 disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {creating ? (
                <><RotateCcw size={16} className="animate-spin" /> در حال ایجاد اتاق و اتصال به سرور...</>
              ) : (
                <><Play size={16} /> ایجاد اتاق و ورود به مسابقه</>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// Game Mode Selector & Matchmaking Modal
function GameModeModal({ isOpen, onClose, game, onSelectMode }) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (isSearching) {
      interval = setInterval(() => setSearchTimer(t => t + 1), 1000);
    } else {
      setSearchTimer(0);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  if (!isOpen || !game) return null;

  const handleStartOnlineSearch = () => {
    setIsSearching(true);
    soundEngine.playDiceRoll?.();
    haptics.impact?.('heavy');

    // Simulate matchmaking find (2.5s)
    setTimeout(() => {
      setIsSearching(false);
      soundEngine.playSuccess?.();
      haptics.success?.();
      onSelectMode('online');
      onClose();
    }, 2800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4" onClick={onClose} dir="rtl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a0c2e] via-[#12071f] to-[#0a0312] border-2 border-purple-500/40 p-6 text-center shadow-2xl space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{game.icon}</span>
              <div className="text-right">
                <h3 className="text-base font-black text-white">{game.titleFa}</h3>
                <span className="text-[10px] text-purple-300 font-bold">{game.maxPlayers} نفره • {game.level}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Searching Online Radar */}
          {isSearching ? (
            <div className="py-8 space-y-4">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/40 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-pink-500/60 animate-pulse" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50">
                  {game.icon}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-black text-white animate-pulse">در حال جستجوی بازیکن آنلاین...</h4>
                <p className="text-xs text-purple-300 mt-1">زمان جستجو: {searchTimer} ثانیه</p>
              </div>
              <button
                onClick={() => setIsSearching(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-slate-300 hover:text-white"
              >
                انصراف
              </button>
            </div>
          ) : (
            /* Mode Options */
            <div className="space-y-2.5 pt-1">
              {/* Option 1: Play vs AI Bot */}
              <button
                onClick={() => { onSelectMode('bot'); onClose(); }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-950/80 border border-purple-500/40 hover:border-purple-400 text-right flex items-center justify-between group active:scale-95 transition-all shadow-lg shadow-purple-950/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl text-purple-300 group-hover:scale-110 transition-transform">
                    🤖
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-purple-300">بازی با ربات هوشمند</h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">آفلاین، سریع و بدون معطلی با هوش مصنوعی</p>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-purple-400" />
              </button>

              {/* Option 2: Live Online Matchmaking */}
              <button
                onClick={handleStartOnlineSearch}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-pink-900/60 to-purple-950/80 border border-pink-500/40 hover:border-pink-400 text-right flex items-center justify-between group active:scale-95 transition-all shadow-lg shadow-pink-950/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-pink-600/30 border border-pink-400/40 flex items-center justify-center text-xl text-pink-300 group-hover:scale-110 transition-transform">
                    👥
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-pink-300">جستجوی حریف آنلاین</h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">اتصال زنده به بازیکنان حاضر در ربات</p>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-pink-400" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function Games() {
  const navigate = useNavigate();
  const { coins, isVip } = useAppStore();
  const { userName, userAvatar } = useMultiplayerStore();

  const [activeTab, setActiveTab] = useState('live');
  const [activeCategory, setActiveCategory] = useState('all');
  const [liveRooms, setLiveRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [selectedGameForMode, setSelectedGameForMode] = useState(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showTournamentsModal, setShowTournamentsModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  useEffect(() => {
    const unsub = gameRoomsService.subscribe(rooms => {
      setLiveRooms(rooms.filter(r => !r.isPrivate));
    });
    return unsub;
  }, []);

  const handleJoinRoom = (room) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    const game = GAME_DEFS.find(g => g.id === room.gameType);
    if (game) navigate(`${game.path}?mode=online&room=${room.roomId}`);
  };

  const handleRoomCreated = (room, game) => {
    soundEngine.playLevelUp?.();
    navigate(`${game.path}?mode=online&room=${room.roomId}`);
  };

  const handleGameClick = (game) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    if (MULTIPLAYER_IDS.includes(game.id)) {
      setSelectedGameForMode(game);
      setShowModeModal(true);
    } else {
      navigate(game.path);
    }
  };

  const handleModeSelected = (mode) => {
    if (!selectedGameForMode) return;
    if (mode === 'bot') {
      navigate(`${selectedGameForMode.path}?mode=bot`);
    } else {
      navigate(`${selectedGameForMode.path}?mode=online&matchmaking=true`);
    }
  };

  const filteredGames = activeCategory === 'all'
    ? GAME_DEFS
    : GAME_DEFS.filter(g => g.category === activeCategory);

  const cleanUserName = (userName && userName.length < 25 && !userName.startsWith('data:image/'))
    ? userName
    : 'کاربر زنوسلایف';

  return (
    <div className="w-full min-h-screen pb-32 bg-[#050711] text-white select-none relative overflow-x-hidden font-sans" dir="rtl">
      
      {/* Dynamic Cosmic Glow Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-10 left-1/4 w-[450px] h-[450px] rounded-full bg-purple-600 blur-[130px]" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] rounded-full bg-pink-600 blur-[120px]" />
        <div className="absolute bottom-20 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-600 blur-[110px]" />
      </div>

      <div className="relative z-10 px-3 sm:px-4 pt-4 max-w-2xl mx-auto space-y-4">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between p-3 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 min-w-0">
            <SafeAvatar avatar={userAvatar} size="w-10 h-10 text-lg" ringColor="border-amber-400/60" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-white truncate">{cleanUserName}</h3>
                {isVip && <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">VIP 👑</span>}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>آنلاین در آرکید</span>
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-1.5">
            {/* Tournaments */}
            <button
              onClick={() => { setShowTournamentsModal(true); soundEngine.playTap?.(); }}
              className="p-2 px-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 hover:bg-amber-500/25 text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              title="جام قهرمانان و تورنمنت‌ها"
            >
              <Trophy size={14} className="text-yellow-400" />
              <span className="hidden xs:inline">تورنمنت</span>
            </button>

            {/* Referral */}
            <button
              onClick={() => { setShowReferralModal(true); soundEngine.playTap?.(); }}
              className="p-2 px-2.5 rounded-2xl bg-purple-500/15 border border-purple-400/40 text-purple-300 hover:bg-purple-500/25 text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              title="دعوت دوستان و کسب سکه"
            >
              <Users size={14} className="text-pink-400" />
              <span className="hidden xs:inline">دعوت</span>
            </button>

            {/* Coin Shop Balance */}
            <button
              onClick={() => { setShowShopModal(true); soundEngine.playTap?.(); }}
              className="p-2 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-lg shadow-yellow-500/25 hover:brightness-110 active:scale-95 transition-all"
              title="خرید سکه و ستاره تلگرام"
            >
              <Coins size={14} />
              <span>{(coins || 0).toLocaleString()}</span>
            </button>
          </div>
        </div>

        {/* Hero Featured Banner (Hokm & Tournaments) */}
        <div className="relative p-5 rounded-3xl bg-gradient-to-r from-amber-900/40 via-purple-950/60 to-slate-900 border border-amber-500/40 overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black flex items-center gap-1">
                <Crown size={11} /> ویژه شاهانه
              </span>
              <span className="text-[10px] text-slate-300 font-bold">جوایز میلیونی سکه 🪙</span>
            </div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-pink-300">
              جام مسابقات حکم ۴ نفره و تخته‌نرد
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              با دوستان و حریفان آنلاین در سراسر ایران رقابت کنید، شرط ببندید و پاداش‌های شگفت‌انگیز ببرید!
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => navigate('/games/hokm')}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs active:scale-95 shadow-md flex items-center gap-1"
              >
                <Crown size={13} /> بازی حکم ۴ نفره
              </button>
              <button
                onClick={() => setShowTournamentsModal(true)}
                className="px-4 py-2 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 active:scale-95"
              >
                مشاهده تورنمنت‌ها 🏆
              </button>
            </div>
          </div>
        </div>

        {/* Main Segmented Tabs */}
        <div className="flex p-1.5 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-md gap-1.5 shadow-lg">
          <button
            onClick={() => { setActiveTab('live'); soundEngine.playTap?.(); }}
            className={`flex-1 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'live'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white shadow-xl shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio size={14} className={activeTab === 'live' ? 'animate-pulse' : ''} />
            <span>اتاق‌های زنده آنلاین</span>
            {liveRooms.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                {liveRooms.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('all'); soundEngine.playTap?.(); }}
            className={`flex-1 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white shadow-xl shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 size={14} />
            <span>تمام بازی‌ها ({GAME_DEFS.length})</span>
          </button>
        </div>

        {/* Tab 1: Live Online Rooms */}
        {activeTab === 'live' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">
                  {liveRooms.length > 0 ? `${liveRooms.length} اتاق بازی آنلاین در حال حاضر فعال است` : 'در انتظار ساخت اتاق جدید'}
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-black text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus size={14} /> ساخت اتاق
              </button>
            </div>

            {liveRooms.length === 0 ? (
              <div className="text-center py-14 p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
                <div className="text-6xl animate-bounce">🎮</div>
                <div>
                  <h4 className="text-base font-black text-white">اتاق بازی فعالی در جریان نیست</h4>
                  <p className="text-xs text-slate-400 mt-1">اولین نفری باشید که اتاق می‌سازد و دوستانتان را به مسابقه دعوت می‌کند!</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white text-xs font-black shadow-xl shadow-purple-500/30 active:scale-95"
                >
                  + ساخت اولین اتاق بازی
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {liveRooms.map(room => (
                  <LiveRoomCard key={room.roomId} room={room} onJoin={handleJoinRoom} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Games Grid */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); soundEngine.playTap?.(); }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all border shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-lg shadow-purple-500/25'
                      : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.labelFa}</span>
                </button>
              ))}
            </div>

            {/* Games 2-Column Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredGames.map(game => (
                <motion.div
                  key={game.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleGameClick(game)}
                  className={`p-4 rounded-3xl cursor-pointer border bg-gradient-to-br ${game.color} backdrop-blur-xl flex flex-col justify-between space-y-3 shadow-lg hover:shadow-2xl transition-all group`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-3xl p-2 rounded-2xl bg-black/40 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                        {game.icon}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 bg-black/40 text-slate-200 rounded-full border border-white/10">
                        {game.level}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-sm font-black text-white group-hover:${game.accentColor} transition-colors`}>
                        {game.titleFa}
                      </h3>
                      <p className="text-[10px] text-slate-300/80 mt-1 line-clamp-2 leading-relaxed">
                        {game.descFa}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      <Users size={10} /> {game.maxPlayers > 1 ? `${game.maxPlayers} نفره` : 'تک‌نفره'}
                    </span>
                    {MULTIPLAYER_IDS.includes(game.id) && (
                      <span className="text-emerald-400 font-black flex items-center gap-1">
                        <Globe size={10} /> آنلاین
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Action Button for Creating Online Game */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => { setShowCreateModal(true); soundEngine.playTap?.(); haptics.tap?.(); }}
        className="fixed bottom-24 right-1/2 translate-x-1/2 z-40 flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white font-black text-sm shadow-2xl shadow-purple-500/50 active:scale-95 transition-all border border-purple-400/50"
        style={{ boxShadow: '0 0 35px rgba(217, 70, 239, 0.45)' }}
      >
        <Plus size={18} />
        <span>ساخت بازی آنلاین</span>
      </motion.button>

      {/* Game Mode Selector Modal */}
      <GameModeModal
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        game={selectedGameForMode}
        onSelectMode={handleModeSelected}
      />

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleRoomCreated}
        userName={cleanUserName}
        userAvatar={userAvatar}
      />

      <CoinShopModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
      />

      <TournamentHubModal
        isOpen={showTournamentsModal}
        onClose={() => setShowTournamentsModal(false)}
      />

      <ReferralHubModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />

    </div>
  );
}
