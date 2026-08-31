import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import jalaali from 'jalaali-js';
import { 
  Sun, Moon, Sparkles, Footprints, Flame, 
  Gamepad2, MessagesSquare, Trophy, Heart,
  Compass, Coins, Crown, ChevronLeft,
  BookOpen, Brain, Calendar as CalendarIcon, Zap
} from 'lucide-react';
import useAppStore from '../store/appStore';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import CoinShopModal from '../components/shop/CoinShopModal';
import VipSubscriptionModal from '../components/dating/VipSubscriptionModal';
import ReferralHubModal from '../components/referral/ReferralHubModal';

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export default function Welcome() {
  const navigate = useNavigate();
  const { language, userProfile, coins, xp, level } = useAppStore();
  const isRtl = language === 'fa';

  const [greeting, setGreeting] = useState({ title: '', icon: <Sun /> });
  const [currentDate, setCurrentDate] = useState('');
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting({ title: isRtl ? 'صبح بخیر' : 'Good Morning', icon: <Sun className="text-amber-500" size={24} /> });
    } else if (hour >= 12 && hour < 18) {
      setGreeting({ title: isRtl ? 'ظهر بخیر' : 'Good Afternoon', icon: <Sun className="text-orange-500" size={24} /> });
    } else {
      setGreeting({ title: isRtl ? 'شب بخیر' : 'Good Evening', icon: <Moon className="text-indigo-400" size={24} /> });
    }

    const now = new Date();
    const jDate = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const dateStr = isRtl 
      ? `${jDate.jd} ${JALALI_MONTHS[jDate.jm - 1]} ${jDate.jy}`
      : now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    setCurrentDate(dateStr);
  }, [isRtl]);

  const handleNav = (path) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    navigate(path);
  };

  const LIFE_OS_MODULES = [
    {
      id: 'mindfulness',
      title: isRtl ? 'ذهن‌آگاهی و مراقبه ۴۳۲Hz' : 'Mindfulness & 432Hz',
      desc: isRtl ? 'موسیقی‌های آرامش‌بخش، تنفس و چاکراها' : 'Tibetan sounds, breathing & chakras',
      icon: <Sparkles size={22} className="text-purple-400" />,
      bg: 'from-purple-950/40 via-indigo-950/20 to-purple-900/10',
      border: 'border-purple-500/30 hover:border-purple-400',
      path: '/mindfulness'
    },
    {
      id: 'my-day',
      title: isRtl ? 'امروز من و برنامه‌ریزی' : 'My Day & Habits',
      desc: isRtl ? 'مدیریت کارها، پومودورو و روتین روزانه' : 'Tasks, Pomodoro timer & habits',
      icon: <Flame size={22} className="text-emerald-400" />,
      bg: 'from-emerald-950/40 via-teal-950/20 to-emerald-900/10',
      border: 'border-emerald-500/30 hover:border-emerald-400',
      path: '/my-day'
    },
    {
      id: 'ai-mentor',
      title: isRtl ? 'مربی هوش مصنوعی ذن' : 'AI Zen Mentor',
      desc: isRtl ? 'مشاور خردمند خودشناسی و رشد فردی' : 'Intelligent coach & life wisdom',
      icon: <Brain size={22} className="text-sky-400" />,
      bg: 'from-sky-950/40 via-blue-950/20 to-sky-900/10',
      border: 'border-sky-500/30 hover:border-sky-400',
      path: '/ai-mentor'
    },
    {
      id: 'tarot',
      title: isRtl ? 'فال تاروت و چارت تولد' : 'Tarot & Cosmic Astrology',
      desc: isRtl ? 'تحلیل کیهانی، فال ۳ کارتی و طالع‌نما' : '3-card tarot & natal birth chart',
      icon: <Compass size={22} className="text-amber-400" />,
      bg: 'from-amber-950/40 via-yellow-950/20 to-amber-900/10',
      border: 'border-amber-500/30 hover:border-amber-400',
      path: '/chat?tab=tarot'
    },
    {
      id: 'stroll',
      title: isRtl ? 'گشت‌وگذار و پیاده‌روی' : 'Stroll Explorer',
      desc: isRtl ? 'پیاده‌روی آگاهانه در نقاط جذاب زمین' : 'Mindful walking in world spots',
      icon: <Footprints size={22} className="text-teal-400" />,
      bg: 'from-teal-950/40 via-emerald-950/20 to-teal-900/10',
      border: 'border-teal-500/30 hover:border-teal-400',
      path: '/stroll'
    },
    {
      id: 'self-discovery',
      title: isRtl ? 'حکمت و خودشناسی' : 'Wisdom & Growth',
      desc: isRtl ? 'نقل‌قول‌های بزرگان و عمق آگاهی' : 'Quotes, insights & deeper awareness',
      icon: <BookOpen size={22} className="text-rose-400" />,
      bg: 'from-rose-950/40 via-pink-950/20 to-rose-900/10',
      border: 'border-rose-500/30 hover:border-rose-400',
      path: '/self-discovery'
    }
  ];

  return (
    <div className="min-h-screen pb-28 pt-3 px-3.5 sm:px-6 max-w-lg mx-auto flex flex-col gap-4">
      
      {/* 1. Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md text-lg">
            👑
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-[var(--text-primary)]">
                {greeting.title}، {userProfile?.fullName || (isRtl ? 'همراه گرامی' : 'Friend')}
              </h1>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              {currentDate}
            </span>
          </div>
        </div>

        {/* Quick Shop Badge */}
        <button
          onClick={() => { soundEngine.playTap?.(); setIsShopModalOpen(true); }}
          className="px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center gap-1.5 shadow-inner hover:scale-105 active:scale-95 transition-all"
        >
          <Coins size={15} />
          <span>{(coins || 0).toLocaleString()}</span>
        </button>
      </motion.div>

      {/* 2. THE TWO MAIN PILLARS: CHAT & GAMES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
            {isRtl ? '🎯 بخش‌های اصلی' : 'Main Hubs'}
          </h2>
          <span className="text-[10px] text-purple-400 font-bold">زنده و آنلاین 🟢</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1: Chat & Community */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            onClick={() => handleNav('/chat')}
            className="group relative cursor-pointer overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-purple-950/40 to-slate-900/90 border border-purple-500/40 hover:border-purple-400 shadow-lg shadow-purple-950/30 active:scale-98 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <MessagesSquare size={26} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black">
                {isRtl ? 'چت و دوستیابی' : 'Live Chat'}
              </span>
            </div>
            <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
              {isRtl ? 'گفتگو و چت‌روم‌ها' : 'Chat & Community'}
            </h3>
            <p className="text-xs text-slate-300/80 font-medium mt-1 leading-relaxed">
              {isRtl ? 'چت ناشناس، تالارهای زنده، چت صوتی و همراهان هم‌فرکانس' : 'Anonymous chats, live rooms & voice talks'}
            </p>
          </motion.div>

          {/* Card 2: Games Arcade */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => handleNav('/games')}
            className="group relative cursor-pointer overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-rose-950/70 via-amber-950/30 to-slate-900/90 border border-rose-500/40 hover:border-rose-400 shadow-lg shadow-rose-950/30 active:scale-98 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Gamepad2 size={26} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black">
                {isRtl ? '۱۰+ بازی شاهانه' : '10+ Games'}
              </span>
            </div>
            <h3 className="text-base font-black text-white group-hover:text-rose-300 transition-colors">
              {isRtl ? 'آرکید بازی‌ها و مسابقات' : 'Arcade & Tournaments'}
            </h3>
            <p className="text-xs text-slate-300/80 font-medium mt-1 leading-relaxed">
              {isRtl ? 'حکم ۴ نفره، تخته‌نرد، پاستور، منچ، بیلیارد و دوئل‌های شرطی' : 'Hokm, Backgammon, Pasur, Ludo & Pool'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* 3. ZENOSLIFE HOLISTIC UNIVERSE PORTAL (دیگر بخش‌های زنوسلایف) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            <span>{isRtl ? 'فضای جامع زنوسلایف (Life-OS)' : 'ZenOsLife Universe'}</span>
          </h2>
          <span className="text-[10px] text-[var(--text-secondary)]">رشد فردی و آرامش ذهن</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {LIFE_OS_MODULES.map((mod, idx) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + (idx * 0.04) }}
              onClick={() => handleNav(mod.path)}
              className={`group cursor-pointer p-3.5 rounded-2xl bg-gradient-to-r ${mod.bg} border ${mod.border} shadow-sm active:scale-98 transition-all flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-black/30 border border-white/5 group-hover:scale-105 transition-transform">
                  {mod.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                    {mod.desc}
                  </p>
                </div>
              </div>
              <ChevronLeft size={16} className={`text-slate-500 group-hover:text-white transition-colors ${isRtl ? '' : 'rotate-180'}`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CoinShopModal isOpen={isShopModalOpen} onClose={() => setIsShopModalOpen(false)} />
      <VipSubscriptionModal isOpen={isVipModalOpen} onClose={() => setIsVipModalOpen(false)} />
      <ReferralHubModal isOpen={isRefModalOpen} onClose={() => setIsRefModalOpen(false)} />
    </div>
  );
}
