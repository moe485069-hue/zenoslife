/**
 * ============================================================================
 * 🌱 زنوسلایف (ZenOsLife) - LifeOS, Realms & Self-Discovery Bot (@zenosaaa_bot)
 * ============================================================================
 */

const { CONFIG, isAdmin } = require('../../shared/config');
const { db, saveDb, getUser, checkDailyStreak } = require('../../shared/db');
const { TelegramBotRunner, callTgApi } = require('../../shared/telegram');
const {
  sendInvoiceForPackage,
  sendInvoiceForVip,
  handlePreCheckout,
  handlePaymentSuccess,
  sendFinanceHub
} = require('../../shared/economy');

const { sendRealmsMenu, handleEnterRealm } = require('./realms');
const { sendSelfDiscoveryMenu, handleSelfTestStep, sendMentorAdvice } = require('./self-discovery');
const {
  addReminder,
  checkDueReminders,
  handleCompleteReminder,
  handleSnoozeReminder
} = require('./reminders');

const BOT_TOKEN = CONFIG.BOT_TOKEN_LIFEOS;

function getLifeOsReplyKeyboard() {
  return {
    keyboard: [
      [{ text: '🚪 راهروهای فکری و قدم‌زدن (Stroll)' }],
      [{ text: '🧭 خودشناسی و آزمون‌ها' }, { text: '🤖 مربی هوش مصنوعی (Mentor)' }],
      [{ text: '⏰ تنظیم یادآور و تقویم' }, { text: '👤 پروفایل و کارمای من' }],
      [{ text: '💎 کیف‌پول و بخش VIP' }, { text: '🔗 دعوت از دوستان' }],
      [{
        text: '🌟 ورود به مینی‌اپ کامل زنوسلایف ✨',
        web_app: { url: `${CONFIG.WEBAPP_URL}?app=zenos` }
      }]
    ],
    resize_keyboard: true
  };
}

async function sendLifeOsDashboard(chatId, userId) {
  const user = getUser(userId);
  const streak = checkDailyStreak(userId);

  if (streak && streak.days > 1) {
    callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `🔥 <b>استریک روزانه ورود به زنوسلایف!</b>\nشما ${streak.days} روز متوالی با ما همراه بودید!\n🎁 پاداش: <b>+${streak.coins} سکه و +${streak.xp} XP</b>`,
      parse_mode: 'HTML'
    }).catch(() => {});
  }

  const text = `👑 <b>به زنوسلایف (سیستم‌عامل زندگی، رشد فردی و خودشناسی) خوش آمدید!</b>\n\n` +
               `👤 <b>${user.name || 'کاربر زنوسلایف'}</b> (سطح ${user.level || 1})\n` +
               `⭐ کارمای اخلاق: <b>${user.karma || 100}</b> | موجودی: <b>${(user.coins || 0).toLocaleString()}</b> سکه\n` +
               `👑 وضعیت اشتراک: <b>${user.is_vip ? 'VIP طلایی فعال ✅' : 'کاربر عادی'}</b>\n\n` +
               `یک بخش را برای شروع انتخاب کنید یا وارد مینی‌اپ کامل شوید:`;

  return callTgApi(BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: getLifeOsReplyKeyboard()
  });
}

