import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2,
  X, Sparkles, Droplets, Wind, Moon, Flame, CheckCircle, Award, Feather, Radio
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

const SCENERIES = [
  { id: 'cosmic', nameFa: 'کیهان بی‌کران', nameEn: 'Cosmic Abyss', icon: '🌌', bgClass: 'from-purple-950/40 via-[#030014] to-[#030014]' },
  { id: 'rain', nameFa: 'باران شبانه', nameEn: 'Night Rain', icon: '🌧️', bgClass: 'from-blue-950/40 via-[#050b14] to-[#020617]' },
  { id: 'zen', nameFa: 'قله آرامش', nameEn: 'Zen Mountain', icon: '🏔️', bgClass: 'from-emerald-950/30 via-[#030d0a] to-[#02130e]' },
  { id: 'void', nameFa: 'تاریکی مطلق (OLED)', nameEn: 'Pure Void', icon: '⬛', bgClass: 'from-black via-black to-black' },
];

const PRESETS = [
  { mins: 25, labelFa: '۲۵ دقیقه (پومودورو)', labelEn: '25m (Pomodoro)' },
  { mins: 50, labelFa: '۵۰ دقیقه (تمرکز عمیق)', labelEn: '50m (Deep Work)' },
  { mins: 90, labelFa: '۹۰ دقیقه (ریتم اولترادیان)', labelEn: '90m (Ultradian)' },
  { mins: 5, labelFa: '۵ دقیقه (استراحت ذهن)', labelEn: '5m (Zen Break)' },
];

const SOUND_TRACKS = [
  { id: 'brown', nameFa: 'نویز قهوه‌ای', nameEn: 'Brown Noise', icon: '🤎' },
  { id: 'rain', nameFa: 'باران ملایم', nameEn: 'Gentle Rain', icon: '🌧️' },
  { id: 'ocean', nameFa: 'امواج اقیانوس', nameEn: 'Ocean Waves', icon: '🌊' },
  { id: 'binaural', nameFa: 'امواج آلفا ۴۳۲Hz', nameEn: '432Hz Alpha', icon: '🌌' },
  { id: 'wind', nameFa: 'نسیم کوهستان', nameEn: 'Mountain Breeze', icon: '🍃' },
];

