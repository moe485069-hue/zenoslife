import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Sun, Sparkles, Heart, RefreshCw, Zap, Award } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useSectionsStore from '../../store/sectionsStore';
import soundEngine from '../../utils/audio';

const BONSAI_STAGES = {
  seed: {
    nameFa: 'دانه کیهانی',
    nameEn: 'Cosmic Seed',
    descFa: 'دانه‌ای در دل خاک حاصلخیز ذهن شما که در انتظار بیداری است.',
    descEn: 'A cosmic seed resting in the fertile soil of your mind, waiting for awakening.',
    icon: '🌱',
    color: '#10b981'
  },
  sprout: {
    nameFa: 'جوانه سبز آگاهی',
    nameEn: 'Sprout of Awareness',
    descFa: 'نخستین جوانه‌های استمرار و پاکی در حال رشد هستند.',
    descEn: 'The first tender shoots of consistency and clarity are rising.',
    icon: '🌿',
    color: '#06b6d4'
  },
  sapling: {
    nameFa: 'نهال استوار اراده',
    nameEn: 'Sapling of Willpower',
    descFa: 'شاخه‌های جوان در برابر بادهای روزگار استوارتر می‌شوند.',
    descEn: 'Young branches growing resilient against everyday storms.',
    icon: '🪴',
    color: '#8b5cf6'
  },
  blooming: {
    nameFa: 'بونسای شکوفای خرد',
    nameEn: 'Blooming Wisdom Bonsai',
    descFa: 'شکوفه‌های عطرآگین آرامش و تسلط بر خود در حال درخشش‌اند.',
    descEn: 'Fragrant blossoms of inner serenity and self-mastery are in full bloom.',
    icon: '🌸',
    color: '#ec4899'
  },
  ancient: {
    nameFa: 'درخت کهنسال معرفت',
    nameEn: 'Ancient Wisdom Tree',
    descFa: 'ریشه‌های عمیق در خرد کهن و شاخساری گسترده در آسمان حقیقت.',
    descEn: 'Deep roots in timeless wisdom, wide canopy embracing the sky of truth.',
    icon: '🌳',
    color: '#eab308'
  },
  cosmic: {
    nameFa: 'درخت نورانی کیهانی (سدرة‌المنتهی)',
    nameEn: 'Cosmic Tree of Life',
    descFa: 'پیوند کامل با شبکه هوشمند هستی؛ سرشار از نور، برکت و آرامش ابدی.',
    descEn: 'Total alignment with the universe; radiating pure light, abundance and eternal peace.',
    icon: '✨',
    color: '#a855f7'
  }
};

