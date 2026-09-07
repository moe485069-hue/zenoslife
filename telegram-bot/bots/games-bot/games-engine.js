/**
 * ============================================================================
 * 🎮 چاژا (Chazha) Games Engine & Realtime Matchmaking
 * ============================================================================
 */

const crypto = require('crypto');
const { CONFIG } = require('../../shared/config');
const { db, saveDb, getUser, addXp, addCoins } = require('../../shared/db');
const { callTgApi } = require('../../shared/telegram');

const onlineGameQueues = {
  rps: [],
  dice: [],
  trivia: []
};

const activeGames = new Map(); // gameId -> Game State

// ----------------------------------------------------
// 1. TRIVIA QUESTIONS BANK
// ----------------------------------------------------
const TRIVIA_QUESTIONS = [
  { q: 'پایتخت باستانی هخامنشیان کدام شهر بود؟', options: ['تخت جمشید (پارسه)', 'بابل', 'شوش', 'اصفهان'], ans: 0 },
  { q: 'کدام عنصر با نماد Fe در جدول تناوبی شناخته می‌شود؟', options: ['طلا', 'آهن', 'مس', 'روی'], ans: 1 },
  { q: 'بزرگ‌ترین سیاره منظومه شمسی کدام است؟', options: ['مریخ', 'زحل', 'مشتری', 'زمین'], ans: 2 },
  { q: 'کتاب «بوف کور» اثر کدام نویسنده بزرگ ایرانی است؟', options: ['جلال آل‌احمد', 'صادق هدایت', 'بزرگ علوی', 'سهراب سپهری'], ans: 1 },
  { q: 'سرعت نور در خلاء تقریباً چند کیلومتر بر ثانیه است؟', options: ['۱۵۰,۰۰۰', '۲۵۰,۰۰۰', '۳۰۰,۰۰۰', '۳۵۰,۰۰۰'], ans: 2 },
  { q: 'کدام ارگان در بدن مسئول تصفیه خون و تولید ادرار است؟', options: ['کبد', 'کلیه', 'طحال', 'ریه'], ans: 1 },
  { q: 'قدیمی‌ترین دانشگاه جهان با فعالیت مداوم کدام است؟', options: ['آکسفورد', 'القرویین مراکش', 'بولونیا', 'هاروارد'], ans: 1 },
  { q: 'اولین کشور قهرمان جام جهانی فوتبال در تاریخ کدام بود؟', options: ['برزیل', 'اروگوئه', 'ایتالیا', 'آرژانتین'], ans: 1 },
  { q: 'کدام زبان برنامه‌نویسی برای اولین بار در سال ۱۹۹۵ توسط برندان آیک خلق شد؟', options: ['جاوااسکریپت', 'پایتون', 'سی پلاس پلاس', 'پی اچ پی'], ans: 0 },
  { q: 'در شاهنامه فردوسی، نام پدر رستم چیست؟', options: ['سام', 'زال', 'سهراب', 'نریمان'], ans: 1 }
];

// ----------------------------------------------------
// 2. ROCK PAPER SCISSORS
// ----------------------------------------------------
async function playRpsVsBot(botToken, chatId, userId, userMove) {
  const moves = ['rock', 'paper', 'scissors'];
  const moveIcons = { rock: '🪨 سنگ', paper: '📄 کاغذ', scissors: '✂️ قیچی' };
  const botMove = moves[Math.floor(Math.random() * moves.length)];

  let resultText = '';
  if (userMove === botMove) {
    resultText = `🤝 <b>مساوی شد!</b>\nشما: ${moveIcons[userMove]} | ربات چاژا: ${moveIcons[botMove]}`;
  } else if (
    (userMove === 'rock' && botMove === 'scissors') ||
    (userMove === 'paper' && botMove === 'rock') ||
    (userMove === 'scissors' && botMove === 'paper')
  ) {
    addCoins(userId, 40);
    addXp(userId, 20);
    db.stats.totalMatchesPlayed = (db.stats.totalMatchesPlayed || 0) + 1;
    saveDb();
    resultText = `🎉 <b>شما برنده شدید! (+۴۰ سکه 🪙 | +۲۰ XP)</b>\nشما: ${moveIcons[userMove]} | ربات چاژا: ${moveIcons[botMove]}`;
  } else {
    addCoins(userId, -10);
    resultText = `💔 <b>ربات چاژا برنده شد! (-۱۰ سکه 🪙)</b>\nشما: ${moveIcons[userMove]} | ربات چاژا: ${moveIcons[botMove]}`;
  }

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: resultText,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🪨 سنگ', callback_data: 'bot_rps_rock' },
          { text: '📄 کاغذ', callback_data: 'bot_rps_paper' },
          { text: '✂️ قیچی', callback_data: 'bot_rps_scissors' }
        ],
        [{ text: '🔄 یک دست دیگر', callback_data: 'prompt_mode_rps' }]
      ]
    }
  });
}

