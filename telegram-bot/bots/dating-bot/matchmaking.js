/**
 * ============================================================================
 * 💬 حُذا (Whoza) Social Matchmaking, Anonymous Chat & VIP Lounge Engine
 * ============================================================================
 */

const crypto = require('crypto');
const { db, saveDb, getUser, addXp, addCoins } = require('../../shared/db');
const { callTgApi } = require('../../shared/telegram');
const { t } = require('../../shared/i18n');

const waitingQueue = [];         // Chat Matchmaking Queue: [{ userId, filterType, joinedAt }]
const activePairs = new Map();   // userId -> partnerUserId
const vipLoungeMembers = new Set(); // User IDs currently in Royal VIP Lounge

// ----------------------------------------------------
// 1. FILTER MENUS
// ----------------------------------------------------
async function sendFilterMenu(botToken, chatId, userId) {
  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: '🎲 جستجوی شانسی (رایگان)', callback_data: 'filter_random' }],
      [{ text: '🌈 چت بر اساس حس‌وحال و مود روحی 💫', callback_data: 'open_mood_menu' }],
      [{ text: '👩 اتصال به دختر (۵۰ سکه)', callback_data: 'filter_female' }, { text: '👨 اتصال به پسر (۵۰ سکه)', callback_data: 'filter_male' }],
      [{ text: '➕ گزینه‌های دیگر و فیلترهای پیشرفته...', callback_data: 'open_other_filters' }]
    ]
  };

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: '🙈 <b>به کی دوست داری وصل شی؟ انتخاب کن:</b> 👇',
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  });
}

async function sendMoodSelectMenu(botToken, chatId, userId) {
  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: '🌈 <b>حس‌وحال (مود) امروزت رو انتخاب کن:</b>\nربات حُذا شما رو دقیقاً به کسی وصل می‌کنه که الان در همین فرکانس روحی قرار داره:',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🕊️ دردودل و گوش شنوا (آرامش و کاهش تنهایی)', callback_data: 'mood_match_venting' }],
        [{ text: '🚀 پرانرژی، شاد و اهل شوخی و خنده', callback_data: 'mood_match_funny' }],
        [{ text: '🎧 عاشق موزیک، هنر، فیلم و کتاب', callback_data: 'mood_match_art' }],
        [{ text: '☕ گفتگوی عمیق، فکری و تجربیات زندگی', callback_data: 'mood_match_deep' }],
        [{ text: '🎮 اهل بازی، کل‌کل و سرگرمی آنلاین', callback_data: 'mood_match_gaming' }],
        [{ text: '🔙 بازگشت به منوی چت', callback_data: 'back_to_chat_filters' }]
      ]
    }
  });
}

async function sendOtherFiltersMenu(botToken, chatId, userId) {
  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: '⚙️ <b>گزینه‌های دیگر و فیلترهای تکمیلی چت:</b>',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '👑 تالار چت گروهی VIP', callback_data: 'enter_vip_lounge' }],
        [{ text: '💬 چت هم‌زبان (فارسی‌زبانان)', callback_data: 'filter_samelang' }, { text: '🌍 چت بین‌المللی (Global)', callback_data: 'filter_global' }],
        [{ text: '🛰️ افراد نزدیک و همشهری (۳۰ سکه)', callback_data: 'filter_province' }],
        [{ text: '🔙 بازگشت به منوی چت', callback_data: 'back_to_chat_filters' }]
      ]
    }
  });
}

