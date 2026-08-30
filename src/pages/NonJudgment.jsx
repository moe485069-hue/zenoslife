import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, Eye, Sparkles, Feather, Heart, Brain, RefreshCw, Plus, CheckCircle2,
  HelpCircle, Shield, ArrowLeft, ArrowRight, Trash2, Clock, Volume2, Check
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import HabitItem from '../components/ui/HabitItem';
import SectionWidgets from '../components/ui/SectionWidgets';
import ProgressRing from '../components/ui/ProgressRing';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';

const NON_JUDGMENT_QUOTES = [
  {
    textFa: 'از پسِ نیک و بد خیمه‌گاهی است؛ در آنجا تو را دیدار خواهم کرد...',
    textEn: 'Out beyond ideas of wrongdoing and rightdoing, there is a field. I\'ll meet you there.',
    authorFa: 'مولانا جلال‌الدین بلخی',
    authorEn: 'Rumi',
  },
  {
    textFa: 'مشاهده بدون ارزیابی و قضاوت، بالاترین شکل هوشمندی انسان است.',
    textEn: 'Observation without evaluation is the highest form of human intelligence.',
    authorFa: 'جیدو کریشنامورتی',
    authorEn: 'Jiddu Krishnamurti',
  },
  {
    textFa: 'انسان‌ها از وقایع رنج نمی‌برند، بلکه از قضاوتی که درباره آن وقایع دارند رنج می‌کشند.',
    textEn: 'Men are disturbed not by things, but by the view which they take of them.',
    authorFa: 'اپیکتتوس (فیلسوف رواقی)',
    authorEn: 'Epictetus',
  },
  {
    textFa: 'کنجکاو باش، نه قضاوت‌گر.',
    textEn: 'Be curious, not judgmental.',
    authorFa: 'والت ویتمن',
    authorEn: 'Walt Whitman',
  },
];

const PRESET_REFRAMES = [
  {
    judgmentFa: 'فلانی آدم بی‌مسئولیت و تنبلی است!',
    judgmentEn: 'They are completely lazy and irresponsible!',
    observationFa: 'او امروز کار را در زمان مقرر تمام نکرد. ممکن است با چالش، خستگی یا اضطرابی روبرو باشد که من از آن بی‌خبرم.',
    observationEn: 'They didn\'t finish the task today. They might be facing challenges or fatigue I am unaware of.',
    insightFa: 'تفکیک هویت شخص از رفتار گذرا؛ جایگزینی برچسب با کنجکاوی و درک.',
    insightEn: 'Separating person from behavior; replacing labels with empathy.'
  },
  {
    judgmentFa: 'من در همه چیز شکست می‌خورم و هیچ کاری را درست انجام نمی‌دهم!',
    judgmentEn: 'I fail at everything and can\'t get anything right!',
    observationFa: 'در این پروژه خاص به نتیجه دلخواهم نرسیدم. این یک تجربه یادگیری است، نه تعریف ارزش درونی من.',
    observationEn: 'This specific project didn\'t go as planned. It is a learning lesson, not my worth.',
    insightFa: 'پرهیز از تعمیم افراطی؛ گفتگو با خود با لحن یک دوست مهربان.',
    insightEn: 'Avoiding over-generalization; speaking to self as a kind friend.'
  },
  {
    judgmentFa: 'او عمداً می‌خواست با حرفش به من توهین کند!',
    judgmentEn: 'They deliberately wanted to offend and disrespect me!',
    observationFa: 'کلمات او احساس ناخوشایندی در من ایجاد کرد. رفتار دیگران بازتاب دنیای درون خودشان است، نه ارزش من.',
    observationEn: 'Their words caused an uneasy feeling. Others\' actions reflect their world, not my worth.',
    insightFa: 'تیغ هانلون (Hanlon\'s Razor): هرگز آنچه را می‌توان با ناآگاهی توجیه کرد، به سوءنیت نسبت نده.',
    insightEn: 'Hanlon\'s Razor: Never attribute to malice that which is adequately explained by unawareness.'
  },
  {
    judgmentFa: 'این روز کاملاً فاجعه و خراب بود!',
    judgmentEn: 'This entire day was an absolute disaster!',
    observationFa: 'چند رخداد نامطلوب امروز پیش آمد، اما در کنار آن نفس کشیدم، یاد گرفتم و این لحظه گذراست.',
    observationEn: 'A few unwanted events happened, but I am here, learning and breathing. This too shall pass.',
    insightFa: 'دیدن تصویر بزرگتر به جای بزرگ‌نمایی رخدادهای منفی.',
    insightEn: 'Seeing the bigger picture without magnifying negative events.'
  }
];

