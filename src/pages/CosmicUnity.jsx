import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Globe, Heart, Compass, Volume2, Plus, CheckCircle2,
  RefreshCw, Trash2, Eye, Shield, Sun, Moon, Atom, Feather, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import HabitItem from '../components/ui/HabitItem';
import SectionWidgets from '../components/ui/SectionWidgets';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { COSMIC_ACADEMY_MODULES } from '../data/cosmicData';

const COSMIC_QUOTES = [
  {
    textFa: 'نیستی تو قطره‌ای جدا در اقیانوس، تو تمام اقیانوسی در پیکر یک قطره.',
    textEn: 'You are not a drop in the ocean; you are the entire ocean in a drop.',
    authorFa: 'مولانا جلال‌الدین بلخی',
    authorEn: 'Rumi',
  },
  {
    textFa: 'کربن موجود در دی‌ان‌ای ما، آهن درون خون ما و کلسیم دندان‌های ما، همگی در قلب ستارگان در حال مرگ پخته شده‌اند. ما غبار ستارگان آگاهیم.',
    textEn: 'The nitrogen in our DNA, the calcium in our teeth, the iron in our blood were made in the interiors of collapsing stars. We are made of starstuff.',
    authorFa: 'کارل سیگان (Carl Sagan)',
    authorEn: 'Carl Sagan',
  },
  {
    textFa: 'جهان بیرون از تو نیست. به درون بنگر؛ هرآنچه تمنا می‌کنی، خودِ تو هستی.',
    textEn: 'The universe is not outside of you. Look inside yourself; everything that you want, you already are.',
    authorFa: 'مولانا',
    authorEn: 'Rumi',
  },
  {
    textFa: 'جدایی انسان از کل کیهان یک خطای دیدِ شناختی و توهم ناشی از آگاهی محدود است.',
    textEn: 'A human being is part of a whole, called by us "Universe". The delusion of separation is a optical prison of consciousness.',
    authorFa: 'آلبرت اینشتین',
    authorEn: 'Albert Einstein',
  },
];

const COSMIC_FACTS = [
  {
    icon: '✨',
    titleFa: 'ما ۹۹.۹٪ ستاره‌ایم',
    titleEn: 'We Are 99.9% Starstuff',
    descFa: 'تقریباً تمام عناصر سنگین‌تر از هیدروژن در بدن انسان (کربن، اکسیژن، آهن) در انفجار سوپرنواهای میلیاردها سال پیش ساخته شده‌اند.',
    descEn: 'Nearly every atom in your body heavier than hydrogen was forged in supernovas billions of years ago.'
  },
  {
    icon: '⏳',
    titleFa: 'تقویم کیهانی',
    titleEn: 'The Cosmic Calendar',
    descFa: 'اگر عمر ۱۳.۸ میلیارد ساله کیهان را در ۱ سال فشرده کنیم، کل تاریخ ثبت‌شده بشریت در آخرین ۱۴ ثانیه شب سال نو رخ داده است!',
    descEn: 'If the 13.8B year cosmic timeline is compressed into 1 year, all human history occupies the final 14 seconds!'
  },
  {
    icon: '🌌',
    titleFa: '۱۰۰ میلیارد کهکشان',
    titleEn: '100 Billion Galaxies',
    descFa: 'در جهان قابل مشاهده بیش از ۱۰۰ میلیارد کهکشان وجود دارد، و در هر کهکشان صدها میلیارد منظومه و ستاره در چرخش‌اند.',
    descEn: 'The observable universe hosts over 100 billion galaxies, each containing hundreds of billions of suns.'
  },
  {
    icon: '🌍',
    titleFa: 'سفر زمین در فضا',
    titleEn: 'Earth\'s Cosmic Speed',
    descFa: 'هم‌اکنون که این متن را می‌خوانید، با سرعت ۱۰۷,۰۰۰ کیلومتر بر ساعت به دور خورشید و با سرعت ۷۹۲,۰۰۰ کیلومتر بر ساعت به دور مرکز کهکشان در حرکتید.',
    descEn: 'You are right now hurtling through space at 107,000 km/h around the Sun and 792,000 km/h around the Milky Way.'
  }
];

