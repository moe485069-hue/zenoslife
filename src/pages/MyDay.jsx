import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Check, Plus, Sparkles, Droplets, Heart, 
  Flame, CheckCircle2, ChevronRight, Zap, RefreshCw, Smile, Clock,
  Play, Pause, Square, Coffee, Target, Activity, Moon, BookOpen, Edit3, Flag, X, AlignLeft,
  Bell, BellRing, Sparkle, Compass, Layers, ChevronDown, ChevronUp, Footprints, Trash2, ArrowRight,
  Bookmark, Volume2, Search, Award, BookMarked, Eye, EyeOff, Calendar, Shield, Feather, Brain
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import useTasksStore from '../store/tasksStore';
import HabitItem from '../components/ui/HabitItem';
import ProgressRing from '../components/ui/ProgressRing';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { getToday } from '../db/database';
import { STROLL_PATHS } from './Stroll';
import { speakLanguagePhrase } from '../data/languageLearningData';
import NoSelfBlameSection from '../components/myday/NoSelfBlameSection';
import SubconsciousBeliefsSection from '../components/myday/SubconsciousBeliefsSection';

const AVAILABLE_MODULES = [
  { id: 'mindfulness', nameFa: 'مراقبه و آرامش', nameEn: 'Mindfulness', icon: '🧘', color: 'text-teal-400 bg-teal-500/10' },
  { id: 'health', nameFa: 'سلامتی', nameEn: 'Health', icon: '🍏', color: 'text-cyan-400 bg-cyan-500/10' },
  { id: 'wealth', nameFa: 'ثروت', nameEn: 'Wealth', icon: '💰', color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'selfDiscovery', nameFa: 'خودشناسی', nameEn: 'Discovery', icon: '🪞', color: 'text-purple-400 bg-purple-500/10' },
  { id: 'learning', nameFa: 'یادگیری', nameEn: 'Learning', icon: '📚', color: 'text-blue-400 bg-blue-500/10' },
  { id: 'integrity', nameFa: 'درستی', nameEn: 'Integrity', icon: '🏛️', color: 'text-amber-400 bg-amber-500/10' },
  { id: 'security', nameFa: 'امنیت', nameEn: 'Security', icon: '🛡️', color: 'text-rose-400 bg-rose-500/10' },
  { id: 'addiction', nameFa: 'رهایی', nameEn: 'Freedom', icon: '🧬', color: 'text-indigo-400 bg-indigo-500/10' },
];

const POPULAR_HABIT_PRESETS = [
  { nameFa: '💧 نوشیدن ۸ لیوان آب', nameEn: '💧 Drink 8 Glasses of Water', icon: '💧', sectionId: 'health', reminderTime: '10:00' },
  { nameFa: '🧘 ۱۰ دقیقه مراقبه و تنفس', nameEn: '🧘 10 Min Meditation', icon: '🧘', sectionId: 'mindfulness', reminderTime: '08:00' },
  { nameFa: '🏃 ۲۰ دقیقه ورزش هوازی / پیاده‌روی', nameEn: '🏃 20 Min Cardio Walk', icon: '🏃', sectionId: 'health', reminderTime: '17:30' },
  { nameFa: '📖 ۱۵ دقیقه مطالعه کتاب', nameEn: '📖 15 Min Book Reading', icon: '📚', sectionId: 'learning', reminderTime: '21:00' },
  { nameFa: '💰 ثبت دخل و خرج امروز', nameEn: '💰 Daily Expense Audit', icon: '💰', sectionId: 'wealth', reminderTime: '21:30' },
  { nameFa: '🥗 حذف قند و فست‌فود', nameEn: '🥗 Zero Junk Food', icon: '🥗', sectionId: 'health', reminderTime: '13:00' },
  { nameFa: '😴 خاموشی دیجیتال ساعت ۲۳', nameEn: '😴 Digital Detox at 23:00', icon: '🌙', sectionId: 'mindfulness', reminderTime: '22:45' },
];

const ICONS_POOL = ['💧', '🏃', '🧘', '📚', '🥗', '💰', '😴', '🧠', '⚡', '🍎', '🛡️', '💎', '🔥', '🌿', '🎯', '✨'];

const MOODS = [
  { level: 1, icon: '😫', labelFa: 'فرسوده', labelEn: 'Exhausted', color: 'text-rose-400' },
  { level: 2, icon: '😔', labelFa: 'پایین', labelEn: 'Low', color: 'text-orange-400' },
  { level: 3, icon: '😐', labelFa: 'معمولی', labelEn: 'Neutral', color: 'text-slate-400' },
  { level: 4, icon: '🙂', labelFa: 'خوب', labelEn: 'Good', color: 'text-emerald-400' },
  { level: 5, icon: '🤩', labelFa: 'عالی', labelEn: 'Great', color: 'text-amber-400' }
];

