// Snooker Master Constants & Boutique Catalog
// Decoupled from React components to eliminate circular dependency issues

export const TABLE_THEMES = [
  {
    id: 'championship_green',
    nameFa: 'سبز مسابقات جهانی کروسیبل',
    nameEn: 'Crucible Championship Green',
    clothColor: '#0b532c',
    cushionColor: '#073d1f',
    borderColor: '#382212',
    accentColor: '#10b981',
    price: 0,
    isFree: true,
    badge: 'استاندارد 🏆',
    desc: 'ماهوت رسمی استرابون ۱۰۰ تور جهانی شفیلد انگلستان'
  },
  {
    id: 'royal_blue',
    nameFa: 'آبی مخمل سلطنتی',
    nameEn: 'Royal Velvet Blue',
    clothColor: '#1e3a5f',
    cushionColor: '#132842',
    borderColor: '#1e293b',
    accentColor: '#38bdf8',
    price: 3500,
    isFree: false,
    badge: 'محبوب 💙',
    desc: 'پارچه پشمی با بافت متراکم و سرعت حرکت کنترل‌شده'
  },
  {
    id: 'imperial_ruby',
    nameFa: 'یاقوت سرخ امپراتوری',
    nameEn: 'Imperial Ruby Crimson',
    clothColor: '#7f1d1d',
    cushionColor: '#5c1313',
    borderColor: '#290b0b',
    accentColor: '#ef4444',
    price: 8000,
    isFree: false,
    badge: 'سلطنتی 👑',
    desc: 'میز کلاسیک بارون‌های بریتانیایی با چوب ماهون براق'
  },
  {
    id: 'cyber_neon',
    nameFa: 'سایبر نئون آبسیدین',
    nameEn: 'Cyber Neon Obsidian',
    clothColor: '#090d16',
    cushionColor: '#04070d',
    borderColor: '#020617',
    accentColor: '#06b6d4',
    price: 18000,
    isFree: false,
    badge: 'مدرن ⚡',
    desc: 'فیبر کربن ضدخش با درخشش خطوط نئونی آبی و بنفش'
  },
  {
    id: 'ancient_emerald',
    nameFa: 'زمرد کهن پارسی',
    nameEn: 'Ancient Persian Emerald',
    clothColor: '#064e3b',
    cushionColor: '#022c22',
    borderColor: '#2e1c0c',
    accentColor: '#34d399',
    price: 12000,
    isFree: false,
    badge: 'باستانی 🦅',
    desc: 'تذهیب زرین در حاشیه‌های گردویی و ماهوت اعلای ابریشمی'
  },
  {
    id: 'amethyst_royalty',
    nameFa: 'ارغوانی کریستال آمتیست',
    nameEn: 'Amethyst Royalty',
    clothColor: '#4c1d95',
    cushionColor: '#2e1065',
    borderColor: '#190a33',
    accentColor: '#c084fc',
    price: 22000,
    isFree: false,
    badge: 'افسانه‌ای 💎',
    desc: 'شاهکار بصری با جلای کریستالی امیتیست و حاشیه‌های لوکس'
  }
];

export const SNOOKER_CUES = [
  {
    id: 'ash_classic',
    nameFa: 'چوب اش سنتی (Ash Wood)',
    nameEn: 'Classic Ash Wood',
    descFa: 'چوب زبان‌گنجشک استاندارد مسابقات با توازن طبیعی و بدون انحراف.',
    descEn: 'Standard tournament grade ash wood with natural balance.',
    price: 0,
    isFree: true,
    power: 70,
    aimLength: 65,
    spinControl: 60,
    glowColor: 'rgba(217, 119, 6, 0.4)',
    accentGradient: 'from-amber-700 via-amber-600 to-amber-800',
    tipColor: '#fef3c7',
    badge: 'پایه 🪵'
  },
  {
    id: 'faravahar_dragon',
    nameFa: 'فروهر باستان (Faravahar Dragon)',
    nameEn: 'Persian Faravahar Dragon',
    descFa: 'منبت‌کاری شده با نگاره‌های کهن و افزایش چشمگیر دقت خط راهنما.',
    descEn: 'Ancient carved wood boosting aiming guide length and precision.',
    price: 5000,
    isFree: false,
    power: 82,
    aimLength: 88,
    spinControl: 78,
    glowColor: 'rgba(16, 185, 129, 0.5)',
    accentGradient: 'from-emerald-700 via-teal-600 to-emerald-900',
    tipColor: '#6ee7b7',
    badge: 'اسطوره‌ای 🦅'
  },
  {
    id: 'royal_gold',
    nameFa: 'طلای سلطنتی ۲۴ عیار (Royal Gold)',
    nameEn: 'Royal 24K Gold Master',
    descFa: 'روکش طلای خالص با کنترل فوق‌العاده روی کات و پیچ توپ سفید.',
    descEn: 'Pure 24k gold leaf inlay with elite english and screw-back control.',
    price: 12000,
    isFree: false,
    power: 90,
    aimLength: 85,
    spinControl: 95,
    glowColor: 'rgba(245, 158, 11, 0.6)',
    accentGradient: 'from-amber-400 via-yellow-500 to-amber-600',
    tipColor: '#fbbf24',
    badge: 'سلطنتی 👑'
  },
  {
    id: 'cyber_plasma',
    nameFa: 'پلاسمای نئونی سایبر (Cyber Plasma)',
    nameEn: 'Cyber Neon Plasma Laser',
    descFa: 'مجهز به لیزر متمرکز و قدرت شلیک کوانتومی برای بریک‌های سنگین.',
    descEn: 'Laser assisted aiming with quantum power for massive high breaks.',
    price: 25000,
    isFree: false,
    power: 98,
    aimLength: 98,
    spinControl: 90,
    glowColor: 'rgba(56, 189, 248, 0.7)',
    accentGradient: 'from-cyan-500 via-blue-600 to-purple-700',
    tipColor: '#38bdf8',
    badge: 'سایبرپانک ⚡'
  },
  {
    id: 'diamond_predator',
    nameFa: 'الماس سیاه پرداتور (Black Diamond)',
    nameEn: 'Black Diamond Predator',
    descFa: 'چوب افسانه‌ای قهرمانی جهان با بالاترین سطح آمار در تمامی شاخص‌ها.',
    descEn: 'The ultimate champion predator cue with maximum stats.',
    price: 50000,
    isFree: false,
    power: 100,
    aimLength: 100,
    spinControl: 100,
    glowColor: 'rgba(236, 72, 153, 0.8)',
    accentGradient: 'from-pink-600 via-purple-700 to-indigo-900',
    tipColor: '#f472b6',
    badge: 'افسانه‌ای 💎'
  }
];

export const DEFAULT_TABLE_THEME = TABLE_THEMES[0];
export const DEFAULT_SNOOKER_CUE = SNOOKER_CUES[0];
