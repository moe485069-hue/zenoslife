import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import { ChevronLeft, Download, Globe, Sparkles, Sun, Moon, RefreshCw } from 'lucide-react';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';
import InstallGuideModal from '../ui/InstallGuideModal';
import CoinShopModal from '../shop/CoinShopModal';
import { useAppMode } from '../../utils/appMode';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, theme, setTheme, deferredPrompt, coins } = useAppStore();
  const isRtl = language === 'fa';
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const appMode = useAppMode();

  const currentPath = location.pathname;
  let isRoot = currentPath === '/' || currentPath === '/welcome';
  if (appMode === 'chazha') isRoot = currentPath === '/games';
  if (appMode === 'whoza') isRoot = currentPath === '/chat' || currentPath === '/chat-rooms';

  let brandTitle = isRtl ? 'زنوسلایف' : 'ZenOsLife';
  let homePath = '/';
  if (appMode === 'chazha') {
    brandTitle = isRtl ? 'چاژا 🎮' : 'CHAZHA 🎮';
    homePath = '/games';
  } else if (appMode === 'whoza') {
    brandTitle = isRtl ? 'حُذا 💬' : 'WHOZA 💬';
    homePath = '/chat';
  }

  const handleForceUpdate = async () => {
    haptics.success?.();
    soundEngine.playLevelUp?.();
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    window.location.replace(window.location.origin + window.location.pathname + '?v=' + Date.now() + window.location.hash);
  };

  // PWA Install State
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  });
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const isInsideTelegram = typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initData);

  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      useAppStore.setState({ showInstallPrompt: false, deferredPrompt: null });
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const handleBack = () => {
    haptics.tap?.();
    soundEngine.playTap?.();
    navigate(-1);
  };

  const handleToggleLanguage = () => {
    haptics.tap?.();
    soundEngine.playTap?.();
    const nextLang = language === 'fa' ? 'en' : 'fa';
    setLanguage(nextLang);
  };

  const handleInstallClick = async () => {
    haptics.tap?.();
    soundEngine.playTap?.();

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          useAppStore.setState({ showInstallPrompt: false, deferredPrompt: null });
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
        setIsInstallModalOpen(true);
      }
    } else {
      // Open step-by-step guide for iOS / Android / Desktop manual install
      setIsInstallModalOpen(true);
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-[var(--border)] transition-all duration-300 shadow-sm backdrop-blur-md"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between h-14">
          
          {/* Left: Back Button + App Title (Clean, Upright, Animated 7 Chakra Wave) */}
          <div className="flex items-center gap-2.5 min-w-0">
            {!isRoot && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-90 transition-transform"
                title={isRtl ? 'بازگشت' : 'Back'}
              >
                {isRtl ? <ChevronLeft size={20} className="rotate-180" /> : <ChevronLeft size={20} />}
              </button>
            )}
            
            <div 
              onClick={() => {
                haptics.tap?.();
                soundEngine.playTap?.();
                navigate(homePath);
              }}
              className="flex items-center gap-1.5 min-w-0 cursor-pointer select-none active:scale-95 transition-all group"
              title={isRtl ? 'بازگشت به صفحه اصلی' : 'Go to Home'}
            >
              <span className="text-lg sm:text-2xl font-black not-italic tracking-normal chakra-wave-text select-none drop-shadow-sm font-['Estedad','Vazirmatn','Lalezar',sans-serif] group-hover:brightness-110 transition-all whitespace-nowrap">
                {brandTitle}
              </span>
            </div>
          </div>

          {/* Right: Actions (Install, Language, Theme) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Install App Button (Only visible if NOT yet installed AND NOT inside Telegram) */}
            {!isInstalled && !isInsideTelegram && (
              <button
                onClick={handleInstallClick}
                className="px-2 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                title={isRtl ? 'نصب وب‌اپلیکیشن' : 'Install App'}
              >
                <Download size={12} />
                <span className="hidden xs:inline">{isRtl ? 'نصب' : 'Install'}</span>
              </button>
            )}

            {/* Coin Shop Quick Button */}
            <button
              onClick={() => {
                haptics.tap?.();
                soundEngine.playTap?.();
                setIsShopModalOpen(true);
              }}
              className="px-2 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              title={isRtl ? 'خرید سکه و ستاره تلگرام' : 'Coin Shop'}
            >
              <span>🪙</span>
              <span className="font-mono text-[11px]">{(coins || 0).toLocaleString()}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={handleToggleLanguage}
              className="px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-teal-400/40 text-[var(--text-primary)] text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
              title={isRtl ? 'تغییر زبان به انگلیسی' : 'Switch Language to Persian'}
            >
              <Globe size={13} className="text-teal-400" />
              <span className="text-[11px] font-mono uppercase">{language === 'fa' ? 'EN' : 'فا'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={() => {
                haptics.tap?.();
                soundEngine.playTap?.();
                setTheme(theme === 'dark' ? 'light' : 'dark');
              }}
              className="p-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] transition-colors text-[var(--text-primary)] active:scale-95"
              title={isRtl ? 'تغییر حالت روشن / تاریک' : 'Toggle Theme'}
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-300" /> : <Moon size={15} className="text-indigo-400" />}
            </button>

            {/* Force Update / Clear Cache Button */}
            <button
              onClick={handleForceUpdate}
              className="p-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors active:scale-95"
              title={isRtl ? 'بروزرسانی فوری به آخرین نسخه و پاک‌سازی کش' : 'Instant Update & Clear Cache'}
            >
              <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

        </div>
      </header>

      {/* Coin Shop Modal */}
      <CoinShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
      />

      {/* Step-by-Step Install Guide Modal if Direct Install Unavailable */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </>
  );
}
