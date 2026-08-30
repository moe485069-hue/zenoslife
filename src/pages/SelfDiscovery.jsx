import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Heart, BookHeart, Sparkles, Plus, Trash2, Calendar, ChevronDown, ChevronUp, 
  Compass, Target, BookOpen, Brain, Shield, Archive, Bookmark, RefreshCw, Check
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import EmotionWheel from '../components/ui/EmotionWheel';
import HabitItem from '../components/ui/HabitItem';
import CustomItemModal from '../components/ui/CustomItemModal';
import SectionWidgets from '../components/ui/SectionWidgets';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { SHADOW_WORK_EXERCISES, DEEP_SOCRATIC_QUESTIONS } from '../data/selfDiscoveryData';

const CORE_VALUES = [
  { id: 'honesty', nameFa: 'صداقت و راستی', nameEn: 'Honesty', icon: '💎' },
  { id: 'freedom', nameFa: 'آزادی و استقلال', nameEn: 'Freedom', icon: '🕊️' },
  { id: 'growth', nameFa: 'رشد و یادگیری', nameEn: 'Growth', icon: '🌱' },
  { id: 'family', nameFa: 'خانواده و عزیزان', nameEn: 'Family', icon: '🏡' },
  { id: 'peace', nameFa: 'آرامش درون', nameEn: 'Inner Peace', icon: '🌊' },
  { id: 'creativity', nameFa: 'خلاقیت و آفرینش', nameEn: 'Creativity', icon: '🎨' },
  { id: 'justice', nameFa: 'عدالت و انصاف', nameEn: 'Justice', icon: '⚖️' },
  { id: 'courage', nameFa: 'شجاعت و جسارت', nameEn: 'Courage', icon: '🦁' },
  { id: 'love', nameFa: 'عشق و مهرورزی', nameEn: 'Love', icon: '❤️' },
  { id: 'health', nameFa: 'سلامت و تندرستی', nameEn: 'Health', icon: '🍏' },
  { id: 'wealth', nameFa: 'استقلال مالی', nameEn: 'Wealth', icon: '💰' },
  { id: 'discipline', nameFa: 'نظم و استمرار', nameEn: 'Discipline', icon: '⚡' }
];

