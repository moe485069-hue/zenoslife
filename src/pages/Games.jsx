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
    coverImage: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&w=600&q=80',
    category: 'board',
    maxPlayers: 2,
    color: 'from-emerald-600/30 via-teal-800/20 to-emerald-950/50 border-emerald-500/40',
    accentColor: 'text-emerald-300',
    descFa: 'بازی کارتی خاطره‌انگیز ایرانی. جمع کن، پاستور بزن و امتیاز بگیر!',
    descEn: 'Memorable Persian card game. Match, sweep, and score points!',
    levelFa: 'اصیل 🃏',
    levelEn: 'Classic 🃏',
    featured: true,
    path: '/games/pasur'
  },
  {
    id: 'ludo',
    titleFa: 'منچ کلاسیک (۲ تا ۴ نفره)',
    titleEn: 'Classic Ludo (2-4P)',
    icon: '🎯',
    coverImage: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=85',
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
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=85',
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
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1760903192559-17dc111d31e3?auto=format&fit=crop&w=800&q=85',
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
    coverImage: 'https://images.unsplash.com/photo-1772143535059-3988b87de76a?auto=format&fit=crop&w=800&q=85',
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
    coverImage: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1668901382969-8c73e450a1f5?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=85',
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
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
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
  'air_hockey', 'battleship', 'soccer', 'ocho', 'golf', 'snooker', 'pasur', 'billiards',
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
  },
  {
    roomId: 'SNOO-4147',
    gameType: 'snooker',
    gameTitleFa: 'اسنوکر حرفه‌ای ۳بعدی',
    gameTitleEn: 'Royal Snooker 3D',
    hostName: 'استاد_بریک',
    hostAvatar: '🎱',
    currentPlayers: 1,
    maxPlayers: 2,
    bet: 300,
    status: 'waiting',
    createdAt: Date.now() - 45000
  },
  {
    roomId: 'BILL-8820',
    gameType: 'billiards',
    gameTitleFa: 'بیلیارد ۸-توپی',
    gameTitleEn: '8-Ball Billiards',
    hostName: 'شاهین_پاکت‌زن',
    hostAvatar: '🎱',
    currentPlayers: 1,
    maxPlayers: 2,
    bet: 200,
    status: 'waiting',
    createdAt: Date.now() - 85000
  }
];

export const QUICK_CHAT_PHRASES = [
  '🎲 کی میاد تخته نرد؟',
  '👑 حکم ۴ نفره بیاین',
  '🎱 اسنوکر و بیلیارد کی حریفه؟',
  '🔥 منچ ۴ نفره کی حاضره؟',
  '🃏 بیا پاسور بزنیم سریع',
  '👋 سلام به رفقای چاژا',
  '⚔️ کی ادعای بازی داره؟ دوئل!'
];

// Realistic, gaming-focused initial lobby chat messages with playable join buttons
export const DEFAULT_LOUNGE_MESSAGES = [
  {
    id: 'lounge_m1',
    userId: 'bot_arsham',
    userName: 'آرشام_تاس‌باز',
    userAvatar: '🦁',
    userRole: '👑 قهرمان تخته‌نرد',
    roomId: 'lounge',
    text: 'تخته نرد شرطی ۲۰۰ سکه کسی حریف هست؟ میز BACK-7721 منتظره!',
    gameId: 'backgammon',
    roomIdToJoin: 'BACK-7721',
    timestamp: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'lounge_m2',
    userId: 'bot_soltan',
    userName: 'سلطان_پاسور',
    userAvatar: '👑',
    userRole: '🃏 استاد حکم ۴ نفره',
    roomId: 'lounge',
    text: 'حکم ۴ نفره شاهانه، ۱ نفر نیاز داریم. سریع بیاین شروع کنیم.',
    gameId: 'hokm',
    roomIdToJoin: 'HOKM-9102',
    timestamp: new Date(Date.now() - 75000).toISOString()
  },
  {
    id: 'lounge_m3',
    userId: 'bot_negin',
    userName: 'نگین_تک‌خال',
    userAvatar: '💎',
    userRole: '⚡ لیگ ستارگان',
    roomId: 'lounge',
    text: 'پاسور چهاربرگ شرطی ۲۵۰ سکه آماده‌ام. کی ادعای بازی داره؟ دوئل!',
    gameId: 'pasur',
    roomIdToJoin: 'PASS-3319',
    timestamp: new Date(Date.now() - 30000).toISOString()
  }
];

