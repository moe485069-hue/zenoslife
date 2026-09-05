import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Bot, Users, Globe, Shuffle, Trophy, Sparkles, 
  Settings, Play, Shield, Target, Award, ArrowRight
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
    nameFa: 'مشکی کربن آبسیدین',
    nameEn: 'Obsidian Black',
    clothColor: '#1c1c22',
    cushionColor: '#121216',
    borderColor: '#2d1a24',
    accentColor: '#f43f5e',
    desc: 'طراحی نئونی و مینیمال سایبرپانک'
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
  const [mode, setMode] = useState('bot'); // 'bot' | 'matchmaking' | 'online' | 'local' | 'practice'
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[65] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-4"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-500/10 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30 border border-emerald-400/40">
                🎱
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {isRtl ? 'اسنوکر حرفه‌ای سه‌بعدی' : 'Royal Snooker 3D'}
                </h3>
                <p className="text-xs text-emerald-400 font-bold">
                  {isRtl ? 'قوانین رسمی مسابقات و بریک ۱۴۷' : 'Official Rules & 147 Break Challenge'}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={() => {
                  soundEngine?.playTap?.();
                  onClose();
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 space-y-4 py-3 pr-1 custom-scrollbar">
            {/* 1. Mode Selector */}
            <div>
              <label className="text-xs font-black text-slate-300 mb-2 block">
                {isRtl ? '🎯 انتخاب حالت بازی:' : 'Select Game Mode:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Bot Mode */}
                <button
                  onClick={() => { soundEngine?.playTap?.(); setMode('bot'); }}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    mode === 'bot'
                      ? 'bg-emerald-500/20 border-emerald-400/80 shadow-md shadow-emerald-500/15'
                      : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Bot size={16} className={mode === 'bot' ? 'text-emerald-400' : 'text-slate-400'} />
                    <span className="text-xs font-black text-white">{isRtl ? 'بازی با ربات هوشمند' : 'Play vs Smart AI'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{isRtl ? 'حریف تمرینی با شبیه‌سازی تاکتیک' : 'Intelligent AI opponent'}</p>
                </button>

                {/* Random Matchmaking */}
                <button
                  onClick={() => { soundEngine?.playTap?.(); setMode('matchmaking'); }}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    mode === 'matchmaking'
                      ? 'bg-amber-500/20 border-amber-400/80 shadow-md shadow-amber-500/15'
                      : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Shuffle size={16} className={mode === 'matchmaking' ? 'text-amber-400' : 'text-slate-400'} />
                    <span className="text-xs font-black text-white">{isRtl ? 'حریف شانسی آنلاین' : 'Random Match'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{isRtl ? 'جستجوی زنده در بازیکنان چاژا' : 'Live opponent matchmaking'}</p>
                </button>

                {/* Online Duel */}
                <button
                  onClick={() => { soundEngine?.playTap?.(); setMode('online'); }}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    mode === 'online'
                      ? 'bg-sky-500/20 border-sky-400/80 shadow-md shadow-sky-500/15'
                      : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={16} className={mode === 'online' ? 'text-sky-400' : 'text-slate-400'} />
                    <span className="text-xs font-black text-white">{isRtl ? 'دوئل دوستانه (اتاق)' : 'Online Duel Room'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{isRtl ? 'ساخت اتاق و ارسال لینک تلگرام' : 'Invite friends via Telegram'}</p>
                </button>

                {/* Local 2P Pass & Play */}
                <button
                  onClick={() => { soundEngine?.playTap?.(); setMode('local'); }}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    mode === 'local'
                      ? 'bg-purple-500/20 border-purple-400/80 shadow-md shadow-purple-500/15'
                      : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className={mode === 'local' ? 'text-purple-400' : 'text-slate-400'} />
                    <span className="text-xs font-black text-white">{isRtl ? 'دونفره محلی (یک گوشی)' : 'Pass & Play (Local)'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{isRtl ? 'مسابقه نوبتی با دوستان در یک صفحه' : 'Play locally on 1 screen'}</p>
                </button>
              </div>

              {/* Solo 147 Practice Button */}
              <button
                onClick={() => { soundEngine?.playTap?.(); setMode('practice'); }}
                className={`mt-2 w-full p-2.5 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 ${
                  mode === 'practice'
                    ? 'bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-amber-600/25 border-amber-400/80 text-amber-300 font-black'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Target size={15} className="text-amber-400" />
                <span className="text-xs">{isRtl ? '🎯 چالش تمرینی بریک ماکسیمم (۱۴۷ Break Challenge)' : '🎯 147 Maximum Break Solo Practice'}</span>
              </button>
            </div>

            {/* Sub-settings: Bot Difficulty */}
            {mode === 'bot' && (
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5">
                <label className="text-[11px] font-bold text-slate-300 mb-1.5 block">
                  {isRtl ? 'سطح هوش مصنوعی ربات:' : 'AI Difficulty Level:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'easy', labelFa: 'آسان 🟢', labelEn: 'Easy' },
                    { id: 'medium', labelFa: 'متوسط 🟡', labelEn: 'Medium' },
                    { id: 'hard', labelFa: 'حرفه‌ای 🔴', labelEn: 'Master' }
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
                      {isRtl ? lvl.labelFa : lvl.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-settings: Online Room Code input */}
            {mode === 'online' && (
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  {isRtl ? 'کد اختصاصی اتاق (اختیاری):' : 'Custom Room Code (Optional):'}
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="SNOO-1234"
                  className="w-full py-2 px-3 rounded-xl bg-black/60 border border-sky-400/40 text-sky-300 font-mono text-center font-bold text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
            )}

            {/* 2. Match Frame Count */}
            {mode !== 'practice' && (
              <div>
                <label className="text-xs font-black text-slate-300 mb-1.5 block">
                  {isRtl ? '🏆 تعداد فریم‌های مسابقه (Frame Count):' : 'Match Length (Frames):'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 1, labelFa: 'تک فریم (۱ دست)', labelEn: '1 Frame' },
                    { val: 3, labelFa: '۳ فریم (Best of 3)', labelEn: 'Best of 3' },
                    { val: 5, labelFa: '۵ فریم (Best of 5)', labelEn: 'Best of 5' }
                  ].map(f => (
                    <button
                      key={f.val}
                      onClick={() => { soundEngine?.playTap?.(); setFrames(f.val); }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        frames === f.val
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : 'bg-slate-900/60 border border-white/5 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {isRtl ? f.labelFa : f.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Table Cloth Theme */}
            <div>
              <label className="text-xs font-black text-slate-300 mb-1.5 block">
                {isRtl ? '🎨 پوسته و ماهوت میز اسنوکر:' : 'Snooker Table Cloth Theme:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TABLE_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => { soundEngine?.playTap?.(); setThemeId(theme.id); }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2.5 ${
                      themeId === theme.id
                        ? 'border-white/60 bg-slate-800/80 shadow-md'
                        : 'border-white/5 bg-slate-900/40 hover:bg-slate-800/40'
                    }`}
                  >
                    <div 
                      className="w-7 h-7 rounded-lg shadow-inner border border-white/20 flex-shrink-0"
                      style={{ backgroundColor: theme.clothColor }}
                    />
                    <div>
                      <p className="text-xs font-black text-white">{isRtl ? theme.nameFa : theme.nameEn}</p>
                      <p className="text-[9px] text-slate-400">{theme.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Active Cue Stick Preview & Store Shortcut */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800/50 to-slate-900/80 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-white/10"
                  style={{ background: equippedCue.glowColor }}
                >
                  🎱
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">{isRtl ? equippedCue.nameFa : equippedCue.nameEn}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                      {equippedCue.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {isRtl ? `قدرت: ${equippedCue.power}٪ | دقت راهنما: ${equippedCue.aimLength}٪` : `Power: ${equippedCue.power}% | Aim: ${equippedCue.aimLength}%`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine?.playTap?.();
                  onOpenCueStore?.();
                }}
                className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs active:scale-95 transition-all flex items-center gap-1"
              >
                <Sparkles size={12} />
                <span>{isRtl ? 'تغییر چوب 🛍️' : 'Cues Shop'}</span>
              </button>
            </div>
          </div>

          {/* Start Action Button */}
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
