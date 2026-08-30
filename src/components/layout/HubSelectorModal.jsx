import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Flame, Gamepad2, MessagesSquare, X, ChevronRight, 
  Sparkles, Users, Trophy, Target, ArrowLeft, Heart, Zap
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function HubSelectorModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAppStore();
  const isRtl = language === 'fa';
  const currentPath = location.pathname;

  const handleSelect = (path) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  const HUB_CARDS = [
    {
      id: 'my-day',
      titleFa: 'امروز من',
      titleEn: 'My Day',
      subtitleFa: 'داشبورد روزانه، پومودورو، عادت‌ها و راهروهای رشد',
      subtitleEn: 'Daily dashboard, Pomodoro, habits & life paths',
      tagFa: 'فرماندهی روز 🔥',
      tagEn: 'Active Dashboard',
      icon: <Flame size={32} className="text-emerald-400" />,
      path: '/my-day',
      gradient: 'from-emerald-950/60 via-emerald-900/30 to-teal-950/50',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      glow: 'shadow-emerald-500/10',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accentColor: 'text-emerald-400',
      active: currentPath === '/my-day'
    },
    {
      id: 'games',
      titleFa: 'بازی و سرگرمی',
      titleEn: 'Games & Fun',
      subtitleFa: 'منچ، تخته‌نرد، شطرنج، تتریس و رقابت دونفره و آنلاین',
      subtitleEn: 'Ludo, Backgammon, Chess, Tetris & Online matches',
      tagFa: '۱۰+ بازی جذاب 🎮',
      tagEn: '10+ Games',
      icon: <Gamepad2 size={32} className="text-rose-400" />,
      path: '/games',
      gradient: 'from-rose-950/60 via-fuchsia-900/30 to-purple-950/50',
      border: 'border-rose-500/40 hover:border-rose-400',
      glow: 'shadow-rose-500/10',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      accentColor: 'text-rose-400',
      active: currentPath === '/games'
    },
    {
      id: 'chat',
      titleFa: 'چت، گفت‌وگو و دوستیابی',
      titleEn: 'Chat & Community',
      subtitleFa: 'چت‌روم‌های زنده، پیام خصوصی و یافتن همراهان هم‌فرکانس',
      subtitleEn: 'Live chat rooms, private DMs & like-minded friends',
      tagFa: 'لابی و دوستیابی 💬',
      tagEn: 'Live Sanctuary',
      icon: <MessagesSquare size={32} className="text-cyan-400" />,
      path: '/chat-rooms',
      gradient: 'from-cyan-950/60 via-blue-900/30 to-indigo-950/50',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      glow: 'shadow-cyan-500/10',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      accentColor: 'text-cyan-400',
      active: currentPath === '/chat-rooms'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl overflow-hidden p-6 z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-cyan-500/20 border border-amber-500/30 text-amber-400">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)]">
                  {isRtl ? 'هاب ۳ گانه زنوسلایف' : 'ZenOsLife Main Hub'}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  {isRtl ? 'انتخاب بخش مورد نظر برای ادامه:' : 'Select your destination:'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-[var(--bg-secondary)] hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-colors"
              title={isRtl ? 'بستن' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>

          {/* 3 Luxury Cards List */}
          <div className="mt-5 space-y-3.5 overflow-y-auto pr-0.5">
            {HUB_CARDS.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => handleSelect(card.path)}
                className={`group relative p-4.5 rounded-3xl border-2 transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.98] bg-gradient-to-br ${card.gradient} ${card.border} ${card.glow} ${
                  card.active ? 'ring-2 ring-white/30 scale-[1.01]' : 'hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Left: Icon Badge */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>

                  {/* Center: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors truncate">
                        {isRtl ? card.titleFa : card.titleEn}
                      </h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                        {isRtl ? card.tagFa : card.tagEn}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {isRtl ? card.subtitleFa : card.subtitleEn}
                    </p>
                  </div>

                  {/* Right: Arrow Action */}
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/20 transition-colors text-slate-200">
                    {isRtl ? <ChevronRight size={18} className="rotate-180" /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {card.active && (
                  <div className="absolute top-2 left-3 text-[9px] font-black text-amber-400 bg-black/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                    {isRtl ? 'صفحه فعلی' : 'Current'}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Bottom quick indicator */}
          <div className="mt-4 text-center">
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              {isRtl ? '🌟 دسترسی آنی به تمام جهان‌های زنوسلایف در هر لحظه' : '🌟 Instant access to all dimensions'}
            </span>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
