import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, X, Loader2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { haptics } from '../../utils/haptics';

const WaitingForOpponentOverlay = ({
  isVisible,
  roomCode,
  gameTitle,
  gameIcon,
  onCancel,
  onShareTelegram,
  shareLink,
  isRtl = true,
  colorMode = 'dark'
}) => {
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState('');

  // Handle loading dots animation
  useEffect(() => {
    let interval;
    if (isVisible) {
      interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isVisible]);

  const handleCopy = async () => {
    soundEngine?.play('click');
    haptics?.impact('light');
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleShare = () => {
    soundEngine?.play('click');
    haptics?.impact('light');
    if (onShareTelegram) {
      onShareTelegram();
    }
  };

  const handleCancel = () => {
    soundEngine?.play('click');
    haptics?.impact('medium');
    if (onCancel) {
      onCancel();
    }
  };

  // Translations
  const t = {
    waiting: isRtl ? 'منتظر ورود حریف' : 'Waiting for opponent',
    roomCode: isRtl ? 'کد اتاق:' : 'Room Code:',
    shareTelegram: isRtl ? 'ارسال لینک در تلگرام' : 'Share via Telegram',
    copyLink: isRtl ? 'کپی لینک' : 'Copy Link',
    copied: isRtl ? 'کپی شد!' : 'Copied!',
    cancel: isRtl ? 'لغو و بازگشت' : 'Cancel',
  };

  const isDark = colorMode === 'dark';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${
              isDark 
                ? 'bg-slate-900/95 border-amber-500/30 shadow-black/50' 
                : 'bg-white/95 border-amber-500/30 shadow-slate-300/50'
            }`}
          >
            {/* Background glowing effects */}
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl" />
            
            <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
              
              {/* Pulsing Icon */}
              <div className="relative mb-6">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className={`relative flex items-center justify-center w-24 h-24 rounded-full text-5xl border-2 ${
                    isDark ? 'bg-slate-800 border-amber-500/50' : 'bg-slate-50 border-amber-500/50'
                  }`}
                >
                  {gameIcon}
                </motion.div>
              </div>

              {/* Title & Game Name */}
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {gameTitle}
              </h2>
              
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-6">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t.waiting}<span className="inline-block w-4 text-left">{dots}</span>
                </p>
              </div>

              {/* Room Code Badge */}
              <div className={`mb-8 px-6 py-3 rounded-2xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.roomCode}
                </p>
                <p className="text-2xl font-mono font-bold tracking-widest text-amber-500">
                  {roomCode}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/25 active:scale-[0.98]"
                >
                  <Share2 className="w-5 h-5" />
                  {t.shareTelegram}
                </button>

                <button
                  onClick={handleCopy}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border-2 font-bold text-lg transition-all active:scale-[0.98] ${
                    copied
                      ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                      : isDark
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? t.copied : t.copyLink}
                </button>

                <button
                  onClick={handleCancel}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${
                    isDark 
                      ? 'text-rose-400 hover:bg-rose-500/10' 
                      : 'text-rose-500 hover:bg-rose-50'
                  }`}
                >
                  <X className="w-5 h-5" />
                  {t.cancel}
                </button>
              </div>
              
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WaitingForOpponentOverlay;