// ----------------------------------------------------
// SUPER ADMIN COMMANDS
// ----------------------------------------------------
async function sendAdminPanel(chatId, userId) {
  if (!isAdmin(userId)) {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `⛔ <b>دسترسی غیرمجاز!</b>\nشناسه عددی شما (<code>${userId}</code>) در لیست مدیران سیستم ثبت نشده است.`,
      parse_mode: 'HTML'
    });
  }

  const allUsers = Object.values(db.users);
  const totalUsers = allUsers.length;
  const totalVips = allUsers.filter(u => u.is_vip).length;
  const totalMatches = db.stats.totalMatchesPlayed || 0;
  const totalChats = db.stats.totalChatsCompleted || 0;
  const totalRevenue = db.stats.totalStarsRevenue || 0;

  const adminText = `📊 <b>داشبورد جامع مدیریت زنوسلایف (Super Admin Panel)</b>\n\n` +
    `👥 <b>تعداد کل کاربران ثبت‌نامی:</b> <b>${totalUsers.toLocaleString()} نفر</b>\n` +
    `👑 <b>کاربران VIP فعال:</b> <b>${totalVips.toLocaleString()} نفر</b>\n` +
    `💬 <b>مکالمات دوستیابی انجام شده:</b> <b>${totalChats.toLocaleString()} گفتگو</b>\n` +
    `🎮 <b>دست‌های بازی ثبت‌شده:</b> <b>${totalMatches.toLocaleString()} بازی</b>\n` +
    `⭐ <b>درآمد کل ستاره‌های تلگرام:</b> <b>${totalRevenue.toLocaleString()} Stars ⭐</b>\n\n` +
    `🛠️ <b>دستورات مدیریتی:</b>\n` +
    `• <code>/grantvip &lt;شناسه_کاربر&gt; &lt;روز&gt;</code> - اعطای VIP\n` +
    `• <code>/revokevip &lt;شناسه_کاربر&gt;</code> - لغو VIP\n` +
    `• <code>/setcoins &lt;شناسه_کاربر&gt; &lt;تعداد&gt;</code> - تنظیم سکه\n` +
    `• <code>/broadcast &lt;متن_پیام&gt;</code> - ارسال پیام همگانی`;

  return callTgApi(BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text: adminText,
    parse_mode: 'HTML'
  });
}

