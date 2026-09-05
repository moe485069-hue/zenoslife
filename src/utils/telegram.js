// Telegram Mini App (TMA / Telegram WebApp) Integration Helper

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const isTelegramMiniApp = () => {
  const tg = getTelegramWebApp();
  return Boolean(tg && tg.initData);
};

export const initTelegramMiniApp = (appStore) => {
  const tg = getTelegramWebApp();
  if (!tg) return;

  try {
    // 1. Expand WebApp to maximum available height
    tg.ready();
    tg.expand();

    // 2. Set Header & Background Color to match Life-OS cosmic theme
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#0d071b');
    }
    if (tg.setBackgroundColor) {
      tg.setBackgroundColor('#090412');
    }

        // Auto sync language with Bot / Telegram
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryLang = urlParams.get('lang');
      if (queryLang && ['fa', 'en'].includes(queryLang) && appStore?.setLanguage) {
        appStore.setLanguage(queryLang);
      } else if (tgUser?.language_code && appStore?.setLanguage) {
        const defaultLang = tgUser.language_code.startsWith('fa') ? 'fa' : 'en';
        if (!localStorage.getItem('lifeos_language')) {
          appStore.setLanguage(defaultLang);
        }
      }
    } catch (_) {}

    // 3. Auto sync Telegram User Profile if available
    const tgUser = tg.initDataUnsafe?.user;
    if (tgUser && appStore?.setUserProfile) {
      const currentProfile = appStore.userProfile || {};
      
      const newFullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || currentProfile.fullName;
      const newUsername = tgUser.username || currentProfile.username;
      const newAvatar = tgUser.photo_url || currentProfile.avatar;

      // Only update if current profile is default
      if (currentProfile.username === 'admin_user' || !currentProfile.fullName) {
        appStore.setUserProfile({
          fullName: newFullName,
          username: newUsername,
          avatar: newAvatar,
          bio: currentProfile.bio || '✨ کاربر سیستم عامل زندگی در تلگرام'
        });
      }
    }

    // 4. Handle start_param Deep Linking & Referrals
    const urlParams = new URLSearchParams(window.location.search);
    const startParamFromUrl = urlParams.get('startapp') || urlParams.get('tgWebAppStartParam');
    const startParam = tg.initDataUnsafe?.start_param || startParamFromUrl;
    if (startParam) {
      if (startParam.startsWith('ref_')) {
        const referrerId = startParam.replace('ref_', '');
        const myUserId = localStorage.getItem('life_os_user_id');
        const hasClaimed = localStorage.getItem(`zen_ref_claimed_${referrerId}`);
        if (referrerId && referrerId !== myUserId && !hasClaimed && appStore?.claimReferralBounty) {
          appStore.claimReferralBounty(referrerId);
          localStorage.setItem(`zen_ref_claimed_${referrerId}`, 'true');
        }
      } else if (startParam.startsWith('room_')) {
        const roomId = startParam.replace('room_', '');
        let game = 'backgammon';
        if (roomId.startsWith('BACK-')) game = 'backgammon';
        else if (roomId.startsWith('HOKM-')) game = 'hokm';
        else if (roomId.startsWith('LUDO-')) game = 'ludo';
        else if (roomId.startsWith('PASS-')) game = 'pasur';
        else if (roomId.startsWith('BILL-')) game = 'billiards';
        else if (roomId.startsWith('CHSS-')) game = 'cosmic_chess';
        window.location.hash = `#/games/${game}?room=${roomId}&mode=online&role=black&autostart=1`;
      } else if (startParam.startsWith('duel_backgammon_')) {
        const room = startParam.replace('duel_backgammon_', '');
        window.location.hash = `#/games/backgammon?room=${room}&mode=online&role=black&autostart=1`;
      } else if (startParam.startsWith('duel_')) {
        const parts = startParam.replace('duel_', '').split('_');
        const game = parts[0] || 'backgammon';
        const room = parts[1] || 'ROOM1';
        window.location.hash = `#/games/${game}?room=${room}&mode=online&role=black&autostart=1`;
      } else if (['hokm', 'backgammon', 'ludo', 'pasur', 'billiards'].includes(startParam)) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes(`/games/${startParam}`)) {
          window.location.hash = `#/games/${startParam}`;
        }
      } else if (startParam === 'chat') {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/chat')) {
          window.location.hash = '#/chat';
        }
      } else if (startParam === 'lounge' || startParam === 'game-rooms' || startParam === 'gamerooms') {
        window.location.hash = '#/games/lounge';
      }
    } else {
      // Check query parameter fallback for direct web visitors
      const roomFromUrl = urlParams.get('room');
      if (roomFromUrl && (!window.location.hash || window.location.hash === '#/' || window.location.hash === '')) {
        let game = urlParams.get('game') || 'backgammon';
        if (roomFromUrl.startsWith('BACK-')) game = 'backgammon';
        else if (roomFromUrl.startsWith('HOKM-')) game = 'hokm';
        window.location.hash = `#/games/${game}?room=${roomFromUrl}&mode=online&role=black&autostart=1`;
      }
    }

    // 5. Listen to theme changes from Telegram
    tg.onEvent('themeChanged', () => {
      const colorScheme = tg.colorScheme; // 'dark' | 'light'
      if (colorScheme && appStore?.setTheme) {
        appStore.setTheme(colorScheme === 'light' ? 'light' : 'dark');
      }
    });

  } catch (err) {
    console.warn('Telegram WebApp init warning:', err);
  }
};

