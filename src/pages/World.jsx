import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, BookOpen, Calendar, Award, Mountain, Droplets,
  FlaskConical, Star, ChevronDown, ChevronUp, ExternalLink,
  BookMarked, Plus, Trash2, Users, Zap, Leaf, Heart, Bookmark
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import HabitItem from '../components/ui/HabitItem';
import SectionWidgets from '../components/ui/SectionWidgets';

// =================== DATA ===================

import { CULTURAL_EVENTS, PERSIAN_SCHOLARS, IRAN_FACTS, WORLD_DATA } from '../data/worldData';

// =================== COMPONENT ===================

export default function World() {
  const { language, learningVault, toggleVaultItem } = useAppStore();
  const isRtl = language === 'fa';
  const { habits, todayLogs, loadHabits, toggleHabit, addHabit, deleteHabit,
    savedArticles, loadSavedArticles, addSavedArticle, deleteSavedArticle } = useSectionsStore();

  const [activeTab, setActiveTab] = useState('iran');
  const [expandedScholar, setExpandedScholar] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [articleForm, setArticleForm] = useState({ title: '', url: '', category: '' });

  useEffect(() => {
    loadHabits('world');
    loadSavedArticles();
  }, []);

  const worldHabits = habits.filter(h => h.sectionId === 'world');

  const TABS = [
    { id: 'iran', fa: 'ایران', en: 'Iran', icon: '🇮🇷' },
    { id: 'scholars', fa: 'دانشمندان', en: 'Scholars', icon: '🔬' },
    { id: 'festivals', fa: 'جشن‌ها', en: 'Festivals', icon: '🎉' },
    { id: 'world', fa: 'جهان', en: 'World', icon: '🌍' },
    { id: 'reading', fa: 'مطالعه', en: 'Reading', icon: '📚' },
  ];

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">🌐</span>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {isRtl ? 'ایران و جهان' : 'Iran & World'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {isRtl ? 'بشناس، بدان، ببین' : 'Know, Explore, Understand'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ===== IRAN TAB ===== */}
        {activeTab === 'iran' && (
          <motion.div
            key="iran"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              {IRAN_FACTS.map((f, i) => {
                const isSaved = (learningVault || []).some(v => v.id === `iran_fact_${i}` || v.title === f.titleFa);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl p-3 card-hover flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{f.icon}</span>
                        <button
                          type="button"
                          onClick={() => {
                            toggleVaultItem({
                              id: `iran_fact_${i}`,
                              title: isRtl ? f.titleFa : f.titleEn,
                              titleFa: f.titleFa,
                              categoryFa: 'حقایق ایران و جهان',
                              categoryEn: 'Iran & World Facts',
                              meaningFa: `${isRtl ? f.valFa : f.valEn} — ${isRtl ? f.descFa : f.descEn}`,
                              descFa: isRtl ? f.descFa : f.descEn,
                              sectionId: 'world',
                              type: 'world',
                              icon: f.icon || '🇮🇷'
                            });
                          }}
                          className={`p-1 rounded-lg border text-xs transition-all ${
                            isSaved
                              ? 'bg-amber-500 text-black border-amber-400 font-black'
                              : 'bg-white/5 border-[var(--border)] text-slate-400 hover:text-amber-300'
                          }`}
                          title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved') : (isRtl ? 'افزودن به گنجینه' : 'Add to Vault')}
                        >
                          <Bookmark size={12} className={isSaved ? 'fill-current' : ''} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-[var(--accent)] mb-0.5">
                        {isRtl ? f.titleFa : f.titleEn}
                      </p>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {isRtl ? f.valFa : f.valEn}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {isRtl ? f.descFa : f.descEn}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===== SCHOLARS TAB ===== */}
        {activeTab === 'scholars' && (
          <motion.div
            key="scholars"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              {isRtl
                ? 'دانشمندان، شاعران و فیلسوفانی که تمدن بشری را شکل دادند'
                : 'Scientists, poets and philosophers who shaped human civilization'}
            </p>
            {PERSIAN_SCHOLARS.map((s, i) => {
              const isSaved = (learningVault || []).some(v => v.id === `scholar_${s.id}` || v.title === s.nameFa);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <div className="w-full p-4 flex items-center gap-3 text-start">
                    <span className="text-3xl flex-shrink-0">{s.icon}</span>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedScholar(expandedScholar === s.id ? null : s.id)}
                    >
                      <div className="font-bold text-sm text-[var(--text-primary)]">
                        {isRtl ? s.nameFa : s.nameEn}
                      </div>
                      <div className="text-xs text-[var(--accent)] mt-0.5">
                        {isRtl ? s.fieldFa : s.fieldEn}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">{s.era}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          toggleVaultItem({
                            id: `scholar_${s.id}`,
                            title: isRtl ? s.nameFa : s.nameEn,
                            titleFa: s.nameFa,
                            categoryFa: 'مشاهیر و دانشمندان ایران',
                            categoryEn: 'Persian Scholars',
                            meaningFa: `${isRtl ? s.fieldFa : s.fieldEn} (${s.era}) — ${isRtl ? s.achieveFa : s.achieveEn}`,
                            descFa: isRtl ? s.achieveFa : s.achieveEn,
                            sectionId: 'world',
                            type: 'world',
                            icon: s.icon || '🔬'
                          });
                        }}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                          isSaved
                            ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                            : 'bg-white/5 border-[var(--border)] text-slate-400 hover:text-amber-300'
                        }`}
                        title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved') : (isRtl ? 'افزودن به گنجینه' : 'Add to Vault')}
                      >
                        <Bookmark size={13} className={isSaved ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => setExpandedScholar(expandedScholar === s.id ? null : s.id)}
                        className="p-1.5 text-[var(--text-secondary)]"
                      >
                        {expandedScholar === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedScholar === s.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-[var(--border)]">
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-3">
                            {isRtl ? s.achieveFa : s.achieveEn}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ===== FESTIVALS TAB ===== */}
        {activeTab === 'festivals' && (
          <motion.div
            key="festivals"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {CULTURAL_EVENTS.map((ev, i) => {
              const isSaved = (learningVault || []).some(v => v.id === `event_${ev.id}` || v.title === ev.titleFa);
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <div className="w-full p-4 flex items-center gap-3 text-start">
                    <span className="text-3xl flex-shrink-0">{ev.icon}</span>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedEvent(expandedEvent === ev.id ? null : ev.id)}
                    >
                      <div className="font-bold text-sm text-[var(--text-primary)]">
                        {isRtl ? ev.titleFa : ev.titleEn}
                      </div>
                      <span className="chip chip-accent text-xs mt-1">{ev.tag}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          toggleVaultItem({
                            id: `event_${ev.id}`,
                            title: isRtl ? ev.titleFa : ev.titleEn,
                            titleFa: ev.titleFa,
                            categoryFa: 'جشن‌ها و فرهنگ کهن',
                            categoryEn: 'Cultural Festivals',
                            meaningFa: `${ev.tag} — ${isRtl ? ev.descFa : ev.descEn}`,
                            descFa: isRtl ? ev.descFa : ev.descEn,
                            sectionId: 'world',
                            type: 'world',
                            icon: ev.icon || '🎉'
                          });
                        }}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                          isSaved
                            ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                            : 'bg-white/5 border-[var(--border)] text-slate-400 hover:text-amber-300'
                        }`}
                        title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved') : (isRtl ? 'افزودن به گنجینه' : 'Add to Vault')}
                      >
                        <Bookmark size={13} className={isSaved ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => setExpandedEvent(expandedEvent === ev.id ? null : ev.id)}
                        className="p-1.5 text-[var(--text-secondary)]"
                      >
                        {expandedEvent === ev.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedEvent === ev.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-[var(--border)]">
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-3">
                            {isRtl ? ev.descFa : ev.descEn}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ===== WORLD DATA TAB ===== */}
        {activeTab === 'world' && (
          <motion.div
            key="world"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-2 gap-3 mb-6">
              {WORLD_DATA.map((d, i) => {
                const isSaved = (learningVault || []).some(v => v.id === `world_data_${i}` || v.title === d.titleFa);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl p-4 card-hover flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{d.icon}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              toggleVaultItem({
                                id: `world_data_${i}`,
                                title: isRtl ? d.titleFa : d.titleEn,
                                titleFa: d.titleFa,
                                categoryFa: 'آمار و اطلاعات جهانی',
                                categoryEn: 'World Statistics',
                                meaningFa: `${d.val} — ${isRtl ? d.descFa : d.descEn}`,
                                descFa: isRtl ? d.descFa : d.descEn,
                                sectionId: 'world',
                                type: 'world',
                                icon: d.icon || '🌍'
                              });
                            }}
                            className={`p-1 rounded-lg border text-xs transition-all ${
                              isSaved
                                ? 'bg-amber-500 text-black border-amber-400 font-black'
                                : 'bg-white/5 border-[var(--border)] text-slate-400 hover:text-amber-300'
                            }`}
                            title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved') : (isRtl ? 'افزودن به گنجینه' : 'Add to Vault')}
                          >
                            <Bookmark size={12} className={isSaved ? 'fill-current' : ''} />
                          </button>
                          {d.trend === 'up' && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-[var(--danger-light)] text-[var(--danger)]">↑</span>
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-bold text-[var(--accent)]">{d.val}</p>
                      <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                        {isRtl ? d.titleFa : d.titleEn}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {isRtl ? d.descFa : d.descEn}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Habits */}
            {worldHabits.length > 0 && (
              <div>
                <div className="section-header mb-3">
                  <Globe size={16} className="text-[var(--accent)]" />
                  {isRtl ? 'عادت‌های جهانی' : 'World Habits'}
                </div>
                {worldHabits.map(habit => (
                  <HabitItem
                    key={habit.id}
                    item={habit}
                    completed={!!todayLogs[habit.id]}
                    onToggle={toggleHabit}
                    onDelete={deleteHabit}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ===== READING/ARTICLES TAB ===== */}
        {activeTab === 'reading' && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="section-header">
                <BookMarked size={16} className="text-[var(--accent)]" />
                {isRtl ? 'مقالات ذخیره‌شده' : 'Saved Articles'}
              </div>
              <button
                onClick={() => setShowAddArticle(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-light)] px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus size={14} />
                {isRtl ? 'افزودن' : 'Add'}
              </button>
            </div>

            {/* Add article form */}
            <AnimatePresence>
              {showAddArticle && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card rounded-2xl p-4 mb-4 overflow-hidden"
                >
                  <div className="space-y-2">
                    <input
                      value={articleForm.title}
                      onChange={e => setArticleForm(p => ({ ...p, title: e.target.value }))}
                      dir={isRtl ? 'rtl' : 'ltr'}
                      placeholder={isRtl ? 'عنوان مقاله...' : 'Article title...'}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                    <input
                      value={articleForm.url}
                      onChange={e => setArticleForm(p => ({ ...p, url: e.target.value }))}
                      dir="ltr"
                      type="url"
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                    <input
                      value={articleForm.category}
                      onChange={e => setArticleForm(p => ({ ...p, category: e.target.value }))}
                      dir={isRtl ? 'rtl' : 'ltr'}
                      placeholder={isRtl ? 'دسته‌بندی (مثلاً: علم، فرهنگ)' : 'Category (e.g. Science, Culture)'}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (!articleForm.title.trim()) return;
                          await addSavedArticle(articleForm);
                          setArticleForm({ title: '', url: '', category: '' });
                          setShowAddArticle(false);
                        }}
                        className="flex-1 py-2 bg-[var(--accent)] text-white text-sm rounded-xl font-semibold"
                      >
                        {isRtl ? 'ذخیره' : 'Save'}
                      </button>
                      <button
                        onClick={() => setShowAddArticle(false)}
                        className="px-4 py-2 bg-[var(--bg-secondary)] text-sm rounded-xl font-semibold"
                      >
                        {isRtl ? 'لغو' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {savedArticles.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-secondary)]">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">{isRtl ? 'هنوز مقاله‌ای ذخیره نشده' : 'No articles saved yet'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedArticles.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-xl p-3 flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{a.title}</p>
                      {a.category && (
                        <span className="chip chip-accent mt-1">{a.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {a.url && (
                        <a href={a.url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-[var(--accent-light)] text-[var(--accent)] transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button onClick={() => deleteSavedArticle(a.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--danger-light)] text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Custom Widgets Section */}
      <SectionWidgets sectionId="world" />
    </div>
  );
}
