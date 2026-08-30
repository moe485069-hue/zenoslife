import Dexie from 'dexie';

export const db = new Dexie('LifeOSDB');

db.version(2).stores({
  tasks: '++id, date, sectionId, title, completed, priority, reminder, dueTime, repeat',
  habits: '++id, sectionId, name, nameFa, frequency, color, icon, target, xp',
  habitLogs: '++id, habitId, date, completed, note',
  journalEntries: '++id, date, sectionId, content, mood, tags, title, timestamp',
  customItems: '++id, sectionId, type, title, content, order, date, extraData',
  userProgress: '++id, date, xp, level, streak, badges',
  finances: '++id, date, type, amount, category, note, timestamp',
  financeGoals: '++id, title, targetAmount, currentAmount, deadline, icon, color',
  flashcards: '++id, front, back, deck, lastReviewed, difficulty, streak',
  savedArticles: '++id, title, url, category, notes, date, isRead',
  commitments: '++id, toWhom, what, deadline, status, reflection, date',
  gratitudes: '++id, date, item1, item2, item3, timestamp',
  settings: '++id, key, value'
});

db.version(3).stores({
  tasks: '++id, date, sectionId, title, completed, priority, reminder, dueTime, repeat',
  habits: '++id, sectionId, name, nameFa, frequency, color, icon, target, xp',
  habitLogs: '++id, habitId, date, completed, note',
  journalEntries: '++id, date, sectionId, content, mood, tags, title, timestamp',
  customItems: '++id, sectionId, type, title, content, order, date, extraData',
  userProgress: '++id, date, xp, level, streak, badges',
  finances: '++id, date, type, amount, category, note, timestamp',
  financeGoals: '++id, title, targetAmount, currentAmount, deadline, icon, color',
  flashcards: '++id, front, back, deck, lastReviewed, difficulty, streak',
  savedArticles: '++id, title, url, category, notes, date, isRead',
  commitments: '++id, toWhom, what, deadline, status, reflection, date',
  gratitudes: '++id, date, item1, item2, item3, timestamp',
  settings: '++id, key, value',
  widgets: '++id, sectionId, type, titleFa, titleEn, content, color, icon, createdAt, checkItems, checkStates, counterValue, counterLabel, targetDate'
}).upgrade(() => {
  // No data migration needed, just adding new table
});

db.version(4).stores({
  tasks: '++id, date, sectionId, title, completed, priority, reminder, dueTime, repeat',
  habits: '++id, sectionId, name, nameFa, frequency, color, icon, target, xp',
  habitLogs: '++id, habitId, date, completed, note',
  journalEntries: '++id, date, sectionId, content, mood, tags, title, timestamp',
  customItems: '++id, sectionId, type, title, content, order, date, extraData',
  userProgress: '++id, date, xp, level, streak, badges',
  finances: '++id, date, type, amount, category, note, timestamp',
  financeGoals: '++id, title, targetAmount, currentAmount, deadline, icon, color',
  flashcards: '++id, front, back, deck, lastReviewed, difficulty, streak',
  savedArticles: '++id, title, url, category, notes, date, isRead',
  commitments: '++id, toWhom, what, deadline, status, reflection, date',
  gratitudes: '++id, date, item1, item2, item3, timestamp',
  settings: '++id, key, value',
  widgets: '++id, sectionId, type, titleFa, titleEn, content, color, icon, createdAt, checkItems, checkStates, counterValue, counterLabel, targetDate',
  timeCapsules: '++id, unlockDate, title, content, isOpened, createdAt'
}).upgrade(() => {});

db.version(5).stores({
  tasks: '++id, date, sectionId, title, completed, priority, reminder, dueTime, repeat',
  habits: '++id, sectionId, name, nameFa, frequency, color, icon, target, xp',
  habitLogs: '++id, habitId, date, completed, note',
  journalEntries: '++id, date, sectionId, content, mood, tags, title, timestamp',
  customItems: '++id, sectionId, type, title, content, order, date, extraData',
  userProgress: '++id, date, xp, level, streak, badges',
  finances: '++id, date, type, amount, category, note, timestamp',
  financeGoals: '++id, title, targetAmount, currentAmount, deadline, icon, color',
  flashcards: '++id, front, back, deck, lastReviewed, difficulty, streak',
  savedArticles: '++id, title, url, category, notes, date, isRead',
  commitments: '++id, toWhom, what, deadline, status, reflection, date',
  gratitudes: '++id, date, item1, item2, item3, timestamp',
  settings: '++id, key, value',
  widgets: '++id, sectionId, type, titleFa, titleEn, content, color, icon, createdAt, checkItems, checkStates, counterValue, counterLabel, targetDate',
  timeCapsules: '++id, unlockDate, title, content, isOpened, createdAt',
  rewards: '++id, titleFa, titleEn, cost, icon, category, isRedeemed, redeemedCount, createdAt',
  quests: '++id, questId, titleFa, titleEn, durationDays, currentDay, streak, startDate, lastCheckIn, isCompleted, rewardCoins, rewardXp, badgeId, icon, category',
  bonsaiState: '++id, level, stage, vitality, waterCount, lightCount, zenCount, totalNourishments, lastWatered, lastLit, lastZen'
}).upgrade(() => {});

db.version(6).stores({
  tasks: '++id, date, sectionId, title, completed, priority, reminder, dueTime, repeat',
  habits: '++id, sectionId, name, nameFa, frequency, color, icon, target, xp',
  habitLogs: '++id, habitId, date, completed, note',
  journalEntries: '++id, date, sectionId, content, mood, tags, title, timestamp',
  customItems: '++id, sectionId, type, title, content, order, date, extraData',
  userProgress: '++id, date, xp, level, streak, badges',
  finances: '++id, date, type, amount, category, note, timestamp',
  financeGoals: '++id, title, targetAmount, currentAmount, deadline, icon, color',
  flashcards: '++id, front, back, deck, lastReviewed, difficulty, streak',
  savedArticles: '++id, title, url, category, notes, date, isRead',
  commitments: '++id, toWhom, what, deadline, status, reflection, date',
  gratitudes: '++id, date, item1, item2, item3, timestamp',
  settings: '++id, key, value',
  widgets: '++id, sectionId, type, titleFa, titleEn, content, color, icon, createdAt, checkItems, checkStates, counterValue, counterLabel, targetDate',
  timeCapsules: '++id, unlockDate, title, content, isOpened, createdAt',
  rewards: '++id, titleFa, titleEn, cost, icon, category, isRedeemed, redeemedCount, createdAt',
  quests: '++id, questId, titleFa, titleEn, durationDays, currentDay, streak, startDate, lastCheckIn, isCompleted, rewardCoins, rewardXp, badgeId, icon, category',
  bonsaiState: '++id, level, stage, vitality, waterCount, lightCount, zenCount, totalNourishments, lastWatered, lastLit, lastZen',
  links: '++id, sourceId, sourceType, sourceTitle, targetId, targetType, targetTitle, relation, createdAt'
}).upgrade(() => {});

