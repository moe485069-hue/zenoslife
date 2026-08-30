import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, RefreshCw, Copy, Check, Bookmark, 
  Share2, Volume2, ChevronRight, ChevronLeft, Quote
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import MASTER_QUOTES from '../../data/quotesData';

export default function QuoteStudioCard({ className = '' }) {
  const { language, learningVault, toggleVaultItem } = useAppStore();
  const isRtl = language === 'fa';

  // Seed initial index based on today's day of year
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % MASTER_QUOTES.length;
  });

  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentQuote = MASTER_QUOTES[quoteIndex] || MASTER_QUOTES[0];

  const isSaved = (learningVault || []).some(
    v => v.phrase === currentQuote.textFa || v.title === currentQuote.textFa || v.text === currentQuote.textFa
  );

  const handleNext = () => {
    setDirection(1);
    setQuoteIndex(prev => (prev + 1) % MASTER_QUOTES.length);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handlePrev = () => {
    setDirection(-1);
    setQuoteIndex(prev => (prev - 1 + MASTER_QUOTES.length) % MASTER_QUOTES.length);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleRandom = () => {
    setDirection(1);
    let nextIdx = Math.floor(Math.random() * MASTER_QUOTES.length);
    if (nextIdx === quoteIndex) nextIdx = (nextIdx + 1) % MASTER_QUOTES.length;
    setQuoteIndex(nextIdx);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleCopy = () => {
    const textToCopy = isRtl
      ? `«${currentQuote.textFa}»\n— ${currentQuote.authorFa}`
      : `"${currentQuote.textEn}"\n— ${currentQuote.authorEn}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    soundEngine.playCheckmark?.();
    haptics.success?.();
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = isRtl ? currentQuote.textFa : currentQuote.textEn;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = isRtl ? 'fa-IR' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      soundEngine.playTap?.();
    }
  };

  const handleShare = async () => {
    const textToShare = isRtl
      ? `«${currentQuote.textFa}»\n— ${currentQuote.authorFa}\n(از برنامه Life OS)`
      : `"${currentQuote.textEn}"\n— ${currentQuote.authorEn}\n(via Life OS)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: isRtl ? 'نقل‌قول و خرد روزانه' : 'Daily Wisdom Quote',
          text: textToShare
        });
      } catch (_) {}
    } else {
      handleCopy();
    }
  };

  const handleToggleSave = () => {
    toggleVaultItem({
      id: `quote_${currentQuote.id}`,
      phrase: isRtl ? currentQuote.textFa : currentQuote.textEn,
      text: currentQuote.textFa,
      textEn: currentQuote.textEn,
      authorFa: currentQuote.authorFa,
      authorEn: currentQuote.authorEn,
      categoryFa: currentQuote.categoryFa || 'حکمت و خودشناسی',
      categoryEn: currentQuote.categoryEn || 'Wisdom',
      meaningFa: isRtl ? `به قلم ${currentQuote.authorFa}` : `By ${currentQuote.authorEn}`,
      sectionId: 'learning',
      type: 'wisdom',
      icon: '🕊️'
    });
    soundEngine.playLevelUp?.();
    haptics.success?.();
  };

  return (
    <div 
      className={`glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-xl border border-[var(--border)] group transition-all duration-300 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(59,130,246,0.04) 50%, rgba(234,179,8,0.05) 100%)',
        borderInlineStart: '4px solid var(--accent)'
      }}
    >
      {/* Background Decorative Large Quote Watermark */}
      <div className="absolute -bottom-6 -left-4 text-slate-500/5 dark:text-white/5 pointer-events-none select-none">
        <Quote size={130} />
      </div>

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[var(--text-primary)]">
                {isRtl ? 'حکمت و اندیشه روز' : 'Daily Wisdom & Vision'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
                #{quoteIndex + 1} {isRtl ? 'از ۱۰۴' : 'of 104'}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">
              {isRtl ? currentQuote.categoryFa : currentQuote.categoryEn}
            </span>
          </div>
        </div>

        {/* Top Right Action Pills */}
        <div className="flex items-center gap-1.5">
          {/* Bookmark to Vault */}
          <button
            onClick={handleToggleSave}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs ${
              isSaved
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-amber-400 hover:border-amber-500/40'
            }`}
            title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved in Vault') : (isRtl ? 'افزودن به گنجینه' : 'Save to Vault')}
          >
            <Bookmark size={14} className={isSaved ? 'fill-current' : ''} />
            <span className="text-[10px] font-black hidden sm:inline">
              {isSaved ? (isRtl ? 'در گنجینه' : 'Saved') : (isRtl ? 'گنجینه' : 'Vault')}
            </span>
          </button>

          {/* Random shuffle */}
          <button
            onClick={handleRandom}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/40 active:scale-95 transition-all shadow-xs"
            title={isRtl ? 'نقل‌قول تصادفی' : 'Random Quote'}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Quote Body with Animated Crossfade */}
      <div className="min-h-[90px] flex flex-col justify-center my-2 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuote.id + language}
            initial={{ opacity: 0, y: direction * 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -direction * 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-2"
          >
            <blockquote className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] leading-relaxed italic">
              «{isRtl ? currentQuote.textFa : currentQuote.textEn}»
            </blockquote>

            {/* Bilingual Secondary Subtitle (in English mode show Persian translation or vice versa) */}
            <p className="text-xs text-[var(--text-secondary)] opacity-75 font-normal leading-relaxed line-clamp-2">
              {isRtl ? currentQuote.textEn : currentQuote.textFa}
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs font-black text-[var(--accent)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                <span>— {isRtl ? currentQuote.authorFa : currentQuote.authorEn}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls Toolbar */}
      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2 mt-2 relative z-10">
        {/* Left Actions: TTS, Copy, Share */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            title={isRtl ? 'کپی متن' : 'Copy'}
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span className="text-[10px] hidden sm:inline">{copied ? (isRtl ? 'کپی شد!' : 'Copied!') : (isRtl ? 'کپی' : 'Copy')}</span>
          </button>

          <button
            onClick={handleSpeak}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-purple-400 hover:border-purple-500/40 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            title={isRtl ? 'خوانش صوتی' : 'Speak'}
          >
            <Volume2 size={14} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-sky-400 hover:border-sky-500/40 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            title={isRtl ? 'اشتراک‌گذاری' : 'Share'}
          >
            <Share2 size={14} />
          </button>
        </div>

        {/* Right Actions: Prev / Next */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/40 active:scale-95 transition-all"
            title={isRtl ? 'نقل‌قول قبلی' : 'Previous Quote'}
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            onClick={handleNext}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>{isRtl ? 'بعدی' : 'Next'}</span>
            {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
