import { create } from 'zustand';
import { soundEngine } from '../utils/audio';

export const LEVEL_TITLES = {
  1: { fa: 'جستجوگر مبتدی', en: 'Novice Seeker' },
  2: { fa: 'رهروی بیدار', en: 'Awakened Traveler' },
  3: { fa: 'شاگرد خرد', en: 'Apprentice of Wisdom' },
  4: { fa: 'پژوهشگر درون', en: 'Inner Explorer' },
  5: { fa: 'استاد تعادل', en: 'Master of Balance' },
  7: { fa: 'آرشیتکت سرنوشت', en: 'Architect of Destiny' },
  10: { fa: 'فرمانروای زندگی', en: 'Life Sovereign' },
  15: { fa: 'حکیم روشن‌ضمیر', en: 'Illuminated Sage' },
  20: { fa: 'افسانه کیهانی', en: 'Cosmic Legend' }
};

export const BADGES_LIST = [
  { id: 'first_step', icon: '🌱', nameFa: 'گام نخست', nameEn: 'First Step', descFa: 'ثبت اولین فعالیت در زندگی‌ساز', descEn: 'Completed first activity in Life OS' },
  { id: 'streak_3', icon: '🔥', nameFa: 'آتش استمرار', nameEn: 'Ignition', descFa: '۳ روز استمرار متوالی', descEn: '3 days active streak' },
  { id: 'streak_7', icon: '⚡', nameFa: 'هفته طلایی', nameEn: 'Golden Week', descFa: '۷ روز فعالیت مداوم', descEn: '7 days streak without break' },
  { id: 'streak_30', icon: '👑', nameFa: 'پادشاه عادت‌ها', nameEn: 'Habit Monarch', descFa: '۳۰ روز استمرار شکست‌ناپذیر', descEn: '30 days legendary streak' },
  { id: 'zen_master', icon: '🧘', nameFa: 'استاد مراقبه', nameEn: 'Zen Master', descFa: '۵۰ دقیقه مراقبه و تنفس آگاهانه', descEn: '50 minutes of mindful practice' },
  { id: 'wise_scholar', icon: '📚', nameFa: 'دانشور دانا', nameEn: 'Wise Scholar', descFa: 'مرور ۲۰ فلش‌کارت و یادگیری روزانه', descEn: 'Reviewed 20 flashcards' },
  { id: 'deep_soul', icon: '🪞', nameFa: 'روح ژرف‌نگر', nameEn: 'Deep Soul', descFa: 'ثبت ۵ ژورنال و شناخت عمیق احساسات', descEn: 'Logged 5 reflective journals' },
  { id: 'wealth_builder', icon: '💰', nameFa: 'معمار ثروت', nameEn: 'Wealth Builder', descFa: 'ثبت ۱۰ تراکنش و تعیین اهداف مالی', descEn: 'Managed budget & set goals' },
  { id: 'world_citizen', icon: '🌍', nameFa: 'شهروند جهان', nameEn: 'Global Citizen', descFa: 'بررسی آمارها و پیگیری رویدادهای فرهنگ و هنر', descEn: 'Explored cultural heritage & facts' },
  { id: 'pure_heart', icon: '💎', nameFa: 'درستی ناب', nameEn: 'Pure Integrity', descFa: 'وفای کامل به تعهدات اخلاقی و شکرگزاری', descEn: 'Maintained high integrity score' },
  // Mythic Badges
  { id: 'quest_early_bird', icon: '🌅', nameFa: 'ققنوس سحرخیز (اسطوره‌ای)', nameEn: 'Dawn Phoenix (Mythic)', descFa: 'پیروزی در چالش ۲۱ روزه سحرخیزی', descEn: 'Mastered 21-Day Early Bird Quest' },
  { id: 'quest_digital_detox', icon: '📵', nameFa: 'زاهد دیجیتال (اسطوره‌ای)', nameEn: 'Digital Ascetic (Mythic)', descFa: 'رهایی از اسکرول بیهوده و سم‌زدایی دوپامین', descEn: 'Conquered 7-Day Digital Detox' },
  { id: 'quest_reading_30', icon: '📖', nameFa: 'دانای کل (اسطوره‌ای)', nameEn: 'Omniscient Reader (Mythic)', descFa: 'تکمیل ۳۰ روز ماراتن دانایی و کتابخوانی', descEn: 'Completed 30-Day Reading Odyssey' },
  { id: 'quest_master_90', icon: '🌌', nameFa: 'جاودانگی ذهن و تن (افسانه‌ای)', nameEn: 'Cosmic Immortal (Legendary)', descFa: 'دگرگونی بنیادین در چالش ۹۰ روزه حیات', descEn: 'Achieved 90-Day Complete Life Mastery' },
  { id: 'bonsai_master', icon: '🌳', nameFa: 'باغبان کیهانی', nameEn: 'Cosmic Arborist', descFa: 'رساندن بونسای ذهن به شکوفایی کامل', descEn: 'Nurtured Zen Bonsai to full bloom' },
];

