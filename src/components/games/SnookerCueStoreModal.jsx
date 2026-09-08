import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Lock, Zap, Shield, Award, Flame, Star, ChevronRight, Palette } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { TABLE_THEMES } from './SnookerSetupModal';

export const SNOOKER_CUES = [
  {
    id: 'ash_classic',
    nameFa: 'چوب اش سنتی (Ash Wood)',
    nameEn: 'Classic Ash Wood',
    descFa: 'چوب زبان‌گنجشک استاندارد مسابقات با توازن طبیعی و بدون انحراف.',
    descEn: 'Standard tournament grade ash wood with natural balance.',
    price: 0,
    isFree: true,
    power: 70,
    aimLength: 65,
    spinControl: 60,
    glowColor: 'rgba(217, 119, 6, 0.4)',
    accentGradient: 'from-amber-700 via-amber-600 to-amber-800',
    tipColor: '#fef3c7',
    badge: 'پایه 🪵'
  },
  {
    id: 'faravahar_dragon',
    nameFa: 'فروهر باستان (Faravahar Dragon)',
    nameEn: 'Persian Faravahar Dragon',
    descFa: 'منبت‌کاری شده با نگاره‌های کهن و افزایش چشمگیر دقت خط راهنما.',
    descEn: 'Ancient carved wood boosting aiming guide length and precision.',
    price: 5000,
    isFree: false,
    power: 82,
    aimLength: 88,
    spinControl: 78,
    glowColor: 'rgba(16, 185, 129, 0.5)',
    accentGradient: 'from-emerald-700 via-teal-600 to-emerald-900',
    tipColor: '#6ee7b7',
    badge: 'اسطوره‌ای 🦅'
  },
  {
    id: 'royal_gold',
    nameFa: 'طلای سلطنتی ۲۴ عیار (Royal Gold)',
    nameEn: 'Royal 24K Gold Master',
    descFa: 'روکش طلای خالص با کنترل فوق‌العاده روی کات و پیچ توپ سفید.',
    descEn: 'Pure 24k gold leaf inlay with elite english and screw-back control.',
    price: 12000,
    isFree: false,
    power: 90,
    aimLength: 85,
    spinControl: 95,
    glowColor: 'rgba(245, 158, 11, 0.6)',
    accentGradient: 'from-amber-400 via-yellow-500 to-amber-600',
    tipColor: '#fbbf24',
    badge: 'سلطنتی 👑'
  },
  {
    id: 'cyber_plasma',
    nameFa: 'پلاسمای نئونی سایبر (Cyber Plasma)',
    nameEn: 'Cyber Neon Plasma Laser',
    descFa: 'مجهز به لیزر متمرکز و قدرت شلیک کوانتومی برای بریک‌های سنگین.',
    descEn: 'Laser assisted aiming with quantum power for massive high breaks.',
    price: 25000,
    isFree: false,
    power: 98,
    aimLength: 98,
    spinControl: 90,
    glowColor: 'rgba(56, 189, 248, 0.7)',
    accentGradient: 'from-cyan-500 via-blue-600 to-purple-700',
    tipColor: '#38bdf8',
    badge: 'سایبرپانک ⚡'
  },
  {
    id: 'diamond_predator',
    nameFa: 'الماس سیاه پرداتور (Black Diamond)',
    nameEn: 'Black Diamond Predator',
    descFa: 'چوب افسانه‌ای قهرمانی جهان با بالاترین سطح آمار در تمامی شاخص‌ها.',
    descEn: 'The ultimate champion predator cue with maximum stats.',
    price: 50000,
    isFree: false,
    power: 100,
    aimLength: 100,
    spinControl: 100,
    glowColor: 'rgba(236, 72, 153, 0.8)',
    accentGradient: 'from-pink-600 via-purple-700 to-indigo-900',
    tipColor: '#f472b6',
    badge: 'افسانه‌ای 💎'
  }
];