const ONENESS_DIMENSIONS = [
  {
    id: 'nature',
    icon: '🌿',
    titleFa: '۱. پیوند با زیست‌کره و طبیعت',
    titleEn: '1. Biosphere & Nature Connection',
    descFa: 'اکسیژنی که فرو می‌دهید هدیه درختان است و بازدم شما خوراک آنان؛ هیچ مرز بسته‌ای میان تنفس شما و جنگل وجود ندارد.',
    descEn: 'Every breath you take is trees\' gift; your exhale is their nourishment. No boundary exists between you and the forest.'
  },
  {
    id: 'atoms',
    icon: '⚛️',
    titleFa: '۲. پیوند با اتم‌ها و غبار ستارگان',
    titleEn: '2. Atomic & Starstuff Oneness',
    descFa: 'اتم‌های دست راست شما و دست چپ شما ممکن است از دو ستاره متفاوت با فاصله میلیون‌ها سال نوری آمده باشند.',
    descEn: 'The atoms of your right and left hands may originate from two different stars across light-years.'
  },
  {
    id: 'consciousness',
    icon: '🧠',
    titleFa: '۳. پیوند با آگاهی کیهانی',
    titleEn: '3. Cosmic Consciousness',
    descFa: 'شما راهی هستید که کیهان از طریق چشمان و ذهن شما خودش را تماشا می‌کند و می‌شناسد.',
    descEn: 'You are the cosmos thinking, observing, and awakening to itself through human eyes.'
  },
  {
    id: 'time',
    icon: '♾️',
    titleFa: '۴. پیوند با زمان بی‌آغاز و بی‌پایان',
    titleEn: '4. Deep Timeless Connection',
    descFa: 'این لحظه، نقطه پیوند تمام ۱۳.۸ میلیارد سال گذشته است. شما حاصل میلیاردها سال زنجیره پیوسته حیاتید.',
    descEn: 'This present moment is the apex of 13.8 billion years of unbroken continuity. You are eternity alive now.'
  }
];

