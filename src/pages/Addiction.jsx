import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Flame, Sparkles, Plus, CheckCircle2, RotateCcw, AlertTriangle,
  Heart, Lock, Unlock, Wind, Award, Clock, LifeBuoy, RefreshCw, Check, ArrowRight, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import HabitItem from '../components/ui/HabitItem';
import SectionWidgets from '../components/ui/SectionWidgets';
import ProgressRing from '../components/ui/ProgressRing';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { ADDICTION_ACADEMY_MODULES } from '../data/addictionData';

const MILESTONES = [
  { days: 1, titleFa: 'گام نخست (۲۴ ساعت)', titleEn: 'First 24 Hours', icon: '🌱', xp: 50 },
  { days: 3, titleFa: 'عبور از موج نخست (۳ روز)', titleEn: 'First Peak (3 Days)', icon: '🔥', xp: 100 },
  { days: 7, titleFa: 'یک هفته اقتدار (۷ روز)', titleEn: '1 Week of Sovereignty', icon: '🛡️', xp: 200 },
  { days: 14, titleFa: 'دو هفته تجدید قوا (۱۴ روز)', titleEn: '2 Weeks Renewal', icon: '⚡', xp: 300 },
  { days: 30, titleFa: 'یک ماه تولد دوباره (۳۰ روز)', titleEn: '1 Month Rebirth', icon: '💎', xp: 500 },
  { days: 90, titleFa: 'فصل نوین مغز و دوپامین (۹۰ روز)', titleEn: '90 Days Dopamine Reset', icon: '👑', xp: 1000 },
  { days: 365, titleFa: 'یک سال آزادی مطلق (۳۶۵ روز)', titleEn: '1 Year Full Freedom', icon: '🦅', xp: 2500 },
];

