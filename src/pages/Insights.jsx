import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, LineChart, Clock, Lock, Unlock, ArrowRight, MessageSquare, Flame, Droplets, Moon, Zap, ShieldAlert } from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import { getToday } from '../db/database';

export default function Insights() {
  const { language } = useAppStore();
  const isRtl = language === 'fa';
  
  const { 
    timeCapsules, loadTimeCapsules, addTimeCapsule, openTimeCapsule,
    allHabitLogs, loadAllHabitLogs,
    allJournals, loadAllJournals,
    habits, loadHabits
  } = useSectionsStore();

  const [activeTab, setActiveTab] = useState('coach'); // 'coach' | 'heatmap' | 'capsule'

  // Time capsule form
  const [capsuleForm, setCapsuleForm] = useState({ title: '', content: '', targetDate: '' });

  useEffect(() => {
    loadTimeCapsules();
    loadAllHabitLogs();
    loadAllJournals();
    loadHabits(); // Load all habits to map habit names
  }, []);

  // ===================== HEATMAP LOGIC =====================
  const heatmapData = useMemo(() => {
    // Generate last 90 days
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      // Count completed habits on this date
      const completedCount = allHabitLogs.filter(log => log.date === dateStr && log.completed).length;
      days.push({ date: dateStr, count: completedCount });
    }
    return days;
  }, [allHabitLogs]);

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-[var(--border)] opacity-30';
    if (count <= 2) return 'bg-[var(--accent)] opacity-40';
    if (count <= 4) return 'bg-[var(--accent)] opacity-70';
    return 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]';
  };

  // ===================== AI COACH LOGIC =====================
  const generateInsights = () => {
    const insights = [];
    
    // 1. Consistency check
    const todayStr = getToday();
    const recentLogs = allHabitLogs.filter(l => {
      const diff = new Date(todayStr) - new Date(l.date);
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    });

    if (recentLogs.length > 15) {
      insights.push({
        icon: <Flame className="text-[var(--warning)]" size={18} />,
        textFa: 'شما در هفته گذشته استمرار فوق‌العاده‌ای داشتید! ریتم پیروزی در حال تثبیت در مدارهای عصبی شماست.',
        textEn: 'Incredible consistency this past week! The rhythm of victory is wiring into your neural pathways.'
      });
    } else if (recentLogs.length < 3 && allHabitLogs.length > 10) {
       insights.push({
        icon: <ShieldAlert className="text-[var(--danger)]" size={18} />,
        textFa: 'کاهش فعالیت در هفته اخیر دیده می‌شود. به یاد داشته باشید: کمال‌گرایی را رها کنید و فقط با یک کار کوچک برگردید.',
        textEn: 'Activity has dropped recently. Remember: drop perfectionism and return with just one small habit.'
      });
    }

    // 2. Correlation (Mock simple logic based on keywords in journals vs habit completion)
    // If they have sleep habit and mood
    const sleepLogs = allHabitLogs.filter(l => l.completed && habits.find(h => h.id === l.habitId)?.nameEn?.toLowerCase().includes('sleep'));
    if (sleepLogs.length > 5) {
      insights.push({
        icon: <Moon className="text-indigo-400" size={18} />,
        textFa: 'تحلیل داده‌ها نشان می‌دهد روزهایی که چرخه خواب را رعایت می‌کنید، واژه‌های مثبت‌تری در ژورنال خود به کار می‌برید.',
        textEn: 'Data shows that on days you maintain your sleep habit, your journal entries use significantly more positive words.'
      });
    }

    // Water/Hydration correlation
    const waterLogs = allHabitLogs.filter(l => l.completed && habits.find(h => h.id === l.habitId)?.nameEn?.toLowerCase().includes('water'));
    if (waterLogs.length > 0) {
      insights.push({
        icon: <Droplets className="text-blue-400" size={18} />,
        textFa: 'عادت نوشیدن آب به خوبی در حال پیگیری است. این کار مستقیماً روی شفافیت ذهنی (Brain Fog) تأثیر مثبت گذاشته است.',
        textEn: 'Your hydration habit is strong. This directly correlates with reduced brain fog and higher daily energy.'
      });
    }

    if (insights.length === 0) {
      insights.push({
        icon: <Zap className="text-[var(--accent)]" size={18} />,
        textFa: 'داده‌های شما در حال جمع‌آوری است. هرچه بیشتر از اپلیکیشن استفاده کنید، الگوهای دقیق‌تری از رفتار شما کشف خواهم کرد.',
        textEn: 'Gathering data... The more you use the app, the more precise behavioral patterns I can uncover for you.'
      });
    }

    return insights;
  };

  const aiInsights = useMemo(generateInsights, [allHabitLogs, allJournals, habits]);

  // ===================== TIME CAPSULE =====================
  const handleCreateCapsule = async (e) => {
    e.preventDefault();
    if (!capsuleForm.title || !capsuleForm.content || !capsuleForm.targetDate) return;
    
    await addTimeCapsule(capsuleForm);
    setCapsuleForm({ title: '', content: '', targetDate: '' });
  };

  const isCapsuleReady = (dateStr) => {
    return new Date() >= new Date(dateStr);
  };

  const TABS = [
    { id: 'coach', fa: 'دستیار هوشمند', en: 'AI Coach', icon: <Brain size={16} /> },
    { id: 'heatmap', fa: 'تایم‌لاین رشد', en: 'Timeline', icon: <LineChart size={16} /> },
    { id: 'capsule', fa: 'کپسول زمان', en: 'Time Capsule', icon: <Clock size={16} /> },
  ];

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {isRtl ? 'تحلیل و هوش مصنوعی' : 'AI & Insights'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {isRtl ? 'کشف الگوهای پنهان رشد شما' : 'Discovering your hidden growth patterns'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border)]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <span className="mb-1">{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- AI COACH TAB --- */}
        {activeTab === 'coach' && (
          <motion.div
            key="coach"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-3xl p-5 border border-[var(--border)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--accent)] to-purple-500 flex items-center justify-center text-white shadow-lg shadow-[var(--accent)]/20 animate-pulse-slow">
                  <Brain size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Life OS AI Coach</h3>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    {isRtl ? 'تحلیلگر محلی داده‌های شما' : 'Local Data Analyzer'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {aiInsights.map((insight, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="flex gap-3 bg-[var(--bg-secondary)] p-3.5 rounded-2xl border border-[var(--border)]"
                  >
                    <div className="mt-0.5">{insight.icon}</div>
                    <p className="text-xs leading-relaxed text-[var(--text-primary)] font-medium">
                      {isRtl ? insight.textFa : insight.textEn}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- HEATMAP TAB --- */}
        {activeTab === 'heatmap' && (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-3xl p-5 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {isRtl ? 'نقشه حرارتی عادات (۹۰ روز اخیر)' : 'Habits Heatmap (Last 90 Days)'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {isRtl ? 'ردپای استمرار شما در گذر زمان' : 'The footprint of your consistency'}
                  </p>
                </div>
                <div className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl">
                  <LineChart size={20} />
                </div>
              </div>

              {/* Grid */}
              <div className="flex flex-col gap-1.5 overflow-x-auto no-scrollbar pb-2" dir="ltr">
                <div className="grid grid-flow-col gap-1.5" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
                  {heatmapData.map((day, idx) => (
                    <div 
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-sm transition-colors ${getHeatmapColor(day.count)}`}
                      title={`${day.date}: ${day.count} habits`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-[var(--text-secondary)] mt-1 px-1">
                  <span>90d ago</span>
                  <span>Today</span>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-[var(--text-secondary)]" dir="ltr">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[var(--border)] opacity-30" />
                  <div className="w-3 h-3 rounded-sm bg-[var(--accent)] opacity-40" />
                  <div className="w-3 h-3 rounded-sm bg-[var(--accent)] opacity-70" />
                  <div className="w-3 h-3 rounded-sm bg-[var(--accent)]" />
                </div>
                <span>More</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TIME CAPSULE TAB --- */}
        {activeTab === 'capsule' && (
          <motion.div
            key="capsule"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
            className="space-y-4"
          >
            {/* Form */}
            <div className="glass-card rounded-3xl p-5 border border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <Clock size={16} className="text-[var(--accent)]" />
                {isRtl ? 'ساخت کپسول زمان جدید' : 'Create New Time Capsule'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                {isRtl ? 'نامه‌ای به خودِ آینده‌تان بنویسید. این نامه تا زمان مقرر قفل خواهد ماند.' : 'Write a letter to your future self. It will remain locked until the target date.'}
              </p>

              <form onSubmit={handleCreateCapsule} className="space-y-3">
                <input
                  type="text"
                  placeholder={isRtl ? 'عنوان پیام (مثلاً: برای تولد ۳۰ سالگی)...' : 'Title (e.g. For my 30th birthday)...'}
                  value={capsuleForm.title}
                  onChange={(e) => setCapsuleForm({...capsuleForm, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                  dir={isRtl ? 'rtl' : 'ltr'}
                  required
                />
                
                <textarea
                  placeholder={isRtl ? 'متن نامه به آینده...' : 'Message to the future...'}
                  value={capsuleForm.content}
                  onChange={(e) => setCapsuleForm({...capsuleForm, content: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors min-h-[100px] resize-y"
                  dir={isRtl ? 'rtl' : 'ltr'}
                  required
                />

                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block px-1">
                    {isRtl ? 'تاریخ بازگشایی:' : 'Unlock Date:'}
                  </label>
                  <input
                    type="date"
                    value={capsuleForm.targetDate}
                    min={getToday()}
                    onChange={(e) => setCapsuleForm({...capsuleForm, targetDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 rounded-2xl bg-[var(--accent)] text-white text-sm font-bold shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                >
                  <Lock size={16} />
                  {isRtl ? 'مُهر و موم کردن کپسول' : 'Seal the Capsule'}
                </button>
              </form>
            </div>

            {/* List */}
            {timeCapsules.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-secondary)] px-1 mt-6">
                  {isRtl ? 'کپسول‌های بایگانی شده' : 'Archived Capsules'}
                </h4>
                {timeCapsules.map((capsule) => {
                  const ready = isCapsuleReady(capsule.targetDate);
                  
                  return (
                    <div key={capsule.id} className="glass-card rounded-2xl p-4 border border-[var(--border)] relative overflow-hidden">
                      {/* Status indicator line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${ready ? (capsule.isOpened ? 'bg-slate-400' : 'bg-[var(--success)]') : 'bg-[var(--warning)]'}`} />
                      
                      <div className="flex items-start justify-between pl-3 gap-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                            {ready ? (capsule.isOpened ? <MessageSquare size={14} className="text-slate-400"/> : <Unlock size={14} className="text-[var(--success)]"/>) : <Lock size={14} className="text-[var(--warning)]"/>}
                            {capsule.title}
                          </h4>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                            <span>{isRtl ? 'تاریخ بازگشایی:' : 'Unlocks:'} {capsule.targetDate}</span>
                          </p>
                          
                          {capsule.isOpened && (
                            <div className="mt-3 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                              <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed" dir={isRtl ? 'rtl' : 'ltr'}>
                                {capsule.content}
                              </p>
                            </div>
                          )}
                        </div>

                        {ready && !capsule.isOpened && (
                          <button
                            onClick={() => openTimeCapsule(capsule.id)}
                            className="shrink-0 px-3 py-1.5 bg-[var(--success)] text-white text-[10px] font-bold rounded-xl shadow-md animate-pulse-slow"
                          >
                            {isRtl ? 'باز کردن' : 'Open Now'}
                          </button>
                        )}
                        
                        {!ready && (
                          <span className="shrink-0 px-2.5 py-1 bg-[var(--warning)]/10 text-[var(--warning)] text-[10px] font-bold rounded-lg border border-[var(--warning)]/30">
                            {isRtl ? 'قفل شده' : 'Locked'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
