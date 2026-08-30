import { create } from 'zustand';
import realtimeNetwork from '../services/realtimeNetwork';
import { COMPANION_PERSONAS, generateCompanionReply } from '../services/companionAI';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';

// Persistent user identity
const savedId = localStorage.getItem('life_os_user_id') || ('user_' + Math.random().toString(36).substr(2, 9));
localStorage.setItem('life_os_user_id', savedId);

const rawSavedName = localStorage.getItem('life_os_user_name');
const savedName = (rawSavedName && rawSavedName.length < 30 && !rawSavedName.startsWith('data:image/'))
  ? rawSavedName
  : ('کاربر ' + Math.floor(100 + Math.random() * 900));
const savedAvatar = localStorage.getItem('life_os_user_avatar') || '🌟';

let channel = null;
try {
  channel = new BroadcastChannel('life-os-multiplayer');
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment.');
}

const DEFAULT_MENTORS = Object.values(COMPANION_PERSONAS).map(c => ({
  id: c.id,
  name: c.name,
  role: c.role || c.chakra,
  avatar: c.avatar,
  color: 'from-purple-500 to-indigo-600',
  isMentor: true,
  isReal: true,
  status: c.status,
  currentRoom: 'general',
  lastSeen: Date.now()
}));

const loadSavedDms = () => {
  try {
    const saved = localStorage.getItem('zen_direct_messages');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return {
    'companion_sara': [
      { id: 'dm_sara_1', senderId: 'companion_sara', senderName: 'سارا (آناهیتا)', senderAvatar: '🌸', text: 'سلام دوست خوبم! به دنیای هم‌فرکانس‌ها خوش اومدی 🌸 هر زمان دوست داشتی درباره مراقبه، کتاب یا رشد فردی گپ بزنیم من اینجام!', timestamp: new Date(Date.now() - 3600000).toISOString(), isMe: false }
    ],
    'companion_arash': [
      { id: 'dm_arash_1', senderId: 'companion_arash', senderName: 'آرش کیهان', senderAvatar: '🚀', text: 'درود! اگر اهل بیزینس، استراتژی و بازی‌های فکری مثل تخته‌نرد و شطرنج هستی، می‌تونیم با هم رقابت‌های جذابی داشته باشیم 🚀', timestamp: new Date(Date.now() - 7200000).toISOString(), isMe: false }
    ],
    'companion_niloofar': [
      { id: 'dm_niloofar_1', senderId: 'companion_niloofar', senderName: 'نیلوفر زاد', senderAvatar: '🧘', text: 'سلام و آرامش 💙 مراقبه امروزت چطور پیش رفت؟ بیا فضای امنی برای به اشتراک گذاشتن حس‌های خوب بسازیم.', timestamp: new Date(Date.now() - 10800000).toISOString(), isMe: false }
    ],
    'companion_reza': [
      { id: 'dm_reza_1', senderId: 'companion_reza', senderName: 'رضا فیتنس', senderAvatar: '🔥', text: 'سلام دلاور! 🔥 برای ساخت عادات فولادی و روتین پرانرژی روی من حساب کن. امروز چه ورزشی داشتی؟', timestamp: new Date(Date.now() - 14400000).toISOString(), isMe: false }
    ],
    'companion_diana': [
      { id: 'dm_diana_1', senderId: 'companion_diana', senderName: 'دیانا ستاره', senderAvatar: '💎', text: 'سلام 💎 فلسفه، هنر و بازی‌های دونفره ذهن رو تازه می‌کنه. مشتاق مصاحبت با افراد خوش‌فکرم ✨', timestamp: new Date(Date.now() - 18000000).toISOString(), isMe: false }
    ]
  };
};

const loadSavedThreads = () => {
  try {
    const saved = localStorage.getItem('zen_forum_threads');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [
    { id: 't1', title: 'تجربه شما از روتین ۵ صبح و معجزه سحرخیزی؟', author: 'سینا', category: 'fitness', replies: 12, likes: 45, date: '۱ ساعت پیش' },
    { id: 't2', title: 'بهترین کتاب فلسفه و رواقی‌گری که مسیر زندگی‌تان را روشن کرد؟', author: 'آریا', category: 'philosophy', replies: 34, likes: 120, date: '۵ ساعت پیش' },
    { id: 't3', title: 'اصول سرمایه‌گذاری مطمئن و قانون ۵۰/۳۰/۲۰ در مدیریت ثروت', author: 'امیرحسین', category: 'business', replies: 8, likes: 15, date: 'دیروز' },
    { id: 't4', title: 'راهکارهای افزایش تمرکز و غلبه بر تعلل در یادگیری و کدنویسی', author: 'فرزاد', category: 'tech', replies: 22, likes: 88, date: '۲ روز پیش' }
  ];
};

const loadSavedRooms = () => {
  try {
    const saved = localStorage.getItem('zen_custom_rooms');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [
    { id: 'general', nameFa: 'لابی عمومی', nameEn: 'General Lobby', icon: 'Globe', category: 'general' },
    { id: 'tech', nameFa: 'فناوری و کد', nameEn: 'Tech & Code', icon: 'Hash', category: 'tech' },
    { id: 'philosophy', nameFa: 'فلسفه و خودشناسی', nameEn: 'Philosophy', icon: 'Zap', category: 'philosophy' },
    { id: 'business', nameFa: 'کسب‌و‌کار و ثروت', nameEn: 'Business', icon: 'Shield', category: 'business' },
    { id: 'fitness', nameFa: 'ورزش و سلامت', nameEn: 'Fitness', icon: 'Activity', category: 'fitness' },
    { id: 'vip', nameFa: 'اتاق اعضای ویژه', nameEn: 'VIP Lounge', icon: 'Lock', category: 'vip', locked: true },
    { id: 'support', nameFa: 'پشتیبانی راهنما', nameEn: 'Support', icon: 'MessageSquare', category: 'support' }
  ];
};

const loadSavedBadges = () => {
  try {
    const saved = localStorage.getItem('zen_user_badges');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return {};
};

const loadSavedIgnored = () => {
  try {
    const saved = localStorage.getItem('zen_ignored_users');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [];
};

const useMultiplayerStore = create((set, get) => {
  const handleIncomingPayload = (data) => {
    if (!data || !data.type) return;

    if (data.type === 'NETWORK_STATUS') {
      set({ 
        networkStatus: data.status,
        activeRelayCount: data.activeRelayCount || 0
      });
    } else if (data.type === 'PRESENCE') {
      if (data.userId && data.userId !== get().userId) {
        set(state => {
          const others = state.onlineUsers.filter(u => u.id !== data.userId);
          const newUser = {
            id: data.userId,
            name: data.userName || 'کاربر مهمان',
            role: state.userBadges[data.userId] || data.role || 'عضو جامعه',
            avatar: data.avatar || '👤',
            color: 'from-sky-500 to-indigo-600',
            lastSeen: Date.now(),
            currentRoom: data.currentRoom || 'general',
            isReal: true
          };
          return {
            onlineUsers: [newUser, ...others]
          };
        });
      }
    } else if (data.type === 'CHAT') {
      set(state => {
        if (state.globalChat.some(m => m.id === data.id)) return state;
        if (state.mutedUserIds.includes(data.userId) || state.bannedUserIds.includes(data.userId)) return state;
        return {
          globalChat: [...state.globalChat, data]
        };
      });
    } else if (data.type === 'DIRECT_MSG') {
      const myId = get().userId;
      if (data.targetUserId === myId) {
        // Ignore if user blocked
        if (get().ignoredUserIds.includes(data.senderId)) return;

        soundEngine.playMessageChime?.();
        haptics.notification?.();

        set(state => {
          const chatKey = data.senderId;
          const existing = state.directMessages[chatKey] || [];
          if (existing.some(m => m.id === data.id)) return state;
          
          const newMsg = {
            id: data.id,
            senderId: data.senderId,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar || '👤',
            text: data.text,
            timestamp: data.timestamp,
            isMe: false
          };
          const next = {
            ...state.directMessages,
            [chatKey]: [...existing, newMsg]
          };
          localStorage.setItem('zen_direct_messages', JSON.stringify(next));

          const currentDmId = state.activeDmUserId;
          const isCurrentlyViewing = currentDmId === chatKey && state.activeTab === 'dm';
          const newUnread = isCurrentlyViewing ? (state.unreadDmCounts[chatKey] || 0) : ((state.unreadDmCounts[chatKey] || 0) + 1);

          return { 
            directMessages: next,
            unreadDmCounts: {
              ...state.unreadDmCounts,
              [chatKey]: newUnread
            },
            incomingDmToast: {
              id: data.id,
              senderId: data.senderId,
              senderName: data.senderName,
              senderAvatar: data.senderAvatar || '👤',
              text: data.text,
              timestamp: data.timestamp
            }
          };
        });
      }
    } else if (data.type === 'LIKE_MSG') {
      set(state => ({
        globalChat: state.globalChat.map(m => m.id === data.msgId ? { ...m, likes: (m.likes || 0) + 1 } : m)
      }));
    } else if (data.type === 'TIP_MSG') {
      set(state => ({
        globalChat: state.globalChat.map(m => m.id === data.msgId ? { ...m, tips: (m.tips || 0) + (data.amount || 5) } : m)
      }));
    } else if (data.type === 'NEW_THREAD') {
      set(state => {
        if (state.forumThreads.some(t => t.id === data.thread.id)) return state;
        const next = [data.thread, ...state.forumThreads];
        localStorage.setItem('zen_forum_threads', JSON.stringify(next));
        return { forumThreads: next };
      });
    } else if (data.type === 'ADMIN_ROOMS_UPDATE') {
      if (data.rooms) {
        set({ customRooms: data.rooms });
        localStorage.setItem('zen_custom_rooms', JSON.stringify(data.rooms));
      }
    } else if (data.type === 'ADMIN_PURGE_ROOM') {
      if (data.roomId) {
        set(state => ({
          globalChat: state.globalChat.filter(m => m.roomId !== data.roomId)
        }));
      }
    } else if (data.type === 'ADMIN_DELETE_MSG') {
      if (data.msgId) {
        set(state => ({
          globalChat: state.globalChat.filter(m => m.id !== data.msgId)
        }));
      }
    } else if (data.type === 'ADMIN_USER_BADGE') {
      if (data.targetUserId && data.badge) {
        set(state => {
          const next = { ...state.userBadges, [data.targetUserId]: data.badge };
          localStorage.setItem('zen_user_badges', JSON.stringify(next));
          return {
            userBadges: next,
            onlineUsers: state.onlineUsers.map(u => u.id === data.targetUserId ? { ...u, role: data.badge } : u)
          };
        });
      }
    } else if (data.type === 'ADMIN_MUTE_USER') {
      if (data.targetUserId) {
        set(state => ({
          mutedUserIds: [...new Set([...state.mutedUserIds, data.targetUserId])]
        }));
      }
    
    } else if (data.type === 'ANIMATED_GIFT') {
      if (data.gift) {
        set({ activeGiftAnimation: data.gift });
        setTimeout(() => {
          set({ activeGiftAnimation: null });
        }, 3500);
      }
    } else if (data.type === 'SOUL_BOND_REQUEST') {
      if (data.targetUserId === get().userId) {
        set({
          incomingSoulBondRequest: {
            senderId: data.senderId,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar
          }
        });
      }
    } else if (data.type === 'SOUL_BOND_ACCEPTED') {
      if (data.targetUserId === get().userId || data.senderId === get().userId) {
        const partner = data.senderId === get().userId 
          ? { id: data.targetUserId, name: data.targetUserName, avatar: data.targetUserAvatar }
          : { id: data.senderId, name: data.senderName, avatar: data.senderAvatar };
        localStorage.setItem('zen_soul_bond', JSON.stringify(partner));
        set({ activeSoulBond: partner, incomingSoulBondRequest: null });
      }
    } else if (data.type === 'TRIVIA_QUESTION') {
      if (data.trivia) {
        set({ activeTrivia: data.trivia });
      }
    } else if (data.type === 'TRIVIA_ANSWER') {
      if (data.winner) {
        set(state => ({
          activeTrivia: state.activeTrivia ? { ...state.activeTrivia, answered: true, winner: data.winner } : null
        }));
      }
    } else if (data.type === 'INGAME_REACTION') {
      if (data.reaction) {
        set({ activeGameReaction: data.reaction });
        setTimeout(() => set({ activeGameReaction: null }), 2500);
      }
    } else if (data.type === 'ADMIN_BAN_USER') {
      if (data.targetUserId) {
        set(state => ({
          bannedUserIds: [...new Set([...state.bannedUserIds, data.targetUserId])],
          globalChat: state.globalChat.filter(m => m.userId !== data.targetUserId)
        }));
      }
    }
  };

  if (channel) {
    channel.onmessage = (event) => {
      handleIncomingPayload(event.data);
    };
  }

  if (typeof window !== 'undefined') {
    setTimeout(() => {
      realtimeNetwork.init(
        { id: savedId, name: savedName, avatar: savedAvatar },
        handleIncomingPayload
      );
    }, 100);
  }

  return {
    userId: savedId,
    userName: savedName,
    userAvatar: savedAvatar,
    networkStatus: 'connecting',
    activeRelayCount: 0,
    activeDmUserId: 'companion_sara',
    isCompanionTyping: false,
    activeTab: 'chat',

    // Unread and Toast Notifications
    unreadDmCounts: {},
    incomingDmToast: null,

    // Ignored / Blocked Users
    ignoredUserIds: loadSavedIgnored(),

    // Admin & Moderation State
    isAdminUnlocked: false,
    customRooms: loadSavedRooms(),
    userBadges: loadSavedBadges(),
    mutedUserIds: [],
    bannedUserIds: [],
    // Animated Gifts & Gifting
    activeGiftAnimation: null,
    
    // Soul Bonds / Virtual Partners
    activeSoulBond: JSON.parse(localStorage.getItem('zen_soul_bond') || 'null'),
    incomingSoulBondRequest: null,

    // Trivia Bot
    activeTrivia: null,

    // In-game Reactions
    activeGameReaction: null,

    // Blind Speed Chat
    blindChatState: {
      status: 'idle', // 'idle' | 'searching' | 'chatting' | 'deciding' | 'matched'
      partner: null,
      timeLeft: 180,
      messages: []
    },


    onlineUsers: [...DEFAULT_MENTORS],

    globalChat: [
      {
        id: 'm_init_1',
        userId: 'companion_sara',
        userName: 'سارا (آناهیتا)',
        userAvatar: '🌸',
        userRole: '🌿 مربی ذن و آرامش',
        roomId: 'general',
        text: 'درود به تمام جویندگان رشد و دانایی! به تالار گفتگوی زنده و جامعه خودشناسی خوش آمدید. 🌟 پیام‌های شما به صورت بلادرنگ در سراسر جهان همگام می‌شود.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 5,
        tips: 0,
        isSystem: false
      },
      {
        id: 'm_init_2',
        userId: 'companion_arash',
        userName: 'آرش کیهان',
        userAvatar: '🚀',
        userRole: '💎 عضو ویژه VIP',
        roomId: 'tech',
        text: 'پومودورو و انضباط سیستماتیک در بخش «امروز من» بازدهی کار و یادگیری رو چند برابر می‌کنه! امتحانش کردید؟ 💼',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        likes: 4,
        tips: 5,
        isSystem: false
      },
      {
        id: 'm_init_3',
        userId: 'companion_niloofar',
        userName: 'نیلوفر زاد',
        userAvatar: '🧘',
        userRole: '🌸 همراه مراقبه',
        roomId: 'philosophy',
        text: 'آرامش درونی از تسلط بر واکنش‌های خودمان سرچشمه می‌گیرد، نه از تلاش برای کنترل دنیای بیرون. 🌿',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        likes: 9,
        tips: 10,
        isSystem: false
      }
    ],

    directMessages: loadSavedDms(),
    forumThreads: loadSavedThreads(),

    activeGameId: null,
    gameState: null,

    dismissIncomingDmToast: () => set({ incomingDmToast: null }),
    
    clearUnreadForPeer: (peerId) => {
      set(state => ({
        unreadDmCounts: {
          ...state.unreadDmCounts,
          [peerId]: 0
        }
      }));
    },

    toggleIgnoreUser: (targetUserId) => {
      set(state => {
        const isIgnored = state.ignoredUserIds.includes(targetUserId);
        const next = isIgnored 
          ? state.ignoredUserIds.filter(id => id !== targetUserId)
          : [...state.ignoredUserIds, targetUserId];
        localStorage.setItem('zen_ignored_users', JSON.stringify(next));
        soundEngine.playTap?.();
        return { ignoredUserIds: next };
      });
    },

    setActiveTabState: (tab) => set({ activeTab: tab }),

    unlockAdmin: (pin) => {
      if (pin === '979797') {
        set({ isAdminUnlocked: true });
        soundEngine.playLevelUp?.();
        haptics.success?.();
        return true;
      }
      return false;
    },

    addCustomRoom: (newRoom) => {
      const roomObj = {
        id: 'room_' + Date.now().toString(36),
        nameFa: newRoom.nameFa,
        nameEn: newRoom.nameEn || newRoom.nameFa,
        icon: newRoom.icon || 'Hash',
        category: newRoom.category || 'custom',
        locked: !!newRoom.locked
      };
      set(state => {
        const next = [...state.customRooms, roomObj];
        localStorage.setItem('zen_custom_rooms', JSON.stringify(next));
        const payload = { type: 'ADMIN_ROOMS_UPDATE', rooms: next };
        channel?.postMessage(payload);
        realtimeNetwork.publish(payload);
        return { customRooms: next };
      });
      soundEngine.playCheckmark?.();
    },

    deleteCustomRoom: (roomId) => {
      set(state => {
        const next = state.customRooms.filter(r => r.id !== roomId);
        localStorage.setItem('zen_custom_rooms', JSON.stringify(next));
        const payload = { type: 'ADMIN_ROOMS_UPDATE', rooms: next };
        channel?.postMessage(payload);
        realtimeNetwork.publish(payload);
        return { customRooms: next };
      });
      soundEngine.playTap?.();
    },

    setUserBadge: (targetUserId, badge) => {
      set(state => {
        const next = { ...state.userBadges, [targetUserId]: badge };
        localStorage.setItem('zen_user_badges', JSON.stringify(next));
        const payload = { type: 'ADMIN_USER_BADGE', targetUserId, badge };
        channel?.postMessage(payload);
        realtimeNetwork.publish(payload);
        return {
          userBadges: next,
          onlineUsers: state.onlineUsers.map(u => u.id === targetUserId ? { ...u, role: badge } : u)
        };
      });
      soundEngine.playLevelUp?.();
      haptics.success?.();
    },

    muteUser: (targetUserId) => {
      set(state => {
        const next = [...new Set([...state.mutedUserIds, targetUserId])];
        const payload = { type: 'ADMIN_MUTE_USER', targetUserId };
        channel?.postMessage(payload);
        realtimeNetwork.publish(payload);
        return { mutedUserIds: next };
      });
      soundEngine.playCheckmark?.();
    },

    banUser: (targetUserId) => {
      set(state => {
        const next = [...new Set([...state.bannedUserIds, targetUserId])];
        const nextChat = state.globalChat.filter(m => m.userId !== targetUserId);
        const payload = { type: 'ADMIN_BAN_USER', targetUserId };
        channel?.postMessage(payload);
        realtimeNetwork.publish(payload);
        return { bannedUserIds: next, globalChat: nextChat };
      });
      soundEngine.playCheckmark?.();
    },

    deleteChatMessage: (msgId) => {
      set(state => {
        const next = state.globalChat.filter(m => m.id !== msgId);
        const payload = { type: 'ADMIN_DELETE_MSG', msgId };
        channel?.postMessage(payload);
        realtimeNetwork.publish(payload);
        return { globalChat: next };
      });
    },

    purgeUserMessages: (targetUserId) => {
      set(state => {
        const next = state.globalChat.filter(m => m.userId !== targetUserId);
        const payload = { type: 'ADMIN_PURGE_USER_MSGS', targetUserId };
        channel?.postMessage(payload);
        realtimeNetwork.publish(payload);
        return { globalChat: next };
      });
      soundEngine.playCheckmark?.();
    },

    purgeRoomChat: (roomId) => {
      set(state => {
        const next = state.globalChat.filter(m => m.roomId !== roomId);
        const payload = { type: 'ADMIN_PURGE_ROOM', roomId };
        channel?.postMessage(payload);
        realtimeNetwork.publish(payload);
        return { globalChat: next };
      });
      soundEngine.playCheckmark?.();
    },
    
    setUserName: (name) => {
      const clean = (name && name.length < 30 && !name.startsWith('data:image/')) ? name.trim() : 'کاربر زنوسلایف';
      localStorage.setItem('life_os_user_name', clean);
      set({ userName: clean });
      realtimeNetwork.updateUser({ name: clean });
      channel?.postMessage({ type: 'PRESENCE', userId: get().userId, userName: clean, avatar: get().userAvatar });
    },

    setUserAvatar: (avatar) => {
      localStorage.setItem('life_os_user_avatar', avatar);
      set({ userAvatar: avatar });
      realtimeNetwork.updateUser({ avatar });
      channel?.postMessage({ type: 'PRESENCE', userId: get().userId, userName: get().userName, avatar });
    },

    setActiveDmUserId: (userId) => {
      set(state => ({
        activeDmUserId: userId,
        unreadDmCounts: {
          ...state.unreadDmCounts,
          [userId]: 0
        }
      }));
    },

    pingUsers: (currentRoom = 'general') => {
      realtimeNetwork.broadcastPresence();
      channel?.postMessage({ 
        type: 'PRESENCE', 
        userId: get().userId, 
        userName: get().userName, 
        avatar: get().userAvatar,
        currentRoom 
      });
    },

    sendGlobalMessage: (text, roomId = 'general', isSystem = false, extra = {}) => {
      const myId = get().userId;
      if (get().mutedUserIds.includes(myId) || get().bannedUserIds.includes(myId)) {
        alert('شما در حال حاضر توسط مدیریت بی‌صدا یا مسدود شده‌اید.');
        return;
      }

      const msg = {
        type: 'CHAT',
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        userId: isSystem ? 'system' : myId,
        userName: isSystem ? 'سیستم' : get().userName,
        userAvatar: isSystem ? '⚙️' : get().userAvatar,
        userRole: get().userBadges[myId] || (get().isAdminUnlocked ? '👑 مالک و مدیر ارشد' : 'عضو جامعه'),
        roomId,
        text,
        timestamp: new Date().toISOString(),
        likes: 0,
        tips: 0,
        isSystem,
        isWhisper: extra.isWhisper || false,
        whisperTargetId: extra.whisperTargetId || null,
        whisperTargetName: extra.whisperTargetName || null,
        replyTo: extra.replyTo || null
      };

      set(state => ({ globalChat: [...state.globalChat, msg] }));
      channel?.postMessage(msg);
      realtimeNetwork.publish(msg);
    },

    sendDirectMessage: (targetUserId, targetUserName, text) => {
      const msgId = 'dm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const timestamp = new Date().toISOString();

      const newMsg = {
        id: msgId,
        senderId: 'me',
        senderName: get().userName || 'شما',
        senderAvatar: get().userAvatar || '🌟',
        text,
        timestamp,
        isMe: true
      };

      // 1. Instant local append for 0ms feedback
      set(state => {
        const existing = state.directMessages[targetUserId] || [];
        const next = {
          ...state.directMessages,
          [targetUserId]: [...existing, newMsg]
        };
        localStorage.setItem('zen_direct_messages', JSON.stringify(next));
        return { directMessages: next };
      });

      const networkPayload = {
        type: 'DIRECT_MSG',
        id: msgId,
        targetUserId,
        senderId: get().userId,
        senderName: get().userName,
        senderAvatar: get().userAvatar,
        text,
        timestamp
      };

      // 2. Instant multi-device publish
      channel?.postMessage(networkPayload);
      realtimeNetwork.publish(networkPayload);

      // 3. Automated intelligent reply from AI companion
      if (COMPANION_PERSONAS[targetUserId]) {
        set({ isCompanionTyping: true });
        setTimeout(() => {
          const replyText = generateCompanionReply(targetUserId, text);
          const peerReply = {
            id: 'dm_reply_' + Date.now(),
            senderId: targetUserId,
            senderName: targetUserName,
            senderAvatar: COMPANION_PERSONAS[targetUserId]?.avatar || '🌸',
            text: replyText,
            timestamp: new Date().toISOString(),
            isMe: false
          };

          soundEngine.playMessageChime?.();
          haptics.notification?.();

          set(state => {
            const existing = state.directMessages[targetUserId] || [];
            const next = {
              ...state.directMessages,
              [targetUserId]: [...existing, peerReply]
            };
            localStorage.setItem('zen_direct_messages', JSON.stringify(next));
            return { directMessages: next, isCompanionTyping: false };
          });
        }, 900);
      }
    },

    likeMessage: (msgId) => {
      set(state => ({
        globalChat: state.globalChat.map(m => m.id === msgId ? { ...m, likes: (m.likes || 0) + 1 } : m)
      }));
      const payload = { type: 'LIKE_MSG', msgId };
      channel?.postMessage(payload);
      realtimeNetwork.publish(payload);
    },

    tipMessage: (msgId, amount) => {
      set(state => ({
        globalChat: state.globalChat.map(m => m.id === msgId ? { ...m, tips: (m.tips || 0) + amount } : m)
      }));
      const payload = { type: 'TIP_MSG', msgId, amount };
      channel?.postMessage(payload);
      realtimeNetwork.publish(payload);
    },

    addForumThread: (thread) => {
      const newThread = {
        id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        ...thread,
        replies: 0,
        likes: 0,
        date: 'همین الان'
      };
      set(state => {
        const next = [newThread, ...state.forumThreads];
        localStorage.setItem('zen_forum_threads', JSON.stringify(next));
        return { forumThreads: next };
      });
      const payload = { type: 'NEW_THREAD', thread: newThread };
      channel?.postMessage(payload);
      realtimeNetwork.publish(payload);
    },

    joinGame: (gameId, initialState) => {
      set({ activeGameId: gameId, gameState: initialState });
    },

    updateGameState: (newState) => {
      set({ gameState: newState });
      channel?.postMessage({ 
        type: 'GAME_STATE_UPDATE', 
        gameId: get().activeGameId, 
        state: newState 
      });
    },
    
    
    sendAnimatedGift: (gift, targetUser) => {
      const payload = {
        type: 'ANIMATED_GIFT',
        gift: {
          id: 'gift_' + Date.now(),
          giftId: gift.id,
          giftIcon: gift.icon,
          giftName: gift.nameFa,
          senderId: get().userId,
          senderName: get().userName,
          senderAvatar: get().userAvatar,
          targetId: targetUser.id,
          targetName: targetUser.name || targetUser.fullName,
          targetAvatar: targetUser.avatar
        }
      };
      set({ activeGiftAnimation: payload.gift });
      setTimeout(() => set({ activeGiftAnimation: null }), 3500);
      channel?.postMessage(payload);
      realtimeNetwork.publish(payload);
    },

    sendSoulBondRequest: (targetUser) => {
      const payload = {
        type: 'SOUL_BOND_REQUEST',
        senderId: get().userId,
        senderName: get().userName,
        senderAvatar: get().userAvatar,
        targetUserId: targetUser.id
      };
      channel?.postMessage(payload);
      realtimeNetwork.publish(payload);
    },

    acceptSoulBond: (request) => {
      const partner = { id: request.senderId, name: request.senderName, avatar: request.senderAvatar };
      localStorage.setItem('zen_soul_bond', JSON.stringify(partner));
      set({ activeSoulBond: partner, incomingSoulBondRequest: null });
      const payload = {
        type: 'SOUL_BOND_ACCEPTED',
        senderId: request.senderId,
        senderName: request.senderName,
        senderAvatar: request.senderAvatar,
        targetUserId: get().userId,
        targetUserName: get().userName,
        targetUserAvatar: get().userAvatar
      };
      channel?.postMessage(payload);
      realtimeNetwork.publish(payload);
    },

    rejectSoulBond: () => set({ incomingSoulBondRequest: null }),
    removeSoulBond: () => {
      localStorage.removeItem('zen_soul_bond');
      set({ activeSoulBond: null });
    },

    publishTriviaQuestion: (triviaData) => {
      const payload = {
        type: 'TRIVIA_QUESTION',
        trivia: {
          id: 'trivia_' + Date.now(),
          ...triviaData,
          answered: false,
          winner: null
        }
      };
      set({ activeTrivia: payload.trivia });
      channel?.postMessage(payload);
      realtimeNetwork.publish(payload);
    },

    answerTrivia: (selectedIdx) => {
      const trivia = get().activeTrivia;
      if (!trivia || trivia.answered) return false;
      const isCorrect = selectedIdx === trivia.correctIndex;
      if (isCorrect) {
        const payload = {
          type: 'TRIVIA_ANSWER',
          triviaId: trivia.id,
          winner: {
            id: get().userId,
            name: get().userName,
            avatar: get().userAvatar,
            points: trivia.points || 50
          }
        };
        set(state => ({
          activeTrivia: state.activeTrivia ? { ...state.activeTrivia, answered: true, winner: payload.winner } : null
        }));
        channel?.postMessage(payload);
        realtimeNetwork.publish(payload);
        return true;
      }
      return false;
    },

    sendInGameReaction: (reaction) => {
      const payload = {
        type: 'INGAME_REACTION',
        reaction: {
          ...reaction,
          senderName: get().userName,
          senderAvatar: get().userAvatar,
          timestamp: Date.now()
        }
      };
      set({ activeGameReaction: payload.reaction });
      setTimeout(() => set({ activeGameReaction: null }), 2500);
      channel?.postMessage(payload);
      realtimeNetwork.publish(payload);
    },

    leaveGame: () => {
      set({ activeGameId: null, gameState: null });
    }
  };
});

export default useMultiplayerStore;
