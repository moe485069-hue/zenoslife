import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Plus, Sparkles, Trash2, ArrowRight, ArrowLeft, Link as LinkIcon,
  Search, Eye, Layers, Compass, HelpCircle, X, Check, BookOpen, Heart, DollarSign
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import BrainGraphCanvas from '../components/brain/BrainGraphCanvas';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';

export default function BrainGraph() {
  const { language, addXP, addCoins } = useAppStore();
  const isRtl = language === 'fa';

  const {
    links, loadLinks, addLink, deleteLink,
    journalEntries, loadJournals,
    financeGoals, loadFinances,
    habits, loadHabits,
    timeCapsules, loadTimeCapsules
  } = useSectionsStore();

  const [selectedNode, setSelectedNode] = useState(null);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for creating link
  const [linkForm, setLinkForm] = useState({
    sourceDomain: 'selfDiscovery',
    sourceTitle: '',
    targetDomain: 'wealth',
    targetTitle: '',
    relation: 'انگیزه و ریشه برای'
  });

  useEffect(() => {
    loadLinks();
    if (loadJournals) loadJournals();
    if (loadFinances) loadFinances();
    if (loadHabits) loadHabits();
    if (loadTimeCapsules) loadTimeCapsules();
  }, []);

  // Aggregate all items in database into unified Graph Nodes
  const graphNodes = useMemo(() => {
    const nodes = [];

    // 1. Journal entries
    if (journalEntries && journalEntries.length > 0) {
      journalEntries.forEach(j => {
        nodes.push({
          id: `journal-${j.id}`,
          rawId: j.id,
          title: j.title || j.content?.slice(0, 24) || 'ژورنال تفکر',
          domain: 'selfDiscovery',
          content: j.content,
          date: j.date
        });
      });
    } else {
      nodes.push(
        { id: '1', rawId: 1, title: 'ژورنال: ریشه‌یابی ترس از فقر', domain: 'selfDiscovery', content: 'بررسی ریشه‌های ناامنی مالی در دوران کودکی و نیاز به ثبات.' },
        { id: '2', rawId: 2, title: 'ژورنال: کشف صدای درون و رسالت', domain: 'selfDiscovery', content: 'چه چیزی به من احساس سرزندگی عمیق و اشتیاق پایدار می‌دهد؟' }
      );
    }

    // 2. Financial Goals
    if (financeGoals && financeGoals.length > 0) {
      financeGoals.forEach(g => {
        nodes.push({
          id: `goal-${g.id}`,
          rawId: g.id,
          title: `هدف مالی: ${g.title}`,
          domain: 'wealth',
          content: `مبلغ هدف: ${g.targetAmount} • مهلت: ${g.deadline || 'تعیین نشده'}`
        });
      });
    } else {
      nodes.push(
        { id: '3', rawId: 3, title: 'هدف مالی: صندوق پس‌انداز ۶ ماهه', domain: 'wealth', content: 'ایجاد سپر مالی نفوذناپذیر برای آرامش روان.' }
      );
    }

    // 3. Learning Concepts
    nodes.push(
      { id: '4', rawId: 4, title: 'یادگیری: قانون سرمایه‌گذاری ۵۰/۳۰/۲۰', domain: 'learning', content: 'مدیریت ۵۰٪ نیازها، ۳۰٪ خواسته‌ها، ۲۰٪ پس‌انداز و سرمایه‌گذاری مرکب.' },
      { id: '5', rawId: 5, title: 'کوانتوم: درهم‌تنیدگی و اثر ناظر', domain: 'learning', content: 'عمل مشاهده‌گری مستقیماً وضعیت سیستم را تعیین می‌کند.' },
      { id: '6', rawId: 6, title: 'وحدت کیهانی: پیوند با کائنات', domain: 'cosmic', content: 'همه اتم‌های کالبد ما زاده انفجار ستارگان کهن هستند.' },
      { id: '7', rawId: 7, title: 'عادت: ۲۰ دقیقه مراقبه سکوت', domain: 'mindfulness', content: 'تمرین روزانه تنفس آگاهانه و مشاهده بی‌برچسب افکار.' },
      { id: '8', rawId: 8, title: 'عادت: ۲ لیتر آب و خواب منظم', domain: 'health', content: 'پایه‌ریزی هورمونی و بیولوژیک برای جلوگیری از خستگی مغز.' },
      { id: '9', rawId: 9, title: 'تعهد: راستگویی و شکرگزاری', domain: 'integrity', content: 'همسویی کردار بیرونی با ارزش‌های بنیادین درون.' }
    );

    // Filter by search query if any
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return nodes.filter(n => n.title.toLowerCase().includes(q) || (n.content && n.content.toLowerCase().includes(q)));
    }

    return nodes;
  }, [journalEntries, financeGoals, searchQuery]);

  // Links connected to selected node
  const nodeLinks = useMemo(() => {
    if (!selectedNode) return [];
    return links.filter(l => 
      String(l.sourceId) === String(selectedNode.id) || 
      String(l.targetId) === String(selectedNode.id) ||
      l.sourceTitle?.includes(selectedNode.title) ||
      l.targetTitle?.includes(selectedNode.title)
    );
  }, [selectedNode, links]);

  const handleCreateLink = async (e) => {
    e.preventDefault();
    if (!linkForm.sourceTitle || !linkForm.targetTitle) return;

    await addLink({
      sourceId: String(Date.now()),
      sourceType: linkForm.sourceDomain,
      sourceTitle: linkForm.sourceTitle,
      targetId: String(Date.now() + 1),
      targetType: linkForm.targetDomain,
      targetTitle: linkForm.targetTitle,
      relation: linkForm.relation
    });

    haptics.levelUp();
    soundEngine.playLevelUp();
    addXP(30, 'Created Brain Synapse Link');
    addCoins(15, 'Brain Synapse Bonus');
    setIsAddLinkModalOpen(false);
    setLinkForm({
      sourceDomain: 'selfDiscovery',
      sourceTitle: '',
      targetDomain: 'wealth',
      targetTitle: '',
      relation: 'انگیزه و ریشه برای'
    });
  };

  const RELATIONS = [
    { fa: 'ریشه روانی و انگیزه برای', en: 'Psychological root for' },
    { fa: 'راهبرد و ابزار اجرایی', en: 'Execution strategy for' },
    { fa: 'پارادایم و خرد حاکم بر', en: 'Guiding paradigm of' },
    { fa: 'ایجاد وضوح ذهنی برای', en: 'Mental clarity for' },
    { fa: 'تطبیق و همسویی اخلاقی با', en: 'Ethical alignment with' },
  ];

  return (
    <div className="page-container pb-24 flex flex-col gap-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-purple-500/25">
            🗺️
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
              {isRtl ? 'شبکه ارتباطات ذهنی (Brain Graph)' : 'Zettelkasten Brain Graph'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {isRtl ? 'پیوند یکپارچه خودشناسی، ثروت، یادگیری و کیهان' : 'Unified Cross-Domain Idea Mapping'}
            </p>
          </div>
        </div>

        {/* Action Button: Create Cross-Domain Link */}
        <button
          onClick={() => { setIsAddLinkModalOpen(true); haptics.tap(); }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-purple-600 text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus size={15} />
          <span>{isRtl ? 'افزودن پیوند بین‌حوزه‌ای' : 'Connect New Ideas'}</span>
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={15} className={`absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'} text-[var(--text-secondary)]`} />
        <input
          type="text"
          placeholder={isRtl ? 'جستجو در گره‌ها و مفاهیم پیوندخورده...' : 'Search nodes and linked concepts...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full py-2.5 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-xs rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]`}
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Visual SVG Network Graph Canvas */}
      <BrainGraphCanvas
        nodes={graphNodes}
        links={links}
        selectedNodeId={selectedNode?.id}
        onSelectNode={(node) => setSelectedNode(node)}
      />

      {/* NODE INSPECTOR DRAWER (When a node is selected) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-5 rounded-3xl border border-[var(--accent)]/50 relative overflow-hidden shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedNode.domainConfig?.icon || '💡'}</span>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                    {selectedNode.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] font-bold">
                    {selectedNode.domainConfig?.labelFa || selectedNode.domain}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            {selectedNode.content && (
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] mb-4">
                {selectedNode.content}
              </p>
            )}

            {/* Connected Synapses */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <LinkIcon size={13} className="text-[var(--accent)]" />
                <span>{isRtl ? 'پیوندهای سیناپسی با این ایده:' : 'Synaptic Connections:'}</span>
              </h4>

              {nodeLinks.length > 0 ? (
                <div className="space-y-2">
                  {nodeLinks.map((l, idx) => (
                    <div
                      key={l.id || idx}
                      className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">{l.sourceTitle}</span>
                        <span className="text-[10px] text-[var(--accent)] font-semibold px-2 py-0.5 rounded-lg bg-[var(--accent)]/10">
                          {l.relation}
                        </span>
                        <span className="font-bold text-[var(--text-primary)]">{l.targetTitle}</span>
                      </div>

                      {l.id && (
                        <button
                          onClick={() => { deleteLink(l.id); haptics.tap(); }}
                          className="p-1 text-[var(--text-secondary)] hover:text-rose-500"
                          title={isRtl ? 'حذف پیوند' : 'Delete Link'}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[var(--text-secondary)] italic">
                  {isRtl ? 'هنوز اتصالی برای این گره ثبت نشده است.' : 'No connections yet for this node.'}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALL SYNAPTIC CONNECTIONS FEED */}
      <div className="glass-card p-5 rounded-3xl border border-[var(--border)] space-y-3">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Layers size={16} className="text-[var(--accent)]" />
          <span>{isRtl ? 'فهرست پیوندهای فعال مغز' : 'All Active Brain Synapses'}</span>
          <span className="text-xs text-[var(--text-secondary)]">({links.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {links.map((link, idx) => (
            <div
              key={link.id || idx}
              className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between gap-2 hover:border-[var(--accent)] transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {link.sourceTitle}
                </div>
                <div className="text-[10px] text-[var(--accent)] font-semibold flex items-center gap-1 my-1">
                  <span>↳</span>
                  <span>{link.relation}</span>
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {link.targetTitle}
                </div>
              </div>

              {link.id && (
                <button
                  onClick={() => { deleteLink(link.id); haptics.tap(); }}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CREATE CROSS-DOMAIN LINK */}
      {isAddLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-3xl border border-[var(--border)] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <LinkIcon size={16} className="text-[var(--accent)]" />
                {isRtl ? 'ایجاد پیوند و سیناپس جدید بین ایده‌ها' : 'Create Synaptic Idea Connection'}
              </h3>
              <button onClick={() => setIsAddLinkModalOpen(false)} className="p-1 text-[var(--text-secondary)]">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isRtl
                ? 'یک مفهوم یا ژورنال را به هدفی در دنیای مالی یا درسی در یادگیری متصل کنید تا یکپارچگی ذهن تقویت شود.'
                : 'Connect an insight from your journal to a financial target or a learning concept.'}
            </p>

            <form onSubmit={handleCreateLink} className="space-y-3">
              {/* Source Item */}
              <div>
                <label className="text-[11px] text-[var(--text-secondary)] block mb-1">
                  {isRtl ? 'ایده / ژورنال مبدأ:' : 'Source Idea / Journal:'}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? 'مثلاً: ژورنال غلبه بر ترس از ریسک...' : 'e.g. Journal on overcoming risk...'}
                  value={linkForm.sourceTitle}
                  onChange={(e) => setLinkForm({ ...linkForm, sourceTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  dir={isRtl ? 'rtl' : 'ltr'}
                  required
                />
              </div>

              {/* Relationship Tag */}
              <div>
                <label className="text-[11px] text-[var(--text-secondary)] block mb-1">
                  {isRtl ? 'نوع پیوند و رابطه:' : 'Relationship Type:'}
                </label>
                <select
                  value={linkForm.relation}
                  onChange={(e) => setLinkForm({ ...linkForm, relation: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                >
                  {RELATIONS.map((r, i) => (
                    <option key={i} value={isRtl ? r.fa : r.en}>
                      {isRtl ? r.fa : r.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Item */}
              <div>
                <label className="text-[11px] text-[var(--text-secondary)] block mb-1">
                  {isRtl ? 'هدف / مفهوم مقصد:' : 'Target Goal / Concept:'}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? 'مثلاً: هدف مالی سرمایه‌گذاری در بورس...' : 'e.g. Investment portfolio goal...'}
                  value={linkForm.targetTitle}
                  onChange={(e) => setLinkForm({ ...linkForm, targetTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  dir={isRtl ? 'rtl' : 'ltr'}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-purple-600 text-white text-xs font-bold shadow-lg hover:opacity-95"
              >
                {isRtl ? 'برقراری پیوند (+۳۰ XP و ۱۵ 🪙)' : 'Establish Connection (+30 XP & 15 Coins)'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
