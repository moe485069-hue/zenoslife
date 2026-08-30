import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Gamepad2, Brain, Swords, Crosshair, Type, Target, 
  Users, Send, Zap, Trophy, Sparkles, Layers, Activity, Flame, Shield, Award 
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useMultiplayerStore from '../store/multiplayerStore';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import GameMatchSetupModal from '../components/games/GameMatchSetupModal';

// Complete Game Definitions (11 games)
const GAMES = [
  {
    id: 'backgammon',
    titleFa: 'تخته نرد شاهانه ایرانی',
    titleEn: 'Royal Persian Backgammon',
    icon: <span className="text-3xl">🎲</span>,
    descFa: 'بازی اصیل تخته نرد با ۳ تم (چوب گردو، تخت جمشید و کیهانی). بازی با ربات، دونفره محلی و چندنفره آنلاین با چت زنده در دسته‌های ۱ تا ۷ ست.',
    descEn: 'Authentic Backgammon with 3 themes (Wood, Persepolis, Cosmic). Play vs AI Bot, 2-Player & Online with live chat in 1 to 7 set matches.',
    path: '/games/backgammon',
    level: 'شاهانه 👑',
    category: 'board',
    playersCount: '۱ الی ۲ نفره + آنلاین',
    isMultiplayerCapable: true,
    color: 'from-amber-600/30 to-yellow-900/50 border-amber-500/60 ring-1 ring-amber-400/40'
  },
  {
    id: 'ludo',
    titleFa: 'منچ کلاسیک و آنلاین (Ludo Master)',
    titleEn: 'Royal Persian Ludo',
    icon: <span className="text-3xl">🎯</span>,
    descFa: 'بازی نوستالژیک منچ ۲، ۳ و ۴ نفره با ۳ تم اختصاصی (چوبی، هخامنشیان و کیهانی). قابلیت بازی با ربات‌های هوشمند، دورهمی و آنلاین با چت زنده.',
    descEn: 'Classic 2, 3 & 4 Player Ludo with 3 themes (Wood, Persepolis, Cosmic). Play vs AI Bots, Local Pass & Play, and Online with real-time chat.',
    path: '/games/ludo',
    level: 'هیجان‌انگیز 🔥',
    category: 'board',
    playersCount: '۲ الی ۴ نفره + آنلاین',
    isMultiplayerCapable: true,
    color: 'from-rose-600/30 to-amber-900/50 border-rose-500/60 ring-1 ring-rose-400/40'
  },
  {
    id: 'cosmic_chess',
    titleFa: 'شطرنج کیهانی',
    titleEn: 'Cosmic Chess',
    icon: <Swords className="w-8 h-8 text-indigo-400" />,
    descFa: 'نبرد استراتژیک در فضا. دونفره یا با هوش مصنوعی همراه با قابلیت چت محلی و حرکت‌های قانونی مهره‌ها.',
    descEn: 'Strategic chess battle in space with local 2-player mode and smart AI.',
    path: '/games/cosmic-chess',
    level: 'استراتژیک ♟️',
    category: 'board',
    playersCount: '۱ الی ۲ نفره',
    isMultiplayerCapable: true,
    color: 'from-indigo-600/20 to-blue-900/40 border-indigo-500/50'
  },
  {
    id: 'tic_tac_toe',
    titleFa: 'دوز نئونی (Tic-Tac-Toe)',
    titleEn: 'Neon Tic-Tac-Toe',
    icon: <Target className="w-8 h-8 text-emerald-400" />,
    descFa: 'بازی کلاسیک دوز با گرافیک سایبرپانک و حریف هوشمند هوش مصنوعی.',
    descEn: 'Classic 3x3 game with cyberpunk neon graphics.',
    path: '/games/tic-tac-toe',
    level: 'ساده 🟢',
    category: 'board',
    playersCount: '۱ الی ۲ نفره',
    isMultiplayerCapable: true,
    color: 'from-emerald-600/20 to-teal-900/40 border-emerald-500/50'
  },
  {
    id: 'cosmic_pong',
    titleFa: 'پونگ کیهانی',
    titleEn: 'Cosmic Pong',
    icon: <Gamepad2 className="w-8 h-8 text-sky-400" />,
    descFa: 'بازی دونفره پونگ. قابل بازی در یک دستگاه با پشتیبانی از لمس و کیبورد.',
    descEn: '2-Player Pong. Playable on one device with touch and keyboard support.',
    path: '/games/cosmic-pong',
    level: 'دونفره 🏓',
    category: 'arcade',
    playersCount: '۱ الی ۲ نفره',
    isMultiplayerCapable: true,
    color: 'from-sky-600/20 to-blue-900/40 border-sky-500/50'
  },
  {
    id: 'cyber_2048',
    titleFa: '۲۰۴۸ سایبری',
    titleEn: 'Cyber 2048',
    icon: <Layers className="w-8 h-8 text-cyan-400" />,
    descFa: 'پازل ریاضی و استراتژیک با کاشی‌های نئونی. به عدد ۲۰۴۸ و فراتر از آن برس!',
    descEn: 'Neon strategic sliding puzzle. Reach 2048 and beyond!',
    path: '/games/2048',
    level: 'حرفه‌ای 🔴',
    category: 'arcade',
    playersCount: 'تک‌نفره رکوردی',
    color: 'from-cyan-600/20 to-blue-900/40 border-cyan-500/50'
  },
  {
    id: 'reaction_speed',
    titleFa: 'سرعت واکنش کیهانی',
    titleEn: 'Cosmic Reaction Speed',
    icon: <Zap className="w-8 h-8 text-amber-400" />,
    descFa: 'سنجش میلی‌ثانیه‌ای سرعت عکس‌العمل عصبی و رفلکس مغز در ۵ راند رقابتی.',
    descEn: 'Millisecond-precision benchmark of your nervous system reflex in 5 rounds.',
    path: '/games/reaction-speed',
    level: 'واکنش ⚡',
    category: 'arcade',
    playersCount: 'سنجش مهارت',
    color: 'from-amber-600/20 to-orange-900/40 border-amber-500/50'
  },
  {
    id: 'space_defender',
    titleFa: 'مدافع فضا (Space Defender)',
    titleEn: 'Space Defender',
    icon: <Crosshair className="w-8 h-8 text-rose-400" />,
    descFa: 'بازی اکشن و رکوردی با گرافیک نئونی. سفینه را کنترل کن و سنگ‌های آسمانی را نابود کن.',
    descEn: 'Neon action game. Defend your ship against incoming asteroids.',
    path: '/games/space-defender',
    level: 'اکشن 🚀',
    category: 'arcade',
    playersCount: 'تک‌نفره رکوردی',
    color: 'from-rose-600/20 to-red-900/40 border-rose-500/50'
  },
  {
    id: 'neon_snake',
    titleFa: 'مار سایبری (Neon Snake)',
    titleEn: 'Neon Snake',
    icon: <Target className="w-8 h-8 text-purple-400" />,
    descFa: 'مار کلاسیک اما با گرافیک نئونی. رکورد خود را در آرکید ثبت کن!',
    descEn: 'Classic snake with neon graphics. Set your high score!',
    path: '/games/neon-snake',
    level: 'آرکید 🐍',
    category: 'arcade',
    playersCount: 'تک‌نفره رکوردی',
    color: 'from-purple-600/20 to-fuchsia-900/40 border-purple-500/50'
  },
  {
    id: 'wordle_persian',
    titleFa: 'حدس کلمه فارسی (Wordle)',
    titleEn: 'Persian Wordle',
    icon: <Type className="w-8 h-8 text-amber-400" />,
    descFa: 'کلمه ۵ حرفی پنهان را در ۶ تلاش با صفحه کلید مجازی فارسی حدس بزن.',
    descEn: 'Guess the hidden 5-letter word in 6 tries.',
    path: '/games/wordle',
    level: 'کلمات 🔤',
    category: 'puzzle',
    playersCount: 'فکری روزانه',
    color: 'from-amber-600/20 to-yellow-900/40 border-amber-500/50'
  },
  {
    id: 'memory_matrix',
    titleFa: 'ماتریس حافظه فعال',
    titleEn: 'Memory Matrix',
    icon: <Brain className="w-8 h-8 text-fuchsia-400" />,
    descFa: 'چالش جذاب برای تقویت حافظه فعال و تمرکز ذهن. جفت کارت‌ها را کشف کن.',
    descEn: 'Find the matching pairs in this memory challenge.',
    path: '/games/memory-matrix',
    level: 'تقویت حافظه 🧠',
    category: 'puzzle',
    playersCount: 'فکری و تمرکز',
    color: 'from-fuchsia-600/20 to-purple-900/40 border-fuchsia-500/50'
  }
];