export default function SnookerCueStoreModal({
  isOpen,
  onClose,
  selectedCueId = 'ash_classic',
  onSelectCue,
  selectedThemeId = 'championship_green',
  onSelectTheme,
  isRtl = true
}) {
  const { coins = 0, spendCoins, isVip } = useAppStore();
  const [activeTab, setActiveTab] = useState('cues'); // 'cues' | 'themes'
  
  // Cues state
  const [unlockedCues, setUnlockedCues] = useState(['ash_classic']);
  const [previewCue, setPreviewCue] = useState(selectedCueId);
  
  // Themes state
  const [unlockedThemes, setUnlockedThemes] = useState(['championship_green']);
  const [previewTheme, setPreviewTheme] = useState(selectedThemeId);

  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState(null);

  // Load unlocked cues and themes from localStorage
  useEffect(() => {
    try {
      const savedCues = localStorage.getItem('snooker_unlocked_cues');
      if (savedCues) {
        const parsed = JSON.parse(savedCues);
        if (Array.isArray(parsed)) {
          setUnlockedCues(Array.from(new Set(['ash_classic', ...parsed])));
        }
      }
      const savedThemes = localStorage.getItem('snooker_unlocked_themes');
      if (savedThemes) {
        const parsedT = JSON.parse(savedThemes);
        if (Array.isArray(parsedT)) {
          setUnlockedThemes(Array.from(new Set(['championship_green', ...parsedT])));
        }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (selectedCueId) setPreviewCue(selectedCueId);
  }, [selectedCueId]);

  useEffect(() => {
    if (selectedThemeId) setPreviewTheme(selectedThemeId);
  }, [selectedThemeId]);

  const saveUnlockedCues = (list) => {
    setUnlockedCues(list);
    try {
      localStorage.setItem('snooker_unlocked_cues', JSON.stringify(list));
    } catch (_) {}
  };

  const saveUnlockedThemes = (list) => {
    setUnlockedThemes(list);
    try {
      localStorage.setItem('snooker_unlocked_themes', JSON.stringify(list));
    } catch (_) {}
  };

  const handleBuyCue = (cue) => {
    soundEngine?.playTap?.();
    haptics?.impact?.('medium');

    const currentBalance = coins || 0;
    if (currentBalance < cue.price && !isVip) {
      soundEngine?.playError?.();
      haptics?.error?.();
      alert(isRtl ? '⚠️ موجودی سکه شما برای خرید این چوب کافی نیست!' : 'Insufficient coins!');
      return;
    }

    if (!isVip && spendCoins) {
      const success = spendCoins(cue.price);
      if (!success) {
        alert(isRtl ? '⚠️ خطا در کسر سکه!' : 'Payment failed!');
        return;
      }
    }

    const nextList = [...unlockedCues, cue.id];
    saveUnlockedCues(nextList);
    onSelectCue(cue.id);
    setPreviewCue(cue.id);
    soundEngine?.playLevelUp?.();
    haptics?.success?.();

    setPurchaseSuccessMsg(isRtl ? `🎉 چوب «${cue.nameFa}» با موفقیت خریداری و فعال شد!` : `🎉 ${cue.nameEn} equipped!`);
    setTimeout(() => setPurchaseSuccessMsg(null), 3500);
  };

  const handleEquipCue = (cueId) => {
    soundEngine?.playTap?.();
    haptics?.tap?.();
    onSelectCue(cueId);
    setPreviewCue(cueId);
  };

  const handleBuyTheme = (theme) => {
    soundEngine?.playTap?.();
    haptics?.impact?.('medium');

    const currentBalance = coins || 0;
    if (currentBalance < theme.price && !isVip) {
      soundEngine?.playError?.();
      haptics?.error?.();
      alert(isRtl ? '⚠️ موجودی سکه شما برای خرید این تم کافی نیست!' : 'Insufficient coins!');
      return;
    }

    if (!isVip && spendCoins) {
      const success = spendCoins(theme.price);
      if (!success) {
        alert(isRtl ? '⚠️ خطا در کسر سکه!' : 'Payment failed!');
        return;
      }
    }

    const nextList = [...unlockedThemes, theme.id];
    saveUnlockedThemes(nextList);
    if (onSelectTheme) onSelectTheme(theme.id);
    setPreviewTheme(theme.id);
    soundEngine?.playLevelUp?.();
    haptics?.success?.();

    setPurchaseSuccessMsg(isRtl ? `🎉 تم «${theme.nameFa}» با موفقیت خریداری و روی میز فعال شد!` : `🎉 ${theme.nameEn} equipped!`);
    setTimeout(() => setPurchaseSuccessMsg(null), 3500);
  };

  const handleEquipTheme = (themeId) => {
    soundEngine?.playTap?.();
    haptics?.tap?.();
    if (onSelectTheme) onSelectTheme(themeId);
    setPreviewTheme(themeId);
  };

  const activeCueObj = SNOOKER_CUES.find(c => c.id === previewCue) || SNOOKER_CUES[0];
  const isCueUnlocked = unlockedCues.includes(activeCueObj.id) || activeCueObj.isFree;
  const isCueEquipped = selectedCueId === activeCueObj.id;

  const activeThemeObj = TABLE_THEMES.find(t => t.id === previewTheme) || TABLE_THEMES[0];
  const isThemeUnlocked = unlockedThemes.includes(activeThemeObj.id) || activeThemeObj.isFree;
  const isThemeEquipped = selectedThemeId === activeThemeObj.id;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-4"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-amber-500/10 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner">
                🛍️
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isRtl ? 'فروشگاه اختصاصی اسنوکر' : 'Snooker Master Boutique'}
                </h3>
                <p className="text-[11px] text-amber-300 font-medium">
                  {isRtl ? 'خرید چوب‌های قهرمانی و تم‌های جذاب میز با سکه' : 'Luxury cues & table themes with coins'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundEngine?.playTap?.();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Coin Balance & Tab Switcher */}
          <div className="mt-3 flex flex-col gap-2">
            <div className="py-2 px-3.5 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-between shadow-inner">
              <span className="text-xs text-slate-300 font-medium">
                {isRtl ? 'موجودی سکه شما:' : 'Your Coin Balance:'}
              </span>
              <div className="flex items-center gap-1.5 font-mono font-black text-amber-400 text-sm">
                <span>🪙</span>
                <span>{(coins || 0).toLocaleString()}</span>
                <span className="text-[10px] text-amber-500 font-bold">{isRtl ? 'سکه' : 'coins'}</span>
              </div>
            </div>

            {/* Tabs: Cues vs Table Themes */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950/80 border border-white/10">
              <button
                onClick={() => {
                  soundEngine?.playTap?.();
                  setActiveTab('cues');
                }}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'cues'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>🪄</span>
                <span>{isRtl ? 'چوب‌های اسنوکر' : 'Snooker Cues'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine?.playTap?.();
                  setActiveTab('themes');
                }}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'themes'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>🟢</span>
                <span>{isRtl ? 'تم و ماهوت میز' : 'Table Themes'}</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {purchaseSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold text-center"
            >
              {purchaseSuccessMsg}
            </motion.div>
          )}

          {/* TAB 1: Cues Store */}
          {activeTab === 'cues' && (
            <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3 custom-scrollbar">
              {/* Active Preview Card */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold">
                    {activeCueObj.badge}
                  </span>
                  {isCueEquipped && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black flex items-center gap-1">
                      <Check size={12} /> {isRtl ? 'چوب فعال' : 'Equipped'}
                    </span>
                  )}
                </div>

                {/* Cue Stick Visual Simulation */}
                <div className="py-3 flex flex-col items-center justify-center">
                  <div 
                    className="w-full h-4 rounded-full shadow-lg relative overflow-hidden"
                    style={{
                      background: `linear-gradient(90deg, #332010 0%, ${activeCueObj.tipColor} 95%, #ffffff 100%)`,
                      boxShadow: `0 0 20px ${activeCueObj.glowColor}`
                    }}
                  >
                    <div className="absolute inset-0 bg-white/15 opacity-50 animate-pulse" />
                  </div>
                  <p className="mt-2 text-sm font-black text-white">{isRtl ? activeCueObj.nameFa : activeCueObj.nameEn}</p>
                  <p className="text-[11px] text-slate-400 text-center mt-0.5">{isRtl ? activeCueObj.descFa : activeCueObj.descEn}</p>
                </div>

                {/* Stats Bars */}
                <div className="space-y-1.5 mt-2 pt-2 border-t border-white/10">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                      <span>⚡ {isRtl ? 'قدرت شلیک (Power)' : 'Power'}</span>
                      <span className="font-bold text-amber-400">{activeCueObj.power}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activeCueObj.power}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                      <span>🎯 {isRtl ? 'طول خط راهنما (Aim Length)' : 'Aim Guide'}</span>
                      <span className="font-bold text-cyan-400">{activeCueObj.aimLength}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activeCueObj.aimLength}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                      <span>🌀 {isRtl ? 'کنترل کات و افه (Spin Control)' : 'Spin Control'}</span>
                      <span className="font-bold text-pink-400">{activeCueObj.spinControl}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activeCueObj.spinControl}%` }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-3">
                  {isCueUnlocked ? (
                    <button
                      onClick={() => handleEquipCue(activeCueObj.id)}
                      disabled={isCueEquipped}
                      className={`w-full py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                        isCueEquipped
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-400/40 cursor-default'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/25 active:scale-95'
                      }`}
                    >
                      <Check size={15} />
                      <span>{isCueEquipped ? (isRtl ? 'چوب فعال شما' : 'Currently Equipped') : (isRtl ? 'انتخاب و استفاده از چوب' : 'Equip This Cue')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyCue(activeCueObj)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={15} />
                      <span>{isRtl ? `خرید با سکه (${activeCueObj.price.toLocaleString()} 🪙)` : `Unlock (${activeCueObj.price.toLocaleString()} Coins)`}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* List of Cues */}
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 font-bold mb-1">
                  {isRtl ? 'تمام چوب‌های مسابقات:' : 'All Snooker Cues:'}
                </p>
                {SNOOKER_CUES.map(cue => {
                  const unlocked = unlockedCues.includes(cue.id) || cue.isFree;
                  const isSelected = previewCue === cue.id;
                  return (
                    <div
                      key={cue.id}
                      onClick={() => {
                        soundEngine?.playTap?.();
                        setPreviewCue(cue.id);
                      }}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400/70 shadow-md'
                          : 'bg-slate-900/50 border-white/5 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-base border border-white/10 shrink-0"
                          style={{ background: cue.glowColor }}
                        >
                          {cue.id === 'ash_classic' ? '🪵' : cue.id === 'faravahar_dragon' ? '🦅' : cue.id === 'royal_gold' ? '👑' : cue.id === 'cyber_plasma' ? '⚡' : '💎'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white">{isRtl ? cue.nameFa : cue.nameEn}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-medium">
                              {cue.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {isRtl ? `قدرت: ${cue.power}٪ | دقت: ${cue.aimLength}٪` : `Power: ${cue.power}% | Aim: ${cue.aimLength}%`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {unlocked ? (
                          selectedCueId === cue.id ? (
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-xl">
                              {isRtl ? 'فعال' : 'Active'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded-xl">
                              {isRtl ? 'آزاد' : 'Unlocked'}
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-1 rounded-xl flex items-center gap-1">
                            <Lock size={10} /> {cue.price.toLocaleString()} 🪙
                          </span>
                        )}
                        <ChevronRight size={14} className="text-slate-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Table Themes Store */}
          {activeTab === 'themes' && (
            <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3 custom-scrollbar">
              {/* Active Theme Preview Card */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold">
                    {activeThemeObj.badge}
                  </span>
                  {isThemeEquipped && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black flex items-center gap-1">
                      <Check size={12} /> {isRtl ? 'تم فعال میز' : 'Equipped'}
                    </span>
                  )}
                </div>

                {/* Table Simulation Canvas Preview */}
                <div className="py-2 flex flex-col items-center justify-center">
                  <div 
                    className="w-full h-28 rounded-2xl p-2.5 relative overflow-hidden flex items-center justify-center border-2 border-amber-900/60 shadow-xl"
                    style={{
                      backgroundColor: activeThemeObj.borderColor,
                      boxShadow: `0 0 25px ${activeThemeObj.accentColor}33`
                    }}
                  >
                    {/* Inner Cloth */}
                    <div 
                      className="w-full h-full rounded-xl relative flex items-center justify-center border border-white/10 overflow-hidden"
                      style={{ backgroundColor: activeThemeObj.clothColor }}
                    >
                      {/* Spotlight */}
                      <div 
                        className="absolute inset-0 opacity-40 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)`
                        }}
                      />

                      {/* Cushions */}
                      <div 
                        className="absolute inset-x-0 top-0 h-1.5 opacity-80"
                        style={{ backgroundColor: activeThemeObj.cushionColor }}
                      />
                      <div 
                        className="absolute inset-x-0 bottom-0 h-1.5 opacity-80"
                        style={{ backgroundColor: activeThemeObj.cushionColor }}
                      />

                      {/* Pocket Castings in corners */}
                      <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-amber-400/90 border border-amber-600 shadow" />
                      <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-400/90 border border-amber-600 shadow" />
                      <div className="absolute bottom-1 left-1 w-3 h-3 rounded-full bg-amber-400/90 border border-amber-600 shadow" />
                      <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-amber-400/90 border border-amber-600 shadow" />

                      {/* Baulk Line and 3 Simulation Balls */}
                      <div className="absolute left-8 inset-y-0 w-0.5 bg-white/30" />
                      <div className="flex items-center gap-3 z-10">
                        <div className="w-4 h-4 rounded-full bg-white shadow-md border border-slate-300" />
                        <div className="w-4 h-4 rounded-full bg-red-600 shadow-md border border-red-800" />
                        <div className="w-4 h-4 rounded-full bg-amber-400 shadow-md border border-amber-600" />
                        <div className="w-4 h-4 rounded-full bg-blue-600 shadow-md border border-blue-800" />
                        <div className="w-4 h-4 rounded-full bg-black shadow-md border border-zinc-700" />
                      </div>
                    </div>
                  </div>

                  <p className="mt-2.5 text-sm font-black text-white">{isRtl ? activeThemeObj.nameFa : activeThemeObj.nameEn}</p>
                  <p className="text-[11px] text-slate-400 text-center mt-0.5">{isRtl ? activeThemeObj.desc : activeThemeObj.nameEn}</p>
                </div>

                {/* Action Button */}
                <div className="mt-2">
                  {isThemeUnlocked ? (
                    <button
                      onClick={() => handleEquipTheme(activeThemeObj.id)}
                      disabled={isThemeEquipped}
                      className={`w-full py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                        isThemeEquipped
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-400/40 cursor-default'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/25 active:scale-95'
                      }`}
                    >
                      <Check size={15} />
                      <span>{isThemeEquipped ? (isRtl ? 'تم فعال میز شما' : 'Currently Active') : (isRtl ? 'انتخاب و فعال‌سازی این تم' : 'Equip This Theme')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyTheme(activeThemeObj)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={15} />
                      <span>{isRtl ? `خرید با سکه (${activeThemeObj.price.toLocaleString()} 🪙)` : `Unlock (${activeThemeObj.price.toLocaleString()} Coins)`}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Table Themes */}
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 font-bold mb-1">
                  {isRtl ? 'مجموعه تمام ماهوت‌های حرفه‌ای:' : 'All Table Themes:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TABLE_THEMES.map(theme => {
                    const unlocked = unlockedThemes.includes(theme.id) || theme.isFree;
                    const isSelected = previewTheme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => {
                          soundEngine?.playTap?.();
                          setPreviewTheme(theme.id);
                        }}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-400/70 shadow-md'
                            : 'bg-slate-900/50 border-white/5 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div 
                            className="w-8 h-8 rounded-xl border border-white/20 shrink-0 shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: theme.clothColor }}
                          >
                            <span className="text-xs">🎱</span>
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-white truncate">{isRtl ? theme.nameFa : theme.nameEn}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 block truncate">
                              {theme.badge}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {unlocked ? (
                            selectedThemeId === theme.id ? (
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg">
                                {isRtl ? 'فعال' : 'Active'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">
                                {isRtl ? 'آزاد' : 'Unlocked'}
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                              <Lock size={9} /> {theme.price.toLocaleString()} 🪙
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Close */}
          <div className="pt-2.5 mt-2 border-t border-white/10">
            <button
              onClick={() => {
                soundEngine?.playTap?.();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all"
            >
              {isRtl ? 'بستن فروشگاه' : 'Close Store'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
