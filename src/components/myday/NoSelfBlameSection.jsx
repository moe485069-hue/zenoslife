import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Shield, RotateCcw, Plus, Trash2, CheckCircle2,
  Bookmark, Search, Filter, HelpCircle, ArrowRight, Check, RefreshCw,
  TrendingUp, Calendar, AlertCircle, Edit3, MessageCircle, ChevronDown,
  ChevronUp, Award, BookOpen, Volume2, Smile, Compass, Feather
} from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { db, getToday } from '../../db/database';
import useAppStore from '../../store/appStore';

// ─────────────────────────────────────────────
// COMPASSIONATE INSIGHTS & EXERCISE REPOSITORY
// ─────────────────────────────────────────────
const COMPASSION_QUOTES = [
  {
    fa: '«اشتباه کردن نشانه‌ی نقص شخصیت شما نیست؛ نشانه‌ی این است که شجاعت تجربه کردن داشته‌اید. با خودت مانند صمیمی‌ترین دوستت صحبت کن.»',
    en: '"Making a mistake is not a flaw in your worth; it is proof of your courage to live and learn. Speak to yourself as you would to your dearest friend."',
    authorFa: 'دکتر کریستین نف — پیشگام روان‌شناسی خودشفقت‌ورزی',
    authorEn: 'Dr. Kristin Neff'
  },
  {
    fa: '«سرزنش کردن خود مانند نوشیدن زهر به امید بهبود سلامت است. به جای دادگاه درونی، اتاق فکر خرد و یادگیری برپا کن.»',
    en: '"Self-criticism is like drinking poison hoping for health. Turn your inner courtroom into a sanctuary of wisdom and learning."',
    authorFa: 'حکمت روان‌شناسی شناختی (CBT)',
    authorEn: 'Cognitive Behavioral Wisdom'
  },
  {
    fa: '«ای نسخهٔ نامهٔ الهی که تویی / وی آینهٔ جمال شاهی که تویی / بیرون ز تو نیست هرچه در عالم هست / در خود بطلب هر آنچه خواهی که تویی»',
    en: '"You are the sacred mirror of divine grace; look within yourself for the wisdom to heal and grow."',
    authorFa: 'مولانا جلال‌الدین بلخی',
    authorEn: 'Rumi'
  },
  {
    fa: '«هیچ خطایی آن‌قدر بزرگ نیست که شایسته‌ی تخریب کرامت انسانی تو باشد. درس را بردار و بار سنگین شرم را بر زمین بگذار.»',
    en: '"No mistake is large enough to warrant destroying your human dignity. Extract the lesson, and put down the heavy stone of shame."',
    authorFa: 'کارل راجرز — روان‌شناسی انسان‌گرا',
    authorEn: 'Carl Rogers'
  }
];

