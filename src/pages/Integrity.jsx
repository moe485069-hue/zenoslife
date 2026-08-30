import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, HeartHandshake, Sparkles, Plus, CheckCircle2, XCircle, Clock, Trash2, Award, Heart, BookOpen, ChevronDown, ChevronUp, Shield, Bookmark
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import HabitItem from '../components/ui/HabitItem';
import CustomItemModal from '../components/ui/CustomItemModal';
import SectionWidgets from '../components/ui/SectionWidgets';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { INTEGRITY_ACADEMY_MODULES } from '../data/integrityData';

const INTEGRITY_QUESTIONS = [
  { id: 1, textFa: 'آیا امروز در تمام گفتگوها و کارهایم کاملاً صادق و روراست بودم؟', textEn: 'Was I completely honest in my conversations and deeds today?' },
  { id: 2, textFa: 'آیا به وعده‌ها و تعهداتی که به خود و دیگران دادم وفادار ماندم؟', textEn: 'Did I keep all commitments made to myself and others?' },
  { id: 3, textFa: 'آیا امروز توانستم خشم و قضاوت عجولانه را کنترل کنم؟', textEn: 'Did I manage anger and avoid hasty judgments?' },
  { id: 4, textFa: 'آیا بدون چشم‌داشت به کسی کمک کردم یا دلی را شاد ساختم؟', textEn: 'Did I selflessly help someone or bring joy to a heart?' },
  { id: 5, textFa: 'اگر مرتکب اشتباهی شدم، شجاعت پذیرش و جبران آن را داشتم؟', textEn: 'If I made a mistake, did I take responsibility and make amends?' },
  { id: 6, textFa: 'آیا رفتارم در خلوت با رفتارم در جمع هماهنگ و یکدست بود؟', textEn: 'Was my private conduct in harmony with my public values?' }
];