// ----------------------------------------------------
// 3. ANIMATED DICE
// ----------------------------------------------------
async function playDiceVsBot(botToken, chatId, userId) {
  const user = getUser(userId);
  if ((user.coins || 0) < 20) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: '⚠️ موجودی سکه شما برای شرکت در رولت تاس کمتر از ۲۰ سکه است!',
      parse_mode: 'HTML'
    });
  }

  // User roll
  const userDiceMsg = await callTgApi(botToken, 'sendDice', { chat_id: chatId, emoji: '🎲' });
  const userVal = userDiceMsg.dice.value;

  // Bot roll after short delay
  await new Promise(r => setTimeout(r, 2500));
  const botDiceMsg = await callTgApi(botToken, 'sendDice', { chat_id: chatId, emoji: '🎲' });
  const botVal = botDiceMsg.dice.value;

  await new Promise(r => setTimeout(r, 2000));

  let outcome = '';
  if (userVal > botVal) {
    addCoins(userId, 50);
    addXp(userId, 25);
    db.stats.totalMatchesPlayed = (db.stats.totalMatchesPlayed || 0) + 1;
    saveDb();
    outcome = `🎉 <b>تبریک! شما با تاس ${userVal} در برابر ${botVal} برنده شدید! (+۵۰ سکه 🪙)</b>`;
  } else if (userVal < botVal) {
    addCoins(userId, -20);
    outcome = `💔 <b>ربات چاژا با تاس ${botVal} در برابر ${userVal} برنده شد! (-۲۰ سکه 🪙)</b>`;
  } else {
    outcome = `🤝 <b>مساوی! هر دو تاس ${userVal} آوردید.</b>`;
  }

  recordMissionProgress(userId, 'roll_dice');

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: outcome,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '🎲 پرتاب مجدد تاس', callback_data: 'play_bot_dice' }]]
    }
  });
}

// ----------------------------------------------------
// 4. TRIVIA QUIZ
// ----------------------------------------------------
async function sendTriviaQuestion(botToken, chatId, userId) {
  const qObj = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
  const quizId = crypto.randomUUID();

  activeGames.set(quizId, {
    userId,
    qObj,
    startTime: Date.now()
  });

  const buttons = qObj.options.map((opt, idx) => ([{
    text: opt,
    callback_data: `ans_trivia_${quizId}_${idx}`
  }]));

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: `🧠 <b>مسابقه هوش و اطلاعات عمومی چاژا:</b>\n\n❓ <b>${qObj.q}</b>`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  });
}

async function handleTriviaAnswer(botToken, chatId, userId, quizId, selectedIdx) {
  const game = activeGames.get(quizId);
  if (!game) {
    return callTgApi(botToken, 'sendMessage', { chat_id: chatId, text: '⌛ زمان پاسخگویی به این سوال به پایان رسیده است.' });
  }

  activeGames.delete(quizId);
  const correct = selectedIdx === game.qObj.ans;
  recordMissionProgress(userId, 'trivia_quiz');

  if (correct) {
    addCoins(userId, 60);
    addXp(userId, 30);
    db.stats.totalMatchesPlayed = (db.stats.totalMatchesPlayed || 0) + 1;
    saveDb();
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `🎉 <b>پاسخ کاملاً صحیح است!</b>\nپاسخ درست: <b>${game.qObj.options[game.qObj.ans]}</b>\n🎁 جایزه: <b>+۶۰ سکه 🪙 و +۳۰ XP</b>`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '🧠 سوال بعدی', callback_data: 'play_trivia_quiz' }]] }
    });
  } else {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `❌ <b>پاسخ اشتباه بود!</b>\nپاسخ صحیح: <b>${game.qObj.options[game.qObj.ans]}</b> بود.`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '🔄 تلاش مجدد', callback_data: 'play_trivia_quiz' }]] }
    });
  }
}

