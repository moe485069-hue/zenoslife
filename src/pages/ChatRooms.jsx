import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MessageSquare, Users, Globe, Hash, Shield, Lock, 
  Send, UserPlus, Zap, Activity, Heart, Coins, MoreVertical, X, 
  MessagesSquare, FileText, PlusCircle, Smile, Reply, CornerDownRight, 
  Sparkles, AtSign, Eye, EyeOff, Check, UserCheck, Flame, Volume2, Gamepad2,
  Bell, BellRing, Settings, Crown, Trash2, Ban, MicOff, Key, Radio, Compass, 
  Upload, Image, UserX, UserMinus, Star, Gift, ExternalLink, Sliders
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useMultiplayerStore from '../store/multiplayerStore';
import { COMPANION_PERSONAS } from '../services/companionAI';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import TriviaBotWidget from '../components/chat/TriviaBotWidget';
import SyncRadioWidget from '../components/chat/SyncRadioWidget';
import SuperGiftingModal from '../components/chat/SuperGiftingModal';
import SoulBondModal from '../components/chat/SoulBondModal';
import BlindChatModal from '../components/chat/BlindChatModal';
import ZenStoreModal from '../components/chat/ZenStoreModal';
import CoinShopModal from '../components/shop/CoinShopModal';
import VipSubscriptionModal from '../components/dating/VipSubscriptionModal';
import ReferralHubModal from '../components/referral/ReferralHubModal';
import TournamentHubModal from '../components/games/TournamentHubModal';
import TarotAstrologyModal from '../components/ai/TarotAstrologyModal';



const FLASH_EMOJIS = ['🔥', '❤️', '👏', '🌟', '💎', '🚀', '👑', '🧘', '🌸', '⚔️', '💯', '✨', '☕', '💡', '🏆', '🎯'];

const QUICK_PHRASES = [
  'درود و وقت بخیر به همه دوستان 🌟',
  'استمرار و تمرکز کلید پیروزیه! 🔥',
  'نکته بسیار هوشمندانه و عالی بود 💡',
  'موافقم، با تمام انرژی ادامه بده! 🚀',
  'آرامش در لحظه حال جاریه 🧘',
  'دمت گرم رفیق، موفق باشی 👏'
];

const QUICK_DM_PROMPTS = [
  'سلام دوست خوبم! روزت پرانرژی 🌸',
  'پایه‌ای یک دست تخته‌نرد آنلاین بزنیم؟ 🎲',
  'امروز روی چه عاداتی تمرکز داری؟ 🧘',
  'چه کتاب یا پادکستی رو پیشنهاد می‌کنی؟ 💡'
];

const CITIES = ['تهران', 'اصفهان', 'شیراز', 'مشهد', 'تبریز', 'کرج', 'یزد', 'اهواز', 'رشت', 'آنلاین / جهانی 🌐'];

const INTEREST_TAGS = [
  'مدیتیشن 🧘', 'کتابخوانی 📚', 'ورزش و فیتنس 🏃', 'پومودورو ⏱️', 
  'تخته‌نرد 🎲', 'شطرنج ♟️', 'بیزینس و سرمایه 💼', 'هوش مصنوعی 🤖', 
  'فلسفه رواقی 🏛️', 'سحرخیزی 🌅', 'موسیقی 🎵', 'روانشناسی 🧠'
];

const BADGE_OPTIONS = [
  { id: '👑 مالک و مدیر ارشد', label: '👑 مالک و مدیر ارشد', color: 'from-amber-500 to-yellow-600' },
  { id: '🛡️ ناظم و بازرس', label: '🛡️ ناظم و بازرس', color: 'from-blue-500 to-indigo-600' },
  { id: '💎 عضو ویژه VIP', label: '💎 عضو ویژه VIP', color: 'from-purple-500 to-pink-600' },
  { id: '🌿 استاد ذن و آرامش', label: '🌿 استاد ذن و آرامش', color: 'from-emerald-500 to-teal-600' },
  { id: '⚡ قهرمان استمرار', label: '⚡ قهرمان استمرار', color: 'from-rose-500 to-orange-600' }
];

const PRESET_AVATARS = [
  '🌟', '👑', '🦁', '💎', '🚀', '🌌', '🧘', '🌸', '⚔️', '🦅', 
  '🔥', '⚡', '🏆', '🌿', '🎯', '🪐', '🦄', '🕊️', '🦊', '🐺', 
  '🌺', '🧙‍♂️', '🧝‍♀️', '🔮', '🎭', '🎨', '🚀', '🏎️', '🐉', '🐲'
];

export const MATCH_COMPANIONS = Object.values(COMPANION_PERSONAS);