export default function Addiction() {
  const { language, addXP } = useAppStore();
  const { habits, todayLogs, loadHabits, toggleHabit, deleteHabit,
    journalEntries, loadJournals, addJournalEntry } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('counter'); // 'counter' | 'sos' | 'halt' | 'why' | 'habits'

  // Sobriety start date in localStorage
  const [cleanStartDate, setCleanStartDate] = useState(() => {
    const saved = localStorage.getItem('lifeos_addiction_start');
    return saved ? saved : new Date().toISOString();
  });

  // Calculate clean days, hours
  const calculateCleanTime = () => {
    const diff = Date.now() - new Date(cleanStartDate).getTime();
    if (diff < 0) return { days: 0, hours: 0, minutes: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return { days, hours, minutes };
  };

  const [cleanTime, setCleanTime] = useState(calculateCleanTime);

  useEffect(() => {
    loadHabits('addiction');
    loadJournals();

    const interval = setInterval(() => {
      setCleanTime(calculateCleanTime());
    }, 60000);
    return () => clearInterval(interval);
  }, [cleanStartDate]);

  // SOS Urge Surfing Timer
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosSeconds, setSosSeconds] = useState(180);
  const [sosRemaining, setSosRemaining] = useState(180);

  useEffect(() => {
    let t = null;
    if (isSosActive && sosRemaining > 0) {
      t = setInterval(() => setSosRemaining(s => s - 1), 1000);
    } else if (isSosActive && sosRemaining === 0) {
      setIsSosActive(false);
      soundEngine.playLevelUp();
      addXP(30, 'پیروزی در مهار وسوسه و موج‌سواری');
    }
    return () => clearInterval(t);
  }, [isSosActive, sosRemaining]);

  const startSosSurfing = () => {
    soundEngine.playMeditationBowl();
    setSosRemaining(180);
    setIsSosActive(true);
  };

  // Reset dialog state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReason, setResetReason] = useState('');

  const handleCompassionateReset = async () => {
    await addJournalEntry({
      title: isRtl ? 'ثبت لغزش و بازگشت آگاهانه' : 'Relapse Reflection & Comeback',
      content: `[مدت زمان پاکی قبلی]: ${cleanTime.days} روز\n[علت و درس آموخته‌شده]: ${resetReason || (isRtl ? 'عدم تسلیم؛ دوباره با اراده بیشتر آغاز می‌کنم.' : 'Starting fresh with renewed strength.')}`,
      mood: 'neutral',
      tags: 'رهایی‌از‌اعتیاد,تاب‌آوری,شروع‌مجدد',
      sectionId: 'addiction'
    });

    const now = new Date().toISOString();
    setCleanStartDate(now);
    localStorage.setItem('lifeos_addiction_start', now);
    setCleanTime({ days: 0, hours: 0, minutes: 0 });
    setShowResetModal(false);
    setResetReason('');
  };

  // HALT checklist
  const [haltStatus, setHaltStatus] = useState({
    hungry: false,
    angry: false,
    lonely: false,
    tired: false
  });

  const [expandedAddictionId, setExpandedAddictionId] = useState(null);

  const TABS = [
    { id: 'counter', fa: 'شمارنده پاکی', en: 'Sobriety Counter', icon: '🛡️' },
    { id: 'sos', fa: 'مهار فوری هوس (SOS)', en: 'SOS Urge Surfing', icon: '🌊' },
    { id: 'academy', fa: 'آکادمی دوپامین و علوم اعصاب', en: 'Dopamine Academy', icon: '🧬' },
    { id: 'halt', fa: 'پایش ۴گانه HALT', en: 'HALT Check', icon: '⚠️' },
    { id: 'habits', fa: 'عادات اقتدار و رهایی', en: 'Freedom Habits', icon: '⚡' },
  ];

  return (
    <div className="page-container flex flex-col gap-6 pb-24">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-2xl text-rose-500 shadow-sm">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">
              {isRtl ? 'رهایی و مهار اعتیاد' : 'Addiction Freedom & Sovereignty'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isRtl ? 'شمارنده روزهای پاکی، مهار وسوسه لحظه‌ای و بازسازی دوپامین' : 'Sobriety streak, urge surfing, and dopamine restoration'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-rose-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB 1: SOBRIETY COUNTER */}
        {activeTab === 'counter' && (
          <motion.div
            key="counter"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Big Counter Card */}
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] text-center flex flex-col items-center gap-4 relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-3xl shadow-lg">
                🦅
              </div>

              <div>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  {isRtl ? 'مدت زمان پاکی و آزادی شما' : 'Total Clean & Free Time'}
                </span>
                <div className="text-4xl font-black text-[var(--text-primary)] mt-1">
                  {cleanTime.days} <span className="text-lg font-bold text-[var(--text-secondary)]">{isRtl ? 'روز' : 'Days'}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {cleanTime.hours} {isRtl ? 'ساعت' : 'hours'} • {cleanTime.minutes} {isRtl ? 'دقیقه' : 'mins'}
                </p>
              </div>

              {/* Reset button */}
              <button
                onClick={() => setShowResetModal(true)}
                className="text-[11px] text-[var(--text-secondary)] hover:text-rose-500 flex items-center gap-1 mt-2 underline"
              >
                <RotateCcw size={12} />
                <span>{isRtl ? 'ثبت لغزش و شروع دوباره (بدون قضاوت)' : 'Compassionate Reset'}</span>
              </button>
            </div>

            {/* Milestones Showcase */}
            <div className="glass-card p-5 rounded-3xl border border-[var(--border)]">
              <h2 className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Award size={16} className="text-amber-500" />
                <span>{isRtl ? 'نقاط عطف و مدال‌های پیروزی' : 'Milestones & Victory Medals'}</span>
              </h2>

              <div className="space-y-2">
                {MILESTONES.map(m => {
                  const isUnlocked = cleanTime.days >= m.days;
                  return (
                    <div
                      key={m.days}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        isUnlocked
                          ? 'bg-rose-500/10 border-rose-500/40 shadow-xs'
                          : 'bg-[var(--bg-secondary)] border-[var(--border)] opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{m.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">
                            {isRtl ? m.titleFa : m.titleEn}
                          </p>
                          <span className="text-[10px] text-rose-500 font-semibold">+{m.xp} XP</span>
                        </div>
                      </div>

                      {isUnlocked ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-1">
                          <Check size={11} strokeWidth={3} />
                          <span>{isRtl ? 'آزاد شد' : 'Unlocked'}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                          {m.days - cleanTime.days} {isRtl ? 'روز مانده' : 'days left'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SOS URGE SURFING */}
        {activeTab === 'sos' && (
          <motion.div
            key="sos"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] text-center flex flex-col items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-rose-500/15 border-2 border-rose-500 flex items-center justify-center text-2xl text-rose-500 animate-pulse">
                🌊
              </div>

              <div>
                <h2 className="text-base font-black text-[var(--text-primary)]">
                  {isRtl ? 'تکنیک موج‌سواری بر هوس (Urge Surfing)' : '3-Minute Urge Surfing Technique'}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm leading-relaxed">
                  {isRtl
                    ? 'علم اعصاب نشان می‌دهد هر موج وسوسه مانند یک موج دریا اوج می‌گیرد و پس از ۳ دقیقه فروکش می‌کند. فقط نفس بکشید و روی موج بمانید.'
                    : 'Neuroscience shows urges peak and dissolve in 3 minutes like ocean waves. Just breathe and ride the wave.'}
                </p>
              </div>

              <ProgressRing
                percentage={((180 - sosRemaining) / 180) * 100}
                size={170}
                strokeWidth={9}
                color="#f43f5e"
              >
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                    {Math.floor(sosRemaining / 60)}:{(sosRemaining % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] mt-0.5">
                    {isSosActive ? (isRtl ? 'موج‌سواری...' : 'Surfing...') : (isRtl ? 'آماده ۳ دقیقه' : 'Ready')}
                  </span>
                </div>
              </ProgressRing>

              {!isSosActive ? (
                <button
                  onClick={startSosSurfing}
                  className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-black shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <LifeBuoy size={16} />
                  <span>{isRtl ? 'شروع موج‌سواری ۳ دقیقه‌ای (+۳۰ XP)' : 'Start 3-Min Urge Surfing (+30 XP)'}</span>
                </button>
              ) : (
                <div className="text-xs text-rose-500 font-bold animate-pulse">
                  {isRtl ? 'دم عمیق... بازدم کامل... موج در حال فروکش کردن است.' : 'Deep inhale... full exhale... the wave is dissolving.'}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2.5: DOPAMINE & NEUROSCIENCE ACADEMY */}
        {activeTab === 'academy' && (
          <motion.div
            key="academy"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <BookOpen size={18} className="text-rose-500" />
                  <span>{isRtl ? 'آکادمی علوم اعصاب دوپامین و رهایی پایدار' : 'Dopamine Reset & Sobriety Academy'}</span>
                </h2>
                <span className="text-xs text-[var(--text-secondary)]">
                  {ADDICTION_ACADEMY_MODULES.length} {isRtl ? 'پروتکل علمی' : 'protocols'}
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isRtl
                  ? 'شناخت بیولوژی مغز در ۹۰ روز بازسازی دوپامین، مهار تکانه با تکنیک موج‌سواری و پیشگیری قطعی از لغزش.'
                  : 'Neuroscience of dopamine recovery, urge surfing protocols and bulletproof relapse defense.'}
              </p>

              <div className="space-y-3">
                {ADDICTION_ACADEMY_MODULES.map((item) => {
                  const isExpanded = expandedAddictionId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isExpanded
                          ? 'bg-[var(--bg-secondary)] border-rose-500/50 shadow-md'
                          : 'bg-[var(--bg-secondary)]/50 border-[var(--border)] hover:border-rose-500/30'
                      }`}
                    >
                      <div
                        onClick={() => {
                          setExpandedAddictionId(isExpanded ? null : item.id);
                          haptics.tap();
                        }}
                        className="flex items-center justify-between cursor-pointer gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">{item.icon}</span>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                              {isRtl ? item.titleFa : item.titleEn}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-secondary)]">
                              <span className="font-semibold text-rose-400">{isRtl ? item.categoryFa : item.categoryEn}</span>
                              <span>•</span>
                              <span>{isRtl ? item.readTimeFa : item.readTimeEn}</span>
                            </div>
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
                            className="overflow-hidden mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-primary)] leading-relaxed space-y-3"
                          >
                            <div className="whitespace-pre-line font-medium leading-loose text-slate-200">
                              {isRtl ? item.contentFa : item.summaryEn}
                            </div>

                            {item.keyTakeawayFa && (
                              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-[11px] flex items-center gap-2">
                                <Sparkles size={14} className="flex-shrink-0" />
                                <span>{isRtl ? `نکته کلیدی: ${item.keyTakeawayFa}` : item.keyTakeawayFa}</span>
                              </div>
                            )}
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

        {/* TAB 3: HALT CHECK */}
        {activeTab === 'halt' && (
          <motion.div
            key="halt"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 rounded-3xl border border-[var(--border)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <span>{isRtl ? 'پایش ۴ وضعیت آسیب‌پذیر (قانون HALT)' : 'The HALT Vulnerability Protocol'}</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                {isRtl
                  ? 'بیش از ۹۰٪ لغزش‌ها ناشی از یکی از این ۴ وضعیت است. خود را ارزیابی کنید:'
                  : 'Over 90% of urges stem from one of these 4 states. Check yourself:'}
              </p>

              <div className="space-y-2.5">
                {[
                  { id: 'hungry', icon: '🍎', fa: 'Hungry (گرسنه؟)', en: 'Hungry', descFa: 'افت قند خون مغز را تحریک‌پذیر می‌کند. یک میان‌وعده سالم بخورید.', descEn: 'Low glucose makes the brain vulnerable. Have a healthy snack.' },
                  { id: 'angry', icon: '⚡', fa: 'Angry (عصبانی یا مضطرب؟)', en: 'Angry / Anxious', descFa: 'خشم حل‌نشده محرک فرار است. چند نفس عمیق بکشید یا راه بروید.', descEn: 'Unresolved anger drives escapism. Take a walk or deep breaths.' },
                  { id: 'lonely', icon: '🫂', fa: 'Lonely (احساس تنهایی یا انزوا؟)', en: 'Lonely / Isolated', descFa: 'انزوا دام اعتیاد است. به یک دوست پیام دهید یا در جمع قرار بگیرید.', descEn: 'Isolation is a trap. Reach out to a friend or mentor.' },
                  { id: 'tired', icon: '😴', fa: 'Tired (خسته و کم‌خواب؟)', en: 'Tired / Depleted', descFa: 'خستگی اراده را فلج می‌کند. ۲۰ دقیقه چرت بزنید یا استراحت کنید.', descEn: 'Fatigue depletes willpower. Take a short nap or rest.' },
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => setHaltStatus(p => ({ ...p, [item.id]: !p[item.id] }))}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      haltStatus[item.id]
                        ? 'bg-rose-500/15 border-rose-500/50 shadow-xs'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] opacity-85'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        {isRtl ? item.fa : item.en}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                        {isRtl ? item.descFa : item.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: HABITS */}
        {activeTab === 'habits' && (
          <motion.div
            key="habits"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="glass-card p-5 rounded-3xl border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    {isRtl ? 'عادات روزانه اقتدار، تاب‌آوری و رهایی' : 'Daily Freedom & Sovereignty Habits'}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {isRtl ? `${completedHabits} از ${addictionHabits.length} مورد امروز انجام شد` : `${completedHabits} of ${addictionHabits.length} completed`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {addictionHabits.map(habit => (
                  <HabitItem
                    key={habit.id}
                    item={habit}
                    completed={!!todayLogs[habit.id]}
                    onToggle={() => {
                      toggleHabit(habit.id);
                      if (!todayLogs[habit.id]) {
                        soundEngine.playCheckmark();
                        addXP(habit.xp || 20, habit.nameFa || habit.name);
                      }
                    }}
                    onDelete={deleteHabit}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Reset Compassionate Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-3xl border border-[var(--border)]"
          >
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <span>🕊️</span>
              <span>{isRtl ? 'شروع دوباره با شفقت و بدون سرزنش' : 'Compassionate Fresh Start'}</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              {isRtl
                ? 'لغزش بخشی از مسیر یادگیری است، نه پایان آن. پیشرفت روزهای گذشته از بین نرفته است. علت را بنویسید و پرقدرت ادامه دهید.'
                : 'A slip is a lesson, not the end. Your past progress is never lost. Write what you learned and rise stronger.'}
            </p>

            <textarea
              rows={3}
              value={resetReason}
              onChange={e => setResetReason(e.target.value)}
              placeholder={isRtl ? 'چه عاملی باعث لغزش شد و در آینده چگونه از آن پیشگیری خواهم کرد؟' : 'What triggered this and how will you adapt?'}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-rose-500 mb-4 resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)]"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                onClick={handleCompassionateReset}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold shadow-md hover:opacity-90"
              >
                {isRtl ? 'شروع پاکی مجدد' : 'Start Fresh'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Widgets Section */}
      <SectionWidgets sectionId="addiction" />
    </div>
  );
}
