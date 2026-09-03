/**
 * ============================================================================
 * 🌱 زنوسلایف (ZenOsLife) - Self-Discovery, AI Mentor & Habit Tracker
 * ============================================================================
 */

const { callTgApi } = require('../../shared/telegram');
const { db, saveDb, getUser, addXp, addCoins } = require('../../shared/db');
const { CONFIG } = require('../../shared/config');

const SELF_QUESTIONS = [
  {
    topic: 'انرژی روانی و تعامل',
    question: 'وقتی بعد از یک روز شلوغ خسته هستید، چطور انرژی خود را بازیابی می‌کنید؟',
    options: [
      { text: 'تنهایی و سکوت در خلوت خودم', type: 'Introvert' },
      { text: 'گپ زدن و وقت‌گذرانی با دوستان نزدیک', type: 'Extrovert' },
      { text: 'فعالیت فیزیکی یا ورزش', type: 'Kinesthetic' }
    ]
  },
  {
    topic: 'تصمیم‌گیری در چالش‌ها',
    question: 'در مواجهه با یک دوراهی مهم زندگی، قطب‌نمای اصلی شما کدام است؟',
    options: [
      { text: 'منطق محض، تحلیل داده‌ها و فایده/هزینه', type: 'Thinker' },
      { text: 'ارزش‌های قلبی، احساسات درونی و همدلی', type: 'Feeler' },
      { text: 'شهود آنی و صدای درونی', type: 'Intuitive' }
    ]
  },
  {
    topic: 'مدیریت زمان و اهداف',
    question: 'نحوه برنامه‌ریزی ایده‌آل روزانه شما چگونه است؟',
    options: [
      { text: 'چک‌لیست دقیق و زمان‌بندی منظم', type: 'Structured' },
      { text: 'انعطاف‌پذیر و همراهی با جریان روز', type: 'Flexible' }
    ]
  }
];

const MENTOR_PROMPTS = [
  '🌱 <b>مربی ذهن:</b> «امروز چه باری روی دوشت داری که اگر زمین بگذاری، سبک‌تر قدم برمی‌داری؟»',
  '💡 <b>مربی ذهن:</b> «اشتباهاتت مدرک تلاش تو برای رشد هستن، نه نشانه‌ای از نقص وجود تو.»',
  '☕ <b>مربی ذهن:</b> «یک نفس عمیق بکش؛ اتفاقات آینده هنوز رخ ندادن و گذشته هم تموم شده. قدرت تو دقیقاً در همین لحظه است.»',
  '🧭 <b>مربی ذهن:</b> «یک قدم کوچک و مداوم، هزار برابر از یک تصمیم بزرگ که هرگز شروع نشه باارزش‌تره.»'
];

async function sendSelfDiscoveryMenu(botToken, chatId, userId) {
  const user = getUser(userId);

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: `🧭 <b>بخش خودشناسی، تست‌ها و آگاهی فردی</b>\n\n` +
          `در این بخش می‌توانید زوایای پنهان شخصیت خود را بشناسید، از مربی هوشمند بازخورد بگیرید و نظم شخصی خود را ارتقا دهید.`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🧪 تست شناخت ابعاد شخصیت', callback_data: 'start_self_test_0' }],
        [{ text: '🤖 گفتگوی الهام‌بخش با AI Mentor', callback_data: 'get_mentor_advice' }],
        [{ text: '🛡️ ردیاب پاکی و ترک عادت‌ها (Mini App)', web_app: { url: `${CONFIG.WEBAPP_URL}#/addiction` } }],
        [{ text: '🧠 نقشه شناختی ذهن (Brain Graph)', web_app: { url: `${CONFIG.WEBAPP_URL}#/braingraph` } }]
      ]
    }
  });
}

async function handleSelfTestStep(botToken, chatId, userId, stepIdx) {
  const q = SELF_QUESTIONS[stepIdx];
  if (!q) {
    addXp(userId, 40);
    addCoins(userId, 50);
    saveDb();
    return callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `🎉 <b>آزمون خودشناسی با موفقیت تکمیل شد!</b>\nنتایج شناختی شما به پروفایل اضافه گردید.\n🎁 پاداش: <b>+۵۰ سکه 🪙 و +۴۰ XP</b>`,
      parse_mode: 'HTML'
    });
  }

  const buttons = q.options.map((opt, i) => ([{
    text: opt.text,
    callback_data: `ans_self_${stepIdx + 1}_${i}`
  }]));

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: `🧭 <b>سوال ${stepIdx + 1} از ${SELF_QUESTIONS.length} (${q.topic}):</b>\n\n${q.question}`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  });
}

async function sendMentorAdvice(botToken, chatId, userId) {
  const quote = MENTOR_PROMPTS[Math.floor(Math.random() * MENTOR_PROMPTS.length)];
  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: quote,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔄 یک نکته دیگر از مربی', callback_data: 'get_mentor_advice' }],
        [{ text: '💬 گفتگوی اختصاصی با AI Mentor در وب‌اپ', web_app: { url: `${CONFIG.WEBAPP_URL}#/mentor` } }]
      ]
    }
  });
}

module.exports = {
  sendSelfDiscoveryMenu,
  handleSelfTestStep,
  sendMentorAdvice
};
