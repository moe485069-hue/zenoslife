import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useAppStore from '../store/appStore';
import useTasksStore from '../store/tasksStore';
import useSectionsStore from '../store/sectionsStore';
import XPBar from '../components/ui/XPBar';
import ProgressRing from '../components/ui/ProgressRing';
import jalaali from 'jalaali-js';
import ZenBonsai from '../components/gamification/ZenBonsai';
import QuoteStudioCard from '../components/ui/QuoteStudioCard';
import {
  Flame, Calendar, CheckCircle2, Sparkles, ArrowLeft, ArrowRight, Check,
  Feather, Mountain, Heart, Shield, ShoppingBag, Coins, Bookmark
} from 'lucide-react';

const CALM_QUOTES = [
  {
    textFa: 'آرامش نه در غیاب طوفان‌ها، بلکه در صلح درونی با طوفان‌ها به دست می‌آید.',
    textEn: 'Peace is not the absence of storm, but inner stillness within it.',
    authorFa: 'خرد کهن',
    authorEn: 'Ancient Wisdom'
  },
  {
    textFa: 'ای برادر تو همه اندیشه‌ای، مابقی خود استخوان و ریشه‌ای.',
    textEn: 'You are entirely what you think; the rest is mere bone and fiber.',
    authorFa: 'مولانا',
    authorEn: 'Rumi'
  },
  {
    textFa: 'کنجکاو باش، نه قضاوت‌گر؛ جهان در برابر نگاه آرام تو زیباتر می‌شود.',
    textEn: 'Be curious, not judgmental; the world unfolds in beauty to a peaceful gaze.',
    authorFa: 'والت ویتمن',
    authorEn: 'Walt Whitman'
  },
  {
    textFa: 'آنچه در کنترل توست کردار و آرامش درون توست؛ مابقی را به کائنات بسپار.',
    textEn: 'What lies in your power is your peace; surrender the rest to the cosmos.',
    authorFa: 'مارکوس اورلیوس',
    authorEn: 'Marcus Aurelius'
  }
];

const SECTIONS = [
  // Cluster 1: Body & Vitality
  {
    id: 'health',
    category: 'body',
    path: '/health',
    icon: '🏋️‍♂️',
    color: '#f43f5e',
    labelFa: 'ورزش و استاد تمرینات',
    labelEn: 'Workout & Fitness',
    descFa: 'تمرینات تفکیکی، کالری و عضله',
    descEn: 'Workouts & muscle split'
  },
  {
    id: 'mindfulness',
    category: 'body',
    path: '/mindfulness',
    icon: '🧘',
    color: '#10b981',
    labelFa: 'ذهن‌آگاهی و مراقبه',
    labelEn: 'Mindfulness',
    descFa: 'تنفس، سکون و فرکانس‌ها',
    descEn: 'Breath & inner silence'
  },
  {
    id: 'addiction',
    category: 'body',
    path: '/addiction',
    icon: '🛡️',
    color: '#f43f5e',
    labelFa: 'رهایی از اعتیاد',
    labelEn: 'Addiction Freedom',
    descFa: 'پاکی و مهار وسوسه',
    descEn: 'Sobriety & sovereignty'
  },

  // Cluster 2: Wisdom & Mindset
  {
    id: 'perspective',
    category: 'wisdom',
    path: '/perspective',
    icon: '🔭',
    color: '#38bdf8',
    labelFa: 'دیدگاه و وسعت نظر',
    labelEn: 'Perspective',
    descFa: 'تغییر مقیاس و رهاسازی',
    descEn: 'Higher view & calm'
  },
  {
    id: 'security',
    category: 'wisdom',
    path: '/security',
    icon: '⚡',
    color: '#22c55e',
    labelFa: 'امنیت و نفوذناپذیری',
    labelEn: 'Security & Cyber',
    descFa: 'سپر روانی، فیزیکی و سایبر',
    descEn: 'Psychological & cyber shield'
  },
  {
    id: 'nonJudgment',
    category: 'wisdom',
    path: '/non-judgment',
    icon: '⚖️',
    color: '#0ea5e9',
    labelFa: 'قضاوت نکردن',
    labelEn: 'Non-Judgment',
    descFa: 'مشاهده بدون برچسب',
    descEn: 'Reframing & acceptance'
  },
  {
    id: 'selfDiscovery',
    category: 'wisdom',
    path: '/self-discovery',
    icon: '🪞',
    color: '#a855f7',
    labelFa: 'خودشناسی',
    labelEn: 'Self-Discovery',
    descFa: 'چرخ احساسات و ژورنال',
    descEn: 'Emotions & reflection'
  },
  {
    id: 'learning',
    category: 'wisdom',
    path: '/learning',
    icon: '📚',
    color: '#6366f1',
    labelFa: 'یادگیری روزانه',
    labelEn: 'Learning',
    descFa: 'فلش‌کارت و تمرکز عمیق',
    descEn: 'Flashcards & focus'
  },

  // Cluster 3: Life & Universe
  {
    id: 'wealth',
    category: 'life',
    path: '/wealth',
    icon: '💰',
    color: '#22c55e',
    labelFa: 'درآمد و ثروت',
    labelEn: 'Wealth & Finance',
    descFa: 'بودجه و اهداف مالی',
    descEn: 'Budget & goals'
  },
  {
    id: 'cosmicUnity',
    category: 'life',
    path: '/cosmic-unity',
    icon: '🌌',
    color: '#8b5cf6',
    labelFa: 'وحدت کیهانی',
    labelEn: 'Cosmic Oneness',
    descFa: 'غبار ستارگان و پیوستگی',
    descEn: 'Universal connection'
  },
  {
    id: 'world',
    category: 'life',
    path: '/world',
    icon: '🌍',
    color: '#f97316',
    labelFa: 'ایران و جهان',
    labelEn: 'Iran & World',
    descFa: 'فرهنگ، مفاخر و دانش',
    descEn: 'Culture & scholars'
  },
  {
    id: 'integrity',
    category: 'life',
    path: '/integrity',
    icon: '💎',
    color: '#eab308',
    labelFa: 'درستی و فضیلت',
    labelEn: 'Integrity',
    descFa: 'تعهدات و شکرگزاری',
    descEn: 'Commitments & ethics'
  },
];

