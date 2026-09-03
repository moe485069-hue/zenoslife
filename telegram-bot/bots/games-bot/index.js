/**
 * ============================================================================
 * 🎮 چاژا (Chazha) Gaming & Online Arcade Bot (@chazha_bot)
 * ============================================================================
 */

const { CONFIG } = require('../../shared/config');
const { db, saveDb, getUser, checkDailyStreak } = require('../../shared/db');
const { TelegramBotRunner, callTgApi } = require('../../shared/telegram');
const {
  sendInvoiceForPackage,
  sendInvoiceForVip,
  handlePreCheckout,
  handlePaymentSuccess,
  sendFinanceHub
} = require('../../shared/economy');

const {
  playRpsVsBot,
  playDiceVsBot,
  sendTriviaQuestion,
  handleTriviaAnswer,
  spinWheel,
  sendGameLeaderboard
} = require('./games-engine');

const BOT_TOKEN = CONFIG.BOT_TOKEN_GAMES;

function getGamesReplyKeyboard() {
  return {
    keyboard: [
      [{ text: '🪨 سنگ، کاغذ، قیچی ✂️' }, { text: '🎲 دوئل رولت تاس' }],
      [{ text: '🧠 مسابقه اطلاعات عمومی (کوئیز)' }, { text: '🎡 گردونه شانس روزانه' }],
      [{ text: '🏆 رتبه‌بندی قهرمانان' }, { text: '💎 کیف‌پول و شارژ سکه' }],
      [{
        text: '🌟 ورود به آرکید چاژا (۱۰+ بازی آنلاین) 🎮',
        web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games` }
      }]
    ],
    resize_keyboard: true
  };
}

async function sendGamesDashboard(chatId, userId) {
  const user = getUser(userId);
  const streak = checkDailyStreak(userId);

  if (streak && streak.days > 1) {
    callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `🔥 <b>استریک روزانه بازی چاژا!</b>\nشما ${streak.days} روز متوالی وارد شدید!\n🎁 پاداش: <b>+${streak.coins} سکه و +${streak.xp} XP</b>`,
      parse_mode: 'HTML'
    }).catch(() => {});
  }

  const text = `🎮 <b>به چاژا (مرکز بازی و دوئل‌های آنلاین زنوسلایف) خوش آمدید!</b>\n\n` +
               `👤 بازیکن: <b>${user.name || 'کاربر چاژا'}</b> (Level ${user.level || 1})\n` +
               `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
               `⚡ تجربه: <b>${user.xp || 0} XP</b>\n\n` +
               `یکی از بازی‌ها را انتخاب کنید یا مستقیماً وارد آرکید مینی‌اپ شوید:`;

  return callTgApi(BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: getGamesReplyKeyboard()
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

  if (text.startsWith('/start') || text === '🔙 بازگشت به منوی بازی‌ها') {
    return sendGamesDashboard(chatId, userId);
  }

  if (text === '🪨 سنگ، کاغذ، قیچی ✂️') {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🪨📄✂️ <b>سنگ، کاغذ، قیچی با چاژا:</b>\nحرکت خود را انتخاب کنید:',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🪨 سنگ', callback_data: 'bot_rps_rock' },
            { text: '📄 کاغذ', callback_data: 'bot_rps_paper' },
            { text: '✂️ قیچی', callback_data: 'bot_rps_scissors' }
          ]
        ]
      }
    });
  }

  if (text === '🎲 دوئل رولت تاس') {
    return playDiceVsBot(BOT_TOKEN, chatId, userId);
  }

  if (text === '🧠 مسابقه اطلاعات عمومی (کوئیز)') {
    return sendTriviaQuestion(BOT_TOKEN, chatId, userId);
  }

  if (text === '🎡 گردونه شانس روزانه') {
    return spinWheel(BOT_TOKEN, chatId, userId);
  }

  if (text === '🏆 رتبه‌بندی قهرمانان') {
    return sendGameLeaderboard(BOT_TOKEN, chatId);
  }

  if (text === '💎 کیف‌پول و شارژ سکه') {
    return sendFinanceHub(BOT_TOKEN, chatId, userId);
  }

  return sendGamesDashboard(chatId, userId);
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

  if (data === 'prompt_mode_rps') {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🪨📄✂️ حرکت خود را انتخاب کنید:',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🪨 سنگ', callback_data: 'bot_rps_rock' },
            { text: '📄 کاغذ', callback_data: 'bot_rps_paper' },
            { text: '✂️ قیچی', callback_data: 'bot_rps_scissors' }
          ]
        ]
      }
    });
  }

  if (data.startsWith('bot_rps_')) {
    const move = data.replace('bot_rps_', '');
    return playRpsVsBot(BOT_TOKEN, chatId, userId, move);
  }

  if (data === 'play_bot_dice') {
    return playDiceVsBot(BOT_TOKEN, chatId, userId);
  }

  if (data === 'play_trivia_quiz') {
    return sendTriviaQuestion(BOT_TOKEN, chatId, userId);
  }

  if (data.startsWith('ans_trivia_')) {
    const parts = data.replace('ans_trivia_', '').split('_');
    const quizId = parts[0];
    const selectedIdx = parseInt(parts[1], 10);
    return handleTriviaAnswer(BOT_TOKEN, chatId, userId, quizId, selectedIdx);
  }

  if (data === 'spin_wheel_action') {
    return spinWheel(BOT_TOKEN, chatId, userId);
  }

  if (data === 'view_leaderboard') {
    return sendGameLeaderboard(BOT_TOKEN, chatId);
  }

  // Shop Callbacks
  if (data === 'shop_buy_coins') {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🪙 <b>بسته‌های سکه بازی چاژا:</b>\nبرای خرید با تلگرام استارز، بسته مورد نظر را انتخاب کنید:',
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
      text: '👑 <b>پلن‌های اشتراک VIP:</b>\n۲۰٪ بانس XP و سکه مضاعف در تمامی بازی‌ها!',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🥉 هفتگی (۷۵ ⭐)', callback_data: 'buy_vip_7' }],
          [{ text: '🥈 ماهانه (۲۵۰ ⭐)', callback_data: 'buy_vip_30' }],
          [{ text: '👑 سه ماهه طلایی (۶۵۰ ⭐)', callback_data: 'buy_vip_90' }]
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
const runner = new TelegramBotRunner('Chazha Games Bot', BOT_TOKEN, {
  onMessage,
  onCallback,
  onPayment: (msg) => handlePaymentSuccess(BOT_TOKEN, msg),
  onPreCheckout: (pcq) => handlePreCheckout(BOT_TOKEN, pcq)
});

async function start() {
  await runner.init({
    menuButton: {
      text: '🎮 آرکید بازی‌های چاژا',
      url: `${CONFIG.WEBAPP_URL}?app=chazha#/games`
    },
    commands: [
      { command: 'start', description: '🚀 منوی بازی‌های چاژا' },
      { command: 'games', description: '🎮 بازی‌ها و دوئل‌ها' },
      { command: 'wheel', description: '🎡 گردونه شانس روزانه' },
      { command: 'top', description: '🏆 جدول قهرمانان' },
      { command: 'wallet', description: '💎 کیف‌پول و سکه‌ها' }
    ]
  });

  runner.startPolling();
}

if (require.main === module) {
  start().catch(err => {
    console.error('Fatal error starting Chazha bot:', err);
  });
}

module.exports = { runner, start };
