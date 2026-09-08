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
  // 1. Profile Banners (بنرهای سینمایی و فوق‌العاده پروفایل)
  // ==========================================
  {
    id: 'banner_persepolis',
    type: 'banner',
    nameFa: 'بنر تخت جمشید و آپادانای زرین',
    nameEn: 'Persepolis Sunset Palace',
    category: 'banners',
    price: 350,
    icon: '🏛️',
    tag: '🏛️ هخامنشی',
    imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-amber-700 via-orange-600 to-amber-950',
    description: 'شکوه و عظمت ستون‌های سنگی تخت جمشید با نورپردازی طلایی غروب آفتاب باستان',
    gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #451a03 100%)'
  },
  {
    id: 'banner_royal_gold',
    type: 'banner',
    nameFa: 'بنر طلای سلطنتی ۲۴ عیار و مخمل',
    nameEn: 'Royal 24K Gold & Obsidian',
    category: 'banners',
    price: 500,
    icon: '👑',
    tag: '👑 سلطنتی',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-yellow-600 via-amber-400 to-yellow-900',
    description: 'طرح لوکس طلای ۲۴ عیار و ذرات درخشان پادشاهان باستان بر بستر مخمل سیاه شاهانه',
    gradient: 'linear-gradient(135deg, #854d0e 0%, #facc15 50%, #713f12 100%)'
  },
  {
    id: 'banner_cyber_neon',
    type: 'banner',
    nameFa: 'بنر نئون سایبرپانک ۲۰۷۷',
    nameEn: 'Cyberpunk Neon City 2077',
    category: 'banners',
    price: 400,
    icon: '⚡',
    tag: '⚡ سایبرپانک',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-fuchsia-600 via-purple-700 to-cyan-500',
    description: 'آسمان‌خراش‌های آینده‌نگر با باران نورهای نئونی بنفش، فیروزه‌ای و پرتوهای لیزری',
    gradient: 'linear-gradient(135deg, #c026d3 0%, #6d28d9 50%, #06b6d4 100%)'
  },
  {
    id: 'banner_cosmic',
    type: 'banner',
    nameFa: 'بنر سحابی و کهکشان کیهانی',
    nameEn: 'Deep Cosmic Nebula & Stars',
    category: 'banners',
    price: 450,
    icon: '🌌',
    tag: '🌌 کیهان',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-indigo-900 via-purple-900 to-slate-950',
    description: 'کهکشان‌های ژرف بی‌انتها، غبار کیهانی سحرانگیز و ستارگان چشمک‌زن فضا',
    gradient: 'linear-gradient(135deg, #312e81 0%, #581c87 50%, #030712 100%)'
  },
  {
    id: 'banner_dragon',
    type: 'banner',
    nameFa: 'بنر اژدهای شاهنامه و آتش',
    nameEn: 'Mythical Dragon Flame Arena',
    category: 'banners',
    price: 600,
    icon: '🐉',
    tag: '🐉 حماسی',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-red-700 via-rose-600 to-neutral-950',
    description: 'شعله‌های سرخ آتشین میدان نبرد اساطیری برای مبارزان جسور و قهرمانان چاژا',
    gradient: 'linear-gradient(135deg, #991b1b 0%, #e11d48 50%, #0a0a0a 100%)'
  },
  {
    id: 'banner_casino',
    type: 'banner',
    nameFa: 'بنر کازینو رویال و ژتون‌های طلا',
    nameEn: 'Vegas Casino Royale & Chips',
    category: 'banners',
    price: 450,
    icon: '🃏',
    tag: '🃏 شاهانه',
    imageUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-emerald-900 via-green-800 to-slate-950',
    description: 'میز مخمل سبز زمردین کازینو با دست‌های پاسور و ژتون‌های برنده مسابقات سنگین',
    gradient: 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #052e16 100%)'
  },
  {
    id: 'banner_mountain_aurora',
    type: 'banner',
    nameFa: 'بنر قله دماوند و شفق قطبی',
    nameEn: 'Damavand Peak Aurora Borealis',
    category: 'banners',
    price: 380,
    icon: '🏔️',
    tag: '🏔️ شفق قطبی',
    imageUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-cyan-900 via-slate-800 to-slate-950',
    description: 'صلابت قله برفی در آغوش رقص نورهای زمردین و آرامش‌بخش شفق قطبی شبانه',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #0e7490 50%, #0284c7 100%)'
  },
  {
    id: 'banner_chess_grandmaster',
    type: 'banner',
    nameFa: 'بنر شطرنج گرندمستر بین‌المللی',
    nameEn: 'Grandmaster Chess Sanctuary',
    category: 'banners',
    price: 420,
    icon: '♟️',
    tag: '♟️ شطرنج',
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-zinc-800 via-stone-800 to-black',
    description: 'مهره‌های دست‌ساز شاه و وزیر از جنس چوب آبنوس با نورپردازی استودیویی سینمایی',
    gradient: 'linear-gradient(135deg, #27272a 0%, #71717a 50%, #18181b 100%)'
  },
  {
    id: 'banner_snooker_masters',
    type: 'banner',
    nameFa: 'بنر مسابقات مسترز اسنوکر جهانی',
    nameEn: 'World Snooker Championship Felt',
    category: 'banners',
    price: 420,
    icon: '🎱',
    tag: '🎱 مسترز',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-teal-950 via-emerald-900 to-slate-950',
    description: 'توپ‌های درخشان صیقلی اسنوکر بر ماهوت انگلیسی با چوب کیو اعلا',
    gradient: 'linear-gradient(135deg, #042f2e 0%, #065f46 50%, #022c22 100%)'
  },
  {
    id: 'banner_khatam_art',
    type: 'banner',
    nameFa: 'بنر هنر اصیل خاتم و منبت شیراز',
    nameEn: 'Persian Khatam & Inlay Heritage',
    category: 'banners',
    price: 390,
    icon: '🪵',
    tag: '🪵 خاتم اصیل',
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-amber-900 via-yellow-800 to-amber-950',
    description: 'هنر دست استادان منبت و خاتم‌کاری اصفهان و شیراز با الگوهای هندسی خیره‌کننده',
    gradient: 'linear-gradient(135deg, #451a03 0%, #92400e 50%, #78350f 100%)'
  },
  {
    id: 'banner_samurai_cherry',
    type: 'banner',
    nameFa: 'بنر شکوفه گیلاس و شمشیر سامورایی',
    nameEn: 'Samurai Katana & Cherry Blossom',
    category: 'banners',
    price: 480,
    icon: '🌸',
    tag: '🌸 سامورایی',
    imageUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-rose-950 via-red-900 to-stone-950',
    description: 'آرامش معابد ژاپن با نماد شمشیر عدالت، کوه فوجی و گلبرگ‌های ساکورا',
    gradient: 'linear-gradient(135deg, #4c0519 0%, #881337 50%, #1c1917 100%)'
  },
  {
    id: 'banner_arcade_retro',
    type: 'banner',
    nameFa: 'بنر معبد نوستالژیک آرکید رترو',
    nameEn: 'Retro 80s Arcade Neon Temple',
    category: 'banners',
    price: 390,
    icon: '🕹️',
    tag: '🕹️ آرکید',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    previewBg: 'from-purple-900 via-pink-900 to-slate-950',
    description: 'فضای هیجان‌انگیز سالن‌های بازی سکه‌ای دهه ۸۰ با کابینت‌های نوری نوستالژیک',
    gradient: 'linear-gradient(135deg, #581c87 0%, #be185d 50%, #1e1b4b 100%)'
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
    borderClass: 'border-amber-400',
    symbolColor: '#fef08a'
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
    borderClass: 'border-yellow-400',
    symbolColor: '#facc15'
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
    borderClass: 'border-rose-400',
    symbolColor: '#fecdd3'
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
    borderClass: 'border-cyan-400',
    symbolColor: '#a5f3fc'
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
    borderClass: 'border-amber-500',
    symbolColor: '#fde68a'
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
    borderClass: 'border-zinc-400',
    symbolColor: '#e2e8f0'
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
    borderClass: 'border-emerald-400',
    symbolColor: '#a7f3d0'
  },
  {
    id: 'cyber_hex',
    type: 'pieceSkin',
    nameFa: 'مهره سایبر هگز نئون ۲۰۷۷ ⚡',
    nameEn: 'Cyber Hex Hologram Checkers',
    category: 'pieces',
    price: 490,
    icon: '⚡',
    badge: 'هولوگرام',
    description: 'طراحی شش‌ضلعی سایبری با نورپردازی داینامیک LED و افکت صوتی آینده‌نگر',
    previewColor: 'from-cyan-950 via-blue-900 to-fuchsia-950',
    borderClass: 'border-cyan-300',
    symbolColor: '#67e8f9'
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
    nameFa: 'تاس سنگ اونیکس و نقره استرلینگ 🖤🎲',
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
  {
    id: 'dice_ivory',
    type: 'diceSkin',
    nameFa: 'تاس سنتی عاج فیل و چوب افرا 🪵🎲',
    nameEn: 'Royal Ivory & Maple Classic Dice',
    category: 'dice',
    price: 300,
    icon: '🪵',
    badge: 'کلاسیک',
    description: 'تاس کلاسیک استخوانی و عاج شیری با خال‌های حکاکی شده قهوه‌ای سوخته',
    diceBg: 'bg-gradient-to-br from-[#ffffff] via-[#fffbeb] to-[#fef08a]',
    pipColor: 'bg-amber-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]'
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
    id: 'frame_persepolis_stone',
    type: 'frame',
    nameFa: 'قاب کتیبه سنگی آپادانا 🏛️',
    nameEn: 'Ancient Stone Inscription Frame',
    category: 'frames',
    price: 300,
    icon: '🏛️',
    previewClass: 'ring-4 ring-stone-400 border-2 border-amber-600/80 shadow-[0_0_15px_rgba(217,119,6,0.6)]',
    description: 'تراشیده شده از سنگ‌های کاخ آپادانا با حاشیه طلایی هخامنشی'
  },
  {
    id: 'frame_cosmic_void',
    type: 'frame',
    nameFa: 'تاج سحابی بنفش کیهانی 🌌',
    nameEn: 'Cosmic Nebula Crown Frame',
    category: 'frames',
    price: 340,
    icon: '🌌',
    previewClass: 'ring-4 ring-purple-500 shadow-[0_0_22px_rgba(168,85,247,0.8)]',
    description: 'حلقه انرژی کوانتومی بنفش مرموز با ستارگان متحرک'
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
    description: 'نشان طلایی VIP کنار اسم، ۲ برابر سکه جایزه روزانه، دسترسی به تمام تم‌ها و ورودی رایگان به تورنمنت‌ها'
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
  },
  {
    id: 'title_grandmaster',
    type: 'title',
    nameFa: 'لقب افتخاری «گرندمستر بین‌المللی ♟️»',
    nameEn: 'Title: Grandmaster of Games',
    category: 'vip',
    price: 320,
    icon: '♟️',
    badge: 'لقب',
    description: 'عنوان احترام‌آمیز برای استراتژیست‌های چاژا در تخته نرد، شطرنج، اسنوکر و حکم'
  },
  {
    id: 'bubble_gold',
    type: 'bubble',
    nameFa: 'حباب چت طلای شاهانه 💬',
    nameEn: 'Royal Gold In-Game Chat Bubble',
    category: 'vip',
    price: 180,
    icon: '💬',
    badge: 'چت طلایی',
    description: 'پیام‌های شما در چت زنده بازی‌ها و سالن با کادر و هاله نورانی طلایی اختصاصی نمایش داده می‌شود'
  },
  {
    id: 'bubble_cyber',
    type: 'bubble',
    nameFa: 'حباب چت سایبر نئون 🗨️',
    nameEn: 'Cyber Neon Chat Bubble',
    category: 'vip',
    price: 180,
    icon: '🗨️',
    badge: 'چت نئونی',
    description: 'پیام‌های چت با هاله متحرک ارغوانی-سایان سبک سایبرپانک ۲۰۷۷'
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
    equippedBanners = [],
    setEquippedItem,
    unequipItem,
    isVip,
    activateVip,
    isRtl = true
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('banners'); // 'banners' | 'pieces' | 'themes' | 'dice' | 'frames' | 'vip' | 'coins'
  const [toastMessage, setToastMessage] = useState('');
  const [zoomBanner, setZoomBanner] = useState(null);

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
    if (item.type === 'banner') return (equippedBanners || []).includes(item.id);
    if (item.type === 'vip') return isVip;
    return false;
  };

  // Check if user owns the item
  const isItemOwned = (item) => {
    if (item.price === 0) return true; // Starter free items
    if (item.id === 'faravahar' || item.id === 'wood') return true;
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
      showToast(`«${item.nameFa}» غیرفعال شد و به حالت پیش‌فرض بازگشت.`);
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
      showToast(isRtl ? `«${item.nameFa}» با موفقیت فعال و مجهز شد! ✅` : `"${item.nameEn}" equipped! ✅`);
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
      showToast(isRtl ? `🎉 مبارکه! «${item.nameFa}» خریداری و فوراً فعال شد.` : `Purchased & activated! 🎉`);
      soundEngine.playLevelUp?.();
      haptics.notification?.('success');
    } else {
      showToast(res.message || 'سکه کافی نیست! از تب «شارژ سکه» می‌توانید موجودی خود را افزایش دهید.');
      soundEngine.playError?.();
    }
  };

  const tabs = [
    { id: 'banners', label: '🖼️ بنر پروفایل', icon: '🖼️' },
    { id: 'pieces', label: '🎲 مهره‌های بازی', icon: '🎲' },
    { id: 'themes', label: '🪵 تم زمین بازی', icon: '🪵' },
    { id: 'dice', label: '🎲 تاس‌های ۳D', icon: '🎲' },
    { id: 'frames', label: '👑 قاب آواتار', icon: '👑' },
    { id: 'vip', label: '💎 VIP و القاب', icon: '💎' },
    { id: 'coins', label: '🪙 شارژ سکه و درآمدزایی', icon: '🪙' },
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
          className="relative w-full max-w-lg max-h-[90vh] rounded-3xl bg-[#0b0e17] border border-amber-500/40 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-56 h-56 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#101422]/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/25">
                <ShoppingBag size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                  <span>فروشگاه و آرکید VIP چاژا</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    STORE
                  </span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-amber-400 font-black font-mono flex items-center gap-1">
                    <span>🪙</span>
                    <span>{(coins || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-amber-200/70">سکه</span>
                  </span>
                  <span className="text-[10px] text-slate-400">• تحویل و فعال‌سازی آنی</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundEngine.playTap?.();
                  setActiveTab('coins');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs font-black flex items-center gap-1 transition-all active:scale-95"
              >
                <span>➕ شارژ</span>
              </button>
              <button 
                onClick={() => {
                  soundEngine.playTap?.();
                  onClose();
                }} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Toast Notification Banner */}
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

          {/* Category Tabs Slider */}
          <div className="flex gap-1.5 px-3 py-2 bg-[#0d101a] border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  soundEngine.playTap?.();
                  setActiveTab(t.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  activeTab === t.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.03]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Scrollable Content Feed */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 max-h-[60vh]">
            {activeTab === 'coins' ? (
              // ====================================================
              // MONETIZATION & COIN RECHARGE CENTER (درآمدزایی واقعی)
              // ====================================================
              <div className="space-y-3.5">
                {/* VIP Subscription Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-yellow-950/40 border border-amber-500/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-0.5 rounded-bl-xl bg-amber-500 text-slate-950 text-[10px] font-black">
                    پیشنهاد طلایی
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-2xl text-slate-950 shadow-lg shadow-amber-500/30 shrink-0">
                      👑
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                        <span>عضویت ویژه طلایی چاژا VIP</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                        دسترسی رایگان به تمامی تم‌ها و مهره‌ها، ۵۰٪ سکه بیشتر در بردها، نشان تاج طلایی کنار نام و ورودیه رایگان تمام تورنمنت‌های هفتگی!
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-amber-500/20">
                        <span className="text-xs font-black text-amber-400 font-mono">
                          ماهانه: ۹۵۰ سکه یا ۳۵۰ استارز ⭐
                        </span>
                        <button
                          onClick={() => {
                            soundEngine.playTap?.();
                            const item = CHAZHA_STORE_ITEMS.find(x => x.id === 'vip_pass_30');
                            if (item) handleItemAction(item);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-md ${
                            isVip
                              ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-300'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110'
                          }`}
                        >
                          {isVip ? 'عضویت VIP فعال است ✓' : 'فعال‌سازی آنی VIP'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Method 1: Telegram Stars */}
                <div className="p-3.5 rounded-2xl bg-[#121624] border border-sky-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-lg">
                        ⭐
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">خرید با تلگرام استارز (Telegram Stars)</h4>
                        <p className="text-[10px] text-sky-400 font-bold">شارژ مستقیم و فوری درون ربات تلگرام</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { coins: '۱,۰۰۰ سکه', stars: '۳۵ ⭐', tag: 'مبتدی' },
                      { coins: '۵,۰۰۰ سکه', stars: '۱۵۰ ⭐', tag: 'محبوب 🔥' },
                      { coins: '۱۵,۰۰۰ سکه + لقب', stars: '۳۵۰ ⭐', tag: 'ارزش بالا' },
                      { coins: '۵۰,۰۰۰ سکه + VIP', stars: '۱,۰۰۰ ⭐', tag: 'پادشاهی 👑' }
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
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-sky-500/20 text-center transition-all active:scale-95 group relative"
                      >
                        <span className="absolute top-1 left-1.5 text-[8px] px-1 rounded bg-sky-500/20 text-sky-300 font-bold">
                          {pkg.tag}
                        </span>
                        <span className="block text-xs font-black text-white group-hover:text-sky-300 mt-2">{pkg.coins}</span>
                        <span className="text-[11px] text-amber-400 font-black font-mono">{pkg.stars}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method 2: Crypto TON & USDT */}
                <div className="p-3.5 rounded-2xl bg-[#121624] border border-indigo-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
                      💎
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">پرداخت ارز دیجیتال (TON / USDT)</h4>
                      <p className="text-[10px] text-indigo-300 font-bold mt-0.5">درگاه مستقیم کیف‌پول تلگرام و تون‌کیپر</p>
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
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white font-black text-xs transition-all active:scale-95 shadow-md flex items-center gap-1.5 shrink-0"
                  >
                    <Wallet size={13} />
                    <span>خرید با TON</span>
                  </button>
                </div>

                {/* Method 3: Direct Card to Card / Rial Bot Checkout */}
                <div className="p-3.5 rounded-2xl bg-[#121624] border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
                        💳
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">خرید ریالی و کارت به کارت (ایران)</h4>
                        <p className="text-[10px] text-amber-400 font-bold">بسته‌های ویژه شتابی با شارژ آنی از طریق ربات تلگرام</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { title: 'بسته برنزی', price: '۵۰ هزار تومان', coins: '۲,۰۰۰ سکه' },
                      { title: 'بسته نقره‌ای', price: '۱۲۰ هزار تومان', coins: '۶,۰۰۰ سکه' },
                      { title: 'بسته طلایی', price: '۲۵۰ هزار تومان', coins: '۱۵,۰۰۰ سکه' },
                      { title: 'بسته امپراتور', price: '۴۹۰ هزار تومان', coins: '۴۰,۰۰۰ سکه + تم‌ها' }
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
                        className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 text-right transition-all active:scale-95"
                      >
                        <span className="block text-[11px] font-black text-white">{pack.title}</span>
                        <span className="block text-[10px] text-amber-400 font-bold font-mono">{pack.coins}</span>
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{pack.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Referral Program */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                      👥
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">دعوت دوستان به چاژا</h4>
                      <p className="text-[10px] text-emerald-400 font-bold mt-0.5">+۵۰۰ سکه رایگان و +۱۰۰ XP برای هر دوست</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playTap?.();
                      const tg = window.Telegram?.WebApp;
                      if (tg?.openTelegramLink) {
                        tg.openTelegramLink('https://t.me/chazha_bot?start=ref_my');
                      } else {
                        window.open('https://t.me/chazha_bot', '_blank');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-md flex items-center gap-1 shrink-0"
                  >
                    <Share2 size={13} />
                    <span>دعوت</span>
                  </button>
                </div>
              </div>
            ) : (
              // ====================================================
              // PRODUCT CARDS GRID (BANNER, PIECES, THEMES, DICE, FRAMES, VIP)
              // ====================================================
              currentItems.map(item => {
                const isOwned = isItemOwned(item);
                const isEquipped = isItemEquipped(item);

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#121624] border border-white/10 hover:border-amber-500/50 transition-all flex flex-col gap-2 relative overflow-hidden group shadow-md"
                  >
                    {/* Header Row: Visual Icon/Preview, Title, Badge & Price */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Custom Visual Representation by Type */}
                        {item.type === 'pieces' || item.type === 'pieceSkin' ? (
                          // 3D Checker Disk Preview
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.6)] border-2 ${item.borderClass || 'border-amber-400'} bg-gradient-to-br ${item.previewColor || 'from-amber-700 to-amber-950'}`}>
                            <span>{item.icon}</span>
                          </div>
                        ) : item.type === 'diceSkin' ? (
                          // 3D Die Preview
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-md ${item.diceBg || 'bg-amber-500'}`}>
                            <span>{item.icon}</span>
                          </div>
                        ) : item.type === 'frame' ? (
                          // Avatar Frame Preview
                          <div className="relative w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                            <span className="text-lg">👤</span>
                            <div className={`absolute inset-0 rounded-full ${item.previewClass}`} />
                          </div>
                        ) : (
                          // Standard Gradient / Icon
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
                            item.previewBg ? `bg-gradient-to-br ${item.previewBg}` : 'bg-white/5 border border-white/10'
                          }`}>
                            {item.icon}
                          </div>
                        )}

                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                              {item.nameFa}
                            </h4>
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-black font-mono text-amber-400">
                              {item.price === 0 ? 'رایگان (آغازین)' : `🪙 ${item.price.toLocaleString()} سکه`}
                            </span>
                            {isOwned && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                در صندوق شما
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button: BUY | EQUIP | DEACTIVATE */}
                      <button
                        onClick={() => handleItemAction(item)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shrink-0 shadow-md cursor-pointer flex items-center gap-1 ${
                          isEquipped
                            ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-emerald-500/10 hover:bg-rose-500/20 hover:border-rose-400 hover:text-rose-300'
                            : isOwned
                            ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 shadow-amber-500/20'
                        }`}
                        title={isEquipped ? 'کلیک کنید تا غیرفعال شود' : ''}
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
                    <p className="text-[10px] text-slate-300/90 leading-relaxed">
                      {item.description}
                    </p>

                    {/* 1. Large Panoramic Banner Preview with High Quality Imagery */}
                    {item.type === 'banner' && item.imageUrl && (
                      <div className="h-28 sm:h-32 w-full rounded-2xl overflow-hidden relative mt-1 border border-white/15 shadow-inner group-hover:border-amber-400/50 transition-all bg-slate-950">
                        <img 
                          src={item.imageUrl} 
                          alt={item.nameFa} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end justify-between p-2.5">
                          <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm border border-amber-400/20">
                            <Sparkles size={11} className="text-amber-400" />
                            <span>{item.tag || item.nameFa}</span>
                          </span>
                          <span className="text-[9px] font-mono font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm border border-white/10">
                            HD 1080p
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 2. Board Theme Surface Swatch Preview */}
                    {item.type === 'boardTheme' && (
                      <div className={`h-12 w-full rounded-xl mt-1 border p-2 flex items-center justify-between ${item.previewStyle || 'bg-slate-900'}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-amber-200/90 border border-amber-400 shadow-sm" />
                          <span className="w-5 h-5 rounded-full bg-amber-900 border border-amber-600 shadow-sm" />
                          <span className="text-[10px] font-black mr-2">پیش‌نمایش سطح تخته</span>
                        </div>
                        <span className="text-[10px] font-bold opacity-80">{item.nameFa}</span>
                      </div>
                    )}

                    {/* 3. 3D Dice Preview Row */}
                    {item.type === 'diceSkin' && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 mt-0.5">
                        <span className="text-[10px] text-slate-400">پیش‌نمایش تاس در بازی:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${item.diceBg} flex items-center justify-center shadow`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.pipColor}`} />
                          </div>
                          <div className={`w-7 h-7 rounded-lg ${item.diceBg} grid grid-cols-2 gap-0.5 p-1 items-center justify-items-center shadow`}>
                            <span className={`w-1 h-1 rounded-full ${item.pipColor}`} />
                            <span className={`w-1 h-1 rounded-full ${item.pipColor}`} />
                            <span className={`w-1 h-1 rounded-full ${item.pipColor}`} />
                            <span className={`w-1 h-1 rounded-full ${item.pipColor}`} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 border-t border-white/10 bg-[#101422]/90 backdrop-blur-md flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1 text-amber-400/90">
              <Sparkles size={13} className="text-amber-400" />
              <span>تمام آیتم‌ها فوراً در پروفایل و بازی‌ها فعال می‌شوند</span>
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all cursor-pointer"
            >
              بستن
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