// ----------------------------------------------------
// MESSAGE ROUTER
// ----------------------------------------------------
async function onMessage(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const text = (msg.text || '').trim();

  getUser(userId, msg.from.first_name);

  // Admin Commands
  if (text.startsWith('/admin')) {
    return sendAdminPanel(chatId, userId);
  }

  if (text.startsWith('/grantvip ') && isAdmin(userId)) {
    const parts = text.split(' ');
    const targetId = parts[1];
    const days = parseInt(parts[2] || '30', 10);
    const target = getUser(targetId);
    target.is_vip = true;
    target.vip_expires_at = Math.max(target.vip_expires_at || 0, Date.now()) + (days * 86400000);
    saveDb();
    return callTgApi(BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ اشتراک VIP به مدت ${days} روز به کاربر ${targetId} اعطا شد.` });
  }

  if (text.startsWith('/setcoins ') && isAdmin(userId)) {
    const parts = text.split(' ');
    const targetId = parts[1];
    const amount = parseInt(parts[2] || '1000', 10);
    const target = getUser(targetId);
    target.coins = amount;
    saveDb();
    return callTgApi(BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ موجودی سکه کاربر ${targetId} به ${amount.toLocaleString()} تغییر یافت.` });
  }

  if (text.startsWith('/broadcast ') && isAdmin(userId)) {
    const broadcastMsg = text.replace('/broadcast ', '').trim();
    const allUsers = Object.keys(db.users);
    let sent = 0;
    for (const uId of allUsers) {
      try {
        await callTgApi(BOT_TOKEN, 'sendMessage', { chat_id: uId, text: `📢 <b>پیام همگانی زنوسلایف:</b>\n\n${broadcastMsg}`, parse_mode: 'HTML' });
        sent++;
      } catch (_) {}
    }
    return callTgApi(BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ پیام همگانی با موفقیت برای ${sent} کاربر ارسال شد.` });
  }

  // Regular Commands
  if (text.startsWith('/start') || text === '🔙 بازگشت به منوی اصلی') {
    return sendLifeOsDashboard(chatId, userId);
  }

  if (text === '🚪 راهروهای فکری و قدم‌زدن (Stroll)' || text === '/stroll') {
    return sendRealmsMenu(BOT_TOKEN, chatId, userId);
  }

  if (text === '🧭 خودشناسی و آزمون‌ها') {
    return sendSelfDiscoveryMenu(BOT_TOKEN, chatId, userId);
  }

  if (text === '🤖 مربی هوش مصنوعی (Mentor)' || text === '/mentor') {
    return sendMentorAdvice(BOT_TOKEN, chatId, userId);
  }

  if (text === '⏰ تنظیم یادآور و تقویم' || text.startsWith('/remind')) {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `⏰ <b>تنظیم یادآور هوشمند تقویم:</b>\n\nبرای ثبت سریع یادآور، پیام را به این فرمت بفرستید:\n<code>/remind &lt;ساعت:دقیقه&gt; &lt;عنوان&gt;</code>\n\nمثال:\n<code>/remind 18:30 تمرین تنفس و مطالعه کتاب</code>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📅 باز کردن تقویم کامل در مینی‌اپ', web_app: { url: `${CONFIG.WEBAPP_URL}#/calendar` } }]
        ]
      }
    });
  }

  if (text.startsWith('/remind ')) {
    const parts = text.replace('/remind ', '').trim().split(' ');
    const timeStr = parts[0];
    const title = parts.slice(1).join(' ') || 'یادآور جدید';
    await addReminder(userId, title, timeStr);
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `✅ یادآور «<b>${title}</b>» برای ساعت <b>${timeStr}</b> با موفقیت تنظیم شد.`
    });
  }

  if (text === '👤 پروفایل و کارمای من' || text === '/profile') {
    const user = getUser(userId);
    const textCard = `👤 <b>کارت کاربری شما در زنوسلایف:</b>\n\n` +
                     `🏷️ نام: <b>${user.name || 'کاربر'}</b>\n` +
                     `🏆 سطح: <b>Level ${user.level || 1}</b> (${user.xp || 0} XP)\n` +
                     `⭐ کارمای اخلاق: <b>${user.karma || 100}</b>\n` +
                     `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
                     `🔥 استریک همراهی: <b>${user.streak_days || 1} روز</b>`;
    return callTgApi(BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: textCard, parse_mode: 'HTML' });
  }

  if (text === '💎 کیف‌پول و بخش VIP' || text === '/wallet') {
    return sendFinanceHub(BOT_TOKEN, chatId, userId);
  }

  if (text === '🔗 دعوت از دوستان') {
    const me = await callTgApi(BOT_TOKEN, 'getMe');
    const refLink = `https://t.me/${me.username}?start=ref_${userId}`;
    const user = getUser(userId);
    const refMsg = `🎁 <b>سیستم دعوت و درآمدزایی زنوسلایف</b>\n\n` +
                   `🔗 <b>لینک اختصاصی شما:</b>\n<code>${refLink}</code>\n\n` +
                   `• ۱,۰۰۰ سکه هدیه به ازای هر دعوت موفق برای شما\n` +
                   `• ۱,۰۰۰ سکه هدیه در بدو ورود برای دوست شما\n` +
                   `• ۱۰٪ پورسانت مادام‌العمر از تمامی خریدهای ستاره تلگرام!\n\n` +
                   `👥 تعداد دوستان دعوت‌شده: <b>${(user.referrals || []).length} نفر</b>`;

    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: refMsg,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 ارسال فوری برای دوستان', url: `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent('به سیستم‌عامل زندگی و خودشناسی زنوسلایف بپیوندید!')}` }]
        ]
      }
    });
  }

  return sendLifeOsDashboard(chatId, userId);
}

