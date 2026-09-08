import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Sparkles, Volume2, VolumeX, Globe, Download, Upload, Smartphone, Tv, Laptop,
  Award, Shield, Check, CheckCircle, Info, Lock, Key, Cloud, Bell, Send, AlertTriangle,
  User, Camera, Edit3, Image, Copy, CheckCircle2, Coins, Crown, Flame, Zap, Share2, Palette
} from 'lucide-react';
import useAppStore, { BADGES_LIST, FONTS_LIST } from '../store/appStore';
import { exportAllDataJSON, importAllDataJSON } from '../db/database';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { encryptData, decryptData } from '../utils/crypto';
import useNotifications from '../hooks/useNotifications';
import InstallGuideModal from '../components/ui/InstallGuideModal';
import CloudAuthModal from '../components/ui/CloudAuthModal';
import cloudAuthSync from '../services/cloudAuthSync';
import CoinShopModal from '../components/shop/CoinShopModal';
import { getTelegramWebApp } from '../utils/telegram';

// Preset Avatars Gallery for Gamer Profile
export const PRESET_AVATARS = [
  { id: 'king', icon: '👑', label: 'شاهانه' },
  { id: 'lion', icon: '🦁', label: 'شیر پارسی' },
  { id: 'dragon', icon: '🐉', label: 'اژدها' },
  { id: 'ninja', icon: '🥷', label: 'نینجا' },
  { id: 'mage', icon: '🧙‍♂️', label: 'خردمند' },
  { id: 'robot', icon: '🤖', label: 'سایبورگ' },
  { id: 'fox', icon: '🦊', label: 'روباه دانا' },
  { id: 'diamond', icon: '💎', label: 'الماس' },
  { id: 'zen', icon: '🧘', label: 'استاد ذن' },
  { id: 'falcon', icon: '🦅', label: 'عقاب' },
  { id: 'tiger', icon: '🐯', label: 'ببر' },
  { id: 'lightning', icon: '⚡', label: 'صاعقه' },
  { id: 'cosmic', icon: '🪐', label: 'کیهان' },
  { id: 'fire', icon: '🔥', label: 'شعله' },
  { id: 'spade', icon: '♠️', label: 'پیک تک‌خال' },
  { id: 'dice', icon: '🎲', label: 'تاس جفت‌شیش' }
];

// Quick Bio Suggestions
export const BIO_SUGGESTIONS = [
  '👑 شوالیه بی‌ادعا، ولی همیشه برنده',
  '🎲 سلطان حکم و تخته نرد چاژا',
  '⚡ بازی سریع، تمرکز بالا، پیروزی قطعی',
  '🧘 ذهن آرام در آشوب، استراتژی شکست‌ناپذیر',
  '🏆 فقط برای رتبه اول لیگ می‌جنگم',
  '✨ اهل رقابت دوستانه و کل‌کل سالم'
];

// Helper to safely render Avatar (Image URL, Data URL, or Emoji)
function SafeAvatar({ avatar, size = 'w-16 h-16 text-3xl', ringColor = 'border-amber-400' }) {
  if (!avatar) return <div className={`${size} rounded-3xl bg-purple-600 flex items-center justify-center text-white shrink-0`}>👤</div>;
  if (avatar.startsWith('data:image/') || avatar.startsWith('http')) {
    return (
      <img
        src={avatar}
        alt="Avatar"
        className={`${size} rounded-3xl object-cover border-2 ${ringColor} shadow-lg shrink-0`}
      />
    );
  }
  return (
    <div className={`${size} rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-amber-600 text-white flex items-center justify-center border-2 ${ringColor} shadow-lg shrink-0`}>
      {avatar}
    </div>
  );
}