// ----------------------------------------------------
// 5. SPIN THE WHEEL
// ----------------------------------------------------
async function spinWheel(botToken, chatId, userId) {
  const user = getUser(userId);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isFree = user.last_wheel_date !== todayStr;

  if (!isFree && (user.coins || 0) < 20) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `⚠️ چرخش‌های بعدی گردونه نیاز به <b>۲۰ سکه</b> دارند. موجودی فعلی: <b>${user.coins || 0}</b>`,
      parse_mode: 'HTML'
    });
  }

  if (!isFree) user.coins -= 20;
  user.last_wheel_date = todayStr;
  recordMissionProgress(userId, 'lucky_wheel');

  const prizes = [
    { label: '۵۰ سکه 🪙', coins: 50, xp: 10 },
    { label: '۱۰۰ سکه 💰', coins: 100, xp: 20 },
    { label: '۳۰ XP ⚡', coins: 20, xp: 30 },
    { label: '۲۵۰ سکه 💎', coins: 250, xp: 50 },
    { label: '۵۰۰ سکه 👑', coins: 500, xp: 100 },
    { label: '۱ روز اشتراک VIP 🌟', coins: 100, xp: 50, isVip: true }
  ];

  const won = prizes[Math.floor(Math.random() * prizes.length)];
  user.coins = (user.coins || 0) + won.coins;
  addXp(userId, won.xp);
  if (won.isVip) {
    user.is_vip = true;
    user.vip_expires_at = Math.max(user.vip_expires_at || 0, Date.now()) + 86400000;
  }
  saveDb();

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: `🎡 <b>تبریک! گردونه شانس روی «${won.label}» متوقف شد!</b>\n🪙 موجودی جدید شما: <b>${user.coins.toLocaleString()}</b> سکه`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [[{ text: '🔄 چرخش مجدد (۲۰ سکه)', callback_data: 'spin_wheel_action' }]] }
  });
}

// ----------------------------------------------------
// 6. LEADERBOARD
// ----------------------------------------------------
async function sendGameLeaderboard(botToken, chatId) {
  const users = Object.values(db.users);
  const topCoins = users.sort((a, b) => (b.coins || 0) - (a.coins || 0)).slice(0, 10);

  let text = '🏆 <b>جدول قهرمانان و ثروتمندترین بازیکنان چاژا:</b>\n\n';
  topCoins.forEach((u, i) => {
    const medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : `${i + 1}.`));
    text += `${medal} <b>${u.name || 'کاربر چاژا'}</b>: ${(u.coins || 0).toLocaleString()} سکه (Lvl ${u.level || 1})\n`;
  });

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  });
}

// ----------------------------------------------------
// 7. DAILY MISSIONS & QUESTS SYSTEM
// ----------------------------------------------------
function getDailyMissions(userId) {
  const user = getUser(userId);
  const todayStr = new Date().toISOString().slice(0, 10);
  if (!user.missions_date || user.missions_date !== todayStr) {
    user.missions_date = todayStr;
    user.missions = {
      roll_dice: { title: '🎲 شرکت در دوئل تاس رولت', target: 1, current: 0, rewardCoins: 60, rewardXp: 30, claimed: false },
      trivia_quiz: { title: '🧠 پاسخ به مسابقه اطلاعات عمومی و هوش', target: 1, current: 0, rewardCoins: 80, rewardXp: 40, claimed: false },
      lucky_wheel: { title: '🎡 چرخاندن گردونه شانس امروز', target: 1, current: 0, rewardCoins: 50, rewardXp: 25, claimed: false },
      play_lounge: { title: '🎪 ورود به سالن بازی‌ها و کل‌کل با حریفان', target: 1, current: 1, rewardCoins: 100, rewardXp: 50, claimed: false }
    };
    saveDb();
  }
  return user.missions;
}

function recordMissionProgress(userId, missionKey) {
  const user = getUser(userId);
  const missions = getDailyMissions(userId);
  if (missions[missionKey] && missions[missionKey].current < missions[missionKey].target) {
    missions[missionKey].current += 1;
    saveDb();
  }
}

