import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Bot, Users, Globe, Shuffle, Trophy, Sparkles, 
  Settings, Play, Shield, Target, Award, ArrowRight, Zap, Check
} from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { SNOOKER_CUES } from './SnookerCueStoreModal';

export const TABLE_THEMES = [
  {
    id: 'championship_green',
    nameFa: 'سبز مسابقات جهانی',
    nameEn: 'Championship Green',
    clothColor: '#0b532c',
    cushionColor: '#073d1f',
    borderColor: '#382212',
    accentColor: '#10b981',
    desc: 'ماهوت استاندارد استرابون تور حرفه‌ای'
  },
  {
    id: 'royal_blue',
    nameFa: 'آبی مخمل سلطنتی',
    nameEn: 'Royal Velvet Blue',
    clothColor: '#1e3a5f',
    cushionColor: '#132842',
    borderColor: '#241b14',
    accentColor: '#38bdf8',
    desc: 'دید عالی با کنتراست فوق‌العاده توپ‌ها'
  },
  {
    id: 'obsidian_dark',
    nameFa: 'مشکی آبسیدین',
    nameEn: 'Obsidian Black',
    clothColor: '#1c1c22',
    cushionColor: '#121216',
    borderColor: '#2d1a24',
    accentColor: '#f43f5e',
    desc: 'طراحی نئونی و مینیمال سایبر'
  },
  {
    id: 'imperial_red',
    nameFa: 'قرمز زرشکی امپریال',
    nameEn: 'Imperial Crimson Red',
    clothColor: '#631726',
    cushionColor: '#450f1a',
    borderColor: '#2b1d0c',
    accentColor: '#fbbf24',
    desc: 'شکوه و اشرافیت تالارهای درباری'
  }
];

