/**
 * ZenOsLife Ecosystem & Anonymous Chat Telegram Bot Engine
 * Features:
 * 1. Multi-Pillar Ecosystem Menu:
 *    - 🎭 Anonymous Chat (چت ناشناس زنده دوطرفه داخل خود ربات تلگرام)
 *    - 💬 Live ChatRooms & Community (تالار گفتگو و دوستیابی)
 *    - 🌿 Mindfulness & 432Hz Meditation (ذهن‌آگاهی و چاکراها)
 *    - 📅 My Day & Productivity (امروز من و برنامه‌ریزی)
 *    - 🤖 AI Zen Mentor & Life Coach (مربی هوش مصنوعی)
 *    - 🔮 AI Tarot & Astrological Natal Chart (فال تاروت و چارت تولد)
 *    - 🎮 Royal Arcade Games (حکم، تخته‌نرد، پاستور، منچ، بیلیارد)
 * 2. In-Bot Anonymous Chat Engine:
 *    - Matchmaking Queue (صف انتظار هوشمند)
 *    - Real-time anonymous relay of Text, Voice, Photo, Sticker
 *    - Next Partner (⏭️ هم‌صحبت بعدی), Stop (🛑 پایان مکالمه), Share Profile (💖 اشتراک آیدی)
 * 3. Telegram Stars Invoices (XTR), Daily Wheel, Viral Referral Loop & Admin Broadcast
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

// Database state
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
// ANONYMOUS CHAT STATE & QUEUE
// ----------------------------------------------------
// waitingQueue: Array of userIds waiting for an anonymous partner
const waitingQueue = [];
// activePairs: Map of userId -> partnerUserId
const activePairs = new Map();

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
        text: '🌟 سیستم عامل زندگی | Mini App',
        web_app: { url: CONFIG.WEBAPP_URL }
      }
    });

    await callTgApi('setMyCommands', {
      commands: [
        { command: 'start', description: '🌟 منوی اصلی و معرفی زنوسلایف' },
        { command: 'chat', description: '🎭 شروع چت ناشناس تلگرامی' },
        { command: 'next', description: '⏭️ هم‌صحبت بعدی در چت ناشناس' },
        { command: 'stop', description: '🛑 پایان چت ناشناس' },
        { command: 'wheel', description: '🎁 گردونه شانس و پاداش روزانه' },
        { command: 'buy', description: '⭐ خرید ستاره تلگرام و سکه' },
        { command: 'ref', description: '👥 لینک دعوت و درآمدزایی' },
        { command: 'help', description: '❓ راهنما و بخش‌های اپلیکیشن' }
      ]
    });

    console.log('✅ Bot Settings & Commands initialized successfully!');
  } catch (e) {
    console.warn('Notice during bot init:', e.message);
  }
}

// ----------------------------------------------------
// ANONYMOUS CHAT ENGINE
// ----------------------------------------------------
async function startAnonymousSearch(chatId, userId) {
  // If already in a chat, notify user
  if (activePairs.has(userId)) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🎭 <b>شما هم‌اکنون در حال گفتگو با یک هم‌صحبت ناشناس هستید!</b>\n\nبرای خروج یا تغییر هم‌صحبت از دکمه‌های زیر استفاده کنید:',
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          [{ text: '⏭️ هم‌صحبت بعدی' }, { text: '🛑 پایان گفتگو' }],
          [{ text: '💖 ارسال آیدی تلگرام' }, { text: '🏠 بازگشت به منوی اصلی' }]
        ],
        resize_keyboard: true
      }
    });
  }

  // If already in queue
  if (waitingQueue.includes(userId)) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🔍 <b>در حال جستجوی هم‌صحبت ناشناس...</b>\nلطفاً صبور باشید، به محض پیدا شدن کاربر متصل خواهید شد.',
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: '🛑 لغو جستجو' }]],
        resize_keyboard: true
      }
    });
  }

  // Try to match with someone waiting
  if (waitingQueue.length > 0) {
    const partnerId = waitingQueue.shift();
    if (partnerId !== userId) {
      activePairs.set(userId, partnerId);
      activePairs.set(partnerId, userId);

      const connectedKeyboard = {
        keyboard: [
          [{ text: '⏭️ هم‌صحبت بعدی' }, { text: '🛑 پایان گفتگو' }],
          [{ text: '💖 ارسال آیدی تلگرام' }, { text: '🏠 منوی اصلی زنوسلایف' }]
        ],
        resize_keyboard: true
      };

      const matchMsg = '🎉 <b>هم‌صحبت ناشناس پیدا شد!</b>\n\n' +
        '💬 شما هم‌اکنون به یکدیگر متصل شدید. می‌توانید پیام متنی، ویس، استیکر یا عکس بفرستید.\n' +
        '🔒 هویت شما کاملاً ناشناس و مخفی است.\n\n' +
        '💡 <i>برای قطع مکالمه دکمه «🛑 پایان گفتگو» را بزنید.</i>';

      callTgApi('sendMessage', { chat_id: userId, text: matchMsg, parse_mode: 'HTML', reply_markup: connectedKeyboard }).catch(() => {});
      callTgApi('sendMessage', { chat_id: partnerId, text: matchMsg, parse_mode: 'HTML', reply_markup: connectedKeyboard }).catch(() => {});
      return;
    }
  }

  // Put in waiting queue
  waitingQueue.push(userId);
  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: '🔍 <b>در حال جستجوی هم‌فرکانس و هم‌صحبت ناشناس...</b>\n\n' +
      '⏳ لطفاً چند لحظه صبر کنید تا یک کاربر آنلاین به شما متصل شود.',
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [[{ text: '🛑 لغو جستجو' }, { text: '🏠 بازگشت به منو' }]],
      resize_keyboard: true
    }
  });
}

async function stopAnonymousChat(chatId, userId) {
  // Remove from queue if waiting
  const qIdx = waitingQueue.indexOf(userId);
  if (qIdx > -1) {
    waitingQueue.splice(qIdx, 1);
    return sendMainMenu(chatId, userId, '✅ جستجوی هم‌صحبت ناشناس لغو شد.');
  }

  // Disconnect active partner
  if (activePairs.has(userId)) {
    const partnerId = activePairs.get(userId);
    activePairs.delete(userId);
    activePairs.delete(partnerId);

    const endMsg = '🛑 <b>مکالمه پایان یافت.</b>\nهم‌صحبت شما چت را ترک کرد.';
    sendMainMenu(partnerId, partnerId, endMsg);
    return sendMainMenu(chatId, userId, '🛑 <b>شما مکالمه را پایان دادید.</b>');
  }

  return sendMainMenu(chatId, userId, 'شما در حال حاضر در چت ناشناس نیستید.');
}

async function nextAnonymousPartner(chatId, userId) {
  if (activePairs.has(userId)) {
    const partnerId = activePairs.get(userId);
    activePairs.delete(userId);
    activePairs.delete(partnerId);
    sendMainMenu(partnerId, partnerId, '🛑 <b>هم‌صحبت شما چت را ترک کرد و به سراغ فرد دیگری رفت.</b>');
  }
  return startAnonymousSearch(chatId, userId);
}

async function shareContactInAnonChat(chatId, userId, msg) {
  if (!activePairs.has(userId)) return;
  const partnerId = activePairs.get(userId);
  const username = msg.from.username;
  const firstName = msg.from.first_name || 'کاربر';

  if (!username) {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '⚠️ اکانت تلگرام شما آیدی (Username) ندارد. لطفاً در تنظیمات تلگرام خود آیدی ست کنید تا بتوانید آن را به اشتراک بگذارید.'
    });
  }

  callTgApi('sendMessage', {
    chat_id: partnerId,
    text: `💖 <b>هم‌صحبت شما آیدی تلگرام خود را با شما به اشتراک گذاشت:</b>\n\n👤 نام: <b>${firstName}</b>\n🆔 آیدی: @${username}`,
    parse_mode: 'HTML'
  }).catch(() => {});

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: `✅ آیدی شما (@${username}) با موفقیت برای هم‌صحبت ارسال شد.`
  });
}

// Relay message between anonymous pair
async function relayAnonMessage(msg, partnerId) {
  if (msg.text) {
    return callTgApi('sendMessage', {
      chat_id: partnerId,
      text: `🎭 <b>هم‌صحبت ناشناس:</b>\n${msg.text}`,
      parse_mode: 'HTML'
    });
  }
  if (msg.voice) {
    return callTgApi('sendVoice', {
      chat_id: partnerId,
      voice: msg.voice.file_id,
      caption: '🎭 ویس از هم‌صحبت ناشناس'
    });
  }
  if (msg.photo && msg.photo.length > 0) {
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    return callTgApi('sendPhoto', {
      chat_id: partnerId,
      photo: photoId,
      caption: msg.caption ? `🎭 <b>هم‌صحبت ناشناس:</b>\n${msg.caption}` : '🎭 عکس از هم‌صحبت ناشناس',
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
// MAIN MENU (HOLISTIC MULTI-PILLAR ZENOSLIFE)
// ----------------------------------------------------
async function sendMainMenu(chatId, userId, prefixText = '') {
  const user = usersDb[userId] || { coins: 1000, referrals: [] };
  const botInfo = await getBotInfo();
  const refLink = `https://t.me/${botInfo.username}?start=ref_${userId}`;
  const shareText = encodeURIComponent(`🌟 به سیستم عامل زندگی زنوسلایف بپیوندید!\nچت ناشناس، مراقبه، برنامه‌ریزی و بازی‌های آنلاین 🎁\n${refLink}`);

  const welcomeText = (prefixText ? `${prefixText}\n\n` : '') +
    `👑 <b>سیستم عامل جامع زندگی | ZenOsLife</b> ✨\n\n` +
    `یک اکوسیستم کامل و همه‌جانبه برای رشد فردی، آرامش ذهن، ارتباطات و سرگرمی:\n\n` +
    `🎭 <b>ارتباطات و گفتگو:</b>\n` +
    `• چت ناشناس داخل تلگرام و تالارهای زنده\n` +
    `• دوستیابی هم‌فرکانس و چت صوتی بلادرنگ\n\n` +
    `🌿 <b>آرامش و ذهن‌آگاهی:</b>\n` +
    `• مراقبه‌های هدایت‌شده، فرکانس‌های ۴۳۲Hz و چاکراها\n\n` +
    `📅 <b>بهره‌وری و برنامه‌ریزی:</b>\n` +
    `• بخش «امروز من»، ردیاب عادات، تسک‌ها و تایمر پومودورو\n\n` +
    `🤖 <b>هوش مصنوعی و حکمت:</b>\n` +
    `• مربی خردمند ذن و تحلیلگر مسیر رشد\n` +
    `• فال تاروت تعاملی و چارت تولد کیهانی 🔮\n\n` +
    `🎮 <b>آرکید بازی‌های شاهانه:</b>\n` +
    `• حکم ۴ نفره، تخته‌نرد، پاستور، منچ، بیلیارد و شطرنج\n\n` +
    `🪙 <b>موجودی شما:</b> ${(user.coins || 1000).toLocaleString()} سکه | 👥 <b>دعوت‌ها:</b> ${(user.referrals || []).length} نفر`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🌟 ورود به مینی‌اپلیکیشن (Mini App)', web_app: { url: CONFIG.WEBAPP_URL } }
      ],
      [
        { text: '🎭 شروع چت ناشناس تلگرامی', callback_data: 'start_anon_chat' },
        { text: '💬 تالار گفتگو و دوستیابی', web_app: { url: `${CONFIG.WEBAPP_URL}#/chat` } }
      ],
      [
        { text: '🌿 مراقبه و ذهن‌آگاهی', web_app: { url: `${CONFIG.WEBAPP_URL}#/mindfulness` } },
        { text: '📅 امروز من و برنامه‌ریزی', web_app: { url: `${CONFIG.WEBAPP_URL}#/myday` } }
      ],
      [
        { text: '🤖 مربی هوش مصنوعی', web_app: { url: `${CONFIG.WEBAPP_URL}#/ai-mentor` } },
        { text: '🔮 فال تاروت و چارت تولد', web_app: { url: `${CONFIG.WEBAPP_URL}#/chat?tab=tarot` } }
      ],
      [
        { text: '🎮 آرکید بازی‌های آنلاین', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } },
        { text: '👑 بازی حکم ۴ نفره', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/hokm` } }
      ],
      [
        { text: '🎁 گردونه شانس روزانه', callback_data: 'spin_wheel' },
        { text: '⭐ خرید ستاره تلگرام و VIP', callback_data: 'buy_stars' }
      ],
      [
        { text: '👥 دعوت دوستان (۱,۰۰۰ سکه + ۱۰٪ پورسانت)', url: `https://t.me/share/url?url=${refLink}&text=${shareText}` }
      ]
    ]
  };

  const replyKeyboard = {
    keyboard: [
      [{ text: '🎭 شروع چت ناشناس' }, { text: '🌟 باز کردن اپلیکیشن (Mini App)' }],
      [{ text: '🌿 ذهن‌آگاهی و مراقبه' }, { text: '📅 امروز من و برنامه‌ریزی' }],
      [{ text: '🎮 آرکید بازی‌ها' }, { text: '🔮 فال و چارت تولد' }],
      [{ text: '🎁 گردونه شانس' }, { text: '👥 لینک دعوت و درآمدزایی' }]
    ],
    resize_keyboard: true
  };

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: welcomeText,
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  }).then(() => {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '👇 از دکمه‌های زیر برای دسترسی سریع استفاده کنید:',
      reply_markup: replyKeyboard
    });
  });
}

// ----------------------------------------------------
// MESSAGE DISPATCHER
// ----------------------------------------------------
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const text = msg.text || '';
  const firstName = msg.from.first_name || 'کاربر';
  const username = msg.from.username || '';

  // Register user in DB
  if (!usersDb[userId]) {
    usersDb[userId] = {
      userId,
      firstName,
      username,
      coins: 1000,
      invitedBy: null,
      referrals: [],
      lastWheelSpin: 0,
      createdAt: Date.now()
    };
    saveDb();
  }

  // 1. If user is in active anonymous chat, handle anon commands or relay message
  if (activePairs.has(userId)) {
    if (text === '🛑 پایان گفتگو' || text === '/stop') {
      return stopAnonymousChat(chatId, userId);
    }
    if (text === '⏭️ هم‌صحبت بعدی' || text === '/next') {
      return nextAnonymousPartner(chatId, userId);
    }
    if (text === '💖 ارسال آیدی تلگرام' || text === '/reveal') {
      return shareContactInAnonChat(chatId, userId, msg);
    }
    if (text === '🏠 بازگشت به منوی اصلی' || text === '🏠 منوی اصلی زنوسلایف') {
      await stopAnonymousChat(chatId, userId);
      return;
    }
    // Relay anonymous message to partner
    const partnerId = activePairs.get(userId);
    return relayAnonMessage(msg, partnerId);
  }

  // 2. If user is waiting in queue
  if (waitingQueue.includes(userId)) {
    if (text === '🛑 لغو جستجو' || text === '🏠 بازگشت به منو' || text === '/stop') {
      return stopAnonymousChat(chatId, userId);
    }
  }

  // 3. Anonymous Chat Commands
  if (text === '🎭 شروع چت ناشناس' || text === '/chat') {
    return startAnonymousSearch(chatId, userId);
  }

  // 4. Start command
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const startParam = parts[1];

    if (startParam && startParam.startsWith('ref_')) {
      const refId = startParam.replace('ref_', '');
      if (refId !== userId && !usersDb[userId].invitedBy && usersDb[refId]) {
        usersDb[userId].invitedBy = refId;
        usersDb[userId].coins += 1000;
        usersDb[refId].referrals.push(userId);
        usersDb[refId].coins += 1000;
        saveDb();

        callTgApi('sendMessage', {
          chat_id: refId,
          text: `🎉 <b>تبریک! دوست جدیدی با لینک شما وارد شد!</b>\n\n👤 کاربر: <b>${firstName}</b>\n🪙 پاداش شما: <b>۱,۰۰۰ سکه هدیه</b> به کیف پولت اضافه شد!`,
          parse_mode: 'HTML'
        }).catch(() => {});
      }
    }
    return sendMainMenu(chatId, userId);
  }

  // 5. Sections Shortcuts
  if (text === '🌿 ذهن‌آگاهی و مراقبه' || text === '/mindfulness') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🌿 <b>بخش ذهن‌آگاهی و مراقبه‌های ۴۳۲Hz</b>\n\nآرامش عمیق ذهن، رهاسازی استرس و بالانس چاکراها با موزیک‌های تبتی و تنفس هدایت‌شده.',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎧 ورود به بخش مراقبه و ذهن‌آگاهی', web_app: { url: `${CONFIG.WEBAPP_URL}#/mindfulness` } }]
        ]
      }
    });
  }

  if (text === '📅 امروز من و برنامه‌ریزی' || text === '/myday') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '📅 <b>بخش امروز من (My Day)</b>\n\nمدیریت کارهای روزانه، تمرکز عمیق با پومودورو، ثبت روتین‌های روز و عادت‌سازی هوشمند.',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 باز کردن پنل برنامه‌ریزی امروز', web_app: { url: `${CONFIG.WEBAPP_URL}#/myday` } }]
        ]
      }
    });
  }

  if (text === '🎮 آرکید بازی‌ها' || text === '/games') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🎮 <b>آرکید بازی‌های آنلاین و دورهمی زنوسلایف</b>\n\nحکم ۴ نفره، تخته‌نرد ایرانی، پاستور، منچ، بیلیارد، شطرنج و ده‌ها بازی مهیج دیگر همراه با تورنمنت‌های جایزه‌دار.',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👑 بازی حکم ۴ نفره', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/hokm` } }],
          [{ text: '🎲 تخته نرد ایرانی', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/backgammon` } }],
          [{ text: '🎯 ورود به لابی تمام بازی‌ها', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }]
        ]
      }
    });
  }

  if (text === '🔮 فال و چارت تولد' || text === '/tarot') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🔮 <b>فال تاروت هوشمند و چارت تولد کیهانی</b>\n\nتحلیل انرژی‌های گذشته، حال و آینده با کارت‌های ۳ گانه تاروت و محاسبه طالع‌نما و نشان‌های خورشیدی با هوش مصنوعی.',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✨ کشیدن کارت‌های تاروت و چارت تولد', web_app: { url: `${CONFIG.WEBAPP_URL}#/chat?tab=tarot` } }]
        ]
      }
    });
  }

  if (text === '🎁 گردونه شانس' || text === '/wheel') {
    return handleSpinWheel(chatId, userId);
  }

  if (text === '⭐ خرید ستاره' || text === '/buy') {
    return sendBuyStarsMenu(chatId);
  }

  if (text === '👥 لینک دعوت و درآمدزایی' || text === '/ref') {
    const botInfo = await getBotInfo();
    const refLink = `https://t.me/${botInfo.username}?start=ref_${userId}`;
    const shareText = encodeURIComponent(`🌟 به سیستم عامل زندگی زنوسلایف بپیوندید!\nچت ناشناس، مراقبه، برنامه‌ریزی و بازی‌های آنلاین 🎁\n${refLink}`);

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `👥 <b>سیستم دعوت و کسب درآمد زنوسلایف</b>\n\n` +
        `🔗 <b>لینک اختصاصی شما:</b>\n<code>${refLink}</code>\n\n` +
        `🎁 <b>پاداش شما:</b>\n` +
        `• <b>۱,۰۰۰ سکه هدیه</b> برای شما و دوستتان\n` +
        `• <b>۱۰٪ از کل خریدهای آینده دوست شما</b> به عنوان پورسانت مادام‌العمر!\n\n` +
        `👥 تعداد افراد دعوت‌شده: <b>${(usersDb[userId].referrals || []).length} نفر</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 ارسال فوری لینک برای دوستان و گروه‌ها', url: `https://t.me/share/url?url=${refLink}&text=${shareText}` }],
          [{ text: '🌟 باز کردن زنوسلایف', web_app: { url: CONFIG.WEBAPP_URL } }]
        ]
      }
    });
  }

  if (text === '🌟 باز کردن اپلیکیشن (Mini App)') {
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: '🚀 برای ورود به محیط تمام‌صفحه سیستم عامل زندگی، دکمه زیر را لمس کنید:',
      reply_markup: {
        inline_keyboard: [[{ text: '🌟 ورود به زنوسلایف | Mini App', web_app: { url: CONFIG.WEBAPP_URL } }]]
      }
    });
  }

  // Default fallback -> send Main Menu
  return sendMainMenu(chatId, userId);
}

// ----------------------------------------------------
// CALLBACK QUERIES
// ----------------------------------------------------
async function handleCallbackQuery(cq) {
  const chatId = cq.message.chat.id;
  const userId = String(cq.from.id);
  const data = cq.data;

  if (data === 'start_anon_chat') {
    callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});
    return startAnonymousSearch(chatId, userId);
  }

  if (data === 'spin_wheel') {
    callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});
    return handleSpinWheel(chatId, userId);
  }

  if (data === 'buy_stars') {
    callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});
    return sendBuyStarsMenu(chatId);
  }

  if (data.startsWith('buy_pkg_')) {
    const pkgType = data.replace('buy_pkg_', '');
    callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});

    const packages = {
      'bronze': { title: '🪙 ۱,۰۰۰ سکه زنوسلایف', priceStars: 35, coins: 1000 },
      'silver': { title: '💰 ۵,۰۰۰ سکه + ۵۰۰ هدیه', priceStars: 150, coins: 5500 },
      'gold': { title: '👑 ۲۰,۰۰۰ سکه + ۳,۰۰۰ هدیه', priceStars: 500, coins: 23000 },
      'vip': { title: '💎 ۵۰,۰۰۰ سکه + اشتراک VIP', priceStars: 1000, coins: 50000 }
    };

    const pkg = packages[pkgType];
    if (pkg) {
      return callTgApi('sendInvoice', {
        chat_id: chatId,
        title: pkg.title,
        description: `شارژ فوری ${pkg.coins.toLocaleString()} سکه در اکانت زنوسلایف شما`,
        payload: JSON.stringify({ userId, pkgType, coins: pkg.coins }),
        currency: 'XTR',
        prices: [{ label: pkg.title, amount: pkg.priceStars }]
      });
    }
  }
}

// ----------------------------------------------------
// LUCKY WHEEL & STARS PAYMENTS
// ----------------------------------------------------
async function handleSpinWheel(chatId, userId) {
  const now = Date.now();
  const user = usersDb[userId];
  const cooldown = 24 * 60 * 60 * 1000;

  if (user && user.lastWheelSpin && (now - user.lastWheelSpin < cooldown)) {
    const remainingHours = Math.ceil((cooldown - (now - user.lastWheelSpin)) / 3600000);
    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `⏳ <b>گردونه شانس در حال شارژ مجدد است!</b>\n\nشما امروز گردونه را چرخانده‌اید. لطفاً <b>${remainingHours} ساعت</b> دیگر مراجعه کنید.`,
      parse_mode: 'HTML'
    });
  }

  const prizes = [100, 250, 500, 1000, 2000, 5000];
  const wonCoins = prizes[Math.floor(Math.random() * prizes.length)];

  user.coins = (user.coins || 0) + wonCoins;
  user.lastWheelSpin = now;
  saveDb();

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: `🎰 <b>گردونه شانس زنوسلایف چرخید!</b>\n\n` +
      `✨ <b>تبریک! شما برنده ${wonCoins.toLocaleString()} سکه هدیه شدید! 🪙</b>\n\n` +
      `💰 موجودی کل شما: <b>${user.coins.toLocaleString()}</b> سکه`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🌟 ورود به اپلیکیشن و خرج کردن سکه‌ها', web_app: { url: CONFIG.WEBAPP_URL } }]
      ]
    }
  });
}

function sendBuyStarsMenu(chatId) {
  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: '⭐ <b>فروشگاه رسمی ستاره تلگرام (Telegram Stars Shop)</b>\n\n' +
      'سکه و اشتراک طلایی را مستقیماً با **Telegram Stars** خریداری کنید و از امکانات VIP لذت ببرید!',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🪙 ۱,۰۰۰ سکه (۳۵ ستاره ⭐)', callback_data: 'buy_pkg_bronze' }],
        [{ text: '💰 ۵,۰۰۰ سکه + هدیه (۱۵۰ ستاره ⭐)', callback_data: 'buy_pkg_silver' }],
        [{ text: '👑 ۲۰,۰۰۰ سکه + هدیه (۵۰۰ ستاره ⭐)', callback_data: 'buy_pkg_gold' }],
        [{ text: '💎 ۵۰,۰۰۰ سکه + VIP (۱,۰۰۰ ستاره ⭐)', callback_data: 'buy_pkg_vip' }],
        [{ text: '🌟 باز کردن فروشگاه داخل برنامه', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }]
      ]
    }
  });
}

async function handlePreCheckoutQuery(pcq) {
  return callTgApi('answerPreCheckoutQuery', {
    pre_checkout_query_id: pcq.id,
    ok: true
  });
}

async function handleSuccessfulPayment(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const payment = msg.successful_payment;

  try {
    const payload = JSON.parse(payment.invoice_payload);
    if (payload.coins && usersDb[userId]) {
      usersDb[userId].coins += payload.coins;
      saveDb();
    }
  } catch (_) {}

  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: '✅ <b>پرداخت با ستاره‌های تلگرام با موفقیت انجام شد!</b>\n\nسکه و اشتراک به حساب شما اضافه شد.',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '🌟 ورود به زنوسلایف', web_app: { url: CONFIG.WEBAPP_URL } }]]
    }
  });
}

let cachedBotInfo = null;
async function getBotInfo() {
  if (!cachedBotInfo) {
    cachedBotInfo = await callTgApi('getMe');
  }
  return cachedBotInfo;
}

// Long Polling Loop
let lastUpdateId = 0;
async function pollUpdates() {
  try {
    const updates = await callTgApi('getUpdates', {
      offset: lastUpdateId + 1,
      timeout: 25
    });

    for (const update of updates) {
      lastUpdateId = update.update_id;

      if (update.message) {
        if (update.message.successful_payment) {
          await handleSuccessfulPayment(update.message);
        } else {
          await handleMessage(update.message);
        }
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

// Start Bot
console.log('🚀 ZenOsLife Ecosystem & Anonymous Chat Bot Engine Starting...');
initBotSettings().then(() => {
  pollUpdates();
  console.log('✨ Bot is online with Anonymous Chat and Full Life-OS Ecosystem!');
}).catch(err => {
  console.error('Fatal error starting bot:', err);
});
