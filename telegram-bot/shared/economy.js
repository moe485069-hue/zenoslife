/**
 * ============================================================================
 * 👑 ZenOsLife Shared Economy, Telegram Stars (XTR) & Shop Engine
 * ============================================================================
 */

const { db, saveDb, getUser, addXp } = require('./db');
const { callTgApi } = require('./telegram');
const { t } = require('./i18n');

const PACKAGES = {
  'bronze': { title: '🪙 ۱,۰۰۰ سکه زنوسلایف', priceStars: 35, coins: 1000 },
  'silver': { title: '💰 ۵,۰۰۰ سکه + هدیه بانس', priceStars: 150, coins: 6000 },
  'global': { title: '🌍 ۱۲,۰۰۰ سکه + دسترسی بین‌المللی', priceStars: 300, coins: 12000 },
  'vip': { title: '💎 ۵۰,۰۰۰ سکه + اشتراک VIP رویال', priceStars: 1000, coins: 50000, isVip: true }
};

const VIP_PRICES = {
  7: 75,
  30: 250,
  90: 650
};

async function sendInvoiceForVip(botToken, chatId, userId, days) {
  const stars = VIP_PRICES[days] || 250;
  const title = `👑 اشتراک ویژه VIP زنوسلایف (${days} روز)`;
  return callTgApi(botToken, 'sendInvoice', {
    chat_id: chatId,
    title: title,
    description: `فعال‌سازی اشتراک VIP زنوسلایف به مدت ${days} روز با دسترسی ویژه و نامحدود`,
    payload: JSON.stringify({ userId, type: 'vip', days, stars }),
    currency: 'XTR',
    prices: [{ label: title, amount: stars }]
  });
}

async function sendInvoiceForPackage(botToken, chatId, userId, pkgKey) {
  const pkg = PACKAGES[pkgKey];
  if (!pkg) return;
  return callTgApi(botToken, 'sendInvoice', {
    chat_id: chatId,
    title: pkg.title,
    description: `شارژ آنی ${pkg.coins.toLocaleString()} سکه در حساب کاربری زنوسلایف`,
    payload: JSON.stringify({ userId, type: 'coins', coins: pkg.coins, stars: pkg.priceStars, isVip: !!pkg.isVip }),
    currency: 'XTR',
    prices: [{ label: pkg.title, amount: pkg.priceStars }]
  });
}

async function handlePreCheckout(botToken, preCheckoutQuery) {
  return callTgApi(botToken, 'answerPreCheckoutQuery', {
    pre_checkout_query_id: preCheckoutQuery.id,
    ok: true
  });
}

async function handlePaymentSuccess(botToken, msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const payment = msg.successful_payment;

  try {
    const payload = JSON.parse(payment.invoice_payload);
    const chargeId = payment.telegram_payment_charge_id;

    if (db.transactions[chargeId]) return;

    db.transactions[chargeId] = {
      chargeId,
      userId,
      payload,
      amountStars: payload.stars,
      createdAt: Date.now()
    };
    db.stats.totalStarsRevenue += (payload.stars || 0);

    const user = getUser(userId);
    if (payload.type === 'coins' && payload.coins) {
      user.coins = (user.coins || 0) + payload.coins;
      if (payload.isVip) {
        user.is_vip = true;
        user.vip_expires_at = Date.now() + 30 * 86400000;
      }
    } else if (payload.type === 'vip' && payload.days) {
      user.is_vip = true;
      const currentExp = (user.vip_expires_at && user.vip_expires_at > Date.now()) ? user.vip_expires_at : Date.now();
      user.vip_expires_at = currentExp + payload.days * 86400000;
    }

    addXp(userId, (payload.stars || 10) * 10);
    saveDb();

    // 10% Referral Cut
    if (user.invitedBy && db.users[user.invitedBy]) {
      const refId = user.invitedBy;
      const commissionCoins = Math.round(((payload.coins || (payload.stars * 30)) * 0.1));
      db.users[refId].coins = (db.users[refId].coins || 0) + commissionCoins;
      saveDb();

      callTgApi(botToken, 'sendMessage', {
        chat_id: refId,
        text: `🎁 <b>پاداش پورسانت رفرال!</b>\nدوست شما خرید انجام داد و <b>${commissionCoins.toLocaleString()} سکه هدیه (۱۰٪)</b> دریافت کردید!`,
        parse_mode: 'HTML'
      }).catch(() => {});
    }

    callTgApi(botToken, 'sendMessage', {
      chat_id: chatId,
      text: '✅ <b>پرداخت با ستاره‌های تلگرام با موفقیت انجام شد!</b>\nسکه و اشتراک به حسابتان اضافه گردید.',
      parse_mode: 'HTML'
    });
  } catch (err) {
    console.error('[Economy] Payment error:', err.message);
  }
}

async function sendFinanceHub(botToken, chatId, userId) {
  const user = getUser(userId);
  const text = `💎 <b>کیف‌پول، فروشگاه و بخش درآمدزایی</b>\n\n` +
               `🪙 موجودی سکه: <b>${(user.coins || 0).toLocaleString()}</b>\n` +
               `👑 وضعیت اشتراک: <b>${user.is_vip ? 'VIP طلایی فعال ✅' : 'عادی'}</b>\n` +
               `⭐ ستاره‌های حمایتی: خرید آنی با تلگرام استارز\n\n` +
               `یک گزینه را انتخاب کنید:`;

  return callTgApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '⭐ خرید بسته‌های سکه', callback_data: 'shop_buy_coins' }, { text: '👑 ارتقا به VIP', callback_data: 'shop_buy_vip' }],
        [{ text: '🎁 لینک دعوت و درآمدزایی', callback_data: 'show_referral' }],
        [{ text: '🏆 جدول برترین‌ها', callback_data: 'view_leaderboard' }]
      ]
    }
  });
}

module.exports = {
  PACKAGES,
  VIP_PRICES,
  sendInvoiceForVip,
  sendInvoiceForPackage,
  handlePreCheckout,
  handlePaymentSuccess,
  sendFinanceHub
};
