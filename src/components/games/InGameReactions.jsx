import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, X } from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import useMultiplayerStore from '../../store/multiplayerStore';

export const TRASH_TALK_ITEMS = [
  { id: 'tomato', emoji: '🍅', label: 'پرتاب گوجه!' },
  { id: 'laugh', emoji: '😂', label: 'خنده تمسخر' },
  { id: 'fire', emoji: '🔥', label: 'رو آتیشم!' },
  { id: 'crown', emoji: '👑', label: 'پادشاه منم' },
  { id: 'poop', emoji: '💩', label: 'خراب کردی' },
  { id: 'applause', emoji: '👏', label: 'دمت گرم' },
  { id: 'rocket', emoji: '🚀', label: 'پرواز کردیم' },
  { id: 'crying', emoji: '😭', label: 'گریه نکن' }
];

export const QUICK_VOICE_PHRASES = [
  'عجب حرکتی زدم! 👑',
  'این دست مال منه! 🔥',
  'حواست کجاست رفیق؟ 😂',
  'شانس آوردی ها! 🍀',
  'دمت گرم، بازی قشنگی بود 👏',
  'تاس/کارت بهت ساخت! 🎲'
];

export default function InGameReactions({ onSendPhrase }) {
  const [isOpen, setIsOpen] = useState(false);
  const { sendInGameReaction, activeGameReaction } = useMultiplayerStore();

  const handleSendReaction = (item) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    sendInGameReaction({
      type: 'emoji',
      emoji: item.emoji,
      label: item.label
    });
    setIsOpen(false);
  };

  const handleSendPhrase = (phrase) => {
    soundEngine.playMessageChime?.();
    haptics.tap?.();
    sendInGameReaction({
      type: 'phrase',
      phrase
    });
    if (onSendPhrase) onSendPhrase(phrase);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-2xl bg-black/50 border border-white/20 text-yellow-400 hover:text-white shadow-lg active:scale-95 transition-all backdrop-blur-md flex items-center gap-1 text-xs font-black"
        >
          <Smile size={18} />
          <span className="hidden sm:inline">کل‌کل</span>
        </button>

        {/* Reaction Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-12 left-0 z-50 w-64 p-3 rounded-3xl bg-slate-900/95 border border-purple-500/40 shadow-2xl backdrop-blur-xl space-y-2 text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-xs font-black text-amber-300">🎭 کری‌خوانی و ایموجی زنده</span>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>

              {/* Emojis Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {TRASH_TALK_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSendReaction(item)}
                    title={item.label}
                    className="p-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-90 transition-all text-xl flex flex-col items-center"
                  >
                    <span>{item.emoji}</span>
                  </button>
                ))}
              </div>

              {/* Quick Phrases */}
              <div className="space-y-1 pt-1 border-t border-white/10 max-h-36 overflow-y-auto no-scrollbar">
                {QUICK_VOICE_PHRASES.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPhrase(phrase)}
                    className="w-full text-right p-1.5 rounded-xl bg-white/5 hover:bg-purple-500/20 text-[11px] text-slate-200 hover:text-purple-300 transition-all truncate font-bold"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Screen Blast Animation */}
      <AnimatePresence>
        {activeGameReaction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.2, y: 50 }}
            animate={{ opacity: 1, scale: 1.3, y: 0 }}
            exit={{ opacity: 0, scale: 1.8, y: -50 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="p-5 rounded-3xl bg-black/80 border-2 border-amber-400/60 shadow-2xl backdrop-blur-md flex flex-col items-center gap-2 max-w-xs text-center">
              {activeGameReaction.type === 'emoji' ? (
                <>
                  <span className="text-6xl animate-bounce">{activeGameReaction.emoji}</span>
                  <span className="text-sm font-black text-amber-300">
                    {activeGameReaction.senderAvatar} {activeGameReaction.senderName}: {activeGameReaction.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl">📢</span>
                  <span className="text-base font-black text-white px-2">
                    {activeGameReaction.phrase}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    از طرف {activeGameReaction.senderAvatar} {activeGameReaction.senderName}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