export default function Games() {
  const { isRtl, language } = useAppStore();
  const navigate = useNavigate();
  const { userName } = useMultiplayerStore();

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedGameForModal, setSelectedGameForModal] = useState(null);

  const [highScores, setHighScores] = useState({
    best2048: 0,
    bestReaction: 0,
    bestSnake: 0,
    bestSpace: 0
  });

  useEffect(() => {
    setHighScores({
      best2048: parseInt(localStorage.getItem('cyber_2048_best') || '0', 10),
      bestReaction: parseInt(localStorage.getItem('reaction_speed_best') || '0', 10),
      bestSnake: parseInt(localStorage.getItem('snake_high_score') || '0', 10),
      bestSpace: parseInt(localStorage.getItem('space_defender_high') || '0', 10)
    });
  }, []);

  const handleGameCardClick = (game) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    if (game.isMultiplayerCapable) {
      setSelectedGameForModal(game);
    } else {
      navigate(game.path);
    }
  };

  const handleStartGameFromModal = (config) => {
    if (!selectedGameForModal) return;
    const query = new URLSearchParams();
    query.set('mode', config.mode);
    if (config.roomCode) query.set('room', config.roomCode);
    if (config.botDifficulty) query.set('diff', config.botDifficulty);
    if (config.matchSets) query.set('sets', String(config.matchSets));
    if (config.playerCount) query.set('players', String(config.playerCount));

    navigate(`${selectedGameForModal.path}?${query.toString()}`);
    setSelectedGameForModal(null);
  };

  const filteredGames = activeCategory === 'all' 
    ? GAMES 
    : GAMES.filter(g => g.category === activeCategory);

  const categories = [
    { id: 'all', labelFa: '✨ همه بازی‌ها (۱۱ بازی)', labelEn: 'All Games (11)', icon: '🎮' },
    { id: 'board', labelFa: '👑 شاهانه و دورهمی', labelEn: 'Board & Multiplayer', icon: '🎲' },
    { id: 'arcade', labelFa: '⚡ آرکید و رکوردی', labelEn: 'Arcade & Action', icon: '🕹️' },
    { id: 'puzzle', labelFa: '🧠 فکری و کلمات', labelEn: 'Brain & Puzzle', icon: '🧩' },
  ];

  return (
    <div className="w-full min-h-full pb-24 relative overflow-hidden bg-[var(--bg-primary)]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <Gamepad2 className="w-96 h-96 text-purple-500" />
      </div>

      <div className="relative z-10 px-4 pt-6 max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                soundEngine.playTap?.();
                haptics.tap?.();
                navigate('/');
              }}
              className="p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors active:scale-95 shadow-sm"
            >
              <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 flex items-center gap-2">
                <span>🎮</span>
                <span>{isRtl ? 'آرکید و بازی‌های زنوسلایف' : 'ZenOsLife Arcade'}</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-xs mt-1">
                {isRtl ? 'هویت شما' : 'Player'}: <span className="font-bold text-fuchsia-400">{userName}</span> · {GAMES.length} بازی کامل و فعال
              </p>
            </div>
          </div>
        </div>

        {/* High Scores Showcase Bar */}
        {(highScores.best2048 > 0 || highScores.bestReaction > 0 || highScores.bestSnake > 0 || highScores.bestSpace > 0) && (
          <div className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex flex-wrap items-center justify-around gap-3">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" />
              <span className="text-xs font-black text-[var(--text-primary)]">{isRtl ? 'رکوردهای ثبت‌شده شما:' : 'Your Records:'}</span>
            </div>
            {highScores.best2048 > 0 && (
              <div className="px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs">
                <span className="text-cyan-400 font-bold">۲۰۴۸: </span>
                <span className="text-cyan-200 font-black">{highScores.best2048.toLocaleString()}</span>
              </div>
            )}
            {highScores.bestReaction > 0 && highScores.bestReaction < 900 && (
              <div className="px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs">
                <span className="text-amber-400 font-bold">واکنش: </span>
                <span className="text-amber-200 font-black">{highScores.bestReaction} ms</span>
              </div>
            )}
            {highScores.bestSnake > 0 && (
              <div className="px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                <span className="text-purple-400 font-bold">مار: </span>
                <span className="text-purple-200 font-black">{highScores.bestSnake}</span>
              </div>
            )}
            {highScores.bestSpace > 0 && (
              <div className="px-3 py-1 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs">
                <span className="text-rose-400 font-bold">مدافع فضا: </span>
                <span className="text-rose-200 font-black">{highScores.bestSpace}</span>
              </div>
            )}
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                soundEngine.playTap?.();
                haptics.tap?.();
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border flex items-center gap-2 active:scale-95 shadow-sm ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-purple-500/25'
                  : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/40'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <motion.div 
              key={game.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGameCardClick(game)}
              className={`relative p-5 rounded-3xl cursor-pointer border bg-gradient-to-br ${game.color} backdrop-blur-xl group overflow-hidden shadow-md hover:shadow-2xl transition-all flex flex-col justify-between`}
            >
              <div className="absolute inset-0 bg-white/5 dark:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[var(--bg-card)] rounded-2xl shadow-lg border border-[var(--border)] flex items-center justify-center">
                    {game.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black px-2.5 py-1 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-full border border-[var(--border)] shadow-xs">
                      {game.level}
                    </span>
                    {game.playersCount && (
                      <span className="text-[9px] font-bold text-slate-400 px-1">
                        {game.playersCount}
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-transparent bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                    {isRtl ? game.titleFa : game.titleEn}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed line-clamp-2">
                    {isRtl ? game.descFa : game.descEn}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-black text-purple-400 group-hover:text-pink-400 transition-colors">
                <span>{isRtl ? (game.isMultiplayerCapable ? 'تنظیمات و شروع بازی ⚙️' : 'ورود به بازی 🚀') : 'Play Game'}</span>
                <span className="text-sm">→</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Pre-Game Match Configuration Modal */}
      <GameMatchSetupModal
        isOpen={!!selectedGameForModal}
        onClose={() => setSelectedGameForModal(null)}
        game={selectedGameForModal}
        onStartGame={handleStartGameFromModal}
      />

    </div>
  );
}
