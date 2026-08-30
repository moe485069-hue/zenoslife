import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Shield, RotateCcw, Plus, Trash2, CheckCircle2,
  Bookmark, Search, Filter, HelpCircle, ArrowRight, Check, RefreshCw,
  TrendingUp, Calendar, AlertCircle, Edit3, MessageCircle, ChevronDown,
  ChevronUp, Award, BookOpen, Volume2, VolumeX, Eye, EyeOff, Play,
  Pause, Zap, Target, Key, Flame, Compass, Mic, Radio, Waves
} from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { db, getToday } from '../../db/database';
import useAppStore from '../../store/appStore';
import PersonalVoiceSubliminalStudio from './PersonalVoiceSubliminalStudio';

// ─────────────────────────────────────────────
// PRESET SUBCONSCIOUS BELIEFS & SHADOW LIBRARY
// ─────────────────────────────────────────────
const SUBCONSCIOUS_PRESETS = [
  {
    category: 'fears',
    categoryFa: '😨 ترس‌های ناخودآگاه',
    titleFa: 'ترس از طرد شدن و قضاوت دیگران',
    limitingFa: 'اگر خودم واقعی‌ام را نشان دهم، طرد می‌شوم و کسی مرا دوست نخواهد داشت.',
    rootFa: 'پیام‌های کودکی مبنی بر اینکه فقط در صورت کامل و بی‌نقص بودن پذیرفته می‌شوی.',
    shadowFa: 'مهرطلبی افراطی و ناتوانی در نه گفتن.',
    empoweringFa: 'من در کمال اصالت، انسان ارزشمند، دوست‌داشتنی و مستقلی هستم و پذیرش دیگران تعیین‌کننده ارزش من نیست.',
    subliminals: [
      'من خودم را با تمام وجود می‌پذیرم و دوست دارم.',
      'اصالت من بالاترین قدرت و جذابیت من است.',
      'من در امنیت کامل و آرامش درونی زندگی می‌کنم.'
    ]
  },
  {
    category: 'wealth',
    categoryFa: '💰 ثروت و پول',
    titleFa: 'باور ناخودآگاه کمبود و گناهکار بودن ثروت',
    limitingFa: 'پول به سختی به دست می‌آید و آدم‌های پولدار از راه‌های نادرست ثروتمند شده‌اند.',
    rootFa: 'شنیدن بحث‌های دائمی والدین بر سر کمبود پول و تماشای کار طاقت‌فرسا بدون نتیجه.',
    shadowFa: 'ترس از خرج کردن برای ارتقای خود و خرابکاری مالی ناخودآگاه وقتی پولی وارد حساب می‌شود.',
    empoweringFa: 'جهان سرشار از فراوانی بی‌پایان است و پول ابزاری الهی برای خدمت، خلق ارزش و آزادی من است.',
    subliminals: [
      'من شایسته دریافت و مدیریت ثروت پاک و نامحدود هستم.',
      'جریان برکت و پول با آرامش به زندگی من سرازیر می‌شود.',
      'با ثروتمند شدنم جهان به جای بهتری برای همگان تبدیل می‌شود.'
    ]
  },
  {
    category: 'fears',
    categoryFa: '😨 ترس‌های ناخودآگاه',
    titleFa: 'ترس عمیق از شکست و کامل‌گرایی فلج‌کننده',
    limitingFa: 'اگر اشتباه کنم یا در پروژه‌ای شکست بخورم، بی‌ارزش و بی‌آبرو می‌شوم.',
    rootFa: 'سرزنش شدید دوران مدرسه یا تنبیه شدن هنگام اشتباهات کوچک.',
    shadowFa: 'اهمال‌کاری مداوم به بهانه آماده نبودن شرایط ایده‌آل.',
    empoweringFa: 'شکست وجود ندارد، فقط بازخورد و یادگیری است. هر اقدام من پله‌ای به سوی تسلط و پختگی است.',
    subliminals: [
      'من شجاعت اقدام و یادگیری پیوسته را دارم.',
      'هر تجربه مرا خردمندتر و قوی‌تر می‌سازد.',
      'من آزادم که تجربه کنم و رشد کنم.'
    ]
  },
  {
    category: 'worth',
    categoryFa: '🪞 خودارزشمندی و هویت',
    titleFa: 'سندروم ایمپاستر و حس کافی نبودن',
    limitingFa: 'من به اندازه کافی خوب نیستم و هر موفقیتی داشتم فقط شانس بوده است.',
    rootFa: 'مقایسه مداوم با هم‌سن‌وسال‌ها در محیط خانواده.',
    shadowFa: 'کوچک شمردن دستاوردها و کار کردن بیش از حد تا مرز فرسودگی برای اثبات خود.',
    empoweringFa: 'من لایق و شایسته تمام موهبت‌ها و پیروزی‌هایم هستم و در هر لحظه کمال رشد خود را زندگی می‌کنم.',
    subliminals: [
      'من در همین لحظه کافی، لایق و توانمندم.',
      'حضور من در این جهان هدفمند و ارزشمند است.',
      'من به نبوغ درونی و دانایی خود اعتماد دارم.'
    ]
  },
  {
    category: 'judgments',
    categoryFa: '⚖️ قضاوت‌های ناخودآگاه',
    titleFa: 'نیاز ناخودآگاه به کنترل همه‌چیز و بی‌اعتمادی به جریان زندگی',
    limitingFa: 'اگر همه‌چیز را سفت و سخت کنترل نکنم، اوضاع فاجعه‌بار و از دست رفته می‌شود.',
    rootFa: 'تجربه بی‌ثباتی ناگهانی یا غیرقابل‌پیش‌بینی بودن محیط در گذشته.',
    shadowFa: 'اضطراب مزمن و سخت‌گیری فرساینده نسبت به نزدیکان و همکاران.',
    empoweringFa: 'من با تمام توان وظیفه‌ام را انجام می‌دهم و با خیالی آسوده به هوشمندی جهان و خدای مهربان توکل می‌کنم.',
    subliminals: [
      'من در امن‌ترین دستان هستی قرار دارم.',
      'کنترل وسواسی را رها می‌کنم و به جریان خیر اعتماد دارم.',
      'آرامش عمیق در قلب و روان من جاری است.'
    ]
  }
];

