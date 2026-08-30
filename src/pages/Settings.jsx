import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Sparkles, Volume2, VolumeX, Globe, Download, Upload, Smartphone, Tv, Laptop,
  Award, Shield, Check, CheckCircle, Info, Lock, Unlock, Key, Cloud, Bell, Clock, RefreshCw, Send, AlertTriangle
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

export default function Settings() {
  const { 
    theme, setTheme, language, setLanguage, fontFamily, setFontFamily,
    fontScale, setFontScale, soundEnabled, setSoundEnabled,
    xp, level, streak, badges, getLevelTitle, showInstallPrompt, deferredPrompt,
    aiKey, setAiKey
  } = useAppStore();
  const isRtl = language === 'fa';

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

  useEffect(() => {
    // Check if running as standalone PWA
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsInstalled(mq.matches || window.navigator.standalone === true);

    const handler = (e) => {
      setIsInstalled(e.matches);
    };
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

  const levelTitle = getLevelTitle ? getLevelTitle(level) : (isRtl ? 'جوینده مسیر' : 'Pathfinder');

  // Export Data (Plain JSON or Encrypted)
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

      haptics.success();
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
      
      // Check if it's an encrypted backup
      if (file.name.endsWith('.enc') || (text.includes('"salt"') && text.includes('"iv"'))) {
        setPendingEncryptedFile(text);
        setImportStatus(isRtl ? '🔒 فایل رمزنگاری شده است. لطفاً رمز عبور را وارد کنید.' : '🔒 Encrypted file detected. Please enter password.');
        return;
      }

      // Plain JSON
      await importAllDataJSON(text);
      haptics.levelUp();
      setImportStatus(isRtl ? '✨ اطلاعات با موفقیت بازیابی شد! صفحه را رفرش کنید.' : '✨ Data restored successfully! Please refresh.');
      soundEngine.playLevelUp();
    } catch (err) {
      setImportStatus(isRtl ? '❌ خطا در خواندن فایل پشتیبان' : '❌ Error importing file');
    }
  };

  // Decrypt and import pending file
  const handleDecryptAndImport = async () => {
    if (!pendingEncryptedFile || !decryptPassphrase.trim()) return;
    try {
      const decryptedText = await decryptData(pendingEncryptedFile, decryptPassphrase.trim());
      await importAllDataJSON(decryptedText);
      haptics.levelUp();
      soundEngine.playLevelUp();
      setImportStatus(isRtl ? '✨ فایل رمزگشایی و با موفقیت بازیابی شد!' : '✨ Backup decrypted & restored successfully!');
      setPendingEncryptedFile(null);
      setDecryptPassphrase('');
    } catch (e) {
      setImportStatus(isRtl ? '❌ رمز عبور اشتباه است یا فایل مخدوش شده است.' : '❌ Incorrect password or corrupted file.');
    }
  };

  const handleTestNotification = async () => {
    haptics.tap();
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

  return (
    <div className="page-container flex flex-col gap-6 pb-20">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span>⚙️</span>
          {isRtl ? 'تنظیمات و زیرساخت فنی' : 'Settings & Architecture'}
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {isRtl ? 'شخصی‌سازی، پشتیبان‌گیری ابری و نوتیفیکیشن‌ها' : 'Customization, Cloud Sync & Notifications'}
        </p>
      </div>

      {/* SECTION 1: PROFILE & GAMIFICATION SUMMARY */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-[var(--border)]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
            👑
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {levelTitle}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-extrabold">
                Lvl {level}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {xp} {isRtl ? 'امتیاز تجربه (XP)' : 'XP points'} • 🔥 {streak} {isRtl ? 'روز استمرار متوالی' : 'days streak'}
            </p>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="mt-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Award size={16} className="text-[var(--warning)]" />
            <span>{isRtl ? 'نشان‌های افتخار و دستاوردها' : 'Achievements & Badges'}</span>
            <span className="text-xs text-[var(--text-secondary)]">({badges.length} / {BADGES_LIST.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {BADGES_LIST.map((badge) => {
              const isEarned = badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    isEarned
                      ? 'bg-[var(--bg-secondary)] border-[var(--warning)]/50 shadow-sm'
                      : 'bg-[var(--bg-secondary)]/40 border-[var(--border)] opacity-40 grayscale'
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {isRtl ? badge.nameFa : badge.nameEn}
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-2">
                    {isRtl ? badge.descFa : badge.descEn}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: APPEARANCE & THEMES */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span>🎨</span>
          {isRtl ? 'تم‌های بصری برنامه' : 'Visual Themes'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setTheme('cosmic')}
            className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'cosmic'
                ? 'border-purple-400 bg-purple-950/60 ring-2 ring-purple-500 shadow-xl scale-102'
                : 'border-[var(--border)] bg-[#030014] opacity-75 hover:opacity-100 hover:border-purple-500/40'
            }`}
          >
            <Sparkles size={24} className="text-purple-300 animate-pulse" />
            <span className="text-xs font-black text-white">🌌 {isRtl ? 'کیهانی شاهانه' : 'Cosmic Sovereign'}</span>
            <span className="text-[10px] text-purple-300/80">{isRtl ? 'بنفش عمیق و طلای ۲۴ عیار' : 'Deep Violet & Gold'}</span>
          </button>

          <button
            onClick={() => setTheme('royal')}
            className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'royal'
                ? 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400 shadow-xl scale-102'
                : 'border-[var(--border)] bg-[#08080c] opacity-75 hover:opacity-100 hover:border-amber-500/40'
            }`}
          >
            <span className="text-2xl drop-shadow-md">👑</span>
            <span className="text-xs font-black text-amber-200">👑 {isRtl ? 'طلای سلطنتی' : 'Imperial Gold'}</span>
            <span className="text-[10px] text-amber-300/80">{isRtl ? 'عقیق سیاه و طلای درخشان' : 'Onyx & 24K Gold'}</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-purple-500 bg-white ring-2 ring-purple-500 shadow-xl scale-102'
                : 'border-[var(--border)] bg-slate-50 opacity-75 hover:opacity-100 hover:border-purple-500/40'
            }`}
          >
            <Sun size={24} className="text-amber-500" />
            <span className="text-xs font-black text-slate-900">💎 {isRtl ? 'ابریشم بلورین (روشن)' : 'Luminous Silk (Light)'}</span>
            <span className="text-[10px] text-slate-600">{isRtl ? 'سفید آلاباستر و پاستیلی' : 'Alabaster & Silk'}</span>
          </button>

          <button
            onClick={() => setTheme('dawn')}
            className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dawn'
                ? 'border-rose-500 bg-[#fff8f5] ring-2 ring-rose-500 shadow-xl scale-102'
                : 'border-[var(--border)] bg-[#fff8f5] opacity-75 hover:opacity-100 hover:border-rose-500/40'
            }`}
          >
            <span className="text-2xl">🌅</span>
            <span className="text-xs font-black text-rose-950">🌅 {isRtl ? 'سحرگاه زرین (روشن)' : 'Warm Dawn (Light)'}</span>
            <span className="text-[10px] text-rose-700">{isRtl ? 'رز کوارتز پاستلی و گرم' : 'Rose Quartz & Peach'}</span>
          </button>

          <button
            onClick={() => setTheme('mint')}
            className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'mint'
                ? 'border-emerald-500 bg-[#f0fdf9] ring-2 ring-emerald-500 shadow-xl scale-102'
                : 'border-[var(--border)] bg-[#f0fdf9] opacity-75 hover:opacity-100 hover:border-emerald-500/40'
            }`}
          >
            <span className="text-2xl">🍃</span>
            <span className="text-xs font-black text-emerald-950">🍃 {isRtl ? 'نسیم زمرد (روشن)' : 'Mint Breeze (Light)'}</span>
            <span className="text-[10px] text-emerald-700">{isRtl ? 'یاس سپید و سبز باطراوت' : 'Mint & Fresh Jade'}</span>
          </button>

          <button
            onClick={() => setTheme('nature')}
            className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'nature'
                ? 'border-emerald-400 bg-emerald-950/60 ring-2 ring-emerald-400 shadow-xl scale-102'
                : 'border-[var(--border)] bg-[#05120a] opacity-75 hover:opacity-100 hover:border-emerald-500/40'
            }`}
          >
            <span className="text-2xl">🌲</span>
            <span className="text-xs font-black text-emerald-200">🌲 {isRtl ? 'فردوس زمردین' : 'Emerald Sanctuary'}</span>
            <span className="text-[10px] text-emerald-300/80">{isRtl ? 'سبز یشم و آرامش طبیعت' : 'Zen Jade & Forest'}</span>
          </button>

          <button
            onClick={() => setTheme('space')}
            className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'space'
                ? 'border-sky-400 bg-sky-950/60 ring-2 ring-sky-400 shadow-xl scale-102'
                : 'border-[var(--border)] bg-[#020617] opacity-75 hover:opacity-100 hover:border-sky-500/40'
            }`}
          >
            <span className="text-2xl">🪐</span>
            <span className="text-xs font-black text-sky-200">🪐 {isRtl ? 'اقیانوس کهکشان' : 'Deep Nebula'}</span>
            <span className="text-[10px] text-sky-300/80">{isRtl ? 'سایان الکتریک و لاجوردی' : 'Electric Cyan'}</span>
          </button>

          <button
            onClick={() => setTheme('rose')}
            className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'rose'
                ? 'border-rose-400 bg-rose-950/60 ring-2 ring-rose-400 shadow-xl scale-102'
                : 'border-[var(--border)] bg-[#0d0208] opacity-75 hover:opacity-100 hover:border-rose-500/40'
            }`}
          >
            <span className="text-2xl">🌹</span>
            <span className="text-xs font-black text-rose-200">🌹 {isRtl ? 'یاقوت سرخ شاهانه' : 'Ruby Sovereign'}</span>
            <span className="text-[10px] text-rose-300/80">{isRtl ? 'مخمل شرابی و رز کوارتز' : 'Velvet Merlot'}</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-indigo-400 bg-slate-900 ring-2 ring-indigo-400 shadow-xl scale-102'
                : 'border-[var(--border)] bg-[#090d16] opacity-75 hover:opacity-100 hover:border-indigo-500/40'
            }`}
          >
            <Moon size={24} className="text-indigo-300" />
            <span className="text-xs font-black text-slate-200">🌙 {isRtl ? 'آبنوس مات' : 'Onyx Slate'}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'تاریک ملایم و ضد خستگی' : 'Minimal Charcoal'}</span>
          </button>
        </div>
      </div>
      {/* SECTION 2.5: TYPOGRAPHY & PERSIAN FONTS STUDIO */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>✍️</span>
            {isRtl ? 'انتخاب قلم و فونت اختصاصی' : 'Custom Fonts & Typography'}
          </h3>
          <span className="text-xs text-[var(--accent)] font-bold px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30">
            {FONTS_LIST.find(f => f.id === fontFamily)?.nameFa || 'وزیرمتن'}
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
          {isRtl 
            ? 'فونت مورد علاقه خود را انتخاب کنید؛ تمام بخش‌ها، نوشته‌ها و کارت‌های آموزشی بلافاصله با قلم انتخابی شما بازنویسی می‌شوند.' 
            : 'Select your preferred typography. The entire Life OS interface will immediately adapt to your chosen font.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FONTS_LIST.map((font) => {
            const isSelected = (fontFamily === font.id) || (!fontFamily && font.id === 'vazirmatn');
            return (
              <button
                key={font.id}
                onClick={() => {
                  setFontFamily(font.id);
                  soundEngine.playTap?.();
                  haptics.tap?.();
                }}
                className={`p-4 rounded-2xl border text-start flex flex-col justify-between gap-3 transition-all ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent)]/15 ring-2 ring-[var(--accent)] shadow-lg scale-[1.02]'
                    : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                      {isRtl ? font.nameFa : font.nameEn}
                    </h4>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {font.style}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-xs">
                      <Check size={14} />
                    </div>
                  )}
                </div>

                <div 
                  className={`p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs leading-relaxed ${font.id === 'lalezar' ? 'text-sm font-bold' : ''}`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className={`font-${font.id}`}>{font.sample}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: LANGUAGE & AUDIO PREFERENCES */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span>🌐</span>
          {isRtl ? 'زبان و افکت‌های صوتی' : 'Language & Sound'}
        </h3>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <Globe size={18} className="text-[var(--accent)]" />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {isRtl ? 'زبان برنامه (فارسی / English)' : 'Interface Language'}
              </span>
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              <button
                onClick={() => setLanguage('fa')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'fa' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)]'
                }`}
              >
                فارسی (RTL)
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'en' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)]'
                }`}
              >
                English (LTR)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? <Volume2 size={18} className="text-[var(--accent)]" /> : <VolumeX size={18} className="text-[var(--text-secondary)]" />}
              <div>
                <span className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>
                  {isRtl ? 'افکت‌های صوتی و زنگ تبتی' : 'Sound Effects & Bowl Chimes'}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {isRtl ? 'پخش صدای تیک زدن، ارتقای لول و زنگ مراقبه' : 'Audio cues for checks, level up & bowls'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundEngine.playCheckmark();
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                soundEnabled ? 'bg-[var(--accent)] text-white shadow-sm' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {soundEnabled ? (isRtl ? 'فعال' : 'On') : (isRtl ? 'بی‌صدا' : 'Muted')}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: AI MENTOR CONFIGURATION */}
      <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-transparent">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-purple-400">
          <span>🧠</span>
          {isRtl ? 'اتصال مربی هوشمند (AI Stoic Mentor)' : 'AI Mentor Configuration'}
        </h3>
        
        <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
          {isRtl 
            ? 'برای اینکه دستیار هوشمند بتواند به صورت اختصاصی با شما گفتگو کند، می‌توانید کلید API خود (مثلاً Gemini) را وارد کنید. کلید شما منحصراً در مرورگر شما (رمزنگاری‌شده) ذخیره می‌شود.'
            : 'Enter your AI API Key (e.g. Gemini) to enable the personalized Stoic Mentor. Your key is stored securely in your browser and never shared.'}
        </p>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key size={14} className="text-purple-400" />
            </div>
            <input
              type="password"
              value={aiKey || ''}
              onChange={(e) => setAiKey(e.target.value)}
              placeholder={isRtl ? 'مثلاً: AIzaSyD...' : 'e.g. AIzaSyD...'}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-[var(--text-primary)] outline-none focus:border-purple-400 font-mono"
            />
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 text-xs font-bold transition-all whitespace-nowrap"
          >
            {isRtl ? 'دریافت کلید' : 'Get Key'}
          </a>
        </div>
      </div>

      {/* SECTION 4: LOCAL PUSH & SERVICE WORKER NOTIFICATIONS */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Bell size={18} className="text-cyan-500" />
            <span>{isRtl ? 'نوتیفیکیشن‌های آفلاین و مستقل' : 'Offline Scheduled Notifications'}</span>
          </h3>

          <button
            onClick={handleTestNotification}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/25 transition-colors"
          >
            <Send size={12} />
            <span>{testNotifSent ? (isRtl ? '✓ ارسال شد' : '✓ Sent') : (isRtl ? 'تست نوتیفیکیشن' : 'Test Alert')}</span>
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
          {isRtl
            ? 'سرویس‌ورکر اختصاصی اپلیکیشن حتی در حالت بسته بودن برنامه، یادآوری‌های تندرستی و خواب را در ساعت مقرر ارسال می‌کند.'
            : 'Background Service Worker dispatches offline reminders for hydration, mindfulness and sleep even when app is closed.'}
        </p>

        {permission !== 'granted' && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
              <span className="text-xs text-amber-300 font-medium">
                {isRtl ? 'مجوز اعلان‌ها هنوز صادر نشده است.' : 'Notifications permission not granted yet.'}
              </span>
            </div>
            <button
              onClick={requestPermission}
              className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:opacity-90"
            >
              {isRtl ? 'فعال‌سازی' : 'Enable'}
            </button>
          </div>
        )}

        {/* Reminders List */}
        <div className="space-y-2.5">
          {reminders.map(r => (
            <div
              key={r.id}
              className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  {isRtl ? r.titleFa : r.titleEn}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block">
                  {isRtl ? r.bodyFa : r.bodyEn}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={r.time}
                  onChange={(e) => updateReminderTime(r.id, e.target.value)}
                  className="px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-mono outline-none"
                />

                <button
                  onClick={() => toggleReminder(r.id)}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                    r.enabled ? 'bg-[var(--accent)]' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${r.enabled ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4.8: ZERO-KNOWLEDGE CLOUD ACCOUNT & MULTI-DEVICE SYNC */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cloudState.isLoggedIn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'}`}>
              <Cloud size={24} className={cloudState.isLoggedIn ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  {isRtl ? 'حساب ابری و همگام‌سازی چنددستگاهی' : 'Cloud Sync & Multi-Device Vault'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold border border-purple-500/30">
                  {isRtl ? 'اختیاری' : 'Optional'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {cloudState.isLoggedIn 
                  ? (isRtl ? `متصل به حساب: @${cloudState.currentUser?.username} (رمزنگاری سرتاسری AES-256)` : `Active Account: @${cloudState.currentUser?.username}`)
                  : (isRtl ? 'با ثبت نام کاربری و رمز، در هر دستگاهی به تمام اطلاعات و تسک‌هایتان دسترسی پیدا کنید.' : 'Access your data on any device with your username and password.')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCloudModalOpen(true)}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
              cloudState.isLoggedIn 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
            }`}
          >
            <Cloud size={16} />
            <span>{cloudState.isLoggedIn ? (isRtl ? 'مدیریت و همگام‌سازی' : 'Manage Account') : (isRtl ? 'ورود یا ساخت حساب ابری' : 'Login / Register')}</span>
          </button>
        </div>

        {cloudState.isLoggedIn ? (
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[var(--text-secondary)]">{isRtl ? 'وضعیت:' : 'Status:'}</span>
              <span className="font-bold text-emerald-500">{isRtl ? 'همگام‌سازی خودکار فعال' : 'Auto-Sync Active'}</span>
            </div>
            <div className="text-[var(--text-secondary)]">
              <span>{isRtl ? 'آخرین همگام‌سازی:' : 'Last Synced:'}</span>{' '}
              <span className="font-bold text-[var(--text-primary)]">
                {cloudState.lastSynced ? new Date(cloudState.lastSynced).toLocaleString('fa-IR') : (isRtl ? 'همین الان' : 'Just now')}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2">
            <Info size={16} className="shrink-0" />
            <span>{isRtl ? 'در حال حاضر برنامه در حالت مهمان (آفلاین محلی) در حال اجراست و نیازی به ورود اجباری ندارید.' : 'Currently running in local offline mode.'}</span>
          </div>
        )}
      </div>

      {/* SECTION 5: CLOUD BACKUP, ENCRYPTION & GOOGLE DRIVE SYNC */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Cloud size={18} className="text-[var(--accent)]" />
            <span>{isRtl ? 'پشتیبان‌گیری ابری و رمزنگاری‌شده' : 'Encrypted Cloud Backup & Sync'}</span>
          </h3>

          <button
            onClick={() => setShowDriveGuide(!showDriveGuide)}
            className="text-xs text-[var(--accent)] hover:underline font-bold flex items-center gap-1"
          >
            <span>{isRtl ? 'همگام‌سازی با گوگل درایو' : 'Google Drive Sync'}</span>
          </button>
        </div>

        {/* Google Drive Guide Card */}
        <AnimatePresence>
          {showDriveGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 overflow-hidden"
            >
              <h4 className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                <Shield size={14} />
                {isRtl ? 'راهنمای همگام‌سازی بین گوشی و لپ‌تاپ (بدون واسطه سرور)' : 'Cross-Device Zero-Knowledge Cloud Sync'}
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {isRtl
                  ? '۱. از دکمه زیر فایل پشتیبان رمزگذاری شده با رمز شخصی خود بگیرید.\n۲. فایل را در پوشه Google Drive ذخیره کنید.\n۳. در دستگاه دیگر (لپ‌تاپ/گوشی) وارد بخش تنظیمات شده و فایل را بازیابی کنید.'
                  : '1. Export encrypted backup with your private passphrase.\n2. Save the file to your personal Google Drive / iCloud folder.\n3. Open Life OS on your laptop or second phone and import with password.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Encryption Passphrase Toggle */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-purple-400" />
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {isRtl ? 'رمزنگاری پیشرفته (AES-GCM 256-bit)' : 'Zero-Knowledge AES-256 Encryption'}
              </span>
            </div>
            <button
              onClick={() => setUseEncryption(!useEncryption)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                useEncryption ? 'bg-purple-600 text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {useEncryption ? (isRtl ? 'فعال' : 'Active') : (isRtl ? 'غیرفعال' : 'Off')}
            </button>
          </div>

          {useEncryption && (
            <input
              type="password"
              placeholder={isRtl ? 'گذرواژه اختصاصی برای رمزنگاری فایل پشتیبان...' : 'Enter encryption password for backup...'}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-purple-500 font-mono mt-2"
              dir="ltr"
            />
          )}
        </div>

        {/* Export / Import Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-purple-600 text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>{exportSuccess ? (isRtl ? '✓ دانلود شد!' : '✓ Downloaded!') : (useEncryption ? (isRtl ? 'دانلود نسخه رمزنگاری‌شده (.enc)' : 'Export Encrypted (.enc)') : (isRtl ? 'دانلود فایل پشتیبان (JSON)' : 'Export JSON Backup'))}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.enc,.txt"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold hover:border-[var(--accent)] text-[var(--text-primary)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Upload size={16} className="text-[var(--success)]" />
            <span>{isRtl ? 'بازیابی از فایل (Import)' : 'Import Backup'}</span>
          </button>
        </div>

        {/* Decrypt Prompt if file was encrypted */}
        {pendingEncryptedFile && (
          <div className="mt-4 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
            <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Key size={14} />
              {isRtl ? 'رمزگشایی فایل پشتیبان' : 'Decrypt Backup File'}
            </h4>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder={isRtl ? 'رمز عبور فایل را وارد کنید...' : 'Enter password...'}
                value={decryptPassphrase}
                onChange={(e) => setDecryptPassphrase(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-purple-500 font-mono"
                dir="ltr"
              />
              <button
                onClick={handleDecryptAndImport}
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90"
              >
                {isRtl ? 'رمزگشایی و بازیابی' : 'Decrypt'}
              </button>
            </div>
          </div>
        )}

        {importStatus && (
          <p className="text-xs text-center mt-3 font-semibold text-[var(--accent)]">
            {importStatus}
          </p>
        )}
      </div>

      {/* SECTION 6: PWA INSTALLATION & MULTI-DEVICE SUPPORT */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span>📲</span>
          {isRtl ? 'وضعیت نصب و پشتیبانی چنددستگاهی (PWA)' : 'PWA App Installation'}
        </h3>
        
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--success)] text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--success)]">
                {isRtl ? 'اپلیکیشن به عنوان برنامه مستقل نصب شده است' : 'Life OS is installed as a Standalone App'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {isRtl ? 'تمام امکانات به صورت کاملاً آفلاین و پرسرعت فعال است.' : 'All features work 100% offline at native speed.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              {isRtl
                ? 'این وب‌اپلیکیشن به صورت PWA استاندارد طراحی شده و بدون نیاز به دانلود از استورها، مستقیماً روی اندروید، آیفون (iOS)، دسکتاپ و تلویزیون هوشمند نصب و کاملاً آفلاین کار می‌کند.'
                : 'Life OS is a full Progressive Web App that works 100% offline and installs natively on Android, iOS, Desktop & Android TV.'}
            </p>

            <button
              onClick={handleInstallApp}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-indigo-600 text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 mb-4"
            >
              <Download size={18} />
              <span>{isRtl ? 'نصب مستقیم اپلیکیشن روی دستگاه' : 'Install Life OS App'}</span>
            </button>
          </>
        )}

        {/* Device Guide Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center gap-2.5">
            <Smartphone size={18} className="text-[#10b981]" />
            <div className="text-[11px]">
              <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Android & iOS</span>
              <span className="text-[9px] text-[var(--text-secondary)]">
                {isRtl ? 'افزودن به صفحه اصلی' : 'Add to Home Screen'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center gap-2.5">
            <Laptop size={18} className="text-[#6366f1]" />
            <div className="text-[11px]">
              <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Windows & Mac</span>
              <span className="text-[9px] text-[var(--text-secondary)]">
                {isRtl ? 'نصب مستقل با کروم/اج' : 'Desktop Standalone'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center gap-2.5">
            <Tv size={18} className="text-[#eab308]" />
            <div className="text-[11px]">
              <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Android TV</span>
              <span className="text-[9px] text-[var(--text-secondary)]">
                {isRtl ? 'پشتیبانی از ریموت کنترل' : 'Remote D-Pad Ready'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="text-center text-[10px] text-[var(--text-secondary)] py-2">
        Life OS v2.0 • سیستم عامل جامع مدیریت زندگی • ساخته‌شده با عشق و تفکر عمیق 💜
      </div>

      {/* Install Guide Modal */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Cloud Auth & Multi-Device Sync Modal */}
      <CloudAuthModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />
    </div>
  );
}
