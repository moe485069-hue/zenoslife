import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, MessageSquare, Check, X, Trophy, Swords, ShieldCheck, 
  ChevronRight, ChevronLeft, ShoppingBag, Sparkles, Star, Flame
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
  isRtl = true,
  colorMode = 'dark'
}) {
  const [requestSent, setRequestSent] = useState(false);
  const [chatRequested, setChatRequested] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);

  const { equippedFrame, userProfile } = useAppStore();

  if (!player) return null;

  const isDark = colorMode === 'dark';
  const isBot = !!player.isBot;
  const isSelf = !!player.isSelf;

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

  const handleClose = () => {
    soundEngine.playTap?.();
    onClose?.();
  };

  // Avatar frame styling
  const frameClass = player.frame || equippedFrame || 'ring-4 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]';

  // Bio text
  const bioText = player.bio || (isSelf ? userProfile?.bio : null) || 
    (isBot 
      ? '🤖 هوش مصنوعی فوق‌پیشرفته چاژا؛ تحلیل‌گر حرفه‌ای استراتژی‌های تاس و مهره.' 
      : '✨ قهرمان بازی‌های دونفره چاژا | آماده برای مسابقات و دوئل‌های سنگین 🎲');

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

              {/* Player Bio */}
              <div className="w-full mt-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-xs leading-relaxed text-right">
                <p className="line-clamp-3 italic">{bioText}</p>
              </div>

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

              {/* Actions */}
              <div className="w-full space-y-2">
                {isBot ? (
                  <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center text-xs text-sky-300 font-medium">
                    🤖 ربات هوشمند چاژا یار همیشگی شما در تمرین و رقابت آنلاین است!
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
