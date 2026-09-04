/**
 * ============================================================================
 * 🎮 چاژا (Chazha) Gaming & Online Arcade Bot (@chazha_bot)
 * ============================================================================
 */

const { CONFIG } = require('../../shared/config');
const { db, saveDb, getUser, updateUser, checkDailyStreak } = require('../../shared/db');
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
      // ۱. کارت‌های رسمی بازی تلگرام (HTML5 Game)
      [{ text: '🪵 بازی تخته نرد شاهانه (Play) 🎲' }],
      // ۲. بازی‌های فوری و زنده در کادر پیام (بدون مینی‌اپ)
      [{ text: '🪨 سنگ، کاغذ، قیچی ✂️' }, { text: '🎲 دوئل رولت تاس' }],
      [{ text: '🧠 مسابقه اطلاعات عمومی (کوئیز)' }, { text: '🎡 گردونه شانس روزانه' }],
      // ۳. لیدربورد و شارژ
      [{ text: '🏆 رتبه‌بندی قهرمانان' }, { text: '💎 کیف‌پول و شارژ سکه' }],
      // ۴. ورود به آرکید مینی‌اپ چاژا
      [{
        text: '🌟 ورود به آرکید مینی‌اپ (۱۰+ بازی آنلاین) 🎮',
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

  const text = `🎮 <b>به چاژا (کنسول بازی و دوئل‌های آنلاین) خوش آمدید!</b>\n\n` +
               `👤 بازیکن: <b>${user.name || 'کاربر چاژا'}</b> (Level ${user.level || 1})\n` +
               `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
               `⚡ تجربه: <b>${user.xp || 0} XP</b>\n\n` +
               `<b>🗂 دسته‌بندی بازی‌ها:</b>\n` +
               `• 🪵 <b>کارت‌های بازی تلگرام:</b> تخته نرد شاهانه با کارت رسمی و دکمه Play\n` +
               `• ⚡ <b>بازی‌های درون پیام:</b> سنگ‌کاغذقیچی، تاس، مسابقه اطلاعات عمومی و گردونه\n` +
               `• 🌟 <b>آرکید مینی‌اپ:</b> منچ، شطرنج، بیلیارد و ۱۰ بازی آنلاین دیگر\n\n` +
               `یکی از گزینه‌ها را برای شروع انتخاب کنید:`;

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

  // Handling Direct Duel Challenge Links (e.g. /start duel_backgammon_ZEN1234)
  if (text.startsWith('/start duel_backgammon_')) {
    const roomCode = text.replace('/start duel_backgammon_', '').trim();
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `⚔️ <b>دعوت‌نامه دوئل تخته نرد چاژا!</b>\n\n` +
            `شما به اتاق مسابقه <code>${roomCode}</code> دعوت شده‌اید!\n` +
            `آماده‌اید هوش و شانس خود را در تخته نرد محک بزنید؟`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{
            text: '🪵 ورود به تخته نرد و شروع مسابقه 🎲',
            web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/backgammon?room=${roomCode}&mode=online` }
          }]
        ]
      }
    });
  }

  if (text.startsWith('/start') || text === '🔙 بازگشت به منوی بازی‌ها') {
    return sendGamesDashboard(chatId, userId);
  }

  if (text.includes('تخته نرد') || text === '/backgammon') {
    return callTgApi(BOT_TOKEN, 'sendGame', {
      chat_id: chatId,
      game_short_name: 'backgammon',
      reply_markup: {
        inline_keyboard: [
          // Row 1: The official Game Play button (must be first)
          [{ text: '🪵 شروع بازی تخته نرد (Play) 🎲', callback_game: {} }],
          // Row 2: Send Challenge to friends/groups
          [{ text: '🚀 ارسال درخواست مسابقه به دوستان ⚔️', switch_inline_query: 'duel' }],
          // Row 3: Solo vs Bot & Choose Theme
          [
            { text: '🤖 بازی تک‌نفره با ربات', callback_data: 'bg_play_bot' },
            { text: '🎨 تغییر تم تخته نرد', callback_data: 'bg_themes_menu' }
          ]
        ]
      }
    });
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

  // 1. Telegram Game Launcher (Play Backgammon, etc.)
  if (cq.game_short_name) {
    return callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
      callback_query_id: cq.id,
      url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/${cq.game_short_name}`
    });
  }

  // 2. Normal callback acknowledge
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

  // ----------------------------------------------------
  // BACKGAMMON ACTION BUTTONS
  // ----------------------------------------------------
  // 1. Play Solo vs Bot
  if (data === 'bg_play_bot') {
    const user = getUser(userId);
    const curTheme = user.backgammonTheme || 'wood';
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🤖 <b>بازی تک‌نفره تخته نرد با ربات هوشمند چاژا:</b>\nدرجه سختی مسابقه را انتخاب کنید:',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🟢 مبتدی (Easy)', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/backgammon?mode=bot&diff=easy&theme=${curTheme}` } },
            { text: '🟡 متوسط (Medium)', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/backgammon?mode=bot&diff=medium&theme=${curTheme}` } },
            { text: '🔴 استاد (Master)', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/backgammon?mode=bot&diff=master&theme=${curTheme}` } }
          ],
          [{ text: '🪵 ورود مستقیم به تخته با ربات 🎲', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/backgammon?mode=bot&theme=${curTheme}` } }]
        ]
      }
    });
  }

  // 2. Themes Selection Menu (Free & Future Stars Themes)
  if (data === 'bg_themes_menu') {
    const user = getUser(userId);
    const curTheme = user.backgammonTheme || 'wood';
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `🎨 <b>انتخاب تم ظاهری تخته نرد چاژا:</b>\n\n` +
            `تم‌های فعلی برای تمامی کاربران <b>کاملاً رایگان</b> هستند.\n` +
            `⭐ تم‌های سلطنتی و سفارشی در آینده با <b>تلگرام استارز (Stars)</b> قابل خریداری خواهند بود.\n\n` +
            `تم مورد نظر خود را انتخاب کنید:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: `${curTheme === 'wood' ? '✅ ' : ''}🪵 چوب گردو کلاسیک (رایگان)`, callback_data: 'bg_set_theme_wood' }
          ],
          [
            { text: `${curTheme === 'persia' ? '✅ ' : ''}🏛️ تخت جمشید باستان (رایگان)`, callback_data: 'bg_set_theme_persia' }
          ],
          [
            { text: `${curTheme === 'cosmic' ? '✅ ' : ''}🌌 کهکشان کیهانی (رایگان)`, callback_data: 'bg_set_theme_cosmic' }
          ],
          [
            { text: '👑 طلای سلطنتی ۲۴ عیار (⭐ بزودی با Stars)', callback_data: 'bg_theme_stars_preview_gold' }
          ],
          [
            { text: '⚡ نئون سایبرپانک ۲۰۷۷ (⭐ بزودی با Stars)', callback_data: 'bg_theme_stars_preview_cyber' }
          ]
        ]
      }
    });
  }

  // 3. Set Free Theme
  if (data.startsWith('bg_set_theme_')) {
    const selected = data.replace('bg_set_theme_', '');
    updateUser(userId, { backgammonTheme: selected });
    const names = { wood: 'چوب گردو کلاسیک', persia: 'تخت جمشید باستان', cosmic: 'کهکشان کیهانی' };
    return callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
      callback_query_id: cq.id,
      text: `✅ تم تخته نرد با موفقیت روی «${names[selected] || selected}» تنظیم شد!`,
      show_alert: true
    });
  }

  // 4. Preview Stars Themes
  if (data.startsWith('bg_theme_stars_preview_')) {
    return callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
      callback_query_id: cq.id,
      text: '⭐ این تم لوکس اختصاصی در آپدیت بعدی با پرداخت Telegram Stars قابل خرید خواهد بود!',
      show_alert: true
    });
  }

  // 5. Decline Duel Challenge (Bilingual Decline Notice + Ad for Chazha)
  if (data.startsWith('bg_decline_duel')) {
    const declinerName = cq.from.first_name || 'کاربر';
    const declineText = `🚫 <b>درخواست مسابقه توسط ${declinerName} رد شد!</b>\n\n` +
      `🌟 <b>اما چاژا پر از هیجانه!</b> شما هم می‌توانید همین الان وارد کنسول بازی‌های چاژا شوید و بیش از ۱۵ بازی دونفره و جذاب را رایگان بازی کنید و سکه ببرید:\n` +
      `👉 @chazha_bot\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🇬🇧 <b>Challenge declined by ${declinerName}!</b>\n` +
      `🌟 But the fun never stops! Join Chazha Games right now, play 15+ multiplayer games for free, and win coins:\n` +
      `👉 @chazha_bot`;

    const editPayload = {
      text: declineText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎮 ورود به چاژا | Join Chazha 🚀', url: 'https://t.me/chazha_bot' }]
        ]
      }
    };

    if (cq.inline_message_id) {
      editPayload.inline_message_id = cq.inline_message_id;
    } else if (cq.message) {
      editPayload.chat_id = cq.message.chat.id;
      editPayload.message_id = cq.message.message_id;
    }

    return callTgApi(BOT_TOKEN, 'editMessageText', editPayload)
      .catch(err => console.warn('[Chazha] Edit decline msg error:', err.message));
  }
}

