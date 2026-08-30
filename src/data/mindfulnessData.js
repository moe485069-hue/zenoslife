// Comprehensive Mindfulness, Meditation & Breathwork Knowledge Bank

export const GUIDED_MEDITATIONS = [
  {
    id: 'body-scan',
    titleFa: 'اسکن کامل بدن و رهاسازی تنش‌های عضلانی',
    titleEn: 'Full Body Scan & Somatic Release',
    categoryFa: 'تن‌آگاهی و رهایی از استرس',
    categoryEn: 'Body Awareness & Stress',
    icon: '🧘‍♂️',
    durationMinutes: 10,
    stages: [
      { minute: '0-2', titleFa: 'استقرار و تنفس دیافراگمی', descFa: 'به پشت دراز بکشید یا راحت بنشینید. سه دم عمیق از بینی و بازدم آرام از دهان انجام دهید.' },
      { minute: '2-4', titleFa: 'مشاهده کف پاها و ساق‌ها', descFa: 'توجه خود را به انگشتان پا ببرید. هرگونه گرفتگی یا گرما را بدون تلاش برای تغییر، فقط مشاهده کنید.' },
      { minute: '4-6', titleFa: 'آگاهی از شکم و قفسه سینه', descFa: 'بالا و پایین رفتن ملایم شکم را با هر نفس حس کنید. بگذارید تمام وزن بدنتان روی زمین رها شود.' },
      { minute: '6-8', titleFa: 'رهایی شانه‌ها، فک و عضلات صورت', descFa: 'دندان‌ها را از هم فاصله دهید، اخم پیشانی را باز کنید و بگذارید شانه‌ها کاملاً شل شوند.' },
      { minute: '8-10', titleFa: 'یکپارچگی و آرامش فراگیر', descFa: 'حس سبکی و آرامش را در سرتاسر کالبد خود گسترش دهید. با سپاسگزاری به این لحظه بازگردید.' }
    ]
  },
  {
    id: 'anxiety-release',
    titleFa: 'رهایی از نشخوار فکری و طوفان اضطراب',
    titleEn: 'Overthinking & Anxiety Release',
    categoryFa: 'آرامش روان و مدیریت ذهن',
    categoryEn: 'Mental Peace & De-stress',
    icon: '🍃',
    durationMinutes: 8,
    stages: [
      { minute: '0-2', titleFa: 'توقف و لنگر انداختن در جسم', descFa: 'کف پاهایتان را روی زمین محکم حس کنید. لمس دست‌ها روی ران‌ها را احساس نمایید.' },
      { minute: '2-5', titleFa: 'تماشای افکار مانند ابرهای گذران', descFa: 'افکار خود را مانند برگ‌هایی روی یک رودخانه خروشان تصور کنید که می‌آیند و عبور می‌کنند. سوار آن‌ها نشوید.' },
      { minute: '5-8', titleFa: 'بازگشت به فضای امن قلب', descFa: 'دست راست خود را روی مرکز قفسه سینه بگذارید. تپش آرام قلب و امنیت این لحظه را لمس کنید.' }
    ]
  },
  {
    id: 'deep-sleep',
    titleFa: 'مراقبه تسلیم و خواب عمیق شبانه',
    titleEn: 'Deep Sleep & Surrender Meditation',
    categoryFa: 'خواب و بازسازی سلولی',
    categoryEn: 'Sleep & Night Recovery',
    icon: '🌙',
    durationMinutes: 15,
    stages: [
      { minute: '0-4', titleFa: 'تنفس ۴-۷-۸ و رهاسازی روز', descFa: 'پرونده‌های کاری و دغدغه‌های امروز را ببندید. امروز تمام شد و شما در امنیت کامل هستید.' },
      { minute: '4-10', titleFa: 'سنگین شدن اندام‌ها', descFa: 'حس کنید دست‌ها و پاهایتان مانند سرب گرم و سنگین می‌شوند و در تخت فرو می‌روند.' },
      { minute: '10-15', titleFa: 'حل شدن در تاریکی آرامش‌بخش کیهان', descFa: 'آگاهی خود را به ریتم آرام تنفس بسپارید تا آرام به خوابی ژرف و رویاهای شیرین رهسپار شوید.' }
    ]
  },
  {
    id: 'focus-flow',
    titleFa: 'مراقبه تمرکز عمیق و هشیاری تیزبینانه (Flow State)',
    titleEn: 'Laser Focus & Peak Mental Clarity',
    categoryFa: 'بهره‌وری و کار عمیق',
    categoryEn: 'Productivity & Flow',
    icon: '⚡',
    durationMinutes: 5,
    stages: [
      { minute: '0-2', titleFa: 'تک‌نقطه‌ای کردن آگاهی', descFa: 'توجه خود را دقیقاً به نقطه تماس هوا با نوک پره‌های بینی متمرکز کنید.' },
      { minute: '2-4', titleFa: 'شفاف‌سازی و حذف نویزها', descFa: 'هر فکری که مربوط به وظیفه پیش‌رو نیست را با بازدم بیرون دهید.' },
      { minute: '4-5', titleFa: 'آغاز مقتدرانه با توان ۱۰۰٪', descFa: 'چشمانتان را باز کنید؛ شما در اوج وضوح و تسلط شناختی قرار دارید.' }
    ]
  }
];

