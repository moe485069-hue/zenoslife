import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Flame, Check } from 'lucide-react';
import useAppStore from '../../store/appStore';

export default function LevelUpModal() {
  const { levelUpModal, closeLevelUpModal, language, getLevelTitle } = useAppStore();
  const isRtl = language === 'fa';

  if (!levelUpModal.isOpen) return null;

  const newTitle = getLevelTitle(levelUpModal.newLevel);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          className="glass-card w-full max-w-sm p-7 rounded-3xl relative text-center border-2 border-[var(--warning)] overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Glowing Aura */}
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-[var(--warning)]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-[var(--accent)]/20 blur-3xl pointer-events-none" />

          {/* Trophy Icon with Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-xl text-white text-4xl border-2 border-yellow-200/50"
          >
            🏆
          </motion.div>

          <h2 className="text-2xl font-black mb-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            {isRtl ? 'ارتقای سطح شگفت‌انگیز!' : 'LEVEL UP!'}
          </h2>

          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
            {isRtl ? `شما به سطح ${levelUpModal.newLevel} رسیدید` : `You reached Level ${levelUpModal.newLevel}`}
          </p>

          {/* Title Badge */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--warning)]/40 mb-6 inline-block w-full">
            <span className="text-xs uppercase tracking-wider block font-bold text-[var(--warning)] mb-1">
              {isRtl ? 'عنوان جدید کسب‌شده' : 'New Title Unlocked'}
            </span>
            <span className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
              ✨ {newTitle} ✨
            </span>
          </div>

          <button
            onClick={closeLevelUpModal}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-purple-600 text-white font-bold text-sm shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check size={18} />
            {isRtl ? 'دریافت پاداش و ادامه' : 'Claim Reward & Continue'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