async function sendMissionsMenu(botToken, chatId, userId) {
  const missions = getDailyMissions(userId);
  const user = getUser(userId);

  let text = `🎯 <b>ماموریت‌های روزانه و جوایز گیمری چاژا</b>\n` +
             `━━━━━━━━━━━━━━━━━━━━\n` +
             `📅 تاریخ امروز: <b>${new Date().toLocaleDateString('fa-IR')}</b>\n` +
             `🪙 موجودی شما: <b>${(user.coins || 0).toLocaleString()}</b> | سطح: <b>Level ${user.level || 1}</b>\n\n` +
             `با انجام هر ماموریت روزانه، دکمه دریافت پاداش را بزنید:\n\n`;

  const buttons = [];

  for (const [key, m] of Object.entries(missions)) {
    const isDone = m.current >= m.target;
    const icon = m.claimed ? '✅' : (isDone ? '🎁' : '⏳');
    const statusText = m.claimed ? '(دریافت شد)' : (isDone ? '<b>[آماده دریافت]</b>' : `(${m.current}/${m.target})`);

    text += `${icon} <b>${m.title}</b>\n` +
            `    پاداش: <b>+${m.rewardCoins} سکه 🪙</b> • <b>+${m.rewardXp} XP ⚡</b> ${statusText}\n\n`;

    if (isDone && !m.claimed) {
      buttons.push([{ text: `🎁 دریافت پاداش (${m.rewardCoins} سکه)`, callback_data: `claim_mission_${key}` }]);
    }
  }

  buttons.push([
    { text: '🎲 پرتاب تاس', callback_data: 'play_bot_dice' },
    { text: '🧠 مسابقه کوئیز', callback_data: 'play_trivia_quiz' },
    { text: '🎡 گردونه شانس', callback_data: 'spin_wheel_action' }
  ]);
  buttons.push([
    { text: '🎪 ورود به سالن بازی‌ها', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } },
    { text: '🔙 بازگشت به کنسول', callback_data: 'nav_dashboard' }
  ]);

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  });
}

async function claimMissionReward(botToken, chatId, userId, missionKey) {
  const user = getUser(userId);
  const missions = getDailyMissions(userId);
  const m = missions[missionKey];

  if (!m || m.current < m.target || m.claimed) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: '⚠️ این پاداش قبلاً دریافت شده یا هنوز ماموریت تکمیل نشده است.'
    });
  }

  m.claimed = true;
  user.coins = (user.coins || 0) + m.rewardCoins;
  addXp(userId, m.rewardXp);
  saveDb();

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: `🎉 <b>پاداش ماموریت روزانه با موفقیت دریافت شد!</b>\n\n` +
          `🎁 پاداش واریزی: <b>+${m.rewardCoins} سکه 🪙</b> و <b>+${m.rewardXp} XP ⚡</b>\n` +
          `🪙 موجودی جدید شما: <b>${user.coins.toLocaleString()}</b> سکه طلا`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '🎯 مشاهده بقیه ماموریت‌ها', callback_data: 'menu_missions' }]]
    }
  });
}

// ----------------------------------------------------
// 8. TOURNAMENTS & LEAGUES ENGINE
// ----------------------------------------------------
const TOURNAMENTS = {
  hokm: {
    id: 'hokm',
    title: '🂡 جام بزرگ هفتگی حکم ۴ نفره (Hokm Grand League)',
    prize: '۲,۵۰۰ ستاره تلگرام ⭐ + ۵۰,۰۰۰ سکه 🪙',
    entryFee: 100,
    schedule: 'جمعه‌ها ساعت ۲۱:۰۰ به وقت تهران'
  },
  backgammon: {
    id: 'backgammon',
    title: '🪵 جام قهرمانان تخته‌نرد شاهانه کوروش',
    prize: '۱,۰۰۰ ستاره تلگرام ⭐ + ۲۵,۰۰۰ سکه 🪙',
    entryFee: 50,
    schedule: 'پنج‌شنبه‌ها ساعت ۲۱:۳۰ به وقت تهران'
  },
  ludo: {
    id: 'ludo',
    title: '🎲 ماراتن هیجان‌انگیز منچ دورهمی چاژا',
    prize: '۵۰۰ ستاره تلگرام ⭐ + ۱۵,۰۰۰ سکه 🪙',
    entryFee: 0,
    schedule: 'هر شب ساعت ۲۲:۰۰'
  }
};