export default function Integrity() {
  const { language, addXP, learningVault, toggleVaultItem } = useAppStore();
  const { 
    habits, todayLogs, loadHabits, toggleHabit, deleteHabit,
    commitments, gratitudes, loadIntegrityData, addCommitment, updateCommitmentStatus, addGratitude
  } = useSectionsStore();
  const isRtl = language === 'fa';

  // Daily Integrity Check Answers
  const [answers, setAnswers] = useState({});
  const [isScoreSubmitted, setIsScoreSubmitted] = useState(false);

  // Commitments Form
  const [isAddCommModalOpen, setIsAddCommModalOpen] = useState(false);
  const [commToWhom, setCommToWhom] = useState('');
  const [commWhat, setCommWhat] = useState('');
  const [commDeadline, setCommDeadline] = useState('');

  // Gratitude inputs
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [isGratitudeSaved, setIsGratitudeSaved] = useState(false);

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [expandedIntegrityId, setExpandedIntegrityId] = useState(null);

  useEffect(() => {
    loadHabits('integrity');
    loadIntegrityData();
  }, [loadHabits, loadIntegrityData]);

  const handleAnswerToggle = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleCalculateScore = () => {
    const totalQuestions = INTEGRITY_QUESTIONS.length;
    const yesCount = Object.values(answers).filter((v) => v === true).length;
    const calculatedScore = Math.round((yesCount / totalQuestions) * 100);

    soundEngine.playLevelUp();
    addXP(25, 'تکمیل سنجش درستی روزانه');
    setIsScoreSubmitted(true);
  };

  const handleAddCommitment = async (e) => {
    e.preventDefault();
    if (!commWhat.trim()) return;

    await addCommitment({
      toWhom: commToWhom.trim() || (isRtl ? 'به خودم' : 'To myself'),
      what: commWhat.trim(),
      deadline: commDeadline
    });

    addXP(10, 'ثبت تعهد جدید');
    setCommToWhom('');
    setCommWhat('');
    setCommDeadline('');
    setIsAddCommModalOpen(false);
  };

  const handleSaveGratitude = async (e) => {
    e.preventDefault();
    if (!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim()) return;

    await addGratitude({
      item1: gratitude1.trim(),
      item2: gratitude2.trim(),
      item3: gratitude3.trim()
    });

    soundEngine.playMeditationBowl();
    addXP(20, 'ثبت ۳ شکرگزاری روزانه');
    setIsGratitudeSaved(true);
    setTimeout(() => setIsGratitudeSaved(false), 3000);
  };

  const answeredCount = Object.keys(answers).length;
  const yesAnswersCount = Object.values(answers).filter((v) => v === true).length;
  const integrityScore = answeredCount > 0 ? Math.round((yesAnswersCount / INTEGRITY_QUESTIONS.length) * 100) : 0;
  const integrityHabits = habits.filter((h) => h.sectionId === 'integrity');

  return (
    <div className="page-container flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>💎</span>
            {isRtl ? 'درستی، اصول اخلاقی و مسئولیت' : 'Integrity & Ethics'}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isRtl ? 'پایش هماهنگی گفتار و عمل، وفای به عهدها و شکرگزاری آگاهانه' : 'Harmonize words and actions, honor commitments & cultivate gratitude'}
          </p>
        </div>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>{isRtl ? 'افزودن اصل' : 'Add Principle'}</span>
        </button>
      </div>

      {/* SECTION 1: DAILY INTEGRITY REVIEW MATRIX */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#eab308]" size={20} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? 'چک‌لیست سنجش درستی و اخلاق روزانه' : 'Daily Integrity Self-Audit'}
            </h2>
          </div>
          {answeredCount > 0 && (
            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-[#eab308]/15 text-[#ca8a04]">
              {integrityScore}% {isRtl ? 'امتیاز درستی' : 'Integrity'}
            </span>
          )}
        </div>

        <p className="text-xs text-[var(--text-secondary)] mb-4">
          {isRtl ? 'در پایان روز با صداقت کامل به پرسش‌های زیر پاسخ دهید:' : 'Review your ethical alignment before sleep with pure honesty:'}
        </p>

        <div className="flex flex-col gap-3">
          {INTEGRITY_QUESTIONS.map((q) => {
            const currentAns = answers[q.id];
            return (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between gap-3"
              >
                <span className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {isRtl ? q.textFa : q.textEn}
                </span>

                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleAnswerToggle(q.id, true)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      currentAns === true
                        ? 'bg-[var(--success)] text-white shadow-sm'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--success)]'
                    }`}
                  >
                    {isRtl ? 'بله ✓' : 'Yes'}
                  </button>
                  <button
                    onClick={() => handleAnswerToggle(q.id, false)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      currentAns === false
                        ? 'bg-[var(--danger)] text-white shadow-sm'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--danger)]'
                    }`}
                  >
                    {isRtl ? 'نیاز به بهبود' : 'No'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {answeredCount === INTEGRITY_QUESTIONS.length && !isScoreSubmitted && (
          <button
            onClick={handleCalculateScore}
            className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#eab308] text-white font-bold text-xs shadow-lg hover:opacity-90 active:scale-98 transition-all"
          >
            {isRtl ? 'ثبت نهایی کارنامه درستی امروز (+۲۵ XP)' : 'Submit Daily Audit (+25 XP)'}
          </button>
        )}
      </div>

      {/* SECTION 2: COMMITMENTS & PROMISES TRACKER */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="text-[var(--accent)]" size={20} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? 'ردیاب عهدها و تعهدات (قول‌ها)' : 'Promises & Commitments Ledger'}
            </h2>
          </div>

          <button
            onClick={() => setIsAddCommModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--accent)] hover:border-[var(--accent)] active:scale-95"
          >
            <Plus size={14} />
            <span>{isRtl ? 'تعهد جدید' : 'New Promise'}</span>
          </button>
        </div>

        {commitments.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {commitments.map((comm) => (
              <div
                key={comm.id}
                className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {comm.what}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] font-semibold">
                      {comm.toWhom}
                    </span>
                  </div>
                  {comm.deadline && (
                    <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block">
                      ⏳ مهلت: {comm.deadline}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {comm.status === 'kept' ? (
                    <span className="text-xs font-bold text-[var(--success)] flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--success)]/15">
                      <CheckCircle2 size={14} /> {isRtl ? 'وفادار ماندم' : 'Kept'}
                    </span>
                  ) : comm.status === 'broken' ? (
                    <span className="text-xs font-bold text-[var(--danger)] flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--danger)]/15">
                      <XCircle size={14} /> {isRtl ? 'نقض شد' : 'Broken'}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          updateCommitmentStatus(comm.id, 'kept');
                          soundEngine.playLevelUp();
                          addXP(20, 'وفای به عهد');
                        }}
                        className="p-2 rounded-xl bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30 active:scale-95"
                        title={isRtl ? 'وفا کردم' : 'Kept'}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => updateCommitmentStatus(comm.id, 'broken')}
                        className="p-2 rounded-xl bg-[var(--danger)]/20 text-[var(--danger)] hover:bg-[var(--danger)]/30 active:scale-95"
                        title={isRtl ? 'نقض شد' : 'Broken'}
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-[var(--text-secondary)]">
            {isRtl ? 'تعهدی ثبت نشده است. روی "تعهد جدید" کلیک کنید.' : 'No active commitments. Tap "New Promise" to log one.'}
          </div>
        )}
      </div>

      {/* SECTION 3: DAILY GRATITUDE SANCTUARY */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="text-[#ec4899]" size={20} />
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {isRtl ? 'سنگر شکرگزاری روزانه (۳ موهبت امروز)' : 'Daily Gratitude Sanctuary'}
          </h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          {isRtl ? 'سه موهبت یا لحظه زیبایی که امروز بابت آن‌ها از صمیم قلب شکرگزاری را بنویسید:' : 'Write 3 blessings or bright moments you are genuinely grateful for today:'}
        </p>

        <form onSubmit={handleSaveGratitude} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--accent)]">۱.</span>
            <input
              type="text"
              value={gratitude1}
              onChange={(e) => setGratitude1(e.target.value)}
              placeholder={isRtl ? 'سپاسگزارم برای سلامتی و تندرستی‌ام...' : 'I am grateful for...'}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--accent)]">۲.</span>
            <input
              type="text"
              value={gratitude2}
              onChange={(e) => setGratitude2(e.target.value)}
              placeholder={isRtl ? 'سپاسگزارم برای فرصت یادگیری و آگاهی...' : 'I am grateful for...'}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--accent)]">۳.</span>
            <input
              type="text"
              value={gratitude3}
              onChange={(e) => setGratitude3(e.target.value)}
              placeholder={isRtl ? 'سپاسگزارم برای آرامش و عزیزانم...' : 'I am grateful for...'}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            {isGratitudeSaved
              ? isRtl ? '✨ شکرگزاری با موفقیت ثبت شد!' : '✨ Saved with Gratitude!'
              : isRtl ? 'ثبت شکرگزاری روزانه (+۲۰ XP)' : 'Save Gratitudes (+20 XP)'}
          </button>
        </form>
      </div>

      {/* SECTION 2.5: STOIC INTEGRITY & ETHICAL MASTERY ACADEMY */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BookOpen size={18} className="text-amber-500" />
            <span>{isRtl ? 'آکادمی درستی، فلسفه رواقی و اصالت عمل' : 'Stoic Virtues & Integrity Academy'}</span>
          </h2>
          <span className="text-xs text-[var(--text-secondary)]">
            {INTEGRITY_ACADEMY_MODULES.length} {isRtl ? 'خرد بنیادین' : 'modules'}
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {isRtl
            ? 'فضیلت‌های چهارگانه کهن، شفافیت رادیکال و چهار میثاق برای ساختن شخصیتی آرام و تسخیرناپذیر.'
            : 'Ancient four virtues, radical transparency and four agreements for unbreakable character.'}
        </p>

        <div className="space-y-3">
          {INTEGRITY_ACADEMY_MODULES.map((item) => {
            const isExpanded = expandedIntegrityId === item.id;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isExpanded
                    ? 'bg-[var(--bg-secondary)] border-amber-500/50 shadow-md'
                    : 'bg-[var(--bg-secondary)]/50 border-[var(--border)] hover:border-amber-500/30'
                }`}
              >
                <div
                  onClick={() => {
                    setExpandedIntegrityId(isExpanded ? null : item.id);
                    haptics.tap();
                  }}
                  className="flex items-center justify-between cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">{item.icon}</span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {isRtl ? item.titleFa : item.titleEn}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-secondary)]">
                        <span className="font-semibold text-amber-400">{isRtl ? item.categoryFa : item.categoryEn}</span>
                        <span>•</span>
                        <span>{isRtl ? item.readTimeFa : item.readTimeEn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bookmark to Vault */}
                    {(() => {
                      const isSaved = (learningVault || []).some(v => v.id === `integrity_${item.id}` || v.title === item.titleFa);
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVaultItem({
                              id: `integrity_${item.id}`,
                              title: isRtl ? item.titleFa : item.titleEn,
                              titleFa: item.titleFa,
                              categoryFa: 'درستی و فضیلت',
                              categoryEn: 'Integrity & Honor',
                              meaningFa: item.keyTakeawayFa || item.summaryEn,
                              descFa: item.contentFa,
                              sectionId: 'integrity',
                              type: 'integrity',
                              icon: item.icon || '🛡️'
                            });
                          }}
                          className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                            isSaved
                              ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                              : 'bg-white/5 border-[var(--border)] text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
                          }`}
                          title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved in Vault') : (isRtl ? 'افزودن به گنجینه' : 'Add to Vault')}
                        >
                          <Bookmark size={13} className={isSaved ? 'fill-current' : ''} />
                          <span className="text-[10px] hidden sm:inline">{isSaved ? (isRtl ? 'در گنجینه' : 'Saved') : (isRtl ? '💎 گنجینه' : '💎 Vault')}</span>
                        </button>
                      );
                    })()}

                    <button className="p-1 text-[var(--text-secondary)]">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
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
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-2">
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

      {/* SECTION 4: HABITS / CODE OF HONOR */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span>🛡️</span>
          {isRtl ? 'منشور اصول اخلاقی و رفتارهای روزانه' : 'Personal Code of Honor'}
        </h2>

        <div className="flex flex-col gap-2.5">
          {integrityHabits.map((item) => (
            <HabitItem
              key={item.id}
              item={item}
              completed={!!todayLogs[item.id]}
              onToggle={() => {
                toggleHabit(item.id);
                if (!todayLogs[item.id]) {
                  addXP(item.xp || 15, item.nameFa || item.name);
                }
              }}
              onDelete={() => deleteHabit(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Modal: Add Commitment */}
      {isAddCommModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-3xl border border-[var(--border)]"
            style={{ background: 'var(--bg-card)' }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? 'ثبت قول و تعهد جدید' : 'New Commitment / Promise'}
            </h3>

            <form onSubmit={handleAddCommitment} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'موضوع قول و تعهد *' : 'Commitment Description *'}
                </label>
                <input
                  type="text"
                  required
                  value={commWhat}
                  onChange={(e) => setCommWhat(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: تحویل گزارش قبل از ۵ عصر، عدم مصرف شکر...' : 'e.g., Deliver report before 5 PM...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'متعهد در برابر چه کسی؟' : 'To Whom?'}
                </label>
                <input
                  type="text"
                  value={commToWhom}
                  onChange={(e) => setCommToWhom(e.target.value)}
                  placeholder={isRtl ? 'به خودم، به همکارم، به خانواده...' : 'To myself, colleague, family...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'مهلت انجام (اختیاری)' : 'Deadline (Optional)'}
                </label>
                <input
                  type="text"
                  value={commDeadline}
                  onChange={(e) => setCommDeadline(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: تا آخر هفته...' : 'e.g., End of week...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCommModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)]"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90"
                >
                  {isRtl ? 'ثبت تعهد (+۱۰ XP)' : 'Save (+10 XP)'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Custom Widgets Section */}
      <SectionWidgets sectionId="integrity" />

      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        sectionId="integrity"
        sectionTitle={isRtl ? 'درستی' : 'Integrity'}
      />
    </div>
  );
}
