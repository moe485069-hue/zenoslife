import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Eye, Sparkles, Feather, Heart, Wind, RefreshCw, Plus,
  CheckCircle2, Trash2, Mountain, Sun, Moon, ArrowRight, ShieldCheck, Check
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import HabitItem from '../components/ui/HabitItem';
import SectionWidgets from '../components/ui/SectionWidgets';
import soundEngine from '../utils/audio';

const PERSPECTIVE_QUOTES = [
  {
    textFa: 'اگر از دوردست به کوهستان بنگری، تمام فراز و نشیب‌های تند به یک خط افق آرام و زیبا بدل می‌شوند.',
    textEn: 'When viewed from a distance, the sharpest mountain crags merge into a peaceful horizon.',
    authorFa: 'خرد خاور دور',
    authorEn: 'Zen Wisdom',
  },
  {
    textFa: 'زندگی نه مشکلی برای حل کردن، بلکه واقعیتی برای تجربه کردن در سکوت و آرامش است.',
    textEn: 'Life is not a problem to be solved, but a reality to be experienced in peace.',
    authorFa: 'سورن کی‌یرکگور',
    authorEn: 'Søren Kierkegaard',
  },
  {
    textFa: 'آرامش زمانی آغاز می‌شود که نیازی به اثبات چیزی به کسی یا حتی به خودت احساس نکنی.',
    textEn: 'Peace begins the moment you have nothing left to prove to anyone or yourself.',
    authorFa: 'پذیرش درونی',
    authorEn: 'Inner Acceptance',
  },
  {
    textFa: 'در میان هیاهوی جهان، سکوت درون خود را پاس بدار؛ آنجا خانه حقیقی توست.',
    textEn: 'Amidst the noise of the world, guard your inner silence; that is your true sanctuary.',
    authorFa: 'مارکوس اورلیوس',
    authorEn: 'Marcus Aurelius',
  },
];

const PARADIGMS = [
  {
    id: 'cosmicunity',
    icon: '🌌',
    titleFa: 'وحدت کیهانی (Cosmic Unity)',
    titleEn: 'Cosmic Unity',
    descFa: 'ما در این کیهان تنها نیستیم؛ ما خودِ کیهانیم که به آگاهی رسیده‌ایم. مرز بین من و دیگری توهم است. ما همه اجزای به هم پیوسته یک کل بی‌کران هستیم و قضاوت دیگری، قضاوت خودمان است.',
    descEn: 'We are not just in the universe; we are the universe experiencing itself. The illusion of separation dissolves when we realize we are interconnected parts of an infinite whole.'
  },
  {
    id: 'wabisabi',
    icon: '🍃',
    titleFa: 'وابی-سابی (Wabi-Sabi)',
    titleEn: 'Wabi-Sabi (Beauty in Imperfection)',
    descFa: 'زیبایی در ناتمامی، سادگی و نقص‌های طبیعی نهفته است. رها کردن کمال‌گرایی سمی و پذیرش جریان گذرای زندگی.',
    descEn: 'Finding beauty in impermanence and imperfection. Releasing perfectionism and embracing the natural flow of life.'
  },
  {
    id: 'amorfati',
    icon: '🔥',
    titleFa: 'آمور فاتی (Amor Fati)',
    titleEn: 'Amor Fati (Love of Fate)',
    descFa: 'عشق ورزیدن به هرآنچه پیش می‌آید. دیدن هر مانع به عنوان هیزمی برای شعله‌ورتر شدن آتش آگاهی و رشد.',
    descEn: 'Embracing every circumstance with love. Treating obstacles as fuel for the fire of consciousness.'
  },
  {
    id: 'wuwei',
    icon: '🌊',
    titleFa: 'وو-وی (Wu Wei - عمل بدون تقلا)',
    titleEn: 'Wu Wei (Effortless Action)',
    descFa: 'همانند آب جاری باشید؛ راه خود را از میان سنگ‌ها بدون خشم و اصطکاک می‌گشاید. هماهنگی با ضرب‌آهنگ طبیعی هستی.',
    descEn: 'Flow like water; find the way through stones without resistance. Harmonize with nature\'s rhythm.'
  },
  {
    id: 'firstprinciples',
    icon: '💡',
    titleFa: 'تفکر از اصول اولیه و اصالت',
    titleEn: 'First Principles Clarity',
    descFa: 'شکستن مسائل به حقایق بنیادین و رها کردن هیاهوی نظرات دیگران. دیدن آنچه واقعاً مهم است و نادیده گرفتن مابقی.',
    descEn: 'Breaking things down to fundamental truths, tuning out opinions and noise to focus on core essence.'
  }
];