export const GROUNDING_TECHNIQUES = [
  {
    step: 5,
    icon: '👁️',
    titleFa: '۵ چیزی که می‌بینید',
    titleEn: '5 Things you can SEE',
    descFa: 'به اطراف نگاه کنید و ۵ شیء ملموس با رنگ‌ها یا بافت‌های مختلف را نام ببرید.'
  },
  {
    step: 4,
    icon: '✋',
    titleFa: '۴ چیزی که می‌توانید لمس کنید',
    titleEn: '4 Things you can TOUCH',
    descFa: 'بافت لباستان، سردی میز، گرمای پوست یا سختی کف زمین را زیر انگشتان حس کنید.'
  },
  {
    step: 3,
    icon: '👂',
    titleFa: '۳ صدایی که می‌شنوید',
    titleEn: '3 Things you can HEAR',
    descFa: 'صدای تنفس، همهمه دوردست، صدای باد یا سکوت پیرامون را بشنوید.'
  },
  {
    step: 2,
    icon: '👃',
    titleFa: '۲ بویی که حس می‌کنید',
    titleEn: '2 Things you can SMELL',
    descFa: 'عطر قهوه، هوای تازه، صابون یا بوی محیط را استشمام کنید.'
  },
  {
    step: 1,
    icon: '👅',
    titleFa: '۱ مزه‌ای که می‌چشید',
    titleEn: '1 Thing you can TASTE',
    descFa: 'طعم دهان، یک جرعه آب یا تازگی هوا را بچشید.'
  }
];

export const FREQUENCY_SOUNDSCAPES = [
  { id: '432hz', nameFa: '۴۳۲ هرتز — فرکانس شفابخش کیهانی', descFa: 'کاهش کورتیزول، ضربان قلب و تنظیم ارتعاش طبیعی سلول‌ها', icon: '🌌' },
  { id: '528hz', nameFa: '۵۲۸ هرتز — معجزه تحول و انرژی پاک', descFa: 'ترمیم DNA، تقویت شهود و ارتقای حس شکرگزاری', icon: '✨' },
  { id: 'alpha', nameFa: 'امواج آلفا (۱۰Hz) — تمرکز در آرامش', descFa: 'بهترین وضعیت مغزی برای یادگیری سریع و خلاقیت', icon: '🧠' },
  { id: 'theta', nameFa: 'امواج تتا (۶Hz) — خلسه و مراقبه عمیق', descFa: 'فعال‌سازی ناخودآگاه و بینش‌های شهودی', icon: '🕊️' },
  { id: 'rain', nameFa: 'باران ملایم جنگل و چوب صندل', descFa: 'آرامش عمیق ذهن با نویز سفید ارگانیک طبیعت', icon: '🌧️' },
];
