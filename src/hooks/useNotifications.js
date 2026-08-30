import { useState, useEffect } from 'react';
import { db, getToday } from '../db/database';
import soundEngine from '../utils/audio';

const DEFAULT_REMINDERS = [
  { id: 'hydration', titleFa: '💧 نوشیدن آب و هیدراتاسیون', titleEn: '💧 Smart Hydration Alert', bodyFa: 'زمان نوشیدن یک لیوان آب خنک برای حفظ انرژی و شفافیت ذهن!', bodyEn: 'Time to drink a glass of water for focus and energy!', time: '11:00', enabled: true },
  { id: 'mindfulness', titleFa: '🧘 مراقبه و تنفس آگاهانه', titleEn: '🧘 Mindfulness & Breathing', bodyFa: '۳ دقیقه توقف آگاهانه و تنفس ۴-۷-۸ برای ریست کردن سیستم عصبی.', bodyEn: '3-minute mindful breathing to reset your nervous system.', time: '08:30', enabled: true },
  { id: 'security_review', titleFa: '🛡️ چک‌لیست امنیت و رصد روزانه', titleEn: '🛡️ Security & Integrity Review', bodyFa: 'آیا امروز به تعهداتت وفادار بودی؟ امنیت روانی و داده‌هایت را چک کن.', bodyEn: 'Review daily commitments and psychological integrity.', time: '21:00', enabled: true },
  { id: 'sleep_hygiene', titleFa: '🌙 آماده‌سازی خواب و خاموشی دیجیتال', titleEn: '🌙 Sleep Hygiene & Darkness', bodyFa: 'مانیتورها را خاموش کنید و برای ترشح ملاتونین به تاریکی بروید.', bodyEn: 'Power down screens and prepare for deep restorative sleep.', time: '22:30', enabled: true },
];