const PERSIAN_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const PERSIAN_WEEKDAYS = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'];
const EN_WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Home() {
  const { language, streak, xp, level, coins, learningVault, toggleVaultItem } = useAppStore();
  const { tasks, loadTasks, selectedDate, toggleTask } = useTasksStore();
  const { habits, todayLogs, loadHabits } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'body' | 'wisdom' | 'life'
  const [showBonsai, setShowBonsai] = useState(true);

  useEffect(() => {
    loadTasks(selectedDate);
    loadHabits();
  }, [selectedDate, loadTasks, loadHabits]);

  const hour = new Date().getHours();
  let greeting = 'سلام';
  if (isRtl) {
    if (hour >= 5 && hour < 11) greeting = '☀️ صبح بخیر و آرامش';
    else if (hour >= 11 && hour < 17) greeting = '🌤 روز بخیر و نشاط';
    else if (hour >= 17 && hour < 20) greeting = '🌅 عصر بخیر و آرامش';
    else greeting = '🌙 شب بخیر و سکوت';
  } else {
    if (hour >= 5 && hour < 11) greeting = '☀️ Peaceful Morning';
    else if (hour >= 11 && hour < 17) greeting = '🌤 Calm Afternoon';
    else if (hour >= 17 && hour < 20) greeting = '🌅 Gentle Evening';
    else greeting = '🌙 Serene Night';
  }

  const today = new Date();
  const jDate = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const weekdayIdx = today.getDay();
  const persianDate = `${PERSIAN_WEEKDAYS[(weekdayIdx + 1) % 7]}، ${jDate.jd} ${PERSIAN_MONTHS[jDate.jm - 1]} ${jDate.jy}`;
  const gregorianDate = `${EN_WEEKDAYS[weekdayIdx]}, ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  const quoteIndex = (today.getDate() + today.getMonth() * 2) % CALM_QUOTES.length;
  const todayQuote = CALM_QUOTES[quoteIndex];

  // Completion calculation
  const getSectionPercent = (secId) => {
    const secHabits = habits.filter(h => h.sectionId === secId);
    if (!secHabits.length) return 0;
    const done = secHabits.filter(h => todayLogs[h.id]).length;
    return Math.round((done / secHabits.length) * 100);
  };

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => todayLogs[h.id]).length;
  const overallHabitProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);

  const filteredSections = activeCategory === 'all'
    ? SECTIONS
    : SECTIONS.filter(s => s.category === activeCategory);

  const CATEGORY_TABS = [
    { id: 'all', fa: 'همه حوزه‌ها', en: 'All Domains', icon: '✨' },
    { id: 'body', fa: 'جسم و نشاط', en: 'Body & Vitality', icon: '🌿' },
    { id: 'wisdom', fa: 'خرد و بینش', en: 'Wisdom & Mind', icon: '🧠' },
    { id: 'life', fa: 'زندگی و جهان', en: 'Life & Cosmos', icon: '🌌' },
  ];

  return (
    <div className="page-container flex flex-col gap-5 pb-24 max-w-2xl mx-auto">
      {/* Top Quick Portal Switcher */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-black/20 border border-[var(--border)] text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <Link
            to="/"
            className="px-3 py-1 rounded-xl bg-[var(--bg-secondary)] hover:bg-purple-600 hover:text-white font-bold text-slate-300 transition-all flex items-center gap-1"
          >
            <span>🪐</span>
            <span>{isRtl ? 'صفحه خوشامدگویی' : 'Welcome'}</span>
          </Link>
          <Link
            to="/my-day"
            className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600 hover:text-white font-bold transition-all flex items-center gap-1"
          >
            <span>🌿</span>
            <span>{isRtl ? 'امروز من' : 'My Day'}</span>
          </Link>
          <Link
            to="/stroll"
            className="px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white font-bold transition-all flex items-center gap-1"
          >
            <span>🚶‍♂️</span>
            <span>{isRtl ? 'قدم زدن' : 'Stroll'}</span>
          </Link>
        </div>
        <span className="text-[10px] font-black uppercase text-amber-400 px-2 hidden sm:inline">
          {isRtl ? '⚡ داشبورد پیشرفته' : '⚡ MASTER'}
        </span>
      </div>

      {/* HERO — Greeting & Date (Calm & Spacious) */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">{greeting}</h1>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
            {isRtl ? persianDate : gregorianDate}
          </p>
          {isRtl && (
            <p className="text-[11px] text-[var(--text-secondary)] opacity-60 mt-0.5" style={{ direction: 'ltr', textAlign: 'right' }}>
              {gregorianDate}
            </p>
          )}
        </div>

        {/* Streak + Daily Overall Score */}
        <div className="flex flex-col items-end gap-1.5">
          <div
            className="flex items-center gap-1 px-3 py-1 rounded-2xl text-xs font-black shadow-xs"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}
          >
            <Flame size={14} />
            <span>{streak} {isRtl ? 'روز استمرار' : 'days'}</span>
          </div>
          <ProgressRing percentage={overallHabitProgress} size={48} strokeWidth={4.5} color="var(--accent)">
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-primary)' }}>
              {overallHabitProgress}%
            </span>
          </ProgressRing>
        </div>
      </div>

      {/* Quote of the Day — High-Fidelity Wisdom Studio Card */}
      <QuoteStudioCard />

      {/* XP Bar & Economy Bar */}
      <div>
        <XPBar />
      </div>

      {/* Zen Bonsai Tree of Evolution */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            onClick={() => setShowBonsai(v => !v)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            <span>🌳</span>
            <span>{isRtl ? 'باغ ذهن و بونسای تکامل' : 'Mind Zen Garden & Bonsai'}</span>
            <span className="text-[10px] text-[var(--text-secondary)] font-normal">
              ({showBonsai ? (isRtl ? 'بستن' : 'Hide') : (isRtl ? 'نمایش' : 'Show')})
            </span>
          </button>
          
          <Link
            to="/rewards"
            className="flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:underline"
          >
            <Coins size={12} />
            <span>{isRtl ? 'فروشگاه پاداش‌ها و چالش‌ها' : 'Reward Store & Quests'}</span>
            <ArrowLeft size={11} className={isRtl ? '' : 'rotate-180'} />
          </Link>
        </div>

        <AnimatePresence>
          {showBonsai && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ZenBonsai compact={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Innovation Access: Advanced Capabilities */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Link
            to="/brain-graph"
            className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center gap-2 hover:border-purple-400 transition-all group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🗺️</span>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[var(--text-primary)] block truncate">
                {isRtl ? 'نقشه ذهن' : 'Brain Graph'}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                {isRtl ? 'زتلکاستن' : 'Zettelkasten'}
              </span>
            </div>
          </Link>

          <Link
            to="/mentor"
            className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/25 flex items-center gap-2 hover:border-purple-400 transition-all group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🤖</span>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[var(--text-primary)] block truncate">
                {isRtl ? 'مربی هوشمند' : 'AI Mentor'}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                {isRtl ? 'دستیار رواقی شما' : 'Stoic Assistant'}
              </span>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/25 flex items-center gap-2 hover:border-blue-400 transition-all group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[var(--text-primary)] block truncate">
                {isRtl ? 'آنالیز پیشرفته' : 'Analytics'}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                {isRtl ? 'هیت‌مپ و انرژی' : 'Heatmap & Energy'}
              </span>
            </div>
          </Link>

          <Link
            to="/time-capsule"
            className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/25 flex items-center gap-2 hover:border-indigo-400 transition-all group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">⏳</span>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[var(--text-primary)] block truncate">
                {isRtl ? 'کپسول زمان' : 'Time Capsule'}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                {isRtl ? 'پیام به آینده' : 'Future Letter'}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Section Categories — Filter Tabs for Zen Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-header mb-0">
            <span>🧭</span>
            <span>{isRtl ? 'قلمروهای رشد و زندگی' : 'Life Domains'}</span>
          </h2>
          <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
            {completedHabits}/{totalHabits} {isRtl ? 'عادت امروز' : 'habits done'}
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3">
          {CATEGORY_TABS.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-[var(--accent)] text-white shadow-xs scale-102'
                  : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{isRtl ? cat.fa : cat.en}</span>
            </button>
          ))}
        </div>

        {/* Clean, Non-Crowded Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredSections.map((section) => {
            const pct = getSectionPercent(section.id);
            return (
              <Link key={section.id} to={section.path}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card card-hover p-3.5 rounded-2xl flex flex-col items-center gap-2 cursor-pointer h-full justify-between"
                  style={{ borderTop: `3px solid ${section.color}` }}
                >
                  <div className="text-2xl mt-0.5">{section.icon}</div>
                  <div className="text-center min-w-0">
                    <span className="font-extrabold text-xs block truncate text-[var(--text-primary)]">
                      {isRtl ? section.labelFa : section.labelEn}
                    </span>
                    <span className="text-[9.5px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {isRtl ? section.descFa : section.descEn}
                    </span>
                  </div>
                  <ProgressRing
                    percentage={pct}
                    size={32}
                    strokeWidth={3.5}
                    color={section.color}
                  >
                    <span style={{ fontSize: 7.5, fontWeight: 800, color: 'var(--text-primary)' }}>{pct}%</span>
                  </ProgressRing>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Today's Tasks — Clean & Light */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="section-header mb-0">
            <CheckCircle2 size={16} className="text-[var(--accent)]" />
            <span>{isRtl ? 'برنامه‌های امروز' : "Today's Agenda"}</span>
          </h2>
          <Link to="/calendar" className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1">
            <span>{isRtl ? 'تقویم کامل' : 'Full Calendar'}</span>
            {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
          </Link>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="glass-card p-4 rounded-2xl text-center text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <span>🎉</span>
            <span>{isRtl ? 'همه کارهای امروز با آرامش انجام شدند.' : 'All tasks completed in peace.'}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingTasks.map(task => (
              <div
                key={task.id}
                className="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 card-hover"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="w-5 h-5 rounded-lg border-2 border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-center text-transparent hover:text-[var(--accent)] transition-colors flex-shrink-0"
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>
                  <span className="text-xs font-medium text-[var(--text-primary)] truncate">{task.title}</span>
                </div>
                {task.dueTime && (
                  <span className="text-[10.5px] px-2 py-0.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-mono flex-shrink-0">
                    {task.dueTime}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
