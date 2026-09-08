import { create } from 'zustand';
import { db, getToday } from '../db/database';

const useTasksStore = create((set, get) => ({
  tasks: [],
  selectedDate: getToday(),
  calendarMode: 'jalali',
  
  loadTasks: async (date = get().selectedDate) => {
    const targetDate = date || getToday();
    const tasks = await db.tasks.where('date').equals(targetDate).toArray();
    set({ tasks, selectedDate: targetDate });
    return tasks;
  },
  
  addTask: async (task) => {
    const targetDate = task.date || get().selectedDate || getToday();
    const id = await db.tasks.add({ 
      ...task, 
      date: targetDate,
      completed: !!task.completed,
      priority: task.priority || 'medium',
      createdAt: new Date().toISOString()
    });
    await get().loadTasks(get().selectedDate);
    return id;
  },
  
  updateTask: async (id, changes) => {
    await db.tasks.update(id, changes);
    await get().loadTasks(get().selectedDate);
  },
  
  deleteTask: async (id) => {
    await db.tasks.delete(id);
    await get().loadTasks(get().selectedDate);
  },
  
  toggleTask: async (id) => {
    const task = await db.tasks.get(id);
    if (task) {
      const nextCompleted = !task.completed;
      await db.tasks.update(id, { completed: nextCompleted });
      await get().loadTasks(get().selectedDate);

      // Play-to-Grow Synergy: Reward coins & XP for real-world personal growth!
      if (nextCompleted) {
        try {
          const appStore = (await import('./appStore')).default;
          appStore.getState().addCoins?.(20);
          appStore.getState().addXp?.(30);
          const soundEngine = (await import('../utils/audio')).default;
          soundEngine.playCheckmark?.();
          const haptics = (await import('../utils/haptics')).default;
          haptics.success?.();
        } catch (_) {}
      }
    }
  },
  
  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadTasks(date);
  },
  
  setCalendarMode: (mode) => set({ calendarMode: mode }),
  
  scheduleNotification: (task) => {
    console.log('Scheduled notification for', task);
  }
}));

export default useTasksStore;