// ----------------------------------------------------
// 2. MATCHMAKING QUEUE & DISPATCH
// ----------------------------------------------------
async function executeMatchSearch(botToken, chatId, userId, filterType = 'random') {
  const user = getUser(userId);

  if (activePairs.has(userId)) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: '⚠️ شما در حال حاضر در یک مکالمه فعال هستید. ابتدا از دکمه «🛑 پایان گفتگو» استفاده کنید.'
    });
  }

  // Coin Deduction Checks for premium filters
  if (!user.is_vip) {
    if ((filterType === 'female' || filterType === 'male') && (user.coins || 0) < 50) {
      return callTgApi(botToken, 'sendMessage', {
        chat_id: chatId,
        text: t(userId, 'lowCoinsNotice', { cost: 50, coins: user.coins || 0 }),
        parse_mode: 'HTML'
      });
    }
    if (filterType === 'province' && (user.coins || 0) < 30) {
      return callTgApi(botToken, 'sendMessage', {
        chat_id: chatId,
        text: t(userId, 'lowCoinsNotice', { cost: 30, coins: user.coins || 0 }),
        parse_mode: 'HTML'
      });
    }
  }

  // Find partner in queue
  let partnerIdx = -1;
  for (let i = 0; i < waitingQueue.length; i++) {
    const candidate = waitingQueue[i];
    if (candidate.userId === userId) continue;
    const cUser = getUser(candidate.userId);

    // Block checks
    if ((user.blocked || []).includes(candidate.userId)) continue;
    if ((cUser.blocked || []).includes(userId)) continue;

    // Filter validation
    if (filterType === 'female' && cUser.gender !== 'female') continue;
    if (filterType === 'male' && cUser.gender !== 'male') continue;
    if (filterType === 'province' && cUser.province !== user.province) continue;
    if (filterType.startsWith('mood_') && candidate.filterType !== filterType) continue;

    partnerIdx = i;
    break;
  }

  if (partnerIdx > -1) {
    const partner = waitingQueue.splice(partnerIdx, 1)[0];
    const partnerId = partner.userId;
    const partnerUser = getUser(partnerId);

    // Deduct coins if applicable
    if (!user.is_vip) {
      if (filterType === 'female' || filterType === 'male') user.coins -= 50;
      if (filterType === 'province') user.coins -= 30;
      saveDb();
    }

    activePairs.set(userId, partnerId);
    activePairs.set(partnerId, userId);

    const userBadge = `${user.gender === 'female' ? '👩 دختر' : '👨 پسر'} | ${user.age || 'نامشخص'} | ${user.province || 'ایران'}`;
    const partnerBadge = `${partnerUser.gender === 'female' ? '👩 دختر' : '👨 پسر'} | ${partnerUser.age || 'نامشخص'} | ${partnerUser.province || 'ایران'}`;

    const chatReplyKeyboard = {
      keyboard: [
        [{ text: '⏭️ هم‌صحبت بعدی' }, { text: '🛑 پایان گفتگو' }],
        [{ text: '🪪 مشخصات هم‌صحبت' }, { text: '🎁 ارسال هدیه' }],
        [{ text: '🎲 سوال یخ‌شکن' }, { text: '💖 ارسال آیدی تلگرام' }]
      ],
      resize_keyboard: true
    };

    callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: t(userId, 'matched', { badge: partnerBadge, karma: partnerUser.karma || 100, lvl: partnerUser.level || 1 }),
      parse_mode: 'HTML',
      reply_markup: chatReplyKeyboard
    });

    callTgApi(botToken, 'sendMessage', {
      chat_id: partnerId,
      text: t(partnerId, 'matched', { badge: userBadge, karma: user.karma || 100, lvl: user.level || 1 }),
      parse_mode: 'HTML',
      reply_markup: chatReplyKeyboard
    });

    db.stats.totalChatsCompleted = (db.stats.totalChatsCompleted || 0) + 1;
    saveDb();
    return;
  }

  // Add to queue
  const existingIdx = waitingQueue.findIndex(q => q.userId === userId);
  if (existingIdx > -1) waitingQueue.splice(existingIdx, 1);

  waitingQueue.push({ userId, filterType, joinedAt: Date.now() });

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: t(userId, 'searching'),
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '❌ لغو جستجو', callback_data: 'cancel_chat_search' }]]
    }
  });
}

// ----------------------------------------------------
// 3. STOP CHAT & KARMA RATING
// ----------------------------------------------------
async function stopChat(botToken, userId) {
  if (!activePairs.has(userId)) return;

  const partnerId = activePairs.get(userId);
  activePairs.delete(userId);
  activePairs.delete(partnerId);

  // Send end notices
  callTgApi(botToken, 'sendMessage', {
    chat_id: userId,
    text: t(userId, 'chatEndedSelf'),
    parse_mode: 'HTML'
  });

  callTgApi(botToken, 'sendMessage', {
    chat_id: partnerId,
    text: t(partnerId, 'chatEndedPartner'),
    parse_mode: 'HTML'
  });

  // Prompt karma evaluation
  sendKarmaPrompt(botToken, userId, partnerId);
  sendKarmaPrompt(botToken, partnerId, userId);
}

function sendKarmaPrompt(botToken, forUserId, targetUserId) {
  callTgApi(botToken, 'sendMessage', {
    chat_id: forUserId,
    text: t(forUserId, 'karmaPrompt'),
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: t(forUserId, 'karmaGreat'), callback_data: `rate_karma_${targetUserId}_great` }],
        [{ text: t(forUserId, 'karmaPolite'), callback_data: `rate_karma_${targetUserId}_polite` }],
        [{ text: t(forUserId, 'karmaInspiring'), callback_data: `rate_karma_${targetUserId}_inspiring` }]
      ]
    }
  }).catch(() => {});
}

