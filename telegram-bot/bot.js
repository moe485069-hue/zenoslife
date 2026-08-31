/**
 * ZenOsLife #1 - Ultimate Bilingual Dating, Anonymous Chat, In-Bot Games & Telegram Stars Engine
 * 
 * Features:
 * 1. Bilingual System (🇮🇷 Persian & 🇬🇧 English)
 * 2. Onboarding Flow (Language, Gender, Age, Province/Location, Photo, 1000 Welcome Coins)
 * 3. Smart Anonymous Chat Engine (Random, Same-Language, Global/International, Gender, Province)
 * 4. In-Chat Real-time Media Relay (Text, Voice, Photo, Sticker, VideoNote)
 * 5. Social Karma & Mutual Respect Rating (🌟 Great Talker / ☕ Polite / 💡 Inspiring)
 * 6. Smart Retention & Faucet Refill (Surprise Coins if low balance + Mindful Pauses)
 * 7. In-Bot Multiplayer Games (🎲 Animated Dice Duel, ⚔️ Live Tic-Tac-Toe Matrix)
 * 8. Telegram Stars Invoices (sendInvoice currency: 'XTR' with instant webhook fulfillment)
 * 9. 1-Tap Viral Referral System (1000 Coins + 10% Lifetime Cut) & Daily Lucky Wheel
 * 10. Gateway to the ZenOsLife Mini App Universe
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ----------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------
const CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN || '8887477989:AAEj6gnWZvmhm2jFdjRzJAI3fwVtVptZrd4',
  WEBAPP_URL: process.env.WEBAPP_URL || 'https://zen.moeid.net',
  CHANNEL_USERNAME: process.env.CHANNEL_USERNAME || '@zenoslife_official',
  ADMIN_IDS: (process.env.ADMIN_IDS || '123456789').split(',').map(id => id.trim()),
  DATA_FILE: path.join(__dirname, 'bot_users.json')
};

// Database persistence
let usersDb = {};
try {
  if (fs.existsSync(CONFIG.DATA_FILE)) {
    usersDb = JSON.parse(fs.readFileSync(CONFIG.DATA_FILE, 'utf8'));
  }
} catch (e) {
  console.warn('Initializing empty users database');
}

function saveDb() {
  try {
    fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(usersDb, null, 2));
  } catch (e) {
    console.error('Error saving DB:', e.message);
  }
}

// ----------------------------------------------------
// STATE & RUNTIME MEMORY
// ----------------------------------------------------
// waitingQueue: Array of objects { userId, filterType, lang, province, gender, timestamp }
const waitingQueue = [];
// activePairs: Map of userId -> partnerUserId
const activePairs = new Map();
// registrationSteps: Map of userId -> { step: 'lang'|'gender'|'age'|'province'|'photo', tempProfile: {} }
const registrationSteps = new Map();
// activeGames: Map of gameId -> { gameType: 'tictactoe'|'dice', p1: userId, p2: userId, wager: number, state: any }
const activeGames = new Map();

// ----------------------------------------------------
// BILINGUAL STRINGS (fa & en)
// ----------------------------------------------------
const STRINGS = {
  fa: {
    welcomeNew: '👋 <b>به سیستم عامل زندگی و چت ناشناس زنوسلایف خوش آمدید!</b>\n\nبرای شروع گفتگو، دوستیابی و بازی‌ها، لطفاً ابتدا زبان خود را انتخاب کنید:',
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
    regDone: '🎉 <b>تبریک! پروفایل شما ساخته شد و ۱,۰۰۰ سکه هدیه گرفتید! 🪙</b>',
    mainMenuHeader: '👑 <b>پایگاه چت ناشناس، دوستیابی و بازی‌های آنلاین</b>',
    profileBadge: '👤 <b>پروفایل:</b> {gender} {name} ({age} ساله از {prov})',
    coinsBadge: '🪙 <b>موجودی:</b> {coins} سکه {vip}',
    karmaBadge: '⭐ <b>امتیاز کارما و اخلاق:</b> {karma} امتیاز',
    refsBadge: '👥 <b>تعداد دعوت‌ها:</b> {refs} نفر',
    btnConnect: '🙈 به یه ناشناس وصلم کن!',
    btnGlobal: '🌍 چت بین‌المللی و هم‌زبان',
    btnGenderSearch: '💬 فیلتر جنسیت (دختر/پسر)',
    btnGames: '🎮 بازی‌ها و دوئل‌های لایو',
    btnCoins: '🪙 موجودی سکه و خرید ستاره',
    btnProfile: '👤 پروفایل و کارمای من',
    btnReferral: '🔗 دریافت سکه رایگان (دعوت)',
    btnMiniApp: '🌟 ورود به دنیای زنوسلایف (Mini App)',
    filterTitle: '🙈 <b>به کی دوست داری وصل شی؟ انتخاب کن:</b> 👇',
    filterRandom: '🎲 جستجوی شانسی (رایگان)',
    filterSameLang: '🇮🇷 چت هم‌زبان (فارسی‌زبانان)',
    filterGlobal: '🌍 چت بین‌المللی (Global)',
    filterFemale: '👩 اتصال به دختر (۵۰ سکه)',
    filterMale: '👨 اتصال به پسر (۵۰ سکه)',
    filterProv: '🛰️ افراد نزدیک و همشهری (۳۰ سکه)',
    searching: '🔍 <b>در حال جستجوی هم‌صحبت با مشخصات درخواستی...</b>\n\n⏳ لطفاً چند لحظه صبر کنید تا کاربر مناسب به شما متصل شود.',
    searchCancelled: '✅ جستجوی هم‌صحبت لغو شد.',
    matched: '🎉 <b>هم‌صحبت پیدا شد!</b>\n\n🎭 <b>مشخصات طرف مقابل:</b> {badge}\n⭐ <b>کارمای اخلاق:</b> {karma} امتیاز\n\n💬 می‌توانید پیام متنی، ویس، عکس یا استیکر بفرستید.',
    inChatNext: '⏭️ هم‌صحبت بعدی',
    inChatStop: '🛑 پایان گفتگو',
    inChatShareId: '💖 ارسال آیدی تلگرام',
    inChatDuel: '🎲 دوئل تاس و بازی',
    inChatReport: '🚩 گزارش تخلف',
    chatEndedSelf: '🛑 <b>شما مکالمه را پایان دادید.</b>',
    chatEndedPartner: '🛑 <b>هم‌صحبت شما چت را ترک کرد.</b>',
    chatNextPartner: '🛑 <b>هم‌صحبت شما به سراغ فرد دیگری رفت.</b>',
    karmaPrompt: '🌟 <b>مکالمه با هم‌صحبت چطور بود؟</b>\nبا امتیاز دادن به ادب و اخلاق او، فرهنگ چت سالم را تقویت کنید:',
    karmaGreat: '🌟 خوش‌صحبت و عالی (+۵ کارما)',
    karmaPolite: '☕ محترم و باادب (+۵ کارما)',
    karmaInspiring: '💡 هم‌فکر و الهام‌بخش (+۵ کارما)',
    karmaThanks: '🙏 از امتیاز شما سپاسگزاریم! ۵ امتیاز کارما به هم‌صحبت افزوده شد.',
    lowCoinsNotice: '⚠️ <b>موجودی سکه شما کافی نیست!</b>\nبرای این فیلتر نیاز به <b>{cost} سکه</b> دارید.\nموجودی: <b>{coins}</b> سکه',
    surpriseRefill: '🎁 <b>هدیه شارژ شگفت‌انگیز زنوسلایف!</b>\n\nبه پاس همراهی شما، <b>۲۰۰ سکه رایگان</b> برای ۴ چت فیلتردار دیگر به کیف پولت اضافه شد! 🪙✨',
    shareIdSuccess: '✅ آیدی شما با موفقیت برای هم‌صحبت ارسال شد.',
    shareIdReceived: '💖 <b>هم‌صحبت آیدی تلگرام خود را به اشتراک گذاشت:</b>\n👤 نام: <b>{name}</b>\n🆔 آیدی: @{username}',
    noUsernameErr: '⚠️ اکانت تلگرام شما آیدی ندارد. لطفاً در تنظیمات تلگرام یک Username ست کنید.'
  },
  en: {
    welcomeNew: '👋 <b>Welcome to ZenOsLife Anonymous Chat & Social Engine!</b>\n\nPlease select your language to begin:',
    chooseGender: '👤 Please select your <b>gender</b>:',
    male: '👨 Male / Boy',
    female: '👩 Female / Girl',
    chooseAge: '🎂 Please select your <b>age range</b>:',
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
    provOth: 'Global / International',
    regDone: '🎉 <b>Congratulations! Your profile is ready with 1,000 Welcome Coins! 🪙</b>',
    mainMenuHeader: '👑 <b>Anonymous Chat, Social Dating & Live Games Hub</b>',
    profileBadge: '👤 <b>Profile:</b> {gender} {name} ({age} yrs, {prov})',
    coinsBadge: '🪙 <b>Balance:</b> {coins} Coins {vip}',
    karmaBadge: '⭐ <b>Karma & Ethics Score:</b> {karma} pts',
    refsBadge: '👥 <b>Total Referrals:</b> {refs} friends',
    btnConnect: '🙈 Connect to a Stranger!',
    btnGlobal: '🌍 Global & Language Match',
    btnGenderSearch: '💬 Gender Filters (Girl/Boy)',
    btnGames: '🎮 Games & Live Duels',
    btnCoins: '🪙 Coins & Telegram Stars ⭐',
    btnProfile: '👤 My Profile & Karma',
    btnReferral: '🔗 Free Coins (Invite Friends)',
    btnMiniApp: '🌟 Open ZenOsLife (Mini App)',
    filterTitle: '🙈 <b>Who would you like to connect with?</b> 👇',
    filterRandom: '🎲 Random Match (Free)',
    filterSameLang: '🇬🇧 English Speakers Match',
    filterGlobal: '🌍 Global Discovery (All Countries)',
    filterFemale: '👩 Connect to Girl (50 Coins)',
    filterMale: '👨 Connect to Boy (50 Coins)',
    filterProv: '🛰️ Same Region Match (30 Coins)',
    searching: '🔍 <b>Searching for the best partner...</b>\n\n⏳ Please wait a moment while we match you with an online user.',
    searchCancelled: '✅ Search cancelled.',
    matched: '🎉 <b>Partner Found!</b>\n\n🎭 <b>Stranger Info:</b> {badge}\n⭐ <b>Karma Score:</b> {karma} pts\n\n💬 Feel free to send text, voice notes, photos, or stickers.',
    inChatNext: '⏭️ Next Partner',
    inChatStop: '🛑 End Chat',
    inChatShareId: '💖 Share Telegram ID',
    inChatDuel: '🎲 Dice Duel & Games',
    inChatReport: '🚩 Report User',
    chatEndedSelf: '🛑 <b>You ended the conversation.</b>',
    chatEndedPartner: '🛑 <b>Your partner left the chat.</b>',
    chatNextPartner: '🛑 <b>Your partner moved on to someone else.</b>',
    karmaPrompt: '🌟 <b>How was your conversation?</b>\nRate your partner to promote respectful and quality social vibes:',
    karmaGreat: '🌟 Great Talker (+5 Karma)',
    karmaPolite: '☕ Polite & Respectful (+5 Karma)',
    karmaInspiring: '💡 Inspiring (+5 Karma)',
    karmaThanks: '🙏 Thank you for your feedback! +5 Karma added to your partner.',
    lowCoinsNotice: '⚠️ <b>Insufficient Coins!</b>\nThis filter requires <b>{cost} Coins</b>.\nCurrent Balance: <b>{coins}</b> Coins',
    surpriseRefill: '🎁 <b>Surprise Coin Refill!</b>\n\nAs a valued member, here is <b>200 Free Coins</b> for your next filtered chats! 🪙✨',
    shareIdSuccess: '✅ Your Telegram ID has been shared with your partner.',
    shareIdReceived: '💖 <b>Your partner shared their Telegram ID:</b>\n👤 Name: <b>{name}</b>\n🆔 Username: @{username}',
    noUsernameErr: '⚠️ You do not have a Telegram Username set in your Telegram Settings.'
  }
};

function t(userId, key, params = {}) {
  const lang = usersDb[userId]?.lang || 'fa';
  let str = STRINGS[lang]?.[key] || STRINGS.fa[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return str;
}

// ----------------------------------------------------
// HTTPS CLIENT WITH TLS FIXES
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

// Initialize Menu Button & Commands
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
        { command: 'chat', description: '🙈 Anonymous Chat / چت ناشناس' },
        { command: 'next', description: '⏭️ Next Partner / هم‌صحبت بعدی' },
        { command: 'stop', description: '🛑 End Chat / پایان گفتگو' },
        { command: 'games', description: '🎮 Live Games / بازی‌ها و دوئل' },
        { command: 'buy', description: '⭐ Buy Stars & Coins / خرید ستاره' },
        { command: 'ref', description: '👥 Invite Friends / دعوت دوستان' },
        { command: 'lang', description: '🌐 Change Language / تغییر زبان' }
      ]
    });

    console.log('✅ Bot Commands & Menu initialized!');
  } catch (e) {
    console.warn('Notice during bot init:', e.message);
  }
}

// ----------------------------------------------------
// 1. ONBOARDING & LANGUAGE SELECTION
// ----------------------------------------------------
async function startLanguageChoice(chatId, userId, startParam = '') {
  registrationSteps.set(userId, {
    step: 'lang',
    tempProfile: {
      userId,
      invitedBy: startParam.startsWith('ref_') ? startParam.replace('ref_', '') : null,
      coins: 1000,
      karma: 100,
      referrals: [],
      lastWheelSpin: 0,
      lastRefill: Date.now(),
      createdAt: Date.now()
    }
  });

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: '🌐 <b>Choose your language / زبان خود را انتخاب کنید:</b>',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🇮🇷 فارسی (Persian)', callback_data: 'set_lang_fa' },
          { text: '🇬🇧 English', callback_data: 'set_lang_en' }
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
// 2. MAIN NATIVE REPLY KEYBOARD
// ----------------------------------------------------
function getMainReplyKeyboard(userId) {
  return {
    keyboard: [
      [{ text: t(userId, 'btnConnect') }],
      [{ text: t(userId, 'btnGlobal') }, { text: t(userId, 'btnGenderSearch') }],
      [{ text: t(userId, 'btnGames') }, { text: t(userId, 'btnCoins') }],
      [{ text: t(userId, 'btnProfile') }, { text: t(userId, 'btnReferral') }],
      [{ text: t(userId, 'btnMiniApp') }]
    ],
    resize_keyboard: true
  };
}

async function sendMainDashboard(chatId, userId, alertMsg = '') {
  const user = usersDb[userId];
  if (!user || !user.profileCompleted) {
    return startLanguageChoice(chatId, userId);
  }

  // Check for smart retention coin refill (if < 100 coins and 4h passed)
  if ((user.coins || 0) < 100 && (!user.lastRefill || Date.now() - user.lastRefill > 4 * 3600 * 1000)) {
    user.coins = (user.coins || 0) + 200;
    user.lastRefill = Date.now();
    saveDb();
    callTgApi('sendMessage', { chat_id: chatId, text: t(userId, 'surpriseRefill'), parse_mode: 'HTML' }).catch(() => {});
  }

  const genderIcon = user.gender === 'female' ? '👩' : '👨';
  const vipText = user.isVip ? '👑 VIP' : '';

  const dashboardText = (alertMsg ? `${alertMsg}\n\n` : '') +
    `${t(userId, 'mainMenuHeader')}\n\n` +
    `${t(userId, 'profileBadge', { gender: genderIcon, name: user.name, age: user.age, prov: user.province })}\n` +
    `${t(userId, 'coinsBadge', { coins: (user.coins || 0).toLocaleString(), vip: vipText })}\n` +
    `${t(userId, 'karmaBadge', { karma: user.karma || 100 })}\n` +
    `${t(userId, 'refsBadge', { refs: (user.referrals || []).length })}`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: dashboardText,
    parse_mode: 'HTML',
    reply_markup: getMainReplyKeyboard(userId)
  });
}

// ----------------------------------------------------
// 3. FILTER MENU (به کی وصل بشم؟)
// ----------------------------------------------------
async function sendFilterMenu(chatId, userId) {
  const user = usersDb[userId];
  if (!user || !user.profileCompleted) return startLanguageChoice(chatId, userId);

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: t(userId, 'filterRandom'), callback_data: 'filter_random' }
      ],
      [
        { text: t(userId, 'filterSameLang'), callback_data: 'filter_samelang' },
        { text: t(userId, 'filterGlobal'), callback_data: 'filter_global' }
      ],
      [
        { text: t(userId, 'filterFemale'), callback_data: 'filter_female' },
        { text: t(userId, 'filterMale'), callback_data: 'filter_male' }
      ],
      [
        { text: t(userId, 'filterProv'), callback_data: 'filter_province' }
      ]
    ]
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: t(userId, 'filterTitle'),
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  });
}

// ----------------------------------------------------
// 4. MATCHMAKING ENGINE
// ----------------------------------------------------
async function executeMatchSearch(chatId, userId, filterType = 'random') {
  const user = usersDb[userId];
  if (!user) return;

  // Check Coins Cost
  let cost = 0;
  if (filterType === 'female' || filterType === 'male') cost = 50;
  if (filterType === 'province') cost = 30;
  if (filterType === 'global') cost = 20;

  if (cost > 0 && !user.isVip) {
    if ((user.coins || 0) < cost) {
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: t(userId, 'lowCoinsNotice', { cost, coins: (user.coins || 0).toLocaleString() }),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⭐ ' + t(userId, 'btnCoins'), callback_data: 'buy_stars' }],
            [{ text: t(userId, 'filterRandom'), callback_data: 'filter_random' }],
            [{ text: '👥 ' + t(userId, 'btnReferral'), callback_data: 'show_referral' }]
          ]
        }
      });
    }
  }

  // Deduct coins if applicable
  if (cost > 0 && !user.isVip) {
    user.coins -= cost;
    saveDb();
  }

  // Search queue
  let matchedIdx = -1;
  for (let i = 0; i < waitingQueue.length; i++) {
    const cand = waitingQueue[i];
    if (cand.userId === userId) continue;

    const candUser = usersDb[cand.userId];
    if (!candUser) continue;

    let isMatch = true;

    // Filter rules
    if (filterType === 'female' && candUser.gender !== 'female') isMatch = false;
    if (filterType === 'male' && candUser.gender !== 'male') isMatch = false;
    if (filterType === 'province' && candUser.province !== user.province) isMatch = false;
    if (filterType === 'samelang' && candUser.lang !== user.lang) isMatch = false;

    // Candidate rules
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
    const partnerUser = usersDb[partnerId];

    activePairs.set(userId, partnerId);
    activePairs.set(partnerId, userId);

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
      text: t(userId, 'matched', { badge: partnerBadge, karma: partnerUser.karma || 100 }),
      parse_mode: 'HTML',
      reply_markup: inChatKeyboardUser
    }).catch(() => {});

    callTgApi('sendMessage', {
      chat_id: partnerId,
      text: t(partnerId, 'matched', { badge: userBadge, karma: user.karma || 100 }),
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
// 5. IN-CHAT CONTROLS & SOCIAL KARMA RATING
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

    // Prompt Karma Rating for both users
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
  const user = usersDb[userId];

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

// Relay all media formats
async function relayMessage(msg, partnerId) {
  const senderUser = usersDb[String(msg.from.id)];
  const prefix = senderUser?.gender === 'female' ? '👩' : '👨';

  if (msg.text) {
    return callTgApi('sendMessage', {
      chat_id: partnerId,
      text: `${prefix} <b>${senderUser?.name || 'Partner'}:</b>\n${msg.text}`,
      parse_mode: 'HTML'
    });
  }
  if (msg.voice) {
    return callTgApi('sendVoice', {
      chat_id: partnerId,
      voice: msg.voice.file_id,
      caption: `${prefix} Voice Message`
    });
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
// 6. IN-BOT MULTIPLAYER GAMES (DICE & TICTACTOE)
// ----------------------------------------------------
async function sendGamesMenu(chatId, userId) {
  const text = usersDb[userId]?.lang === 'en'
    ? '🎮 <b>ZenOsLife In-Bot Live Games & Duels</b>\n\nChallenge your friends or online partners to instant coin games directly inside Telegram:'
    : '🎮 <b>بازی‌ها و دوئل‌های لایو زنوسلایف</b>\n\nدر همین محیط تلگرام با حریفان آنلاین یا دوستانتان مسابقه دهید و سکه برنده شوید:';

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🎲 دوئل رولت تاس متحرک (Dice Duel)', callback_data: 'game_duel_dice' },
        { text: '⚔️ نبرد دوز آنلاین (Tic-Tac-Toe)', callback_data: 'game_duel_ttt' }
      ],
      [
        { text: '👑 بازی حکم ۴ نفره آنلاین', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/hokm` } },
        { text: '🎲 تخته نرد ایرانی', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/backgammon` } }
      ],
      [
        { text: '🃏 پاستور (چهاربرگ)', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/pasur` } },
        { text: '🎱 بیلیارد و منچ', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }
      ],
      [
        { text: '🌟 ورود به لابی کامل بازی‌های مینی‌اپ', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }
      ]
    ]
  };

  return callTgApi('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup: inlineKeyboard });
}

async function startDiceDuel(chatId, userId) {
  const user = usersDb[userId];
  if ((user.coins || 0) < 50) {
    return callTgApi('sendMessage', { chat_id: chatId, text: t(userId, 'lowCoinsNotice', { cost: 50, coins: user.coins || 0 }), parse_mode: 'HTML' });
  }

  // Roll animated dice for player and bot/partner
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
        resultText = `🎉 <b>شما برنده شدید! (+۹۰ سکه)</b>\n\nتاس شما: <b>${val1}</b> | تاس حریف: <b>${val2}</b>`;
      } else if (val1 < val2) {
        resultText = `😢 <b>حریف برنده شد!</b>\n\nتاس شما: <b>${val1}</b> | تاس حریف: <b>${val2}</b>`;
      } else {
        user.coins += 50;
        resultText = `🤝 <b>مساوی شد! (سکه برگشت داده شد)</b>\n\nتاس شما: <b>${val1}</b> | تاس حریف: <b>${val2}</b>`;
      }
      saveDb();

      callTgApi('sendMessage', {
        chat_id: chatId,
        text: resultText + `\n\n🪙 موجودی جدید شما: <b>${user.coins.toLocaleString()}</b> سکه`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: '🎲 پرتاب مجدد تاس (۵۰ سکه)', callback_data: 'game_duel_dice' }]]
        }
      });
    }, 2500);
  }, 1500);
}

// ----------------------------------------------------
// 7. TELEGRAM STARS MONETIZATION
// ----------------------------------------------------
function sendBuyStarsMenu(chatId, userId) {
  const isEn = usersDb[userId]?.lang === 'en';
  const text = isEn
    ? '⭐ <b>Official Telegram Stars Coin Shop</b>\n\nRecharge Coins & VIP Status instantly using **Telegram Stars** (safe, 1-tap checkout worldwide):'
    : '⭐ <b>فروشگاه رسمی ستاره‌های تلگرام (Telegram Stars)</b>\n\nسکه و اشتراک VIP را مستقیماً با **Telegram Stars** در ۲ ثانیه شارژ کنید و بدون محدودیت با تمام دنیا چت کنید:';

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🪙 ۱,۰۰۰ Coins (35 Stars ⭐)', callback_data: 'buy_pkg_bronze' }],
        [{ text: '💰 ۵,۰۰۰ Coins + 1,000 Bonus (150 Stars ⭐)', callback_data: 'buy_pkg_silver' }],
        [{ text: '🌍 ۱۲,۰۰۰ Coins + Global Pass (300 Stars ⭐)', callback_data: 'buy_pkg_global' }],
        [{ text: '👑 ۵۰,۰۰۰ Coins + Royal VIP (1,000 Stars ⭐)', callback_data: 'buy_pkg_vip' }]
      ]
    }
  });
}

// ----------------------------------------------------
// 8. VIRAL REFERRAL ENGINE & DAILY WHEEL
// ----------------------------------------------------
async function sendReferralHub(chatId, userId) {
  const botInfo = await getBotInfo();
  const isEn = usersDb[userId]?.lang === 'en';
  const refLink = `https://t.me/${botInfo.username}?start=ref_${userId}`;
  const shareText = isEn
    ? encodeURIComponent(`🙈 Join me on ZenOsLife for Anonymous Chat & Live Games! Get 1,000 Free Coins 🎁👇\n${refLink}`)
    : encodeURIComponent(`🙈 بیا با هم چت ناشناس بکنیم و مسابقه بدیم! ۱,۰۰۰ سکه هدیه رایگان بگیر 🎁👇\n${refLink}`);
  const user = usersDb[userId] || { referrals: [] };

  const text = isEn
    ? `👥 <b>ZenOsLife Viral Referral Engine</b>\n\n` +
      `🔗 <b>Your Exclusive Invite Link:</b>\n<code>${refLink}</code>\n\n` +
      `🎁 <b>Rewards:</b>\n` +
      `• <b>1,000 Free Coins</b> for every friend who joins\n` +
      `• <b>10% Lifetime Cut</b> on all their future Stars purchases!\n\n` +
      `👥 Total Friends Invited: <b>${(user.referrals || []).length}</b>`
    : `👥 <b>سیستم دعوت و درآمدزایی خودکار زنوسلایف</b>\n\n` +
      `🔗 <b>لینک اختصاصی شما:</b>\n<code>${refLink}</code>\n\n` +
      `🎁 <b>پاداش شما:</b>\n` +
      `• <b>۱,۰۰۰ سکه هدیه</b> به ازای ورود هر دوست\n` +
      `• <b>۱۰٪ از تمام خریدهای آینده دوست شما</b> به صورت پورسانت مادام‌العمر!\n\n` +
      `👥 تعداد زیرمجموعه‌های شما: <b>${(user.referrals || []).length} نفر</b>`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: isEn ? '🚀 1-Tap Share to Friends & Groups' : '🚀 ارسال فوری برای دوستان و گروه‌ها', url: `https://t.me/share/url?url=${refLink}&text=${shareText}` }]
      ]
    }
  });
}

// ----------------------------------------------------
// 9. MESSAGE & COMMAND DISPATCHER
// ----------------------------------------------------
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const text = msg.text || '';

  // 1. If in active anonymous chat
  if (activePairs.has(userId)) {
    if (text === '🛑 پایان گفتگو' || text === '🛑 End Chat' || text === '/stop') {
      return stopChat(chatId, userId);
    }
    if (text === '⏭️ هم‌صحبت بعدی' || text === '⏭️ Next Partner' || text === '/next') {
      return nextPartner(chatId, userId);
    }
    if (text === '💖 ارسال آیدی تلگرام' || text === '💖 Share Telegram ID') {
      return shareContact(chatId, userId, msg);
    }
    if (text === '🎲 دوئل تاس و بازی' || text === '🎲 Dice Duel & Games') {
      const partnerId = activePairs.get(userId);
      callTgApi('sendMessage', {
        chat_id: partnerId,
        text: '🎲 <b>هم‌صحبت شما را به دوئل تاس دعوت کرد!</b>',
        reply_markup: {
          inline_keyboard: [[{ text: '🎲 پرتاب تاس مسابقه', callback_data: 'game_duel_dice' }]]
        }
      });
      return startDiceDuel(chatId, userId);
    }
    if (text === '🚩 گزارش تخلف' || text === '🚩 Report User') {
      await stopChat(chatId, userId);
      return callTgApi('sendMessage', { chat_id: chatId, text: '🚩 گزارش شما ثبت شد و ارتباط با این کاربر قطع گردید.' });
    }
    // Relay media
    const partnerId = activePairs.get(userId);
    return relayMessage(msg, partnerId);
  }

  // 2. If waiting in queue
  if (waitingQueue.some(w => w.userId === userId)) {
    if (text === '🛑 پایان گفتگو' || text === '🛑 End Chat' || text === '/stop') {
      return stopChat(chatId, userId);
    }
  }

  // 3. Registration name capture
  if (registrationSteps.has(userId)) {
    const reg = registrationSteps.get(userId);
    if (reg.step === 'name' && text) {
      reg.tempProfile.name = text.slice(0, 25);
      reg.step = 'gender';
      return promptGenderSelection(chatId, userId);
    }
  }

  // 4. Main Commands & Menu Buttons
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const startParam = parts[1] || '';
    const user = usersDb[userId];
    if (!user || !user.profileCompleted) {
      return startLanguageChoice(chatId, userId, startParam);
    }
    return sendMainDashboard(chatId, userId);
  }

  if (text === '/lang') {
    return startLanguageChoice(chatId, userId);
  }

  if (text === '🙈 به یه ناشناس وصلم کن!' || text === '🙈 Connect to a Stranger!' || text === '/chat') {
    return sendFilterMenu(chatId, userId);
  }

  if (text === '🌍 چت بین‌المللی و هم‌زبان' || text === '🌍 Global & Language Match') {
    return sendFilterMenu(chatId, userId);
  }

  if (text === '💬 فیلتر جنسیت (دختر/پسر)' || text === '💬 Gender Filters (Girl/Boy)') {
    return sendFilterMenu(chatId, userId);
  }

  if (text === '🎮 بازی‌ها و دوئل‌های لایو' || text === '🎮 Games & Live Duels' || text === '/games') {
    return sendGamesMenu(chatId, userId);
  }

  if (text === '🪙 موجودی سکه و خرید ستاره' || text === '🪙 Coins & Telegram Stars ⭐' || text === '/buy') {
    return sendBuyStarsMenu(chatId, userId);
  }

  if (text === '🔗 دریافت سکه رایگان (دعوت)' || text === '🔗 Free Coins (Invite Friends)' || text === '/ref') {
    return sendReferralHub(chatId, userId);
  }

  if (text === '👤 پروفایل و کارمای من' || text === '👤 My Profile & Karma') {
    const user = usersDb[userId];
    if (!user) return startLanguageChoice(chatId, userId);
    const genderIcon = user.gender === 'female' ? '👩' : '👨';
    const isEn = user.lang === 'en';

    const profText = isEn
      ? `👤 <b>ZenOsLife Social Profile:</b>\n\n` +
        `• Name: <b>${user.name}</b>\n` +
        `• Gender: <b>${genderIcon} ${user.gender}</b>\n` +
        `• Age Range: <b>${user.age}</b>\n` +
        `• Region: <b>${user.province}</b>\n` +
        `• Karma & Ethics: <b>⭐ ${user.karma || 100} pts</b>\n` +
        `• Balance: <b>🪙 ${(user.coins || 0).toLocaleString()} Coins</b> ${user.isVip ? '👑 VIP' : ''}\n` +
        `• Referrals: <b>${(user.referrals || []).length} Friends</b>`
      : `👤 <b>پروفایل شما در زنوسلایف:</b>\n\n` +
        `• نام: <b>${user.name}</b>\n` +
        `• جنسیت: <b>${genderIcon} ${user.gender === 'female' ? 'دختر' : 'پسر'}</b>\n` +
        `• رده سنی: <b>${user.age}</b>\n` +
        `• استان: <b>${user.province}</b>\n` +
        `• امتیاز کارما و اخلاق: <b>⭐ ${user.karma || 100} امتیاز</b>\n` +
        `• موجودی سکه: <b>🪙 ${(user.coins || 0).toLocaleString()} سکه</b> ${user.isVip ? '👑 VIP' : ''}\n` +
        `• تعداد دعوت‌ها: <b>${(user.referrals || []).length} نفر</b>`;

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: profText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: isEn ? '✏️ Edit Profile' : '✏️ ویرایش پروفایل', callback_data: 'edit_profile' }]]
      }
    });
  }

  if (text === '🌟 ورود به دنیای زنوسلایف (Mini App)' || text === '🌟 Open ZenOsLife (Mini App)') {
    const isEn = usersDb[userId]?.lang === 'en';
    const miniappText = isEn
      ? '🚀 <b>ZenOsLife Mini App Universe:</b>\nTap the button below to launch the full Life-OS experience (Mindfulness, My Day, AI Mentor, Tarot & Arcade):'
      : '🚀 <b>دنیای جامع زنوسلایف:</b>\nبرای استفاده از ذهن‌آگاهی، مراقبه ۴۳۲Hz، برنامه‌ریزی، فال تاروت و چت‌روم‌ها دکمه زیر را لمس کنید:';

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: miniappText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: isEn ? '🌟 Launch Mini App' : '🌟 ورود به مینی‌اپلیکیشن', web_app: { url: CONFIG.WEBAPP_URL } }]]
      }
    });
  }

  // Admin Broadcast
  if (text.startsWith('/broadcast') && CONFIG.ADMIN_IDS.includes(userId)) {
    const broadcastText = text.replace('/broadcast', '').trim();
    if (!broadcastText) return callTgApi('sendMessage', { chat_id: chatId, text: 'Usage: /broadcast <message>' });
    const allUsers = Object.keys(usersDb);
    let sent = 0;
    for (const uid of allUsers) {
      callTgApi('sendMessage', { chat_id: uid, text: `📢 <b>اطلاعیه رسمی زنوسلایف:</b>\n\n${broadcastText}`, parse_mode: 'HTML' })
        .then(() => sent++)
        .catch(() => {});
    }
    return callTgApi('sendMessage', { chat_id: chatId, text: `✅ ارسال همگانی به ${allUsers.length} کاربر آغاز شد.` });
  }

  // Fallback -> Dashboard
  return sendMainDashboard(chatId, userId);
}

// ----------------------------------------------------
// 10. CALLBACK QUERY HANDLER
// ----------------------------------------------------
async function handleCallbackQuery(cq) {
  const chatId = cq.message.chat.id;
  const userId = String(cq.from.id);
  const data = cq.data;
  callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});

  // Language selection
  if (data.startsWith('set_lang_')) {
    const lang = data.replace('set_lang_', '');
    let reg = registrationSteps.get(userId);
    if (!reg) reg = { tempProfile: { userId, coins: 1000, karma: 100, referrals: [] } };
    reg.tempProfile.lang = lang;
    reg.tempProfile.name = cq.from.first_name || (lang === 'en' ? 'Zen Member' : 'کاربر زنوسلایف');
    reg.step = 'gender';
    registrationSteps.set(userId, reg);

    if (usersDb[userId]) {
      usersDb[userId].lang = lang;
      saveDb();
      return sendMainDashboard(chatId, userId);
    }
    return promptGenderSelection(chatId, userId);
  }

  // Gender selection
  if (data.startsWith('reg_gender_')) {
    const gender = data.replace('reg_gender_', '');
    const reg = registrationSteps.get(userId);
    if (!reg) return startLanguageChoice(chatId, userId);
    reg.tempProfile.gender = gender;
    reg.step = 'age';

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

  // Age selection
  if (data.startsWith('reg_age_')) {
    const age = data.replace('reg_age_', '');
    const reg = registrationSteps.get(userId);
    if (!reg) return startLanguageChoice(chatId, userId);
    reg.tempProfile.age = age;
    reg.step = 'province';

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

  // Province selection & completion
  if (data.startsWith('reg_prov_')) {
    const prov = data.replace('reg_prov_', '');
    const reg = registrationSteps.get(userId);
    if (!reg) return startLanguageChoice(chatId, userId);

    reg.tempProfile.province = prov;
    reg.tempProfile.profileCompleted = true;
    usersDb[userId] = reg.tempProfile;
    saveDb();
    registrationSteps.delete(userId);

    // Referral Bounty
    if (reg.tempProfile.invitedBy && usersDb[reg.tempProfile.invitedBy]) {
      const refUser = usersDb[reg.tempProfile.invitedBy];
      refUser.referrals.push(userId);
      refUser.coins = (refUser.coins || 0) + 1000;
      saveDb();

      callTgApi('sendMessage', {
        chat_id: reg.tempProfile.invitedBy,
        text: usersDb[reg.tempProfile.invitedBy]?.lang === 'en'
          ? '🎉 <b>Congratulations! A friend registered with your invite link!</b>\n🪙 <b>1,000 Bonus Coins</b> added to your balance!'
          : '🎉 <b>تبریک! دوست جدیدی با لینک شما ثبت‌نام کرد!</b>\n🪙 <b>۱,۰۰۰ سکه هدیه</b> به کیف پول شما اضافه شد!',
        parse_mode: 'HTML'
      }).catch(() => {});
    }

    return sendMainDashboard(chatId, userId, t(userId, 'regDone'));
  }

  // Karma Rating Action
  if (data.startsWith('karma_5_')) {
    const targetUserId = data.replace('karma_5_', '');
    if (usersDb[targetUserId]) {
      usersDb[targetUserId].karma = (usersDb[targetUserId].karma || 100) + 5;
      saveDb();
    }
    return callTgApi('sendMessage', { chat_id: chatId, text: t(userId, 'karmaThanks') });
  }

  // Filter Match Triggers
  if (data === 'filter_random') return executeMatchSearch(chatId, userId, 'random');
  if (data === 'filter_samelang') return executeMatchSearch(chatId, userId, 'samelang');
  if (data === 'filter_global') return executeMatchSearch(chatId, userId, 'global');
  if (data === 'filter_female') return executeMatchSearch(chatId, userId, 'female');
  if (data === 'filter_male') return executeMatchSearch(chatId, userId, 'male');
  if (data === 'filter_province') return executeMatchSearch(chatId, userId, 'province');
  if (data === 'buy_stars') return sendBuyStarsMenu(chatId, userId);
  if (data === 'show_referral') return sendReferralHub(chatId, userId);
  if (data === 'edit_profile') return startLanguageChoice(chatId, userId);
  if (data === 'game_duel_dice') return startDiceDuel(chatId, userId);

  // Stars Package Invoices
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
        payload: JSON.stringify({ userId, pkgType, coins: pkg.coins, isVip: !!pkg.isVip }),
        currency: 'XTR',
        prices: [{ label: pkg.title, amount: pkg.priceStars }]
      });
    }
  }
}

// ----------------------------------------------------
// 11. STARS PRE-CHECKOUT & PAYMENT CONFIRMATION
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
    if (usersDb[userId]) {
      if (payload.coins) usersDb[userId].coins = (usersDb[userId].coins || 0) + payload.coins;
      if (payload.isVip) usersDb[userId].isVip = true;
      saveDb();

      // Give 10% commission to referrer if exists
      if (usersDb[userId].invitedBy && usersDb[usersDb[userId].invitedBy]) {
        const refId = usersDb[userId].invitedBy;
        const commissionCoins = Math.round((payload.coins || 0) * 0.1);
        usersDb[refId].coins = (usersDb[refId].coins || 0) + commissionCoins;
        saveDb();
        callTgApi('sendMessage', {
          chat_id: refId,
          text: `🎁 <b>پاداش پورسانت رفرال!</b>\n\nدوست شما یک بسته ستاره خریداری کرد و <b>${commissionCoins.toLocaleString()} سکه هدیه (۱۰٪)</b> به حساب شما واریز شد!`,
          parse_mode: 'HTML'
        }).catch(() => {});
      }
    }
  } catch (_) {}

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: usersDb[userId]?.lang === 'en'
      ? '✅ <b>Payment with Telegram Stars Completed Successfully!</b>\nCoins & VIP Pass added to your account.'
      : '✅ <b>پرداخت با ستاره‌های تلگرام با موفقیت انجام شد!</b>\nسکه و اشتراک VIP به حساب شما اضافه شد.',
    parse_mode: 'HTML',
    reply_markup: getMainReplyKeyboard(userId)
  });
}

let cachedBotInfo = null;
async function getBotInfo() {
  if (!cachedBotInfo) cachedBotInfo = await callTgApi('getMe');
  return cachedBotInfo;
}

// Long Polling Loop
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
console.log('🚀 ZenOsLife #1 Ultimate Dating, Games & Stars Engine Starting...');
initBotSettings().then(() => {
  pollUpdates();
  console.log('✨ Bot is online with Bilingual Support, Social Karma, Global Chat & Games!');
}).catch(err => {
  console.error('Fatal error starting bot:', err);
});
