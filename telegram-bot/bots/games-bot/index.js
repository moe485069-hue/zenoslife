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
  sendGameLeaderboard,
  sendMissionsMenu,
  claimMissionReward,
  recordMissionProgress,
  sendTournamentsMenu,
  registerTournament,
  sendPlatoWeaponsShop,
  buyPlatoWeapon,
  openMysteryChest,
  sendCreateStakesMatchMenu,
  handleGenerateStakedDuel
} = require('./games-engine');

const BOT_TOKEN = CONFIG.BOT_TOKEN_GAMES;

const GAME_BANNER_PHOTOS = {
  hero: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  snooker: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
  backgammon: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=80',
  hokm: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&auto=format&fit=crop&q=80',
  ludo: 'https://images.unsplash.com/photo-1611891487122-207579d67d98?w=800&auto=format&fit=crop&q=80',
  pasur: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=800&auto=format&fit=crop&q=80',
  wallet: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
  lounge: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=80'
};

const GAME_DETAILS = {
  hokm: {
    titleFa: 'حکم ۴ نفره آنلاین',
    titleEn: 'Hokm 4-Player Online',
    icon: '🂡',
    descFa: '👑 پادشاه بازی‌های کارتی ایرانی! رقابت‌های ۴ نفره تیمی با امکان تعیین خال حکم، چت زنده و بازی با بازیکنان آنلاین یا هوش مصنوعی هوشمند.',
    descEn: 'The king of Persian card games! 4-player online matches, declare the trump suit, and win tricks.',
    photo: GAME_BANNER_PHOTOS.hokm,
    path: '/games/hokm',
    prefix: 'HOKM'
  },
  ludo: {
    titleFa: 'منچ دورهمی شاد',
    titleEn: 'Ludo Party',
    icon: '🎲',
    descFa: '🎉 منچ ۲ تا ۴ نفره به سبک پلاتو! با پرتاب تاس و زدن مهره‌های رقیب، هیجان خالص دورهمی را تجربه کنید.',
    descEn: 'Fast-paced 2-4 player Ludo! Roll dice, knock opponent tokens out and race home in lively casual party matches.',
    photo: GAME_BANNER_PHOTOS.ludo,
    path: '/games/ludo',
    prefix: 'LUDO'
  },
  pasur: {
    titleFa: 'پاسور چهاربرگ کلاسیک',
    titleEn: 'Pasur (Four Cards)',
    icon: '🃏',
    descFa: '⚡ بازی سرعتی و استراتژیک ۲ نفره چهاربرگ! خشت و سور بزنید و امتیازهای طلایی را از میز جمع کنید.',
    descEn: 'Classic Persian 2-player Pasur! Collect 11 points, sweep the table with Sur, and claim the victory.',
    photo: GAME_BANNER_PHOTOS.pasur,
    path: '/games/pasur',
    prefix: 'PASS'
  },
  backgammon: {
    titleFa: 'تخته نرد شاهانه',
    titleEn: 'Royal Backgammon',
    icon: '🎲',
    descFa: '🪵 تخته‌نرد اصیل چوبی با فیزیک و صدای واقعی تاس، تاس‌ریزی تصادفی و رقابت‌های نفس‌گیر ۱ به ۱ شرطی.',
    descEn: 'Authentic handcrafted Persian wooden board, realistic 3D dice tumbling, and ranked online duels.',
    photo: GAME_BANNER_PHOTOS.backgammon,
    path: '/games/backgammon',
    prefix: 'BACK'
  },
  snooker: {
    titleFa: 'اسنوکر و بیلیارد شاهانه سه‌بعدی',
    titleEn: 'Royal Snooker & 8-Ball 3D',
    icon: '🎱',
    descFa: '🏆 گرافیک سه‌بعدی تلویزیونی، فیزیک حرفه‌ای توپ‌ها، انتخاب انواع چوب‌های خاص و پاکت کردن میلی‌متری توپ‌ها.',
    descEn: 'True physical ball dynamics, customizable cues, fine spin control, and high-stakes matches.',
    photo: GAME_BANNER_PHOTOS.snooker,
    path: '/games/snooker',
    prefix: 'SNOO'
  }
};

function getShareDuelUrl(gameType = 'backgammon', roomCode = '', customText = '') {
  const botUsername = 'chazha_bot';
  const gameNames = {
    snooker: 'اسنوکر شاهانه',
    backgammon: 'تخته نرد',
    hokm: 'حکم آنلاین',
    ludo: 'منچ آنلاین',
    pasur: 'پاسور چهاربرگ',
    billiards: 'بیلیارد',
    cosmic_chess: 'شطرنج'
  };
  const title = gameNames[gameType] || 'اسنوکر شاهانه';
  const directLink = `https://t.me/${botUsername}?start=room_${roomCode || 'SNOO-MATCH'}`;
  const text = customText || `🎲 دعوت به مسابقه دوئل ${title} در چاژا!\n👑 بیا با من مسابقه بده، روی لینک زیر بزن و مستقیم وارد بازی شو: ⚔️👇`;
  return `https://t.me/share/url?url=${encodeURIComponent(directLink)}&text=${encodeURIComponent(text)}`;
}

