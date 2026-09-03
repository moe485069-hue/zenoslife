/**
 * ============================================================================
 * 👑 ZenOsLife Shared Bilingual Dictionary (FA / EN)
 * ============================================================================
 */

const { db } = require('./db');

const I18N = {
  fa: {
    // Registration & Onboarding
    welcomeTitle: '👑 <b>به اکوسیستم زندگی، بازی و ارتباطات زنوسلایف خوش آمدید!</b>',
    chooseGender: '👤 لطفاً <b>جنسیت</b> خود را مشخص کنید:',
    male: '👨 پسرم',
    female: '👩 دخترم',
    chooseAge: '🎂 لطفاً <b>رده سنی</b> خود را انتخاب کنید:',
    age1: '۱۸ تا ۲۱ سال',
    age2: '۲۲ تا ۲۶ سال',
    age3: '۲۷ تا ۳۴ سال',
    age4: '۳۵ سال به بالا',
    chooseProv: '📍 لطفاً <b>منطقه یا استان سکونت</b> خود را انتخاب کنید:',
    provTeh: 'تهران / البرز',
    provIsf: 'اصفهان / یزد',
    provMsh: 'خراسان / مشهد',
    provShr: 'فارس / شیراز',
    provTab: 'آذربایجان / تبریز',
    provAhv: 'خوزستان / اهواز',
    provNrt: 'مازندران / گیلان',
    provOth: 'سایر استان‌ها / بین‌المللی',
    regDone: '🎉 <b>تبریک! پروفایل شما تکمیل شد و ۱,۰۰۰ سکه هدیه عضویت به حسابتان واریز گردید! 🪙</b>',

    // Shared Header & Profile
    profileTitle: '👤 <b>کارت پروفایل شما در اکوسیستم زنوسلایف:</b>\n\n' +
                  '🏷️ <b>نام:</b> {name}\n' +
                  '⚧️ <b>جنسیت:</b> {gender} | 🎂 <b>سن:</b> {age}\n' +
                  '📍 <b>منطقه:</b> {prov}\n' +
                  '🏆 <b>سطح:</b> Level {lvl} ({xp} XP)\n' +
                  '⭐ <b>کارما و اخلاق:</b> {karma} امتیاز\n' +
                  '🪙 <b>موجودی سکه:</b> {coins}\n' +
                  '🔥 <b>استریک روزانه:</b> {streak} روز {vipBadge}',
    
    // Shared Shop & VIP
    vipTitle: '👑 <b>پلن‌های اشتراک ویژه VIP</b>\n\n' +
               'مزایای عضویت VIP:\n' +
               '• دسترسی به تالار اختصاصی اعضای VIP\n' +
               '• فیلتر نامحدود دختر/پسر/همشهری در چت\n' +
               '• نشان تاج طلایی VIP در تمامی ربات‌ها\n' +
               '• ۲۰٪ بانس سکه و XP مضاعف در بازی‌ها',
    vip7: '🥉 VIP هفتگی (۷ روز) - ۷۵ ستاره ⭐',
    vip30: '🥈 VIP ماهانه (۳۰ روز) - ۲۵۰ ستاره ⭐',
    vip90: '👑 VIP طلایی رویال (۹۰ روز) - ۶۵۰ ستاره ⭐',
    pkg1: '🪙 ۱,۰۰۰ سکه (۳۵ ستاره ⭐)',
    pkg2: '💰 ۵,۰۰۰ سکه + هدیه (۱۵۰ ستاره ⭐)',
    pkg3: '🌍 ۱۲,۰۰۰ سکه + دسترسی بین‌الملل (۳۰۰ ستاره ⭐)',
    pkg4: '💎 ۵۰,۰۰۰ سکه + ۳۰ روز VIP (۱,۰۰۰ ستاره ⭐)',

    dailyStreakTitle: '🔥 <b>استریک روزانه و پاداش ورود</b>\n\nشما <b>{days} روز متوالی</b> وارد ربات شده‌اید!\n🎁 پاداش امروز شما: <b>+{coins} سکه و +{xp} XP</b>',
    surpriseRefill: '🎁 <b>شارژ غافلگیرکننده زنوسلایف!</b>\nموجودی شما کم بود، <b>۲۰۰ سکه رایگان</b> برای ادامه فعالیت به شما تعلق گرفت! 🪙✨',
    lowCoinsNotice: '⚠️ <b>موجودی سکه شما کافی نیست!</b>\nبرای این بخش نیاز به <b>{cost} سکه</b> دارید.\nموجودی فعلی: <b>{coins}</b> سکه',

    // Referral
    referralTitle: '🎁 <b>سیستم دعوت و درآمدزایی خودکار زنوسلایف</b>\n\n' +
                   '🔗 <b>لینک اختصاصی شما:</b>\n<code>{refLink}</code>\n\n' +
                   '🎁 <b>پاداش‌های شگفت‌انگیز:</b>\n' +
                   '• <b>۱,۰۰۰ سکه هدیه برای شما</b> به ازای هر دعوت موفق\n' +
                   '• <b>۱,۰۰۰ سکه هدیه برای دوست شما</b> در بدو ورود به ربات!\n' +
                   '• <b>۱۰٪ پورسانت مادام‌العمر</b> از تمام خریدهای ستاره تلگرام دوست شما!\n\n' +
                   '👥 تعداد زیرمجموعه‌های شما: <b>{refs} نفر</b>'
  },

  en: {
    welcomeTitle: '👑 <b>Welcome to ZenOsLife Life, Gaming & Social Ecosystem!</b>',
    chooseGender: '👤 Please select your <b>gender</b>:',
    male: '👨 Male',
    female: '👩 Female',
    chooseAge: '🎂 Please select your <b>age group</b>:',
    age1: '18 - 21 yrs',
    age2: '22 - 26 yrs',
    age3: '27 - 34 yrs',
    age4: '35+ yrs',
    chooseProv: '📍 Please select your <b>region</b>:',
    provTeh: 'Europe / UK',
    provIsf: 'North America',
    provMsh: 'Asia / Middle East',
    provShr: 'Latin America',
    provTab: 'Australia / Oceania',
    provAhv: 'Africa',
    provNrt: 'Canada',
    provOth: 'Global / Other',
    regDone: '🎉 <b>Congratulations! Your profile is ready with 1,000 Welcome Coins! 🪙</b>',

    profileTitle: '👤 <b>Your ZenOsLife Profile Card:</b>\n\n' +
                  '🏷️ <b>Name:</b> {name}\n' +
                  '⚧️ <b>Gender:</b> {gender} | 🎂 <b>Age:</b> {age}\n' +
                  '📍 <b>Region:</b> {prov}\n' +
                  '🏆 <b>Level:</b> Level {lvl} ({xp} XP)\n' +
                  '⭐ <b>Karma:</b> {karma} pts\n' +
                  '🪙 <b>Coin Balance:</b> {coins}\n' +
                  '🔥 <b>Daily Streak:</b> {streak} Days {vipBadge}',

    vipTitle: '👑 <b>ZenOsLife VIP Subscription Plans</b>',
    vip7: '🥉 Weekly VIP (7 Days) - 75 Stars ⭐',
    vip30: '🥈 Monthly VIP (30 Days) - 250 Stars ⭐',
    vip90: '👑 Royal VIP (90 Days) - 650 Stars ⭐',
    pkg1: '🪙 1,000 Coins (35 Stars ⭐)',
    pkg2: '💰 5,000 Coins + Bonus (150 Stars ⭐)',
    pkg3: '🌍 12,000 Coins + Global (300 Stars ⭐)',
    pkg4: '💎 50,000 Coins + VIP (1,000 Stars ⭐)',

    dailyStreakTitle: '🔥 <b>Daily Streak Bonus</b>\n\nYou logged in <b>{days} consecutive days</b>!\n🎁 Reward: <b>+{coins} Coins & +{xp} XP</b>',
    surpriseRefill: '🎁 <b>Surprise Coin Refill!</b>\nHere is <b>200 Free Coins</b>! 🪙✨',
    lowCoinsNotice: '⚠️ <b>Insufficient Coins!</b>\nRequires <b>{cost} Coins</b>.\nBalance: <b>{coins}</b> Coins',

    referralTitle: '🎁 <b>ZenOsLife Automated Referral Engine</b>\n\n' +
                   '🔗 <b>Your Exclusive Invite Link:</b>\n<code>{refLink}</code>\n\n' +
                   '🎁 <b>Rewards:</b>\n' +
                   '• <b>1,000 Coins for you</b> per successful invite\n' +
                   '• <b>1,000 Coins for your friend</b> on signup!\n' +
                   '• <b>10% Lifetime Cut</b> on all their Stars purchases!\n\n' +
                   '👥 Friends Invited: <b>{refs}</b>'
  }
};

function t(userId, key, params = {}) {
  const lang = db.users[userId]?.lang || 'fa';
  let str = I18N[lang]?.[key] || I18N.fa[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return str;
}

module.exports = {
  I18N,
  t
};
