import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MessageSquare, Users, Globe, Hash, Shield, Lock, 
  Send, UserPlus, Zap, Activity, Heart, Coins, MoreVertical, X, 
  MessagesSquare, FileText, PlusCircle, Smile, Reply, CornerDownRight, 
  Sparkles, AtSign, Eye, EyeOff, Check, UserCheck, Flame, Volume2
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useMultiplayerStore from '../store/multiplayerStore';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';

const ROOMS = [
  { id: 'general', nameFa: 'لابی عمومی', nameEn: 'General Lobby', icon: <Globe className="w-4 h-4 text-blue-400" /> },
  { id: 'tech', nameFa: 'فناوری و کد', nameEn: 'Tech & Code', icon: <Hash className="w-4 h-4 text-emerald-400" /> },
  { id: 'philosophy', nameFa: 'فلسفه و خودشناسی', nameEn: 'Philosophy', icon: <Zap className="w-4 h-4 text-purple-400" /> },
  { id: 'business', nameFa: 'کسب‌و‌کار و ثروت', nameEn: 'Business', icon: <Shield className="w-4 h-4 text-amber-400" /> },
  { id: 'fitness', nameFa: 'ورزش و سلامت', nameEn: 'Fitness', icon: <Activity className="w-4 h-4 text-rose-400" /> },
  { id: 'vip', nameFa: 'اتاق اعضای ویژه', nameEn: 'VIP Lounge', icon: <Lock className="w-4 h-4 text-fuchsia-400" />, locked: true },
  { id: 'support', nameFa: 'پشتیبانی راهنما', nameEn: 'Support', icon: <MessageSquare className="w-4 h-4 text-sky-400" /> },
];

const FLASH_EMOJIS = ['🔥', '❤️', '👏', '🌟', '💎', '🚀', '👑', '🧘', '🌸', '⚔️', '💯', '✨', '☕', '💡', '🏆', '🎯'];

const QUICK_PHRASES = [
  'درود و وقت بخیر به همه دوستان 🌟',
  'استمرار و تمرکز کلید پیروزیه! 🔥',
  'نکته بسیار هوشمندانه و عالی بود 💡',
  'موافقم، با تمام انرژی ادامه بده! 🚀',
  'آرامش در لحظه حال جاریه 🧘',
  'دمت گرم رفیق، موفق باشی 👏'
];