export const FONTS_LIST = [
  { id: 'vazirmatn', nameFa: 'وزیرمتن', nameEn: 'Vazirmatn', style: 'مدرن، خوانا و استاندارد', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
  { id: 'shabnam', nameFa: 'شبنم', nameEn: 'Shabnam', style: 'هندسی، شیک و دقیق', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
  { id: 'sahel', nameFa: 'ساحل', nameEn: 'Sahel', style: 'روان، نرم و چشم‌نواز', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
  { id: 'samim', nameFa: 'صمیم', nameEn: 'Samim', style: 'دوستانه، گرد و مهربان', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
  { id: 'estedad', nameFa: 'استعداد', nameEn: 'Estedad', style: 'پویا، پرانرژی و مدرن', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
  { id: 'tanha', nameFa: 'تنها', nameEn: 'Tanha', style: 'ساده، بی‌پیرایه و تمیز', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
  { id: 'lalezar', nameFa: 'لاله‌زار', nameEn: 'Lalezar', style: 'کلاسیک، تیتری و برجسته', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
  { id: 'harmattan', nameFa: 'دست‌نویس', nameEn: 'Harmattan', style: 'طبیعی، صمیمی و ارگانیک', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
  { id: 'readex', nameFa: 'ریدکس پرو', nameEn: 'Readex Pro', style: 'مدرن جهانی و مینیمال', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
  { id: 'amiri', nameFa: 'امیری', nameEn: 'Amiri', style: 'کتابی، ادبی و نفیس', sample: 'زندگی زیباست، استمرار راز پیروزی است' },
];

const useAppStore = create((set, get) => ({
  theme: 'cosmic', // 'cosmic' | 'dark' | 'light'
  language: 'fa', // 'fa' | 'en'
  isRtl: true,
  aiKey: localStorage.getItem('lifeos_ai_key') || '',
  fontFamily: localStorage.getItem('lifeos_font_family') || 'vazirmatn',
  fontScale: 'large', // 'normal' (100%) | 'large' (115%) | 'xlarge' (130%)
  myDayModules: ['mindfulness', 'health', 'wealth', 'selfDiscovery', 'learning', 'integrity'],
  isOnline: navigator.onLine,
  soundEnabled: true,
  xp: 45,
  level: 1,
  coins: parseInt(localStorage.getItem('user_coins') || '350', 10), // Life Coins
  purchasedItems: JSON.parse(localStorage.getItem('lifeos_purchased_items') || '["default_frame", "default_color"]'),
  equippedFrame: localStorage.getItem('lifeos_equipped_frame') || 'none',
  equippedNameColor: localStorage.getItem('lifeos_equipped_name_color') || 'default',
  equippedBubble: localStorage.getItem('lifeos_equipped_bubble') || 'default',
  equippedPieceSkin: localStorage.getItem('lifeos_equipped_piece_skin') || 'faravahar',
  equippedBanners: JSON.parse(localStorage.getItem('lifeos_equipped_banners') || '["banner_persepolis", "banner_royal_gold", "banner_cyber_neon"]'),
  badges: ['first_step', 'streak_3'],
  todayScore: 65,
  showInstallPrompt: false,
  deferredPrompt: null,
  levelUpModal: { isOpen: false, newLevel: 1 },

  // Monetization & Telegram VIP State
  isVip: localStorage.getItem('lifeos_is_vip') === '1',
  vipExpiry: localStorage.getItem('lifeos_vip_expiry') || null,
  isBoosted: localStorage.getItem('lifeos_is_boosted') === '1',
  boostExpiry: localStorage.getItem('lifeos_boost_expiry') || null,

  // Referral Stats
  invitedCount: parseInt(localStorage.getItem('lifeos_invited_count') || '3', 10),
  referralEarnings: parseInt(localStorage.getItem('lifeos_referral_earnings') || '1500', 10),
  claimedEarnings: parseInt(localStorage.getItem('lifeos_claimed_earnings') || '0', 10),

  // Sponsor Quests
  completedTasks: JSON.parse(localStorage.getItem('lifeos_completed_tasks') || '["daily_checkin"]'),

  // Astrological Natal Chart
  birthChartData: JSON.parse(localStorage.getItem('lifeos_birth_chart') || 'null'),

  // Dating Liked-By Admirers
  likedByList: [
    { id: 'admirer_1', name: 'نیلوفر زاد', avatar: '🧘', city: 'تهران', age: '۲۵', bio: 'علاقه‌مند به یوگا و کتابخوانی', likedAt: '۱۰ دقیقه پیش' },
    { id: 'admirer_2', name: 'دیانا ستاره', avatar: '💎', city: 'شیراز', age: '۲۷', bio: 'مشتاق فلسفه و شطرنج', likedAt: '۱ ساعت پیش' },
    { id: 'admirer_3', name: 'سارا آناهیتا', avatar: '🌸', city: 'اصفهان', age: '۲۴', bio: 'طراح گرافیک و عاشق ذن', likedAt: 'دیروز' }
  ],

  // ─── GAME ENGINE ───────────────────────────────────────────────────────────
  // History of last 20 game results
  gameHistory: JSON.parse(localStorage.getItem('lifeos_game_history') || '[]'),
  // Earned achievement IDs
  gameAchievements: JSON.parse(localStorage.getItem('lifeos_game_achievements') || '[]'),
  // Per-game stats counters
  gameStats: JSON.parse(localStorage.getItem('lifeos_game_stats') || JSON.stringify({
    totalGames: 0, totalWins: 0, currentWinStreak: 0, maxWinStreak: 0,
    lateNightGames: 0, fastWins: 0, doublesRolled: 0
  })),
  // Pending achievement to show in toast (one at a time)
  pendingAchievement: null,

  /** Record a completed game result and update stats */
  recordGameResult: ({ gameId, gameName, gameIcon, won, opponent, durationMs, coinsEarned = 0 }) => {
    set((state) => {
      const now = new Date();
      const entry = {
        id: Date.now(),
        gameId, gameName, gameIcon,
        won, opponent,
        durationMs,
        coinsEarned,
        playedAt: now.toISOString(),
        playedAtLabel: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };

      // Prepend + keep max 20
      const newHistory = [entry, ...state.gameHistory].slice(0, 20);
      localStorage.setItem('lifeos_game_history', JSON.stringify(newHistory));

      // Update stats
      const s = { ...state.gameStats };
      s.totalGames += 1;
      const isLateNight = now.getHours() >= 0 && now.getHours() < 4;
      const isFastWin = won && durationMs < 5 * 60 * 1000;
      if (won) {
        s.totalWins += 1;
        s.currentWinStreak += 1;
        if (s.currentWinStreak > s.maxWinStreak) s.maxWinStreak = s.currentWinStreak;
      } else {
        s.currentWinStreak = 0;
      }
      if (isLateNight) s.lateNightGames = (s.lateNightGames || 0) + 1;
      if (isFastWin) s.fastWins = (s.fastWins || 0) + 1;
      localStorage.setItem('lifeos_game_stats', JSON.stringify(s));

      return { gameHistory: newHistory, gameStats: s };
    });

    // Check achievements after state update
    setTimeout(() => get().checkGameAchievements(), 100);
  },

  /** Check all achievement conditions and grant new ones */
  checkGameAchievements: () => {
    const { gameStats, gameAchievements } = get();
    const has = (id) => gameAchievements.includes(id);
    const grant = (id) => {
      if (has(id)) return;
      const updated = [...get().gameAchievements, id];
      localStorage.setItem('lifeos_game_achievements', JSON.stringify(updated));
      set({ gameAchievements: updated, pendingAchievement: id });
    };

    if (gameStats.totalGames >= 1) grant('first_game');
    if (gameStats.totalWins >= 1) grant('first_win');
    if (gameStats.currentWinStreak >= 3) grant('hat_trick');
    if (gameStats.currentWinStreak >= 5) grant('five_streak');
    if (gameStats.totalWins >= 10) grant('ten_wins');
    if (gameStats.totalWins >= 50) grant('fifty_wins');
    if (gameStats.totalGames >= 100) grant('century');
    if (gameStats.fastWins >= 1) grant('lightning_win');
    if (gameStats.lateNightGames >= 1) grant('night_owl');
    if (gameStats.maxWinStreak >= 10) grant('legendary_streak');
  },

  /** Increment a custom stat (e.g. doublesRolled) */
  incrementGameStat: (key, amount = 1) => {
    set((state) => {
      const s = { ...state.gameStats, [key]: (state.gameStats[key] || 0) + amount };
      localStorage.setItem('lifeos_game_stats', JSON.stringify(s));
      // Check doubles achievement
      if (key === 'doublesRolled' && s.doublesRolled >= 1) {
        setTimeout(() => get().checkGameAchievements(), 100);
      }
      return { gameStats: s };
    });
  },

  /** Clear pending achievement toast */
  clearPendingAchievement: () => set({ pendingAchievement: null }),
  // ───────────────────────────────────────────────────────────────────────────


  userProfile: JSON.parse(localStorage.getItem('lifeos_user_profile') || JSON.stringify({
    fullName: 'مدیر ارشد سیستم',
    username: 'admin_user',
    bio: '✨ فرمانروایی بر ذهن، عادات و سرنوشت فردی\n🌌 ساخت اکوسیستم اختصاصی توسعه فردی و تمرکز.',
    avatar: 'https://i.pravatar.cc/150?img=60'
  })),

  setUserProfile: (profile) => {
    set((state) => {
      const updated = { ...state.userProfile, ...profile };
      localStorage.setItem('lifeos_user_profile', JSON.stringify(updated));
      return { userProfile: updated };
    });
  },

  setFontFamily: (fontFamily) => {
    localStorage.setItem('lifeos_font_family', fontFamily);
    document.documentElement.setAttribute('data-font', fontFamily);
    document.body.setAttribute('data-font', fontFamily);
    set({ fontFamily });
  },

  setFontScale: (fontScale) => {
    localStorage.setItem('fontScale', fontScale);
    document.documentElement.setAttribute('data-font-scale', fontScale);
    set({ fontScale });
  },

  setAiKey: (aiKey) => {
    localStorage.setItem('lifeos_ai_key', aiKey);
    set({ aiKey });
  },

  setMyDayModules: (myDayModules) => {
    localStorage.setItem('myDayModules', JSON.stringify(myDayModules));
    set({ myDayModules });
  },

  toggleMyDayModule: (moduleId) => {
    set((state) => {
      const current = state.myDayModules || [];
      const updated = current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId];
      localStorage.setItem('myDayModules', JSON.stringify(updated));
      return { myDayModules: updated };
    });
  },

  pinnedStrollIds: JSON.parse(localStorage.getItem('lifeos_pinned_strolls') || '[]'),
  learningVault: JSON.parse(localStorage.getItem('lifeos_learning_vault') || '[]'),

  togglePinStroll: (strollId) => {
    let result = [];
    set((state) => {
      const current = Array.isArray(state.pinnedStrollIds) ? state.pinnedStrollIds : [];
      const isPinned = current.includes(strollId);
      const updated = isPinned
        ? current.filter((id) => id !== strollId)
        : [...current, strollId];
      result = updated;
      try {
        localStorage.setItem('lifeos_pinned_strolls', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('lifeos_pinned_strolls_updated', { detail: updated }));
      } catch (e) {
        console.error(e);
      }
      soundEngine.playCheckmark();
      return { pinnedStrollIds: [...updated] };
    });
    return result;
  },

  toggleVaultItem: (item) => {
    let isAdded = false;
    const itemId = item.id || `vault_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    set((state) => {
      const current = Array.isArray(state.learningVault) ? state.learningVault : [];
      const exists = current.some((v) => 
        (item.id && v.id === item.id) || 
        (item.phrase && v.phrase === item.phrase) || 
        (item.title && v.title === item.title) ||
        (item.text && v.text === item.text)
      );
      
      const updated = exists
        ? current.filter((v) => 
            !(item.id && v.id === item.id) && 
            !(item.phrase && v.phrase === item.phrase) && 
            !(item.title && v.title === item.title) &&
            !(item.text && v.text === item.text)
          )
        : [{ 
            ...item, 
            id: itemId, 
            dateAdded: item.dateAdded || new Date().toISOString(), 
            mastered: false 
          }, ...current];

      isAdded = !exists;
      try {
        localStorage.setItem('lifeos_learning_vault', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('lifeos_learning_vault_updated', { detail: updated }));
      } catch (e) {
        console.error(e);
      }
      soundEngine.playLevelUp?.();
      return { learningVault: [...updated] };
    });
    return isAdded;
  },

  removeFromVault: (itemId) => {
    set((state) => {
      const current = Array.isArray(state.learningVault) ? state.learningVault : [];
      const updated = current.filter((v) => v.id !== itemId);
      try {
        localStorage.setItem('lifeos_learning_vault', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('lifeos_learning_vault_updated', { detail: updated }));
      } catch (e) {
        console.error(e);
      }
      return { learningVault: [...updated] };
    });
  },

  toggleVaultMastery: (itemId) => {
    set((state) => {
      const current = Array.isArray(state.learningVault) ? state.learningVault : [];
      const updated = current.map(item => {
        if (item.id === itemId) return { ...item, mastered: !item.mastered };
        return item;
      });
      try {
        localStorage.setItem('lifeos_learning_vault', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('lifeos_learning_vault_updated', { detail: updated }));
      } catch (e) {
        console.error(e);
      }
      return { learningVault: [...updated] };
    });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language, isRtl: language === 'fa' });
  },

  setSoundEnabled: (soundEnabled) => {
    soundEngine.isMuted = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled ? '1' : '0');
    set({ soundEnabled });
  },

  setOnline: (isOnline) => set({ isOnline }),

  addCoins: (amount, reason = '') => {
    soundEngine.playLevelUp();
    set((state) => {
      const newCoins = (state.coins || 0) + amount;
      localStorage.setItem('user_coins', String(newCoins));
      return { coins: newCoins };
    });
  },

  spendCoins: (amount) => {
    const currentCoins = get().coins || 0;
    if (currentCoins < amount) return false;
    soundEngine.playCheckmark();
    const newCoins = currentCoins - amount;
    localStorage.setItem('user_coins', String(newCoins));
    set({ coins: newCoins });
    return true;
  },

  buyStoreItem: (item) => {
    const { coins, purchasedItems, spendCoins } = get();
    if (purchasedItems.includes(item.id)) return { success: true, message: 'قبلاً خریداری شده است' };
    if ((coins || 0) < item.price) return { success: false, message: 'موجودی سکه کافی نیست!' };
    
    if (spendCoins(item.price)) {
      const updated = [...purchasedItems, item.id];
      localStorage.setItem('lifeos_purchased_items', JSON.stringify(updated));
      set({ purchasedItems: updated });
      soundEngine.playLevelUp?.();
      return { success: true, message: 'با موفقیت خریداری شد 🎉' };
    }
    return { success: false, message: 'خطا در خرید' };
  },

  setEquippedItem: (type, id) => {
    if (type === 'frame') {
      localStorage.setItem('lifeos_equipped_frame', id);
      set({ equippedFrame: id });
    } else if (type === 'nameColor') {
      localStorage.setItem('lifeos_equipped_name_color', id);
      set({ equippedNameColor: id });
    } else if (type === 'bubble') {
      localStorage.setItem('lifeos_equipped_bubble', id);
      set({ equippedBubble: id });
    } else if (type === 'pieceSkin') {
      localStorage.setItem('lifeos_equipped_piece_skin', id);
      set({ equippedPieceSkin: id });
    } else if (type === 'banner') {
      const current = get().equippedBanners || [];
      let updated;
      if (current.includes(id)) {
        updated = current.filter((b) => b !== id);
        if (updated.length === 0) updated = [id];
      } else {
        if (current.length >= 5) {
          updated = [...current.slice(1), id];
        } else {
          updated = [...current, id];
        }
      }
      localStorage.setItem('lifeos_equipped_banners', JSON.stringify(updated));
      set({ equippedBanners: updated });
    }
    soundEngine.playTap?.();
  },

  activateVip: (days = 30) => {
    const expiry = new Date(Date.now() + days * 86400000).toISOString();
    localStorage.setItem('lifeos_is_vip', '1');
    localStorage.setItem('lifeos_vip_expiry', expiry);
    set({ isVip: true, vipExpiry: expiry });
    soundEngine.playLevelUp?.();
  },

  activateProfileBoost: (hours = 24) => {
    const expiry = new Date(Date.now() + hours * 3600000).toISOString();
    localStorage.setItem('lifeos_is_boosted', '1');
    localStorage.setItem('lifeos_boost_expiry', expiry);
    set({ isBoosted: true, boostExpiry: expiry });
    soundEngine.playLevelUp?.();
  },

  claimReferralBounty: () => {
    const { referralEarnings, claimedEarnings, coins, addCoins } = get();
    const claimable = referralEarnings - claimedEarnings;
    if (claimable <= 0) return { success: false, message: 'پاداش قابل برداشتی وجود ندارد' };

    addCoins(claimable, 'Referral Bounty');
    localStorage.setItem('lifeos_claimed_earnings', String(referralEarnings));
    set({ claimedEarnings: referralEarnings });
    soundEngine.playLevelUp?.();
    return { success: true, amount: claimable };
  },

  completeSponsorTask: (taskId, rewardCoins) => {
    const { completedTasks, addCoins } = get();
    if (completedTasks.includes(taskId)) return false;

    const updated = [...completedTasks, taskId];
    localStorage.setItem('lifeos_completed_tasks', JSON.stringify(updated));
    addCoins(rewardCoins, 'Sponsor Task');
    set({ completedTasks: updated });
    soundEngine.playLevelUp?.();
    return true;
  },

  saveBirthChart: (data) => {
    localStorage.setItem('lifeos_birth_chart', JSON.stringify(data));
    set({ birthChartData: data });
    soundEngine.playCheckmark?.();
  },

  addXP: (amount, reason = '') => {
    soundEngine.playCheckmark();
    set((state) => {
      const newXp = state.xp + amount;
      const currentLevel = state.level;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      // Auto award coins proportionally (+1 coin per 2 XP)
      const bonusCoins = Math.max(1, Math.floor(amount / 2));
      const newCoins = (state.coins || 0) + bonusCoins;

      localStorage.setItem('user_xp', String(newXp));
      localStorage.setItem('user_coins', String(newCoins));

      // Check for level up
      if (newLevel > currentLevel) {
        soundEngine.playLevelUp();
        return {
          xp: newXp,
          coins: newCoins,
          level: newLevel,
          levelUpModal: { isOpen: true, newLevel }
        };
      }

      return { xp: newXp, coins: newCoins };
    });
  },

  closeLevelUpModal: () => {
    set((state) => ({ levelUpModal: { ...state.levelUpModal, isOpen: false } }));
  },

  incrementStreak: () => set((state) => {
    const newStreak = state.streak + 1;
    localStorage.setItem('user_streak', String(newStreak));
    return { streak: newStreak };
  }),
  
  awardBadge: (badgeId) => {
    set((state) => {
      if (!state.badges.includes(badgeId)) {
        soundEngine.playLevelUp();
        const newBadges = [...state.badges, badgeId];
        localStorage.setItem('user_badges', JSON.stringify(newBadges));
        return { badges: newBadges };
      }
      return {};
    });
  },

  loadFromStorage: () => {
    const savedTheme = localStorage.getItem('theme') || 'cosmic';
    const savedLang = localStorage.getItem('language') || 'fa';
    const savedFont = localStorage.getItem('lifeos_font_family') || 'vazirmatn';
    const savedFontScale = localStorage.getItem('fontScale') || 'large';
    const savedAiKey = localStorage.getItem('lifeos_ai_key') || '';
    const savedMyDay = JSON.parse(localStorage.getItem('myDayModules') || '["mindfulness", "health", "wealth", "selfDiscovery", "learning", "integrity"]');
    const savedSound = localStorage.getItem('soundEnabled') !== '0';
    const savedXp = parseInt(localStorage.getItem('user_xp') || '45', 10);
    const savedCoins = parseInt(localStorage.getItem('user_coins') || '350', 10);
    const savedLevel = Math.floor(savedXp / 100) + 1;
    const savedStreak = parseInt(localStorage.getItem('user_streak') || '3', 10);
    const savedBadges = JSON.parse(localStorage.getItem('user_badges') || '["first_step", "streak_3"]');
    const savedPinnedStrolls = JSON.parse(localStorage.getItem('lifeos_pinned_strolls') || '[]');
    const savedVault = JSON.parse(localStorage.getItem('lifeos_learning_vault') || '[]');

    soundEngine.isMuted = !savedSound;
    document.documentElement.setAttribute('data-font', savedFont);
    document.body.setAttribute('data-font', savedFont);
    document.documentElement.setAttribute('data-font-scale', savedFontScale);

    set({
      theme: savedTheme,
      language: savedLang,
      isRtl: savedLang === 'fa',
      fontFamily: savedFont,
      fontScale: savedFontScale,
      aiKey: savedAiKey,
      myDayModules: savedMyDay,
      soundEnabled: savedSound,
      xp: savedXp,
      coins: savedCoins,
      level: savedLevel,
      streak: savedStreak,
      badges: savedBadges,
      pinnedStrollIds: savedPinnedStrolls,
      learningVault: savedVault
    });
  },

  getLevelTitle: (lvl) => {
    const lang = get().language;
    const keys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
    for (const key of keys) {
      if (lvl >= key) {
        return LEVEL_TITLES[key][lang] || LEVEL_TITLES[key].fa;
      }
    }
    return LEVEL_TITLES[1][lang] || LEVEL_TITLES[1].fa;
  }
}));

export default useAppStore;
