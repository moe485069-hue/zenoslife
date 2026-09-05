import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, X, Check, Sparkles, Shield, Palette, 
  Coins, Star, Share2, Wallet, ExternalLink, Zap, ChevronRight, ChevronLeft
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export const CHAZHA_STORE_ITEMS = [
  // 1. Profile Banners (تا ۵ بنر قابل تجهیز)
  {
    id: 'banner_persepolis',
    type: 'banner',
    nameFa: 'بنر تخت جمشید باستان',
    nameEn: 'Persepolis Sunset Banner',
    category: 'banners',
    price: 350,
    icon: '🏛️',
    previewBg: 'from-amber-700 via-orange-600 to-amber-950',
    description: 'غروب با شکوه تخت جمشید باستان با نقوش هخامنشی',
    gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #451a03 100%)'
  },
  {
    id: 'banner_royal_gold',
    type: 'banner',
    nameFa: 'بنر طلای سلطنتی ۲۴ عیار',
    nameEn: 'Royal 24K Gold Banner',
    category: 'banners',
    price: 500,
    icon: '👑',
    previewBg: 'from-yellow-600 via-amber-400 to-yellow-900',
    description: 'طرح لوکس طلای خالص و ساتن مشکی پادشاهان باستان',
    gradient: 'linear-gradient(135deg, #854d0e 0%, #facc15 50%, #713f12 100%)'
  },
  {
    id: 'banner_cyber_neon',
    type: 'banner',
    nameFa: 'بنر نئون سایبرپانک ۲۰۷۷',
    nameEn: 'Cyberpunk Neon Banner',
    category: 'banners',
    price: 400,
    icon: '⚡',
    previewBg: 'from-fuchsia-600 via-purple-700 to-cyan-500',
    description: 'نورهای نئونی سایبرپانک با خطوط لیزری آینده‌نگرانه',
    gradient: 'linear-gradient(135deg, #c026d3 0%, #6d28d9 50%, #06b6d4 100%)'
  },
  {
    id: 'banner_cosmic',
    type: 'banner',
    nameFa: 'بنر سحابی کیهانی ژرف',
    nameEn: 'Deep Cosmic Nebula Banner',
    category: 'banners',
    price: 450,
    icon: '🌌',
    previewBg: 'from-indigo-900 via-purple-900 to-slate-950',
    description: 'کهکشان‌های ناشناخته و ستارگان درخشان کیهانی',
    gradient: 'linear-gradient(135deg, #312e81 0%, #581c87 50%, #030712 100%)'
  },
  {
    id: 'banner_dragon',
    type: 'banner',
    nameFa: 'بنر اژدهای شاهنامه',
    nameEn: 'Mythical Dragon Banner',
    category: 'banners',
    price: 600,
    icon: '🐉',
    previewBg: 'from-red-700 via-rose-600 to-neutral-950',
    description: 'طرح حماسی اژدهای هفت‌خوان شاهنامه با شعله‌های سرخ',
    gradient: 'linear-gradient(135deg, #991b1b 0%, #e11d48 50%, #0a0a0a 100%)'
  },

  // 2. Avatar Frames (قاب‌های دور عکس پروفایل)
  {
    id: 'frame_royal_gold',
    type: 'frame',
    nameFa: 'قاب برگ زیتون طلایی',
    nameEn: 'Royal Gold Laurel Frame',
    category: 'frames',
    price: 250,
    icon: '🏆',
    previewClass: 'ring-4 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]',
    description: 'حلقه زرین پادشاهی با درخشش نور طلایی'
  },
  {
    id: 'frame_neon_cyan',
    type: 'frame',
    nameFa: 'قاب هولوگرافیک سایان',
    nameEn: 'Cyber Cyan Glow Frame',
    category: 'frames',
    price: 200,
    icon: '💎',
    previewClass: 'ring-4 ring-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.7)]',
    description: 'هاله نوری نئونی درخشان سبک آرکیدهای مدرن'
  },
  {
    id: 'frame_persepolis_stone',
    type: 'frame',
    nameFa: 'قاب سنگی تخت جمشید',
    nameEn: 'Ancient Stone Carved Frame',
    category: 'frames',
    price: 300,
    icon: '🏛️',
    previewClass: 'ring-4 ring-stone-400 border-2 border-amber-600/70 shadow-[0_0_12px_rgba(217,119,6,0.5)]',
    description: 'حکاکی شده با سنگ‌های کاخ آپادانا و نقوش باستانی'
  },
  {
    id: 'frame_fire_flame',
    type: 'frame',
    nameFa: 'قاب شعله‌های آتشین',
    nameEn: 'Inferno Flame Frame',
    category: 'frames',
    price: 280,
    icon: '🔥',
    previewClass: 'ring-4 ring-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.7)]',
    description: 'شعله‌های پرانرژی آتشین برای بازیکنان جسور'
  },

  // 3. Game Pieces & Skins (مهره‌های منبت‌کاری و تم‌های بازی)
  {
    id: 'faravahar',
    type: 'pieceSkin',
    nameFa: 'مهره منبت‌کاری فروهر باستان 🦅',
    nameEn: 'Ancient Faravahar Carved Checkers',
    category: 'pieces',
    price: 500,
    icon: '🦅',
    description: 'مهره‌های تخته نرد با نقش برجسته نماد فروهر بالدار هخامنشی منبت‌کاری شده درون دیسک بازی!',
    previewClass: 'border-2 border-amber-400 bg-amber-950/80 text-amber-300'
  },
  {
    id: 'lion_sun',
    type: 'pieceSkin',
    nameFa: 'مهره شیر و خورشید سلطنتی 🦁',
    nameEn: 'Imperial Lion & Sun Checkers',
    category: 'pieces',
    price: 450,
    icon: '🦁',
    description: 'مهره‌های نفیس تخته نرد با نشان شیر و خورشید طلاکوب شده',
    previewClass: 'border-2 border-yellow-400 bg-yellow-950/80 text-yellow-300'
  },
  {
    id: 'crystal',
    type: 'pieceSkin',
    nameFa: 'مهره کریستال کهکشانی 🔮',
    nameEn: 'Galactic Crystal Checkers',
    category: 'pieces',
    price: 400,
    icon: '🔮',
    description: 'دیسک‌های تخته نرد از جنس بلور کوانتومی با هسته درخشان',
    previewClass: 'border-2 border-indigo-400 bg-indigo-950/80 text-indigo-300'
  },

  // 4. Chat Bubbles (حباب‌های چت)
  {
    id: 'bubble_gold',
    type: 'bubble',
    nameFa: 'حباب چت طلای شاهانه',
    nameEn: 'Royal Gold Chat Bubble',
    category: 'bubbles',
    price: 150,
    icon: '💬',
    description: 'پیام‌های شما در چت زنده بازی و سالن با کادر طلایی درخشان نمایش داده می‌شود'
  },
  {
    id: 'bubble_cyber',
    type: 'bubble',
    nameFa: 'حباب چت سایبر نئون',
    nameEn: 'Cyber Neon Chat Bubble',
    category: 'bubbles',
    price: 150,
    icon: '🗨️',
    description: 'پیام‌های چت با هاله بنفش-سایان سبک سایبرپانک'
  }
];