function ensureTournamentsDb() {
  if (!db.tournaments) db.tournaments = {};
  for (const key of Object.keys(TOURNAMENTS)) {
    if (!db.tournaments[key]) {
      db.tournaments[key] = { participants: [] };
    }
  }
}

async function sendTournamentsMenu(botToken, chatId, userId) {
  ensureTournamentsDb();
  const user = getUser(userId);

  let text = `🏆 <b>سالن تورنمنت‌ها، لیگ‌ها و جام‌های قهرمانی چاژا</b> 👑\n` +
             `━━━━━━━━━━━━━━━━━━━━\n` +
             `در مسابقات رسمی چاژا شرکت کنید، رقابت کنید و جوایز ارزشمند ستاره‌های تلگرام (Stars) و بسته‌های میلیونی سکه ببرید!\n\n` +
             `👇 برای ثبت‌نام در هر جام روی دکمه مربوطه بزنید:\n\n`;

  const buttons = [];
  for (const [key, t] of Object.entries(TOURNAMENTS)) {
    const pCount = (db.tournaments[key]?.participants || []).length;
    const isEnrolled = (db.tournaments[key]?.participants || []).includes(userId);
    const feeText = user.is_vip ? 'رایگان (VIP 🌟)' : (t.entryFee === 0 ? 'رایگان' : `${t.entryFee} سکه`);

    text += `${t.title}\n` +
            `🎁 <b>استخر جوایز:</b> ${t.prize}\n` +
            `⏰ <b>زمان برگزاری:</b> ${t.schedule}\n` +
            `🎟️ <b>ورودی:</b> ${feeText} | 👥 <b>شرکت‌کنندگان:</b> ${pCount + 18} نفر\n` +
            `وضعیت شما: ${isEnrolled ? '✅ <b>ثبت‌نام شده</b>' : '❌ ثبت‌نام نشده'}\n\n`;

    if (!isEnrolled) {
      buttons.push([{ text: `🎟️ ثبت‌نام در ${t.title.split('(')[0]}`, callback_data: `register_tourn_${key}` }]);
    } else {
      buttons.push([{ text: `✅ بلیط شما فعال است (${t.title.split('(')[0]})`, callback_data: `view_ticket_${key}` }]);
    }
  }

  buttons.push([
    { text: '🎪 ورود به سالن بازی‌ها', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } },
    { text: '🔙 بازگشت به کنسول', callback_data: 'nav_dashboard' }
  ]);

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  });
}

async function registerTournament(botToken, chatId, userId, tournKey) {
  ensureTournamentsDb();
  const t = TOURNAMENTS[tournKey];
  if (!t) return;

  const user = getUser(userId);
  if (db.tournaments[tournKey].participants.includes(userId)) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `✅ <b>شما قبلاً در «${t.title}» ثبت‌نام کرده‌اید!</b>\nقبل از آغاز رقابت‌ها، لینک اختصاصی ورود به میز برای شما ارسال خواهد شد.`,
      parse_mode: 'HTML'
    });
  }

  const fee = user.is_vip ? 0 : t.entryFee;
  if (fee > 0 && (user.coins || 0) < fee) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `⚠️ موجودی سکه شما برای ثبت‌نام در این جام کافی نیست.\nورودی: <b>${fee} سکه</b> | موجودی شما: <b>${user.coins || 0} سکه</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '⭐ خرید سکه با Telegram Stars', callback_data: 'shop_buy_coins' }],
          [{ text: '👑 فعال‌سازی VIP (ورودی رایگان)', callback_data: 'shop_buy_vip' }]
        ]
      }
    });
  }

  if (fee > 0) {
    user.coins -= fee;
  }
  db.tournaments[tournKey].participants.push(userId);
  saveDb();

  const ticketCode = `CHZ-CUP-${tournKey.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: `🎟️ <b>ثبت‌نام شما با موفقیت انجام شد!</b>\n━━━━━━━━━━━━━━━━━━━━\n` +
          `🏆 <b>جام مسابقات:</b> ${t.title}\n` +
          `🎫 <b>شماره بلیط اختصاصی:</b> <code>${ticketCode}</code>\n` +
          `⏰ <b>زمان مسابقه:</b> ${t.schedule}\n` +
          `🎁 <b>استخر جوایز:</b> ${t.prize}\n\n` +
          `🔔 <i>نیم ساعت قبل از آغاز تورنمنت، لینک دعوت مستقیم به میز بازی برای شما ارسال خواهد شد.</i>`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 تمرین و دستگرمی در سالن بازی‌ها', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } }],
        [{ text: '🔙 بازگشت به لیست تورنمنت‌ها', callback_data: 'menu_tournaments' }]
      ]
    }
  });
}

