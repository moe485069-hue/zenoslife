import { create } from 'zustand';
import realtimeNetwork from '../services/realtimeNetwork';

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

const DEFAULT_MENTORS = [
  { id: 'u_aria', name: 'آریا', role: 'مربی استمرار و سحرخیزی', avatar: '🦁', color: 'from-amber-500 to-orange-500', isMentor: true },
  { id: 'u_sara', name: 'سارا', role: 'پژوهشگر هوش مالی و سرمایه‌گذاری', avatar: '💎', color: 'from-purple-500 to-pink-500', isMentor: true },
  { id: 'u_reza', name: 'رضا', role: 'همراه مراقبه و فلسفه رواقی', avatar: '🧘', color: 'from-emerald-500 to-teal-500', isMentor: true },
  { id: 'u_neda', name: 'ندا', role: 'همراه خودشناسی و روانشناسی', avatar: '🌸', color: 'from-rose-500 to-red-500', isMentor: true }
];

const useMultiplayerStore = create((set, get) => {
  // Handler for all incoming network payloads (both Local Broadcast & Global WebSocket Relays)
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
          return {
            directMessages: {
              ...state.directMessages,
              [chatKey]: [...existing, newMsg]
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
        return {
          forumThreads: [data.thread, ...state.forumThreads]
        };
      });
    }
  };

  // 1. Initialize local BroadcastChannel
  if (channel) {
    channel.onmessage = (event) => {
      handleIncomingPayload(event.data);
    };
  }

  // 2. Initialize Global Realtime WebSocket Network
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
    networkStatus: 'connecting', // 'connecting' | 'connected' | 'disconnected'
    activeRelayCount: 0,
    activeDmUserId: 'u_aria',

    onlineUsers: [...DEFAULT_MENTORS],

    globalChat: [
      {
        id: 'm_init_1',
        userId: 'bot_mentor',
        userName: 'راهنمای کیهانی',
        userAvatar: '🪐',
        roomId: 'general',
        text: 'درود به تمام جویندگان رشد و دانایی! به تالار گفتگوی زنده و جهانی زندگی‌ساز خوش آمدید. 🌟 پیام‌های شما به صورت بلادرنگ به دست کاربران در سراسر وب می‌رسد.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 5,
        tips: 0,
        isSystem: false
      },
      {
        id: 'm_init_2',
        userId: 'u_sara',
        userName: 'سارا',
        userAvatar: '💎',
        roomId: 'tech',
        text: 'کسی از تکنیک پومودورو ۲۵ دقیقه تمرکز برای کار یا کدنویسی استفاده کرده؟ بازدهی فوق‌العاده‌ست!',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        likes: 3,
        tips: 5,
        isSystem: false
      },
      {
        id: 'm_init_3',
        userId: 'u_reza',
        userName: 'رضا',
        userAvatar: '🧘',
        roomId: 'philosophy',
        text: 'آرامش درونی از تسلط بر واکنش‌های خودمان سرچشمه می‌گیرد، نه تلاش برای کنترل دنیای بیرون.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        likes: 8,
        tips: 10,
        isSystem: false
      }
    ],

    directMessages: {
      'u_aria': [
        { id: 'dm_1', senderId: 'u_aria', senderName: 'آریا', text: 'سلام دوست خوبم! چالش استمرار و سحرخیزی رو چطور پیش می‌بری؟ روزت پرانرژی!', timestamp: new Date(Date.now() - 7200000).toISOString(), isMe: false },
        { id: 'dm_2', senderId: 'me', senderName: 'شما', text: 'درود آریا! امروز عالی بود، استمرار خوبی داشتم و حس فوق‌العاده‌ای دارم.', timestamp: new Date(Date.now() - 3600000).toISOString(), isMe: true },
        { id: 'dm_3', senderId: 'u_aria', senderName: 'آریا', text: 'فوق‌العاده‌ست! استمرار کوچک روزانه، دستاوردهای بزرگ فردا رو می‌سازه. بهت افتخار می‌کنم! 🔥', timestamp: new Date(Date.now() - 1800000).toISOString(), isMe: false }
      ],
      'u_sara': [
        { id: 'dm_4', senderId: 'u_sara', senderName: 'سارا', text: 'سلام! در مورد قانون ۵۰/۳۰/۲۰ در بخش ثروت و هوش مالی نظرت چیه؟ من روی بودجه‌بندی ماهانه‌م اجراش کردم و هزینه‌های اضافی ۳۰٪ کمتر شد.', timestamp: new Date(Date.now() - 14400000).toISOString(), isMe: false }
      ],
      'u_reza': [
        { id: 'dm_5', senderId: 'u_reza', senderName: 'رضا', text: 'سلام! پیشنهاد می‌کنم هر روز قبل از شروع کارها، الگوی تنفس ۴-۴-۴-۴ جعبه‌ای رو ۳ دقیقه تمرین کنی. وضوح ذهن رو دو برابر می‌کنه.', timestamp: new Date(Date.now() - 28800000).toISOString(), isMe: false }
      ],
      'u_neda': [
        { id: 'dm_6', senderId: 'u_neda', senderName: 'ندا', text: 'درود! سوالات تأمل روزانه در بخش خودشناسی واقعاً به آرامش روان و خودآگاهی کمک می‌کنه. حتماً تجربه کن.', timestamp: new Date(Date.now() - 43200000).toISOString(), isMe: false }
      ]
    },

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

      // Send to local BroadcastChannel
      channel?.postMessage(msg);

      // Send to Worldwide WebSocket Relays
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
        return {
          directMessages: {
            ...state.directMessages,
            [targetUserId]: [...existing, newMsg]
          }
        };
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

      // Broadcast locally & globally
      channel?.postMessage(networkPayload);
      realtimeNetwork.publish(networkPayload);

      // Simulated smart peer responses for mentor personas
      const simulatedReplies = {
        'u_aria': [
          'خیلی خوشحالم که این موضوع رو باهام در میون گذاشتی! کلید اصلی، حفظ تعادل و جشن گرفتن پیشرفت‌های کوچک روزانه‌ست. 🌟',
          'دقیقاً همینطوره! وقتی ذهن روی هدف متمرکز باشه، هیچ مانعی پایدار نمی‌مونه. با تمام قدرت ادامه بده! 🔥',
          'عالیه! اگه خواستی یه چالش جدید مشترک شروع کنیم حتماً بهم بگو. استمرار پیروز همیشگیه!'
        ],
        'u_sara': [
          'نکته بسیار هوشمندانه‌ای بود! در مدیریت مالی و هوش اقتصادی، تصمیم‌های آگاهانه کوچک آینده رو تضمین می‌کنه. 💰',
          'کاملاً موافقم! پس‌انداز و سرمایه‌گذاری مداوم با سود مرکب در چند سال آینده معجزه می‌کنه.',
          'حتماً بررسی‌ها و اهدافت رو در بخش درآمد و ثروت هم یادداشت کن تا روند رشدت رو شفاف ببینی.'
        ],
        'u_reza': [
          'سکون و حضور در لحظه حال، قوی‌ترین پناهگاه انسانه. حتماً این آرامش رو در تمام روز همراهت نگه دار. 🧘',
          'دیدگاه زیبایی بود. همونطور که فیلسوفان کهن گفتن: هرچه درون ما آرام‌تر باشه، طوفان‌های بیرون بی‌اثرترند.',
          'تمرین امروزت رو حتماً تکمیل کن. ذهن مثل عضلات با تکرار و تمرین قوی‌تر میشه.'
        ],
        'u_neda': [
          'چه بازتاب عمیقی! شناخت احساسات و ژورنال‌نویسی کلید رهایی از اضطراب و باز شدن درهای خودآگاهیه. 🌸',
          'بسیار ارزشمنده که برای شناخت خودت وقت می‌ذاری. مهم‌ترین رابطه زندگی هر انسان، رابطه با خودشه.',
          'این نکته رو توی دفترچه تأملاتت ذخیره کن تا همیشه یادت بمونه چقدر رو به رشدی.'
        ]
      };

      if (simulatedReplies[targetUserId]) {
        setTimeout(() => {
          const replies = simulatedReplies[targetUserId];
          const replyText = replies[Math.floor(Math.random() * replies.length)];
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
            return {
              directMessages: {
                ...state.directMessages,
                [targetUserId]: [...existing, peerReply]
              }
            };
          });
        }, 1200);
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

    forumThreads: [
      { id: 't1', title: 'تجربه شما از روتین ۵ صبح و معجزه سحرخیزی؟', author: 'سینا', category: 'fitness', replies: 12, likes: 45, date: '۱ ساعت پیش' },
      { id: 't2', title: 'بهترین کتاب فلسفه و رواقی‌گری که مسیر زندگی‌تان را روشن کرد؟', author: 'آریا', category: 'philosophy', replies: 34, likes: 120, date: '۵ ساعت پیش' },
      { id: 't3', title: 'اصول سرمایه‌گذاری مطمئن و قانون ۵۰/۳۰/۲۰ در مدیریت ثروت', author: 'امیرحسین', category: 'business', replies: 8, likes: 15, date: 'دیروز' },
      { id: 't4', title: 'راهکارهای افزایش تمرکز و غلبه بر تعلل در یادگیری برنامه‌نویسی', author: 'فرزاد', category: 'tech', replies: 22, likes: 88, date: '۲ روز پیش' }
    ],

    addForumThread: (thread) => {
      const newThread = {
        id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        ...thread,
        replies: 0,
        likes: 0,
        date: 'همین الان'
      };
      set(state => ({ forumThreads: [newThread, ...state.forumThreads] }));
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
