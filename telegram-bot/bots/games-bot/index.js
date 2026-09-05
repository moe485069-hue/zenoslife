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

// ----------------------------------------------------
// MAIN PERSISTENT KEYBOARD (4-SECTION ARCHITECTURE)
// Row 1 (Top single): Games & Tournaments
// Row 2 (3 buttons): Wallet, Profile, Settings
// ----------------------------------------------------
function getMainReplyKeyboard(lang = 'fa') {
  const isEn = lang === 'en';
  return {
    keyboard: [
      // Row 1: Single button on top (تکی در بالا)
      [{ text: isEn ? '🎮 Games & Tournaments' : '🎮 بازی‌ها و مسابقات آنلاین' }],
      // Row 2: 3 buttons side-by-side (۳تایی زیر دکمه اول)
      [
        { text: isEn ? '💎 Wallet & Coins' : '💎 کیف‌پول و سکه' },
        { text: isEn ? '👤 My Profile' : '👤 پروفایل من' },
        { text: isEn ? '⚙️ Settings' : '⚙️ تنظیمات' }
      ]
    ],
    resize_keyboard: true
  };
}

// 0. Welcome / Start Dashboard
async function sendGamesDashboard(chatId, userId) {
  const user = getUser(userId);
  const isEn = user.lang === 'en';
  const streak = checkDailyStreak(userId);

  if (streak && streak.days > 1) {
    const streakMsg = isEn
      ? `🔥 <b>Daily Streak Bonus!</b>\nYou logged in ${streak.days} days in a row!\n🎁 Reward: <b>+${streak.coins} Coins & +${streak.xp} XP</b>`
      : `🔥 <b>استریک روزانه بازی چاژا!</b>\nشما ${streak.days} روز متوالی وارد شدید!\n🎁 پاداش: <b>+${streak.coins} سکه و +${streak.xp} XP</b>`;
    callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: streakMsg,
      parse_mode: 'HTML'
    }).catch(() => {});
  }

  const text = isEn
    ? `🎮 <b>Welcome to Chazha Gaming & Online Arcade!</b>\n\n` +
      `👤 Player: <b>${user.name || 'Chazha Player'}</b> (Level ${user.level || 1})\n` +
      `🪙 Coins: <b>${(user.coins || 0).toLocaleString()}</b> | ⚡ XP: <b>${user.xp || 0}</b>\n\n` +
      `Use the menu buttons below to play games, manage your wallet, view your profile, and configure settings:`
    : `🎮 <b>به چاژا (کنسول بازی و دوئل‌های آنلاین) خوش آمدید!</b>\n\n` +
      `👤 بازیکن: <b>${user.name || 'کاربر چاژا'}</b> (Level ${user.level || 1})\n` +
      `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b> | ⚡ تجربه: <b>${user.xp || 0} XP</b>\n\n` +
      `از منوی زیر برای دسترسی به بازی‌ها، کیف‌پول، پروفایل و تنظیمات استفاده کنید:`;

  return callTgApi(BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: getMainReplyKeyboard(user.lang || 'fa')
  });
}

