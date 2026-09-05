import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2, Users, Trophy, Plus, Globe, Play,
  Lock, Unlock, Radio, Clock, RotateCcw, X,
  Crown, Sparkles, Swords, Zap, ChevronLeft, ChevronRight,
  Flame, Target, Layers, Brain, Coins, Gift, Sun, Moon, Share2, Copy, Send
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useMultiplayerStore from '../store/multiplayerStore';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import gameRoomsService from '../services/gameRoomsService';
import { shareToTelegram, shareViaInlineQuery } from '../utils/telegram';
import CoinShopModal from '../components/shop/CoinShopModal';
import TournamentHubModal from '../components/games/TournamentHubModal';
import ReferralHubModal from '../components/referral/ReferralHubModal';
import GameHistoryPanel from '../components/games/GameHistoryPanel';

// Complete Game Definitions with rich bilingual artwork & tags
export const GAME_DEFS = [
  {
    id: 'hokm',
    titleFa: 'حکم ۴ نفره شاهانه',
    titleEn: 'Royal 4-Player Hokm',
    icon: '👑',
    category: 'board',
    maxPlayers: 4,
    color: 'from-amber-600/30 via-yellow-700/20 to-amber-950/50 border-amber-500/40',
    accentColor: 'text-amber-300',
    descFa: 'محبوب‌ترین بازی کارتی ایران با هوش مصنوعی و امکان شرط‌بندی سکه.',
    descEn: 'Persia’s most popular card game with smart AI and coin wagers.',
    levelFa: 'شاهانه 👑',
    levelEn: 'Royal 👑',
    featured: true,
    path: '/games/hokm'
  },
  {
    id: 'backgammon',
    titleFa: 'تخته نرد ایرانی',
    titleEn: 'Persian Backgammon',
    icon: '🎲',
    category: 'board',
    maxPlayers: 2,
    color: 'from-orange-600/30 via-amber-800/20 to-orange-950/50 border-orange-500/40',
    accentColor: 'text-orange-300',
    descFa: 'تخته‌نرد اصیل با ۳ تم زیبا، ربات هوشمند، دونفره و آنلاین.',
    descEn: 'Authentic Backgammon with 3 themes, smart bot, 2P & online.',
    levelFa: 'اصیل 🎲',
    levelEn: 'Classic 🎲',
    featured: true,
    path: '/games/backgammon'
  },
  {
    id: 'pasur',
    titleFa: 'پاستور (چهاربرگ)',
    titleEn: 'Pasur (4-Cards)',
    icon: '🃏',
    category: 'board',
    maxPlayers: 2,
    color: 'from-emerald-600/30 via-teal-800/20 to-emerald-950/50 border-emerald-500/40',
    accentColor: 'text-emerald-300',
    descFa: 'بازی کارتی خاطره‌انگیز ایرانی. جمع کن، پاستور بزن و امتیاز بگیر!',
    descEn: 'Memorable Persian card game. Match, sweep, and score points!',
    levelFa: 'ایرانی 🇮🇷',
    levelEn: 'Persian 🇮🇷',
    featured: true,
    path: '/games/pasur'
  },
  {
    id: 'ludo',
    titleFa: 'منچ کلاسیک (۲ تا ۴ نفره)',
    titleEn: 'Classic Ludo (2-4P)',
    icon: '🎯',
    category: 'board',
    maxPlayers: 4,
    color: 'from-rose-600/30 via-pink-800/20 to-rose-950/50 border-rose-500/40',
    accentColor: 'text-rose-300',
    descFa: 'منچ ۲ تا ۴ نفره هیجان‌انگیز همراه با هوش مصنوعی و بازی آنلاین.',
    descEn: 'Exciting 2-4 player Ludo with AI bots and online multiplayer.',
    levelFa: 'دورهمی 🔥',
    levelEn: 'Party 🔥',
    featured: true,
    path: '/games/ludo'
  },
  {
    id: 'snakes',
    titleFa: 'مار و پله (۲ تا ۴ نفره)',
    titleEn: 'Snakes & Ladders',
    icon: '🐍',
    category: 'board',
    maxPlayers: 4,
    color: 'from-emerald-600/30 via-teal-800/20 to-emerald-950/50 border-emerald-500/40',
    accentColor: 'text-emerald-300',
    descFa: 'مارپله خاطره‌انگیز ۲ تا ۴ نفره با نردبان‌های شتاب‌دهنده و نیش مار.',
    descEn: 'Nostalgic 2-4 player board game with booster ladders & snake traps.',
    levelFa: 'دورهمی 🎲',
    levelEn: 'Party 🎲',
    featured: true,
    path: '/games/snakes-and-ladders'
  },
  {
    id: 'connect_four',
    titleFa: 'چهار در یک خط نئونی',
    titleEn: 'Neon Connect 4',
    icon: '🎯',
    category: 'board',
    maxPlayers: 2,
    color: 'from-blue-600/30 via-indigo-800/20 to-blue-950/50 border-blue-500/40',
    accentColor: 'text-blue-300',
    descFa: 'بازی استراتژیک چهار مهره متوالی با فیزیک جاذبه، ربات و آنلاین.',
    descEn: 'Strategic 4-in-a-row drop battle with gravity physics, AI & 2P.',
    levelFa: 'استراتژیک 🧠',
    levelEn: 'Strategy 🧠',
    featured: true,
    path: '/games/connect-four'
  },
  {
    id: 'dots_and_boxes',
    titleFa: 'نقطه خط کیهانی',
    titleEn: 'Cosmic Dots & Boxes',
    icon: '📦',
    category: 'board',
    maxPlayers: 2,
    color: 'from-teal-600/30 via-emerald-800/20 to-teal-950/50 border-teal-500/40',
    accentColor: 'text-teal-300',
    descFa: 'اتصال نقطه‌ها، تسخیر خانه‌های نئونی و نوبت جایزه با ربات و دونفره.',
    descEn: 'Connect dots, claim neon boxes and earn bonus turns vs AI or 2P.',
    levelFa: 'فکری 🧩',
    levelEn: 'Puzzle 🧩',
    featured: true,
    path: '/games/dots-and-boxes'
  },
  {
    id: 'air_hockey',
    titleFa: 'ایر هاکی نئونی',
    titleEn: 'Neon Air Hockey',
    icon: '🏒',
    category: 'arcade',
    maxPlayers: 2,
    color: 'from-cyan-600/30 via-sky-800/20 to-cyan-950/50 border-cyan-500/40',
    accentColor: 'text-cyan-300',
    descFa: 'مسابقه پرسرعت ایر هاکی با فیزیک واقعی، ضربات زاویه‌دار و گل‌زنی.',
    descEn: 'Fast-paced air hockey with realistic physics, strikes & goals.',
    levelFa: 'اکشن ⚡',
    levelEn: 'Action ⚡',
    featured: true,
    path: '/games/air-hockey'
  },
  {
    id: 'battleship',
    titleFa: 'نبرد ناوها و جنگ کیهانی',
    titleEn: 'Cosmic Battleship',
    icon: '🚀',
    category: 'board',
    maxPlayers: 2,
    color: 'from-indigo-600/30 via-purple-800/20 to-indigo-950/50 border-indigo-500/40',
    accentColor: 'text-indigo-300',
    descFa: 'چیدمان ناوگان در رادار، شلیک موشک و نابودی سفینه‌های دشمن.',
    descEn: 'Deploy your space fleet, fire radar missiles, and sink the enemy.',
    levelFa: 'تاکتیک 🎯',
    levelEn: 'Tactical 🎯',
    featured: true,
    path: '/games/battleship'
  },
  {
    id: 'soccer',
    titleFa: 'فوتبال انگشتی و دکمه‌ای',
    titleEn: 'Finger Soccer 2D',
    icon: '⚽',
    category: 'arcade',
    maxPlayers: 4,
    color: 'from-green-600/30 via-emerald-800/20 to-green-950/50 border-green-500/40',
    accentColor: 'text-green-300',
    descFa: 'فوتبال فیزیکی ۲ نفره و تیمی ۴ نفره با مهره‌های قدرتی و شوت به دروازه.',
    descEn: 'Physical 2-4 player table soccer with power caps and goal shots.',
    levelFa: 'ورزشی ⚽',
    levelEn: 'Sports ⚽',
    featured: true,
    path: '/games/finger-soccer'
  },
  {
    id: 'ocho',
    titleFa: 'اوچو (Uno رنگی)',
    titleEn: 'Ocho (Uno Color Match)',
    icon: '🌈',
    category: 'board',
    maxPlayers: 4,
    color: 'from-purple-600/30 via-pink-800/20 to-purple-950/50 border-purple-500/40',
    accentColor: 'text-purple-300',
    descFa: 'بازی کارتی معروف اوچو و اونو با کارت‌های رنگی، تغییر جهت و جریمه.',
    descEn: 'Famous color card battle with draw cards, skips, and wild colors.',
    levelFa: 'هیجانی 🃏',
    levelEn: 'Party 🃏',
    featured: true,
    path: '/games/ocho'
  },
  {
    id: 'golf',
    titleFa: 'مینی گلف رویال',
    titleEn: 'Royal Mini Golf',
    icon: '⛳',
    category: 'arcade',
    maxPlayers: 2,
    color: 'from-lime-600/30 via-emerald-800/20 to-lime-950/50 border-lime-500/40',
    accentColor: 'text-lime-300',
    descFa: 'مینی گلف ۲ نفره با موانع حرکتی، زاویه‌بندی و پاکت کردن توپ.',
    descEn: '2-Player mini golf with moving obstacles and smooth putting physics.',
    levelFa: 'ورزشی ⛳',
    levelEn: 'Sports ⛳',
    featured: true,
    path: '/games/mini-golf'
  },
  {
    id: 'billiards',
    titleFa: 'بیلیارد ۸-توپی',
    titleEn: '8-Ball Billiards',
    icon: '🎱',
    category: 'arcade',
    maxPlayers: 2,
    color: 'from-teal-600/30 via-emerald-800/20 to-teal-950/50 border-teal-500/40',
    accentColor: 'text-teal-300',
    descFa: 'بیلیارد واقعی با موتور فیزیک، زاویه‌بندی و پاکت کردن توپ‌ها.',
    descEn: 'Realistic 8-ball pool with cue physics and pocket angles.',
    levelFa: 'اکشن 🎱',
    levelEn: 'Action 🎱',
    path: '/games/billiards'
  },
  {
    id: 'cosmic_chess',
    titleFa: 'شطرنج کیهانی',
    titleEn: 'Cosmic Chess',
    icon: '♟️',
    category: 'board',
    maxPlayers: 2,
    color: 'from-indigo-600/30 via-blue-800/20 to-indigo-950/50 border-indigo-500/40',
    accentColor: 'text-indigo-300',
    descFa: 'شطرنج کامل همراه با هوش مصنوعی و بازی دونفره در یک دستگاه.',
    descEn: 'Full chess with smart AI and local pass & play on same device.',
    levelFa: 'استراتژیک ♟️',
    levelEn: 'Grandmaster ♟️',
    path: '/games/cosmic-chess'
  },
  {
    id: 'tic_tac_toe',
    titleFa: 'دوز نئونی (X-O)',
    titleEn: 'Neon Tic-Tac-Toe',
    icon: '⭕',
    category: 'board',
    maxPlayers: 2,
    color: 'from-emerald-600/20 via-teal-900/30 to-slate-950/50 border-emerald-500/40',
    accentColor: 'text-emerald-300',
    descFa: 'بازی کلاسیک دوز با گرافیک سایبرپانک و حریف هوشمند.',
    descEn: 'Classic X-O duel with cyberpunk neon glow and AI.',
    levelFa: 'ساده 🟢',
    levelEn: 'Casual 🟢',
    path: '/games/tic-tac-toe'
  },
  {
    id: 'cosmic_pong',
    titleFa: 'پونگ کیهانی',
    titleEn: 'Cosmic Pong',
    icon: '🏓',
    category: 'arcade',
    maxPlayers: 2,
    color: 'from-sky-600/20 via-blue-900/30 to-slate-950/50 border-sky-500/40',
    accentColor: 'text-sky-300',
    descFa: 'پونگ دونفره رقابتی با کنترل لمسی و کیبورد.',
    descEn: 'Competitive 2-Player Pong with touch and keyboard controls.',
    levelFa: 'دونفره 🏓',
    levelEn: '2-Player 🏓',
    path: '/games/cosmic-pong'
  },
  {
    id: 'cyber_2048',
    titleFa: '۲۰۴۸ سایبری',
    titleEn: 'Cyber 2048',
    icon: '🔢',
    category: 'puzzle',
    maxPlayers: 1,
    color: 'from-cyan-600/20 via-blue-900/30 to-slate-950/50 border-cyan-500/40',
    accentColor: 'text-cyan-300',
    descFa: 'پازل ریاضی و استراتژیک با کاشی‌های نئونی.',
    descEn: 'Mathematical tile merger puzzle with glowing neon blocks.',
    levelFa: 'رکوردی 🔴',
    levelEn: 'High Score 🔴',
    path: '/games/2048'
  },
  {
    id: 'neon_snake',
    titleFa: 'مار سایبری (Snake)',
    titleEn: 'Neon Snake',
    icon: '🐍',
    category: 'arcade',
    maxPlayers: 1,
    color: 'from-purple-600/20 via-fuchsia-900/30 to-slate-950/50 border-purple-500/40',
    accentColor: 'text-purple-300',
    descFa: 'مار کلاسیک با جلوه‌های نئونی و ثبت رکورد.',
    descEn: 'Classic arcade snake with neon particle effects and high scores.',
    levelFa: 'آرکید 🐍',
    levelEn: 'Arcade 🐍',
    path: '/games/neon-snake'
  },
  {
    id: 'space_defender',
    titleFa: 'مدافع فضا',
    titleEn: 'Space Defender',
    icon: '🚀',
    category: 'arcade',
    maxPlayers: 1,
    color: 'from-rose-600/20 via-red-900/30 to-slate-950/50 border-rose-500/40',
    accentColor: 'text-rose-300',
    descFa: 'کنترل سفینه و نابودی سنگ‌های آسمانی در کهکشان.',
    descEn: 'Pilot your starship and vaporize incoming asteroids in deep galaxy.',
    levelFa: 'اکشن 🚀',
    levelEn: 'Action 🚀',
    path: '/games/space-defender'
  },
  {
    id: 'reaction_speed',
    titleFa: 'سرعت واکنش',
    titleEn: 'Reaction Speed',
    icon: '⚡',
    category: 'puzzle',
    maxPlayers: 1,
    color: 'from-amber-600/20 via-orange-900/30 to-slate-950/50 border-amber-500/40',
    accentColor: 'text-amber-300',
    descFa: 'سنجش میلی‌ثانیه‌ای سرعت رفلکس و عکس‌العمل عصبی.',
    descEn: 'Millisecond-precision reflex test for brain cognitive agility.',
    levelFa: 'واکنش ⚡',
    levelEn: 'Reflex ⚡',
    path: '/games/reaction-speed'
  },
  {
    id: 'wordle_persian',
    titleFa: 'حدس کلمه فارسی',
    titleEn: 'Persian Wordle',
    icon: '🔤',
    category: 'puzzle',
    maxPlayers: 1,
    color: 'from-yellow-600/20 via-amber-900/30 to-slate-950/50 border-yellow-500/40',
    accentColor: 'text-yellow-300',
    descFa: 'کلمه ۵ حرفی پنهان را در ۶ تلاش حدس بزن.',
    descEn: 'Guess the hidden 5-letter word within 6 smart attempts.',
    levelFa: 'کلمات 🔤',
    levelEn: 'Word Puzzle 🔤',
    path: '/games/wordle'
  },
  {
    id: 'memory_matrix',
    titleFa: 'ماتریس حافظه',
    titleEn: 'Memory Matrix',
    icon: '🧠',
    category: 'puzzle',
    maxPlayers: 1,
    color: 'from-fuchsia-600/20 via-purple-900/30 to-slate-950/50 border-fuchsia-500/40',
    accentColor: 'text-fuchsia-300',
    descFa: 'تقویت حافظه فعال و تمرکز ذهن با کشف جفت کارت‌ها.',
    descEn: 'Card pairing challenge to boost working memory and focus.',
    levelFa: 'حافظه 🧠',
    levelEn: 'Memory 🧠',
    path: '/games/memory-matrix'
  }
];