export default function useNotifications() {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  
  const [permission, setPermission] = useState(
    isSupported ? Notification.permission : 'default'
  );

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('lifeos_reminders');
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  });

  const requestPermission = async () => {
    if (!isSupported) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  };

  const sendLocalNotification = async (title, options = {}) => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          vibrate: [200, 100, 200, 100, 300],
          requireInteraction: true,
          ...options
        });
        return true;
      } else {
        new Notification(title, {
          icon: '/icons/icon-192.png',
          ...options
        });
        return true;
      }
    } catch (e) {
      console.warn('Notification trigger error:', e);
      return false;
    }
  };

  const testNotification = async () => {
    soundEngine.playAlarm();
    window.dispatchEvent(new CustomEvent('lifeos_alarm', {
      detail: {
        id: 'test',
        titleFa: '⏰ زنگ و یادآور آزمایشی سیستم عامل زندگی‌ساز',
        titleEn: '⏰ Test Alarm & Reminder Notification',
        bodyFa: 'سیستم آلارم صوتی و نوتیفیکیشن‌های وظایف و عادت‌ها با موفقیت فعال شد!',
        bodyEn: 'Audio alarm and notifications for tasks and habits are active!',
        type: 'test'
      }
    }));
    return await sendLocalNotification('🪐 سیستم عامل زندگی‌ساز (Life OS)', {
      body: 'نوتیفیکیشن‌های آفلاین و مستقل با موفقیت فعال و هماهنگ شدند!',
      tag: 'test_notification'
    });
  };

  const toggleReminder = (id) => {
    const updated = reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setReminders(updated);
    localStorage.setItem('lifeos_reminders', JSON.stringify(updated));
  };

  const updateReminderTime = (id, newTime) => {
    const updated = reminders.map(r => r.id === id ? { ...r, time: newTime } : r);
    setReminders(updated);
    localStorage.setItem('lifeos_reminders', JSON.stringify(updated));
  };

  // Background check interval for scheduled reminder times (Reminders, Tasks, Habits)
  useEffect(() => {
    const checkSchedule = async () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;
      const lastTriggerKey = `last_notif_${currentTimeStr}`;

      if (sessionStorage.getItem(lastTriggerKey)) return;

      let triggeredAny = false;

      // 1. Check Global System Reminders
      reminders.forEach(r => {
        if (r.enabled && r.time === currentTimeStr) {
          triggeredAny = true;
          soundEngine.playAlarm();
          sendLocalNotification(r.titleFa || r.title, {
            body: r.bodyFa || r.body,
            tag: `scheduled_${r.id}`
          });
          window.dispatchEvent(new CustomEvent('lifeos_alarm', {
            detail: {
              id: r.id,
              titleFa: r.titleFa || r.title,
              titleEn: r.titleEn || r.title,
              bodyFa: r.bodyFa || r.body,
              bodyEn: r.bodyEn || r.body,
              type: 'reminder'
            }
          }));
        }
      });

      // 2. Check Daily Tasks with Alarm/DueTime
      try {
        const today = getToday();
        const pendingTasks = await db.tasks.where('date').equals(today).toArray();
        pendingTasks.forEach(task => {
          const taskTime = task.dueTime || task.alarmTime;
          if (!task.completed && (task.reminder || taskTime) && taskTime === currentTimeStr) {
            triggeredAny = true;
            soundEngine.playAlarm();
            sendLocalNotification(`🔔 یادآوری وظیفه: ${task.title}`, {
              body: `زمان انجام این وظیفه فرا رسیده است (${currentTimeStr}).`,
              tag: `task_alarm_${task.id}`
            });
            window.dispatchEvent(new CustomEvent('lifeos_alarm', {
              detail: {
                id: task.id,
                titleFa: `🔔 یادآوری وظیفه: ${task.title}`,
                titleEn: `🔔 Task Alarm: ${task.title}`,
                bodyFa: `زمان تعیین‌شده برای انجام این وظیفه فرا رسیده است.`,
                bodyEn: `Scheduled time for this task has arrived.`,
                type: 'task',
                task
              }
            }));
          }
        });
      } catch (err) {
        console.warn('Error checking tasks schedule:', err);
      }

      // 3. Check Habits with ReminderTime
      try {
        const today = getToday();
        const allHabits = await db.habits.toArray();
        const todayLogs = await db.habitLogs.where('date').equals(today).toArray();
        const doneHabitIds = new Set(todayLogs.filter(l => l.completed).map(l => l.habitId));

        allHabits.forEach(habit => {
          const habitTime = habit.reminderTime || habit.alarmTime || habit.dueTime;
          if (habitTime === currentTimeStr && !doneHabitIds.has(habit.id)) {
            triggeredAny = true;
            const habitTitle = habit.nameFa || habit.name || habit.title || 'عادت روزانه';
            soundEngine.playAlarm();
            sendLocalNotification(`⏰ زنگ عادت روزانه: ${habitTitle}`, {
              body: `وقت انجام عادت ${habitTitle} است! (${currentTimeStr})`,
              tag: `habit_alarm_${habit.id}`
            });
            window.dispatchEvent(new CustomEvent('lifeos_alarm', {
              detail: {
                id: habit.id,
                titleFa: `⏰ زنگ عادت روزانه: ${habitTitle}`,
                titleEn: `⏰ Habit Alarm: ${habit.nameEn || habit.name || 'Daily Habit'}`,
                bodyFa: `زمان پایبندی به این عادت فرا رسیده است.`,
                bodyEn: `Time to fulfill this daily habit.`,
                type: 'habit',
                habit
              }
            }));
          }
        });
      } catch (err) {
        console.warn('Error checking habits schedule:', err);
      }

      if (triggeredAny) {
        sessionStorage.setItem(lastTriggerKey, 'true');
      }
    };

    const interval = setInterval(checkSchedule, 20000); // Check every 20 seconds
    return () => clearInterval(interval);
  }, [permission, reminders]);

  return {
    permission,
    isSupported,
    reminders,
    requestPermission,
    sendLocalNotification,
    testNotification,
    toggleReminder,
    updateReminderTime
  };
}