// Helper to compress gallery image to fast base64 data URL
const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 128;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ChatRooms() {
  const { language, coins, addCoins } = useAppStore();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const { 
    userId, userName, userAvatar, setUserName, setUserAvatar,
    networkStatus, activeRelayCount,
    onlineUsers, globalChat, forumThreads,
    customRooms, addCustomRoom, deleteCustomRoom,
    userBadges, setUserBadge, muteUser, banUser, deleteChatMessage, purgeUserMessages, purgeRoomChat,
    isAdminUnlocked, unlockAdmin,
    directMessages, activeDmUserId, setActiveDmUserId, sendDirectMessage,
    unreadDmCounts, incomingDmToast, dismissIncomingDmToast,
    ignoredUserIds, toggleIgnoreUser,
    isCompanionTyping,
    pingUsers, sendGlobalMessage, likeMessage, tipMessage, addForumThread 
  } = useMultiplayerStore();

  const [activeRoom, setActiveRoom] = useState('general');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'match' | 'dm' | 'forum'
  
  // Secret Admin Trigger
  const [adminClicks, setAdminClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('rooms'); // 'rooms' | 'users' | 'badges' | 'logs'
  
  // Room Form in Admin
  const [newRoomFa, setNewRoomFa] = useState('');
  const [newRoomEn, setNewRoomEn] = useState('');
  const [newRoomIcon, setNewRoomIcon] = useState('Hash');
  const [newRoomLocked, setNewRoomLocked] = useState(false);

  // Matchmaking State
  const [matchCategory, setMatchCategory] = useState('all');
  const [connectedUserIds, setConnectedUserIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zen_connected_companions') || '[]');
    } catch {
      return [];
    }
  });

  // Profile Builder State
  const [isMyProfileModalOpen, setIsMyProfileModalOpen] = useState(false);
  const [myMatchName, setMyMatchName] = useState(() => localStorage.getItem('zen_my_match_name') || userName || 'کاربر هم‌فرکانس');
  const [myMatchAge, setMyMatchAge] = useState(() => localStorage.getItem('zen_my_match_age') || '۲۶');
  const [myMatchCity, setMyMatchCity] = useState(() => localStorage.getItem('zen_my_match_city') || 'تهران');
  const [myMatchBio, setMyMatchBio] = useState(() => localStorage.getItem('zen_my_match_bio') || 'علاقه‌مند به خودشناسی، مراقبه، ورزش و گفت‌وگوهای پرانرژی و بازی‌های فکری.');
  const [myMatchChakra, setMyMatchChakra] = useState(() => localStorage.getItem('zen_my_match_chakra') || '💚 چاکرای قلب (عشق و تعادل)');
  const [myMatchGoal, setMyMatchGoal] = useState(() => localStorage.getItem('zen_my_match_goal') || 'همراه رشد و مراقبه');
  const [mySelectedTags, setMySelectedTags] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zen_my_match_tags') || '["مدیتیشن 🧘", "تخته‌نرد 🎲", "کتابخوانی 📚"]');
    } catch {
      return ['مدیتیشن 🧘', 'تخته‌نرد 🎲'];
    }
  });
  const [hasRegisteredProfile, setHasRegisteredProfile] = useState(() => !!localStorage.getItem('zen_my_match_bio'));
  
  // User Profile Action Sheet Modal State
  const [inspectedUser, setInspectedUser] = useState(null); // { id, name, avatar, role, city, bio, chakra, isReal }
  
  // Photo & Avatar Picker Modal
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState('presets'); // 'presets' | 'upload'
  const fileInputRef = useRef(null);

  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(!userName || userName.startsWith('User'));
  const [tempName, setTempName] = useState(userName || '');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Whisper & Reply
  const [whisperTarget, setWhisperTarget] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  // Mobile drawers
  const [isMobileUsersOpen, setIsMobileUsersOpen] = useState(false);

  // New Forum Thread
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  // New Ecosystem Modals
  const [isGiftingModalOpen, setIsGiftingModalOpen] = useState(false);
  const [giftTargetUser, setGiftTargetUser] = useState(null);
  const [isSoulBondModalOpen, setIsSoulBondModalOpen] = useState(false);
  const [isBlindChatModalOpen, setIsBlindChatModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isCoinShopOpen, setIsCoinShopOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [isTarotModalOpen, setIsTarotModalOpen] = useState(false);
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const { isVip } = useAppStore();

  const [showRadioWidget, setShowRadioWidget] = useState(true);
  const [showTriviaWidget, setShowTriviaWidget] = useState(true);
  
  const { activeGiftAnimation, activeSoulBond } = useMultiplayerStore();
  const { equippedFrame, equippedNameColor } = useAppStore();

  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('philosophy');

  const chatEndRef = useRef(null);
  const dmEndRef = useRef(null);

  const totalUnreadCount = Object.values(unreadDmCounts || {}).reduce((a, b) => a + b, 0);
  const myRole = userBadges[userId] || (isAdminUnlocked ? '👑 مالک و مدیر ارشد' : 'عضو جامعه');
  const isUserAdminOrMod = isAdminUnlocked || myRole.includes('مالک') || myRole.includes('مدیر') || myRole.includes('ناظم');

  useEffect(() => {
    pingUsers(activeRoom);
    const interval = setInterval(() => pingUsers(activeRoom), 6000);
    return () => clearInterval(interval);
  }, [pingUsers, activeRoom]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalChat, activeRoom, activeTab]);

  useEffect(() => {
    if (activeTab === 'dm') {
      dmEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [directMessages, activeDmUserId, activeTab, isCompanionTyping]);

  // Secret Admin Trigger
  const handleLobbyClickSecret = () => {
    const now = Date.now();
    if (now - lastClickTime < 1500) {
      const nextClicks = adminClicks + 1;
      setAdminClicks(nextClicks);
      if (nextClicks >= 3) {
        setAdminClicks(0);
        soundEngine.playLevelUp?.();
        if (isAdminUnlocked) {
          setIsAdminPanelOpen(true);
        } else {
          setIsAdminPinModalOpen(true);
        }
      }
    } else {
      setAdminClicks(1);
    }
    setLastClickTime(now);
  };

  const handleVerifyAdminPin = (e) => {
    e?.preventDefault?.();
    if (adminPinInput === '979797') {
      unlockAdmin('979797');
      setIsAdminPinModalOpen(false);
      setAdminPinInput('');
      setIsAdminPanelOpen(true);
    } else {
      alert('رمز عبور مدیریت نادرست است!');
      setAdminPinInput('');
      soundEngine.playTap?.();
    }
  };

  const handleSaveName = () => {
    if (tempName.trim().length > 1) {
      useMultiplayerStore.getState().setUserName(tempName.trim());
      setIsEditingName(false);
      soundEngine.playCheckmark?.();
      haptics.success?.();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImageFile(file);
      setUserAvatar(base64);
      setIsAvatarModalOpen(false);
      soundEngine.playCheckmark?.();
      haptics.success?.();
    } catch (err) {
      alert('خطا در بارگذاری تصویر!');
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    
    const extra = {};
    if (whisperTarget) {
      extra.isWhisper = true;
      extra.whisperTargetId = whisperTarget.id;
      extra.whisperTargetName = whisperTarget.name;
    }
    if (replyingTo) {
      extra.replyTo = {
        id: replyingTo.id,
        userName: replyingTo.userName,
        text: replyingTo.text.slice(0, 70)
      };
    }

    sendGlobalMessage(chatInput.trim(), activeRoom, false, extra);
    setChatInput('');
    setReplyingTo(null);
    setIsEmojiPickerOpen(false);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleSendDm = (e) => {
    if (e) e.preventDefault();
    if (!dmInput.trim() || !activeDmUserId) return;
    
    const targetUser = onlineUsers.find(u => u.id === activeDmUserId) || MATCH_COMPANIONS.find(c => c.id === activeDmUserId) || { id: activeDmUserId, name: 'همراه' };
    sendDirectMessage(activeDmUserId, targetUser.name, dmInput.trim());
    setDmInput('');
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleToggleConnect = (companion) => {
    soundEngine.playLevelUp?.();
    haptics.success?.();
    setConnectedUserIds(prev => {
      const isAlready = prev.includes(companion.id);
      const next = isAlready ? prev.filter(id => id !== companion.id) : [...prev, companion.id];
      localStorage.setItem('zen_connected_companions', JSON.stringify(next));
      if (!isAlready) {
        sendGlobalMessage(isRtl ? `❤️ ${userName} با ${companion.name} (${companion.matchScore || 95}٪ هم‌فرکانس) پیوند همراهی برقرار کرد!` : `❤️ ${userName} connected with ${companion.name}!`, activeRoom, true);
      }
      return next;
    });
  };

  const handleStartDmWithUser = (user) => {
    setActiveDmUserId(user.id);
    setActiveTab('dm');
    setInspectedUser(null);
    setIsMobileUsersOpen(false);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleStartWhisperWithUser = (user) => {
    setWhisperTarget(user);
    setInspectedUser(null);
    setIsMobileUsersOpen(false);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleInviteToGame = (user) => {
    soundEngine.playCheckmark?.();
    haptics.tap?.();
    const cleanName = (user.name || 'SOUL').replace(/\s+/g, '-');
    navigate(`/games/backgammon?room=${encodeURIComponent('SOUL-' + cleanName)}&mode=online`);
  };

  const handleToggleTag = (tag) => {
    soundEngine.playTap?.();
    setMySelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      if (prev.length >= 6) {
        alert('حداکثر ۶ علاقه‌مندی می‌توانید انتخاب کنید.');
        return prev;
      }
      return [...prev, tag];
    });
  };

  const handleSaveMyMatchProfile = (e) => {
    e?.preventDefault?.();
    localStorage.setItem('zen_my_match_name', myMatchName);
    localStorage.setItem('zen_my_match_age', myMatchAge);
    localStorage.setItem('zen_my_match_city', myMatchCity);
    localStorage.setItem('zen_my_match_bio', myMatchBio);
    localStorage.setItem('zen_my_match_chakra', myMatchChakra);
    localStorage.setItem('zen_my_match_goal', myMatchGoal);
    localStorage.setItem('zen_my_match_tags', JSON.stringify(mySelectedTags));
    setHasRegisteredProfile(true);
    setIsMyProfileModalOpen(false);
    sendGlobalMessage(isRtl ? `✨ ${myMatchName} پروفایل هم‌فرکانسی خود را در شبکه فعال کرد!` : `✨ ${myMatchName} published their soul match profile!`, 'general', true);
    soundEngine.playLevelUp?.();
    haptics.success?.();
  };

  const handleSendQuickEmoji = (emoji) => {
    setChatInput(prev => prev + emoji);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleSendQuickPhrase = (phrase) => {
    sendGlobalMessage(phrase, activeRoom, false);
    setIsEmojiPickerOpen(false);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleLike = (msgId) => {
    likeMessage(msgId);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleTip = (msgId) => {
    if (coins >= 5) {
      addCoins(-5);
      tipMessage(msgId, 5);
      sendGlobalMessage(isRtl ? `🔹 ${userName} ۵ سکه 🪙 پاداش اهدا کرد!` : `🔹 ${userName} sent a 5🪙 tip!`, activeRoom, true);
      soundEngine.playCheckmark?.();
      haptics.success?.();
    } else {
      alert(isRtl ? 'سکه کافی ندارید!' : 'Not enough coins!');
    }
  };

  const handleTipUserDirectly = (targetUser) => {
    if (coins >= 5) {
      addCoins(-5);
      sendGlobalMessage(isRtl ? `💎 ${userName} ۵ سکه 🪙 پاداش به ${targetUser.name} اهدا کرد!` : `💎 ${userName} sent a 5🪙 gift to ${targetUser.name}!`, activeRoom, true);
      soundEngine.playLevelUp?.();
      haptics.success?.();
      alert(`۵ سکه با موفقیت به ${targetUser.name} اهدا شد!`);
    } else {
      alert('سکه کافی ندارید!');
    }
  };

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim()) return;
    
    addForumThread({
      title: newThreadTitle.trim(),
      author: userName,
      category: newThreadCategory
    });
    setNewThreadTitle('');
    setIsNewThreadModalOpen(false);
    soundEngine.playCheckmark?.();
    haptics.success?.();
  };

  const handleAddRoomSubmit = (e) => {
    e.preventDefault();
    if (!newRoomFa.trim()) return;
    addCustomRoom({
      nameFa: newRoomFa.trim(),
      nameEn: newRoomEn.trim() || newRoomFa.trim(),
      icon: newRoomIcon,
      locked: newRoomLocked
    });
    setNewRoomFa('');
    setNewRoomEn('');
    setNewRoomLocked(false);
  };

  // Filter messages for current room, exclude ignored users, and respect whisper privacy
  const roomMessages = globalChat.filter(m => {
    if (ignoredUserIds.includes(m.userId)) return false;
    const isThisRoom = m.roomId === activeRoom || m.text.startsWith(`[${activeRoom}]`);
    if (!isThisRoom) return false;
    if (m.isWhisper) {
      return m.userId === userId || m.whisperTargetId === userId;
    }
    return true;
  });

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const activePeer = onlineUsers.find(u => u.id === activeDmUserId) || MATCH_COMPANIONS.find(c => c.id === activeDmUserId) || { id: activeDmUserId, name: 'همراه', avatar: '🌸' };

  const filteredCompanions = MATCH_COMPANIONS.filter(c => {
    if (matchCategory === 'connected') return connectedUserIds.includes(c.id);
    if (matchCategory === 'all') return true;
    return c.category === matchCategory;
  });

  const getRoomIcon = (iconName) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'Shield': return <Shield className="w-4 h-4 text-amber-400" />;
      case 'Activity': return <Activity className="w-4 h-4 text-rose-400" />;
      case 'Lock': return <Lock className="w-4 h-4 text-fuchsia-400" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4 text-sky-400" />;
      default: return <Hash className="w-4 h-4 text-emerald-400" />;
    }
  };

  // Render Avatar (Handles Base64 image URL or Emoji)
  const renderAvatar = (avatarStr, sizeClasses = 'w-8 h-8 text-sm') => {
    if (!avatarStr) return <div className={`${sizeClasses} rounded-2xl bg-purple-600 flex items-center justify-center text-white`}>👤</div>;
    if (avatarStr.startsWith('data:image/') || avatarStr.startsWith('http')) {
      return <img src={avatarStr} alt="Avatar" className={`${sizeClasses} rounded-2xl object-cover border border-white/20 shadow-sm`} />;
    }
    return (
      <div className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0`}>
        {avatarStr}
      </div>
    );
  };

  return (
    <div className="w-full h-[calc(100dvh-75px)] relative overflow-hidden bg-[var(--bg-primary)] flex flex-col font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Background Subtle Graphic */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <Globe className="w-96 h-96 text-purple-500" />
      </div>

      {/* FLOATING IN-APP DM TOAST NOTIFICATION */}
      <AnimatePresence>
        {incomingDmToast && activeTab !== 'dm' && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 p-3.5 rounded-3xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 text-white"
          >
            <div className="flex items-center gap-3 min-w-0">
              {renderAvatar(incomingDmToast.senderAvatar, 'w-10 h-10 text-lg')}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <BellRing size={12} className="text-amber-400 animate-bounce" />
                  <h4 className="text-xs font-black text-indigo-300 truncate">{incomingDmToast.senderName}</h4>
                  <span className="text-[9px] text-slate-400">پیام خصوصی جدید</span>
                </div>
                <p className="text-xs text-slate-200 truncate mt-0.5 font-medium">{incomingDmToast.text}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setActiveDmUserId(incomingDmToast.senderId);
                  setActiveTab('dm');
                  dismissIncomingDmToast();
                  soundEngine.playTap?.();
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md active:scale-95"
              >
                پاسخ 💬
              </button>
              <button onClick={dismissIncomingDmToast} className="p-1 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 px-2 sm:px-4 pt-2 sm:pt-4 max-w-6xl w-full mx-auto flex flex-col h-full min-h-0">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-sm"
              title={isRtl ? 'بازگشت' : 'Back'}
            >
              <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            
            <div>
              {/* Secret Admin Trigger: Triple Click on Title */}
              <button 
                onClick={handleLobbyClickSecret}
                className="text-start group"
                title="برای دسترسی به پنل مدیریت ۳ بار کلیک کنید"
              >
                <h1 className="text-xs sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400 leading-tight group-hover:scale-101 transition-transform flex items-center gap-1.5 whitespace-nowrap">
                  <span>{isRtl ? '💬 گفتگو و دوستیابی' : 'Live Chat & Match'}</span>
                  {isAdminUnlocked && <span className="text-[9px] px-1 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">👑 ادمین</span>}
                </h1>
              </button>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isRtl ? 'شبکه زنده' : 'Live'} ({activeRelayCount || 1})</span>
                </span>
                <span className="text-[9px] text-slate-500">•</span>
                <span className="text-[9px] text-slate-400 font-bold">
                  {onlineUsers.length + 1} {isRtl ? 'کاربر آنلاین' : 'online'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls - Sleek & Modern */}
          <div className="flex items-center gap-1.5">
            {/* Features Hub Button (Replaces cluttered buttons) */}
            <button
              onClick={() => { setIsFeaturesMenuOpen(true); soundEngine.playTap?.(); }}
              className="p-1.5 px-3 rounded-2xl bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-amber-600/30 border border-purple-500/40 text-purple-200 text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 hover:border-purple-400 transition-all"
              title="امکانات و خدمات ویژه"
            >
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>{isRtl ? 'امکانات' : 'Features'}</span>
            </button>

            {/* Coins Shop Badge */}
            <button
              onClick={() => { setIsCoinShopOpen(true); soundEngine.playTap?.(); }}
              className="p-1.5 px-2.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-yellow-500/20 active:scale-95"
              title="خرید سکه و الماس"
            >
              <span>🪙</span>
              <span>{(coins || 0).toLocaleString()}</span>
            </button>

            {/* Mobile Online Users Toggle Button */}
            <button
              onClick={() => setIsMobileUsersOpen(o => !o)}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-300 font-bold text-xs shadow-sm active:scale-95"
            >
              <Users size={13} />
              <span>{onlineUsers.length + 1}</span>
            </button>

            {/* Avatar & Photo Picker Trigger */}
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="relative p-0.5 rounded-2xl border border-purple-500/40 hover:border-purple-400 transition-all shadow-sm group"
              title={isRtl ? 'انتخاب آواتار یا تصویر از گالری' : 'Change Avatar'}
            >
              {renderAvatar(userAvatar, 'w-8 h-8 text-sm')}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                📷
              </span>
            </button>

            {/* Username pill */}
            {isEditingName ? (
              <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] p-1 rounded-xl shadow-inner">
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  placeholder={isRtl ? 'نام...' : 'Name...'}
                  className="bg-transparent text-xs text-[var(--text-primary)] px-1.5 outline-none w-20 font-bold"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-1 px-2 bg-purple-600 text-white rounded-lg text-[10px] font-bold shadow-xs">
                  ✔
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingName(true)} 
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold text-fuchsia-400 hover:border-fuchsia-500/40 shadow-xs"
              >
                <span className="max-w-[70px] truncate">{userName}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Channels Strip */}
        {activeTab === 'chat' && (
          <div className="flex md:hidden items-center gap-1 overflow-x-auto no-scrollbar py-1 shrink-0 mb-1">
            {customRooms.map(room => (
              <button
                key={room.id}
                onClick={() => {
                  if (room.id === 'general') handleLobbyClickSecret();
                  if (!room.locked) setActiveRoom(room.id);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all ${
                  activeRoom === room.id
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm scale-102 font-black'
                    : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)]'
                } ${room.locked ? 'opacity-40' : ''}`}
              >
                {getRoomIcon(room.icon)}
                <span>{isRtl ? room.nameFa : room.nameEn}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 relative pb-1">
          
          {/* Desktop Left Sidebar: Rooms & Online Users */}
          <div className="hidden md:flex w-64 flex-col gap-2 shrink-0 h-full overflow-hidden">
            <div className="p-2.5 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] space-y-1 shadow-sm">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase">
                  {isRtl ? 'اتاق‌های گفتگوی زنده' : 'Live Channels'}
                </span>
                {isAdminUnlocked && (
                  <button 
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="text-[10px] text-amber-400 font-bold hover:underline"
                  >
                    + افزودن اتاق
                  </button>
                )}
              </div>

              {customRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    if (room.id === 'general') handleLobbyClickSecret();
                    if (!room.locked) setActiveRoom(room.id);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all border text-start group ${
                    activeRoom === room.id
                      ? 'bg-purple-600/20 border-purple-500/50 text-[var(--text-primary)] shadow-md font-bold'
                      : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/30'
                  } ${room.locked ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-xl transition-colors ${activeRoom === room.id ? 'bg-purple-500/30' : 'bg-slate-800/40'}`}>
                      {getRoomIcon(room.icon)}
                    </div>
                    <div className="text-xs font-bold">{isRtl ? room.nameFa : room.nameEn}</div>
                  </div>
                  {activeRoom === room.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />}
                </button>
              ))}
            </div>
            
            {/* Online Users Box (Flash Style List) */}
            <div className="mt-auto pt-2">
              <div className="p-3.5 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] to-slate-900/40 shadow-inner">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isRtl ? 'همراهان آنلاین' : 'Online Members'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                    {onlineUsers.length + 1}
                  </span>
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  <button
                    onClick={() => setInspectedUser({ id: userId, name: userName, avatar: userAvatar, role: myRole, isMe: true })}
                    className="text-[11px] font-bold px-2 py-1 bg-purple-950/50 text-purple-200 rounded-xl border border-purple-500/40 flex items-center gap-1.5 hover:scale-102 transition-transform"
                  >
                    {renderAvatar(userAvatar, 'w-4 h-4 text-[10px]')}
                    <span>{userName}</span>
                    <span className="text-[9px] opacity-75">(شما)</span>
                  </button>
                  {onlineUsers.map(u => (
                    <button 
                      key={u.id} 
                      onClick={() => setInspectedUser(u)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-xl border flex items-center gap-1.5 transition-all hover:scale-105 ${
                        u.isReal 
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50 shadow-xs' 
                          : 'bg-slate-800/60 text-slate-300 border-white/5 hover:bg-slate-700'
                      }`}
                    >
                      {renderAvatar(u.avatar, 'w-4 h-4 text-[10px]')}
                      <span>{u.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area (4 Tabs: Live Rooms, Soul Match, DM, Forums) */}
          <div className="flex-1 flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl min-h-0 relative">
            
            {/* Top Bar Navigation Tabs */}
            <div className="flex items-center border-b border-[var(--border)] bg-[var(--bg-secondary)] shrink-0 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => { setActiveTab('chat'); soundEngine.playTap?.(); }}
                className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'chat' ? 'border-purple-500 text-purple-500 bg-purple-500/10' : 'border-transparent text-[var(--text-secondary)] hover:bg-white/5'
                }`}
              >
                <MessagesSquare size={15} />
                <span>{isRtl ? 'اتاق‌های گفتگو' : 'Live Rooms'}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('match'); soundEngine.playTap?.(); }}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all border-b-2 whitespace-nowrap relative ${
                  activeTab === 'match' ? 'border-rose-500 text-rose-500 bg-rose-500/10' : 'border-transparent text-[var(--text-secondary)] hover:bg-white/5'
                }`}
              >
                <Heart size={15} className={activeTab === 'match' ? 'fill-rose-500' : ''} />
                <span>{isRtl ? 'همراهان و دوستیابی' : 'Soul Match'}</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </button>

              <button 
                onClick={() => { setActiveTab('dm'); soundEngine.playTap?.(); }}
                className={`flex-1 min-w-[105px] flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all border-b-2 whitespace-nowrap relative ${
                  activeTab === 'dm' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-[var(--text-secondary)] hover:bg-white/5'
                }`}
              >
                <MessageSquare size={15} />
                <span>{isRtl ? 'پیام خصوصی' : 'Direct Msg'}</span>
                {totalUnreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-bounce shadow-md">
                    {totalUnreadCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => { setActiveTab('forum'); soundEngine.playTap?.(); }}
                className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'forum' ? 'border-sky-500 text-sky-400 bg-sky-500/10' : 'border-transparent text-[var(--text-secondary)] hover:bg-white/5'
                }`}
              >
                <FileText size={15} />
                <span>{isRtl ? 'انجمن و مباحث' : 'Forums'}</span>
              </button>
            </div>

            {/* TAB CONTENT: CHAT */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Active Room Title Bar */}
                <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    {getRoomIcon(customRooms.find(r => r.id === activeRoom)?.icon)}
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                        {isRtl ? customRooms.find(r => r.id === activeRoom)?.nameFa : customRooms.find(r => r.id === activeRoom)?.nameEn}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {whisperTarget && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-bold">
                        <Lock size={12} />
                        <span>{isRtl ? `نجوا به: ${whisperTarget.name}` : `Whisper: ${whisperTarget.name}`}</span>
                        <button onClick={() => setWhisperTarget(null)} className="hover:text-white mr-1"><X size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Timeline (Flash Style with Profile Pictures Beside Messages) */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 no-scrollbar">
                  {roomMessages.map(msg => {
                    const isMe = msg.userId === userId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[92%] sm:max-w-[82%] ${isMe ? 'self-end mr-auto flex-row-reverse' : 'self-start ml-auto'}`}
                      >
                        {/* Profile Image / Avatar Beside Message (Clickable to open user profile) */}
                        <button
                          onClick={() => setInspectedUser({
                            id: msg.userId,
                            name: msg.userName,
                            avatar: msg.userAvatar,
                            role: msg.userRole,
                            isMe: isMe
                          })}
                          className="shrink-0 group hover:scale-110 transition-transform self-start mt-0.5"
                          title="مشاهده پروفایل و گزینه‌ها"
                        >
                          {renderAvatar(msg.userAvatar, 'w-8 h-8 sm:w-9 sm:h-9 text-base')}
                        </button>

                        <div className={`flex flex-col gap-1 min-w-0 ${isMe ? 'items-end' : 'items-start'}`}>
                          {/* Sender info & Badge */}
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] px-1">
                            <button
                              onClick={() => setInspectedUser({
                                id: msg.userId,
                                name: msg.userName,
                                avatar: msg.userAvatar,
                                role: msg.userRole,
                                isMe: isMe
                              })}
                              className="font-black text-[var(--text-primary)] hover:underline"
                            >
                              {msg.userName}
                            </button>
                            
                            {msg.userRole && msg.userRole !== 'عضو جامعه' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                                {msg.userRole}
                              </span>
                            )}
                            
                            <span className="text-[9px] opacity-70">{formatTime(msg.timestamp)}</span>
                          </div>

                          {/* Bubble */}
                          <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                            isMe 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm' 
                              : msg.isWhisper
                              ? 'bg-fuchsia-950/40 border border-fuchsia-500/40 text-fuchsia-200 rounded-tl-sm'
                              : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm'
                          }`}>
                            {msg.replyTo && (
                              <div className="p-1.5 mb-1.5 rounded-xl bg-black/20 text-[10px] border-r-2 border-amber-400 opacity-90 truncate">
                                <span className="font-bold">{msg.replyTo.userName}: </span>
                                <span>{msg.replyTo.text}</span>
                              </div>
                            )}

                            {msg.isWhisper && (
                              <div className="flex items-center gap-1 text-[10px] text-fuchsia-300 font-bold mb-1">
                                <Lock size={10} />
                                <span>{isRtl ? 'پیام نجوا (خصوصی)' : 'Private Whisper'}</span>
                              </div>
                            )}

                            <p className="break-words">{msg.text}</p>

                            {/* Quick interactions */}
                            <div className="flex items-center justify-between gap-3 pt-1.5 mt-1 border-t border-white/10 text-[10px]">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleLike(msg.id)} className="flex items-center gap-1 opacity-80 hover:opacity-100 hover:scale-110 transition-all">
                                  <span>❤️</span>
                                  <span>{msg.likes || 0}</span>
                                </button>
                                {msg.tips > 0 && (
                                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                                    <span>🪙</span>
                                    <span>{msg.tips}</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 opacity-80">
                                <button onClick={() => setReplyingTo(msg)} className="hover:text-amber-300" title="پاسخ">
                                  <Reply size={12} />
                                </button>
                                <button onClick={() => handleTip(msg.id)} className="hover:text-amber-300" title="اهدای ۵ سکه">
                                  🪙
                                </button>
                                {isUserAdminOrMod && (
                                  <button onClick={() => deleteChatMessage(msg.id)} className="text-rose-400 hover:text-rose-300" title="حذف توسط ادمین">
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Phrases bar */}
                <div className="px-2 sm:px-4 py-1.5 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  {QUICK_PHRASES.map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuickPhrase(phrase)}
                      className="px-2.5 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-purple-500 text-[11px] text-[var(--text-secondary)] whitespace-nowrap shrink-0 transition-all"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>

                {/* Reply Indicator */}
                {replyingTo && (
                  <div className="px-4 py-1.5 bg-purple-950/40 border-t border-purple-500/30 flex items-center justify-between text-xs text-purple-300 shrink-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <CornerDownRight size={13} />
                      <span>{isRtl ? `پاسخ به ${replyingTo.userName}: ${replyingTo.text.slice(0, 40)}...` : `Replying to ${replyingTo.userName}`}</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="hover:text-white"><X size={14} /></button>
                  </div>
                )}

                {/* Input Bar */}
                <form onSubmit={handleSend} className="p-2 sm:p-3 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center gap-2 shrink-0 relative">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(o => !o)}
                      className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-amber-400 transition-colors"
                    >
                      <Smile size={20} />
                    </button>
                    {isEmojiPickerOpen && (
                      <div className="absolute bottom-12 right-0 z-50 p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl grid grid-cols-4 gap-2 w-48 backdrop-blur-xl">
                        {FLASH_EMOJIS.map(em => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => handleSendQuickEmoji(em)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:scale-125 transition-transform"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isRtl ? `پیام در ${customRooms.find(r => r.id === activeRoom)?.nameFa}...` : 'Type a message...'}
                    className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] outline-none focus:border-purple-500 font-medium"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0"
                  >
                    <Send size={16} className={isRtl ? 'rotate-180' : ''} />
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: SOUL MATCH & CONSCIOUS DATING / FRIENDSHIP */}
            {activeTab === 'match' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar p-3 sm:p-5 space-y-4">
                
                {/* Matchmaking Hero Banner */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-cyan-950/40 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✨❤️</span>
                      <h3 className="text-sm sm:text-base font-black text-rose-400">
                        {isRtl ? 'همراهان و پارتنرهای هم‌فرکانس' : 'Soul Match & Conscious Connections'}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                        {isRtl ? 'تطابق ارتعاشی' : 'Frequency Match'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
                      {isRtl 
                        ? 'ارتباط با افرادی با اهداف مشترک، دیدگاه‌های عمیق، اهل مراقبه، ورزش، کتاب و بازی‌های فکری.' 
                        : 'Connect with mindful friends sharing your goals, habits, meditation & game interests.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsMyProfileModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 text-white text-xs font-black shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
                  >
                    <Sparkles size={15} />
                    <span>{hasRegisteredProfile ? (isRtl ? 'ویرایش پروفایل من ✨' : 'Edit Profile ✨') : (isRtl ? 'ثبت و ساخت پروفایل ✨' : 'Create Profile ✨')}</span>
                  </button>
                </div>

                {/* If user registered profile, show their card prominently at top */}
                {hasRegisteredProfile && (
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-2 border-purple-500/50 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {renderAvatar(userAvatar, 'w-10 h-10 text-base')}
                        <div>
                          <h4 className="text-xs font-black text-purple-300 flex items-center gap-1">
                            <span>{myMatchName}</span>
                            <span className="text-[10px] text-slate-300 font-normal">({myMatchAge} ساله • {myMatchCity})</span>
                          </h4>
                          <span className="text-[10px] text-emerald-400 font-bold">🟢 پروفایل شما فعال و در دسترس هم‌فرکانس‌هاست</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsMyProfileModalOpen(true)}
                        className="px-3 py-1 rounded-xl bg-purple-600/30 text-purple-200 border border-purple-500/40 text-xs font-bold hover:bg-purple-600/50"
                      >
                        ویرایش ✏️
                      </button>
                    </div>
                    <p className="text-xs text-slate-300">{myMatchBio}</p>
                    <div className="flex flex-wrap gap-1">
                      {mySelectedTags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0">
                  {[
                    { id: 'all', labelFa: 'همه همراهان', labelEn: 'All', icon: '🌟' },
                    { id: 'connected', labelFa: `همراهان من (${connectedUserIds.length})`, labelEn: 'Connected', icon: '❤️' },
                    { id: 'mindfulness', labelFa: 'مراقبه و آرامش', labelEn: 'Mindfulness', icon: '🧘' },
                    { id: 'business', labelFa: 'کسب‌وکار و ثروت', labelEn: 'Business', icon: '💼' },
                    { id: 'fitness', labelFa: 'ورزش و عادات', labelEn: 'Fitness', icon: '🏃' },
                    { id: 'gaming', labelFa: 'بازی و سرگرمی', labelEn: 'Games', icon: '🎮' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setMatchCategory(f.id);
                        soundEngine.playTap?.();
                        haptics.tap?.();
                      }}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 border ${
                        matchCategory === f.id
                          ? 'bg-rose-600 text-white border-rose-400 shadow-sm scale-102 font-black'
                          : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{f.icon}</span>
                      <span>{isRtl ? f.labelFa : f.labelEn}</span>
                    </button>
                  ))}
                </div>

                {/* Companions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-2">
                  {filteredCompanions.map(companion => {
                    const isConnected = connectedUserIds.includes(companion.id);

                    return (
                      <motion.div
                        key={companion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-rose-500/40 transition-all duration-300 shadow-md flex flex-col justify-between space-y-3.5 group"
                      >
                        {/* Top Row: Avatar, Name, Match Score */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setInspectedUser(companion)}
                              className="group-hover:scale-105 transition-transform"
                            >
                              {renderAvatar(companion.avatar, 'w-12 h-12 text-2xl')}
                            </button>
                            <div>
                              <button
                                onClick={() => setInspectedUser(companion)}
                                className="text-sm font-black text-[var(--text-primary)] hover:underline flex items-center gap-1.5"
                              >
                                <span>{companion.name}</span>
                                {companion.age && <span className="text-[10px] text-[var(--text-secondary)] font-normal">({companion.age} ساله • {companion.city})</span>}
                              </button>
                              <span className="text-[11px] text-rose-400 font-bold block mt-0.5">
                                {companion.lookingFor || companion.role}
                              </span>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div className="px-2.5 py-1 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black shrink-0 text-center shadow-inner">
                            <div>{companion.matchScore || 95}٪</div>
                            <div className="text-[8px] opacity-80">{isRtl ? 'هم‌فرکانس' : 'Match'}</div>
                          </div>
                        </div>

                        {/* Chakra & Bio */}
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                            <span>{companion.chakra}</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 font-medium">
                            {companion.bio}
                          </p>
                        </div>

                        {/* Interest Tags */}
                        <div className="flex flex-wrap gap-1">
                          {(companion.interests || []).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[10px] font-medium text-[var(--text-secondary)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Status indicator */}
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{companion.status || '🟢 آنلاین و آماده مصاحبت'}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2">
                          <button
                            onClick={() => handleStartDmWithUser(companion)}
                            className="flex-1 py-2 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <MessageSquare size={13} />
                            <span>{isRtl ? 'گفت‌وگو 💬' : 'Direct Msg'}</span>
                          </button>

                          <button
                            onClick={() => handleToggleConnect(companion)}
                            className={`py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all border ${
                              isConnected
                                ? 'bg-rose-600/20 text-rose-400 border-rose-500/50 shadow-inner'
                                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-rose-400'
                            }`}
                          >
                            <Heart size={13} className={isConnected ? 'fill-rose-500 text-rose-500' : ''} />
                            <span>{isConnected ? (isRtl ? 'همراه شما ❤️' : 'Connected') : (isRtl ? 'پیوند همراهی' : 'Connect')}</span>
                          </button>

                          <button
                            onClick={() => handleInviteToGame(companion)}
                            className="py-2 px-3 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                            title={isRtl ? 'دعوت به بازی تخته‌نرد' : 'Play Game'}
                          >
                            <Gamepad2 size={13} />
                            <span>{isRtl ? 'بازی 🎲' : 'Play'}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB CONTENT: DIRECT MESSAGES (DMs) */}
            {activeTab === 'dm' && (
              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* DM Peers Sidebar */}
                <div className="w-full md:w-60 border-b md:border-b-0 md:border-l border-[var(--border)] bg-[var(--bg-secondary)]/50 p-2 overflow-x-auto md:overflow-y-auto no-scrollbar flex md:flex-col gap-1.5 shrink-0">
                  <div className="text-[10px] font-black text-[var(--text-secondary)] px-2 py-1 uppercase hidden md:block">
                    {isRtl ? 'مخاطبین و همراهان' : 'Contacts'}
                  </div>
                  {onlineUsers.map(peer => {
                    const isCurrent = activeDmUserId === peer.id;
                    const peerUnread = unreadDmCounts[peer.id] || 0;

                    return (
                      <button
                        key={peer.id}
                        onClick={() => {
                          setActiveDmUserId(peer.id);
                          soundEngine.playTap?.();
                        }}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
                          isCurrent 
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-bold shadow-xs' 
                            : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {renderAvatar(peer.avatar, 'w-8 h-8 text-sm')}
                          <div className="text-start">
                            <div className="text-xs font-bold leading-tight">{peer.name}</div>
                            <span className="text-[9px] text-[var(--text-secondary)] opacity-75 hidden md:block truncate">{peer.role || peer.chakra}</span>
                          </div>
                        </div>

                        {peerUnread > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-md animate-pulse">
                            {peerUnread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* DM Active Conversation Area */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* DM Header */}
                  <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                      <button onClick={() => setInspectedUser(activePeer)}>
                        {renderAvatar(activePeer?.avatar, 'w-9 h-9 text-base')}
                      </button>
                      <div>
                        <button onClick={() => setInspectedUser(activePeer)} className="text-xs sm:text-sm font-black text-[var(--text-primary)] hover:underline text-start block">
                          {activePeer?.name || 'گفتگوی خصوصی'}
                        </button>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {isRtl ? 'آنلاین • پاسخگوی هم‌فرکانس' : 'Online & Active'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleInviteToGame(activePeer)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1 hover:bg-purple-600/25 active:scale-95"
                      >
                        <Gamepad2 size={13} />
                        <span>{isRtl ? 'دعوت به بازی 🎲' : 'Invite to Game'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages Timeline */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
                    {((directMessages && directMessages[activeDmUserId]) || []).map(msg => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[85%] ${msg.isMe ? 'self-end mr-auto flex-row-reverse' : 'self-start ml-auto'}`}
                      >
                        <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                          msg.isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-sm font-medium' 
                            : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm'
                        }`}>
                          <p>{msg.text}</p>
                          <span className="text-[9px] opacity-70 block text-end mt-1">{formatTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    ))}

                    {/* Companion Typing Indicator */}
                    {isCompanionTyping && (
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] w-fit text-xs text-indigo-400 font-bold animate-pulse">
                        <Sparkles size={14} className="animate-spin" />
                        <span>{activePeer?.name || 'همراه'} در حال نوشتن پاسخ... ✨</span>
                      </div>
                    )}

                    <div ref={dmEndRef} />
                  </div>

                  {/* Quick Starter Prompts for DMs */}
                  <div className="px-3 py-1.5 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    {QUICK_DM_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDmInput(prompt);
                          soundEngine.playTap?.();
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-indigo-500 text-[11px] text-[var(--text-secondary)] whitespace-nowrap shrink-0 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* DM Input Bar */}
                  <form onSubmit={handleSendDm} className="p-2 sm:p-3 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={dmInput}
                      onChange={(e) => setDmInput(e.target.value)}
                      placeholder={isRtl ? `پیام خصوصی به ${activePeer?.name || 'همراه'}...` : 'Type private message...'}
                      className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!dmInput.trim()}
                      className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0"
                    >
                      <Send size={16} className={isRtl ? 'rotate-180' : ''} />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FORUMS */}
            {activeTab === 'forum' && (
              <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto no-scrollbar space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-primary)]">{isRtl ? 'مباحث و انجمن‌های تخصصی' : 'Forums & Discussions'}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{isRtl ? 'تبادل تجربیات، سوال و جواب و ایده‌ها' : 'Share insights and start topics'}</p>
                  </div>
                  <button
                    onClick={() => setIsNewThreadModalOpen(true)}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <PlusCircle size={14} />
                    <span>{isRtl ? 'مبحث جدید' : 'New Topic'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {forumThreads.map(thread => (
                    <div 
                      key={thread.id}
                      className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-purple-500/40 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold border border-purple-500/30">
                          #{customRooms.find(r => r.id === thread.category)?.nameFa || thread.category}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">{thread.date}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] leading-snug mb-2">{thread.title}</h4>
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                        <span className="font-bold">{isRtl ? `نویسنده: ${thread.author}` : `By: ${thread.author}`}</span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              thread.likes = (thread.likes || 0) + 1;
                              soundEngine.playTap?.();
                              haptics.tap?.();
                            }}
                            className="hover:scale-110 transition-transform"
                          >
                            ❤️ {thread.likes || 0}
                          </button>
                          <span>💬 {thread.replies || 0} پاسخ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* NOSTALGIC FLASH-STYLE INTERACTIVE USER PROFILE ACTION MODAL */}
      <AnimatePresence>
        {inspectedUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Header: Avatar, Name, Role */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {renderAvatar(inspectedUser.avatar, 'w-14 h-14 text-3xl')}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-1.5">
                      <span>{inspectedUser.name}</span>
                      {inspectedUser.isMe && <span className="text-[10px] text-purple-400 font-normal">(شما)</span>}
                    </h3>
                    <span className="text-xs text-purple-400 font-bold block mt-0.5">
                      {inspectedUser.role || inspectedUser.chakra || 'عضو جامعه ذن'}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">شناسه: {inspectedUser.id}</span>
                  </div>
                </div>
                <button onClick={() => setInspectedUser(null)} className="p-1 text-[var(--text-secondary)] hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Bio & Chakra if available */}
              {inspectedUser.bio && (
                <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed">
                  {inspectedUser.bio}
                </div>
              )}

              {/* Standard User Actions (Flash Chat Style) */}
              {!inspectedUser.isMe && (
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStartDmWithUser(inspectedUser)}
                      className="py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <MessageSquare size={14} />
                      <span>پیام خصوصی 💬</span>
                    </button>

                    <button
                      onClick={() => handleStartWhisperWithUser(inspectedUser)}
                      className="py-2.5 px-3 rounded-2xl bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/40 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-fuchsia-600/30"
                    >
                      <Lock size={14} />
                      <span>ارسال نجوا 🔒</span>
                    </button>

                    <button
                      onClick={() => handleInviteToGame(inspectedUser)}
                      className="py-2.5 px-3 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-purple-600/30"
                    >
                      <Gamepad2 size={14} />
                      <span>دعوت به بازی 🎲</span>
                    </button>

                    <button
                      onClick={() => handleTipUserDirectly(inspectedUser)}
                      className="py-2.5 px-3 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-500/25"
                    >
                      <Gift size={14} />
                      <span>اهدای ۵ سکه 🪙</span>
                    </button>

                    <button
                      onClick={() => {
                        handleToggleConnect(inspectedUser);
                        setInspectedUser(null);
                      }}
                      className="col-span-1 py-2.5 px-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:border-emerald-500/40"
                    >
                      <UserPlus size={14} />
                      <span>پیوند همراهی ❤️</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleIgnoreUser(inspectedUser.id);
                        setInspectedUser(null);
                      }}
                      className={`col-span-1 py-2.5 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 ${
                        ignoredUserIds.includes(inspectedUser.id)
                          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-600/15 text-rose-400 border-rose-500/30 hover:bg-rose-600/25'
                      }`}
                    >
                      <UserX size={14} />
                      <span>{ignoredUserIds.includes(inspectedUser.id) ? 'لغو ایگنور' : 'ایگنور و مسدود 🚫'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SPECIAL ADMIN & MODERATOR CONTROLS SECTION */}
              {isUserAdminOrMod && !inspectedUser.isMe && (
                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2.5">
                  <h4 className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-400" />
                    <span>پنل ویژه نظارت و مدیریت (Admin Actions)</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        muteUser(inspectedUser.id);
                        alert(`کاربر ${inspectedUser.name} بی‌صدا شد.`);
                        setInspectedUser(null);
                      }}
                      className="py-2 px-2.5 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-amber-600/30"
                    >
                      <MicOff size={12} />
                      <span>بی‌صدا کردن 🔇</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`آیا از اخراج و مسدودسازی ${inspectedUser.name} مطمئن هستید؟`)) {
                          banUser(inspectedUser.id);
                          setInspectedUser(null);
                        }
                      }}
                      className="py-2 px-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-rose-600/30"
                    >
                      <Ban size={12} />
                      <span>مسدود و اخراج ⛔</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`آیا از پاکسازی تمام پیام‌های ${inspectedUser.name} مطمئن هستید؟`)) {
                          purgeUserMessages(inspectedUser.id);
                          setInspectedUser(null);
                        }
                      }}
                      className="col-span-2 py-2 px-2.5 rounded-xl bg-slate-800 text-slate-300 border border-white/10 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-slate-700"
                    >
                      <Trash2 size={12} />
                      <span>پاکسازی تمام پیام‌های این کاربر 🗑️</span>
                    </button>
                  </div>

                  {/* Promote Badges in Popup */}
                  <div className="pt-1.5 border-t border-amber-500/20">
                    <span className="text-[10px] text-amber-300 font-bold block mb-1">ارتقای درجه کاربر:</span>
                    <div className="flex flex-wrap gap-1">
                      {BADGE_OPTIONS.map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setUserBadge(inspectedUser.id, b.id);
                            alert(`نشان ${b.label} به ${inspectedUser.name} اعطا شد!`);
                            setInspectedUser(null);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-slate-900 border border-amber-500/30 text-[9px] font-bold text-amber-200 hover:bg-amber-900/40"
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AVATAR & GALLERY IMAGE PICKER MODAL */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Image size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-primary)]">انتخاب تصویر پروفایل و آواتار</h3>
                    <span className="text-[10px] text-[var(--text-secondary)]">تصویر اختصاصی از گالری یا آواتارهای آماده</span>
                  </div>
                </div>
                <button onClick={() => setIsAvatarModalOpen(false)} className="text-[var(--text-secondary)] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Tabs: Upload vs Presets */}
              <div className="flex items-center border-b border-[var(--border)] gap-2">
                <button
                  onClick={() => setAvatarTab('presets')}
                  className={`flex-1 py-2 text-xs font-black border-b-2 transition-all ${
                    avatarTab === 'presets' ? 'border-purple-500 text-purple-400' : 'border-transparent text-[var(--text-secondary)]'
                  }`}
                >
                  آواتارهای ویژه و ایموجی ✨
                </button>
                <button
                  onClick={() => setAvatarTab('upload')}
                  className={`flex-1 py-2 text-xs font-black border-b-2 transition-all ${
                    avatarTab === 'upload' ? 'border-purple-500 text-purple-400' : 'border-transparent text-[var(--text-secondary)]'
                  }`}
                >
                  انتخاب عکس از گالری 📷
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                {avatarTab === 'presets' ? (
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map(av => (
                      <button
                        key={av}
                        onClick={() => {
                          setUserAvatar(av);
                          setIsAvatarModalOpen(false);
                          soundEngine.playTap?.();
                          haptics.tap?.();
                        }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform ${
                          userAvatar === av 
                            ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-md' 
                            : 'bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-purple-500'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 text-center p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-8 rounded-3xl border-2 border-dashed border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 cursor-pointer flex flex-col items-center justify-center space-y-3 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl shadow-lg">
                        <Upload size={24} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">برای انتخاب عکس کلیک کنید</h4>
                        <span className="text-[10px] text-[var(--text-secondary)]">پشتیبانی از فرمت‌های JPG, PNG (بهینه‌سازی خودکار)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECRET ADMIN PIN MODAL */}
      <AnimatePresence>
        {isAdminPinModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center text-2xl shadow-lg">
                👑
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-300">ورود به پنل مدیریت ارشد ذنوس‌لایف</h3>
                <p className="text-xs text-slate-400 mt-1">رمز عبور ۶ رقمی مدیریت را وارد کنید:</p>
              </div>

              <form onSubmit={handleVerifyAdminPin} className="space-y-3">
                <input
                  type="password"
                  maxLength={6}
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-widest text-lg font-black py-2.5 rounded-2xl bg-slate-800 border border-amber-500/40 text-amber-300 outline-none focus:border-amber-400"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-black text-xs shadow-md active:scale-95"
                  >
                    ورود و تأیید 🗝️
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdminPinModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-800 text-slate-400 text-xs font-bold"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL ADMIN MANAGEMENT PANEL */}
      <AnimatePresence>
        {isAdminPanelOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl h-[85vh] rounded-3xl bg-slate-900 border border-amber-500/50 shadow-2xl flex flex-col overflow-hidden text-white"
            >
              {/* Admin Panel Header */}
              <div className="p-4 border-b border-amber-500/30 bg-slate-950 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-base">
                    👑
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-300">داشبورد مدیریت ارشد (Zen Master Portal)</h3>
                    <span className="text-[10px] text-slate-400">کنترل کامل اتاق‌ها، نظارت بر کاربران و تاریخچه</span>
                  </div>
                </div>
                <button onClick={() => setIsAdminPanelOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Admin Tabs Navigation */}
              <div className="flex items-center border-b border-white/10 bg-slate-950/60 shrink-0 overflow-x-auto no-scrollbar">
                {[
                  { id: 'rooms', label: '🏛️ مدیریت اتاق‌ها' },
                  { id: 'users', label: `👥 کاربران آنلاین (${onlineUsers.length + 1})` },
                  { id: 'badges', label: '👑 نشان‌ها و درجات' },
                  { id: 'logs', label: '📜 تاریخچه و پاکسازی' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    className={`flex-1 min-w-[120px] py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-all ${
                      adminTab === tab.id
                        ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Admin Tab Content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
                
                {/* 1. ROOMS MANAGEMENT */}
                {adminTab === 'rooms' && (
                  <div className="space-y-4">
                    {/* Add Room Form */}
                    <form onSubmit={handleAddRoomSubmit} className="p-3.5 rounded-2xl bg-slate-800/80 border border-amber-500/30 space-y-3">
                      <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <PlusCircle size={14} />
                        <span>ایجاد تالار / اتاق گفتگوی جدید</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={newRoomFa}
                          onChange={e => setNewRoomFa(e.target.value)}
                          placeholder="نام تالار به فارسی (مثال: ارز دیجیتال)"
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          value={newRoomEn}
                          onChange={e => setNewRoomEn(e.target.value)}
                          placeholder="نام تالار به انگلیسی (Crypto)"
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <select
                          value={newRoomIcon}
                          onChange={e => setNewRoomIcon(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white outline-none font-bold"
                        >
                          <option value="Hash"># نماد هش (عمومی)</option>
                          <option value="Globe">🌐 نماد کره زمین</option>
                          <option value="Zap">⚡ نماد انرژی و صاعقه</option>
                          <option value="Shield">🛡️ نماد سپر و امنیت</option>
                          <option value="Activity">🏃 نماد فعالیت و ورزش</option>
                          <option value="Lock">🔒 نماد اتاق ویژه</option>
                        </select>

                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md active:scale-95 transition-all"
                        >
                          + افزودن اتاق به شبکه
                        </button>
                      </div>
                    </form>

                    {/* Room List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-400">لیست اتاق‌های موجود در سرور:</h4>
                      {customRooms.map(r => (
                        <div key={r.id} className="p-3 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-700">{getRoomIcon(r.icon)}</div>
                            <div>
                              <div className="text-xs font-bold text-white">{r.nameFa}</div>
                              <span className="text-[10px] text-slate-400">{r.nameEn} ({r.id})</span>
                            </div>
                          </div>
                          
                          {r.id !== 'general' && (
                            <button
                              onClick={() => deleteCustomRoom(r.id)}
                              className="p-2 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600/40 text-xs font-bold flex items-center gap-1"
                            >
                              <Trash2 size={13} />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. ONLINE USERS & LOCATIONS */}
                {adminTab === 'users' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {renderAvatar(userAvatar, 'w-9 h-9 text-base')}
                        <div>
                          <div className="text-xs font-black text-purple-300">{userName} (دستگاه فعلی شما)</div>
                          <span className="text-[10px] text-slate-400">شناسه: {userId} • در حال حضور در: {activeRoom}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">👑 مدیر ارشد</span>
                    </div>

                    {onlineUsers.map(u => (
                      <div key={u.id} className="p-3 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {renderAvatar(u.avatar, 'w-9 h-9 text-base')}
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                            <span className="text-[10px] text-slate-400">موقعیت: {u.currentRoom || 'general'} • مقام: {u.role || 'عضو'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectedUser(u)}
                            className="px-2.5 py-1 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-600/40"
                          >
                            مدیریت ⚙️
                          </button>
                          <button
                            onClick={() => {
                              setActiveDmUserId(u.id);
                              setActiveTab('dm');
                              setIsAdminPanelOpen(false);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[10px] font-bold"
                          >
                            پیام 💬
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. BADGES & PRIVILEGES */}
                {adminTab === 'badges' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300">برای ارتقای مقام و اعطای نشان ویژه به هر کاربر، نشان مورد نظر را انتخاب فرمایید:</p>
                    {onlineUsers.map(u => (
                      <div key={u.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {renderAvatar(u.avatar, 'w-7 h-7 text-xs')}
                            <span className="text-xs font-bold text-white">{u.name}</span>
                          </div>
                          <span className="text-[10px] text-purple-400 font-bold">{u.role || 'عادی'}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {BADGE_OPTIONS.map(b => (
                            <button
                              key={b.id}
                              onClick={() => setUserBadge(u.id, b.id)}
                              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400 text-[10px] font-bold text-slate-300 transition-all"
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. CHAT LOGS & PURGE */}
                {adminTab === 'logs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-400">پاکسازی کامل اتاق فعلی ({activeRoom}):</h4>
                      <button
                        onClick={() => {
                          if (confirm(`آیا از پاکسازی تمام پیام‌های اتاق ${activeRoom} مطمئن هستید؟`)) {
                            purgeRoomChat(activeRoom);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Trash2 size={13} />
                        <span>پاکسازی پیام‌های {activeRoom}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar border border-white/10 rounded-2xl p-2 bg-slate-950">
                      {globalChat.map(m => (
                        <div key={m.id} className="p-2 rounded-xl bg-slate-900 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-amber-300">[{m.roomId}] {m.userName}: </span>
                            <span className="text-slate-300">{m.text}</span>
                          </div>
                          <button onClick={() => deleteChatMessage(m.id)} className="text-rose-400 hover:text-rose-300 p-1">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE ONLINE USERS DRAWER */}
      <AnimatePresence>
        {isMobileUsersOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:hidden">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-3xl p-5 max-h-[75vh] flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                  <Users size={16} className="text-emerald-400" />
                  <span>{isRtl ? 'کاربران و همراهان آنلاین' : 'Online Members'} ({onlineUsers.length + 1})</span>
                </h3>
                <button onClick={() => setIsMobileUsersOpen(false)} className="p-1 text-[var(--text-secondary)]">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                {/* Self */}
                <div 
                  onClick={() => {
                    setInspectedUser({ id: userId, name: userName, avatar: userAvatar, role: myRole, isMe: true });
                    setIsMobileUsersOpen(false);
                  }}
                  className="p-2.5 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {renderAvatar(userAvatar, 'w-8 h-8 text-sm')}
                    <span className="text-xs font-black text-purple-300">{userName} (شما)</span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-bold">فعال</span>
                </div>

                {onlineUsers.map(u => (
                  <div 
                    key={u.id}
                    className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between"
                  >
                    <div 
                      onClick={() => {
                        setInspectedUser(u);
                        setIsMobileUsersOpen(false);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      {renderAvatar(u.avatar, 'w-8 h-8 text-sm')}
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">{u.name}</div>
                        <span className="text-[9px] text-[var(--text-secondary)]">{u.role || u.chakra}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartWhisperWithUser(u)}
                        className="px-2.5 py-1 rounded-xl bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/30 text-[10px] font-bold"
                      >
                        نجوا 🔒
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('dm');
                          setActiveDmUserId(u.id);
                          setIsMobileUsersOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[10px] font-bold"
                      >
                        چت 💬
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW FORUM THREAD MODAL */}
      <AnimatePresence>
        {isNewThreadModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                  <FileText size={16} className="text-sky-400" />
                  <span>{isRtl ? 'ایجاد مبحث جدید در انجمن' : 'Create New Forum Thread'}</span>
                </h3>
                <button onClick={() => setIsNewThreadModalOpen(false)} className="text-[var(--text-secondary)]"><X size={18} /></button>
              </div>

              <form onSubmit={handleCreateThread} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  placeholder={isRtl ? 'عنوان و موضوع مورد نظر برای بحث...' : 'Thread title...'}
                  className="w-full px-3.5 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-sky-500 font-medium"
                />

                <select
                  value={newThreadCategory}
                  onChange={e => setNewThreadCategory(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none font-bold"
                >
                  <option value="philosophy">فلسفه و خودشناسی 🧘</option>
                  <option value="business">کسب‌وکار و ثروت 💼</option>
                  <option value="fitness">ورزش و سلامت 🏃</option>
                  <option value="tech">فناوری و مهارت 💻</option>
                </select>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-black text-xs shadow-md active:scale-98 transition-all"
                >
                  {isRtl ? 'انتشار مبحث در انجمن' : 'Publish Topic'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOUL MATCH PROFILE BUILDER MODAL */}
      <AnimatePresence>
        {isMyProfileModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                      {isRtl ? 'ساخت و ویرایش پروفایل هم‌فرکانسی' : 'Soul Match Profile Builder'}
                    </h3>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {isRtl ? 'مشخصات شما برای یافتن همراهان و دوستان ایده‌آل' : 'Find like-minded companions'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsMyProfileModalOpen(false)} className="text-[var(--text-secondary)] hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMyMatchProfile} className="space-y-4">
                {/* Name, Age, City */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">نام نمایش:</label>
                    <input
                      type="text"
                      required
                      value={myMatchName}
                      onChange={e => setMyMatchName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none font-bold"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">سن:</label>
                    <input
                      type="number"
                      value={myMatchAge}
                      onChange={e => setMyMatchAge(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none font-bold text-center"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">شهر:</label>
                    <select
                      value={myMatchCity}
                      onChange={e => setMyMatchCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none font-bold"
                    >
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Chakra & Dominant Energy */}
                <div>
                  <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">
                    چاکرای فعال / ارتعاش انرژی شما:
                  </label>
                  <select
                    value={myMatchChakra}
                    onChange={e => setMyMatchChakra(e.target.value)}
                    className="w-full p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-rose-500 font-bold"
                  >
                    <option value="💚 چاکرای قلب (عشق و تعادل)">💚 چاکرای قلب (عشق، صلح، درک متقابل و تعادل)</option>
                    <option value="👁️ چاکرای چشم سوم (شهود و خرد)">👁️ چاکرای چشم سوم (شهود، بصیرت، تفکر عمیق و خرد)</option>
                    <option value="☀️ چاکرای خورشیدی (اراده و قدرت)">☀️ چاکرای خورشیدی (اراده، عمل، رهبری و پویایی)</option>
                    <option value="👑 چاکرای تاج (آگاهی کیهانی)">👑 چاکرای تاج (آگاهی فراتر، معنویت و نور)</option>
                    <option value="💙 چاکرای گلو (بیان حقیقت)">💙 چاکرای گلو (صداقت، ارتباط شفاف و بیان هنرمندانه)</option>
                    <option value="🔥 چاکرای ریشه (شور و استواری)">🔥 چاکرای ریشه (شور زندگی، انگیزه و پشتکار فولادی)</option>
                  </select>
                </div>

                {/* Seeking Goal */}
                <div>
                  <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">
                    به دنبال چه نوع همراه یا پارتنری هستید؟
                  </label>
                  <select
                    value={myMatchGoal}
                    onChange={e => setMyMatchGoal(e.target.value)}
                    className="w-full p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-rose-500 font-bold"
                  >
                    <option value="همراه رشد و مراقبه">همراه رشد، مراقبه و حال خوب 🧘</option>
                    <option value="پارتنر بیزینس و رشد مالی">پارتنر بیزینس، ایده و رشد مالی 💼</option>
                    <option value="پارتنر تمرین و چالش عادت">پارتنر ورزش، استمرار و عادات روزانه 🏃</option>
                    <option value="همراه فکری و بازی‌های دونفره">همراه فکری، گپ‌های عمیق و بازی تخته‌نرد 🎮</option>
                    <option value="دوستی صمیمانه و تعادل روحی">دوستی صمیمانه، انرژی مثبت و آرامش ❤️</option>
                  </select>
                </div>

                {/* Interest Tags Picker */}
                <div>
                  <label className="text-xs font-bold text-[var(--text-primary)] block mb-1.5">
                    علاقه‌مندی‌ها و موضوعات مورد علاقه (انتخاب ۱ تا ۶ مورد):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {INTEREST_TAGS.map(tag => {
                      const isSelected = mySelectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-rose-600 text-white border-rose-400 shadow-xs'
                              : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bio Description */}
                <div>
                  <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">
                    درباره من و نگرش زندگی (Bio):
                  </label>
                  <textarea
                    rows={3}
                    value={myMatchBio}
                    onChange={e => setMyMatchBio(e.target.value)}
                    placeholder="کمی درباره ارزش‌ها، روحیات و علایق خود بنویسید..."
                    className="w-full p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-rose-500 font-medium resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg active:scale-98 transition-all"
                  >
                    {isRtl ? 'ذخیره و انتشار پروفایل هم‌فرکانسی ✨' : 'Save & Publish Profile ✨'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Features Hub Bottom Drawer / Modal */}
      <AnimatePresence>
        {isFeaturesMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h3 className="text-sm font-black text-white">{isRtl ? 'امکانات و خدمات ویژه' : 'Features & Services'}</h3>
                    <p className="text-[10px] text-slate-400">{isRtl ? 'دسترسی سریع به بخش‌های تعاملی' : 'Quick access to chat features'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFeaturesMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Grid of features */}
              <div className="grid grid-cols-2 gap-2.5">
                
                {/* 1. VIP Subscription */}
                <button
                  onClick={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsVipModalOpen(true);
                    soundEngine.playTap?.();
                  }}
                  className={`p-3 rounded-2xl border text-start flex flex-col justify-between gap-2 transition-all active:scale-95 ${
                    isVip ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-white/5 border-white/10 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">👑</span>
                    {isVip && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black">فعال</span>}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">{isRtl ? 'عضویت VIP' : 'VIP Pass'}</div>
                    <div className="text-[10px] text-slate-400">{isRtl ? 'نشان طلایی و چت نامحدود' : 'Golden badge & perks'}</div>
                  </div>
                </button>

                {/* 2. Tarot & Astrology */}
                <button
                  onClick={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsTarotModalOpen(true);
                    soundEngine.playTap?.();
                  }}
                  className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 text-start flex flex-col justify-between gap-2 transition-all active:scale-95"
                >
                  <span className="text-xl">🔮</span>
                  <div>
                    <div className="text-xs font-black text-purple-200">{isRtl ? 'فال و چارت' : 'Tarot & Chart'}</div>
                    <div className="text-[10px] text-slate-400">{isRtl ? 'تاروت کیهانی و هم‌فرکانسی' : 'Astrology & AI Tarot'}</div>
                  </div>
                </button>

                {/* 3. Blind Speed Chat */}
                <button
                  onClick={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsBlindChatModalOpen(true);
                    soundEngine.playTap?.();
                  }}
                  className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/30 hover:border-pink-400 text-start flex flex-col justify-between gap-2 transition-all active:scale-95"
                >
                  <span className="text-xl">🎭</span>
                  <div>
                    <div className="text-xs font-black text-pink-200">{isRtl ? 'قرار ناشناس' : 'Blind Speed Chat'}</div>
                    <div className="text-[10px] text-slate-400">{isRtl ? 'مکالمه ۳ دقیقه‌ای هیجان‌انگیز' : '3-min mystery chat'}</div>
                  </div>
                </button>

                {/* 4. Referral Invite */}
                <button
                  onClick={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsReferralModalOpen(true);
                    soundEngine.playTap?.();
                  }}
                  className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 text-start flex flex-col justify-between gap-2 transition-all active:scale-95"
                >
                  <span className="text-xl">👥</span>
                  <div>
                    <div className="text-xs font-black text-emerald-200">{isRtl ? 'دعوت دوستان' : 'Invite & Earn'}</div>
                    <div className="text-[10px] text-slate-400">{isRtl ? 'پاداش و سکه رایگان' : 'Earn free coins'}</div>
                  </div>
                </button>

                {/* 5. VIP Store */}
                <button
                  onClick={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsStoreModalOpen(true);
                    soundEngine.playTap?.();
                  }}
                  className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-start flex flex-col justify-between gap-2 transition-all active:scale-95"
                >
                  <span className="text-xl">🛍️</span>
                  <div>
                    <div className="text-xs font-black text-amber-200">{isRtl ? 'فروشگاه اقلام' : 'Zen Store'}</div>
                    <div className="text-[10px] text-slate-400">{isRtl ? 'قاب، تم و عناوین خاص' : 'Frames & Titles'}</div>
                  </div>
                </button>

                {/* 6. Soul Bond Partner */}
                <button
                  onClick={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsSoulBondModalOpen(true);
                    soundEngine.playTap?.();
                  }}
                  className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 hover:border-rose-400 text-start flex flex-col justify-between gap-2 transition-all active:scale-95"
                >
                  <span className="text-xl">💍</span>
                  <div>
                    <div className="text-xs font-black text-rose-200">{isRtl ? 'پارتنر و پیوند' : 'Soul Bond'}</div>
                    <div className="text-[10px] text-slate-400">{isRtl ? 'پیوند هم‌فرکانس معنوی' : 'Spiritual Connection'}</div>
                  </div>
                </button>

                {/* 7. Radio Widget */}
                <button
                  onClick={() => {
                    setShowRadioWidget(r => !r);
                    setIsFeaturesMenuOpen(false);
                    soundEngine.playTap?.();
                  }}
                  className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-start flex flex-col justify-between gap-2 transition-all active:scale-95"
                >
                  <span className="text-xl">📻</span>
                  <div>
                    <div className="text-xs font-black text-cyan-200">{isRtl ? 'رادیو همگام' : 'Sync Radio'}</div>
                    <div className="text-[10px] text-slate-400">{showRadioWidget ? (isRtl ? 'بستن رادیو' : 'Hide Radio') : (isRtl ? 'پخش رادیو زنده' : 'Show Radio')}</div>
                  </div>
                </button>

                {/* 8. Admin Panel (If unlocked) */}
                {isAdminUnlocked && (
                  <button
                    onClick={() => {
                      setIsFeaturesMenuOpen(false);
                      setIsAdminPanelOpen(true);
                      soundEngine.playTap?.();
                    }}
                    className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400 text-start flex flex-col justify-between gap-2 transition-all active:scale-95 col-span-2"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="text-amber-400" size={18} />
                      <span className="text-xs font-black text-amber-300">{isRtl ? 'پنل مدیریت ارشد' : 'Admin Panel'}</span>
                    </div>
                  </button>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
