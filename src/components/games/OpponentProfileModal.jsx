import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, MessageSquare, Check, X, Trophy, Swords, ShieldCheck, 
  ChevronRight, ChevronLeft, ShoppingBag, Sparkles, Star, Flame,
  Edit3, Settings, Volume2, VolumeX, Share2, Copy, ExternalLink, Palette,
  Award, Zap, CheckCircle2, Shield, Crown, Dices, Layers, RefreshCw
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { shareToTelegram } from '../../utils/telegram';
import ChazhaStoreModal, { CHAZHA_STORE_ITEMS } from './ChazhaStoreModal';

// Fallback Default Banners
export const PRESET_BANNERS = [
  {
    id: 'banner_persepolis',
    title: 'تخت جمشید باستان',
    nameFa: 'تخت جمشید باستان',
    imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=1200&q=80',
    tag: '🏛️ هخامنشی',
    icon: '🏛️'
  },
  {
    id: 'banner_royal_gold',
    title: 'طلای سلطنتی ۲۴ عیار',
    nameFa: 'طلای سلطنتی ۲۴ عیار',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    tag: '👑 سلطنتی',
    icon: '👑'
  },
  {
    id: 'banner_cyber_neon',
    title: 'سایبرپانک نئونی',
    nameFa: 'سایبرپانک نئونی',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    tag: '⚡ سایبر',
    icon: '⚡'
  },
  {
    id: 'banner_cosmic',
    title: 'سحابی کیهانی ژرف',
    nameFa: 'سحابی کیهانی ژرف',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    tag: '🌌 کیهان',
    icon: '🌌'
  },
  {
    id: 'banner_casino',
    title: 'میز بازی‌های شاهانه',
    nameFa: 'میز بازی‌های شاهانه',
    imageUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
    tag: '🃏 شاهانه',
    icon: '🃏'
  }
];

