import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Clock, Send, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAppStore from '../store/appStore';
import { db } from '../db/database';
import soundEngine from '../utils/audio';

export default function TimeCapsule() {
  const { language, addXP } = useAppStore();
  const isRtl = language === 'fa';

  const [capsules, setCapsules] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockDays, setUnlockDays] = useState(30);
  const [openedCapsule, setOpenedCapsule] = useState(null);

  useEffect(() => {
    loadCapsules();
  }, []);

  const loadCapsules = async () => {
    const data = await db.timeCapsules.toArray();
    setCapsules(data.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleBury = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + parseInt(unlockDays));

    await db.timeCapsules.add({
      title: title.trim(),
      content: content.trim(),
      unlockDate: unlockDate.toISOString(),
      isOpened: false,
      createdAt: Date.now()
    });

    setTitle('');
    setContent('');
    soundEngine.playCheckmark();
    addXP(20, 'Buried a Time Capsule');
    loadCapsules();
  };

  const handleOpen = async (capsule) => {
    if (new Date() < new Date(capsule.unlockDate)) {
      soundEngine.playTap(); // Or error sound
      return;
    }

    await db.timeCapsules.update(capsule.id, { isOpened: true });
    soundEngine.playLevelUp(); // Confetti feeling
    setOpenedCapsule({ ...capsule, isOpened: true });
    loadCapsules();
  };

  return (
    <div className="page-container flex flex-col h-[calc(100vh-80px)] overflow-y-auto pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 mb-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white">
            <ArrowLeft size={18} className={isRtl ? 'rotate-180' : ''} />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
              <Clock size={20} />
              <span>{isRtl ? 'کپسول زمان' : 'Time Capsule'}</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {isRtl ? 'نامه‌ای به آینده‌ی خودت بنویس' : 'Write a letter to your future self'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Create Form */}
        <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/10 to-transparent">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-indigo-300">
            <Sparkles size={16} />
            <span>{isRtl ? 'دفن یک کپسول جدید' : 'Bury a New Capsule'}</span>
          </h3>
          <form onSubmit={handleBury} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRtl ? 'عنوان پیام...' : 'Message Title...'}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-indigo-400"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isRtl ? 'به خودِ آینده‌ات چه می‌خواهی بگویی؟ اهدافت، احساساتت...' : 'What do you want to tell your future self?'}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-indigo-400 resize-none"
            />
            <div className="flex items-center justify-between gap-3 bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border)]">
              <span className="text-xs text-[var(--text-secondary)]">
                {isRtl ? 'زمان باز شدن:' : 'Unlock in:'}
              </span>
              <select
                value={unlockDays}
                onChange={(e) => setUnlockDays(e.target.value)}
                className="bg-transparent text-sm font-bold text-indigo-400 outline-none"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <option value={7}>{isRtl ? '۷ روز دیگر' : '7 Days'}</option>
                <option value={30}>{isRtl ? '۱ ماه دیگر' : '1 Month'}</option>
                <option value={90}>{isRtl ? '۳ ماه دیگر' : '3 Months'}</option>
                <option value={180}>{isRtl ? '۶ ماه دیگر' : '6 Months'}</option>
                <option value={365}>{isRtl ? '۱ سال دیگر' : '1 Year'}</option>
                {/* For testing: 0 days */}
                <option value={0}>{isRtl ? 'همین الان (تست)' : 'Right Now (Test)'}</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={16} />
              <span>{isRtl ? 'ارسال به آینده' : 'Send to Future'}</span>
            </button>
          </form>
        </div>

        {/* Capsules List */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[var(--text-secondary)] px-2">
            {isRtl ? 'کپسول‌های دفن شده' : 'Buried Capsules'}
          </h3>
          
          {capsules.length === 0 && (
            <p className="text-xs text-[var(--text-secondary)] text-center py-8">
              {isRtl ? 'هنوز کپسولی دفن نکرده‌اید.' : 'No capsules buried yet.'}
            </p>
          )}

          {capsules.map(capsule => {
            const isReady = new Date() >= new Date(capsule.unlockDate);
            const unlockDateStr = new Date(capsule.unlockDate).toLocaleDateString(isRtl ? 'fa-IR' : 'en-US');

            return (
              <div 
                key={capsule.id} 
                className={`p-5 rounded-3xl border transition-all ${
                  capsule.isOpened 
                    ? 'bg-[var(--bg-card)] border-indigo-500/30' 
                    : isReady 
                      ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                      : 'bg-[var(--bg-secondary)] border-[var(--border)] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-bold text-sm flex items-center gap-2 ${capsule.isOpened || isReady ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {capsule.isOpened ? <Unlock size={16} className="text-indigo-400" /> : <Lock size={16} className={isReady ? 'text-indigo-400 animate-pulse' : ''} />}
                    <span>{capsule.isOpened || isReady ? capsule.title : (isRtl ? 'پیام قفل شده' : 'Locked Message')}</span>
                  </h4>
                  <span className="text-[10px] text-[var(--text-secondary)] px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
                    {unlockDateStr}
                  </span>
                </div>

                {capsule.isOpened ? (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                    {capsule.content}
                  </p>
                ) : (
                  <button
                    onClick={() => handleOpen(capsule)}
                    disabled={!isReady}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isReady 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] cursor-not-allowed'
                    }`}
                  >
                    {isReady 
                      ? (isRtl ? 'باز کردن کپسول!' : 'Open Capsule!') 
                      : (isRtl ? 'هنوز زمانش نرسیده...' : 'Not time yet...')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Opened Capsule */}
      <AnimatePresence>
        {openedCapsule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/50 shadow-2xl relative overflow-hidden"
            >
              {/* Confetti effect using simple CSS animations or static elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-50" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full blur-[80px] opacity-50" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center mb-4 mx-auto">
                  <Unlock size={24} className="text-indigo-300" />
                </div>
                <h2 className="text-xl font-bold text-white text-center mb-2">{openedCapsule.title}</h2>
                <p className="text-xs text-indigo-200 text-center mb-6">
                  {isRtl ? 'پیامی از گذشته به تو' : 'A message from the past'}
                </p>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 mb-6 max-h-60 overflow-y-auto">
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                    {openedCapsule.content}
                  </p>
                </div>
                <button
                  onClick={() => setOpenedCapsule(null)}
                  className="w-full py-3 rounded-xl bg-white text-indigo-950 font-bold text-sm"
                >
                  {isRtl ? 'بستن' : 'Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