export default function ChatRooms() {
  const { language, coins, addCoins } = useAppStore();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const { 
    userId, userName, userAvatar, setUserName, setUserAvatar,
    networkStatus, activeRelayCount,
    onlineUsers, globalChat, forumThreads,
    directMessages, activeDmUserId, setActiveDmUserId, sendDirectMessage,
    pingUsers, sendGlobalMessage, likeMessage, tipMessage, addForumThread 
  } = useMultiplayerStore();

  const [activeRoom, setActiveRoom] = useState('general');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'dm' | 'forum'
  
  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(!userName || userName.startsWith('User'));
  const [tempName, setTempName] = useState(userName || '');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Whisper (نجوا) & Reply state
  const [whisperTarget, setWhisperTarget] = useState(null); // { id, name, avatar }
  const [replyingTo, setReplyingTo] = useState(null); // { id, userName, text }

  // Mobile drawers
  const [isMobileUsersOpen, setIsMobileUsersOpen] = useState(false);

  const AVATARS = ['🌟', '👑', '🦁', '💎', '🚀', '🌌', '🧘', '🌸', '⚔️', '🦅', '🔥', '⚡', '🏆', '🌿', '🎯'];

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');

  const chatEndRef = useRef(null);
  const dmEndRef = useRef(null);

  useEffect(() => {
    pingUsers();
    const interval = setInterval(pingUsers, 5000);
    return () => clearInterval(interval);
  }, [pingUsers]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalChat, activeRoom, activeTab]);

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
    
    const targetUser = onlineUsers.find(u => u.id === activeDmUserId) || { id: activeDmUserId, name: 'کاربر' };
    sendDirectMessage(activeDmUserId, targetUser.name, dmInput.trim());
    setDmInput('');
    soundEngine.playTap?.();
    haptics.tap?.();
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
      category: activeRoom
    });
    setNewThreadTitle('');
    setIsNewThreadModalOpen(false);
    soundEngine.playCheckmark?.();
    haptics.success?.();
  };

  // Filter messages for current room and respect whisper privacy
  const roomMessages = globalChat.filter(m => {
    const isThisRoom = m.roomId === activeRoom || m.text.startsWith(`[${activeRoom}]`);
    if (!isThisRoom) return false;
    // Whisper filter: only show if public, or if current user is sender or target
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

  return (
    <div className="w-full h-[calc(100dvh-75px)] relative overflow-hidden bg-[var(--bg-primary)] flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <Globe className="w-96 h-96 text-purple-500" />
      </div>

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
              <h1 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400 leading-tight">
                {isRtl ? 'چت‌روم زنده و جامعه' : 'Live Community'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {networkStatus === 'connected' ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isRtl ? 'شبکه زنده جهانی' : 'Live Net'}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>{isRtl ? 'در حال اتصال...' : 'Connecting...'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
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
                <div className="absolute top-10 left-0 sm:right-0 z-50 p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl grid grid-cols-5 gap-1.5 w-48 backdrop-blur-xl">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      onClick={() => {
                        setUserAvatar(av);
                        setIsAvatarPickerOpen(false);
                        soundEngine.playTap?.();
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base hover:scale-110 transition-transform ${userAvatar === av ? 'bg-purple-600/30 border border-purple-500' : 'hover:bg-white/10'}`}
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

        {/* Mobile Horizontal Channels Strip */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto no-scrollbar py-1 shrink-0 mb-1">
          {ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => !room.locked && setActiveRoom(room.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all ${
                activeRoom === room.id
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm scale-102'
                  : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)]'
              } ${room.locked ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <span>{room.icon}</span>
              <span>{isRtl ? room.nameFa : room.nameEn}</span>
            </button>
          ))}
        </div>

        {/* Main Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 relative pb-1">
          
          {/* Desktop Left Sidebar: Rooms & Online Users */}
          <div className="hidden md:flex w-60 shrink-0 flex-col gap-3 overflow-y-auto no-scrollbar pb-2">
            <h3 className="text-[10px] font-black text-[var(--text-secondary)] px-1 uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={12} />
              {isRtl ? 'کانال‌های گفتگو' : 'Channels'}
            </h3>
            
            <div className="space-y-1.5">
              {ROOMS.map(room => (
                <button
                  key={room.id}
                  onClick={() => !room.locked && setActiveRoom(room.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all border text-start group ${
                    activeRoom === room.id
                      ? 'bg-purple-600/20 border-purple-500/50 text-[var(--text-primary)] shadow-md font-bold'
                      : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/30'
                  } ${room.locked ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-xl transition-colors ${activeRoom === room.id ? 'bg-purple-500/30' : 'bg-slate-800/40'}`}>
                      {room.icon}
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
                    <span>{isRtl ? 'کاربران آنلاین' : 'Online Users'}</span>
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
                      {u.isReal && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat/Forum Area */}
          <div className="flex-1 flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl min-h-0 relative">
            
            {/* Top Bar Navigation Tabs */}
            <div className="flex items-center border-b border-[var(--border)] bg-[var(--bg-secondary)] shrink-0">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all border-b-2 ${
                  activeTab === 'chat' ? 'border-purple-500 text-purple-500 bg-purple-500/10' : 'border-transparent text-[var(--text-secondary)] hover:bg-white/5'
                }`}
              >
                <MessagesSquare size={15} />
                <span>{isRtl ? 'اتاق‌های گفتگو' : 'Live Rooms'}</span>
              </button>
              <button 
                onClick={() => setActiveTab('dm')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all border-b-2 relative ${
                  activeTab === 'dm' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-[var(--text-secondary)] hover:bg-white/5'
                }`}
              >
                <MessageSquare size={15} />
                <span>{isRtl ? 'پیام خصوصی' : 'Direct Msg'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
              <button 
                onClick={() => setActiveTab('forum')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all border-b-2 ${
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
                {/* Messages List Area */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-3 scroll-smooth no-scrollbar">
                  {roomMessages.length === 0 ? (
                    <div className="m-auto flex flex-col items-center justify-center text-center opacity-60 space-y-2 py-8">
                      <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <MessageSquare size={28} />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{isRtl ? 'آغازگر این اتاق باشید!' : 'Start the room conversation!'}</h3>
                      <p className="text-xs text-[var(--text-secondary)] max-w-xs">{isRtl ? 'پیامی ارسال کنید تا سایر کاربران آنلاین پاسخ دهند.' : 'Send a message to connect with others.'}</p>
                    </div>
                  ) : (
                    roomMessages.map(msg => {
                      const isMe = msg.userName === userName;
                      const isWhisper = msg.isWhisper;

                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id} 
                          className={`flex gap-2.5 max-w-[92%] sm:max-w-[85%] ${msg.isSystem ? 'mx-auto' : (isMe ? 'self-end flex-row-reverse' : 'self-start')}`}
                        >
                          {msg.isSystem ? (
                            <div className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold text-center">
                              {msg.text}
                            </div>
                          ) : (
                            <>
                              {/* Avatar */}
                              <button
                                onClick={() => setSelectedUser({ id: msg.userId, name: msg.userName, avatar: msg.userAvatar })}
                                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-black text-white shadow-xs ${
                                  isMe 
                                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600' 
                                    : (isWhisper ? 'bg-gradient-to-br from-fuchsia-600 to-purple-800 border border-fuchsia-400' : 'bg-slate-800 border border-slate-700')
                                }`}
                              >
                                {msg.userAvatar || (isMe ? userAvatar : (msg.userName?.charAt(0).toUpperCase() || '👤'))}
                              </button>

                              {/* Bubble Content */}
                              <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-1.5 px-1">
                                  <span className={`text-[11px] font-bold ${isMe ? 'text-purple-400 font-black' : 'text-[var(--text-secondary)]'}`}>
                                    {msg.userName} {isMe && <span className="text-[9px] opacity-75">(شما)</span>}
                                  </span>

                                  {/* Whisper Tag */}
                                  {isWhisper && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-fuchsia-500/20 text-fuchsia-300 text-[9px] font-black border border-fuchsia-500/40 flex items-center gap-0.5">
                                      <Lock size={9} />
                                      <span>{isMe ? `نجوا به ${msg.whisperTargetName}` : `نجوا از ${msg.userName}`}</span>
                                    </span>
                                  )}

                                  <span className="text-[9px] text-[var(--text-secondary)] opacity-60">• {formatTime(msg.timestamp)}</span>
                                </div>

                                {/* Quoted Reply if any */}
                                {msg.replyTo && (
                                  <div className="px-3 py-1.5 rounded-xl bg-black/20 border-r-2 border-purple-500 text-[10px] text-[var(--text-secondary)] max-w-full truncate flex items-center gap-1">
                                    <CornerDownRight size={10} className="text-purple-400 shrink-0" />
                                    <span className="font-bold text-purple-300">{msg.replyTo.userName}:</span>
                                    <span className="truncate">{msg.replyTo.text}</span>
                                  </div>
                                )}

                                <div className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm break-words max-w-full ${
                                  isWhisper
                                    ? 'bg-gradient-to-r from-fuchsia-950/80 to-purple-950/80 border border-fuchsia-500/50 text-fuchsia-100'
                                    : (isMe 
                                      ? 'bg-purple-600 text-white rounded-tr-sm' 
                                      : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm')
                                }`}>
                                  {msg.text.replace(`[${activeRoom}] `, '')}
                                </div>

                                {/* Quick Reactions & Actions */}
                                <div className="flex items-center gap-2 px-1 text-[10px] text-[var(--text-secondary)]">
                                  <button 
                                    onClick={() => handleLike(msg.id)} 
                                    className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                                  >
                                    <Heart size={11} className={msg.likes > 0 ? "fill-rose-500 text-rose-500" : ""} />
                                    <span>{msg.likes || 0}</span>
                                  </button>

                                  <button 
                                    onClick={() => handleTip(msg.id)} 
                                    className="flex items-center gap-0.5 text-amber-400 hover:text-amber-300 transition-colors font-bold"
                                  >
                                    <span>🪙</span>
                                    <span>{msg.tips ? `+${msg.tips}` : 'پاداش'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setReplyingTo({ id: msg.id, userName: msg.userName, text: msg.text });
                                      soundEngine.playTap?.();
                                    }}
                                    className="hover:text-purple-400 transition-colors flex items-center gap-0.5"
                                  >
                                    <Reply size={11} />
                                    <span>{isRtl ? 'پاسخ' : 'Reply'}</span>
                                  </button>

                                  {!isMe && (
                                    <button
                                      onClick={() => handleStartWhisper({ id: msg.userId, name: msg.userName, avatar: msg.userAvatar })}
                                      className="hover:text-fuchsia-400 transition-colors flex items-center gap-0.5 text-fuchsia-400/80"
                                      title={isRtl ? 'ارسال نجوای خصوصی' : 'Whisper'}
                                    >
                                      <Lock size={10} />
                                      <span>{isRtl ? 'نجوا' : 'Whisper'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply Banner / Whisper Active Banner */}
                <div className="shrink-0 px-3 bg-[var(--bg-secondary)]/90 border-t border-[var(--border)]">
                  {replyingTo && (
                    <div className="py-1.5 flex items-center justify-between text-xs text-purple-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Reply size={13} className="shrink-0" />
                        <span>{isRtl ? `در حال پاسخ به @${replyingTo.userName}:` : `Replying to @${replyingTo.userName}:`}</span>
                        <span className="text-[var(--text-secondary)] truncate">"{replyingTo.text.slice(0, 40)}..."</span>
                      </div>
                      <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-rose-400">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {whisperTarget && (
                    <div className="py-1.5 flex items-center justify-between text-xs text-fuchsia-400 border-t border-fuchsia-500/20">
                      <div className="flex items-center gap-1.5 truncate">
                        <Lock size={13} className="shrink-0" />
                        <span>{isRtl ? `🔒 در حال ارسال نجوای خصوصی به @${whisperTarget.name}` : `Whispering to @${whisperTarget.name}`}</span>
                      </div>
                      <button onClick={() => setWhisperTarget(null)} className="p-1 hover:text-rose-400">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Emoji Reaction Bar */}
                <div className="shrink-0 px-3 py-1.5 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {FLASH_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleSendQuickEmoji(emoji)}
                      className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] hover:bg-purple-600/20 flex items-center justify-center text-sm active:scale-125 transition-transform shrink-0"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsEmojiPickerOpen(o => !o)}
                    className="px-2.5 py-1 rounded-lg bg-purple-600/15 border border-purple-500/30 text-[10px] font-bold text-purple-400 hover:bg-purple-600/30 shrink-0 flex items-center gap-1"
                  >
                    <Smile size={12} />
                    <span>{isRtl ? 'بیشتر...' : 'More'}</span>
                  </button>
                </div>

                {/* Full Emoji & Quick Phrases Dropup Modal */}
                {isEmojiPickerOpen && (
                  <div className="p-3 bg-[var(--bg-card)] border-t border-[var(--border)] shadow-xl shrink-0 space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-[var(--text-secondary)]">{isRtl ? 'عبارت‌های سریع و آماده' : 'Quick Wisdom Phrases'}</span>
                      <button onClick={() => setIsEmojiPickerOpen(false)} className="text-[var(--text-secondary)]"><X size={14} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {QUICK_PHRASES.map(p => (
                        <button
                          key={p}
                          onClick={() => handleSendQuickPhrase(p)}
                          className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-purple-600/15 border border-[var(--border)] text-xs text-start text-[var(--text-primary)] font-medium transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input Bar */}
                <form onSubmit={handleSend} className="p-2 sm:p-3 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen(o => !o)}
                    className="p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-purple-400 transition-colors shrink-0"
                    title={isRtl ? 'اموجی‌ها و استیکرها' : 'Emojis'}
                  >
                    <Smile size={18} />
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      whisperTarget 
                        ? (isRtl ? `پیام خصوصی (نجوا) به ${whisperTarget.name}...` : `Whisper to ${whisperTarget.name}...`)
                        : (isRtl ? `پیام در #${ROOMS.find(r=>r.id===activeRoom)?.nameFa || 'اتاق'}...` : `Message #${activeRoom}...`)
                    }
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

            {/* TAB CONTENT: DIRECT MESSAGES (DMs) */}
            {activeTab === 'dm' && (
              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* DM Peers Sidebar */}
                <div className="w-full md:w-52 border-b md:border-b-0 md:border-l border-[var(--border)] bg-[var(--bg-secondary)]/50 p-2 overflow-x-auto md:overflow-y-auto no-scrollbar flex md:flex-col gap-1.5 shrink-0">
                  <div className="text-[10px] font-black text-[var(--text-secondary)] px-2 py-1 uppercase hidden md:block">
                    {isRtl ? 'مخاطبین و مربیان' : 'Contacts'}
                  </div>
                  {onlineUsers.map(peer => {
                    const isCurrent = activeDmUserId === peer.id;
                    return (
                      <button
                        key={peer.id}
                        onClick={() => {
                          setActiveDmUserId(peer.id);
                          soundEngine.playTap?.();
                        }}
                        className={`p-2 rounded-2xl border flex items-center gap-2 transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
                          isCurrent 
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-bold shadow-xs' 
                            : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs shrink-0">
                          {peer.avatar || '👤'}
                        </div>
                        <div className="text-start">
                          <div className="text-xs font-bold leading-tight">{peer.name}</div>
                          <span className="text-[9px] text-[var(--text-secondary)] opacity-70 hidden md:block truncate">{peer.role}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* DM Active Conversation Area */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* DM Header */}
                  <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                        {onlineUsers.find(u => u.id === activeDmUserId)?.avatar || '👤'}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                          {onlineUsers.find(u => u.id === activeDmUserId)?.name || 'گفتگوی خصوصی'}
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {isRtl ? 'آنلاین و آماده گفتگو' : 'Online'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartWhisper(onlineUsers.find(u => u.id === activeDmUserId))}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1 hover:bg-purple-600/25"
                    >
                      <Lock size={12} />
                      <span>{isRtl ? 'نجوا در چت عمومی' : 'Whisper'}</span>
                    </button>
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
                            ? 'bg-indigo-600 text-white rounded-tr-sm' 
                            : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm'
                        }`}>
                          <p>{msg.text}</p>
                          <span className="text-[9px] opacity-70 block text-end mt-1">{formatTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={dmEndRef} />
                  </div>

                  {/* DM Input Bar */}
                  <form onSubmit={handleSendDm} className="p-2 sm:p-3 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={dmInput}
                      onChange={(e) => setDmInput(e.target.value)}
                      placeholder={isRtl ? `پیام خصوصی به ${onlineUsers.find(u => u.id === activeDmUserId)?.name || 'کاربر'}...` : 'Type private message...'}
                      className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!dmInput.trim()}
                      className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0"
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
                          #{ROOMS.find(r => r.id === thread.category)?.nameFa || thread.category}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">{thread.date}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] leading-snug mb-2">{thread.title}</h4>
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                        <span className="font-bold">{isRtl ? `نویسنده: ${thread.author}` : `By: ${thread.author}`}</span>
                        <div className="flex items-center gap-3">
                          <span>❤️ {thread.likes || 0}</span>
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

      {/* Mobile Online Users Drawer (Slide from Bottom / Sheet) */}
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
                  <span>{isRtl ? 'کاربران و مربیان آنلاین' : 'Online Members'} ({onlineUsers.length + 1})</span>
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
                        <span className="text-[9px] text-[var(--text-secondary)]">{u.role}</span>
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

      {/* User Action Modal (Whisper, DM, Mention, Add Friend) */}
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
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md">
                    {selectedUser.avatar || '👤'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-primary)]">{selectedUser.name}</h3>
                    <span className="text-[10px] text-[var(--text-secondary)]">{selectedUser.role || 'کاربر زندگی‌ساز'}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-1 text-[var(--text-secondary)]"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleStartWhisper(selectedUser)}
                  className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Lock size={13} />
                  <span>{isRtl ? 'ارسال نجوای خصوصی' : 'Whisper'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('dm');
                    setActiveDmUserId(selectedUser.id);
                    setSelectedUser(null);
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <MessageSquare size={13} />
                  <span>{isRtl ? 'پیام دایرکت' : 'Direct Message'}</span>
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

      {/* New Forum Thread Modal */}
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
    </div>
  );
}