export default function SelfDiscovery() {
  const { language, addXP } = useAppStore();
  const { 
    habits, todayLogs, loadHabits, toggleHabit, deleteHabit,
    journalEntries, loadJournals, addJournalEntry, deleteJournalEntry
  } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('emotion'); // 'emotion' | 'shadow' | 'socratic' | 'values' | 'journal' | 'habits'

  // Emotion wheel selection
  const [selectedMood, setSelectedMood] = useState(null);

  // Journal state
  const [journalTitle, setJournalTitle] = useState('');
  const [journalText, setJournalText] = useState('');
  const [journalTags, setJournalTags] = useState('خودشناسی');
  const [journalFilter, setJournalFilter] = useState('');
  const [expandedJournalId, setExpandedJournalId] = useState(null);

  // Socratic question index
  const [socraticIdx, setSocraticIdx] = useState(0);
  const [expandedShadowId, setExpandedShadowId] = useState(null);

  // Values assessment
  const [selectedValues, setSelectedValues] = useState(['growth', 'peace', 'honesty']);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  useEffect(() => {
    loadHabits('selfDiscovery');
    loadJournals();
  }, [loadHabits, loadJournals]);

  const handleSaveJournal = async (e) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    await addJournalEntry({
      title: journalTitle.trim() || (isRtl ? 'ژورنال ژرف خودشناسی' : 'Self-Discovery Entry'),
      content: journalText.trim(),
      mood: selectedMood ? selectedMood.name : 'neutral',
      tags: journalTags,
      sectionId: 'selfDiscovery'
    });

    soundEngine.playLevelUp();
    addXP(30, 'ثبت ژورنال خودشناسی');
    setJournalTitle('');
    setJournalText('');
    alert(isRtl ? 'ژورنال خودشناسی با موفقیت ثبت شد (+۳۰ XP) ✨' : 'Journal entry saved (+30 XP)');
  };

  const handleToggleValue = (valId) => {
    haptics.tap();
    if (selectedValues.includes(valId)) {
      setSelectedValues(prev => prev.filter(id => id !== valId));
    } else {
      if (selectedValues.length < 5) {
        setSelectedValues(prev => [...prev, valId]);
      } else {
        alert(isRtl ? 'حداکثر ۵ ارزش بنیادین اصلی را انتخاب کنید.' : 'Maximum 5 core values.');
      }
    }
  };

  const filteredJournals = (journalEntries || []).filter(j => 
    !journalFilter || (j.title && j.title.toLowerCase().includes(journalFilter.toLowerCase())) ||
    (j.content && j.content.toLowerCase().includes(journalFilter.toLowerCase())) ||
    (j.tags && j.tags.toLowerCase().includes(journalFilter.toLowerCase()))
  );

  const TABS = [
    { id: 'emotion', fa: 'چرخ احساسات', en: 'Emotion Wheel', icon: '🧭' },
    { id: 'shadow', fa: 'کارگاه سایه و ناخودآگاه', en: 'Shadow Work', icon: '🪞' },
    { id: 'socratic', fa: 'پرسش‌های سقراطی', en: 'Socratic Prompts', icon: '💡' },
    { id: 'values', fa: 'ارزش‌های بنیادین', en: 'Core Values', icon: '💎' },
    { id: 'journal', fa: 'دفترچه خودشناسی', en: 'Deep Journal', icon: '📓' },
    { id: 'habits', fa: 'عادات خودشناسی', en: 'Habits', icon: '⚡' },
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl text-indigo-400 shadow-sm animate-pulse-slow">
            🪞
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">
              {isRtl ? 'قلمرو خودشناسی، سایه و روان' : 'Self-Discovery & Shadow Mastery'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isRtl ? 'شناخت لایه‌های ناخودآگاه، پذیرش سایه، تنظیم هیجانات و رسالت فردی' : 'Unconscious exploration, shadow integration, and core purpose'}
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
                ? 'bg-indigo-600 text-white shadow-md scale-105'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-indigo-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB 1: EMOTION WHEEL */}
        {activeTab === 'emotion' && (
          <motion.div
            key="emotion"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] space-y-4 text-center">
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                {isRtl ? 'قطب‌نمای هیجانی و نام‌گذاری احساسات اکنون' : 'Emotion Compass & Affect Labeling'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                {isRtl ? 'نام‌گذاری دقیق احساس («Name it to Tame it»)، فعالیت آمیگدال مغز را کاهش داده و کنترل قشر پیش‌پیشانی را بازمی‌گرداند.' : 'Accurately naming your emotion calms the amygdala and restores executive clarity.'}
              </p>

              <EmotionWheel onSelectEmotion={(mood) => {
                setSelectedMood(mood);
                haptics.tap();
                soundEngine.playTap();
              }} />

              {selectedMood && (
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-400">
                    {isRtl ? `احساس انتخاب‌شده: ${selectedMood.name}` : `Selected: ${selectedMood.name}`}
                  </span>
                  <button
                    onClick={() => setActiveTab('journal')}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-[11px] font-bold"
                  >
                    {isRtl ? 'ثبت در ژورنال' : 'Log in Journal'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: SHADOW WORK */}
        {activeTab === 'shadow' && (
          <motion.div
            key="shadow"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="glass-card p-5 rounded-3xl border border-[var(--border)] mb-1">
              <h3 className="text-sm font-black text-[var(--text-primary)] mb-1">
                {isRtl ? 'کارگاه روان‌تحلیل‌گری و ادغام سایه (Shadow Work)' : 'Shadow Work & Psychoanalysis Studio'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isRtl ? 'سایه بخش‌هایی از وجود ماست که به دلیل ترس از طرد شدن در تاریکی ناخودآگاه پنهان کرده‌ایم. با پذیرش آن‌ها به کمال می‌رسیم.' : 'The shadow is what you split off from your conscious identity.'}
              </p>
            </div>

            {SHADOW_WORK_EXERCISES.map(item => {
              const isExpanded = expandedShadowId === item.id;
              return (
                <div
                  key={item.id}
                  className="glass-card p-5 rounded-3xl border border-[var(--border)] transition-all hover:border-indigo-500/40"
                >
                  <div
                    onClick={() => {
                      setExpandedShadowId(isExpanded ? null : item.id);
                      haptics.tap();
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">{item.icon}</span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">{item.titleFa}</h4>
                        <span className="text-[10px] text-indigo-400 font-bold">{item.categoryFa}</span>
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
                        className="overflow-hidden pt-3 mt-3 border-t border-[var(--border)] space-y-3 text-xs leading-relaxed"
                      >
                        <p className="text-[var(--text-secondary)] leading-relaxed">{item.summaryFa}</p>
                        
                        <div className="space-y-2">
                          <span className="font-bold text-indigo-400 block text-[11px]">گام‌های تمرین عملی:</span>
                          {item.stepsFa.map((step, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                              {step}
                            </div>
                          ))}
                        </div>

                        {item.reflectionPromptFa && (
                          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-[11px]">
                            💡 «{item.reflectionPromptFa}»
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* TAB 3: SOCRATIC PROMPTS */}
        {activeTab === 'socratic' && (
          <motion.div
            key="socratic"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] text-center space-y-4 relative">
              <span className="text-4xl">💡</span>
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">
                  {DEEP_SOCRATIC_QUESTIONS[socraticIdx]?.categoryFa}
                </span>
                <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] leading-relaxed max-w-md mx-auto">
                  «{DEEP_SOCRATIC_QUESTIONS[socraticIdx]?.questionFa}»
                </h3>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSocraticIdx((socraticIdx + 1) % DEEP_SOCRATIC_QUESTIONS.length);
                    soundEngine.playTap();
                    haptics.tap();
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-indigo-500 flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  <span>{isRtl ? 'پرسش سقراطی بعدی' : 'Next Question'}</span>
                </button>
                <button
                  onClick={() => {
                    setJournalTitle(DEEP_SOCRATIC_QUESTIONS[socraticIdx]?.categoryFa);
                    setJournalText(`[پرسش]: ${DEEP_SOCRATIC_QUESTIONS[socraticIdx]?.questionFa}\n\n[پاسخ من]: `);
                    setActiveTab('journal');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md active:scale-95"
                >
                  {isRtl ? 'پاسخ در ژورنال' : 'Answer in Journal'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: VALUES */}
        {activeTab === 'values' && (
          <motion.div
            key="values"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)] space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-black text-[var(--text-primary)]">
                  {isRtl ? 'قطب‌نمای ۵ ارزش بنیادین زندگی شما' : 'Top 5 Core Life Values'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {isRtl ? 'ارزش‌هایی که هیچ‌گاه حاضر به معامله بر سر آن‌ها نیستید را انتخاب کنید.' : 'Select the 5 non-negotiable principles guiding your decisions.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CORE_VALUES.map(val => {
                  const isSelected = selectedValues.includes(val.id);
                  return (
                    <div
                      key={val.id}
                      onClick={() => handleToggleValue(val.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md scale-105'
                          : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-indigo-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{val.icon}</span>
                        <span className="text-xs font-bold">{val.nameFa}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: DEEP JOURNAL */}
        {activeTab === 'journal' && (
          <motion.div
            key="journal"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Journal Input Form */}
            <form onSubmit={handleSaveJournal} className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-3">
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                {isRtl ? 'ثبت تأملات و ژورنال خودشناسی' : 'New Self-Discovery Reflection'}
              </h3>

              <input
                type="text"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                placeholder={isRtl ? 'عنوان ژورنال (مثلاً: ریشه ترس از تغییر)...' : 'Title...'}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-indigo-500 font-bold"
              />

              <textarea
                rows={4}
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder={isRtl ? 'افکار، مکاشفات درونی، رویاها و مشاهدات روان خود را بنویسید...' : 'Write your deep reflections...'}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-3.5 text-xs text-[var(--text-primary)] outline-none focus:border-indigo-500 leading-relaxed"
              />

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={journalTags}
                  onChange={(e) => setJournalTags(e.target.value)}
                  placeholder={isRtl ? 'برچسب‌ها (با کاما جدا کنید)...' : 'Tags...'}
                  className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md active:scale-95"
                >
                  {isRtl ? 'ذخیره (+۳۰ XP)' : 'Save (+30 XP)'}
                </button>
              </div>
            </form>

            {/* Journal Entries List */}
            <div className="space-y-3">
              {filteredJournals.map(entry => (
                <div
                  key={entry.id}
                  className="glass-card p-4 rounded-2xl border border-[var(--border)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">{entry.title}</h4>
                    <button
                      onClick={() => deleteJournalEntry(entry.id)}
                      className="text-rose-500 p-1 hover:opacity-80"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">{entry.content}</p>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border)] font-mono">
                    <span>{entry.tags}</span>
                    <span>{new Date(entry.createdAt).toLocaleDateString(isRtl ? 'fa-IR' : 'en-US')}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 6: HABITS */}
        {activeTab === 'habits' && (
          <motion.div
            key="habits"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <SectionWidgets
              sectionId="selfDiscovery"
              titleFa="عادات خودشناسی"
              titleEn="Self-Discovery Habits"
              habits={habits}
              todayLogs={todayLogs}
              onToggleHabit={toggleHabit}
              onDeleteHabit={deleteHabit}
              onAddHabit={() => setIsCustomModalOpen(true)}
            />
          </motion.div>
        )}

      </AnimatePresence>

      <CustomItemModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        sectionId="selfDiscovery"
      />

    </div>
  );
}