export default function Settings() {
  // Store state
  const { 
    theme, setTheme, language, setLanguage, fontFamily, setFontFamily,
    soundEnabled, setSoundEnabled,
    xp, level, streak, badges, getLevelTitle, deferredPrompt,
    aiKey, setAiKey, userProfile, setUserProfile, coins, isVip,
    invitedCount, referralEarnings
  } = useAppStore();

  const isRtl = language === 'fa';
  const isLight = theme === 'light' || theme === 'dawn' || theme === 'mint';

  // Active Tab: 'profile' | 'appearance' | 'language' | 'system'
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form States
  const [displayName, setDisplayName] = useState(() => {
    return userProfile?.fullName || localStorage.getItem('life_os_user_name') || (isRtl ? 'کاربر چاژا' : 'Chazha Player');
  });
  const [userUsername, setUserUsername] = useState(() => {
    return userProfile?.username || localStorage.getItem('life_os_user_username') || '';
  });
  const [bioText, setBioText] = useState(() => {
    return userProfile?.bio || localStorage.getItem('life_os_user_bio') || (isRtl ? '✨ قهرمان مسابقات آنلاین چاژا در تلگرام' : 'Official Chazha Player');
  });
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return userProfile?.avatar || localStorage.getItem('life_os_user_avatar') || '👑';
  });

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);

  // Cloud and system states
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [cloudState, setCloudState] = useState({
    isLoggedIn: cloudAuthSync.isLoggedIn(),
    currentUser: cloudAuthSync.currentUser,
    lastSynced: cloudAuthSync.lastSynced,
    syncStatus: cloudAuthSync.syncStatus
  });

  useEffect(() => {
    const unsub = cloudAuthSync.subscribe(setCloudState);
    return unsub;
  }, []);

  // Notifications
  const {
    permission,
    isSupported: isNotifSupported,
    reminders,
    requestPermission,
    testNotification,
    toggleReminder,
    updateReminderTime
  } = useNotifications();

  const [exportSuccess, setExportSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  
  // Encryption state
  const [useEncryption, setUseEncryption] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [pendingEncryptedFile, setPendingEncryptedFile] = useState(null);
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [testNotifSent, setTestNotifSent] = useState(false);

  const fileInputRef = useRef(null);
  const avatarFileInputRef = useRef(null);

  // Detect PWA Installation status
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsInstalled(mq.matches || window.navigator.standalone === true);

    const handler = (e) => setIsInstalled(e.matches);
    mq.addEventListener('change', handler);

    const onAppInstalled = () => {
      setIsInstalled(true);
      useAppStore.setState({ showInstallPrompt: false });
    };
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      mq.removeEventListener('change', handler);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  // Auto-sync telegram user details on first load if available
  useEffect(() => {
    const tg = getTelegramWebApp();
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser) {
      if (!userProfile?.fullName || userProfile?.fullName === 'کاربر چاژا') {
        const full = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        if (full) {
          setDisplayName(full);
          localStorage.setItem('life_os_user_name', full);
        }
      }
      if (tgUser.username && !userProfile?.username) {
        setUserUsername(tgUser.username);
      }
      if (tgUser.photo_url && (!userProfile?.avatar || userProfile?.avatar === '👑')) {
        setAvatarUrl(tgUser.photo_url);
        localStorage.setItem('life_os_user_avatar', tgUser.photo_url);
      }
    }
  }, [userProfile]);

  const levelTitle = getLevelTitle ? getLevelTitle(level) : (isRtl ? 'فرمانروای بازی‌ها' : 'Game Sovereign');

  // Save Profile Handler
  const handleSaveProfile = () => {
    const cleanName = displayName.trim() || (isRtl ? 'کاربر چاژا' : 'Chazha Player');
    const cleanUsername = userUsername.trim().replace(/^@/, '');
    const cleanBio = bioText.trim();

    setUserProfile({
      fullName: cleanName,
      username: cleanUsername,
      bio: cleanBio,
      avatar: avatarUrl
    });

    localStorage.setItem('life_os_user_name', cleanName);
    localStorage.setItem('life_os_user_username', cleanUsername);
    localStorage.setItem('life_os_user_bio', cleanBio);
    localStorage.setItem('life_os_user_avatar', avatarUrl);

    haptics.success?.();
    soundEngine.playCheckmark?.();
    setSaveMessage(isRtl ? '✓ پروفایل با موفقیت ذخیره شد!' : '✓ Profile saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Sync directly from Telegram Profile
  const handleSyncTelegramProfile = () => {
    const tg = getTelegramWebApp();
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser) {
      const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || '';
      const username = tgUser.username || '';
      const photo = tgUser.photo_url || avatarUrl;

      if (fullName) setDisplayName(fullName);
      if (username) setUserUsername(username);
      if (tgUser.photo_url) setAvatarUrl(tgUser.photo_url);

      setUserProfile({
        fullName: fullName || displayName,
        username: username || userUsername,
        avatar: photo
      });

      localStorage.setItem('life_os_user_name', fullName);
      localStorage.setItem('life_os_user_username', username);
      if (tgUser.photo_url) localStorage.setItem('life_os_user_avatar', tgUser.photo_url);

      haptics.success?.();
      soundEngine.playLevelUp?.();
      setSaveMessage(isRtl ? '✨ اطلاعات با موفقیت از تلگرام همگام شد!' : '✨ Synced with Telegram profile!');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      alert(isRtl ? 'اطلاعات تلگرام در دسترس نیست یا برنامه در مرورگر معمولی باز شده است.' : 'Telegram WebApp data not detected.');
    }
  };

  // Custom Avatar File Upload
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(isRtl ? 'حجم تصویر باید کمتر از ۲ مگابایت باشد.' : 'Image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setAvatarUrl(base64);
      setUserProfile({ avatar: base64 });
      localStorage.setItem('life_os_user_avatar', base64);
      setShowAvatarModal(false);
      haptics.success?.();
      soundEngine.playLevelUp?.();
      setSaveMessage(isRtl ? '✓ تصویر پروفایل با موفقیت آپلود شد!' : '✓ Avatar image updated!');
      setTimeout(() => setSaveMessage(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Switch Theme (Light vs Dark master toggle)
  const handleToggleLightDark = (target) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    if (target === 'light') {
      setTheme('light');
    } else {
      setTheme('cosmic');
    }
  };

  // Export Data
  const handleExportData = async () => {
    try {
      const json = await exportAllDataJSON();
      let fileData = json;
      let fileName = `life-os-backup-${new Date().toISOString().split('T')[0]}.json`;
      let mimeType = 'application/json';

      if (useEncryption && passphrase.trim()) {
        fileData = await encryptData(json, passphrase.trim());
        fileName = `life-os-encrypted-backup-${new Date().toISOString().split('T')[0]}.lifeos.enc`;
        mimeType = 'text/plain';
      }

      const blob = new Blob([fileData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      haptics.success?.();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.error('Export error:', e);
      alert(isRtl ? 'خطا در خروجی گرفتن از اطلاعات' : 'Error exporting backup data.');
    }
  };

  // Import File Handler
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      if (file.name.endsWith('.enc') || (text.includes('"salt"') && text.includes('"iv"'))) {
        setPendingEncryptedFile(text);
        setImportStatus(isRtl ? '🔒 فایل رمزنگاری شده است. لطفاً رمز عبور را وارد کنید.' : '🔒 Encrypted file detected. Please enter password.');
        return;
      }
      await importAllDataJSON(text);
      haptics.levelUp?.();
      soundEngine.playLevelUp?.();
      setImportStatus(isRtl ? '✨ اطلاعات با موفقیت بازیابی شد! صفحه را رفرش کنید.' : '✨ Data restored successfully! Please refresh.');
    } catch (err) {
      setImportStatus(isRtl ? '❌ خطا در خواندن فایل پشتیبان' : '❌ Error importing file');
    }
  };

  const handleDecryptAndImport = async () => {
    if (!pendingEncryptedFile || !decryptPassphrase.trim()) return;
    try {
      const decryptedText = await decryptData(pendingEncryptedFile, decryptPassphrase.trim());
      await importAllDataJSON(decryptedText);
      haptics.levelUp?.();
      soundEngine.playLevelUp?.();
      setImportStatus(isRtl ? '✨ فایل رمزگشایی و با موفقیت بازیابی شد!' : '✨ Backup decrypted & restored successfully!');
      setPendingEncryptedFile(null);
      setDecryptPassphrase('');
    } catch (e) {
      setImportStatus(isRtl ? '❌ رمز عبور اشتباه است یا فایل مخدوش شده است.' : '❌ Incorrect password or corrupted file.');
    }
  };

  const handleTestNotification = async () => {
    haptics.tap?.();
    const success = await testNotification();
    if (success) {
      setTestNotifSent(true);
      setTimeout(() => setTestNotifSent(false), 3000);
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        useAppStore.setState({ showInstallPrompt: false, deferredPrompt: null });
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const SETTINGS_TABS = [
    { id: 'profile', labelFa: '👤 پروفایل و بیو', labelEn: 'Profile & Bio' },
    { id: 'appearance', labelFa: '🎨 تم و ظاهر', labelEn: 'Appearance' },
    { id: 'language', labelFa: '🌐 زبان و صدا', labelEn: 'Audio & Lang' },
    { id: 'system', labelFa: '⚙️ کیف‌پول و ابر', labelEn: 'Wallet & Cloud' }
  ];

  return (
    <div
      className={`min-h-screen pb-32 px-3.5 sm:px-6 pt-4 max-w-2xl mx-auto transition-colors duration-200 ${
        isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#060814] text-white'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <span>⚙️</span>
            <span>{isRtl ? 'تنظیمات و حساب کاربری' : 'Settings & Profile'}</span>
          </h1>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {isRtl ? 'شخصی‌سازی نام، بیو، آواتار، تم روشن/تاریک و داده‌ها' : 'Manage your gamer profile, theme, language & data'}
          </p>
        </div>

        {/* Quick Coin Indicator */}
        <button
          onClick={() => { soundEngine.playTap?.(); haptics.tap?.(); setIsShopModalOpen(true); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shadow-sm active:scale-95 transition-all ${
            isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}
        >
          <Coins size={16} className="text-amber-500" />
          <span className="text-xs font-black">{coins.toLocaleString(isRtl ? 'fa-IR' : 'en-US')}</span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">+</span>
        </button>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className={`flex p-1.5 rounded-2xl border mb-5 shadow-sm gap-1 ${
        isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900/90 border-white/10'
      }`}>
        {SETTINGS_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playTap?.();
                haptics.tap?.();
                setActiveTab(tab.id);
              }}
              className={`flex-1 py-2 px-1 text-center rounded-xl text-xs font-black transition-all truncate ${
                isActive
                  ? (isLight 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md')
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              {isRtl ? tab.labelFa : tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* Toast Feedback */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-2xl bg-emerald-500 text-white text-xs font-bold text-center shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>{saveMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: PROFILE & BIO                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* Avatar & Identity Hero Card */}
          <div className={`p-5 rounded-3xl border shadow-sm transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/80 border-white/10 backdrop-blur-xl'
          }`}>
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-5 border-b border-inherit">
              {/* Avatar with Edit Overlay */}
              <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                <SafeAvatar avatar={avatarUrl} size="w-20 h-20 text-4xl" ringColor="border-amber-400" />
                <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Camera size={22} />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAvatarModal(true); }}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400 active:scale-90 transition-transform"
                  title={isRtl ? 'تغییر تصویر' : 'Change Avatar'}
                >
                  <Edit3 size={13} />
                </button>
              </div>

              {/* Name & Quick Badges */}
              <div className="text-center sm:text-start flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className={`text-lg font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {displayName || (isRtl ? 'کاربر چاژا' : 'Chazha Player')}
                  </h2>
                  {isVip && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/40">
                      VIP 👑
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/30">
                    Lvl {level}
                  </span>
                </div>

                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {userUsername ? `@${userUsername}` : (isRtl ? 'شناسه گیمر تلگرام' : 'Telegram Gamer ID')} • {levelTitle}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border active:scale-95 transition-all ${
                      isLight 
                        ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' 
                        : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
                    }`}
                  >
                    🖼️ {isRtl ? 'انتخاب آواتار' : 'Change Avatar'}
                  </button>

                  <button
                    onClick={handleSyncTelegramProfile}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-300 hover:bg-sky-500/25 active:scale-95 transition-all"
                  >
                    🔄 {isRtl ? 'همگام با تلگرام' : 'Sync Telegram'}
                  </button>
                </div>
              </div>
            </div>

            {/* Editable Fields Form */}
            <div className="pt-4 space-y-3.5">
              {/* Display Name Input */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {isRtl ? 'نام نمایشی / گیمرتگ:' : 'Display Name / Gamer Tag:'}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: شوالیه طلایی' : 'e.g. Royal Knight'}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-bold outline-none transition-all ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600 focus:bg-white' 
                      : 'bg-slate-950/60 border-white/10 text-white focus:border-purple-400'
                  }`}
                />
              </div>

              {/* Username Input */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {isRtl ? 'نام کاربری تلگرام (Username):' : 'Telegram Username:'}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRtl ? 'right-3.5' : 'left-3.5'} flex items-center text-xs font-bold opacity-50`}>
                    @
                  </span>
                  <input
                    type="text"
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="username"
                    dir="ltr"
                    className={`w-full ${isRtl ? 'pr-8 pl-3.5' : 'pl-8 pr-3.5'} py-2.5 rounded-2xl border text-xs font-mono font-bold outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600 focus:bg-white' 
                        : 'bg-slate-950/60 border-white/10 text-white focus:border-purple-400'
                    }`}
                  />
                </div>
              </div>

              {/* Bio & Status */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {isRtl ? 'بیوگرافی و معرفی کوتاه:' : 'Gamer Bio & Status:'}
                  </label>
                  <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {bioText.length}/120
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={120}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder={isRtl ? 'یک جمله درباره سبک بازی، ادعا یا علایق خود بنویسید...' : 'Write a short bio or status...'}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs leading-relaxed outline-none transition-all resize-none ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600 focus:bg-white' 
                      : 'bg-slate-950/60 border-white/10 text-white focus:border-purple-400'
                  }`}
                />

                {/* Quick Bio Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BIO_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => { soundEngine.playTap?.(); haptics.tap?.(); setBioText(sug); }}
                      className={`text-[10px] px-2.5 py-1 rounded-xl border transition-all truncate max-w-full ${
                        isLight 
                          ? 'bg-slate-100 hover:bg-purple-100 text-slate-700 border-slate-200' 
                          : 'bg-white/5 hover:bg-purple-900/40 text-slate-300 border-white/10'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:opacity-95 active:scale-98 text-white text-xs font-black shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Check size={16} />
                <span>{isRtl ? 'ذخیره تغییرات پروفایل' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>

          {/* Gamer Achievements Summary */}
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Award size={16} className="text-amber-500" />
              <span>{isRtl ? 'مدال‌ها و افتخارات بازی' : 'Achievements & Badges'}</span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>({badges.length} / {BADGES_LIST.length})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BADGES_LIST.slice(0, 8).map(badge => {
                const isEarned = badges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 ${
                      isEarned
                        ? (isLight ? 'bg-amber-50/80 border-amber-300 text-amber-950' : 'bg-amber-950/20 border-amber-500/40 text-amber-200')
                        : (isLight ? 'bg-slate-100 border-slate-200 opacity-40 grayscale' : 'bg-white/5 border-white/5 opacity-40 grayscale')
                    }`}
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-[11px] font-bold truncate max-w-full">
                      {isRtl ? badge.nameFa : badge.nameEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: APPEARANCE & THEMES                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'appearance' && (
        <div className="space-y-4">
          {/* Master Light vs Dark Switcher */}
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <h3 className={`text-sm font-black mb-3 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Palette size={16} className="text-purple-500" />
              <span>{isRtl ? 'حالت اصلی ظاهر (روشن / تاریک)' : 'Master Appearance Mode'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Light Mode Card */}
              <button
                onClick={() => handleToggleLightDark('light')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all active:scale-95 text-center ${
                  isLight
                    ? 'border-purple-500 bg-purple-50/80 ring-2 ring-purple-500/60 shadow-md text-slate-900'
                    : 'border-white/10 bg-white/5 opacity-70 hover:opacity-100 text-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-500 text-2xl shadow-inner">
                  <Sun size={26} />
                </div>
                <div>
                  <h4 className="text-xs font-black">{isRtl ? '☀️ تم روز و روشن' : '☀️ Light Mode'}</h4>
                  <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isRtl ? 'سفید خالص، نوشته‌های تیره و خوانا' : 'Crisp white & dark typography'}
                  </p>
                </div>
                {isLight && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white mt-1">
                    {isRtl ? 'فعال ✓' : 'Active ✓'}
                  </span>
                )}
              </button>

              {/* Dark Mode Card */}
              <button
                onClick={() => handleToggleLightDark('dark')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all active:scale-95 text-center ${
                  !isLight
                    ? 'border-purple-400 bg-purple-950/60 ring-2 ring-purple-500 shadow-md text-white'
                    : 'border-slate-200 bg-slate-100 opacity-70 hover:opacity-100 text-slate-600'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-2xl shadow-inner">
                  <Moon size={26} />
                </div>
                <div>
                  <h4 className="text-xs font-black">{isRtl ? '🌙 تم شب و تاریک' : '🌙 Dark Mode'}</h4>
                  <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isRtl ? 'مخمل مشکی، ضد خستگی و نئونی' : 'Velvet dark & neon accents'}
                  </p>
                </div>
                {!isLight && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500 text-white mt-1">
                    {isRtl ? 'فعال ✓' : 'Active ✓'}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Palettes Gallery */}
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <h3 className={`text-sm font-black mb-3 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Sparkles size={16} className="text-amber-500" />
              <span>{isRtl ? 'پالت‌های رنگی اختصاصی' : 'Color Palettes'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'light', nameFa: '💎 ابریشم بلورین (روشن)', nameEn: 'Luminous Silk', icon: '💎', isLightPalette: true },
                { id: 'cosmic', nameFa: '🌌 کیهانی شاهانه (تاریک)', nameEn: 'Cosmic Sovereign', icon: '🌌', isLightPalette: false },
                { id: 'royal', nameFa: '👑 طلای سلطنتی (تاریک)', nameEn: 'Imperial Gold', icon: '👑', isLightPalette: false },
                { id: 'space', nameFa: '🪐 اقیانوس کهکشان (تاریک)', nameEn: 'Deep Space', icon: '🪐', isLightPalette: false },
                { id: 'nature', nameFa: '🌲 فردوس زمردین (تاریک)', nameEn: 'Emerald Forest', icon: '🌲', isLightPalette: false },
                { id: 'dawn', nameFa: '🌅 سحرگاه زرین (روشن)', nameEn: 'Warm Dawn', icon: '🌅', isLightPalette: true },
                { id: 'mint', nameFa: '🍃 نسیم نعنایی (روشن)', nameEn: 'Mint Breeze', icon: '🍃', isLightPalette: true },
                { id: 'dark', nameFa: '🌙 آبنوس مات (تاریک)', nameEn: 'Onyx Slate', icon: '🌙', isLightPalette: false }
              ].map(pal => {
                const isSelected = theme === pal.id;
                return (
                  <button
                    key={pal.id}
                    onClick={() => {
                      soundEngine.playTap?.();
                      haptics.tap?.();
                      setTheme(pal.id);
                    }}
                    className={`p-3 rounded-2xl border text-start flex items-center gap-2 transition-all active:scale-95 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/40 font-black shadow-sm'
                        : (isLight 
                            ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300')
                    }`}
                  >
                    <span className="text-xl shrink-0">{pal.icon}</span>
                    <div className="min-w-0 flex-1">
                      <span className={`text-xs block truncate ${isSelected ? (isLight ? 'text-purple-700' : 'text-purple-300') : ''}`}>
                        {isRtl ? pal.nameFa : pal.nameEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Persian Typography Studio */}
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <h3 className={`text-sm font-black mb-3 flex items-center justify-between ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <div className="flex items-center gap-2">
                <span>✍️</span>
                <span>{isRtl ? 'قلم و فونت اختصاصی' : 'Typography & Fonts'}</span>
              </div>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded-lg bg-purple-500/10">
                {FONTS_LIST.find(f => f.id === fontFamily)?.nameFa || 'وزیرمتن'}
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONTS_LIST.slice(0, 6).map(font => {
                const isSelected = (fontFamily === font.id) || (!fontFamily && font.id === 'vazirmatn');
                return (
                  <button
                    key={font.id}
                    onClick={() => {
                      setFontFamily(font.id);
                      soundEngine.playTap?.();
                      haptics.tap?.();
                    }}
                    className={`p-3 rounded-2xl border text-start transition-all active:scale-95 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/40 shadow-sm'
                        : (isLight ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' : 'border-white/10 bg-white/5 hover:bg-white/10')
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? (isLight ? 'text-purple-700' : 'text-purple-300') : ''}`}>
                        {isRtl ? font.nameFa : font.nameEn}
                      </span>
                      {isSelected && <Check size={12} className="text-purple-500" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 truncate">
                      {font.style}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: LANGUAGE & AUDIO                                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'language' && (
        <div className="space-y-4">
          {/* Language Selector Card */}
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <h3 className={`text-sm font-black mb-3 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Globe size={16} className="text-cyan-500" />
              <span>{isRtl ? 'زبان برنامه (Interface Language)' : 'Interface Language'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setLanguage('fa'); soundEngine.playTap?.(); haptics.tap?.(); }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all active:scale-95 ${
                  language === 'fa'
                    ? 'border-cyan-500 bg-cyan-500/15 ring-2 ring-cyan-500/40 shadow-sm'
                    : (isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5')
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base transition-all ${
                  language === 'fa'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : (isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300')
                }`}>
                  فا
                </div>
                <span className="text-xs font-black">فارسی</span>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>راست‌به‌چپ (RTL)</span>
              </button>

              <button
                onClick={() => { setLanguage('en'); soundEngine.playTap?.(); haptics.tap?.(); }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all active:scale-95 ${
                  language === 'en'
                    ? 'border-cyan-500 bg-cyan-500/15 ring-2 ring-cyan-500/40 shadow-sm'
                    : (isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5')
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm tracking-wider transition-all ${
                  language === 'en'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : (isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300')
                }`}>
                  EN
                </div>
                <span className="text-xs font-black">English</span>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Left-to-Right (LTR)</span>
              </button>
            </div>
          </div>

          {/* Sound FX & Haptic Audio */}
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <h3 className={`text-sm font-black mb-3 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Volume2 size={16} className="text-emerald-500" />
              <span>{isRtl ? 'افکت‌های صوتی و لرزش (صدا و ویبره)' : 'Sound FX & Haptics'}</span>
            </h3>

            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 size={20} className="text-emerald-500" /> : <VolumeX size={20} className="text-slate-400" />}
                  <div>
                    <h4 className="text-xs font-bold">{isRtl ? 'افکت‌های صوتی بازی‌ها' : 'Game Sound Effects'}</h4>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl ? 'صدای ریختن تاس، کارت‌ها، ضربه توپ و پیروزی' : 'Dice roll, cards, ball hits & fanfares'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) soundEngine.playCheckmark?.();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    soundEnabled
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : (isLight ? 'bg-slate-200 text-slate-600' : 'bg-white/10 text-slate-400')
                  }`}
                >
                  {soundEnabled ? (isRtl ? 'روشن' : 'On') : (isRtl ? 'خاموش' : 'Muted')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: WALLET, BACKUP & CLOUD                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          {/* Wallet & Referral Card */}
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Coins size={16} className="text-amber-500" />
                <span>{isRtl ? 'کیف‌پول سکه و استارز تلگرام' : 'Coin Wallet & Stars'}</span>
              </h3>

              <button
                onClick={() => { soundEngine.playTap?.(); haptics.tap?.(); setIsShopModalOpen(true); }}
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm transition-all"
              >
                + {isRtl ? 'خرید سکه' : 'Buy Coins'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'}`}>
                <span className={`text-[10px] block ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                  {isRtl ? 'موجودی سکه طلا' : 'Gold Coins Balance'}
                </span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-300 mt-1 block">
                  {coins.toLocaleString(isRtl ? 'fa-IR' : 'en-US')} 🪙
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-purple-50 border-purple-200' : 'bg-purple-950/20 border-purple-500/30'}`}>
                <span className={`text-[10px] block ${isLight ? 'text-purple-800' : 'text-purple-300'}`}>
                  {isRtl ? 'اشتراک رویال VIP' : 'VIP Status'}
                </span>
                <span className="text-sm font-black text-purple-600 dark:text-purple-300 mt-1.5 block">
                  {isVip ? (isRtl ? 'فعال 👑' : 'Active 👑') : (isRtl ? 'معمولی (غیرفعال)' : 'Standard')}
                </span>
              </div>
            </div>

            {/* Referral Copy */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}>
              <div className="min-w-0">
                <span className="text-xs font-bold block">{isRtl ? 'لینک دعوت دوستان (+۱,۰۰۰ سکه)' : 'Referral Link'}</span>
                <span className={`text-[10px] truncate block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  https://t.me/chazha_bot?start=ref_{cloudState.currentUser?.id || 'vip'}
                </span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playTap?.();
                  haptics.tap?.();
                  navigator.clipboard?.writeText(`https://t.me/chazha_bot?start=ref_${cloudState.currentUser?.id || 'vip'}`);
                  setCopiedReferral(true);
                  setTimeout(() => setCopiedReferral(false), 2500);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  copiedReferral
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {copiedReferral ? (isRtl ? 'کپی شد!' : 'Copied!') : (isRtl ? 'کپی لینک' : 'Copy')}
              </button>
            </div>
          </div>

          {/* Cloud Account Sync Card */}
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cloud size={18} className="text-purple-500" />
                <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {isRtl ? 'حساب ابری و همگام‌سازی چنددستگاهی' : 'Cloud Sync & Multi-Device'}
                </h3>
              </div>

              <button
                onClick={() => setIsCloudModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-sm hover:bg-purple-500 transition-all"
              >
                {cloudState.isLoggedIn ? (isRtl ? 'مدیریت حساب' : 'Manage') : (isRtl ? 'ورود / عضویت' : 'Login')}
              </button>
            </div>

            <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {cloudState.isLoggedIn 
                ? (isRtl ? `متصل به حساب: @${cloudState.currentUser?.username || 'کاربر'} (رمزنگاری سرتاسری)` : `Connected: @${cloudState.currentUser?.username}`)
                : (isRtl ? 'امکان ورود ابری برای بازی با یک اکانت در موبایل، کامپیوتر و چند تلگرام' : 'Sync your games and coins across all your devices.')}
            </p>
          </div>

          {/* Backup & Export/Import */}
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <h3 className={`text-sm font-black mb-3 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Download size={16} className="text-purple-500" />
              <span>{isRtl ? 'پشتیبان‌گیری از داده‌ها (Backup / Restore)' : 'Data Backup & Restore'}</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleExportData}
                className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={15} />
                <span>{exportSuccess ? (isRtl ? '✓ ذخیره شد' : '✓ Saved') : (isRtl ? 'دانلود فایل پشتیبان (JSON)' : 'Export Backup')}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                }`}
              >
                <Upload size={15} />
                <span>{isRtl ? 'بازیابی از فایل (Import)' : 'Import Backup'}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.enc,.txt"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>

            {importStatus && (
              <p className="text-xs text-center mt-3 font-semibold text-purple-500">
                {importStatus}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* AVATAR SELECTION MODAL                                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-sm p-5 rounded-3xl border shadow-2xl space-y-4 ${
                isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-900 text-white border-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <span>🖼️</span>
                  <span>{isRtl ? 'انتخاب تصویر و آواتار پروفایل' : 'Choose Profile Avatar'}</span>
                </h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Upload Custom Photo Button */}
              <div>
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Camera size={16} />
                  <span>{isRtl ? '📷 بارگذاری عکس از گالری گوشی' : '📷 Upload Photo from Device'}</span>
                </button>
              </div>

              {/* Preset Avatar Grid */}
              <div>
                <span className={`text-xs font-bold block mb-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {isRtl ? 'یا یکی از آواتارهای اختصاصی گیمری را انتخاب کنید:' : 'Or choose a preset gamer avatar:'}
                </span>

                <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
                  {PRESET_AVATARS.map(avatar => {
                    const isSelected = avatarUrl === avatar.icon;
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => {
                          soundEngine.playTap?.();
                          haptics.tap?.();
                          setAvatarUrl(avatar.icon);
                          setUserProfile({ avatar: avatar.icon });
                          localStorage.setItem('life_os_user_avatar', avatar.icon);
                          setShowAvatarModal(false);
                          setSaveMessage(isRtl ? '✓ آواتار تغییر یافت!' : '✓ Avatar updated!');
                          setTimeout(() => setSaveMessage(''), 2500);
                        }}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all active:scale-90 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-400/50 shadow-md scale-105'
                            : (isLight ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' : 'border-white/10 bg-white/5 hover:bg-white/10')
                        }`}
                      >
                        <span className="text-2xl">{avatar.icon}</span>
                        <span className="text-[9px] font-bold truncate max-w-full">
                          {avatar.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowAvatarModal(false)}
                className={`w-full py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                  isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {isRtl ? 'انصراف و بستن' : 'Cancel'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coin Shop Modal */}
      <CoinShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
      />

      {/* Install Guide Modal */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Cloud Auth Modal */}
      <CloudAuthModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />
    </div>
  );
}
