
// ----------------------------------------------------
// FULL INTERACTIVE PROFILE EDITOR
// ----------------------------------------------------
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

async function sendProfileCard(chatId, userId) {
  const user = db.users[userId];
  if (!user) return startLanguageChoice(chatId, userId);
  const genderIcon = user.gender === 'female' ? '👩' : '👨';
  const isEn = user.lang === 'en';

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
      `• Referrals: <b>${(user.referrals || []).length} Friends</b>`
    : `👤 <b>پروفایل کاربری شما در زنوسلایف:</b>\n\n` +
      `• نام: <b>${user.name}</b>\n` +
      `• جنسیت: <b>${genderIcon} ${user.gender === 'female' ? 'دختر' : 'پسر'}</b>\n` +
      `• رده سنی: <b>${user.age}</b>\n` +
      `• استان: <b>${user.province}</b>\n` +
      `• سطح و پیشرفت: <b>سطح ${user.level || 1} (${user.xp || 0} XP)</b>\n` +
      `• امتیاز کارما و ادب: <b>⭐ ${user.karma || 100} امتیاز</b>\n` +
      `• موجودی سکه: <b>🪙 ${(user.coins || 0).toLocaleString()} سکه</b> ${user.is_vip ? '👑 VIP' : ''}\n` +
      `• استریک روزانه: <b>🔥 ${user.streak_days || 1} روز مداوم</b>\n` +
      `• تعداد دعوت‌ها: <b>${(user.referrals || []).length} نفر</b>`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: profText,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: isEn ? '✏️ Edit Profile' : '✏️ ویرایش مشخصات', callback_data: 'edit_profile' }]]
    }
  });
}
/**
 * ============================================================================
 * ZenOsLife #1 - Enterprise Telegram Bot Engine
 * Full Bilingual (🇮🇷 Persian & 🇬🇧 English)
 * 
 * Modules:
 * 1. Core Gateway, TLS Agent & i18n Translation Engine (Fa / En)
 * 2. Step-by-Step Onboarding & Multi-Field Profile (Gender, Age, Location, Photo)
 * 3. Gamification: Level, XP, Daily Streaks (🔥), Achievements & Social Karma (⭐)
 * 4. Anonymous Social Chat Engine (Random, Same-Lang, Global, Gender/City Filters)
 * 5. In-Chat Real-time Media Relay (Text, Voice, Photo, Sticker, VideoNote)
 * 6. 1v1 In-Bot Multiplayer Games (🪨📄✂️ Rock-Paper-Scissors, 🎲 Animated Dice)
 * 7. Monetization Engine: Telegram Stars Invoices (XTR), VIP Plans & Referral Cut
 * 8. Security, Anti-Spam Rate Limiter, Anti-Fraud & Auto VIP Expiration
 * 9. Comprehensive Admin Panel & Broadcast Gateway (/admin, /broadcast)
 * ============================================================================
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ----------------------------------------------------
// 1. CONFIGURATION & ENVIRONMENT
// ----------------------------------------------------
const CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN || '8887477989:AAEj6gnWZvmhm2jFdjRzJAI3fwVtVptZrd4',
  WEBAPP_URL: process.env.WEBAPP_URL || 'https://zen.moeid.net',
  CHANNEL_USERNAME: process.env.CHANNEL_USERNAME || '@zenoslife_official',
  ADMIN_IDS: (process.env.ADMIN_IDS || '123456789,8887477989').split(',').map(id => id.trim()),
  DATA_FILE: path.join(__dirname, 'bot_database.json'),
  RATE_LIMIT_MS: 500, // Max 2 messages per second
};

// ----------------------------------------------------
// 2. DATABASE PERSISTENCE LAYER (ACID-Style JSON Store)
// ----------------------------------------------------
let db = {
  users: {},         // userId -> User Object
  transactions: {},  // txId -> Transaction Object
  matches: [],       // Array of Game Match Records
  chats: [],         // Array of Chat Session Records
  reports: [],       // Array of User Reports
  stats: { totalStarsRevenue: 0, totalMatchesPlayed: 0, totalChatsCompleted: 0 }
};

try {
  if (fs.existsSync(CONFIG.DATA_FILE)) {
    const raw = fs.readFileSync(CONFIG.DATA_FILE, 'utf8');
    db = Object.assign(db, JSON.parse(raw));
  }
} catch (e) {
  console.warn('Initializing fresh bot database');
}

function saveDb() {
  try {
    fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Error saving DB:', e.message);
  }
}

// ----------------------------------------------------
// 3. IN-MEMORY RUNTIME STATE
// ----------------------------------------------------
const waitingQueue = [];               // { userId, filterType, lang, province, gender, timestamp }
const activePairs = new Map();         // userId -> partnerUserId
const registrationSteps = new Map();   // userId -> { step, tempProfile }
const activeGames = new Map();         // gameId -> Game State
const userRateLimits = new Map();      // userId -> lastMessageTimestamp

// ----------------------------------------------------
// 4. BILINGUAL DICTIONARY (FA & EN - 100% COMPLETE)
// ----------------------------------------------------
const I18N = {
  fa: {
    chooseLang: '🌐 <b>لطفاً زبان خود را انتخاب کنید:</b>\nPlease choose your language:',
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
    menuHeader: '👑 <b>پایگاه چت ناشناس، دوستیابی و بازی‌های آنلاین</b>\n\n' +
                '👤 <b>{name}</b> ({gender}، {age} ساله از {prov})\n' +
                '🏆 <b>سطح:</b> Level {lvl} ({xp} XP) | ⭐ <b>کارما:</b> {karma}\n' +
                '🪙 <b>موجودی:</b> {coins} سکه | 🔥 <b>استریک روزانه:</b> {streak} روز {vipBadge}',
    btnChat: '💬 چت ناشناس و دوستیابی',
    btnGames: '🎮 بازی‌ها و دوئل‌های 1v1 🎲',
    btnCoins: '🪙 کیف پول و خرید ستاره ⭐',
    btnVip: '👑 عضویت و پلن‌های VIP',
    btnProfile: '👤 پروفایل و دستاوردها 🏅',
    btnReferral: '🎁 دعوت دوستان و درآمد',
    btnLeaderboard: '🏆 رتبه‌بندی و برترین‌ها',
    btnSettings: '⚙️ تنظیمات و زبان 🌐',
    btnMiniApp: '🌟 ورود به دنیای زنوسلایف (Mini App) ✨',

    // Chat
    filterTitle: '🙈 <b>به کی دوست داری وصل شی؟ انتخاب کن:</b> 👇',
    filterRandom: '🎲 جستجوی شانسی (رایگان)',
    filterSameLang: '🇮🇷 چت هم‌زبان (فارسی‌زبانان)',
    filterGlobal: '🌍 چت بین‌المللی (Global)',
    filterFemale: '👩 اتصال به دختر (۵۰ سکه)',
    filterMale: '👨 اتصال به پسر (۵۰ سکه)',
    filterProv: '🛰️ افراد نزدیک و همشهری (۳۰ سکه)',
    searching: '🔍 <b>در حال جستجوی هم‌صحبت با مشخصات درخواستی...</b>\n\n⏳ لطفاً چند لحظه صبور باشید.',
    searchCancelled: '✅ جستجوی هم‌صحبت لغو شد.',
    matched: '🎉 <b>هم‌صحبت پیدا شد!</b>\n\n🎭 <b>مشخصات طرف مقابل:</b> {badge}\n⭐ <b>کارمای اخلاق:</b> {karma} امتیاز | 🏆 <b>سطح:</b> Lvl {lvl}\n\n💬 می‌توانید پیام متنی، ویس، عکس یا استیکر بفرستید.',
    inChatNext: '⏭️ هم‌صحبت بعدی',
    inChatStop: '🛑 پایان گفتگو',
    inChatShareId: '💖 ارسال آیدی تلگرام',
    inChatDuel: '🎮 دوئل بازی 1v1',
    inChatReport: '🚩 گزارش تخلف',
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
    shareIdSuccess: '✅ آیدی شما با موفقیت برای هم‌صحبت ارسال شد.',
    shareIdReceived: '💖 <b>هم‌صحبت آیدی تلگرام خود را به اشتراک گذاشت:</b>\n👤 نام: <b>{name}</b>\n🆔 آیدی: @{username}',
    noUsernameErr: '⚠️ اکانت تلگرام شما آیدی ندارد. لطفاً در تنظیمات تلگرام یک Username ست کنید.',
    
    // Games
    gamesTitle: '🎮 <b>مرکز بازی‌ها و دوئل‌های 1v1 زنوسلایف</b>\n\nیک بازی را انتخاب کنید و حریفتان را به چالش بکشید:',
    gameRps: '🪨📄✂️ سنگ، کاغذ، قیچی آنلاین',
    gameDice: '🎲 دوئل رولت تاس متحرک',
    gameHokm: '👑 حکم ۴ نفره شاهانه (Mini App)',
    gameBackgammon: '🎲 تخته نرد ایرانی (Mini App)',
    rpsPrompt: '🪨📄✂️ <b>بازی سنگ، کاغذ، قیچی (شرط ۵۰ سکه)</b>\nحرکت خود را انتخاب کنید:',
    rpsRock: '🪨 سنگ',
    rpsPaper: '📄 کاغذ',
    rpsScissors: '✂️ قیچی',
    rpsWin: '🎉 <b>تبریک! شما برنده شدید! (+۹۰ سکه و +۲۵ XP)</b>',
    rpsLose: '😢 <b>شما باختید! حریف برنده شد. (+۵ XP)</b>',
    rpsTie: '🤝 <b>مساوی شد! (سکه برگشت داده شد)</b>',
    
    // VIP & Shop
    vipTitle: '👑 <b>پلن‌های اشتراک ویژه VIP زنوسلایف</b>\n\nمزایای VIP:\n• فیلتر نامحدود دختر/پسر/همشهری\n• نشان تاج طلایی در چت و پروفایل\n• ۲۰٪ بانس XP و سکه مضاعف در بازی‌ها',
    vip7: '🥉 VIP هفتگی (۷ روز) - ۷۵ ستاره ⭐',
    vip30: '🥈 VIP ماهانه (۳۰ روز) - ۲۵۰ ستاره ⭐',
    vip90: '👑 VIP طلایی رویال (۹۰ روز) - ۶۵۰ ستاره ⭐',
    shopTitle: '⭐ <b>فروشگاه رسمی ستاره‌های تلگرام (Telegram Stars)</b>\nشارژ آنی سکه با Telegram Stars بدون واسطه:',
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
    
    // Achievements & Leaderboard
    leaderboardTitle: '🏆 <b>جدول برترین‌های زنوسلایف</b>\n\n' +
                     '🥇 <b>برترین‌های سکه و ثروت:</b>\n{topCoins}\n\n' +
                     '⭐ <b>بااخلاق‌ترین هم‌صحبت‌ها (کارما):</b>\n{topKarma}',
  },

  en: {
    chooseLang: '🌐 <b>Please choose your language:</b>\nلطفاً زبان خود را انتخاب کنید:',
    welcomeTitle: '👑 <b>Welcome to ZenOsLife Anonymous Chat & Gaming Engine!</b>',
    chooseGender: '👤 Please select your <b>gender</b>:',
    male: '👨 Male / Boy',
    female: '👩 Female / Girl',
    chooseAge: '🎂 Please select your <b>age bracket</b>:',
    age1: '18 - 21 yrs',
    age2: '22 - 26 yrs',
    age3: '27 - 34 yrs',
    age4: '35+ yrs',
    chooseProv: '📍 Please select your <b>region/country</b>:',
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
    btnGames: '🎮 1v1 Games & Duels 🎲',
    btnCoins: '🪙 Wallet & Telegram Stars ⭐',
    btnVip: '👑 VIP Plans & Membership',
    btnProfile: '👤 My Profile & Badges 🏅',
    btnReferral: '🎁 Invite Friends & Earn',
    btnLeaderboard: '🏆 Leaderboards & Ranks',
    btnSettings: '⚙️ Settings & Language 🌐',
    btnMiniApp: '🌟 Open ZenOsLife (Mini App) ✨',

    // Chat
    filterTitle: '🙈 <b>Who would you like to connect with?</b> 👇',
    filterRandom: '🎲 Random Match (Free)',
    filterSameLang: '🇬🇧 English Speakers Match',
    filterGlobal: '🌍 Global Discovery (All Countries)',
    filterFemale: '👩 Connect to Girl (50 Coins)',
    filterMale: '👨 Connect to Boy (50 Coins)',
    filterProv: '🛰️ Same Region Match (30 Coins)',
    searching: '🔍 <b>Searching for the best partner...</b>\n\n⏳ Please wait a moment while we match you with an online user.',
    searchCancelled: '✅ Search cancelled.',
    matched: '🎉 <b>Partner Found!</b>\n\n🎭 <b>Stranger:</b> {badge}\n⭐ <b>Karma:</b> {karma} pts | 🏆 <b>Level:</b> Lvl {lvl}\n\n💬 Feel free to send text, voice notes, photos, or stickers.',
    inChatNext: '⏭️ Next Partner',
    inChatStop: '🛑 End Chat',
    inChatShareId: '💖 Share Telegram ID',
    inChatDuel: '🎮 1v1 Game Duel',
    inChatReport: '🚩 Report User',
    chatEndedSelf: '🛑 <b>You ended the conversation.</b>',
    chatEndedPartner: '🛑 <b>Your partner left the chat.</b>',
    chatNextPartner: '🛑 <b>Your partner moved on to someone else.</b>',
    karmaPrompt: '🌟 <b>How was your conversation?</b>\nRate your partner to promote respectful and quality social vibes:',
    karmaGreat: '🌟 Great Talker (+5 Karma)',
    karmaPolite: '☕ Polite & Respectful (+5 Karma)',
    karmaInspiring: '💡 Inspiring (+5 Karma)',
    karmaThanks: '🙏 Thank you for your feedback! (+5 Karma added to partner)',
    lowCoinsNotice: '⚠️ <b>Insufficient Coins!</b>\nThis filter requires <b>{cost} Coins</b>.\nCurrent Balance: <b>{coins}</b> Coins',
    surpriseRefill: '🎁 <b>Surprise Coin Refill!</b>\nHere is <b>200 Free Coins</b> for your next filtered chats! 🪙✨',
    shareIdSuccess: '✅ Your Telegram ID has been shared with your partner.',
    shareIdReceived: '💖 <b>Your partner shared their Telegram ID:</b>\n👤 Name: <b>{name}</b>\n🆔 Username: @{username}',
    noUsernameErr: '⚠️ You do not have a Telegram Username set in your Telegram Settings.',
    
    // Games
    gamesTitle: '🎮 <b>ZenOsLife 1v1 In-Bot Gaming Hub</b>\n\nSelect a game to challenge your opponents:',
    gameRps: '🪨📄✂️ Rock-Paper-Scissors Online',
    gameDice: '🎲 Animated Dice Duel',
    gameHokm: '👑 Hokm 4-Player (Mini App)',
    gameBackgammon: '🎲 Persian Backgammon (Mini App)',
    rpsPrompt: '🪨📄✂️ <b>Rock, Paper, Scissors (50 Coins Wager)</b>\nMake your move:',
    rpsRock: '🪨 Rock',
    rpsPaper: '📄 Paper',
    rpsScissors: '✂️ Scissors',
    rpsWin: '🎉 <b>Congratulations! You Won! (+90 Coins & +25 XP)</b>',
    rpsLose: '😢 <b>You Lost! Opponent won. (+5 XP)</b>',
    rpsTie: '🤝 <b>It is a Tie! (Wager returned)</b>',
    
    // VIP & Shop
    vipTitle: '👑 <b>ZenOsLife VIP Subscription Plans</b>\n\nVIP Benefits:\n• Unlimited Gender & Region Filters\n• Golden Crown badge on Profile & Chat\n• +20% XP boost & bonus coins in games',
    vip7: '🥉 Weekly VIP (7 Days) - 75 Stars ⭐',
    vip30: '🥈 Monthly VIP (30 Days) - 250 Stars ⭐',
    vip90: '👑 Royal VIP (90 Days) - 650 Stars ⭐',
    shopTitle: '⭐ <b>Official Telegram Stars Coin Shop</b>\nInstant recharge using Telegram Stars:',
    pkg1: '🪙 1,000 Coins (35 Stars ⭐)',
    pkg2: '💰 5,000 Coins + Bonus (150 Stars ⭐)',
    pkg3: '🌍 12,000 Coins + Global (300 Stars ⭐)',
    pkg4: '💎 50,000 Coins + VIP (1,000 Stars ⭐)',

    // Daily & Referral
    dailyStreakTitle: '🔥 <b>Daily Streak & Login Bonus</b>\n\nYou have logged in for <b>{days} consecutive days</b>!\n🎁 Today Reward: <b>+{coins} Coins & +{xp} XP</b>',
    referralTitle: '🎁 <b>ZenOsLife Automated Referral Engine</b>\n\n' +
                   '🔗 <b>Your Exclusive Invite Link:</b>\n<code>{refLink}</code>\n\n' +
                   '🎁 <b>Awesome Rewards:</b>\n' +
                   '• <b>1,000 Bonus Coins for you</b> for every successful invite\n' +
                   '• <b>1,000 Welcome Coins for your friend</b> upon joining!\n' +
                   '• <b>10% Lifetime Cut</b> on all their Stars purchases!\n\n' +
                   '👥 Friends Invited: <b>{refs}</b>',
    btnShareRef: '🚀 1-Tap Share to Friends & Groups',
    
    // Achievements & Leaderboard
    leaderboardTitle: '🏆 <b>ZenOsLife Top Leaderboard</b>\n\n' +
                     '🥇 <b>Wealth Leaders (Coins):</b>\n{topCoins}\n\n' +
                     '⭐ <b>Ethics & Karma Leaders:</b>\n{topKarma}',
  }
};

// Safe i18n resolver (Checks DB -> Registration State -> Default 'fa')
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
// 5. SECURE TELEGRAM API CLIENT
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
// 6. USER GAMIFICATION: LEVEL, XP & STREAKS
// ----------------------------------------------------
function addXp(userId, amount) {
  const user = db.users[userId];
  if (!user) return;
  user.xp = (user.xp || 0) + amount;
  const newLevel = Math.floor(Math.sqrt(user.xp / 50)) + 1;
  if (newLevel > (user.level || 1)) {
    user.level = newLevel;
    user.coins = (user.coins || 0) + newLevel * 100; // Level up coin reward
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

  if (lastDate === todayStr) return null; // Already claimed today

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
// 7. INITIALIZE BOT SETTINGS & WEBHOOK CLEANUP
// ----------------------------------------------------
async function initBotSettings() {
  try {
    try {
      await callTgApi('deleteWebhook', { drop_pending_updates: false });
      console.log('✅ Webhook cleared for Long Polling');
    } catch (_) {}

    const me = await callTgApi('getMe');
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
        { command: 'start', description: '🚀 Main Menu / منوی اصلی' },
        { command: 'chat', description: '💬 Anonymous Chat / چت ناشناس' },
        { command: 'games', description: '🎮 1v1 Games / بازی‌ها و دوئل' },
        { command: 'rps', description: '🪨 Rock-Paper-Scissors / سنگ‌کاغذقیچی' },
        { command: 'dice', description: '🎲 Dice Duel / دوئل تاس' },
        { command: 'buy', description: '⭐ Buy Stars / خرید ستاره' },
        { command: 'vip', description: '👑 VIP Plans / پلن‌های VIP' },
        { command: 'profile', description: '👤 Profile & Karma / پروفایل' },
        { command: 'ref', description: '🎁 Invite Friends / دعوت دوستان' },
        { command: 'rank', description: '🏆 Leaderboard / برترین‌ها' },
        { command: 'lang', description: '🌐 Language / تغییر زبان' },
        { command: 'admin', description: '📊 Admin Panel / پنل ادمین' }
      ]
    });

    console.log('✅ Bot Commands & Menu initialized successfully!');
  } catch (e) {
    console.warn('Notice during bot init:', e.message);
  }
}

// ----------------------------------------------------
// 8. ONBOARDING & LANGUAGE SELECTION
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
// 9. MAIN NATIVE REPLY KEYBOARD & DASHBOARD
// ----------------------------------------------------
function getMainReplyKeyboard(userId) {
  return {
    keyboard: [
      [{ text: t(userId, 'btnChat') }, { text: t(userId, 'btnGames') }],
      [{ text: t(userId, 'btnCoins') }, { text: t(userId, 'btnVip') }],
      [{ text: t(userId, 'btnProfile') }, { text: t(userId, 'btnReferral') }],
      [{ text: t(userId, 'btnLeaderboard') }, { text: t(userId, 'btnSettings') }],
      [{ text: t(userId, 'btnMiniApp') }]
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
// 10. CHAT FILTER MENU & MATCHMAKING
// ----------------------------------------------------
async function sendFilterMenu(chatId, userId) {
  const user = db.users[userId];
  if (!user || !user.profileCompleted) return startLanguageChoice(chatId, userId);

  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: t(userId, 'filterRandom'), callback_data: 'filter_random' }],
      [{ text: t(userId, 'filterSameLang'), callback_data: 'filter_samelang' }, { text: t(userId, 'filterGlobal'), callback_data: 'filter_global' }],
      [{ text: t(userId, 'filterFemale'), callback_data: 'filter_female' }, { text: t(userId, 'filterMale'), callback_data: 'filter_male' }],
      [{ text: t(userId, 'filterProv'), callback_data: 'filter_province' }]
    ]
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'filterTitle'),
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  });
}

async function executeMatchSearch(chatId, userId, filterType = 'random') {
  const user = db.users[userId];
  if (!user) return;

  // Costs
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
            [{ text: '⭐ ' + t(userId, 'btnCoins'), callback_data: 'buy_stars' }],
            [{ text: t(userId, 'filterRandom'), callback_data: 'filter_random' }],
            [{ text: '🎁 ' + t(userId, 'btnReferral'), callback_data: 'show_referral' }]
          ]
        }
      });
    }
  }

  // Deduct Coins
  if (cost > 0 && !user.is_vip) {
    user.coins -= cost;
    saveDb();
  }

  // Queue Match Search
  let matchedIdx = -1;
  for (let i = 0; i < waitingQueue.length; i++) {
    const cand = waitingQueue[i];
    if (cand.userId === userId) continue;

    const candUser = db.users[cand.userId];
    if (!candUser) continue;

    let isMatch = true;
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

    // Reward active chat XP
    addXp(userId, 10);
    addXp(partnerId, 10);

    const userBadge = `${user.gender === 'female' ? '👩' : '👨'} ${user.name} (${user.age} yrs, ${user.province})`;
    const partnerBadge = `${partnerUser.gender === 'female' ? '👩' : '👨'} ${partnerUser.name} (${partnerUser.age} yrs, ${partnerUser.province})`;

    const inChatKeyboardUser = {
      keyboard: [
        [{ text: t(userId, 'inChatNext') }, { text: t(userId, 'inChatStop') }],
        [{ text: t(userId, 'inChatShareId') }, { text: t(userId, 'inChatDuel') }]
      ],
      resize_keyboard: true
    };

    const inChatKeyboardPartner = {
      keyboard: [
        [{ text: t(partnerId, 'inChatNext') }, { text: t(partnerId, 'inChatStop') }],
        [{ text: t(partnerId, 'inChatShareId') }, { text: t(partnerId, 'inChatDuel') }]
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

  // Push to queue
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
// 11. IN-CHAT CONTROLS & SOCIAL KARMA RATING
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

async function shareContact(chatId, userId, msg) {
  if (!activePairs.has(userId)) return;
  const partnerId = activePairs.get(userId);
  const username = msg.from.username;
  const user = db.users[userId];

  if (!username) {
    return callTgApi('sendMessage', { chat_id: chatId, text: t(userId, 'noUsernameErr') });
  }

  callTgApi('sendMessage', {
    chat_id: partnerId,
    text: t(partnerId, 'shareIdReceived', { name: user?.name || 'User', username }),
    parse_mode: 'HTML'
  }).catch(() => {});

  return callTgApi('sendMessage', { chat_id: chatId, text: t(userId, 'shareIdSuccess') });
}

// Media Relay with Anti-Spam Rate Limiter
async function relayMessage(msg, partnerId) {
  const userId = String(msg.from.id);
  const now = Date.now();
  const lastTime = userRateLimits.get(userId) || 0;
  if (now - lastTime < CONFIG.RATE_LIMIT_MS) {
    return; // Rate limit drop
  }
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
// 12. 1v1 IN-BOT GAMES: ROCK-PAPER-SCISSORS & DICE
// ----------------------------------------------------
async function sendGamesMenu(chatId, userId) {
  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: t(userId, 'gameRps'), callback_data: 'game_rps_start' }],
      [{ text: t(userId, 'gameDice'), callback_data: 'game_dice_start' }],
      [
        { text: t(userId, 'gameHokm'), web_app: { url: `${CONFIG.WEBAPP_URL}#/games/hokm` } },
        { text: t(userId, 'gameBackgammon'), web_app: { url: `${CONFIG.WEBAPP_URL}#/games/backgammon` } }
      ],
      [{ text: t(userId, 'btnMiniApp'), web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }]
    ]
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'gamesTitle'),
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  });
}

async function startRpsGame(chatId, userId) {
  const user = db.users[userId];
  if ((user.coins || 0) < 50) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: t(userId, 'lowCoinsNotice', { cost: 50, coins: user.coins || 0 }),
      parse_mode: 'HTML'
    });
  }

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'rpsPrompt'),
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: t(userId, 'rpsRock'), callback_data: 'rps_move_rock' },
          { text: t(userId, 'rpsPaper'), callback_data: 'rps_move_paper' },
          { text: t(userId, 'rpsScissors'), callback_data: 'rps_move_scissors' }
        ]
      ]
    }
  });
}

async function handleRpsMove(chatId, userId, playerMove) {
  const user = db.users[userId];
  if (!user || (user.coins || 0) < 50) return;

  user.coins -= 50;
  saveDb();

  const moves = ['rock', 'paper', 'scissors'];
  const botMove = moves[Math.floor(Math.random() * moves.length)];
  const moveIcons = { rock: '🪨', paper: '📄', scissors: '✂️' };

  let resultKey = '';
  if (playerMove === botMove) {
    user.coins += 50; // Return wager
    resultKey = 'rpsTie';
  } else if (
    (playerMove === 'rock' && botMove === 'scissors') ||
    (playerMove === 'paper' && botMove === 'rock') ||
    (playerMove === 'scissors' && botMove === 'paper')
  ) {
    user.coins += 90; // 50+40 profit (10% house rake)
    addXp(userId, 25);
    resultKey = 'rpsWin';
  } else {
    addXp(userId, 5);
    resultKey = 'rpsLose';
  }

  db.stats.totalMatchesPlayed++;
  saveDb();

  const verdict = t(userId, resultKey);
  const details = `${moveIcons[playerMove]} (You) VS ${moveIcons[botMove]} (Opponent)\n\n${verdict}\n🪙 Balance: <b>${user.coins.toLocaleString()}</b> Coins`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: details,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '🔄 ' + t(userId, 'gameRps'), callback_data: 'game_rps_start' }]]
    }
  });
}

async function startDiceDuel(chatId, userId) {
  const user = db.users[userId];
  if ((user.coins || 0) < 50) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: t(userId, 'lowCoinsNotice', { cost: 50, coins: user.coins || 0 }),
      parse_mode: 'HTML'
    });
  }

  user.coins -= 50;
  saveDb();

  const msgDice1 = await callTgApi('sendDice', { chat_id: chatId, emoji: '🎲' });
  const val1 = msgDice1?.dice?.value || 3;

  setTimeout(async () => {
    const msgDice2 = await callTgApi('sendDice', { chat_id: chatId, emoji: '🎲' });
    const val2 = msgDice2?.dice?.value || 3;

    setTimeout(() => {
      let resultText = '';
      if (val1 > val2) {
        user.coins += 90;
        addXp(userId, 25);
        resultText = user.lang === 'en' ? '🎉 <b>You Won! (+90 Coins & +25 XP)</b>' : '🎉 <b>شما برنده شدید! (+۹۰ سکه و +۲۵ XP)</b>';
      } else if (val1 < val2) {
        addXp(userId, 5);
        resultText = user.lang === 'en' ? '😢 <b>Opponent Won! (+5 XP)</b>' : '😢 <b>حریف برنده شد! (+۵ XP)</b>';
      } else {
        user.coins += 50;
        resultText = user.lang === 'en' ? '🤝 <b>It is a Tie! (Wager returned)</b>' : '🤝 <b>مساوی شد! (سکه برگشت داده شد)</b>';
      }
      db.stats.totalMatchesPlayed++;
      saveDb();

      callTgApi('sendMessage', {
        chat_id: chatId,
        text: `🎲 You: <b>${val1}</b> | Opponent: <b>${val2}</b>\n\n${resultText}\n🪙 Balance: <b>${user.coins.toLocaleString()}</b> Coins`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: '🎲 ' + t(userId, 'gameDice'), callback_data: 'game_dice_start' }]]
        }
      });
    }, 2500);
  }, 1500);
}

// ----------------------------------------------------
// 13. MONETIZATION: TELEGRAM STARS & VIP PLANS
// ----------------------------------------------------
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

// ----------------------------------------------------
// 14. REFERRAL & LEADERBOARD
// ----------------------------------------------------
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

  const replyMarkup = {
    inline_keyboard: [
      [{ text: t(userId, 'btnShareRef'), url: `https://t.me/share/url?url=${refLink}&text=${encodeURIComponent(shareText)}` }]
    ]
  };

  const bannerPhotoUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';

  try {
    return await callTgApi('sendPhoto', {
      chat_id: chatId,
      photo: bannerPhotoUrl,
      caption: captionText,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    });
  } catch (err) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: captionText,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    });
  }
}

async function sendLeaderboard(chatId, userId) {
  const allUsers = Object.values(db.users);
  const topCoins = allUsers
    .sort((a, b) => (b.coins || 0) - (a.coins || 0))
    .slice(0, 5)
    .map((u, i) => `${i + 1}. ${u.name || 'User'} - <b>${(u.coins || 0).toLocaleString()}</b> 🪙 (Lvl ${u.level || 1})`)
    .join('\n') || 'No records yet';

  const topKarma = allUsers
    .sort((a, b) => (b.karma || 100) - (a.karma || 100))
    .slice(0, 5)
    .map((u, i) => `${i + 1}. ${u.name || 'User'} - ⭐ <b>${u.karma || 100}</b> Karma`)
    .join('\n') || 'No records yet';

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'leaderboardTitle', { topCoins, topKarma }),
    parse_mode: 'HTML'
  });
}

// ----------------------------------------------------
// 15. ADMIN PANEL & BROADCAST
// ----------------------------------------------------
async function sendAdminPanel(chatId, userId) {
  if (!CONFIG.ADMIN_IDS.includes(userId)) return;

  const totalUsers = Object.keys(db.users).length;
  const totalMatches = db.stats.totalMatchesPlayed || 0;
  const totalChats = db.stats.totalChatsCompleted || 0;
  const totalRevenue = db.stats.totalStarsRevenue || 0;
  const activeChatPairs = activePairs.size / 2;

  const adminText = `📊 <b>ZenOsLife Master Admin Control Panel</b>\n\n` +
    `👥 Total Users: <b>${totalUsers.toLocaleString()}</b>\n` +
    `💬 Active Chat Pairs: <b>${activeChatPairs}</b>\n` +
    `⏳ In Queue: <b>${waitingQueue.length}</b>\n` +
    `🎮 Matches Played: <b>${totalMatches.toLocaleString()}</b>\n` +
    `⭐ Total Stars Revenue: <b>${totalRevenue.toLocaleString()} Stars</b>\n\n` +
    `📢 To broadcast: <code>/broadcast your message here</code>`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: adminText,
    parse_mode: 'HTML'
  });
}

// ----------------------------------------------------
// 16. MESSAGE DISPATCHER
// ----------------------------------------------------
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const text = msg.text || '';

  // 1. Active Chat Relay & Controls
  if (activePairs.has(userId)) {
    if (text === t(userId, 'inChatStop') || text === '/stop') {
      return stopChat(chatId, userId);
    }
    if (text === t(userId, 'inChatNext') || text === '/next') {
      return nextPartner(chatId, userId);
    }
    if (text === t(userId, 'inChatShareId')) {
      return shareContact(chatId, userId, msg);
    }
    if (text === t(userId, 'inChatDuel')) {
      return sendGamesMenu(chatId, userId);
    }
    if (text === t(userId, 'inChatReport')) {
      await stopChat(chatId, userId);
      return callTgApi('sendMessage', { chat_id: chatId, text: '🚩 Report logged. Partner disconnected.' });
    }
    return relayMessage(msg, activePairs.get(userId));
  }

  // 2. Queue cancellation
  if (waitingQueue.some(w => w.userId === userId)) {
    if (text === t(userId, 'inChatStop') || text === '/stop') {
      return stopChat(chatId, userId);
    }
  }

  // 3. Registration or Name Editing step
  if (registrationSteps.has(userId)) {
    const reg = registrationSteps.get(userId);
    if (reg.step === 'editing_name' && text) {
      registrationSteps.delete(userId);
      if (db.users[userId]) {
        db.users[userId].name = text.slice(0, 25);
        saveDb();
      }
      const isEn = db.users[userId]?.lang === 'en';
      await callTgApi('sendMessage', {
        chat_id: chatId,
        text: isEn ? `✅ Name changed to: <b>${text.slice(0, 25)}</b>` : `✅ نام شما با موفقیت به <b>«${text.slice(0, 25)}»</b> تغییر یافت.`,
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

  // 4. Main Commands & Menu Taps
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const startParam = parts[1] || '';
    const user = db.users[userId];
    if (!user || !user.profileCompleted) {
      return startLanguageChoice(chatId, userId, startParam);
    }
    return sendMainDashboard(chatId, userId);
  }

  if (text === '/admin') return sendAdminPanel(chatId, userId);
  if (text === '/lang') return startLanguageChoice(chatId, userId);
  if (text === '/rps') return startRpsGame(chatId, userId);
  if (text === '/dice') return startDiceDuel(chatId, userId);
  if (text === '/vip') return sendVipPlansMenu(chatId, userId);
  if (text === '/buy') return sendBuyStarsMenu(chatId, userId);
  if (text === '/rank') return sendLeaderboard(chatId, userId);
  if (text === '/ref') return sendReferralHub(chatId, userId);

  // Admin Broadcast
  if (text.startsWith('/broadcast') && CONFIG.ADMIN_IDS.includes(userId)) {
    const broadcastMsg = text.replace('/broadcast', '').trim();
    if (!broadcastMsg) return callTgApi('sendMessage', { chat_id: chatId, text: 'Usage: /broadcast <message>' });
    const allUsers = Object.keys(db.users);
    let count = 0;
    for (const uid of allUsers) {
      callTgApi('sendMessage', { chat_id: uid, text: `📢 <b>ZenOsLife Broadcast:</b>\n\n${broadcastMsg}`, parse_mode: 'HTML' })
        .then(() => count++)
        .catch(() => {});
    }
    return callTgApi('sendMessage', { chat_id: chatId, text: `✅ Broadcasting to ${allUsers.length} users started.` });
  }

  // Reply Keyboard Matching
  if (text === t(userId, 'btnChat') || text === '/chat') return sendFilterMenu(chatId, userId);
  if (text === t(userId, 'btnGames') || text === '/games') return sendGamesMenu(chatId, userId);
  if (text === t(userId, 'btnCoins')) return sendBuyStarsMenu(chatId, userId);
  if (text === t(userId, 'btnVip')) return sendVipPlansMenu(chatId, userId);
  if (text === t(userId, 'btnReferral')) return sendReferralHub(chatId, userId);
  if (text === t(userId, 'btnLeaderboard')) return sendLeaderboard(chatId, userId);
  if (text === t(userId, 'btnSettings')) return startLanguageChoice(chatId, userId);

  if (text === t(userId, 'btnProfile')) {
    return sendProfileCard(chatId, userId);
  }

  if (text === t(userId, 'btnMiniApp')) {
    const isEn = db.users[userId]?.lang === 'en';
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: isEn ? '🚀 <b>ZenOsLife Mini App:</b>' : '🚀 <b>ورود به دنیای زنوسلایف:</b>',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: isEn ? '🌟 Launch Mini App' : '🌟 ورود به مینی‌اپلیکیشن', web_app: { url: CONFIG.WEBAPP_URL } }]]
      }
    });
  }

  // Fallback
  return sendMainDashboard(chatId, userId);
}

// ----------------------------------------------------
// 17. CALLBACK QUERY HANDLER
// ----------------------------------------------------
async function handleCallbackQuery(cq) {
  const chatId = cq.message.chat.id;
  const userId = String(cq.from.id);
  const data = cq.data;
  callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});

  // Language Selection
  if (data.startsWith('set_lang_')) {
    const lang = data.replace('set_lang_', '');
    let reg = registrationSteps.get(userId);
    if (!reg) {
      reg = {
        step: 'gender',
        tempProfile: {
          userId,
          coins: 1000,
          xp: 0,
          level: 1,
          karma: 100,
          streak_days: 1,
          last_streak_date: new Date().toISOString().slice(0, 10),
          referrals: [],
          lastRefill: Date.now(),
          createdAt: Date.now()
        }
      };
    }
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

  // Gender Selection
  if (data.startsWith('reg_gender_')) {
    const gender = data.replace('reg_gender_', '');
    let reg = registrationSteps.get(userId);
    if (!reg) {
      reg = {
        step: 'age',
        tempProfile: {
          userId,
          lang: db.users[userId]?.lang || 'fa',
          coins: 1000,
          karma: 100,
          referrals: [],
          name: cq.from.first_name || 'کاربر زنوسلایف'
        }
      };
    }
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

  // Age Selection
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

  // Province Selection & Finish Onboarding
  if (data.startsWith('reg_prov_')) {
    const prov = data.replace('reg_prov_', '');
    let reg = registrationSteps.get(userId);
    if (!reg) return startLanguageChoice(chatId, userId);

    reg.tempProfile.province = prov;
    reg.tempProfile.profileCompleted = true;
    db.users[userId] = reg.tempProfile;
    saveDb();
    registrationSteps.delete(userId);

    // Referral Bounty Fulfillment
    if (reg.tempProfile.invitedBy && db.users[reg.tempProfile.invitedBy]) {
      const refUser = db.users[reg.tempProfile.invitedBy];
      refUser.referrals = refUser.referrals || [];
      refUser.referrals.push(userId);
      refUser.coins = (refUser.coins || 0) + 1000;
      addXp(reg.tempProfile.invitedBy, 50);
      saveDb();

      callTgApi('sendMessage', {
        chat_id: reg.tempProfile.invitedBy,
        text: db.users[reg.tempProfile.invitedBy]?.lang === 'en'
          ? '🎉 <b>Congratulations! A friend joined with your invite link! (+1,000 Coins & +50 XP)</b>'
          : '🎉 <b>تبریک! دوست جدیدی با لینک شما ثبت‌نام کرد! (+۱,۰۰۰ سکه هدیه و +۵۰ XP)</b>',
        parse_mode: 'HTML'
      }).catch(() => {});
    }

    return sendMainDashboard(chatId, userId, t(userId, 'regDone'));
  }

  // Karma Rating Action
  if (data.startsWith('karma_5_')) {
    const targetUserId = data.replace('karma_5_', '');
    if (db.users[targetUserId]) {
      db.users[targetUserId].karma = (db.users[targetUserId].karma || 100) + 5;
      saveDb();
    }
    return callTgApi('sendMessage', { chat_id: chatId, text: t(userId, 'karmaThanks') });
  }

  // Chat Filter Triggers
  if (data === 'filter_random') return executeMatchSearch(chatId, userId, 'random');
  if (data === 'filter_samelang') return executeMatchSearch(chatId, userId, 'samelang');
  if (data === 'filter_global') return executeMatchSearch(chatId, userId, 'global');
  if (data === 'filter_female') return executeMatchSearch(chatId, userId, 'female');
  if (data === 'filter_male') return executeMatchSearch(chatId, userId, 'male');
  if (data === 'filter_province') return executeMatchSearch(chatId, userId, 'province');
  if (data === 'buy_stars') return sendBuyStarsMenu(chatId, userId);
  if (data === 'show_referral') return sendReferralHub(chatId, userId);
  if (data === 'edit_profile') return sendProfileEditMenu(chatId, userId);
  if (data === 'view_profile_full') return sendProfileCard(chatId, userId);

  // Field Edit Triggers
  if (data === 'edit_field_name') {
    registrationSteps.set(userId, { step: 'editing_name' });
    const isEn = db.users[userId]?.lang === 'en';
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: isEn ? '✏️ Please type and send your <b>new name</b> in chat:' : '✏️ لطفاً <b>نام جدید</b> خود را در چت ارسال کنید:',
      parse_mode: 'HTML'
    });
  }

  if (data === 'edit_field_gender') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: t(userId, 'chooseGender'),
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(userId, 'male'), callback_data: 'save_edit_gender_male' }, { text: t(userId, 'female'), callback_data: 'save_edit_gender_female' }],
          [{ text: '🔙', callback_data: 'edit_profile' }]
        ]
      }
    });
  }

  if (data.startsWith('save_edit_gender_')) {
    const newGender = data.replace('save_edit_gender_', '');
    if (db.users[userId]) {
      db.users[userId].gender = newGender;
      saveDb();
    }
    const isEn = db.users[userId]?.lang === 'en';
    await callTgApi('sendMessage', {
      chat_id: chatId,
      text: isEn ? '✅ Gender updated successfully!' : '✅ جنسیت با موفقیت به‌روزرسانی شد!'
    });
    return sendProfileCard(chatId, userId);
  }

  if (data === 'edit_field_age') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: t(userId, 'chooseAge'),
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(userId, 'age1'), callback_data: 'save_edit_age_18-21' }, { text: t(userId, 'age2'), callback_data: 'save_edit_age_22-26' }],
          [{ text: t(userId, 'age3'), callback_data: 'save_edit_age_27-34' }, { text: t(userId, 'age4'), callback_data: 'save_edit_age_35+' }],
          [{ text: '🔙', callback_data: 'edit_profile' }]
        ]
      }
    });
  }

  if (data.startsWith('save_edit_age_')) {
    const newAge = data.replace('save_edit_age_', '');
    if (db.users[userId]) {
      db.users[userId].age = newAge;
      saveDb();
    }
    const isEn = db.users[userId]?.lang === 'en';
    await callTgApi('sendMessage', {
      chat_id: chatId,
      text: isEn ? '✅ Age range updated successfully!' : '✅ رده سنی با موفقیت به‌روزرسانی شد!'
    });
    return sendProfileCard(chatId, userId);
  }

  if (data === 'edit_field_prov') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: t(userId, 'chooseProv'),
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(userId, 'provTeh'), callback_data: 'save_edit_prov_Tehran' }, { text: t(userId, 'provIsf'), callback_data: 'save_edit_prov_Isfahan' }],
          [{ text: t(userId, 'provMsh'), callback_data: 'save_edit_prov_Mashhad' }, { text: t(userId, 'provShr'), callback_data: 'save_edit_prov_Shiraz' }],
          [{ text: t(userId, 'provTab'), callback_data: 'save_edit_prov_Tabriz' }, { text: t(userId, 'provAhv'), callback_data: 'save_edit_prov_Ahvaz' }],
          [{ text: t(userId, 'provNrt'), callback_data: 'save_edit_prov_North' }, { text: t(userId, 'provOth'), callback_data: 'save_edit_prov_Global' }],
          [{ text: '🔙', callback_data: 'edit_profile' }]
        ]
      }
    });
  }

  if (data.startsWith('save_edit_prov_')) {
    const newProv = data.replace('save_edit_prov_', '');
    if (db.users[userId]) {
      db.users[userId].province = newProv;
      saveDb();
    }
    const isEn = db.users[userId]?.lang === 'en';
    await callTgApi('sendMessage', {
      chat_id: chatId,
      text: isEn ? '✅ Region updated successfully!' : '✅ استان سکونت با موفقیت به‌روزرسانی شد!'
    });
    return sendProfileCard(chatId, userId);
  }

  if (data === 'edit_field_lang') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🌐 <b>لطفاً زبان جدید را انتخاب کنید / Please select new language:</b>',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'فارسی (Persian)', callback_data: 'save_edit_lang_fa' }, { text: 'English', callback_data: 'save_edit_lang_en' }],
          [{ text: '🔙', callback_data: 'edit_profile' }]
        ]
      }
    });
  }

  if (data.startsWith('save_edit_lang_')) {
    const newLang = data.replace('save_edit_lang_', '');
    if (db.users[userId]) {
      db.users[userId].lang = newLang;
      saveDb();
    }
    const isEn = newLang === 'en';
    await callTgApi('sendMessage', {
      chat_id: chatId,
      text: isEn ? '✅ Language changed to English!' : '✅ زبان به فارسی تغییر یافت!'
    });
    return sendProfileCard(chatId, userId);
  }

  // Games Triggers
  if (data === 'game_rps_start') return startRpsGame(chatId, userId);
  if (data === 'game_dice_start') return startDiceDuel(chatId, userId);
  if (data.startsWith('rps_move_')) {
    const move = data.replace('rps_move_', '');
    return handleRpsMove(chatId, userId, move);
  }

  // VIP Purchases via Stars
  if (data.startsWith('buy_vip_')) {
    const days = parseInt(data.replace('buy_vip_', ''));
    const vipPrices = { 7: 75, 30: 250, 90: 650 };
    const stars = vipPrices[days] || 250;
    const title = `👑 VIP Membership (${days} Days)`;

    return callTgApi('sendInvoice', {
      chat_id: chatId,
      title: title,
      description: `Activation of ZenOsLife VIP Pass for ${days} days with unlimited filters and perks`,
      payload: JSON.stringify({ userId, type: 'vip', days, stars }),
      currency: 'XTR',
      prices: [{ label: title, amount: stars }]
    });
  }

  // Coin Package Invoices
  if (data.startsWith('buy_pkg_')) {
    const pkgType = data.replace('buy_pkg_', '');
    const packages = {
      'bronze': { title: '🪙 1,000 Coins', priceStars: 35, coins: 1000 },
      'silver': { title: '💰 5,000 Coins + Bonus', priceStars: 150, coins: 6000 },
      'global': { title: '🌍 12,000 Coins + Global Pass', priceStars: 300, coins: 12000 },
      'vip': { title: '💎 50,000 Coins + Royal VIP', priceStars: 1000, coins: 50000, isVip: true }
    };
    const pkg = packages[pkgType];
    if (pkg) {
      return callTgApi('sendInvoice', {
        chat_id: chatId,
        title: pkg.title,
        description: `Instant recharge of ${pkg.coins.toLocaleString()} Coins for your ZenOsLife account`,
        payload: JSON.stringify({ userId, type: 'coins', coins: pkg.coins, stars: pkg.priceStars, isVip: !!pkg.isVip }),
        currency: 'XTR',
        prices: [{ label: pkg.title, amount: pkg.priceStars }]
      });
    }
  }
}

// ----------------------------------------------------
// 18. TELEGRAM STARS PRE-CHECKOUT & VERIFIED SETTLEMENT
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

    // Idempotency check
    if (db.transactions[chargeId]) {
      console.warn('Duplicate transaction received:', chargeId);
      return;
    }

    // Save transaction
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

  const isEn = db.users[userId]?.lang === 'en';
  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: isEn
      ? '✅ <b>Payment with Telegram Stars Completed Successfully!</b>\nYour purchase has been automatically activated.'
      : '✅ <b>پرداخت با ستاره‌های تلگرام با موفقیت انجام شد!</b>\nسکه و اشتراک VIP بلافاصله به حساب شما افزوده شد.',
    parse_mode: 'HTML',
    reply_markup: getMainReplyKeyboard(userId)
  });
}

let cachedBotInfo = null;
async function getBotInfo() {
  if (!cachedBotInfo) cachedBotInfo = await callTgApi('getMe');
  return cachedBotInfo;
}

// ----------------------------------------------------
// 19. CRON & LONG POLLING LOOP
// ----------------------------------------------------
setInterval(checkVipExpiration, 6 * 3600 * 1000); // Check VIP expiry every 6h

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
console.log('🚀 ZenOsLife #1 Enterprise Engine Starting...');
initBotSettings().then(() => {
  pollUpdates();
  console.log('✨ Bot is Online with Full Bilingual Support, Gaming, Stars & Anti-Fraud!');
}).catch(err => {
  console.error('Fatal error starting bot:', err);
});