// SECTION 1: Games & Tournaments Hub
async function sendGamesMenu(chatId, userId) {
  const user = getUser(userId);
  const isEn = user.lang === 'en';

  const text = isEn
    ? `🎮 <b>Chazha Games & Online Tournaments Hub</b>\n\n` +
      `👤 Player: <b>${user.name || 'Chazha Player'}</b> (Level ${user.level || 1})\n` +
      `🪙 Coins: <b>${(user.coins || 0).toLocaleString()}</b> | ⚡ XP: <b>${user.xp || 0}</b>\n\n` +
      `Select a game below to play live or challenge friends:`
    : `🎮 <b>کنسول بازی‌ها و مسابقات آنلاین چاژا</b>\n\n` +
      `👤 بازیکن: <b>${user.name || 'کاربر چاژا'}</b> (سطح ${user.level || 1})\n` +
      `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b> | ⚡ تجربه: <b>${user.xp || 0} XP</b>\n\n` +
      `یک بازی را برای شروع انتخاب کنید:`;

  const keyboard = [
    // 1. Royal Backgammon HTML5 Game Card
    [{ text: isEn ? '🪵 Play Royal Backgammon 🎲' : '🪵 بازی تخته نرد شاهانه (Play) 🎲', callback_data: 'launch_backgammon_card' }],
    // 2. Fast Duels
    [
      { text: isEn ? '🪨 Rock Paper Scissors ✂️' : '🪨 سنگ، کاغذ، قیچی ✂️', callback_data: 'prompt_mode_rps' },
      { text: isEn ? '🎲 Dice Duel' : '🎲 دوئل رولت تاس', callback_data: 'play_bot_dice' }
    ],
    // 3. Quiz & Lucky Wheel
    [
      { text: isEn ? '🧠 Trivia Quiz' : '🧠 مسابقه اطلاعات عمومی (کوئیز)', callback_data: 'play_trivia_quiz' },
      { text: isEn ? '🎡 Daily Lucky Wheel' : '🎡 گردونه شانس روزانه', callback_data: 'spin_wheel_action' }
    ],
    // 4. Lounge & Mini-App Arcade
    [{ text: isEn ? '🎪 Games Lounge & Live Chat 💬' : '🎪 سالن بزرگ بازی‌ها و گپ‌وگفت زنده 💬', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } }],
    [{ text: isEn ? '🌟 Open Arcade Mini-App (10+ Games) 🚀' : '🌟 ورود به آرکید مینی‌اپ (۱۰+ بازی آنلاین) 🎮', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games` } }],
    // 5. Leaderboard
    [{ text: isEn ? '🏆 Champion Leaderboard' : '🏆 رتبه‌بندی قهرمانان', callback_data: 'view_leaderboard' }]
  ];

  return callTgApi(BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard }
  });
}

// SECTION 2: Wallet & Coins Hub
async function sendWalletMenu(chatId, userId) {
  const user = getUser(userId);
  const isEn = user.lang === 'en';

  const text = isEn
    ? `💎 <b>Wallet, Coins & VIP Membership</b>\n\n` +
      `🪙 Coins Balance: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
      `👑 VIP Status: <b>${user.is_vip ? 'Active Royal VIP ⭐' : 'Standard Member'}</b>\n` +
      `⚡ XP: <b>${user.xp || 0}</b> | 🏆 Level: <b>${user.level || 1}</b>\n\n` +
      `Choose an option below to buy or earn coins:`
    : `💎 <b>کیف‌پول، موجودی سکه و اشتراک VIP</b>\n\n` +
      `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
      `👑 وضعیت اشتراک: <b>${user.is_vip ? 'VIP طلایی فعال ⭐' : 'عادی'}</b>\n` +
      `⚡ تجربه: <b>${user.xp || 0} XP</b> | 🏆 سطح: <b>${user.level || 1}</b>\n\n` +
      `برای شارژ سکه یا دریافت پاداش رایگان یکی از گزینه‌ها را انتخاب کنید:`;

  const keyboard = [
    [{ text: isEn ? '🪙 Buy Coin Packs (Stars ⭐)' : '🪙 خرید بسته‌های سکه (با تلگرام استارز ⭐)', callback_data: 'shop_buy_coins' }],
    [{ text: isEn ? '👑 Upgrade to VIP Pass' : '👑 ارتقا به VIP (سکه و XP مضاعف)', callback_data: 'shop_buy_vip' }],
    [
      { text: isEn ? '🎁 Daily Spin Bonus' : '🎁 گردونه شانس روزانه', callback_data: 'spin_wheel_action' },
      { text: isEn ? '👥 Invite Friends (+500 Coins)' : '👥 دعوت دوستان (+۵۰۰ سکه)', callback_data: 'show_referral' }
    ],
    [{ text: isEn ? '🏆 Leaderboard' : '🏆 جدول قهرمانان', callback_data: 'view_leaderboard' }]
  ];

  return callTgApi(BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard }
  });
}

// SECTION 3: Player Profile Hub
async function sendProfileMenu(chatId, userId) {
  const user = getUser(userId);
  const isEn = user.lang === 'en';

  const friendsCount = (user.friends || []).length;
  const refsCount = (user.referrals || []).length;

  const text = isEn
    ? `👤 <b>Player Profile Card</b>\n\n` +
      `🏷️ Name: <b>${user.name || 'Chazha Player'}</b>\n` +
      `🆔 User ID: <code>${userId}</code>\n` +
      `🏆 Level: <b>Level ${user.level || 1}</b> (${user.xp || 0} XP)\n` +
      `🪙 Coins: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
      `👑 VIP: <b>${user.is_vip ? 'Active Royal VIP ⭐' : 'Standard Member'}</b>\n` +
      `🔥 Daily Streak: <b>${user.streak_days || 1} Days</b>\n` +
      `🤝 Friends: <b>${friendsCount} Friends</b>\n` +
      `👥 Referrals: <b>${refsCount} Invited</b>\n\n` +
      `Choose an action:`
    : `👤 <b>کارت پروفایل و کارنامه بازیکن</b>\n\n` +
      `🏷️ نام: <b>${user.name || 'کاربر چاژا'}</b>\n` +
      `🆔 شناسه کاربری: <code>${userId}</code>\n` +
      `🏆 سطح: <b>سطح ${user.level || 1}</b> (${user.xp || 0} XP)\n` +
      `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
      `👑 اشتراک VIP: <b>${user.is_vip ? 'VIP طلایی فعال ⭐' : 'کاربر عادی'}</b>\n` +
      `🔥 استریک روزانه: <b>${user.streak_days || 1} روز متوالی</b>\n` +
      `🤝 دوستان چاژا: <b>${friendsCount} نفر</b>\n` +
      `👥 زیرمجموعه‌ها: <b>${refsCount} نفر</b>\n\n` +
      `یک گزینه را انتخاب کنید:`;

  const keyboard = [
    [{ text: isEn ? `🤝 My Friends List (${friendsCount})` : `🤝 لیست دوستان چاژا (${friendsCount} نفر)`, callback_data: 'profile_view_friends' }],
    [
      { text: isEn ? '🚀 Invite Friends Link' : '🚀 لینک اختصاصی دعوت و پاداش', callback_data: 'show_referral' },
      { text: isEn ? '🎨 Board Themes' : '🎨 تم‌های تخته نرد', callback_data: 'bg_themes_menu' }
    ]
  ];

  return callTgApi(BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard }
  });
}

// SECTION 4: Settings Hub
async function sendSettingsMenu(chatId, userId) {
  const user = getUser(userId);
  const isEn = user.lang === 'en';

  const themeNames = { wood: 'چوب گردو کلاسیک', persia: 'تخت جمشید باستان', cosmic: 'کهکشان کیهانی' };
  const themeNamesEn = { wood: 'Classic Walnut Wood', persia: 'Ancient Persepolis', cosmic: 'Cosmic Galaxy' };
  const curThemeName = isEn ? (themeNamesEn[user.backgammonTheme] || 'Classic Wood') : (themeNames[user.backgammonTheme] || 'چوب گردو');

  const text = isEn
    ? `⚙️ <b>Chazha Bot Settings</b>\n\n` +
      `🌐 Current Language: <b>🇬🇧 English</b>\n` +
      `🎨 Default Backgammon Theme: <b>${curThemeName}</b>\n` +
      `🔔 Notifications: <b>${user.notificationsDisabled ? '🔕 Muted' : '🔔 Enabled'}</b>\n\n` +
      `Tap a button below to configure:`
    : `⚙️ <b>تنظیمات حساب کاربری چاژا</b>\n\n` +
      `🌐 زبان فعلی: <b>🇮🇷 فارسی</b>\n` +
      `🎨 تم فعال تخته نرد: <b>${curThemeName}</b>\n` +
      `🔔 وضعیت اعلان‌ها: <b>${user.notificationsDisabled ? '🔕 غیرفعال' : '🔔 فعال'}</b>\n\n` +
      `برای تغییر هر بخش، روی دکمه مربوطه بزنید:`;

  const keyboard = [
    [{ text: '🌐 تغییر زبان | Change Language', callback_data: 'settings_change_lang' }],
    [{ text: isEn ? '🎨 Backgammon Theme' : '🎨 انتخاب تم پیش‌فرض تخته نرد', callback_data: 'bg_themes_menu' }],
    [{ text: user.notificationsDisabled ? (isEn ? '🔔 Enable Notifications' : '🔔 فعال‌سازی اعلان‌ها') : (isEn ? '🔕 Mute Notifications' : '🔕 بی‌صدا کردن اعلان‌ها'), callback_data: 'settings_toggle_notif' }]
  ];

  return callTgApi(BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard }
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

  const isStartWithRoom = text.startsWith('/start room_') || 
                          text.startsWith('/start duel_') || 
                          text.startsWith('/start room-') || 
                          text.startsWith('/start CHZ-') || 
                          text.startsWith('/start BACK-') || 
                          text.startsWith('/start NARD-');

  if (isStartWithRoom) {
    let roomCode = '';
    let gameType = 'backgammon';
    let gameName = 'تخته نرد';

    if (text.startsWith('/start room_')) {
      roomCode = text.replace('/start room_', '').trim();
    } else if (text.startsWith('/start room-')) {
      roomCode = text.replace('/start room-', '').trim();
    } else if (text.startsWith('/start duel_backgammon_')) {
      roomCode = text.replace('/start duel_backgammon_', '').trim();
    } else if (text.startsWith('/start duel_')) {
      const parts = text.replace('/start duel_', '').trim().split('_');
      gameType = parts[0] || 'backgammon';
      roomCode = parts[1] || 'ROOM1';
    } else if (text.startsWith('/start ')) {
      roomCode = text.replace('/start ', '').trim();
    }

    if (roomCode.startsWith('HOKM-')) { gameType = 'hokm'; gameName = 'حکم آنلاین'; }
    else if (roomCode.startsWith('LUDO-')) { gameType = 'ludo'; gameName = 'منچ آنلاین'; }
    else if (roomCode.startsWith('PASS-')) { gameType = 'pasur'; gameName = 'پاسور چهاربرگ'; }
    else if (roomCode.startsWith('BILL-')) { gameType = 'billiards'; gameName = 'بیلیارد'; }
    else if (roomCode.startsWith('CHSS-')) { gameType = 'cosmic_chess'; gameName = 'شطرنج'; }
    else {
      const names = { backgammon: 'تخته نرد', hokm: 'حکم', ludo: 'منچ', pasur: 'پاسور', billiards: 'بیلیارد' };
      gameName = names[gameType] || 'تخته نرد';
    }

    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `⚔️ <b>دعوت‌نامه دوئل ${gameName} چاژا!</b>\n\n` +
            `شما به اتاق مسابقه <code>${roomCode}</code> دعوت شده‌اید!\n` +
            `آماده‌اید هوش و مهارت خود را محک بزنید؟ برای شروع روی دکمه زیر بزنید:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{
            text: `🎲 ورود و شروع بازی ${gameName}`,
            web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/${gameType}?room=${roomCode}&mode=online&role=black&autostart=1` }
          }]
        ]
      }
    });
  }

  // Handle Friend Request link from In-Game Profile (/start friend_<senderId>)
  if (text.startsWith('/start friend_')) {
    const targetFriendId = text.replace('/start friend_', '').trim();
    const friendUser = getUser(targetFriendId);
    const currentUser = getUser(userId, msg.from.first_name);

    if (!currentUser.friends) currentUser.friends = [];
    if (!currentUser.friends.includes(targetFriendId)) {
      currentUser.friends.push(targetFriendId);
      updateUser(userId, { friends: currentUser.friends });
    }

    if (!friendUser.friends) friendUser.friends = [];
    if (!friendUser.friends.includes(userId)) {
      friendUser.friends.push(userId);
      updateUser(targetFriendId, { friends: friendUser.friends });
    }

    // Notify the other user on Telegram if possible
    callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: targetFriendId,
      text: `🎉 <b>تبریک! ${currentUser.name || 'کاربر چاژا'} درخواست دوستی شما را قبول کرد!</b>\nاکنون در لیست دوستان یکدیگر هستید.`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎲 دعوت به مسابقه تخته نرد ⚔️', switch_inline_query: `duel_backgammon_CHZ-${userId}` }]
        ]
      }
    }).catch(() => {});

    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `🤝 <b>تبریک! شما و ${friendUser.name || 'کاربر چاژا'} اکنون با هم دوست شدید!</b>\n\nمی‌توانید مستقیماً با یکدیگر تخته نرد بازی کنید یا چت کنید:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎲 دعوت به مسابقه تخته نرد ⚔️', switch_inline_query: `duel_backgammon_CHZ-${targetFriendId}` }],
          [{ text: '🎪 ورود به سالن بازی‌ها و چت 💬', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } }]
        ]
      }
    });
  }

  // Handle Referral Links (/start ref_<userId>)
  if (text.startsWith('/start ref_')) {
    const referrerId = text.replace('/start ref_', '').trim();
    if (referrerId && referrerId !== userId) {
      const referrer = getUser(referrerId);
      if (!referrer.referrals) referrer.referrals = [];
      if (!referrer.referrals.includes(userId)) {
        referrer.referrals.push(userId);
        referrer.coins = (referrer.coins || 0) + 500;
        referrer.xp = (referrer.xp || 0) + 100;
        updateUser(referrerId, { referrals: referrer.referrals, coins: referrer.coins, xp: referrer.xp });

        // Notify referrer
        callTgApi(BOT_TOKEN, 'sendMessage', {
          chat_id: referrerId,
          text: `🎉 <b>کاربر جدید با لینک شما وارد چاژا شد!</b>\nپاداش: <b>+۵۰۰ سکه</b> و <b>+۱۰۰ XP</b> به حسابتان افزوده شد.`,
          parse_mode: 'HTML'
        }).catch(() => {});

        // Bonus for the newcomer
        const user = getUser(userId);
        user.coins = (user.coins || 0) + 500;
        updateUser(userId, { coins: user.coins });
      }
    }
  }

  // ----------------------------------------------------
  // PERSISTENT 4-BUTTON MENU ROUTER
  // ----------------------------------------------------
  // 1. Games & Tournaments Hub
  if (text === '🎮 بازی‌ها و مسابقات آنلاین' || text === '🎮 Games & Tournaments' || text === '/games') {
    return sendGamesMenu(chatId, userId);
  }

  // 2. Wallet & Coins Hub
  if (text === '💎 کیف‌پول و سکه' || text === '💎 Wallet & Coins' || text === '/wallet' || text === '💎 کیف‌پول و شارژ سکه') {
    return sendWalletMenu(chatId, userId);
  }

  // 3. Player Profile Hub
  if (text === '👤 پروفایل من' || text === '👤 My Profile' || text === '/profile' || text === '/me') {
    return sendProfileMenu(chatId, userId);
  }

  // 4. Settings Hub
  if (text === '⚙️ تنظیمات' || text === '⚙️ Settings' || text === '/settings') {
    return sendSettingsMenu(chatId, userId);
  }

  // Start & Navigation Back
  if (text.startsWith('/start') || text === '🔙 بازگشت به منوی بازی‌ها' || text === '🔙 Back') {
    return sendGamesDashboard(chatId, userId);
  }

  // Backgammon Quick Launcher
  if (text.includes('تخته نرد') || text === '/backgammon') {
    const user = getUser(userId);
    const isEn = user.lang === 'en';
    return callTgApi(BOT_TOKEN, 'sendGame', {
      chat_id: chatId,
      game_short_name: 'backgammon',
      reply_markup: {
        inline_keyboard: [
          [{ text: isEn ? '🎲 Random Opponent (Quick Match) ⚔️' : '🎲 حریف شانسی (مسابقه تصادفی) ⚔️', callback_game: {} }],
          [
            { text: isEn ? '🎨 Themes' : '🎨 تغییر تم', callback_data: 'bg_themes_menu' },
            { text: isEn ? '🤖 Play vs Bot' : '🤖 بازی با ربات', callback_data: 'bg_play_bot' }
          ],
          [{ text: isEn ? '🚀 Invite Friends to Match ⚔️' : '🚀 ارسال درخواست مسابقه به دوستان ⚔️', switch_inline_query: 'duel' }]
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
    let targetUrl = `${CONFIG.WEBAPP_URL}?app=chazha#/games/${cq.game_short_name}`;
    if (cq.inline_message_id) {
      targetUrl += `?room=tg_${cq.inline_message_id}&mode=online&autostart=1`;
    } else if (cq.game_short_name === 'backgammon') {
      targetUrl += `?mode=online&matchmaking=random&autostart=1`;
    }
    return callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
      callback_query_id: cq.id,
      url: targetUrl
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

  // 6. Accept Friend Request Callback
  if (data.startsWith('friend_accept_')) {
    const friendId = data.replace('friend_accept_', '').trim();
    const friendUser = getUser(friendId);
    const currentUser = getUser(userId, cq.from.first_name);

    if (!currentUser.friends) currentUser.friends = [];
    if (!currentUser.friends.includes(friendId)) {
      currentUser.friends.push(friendId);
      updateUser(userId, { friends: currentUser.friends });
    }

    if (!friendUser.friends) friendUser.friends = [];
    if (!friendUser.friends.includes(userId)) {
      friendUser.friends.push(userId);
      updateUser(friendId, { friends: friendUser.friends });
    }

    callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: friendId,
      text: `🎉 <b>تبریک! ${currentUser.name || 'کاربر چاژا'} درخواست دوستی شما را تایید کرد!</b>\nاکنون در لیست دوستان یکدیگر هستید.`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎲 دعوت به مسابقه تخته نرد ⚔️', switch_inline_query: `duel_backgammon_CHZ-${userId}` }]
        ]
      }
    }).catch(() => {});

    return callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
      callback_query_id: cq.id,
      text: `✅ شما و ${friendUser.name || 'کاربر چاژا'} اکنون دوست شدید!`,
      show_alert: true
    });
  }

  // 7. Launch Backgammon HTML5 Game Card
  if (data === 'launch_backgammon_card') {
    const user = getUser(userId);
    const isEn = user.lang === 'en';
    return callTgApi(BOT_TOKEN, 'sendGame', {
      chat_id: chatId,
      game_short_name: 'backgammon',
      reply_markup: {
        inline_keyboard: [
          [{ text: isEn ? '🎲 Random Opponent (Quick Match) ⚔️' : '🎲 حریف شانسی (مسابقه تصادفی) ⚔️', callback_game: {} }],
          [
            { text: isEn ? '🎨 Themes' : '🎨 تغییر تم', callback_data: 'bg_themes_menu' },
            { text: isEn ? '🤖 Play vs Bot' : '🤖 بازی با ربات', callback_data: 'bg_play_bot' }
          ],
          [{ text: isEn ? '🚀 Invite Friends to Match ⚔️' : '🚀 ارسال درخواست مسابقه به دوستان ⚔️', switch_inline_query: 'duel' }]
        ]
      }
    });
  }

  // 8. Settings: Language Selector
  if (data === 'settings_change_lang') {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🌐 <b>انتخاب زبان | Language Selection:</b>\nلطفاً زبان مورد نظر خود را انتخاب کنید:\nPlease select your preferred language:',
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

  // 9. Set Language -> Persian
  if (data === 'set_lang_fa') {
    updateUser(userId, { lang: 'fa' });
    try {
      await callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
        callback_query_id: cq.id,
        text: '✅ زبان با موفقیت به فارسی تغییر یافت.',
        show_alert: true
      });
    } catch (_) {}
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🇮🇷 <b>زبان چاژا به فارسی تنظیم شد.</b>\nمنوی پایین و پیام‌ها به زبان فارسی نمایش داده خواهند شد.',
      parse_mode: 'HTML',
      reply_markup: getMainReplyKeyboard('fa')
    });
  }

  // 10. Set Language -> English
  if (data === 'set_lang_en') {
    updateUser(userId, { lang: 'en' });
    try {
      await callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
        callback_query_id: cq.id,
        text: '✅ Language changed to English successfully.',
        show_alert: true
      });
    } catch (_) {}
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '🇬🇧 <b>Chazha language switched to English!</b>\nYour menus and notifications are now updated.',
      parse_mode: 'HTML',
      reply_markup: getMainReplyKeyboard('en')
    });
  }

  // 11. Settings: Toggle Notifications
  if (data === 'settings_toggle_notif') {
    const user = getUser(userId);
    const newStatus = !user.notificationsDisabled;
    updateUser(userId, { notificationsDisabled: newStatus });
    const isEn = user.lang === 'en';
    const alertMsg = newStatus
      ? (isEn ? '🔕 Notifications muted.' : '🔕 اعلان‌ها غیرفعال شدند.')
      : (isEn ? '🔔 Notifications enabled.' : '🔔 اعلان‌ها فعال شدند.');
    try {
      await callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
        callback_query_id: cq.id,
        text: alertMsg,
        show_alert: true
      });
    } catch (_) {}
    return sendSettingsMenu(chatId, userId);
  }

  // 12. Profile: View Friends
  if (data === 'profile_view_friends') {
    const user = getUser(userId);
    const isEn = user.lang === 'en';
    const friends = user.friends || [];
    if (friends.length === 0) {
      return callTgApi(BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        text: isEn
          ? `🤝 <b>My Friends List</b>\n\nYou have no friends added yet!\nInvite friends with your link or challenge players in games.`
          : `🤝 <b>لیست دوستان چاژا</b>\n\nهنوز دوستی به لیست شما اضافه نشده است!\nبا ارسال لینک دعوت به دوستانتان یا رقابت در بازی‌ها، دوستان جدید اضافه کنید.`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: isEn ? '🚀 Invite Friends' : '🚀 ارسال لینک دعوت', callback_data: 'show_referral' }],
            [{ text: isEn ? '🎪 Go to Games Lounge' : '🎪 ورود به سالن بازی‌ها و گپ', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } }]
          ]
        }
      });
    }

    let listText = isEn ? `🤝 <b>Your Chazha Friends (${friends.length}):</b>\n\n` : `🤝 <b>لیست دوستان شما در چاژا (${friends.length} نفر):</b>\n\n`;
    const buttons = [];
    for (const fId of friends.slice(0, 10)) {
      const fUser = getUser(fId);
      listText += `👤 <b>${fUser.name || 'کاربر'}</b> (سطح ${fUser.level || 1})\n`;
      buttons.push([{
        text: isEn ? `🎲 Challenge ${fUser.name || 'Friend'}` : `🎲 دعوت ${fUser.name || 'دوست'} به بازی`,
        switch_inline_query: `duel_backgammon_CHZ-${userId}`
      }]);
    }
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: listText,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons }
    });
  }

  // 13. Profile / Wallet: Show Referral Link & Rewards
  if (data === 'show_referral') {
    const user = getUser(userId);
    const isEn = user.lang === 'en';
    const refLink = `https://t.me/chazha_bot?start=ref_${userId}`;
    const text = isEn
      ? `👥 <b>Invite Friends & Earn Rewards!</b>\n\n` +
        `Share your exclusive link with friends. For every friend who joins:\n` +
        `🎁 <b>You receive: +500 Coins & +100 XP!</b>\n` +
        `🎁 <b>Your friend gets: +500 Welcome Coins!</b>\n\n` +
        `🔗 Your Link:\n<code>${refLink}</code>`
      : `👥 <b>دعوت دوستان و دریافت پاداش سکه!</b>\n\n` +
        `لینک اختصاصی خود را برای دوستان و گروه‌ها بفرستید. با ورود هر دوست به چاژا:\n` +
        `🎁 <b>شما ۵۰۰ سکه و ۱۰۰ XP دریافت می‌کنید!</b>\n` +
        `🎁 <b>دوست شما هم ۵۰۰ سکه خوش‌آمدگویی هدیه می‌گیرد!</b>\n\n` +
        `🔗 لینک اختصاصی شما:\n<code>${refLink}</code>`;

    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: isEn ? '📤 Share Link' : '📤 ارسال لینک برای دوستان', switch_inline_query: `ref_${userId}` }]
        ]
      }
    });
  }
}

