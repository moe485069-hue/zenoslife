import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, X, Check, Sparkles, Shield, Palette, 
  Coins, Star, Share2, Wallet, ExternalLink, Zap, ChevronRight, ChevronLeft,
  Trophy, Flame, Crown, Eye, Layers, Dices, CheckCircle2, RotateCcw
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

// ----------------------------------------------------
// FULL HIGH-DEFINITION CHAZHA STORE CATALOG
// ----------------------------------------------------
export const CHAZHA_STORE_ITEMS = [
  // ==========================================
  // 1. Profile Banners (بنرهای سینمایی و والپیپرهای پروفایل)
  // ==========================================
  {
    id: 'banner_persepolis',
    type: 'banner',
    nameFa: 'تخت جمشید و آپادانای زرین',
    nameEn: 'Persepolis Sunset Palace',
    category: 'banners',
    price: 350,
    icon: '🏛️',
    tag: '🏛️ هخامنشی',
    imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=1200&q=80',
    description: 'شکوه و عظمت ستون‌های سنگی تخت جمشید با نورپردازی طلایی غروب آفتاب باستان',
    gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #451a03 100%)'
  },
  {
    id: 'banner_royal_gold',
    type: 'banner',
    nameFa: 'طلای سلطنتی ۲۴ عیار و مخمل',
    nameEn: 'Royal 24K Gold & Obsidian',
    category: 'banners',
    price: 500,
    icon: '👑',
    tag: '👑 سلطنتی',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    description: 'طرح لوکس طلای ۲۴ عیار و ذرات درخشان پادشاهان باستان بر بستر مخمل سیاه شاهانه',
    gradient: 'linear-gradient(135deg, #854d0e 0%, #facc15 50%, #713f12 100%)'
  },
  {
    id: 'banner_cyber_neon',
    type: 'banner',
    nameFa: 'نئون سایبرپانک ۲۰۷۷',
    nameEn: 'Cyberpunk Neon City 2077',
    category: 'banners',
    price: 400,
    icon: '⚡',
    tag: '⚡ سایبرپانک',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    description: 'آسمان‌خراش‌های آینده‌نگر با باران نورهای نئونی بنفش، فیروزه‌ای و پرتوهای لیزری',
    gradient: 'linear-gradient(135deg, #c026d3 0%, #6d28d9 50%, #06b6d4 100%)'
  },
  {
    id: 'banner_cosmic',
    type: 'banner',
    nameFa: 'سحابی و کهکشان کیهانی',
    nameEn: 'Deep Cosmic Nebula & Stars',
    category: 'banners',
    price: 450,
    icon: '🌌',
    tag: '🌌 کیهان',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    description: 'کهکشان‌های ژرف بی‌انتها، غبار کیهانی سحرانگیز و ستارگان چشمک‌زن فضا',
    gradient: 'linear-gradient(135deg, #312e81 0%, #581c87 50%, #030712 100%)'
  },
  {
    id: 'banner_dragon',
    type: 'banner',
    nameFa: 'اژدهای شاهنامه و آتش',
    nameEn: 'Mythical Dragon Flame Arena',
    category: 'banners',
    price: 600,
    icon: '🐉',
    tag: '🐉 حماسی',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    description: 'شعله‌های سرخ آتشین میدان نبرد اساطیری برای مبارزان جسور و قهرمانان چاژا',
    gradient: 'linear-gradient(135deg, #991b1b 0%, #e11d48 50%, #0a0a0a 100%)'
  },
  {
    id: 'banner_casino',
    type: 'banner',
    nameFa: 'کازینو رویال و ژتون‌های طلا',
    nameEn: 'Vegas Casino Royale & Chips',
    category: 'banners',
    price: 450,
    icon: '🃏',
    tag: '🃏 شاهانه',
    imageUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
    description: 'میز مخمل سبز زمردین کازینو با دست‌های پاسور و ژتون‌های برنده مسابقات سنگین',
    gradient: 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #052e16 100%)'
  },
  {
    id: 'banner_mountain_aurora',
    type: 'banner',
    nameFa: 'قله دماوند و شفق قطبی',
    nameEn: 'Damavand Peak Aurora Borealis',
    category: 'banners',
    price: 380,
    icon: '🏔️',
    tag: '🏔️ شفق قطبی',
    imageUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    description: 'صلابت قله برفی در آغوش رقص نورهای زمردین و آرامش‌بخش شفق قطبی شبانه',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #0e7490 50%, #0284c7 100%)'
  },
  {
    id: 'banner_chess_grandmaster',
    type: 'banner',
    nameFa: 'شطرنج گرندمستر بین‌المللی',
    nameEn: 'Grandmaster Chess Sanctuary',
    category: 'banners',
    price: 420,
    icon: '♟️',
    tag: '♟️ شطرنج',
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
    description: 'مهره‌های دست‌ساز شاه و وزیر از جنس چوب آبنوس با نورپردازی استودیویی سینمایی',
    gradient: 'linear-gradient(135deg, #27272a 0%, #71717a 50%, #18181b 100%)'
  },
  {
    id: 'banner_snooker_masters',
    type: 'banner',
    nameFa: 'مسابقات مسترز اسنوکر جهانی',
    nameEn: 'World Snooker Championship Felt',
    category: 'banners',
    price: 420,
    icon: '🎱',
    tag: '🎱 مسترز',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    description: 'توپ‌های درخشان صیقلی اسنوکر بر ماهوت انگلیسی با چوب کیو اعلا',
    gradient: 'linear-gradient(135deg, #042f2e 0%, #065f46 50%, #022c22 100%)'
  },
  {
    id: 'banner_khatam_art',
    type: 'banner',
    nameFa: 'هنر اصیل خاتم و منبت شیراز',
    nameEn: 'Persian Khatam & Inlay Heritage',
    category: 'banners',
    price: 390,
    icon: '🪵',
    tag: '🪵 خاتم اصیل',
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
    description: 'هنر دست استادان منبت و خاتم‌کاری اصفهان و شیراز با الگوهای هندسی خیره‌کننده',
    gradient: 'linear-gradient(135deg, #451a03 0%, #92400e 50%, #78350f 100%)'
  },

  // ==========================================
  // 2. Checkers & Pieces (مهره‌های منبت و نگین‌دار بازی‌ها)
  // ==========================================
  {
    id: 'faravahar',
    type: 'pieceSkin',
    nameFa: 'مهره منبت فروهر بالدار 🦅',
    nameEn: 'Winged Faravahar Carved Checkers',
    category: 'pieces',
    price: 0,
    icon: '🦅',
    badge: 'هدیه چاژا',
    description: 'مهره‌های نفیس چوب گردوی باستانی با نقش برجسته زرین نماد فروهر هخامنشی',
    previewColor: 'from-amber-600 via-amber-500 to-yellow-600',
    borderClass: 'border-amber-400'
  },
  {
    id: 'lion_sun',
    type: 'pieceSkin',
    nameFa: 'مهره شیر و خورشید سلطنتی 🦁',
    nameEn: 'Imperial Lion & Sun Gold Checkers',
    category: 'pieces',
    price: 450,
    icon: '🦁',
    badge: 'طلاکوب',
    description: 'مهره‌های آبنوس سیاه صیقلی با نشان شیر و خورشید طلاکوب شده با طلای ۲۴ عیار',
    previewColor: 'from-neutral-900 via-stone-800 to-amber-950',
    borderClass: 'border-yellow-400'
  },
  {
    id: 'dragon_fire',
    type: 'pieceSkin',
    nameFa: 'مهره آتشین اژدهای سرخ 🐉',
    nameEn: 'Inferno Dragon Red Checkers',
    category: 'pieces',
    price: 480,
    icon: '🐉',
    badge: 'عقیق سرخ',
    description: 'تراشیده شده از سنگ عقیق سرخ آتشفشانی با نگین‌های درخشان و حاشیه برنزی گداخته',
    previewColor: 'from-red-800 via-rose-700 to-amber-700',
    borderClass: 'border-rose-400'
  },
  {
    id: 'crystal',
    type: 'pieceSkin',
    nameFa: 'مهره کریستال کوانتومی کهکشان 🔮',
    nameEn: 'Quantum Nebula Crystal Checkers',
    category: 'pieces',
    price: 420,
    icon: '🔮',
    badge: 'کریستالی',
    description: 'دیسک‌های بلورین فیروزه‌ای-بنفش شفاف با هسته نورانی پالس‌دار و بازتاب منشوری',
    previewColor: 'from-purple-900 via-indigo-800 to-cyan-800',
    borderClass: 'border-cyan-400'
  },
  {
    id: 'khatam_shiraz',
    type: 'pieceSkin',
    nameFa: 'مهره خاتم‌کاری هفت‌رنگ شیراز 🪵',
    nameEn: 'Masterpiece Shiraz Khatam Checkers',
    category: 'pieces',
    price: 520,
    icon: '🪵',
    badge: 'صنایع دستی',
    description: 'شاهکار هنر اصیل خاتم با معرق چوب گردو، برنج زرین و استخوان صیقل‌خورده',
    previewColor: 'from-amber-900 via-yellow-900 to-stone-900',
    borderClass: 'border-amber-500'
  },
  {
    id: 'black_diamond',
    type: 'pieceSkin',
    nameFa: 'مهره الماس سیاه بلک دایموند 💎',
    nameEn: 'Black Diamond & Carbon Checkers',
    category: 'pieces',
    price: 550,
    icon: '💎',
    badge: 'سوپرلوکس',
    description: 'کربن فورج شده فوق‌سبک مات با رگه‌های متالیک پلاتینیوم و نگین الماس سیاه',
    previewColor: 'from-zinc-950 via-slate-900 to-zinc-900',
    borderClass: 'border-zinc-400'
  },
  {
    id: 'emerald_royal',
    type: 'pieceSkin',
    nameFa: 'مهره سنگ یشم و زمرد شاهانه 🟢',
    nameEn: 'Imperial Jade & Emerald Checkers',
    category: 'pieces',
    price: 460,
    icon: '🟢',
    badge: 'زمرد اصل',
    description: 'سنگ یشم سبز صیقلی امپراتوری با کتیبه زرین هخامنشی و انعکاس ابریشمی',
    previewColor: 'from-emerald-900 via-teal-800 to-green-950',
    borderClass: 'border-emerald-400'
  },

  // ==========================================
  // 3. Game Board Themes (طرح و تم زمین‌های بازی)
  // ==========================================
  {
    id: 'persia',
    type: 'boardTheme',
    nameFa: 'تم تخت جمشید و لاجورد باستان 🏛️',
    nameEn: 'Ancient Persepolis Azure & Marble',
    category: 'themes',
    price: 400,
    icon: '🏛️',
    badge: 'تاریخی',
    description: 'زمین بازی با سنگ مرمر تیره، ستون‌های سنگی آپادانا، نقوش لاجوردی و فیروزه‌ای شاهانه',
    previewStyle: 'bg-gradient-to-br from-[#0f2830] via-[#081820] to-[#040d12] border-cyan-500'
  },
  {
    id: 'wood',
    type: 'boardTheme',
    nameFa: 'تم کلاسیک چوب گردوی معرق 🪵',
    nameEn: 'Traditional Walnut Inlay Classic',
    category: 'themes',
    price: 0,
    icon: '🪵',
    badge: 'اصیل',
    description: 'تخته چوب گردوی اعلای عتیقه با معرق‌کاری‌های دست‌ساز و رنگ گرم نوستالژیک',
    previewStyle: 'bg-gradient-to-br from-[#3b2314] via-[#2a170a] to-[#1e0f05] border-amber-600'
  },
  {
    id: 'luxury_gold',
    type: 'boardTheme',
    nameFa: 'تم آبنوس و طلای ۲۴ عیار سلطنتی 👑',
    nameEn: 'Obsidian & 24K Pure Gold',
    category: 'themes',
    price: 550,
    icon: '👑',
    badge: 'VIP',
    description: 'تلفیق مخمل مشکی عمیق، آبنوس متالیک و خطوط کشیده شده از طلای خالص ۲۴ عیار',
    previewStyle: 'bg-gradient-to-br from-[#0f0f12] via-[#09090b] to-[#18181b] border-amber-400'
  },
  {
    id: 'cosmic',
    type: 'boardTheme',
    nameFa: 'تم سحابی و اعماق کهکشان 🌌',
    nameEn: 'Deep Cosmic Galaxy Arena',
    category: 'themes',
    price: 450,
    icon: '🌌',
    badge: 'فضایی',
    description: 'پرواز بر فراز کهکشان‌ها، ستاره‌های درخشان و زمین بازی بنفش-نیلی با افکت نوری جذاب',
    previewStyle: 'bg-gradient-to-br from-[#07051a] via-[#030014] to-[#1e1b4b] border-purple-400'
  },
  {
    id: 'casino',
    type: 'boardTheme',
    nameFa: 'تم کازینو رویال و مخمل سبز 🃏',
    nameEn: 'Vegas Royale Emerald Velvet',
    category: 'themes',
    price: 420,
    icon: '🃏',
    badge: 'کازینو',
    description: 'زمین بازی شبیه معتبرترین میزهای مسابقات وگاس با ماهوت سبز زمردین و کادر چرم',
    previewStyle: 'bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#0f172a] border-emerald-500'
  },
  {
    id: 'marble',
    type: 'boardTheme',
    nameFa: 'تم سنگ مرمر کارارا و طلا 🏛️',
    nameEn: 'Carrara White Marble & Gold Veins',
    category: 'themes',
    price: 480,
    icon: '🏛️',
    badge: 'مدرن',
    description: 'سنگ مرمر سفید صیقلی با رگه‌های طلایی و خاکستری بسیار مینیمال، مدرن و خوانا',
    previewStyle: 'bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] border-amber-500 text-slate-900'
  },

  // ==========================================
  // 4. Custom 3D Dice (تاس‌های شانس و سه‌بعدی VIP)
  // ==========================================
  {
    id: 'dice_gold',
    type: 'diceSkin',
    nameFa: 'تاس طلای خالص با نگین یاقوت 👑🎲',
    nameEn: 'Solid 24K Gold & Ruby Dice',
    category: 'dice',
    price: 450,
    icon: '🎲',
    badge: 'طلا ۲۴',
    description: 'تاس سنگین طلایی با خال‌های قرمز یاقوتی براق و صدای چرخش فلزی خیره‌کننده',
    diceBg: 'bg-gradient-to-br from-[#fef08a] via-[#f59e0b] to-[#b45309]',
    pipColor: 'bg-red-600 shadow-[0_0_6px_rgba(220,38,38,0.9)]'
  },
  {
    id: 'dice_neon',
    type: 'diceSkin',
    nameFa: 'تاس سایبر نئون هولوگرافیک ⚡🎲',
    nameEn: 'Cyber Neon Cyan Hologram Dice',
    category: 'dice',
    price: 390,
    icon: '⚡',
    badge: 'نئونی',
    description: 'بدنه مشکی متالیک با خال‌های پالس‌دار فیروزه‌ای و هاله نوری درخشان شبانه',
    diceBg: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] border border-cyan-400',
    pipColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]'
  },
  {
    id: 'dice_dragon',
    type: 'diceSkin',
    nameFa: 'تاس ماگما و آتش اژدها 🐉🎲',
    nameEn: 'Dragon Magma Fire Dice',
    category: 'dice',
    price: 430,
    icon: '🐉',
    badge: 'آتشین',
    description: 'حرارت گدازه‌های سرخ آتشفشانی با خال‌های کهربایی گداخته در هنگام پرتاب',
    diceBg: 'bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a]',
    pipColor: 'bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,1)]'
  },
  {
    id: 'dice_onyx',
    type: 'diceSkin',
    nameFa: 'تاس سنگ اونیکس و نقره 🖤🎲',
    nameEn: 'Black Onyx & Sterling Silver Dice',
    category: 'dice',
    price: 380,
    icon: '🖤',
    badge: 'سنگ معدنی',
    description: 'مشکی پیانویی براق و صیقلی با خال‌های نقره‌ای برجسته و باکلاس',
    diceBg: 'bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#09090b]',
    pipColor: 'bg-slate-200 shadow-[0_0_4px_rgba(255,255,255,0.8)]'
  },
  {
    id: 'dice_crystal',
    type: 'diceSkin',
    nameFa: 'تاس بلورین بنفش کوانتوم 🔮🎲',
    nameEn: 'Purple Quantum Crystal Dice',
    category: 'dice',
    price: 420,
    icon: '🔮',
    badge: 'بلورین',
    description: 'کریستال شفاف ژئود با خال‌های درخشان آسمانی و انعکاس نور چندبعدی',
    diceBg: 'bg-gradient-to-br from-[#581c87] via-[#3b0764] to-[#1e1b4b]',
    pipColor: 'bg-fuchsia-300 shadow-[0_0_6px_rgba(240,171,252,1)]'
  },

  // ==========================================
  // 5. Avatar Frames (قاب‌ها و هاله‌های آواتار)
  // ==========================================
  {
    id: 'frame_royal_gold',
    type: 'frame',
    nameFa: 'قاب زرین برگ زیتون قهرمانان 🏆',
    nameEn: 'Royal Gold Laurel Frame',
    category: 'frames',
    price: 280,
    icon: '🏆',
    previewClass: 'ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.7)]',
    description: 'حلقه زرین پیروزی با تاج برگ زیتون و درخشش هاله طلایی دور عکس پروفایل'
  },
  {
    id: 'frame_neon_cyan',
    type: 'frame',
    nameFa: 'قاب هولوگرافیک سایان نئون 💎',
    nameEn: 'Cyber Cyan Glow Frame',
    category: 'frames',
    price: 240,
    icon: '💎',
    previewClass: 'ring-4 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]',
    description: 'هاله نوری درخشان سبک استریمرها و آرکیدهای مدرن با پالس رنگی فیروزه‌ای'
  },
  {
    id: 'frame_fire_flame',
    type: 'frame',
    nameFa: 'قاب شعله‌های گداخته ماگما 🔥',
    nameEn: 'Inferno Magma Flame Frame',
    category: 'frames',
    price: 320,
    icon: '🔥',
    previewClass: 'ring-4 ring-rose-500 shadow-[0_0_22px_rgba(244,63,94,0.8)]',
    description: 'شعله‌های پرانرژی آتشین و گدازه سرخ برای بازیکنان تهاجمی و نترس'
  },
  {
    id: 'frame_vip_diamond',
    type: 'frame',
    nameFa: 'قاب پلاتینیوم و الماس VIP 👑',
    nameEn: 'Platinum VIP Diamond Crown',
    category: 'frames',
    price: 600,
    icon: '👑',
    previewClass: 'ring-4 ring-yellow-300 border-2 border-white shadow-[0_0_25px_rgba(250,204,21,0.9)] animate-pulse',
    description: 'قاب فوق‌العاده شکیل ویژه بازیکنان برتر با نگین‌های الماس پلاتینیومی'
  },

  // ==========================================
  // 6. VIP & Titles (عضویت ویژه و القاب افتخاری)
  // ==========================================
  {
    id: 'vip_pass_30',
    type: 'vip',
    nameFa: 'اشتراک ۳۰ روزه چاژا VIP 👑',
    nameEn: '30-Day VIP Royal Pass',
    category: 'vip',
    price: 950,
    icon: '👑',
    badge: 'اشتراک VIP',
    description: 'نشان طلایی VIP کنار اسم، ۲ برابر سکه جایزه روزانه، دسترسی به تمام تم‌ها و ورودی رایگان تورنمنت‌ها'
  },
  {
    id: 'title_shah',
    type: 'title',
    nameFa: 'لقب افتخاری «شاه چاژا 👑»',
    nameEn: 'Imperial Title: Shah of Chazha',
    category: 'vip',
    price: 350,
    icon: '👑',
    badge: 'لقب',
    description: 'این لقب با نشان تاج زرین در پروفایل، بالای سر آواتار و کنار پیامتان در سالن بازی‌ها می‌درخشد'
  },
  {
    id: 'title_champion',
    type: 'title',
    nameFa: 'لقب افتخاری «قهرمان مسابقات 🏆»',
    nameEn: 'Title: Tournament Champion',
    category: 'vip',
    price: 300,
    icon: '🏆',
    badge: 'لقب',
    description: 'نشان ویژه قهرمان برای بازیکنانی که اهل بردن جوایز بزرگ هستند'
  }
];

