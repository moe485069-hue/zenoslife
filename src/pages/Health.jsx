import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, Droplets, Sparkles, Plus, CheckCircle2, Moon, Sun, Shield,
  Activity, Eye, Bed, Smile, RefreshCw, Trash2, Check, Zap, Flame, BookOpen, 
  ChevronDown, ChevronUp, Play, Pause, RotateCcw, Dumbbell, Timer, ArrowRight, ArrowLeft, 
  Volume2, Award, Calendar, Search, Calculator, PieChart, Scale
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import HabitItem from '../components/ui/HabitItem';
import SectionWidgets from '../components/ui/SectionWidgets';
import ProgressRing from '../components/ui/ProgressRing';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { 
  WORKOUT_ROUTINES, WORKOUT_DIFFICULTIES, MUSCLE_GROUPS, 
  WEEKLY_SPLIT_SCHEDULE, HEALTH_ACADEMY_MODULES, EXERCISE_ENCYCLOPEDIA 
} from '../data/healthData';

export default function Health() {
  const { language, addXP } = useAppStore();
  const { habits, todayLogs, loadHabits, toggleHabit, deleteHabit,
    journalEntries, loadJournals, addJournalEntry } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'encyclopedia' | 'hydration' | 'nutrition' | 'sleep' | 'vitality' | 'habits'

  // Difficulty scaling: 'easy' | 'medium' | 'hard'
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  // Muscle Group Filter: 'all' | 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'recovery'
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('all');

  // Encyclopedia search & filter
  const [encyclopediaSearch, setEncyclopediaSearch] = useState('');
  const [encyclopediaMuscle, setEncyclopediaMuscle] = useState('all');
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [expandedRoutineId, setExpandedRoutineId] = useState(null);

  // Nutrition & BMR Calculator State
  const [calcGender, setCalcGender] = useState('male');
  const [calcAge, setCalcAge] = useState(25);
  const [calcWeight, setCalcWeight] = useState(70);
  const [calcHeight, setCalcHeight] = useState(175);
  const [calcActivity, setCalcActivity] = useState(1.55); // 1.2 Sedentary, 1.375 Light, 1.55 Moderate, 1.725 Heavy
  const [calcGoal, setCalcGoal] = useState('maintain'); // 'cut' (-400 kcal) | 'maintain' (0) | 'bulk' (+350 kcal)

  // Hydration state
  const [waterGlasses, setWaterGlasses] = useState(() => {
    const saved = localStorage.getItem('lifeos_health_water');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Workout Player State
  const [selectedRoutine, setSelectedRoutine] = useState(WORKOUT_ROUTINES[0]);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);

  // Vitality log state
  const [energyLevel, setEnergyLevel] = useState(8);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [healthNote, setHealthNote] = useState('');
  const [expandedBiohackId, setExpandedBiohackId] = useState(null);

  useEffect(() => {
    loadHabits('health');
    loadJournals();
  }, []);

  const currentDayOfWeek = new Date().getDay();
  const persianDayIdx = (currentDayOfWeek + 1) % 7; // Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
  const todaySplit = WEEKLY_SPLIT_SCHEDULE.find(s => s.dayIndex === persianDayIdx) || WEEKLY_SPLIT_SCHEDULE[0];

  const addGlass = (delta) => {
    const next = Math.max(0, Math.min(12, waterGlasses + delta));
    setWaterGlasses(next);
    localStorage.setItem('lifeos_health_water', next.toString());
    if (delta > 0) {
      soundEngine.playCheckmark();
      if (next === 8) {
        soundEngine.playLevelUp();
        addXP(20, 'تکمیل هدف ۸ لیوان آب روزانه');
      } else {
        addXP(5, 'نوشیدن آب');
      }
    }
  };

  const currentDiffConfig = WORKOUT_DIFFICULTIES[selectedDifficulty] || WORKOUT_DIFFICULTIES.medium;

  const calculateDuration = (baseSec) => {
    return Math.round(baseSec * currentDiffConfig.multiplier);
  };

  const calculateRest = (baseSec) => {
    return Math.max(5, Math.round(baseSec * currentDiffConfig.restMultiplier));
  };

  // Workout Engine Timer with sound countdown cues
  useEffect(() => {
    let interval = null;
    if (isWorkoutActive && !isPaused && exerciseTimer > 0) {
      interval = setInterval(() => {
        setExerciseTimer(t => {
          // Play audio countdown on 3, 2, 1 seconds left
          if (t === 4 || t === 3 || t === 2) {
            soundEngine.playCountdownPip(false);
          } else if (t === 1) {
            soundEngine.playCountdownPip(true);
          }
          return t - 1;
        });
      }, 1000);
    } else if (isWorkoutActive && !isPaused && exerciseTimer === 0) {
      const currentEx = selectedRoutine.exercises[activeExerciseIdx];
      
      if (!isResting && (currentEx?.restSec > 0)) {
        setIsResting(true);
        setExerciseTimer(calculateRest(currentEx.restSec));
        soundEngine.playWhistle();
        haptics.tap();
      } else {
        setIsResting(false);
        if (activeExerciseIdx < selectedRoutine.exercises.length - 1) {
          const nextIdx = activeExerciseIdx + 1;
          setActiveExerciseIdx(nextIdx);
          setExerciseTimer(calculateDuration(selectedRoutine.exercises[nextIdx].durationSec));
          soundEngine.playWhistle();
          haptics.tap();
        } else {
          // Finished workout
          setIsWorkoutActive(false);
          soundEngine.playLevelUp();
          const xpEarned = selectedRoutine.durationMinutes * 6;
          addXP(xpEarned, `تکمیل تمرین ${selectedRoutine.titleFa}`);
          alert(isRtl ? `🎉 تبریک قهرمان! تمرین ${selectedRoutine.titleFa} با موفقیت تکمیل شد (+${xpEarned} XP)` : `Workout complete (+${xpEarned} XP)`);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, isPaused, exerciseTimer, isResting, activeExerciseIdx, selectedRoutine, isRtl, addXP, selectedDifficulty]);

  const handleStartWorkout = (routine) => {
    setSelectedRoutine(routine);
    setActiveExerciseIdx(0);
    setIsResting(false);
    setIsPaused(false);
    setExerciseTimer(calculateDuration(routine.exercises[0].durationSec));
    setIsWorkoutActive(true);
    soundEngine.playWhistle();
    haptics.tap();
  };

  const handleNextExercise = () => {
    setIsResting(false);
    if (activeExerciseIdx < selectedRoutine.exercises.length - 1) {
      const nextIdx = activeExerciseIdx + 1;
      setActiveExerciseIdx(nextIdx);
      setExerciseTimer(calculateDuration(selectedRoutine.exercises[nextIdx].durationSec));
      soundEngine.playWhistle();
      haptics.tap();
    } else {
      setIsWorkoutActive(false);
      soundEngine.playLevelUp();
    }
  };

  const handlePrevExercise = () => {
    setIsResting(false);
    if (activeExerciseIdx > 0) {
      const prevIdx = activeExerciseIdx - 1;
      setActiveExerciseIdx(prevIdx);
      setExerciseTimer(calculateDuration(selectedRoutine.exercises[prevIdx].durationSec));
      soundEngine.playTap();
      haptics.tap();
    }
  };

  const handleSaveVitalityLog = async (e) => {
    e.preventDefault();
    await addJournalEntry({
      title: isRtl ? 'پایش سلامت و انرژی' : 'Vitality Check-in',
      content: `[سطح انرژی]: ${energyLevel}/10\n[ساعت خواب]: ${sleepHours} ساعت\n[آب مصرفی]: ${waterGlasses} لیوان\n[یادداشت]: ${healthNote || (isRtl ? 'وضعیت مطلوب' : 'Good condition')}`,
      mood: energyLevel >= 7 ? 'happy' : 'neutral',
      tags: 'سلامت,ورزش,انرژی',
      sectionId: 'health'
    });

    soundEngine.playLevelUp();
    addXP(20, 'ثبت پایش سلامت روزانه');
    setHealthNote('');
    alert(isRtl ? 'پایش سلامت با موفقیت ذخیره شد (+۲۰ XP) ✨' : 'Vitality check saved (+20 XP)');
  };

  // Nutrition BMR / TDEE Calculation (Mifflin-St Jeor)
  const bmr = calcGender === 'male'
    ? Math.round(10 * calcWeight + 6.25 * calcHeight - 5 * calcAge + 5)
    : Math.round(10 * calcWeight + 6.25 * calcHeight - 5 * calcAge - 161);
  
  const tdee = Math.round(bmr * calcActivity);
  const targetCalories = calcGoal === 'cut' ? tdee - 450 : calcGoal === 'bulk' ? tdee + 350 : tdee;
  const targetProteinGrams = Math.round(calcWeight * 2.0); // 2g per kg
  const targetFatGrams = Math.round((targetCalories * 0.25) / 9); // 25% of calories
  const targetCarbsGrams = Math.round((targetCalories - (targetProteinGrams * 4 + targetFatGrams * 9)) / 4);

  const currentExercise = selectedRoutine?.exercises?.[activeExerciseIdx];
  const workoutProgress = selectedRoutine?.exercises?.length
    ? Math.round(((activeExerciseIdx + 1) / selectedRoutine.exercises.length) * 100)
    : 0;

  // Filtered routines
  const filteredRoutines = WORKOUT_ROUTINES.filter(r => {
    if (selectedMuscleFilter === 'all') return true;
    return r.muscleGroup === selectedMuscleFilter;
  });

  // Filtered encyclopedia
  const filteredEncyclopedia = EXERCISE_ENCYCLOPEDIA.filter(item => {
    const matchesSearch = !encyclopediaSearch || 
      item.nameFa.toLowerCase().includes(encyclopediaSearch.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(encyclopediaSearch.toLowerCase()) ||
      item.targetFa.toLowerCase().includes(encyclopediaSearch.toLowerCase());
    const matchesMuscle = encyclopediaMuscle === 'all' || item.muscleGroup === encyclopediaMuscle;
    return matchesSearch && matchesMuscle;
  });

  const TABS = [
    { id: 'workout', fa: 'استاد ورزش و تفکیک هفتگی', en: 'Master Coach', icon: '🏋️‍♂️' },
    { id: 'encyclopedia', fa: 'دایره‌المعارف حرکات', en: 'Encyclopedia', icon: '📖' },
    { id: 'nutrition', fa: 'ماشین‌حساب کالری و ماکرو', en: 'Nutrition & BMR', icon: '🥗' },
    { id: 'hydration', fa: 'آبرسانی هوشمند', en: 'Hydration', icon: '💧' },
    { id: 'sleep', fa: 'خواب و بیولوژی زیستی', en: 'Sleep Science', icon: '🌙' },
    { id: 'vitality', fa: 'پایش انرژی روزانه', en: 'Vitality Log', icon: '⚡' },
    { id: 'habits', fa: 'عادات تندرستی', en: 'Habits', icon: '🛡️' },
  ];

  return (
    <div className="page-container flex flex-col gap-6 pb-24 select-none">
      
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-2xl text-rose-400 shadow-sm animate-pulse-slow">
            🏋️‍♂️
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">
              {isRtl ? 'استاد ورزشی، تغذیه و تفکیک عضلات' : 'Master Athletic Coach & Nutrition'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isRtl ? 'برنامه تفکیک هفتگی عضلات، دایره‌المعارف حرکات، کالری‌سنج و بیولوژی خواب' : 'Weekly muscle split, exercise encyclopedia, BMR nutrition calculator'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              haptics.tap();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-md scale-105'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-rose-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB 1: MASTER ATHLETIC COACH & WORKOUTS */}
        {activeTab === 'workout' && (
          <motion.div
            key="workout"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            
            {/* WEEKLY MUSCLE SPLIT HERO BANNER */}
            <div className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-3.5 relative overflow-hidden bg-gradient-to-br from-rose-500/10 via-[var(--bg-card)] to-indigo-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={15} className="text-rose-500" />
                  <span>{isRtl ? 'برنامه تفکیک هفتگی عضلات (Weekly Split):' : 'Weekly Muscle Split Plan:'}</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                  {isRtl ? `امروز: ${todaySplit.dayNameFa}` : `Today: ${todaySplit.dayNameEn}`}
                </span>
              </div>

              {/* 7-Day Split Slider Chips */}
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKLY_SPLIT_SCHEDULE.map(day => {
                  const isToday = day.dayIndex === persianDayIdx;
                  const matchingRoutine = WORKOUT_ROUTINES.find(r => r.id === day.routineId) || WORKOUT_ROUTINES[0];
                  return (
                    <div
                      key={day.dayIndex}
                      onClick={() => handleStartWorkout(matchingRoutine)}
                      className={`p-2 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 ${
                        isToday
                          ? 'bg-gradient-to-b from-rose-600 to-pink-600 text-white border-rose-400 shadow-md ring-2 ring-rose-400/40 scale-105'
                          : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-rose-500/40'
                      }`}
                    >
                      <span className="text-[10px] font-black">{day.dayNameFa.slice(0, 3)}</span>
                      <span className="text-base my-0.5">{day.icon}</span>
                      <span className="text-[9px] font-medium truncate max-w-full hidden sm:block">{day.focusFa.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Today's Workout Callout */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-rose-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl">{todaySplit.icon}</span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-rose-500 block">تمرین پیشنهادی امروز:</span>
                    <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] truncate">{todaySplit.focusFa}</h4>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const routine = WORKOUT_ROUTINES.find(r => r.id === todaySplit.routineId) || WORKOUT_ROUTINES[0];
                    handleStartWorkout(routine);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shrink-0 active:scale-95 flex items-center gap-1"
                >
                  <Play size={13} />
                  <span>{isRtl ? 'شروع' : 'Start'}</span>
                </button>
              </div>
            </div>

            {/* Intensity / Difficulty Scaler Toolbar */}
            <div className="glass-card p-4 rounded-3xl border border-[var(--border)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={14} className="text-rose-500" />
                  <span>{isRtl ? 'تنظیم شدت و سطح سختی تمرینات:' : 'Adjust Workout Intensity:'}</span>
                </span>
                <span className="text-[11px] font-black text-rose-500 font-mono">
                  {currentDiffConfig.nameFa}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.values(WORKOUT_DIFFICULTIES).map(diff => (
                  <button
                    key={diff.id}
                    onClick={() => {
                      setSelectedDifficulty(diff.id);
                      haptics.tap();
                      soundEngine.playTap();
                    }}
                    className={`py-2 px-2.5 rounded-2xl text-xs font-black transition-all text-center ${
                      selectedDifficulty === diff.id
                        ? 'bg-rose-600 text-white shadow-md scale-105 ring-2 ring-rose-400/40'
                        : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {diff.id === 'easy' ? '🌱 سبک / مبتدی' : diff.id === 'medium' ? '⚡ استاندارد' : '🔥 سخت / اسپارتان'}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {currentDiffConfig.descFa}
              </p>
            </div>

            {/* MUSCLE GROUP FILTER CHIPS */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {MUSCLE_GROUPS.map(muscle => (
                <button
                  key={muscle.id}
                  onClick={() => {
                    setSelectedMuscleFilter(muscle.id);
                    haptics.tap();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedMuscleFilter === muscle.id
                      ? 'bg-zinc-900 text-white border-2 border-rose-500 shadow-md'
                      : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-rose-500/40'
                  }`}
                >
                  <span>{muscle.icon}</span>
                  <span>{muscle.nameFa}</span>
                </button>
              ))}
            </div>

            {/* ACTIVE WORKOUT PLAYER */}
            {isWorkoutActive && selectedRoutine && currentExercise && (
              <div className="glass-card p-6 rounded-3xl border-2 border-rose-500 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${workoutProgress}%` }}
                  />
                </div>

                <div className="w-full flex items-center justify-between text-xs mb-3">
                  <span className="font-black text-rose-500 truncate max-w-[60%]">
                    {selectedRoutine.titleFa}
                  </span>
                  <span className="font-mono text-[var(--text-secondary)] font-bold">
                    {activeExerciseIdx + 1} / {selectedRoutine.exercises.length} ({workoutProgress}%)
                  </span>
                </div>

                {/* Big Animated Icon */}
                <div className="w-28 h-28 rounded-full bg-rose-500/15 border-4 border-rose-500 flex items-center justify-center text-5xl mb-3 shadow-xl animate-pulse">
                  {isResting ? '🧘' : (currentExercise.icon || '⚡')}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {isResting ? (isRtl ? 'استراحت و تنفس عمیق 🌿' : 'Rest & Deep Breath') : currentExercise.nameFa}
                </h3>

                {/* Target Muscles */}
                {!isResting && currentExercise.targetFa && (
                  <span className="text-[11px] font-bold text-rose-400 mt-1">
                    عضلات هدف: {currentExercise.targetFa}
                  </span>
                )}

                {/* Big Countdown Timer */}
                <div className="my-3 flex items-center gap-2">
                  <span className="text-5xl font-black font-mono text-rose-500 tracking-tight">
                    {exerciseTimer}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-bold">ثانیه</span>
                </div>

                {/* Form Guidelines & Execution How-To Box */}
                <div className="w-full p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-start space-y-2.5 mb-4 shadow-sm">
                  {/* Step-by-step How To */}
                  {!isResting && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                        <span>📖</span>
                        <span>{isRtl ? 'روش انجام و اجرای صحیح حرکت:' : 'Execution Method:'}</span>
                      </span>
                      <p className="text-[11px] text-[var(--text-primary)] leading-relaxed font-medium">
                        {currentExercise.howToFa || currentExercise.instructionsFa || currentExercise.tipFa}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Form Tip / Breathing */}
                    <div className="p-2 rounded-xl bg-black/20 space-y-0.5">
                      <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1">
                        <span>💡</span>
                        <span>{isRtl ? 'نکته کلیدی و تنفس:' : 'Form Tip & Breath:'}</span>
                      </span>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                        {isResting ? (isRtl ? 'دم عمیق شکمی از بینی و بازدم آرام از دهان.' : 'Deep belly inhale, slow exhale.') : currentExercise.tipFa}
                      </p>
                    </div>

                    {/* Mistakes or Target */}
                    {!isResting && currentExercise.mistakesFa && (
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-0.5">
                        <span className="text-[10px] font-bold text-rose-300 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{isRtl ? 'اشتباه رایج:' : 'Common Mistake:'}</span>
                        </span>
                        <p className="text-[10px] text-rose-200 leading-relaxed">
                          {currentExercise.mistakesFa}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Scaled Variations */}
                  {!isResting && selectedDifficulty === 'easy' && currentExercise.easyFa && (
                    <p className="text-emerald-500 font-bold text-[11px] bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                      🌱 <strong>اجرای ساده‌تر:</strong> {currentExercise.easyFa}
                    </p>
                  )}
                  {!isResting && selectedDifficulty === 'hard' && currentExercise.hardFa && (
                    <p className="text-amber-500 font-bold text-[11px] bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                      🔥 <strong>اجرای چالش‌برانگیزتر:</strong> {currentExercise.hardFa}
                    </p>
                  )}
                </div>

                {/* Player Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevExercise}
                    disabled={activeExerciseIdx === 0}
                    className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 active:scale-95 transition-transform"
                    title={isRtl ? 'حرکت قبلی' : 'Previous'}
                  >
                    {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                  </button>

                  <button
                    onClick={() => {
                      setIsPaused(!isPaused);
                      haptics.tap();
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-xs shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    <span>{isPaused ? (isRtl ? 'ادامه' : 'Resume') : (isRtl ? 'توقف موقت' : 'Pause')}</span>
                  </button>

                  <button
                    onClick={handleNextExercise}
                    className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] active:scale-95 transition-transform"
                    title={isRtl ? 'حرکت بعدی' : 'Next'}
                  >
                    {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </button>

                  <button
                    onClick={() => setIsWorkoutActive(false)}
                    className="px-3 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold active:scale-95"
                    title={isRtl ? 'خروج از تمرین' : 'Exit'}
                  >
                    پایان
                  </button>
                </div>

                {/* Interactive Sequence Playlist Drawer */}
                <div className="w-full mt-5 pt-4 border-t border-[var(--border)] text-start space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[var(--text-secondary)]">
                      فهرست تمام حرکات این برنامه ({selectedRoutine.exercises.length} حرکت):
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">
                      {Math.round(((activeExerciseIdx + 1) / selectedRoutine.exercises.length) * 100)}%
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {selectedRoutine.exercises.map((ex, idx) => {
                      const isCur = idx === activeExerciseIdx;
                      const isDone = idx < activeExerciseIdx;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveExerciseIdx(idx);
                            setIsResting(false);
                            setIsPaused(false);
                            haptics.tap();
                          }}
                          className={`px-3 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                            isCur
                              ? 'bg-rose-600 text-white border-rose-400 shadow-md ring-2 ring-rose-400/40 scale-105'
                              : isDone
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-rose-500/40'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[9px] font-mono">
                            {isDone ? '✓' : idx + 1}
                          </span>
                          <span>{ex.nameFa.split('(')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ROUTINES GALLERY */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                  {isRtl ? `بانک روتین‌های تمرینی (${filteredRoutines.length}):` : `Workout Routines (${filteredRoutines.length}):`}
                </span>
              </div>

              <div className="space-y-4">
                {filteredRoutines.map((routine) => {
                  const isExpanded = expandedRoutineId === routine.id;
                  return (
                    <div
                      key={routine.id}
                      className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-3.5 hover:border-rose-500/50 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-3xl p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 shrink-0">
                            {routine.icon}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] truncate">
                              {routine.titleFa}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-secondary)] flex-wrap">
                              <span className="text-rose-500 font-black font-mono">{routine.durationMinutes} دقیقه</span>
                              <span>•</span>
                              <span className="font-bold text-amber-500">{routine.exercises.length} حرکت کامل</span>
                              <span>•</span>
                              <span>{routine.caloriesBurned}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartWorkout(routine)}
                          className="px-4 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-xs font-black rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 shrink-0"
                        >
                          <Play size={14} />
                          <span>{isRtl ? 'شروع تمرین' : 'Start'}</span>
                        </button>
                      </div>

                      {/* Target Muscles */}
                      <div className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] text-[11px] text-[var(--text-secondary)]">
                        <span className="font-bold text-[var(--text-primary)]">🎯 عضلات درگیر: </span>
                        <span>{routine.targetMuscles}</span>
                      </div>

                      {/* Expand / View All Exercises Button */}
                      <div className="pt-1 border-t border-[var(--border)]">
                        <button
                          onClick={() => {
                            setExpandedRoutineId(isExpanded ? null : routine.id);
                            haptics.tap();
                          }}
                          className="w-full py-2 px-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between text-xs font-bold text-[var(--text-primary)] hover:border-rose-500/40 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>📋</span>
                            <span>مشاهده فهرست تمام حرکات ({routine.exercises.length} حرکت گام‌به‌گام)</span>
                          </span>
                          <span className="text-[var(--text-secondary)]">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pt-3 space-y-2"
                            >
                              {routine.exercises.map((ex, i) => (
                                <div
                                  key={i}
                                  className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-between gap-2"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-500 font-black text-xs flex items-center justify-center shrink-0 font-mono">
                                      {i + 1}
                                    </span>
                                    <span className="text-xl shrink-0">{ex.icon}</span>
                                    <div className="min-w-0">
                                      <h5 className="text-xs font-black text-[var(--text-primary)] truncate">{ex.nameFa}</h5>
                                      <p className="text-[10px] text-[var(--text-secondary)] truncate">{ex.tipFa}</p>
                                    </div>
                                  </div>
                                  <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-secondary)] text-[10px] font-mono font-bold text-rose-400 shrink-0">
                                    {calculateDuration(ex.durationSec)}s
                                  </span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: EXERCISE ENCYCLOPEDIA */}
        {activeTab === 'encyclopedia' && (
          <motion.div
            key="encyclopedia"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Search & Muscle Filters */}
            <div className="glass-card p-4 rounded-3xl border border-[var(--border)] space-y-3">
              <div className="relative">
                <Search size={16} className="absolute inset-y-0 start-3 my-auto text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={encyclopediaSearch}
                  onChange={(e) => setEncyclopediaSearch(e.target.value)}
                  placeholder={isRtl ? 'جستجوی نام حرکت یا عضلات درگیر...' : 'Search exercise...'}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl ps-9 pe-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-rose-500 font-bold"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {MUSCLE_GROUPS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setEncyclopediaMuscle(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      encyclopediaMuscle === m.id
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>{m.icon} {m.nameFa.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Encyclopedia List */}
            <div className="space-y-3">
              {filteredEncyclopedia.map(ex => {
                const isExpanded = expandedExerciseId === ex.id;
                return (
                  <div
                    key={ex.id}
                    className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-3 hover:border-rose-500/40 transition-all"
                  >
                    <div
                      onClick={() => {
                        setExpandedExerciseId(isExpanded ? null : ex.id);
                        haptics.tap();
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">{ex.icon}</span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">{ex.nameFa}</h4>
                          <span className="text-[10px] text-rose-500 font-bold font-mono">{ex.levelFa} • ~{ex.caloriesPerMin} kcal/دقیقه</span>
                        </div>
                      </div>
                      <button className="p-1 text-[var(--text-secondary)]">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden pt-3 border-t border-[var(--border)] space-y-2.5 text-xs text-[var(--text-primary)] leading-relaxed"
                        >
                          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] space-y-1.5">
                            <p className="font-bold text-rose-400">🎯 عضلات درگیر:</p>
                            <p className="text-[var(--text-secondary)]">{ex.targetFa}</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] space-y-1.5">
                            <p className="font-bold text-emerald-400">📖 نحوه اجرای بیومکانیک صحیح:</p>
                            <p className="text-slate-200">{ex.instructionsFa}</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                            <p className="font-bold">⚠️ اشتباهات رایج:</p>
                            <p>{ex.mistakesFa}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: NUTRITION & BMR CALCULATOR */}
        {activeTab === 'nutrition' && (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥗</span>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">
                    {isRtl ? 'محاسبه‌گر کالری پایه (BMR) و ماکروهای تغذیه' : 'BMR & Macronutrient Nutrition Calculator'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {isRtl ? 'فرمول علمی میفلین-سنت جئور برای برآورد دقیق سوخت‌وساز و پروتئین روزانه' : 'Scientific Mifflin-St Jeor equation for metabolic expenditure'}
                  </p>
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)]">جنسیت:</label>
                  <select
                    value={calcGender}
                    onChange={(e) => setCalcGender(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text-primary)] font-bold outline-none"
                  >
                    <option value="male">مرد 👨</option>
                    <option value="female">زن 👩</option>
                  </select>
                </div>

                {/* Weight */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)]">وزن (kg):</label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text-primary)] font-bold outline-none font-mono"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)]">قد (cm):</label>
                  <input
                    type="number"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(Number(e.target.value))}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text-primary)] font-bold outline-none font-mono"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)]">سن (سال):</label>
                  <input
                    type="number"
                    value={calcAge}
                    onChange={(e) => setCalcAge(Number(e.target.value))}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text-primary)] font-bold outline-none font-mono"
                  />
                </div>

              </div>

              {/* Goal selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)]">هدف بدنی:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cut', fa: '🔥 چربی‌سوزی (-450 kcal)', en: 'Fat Loss' },
                    { id: 'maintain', fa: '⚡ تثبیت وزن', en: 'Maintain' },
                    { id: 'bulk', fa: '💪 عضله‌سازی (+350 kcal)', en: 'Muscle Gain' }
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => setCalcGoal(g.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all ${
                        calcGoal === g.id
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {g.fa}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Outputs Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--border)]">
                
                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--text-secondary)] block">کالری پایه بدن (BMR):</span>
                  <span className="text-xl font-black font-mono text-rose-500">{bmr}</span>
                  <span className="text-[9px] text-[var(--text-secondary)] block">kcal/روز</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-center">
                  <span className="text-[10px] text-rose-300 block font-bold">کالری هدف روزانه:</span>
                  <span className="text-xl font-black font-mono text-rose-400">{targetCalories}</span>
                  <span className="text-[9px] text-rose-300 block">kcal/روز</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-blue-400 block font-bold">پروتئین مورد نیاز:</span>
                  <span className="text-xl font-black font-mono text-blue-400">{targetProteinGrams} g</span>
                  <span className="text-[9px] text-[var(--text-secondary)] block">~{targetProteinGrams * 4} kcal</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-amber-400 block font-bold">کربوهیدرات / چربی:</span>
                  <span className="text-xs font-black font-mono text-amber-400 block mt-1">{targetCarbsGrams}g کرب | {targetFatGrams}g چربی</span>
                  <span className="text-[9px] text-[var(--text-secondary)] block mt-0.5">انرژی و هورمون‌ها</span>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: HYDRATION */}
        {activeTab === 'hydration' && (
          <motion.div
            key="hydration"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-4 border-cyan-400 flex items-center justify-center text-3xl shadow-lg">
                💧
              </div>

              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  {isRtl ? `مصرف آب امروز: ${waterGlasses} از ۸ لیوان` : `Today's Water: ${waterGlasses} / 8 Glasses`}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {waterGlasses >= 8 
                    ? (isRtl ? '✨ آفرین! هدف هیدراتاسیون امروز تکمیل شد.' : 'Goal completed!') 
                    : (isRtl ? `${8 - waterGlasses} لیوان دیگر تا رسیدن به هدف روزانه` : `${8 - waterGlasses} more glasses needed`)}
                </p>
              </div>

              {/* Glasses Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 my-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <div
                    key={num}
                    onClick={() => addGlass(num <= waterGlasses ? -1 : 1)}
                    className={`w-11 h-13 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${
                      num <= waterGlasses
                        ? 'bg-cyan-500 text-white border-cyan-400 shadow-md scale-105'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] opacity-50'
                    }`}
                  >
                    <Droplets size={16} />
                    <span className="text-[9px] font-mono mt-0.5">{num}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => addGlass(1)}
                  className="px-6 py-2.5 rounded-2xl bg-cyan-600 text-white font-black text-xs shadow-lg active:scale-95 flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>{isRtl ? 'افزودن یک لیوان آب (+۵ XP)' : '+1 Glass'}</span>
                </button>
                <button
                  onClick={() => addGlass(-1)}
                  className="px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] font-bold text-xs active:scale-95"
                >
                  {isRtl ? 'کاهش' : '-1'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: SLEEP SCIENCE */}
        {activeTab === 'sleep' && (
          <motion.div
            key="sleep"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-4">
              <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen size={18} className="text-rose-500" />
                <span>{isRtl ? 'دانشنامه بیولوژی و بهینه‌سازی خواب' : 'Sleep Biology & Circadian Protocols'}</span>
              </h3>

              <div className="space-y-3">
                {HEALTH_ACADEMY_MODULES.map(item => {
                  const isExpanded = expandedBiohackId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-2"
                    >
                      <div
                        onClick={() => setExpandedBiohackId(isExpanded ? null : item.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">{item.titleFa}</h4>
                            <span className="text-[10px] text-rose-500 font-bold">{item.categoryFa}</span>
                          </div>
                        </div>
                        <button className="p-1 text-[var(--text-secondary)]">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden pt-2 text-xs text-[var(--text-primary)] leading-relaxed space-y-2"
                          >
                            <p className="whitespace-pre-line text-slate-200">{item.contentFa}</p>
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-[11px]">
                              💡 {item.keyTakeawayFa}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 6: VITALITY LOG */}
        {activeTab === 'vitality' && (
          <motion.div
            key="vitality"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <form onSubmit={handleSaveVitalityLog} className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-4">
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                {isRtl ? 'ثبت وضعیت انرژی و سرزندگی امروز' : 'Daily Vitality Check-in'}
              </h3>

              {/* Energy Range Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[var(--text-primary)]">
                  <span>{isRtl ? 'سطح انرژی:' : 'Energy:'}</span>
                  <span className="text-rose-500 font-mono font-black text-sm">{energyLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              {/* Sleep Hours Range */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[var(--text-primary)]">
                  <span>{isRtl ? 'میزان خواب دیشب:' : 'Sleep:'}</span>
                  <span className="text-rose-500 font-mono font-black text-sm">{sleepHours} ساعت</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <textarea
                rows={3}
                value={healthNote}
                onChange={(e) => setHealthNote(e.target.value)}
                placeholder={isRtl ? 'احساس بدنی، تغذیه یا یادداشت سلامتی...' : 'Body feeling, diet or health note...'}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-3 text-xs text-[var(--text-primary)] outline-none focus:border-rose-500"
              />

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl text-xs font-black shadow-lg active:scale-95"
              >
                {isRtl ? 'ثبت و دریافت ۲۰ XP' : 'Save Check-in (+20 XP)'}
              </button>
            </form>
          </motion.div>
        )}

        {/* TAB 7: HABITS */}
        {activeTab === 'habits' && (
          <motion.div
            key="habits"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <SectionWidgets
              sectionId="health"
              titleFa="عادات ورزشی و سلامت"
              titleEn="Health & Fitness Habits"
              habits={habits}
              todayLogs={todayLogs}
              onToggleHabit={toggleHabit}
              onDeleteHabit={deleteHabit}
            />
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
