import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Lock, Unlock, Search, Calendar, Filter, Archive, Key } from 'lucide-react';
import useAppStore from '../store/appStore';
import { db } from '../db/database';
import soundEngine from '../utils/audio';

export default function HistoryArchive() {
  const { language } = useAppStore();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const location = useLocation();

  const [pin, setPin] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const initialSection = queryParams.get('section') || 'all';

  const [entries, setEntries] = useState([]);
  const [filterSection, setFilterSection] = useState(initialSection);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      await checkPinStatus();
      await loadAllHistory();
    } catch (e) {
      console.error('HistoryArchive init error:', e);
    } finally {
      setLoading(false);
    }
  };

  const checkPinStatus = async () => {
    try {
      const pinSetting = await db.settings.where('key').equals('historyPin').first();
      if (pinSetting && pinSetting.value) {
        setHasPinSet(true);
        setIsLocked(true);
        setPin(pinSetting.value);
      }
    } catch (e) {
      console.warn('PIN check failed:', e);
    }
  };

  const loadAllHistory = async () => {
    try {
      const [journals, gratitudes, finances] = await Promise.all([
        db.journalEntries.toArray().catch(() => []),
        db.gratitudes.toArray().catch(() => []),
        db.finances.toArray().catch(() => []),
      ]);

      const unified = [
        ...journals.map(j => ({
          id: `j-${j.id}`,
          type: 'journal',
          sectionId: j.sectionId || 'selfDiscovery',
          title: j.title || (isRtl ? 'یادداشت' : 'Note'),
          content: j.content || '',
          date: j.date || '',
          timestamp: j.timestamp || (j.date ? new Date(j.date).getTime() : Date.now())
        })),
        ...gratitudes.map(g => ({
          id: `g-${g.id}`,
          type: 'gratitude',
          sectionId: 'gratitude',
          title: isRtl ? 'شکرگزاری روزانه' : 'Daily Gratitude',
          content: [g.item1, g.item2, g.item3].filter(Boolean).map((item, i) => `${i + 1}. ${item}`).join('\n'),
          date: g.date || '',
          timestamp: g.timestamp || (g.date ? new Date(g.date).getTime() : Date.now())
        })),
        ...finances.map(f => ({
          id: `f-${f.id}`,
          type: 'finance',
          sectionId: 'wealth',
          title: f.type === 'income' ? (isRtl ? '💰 درآمد' : '💰 Income') : (isRtl ? '💸 هزینه' : '💸 Expense'),
          content: `${Number(f.amount || 0).toLocaleString()} — ${f.category || ''} ${f.note ? '· ' + f.note : ''}`,
          date: f.date || '',
          timestamp: f.timestamp || (f.date ? new Date(f.date).getTime() : Date.now())
        }))
      ];

      unified.sort((a, b) => b.timestamp - a.timestamp);
      setEntries(unified);
    } catch (e) {
      console.error('loadAllHistory error:', e);
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (pinInput.length < 4) {
      setErrorMsg(isRtl ? 'رمز باید حداقل ۴ رقم باشد' : 'PIN must be at least 4 digits');
      return;
    }
    try {
      // Delete old and insert new to avoid duplicates
      await db.settings.where('key').equals('historyPin').delete();
      await db.settings.add({ key: 'historyPin', value: pinInput });
      setPin(pinInput);
      setHasPinSet(true);
      setIsLocked(false);
      setPinInput('');
      setErrorMsg('');
      soundEngine.playCheckmark();
    } catch (e) {
      console.error('PIN save error:', e);
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pinInput === pin) {
      setIsLocked(false);
      setPinInput('');
      setErrorMsg('');
      soundEngine.playCheckmark();
    } else {
      setErrorMsg(isRtl ? 'رمز اشتباه است' : 'Incorrect PIN');
    }
  };

  const handleRemovePin = async () => {
    try {
      await db.settings.where('key').equals('historyPin').delete();
      setHasPinSet(false);
      setIsLocked(false);
      setPin('');
    } catch (e) {
      console.error('PIN remove error:', e);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (filterSection !== 'all' && e.sectionId !== filterSection) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!(e.title || '').toLowerCase().includes(q) && !(e.content || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [entries, filterSection, searchQuery]);

  const uniqueSections = ['all', ...new Set(entries.map(e => e.sectionId))];

  const getSectionName = (sec) => {
    if (sec === 'all') return isRtl ? 'همه بخش‌ها' : 'All Sections';
    if (sec === 'gratitude') return isRtl ? '🙏 شکرگزاری' : '🙏 Gratitude';
    if (sec === 'wealth') return isRtl ? '💰 مالی' : '💰 Wealth';
    if (sec === 'stroll') return isRtl ? '🛤️ راه‌روها' : '🛤️ Stroll';
    if (sec === 'selfDiscovery') return isRtl ? '🪞 خودشناسی' : '🪞 Self Discovery';
    if (sec === 'mindfulness') return isRtl ? '🧘 مراقبه' : '🧘 Mindfulness';
    if (sec === 'unknown') return isRtl ? '📝 متفرقه' : '📝 Other';
    return sec;
  };

  const getDotColor = (type) => {
    if (type === 'journal') return 'bg-purple-500';
    if (type === 'gratitude') return 'bg-amber-500';
    if (type === 'finance') return 'bg-emerald-500';
    return 'bg-sky-500';
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[var(--bg-primary)] flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-[var(--text-secondary)] text-sm animate-pulse">
          {isRtl ? 'در حال بارگذاری...' : 'Loading...'}
        </div>
      </div>
    );
  }

  // PIN lock screen
  if (isLocked === true) {
    return (
      <div className="w-full min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xs w-full bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border)] shadow-2xl flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
            {isRtl ? 'بایگانی قفل است' : 'Archive is Locked'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
            {isRtl ? 'رمز عبور خود را وارد کنید' : 'Enter your PIN to continue'}
          </p>
          <form onSubmit={handleUnlock} className="w-full flex flex-col gap-3">
            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-purple-500"
              placeholder="••••"
              autoFocus
              maxLength={8}
            />
            {errorMsg && <p className="text-xs text-rose-500 text-center">{errorMsg}</p>}
            <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 active:scale-95 transition-all">
              {isRtl ? 'باز کردن 🔓' : 'Unlock 🔓'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="mt-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center">
              {isRtl ? '← بازگشت' : '← Go Back'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-24 bg-[var(--bg-primary)]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <h1 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                <Archive className="text-amber-500" size={22} />
                {isRtl ? 'تاریخچه و بایگانی' : 'History Archive'}
              </h1>
              <p className="text-[var(--text-secondary)] text-xs mt-0.5">
                {isRtl
                  ? `${filteredEntries.length} مورد یافت شد`
                  : `${filteredEntries.length} entries found`}
              </p>
            </div>
          </div>

          {/* PIN button */}
          <button
            onClick={() => hasPinSet ? handleRemovePin() : setIsLocked('setup')}
            className={`p-2.5 rounded-xl border transition-colors text-xs font-bold flex items-center gap-1.5 ${
              hasPinSet
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={hasPinSet ? (isRtl ? 'حذف رمز' : 'Remove PIN') : (isRtl ? 'تنظیم رمز' : 'Set PIN')}
          >
            {hasPinSet ? <><Unlock size={16} /><span>{isRtl ? 'حذف رمز' : 'Remove PIN'}</span></> : <><Lock size={16} /><span>{isRtl ? 'قفل' : 'Lock'}</span></>}
          </button>
        </div>

        {/* Setup PIN Form */}
        <AnimatePresence>
          {isLocked === 'setup' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-[var(--bg-card)] border border-amber-500/30 rounded-2xl shadow-lg"
            >
              <h3 className="font-bold text-sm mb-3 text-[var(--text-primary)] flex items-center gap-2">
                <Key size={16} className="text-amber-500" />
                {isRtl ? 'تنظیم رمز عبور برای بایگانی' : 'Set Archive PIN'}
              </h3>
              <form onSubmit={handleSetPin} className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className={`flex-1 px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm outline-none focus:border-amber-500 ${isRtl ? 'text-right' : ''}`}
                  placeholder={isRtl ? 'حداقل ۴ رقم...' : 'Min 4 digits...'}
                  maxLength={8}
                  autoFocus
                />
                <button type="submit" className="px-4 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-sm whitespace-nowrap">
                  {isRtl ? 'ذخیره' : 'Save'}
                </button>
                <button type="button" onClick={() => { setIsLocked(false); setErrorMsg(''); setPinInput(''); }} className="px-3 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-sm">
                  ✕
                </button>
              </form>
              {errorMsg && <p className="text-xs text-rose-500 mt-2">{errorMsg}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className={`relative flex-1`}>
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'جستجو در تاریخچه...' : 'Search history...'}
              className={`w-full py-2.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-sm rounded-xl outline-none focus:border-purple-500 ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
            />
          </div>
          <div className="relative">
            <Filter className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] ${isRtl ? 'right-3' : 'left-3'}`} />
            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className={`w-full sm:w-44 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-sm rounded-xl outline-none appearance-none cursor-pointer ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            >
              {uniqueSections.map(sec => (
                <option key={sec} value={sec}>{getSectionName(sec)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty state */}
        {filteredEntries.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🗄️</div>
            <p className="text-[var(--text-secondary)] text-sm">
              {searchQuery || filterSection !== 'all'
                ? (isRtl ? 'موردی با این فیلتر یافت نشد.' : 'No entries match this filter.')
                : (isRtl ? 'هنوز هیچ محتوایی ثبت نشده. شروع کن!' : 'No entries yet. Start adding content!')}
            </p>
          </motion.div>
        )}

        {/* Timeline */}
        {filteredEntries.length > 0 && (
          <div className="space-y-3 relative pb-4">
            <div className={`absolute top-0 bottom-0 w-0.5 bg-[var(--border)] ${isRtl ? 'right-[7px]' : 'left-[7px]'}`} />

            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4) }}
                className={`relative ${isRtl ? 'pr-6' : 'pl-6'}`}
              >
                {/* Timeline dot */}
                <div className={`absolute top-3 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-primary)] ${isRtl ? 'right-0' : 'left-0'} ${getDotColor(entry.type)}`} />

                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-full whitespace-nowrap">
                      {getSectionName(entry.sectionId)}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 shrink-0">
                      <Calendar size={10} />
                      {new Date(entry.timestamp).toLocaleString(isRtl ? 'fa-IR' : 'en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">{entry.title}</h4>
                  {entry.content && (
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