// ----------------------------------------------------
// 9. PLATO WEAPONS SHOP & INVENTORY
// ----------------------------------------------------
const PLATO_WEAPONS = {
  tomato: { name: '🍅 سطل گوجه‌فرنگی فاسد', pack: 25, price: 50, desc: 'پرتاب گوجه با لکه قرمز و صدای له‌شدن خیس' },
  bomb: { name: '💣 بسته بمب انفجاری دینامیت', pack: 10, price: 80, desc: 'پرواز بمب، لرزش سنگین صفحه و انفجار زرد' },
  water: { name: '💧 پارچ و سطل آب سرد', pack: 20, price: 40, desc: 'پاشیدن قطرات آب روی صفحه با صدای شرشر خنک' },
  rose: { name: '🌹 سبد شاخه‌های گل رز', pack: 15, price: 50, desc: 'پرتاب رمانتیک گل همراه با افکت ستاره‌های براق' },
  egg: { name: '🍳 بسته تخم‌مرغ خام', pack: 10, price: 40, desc: 'شکستن تخم‌مرغ روی صفحه حریف با زرده جاری‌شده' }
};

function ensureUserInventory(user) {
  if (!user.inventory) {
    user.inventory = { tomato: 15, bomb: 8, water: 15, rose: 10, egg: 10 };
  }
}

async function sendPlatoWeaponsShop(botToken, chatId, userId) {
  const user = getUser(userId);
  ensureUserInventory(user);

  let text = `🍅 <b>فروشگاه و زرادخانه آیتم‌های پرتابی پلاتو</b> 💣\n` +
             `━━━━━━━━━━━━━━━━━━━━\n` +
             `در حین مسابقات آنلاین حکم، منچ، تخته‌نرد و پاسور با پرتاب این آیتم‌ها روی صفحه حریف حسابی کل‌کل کنید!\n\n` +
             `🎒 <b>موجودی فعلی زرادخانه شما:</b>\n` +
             `• 🍅 گوجه‌فرنگی: <b>${user.inventory.tomato || 0} عدد</b>\n` +
             `• 💣 بمب انفجاری: <b>${user.inventory.bomb || 0} عدد</b>\n` +
             `• 💧 سطل آب سرد: <b>${user.inventory.water || 0} عدد</b>\n` +
             `• 🌹 شاخه گل رز: <b>${user.inventory.rose || 0} عدد</b>\n` +
             `• 🍳 تخم‌مرغ خام: <b>${user.inventory.egg || 0} عدد</b>\n\n` +
             `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b> سکه طلا\n` +
             `━━━━━━━━━━━━━━━━━━━━\n` +
             `👇 برای شارژ زرادخانه خود بسته مورد نظر را انتخاب کنید:\n\n`;

  const buttons = [];
  for (const [key, item] of Object.entries(PLATO_WEAPONS)) {
    buttons.push([{
      text: `🛒 خرید ${item.name} (${item.pack} عدد - ${item.price} سکه)`,
      callback_data: `buy_weapon_${key}`
    }]);
  }

  buttons.push([
    { text: '🎮 ورود به بازی و پرتاب آیتم‌ها', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } },
    { text: '🔙 بازگشت به کنسول', callback_data: 'nav_dashboard' }
  ]);

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  });
}

