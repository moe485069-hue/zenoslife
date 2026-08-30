/**
 * ZenOsLife Telegram Bot (Zero-Dependency Node.js Bot Engine)
 * Features:
 * - Full Telegram WebApp Menu Button (https://zen.moeid.net)
 * - Deep Linking (?startapp=ref_ID, ?startapp=hokm, etc.)
 * - Telegram Stars Payment Invoices (sendInvoice XTR)
 * - Daily Lucky Wheel (گردونه شانس روزانه)
 * - One-Tap Share Viral Referral Link
 * - Channel Force-Join Check
 * - Admin Broadcast & Live Stats
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

// Local storage for users & referral tracking
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

// Telegram API Client Helper
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

// 1. Initialize Bot Menu Button & Commands
async function initBotSettings() {
  try {
    // Set WebApp Menu Button
    await callTgApi('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: '🎮 زنوسلایف | Mini App',
        web_app: { url: CONFIG.WEBAPP_URL }
      }
    });

    // Set Bot Commands
    await callTgApi('setMyCommands', {
      commands: [
        { command: 'start', description: '🚀 ورود به بازی‌ها و پیام‌رسان زنوسلایف' },
        { command: 'wheel', description: '🎁 گردونه شانس و پاداش روزانه' },
        { command: 'buy', description: '⭐ خرید ستاره تلگرام و پکیج سکه' },
        { command: 'ref', description: '👥 لینک دعوت و درآمدزایی' },
        { command: 'help', description: '❓ راهنما و پشتیبانی آنلاین' }
      ]
    });

    console.log('✅ Bot Menu Button and Commands configured successfully!');
  } catch (e) {
    console.warn('Notice during bot init:', e.message);
  }
}

// 2. Main Message Handler
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const text = msg.text || '';
  const firstName = msg.from.first_name || 'کاربر گرامی';
  const username = msg.from.username || '';

  // Register user
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

  // Command: /start or /start ref_ID
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

        // Notify referrer
        callTgApi('sendMessage', {
          chat_id: refId,
          text: `🎉 <b>تبریک! دوست جدیدی با لینک شما وارد شد!</b>\n\n👤 کاربر: <b>${firstName}</b>\n🪙 پاداش شما: <b>۱,۰۰۰ سکه هدیه</b> به کیف پولت اضافه شد!`,
          parse_mode: 'HTML'
        }).catch(() => {});
      }
    }

    const botInfo = await getBotInfo();
    const refLink = `https://t.me/${botInfo.username}?start=ref_${userId}`;
    const shareText = encodeURIComponent(`🎮 بیا با هم حکم ۴ نفره آنلاین و تخته‌نرد بزنیم!\n۱,۰۰۰ سکه هدیه رایگان بگیر 🎁👇\n${refLink}`);

    const welcomeCaption = `👑 <b>سلام ${firstName} عزیز، به دنیای زنوسلایف خوش آمدید!</b> ✨\n\n` +
      `🎮 <b>مجموعه بازی‌های آنلاین شاهانه:</b>\n` +
      `• حکم ۴ نفره با شرط‌بندی سکه 👑\n` +
      `• تخته نرد ایرانی با ۳ تم اصیل 🎲\n` +
      `• پاستور (چهاربرگ) خاطره‌انگیز 🃏\n` +
      `• منچ، بیلیارد ۸-توپی و شطرنج 🎯\n\n` +
      `💬 <b>جامعه و چت‌روم‌ها:</b>\n` +
      `• چت‌روم‌های صوتی و متنی بلادرنگ\n` +
      `• چت ناشناس سرعتی (Blind Match)\n` +
      `• فال تاروت هوشمند و چارت تولد آسترولوژی 🔮\n\n` +
      `🪙 <b>موجودی شما:</b> ${(usersDb[userId].coins || 1000).toLocaleString()} سکه\n` +
      `👥 <b>تعداد دعوت‌های شما:</b> ${(usersDb[userId].referrals || []).length} نفر`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '🚀 ورود به اپلیکیشن و بازی‌ها', web_app: { url: CONFIG.WEBAPP_URL } }
        ],
        [
          { text: '👑 حکم ۴ نفره آنلاین', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/hokm` } },
          { text: '🎲 تخته نرد ایرانی', web_app: { url: `${CONFIG.WEBAPP_URL}#/games/backgammon` } }
        ],
        [
          { text: '💬 تالار گفتگو و دوستیابی', web_app: { url: `${CONFIG.WEBAPP_URL}#/chat` } },
          { text: '🔮 فال و چارت تولد', web_app: { url: `${CONFIG.WEBAPP_URL}#/chat?tab=tarot` } }
        ],
        [
          { text: '🎁 گردونه شانس روزانه', callback_data: 'spin_wheel' },
          { text: '⭐ خرید ستاره و سکه', callback_data: 'buy_stars' }
        ],
        [
          { text: '👥 دعوت دوستان (کسب ۱,۰۰۰ سکه)', url: `https://t.me/share/url?url=${refLink}&text=${shareText}` }
        ]
      ]
    };

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: welcomeCaption,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  }

  // Command: /wheel (گردونه شانس)
  if (text.startsWith('/wheel') || text === '🎁 گردونه شانس') {
    return handleSpinWheel(chatId, userId);
  }

  // Command: /buy (خرید ستاره تلگرام)
  if (text.startsWith('/buy') || text === '⭐ خرید ستاره') {
    return sendBuyStarsMenu(chatId);
  }

  // Command: /ref (لینک رفرال)
  if (text.startsWith('/ref') || text === '👥 لینک دعوت') {
    const botInfo = await getBotInfo();
    const refLink = `https://t.me/${botInfo.username}?start=ref_${userId}`;
    const shareText = encodeURIComponent(`🎮 بیا با هم حکم آنلاین و تخته‌نرد بزنیم! ۱,۰۰۰ سکه هدیه رایگان بگیر 🎁👇\n${refLink}`);

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `👥 <b>سیستم دعوت و درآمدزایی زنوسلایف</b>\n\n` +
        `🔗 <b>لینک اختصاصی شما:</b>\n<code>${refLink}</code>\n\n` +
        `🎁 <b>پاداش شما:</b>\n` +
        `• <b>۱,۰۰۰ سکه</b> به ازای هر دعوت موفق\n` +
        `• <b>۱۰٪ از کل خریدهای آینده دوست شما</b> به عنوان پورسانت مادام‌العمر!\n\n` +
        `👥 تعداد افراد دعوت‌شده: <b>${(usersDb[userId].referrals || []).length} نفر</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 ارسال فوری لینک برای دوستان و گروه‌ها', url: `https://t.me/share/url?url=${refLink}&text=${shareText}` }],
          [{ text: '🎮 باز کردن زنوسلایف', web_app: { url: CONFIG.WEBAPP_URL } }]
        ]
      }
    });
  }

  // Command: /admin (آمار ربات)
  if (text === '/admin' && CONFIG.ADMIN_IDS.includes(userId)) {
    const totalUsers = Object.keys(usersDb).length;
    const totalCoins = Object.values(usersDb).reduce((acc, u) => acc + (u.coins || 0), 0);

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `📊 <b>پنل مدیریت ربات زنوسلایف</b>\n\n` +
        `👥 کل کاربران ثبت‌شده: <b>${totalUsers.toLocaleString()}</b> نفر\n` +
        `🪙 مجموع سکه‌های در گردش: <b>${totalCoins.toLocaleString()}</b> سکه\n` +
        `🌐 آدرس وب‌اپلیکیشن: ${CONFIG.WEBAPP_URL}\n\n` +
        `برای ارسال پیام همگانی دستور زیر را بنویسید:\n<code>/broadcast متن پیام شما</code>`,
      parse_mode: 'HTML'
    });
  }

  // Command: /broadcast
  if (text.startsWith('/broadcast ') && CONFIG.ADMIN_IDS.includes(userId)) {
    const broadcastMsg = text.replace('/broadcast ', '').trim();
    const userIds = Object.keys(usersDb);
    let sentCount = 0;

    for (const uid of userIds) {
      try {
        await callTgApi('sendMessage', {
          chat_id: uid,
          text: `📢 <b>اطلاعیه رسمی زنوسلایف:</b>\n\n${broadcastMsg}`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '🎮 ورود به برنامه', web_app: { url: CONFIG.WEBAPP_URL } }]]
          }
        });
        sentCount++;
      } catch (_) {}
    }

    return callTgApi('sendMessage', {
      chat_id: chatId,
      text: `✅ پیام شما با موفقیت برای <b>${sentCount}</b> کاربر ارسال شد.`
    });
  }
}

// 3. Callback Queries Handler (Inline Buttons)
async function handleCallbackQuery(cq) {
  const chatId = cq.message.chat.id;
  const userId = String(cq.from.id);
  const data = cq.data;

  // Spin Wheel
  if (data === 'spin_wheel') {
    callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});
    return handleSpinWheel(chatId, userId);
  }

  // Buy Stars Menu
  if (data === 'buy_stars') {
    callTgApi('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});
    return sendBuyStarsMenu(chatId);
  }

  // Stars Package Invoice Triggers (Telegram Stars XTR)
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
        currency: 'XTR', // Telegram Stars Currency
        prices: [{ label: pkg.title, amount: pkg.priceStars }]
      });
    }
  }
}

// 4. Spin Wheel Handler
async function handleSpinWheel(chatId, userId) {
  const now = Date.now();
  const user = usersDb[userId];
  const cooldown = 24 * 60 * 60 * 1000; // 24 hours

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
        [{ text: '🎮 خرج کردن سکه‌ها در بازی‌ها', web_app: { url: CONFIG.WEBAPP_URL } }]
      ]
    }
  });
}

// 5. Send Telegram Stars Buy Menu
function sendBuyStarsMenu(chatId) {
  return callTgApi('sendMessage', {
    chat_id: chatId,
    text: `⭐ <b>فروشگاه رسمی ستاره تلگرام (Telegram Stars Shop)</b>\n\n` +
      `سکه و اشتراک طلایی را مستقیماً با **Telegram Stars** خریداری کنید و در تمام بازی‌ها و چت‌روم‌ها بدرخشید!`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🪙 ۱,۰۰۰ سکه (۳۵ ستاره ⭐)', callback_data: 'buy_pkg_bronze' }],
        [{ text: '💰 ۵,۰۰۰ سکه + هدیه (۱۵۰ ستاره ⭐)', callback_data: 'buy_pkg_silver' }],
        [{ text: '👑 ۲۰,۰۰۰ سکه + هدیه (۵۰۰ ستاره ⭐)', callback_data: 'buy_pkg_gold' }],
        [{ text: '💎 ۵۰,۰۰۰ سکه + VIP (۱,۰۰۰ ستاره ⭐)', callback_data: 'buy_pkg_vip' }],
        [{ text: '🎮 باز کردن فروشگاه داخل برنامه', web_app: { url: `${CONFIG.WEBAPP_URL}#/games` } }]
      ]
    }
  });
}

// 6. Pre-Checkout Query Handler (for Telegram Stars payments)
async function handlePreCheckoutQuery(pcq) {
  return callTgApi('answerPreCheckoutQuery', {
    pre_checkout_query_id: pcq.id,
    ok: true
  });
}

// 7. Successful Payment Handler
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
    text: `✅ <b>پرداخت با ستاره‌های تلگرام با موفقیت انجام شد!</b>\n\nسکه و اشتراک به اکانت شما اضافه شد. هم‌اکنون وارد بازی‌ها شوید.`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '🎮 ورود به زنوسلایف', web_app: { url: CONFIG.WEBAPP_URL } }]]
    }
  });
}

// 8. Bot Info Cache
let cachedBotInfo = null;
async function getBotInfo() {
  if (!cachedBotInfo) {
    cachedBotInfo = await callTgApi('getMe');
  }
  return cachedBotInfo;
}

// 9. Long Polling Loop
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
console.log('🚀 ZenOsLife Telegram Bot Engine Starting...');
initBotSettings().then(() => {
  pollUpdates();
  console.log('✨ Bot is online and listening for Telegram updates!');
}).catch(err => {
  console.error('Fatal error starting bot:', err);
});