const TIME_HORIZONS = [
  { scale: '5m', labelFa: '۵ دقیقه دیگر', labelEn: '5 Minutes', perspectiveFa: 'تأثیر تنفس عمیق و آرام شدن ضربان قلب.', perspectiveEn: 'Deep breath calms heart rhythm.' },
  { scale: '5d', labelFa: '۵ روز دیگر', labelEn: '5 Days', perspectiveFa: 'احساسات هیجانی فروکش کرده و منطق بازمی‌گردد.', perspectiveEn: 'Emotional surge settles into clarity.' },
  { scale: '5mo', labelFa: '۵ ماه دیگر', labelEn: '5 Months', perspectiveFa: 'بسیاری از نگرانی‌های امروز حتی به یاد نخواهند آمد.', perspectiveEn: 'Most current worries will be forgotten.' },
  { scale: '5y', labelFa: '۵ سال دیگر', labelEn: '5 Years', perspectiveFa: 'این چالش تنها یک تجربه کوچک در کتاب زندگی شماست.', perspectiveEn: 'Just a small chapter in your life story.' },
  { scale: '50y', labelFa: '۵۰ سال دیگر', labelEn: '50 Years', perspectiveFa: 'تنها چیزی که می‌ماند عشق، آرامش و مهربانی با خود و دیگران است.', perspectiveEn: 'Only love, peace, and kindness remain.' },
];

