import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MessageSquare, Users, Globe, Hash, Shield, Lock, 
  Send, UserPlus, Zap, Activity, Heart, Coins, MoreVertical, X, 
  MessagesSquare, FileText, PlusCircle, Smile, Reply, CornerDownRight, 
  Sparkles, AtSign, Eye, EyeOff, Check, UserCheck, Flame, Volume2, Gamepad2,
  Bell, BellRing, Settings, Crown, Trash2, Ban, MicOff, Key, Radio, Compass, RefreshCw
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useMultiplayerStore from '../store/multiplayerStore';
import { COMPANION_PERSONAS } from '../services/companionAI';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';

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

export const MATCH_COMPANIONS = Object.values(COMPANION_PERSONAS);

export default function ChatRooms() {
  const { language, coins, addCoins } = useAppStore();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const { 
    userId, userName, userAvatar, setUserName, setUserAvatar,
    networkStatus, activeRelayCount,
    onlineUsers, globalChat, forumThreads,
    customRooms, addCustomRoom, deleteCustomRoom,
    userBadges, setUserBadge, muteUser, deleteChatMessage, purgeRoomChat,
    isAdminUnlocked, unlockAdmin,
    directMessages, activeDmUserId, setActiveDmUserId, sendDirectMessage,
    unreadDmCounts, incomingDmToast, dismissIncomingDmToast,
    isCompanionTyping,
    pingUsers, sendGlobalMessage, likeMessage, tipMessage, addForumThread 
  } = useMultiplayerStore();

  const [activeRoom, setActiveRoom] = useState('general');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'match' | 'dm' | 'forum'
  
  // Secret Admin Modal & Trigger
  const [adminClicks, setAdminClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('rooms'); // 'rooms' | 'users' | 'badges' | 'moderation' | 'logs'
  
  // New Room Form in Admin
  const [newRoomFa, setNewRoomFa] = useState('');
  const [newRoomEn, setNewRoomEn] = useState('');
  const [newRoomIcon, setNewRoomIcon] = useState('Hash');
  const [newRoomLocked, setNewRoomLocked] = useState(false);

  // Matchmaking & Companions State
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
  
  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(!userName || userName.startsWith('User'));
  const [tempName, setTempName] = useState(userName || '');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Whisper & Reply
  const [whisperTarget, setWhisperTarget] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  // Mobile drawers
  const [isMobileUsersOpen, setIsMobileUsersOpen] = useState(false);

  const AVATARS = ['🌟', '👑', '🦁', '💎', '🚀', '🌌', '🧘', '🌸', '⚔️', '🦅', '🔥', '⚡', '🏆', '🌿', '🎯', '🪐', '🦄', '🕊️'];

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('philosophy');

  const chatEndRef = useRef(null);
  const dmEndRef = useRef(null);

  // Total unread DMs count
  const totalUnreadCount = Object.values(unreadDmCounts || {}).reduce((a, b) => a + b, 0);

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

  // Secret Admin Trigger on Triple Click
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

  const handleStartDmWithCompanion = (companion) => {
    setActiveDmUserId(companion.id);
    setActiveTab('dm');
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleInviteToGame = (companion) => {
    soundEngine.playCheckmark?.();
    haptics.tap?.();
    const cleanName = (companion.name || 'SOUL').replace(/\s+/g, '-');
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
    sendGlobalMessage(isRtl ? `✨ ${myMatchName} پروفایل هم‌فرکانسی و دوستیابی خود را در شبکه فعال کرد!` : `✨ ${myMatchName} published their soul match profile!`, 'general', true);
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

  const handleStartWhisper = (user) => {
    setWhisperTarget(user);
    setSelectedUser(null);
    setIsMobileUsersOpen(false);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleMentionUser = (user) => {
    setChatInput(prev => `${prev} @${user.name} `);
    setSelectedUser(null);
    setIsMobileUsersOpen(false);
    soundEngine.playTap?.();
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

  // Filter messages for current room and respect whisper privacy
  const roomMessages = globalChat.filter(m => {
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

  // Filtered companions
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

  return (
    <div className="w-full h-[calc(100dvh-75px)] relative overflow-hidden bg-[var(--bg-primary)] flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg shadow-md shrink-0">
                {incomingDmToast.senderAvatar || '👤'}
              </div>
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
                <h1 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400 leading-tight group-hover:scale-101 transition-transform flex items-center gap-1.5">
                  <span>{isRtl ? 'جامعه، چت زنده و دوستیابی' : 'Live Sanctuary & Soul Match'}</span>
                  {isAdminUnlocked && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">👑 ادمین</span>}
                </h1>
              </button>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isRtl ? 'شبکه زنده و متصل' : 'Live & Connected'} ({activeRelayCount || 1} سرور)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            {/* Admin Panel Quick Button if Unlocked */}
            {isAdminUnlocked && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
                title="پنل مدیریت ارشد"
              >
                <Crown size={14} className="text-amber-400" />
                <span className="hidden sm:inline">پنل مدیریت</span>
              </button>
            )}

            {/* Mobile Online Users Toggle Button */}
            <button
              onClick={() => setIsMobileUsersOpen(o => !o)}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-300 font-bold text-xs shadow-sm active:scale-95"
            >
              <Users size={13} />
              <span>{onlineUsers.length + 1}</span>
            </button>

            {/* Coins badge */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs shadow-inner">
              <Coins size={14} />
              <span>{coins}</span>
            </div>

            {/* Avatar Picker */}
            <div className="relative">
              <button
                onClick={() => setIsAvatarPickerOpen(o => !o)}
                className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-purple-500 flex items-center justify-center text-sm shadow-xs transition-all"
                title={isRtl ? 'تغییر آواتار' : 'Change Avatar'}
              >
                {userAvatar || '🌟'}
              </button>
              {isAvatarPickerOpen && (
                <div className="absolute top-10 left-0 sm:right-0 z-50 p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl grid grid-cols-6 gap-1.5 w-52 backdrop-blur-xl">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      onClick={() => {
                        setUserAvatar(av);
                        setIsAvatarPickerOpen(false);
                        soundEngine.playTap?.();
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-base hover:scale-110 transition-transform ${userAvatar === av ? 'bg-purple-600/30 border border-purple-500' : 'hover:bg-white/10'}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              )}
            </div>

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

        {/* Mobile Horizontal Channels Strip (Shown only in Chat Tab) */}
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
          
          {/* Desktop Left Sidebar: Rooms & Online Users (Visible on Desktop) */}
          <div className="hidden md:flex w-60 flex-col gap-2 shrink-0 h-full overflow-hidden">
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
            
            {/* Online Users Box */}
            <div className="mt-auto pt-2">
              <div className="p-3.5 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] to-slate-900/40 shadow-inner">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isRtl ? 'همراهان آنلاین' : 'Online Companions'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                    {onlineUsers.length + 1}
                  </span>
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  <span className="text-[11px] font-bold px-2 py-1 bg-purple-950/50 text-purple-200 rounded-xl border border-purple-500/40 flex items-center gap-1">
                    <span>{userAvatar || '🌟'}</span>
                    <span>{userName}</span>
                    <span className="text-[9px] opacity-75">(شما)</span>
                  </span>
                  {onlineUsers.map(u => (
                    <button 
                      key={u.id} 
                      onClick={() => setSelectedUser(u)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-xl border flex items-center gap-1 transition-all ${
                        u.isReal 
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50 shadow-xs' 
                          : 'bg-slate-800/60 text-slate-300 border-white/5 hover:bg-slate-700'
                      }`}
                    >
                      <span>{u.avatar || '👤'}</span>
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

                {/* Messages Timeline */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 no-scrollbar">
                  {roomMessages.map(msg => {
                    const isMe = msg.userId === userId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-1 max-w-[90%] sm:max-w-[80%] ${isMe ? 'self-end mr-auto items-end' : 'self-start ml-auto items-start'}`}
                      >
                        {/* Sender info & Badge */}
                        {!isMe && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] px-1">
                            <span className="text-sm">{msg.userAvatar || '👤'}</span>
                            <span className="font-black text-[var(--text-primary)]">{msg.userName}</span>
                            {msg.userRole && msg.userRole !== 'عضو جامعه' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                                {msg.userRole}
                              </span>
                            )}
                            <span className="text-[9px] opacity-70">{formatTime(msg.timestamp)}</span>
                          </div>
                        )}

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

                          <p>{msg.text}</p>

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
                              {isAdminUnlocked && (
                                <button onClick={() => deleteChatMessage(msg.id)} className="text-rose-400 hover:text-rose-300" title="حذف توسط ادمین">
                                  <Trash2 size={12} />
                                </button>
                              )}
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
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{userAvatar || '🌟'}</span>
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
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                              {companion.avatar}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                                <span>{companion.name}</span>
                                {companion.age && <span className="text-[10px] text-[var(--text-secondary)] font-normal">({companion.age} ساله • {companion.city})</span>}
                              </h4>
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
                            onClick={() => handleStartDmWithCompanion(companion)}
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
                <div className="w-full md:w-56 border-b md:border-b-0 md:border-l border-[var(--border)] bg-[var(--bg-secondary)]/50 p-2 overflow-x-auto md:overflow-y-auto no-scrollbar flex md:flex-col gap-1.5 shrink-0">
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
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm shrink-0 shadow-sm">
                            {peer.avatar || '👤'}
                          </div>
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
                      <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-base font-bold shadow-xs">
                        {activePeer?.avatar || '👤'}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                          {activePeer?.name || 'گفتگوی خصوصی'}
                        </h4>
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
                        <span className="text-xl">{userAvatar || '🌟'}</span>
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
                          <span className="text-xl">{u.avatar || '👤'}</span>
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
                            onClick={() => muteUser(u.id)}
                            className="px-2.5 py-1 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-600/40"
                          >
                            بی‌صدا 🔇
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
                            <span className="text-lg">{u.avatar || '👤'}</span>
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
                <div className="p-2.5 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{userAvatar || '🌟'}</span>
                    <span className="text-xs font-black text-purple-300">{userName} (شما)</span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-bold">فعال</span>
                </div>

                {onlineUsers.map(u => (
                  <div 
                    key={u.id}
                    className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{u.avatar || '👤'}</span>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">{u.name}</div>
                        <span className="text-[9px] text-[var(--text-secondary)]">{u.role || u.chakra}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartWhisper(u)}
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

      {/* USER ACTION MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/30 flex items-center justify-center text-xl">
                    {selectedUser.avatar || '👤'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-primary)]">{selectedUser.name}</h3>
                    <span className="text-[10px] text-[var(--text-secondary)]">{selectedUser.role || selectedUser.chakra}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-[var(--text-secondary)]"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  onClick={() => {
                    setActiveTab('dm');
                    setActiveDmUserId(selectedUser.id);
                    setSelectedUser(null);
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <MessageSquare size={13} />
                  <span>{isRtl ? 'گفتگوی خصوصی' : 'Direct Message'}</span>
                </button>

                <button
                  onClick={() => handleStartWhisper(selectedUser)}
                  className="py-2.5 px-3 rounded-2xl bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/40 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Lock size={13} />
                  <span>{isRtl ? 'ارسال نجوا' : 'Whisper'}</span>
                </button>

                <button
                  onClick={() => handleMentionUser(selectedUser)}
                  className="py-2.5 px-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-1.5 hover:border-purple-500/40"
                >
                  <AtSign size={13} />
                  <span>{isRtl ? 'منشن در چت' : 'Mention'}</span>
                </button>

                <button
                  onClick={() => {
                    sendGlobalMessage(isRtl ? `🔹 ${userName} به ${selectedUser.name} درخواست دوستی فرستاد!` : `🔹 ${userName} sent a friend request to ${selectedUser.name}!`, activeRoom, true);
                    setSelectedUser(null);
                    soundEngine.playLevelUp?.();
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:border-emerald-500/40"
                >
                  <UserPlus size={13} />
                  <span>{isRtl ? 'درخواست دوستی' : 'Add Friend'}</span>
                </button>
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

    </div>
  );
}
