import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Download, Copy, Check, Sparkles, Send, Trophy, Flame } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { shareToTelegram } from '../../utils/telegram';

export default function ShareStoryModal({
  isOpen,
  onClose,
  gameTitle = 'تخته نرد ایرانی',
  gameIcon = '🎲',
  resultHeadline = 'پیروزی قاطع و قهرمانانه!',
  scoreText = 'مارس ۲ - ۰',
  opponentName = 'حریف آنلاین',
  coinsWon = 400
}) {
  const { language, userProfile, userName } = useAppStore();
  const isRtl = language === 'fa';

  const [copied, setCopied] = useState(false);

  const myDisplayName = userProfile?.fullName || (userName && !userName.startsWith('کاربر ') ? userName : '') || (isRtl ? 'قهرمان چاژا' : 'Chazha Champion');
  const myAvatar = userProfile?.avatar || '👑';

  const shareText = `🔥 من در بازی «${gameTitle}» در چاژا با نتیجه ${scoreText} برنده شدم! اگر جرأت داری بیا تو تلگرام با من مسابقه بده:
https://t.me/chazha_bot?start=challenge`;

  const handleShareTelegram = () => {
    // Attempt Telegram WebApp 7.8+ shareToStory if available
    try {
      if (window.Telegram?.WebApp?.shareToStory) {
        // Can share media or fallback
      }
    } catch (_) {}

    shareToTelegram(shareText);
    soundEngine.playTap?.();
    haptics.notification?.('success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    soundEngine.playCheckmark?.();
    haptics.notification?.('success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-slate-950 border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col p-4 text-center items-center relative overflow-hidden"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black">
                  <Share2 size={16} />
                </div>
                <div className="text-start">
                  <h3 className="text-xs font-black text-white">
                    {isRtl ? 'کارت استوری و افتخار تلگرام' : 'Telegram Story & Challenge Card'}
                  </h3>
                  <p className="text-[9px] text-amber-300 font-bold">
                    {isRtl ? 'آماده برای استوری و اشتراک با دوستان' : 'Ready for Stories and Sharing'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* 9:16 Vertical Story Card Preview */}
            <div className="w-full aspect-[9/14] rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-2 border-amber-400/60 p-4 flex flex-col justify-between items-center shadow-2xl relative overflow-hidden my-2 select-none">
              {/* Decorative Glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Story Header */}
              <div className="w-full flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">👑</span>
                  <span className="text-[11px] font-black text-amber-300 tracking-wider">CHAZHA • چاژا</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                  #WINNER
                </span>
              </div>

              {/* Trophy & Result Center */}
              <div className="flex flex-col items-center space-y-2 z-10 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-2 border-white shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-center text-3xl">
                  {gameIcon}
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wide block">
                    {gameTitle}
                  </span>
                  <h4 className="text-base font-black text-white drop-shadow">
                    {resultHeadline}
                  </h4>
                </div>

                <div className="px-4 py-1.5 rounded-2xl bg-black/60 border border-amber-400/40 text-amber-300 font-black text-sm tracking-wider font-mono">
                  {scoreText}
                </div>

                {/* Matchup Badges */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex flex-col items-center">
                    <span className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xl shadow">
                      {myAvatar}
                    </span>
                    <span className="text-[10px] font-black text-white mt-1 max-w-[80px] truncate">{myDisplayName}</span>
                    <span className="text-[8px] text-emerald-400 font-bold">{isRtl ? 'برنده' : 'Winner'}</span>
                  </div>

                  <span className="text-sm font-black text-slate-500 font-mono">VS</span>

                  <div className="flex flex-col items-center">
                    <span className="w-10 h-10 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-xl shadow opacity-70">
                      👤
                    </span>
                    <span className="text-[10px] font-black text-slate-300 mt-1 max-w-[80px] truncate">{opponentName}</span>
                    <span className="text-[8px] text-rose-400 font-bold">{isRtl ? 'بازنده' : 'Defeated'}</span>
                  </div>
                </div>

                {coinsWon > 0 && (
                  <div className="flex items-center gap-1 text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 mt-1">
                    <span>+{coinsWon}</span>
                    <span>🪙 سکه جایزه برد</span>
                  </div>
                )}
              </div>

              {/* Story Footer QR / Challenge link */}
              <div className="w-full pt-2 border-t border-white/10 flex items-center justify-between z-10">
                <span className="text-[9px] text-slate-400 font-bold">
                  {isRtl ? 'بیا تو تلگرام با من مسابقه بده ⚔️' : 'Challenge me on Telegram ⚔️'}
                </span>
                <span className="text-[9px] font-mono text-amber-300 font-bold">@chazha_bot</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 mt-2">
              <button
                onClick={handleShareTelegram}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 text-white font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>{isRtl ? '📸 اشتراک‌گذاری در استوری و چت تلگرام' : '📸 Share to Telegram Story & Chats'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                <span>{copied ? (isRtl ? 'کپی شد ✓' : 'Copied ✓') : (isRtl ? 'کپی متن چالش مسابقه' : 'Copy Challenge Text')}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