// ----------------------------------------------------
// INLINE QUERY ROUTER (For sharing games in any chat)
// ----------------------------------------------------
async function onInlineQuery(iq) {
  const senderName = iq.from.first_name || 'کاربر چاژا';
  const senderId = iq.from.id;
  const query = (iq.query || '').trim();

  let roomCode = `CHZ-${senderId}`;
  let gameType = 'backgammon';
  let gameTitle = 'تخته نرد';

  if (query) {
    if (query.startsWith('BACK-') || query.startsWith('backgammon')) {
      gameType = 'backgammon';
      gameTitle = 'تخته نرد';
      roomCode = query.startsWith('BACK-') ? query : (query.split(' ')[1] || `BACK-${senderId}`);
    } else if (query.startsWith('HOKM-') || query.startsWith('hokm')) {
      gameType = 'hokm';
      gameTitle = 'حکم';
      roomCode = query.startsWith('HOKM-') ? query : (query.split(' ')[1] || `HOKM-${senderId}`);
    } else if (query.startsWith('LUDO-') || query.startsWith('ludo')) {
      gameType = 'ludo';
      gameTitle = 'منچ';
      roomCode = query.startsWith('LUDO-') ? query : (query.split(' ')[1] || `LUDO-${senderId}`);
    } else if (query.startsWith('room_')) {
      roomCode = query.replace('room_', '');
      if (roomCode.startsWith('HOKM-')) { gameType = 'hokm'; gameTitle = 'حکم'; }
      else if (roomCode.startsWith('LUDO-')) { gameType = 'ludo'; gameTitle = 'منچ'; }
      else if (roomCode.startsWith('PASS-')) { gameType = 'pasur'; gameTitle = 'پاسور'; }
      else if (roomCode.startsWith('BILL-')) { gameType = 'billiards'; gameTitle = 'بیلیارد'; }
    } else if (query.startsWith('duel')) {
      const parts = query.split('_');
      if (parts.length >= 2 && parts[1]) {
        roomCode = parts.slice(1).join('_');
      } else {
        roomCode = `BACK-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else if (query.length >= 4) {
      roomCode = query;
    }
  }

  const guestGameUrl = `${CONFIG.WEBAPP_URL}?app=chazha#/games/${gameType}?room=${roomCode}&mode=online&role=black&autostart=1`;

  const results = [
    // Interactive Duel Challenge Card (with Accept & Decline buttons)
    {
      type: 'article',
      id: `duel_${gameType}_${senderId}_${Date.now() % 10000}`,
      title: `⚔️ ارسال کارت مسابقه ${gameTitle} (با ${senderName})`,
      description: `کد اتاق: ${roomCode} • برای ارسال مستقیم به چت کلیک کنید`,
      thumb_url: 'https://zen.moeid.net/icons/icon-192.svg',
      input_message_content: {
        message_text: `🎲 <b>چالش مسابقه ${gameTitle} در چاژا!</b>\n\n👤 <b>${senderName}</b> شما را به مسابقه دوئل آنلاین دعوت کرده است!\nکد اتاق: <code>${roomCode}</code>\n\n⚔️ برای قبول چالش و ورود مستقیم به بازی، روی دکمه زیر بزنید:`,
        parse_mode: 'HTML'
      },
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `🎲 شروع بازی ${gameTitle} ⚔️`,
              web_app: { url: guestGameUrl }
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
    }
  ];

  return callTgApi(BOT_TOKEN, 'answerInlineQuery', {
    inline_query_id: iq.id,
    results: results,
    cache_time: 0,
    is_personal: true
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
