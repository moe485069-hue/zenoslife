import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Brain, Clock, Plus, Sparkles, Copy, Share2, Check, RotateCw, Layers, Award,
  Volume2, Search, Zap, Compass, Shield, Atom, DollarSign, Globe, ChevronDown, ChevronUp, Play, Bookmark
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import ProgressRing from '../components/ui/ProgressRing';
import HabitItem from '../components/ui/HabitItem';
import CustomItemModal from '../components/ui/CustomItemModal';
import SectionWidgets from '../components/ui/SectionWidgets';
import soundEngine from '../utils/audio';

import { LEARNING_TRACKS } from '../data/learningData';
import MASTER_QUOTES from '../data/quotesData';

export default function Learning() {
  const { language, addXP, learningVault, toggleVaultItem } = useAppStore();
  const { 
    habits, todayLogs, loadHabits, toggleHabit, deleteHabit,
    flashcards, loadFlashcards, addFlashcard, updateFlashcard, deleteFlashcard
  } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('tracks'); // 'tracks' | 'flashcards' | 'pomodoro' | 'habits'
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // Tracks State
  const [selectedTrack, setSelectedTrack] = useState('english');
  const [expandedLesson, setExpandedLesson] = useState(0);

  // Flashcards state
  const [activeDeck, setActiveDeck] = useState('all');
  const [searchCard, setSearchCard] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newDeck, setNewDeck] = useState('زبان انگلیسی');

  // Pomodoro timer state
  const [pomoMode, setPomoMode] = useState('work'); // 'work' (25m) | 'break' (5m)
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [isPomoActive, setIsPomoActive] = useState(false);
  const [pomoCount, setPomoCount] = useState(0);

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  useEffect(() => {
    loadHabits('learning');
    loadFlashcards();
  }, [loadHabits, loadFlashcards]);

  // Pomodoro Interval
  useEffect(() => {
    let timer = null;
    if (isPomoActive && pomoTime > 0) {
      timer = setInterval(() => {
        setPomoTime((t) => t - 1);
      }, 1000);
    } else if (isPomoActive && pomoTime === 0) {
      setIsPomoActive(false);
      soundEngine.playLevelUp();
      if (pomoMode === 'work') {
        addXP(25, 'تکمیل پومودوروی مطالعه');
        setPomoCount((c) => c + 1);
        setPomoMode('break');
        setPomoTime(5 * 60);
      } else {
        setPomoMode('work');
        setPomoTime(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isPomoActive, pomoTime, pomoMode, addXP]);

  const handleCopyQuote = (quote) => {
    const text = `«${quote.textFa}»\n— ${quote.authorFa}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text to Speech for English
  const handleSpeakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filtered flashcards
  const filteredCards = flashcards.filter((c) => {
    const matchesDeck = activeDeck === 'all' || c.deck === activeDeck;
    const matchesSearch = !searchCard || 
      c.front?.toLowerCase().includes(searchCard.toLowerCase()) || 
      c.back?.toLowerCase().includes(searchCard.toLowerCase());
    return matchesDeck && matchesSearch;
  });

  const currentCard = filteredCards[cardIndex] || filteredCards[0];
  const allDecks = ['all', 'زبان انگلیسی', 'خودشناسی', 'ثروت و قدرت', 'کوانتوم و کیهان', 'توسعه فردی'];

  const handleCardRating = async (rating) => {
    if (!currentCard) return;
    setIsCardFlipped(false);

    const xpEarned = rating === 'easy' ? 10 : rating === 'medium' ? 5 : 2;
    addXP(xpEarned, 'مرور فلش‌کارت');

    await updateFlashcard(currentCard.id, {
      lastReviewed: new Date().toISOString(),
      difficulty: rating,
      streak: (currentCard.streak || 0) + (rating === 'easy' ? 1 : 0)
    });

    if (cardIndex < filteredCards.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      setCardIndex(0);
    }
  };

  const handleAddFlashcard = async (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    await addFlashcard({
      front: newFront.trim(),
      back: newBack.trim(),
      deck: newDeck.trim() || 'زبان انگلیسی',
      difficulty: 'medium'
    });

    addXP(10, 'ساخت فلش‌کارت');
    setNewFront('');
    setNewBack('');
    setIsAddCardModalOpen(false);
  };

  const learningHabits = habits.filter((h) => h.sectionId === 'learning');
  const quote = MASTER_QUOTES[quoteIdx % MASTER_QUOTES.length];
  const currentTrackData = LEARNING_TRACKS.find(t => t.id === selectedTrack) || LEARNING_TRACKS[0];

  const TABS = [
    { id: 'tracks', fa: 'آکادمی ۴گانه یادگیری', en: '4 Core Academies', icon: '🎓' },
    { id: 'flashcards', fa: 'فلش‌کارت لایتنر', en: 'Flashcards', icon: '🗂️' },
    { id: 'pomodoro', fa: 'پومودورو و تمرکز', en: 'Pomodoro', icon: '⏱️' },
    { id: 'habits', fa: 'عادات یادگیری', en: 'Daily Habits', icon: '🎯' },
  ];

  return (
    <div className="page-container flex flex-col gap-6 pb-24">
      {/* Page Title Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-sm">
            📚
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">
              {isRtl ? 'یادگیری روزانه، خرد و آکادمی تخصصی' : 'Daily Learning & Academies'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isRtl ? 'تسلط بر زبان انگلیسی، خودشناسی، ثروت و قدرت، فیزیک کوانتوم و کیهان' : 'English mastery, depth psychology, wealth dynamics & quantum wonders'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
        >
          <Plus size={14} />
          <span>{isRtl ? 'عادت جدید' : 'Add Habit'}</span>
        </button>
      </div>

      {/* Quote Banner */}
      <div
        className="glass-card p-4 rounded-2xl relative overflow-hidden"
        style={{ borderInlineStart: '4px solid var(--accent)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl">💡</span>
            <div>
              <p className="italic text-xs leading-relaxed text-[var(--text-primary)] font-medium">
                «{isRtl ? quote.textFa : quote.textEn}»
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-[var(--accent)]">
                  — {isRtl ? quote.authorFa : quote.authorEn}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                  {quote.categoryFa}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Bookmark to Vault */}
            {(() => {
              const isSaved = (learningVault || []).some(v => v.phrase === quote.textFa || v.title === quote.textFa || v.text === quote.textFa);
              return (
                <button
                  type="button"
                  onClick={() => {
                    toggleVaultItem({
                      id: `learning_quote_${quoteIdx}`,
                      phrase: isRtl ? quote.textFa : quote.textEn,
                      text: quote.textFa,
                      authorFa: quote.authorFa,
                      authorEn: quote.authorEn,
                      categoryFa: quote.categoryFa || 'حکمت یادگیری',
                      categoryEn: 'Learning Wisdom',
                      meaningFa: isRtl ? `به قلم ${quote.authorFa}` : `By ${quote.authorEn}`,
                      sectionId: 'learning',
                      type: 'wisdom',
                      icon: '💡'
                    });
                  }}
                  className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                    isSaved
                      ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      : 'bg-[var(--bg-secondary)] border-[var(--border)] text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
                  }`}
                  title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved in Vault') : (isRtl ? 'افزودن به گنجینه' : 'Add to Vault')}
                >
                  <Bookmark size={13} className={isSaved ? 'fill-current' : ''} />
                </button>
              );
            })()}

            <button
              onClick={() => handleCopyQuote(quote)}
              className="p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)]"
              title={isRtl ? 'کپی متن' : 'Copy'}
            >
              {copied ? <Check size={13} className="text-[var(--success)]" /> : <Copy size={13} />}
            </button>
            <button
              onClick={() => setQuoteIdx((prev) => prev + 1)}
              className="p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)]"
              title={isRtl ? 'نقل‌قول بعدی' : 'Next'}
            >
              <RotateCw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB 1: 4 CORE LEARNING ACADEMIES */}
        {activeTab === 'tracks' && (
          <motion.div
            key="tracks"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Track Selector Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LEARNING_TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTrack(t.id);
                    setExpandedLesson(0);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col items-center sm:items-start gap-1.5 ${
                    selectedTrack === t.id
                      ? 'bg-[var(--bg-card)] shadow-lg scale-102 font-black'
                      : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: selectedTrack === t.id ? t.color : 'var(--border)',
                    borderTopWidth: selectedTrack === t.id ? '4px' : '1px'
                  }}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs font-bold text-[var(--text-primary)] block text-center sm:text-right">
                    {isRtl ? t.titleFa.split('(')[0] : t.titleEn}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Track Detailed Lessons */}
            <div
              className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-4"
              style={{ borderTop: `4px solid ${currentTrackData.color}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{currentTrackData.icon}</span>
                  <div>
                    <h2 className="text-base font-black text-[var(--text-primary)]">
                      {isRtl ? currentTrackData.titleFa : currentTrackData.titleEn}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {isRtl ? currentTrackData.descFa : currentTrackData.descEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lesson Modules Accordion */}
              <div className="space-y-2.5 pt-2">
                {currentTrackData.lessons.map((lesson, idx) => {
                  const isOpen = expandedLesson === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedLesson(isOpen ? -1 : idx)}
                        className="w-full p-4 flex items-center justify-between text-right text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black text-white"
                            style={{ backgroundColor: currentTrackData.color }}
                          >
                            {idx + 1}
                          </span>
                          <span>{isRtl ? lesson.titleFa : lesson.titleEn}</span>
                        </div>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="px-4 pb-4 pt-1 border-t border-[var(--border)] space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]"
                        >
                          {(isRtl ? lesson.contentFa : lesson.contentEn).map((line, lIdx) => {
                            const isLineSaved = (learningVault || []).some(v => v.phrase === line || v.text === line);
                            return (
                              <div key={lIdx} className="flex items-start justify-between gap-2 p-1.5 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
                                <p className="flex-1 font-medium text-[var(--text-primary)]">{line}</p>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {/* Bookmark to Vault */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      toggleVaultItem({
                                        id: `lesson_${selectedTrack}_${idx}_${lIdx}`,
                                        phrase: line,
                                        text: line,
                                        titleFa: lesson.titleFa,
                                        categoryFa: isRtl ? currentTrackData.titleFa : currentTrackData.titleEn,
                                        categoryEn: currentTrackData.titleEn,
                                        meaningFa: lesson.titleFa,
                                        sectionId: 'learning',
                                        type: selectedTrack === 'english' ? 'greeting' : 'wisdom',
                                        lang: selectedTrack === 'english' ? 'en' : undefined,
                                        icon: currentTrackData.icon || '📚'
                                      });
                                    }}
                                    className={`p-1.5 rounded-lg border text-xs transition-all ${
                                      isLineSaved
                                        ? 'bg-amber-500 text-black border-amber-400 font-black'
                                        : 'bg-[var(--bg-card)] border-[var(--border)] text-slate-400 hover:text-amber-300'
                                    }`}
                                    title={isLineSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved') : (isRtl ? 'افزودن به گنجینه' : 'Add to Vault')}
                                  >
                                    <Bookmark size={13} className={isLineSaved ? 'fill-current' : ''} />
                                  </button>

                                  {selectedTrack === 'english' && (
                                    <button
                                      onClick={() => handleSpeakText(line.replace(/•/g, '').split(':')[0])}
                                      className="p-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--accent)] hover:scale-110 active:scale-95 transition-transform"
                                      title={isRtl ? "تلفظ صوتی" : "Pronounce"}
                                    >
                                      <Volume2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: FLASHCARDS SYSTEM */}
        {activeTab === 'flashcards' && (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="text-[var(--accent)]" size={20} />
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    {isRtl ? 'جعبه لایتنر و یادگیری فعال' : 'Interactive Leitner Flashcards'}
                  </h2>
                </div>

                <button
                  onClick={() => setIsAddCardModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--accent)] hover:border-[var(--accent)] active:scale-95"
                >
                  <Plus size={14} />
                  <span>{isRtl ? 'کارت جدید' : 'New Card'}</span>
                </button>
              </div>

              {/* Deck Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={searchCard}
                    onChange={(e) => setSearchCard(e.target.value)}
                    placeholder={isRtl ? 'جستجو در فلش‌کارت‌ها...' : 'Search flashcards...'}
                    className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              {/* Deck category buttons */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-4">
                {allDecks.map((deck) => (
                  <button
                    key={deck}
                    onClick={() => {
                      setActiveDeck(deck);
                      setCardIndex(0);
                      setIsCardFlipped(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeDeck === deck
                        ? 'bg-[var(--accent)] text-white shadow-md'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
                    }`}
                  >
                    {deck === 'all' ? (isRtl ? 'همه کارت‌ها' : 'All Decks') : deck}
                  </button>
                ))}
              </div>

              {/* 3D Flip Card */}
              {filteredCards.length > 0 && currentCard ? (
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="w-full h-56 relative cursor-pointer"
                    style={{ perspective: 1000 }}
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                  >
                    <motion.div
                      className="w-full h-full relative"
                      style={{ transformStyle: 'preserve-3d' }}
                      animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                    >
                      {/* FRONT SIDE */}
                      <div
                        className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-between border-2 border-[var(--border)] shadow-md"
                        style={{
                          backfaceVisibility: 'hidden',
                          background: 'var(--bg-card)'
                        }}
                      >
                        <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                          <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] font-bold">
                            {currentCard.deck || 'عمومی'}
                          </span>
                          <div className="flex items-center gap-2">
                            {/* Bookmark to Vault */}
                            {(() => {
                              const isCardSaved = (learningVault || []).some(v => v.id === `flashcard_${currentCard.id}` || v.phrase === currentCard.front);
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleVaultItem({
                                      id: `flashcard_${currentCard.id || cardIndex}`,
                                      phrase: currentCard.front,
                                      meaningFa: currentCard.back,
                                      meaningEn: currentCard.back,
                                      categoryFa: currentCard.deck || 'فلش‌کارت یادگیری',
                                      categoryEn: currentCard.deck || 'Learning Flashcard',
                                      sectionId: 'learning',
                                      type: 'flashcard',
                                      lang: currentCard.deck === 'زبان انگلیسی' ? 'en' : undefined,
                                      icon: '🎴'
                                    });
                                  }}
                                  className={`p-1.5 rounded-lg border text-xs transition-all ${
                                    isCardSaved
                                      ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                                      : 'bg-[var(--bg-secondary)] border-[var(--border)] text-slate-400 hover:text-amber-300'
                                  }`}
                                  title={isCardSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved in Vault') : (isRtl ? 'افزودن به گنجینه' : 'Add to Vault')}
                                >
                                  <Bookmark size={13} className={isCardSaved ? 'fill-current' : ''} />
                                </button>
                              );
                            })()}

                            {currentCard.deck === 'زبان انگلیسی' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSpeakText(currentCard.front.split('—')[0]);
                                }}
                                className="p-1 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] hover:scale-110"
                                title="تلفظ صوتی"
                              >
                                <Volume2 size={15} />
                              </button>
                            )}
                            <span>{cardIndex + 1} / {filteredCards.length}</span>
                          </div>
                        </div>

                        <div className="text-center my-auto">
                          <h3 className="text-lg font-black leading-relaxed text-[var(--text-primary)]">
                            {currentCard.front}
                          </h3>
                        </div>

                        <p className="text-[11px] text-center text-[var(--text-secondary)] italic">
                          {isRtl ? 'برای مشاهده پاسخ و تحلیل کلیک کنید 👆' : 'Tap to reveal explanation 👆'}
                        </p>
                      </div>

                      {/* BACK SIDE */}
                      <div
                        className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-between border-2 border-[var(--accent)] shadow-xl overflow-y-auto no-scrollbar"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(99,102,241,0.1) 100%), var(--bg-card)'
                        }}
                      >
                        <div className="flex justify-between items-center text-xs text-[var(--accent)] font-bold">
                          <span>💡 {isRtl ? 'پاسخ و تحلیل عمیق' : 'Deep Insight'}</span>
                          <span>{cardIndex + 1} / {filteredCards.length}</span>
                        </div>

                        <div className="my-auto py-2">
                          <p className="text-xs font-semibold leading-relaxed text-[var(--text-primary)] whitespace-pre-line">
                            {currentCard.back}
                          </p>
                        </div>

                        <p className="text-[10px] text-center text-[var(--text-secondary)]">
                          {isRtl ? 'میزان تسلط خود را ارزیابی کنید:' : 'Rate recall:'}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Rating Buttons */}
                  {isCardFlipped && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-3 gap-2.5 w-full"
                    >
                      <button
                        onClick={() => handleCardRating('hard')}
                        className="py-2.5 rounded-2xl bg-[var(--danger)]/15 border border-[var(--danger)]/40 text-[var(--danger)] text-xs font-bold hover:bg-[var(--danger)]/25 active:scale-95 transition-all"
                      >
                        {isRtl ? 'سخت (+۲ XP)' : 'Hard (+2 XP)'}
                      </button>
                      <button
                        onClick={() => handleCardRating('medium')}
                        className="py-2.5 rounded-2xl bg-[var(--warning)]/15 border border-[var(--warning)]/40 text-[var(--warning)] text-xs font-bold hover:bg-[var(--warning)]/25 active:scale-95 transition-all"
                      >
                        {isRtl ? 'متوسط (+۵ XP)' : 'Good (+5 XP)'}
                      </button>
                      <button
                        onClick={() => handleCardRating('easy')}
                        className="py-2.5 rounded-2xl bg-[var(--success)]/15 border border-[var(--success)]/40 text-[var(--success)] text-xs font-bold hover:bg-[var(--success)]/25 active:scale-95 transition-all"
                      >
                        {isRtl ? 'آسان (+۱۰ XP)' : 'Easy (+10 XP)'}
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-secondary)]">
                  {isRtl ? 'کارتی با این مشخصات یافت نشد.' : 'No flashcards found.'}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: POMODORO DEEP WORK TIMER */}
        {activeTab === 'pomodoro' && (
          <motion.div
            key="pomodoro"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-[#6366f1]" size={20} />
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    {isRtl ? 'تایمر تمرکز عمیق (پومودورو)' : 'Deep Work Pomodoro Timer'}
                  </h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-[#6366f1]/15 text-[#6366f1] font-bold">
                  🍅 {pomoCount} {isRtl ? 'جلسه موفق' : 'completed'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-5 my-2">
                {/* Mode switch */}
                <div className="flex gap-2 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <button
                    onClick={() => {
                      setPomoMode('work');
                      setPomoTime(25 * 60);
                      setIsPomoActive(false);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      pomoMode === 'work' ? 'bg-[#6366f1] text-white shadow-sm' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {isRtl ? 'تمرکز (۲۵ دقیقه)' : 'Focus (25m)'}
                  </button>
                  <button
                    onClick={() => {
                      setPomoMode('break');
                      setPomoTime(5 * 60);
                      setIsPomoActive(false);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      pomoMode === 'break' ? 'bg-[#10b981] text-white shadow-sm' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {isRtl ? 'استراحت (۵ دقیقه)' : 'Break (5m)'}
                  </button>
                </div>

                <ProgressRing
                  percentage={
                    pomoMode === 'work'
                      ? ((25 * 60 - pomoTime) / (25 * 60)) * 100
                      : ((5 * 60 - pomoTime) / (5 * 60)) * 100
                  }
                  size={170}
                  strokeWidth={9}
                  color={pomoMode === 'work' ? '#6366f1' : '#10b981'}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-extralight tabular-nums tracking-wider text-[var(--text-primary)]">
                      {Math.floor(pomoTime / 60)}:{(pomoTime % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold mt-1 text-[var(--text-secondary)]">
                      {isPomoActive ? (isRtl ? 'در حال ثبت زمان' : 'Running') : (isRtl ? 'متوقف' : 'Paused')}
                    </span>
                  </div>
                </ProgressRing>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsPomoActive(!isPomoActive)}
                    className="px-6 py-2.5 rounded-2xl bg-[#6366f1] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
                  >
                    {isPomoActive ? (isRtl ? 'مکث' : 'Pause') : (isRtl ? 'شروع تمرکز' : 'Start Focus')}
                  </button>
                  <button
                    onClick={() => {
                      setIsPomoActive(false);
                      setPomoTime(pomoMode === 'work' ? 25 * 60 : 5 * 60);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                  >
                    {isRtl ? 'ریست' : 'Reset'}
                  </button>
                </div>
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
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                <span>🎯</span>
                {isRtl ? 'اهداف و عادت‌های یادگیری روزانه' : 'Daily Learning Goals & Habits'}
              </h2>

              <div className="flex flex-col gap-2.5">
                {learningHabits.map((item) => (
                  <HabitItem
                    key={item.id}
                    item={item}
                    completed={!!todayLogs[item.id]}
                    onToggle={() => {
                      toggleHabit(item.id);
                      if (!todayLogs[item.id]) {
                        soundEngine.playCheckmark();
                        addXP(item.xp || 15, item.nameFa || item.name);
                      }
                    }}
                    onDelete={() => deleteHabit(item.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Modal: Add Flashcard */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-3xl border border-[var(--border)]"
            style={{ background: 'var(--bg-card)' }}
          >
            <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
              {isRtl ? 'افزودن فلش‌کارت جدید' : 'Add New Flashcard'}
            </h3>

            <form onSubmit={handleAddFlashcard} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-secondary)]">
                  {isRtl ? 'دسته / موضوع (Deck)' : 'Deck Topic'}
                </label>
                <select
                  value={newDeck}
                  onChange={(e) => setNewDeck(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="زبان انگلیسی">زبان انگلیسی</option>
                  <option value="خودشناسی">خودشناسی</option>
                  <option value="ثروت و قدرت">ثروت و قدرت</option>
                  <option value="کوانتوم و کیهان">کوانتوم و کیهان</option>
                  <option value="توسعه فردی">توسعه فردی</option>
                  <option value="سایر">سایر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-secondary)]">
                  {isRtl ? 'روی کارت (سوال یا اصطلاح) *' : 'Front (Question/Term) *'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder={isRtl ? 'سوال یا مفهومی که می‌خواهید به خاطر بسپارید...' : 'Question to remember...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-secondary)]">
                  {isRtl ? 'پشت کارت (پاسخ یا توضیح کامل) *' : 'Back (Answer/Explanation) *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder={isRtl ? 'پاسخ کامل، نکات کلیدی، ریشه‌ها و مثال...' : 'Full explanation, keys or examples...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCardModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)]"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90"
                >
                  {isRtl ? 'افزودن کارت (+۱۰ XP)' : 'Save Card (+10 XP)'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Custom Widgets Section */}
      <SectionWidgets sectionId="learning" />

      {/* Modal: Custom Item */}
      <CustomItemModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        sectionId="learning"
        sectionTitle={isRtl ? 'یادگیری روزانه' : 'Learning'}
      />
    </div>
  );
}
