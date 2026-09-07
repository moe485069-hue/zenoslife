import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Gamepad2, Users, Trophy, Plus, Globe, Play,
  Lock, Unlock, Radio, Clock, RotateCcw, X,
  Crown, Sparkles, Swords, Zap, ChevronLeft, ChevronRight,
  Flame, Target, Layers, Brain, Coins, Gift, Sun, Moon, Share2, Copy, Send,
  Search, MessageSquare, ArrowRight, CornerDownLeft
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useMultiplayerStore from '../store/multiplayerStore';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import gameRoomsService from '../services/gameRoomsService';
import { shareToTelegram, shareViaInlineQuery } from '../utils/telegram';
import CoinShopModal from '../components/shop/CoinShopModal';
import ChazhaStoreModal from '../components/games/ChazhaStoreModal';
import OpponentProfileModal from '../components/games/OpponentProfileModal';
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
    id: 'snooker',
    titleFa: 'اسنوکر شاهانه سه‌بعدی',
    titleEn: 'Royal Snooker 3D',
    icon: '🎱',
    category: 'arcade',
    maxPlayers: 2,
    color: 'from-emerald-600/30 via-teal-800/25 to-slate-950/60 border-emerald-500/50',
    accentColor: 'text-emerald-300',
    descFa: 'اسنوکر حرفه‌ای با قوانین رسمی (۱۵ قرمز + ۶ رنگی)، فیزیک واقعی، بریک ۱۴۷ و چوب‌های سفارشی.',
    descEn: 'Official rules snooker with 15 reds + 6 colours, realistic physics, 147 breaks and custom cues.',
    levelFa: 'حرفه‌ای 🎱',
    levelEn: 'Championship 🎱',
    featured: true,
    path: '/games/snooker'
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

export const SEED_ACTIVE_ROOMS = [
  {
    roomId: 'HOKM-9102',
    gameType: 'hokm',
    gameTitleFa: 'حکم ۴ نفره شاهانه',
    gameTitleEn: 'Royal Hokm',
    hostName: 'سلطان_پاسور',
    hostAvatar: '👑',
    currentPlayers: 3,
    maxPlayers: 4,
    bet: 500,
    status: 'waiting',
    createdAt: Date.now() - 35000
  },
  {
    roomId: 'BACK-7721',
    gameType: 'backgammon',
    gameTitleFa: 'تخته نرد کلاسیک',
    gameTitleEn: 'Classic Backgammon',
    hostName: 'آرشام_تاس‌باز',
    hostAvatar: '🦁',
    currentPlayers: 1,
    maxPlayers: 2,
    bet: 200,
    status: 'waiting',
    createdAt: Date.now() - 75000
  },
  {
    roomId: 'LUDO-5541',
    gameType: 'ludo',
    gameTitleFa: 'منچ دورهمی شاد',
    gameTitleEn: 'Ludo Party',
    hostName: 'شایان_تاس‌طلا',
    hostAvatar: '🦊',
    currentPlayers: 2,
    maxPlayers: 4,
    bet: 100,
    status: 'waiting',
    createdAt: Date.now() - 110000
  },
  {
    roomId: 'PASS-3319',
    gameType: 'pasur',
    gameTitleFa: 'پاسور چهاربرگ',
    gameTitleEn: 'Persian Pasur',
    hostName: 'نگین_تک‌خال',
    hostAvatar: '💎',
    currentPlayers: 1,
    maxPlayers: 2,
    bet: 250,
    status: 'waiting',
    createdAt: Date.now() - 150000
  },
  {
    roomId: 'AIRH-2048',
    gameType: 'air_hockey',
    gameTitleFa: 'ایر هاکی نئونی',
    gameTitleEn: 'Neon Air Hockey',
    hostName: 'سام_سرعتی',
    hostAvatar: '⚡',
    currentPlayers: 1,
    maxPlayers: 2,
    bet: 150,
    status: 'waiting',
    createdAt: Date.now() - 190000
  }
];

export const QUICK_CHAT_PHRASES = [
  '🎲 کی میاد تخته نرد؟',
  '👑 حکم ۴ نفره بیاین',
  '🔥 منچ ۴ نفره کی حاضره؟',
  '🃏 بیا پاسور بزنیم سریع',
  '👋 سلام به رفقای چاژا',
  '⚔️ کی ادعای بازی داره؟ دوئل!'
];

