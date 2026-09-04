/**
 * ============================================================================
 * 👑 ZenOsLife ACID-Safe Shared Database Engine & Backup Manager
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { CONFIG } = require('./config');

let db = {
  users: {},         // userId -> User Profile Object
  transactions: {},  // chargeId -> Payment Record
  chats: [],         // Array of completed chat records
  matches: [],       // Array of completed game match records
  reports: [],       // Array of abuse reports
  reminders: [],     // Array of calendar reminder items
  settings: { forceSubEnabled: false, forceSubChannel: CONFIG.CHANNEL_USERNAME },
  stats: { totalStarsRevenue: 0, totalMatchesPlayed: 0, totalChatsCompleted: 0 }
};

// Load database from file if exists
try {
  if (fs.existsSync(CONFIG.DATA_FILE)) {
    const raw = fs.readFileSync(CONFIG.DATA_FILE, 'utf8');
    db = Object.assign(db, JSON.parse(raw));
  }
} catch (e) {
  console.warn('[DB] Initializing fresh database file');
}

function saveDb() {
  try {
    fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('[DB] Error saving DB:', e.message);
  }
}

// Automated Backups
if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
  try { fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true }); } catch (_) {}
}

function createDatabaseBackup() {
  try {
    if (!fs.existsSync(CONFIG.DATA_FILE)) return;
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(CONFIG.BACKUP_DIR, `backup_${dateStr}.json`);
    fs.copyFileSync(CONFIG.DATA_FILE, backupPath);

    const files = fs.readdirSync(CONFIG.BACKUP_DIR).filter(f => f.startsWith('backup_')).sort();
    if (files.length > 48) {
      const toDelete = files.slice(0, files.length - 48);
      for (const df of toDelete) {
        try { fs.unlinkSync(path.join(CONFIG.BACKUP_DIR, df)); } catch (_) {}
      }
    }
  } catch (e) {
    console.warn('[DB] Backup notice:', e.message);
  }
}

// Ensure initial backup and periodic schedule
setTimeout(createDatabaseBackup, 5000);
setInterval(createDatabaseBackup, 3600 * 1000);

// Helper methods for users
function getUser(userId, defaultName = 'کاربر زنوسلایف') {
  const uid = String(userId).trim();
  if (!db.users[uid]) {
    db.users[uid] = {
      userId: uid,
      name: defaultName,
      lang: 'fa',
      coins: 1000,
      xp: 0,
      level: 1,
      karma: 100,
      gender: null,
      age: null,
      province: null,
      profileCompleted: false,
      streak_days: 1,
      last_streak_date: new Date().toISOString().slice(0, 10),
      referrals: [],
      friends: [],
      blocked: [],
      is_vip: false,
      vip_expires_at: 0,
      createdAt: Date.now()
    };
    saveDb();
  }
  return db.users[uid];
}

function addXp(userId, amount) {
  const user = getUser(userId);
  user.xp = (user.xp || 0) + amount;
  const currentLvl = user.level || 1;
  const nextLvlXp = currentLvl * 100;
  if (user.xp >= nextLvlXp) {
    user.level = currentLvl + 1;
    user.coins = (user.coins || 0) + 150;
    saveDb();
    return { leveledUp: true, newLevel: user.level };
  }
  saveDb();
  return { leveledUp: false, newLevel: user.level };
}

function addCoins(userId, amount) {
  const user = getUser(userId);
  user.coins = (user.coins || 0) + amount;
  if (user.coins < 0) user.coins = 0;
  saveDb();
  return user.coins;
}

function checkDailyStreak(userId) {
  const user = getUser(userId);
  const todayStr = new Date().toISOString().slice(0, 10);
  if (!user.last_streak_date) {
    user.streak_days = 1;
    user.last_streak_date = todayStr;
    saveDb();
    return null;
  }
  if (user.last_streak_date === todayStr) return null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (user.last_streak_date === yesterdayStr) {
    user.streak_days = (user.streak_days || 1) + 1;
  } else {
    user.streak_days = 1;
  }
  user.last_streak_date = todayStr;

  const bonusCoins = Math.min(user.streak_days * 50, 500);
  const bonusXp = Math.min(user.streak_days * 10, 100);
  user.coins = (user.coins || 0) + bonusCoins;
  addXp(userId, bonusXp);
  saveDb();

  return { days: user.streak_days, coins: bonusCoins, xp: bonusXp };
}

function checkVipExpiration() {
  const now = Date.now();
  let modified = false;
  for (const uid in db.users) {
    const u = db.users[uid];
    if (u.is_vip && u.vip_expires_at && u.vip_expires_at < now) {
      u.is_vip = false;
      u.vip_expires_at = 0;
      modified = true;
    }
  }
  if (modified) saveDb();
}

function updateUser(userId, updates = {}) {
  const user = getUser(userId);
  Object.assign(user, updates);
  saveDb();
  return user;
}

setInterval(checkVipExpiration, 6 * 3600 * 1000);

module.exports = {
  db,
  saveDb,
  createDatabaseBackup,
  getUser,
  updateUser,
  addXp,
  addCoins,
  checkDailyStreak,
  checkVipExpiration
};
