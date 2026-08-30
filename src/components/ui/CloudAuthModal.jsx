import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, Lock, User, Key, CheckCircle, RefreshCw, LogOut, 
  ShieldCheck, AlertCircle, X, Eye, EyeOff, Sparkles, ArrowRight
} from 'lucide-react';
import cloudAuthSync from '../../services/cloudAuthSync';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function CloudAuthModal({ isOpen, onClose }) {
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const [authState, setAuthState] = useState({
    isLoggedIn: cloudAuthSync.isLoggedIn(),
    currentUser: cloudAuthSync.currentUser,
    syncStatus: cloudAuthSync.syncStatus,
    lastSynced: cloudAuthSync.lastSynced
  });

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const unsub = cloudAuthSync.subscribe(setAuthState);
    return unsub;
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await cloudAuthSync.login(username, password);
      setSuccessMsg(isRtl ? 'ورود موفقیت‌آمیز بود! تمام اطلاعات با موفقیت بازیابی شد.' : 'Logged in successfully! All data synced.');
      soundEngine.playLevelUp?.();
      haptics.success?.();
      setTimeout(() => {
        setIsLoading(false);
        onClose?.();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'خطا در ورود به حساب');
      soundEngine.playAlarm?.();
      haptics.warning?.();
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg(isRtl ? 'رمز عبور با تکرار آن مطابقت ندارد.' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await cloudAuthSync.register(username, password);
      setSuccessMsg(isRtl ? 'حساب ابری شما با موفقیت ساخته شد و اطلاعات ذخیره گردید!' : 'Cloud account created and data encrypted!');
      soundEngine.playLevelUp?.();
      haptics.success?.();
      setTimeout(() => {
        setIsLoading(false);
        onClose?.();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'خطا در ایجاد حساب');
      soundEngine.playAlarm?.();
      haptics.warning?.();
      setIsLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await cloudAuthSync.syncNow();
      setSuccessMsg(isRtl ? 'همگام‌سازی ابری با موفقیت انجام شد!' : 'Cloud sync completed!');
      soundEngine.playCheckmark?.();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'خطا در همگام‌سازی');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    cloudAuthSync.logout();
    soundEngine.playTap?.();
    haptics.tap?.();
    setSuccessMsg(isRtl ? 'با موفقیت از حساب خارج شدید. برنامه در حالت آفلاین محلی ادامه می‌یابد.' : 'Logged out. Life OS is now in local offline mode.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Cloud size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  {isRtl ? 'حساب ابری و همگام‌سازی چنددستگاهی' : 'Cloud Sync & Multi-Device'}
                </h3>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {isRtl ? 'دسترسی به تمام اطلاعات در لپ‌تاپ، تبلت و موبایل' : 'Access your data across all devices'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Banner notification */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* IF LOGGED IN */}
          {authState.isLoggedIn ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm">
                    {authState.currentUser?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[var(--text-primary)]">
                      {authState.currentUser?.username}
                    </h4>
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {isRtl ? 'حساب متصل و همگام' : 'Connected & Synced'}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-[var(--text-secondary)] text-end">
                  <span>{isRtl ? 'آخرین همگام‌سازی:' : 'Last Synced:'}</span>
                  <p className="font-bold text-[var(--text-primary)] mt-0.5">
                    {authState.lastSynced ? new Date(authState.lastSynced).toLocaleTimeString() : (isRtl ? 'همین الان' : 'Just now')}
                  </p>
                </div>
              </div>

              {/* Zero-Knowledge Security Badge */}
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-purple-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {isRtl 
                    ? 'اطلاعات شما با الگوریتم رمزنگاری AES-256 و PBKDF2 قفل شده است. هیچ‌کس جز شما با رمز عبورتان امکان دسترسی به داده‌ها را ندارد.'
                    : 'Your data is encrypted client-side with AES-256 and PBKDF2. Only you with your password can decrypt your vault.'}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleSyncNow}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                  <span>{isRtl ? 'همگام‌سازی دستی' : 'Sync Now'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="py-3 px-4 rounded-2xl bg-[var(--bg-secondary)] hover:bg-rose-500/10 border border-[var(--border)] hover:border-rose-500/30 text-rose-500 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <LogOut size={15} />
                  <span>{isRtl ? 'خروج از حساب' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* IF GUEST (NOT LOGGED IN) */
            <div>
              {/* Optional Reminder */}
              <div className="mb-4 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-amber-500 text-[11px] font-medium">
                <Sparkles size={16} className="shrink-0" />
                <span>
                  {isRtl 
                    ? 'ایجاد حساب کاملاً اختیاری است؛ می‌توانید برنامه را بدون حساب هم استفاده کنید.' 
                    : 'Account creation is completely optional. Life OS works 100% offline too.'}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] mb-4">
                <button
                  onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'login' 
                      ? 'bg-[var(--accent)] text-white shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isRtl ? 'ورود به حساب موجود' : 'Login'}
                </button>
                <button
                  onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'register' 
                      ? 'bg-[var(--accent)] text-white shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isRtl ? 'ساخت حساب ابری جدید' : 'Create Account'}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    {isRtl ? 'نام کاربری (Username)' : 'Username'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isRtl ? 'مثال: amir_hossein' : 'e.g. alex_smith'}
                      className="w-full px-3 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-medium pl-9"
                    />
                    <User size={15} className="absolute left-3 text-[var(--text-secondary)] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    {isRtl ? 'رمز عبور (Password)' : 'Password'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-medium pl-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute left-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {activeTab === 'register' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                      {isRtl ? 'تکرار رمز عبور' : 'Confirm Password'}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-medium pl-9"
                      />
                      <Key size={15} className="absolute left-3 text-[var(--text-secondary)] pointer-events-none" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>
                        {activeTab === 'login'
                          ? (isRtl ? 'ورود و بازیابی اطلاعات در این دستگاه' : 'Login & Sync Device')
                          : (isRtl ? 'ایجاد حساب و شروع همگام‌سازی' : 'Create & Encrypt Vault')}
                      </span>
                      <ArrowRight size={15} className={isRtl ? 'rotate-180' : ''} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