// ----------------------------------------------------
// INLINE QUERY ROUTER (For sharing games in any chat)
// ----------------------------------------------------
async function onInlineQuery(iq) {
  const senderName = iq.from.first_name || 'کاربر چاژا';
  const senderId = iq.from.id;
  const roomCode = `CHZ-${senderId}`;
  const duelGameUrl = `${CONFIG.WEBAPP_URL}?app=chazha#/games/backgammon?room=${roomCode}&mode=online`;

  const results = [
    // 1. Interactive Duel Challenge Card (with Accept & Decline buttons)
    {
      type: 'article',
      id: 'duel_challenge_' + senderId,
      title: `⚔️ ارسال چالش مسابقه تخته نرد (با ${senderName})`,
      description: 'ارسال کارت دعوت با دکمه‌های قبول درخواست مسابقه یا رد درخواست',
      thumb_url: 'https://zen.moeid.net/icons/icon-192.svg',
      input_message_content: {
        message_text: `🪵 <b>چالش دوئل تخته نرد چاژا!</b>\n\n` +
                      `👤 <b>${senderName}</b> شما را به یک مسابقه هیجان‌انگیز تخته نرد دعوت کرده است! 🎲\n\n` +
                      `آیا جرات دارید این چالش را قبول کنید و هوش خود را محک بزنید؟`,
        parse_mode: 'HTML'
      },
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '✅ قبول درخواست (شروع مسابقه) 🎲',
              url: duelGameUrl
            }
          ],
          [
            {
              text: '❌ رد درخواست مسابقه',
              callback_data: `bg_decline_duel_${senderId}`
            }
          ]
        ]
      }
    },
    // 2. Direct Game Result
    {
      type: 'game',
      id: 'game_backgammon',
      game_short_name: 'backgammon'
    }
  ];

  return callTgApi(BOT_TOKEN, 'answerInlineQuery', {
    inline_query_id: iq.id,
    results: results,
    cache_time: 1
  }).catch(err => console.warn('[Chazha] Inline query notice:', err.message));
}

// ----------------------------------------------------
// RUNNER INITIALIZATION
// ----------------------------------------------------
const runner = new TelegramBotRunner('Chazha Games Bot', BOT_TOKEN, {
  onMessage,
  onCallback,
  onInlineQuery,
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
      { command: 'backgammon', description: '🪵 بازی تخته نرد' },
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
