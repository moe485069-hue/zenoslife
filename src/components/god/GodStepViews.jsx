import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RefreshCw, Bookmark, Volume2, Copy, Check, Heart, Shield,
  Sun, Compass, MessageSquare, Play, Pause, RotateCcw, Award, CheckCircle2,
  Search, BookOpen, Send, Feather, Eye, Star, ChevronDown, ChevronUp,
  Layers, Waves, Mic, Radio, Zap, HelpCircle
} from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { db, getToday } from '../../db/database';
import {
  GOD_ATTRIBUTES_BY_RELIGION,
  GOD_FEATURED_ATTRIBUTES_100,
  DIVINE_CONCEPTS_DAILY_100,
  GOD_LUMINARY_QUOTES_100,
  DIVINE_PLEASING_DEEDS_100,
  DIVINE_PRACTICES_LIST,
  GOD_OMNIPRESENCE_100,
  getDailyGodItem
} from '../../data/godCorridorData';

// ─────────────────────────────────────────────
// STEP 1: ATTRIBUTES OF GOD IN WORLD RELIGIONS (FEATURED CARD + COMPREHENSIVE VAULT)
// ─────────────────────────────────────────────
export function GodStep1Attributes({ isRtl, learningVault, onToggleVault }) {
  const [shuffleOffset, setShuffleOffset] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedTraditionId, setSelectedTraditionId] = useState('islam');
  const [searchQuery, setSearchQuery] = useState('');

  // Daily / Shuffled Featured Attribute
  const featuredAttr = getDailyGodItem(GOD_FEATURED_ATTRIBUTES_100, shuffleOffset);
  const isFeaturedSaved = (learningVault || []).some(v => v.phrase === featuredAttr?.nameFa || v.phrase === featuredAttr?.nameEn);

  // Gallery Tradition and Attributes
  const currentTradition = GOD_ATTRIBUTES_BY_RELIGION.find(t => t.id === selectedTraditionId) || GOD_ATTRIBUTES_BY_RELIGION[0];
  const filteredAttributes = currentTradition.keyAttributes.filter(attr => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      attr.nameFa.toLowerCase().includes(q) ||
      attr.nameEn.toLowerCase().includes(q) ||
      attr.meaningFa.toLowerCase().includes(q) ||
      attr.meaningEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 py-1 text-start">
      
      {/* ── 1. TOP CONTROLS & TRADITION BADGE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/40 shadow-sm self-start">
          <span className="text-base">{featuredAttr.icon}</span>
          <span>{isRtl ? featuredAttr.traditionFa : featuredAttr.traditionEn}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Shuffle Attribute Button */}
          <button
            onClick={() => {
              setShuffleOffset(prev => prev + 1);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-slate-200 hover:border-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={13} />
            <span>{isRtl ? 'صفت دیگر 🎲' : 'Shuffle'}</span>
          </button>

          {/* Bookmark / Save Button */}
          <button
            onClick={() => onToggleVault?.({
              id: `god_attr_${featuredAttr.id}_${Date.now()}`,
              phrase: isRtl ? featuredAttr.nameFa : featuredAttr.nameEn,
              authorFa: featuredAttr.traditionFa,
              authorEn: featuredAttr.traditionEn,
              meaningFa: featuredAttr.meaningFa,
              meaningEn: featuredAttr.meaningEn,
              contextFa: featuredAttr.lifeReflectionFa,
              categoryFa: 'صفات و اسماء پروردگار',
              categoryEn: 'Divine Attributes',
              type: 'divine_attribute'
            })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isFeaturedSaved
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                : 'bg-white/10 border-white/15 text-slate-300 hover:text-amber-300 hover:border-amber-400'
            }`}
          >
            <Bookmark size={13} className={isFeaturedSaved ? 'fill-amber-400 text-amber-400' : ''} />
            <span>{isFeaturedSaved ? (isRtl ? 'در گنجینه ✓' : 'In Vault') : (isRtl ? 'ذخیره 💎' : 'Save')}</span>
          </button>

          {/* Divine Chime Tone */}
          <button
            onClick={() => {
              soundEngine.playDivineChime?.();
              haptics.success?.();
            }}
            className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 hover:bg-amber-500/25 transition-all"
            title={isRtl ? 'پخش نوای قدسی' : 'Play Tone'}
          >
            <Volume2 size={14} />
          </button>
        </div>
      </div>

      {/* ── 2. GRAND HERO HIGHLIGHT CARD (صفت برجسته روز) ── */}
      <motion.div
        key={featuredAttr.id}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-950/60 via-black/80 to-yellow-950/40 border-2 border-amber-400/50 shadow-2xl space-y-4 relative overflow-hidden text-start"
      >
        {/* Divine Ambient Aura */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title */}
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] text-amber-300/80 font-bold block uppercase tracking-wider">
            {isRtl ? 'صفت قدسی و نام متبرک پروردگار:' : 'Featured Sacred Attribute:'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300">
            {isRtl ? featuredAttr.nameFa : featuredAttr.nameEn}
          </h2>
          <span className="text-xs text-amber-300/70 font-mono block">
            {featuredAttr.nameEn}
          </span>
        </div>

        {/* Meaning Box */}
        <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 space-y-1.5 relative z-10">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <span>✨</span>
            <span>{isRtl ? 'معنا و راز باطنی صفت:' : 'Spiritual Meaning:'}</span>
          </span>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
            {isRtl ? featuredAttr.meaningFa : featuredAttr.meaningEn}
          </p>
        </div>

        {/* Practical Life Embodiment Box */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/35 space-y-1.5 relative z-10">
          <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
            <span>💡</span>
            <span>{isRtl ? 'راهکار تجلی این صفت در رفتار امروز من:' : 'How to Embody This Divine Virtue Today:'}</span>
          </span>
          <p className="text-xs text-emerald-100 leading-relaxed font-bold">
            {isRtl ? featuredAttr.lifeReflectionFa : featuredAttr.lifeReflectionEn}
          </p>
        </div>
      </motion.div>

      {/* ── 3. EXPANDABLE COMPREHENSIVE WORLD GALLERY (مشاهده تمام صفات ادیان) ── */}
      <div className="space-y-3 pt-1">
        <button
          onClick={() => {
            setIsGalleryOpen(!isGalleryOpen);
            soundEngine.playTap?.();
            haptics.tap?.();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-black/35 border border-white/15 hover:border-amber-400/40 text-slate-200 text-xs font-bold flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2">
            <span>🏛️</span>
            <span>{isRtl ? 'گالری جامع تمام صفات و اسماء در ادیان جهان (مشاهده همه)' : 'Explore All Traditions & Full Attributes Gallery'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <span className="text-[11px]">{isGalleryOpen ? (isRtl ? 'بستن گالری' : 'Collapse') : (isRtl ? 'گشودن' : 'Open')}</span>
            {isGalleryOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </button>

        <AnimatePresence>
          {isGalleryOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 overflow-hidden pt-2"
            >
              {/* Tradition Horizontal Selector */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {GOD_ATTRIBUTES_BY_RELIGION.map(trad => {
                  const isSel = trad.id === selectedTraditionId;
                  return (
                    <button
                      key={trad.id}
                      onClick={() => {
                        setSelectedTraditionId(trad.id);
                        soundEngine.playTap?.();
                        haptics.tap?.();
                      }}
                      className={`px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                        isSel
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                          : 'bg-black/30 border-white/10 text-slate-300 hover:border-amber-400/40 hover:text-amber-200'
                      }`}
                    >
                      <span>{trad.icon}</span>
                      <span>{isRtl ? trad.traditionFa : trad.traditionEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tradition Summary Card */}
              <div className={`p-4 rounded-3xl border bg-gradient-to-br ${currentTradition.color} space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentTradition.icon}</span>
                    <h3 className="font-black text-sm text-white">
                      {isRtl ? currentTradition.traditionFa : currentTradition.traditionEn}
                    </h3>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/40 text-amber-200 border border-amber-500/20 font-bold">
                    {currentTradition.keyAttributes.length} {isRtl ? 'صفت' : 'Attributes'}
                  </span>
                </div>
                <p className="text-xs text-slate-100 leading-relaxed font-medium">
                  {isRtl ? currentTradition.summaryFa : currentTradition.summaryEn}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'جستجو در صفات این آیین...' : 'Search attributes...'}
                  className="w-full px-3.5 py-2 pl-9 rounded-2xl bg-black/30 border border-white/10 text-xs text-slate-100 outline-none focus:border-amber-400 placeholder:text-slate-500"
                />
                <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'left-3' : 'right-3'}`} />
              </div>

              {/* Grid of Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredAttributes.map((attr, idx) => {
                  const isAttrSaved = (learningVault || []).some(v => v.phrase === attr.nameFa || v.phrase === attr.nameEn);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/25 hover:border-amber-400/50 space-y-2 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                          <span>✨</span>
                          <span>{isRtl ? attr.nameFa : attr.nameEn}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onToggleVault?.({
                              id: `god_attr_${selectedTraditionId}_${idx}`,
                              phrase: isRtl ? attr.nameFa : attr.nameEn,
                              authorFa: currentTradition.traditionFa,
                              authorEn: currentTradition.traditionEn,
                              meaningFa: attr.meaningFa,
                              meaningEn: attr.meaningEn,
                              contextFa: attr.reflectionFa,
                              categoryFa: 'صفات و اسماء پروردگار',
                              categoryEn: 'Divine Attributes',
                              type: 'divine_attribute'
                            })}
                            className={`p-1.5 rounded-xl border transition-colors ${
                              isAttrSaved ? 'bg-amber-500/30 border-amber-400 text-amber-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-amber-300'
                            }`}
                            title={isAttrSaved ? (isRtl ? 'در گنجینه است' : 'In Vault') : (isRtl ? 'ذخیره' : 'Save')}
                          >
                            <Bookmark size={12} className={isAttrSaved ? 'fill-amber-400 text-amber-400' : ''} />
                          </button>

                          <button
                            onClick={() => {
                              soundEngine.playDivineChime?.();
                              haptics.tap?.();
                            }}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors"
                          >
                            <Volume2 size={12} />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                        {isRtl ? attr.meaningFa : attr.meaningEn}
                      </p>

                      {attr.reflectionFa && (
                        <p className="text-[10px] text-emerald-300/90 font-medium pt-1 border-t border-white/5">
                          💡 {isRtl ? attr.reflectionFa : attr.reflectionEn}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 2: CONCEPT OF GOD ACROSS TRADITIONS (DYNAMIC ROTATING)
// ─────────────────────────────────────────────
export function GodStep2Concepts({ isRtl, learningVault, onToggleVault }) {
  const [shuffleOffset, setShuffleOffset] = useState(0);
  const concept = getDailyGodItem(DIVINE_CONCEPTS_DAILY_100, shuffleOffset);
  const isSaved = (learningVault || []).some(v => v.phrase === concept?.titleFa || v.phrase === concept?.titleEn);

  return (
    <div className="space-y-4 py-1 text-start">
      {/* Controls: Shuffle & Save */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black border border-amber-500/30">
          <span>{concept.icon}</span>
          <span>{isRtl ? concept.traditionFa : concept.traditionEn}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShuffleOffset(prev => prev + 1);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-slate-200 hover:border-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={13} />
            <span>{isRtl ? 'آیین دیگر 🎲' : 'Shuffle'}</span>
          </button>

          <button
            onClick={() => onToggleVault?.({
              id: `god_concept_${concept.dayIndex}_${Date.now()}`,
              phrase: isRtl ? concept.titleFa : concept.titleEn,
              authorFa: concept.traditionFa,
              authorEn: concept.traditionEn,
              meaningFa: concept.coreInsightFa,
              meaningEn: concept.coreInsightEn,
              categoryFa: 'خداشناسی و معنویت',
              categoryEn: 'Divine Wisdom',
              type: 'divine_concept'
            })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                : 'bg-white/10 border-white/15 text-slate-300 hover:text-amber-300 hover:border-amber-400'
            }`}
          >
            <Bookmark size={13} className={isSaved ? 'fill-amber-400 text-amber-400' : ''} />
            <span>{isSaved ? (isRtl ? 'در گنجینه ✓' : 'In Vault') : (isRtl ? 'ذخیره 💎' : 'Save')}</span>
          </button>
        </div>
      </div>

      {/* Main Concept Card */}
      <motion.div
        key={concept.dayIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[var(--bg-card)] to-yellow-950/20 border-2 border-amber-500/40 shadow-xl space-y-4"
      >
        <div>
          <span className="text-[10px] text-amber-400 font-mono font-bold block">
            {concept.keyTermFa}
          </span>
          <h2 className="text-base sm:text-lg font-black text-amber-200 mt-0.5">
            {isRtl ? concept.titleFa : concept.titleEn}
          </h2>
        </div>

        {/* Core Insight Box */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-400/30 space-y-1">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <span>✨</span>
            <span>{isRtl ? 'بینش بنیادین و لبّ مطلب:' : 'Core Insight:'}</span>
          </span>
          <p className="text-xs sm:text-sm text-slate-100 font-bold leading-relaxed">
            {isRtl ? concept.coreInsightFa : concept.coreInsightEn}
          </p>
        </div>

        {/* Deep Explanation */}
        <div className="space-y-1.5">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <span>📖</span>
            <span>{isRtl ? 'شرح حکمت و بینش فلسفی:' : 'Philosophical Commentary:'}</span>
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {isRtl ? concept.deepExplanationFa : concept.deepExplanationEn}
          </p>
        </div>

        {/* Practical Lesson */}
        <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
          <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
            <span>🌱</span>
            <span>{isRtl ? 'کاربرد این مفهوم در زندگی روزمره شما:' : 'Daily Practical Application:'}</span>
          </span>
          <p className="text-xs text-emerald-100 font-bold leading-relaxed">
            {isRtl ? concept.practicalLessonFa : concept.practicalLessonEn}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 3: LUMINARY QUOTES ON GOD & COSMOS
// ─────────────────────────────────────────────
export function GodStep3Quotes({ isRtl, learningVault, onToggleVault }) {
  const [shuffleOffset, setShuffleOffset] = useState(0);
  const quote = getDailyGodItem(GOD_LUMINARY_QUOTES_100, shuffleOffset);
  const isSaved = (learningVault || []).some(v => v.phrase === quote?.quoteFa || v.phrase === quote?.quoteEn);

  return (
    <div className="space-y-4 py-1 text-start">
      {/* Controls: Shuffle & Save */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-amber-300/80 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          ✨ {isRtl ? quote.categoryFa : 'Sacred Wisdom'}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShuffleOffset(prev => prev + 1);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-slate-200 hover:border-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={13} />
            <span>{isRtl ? 'حکمت دیگر 🎲' : 'Shuffle'}</span>
          </button>

          <button
            onClick={() => onToggleVault?.({
              id: `god_quote_${quote.id}_${Date.now()}`,
              phrase: isRtl ? quote.quoteFa : quote.quoteEn,
              authorFa: quote.authorFa,
              authorEn: quote.authorEn,
              meaningFa: quote.commentaryFa,
              meaningEn: quote.sourceEn,
              categoryFa: 'سخنان مشاهیر درباره خدا',
              categoryEn: 'Quotes on the Divine',
              type: 'divine_quote'
            })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                : 'bg-white/10 border-white/15 text-slate-300 hover:text-amber-300 hover:border-amber-400'
            }`}
          >
            <Bookmark size={13} className={isSaved ? 'fill-amber-400 text-amber-400' : ''} />
            <span>{isSaved ? (isRtl ? 'در گنجینه ✓' : 'In Vault') : (isRtl ? 'ذخیره 💎' : 'Save')}</span>
          </button>
        </div>
      </div>

      {/* Quote Display Box */}
      <motion.div
        key={quote.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 via-black/60 to-amber-950/30 border-2 border-amber-400/40 shadow-2xl text-center space-y-4 relative"
      >
        <span className="text-3xl block">📜</span>

        <blockquote className="text-sm sm:text-base font-black text-amber-100 leading-loose italic">
          {isRtl ? quote.quoteFa : quote.quoteEn}
        </blockquote>

        <div className="pt-2 border-t border-amber-500/20 flex flex-col items-center gap-0.5">
          <span className="text-xs sm:text-sm font-black text-amber-300">
            — {isRtl ? quote.authorFa : quote.authorEn}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {isRtl ? quote.sourceFa : quote.sourceEn}
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed font-medium bg-black/40 p-3 rounded-2xl border border-white/10">
          💡 {isRtl ? quote.commentaryFa : 'A profound reflection on the divine harmony permeating science, arts, and universe.'}
        </p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 4: 3 SACRED GRATITUDES TO GOD & COSMOS
// ─────────────────────────────────────────────
export function GodStep4Gratitude({ isRtl, addXP, addCoins }) {
  const [gratitudes, setGratitudes] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);

  const placeholdersFa = [
    '۱. شکرگزاری برای نعمت حیات و تنفس در این روز زیبا...',
    '۲. قدردانی از یک تجربه، حضور عزیزان، یا درسی ارزشمند...',
    '۳. سپاس از محافظت پنهان و موهبت‌های جاری در زندگی‌ام...'
  ];

  const handleSave = async () => {
    const valid = gratitudes.filter(g => g.trim());
    if (valid.length === 0 || saved) return;

    try {
      const today = getToday();
      for (let text of valid) {
        await db.journalEntries.add({
          date: today,
          sectionId: 'mindfulness',
          content: `🙏 شکرگزاری از پروردگار و جهان هستی: ${text}`,
          mood: 'blessed',
          tags: ['خدا', 'شکرگزاری', 'God', 'Gratitude'],
          timestamp: new Date().toISOString()
        });
      }

      setSaved(true);
      soundEngine.playDivineChime?.();
      haptics.success?.();
      addXP?.(30, isRtl ? 'ثبت ۳ سپاسگزاری از پروردگار' : '3 Sacred Gratitudes');
      addCoins?.(15);
    } catch (err) {
      console.warn('Error saving gratitudes:', err);
    }
  };

  return (
    <div className="space-y-4 py-1 text-start">
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1">
        <h3 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
          <span>🙏</span>
          <span>{isRtl ? 'ثبت ۳ مورد قدردانی و شکرگزاری از خداوند و جهان هستی' : 'Record 3 Sacred Gratitudes to the Divine'}</span>
        </h3>
        <p className="text-xs text-slate-200 leading-relaxed">
          {isRtl
            ? 'شکرگزاری عمیق‌ترین مدار اتصال با جریان برکت کائنات است. ۳ موهبت یا نعمتی را که امروز در اعماق قلبت برای آنها سپاسگزاری بنویس:'
            : 'Gratitude is the highest frequency of connection. Write 3 blessings you deeply appreciate today:'}
        </p>
      </div>

      <div className="space-y-2.5">
        {gratitudes.map((val, idx) => (
          <div key={idx} className="relative">
            <span className="absolute top-3.5 right-3 text-xs text-amber-400 font-black">
              #{idx + 1}
            </span>
            <input
              type="text"
              value={val}
              onChange={e => {
                const next = [...gratitudes];
                next[idx] = e.target.value;
                setGratitudes(next);
              }}
              placeholder={isRtl ? placeholdersFa[idx] : `Gratitude #${idx + 1}...`}
              className="w-full px-8 py-3 rounded-2xl bg-black/40 border border-amber-500/30 text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-slate-500"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={gratitudes.every(g => !g.trim()) || saved}
        className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
          saved
            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
            : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-98 disabled:opacity-40'
        }`}
      >
        {saved ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
        <span>
          {saved
            ? (isRtl ? 'شکرگزاری‌ها در ژورنال ثبت شد 🌟 (+30 XP و +15 سکه)' : 'Gratitudes Saved! (+30 XP)')
            : (isRtl ? 'ثبت و تقدیم شکرگزاری به پیشگاه خداوند (+30 XP)' : 'Submit Sacred Gratitudes (+30 XP)')}
        </span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 5: WHAT PLEASES THE DIVINE (DAILY DEED)
// ─────────────────────────────────────────────
export function GodStep5PleasingDeeds({ isRtl, addXP, addCoins }) {
  const [shuffleOffset, setShuffleOffset] = useState(0);
  const [pledged, setPledged] = useState(false);

  const deed = getDailyGodItem(DIVINE_PLEASING_DEEDS_100, shuffleOffset);

  const handlePledge = () => {
    if (pledged) return;
    setPledged(true);
    soundEngine.playLevelUp?.();
    haptics.success?.();
    addXP?.(25, isRtl ? 'تعهد به عمل خشنودکننده خداوند' : 'Committed to Sacred Deed');
    addCoins?.(10);
  };

  return (
    <div className="space-y-4 py-1 text-start">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-emerald-300 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          🌿 {isRtl ? deed.categoryFa : 'Sacred Deed'}
        </span>

        <button
          onClick={() => {
            setShuffleOffset(prev => prev + 1);
            setPledged(false);
            soundEngine.playTap?.();
            haptics.tap?.();
          }}
          className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-slate-200 hover:border-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw size={13} />
          <span>{isRtl ? 'عمل دیگر 🎲' : 'Shuffle'}</span>
        </button>
      </div>

      <motion.div
        key={deed.dayIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-black/70 to-teal-950/30 border-2 border-emerald-500/40 shadow-xl space-y-4"
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">{deed.icon}</span>
          <div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold block">
              {isRtl ? `منبع: ${deed.sourceFa}` : deed.sourceEn}
            </span>
            <h3 className="text-sm sm:text-base font-black text-emerald-200 mt-0.5">
              {isRtl ? deed.titleFa : deed.titleEn}
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          {isRtl ? deed.explanationFa : deed.explanationEn}
        </p>

        {/* Action Pledge Box */}
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 space-y-2">
          <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
            <span>🎯</span>
            <span>{isRtl ? 'تعهد اجرایی امروز شما:' : 'Today\'s Concrete Commitment:'}</span>
          </span>
          <p className="text-xs text-slate-100 font-bold leading-relaxed">
            {isRtl ? deed.actionPledgeFa : deed.actionPledgeEn}
          </p>

          <button
            onClick={handlePledge}
            className={`w-full mt-2 py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              pledged
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-98'
            }`}
          >
            {pledged ? <CheckCircle2 size={16} /> : <Check size={16} />}
            <span>
              {pledged
                ? (isRtl ? 'متعهد شدم ✔ (+25 XP و +10 سکه دریافت شد)' : 'Committed ✔ (+25 XP Earned)')
                : (isRtl ? 'می‌پذیرم و متعهد می‌شوم امروز این نیکی را انجام دهم (+25 XP)' : 'I commit to this divine deed today (+25 XP)')}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 6: SPIRITUAL CONNECTION PRACTICES (UPGRADED RANDOM + INTERACTIVE STUDIO)
// ─────────────────────────────────────────────
export function GodStep6Practice({ isRtl, addXP, learningVault, onToggleVault }) {
  const [practiceShuffleOffset, setPracticeShuffleOffset] = useState(0);
  const [selectedPracticeId, setSelectedPracticeId] = useState(null);

  // Active Practice Selection
  const currentPractice = selectedPracticeId
    ? DIVINE_PRACTICES_LIST.find(p => p.id === selectedPracticeId) || DIVINE_PRACTICES_LIST[0]
    : getDailyGodItem(DIVINE_PRACTICES_LIST, practiceShuffleOffset);

  const isPracticeSaved = (learningVault || []).some(v => v.phrase === currentPractice?.nameFa || v.phrase === currentPractice?.nameEn);

  // 1. Light Meditation Timer
  const [meditationTimer, setMeditationTimer] = useState(180);
  const [isMedRunning, setIsMedRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); // 'inhale' | 'hold' | 'exhale'

  // 2. Dhikr Counter
  const [dhikrCount, setDhikrCount] = useState(0);
  const [selectedMantraIdx, setSelectedMantraIdx] = useState(0);

  // 3. Silence Timer
  const [silenceTimer, setSilenceTimer] = useState(120);
  const [isSilenceRunning, setIsSilenceRunning] = useState(false);

  // 4. Surrender State
  const [surrenderText, setSurrenderText] = useState('');
  const [isSurrendered, setIsSurrendered] = useState(false);

  // 5. 528Hz Solfeggio Audio Player State
  const [is528Running, setIs528Running] = useState(false);

  // 6. Nature Reflection Checklist State
  const [natureChecks, setNatureChecks] = useState([false, false, false]);

  // 7. Forgiveness State
  const [forgivenessDone, setForgivenessDone] = useState(false);

  // 8. Prayer Journal State
  const [prayerText, setPrayerText] = useState('');
  const [prayerSaved, setPrayerSaved] = useState(false);

  // Meditation Interval
  useEffect(() => {
    let interval = null;
    if (isMedRunning) {
      interval = setInterval(() => {
        setMeditationTimer(prev => {
          if (prev <= 1) {
            setIsMedRunning(false);
            soundEngine.playDivineChime?.();
            haptics.success?.();
            addXP?.(30, isRtl ? 'مراقبه نور الهی' : 'Divine Light Meditation');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMedRunning]);

  // Breathing Cycle Animation Sync
  useEffect(() => {
    let bInterval = null;
    if (isMedRunning) {
      bInterval = setInterval(() => {
        setBreathPhase(p => p === 'inhale' ? 'hold' : p === 'hold' ? 'exhale' : 'inhale');
      }, 4000);
    }
    return () => clearInterval(bInterval);
  }, [isMedRunning]);

  // Silence Interval
  useEffect(() => {
    let interval = null;
    if (isSilenceRunning) {
      interval = setInterval(() => {
        setSilenceTimer(prev => {
          if (prev <= 1) {
            setIsSilenceRunning(false);
            soundEngine.playMeditationBowl?.();
            haptics.success?.();
            addXP?.(25, isRtl ? 'سکوت قدسی' : 'Holy Silence');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSilenceRunning]);

  return (
    <div className="space-y-4 py-1 text-start">
      
      {/* ── 1. CONTROLS: SHUFFLE, BOOKMARK & SELECTOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-300 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
            {currentPractice.icon} {isRtl ? 'تمرین معنوی روز' : 'Daily Practice'}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Shuffle Next Practice Button */}
          <button
            onClick={() => {
              setSelectedPracticeId(null);
              setPracticeShuffleOffset(prev => prev + 1);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-slate-200 hover:border-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={13} />
            <span>{isRtl ? 'تمرین دیگر 🎲' : 'Shuffle Practice'}</span>
          </button>

          {/* Bookmark Practice */}
          <button
            onClick={() => onToggleVault?.({
              id: `god_practice_${currentPractice.id}`,
              phrase: isRtl ? currentPractice.nameFa : currentPractice.nameEn,
              meaningFa: currentPractice.descFa,
              meaningEn: currentPractice.descEn,
              categoryFa: 'تمارین ارتباط با خدا',
              categoryEn: 'Spiritual Practices',
              type: 'divine_practice'
            })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPracticeSaved
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                : 'bg-white/10 border-white/15 text-slate-300 hover:text-amber-300 hover:border-amber-400'
            }`}
          >
            <Bookmark size={13} className={isPracticeSaved ? 'fill-amber-400 text-amber-400' : ''} />
            <span>{isPracticeSaved ? (isRtl ? 'در گنجینه ✓' : 'In Vault') : (isRtl ? 'ذخیره 💎' : 'Save')}</span>
          </button>

          {/* Practice Dropdown Selector */}
          <select
            value={currentPractice.id}
            onChange={e => {
              setSelectedPracticeId(e.target.value);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className="p-1.5 rounded-xl bg-black/60 border border-amber-400/40 text-xs text-amber-200 outline-none max-w-[140px] sm:max-w-none"
          >
            {DIVINE_PRACTICES_LIST.map(p => (
              <option key={p.id} value={p.id}>
                {p.icon} {isRtl ? p.nameFa.slice(0, 30) : p.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 2. MASTER PRACTICE INTERACTIVE CONTAINER ── */}
      <motion.div
        key={currentPractice.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-950/50 via-black/80 to-purple-950/40 border-2 border-amber-400/50 shadow-2xl space-y-5 text-start relative overflow-hidden"
      >
        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-amber-200 flex items-center gap-2">
            <span>{currentPractice.icon}</span>
            <span>{isRtl ? currentPractice.nameFa : currentPractice.nameEn}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {isRtl ? currentPractice.descFa : currentPractice.descEn}
          </p>
        </div>

        {/* Steps Guide if available */}
        {currentPractice.stepsFa && (
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
            <span className="text-xs font-black text-amber-300">
              {isRtl ? '📋 مراحل گام‌به‌گام انجام تمرین:' : 'Step-by-Step Instructions:'}
            </span>
            <div className="space-y-1 text-xs text-slate-300">
              {currentPractice.stepsFa.map((s, i) => (
                <div key={i} className="leading-relaxed">
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 1. Divine Light Meditation Mode ── */}
        {currentPractice.type === 'light_meditation' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
            <motion.div
              animate={{
                scale: breathPhase === 'inhale' ? 1.3 : breathPhase === 'hold' ? 1.3 : 0.85,
                boxShadow: breathPhase === 'inhale' ? '0 0 50px rgba(245,158,11,0.6)' : '0 0 20px rgba(245,158,11,0.2)'
              }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className="w-36 h-36 rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-amber-600/40 flex flex-col items-center justify-center shadow-2xl"
            >
              <span className="text-xs font-black text-amber-200">
                {breathPhase === 'inhale'
                  ? (isRtl ? 'دم نورانی ☀️' : 'Inhale Light')
                  : breathPhase === 'hold'
                  ? (isRtl ? 'غرق در حضور ✨' : 'Hold Presence')
                  : (isRtl ? 'بازدم و رهایی 🕊️' : 'Exhale & Surrender')}
              </span>
              <span className="text-2xl font-black font-mono text-white mt-1">
                {Math.floor(meditationTimer / 60)}:{(meditationTimer % 60).toString().padStart(2, '0')}
              </span>
            </motion.div>

            <button
              onClick={() => {
                if (!isMedRunning) soundEngine.playMeditationBowl?.();
                setIsMedRunning(!isMedRunning);
                haptics.tap?.();
              }}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              {isMedRunning ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              <span>{isMedRunning ? (isRtl ? 'توقف موقت' : 'Pause') : (isRtl ? 'شروع مراقبه نور الهی' : 'Start Meditation')}</span>
            </button>
          </div>
        )}

        {/* ── 2. Dhikr / Mantra Counter Mode ── */}
        {currentPractice.type === 'dhikr_counter' && (
          <div className="space-y-4 text-center">
            {/* Mantra Choice Selector */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {currentPractice.mantras.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMantraIdx(idx);
                    soundEngine.playTap?.();
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                    idx === selectedMantraIdx
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-sm'
                      : 'bg-black/20 border-white/10 text-slate-400'
                  }`}
                >
                  {isRtl ? m.fa.split('/')[0] : m.en.split('/')[0]}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30">
              <span className="text-sm sm:text-base font-black text-amber-300 block">
                {isRtl ? currentPractice.mantras[selectedMantraIdx].fa : currentPractice.mantras[selectedMantraIdx].en}
              </span>
            </div>

            {/* Giant Circular Tasbih Tap Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                const next = dhikrCount + 1;
                setDhikrCount(next);
                soundEngine.playTap?.();
                haptics.tap?.();
                if (next % 33 === 0) {
                  soundEngine.playDivineChime?.();
                  haptics.success?.();
                  addXP?.(20, isRtl ? 'یک دور تسبیح کامل' : '33 Sacred Chants');
                }
              }}
              className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-amber-500/25 via-yellow-500/15 to-indigo-950/40 border-4 border-amber-400 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.35)] cursor-pointer select-none"
            >
              <span className="text-4xl font-black font-mono text-amber-300">{dhikrCount}</span>
              <span className="text-[10px] text-slate-300 font-bold mt-1">
                {isRtl ? 'لمس برای ذکر (هدف: ۳۳)' : 'Tap to Count (Goal: 33)'}
              </span>
            </motion.button>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setDhikrCount(0);
                  soundEngine.playTap?.();
                }}
                className="px-3 py-1 rounded-xl bg-white/5 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>{isRtl ? 'صفر کردن شمارنده' : 'Reset'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 3. Holy Silence Mode ── */}
        {currentPractice.type === 'silence_timer' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
            <div className="w-36 h-36 rounded-full border-4 border-indigo-400 bg-indigo-950/30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <span className="text-xs font-bold text-indigo-300">
                {isRtl ? 'سکوت قدسی 🤫' : 'Sacred Silence'}
              </span>
              <span className="text-2xl font-black font-mono text-white mt-1">
                {Math.floor(silenceTimer / 60)}:{(silenceTimer % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <button
              onClick={() => {
                if (!isSilenceRunning) soundEngine.playMeditationBowl?.();
                setIsSilenceRunning(!isSilenceRunning);
                haptics.tap?.();
              }}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              {isSilenceRunning ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              <span>{isSilenceRunning ? (isRtl ? 'توقف سکوت' : 'Pause') : (isRtl ? 'آغاز ۲ دقیقه سکوت قدسی' : 'Start 2 Min Silence')}</span>
            </button>
          </div>
        )}

        {/* ── 4. Surrender and Trust Ritual ── */}
        {currentPractice.type === 'surrender_ritual' && (
          <div className="space-y-3">
            <p className="text-xs text-amber-200 font-bold">
              {isRtl ? currentPractice.promptFa : currentPractice.promptEn}
            </p>

            <textarea
              rows={3}
              value={surrenderText}
              onChange={e => setSurrenderText(e.target.value)}
              placeholder={isRtl ? 'نگرانی‌ات را بنویس تا آن را به دریای بیکران پروردگار بسپاری...' : 'Write what you release...'}
              className="w-full p-3 rounded-2xl bg-black/40 border border-amber-500/30 text-xs text-slate-100 outline-none focus:border-amber-400 placeholder:text-slate-500"
            />

            <button
              onClick={() => {
                if (!surrenderText.trim() || isSurrendered) return;
                setIsSurrendered(true);
                soundEngine.playDivineChime?.();
                haptics.success?.();
                addXP?.(30, isRtl ? 'توکل و تسلیم نگرانی به خدا' : 'Surrendered Burden to God');
              }}
              disabled={!surrenderText.trim() || isSurrendered}
              className={`w-full py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                isSurrendered
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 active:scale-98 disabled:opacity-40'
              }`}
            >
              {isSurrendered ? <CheckCircle2 size={16} /> : <Send size={16} />}
              <span>
                {isSurrendered
                  ? (isRtl ? 'نگرانی با توکل کامل به خدا واگذار شد 🕊️ (+30 XP)' : 'Surrendered to Divine Care! (+30 XP)')
                  : (isRtl ? 'واگذاری به دستان امن و بی‌انتهای خدا (+30 XP)' : 'Surrender to God (+30 XP)')}
              </span>
            </button>
          </div>
        )}

        {/* ── 5. 528Hz Solfeggio Miracle Frequency ── */}
        {currentPractice.type === '528hz_frequency' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
            <motion.div
              animate={{
                scale: is528Running ? [1, 1.15, 1] : 1,
                boxShadow: is528Running ? ['0 0 20px rgba(16,185,129,0.3)', '0 0 50px rgba(16,185,129,0.7)', '0 0 20px rgba(16,185,129,0.3)'] : 'none'
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-36 h-36 rounded-full border-4 border-emerald-400 bg-emerald-950/40 flex flex-col items-center justify-center shadow-2xl"
            >
              <Waves size={28} className="text-emerald-300" />
              <span className="text-sm font-black font-mono text-emerald-200 mt-1">528 Hz</span>
              <span className="text-[10px] text-slate-300 font-bold">
                {isRtl ? 'فرکانس عشق و شفا' : 'Miracle Tone'}
              </span>
            </motion.div>

            <button
              onClick={() => {
                if (!is528Running) {
                  soundEngine.startAtmosphereDrone?.('solfeggio528', 0.4);
                  setIs528Running(true);
                  addXP?.(25, isRtl ? 'ارتعاش ۵۲۸Hz قدسی' : '528Hz Resonance');
                } else {
                  soundEngine.stopAtmosphereDrone?.();
                  setIs528Running(false);
                }
                soundEngine.playTap?.();
                haptics.tap?.();
              }}
              className={`px-8 py-3 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center gap-2 ${
                is528Running
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 active:scale-95'
              }`}
            >
              {is528Running ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              <span>{is528Running ? (isRtl ? 'توقف فرکانس ۵۲۸Hz' : 'Stop 528Hz Tone') : (isRtl ? 'پخش فرکانس ۵۲۸Hz قدسی' : 'Play 528Hz Tone')}</span>
            </button>
          </div>
        )}

        {/* ── 6. Nature Reflection Checklist ── */}
        {currentPractice.type === 'nature_reflection' && (
          <div className="space-y-3">
            {[
              isRtl ? '۱. به آسمان، آفتاب یا گیاهی در نزدیکی‌ام با توجه کامل نگریستم.' : '1. Observed the sky or plant mindfully.',
              isRtl ? '۲. هوشمندی و نظم شگفت‌انگیز پنهان در آن را حس کردم.' : '2. Felt the hidden cosmic intelligence.',
              isRtl ? '۳. پیام سپاس و ستایش قلبی خود را به پیشگاه آفریننده نثار کردم.' : '3. Sent a heartfelt praise to the Creator.'
            ].map((text, i) => (
              <button
                key={i}
                onClick={() => {
                  const next = [...natureChecks];
                  next[i] = !next[i];
                  setNatureChecks(next);
                  soundEngine.playCheckmark?.();
                  haptics.tap?.();
                  if (next.every(Boolean)) {
                    addXP?.(30, isRtl ? 'ارتباط با طبیعت و آفرینش' : 'Nature Communion');
                  }
                }}
                className={`w-full p-3 rounded-2xl border text-start text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                  natureChecks[i]
                    ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200'
                    : 'bg-black/30 border-white/10 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span>{text}</span>
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${natureChecks[i] ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'border-white/20'}`}>
                  {natureChecks[i] ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── 7. Forgiveness Ritual ── */}
        {currentPractice.type === 'forgiveness_ritual' && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-center space-y-3">
            <span className="text-2xl block">🕊️</span>
            <p className="text-xs sm:text-sm text-purple-100 font-bold leading-relaxed">
              «ای پروردگار بخشاینده! به شکرانه بخشش و رحمت بی‌پایانت، من نیز امروز هر دلخوری و کینه‌ای را می‌بخشم و قلبم را از اسارت رنج آزاد می‌کنم.»
            </p>
            <button
              onClick={() => {
                if (forgivenessDone) return;
                setForgivenessDone(true);
                soundEngine.playDivineChime?.();
                haptics.success?.();
                addXP?.(35, isRtl ? 'بخشش الهی و آزادی قلب' : 'Sacred Forgiveness');
              }}
              className={`px-8 py-3 rounded-2xl font-black text-xs transition-all shadow-md ${
                forgivenessDone
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:brightness-110 active:scale-95'
              }`}
            >
              {forgivenessDone ? (isRtl ? 'بخشیدم و رها کردم 🕊️ (+35 XP)' : 'Forgiven & Liberated! (+35 XP)') : (isRtl ? 'می‌بخشم و آزاد می‌شوم (+35 XP)' : 'I Forgive & Release (+35 XP)')}
            </button>
          </div>
        )}

        {/* ── 8. Heart Prayer Journal ── */}
        {currentPractice.type === 'prayer_journal' && (
          <div className="space-y-3">
            <textarea
              rows={3}
              value={prayerText}
              onChange={e => setPrayerText(e.target.value)}
              placeholder={isRtl ? currentPractice.promptFa : currentPractice.promptEn}
              className="w-full p-3 rounded-2xl bg-black/40 border border-amber-500/30 text-xs text-slate-100 outline-none focus:border-amber-400 placeholder:text-slate-500"
            />
            <button
              onClick={async () => {
                if (!prayerText.trim() || prayerSaved) return;
                try {
                  await db.journalEntries.add({
                    date: getToday(),
                    sectionId: 'mindfulness',
                    content: `🌌 مناجات قلبی با پروردگار: ${prayerText}`,
                    mood: 'blessed',
                    tags: ['خدا', 'مناجات', 'Prayer'],
                    timestamp: new Date().toISOString()
                  });
                  setPrayerSaved(true);
                  soundEngine.playDivineChime?.();
                  haptics.success?.();
                  addXP?.(30, isRtl ? 'مناجات قلبی با خدا' : 'Intimate Prayer Logged');
                } catch (_) {}
              }}
              disabled={!prayerText.trim() || prayerSaved}
              className={`w-full py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                prayerSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-purple-600 text-white hover:brightness-110 active:scale-98 disabled:opacity-40'
              }`}
            >
              {prayerSaved ? <CheckCircle2 size={16} /> : <Heart size={16} />}
              <span>{prayerSaved ? (isRtl ? 'مناجات در دفتر دل ثبت شد 🌟 (+30 XP)' : 'Prayer Saved!') : (isRtl ? 'ثبت و پیشکش مناجات به درگاه حق (+30 XP)' : 'Commit Prayer (+30 XP)')}</span>
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 7: OMNIPRESENCE REMINDERS
// ─────────────────────────────────────────────
export function GodStep7Omnipresence({ isRtl, learningVault, onToggleVault }) {
  const [shuffleOffset, setShuffleOffset] = useState(0);
  const reminder = getDailyGodItem(GOD_OMNIPRESENCE_100, shuffleOffset);
  const isSaved = (learningVault || []).some(v => v.phrase === reminder?.revelationFa || v.phrase === reminder?.revelationEn);

  return (
    <div className="space-y-4 py-1 text-start">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-amber-300 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
          ☀️ {isRtl ? 'حضور دائمی در اکنون' : 'Omnipresence'}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShuffleOffset(prev => prev + 1);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-slate-200 hover:border-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={13} />
            <span>{isRtl ? 'یادآور دیگر 🎲' : 'Shuffle'}</span>
          </button>

          <button
            onClick={() => onToggleVault?.({
              id: `god_omni_${reminder.dayIndex}_${Date.now()}`,
              phrase: isRtl ? reminder.revelationFa : reminder.revelationEn,
              authorFa: reminder.poetFa,
              authorEn: reminder.poetEn,
              meaningFa: reminder.meditationFa,
              meaningEn: reminder.verseEn,
              categoryFa: 'یادآور حضور دائمی خدا',
              categoryEn: 'Omnipresence Reminders',
              type: 'divine_omnipresence'
            })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                : 'bg-white/10 border-white/15 text-slate-300 hover:text-amber-300 hover:border-amber-400'
            }`}
          >
            <Bookmark size={13} className={isSaved ? 'fill-amber-400 text-amber-400' : ''} />
            <span>{isSaved ? (isRtl ? 'در گنجینه ✓' : 'In Vault') : (isRtl ? 'ذخیره 💎' : 'Save')}</span>
          </button>
        </div>
      </div>

      <motion.div
        key={reminder.dayIndex}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/50 via-black/70 to-yellow-950/30 border-2 border-amber-400/40 shadow-2xl space-y-4"
      >
        <h2 className="text-base sm:text-lg font-black text-amber-200 leading-snug">
          {isRtl ? reminder.revelationFa : reminder.revelationEn}
        </h2>

        <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/30 text-center space-y-1">
          <p className="text-xs sm:text-sm font-black text-amber-100 italic leading-relaxed">
            «{isRtl ? reminder.verseFa : reminder.verseEn}»
          </p>
          <span className="text-[11px] text-amber-400 font-bold block">
            — {isRtl ? reminder.poetFa : reminder.poetEn}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          {isRtl ? reminder.meditationFa : reminder.meditationEn}
        </p>

        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-center text-xs text-amber-200 font-bold">
          ✨ {isRtl ? 'نفس عمیقی بکش و حضور گرم پروردگار را در قلبت احساس کن.' : 'Breathe deeply and feel the warm Divine presence within your heart.'}
        </div>
      </motion.div>
    </div>
  );
}