export default function OpponentProfileModal({
  isOpen,
  onClose,
  player,
  isFriend = false,
  onSendFriendRequest,
  onRequestChat,
  onOpenStore,
  boardTheme,
  onSelectTheme,
  isRtl = true,
  colorMode = 'dark'
}) {
  const [requestSent, setRequestSent] = useState(false);
  const [chatRequested, setChatRequested] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  const { 
    equippedFrame, 
    equippedPieceSkin = 'faravahar',
    equippedBoardTheme = 'wood',
    equippedDiceSkin = 'default',
    equippedTitle = 'none',
    equippedBanners = [],
    purchasedItems = [],
    coins,
    isVip,
    setEquippedItem,
    unequipItem,
    userProfile, 
    setUserProfile 
  } = useAppStore();

  const myStoredId = typeof window !== 'undefined' ? (localStorage.getItem('life_os_user_id') || '') : '';
  const isBot = !!player?.isBot;
  const isSelf = !!player?.isSelf || player?.id === 'self' || (player?.id && player.id === myStoredId);

  // Bio state
  const defaultSelfBio = '🎮 بازیکن اهل رقابت و دوستی در دنیای چاژا؛ عاشق تخته نرد، اسنوکر و چالش‌های ذهنی!';
  const [bioText, setBioText] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Tab switch: 'profile' | 'inventory' | 'settings'
  const [activeTab, setActiveTab] = useState('profile');
  const [isSoundMuted, setIsSoundMuted] = useState(() => soundEngine.isMuted || false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    if (isOpen && player) {
      const storedBio = isSelf ? (userProfile?.bio || localStorage.getItem('life_os_user_bio') || defaultSelfBio) : null;
      const initial = player.bio || storedBio || (isBot 
        ? '🤖 هوش مصنوعی فوق‌پیشرفته چاژا؛ تحلیل‌گر حرفه‌ای استراتژی‌های بازی‌های تخته نرد، اسنوکر و حکم.' 
        : defaultSelfBio);
      setBioText(initial);
      setBioDraft(initial);
      setIsEditingBio(false);
      setSaveSuccessMsg(false);
      setActiveTab('profile');
      setIsSoundMuted(soundEngine.isMuted || false);
    }
  }, [isOpen, player, isSelf, isBot, userProfile?.bio]);

  if (!player) return null;

  // Build active banners carousel
  let activeBannersList = PRESET_BANNERS;
  if (isSelf && equippedBanners && equippedBanners.length > 0) {
    const matched = equippedBanners
      .map(bId => CHAZHA_STORE_ITEMS.find(item => item.id === bId && item.type === 'banner'))
      .filter(Boolean);
    if (matched.length > 0) {
      activeBannersList = matched;
    }
  } else if (player.banners && player.banners.length > 0) {
    activeBannersList = player.banners.slice(0, 5);
  }

  const currentBanner = activeBannersList[bannerIndex % activeBannersList.length];

  const handleNextBanner = (e) => {
    e?.stopPropagation();
    setBannerIndex((prev) => (prev + 1) % activeBannersList.length);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handlePrevBanner = (e) => {
    e?.stopPropagation();
    setBannerIndex((prev) => (prev - 1 + activeBannersList.length) % activeBannersList.length);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleSaveBio = () => {
    const trimmed = bioDraft.trim();
    if (!trimmed) return;
    setBioText(trimmed);
    setIsEditingBio(false);
    localStorage.setItem('life_os_user_bio', trimmed);
    if (setUserProfile) {
      setUserProfile({ bio: trimmed });
    }
    setSaveSuccessMsg(true);
    soundEngine.playCheckmark?.();
    haptics.notification?.('success');
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const handleToggleSound = () => {
    soundEngine.isMuted = !soundEngine.isMuted;
    setIsSoundMuted(soundEngine.isMuted);
    if (!soundEngine.isMuted) {
      soundEngine.playTap?.();
    }
    haptics.tap?.();
  };

  const handleCopyReferral = () => {
    const link = `https://t.me/chazha_bot?start=ref_${myStoredId || 'player'}`;
    const shareText = `🔥 بیا تو چاژا با هم تخته نرد، اسنوکر و حکم بزنیم! ۵۰۰ سکه رایگان هم جایزه بگیر:\n${link}`;
    shareToTelegram(shareText);
    navigator.clipboard?.writeText?.(shareText);
    setCopiedReferral(true);
    soundEngine.playCheckmark?.();
    haptics.notification?.('success');
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleSendFriend = () => {
    if (onSendFriendRequest) onSendFriendRequest(player);
    setRequestSent(true);
    soundEngine.playCheckmark?.();
    haptics.notification?.('success');
  };

  const handleChat = () => {
    if (onRequestChat) onRequestChat(player);
    setChatRequested(true);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleOpenStoreModal = () => {
    soundEngine.playTap?.();
    if (onOpenStore) {
      onOpenStore();
    } else {
      setIsStoreOpen(true);
    }
  };

  // Find active item names for display in inventory
  const activePieceItem = CHAZHA_STORE_ITEMS.find(i => i.id === equippedPieceSkin);
  const activeThemeItem = CHAZHA_STORE_ITEMS.find(i => i.id === equippedBoardTheme);
  const activeDiceItem = CHAZHA_STORE_ITEMS.find(i => i.id === equippedDiceSkin);
  const activeFrameItem = CHAZHA_STORE_ITEMS.find(i => i.id === equippedFrame);

  // Frame styling lookup
  let frameEffectClass = '';
  if (isSelf && activeFrameItem && activeFrameItem.previewClass) {
    frameEffectClass = activeFrameItem.previewClass;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-dark-surface="true"
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-4 text-white dark select-none"
          dir={isRtl ? 'rtl' : 'ltr'}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md max-h-[92vh] rounded-3xl bg-[#0c0f17] border border-amber-500/40 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden text-white"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => {
                soundEngine.playTap?.();
                onClose();
              }}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/20 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg"
            >
              <X size={16} />
            </button>

            {/* 1. Panoramic Carousel Banner Area */}
            <div className="relative w-full h-36 sm:h-40 bg-slate-950 overflow-hidden shrink-0 border-b border-white/10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentBanner?.imageUrl || currentBanner?.id || 'banner'}
                  src={currentBanner?.imageUrl}
                  alt={currentBanner?.title || 'Profile Banner'}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* High Contrast Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-black/40 to-transparent pointer-events-none" />

              {/* Banner Carousel Arrows */}
              {activeBannersList.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-auto z-10">
                  <button
                    onClick={handlePrevBanner}
                    className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-md backdrop-blur-md"
                  >
                    <ChevronRight size={15} />
                  </button>
                  <button
                    onClick={handleNextBanner}
                    className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-md backdrop-blur-md"
                  >
                    <ChevronLeft size={15} />
                  </button>
                </div>
              )}

              {/* Banner Tag Badge & Dot Indicators */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                <span className="text-[10px] font-bold text-amber-300 bg-black/70 px-2 py-0.5 rounded-lg border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>{currentBanner?.tag || currentBanner?.nameFa || 'بنر ویژه'}</span>
                </span>
              </div>

              {/* Dots */}
              {activeBannersList.length > 1 && (
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10">
                  {activeBannersList.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === bannerIndex % activeBannersList.length
                          ? 'w-5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 2. Avatar & Gamer Header */}
            <div className="relative px-4 pb-4 -mt-11 z-20 flex flex-col items-center text-center overflow-y-auto max-h-[70vh]">
              {/* Avatar Frame with Dynamic Custom Halo */}
              <div className="relative mb-2">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-0.5 ${
                  frameEffectClass || 'shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                }`}>
                  <div className="w-full h-full rounded-full bg-[#0c0f17] flex items-center justify-center text-3xl font-black text-amber-300 overflow-hidden shadow-inner">
                    {player.avatar || '👑'}
                  </div>
                </div>

                {/* Online Glowing Dot */}
                <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#0c0f17] flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                </div>
              </div>

              {/* Player Name & Title */}
              <h2 className="text-base font-black text-white flex items-center justify-center gap-1.5 flex-wrap">
                <span>{player.name || 'قهرمان چاژا'}</span>
                {isSelf && isVip && (
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold flex items-center gap-0.5">
                    <Crown size={10} className="text-amber-400" />
                    <span>VIP</span>
                  </span>
                )}
                {isSelf && equippedTitle !== 'none' && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 text-[9px] font-bold">
                    {equippedTitle === 'title_shah' ? '👑 شاه چاژا' : equippedTitle === 'title_champion' ? '🏆 قهرمان مسابقات' : '♟️ گرندمستر'}
                  </span>
                )}
              </h2>

              {/* Badges Bar: Rank & Status */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-[11px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <span>{player.rank || '👑 استاد چاژا'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  Lv.{player.level || 14}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  🟢 آنلاین
                </span>
              </div>

              {/* 3. Sleek Bio Card */}
              <div className="w-full mt-3 p-3 rounded-2xl bg-[#121622] border border-white/10 text-right relative shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400">معرفی بازیکن</span>
                  {isSelf && !isEditingBio && (
                    <button
                      onClick={() => {
                        setIsEditingBio(true);
                        setBioDraft(bioText);
                        soundEngine.playTap?.();
                      }}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 size={11} />
                      <span>ویرایش بیو</span>
                    </button>
                  )}
                </div>

                {isEditingBio ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      value={bioDraft}
                      onChange={(e) => setBioDraft(e.target.value)}
                      maxLength={120}
                      rows={2}
                      className="w-full p-2 rounded-xl bg-black/60 border border-amber-500/50 text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none text-right placeholder-slate-500"
                      placeholder="درباره سبک بازی و علایقتان بنویسید..."
                    />
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">{bioDraft.length}/120</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setIsEditingBio(false)}
                          className="px-2 py-1 rounded-lg bg-white/10 text-slate-300 hover:text-white cursor-pointer font-bold"
                        >
                          انصراف
                        </button>
                        <button
                          onClick={handleSaveBio}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black cursor-pointer shadow-md"
                        >
                          ذخیره ✓
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {bioText}
                  </p>
                )}

                {saveSuccessMsg && (
                  <span className="block mt-1 text-[10px] font-bold text-emerald-400">
                    بیوگرافی با موفقیت ذخیره شد ✓
                  </span>
                )}
              </div>

              {/* 4. Luxury Dark Stats Grid */}
              <div className="grid grid-cols-3 gap-2 w-full my-3">
                <div className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 text-center shadow-inner">
                  <Trophy size={16} className="mx-auto text-amber-400 mb-0.5" />
                  <span className="block text-[9px] text-slate-400 font-bold">نرخ برد</span>
                  <span className="text-xs font-mono font-black text-amber-300">{player.winRate || '75%'}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 text-center shadow-inner">
                  <Swords size={16} className="mx-auto text-sky-400 mb-0.5" />
                  <span className="block text-[9px] text-slate-400 font-bold">مسابقات</span>
                  <span className="text-xs font-mono font-black text-sky-300">{player.matchesCount || 58}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 text-center shadow-inner">
                  <ShieldCheck size={16} className="mx-auto text-emerald-400 mb-0.5" />
                  <span className="block text-[9px] text-slate-400 font-bold">امتیاز مهارت</span>
                  <span className="text-xs font-mono font-black text-emerald-300">1,520</span>
                </div>
              </div>

              {/* 5. Direct Luxury Store & Inventory Bar (Self Only) */}
              {isSelf && (
                <button
                  onClick={handleOpenStoreModal}
                  className="w-full py-2.5 px-3 rounded-2xl mb-3 font-black text-xs flex items-center justify-between bg-gradient-to-r from-amber-600/30 via-yellow-600/30 to-amber-500/30 hover:from-amber-600/40 hover:to-amber-500/40 border border-amber-400/50 text-amber-300 transition-all active:scale-[0.98] cursor-pointer shadow-lg group"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/30 text-amber-300 flex items-center justify-center text-sm shadow-inner">
                      🛍️
                    </div>
                    <span>فروشگاه و آرکید VIP (خرید و فعال‌سازی آیتم‌ها)</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/40 px-2 py-0.5 rounded-full text-amber-200">
                    🪙 {(coins || 0).toLocaleString()}
                  </span>
                </button>
              )}

              {/* 6. Clean Tab Switcher (Self Only) */}
              {isSelf && (
                <div className="w-full space-y-2.5">
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#121622] border border-white/10">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        soundEngine.playTap?.();
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        activeTab === 'profile'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      👤 پروفایل
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('inventory');
                        soundEngine.playTap?.();
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'inventory'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Layers size={13} />
                      <span>کمد آیتم‌ها</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        soundEngine.playTap?.();
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'settings'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Settings size={13} />
                      <span>تنظیمات</span>
                    </button>
                  </div>

                  {/* TAB 1: Profile Action Links */}
                  {activeTab === 'profile' && (
                    <div className="space-y-2">
                      {/* Invite Friends (+500 Coins) */}
                      <button
                        onClick={handleCopyReferral}
                        className="w-full py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-between bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-400/40 text-emerald-300 transition-all active:scale-[0.98] cursor-pointer shadow-md"
                      >
                        <span className="flex items-center gap-2">
                          {copiedReferral ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                          <span>{copiedReferral ? 'لینک دعوت کپی شد ✓' : 'دعوت دوستان (+۵۰۰ سکه هدیه)'}</span>
                        </span>
                        <span className="text-[10px] font-mono font-black bg-emerald-500/40 px-2 py-0.5 rounded-full text-emerald-200">+500 🪙</span>
                      </button>

                      {/* Open Telegram Bot Profile */}
                      <button
                        onClick={() => {
                          const tg = window.Telegram?.WebApp;
                          if (tg?.openTelegramLink) {
                            tg.openTelegramLink('https://t.me/chazha_bot');
                          } else {
                            window.open('https://t.me/chazha_bot', '_blank');
                          }
                        }}
                        className="w-full py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-between bg-sky-600/25 hover:bg-sky-600/35 border border-sky-400/40 text-sky-200 transition-all active:scale-[0.98] cursor-pointer shadow-md"
                      >
                        <span className="flex items-center gap-2">
                          <ExternalLink size={15} />
                          <span>پروفایل و امکانات در ربات تلگرام</span>
                        </span>
                        <span className="text-[10px] font-mono text-sky-300">@chazha_bot</span>
                      </button>
                    </div>
                  )}

                  {/* TAB 2: Inventory & Active Equipment (مدیریت کمد و فعال/غیرفعال‌سازی) */}
                  {activeTab === 'inventory' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-[#121622] border border-white/10 text-right">
                      {/* Active Checkers Piece */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base border ${activePieceItem?.borderClass || 'border-amber-400'} bg-gradient-to-br ${activePieceItem?.previewColor || 'from-amber-700 to-amber-950'}`}>
                            {activePieceItem?.icon || '🦅'}
                          </div>
                          <div>
                            <span className="block text-[11px] font-black text-white">
                              مهره: {activePieceItem?.nameFa || 'منبت فروهر'}
                            </span>
                            <span className="text-[9px] text-amber-300">فعال در تخته نرد</span>
                          </div>
                        </div>
                        <button
                          onClick={handleOpenStoreModal}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                        >
                          تغییر / انتخاب
                        </button>
                      </div>

                      {/* Active Board Theme */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-800 to-stone-900 border border-amber-500/40 flex items-center justify-center text-sm">
                            {activeThemeItem?.icon || '🪵'}
                          </div>
                          <div>
                            <span className="block text-[11px] font-black text-white">
                              تم زمین: {activeThemeItem?.nameFa || 'چوب گردو'}
                            </span>
                            <span className="text-[9px] text-slate-400">طرح تخته و مسابقات</span>
                          </div>
                        </div>
                        <button
                          onClick={handleOpenStoreModal}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                        >
                          تغییر تم
                        </button>
                      </div>

                      {/* Active 3D Dice */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-base">
                            {activeDiceItem?.icon || '🎲'}
                          </div>
                          <div>
                            <span className="block text-[11px] font-black text-white">
                              تاس: {activeDiceItem?.nameFa || 'تاس استاندارد چاژا'}
                            </span>
                            <span className="text-[9px] text-slate-400">انیمیشن پرتاب ۳D</span>
                          </div>
                        </div>
                        <button
                          onClick={handleOpenStoreModal}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                        >
                          تغییر تاس
                        </button>
                      </div>

                      {/* Active Avatar Frame */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-sm">
                            {activeFrameItem?.icon || '👤'}
                          </div>
                          <div>
                            <span className="block text-[11px] font-black text-white">
                              قاب آواتار: {activeFrameItem?.nameFa || 'پیش‌فرض'}
                            </span>
                            <span className="text-[9px] text-slate-400">هاله دور عکس پروفایل</span>
                          </div>
                        </div>
                        {equippedFrame && equippedFrame !== 'none' ? (
                          <button
                            onClick={() => {
                              unequipItem?.('frame');
                              soundEngine.playCheckmark?.();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold hover:bg-rose-500/30 transition-all cursor-pointer"
                          >
                            برداشتن قاب ✕
                          </button>
                        ) : (
                          <button
                            onClick={handleOpenStoreModal}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                          >
                            انتخاب قاب
                          </button>
                        )}
                      </div>

                      {/* Open Store Full Catalog Button */}
                      <button
                        onClick={handleOpenStoreModal}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                      >
                        <Sparkles size={13} />
                        <span>➕ مدیریت کامل و خرید آیتم‌های بیشتر در فروشگاه</span>
                      </button>
                    </div>
                  )}

                  {/* TAB 3: Game Settings */}
                  {activeTab === 'settings' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-[#121622] border border-white/10 text-right">
                      {/* Sound Toggle */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          {isSoundMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-emerald-400" />}
                          <span>جلوه‌های صوتی بازی</span>
                        </span>
                        <button
                          onClick={handleToggleSound}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                            isSoundMuted
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isSoundMuted ? 'بی‌صدا 🔇' : 'فعال 🔊'}
                        </button>
                      </div>

                      {/* Board Theme Picker if provided */}
                      {onSelectTheme && (
                        <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                            <span className="flex items-center gap-1">
                              <Palette size={13} />
                              <span>طرح و تم تخته نرد</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{boardTheme || 'wood'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {[
                              { key: 'persia', label: '🏛️ هخامنشی', bg: 'from-amber-900 to-amber-950' },
                              { key: 'wood', label: '🪵 گردو اصیل', bg: 'from-amber-800 to-yellow-950' },
                              { key: 'luxury_gold', label: '👑 طلای ۲۴ عیار', bg: 'from-yellow-700 to-amber-900' },
                              { key: 'cosmic', label: '🌌 کیهانی', bg: 'from-purple-900 to-indigo-950' }
                            ].map((t) => (
                              <button
                                key={t.key}
                                onClick={() => {
                                  onSelectTheme(t.key);
                                  soundEngine.playTap?.();
                                  haptics.tap?.();
                                }}
                                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold bg-gradient-to-r ${t.bg} text-white border transition-all active:scale-95 cursor-pointer ${
                                  boardTheme === t.key
                                    ? 'border-amber-400 ring-2 ring-amber-400 shadow-md scale-[1.02]'
                                    : 'border-white/10 opacity-70 hover:opacity-100'
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bot / Other Opponent Action Area */}
              {!isSelf && (
                <div className="w-full space-y-2 mt-2">
                  {isBot ? (
                    <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center text-xs text-sky-300 font-medium">
                      🤖 حریف تمرینی هوشمند و همیشه آماده چاژا!
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleSendFriend}
                        disabled={isFriend || requestSent}
                        className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer ${
                          isFriend
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : requestSent
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-sky-500/25'
                        }`}
                      >
                        {isFriend ? (
                          <>
                            <Check size={16} />
                            <span>در لیست دوستان شماست ✓</span>
                          </>
                        ) : requestSent ? (
                          <>
                            <Check size={16} />
                            <span>درخواست دوستی ارسال شد ✓</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} />
                            <span>🤝 ارسال درخواست دوستی</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleChat}
                        disabled={chatRequested}
                        className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-[0.98] cursor-pointer ${
                          chatRequested
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/15'
                        }`}
                      >
                        <MessageSquare size={16} />
                        <span>{chatRequested ? 'درخواست گفتگو ارسال شد' : '💬 ارسال پیام خصوصی'}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Nested Full Store Modal if triggered from inside Profile */}
          <ChazhaStoreModal
            isOpen={isStoreOpen}
            onClose={() => setIsStoreOpen(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