const QUICK_MISTAKE_TEMPLATES = [
  {
    labelFa: '🗣️ تندخویی و از کوره در رفتن در گفتگو',
    labelEn: '🗣️ Losing temper in conversation',
    mistakeFa: 'کنترل خشمم را از دست دادم و با تندی صحبت کردم.',
    selfBlameFa: 'چرا اینقدر بی‌جنبه‌ام و همیشه همه چیز را خراب می‌کنم؟',
    reframeFa: 'من خسته و تحت فشار بودم، انسانم و احساسات دارم. این رفتار اشتباه بود اما شخصیت من بد نیست.',
    actionFa: 'دفعه بعد هنگام خشم، دستم را روی سینه می‌گذارم، ۳ نفس عمیق می‌کشم و ۱۰ ثانیه سکوت می‌کنم، سپس آرام موضعم را بیان می‌کنم.',
    category: 'relationships',
    emotion: 'خشم و پشیمانی'
  },
  {
    labelFa: '⏳ به تعویق انداختن کار مهم و اهمال‌کاری',
    labelEn: '⏳ Procrastination on critical task',
    mistakeFa: 'کاری که متعهد شده بودم را تا لحظه آخر به تعویق انداختم.',
    selfBlameFa: 'تو هیچ‌وقت منظم نمیشی، تنبل و بی‌اراده‌ای!',
    reframeFa: 'اهمال‌کاری ناشی از ترس از نقص یا سنگینی حجم کار است، نه بی‌ارادگی. من توانایی مدیریت دارم.',
    actionFa: 'کار بزرگ را به یک گام بسیار کوچک ۵ دقیقه‌ای خرد می‌کنم و تایمر پومودورو را روشن می‌کنم.',
    category: 'work',
    emotion: 'اضطراب و سردرگمی'
  },
  {
    labelFa: '🍔 پرخوری عصبی یا شکستن برنامه تغذیه',
    labelEn: '🍔 Emotional eating / breaking diet',
    mistakeFa: 'شیرینی و فست‌فود اضافه خوردم و برنامه‌ام به هم ریخت.',
    selfBlameFa: 'هیچ نظمی نداری، دوباره زحمات چند روزت به باد رفت!',
    reframeFa: 'یک وعده غذایی تمام روند من را خراب نمی‌کند. بدنم نیاز به آرامش داشت و باید به ریشه اضطرابم نگاه کنم.',
    actionFa: 'یک لیوان بزرگ آب می‌نوشم، خود را می‌بخشم و وعده بعدی را کاملاً سالم و مقوی میل می‌کنم.',
    category: 'health',
    emotion: 'شرم و احساس گناه'
  },
  {
    labelFa: '💸 خرید هیجانی و خرج غیرضروری',
    labelEn: '💸 Impulsive emotional spending',
    mistakeFa: 'وسیله‌ای خریدم که نیازی به آن نداشتم و پولم هدر رفت.',
    selfBlameFa: 'اصلاً عقل اقتصادی نداری و پول نگه داشتن بلد نیستی!',
    reframeFa: 'این یک تجربه یادگیری بود تا محرک‌های هیجانی خرید را بشناسم. ارزش پول با درس گرفتن حفظ می‌شود.',
    actionFa: 'قانون انتظار ۲۴ ساعته را فعال می‌کنم؛ برای هر خرید غیرضروری یک شبانه‌روز فکر می‌کنم.',
    category: 'wealth',
    emotion: 'پشیمانی مالی'
  },
  {
    labelFa: '🤝 ترس از "نه گفتن" و پذیرفتن تعهد اضافه',
    labelEn: '🤝 People pleasing & not saying No',
    mistakeFa: 'درخواستی را که زمان و انرژی‌اش را نداشتم قبول کردم.',
    selfBlameFa: 'چرا همیشه ضعیفی و نمی‌تونی مرز مشخص کنی؟',
    reframeFa: 'میل من به کمک به دیگران ارزشمند است، اما حفظ مرزهای شخصی پیش‌نیاز خدمت سالم است.',
    actionFa: 'با کمال احترام پیام می‌دهم: «بررسی کردم و دیدم متاسفانه الان فرصت کافی برای کیفیت مطلوب این کار را ندارم».',
    category: 'relationships',
    emotion: 'فرسودگی و خشم درونی'
  }
];

const CATEGORIES = [
  { id: 'all', labelFa: '✨ همه', labelEn: 'All' },
  { id: 'relationships', labelFa: '🤝 روابط و گفتگو', labelEn: 'Relationships', icon: '🤝' },
  { id: 'work', labelFa: '💼 کار، هدف و یادگیری', labelEn: 'Work & Growth', icon: '💼' },
  { id: 'health', labelFa: '🍏 سلامت و جسم', labelEn: 'Health & Body', icon: '🍏' },
  { id: 'wealth', labelFa: '💰 مالی و تصمیم‌گیری', labelEn: 'Finances', icon: '💰' },
  { id: 'mind', labelFa: '🧘 احساسات و خلوت درون', labelEn: 'Emotions', icon: '🧘' }
];