export default function ChazhaStoreModal({ isOpen, onClose }) {
  const { 
    coins, 
    purchasedItems = [], 
    buyStoreItem, 
    equippedFrame, 
    equippedNameColor, 
    equippedBubble,
    equippedPieceSkin = 'faravahar',
    equippedBanners = [],
    setEquippedItem,
    isRtl = true
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('pieces'); // 'pieces' | 'banners' | 'frames' | 'bubbles' | 'coins'
  const [toastMessage, setToastMessage] = useState('');

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleBuyOrEquip = (item) => {
    soundEngine.playTap?.();
    haptics.impact?.('light');

    const isOwned = purchasedItems.includes(item.id) || (item.id === 'faravahar'); // Give free starter Faravahar!

    if (isOwned) {
      setEquippedItem(item.type, item.id);
      showToast(isRtl ? `«${item.nameFa}» با موفقیت تجهیز و فعال شد! ✅` : `"${item.nameEn}" equipped successfully! ✅`);
      soundEngine.playCheckmark?.();
    } else {
      const res = buyStoreItem(item);
      if (res.success) {
        setEquippedItem(item.type, item.id);
        showToast(isRtl ? `🎉 مبارکه! «${item.nameFa}» خریداری و فوراً فعال شد.` : `Purchased & equipped! 🎉`);
        soundEngine.playLevelUp?.();
        haptics.notification?.('success');
      } else {
        showToast(res.message);
        soundEngine.playError?.();
      }
    }
  };

  const tabs = [
    { id: 'pieces', label: '🎲 مهره‌های تخته', icon: '🎲' },
    { id: 'banners', label: '🖼️ بنرهای پروفایل', icon: '🖼️' },
    { id: 'frames', label: '👑 قاب آواتار', icon: '👑' },
    { id: 'bubbles', label: '💬 حباب چت', icon: '💬' },
    { id: 'coins', label: '🪙 شارژ سکه', icon: '🪙' },
  ];

  const currentItems = CHAZHA_STORE_ITEMS.filter(i => i.category === activeTab);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-4"
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-md max-h-[85vh] rounded-3xl bg-slate-950 border border-amber-500/40 flex flex-col shadow-2xl overflow-hidden text-white"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
                <ShoppingBag size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <span>فروشگاه و آرکید چاژا</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">VIP</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-amber-400 font-black font-mono">
                    🪙 {(coins || 0).toLocaleString()} سکه
                  </span>
                  <span className="text-[10px] text-slate-400">• فعال‌سازی آنی</span>
                </div>
              </div>
            </div>

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

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-4 py-2 text-xs font-black text-center shadow-lg"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Category Tabs */}
          <div className="flex gap-1.5 px-3 py-2.5 bg-slate-900/50 border-b border-white/5 overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  soundEngine.playTap?.();
                  setActiveTab(t.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === t.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/25 scale-105'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content: Store Items Grid */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[50vh]">
            {activeTab === 'coins' ? (
              // Coin Top-Up Section (دعوت به ربات، تلگرام استارز و کریپتو)
              <div className="space-y-3">
                {/* Method 1: Referral */}
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
                      if (window.Telegram?.WebApp?.openTelegramLink) {
                        window.Telegram.WebApp.openTelegramLink('https://t.me/chazha_bot?start=ref_my');
                      } else {
                        window.open('https://t.me/chazha_bot', '_blank');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-md flex items-center gap-1"
                  >
                    <Share2 size={13} />
                    <span>دعوت</span>
                  </button>
                </div>

                {/* Method 2: Telegram Stars */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/60 to-slate-900 border border-sky-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl">
                        ⭐
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">خرید با تلگرام استارز (Stars)</h4>
                        <p className="text-[10px] text-sky-400 font-bold">شارژ آنی در حساب تلگرام</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { coins: '۱,۰۰۰ سکه', stars: '۳۵ ⭐' },
                      { coins: '۵,۰۰۰ سکه', stars: '۱۵۰ ⭐' },
                      { coins: '۱۲,۰۰۰ سکه', stars: '۳۰۰ ⭐' },
                      { coins: '۵۰,۰۰۰ سکه + VIP', stars: '۱,۰۰۰ ⭐' }
                    ].map((pkg, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          soundEngine.playTap?.();
                          if (window.Telegram?.WebApp?.openTelegramLink) {
                            window.Telegram.WebApp.openTelegramLink('https://t.me/chazha_bot');
                          } else {
                            window.open('https://t.me/chazha_bot', '_blank');
                          }
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-sky-500/20 text-center transition-all active:scale-95 group"
                      >
                        <span className="block text-xs font-black text-white group-hover:text-sky-300">{pkg.coins}</span>
                        <span className="text-[11px] text-amber-400 font-bold font-mono">{pkg.stars}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method 3: Crypto Payment */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
                      💎
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">پرداخت با رمزارز (TON / USDT)</h4>
                      <p className="text-[10px] text-indigo-300 font-bold mt-0.5">درگاه مستقیم کریپتو و کیف‌پول تون تلگرام</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playTap?.();
                      if (window.Telegram?.WebApp?.openTelegramLink) {
                        window.Telegram.WebApp.openTelegramLink('https://t.me/chazha_bot');
                      } else {
                        window.open('https://t.me/chazha_bot', '_blank');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs transition-all active:scale-95 shadow-md flex items-center gap-1"
                  >
                    <Wallet size={13} />
                    <span>پرداخت</span>
                  </button>
                </div>
              </div>
            ) : (
              currentItems.map(item => {
                const isOwned = purchasedItems.includes(item.id) || (item.id === 'faravahar');
                const isEquipped = (item.type === 'frame' && equippedFrame === item.id) ||
                                  (item.type === 'bubble' && equippedBubble === item.id) ||
                                  (item.type === 'pieceSkin' && equippedPieceSkin === item.id) ||
                                  (item.type === 'banner' && equippedBanners.includes(item.id));

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col gap-2 relative overflow-hidden group"
                  >
                    {/* Top Row: Icon, Name, Price */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Preview Icon / Visual */}
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
                          item.previewBg ? `bg-gradient-to-br ${item.previewBg}` : 'bg-white/5 border border-white/10'
                        }`}>
                          {item.icon}
                        </div>

                        <div className="truncate">
                          <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                            {item.nameFa}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold font-mono text-amber-400">
                              🪙 {item.price} سکه
                            </span>
                            {isOwned && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                در صندوق شما
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleBuyOrEquip(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shrink-0 shadow-md ${
                          isEquipped
                            ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-emerald-500/10'
                            : isOwned
                            ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 shadow-amber-500/20'
                        }`}
                      >
                        {isEquipped ? 'فعال ✓' : isOwned ? 'تجهیز' : 'خرید'}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Banner Mini Strip Preview if banner */}
                    {item.gradient && (
                      <div 
                        className="h-3 w-full rounded-md mt-0.5 border border-white/10" 
                        style={{ background: item.gradient }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="p-3 border-t border-white/10 bg-slate-900/60 text-center text-[10px] text-slate-400">
            با بازی و بردن مسابقات یا دعوت دوستان، سکه‌های خود را افزایش دهید!
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