export default function SnookerSetupModal({
  isOpen,
  onClose,
  onStartGame,
  selectedCueId = 'ash_classic',
  onOpenCueStore,
  isRtl = true
}) {
  const [mode, setMode] = useState('bot'); // 'bot' | 'matchmaking' | 'online' | 'practice'
  const [botDifficulty, setBotDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [frames, setFrames] = useState(1); // 1 | 3 | 5
  const [themeId, setThemeId] = useState('championship_green');
  const [roomCode, setRoomCode] = useState('');

  if (!isOpen) return null;

  const equippedCue = SNOOKER_CUES.find(c => c.id === selectedCueId) || SNOOKER_CUES[0];
  const selectedTheme = TABLE_THEMES.find(t => t.id === themeId) || TABLE_THEMES[0];

  const handleStart = () => {
    soundEngine?.playTap?.();
    haptics?.success?.();
    onStartGame({
      mode,
      botDifficulty,
      frames,
      theme: selectedTheme,
      roomCode: mode === 'online' ? (roomCode.trim() || `SNOO-${Math.floor(1000 + Math.random() * 9000)}`) : null
    });
  };

  const modeCards = [
    {
      id: 'bot',
      titleFa: 'بازی با ربات هوشمند',
      titleEn: 'Smart AI Bot',
      icon: '🤖',
      badgeFa: 'پیش‌فرض',
      descFa: 'حریف تمرینی با شبیه‌سازی تاکتیک‌های واقعی اسنوکر',
      borderActive: 'border-emerald-500 bg-emerald-500/20'
    },
    {
      id: 'matchmaking',
      titleFa: 'حریف تصادفی آنلاین',
      titleEn: 'Random Match',
      icon: '🎲',
      badgeFa: 'آنلاین',
      descFa: 'اتصال سریع به سایر بازیکنان آنلاین چاژا',
      borderActive: 'border-amber-500 bg-amber-500/20'
    },
    {
      id: 'online',
      titleFa: 'مسابقه با دوستان (اتاق)',
      titleEn: 'Friend Duel Room',
      icon: '⚔️',
      badgeFa: 'تلگرام',
      descFa: 'ساخت اتاق اختصاصی و ارسال کارت چالش در تلگرام',
      borderActive: 'border-sky-500 bg-sky-500/20'
    },
    {
      id: 'practice',
      titleFa: 'تمرین بریک ۱۴۷',
      titleEn: '147 Solo Practice',
      icon: '🎯',
      badgeFa: 'تک‌نفره',
      descFa: 'تمرین چیدن و پاکت کردن پیاپی توپ‌ها روی میز',
      borderActive: 'border-purple-500 bg-purple-500/20'
    }
  ];

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
          className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/30 rounded-3xl p-5 shadow-2xl shadow-amber-500/10 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 border border-amber-400/40">
                🎱
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {isRtl ? 'اسنوکر شاهانه سه‌بعدی' : 'Royal Snooker 3D'}
                </h3>
                <p className="text-[11px] text-amber-400 font-bold">
                  {isRtl ? 'قوانین رسمی مسابقات و بریک ۱۴۷' : 'Official Snooker & 147 Break'}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={() => { soundEngine?.playTap?.(); onClose(); }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 space-y-4 py-3 pr-1 custom-scrollbar">
            {/* 1. Mode Cards */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">
                {isRtl ? 'انتخاب حالت بازی:' : 'Select Game Mode:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {modeCards.map(item => {
                  const isActive = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundEngine?.playTap?.();
                        setMode(item.id);
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                        isActive
                          ? item.borderActive + ' shadow-lg'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xl">{item.icon}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                        }`}>
                          {item.badgeFa}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-white leading-tight mb-0.5">
                          {isRtl ? item.titleFa : item.titleEn}
                        </p>
                        <p className="text-[9px] text-slate-400 line-clamp-2">
                          {item.descFa}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-settings: Bot Difficulty */}
            {mode === 'bot' && (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 block">
                  {isRtl ? 'سطح ربات هوشمند:' : 'AI Difficulty:'}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'easy', labelFa: 'آسان 🟢' },
                    { id: 'medium', labelFa: 'متوسط 🟡' },
                    { id: 'hard', labelFa: 'حرفه‌ای 🔴' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => { soundEngine?.playTap?.(); setBotDifficulty(lvl.id); }}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                        botDifficulty === lvl.id
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                          : 'bg-black/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl.labelFa}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-settings: Online Room Code */}
            {mode === 'online' && (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 block">
                  {isRtl ? 'کد اتاق دوستانه (اختیاری):' : 'Room Code (Optional):'}
                </span>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="SNOO-1234"
                  className="w-full py-2 px-3 rounded-xl bg-black/60 border border-sky-400/40 text-sky-300 font-mono text-center font-bold text-sm focus:outline-none"
                />
              </div>
            )}

            {/* 2. Match Length (Frames) */}
            {mode !== 'practice' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-300 block">
                  {isRtl ? 'تعداد فریم‌های مسابقه:' : 'Match Frames:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 1, labelFa: '۱ فریم (تک دست)' },
                    { val: 3, labelFa: '۳ فریم (Best of 3)' },
                    { val: 5, labelFa: '۵ فریم (Best of 5)' }
                  ].map(f => (
                    <button
                      key={f.val}
                      onClick={() => { soundEngine?.playTap?.(); setFrames(f.val); }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        frames === f.val
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {f.labelFa}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Table Cloth Themes */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 block">
                {isRtl ? 'انتخاب ماهوت میز اسنوکر:' : 'Table Cloth:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TABLE_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => { soundEngine?.playTap?.(); setThemeId(theme.id); }}
                    className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 ${
                      themeId === theme.id
                        ? 'border-white/60 bg-white/15 shadow-md'
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-lg border border-white/20 flex-shrink-0"
                      style={{ backgroundColor: theme.clothColor }}
                    />
                    <div className="truncate">
                      <p className="text-xs font-black text-white truncate">{isRtl ? theme.nameFa : theme.nameEn}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Equipped Cue Strip */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪄</span>
                <div>
                  <p className="text-xs font-black text-white">{isRtl ? equippedCue.nameFa : equippedCue.nameEn}</p>
                  <p className="text-[10px] text-amber-300">
                    {isRtl ? `قدرت: ${equippedCue.power}٪ | خط راهنما: ${equippedCue.aimLength}٪` : `Power: ${equippedCue.power}% | Aim: ${equippedCue.aimLength}%`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine?.playTap?.();
                  onOpenCueStore?.();
                }}
                className="py-1 px-2.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/40 text-amber-300 font-black text-[11px] active:scale-95 transition-all"
              >
                {isRtl ? 'فروشگاه چوب‌ها 🛍️' : 'Shop'}
              </button>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={18} fill="currentColor" />
              <span>{isRtl ? 'شروع بازی اسنوکر 🎱' : 'Start Snooker Match 🎱'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