export default function MyDay() {
  const navigate = useNavigate();
  const pinnedStrollIds = useAppStore(state => state.pinnedStrollIds) || [];
  const togglePinStroll = useAppStore(state => state.togglePinStroll);
  const learningVault = useAppStore(state => state.learningVault) || [];
  const removeFromVault = useAppStore(state => state.removeFromVault);
  const toggleVaultMastery = useAppStore(state => state.toggleVaultMastery);
  const { language, theme, addXP, addCoins, myDayModules, toggleMyDayModule } = useAppStore();
  const { 
    habits, todayLogs, loadHabits, toggleHabit, deleteHabit, addHabit,
    addJournalEntry, addGratitude
  } = useSectionsStore();
  const { tasks, loadTasks, toggleTask, addTask, deleteTask } = useTasksStore();
  
  const isRtl = language === 'fa';
  const todayDateStr = getToday();

  const [localPinnedIds, setLocalPinnedIds] = useState(pinnedStrollIds);
  const [localVault, setLocalVault] = useState(learningVault);
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState('all');
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [isVaultExpanded, setIsVaultExpanded] = useState(true);
  const [playingVaultId, setPlayingVaultId] = useState(null);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    setLocalPinnedIds(pinnedStrollIds);
  }, [pinnedStrollIds]);

  useEffect(() => {
    setLocalVault(learningVault);
  }, [learningVault]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail) setLocalPinnedIds(e.detail);
    };
    const vaultHandler = (e) => {
      if (e.detail) setLocalVault(e.detail);
    };
    window.addEventListener('lifeos_pinned_strolls_updated', handler);
    window.addEventListener('lifeos_learning_vault_updated', vaultHandler);
    return () => {
      window.removeEventListener('lifeos_pinned_strolls_updated', handler);
      window.removeEventListener('lifeos_learning_vault_updated', vaultHandler);
    };
  }, []);

  const pinnedStrolls = STROLL_PATHS.filter(p => (localPinnedIds || []).includes(p.id));

  // Active Tab: 'tasks', 'habits', 'reflection'
  const [activeTab, setActiveTab] = useState('tasks');

  // Water & Mood State
  const [waterCount, setWaterCount] = useState(() => {
    return parseInt(localStorage.getItem(`lifeos_water_${todayDateStr}`) || '0', 10);
  });
  const [dailyMood, setDailyMood] = useState(() => {
    return parseInt(localStorage.getItem(`lifeos_mood_${todayDateStr}`) || '0', 10);
  });

  // Pomodoro State
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState('focus'); // 'focus' | 'break'

  // Task creation state with Alarm Time
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskHasAlarm, setNewTaskHasAlarm] = useState(false);

  // Habit creation state
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitSection, setNewHabitSection] = useState('mindfulness');
  const [newHabitIcon, setNewHabitIcon] = useState('✨');
  const [newHabitTime, setNewHabitTime] = useState('09:00');
  const [newHabitHasAlarm, setNewHabitHasAlarm] = useState(false);

  // Reflection inputs
  const [quickGratitude, setQuickGratitude] = useState('');
  const [gratitudeSaved, setGratitudeSaved] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  useEffect(() => {
    loadHabits('all');
    loadTasks(todayDateStr);
  }, []);

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval = null;
    if (isPomoRunning) {
      interval = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(s => s - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes(m => m - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished
          clearInterval(interval);
          setIsPomoRunning(false);
          soundEngine.playLevelUp?.();
          soundEngine.playAlarm?.();
          haptics.success();
          
          if (pomoMode === 'focus') {
            addXP(20, isRtl ? 'اتمام تمرکز پومودورو' : 'Focus Session Complete');
            addCoins(10);
            if (window.confirm(isRtl ? 'زمان تمرکز تمام شد! ۵ دقیقه استراحت شروع شود؟' : 'Focus done! Start 5m break?')) {
              setPomoMode('break');
              setPomoMinutes(5);
              setPomoSeconds(0);
              setIsPomoRunning(true);
            } else {
              setPomoMode('focus');
              setPomoMinutes(25);
            }
          } else {
            if (window.confirm(isRtl ? 'استراحت تمام شد! شروع تمرکز جدید؟' : 'Break over! Start new focus?')) {
              setPomoMode('focus');
              setPomoMinutes(25);
              setPomoSeconds(0);
              setIsPomoRunning(true);
            } else {
              setPomoMode('focus');
              setPomoMinutes(25);
            }
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoMinutes, pomoSeconds, pomoMode, isRtl]);

  const handleWaterClick = (delta) => {
    const next = Math.max(0, Math.min(12, waterCount + delta));
    setWaterCount(next);
    localStorage.setItem(`lifeos_water_${todayDateStr}`, String(next));
    if (delta > 0) {
      soundEngine.playWaterDrop?.() || soundEngine.playTap?.();
      haptics.success();
      addXP(5, isRtl ? 'نوشیدن آب' : 'Hydration');
    } else {
      haptics.tap();
    }
  };

  const handleMoodSelect = (level) => {
    setDailyMood(level);
    localStorage.setItem(`lifeos_mood_${todayDateStr}`, String(level));
    haptics.tap();
    addXP(5, isRtl ? 'ثبت وضعیت احساسی' : 'Mood Logged');
  };

  const handleSaveQuickGratitude = async (e) => {
    e.preventDefault();
    if (!quickGratitude.trim()) return;
    await addGratitude(quickGratitude.trim());
    soundEngine.playLevelUp?.();
    haptics.success();
    addXP(15, isRtl ? 'ثبت شکرگزاری' : 'Gratitude');
    addCoins(5);
    setGratitudeSaved(true);
    setQuickGratitude('');
    setTimeout(() => setGratitudeSaved(false), 3000);
  };

  // Add Task with Alarm
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask({
      title: newTaskTitle.trim(),
      date: todayDateStr,
      sectionId: 'my-day',
      priority: newTaskPriority,
      dueTime: newTaskHasAlarm ? newTaskTime : '',
      alarmTime: newTaskHasAlarm ? newTaskTime : '',
      reminder: newTaskHasAlarm
    });
    soundEngine.playCheckmark?.();
    haptics.success();
    addXP(5, isRtl ? 'ایجاد وظیفه جدید' : 'New Task Added');
    setNewTaskTitle('');
    setNewTaskTime('');
    setNewTaskHasAlarm(false);
  };

  // Add Custom Habit with Alarm
  const handleCreateCustomHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await addHabit({
      sectionId: newHabitSection,
      name: newHabitName.trim(),
      nameFa: newHabitName.trim(),
      nameEn: newHabitName.trim(),
      icon: newHabitIcon,
      reminderTime: newHabitHasAlarm ? newHabitTime : '',
      alarmTime: newHabitHasAlarm ? newHabitTime : '',
      xp: 15,
      frequency: 'daily'
    });
    soundEngine.playLevelUp?.();
    haptics.success();
    addXP(15, isRtl ? 'افزودن عادت جدید' : 'Custom Habit Created');
    addCoins(5);
    setNewHabitName('');
    setShowHabitForm(false);
  };

  // Add Preset Habit
  const handleAddPresetHabit = async (preset) => {
    const existing = habits.find(h => (h.nameFa === preset.nameFa || h.name === preset.nameFa));
    if (existing) {
      alert(isRtl ? 'این عادت قبلاً به لیست شما اضافه شده است.' : 'This habit already exists in your list.');
      return;
    }
    await addHabit({
      sectionId: preset.sectionId,
      name: preset.nameFa,
      nameFa: preset.nameFa,
      nameEn: preset.nameEn,
      icon: preset.icon,
      reminderTime: preset.reminderTime,
      alarmTime: preset.reminderTime,
      xp: 15,
      frequency: 'daily'
    });
    soundEngine.playLevelUp?.();
    haptics.success();
    addXP(15, preset.nameFa);
    addCoins(5);
  };

  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) return;
    await addJournalEntry({
      content: reflectionText.trim(),
      mood: dailyMood || 3,
      tags: ['evening-reflection', 'my-day'],
      title: isRtl ? 'بازتاب شبانگاهی' : 'Evening Reflection'
    });
    soundEngine.playLevelUp?.();
    haptics.success();
    addXP(25, isRtl ? 'ثبت بازتاب روزانه' : 'Evening Reflection');
    addCoins(10);
    setReflectionSaved(true);
    setReflectionText('');
    setTimeout(() => setReflectionSaved(false), 3000);
  };

  // Filter habits by active modules in My Day
  const activeModuleSet = new Set(myDayModules || ['mindfulness', 'health', 'wealth', 'selfDiscovery', 'learning', 'integrity']);
  const myDayHabits = habits.filter(h => activeModuleSet.has(h.sectionId));

  // Progress Calculations
  const totalItems = myDayHabits.length + tasks.length;
  const completedHabits = myDayHabits.filter(h => todayLogs[h.id]).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalCompleted = completedHabits + completedTasks;
  const progressPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const formatPomoTime = (m, s) => `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="page-container flex flex-col gap-6 pb-24 max-w-4xl mx-auto">
      
      {/* 1. HEADER & DAILY PROGRESS RING */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl border border-emerald-500/30 glass-card bg-gradient-to-br from-emerald-950/30 via-[var(--bg-card)] to-teal-950/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 text-center sm:text-start flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
            <Activity size={14} />
            <span>{isRtl ? 'داشبورد جامع فرماندهی روز' : 'Daily Command Center'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] leading-tight">
            {isRtl ? 'امروز من' : 'My Day'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
            {isRtl
              ? 'تمرکز کن، اهدافت را خط بزن و با زنگ یادآوری هوشمند به عاداتت پایبند بمان.'
              : 'Focus deeply, track habits with alarms, and win your day with sovereign discipline.'}
          </p>
        </div>

        {/* Progress Ring */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/20 border border-emerald-500/20 shadow-inner">
          <ProgressRing percentage={progressPercent} size={100} strokeWidth={10} color="#10b981">
            <div className="text-center">
              <span className="text-xl font-black text-emerald-400">{progressPercent}%</span>
              <span className="text-[10px] text-[var(--text-secondary)] block font-bold mt-0.5">
                {totalCompleted}/{totalItems} {isRtl ? 'تکمیل' : 'Done'}
              </span>
            </div>
          </ProgressRing>
        </div>
      </motion.div>

      {/* 2. FOCUS & METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pomodoro Focus Timer */}
        <div className="p-5 rounded-3xl border border-purple-500/30 glass-card bg-gradient-to-br from-purple-950/20 via-[var(--bg-card)] to-indigo-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <Target size={18} className="text-purple-400" />
              <span>{isRtl ? 'تایمر تمرکز (پومودورو)' : 'Focus Timer'}</span>
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${pomoMode === 'focus' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'}`}>
              {pomoMode === 'focus' ? (isRtl ? 'تمرکز عمیق' : 'Deep Work') : (isRtl ? 'استراحت' : 'Break')}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-5xl font-black tracking-widest text-[var(--text-primary)] font-mono drop-shadow-lg">
              {formatPomoTime(pomoMinutes, pomoSeconds)}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsPomoRunning(!isPomoRunning)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                isPomoRunning 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                  : 'bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
              }`}
            >
              {isPomoRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button
              onClick={() => {
                setIsPomoRunning(false);
                setPomoMode('focus');
                setPomoMinutes(25);
                setPomoSeconds(0);
                haptics.tap();
              }}
              className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors shadow-sm"
              title={isRtl ? 'بازنشانی تمرکز' : 'Reset Focus'}
            >
              <Square size={18} fill="currentColor" />
            </button>
            <button
              onClick={() => {
                setIsPomoRunning(false);
                setPomoMode('break');
                setPomoMinutes(5);
                setPomoSeconds(0);
                haptics.tap();
              }}
              className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-teal-400 hover:bg-teal-500/10 transition-colors shadow-sm"
              title={isRtl ? 'شروع استراحت ۵ دقیقه‌ای' : 'Start 5m Break'}
            >
              <Coffee size={20} />
            </button>
          </div>
        </div>

        {/* Daily Mood & Water */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Mood Tracker */}
          <div className="p-4 rounded-3xl border border-amber-500/30 glass-card bg-gradient-to-br from-amber-950/20 to-transparent flex-1">
            <h3 className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-1.5">
              <Smile size={14} />
              <span>{isRtl ? 'وضعیت احساسی امروز شما' : 'Today\'s Mood Check-in'}</span>
            </h3>
            <div className="flex items-center justify-between gap-1 mt-2">
              {MOODS.map(m => (
                <button
                  key={m.level}
                  onClick={() => handleMoodSelect(m.level)}
                  className={`flex flex-col items-center justify-center gap-1.5 flex-1 p-2 rounded-xl transition-all ${
                    dailyMood === m.level 
                      ? 'bg-amber-500/20 border border-amber-500/40 scale-110 shadow-sm' 
                      : 'hover:bg-white/5 opacity-60 hover:opacity-100 border border-transparent hover:border-[var(--border)]'
                  }`}
                >
                  <span className="text-2xl drop-shadow-md">{m.icon}</span>
                  <span className={`text-[9px] font-bold ${dailyMood === m.level ? m.color : 'text-slate-400'}`}>
                    {isRtl ? m.labelFa : m.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Water Tracker Mini */}
          <div className="p-4 rounded-3xl border border-cyan-500/30 glass-card bg-gradient-to-br from-cyan-950/20 to-transparent flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                <Droplets size={14} />
                <span>{isRtl ? 'پایش هیدراتاسیون (آب)' : 'Hydration Tracker'}</span>
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-medium">
                {waterCount} {isRtl ? 'از ۸ لیوان هدف (۲ لیتر)' : 'of 8 glasses (2L)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWaterClick(-1)}
                disabled={waterCount === 0}
                className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-white/5 transition-colors"
              >
                -
              </button>
              <button
                onClick={() => handleWaterClick(1)}
                className="w-11 h-11 rounded-full bg-cyan-600 text-white flex items-center justify-center font-black shadow-lg hover:bg-cyan-500 transition-colors text-xl"
              >
                +
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2.5. MY DAY PINNED STROLLS (راه‌روهای انتخابی امروز من) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Footprints size={16} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                {isRtl ? 'راه‌روهای امروز من' : 'My Day Strolls'}
              </h2>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                {isRtl ? 'مسیرهای هدایت‌شده و تمرینات روزانه انتخابی شما' : 'Your selected guided daily journeys'}
              </span>
            </div>
          </div>

          <Link
            to="/stroll"
            onClick={() => { soundEngine.playTap?.(); haptics.tap(); }}
            className="text-xs font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>{isRtl ? '+ مدیریت و افزودن راه‌رو' : '+ Browse Strolls'}</span>
          </Link>
        </div>

        {pinnedStrolls.length === 0 ? (
          <div className="p-5 rounded-3xl border border-dashed border-[var(--border)] glass-card bg-[var(--bg-secondary)]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚶‍♂️</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  {isRtl ? 'هنوز راه‌رویی به امروز من اضافه نکرده‌اید' : 'No Strolls Pinned to My Day Yet'}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-medium">
                  {isRtl 
                    ? 'از میان ۱۶ راه‌روی تخصصی (تنفس، ثروت، خودشناسی، ورزش و...) مسیرهای دلخواهتان را با زدن دکمه «افزودن به امروز من» به این بخش سنجاق کنید.'
                    : 'Pin your favorite guided paths (breath, wealth, self-discovery, cardio) from the Stroll library to practice daily.'}
                </p>
              </div>
            </div>

            <Link
              to="/stroll"
              onClick={() => { soundEngine.playTap?.(); haptics.tap(); }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md shrink-0 hover:opacity-95 active:scale-95 transition-all"
            >
              {isRtl ? 'مشاهده و انتخاب راه‌روها' : 'Explore Strolls'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {pinnedStrolls.map(path => (
              <div
                key={path.id}
                className={`p-4 rounded-3xl border glass-card bg-gradient-to-br ${path.color} flex flex-col justify-between gap-3 shadow-md hover:shadow-lg transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{path.icon}</span>
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-[var(--text-primary)]">
                        {isRtl ? path.titleFa : path.titleEn}
                      </h4>
                      <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold">
                        {path.steps.length} {isRtl ? 'گام روزانه' : 'steps'} • +{path.xpReward} XP
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePinStroll(path.id)}
                    className="p-1.5 rounded-xl bg-black/10 dark:bg-black/30 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors"
                    title={isRtl ? 'حذف از امروز من' : 'Remove from My Day'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-medium">
                  {isRtl ? path.descFa : path.descEn}
                </p>

                <button
                  onClick={() => {
                    soundEngine.playTap?.();
                    haptics.tap();
                    navigate(`/stroll?id=${path.id}`);
                  }}
                  className={`w-full py-2 px-3 rounded-2xl bg-gradient-to-r ${path.gradientFrom} ${path.gradientTo} text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 active:scale-95 transition-all`}
                >
                  <span>{isRtl ? 'شروع این راه‌رو' : 'Start Stroll'}</span>
                  <ArrowRight size={13} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2.6. MY LEARNING TREASURE VAULT (گنجینه آموزش و یادگیری من) */}
      <div className="space-y-3">
        <div className="p-4 sm:p-5 rounded-3xl border border-amber-500/30 glass-card bg-gradient-to-br from-amber-950/25 via-[var(--bg-card)] to-yellow-950/15 shadow-lg space-y-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <span className="text-xl">💎</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                    {isRtl ? 'گنجینه آموزش و یادگیری من' : 'My Learning Treasure Vault'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40">
                    {localVault.length} {isRtl ? 'مورد' : 'saved'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {isRtl ? 'بانک عبارات، مکالمات و حکمت‌های برگزیده شما با تلفظ صوتی' : 'Your saved polyglot phrases, dialogues and wisdom with instant audio'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {localVault.length > 0 && (
                <button
                  onClick={() => {
                    setIsFlashcardMode(m => !m);
                    setFlashcardIdx(0);
                    setIsCardFlipped(false);
                    soundEngine.playTap?.();
                    haptics.tap();
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-sm transition-all ${
                    isFlashcardMode
                      ? 'bg-amber-500 text-black border-amber-400 font-black'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>{isFlashcardMode ? (isRtl ? 'خروج از فلش‌کارت' : 'Exit Flashcards') : (isRtl ? 'حالت فلش‌کارت 🎴' : 'Flashcard Mode')}</span>
                </button>
              )}

              <button
                onClick={() => setIsVaultExpanded(e => !e)}
                className="p-1.5 rounded-xl bg-white/5 border border-[var(--border)] text-slate-400 hover:text-[var(--text-primary)]"
                title={isVaultExpanded ? (isRtl ? 'بستن' : 'Collapse') : (isRtl ? 'باز کردن' : 'Expand')}
              >
                {isVaultExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {isVaultExpanded && (
            <div className="space-y-3.5 pt-1 border-t border-amber-500/20">
              
              {/* Filter Chips & Search Bar */}
              {localVault.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  {/* Universal Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { id: 'all', labelFa: '✨ همه', labelEn: 'All', count: localVault.length },
                      { id: 'lang', labelFa: '🗣️ زبان‌ها', labelEn: 'Languages', count: localVault.filter(v => ['ja', 'en', 'fr'].includes(v.lang) || v.type === 'greeting' || v.type === 'dialogue' || v.type === 'idiom').length },
                      { id: 'wisdom', labelFa: '📜 حکمت و نقل‌قول', labelEn: 'Wisdom', count: localVault.filter(v => v.type === 'wisdom' || v.sectionId === 'learning' || v.categoryFa?.includes('حکمت')).length },
                      { id: 'wealth', labelFa: '💰 ثروت و هوش مالی', labelEn: 'Wealth', count: localVault.filter(v => v.sectionId === 'wealth' || v.categoryFa?.includes('مالی') || v.categoryFa?.includes('ثروت')).length },
                      { id: 'selfDiscovery', labelFa: '🪞 خودشناسی', labelEn: 'Self-Discovery', count: localVault.filter(v => v.sectionId === 'selfDiscovery' || v.categoryFa?.includes('خودشناسی')).length },
                      { id: 'mindfulness', labelFa: '🧘 مراقبه و آرامش', labelEn: 'Mindfulness', count: localVault.filter(v => v.sectionId === 'mindfulness' || v.categoryFa?.includes('مراقبه') || v.categoryFa?.includes('تنفس')).length },
                      { id: 'integrity', labelFa: '🏛️ درستی و اصول', labelEn: 'Integrity', count: localVault.filter(v => v.sectionId === 'integrity' || v.categoryFa?.includes('درستی') || v.categoryFa?.includes('اصول')).length },
                      { id: 'world', labelFa: '🌍 جهان و دانستنی‌ها', labelEn: 'World & Facts', count: localVault.filter(v => v.sectionId === 'world' || v.categoryFa?.includes('جهان') || v.categoryFa?.includes('حقایق')).length },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setVaultCategoryFilter(cat.id);
                          soundEngine.playTap?.();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition-all border ${
                          vaultCategoryFilter === cat.id
                            ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                            : 'bg-black/20 border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {isRtl ? cat.labelFa : cat.labelEn} ({cat.count})
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full">
                    <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={vaultSearchQuery}
                      onChange={e => setVaultSearchQuery(e.target.value)}
                      placeholder={isRtl ? 'جستجو در بین تمام کارت‌های گنجینه (زبان، حکمت، ثروت، خودشناسی و...)' : 'Search all vault cards...'}
                      className="w-full ps-8 pe-3 py-2 rounded-xl bg-black/30 border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              )}

              {/* EMPTY STATE */}
              {localVault.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-amber-500/30 bg-black/20 text-center space-y-3">
                  <span className="text-4xl block">💎✨</span>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                      {isRtl ? 'گنجینه یادگیری شما هنوز خالی است' : 'Your Learning Vault is Empty'}
                    </h4>
                    <p className="text-[11px] text-slate-300 max-w-md mx-auto leading-relaxed">
                      {isRtl
                        ? 'در تمام بخش‌های برنامه (راه‌روها، خانه، یادگیری، ثروت، خودشناسی، درستی و جهان) روی آیکون 💎 (افزودن به گنجینه) بزنید تا کارت‌ها بلافاصله در اینجا ذخیره شوند.'
                        : 'Tap the 💎 vault icon on any card across the app to instantly bookmark it here.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <Link
                      to="/stroll"
                      onClick={() => { soundEngine.playTap?.(); haptics.tap(); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs shadow-md hover:opacity-95"
                    >
                      <span>{isRtl ? 'ورود به راه‌روها 🚶‍♂️' : 'Explore Strolls'}</span>
                    </Link>
                    <Link
                      to="/learning"
                      onClick={() => { soundEngine.playTap?.(); haptics.tap(); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-slate-200 font-bold text-xs hover:bg-white/15"
                    >
                      <span>{isRtl ? 'بخش یادگیری 📚' : 'Learning'}</span>
                    </Link>
                  </div>
                </div>
              ) : isFlashcardMode ? (
                /* FLASHCARD REVIEW MODE */
                (() => {
                  const filtered = localVault.filter(item => {
                    if (vaultCategoryFilter === 'lang') {
                      return ['ja', 'en', 'fr'].includes(item.lang) || ['greeting', 'dialogue', 'idiom'].includes(item.type);
                    }
                    if (vaultCategoryFilter === 'wisdom') {
                      return item.type === 'wisdom' || item.sectionId === 'learning' || item.categoryFa?.includes('حکمت');
                    }
                    if (vaultCategoryFilter === 'wealth') {
                      return item.sectionId === 'wealth' || item.categoryFa?.includes('مالی') || item.categoryFa?.includes('ثروت');
                    }
                    if (vaultCategoryFilter === 'selfDiscovery') {
                      return item.sectionId === 'selfDiscovery' || item.categoryFa?.includes('خودشناسی');
                    }
                    if (vaultCategoryFilter === 'mindfulness') {
                      return item.sectionId === 'mindfulness' || item.categoryFa?.includes('مراقبه') || item.categoryFa?.includes('تنفس');
                    }
                    if (vaultCategoryFilter === 'integrity') {
                      return item.sectionId === 'integrity' || item.categoryFa?.includes('درستی') || item.categoryFa?.includes('اصول');
                    }
                    if (vaultCategoryFilter === 'world') {
                      return item.sectionId === 'world' || item.categoryFa?.includes('جهان') || item.categoryFa?.includes('حقایق');
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-6 text-xs text-slate-400">
                        {isRtl ? 'موردی در این دسته‌بندی یافت نشد.' : 'No items in this category.'}
                      </div>
                    );
                  }

                  const safeIdx = Math.min(flashcardIdx, filtered.length - 1);
                  const currentCard = filtered[safeIdx];
                  const mainText = currentCard.phrase || currentCard.title || currentCard.titleFa || currentCard.nameFa || currentCard.name || currentCard.content;
                  const meaningText = currentCard.meaningFa || currentCard.meaningEn || currentCard.descFa || currentCard.contentFa || currentCard.tipFa || currentCard.note || currentCard.content;
                  const isLight = ['light', 'dawn', 'mint'].includes(theme);

                  return (
                    <div className="space-y-4 py-2 max-w-md mx-auto">
                      <div className="flex items-center justify-between text-xs font-bold px-1 text-[var(--text-secondary)]">
                        <span>{isRtl ? `کارت ${safeIdx + 1} از ${filtered.length}` : `Card ${safeIdx + 1} of ${filtered.length}`}</span>
                        <span className="text-amber-500 font-black">{currentCard.flag || currentCard.icon || '💎'} {currentCard.categoryFa || currentCard.categoryEn || 'گنجینه'}</span>
                      </div>

                      {/* Flip Card */}
                      <div
                        onClick={() => {
                          setIsCardFlipped(f => !f);
                          soundEngine.playTap?.();
                        }}
                        className={`p-6 min-h-[220px] rounded-3xl border-2 transition-all select-none flex flex-col justify-between items-center shadow-xl cursor-pointer hover:scale-[1.01] ${
                          isLight
                            ? 'border-amber-400/70 bg-gradient-to-br from-white via-amber-50/70 to-orange-50/40 text-slate-900 shadow-amber-500/10'
                            : 'border-amber-500/40 bg-gradient-to-br from-slate-900/95 via-slate-950/98 to-amber-950/30 text-white shadow-purple-950/20'
                        }`}
                      >
                        <div className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                          isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {isCardFlipped ? (isRtl ? 'پشت کارت (معنی و توضیح)' : 'Back (Meaning)') : (isRtl ? 'روی کارت (کلیک برای چرخش)' : 'Front (Click to flip)')}
                        </div>

                        {!isCardFlipped ? (
                          <div className="space-y-2.5 my-auto text-center">
                            <h3 className={`text-base sm:text-xl font-black ${isLight ? 'text-slate-950' : 'text-slate-100'}`} dir={currentCard.lang ? 'ltr' : (isRtl ? 'rtl' : 'ltr')}>
                              {mainText}
                            </h3>
                            {currentCard.phoneticFa && (
                              <p className={`text-xs font-bold font-mono ${isLight ? 'text-amber-800 bg-amber-100/60 px-3 py-1 rounded-xl inline-block' : 'text-amber-300'}`}>
                                🗣️ {currentCard.phoneticFa}
                              </p>
                            )}
                            {currentCard.authorFa && (
                              <p className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                — {currentCard.authorFa}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2.5 my-auto text-center">
                            <p className={`text-sm sm:text-base font-black leading-relaxed ${isLight ? 'text-emerald-900' : 'text-emerald-300'}`}>
                              💡 {meaningText}
                            </p>
                            {currentCard.contextFa && (
                              <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                📌 {currentCard.contextFa}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakLanguagePhrase(
                                mainText,
                                currentCard.ttsCode || (currentCard.lang === 'ja' ? 'ja-JP' : currentCard.lang === 'fr' ? 'fr-FR' : currentCard.lang === 'en' ? 'en-US' : 'fa-IR')
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black transition-all ${
                              isLight
                                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-md font-black'
                                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                            }`}
                          >
                            <Volume2 size={14} />
                            <span>{isRtl ? 'تلفظ صوتی' : 'Listen'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between gap-2.5">
                        <button
                          onClick={() => {
                            setFlashcardIdx(i => Math.max(0, i - 1));
                            setIsCardFlipped(false);
                            soundEngine.playTap?.();
                          }}
                          disabled={safeIdx === 0}
                          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-amber-400 disabled:opacity-30 shadow-xs"
                        >
                          {isRtl ? 'قبلی' : 'Prev'}
                        </button>

                        <button
                          onClick={() => {
                            toggleVaultMastery(currentCard.id);
                            const latest = useAppStore.getState().learningVault || [];
                            setLocalVault([...latest]);
                            soundEngine.playLevelUp?.();
                            haptics.success();
                          }}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                            currentCard.mastered
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-black'
                              : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-emerald-500/50 hover:text-emerald-500'
                          }`}
                        >
                          <CheckCircle2 size={14} className={currentCard.mastered ? 'text-emerald-500 font-bold' : ''} />
                          <span>{currentCard.mastered ? (isRtl ? 'تسلط یافتم ✓' : 'Mastered ✓') : (isRtl ? 'علامت تسلط' : 'Mark Mastered')}</span>
                        </button>

                        <button
                          onClick={() => {
                            setFlashcardIdx(i => Math.min(filtered.length - 1, i + 1));
                            setIsCardFlipped(false);
                            soundEngine.playTap?.();
                          }}
                          disabled={safeIdx === filtered.length - 1}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-black disabled:opacity-30 shadow-md hover:opacity-95"
                        >
                          {isRtl ? 'بعدی' : 'Next'}
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* GRID OF SAVED VAULT CARDS ACROSS ALL SECTIONS */
                (() => {
                  const filtered = localVault.filter(item => {
                    if (vaultCategoryFilter === 'lang') {
                      const isLang = ['ja', 'en', 'fr'].includes(item.lang) || ['greeting', 'dialogue', 'idiom'].includes(item.type);
                      if (!isLang) return false;
                    } else if (vaultCategoryFilter === 'wisdom') {
                      const isWisdom = item.type === 'wisdom' || item.sectionId === 'learning' || item.categoryFa?.includes('حکمت');
                      if (!isWisdom) return false;
                    } else if (vaultCategoryFilter === 'wealth') {
                      const isWealth = item.sectionId === 'wealth' || item.categoryFa?.includes('مالی') || item.categoryFa?.includes('ثروت');
                      if (!isWealth) return false;
                    } else if (vaultCategoryFilter === 'selfDiscovery') {
                      const isSelf = item.sectionId === 'selfDiscovery' || item.categoryFa?.includes('خودشناسی');
                      if (!isSelf) return false;
                    } else if (vaultCategoryFilter === 'mindfulness') {
                      const isMind = item.sectionId === 'mindfulness' || item.categoryFa?.includes('مراقبه') || item.categoryFa?.includes('تنفس');
                      if (!isMind) return false;
                    } else if (vaultCategoryFilter === 'integrity') {
                      const isInteg = item.sectionId === 'integrity' || item.categoryFa?.includes('درستی') || item.categoryFa?.includes('اصول');
                      if (!isInteg) return false;
                    } else if (vaultCategoryFilter === 'world') {
                      const isWorld = item.sectionId === 'world' || item.categoryFa?.includes('جهان') || item.categoryFa?.includes('حقایق');
                      if (!isWorld) return false;
                    }

                    if (vaultSearchQuery.trim()) {
                      const q = vaultSearchQuery.toLowerCase();
                      const matchPhrase = (item.phrase || '').toLowerCase().includes(q);
                      const matchTitle = (item.title || item.titleFa || '').toLowerCase().includes(q);
                      const matchMeaning = (item.meaningFa || item.meaningEn || item.descFa || item.contentFa || '').toLowerCase().includes(q);
                      const matchPhonetic = (item.phoneticFa || '').toLowerCase().includes(q);
                      return matchPhrase || matchTitle || matchMeaning || matchPhonetic;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-6 text-xs text-slate-400">
                        {isRtl ? 'هیچ کارتی با این فیلتر یا جستجو یافت نشد.' : 'No cards found with this filter.'}
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filtered.map(item => {
                        const titleText = item.phrase || item.title || item.titleFa || item.nameFa || item.name || item.content;
                        const meaningText = item.meaningFa || item.meaningEn || item.descFa || item.contentFa || item.tipFa || item.note || item.content;

                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-3xl border glass-card flex flex-col justify-between gap-3 shadow-md hover:border-amber-400/50 transition-all ${
                              item.mastered
                                ? 'bg-emerald-500/10 border-emerald-500/40'
                                : 'bg-[var(--bg-card)] border-[var(--border)]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{item.flag || item.icon || '💎'}</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-black border border-amber-500/30">
                                  {isRtl ? (item.categoryFa || 'گنجینه') : (item.categoryEn || 'Vault')}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Mastered Toggle */}
                                <button
                                  onClick={() => {
                                    toggleVaultMastery(item.id);
                                    const latest = useAppStore.getState().learningVault || [];
                                    setLocalVault([...latest]);
                                    soundEngine.playTap?.();
                                    haptics.tap();
                                  }}
                                  className={`p-1.5 rounded-xl border transition-colors ${
                                    item.mastered
                                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                      : 'bg-white/5 border-[var(--border)] text-slate-400 hover:text-emerald-400'
                                  }`}
                                  title={item.mastered ? (isRtl ? 'مسلط شدید' : 'Mastered') : (isRtl ? 'علامت تسلط' : 'Mark Mastered')}
                                >
                                  <Check size={13} className={item.mastered ? 'text-emerald-400 font-black' : ''} />
                                </button>

                                {/* Remove Button */}
                                <button
                                  onClick={() => {
                                    removeFromVault(item.id);
                                    const latest = useAppStore.getState().learningVault || [];
                                    setLocalVault([...latest]);
                                    soundEngine.playTap?.();
                                  }}
                                  className="p-1.5 rounded-xl bg-white/5 border border-[var(--border)] text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                                  title={isRtl ? 'حذف از گنجینه' : 'Remove from Vault'}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-[var(--text-primary)] tracking-wide" dir={item.lang ? 'ltr' : (isRtl ? 'rtl' : 'ltr')}>
                                {titleText}
                              </h4>
                              {item.phoneticFa && (
                                <p className="text-[11px] text-amber-300 font-medium">
                                  🗣️ تلفظ: <span className="font-mono">{item.phoneticFa}</span>
                                </p>
                              )}
                              {item.authorFa && (
                                <p className="text-[11px] text-slate-400">
                                  — {item.authorFa}
                                </p>
                              )}
                            </div>

                            {meaningText && (
                              <p className="text-[11px] text-emerald-400 font-medium leading-relaxed" dir={isRtl ? 'rtl' : 'ltr'}>
                                💡 {meaningText}
                              </p>
                            )}

                            {/* Audio Playback Button & Footer */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.mastered ? (isRtl ? '✓ تسلط کامل' : '✓ Mastered') : (isRtl ? 'در حال یادگیری' : 'Learning')}
                              </span>

                              <button
                                onClick={() => {
                                  setPlayingVaultId(item.id);
                                  speakLanguagePhrase(
                                    titleText,
                                    item.ttsCode || (item.lang === 'ja' ? 'ja-JP' : item.lang === 'fr' ? 'fr-FR' : item.lang === 'en' ? 'en-US' : 'fa-IR')
                                  );
                                  setTimeout(() => setPlayingVaultId(null), 2500);
                                }}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                                  playingVaultId === item.id
                                    ? 'bg-emerald-600 text-white animate-pulse'
                                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black hover:opacity-90'
                                }`}
                              >
                                <Volume2 size={13} />
                                <span>{playingVaultId === item.id ? (isRtl ? 'در حال پخش...' : 'Playing...') : (isRtl ? 'تلفظ صوتی' : 'Pronounce')}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2.7. NO SELF-BLAME & COMPASSIONATE GROWTH (سرزنش نکن و رفتار درست) */}
      <NoSelfBlameSection isRtl={isRtl} />

      {/* 2.8. SUBCONSCIOUS REPROGRAMMING STUDIO (شناخت و بازنویسی باورهای ناخودآگاه) */}
      <SubconsciousBeliefsSection isRtl={isRtl} />

      {/* 3. THE COMMAND CENTER (TABS) */}
      <div className="rounded-3xl border border-[var(--border)] glass-card overflow-hidden flex flex-col shadow-xl min-h-[400px]">
        
        {/* Tab Headers */}
        <div className="flex items-center border-b border-[var(--border)] bg-black/20 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { haptics.tap(); setActiveTab('tasks'); }}
            className={`flex-1 py-4 px-2 text-xs sm:text-sm font-bold flex justify-center items-center gap-2 transition-all whitespace-nowrap relative ${
              activeTab === 'tasks' 
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border-b-2 border-emerald-500' 
                : 'text-[var(--text-secondary)] hover:bg-white/5'
            }`}
          >
            <CheckCircle2 size={16} className={activeTab === 'tasks' ? 'text-emerald-400' : ''} />
            <span>{isRtl ? 'وظایف امروز' : 'Tasks'}</span>
            {tasks.length > 0 && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded-full font-black hidden sm:inline-block">
                {tasks.filter(t => !t.completed).length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => { haptics.tap(); setActiveTab('habits'); }}
            className={`flex-1 py-4 px-2 text-xs sm:text-sm font-bold flex justify-center items-center gap-2 transition-all whitespace-nowrap relative ${
              activeTab === 'habits' 
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border-b-2 border-purple-500' 
                : 'text-[var(--text-secondary)] hover:bg-white/5'
            }`}
          >
            <RefreshCw size={16} className={activeTab === 'habits' ? 'text-purple-400' : ''} />
            <span>{isRtl ? 'عادت‌ها و هشدارها' : 'Habits & Alarms'}</span>
            {myDayHabits.length > 0 && (
              <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 rounded-full font-black hidden sm:inline-block">
                {myDayHabits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { haptics.tap(); setActiveTab('reflection'); }}
            className={`flex-1 py-4 px-2 text-xs sm:text-sm font-bold flex justify-center items-center gap-2 transition-all whitespace-nowrap relative ${
              activeTab === 'reflection' 
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border-b-2 border-amber-500' 
                : 'text-[var(--text-secondary)] hover:bg-white/5'
            }`}
          >
            <Moon size={16} className={activeTab === 'reflection' ? 'text-amber-400' : ''} />
            <span>{isRtl ? 'بازتاب شب' : 'Reflection'}</span>
          </button>

          <button
            onClick={() => { haptics.tap(); setActiveTab('noBlame'); }}
            className={`flex-1 py-4 px-2 text-xs sm:text-sm font-bold flex justify-center items-center gap-2 transition-all whitespace-nowrap relative ${
              activeTab === 'noBlame' 
                ? 'bg-[var(--bg-card)] text-rose-300 border-b-2 border-rose-500' 
                : 'text-[var(--text-secondary)] hover:bg-white/5'
            }`}
          >
            <Shield size={16} className={activeTab === 'noBlame' ? 'text-rose-400' : ''} />
            <span>{isRtl ? 'سرزنش نکن 🛡️' : 'Stop Self-Blame'}</span>
          </button>

          <button
            onClick={() => { haptics.tap(); setActiveTab('subconscious'); }}
            className={`flex-1 py-4 px-2 text-xs sm:text-sm font-bold flex justify-center items-center gap-2 transition-all whitespace-nowrap relative ${
              activeTab === 'subconscious' 
                ? 'bg-[var(--bg-card)] text-cyan-300 border-b-2 border-cyan-500' 
                : 'text-[var(--text-secondary)] hover:bg-white/5'
            }`}
          >
            <Brain size={16} className={activeTab === 'subconscious' ? 'text-cyan-400' : ''} />
            <span>{isRtl ? 'باورهای ناخودآگاه 🧠' : 'Subconscious'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 bg-[var(--bg-card)] flex-1">
          <AnimatePresence mode="wait">
            
            {/* TASKS TAB */}
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* 0. CALENDAR & TASK LEDGER DIRECT SHORTCUT HUB */}
                <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[var(--bg-secondary)] to-purple-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3 text-center sm:text-start">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                          {isRtl ? 'تقویم هوشمند و چک‌لیست کامل' : 'Calendar & Task Ledger'}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                          {tasks.filter(t => t.completed).length} / {tasks.length} {isRtl ? 'انجام شده' : 'done'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                        {isRtl 
                          ? 'تمام وظایف ثبت‌شده در اینجا با تقویم شمسی/میلادی و یادآوری‌ها کاملاً هماهنگ و یکپارچه‌اند.' 
                          : 'Tasks are 100% synchronized with your monthly calendar & reminders.'}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/calendar"
                    onClick={() => { soundEngine.playTap?.(); haptics.tap(); }}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all whitespace-nowrap"
                  >
                    <span>{isRtl ? 'مشاهده تقویم و چک‌لیست کامل' : 'Open Calendar & Tasks'}</span>
                    <ArrowRight size={13} className={isRtl ? 'rotate-180' : ''} />
                  </Link>
                </div>

                {/* Quick Add Task with Alarm */}
                <form onSubmit={handleAddTask} className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-3 shadow-inner">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder={isRtl ? 'افزودن وظیفه مهم جدید برای امروز...' : 'Add a new important task...'}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors"
                    />
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="px-2.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold outline-none cursor-pointer text-[var(--text-primary)]"
                    >
                      <option value="low">🟢 {isRtl ? 'عادی' : 'Low'}</option>
                      <option value="medium">🟡 {isRtl ? 'مهم' : 'Med'}</option>
                      <option value="high">🔴 {isRtl ? 'فوری' : 'High'}</option>
                    </select>
                  </div>

                  {/* Alarm & Time Settings Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border)]/50">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewTaskHasAlarm(!newTaskHasAlarm)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          newTaskHasAlarm
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
                        }`}
                      >
                        <Bell size={13} className={newTaskHasAlarm ? 'animate-bounce text-amber-400' : ''} />
                        <span>{isRtl ? 'تنظیم زنگ هشدار' : 'Set Alarm'}</span>
                      </button>

                      {newTaskHasAlarm && (
                        <input
                          type="time"
                          value={newTaskTime}
                          onChange={(e) => setNewTaskTime(e.target.value)}
                          className="px-3 py-1 rounded-xl bg-[var(--bg-card)] border border-amber-500/40 text-xs font-mono font-bold text-amber-300 outline-none"
                        />
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!newTaskTitle.trim()}
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs disabled:opacity-40 hover:bg-emerald-500 transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Plus size={16} />
                      <span>{isRtl ? 'ثبت وظیفه' : 'Add Task'}</span>
                    </button>
                  </div>
                </form>

                {/* Tasks List */}
                <div className="space-y-2.5">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)] space-y-3 bg-black/10 rounded-3xl border border-dashed border-[var(--border)]">
                      <Target size={36} className="mx-auto opacity-30" />
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{isRtl ? 'هیچ وظیفه‌ای برای امروز ثبت نشده است.' : 'No tasks scheduled for today.'}</p>
                        <p className="text-xs opacity-70 mt-1">{isRtl ? 'یک هدف مشخص بنویس، ساعت زنگ بگذار و تیک بزن.' : 'Write a goal with an alarm and check it off.'}</p>
                      </div>
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          task.completed 
                            ? 'bg-[var(--bg-secondary)] border-transparent opacity-50' 
                            : `bg-[var(--bg-card)] shadow-sm ${
                                task.priority === 'high' ? 'border-rose-500/30' : 
                                task.priority === 'medium' ? 'border-amber-500/30' : 'border-[var(--border)]'
                              } hover:border-emerald-500/50`
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <button
                            onClick={() => {
                              toggleTask(task.id);
                              if (!task.completed) {
                                soundEngine.playCheckmark?.();
                                haptics.success();
                                addXP(10, isRtl ? 'انجام وظیفه' : 'Task Done');
                                addCoins(2);
                              }
                            }}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all shadow-sm ${
                              task.completed 
                                ? 'bg-emerald-500 border-emerald-500 text-white scale-100' 
                                : 'border-slate-400 hover:border-emerald-400 scale-105'
                            }`}
                          >
                            {task.completed && <Check size={14} strokeWidth={3} />}
                          </button>
                          
                          <div className="min-w-0">
                            <span className={`text-sm truncate block ${task.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)] font-bold'}`}>
                              {task.title}
                            </span>
                            {(task.dueTime || task.alarmTime) && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-mono bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded-md mt-0.5">
                                <Clock size={10} />
                                <span>{task.dueTime || task.alarmTime}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {!task.completed && task.priority === 'high' && <Flag size={14} className="text-rose-400 mr-1" />}
                          <button
                            onClick={() => {
                              if (window.confirm(isRtl ? 'حذف وظیفه؟' : 'Delete task?')) {
                                deleteTask(task.id);
                                soundEngine.playTrash?.();
                              }
                            }}
                            className="p-1.5 rounded-xl text-rose-400/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* HABITS TAB */}
            {activeTab === 'habits' && (
              <motion.div
                key="habits"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* 1. Quick Presets Bar */}
                <div className="p-4 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>{isRtl ? 'پیشنهادهای آماده برای افزودن با ۱ کلیک:' : '1-Click Habit Presets:'}</span>
                    </span>
                    <button
                      onClick={() => setShowHabitForm(!showHabitForm)}
                      className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all"
                    >
                      <Plus size={14} />
                      <span>{showHabitForm ? (isRtl ? 'بستن فرم' : 'Close') : (isRtl ? 'ساخت عادت دلخواه' : 'Custom Habit')}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {POPULAR_HABIT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddPresetHabit(preset)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-purple-400 text-xs font-semibold text-[var(--text-primary)] hover:text-purple-300 transition-all flex items-center gap-1.5 shadow-sm hover:scale-102"
                      >
                        <span>{preset.icon}</span>
                        <span>{isRtl ? preset.nameFa : preset.nameEn}</span>
                        <span className="text-[9px] text-cyan-300 bg-cyan-950/60 px-1 rounded font-mono">⏰ {preset.reminderTime}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Custom Habit Creation Form (Expandable) */}
                <AnimatePresence>
                  {showHabitForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleCreateCustomHabit}
                      className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/30 via-[var(--bg-secondary)] to-transparent border border-purple-500/40 space-y-4 shadow-lg overflow-hidden"
                    >
                      <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Edit3 size={14} />
                        <span>{isRtl ? 'مشخصات عادت جدید و زنگ یادآوری' : 'New Habit & Alarm Configuration'}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newHabitName}
                          onChange={(e) => setNewHabitName(e.target.value)}
                          placeholder={isRtl ? 'عنوان عادت (مثلاً: ۳۰ دقیقه پیانو)...' : 'Habit name (e.g. 30m Piano)...'}
                          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-purple-400"
                        />

                        {/* Realm Selector */}
                        <select
                          value={newHabitSection}
                          onChange={(e) => setNewHabitSection(e.target.value)}
                          className="px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] outline-none"
                        >
                          {AVAILABLE_MODULES.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.icon} {isRtl ? m.nameFa : m.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Icon Picker */}
                      <div>
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold block mb-1.5">
                          {isRtl ? 'انتخاب آیکون:' : 'Choose Icon:'}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ICONS_POOL.map(icon => (
                            <button
                              type="button"
                              key={icon}
                              onClick={() => setNewHabitIcon(icon)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
                                newHabitIcon === icon
                                  ? 'bg-purple-600 text-white scale-110 shadow-md ring-2 ring-purple-400'
                                  : 'bg-[var(--bg-card)] border border-[var(--border)] hover:bg-white/5'
                              }`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Alarm & Time Configuration */}
                      <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newHabitHasAlarm}
                            onChange={(e) => setNewHabitHasAlarm(e.target.checked)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                            <Bell size={13} className="text-amber-400" />
                            <span>{isRtl ? 'فعال‌سازی زنگ هشدار روزانه' : 'Daily Alarm Reminder'}</span>
                          </span>
                        </label>

                        {newHabitHasAlarm && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[var(--text-secondary)]">{isRtl ? 'ساعت یادآوری:' : 'Time:'}</span>
                            <input
                              type="time"
                              value={newHabitTime}
                              onChange={(e) => setNewHabitTime(e.target.value)}
                              className="px-3 py-1 rounded-xl bg-[var(--bg-secondary)] border border-purple-400 text-xs font-mono font-bold text-purple-300 outline-none"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowHabitForm(false)}
                          className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-white"
                        >
                          {isRtl ? 'انصراف' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={!newHabitName.trim()}
                          className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:from-purple-500 hover:to-indigo-500 shadow-md transition-all disabled:opacity-40"
                        >
                          {isRtl ? 'افزودن عادت (+۱۵ XP)' : 'Save Habit (+15 XP)'}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* 3. Filter Modules Pills */}
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">
                      {isRtl ? 'عادت‌های فعال امروز' : 'Active Habits Today'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[200px] sm:max-w-[340px] no-scrollbar">
                    {AVAILABLE_MODULES.map((mod) => {
                      const isActive = activeModuleSet.has(mod.id);
                      return (
                        <button
                          key={mod.id}
                          onClick={() => {
                            toggleMyDayModule(mod.id);
                            haptics.tap();
                          }}
                          className={`flex-shrink-0 px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors ${
                            isActive
                              ? `border-current shadow-sm ${mod.color}`
                              : 'border-transparent bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
                          }`}
                        >
                          <span>{mod.icon}</span>
                          <span className="hidden sm:inline">{isRtl ? mod.nameFa : mod.nameEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Habits List */}
                <div className="space-y-3">
                  {myDayHabits.length > 0 ? (
                    myDayHabits.map((item) => (
                      <HabitItem
                        key={item.id}
                        item={item}
                        completed={!!todayLogs[item.id]}
                        onToggle={() => {
                          toggleHabit(item.id);
                          if (!todayLogs[item.id]) {
                            soundEngine.playCheckmark?.();
                            haptics.success();
                            addXP(item.xp || 15, item.nameFa || item.name);
                            addCoins(5);
                          }
                        }}
                        onDelete={() => {
                          if (window.confirm(isRtl ? 'حذف عادت؟' : 'Delete habit?')) {
                            deleteHabit(item.id);
                            soundEngine.playTrash?.();
                          }
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-[var(--text-secondary)] bg-black/10 rounded-3xl border border-dashed border-[var(--border)] space-y-3">
                      <RefreshCw size={36} className="mx-auto opacity-30" />
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {isRtl ? 'هیچ عادتی در قلمروهای انتخاب‌شده یافت نشد.' : 'No active habits in selected realms.'}
                      </p>
                      <button
                        onClick={() => setShowHabitForm(true)}
                        className="px-4 py-2 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-500 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Plus size={15} />
                        <span>{isRtl ? 'افزودن اولین عادت' : 'Add First Habit'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* REFLECTION TAB */}
            {activeTab === 'reflection' && (
              <motion.div
                key="reflection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-4 shadow-inner">
                  <div className="flex items-start sm:items-center gap-3 text-amber-400">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Moon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{isRtl ? 'بازتاب شبانگاهی و تخلیه ذهن' : 'Evening Brain Dump & Reflection'}</h3>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        {isRtl 
                          ? 'روزت چگونه گذشت؟ چه دستاوردی داشتی؟ ذهنت را روی کاغذ بیاور تا با آرامش بخوابی.' 
                          : 'How was your day? Dump your thoughts here to sleep peacefully.'}
                      </p>
                    </div>
                  </div>
                  
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder={isRtl ? 'امروز توانستم... اما باید روی... بیشتر کار کنم.' : 'Today I managed to... but I need to work on...'}
                    className="w-full min-h-[140px] p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-amber-500 resize-none transition-colors shadow-sm"
                  />
                  
                  <div className="flex items-center justify-between">
                    {reflectionSaved ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                        <Check size={14} /> {isRtl ? 'در ژورنال ذخیره شد!' : 'Saved to Journal!'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        {isRtl ? 'نوشتن = آرامش ذهن 🌙' : 'Writing = Peace of mind 🌙'}
                      </span>
                    )}
                    
                    <button
                      onClick={handleSaveReflection}
                      disabled={!reflectionText.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs disabled:opacity-40 hover:from-amber-500 hover:to-orange-500 shadow-lg flex items-center gap-2 transition-all"
                    >
                      <BookOpen size={16} />
                      <span>{isRtl ? 'ثبت در ژورنال (+۲۵ XP)' : 'Save to Journal (+25 XP)'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Gratitude */}
                <div className="p-5 rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 to-transparent flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                      <Heart size={16} />
                      <span>{isRtl ? 'شکرگزاری طلایی' : 'Golden Gratitude'}</span>
                    </h4>
                    <p className="text-[10px] text-rose-400/70">
                      {isRtl ? 'یک نعمت امروز را ثبت کن' : 'Log one blessing today'}
                    </p>
                  </div>
                  <form onSubmit={handleSaveQuickGratitude} className="flex gap-2 flex-1 md:max-w-sm">
                    <input
                      type="text"
                      value={quickGratitude}
                      onChange={(e) => setQuickGratitude(e.target.value)}
                      placeholder={isRtl ? 'سپاسگزارم بابت...' : 'Grateful for...'}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-rose-500/30 text-xs text-[var(--text-primary)] outline-none focus:border-rose-400 transition-colors shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!quickGratitude.trim()}
                      className="px-4 bg-rose-600 text-white rounded-xl font-bold text-xs disabled:opacity-40 hover:bg-rose-500 transition-colors shadow-md flex items-center gap-1"
                    >
                      {gratitudeSaved ? <Check size={16} /> : <Sparkles size={16} />}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* NO SELF-BLAME TAB */}
            {activeTab === 'noBlame' && (
              <motion.div
                key="noBlame"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="py-2"
              >
                <NoSelfBlameSection isRtl={isRtl} />
              </motion.div>
            )}

            {/* SUBCONSCIOUS BELIEFS TAB */}
            {activeTab === 'subconscious' && (
              <motion.div
                key="subconscious"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="py-2"
              >
                <SubconsciousBeliefsSection isRtl={isRtl} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
