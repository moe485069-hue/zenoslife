import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Plus, CheckCircle2, Clock, Bell, BellOff, Tag, Filter, Check, Trash2, Sparkles, AlertCircle
} from 'lucide-react';
import useTasksStore from '../store/tasksStore';
import useAppStore from '../store/appStore';
import CalendarView from '../components/calendar/CalendarView';
import TaskItem from '../components/calendar/TaskItem';
import useNotifications from '../hooks/useNotifications';
import soundEngine from '../utils/audio';

const SECTION_OPTIONS = [
  { id: 'mindfulness', nameFa: 'مراقبه و ورزش', icon: '🧘', color: '#10b981' },
  { id: 'learning', nameFa: 'یادگیری و مطالعه', icon: '📚', color: '#6366f1' },
  { id: 'selfDiscovery', nameFa: 'خودشناسی', icon: '🪞', color: '#a855f7' },
  { id: 'wealth', nameFa: 'درآمد و مالی', icon: '💰', color: '#22c55e' },
  { id: 'world', nameFa: 'ایران و جهان', icon: '🌍', color: '#f97316' },
  { id: 'integrity', nameFa: 'درستی و اخلاق', icon: '💎', color: '#eab308' },
  { id: 'general', nameFa: 'کارهای عمومی', icon: '📌', color: '#64748b' }
];

export default function Calendar() {
  const { 
    tasks, selectedDate, setSelectedDate, calendarMode, setCalendarMode,
    loadTasks, addTask, deleteTask, toggleTask 
  } = useTasksStore();
  const { language, addXP } = useAppStore();
  const { permission, requestPermission } = useNotifications();
  const isRtl = language === 'fa';

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'completed'

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(selectedDate || '');
  const [taskTime, setTaskTime] = useState('10:00');
  const [taskPriority, setTaskPriority] = useState('medium'); // 'high' | 'medium' | 'low'
  const [taskSection, setTaskSection] = useState('general');
  const [taskReminder, setTaskReminder] = useState(true);
  const [taskRepeat, setTaskRepeat] = useState('none');

  useEffect(() => {
    loadTasks(selectedDate);
  }, [selectedDate, loadTasks]);

  useEffect(() => {
    setTaskDate(selectedDate);
  }, [selectedDate]);

  const handleToggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    toggleTask(id);
    if (task && !task.completed) {
      soundEngine.playCheckmark();
      addXP(15, 'تکمیل تسک تقویم');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    await addTask({
      title: taskTitle.trim(),
      date: taskDate || selectedDate,
      dueTime: taskTime,
      priority: taskPriority,
      sectionId: taskSection,
      reminder: taskReminder,
      repeat: taskRepeat,
      completed: false
    });

    soundEngine.playCheckmark();
    addXP(10, 'افزودن تسک جدید');

    setTaskTitle('');
    setIsAddTaskModalOpen(false);
  };

  const selectedDateTasks = tasks.filter((t) => t.date === selectedDate);
  const filteredTasks = selectedDateTasks.filter((t) => {
    if (filterTab === 'pending') return !t.completed;
    if (filterTab === 'completed') return t.completed;
    return true;
  });

  const completedCount = selectedDateTasks.filter((t) => t.completed).length;

  return (
    <div className="page-container flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CalendarIcon className="text-[var(--accent)]" size={24} />
            <span>{isRtl ? 'تقویم هوشمند و چک‌لیست کارها' : 'Smart Calendar & Task Ledger'}</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isRtl ? 'برنامه‌ریزی با تقویم شمسی و میلادی، اولویت‌بندی تسک‌ها و یادآور اعلان' : 'Plan with Jalali & Gregorian calendar, prioritize tasks & set reminders'}
          </p>
        </div>

        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>{isRtl ? 'تسک جدید' : 'New Task'}</span>
        </button>
      </div>

      {/* Notification Banner if not granted */}
      {permission !== 'granted' && (
        <div className="p-3.5 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Bell size={18} className="text-[var(--accent)] flex-shrink-0" />
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? 'برای دریافت هشدارهای به موقع تسک‌ها، اجازه ارسال اعلان را فعال کنید.' : 'Enable notifications to receive timely reminders for your tasks.'}
            </span>
          </div>
          <button
            onClick={requestPermission}
            className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-sm flex-shrink-0 hover:opacity-90"
          >
            {isRtl ? 'فعال‌سازی' : 'Enable'}
          </button>
        </div>
      )}

      {/* DUAL CALENDAR VIEW */}
      <CalendarView
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        tasks={tasks}
        mode={calendarMode}
        onModeChange={setCalendarMode}
      />

      {/* TASKS FOR SELECTED DAY */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <span>📋</span>
              {isRtl ? `کارهای تاریخ ${selectedDate}` : `Tasks for ${selectedDate}`}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {completedCount} {isRtl ? 'از' : 'of'} {selectedDateTasks.length} {isRtl ? 'تسک انجام شد' : 'completed'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                filterTab === 'all' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)]'
              }`}
            >
              {isRtl ? 'همه' : 'All'}
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                filterTab === 'pending' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)]'
              }`}
            >
              {isRtl ? 'ناتمام' : 'Pending'}
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                filterTab === 'completed' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)]'
              }`}
            >
              {isRtl ? 'انجام‌شده' : 'Done'}
            </button>
          </div>
        </div>

        {/* Task list */}
        {filteredTasks.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => handleToggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[var(--text-secondary)]">
            {isRtl ? 'کاری برای این تاریخ ثبت نشده است. روی "تسک جدید" بزنید.' : 'No tasks for this date. Tap "New Task" to create one.'}
          </div>
        )}
      </div>

      {/* MODAL: ADD TASK */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-3xl border border-[var(--border)]"
            style={{ background: 'var(--bg-card)' }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? 'افزودن کار و برنامه جدید' : 'Add New Task'}
            </h3>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'عنوان کار یا برنامه *' : 'Task Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: جلسه تمرین تنفس، مطالعه کتاب...' : 'e.g., Breathwork session...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {isRtl ? 'تاریخ انجام' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {isRtl ? 'ساعت یا زمان' : 'Time'}
                  </label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'سطح اولویت' : 'Priority Level'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: isRtl ? 'عادی' : 'Low', color: 'var(--success)' },
                    { id: 'medium', label: isRtl ? 'متوسط' : 'Medium', color: 'var(--warning)' },
                    { id: 'high', label: isRtl ? 'فوری و مهم' : 'High', color: 'var(--danger)' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTaskPriority(p.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        taskPriority === p.id
                          ? 'shadow-md scale-102 font-black'
                          : 'opacity-60 bg-[var(--bg-secondary)] border-[var(--border)]'
                      }`}
                      style={{
                        borderColor: taskPriority === p.id ? p.color : undefined,
                        backgroundColor: taskPriority === p.id ? `${p.color}20` : undefined,
                        color: taskPriority === p.id ? p.color : 'var(--text-secondary)'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Association */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'بخش مرتبط در زندگی‌ساز' : 'Associated Section'}
                </label>
                <select
                  value={taskSection}
                  onChange={(e) => setTaskSection(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {SECTION_OPTIONS.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.icon} {isRtl ? sec.nameFa : sec.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reminder toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[var(--accent)]" />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {isRtl ? 'هشدار و یادآوری نوتیفیکیشن' : 'Send Reminder Alert'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={taskReminder}
                  onChange={(e) => setTaskReminder(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)]"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90"
                >
                  {isRtl ? 'افزودن تسک (+۱۰ XP)' : 'Create Task (+10 XP)'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
