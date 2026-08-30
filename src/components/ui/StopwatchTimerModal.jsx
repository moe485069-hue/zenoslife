import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, RotateCcw, Flag, Timer, Clock, 
  Sparkles, Bell, Volume2, CheckCircle2, Zap 
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function StopwatchTimerModal({ isOpen, onClose }) {
  const { language, addXP } = useAppStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'stopwatch'

  // --- STOPWATCH STATE ---
  const [stopwatchTime, setStopwatchTime] = useState(0); // in ms
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const stopwatchIntervalRef = useRef(null);

  useEffect(() => {
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchTime;
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 30);
    } else {
      clearInterval(stopwatchIntervalRef.current);
    }
    return () => clearInterval(stopwatchIntervalRef.current);
  }, [isStopwatchRunning]);

  const handleStartStopwatch = () => {
    setIsStopwatchRunning(!isStopwatchRunning);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleResetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleLap = () => {
    if (!isStopwatchRunning) return;
    setLaps(prev => [stopwatchTime, ...prev]);
    soundEngine.playCheckmark?.();
    haptics.tap?.();
  };

  const formatStopwatch = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const mill = Math.floor((ms % 1000) / 10);
    return {
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
      ms: mill.toString().padStart(2, '0')
    };
  };

  // --- COUNTDOWN TIMER STATE ---
  const [timerDuration, setTimerDuration] = useState(25 * 60); // default 25 min
  const [timerRemaining, setTimerRemaining] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const timerIntervalRef = useRef(null);

  const TIMER_PRESETS = [
    { label: isRtl ? '۱ دقیقه (تمرکز)' : '1 min', sec: 60, icon: '⚡' },
    { label: isRtl ? '۵ دقیقه (تنفس)' : '5 min', sec: 5 * 60, icon: '🧘' },
    { label: isRtl ? '۱۵ دقیقه (مطالعه)' : '15 min', sec: 15 * 60, icon: '📖' },
    { label: isRtl ? '۲۵ دقیقه (پومودورو)' : '25 min', sec: 25 * 60, icon: '🍅' },
    { label: isRtl ? '۴۵ دقیقه (کار عمیق)' : '45 min', sec: 45 * 60, icon: '🚀' },
    { label: isRtl ? '۶۰ دقیقه (ورزش)' : '60 min', sec: 60 * 60, icon: '💪' },
  ];

  useEffect(() => {
    if (isTimerRunning && timerRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            soundEngine.playLevelUp?.();
            soundEngine.playAlarm?.();
            haptics.success?.();
            addXP?.(20, 'تکمیل تایمر');
            alert(isRtl ? '⏰ زمان تایمر به پایان رسید! تبریک بابت استمرار و تمرکز.' : '⏰ Time is up! Well done.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning, timerRemaining, isRtl, addXP]);

  const selectPreset = (sec) => {
    setIsTimerRunning(false);
    setTimerDuration(sec);
    setTimerRemaining(sec);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleStartTimer = () => {
    if (timerRemaining === 0) {
      setTimerRemaining(timerDuration);
    }
    setIsTimerRunning(!isTimerRunning);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerRemaining(timerDuration);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return {
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0')
    };
  };

  const swFormatted = formatStopwatch(stopwatchTime);
  const tmFormatted = formatTimer(timerRemaining);
  const timerProgress = timerDuration > 0 ? ((timerDuration - timerRemaining) / timerDuration) * 100 : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="glass-card w-full max-w-md rounded-3xl relative border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div className="p-5 pb-3 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-xs">
                <Clock size={20} className={isTimerRunning || isStopwatchRunning ? 'animate-spin-slow' : ''} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {isRtl ? 'مرکز زمان، تایمر و کرنومتر' : 'Chronos Center & Timer'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  {isRtl ? 'مدیریت دقیق زمان و جلسات تمرکز' : 'Precision stopwatch & focus timer'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="p-2 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex gap-2">
            <button
              onClick={() => {
                setActiveTab('timer');
                soundEngine.playTap?.();
              }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'timer'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Timer size={15} />
              <span>{isRtl ? 'تایمر شمارش معکوس' : 'Countdown Timer'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('stopwatch');
                soundEngine.playTap?.();
              }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'stopwatch'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <RotateCcw size={15} />
              <span>{isRtl ? 'کرنومتر و ثبت دور' : 'Stopwatch'}</span>
            </button>
          </div>

          {/* TAB 1: COUNTDOWN TIMER */}
          {activeTab === 'timer' && (
            <div className="p-6 flex flex-col items-center space-y-6">
              
              {/* Presets Grid */}
              <div className="grid grid-cols-3 gap-2 w-full">
                {TIMER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectPreset(p.sec)}
                    className={`p-2.5 rounded-2xl border text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 ${
                      timerDuration === p.sec
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300 shadow-xs'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Big Digital Countdown Display */}
              <div className="relative w-56 h-56 rounded-full flex flex-col items-center justify-center border-4 border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 via-[var(--bg-secondary)] to-transparent shadow-inner">
                {/* SVG Progress Arc Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle
                    cx="112"
                    cy="112"
                    r="104"
                    fill="transparent"
                    stroke="rgba(6,182,212,0.15)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="104"
                    fill="transparent"
                    stroke="#06b6d4"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 104}
                    strokeDashoffset={2 * Math.PI * 104 * (1 - timerProgress / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                <div className="text-4xl sm:text-5xl font-black font-mono text-cyan-600 dark:text-cyan-300 tracking-wider">
                  {tmFormatted.m}:{tmFormatted.s}
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold mt-1 uppercase tracking-widest">
                  {isTimerRunning ? (isRtl ? 'در حال شمارش...' : 'Running...') : (isRtl ? 'آماده شروع' : 'Ready')}
                </span>
              </div>

              {/* Control Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleStartTimer}
                  className={`flex-1 py-3.5 rounded-2xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
                    isTimerRunning
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500'
                  }`}
                >
                  {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                  <span>{isTimerRunning ? (isRtl ? 'توقف موقت' : 'Pause') : (isRtl ? 'شروع تایمر' : 'Start')}</span>
                </button>

                <button
                  onClick={handleResetTimer}
                  className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-500/40 active:scale-95 transition-all"
                  title={isRtl ? 'تنظیم مجدد' : 'Reset'}
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PRECISION STOPWATCH */}
          {activeTab === 'stopwatch' && (
            <div className="p-6 flex flex-col items-center space-y-6">
              {/* Big Stopwatch Display */}
              <div className="w-full p-6 rounded-3xl bg-[var(--bg-secondary)] border border-purple-500/30 flex flex-col items-center justify-center shadow-inner">
                <div className="text-4xl sm:text-5xl font-black font-mono text-purple-600 dark:text-purple-300 tracking-wider">
                  {swFormatted.m}:{swFormatted.s}
                  <span className="text-xl sm:text-2xl opacity-75 font-mono">.{swFormatted.ms}</span>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold mt-1 uppercase tracking-widest">
                  {isStopwatchRunning ? (isRtl ? 'کرنومتر فعال است' : 'Stopwatch Active') : (isRtl ? 'متوقف' : 'Stopped')}
                </span>
              </div>

              {/* Control Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleStartStopwatch}
                  className={`flex-1 py-3.5 rounded-2xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
                    isStopwatchRunning
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                  }`}
                >
                  {isStopwatchRunning ? <Pause size={18} /> : <Play size={18} />}
                  <span>{isStopwatchRunning ? (isRtl ? 'توقف' : 'Pause') : (isRtl ? 'شروع' : 'Start')}</span>
                </button>

                <button
                  onClick={handleLap}
                  disabled={!isStopwatchRunning}
                  className="px-4 py-3.5 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-300 font-black text-xs disabled:opacity-30 flex items-center gap-1.5 hover:bg-purple-600/30 active:scale-95 transition-all"
                >
                  <Flag size={15} />
                  <span>{isRtl ? 'ثبت دور (Lap)' : 'Lap'}</span>
                </button>

                <button
                  onClick={handleResetStopwatch}
                  className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/40 active:scale-95 transition-all"
                  title={isRtl ? 'ریست' : 'Reset'}
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              {/* Laps List */}
              {laps.length > 0 && (
                <div className="w-full space-y-1.5 max-h-40 overflow-y-auto no-scrollbar pt-2 border-t border-[var(--border)]">
                  <span className="text-[10px] font-black text-[var(--text-secondary)] px-1 uppercase tracking-wider block">
                    {isRtl ? 'دورهای ثبت شده:' : 'Recorded Laps:'}
                  </span>
                  {laps.map((lapMs, idx) => {
                    const lapFmt = formatStopwatch(lapMs);
                    return (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between text-xs font-mono"
                      >
                        <span className="font-bold text-[var(--text-secondary)]">#{laps.length - idx}</span>
                        <span className="font-black text-[var(--text-primary)]">
                          {lapFmt.m}:{lapFmt.s}.{lapFmt.ms}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer Close */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-md transition-all active:scale-95"
            >
              {isRtl ? 'بستن پنجره' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