export default function DeepFlowMode({ isOpen, onClose }) {
  const { language, addXP, addCoins } = useAppStore();
  const isRtl = language === 'fa';

  // Timer state
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedScenery, setSelectedScenery] = useState('cosmic');
  
  // Ambient Sound State
  const [activeSound, setActiveSound] = useState('brown');
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const scenery = SCENERIES.find(s => s.id === selectedScenery) || SCENERIES[0];

  // Set preset
  const handlePresetSelect = (mins) => {
    setSelectedDuration(mins);
    setTimeLeft(mins * 60);
    setIsActive(false);
    haptics.tap();
  };

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Ambient sound management
  useEffect(() => {
    if (isOpen && isSoundPlaying && activeSound) {
      soundEngine.setAmbientTrack(activeSound, soundVolume);
    } else {
      soundEngine.stopAllAmbient();
    }
    return () => {
      soundEngine.stopAllAmbient();
    };
  }, [isOpen, isSoundPlaying, activeSound, soundVolume]);

  const handleTogglePlay = () => {
    setIsActive(!isActive);
    haptics.tap();
    if (!isActive && isSoundPlaying) {
      soundEngine.setAmbientTrack(activeSound, soundVolume);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration * 60);
    haptics.tap();
  };

  const handleCompleteSession = () => {
    setIsActive(false);
    setSessionCompleted(true);
    soundEngine.playMeditationBowl();
    haptics.flowComplete();

    const xpEarned = selectedDuration * 2;
    const coinsEarned = Math.max(5, Math.floor(selectedDuration / 2));
    addXP(xpEarned, 'Deep Flow Session Completed');
    addCoins(coinsEarned, 'Deep Flow Session Completed');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
    haptics.tap();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSeconds = selectedDuration * 60;
  const progressPercent = Math.min(100, Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`fixed inset-0 z-50 bg-gradient-to-b ${scenery.bgClass} text-white flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden`}
      >
        {/* Subtle Ambient Particle Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-600/10 blur-3xl animate-pulse-slow" />
        </div>

        {/* TOP BAR: Header controls & Scenery switch */}
        <div className="relative z-10 flex items-center justify-between gap-3 max-w-4xl mx-auto w-full">
          
          {/* Scenery Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            {SCENERIES.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedScenery(s.id); haptics.tap(); }}
                className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                  selectedScenery === s.id
                    ? 'bg-white/20 text-white font-bold shadow-xs'
                    : 'text-white/50 hover:text-white'
                }`}
                title={isRtl ? s.nameFa : s.nameEn}
              >
                <span>{s.icon}</span>
                <span className="hidden md:inline">{isRtl ? s.nameFa : s.nameEn}</span>
              </button>
            ))}
          </div>

          {/* Right Action Icons (Sound, Fullscreen, Close) */}
          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <button
              onClick={() => { setIsSoundPlaying(!isSoundPlaying); haptics.tap(); }}
              className={`p-2.5 rounded-2xl backdrop-blur-md border transition-all ${
                isSoundPlaying
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
              title={isRtl ? 'قطع/وصل صدا' : 'Toggle Sound'}
            >
              {isSoundPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all active:scale-95"
              title={isRtl ? 'تمام‌صفحه' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Exit Flow Mode */}
            <button
              onClick={() => {
                soundEngine.stopAllAmbient();
                onClose();
                haptics.tap();
              }}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/30 border border-white/15 text-white/80 hover:text-rose-300 transition-all active:scale-95"
              title={isRtl ? 'خروج از حالت تمرکز' : 'Exit Flow'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CENTER: Main Zen Focus Ring & Task */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto max-w-xl mx-auto w-full text-center">
          
          {/* Current Focus Task Input */}
          <div className="w-full max-w-md mb-6">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder={isRtl ? 'تمرکز عمیق اکنون روی چه کاری است؟...' : 'What is your single focus right now?...'}
              className="w-full px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center text-sm font-semibold text-white placeholder-white/40 outline-none focus:border-cyan-400/60 focus:bg-white/10 transition-all"
              dir={isRtl ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Large Zen Circular Countdown */}
          <div className="relative w-64 h-64 sm:w-76 sm:h-76 flex items-center justify-center my-2">
            
            {/* SVG Glowing Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
              {/* Background Track */}
              <circle
                cx="120"
                cy="120"
                r="100"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
                fill="none"
              />
              {/* Animated Progress Fill */}
              <motion.circle
                cx="120"
                cy="120"
                r="100"
                stroke="url(#flowGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progressPercent / 100)}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Time Display */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-white/50 mt-2 font-medium tracking-widest uppercase">
                {isActive ? (isRtl ? '• در حال غوطه‌وری در جریان' : '• IN DEEP FLOW •') : (isRtl ? 'آماده برای آغاز' : 'PAUSED')}
              </span>
            </div>
          </div>

          {/* Primary Controls (Play / Pause / Reset) */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all active:scale-90"
              title={isRtl ? 'شروع مجدد' : 'Reset'}
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={handleTogglePlay}
              className="px-8 py-4 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-extrabold text-base shadow-xl shadow-purple-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
            >
              {isActive ? <Pause size={22} /> : <Play size={22} className="fill-white" />}
              <span>{isActive ? (isRtl ? 'مکث' : 'Pause') : (isRtl ? 'شروع تمرکز' : 'Start Flow')}</span>
            </button>

            <button
              onClick={handleCompleteSession}
              className="p-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 transition-all active:scale-90"
              title={isRtl ? 'اتمام موفق جلسه' : 'Complete Session'}
            >
              <CheckCircle size={18} />
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {PRESETS.map(p => (
              <button
                key={p.mins}
                onClick={() => handlePresetSelect(p.mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDuration === p.mins
                    ? 'bg-white/20 border border-white/30 text-white shadow-xs'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {isRtl ? p.labelFa : p.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM BAR: Ambient Sound Selector & Volume */}
        <div className="relative z-10 max-w-xl mx-auto w-full pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Sound Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {SOUND_TRACKS.map(track => (
                <button
                  key={track.id}
                  onClick={() => {
                    setActiveSound(track.id);
                    setIsSoundPlaying(true);
                    haptics.tap();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    activeSound === track.id && isSoundPlaying
                      ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 font-bold'
                      : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  <span>{track.icon}</span>
                  <span>{isRtl ? track.nameFa : track.nameEn}</span>
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Volume2 size={14} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="w-20 accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* SESSION COMPLETED CELEBRATION MODAL */}
        <AnimatePresence>
          {sessionCompleted && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-sm p-6 rounded-3xl border border-emerald-500/40 bg-slate-950 text-center shadow-2xl space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl animate-bounce-subtle">
                  🧘✨
                </div>

                <h3 className="text-lg font-black text-white">
                  {isRtl ? 'جلسه تمرکز با پیروزی کامل شد!' : 'Flow Session Completed!'}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isRtl
                    ? `شما ${selectedDuration} دقیقه در وضعیت تمرکز و آرامش عمیق سپری کردید. مسیرهای عصبی تسلط بر توجه تقویت شدند.`
                    : `You spent ${selectedDuration} minutes in undistracted deep work. Your attention span is stronger than ever.`}
                </p>

                <div className="flex items-center justify-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold">
                  <span className="text-purple-300">+{selectedDuration * 2} XP</span>
                  <span className="text-amber-400">+{Math.max(5, Math.floor(selectedDuration / 2))} 🪙 سکه</span>
                </div>

                <button
                  onClick={() => {
                    setSessionCompleted(false);
                    onClose();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black shadow-lg hover:opacity-95"
                >
                  {isRtl ? 'بازگشت به فضای زندگی‌ساز' : 'Return to Life OS'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </AnimatePresence>
  );
}