// ----------------------------------------------------
// CALLBACK ROUTER
// ----------------------------------------------------
async function onCallback(cq) {
  const chatId = cq.message?.chat.id;
  const userId = String(cq.from.id);
  const data = cq.data || '';

  try {
    await callTgApi(BOT_TOKEN, 'answerCallbackQuery', { callback_query_id: cq.id });
  } catch (_) {}

  getUser(userId, cq.from.first_name);

  if (data === 'open_realms_menu') return sendRealmsMenu(BOT_TOKEN, chatId, userId);
  if (data.startsWith('enter_realm_')) {
    const realmId = data.replace('enter_realm_', '');
    return handleEnterRealm(BOT_TOKEN, chatId, userId, realmId);
  }

  if (data.startsWith('start_self_test_')) {
    return handleSelfTestStep(BOT_TOKEN, chatId, userId, 0);
  }

  if (data.startsWith('ans_self_')) {
    const parts = data.replace('ans_self_', '').split('_');
    const nextStep = parseInt(parts[0], 10);
    return handleSelfTestStep(BOT_TOKEN, chatId, userId, nextStep);
  }

  if (data === 'get_mentor_advice') {
    return sendMentorAdvice(BOT_TOKEN, chatId, userId);
  }

  if (data.startsWith('complete_rem_')) {
    return handleCompleteReminder(BOT_TOKEN, userId, data.replace('complete_rem_', ''));
  }

  if (data.startsWith('snooze_rem_')) {
    return handleSnoozeReminder(BOT_TOKEN, userId, data.replace('snooze_rem_', ''));
  }

  // Shop Callbacks
  if (data === 'shop_buy_coins') {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🪙 <b>بسته‌های سکه زنوسلایف:</b>',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🪙 ۱,۰۰۰ سکه (۳۵ ستاره ⭐)', callback_data: 'buy_pkg_bronze' }],
          [{ text: '💰 ۵,۰۰۰ سکه + بانس (۱۵۰ ستاره ⭐)', callback_data: 'buy_pkg_silver' }],
          [{ text: '🌍 ۱۲,۰۰۰ سکه (۳۰۰ ستاره ⭐)', callback_data: 'buy_pkg_global' }],
          [{ text: '💎 ۵۰,۰۰۰ سکه + VIP (۱,۰۰۰ ستاره ⭐)', callback_data: 'buy_pkg_vip' }]
        ]
      }
    });
  }

  if (data === 'shop_buy_vip') {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '👑 <b>پلن‌های اشتراک VIP زنوسلایف:</b>',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🥉 هفتگی (۷۵ ⭐)', callback_data: 'buy_vip_7' }],
          [{ text: '🥈 ماهانه (۲۵۰ ⭐)', callback_data: 'buy_vip_30' }],
          [{ text: '👑 طلایی سه ماهه (۶۵۰ ⭐)', callback_data: 'buy_vip_90' }]
        ]
      }
    });
  }

  if (data.startsWith('buy_pkg_')) {
    const pkg = data.replace('buy_pkg_', '');
    return sendInvoiceForPackage(BOT_TOKEN, chatId, userId, pkg);
  }

  if (data.startsWith('buy_vip_')) {
    const days = parseInt(data.replace('buy_vip_', ''), 10);
    return sendInvoiceForVip(BOT_TOKEN, chatId, userId, days);
  }
}

// ----------------------------------------------------
// RUNNER INITIALIZATION
// ----------------------------------------------------
const runner = new TelegramBotRunner('ZenOsLife Bot', BOT_TOKEN, {
  onMessage,
  onCallback,
  onPayment: (msg) => handlePaymentSuccess(BOT_TOKEN, msg),
  onPreCheckout: (pcq) => handlePreCheckout(BOT_TOKEN, pcq)
});

async function start() {
  await runner.init({
    menuButton: {
      text: '🌟 ورود به زنوسلایف (Mini App)',
      url: `${CONFIG.WEBAPP_URL}?app=zenos`
    },
    commands: [
      { command: 'start', description: '🚀 منوی اصلی زنوسلایف' },
      { command: 'stroll', description: '🚪 راهروهای فکری و آرامش' },
      { command: 'mentor', description: '🤖 مربی هوش مصنوعی ذهن' },
      { command: 'remind', description: '⏰ تنظیم آلارم و یادآور' },
      { command: 'profile', description: '👤 کارت هویت و کارما' },
      { command: 'wallet', description: '💎 کیف‌پول و بخش VIP' },
      { command: 'admin', description: '📊 پنل مدیریت سیستم' }
    ]
  });

  // Start periodic reminders check every 30 seconds
  setInterval(() => checkDueReminders(BOT_TOKEN), 30000);

  runner.startPolling();
}

if (require.main === module) {
  start().catch(err => {
    console.error('Fatal error starting ZenOsLife bot:', err);
  });
}

module.exports = { runner, start };