export default function NoSelfBlameSection({ isRtl = true }) {
  const { addXP, addCoins } = useAppStore();

  // Navigation & View state
  const [activeSubTab, setActiveSubTab] = useState('form'); // 'form' | 'history' | 'exercises'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [mistake, setMistake] = useState('');
  const [selfBlameThought, setSelfBlameThought] = useState('');
  const [reframedThought, setReframedThought] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('relationships');
  const [selectedEmotion, setSelectedEmotion] = useState('پشیمانی');
  const [lessonLearned, setLessonLearned] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // History & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState('all');
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Breathing Exercise State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); // 'inhale' | 'hold' | 'exhale'
  const [breathCount, setBreathCount] = useState(4);

  // Load logs on mount
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const items = await db.selfBlameLogs.reverse().toArray();
      setLogs(items || []);
    } catch (err) {
      console.warn('Error loading self blame logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Breathing timer
  useEffect(() => {
    let timer = null;
    if (isBreathing) {
      timer = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            setBreathPhase(current => {
              if (current === 'inhale') return 'hold';
              if (current === 'hold') return 'exhale';
              return 'inhale';
            });
            return breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 6 : 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathing, breathPhase]);

  const handleApplyTemplate = (tpl) => {
    setMistake(tpl.mistakeFa);
    setSelfBlameThought(tpl.selfBlameFa);
    setReframedThought(tpl.reframeFa);
    setCorrectiveAction(tpl.actionFa);
    setSelectedCategory(tpl.category);
    setSelectedEmotion(tpl.emotion);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!mistake.trim() || !correctiveAction.trim()) return;

    try {
      setIsSubmitting(true);
      const today = getToday();
      const newEntry = {
        date: today,
        mistake: mistake.trim(),
        selfBlameThought: selfBlameThought.trim() || (isRtl ? 'سرزنش خودکار' : 'Automatic criticism'),
        reframedThought: reframedThought.trim() || (isRtl ? 'پذیرش مشفقانه اشتباه به عنوان درس رشد' : 'Compassionate acceptance'),
        correctiveAction: correctiveAction.trim(),
        category: selectedCategory,
        emotion: selectedEmotion,
        lessonLearned: lessonLearned.trim() || '',
        isApplied: false,
        timestamp: new Date().toISOString()
      };

      await db.selfBlameLogs.add(newEntry);

      // Also create a journal reflection for deeper integration
      await db.journalEntries.add({
        title: isRtl ? `تبدیل اشتباه به رشد: ${mistake.slice(0, 30)}...` : `Growth from mistake: ${mistake.slice(0, 30)}...`,
        content: `❌ اشتباه: ${mistake}\n💬 گفتگوی سرزنشگر: ${selfBlameThought}\n💚 نگاه مشفقانه: ${reframedThought}\n🎯 رفتار درست در آینده: ${correctiveAction}`,
        mood: 'reflective',
        tags: 'self_compassion,growth,no_blame',
        sectionId: 'selfDiscovery',
        date: today,
        timestamp: new Date().toISOString()
      });

      soundEngine.playLevelUp?.();
      haptics.success?.();
      addXP?.(25, isRtl ? 'تبدیل سرزنش خود به رفتار درست' : 'Self-Compassion Reframe');
      addCoins?.(10);

      setSubmitSuccess(true);
      setMistake('');
      setSelfBlameThought('');
      setReframedThought('');
      setCorrectiveAction('');
      setLessonLearned('');
      await loadLogs();

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Error saving self blame log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleApplied = async (logId, currentState) => {
    try {
      await db.selfBlameLogs.update(logId, { isApplied: !currentState });
      soundEngine.playCheckmark?.();
      haptics.success?.();
      if (!currentState) {
        addXP?.(15, isRtl ? 'اجرای رفتار درست در عمل' : 'Correct Action Applied');
        addCoins?.(5);
      }
      await loadLogs();
    } catch (err) {
      console.warn('Error updating log status:', err);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm(isRtl ? 'آیا از حذف این مورد از تاریخچه اطمینان دارید؟' : 'Delete this log?')) return;
    try {
      await db.selfBlameLogs.delete(logId);
      soundEngine.playTap?.();
      haptics.tap?.();
      await loadLogs();
    } catch (err) {
      console.warn('Error deleting log:', err);
    }
  };

  const filteredLogs = logs.filter(item => {
    const matchesCat = historyCategoryFilter === 'all' || item.category === historyCategoryFilter;
    if (!matchesCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (item.mistake || '').toLowerCase().includes(q) ||
        (item.correctiveAction || '').toLowerCase().includes(q) ||
        (item.reframedThought || '').toLowerCase().includes(q) ||
        (item.selfBlameThought || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const appliedCount = logs.filter(l => l.isApplied).length;
  const currentQuote = COMPASSION_QUOTES[quoteIdx % COMPASSION_QUOTES.length];

  return (
    <div className="p-5 sm:p-7 rounded-3xl border-2 border-rose-400/40 glass-card bg-gradient-to-br from-rose-950/25 via-[var(--bg-card)] to-violet-950/25 shadow-2xl space-y-6 text-start relative overflow-hidden">
      
      {/* Background Subtle Glowing Rings */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. HEADER & PHILOSOPHY BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-rose-500/20 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/30 to-violet-600/30 border border-rose-400/50 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(244,63,94,0.3)] shrink-0">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-violet-200">
                {isRtl ? 'سرزنش نکن (اتاق فکر رشد و رفتار درست)' : 'Stop Self-Blame & Compassionate Growth'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/30">
                {isRtl ? 'پناهگاه آرامش' : 'Sanctuary'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed max-w-xl">
              {isRtl
                ? 'به جای کوبیدن و قضاوت خود، اشتباهات را به استراتژی‌های روشن و رفتارهای درست برای آینده تبدیل کن.'
                : 'Transform painful self-criticism into clear wisdom and corrective behavior for tomorrow.'}
            </p>
          </div>
        </div>

        {/* Analytics Snapshot Badges */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-black/30 border border-rose-500/30 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">{isRtl ? 'اشتباهات مهارشده' : 'Reframed'}</span>
            <span className="text-sm font-black text-rose-300 font-mono">{logs.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/30 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">{isRtl ? 'رفتار درست اجراشده' : 'Applied'}</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{appliedCount}</span>
          </div>
        </div>
      </div>

      {/* ── 2. ROTATING COMPASSION QUOTE BANNER ── */}
      <div className="p-4 rounded-2xl bg-black/30 border border-rose-500/25 flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0">🕊️</span>
          <div className="min-w-0">
            <p className="text-xs text-rose-100 font-bold leading-relaxed italic line-clamp-2">
              {isRtl ? currentQuote.fa : currentQuote.en}
            </p>
            <span className="text-[10px] text-rose-300/80 font-medium block mt-0.5">
              — {isRtl ? currentQuote.authorFa : currentQuote.authorEn}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setQuoteIdx(q => q + 1);
            soundEngine.playTap?.();
          }}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors shrink-0"
          title={isRtl ? 'حکمت بعدی' : 'Next quote'}
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* ── 3. SUB-TABS NAVIGATION ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar relative z-10">
        {[
          { id: 'form', labelFa: '✍️ ثبت اشتباه و رفتار درست', labelEn: '✍️ New Reframe', badge: null },
          { id: 'history', labelFa: `📜 تاریخچه و مرور عملکرد (${logs.length})`, labelEn: `📜 History & Archive (${logs.length})`, badge: logs.length },
          { id: 'exercises', labelFa: '🧘 راهکارها و تمرین تنفس رهایی', labelEn: '🧘 Practices & Breathing', badge: null }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSubTab === tab.id
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25 scale-105'
                : 'bg-black/25 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
          >
            <span>{isRtl ? tab.labelFa : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* ── 4. TAB 1: INTERACTIVE FORM (ثبت اشتباه و طراحی رفتار جایگزین) ── */}
      {activeSubTab === 'form' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 relative z-10"
        >
          {/* Quick Preset Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-rose-300/90 flex items-center gap-1.5">
              <span>⚡</span>
              <span>{isRtl ? 'الگوهای آماده برای اشتباهات متداول (لمس برای پر شدن خودکار):' : 'Quick Templates:'}</span>
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {QUICK_MISTAKE_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-3 py-1.5 rounded-xl bg-black/30 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-bold text-slate-200 hover:text-rose-200 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>{isRtl ? tpl.labelFa : tpl.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveLog} className="space-y-4">
            
            {/* Step 1: Mistake */}
            <div className="p-4 rounded-2xl bg-black/30 border border-rose-500/30 space-y-2">
              <label className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px]">۱</span>
                <span>{isRtl ? 'اشتباه یا اتفاقی که بابتش خودت را سرزنش می‌کنی:' : 'What happened / The mistake:'}</span>
              </label>
              <textarea
                rows={2}
                value={mistake}
                onChange={e => setMistake(e.target.value)}
                placeholder={isRtl ? 'مثلاً: در جلسه تند صحبت کردم، یا برنامه‌ریزی امروزم را به تعویق انداختم...' : 'Describe what happened objectively...'}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-400 resize-none leading-relaxed"
                required
              />
            </div>

            {/* Step 2 & 3: Self-Blame vs Compassionate Reframe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Voice of Self-Criticism */}
              <div className="p-4 rounded-2xl bg-black/30 border border-red-500/30 space-y-2">
                <label className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                  <span>🗣️</span>
                  <span>{isRtl ? 'صدای سرزنشگر درونی (چی در ذهنت گفتی؟):' : 'Inner Critic Voice:'}</span>
                </label>
                <textarea
                  rows={2}
                  value={selfBlameThought}
                  onChange={e => setSelfBlameThought(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: "چرا اینقدر بی‌عرضه‌ای؟ همیشه گند می‌زنی!"' : 'e.g., "Why am I so clumsy?"'}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-400 resize-none leading-relaxed"
                />
              </div>

              {/* Compassionate Reframe */}
              <div className="p-4 rounded-2xl bg-black/30 border border-emerald-500/30 space-y-2">
                <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>💚</span>
                  <span>{isRtl ? 'پاسخ مشفقانه و خردمندانه (دوست مهربان):' : 'Self-Compassion Voice:'}</span>
                </label>
                <textarea
                  rows={2}
                  value={reframedThought}
                  onChange={e => setReframedThought(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: من تحت فشار بودم، انسانم و اشتباه کردم. این ارزش من را کم نمی‌کند.' : 'Compassionate, objective understanding...'}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 resize-none leading-relaxed"
                />
              </div>

            </div>

            {/* Step 4: Correct Replacement Action (MOST IMPORTANT) */}
            <div className="p-4 rounded-2xl bg-emerald-950/25 border-2 border-emerald-500/40 space-y-2 shadow-lg">
              <label className="text-xs font-black text-emerald-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-[10px]">🎯</span>
                <span>{isRtl ? 'رفتار درست و جایگزین برای دفعات بعد (اصلاح رفتار در آینده):' : 'Correct Replacement Action for Next Time:'}</span>
              </label>
              <textarea
                rows={2}
                value={correctiveAction}
                onChange={e => setCorrectiveAction(e.target.value)}
                placeholder={isRtl ? 'دقیقاً در موقعیت مشابه بعدی چه کاری انجام می‌دهی؟ (مثلاً: قبل از پاسخ ۱۰ ثانیه سکوت می‌کنم، یا کار را به پومودوروهای ۵ دقیقه‌ای تبدیل می‌کنم)' : 'Exactly what concrete action will you take next time?'}
                className="w-full p-3 rounded-xl bg-black/40 border border-emerald-500/30 text-xs text-emerald-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 resize-none leading-relaxed font-bold"
                required
              />
            </div>

            {/* Category & Emotion Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  {isRtl ? 'حوزه مربوطه:' : 'Category:'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 outline-none focus:border-rose-400"
                >
                  <option value="relationships">🤝 روابط و گفتگو</option>
                  <option value="work">💼 کار، هدف و مطالعه</option>
                  <option value="health">🍏 سلامت و تغذیه</option>
                  <option value="wealth">💰 مالی و خرید</option>
                  <option value="mind">🧘 احساسات و آرامش</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  {isRtl ? 'احساس غالب:' : 'Core Emotion:'}
                </label>
                <input
                  type="text"
                  value={selectedEmotion}
                  onChange={e => setSelectedEmotion(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: پشیمانی، خشم، شرم، اضطراب...' : 'e.g. Guilt, Regret, Anger...'}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400">
                💎 {isRtl ? '+25 XP و +10 سکه برای تبدیل سرزنش به رشد' : '+25 XP for self-compassion'}
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !mistake.trim() || !correctiveAction.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 text-white font-black text-xs shadow-lg hover:brightness-110 active:scale-98 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                {submitSuccess ? <CheckCircle2 size={16} /> : <Feather size={16} />}
                <span>
                  {submitSuccess
                    ? (isRtl ? 'با موفقیت ثبت شد ✔' : 'Saved to Archive ✔')
                    : (isRtl ? 'ثبت و تبدیل به رفتار درست (+25 XP)' : 'Save & Replace Behavior (+25 XP)')}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── 5. TAB 2: HISTORY & ARCHIVE (تاریخچه و مرور عملکرد) ── */}
      {activeSubTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 relative z-10"
        >
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setHistoryCategoryFilter(cat.id);
                    soundEngine.playTap?.();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition-all border ${
                    historyCategoryFilter === cat.id
                      ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                      : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isRtl ? cat.labelFa : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search size={13} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'جستجو در اشتباهات...' : 'Search logs...'}
                className="w-full px-8 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 outline-none focus:border-rose-400 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Logs List */}
          {filteredLogs.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-rose-500/30 bg-black/20 text-center space-y-2">
              <span className="text-3xl block">🌱✨</span>
              <h4 className="text-xs sm:text-sm font-bold text-rose-300">
                {isRtl ? 'هنوز موردی در تاریخچه ثبت نشده است' : 'No logs found'}
              </h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                {isRtl
                  ? 'هر زمان احساس سرزنش یا پشیمانی کردی، به تب ثبت مراجعه کن تا با نگاهی خردمندانه آن را به رفتار درست تبدیل کنی.'
                  : 'Whenever you experience self-criticism, log it to reframe it into clear constructive behavior.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                    item.isApplied
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                      : 'bg-black/35 border-rose-500/25 hover:border-rose-400/40'
                  }`}
                >
                  {/* Top Bar: Date, Emotion & Delete */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                        📅 {item.date}
                      </span>
                      {item.emotion && (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-[10px]">
                          {item.emotion}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleApplied(item.id, item.isApplied)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 border transition-all ${
                          item.isApplied
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-black/30 border-white/15 text-slate-300 hover:border-emerald-400 hover:text-emerald-300'
                        }`}
                      >
                        {item.isApplied ? <Check size={12} /> : null}
                        <span>{item.isApplied ? (isRtl ? 'در عمل اجرا شد ✔' : 'Applied in Life') : (isRtl ? 'علامت به عنوان اجراشده' : 'Mark as Applied')}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteLog(item.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Mistake & Self-Blame Box */}
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                      <span>❌</span>
                      <span>{isRtl ? 'اشتباه رخ‌داده و ندای سرزنشگر:' : 'Incident & Inner Blame:'}</span>
                    </span>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {item.mistake}
                    </p>
                    {item.selfBlameThought && (
                      <p className="text-[11px] text-red-300/80 italic font-mono">
                        «{item.selfBlameThought}»
                      </p>
                    )}
                  </div>

                  {/* Reframe & Correct Action Box */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                    <span className="text-[10px] font-black text-emerald-300 flex items-center gap-1">
                      <span>🎯</span>
                      <span>{isRtl ? 'رفتار درست و اصلاحی در آینده:' : 'Correct Replacement Behavior:'}</span>
                    </span>
                    <p className="text-xs text-emerald-100 font-bold leading-relaxed">
                      {item.correctiveAction}
                    </p>
                    {item.reframedThought && (
                      <p className="text-[11px] text-emerald-300/80 pt-1 border-t border-emerald-500/15">
                        💚 {isRtl ? 'نگاه مشفقانه: ' : 'Reframe: '}{item.reframedThought}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── 6. TAB 3: EXERCISES & BREATHWORK (راهکارها و تمرین تنفس رهایی) ── */}
      {activeSubTab === 'exercises' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 relative z-10"
        >
          {/* Compassion Breathing Studio */}
          <div className="p-6 rounded-3xl bg-black/45 border border-rose-500/30 text-center space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-rose-200">
                {isRtl ? 'تمرین تنفس رهایی از سرزنش (تنظیم سیستم عصبی)' : 'Self-Compassion Breathwork (Reset Cortisol)'}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {isRtl
                  ? 'هنگام سرزنش خود، سطح کورتیزول و ضربان قلب بالا می‌رود. با این الگوی تنفسی (۴ ثانیه دم، ۶ ثانیه بازدم آرام) امواج مغزی خود را آرام کنید.'
                  : 'Calm the sympathetic stress response with slow extended exhales.'}
              </p>
            </div>

            {/* Breathing Circle */}
            <div className="py-3 flex flex-col items-center justify-center">
              <motion.div
                animate={{
                  scale: breathPhase === 'inhale' ? 1.25 : breathPhase === 'hold' ? 1.25 : 0.85,
                  boxShadow: breathPhase === 'inhale' ? '0 0 45px rgba(244,63,94,0.5)' : '0 0 15px rgba(244,63,94,0.15)'
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className="w-32 h-32 rounded-full border-4 border-rose-400 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-violet-950/40 flex flex-col items-center justify-center shadow-xl"
              >
                <span className="text-xs font-black text-rose-200">
                  {breathPhase === 'inhale'
                    ? (isRtl ? 'دم پذیرش 🌸' : 'Inhale Peace')
                    : breathPhase === 'hold'
                    ? (isRtl ? 'نگه‌داشتن ⏳' : 'Hold Presence')
                    : (isRtl ? 'بازدم رهایی 🕊️' : 'Exhale Blame')}
                </span>
                <span className="text-2xl font-black font-mono text-white mt-1">{breathCount}</span>
              </motion.div>
            </div>

            <button
              onClick={() => {
                if (!isBreathing) soundEngine.playMeditationBowl?.();
                setIsBreathing(!isBreathing);
                haptics.tap?.();
              }}
              className={`px-6 py-2.5 rounded-2xl font-black text-xs shadow-lg transition-all ${
                isBreathing
                  ? 'bg-rose-700 text-white'
                  : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110'
              }`}
            >
              {isBreathing ? (isRtl ? 'توقف تمرین' : 'Stop') : (isRtl ? 'شروع تنفس آرامش‌بخش' : 'Start Breathwork')}
            </button>
          </div>

          {/* 3 Core Psychological Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-1.5">
              <span className="text-xl">🪞</span>
              <h4 className="text-xs font-black text-rose-300">
                {isRtl ? '۱. قانون دوست صمیمی' : '1. Compassionate Friend'}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isRtl
                  ? 'هر کلامی که در سرت به خودت می‌گویی را ارزیابی کن: آیا حاضر بودی این کلمات را به بهترین دوستت بگویی؟'
                  : 'Never say to yourself what you would never utter to a dear friend in distress.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-1.5">
              <span className="text-xl">🧩</span>
              <h4 className="text-xs font-black text-rose-300">
                {isRtl ? '۲. تفکیک هویت از رفتار' : '2. Identity vs Behavior'}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isRtl
                  ? '«من اشتباه کردم» یک واقعیت قابل جبران است؛ «من بی‌عرضه‌ام» یک برچسب مخرب و غیرواقعی است.'
                  : 'Behavior can be modified; your inherent human worth is unshakeable.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-1.5">
              <span className="text-xl">🚀</span>
              <h4 className="text-xs font-black text-rose-300">
                {isRtl ? '۳. تمرکز بر گام بعدی' : '3. Focus on Next Step'}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isRtl
                  ? 'گذشته تغییر نمی‌کند، اما ۵ دقیقه آینده کاملاً در دست توست. انرژی‌ات را صرف رفتار جایگزین کن.'
                  : 'The past is fixed, but the next 5 minutes belong entirely to you.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
