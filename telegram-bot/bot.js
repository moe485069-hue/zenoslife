/**
 * ZenOsLife - Ultimate Dating, Anonymous Chat & Gaming Telegram Bot Engine
 * Features:
 * 1. Step-by-Step Onboarding (Name, Gender 👨/👩, Age, Province)
 * 2. Smart Matchmaking with Gender & Province Filters (Dating Model)
 * 3. In-Bot Anonymous Chat with Voice, Photo, Sticker relay & Info Badges
 * 4. Coin & Stars Monetization (Paid Filters, VIP Pass, Telegram Stars Invoices)
 * 5. Arcade Games Direct Access (Hokm, Backgammon, Pasur, Ludo, Billiards)
 * 6. Viral 1-Tap Share Referral Loop (1,000 Coins + 10% Lifetime Cut)
 * 7. Gateway to the ZenOsLife Mini App Universe
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE',
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
// MATCHMAKING QUEUES & ACTIVE CHATS
// ----------------------------------------------------
// waitingQueue: Array of objects { userId, filterGender: 'any'|'female'|'male', province: string }
const waitingQueue = [];
// activePairs: Map of userId -> partnerUserId
const activePairs = new Map();
// registrationSteps: Map of userId -> { step: 'name'|'gender'|'age'|'province', tempProfile: {} }
const registrationSteps = new Map();

// Helper: Telegram API Client
function callTgApi(method, payload = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${CONFIG.BOT_TOKEN}/${method}`,
      method: 'POST',
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
    await callTgApi('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: '🎮 بازی‌ها و چت‌روم‌ها | Mini App',
        web_app: { url: CONFIG.WEBAPP_URL }
      }
    });

    await callTgApi('setMyCommands', {
      commands: [
        { command: 'start', description: '🚀 منوی اصلی و پروفایل' },
        { command: 'chat', description: '🙈 شروع چت ناشناس' },
        { command: 'next', description: '⏭️ هم‌صحبت بعدی' },
        { command: 'stop', description: '🛑 پایان گفتگو' },
        { command: 'games', description: '🎮 آرکید بازی‌ها (حکم، تخته‌نرد و...)' },
        { command: 'buy', description: '⭐ خرید ستاره و شارژ سکه' },
        { command: 'ref', description: '👥 لینک دعوت و درآمدزایی' }
      ]
    });

    console.log('✅ Bot Settings initialized successfully!');
  } catch (e) {
    console.warn('Notice during bot init:', e.message);
  }
}

// ----------------------------------------------------
// 1. ONBOARDING & PROFILE SETUP
// ----------------------------------------------------
async function startRegistration(chatId, userId, startParam = '') {
  registrationSteps.set(userId, {
    step: 'gender',
    tempProfile: {
      userId,
      invitedBy: startParam.startsWith('ref_') ? startParam.replace('ref_', '') : null,
      coins: 1000,
      referrals: [],
      lastWheelSpin: 0,
      createdAt: Date.now()
    }
  });

  const promptText = '👋 <b>به ربات چت ناشناس و بازی‌های زنوسلایف خوش آمدید!</b>\n\n' +
    '✨ برای اتصال به هم‌صحبت‌ها و شروع بازی، لطفاً ابتدا <b>جنسیت</b> خود را مشخص کنید:';

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '👨 پسرم', callback_data: 'reg_gender_male' },
        { text: '👩 دخترم', callback_data: 'reg_gender_female' }
      ]
    ]
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: promptText,
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  });
}

// ----------------------------------------------------
// 2. MAIN BOT KEYBOARD (REPLY KEYBOARD)
// ----------------------------------------------------
function getMainReplyKeyboard() {
  return {
    keyboard: [
      [{ text: '🙈 به یه ناشناس وصلم کن!' }],
      [{ text: '🛰️ افراد نزدیک (همشهری)' }, { text: '💬 جستجو کاربران (دختر/پسر)' }],
      [{ text: '🎮 آرکید بازی‌ها و شرط‌بندی' }, { text: '🪙 موجودی سکه و VIP' }],
      [{ text: '👤 پروفایل من' }, { text: '🔗 معرفی به دوستان (سکه رایگان)' }],
      [{ text: '🌟 ورود به فضای جامع زنوسلایف (Mini App)' }]
    ],
    resize_keyboard: true
  };
}

async function sendMainDashboard(chatId, userId, alertMsg = '') {
  const user = usersDb[userId];
  if (!user || !user.profileCompleted) {
    return startRegistration(chatId, userId);
  }

  const genderIcon = user.gender === 'female' ? '👩' : '👨';
  const genderFa = user.gender === 'female' ? 'خانم' : 'آقا';

  const dashboardText = (alertMsg ? `${alertMsg}\n\n` : '') +
    `👑 <b>پایگاه چت ناشناس و بازی‌های آنلاین</b>\n\n` +
    `👤 <b>پروفایل شما:</b> ${genderIcon} ${user.name} (${user.age} ساله از ${user.province})\n` +
    `🪙 <b>موجودی سکه:</b> <b>${(user.coins || 0).toLocaleString()}</b> سکه ${user.isVip ? '👑 VIP طلایی' : ''}\n` +
    `👥 <b>تعداد دعوت‌ها:</b> ${(user.referrals || []).length} نفر\n\n` +
    `👇 یکی از گزینه‌ها را برای شروع گفتگو یا بازی انتخاب کنید:`;

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: dashboardText,
    parse_mode: 'HTML',
    reply_markup: getMainReplyKeyboard()
  });
}

// ----------------------------------------------------
// 3. FILTER MENU (به کی وصل بشم؟)
// ----------------------------------------------------
async function sendFilterMenu(chatId, userId) {
  const user = usersDb[userId];
  if (!user || !user.profileCompleted) return startRegistration(chatId, userId);

  const menuText = '🙈 <b>به کی وصل بشم؟ انتخاب کن:</b> 👇\n\n' +
    '🎲 <b>جستجوی شانسی:</b> کاملاً رایگان (اتصال سریع)\n' +
    '👩 <b>جستجوی دختر:</b> ۵۰ سکه (یا VIP)\n' +
    '👨 <b>جستجوی پسر:</b> ۵۰ سکه (یا VIP)\n' +
    '🛰️ <b>جستجوی همشهری:</b> ۳۰ سکه (افراد استان خودت)';

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🎲 جستجوی شانسی (رایگان)', callback_data: 'filter_random' }
      ],
      [
        { text: '👩 جستجوی دختر (۵۰ سکه)', callback_data: 'filter_female' },
        { text: '👨 جستجوی پسر (۵۰ سکه)', callback_data: 'filter_male' }
      ],
      [
        { text: '🛰️ جستجوی اطراف و همشهری (۳۰ سکه)', callback_data: 'filter_province' }
      ],
      [
        { text: '🎮 ورود به چت‌روم‌ها و بازی آنلاین', web_app: { url: `${CONFIG.WEBAPP_URL}#/chat` } }
      ]
    ]
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: menuText,
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

  if (cost > 0 && !user.isVip) {
    if ((user.coins || 0) < cost) {
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: `⚠️ <b>موجودی سکه شما کافی نیست!</b>\n\nبرای جستجوی فیلتردار نیاز به <b>${cost} سکه</b> دارید.\nموجودی فعلی شما: <b>${(user.coins || 0).toLocaleString()}</b> سکه\n\nمی‌توانید با دعوت دوستان ۱,۰۰۰ سکه رایگان بگیرید یا اشتراک VIP تهیه کنید:`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⭐ خرید سکه با ستاره تلگرام', callback_data: 'buy_stars' }],
            [{ text: '🎲 جستجوی شانسی رایگان', callback_data: 'filter_random' }],
            [{ text: '👥 دریافت سکه رایگان با دعوت', callback_data: 'show_referral' }]
          ]
        }
      });
    }
  }

  // Deduct coins if required
  if (cost > 0 && !user.isVip) {
    user.coins -= cost;
    saveDb();
  }

  // Find match in queue
  let matchedPartnerId = null;
  for (let i = 0; i < waitingQueue.length; i++) {
    const candidate = waitingQueue[i];
    if (candidate.userId === userId) continue;

    const candidateUser = usersDb[candidate.userId];
    if (!candidateUser) continue;

    // Check compatibility
    let isMatch = true;

    // My filter
    if (filterType === 'female' && candidateUser.gender !== 'female') isMatch = false;
    if (filterType === 'male' && candidateUser.gender !== 'male') isMatch = false;
    if (filterType === 'province' && candidateUser.province !== user.province) isMatch = false;

    // Candidate's filter
    if (candidate.filterType === 'female' && user.gender !== 'female') isMatch = false;
    if (candidate.filterType === 'male' && user.gender !== 'male') isMatch = false;
    if (candidate.filterType === 'province' && candidate.province !== user.province) isMatch = false;

    if (isMatch) {
      matchedPartnerId = candidate.userId;
      waitingQueue.splice(i, 1);
      break;
    }
  }

  // If matched
  if (matchedPartnerId) {
    activePairs.set(userId, matchedPartnerId);
    activePairs.set(matchedPartnerId, userId);

    const partnerUser = usersDb[matchedPartnerId];

    const inChatKeyboard = {
      keyboard: [
        [{ text: '⏭️ هم‌صحبت بعدی' }, { text: '🛑 پایان گفتگو' }],
        [{ text: '💖 ارسال آیدی تلگرام' }, { text: '🎮 دعوت به بازی دونفره' }]
      ],
      resize_keyboard: true
    };

    const userBadge = `${user.gender === 'female' ? '👩 دختر' : '👨 پسر'}، ${user.age} ساله از ${user.province}`;
    const partnerBadge = `${partnerUser.gender === 'female' ? '👩 دختر' : '👨 پسر'}، ${partnerUser.age} ساله از ${partnerUser.province}`;

    callTgApi('sendMessage', {
      chat_id: userId,
      text: `🎉 <b>هم‌صحبت پیدا شد!</b>\n\n🎭 <b>مشخصات طرف مقابل:</b> ${partnerBadge}\n\n💬 می‌توانید پیام متنی، ویس، عکس یا استیکر بفرستید.`,
      parse_mode: 'HTML',
      reply_markup: inChatKeyboard
    }).catch(() => {});

    callTgApi('sendMessage', {
      chat_id: matchedPartnerId,
      text: `🎉 <b>هم‌صحبت پیدا شد!</b>\n\n🎭 <b>مشخصات طرف مقابل:</b> ${userBadge}\n\n💬 می‌توانید پیام متنی، ویس، عکس یا استیکر بفرستید.`,
      parse_mode: 'HTML',
      reply_markup: inChatKeyboard
    }).catch(() => {});

    return;
  }

  // Add to queue
  waitingQueue.push({ userId, filterType, province: user.province });

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: '🔍 <b>در حال جستجوی هم‌صحبت با مشخصات درخواستی...</b>\n\n⏳ لطفاً چند لحظه صبر کنید تا کاربر مناسب به شما متصل شود.',
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [[{ text: '🛑 لغو جستجو' }, { text: '🏠 بازگشت به منوی اصلی' }]],
      resize_keyboard: true
    }
  });
}

// ----------------------------------------------------
// 5. IN-CHAT RELAY & ACTIONS
// ----------------------------------------------------
async function stopChat(chatId, userId) {
  const qIdx = waitingQueue.findIndex(w => w.userId === userId);
  if (qIdx > -1) {
    waitingQueue.splice(qIdx, 1);
    return sendMainDashboard(chatId, userId, '✅ جستجو لغو شد.');
  }

  if (activePairs.has(userId)) {
    const partnerId = activePairs.get(userId);
    activePairs.delete(userId);
    activePairs.delete(partnerId);

    sendMainDashboard(partnerId, partnerId, '🛑 <b>هم‌صحبت شما چت را ترک کرد.</b>');
    return sendMainDashboard(chatId, userId, '🛑 <b>مکالمه پایان یافت.</b>');
  }

  return sendMainDashboard(chatId, userId);
}

async function nextPartner(chatId, userId) {
  if (activePairs.has(userId)) {
    const partnerId = activePairs.get(userId);
    activePairs.delete(userId);
    activePairs.delete(partnerId);
    sendMainDashboard(partnerId, partnerId, '🛑 <b>هم‌صحبت شما به سراغ فرد دیگری رفت.</b>');
  }
  return executeMatchSearch(chatId, userId, 'random');
}

async function shareContact(chatId, userId, msg) {
  if (!activePairs.has(userId)) return;
  const partnerId = activePairs.get(userId);
  const username = msg.from.username;
  const user = usersDb[userId];

  if (!username) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '⚠️ اکانت تلگرام شما آیدی (Username) ندارد. لطفاً در تنظیمات تلگرام خود آیدی ست کنید تا بتوانید آن را به اشتراک بگذارید.'
    });
  }

  callTgApi('sendMessage', {
    chat_id: partnerId,
    text: `💖 <b>هم‌صحبت شما آیدی تلگرام خود را با شما به اشتراک گذاشت:</b>\n\n👤 نام: <b>${user?.name || 'کاربر'}</b>\n🆔 آیدی تلگرام: @${username}`,
    parse_mode: 'HTML'
  }).catch(() => {});

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: `✅ آیدی شما (@${username}) با موفقیت برای هم‌صحبت ارسال شد.`
  });
}

async function relayMessage(msg, partnerId) {
  const senderUser = usersDb[String(msg.from.id)];
  const prefix = senderUser?.gender === 'female' ? '👩' : '👨';

  if (msg.text) {
    return callTgApi('sendMessage', {
      chat_id: partnerId,
      text: `${prefix} <b>هم‌صحبت:</b>\n${msg.text}`,
      parse_mode: 'HTML'
    });
  }
  if (msg.voice) {
    return callTgApi('sendVoice', {
      chat_id: partnerId,
      voice: msg.voice.file_id,
      caption: `${prefix} ویس از هم‌صحبت`
    });
  }
  if (msg.photo && msg.photo.length > 0) {
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    return callTgApi('sendPhoto', {
      chat_id: partnerId,
      photo: photoId,
      caption: msg.caption ? `${prefix} <b>هم‌صحبت:</b>\n${msg.caption}` : `${prefix} عکس از هم‌صحبت`,
      parse_mode: 'HTML'
    });
  }
  if (msg.sticker) {
    return callTgApi('sendSticker', {
      chat_id: partnerId,
      sticker: msg.sticker.file_id
    });
  }
}

// ----------------------------------------------------
// 6. GAMES & STARS MENUS
// ----------------------------------------------------
function sendGamesMenu(chatId) {
  const text = '🎮 <b>آرکید بازی‌های آنلاین و مسابقات دورهمی</b>\n\n' +
    'بازی مورد نظر خود را انتخاب کنید و با حریفان آنلاین یا دوستانتان مسابقه دهید:';

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '👑 بازی حکم ۴ نفره آنلاین', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/hokm` } }
      ],
      [
        { text: '🎲 تخته نرد ایرانی', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/backgammon` } },
        { text: '🃏 پاستور (چهاربرگ)', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/pasur` } }
      ],
      [
        { text: '🎯 منچ ۴ نفره کلاسیک', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/ludo` } },
        { text: '🎱 بیلیارد ۸-توپی', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/billiards` } }
      ],
      [
        { text: '🏆 ورود به لابی مسابقات و تورنمنت‌ها', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }
      ]
    ]
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  });
}

function sendBuyStarsMenu(chatId) {
  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: '⭐ <b>فروشگاه ستاره‌های تلگرام (Telegram Stars Shop)</b>\n\n' +
      'سکه و اشتراک VIP را مستقیماً با **Telegram Stars** شارژ کنید و بدون محدودیت جنسیت و شهر چت کنید!',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🪙 ۱,۰۰۰ سکه (۳۵ ستاره ⭐)', callback_data: 'buy_pkg_bronze' }],
        [{ text: '💰 ۵,۰۰۰ سکه + هدیه (۱۵۰ ستاره ⭐)', callback_data: 'buy_pkg_silver' }],
        [{ text: '👑 ۲۰,۰۰۰ سکه + هدیه (۵۰۰ ستاره ⭐)', callback_data: 'buy_pkg_gold' }],
        [{ text: '💎 ۵۰,۰۰۰ سکه + اشتراک VIP (۱,۰۰۰ ستاره ⭐)', callback_data: 'buy_pkg_vip' }],
        [{ text: '🌟 باز کردن فروشگاه داخل برنامه', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }]
      ]
    }
  });
}

async function sendReferralHub(chatId, userId) {
  const botInfo = await getBotInfo();
  const refLink = `https://t.me/${botInfo.username}?start=ref_${userId}`;
  const shareText = encodeURIComponent(`🙈 بیا با هم چت ناشناس بکنیم و حکم و تخته‌نرد بزنیم!\n۱,۰۰۰ سکه هدیه رایگان بگیر 🎁👇\n${refLink}`);
  const user = usersDb[userId] || { referrals: [] };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: `👥 <b>سیستم دعوت و درآمدزایی خودکار</b>\n\n` +
      `🔗 <b>لینک اختصاصی شما:</b>\n<code>${refLink}</code>\n\n` +
      `🎁 <b>پاداش شما:</b>\n` +
      `• <b>۱,۰۰۰ سکه هدیه</b> به ازای ورود هر دوست\n` +
      `• <b>۱۰٪ از تمام خریدهای آینده دوست شما</b> به صورت مادام‌العمر!\n\n` +
      `👥 تعداد زیرمجموعه‌های شما: <b>${(user.referrals || []).length} نفر</b>`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 ارسال فوری برای دوستان و گروه‌ها', url: `https://t.me/share/url?url=${refLink}&text=${shareText}` }]
      ]
    }
  });
}

// ----------------------------------------------------
// 7. MESSAGE & CALLBACK DISPATCHER
// ----------------------------------------------------
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const text = msg.text || '';

  // Check if in active anonymous chat
  if (activePairs.has(userId)) {
    if (text === '🛑 پایان گفتگو' || text === '/stop') {
      return stopChat(chatId, userId);
    }
    if (text === '⏭️ هم‌صحبت بعدی' || text === '/next') {
      return nextPartner(chatId, userId);
    }
    if (text === '💖 ارسال آیدی تلگرام') {
      return shareContact(chatId, userId, msg);
    }
    if (text === '🎮 دعوت به بازی دونفره') {
      const partnerId = activePairs.get(userId);
      callTgApi('sendMessage', {
        chat_id: partnerId,
        text: '🎮 <b>هم‌صحبت شما را به بازی آنلاین دعوت کرد!</b>\nبرای ورود روی دکمه زیر بزنید:',
        reply_markup: {
          inline_keyboard: [[{ text: '🎲 ورود به میز بازی', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }]]
        }
      });
      return callTgApi('sendMessage', { chat_id: chatId, text: '✅ دعوت‌نامه بازی برای هم‌صحبت ارسال شد.' });
    }
    // Relay message
    const partnerId = activePairs.get(userId);
    return relayMessage(msg, partnerId);
  }

  // Check if in waiting queue
  if (waitingQueue.some(w => w.userId === userId)) {
    if (text === '🛑 لغو جستجو' || text === '🏠 بازگشت به منوی اصلی' || text === '/stop') {
      return stopChat(chatId, userId);
    }
  }

  // Registration step handler for custom name
  if (registrationSteps.has(userId)) {
    const reg = registrationSteps.get(userId);
    if (reg.step === 'name' && text) {
      reg.tempProfile.name = text.slice(0, 25);
      reg.step = 'gender';
      return callTgApi('sendMessage', {
        chat_id: chatId,
        text: `سلام ${reg.tempProfile.name}! لطفاً جنسیت خود را انتخاب کنید:`,
        reply_markup: {
          inline_keyboard: [
            [{ text: '👨 پسرم', callback_data: 'reg_gender_male' }, { text: '👩 دخترم', callback_data: 'reg_gender_female' }]
          ]
        }
      });
    }
  }

  // Main Commands
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const startParam = parts[1] || '';
    const user = usersDb[userId];
    if (!user || !user.profileCompleted) {
      return startRegistration(chatId, userId, startParam);
    }
    return sendMainDashboard(chatId, userId);
  }

  if (text === '🙈 به یه ناشناس وصلم کن!' || text === '/chat' || text === '💬 جستجو کاربران (دختر/پسر)') {
    return sendFilterMenu(chatId, userId);
  }

  if (text === '🛰️ افراد نزدیک (همشهری)') {
    return executeMatchSearch(chatId, userId, 'province');
  }

  if (text === '🎮 آرکید بازی‌ها و شرط‌بندی' || text === '/games') {
    return sendGamesMenu(chatId);
  }

  if (text === '🪙 موجودی سکه و VIP' || text === '/buy') {
    return sendBuyStarsMenu(chatId);
  }

  if (text === '🔗 معرفی به دوستان (سکه رایگان)' || text === '/ref') {
    return sendReferralHub(chatId, userId);
  }

  if (text === '👤 پروفایل من') {
    const user = usersDb[userId];
    if (!user) return startRegistration(chatId, userId);
    const genderIcon = user.gender === 'female' ? '👩' : '👨';
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `👤 <b>پروفایل شما در زنوسلایف:</b>\n\n` +
        `• نام: <b>${user.name}</b>\n` +
        `• جنسیت: <b>${genderIcon} ${user.gender === 'female' ? 'دختر' : 'پسر'}</b>\n` +
        `• رده سنی: <b>${user.age}</b>\n` +
        `• استان: <b>${user.province}</b>\n` +
        `• موجودی: <b>${(user.coins || 0).toLocaleString()} سکه</b> ${user.isVip ? '👑 VIP' : ''}\n` +
        `• دعوت‌ها: <b>${(user.referrals || []).length} نفر</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '✏️ ویرایش پروفایل', callback_data: 'edit_profile' }]]
      }
    });
  }

  if (text === '🌟 ورود به فضای جامع زنوسلایف (Mini App)') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🚀 <b>ورود به فضای جامع زنوسلایف:</b>\nبرای استفاده از ذهن‌آگاهی، مراقبه، برنامه‌ریزی، فال تاروت و چت‌روم‌ها دکمه زیر را لمس کنید:',
      reply_markup: {
        inline_keyboard: [[{ text: '🌟 ورود به زنوسلایف | Mini App', web_app: { url: CONFIG.WEBAPP_URL } }]]
      }
    });
  }

  // Fallback
  return sendMainDashboard(chatId, userId);
}

// ----------------------------------------------------
// 8. CALLBACK QUERY HANDLER
// ----------------------------------------------------
async function handleCallbackQuery(cq) {
  const chatId = cq.message.chat.id;
  const userId = String(cq.from.id);
  const data = cq.data;
  callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});

  // Registration Steps
  if (data.startsWith('reg_gender_')) {
    const gender = data.replace('reg_gender_', '');
    const reg = registrationSteps.get(userId) || { tempProfile: { userId, coins: 1000, referrals: [] } };
    reg.tempProfile.gender = gender;
    reg.tempProfile.name = cq.from.first_name || 'کاربر زنوسلایف';
    reg.step = 'age';
    registrationSteps.set(userId, reg);

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🎂 لطفاً <b>رده سنی</b> خود را انتخاب کنید:',
      reply_markup: {
        inline_keyboard: [
          [{ text: '۱۸ تا ۲۱ سال', callback_data: 'reg_age_18-21' }, { text: '۲۲ تا ۲۶ سال', callback_data: 'reg_age_22-26' }],
          [{ text: '۲۷ تا ۳۴ سال', callback_data: 'reg_age_27-34' }, { text: '۳۵ سال به بالا', callback_data: 'reg_age_35+' }]
        ]
      }
    });
  }

  if (data.startsWith('reg_age_')) {
    const age = data.replace('reg_age_', '');
    const reg = registrationSteps.get(userId);
    if (!reg) return startRegistration(chatId, userId);
    reg.tempProfile.age = age;
    reg.step = 'province';

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '📍 لطفاً <b>استان سکونت</b> خود را انتخاب کنید:',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'تهران / البرز', callback_data: 'reg_prov_تهران' }, { text: 'اصفهان / یزد', callback_data: 'reg_prov_اصفهان' }],
          [{ text: 'خراسان / مشهد', callback_data: 'reg_prov_مشهد' }, { text: 'فارس / شیراز', callback_data: 'reg_prov_شیراز' }],
          [{ text: 'آذربایجان / تبریز', callback_data: 'reg_prov_تبریز' }, { text: 'خوزستان / اهواز', callback_data: 'reg_prov_خوزستان' }],
          [{ text: 'مازندران / گیلان', callback_data: 'reg_prov_شمال' }, { text: 'سایر استان‌ها', callback_data: 'reg_prov_سایر' }]
        ]
      }
    });
  }

  if (data.startsWith('reg_prov_')) {
    const prov = data.replace('reg_prov_', '');
    const reg = registrationSteps.get(userId);
    if (!reg) return startRegistration(chatId, userId);
    reg.tempProfile.province = prov;
    reg.tempProfile.profileCompleted = true;

    usersDb[userId] = reg.tempProfile;
    saveDb();
    registrationSteps.delete(userId);

    // If invited by someone, reward both
    if (reg.tempProfile.invitedBy && usersDb[reg.tempProfile.invitedBy]) {
      const refUser = usersDb[reg.tempProfile.invitedBy];
      refUser.referrals.push(userId);
      refUser.coins = (refUser.coins || 0) + 1000;
      saveDb();

      callTgApi('sendMessage', {
        chat_id: reg.tempProfile.invitedBy,
        text: `🎉 <b>تبریک! دوست جدیدی با لینک شما ثبت‌نام کرد!</b>\n🪙 <b>۱,۰۰۰ سکه هدیه</b> به کیف پول شما اضافه شد!`,
        parse_mode: 'HTML'
      }).catch(() => {});
    }

    return sendMainDashboard(chatId, userId, '🎉 <b>تبریک! پروفایل شما ساخته شد و ۱,۰۰۰ سکه هدیه گرفتید! 🪙</b>');
  }

  if (data === 'edit_profile') {
    return startRegistration(chatId, userId);
  }

  // Filter Match Triggers
  if (data === 'filter_random') return executeMatchSearch(chatId, userId, 'random');
  if (data === 'filter_female') return executeMatchSearch(chatId, userId, 'female');
  if (data === 'filter_male') return executeMatchSearch(chatId, userId, 'male');
  if (data === 'filter_province') return executeMatchSearch(chatId, userId, 'province');
  if (data === 'buy_stars') return sendBuyStarsMenu(chatId);
  if (data === 'show_referral') return sendReferralHub(chatId, userId);

  // Stars Package Invoices
  if (data.startsWith('buy_pkg_')) {
    const pkgType = data.replace('buy_pkg_', '');
    const packages = {
      'bronze': { title: '🪙 ۱,۰۰۰ سکه زنوسلایف', priceStars: 35, coins: 1000 },
      'silver': { title: '💰 ۵,۰۰۰ سکه + ۵۰۰ هدیه', priceStars: 150, coins: 5500 },
      'gold': { title: '👑 ۲۰,۰۰۰ سکه + ۳,۰۰۰ هدیه', priceStars: 500, coins: 23000 },
      'vip': { title: '💎 ۵۰,۰۰۰ سکه + اشتراک VIP', priceStars: 1000, coins: 50000, isVip: true }
    };
    const pkg = packages[pkgType];
    if (pkg) {
      return callTgApi('sendInvoice', {
        chat_id: chatId,
        title: pkg.title,
        description: `شارژ فوری ${pkg.coins.toLocaleString()} سکه در اکانت زنوسلایف شما`,
        payload: JSON.stringify({ userId, pkgType, coins: pkg.coins, isVip: !!pkg.isVip }),
        currency: 'XTR',
        prices: [{ label: pkg.title, amount: pkg.priceStars }]
      });
    }
  }
}

// ----------------------------------------------------
// 9. STARS PRE-CHECKOUT & PAYMENT
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
    }
  } catch (_) {}

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: '✅ <b>پرداخت با ستاره‌های تلگرام با موفقیت انجام شد!</b>\nسکه و اشتراک VIP به اکانت شما اضافه شد.',
    parse_mode: 'HTML',
    reply_markup: getMainReplyKeyboard()
  });
}

let cachedBotInfo = null;
async function getBotInfo() {
  if (!cachedBotInfo) cachedBotInfo = await callTgApi('getMe');
  return cachedBotInfo;
}

// Polling loop
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
console.log('🚀 ZenOsLife Ultimate Dating & Gaming Bot Engine Starting...');
initBotSettings().then(() => {
  pollUpdates();
  console.log('✨ Bot is online with Profile Onboarding, Gender/City Filters, In-Bot Chat & Games!');
}).catch(err => {
  console.error('Fatal error starting bot:', err);
});
