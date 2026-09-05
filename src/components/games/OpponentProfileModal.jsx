import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, MessageSquare, Check, X, Trophy, Swords, ShieldCheck, 
  ChevronRight, ChevronLeft, ShoppingBag, Sparkles, Star, Flame,
  Edit3, Settings, Volume2, VolumeX, Share2, Copy, ExternalLink, Palette
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

// Default Plato-Style Preset Banners (برای سیستم درآمدزایی و بنرهای ورق‌خور)
export const PRESET_BANNERS = [
  {
    id: 'banner_persepolis',
    title: 'تخت جمشید باستان',
    bg: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #451a03 100%)',
    tag: '🏛️ هخامنشی',
    icon: '🏛️'
  },
  {
    id: 'banner_royal_gold',
    title: 'طلای سلطنتی ۲۴ عیار',
    bg: 'linear-gradient(135deg, #854d0e 0%, #facc15 50%, #713f12 100%)',
    tag: '👑 سلطنتی',
    icon: '👑'
  },
  {
    id: 'banner_cyber_neon',
    title: 'سایبرپانک ۲۰۷۷',
    bg: 'linear-gradient(135deg, #c026d3 0%, #6d28d9 50%, #06b6d4 100%)',
    tag: '⚡ سایبر',
    icon: '⚡'
  },
  {
    id: 'banner_cosmic',
    title: 'سحابی کیهانی ژرف',
    bg: 'linear-gradient(135deg, #312e81 0%, #581c87 50%, #030712 100%)',
    tag: '🌌 کیهان',
    icon: '🌌'
  },
  {
    id: 'banner_dragon',
    title: 'اژدهای شاهنامه',
    bg: 'linear-gradient(135deg, #991b1b 0%, #e11d48 50%, #0a0a0a 100%)',
    tag: '🐉 حماسی',
    icon: '🐉'
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

  // Editable Bio state for self
  const defaultSelfBio = '✨ قهرمان بازی‌های دونفره چاژا | آماده برای مسابقات و دوئل‌های سنگین 🎲';
  const [bioText, setBioText] = useState(defaultSelfBio);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Self Profile & Settings Tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings'
  const [isSoundMuted, setIsSoundMuted] = useState(() => soundEngine.isMuted || false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    if (isOpen && player) {
      const storedBio = isSelf ? (userProfile?.bio || localStorage.getItem('life_os_user_bio') || defaultSelfBio) : null;
      const initial = player.bio || storedBio || (isBot 
        ? '🤖 هوش مصنوعی فوق‌پیشرفته چاژا؛ تحلیل‌گر حرفه‌ای استراتژی‌های تاس و مهره.' 
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

  const isDark = colorMode === 'dark';

  // Active banners list (up to 5 banners)
  const banners = player.banners && player.banners.length > 0 
    ? player.banners.slice(0, 5) 
    : PRESET_BANNERS;

  const currentBanner = banners[bannerIndex % banners.length];

  const handleNextBanner = (e) => {
    e?.stopPropagation();
    soundEngine.playTap?.();
    haptics.impact?.('light');
    setBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = (e) => {
    e?.stopPropagation();
    soundEngine.playTap?.();
    haptics.impact?.('light');
    setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleSendFriend = () => {
    soundEngine.playTap?.();
    haptics.impact?.('light');
    if (isBot) {
      soundEngine.playLevelUp?.();
      return;
    }
    setRequestSent(true);
    if (onSendFriendRequest) {
      onSendFriendRequest(player);
    }
  };

  const handleChat = () => {
    soundEngine.playTap?.();
    haptics.impact?.('light');
    setChatRequested(true);
    if (onRequestChat) {
      onRequestChat(player);
    } else if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/chazha_bot?start=chat_${player.id || 'direct'}`);
    }
  };

  const handleSaveBio = () => {
    const trimmed = bioDraft.trim() || defaultSelfBio;
    setBioText(trimmed);
    if (setUserProfile) {
      setUserProfile({ bio: trimmed });
    }
    try {
      localStorage.setItem('life_os_user_bio', trimmed);
      const existing = JSON.parse(localStorage.getItem('lifeos_user_profile') || '{}');
      localStorage.setItem('lifeos_user_profile', JSON.stringify({ ...existing, bio: trimmed }));
    } catch (_) {}
    setIsEditingBio(false);
    setSaveSuccessMsg(true);
    soundEngine.playCheckmark?.();
    haptics.success?.();
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleToggleSound = () => {
    soundEngine.isMuted = !soundEngine.isMuted;
    setIsSoundMuted(soundEngine.isMuted);
    try {
      localStorage.setItem('zen_sound_muted', soundEngine.isMuted ? '1' : '0');
    } catch (_) {}
    if (!soundEngine.isMuted) soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleCopyReferral = () => {
    const refLink = `https://t.me/chazha_bot?start=ref_${player.id || myStoredId || 'friend'}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(refLink);
    }
    setCopiedReferral(true);
    soundEngine.playCheckmark?.();
    haptics.success?.();
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleClose = () => {
    soundEngine.playTap?.();
    onClose?.();
  };

  // Avatar frame styling
  const frameClass = player.frame || equippedFrame || 'ring-4 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]';

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
            initial={{ scale: 0.9, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 25 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/40 shadow-2xl bg-slate-950 text-white shadow-black/80 flex flex-col"
          >
            {/* Top Close Cross Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 left-3 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 active:scale-95 transition-all flex items-center justify-center text-white/80 hover:text-white backdrop-blur-md border border-white/20"
            >
              <X size={16} />
            </button>

            {/* 1. Plato-Style 5-Banner Carousel Header */}
            <div className="relative w-full h-36 sm:h-40 overflow-hidden select-none">
              <motion.div
                key={bannerIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full flex flex-col justify-between p-3 relative"
                style={{ 
                  background: currentBanner.bg || currentBanner.gradient || 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #451a03 100%)',
                  backgroundSize: 'cover'
                }}
              >
                {/* Banner ambient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent pointer-events-none" />

                {/* Banner Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>{currentBanner.tag || currentBanner.title}</span>
                  </span>

                  {/* Banner Counter (1/5, 2/5, ...) */}
                  <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-mono font-bold text-white/90 border border-white/15">
                    {bannerIndex + 1} / {banners.length}
                  </span>
                </div>

                {/* Banner Navigation Chevrons */}
                <div className="relative z-10 flex items-center justify-between pointer-events-auto">
                  <button
                    onClick={handlePrevBanner}
                    className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 border border-white/10"
                    title="بنر قبلی"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={handleNextBanner}
                    className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 border border-white/10"
                    title="بنر بعدی"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>

                {/* Pagination Dots */}
                <div className="relative z-10 flex items-center justify-center gap-1.5 mb-1">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBannerIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === bannerIndex ? 'w-5 bg-amber-400 shadow-sm' : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* 2. Overlapping Profile Avatar & Frame */}
            <div className="relative px-5 pb-5 -mt-12 flex flex-col items-center text-center z-20">
              <div className="relative mb-2.5">
                {/* Avatar with equipped frame */}
                <div className={`w-20 h-20 rounded-full p-0.5 bg-slate-950 flex items-center justify-center relative ${frameClass}`}>
                  <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-3xl shadow-inner border border-white/10">
                    {player.avatarImg ? (
                      <img src={player.avatarImg} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{player.avatar || (player.role === 'white' ? '⚪' : '⚫')}</span>
                    )}
                  </div>
                </div>

                {/* Checker Role Indicator Chip */}
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900 border border-amber-500/60 text-amber-300 shadow-md flex items-center gap-1">
                  <span>{player.role === 'white' ? '⚪ سفید' : '⚫ سیاه'}</span>
                </div>
              </div>

              {/* Player Name & Badges */}
              <h3 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-1.5 text-white">
                <span>{player.name || (isRtl ? 'بازیکن چاژا' : 'Chazha Player')}</span>
                {isBot ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono">
                    BOT
                  </span>
                ) : (
                  <span className="text-amber-400 text-xs" title="VIP Member">👑</span>
                )}
              </h3>

              {/* Rank & Level */}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {player.rank || (isBot ? 'هوش مصنوعی چاژا 🤖' : 'استاد تخته نرد 🎲')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono font-bold">
                  Lv.{player.level || (isBot ? 99 : 14)}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span>آنلاین</span>
                </div>
              </div>

              {/* Player Bio Section */}
              {isSelf && isEditingBio ? (
                <div className="w-full mt-2.5 p-3 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-right flex flex-col gap-2 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                    <span className="flex items-center gap-1">
                      <Edit3 size={13} />
                      <span>ویرایش بیوگرافی شخصی</span>
                    </span>
                    <span className="font-mono text-slate-400">{bioDraft.length}/140</span>
                  </div>
                  <textarea
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value.slice(0, 140))}
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400 resize-none font-medium text-right"
                    placeholder="بیوگرافی جذاب خود را اینجا بنویسید..."
                    autoFocus
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={handleSaveBio}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Check size={14} />
                      <span>ذخیره بیوگرافی</span>
                    </button>
                    <button
                      onClick={() => {
                        setBioDraft(bioText);
                        setIsEditingBio(false);
                        soundEngine.playTap?.();
                      }}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs active:scale-95 transition-all"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full mt-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-xs leading-relaxed text-right relative group">
                  <p className="line-clamp-3 italic pr-1">{bioText}</p>
                  {isSelf && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 font-medium">بیوگرافی اختصاصی شما در چاژا</span>
                      <button
                        onClick={() => {
                          setIsEditingBio(true);
                          soundEngine.playTap?.();
                        }}
                        className="py-1 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all border border-amber-500/30"
                      >
                        <Edit3 size={11} />
                        <span>ویرایش بیو</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {saveSuccessMsg && (
                <div className="w-full mt-2 py-1 px-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold text-center flex items-center justify-center gap-1 animate-pulse">
                  <Check size={13} />
                  <span>بیوگرافی با موفقیت ذخیره شد ✨</span>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 w-full my-3">
                <div className="p-2 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Trophy size={15} className="mx-auto text-amber-400 mb-0.5" />
                  <span className="block text-[9px] text-slate-400">نرخ برد</span>
                  <span className="text-xs font-mono font-bold text-amber-300">{player.winRate || '68%'}</span>
                </div>
                <div className="p-2 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Swords size={15} className="mx-auto text-sky-400 mb-0.5" />
                  <span className="block text-[9px] text-slate-400">مسابقات</span>
                  <span className="text-xs font-mono font-bold text-sky-300">{player.matchesCount || 42}</span>
                </div>
                <div className="p-2 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <ShieldCheck size={15} className="mx-auto text-emerald-400 mb-0.5" />
                  <span className="block text-[9px] text-slate-400">امتیاز مهارت</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">1,520</span>
                </div>
              </div>

              {/* Action Area & Options */}
              <div className="w-full space-y-2">
                {isBot ? (
                  <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center text-xs text-sky-300 font-medium">
                    🤖 ربات هوشمند چاژا یار همیشگی شما در تمرین و رقابت آنلاین است!
                  </div>
                ) : isSelf ? (
                  <div className="space-y-2.5 w-full">
                    {/* Self Tab Switcher: Profile Options vs Game Settings */}
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          soundEngine.playTap?.();
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          activeTab === 'profile'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        👤 گزینه‌های پروفایل
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          soundEngine.playTap?.();
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          activeTab === 'settings'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Settings size={12} />
                        <span>تنظیمات بازی</span>
                      </button>
                    </div>

                    {activeTab === 'profile' ? (
                      <div className="space-y-2">
                        {/* 1. Edit Bio Option */}
                        <button
                          onClick={() => {
                            setIsEditingBio(prev => !prev);
                            soundEngine.playTap?.();
                          }}
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 transition-all active:scale-[0.98]"
                        >
                          <span className="flex items-center gap-2">
                            <Edit3 size={15} />
                            <span>{isEditingBio ? 'بستن فرم ویرایش بیو' : '✏️ ویرایش بیوگرافی پروفایل'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">تغییر متن معرفی</span>
                        </button>

                        {/* 2. Copy Referral Invite Link (+500 Coins) */}
                        <button
                          onClick={handleCopyReferral}
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-between bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 text-emerald-300 transition-all active:scale-[0.98]"
                        >
                          <span className="flex items-center gap-2">
                            {copiedReferral ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
                            <span>{copiedReferral ? 'لینک دعوت کپی شد ✅' : '👥 دعوت دوستان (+۵۰۰ سکه هدیه)'}</span>
                          </span>
                          <span className="text-[10px] font-mono bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-200">+500 🪙</span>
                        </button>

                        {/* 3. Open Telegram Bot Profile */}
                        <button
                          onClick={() => {
                            const tg = window.Telegram?.WebApp;
                            if (tg?.openTelegramLink) {
                              tg.openTelegramLink('https://t.me/chazha_bot');
                            } else {
                              window.open('https://t.me/chazha_bot', '_blank');
                            }
                          }}
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-between bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 transition-all active:scale-[0.98]"
                        >
                          <span className="flex items-center gap-2">
                            <ExternalLink size={15} />
                            <span>🤖 پروفایل و امکانات در ربات تلگرام</span>
                          </span>
                          <span className="text-[10px] text-sky-400">@chazha_bot</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5 p-2 rounded-2xl bg-white/5 border border-white/10 text-right">
                        {/* Sound Toggle */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            {isSoundMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-emerald-400" />}
                            <span>جلوه‌های صوتی و صدای بازی</span>
                          </span>
                          <button
                            onClick={handleToggleSound}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
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
                                <span>پوسته و تم تخته نرد</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{boardTheme || 'wood'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              {[
                                { key: 'persia', label: '🏛️ تخت جمشید', bg: 'from-amber-900 to-amber-950' },
                                { key: 'wood', label: '🪵 چوب کهن', bg: 'from-amber-800 to-yellow-950' },
                                { key: 'gold', label: '👑 طلای سلطنتی', bg: 'from-yellow-700 to-amber-900' },
                                { key: 'turquoise', label: '💎 فیروزه باستان', bg: 'from-teal-800 to-cyan-950' }
                              ].map((t) => (
                                <button
                                  key={t.key}
                                  onClick={() => {
                                    onSelectTheme(t.key);
                                    soundEngine.playTap?.();
                                    haptics.tap?.();
                                  }}
                                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold bg-gradient-to-r ${t.bg} text-white border transition-all active:scale-95 ${
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
                ) : (
                  <>
                    {/* Friend Request Button */}
                    <button
                      onClick={handleSendFriend}
                      disabled={isFriend || requestSent}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
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
                          <span>در لیست دوستان شماست ✅</span>
                        </>
                      ) : requestSent ? (
                        <>
                          <Check size={16} />
                          <span>درخواست دوستی ارسال شد</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>🤝 ارسال درخواست دوستی در تلگرام</span>
                        </>
                      )}
                    </button>

                    {/* Request Chat in Telegram Bot */}
                    <button
                      onClick={handleChat}
                      disabled={chatRequested}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${
                        chatRequested
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/15'
                      }`}
                    >
                      <MessageSquare size={15} />
                      <span>{chatRequested ? 'درخواست گفت‌وگو ارسال شد ✅' : '💬 ارسال درخواست چت (در ربات تلگرام)'}</span>
                    </button>
                  </>
                )}

                {/* Open Chazha Store Button */}
                <button
                  onClick={() => {
                    soundEngine.playTap?.();
                    onOpenStore?.();
                  }}
                  className="w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 transition-all active:scale-[0.98]"
                >
                  <ShoppingBag size={15} className="text-amber-400" />
                  <span>🛍️ فروشگاه اقلام، مهره‌ها و بنرها</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