db.version(8).stores({
  tasks: '++id, date, sectionId, title, completed, priority, reminder, dueTime, repeat',
  habits: '++id, sectionId, name, nameFa, frequency, color, icon, target, xp',
  habitLogs: '++id, habitId, date, completed, note',
  journalEntries: '++id, date, sectionId, content, mood, tags, title, timestamp',
  customItems: '++id, sectionId, type, title, content, order, date, extraData',
  userProgress: '++id, date, xp, level, streak, badges',
  finances: '++id, date, type, amount, category, note, timestamp',
  financeGoals: '++id, title, targetAmount, currentAmount, deadline, icon, color',
  flashcards: '++id, front, back, deck, lastReviewed, difficulty, streak',
  savedArticles: '++id, title, url, category, notes, date, isRead',
  commitments: '++id, toWhom, what, deadline, status, reflection, date',
  gratitudes: '++id, date, item1, item2, item3, timestamp',
  settings: '++id, key, value',
  widgets: '++id, sectionId, type, titleFa, titleEn, content, color, icon, createdAt, checkItems, checkStates, counterValue, counterLabel, targetDate',
  timeCapsules: '++id, unlockDate, title, content, isOpened, createdAt',
  rewards: '++id, titleFa, titleEn, cost, icon, category, isRedeemed, redeemedCount, createdAt',
  quests: '++id, questId, titleFa, titleEn, durationDays, currentDay, streak, startDate, lastCheckIn, isCompleted, rewardCoins, rewardXp, badgeId, icon, category',
  bonsaiState: '++id, level, stage, vitality, waterCount, lightCount, zenCount, totalNourishments, lastWatered, lastLit, lastZen',
  links: '++id, sourceId, sourceType, sourceTitle, targetId, targetType, targetTitle, relation, createdAt',
  energyLogs: '++id, date, timeOfDay, energyLevel, note, timestamp',
  feedPosts: '++id, postId, moduleKey, titleFa, titleEn, descFa, descEn, icon, route, color, category, likesCount, createdAt',
  comments: '++id, postId, username, userAvatar, content, createdAt',
  postLikes: '++id, postId, username, createdAt',
  profileWidgets: '++id, moduleKey, titleFa, titleEn, icon, route, color, pinnedAt'
}).upgrade(() => {});

db.version(9).stores({
  tasks: '++id, date, sectionId, title, completed, priority, reminder, dueTime, repeat',
  habits: '++id, sectionId, name, nameFa, frequency, color, icon, target, xp',
  habitLogs: '++id, habitId, date, completed, note',
  journalEntries: '++id, date, sectionId, content, mood, tags, title, timestamp',
  customItems: '++id, sectionId, type, title, content, order, date, extraData',
  userProgress: '++id, date, xp, level, streak, badges',
  finances: '++id, date, type, amount, category, note, timestamp',
  financeGoals: '++id, title, targetAmount, currentAmount, deadline, icon, color',
  flashcards: '++id, front, back, deck, lastReviewed, difficulty, streak',
  savedArticles: '++id, title, url, category, notes, date, isRead',
  commitments: '++id, toWhom, what, deadline, status, reflection, date',
  gratitudes: '++id, date, item1, item2, item3, timestamp',
  settings: '++id, key, value',
  widgets: '++id, sectionId, type, titleFa, titleEn, content, color, icon, createdAt, checkItems, checkStates, counterValue, counterLabel, targetDate',
  timeCapsules: '++id, unlockDate, title, content, isOpened, createdAt',
  rewards: '++id, titleFa, titleEn, cost, icon, category, isRedeemed, redeemedCount, createdAt',
  quests: '++id, questId, titleFa, titleEn, durationDays, currentDay, streak, startDate, lastCheckIn, isCompleted, rewardCoins, rewardXp, badgeId, icon, category',
  bonsaiState: '++id, level, stage, vitality, waterCount, lightCount, zenCount, totalNourishments, lastWatered, lastLit, lastZen',
  links: '++id, sourceId, sourceType, sourceTitle, targetId, targetType, targetTitle, relation, createdAt',
  energyLogs: '++id, date, timeOfDay, energyLevel, note, timestamp',
  feedPosts: '++id, postId, moduleKey, titleFa, titleEn, descFa, descEn, icon, route, color, category, likesCount, createdAt',
  comments: '++id, postId, username, userAvatar, content, createdAt',
  postLikes: '++id, postId, username, createdAt',
  profileWidgets: '++id, moduleKey, titleFa, titleEn, icon, route, color, pinnedAt',
  selfBlameLogs: '++id, date, mistake, selfBlameThought, reframedThought, correctiveAction, category, emotion, lessonLearned, isApplied, timestamp'
}).upgrade(() => {});

