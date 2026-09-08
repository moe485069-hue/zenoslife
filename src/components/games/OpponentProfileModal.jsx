import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, MessageSquare, Check, X, Trophy, Swords, ShieldCheck, 
  ShoppingBag, Sparkles, Star, Flame, Edit3, Settings, Volume2, VolumeX, 
  Share2, ExternalLink, Palette, Award, Zap, CheckCircle2, Shield, Crown, 
  Dices, Layers, Wallet, Coins
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import { shareToTelegram } from '../../utils/telegram';
import { CHAZHA_STORE_ITEMS } from './ChazhaStoreModal';

export const PRESET_BANNERS = [
  {
    id: 'banner_persepolis',
    nameFa: 'تخت جمشید و آپادانای زرین',
    title: 'تخت جمشید و آپادانای زرین',
    imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=1200&q=80',
    tag: '🏛️ هخامنشی',
    icon: '🏛️'
  },
  {
    id: 'banner_royal_gold',
    nameFa: 'طلای سلطنتی ۲۴ عیار و مخمل',
    title: 'طلای سلطنتی ۲۴ عیار و مخمل',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    tag: '👑 سلطنتی',
    icon: '👑'
  },
  {
    id: 'banner_cyber_neon',
    nameFa: 'نئون سایبرپانک ۲۰۷۷',
    title: 'نئون سایبرپانک ۲۰۷۷',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    tag: '⚡ سایبرپانک',
    icon: '⚡'
  },
  {
    id: 'banner_cosmic',
    nameFa: 'سحابی و کهکشان کیهانی',
    title: 'سحابی و کهکشان کیهانی',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    tag: '🌌 کیهان',
    icon: '🌌'
  },
  {
    id: 'banner_casino',
    nameFa: 'کازینو رویال و ژتون‌های طلا',
    title: 'کازینو رویال و ژتون‌های طلا',
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
  isRtl = true
}) {
  const [requestSent, setRequestSent] = useState(false);
  const [chatRequested, setChatRequested] = useState(false);

  const { 
    equippedFrame, 
    equippedPieceSkin = 'faravahar',
    equippedBoardTheme = 'wood',
    equippedDiceSkin = 'default',
    equippedTitle = 'none',
    equippedBanner = 'banner_persepolis',
    purchasedItems = [],
    coins,
    isVip,
    activateVip,
    buyStoreItem,
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

  // Bottom Tabs: 'profile' | 'inventory' | 'store' | 'settings'
  const [activeTab, setActiveTab] = useState('profile');
  const [storeSubTab, setStoreSubTab] = useState('banners'); // 'banners' | 'pieces' | 'themes' | 'dice' | 'frames' | 'coins'
  const [storeToast, setStoreToast] = useState('');
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

  const showToast = (msg) => {
    setStoreToast(msg);
    setTimeout(() => setStoreToast(''), 3000);
  };

  // Determine the single active banner
  const activeBannerId = isSelf ? (equippedBanner || 'banner_persepolis') : (player.bannerId || 'banner_persepolis');
  const currentBanner = CHAZHA_STORE_ITEMS.find(item => item.id === activeBannerId && item.type === 'banner') || {
    id: 'banner_persepolis',
    nameFa: 'تخت جمشید و آپادانای زرین',
    imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=1200&q=80',
    tag: '🏛️ هخامنشی'
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

  // Check if item is active/equipped
  const isItemEquipped = (item) => {
    if (item.type === 'frame') return equippedFrame === item.id;
    if (item.type === 'pieceSkin') return equippedPieceSkin === item.id;
    if (item.type === 'boardTheme') return equippedBoardTheme === item.id;
    if (item.type === 'diceSkin') return equippedDiceSkin === item.id;
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

  // Toggle Item in Integrated Store
  const handleStoreItemAction = (item) => {
    soundEngine.playTap?.();
    haptics.impact?.('light');

    const owned = isItemOwned(item);
    const equipped = isItemEquipped(item);

    // 1. Deactivate
    if (equipped) {
      if (unequipItem) {
        unequipItem(item.type, item.id);
      }
      showToast(`«${item.nameFa}» غیرفعال شد.`);
      soundEngine.playCheckmark?.();
      return;
    }

    // 2. Equip
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
      showToast(`«${item.nameFa}» فعال شد! ✅`);
      soundEngine.playCheckmark?.();
      return;
    }

    // 3. Buy
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
      showToast(`🎉 «${item.nameFa}» خریداری و فعال شد.`);
      soundEngine.playLevelUp?.();
      haptics.notification?.('success');
    } else {
      showToast(res.message || 'سکه کافی نیست! از بخش شارژ سکه موجودی خود را افزایش دهید.');
      soundEngine.playError?.();
    }
  };

  // Active items for display
  const activePieceItem = CHAZHA_STORE_ITEMS.find(i => i.id === equippedPieceSkin);
  const activeThemeItem = CHAZHA_STORE_ITEMS.find(i => i.id === equippedBoardTheme);
  const activeDiceItem = CHAZHA_STORE_ITEMS.find(i => i.id === equippedDiceSkin);
  const activeFrameItem = CHAZHA_STORE_ITEMS.find(i => i.id === equippedFrame);

  let frameEffectClass = '';
  if (isSelf && activeFrameItem && activeFrameItem.previewClass) {
    frameEffectClass = activeFrameItem.previewClass;
  }

  // Safe Avatar Renderer (Prevents raw URLs from showing as text)
  const renderAvatarContent = () => {
    const raw = player?.avatarImg || userProfile?.avatar || player?.avatar;
    if (typeof raw === 'string' && (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('blob:') || raw.includes('/'))) {
      return (
        <img 
          src={raw} 
          alt={player?.name || 'User Avatar'} 
          className="w-full h-full object-cover rounded-full"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      );
    }
    const txt = typeof raw === 'string' && raw.length > 0 && raw.length <= 4 ? raw : '👑';
    return (
      <span className="text-3xl font-black select-none" style={{ color: '#fbbf24' }}>
        {txt}
      </span>
    );
  };

  const storeFilterItems = CHAZHA_STORE_ITEMS.filter(i => i.category === storeSubTab);

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
            className="relative w-full max-w-sm sm:max-w-md max-h-[92vh] rounded-3xl border border-amber-500/40 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden text-white"
            style={{ backgroundColor: '#0c0f17' }}
          >
            {/* Close Button: Sleek Translucent Dark Glass */}
            <button
              onClick={() => {
                soundEngine.playTap?.();
                onClose();
              }}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#ffffff' }}
              title="بستن"
            >
              <X size={16} />
            </button>

            {/* 1. Single Active Header Banner (No Left/Right Arrows or Carousel Dots!) */}
            <div className="relative w-full h-36 sm:h-40 bg-slate-950 overflow-hidden shrink-0 border-b border-white/10">
              <img
                src={currentBanner?.imageUrl}
                alt={currentBanner?.nameFa || 'Profile Banner'}
                className="w-full h-full object-cover"
                loading="eager"
              />

              {/* Bottom Vignette */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to top, #0c0f17 0%, rgba(12,15,23,0.4) 50%, transparent 100%)' }}
              />

              {/* Single Banner Tag Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg border backdrop-blur-md flex items-center gap-1"
                  style={{ backgroundColor: 'rgba(10, 12, 20, 0.8)', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                >
                  <Sparkles size={11} className="text-amber-400" />
                  <span>{currentBanner?.tag || currentBanner?.nameFa || 'بنر اختصاصی'}</span>
                </span>
              </div>
            </div>

            {/* 2. Avatar & Gamer Identity */}
            <div className="relative px-4 pb-4 -mt-11 z-20 flex flex-col items-center text-center overflow-y-auto max-h-[72vh]">
              {/* Avatar Frame with Dynamic Custom Halo */}
              <div className="relative mb-2">
                <div 
                  className={`w-20 h-20 rounded-full p-0.5 ${frameEffectClass}`}
                  style={{ 
                    background: 'linear-gradient(135deg, #d97706 0%, #facc15 50%, #d97706 100%)',
                    boxShadow: frameEffectClass ? undefined : '0 0 20px rgba(245, 158, 11, 0.5)'
                  }}
                >
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center overflow-hidden shadow-inner"
                    style={{ backgroundColor: '#0c0f17' }}
                  >
                    {renderAvatarContent()}
                  </div>
                </div>

                {/* Online Glowing Dot */}
                <div 
                  className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#0c0f17' }}
                >
                  <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                </div>
              </div>

              {/* Player Name & Badges */}
              <h2 className="text-base font-black text-white flex items-center justify-center gap-1.5 flex-wrap">
                <span>{player.name || 'کاربر چاژا'}</span>
                {isSelf && isVip && (
                  <span 
                    className="px-1.5 py-0.2 rounded-md border text-[9px] font-bold flex items-center gap-0.5"
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                  >
                    <Crown size={10} />
                    <span>VIP</span>
                  </span>
                )}
              </h2>

              {/* Status Bar */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <span 
                  className="text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                >
                  <span>{player.rank || 'استاد چاژا 👑'}</span>
                </span>
                <span 
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                  style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                >
                  Lv.{player.level || 14}
                </span>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  🟢 آنلاین
                </span>
              </div>

              {/* 3. Sleek Bio Box */}
              <div 
                className="w-full mt-3 p-3 rounded-2xl border text-right relative shadow-inner"
                style={{ backgroundColor: '#131826', borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400">معرفی بازیکن</span>
                  {isSelf && !isEditingBio && (
                    <button
                      onClick={() => {
                        setIsEditingBio(true);
                        setBioDraft(bioText);
                        soundEngine.playTap?.();
                      }}
                      className="text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      style={{ color: '#fbbf24' }}
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
                      className="w-full p-2 rounded-xl text-white text-xs leading-relaxed focus:outline-none resize-none text-right"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid #f59e0b' }}
                      placeholder="درباره سبک بازی و علایقتان بنویسید..."
                    />
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">{bioDraft.length}/120</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setIsEditingBio(false)}
                          className="px-2 py-1 rounded-lg text-slate-300 hover:text-white cursor-pointer font-bold"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          انصراف
                        </button>
                        <button
                          onClick={handleSaveBio}
                          className="px-3 py-1 rounded-lg text-slate-950 font-black cursor-pointer shadow-md"
                          style={{ backgroundColor: '#f59e0b' }}
                        >
                          ذخیره ✓
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed font-normal" style={{ color: '#e2e8f0' }}>
                    {bioText}
                  </p>
                )}

                {saveSuccessMsg && (
                  <span className="block mt-1 text-[10px] font-bold text-emerald-400">
                    بیوگرافی با موفقیت ذخیره شد ✓
                  </span>
                )}
              </div>

              {/* 4. Luxury 3-Metric Stats Grid */}
              <div className="grid grid-cols-3 gap-2 w-full my-3">
                <div 
                  className="p-2.5 rounded-2xl border text-center shadow-inner"
                  style={{ backgroundColor: '#131826', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Trophy size={16} className="mx-auto mb-0.5" style={{ color: '#fbbf24' }} />
                  <span className="block text-[9px] text-slate-400 font-bold">نرخ برد</span>
                  <span className="text-xs font-mono font-black" style={{ color: '#fcd34d' }}>
                    {player.winRate || '75%'}
                  </span>
                </div>
                <div 
                  className="p-2.5 rounded-2xl border text-center shadow-inner"
                  style={{ backgroundColor: '#131826', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Swords size={16} className="mx-auto mb-0.5" style={{ color: '#38bdf8' }} />
                  <span className="block text-[9px] text-slate-400 font-bold">مسابقات</span>
                  <span className="text-xs font-mono font-black" style={{ color: '#7dd3fc' }}>
                    {player.matchesCount || 58}
                  </span>
                </div>
                <div 
                  className="p-2.5 rounded-2xl border text-center shadow-inner"
                  style={{ backgroundColor: '#131826', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <ShieldCheck size={16} className="mx-auto mb-0.5" style={{ color: '#34d399' }} />
                  <span className="block text-[9px] text-slate-400 font-bold">امتیاز مهارت</span>
                  <span className="text-xs font-mono font-black" style={{ color: '#6ee7b7' }}>
                    1,520
                  </span>
                </div>
              </div>

              {/* 5. Integrated Bottom Tabs Header (سربرگ پایین با ادغام فروشگاه و سکه) */}
              {isSelf && (
                <div className="w-full space-y-2.5">
                  <div 
                    className="grid grid-cols-4 gap-1 p-1 rounded-2xl border"
                    style={{ backgroundColor: '#101422', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        soundEngine.playTap?.();
                      }}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                        activeTab === 'profile'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      👤 مشخصات
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('inventory');
                        soundEngine.playTap?.();
                      }}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                        activeTab === 'inventory'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🎒 کمد من
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('store');
                        soundEngine.playTap?.();
                      }}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-0.5 cursor-pointer ${
                        activeTab === 'store'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                          : 'text-amber-300 hover:text-white'
                      }`}
                    >
                      <span>🛍️ فروشگاه</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        soundEngine.playTap?.();
                      }}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                        activeTab === 'settings'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚙️ تنظیمات
                    </button>
                  </div>

                  {/* Toast for store actions inside card */}
                  {storeToast && (
                    <div 
                      className="px-3 py-1.5 rounded-xl text-center text-xs font-bold text-slate-950 shadow"
                      style={{ backgroundColor: '#f59e0b' }}
                    >
                      {storeToast}
                    </div>
                  )}

                  {/* TAB 1: Profile Links */}
                  {activeTab === 'profile' && (
                    <div className="space-y-2">
                      <button
                        onClick={handleCopyReferral}
                        className="w-full py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.25) 0%, rgba(13, 148, 136, 0.25) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: '#6ee7b7'
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {copiedReferral ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                          <span>{copiedReferral ? 'لینک دعوت کپی شد ✓' : 'دعوت دوستان (+۵۰۰ سکه هدیه)'}</span>
                        </span>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.3)', color: '#a7f3d0' }}>
                          +500 🪙
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          const tg = window.Telegram?.WebApp;
                          if (tg?.openTelegramLink) {
                            tg.openTelegramLink('https://t.me/chazha_bot');
                          } else {
                            window.open('https://t.me/chazha_bot', '_blank');
                          }
                        }}
                        className="w-full py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-md"
                        style={{
                          backgroundColor: 'rgba(2, 132, 199, 0.2)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: '#bae6fd'
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <ExternalLink size={15} />
                          <span>پروفایل و امکانات در ربات تلگرام</span>
                        </span>
                        <span className="text-[10px] font-mono text-sky-300">@chazha_bot</span>
                      </button>
                    </div>
                  )}

                  {/* TAB 2: Inventory & Active Items */}
                  {activeTab === 'inventory' && (
                    <div 
                      className="space-y-2.5 p-3 rounded-2xl border text-right"
                      style={{ backgroundColor: '#131826', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      {/* Active Banner */}
                      <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{currentBanner?.icon || '🖼️'}</span>
                          <div>
                            <span className="block text-[11px] font-black text-white">بنر فعال: {currentBanner?.nameFa}</span>
                            <span className="text-[9px] text-amber-300">نمایش در هدر پروفایل</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('store');
                            setStoreSubTab('banners');
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}
                        >
                          تغییر بنر
                        </button>
                      </div>

                      {/* Active Checkers */}
                      <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{activePieceItem?.icon || '🦅'}</span>
                          <div>
                            <span className="block text-[11px] font-black text-white">مهره بازی: {activePieceItem?.nameFa || 'منبت فروهر'}</span>
                            <span className="text-[9px] text-amber-300">فعال در بازی‌ها</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('store');
                            setStoreSubTab('pieces');
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}
                        >
                          تغییر مهره
                        </button>
                      </div>

                      {/* Active Theme */}
                      <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{activeThemeItem?.icon || '🪵'}</span>
                          <div>
                            <span className="block text-[11px] font-black text-white">تم زمین: {activeThemeItem?.nameFa || 'چوب گردو'}</span>
                            <span className="text-[9px] text-slate-400">طرح تخته نرد</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('store');
                            setStoreSubTab('themes');
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}
                        >
                          تغییر تم
                        </button>
                      </div>

                      {/* Active Frame */}
                      <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">👑</span>
                          <div>
                            <span className="block text-[11px] font-black text-white">قاب آواتار: {activeFrameItem?.nameFa || 'پیش‌فرض'}</span>
                            <span className="text-[9px] text-slate-400">هاله دور عکس پروفایل</span>
                          </div>
                        </div>
                        {equippedFrame && equippedFrame !== 'none' ? (
                          <button
                            onClick={() => {
                              unequipItem?.('frame');
                              soundEngine.playCheckmark?.();
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                            style={{ backgroundColor: 'rgba(244, 63, 94, 0.2)', color: '#fda4af' }}
                          >
                            برداشتن قاب ✕
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveTab('store');
                              setStoreSubTab('frames');
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                            style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}
                          >
                            انتخاب قاب
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: INTEGRATED STORE & COINS (فروشگاه و شارژ سکه در سربرگ پایین) */}
                  {activeTab === 'store' && (
                    <div 
                      className="space-y-2.5 p-3 rounded-2xl border text-right"
                      style={{ backgroundColor: '#131826', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                    >
                      {/* Coins Balance Header */}
                      <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: '#0c0f17', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🪙</span>
                          <span className="text-xs font-black font-mono" style={{ color: '#fbbf24' }}>
                            {(coins || 0).toLocaleString()} سکه موجود
                          </span>
                        </div>
                        <button
                          onClick={() => setStoreSubTab('coins')}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer shadow"
                          style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}
                        >
                          ➕ شارژ سکه
                        </button>
                      </div>

                      {/* Store Category Selector */}
                      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                        {[
                          { id: 'banners', label: '🖼️ بنرها' },
                          { id: 'pieces', label: '🎲 مهره‌ها' },
                          { id: 'themes', label: '🪵 تم‌ها' },
                          { id: 'dice', label: '🎲 تاس‌ها' },
                          { id: 'frames', label: '👑 قاب‌ها' },
                          { id: 'coins', label: '🪙 خرید سکه' }
                        ].map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setStoreSubTab(sub.id);
                              soundEngine.playTap?.();
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all"
                            style={storeSubTab === sub.id 
                              ? { backgroundColor: '#f59e0b', color: '#0f172a' } 
                              : { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1' }
                            }
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>

                      {/* Store Content List */}
                      <div className="max-h-52 overflow-y-auto space-y-2 pr-0.5">
                        {storeSubTab === 'coins' ? (
                          // Coin Recharge Hub
                          <div className="space-y-2 text-right">
                            <span className="block text-[11px] font-bold text-sky-300">⭐ خرید با تلگرام استارز:</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { coins: '۱,۰۰۰ سکه', stars: '۳۵ ⭐' },
                                { coins: '۵,۰۰۰ سکه', stars: '۱۵۰ ⭐' },
                                { coins: '۱۵,۰۰۰ سکه', stars: '۳۵۰ ⭐' },
                                { coins: '۵۰,۰۰۰ سکه + VIP', stars: '۱,۰۰۰ ⭐' }
                              ].map((cPkg, ci) => (
                                <button
                                  key={ci}
                                  onClick={() => {
                                    soundEngine.playTap?.();
                                    const tg = window.Telegram?.WebApp;
                                    if (tg?.openTelegramLink) {
                                      tg.openTelegramLink('https://t.me/chazha_bot?start=buy_stars');
                                    } else {
                                      window.open('https://t.me/chazha_bot', '_blank');
                                    }
                                  }}
                                  className="p-2 rounded-xl border border-white/10 text-center cursor-pointer transition-all active:scale-95"
                                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                                >
                                  <span className="block text-[11px] font-black text-white">{cPkg.coins}</span>
                                  <span className="text-[10px] font-bold font-mono" style={{ color: '#fbbf24' }}>{cPkg.stars}</span>
                                </button>
                              ))}
                            </div>

                            <span className="block text-[11px] font-bold text-amber-300 pt-1">💳 خرید ریالی (کارت به کارت در ربات):</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { title: 'بسته ۵۰ تومنی', coins: '۲,۰۰۰ سکه' },
                                { title: 'بسته ۱۲۰ تومنی', coins: '۶,۰۰۰ سکه' }
                              ].map((rPkg, ri) => (
                                <button
                                  key={ri}
                                  onClick={() => {
                                    soundEngine.playTap?.();
                                    const tg = window.Telegram?.WebApp;
                                    if (tg?.openTelegramLink) {
                                      tg.openTelegramLink('https://t.me/chazha_bot?start=buy_rial');
                                    } else {
                                      window.open('https://t.me/chazha_bot', '_blank');
                                    }
                                  }}
                                  className="p-2 rounded-xl border border-white/10 text-center cursor-pointer"
                                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                                >
                                  <span className="block text-[11px] font-black text-white">{rPkg.title}</span>
                                  <span className="text-[10px] font-bold" style={{ color: '#fbbf24' }}>{rPkg.coins}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Items List
                          storeFilterItems.map(sItem => {
                            const isOwned = isItemOwned(sItem);
                            const isEquipped = isItemEquipped(sItem);

                            return (
                              <div
                                key={sItem.id}
                                className="p-2 rounded-xl border flex items-center justify-between gap-2"
                                style={{ 
                                  backgroundColor: 'rgba(0, 0, 0, 0.35)', 
                                  borderColor: isEquipped ? '#10b981' : 'rgba(255, 255, 255, 0.08)' 
                                }}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-base shrink-0">{sItem.icon}</span>
                                  <div className="truncate">
                                    <h5 className="text-[11px] font-black text-white truncate">{sItem.nameFa}</h5>
                                    <span className="text-[10px] font-mono" style={{ color: '#fbbf24' }}>
                                      {sItem.price === 0 ? 'رایگان' : `🪙 ${sItem.price}`}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleStoreItemAction(sItem)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 transition-all active:scale-95 cursor-pointer shadow"
                                  style={isEquipped 
                                    ? { backgroundColor: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', color: '#6ee7b7' }
                                    : isOwned 
                                    ? { backgroundColor: '#0284c7', color: '#ffffff' }
                                    : { backgroundColor: '#f59e0b', color: '#0f172a' }
                                  }
                                >
                                  {isEquipped ? 'فعال ✓ (لغو)' : isOwned ? 'فعال‌سازی' : 'خرید'}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Game Settings */}
                  {activeTab === 'settings' && (
                    <div 
                      className="space-y-2.5 p-3 rounded-2xl border text-right"
                      style={{ backgroundColor: '#131826', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      {/* Sound Toggle */}
                      <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                        <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: '#e2e8f0' }}>
                          {isSoundMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-emerald-400" />}
                          <span>جلوه‌های صوتی بازی</span>
                        </span>
                        <button
                          onClick={handleToggleSound}
                          className="px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                          style={isSoundMuted
                            ? { backgroundColor: 'rgba(244, 63, 94, 0.2)', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.4)' }
                            : { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)' }
                          }
                        >
                          {isSoundMuted ? 'بی‌صدا 🔇' : 'فعال 🔊'}
                        </button>
                      </div>

                      {/* Board Theme Picker if provided */}
                      {onSelectTheme && (
                        <div className="p-2 rounded-xl space-y-1.5" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                          <div className="flex items-center justify-between text-xs font-bold" style={{ color: '#fcd34d' }}>
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
                                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-gradient-to-r text-white border transition-all active:scale-95 cursor-pointer"
                                style={boardTheme === t.key
                                  ? { borderColor: '#fbbf24', boxShadow: '0 0 10px rgba(251, 191, 36, 0.4)' }
                                  : { borderColor: 'rgba(255, 255, 255, 0.1)', opacity: 0.7 }
                                }
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
                    <div 
                      className="p-3 rounded-2xl border text-center text-xs font-medium"
                      style={{ backgroundColor: 'rgba(2, 132, 199, 0.15)', borderColor: 'rgba(56, 189, 248, 0.3)', color: '#7dd3fc' }}
                    >
                      🤖 حریف تمرینی هوشمند و همیشه آماده چاژا!
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleSendFriend}
                        disabled={isFriend || requestSent}
                        className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                        style={isFriend
                          ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }
                          : requestSent
                          ? { backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.3)' }
                          : { background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)', color: '#ffffff' }
                        }
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
                        className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-[0.98] cursor-pointer"
                        style={chatRequested
                          ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', borderColor: '#10b981' }
                          : { backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0', borderColor: 'rgba(255, 255, 255, 0.15)' }
                        }
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