async function buyPlatoWeapon(botToken, chatId, userId, weaponKey) {
  const item = PLATO_WEAPONS[weaponKey];
  if (!item) return;

  const user = getUser(userId);
  ensureUserInventory(user);

  if ((user.coins || 0) < item.price) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `⚠️ موجودی سکه شما برای خرید این بسته کافی نیست.\nقیمت: <b>${item.price} سکه</b> | موجودی: <b>${user.coins || 0}</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '⭐ خرید سکه با Telegram Stars', callback_data: 'shop_buy_coins' }]]
      }
    });
  }

  user.coins -= item.price;
  user.inventory[weaponKey] = (user.inventory[weaponKey] || 0) + item.pack;
  saveDb();

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: `🎉 <b>خرید با موفقیت انجام شد!</b>\n\n` +
          `🎁 <b>${item.pack} عدد ${item.name}</b> به کوله‌پشتی شما افزوده شد.\n` +
          `🎒 موجودی فعلی این آیتم: <b>${user.inventory[weaponKey]} عدد</b>\n` +
          `🪙 موجودی سکه باقی‌مانده: <b>${user.coins.toLocaleString()}</b>`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 ورود به بازی و تست پرتاب ⚔️', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } }],
        [{ text: '🛒 خرید آیتم‌های دیگر', callback_data: 'menu_weapons' }]
      ]
    }
  });
}

// ----------------------------------------------------
// 10. DAILY MYSTERY CHEST
// ----------------------------------------------------
async function openMysteryChest(botToken, chatId, userId) {
  const user = getUser(userId);
  const todayStr = new Date().toISOString().slice(0, 10);

  if (user.last_chest_date === todayStr) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `⏳ <b>صندوقچه شانس امروز را قبلاً باز کرده‌اید!</b>\nصندوقچه بعدی فردا فعال خواهد شد.\n\nهمچنین می‌توانید از گردونه شانس استفاده کنید:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎡 چرخاندن گردونه شانس روزانه', callback_data: 'spin_wheel_action' }],
          [{ text: '🔙 بازگشت به کنسول', callback_data: 'nav_dashboard' }]
        ]
      }
    });
  }

  user.last_chest_date = todayStr;
  ensureUserInventory(user);

  const drops = [
    { type: 'coins', amount: 250, label: '💰 ۲۵۰ سکه طلای چاژا!' },
    { type: 'coins', amount: 600, label: '🪙 ۶۰۰ سکه طلای سلطنتی!' },
    { type: 'xp', amount: 150, label: '⚡ ۱۵۰ امتیاز تجربه (XP)!' },
    { type: 'tomatoes', amount: 20, label: '🍅 ۲۰ عدد گوجه‌فرنگی پرتابی!' },
    { type: 'bombs', amount: 10, label: '💣 ۱۰ عدد بمب انفجاری پلاتو!' },
    { type: 'vip', days: 1, label: '👑 ۱ روز اشتراک طلایی VIP رویال!' }
  ];

  const prize = drops[Math.floor(Math.random() * drops.length)];

  if (prize.type === 'coins') {
    user.coins = (user.coins || 0) + prize.amount;
  } else if (prize.type === 'xp') {
    addXp(userId, prize.amount);
  } else if (prize.type === 'tomatoes') {
    user.inventory.tomato = (user.inventory.tomato || 0) + prize.amount;
  } else if (prize.type === 'bombs') {
    user.inventory.bomb = (user.inventory.bomb || 0) + prize.amount;
  } else if (prize.type === 'vip') {
    user.is_vip = true;
    user.vip_expires_at = Math.max(user.vip_expires_at || 0, Date.now()) + 86400000;
  }

  saveDb();

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: `🎁 <b>صندوقچه طلایی مرموز گشوده شد!</b> ✨\n━━━━━━━━━━━━━━━━━━━━\n\n` +
          `🎉 جایزه شما:\n<b>${prize.label}</b>\n\n` +
          `🪙 موجودی فعلی سکه: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
          `⚡ لول کاربری: <b>سطح ${user.level || 1}</b>\n\n` +
          `<i>هر ۲۴ ساعت یک صندوقچه رایگان به شما تعلق می‌گیرد!</i>`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 ورود به بازی‌ها و سالن مسابقات', web_app: { url: `${CONFIG.WEBAPP_URL}?app=chazha#/games/lounge` } }],
        [{ text: '🔙 بازگشت به کنسول چاژا', callback_data: 'nav_dashboard' }]
      ]
    }
  });
}

// ----------------------------------------------------
// 11. CUSTOM STAKES MATCH CREATOR
// ----------------------------------------------------
const STAKE_LEVELS = [
  { key: 'free', coins: 0, prize: 'بدون شرط (دوستانه و تمرینی)', icon: '🌱' },
  { key: '100', coins: 100, prize: '۱۸۰ سکه طلا (با ۱۰٪ کارمزد)', icon: '🥉' },
  { key: '500', coins: 500, prize: '۹۰۰ سکه طلا (با ۱۰٪ کارمزد)', icon: '🥈' },
  { key: '2000', coins: 2000, prize: '۳,۶۰۰ سکه طلا (با ۱۰٪ کارمزد)', icon: '👑' }
];

