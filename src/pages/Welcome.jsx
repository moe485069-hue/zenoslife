import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import jalaali from 'jalaali-js';
import { 
  Sun, Moon, Sparkles, Footprints, Flame, 
  Gamepad2, Calendar as CalendarIcon, Wallet, 
  Activity, BookOpen, ChevronLeft, Edit3, Check, X
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useTasksStore from '../store/tasksStore';
import { db, getToday } from '../db/database';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export default function Welcome() {
  const navigate = useNavigate();
  const { language, theme, userProfile, setUserProfile, coins, xp, level } = useAppStore();
  const { tasks } = useTasksStore();
  const isRtl = language === 'fa';

  const [greeting, setGreeting] = useState({ title: '', icon: <Sun /> });
  const [currentDate, setCurrentDate] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile?.fullName || 'مدیر');

  useEffect(() => {
    // Set Time Greeting
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting({ title: isRtl ? 'صبح بخیر' : 'Good Morning', icon: <Sun className="text-amber-500" size={28} /> });
    } else if (hour >= 12 && hour < 18) {
      setGreeting({ title: isRtl ? 'ظهر بخیر' : 'Good Afternoon', icon: <Sun className="text-orange-500" size={28} /> });
    } else {
      setGreeting({ title: isRtl ? 'شب بخیر' : 'Good Evening', icon: <Moon className="text-indigo-400" size={28} /> });
    }

    // Set Date
    const now = new Date();
    const jDate = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const dateStr = isRtl 
      ? `${jDate.jd} ${JALALI_MONTHS[jDate.jm - 1]} ${jDate.jy}`
      : now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    setCurrentDate(dateStr);

    // Calculate completed tasks for today
    const loadTodayStats = async () => {
      try {
        const todayStr = getToday();
        const allTasks = await db.tasks.where('date').equals(todayStr).toArray();
        const completed = allTasks.filter(t => t.completed).length;
        
        const allHabits = await db.habitLogs.where('date').equals(todayStr).toArray();
        const completedHabits = allHabits.filter(h => h.completed).length;
        
        setCompletedCount(completed + completedHabits);
      } catch (err) {
        console.error("Failed to load today stats", err);
      }
    };
    loadTodayStats();
  }, [isRtl]);

  const handleNav = (path) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    navigate(path);
  };

  const cards = [
    {
      id: 'my-day',
      title: isRtl ? 'امروز من' : 'My Day',
      desc: isRtl ? 'برنامه روزانه، کارها و عادت‌ها' : 'Daily plan, tasks & habits',
      icon: <Flame size={36} />,
      color: 'bg-emerald-500',
      path: '/my-day'
    },
    {
      id: 'stroll',
      title: isRtl ? 'قدم زدن' : 'Stroll',
      desc: isRtl ? 'آرامش ذهن و کاهش استرس' : 'Mindfulness & relaxation',
      icon: <Footprints size={36} />,
      color: 'bg-purple-500',
      path: '/stroll'
    },
    {
      id: 'calendar',
      title: isRtl ? 'تقویم' : 'Calendar',
      desc: isRtl ? 'مشاهده روزهای گذشته و آینده' : 'View past and future days',
      icon: <CalendarIcon size={36} />,
      color: 'bg-amber-500',
      path: '/calendar'
    },
    {
      id: 'games',
      title: isRtl ? 'سرگرمی' : 'Games',
      desc: isRtl ? 'بازی‌های فکری و تقویت حافظه' : 'Brain games & fun',
      icon: <Gamepad2 size={36} />,
      color: 'bg-rose-500',
      path: '/games'
    },
    {
      id: 'mentor',
      title: isRtl ? 'مشاور' : 'AI Mentor',
      desc: isRtl ? 'راهنما و همراه هوشمند شما' : 'Your intelligent guide',
      icon: <Sparkles size={36} />,
      color: 'bg-sky-500',
      path: '/ai-mentor'
    },
    {
      id: 'dashboard',
      title: isRtl ? 'بیشتر...' : 'More...',
      desc: isRtl ? 'امور مالی، نمودارها و امکانات پیشرفته' : 'Finance, charts & advanced tools',
      icon: <Activity size={36} />,
      color: 'bg-indigo-500',
      path: '/dashboard'
    }
  ];

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col gap-6">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-5 rounded-3xl shadow-sm border border-[var(--border)]"
      >
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center flex-wrap gap-2">
            {greeting.icon}
            
            {isEditingName ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (nameInput.trim()) {
                    setUserProfile({ fullName: nameInput.trim() });
                    setIsEditingName(false);
                    soundEngine.playCheckmark?.();
                    haptics.success?.();
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={isRtl ? 'نام شما...' : 'Your name...'}
                  autoFocus
                  className="px-3 py-1 rounded-xl bg-black/20 border border-amber-500/50 text-base font-black text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-amber-400 w-36 sm:w-44"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold transition-all shadow-xs"
                  title={isRtl ? 'ذخیره نام' : 'Save'}
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white transition-all"
                  title={isRtl ? 'انصراف' : 'Cancel'}
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[var(--text-primary)]">
                  {greeting.title}، {userProfile?.fullName || (isRtl ? 'مدیر' : 'User')}
                </h1>
                <button
                  onClick={() => {
                    setNameInput(userProfile?.fullName || 'مدیر');
                    setIsEditingName(true);
                    soundEngine.playTap?.();
                    haptics.tap?.();
                  }}
                  className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                  title={isRtl ? 'ویرایش نام شما' : 'Edit name'}
                >
                  <Edit3 size={13} />
                  <span className="text-[10px] hidden sm:inline">{isRtl ? 'تغییر نام' : 'Edit'}</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">
            {isRtl ? 'امروز' : 'Today'}: <span className="font-bold text-[var(--text-primary)]">{currentDate}</span>
          </p>
        </div>
        
        {/* User Level/Avatar (Simple) */}
        <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0 p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] self-start sm:self-auto">
          <span className="text-2xl mb-0.5">🌟</span>
          <span className="text-xs font-black text-[var(--text-primary)]">{isRtl ? 'سطح' : 'Level'} {level}</span>
        </div>
      </motion.div>

      {/* Daily Progress Minimal */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => handleNav('/my-day')}
        className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-emerald-700 dark:text-emerald-400">
              {isRtl ? 'وضعیت امروز شما' : 'Your Status Today'}
            </h2>
            <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
              {completedCount > 0 
                ? (isRtl ? `شما امروز ${completedCount} کار/عادت مفید انجام داده‌اید. عالیه!` : `You have completed ${completedCount} tasks/habits today. Great job!`)
                : (isRtl ? 'هنوز کاری برای امروز ثبت نشده. بزن بریم!' : "Nothing logged for today yet. Let's go!")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <ChevronLeft className={isRtl ? '' : 'rotate-180'} size={24} />
          </div>
        </div>
      </motion.div>

      {/* Main Big Grid Navigation */}
      <div>
        <h3 className="text-base font-black text-[var(--text-secondary)] mb-4 px-2">
          {isRtl ? 'بخش‌های اصلی' : 'Main Sections'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + (idx * 0.05) }}
              onClick={() => handleNav(card.path)}
              className="group cursor-pointer bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-5 flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md hover:border-[var(--text-secondary)] transition-all active:scale-95"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <div>
                <h4 className="text-lg font-black text-[var(--text-primary)] mb-1">
                  {card.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
