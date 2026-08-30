import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Plus, Star, Heart, Compass, Shield, Sun } from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { getDailyGodItem, DIVINE_CONCEPTS_DAILY_100, GOD_LUMINARY_QUOTES_100 } from '../../data/godCorridorData';

export default function GodHeroCard({ isRtl, isPinned, onTogglePin, onEnter }) {
  const dailyConcept = getDailyGodItem(DIVINE_CONCEPTS_DAILY_100);
  const dailyQuote = getDailyGodItem(GOD_LUMINARY_QUOTES_100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.35 }}
      className="relative p-6 sm:p-7 mb-4 rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.25)] bg-gradient-to-br from-amber-950/50 via-[#181126] to-indigo-950/60 text-start group"
    >
      {/* Background Divine Stars & Radial Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-yellow-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 15% 20%, #fef08a 0%, transparent 100%),
              radial-gradient(1px 1px at 40% 40%, #fbbf24 0%, transparent 100%),
              radial-gradient(2px 2px at 70% 25%, #fde047 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 85% 75%, #fef08a 0%, transparent 100%),
              radial-gradient(1px 1px at 30% 80%, #fbbf24 0%, transparent 100%)
            `
          }}
        />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black shadow-sm">
            <span className="text-base animate-spin" style={{ animationDuration: '8s' }}>✨</span>
            <span>{isRtl ? 'راه‌روی برتر و قدسی' : 'Supreme Celestial Realm'}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-black">
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-amber-200 border border-amber-500/30">
              {isRtl ? '۷ گام الهی' : '7 Divine Steps'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-400/40 font-mono">
              +100 XP 💎
            </span>
          </div>
        </div>

        {/* Title & Ethereal Icon */}
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 flex items-center gap-2.5">
              <span>☀️</span>
              <span>{isRtl ? 'راه‌روی خدا (GOD)' : 'Realm of GOD (خدا)'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 font-medium mt-1 leading-relaxed max-w-xl">
              {isRtl
                ? 'سفر روزانه هفت‌گانه برای اتصال قلبی با پروردگار، شناخت صفات حق در ادیان، حکمت مشاهیر، شکرگزاری عمیق و ادراک حضور دائمی او.'
                : 'A daily 7-step sacred journey to connect with the Divine, explore world religious attributes, luminary wisdom, deep gratitude & omnipresence.'}
            </p>
          </div>

          {/* Golden Sun / Sacred Mandala Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.5)] shrink-0 group-hover:rotate-12 transition-transform duration-500">
            ☀️
          </div>
        </div>

        {/* Daily Highlight Teaser Box */}
        <div className="p-3.5 rounded-2xl bg-black/35 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">📜</span>
            <div className="min-w-0">
              <span className="text-[10px] text-amber-300/80 font-bold block">
                {isRtl ? `حکمت امروز: ${dailyConcept?.titleFa || 'نور الانوار'}` : `Today's Wisdom: ${dailyConcept?.titleEn || 'The Light'}`}
              </span>
              <p className="text-xs text-slate-200 truncate italic">
                {isRtl ? dailyQuote?.quoteFa : dailyQuote?.quoteEn}
              </p>
            </div>
          </div>

          <span className="text-[10px] text-amber-400 font-bold shrink-0 self-end sm:self-center">
            {isRtl ? `— ${dailyQuote?.authorFa}` : `— ${dailyQuote?.authorEn}`}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin?.();
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className={`py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md border shrink-0 ${
              isPinned
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-black/30 border-amber-400/40 text-amber-200 hover:bg-amber-500/20 hover:border-amber-400'
            }`}
          >
            {isPinned ? (
              <>
                <Check size={16} className="text-emerald-400" />
                <span>{isRtl ? 'در امروز من ✓' : 'In My Day'}</span>
              </>
            ) : (
              <>
                <Plus size={16} className="text-amber-300" />
                <span>{isRtl ? 'افزودن به امروز من' : 'Add to My Day'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playDivineChime?.();
              haptics.success?.();
              onEnter?.();
            }}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-98 transition-all"
          >
            <span>{isRtl ? 'ورود به راه‌روی خدا (۷ گام الهی)' : 'Enter Realm of GOD (7 Steps)'}</span>
            <ArrowRight size={15} className={isRtl ? 'rotate-180 text-slate-950' : 'text-slate-950'} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
