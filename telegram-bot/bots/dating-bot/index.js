/**
 * ============================================================================
 * 💬 حُذا (Whoza) Anonymous Chat & Social Matchmaking Bot (@whoza_bot)
 * ============================================================================
 */

const { CONFIG } = require('../../shared/config');
const { db, saveDb, getUser, checkDailyStreak, addCoins } = require('../../shared/db');
const { TelegramBotRunner, callTgApi } = require('../../shared/telegram');
const {
  sendInvoiceForPackage,
  sendInvoiceForVip,
  handlePreCheckout,
  handlePaymentSuccess,
  sendFinanceHub
} = require('../../shared/economy');

const {
  waitingQueue,
  activePairs,
  vipLoungeMembers,
  sendFilterMenu,
  sendMoodSelectMenu,
  sendOtherFiltersMenu,
  executeMatchSearch,
  stopChat,
  relayMessage,
  sendInChatGiftsMenu,
  handleSendGift,
  triggerIcebreaker
} = require('./matchmaking');

const BOT_TOKEN = CONFIG.BOT_TOKEN_DATING;

function getDatingReplyKeyboard() {
  return {
    keyboard: [
      [{ text: '💬 شروع چت ناشناس و دوستیابی' }],
      [{ text: '🌈 چت بر اساس حس‌وحال (مود)' }, { text: '👑 تالار گفتگوی VIP' }],
      [{ text: '👤 پروفایل و کارمای من' }, { text: '💎 کیف‌پول و شارژ سکه' }],
      [{
        text: '🌟 ورود به چت‌روم‌ها و اکسپلور مینی‌اپ 💬',
        web_app: { url: `${CONFIG.WEBAPP_URL}#/chat` }
      }]
    ],
    resize_keyboard: true
  };
}

