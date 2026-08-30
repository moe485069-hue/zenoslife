import { create } from 'zustand';
import realtimeNetwork from '../services/realtimeNetwork';
import { COMPANION_PERSONAS, generateCompanionReply } from '../services/companionAI';

// Persistent user identity
const savedId = localStorage.getItem('life_os_user_id') || ('user_' + Math.random().toString(36).substr(2, 9));
localStorage.setItem('life_os_user_id', savedId);

const savedName = localStorage.getItem('life_os_user_name') || ('کاربر ' + Math.floor(100 + Math.random() * 900));
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
  status: c.status
}));

const loadSavedDms = () => {
  try {
    const saved = localStorage.getItem('zen_direct_messages');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return {
    'companion_sara': [
      { id: 'dm_sara_1', senderId: 'companion_sara', senderName: 'سارا (آناهیتا)', text: 'سلام دوست خوبم! به دنیای هم‌فرکانس‌ها خوش اومدی 🌸 هر زمان دوست داشتی درباره مراقبه، کتاب یا رشد فردی گپ بزنیم من اینجام!', timestamp: new Date(Date.now() - 3600000).toISOString(), isMe: false }
    ],
    'companion_arash': [
      { id: 'dm_arash_1', senderId: 'companion_arash', senderName: 'آرش کیهان', text: 'درود! اگر اهل بیزینس، استراتژی و بازی‌های فکری مثل تخته‌نرد و شطرنج هستی، می‌تونیم با هم رقابت‌های جذابی داشته باشیم 🚀', timestamp: new Date(Date.now() - 7200000).toISOString(), isMe: false }
    ],
    'companion_niloofar': [
      { id: 'dm_niloofar_1', senderId: 'companion_niloofar', senderName: 'نیلوفر زاد', text: 'سلام و آرامش 💙 مراقبه امروزت چطور پیش رفت؟ بیا فضای امنی برای به اشتراک گذاشتن حس‌های خوب بسازیم.', timestamp: new Date(Date.now() - 10800000).toISOString(), isMe: false }
    ],
    'companion_reza': [
      { id: 'dm_reza_1', senderId: 'companion_reza', senderName: 'رضا فیتنس', text: 'سلام دلاور! 🔥 برای ساخت عادات فولادی و روتین پرانرژی روی من حساب کن. امروز چه ورزشی داشتی؟', timestamp: new Date(Date.now() - 14400000).toISOString(), isMe: false }
    ],
    'companion_diana': [
      { id: 'dm_diana_1', senderId: 'companion_diana', senderName: 'دیانا ستاره', text: 'سلام 💎 فلسفه، هنر و بازی‌های دونفره ذهن رو تازه می‌کنه. مشتاق مصاحبت با افراد خوش‌فکرم ✨', timestamp: new Date(Date.now() - 18000000).toISOString(), isMe: false }
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
            role: data.role || 'کاربر آنلاین',
            avatar: data.avatar || '👤',
            color: 'from-sky-500 to-indigo-600',
            lastSeen: Date.now(),
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
        return {
          globalChat: [...state.globalChat, data]
        };
      });
    } else if (data.type === 'DIRECT_MSG') {
      const myId = get().userId;
      if (data.targetUserId === myId) {
        set(state => {
          const chatKey = data.senderId;
          const existing = state.directMessages[chatKey] || [];
          if (existing.some(m => m.id === data.id)) return state;
          
          const newMsg = {
            id: data.id,
            senderId: data.senderId,
            senderName: data.senderName,
            text: data.text,
            timestamp: data.timestamp,
            isMe: false
          };
          const next = {
            ...state.directMessages,
            [chatKey]: [...existing, newMsg]
          };
          localStorage.setItem('zen_direct_messages', JSON.stringify(next));
          return { directMessages: next };
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

    onlineUsers: [...DEFAULT_MENTORS],

    globalChat: [
      {
        id: 'm_init_1',
        userId: 'companion_sara',
        userName: 'سارا (آناهیتا)',
        userAvatar: '🌸',
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
    
    setUserName: (name) => {
      localStorage.setItem('life_os_user_name', name);
      set({ userName: name });
      realtimeNetwork.updateUser({ name });
      channel?.postMessage({ type: 'PRESENCE', userId: get().userId, userName: name, avatar: get().userAvatar });
    },

    setUserAvatar: (avatar) => {
      localStorage.setItem('life_os_user_avatar', avatar);
      set({ userAvatar: avatar });
      realtimeNetwork.updateUser({ avatar });
      channel?.postMessage({ type: 'PRESENCE', userId: get().userId, userName: get().userName, avatar });
    },

    setActiveDmUserId: (userId) => {
      set({ activeDmUserId: userId });
    },

    pingUsers: () => {
      realtimeNetwork.broadcastPresence();
      channel?.postMessage({ type: 'PRESENCE', userId: get().userId, userName: get().userName, avatar: get().userAvatar });
    },

    sendGlobalMessage: (text, roomId = 'general', isSystem = false, extra = {}) => {
      const msg = {
        type: 'CHAT',
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        userId: isSystem ? 'system' : get().userId,
        userName: isSystem ? 'سیستم' : get().userName,
        userAvatar: isSystem ? '⚙️' : get().userAvatar,
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
        text,
        timestamp,
        isMe: true
      };

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

      channel?.postMessage(networkPayload);
      realtimeNetwork.publish(networkPayload);

      // Automated intelligent reply from AI companion
      if (COMPANION_PERSONAS[targetUserId]) {
        set({ isCompanionTyping: true });
        setTimeout(() => {
          const replyText = generateCompanionReply(targetUserId, text);
          const peerReply = {
            id: 'dm_reply_' + Date.now(),
            senderId: targetUserId,
            senderName: targetUserName,
            text: replyText,
            timestamp: new Date().toISOString(),
            isMe: false
          };

          set(state => {
            const existing = state.directMessages[targetUserId] || [];
            const next = {
              ...state.directMessages,
              [targetUserId]: [...existing, peerReply]
            };
            localStorage.setItem('zen_direct_messages', JSON.stringify(next));
            return { directMessages: next, isCompanionTyping: false };
          });
        }, 1100);
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
    
    leaveGame: () => {
      set({ activeGameId: null, gameState: null });
    }
  };
});

export default useMultiplayerStore;