// ----------------------------------------------------
// 4. MESSAGE RELAY
// ----------------------------------------------------
async function relayMessage(botToken, msg, partnerId) {
  const options = { chat_id: partnerId };

  if (msg.text) {
    return callTgApi(botToken, 'sendMessage', { ...options, text: msg.text });
  } else if (msg.voice) {
    return callTgApi(botToken, 'sendVoice', { ...options, voice: msg.voice.file_id, caption: msg.caption || '' });
  } else if (msg.photo && msg.photo.length > 0) {
    const highestPhoto = msg.photo[msg.photo.length - 1];
    return callTgApi(botToken, 'sendPhoto', { ...options, photo: highestPhoto.file_id, caption: msg.caption || '' });
  } else if (msg.sticker) {
    return callTgApi(botToken, 'sendSticker', { ...options, sticker: msg.sticker.file_id });
  } else if (msg.video) {
    return callTgApi(botToken, 'sendVideo', { ...options, video: msg.video.file_id, caption: msg.caption || '' });
  } else if (msg.audio) {
    return callTgApi(botToken, 'sendAudio', { ...options, audio: msg.audio.file_id, caption: msg.caption || '' });
  }
}

// ----------------------------------------------------
// 5. IN-CHAT GIFTS
// ----------------------------------------------------
const GIFTS = {
  rose: { name: '🌹 شاخه گل رز', cost: 30, xp: 10 },
  coffee: { name: '☕ فنجان قهوه داغ', cost: 50, xp: 20 },
  diamond: { name: '💎 الماس درخشان', cost: 200, xp: 80 },
  crown: { name: '👑 تاج پادشاهی', cost: 500, xp: 200 },
  car: { name: '🏎️ ماشین سوپراسپرت', cost: 1000, xp: 500 }
};

async function sendInChatGiftsMenu(botToken, chatId, userId) {
  if (!activePairs.has(userId)) {
    return callTgApi(botToken, 'sendMessage', { chat_id: chatId, text: '⚠️ شما در حال حاضر با کسی در حال گفتگو نیستید!' });
  }

  const buttons = Object.entries(GIFTS).map(([key, gift]) => ([{
    text: `${gift.name} (${gift.cost} سکه)`,
    callback_data: `send_gift_${key}`
  }]));

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: '🎁 <b>ارسال هدیه به هم‌صحبت:</b>\nیک هدیه برای خوشحال کردن طرف مقابل انتخاب کنید:',
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  });
}

async function handleSendGift(botToken, userId, giftType) {
  if (!activePairs.has(userId)) return;
  const partnerId = activePairs.get(userId);
  const gift = GIFTS[giftType];
  if (!gift) return;

  const sender = getUser(userId);
  if ((sender.coins || 0) < gift.cost) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: userId,
      text: t(userId, 'lowCoinsNotice', { cost: gift.cost, coins: sender.coins || 0 }),
      parse_mode: 'HTML'
    });
  }

  sender.coins -= gift.cost;
  addCoins(partnerId, Math.round(gift.cost * 0.7)); // partner receives 70% of coin value
  addXp(userId, gift.xp);
  saveDb();

  callTgApi(botToken, 'sendMessage', {
    chat_id: userId,
    text: `✅ هدیه <b>${gift.name}</b> با موفقیت برای هم‌صحبت ارسال شد! (-${gift.cost} سکه | +${gift.xp} XP)`,
    parse_mode: 'HTML'
  });

  callTgApi(botToken, 'sendMessage', {
    chat_id: partnerId,
    text: `🎁 <b>تبریک! هم‌صحبت شما برای شما یک «${gift.name}» فرستاد! (+${Math.round(gift.cost * 0.7)} سکه هدیه)</b>`,
    parse_mode: 'HTML'
  });
}

// ----------------------------------------------------
// 6. ICEBREAKER QUESTIONS
// ----------------------------------------------------
const ICEBREAKERS = [
  'اگر قرار بود فقط یک موسیقی تا آخر عمر گوش بدی، اون چی بود؟',
  'بزرگ‌ترین رویایی که در حال حاضر داری چیه؟',
  'ترجیح میدی بتونی در زمان سفر کنی یا نامرئی بشی؟',
  'بهترین کتاب یا فیلمی که تا حالا دیدی و دیدت رو به زندگی تغییر داده چی بوده؟',
  'اگر همین الان بتونی به هر جای دنیا سفر کنی، کجا میری؟'
];

async function triggerIcebreaker(botToken, userId) {
  if (!activePairs.has(userId)) return;
  const partnerId = activePairs.get(userId);
  const q = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];

  const text = `🎲 <b>سوال یخ‌شکن برای گرم شدن گفتگو:</b>\n\n💭 <i>«${q}»</i>`;

  callTgApi(botToken, 'sendMessage', { chat_id: userId, text, parse_mode: 'HTML' });
  callTgApi(botToken, 'sendMessage', { chat_id: partnerId, text, parse_mode: 'HTML' });
}

module.exports = {
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
};
