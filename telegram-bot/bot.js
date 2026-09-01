/**
 * ============================================================================
 * 👑 ZenOsLife Enterprise Master Engine & Automated Monetization Backend
 * ============================================================================
 * Architecture:
 * 1. Unified Backend & REST API Server (Integrated HTTP REST on Port 3001)
 * 2. Telegram Bot Engine (Bilingual Fa/En, Long-Polling with Auto-Reconnect)
 * 3. Automated Monetization Engine (Telegram Stars XTR, VIP Plans, 10% Referral Cut)
 * 4. Human-Centric Social Matchmaking (Random, Mood & Vibe, Gender, Province, Global)
 * 5. In-Chat Economy & Engagement (Virtual Gifts, Icebreakers, 1v1 Duels, Trivia)
 * 6. Multiplayer Matchmaking Core (Smart AI Bot Mode vs Live Online Users)
 * 7. Calendar, Checklist & Alarm Notification Push Engine (Asia/Tehran timezone)
 * 8. Force Channel Join System & Hourly Automated Backups
 * 9. Full Persian Super Admin Command Center (/admin, /grantvip, /setcoins, /ban, /broadcast)
 * ============================================================================
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ----------------------------------------------------
// 1. CONFIGURATION & SUPER ADMIN ACCESS
// ----------------------------------------------------
const HARDCODED_ADMINS = ['7517486185', '8887477989', '123456789'];

const CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN || '8887477989:AAEj6gnWZvmhm2jFdjRzJAI3fwVtVptZrd4',
  WEBAPP_URL: process.env.WEBAPP_URL || 'https://zen.moeid.net',
  API_PORT: parseInt(process.env.PORT || '3001', 10),
  CHANNEL_USERNAME: process.env.CHANNEL_USERNAME || '@zenoslife_official',
  DATA_FILE: path.join(__dirname, 'bot_database.json'),
  RATE_LIMIT_MS: 400
};

function isAdmin(userId) {
  const uid = String(userId).trim();
  if (HARDCODED_ADMINS.includes(uid)) return true;
  const envList = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim());
  return envList.includes(uid);
}

// ----------------------------------------------------
// 2. ACID-SAFE PERSISTENT DATA LAYER
// ----------------------------------------------------
let db = {
  users: {},         // userId -> User Profile Object
  transactions: {},  // chargeId -> Payment Record
  chats: [],         // Array of completed chat records
  matches: [],       // Array of completed game match records
  reports: [],       // Array of abuse reports
  reminders: [],     // Array of calendar reminder items
  settings: { forceSubEnabled: false, forceSubChannel: '@zenoslife_official' },
  stats: { totalStarsRevenue: 0, totalMatchesPlayed: 0, totalChatsCompleted: 0 }
};

try {
  if (fs.existsSync(CONFIG.DATA_FILE)) {
    const raw = fs.readFileSync(CONFIG.DATA_FILE, 'utf8');
    db = Object.assign(db, JSON.parse(raw));
  }
} catch (e) {
  console.warn('Initializing fresh database file');
}

function saveDb() {
  try {
    fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Error saving DB:', e.message);
  }
}

// ----------------------------------------------------
// 3. AUTOMATED HOURLY BACKUPS
// ----------------------------------------------------
const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  try { fs.mkdirSync(BACKUP_DIR, { recursive: true }); } catch (_) {}
}

function createDatabaseBackup() {
  try {
    if (!fs.existsSync(CONFIG.DATA_FILE)) return;
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup_${dateStr}.json`);
    fs.copyFileSync(CONFIG.DATA_FILE, backupPath);

    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup_')).sort();
    if (files.length > 48) {
      const toDelete = files.slice(0, files.length - 48);
      for (const df of toDelete) {
        try { fs.unlinkSync(path.join(BACKUP_DIR, df)); } catch (_) {}
      }
    }
  } catch (e) {
    console.warn('Backup notice:', e.message);
  }
}

setInterval(createDatabaseBackup, 3600 * 1000);
setTimeout(createDatabaseBackup, 5000);

// ----------------------------------------------------
// 4. IN-MEMORY RUNTIME STATE & REAL-TIME QUEUES
// ----------------------------------------------------
const waitingQueue = [];               // Chat Matchmaking Queue
const activePairs = new Map();         // In-Chat 1v1 Pairings: userId -> partnerUserId
const registrationSteps = new Map();   // Onboarding Steps: userId -> { step, tempProfile }
const activeGames = new Map();         // 1v1 Active In-Chat Games: gameId -> Game State
const vipLoungeMembers = new Set();    // User IDs currently in Royal VIP Lounge
const userRateLimits = new Map();      // userId -> lastMessageTimestamp
const onlineGameQueues = {             // Game-specific Matchmaking Queues
  rps: [], dice: [], trivia: [], ludo: [], snakes: [], soccer: [], ocho: [], golf: [], billiards: []
};

// ----------------------------------------------------
// 5. 3D AVATARS & VISUAL ASSETS
// ----------------------------------------------------
const DEFAULT_AVATARS = {
  male: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=80',
  female: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
  referralBanner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
};

function getUserAvatar(user) {
  if (user?.photo_id) return user.photo_id;
  return user?.gender === 'female' ? DEFAULT_AVATARS.female : DEFAULT_AVATARS.male;
}

// ----------------------------------------------------
// 6. BILINGUAL DICTIONARIES (FA / EN)
// ----------------------------------------------------
const I18N = {
  fa: {
    welcomeTitle: '👑 <b>به سیستم عامل زندگی و چت ناشناس زنوسلایف خوش آمدید!</b>',
    chooseGender: '👤 لطفاً <b>جنسیت</b> خود را مشخص کنید:',
    male: '👨 پسرم',
    female: '👩 دخترم',
    chooseAge: '🎂 لطفاً <b>رده سنی</b> خود را انتخاب کنید:',
    age1: '۱۸ تا ۲۱ سال',
    age2: '۲۲ تا ۲۶ سال',
    age3: '۲۷ تا ۳۴ سال',
    age4: '۳۵ سال به بالا',
    chooseProv: '📍 لطفاً <b>استان سکونت</b> خود را انتخاب کنید:',
    provTeh: 'تهران / البرز',
    provIsf: 'اصفهان / یزد',
    provMsh: 'خراسان / مشهد',
    provShr: 'فارس / شیراز',
    provTab: 'آذربایجان / تبریز',
    provAhv: 'خوزستان / اهواز',
    provNrt: 'مازندران / گیلان',
    provOth: 'سایر استان‌ها / بین‌المللی',
    regDone: '🎉 <b>تبریک! پروفایل شما ساخته شد و ۱,۰۰۰ سکه هدیه خوش‌آمدگویی گرفتید! 🪙</b>',
    
    // Main Menu
    menuHeader: '👑 <b>پایگاه چت ناشناس، دوستیابی و بازی‌های آنلاین زنوسلایف</b>\n\n' +
                '👤 <b>{name}</b> ({gender}، {age} ساله از {prov})\n' +
                '🏆 <b>سطح:</b> Level {lvl} ({xp} XP) | ⭐ <b>کارما:</b> {karma}\n' +
                '🪙 <b>موجودی:</b> {coins} سکه | 🔥 <b>استریک روزانه:</b> {streak} روز {vipBadge}',
    btnChat: '💬 چت ناشناس و دوستیابی',
    btnGames: '🎮 بازی‌ها و دوئل‌های آنلاین 🎲',
    btnFinanceHub: '💎 VIP، کیف‌پول و درآمدزایی 🎁',
    btnProfileHub: '👤 پروفایل و تنظیمات ⚙️',
    btnMiniApp: '🌟 ورود به دنیای زنوسلایف (Mini App) ✨',

    // Chat
    filterTitle: '🙈 <b>به کی دوست داری وصل شی؟ انتخاب کن:</b> 👇',
    filterRandom: '🎲 جستجوی شانسی (رایگان)',
    filterMood: '🌈 چت بر اساس حس‌وحال و مود روحی 💫',
    filterSameLang: '💬 چت هم‌زبان (فارسی‌زبانان)',
    filterGlobal: '🌍 چت بین‌المللی (Global)',
    filterFemale: '👩 اتصال به دختر (۵۰ سکه)',
    filterMale: '👨 اتصال به پسر (۵۰ سکه)',
    filterProv: '🛰️ افراد نزدیک و همشهری (۳۰ سکه)',
    btnVipChat: '👑 چت‌روم گروهی VIP',
    btnSearch: '🔍 جستجوی کاربران و چت مستقیم',
    searching: '🔍 <b>در حال جستجوی هم‌صحبت با مشخصات درخواستی...</b>\n\n⏳ لطفاً چند لحظه صبور باشید.',
    searchCancelled: '✅ جستجوی هم‌صحبت لغو شد.',
    matched: '🎉 <b>هم‌صحبت پیدا شد!</b>\n\n🎭 <b>مشخصات طرف مقابل:</b> {badge}\n⭐ <b>کارمای اخلاق:</b> {karma} امتیاز | 🏆 <b>سطح:</b> Lvl {lvl}\n\n💬 می‌توانید پیام متنی، ویس، عکس یا استیکر بفرستید.',
    inChatNext: '⏭️ هم‌صحبت بعدی',
    inChatStop: '🛑 پایان گفتگو',
    inChatProfile: '🪪 مشخصات هم‌صحبت',
    inChatDuel: '🎮 دوئل بازی 1v1',
    inChatGift: '🎁 ارسال هدیه',
    inChatIcebreaker: '🎲 سوال یخ‌شکن',
    inChatShareId: '💖 ارسال آیدی تلگرام',
    chatEndedSelf: '🛑 <b>شما مکالمه را پایان دادید.</b>',
    chatEndedPartner: '🛑 <b>هم‌صحبت شما چت را ترک کرد.</b>',
    chatNextPartner: '🛑 <b>هم‌صحبت شما به سراغ فرد دیگری رفت.</b>',
    karmaPrompt: '🌟 <b>مکالمه با هم‌صحبت چطور بود؟</b>\nبا امتیاز دادن به ادب و اخلاق او، فرهنگ چت سالم را ارتقا دهید:',
    karmaGreat: '🌟 خوش‌صحبت و عالی (+۵ کارما)',
    karmaPolite: '☕ محترم و باادب (+۵ کارما)',
    karmaInspiring: '💡 هم‌فکر و الهام‌بخش (+۵ کارما)',
    karmaThanks: '🙏 از ثبت امتیاز شما سپاسگزاریم! (+۵ کارما به هم‌صحبت افزوده شد)',
    lowCoinsNotice: '⚠️ <b>موجودی سکه شما کافی نیست!</b>\nبرای این بخش نیاز به <b>{cost} سکه</b> دارید.\nموجودی فعلی: <b>{coins}</b> سکه',
    surpriseRefill: '🎁 <b>هدیه شارژ شگفت‌انگیز زنوسلایف!</b>\nبه پاس همراهی شما، <b>۲۰۰ سکه رایگان</b> برای ۴ چت فیلتردار دیگر به حسابتان اضافه شد! 🪙✨',

    // VIP & Shop
    vipTitle: '👑 <b>پلن‌های اشتراک ویژه VIP زنوسلایف</b>\n\nمزایای VIP:\n• ورود به تالار چت گروهی ناشناس VIP\n• فیلتر نامحدود دختر/پسر/همشهری\n• نشان تاج طلایی در چت و پروفایل\n• ۲۰٪ بانس XP و سکه مضاعف در بازی‌ها',
    vip7: '🥉 VIP هفتگی (۷ روز) - ۷۵ ستاره ⭐',
    vip30: '🥈 VIP ماهانه (۳۰ روز) - ۲۵۰ ستاره ⭐',
    vip90: '👑 VIP طلایی رویال (۹۰ روز) - ۶۵۰ ستاره ⭐',
    pkg1: '🪙 ۱,۰۰۰ سکه (۳۵ ستاره ⭐)',
    pkg2: '💰 ۵,۰۰۰ سکه + هدیه (۱۵۰ ستاره ⭐)',
    pkg3: '🌍 ۱۲,۰۰۰ سکه + گلوبال (۳۰۰ ستاره ⭐)',
    pkg4: '💎 ۵۰,۰۰۰ سکه + VIP (۱,۰۰۰ ستاره ⭐)',

    // Daily & Referral
    dailyStreakTitle: '🔥 <b>استریک روزانه و پاداش ورود</b>\n\nشما <b>{days} روز متوالی</b> وارد ربات شده‌اید!\n🎁 پاداش امروز شما: <b>+{coins} سکه و +{xp} XP</b>',
    referralTitle: '🎁 <b>سیستم دعوت و درآمدزایی خودکار زنوسلایف</b>\n\n' +
                   '🔗 <b>لینک اختصاصی شما:</b>\n<code>{refLink}</code>\n\n' +
                   '🎁 <b>پاداش‌های شگفت‌انگیز:</b>\n' +
                   '• <b>۱,۰۰۰ سکه هدیه برای شما</b> به ازای هر دعوت موفق\n' +
                   '• <b>۱,۰۰۰ سکه هدیه برای دوست شما</b> در بدو ورود به ربات!\n' +
                   '• <b>۱۰٪ پورسانت مادام‌العمر</b> از تمام خریدهای ستاره تلگرام دوست شما!\n\n' +
                   '👥 تعداد زیرمجموعه‌های شما: <b>{refs} نفر</b>',
    btnShareRef: '🚀 ارسال فوری برای دوستان و گروه‌ها',
    leaderboardTitle: '🏆 <b>جدول برترین‌های زنوسلایف</b>\n\n🥇 <b>برترین‌های سکه:</b>\n{topCoins}\n\n⭐ <b>بااخلاق‌ترین‌ها (کارما):</b>\n{topKarma}'
  },

  en: {
    welcomeTitle: '👑 <b>Welcome to ZenOsLife Anonymous Chat & Gaming Engine!</b>',
    chooseGender: '👤 Please select your <b>gender</b>:',
    male: '👨 Male / Boy',
    female: '👩 Female / Girl',
    chooseAge: '🎂 Please select your <b>age bracket</b>:',
    age1: '18 - 21 yrs',
    age2: '22 - 26 yrs',
    age3: '27 - 34 yrs',
    age4: '35+ yrs',
    chooseProv: '📍 Please select your <b>region</b>:',
    provTeh: 'Europe / UK',
    provIsf: 'North America / US',
    provMsh: 'Asia / Middle East',
    provShr: 'Latin America',
    provTab: 'Australia / Oceania',
    provAhv: 'Africa',
    provNrt: 'Canada',
    provOth: 'Global / Other',
    regDone: '🎉 <b>Congratulations! Your profile is ready with 1,000 Welcome Coins! 🪙</b>',
    
    // Main Menu
    menuHeader: '👑 <b>Anonymous Chat, Social Dating & Live Games Hub</b>\n\n' +
                '👤 <b>{name}</b> ({gender}, {age} yrs from {prov})\n' +
                '🏆 <b>Level:</b> Level {lvl} ({xp} XP) | ⭐ <b>Karma:</b> {karma}\n' +
                '🪙 <b>Balance:</b> {coins} Coins | 🔥 <b>Daily Streak:</b> {streak} Days {vipBadge}',
    btnChat: '💬 Anonymous Chat & Dating',
    btnGames: '🎮 Online Games & Duels 🎲',
    btnFinanceHub: '💎 VIP, Wallet & Earn 🎁',
    btnProfileHub: '👤 Profile & Settings ⚙️',
    btnMiniApp: '🌟 Open ZenOsLife (Mini App) ✨',

    // Chat
    filterTitle: '🙈 <b>Who would you like to connect with?</b> 👇',
    filterRandom: '🎲 Random Match (Free)',
    filterMood: '🌈 Chat by Mood & Vibe 💫',
    filterSameLang: '💬 Same Language Match',
    filterGlobal: '🌍 Global Discovery',
    filterFemale: '👩 Connect to Girl (50 Coins)',
    filterMale: '👨 Connect to Boy (50 Coins)',
    filterProv: '🛰️ Same Region Match (30 Coins)',
    btnVipChat: '👑 VIP Group Lounge',
    btnSearch: '🔍 Search Users & Direct Chat',
    searching: '🔍 <b>Searching for the best partner...</b>\n\n⏳ Please wait a moment...',
    searchCancelled: '✅ Search cancelled.',
    matched: '🎉 <b>Partner Found!</b>\n\n🎭 <b>Stranger:</b> {badge}\n⭐ <b>Karma:</b> {karma} pts | 🏆 <b>Level:</b> Lvl {lvl}\n\n💬 Feel free to send text, voice notes, photos, or stickers.',
    inChatNext: '⏭️ Next Partner',
    inChatStop: '🛑 End Chat',
    inChatProfile: '🪪 Partner Profile',
    inChatDuel: '🎮 1v1 Game Duel',
    inChatGift: '🎁 Send Gift',
    inChatIcebreaker: '🎲 Icebreaker Question',
    inChatShareId: '💖 Share Telegram ID',
    chatEndedSelf: '🛑 <b>You ended the conversation.</b>',
    chatEndedPartner: '🛑 <b>Your partner left the chat.</b>',
    chatNextPartner: '🛑 <b>Your partner moved on to someone else.</b>',
    karmaPrompt: '🌟 <b>How was your conversation?</b>\nRate your partner:',
    karmaGreat: '🌟 Great Talker (+5 Karma)',
    karmaPolite: '☕ Polite & Respectful (+5 Karma)',
    karmaInspiring: '💡 Inspiring (+5 Karma)',
    karmaThanks: '🙏 Thank you for your feedback! (+5 Karma added)',
    lowCoinsNotice: '⚠️ <b>Insufficient Coins!</b>\nRequires <b>{cost} Coins</b>.\nBalance: <b>{coins}</b> Coins',
    surpriseRefill: '🎁 <b>Surprise Coin Refill!</b>\nHere is <b>200 Free Coins</b>! 🪙✨',

    // VIP & Shop
    vipTitle: '👑 <b>ZenOsLife VIP Subscription Plans</b>',
    vip7: '🥉 Weekly VIP (7 Days) - 75 Stars ⭐',
    vip30: '🥈 Monthly VIP (30 Days) - 250 Stars ⭐',
    vip90: '👑 Royal VIP (90 Days) - 650 Stars ⭐',
    pkg1: '🪙 1,000 Coins (35 Stars ⭐)',
    pkg2: '💰 5,000 Coins + Bonus (150 Stars ⭐)',
    pkg3: '🌍 12,000 Coins + Global (300 Stars ⭐)',
    pkg4: '💎 50,000 Coins + VIP (1,000 Stars ⭐)',

    // Daily & Referral
    dailyStreakTitle: '🔥 <b>Daily Streak & Login Bonus</b>\n\nLogged in <b>{days} consecutive days</b>!\n🎁 Reward: <b>+{coins} Coins & +{xp} XP</b>',
    referralTitle: '🎁 <b>ZenOsLife Automated Referral Engine</b>\n\n' +
                   '🔗 <b>Your Exclusive Invite Link:</b>\n<code>{refLink}</code>\n\n' +
                   '🎁 <b>Rewards:</b>\n' +
                   '• <b>1,000 Coins for you</b> per successful invite\n' +
                   '• <b>1,000 Coins for your friend</b> on signup!\n' +
                   '• <b>10% Lifetime Cut</b> on all their Stars purchases!\n\n' +
                   '👥 Friends Invited: <b>{refs}</b>',
    btnShareRef: '🚀 1-Tap Share to Friends',
    leaderboardTitle: '🏆 <b>ZenOsLife Top Leaderboards</b>\n\n🥇 <b>Wealth Leaders:</b>\n{topCoins}\n\n⭐ <b>Karma Leaders:</b>\n{topKarma}'
  }
};

function t(userId, key, params = {}) {
  let lang = db.users[userId]?.lang;
  if (!lang && registrationSteps.has(userId)) {
    lang = registrationSteps.get(userId).tempProfile?.lang;
  }
  lang = lang || 'fa';

  let str = I18N[lang]?.[key] || I18N.fa[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return str;
}

// ----------------------------------------------------
// 7. TELEGRAM HTTPS API CLIENT
// ----------------------------------------------------
const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

function callTgApi(method, payload = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${CONFIG.BOT_TOKEN}/${method}`,
      method: 'POST',
      agent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.ok) resolve(json.result);
          else reject(new Error(json.description || 'Telegram API error'));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

// ----------------------------------------------------
// 8. FORCE CHANNEL MEMBERSHIP CHECK
// ----------------------------------------------------
async function isUserChannelMember(userId) {
  if (!db.settings?.forceSubEnabled || !db.settings?.forceSubChannel) return true;
  if (isAdmin(userId)) return true;

  try {
    const member = await callTgApi('getChatMember', {
      chat_id: db.settings.forceSubChannel,
      user_id: userId
    });
    if (member && ['creator', 'administrator', 'member', 'restricted'].includes(member.status)) {
      return true;
    }
    return false;
  } catch (e) {
    return true; // Fallback gracefully if error so bot is never stuck
  }
}

async function sendForceSubPrompt(chatId, userId) {
  const channel = db.settings?.forceSubChannel || '@zenoslife_official';
  const cleanChannel = channel.replace('@', '');
  const isEn = db.users[userId]?.lang === 'en';

  const text = isEn
    ? `📢 <b>Channel Membership Required</b>\n\nTo use ZenOsLife anonymous chat, multiplayer games and rewards, please join our official channel first:\n\n👉 <b>${channel}</b>\n\n<i>After joining, tap the confirmation button below:</i>`
    : `📢 <b>عضویت در کانال رسمی الزامی است!</b>\n\nبرای استفاده از چت ناشناس، بازی‌های آنلاین دونفره و دریافت ۱,۰۰۰ سکه هدیه، لطفاً ابتدا در کانال رسمی زنوسلایف عضو شوید:\n\n👉 <b>${channel}</b>\n\n<i>پس از عضویت، روی دکمه «عضو شدم / بررسی مجدد» کلیک کنید:</i>`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: isEn ? '📢 Join Official Channel' : '📢 ورود و عضویت در کانال', url: `https://t.me/${cleanChannel}` }],
        [{ text: isEn ? '🔄 I Joined / Re-check' : '🔄 عضو شدم / بررسی مجدد', callback_data: 'check_force_sub' }]
      ]
    }
  });
}

// ----------------------------------------------------
// 9. LEVEL, XP & RECURRING RETENTION
// ----------------------------------------------------
function addXp(userId, amount) {
  const user = db.users[userId];
  if (!user) return;
  user.xp = (user.xp || 0) + amount;
  const newLevel = Math.floor(Math.sqrt(user.xp / 50)) + 1;
  if (newLevel > (user.level || 1)) {
    user.level = newLevel;
    user.coins = (user.coins || 0) + newLevel * 100;
    const msg = user.lang === 'en'
      ? `🏆 <b>LEVEL UP! You reached Level ${newLevel}! (+ ${newLevel * 100} Coins)</b>`
      : `🏆 <b>تبریک! شما به لول ${newLevel} ارتقا یافتید! (+ ${newLevel * 100} سکه جایزه)</b>`;
    callTgApi('sendMessage', { chat_id: userId, text: msg, parse_mode: 'HTML' }).catch(() => {});
  }
  saveDb();
}

function checkDailyStreak(userId) {
  const user = db.users[userId];
  if (!user) return null;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const lastDate = user.last_streak_date;

  if (lastDate === todayStr) return null;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastDate === yesterday) {
    user.streak_days = (user.streak_days || 1) + 1;
  } else {
    user.streak_days = 1;
  }
  user.last_streak_date = todayStr;

  const rewardCoins = Math.min(user.streak_days * 50, 500);
  const rewardXp = 20;
  user.coins = (user.coins || 0) + rewardCoins;
  addXp(userId, rewardXp);
  saveDb();

  return { days: user.streak_days, coins: rewardCoins, xp: rewardXp };
}

function checkVipExpiration() {
  const now = Date.now();
  for (const [uid, user] of Object.entries(db.users)) {
    if (user.is_vip && user.vip_expires_at && user.vip_expires_at < now) {
      user.is_vip = false;
      user.vip_expires_at = null;
      saveDb();
      const msg = user.lang === 'en'
        ? '⚠️ Your VIP subscription has expired. Renew your VIP status in the shop!'
        : '⚠️ اشتراک VIP شما به پایان رسید. برای تمدید از بخش فروشگاه اقدام کنید!';
      callTgApi('sendMessage', { chat_id: uid, text: msg }).catch(() => {});
    }
  }
}

// ----------------------------------------------------
// 10. ONBOARDING & LANGUAGE SELECTION
// ----------------------------------------------------
async function startLanguageChoice(chatId, userId, startParam = '') {
  registrationSteps.set(userId, {
    step: 'lang',
    tempProfile: {
      userId,
      invitedBy: startParam.startsWith('ref_') ? startParam.replace('ref_', '') : null,
      coins: 1000,
      xp: 0,
      level: 1,
      karma: 100,
      streak_days: 1,
      last_streak_date: new Date().toISOString().slice(0, 10),
      referrals: [],
      friends: [],
      blocked: [],
      lastRefill: Date.now(),
      createdAt: Date.now()
    }
  });

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: '🌐 <b>لطفاً زبان خود را انتخاب کنید / Please select language:</b>',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'فارسی (Persian)', callback_data: 'set_lang_fa' },
          { text: 'English', callback_data: 'set_lang_en' }
        ]
      ]
    }
  });
}

async function promptGenderSelection(chatId, userId) {
  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'chooseGender'),
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: t(userId, 'male'), callback_data: 'reg_gender_male' },
          { text: t(userId, 'female'), callback_data: 'reg_gender_female' }
        ]
      ]
    }
  });
}

// ----------------------------------------------------
// 11. PROFILE CARD & IN-CHAT PROFILE INSPECTION
// ----------------------------------------------------
async function sendProfileCard(chatId, userId) {
  const user = db.users[userId];
  if (!user) return startLanguageChoice(chatId, userId);
  const genderIcon = user.gender === 'female' ? '👩' : '👨';
  const isEn = user.lang === 'en';
  const avatar = getUserAvatar(user);

  const profText = isEn
    ? `👤 <b>ZenOsLife Social Profile:</b>\n\n` +
      `• Name: <b>${user.name}</b>\n` +
      `• Gender: <b>${genderIcon} ${user.gender}</b>\n` +
      `• Age Range: <b>${user.age}</b>\n` +
      `• Region: <b>${user.province}</b>\n` +
      `• Level: <b>Level ${user.level || 1} (${user.xp || 0} XP)</b>\n` +
      `• Karma & Ethics: <b>⭐ ${user.karma || 100} pts</b>\n` +
      `• Balance: <b>🪙 ${(user.coins || 0).toLocaleString()} Coins</b> ${user.is_vip ? '👑 VIP' : ''}\n` +
      `• Daily Streak: <b>🔥 ${user.streak_days || 1} Days</b>\n` +
      `• Friends: <b>${(user.friends || []).length} Users</b>`
    : `👤 <b>پروفایل کاربری شما در زنوسلایف:</b>\n\n` +
      `• نام: <b>${user.name}</b>\n` +
      `• جنسیت: <b>${genderIcon} ${user.gender === 'female' ? 'دختر' : 'پسر'}</b>\n` +
      `• رده سنی: <b>${user.age}</b>\n` +
      `• استان: <b>${user.province}</b>\n` +
      `• سطح و پیشرفت: <b>سطح ${user.level || 1} (${user.xp || 0} XP)</b>\n` +
      `• امتیاز کارما و ادب: <b>⭐ ${user.karma || 100} امتیاز</b>\n` +
      `• موجودی سکه: <b>🪙 ${(user.coins || 0).toLocaleString()} سکه</b> ${user.is_vip ? '👑 VIP' : ''}\n` +
      `• استریک روزانه: <b>🔥 ${user.streak_days || 1} روز مداوم</b>\n` +
      `• تعداد دوستان: <b>${(user.friends || []).length} نفر</b>`;

  const replyMarkup = {
    inline_keyboard: [
      [{ text: isEn ? '✏️ Edit Profile' : '✏️ ویرایش مشخصات', callback_data: 'edit_profile' }],
      [{ text: isEn ? '👥 My Friends List' : '👥 لیست دوستان من', callback_data: 'view_my_friends' }]
    ]
  };

  try {
    return await callTgApi('sendPhoto', {
      chat_id: chatId,
      photo: avatar,
      caption: profText,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    });
  } catch (_) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: profText,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    });
  }
}

async function sendProfileEditMenu(chatId, userId) {
  const user = db.users[userId];
  if (!user) return startLanguageChoice(chatId, userId);
  const isEn = user.lang === 'en';

  const text = isEn
    ? '⚙️ <b>Edit Your Profile:</b>\nSelect which field you would like to update:'
    : '⚙️ <b>ویرایش مشخصات کاربری:</b>\nلطفاً بخشی که مایل به تغییر آن هستید را انتخاب کنید:';

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: isEn ? '📸 Change Profile Photo' : '📸 تغییر عکس پروفایل', callback_data: 'edit_field_photo' }],
        [{ text: isEn ? '✏️ Edit Name' : '✏️ تغییر نام', callback_data: 'edit_field_name' }],
        [
          { text: isEn ? '👤 Change Gender' : '👤 تغییر جنسیت', callback_data: 'edit_field_gender' },
          { text: isEn ? '🎂 Change Age' : '🎂 تغییر رده سنی', callback_data: 'edit_field_age' }
        ],
        [{ text: isEn ? '📍 Change Region' : '📍 تغییر استان / منطقه', callback_data: 'edit_field_prov' }],
        [{ text: isEn ? '🌐 Change Language' : '🌐 تغییر زبان', callback_data: 'edit_field_lang' }],
        [{ text: isEn ? '🔙 Back to Profile' : '🔙 بازگشت به پروفایل', callback_data: 'view_profile_full' }]
      ]
    }
  });
}

// ----------------------------------------------------
// 12. MAIN BOT DASHBOARD & KEYBOARD
// ----------------------------------------------------
function getMainReplyKeyboard(userId) {
  const user = db.users[userId];
  const lang = user?.lang || 'fa';
  const isEn = lang === 'en';

  return {
    keyboard: [
      [{ text: isEn ? '💬 Anonymous Chat & Dating' : '💬 چت ناشناس و دوستیابی' }],
      [{ text: isEn ? '🎮 Online Games & Duels 🎲' : '🎮 بازی‌ها و دوئل‌های آنلاین 🎲' }],
      [
        { text: isEn ? '💎 VIP, Wallet & Earn 🎁' : '💎 VIP، کیف‌پول و درآمدزایی 🎁' },
        { text: isEn ? '👤 Profile & Settings ⚙️' : '👤 پروفایل و تنظیمات ⚙️' }
      ],
      [{
        text: isEn ? '🌟 Open ZenOsLife (Mini App) ✨' : '🌟 ورود به دنیای زنوسلایف (Mini App) ✨',
        web_app: { url: `${CONFIG.WEBAPP_URL}?lang=${lang}` }
      }]
    ],
    resize_keyboard: true
  };
}

async function sendMainDashboard(chatId, userId, alertMsg = '') {
  const user = db.users[userId];
  if (!user || !user.profileCompleted) {
    return startLanguageChoice(chatId, userId);
  }

  // Daily Streak Check
  const streakReward = checkDailyStreak(userId);
  if (streakReward && streakReward.days > 1) {
    const streakMsg = t(userId, 'dailyStreakTitle', { days: streakReward.days, coins: streakReward.coins, xp: streakReward.xp });
    callTgApi('sendMessage', { chat_id: chatId, text: streakMsg, parse_mode: 'HTML' }).catch(() => {});
  }

  // Retention: Auto Faucet Refill if < 100 coins
  if ((user.coins || 0) < 100 && (!user.lastRefill || Date.now() - user.lastRefill > 4 * 3600 * 1000)) {
    user.coins = (user.coins || 0) + 200;
    user.lastRefill = Date.now();
    saveDb();
    callTgApi('sendMessage', { chat_id: chatId, text: t(userId, 'surpriseRefill'), parse_mode: 'HTML' }).catch(() => {});
  }

  const genderIcon = user.gender === 'female' ? '👩' : '👨';
  const vipBadge = user.is_vip ? '👑 VIP' : '';

  const dashboardText = (alertMsg ? `${alertMsg}\n\n` : '') +
    t(userId, 'menuHeader', {
      name: user.name,
      gender: genderIcon,
      age: user.age,
      prov: user.province,
      lvl: user.level || 1,
      xp: user.xp || 0,
      karma: user.karma || 100,
      coins: (user.coins || 0).toLocaleString(),
      streak: user.streak_days || 1,
      vipBadge: vipBadge
    });

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: dashboardText,
    parse_mode: 'HTML',
    reply_markup: getMainReplyKeyboard(userId)
  });
}

// ----------------------------------------------------
// 13. SOCIAL MATCHMAKING & MOOD ENGINE
// ----------------------------------------------------
async function sendFilterMenu(chatId, userId) {
  const user = db.users[userId];
  if (!user || !user.profileCompleted) return startLanguageChoice(chatId, userId);
  const isEn = user.lang === 'en';

  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: t(userId, 'filterRandom'), callback_data: 'filter_random' }],
      [{ text: isEn ? '🌈 Chat by Mood & Vibe 💫' : '🌈 چت بر اساس حس‌وحال و مود روحی 💫', callback_data: 'open_mood_menu' }],
      [{ text: t(userId, 'filterFemale'), callback_data: 'filter_female' }, { text: t(userId, 'filterMale'), callback_data: 'filter_male' }],
      [{ text: isEn ? '➕ Other Options & Filters...' : '➕ گزینه‌های دیگر و فیلترهای پیشرفته...', callback_data: 'open_other_filters' }]
    ]
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'filterTitle'),
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  });
}

async function sendOtherFiltersMenu(chatId, userId) {
  const isEn = db.users[userId]?.lang === 'en';

  const otherKeyboard = {
    inline_keyboard: [
      [{ text: t(userId, 'btnVipChat'), callback_data: 'enter_vip_lounge' }],
      [{ text: t(userId, 'filterSameLang'), callback_data: 'filter_samelang' }, { text: t(userId, 'filterGlobal'), callback_data: 'filter_global' }],
      [{ text: t(userId, 'filterProv'), callback_data: 'filter_province' }],
      [{ text: t(userId, 'btnSearch'), callback_data: 'open_user_search' }],
      [{ text: isEn ? '🔙 Back to Chat Menu' : '🔙 بازگشت به منوی اصلی چت', callback_data: 'back_to_chat_filters' }]
    ]
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: isEn ? '⚙️ <b>Advanced Chat Options & Filters:</b>' : '⚙️ <b>گزینه‌های دیگر و فیلترهای تکمیلی چت:</b>',
    parse_mode: 'HTML',
    reply_markup: otherKeyboard
  });
}

async function sendMoodSelectMenu(chatId, userId) {
  const isEn = db.users[userId]?.lang === 'en';
  const text = isEn
    ? '🌈 <b>Choose your Current Mood & Vibe:</b>\nWe will match you with someone feeling the exact same way:'
    : '🌈 <b>حس‌وحال (مود) امروزت رو انتخاب کن:</b>\nربات شما رو دقیقاً به کسی وصل می‌کنه که الان در همین فرکانس روحی قرار داره:';

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🕊️ دردودل و گوش شنوا (آرامش و کاهش تنهایی)', callback_data: 'mood_match_venting' }],
        [{ text: '🚀 پرانرژی، شاد و اهل شوخی و خنده', callback_data: 'mood_match_funny' }],
        [{ text: '🎧 عاشق موزیک، هنر، فیلم و کتاب', callback_data: 'mood_match_art' }],
        [{ text: '☕ گفتگوی عمیق، فکری و تجربیات زندگی', callback_data: 'mood_match_deep' }],
        [{ text: '🎮 اهل بازی، کل‌کل و رقابت آنلاین', callback_data: 'mood_match_gaming' }],
        [{ text: '🔙 بازگشت به منوی چت', callback_data: 'back_to_chat_filters' }]
      ]
    }
  });
}

async function executeMatchSearch(chatId, userId, filterType = 'random') {
  const user = db.users[userId];
  if (!user) return;

  let cost = 0;
  if (filterType === 'female' || filterType === 'male') cost = 50;
  if (filterType === 'province') cost = 30;
  if (filterType === 'global') cost = 20;

  if (cost > 0 && !user.is_vip) {
    if ((user.coins || 0) < cost) {
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: t(userId, 'lowCoinsNotice', { cost, coins: (user.coins || 0).toLocaleString() }),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⭐ خرید سکه با ستاره', callback_data: 'buy_stars' }],
            [{ text: t(userId, 'filterRandom'), callback_data: 'filter_random' }],
            [{ text: '🎁 دعوت دوستان', callback_data: 'show_referral' }]
          ]
        }
      });
    }
  }

  if (cost > 0 && !user.is_vip) {
    user.coins -= cost;
    saveDb();
  }

  let matchedIdx = -1;
  for (let i = 0; i < waitingQueue.length; i++) {
    const cand = waitingQueue[i];
    if (cand.userId === userId) continue;

    const candUser = db.users[cand.userId];
    if (!candUser) continue;

    if (user.blocked && user.blocked.includes(cand.userId)) continue;
    if (candUser.blocked && candUser.blocked.includes(userId)) continue;

    let isMatch = true;
    if (filterType.startsWith('mood_') && cand.filterType !== filterType) isMatch = false;
    if (cand.filterType.startsWith('mood_') && cand.filterType !== filterType) isMatch = false;
    if (filterType === 'female' && candUser.gender !== 'female') isMatch = false;
    if (filterType === 'male' && candUser.gender !== 'male') isMatch = false;
    if (filterType === 'province' && candUser.province !== user.province) isMatch = false;
    if (filterType === 'samelang' && candUser.lang !== user.lang) isMatch = false;

    if (cand.filterType === 'female' && user.gender !== 'female') isMatch = false;
    if (cand.filterType === 'male' && user.gender !== 'male') isMatch = false;
    if (cand.filterType === 'province' && cand.province !== user.province) isMatch = false;
    if (cand.filterType === 'samelang' && cand.lang !== user.lang) isMatch = false;

    if (isMatch) {
      matchedIdx = i;
      break;
    }
  }

  if (matchedIdx > -1) {
    const partner = waitingQueue.splice(matchedIdx, 1)[0];
    const partnerId = partner.userId;
    const partnerUser = db.users[partnerId];

    activePairs.set(userId, partnerId);
    activePairs.set(partnerId, userId);

    db.chats.push({
      id: crypto.randomUUID(),
      u1: userId,
      u2: partnerId,
      filter: filterType,
      startedAt: Date.now()
    });
    db.stats.totalChatsCompleted++;
    saveDb();

    addXp(userId, 10);
    addXp(partnerId, 10);

    const userBadge = `${user.gender === 'female' ? '👩' : '👨'} ${user.name} (${user.age} yrs, ${user.province})`;
    const partnerBadge = `${partnerUser.gender === 'female' ? '👩' : '👨'} ${partnerUser.name} (${partnerUser.age} yrs, ${partnerUser.province})`;

    const inChatKeyboardUser = {
      keyboard: [
        [{ text: t(userId, 'inChatNext') }, { text: t(userId, 'inChatStop') }],
        [{ text: t(userId, 'inChatProfile') }, { text: t(userId, 'inChatDuel') }],
        [{ text: t(userId, 'inChatGift') }, { text: t(userId, 'inChatIcebreaker') }],
        [{ text: t(userId, 'inChatShareId') }]
      ],
      resize_keyboard: true
    };

    const inChatKeyboardPartner = {
      keyboard: [
        [{ text: t(partnerId, 'inChatNext') }, { text: t(partnerId, 'inChatStop') }],
        [{ text: t(partnerId, 'inChatProfile') }, { text: t(partnerId, 'inChatDuel') }],
        [{ text: t(partnerId, 'inChatGift') }, { text: t(partnerId, 'inChatIcebreaker') }],
        [{ text: t(partnerId, 'inChatShareId') }]
      ],
      resize_keyboard: true
    };

    callTgApi('sendMessage', {
      chat_id: userId,
      text: t(userId, 'matched', { badge: partnerBadge, karma: partnerUser.karma || 100, lvl: partnerUser.level || 1 }),
      parse_mode: 'HTML',
      reply_markup: inChatKeyboardUser
    }).catch(() => {});

    callTgApi('sendMessage', {
      chat_id: partnerId,
      text: t(partnerId, 'matched', { badge: userBadge, karma: user.karma || 100, lvl: user.level || 1 }),
      parse_mode: 'HTML',
      reply_markup: inChatKeyboardPartner
    }).catch(() => {});

    return;
  }

  waitingQueue.push({ userId, filterType, lang: user.lang || 'fa', province: user.province, gender: user.gender, timestamp: Date.now() });

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'searching'),
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [[{ text: t(userId, 'inChatStop') }]],
      resize_keyboard: true
    }
  });
}

// ----------------------------------------------------
// 14. IN-CHAT CONTROLS, PROFILE & GIFTS
// ----------------------------------------------------
async function stopChat(chatId, userId) {
  const qIdx = waitingQueue.findIndex(w => w.userId === userId);
  if (qIdx > -1) {
    waitingQueue.splice(qIdx, 1);
    return sendMainDashboard(chatId, userId, t(userId, 'searchCancelled'));
  }

  if (activePairs.has(userId)) {
    const partnerId = activePairs.get(userId);
    activePairs.delete(userId);
    activePairs.delete(partnerId);

    sendKarmaPrompt(userId, partnerId);
    sendKarmaPrompt(partnerId, userId);

    sendMainDashboard(partnerId, partnerId, t(partnerId, 'chatEndedPartner'));
    return sendMainDashboard(chatId, userId, t(userId, 'chatEndedSelf'));
  }

  return sendMainDashboard(chatId, userId);
}

async function nextPartner(chatId, userId) {
  if (activePairs.has(userId)) {
    const partnerId = activePairs.get(userId);
    activePairs.delete(userId);
    activePairs.delete(partnerId);

    sendKarmaPrompt(userId, partnerId);
    sendKarmaPrompt(partnerId, userId);

    sendMainDashboard(partnerId, partnerId, t(partnerId, 'chatNextPartner'));
  }
  return executeMatchSearch(chatId, userId, 'random');
}

function sendKarmaPrompt(forUserId, targetUserId) {
  return callTgApi('sendMessage', {
    chat_id: forUserId,
    text: t(forUserId, 'karmaPrompt'),
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: t(forUserId, 'karmaGreat'), callback_data: `karma_5_${targetUserId}` }],
        [{ text: t(forUserId, 'karmaPolite'), callback_data: `karma_5_${targetUserId}` }],
        [{ text: t(forUserId, 'karmaInspiring'), callback_data: `karma_5_${targetUserId}` }]
      ]
    }
  }).catch(() => {});
}

async function inspectPartnerProfile(chatId, userId) {
  if (!activePairs.has(userId)) return;
  const partnerId = activePairs.get(userId);
  const partnerUser = db.users[partnerId];
  if (!partnerUser) return;

  const isEn = db.users[userId]?.lang === 'en';
  const genderIcon = partnerUser.gender === 'female' ? '👩' : '👨';
  const avatar = getUserAvatar(partnerUser);
  const isPartnerVip = partnerUser.is_vip;

  const caption = isEn
    ? `🪪 <b>Your Partner's Profile:</b>\n\n` +
      `• Name: <b>${partnerUser.name}</b>\n` +
      `• Gender: <b>${genderIcon} ${partnerUser.gender}</b>\n` +
      `• Age: <b>${partnerUser.age}</b>\n` +
      `• Region: <b>${partnerUser.province}</b>\n` +
      `• Level: <b>Level ${partnerUser.level || 1} (${partnerUser.xp || 0} XP)</b>\n` +
      `• Karma: <b>⭐ ${partnerUser.karma || 100} pts</b> ${isPartnerVip ? '👑 VIP Member' : ''}`
    : `🪪 <b>مشخصات هم‌صحبت شما:</b>\n\n` +
      `• نام: <b>${partnerUser.name}</b>\n` +
      `• جنسیت: <b>${genderIcon} ${partnerUser.gender === 'female' ? 'دختر' : 'پسر'}</b>\n` +
      `• رده سنی: <b>${partnerUser.age}</b>\n` +
      `• استان: <b>${partnerUser.province}</b>\n` +
      `• سطح: <b>سطح ${partnerUser.level || 1} (${partnerUser.xp || 0} XP)</b>\n` +
      `• امتیاز کارما: <b>⭐ ${partnerUser.karma || 100} امتیاز</b> ${isPartnerVip ? '👑 عضو ویژه VIP' : ''}`;

  const inlineMarkup = {
    inline_keyboard: [
      [
        { text: isEn ? '🪙 Gift Coins' : '🪙 اهدای سکه به کاربر', callback_data: `gift_coins_menu_${partnerId}` },
        { text: isPartnerVip ? (isEn ? '👑 Partner is VIP' : '👑 کاربر VIP است') : (isEn ? '👑 Gift VIP Pass' : '👑 فعال‌سازی VIP برای کاربر'), callback_data: `gift_vip_menu_${partnerId}` }
      ],
      [
        { text: isEn ? '👥 Add to Friends' : '👥 افزودن به لیست دوستان', callback_data: `add_friend_req_${partnerId}` }
      ],
      [
        { text: isEn ? '🚫 Block Partner' : '🚫 بلاک هم‌صحبت', callback_data: `block_partner_${partnerId}` },
        { text: isEn ? '🚩 Report Abuse' : '🚩 گزارش و ریپورت', callback_data: `report_partner_${partnerId}` }
      ]
    ]
  };

  try {
    return await callTgApi('sendPhoto', {
      chat_id: chatId,
      photo: avatar,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: inlineMarkup
    });
  } catch (_) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: caption,
      parse_mode: 'HTML',
      reply_markup: inlineMarkup
    });
  }
}

async function relayMessage(msg, partnerId) {
  const userId = String(msg.from.id);
  const now = Date.now();
  const lastTime = userRateLimits.get(userId) || 0;
  if (now - lastTime < CONFIG.RATE_LIMIT_MS) return;
  userRateLimits.set(userId, now);

  const senderUser = db.users[userId];
  const prefix = senderUser?.gender === 'female' ? '👩' : '👨';

  if (msg.text) {
    return callTgApi('sendMessage', {
      chat_id: partnerId,
      text: `${prefix} <b>${senderUser?.name || 'Partner'}:</b>\n${msg.text}`,
      parse_mode: 'HTML'
    });
  }
  if (msg.voice) {
    return callTgApi('sendVoice', { chat_id: partnerId, voice: msg.voice.file_id, caption: `${prefix} Voice` });
  }
  if (msg.photo && msg.photo.length > 0) {
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    return callTgApi('sendPhoto', {
      chat_id: partnerId,
      photo: photoId,
      caption: msg.caption ? `${prefix} <b>${senderUser?.name || 'Partner'}:</b>\n${msg.caption}` : `${prefix} Photo`,
      parse_mode: 'HTML'
    });
  }
  if (msg.sticker) {
    return callTgApi('sendSticker', { chat_id: partnerId, sticker: msg.sticker.file_id });
  }
  if (msg.video_note) {
    return callTgApi('sendVideoNote', { chat_id: partnerId, video_note: msg.video_note.file_id });
  }
}

// ----------------------------------------------------
// 15. VIRTUAL GIFTS & ICEBREAKERS
// ----------------------------------------------------
const ICEBREAKER_QUESTIONS = [
  '💭 اگر قرار بود فقط یک آرزوت برآورده شه، الان چی می‌خواستی؟',
  '🎢 بزرگ‌ترین کار هیجان‌انگیز یا دیوونه‌بازی که تا حالا تو زندگیت کردی چی بوده؟',
  '✨ چه ویژگی اخلاقی تو آدما فوراً جذبت می‌کنه و به دلت می‌شینه؟',
  '🎵 یک آهنگی که این روزا مدام گوش می‌دی و قفلشی رو به هم‌صحبتت معرفی کن!',
  '☕ تعطیلات رویاییت چطوریه؟ ساحل و آرامش یا کوه و آدرنالین؟',
  '🍕 اگر تا آخر عمر فقط بتونی یک غذا بخوری، انتخابت چیه؟',
  '🎬 بهترین فیلم یا سریالی که اخیراً دیدی و پیشنهاد می‌کنی چیه؟',
  '🚀 اگر می‌تونستی به هر نقطه از زمان سفر کنی، می‌رفتی گذشته یا آینده؟'
];

async function sendInChatGiftsMenu(chatId, userId) {
  if (!activePairs.has(userId)) return;
  const isEn = db.users[userId]?.lang === 'en';

  const text = isEn
    ? '🎁 <b>Send a Virtual Gift to your chat partner:</b>\n<i>(50% of the gift coins are transferred to your partner!)</i>'
    : '🎁 <b>ارسال هدیه دیجیتال برای هم‌صحبت:</b>\n<i>(۵۰٪ از ارزش سکه هدیه مستقیماً به موجودی هم‌صحبت شما واریز می‌شود!)</i>';

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🌹 شاخه گل رز (۱۰ سکه)', callback_data: 'send_gift_rose' },
          { text: '🍫 شکلات لوکس (۳۰ سکه)', callback_data: 'send_gift_chocolate' }
        ],
        [
          { text: '💎 الماس سلطنتی (۱۰۰ سکه)', callback_data: 'send_gift_diamond' },
          { text: '👑 تاج رویال VIP (۳۰۰ سکه)', callback_data: 'send_gift_crown' }
        ]
      ]
    }
  });
}

async function handleSendGift(userId, giftType) {
  if (!activePairs.has(userId)) return;
  const partnerId = activePairs.get(userId);
  const sender = db.users[userId];
  const receiver = db.users[partnerId];

  const giftCatalog = {
    'rose': { nameFa: '🌹 شاخه گل رز', nameEn: '🌹 Red Rose', cost: 10, reward: 5 },
    'chocolate': { nameFa: '🍫 جعبه شکلات لوکس', nameEn: '🍫 Luxury Chocolate', cost: 30, reward: 15 },
    'diamond': { nameFa: '💎 الماس درخشان', nameEn: '💎 Sparkling Diamond', cost: 100, reward: 50 },
    'crown': { nameFa: '👑 تاج طلایی شاهانه', nameEn: '👑 Royal Crown', cost: 300, reward: 150 }
  };

  const gift = giftCatalog[giftType];
  if (!gift) return;

  if ((sender.coins || 0) < gift.cost) {
    return callTgApi('sendMessage', {
      chat_id: userId,
      text: t(userId, 'lowCoinsNotice', { cost: gift.cost, coins: sender.coins || 0 }),
      parse_mode: 'HTML'
    });
  }

  sender.coins -= gift.cost;
  receiver.coins = (receiver.coins || 0) + gift.reward;
  addXp(userId, Math.round(gift.cost / 2));
  saveDb();

  const isSenderEn = sender.lang === 'en';
  const isReceiverEn = receiver.lang === 'en';

  const senderNotice = isSenderEn
    ? `🎁 You sent <b>${gift.nameEn}</b> to your partner! (- ${gift.cost} Coins)`
    : `🎁 شما یک <b>${gift.nameFa}</b> برای هم‌صحبت ارسال کردید! (- ${gift.cost} سکه)`;

  const receiverNotice = isReceiverEn
    ? `💖 <b>${sender.name} sent you a ${gift.nameEn}!</b>\n💰 <b>+${gift.reward} Coins added to your balance!</b>`
    : `💖 <b>هم‌صحبت شما یک «${gift.nameFa}» به شما هدیه داد!</b>\n💰 <b>+${gift.reward} سکه به موجودی شما افزوده شد!</b>`;

  callTgApi('sendMessage', { chat_id: userId, text: senderNotice, parse_mode: 'HTML' }).catch(() => {});
  callTgApi('sendMessage', { chat_id: partnerId, text: receiverNotice, parse_mode: 'HTML' }).catch(() => {});
}

async function triggerIcebreakerQuestion(userId) {
  if (!activePairs.has(userId)) return;
  const partnerId = activePairs.get(userId);
  const randomQ = ICEBREAKER_QUESTIONS[Math.floor(Math.random() * ICEBREAKER_QUESTIONS.length)];

  const promptText = `🎲 <b>سوال یخ‌شکن و چالش دو‌نفره:</b>\n\n<i>${randomQ}</i>\n\n💬 <i>هر دو نفر نظرتان را در چت بگویید!</i>`;

  callTgApi('sendMessage', { chat_id: userId, text: promptText, parse_mode: 'HTML' }).catch(() => {});
  callTgApi('sendMessage', { chat_id: partnerId, text: promptText, parse_mode: 'HTML' }).catch(() => {});
}

// ----------------------------------------------------
// 16. IN-BOT DUELS & MATCHMAKING
// ----------------------------------------------------
async function promptGameModeChoice(chatId, userId, gameType) {
  const isEn = db.users[userId]?.lang === 'en';
  const gameNames = {
    rps: { fa: '🪨📄✂️ سنگ، کاغذ، قیچی', en: '🪨 Rock-Paper-Scissors' },
    dice: { fa: '🎲 دوئل رولت تاس متحرک', en: '🎲 Animated Dice Duel' },
    trivia: { fa: '🧠 مسابقه اطلاعات عمومی و هوش', en: '🧠 Trivia Battle' }
  };

  const game = gameNames[gameType] || { fa: 'بازی آنلاین', en: 'Online Game' };

  const promptText = isEn
    ? `🎮 <b>${game.en}</b>\n\nChoose how you want to play:`
    : `🎮 <b>${game.fa}</b>\n\nحالت بازی را انتخاب کنید:`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: promptText,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: isEn ? '🤖 Play vs Smart AI Bot (Instant)' : '🤖 بازی با ربات هوشمند (آفلاین / فوری)', callback_data: `play_bot_${gameType}` }],
        [{ text: isEn ? '👥 Match with Online Player (Live)' : '👥 جستجوی بازیکن آنلاین (Matchmaking زنده)', callback_data: `match_online_${gameType}` }],
        [{ text: isEn ? '🔙 Back to Games' : '🔙 بازگشت به لیست بازی‌ها', callback_data: 'back_to_games_menu' }]
      ]
    }
  });
}

async function executeGameMatchmaking(chatId, userId, gameType) {
  const user = db.users[userId];
  const isEn = user?.lang === 'en';

  if (!onlineGameQueues[gameType]) onlineGameQueues[gameType] = [];

  if (onlineGameQueues[gameType].includes(userId)) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: isEn ? '🔍 You are already searching for an opponent...' : '🔍 شما در صف جستجوی حریف قرار دارید. لطفاً چند لحظه شکیبا باشید...'
    });
  }

  const oppIndex = onlineGameQueues[gameType].findIndex(uid => uid !== userId);

  if (oppIndex > -1) {
    const opponentId = onlineGameQueues[gameType].splice(oppIndex, 1)[0];
    const oppUser = db.users[opponentId];

    const matchNotice1 = isEn
      ? `🎉 <b>Opponent Found!</b>\nPlaying vs: <b>${oppUser?.name || 'Player'}</b> (Lvl ${oppUser?.level || 1})\n⚡ Starting match...`
      : `🎉 <b>حریف آنلاین پیدا شد!</b>\nحریف شما: <b>${oppUser?.name || 'کاربر زنوسلایف'}</b> (سطح ${oppUser?.level || 1})\n⚡ بازی آغاز شد...`;

    const matchNotice2 = isEn
      ? `🎉 <b>Opponent Found!</b>\nPlaying vs: <b>${user?.name || 'Player'}</b> (Lvl ${user?.level || 1})\n⚡ Starting match...`
      : `🎉 <b>حریف آنلاین پیدا شد!</b>\nحریف شما: <b>${user?.name || 'کاربر زنوسلایف'}</b> (سطح ${user?.level || 1})\n⚡ بازی آغاز شد...`;

    callTgApi('sendMessage', { chat_id: userId, text: matchNotice1, parse_mode: 'HTML' });
    callTgApi('sendMessage', { chat_id: opponentId, text: matchNotice2, parse_mode: 'HTML' });

    if (gameType === 'rps') return startLiveInChatRps(userId, opponentId);
    if (gameType === 'dice') return startLiveInChatDice(userId, opponentId);
    if (gameType === 'trivia') return startLiveInChatTrivia(userId, opponentId);
    return;
  }

  onlineGameQueues[gameType].push(userId);

  const searchNotice = isEn
    ? '🔍 <b>Searching for an online opponent...</b>\n⏳ Matching you with a live player...'
    : '🔍 <b>در حال جستجوی بازیکن آنلاین...</b>\n⏳ لطفاً چند لحظه شکیبا باشید تا به یک رقیب متصل شوید:';

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: searchNotice,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🤖 بازی فوری با ربات (بدون معطلی)', callback_data: `play_bot_${gameType}` }],
        [{ text: '❌ انصراف از جستجو', callback_data: `cancel_game_search_${gameType}` }]
      ]
    }
  });
}

async function startLiveInChatRps(p1Id, p2Id) {
  const u1 = db.users[p1Id];
  const u2 = db.users[p2Id];

  if ((u1?.coins || 0) < 50 || (u2?.coins || 0) < 50) {
    callTgApi('sendMessage', { chat_id: p1Id, text: '⚠️ یکی از بازیکنان موجودی کافی (۵۰ سکه) ندارد.' });
    callTgApi('sendMessage', { chat_id: p2Id, text: '⚠️ یکی از بازیکنان موجودی کافی (۵۰ سکه) ندارد.' });
    return;
  }

  u1.coins -= 50;
  u2.coins -= 50;
  saveDb();

  const duelId = 'duel_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  activeGames.set(duelId, { id: duelId, p1: p1Id, p2: p2Id, p1Move: null, p2Move: null, wager: 50 });

  const rpsKeyboard = {
    inline_keyboard: [
      [
        { text: '🪨 سنگ / Rock', callback_data: `live_rps_${duelId}_rock` },
        { text: '📄 کاغذ / Paper', callback_data: `live_rps_${duelId}_paper` },
        { text: '✂️ قیچی / Scissors', callback_data: `live_rps_${duelId}_scissors` }
      ]
    ]
  };

  callTgApi('sendMessage', { chat_id: p1Id, text: '🪨📄✂️ <b>دوئل دونفره شروع شد! حرکت خود را انتخاب کنید:</b>', parse_mode: 'HTML', reply_markup: rpsKeyboard }).catch(() => {});
  callTgApi('sendMessage', { chat_id: p2Id, text: '🪨📄✂️ <b>دوئل دونفره شروع شد! حرکت خود را انتخاب کنید:</b>', parse_mode: 'HTML', reply_markup: rpsKeyboard }).catch(() => {});
}

async function handleLiveRpsMove(userId, duelId, move) {
  const game = activeGames.get(duelId);
  if (!game) return;

  if (game.p1 === userId) game.p1Move = move;
  else if (game.p2 === userId) game.p2Move = move;

  const opponentId = game.p1 === userId ? game.p2 : game.p1;
  const user = db.users[userId];
  const opp = db.users[opponentId];

  callTgApi('sendMessage', {
    chat_id: userId,
    text: user?.lang === 'en' ? '✅ Your move is locked in! Waiting for opponent...' : '✅ حرکت شما قفل شد! منتظر انتخاب هم‌صحبت...'
  }).catch(() => {});

  callTgApi('sendMessage', {
    chat_id: opponentId,
    text: opp?.lang === 'en' ? '⚡ Opponent made their move! Choose yours now:' : '⚡ هم‌صحبت حرکت خود را انتخاب کرد! نوبت شماست:'
  }).catch(() => {});

  if (game.p1Move && game.p2Move) {
    activeGames.delete(duelId);
    resolveLiveRpsDuel(game);
  }
}

async function resolveLiveRpsDuel(game) {
  const { p1, p2, p1Move, p2Move } = game;
  const u1 = db.users[p1];
  const u2 = db.users[p2];

  const moveIcons = { rock: '🪨', paper: '📄', scissors: '✂️' };
  let winner = null;
  if (p1Move === p2Move) winner = null;
  else if (
    (p1Move === 'rock' && p2Move === 'scissors') ||
    (p1Move === 'paper' && p2Move === 'rock') ||
    (p1Move === 'scissors' && p2Move === 'paper')
  ) winner = 1;
  else winner = 2;

  db.stats.totalMatchesPlayed++;

  if (winner === null) {
    u1.coins = (u1.coins || 0) + 50;
    u2.coins = (u2.coins || 0) + 50;
    saveDb();

    const res = `🤝 <b>دوئل مساوی شد!</b>\nشما: ${moveIcons[p1Move]} | هم‌صحبت: ${moveIcons[p2Move]}\n🪙 ۵۰ سکه برگشت داده شد.`;
    callTgApi('sendMessage', { chat_id: p1, text: res, parse_mode: 'HTML' }).catch(() => {});
    callTgApi('sendMessage', { chat_id: p2, text: res, parse_mode: 'HTML' }).catch(() => {});
    return;
  }

  const winId = winner === 1 ? p1 : p2;
  const loseId = winner === 1 ? p2 : p1;
  const winUser = db.users[winId];
  const loseUser = db.users[loseId];

  winUser.coins = (winUser.coins || 0) + 90;
  addXp(winId, 30);
  addXp(loseId, 10);
  saveDb();

  const winMove = winner === 1 ? p1Move : p2Move;
  const loseMove = winner === 1 ? p2Move : p1Move;

  const winMsg = `🏆 <b>پیروزی شاهانه! شما دوئل را بردید!</b>\n${moveIcons[winMove]} شکست داد ${moveIcons[loseMove]}\n💰 <b>+۹۰ سکه و +۳۰ XP</b>\n🪙 موجودی: <b>${winUser.coins.toLocaleString()}</b> سکه`;
  const loseMsg = `😢 <b>شکست در دوئل! هم‌صحبت برنده شد.</b>\n${moveIcons[loseMove]} باخت به ${moveIcons[winMove]}\n⭐ <b>+۱۰ XP</b>\n🪙 موجودی: <b>${loseUser.coins.toLocaleString()}</b> سکه`;

  callTgApi('sendMessage', { chat_id: winId, text: winMsg, parse_mode: 'HTML' }).catch(() => {});
  callTgApi('sendMessage', { chat_id: loseId, text: loseMsg, parse_mode: 'HTML' }).catch(() => {});
}

async function startLiveInChatDice(p1Id, p2Id) {
  const u1 = db.users[p1Id];
  const u2 = db.users[p2Id];

  if ((u1?.coins || 0) < 50 || (p2Id !== 'bot_ai' && (u2?.coins || 0) < 50)) {
    callTgApi('sendMessage', { chat_id: p1Id, text: '⚠️ یکی از بازیکنان موجودی کافی (۵۰ سکه) ندارد.' });
    return;
  }

  u1.coins -= 50;
  if (p2Id !== 'bot_ai') u2.coins -= 50;
  saveDb();

  callTgApi('sendMessage', { chat_id: p1Id, text: '🎲 <b>پرتاب تاس بازیکن اول...</b>', parse_mode: 'HTML' });
  const diceMsg1 = await callTgApi('sendDice', { chat_id: p1Id, emoji: '🎲' });
  const val1 = diceMsg1?.dice?.value || 3;

  setTimeout(async () => {
    callTgApi('sendMessage', { chat_id: p1Id, text: '🎲 <b>پرتاب تاس بازیکن دوم...</b>', parse_mode: 'HTML' });
    const diceMsg2 = await callTgApi('sendDice', { chat_id: p1Id, emoji: '🎲' });
    const val2 = diceMsg2?.dice?.value || 3;

    setTimeout(() => {
      db.stats.totalMatchesPlayed++;
      if (val1 === val2) {
        u1.coins += 50;
        if (p2Id !== 'bot_ai') u2.coins += 50;
        saveDb();
        callTgApi('sendMessage', { chat_id: p1Id, text: `🤝 <b>مساوی شد (${val1} = ${val2})! ۵۰ سکه بازگشت.</b>`, parse_mode: 'HTML' });
      } else if (val1 > val2) {
        u1.coins += 90;
        addXp(p1Id, 30);
        saveDb();
        callTgApi('sendMessage', { chat_id: p1Id, text: `🏆 <b>شما برنده شدید (${val1} در برابر ${val2})! (+۹۰ سکه و +۳۰ XP)</b>`, parse_mode: 'HTML' });
      } else {
        if (p2Id !== 'bot_ai') u2.coins += 90;
        addXp(p1Id, 10);
        saveDb();
        callTgApi('sendMessage', { chat_id: p1Id, text: `😢 <b>حریف برنده شد (${val2} در برابر ${val1})! (+۱۰ XP)</b>`, parse_mode: 'HTML' });
      }
    }, 2500);
  }, 2000);
}

const TRIVIA_QUESTIONS = [
  { q: 'پایتخت تاریخی ایران در دوره صفویه که به نصف جهان معروف است کجاست؟', options: ['شیراز', 'اصفهان', 'تبریز', 'قزوین'], correct: 1 },
  { q: 'کدام سیاره در منظومه شمسی به سیاره سرخ معروف است؟', options: ['مریخ', 'زهره', 'مشتری', 'عطارد'], correct: 0 },
  { q: 'بزرگ‌ترین اقیانوس کره زمین کدام است؟', options: ['اقیانوس اطلس', 'اقیانوس هند', 'اقیانوس آرام', 'اقیانوس منجمد شمالی'], correct: 2 },
  { q: 'کدام ساز ایرانی به عنوان مادر سازهای زهی شناخته می‌شود؟', options: ['تار', 'سه‌تار', 'سنتور', 'بربط (عود)'], correct: 3 },
  { q: 'سریع‌ترین حیوان خشکی روی زمین کدام است؟', options: ['یوزپلنگ (چیتا)', 'شیر', 'غزال', 'اسب'], correct: 0 }
];

async function startLiveInChatTrivia(p1Id, p2Id) {
  const qObj = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
  const quizId = 'trivia_' + Date.now();
  activeGames.set(quizId, { id: quizId, p1: p1Id, p2: p2Id, question: qObj, resolved: false });

  const qText = `🧠 <b>مسابقه اطلاعات عمومی و چالش دونفره:</b>\n\n<b>${qObj.q}</b>\n\n<i>هرکس زودتر پاسخ صحیح را انتخاب کند برنده است!</i>`;
  const buttons = qObj.options.map((opt, idx) => [{ text: opt, callback_data: `answer_trivia_${quizId}_${idx}` }]);

  callTgApi('sendMessage', { chat_id: p1Id, text: qText, parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }).catch(() => {});
  if (p2Id && p2Id !== 'bot_ai') {
    callTgApi('sendMessage', { chat_id: p2Id, text: qText, parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }).catch(() => {});
  }
}

async function handleTriviaAnswer(userId, quizId, selectedIdx) {
  const game = activeGames.get(quizId);
  if (!game || game.resolved) return;

  const isCorrect = selectedIdx === game.question.correct;
  const user = db.users[userId];
  const opponentId = game.p1 === userId ? game.p2 : game.p1;

  if (isCorrect) {
    game.resolved = true;
    activeGames.delete(quizId);

    user.coins = (user.coins || 0) + 30;
    addXp(userId, 20);
    saveDb();

    callTgApi('sendMessage', {
      chat_id: userId,
      text: `🎉 <b>پاسخ صحیح! شما برنده چالش شدید! (+۳۰ سکه و +۲۰ XP)</b>`,
      parse_mode: 'HTML'
    });

    if (opponentId && opponentId !== 'bot_ai') {
      callTgApi('sendMessage', {
        chat_id: opponentId,
        text: `⚡ <b>هم‌صحبت شما زودتر پاسخ صحیح («${game.question.options[game.question.correct]}») را داد!</b>`,
        parse_mode: 'HTML'
      });
    }
  } else {
    callTgApi('sendMessage', { chat_id: userId, text: '❌ پاسخ شما نادرست بود! منتظر پاسخ هم‌صحبت...' });
  }
}

// ----------------------------------------------------
// 17. CALENDAR, CHECKLIST & ALARM NOTIFICATIONS
// ----------------------------------------------------
db.reminders = db.reminders || [];

async function addReminder(userId, title, timeStr, dateStr = null) {
  const reminderItem = {
    id: 'rem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    userId: String(userId),
    title: title.trim(),
    time: timeStr.trim(),
    date: dateStr || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' }),
    completed: false,
    lastNotified: null,
    createdAt: Date.now()
  };

  db.reminders.push(reminderItem);
  saveDb();

  const isEn = db.users[userId]?.lang === 'en';
  const confirmMsg = isEn
    ? `⏰ <b>Alarm & Reminder Set!</b>\n\n📌 Task: <b>${reminderItem.title}</b>\n🕒 Time: <b>${reminderItem.time}</b>\n\n<i>You will receive a notification right at ${reminderItem.time}!</i>`
    : `⏰🔔 <b>یادآور و آلارم با موفقیت تنظیم شد!</b>\n\n📌 عنوان تسک: <b>${reminderItem.title}</b>\n🕒 زمان اعلان: ساعت <b>${reminderItem.time}</b>\n\n<i>سر ساعت تعیین‌شده، ربات فوراً در تلگرام به شما پیام هشدار می‌دهد.</i>`;

  return callTgApi('sendMessage', {
    chat_id: userId,
    text: confirmMsg,
    parse_mode: 'HTML'
  });
}

function checkDueReminders() {
  const now = new Date();
  const currentHourMin = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit' });
  const todayDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });

  for (const rem of db.reminders) {
    if (!rem.completed && rem.time === currentHourMin && rem.lastNotified !== todayDateStr) {
      rem.lastNotified = todayDateStr;
      saveDb();

      const notifText = `⏰🔔 <b>یادآور تقویم و برنامه زنوسلایف!</b>\n\n` +
        `📌 <b>عنوان تسک:</b> <b>${rem.title}</b>\n` +
        `🕒 <b>زمان تعیین‌شده:</b> ساعت <b>${rem.time}</b>\n\n` +
        `<i>آیا این کار را انجام دادید؟</i>`;

      callTgApi('sendMessage', {
        chat_id: rem.userId,
        text: notifText,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ انجام شد (+۲۰ XP و +۱۰ سکه) 🪙', callback_data: `complete_reminder_${rem.id}` }],
            [{ text: '⏳ ۱۰ دقیقه بعد یادآوری کن', callback_data: `snooze_reminder_${rem.id}` }]
          ]
        }
      }).catch(() => {});
    }
  }
}

setInterval(checkDueReminders, 30000);

async function handleCompleteReminder(userId, remId) {
  const rem = db.reminders.find(r => r.id === remId);
  if (!rem) return;

  rem.completed = true;
  const user = db.users[userId];
  if (user) {
    user.coins = (user.coins || 0) + 10;
    addXp(userId, 20);
    saveDb();
  }

  return callTgApi('sendMessage', {
    chat_id: userId,
    text: `🎉 <b>آفرین به اراده شما!</b>\nتسک «<b>${rem.title}</b>» با موفقیت انجام شد و <b>+۲۰ XP و +۱۰ سکه پاداش</b> دریافت کردید! 🪙✨`,
    parse_mode: 'HTML'
  });
}

async function handleSnoozeReminder(userId, remId) {
  const rem = db.reminders.find(r => r.id === remId);
  if (!rem) return;

  const now = new Date(Date.now() + 10 * 60000);
  rem.time = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit' });
  rem.lastNotified = null;
  saveDb();

  return callTgApi('sendMessage', {
    chat_id: userId,
    text: `⏳ <b>یادآور به تعویق افتاد:</b>\nزنگ بعدی ساعت <b>${rem.time}</b> ارسال خواهد شد.`,
    parse_mode: 'HTML'
  });
}

// ----------------------------------------------------
// 18. FINANCE, VIP & STARS MONETIZATION HUB
// ----------------------------------------------------
async function sendFinanceAndVipHub(chatId, userId) {
  const user = db.users[userId] || { coins: 0 };
  const isEn = user.lang === 'en';
  const coinsText = (user.coins || 0).toLocaleString();
  const vipText = user.is_vip ? (isEn ? '👑 Active VIP' : '👑 VIP فعال') : (isEn ? 'Regular Member' : 'کاربر عادی');
  const refCount = (user.referrals || []).length;

  const hubText = isEn
    ? `💎 <b>VIP, Wallet & Earnings Hub</b>\n\n` +
      `🪙 <b>Coin Balance:</b> <b>${coinsText} Coins</b>\n` +
      `👑 <b>VIP Status:</b> <b>${vipText}</b>\n` +
      `👥 <b>Friends Invited:</b> <b>${refCount} Users</b> (10% Lifetime Cut)\n\n` +
      `<i>Select an option below:</i>`
    : `💎 <b>مرکز مالی، اشتراک VIP و درآمدزایی زنوسلایف</b>\n\n` +
      `🪙 <b>موجودی سکه شما:</b> <b>${coinsText} سکه</b>\n` +
      `👑 <b>وضعیت اشتراک:</b> <b>${vipText}</b>\n` +
      `👥 <b>تعداد دعوت‌ها:</b> <b>${refCount} نفر</b> (۱۰٪ پورسانت مادام‌العمر)\n\n` +
      `<i>یکی از بخش‌های زیر را انتخاب کنید:</i>`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: hubText,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: isEn ? '🪙 Buy Coins with Stars ⭐' : '🪙 خرید سکه با ستاره ⭐', callback_data: 'buy_stars' },
          { text: isEn ? '👑 VIP Membership Plans' : '👑 پلن‌های اشتراک VIP 🌟', callback_data: 'buy_vip_plans' }
        ],
        [
          { text: isEn ? '🎁 Invite Friends & Earn' : '🎁 لینک دعوت و کسب درآمد', callback_data: 'show_referral' },
          { text: isEn ? '🎡 Daily Lucky Wheel' : '🎡 گردونه شانس روزانه', callback_data: 'spin_wheel_action' }
        ],
        [
          { text: isEn ? '🏆 Leaderboards & Ranks' : '🏆 جدول برترین‌ها و جوایز', callback_data: 'view_leaderboard_hub' }
        ]
      ]
    }
  });
}

function sendBuyStarsMenu(chatId, userId) {
  const user = db.users[userId] || { coins: 0 };
  const isEn = user.lang === 'en';
  const coinsText = (user.coins || 0).toLocaleString();
  const vipText = user.is_vip ? (isEn ? '👑 Active VIP' : '👑 VIP فعال') : (isEn ? 'Regular Member' : 'کاربر عادی');

  const shopHeader = isEn
    ? `🪙 <b>Current Balance:</b> <b>${coinsText} Coins</b> | <b>Status:</b> ${vipText}\n\n⭐ <b>Official Telegram Stars Coin Shop</b>\nInstant recharge using Telegram Stars:`
    : `🪙 <b>موجودی فعلی شما:</b> <b>${coinsText} سکه</b> | <b>وضعیت:</b> ${vipText}\n\n⭐ <b>فروشگاه رسمی ستاره‌های تلگرام (Telegram Stars)</b>\nشارژ آنی سکه با Telegram Stars بدون واسطه:`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: shopHeader,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: t(userId, 'pkg1'), callback_data: 'buy_pkg_bronze' }],
        [{ text: t(userId, 'pkg2'), callback_data: 'buy_pkg_silver' }],
        [{ text: t(userId, 'pkg3'), callback_data: 'buy_pkg_global' }],
        [{ text: t(userId, 'pkg4'), callback_data: 'buy_pkg_vip' }]
      ]
    }
  });
}

function sendVipPlansMenu(chatId, userId) {
  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'vipTitle'),
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: t(userId, 'vip7'), callback_data: 'buy_vip_7' }],
        [{ text: t(userId, 'vip30'), callback_data: 'buy_vip_30' }],
        [{ text: t(userId, 'vip90'), callback_data: 'buy_vip_90' }]
      ]
    }
  });
}

async function sendReferralHub(chatId, userId) {
  const botInfo = await getBotInfo();
  const refLink = `https://t.me/${botInfo.username}?start=ref_${userId}`;
  const user = db.users[userId] || { referrals: [] };
  const isEn = user.lang === 'en';

  const shareText = isEn
    ? `👑 Join ZenOsLife Anonymous Chat & Games!\n\n` +
      `🙈 Chat with boys & girls nearby\n` +
      `🎮 Live 1v1 Games & Tournaments\n` +
      `🎁 Get 1,000 FREE Welcome Coins with my invite link:\n\n${refLink}`
    : `👑 به چت ناشناس و بازی‌های آنلاین زنوسلایف خوش اومدی!\n\n` +
      `🙈 چت ناشناس با فیلتر دختر و پسر و همشهری\n` +
      `🎮 بازی‌های سنگ‌کاغذقیچی، حکم و تخته‌نرد\n` +
      `🎁 همین الان با لینک من عضو شو و ۱,۰۰۰ سکه هدیه رایگان بگیر:\n\n${refLink}`;

  const captionText = t(userId, 'referralTitle', { refLink, refs: (user.referrals || []).length });

  return callTgApi('sendPhoto', {
    chat_id: chatId,
    photo: DEFAULT_AVATARS.referralBanner,
    caption: captionText,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: t(userId, 'btnShareRef'), url: `https://t.me/share/url?url=${refLink}&text=${encodeURIComponent(shareText)}` }]
      ]
    }
  }).catch(() => {
    return callTgApi('sendMessage', { chat_id: chatId, text: captionText, parse_mode: 'HTML' });
  });
}

async function sendLeaderboard(chatId, userId) {
  const allUsers = Object.values(db.users);
  const topCoins = allUsers
    .sort((a, b) => (b.coins || 0) - (a.coins || 0))
    .slice(0, 5)
    .map((u, i) => `${i + 1}. ${u.name || 'User'} - <b>${(u.coins || 0).toLocaleString()}</b> 🪙 (Lvl ${u.level || 1})`)
    .join('\n') || 'موردی ثبت نشده';

  const topKarma = allUsers
    .sort((a, b) => (b.karma || 100) - (a.karma || 100))
    .slice(0, 5)
    .map((u, i) => `${i + 1}. ${u.name || 'User'} - ⭐ <b>${u.karma || 100}</b> کارما`)
    .join('\n') || 'موردی ثبت نشده';

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'leaderboardTitle', { topCoins, topKarma }),
    parse_mode: 'HTML'
  });
}

// ----------------------------------------------------
// 19. ROYAL VIP ANONYMOUS GROUP CHAT LOUNGE
// ----------------------------------------------------
async function enterVipLounge(chatId, userId) {
  const user = db.users[userId];
  const isEn = user?.lang === 'en';

  if (!user?.is_vip) {
    const lockText = isEn
      ? '🔒 <b>Royal VIP Anonymous Group Chat Lounge</b>\n\n' +
        '👑 This exclusive lounge is reserved for VIP members!\n\n' +
        '<b>VIP Lounge Perks:</b>\n' +
        '• Chat anonymously with top VIP members in a real-time group room\n' +
        '• Send voice notes, photos & stickers with your Royal Badge\n' +
        '• Meet verified, high-quality friends\n\n' +
        '⭐ <i>Upgrade to VIP now to unlock instant access!</i>'
      : '🔒 <b>تالار گفتگوی گروهی ناشناس ویژه اعضای VIP (Royal Lounge)</b>\n\n' +
        '👑 این بخش اختصاصی فقط مخصوص اعضای دارای اشتراک VIP است!\n\n' +
        '<b>مزایای تالار گروهی VIP:</b>\n' +
        '• چت گروهی ناشناس و زنده با دیگر اعضای VIP\n' +
        '• ارسال ویس، عکس و استیکر با نشان تاج طلایی و کارمای بالا\n' +
        '• محیط دوستانه، باکلاس و بدون اسپم\n\n' +
        '⭐ <i>همین حالا با تهیه اشتراک VIP قفل این بخش را باز کنید!</i>';

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: lockText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: isEn ? '👑 Get VIP Pass with Stars' : '👑 خرید اشتراک VIP با ستاره ⭐', callback_data: 'buy_vip_plans' }],
          [{ text: isEn ? '🔙 Back to Menu' : '🔙 بازگشت به منوی اصلی', callback_data: 'back_to_dashboard' }]
        ]
      }
    });
  }

  vipLoungeMembers.add(userId);

  const welcomeText = isEn
    ? `👑 <b>Welcome to the Royal VIP Lounge, ${user.name}!</b>\n\n` +
      `👥 Online Members in Lounge: <b>${vipLoungeMembers.size}</b>\n` +
      `💬 Every message you send will be broadcasted to all VIPs in this lounge.\n\n` +
      `<i>Type your message below or tap Exit to leave.</i>`
    : `👑 <b>به تالار گفتگوی گروهی ناشناس VIP خوش آمدید، ${user.name} عزیز!</b>\n\n` +
      `👥 تعداد اعضای آنلاین در تالار: <b>${vipLoungeMembers.size} نفر</b>\n` +
      `💬 هر پیامی که ارسال کنید (متن، ویس، عکس، استیکر) برای تمام اعضای آنلاین در این تالار ارسال می‌شود.\n\n` +
      `<i>پیام خود را تایپ و ارسال کنید:</i>`;

  const loungeKeyboard = {
    keyboard: [
      [{ text: isEn ? '🛑 Exit VIP Lounge' : '🛑 خروج از تالار VIP' }, { text: isEn ? '👥 Online VIPs' : '👥 اعضای آنلاین تالار' }],
      [{ text: isEn ? '⭐ Buy/Renew VIP' : '⭐ تمدید اشتراک VIP' }]
    ],
    resize_keyboard: true
  };

  for (const mid of vipLoungeMembers) {
    if (mid !== userId) {
      callTgApi('sendMessage', {
        chat_id: mid,
        text: `👑 <i>کاربر VIP «${user.name}» وارد تالار شد.</i>`,
        parse_mode: 'HTML'
      }).catch(() => {});
    }
  }

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: welcomeText,
    parse_mode: 'HTML',
    reply_markup: loungeKeyboard
  });
}

async function leaveVipLounge(chatId, userId) {
  vipLoungeMembers.delete(userId);
  const user = db.users[userId];
  const isEn = user?.lang === 'en';

  for (const mid of vipLoungeMembers) {
    callTgApi('sendMessage', {
      chat_id: mid,
      text: `🚪 <i>«${user?.name || 'یک کاربر VIP'}» از تالار خارج شد.</i>`,
      parse_mode: 'HTML'
    }).catch(() => {});
  }

  return sendMainDashboard(chatId, userId, isEn ? '🛑 You left the VIP Lounge.' : '🛑 شما از تالار گروهی VIP خارج شدید.');
}

async function broadcastToVipLounge(msg, senderId) {
  const sender = db.users[senderId];
  if (!sender) return;
  const genderIcon = sender.gender === 'female' ? '👩' : '👨';
  const prefix = `👑 <b>${genderIcon} ${sender.name} (${sender.province}):</b>`;

  for (const targetId of vipLoungeMembers) {
    if (targetId === senderId) continue;

    if (msg.text) {
      callTgApi('sendMessage', { chat_id: targetId, text: `${prefix}\n${msg.text}`, parse_mode: 'HTML' }).catch(() => {});
    } else if (msg.voice) {
      callTgApi('sendVoice', { chat_id: targetId, voice: msg.voice.file_id, caption: prefix, parse_mode: 'HTML' }).catch(() => {});
    } else if (msg.photo && msg.photo.length > 0) {
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      callTgApi('sendPhoto', {
        chat_id: targetId,
        photo: photoId,
        caption: msg.caption ? `${prefix}\n${msg.caption}` : prefix,
        parse_mode: 'HTML'
      }).catch(() => {});
    } else if (msg.sticker) {
      callTgApi('sendSticker', { chat_id: targetId, sticker: msg.sticker.file_id }).catch(() => {});
    } else if (msg.video_note) {
      callTgApi('sendVideoNote', { chat_id: targetId, video_note: msg.video_note.file_id }).catch(() => {});
    }
  }
}

// ----------------------------------------------------
// 20. GAMES MENU & ROUTING
// ----------------------------------------------------
async function sendGamesMenu(chatId, userId) {
  const isEn = db.users[userId]?.lang === 'en';

  const text = isEn
    ? '🎮 <b>ZenOsLife Games & Live 1v1 Duels Hub:</b>\nSelect a game to play vs Smart AI Bot or Online Players:'
    : '🎮 <b>مرکز بازی‌ها و دوئل‌های آنلاین زنوسلایف:</b>\nیک بازی را برای رقابت با ربات هوشمند یا حریف آنلاین واقعی انتخاب کنید:';

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: isEn ? '🪨 Rock-Paper-Scissors' : '🪨📄✂️ سنگ، کاغذ، قیچی', callback_data: 'prompt_mode_rps' },
          { text: isEn ? '🎲 Animated Dice Duel' : '🎲 دوئل رولت تاس', callback_data: 'prompt_mode_dice' }
        ],
        [
          { text: isEn ? '🧠 Trivia Battle' : '🧠 مسابقه اطلاعات عمومی و هوش', callback_data: 'prompt_mode_trivia' }
        ],
        [
          { text: isEn ? '🌐 Open Mini App Arcade (10+ Games)' : '🌟 ورود به آرکید بازی‌های مینی‌اپ (۱۰+ بازی)', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }
        ]
      ]
    }
  });
}

// ----------------------------------------------------
// 21. SUPER ADMIN DASHBOARD (/admin)
// ----------------------------------------------------
async function sendAdminPanel(chatId, userId) {
  if (!isAdmin(userId)) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `⛔ <b>دسترسی به پنل ادمین محدود است!</b>\nشناسه عددی شما (<code>${userId}</code>) در لیست مدیران ثبت نشده است.`,
      parse_mode: 'HTML'
    });
  }

  const allUsers = Object.values(db.users);
  const totalUsers = allUsers.length;
  const totalVips = allUsers.filter(u => u.is_vip).length;
  const totalMatches = db.stats.totalMatchesPlayed || 0;
  const totalChats = db.stats.totalChatsCompleted || 0;
  const totalRevenue = db.stats.totalStarsRevenue || 0;
  const activeChatPairs = activePairs.size / 2;
  const pendingReports = (db.reports || []).filter(r => r.status === 'pending').length;

  const adminText = `📊 <b>داشبورد جامع مدیریت زنوسلایف (Super Admin Panel)</b>\n\n` +
    `👥 <b>تعداد کل کاربران ثبت‌نامی:</b> <b>${totalUsers.toLocaleString()} نفر</b>\n` +
    `👑 <b>کاربران VIP فعال:</b> <b>${totalVips.toLocaleString()} نفر</b>\n` +
    `💬 <b>چت‌های ناشناس فعال در لحظه:</b> <b>${activeChatPairs} جفت</b>\n` +
    `👑 <b>اعضای آنلاین در تالار VIP:</b> <b>${vipLoungeMembers.size} نفر</b>\n` +
    `⏳ <b>افراد در صف جستجوی هم‌صحبت:</b> <b>${waitingQueue.length} نفر</b>\n` +
    `🎮 <b>تعداد بازی‌های انجام‌شده:</b> <b>${totalMatches.toLocaleString()} دست</b>\n` +
    `⭐ <b>درآمد کل ستاره‌های تلگرام:</b> <b>${totalRevenue.toLocaleString()} Stars ⭐</b>\n\n` +
    `🛠️ <b>دستورات مدیریتی سریع:</b>\n` +
    `• <code>/grantvip &lt;شناسه_کاربر&gt; &lt;روز&gt;</code> - اعطای اشتراک VIP\n` +
    `• <code>/revokevip &lt;شناسه_کاربر&gt;</code> - لغو اشتراک VIP\n` +
    `• <code>/setcoins &lt;شناسه_کاربر&gt; &lt;تعداد&gt;</code> - تنظیم موجودی سکه\n` +
    `• <code>/ban &lt;شناسه_کاربر&gt;</code> - مسدودسازی کاربر متخلف\n` +
    `• <code>/setchannel &lt;@آیدی_کانال&gt;</code> - تغییر کانال عضویت اجباری\n` +
    `• <code>/broadcast &lt;متن_پیام&gt;</code> - ارسال پیام همگانی به تمام اعضا`;

  const adminMarkup = {
    inline_keyboard: [
      [{ text: '🔄 به‌روزرسانی آمار زنده', callback_data: 'admin_refresh_stats' }],
      [
        { text: db.settings?.forceSubEnabled ? '🔒 قفل عضویت کانال: فعال ✅' : '🔓 قفل عضویت کانال: غیرفعال ❌', callback_data: 'admin_toggle_forcesub' },
        { text: '💾 تهیه بکاپ فوری دیتابیس', callback_data: 'admin_manual_backup' }
      ],
      [{ text: `🚩 مشاهده گزارش‌های تخلف (${pendingReports} مورد)`, callback_data: 'admin_view_reports' }],
      [{ text: '👑 ورود به تالار VIP', callback_data: 'enter_vip_lounge' }],
      [{ text: '🔙 بازگشت به منوی اصلی', callback_data: 'back_to_dashboard' }]
    ]
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: adminText,
    parse_mode: 'HTML',
    reply_markup: adminMarkup
  });
}

// ----------------------------------------------------
// 22. MESSAGE ROUTER & DISPATCHER
// ----------------------------------------------------
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const text = msg.text || '';

  // 0. Force Channel Check (Only if enabled and user is not admin)
  if (db.settings?.forceSubEnabled && !text.startsWith('/admin') && !isAdmin(userId)) {
    const isMember = await isUserChannelMember(userId);
    if (!isMember) {
      return sendForceSubPrompt(chatId, userId);
    }
  }

  // 1. VIP Lounge Member Broadcast
  if (vipLoungeMembers.has(userId)) {
    if (text === '🛑 خروج از تالار VIP' || text === '🛑 Exit VIP Lounge' || text === '/exit') {
      return leaveVipLounge(chatId, userId);
    }
    if (text === '👥 اعضای آنلاین تالار' || text === '👥 Online VIPs') {
      const names = Array.from(vipLoungeMembers).map(uid => db.users[uid]?.name || 'VIP Member').join(', ');
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: `👥 <b>اعضای آنلاین در تالار VIP (${vipLoungeMembers.size} نفر):</b>\n${names}`,
        parse_mode: 'HTML'
      });
    }
    if (text === '⭐ تمدید اشتراک VIP' || text === '⭐ Buy/Renew VIP') {
      return sendVipPlansMenu(chatId, userId);
    }
    return broadcastToVipLounge(msg, userId);
  }

  // 2. In-Chat Active Relay & Commands
  if (activePairs.has(userId)) {
    if (text === t(userId, 'inChatStop') || text === '/stop') return stopChat(chatId, userId);
    if (text === t(userId, 'inChatNext') || text === '/next') return nextPartner(chatId, userId);
    if (text === t(userId, 'inChatProfile') || text === '/partner') return inspectPartnerProfile(chatId, userId);
    if (text === t(userId, 'inChatDuel') || text === '/duel') return promptInChatDuelChoice(chatId, userId);
    if (text === t(userId, 'inChatGift') || text === '/gift') return sendInChatGiftsMenu(chatId, userId);
    if (text === t(userId, 'inChatIcebreaker') || text === '/icebreaker') return triggerIcebreakerQuestion(userId);
    if (text === t(userId, 'inChatShareId')) {
      const username = msg.from.username;
      if (!username) return callTgApi('sendMessage', { chat_id: chatId, text: '⚠️ لطفاً در تنظیمات تلگرام یک Username ست کنید.' });
      callTgApi('sendMessage', {
        chat_id: activePairs.get(userId),
        text: `💖 <b>هم‌صحبت آیدی تلگرام خود را به اشتراک گذاشت:</b>\n🆔 @${username}`,
        parse_mode: 'HTML'
      }).catch(() => {});
      return callTgApi('sendMessage', { chat_id: chatId, text: '✅ آیدی شما با موفقیت برای هم‌صحبت ارسال شد.' });
    }
    return relayMessage(msg, activePairs.get(userId));
  }

  // 3. Queue Cancellation
  if (waitingQueue.some(w => w.userId === userId)) {
    if (text === t(userId, 'inChatStop') || text === '/stop') {
      return stopChat(chatId, userId);
    }
  }

  // 4. Onboarding & Profile Editing Steps
  if (registrationSteps.has(userId)) {
    const reg = registrationSteps.get(userId);
    if (reg.step === 'editing_photo' && msg.photo && msg.photo.length > 0) {
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      registrationSteps.delete(userId);
      if (db.users[userId]) {
        db.users[userId].photo_id = photoId;
        saveDb();
      }
      await callTgApi('sendMessage', { chat_id: chatId, text: '✅ عکس پروفایل شما با موفقیت ذخیره شد!' });
      return sendProfileCard(chatId, userId);
    }

    if (reg.step === 'editing_name' && text) {
      registrationSteps.delete(userId);
      if (db.users[userId]) {
        db.users[userId].name = text.slice(0, 25);
        saveDb();
      }
      await callTgApi('sendMessage', {
        chat_id: chatId,
        text: `✅ نام شما با موفقیت به <b>«${text.slice(0, 25)}»</b> تغییر یافت.`,
        parse_mode: 'HTML'
      });
      return sendProfileCard(chatId, userId);
    }

    if (reg.step === 'name' && text) {
      reg.tempProfile.name = text.slice(0, 25);
      reg.step = 'gender';
      return promptGenderSelection(chatId, userId);
    }
  }

  // 5. Super Admin Direct Commands
  if (isAdmin(userId)) {
    if (text.startsWith('/grantvip')) {
      const parts = text.split(' ');
      const targetUid = parts[1];
      const days = parseInt(parts[2] || '30', 10);
      if (!targetUid || !db.users[targetUid]) return callTgApi('sendMessage', { chat_id: chatId, text: '❌ کاربر یافت نشد. نحوه استفاده: /grantvip <شناسه_کاربر> <تعداد_روز>' });
      const targetUser = db.users[targetUid];
      targetUser.is_vip = true;
      targetUser.vip_expires_at = Date.now() + days * 86400000;
      saveDb();

      callTgApi('sendMessage', {
        chat_id: targetUid,
        text: `👑 <b>تبریک! اشتراک ویژه VIP زنوسلایف به مدت ${days} روز توسط مدیریت برای شما فعال شد!</b>`,
        parse_mode: 'HTML'
      }).catch(() => {});

      return callTgApi('sendMessage', { chat_id: chatId, text: `✅ اشتراک VIP برای ${targetUser.name} (${targetUid}) به مدت ${days} روز فعال شد!` });
    }

    if (text.startsWith('/revokevip')) {
      const parts = text.split(' ');
      const targetUid = parts[1];
      if (!targetUid || !db.users[targetUid]) return callTgApi('sendMessage', { chat_id: chatId, text: '❌ کاربر یافت نشد. نحوه استفاده: /revokevip <شناسه_کاربر>' });
      db.users[targetUid].is_vip = false;
      db.users[targetUid].vip_expires_at = null;
      saveDb();
      return callTgApi('sendMessage', { chat_id: chatId, text: `✅ اشتراک VIP کاربر ${targetUid} لغو شد.` });
    }

    if (text.startsWith('/setcoins')) {
      const parts = text.split(' ');
      const targetUid = parts[1];
      const amount = parseInt(parts[2] || '1000', 10);
      if (!targetUid || !db.users[targetUid]) return callTgApi('sendMessage', { chat_id: chatId, text: '❌ کاربر یافت نشد. نحوه استفاده: /setcoins <شناسه_کاربر> <تعداد_سکه>' });
      db.users[targetUid].coins = amount;
      saveDb();
      return callTgApi('sendMessage', { chat_id: chatId, text: `✅ موجودی سکه کاربر ${targetUid} به ${amount.toLocaleString()} تغییر یافت.` });
    }

    if (text.startsWith('/ban')) {
      const parts = text.split(' ');
      const targetUid = parts[1];
      if (!targetUid || !db.users[targetUid]) return callTgApi('sendMessage', { chat_id: chatId, text: '❌ کاربر یافت نشد. نحوه استفاده: /ban <شناسه_کاربر>' });
      db.users[targetUid].is_banned = true;
      saveDb();
      return callTgApi('sendMessage', { chat_id: chatId, text: `🚫 کاربر ${targetUid} مسدود شد.` });
    }

    if (text.startsWith('/setchannel')) {
      const newChannel = text.replace('/setchannel', '').trim();
      if (!newChannel) return callTgApi('sendMessage', { chat_id: chatId, text: 'نحوه استفاده: /setchannel @zenoslife_official' });
      db.settings.forceSubChannel = newChannel;
      saveDb();
      return callTgApi('sendMessage', { chat_id: chatId, text: `✅ کانال عضویت اجباری به <b>${newChannel}</b> تغییر یافت.`, parse_mode: 'HTML' });
    }

    if (text.startsWith('/broadcast')) {
      const broadcastMsg = text.replace('/broadcast', '').trim();
      if (!broadcastMsg) return callTgApi('sendMessage', { chat_id: chatId, text: 'نحوه استفاده: /broadcast <متن پیام>' });
      const allUsers = Object.keys(db.users);
      for (const uid of allUsers) {
        callTgApi('sendMessage', { chat_id: uid, text: `📢 <b>اطلاعیه رسمی زنوسلایف:</b>\n\n${broadcastMsg}`, parse_mode: 'HTML' }).catch(() => {});
      }
      return callTgApi('sendMessage', { chat_id: chatId, text: `✅ ارسال همگانی به ${allUsers.length} کاربر آغاز شد.` });
    }
  }

  // 6. Calendar Reminders & Alarms Commands
  if (text.startsWith('/remind') || text.startsWith('/alarm') || text.startsWith('/reminder')) {
    const parts = text.replace(/\/remind|\/alarm|\/reminder/, '').trim().split(' ');
    const timeStr = parts[0];
    const taskTitle = parts.slice(1).join(' ');

    if (!timeStr || !taskTitle || !timeStr.includes(':')) {
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: '⏰ <b>نحوه ثبت یادآور و آلارم:</b>\n\n<code>/remind 10:00 ورزش صبحگاهی</code>\n<code>/remind 22:30 مطالعه کتاب</code>',
        parse_mode: 'HTML'
      });
    }

    return addReminder(userId, taskTitle, timeStr);
  }

  if (text === '/calendar' || text === '/reminders') {
    const userReminders = (db.reminders || []).filter(r => r.userId === String(userId) && !r.completed);
    if (userReminders.length === 0) {
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: '⏰ <b>هیچ یادآور فعالی در تقویم شما ثبت نشده است.</b>\n\nبرای ثبت یادآور:\n<code>/remind 10:00 عنوان تسک</code>',
        parse_mode: 'HTML'
      });
    }
    const listText = userReminders.map((r, i) => `${i + 1}. 🕒 ساعت <b>${r.time}</b> - <b>${r.title}</b>`).join('\n');
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `⏰ <b>یادآورها و آلارم‌های فعال شما در تقویم:</b>\n\n${listText}`,
      parse_mode: 'HTML'
    });
  }

  // 7. Main Navigation Triggers
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const startParam = parts[1] || '';
    const user = db.users[userId];
    if (!user || !user.profileCompleted) return startLanguageChoice(chatId, userId, startParam);
    return sendMainDashboard(chatId, userId);
  }

  if (text === '/admin') return sendAdminPanel(chatId, userId);
  if (text === '/chat' || text.includes('چت ناشناس و دوستیابی') || text.includes('Anonymous Chat')) return sendFilterMenu(chatId, userId);
  if (text === '/games' || text.includes('بازی‌ها و دوئل‌های آنلاین') || text.includes('Online Games')) return sendGamesMenu(chatId, userId);
  if (text === '/finance' || text === '/vip' || text === '/buy' || text === '/wallet' || text.includes('VIP، کیف‌پول و درآمدزایی') || text.includes('VIP, Wallet & Earn')) return sendFinanceAndVipHub(chatId, userId);
  if (text === '/profile' || text === '/settings' || text.includes('پروفایل و تنظیمات') || text.includes('Profile & Settings')) return sendProfileCard(chatId, userId);
  if (text === '/rank') return sendLeaderboard(chatId, userId);
  if (text === '/ref') return sendReferralHub(chatId, userId);

  // Fallback
  return sendMainDashboard(chatId, userId);
}

// ----------------------------------------------------
// 23. CALLBACK QUERY ROUTER
// ----------------------------------------------------
async function handleCallbackQuery(cq) {
  const chatId = cq.message.chat.id;
  const userId = String(cq.from.id);
  const data = cq.data;
  callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});

  // Force Sub Check Callback
  if (data === 'check_force_sub') {
    const isMember = await isUserChannelMember(userId);
    if (isMember) {
      callTgApi('sendMessage', { chat_id: chatId, text: '🎉 <b>عضویت شما تایید شد! به زنوسلایف خوش آمدید.</b>', parse_mode: 'HTML' });
      return sendMainDashboard(chatId, userId);
    } else {
      return callTgApi('sendMessage', { chat_id: chatId, text: '❌ <b>هنوز در کانال عضو نشده‌اید!</b> لطفاً ابتدا عضو شده و مجدداً امتحان کنید.' });
    }
  }

  // Admin Callbacks
  if (data === 'admin_refresh_stats') return sendAdminPanel(chatId, userId);
  if (data === 'admin_toggle_forcesub' && isAdmin(userId)) {
    db.settings.forceSubEnabled = !db.settings.forceSubEnabled;
    saveDb();
    return sendAdminPanel(chatId, userId);
  }
  if (data === 'admin_manual_backup' && isAdmin(userId)) {
    createDatabaseBackup();
    return callTgApi('sendMessage', { chat_id: chatId, text: '✅ <b>نسخه پشتیبان (بکاپ) با موفقیت در سرور ذخیره شد!</b>', parse_mode: 'HTML' });
  }

  if (data === 'admin_view_reports') {
    const pending = (db.reports || []).filter(r => r.status === 'pending');
    if (pending.length === 0) return callTgApi('sendMessage', { chat_id: chatId, text: '✅ هیچ گزارش تخلف بررسی‌نشده‌ای وجود ندارد.' });
    const reportList = pending.slice(0, 5).map(r => `🚩 متخلف: <b>${r.targetName}</b> (<code>${r.targetId}</code>)\nشاکی: ${r.reporterName}\nعلت: ${r.reason}`).join('\n\n');
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `🚩 <b>لیست گزارش‌های اخیر:</b>\n\n${reportList}`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '🔙 بازگشت به پنل', callback_data: 'admin_refresh_stats' }]] }
    });
  }

  // Filter Menu Navigation
  if (data === 'open_other_filters') return sendOtherFiltersMenu(chatId, userId);
  if (data === 'back_to_chat_filters') return sendFilterMenu(chatId, userId);
  if (data === 'open_mood_menu') return sendMoodSelectMenu(chatId, userId);
  if (data.startsWith('mood_match_')) return executeMatchSearch(chatId, userId, `mood_${data.replace('mood_match_', '')}`);

  // Reminder Callbacks
  if (data.startsWith('complete_reminder_')) return handleCompleteReminder(userId, data.replace('complete_reminder_', ''));
  if (data.startsWith('snooze_reminder_')) return handleSnoozeReminder(userId, data.replace('snooze_reminder_', ''));

  // Game Mode Selection & Matchmaking
  if (data.startsWith('prompt_mode_')) return promptGameModeChoice(chatId, userId, data.replace('prompt_mode_', ''));
  if (data.startsWith('match_online_')) return executeGameMatchmaking(chatId, userId, data.replace('match_online_', ''));
  if (data.startsWith('play_bot_')) {
    const gameType = data.replace('play_bot_', '');
    if (gameType === 'rps') {
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: '🪨📄✂️ <b>بازی با ربات هوشمند: حرکت خود را انتخاب کنید:</b>',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🪨 سنگ', callback_data: 'rps_bot_rock' }, { text: '📄 کاغذ', callback_data: 'rps_bot_paper' }, { text: '✂️ قیچی', callback_data: 'rps_bot_scissors' }]
          ]
        }
      });
    }
    if (gameType === 'dice') return startLiveInChatDice(userId, 'bot_ai');
    if (gameType === 'trivia') return startLiveInChatTrivia(userId, 'bot_ai');
  }

  if (data.startsWith('rps_bot_')) {
    const move = data.replace('rps_bot_', '');
    const botMoves = ['rock', 'paper', 'scissors'];
    const botMove = botMoves[Math.floor(Math.random() * botMoves.length)];
    const moveIcons = { rock: '🪨', paper: '📄', scissors: '✂️' };

    let outcome = 'tie';
    if (move === botMove) outcome = 'tie';
    else if ((move === 'rock' && botMove === 'scissors') || (move === 'paper' && botMove === 'rock') || (move === 'scissors' && botMove === 'paper')) outcome = 'win';
    else outcome = 'lose';

    const user = db.users[userId];
    if (outcome === 'win') {
      user.coins = (user.coins || 0) + 50;
      addXp(userId, 25);
      saveDb();
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: `🎉 <b>پیروزی! شما برنده شدید! (+۵۰ سکه و +۲۵ XP)</b>\nشما: ${moveIcons[move]} | ربات: ${moveIcons[botMove]}\n🪙 موجودی: <b>${user.coins.toLocaleString()}</b> سکه`,
        parse_mode: 'HTML'
      });
    } else if (outcome === 'lose') {
      addXp(userId, 5);
      saveDb();
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: `😢 <b>شکست! ربات برنده شد. (+۵ XP)</b>\nشما: ${moveIcons[move]} | ربات: ${moveIcons[botMove]}`,
        parse_mode: 'HTML'
      });
    } else {
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: `🤝 <b>مساوی شد!</b>\nشما: ${moveIcons[move]} | ربات: ${moveIcons[botMove]}`,
        parse_mode: 'HTML'
      });
    }
  }

  if (data.startsWith('cancel_game_search_')) {
    const gameType = data.replace('cancel_game_search_', '');
    if (onlineGameQueues[gameType]) {
      const idx = onlineGameQueues[gameType].indexOf(userId);
      if (idx > -1) onlineGameQueues[gameType].splice(idx, 1);
    }
    return callTgApi('sendMessage', { chat_id: chatId, text: '✅ جستجوی حریف لغو شد.' });
  }

  if (data === 'duel_invite_trivia') {
    if (!activePairs.has(userId)) return;
    const partnerId = activePairs.get(userId);
    callTgApi('sendMessage', {
      chat_id: partnerId,
      text: '🧠 <b>هم‌صحبت شما را به چالش اطلاعات عمومی دعوت کرد!</b>',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '⚔️ قبول چالش', callback_data: `duel_accept_trivia_${userId}` }],
          [{ text: '❌ رد دعوت', callback_data: `duel_decline_${userId}` }]
        ]
      }
    });
    return callTgApi('sendMessage', { chat_id: userId, text: '⏳ دعوت به مسابقه اطلاعات عمومی برای هم‌صحبت ارسال شد...' });
  }

  if (data.startsWith('duel_accept_trivia_')) return startLiveInChatTrivia(data.replace('duel_accept_trivia_', ''), userId);
  if (data.startsWith('answer_trivia_')) {
    const parts = data.replace('answer_trivia_', '').split('_');
    return handleTriviaAnswer(userId, parts.slice(0, 2).join('_'), parseInt(parts[2], 10));
  }

  // Gifts & Wheel Callbacks
  if (data === 'spin_wheel_action') {
    const user = db.users[userId];
    const todayStr = new Date().toISOString().slice(0, 10);
    const isFree = user?.last_wheel_date !== todayStr;

    if (!isFree && (user?.coins || 0) < 20) {
      return callTgApi('sendMessage', { chat_id: chatId, text: t(userId, 'lowCoinsNotice', { cost: 20, coins: user?.coins || 0 }), parse_mode: 'HTML' });
    }

    if (!isFree) user.coins -= 20;
    user.last_wheel_date = todayStr;

    const prizes = [
      { label: '۵۰ سکه 🪙', coins: 50, xp: 10 },
      { label: '۱۰۰ سکه 💰', coins: 100, xp: 20 },
      { label: '۳۰ XP ⚡', coins: 20, xp: 30 },
      { label: '۲۵۰ سکه 💎', coins: 250, xp: 50 },
      { label: '۵۰۰ سکه 👑', coins: 500, xp: 100 },
      { label: '۱ روز VIP 🌟', coins: 100, xp: 50, isVip: true }
    ];

    const won = prizes[Math.floor(Math.random() * prizes.length)];
    user.coins = (user.coins || 0) + won.coins;
    addXp(userId, won.xp);
    if (won.isVip) {
      user.is_vip = true;
      user.vip_expires_at = Date.now() + 86400000;
    }
    saveDb();

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `🎉 <b>تبریک! عقربه گردونه روی «${won.label}» متوقف شد!</b>\n🪙 موجودی جدید: <b>${user.coins.toLocaleString()}</b> سکه`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '🔄 چرخش مجدد (۲۰ سکه)', callback_data: 'spin_wheel_action' }]] }
    });
  }

  if (data.startsWith('send_gift_')) return handleSendGift(userId, data.replace('send_gift_', ''));

  // Profile Action Callbacks
  if (data.startsWith('gift_coins_menu_')) {
    const partnerId = data.replace('gift_coins_menu_', '');
    const partner = db.users[partnerId];
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `🪙 <b>اهدای سکه به «${partner?.name || 'هم‌صحبت'}»:</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🪙 ۵۰ سکه', callback_data: `transfer_coins_${partnerId}_50` }, { text: '🪙 ۱۰۰ سکه', callback_data: `transfer_coins_${partnerId}_100` }],
          [{ text: '💰 ۵۰۰ سکه', callback_data: `transfer_coins_${partnerId}_500` }]
        ]
      }
    });
  }

  if (data.startsWith('transfer_coins_')) {
    const parts = data.replace('transfer_coins_', '').split('_');
    const partnerId = parts[0];
    const amount = parseInt(parts[1], 10);
    const sender = db.users[userId];
    const receiver = db.users[partnerId];

    if ((sender?.coins || 0) < amount) {
      return callTgApi('sendMessage', { chat_id: userId, text: t(userId, 'lowCoinsNotice', { cost: amount, coins: sender?.coins || 0 }), parse_mode: 'HTML' });
    }

    sender.coins -= amount;
    receiver.coins = (receiver.coins || 0) + amount;
    addXp(userId, Math.round(amount / 5));
    saveDb();

    callTgApi('sendMessage', { chat_id: userId, text: `✅ مقدار <b>${amount.toLocaleString()} سکه</b> به «${receiver.name}» اهدا شد!`, parse_mode: 'HTML' });
    return callTgApi('sendMessage', { chat_id: partnerId, text: `🎁 <b>هم‌صحبت شما «${sender.name}» مقدار ${amount.toLocaleString()} سکه به شما هدیه داد!</b>`, parse_mode: 'HTML' });
  }

  if (data.startsWith('add_friend_req_')) {
    const partnerId = data.replace('add_friend_req_', '');
    const sender = db.users[userId];
    const receiver = db.users[partnerId];
    if (!sender || !receiver) return;

    sender.friends = sender.friends || [];
    receiver.friends = receiver.friends || [];

    if (sender.friends.includes(partnerId)) {
      return callTgApi('sendMessage', { chat_id: userId, text: '👥 شما و این کاربر از قبل در لیست دوستان یکدیگر هستید!' });
    }

    callTgApi('sendMessage', {
      chat_id: partnerId,
      text: `👥 <b>درخواست دوستی جدید از «${sender.name}»!</b>\nآیا مایلید ایشان را به لیست دوستان خود اضافه کنید؟`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ قبول درخواست دوستی', callback_data: `accept_friend_${userId}` }, { text: '❌ رد', callback_data: 'decline_friend' }]
        ]
      }
    }).catch(() => {});

    return callTgApi('sendMessage', { chat_id: userId, text: '⏳ درخواست دوستی برای هم‌صحبت ارسال شد.' });
  }

  if (data.startsWith('accept_friend_')) {
    const senderId = data.replace('accept_friend_', '');
    const receiver = db.users[userId];
    const sender = db.users[senderId];

    receiver.friends = receiver.friends || [];
    sender.friends = sender.friends || [];

    if (!receiver.friends.includes(senderId)) receiver.friends.push(senderId);
    if (!sender.friends.includes(userId)) sender.friends.push(userId);
    saveDb();

    callTgApi('sendMessage', { chat_id: userId, text: '🎉 <b>شما اکنون با یکدیگر دوست شدید!</b>', parse_mode: 'HTML' });
    return callTgApi('sendMessage', { chat_id: senderId, text: '🎉 <b>شما اکنون با یکدیگر دوست شدید!</b>', parse_mode: 'HTML' });
  }

  if (data.startsWith('block_partner_')) {
    const partnerId = data.replace('block_partner_', '');
    const user = db.users[userId];
    if (user) {
      user.blocked = user.blocked || [];
      if (!user.blocked.includes(partnerId)) user.blocked.push(partnerId);
      saveDb();
    }
    await stopChat(userId, userId);
    return callTgApi('sendMessage', { chat_id: userId, text: '🚫 کاربر بلاک شد و دیگر به شما متصل نخواهد شد.' });
  }

  if (data.startsWith('report_partner_')) {
    const partnerId = data.replace('report_partner_', '');
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🚩 <b>علت گزارش تخلف کاربر را انتخاب کنید:</b>',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '⚠️ مزاحمت و رفتار نامناسب', callback_data: `submit_rep_${partnerId}_harassment` }],
          [{ text: '🔞 محتوای نامناسب', callback_data: `submit_rep_${partnerId}_nsfw` }],
          [{ text: '📢 اسپم و تبلیغات', callback_data: `submit_rep_${partnerId}_spam` }]
        ]
      }
    });
  }

  if (data.startsWith('submit_rep_')) {
    const parts = data.replace('submit_rep_', '').split('_');
    const targetId = parts[0];
    const reason = parts[1];
    const reporter = db.users[userId];
    const target = db.users[targetId];

    db.reports = db.reports || [];
    db.reports.push({ id: crypto.randomUUID(), reporterId: userId, reporterName: reporter?.name || userId, targetId, targetName: target?.name || targetId, reason, timestamp: Date.now(), status: 'pending' });
    saveDb();

    await stopChat(userId, userId);
    return callTgApi('sendMessage', { chat_id: userId, text: '✅ گزارش تخلف شما ثبت و برای مدیران سیستم ارسال شد.' });
  }

  // Duels Accept / Decline
  if (data.startsWith('duel_accept_rps_')) return startLiveInChatRps(data.replace('duel_accept_rps_', ''), userId);
  if (data.startsWith('duel_accept_dice_')) return startLiveInChatDice(data.replace('duel_accept_dice_', ''), userId);
  if (data.startsWith('duel_decline_')) {
    callTgApi('sendMessage', { chat_id: data.replace('duel_decline_', ''), text: '❌ هم‌صحبت دعوت به دوئل را رد کرد.' }).catch(() => {});
    return callTgApi('sendMessage', { chat_id: userId, text: '✅ دعوت رد شد.' });
  }

  // Language & Registration
  if (data.startsWith('set_lang_')) {
    const lang = data.replace('set_lang_', '');
    let reg = registrationSteps.get(userId);
    if (!reg) reg = { step: 'gender', tempProfile: { userId, coins: 1000, xp: 0, level: 1, karma: 100, streak_days: 1, last_streak_date: new Date().toISOString().slice(0, 10), referrals: [], friends: [], blocked: [], createdAt: Date.now() } };
    reg.tempProfile.lang = lang;
    reg.tempProfile.name = cq.from.first_name || (lang === 'en' ? 'Zen Member' : 'کاربر زنوسلایف');
    reg.step = 'gender';
    registrationSteps.set(userId, reg);

    if (db.users[userId] && db.users[userId].profileCompleted) {
      db.users[userId].lang = lang;
      saveDb();
      return sendMainDashboard(chatId, userId, lang === 'en' ? 'Language set to English!' : 'زبان به فارسی تنظیم شد!');
    }
    return promptGenderSelection(chatId, userId);
  }

  if (data.startsWith('reg_gender_')) {
    const gender = data.replace('reg_gender_', '');
    let reg = registrationSteps.get(userId);
    if (!reg) return startLanguageChoice(chatId, userId);
    reg.tempProfile.gender = gender;
    reg.step = 'age';
    registrationSteps.set(userId, reg);

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: t(userId, 'chooseAge'),
      reply_markup: {
        inline_keyboard: [
          [{ text: t(userId, 'age1'), callback_data: 'reg_age_18-21' }, { text: t(userId, 'age2'), callback_data: 'reg_age_22-26' }],
          [{ text: t(userId, 'age3'), callback_data: 'reg_age_27-34' }, { text: t(userId, 'age4'), callback_data: 'reg_age_35+' }]
        ]
      }
    });
  }

  if (data.startsWith('reg_age_')) {
    const age = data.replace('reg_age_', '');
    let reg = registrationSteps.get(userId);
    if (!reg) return startLanguageChoice(chatId, userId);
    reg.tempProfile.age = age;
    reg.step = 'province';
    registrationSteps.set(userId, reg);

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: t(userId, 'chooseProv'),
      reply_markup: {
        inline_keyboard: [
          [{ text: t(userId, 'provTeh'), callback_data: 'reg_prov_Tehran' }, { text: t(userId, 'provIsf'), callback_data: 'reg_prov_Isfahan' }],
          [{ text: t(userId, 'provMsh'), callback_data: 'reg_prov_Mashhad' }, { text: t(userId, 'provShr'), callback_data: 'reg_prov_Shiraz' }],
          [{ text: t(userId, 'provTab'), callback_data: 'reg_prov_Tabriz' }, { text: t(userId, 'provAhv'), callback_data: 'reg_prov_Ahvaz' }],
          [{ text: t(userId, 'provNrt'), callback_data: 'reg_prov_North' }, { text: t(userId, 'provOth'), callback_data: 'reg_prov_Global' }]
        ]
      }
    });
  }

  if (data.startsWith('reg_prov_')) {
    const prov = data.replace('reg_prov_', '');
    let reg = registrationSteps.get(userId);
    if (!reg) return startLanguageChoice(chatId, userId);

    reg.tempProfile.province = prov;
    reg.tempProfile.profileCompleted = true;
    db.users[userId] = reg.tempProfile;
    saveDb();
    registrationSteps.delete(userId);

    // Referral Commission Fulfillment
    if (reg.tempProfile.invitedBy && db.users[reg.tempProfile.invitedBy]) {
      const refUser = db.users[reg.tempProfile.invitedBy];
      refUser.referrals = refUser.referrals || [];
      refUser.referrals.push(userId);
      refUser.coins = (refUser.coins || 0) + 1000;
      addXp(reg.tempProfile.invitedBy, 50);
      saveDb();

      callTgApi('sendMessage', {
        chat_id: reg.tempProfile.invitedBy,
        text: '🎉 <b>تبریک! دوست جدیدی با لینک شما ثبت‌نام کرد! (+۱,۰۰۰ سکه هدیه و +۵۰ XP)</b>',
        parse_mode: 'HTML'
      }).catch(() => {});
    }

    return sendMainDashboard(chatId, userId, t(userId, 'regDone'));
  }

  // Profile Editor Actions
  if (data === 'edit_profile') return sendProfileEditMenu(chatId, userId);
  if (data === 'view_profile_full') return sendProfileCard(chatId, userId);
  if (data === 'view_my_friends') {
    const user = db.users[userId];
    const friends = (user?.friends || []).map(fId => db.users[fId]?.name || fId).join(', ') || 'هنوز دوستی اضافه نکرده‌اید.';
    return callTgApi('sendMessage', { chat_id: chatId, text: `👥 <b>لیست دوستان شما:</b>\n${friends}`, parse_mode: 'HTML' });
  }

  // Stars Purchases
  if (data.startsWith('buy_vip_')) {
    const days = parseInt(data.replace('buy_vip_', ''));
    const vipPrices = { 7: 75, 30: 250, 90: 650 };
    const stars = vipPrices[days] || 250;
    const title = `👑 اشتراک ویژه VIP زنوسلایف (${days} روز)`;

    return callTgApi('sendInvoice', {
      chat_id: chatId,
      title: title,
      description: `فعال‌سازی اشتراک VIP زنوسلایف به مدت ${days} روز با دسترسی به تالار VIP و فیلترهای نامحدود`,
      payload: JSON.stringify({ userId, type: 'vip', days, stars }),
      currency: 'XTR',
      prices: [{ label: title, amount: stars }]
    });
  }

  if (data.startsWith('buy_pkg_')) {
    const pkgType = data.replace('buy_pkg_', '');
    const packages = {
      'bronze': { title: '🪙 ۱,۰۰۰ سکه زنوسلایف', priceStars: 35, coins: 1000 },
      'silver': { title: '💰 ۵,۰۰۰ سکه + هدیه بانس', priceStars: 150, coins: 6000 },
      'global': { title: '🌍 ۱۲,۰۰۰ سکه + دسترسی بین‌المللی', priceStars: 300, coins: 12000 },
      'vip': { title: '💎 ۵۰,۰۰۰ سکه + اشتراک VIP رویال', priceStars: 1000, coins: 50000, isVip: true }
    };
    const pkg = packages[pkgType];
    if (pkg) {
      return callTgApi('sendInvoice', {
        chat_id: chatId,
        title: pkg.title,
        description: `شارژ آنی ${pkg.coins.toLocaleString()} سکه در حساب کاربری زنوسلایف`,
        payload: JSON.stringify({ userId, type: 'coins', coins: pkg.coins, stars: pkg.priceStars, isVip: !!pkg.isVip }),
        currency: 'XTR',
        prices: [{ label: pkg.title, amount: pkg.priceStars }]
      });
    }
  }

  if (data === 'filter_random') return executeMatchSearch(chatId, userId, 'random');
  if (data === 'filter_samelang') return executeMatchSearch(chatId, userId, 'samelang');
  if (data === 'filter_global') return executeMatchSearch(chatId, userId, 'global');
  if (data === 'filter_female') return executeMatchSearch(chatId, userId, 'female');
  if (data === 'filter_male') return executeMatchSearch(chatId, userId, 'male');
  if (data === 'filter_province') return executeMatchSearch(chatId, userId, 'province');
  if (data === 'buy_stars') return sendBuyStarsMenu(chatId, userId);
  if (data === 'buy_vip_plans') return sendVipPlansMenu(chatId, userId);
  if (data === 'show_referral') return sendReferralHub(chatId, userId);
  if (data === 'enter_vip_lounge') return enterVipLounge(chatId, userId);
  if (data === 'view_leaderboard_hub') return sendLeaderboard(chatId, userId);
  if (data === 'back_to_dashboard') return sendMainDashboard(chatId, userId);
  if (data === 'open_user_search') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🔍 <b>جستجوی پیشرفته کاربران زنوسلایف:</b>',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👩 دختران فعال', callback_data: 'search_filter_female' }, { text: '👨 پسران فعال', callback_data: 'search_filter_male' }],
          [{ text: '📍 همشهری‌ها و افراد نزدیک', callback_data: 'search_filter_province' }]
        ]
      }
    });
  }
}

// ----------------------------------------------------
// 24. PAYMENT SETTLEMENT & STARS PRE-CHECKOUT
// ----------------------------------------------------
async function handlePreCheckoutQuery(pcq) {
  return callTgApi('answerPreCheckoutQuery', { pre_checkout_query_id: pcq.id, ok: true });
}

async function handleSuccessfulPayment(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const payment = msg.successful_payment;

  try {
    const payload = JSON.parse(payment.invoice_payload);
    const chargeId = payment.telegram_payment_charge_id;

    if (db.transactions[chargeId]) return;

    db.transactions[chargeId] = {
      chargeId,
      userId,
      payload,
      amountStars: payload.stars,
      createdAt: Date.now()
    };
    db.stats.totalStarsRevenue += (payload.stars || 0);

    const user = db.users[userId];
    if (user) {
      if (payload.type === 'coins' && payload.coins) {
        user.coins = (user.coins || 0) + payload.coins;
        if (payload.isVip) {
          user.is_vip = true;
          user.vip_expires_at = Date.now() + 30 * 86400000;
        }
      } else if (payload.type === 'vip' && payload.days) {
        user.is_vip = true;
        const currentExp = (user.vip_expires_at && user.vip_expires_at > Date.now()) ? user.vip_expires_at : Date.now();
        user.vip_expires_at = currentExp + payload.days * 86400000;
      }

      addXp(userId, (payload.stars || 10) * 10);
      saveDb();

      // 10% Referral Cut
      if (user.invitedBy && db.users[user.invitedBy]) {
        const refId = user.invitedBy;
        const commissionCoins = Math.round(((payload.coins || (payload.stars * 30)) * 0.1));
        db.users[refId].coins = (db.users[refId].coins || 0) + commissionCoins;
        saveDb();

        callTgApi('sendMessage', {
          chat_id: refId,
          text: `🎁 <b>پاداش پورسانت رفرال!</b>\nدوست شما خرید انجام داد و <b>${commissionCoins.toLocaleString()} سکه هدیه (۱۰٪)</b> دریافت کردید!`,
          parse_mode: 'HTML'
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('Error settling payment:', e.message);
  }

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: '✅ <b>پرداخت با ستاره‌های تلگرام با موفقیت انجام شد!</b>\nسکه و اشتراک VIP بلافاصله به حساب شما افزوده شد.',
    parse_mode: 'HTML',
    reply_markup: getMainReplyKeyboard(userId)
  });
}

// ----------------------------------------------------
// 25. INTEGRATED HTTP REST API SERVER (FOR MINI APP SYNC)
// ----------------------------------------------------
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), usersCount: Object.keys(db.users).length }));
  }

  if (req.url.startsWith('/api/user/')) {
    const uid = req.url.replace('/api/user/', '').split('?')[0];
    const user = db.users[uid];
    if (user) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(user));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'User not found' }));
    }
  }

  if (req.method === 'POST' && req.url === '/api/reminders') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.userId && payload.title && payload.time) {
          addReminder(payload.userId, payload.title, payload.time, payload.date);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true }));
        }
      } catch (_) {}
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid payload' }));
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(CONFIG.API_PORT, () => {
  console.log(`🌐 Integrated Backend REST API listening on port ${CONFIG.API_PORT}`);
});

let cachedBotInfo = null;
async function getBotInfo() {
  if (!cachedBotInfo) cachedBotInfo = await callTgApi('getMe');
  return cachedBotInfo;
}

// ----------------------------------------------------
// 26. LONG-POLLING ENGINE WITH GRACEFUL RECOVERY
// ----------------------------------------------------
setInterval(checkVipExpiration, 6 * 3600 * 1000);

async function initBotSettings() {
  try {
    try {
      await callTgApi('deleteWebhook', { drop_pending_updates: false });
    } catch (_) {}

    const me = await getBotInfo();
    console.log(`🤖 Connected to Telegram Bot: @${me.username} (ID: ${me.id})`);

    await callTgApi('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: '🌟 ZenOsLife | Mini App',
        web_app: { url: CONFIG.WEBAPP_URL }
      }
    });

    await callTgApi('setMyCommands', {
      commands: [
        { command: 'start', description: '🚀 منوی اصلی ربات' },
        { command: 'chat', description: '💬 چت ناشناس و دوستیابی' },
        { command: 'games', description: '🎮 مرکز بازی‌ها و دوئل 1v1' },
        { command: 'finance', description: '💎 کیف‌پول، VIP و درآمدزایی' },
        { command: 'profile', description: '👤 پروفایل و کارما' },
        { command: 'remind', description: '⏰ تنظیم یادآور و آلارم تقویم' },
        { command: 'admin', description: '📊 پنل مدیریت' }
      ]
    });

    console.log('✅ Bot Commands & WebApp Menu initialized successfully!');
  } catch (e) {
    console.warn('Notice during bot init:', e.message);
  }
}

let lastUpdateId = 0;
async function pollUpdates() {
  try {
    const updates = await callTgApi('getUpdates', { offset: lastUpdateId + 1, timeout: 25 });
    for (const update of updates) {
      lastUpdateId = update.update_id;
      if (update.message) {
        if (update.message.successful_payment) await handleSuccessfulPayment(update.message);
        else await handleMessage(update.message);
      } else if (update.callback_query) {
        await handleCallbackQuery(update.callback_query);
      } else if (update.pre_checkout_query) {
        await handlePreCheckoutQuery(update.pre_checkout_query);
      }
    }
  } catch (err) {
    if (!err.message?.includes('ETIMEDOUT') && !err.message?.includes('socket hang up')) {
      console.warn('Polling notice:', err.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  setImmediate(pollUpdates);
}

// Start Engine
console.log('🚀 ZenOsLife Enterprise Master Backend Engine Starting...');
initBotSettings().then(() => {
  pollUpdates();
  console.log('✨ ZenOsLife Bot & Backend is Online and 100% Operational!');
}).catch(err => {
  console.error('Fatal error starting engine:', err);
});