export default function ChazhaStoreModal({ isOpen, onClose }) {
  const { 
    coins, 
    purchasedItems = [], 
    buyStoreItem, 
    equippedFrame, 
    equippedBubble,
    equippedPieceSkin = 'faravahar',
    equippedBoardTheme = 'wood',
    equippedDiceSkin = 'default',
    equippedTitle = 'none',
    equippedBanner = 'banner_persepolis',
    setEquippedItem,
    unequipItem,
    isVip,
    activateVip,
    isRtl = true
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('banners');
  const [toastMessage, setToastMessage] = useState('');

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Check if item is active/equipped
  const isItemEquipped = (item) => {
    if (item.type === 'frame') return equippedFrame === item.id;
    if (item.type === 'bubble') return equippedBubble === item.id;
    if (item.type === 'pieceSkin') return equippedPieceSkin === item.id;
    if (item.type === 'boardTheme') return equippedBoardTheme === item.id;
    if (item.type === 'diceSkin') return equippedDiceSkin === item.id;
    if (item.type === 'title') return equippedTitle === item.id;
    if (item.type === 'banner') return equippedBanner === item.id;
    if (item.type === 'vip') return isVip;
    return false;
  };

  // Check if user owns the item
  const isItemOwned = (item) => {
    if (item.price === 0) return true;
    if (item.id === 'faravahar' || item.id === 'wood' || item.id === 'banner_persepolis') return true;
    return (purchasedItems || []).includes(item.id);
  };

  // Toggle Equip / Deactivate handler
  const handleItemAction = (item) => {
    soundEngine.playTap?.();
    haptics.impact?.('light');

    const owned = isItemOwned(item);
    const equipped = isItemEquipped(item);

    // 1. If currently equipped -> DEACTIVATE IT!
    if (equipped) {
      if (unequipItem) {
        unequipItem(item.type, item.id);
      }
      showToast(`«${item.nameFa}» غیرفعال شد.`);
      soundEngine.playCheckmark?.();
      return;
    }

    // 2. If owned but not equipped -> EQUIP IT!
    if (owned) {
      if (item.type === 'vip') {
        activateVip?.(30);
      } else {
        setEquippedItem(item.type, item.id);
        if (item.type === 'banner' && item.imageUrl) {
          const { setUserProfile } = useAppStore.getState();
          if (setUserProfile) {
            setUserProfile({ banner: item.imageUrl, bannerId: item.id });
            localStorage.setItem('life_os_user_banner', item.imageUrl);
          }
        }
      }
      showToast(isRtl ? `«${item.nameFa}» فعال شد! ✅` : `"${item.nameEn}" equipped! ✅`);
      soundEngine.playCheckmark?.();
      return;
    }

    // 3. Not owned -> BUY IT!
    const res = buyStoreItem(item);
    if (res.success) {
      if (item.type === 'vip') {
        activateVip?.(30);
      } else {
        setEquippedItem(item.type, item.id);
        if (item.type === 'banner' && item.imageUrl) {
          const { setUserProfile } = useAppStore.getState();
          if (setUserProfile) {
            setUserProfile({ banner: item.imageUrl, bannerId: item.id });
            localStorage.setItem('life_os_user_banner', item.imageUrl);
          }
        }
      }
      showToast(isRtl ? `🎉 مبارکه! «${item.nameFa}» خریداری و فعال شد.` : `Purchased & activated! 🎉`);
      soundEngine.playLevelUp?.();
      haptics.notification?.('success');
    } else {
      showToast(res.message || 'سکه کافی نیست! از تب «شارژ سکه» موجودی خود را افزایش دهید.');
      soundEngine.playError?.();
    }
  };

  const tabs = [
    { id: 'banners', label: '🖼️ بنرها', icon: '🖼️' },
    { id: 'pieces', label: '🎲 مهره‌ها', icon: '🎲' },
    { id: 'themes', label: '🪵 تم‌ها', icon: '🪵' },
    { id: 'dice', label: '🎲 تاس ۳D', icon: '🎲' },
    { id: 'frames', label: '👑 قاب‌ها', icon: '👑' },
    { id: 'vip', label: '💎 VIP', icon: '💎' },
    { id: 'coins', label: '🪙 شارژ سکه', icon: '🪙' },
  ];

  const currentItems = CHAZHA_STORE_ITEMS.filter(i => i.category === activeTab);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-dark-surface="true"
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-4 text-white dark select-none"
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.94, y: 15, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[90vh] rounded-3xl bg-[#0b0e17] border border-amber-500/40 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden"
          style={{ backgroundColor: '#0b0e17' }}
        >
          {/* Header */}
          <div 
            className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-md shrink-0"
            style={{ backgroundColor: '#101422' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/25">
                <ShoppingBag size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                  <span>فروشگاه و آرکید VIP چاژا</span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black font-mono flex items-center gap-1" style={{ color: '#fbbf24' }}>
                    <span>🪙</span>
                    <span>{(coins || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-amber-200/70">سکه</span>
                  </span>
                  <span className="text-[10px] text-slate-400">• تحویل و فعال‌سازی فوری</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playTap?.();
                  setActiveTab('coins');
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.4)' }}
              >
                <span>➕ شارژ سکه</span>
              </button>
              <button 
                onClick={() => {
                  soundEngine.playTap?.();
                  onClose();
                }} 
                className="w-8 h-8 rounded-full border border-white/20 active:scale-95 transition-all flex items-center justify-center text-white cursor-pointer"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#ffffff' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-4 py-2 text-xs font-black text-center shadow-lg shrink-0 overflow-hidden"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Tabs */}
          <div 
            className="flex gap-1.5 px-3 py-2 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0"
            style={{ backgroundColor: '#0d101a' }}
          >
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  soundEngine.playTap?.();
                  setActiveTab(t.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.03]'
                    : 'text-slate-300 hover:text-white'
                }`}
                style={activeTab !== t.id ? { backgroundColor: 'rgba(255, 255, 255, 0.06)' } : {}}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Content Feed */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 max-h-[60vh]">
            {activeTab === 'coins' ? (
              // MONETIZATION HUB
              <div className="space-y-3">
                {/* VIP Membership */}
                <div 
                  className="p-3.5 rounded-2xl border relative overflow-hidden"
                  style={{ backgroundColor: '#131926', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-2xl text-slate-950 shadow-md shrink-0">
                      👑
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black" style={{ color: '#fcd34d' }}>
                        اشتراک طلایی چاژا VIP (ماهانه)
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                        دسترسی آزاد به تمام تم‌ها و مهره‌ها، ۵۰٪ سکه بیشتر در بردها و نشان VIP کنار نام!
                      </p>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
                        <span className="text-xs font-black font-mono" style={{ color: '#fbbf24' }}>
                          ۹۵۰ سکه یا ۳۵۰ استارز ⭐
                        </span>
                        <button
                          onClick={() => {
                            soundEngine.playTap?.();
                            const item = CHAZHA_STORE_ITEMS.find(x => x.id === 'vip_pass_30');
                            if (item) handleItemAction(item);
                          }}
                          className="px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-md cursor-pointer"
                          style={isVip 
                            ? { backgroundColor: 'rgba(16, 185, 129, 0.3)', color: '#6ee7b7', border: '1px solid #10b981' }
                            : { backgroundColor: '#f59e0b', color: '#0f172a' }
                          }
                        >
                          {isVip ? 'VIP فعال است ✓' : 'فعال‌سازی VIP'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telegram Stars Packages */}
                <div 
                  className="p-3.5 rounded-2xl border space-y-2.5"
                  style={{ backgroundColor: '#131926', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <div>
                      <h4 className="text-xs font-black text-white">خرید با تلگرام استارز (Telegram Stars)</h4>
                      <p className="text-[10px] text-sky-400">شارژ خودکار و لحظه‌ای در ربات تلگرام</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { coins: '۱,۰۰۰ سکه', stars: '۳۵ ⭐', tag: 'شروع' },
                      { coins: '۵,۰۰۰ سکه', stars: '۱۵۰ ⭐', tag: 'محبوب 🔥' },
                      { coins: '۱۵,۰۰۰ سکه + لقب', stars: '۳۵۰ ⭐', tag: 'ویژه' },
                      { coins: '۵۰,۰۰۰ سکه + VIP', stars: '۱,۰۰۰ ⭐', tag: 'امپراتور 👑' }
                    ].map((pkg, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          soundEngine.playTap?.();
                          const tg = window.Telegram?.WebApp;
                          if (tg?.openTelegramLink) {
                            tg.openTelegramLink('https://t.me/chazha_bot?start=buy_stars');
                          } else {
                            window.open('https://t.me/chazha_bot', '_blank');
                          }
                        }}
                        className="p-2.5 rounded-xl border border-white/10 text-center transition-all active:scale-95 cursor-pointer group"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                      >
                        <span className="block text-xs font-black text-white group-hover:text-sky-300">{pkg.coins}</span>
                        <span className="text-[11px] font-black font-mono" style={{ color: '#fbbf24' }}>{pkg.stars}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TON Crypto Checkout */}
                <div 
                  className="p-3 rounded-2xl border flex items-center justify-between gap-3"
                  style={{ backgroundColor: '#131926', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💎</span>
                    <div>
                      <h4 className="text-xs font-black text-white">پرداخت ارز دیجیتال (TON / USDT)</h4>
                      <p className="text-[10px] text-indigo-300 mt-0.5">درگاه مستقیم کیف‌پول تلگرام و تون‌کیپر</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playTap?.();
                      const tg = window.Telegram?.WebApp;
                      if (tg?.openTelegramLink) {
                        tg.openTelegramLink('https://t.me/chazha_bot?start=buy_crypto');
                      } else {
                        window.open('https://t.me/chazha_bot', '_blank');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-white font-black text-xs transition-all active:scale-95 shadow cursor-pointer flex items-center gap-1 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                  >
                    <Wallet size={13} />
                    <span>خرید TON</span>
                  </button>
                </div>

                {/* Rial / Bank Card Packages */}
                <div 
                  className="p-3 rounded-2xl border space-y-2"
                  style={{ backgroundColor: '#131926', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💳</span>
                    <h4 className="text-xs font-black text-white">خرید ریالی و کارت به کارت (شتاب)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { title: 'بسته برنزی', price: '۵۰ هزار تومان', coins: '۲,۰۰۰ سکه' },
                      { title: 'بسته نقره‌ای', price: '۱۲۰ هزار تومان', coins: '۶,۰۰۰ سکه' },
                      { title: 'بسته طلایی', price: '۲۵۰ هزار تومان', coins: '۱۵,۰۰۰ سکه' },
                      { title: 'بسته امپراتور', price: '۴۹۰ هزار تومان', coins: '۴۰,۰۰۰ سکه + VIP' }
                    ].map((pack, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          soundEngine.playTap?.();
                          const tg = window.Telegram?.WebApp;
                          if (tg?.openTelegramLink) {
                            tg.openTelegramLink(`https://t.me/chazha_bot?start=buy_rial_${idx + 1}`);
                          } else {
                            window.open('https://t.me/chazha_bot', '_blank');
                          }
                        }}
                        className="p-2 rounded-xl border border-white/5 text-right transition-all active:scale-95 cursor-pointer"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                      >
                        <span className="block text-[11px] font-black text-white">{pack.title}</span>
                        <span className="block text-[10px] font-bold font-mono" style={{ color: '#fbbf24' }}>{pack.coins}</span>
                        <span className="block text-[9px] text-slate-400 mt-0.5">{pack.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // ITEMS FEED
              currentItems.map(item => {
                const isOwned = isItemOwned(item);
                const isEquipped = isItemEquipped(item);

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border transition-all flex flex-col gap-2 relative shadow-md"
                    style={{ backgroundColor: '#131926', borderColor: isEquipped ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.1)' }}
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {item.type === 'pieces' || item.type === 'pieceSkin' ? (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border-2 ${item.borderClass || 'border-amber-400'} bg-gradient-to-br ${item.previewColor || 'from-amber-700 to-amber-950'}`}>
                            {item.icon}
                          </div>
                        ) : item.type === 'diceSkin' ? (
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow ${item.diceBg || 'bg-amber-500'}`}>
                            {item.icon}
                          </div>
                        ) : item.type === 'frame' ? (
                          <div className="relative w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                            <span className="text-base">👤</span>
                            <div className={`absolute inset-0 rounded-full ${item.previewClass}`} />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            {item.icon}
                          </div>
                        )}

                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-white truncate">
                              {item.nameFa}
                            </h4>
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-black font-mono" style={{ color: '#fbbf24' }}>
                              {item.price === 0 ? 'رایگان' : `🪙 ${item.price.toLocaleString()} سکه`}
                            </span>
                            {isOwned && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                در صندوق
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button: BUY | EQUIP | DEACTIVATE */}
                      <button
                        onClick={() => handleItemAction(item)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 shrink-0 shadow-md cursor-pointer flex items-center gap-1"
                        style={isEquipped
                          ? { backgroundColor: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', color: '#6ee7b7' }
                          : isOwned
                          ? { backgroundColor: '#0284c7', color: '#ffffff' }
                          : { backgroundColor: '#f59e0b', color: '#0f172a' }
                        }
                      >
                        {isEquipped ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>فعال ✓ (لغو ✕)</span>
                          </>
                        ) : isOwned ? (
                          <>
                            <Zap size={13} />
                            <span>فعال‌سازی</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={13} />
                            <span>خرید</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] leading-relaxed" style={{ color: '#cbd5e1' }}>
                      {item.description}
                    </p>

                    {/* Banner Panoramic Image Preview */}
                    {item.type === 'banner' && item.imageUrl && (
                      <div className="h-28 w-full rounded-2xl overflow-hidden relative mt-1 border border-white/10 bg-slate-950">
                        <img 
                          src={item.imageUrl} 
                          alt={item.nameFa} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                          <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-lg border border-amber-400/20">
                            <Sparkles size={11} className="text-amber-400" />
                            <span>{item.tag || item.nameFa}</span>
                          </span>
                          <span className="text-[9px] font-mono text-white/90 bg-black/70 px-2 py-0.5 rounded-lg border border-white/10">
                            HD Wallpaper
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div 
            className="p-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 shrink-0"
            style={{ backgroundColor: '#101422' }}
          >
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles size={13} />
              <span>تنظیمات بلافاصله در پروفایل و بازی اعمال می‌شوند</span>
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-xl text-white font-bold text-xs transition-all cursor-pointer"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              بستن
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