export default function ZenBonsai({ compact = false }) {
  const { language, addXP, addCoins } = useAppStore();
  const { bonsaiState, loadBonsai, nourishBonsai } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeEffect, setActiveEffect] = useState(null); // 'water' | 'light' | 'zen'

  useEffect(() => {
    loadBonsai();
  }, []);

  const state = bonsaiState || {
    level: 3,
    stage: 'blooming',
    vitality: 85,
    waterCount: 4,
    lightCount: 6,
    zenCount: 3,
    totalNourishments: 13
  };

  const stageInfo = BONSAI_STAGES[state.stage] || BONSAI_STAGES.blooming;

  const handleNourish = (type) => {
    setActiveEffect(type);
    nourishBonsai(type);
    addXP(10, 'Nourished Zen Bonsai');
    addCoins(5, 'Bonsai Care Bonus');
    soundEngine.playCheckmark();

    setTimeout(() => {
      setActiveEffect(null);
    }, 2000);
  };

  return (
    <div className={`glass-card rounded-3xl border border-[var(--border)] overflow-hidden relative ${compact ? 'p-4' : 'p-6'}`}>
      {/* Background Ambient Glow */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none transition-colors duration-1000"
        style={{ background: `radial-gradient(circle at 50% 40%, ${stageInfo.color}, transparent 70%)` }}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce-subtle">{stageInfo.icon}</span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              {isRtl ? stageInfo.nameFa : stageInfo.nameEn}
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium">
              {isRtl ? `سطح ${state.level} • نشاط باغ: ${state.vitality}٪` : `Level ${state.level} • Vitality: ${state.vitality}%`}
            </p>
          </div>
        </div>

        {/* Vitality Bar Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]">
          <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
          <span className="text-xs font-black text-[var(--text-primary)]">{state.vitality}%</span>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="relative h-44 sm:h-52 w-full flex items-center justify-center overflow-hidden my-2 rounded-2xl bg-gradient-to-b from-transparent via-[var(--bg-secondary)]/30 to-[var(--bg-secondary)]/80 border border-[var(--border)]/50">
        
        {/* Effect Animations Overlay */}
        <AnimatePresence>
          {activeEffect === 'water' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center gap-3 z-30"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, 80], opacity: [1, 0] }}
                  transition={{ duration: 1.2, delay: i * 0.15, repeat: 1 }}
                  className="text-cyan-400 text-xl drop-shadow-[0_0_8px_cyan]"
                >
                  💧
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeEffect === 'light' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
            >
              <div className="w-36 h-36 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
              <div className="absolute text-3xl text-amber-300 drop-shadow-[0_0_12px_gold]">☀️✨</div>
            </motion.div>
          )}

          {activeEffect === 'zen' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
            >
              <div className="w-40 h-40 rounded-full border-2 border-purple-500/40 animate-ping" />
              <div className="absolute text-3xl text-purple-300 drop-shadow-[0_0_15px_purple]">🕉️🌌</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Petals / Leaves (Cosmic Ambient) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, (i % 2 === 0 ? 30 : -30), 0],
                y: [0, 60, 120],
                rotate: [0, 180, 360],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 6 + i * 2,
                repeat: Infinity,
                delay: i * 1.5,
                ease: 'easeInOut'
              }}
              className="absolute top-2 text-xs"
              style={{ left: `${20 + i * 15}%`, color: stageInfo.color }}
            >
              {state.level >= 4 ? '🌸' : '🍃'}
            </motion.div>
          ))}
        </div>

        {/* SVG Bonsai Illustration */}
        <svg viewBox="0 0 200 160" className="w-40 sm:w-48 h-full max-h-48 drop-shadow-xl z-20">
          <defs>
            {/* Trunk Gradient */}
            <linearGradient id="trunkGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            {/* Foliage Gradient */}
            <radialGradient id="foliageGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={stageInfo.color} />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>
            {/* Pot Gradient */}
            <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Ceramic Pot & Stand */}
          <ellipse cx="100" cy="142" rx="42" ry="7" fill="#09090b" opacity="0.4" />
          <path d="M 65 132 L 135 132 L 128 144 L 72 144 Z" fill="url(#potGrad)" stroke="var(--border)" strokeWidth="1.5" />
          <ellipse cx="100" cy="132" rx="35" ry="4" fill="#3f2e1e" />
          
          {/* Moss on soil */}
          <ellipse cx="100" cy="131" rx="30" ry="2.5" fill="#15803d" opacity="0.8" />

          {/* Dynamic Trunk based on Stage */}
          {state.level === 1 && (
            // Seed / Sprout
            <g>
              <path d="M 100 131 Q 100 120 100 112" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="100" cy="110" r="4" fill="#10b981" />
              <path d="M 100 112 Q 108 108 106 104 Q 100 108 100 112" fill="#34d399" />
              <path d="M 100 112 Q 92 108 94 104 Q 100 108 100 112" fill="#34d399" />
            </g>
          )}

          {state.level === 2 && (
            // Small Sapling
            <g>
              <path d="M 100 131 Q 95 115 102 98 Q 104 88 100 80" stroke="url(#trunkGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 98 105 Q 85 98 82 95" stroke="url(#trunkGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 102 92 Q 115 88 118 84" stroke="url(#trunkGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              
              <circle cx="80" cy="94" r="10" fill="url(#foliageGrad)" />
              <circle cx="120" cy="82" r="11" fill="url(#foliageGrad)" />
              <circle cx="100" cy="74" r="14" fill="url(#foliageGrad)" />
            </g>
          )}

          {state.level >= 3 && (
            // Majestic Curved Bonsai Tree
            <g>
              {/* Roots */}
              <path d="M 92 132 Q 86 130 80 133" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 108 132 Q 114 130 120 133" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Main Trunk with classic S-curve */}
              <path d="M 100 131 C 88 115, 82 98, 98 78 C 108 65, 104 52, 98 44" stroke="url(#trunkGrad)" strokeWidth="7" fill="none" strokeLinecap="round" />
              
              {/* Primary Branches */}
              <path d="M 90 98 C 70 92, 60 88, 55 82" stroke="url(#trunkGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 96 82 C 120 78, 135 70, 142 62" stroke="url(#trunkGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 100 62 C 85 54, 76 48, 72 40" stroke="url(#trunkGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 98 44 C 112 36, 120 30, 124 24" stroke="url(#trunkGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Foliage Clouds */}
              <g className="animate-pulse-slow">
                <ellipse cx="50" cy="80" rx="20" ry="12" fill="url(#foliageGrad)" opacity="0.95" />
                <ellipse cx="145" cy="60" rx="22" ry="13" fill="url(#foliageGrad)" opacity="0.95" />
                <ellipse cx="68" cy="38" rx="19" ry="12" fill="url(#foliageGrad)" opacity="0.95" />
                <ellipse cx="126" cy="22" rx="20" ry="12" fill="url(#foliageGrad)" opacity="0.95" />
                {/* Crown */}
                <ellipse cx="98" cy="32" rx="28" ry="16" fill="url(#foliageGrad)" />
              </g>

              {/* Level 4+: Blooming Blossoms */}
              {state.level >= 4 && (
                <g>
                  <circle cx="45" cy="76" r="3.5" fill="#fbcfe8" />
                  <circle cx="58" cy="82" r="3" fill="#f472b6" />
                  <circle cx="140" cy="56" r="3.5" fill="#fbcfe8" />
                  <circle cx="152" cy="62" r="3" fill="#f472b6" />
                  <circle cx="65" cy="34" r="3.5" fill="#fbcfe8" />
                  <circle cx="102" cy="26" r="4" fill="#fbcfe8" />
                  <circle cx="90" cy="36" r="3.5" fill="#f472b6" />
                  <circle cx="120" cy="18" r="3.5" fill="#fbcfe8" />
                </g>
              )}

              {/* Level 6: Cosmic Aura Sparks */}
              {state.level >= 6 && (
                <g className="animate-pulse">
                  <circle cx="98" cy="32" r="38" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <circle cx="50" cy="80" r="2" fill="#fff" />
                  <circle cx="145" cy="60" r="2" fill="#fff" />
                  <circle cx="98" cy="15" r="2" fill="#fff" />
                </g>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--text-secondary)] text-center my-2.5 leading-relaxed px-2 font-medium">
        {isRtl ? stageInfo.descFa : stageInfo.descEn}
      </p>

      {/* 3 Interactive Daily Care Rituals */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--border)]">
        {/* 1. Water */}
        <button
          onClick={() => handleNourish('water')}
          className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[var(--bg-secondary)] hover:bg-cyan-500/10 border border-[var(--border)] hover:border-cyan-500/40 text-[var(--text-primary)] transition-all active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Droplets size={16} />
          </div>
          <span className="text-[11px] font-bold">{isRtl ? 'آبیاری تن' : 'Water'}</span>
          <span className="text-[9px] text-[var(--text-secondary)]">{isRtl ? '+۱۰ نشاط' : '+10 Vit'}</span>
        </button>

        {/* 2. Light */}
        <button
          onClick={() => handleNourish('light')}
          className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[var(--bg-secondary)] hover:bg-amber-500/10 border border-[var(--border)] hover:border-amber-500/40 text-[var(--text-primary)] transition-all active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sun size={16} />
          </div>
          <span className="text-[11px] font-bold">{isRtl ? 'نور خرد' : 'Light'}</span>
          <span className="text-[9px] text-[var(--text-secondary)]">{isRtl ? '+۵ سکه' : '+5 Coins'}</span>
        </button>

        {/* 3. Zen */}
        <button
          onClick={() => handleNourish('zen')}
          className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[var(--bg-secondary)] hover:bg-purple-500/10 border border-[var(--border)] hover:border-purple-500/40 text-[var(--text-primary)] transition-all active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles size={16} />
          </div>
          <span className="text-[11px] font-bold">{isRtl ? 'کود سکوت' : 'Zen'}</span>
          <span className="text-[9px] text-[var(--text-secondary)]">{isRtl ? '+۱۰ XP' : '+10 XP'}</span>
        </button>
      </div>
    </div>
  );
}