db.version(10).stores({
  tasks: '++id, date, sectionId, title, completed, priority, reminder, dueTime, repeat',
  habits: '++id, sectionId, name, nameFa, frequency, color, icon, target, xp',
  habitLogs: '++id, habitId, date, completed, note',
  journalEntries: '++id, date, sectionId, content, mood, tags, title, timestamp',
  customItems: '++id, sectionId, type, title, content, order, date, extraData',
  userProgress: '++id, date, xp, level, streak, badges',
  finances: '++id, date, type, amount, category, note, timestamp',
  financeGoals: '++id, title, targetAmount, currentAmount, deadline, icon, color',
  flashcards: '++id, front, back, deck, lastReviewed, difficulty, streak',
  savedArticles: '++id, title, url, category, notes, date, isRead',
  commitments: '++id, toWhom, what, deadline, status, reflection, date',
  gratitudes: '++id, date, item1, item2, item3, timestamp',
  settings: '++id, key, value',
  widgets: '++id, sectionId, type, titleFa, titleEn, content, color, icon, createdAt, checkItems, checkStates, counterValue, counterLabel, targetDate',
  timeCapsules: '++id, unlockDate, title, content, isOpened, createdAt',
  rewards: '++id, titleFa, titleEn, cost, icon, category, isRedeemed, redeemedCount, createdAt',
  quests: '++id, questId, titleFa, titleEn, durationDays, currentDay, streak, startDate, lastCheckIn, isCompleted, rewardCoins, rewardXp, badgeId, icon, category',
  bonsaiState: '++id, level, stage, vitality, waterCount, lightCount, zenCount, totalNourishments, lastWatered, lastLit, lastZen',
  links: '++id, sourceId, sourceType, sourceTitle, targetId, targetType, targetTitle, relation, createdAt',
  energyLogs: '++id, date, timeOfDay, energyLevel, note, timestamp',
  feedPosts: '++id, postId, moduleKey, titleFa, titleEn, descFa, descEn, icon, route, color, category, likesCount, createdAt',
  comments: '++id, postId, username, userAvatar, content, createdAt',
  postLikes: '++id, postId, username, createdAt',
  profileWidgets: '++id, moduleKey, titleFa, titleEn, icon, route, color, pinnedAt',
  selfBlameLogs: '++id, date, mistake, selfBlameThought, reframedThought, correctiveAction, category, emotion, lessonLearned, isApplied, timestamp',
  subconsciousBeliefs: '++id, date, limitingBelief, rootCause, shadowType, empoweringBelief, subliminalAffirmations, repetitionsCount, daysPracticed, isIntegrated, category, categoryFa, timestamp'
}).upgrade(() => {});