// ----------------------------------------------------
// MAIN PERSISTENT KEYBOARD (4-SECTION ARCHITECTURE)
// Row 1 (Top single): Games & Tournaments
// Row 2 (3 buttons): Wallet, Profile, Settings
// ----------------------------------------------------
function getMainReplyKeyboard(lang = 'fa') {
  const isEn = lang === 'en';
  return {
    keyboard: [
      [{
        text: isEn ? '🎮 Play Games (Launch Mini App) 🚀' : '🎮 ورود به بازی‌ها و مسابقات چاژا 🚀',
        web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games` }
      }]
    ],
    resize_keyboard: true
  };
}

// 0. Welcome / Start Dashboard (Rich Photo Banner + Gamer HUD)
async function sendGamesDashboard(chatId, userId) {
  const user = getUser(userId);
  const isEn = user.lang === 'en';
  const streak = checkDailyStreak(userId);

  if (streak && streak.days > 1) {
    const streakMsg = isEn
      ? `🔥 <b>Daily Streak Bonus!</b>\nYou logged in ${streak.days} days in a row!\n🎁 Reward: <b>+${streak.coins} Coins & +${streak.xp} XP</b>`
      : `🔥 <b>استریک روزانه ورود به چاژا!</b>\nشما ${streak.days} روز متوالی وارد شدید!\n🎁 پاداش: <b>+${streak.coins} سکه و +${streak.xp} XP</b>`;
    callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: streakMsg,
      parse_mode: 'HTML'
    }).catch(() => {});
  }

  const caption = isEn
    ? `🎮 <b>ChaZha • Telegram Multiplayer Gaming Club</b> 👑\n\n` +
      `Welcome <b>${user.name || 'Player'}</b>!\n` +
      `Play authentic Persian card & board games live with friends across Telegram:\n\n` +
      `🃏 <b>Featured Games:</b> Hokm 4P • Backgammon • Ludo • Pasur • Snooker 3D\n` +
      `🪙 <b>Your Balance:</b> ${(user.coins || 0).toLocaleString()} Coins  •  Level ${user.level || 1} ${user.is_vip ? '👑 VIP' : ''}\n\n` +
      `🔥 <i>Compete live, place wagers, and win Telegram Stars!</i>`
    : `🎮 <b>چاژا | کلاب بازی‌های چندنفره و دورهمی تلگرام</b> 👑\n\n` +
      `سلام <b>${user.name || 'کاربر چاژا'}</b> عزیز، خوش اومدی!\n` +
      `بزرگترین کلوپ بازی‌های دورهمی آنلاین در تلگرام:\n\n` +
      `🃏 <b>بازی‌های برتر:</b> حکم ۴ نفره • تخته نرد • منچ دورهمی • پاسور • اسنوکر ۳D\n` +
      `🪙 <b>موجودی شما:</b> ${(user.coins || 0).toLocaleString()} سکه طلا  •  سطح ${user.level || 1} ${user.is_vip ? '👑 VIP' : ''}\n\n` +
      `🔥 <i>با حریفان آنلاین سراسر کشور رقابت کن، شرط ببند و استارز ببر:</i>`;

  const keyboard = [
    // 1. BIG HERO PLAY BUTTON (Direct into the Games Hub)
    [{
      text: isEn ? '🚀 Play Now • Launch Chazha 🎮' : '🚀 شروع بازی و ورود به چاژا (Play Now) 🎮',
      web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games` }
    }],
    // 2. Tournaments & Daily Lucky Chest
    [
      { text: isEn ? '🏆 Tournaments & Cups 👑' : '🏆 جام‌ها و لیگ‌های هفتگی 👑', callback_data: 'menu_tournaments' },
      { text: isEn ? '🎁 Daily Lucky Chest 🪙' : '🎁 صندوقچه شانس روزانه 🪙', callback_data: 'open_mystery_chest' }
    ],
    // 3. Referral & Stars Shop
    [
      { text: isEn ? '👥 Invite Friends (+1000 Coins)' : '👥 دعوت دوستان (+۱,۰۰۰ سکه هدیه)', callback_data: 'show_referral' },
      { text: isEn ? '💎 Buy Coins & VIP ⭐' : '💎 خرید سکه و VIP (استارز ⭐)', callback_data: 'nav_wallet' }
    ]
  ];

  try {
    return await callTgApi(BOT_TOKEN, 'sendPhoto', {
      chat_id: chatId,
      photo: GAME_BANNER_PHOTOS.hero,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (_) {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
}

// SECTION 1: Single Game Showcase Card
async function sendGameCard(chatId, gameKey, userId) {
  const game = GAME_DETAILS[gameKey];
  if (!game) return sendGamesDashboard(chatId, userId);

  const user = getUser(userId);
  const isEn = user.lang === 'en';
  const roomCode = `${game.prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  const playUrl = `${CONFIG.WEBAPP_URL}?app=chazha#${game.path}?room=${roomCode}&mode=online&role=black&autostart=1`;
  const botUrl = `${CONFIG.WEBAPP_URL}?app=chazha#${game.path}?mode=bot`;
  const shareDuelUrl = getShareDuelUrl(gameKey, roomCode);

  const title = isEn ? game.titleEn : game.titleFa;
  const desc = isEn ? game.descEn : game.descFa;

  const caption = `🎮 <b>${game.icon} ${title}</b>\n\n` +
    `${desc}\n\n` +
    `🔑 <b>کد اتاق آماده مسابقه:</b> <code>${roomCode}</code>\n` +
    `🪙 <b>موجودی سکه شما:</b> ${(user.coins || 0).toLocaleString()} سکه\n\n` +
    `👇 حالت بازی خود را انتخاب کنید:`;

  const keyboard = [
    [{
      text: isEn ? `🚀 Play Live Online (${title}) ⚔️` : `🚀 شروع بازی و ورود به میز (${title}) ⚔️`,
      web_app: { url: playUrl }
    }],
    [{
      text: isEn ? `🤖 Practice vs Smart AI 🎯` : `🤖 تمرین تک‌نفره با ربات هوشمند 🎯`,
      web_app: { url: botUrl }
    }],
    [{
      text: isEn ? `👥 Invite Telegram Friend to Duel ⚔️` : `👥 ارسال کارت چالش به دوستان تلگرام ⚔️`,
      url: shareDuelUrl
    }],
    [{
      text: isEn ? '🔙 Back to Games Console' : '🔙 بازگشت به کنسول چاژا',
      callback_data: 'nav_dashboard'
    }]
  ];

  try {
    return await callTgApi(BOT_TOKEN, 'sendPhoto', {
      chat_id: chatId,
      photo: game.photo || GAME_BANNER_PHOTOS.default,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (_) {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
}

// SECTION 2: All 15+ Games Catalog Hub
async function sendAllGamesMenu(chatId, userId) {
  const user = getUser(userId);
  const isEn = user.lang === 'en';

  const caption = isEn
    ? `🎯 <b>Chazha Complete 15+ Games Catalog (Plato Style)</b>\n\nSelect any game to launch immediately:`
    : `🎯 <b>کاتالوگ جامع بازی‌های آنلاین چاژا (سبک پلاتو)</b> 🎪\n\n` +
      `بیش از ۱۵ بازی اعتیادآور و دوئل‌های چندنفره را انتخاب کنید:`;

  const keyboard = [
    [{
      text: isEn ? '🚀 Open Chazha Games Arcade 🎮' : '🚀 ورود به آرکید و کاتالوگ بازی‌ها (Play) 🎮',
      web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games` }
    }],
    [
      { text: '🂡 حکم ۴ نفره', callback_data: 'launch_hokm_card' },
      { text: '🪵 تخته‌نرد شاهانه', callback_data: 'launch_backgammon_card' }
    ],
    [
      { text: '🎲 منچ دورهمی شاد', callback_data: 'launch_ludo_card' },
      { text: '🃏 پاسور چهاربرگ', callback_data: 'launch_pasur_card' }
    ],
    [
      { text: '🎱 اسنوکر ۳D', callback_data: 'launch_snooker_card' },
      { text: '🏒 ایر هاکی نئونی', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/air-hockey` } }
    ],
    [
      { text: '✏️ نقطه و خط', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/dots-and-boxes` } },
      { text: '🔴 دوز ۴ تایی', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/connect-four` } }
    ],
    [
      { text: '🚢 نبرد ناوها', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/battleship` } },
      { text: '⚽ فوتبال انگشتی', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/finger-soccer` } }
    ],
    [
      { text: '🎴 اونو (هفت خبیث)', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/ocho` } },
      { text: '🐍 مار و پله', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/snakes-and-ladders` } }
    ],
    [{ text: isEn ? '🔙 Back to Console' : '🔙 بازگشت به کنسول چاژا', callback_data: 'nav_dashboard' }]
  ];

  try {
    return await callTgApi(BOT_TOKEN, 'sendPhoto', {
      chat_id: chatId,
      photo: GAME_BANNER_PHOTOS.lounge,
      caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (_) {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
}

// SECTION 3: Wallet, Coins & Telegram Stars Hub (Visual Photo Banner)
async function sendWalletMenu(chatId, userId) {
  const user = getUser(userId);
  const isEn = user.lang === 'en';

  const caption = isEn
    ? `💎 <b>Chazha Treasury, Coins & VIP Membership</b> 👑\n\n` +
      `┌ 🪙 <b>Coins Balance:</b> ${(user.coins || 0).toLocaleString()} Coins\n` +
      `├ 👑 <b>VIP Membership:</b> ${user.is_vip ? 'Active Royal VIP ⭐' : 'Standard Member'}\n` +
      `├ ⚡ <b>Experience:</b> ${(user.xp || 0).toLocaleString()} XP\n` +
      `└ 🏆 <b>Current Rank:</b> Level ${user.level || 1}\n\n` +
      `⭐ <b>Telegram Stars (XTR) & Shop:</b> Instant delivery, 0 fee, secure.`
    : `💎 <b>خزانه‌داری، کیف‌پول و اشتراک VIP چاژا</b> 👑\n\n` +
      `┌ 🪙 <b>موجودی سکه:</b> ${(user.coins || 0).toLocaleString()} سکه طلا\n` +
      `├ 👑 <b>وضعیت VIP:</b> ${user.is_vip ? 'VIP طلایی فعال ⭐' : 'عادی'}\n` +
      `├ ⚡ <b>سطح و تجربه:</b> لول ${user.level || 1} • ${(user.xp || 0).toLocaleString()} XP\n` +
      `└ 🎁 <b>پورسانت رفرال:</b> ۱۰٪ پاداش دائمی از خرید دوستان\n\n` +
      `⭐ <b>پرداخت با تلگرام استارز (XTR):</b> شارژ آنی و بدون واسطه.`;

  const keyboard = [
    [{ text: isEn ? '⭐ Buy Coins with Telegram Stars' : '⭐ خرید بسته‌های سکه با ستاره‌های تلگرام', callback_data: 'shop_buy_coins' }],
    [{ text: isEn ? '👑 Get Royal VIP Pass (Double XP)' : '👑 خرید اشتراک VIP طلایی (سکه و XP مضاعف)', callback_data: 'shop_buy_vip' }],
    [{ text: isEn ? '💎 Crypto TON / USDT (+20% Bonus)' : '💎 پرداخت کریپتو (TON / تتر) +۲۰٪ بانس', callback_data: 'crypto_pay_info' }],
    [
      { text: isEn ? '🎁 Daily Spin Wheel' : '🎁 گردونه شانس', callback_data: 'spin_wheel_action' },
      { text: isEn ? '👥 Invite Friends (+500)' : '👥 دعوت دوستان (+۵۰۰ سکه)', callback_data: 'show_referral' }
    ],
    [{ text: isEn ? '🔙 Back to Console' : '🔙 بازگشت به کنسول چاژا', callback_data: 'nav_dashboard' }]
  ];

  try {
    return await callTgApi(BOT_TOKEN, 'sendPhoto', {
      chat_id: chatId,
      photo: GAME_BANNER_PHOTOS.wallet,
      caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (_) {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
}

// SECTION 3: Player Profile Hub
async function sendProfileMenu(chatId, userId) {
  const user = getUser(userId);
  const isEn = user.lang === 'en';

  const friendsCount = (user.friends || []).length;
  const refsCount = (user.referrals || []).length;
  const bioText = user.bio || (isEn ? 'No bio set yet. Use /setbio <text> to set your bio!' : 'هنوز بیوگرافی ثبت نشده است. با ارسال /setbio بیو خود را ثبت کنید.');

  const text = isEn
    ? `👤 <b>Player Profile Card</b>\n\n` +
      `🏷️ Name: <b>${user.name || 'Chazha Player'}</b>\n` +
      `🆔 User ID: <code>${userId}</code>\n` +
      `🏆 Level: <b>Level ${user.level || 1}</b> (${user.xp || 0} XP)\n` +
      `🪙 Coins: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
      `👑 VIP: <b>${user.is_vip ? 'Active Royal VIP ⭐' : 'Standard Member'}</b>\n` +
      `📝 Bio: <i>${bioText}</i>\n` +
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
      `📝 بیوگرافی: <i>${bioText}</i>\n` +
      `🔥 استریک روزانه: <b>${user.streak_days || 1} روز متوالی</b>\n` +
      `🤝 دوستان چاژا: <b>${friendsCount} نفر</b>\n` +
      `👥 زیرمجموعه‌ها: <b>${refsCount} نفر</b>\n\n` +
      `یک گزینه را انتخاب کنید:`;

  const keyboard = [
    [{ text: isEn ? `🤝 My Friends List (${friendsCount})` : `🤝 لیست دوستان چاژا (${friendsCount} نفر)`, callback_data: 'profile_view_friends' }],
    [{ text: isEn ? '🛍️ Items & Banners Shop' : '🛍️ فروشگاه اقلام، مهره‌ها و بنرها', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } }],
    [
      { text: isEn ? '✏️ Edit Profile Bio' : '✏️ تنظیم بیوگرافی', callback_data: 'prompt_set_bio' },
      { text: isEn ? '🚀 Invite Friends Link' : '🚀 لینک اختصاصی دعوت', callback_data: 'show_referral' }
    ],
    [{ text: isEn ? '🎨 Board Themes' : '🎨 تم‌های تخته نرد', callback_data: 'bg_themes_menu' }]
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

    if (roomCode.startsWith('SNOO-')) { gameType = 'snooker'; gameName = 'اسنوکر شاهانه'; }
    else if (roomCode.startsWith('HOKM-')) { gameType = 'hokm'; gameName = 'حکم آنلاین'; }
    else if (roomCode.startsWith('LUDO-')) { gameType = 'ludo'; gameName = 'منچ آنلاین'; }
    else if (roomCode.startsWith('PASS-')) { gameType = 'pasur'; gameName = 'پاسور چهاربرگ'; }
    else if (roomCode.startsWith('BILL-')) { gameType = 'billiards'; gameName = 'بیلیارد'; }
    else if (roomCode.startsWith('CHSS-')) { gameType = 'cosmic_chess'; gameName = 'شطرنج'; }
    else {
      const names = { snooker: 'اسنوکر', backgammon: 'تخته نرد', hokm: 'حکم', ludo: 'منچ', pasur: 'پاسور', billiards: 'بیلیارد', cosmic_chess: 'شطرنج' };
      gameName = names[gameType] || 'اسنوکر شاهانه';
    }

    const guestGameUrl = `${CONFIG.WEBAPP_URL}?app=chazha#/games/${gameType}?room=${roomCode}&mode=online&role=black&autostart=1`;
    const photoUrl = GAME_BANNER_PHOTOS[gameType] || GAME_BANNER_PHOTOS.default;

    const caption = `⚔️ <b>کارت دعوت به مسابقه آنلاین ${gameName} چاژا!</b>\n\n` +
      `🎮 شما به اتاق مسابقه <code>${roomCode}</code> دعوت شده‌اید!\n` +
      `🔥 آیا آماده‌اید برای قهرمانی و پیروزی؟\n\n` +
      `👇 برای پیوستن و شروع فوری مسابقه، روی دکمه زیر بزنید:`;

    const inlineKeyboard = [
      [{
        text: `🎲 پیوستن به بازی ${gameName} و شروع مسابقه ⚔️`,
        web_app: { url: guestGameUrl }
      }],
      [{
        text: '🎪 ورود به سالن بازی‌ها و گپ‌وگفت 💬',
        web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` }
      }]
    ];

    try {
      return await callTgApi(BOT_TOKEN, 'sendPhoto', {
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    } catch (err) {
      return callTgApi(BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        text: caption,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    }
  }

  // Handle Direct Purchase Invoices from Mini App (/start buy_<pkgKey>)
  if (text.startsWith('/start buy_') || text.startsWith('/start pay_')) {
    const pkg = text.replace('/start buy_', '').replace('/start pay_', '').trim();
    if (pkg.includes('vip')) {
      return sendInvoiceForVip(BOT_TOKEN, chatId, userId, 30);
    }
    const pkgMap = {
      'pack_starter': 'bronze',
      'pack_popular': 'silver',
      'pack_gold': 'global',
      'pack_legendary': 'vip',
      'bronze': 'bronze',
      'silver': 'silver',
      'global': 'global',
      'vip': 'vip'
    };
    const key = pkgMap[pkg] || 'silver';
    return sendInvoiceForPackage(BOT_TOKEN, chatId, userId, key);
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
          [{ text: '🎲 دعوت به مسابقه تخته نرد ⚔️', url: getShareDuelUrl('backgammon', `CHZ-${userId}`) }]
        ]
      }
    }).catch(() => {});

    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `🤝 <b>تبریک! شما و ${friendUser.name || 'کاربر چاژا'} اکنون با هم دوست شدید!</b>\n\nمی‌توانید مستقیماً با یکدیگر تخته نرد بازی کنید یا چت کنید:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎲 دعوت به مسابقه تخته نرد ⚔️', url: getShareDuelUrl('backgammon', `CHZ-${targetFriendId}`) }],
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

  // Handle Direct In-Game Chat Link (/start chat_<targetId>)
  if (text.startsWith('/start chat_')) {
    const targetId = text.replace('/start chat_', '').trim();
    const targetUser = getUser(targetId);
    const currentUser = getUser(userId, msg.from.first_name);

    if (targetId && targetId !== userId) {
      callTgApi(BOT_TOKEN, 'sendMessage', {
        chat_id: targetId,
        text: `💬 <b>درخواست گفت‌وگو از طرف ${currentUser.name || 'کاربر چاژا'}!</b>\nاین کاربر در بازی برای شما درخواست چت فرستاده است.`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ شروع چت و گفت‌وگو', callback_data: `chat_accept_${userId}` },
              { text: '❌ رد کردن', callback_data: `chat_decline_${userId}` }
            ],
            [{ text: '🎲 دعوت متقابل به تخته نرد ⚔️', url: getShareDuelUrl('backgammon', `CHZ-${userId}`) }]
          ]
        }
      }).catch(() => {});

      return callTgApi(BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        text: `💬 <b>درخواست گفت‌وگو برای ${targetUser.name || 'کاربر'} ارسال شد.</b>\nبه محض تایید، گفت‌وگو آغاز خواهد شد.`,
        parse_mode: 'HTML'
      });
    }
  }

  // Handle Custom Bio Command (/setbio <text>)
  if (text.startsWith('/setbio')) {
    const newBio = text.replace('/setbio', '').trim();
    if (!newBio) {
      return callTgApi(BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        text: '✏️ <b>تنظیم بیوگرافی پروفایل:</b>\nبرای ثبت یا ویرایش بیوگرافی، دستور را همراه با متن بفرستید:\n\nمثال:\n<code>/setbio قهرمان تخته نرد چاژا و آماده رقابت 🎲</code>',
        parse_mode: 'HTML'
      });
    }
    const sanitizedBio = newBio.slice(0, 140);
    updateUser(userId, { bio: sanitizedBio });
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `✅ <b>بیوگرافی با موفقیت ذخیره شد:</b>\n<i>"${sanitizedBio}"</i>\nاین متن در کارت پروفایل و بنرهای شما در بازی‌ها نمایش داده می‌شود.`,
      parse_mode: 'HTML'
    });
  }

  // Handle Shop Command / Menu
  if (text === '/shop' || text.includes('فروشگاه') || text.toLowerCase() === 'shop') {
    const user = getUser(userId);
    const isEn = user.lang === 'en';
    const shopText = isEn
      ? `🛍️ <b>Chazha Cosmetics & Skins Mega Store</b>\n\n` +
        `🪙 Balance: <b>${(user.coins || 0).toLocaleString()} Coins</b>\n\n` +
        `Customize your account with:\n` +
        `• 🦅 <b>Faravahar Ancient Checkers Skin</b>\n` +
        `• 🖼️ <b>5-Banner Profile Carousel</b>\n` +
        `• 👑 <b>Royal Gold & Neon Avatar Frames</b>\n` +
        `• 💬 <b>Custom Glowing Chat Bubbles</b>\n\n` +
        `Tap below to open the interactive store:`
      : `🛍️ <b>فروشگاه بزرگ اقلام تزئینی، مهره‌ها و بنرهای چاژا</b>\n\n` +
        `🪙 موجودی شما: <b>${(user.coins || 0).toLocaleString()} سکه</b>\n\n` +
        `شخصی‌سازی ظاهر بازی با:\n` +
        `• 🦅 <b>مهره‌های منبت‌کاری شده فروهر باستان</b> (تخته نرد)\n` +
        `• 🖼️ <b>بنرهای ۵ تایی پروفایل</b> (تخت جمشید، طلای سلطنتی و...)\n` +
        `• 👑 <b>قاب‌های دور عکس آواتار</b> (طلایی، نئونی، سنگی)\n` +
        `• 💬 <b>حباب‌های پیام چت درخشان</b>\n\n` +
        `برای مشاهده و خرید اقلام با سکه، روی دکمه زیر بزنید:`;

    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: shopText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: isEn ? '🛍️ Open Chazha Store 🚀' : '🛍️ ورود به فروشگاه آنلاین چاژا 🚀', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } }],
          [{ text: isEn ? '⭐ Buy Coins (Stars)' : '⭐ خرید سکه با Telegram Stars', callback_data: 'shop_buy_coins' }],
          [{ text: isEn ? '💎 Pay with Crypto (TON / USDT)' : '💎 پرداخت با رمزارز (TON / USDT 🪙)', callback_data: 'crypto_pay_info' }]
        ]
      }
    });
  }

  // ----------------------------------------------------
  // PERSISTENT 4-BUTTON MENU ROUTER
  // ----------------------------------------------------
  // 1. Games & Tournaments Hub
  if (text.includes('بازی‌ها') || text.includes('Games') || text === '/games') {
    return sendAllGamesMenu(chatId, userId);
  }

  // 2. Wallet & Coins Hub
  if (text.includes('کیف‌پول') || text.includes('Wallet') || text.includes('خرید سکه') || text.includes('استارز') || text === '/wallet') {
    return sendWalletMenu(chatId, userId);
  }

  // 3. Tournaments & Leagues
  if (text.includes('مسابقات') || text.includes('لیگ‌ها') || text.includes('تورنمنت') || text.includes('Tournaments') || text === '/tournaments') {
    return sendTournamentsMenu(BOT_TOKEN, chatId, userId);
  }

  // 4. Player Profile Hub
  if (text.includes('پروفایل') || text.includes('Profile') || text.includes('آمار') || text === '/profile' || text === '/me') {
    return sendProfileMenu(chatId, userId);
  }

  // 5. Settings Hub
  if (text === '⚙️ تنظیمات' || text === '⚙️ Settings' || text === '/settings') {
    return sendSettingsMenu(chatId, userId);
  }

  // Individual Games Direct Launchers
  if (text.includes('حکم') || text === '/hokm') {
    return sendGameCard(chatId, 'hokm', userId);
  }

  if (text.includes('منچ') || text === '/ludo') {
    return sendGameCard(chatId, 'ludo', userId);
  }

  if (text.includes('پاسور') || text === '/pasur') {
    return sendGameCard(chatId, 'pasur', userId);
  }

  if (text.includes('تخته') || text === '/backgammon') {
    return sendGameCard(chatId, 'backgammon', userId);
  }

  if (text.includes('اسنوکر') || text.includes('بیلیارد') || text === '/snooker' || text === '/billiards') {
    return sendGameCard(chatId, 'snooker', userId);
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

  if (text.includes('تورنمنت') || text.includes('جام') || text === '/tournaments') {
    return sendTournamentsMenu(BOT_TOKEN, chatId, userId);
  }

  if (text.includes('ماموریت') || text === '/missions' || text === '/quests') {
    return sendMissionsMenu(BOT_TOKEN, chatId, userId);
  }

  if (text.includes('شرط') || text === '/duel') {
    return sendCreateStakesMatchMenu(BOT_TOKEN, chatId, userId, 'hokm');
  }

  if (text.includes('سلاح') || text.includes('پرتاب') || text === '/weapons') {
    return sendPlatoWeaponsShop(BOT_TOKEN, chatId, userId);
  }

  if (text.includes('صندوقچه') || text === '/chest') {
    return openMysteryChest(BOT_TOKEN, chatId, userId);
  }

  if (text.startsWith('/start') || text === '🔙 بازگشت به منوی اصلی' || text === '🔙 بازگشت') {
    return sendGamesDashboard(chatId, userId);
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

  // 1. Telegram Game Launcher (Play Snooker, Backgammon, etc.)
  if (cq.game_short_name) {
    let targetUrl = `${CONFIG.WEBAPP_URL}?app=chazha#/games/${cq.game_short_name}`;
    if (cq.inline_message_id) {
      targetUrl += `?room=tg_${cq.inline_message_id}&mode=online&autostart=1`;
    } else if (cq.game_short_name === 'backgammon' || cq.game_short_name === 'snooker') {
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
          [{ text: '🎲 دعوت به مسابقه تخته نرد ⚔️', url: getShareDuelUrl('backgammon', `CHZ-${userId}`) }]
        ]
      }
    }).catch(() => {});

    return callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
      callback_query_id: cq.id,
      text: `✅ شما و ${friendUser.name || 'کاربر چاژا'} اکنون دوست شدید!`,
      show_alert: true
    });
  }

  // 7. Launch Photo Showcase Cards for All Plato Games
  if (data === 'launch_hokm_card') {
    return sendGameCard(chatId, 'hokm', userId);
  }

  if (data === 'launch_ludo_card') {
    return sendGameCard(chatId, 'ludo', userId);
  }

  if (data === 'launch_pasur_card') {
    return sendGameCard(chatId, 'pasur', userId);
  }

  if (data === 'launch_backgammon_card') {
    return sendGameCard(chatId, 'backgammon', userId);
  }

  if (data === 'launch_snooker_card') {
    return sendGameCard(chatId, 'snooker', userId);
  }

  if (data === 'menu_all_games' || data === 'nav_games_menu') {
    return sendAllGamesMenu(chatId, userId);
  }

  if (data === 'nav_dashboard') {
    return sendGamesDashboard(chatId, userId);
  }

  if (data === 'nav_wallet') {
    return sendWalletMenu(chatId, userId);
  }

  // Plato Tournaments & Leagues
  if (data === 'menu_tournaments') {
    return sendTournamentsMenu(BOT_TOKEN, chatId, userId);
  }

  if (data.startsWith('register_tourn_')) {
    const tournKey = data.replace('register_tourn_', '').trim();
    return registerTournament(BOT_TOKEN, chatId, userId, tournKey);
  }

  if (data.startsWith('view_ticket_')) {
    const tournKey = data.replace('view_ticket_', '').trim();
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `🎟️ <b>وضعیت بلیط تورنمنت شما:</b>\nشما در این مسابقه ثبت‌نام کرده‌اید و صندلی مسابقه برای شما رزرو شده است. نیم ساعت قبل از شروع بازی لینک اتاق اختصاصی برایتان ارسال خواهد شد.`,
      parse_mode: 'HTML'
    });
  }

  // Plato Daily Missions & Quests
  if (data === 'menu_missions') {
    return sendMissionsMenu(BOT_TOKEN, chatId, userId);
  }

  if (data.startsWith('claim_mission_')) {
    const missionKey = data.replace('claim_mission_', '').trim();
    return claimMissionReward(BOT_TOKEN, chatId, userId, missionKey);
  }

  // Plato Weapons & Throwing Items Shop
  if (data === 'menu_weapons') {
    return sendPlatoWeaponsShop(BOT_TOKEN, chatId, userId);
  }

  if (data.startsWith('buy_weapon_')) {
    const weaponKey = data.replace('buy_weapon_', '').trim();
    return buyPlatoWeapon(BOT_TOKEN, chatId, userId, weaponKey);
  }

  // Daily Mystery Chest
  if (data === 'open_mystery_chest') {
    return openMysteryChest(BOT_TOKEN, chatId, userId);
  }

  // Custom Stakes Duel Match Creator
  if (data === 'setup_stakes_menu') {
    return sendCreateStakesMatchMenu(BOT_TOKEN, chatId, userId, 'hokm');
  }

  if (data.startsWith('setup_stake_')) {
    const gameKey = data.replace('setup_stake_', '').trim();
    return sendCreateStakesMatchMenu(BOT_TOKEN, chatId, userId, gameKey);
  }

  if (data.startsWith('create_duel_')) {
    const parts = data.replace('create_duel_', '').split('_');
    const gameKey = parts[0] || 'hokm';
    const stakeKey = parts[1] || 'free';
    return handleGenerateStakedDuel(BOT_TOKEN, chatId, userId, gameKey, stakeKey);
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
        url: getShareDuelUrl('backgammon', `CHZ-${userId}`)
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

    const shareRefUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent('🎁 بیا در چاژا عضو شو و ۵۰۰ سکه خوش‌آمدگویی هدیه بگیر! 🎮')}`;

    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: isEn ? '📤 Share Link' : '📤 ارسال لینک برای دوستان', url: shareRefUrl }]
        ]
      }
    });
  }

  // 14. Wallet: Crypto & TON Coin Payment Info
  if (data === 'crypto_pay_info') {
    const user = getUser(userId);
    const isEn = user.lang === 'en';
    const text = isEn
      ? `💎 <b>Cryptocurrency & TON Coin Payments</b>\n\n` +
        `Recharge your Chazha coins using <b>TON</b> or <b>USDT (TRC20 / TON)</b> with a <b>+20% bonus</b>!\n\n` +
        `👛 <b>Official Chazha TON Deposit Address:</b>\n` +
        `<code>EQB5ChazhaGamingTreasuryWalletOfficial2026TON</code>\n\n` +
        `⚡ <b>Instructions:</b>\n` +
        `1. Send your desired amount of TON or USDT.\n` +
        `2. In the transaction memo/comment, include your User ID: <code>${userId}</code>\n` +
        `3. Coins will be credited automatically within minutes!\n\n` +
        `For manual confirmation or assistance, contact support.`
      : `💎 <b>پرداخت با رمزارز و شبکه تون (TON / USDT)</b>\n\n` +
        `شارژ موجودی سکه چاژا از طریق <b>TON Coin</b> یا <b>تتر (USDT)</b> با <b>۲۰٪ بانس مضاعف</b>!\n\n` +
        `👛 <b>آدرس کیف‌پول رسمی چاژا در شبکه TON:</b>\n` +
        `<code>EQB5ChazhaGamingTreasuryWalletOfficial2026TON</code>\n\n` +
        `⚡ <b>راهنمای پرداخت:</b>\n` +
        `۱. مقدار دلخواه TON یا USDT را به آدرس بالا منتقل کنید.\n` +
        `۲. در قسمت کامنت/ممو تراکنش، شناسه کاربری خود را بنویسید: <code>${userId}</code>\n` +
        `۳. سکه‌ها به صورت آنی به حسابتان افزوده می‌شوند.\n\n` +
        `در صورت نیاز به راهنمایی با پشتیبانی در ارتباط باشید.`;

    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: isEn ? '💬 Support Contact' : '💬 ارتباط با پشتیبانی', url: 'https://t.me/chazha_bot' }],
          [{ text: isEn ? '🔙 Back to Wallet' : '🔙 بازگشت به کیف‌پول', callback_data: 'nav_wallet' }]
        ]
      }
    });
  }

  // 15. Navigation: Back to Wallet
  if (data === 'nav_wallet') {
    return sendWalletMenu(chatId, userId);
  }

  // 16. Profile: Prompt Set Bio
  if (data === 'prompt_set_bio') {
    return callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: '✏️ <b>تنظیم یا ویرایش بیوگرافی پروفایل:</b>\nپیام خود را به صورت دستور ارسال کنید:\n\n<code>/setbio متن دلخواه شما</code>\n\nمثال:\n<code>/setbio قهرمان تخته نرد چاژا و آماده رقابت‌های سنگین 🎲</code>',
      parse_mode: 'HTML'
    });
  }

  // 17. In-Game Chat Accept
  if (data.startsWith('chat_accept_')) {
    const requesterId = data.replace('chat_accept_', '').trim();
    const requester = getUser(requesterId);
    const currentUser = getUser(userId, cq.from.first_name);

    callTgApi(BOT_TOKEN, 'sendMessage', {
      chat_id: requesterId,
      text: `🎉 <b>${currentUser.name || 'کاربر چاژا'} درخواست گفت‌وگو را قبول کرد!</b>\nاکنون می‌توانید در ربات برای یکدیگر پیام بفرستید یا مسابقه دهید:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎲 دعوت به مسابقه تخته نرد ⚔️', url: getShareDuelUrl('backgammon', `CHZ-${userId}`) }]
        ]
      }
    }).catch(() => {});

    return callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
      callback_query_id: cq.id,
      text: `✅ گفت‌وگو با ${requester.name || 'کاربر'} تایید شد!`,
      show_alert: true
    });
  }

  // 18. In-Game Chat Decline
  if (data.startsWith('chat_decline_')) {
    return callTgApi(BOT_TOKEN, 'answerCallbackQuery', {
      callback_query_id: cq.id,
      text: 'درخواست گفت‌وگو لغو شد.',
      show_alert: false
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
    if (query.startsWith('SNOO-') || query.startsWith('snooker')) {
      gameType = 'snooker';
      gameTitle = 'اسنوکر شاهانه';
      roomCode = query.startsWith('SNOO-') ? query : (query.split(' ')[1] || `SNOO-${senderId}`);
    } else if (query.startsWith('BACK-') || query.startsWith('backgammon')) {
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
      if (roomCode.startsWith('SNOO-')) { gameType = 'snooker'; gameTitle = 'اسنوکر شاهانه'; }
      else if (roomCode.startsWith('HOKM-')) { gameType = 'hokm'; gameTitle = 'حکم'; }
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
  const photoUrl = GAME_BANNER_PHOTOS[gameType] || GAME_BANNER_PHOTOS.default;

  // Rich multi-game cards for inline sharing
  const gamesToShare = query ? [{ type: gameType, title: gameTitle, code: roomCode, photo: photoUrl }] : [
    { type: 'hokm', title: 'حکم ۴ نفره آنلاین', code: `HOKM-${senderId}`, photo: GAME_BANNER_PHOTOS.hokm },
    { type: 'backgammon', title: 'تخته نرد شاهانه', code: `BACK-${senderId}`, photo: GAME_BANNER_PHOTOS.backgammon },
    { type: 'ludo', title: 'منچ دورهمی شاد', code: `LUDO-${senderId}`, photo: GAME_BANNER_PHOTOS.ludo },
    { type: 'pasur', title: 'پاسور چهاربرگ کلاسیک', code: `PASS-${senderId}`, photo: GAME_BANNER_PHOTOS.pasur },
    { type: 'snooker', title: 'اسنوکر و بیلیارد سه‌بعدی', code: `SNOO-${senderId}`, photo: GAME_BANNER_PHOTOS.snooker }
  ];

  const results = gamesToShare.map((g, idx) => {
    const url = `${CONFIG.WEBAPP_URL}?app=chazha#/games/${g.type}?room=${g.code}&mode=online&role=black&autostart=1`;
    return {
      type: 'photo',
      id: `duel_photo_${g.type}_${senderId}_${idx}`,
      photo_url: g.photo || GAME_BANNER_PHOTOS.default,
      thumb_url: g.photo || GAME_BANNER_PHOTOS.default,
      title: `⚔️ ارسال چالش مسابقه ${g.title}`,
      description: `کد اتاق: ${g.code} • کارت تصویری همراه با دکمه ورود مستقیم`,
      caption: `🎮 <b>چالش مسابقه آنلاین ${g.title} در چاژا!</b>\n\n👤 <b>${senderName}</b> شما را به مسابقه دوئل آنلاین دعوت کرده است!\n⚔️ کد اتاق مسابقه: <code>${g.code}</code>\n\n👇 برای ورود به میز بازی، روی دکمه زیر بزنید:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{
            text: `🎲 ورود به بازی ${g.title} ⚔️`,
            web_app: { url }
          }],
          [{
            text: '❌ رد چالش مسابقه',
            callback_data: `bg_decline_duel_${senderId}`
          }]
        ]
      }
    };
  });

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
      text: '🎮 بازی کن (Play)',
      url: `${CONFIG.WEBAPP_URL}?app=chazha#/games`
    },
    commands: [
      { command: 'start', description: '🚀 کنسول بازی‌های چاژا' },
      { command: 'tournaments', description: '🏆 لیگ‌ها و جام‌های هفتگی' },
      { command: 'missions', description: '🎯 ماموریت‌های روزانه و پاداش' },
      { command: 'duel', description: '⚔️ ساخت میز مسابقه با شرط سکه' },
      { command: 'weapons', description: '🍅 زرادخانه اقلام پرتابی پلاتو' },
      { command: 'chest', description: '🎁 صندوقچه شانس روزانه' },
      { command: 'hokm', description: '🂡 حکم ۴ نفره آنلاین' },
      { command: 'ludo', description: '🎲 منچ دورهمی شاد' },
      { command: 'pasur', description: '🃏 پاسور چهاربرگ' },
      { command: 'backgammon', description: '🪵 تخته نرد شاهانه' },
      { command: 'snooker', description: '🎱 اسنوکر و بیلیارد ۳D' },
      { command: 'wheel', description: '🎡 گردونه شانس روزانه' },
      { command: 'top', description: '🏆 جدول برترین قهرمانان' },
      { command: 'wallet', description: '💎 خزانه‌داری، کیف‌پول و VIP' }
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