async function sendDatingDashboard(chatId, userId) {
  const user = getUser(userId);
  const streak = checkDailyStreak(userId);

  if (streak && streak.days > 1) {
    callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `🔥 <b>استریک روزانه ورود به حُذا!</b>\nشما ${streak.days} روز متوالی همراه ما بودید!\n🎁 پاداش: <b>+${streak.coins} سکه و +${streak.xp} XP</b>`,
      parse_mode: 'HTML'
    }).catch(() => {});
  }

  const text = `💬 <b>به حُذا (سامانه چت ناشناس و دوستیابی هوشمند زنوسلایف) خوش آمدید!</b>\n\n` +
               `👤 <b>${user.name || 'کاربر حُذا'}</b> | ⭐ کارمای اخلاق: <b>${user.karma || 100}</b>\n` +
               `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b> | سطح: <b>Level ${user.level || 1}</b>\n` +
               `👑 وضعیت: <b>${user.is_vip ? 'VIP طلایی فعال ✅' : 'کاربر عادی'}</b>\n\n` +
               `یک گزینه را برای شروع مکالمه انتخاب کنید:`;

  return callTgApi(BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: getDatingReplyKeyboard()
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

  // If in active 1v1 chat
  if (activePairs.has(userId)) {
    if (text === '🛑 پایان گفتگو' || text === '/stop') {
      return stopChat(BOT_TOKEN, userId);
    }
    if (text === '⏭️ هم‌صحبت بعدی' || text === '/next') {
      await stopChat(BOT_TOKEN, userId);
      return executeMatchSearch(BOT_TOKEN, chatId, userId, 'random');
    }
    if (text === '🎁 ارسال هدیه') {
      return sendInChatGiftsMenu(BOT_TOKEN, chatId, userId);
    }
    if (text === '🎲 سوال یخ‌شکن') {
      return triggerIcebreaker(BOT_TOKEN, userId);
    }
    if (text === '🪪 مشخصات هم‌صحبت') {
      const partnerId = activePairs.get(userId);
      const p = getUser(partnerId);
      const card = `🪪 <b>مشخصات هم‌صحبت:</b>\n` +
                   `⚧️ جنسیت: ${p.gender === 'female' ? '👩 دختر' : '👨 پسر'}\n` +
                   `🎂 رده سنی: ${p.age || 'نامشخص'}\n` +
                   `📍 منطقه: ${p.province || 'ایران'}\n` +
                   `⭐ کارما: ${p.karma || 100} | سطح: Lvl ${p.level || 1}`;
      return callTgApi(BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: card, parse_mode: 'HTML' });
    }
    if (text === '💖 ارسال آیدی تلگرام') {
      const partnerId = activePairs.get(userId);
      const myUsername = msg.from.username ? `@${msg.from.username}` : `[پروفایل کاربر](tg://user?id=${userId})`;
      callTgApi(BOT_TOKEN, 'sendMessage', {
        chat_id: partnerId,
        text: `💖 <b>هم‌صحبت شما آیدی تلگرامش را به اشتراک گذاشت:</b>\n👉 ${myUsername}`,
        parse_mode: 'HTML'
      });
      return callTgApi(BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: '✅ آیدی تلگرام شما برای هم‌صحبت ارسال شد.' });
    }

    // Relay regular message
    const partnerId = activePairs.get(userId);
    return relayMessage(BOT_TOKEN, msg, partnerId);
  }

  // Regular Commands
  if (text.startsWith('/start') || text === '🔙 بازگشت به منوی اصلی') {
    return sendDatingDashboard(chatId, userId);
  }

  if (text === '💬 شروع چت ناشناس و دوستیابی' || text === '/chat') {
    return sendFilterMenu(BOT_TOKEN, chatId, userId);
  }

  if (text === '🌈 چت بر اساس حس‌وحال (مود)') {
    return sendMoodSelectMenu(BOT_TOKEN, chatId, userId);
  }

  if (text === '👑 تالار گفتگوی VIP') {
    const user = getUser(userId);
    if (!user.is_vip) {
      return callTgApi(BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        text: '👑 <b>تالار گفتگوی ویژه اعضای VIP</b>\nبرای ورود به این تالار نیاز به اشتراک VIP دارید.',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: '⭐ فعال‌سازی VIP', callback_data: 'shop_buy_vip' }]]
        }
      });
    }
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '👑 <b>به تالار گفتگوی رویال VIP خوش آمدید!</b>\nدر این بخش می‌توانید آزادانه با سایر اعضای ویژه در ارتباط باشید.',
      parse_mode: 'HTML'
    });
  }

  if (text === '👤 پروفایل و کارمای من') {
    const user = getUser(userId);
    const textCard = `👤 <b>کارت هویت کاربری شما در حُذا:</b>\n\n` +
                     `🏷️ نام: <b>${user.name || 'کاربر'}</b>\n` +
                     `⭐ کارمای اخلاق: <b>${user.karma || 100} امتیاز</b>\n` +
                     `🪙 سکه: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
                     `🏆 سطح: <b>Level ${user.level || 1}</b> (${user.xp || 0} XP)\n` +
                     `🔥 استریک ورود: <b>${user.streak_days || 1} روز</b>`;
    return callTgApi(BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: textCard, parse_mode: 'HTML' });
  }

  if (text === '💎 کیف‌پول و شارژ سکه') {
    return sendFinanceHub(BOT_TOKEN, chatId, userId);
  }

  return sendDatingDashboard(chatId, userId);
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

  if (data === 'back_to_chat_filters') return sendFilterMenu(BOT_TOKEN, chatId, userId);
  if (data === 'open_mood_menu') return sendMoodSelectMenu(BOT_TOKEN, chatId, userId);
  if (data === 'open_other_filters') return sendOtherFiltersMenu(BOT_TOKEN, chatId, userId);

  if (data === 'filter_random') return executeMatchSearch(BOT_TOKEN, chatId, userId, 'random');
  if (data === 'filter_female') return executeMatchSearch(BOT_TOKEN, chatId, userId, 'female');
  if (data === 'filter_male') return executeMatchSearch(BOT_TOKEN, chatId, userId, 'male');
  if (data === 'filter_province') return executeMatchSearch(BOT_TOKEN, chatId, userId, 'province');
  if (data === 'filter_samelang') return executeMatchSearch(BOT_TOKEN, chatId, userId, 'samelang');
  if (data === 'filter_global') return executeMatchSearch(BOT_TOKEN, chatId, userId, 'global');

  if (data.startsWith('mood_match_')) {
    return executeMatchSearch(BOT_TOKEN, chatId, userId, data);
  }

  if (data === 'cancel_chat_search') {
    const idx = waitingQueue.findIndex(q => q.userId === userId);
    if (idx > -1) waitingQueue.splice(idx, 1);
    return callTgApi(BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: '✅ جستجوی هم‌صحبت لغو شد.' });
  }

  if (data.startsWith('send_gift_')) {
    return handleSendGift(BOT_TOKEN, userId, data.replace('send_gift_', ''));
  }

  if (data.startsWith('rate_karma_')) {
    const parts = data.replace('rate_karma_', '').split('_');
    const targetUserId = parts[0];
    const target = getUser(targetUserId);
    target.karma = (target.karma || 100) + 5;
    saveDb();
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🙏 از ثبت نظر شما متشکریم! (+۵ امتیاز اخلاق به هم‌صحبت اضافه شد)'
    });
  }

  // Shop & Economy
  if (data === 'shop_buy_coins') {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🪙 <b>شارژ سکه برای فیلترهای دختر/پسر و ارسال هدایا:</b>',
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
      text: '👑 <b>پلن‌های اشتراک VIP حُذا:</b>\nفیلتر نامحدود دختر/پسر، تالار چت VIP و نشان تاج طلایی!',
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
const runner = new TelegramBotRunner('Whoza Dating Bot', BOT_TOKEN, {
  onMessage,
  onCallback,
  onPayment: (msg) => handlePaymentSuccess(BOT_TOKEN, msg),
  onPreCheckout: (pcq) => handlePreCheckout(BOT_TOKEN, pcq)
});

async function start() {
  await runner.init({
    menuButton: {
      text: '💬 چت‌روم‌ها و اکسپلور',
      url: `${CONFIG.WEBAPP_URL}#/chat`
    },
    commands: [
      { command: 'start', description: '🚀 منوی اصلی حُذا' },
      { command: 'chat', description: '💬 شروع چت ناشناس' },
      { command: 'stop', description: '🛑 پایان گفتگو' },
      { command: 'next', description: '⏭️ هم‌صحبت بعدی' },
      { command: 'profile', description: '👤 پروفایل و کارما' },
      { command: 'wallet', description: '💎 کیف‌پول و شارژ' }
    ]
  });

  runner.startPolling();
}

if (require.main === module) {
  start().catch(err => {
    console.error('Fatal error starting Whoza bot:', err);
  });
}

module.exports = { runner, start };
