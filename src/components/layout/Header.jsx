import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import { ChevronLeft, Download, Globe, Sparkles, Sun, Moon } from 'lucide-react';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';
import InstallGuideModal from '../ui/InstallGuideModal';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, theme, setTheme, deferredPrompt } = useAppStore();
  const isRtl = language === 'fa';

  const currentPath = location.pathname;
  const isRoot = currentPath === '/' || currentPath === '/welcome';

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
          
          {/* Left: Back Button + App Title (Clean, Upright, Not Italic) */}
          <div className="flex items-center gap-2 min-w-0">
            {!isRoot && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-90 transition-transform"
                title={isRtl ? 'بازگشت' : 'Back'}
              >
                {isRtl ? <ChevronLeft size={20} className="rotate-180" /> : <ChevronLeft size={20} />}
              </button>
            )}
            
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-base sm:text-lg font-black not-italic tracking-normal bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent select-none">
                {isRtl ? 'زنوسلایف' : 'ZenOsLife'}
              </span>
              <span className="text-[10px] text-teal-400/80 font-mono font-bold hidden xs:inline not-italic">
                {isRtl ? 'ZenOsLife' : 'زنوسلایف'}
              </span>
            </div>
          </div>

          {/* Right: Actions (Install, Language, Theme) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Install App Button (Only visible if NOT yet installed) */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all animate-pulse"
                title={isRtl ? 'نصب وب‌اپلیکیشن روی گوشی یا کامپیوتر' : 'Install PWA App'}
              >
                <Download size={13} />
                <span className="text-[11px]">{isRtl ? 'نصب' : 'Install'}</span>
              </button>
            )}

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
          </div>

        </div>
      </header>

      {/* Step-by-Step Install Guide Modal if Direct Install Unavailable */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </>
  );
}
