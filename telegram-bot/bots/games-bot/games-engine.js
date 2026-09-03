/**
 * ============================================================================
 * 🎮 چاژا (Chazha) Games Engine & Realtime Matchmaking
 * ============================================================================
 */

const crypto = require('crypto');
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

module.exports = {
  playRpsVsBot,
  playDiceVsBot,
  sendTriviaQuestion,
  handleTriviaAnswer,
  spinWheel,
  sendGameLeaderboard
};
