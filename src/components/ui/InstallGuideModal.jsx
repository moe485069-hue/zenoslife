import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Laptop, Smartphone, Apple, Tv, CheckCircle2, X, Sparkles, ExternalLink, HelpCircle
} from 'lucide-react';
import useAppStore from '../../store/appStore';

export default function InstallGuideModal({ isOpen, onClose }) {
  const { language, deferredPrompt } = useAppStore();
  const isRtl = language === 'fa';

  const [activePlatform, setActivePlatform] = useState('desktop'); // 'desktop' | 'android' | 'ios' | 'tv'
  const [installTriggered, setInstallTriggered] = useState(false);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallTriggered(true);
        useAppStore.setState({ showInstallPrompt: false, deferredPrompt: null });
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  };

  const PLATFORMS = [
    { id: 'desktop', fa: '🖥️ دسکتاپ و لپ‌تاپ', en: '🖥️ Desktop', icon: Laptop },
    { id: 'android', fa: '🤖 اندروید (Android)', en: '🤖 Android', icon: Smartphone },
    { id: 'ios', fa: '🍎 آیفون (iOS Safari)', en: '🍎 iPhone / iPad', icon: Apple },
    { id: 'tv', fa: '📺 تلویزیون اندروید', en: '📺 Android TV', icon: Tv },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        className="glass-card w-full max-w-lg p-6 rounded-3xl border border-[var(--border)] shadow-2xl relative overflow-hidden"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-purple-600 flex items-center justify-center text-white text-lg shadow-md">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">
                {isRtl ? 'راهنمای نصب وب‌اپلیکیشن Life OS' : 'Install Life OS App'}
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {isRtl ? 'نصب مستقل روی دسکتاپ، موبایل و تلویزیون بدون نیاز به استور' : 'Install locally as a standalone offline PWA'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Direct Install Button if supported by browser */}
        {deferredPrompt && (
          <div className="p-4 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 mb-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[var(--accent)] block">
                {isRtl ? '🚀 مرورگر شما از نصب مستقیم پشتیبانی می‌کند!' : '🚀 Direct Install Available!'}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                {isRtl ? 'برای نصب آنی روی سیستم کلیک کنید:' : 'Click to install immediately:'}
              </span>
            </div>
            <button
              onClick={handleDirectInstall}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Download size={14} />
              <span>{isRtl ? 'نصب مستقیم' : 'Install Now'}</span>
            </button>
          </div>
        )}

        {/* Platform Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activePlatform === p.id
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{isRtl ? p.fa : p.en}</span>
            </button>
          ))}
        </div>

        {/* Platform Details */}
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-3 text-xs leading-relaxed text-[var(--text-primary)]">
          {activePlatform === 'desktop' && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-[var(--accent)] flex items-center gap-1.5">
                <Laptop size={16} />
                <span>{isRtl ? 'راهنمای نصب روی ویندوز، مک و لینوکس (Chrome / Edge / Brave):' : 'Desktop Install (Chrome / Edge / Brave):'}</span>
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-[11.5px] text-[var(--text-secondary)]">
                <li>
                  {isRtl
                    ? 'در بالای صفحه، سمت راستِ نوار آدرس مرورگر (URL Bar)، روی آیکون کوچک کامپیوتر یا «نصب» (Install App) کلیک کنید.'
                    : 'Look at the right side of the address bar (URL Bar) and click the Install Computer icon.'}
                </li>
                <li>
                  {isRtl
                    ? 'یا منوی سه‌نقطه (⋮) در گوشه بالای مرورگر را باز کرده و گزینه «نصب Life OS» یا «Install Life OS» را انتخاب کنید.'
                    : 'Or click the browser 3-dot menu (⋮) and choose "Install Life OS".'}
                </li>
                <li>
                  {isRtl
                    ? 'پس از تایید، آیکون برنامه در دسکتاپ، تسک‌بار و منوی استارت ویندوز مانند یک نرم‌افزار نیتیو مستقل قرار می‌گیرد.'
                    : 'The app will appear as a standalone native window on your Desktop, Taskbar and Start Menu.'}
                </li>
              </ol>
            </div>
          )}

          {activePlatform === 'android' && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-[var(--accent)] flex items-center gap-1.5">
                <Smartphone size={16} />
                <span>{isRtl ? 'راهنمای نصب روی گوشی‌های اندروید (Chrome / Samsung Internet):' : 'Android Mobile Install:'}</span>
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-[11.5px] text-[var(--text-secondary)]">
                <li>
                  {isRtl
                    ? 'در مرورگر کروم، منوی سه‌نقطه (⋮) در بالای صفحه را لمس کنید.'
                    : 'Open the 3-dot menu (⋮) in Chrome.'}
                </li>
                <li>
                  {isRtl
                    ? 'گزینه «افزودن به صفحه اصلی» یا «Install app / Add to Home screen» را انتخاب کنید.'
                    : 'Tap "Install app" or "Add to Home screen".'}
                </li>
                <li>
                  {isRtl
                    ? 'آیکون برنامه در میان اپلیکیشن‌های گوشی شما ظاهر شده و کاملاً تمام‌صفحه و آفلاین اجرا می‌شود.'
                    : 'Life OS will install directly to your app drawer and work seamlessly offline.'}
                </li>
              </ol>
            </div>
          )}

          {activePlatform === 'ios' && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-[var(--accent)] flex items-center gap-1.5">
                <Apple size={16} />
                <span>{isRtl ? 'راهنمای نصب روی آیفون و آیپد (Safari):' : 'iPhone & iPad Install (Safari):'}</span>
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-[11.5px] text-[var(--text-secondary)]">
                <li>
                  {isRtl
                    ? 'صفحه را حتماً در مرورگر Safari باز کنید.'
                    : 'Make sure to open this page in Safari browser.'}
                </li>
                <li>
                  {isRtl
                    ? 'روی دکمه Share (آیکون مربع با فلش رو به بالا ⎘ در نوار پایین مرورگر) بزنید.'
                    : 'Tap the Share button (square with arrow up ⎘ at the bottom).'}
                </li>
                <li>
                  {isRtl
                    ? 'کمی به پایین اسکرول کرده و گزینه «Add to Home Screen» (افزودن به صفحه اصلی ➕) را انتخاب کنید.'
                    : 'Scroll down and select "Add to Home Screen ➕".'}
                </li>
              </ol>
            </div>
          )}

          {activePlatform === 'tv' && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-[var(--accent)] flex items-center gap-1.5">
                <Tv size={16} />
                <span>{isRtl ? 'راهنمای اجرا روی تلویزیون‌های هوشمند و Android TV:' : 'Android TV & Smart TV:'}</span>
              </h3>
              <p className="text-[11.5px] text-[var(--text-secondary)]">
                {isRtl
                  ? 'برنامه را در مرورگر تلویزیون (مانند TV Bro، Puffin TV یا Chrome) باز کرده و بوکمارک کنید یا دکمه افزودن به صفحه اصلی لانچر تلویزیون را بزنید.'
                  : 'Open Life OS in your TV browser (e.g. TV Bro or Chrome) and bookmark or add shortcut to TV launcher.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            {isRtl ? 'متوجه شدم، بستن' : 'Got it, Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