export default function NonJudgment() {
  const { language, addXP } = useAppStore();
  const { habits, todayLogs, loadHabits, toggleHabit, deleteHabit,
    journalEntries, loadJournals, addJournalEntry, deleteJournalEntry } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('reframe'); // 'reframe' | 'filters' | 'timer' | 'log' | 'habits'
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Reframe custom state
  const [customJudgment, setCustomJudgment] = useState('');
  const [customReframe, setCustomReframe] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(0);

  // 3 Filters State
  const [filterChecks, setFilterChecks] = useState({ truth: false, kindness: false, necessity: false });
  const [filterThought, setFilterThought] = useState('');

  // Awareness Timer State
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [timerRemaining, setTimerRemaining] = useState(180);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerLabel, setTimerLabel] = useState('');

  // Log state
  const [logTrigger, setLogTrigger] = useState('');
  const [logReframeText, setLogReframeText] = useState('');

  useEffect(() => {
    loadHabits('nonJudgment');
    loadJournals();
  }, []);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(t => t - 1);
      }, 1000);

      if (timerRemaining > 120) {
        setTimerLabel(isRtl ? 'نفس بکشید و افکار را چون ابرهای گذران در آسمان تماشا کنید...' : 'Breathe softly and watch thoughts float like clouds in the sky...');
      } else if (timerRemaining > 30) {
        setTimerLabel(isRtl ? 'هیچ فکری را «خوب» یا «بد» نام‌گذاری نکنید؛ فقط نظاره‌گر آرام باشید...' : 'Do not label any thought as "good" or "bad"; just observe gently...');
      } else {
        setTimerLabel(isRtl ? 'به فضای سکوت و پذیرش درون خود خوش آمدید...' : 'Welcome the space of inner silence and non-resistance...');
      }
    } else if (isTimerActive && timerRemaining === 0) {
      setIsTimerActive(false);
      soundEngine.playMeditationBowl();
      addXP(25, 'تکمیل تمرین مشاهده بی‌برچسب');
      setTimerLabel(isRtl ? '✨ تمرین مشاهده بی‌برچسب با موفقیت به پایان رسید (+۲۵ XP)' : '✨ Label-free awareness session complete (+25 XP)');
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerRemaining, isRtl]);

  const startAwarenessTimer = (mins) => {
    soundEngine.playMeditationBowl();
    setTimerSeconds(mins * 60);
    setTimerRemaining(mins * 60);
    setIsTimerActive(true);
  };

  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!logTrigger.trim()) return;

    await addJournalEntry({
      title: isRtl ? 'رصد قضاوت' : 'Judgment Observed',
      content: `[قضاوت اولیه]: ${logTrigger}\n[بازنگری آگاهانه]: ${logReframeText || (isRtl ? 'مشاهده با پذیرش و بدون برچسب' : 'Observed with acceptance')}`,
      mood: 'neutral',
      tags: 'قضاوت‌نکردن,ذهن‌آگاهی,شفقت',
      sectionId: 'nonJudgment'
    });

    soundEngine.playCheckmark();
    haptics.dissolve();
    addXP(20, 'ثبت و رصد قضاوت');
    setLogTrigger('');
    setLogReframeText('');
  };

  const nonJudgmentHabits = habits.filter(h => h.sectionId === 'nonJudgment');
  const completedHabits = nonJudgmentHabits.filter(h => todayLogs[h.id]).length;
  const currentQuote = NON_JUDGMENT_QUOTES[quoteIdx];

  const TABS = [
    { id: 'reframe', fa: 'بازنگری قضاوت‌ها', en: 'Reframing', icon: '🔄' },
    { id: 'filters', fa: 'سه آزمون خرد', en: '3 Filters', icon: '⚖️' },
    { id: 'timer', fa: 'مشاهده بی‌برچسب', en: 'Mindful Pause', icon: '🧘' },
    { id: 'log', fa: 'دفترچه رصد', en: 'Judgment Log', icon: '📓' },
    { id: 'habits', fa: 'عادات روزانه', en: 'Daily Habits', icon: '✅' },
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
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-2xl text-cyan-500 shadow-sm">
            ⚖️
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">
              {isRtl ? 'قضاوت نکردن و پذیرش' : 'Mindful Non-Judgment'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isRtl ? 'هنر دیدن واقعیت همان‌گونه که هست، بدون برچسب زدن خوب یا بد' : 'The art of seeing reality as it is, without labeling'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quote Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-4 rounded-2xl relative overflow-hidden"
        style={{ borderInlineStart: '4px solid #06b6d4' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl">🕊️</span>
            <div>
              <p className="italic text-xs leading-relaxed text-[var(--text-primary)] font-medium">
                «{isRtl ? currentQuote.textFa : currentQuote.textEn}»
              </p>
              <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                — {isRtl ? currentQuote.authorFa : currentQuote.authorEn}
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuoteIdx((quoteIdx + 1) % NON_JUDGMENT_QUOTES.length)}
            className="p-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-cyan-500 transition-colors"
            title={isRtl ? 'نقل‌قول بعدی' : 'Next Quote'}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-cyan-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB 1: COGNITIVE REFRAMING */}
        {activeTab === 'reframe' && (
          <motion.div
            key="reframe"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 rounded-3xl border border-[var(--border)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <span>🔄</span>
                <span>{isRtl ? 'آزمایشگاه تبدیل قضاوت به مشاهده عینی' : 'Reframing Laboratory'}</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                {isRtl
                  ? 'ذهن ما به سرعت برچسب می‌زند. نمونه‌های زیر را بررسی کنید یا قضاوت خود را بازنویسی کنید:'
                  : 'Our minds jump to conclusions. Check these examples or reframe your own thought:'}
              </p>

              {/* Presets selector */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
                {PRESET_REFRAMES.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPreset(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                      selectedPreset === idx
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                        : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {isRtl ? `نمونه ${idx + 1}` : `Example ${idx + 1}`}
                  </button>
                ))}
              </div>

              {/* Active preset comparison */}
              <div className="space-y-3">
                {/* 1. The Judgment */}
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                    <span>❌</span>
                    <span>{isRtl ? 'قضاوت ذهنی / برچسب' : 'Initial Judgment / Label'}</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
                    «{isRtl ? PRESET_REFRAMES[selectedPreset].judgmentFa : PRESET_REFRAMES[selectedPreset].judgmentEn}»
                  </p>
                </div>

                {/* 2. The Objective Observation */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    <span>🌿</span>
                    <span>{isRtl ? 'مشاهده عینی و بدون برچسب (ذهن‌آگاه)' : 'Objective Observation'}</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
                    «{isRtl ? PRESET_REFRAMES[selectedPreset].observationFa : PRESET_REFRAMES[selectedPreset].observationEn}»
                  </p>
                </div>

                {/* 3. Deep Insight */}
                <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 mb-0.5">
                    <Sparkles size={13} />
                    <span>{isRtl ? 'نکته روان‌شناختی' : 'Psychological Insight'}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {isRtl ? PRESET_REFRAMES[selectedPreset].insightFa : PRESET_REFRAMES[selectedPreset].insightEn}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: THE 3 WISDOM FILTERS */}
        {activeTab === 'filters' && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 rounded-3xl border border-[var(--border)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <span>⚖️</span>
                <span>{isRtl ? 'سه پالایه خرد (آزمون قبل از قضاوت)' : 'The 3 Filters of Wisdom'}</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                {isRtl
                  ? 'هرگاه فکری انتقادی یا قضاوتی درباره خود یا دیگری در ذهنتان جوشید، آن را از این ۳ پالایه عبور دهید:'
                  : 'Whenever a critical judgment arises, pass it through these 3 filters:'}
              </p>

              <input
                type="text"
                value={filterThought}
                onChange={e => setFilterThought(e.target.value)}
                placeholder={isRtl ? 'فکر یا قضاوت مورد نظر را اینجا بنویسید...' : 'Write the thought or judgment here...'}
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] mb-4 outline-none focus:border-cyan-500"
              />

              <div className="space-y-2.5">
                {[
                  {
                    id: 'truth',
                    titleFa: '۱. پالایه حقیقت عینی (Truth)',
                    titleEn: '1. Filter of Objective Truth',
                    descFa: 'آیا این یک حقیقت صددرصد اثبات‌شده است، یا فقط تعبیر و پیش‌فرض ذهن من؟',
                    descEn: 'Is this an undeniable proven fact, or merely my interpretation?',
                    icon: '🔍'
                  },
                  {
                    id: 'kindness',
                    titleFa: '۲. پالایه مهر و شفقت (Kindness)',
                    titleEn: '2. Filter of Kindness & Empathy',
                    descFa: 'آیا این فکر از سر دلسوزی و درک عمیق است یا از روی خشم، غرور و رنجش؟',
                    descEn: 'Is this thought rooted in empathy, or in anger, pride and hurt?',
                    icon: '❤️'
                  },
                  {
                    id: 'necessity',
                    titleFa: '۳. پالایه فایده و ضرورت (Utility)',
                    titleEn: '3. Filter of Necessity',
                    descFa: 'آیا درگیر شدن با این قضاوت به رشد، آرامش یا بهبود روابط کمکی می‌کند؟',
                    descEn: 'Does holding this judgment serve peace, growth, or better relationships?',
                    icon: '🌱'
                  },
                ].map(f => (
                  <div
                    key={f.id}
                    onClick={() => setFilterChecks(p => ({ ...p, [f.id]: !p[f.id] }))}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      filterChecks[f.id]
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-xs'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] opacity-85'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border-2 mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${
                      filterChecks[f.id] ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-[var(--border)]'
                    }`}>
                      {filterChecks[f.id] && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        {isRtl ? f.titleFa : f.titleEn}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                        {isRtl ? f.descFa : f.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {Object.values(filterChecks).filter(Boolean).length === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center"
                >
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {isRtl ? '✨ تبریک! ذهن شما این فکر را با خرد و بی‌قضاوتی سنجید (+۱۰ XP)' : '✨ Thought purified with wisdom & non-judgment (+10 XP)'}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: AWARENESS TIMER */}
        {activeTab === 'timer' && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-6 rounded-3xl border border-[var(--border)] flex flex-col items-center gap-5"
          >
            <div className="text-center">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center justify-center gap-1.5">
                <span>🧘</span>
                <span>{isRtl ? 'مشاهده بی‌برچسب افکار (Label-Free Awareness)' : 'Label-Free Awareness Timer'}</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
                {isRtl
                  ? 'بنشینید، چشم‌ها را ببندید و افکار، صداها و حس‌ها را فقط نظاره کنید؛ بدون آنکه بگویید «خوب است» یا «بد است».'
                  : 'Sit quietly, observe thoughts and sensations without tagging them good or bad.'}
              </p>
            </div>

            <ProgressRing
              percentage={timerSeconds > 0 ? ((timerSeconds - timerRemaining) / timerSeconds) * 100 : 0}
              size={180}
              strokeWidth={9}
              color="#06b6d4"
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extralight tabular-nums tracking-wider text-[var(--text-primary)]">
                  {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  {isTimerActive ? (isRtl ? 'در حال مشاهده' : 'Observing') : (isRtl ? 'آماده' : 'Ready')}
                </span>
              </div>
            </ProgressRing>

            {timerLabel && (
              <p className="text-xs text-center text-[var(--text-secondary)] italic max-w-xs px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                «{timerLabel}»
              </p>
            )}

            {!isTimerActive ? (
              <div className="flex gap-2">
                {[1, 3, 5].map(mins => (
                  <button
                    key={mins}
                    onClick={() => startAwarenessTimer(mins)}
                    className="px-4 py-2 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-cyan-500 hover:text-cyan-500 transition-all active:scale-95"
                  >
                    {mins} {isRtl ? 'دقیقه' : 'min'}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => { setIsTimerActive(false); setTimerRemaining(timerSeconds); }}
                className="px-6 py-2 rounded-2xl bg-[var(--danger)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                {isRtl ? 'پایان تمرین' : 'End Practice'}
              </button>
            )}
          </motion.div>
        )}

        {/* TAB 4: JUDGMENT LOG */}
        {activeTab === 'log' && (
          <motion.div
            key="log"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Form */}
            <form onSubmit={handleSaveLog} className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-3">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span>📓</span>
                <span>{isRtl ? 'ثبت و مهار قضاوت روزانه' : 'Catch & Record Judgment'}</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {isRtl
                  ? 'مچ قضاوت خود را بگیرید! ثبت کردن قضاوت، اولین گام برای خاموش کردن واکنش‌های خودکار ذهن است.'
                  : 'Catching yourself in the act of judging is the greatest step toward freedom.'}
              </p>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  {isRtl ? 'قضاوتی که در ذهن پدیدار شد:' : 'Judgment observed:'}
                </label>
                <input
                  type="text"
                  required
                  value={logTrigger}
                  onChange={e => setLogTrigger(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: قضاوت عجولانه درباره رانندگی یک نفر، یا سرزنش خودم...' : 'e.g., Judged someone in traffic, or harsh self-criticism...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  {isRtl ? 'بازنگری آگاهانه و بدون برچسب:' : 'Mindful reframe / observation:'}
                </label>
                <textarea
                  rows={2}
                  value={logReframeText}
                  onChange={e => setLogReframeText(e.target.value)}
                  placeholder={isRtl ? 'چگونه می‌توان این رخداد را بدون برچسب و با پذیرش نگریست؟' : 'How can you view this without labels and with acceptance?'}
                  className="w-full px-4 py-2 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-cyan-600 text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>{isRtl ? 'ثبت در دفترچه (+۲۰ XP)' : 'Save to Log (+20 XP)'}</span>
              </button>
            </form>

            {/* Past Entries */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] px-1">
                {isRtl ? 'قضاوت‌های ثبت و مهارشده اخیر' : 'Recent Logged Observations'}
              </h3>
              {journalEntries.filter(j => j.sectionId === 'nonJudgment' || j.tags?.includes('قضاوت‌نکردن')).length === 0 ? (
                <div className="glass-card p-4 rounded-2xl text-center text-xs text-[var(--text-secondary)]">
                  {isRtl ? 'هنوز موردی ثبت نشده است. اولین قضاوت مهارشده را ثبت کنید!' : 'No entries yet. Catch your first judgment above!'}
                </div>
              ) : (
                journalEntries
                  .filter(j => j.sectionId === 'nonJudgment' || j.tags?.includes('قضاوت‌نکردن'))
                  .map(entry => (
                    <div key={entry.id} className="glass-card p-3.5 rounded-2xl flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-primary)] whitespace-pre-line leading-relaxed">
                          {entry.content}
                        </p>
                        <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
                          {entry.date}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteJournalEntry(entry.id)}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 5: HABITS */}
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
                    {isRtl ? 'تمرین‌ها و عادات روزمره قضاوت نکردن' : 'Daily Non-Judgment Habits'}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {isRtl ? `${completedHabits} از ${nonJudgmentHabits.length} تمرین امروز انجام شد` : `${completedHabits} of ${nonJudgmentHabits.length} completed`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {nonJudgmentHabits.map(habit => (
                  <HabitItem
                    key={habit.id}
                    item={habit}
                    completed={!!todayLogs[habit.id]}
                    onToggle={() => {
                      toggleHabit(habit.id);
                      if (!todayLogs[habit.id]) {
                        soundEngine.playCheckmark();
                        addXP(habit.xp || 15, habit.nameFa || habit.name);
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

      {/* Custom Widgets Section */}
      <SectionWidgets sectionId="nonJudgment" />
    </div>
  );
}