// Live Room Card (Dynamic Light & Dark Modes)
function LiveRoomCard({ room, onJoin, isRtl, isLight }) {
  const game = GAME_DEFS.find(g => g.id === (room.gameType || room.gameId));
  const timeAgo = Math.max(0, Math.round((Date.now() - (room.createdAt || Date.now())) / 60000));
  const currentCount = room.currentPlayers || room.players || 1;
  const maxCount = room.maxPlayers || 2;
  const isFull = currentCount >= maxCount;
  const isWaiting = room.status === 'waiting' || !room.status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all shadow-md space-y-2.5 sm:space-y-3 ${
        isLight
          ? 'bg-white border-slate-200/90 hover:border-purple-400 shadow-slate-200/60'
          : 'bg-slate-900/90 border-purple-500/30 hover:border-purple-400/60 backdrop-blur-xl shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0 shadow-inner ${
            isLight ? 'bg-purple-50 border-purple-200' : 'bg-black/50 border-white/15'
          }`}>
            {game?.icon || room.gameIcon || '🎮'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`text-xs sm:text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isRtl ? (game?.titleFa || room.gameTitleFa || room.gameType) : (game?.titleEn || room.gameTitleEn || room.gameType)}
              </h4>
              <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isWaiting && !isFull
                  ? (isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300')
                  : (isLight ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-500/15 border-amber-500/40 text-amber-300')
              }`}>
                {isWaiting && !isFull 
                  ? (isRtl ? 'آماده بازی' : 'Waiting') 
                  : isFull 
                  ? (isRtl ? 'تکمیل' : 'Full') 
                  : (isRtl ? 'در جریان' : 'Playing')}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-[11px]">
              <span className="flex items-center gap-1">
                <SafeAvatar avatar={room.hostAvatar} size="w-4 h-4 text-[10px]" />
                <span className={`truncate max-w-[90px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {room.hostName || (isRtl ? 'کاربر' : 'Player')}
                </span>
              </span>
              <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>·</span>
              <span className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-300">
                <Users size={11} /> {currentCount}/{maxCount} {isRtl ? 'نفر' : 'Players'}
              </span>
              {room.bet && (
                <>
                  <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>·</span>
                  <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-300">
                    <Coins size={11} /> {room.bet} 🪙
                  </span>
                </>
              )}
              <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>·</span>
              <span className={`flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Clock size={11} /> {timeAgo < 1 ? (isRtl ? 'همین الان' : 'Just now') : (isRtl ? `${timeAgo}د پیش` : `${timeAgo}m`)}
              </span>
            </div>
          </div>
        </div>

        {/* Join Action Button */}
        <button
          onClick={() => onJoin(room)}
          disabled={!isWaiting || isFull}
          className="shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:brightness-110 text-white text-xs font-black disabled:opacity-35 active:scale-95 shadow-md shadow-purple-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Play size={12} />
          <span>{isRtl ? 'پیوستن' : 'Join'}</span>
        </button>
      </div>

      {/* Players Progress Indicators */}
      <div className={`flex items-center gap-1.5 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
        {Array.from({ length: maxCount }).map((_, idx) => {
          const isFilled = idx < currentCount;
          return (
            <div
              key={idx}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                isFilled
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm shadow-purple-500/50'
                  : (isLight ? 'bg-slate-200' : 'bg-white/10')
              }`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

export const TOP_GAME_IDS = ['hokm', 'backgammon', 'ludo', 'pasur', 'snooker', 'air_hockey'];

// Clean, modern Plato-style Game Card (Dynamic Light & Dark Modes)
function GameCard({ game, isLight, isRtl, onGameClick }) {
  const liveCount = Math.floor(Math.random() * 80) + 20;
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onGameClick(game)}
      className={`p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl cursor-pointer border flex flex-col justify-between aspect-[1/1.1] sm:aspect-[1/1] transition-all group relative overflow-hidden shadow-md ${
        isLight
          ? 'bg-white border-slate-200/90 hover:border-purple-400 hover:shadow-purple-500/15 shadow-slate-200/60'
          : 'bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border-white/10 hover:border-purple-400/60 backdrop-blur-xl hover:shadow-purple-500/20'
      }`}
    >
      {/* Ambient background glow */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${game.color} blur-2xl ${isLight ? 'opacity-25' : 'opacity-40'} group-hover:opacity-80 transition-opacity pointer-events-none`} />

      {/* Top badges: Level & Live count */}
      <div className="flex items-center justify-between relative z-10 w-full">
        <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full truncate max-w-[80px] border ${
          isLight
            ? 'bg-slate-100 text-slate-700 border-slate-200'
            : 'bg-black/40 text-slate-200 border-white/10'
        }`}>
          {isRtl ? game.levelFa : game.levelEn}
        </span>
        <div className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
          isLight
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-black/50 text-emerald-400 border-emerald-500/30'
        }`}>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span>{liveCount}</span>
        </div>
      </div>

      {/* Center: Emoji in luminous bubble & Title */}
      <div className="flex flex-col items-center justify-center my-auto py-1 relative z-10 text-center">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${game.color} border ${isLight ? 'border-purple-200/60 shadow-md' : 'border-white/15 shadow-inner'} flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform mb-1.5`}>
          {game.icon}
        </div>
        <h3 className={`text-xs sm:text-sm font-black text-center truncate max-w-full px-1 transition-colors ${
          isLight ? 'text-slate-900 group-hover:text-purple-700' : 'text-white group-hover:text-amber-300'
        }`}>
          {isRtl ? game.titleFa : game.titleEn}
        </h3>
      </div>

      {/* Bottom info bar: Players + Play CTA */}
      <div className={`flex items-center justify-between pt-1.5 border-t text-[10px] sm:text-[11px] z-10 relative mt-auto w-full ${
        isLight ? 'border-slate-100 text-slate-600' : 'border-white/10 text-slate-400'
      }`}>
        <span className="font-bold flex items-center gap-1">
          <Users size={11} className={isLight ? 'text-purple-600' : 'text-purple-400'} />
          <span>{game.maxPlayers > 1 ? (isRtl ? `${game.maxPlayers} نفره` : `${game.maxPlayers}P`) : (isRtl ? 'تک‌نفره' : 'Solo')}</span>
        </span>
        <span className={`font-black flex items-center gap-0.5 group-hover:translate-x-[-2px] transition-transform ${
          isLight ? 'text-purple-600' : 'text-amber-400'
        }`}>
          <span>{isRtl ? 'بازی' : 'Play'}</span>
          <Play size={10} className={isLight ? 'fill-purple-600' : 'fill-amber-400'} />
        </span>
      </div>
    </motion.div>
  );
}

// Create Online Game Modal (Platô Match) - Supports Light & Dark themes
function CreateRoomModal({ isOpen, onClose, onCreated, userName, userAvatar, isRtl, isLight }) {
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
            className={`w-full max-w-lg max-h-[85vh] rounded-3xl border-2 p-5 shadow-2xl space-y-4 text-start overflow-y-auto pb-6 ${
              isLight ? 'bg-white text-slate-900 border-purple-200' : 'bg-slate-900 border-purple-500/40 text-white'
            }`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Plus size={20} className="text-purple-500" />
                <span>{isRtl ? 'ساخت بازی آنلاین جدید' : 'Create New Online Match'}</span>
              </h3>
              <button 
                onClick={handleClose} 
                className={`p-1.5 rounded-xl transition-colors ${isLight ? 'bg-slate-100 text-slate-500 hover:text-slate-900' : 'bg-white/10 text-slate-400 hover:text-white'}`}
                title={isRtl ? 'بستن' : 'Close'}
              >
                <X size={16} />
              </button>
            </div>

            {!createdRoom ? (
              <>
                {/* Game Selection Grid */}
                <div>
                  <p className={`text-xs font-bold mb-2.5 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
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
                              ? (isLight ? 'border-purple-600 bg-purple-100 text-purple-950 shadow-md ring-2 ring-purple-400' : 'border-purple-400 bg-purple-500/30 text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/50')
                              : (isLight ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' : 'border-white/10 bg-white/5 text-slate-300 hover:border-purple-500/40 hover:bg-white/10')
                          }`}
                        >
                          <span className="text-2xl shrink-0">{g.icon}</span>
                          <div className="min-w-0">
                            <span className={`text-xs font-black block truncate ${isSelected ? (isLight ? 'text-purple-950' : 'text-white') : (isLight ? 'text-slate-800' : 'text-slate-200')}`}>
                              {isRtl ? g.titleFa : g.titleEn}
                            </span>
                            <span className={`text-[10px] font-bold block ${isSelected ? (isLight ? 'text-purple-700 font-black' : 'text-purple-200 font-black') : (isLight ? 'text-slate-500' : 'text-slate-400')}`}>
                              {isRtl ? `${g.maxPlayers} نفره` : `${g.maxPlayers} Players`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy Toggle (High Contrast) */}
                <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/10 border-white/15'}`}>
                  <div className="flex items-center gap-2.5">
                    {isPrivate ? <Lock size={18} className="text-amber-500 shrink-0" /> : <Unlock size={18} className="text-emerald-500 shrink-0" />}
                    <div>
                      <p className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {isPrivate ? (isRtl ? 'اتاق خصوصی' : 'Private Room') : (isRtl ? 'اتاق عمومی لابی' : 'Public Lobby Room')}
                      </p>
                      <p className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
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

// Game Mode Selector & Matchmaking Modal (Supports Light & Dark themes)
function GameModeModal({ isOpen, onClose, game, onSelectMode, isRtl, isLight }) {
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
          className={`w-full max-w-sm rounded-3xl border-2 p-6 text-center shadow-2xl space-y-4 ${
            isLight
              ? 'bg-white text-slate-900 border-purple-200'
              : 'bg-gradient-to-b from-[#1a0c2e] via-[#12071f] to-[#0a0312] border-purple-500/40 text-white'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            <div className="flex items-center gap-2 text-start">
              <span className="text-3xl">{game.icon}</span>
              <div>
                <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {isRtl ? game.titleFa : game.titleEn}
                </h3>
                <span className={`text-[10px] font-bold ${isLight ? 'text-purple-600' : 'text-purple-300'}`}>
                  {isRtl ? `${game.maxPlayers} نفره • ${game.levelFa}` : `${game.maxPlayers} Players • ${game.levelEn}`}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isLight ? 'bg-slate-100 text-slate-500 hover:text-slate-900' : 'bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
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
                <h4 className={`text-sm font-black animate-pulse ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {isRtl ? 'در حال جستجوی بازیکن آنلاین...' : 'Searching for online opponent...'}
                </h4>
                <p className={`text-xs mt-1 ${isLight ? 'text-purple-700 font-bold' : 'text-purple-300'}`}>
                  {isRtl ? `زمان جستجو: ${searchTimer} ثانیه` : `Searching time: ${searchTimer}s`}
                </p>
              </div>
              <button
                onClick={() => setIsSearching(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-slate-300 hover:text-white'}`}
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
            </div>
          ) : showWager ? (
            <div className="py-2 space-y-4">
               <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                 {isRtl ? 'شرطی VIP - انتخاب مبلغ سکه' : 'VIP Wager - Select Coin Amount'}
               </h4>
               <p className="text-xs text-amber-600 dark:text-amber-300 font-bold">
                 {isRtl ? 'موجودی شما:' : 'Your Balance:'} {coins?.toLocaleString() || 0} 🪙
               </p>
               <div className="grid grid-cols-2 gap-2">
                 {[50, 100, 500, 1000].map(amt => (
                   <button
                     key={amt}
                     onClick={() => setSelectedWager(amt)}
                     className={`p-3 rounded-xl border-2 font-black transition-all ${
                       selectedWager === amt 
                        ? 'border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-300 shadow-md' 
                        : (isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/10 bg-white/5 text-slate-300')
                     }`}
                   >
                     {amt} 🪙
                   </button>
                 ))}
               </div>
               <div className={`p-3 border rounded-xl ${isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'}`}>
                 <p className="text-xs">
                   {isRtl ? `در صورت برد، ${(selectedWager * 2).toLocaleString()} سکه دریافت می‌کنید!` : `Win to get ${(selectedWager * 2).toLocaleString()} coins!`}
                 </p>
               </div>
               <div className="flex gap-2 pt-2">
                 <button onClick={() => setShowWager(false)} className={`flex-1 py-3 rounded-xl text-xs font-bold ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-white'}`}>
                   {isRtl ? 'بازگشت' : 'Back'}
                 </button>
                 <button 
                   onClick={handleWagerStart}
                   disabled={coins < selectedWager}
                   className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-sm font-black disabled:opacity-50"
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
                className={`w-full p-4 rounded-2xl border text-start flex items-center justify-between group active:scale-95 transition-all shadow-md ${
                  isLight
                    ? 'bg-purple-50/80 border-purple-200 hover:border-purple-400 hover:bg-purple-100/60'
                    : 'bg-gradient-to-r from-purple-900/60 to-indigo-950/80 border-purple-500/40 hover:border-purple-400 shadow-purple-950/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform">
                    🤖
                  </div>
                  <div>
                    <h4 className={`text-sm font-black group-hover:text-purple-600 dark:group-hover:text-purple-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isRtl ? 'بازی با ربات هوشمند' : 'Play vs Smart AI Bot'}
                    </h4>
                    <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRtl ? 'آفلاین، سریع و بدون معطلی با هوش مصنوعی' : 'Instant offline match against smart AI'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-purple-500 ${isRtl ? '' : 'rotate-180'}`} />
              </button>

              {/* Option 2: Live Online Matchmaking */}
              <button
                onClick={handleStartOnlineSearch}
                className={`w-full p-4 rounded-2xl border text-start flex items-center justify-between group active:scale-95 transition-all shadow-md ${
                  isLight
                    ? 'bg-pink-50/80 border-pink-200 hover:border-pink-400 hover:bg-pink-100/60'
                    : 'bg-gradient-to-r from-pink-900/60 to-purple-950/80 border-pink-500/40 hover:border-pink-400 shadow-pink-950/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-pink-600/30 border border-pink-400/40 flex items-center justify-center text-xl text-pink-600 dark:text-pink-300 group-hover:scale-110 transition-transform">
                    👥
                  </div>
                  <div>
                    <h4 className={`text-sm font-black group-hover:text-pink-600 dark:group-hover:text-pink-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isRtl ? 'جستجوی حریف آنلاین' : 'Find Online Opponent'}
                    </h4>
                    <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRtl ? 'اتصال زنده به بازیکنان حاضر در ربات' : 'Real-time live matchmaking with players'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-pink-500 ${isRtl ? '' : 'rotate-180'}`} />
              </button>
              
              {/* Option 3: VIP Wager Mode */}
              <button
                onClick={() => setShowWager(true)}
                className={`w-full p-4 rounded-2xl border text-start flex items-center justify-between group active:scale-95 transition-all shadow-md ${
                  isLight
                    ? 'bg-amber-50/80 border-amber-200 hover:border-amber-400 hover:bg-amber-100/60'
                    : 'bg-gradient-to-r from-amber-900/60 to-orange-950/80 border-amber-500/40 hover:border-amber-400 shadow-amber-950/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-xl text-amber-600 dark:text-amber-300 group-hover:scale-110 transition-transform">
                    💎
                  </div>
                  <div>
                    <h4 className={`text-sm font-black group-hover:text-amber-600 dark:group-hover:text-amber-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isRtl ? 'شرطی VIP' : 'VIP Wager Mode'}
                    </h4>
                    <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRtl ? 'بازی با شرط سکه (جایزه ۲ برابر برای برنده)' : 'Bet coins and win 2x back!'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-amber-500 ${isRtl ? '' : 'rotate-180'}`} />
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
                className={`w-full p-4 rounded-2xl border text-start flex items-center justify-between group active:scale-95 transition-all shadow-md cursor-pointer ${
                  isLight
                    ? 'bg-sky-50/80 border-sky-200 hover:border-sky-400 hover:bg-sky-100/60'
                    : 'bg-gradient-to-r from-sky-900/60 to-blue-950/80 border-sky-500/40 hover:border-sky-400 shadow-sky-950/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-sky-600/30 border border-sky-400/40 flex items-center justify-center text-xl text-sky-600 dark:text-sky-300 group-hover:scale-110 transition-transform">
                    🚀
                  </div>
                  <div>
                    <h4 className={`text-sm font-black group-hover:text-sky-600 dark:group-hover:text-sky-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isRtl ? 'دعوت دوستان در تلگرام' : 'Challenge Friends in Telegram'}
                    </h4>
                    <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRtl ? 'ارسال دعوت به چت دوستان و ورود مستقیم به اتاق' : 'Send invite to any Telegram chat and enter room'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-sky-500 ${isRtl ? '' : 'rotate-180'}`} />
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
  const location = useLocation();
  const { theme: storeTheme, setTheme: setStoreTheme, coins, isVip, language, spendCoins, userProfile } = useAppStore();
  const isRtl = language === 'fa';
  const { userName, userAvatar, setProfile, globalChat, sendGlobalMessage } = useMultiplayerStore();

  // Dynamic Theme detection (respects appStore.theme, telegram colorScheme, and local toggle)
  const tgScheme = window.Telegram?.WebApp?.colorScheme;
  const isLight = storeTheme === 'light' || storeTheme === 'dawn' || storeTheme === 'mint' || (!storeTheme && tgScheme === 'light');

  // Master dual-hub tabs: 'games' (آرکید بازی‌ها) vs 'rooms' (اتاق‌ها و سالن گفتگو)
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [mainTab, setMainTab] = useState(queryTab === 'rooms' ? 'rooms' : 'games');

  // Sync mainTab if URL query changes
  useEffect(() => {
    const t = new URLSearchParams(location.search).get('tab');
    if (t === 'rooms' || t === 'games') {
      setMainTab(t);
    }
  }, [location.search]);

  // Sub-tab inside rooms: 'tables' (میزهای آنلاین) vs 'chat' (گپ‌وگفت زنده سالن)
  const [roomsSubTab, setRoomsSubTab] = useState('tables');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [roomsFilter, setRoomsFilter] = useState('all');

  const [activeCategory, setActiveCategory] = useState('top');
  const [liveRooms, setLiveRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showSelfProfileModal, setShowSelfProfileModal] = useState(false);
  const [selectedGameForMode, setSelectedGameForMode] = useState(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showTournamentsModal, setShowTournamentsModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const chatScrollRef = useRef(null);

  // Synchronize Telegram user profile on mount
  useEffect(() => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser) {
      const tgFullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username;
      const tgAvatar = tgUser.photo_url || userAvatar;
      if (tgFullName && tgFullName !== userName) {
        if (typeof setProfile === 'function') {
          setProfile({ userName: tgFullName, userAvatar: tgAvatar || '🌟' });
        }
        localStorage.setItem('life_os_user_name', tgFullName);
      }
      if (tgUser.photo_url) {
        localStorage.setItem('life_os_user_avatar', tgUser.photo_url);
      }
    }
  }, []);

  // Listen to Telegram themeChanged event
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    const onThemeChange = () => {
      const scheme = tg.colorScheme;
      if (!localStorage.getItem('lifeos_theme')) {
        setStoreTheme(scheme === 'light' ? 'light' : 'cosmic');
      }
    };
    tg.onEvent?.('themeChanged', onThemeChange);
    return () => tg.offEvent?.('themeChanged', onThemeChange);
  }, [setStoreTheme]);

  // Subscribe to live multiplayer rooms
  useEffect(() => {
    const unsub = gameRoomsService.subscribe(rooms => {
      setLiveRooms(rooms.filter(r => !r.isPrivate));
    });
    return unsub;
  }, []);

  const handleJoinRoom = (room) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    const gameId = room.gameType || room.gameId;
    const game = GAME_DEFS.find(g => g.id === gameId) || GAME_DEFS[0];
    if (game) navigate(`${game.path}?mode=online&room=${room.roomId || room.id}&role=black`);
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

  const handleJoinByCode = (codeToJoin) => {
    const raw = (codeToJoin || roomCodeInput).trim().toUpperCase();
    if (!raw) {
      alert(isRtl ? 'لطفاً شناسه اتاق را وارد کنید (مثال: HOKM-1234)' : 'Please enter room code (e.g. HOKM-1234)');
      return;
    }
    let gameType = 'hokm';
    if (raw.startsWith('BACK')) gameType = 'backgammon';
    else if (raw.startsWith('HOKM')) gameType = 'hokm';
    else if (raw.startsWith('LUDO')) gameType = 'ludo';
    else if (raw.startsWith('PASS')) gameType = 'pasur';
    else if (raw.startsWith('SNOO') || raw.startsWith('BILL')) gameType = 'snooker';
    else if (raw.startsWith('AIRH')) gameType = 'air_hockey';
    else if (raw.startsWith('DOTS')) gameType = 'dots_and_boxes';
    else if (raw.startsWith('CONN')) gameType = 'connect_four';
    else {
      const match = GAME_DEFS.find(g => raw.startsWith(g.id.slice(0, 3).toUpperCase()));
      if (match) gameType = match.id;
    }

    const game = GAME_DEFS.find(g => g.id === gameType) || GAME_DEFS[0];
    soundEngine.playTap?.();
    haptics.impact?.('medium');
    navigate(`${game.path}?mode=online&room=${raw}&role=black`);
  };

  const handleSendChat = (textToSend) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;
    soundEngine.playTap?.();
    haptics.impact?.('light');
    if (typeof sendGlobalMessage === 'function') {
      sendGlobalMessage(text, 'lounge');
    }
    setChatInput('');
    setTimeout(() => {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Combined list of active rooms (live from server + active seed rooms)
  const allActiveRooms = React.useMemo(() => {
    const realIds = new Set(liveRooms.map(r => r.roomId || r.id));
    const uniqueSeeds = SEED_ACTIVE_ROOMS.filter(s => !realIds.has(s.roomId));
    return [...liveRooms, ...uniqueSeeds];
  }, [liveRooms]);

  const filteredRooms = React.useMemo(() => {
    if (roomsFilter === 'all') return allActiveRooms;
    return allActiveRooms.filter(r => (r.gameType || r.gameId) === roomsFilter);
  }, [allActiveRooms, roomsFilter]);

  const loungeMessages = React.useMemo(() => {
    if (!Array.isArray(globalChat)) return [];
    return globalChat.filter(m => m.roomId === 'lounge' || m.roomId === 'general').slice(-50);
  }, [globalChat]);

  const topGames = GAME_DEFS.filter(g => TOP_GAME_IDS.includes(g.id));

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const currentDisplayName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ')
    || tgUser?.username
    || userProfile?.fullName
    || (userName && !userName.startsWith('کاربر ') ? userName : '')
    || (isRtl ? 'کاربر چاژا' : 'Chazha Player');
  const currentAvatar = tgUser?.photo_url || userProfile?.avatar || userAvatar || '🎮';
  const currentBio = userProfile?.bio || (isRtl ? '✨ کاربر رسمی بازی‌های آنلاین چاژا در تلگرام' : 'Official Chazha Player');

  return (
    <div
      className={`w-full min-h-screen pb-32 select-none relative overflow-x-hidden font-sans pt-[max(env(safe-area-inset-top),10px)] transition-colors duration-200 ${
        isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#050711] text-white'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Glow Background */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 ${isLight ? 'opacity-10' : 'opacity-20'}`}>
        <div className="absolute top-10 left-1/4 w-[450px] h-[450px] rounded-full bg-purple-600 blur-[130px]" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] rounded-full bg-pink-600 blur-[120px]" />
        <div className="absolute bottom-20 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-600 blur-[110px]" />
      </div>

      <div className="relative z-10 px-3 sm:px-4 pt-2 max-w-2xl mx-auto space-y-3.5">
        
        {/* Top Control Bar */}
        <div className={`flex items-center justify-between p-3 rounded-3xl border shadow-md transition-all ${
          isLight ? 'bg-white/95 border-slate-200 shadow-slate-200/50' : 'bg-slate-900/80 border-white/10 backdrop-blur-xl'
        }`}>
          {/* User Profile Pill */}
          <div 
            onClick={() => { setShowSelfProfileModal(true); soundEngine.playTap?.(); haptics.tap?.(); }}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all p-1 -m-1 rounded-2xl"
            title={isRtl ? 'مشاهده شناسنامه، بنرها و پروفایل' : 'View Profile & Banners'}
          >
            <SafeAvatar avatar={currentAvatar} size="w-10 h-10 text-lg" ringColor="border-amber-400/60" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={`text-xs font-black truncate max-w-[110px] sm:max-w-[150px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currentDisplayName}
                </h3>
                {isVip && <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/40">VIP 👑</span>}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isRtl ? 'پروفایل گیمر 👤' : 'Gamer Profile 👤'}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={() => {
                const nextTheme = isLight ? 'cosmic' : 'light';
                setStoreTheme(nextTheme);
                soundEngine.playTap?.();
                haptics.tap?.();
              }}
              className={`p-2 rounded-2xl border text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                isLight
                  ? 'bg-amber-100/70 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : 'bg-white/10 border-white/10 text-amber-300 hover:bg-white/15'
              }`}
              title={isLight ? (isRtl ? 'حالت تیره' : 'Dark Mode') : (isRtl ? 'حالت روشن' : 'Light Mode')}
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Tournaments */}
            <button
              onClick={() => { setShowTournamentsModal(true); soundEngine.playTap?.(); }}
              className={`p-2 px-2.5 rounded-2xl border text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer ${
                isLight
                  ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : 'bg-amber-500/15 border-amber-400/40 text-amber-300 hover:bg-amber-500/25'
              }`}
              title={isRtl ? 'جام قهرمانان و لیگ‌ها' : 'Tournaments & Cups'}
            >
              <Trophy size={15} className="text-yellow-500" />
              <span className="hidden xs:inline">{isRtl ? 'جام‌ها' : 'Cups'}</span>
            </button>

            {/* Coin Shop Balance (Telegram Stars) */}
            <button
              onClick={() => { setShowShopModal(true); soundEngine.playTap?.(); }}
              className="p-2 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-yellow-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              title={isRtl ? 'خرید سکه با استارز تلگرام' : 'Buy Coins with Stars'}
            >
              <Coins size={15} />
              <span>{(coins || 0).toLocaleString()}</span>
              <span className="w-4 h-4 rounded-full bg-slate-950/20 text-slate-950 flex items-center justify-center text-[10px] font-black">+</span>
            </button>
          </div>
        </div>

        {/* Master Dual-Hub Navigation: Games vs Rooms & Lounge */}
        <div className={`flex items-center p-1 rounded-2xl border shadow-sm transition-all ${
          isLight ? 'bg-slate-200/80 border-slate-300/80' : 'bg-slate-900/90 border-white/10'
        }`}>
          <button
            onClick={() => {
              setMainTab('games');
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'games'
                ? (isLight
                    ? 'bg-white text-purple-900 shadow-sm font-black'
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30')
                : (isLight ? 'text-slate-600 hover:text-slate-900 font-bold' : 'text-slate-400 hover:text-white')
            }`}
          >
            <Gamepad2 size={16} />
            <span>{isRtl ? '🎮 آرکید بازی‌ها' : '🎮 Games Arcade'}</span>
          </button>

          <button
            onClick={() => {
              setMainTab('rooms');
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'rooms'
                ? (isLight
                    ? 'bg-white text-purple-900 shadow-sm font-black'
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30')
                : (isLight ? 'text-slate-600 hover:text-slate-900 font-bold' : 'text-slate-400 hover:text-white')
            }`}
          >
            <Users size={16} />
            <span>{isRtl ? '🎪 اتاق‌ها و سالن گفتگو' : '🎪 Rooms & Lounge'}</span>
            {allActiveRooms.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black animate-pulse ${
                isLight ? 'bg-emerald-600 text-white' : 'bg-emerald-400 text-slate-950'
              }`}>
                {allActiveRooms.length}
              </span>
            )}
          </button>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: 🎮 ARCADE GAMES                                           */}
        {/* ================================================================ */}
        {mainTab === 'games' && (
          <div className="space-y-3.5">
            {/* Featured Hero Banner */}
            <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border shadow-lg transition-all ${
              isLight
                ? 'bg-gradient-to-r from-amber-50 via-purple-50 to-pink-50 border-amber-300/80'
                : 'bg-gradient-to-r from-[#221206] via-[#1a0d24] to-[#090412] border-amber-500/35 shadow-xl'
            }`}>
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-2xl shadow-md shadow-amber-500/25 shrink-0 border border-amber-300/40">
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`px-2 py-0.2 rounded-full border text-[10px] font-black ${
                        isLight ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                      }`}>
                        {isRtl ? 'برگزیده هفته' : 'Featured'}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-full border text-[9px] font-bold ${
                        isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      }`}>
                        ⚡ {isRtl ? 'آنلاین ۴ نفره' : 'Online 4P'}
                      </span>
                    </div>
                    <h2 className={`text-sm sm:text-base font-black truncate ${
                      isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-100'
                    }`}>
                      {isRtl ? 'حکم ۴ نفره شاهانه و مسابقات' : 'Royal 4-Player Hokm Cup'}
                    </h2>
                    <p className={`text-[10px] sm:text-xs truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRtl ? 'رقابت آنلاین با حریفان زنده سراسر ایران با جوایز سکه 🪙' : 'Play live with players across Iran, win coins!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      const hokmDef = GAME_DEFS.find(g => g.id === 'hokm');
                      if (hokmDef) handleGameClick(hokmDef);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs active:scale-95 shadow-md shadow-amber-500/20 hover:brightness-110 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Zap size={13} className="fill-slate-950" />
                    <span>{isRtl ? 'شروع' : 'Play'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => { setActiveCategory('top'); soundEngine.playTap?.(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1 transition-all border shrink-0 cursor-pointer ${
                  activeCategory === 'top'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-400 shadow-sm'
                    : (isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white')
                }`}
              >
                <span>🌟</span>
                <span>{isRtl ? 'محبوب‌ترین‌ها' : 'Top Hits'}</span>
              </button>

              <button
                onClick={() => { setActiveCategory('all'); soundEngine.playTap?.(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1 transition-all border shrink-0 cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-sm'
                    : (isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white')
                }`}
              >
                <span>🎮</span>
                <span>{isRtl ? `همه (${GAME_DEFS.length})` : `All (${GAME_DEFS.length})`}</span>
              </button>

              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); soundEngine.playTap?.(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1 transition-all border shrink-0 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-sm'
                      : (isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white')
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
                </button>
              ))}

              <button
                onClick={() => { setActiveCategory('history'); soundEngine.playTap?.(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1 transition-all border shrink-0 cursor-pointer ${
                  activeCategory === 'history'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-sm'
                    : (isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white')
                }`}
              >
                <span>📜</span>
                <span>{isRtl ? 'تاریخچه' : 'History'}</span>
              </button>
            </div>

            {/* Games Grid or History */}
            {activeCategory === 'history' ? (
              <div className={`rounded-3xl border overflow-hidden ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-white/10'}`}>
                <GameHistoryPanel />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                {(activeCategory === 'top'
                  ? topGames
                  : activeCategory === 'all'
                  ? GAME_DEFS
                  : GAME_DEFS.filter(g => g.category === activeCategory)
                ).map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isLight={isLight}
                    isRtl={isRtl}
                    onGameClick={handleGameClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: 🎪 ROOMS & LIVE LOUNGE CHAT                               */}
        {/* ================================================================ */}
        {mainTab === 'rooms' && (
          <div className="space-y-3.5">
            {/* Quick Room Code Direct Join & Create Table Header */}
            <div className={`p-4 rounded-3xl border shadow-sm space-y-3 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
            }`}>
              {/* Direct Code Join Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') handleJoinByCode(); }}
                    placeholder={isRtl ? 'کد اتاق (مثال: HOKM-9102)...' : 'Room code (e.g. HOKM-9102)...'}
                    className={`w-full py-2.5 pr-9 pl-3 rounded-2xl text-xs font-bold border transition-all uppercase tracking-wider ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white'
                        : 'bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-400'
                    }`}
                  />
                </div>
                <button
                  onClick={() => handleJoinByCode()}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black shadow-md shadow-purple-500/20 active:scale-95 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Play size={13} />
                  <span>{isRtl ? 'ورود' : 'Join'}</span>
                </button>
              </div>

              {/* Create Room Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>{isRtl ? 'ساخت میز مسابقه آنلاین جدید +' : 'Create New Online Match Table +'}</span>
              </button>
            </div>

            {/* Rooms Sub-tab Switcher: Tables vs Live Lounge Chat */}
            <div className={`flex items-center p-1 rounded-2xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-white/10'
            }`}>
              <button
                onClick={() => {
                  setRoomsSubTab('tables');
                  soundEngine.playTap?.();
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  roomsSubTab === 'tables'
                    ? (isLight ? 'bg-white text-purple-900 shadow-sm' : 'bg-purple-600 text-white shadow-md')
                    : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
              >
                <span>🎲</span>
                <span>{isRtl ? `میزهای آنلاین آماده (${allActiveRooms.length})` : `Active Tables (${allActiveRooms.length})`}</span>
              </button>

              <button
                onClick={() => {
                  setRoomsSubTab('chat');
                  soundEngine.playTap?.();
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  roomsSubTab === 'chat'
                    ? (isLight ? 'bg-white text-purple-900 shadow-sm' : 'bg-purple-600 text-white shadow-md')
                    : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
              >
                <MessageSquare size={14} />
                <span>{isRtl ? `سالن گفتگوی زنده (${loungeMessages.length})` : `Lounge Chat (${loungeMessages.length})`}</span>
              </button>
            </div>

            {/* Sub-view 1: Active Tables List */}
            {roomsSubTab === 'tables' && (
              <div className="space-y-3">
                {/* Game filter pills */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={() => setRoomsFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      roomsFilter === 'all'
                        ? (isLight ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-600 text-white border-purple-400')
                        : (isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900/80 border-white/10 text-slate-400')
                    }`}
                  >
                    {isRtl ? `همه میزها (${allActiveRooms.length})` : `All (${allActiveRooms.length})`}
                  </button>
                  {['hokm', 'backgammon', 'ludo', 'pasur', 'air_hockey'].map(gid => {
                    const g = GAME_DEFS.find(item => item.id === gid);
                    if (!g) return null;
                    const count = allActiveRooms.filter(r => (r.gameType || r.gameId) === gid).length;
                    return (
                      <button
                        key={gid}
                        onClick={() => setRoomsFilter(gid)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer ${
                          roomsFilter === gid
                            ? (isLight ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-600 text-white border-purple-400')
                            : (isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900/80 border-white/10 text-slate-400')
                        }`}
                      >
                        <span>{g.icon}</span>
                        <span>{isRtl ? g.titleFa.split(' ')[0] : g.titleEn}</span>
                        {count > 0 && <span className="text-[10px] opacity-80">({count})</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Table Cards Feed */}
                {filteredRooms.length === 0 ? (
                  <div className={`text-center py-10 p-6 rounded-3xl border space-y-3 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-white/10'
                  }`}>
                    <div className="text-4xl">🎲</div>
                    <div>
                      <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {isRtl ? 'هیچ میز فعالی در این بازی یافت نشد' : 'No active tables for this game'}
                      </h4>
                      <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {isRtl ? 'می‌توانید همین حالا اولین میز بازی را بسازید و دوستانتان را دعوت کنید!' : 'Create the first table and invite your friends!'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black shadow-md shadow-purple-500/20 active:scale-95"
                    >
                      {isRtl ? 'ساخت میز جدید' : 'Create Table'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredRooms.map(room => (
                      <LiveRoomCard
                        key={room.roomId || room.id}
                        room={room}
                        onJoin={handleJoinRoom}
                        isRtl={isRtl}
                        isLight={isLight}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-view 2: Live Lounge Chat Feed */}
            {roomsSubTab === 'chat' && (
              <div className={`p-4 rounded-3xl border shadow-sm space-y-3.5 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
              }`}>
                {/* Header info */}
                <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isRtl ? 'سالن گفتگوی عمومی چاژا (چت زنده و دعوت به بازی)' : 'Live Public Game Lounge'}
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold">
                    {isRtl ? 'بلادرنگ ⚡' : 'Real-time ⚡'}
                  </span>
                </div>

                {/* Quick Action Challenge Phrase Chips */}
                <div>
                  <p className={`text-[10px] font-bold mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isRtl ? 'ارسال سریع دعوت بازی در سالن:' : 'Quick Challenge Phrases:'}
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {QUICK_CHAT_PHRASES.map((phrase, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChat(phrase)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-black whitespace-nowrap border active:scale-95 transition-all cursor-pointer ${
                          isLight
                            ? 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
                            : 'bg-purple-950/40 border-purple-500/30 text-purple-200 hover:bg-purple-900/50'
                        }`}
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Feed */}
                <div className={`h-64 overflow-y-auto rounded-2xl p-3 space-y-2.5 border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                }`}>
                  {loungeMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      {isRtl ? 'پیامی در سالن نیست. اولین پیام را ارسال کنید!' : 'No messages yet. Say hello!'}
                    </div>
                  ) : (
                    loungeMessages.map((msg, i) => {
                      const isMe = msg.userId === (localStorage.getItem('life_os_user_id') || 'me');
                      return (
                        <div
                          key={msg.id || i}
                          className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                        >
                          <SafeAvatar avatar={msg.userAvatar} size="w-7 h-7 text-xs" />
                          <div className={`max-w-[80%] rounded-2xl p-2.5 text-xs ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none'
                              : (isLight ? 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm' : 'bg-slate-800/90 border border-white/10 text-slate-100 rounded-bl-none')
                          }`}>
                            <div className="flex items-center gap-1.5 text-[10px] opacity-75 mb-0.5">
                              <span className="font-bold">{msg.userName || 'Player'}</span>
                              {msg.userRole && <span className="text-[9px] opacity-90">• {msg.userRole}</span>}
                            </div>
                            <p className="font-medium leading-relaxed break-words">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatScrollRef} />
                </div>

                {/* Chat Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                    placeholder={isRtl ? 'پیام یا درخواست بازی را بنویسید...' : 'Type a message or game challenge...'}
                    className={`flex-1 py-2.5 px-3.5 rounded-2xl text-xs font-medium border transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500'
                        : 'bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-400'
                    }`}
                  />
                  <button
                    onClick={() => handleSendChat()}
                    disabled={!chatInput.trim()}
                    className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-40 active:scale-95 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                  >
                    <Send size={16} className={isRtl ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Game Mode Selector Modal */}
      <GameModeModal
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        game={selectedGameForMode}
        onSelectMode={handleModeSelected}
        isRtl={isRtl}
        isLight={isLight}
      />

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleRoomCreated}
        userName={currentDisplayName}
        userAvatar={currentAvatar}
        isRtl={isRtl}
        isLight={isLight}
      />

      {/* Self Profile Modal with 5-Banner Carousel (Plato Style) */}
      <OpponentProfileModal
        isOpen={showSelfProfileModal}
        onClose={() => setShowSelfProfileModal(false)}
        player={{
          id: localStorage.getItem('life_os_user_id') || 'self',
          name: currentDisplayName,
          avatar: currentAvatar,
          avatarImg: (typeof currentAvatar === 'string' && (currentAvatar.startsWith('http') || currentAvatar.startsWith('data:'))) ? currentAvatar : null,
          bio: currentBio,
          isSelf: true,
          level: 14,
          rank: isRtl ? 'استاد چاژا 👑' : 'Chazha Master 👑',
          winRate: '75%',
          matchesCount: 58
        }}
        isFriend={true}
        onOpenStore={() => {
          setShowSelfProfileModal(false);
          setShowShopModal(true);
        }}
        isRtl={isRtl}
        colorMode={isLight ? 'light' : 'dark'}
      />

      {/* Full Chazha Cosmetics & Currency Store */}
      <ChazhaStoreModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
        isRtl={isRtl}
        colorMode={isLight ? 'light' : 'dark'}
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
