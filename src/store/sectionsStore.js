import { create } from 'zustand';
import { db, getToday } from '../db/database';

const useSectionsStore = create((set, get) => ({
  habits: [],
  todayLogs: {},
  journalEntries: [],
  finances: [],
  financeGoals: [],
  flashcards: [],
  savedArticles: [],
  commitments: [],
  gratitudes: [],
  customItems: [],
  timeCapsules: [],
  allHabitLogs: [],
  allJournals: [],
  rewards: [],
  quests: [],
  bonsaiState: null,
  links: [],
  isLoading: false,

  // Load habits for a section
  loadHabits: async (sectionId) => {
    try {
      const allHabits = sectionId
        ? await db.habits.where('sectionId').equals(sectionId).toArray()
        : await db.habits.toArray();
      const today = getToday();
      const logs = await db.habitLogs.where('date').equals(today).toArray();
      const logsMap = {};
      logs.forEach(l => { logsMap[l.habitId] = l.completed; });

      set({ habits: allHabits, todayLogs: logsMap });
    } catch (e) {
      console.error('Error loading habits:', e);
    }
  },

  toggleHabit: async (habitId) => {
    try {
      const today = getToday();
      const existing = await db.habitLogs.where({ habitId, date: today }).first();
      const newStatus = existing ? !existing.completed : true;

      if (existing) {
        await db.habitLogs.update(existing.id, { completed: newStatus });
      } else {
        await db.habitLogs.add({ habitId, date: today, completed: true, note: '' });
      }

      set((state) => ({
        todayLogs: { ...state.todayLogs, [habitId]: newStatus }
      }));

      return newStatus;
    } catch (e) {
      console.error('Error toggling habit:', e);
      return false;
    }
  },

  addHabit: async (habit) => {
    try {
      const id = await db.habits.add(habit);
      const newHabit = { ...habit, id };
      set((state) => ({ habits: [...state.habits, newHabit] }));
      return id;
    } catch (e) {
      console.error('Error adding habit:', e);
    }
  },

  deleteHabit: async (habitId) => {
    try {
      await db.habits.delete(habitId);
      await db.habitLogs.where('habitId').equals(habitId).delete();
      set((state) => ({
        habits: state.habits.filter(h => h.id !== habitId)
      }));
    } catch (e) {
      console.error('Error deleting habit:', e);
    }
  },

  // Journal
  loadJournals: async () => {
    try {
      const entries = await db.journalEntries.orderBy('id').reverse().toArray();
      set({ journalEntries: entries });
    } catch (e) {
      console.error('Error loading journals:', e);
    }
  },

  addJournalEntry: async (entry) => {
    try {
      const today = getToday();
      const item = { ...entry, date: today, timestamp: Date.now() };
      const id = await db.journalEntries.add(item);
      set((state) => ({ journalEntries: [{ ...item, id }, ...state.journalEntries] }));
      return id;
    } catch (e) {
      console.error('Error adding journal:', e);
    }
  },

  deleteJournalEntry: async (id) => {
    try {
      await db.journalEntries.delete(id);
      set((state) => ({ journalEntries: state.journalEntries.filter(j => j.id !== id) }));
    } catch (e) {
      console.error('Error deleting journal:', e);
    }
  },

  // Finances
  loadFinances: async () => {
    try {
      const items = await db.finances.orderBy('id').reverse().toArray();
      const goals = await db.financeGoals.toArray();
      set({ finances: items, financeGoals: goals });
    } catch (e) {
      console.error('Error loading finances:', e);
    }
  },

  addFinance: async (transaction) => {
    try {
      const today = getToday();
      const item = { ...transaction, date: transaction.date || today, timestamp: Date.now() };
      const id = await db.finances.add(item);
      set((state) => ({ finances: [{ ...item, id }, ...state.finances] }));
      return id;
    } catch (e) {
      console.error('Error adding finance:', e);
    }
  },

  deleteFinance: async (id) => {
    try {
      await db.finances.delete(id);
      set((state) => ({ finances: state.finances.filter(f => f.id !== id) }));
    } catch (e) {
      console.error('Error deleting finance:', e);
    }
  },

  addFinanceGoal: async (goal) => {
    try {
      const id = await db.financeGoals.add(goal);
      set((state) => ({ financeGoals: [...state.financeGoals, { ...goal, id }] }));
      return id;
    } catch (e) {
      console.error('Error adding goal:', e);
    }
  },

  updateFinanceGoal: async (id, currentAmount) => {
    try {
      await db.financeGoals.update(id, { currentAmount });
      set((state) => ({
        financeGoals: state.financeGoals.map(g => g.id === id ? { ...g, currentAmount } : g)
      }));
    } catch (e) {
      console.error('Error updating goal:', e);
    }
  },

  // Flashcards
  loadFlashcards: async () => {
    try {
      const cards = await db.flashcards.toArray();
      set({ flashcards: cards });
    } catch (e) {
      console.error('Error loading flashcards:', e);
    }
  },

  addFlashcard: async (card) => {
    try {
      const item = { ...card, streak: 0, lastReviewed: getToday() };
      const id = await db.flashcards.add(item);
      set((state) => ({ flashcards: [...state.flashcards, { ...item, id }] }));
      return id;
    } catch (e) {
      console.error('Error adding flashcard:', e);
    }
  },

  updateFlashcard: async (id, updates) => {
    try {
      await db.flashcards.update(id, updates);
      set((state) => ({
        flashcards: state.flashcards.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
    } catch (e) {
      console.error('Error updating flashcard:', e);
    }
  },

  deleteFlashcard: async (id) => {
    try {
      await db.flashcards.delete(id);
      set((state) => ({ flashcards: state.flashcards.filter(c => c.id !== id) }));
    } catch (e) {
      console.error('Error deleting flashcard:', e);
    }
  },

  // Saved Articles / World
  loadSavedArticles: async () => {
    try {
      const items = await db.savedArticles.orderBy('id').reverse().toArray();
      set({ savedArticles: items });
    } catch (e) {
      console.error('Error loading articles:', e);
    }
  },

  addSavedArticle: async (article) => {
    try {
      const item = { ...article, date: getToday(), isRead: false };
      const id = await db.savedArticles.add(item);
      set((state) => ({ savedArticles: [{ ...item, id }, ...state.savedArticles] }));
      return id;
    } catch (e) {
      console.error('Error adding article:', e);
    }
  },

  deleteSavedArticle: async (id) => {
    try {
      await db.savedArticles.delete(id);
      set((state) => ({ savedArticles: state.savedArticles.filter(a => a.id !== id) }));
    } catch (e) {
      console.error('Error deleting article:', e);
    }
  },

  // Commitments & Gratitudes / Integrity
  loadIntegrityData: async () => {
    try {
      const comms = await db.commitments.orderBy('id').reverse().toArray();
      const grats = await db.gratitudes.orderBy('id').reverse().toArray();
      set({ commitments: comms, gratitudes: grats });
    } catch (e) {
      console.error('Error loading integrity data:', e);
    }
  },

  addCommitment: async (comm) => {
    try {
      const item = { ...comm, date: getToday(), status: 'active' };
      const id = await db.commitments.add(item);
      set((state) => ({ commitments: [{ ...item, id }, ...state.commitments] }));
      return id;
    } catch (e) {
      console.error('Error adding commitment:', e);
    }
  },

  updateCommitmentStatus: async (id, status, reflection = '') => {
    try {
      await db.commitments.update(id, { status, reflection });
      set((state) => ({
        commitments: state.commitments.map(c => c.id === id ? { ...c, status, reflection } : c)
      }));
    } catch (e) {
      console.error('Error updating commitment:', e);
    }
  },

  addGratitude: async (items) => {
    try {
      const entry = { date: getToday(), ...items, timestamp: Date.now() };
      const id = await db.gratitudes.add(entry);
      set((state) => ({ gratitudes: [{ ...entry, id }, ...state.gratitudes] }));
      return id;
    } catch (e) {
      console.error('Error adding gratitude:', e);
    }
  },

  // Widgets — Custom Cards (all sections)
  widgets: [],

  loadWidgets: async (sectionId) => {
    try {
      const items = sectionId
        ? await db.widgets.where('sectionId').equals(sectionId).toArray()
        : await db.widgets.toArray();
      set({ widgets: items });
    } catch (e) {
      console.error('Error loading widgets:', e);
    }
  },

  addWidget: async (widget) => {
    try {
      const id = await db.widgets.add(widget);
      const newWidget = { ...widget, id };
      set((state) => ({ widgets: [...state.widgets, newWidget] }));
      return id;
    } catch (e) {
      console.error('Error adding widget:', e);
    }
  },

  updateWidget: async (id, changes) => {
    try {
      await db.widgets.update(id, changes);
      set((state) => ({
        widgets: state.widgets.map(w => w.id === id ? { ...w, ...changes } : w)
      }));
    } catch (e) {
      console.error('Error updating widget:', e);
    }
  },

  deleteWidget: async (id) => {
    try {
      await db.widgets.delete(id);
      set((state) => ({ widgets: state.widgets.filter(w => w.id !== id) }));
    } catch (e) {
      console.error('Error deleting widget:', e);
    }
  },
  // --- AI & INSIGHTS ---
  loadTimeCapsules: async () => {
    try {
      const capsules = await db.timeCapsules.reverse().toArray();
      set({ timeCapsules: capsules });
    } catch (e) {
      console.error(e);
    }
  },
  addTimeCapsule: async (capsule) => {
    try {
      await db.timeCapsules.add({
        ...capsule,
        isOpened: false,
        createdAt: new Date().toISOString()
      });
      get().loadTimeCapsules();
    } catch (e) {
      console.error(e);
    }
  },
  openTimeCapsule: async (id) => {
    try {
      await db.timeCapsules.update(id, { isOpened: true });
      get().loadTimeCapsules();
    } catch (e) {
      console.error(e);
    }
  },
  loadAllHabitLogs: async () => {
    try {
      const logs = await db.habitLogs.toArray();
      set({ allHabitLogs: logs });
    } catch (e) {
      console.error(e);
    }
  },
  loadAllJournals: async () => {
    try {
      const journals = await db.journalEntries.toArray();
      set({ allJournals: journals });
    } catch (e) {
      console.error(e);
    }
  },

  // --- REWARD STORE ---
  loadRewards: async () => {
    try {
      const rewards = await db.rewards.toArray();
      set({ rewards });
    } catch (e) {
      console.error('Error loading rewards:', e);
    }
  },
  addReward: async (reward) => {
    try {
      await db.rewards.add({
        ...reward,
        isRedeemed: false,
        redeemedCount: 0,
        createdAt: new Date().toISOString()
      });
      get().loadRewards();
    } catch (e) {
      console.error('Error adding reward:', e);
    }
  },
  redeemReward: async (id) => {
    try {
      const item = await db.rewards.get(id);
      if (item) {
        await db.rewards.update(id, {
          redeemedCount: (item.redeemedCount || 0) + 1,
          isRedeemed: true,
          lastRedeemedAt: new Date().toISOString()
        });
        get().loadRewards();
      }
    } catch (e) {
      console.error('Error redeeming reward:', e);
    }
  },
  deleteReward: async (id) => {
    try {
      await db.rewards.delete(id);
      get().loadRewards();
    } catch (e) {
      console.error('Error deleting reward:', e);
    }
  },

  // --- MYTHIC QUESTS ---
  loadQuests: async () => {
    try {
      const quests = await db.quests.toArray();
      set({ quests });
    } catch (e) {
      console.error('Error loading quests:', e);
    }
  },
  checkInQuest: async (id) => {
    try {
      const quest = await db.quests.get(id);
      if (quest && !quest.isCompleted) {
        const today = getToday();
        const nextDay = Math.min(quest.durationDays, (quest.currentDay || 0) + 1);
        const isNowCompleted = nextDay >= quest.durationDays;
        
        await db.quests.update(id, {
          currentDay: nextDay,
          streak: (quest.streak || 0) + 1,
          lastCheckIn: today,
          isCompleted: isNowCompleted
        });
        
        get().loadQuests();
        return { isNowCompleted, quest };
      }
    } catch (e) {
      console.error('Error checking into quest:', e);
    }
    return { isNowCompleted: false, quest: null };
  },

  // --- ZEN BONSAI GARDEN ---
  loadBonsai: async () => {
    try {
      const state = await db.bonsaiState.toCollection().first();
      if (state) {
        set({ bonsaiState: state });
      } else {
        const defaultBonsai = {
          level: 3,
          stage: 'blooming',
          vitality: 85,
          waterCount: 4,
          lightCount: 6,
          zenCount: 3,
          totalNourishments: 13,
          lastWatered: getToday(),
          lastLit: getToday(),
          lastZen: getToday()
        };
        const id = await db.bonsaiState.add(defaultBonsai);
        set({ bonsaiState: { ...defaultBonsai, id } });
      }
    } catch (e) {
      console.error('Error loading bonsai:', e);
    }
  },
  nourishBonsai: async (type) => {
    // type: 'water' | 'light' | 'zen'
    try {
      const state = await db.bonsaiState.toCollection().first();
      if (!state) return;
      const today = getToday();
      
      const newWater = type === 'water' ? (state.waterCount || 0) + 1 : state.waterCount || 0;
      const newLight = type === 'light' ? (state.lightCount || 0) + 1 : state.lightCount || 0;
      const newZen = type === 'zen' ? (state.zenCount || 0) + 1 : state.zenCount || 0;
      const newTotal = (state.totalNourishments || 0) + 1;
      
      // Calculate growth stage & level
      let newLevel = Math.min(6, Math.floor(newTotal / 6) + 1);
      let newStage = 'seed';
      if (newLevel === 1) newStage = 'seed';
      else if (newLevel === 2) newStage = 'sprout';
      else if (newLevel === 3) newStage = 'sapling';
      else if (newLevel === 4) newStage = 'blooming';
      else if (newLevel === 5) newStage = 'ancient';
      else newStage = 'cosmic';

      const newVitality = Math.min(100, (state.vitality || 80) + 5);

      const updates = {
        level: newLevel,
        stage: newStage,
        vitality: newVitality,
        waterCount: newWater,
        lightCount: newLight,
        zenCount: newZen,
        totalNourishments: newTotal,
        lastWatered: type === 'water' ? today : state.lastWatered,
        lastLit: type === 'light' ? today : state.lastLit,
        lastZen: type === 'zen' ? today : state.lastZen,
      };

      await db.bonsaiState.update(state.id, updates);
      set({ bonsaiState: { ...state, ...updates } });
    } catch (e) {
      console.error('Error nourishing bonsai:', e);
    }
  },

  // --- ZETTELKASTEN BRAIN GRAPH & INTERCONNECTIVITY ---
  loadLinks: async () => {
    try {
      const allLinks = await db.links.toArray();
      set({ links: allLinks });
    } catch (e) {
      console.error('Error loading brain links:', e);
    }
  },
  addLink: async (linkData) => {
    try {
      await db.links.add({
        ...linkData,
        createdAt: new Date().toISOString()
      });
      get().loadLinks();
    } catch (e) {
      console.error('Error adding brain link:', e);
    }
  },
  deleteLink: async (id) => {
    try {
      await db.links.delete(id);
      get().loadLinks();
    } catch (e) {
      console.error('Error deleting brain link:', e);
    }
  }
}));

export default useSectionsStore;

