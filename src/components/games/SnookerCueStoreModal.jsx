import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Lock, Zap, Shield, Award, Flame, Star, ChevronRight } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

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
  isRtl = true
}) {
  const { userCoins = 1000, addCoins, spendCoins, isVip } = useAppStore();
  const [unlockedCues, setUnlockedCues] = useState(['ash_classic']);
  const [previewCue, setPreviewCue] = useState(selectedCueId);
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState(null);

  // Load unlocked cues from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('snooker_unlocked_cues');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setUnlockedCues(Array.from(new Set(['ash_classic', ...parsed])));
        }
      }
    } catch (_) {}
  }, []);

  const saveUnlockedCues = (list) => {
    setUnlockedCues(list);
    try {
      localStorage.setItem('snooker_unlocked_cues', JSON.stringify(list));
    } catch (_) {}
  };

  const handleBuy = (cue) => {
    soundEngine?.playTap?.();
    haptics?.impact?.('medium');

    const currentBalance = userCoins || 0;
    if (currentBalance < cue.price && !isVip) {
      soundEngine?.playError?.();
      haptics?.error?.();
      alert(isRtl ? '⚠️ موجودی سکه شما برای خرید این چوب کافی نیست!' : 'Insufficient coins!');
      return;
    }

    if (!isVip && spendCoins) {
      spendCoins(cue.price);
    }

    const nextList = [...unlockedCues, cue.id];
    saveUnlockedCues(nextList);
    onSelectCue(cue.id);
    setPreviewCue(cue.id);
    soundEngine?.playLevelUp?.();
    haptics?.success?.();

    setPurchaseSuccessMsg(isRtl ? `🎉 تبریک! چوب ${cue.nameFa} آزاد و تجهیز شد!` : `🎉 ${cue.nameEn} equipped!`);
    setTimeout(() => setPurchaseSuccessMsg(null), 3500);
  };

  const handleEquip = (cueId) => {
    soundEngine?.playTap?.();
    haptics?.tap?.();
    onSelectCue(cueId);
    setPreviewCue(cueId);
  };

  const activeCueObj = SNOOKER_CUES.find(c => c.id === previewCue) || SNOOKER_CUES[0];
  const isUnlocked = unlockedCues.includes(activeCueObj.id) || activeCueObj.isFree;
  const isEquipped = selectedCueId === activeCueObj.id;

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
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-500/10 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                🎱
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {isRtl ? 'فروشگاه چوب‌های اسنوکر' : 'Snooker Cues Master Store'}
                </h3>
                <p className="text-xs text-amber-300 font-medium">
                  {isRtl ? 'چوب‌های قهرمانی با فیزیک و دقت اختصاصی' : 'Custom Cues with Unique Stats'}
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

          {/* User Coin Balance */}
          <div className="mt-3 py-2 px-3.5 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">
              {isRtl ? 'موجودی سکه شما:' : 'Your Coin Balance:'}
            </span>
            <div className="flex items-center gap-1.5 font-mono font-black text-amber-400 text-sm">
              <span>🪙</span>
              <span>{(userCoins || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Success Banner */}
          {purchaseSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold text-center"
            >
              {purchaseSuccessMsg}
            </motion.div>
          )}

          {/* Active Preview Card */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-800/60 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold">
                {activeCueObj.badge}
              </span>
              {isEquipped && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black flex items-center gap-1">
                  <Check size={12} /> {isRtl ? 'در حال استفاده' : 'Equipped'}
                </span>
              )}
            </div>

            {/* Cue Stick Visual Simulation */}
            <div className="py-4 flex flex-col items-center justify-center">
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
            <div className="space-y-2 mt-2 pt-2 border-t border-white/10">
              <div>
                <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                  <span>⚡ {isRtl ? 'قدرت ضربه (Power)' : 'Shot Power'}</span>
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
                <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                  <span>🎯 {isRtl ? 'طول خط راهنما (Aim Guide)' : 'Aim Guide'}</span>
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
                <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                  <span>🌀 {isRtl ? 'کنترل کات و پیچ (Spin Control)' : 'Spin Control'}</span>
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

            {/* Action for Active Previewed Cue */}
            <div className="mt-4">
              {isUnlocked ? (
                <button
                  onClick={() => handleEquip(activeCueObj.id)}
                  disabled={isEquipped}
                  className={`w-full py-2.5 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isEquipped
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-400/40 cursor-default'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/25 active:scale-95'
                  }`}
                >
                  <Check size={16} />
                  <span>{isEquipped ? (isRtl ? 'چوب فعال شما' : 'Currently Equipped') : (isRtl ? 'انتخاب و استفاده از چوب' : 'Equip This Cue')}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(activeCueObj)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>{isRtl ? `خرید و آزادسازی (${activeCueObj.price.toLocaleString()} سکه 🪙)` : `Unlock (${activeCueObj.price.toLocaleString()} Coins)`}</span>
                </button>
              )}
            </div>
          </div>

          {/* List of all Cues */}
          <div className="mt-4 overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
            <p className="text-xs text-slate-400 font-bold mb-1">
              {isRtl ? 'مجموعه تمام چوب‌های اسنوکر:' : 'All Snooker Cues Collection:'}
            </p>
            {SNOOKER_CUES.map(cue => {
              const cueUnlocked = unlockedCues.includes(cue.id) || cue.isFree;
              const isSelected = previewCue === cue.id;
              return (
                <div
                  key={cue.id}
                  onClick={() => {
                    soundEngine?.playTap?.();
                    setPreviewCue(cue.id);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400/70 shadow-md'
                      : 'bg-slate-900/50 border-white/5 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-white/10"
                      style={{ background: cue.glowColor }}
                    >
                      {cue.id === 'ash_classic' ? '🪵' : cue.id === 'faravahar_dragon' ? '🦅' : cue.id === 'royal_gold' ? '👑' : cue.id === 'cyber_plasma' ? '⚡' : '💎'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
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
                    {cueUnlocked ? (
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

          {/* Footer Close */}
          <div className="pt-3 mt-2 border-t border-white/10">
            <button
              onClick={() => {
                soundEngine?.playTap?.();
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all"
            >
              {isRtl ? 'بستن فروشگاه' : 'Close Store'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
