import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, MessageSquare, Check, X, Trophy, Swords, ShieldCheck, 
  ChevronRight, ChevronLeft, ShoppingBag, Sparkles, Star, Flame,
  Edit3, Settings, Volume2, VolumeX, Share2, Copy, ExternalLink, Palette,
  Award, Zap, CheckCircle2, Shield
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { shareToTelegram } from '../../utils/telegram';

// Premium Curated Banners
export const PRESET_BANNERS = [
  {
    id: 'banner_casino',
    title: 'میز بازی‌های شاهانه',
    imageUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
    tag: '👑 شاهانه',
    icon: '👑'
  },
  {
    id: 'banner_persepolis',
    title: 'تخت جمشید باستان',
    imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=1200&q=80',
    tag: '🏛️ هخامنشی',
    icon: '🏛️'
  },
  {
    id: 'banner_royal_gold',
    title: 'طلای سلطنتی ۲۴ عیار',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    tag: '✨ طلا ۲۴',
    icon: '✨'
  },
  {
    id: 'banner_cyber_neon',
    title: 'سایبرپانک نئونی',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    tag: '⚡ سایبر',
    icon: '⚡'
  },
  {
    id: 'banner_cosmic',
    title: 'سحابی کیهانی ژرف',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    tag: '🌌 کیهان',
    icon: '🌌'
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

  const { equippedFrame, userProfile, setUserProfile } = useAppStore();

  const myStoredId = typeof window !== 'undefined' ? (localStorage.getItem('life_os_user_id') || '') : '';
  const isBot = !!player?.isBot;
  const isSelf = !!player?.isSelf || player?.id === 'self' || (player?.id && player.id === myStoredId);

  const defaultSelfBio = '✨ فرمانروایی بر ذهن، عادات و سرنوشت فردی 🌌 ساخت اکوسیستم اختصاصی توسعه فردی و تمرکز.';
  const [bioText, setBioText] = useState(defaultSelfBio);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Tab switch between profile & game settings
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings'
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

  const banners = player.banners && player.banners.length > 0 
    ? player.banners.slice(0, 5) 
    : PRESET_BANNERS;

  const currentBanner = banners[bannerIndex % banners.length];

  const handleNextBanner = (e) => {
    e?.stopPropagation();
    setBannerIndex((prev) => (prev + 1) % banners.length);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handlePrevBanner = (e) => {
    e?.stopPropagation();
    setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
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
    soundEngine.playLevelUp?.();
    haptics.notification?.('success');
  };

  const handleChat = () => {
    if (onRequestChat) onRequestChat(player);
    setChatRequested(true);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleClose = () => {
    soundEngine.playTap?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[65] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto"
          dir={isRtl ? 'rtl' : 'ltr'}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            data-dark-surface="true"
            className="dark relative w-full max-w-sm overflow-hidden rounded-[28px] border border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] bg-[#0c0f17] text-white flex flex-col select-none"
            style={{
              backgroundColor: '#0c0f17',
              color: '#ffffff'
            }}
          >
            {/* Top Close Button (Clean Circular Glass) */}
            <button
              onClick={handleClose}
              className="absolute top-3 left-3 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 active:scale-95 transition-all flex items-center justify-center text-white/90 hover:text-white backdrop-blur-md border border-white/20 cursor-pointer shadow-lg"
              title="بستن"
            >
              <X size={16} />
            </button>

            {/* 1. Panoramic Cinematic Banner Header */}
            <div className="relative w-full h-36 sm:h-40 overflow-hidden">
              <motion.div
                key={bannerIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full relative"
              >
                {/* Banner Photo */}
                <img 
                  src={currentBanner.imageUrl} 
                  alt={currentBanner.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Smooth Vignette Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-black/30 to-black/50 pointer-events-none" />

                {/* Banner Title Badge */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/30">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>{currentBanner.tag}</span>
                </div>

                {/* Banner Prev / Next Arrows */}
                <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
                  <button
                    onClick={handlePrevBanner}
                    className="pointer-events-auto w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-sm flex items-center justify-center transition-all active:scale-90 border border-white/15 cursor-pointer shadow-md"
                    title="بنر قبلی"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={handleNextBanner}
                    className="pointer-events-auto w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-sm flex items-center justify-center transition-all active:scale-90 border border-white/15 cursor-pointer shadow-md"
                    title="بنر بعدی"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>

                {/* Indicator Dots */}
                <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
                  {banners.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === bannerIndex ? 'w-5 bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* 2. Main Profile Card Body */}
            <div className="relative px-5 pb-5 -mt-12 flex flex-col items-center text-center z-20">
              
              {/* Profile Avatar Halo */}
              <div className="relative mb-2">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center text-2xl font-black text-amber-300 border-2 border-slate-900">
                    {player.avatarImg ? (
                      <img src={player.avatarImg} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{player.avatar || '👑'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Name and VIP Crown */}
              <h3 className="text-base sm:text-lg font-black tracking-wide flex items-center justify-center gap-1.5 text-white">
                <span>{player.name || (isRtl ? 'کاربر چاژا' : 'Chazha Player')}</span>
                <span className="text-amber-400 text-sm">👑</span>
              </h3>

              {/* Level, Role & Status Bar */}
              <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {player.rank || (isBot ? 'هوش مصنوعی چاژا 🤖' : 'استاد چاژا 👑')}
                </span>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-slate-200 border border-white/10">
                  Lv.{player.level || (isBot ? 99 : 14)}
                </span>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  <span>آنلاین</span>
                </div>
              </div>

              {/* 3. Bio Section (Uncluttered, Sleek & Inline Editable) */}
              <div className="w-full mt-3">
                {isSelf && isEditingBio ? (
                  <div className="w-full p-3 rounded-2xl bg-[#141a29] border border-amber-400/50 shadow-lg text-right flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                      <span className="flex items-center gap-1">
                        <Edit3 size={13} />
                        <span>ویرایش متن معرفی</span>
                      </span>
                      <span className="font-mono text-slate-400">{bioDraft.length}/140</span>
                    </div>

                    <textarea
                      value={bioDraft}
                      onChange={(e) => setBioDraft(e.target.value.slice(0, 140))}
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400 resize-none text-right font-medium"
                      placeholder="متن معرفی جذاب خود را بنویسید..."
                      autoFocus
                    />

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={handleSaveBio}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        <Check size={14} />
                        <span>ذخیره بیو</span>
                      </button>
                      <button
                        onClick={() => {
                          setBioDraft(bioText);
                          setIsEditingBio(false);
                          soundEngine.playTap?.();
                        }}
                        className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full p-3 rounded-2xl bg-[#121622] border border-white/10 shadow-sm text-right relative group">
                    <p className="text-xs text-slate-200 leading-relaxed font-normal italic">
                      "{bioText}"
                    </p>
                    {isSelf && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-slate-400">معرفی اختصاصی شما در چاژا</span>
                        <button
                          onClick={() => {
                            setIsEditingBio(true);
                            soundEngine.playTap?.();
                          }}
                          className="py-1 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all border border-amber-500/30 cursor-pointer"
                        >
                          <Edit3 size={11} />
                          <span>ویرایش بیو</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {saveSuccessMsg && (
                  <div className="w-full mt-2 py-1 px-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold text-center flex items-center justify-center gap-1">
                    <Check size={13} />
                    <span>بیوگرافی با موفقیت ذخیره شد ✨</span>
                  </div>
                )}
              </div>

              {/* 4. Luxury Dark Glass Stats Grid */}
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

              {/* 5. Clean Tab Switcher (Self Only) */}
              {isSelf && (
                <div className="w-full space-y-2.5">
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#121622] border border-white/10">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        soundEngine.playTap?.();
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        activeTab === 'profile'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      👤 گزینه‌های پروفایل
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        soundEngine.playTap?.();
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'settings'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Settings size={13} />
                      <span>تنظیمات بازی</span>
                    </button>
                  </div>

                  {activeTab === 'profile' ? (
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
                  ) : (
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
                              { key: 'gold', label: '👑 طلای لوکس', bg: 'from-yellow-700 to-amber-900' },
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
