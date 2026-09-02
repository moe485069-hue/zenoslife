import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Flame, Moon, Star, Award, Shield, Target } from 'lucide-react';
import useAppStore from '../../store/appStore';

// Achievement definitions catalog
export const GAME_ACHIEVEMENTS = {
  first_game:       { icon: '🎮', nameFa: 'اولین بازی!',        nameEn: 'First Game!',       descFa: 'اولین بازی‌ات رو انجام دادی',     descEn: 'Played your very first game',       color: 'from-emerald-500 to-teal-600',    rarity: 'common' },
  first_win:        { icon: '🏆', nameFa: 'اولین پیروزی!',      nameEn: 'First Victory!',    descFa: 'اولین برد تاریخی',                 descEn: 'Won your very first match',         color: 'from-amber-500 to-yellow-600',    rarity: 'common' },
  hat_trick:        { icon: '🔥', nameFa: 'هت‌تریک طلایی!',    nameEn: 'Hat Trick!',        descFa: '۳ برد پیاپی بدون توقف',           descEn: '3 wins in a row',                  color: 'from-orange-500 to-red-600',      rarity: 'rare' },
  five_streak:      { icon: '⚡', nameFa: 'صاعقه پنج‌گانه!',   nameEn: 'Five Streak!',      descFa: '۵ برد متوالی — تسلط کامل',        descEn: '5 consecutive wins — true mastery', color: 'from-yellow-400 to-orange-500',   rarity: 'rare' },
  ten_wins:         { icon: '💫', nameFa: 'ده‌گانه طلایی!',    nameEn: 'Ten Wins!',         descFa: '۱۰ پیروزی در کارنامه‌ات',         descEn: '10 total wins on record',           color: 'from-sky-500 to-blue-600',        rarity: 'rare' },
  fifty_wins:       { icon: '👑', nameFa: 'پادشاه بازی‌ها!',   nameEn: 'Game King!',        descFa: '۵۰ برد — یک افسانه زنده!',        descEn: '50 wins — a living legend!',        color: 'from-purple-500 to-violet-700',   rarity: 'epic' },
  century:          { icon: '💎', nameFa: 'صد تایی!',           nameEn: 'Century!',          descFa: '۱۰۰ بازی انجام شده — ماندگار',   descEn: '100 games played — immortalized',   color: 'from-pink-500 to-rose-600',       rarity: 'epic' },
  lightning_win:    { icon: '⚡', nameFa: 'برق‌آسا!',           nameEn: 'Lightning Fast!',   descFa: 'برد در کمتر از ۵ دقیقه',          descEn: 'Won a match in under 5 minutes',    color: 'from-cyan-400 to-blue-500',       rarity: 'rare' },
  night_owl:        { icon: '🦉', nameFa: 'جغد شب!',            nameEn: 'Night Owl!',        descFa: 'بازی در ساعت ۱۲ شب تا ۴ صبح',   descEn: 'Played between midnight & 4am',    color: 'from-indigo-500 to-purple-700',   rarity: 'common' },
  legendary_streak: { icon: '🌌', nameFa: 'افسانه کیهانی!',    nameEn: 'Cosmic Legend!',    descFa: '۱۰ برد متوالی — غیر قابل توقف', descEn: '10 win streak — unstoppable',       color: 'from-amber-400 to-rose-500',      rarity: 'legendary' },
};

const RARITY_COLORS = {
  common:    'border-slate-400 bg-slate-700/30',
  rare:      'border-blue-400 bg-blue-900/30',
  epic:      'border-purple-400 bg-purple-900/30',
  legendary: 'border-amber-400 bg-amber-900/30 shadow-lg shadow-amber-500/30',
};

const RARITY_LABEL = {
  common:    { fa: 'عادی',    en: 'Common' },
  rare:      { fa: 'نادر',    en: 'Rare' },
  epic:      { fa: 'حماسی',  en: 'Epic' },
  legendary: { fa: 'افسانه', en: 'Legendary' },
};

/**
 * AchievementToast — pops up from the bottom when a new achievement is granted.
 * Mount once in App.jsx or a layout wrapper.
 */
export default function AchievementToast() {
  const { pendingAchievement, clearPendingAchievement, language } = useAppStore();
  const isRtl = language === 'fa';

  const achievement = pendingAchievement ? GAME_ACHIEVEMENTS[pendingAchievement] : null;

  useEffect(() => {
    if (!achievement) return;
    const t = setTimeout(() => clearPendingAchievement(), 4000);
    return () => clearTimeout(t);
  }, [achievement]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={pendingAchievement}
          initial={{ y: 120, opacity: 0, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          onClick={clearPendingAchievement}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] cursor-pointer w-[90vw] max-w-sm"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div className={`rounded-2xl border-2 backdrop-blur-xl p-3.5 flex items-center gap-3.5 shadow-2xl ${RARITY_COLORS[achievement.rarity]}`}>
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center text-3xl shadow-lg shrink-0`}>
              {achievement.icon}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r ${achievement.color} text-white`}>
                  {isRtl ? '🏅 دستاورد جدید' : '🏅 Achievement Unlocked'}
                </span>
                <span className="text-[9px] text-slate-400 font-bold">
                  {isRtl ? RARITY_LABEL[achievement.rarity].fa : RARITY_LABEL[achievement.rarity].en}
                </span>
              </div>
              <h4 className="text-sm font-black text-white truncate">
                {isRtl ? achievement.nameFa : achievement.nameEn}
              </h4>
              <p className="text-[11px] text-slate-300 font-medium line-clamp-1 mt-0.5">
                {isRtl ? achievement.descFa : achievement.descEn}
              </p>
            </div>

            {/* Shimmer pulse */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="shrink-0"
            >
              <Star size={18} className="text-amber-400" fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