export const shareToTelegram = ({ roomCode, gameType = 'backgammon', gameTitleFa = 'تخته نرد' }) => {
  const botUsername = 'chazha_bot';
  // Use ?start=room_ so Telegram opens the bot and presents the direct game card with join button!
  const directLink = `https://t.me/${botUsername}?start=room_${roomCode}`;
  const text = `🎲 دعوت به مسابقه ${gameTitleFa} در چاژا!\n👑 بیا با من مسابقه بده، روی لینک زیر بزن و مستقیم وارد بازی شو: ⚔️👇`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(directLink)}&text=${encodeURIComponent(text)}`;

  const tg = getTelegramWebApp();
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
};

export const shareMatchResultToTelegram = ({
  gameTitleFa = 'تخته نرد',
  winnerName = 'من',
  myScore = 0,
  opponentScore = 0,
  roomCode = '',
  gameType = 'backgammon'
}) => {
  const botUsername = 'chazha_bot';
  const directLink = `https://t.me/${botUsername}?start=room_${roomCode || 'CHZ-REMATCH'}`;
  const text = `🏆 کارت نتیجه مسابقه ${gameTitleFa} در چاژا:\n\n👑 برنده مسابقه: ${winnerName}\n📊 نتیجه نهایی: ⚪ سفید: ${myScore} | ⚫ سیاه: ${opponentScore}\n\n⚔️ برای بازی مجدد و انتقام، روی دکمه یا لینک زیر بزن:👇`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(directLink)}&text=${encodeURIComponent(text)}`;

  const tg = getTelegramWebApp();
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
};

export const shareViaInlineQuery = ({ roomCode, gameType = 'backgammon', gameTitleFa = 'تخته نرد' }) => {
  // Use shareToTelegram so user immediately gets a full invite card with button upon picking a chat
  shareToTelegram({ roomCode, gameType, gameTitleFa });
};

export const triggerTelegramHaptic = (style = 'medium') => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    if (['light', 'medium', 'heavy', 'rigid', 'soft'].includes(style)) {
      tg.HapticFeedback.impactOccurred(style);
    } else if (['error', 'success', 'warning'].includes(style)) {
      tg.HapticFeedback.notificationOccurred(style);
    } else {
      tg.HapticFeedback.selectionChanged();
    }
  }
};

export default {
  getTelegramWebApp,
  isTelegramMiniApp,
  initTelegramMiniApp,
  shareToTelegram,
  shareViaInlineQuery,
  triggerTelegramHaptic
};