// Live Room Card (Dynamic Light & Dark Modes + Real Host Support)
function LiveRoomCard({ room, onJoin, onShare, myUserId, isRtl, isLight }) {
  const game = GAME_DEFS.find(g => g.id === (room.gameType || room.gameId));
  const currentCount = room.currentPlayers || room.players || 1;
  const maxCount = room.maxPlayers || 2;
  const isFull = currentCount >= maxCount;
  const isWaiting = room.status === 'waiting' || !room.status;
  const isMyRoom = (room.hostId && myUserId && room.hostId === myUserId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all shadow-md space-y-2.5 sm:space-y-3 ${
        isMyRoom
          ? (isLight ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300/60 shadow-amber-200/50' : 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30')
          : (isLight
              ? 'bg-white border-slate-200/90 hover:border-purple-400 shadow-slate-200/60'
              : 'bg-slate-900/90 border-purple-500/30 hover:border-purple-400/60 backdrop-blur-xl shadow-xl')
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
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-xs sm:text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isRtl ? (game?.titleFa || room.gameTitleFa || room.gameType) : (game?.titleEn || room.gameTitleEn || room.gameType)}
              </h4>
              <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isWaiting && !isFull
                  ? (isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300')
                  : (isLight ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-500/15 border-amber-500/40 text-amber-300')
              }`}>
                {isWaiting && !isFull 
                  ? (isRtl ? 'آماده مسابقه' : 'Waiting') 
                  : isFull 
                  ? (isRtl ? 'تکمیل' : 'Full') 
                  : (isRtl ? 'در جریان' : 'Playing')}
              </span>
              {isMyRoom && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/40">
                  {isRtl ? 'میز شما 👑' : 'Your Table 👑'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-[11px] flex-wrap">
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
              <span className={`flex items-center gap-1 font-mono text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {room.roomId}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isMyRoom && (
            <button
              onClick={() => onShare ? onShare(room) : onJoin(room)}
              className="px-2.5 sm:px-3 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white text-xs font-black active:scale-95 shadow-md shadow-sky-500/25 transition-all flex items-center gap-1 cursor-pointer"
              title={isRtl ? 'ارسال دعوت به دوستان در تلگرام' : 'Invite Telegram Friends'}
            >
              <Share2 size={12} />
              <span className="hidden xs:inline">{isRtl ? 'دعوت' : 'Invite'}</span>
            </button>
          )}

          <button
            onClick={() => onJoin(room)}
            disabled={!isWaiting || isFull}
            className="shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:brightness-110 text-white text-xs font-black disabled:opacity-35 active:scale-95 shadow-md shadow-purple-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play size={12} />
            <span>{isRtl ? 'پیوستن' : 'Join'}</span>
          </button>
        </div>
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

// Grade-1 Console Arcade Game Card — Real cover artwork, live indicators, coin rewards & play pill
function GameCard({ game, isLight, isRtl, onGameClick }) {
  // Stable seed per game id — no random flicker on re-render
  const liveCount = React.useMemo(() => {
    const seed = game.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return (seed % 65) + 18;
  }, [game.id]);

  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onGameClick(game)}
      className={`rounded-2xl sm:rounded-3xl cursor-pointer border flex flex-col aspect-[3.4/4] sm:aspect-[3.6/4] transition-all duration-300 group relative overflow-hidden ${
        isLight
          ? 'bg-white border-slate-200 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/15 shadow-md shadow-slate-200/80'
          : 'bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-black border-white/[0.08] hover:border-purple-400/60 hover:shadow-2xl hover:shadow-purple-900/50 backdrop-blur-xl'
      }`}
    >
      {/* Top Cover Image Area */}
      <div className="relative w-full h-[58%] sm:h-[60%] overflow-hidden bg-slate-950">
        {!imgError && game.coverImage ? (
          <img
            src={game.coverImage}
            alt={game.titleEn}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 contrast-[1.08] saturate-[1.2] brightness-[1.02]"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${game.color} flex items-center justify-center text-4xl`}>
            {game.icon}
          </div>
        )}

        {/* Crisp & Vibrant Edge Lighting (No muddy center fog) */}
        <div className="absolute top-0 inset-x-0 h-9 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Top Badges (Category & Live Players Counter) */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10">
          <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-sm truncate max-w-[70px]">
            {isRtl ? game.levelFa : game.levelEn}
          </span>
          <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black/65 text-emerald-400 border border-emerald-500/40 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>{liveCount}</span>
          </div>
        </div>

        {/* Floating Play Overlay On Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/60 scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={16} className="fill-white translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 relative z-10">
        <div>
          <h3 className={`text-xs sm:text-[13px] font-black truncate leading-tight transition-colors ${
            isLight ? 'text-slate-900 group-hover:text-purple-600' : 'text-white group-hover:text-amber-300'
          }`}>
            {isRtl ? game.titleFa : game.titleEn}
          </h3>
          <p className={`text-[9px] sm:text-[10px] font-medium truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {game.maxPlayers > 1 
              ? (isRtl ? `${game.maxPlayers} نفره آنلاین ⚡` : `${game.maxPlayers}P Online ⚡`) 
              : (isRtl ? 'تک نفره رکوردی 🏆' : 'Solo Arcade 🏆')}
          </p>
        </div>

        <div className={`flex items-center justify-between pt-1.5 mt-1 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.08]'}`}>
          <span className={`text-[9px] sm:text-[10px] font-black flex items-center gap-1 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
            <Coins size={11} className="text-amber-500" />
            <span>{isRtl ? '+۵۰ سکه' : '+50 Coins'}</span>
          </span>
          <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all group-hover:scale-105 shadow-sm ${
            isLight
              ? 'bg-purple-600 text-white shadow-purple-500/25'
              : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-purple-900/40'
          }`}>
            <span>{isRtl ? 'بازی' : 'Play'}</span>
            <Gamepad2 size={11} />
          </span>
        </div>
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
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/15 relative shadow-sm bg-slate-800 flex items-center justify-center">
                            {g.coverImage ? (
                              <img src={g.coverImage} alt={g.titleEn} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            ) : null}
                            <span className="text-xl absolute">{g.icon}</span>
                          </div>
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
// Game Mode Selector & Matchmaking Modal (Illustrated, Attractive & Intuitive)
function GameModeModal({ isOpen, onClose, game, onSelectMode, isRtl, isLight }) {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);
  const [showWager, setShowWager] = useState(false);
  const [selectedWager, setSelectedWager] = useState(50);
  const { coins, spendCoins } = useAppStore();

  // Dynamic realistic live online players calculated per game
  const onlinePlayersCount = Math.floor(180 + ((game?.id?.charCodeAt(0) || 75) * 19 + (game?.maxPlayers || 2) * 43) % 230);

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
      <div 
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4" 
        onClick={onClose} 
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className={`w-full max-w-md rounded-3xl border-2 p-4 sm:p-6 text-center shadow-2xl space-y-4 relative overflow-hidden ${
            isLight
              ? 'bg-white text-slate-900 border-purple-200'
              : 'bg-gradient-to-b from-[#180d2b] via-[#11071e] to-[#0a0312] border-purple-500/40 text-white shadow-purple-950/50'
          }`}
        >
          {/* Top Decorative Ambient Glow */}
          <div className="absolute -top-12 inset-x-0 h-24 bg-gradient-to-b from-purple-500/20 to-transparent pointer-events-none blur-xl" />

          {/* Illustrated Game Header */}
          <div className={`flex items-center justify-between border-b pb-3.5 relative z-10 ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}>
            <div className="flex items-center gap-3 text-start min-w-0">
              {/* Framed Game Cover Thumbnail */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-lg shrink-0 relative bg-slate-900 group">
                {game.coverImage ? (
                  <img
                    src={game.coverImage}
                    alt={game.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 contrast-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {game.icon}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-0.5">
                  <span className="text-[10px]">{game.icon}</span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0">
                <h3 className={`text-base sm:text-lg font-black truncate leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {isRtl ? game.titleFa : game.titleEn}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    isLight ? 'bg-purple-100 border-purple-200 text-purple-900' : 'bg-purple-500/20 border-purple-400/30 text-purple-300'
                  }`}>
                    {isRtl ? `${game.maxPlayers} نفره` : `${game.maxPlayers} Players`}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isLight ? 'bg-amber-100 border-amber-200 text-amber-900' : 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                  }`}>
                    {isRtl ? game.levelFa : game.levelEn}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-2xl transition-all active:scale-90 cursor-pointer ${
                isLight ? 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/15'
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Searching Online Radar Screen */}
          {isSearching ? (
            <div className="py-6 space-y-4 relative z-10">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/40 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-purple-500/60 animate-pulse" />
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-2xl relative z-10 bg-slate-900">
                  {game.coverImage ? (
                    <img src={game.coverImage} alt={game.titleEn} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">{game.icon}</div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-2xl">
                    ⚔️
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`text-sm sm:text-base font-black animate-pulse ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {isRtl ? 'در حال جستجو و اتصال به حریف آنلاین...' : 'Searching for live opponent...'}
                </h4>
                <p className={`text-xs mt-1.5 font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  {isRtl ? `از میان ${onlinePlayersCount.toLocaleString('fa-IR')} بازیکن آنلاین • زمان: ${searchTimer} ثانیه` : `Among ${onlinePlayersCount} online players • Time: ${searchTimer}s`}
                </p>
              </div>

              <button
                onClick={() => setIsSearching(false)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
            </div>
          ) : showWager ? (
            /* VIP Wager Coin Selection Screen */
            <div className="py-2 space-y-4 relative z-10">
              <div className="flex items-center justify-between px-1">
                <h4 className={`text-sm font-black flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Crown size={16} className="text-amber-500" />
                  <span>{isRtl ? 'مسابقه شرطی VIP — انتخاب مبلغ سکه' : 'VIP Wager — Choose Coin Amount'}</span>
                </h4>
                <span className="text-xs text-amber-500 font-mono font-black">
                  {coins?.toLocaleString() || 0} 🪙
                </span>
              </div>

              {/* Coin Options Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[50, 100, 250, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setSelectedWager(amt)}
                    className={`p-3 rounded-2xl border-2 font-black transition-all cursor-pointer flex items-center justify-between ${
                      selectedWager === amt 
                        ? 'border-amber-400 bg-amber-400/20 text-amber-500 ring-2 ring-amber-400/40 shadow-lg scale-[1.02]' 
                        : (isLight ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10')
                    }`}
                  >
                    <span className="text-sm font-mono">{amt}</span>
                    <span className="text-xs">🪙 سکه</span>
                  </button>
                ))}
              </div>

              {/* Prize Calculator Box */}
              <div className={`p-3.5 border rounded-2xl flex items-center justify-between ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              }`}>
                <div className="text-start">
                  <span className="text-[11px] font-bold block">{isRtl ? 'جایزه پیروزی در این مسابقه:' : 'Victory Prize Pool:'}</span>
                  <span className="text-sm font-mono font-black text-amber-500">
                    +{(selectedWager * 2).toLocaleString()} 🪙
                  </span>
                </div>
                <Trophy size={22} className="text-amber-500" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => setShowWager(false)} 
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/10 border-white/10 text-white'
                  }`}
                >
                  {isRtl ? 'بازگشت' : 'Back'}
                </button>
                <button 
                  onClick={handleWagerStart}
                  disabled={coins < selectedWager}
                  className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 disabled:opacity-40 active:scale-95 transition-all cursor-pointer"
                >
                  {isRtl ? 'شروع مسابقه شرطی' : 'Start Wager Match'}
                </button>
              </div>
            </div>
          ) : (
            /* 4 Illustrated Interactive Mode Cards */
            <div className="space-y-2.5 pt-1 relative z-10">
              {/* Option 1: 🤖 Play vs Smart AI Bot (Offline) */}
              <button
                onClick={() => { onSelectMode('bot'); onClose(); }}
                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-start flex items-center justify-between group active:scale-98 transition-all shadow-md cursor-pointer ${
                  isLight
                    ? 'bg-purple-50/90 border-purple-200/90 hover:border-purple-400 hover:bg-purple-100/70 shadow-purple-200/40'
                    : 'bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900/80 border-purple-500/30 hover:border-purple-400/70 hover:shadow-purple-900/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    🤖
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-xs sm:text-sm font-black group-hover:text-purple-600 dark:group-hover:text-purple-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {isRtl ? 'بازی با ربات هوشمند' : 'Play vs Smart AI Bot'}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/30">
                        {isRtl ? '⚡ فوری و آفلاین' : 'Instant'}
                      </span>
                    </div>
                    <p className={`text-[10px] leading-tight truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRtl ? 'شروع آنی بدون نیاز به اینترنت، دارای ۳ سطح تمرینی' : 'Instant offline match with 3 AI levels'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-purple-500 shrink-0 ${isRtl ? '' : 'rotate-180'}`} />
              </button>

              {/* Option 2: 👥 Live Online Matchmaking with Active Players Counter */}
              <button
                onClick={handleStartOnlineSearch}
                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-start flex items-center justify-between group active:scale-98 transition-all shadow-md cursor-pointer ${
                  isLight
                    ? 'bg-emerald-50/90 border-emerald-200/90 hover:border-emerald-400 hover:bg-emerald-100/70 shadow-emerald-200/40'
                    : 'bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-slate-900/80 border-emerald-500/30 hover:border-emerald-400/70 hover:shadow-emerald-900/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform relative">
                    ⚔️
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className={`text-xs sm:text-sm font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {isRtl ? 'جستجوی حریف آنلاین' : 'Find Online Opponent'}
                      </span>
                      {/* Active Online Players Badge */}
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>{onlinePlayersCount.toLocaleString(isRtl ? 'fa-IR' : 'en-US')} {isRtl ? 'آنلاین' : 'Online'}</span>
                      </span>
                    </div>
                    <p className={`text-[10px] leading-tight truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRtl ? 'اتصال هوشمند به بازیکنان آنلاین چاژا در تلگرام • PING 24ms ⚡' : 'Live smart matchmaking on Telegram server'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-emerald-500 shrink-0 ${isRtl ? '' : 'rotate-180'}`} />
              </button>
              
              {/* Option 3: 💎 VIP Wager Mode */}
              <button
                onClick={() => setShowWager(true)}
                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-start flex items-center justify-between group active:scale-98 transition-all shadow-md cursor-pointer ${
                  isLight
                    ? 'bg-amber-50/90 border-amber-200/90 hover:border-amber-400 hover:bg-amber-100/70 shadow-amber-200/40'
                    : 'bg-gradient-to-r from-amber-950/70 via-orange-950/50 to-slate-900/80 border-amber-500/30 hover:border-amber-400/70 hover:shadow-amber-900/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-xs sm:text-sm font-black group-hover:text-amber-600 dark:group-hover:text-amber-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {isRtl ? 'مسابقه شرطی VIP' : 'VIP Wager Mode'}
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                        {isRtl ? '🔥 ۲ برابر جایزه' : '2x Coins'}
                      </span>
                    </div>
                    <p className={`text-[10px] leading-tight truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRtl ? `شرط‌بندی با سکه روی برد مسابقه • موجودی: ${coins?.toLocaleString() || 0} 🪙` : 'Wager coins and win 2x back!'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-amber-500 shrink-0 ${isRtl ? '' : 'rotate-180'}`} />
              </button>

              {/* Option 4: 🚀 Fast Telegram Challenge (Friends Invite) */}
              <button
                onClick={() => {
                  onClose();
                  const prefix = game.id === 'backgammon' ? 'BACK-' : game.id === 'hokm' ? 'HOKM-' : `${game.id.slice(0, 4).toUpperCase()}-`;
                  const randomCode = prefix + Math.random().toString(36).substring(2, 6).toUpperCase();
                  shareToTelegram({ roomCode: randomCode, gameType: game.id, gameTitleFa: game.titleFa });
                  navigate(`${game.path}?mode=online&room=${randomCode}&role=white`);
                }}
                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-start flex items-center justify-between group active:scale-98 transition-all shadow-md cursor-pointer ${
                  isLight
                    ? 'bg-sky-50/90 border-sky-200/90 hover:border-sky-400 hover:bg-sky-100/70 shadow-sky-200/40'
                    : 'bg-gradient-to-r from-sky-950/70 via-blue-950/50 to-slate-900/80 border-sky-500/30 hover:border-sky-400/70 hover:shadow-sky-900/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    🚀
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-xs sm:text-sm font-black group-hover:text-sky-600 dark:group-hover:text-sky-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {isRtl ? 'دعوت و چالش دوستان در تلگرام' : 'Challenge Telegram Friends'}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-400/30">
                        {isRtl ? '✨ کارت مسابقه' : 'Match Card'}
                      </span>
                    </div>
                    <p className={`text-[10px] leading-tight truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {isRtl ? 'ارسال کارت مستقیم دعوت به پیوی دوستان یا گروه‌ها و ورود به بازی' : 'Send match card to friends and play together'}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className={`text-sky-500 shrink-0 ${isRtl ? '' : 'rotate-180'}`} />
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

  const handleModeSelected = (mode, wagerAmount) => {
    if (!selectedGameForMode) return;
    if (mode === 'bot') {
      navigate(`${selectedGameForMode.path}?mode=bot`);
    } else if (mode === 'wager') {
      navigate(`${selectedGameForMode.path}?mode=online&wager=${wagerAmount || 50}&matchmaking=true`);
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

    // Auto-detect game mentioned in challenge
    let detectedGame = null;
    let autoRoomCode = null;
    if (text.includes('تخته') || text.includes('نرد')) {
      detectedGame = 'backgammon';
      autoRoomCode = 'BACK-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    } else if (text.includes('حکم')) {
      detectedGame = 'hokm';
      autoRoomCode = 'HOKM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    } else if (text.includes('منچ')) {
      detectedGame = 'ludo';
      autoRoomCode = 'LUDO-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    } else if (text.includes('پاسور')) {
      detectedGame = 'pasur';
      autoRoomCode = 'PASS-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    } else if (text.includes('هاکی')) {
      detectedGame = 'air_hockey';
      autoRoomCode = 'AIRH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    // If game detected, publish real room
    if (detectedGame && autoRoomCode) {
      gameRoomsService.publishRoom({
        roomId: autoRoomCode,
        gameType: detectedGame,
        gameTitleFa: GAME_DEFS.find(g => g.id === detectedGame)?.titleFa || detectedGame,
        hostId: localStorage.getItem('life_os_user_id') || 'me',
        hostName: currentDisplayName,
        hostAvatar: currentAvatar,
        maxPlayers: GAME_DEFS.find(g => g.id === detectedGame)?.maxPlayers || 2,
        isPrivate: false
      });
    }

    if (typeof sendGlobalMessage === 'function') {
      sendGlobalMessage(text, 'lounge', false, {
        gameId: detectedGame,
        roomIdToJoin: autoRoomCode
      });
    }

    setChatInput('');
    setTimeout(() => {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    // If user sent a challenge, active online player in lounge responds after 1.5s!
    if (detectedGame && autoRoomCode) {
      setTimeout(() => {
        const responders = [
          { name: 'آرشام_تاس‌باز', avatar: '🦁', role: '👑 قهرمان تخته' },
          { name: 'نگین_تک‌خال', avatar: '💎', role: '⚡ لیگ ستارگان' },
          { name: 'سام_سرعتی', avatar: '⚡', role: '🔥 رنک برتر' }
        ];
        const responder = responders[Math.floor(Math.random() * responders.length)];
        const replyText = `من حریفم! میز ${autoRoomCode} رو باز کن اومدم ⚔️`;
        useMultiplayerStore.setState(state => ({
          globalChat: [
            ...state.globalChat,
            {
              id: 'reply_' + Date.now(),
              userId: 'bot_' + responder.name,
              userName: responder.name,
              userAvatar: responder.avatar,
              userRole: responder.role,
              roomId: 'lounge',
              text: replyText,
              gameId: detectedGame,
              roomIdToJoin: autoRoomCode,
              timestamp: new Date().toISOString()
            }
          ]
        }));
        soundEngine.playMessageChime?.();
        setTimeout(() => {
          chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, 1600);
    }
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
    if (!Array.isArray(globalChat)) return DEFAULT_LOUNGE_MESSAGES;
    const loungeOnly = globalChat.filter(m => m.roomId === 'lounge');
    return loungeOnly.length > 0 ? loungeOnly.slice(-60) : DEFAULT_LOUNGE_MESSAGES;
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
        
        {/* Top Control Bar — Grade-1 premium header */}
        <div className={`flex items-center justify-between px-3 py-2.5 rounded-3xl border shadow-lg transition-all ${
          isLight
            ? 'bg-white/98 border-slate-200/80 shadow-slate-200/60'
            : 'bg-slate-900/90 border-white/[0.07] backdrop-blur-2xl shadow-black/30'
        }`}>
          {/* User Profile Pill */}
          <div
            onClick={() => { setShowSelfProfileModal(true); soundEngine.playTap?.(); haptics.tap?.(); }}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer active:scale-95 transition-all"
            title={isRtl ? 'پروفایل گیمری' : 'Gamer Profile'}
          >
            {/* Avatar with ring */}
            <div className="relative shrink-0">
              <SafeAvatar avatar={currentAvatar} size="w-10 h-10 text-lg" ringColor="border-amber-400/70" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={`text-xs font-black truncate max-w-[90px] sm:max-w-[140px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currentDisplayName}
                </h3>
                {isVip && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-black border border-amber-500/40">VIP</span>}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-mono">LVL 4</span>
                <div className="w-12 sm:w-16 h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full w-[65%]" />
                </div>
                <span className={`text-[8px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>650 XP</span>
              </div>
            </div>
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={() => {
                const nextTheme = isLight ? 'cosmic' : 'light';
                setStoreTheme(nextTheme);
                soundEngine.playTap?.();
                haptics.tap?.();
              }}
              className={`p-2 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'
                  : 'bg-white/8 border-white/10 text-slate-300 hover:bg-white/15'
              }`}
              title={isLight ? (isRtl ? 'تم تاریک' : 'Dark Mode') : (isRtl ? 'تم روشن' : 'Light Mode')}
            >
              {isLight ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Tournaments */}
            <button
              onClick={() => { setShowTournamentsModal(true); soundEngine.playTap?.(); }}
              className={`p-2 px-2 rounded-xl border text-xs font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
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

        {/* Master Dual-Hub Navigation — Grade-1 pill switcher */}
        <div className={`flex items-center p-1 rounded-2xl border transition-all ${
          isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-950/70 border-white/[0.07]'
        }`}>
          <button
            onClick={() => { setMainTab('games'); soundEngine.playTap?.(); haptics.tap?.(); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'games'
                ? (isLight
                    ? 'bg-white text-purple-900 shadow-md ring-1 ring-purple-200'
                    : 'bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700 text-white shadow-lg shadow-purple-900/50')
                : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-200')
            }`}
          >
            <Gamepad2 size={15} />
            <span>{isRtl ? 'آرکید بازی‌ها' : 'Games'}</span>
          </button>

          <button
            onClick={() => { setMainTab('rooms'); soundEngine.playTap?.(); haptics.tap?.(); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              mainTab === 'rooms'
                ? (isLight
                    ? 'bg-white text-purple-900 shadow-md ring-1 ring-purple-200'
                    : 'bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700 text-white shadow-lg shadow-purple-900/50')
                : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-200')
            }`}
          >
            <Users size={15} />
            <span>{isRtl ? 'اتاق‌ها و چت' : 'Rooms'}</span>
            {allActiveRooms.length > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center ${
                mainTab === 'rooms'
                  ? 'bg-white/25 text-white'
                  : (isLight ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white')
              }`}>
                {allActiveRooms.length}
              </span>
            )}
          </button>
        </div>

        {/* Live Arcade Ticker — Real-time game atmosphere */}
        <div className={`flex items-center justify-between px-3.5 py-2 rounded-2xl border text-[11px] font-bold shadow-sm transition-all ${
          isLight 
            ? 'bg-purple-50/90 border-purple-200/80 text-purple-950' 
            : 'bg-white/[0.04] border-white/[0.08] text-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">
              {isRtl ? '۱۲۵۰+ بازیکن هم‌اکنون در چاژا' : '1,250+ Gamers Live Online'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-black ${
              isLight ? 'bg-emerald-100 text-emerald-900' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              PING 28ms 🟢
            </span>
            <span className="text-amber-500 font-black flex items-center gap-1">
              <Coins size={12} className="text-amber-500" />
              <span>{isRtl ? '۵۰,۰۰۰+ جایزه' : '50K+ Daily Rewards'}</span>
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: 🎮 ARCADE GAMES                                           */}
        {/* ================================================================ */}
        {mainTab === 'games' && (
          <div className="space-y-3.5">
            {/* Featured Hero Banner — Console Arcade Showcase */}
            <div 
              className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 border shadow-2xl transition-all cursor-pointer ${
                isLight
                  ? 'bg-gradient-to-br from-amber-50/90 via-purple-50/60 to-white border-amber-300/80 shadow-amber-200/40'
                  : 'bg-[#0c0817] border-amber-500/40 shadow-purple-950/50'
              }`}
              onClick={() => {
                const hokmDef = GAME_DEFS.find(g => g.id === 'hokm');
                if (hokmDef) handleGameClick(hokmDef);
              }}
            >
              {/* Cover Art Backdrop with Vignette Fade */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1000&q=80')" }}
              />
              <div className={`absolute inset-0 z-0 pointer-events-none transition-colors ${
                isLight
                  ? 'bg-gradient-to-r from-amber-50/95 via-white/80 to-transparent'
                  : 'bg-gradient-to-r from-[#0c0817]/95 via-[#0c0817]/80 to-transparent'
              }`} />

              {/* Glowing orbs */}
              <div className="absolute -top-8 -right-8 w-36 h-36 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Real Framed Game Poster */}
                  <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xl shrink-0 group-hover:scale-105 transition-transform bg-slate-900">
                    <img 
                      src="https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=400&q=80" 
                      alt="Hokm Royal" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-1">
                      <span className="text-[9px] font-black text-amber-300">👑 شاهانه</span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black flex items-center gap-1 ${
                        isLight ? 'bg-amber-100 border-amber-300 text-amber-950' : 'bg-amber-500/25 border-amber-400/50 text-amber-300'
                      }`}>
                        <Sparkles size={10} className="text-amber-500" />
                        <span>{isRtl ? 'بازی برگزیده هفته' : 'Featured Game'}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                        isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300'
                      }`}>
                        ⚡ {isRtl ? '۴ نفره آنلاین زنده' : '4P Live Online'}
                      </span>
                    </div>

                    <h2 className={`text-base sm:text-lg font-black leading-tight ${
                      isLight ? 'text-slate-950' : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300'
                    }`}>
                      {isRtl ? 'حکم ۴ نفره شاهانه' : 'Royal 4-Player Hokm'}
                    </h2>
                    <p className={`text-[11px] mt-1 line-clamp-1 font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {isRtl ? 'رقابت زنده کشوری • برد ۵۰+ سکه 🪙 • ۱۲۵۰ بازیکن هم‌اکنون' : 'Live tournaments • Win 50+ coins 🪙 • 1250+ gamers online'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const hokmDef = GAME_DEFS.find(g => g.id === 'hokm');
                      if (hokmDef) handleGameClick(hokmDef);
                    }}
                    className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm active:scale-95 shadow-xl shadow-amber-500/35 hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap size={15} className="fill-slate-950" />
                    <span>{isRtl ? 'ورود به بازی' : 'Play Now'}</span>
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
                {/* Instant Quick Match Banner */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-md transition-all ${
                  isLight
                    ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-purple-200'
                    : 'bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-900/90 border-purple-500/30 backdrop-blur-xl'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-xl text-white shadow-md shrink-0">
                      ⚡
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <h4 className={`text-xs font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {isRtl ? 'اتصال سریع به نزدیک‌ترین میز آماده' : 'Quick Match to Available Table'}
                        </h4>
                      </div>
                      <p className={`text-[10px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isRtl ? 'بدون معطلی وارد بازی آنلاین با حریف زنده شوید' : 'Jump into live game without waiting'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playDiceRoll?.();
                      haptics.impact?.('heavy');
                      const available = filteredRooms.find(r => (r.currentPlayers || 1) < (r.maxPlayers || 2)) || allActiveRooms[0];
                      if (available) {
                        handleJoinRoom(available);
                      } else {
                        const defaultGame = GAME_DEFS[0];
                        navigate(`${defaultGame.path}?mode=online&matchmaking=true`);
                      }
                    }}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md shadow-amber-500/25 active:scale-95 hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Zap size={13} className="fill-slate-950" />
                    <span>{isRtl ? 'ورود سریع' : 'Fast Join'}</span>
                  </button>
                </div>

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
                        onShare={(r) => {
                          const shareText = isRtl
                            ? `🎮 من در چاژا یک میز ${r.gameTitleFa || 'بازی'} ساختم! کد میز: ${r.roomId}. برای بازی بیا:`
                            : `🎮 I created a ${r.gameTitleEn || 'game'} table on Chazha! Room: ${r.roomId}. Join now:`;
                          shareToTelegram(`https://t.me/chazha_bot/play?startapp=${r.roomId}`, shareText);
                        }}
                        myUserId={localStorage.getItem('life_os_user_id') || 'me'}
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
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{isRtl ? '۲۸ بازیکن آنلاین' : '28 online'}</span>
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
                          <div className={`max-w-[85%] rounded-2xl p-2.5 text-xs ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none shadow-md shadow-purple-500/20'
                              : (isLight ? 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm' : 'bg-slate-800/90 border border-white/10 text-slate-100 rounded-bl-none')
                          }`}>
                            <div className="flex items-center gap-1.5 text-[10px] opacity-75 mb-0.5">
                              <span className="font-bold">{msg.userName || 'Player'}</span>
                              {msg.userRole && <span className="text-[9px] opacity-90">• {msg.userRole}</span>}
                            </div>
                            <p className="font-medium leading-relaxed break-words">{msg.text}</p>

                            {/* Interactive Direct Match Action Button */}
                            {(msg.roomIdToJoin || msg.gameId) && (
                              <button
                                onClick={() => {
                                  soundEngine.playTap?.();
                                  haptics.impact?.('medium');
                                  const gameType = msg.gameId || (msg.roomIdToJoin?.startsWith('BACK') ? 'backgammon' : msg.roomIdToJoin?.startsWith('HOKM') ? 'hokm' : msg.roomIdToJoin?.startsWith('LUDO') ? 'ludo' : 'pasur');
                                  const game = GAME_DEFS.find(g => g.id === gameType) || GAME_DEFS[0];
                                  navigate(`${game.path}?mode=online&room=${msg.roomIdToJoin}&role=black`);
                                }}
                                className="mt-2 w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all hover:brightness-110 cursor-pointer"
                              >
                                <Swords size={12} />
                                <span>{isRtl ? `⚔️ ورود به میز مسابقه (${msg.roomIdToJoin || 'شروع'})` : `Join Table (${msg.roomIdToJoin || 'Play'})`}</span>
                              </button>
                            )}
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