export default function CosmicUnity() {
  const { language, addXP } = useAppStore();
  const { habits, todayLogs, loadHabits, toggleHabit, deleteHabit,
    journalEntries, loadJournals, addJournalEntry } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('immersion'); // 'immersion' | 'compass' | 'facts' | 'log' | 'habits'
  const [quoteIdx, setQuoteIdx] = useState(0);
  const currentQuote = COSMIC_QUOTES[quoteIdx % COSMIC_QUOTES.length] || COSMIC_QUOTES[0];

  // Sound engine frequency playing
  const [isCosmicAudioPlaying, setIsCosmicAudioPlaying] = useState(false);

  // Unity Log form
  const [unityExperience, setUnityExperience] = useState('');
  const [unityDimension, setUnityDimension] = useState('nature');

  useEffect(() => {
    loadHabits('cosmicUnity');
    loadJournals();
  }, []);

  const handlePlayCosmicTone = () => {
    soundEngine.init();
    if (!isCosmicAudioPlaying) {
      soundEngine.startAmbientSound('alpha');
      setIsCosmicAudioPlaying(true);
    } else {
      soundEngine.stopAmbientSound('alpha');
      setIsCosmicAudioPlaying(false);
    }
  };

  const handleSaveUnityLog = async (e) => {
    e.preventDefault();
    if (!unityExperience.trim()) return;

    await addJournalEntry({
      title: isRtl ? 'تجربه وحدت کیهانی' : 'Cosmic Oneness Experience',
      content: `[بعد یگانگی]: ${unityDimension}\n[تأمل و ادراک]: ${unityExperience}`,
      mood: 'happy',
      tags: 'وحدت‌کیهانی,غبارستارگان,یگانگی,کیهان',
      sectionId: 'cosmicUnity'
    });

    soundEngine.playLevelUp();
    addXP(25, 'ثبت ادراک یگانگی کیهانی');
    setUnityExperience('');
  };

  const [expandedCosmicId, setExpandedCosmicId] = useState(null);

  const TABS = [
    { id: 'immersion', fa: 'غوطه‌وری کیهانی', en: 'Cosmic Immersion', icon: '🌌' },
    { id: 'academy', fa: 'آکادمی کوانتوم و کیهان', en: 'Quantum Academy', icon: '⚛️' },
    { id: 'compass', fa: 'ابعاد ۴گانه پیوستگی', en: '4 Dimensions', icon: '🧭' },
    { id: 'facts', fa: 'شگفتی‌های کیهان', en: 'Cosmic Realities', icon: '✨' },
    { id: 'log', fa: 'دفترچه یگانگی', en: 'Unity Log', icon: '📓' },
    { id: 'habits', fa: 'عادات هماهنگی', en: 'Cosmic Habits', icon: '🪐' },
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
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-2xl text-purple-400 shadow-sm animate-pulse-slow">
            🌌
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">
              {isRtl ? 'وحدت کیهانی بی‌وقفه' : 'Seamless Cosmic Oneness'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isRtl ? 'فراتر از توهم جدایی؛ پیوند بی‌پایان ذرات وجود با پهنه کیهان' : 'Beyond the illusion of separation; infinite connection with the cosmos'}
            </p>
          </div>
        </div>

        {/* Ambient Sound wave toggle */}
        <button
          onClick={handlePlayCosmicTone}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
            isCosmicAudioPlaying
              ? 'bg-purple-600 border-purple-400 text-white shadow-lg animate-install-pulse'
              : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-purple-400'
          }`}
          title={isRtl ? 'امواج کیهانی آلفا (۴۳۲ هرتز)' : '432Hz Cosmic Waves'}
        >
          <Volume2 size={15} />
          <span>{isCosmicAudioPlaying ? (isRtl ? 'امواج فعال' : 'Waves Active') : (isRtl ? 'امواج ۴۳۲Hz' : '432Hz')}</span>
        </button>
      </motion.div>

      {/* Quote Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-5 rounded-2xl relative overflow-hidden"
        style={{ borderInlineStart: '4px solid #a855f7' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl">✨</span>
            <div>
              <p className="italic text-xs leading-relaxed text-[var(--text-primary)] font-medium">
                «{isRtl ? currentQuote.textFa : currentQuote.textEn}»
              </p>
              <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 mt-1">
                — {isRtl ? currentQuote.authorFa : currentQuote.authorEn}
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuoteIdx((quoteIdx + 1) % COSMIC_QUOTES.length)}
            className="p-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-purple-400 transition-colors"
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
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-purple-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB 1: IMMERSION & MEDITATION */}
        {activeTab === 'immersion' && (
          <motion.div
            key="immersion"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] relative overflow-hidden text-center flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 p-1 flex items-center justify-center animate-spin-slow shadow-xl">
                <div className="w-full h-full rounded-full bg-[#030014] flex items-center justify-center text-3xl">
                  🪐
                </div>
              </div>

              <div>
                <h2 className="text-base font-black text-[var(--text-primary)]">
                  {isRtl ? 'مراقبه غبار ستارگان و انحلال جدایی' : 'Starstuff Meditation & Ego Dissolution'}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed">
                  {isRtl
                    ? 'چشمان خود را برای چند لحظه ببندید. حس کنید که اتم‌های بدن شما تفاوتی با اتم‌های درخشان‌ترین کهکشان‌ها ندارند. شما و کیهان یکی هستید.'
                    : 'Close your eyes. Feel that your atoms are identical to the distant galaxies. You and the cosmos are an unbroken whole.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mt-2">
                <button
                  onClick={() => {
                    soundEngine.playMeditationBowl();
                    addXP(20, 'مراقبه وحدت کیهانی');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Sparkles size={15} />
                  <span>{isRtl ? 'نوای یگانگی با کاسه تبتی (+۲۰ XP)' : 'Cosmic Bowl Chime (+20 XP)'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 1.5: QUANTUM & COSMIC CONSCIOUSNESS ACADEMY */}
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
                  <BookOpen size={18} className="text-purple-400" />
                  <span>{isRtl ? 'آکادمی فیزیک کوانتوم و آگاهی کیهانی' : 'Quantum Physics & Cosmic Academy'}</span>
                </h2>
                <span className="text-xs text-[var(--text-secondary)]">
                  {COSMIC_ACADEMY_MODULES.length} {isRtl ? 'رساله عمیق' : 'treatises'}
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isRtl
                  ? 'سفر به اعماق فیزیک کوانتوم، درهم‌تنیدگی ذرات، سرچشمه زیستی ما در غبار ستارگان و چشم‌انداز آرامش‌بخش نقطه آبی کم‌رنگ.'
                  : 'Journey into quantum entanglement, stardust origins, and the perspective-shifting Pale Blue Dot.'}
              </p>

              <div className="space-y-3">
                {COSMIC_ACADEMY_MODULES.map((item) => {
                  const isExpanded = expandedCosmicId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isExpanded
                          ? 'bg-[var(--bg-secondary)] border-purple-500/50 shadow-md'
                          : 'bg-[var(--bg-secondary)]/50 border-[var(--border)] hover:border-purple-500/30'
                      }`}
                    >
                      <div
                        onClick={() => {
                          setExpandedCosmicId(isExpanded ? null : item.id);
                          haptics.tap();
                        }}
                        className="flex items-center justify-between cursor-pointer gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">{item.icon}</span>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                              {isRtl ? item.titleFa : item.titleEn}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-secondary)]">
                              <span className="font-semibold text-purple-400">{isRtl ? item.categoryFa : item.categoryEn}</span>
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
                              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-[11px] flex items-center gap-2">
                                <Sparkles size={14} className="flex-shrink-0" />
                                <span>{isRtl ? `پیام کیهانی: ${item.keyTakeawayFa}` : item.keyTakeawayFa}</span>
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

        {/* TAB 2: 4 DIMENSIONS */}
        {activeTab === 'compass' && (
          <motion.div
            key="compass"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {ONENESS_DIMENSIONS.map((dim, i) => (
              <div key={dim.id} className="glass-card p-4 rounded-2xl border border-[var(--border)] card-hover">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{dim.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {isRtl ? dim.titleFa : dim.titleEn}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {isRtl ? dim.descFa : dim.descEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* TAB 3: COSMIC FACTS */}
        {activeTab === 'facts' && (
          <motion.div
            key="facts"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {COSMIC_FACTS.map((fact, idx) => (
              <div key={idx} className="glass-card p-4 rounded-2xl border border-[var(--border)] card-hover">
                <div className="text-2xl mb-2">{fact.icon}</div>
                <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {isRtl ? fact.titleFa : fact.titleEn}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isRtl ? fact.descFa : fact.descEn}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* TAB 4: UNITY LOG */}
        {activeTab === 'log' && (
          <motion.div
            key="log"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <form onSubmit={handleSaveUnityLog} className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-3">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span>📓</span>
                <span>{isRtl ? 'دفترچه ثبت تجارب یگانگی و حس اقیانوسی' : 'Oceanic & Oneness Experience Log'}</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  {isRtl ? 'در کدام بعد بیشترین حس یگانگی را تجربه کردید؟' : 'Dimension of Connection:'}
                </label>
                <select
                  value={unityDimension}
                  onChange={e => setUnityDimension(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="nature">{isRtl ? '🌿 طبیعت و درختان' : '🌿 Nature & Trees'}</option>
                  <option value="sky">{isRtl ? '🌌 آسمان شب و ستارگان' : '🌌 Night Sky & Stars'}</option>
                  <option value="love">{isRtl ? '❤️ عشق و همدلی با انسان‌ها' : '❤️ Universal Empathy'}</option>
                  <option value="silence">{isRtl ? '🧘 سکوت و مراقبه عمیق' : '🧘 Inner Silence'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  {isRtl ? 'شرح حس درونی و مکاشفه شما:' : 'Describe your insight / feeling:'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={unityExperience}
                  onChange={e => setUnityExperience(e.target.value)}
                  placeholder={isRtl ? 'امروز هنگام تماشای آسمان یا نفس کشیدن چه ادراکی از پیوستگی با کل هستی داشتید؟' : 'Describe your moment of awe or connection...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-purple-600 text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>{isRtl ? 'ثبت در دفترچه کیهانی (+۲۵ XP)' : 'Save to Cosmic Log (+25 XP)'}</span>
              </button>
            </form>
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
                    {isRtl ? 'عادات روزانه هماهنگی با کیهان' : 'Daily Cosmic Alignment Habits'}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {isRtl ? `${completedHabits} از ${cosmicHabits.length} مورد امروز انجام شد` : `${completedHabits} of ${cosmicHabits.length} completed`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {cosmicHabits.map(habit => (
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

      {/* Custom Widgets Section */}
      <SectionWidgets sectionId="cosmicUnity" />
    </div>
  );
}
