/**
 * ============================================================================
 * 🌱 زنوسلایف (ZenOsLife) - Realms & Stroll Engine (راهروهای ذهن و قدم‌زدن)
 * ============================================================================
 */

const { callTgApi } = require('../../shared/telegram');
const { CONFIG } = require('../../shared/config');

const REALMS = [
  {
    id: 'silence',
    title: '🌿 راهروی سکوت و حضور ذهن',
    desc: 'فضایی برای رهایی از هیاهوی روزمره، بازگشت به ریتم تنفس و تجربه آرامش درون.',
    action: 'تمرین تنفس عمیق ۴-۷-۸ و تخلیه تنش‌های ذهنی'
  },
  {
    id: 'creativity',
    title: '🎨 راهروی الهام و آفرینش',
    desc: 'جایی برای شکوفایی ایده‌های نو، نگاه تازه به چالش‌ها و یافتن راه‌حل‌های خلاقانه.',
    action: 'نوشتن آزاد بدون قضاوت و ثبت ۳ جرقه فکری امروز'
  },
  {
    id: 'acceptance',
    title: '🌊 راهروی پذیرش و عدم قضاوت',
    desc: 'شناخت احساسات بدون سرزنش، عبور از خودانتقادی و تمرین مهربانی با خود.',
    action: 'نگاه به آینه و بخشش یک خطای گذشته'
  },
  {
    id: 'purpose',
    title: '🧭 راهروی معنا و رسالت شخصی',
    desc: 'کاوش در اهداف عمیق زندگی، همراستا شدن با ارزش‌های اصیل و طراحی روزهای آینده.',
    action: 'پاسخ به سوال: «اگر هیچ ترسی نداشتم، چه قدمی برمی‌داشتم؟»'
  }
];

async function sendRealmsMenu(botToken, chatId, userId) {
  const buttons = REALMS.map(r => ([{
    text: r.title,
    callback_data: `enter_realm_${r.id}`
  }]));

  buttons.push([
    { text: '🚶‍♂️ قدم‌زدن ۳بعدی در راهروها (Mini App)', web_app: { url: `${CONFIG.WEBAPP_URL}#/stroll` } }
  ]);

  const text = `🚪 <b>راهروهای فکری و قدم‌زدن زنوسلایف (Mind Realms & Stroll)</b>\n\n` +
               `در این راهروها، ذهن شما فرصت تنفس و بازیابی انرژی پیدا می‌کند.\n` +
               `یک راهرو را برای تامل و تمرین انتخاب کنید:`;

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  });
}

async function handleEnterRealm(botToken, chatId, userId, realmId) {
  const realm = REALMS.find(r => r.id === realmId);
  if (!realm) return;

  const text = `🌌 <b>${realm.title}</b>\n\n` +
               `📝 <b>توصیف فضا:</b>\n${realm.desc}\n\n` +
               `🎯 <b>پیشنهاد تمرین لحظه اکنون:</b>\n💡 <i>${realm.action}</i>\n\n` +
               `برای تجربه کامل صوتی و بصری، وارد بخش Stroll مینی‌اپ شوید.`;

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚶‍♂️ ورود به فضای سه‌بعدی در مینی‌اپ', web_app: { url: `${CONFIG.WEBAPP_URL}#/stroll` } }],
        [{ text: '🔙 سایر راهروها', callback_data: 'open_realms_menu' }]
      ]
    }
  });
}

module.exports = {
  sendRealmsMenu,
  handleEnterRealm
};