export const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Seed initial default content if empty
export const seedInitialDatabase = async () => {
  const habitCount = await db.habits.count();
  if (habitCount === 0) {
    await db.habits.bulkAdd([
      { sectionId: 'mindfulness', name: 'Morning Stretching', nameFa: 'کشش صبحگاهی و یوگا', icon: '🧘', color: '#10b981', xp: 10 },
      { sectionId: 'mindfulness', name: '5000 Steps Walk', nameFa: 'پیاده‌روی ۵۰۰۰ قدم', icon: '🚶‍♂️', color: '#10b981', xp: 15 },
      { sectionId: 'mindfulness', name: '10 Min Meditation', nameFa: '۱۰ دقیقه مراقبه ذهن‌آگاهی', icon: '✨', color: '#10b981', xp: 20 },
      { sectionId: 'mindfulness', name: 'Hydration (8 glasses)', nameFa: 'نوشیدن ۸ لیوان آب', icon: '💧', color: '#06b6d4', xp: 10 },
      
      { sectionId: 'learning', name: 'Read 15 Pages', nameFa: 'مطالعه ۱۵ صفحه کتاب', icon: '📖', color: '#6366f1', xp: 15 },
      { sectionId: 'learning', name: 'Review 10 Flashcards', nameFa: 'مرور ۱۰ فلش‌کارت روزانه', icon: '🗂️', color: '#6366f1', xp: 10 },
      { sectionId: 'learning', name: 'Learn 1 New Concept', nameFa: 'یادگیری ۱ مفهوم جدید و کاربردی', icon: '💡', color: '#6366f1', xp: 15 },
      
      { sectionId: 'selfDiscovery', name: 'Daily Evening Journal', nameFa: 'ژورنال‌نویسی شبانگاهی', icon: '✍️', color: '#a855f7', xp: 15 },
      { sectionId: 'selfDiscovery', name: 'Emotion Check-in', nameFa: 'ثبت و درک احساسات امروز', icon: '🪞', color: '#a855f7', xp: 10 },
      
      { sectionId: 'wealth', name: 'Review Daily Spending', nameFa: 'بررسی هزینه‌های روزانه', icon: '📊', color: '#22c55e', xp: 10 },
      { sectionId: 'wealth', name: 'No Unnecessary Shopping', nameFa: 'پرهیز از خریدهای تکانشی و غیرضروری', icon: '🛡️', color: '#22c55e', xp: 15 },
      
      { sectionId: 'world', name: 'Read 1 High-Quality Analysis', nameFa: 'مطالعه ۱ مقاله تحلیلی علمی یا جهانی', icon: '🌐', color: '#f97316', xp: 10 },
      
      { sectionId: 'integrity', name: 'Speak Truth & Be Authentic', nameFa: 'صداقت در کلام و رفتار', icon: '💎', color: '#eab308', xp: 15 },
      { sectionId: 'integrity', name: 'Keep All Promises Made', nameFa: 'وفای کامل به تعهدات و قول‌ها', icon: '🤝', color: '#eab308', xp: 20 },
      { sectionId: 'integrity', name: 'Practice Empathy & Help Others', nameFa: 'کمک به یک نفر بدون چشم‌داشت', icon: '❤️', color: '#eab308', xp: 15 },

      { sectionId: 'nonJudgment', name: 'Observe Thoughts Without Labeling', nameFa: 'مشاهده افکار و وقایع بدون برچسب خوب/بد', icon: '⚖️', color: '#06b6d4', xp: 15 },
      { sectionId: 'nonJudgment', name: 'Self-Compassion Over Self-Criticism', nameFa: 'پرهیز از سرزنش خود و شفقت به خویشتن', icon: '🕊️', color: '#06b6d4', xp: 15 },
      { sectionId: 'nonJudgment', name: 'Listen to Someone Without Bias', nameFa: 'گوش دادن فعال به دیگران بدون پیش‌داوری', icon: '👂', color: '#06b6d4', xp: 15 },
      { sectionId: 'nonJudgment', name: '5-Second Pause Before Reacting', nameFa: 'مکث ۵ ثانیه‌ای قبل از هرگونه واکنش یا قضاوت', icon: '⏸️', color: '#06b6d4', xp: 10 },

      { sectionId: 'health', name: 'Oral Hygiene & Flossing', nameFa: 'بهداشت دهان، مسواک و نخ دندان', icon: '🪥', color: '#10b981', xp: 10 },
      { sectionId: 'health', name: 'Hydration 8 Glasses', nameFa: 'نوشیدن ۸ لیوان آب تصفیه‌شده', icon: '💧', color: '#06b6d4', xp: 15 },
      { sectionId: 'health', name: 'Sunscreen & Skin Care', nameFa: 'مراقبت پوست و ضدآفتاب روزانه', icon: '🧴', color: '#10b981', xp: 10 },
      { sectionId: 'health', name: 'Ergonomics & Eye Rest (20-20-20)', nameFa: 'استراحت چشم و ارگونومی ستون فقرات', icon: '👁️', color: '#10b981', xp: 10 },

      { sectionId: 'cosmicUnity', name: 'Stargazing & Infinite Contemplation', nameFa: 'نگاه به پهنه آسمان و یادآوری پیوند با غبار ستارگان', icon: '🌌', color: '#8b5cf6', xp: 20 },
      { sectionId: 'cosmicUnity', name: 'Cosmic Breathing & Deep Connection', nameFa: 'تنفس کیهانی و احساس یگانگی با کل حیات', icon: '🪐', color: '#8b5cf6', xp: 15 },
      { sectionId: 'cosmicUnity', name: 'Ego Dissolution & Universal Love', nameFa: 'رها کردن توهم جدایی و گسترش عشق به همه موجودات', icon: '♾️', color: '#8b5cf6', xp: 20 },

      { sectionId: 'addiction', name: 'One Day Clean & Mindful Sovereignty', nameFa: 'یک روز پاکی، اقتدار درونی و تسلط بر نفس', icon: '🛡️', color: '#f43f5e', xp: 25 },
      { sectionId: 'addiction', name: 'Urge Surfing & Delayed Gratification', nameFa: 'موج‌سواری بر هوس و مکث آگاهانه در برابر وسوسه', icon: '🌊', color: '#f43f5e', xp: 20 },
      { sectionId: 'addiction', name: 'Healthy Dopamine Replacement', nameFa: 'جایگزینی دوپامین سالم (ورزش، یادگیری، آب سرد)', icon: '⚡', color: '#f43f5e', xp: 15 },
      { sectionId: 'addiction', name: 'Review Core Why & Relapse Prevention', nameFa: 'مرور دلایل رهایی و پیشگیری از لغزش', icon: '📜', color: '#f43f5e', xp: 15 },

      { sectionId: 'perspective', name: 'Eagle Eye 5-Year Rule Check', nameFa: 'سنجش دغدغه‌ها با قانون ۵ سال بعد و زاویه دید عقاب', icon: '🔭', color: '#38bdf8', xp: 15 },
      { sectionId: 'perspective', name: 'Embrace Imperfection (Wabi-Sabi)', nameFa: 'پذیرش زیبایی نقص‌ها و رهایی از کمال‌گرایی افراطی', icon: '🍃', color: '#38bdf8', xp: 15 },
      { sectionId: 'perspective', name: 'Mindful Silence & Digital Fast', nameFa: '۱۰ دقیقه سکوت مطلق و پرهیز از هیاهوی اخبار', icon: '🕊️', color: '#38bdf8', xp: 20 },

      { sectionId: 'security', name: '2FA & Device Security Audit', nameFa: 'بررسی احراز هویت دومرحله‌ای و امنیت دستگاه‌ها', icon: '🔐', color: '#22c55e', xp: 20 },
      { sectionId: 'security', name: 'Psychological Boundary Defense', nameFa: 'مرزبندی قاطع روانی در برابر افراد سمی و دستکاری عاطفی', icon: '🛡️', color: '#22c55e', xp: 20 },
      { sectionId: 'security', name: 'Cognitive Firewall Against Fake News', nameFa: 'فایروال ذهنی در برابر اخبار نامعتبر و تله‌های الگوریتم', icon: '🧠', color: '#22c55e', xp: 15 },
      { sectionId: 'security', name: 'Physical Environment & Lock Inspection', nameFa: 'بررسی هوشیاری موقعیتی و امنیت فیزیکی محیط زندگی', icon: '🔒', color: '#22c55e', xp: 15 },
    ]);
  }

  // Seed default flashcards if missing (robust migration for existing users)
  const defaultFlashcards = [
    // 1. زبان انگلیسی (English Mastery)
    {
      deck: 'زبان انگلیسی',
      front: 'Resilience (noun) — /rɪˈzɪl.jəns/',
      back: 'تاب‌آوری، انعطاف‌پذیری و ظرفیت بازگشت به حالت تعادل پس از سختی‌ها و بحران‌ها.\nExample: Mental resilience allows you to thrive under immense pressure.',
      difficulty: 'easy',
      streak: 2
    },
    {
      deck: 'زبان انگلیسی',
      front: 'Serendipity (noun) — /ˌser.ənˈdɪp.ə.ti/',
      back: 'پیش‌آمد خوشایند و غیرمنتظره؛ کشف تصادفی چیزهای خوب و ارزشمند در مسیر زندگی.\nExample: Finding this life-changing book was pure serendipity.',
      difficulty: 'easy',
      streak: 3
    },
    {
      deck: 'زبان انگلیسی',
      front: 'Cut to the chase (Idiom)',
      back: 'رفتن سر اصل مطلب، پرهیز از حاشیه‌پردازی.\nExample: We don\'t have much time, let\'s cut to the chase and discuss the strategy.',
      difficulty: 'medium',
      streak: 1
    },
    {
      deck: 'زبان انگلیسی',
      front: 'Cognitive Dissonance (Psychology Term)',
      back: 'ناهماهنگی شناختی؛ احساس ناخوشایند روانی ناشی از داشتن دو باور متضاد یا رفتاری ناسازگار با باورهای شخصی.',
      difficulty: 'medium',
      streak: 1
    },
    {
      deck: 'زبان انگلیسی',
      front: 'Paradigm Shift (Concept)',
      back: 'تغییر بنیادین در نگرش، شیوه تفکر یا مفروضات اساسی در یک حوزه یا در کل زندگی.',
      difficulty: 'easy',
      streak: 2
    },

    // 2. خودشناسی و روانکاوی (Self-Discovery & Psychology)
    {
      deck: 'خودشناسی',
      front: 'مفهوم «سایه» (The Shadow) در روانشناسی یونگ چیست؟',
      back: 'بخش‌های سرکوب‌شده، پنهان یا پذیرفته‌نشده از شخصیت ناخودآگاه ما که جامعه یا خودمان آن‌ها را منفی انگاشته‌ایم. یکپارچه‌سازی سایه سرچشمه خلاقیت و تمامیت روان است.',
      difficulty: 'medium',
      streak: 1
    },
    {
      deck: 'خودشناسی',
      front: 'اثر دانینگ-کروگر (Dunning-Kruger Effect) چیست؟',
      back: 'یک سوگیری شناختی که در آن افراد با دانش اندک در یک زمینه، مهارت و دانایی خود را بسیار بیشتر از واقعیت ارزیابی می‌کنند و برعکس، متخصصان واقعی توانایی خود را دست‌کم می‌گیرند.',
      difficulty: 'medium',
      streak: 1
    },
    {
      deck: 'خودشناسی',
      front: 'سبک‌های دلبستگی (Attachment Styles) چیستند؟',
      back: '۴ الگوی روانی شکل‌گیری روابط عاطفی: ۱. امن (Secure) ۲. اضطرابی (Anxious) ۳. اجتنابی (Avoidant) ۴. آشفته/ترسناک (Disorganized). شناخت آن ریشه حل الگوهای تکراری روابط است.',
      difficulty: 'hard',
      streak: 0
    },
    {
      deck: 'خودشناسی',
      front: 'خطای بنیادی انتساب (Fundamental Attribution Error) چیست؟',
      back: 'تمایل به نسبت دادن رفتارهای منفی دیگران به «شخصیت درونی» آنها، اما توجیه اشتباهات خود بر اساس «شرایط و عوامل محیطی بیرون».',
      difficulty: 'medium',
      streak: 1
    },

    // 3. ثروت، قدرت و اقتصاد (Wealth, Power & Economy)
    {
      deck: 'ثروت و قدرت',
      front: 'قانون بهره مرکب (Compound Interest) در سرمایه‌گذاری چیست؟',
      back: 'سود حاصل از سود قبلی؛ رشد نمایی دارایی‌ها در بستر زمان. انیشتین آن را هشتمین عجایب جهان نامید: «کسی که آن را بفهمد سود می‌برد و کسی که نفهمد، آن را می‌پردازد».',
      difficulty: 'easy',
      streak: 2
    },
    {
      deck: 'ثروت و قدرت',
      front: 'قانون اول از قوانین ۴۸ گانه قدرت (رابرت گرین):',
      back: '«هرگز بیش از ارباب یا بالا دست خود ندرخشید» (Never Outshine the Master). میل به نمایش برتری باعث برانگیختن ناامنی و حسادت در افراد قدرتمند می‌شود.',
      difficulty: 'medium',
      streak: 1
    },
    {
      deck: 'ثروت و قدرت',
      front: 'مفهوم اهرم نامتقارن (Asymmetric Leverage) چیست؟',
      back: 'استفاده از ابزارهایی با هزینه نزولی و پتانسیل صعودی نامحدود (کد، رسانه، سرمایه و محتوا) که در خواب نیز برای شما ارزش و درآمد خلق می‌کنند.',
      difficulty: 'medium',
      streak: 1
    },
    {
      deck: 'ثروت و قدرت',
      front: 'قانون ۵۰/۳۰/۲۰ در مدیریت بودجه چیست؟',
      back: '۵۰٪ درآمد برای نیازهای اساسی (مسکن، خوراک)، ۳۰٪ برای خواسته‌ها و تفریحات، و ۲۰٪ برای پس‌انداز و سرمایه‌گذاری.',
      difficulty: 'easy',
      streak: 2
    },

    // 4. کوانتوم و کیهان‌شناسی (Quantum & Cosmos)
    {
      deck: 'کوانتوم و کیهان',
      front: 'اصل برهم‌نهی کوانتومی (Quantum Superposition) چیست؟',
      back: 'قابلیت یک ذره کوانتومی (مانند الکترون یا فوتون) برای حضور همزمان در چند حالت یا مکان مختلف، تا زمانی که اندازه‌گیری یا مشاهده شود.',
      difficulty: 'medium',
      streak: 1
    },
    {
      deck: 'کوانتوم و کیهان',
      front: 'درهم‌تنیدگی کوانتومی (Quantum Entanglement) چیست؟',
      back: 'پدیده‌ای که در آن دو ذره جفت‌شده، صرف‌نظر از فاصله فیزیکی بینشان (حتی در دو سوی کیهان)، فوراً بر وضعیت یکدیگر اثر می‌گذارند؛ آنچه اینشتین آن را «کُنِش شبح‌وار در دوردست» نامید.',
      difficulty: 'hard',
      streak: 0
    },
    {
      deck: 'کوانتوم و کیهان',
      front: 'نسبیت عام و انحنای فضا-زمان (Spacetime Curvature) چیست؟',
      back: 'گرانش یک نیروی نامرئی نیست، بلکه انحنا و خمیدگی بافت فضا-زمان در حضور جرم و انرژی است. ماده به فضا می‌گوید چگونه خم شود و فضا به ماده می‌گوید چگونه حرکت کند.',
      difficulty: 'medium',
      streak: 1
    },
    {
      deck: 'کوانتوم و کیهان',
      front: 'ماده تاریک (Dark Matter) و انرژی تاریک چیست؟',
      back: 'حدود ۹۵٪ از کل جهان از ماده تاریک (۲۷٪) و انرژی تاریک (۶۸٪) تشکیل شده که با چشم و تلسکوپ‌های معمولی دیده نمی‌شوند اما نیروی حاکم بر ساختار کهکشان‌ها و انبساط شتابان کیهان هستند.',
      difficulty: 'easy',
      streak: 2
    }
  ];

  for (const card of defaultFlashcards) {
    const exists = await db.flashcards.where('front').equals(card.front).count();
    if (exists === 0) {
      await db.flashcards.add(card);
    }
  }

  // Seed default finance goals if empty
  const goalCount = await db.financeGoals.count();
  if (goalCount === 0) {
    await db.financeGoals.bulkAdd([
      {
        title: 'صندوق اضطراری ۶ ماهه',
        targetAmount: 60000000,
        currentAmount: 28000000,
        deadline: '1405-06-31',
        icon: '🛡️',
        color: '#22c55e'
      },
      {
        title: 'ارتقای سیستم کاری و لپ‌تاپ',
        targetAmount: 45000000,
        currentAmount: 32000000,
        deadline: '1405-08-30',
        icon: '💻',
        color: '#6366f1'
      },
      {
        title: 'سفر طبیعت‌گردی و استراحت',
        targetAmount: 15000000,
        currentAmount: 9000000,
        deadline: '1405-04-15',
        icon: '✈️',
        color: '#f97316'
      }
    ]);
  }

  // Seed default tasks for today if empty
  const taskCount = await db.tasks.count();
  if (taskCount === 0) {
    const today = getToday();
    await db.tasks.bulkAdd([
      {
        date: today,
        sectionId: 'mindfulness',
        title: 'جلسه تنفس ریتمیک و مراقبه صبحگاهی',
        dueTime: '08:00',
        priority: 'high',
        completed: false,
        reminder: true
      },
      {
        date: today,
        sectionId: 'learning',
        title: 'مطالعه فصل ۳ کتاب تفکر سریع و کند',
        dueTime: '15:30',
        priority: 'medium',
        completed: false,
        reminder: false
      },
      {
        date: today,
        sectionId: 'wealth',
        title: 'ثبت و دسته‌بندی فاکتورهای این هفته',
        dueTime: '19:00',
        priority: 'low',
        completed: false,
        reminder: false
      },
      {
        date: today,
        sectionId: 'integrity',
        title: 'تکمیل ۳ مورد شکرگزاری روزانه در دفترچه',
        dueTime: '22:00',
        priority: 'medium',
        completed: false,
        reminder: true
      }
    ]);
  }

  // Seed default rewards
  const rewardsCount = await db.rewards.count();
  if (rewardsCount === 0) {
    await db.rewards.bulkAdd([
      { titleFa: 'یک فنجان قهوه ویژه در کافه', titleEn: 'Specialty Coffee at Cafe', cost: 150, icon: '☕', category: 'treat', isRedeemed: false, redeemedCount: 0, createdAt: new Date().toISOString() },
      { titleFa: 'تماشای یک فیلم سینمایی جذاب', titleEn: 'Watch an Exciting Movie', cost: 400, icon: '🎬', category: 'entertainment', isRedeemed: false, redeemedCount: 0, createdAt: new Date().toISOString() },
      { titleFa: 'سفارش غذای لذیذ مورد علاقه', titleEn: 'Order Favorite Delicious Meal', cost: 800, icon: '🍕', category: 'food', isRedeemed: false, redeemedCount: 0, createdAt: new Date().toISOString() },
      { titleFa: 'خرید یک کتاب یا هدیه دلخواه', titleEn: 'Buy a Book or Wishlist Item', cost: 2000, icon: '📚', category: 'shopping', isRedeemed: false, redeemedCount: 0, createdAt: new Date().toISOString() },
      { titleFa: 'یک روز استراحت و گشت‌وگذار کامل', titleEn: 'Full Day Off & Short Trip', cost: 5000, icon: '✈️', category: 'experience', isRedeemed: false, redeemedCount: 0, createdAt: new Date().toISOString() },
    ]);
  }

  // Seed default mythic quests
  const questsCount = await db.quests.count();
  if (questsCount === 0) {
    await db.quests.bulkAdd([
      {
        questId: 'early_bird_21',
        titleFa: 'چالش ۲۱ روزه سحرخیزی و پگاه‌آگاهی',
        titleEn: '21-Day Early Bird & Dawn Mastery',
        durationDays: 21,
        currentDay: 3,
        streak: 3,
        startDate: getToday(),
        lastCheckIn: getToday(),
        isCompleted: false,
        rewardCoins: 600,
        rewardXp: 1200,
        badgeId: 'quest_early_bird',
        icon: '🌅',
        category: 'morning'
      },
      {
        questId: 'digital_detox_7',
        titleFa: 'چالش ۷ روزه سم‌زدایی دیجیتال و رهایی از اسکرول',
        titleEn: '7-Day Digital Detox & Dopamine Fast',
        durationDays: 7,
        currentDay: 1,
        streak: 1,
        startDate: getToday(),
        lastCheckIn: null,
        isCompleted: false,
        rewardCoins: 250,
        rewardXp: 500,
        badgeId: 'quest_digital_detox',
        icon: '📵',
        category: 'mind'
      },
      {
        questId: 'reading_30',
        titleFa: 'چالش ۳۰ روزه مطالعه و ژرف‌اندیشی روزانه',
        titleEn: '30-Day Relentless Reading Journey',
        durationDays: 30,
        currentDay: 5,
        streak: 5,
        startDate: getToday(),
        lastCheckIn: getToday(),
        isCompleted: false,
        rewardCoins: 1000,
        rewardXp: 2000,
        badgeId: 'quest_reading_30',
        icon: '📖',
        category: 'wisdom'
      },
      {
        questId: 'master_90',
        titleFa: 'چالش اسطوره‌ای ۹۰ روزه دگرگونی کامل تن، روان و ثروت',
        titleEn: '90-Day Mythic Transformation of Body, Mind & Wealth',
        durationDays: 90,
        currentDay: 12,
        streak: 12,
        startDate: getToday(),
        lastCheckIn: getToday(),
        isCompleted: false,
        rewardCoins: 3500,
        rewardXp: 6000,
        badgeId: 'quest_master_90',
        icon: '🌌',
        category: 'transformation'
      }
    ]);
  }

  // Seed default Bonsai state
  const bonsaiCount = await db.bonsaiState.count();
  if (bonsaiCount === 0) {
    await db.bonsaiState.add({
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
    });
  }

  // Seed default cross-domain Zettelkasten Brain Graph links
  const linksCount = await db.links.count();
  if (linksCount === 0) {
    await db.links.bulkAdd([
      {
        sourceId: '1',
        sourceType: 'selfDiscovery',
        sourceTitle: 'ژورنال: ریشه‌یابی ترس از فقر و نیاز به امنیت',
        targetId: '1',
        targetType: 'wealth',
        targetTitle: 'هدف مالی: صندوق پس‌انداز اضطراری ۶ ماهه',
        relation: 'ریشه روانی و انگیزه برای',
        createdAt: new Date().toISOString()
      },
      {
        sourceId: '1',
        sourceType: 'wealth',
        sourceTitle: 'هدف مالی: صندوق پس‌انداز اضطراری ۶ ماهه',
        targetId: '1',
        targetType: 'learning',
        targetTitle: 'یادگیری: قانون سرمایه‌گذاری ۵۰/۳۰/۲۰ و سود مرکب',
        relation: 'اصول و راهبرد اجرایی',
        createdAt: new Date().toISOString()
      },
      {
        sourceId: '1',
        sourceType: 'learning',
        sourceTitle: 'یادگیری: درهم‌تنیدگی کوانتومی و اثر مشاهده‌گر',
        targetId: '1',
        targetType: 'cosmic',
        targetTitle: 'وحدت کیهانی: درک پیوستگی اتم‌ها با غبار ستارگان',
        relation: 'پارادایم فکری بنیادین',
        createdAt: new Date().toISOString()
      },
      {
        sourceId: '1',
        sourceType: 'mindfulness',
        sourceTitle: 'عادت: ۲۰ دقیقه مراقبه سکوت و تنفس ۴-۷-۸',
        targetId: '1',
        targetType: 'selfDiscovery',
        targetTitle: 'ژورنال: ریشه‌یابی ترس از فقر و نیاز به امنیت',
        relation: 'ایجاد وضوح ذهنی برای بازنگری',
        createdAt: new Date().toISOString()
      },
      {
        sourceId: '1',
        sourceType: 'health',
        sourceTitle: 'عادت: هیدراتاسیون ۲ لیتر آب و خواب منظم',
        targetId: '1',
        targetType: 'mindfulness',
        targetTitle: 'عادت: ۲۰ دقیقه مراقبه سکوت و تنفس ۴-۷-۸',
        relation: 'تثبیت فیزیولوژی و کاهش اضطراب',
        createdAt: new Date().toISOString()
      },
      {
        sourceId: '1',
        sourceType: 'integrity',
        sourceTitle: 'تعهد اخلاقی: راستگویی و شکرگزاری شبانه',
        targetId: '1',
        targetType: 'selfDiscovery',
        targetTitle: 'خودشناسی: همسویی با ارزش‌های بنیادین وجود',
        relation: 'تطبیق شخصیت بیرونی با حقیقت درونی',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // Seed default feed posts if empty
  const feedPostCount = await db.feedPosts.count();
  if (feedPostCount === 0 || feedPostCount < 10) {
    if (feedPostCount > 0) {
      await db.feedPosts.clear();
    }
    await db.feedPosts.bulkAdd([
      {
        postId: 'stroll',
        moduleKey: 'stroll',
        titleFa: 'قدم زدن و راهروها (Stroll)',
        titleEn: 'Mindful Stroll & Realms',
        descFa: 'مسیرهای ذهن‌آگاهی، پیاده‌روی در قلمروهای فکری و تمرکز بر لحظه حال.',
        descEn: 'Mindful walks, thought realms, and presence contemplation.',
        icon: '🚶‍♂️',
        route: '/stroll',
        color: '#10b981',
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
        category: 'قلمروهای ذهن • Realms',
        badge: 'ذهن‌آگاهی',
        likesCount: 342,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'games',
        moduleKey: 'games',
        titleFa: 'مرکز بازی‌ها و آرکید (Games)',
        titleEn: 'Mind Games & Cyber Arcade',
        descFa: 'مجموعه بازی‌های شطرنج کیهانی، حدس کلمات وردل، بازی ۲۰۴۸، رکورد واکنش و بازی‌های نوستالژیک.',
        descEn: 'Cosmic Chess, Persian Wordle, 2048, and mental reaction games.',
        icon: '🎮',
        route: '/games',
        color: '#8b5cf6',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
        category: 'سرگرمی و تمرکز • Arcade',
        badge: 'محبوب‌ترین',
        likesCount: 520,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'myday',
        moduleKey: 'myday',
        titleFa: 'روز من و انجام کارها (My Day)',
        titleEn: 'My Day & Task Focus',
        descFa: 'تمرکز بر ماموریت‌های امروز، مدیریت هوشمند وظایف، تایمر پومودورو و ماتریس اولویت.',
        descEn: 'Daily focus, task manager, smart priorities, and pomodoro flow.',
        icon: '⚡',
        route: '/my-day',
        color: '#f59e0b',
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
        category: 'بهره‌وری فردی • Productivity',
        badge: 'ضروری روزانه',
        likesCount: 489,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'ai-mentor',
        moduleKey: 'ai-mentor',
        titleFa: 'مربی هوش مصنوعی (AI Mentor)',
        titleEn: 'AI Life Mentor & Guide',
        descFa: 'گفتگو با منتور خردمند برای حل تعارضات فکری، جهت‌دهی به اهداف و استراتژی زندگی.',
        descEn: 'Chat with AI mentor for guidance, life strategy, and personal coaching.',
        icon: '🤖',
        route: '/ai-mentor',
        color: '#ec4899',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        category: 'هوش مصنوعی • AI Companion',
        badge: 'هوشمند',
        likesCount: 630,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'health',
        moduleKey: 'health',
        titleFa: 'استاد ورزش، تمرینات و تغذیه (Workouts & Fitness)',
        titleEn: 'Master Workouts, Fitness & Nutrition',
        descFa: 'برنامه تفکیکی عضلات ۷ روز هفته (Push/Pull/Legs)، دایره‌المعارف حرکات و محاسبه‌گر کالری و ماکرو.',
        descEn: 'Weekly 7-day multi-muscle split, exercise encyclopedia and BMR nutrition calculator.',
        icon: '🏋️‍♂️',
        route: '/health',
        color: '#f43f5e',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
        category: 'ورزش و تناسب اندام • Athletics',
        badge: 'مربی حرفه‌ای',
        likesCount: 578,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'mindfulness',
        moduleKey: 'mindfulness',
        titleFa: 'قلمرو ذهن‌آگاهی و تنفس (Mindfulness)',
        titleEn: 'Mindfulness & Inner Peace',
        descFa: 'تنفس عمیق ریتمیک، جعبه آرامش، مراقبه روزانه و ردیابی سطح انرژی و آرامش.',
        descEn: 'Rhythmic breathing, calm chamber, daily meditation and serenity logs.',
        icon: '🧘',
        route: '/mindfulness',
        color: '#06b6d4',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
        category: 'سلامت روان • Wellbeing',
        badge: 'آرامش',
        likesCount: 410,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'wealth',
        moduleKey: 'wealth',
        titleFa: 'مدیریت مالی و رشد ثروت (Wealth)',
        titleEn: 'Wealth & Financial Mastery',
        descFa: 'ثبت دخل و خرج، هدف‌گذاری پس‌انداز و سرمایه‌گذاری، انضباط مالی و بودجه‌بندی هوشمند.',
        descEn: 'Expense tracking, savings goals, financial discipline and budgets.',
        icon: '💰',
        route: '/wealth',
        color: '#22c55e',
        imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
        category: 'هوش مالی • Finance',
        badge: 'رشد مالی',
        likesCount: 298,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'learning',
        moduleKey: 'learning',
        titleFa: 'یادگیری و فلش‌کارت‌ها (Learning)',
        titleEn: 'Learning & Spaced Repetition',
        descFa: 'مرور فلش‌کارت‌ها با الگوریتم فاصله‌دار، ذخیره مقالات تحلیلی و گنجینه خرد روزانه.',
        descEn: 'Spaced repetition flashcards, analytical articles, and continuous learning.',
        icon: '📚',
        route: '/learning',
        color: '#6366f1',
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
        category: 'دانش و خرد • Education',
        badge: 'یادگیری عمیق',
        likesCount: 375,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'cosmic-unity',
        moduleKey: 'cosmic-unity',
        titleFa: 'یگانگی کیهانی (Cosmic Unity)',
        titleEn: 'Cosmic Unity & Vastness',
        descFa: 'تماشای ستاره‌ها، غوطه‌وری در عظمت کهکشان‌ها و یادآوری پیوند ناگسستنی با کل جهان هستی.',
        descEn: 'Stargazing, deep space perspective, and dissolution of small worries.',
        icon: '🌌',
        route: '/cosmic-unity',
        color: '#a855f7',
        imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&q=80',
        category: 'فلسفه و جهان‌بینی • Cosmic',
        badge: 'افق دید',
        likesCount: 512,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'time-capsule',
        moduleKey: 'time-capsule',
        titleFa: 'کپسول زمان و نامه‌ای به آینده (Time Capsule)',
        titleEn: 'Time Capsule & Future Letters',
        descFa: 'ثبت پیام‌ها و اهداف برای خودتان در آینده با تاریخ قفل‌گذاری هوشمند.',
        descEn: 'Seal memories, visions, and letters to your future self with smart unlock timers.',
        icon: '⏳',
        route: '/time-capsule',
        color: '#d946ef',
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
        category: 'خاطرات و چشم‌انداز • Memory Vault',
        badge: 'الهام‌بخش',
        likesCount: 395,
        createdAt: new Date().toISOString()
      },
      {
        postId: 'brain-graph',
        moduleKey: 'brain-graph',
        titleFa: 'گراف مغز و پیوند قلمروها (Brain Graph)',
        titleEn: 'Brain Graph & Knowledge Network',
        descFa: 'نمایش سه‌بعدی و گراف تعاملی از ارتباط اهداف، عادات و بخش‌های مختلف تفکر شما.',
        descEn: 'Interactive network graph connecting your habits, reflections, and realms.',
        icon: '🕸️',
        route: '/brain-graph',
        color: '#38bdf8',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        category: 'شبکه عصبی • Brain Map',
        badge: 'گراف تحلیلی',
        likesCount: 460,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // Seed default comments if empty
  const commentCount = await db.comments.count();
  if (commentCount === 0) {
    await db.comments.bulkAdd([
      {
        postId: 'games',
        username: 'sara_hm',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        content: 'بازی کلمات و شطرنج کیهانی فوق‌العاده‌ست! ♟️🔥',
        createdAt: new Date().toISOString()
      },
      {
        postId: 'games',
        username: 'ali_reza',
        userAvatar: 'https://i.pravatar.cc/150?img=11',
        content: 'رکورد بازی Reaction Speed رو شکستم، پیشنهاد می‌کنم حتما تست کنید!',
        createdAt: new Date().toISOString()
      },
      {
        postId: 'myday',
        username: 'reza.tech',
        userAvatar: 'https://i.pravatar.cc/150?img=15',
        content: 'پومودورو و بخش وظایف روزانه تمرکزم رو چند برابر کرد. عالیه 👏',
        createdAt: new Date().toISOString()
      },
      {
        postId: 'stroll',
        username: 'zahra_art',
        userAvatar: 'https://i.pravatar.cc/150?img=9',
        content: 'راهروها حس فوق‌العاده آرومی دارن 🌱',
        createdAt: new Date().toISOString()
      }
    ]);
  }
};

// Auto run initial seed
seedInitialDatabase().catch(console.error);

export const exportAllDataJSON = async () => {
  const data = {};
  for (const table of db.tables) {
    data[table.name] = await table.toArray();
  }
  return JSON.stringify(data, null, 2);
};

export const importAllDataJSON = async (jsonString) => {
  const data = JSON.parse(jsonString);
  for (const tableName of Object.keys(data)) {
    if (db[tableName]) {
      await db[tableName].clear();
      if (Array.isArray(data[tableName]) && data[tableName].length > 0) {
        await db[tableName].bulkAdd(data[tableName]);
      }
    }
  }
};