export default function Perspective() {
  const { language, addXP } = useAppStore();
  const { habits, todayLogs, loadHabits, toggleHabit, deleteHabit } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'paradigms' | 'letgo' | 'habits'
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Time scaler state
  const [worryText, setWorryText] = useState('');
  const [selectedHorizon, setSelectedHorizon] = useState(3); // default 5 years

  // Let go state
  const [letGoText, setLetGoText] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [dissolveSuccess, setDissolveSuccess] = useState(false);

  useEffect(() => {
    loadHabits('perspective');
  }, []);

  const handleLetGo = () => {
    if (!letGoText.trim()) return;
    setIsDissolving(true);
    soundEngine.playMeditationBowl();
    setTimeout(() => {
      setIsDissolving(false);
      setLetGoText('');
      setDissolveSuccess(true);
      addXP(20, 'رهاسازی دغدغه و پالایش ذهن');
      setTimeout(() => setDissolveSuccess(false), 4000);
    }, 2000);
  };

  const perspectiveHabits = habits.filter(h => h.sectionId === 'perspective');
  const completedHabits = perspectiveHabits.filter(h => todayLogs[h.id]).length;
  const currentQuote = PERSPECTIVE_QUOTES[quoteIdx];

  const TABS = [
    { id: 'overview', fa: 'نمای بال عقاب', en: 'Eagle View', icon: '🔭' },
    { id: 'paradigms', fa: 'پارادایم‌های آرامش', en: 'Calm Paradigms', icon: '🌊' },
    { id: 'letgo', fa: 'اتاق رهاسازی', en: 'Let Go Room', icon: '🍃' },
    { id: 'habits', fa: 'عادات پرورش بینش', en: 'Perspective Habits', icon: '🕊️' },
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
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-2xl text-sky-500 shadow-sm">
            🔭
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">
              {isRtl ? 'دیدگاه، بینش و وسعت نظر' : 'Perspective & Higher View'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isRtl ? 'تماشای زندگی از اوج، تغییر مقیاس دغدغه‌ها و آرامش عمیق درون' : 'Zoom out from noise, scale your worries, and cultivate deep peace'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quote Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-5 rounded-2xl relative overflow-hidden"
        style={{ borderInlineStart: '4px solid #38bdf8' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl">🕊️</span>
            <div>
              <p className="italic text-xs leading-relaxed text-[var(--text-primary)] font-medium">
                «{isRtl ? currentQuote.textFa : currentQuote.textEn}»
              </p>
              <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-1">
                — {isRtl ? currentQuote.authorFa : currentQuote.authorEn}
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuoteIdx((quoteIdx + 1) % PERSPECTIVE_QUOTES.length)}
            className="p-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-sky-500 transition-colors"
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
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-sky-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB 1: THE EAGLE'S VIEW (TIME SCALER) */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] space-y-4">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Mountain className="text-sky-500" size={20} />
                  <span>{isRtl ? 'ابزار تغییر مقیاس زمان (قانون ۵ سال بعد)' : 'The 5-Year Perspective Scaler'}</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {isRtl
                    ? 'دغدغه یا تنش کنونی خود را بنویسید و مقیاس زمان را تغییر دهید تا کوچک شدن آن در بستر زندگی را لمس کنید:'
                    : 'Write a current stress and shift the time scale to observe it shrink into peace:'}
                </p>
              </div>

              <input
                type="text"
                value={worryText}
                onChange={e => setWorryText(e.target.value)}
                placeholder={isRtl ? 'مثلاً: نگران مصاحبه کاری فردا هستم، یا از یک پیام ناراحت شدم...' : 'e.g. Worried about a deadline or upset about a comment...'}
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-sky-500"
              />

              {/* Time Horizon selector buttons */}
              <div className="grid grid-cols-5 gap-1.5 pt-2">
                {TIME_HORIZONS.map((h, idx) => (
                  <button
                    key={h.scale}
                    onClick={() => setSelectedHorizon(idx)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all ${
                      selectedHorizon === idx
                        ? 'bg-sky-500/20 border-sky-500 text-sky-600 dark:text-sky-400 font-bold shadow-xs scale-105'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] text-[10px]'
                    }`}
                  >
                    <span className="text-xs font-bold block">{isRtl ? h.labelFa : h.labelEn}</span>
                  </button>
                ))}
              </div>

              {/* Perspective Insight Box */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 mt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 mb-1">
                  <Sparkles size={14} />
                  <span>{isRtl ? `دیدگاه در مقیاس ${TIME_HORIZONS[selectedHorizon].labelFa}:` : `View at ${TIME_HORIZONS[selectedHorizon].labelEn}:`}</span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
                  {isRtl ? TIME_HORIZONS[selectedHorizon].perspectiveFa : TIME_HORIZONS[selectedHorizon].perspectiveEn}
                </p>
                {worryText && (
                  <p className="text-[11px] text-[var(--text-secondary)] mt-2 italic border-t border-sky-500/20 pt-2">
                    {isRtl
                      ? `«${worryText}» در برابر شکوه و پهنه زمان بسیار کوچک و گذراست. آرام باشید.`
                      : `"${worryText}" is small and transient in the grand tapestry of time. Breathe in peace.`}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CALM PARADIGMS */}
        {activeTab === 'paradigms' && (
          <motion.div
            key="paradigms"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {PARADIGMS.map((p) => (
              <div key={p.id} className="glass-card p-4 rounded-2xl border border-[var(--border)] card-hover">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{p.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-sky-600 dark:text-sky-400 mb-1">
                      {isRtl ? p.titleFa : p.titleEn}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {isRtl ? p.descFa : p.descEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* TAB 3: THE LET GO SANCTUARY */}
        {activeTab === 'letgo' && (
          <motion.div
            key="letgo"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-sky-500/15 border-2 border-sky-500 flex items-center justify-center text-2xl text-sky-500 shadow-sm">
                🍃
              </div>

              <div>
                <h2 className="text-base font-black text-[var(--text-primary)]">
                  {isRtl ? 'اتاق سکوت و رهاسازی تنش‌ها' : 'The Let Go Sanctuary'}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm leading-relaxed">
                  {isRtl
                    ? 'هر آنچه ذهنتان را سنگین کرده، خشم، دلخوری یا اضطراب را بنویسید و آن را به باد و کائنات بسپارید تا محو شود.'
                    : 'Write whatever weighs on your mind, anger or anxiety, and surrender it to dissolve peacefully.'}
                </p>
              </div>

              <motion.div
                animate={{
                  opacity: isDissolving ? 0 : 1,
                  scale: isDissolving ? 0.8 : 1,
                  filter: isDissolving ? 'blur(10px)' : 'blur(0px)'
                }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                className="w-full max-w-md"
              >
                <textarea
                  rows={3}
                  value={letGoText}
                  onChange={e => setLetGoText(e.target.value)}
                  placeholder={isRtl ? 'اینجا بنویس و برای همیشه رهایش کن...' : 'Write here and release it forever...'}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-sky-500 resize-none"
                />
              </motion.div>

              <button
                onClick={handleLetGo}
                disabled={!letGoText.trim() || isDissolving}
                className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Feather size={16} />
                <span>{isDissolving ? (isRtl ? 'در حال رهاسازی در کائنات...' : 'Releasing...') : (isRtl ? 'رها کردن و سپردن به کائنات (+۲۰ XP)' : 'Surrender & Let Go (+20 XP)')}</span>
              </button>

              {dissolveSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                >
                  {isRtl ? '✨ رها شد. ذهن شما اکنون آرام، رها و شفاف است.' : '✨ Released. Your mind is calm, free and crystal clear.'}
                </motion.div>
              )}
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
                    {isRtl ? 'عادات روزانه پرورش بینش و آرامش' : 'Daily Perspective & Calm Habits'}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {isRtl ? `${completedHabits} از ${perspectiveHabits.length} مورد انجام شد` : `${completedHabits} of ${perspectiveHabits.length} completed`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {perspectiveHabits.map(habit => (
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
      <SectionWidgets sectionId="perspective" />
    </div>
  );
}