export const MULTIPLAYER_IDS = [
  'hokm', 'backgammon', 'ludo', 'snakes', 'connect_four', 'dots_and_boxes',
  'air_hockey', 'battleship', 'soccer', 'ocho', 'golf', 'pasur', 'billiards',
  'cosmic_chess', 'tic_tac_toe', 'cosmic_pong'
];

export const CATEGORIES = [
  { id: 'all', labelFa: 'همه بازی‌ها', labelEn: 'All Games', icon: '🎮' },
  { id: 'board', labelFa: 'شاهانه و تخته', labelEn: 'Board & Classic', icon: '🎲' },
  { id: 'arcade', labelFa: 'آرکید و اکشن', labelEn: 'Arcade & Action', icon: '🕹️' },
  { id: 'puzzle', labelFa: 'فکری و پازل', labelEn: 'Brain & Puzzle', icon: '🧩' }
];

// Helper to safely render Avatar
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
function LiveRoomCard({ room, onJoin, isRtl }) {
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
              <h4 className="text-sm font-black text-white truncate">
                {isRtl ? (game?.titleFa || room.gameType) : (game?.titleEn || room.gameType)}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isWaiting && !isFull
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              }`}>
                {isWaiting && !isFull 
                  ? (isRtl ? 'در انتظار حریف' : 'Waiting') 
                  : isFull 
                  ? (isRtl ? 'تکمیل شد' : 'Full') 
                  : (isRtl ? 'در جریان' : 'In Progress')}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <SafeAvatar avatar={room.hostAvatar} size="w-4 h-4 text-[10px]" />
                <span className="truncate max-w-[100px] text-slate-300 font-bold">{room.hostName || (isRtl ? 'کاربر' : 'Player')}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-bold text-purple-300">
                <Users size={11} /> {room.currentPlayers}/{room.maxPlayers} {isRtl ? 'نفر' : 'Players'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock size={11} /> {timeAgo < 1 ? (isRtl ? 'همین الان' : 'Just now') : (isRtl ? `${timeAgo} دقیقه` : `${timeAgo}m ago`)}
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
          <span>{isRtl ? 'پیوستن' : 'Join'}</span>
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

// Create Online Game Modal (Platô Match) - FIXED Stacking, Occlusion & Contrast
function CreateRoomModal({ isOpen, onClose, onCreated, userName, userAvatar, isRtl }) {
  const [selectedGame, setSelectedGame] = useState(GAME_DEFS[0]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const multiplayerGames = GAME_DEFS.filter(g => MULTIPLAYER_IDS.includes(g.id));

  const handleCreate = async () => {
    if (!selectedGame) return;
    setCreating(true);
    const roomId = selectedGame.id.toUpperCase().slice(0, 4) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const room = await gameRoomsService.publishRoom({
      roomId,
      gameType: selectedGame.id,
      gameTitleFa: selectedGame.titleFa,
      gameTitleEn: selectedGame.titleEn,
      hostId: localStorage.getItem('life_os_user_id') || 'u_' + Date.now(),
      hostName: (userName && userName.length < 25 && !userName.startsWith('data:image/')) ? userName : (isRtl ? 'کاربر زنوسلایف' : 'ZenOsLife Player'),
      hostAvatar: userAvatar || '🎮',
      maxPlayers: selectedGame.maxPlayers,
      isPrivate
    });
    setCreating(false);
    setCreatedRoom({ room, game: selectedGame });
  };

  const handleEnterRoom = () => {
    if (createdRoom) {
      onCreated(createdRoom.room, createdRoom.game);
      setCreatedRoom(null);
      onClose();
    }
  };

  const handleClose = () => {
    setCreatedRoom(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-slate-900 border-2 border-purple-500/40 p-5 shadow-2xl space-y-4 text-start overflow-y-auto pb-6"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus size={20} className="text-purple-400" />
                <span>{isRtl ? 'ساخت بازی آنلاین جدید (Platô Match)' : 'Create New Online Match (Platô Match)'}</span>
              </h3>
              <button 
                onClick={handleClose} 
                className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white transition-colors"
                title={isRtl ? 'بستن' : 'Close'}
              >
                <X size={16} />
              </button>
            </div>

            {!createdRoom ? (
              <>
                {/* Game Selection Grid */}
                <div>
                  <p className="text-xs text-slate-200 font-bold mb-2.5">
                    {isRtl ? 'انتخاب نوع بازی:' : 'Select Game Type:'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {multiplayerGames.map(g => {
                      const isSelected = selectedGame?.id === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => { setSelectedGame(g); soundEngine.playTap?.(); }}
                          className={`p-3 rounded-2xl border text-start flex items-center gap-2.5 transition-all active:scale-95 ${
                            isSelected
                              ? 'border-purple-400 bg-purple-500/30 text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/50'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-purple-500/40 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-2xl shrink-0">{g.icon}</span>
                          <div className="min-w-0">
                            <span className={`text-xs font-black block truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                              {isRtl ? g.titleFa : g.titleEn}
                            </span>
                            <span className={`text-[10px] font-bold block ${isSelected ? 'text-purple-200 font-black' : 'text-slate-400'}`}>
                              {isRtl ? `${g.maxPlayers} نفره` : `${g.maxPlayers} Players`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy Toggle (High Contrast) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 border border-white/15">
                  <div className="flex items-center gap-2.5">
                    {isPrivate ? <Lock size={18} className="text-amber-400 shrink-0" /> : <Unlock size={18} className="text-emerald-400 shrink-0" />}
                    <div>
                      <p className="text-xs font-black text-white">
                        {isPrivate ? (isRtl ? 'اتاق خصوصی' : 'Private Room') : (isRtl ? 'اتاق عمومی لابی' : 'Public Lobby Room')}
                      </p>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {isPrivate 
                          ? (isRtl ? 'ورود فقط با ارسال لینک اختصاصی اتاق' : 'Join via private room link only') 
                          : (isRtl ? 'نمایش در لیست بازی‌های زنده برای همه کاربران' : 'Visible in live games lobby for everyone')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${isPrivate ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      isPrivate ? (isRtl ? 'right-7' : 'left-7') : (isRtl ? 'right-1' : 'left-1')
                    }`} />
                  </button>
                </div>

                {/* Action Submit Button - Fully Visible & Accessible */}
                <button
                  onClick={handleCreate}
                  disabled={!selectedGame || creating}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white font-black text-sm shadow-xl shadow-purple-500/30 disabled:opacity-40 active:scale-95 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {creating ? (
                    <><RotateCcw size={16} className="animate-spin" /> {isRtl ? 'در حال ایجاد اتاق و اتصال به سرور...' : 'Creating room & connecting...'}</>
                  ) : (
                    <><Play size={16} /> {isRtl ? 'ایجاد اتاق و ورود به مسابقه' : 'Create Room & Enter Match'}</>
                  )}
                </button>
              </>
            ) : (
              <div className="py-6 space-y-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                  <Play size={40} className="ml-2" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{isRtl ? 'اتاق با موفقیت ساخته شد!' : 'Room Created Successfully!'}</h3>
                  <p className="text-sm text-slate-300 mt-2 font-mono bg-black/40 px-3 py-1.5 rounded-xl inline-block border border-white/10">{createdRoom.room.roomId}</p>
                </div>
                
                <div className="space-y-2.5 pt-2">
                  {/* Primary 1-Click Telegram Direct Send & Auto-Enter */}
                  <button
                    onClick={() => {
                      const roomCode = createdRoom.room.roomId;
                      const gameType = createdRoom.game?.id || 'backgammon';
                      const gameTitle = createdRoom.game?.titleFa || 'تخته نرد';
                      shareToTelegram({ roomCode, gameType, gameTitleFa: gameTitle });
                      handleEnterRoom();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-sky-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 size={18} />
                    {isRtl ? '🚀 ارسال به چت دوستان و شروع بازی' : '🚀 Send to Friend & Start Game'}
                  </button>

                  {/* Inline Interactive Challenge Card */}
                  <button
                    onClick={() => {
                      const roomCode = createdRoom.room.roomId;
                      shareViaInlineQuery({ roomCode });
                      handleEnterRoom();
                    }}
                    className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-sky-300 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 border border-sky-400/20 cursor-pointer"
                  >
                    <Sparkles size={15} className="text-amber-400" />
                    {isRtl ? '✨ ارسال کارت رسمی مسابقه در تلگرام' : '✨ Send Interactive Match Card'}
                  </button>

                  {/* Copy Link & Direct Enter */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        const roomCode = createdRoom.room.roomId;
                        const link = `https://t.me/chazha_bot?start=room_${roomCode}`;
                        navigator.clipboard?.writeText(link);
                        soundEngine.playCheckmark?.();
                        haptics.success?.();
                        alert(isRtl ? 'لینک مستقیم اتاق کپی شد!' : 'Direct room link copied!');
                      }}
                      className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                    >
                      <Copy size={15} />
                      {isRtl ? 'کپی لینک' : 'Copy Link'}
                    </button>

                    <button
                      onClick={handleEnterRoom}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs shadow-xl shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play size={15} />
                      {isRtl ? 'ورود به بازی' : 'Enter Room'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Game Mode Selector & Matchmaking Modal
function GameModeModal({ isOpen, onClose, game, onSelectMode, isRtl }) {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);
  const [showWager, setShowWager] = useState(false);
  const [selectedWager, setSelectedWager] = useState(50);
  const { coins, spendCoins } = useAppStore();

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
    }, 2500);
  };

  const handleWagerStart = () => {
    if (coins >= selectedWager) {
      spendCoins(selectedWager, 'vip_wager_fee');
      soundEngine.playDiceRoll?.();
      onSelectMode('wager', selectedWager);
      onClose();
    } else {
      alert(isRtl ? 'سکه کافی ندارید!' : 'Not enough coins!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4" onClick={onClose} dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a0c2e] via-[#12071f] to-[#0a0312] border-2 border-purple-500/40 p-6 text-center shadow-2xl space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-start">
              <span className="text-3xl">{game.icon}</span>
              <div>
                <h3 className="text-base font-black text-white">{isRtl ? game.titleFa : game.titleEn}</h3>
                <span className="text-[10px] text-purple-300 font-bold">
                  {isRtl ? `${game.maxPlayers} نفره • ${game.levelFa}` : `${game.maxPlayers} Players • ${game.levelEn}`}
                </span>
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
                <h4 className="text-sm font-black text-white animate-pulse">
                  {isRtl ? 'در حال جستجوی بازیکن آنلاین...' : 'Searching for online opponent...'}
                </h4>
                <p className="text-xs text-purple-300 mt-1">
                  {isRtl ? `زمان جستجو: ${searchTimer} ثانیه` : `Searching time: ${searchTimer}s`}
                </p>
              </div>
              <button
                onClick={() => setIsSearching(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-slate-300 hover:text-white"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
            </div>
          ) : showWager ? (
            <div className="py-2 space-y-4">
               <h4 className="text-sm font-black text-white">
                 {isRtl ? 'شرطی VIP - انتخاب مبلغ سکه' : 'VIP Wager - Select Coin Amount'}
               </h4>
               <p className="text-xs text-amber-300 font-bold">
                 {isRtl ? 'موجودی شما:' : 'Your Balance:'} {coins?.toLocaleString() || 0} 🪙
               </p>
               <div className="grid grid-cols-2 gap-2">
                 {[50, 100, 500, 1000].map(amt => (
                   <button
                     key={amt}
                     onClick={() => setSelectedWager(amt)}
                     className={`p-3 rounded-xl border-2 font-black transition-all ${
                       selectedWager === amt 
                        ? 'border-amber-400 bg-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                        : 'border-white/10 bg-white/5 text-slate-300'
                     }`}
                   >
                     {amt} 🪙
                   </button>
                 ))}
               </div>
               <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                 <p className="text-xs text-amber-300">
                   {isRtl ? `در صورت برد، ${(selectedWager * 2).toLocaleString()} سکه دریافت می‌کنید!` : `Win to get ${(selectedWager * 2).toLocaleString()} coins!`}
                 </p>
               </div>
               <div className="flex gap-2 pt-2">
                 <button onClick={() => setShowWager(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold">
                   {isRtl ? 'بازگشت' : 'Back'}
                 </button>
                 <button 
                   onClick={handleWagerStart}
                   disabled={coins < selectedWager}
                   className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 text-sm font-black disabled:opacity-50"
                 >
                   {isRtl ? 'شروع بازی' : 'Start Game'}
                 </button>
               </div>
            </div>
          ) : (
            /* Mode Options */
            <div className="space-y-2.5 pt-1">
              {/* Option 1: Play vs AI Bot */}
              <button
                onClick={() => { onSelectMode('bot'); onClose(); }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-950/80 border border-purple-500/40 hover:border-purple-400 text-start flex items-center justify-between group active:scale-95 transition-all shadow-lg shadow-purple-950/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl text-purple-300 group-hover:scale-110 transition-transform">
                    🤖
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-purple-300">
                      {isRtl ? 'بازی با ربات هوشمند' : 'Play vs Smart AI Bot'}
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {isRtl ? 'آفلاین، سریع و بدون معطلی با هوش مصنوعی' : 'Instant offline match against smart AI'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-purple-400 ${isRtl ? '' : 'rotate-180'}`} />
              </button>

              {/* Option 2: Live Online Matchmaking */}
              <button
                onClick={handleStartOnlineSearch}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-pink-900/60 to-purple-950/80 border border-pink-500/40 hover:border-pink-400 text-start flex items-center justify-between group active:scale-95 transition-all shadow-lg shadow-pink-950/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-pink-600/30 border border-pink-400/40 flex items-center justify-center text-xl text-pink-300 group-hover:scale-110 transition-transform">
                    👥
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-pink-300">
                      {isRtl ? 'جستجوی حریف آنلاین' : 'Find Online Opponent'}
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {isRtl ? 'اتصال زنده به بازیکنان حاضر در ربات' : 'Real-time live matchmaking with players'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-pink-400 ${isRtl ? '' : 'rotate-180'}`} />
              </button>
              
              {/* Option 3: VIP Wager Mode */}
              <button
                onClick={() => setShowWager(true)}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-900/60 to-orange-950/80 border border-amber-500/40 hover:border-amber-400 text-start flex items-center justify-between group active:scale-95 transition-all shadow-lg shadow-amber-950/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-xl text-amber-300 group-hover:scale-110 transition-transform">
                    💎
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-amber-300">
                      {isRtl ? 'شرطی VIP' : 'VIP Wager Mode'}
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {isRtl ? 'بازی با شرط سکه (جایزه ۲ برابر برای برنده)' : 'Bet coins and win 2x back!'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-amber-400 ${isRtl ? '' : 'rotate-180'}`} />
              </button>

              {/* Option 4: Fast Telegram Challenge */}
              <button
                onClick={() => {
                  onClose();
                  const prefix = game.id === 'backgammon' ? 'BACK-' : game.id === 'hokm' ? 'HOKM-' : `${game.id.slice(0, 4).toUpperCase()}-`;
                  const randomCode = prefix + Math.random().toString(36).substring(2, 6).toUpperCase();
                  shareToTelegram({ roomCode: randomCode, gameType: game.id, gameTitleFa: game.titleFa });
                  navigate(`${game.path}?mode=online&room=${randomCode}&role=white`);
                }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-sky-900/60 to-blue-950/80 border border-sky-500/40 hover:border-sky-400 text-start flex items-center justify-between group active:scale-95 transition-all shadow-lg shadow-sky-950/40 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-sky-600/30 border border-sky-400/40 flex items-center justify-center text-xl text-sky-300 group-hover:scale-110 transition-transform">
                    🚀
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-sky-300">
                      {isRtl ? 'دعوت دوستان در تلگرام' : 'Challenge Friends in Telegram'}
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {isRtl ? 'ارسال دعوت به چت دوستان و ورود مستقیم به اتاق' : 'Send invite to any Telegram chat and enter room'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-sky-400 ${isRtl ? '' : 'rotate-180'}`} />
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
  const { coins, isVip, language, spendCoins } = useAppStore();
  const isRtl = language === 'fa';
  const { userName, userAvatar } = useMultiplayerStore();

  const [theme, setTheme] = useState('dark');
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
    : (isRtl ? 'کاربر زنوسلایف' : 'ZenOsLife Player');

  return (
    <div className={`w-full min-h-screen pb-32 select-none relative overflow-x-hidden font-sans ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#050711] text-white'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Cosmic Glow Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-10 left-1/4 w-[450px] h-[450px] rounded-full bg-purple-600 blur-[130px]" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] rounded-full bg-pink-600 blur-[120px]" />
        <div className="absolute bottom-20 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-600 blur-[110px]" />
      </div>

      <div className="relative z-10 px-3 sm:px-4 pt-4 max-w-2xl mx-auto space-y-4">
        
        {/* Top Control Bar */}
        <div className={`flex items-center justify-between p-3 rounded-3xl border shadow-xl transition-colors ${theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/80 border-white/10 backdrop-blur-xl'}`}>
          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 min-w-0">
            <SafeAvatar avatar={userAvatar} size="w-10 h-10 text-lg" ringColor="border-amber-400/60" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={`text-xs font-black truncate ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{cleanUserName}</h3>
                {isVip && <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/40">VIP 👑</span>}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-500 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>{isRtl ? 'آنلاین در آرکید' : 'Online in Arcade'}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-2xl border text-xs font-black shadow-sm active:scale-95 transition-all ${theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 border-white/20 text-slate-200'}`}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Tournaments */}
            <button
              onClick={() => { setShowTournamentsModal(true); soundEngine.playTap?.(); }}
              className={`p-2 px-2.5 rounded-2xl border text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all ${theme === 'light' ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-amber-500/15 border-amber-400/40 text-amber-300 hover:bg-amber-500/25'}`}
              title={isRtl ? 'جام قهرمانان و تورنمنت‌ها' : 'Tournaments'}
            >
              <Trophy size={14} className={theme === 'light' ? 'text-amber-600' : 'text-yellow-400'} />
              <span className="hidden xs:inline">{isRtl ? 'تورنمنت' : 'Tourneys'}</span>
            </button>

            {/* Coin Shop Balance */}
            <button
              onClick={() => { setShowShopModal(true); soundEngine.playTap?.(); }}
              className="p-2 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-lg shadow-yellow-500/25 hover:brightness-110 active:scale-95 transition-all"
              title={isRtl ? 'خرید سکه و ستاره تلگرام' : 'Coin Shop'}
            >
              <Coins size={14} />
              <span>{(coins || 0).toLocaleString()}</span>
            </button>
          </div>
        </div>

        {/* Platô-style Telegram Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col gap-1 text-center sm:text-start">
            <div className="text-xl font-black flex items-center justify-center sm:justify-start gap-2">
              <span className="text-2xl">🎮</span> {isRtl ? 'بازی در تلگرام' : 'Play on Telegram'}
            </div>
            <p className="text-xs text-white/90 font-medium">
              {isRtl ? 'مثل پلاتو، مستقیم در تلگرام بازی کن و با دوستانت رقابت کن!' : 'Like Platô, play directly in Telegram with friends!'}
            </p>
          </div>
          <button 
            onClick={() => {
              const tg = window.Telegram?.WebApp;
              if (tg?.openTelegramLink) {
                tg.openTelegramLink('https://t.me/chazha_bot');
              } else {
                window.open('https://t.me/chazha_bot', '_blank');
              }
            }}
            className="relative z-10 px-5 py-2.5 bg-white text-purple-700 font-black text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap mx-auto sm:mx-0 cursor-pointer"
          >
            {isRtl ? 'باز کردن ربات چاژا' : 'Open Chazha Bot'} <ChevronLeft size={16} className={isRtl ? '' : 'rotate-180'} />
          </button>
        </div>

        {/* Hero Featured Banner (Hokm & Tournaments) */}
        <div className="relative p-5 rounded-3xl bg-gradient-to-r from-amber-900/40 via-purple-950/60 to-slate-900 border border-amber-500/40 overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black flex items-center gap-1">
                <Crown size={11} /> {isRtl ? 'ویژه شاهانه' : 'Featured Royal'}
              </span>
              <span className="text-[10px] text-slate-300 font-bold">{isRtl ? 'جوایز میلیونی سکه 🪙' : 'Big Coin Prizes 🪙'}</span>
            </div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-pink-300">
              {isRtl ? 'جام مسابقات حکم ۴ نفره و تخته‌نرد' : 'Royal Hokm & Backgammon Tournaments'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isRtl 
                ? 'با دوستان و حریفان آنلاین در سراسر ایران رقابت کنید، شرط ببندید و پاداش‌های شگفت‌انگیز ببرید!' 
                : 'Compete with online players, challenge friends, place bets, and win glorious coin rewards!'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => navigate('/games/hokm')}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs active:scale-95 shadow-md flex items-center gap-1"
              >
                <Crown size={13} /> {isRtl ? 'بازی حکم ۴ نفره' : 'Play 4-Player Hokm'}
              </button>
              <button
                onClick={() => setShowTournamentsModal(true)}
                className="px-4 py-2 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 active:scale-95"
              >
                {isRtl ? 'مشاهده تورنمنت‌ها 🏆' : 'View Tournaments 🏆'}
              </button>
            </div>
          </div>
        </div>

        {/* Plato Gaming Lounge Hero Banner */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            soundEngine.playTap?.();
            haptics.impact?.('medium');
            navigate('/games/lounge');
          }}
          className="relative overflow-hidden rounded-3xl p-4 sm:p-5 cursor-pointer border-2 border-amber-500/50 bg-gradient-to-r from-[#1f1006] via-[#2d1b0d] to-[#120803] shadow-2xl shadow-amber-950/60 transition-all group"
        >
          {/* Animated golden aura */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/30 transition-all" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 shrink-0 border border-amber-300">
                🎪
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-base sm:text-lg font-black text-amber-300 truncate">
                    {isRtl ? 'سالن بزرگ بازی‌ها و گپ‌وگفت چاژا' : 'Chazha Games Lounge'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black shrink-0 animate-pulse">
                    {isRtl ? 'آنلاین مشابه پلاتو ⚡' : 'Plato Live ⚡'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {isRtl 
                    ? 'مشاهده بازیکنان آنلاین، اتاق‌های باز، چت همگانی، دوئل مستقیم و تورنمنت‌ها' 
                    : 'Browse open rooms, online players, global chat, direct duels and weekly cups'}
                </p>
              </div>
            </div>

            <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 shrink-0 group-hover:from-amber-400 group-hover:to-yellow-300 transition-all">
              <span>{isRtl ? 'ورود به سالن' : 'Enter Lounge'}</span>
              <ChevronLeft size={16} className={isRtl ? '' : 'rotate-180'} />
            </div>
          </div>
        </motion.div>

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
            <span>{isRtl ? 'اتاق‌های زنده آنلاین' : 'Live Online Rooms'}</span>
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
            <span>{isRtl ? `تمام بازی‌ها (${GAME_DEFS.length})` : `All Games (${GAME_DEFS.length})`}</span>
          </button>
        </div>

        {/* Tab 1: Live Online Rooms */}
        {activeTab === 'live' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">
                  {liveRooms.length > 0 
                    ? (isRtl ? `${liveRooms.length} اتاق بازی آنلاین در حال حاضر فعال است` : `${liveRooms.length} online game rooms active`)
                    : (isRtl ? 'در انتظار ساخت اتاق جدید' : 'Waiting for new rooms')}
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-black text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus size={14} /> {isRtl ? 'ساخت اتاق' : 'Create Room'}
              </button>
            </div>

            {liveRooms.length === 0 ? (
              <div className="text-center py-14 p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
                <div className="text-6xl animate-bounce">🎮</div>
                <div>
                  <h4 className="text-base font-black text-white">
                    {isRtl ? 'اتاق بازی فعالی در جریان نیست' : 'No active game rooms right now'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRtl 
                      ? 'اولین نفری باشید که اتاق می‌سازد و دوستانتان را به مسابقه دعوت می‌کند!' 
                      : 'Be the first to create a room and challenge your friends!'}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white text-xs font-black shadow-xl shadow-purple-500/30 active:scale-95"
                >
                  {isRtl ? '+ ساخت اولین اتاق بازی' : '+ Create First Game Room'}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {liveRooms.map(room => (
                  <LiveRoomCard key={room.roomId} room={room} onJoin={handleJoinRoom} isRtl={isRtl} />
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
                  <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
                </button>
              ))}
              <button
                onClick={() => { setActiveCategory('history'); soundEngine.playTap?.(); }}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all border shrink-0 ${
                  activeCategory === 'history'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-lg shadow-purple-500/25'
                    : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>📜</span>
                <span>{isRtl ? 'سابقه بازی‌ها' : 'My History'}</span>
              </button>
            </div>

            {/* Games 2-Column Grid or History Panel */}
            {activeCategory === 'history' ? (
              <div className="rounded-3xl bg-slate-900/80 border border-white/10 overflow-hidden">
                <GameHistoryPanel />
              </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredGames.map(game => {
                const liveCount = Math.floor(Math.random() * 99) + 1;
                return (
                <motion.div
                  key={game.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleGameClick(game)}
                  className={`p-4 rounded-3xl cursor-pointer border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-gradient-to-br ' + game.color} backdrop-blur-xl flex flex-col justify-between space-y-3 shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden`}
                >
                  {/* Live Player Count Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md z-10">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    {liveCount}
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-start justify-between">
                      <span className={`text-4xl p-2 rounded-2xl ${theme === 'light' ? 'bg-slate-100 border-slate-200 shadow-sm' : 'bg-black/40 border-white/10 shadow-inner'} group-hover:scale-110 transition-transform`}>
                        {game.icon}
                      </span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-black/40 text-slate-200 border-white/10'}`}>
                        {isRtl ? game.levelFa : game.levelEn}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-sm font-black transition-colors ${theme === 'light' ? 'text-slate-900 group-hover:text-purple-600' : 'text-white group-hover:' + game.accentColor}`}>
                        {isRtl ? game.titleFa : game.titleEn}
                      </h3>
                      <p className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-300/80'}`}>
                        {isRtl ? game.descFa : game.descEn}
                      </p>
                    </div>
                  </div>

                  {/* Game Plan Badges (4 pills) */}
                  <div className="grid grid-cols-2 gap-1 mt-2 z-10 relative">
                    <span className={`text-[8px] font-bold px-1.5 py-1 rounded-md text-center flex items-center justify-center gap-1 ${theme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-slate-300'}`}>🤖 {isRtl ? 'رایگان با ربات' : 'Free AI'}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-1 rounded-md text-center flex items-center justify-center gap-1 ${theme === 'light' ? 'bg-blue-50 text-blue-700' : 'bg-blue-500/10 text-blue-300'}`}>👥 {isRtl ? 'دوستانه رایگان' : 'Free 2P'}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-1 rounded-md text-center flex items-center justify-center gap-1 ${theme === 'light' ? 'bg-amber-50 text-amber-700' : 'bg-amber-500/10 text-amber-300'}`}>🏆 {isRtl ? 'رقابتی (+سکه)' : 'Ranked'}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-1 rounded-md text-center flex items-center justify-center gap-1 ${theme === 'light' ? 'bg-purple-50 text-purple-700' : 'bg-purple-500/10 text-purple-300'}`}>💎 {isRtl ? 'شرطی VIP' : 'VIP Wager'}</span>
                  </div>

                  <div className={`flex items-center justify-between pt-2 border-t text-[10px] z-10 relative ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}>
                    <span className={`font-bold flex items-center gap-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Users size={10} /> {game.maxPlayers > 1 ? (isRtl ? `${game.maxPlayers} نفره` : `${game.maxPlayers} Players`) : (isRtl ? 'تک‌نفره' : 'Solo')}
                    </span>
                    {MULTIPLAYER_IDS.includes(game.id) && (
                      <span className="text-emerald-500 font-black flex items-center gap-1">
                        <Globe size={10} /> {isRtl ? 'آنلاین' : 'Online'}
                      </span>
                    )}
                  </div>
                </motion.div>
              )})}
            </div>
            )}
          </div>
        )}

      </div>

      {/* Floating Action Buttons: Quick Match & Create Online Match */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 max-w-[95vw]">
        {/* Quick Match Randomizer */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            const quickGames = ['backgammon', 'ludo', 'hokm', 'snakes', 'connect-four'];
            const chosen = quickGames[Math.floor(Math.random() * quickGames.length)];
            soundEngine.playDiceRoll?.();
            haptics.impact?.('heavy');
            navigate(`/games/${chosen}?mode=bot`);
          }}
          className="flex items-center gap-1.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-2xl active:scale-95 transition-all border border-amber-300 cursor-pointer whitespace-nowrap"
          style={{ boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)' }}
          title={isRtl ? 'ورود تصادفی و سریع به یک بازی' : 'Instant random game'}
        >
          <Zap size={16} className="shrink-0 animate-bounce" />
          <span>{isRtl ? 'بازی سریع ⚡' : 'Quick Match ⚡'}</span>
        </motion.button>

        {/* Create Online Game */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => { setShowCreateModal(true); soundEngine.playTap?.(); haptics.tap?.(); }}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white font-black text-xs shadow-2xl shadow-purple-500/50 active:scale-95 transition-all border border-purple-400/50 cursor-pointer whitespace-nowrap"
          style={{ boxShadow: '0 0 35px rgba(217, 70, 239, 0.45)' }}
        >
          <Plus size={16} />
          <span>{isRtl ? 'ساخت بازی آنلاین' : 'Create Match'}</span>
        </motion.button>
      </div>

      {/* Game Mode Selector Modal */}
      <GameModeModal
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        game={selectedGameForMode}
        onSelectMode={handleModeSelected}
        isRtl={isRtl}
      />

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleRoomCreated}
        userName={cleanUserName}
        userAvatar={userAvatar}
        isRtl={isRtl}
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