async function sendCreateStakesMatchMenu(botToken, chatId, userId, selectedGame = 'hokm') {
  const user = getUser(userId);
  const gameNames = {
    hokm: 'حکم ۴ نفره',
    backgammon: 'تخته‌نرد',
    ludo: 'منچ آنلاین',
    pasur: 'پاسور چهاربرگ',
    snooker: 'اسنوکر و بیلیارد'
  };

  const gName = gameNames[selectedGame] || 'بازی آنلاین';

  let text = `⚔️ <b>ساخت میز مسابقه سفارشی با شرط سکه</b> 🏆\n` +
             `━━━━━━━━━━━━━━━━━━━━\n` +
             `🎮 <b>بازی انتخابی:</b> ${gName}\n` +
             `🪙 <b>موجودی سکه شما:</b> ${(user.coins || 0).toLocaleString()} سکه\n\n` +
             `میزان شرط‌بندی ورودی میز را تعیین کنید. برنده مسابقه کل سکه‌های شرط را منهای ۱۰٪ کارمزد دریافت می‌کند:\n\n`;

  const buttons = [];
  for (const s of STAKE_LEVELS) {
    buttons.push([{
      text: `${s.icon} ورودی: ${s.coins === 0 ? 'رایگان' : s.coins + ' سکه'} | جایزه: ${s.prize}`,
      callback_data: `create_duel_${selectedGame}_${s.key}`
    }]);
  }

  buttons.push([
    { text: '🂡 تغییر به حکم', callback_data: 'setup_stake_hokm' },
    { text: '🪵 تخته‌نرد', callback_data: 'setup_stake_backgammon' },
    { text: '🎲 منچ', callback_data: 'setup_stake_ludo' }
  ]);
  buttons.push([{ text: '🔙 بازگشت به کنسول', callback_data: 'nav_dashboard' }]);

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  });
}

async function handleGenerateStakedDuel(botToken, chatId, userId, gameKey, stakeKey) {
  const user = getUser(userId);
  const stakeObj = STAKE_LEVELS.find(s => s.key === stakeKey) || STAKE_LEVELS[0];

  if (stakeObj.coins > 0 && (user.coins || 0) < stakeObj.coins) {
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `⚠️ موجودی سکه شما برای ایجاد میز با شرط ${stakeObj.coins} سکه کافی نیست.\nموجودی فعلی: <b>${user.coins || 0} سکه</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '⭐ شارژ سکه با Telegram Stars', callback_data: 'shop_buy_coins' }]]
      }
    });
  }

  const roomCode = `STK-${gameKey.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const playUrl = `${CONFIG.WEBAPP_URL}?app=chazha#/games/${gameKey}?room=${roomCode}&mode=online&stake=${stakeObj.coins}&role=black&autostart=1`;
  const shareDuelUrl = `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/chazha_bot?start=room_${roomCode}`)}&text=${encodeURIComponent(`⚔️ بیا با من دوئل آنلاین بدیم!\n🎮 بازی: ${gameKey}\n💰 جایزه برد: ${stakeObj.prize}\nکد اتاق: ${roomCode}`)}`;

  const text = `🎉 <b>میز مسابقه با موفقیت ساخته شد!</b> ⚔️\n━━━━━━━━━━━━━━━━━━━━\n` +
               `🔑 <b>کد اتاق مسابقه:</b> <code>${roomCode}</code>\n` +
               `💰 <b>شرط ورودی:</b> ${stakeObj.coins === 0 ? 'رایگان' : stakeObj.coins + ' سکه'}\n` +
               `🏆 <b>جایزه برنده:</b> ${stakeObj.prize}\n\n` +
               `👇 ۱. ابتدا کارت چالش را برای دوست یا گروه خود بفرستید:\n` +
               `👇 ۲. سپس با زدن دکمه زیر، وارد میز بازی شوید و منتظر ورود حریف بمانید:`;

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📤 ارسال کارت چالش به دوست یا گروه 🚀', url: shareDuelUrl }],
        [{ text: '🎮 ورود خودم به میز بازی ⚔️', web_app: { url: playUrl } }],
        [{ text: '🔙 بازگشت به کنسول چاژا', callback_data: 'nav_dashboard' }]
      ]
    }
  });
}

module.exports = {
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
};