const SUBCONSCIOUS_CATEGORIES = [
  { id: 'all', labelFa: '✨ همه باورها', labelEn: 'All' },
  { id: 'fears', labelFa: '😨 ترس‌های ناخودآگاه', labelEn: 'Fears' },
  { id: 'wealth', labelFa: '💰 ثروت و فراوانی', labelEn: 'Wealth' },
  { id: 'worth', labelFa: '🪞 ارزشمندی و هویت', labelEn: 'Self-Worth' },
  { id: 'judgments', labelFa: '⚖️ قضاوت‌ها و سایه‌ها', labelEn: 'Judgments' },
  { id: 'relationships', labelFa: '🤝 روابط و عشق', labelEn: 'Relationships' }
];

export default function SubconsciousBeliefsSection({ isRtl = true }) {
  const { addXP, addCoins } = useAppStore();

  // Navigation State
  const [activeTab, setActiveTab] = useState('reprogram'); // 'reprogram' | 'studio' | 'history'
  const [beliefs, setBeliefs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [limitingBelief, setLimitingBelief] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [shadowType, setShadowType] = useState('fears');
  const [empoweringBelief, setEmpoweringBelief] = useState('');
  const [subliminalsText, setSubliminalsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Subliminal Repetition Studio State
  const [activeBeliefForStudio, setActiveBeliefForStudio] = useState(null);
  const [repetitionCount, setRepetitionCount] = useState(0);
  const [targetReps, setTargetReps] = useState(21);
  const [isThetaSoundOn, setIsThetaSoundOn] = useState(false);
  const [subliminalIntervalId, setSubliminalIntervalId] = useState(null);
  const [currentSubliminalIdx, setCurrentSubliminalIdx] = useState(0);
  const [isAutoLoopActive, setIsAutoLoopActive] = useState(false);

  // History Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadBeliefs();
  }, []);

  const loadBeliefs = async () => {
    try {
      setLoading(true);
      const items = await db.subconsciousBeliefs.reverse().toArray();
      setBeliefs(items || []);
      if (items && items.length > 0 && !activeBeliefForStudio) {
        setActiveBeliefForStudio(items[0]);
      }
    } catch (err) {
      console.warn('Error loading subconscious beliefs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setLimitingBelief(preset.limitingFa);
    setRootCause(preset.rootFa);
    setShadowType(preset.category);
    setEmpoweringBelief(preset.empoweringFa);
    setSubliminalsText(preset.subliminals.join('\n'));
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleSaveBelief = async (e) => {
    e.preventDefault();
    if (!limitingBelief.trim() || !empoweringBelief.trim()) return;

    try {
      setIsSubmitting(true);
      const today = getToday();
      const subs = subliminalsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const newEntry = {
        date: today,
        limitingBelief: limitingBelief.trim(),
        rootCause: rootCause.trim() || (isRtl ? 'باور شکل‌گرفته از گذشته' : 'Past environmental conditioning'),
        shadowType: shadowType,
        empoweringBelief: empoweringBelief.trim(),
        subliminalAffirmations: subs.length > 0 ? subs : [empoweringBelief.trim()],
        repetitionsCount: 0,
        daysPracticed: 1,
        isIntegrated: false,
        category: shadowType,
        categoryFa: SUBCONSCIOUS_CATEGORIES.find(c => c.id === shadowType)?.labelFa || 'باور ناخودآگاه',
        timestamp: new Date().toISOString()
      };

      const id = await db.subconsciousBeliefs.add(newEntry);
      newEntry.id = id;

      soundEngine.playLevelUp?.();
      haptics.success?.();
      addXP?.(35, isRtl ? 'ثبت و بازبرنامه‌ریزی باور ناخودآگاه' : 'Subconscious Belief Reprogrammed');
      addCoins?.(15);

      setSubmitSuccess(true);
      setActiveBeliefForStudio(newEntry);
      setLimitingBelief('');
      setRootCause('');
      setEmpoweringBelief('');
      setSubliminalsText('');
      await loadBeliefs();

      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('studio');
      }, 1500);
    } catch (err) {
      console.error('Error saving subconscious belief:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subliminal Repetition increment
  const handleCountRepetition = async () => {
    if (!activeBeliefForStudio) return;

    const nextCount = repetitionCount + 1;
    setRepetitionCount(nextCount);
    soundEngine.playSubliminalTone?.();
    haptics.tap?.();

    // Advance subliminal affirmation
    const affs = activeBeliefForStudio.subliminalAffirmations || [activeBeliefForStudio.empoweringBelief];
    setCurrentSubliminalIdx((currentSubliminalIdx + 1) % affs.length);

    // Save progress to DB every 5 reps
    if (nextCount % 5 === 0 && activeBeliefForStudio.id) {
      try {
        await db.subconsciousBeliefs.update(activeBeliefForStudio.id, {
          repetitionsCount: (activeBeliefForStudio.repetitionsCount || 0) + 5
        });
        addXP?.(10, isRtl ? '۵ تکرار سابلیمینال ناخودآگاه' : '5 Subliminal Reps');
      } catch (_) {}
    }

    if (nextCount === targetReps) {
      soundEngine.playDivineChime?.();
      haptics.success?.();
      addXP?.(50, isRtl ? 'اتمام یک جلسه کامل بازبرنامه‌ریزی ناخودآگاه' : 'Subconscious Session Complete');
      addCoins?.(20);
    }
  };

  // Toggle Theta Brainwave Pulse
  const handleToggleTheta = () => {
    if (!isThetaSoundOn) {
      soundEngine.playThetaPulse?.();
      setIsThetaSoundOn(true);
      haptics.tap?.();
    } else {
      setIsThetaSoundOn(false);
      haptics.tap?.();
    }
  };

  // Auto Subliminal Loop
  useEffect(() => {
    let interval = null;
    if (isAutoLoopActive && activeBeliefForStudio) {
      interval = setInterval(() => {
        handleCountRepetition();
        if (Math.random() > 0.6) {
          soundEngine.playThetaPulse?.();
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoLoopActive, activeBeliefForStudio, repetitionCount, currentSubliminalIdx]);

  const handleToggleIntegrated = async (beliefId, currentState) => {
    try {
      await db.subconsciousBeliefs.update(beliefId, { isIntegrated: !currentState });
      soundEngine.playDivineChime?.();
      haptics.success?.();
      if (!currentState) {
        addXP?.(50, isRtl ? 'تثبیت باور جدید در ضمیر ناخودآگاه 🌟' : 'Belief Integrated into Subconscious');
        addCoins?.(25);
      }
      await loadBeliefs();
    } catch (err) {
      console.warn('Error updating integration status:', err);
    }
  };

  const handleSaveVoiceForBelief = async (beliefId, voiceAudioUrl) => {
    try {
      await db.subconsciousBeliefs.update(beliefId, { voiceAudioUrl });
      await loadBeliefs();
      if (activeBeliefForStudio && activeBeliefForStudio.id === beliefId) {
        setActiveBeliefForStudio(prev => ({ ...prev, voiceAudioUrl }));
      }
    } catch (err) {
      console.warn('Error saving voice audio for belief:', err);
    }
  };

  const handleDeleteBelief = async (beliefId) => {
    if (!window.confirm(isRtl ? 'آیا از حذف این باور اطمینان دارید؟' : 'Delete this subconscious entry?')) return;
    try {
      await db.subconsciousBeliefs.delete(beliefId);
      soundEngine.playTap?.();
      haptics.tap?.();
      await loadBeliefs();
    } catch (err) {
      console.warn('Error deleting belief:', err);
    }
  };

  const filteredBeliefs = beliefs.filter(item => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    if (!matchesCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (item.limitingBelief || '').toLowerCase().includes(q) ||
        (item.empoweringBelief || '').toLowerCase().includes(q) ||
        (item.rootCause || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const integratedCount = beliefs.filter(b => b.isIntegrated).length;
  const totalRepsAcross = beliefs.reduce((acc, b) => acc + (b.repetitionsCount || 0), 0) + repetitionCount;

  return (
    <div className="p-5 sm:p-7 rounded-3xl border-2 border-indigo-400/40 glass-card bg-gradient-to-br from-indigo-950/40 via-[var(--bg-card)] to-cyan-950/25 shadow-2xl space-y-6 text-start relative overflow-hidden">
      
      {/* Mystic Subconscious Neural Aura */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. HEADER & SUBCONSCIOUS METRICS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 border border-indigo-400/50 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0">
            🧠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-indigo-200 to-purple-200">
                {isRtl ? 'شناخت و بازنویسی باورهای ناخودآگاه (متد سابلیمینال و امواج تتا)' : 'Subconscious Belief Reprogramming Studio'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-500/30">
                {isRtl ? 'ضمیر پنهان' : 'Theta Mind'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed max-w-xl">
              {isRtl
                ? 'کشف ترس‌ها و قضاوت‌های پنهان، شکستن الگوهای کهنه و تثبیت باورهای قدرتمندکننده با تکرار سابلیمینال، ضبط صدای خود و فرکانس‌های مغزی.'
                : 'Uncover shadow fears & root biases, reprogram your inner core with theta frequency loops, personal voice and subliminals.'}
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-black/35 border border-indigo-500/30 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">{isRtl ? 'باورهای شناسایی‌شده' : 'Beliefs'}</span>
            <span className="text-sm font-black text-indigo-300 font-mono">{beliefs.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/35 border border-cyan-500/30 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">{isRtl ? 'تکرار سابلیمینال' : 'Total Reps'}</span>
            <span className="text-sm font-black text-cyan-300 font-mono">{totalRepsAcross}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/35 border border-amber-500/30 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">{isRtl ? 'تثبیت‌شده 🌟' : 'Integrated'}</span>
            <span className="text-sm font-black text-amber-300 font-mono">{integratedCount}</span>
          </div>
        </div>
      </div>

      {/* ── 2. SUB-TABS NAVIGATION ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar relative z-10">
        {[
          { id: 'reprogram', labelFa: '🧬 مهندسی و کشف باور ناخودآگاه', labelEn: '🧬 Belief Architect', icon: '🧬' },
          { id: 'voiceStudio', labelFa: '🎙️ استودیوی صدای خود (Personal Voice)', labelEn: '🎙️ Voice Subliminal', icon: '🎙️' },
          { id: 'studio', labelFa: '🎧 استودیوی سابلیمینال و امواج تتا', labelEn: '🎧 Subliminal Theta Studio', icon: '🎧' },
          { id: 'history', labelFa: `📜 تاریخچه و گنجینه باورها (${beliefs.length})`, labelEn: `📜 Belief Archive (${beliefs.length})`, icon: '📜' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              soundEngine.playTap?.();
              haptics.tap?.();
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                : 'bg-black/25 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
          >
            <span>{isRtl ? tab.labelFa : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* ── 3. TAB 1: BELIEF ARCHITECT & DISCOVERY (کشف و بازنویسی باور) ── */}
      {activeTab === 'reprogram' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 relative z-10"
        >
          {/* Preset Discovery Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-cyan-300/90 flex items-center gap-1.5">
              <span>🔮</span>
              <span>{isRtl ? 'بانک الگوهای آماده برای ترس‌ها و باورهای ناخودآگاه (کلیک برای پر شدن فرم):' : 'Shadow Exploration Templates:'}</span>
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {SUBCONSCIOUS_PRESETS.map((pst, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(pst)}
                  className="px-3 py-1.5 rounded-xl bg-black/35 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] font-bold text-slate-200 hover:text-cyan-200 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>{pst.titleFa}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveBelief} className="space-y-4">
            
            {/* Step 1: Limiting Belief & Subconscious Fear */}
            <div className="p-4 rounded-2xl bg-black/35 border border-rose-500/30 space-y-2">
              <label className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px]">۱</span>
                <span>{isRtl ? 'باور محدودکننده، ترس ناخودآگاه یا قضاوت پنهان چیست؟' : 'Limiting Subconscious Belief or Hidden Fear:'}</span>
              </label>
              <textarea
                rows={2}
                value={limitingBelief}
                onChange={e => setLimitingBelief(e.target.value)}
                placeholder={isRtl ? 'مثلاً: اگر ثروتمند شوم تنها می‌شوم، یا من شایسته عشق و احترام کامل نیستم...' : 'e.g. If I succeed, I will be rejected...'}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-400 resize-none leading-relaxed"
                required
              />
            </div>

            {/* Step 2: Root Cause & Past Conditioning */}
            <div className="p-4 rounded-2xl bg-black/35 border border-purple-500/30 space-y-2">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">۲</span>
                <span>{isRtl ? 'ریشه در گذشته یا پیام پنهانی که از محیط / والدین گرفتی:' : 'Root Cause & Childhood Conditioning:'}</span>
              </label>
              <input
                type="text"
                value={rootCause}
                onChange={e => setRootCause(e.target.value)}
                placeholder={isRtl ? 'مثلاً: دیدن اضطراب مالی همیشگی در خانواده، یا سرزنش شدن در دوران کودکی...' : 'e.g. Observed constant anxiety about money in childhood...'}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Step 3: New Empowering Core Belief (MASTER CORE) */}
            <div className="p-4 rounded-2xl bg-cyan-950/25 border-2 border-cyan-500/40 space-y-2 shadow-lg">
              <label className="text-xs font-black text-cyan-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/30 flex items-center justify-center text-[10px]">۳</span>
                <span>{isRtl ? 'باور توانمندساز بنیادین جدید (جایگزین قطعی در ضمیر ناخودآگاه):' : 'New Empowering Core Belief (Root Replacement):'}</span>
              </label>
              <textarea
                rows={2}
                value={empoweringBelief}
                onChange={e => setEmpoweringBelief(e.target.value)}
                placeholder={isRtl ? 'باوری مثبت، در زمان حال و سرشار از یقین بنویس (مثلاً: من با آرامش و لیاقت تمام موهبت‌ها و ثروت پاک را جذب و مدیریت می‌کنم).' : 'Present tense, positive, unshakeable conviction...'}
                className="w-full p-3 rounded-xl bg-black/40 border border-cyan-500/30 text-xs text-cyan-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed font-bold"
                required
              />
            </div>

            {/* Step 4: Subliminal Affirmation Seeds */}
            <div className="p-4 rounded-2xl bg-black/35 border border-indigo-500/30 space-y-2">
              <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">۴</span>
                <span>{isRtl ? 'جملات تأکیدی سابلیمینال (هر خط یک عبارت کوتاه برای تکرار در فرکانس تتا):' : 'Subliminal Affirmation Seeds (One per line):'}</span>
              </label>
              <textarea
                rows={3}
                value={subliminalsText}
                onChange={e => setSubliminalsText(e.target.value)}
                placeholder={isRtl ? 'من در امنیت و آرامش هستم.\nمن لایق بهترین‌ها هستم.\nجریان برکت همواره به سوی من روان است.' : 'Short, rhythmic, emotional affirmations...'}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 resize-none leading-relaxed font-mono"
              />
            </div>

            {/* Category Selector */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex-1">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {isRtl ? 'حوزه باور ناخودآگاه:' : 'Category:'}
                </label>
                <select
                  value={shadowType}
                  onChange={e => setShadowType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 outline-none focus:border-cyan-400"
                >
                  <option value="fears">😨 ترس‌های ناخودآگاه</option>
                  <option value="wealth">💰 ثروت و فراوانی</option>
                  <option value="worth">🪞 ارزشمندی و هویت</option>
                  <option value="judgments">⚖️ قضاوت‌ها و سایه‌ها</option>
                  <option value="relationships">🤝 روابط و عشق</option>
                </select>
              </div>

              <div className="self-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !limitingBelief.trim() || !empoweringBelief.trim()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-black text-xs shadow-lg hover:brightness-110 active:scale-98 disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  {submitSuccess ? <CheckCircle2 size={16} /> : <Zap size={16} />}
                  <span>
                    {submitSuccess
                      ? (isRtl ? 'باور ثبت شد! ورود به استودیو...' : 'Saved! Launching Studio...')
                      : (isRtl ? 'ثبت و شروع تمرین سابلیمینال (+35 XP)' : 'Save & Begin Subliminal (+35 XP)')}
                  </span>
                </button>
              </div>
            </div>

          </form>
        </motion.div>
      )}

      {/* ── 3.5. TAB 2: PERSONAL VOICE SUBLIMINAL STUDIO (استودیوی ضبط صدای خود) ── */}
      {activeTab === 'voiceStudio' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 relative z-10"
        >
          {/* Belief Selector if multiple beliefs exist */}
          {beliefs.length > 0 && (
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
                {isRtl ? 'انتخاب باور برای خواندن و میکس با صدای خود:' : 'Select Belief for Voice Subliminal:'}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {beliefs.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBeliefForStudio(b);
                      soundEngine.playTap?.();
                      haptics.tap?.();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap border transition-all ${
                      activeBeliefForStudio?.id === b.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                        : 'bg-black/30 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {b.limitingBelief.length > 22 ? b.limitingBelief.slice(0, 22) + '...' : b.limitingBelief}
                  </button>
                ))}
              </div>
            </div>
          )}

          <PersonalVoiceSubliminalStudio
            activeBelief={activeBeliefForStudio || beliefs[0]}
            onSaveVoiceForBelief={handleSaveVoiceForBelief}
            isRtl={isRtl}
          />
        </motion.div>
      )}

      {/* ── 4. TAB 3: SUBLIMINAL THETA REPETITION STUDIO (استودیوی تکرار سابلیمینال) ── */}
      {activeTab === 'studio' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 relative z-10"
        >
          {/* Active Belief Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/40 border border-cyan-500/30">
            <div>
              <span className="text-[10px] text-cyan-300 font-bold block">{isRtl ? 'باور انتخابی برای بازنویسی ناخودآگاه:' : 'Current Focus Belief:'}</span>
              <h3 className="text-xs sm:text-sm font-black text-white mt-0.5 line-clamp-1">
                {activeBeliefForStudio ? activeBeliefForStudio.empoweringBelief : (isRtl ? 'باوری انتخاب نشده است' : 'No belief selected')}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('voiceStudio');
                  soundEngine.playTap?.();
                  haptics.tap?.();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <Mic size={14} />
                <span>{isRtl ? 'استودیوی صدای خود 🎙️' : 'Voice Studio 🎙️'}</span>
              </button>

              {beliefs.length > 1 && (
                <select
                  value={activeBeliefForStudio?.id || ''}
                  onChange={e => {
                    const b = beliefs.find(x => x.id === parseInt(e.target.value, 10));
                    if (b) setActiveBeliefForStudio(b);
                  }}
                  className="p-2 rounded-xl bg-black/50 border border-white/15 text-xs text-slate-200 outline-none focus:border-cyan-400"
                >
                  {beliefs.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.limitingBelief.length > 25 ? b.limitingBelief.slice(0, 25) + '...' : b.limitingBelief}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Theta Brainwave Visualizer & Subliminal Display */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-indigo-950/60 via-black/80 to-cyan-950/40 border border-cyan-500/40 text-center space-y-6 relative overflow-hidden shadow-2xl">
            
            {/* Ambient Pulsing Aura */}
            <motion.div
              animate={{
                scale: isAutoLoopActive ? [1, 1.15, 1] : [1, 1.05, 1],
                opacity: isAutoLoopActive ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-cyan-500/20 to-purple-600/20 blur-3xl pointer-events-none"
            />

            {/* Repetition Counter Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold shadow-inner">
              <span>⚡ {isRtl ? 'شمارش تکرار ذهنی:' : 'Subliminal Reps:'}</span>
              <span className="text-sm text-white font-black">{repetitionCount}</span>
              <span className="text-slate-400">/ {targetReps}</span>
            </div>

            {/* Dynamic Affirmation Text */}
            <div className="min-h-[120px] flex items-center justify-center px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSubliminalIdx + (activeBeliefForStudio?.id || 0)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <p className="text-base sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-indigo-100 leading-relaxed drop-shadow-md">
                    {activeBeliefForStudio
                      ? (activeBeliefForStudio.subliminalAffirmations?.[currentSubliminalIdx] || activeBeliefForStudio.empoweringBelief)
                      : (isRtl ? 'باوری در تب کشف باور ایجاد کنید تا در اینجا تکرار شود.' : 'Create a belief to begin repetition.')}
                  </p>
                  {activeBeliefForStudio?.limitingBelief && (
                    <p className="text-[11px] text-slate-400 italic">
                      {isRtl ? '🚫 پاکسازی باور کهنه: ' : 'Clearing: '}«{activeBeliefForStudio.limitingBelief}»
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Interaction Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              
              {/* Manual Tap Repetition Button */}
              <button
                onClick={handleCountRepetition}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles size={18} />
                <span>{isRtl ? 'تکرار و تثبیت در ناخودآگاه 💫' : 'Imprint on Subconscious 💫'}</span>
              </button>

              {/* Auto Loop Toggle */}
              <button
                onClick={() => {
                  setIsAutoLoopActive(!isAutoLoopActive);
                  soundEngine.playTap?.();
                  haptics.tap?.();
                }}
                className={`px-4 py-4 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  isAutoLoopActive
                    ? 'bg-amber-500 text-black border-amber-400 font-black shadow-lg shadow-amber-500/20'
                    : 'bg-black/50 border-white/15 text-slate-300 hover:border-cyan-400'
                }`}
              >
                {isAutoLoopActive ? <Pause size={16} /> : <Play size={16} />}
                <span>{isAutoLoopActive ? (isRtl ? 'توقف چرخش خودکار' : 'Stop Auto-Loop') : (isRtl ? 'تکرار خودکار با ریتم آرام' : 'Auto Subliminal Loop')}</span>
              </button>

              {/* Theta Wave Sound Button */}
              <button
                onClick={handleToggleTheta}
                className={`p-4 rounded-2xl border text-xs font-bold transition-all ${
                  isThetaSoundOn
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                    : 'bg-black/50 border-white/15 text-slate-400 hover:text-white'
                }`}
                title={isRtl ? 'پخش موج مغزی تتا (۴۳۲Hz / ۶Hz)' : 'Play Theta Brainwave (432Hz)'}
              >
                {isThetaSoundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 max-w-md mx-auto pt-2">
              💡 {isRtl ? 'علم انعطاف‌پذیری عصبی: تکرار روزانه جملات در حالت آرامش ذهنی (امواج تتا) مسیرهای سیناپسی جدیدی در ناخودآگاه خلق می‌کند.' : 'Neuroplasticity: Daily repetition in relaxed theta states creates permanent synaptic pathways.'}
            </p>

          </div>
        </motion.div>
      )}

      {/* ── 5. TAB 3: BELIEF ARCHIVE & HISTORY (تاریخچه و گنجینه باورها) ── */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 relative z-10"
        >
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-1">
              {SUBCONSCIOUS_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    soundEngine.playTap?.();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition-all border ${
                    categoryFilter === cat.id
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm'
                      : 'bg-black/35 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isRtl ? cat.labelFa : cat.labelEn}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-48">
              <Search size={13} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'جستجو در باورها...' : 'Search beliefs...'}
                className="w-full px-8 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 outline-none focus:border-cyan-400 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Beliefs List */}
          {filteredBeliefs.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-indigo-500/30 bg-black/20 text-center space-y-2">
              <span className="text-3xl block">🧬✨</span>
              <h4 className="text-xs sm:text-sm font-bold text-cyan-300">
                {isRtl ? 'هنوز باوری در این بخش ثبت نشده است' : 'No beliefs found'}
              </h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                {isRtl
                  ? 'از تب «مهندسی و کشف باور» اولین باور یا ترس ناخودآگاه خود را شناسایی و بازنویسی کنید.'
                  : 'Start by discovering and reprogramming your first subconscious belief in the architect tab.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBeliefs.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                    item.isIntegrated
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                      : 'bg-black/35 border-indigo-500/25 hover:border-indigo-400/40'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                        📅 {item.date}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-[10px]">
                        {item.categoryFa || item.category}
                      </span>
                      {item.repetitionsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-mono">
                          ⚡ {item.repetitionsCount} {isRtl ? 'تکرار' : 'reps'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => {
                          setActiveBeliefForStudio(item);
                          setActiveTab('voiceStudio');
                          soundEngine.playTap?.();
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border transition-all ${
                          item.voiceAudioUrl
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:text-cyan-300 hover:border-cyan-400'
                        }`}
                      >
                        <Mic size={10} />
                        <span>{item.voiceAudioUrl ? (isRtl ? 'پخش صدای خود 🎙️' : 'Play Voice') : (isRtl ? 'ضبط صدای خود 🎙️' : 'Record Voice')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveBeliefForStudio(item);
                          setActiveTab('studio');
                          soundEngine.playTap?.();
                        }}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1"
                      >
                        <Play size={10} />
                        <span>{isRtl ? 'شروع سابلیمینال' : 'Open in Studio'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleIntegrated(item.id, item.isIntegrated)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 border transition-all ${
                          item.isIntegrated
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-black/30 border-white/15 text-slate-300 hover:border-amber-400 hover:text-amber-300'
                        }`}
                      >
                        {item.isIntegrated ? <Check size={12} /> : null}
                        <span>{item.isIntegrated ? (isRtl ? 'تثبیت‌شده در ناخودآگاه 🌟' : 'Integrated 🌟') : (isRtl ? 'علامت به عنوان تثبیت‌شده' : 'Mark as Integrated')}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBelief(item.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Limiting vs Empowering Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    {/* Old Limiting Belief */}
                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                        <span>🚫</span>
                        <span>{isRtl ? 'باور کهنه ناخودآگاه / ریشه:' : 'Limiting Root Belief:'}</span>
                      </span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {item.limitingBelief}
                      </p>
                      {item.rootCause && (
                        <p className="text-[10px] text-slate-400 italic pt-0.5">
                          🌱 {item.rootCause}
                        </p>
                      )}
                    </div>

                    {/* New Empowering Belief */}
                    <div className="p-3 rounded-xl bg-cyan-950/25 border border-cyan-500/30 space-y-1">
                      <span className="text-[10px] font-black text-cyan-300 flex items-center gap-1">
                        <span>✨</span>
                        <span>{isRtl ? 'باور جدید توانمندساز:' : 'Empowering Core Belief:'}</span>
                      </span>
                      <p className="text-xs text-cyan-100 font-bold leading-relaxed">
                        {item.empoweringBelief}
                      </p>
                    </div>

                  </div>

                  {/* Subliminal Affirmation Pills */}
                  {item.subliminalAffirmations && item.subliminalAffirmations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.subliminalAffirmations.map((aff, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] text-slate-300 font-mono"
                        >
                          💫 {aff}
                        </span>
                      ))}
                    </div>
                  )}

                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

    </div>
  );
}
